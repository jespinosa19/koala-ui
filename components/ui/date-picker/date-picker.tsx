"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CaretLeft, CaretRight, CalendarBlank, X } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useControlSize, useDensity, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

/**
 * DatePicker: a calendar surface plus two ready pickers (single date + date range),
 * built over Radix Popover (focus, dismiss, positioning) with a hand-rolled calendar
 * grid (no date dependency: native `Date` math + `Intl` for locale-aware labels).
 *
 * Three exports compose the surface:
 *   • `Calendar`: the standalone month grid (single | range, keyboard nav,
 *     day/month/year views). Controlled or uncontrolled.
 *   • `DatePicker`: a trigger + Calendar in a Popover for one date.
 *   • `DateRangePicker`: the same for a {from,to} range, with a presets rail.
 *
 * The selected day reads the brand accent; the in-range fill is the neutral `accent`
 * surface so the two never compete. Tokens only, see docs/ARCHITECTURE.md.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

export interface DatePreset {
  label: string
  value: Date
}

export interface DateRangePreset {
  label: string
  value: DateRange
}

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

// ─── Date utilities (pure, no external lib) ──────────────────────────────────────

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const isSameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const startOfWeek = (d: Date, weekStartsOn: WeekStart) => {
  const x = startOfDay(d)
  const diff = (x.getDay() - weekStartsOn + 7) % 7
  return addDays(x, -diff)
}
/** A stable yyyy-mm-dd key for ref maps and equality. */
const isoKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
/** Order two dates ascending into a range. */
const orderRange = (a: Date, b: Date): DateRange => (a <= b ? { from: a, to: b } : { from: b, to: a })

/** The 42-day (6-week) window covering `month`, padded with leading/trailing days. */
function getMonthMatrix(month: Date, weekStartsOn: WeekStart): Date[] {
  const start = startOfWeek(startOfMonth(month), weekStartsOn)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Localized short weekday headers, rotated to the configured first day. */
function getWeekdayLabels(weekStartsOn: WeekStart, locale?: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" })
  // 2023-01-01 is a Sunday, a reliable anchor for getDay()===0.
  const sunday = new Date(2023, 0, 1)
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(sunday, (weekStartsOn + i) % 7)))
}

// ─── Presets (ship rich, ready-to-use sets) ──────────────────────────────────────

/** Common single-date shortcuts, relative to `now`. */
export function getDatePresets(now: Date = new Date()): DatePreset[] {
  const today = startOfDay(now)
  return [
    { label: "Today", value: today },
    { label: "Yesterday", value: addDays(today, -1) },
    { label: "Tomorrow", value: addDays(today, 1) },
    { label: "In a week", value: addDays(today, 7) },
    { label: "In two weeks", value: addDays(today, 14) },
    { label: "In a month", value: addMonths(today, 1) },
  ]
}

/** Common date-range shortcuts, relative to `now`. */
export function getDateRangePresets(now: Date = new Date(), weekStartsOn: WeekStart = 1): DateRangePreset[] {
  const today = startOfDay(now)
  const thisWeekStart = startOfWeek(today, weekStartsOn)
  const lastMonthRef = addMonths(today, -1)
  return [
    { label: "Today", value: { from: today, to: today } },
    { label: "Yesterday", value: { from: addDays(today, -1), to: addDays(today, -1) } },
    { label: "Last 7 days", value: { from: addDays(today, -6), to: today } },
    { label: "Last 14 days", value: { from: addDays(today, -13), to: today } },
    { label: "Last 30 days", value: { from: addDays(today, -29), to: today } },
    { label: "This week", value: { from: thisWeekStart, to: today } },
    { label: "Last week", value: { from: addDays(thisWeekStart, -7), to: addDays(thisWeekStart, -1) } },
    { label: "This month", value: { from: startOfMonth(today), to: today } },
    { label: "Last month", value: { from: startOfMonth(lastMonthRef), to: endOfMonth(lastMonthRef) } },
    { label: "This year", value: { from: new Date(today.getFullYear(), 0, 1), to: today } },
    { label: "Last year", value: { from: new Date(today.getFullYear() - 1, 0, 1), to: new Date(today.getFullYear() - 1, 11, 31) } },
  ]
}

// ─── Controllable state ───────────────────────────────────────────────────────────

/**
 * Controlled-or-uncontrolled value. Controlled-ness is captured once on mount (so
 * clearing a controlled value to `undefined` stays controlled, the Radix pattern).
 */
function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined
  defaultValue: T
  onChange?: (next: T) => void
}) {
  const [isControlled] = React.useState(value !== undefined)
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const resolved = isControlled ? (value as T) : internal
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [resolved, set] as const
}

// ─── Recipe ───────────────────────────────────────────────────────────────────────

export const calendarVariants = tv({
  slots: {
    root: "select-none text-foreground",
    months: "flex gap-4",
    month: "space-y-2",
    header: "relative flex items-center justify-center pt-0.5",
    nav: [
      "inline-flex items-center justify-center rounded-md text-muted-foreground cursor-pointer",
      "transition-[background-color,color,scale] duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-40",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    // The caption toggles day → month → year views; styled as a quiet button.
    caption: [
      "inline-flex items-center justify-center rounded-md px-2 font-medium text-sm cursor-pointer",
      "transition-[background-color,color,scale] duration-fast ease-out hover:bg-accent hover:text-foreground active:scale-[0.98]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "tabular-nums",
    ],
    captionStatic: "font-medium text-sm text-foreground tabular-nums",
    weekRow: "grid grid-cols-7",
    weekday: "flex items-center justify-center text-xs font-normal text-muted-foreground",
    grid: "grid grid-cols-7",
    // The cell carries the range fill; the inner button carries the day + selection.
    cell: "relative flex items-center justify-center p-0",
    day: [
      "relative inline-flex items-center justify-center rounded-md font-normal text-sm tabular-nums cursor-pointer",
      "transition-[background-color,color,scale] duration-fast ease-out",
      "hover:bg-accent active:scale-[0.96]",
      "outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      // Today: brand-tinted label + an underdot, until it becomes selected.
      "data-[today]:font-semibold data-[today]:text-brand",
      "data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-brand",
      // Days from the neighbouring month read faded.
      "data-[outside]:text-muted-foreground/40 data-[outside]:data-[today]:text-muted-foreground/40 data-[outside]:after:hidden",
      // Disabled: inert + struck-through-faint.
      "data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground/30 data-[disabled]:line-through data-[disabled]:after:hidden",
      // Selected day / range endpoint: solid brand chip (wins over today + hover).
      "data-[selected]:bg-brand data-[selected]:text-white data-[selected]:font-medium data-[selected]:hover:bg-brand",
      // Today-and-selected: the solid chip already conveys "today", so drop the
      // underdot and force the label white. The compound selector outranks
      // data-[today]:text-brand regardless of Tailwind's class ordering.
      "data-[selected]:after:hidden data-[selected]:data-[today]:text-white",
    ],
    // Months / years grid (the alternate caption views).
    gridCells: "grid grid-cols-3 gap-2 pt-2",
    cellButton: [
      "inline-flex items-center justify-center rounded-md text-sm tabular-nums cursor-pointer",
      "transition-[background-color,color,scale] duration-fast ease-out",
      "hover:bg-accent active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "data-[selected]:bg-brand data-[selected]:text-white data-[selected]:font-medium data-[selected]:hover:bg-brand",
      "data-[current]:font-semibold data-[current]:text-brand data-[current]:data-[selected]:text-white",
    ],
  },
  variants: {
    density: {
      comfortable: {
        nav: "size-8",
        caption: "h-8",
        weekday: "h-9 w-9",
        cell: "h-9 w-9",
        day: "size-9",
        cellButton: "h-10",
      },
      compact: {
        nav: "size-7",
        caption: "h-7",
        weekday: "h-8 w-8",
        cell: "h-8 w-8",
        day: "size-8",
        cellButton: "h-9",
      },
    },
  },
  defaultVariants: { density: "comfortable" },
})

export const datePickerTriggerVariants = tv({
  base: [
    "group inline-flex items-center gap-2 rounded-md border border-input text-left text-foreground",
    "bg-[var(--surface,var(--background))] shadow-xs cursor-pointer min-w-40",
    "transition-[border-color,box-shadow,scale] duration-fast ease-out",
    "hover:border-ring/50",
    "outline-none focus-visible:border-brand focus-visible:brand-ring",
    "data-[state=open]:border-brand data-[state=open]:brand-ring",
    "active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
    "data-[placeholder]:text-muted-foreground",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:destructive-ring",
  ],
  variants: {
    size: {
      sm: "h-8 px-2.5 text-sm [&_svg]:size-4",
      md: "h-9 px-3 text-sm [&_svg]:size-4",
      lg: "h-10 px-3.5 text-base [&_svg]:size-[18px]",
    },
    block: { true: "flex w-full", false: "" },
    clearable: { true: "pr-9", false: "" },
  },
  defaultVariants: { size: "md", block: false, clearable: false },
})

// ─── Calendar ───────────────────────────────────────────────────────────────────

interface CalendarBaseProps {
  /** Controlled display month. */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** Earliest selectable day (inclusive). */
  min?: Date
  /** Latest selectable day (inclusive). */
  max?: Date
  /** Predicate for arbitrary disabled days (e.g. weekends). */
  isDateDisabled?: (date: Date) => boolean
  /** First column of the week. @default 1 (Monday) */
  weekStartsOn?: WeekStart
  /** BCP-47 locale for month/weekday labels. Defaults to the runtime locale. */
  locale?: string
  /** Number of month grids shown side by side. @default 1 */
  numberOfMonths?: number
  className?: string
  density?: Density
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single"
  selected?: Date
  defaultSelected?: Date
  onSelect?: (date: Date | undefined) => void
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range"
  selected?: DateRange
  defaultSelected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps

export function Calendar(props: CalendarProps) {
  const {
    mode = "single",
    month: monthProp,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateDisabled,
    weekStartsOn = 1,
    locale,
    numberOfMonths = 1,
    className,
    density,
  } = props as CalendarBaseProps & { mode?: "single" | "range" }

  const d = useDensity(density)
  const slots = calendarVariants({ density: d })
  const today = React.useMemo(() => startOfDay(new Date()), [])

  // Selection: single date or {from,to} range, controlled or uncontrolled.
  const [selection, setSelection] = useControllableState<Date | DateRange | undefined>({
    value: props.selected as Date | DateRange | undefined,
    defaultValue: (props as CalendarSingleProps).defaultSelected ?? (props as CalendarRangeProps).defaultSelected,
    onChange: props.onSelect as ((v: Date | DateRange | undefined) => void) | undefined,
  })

  const single = mode === "single" ? (selection as Date | undefined) : undefined
  const range = mode === "range" ? (selection as DateRange | undefined) : undefined

  // Display month: seeded from the current selection so the picker opens in context.
  const seedMonth =
    defaultMonth ?? single ?? range?.from ?? today
  const [month, setMonth] = useControllableState<Date>({
    value: monthProp,
    defaultValue: startOfMonth(seedMonth),
    onChange: onMonthChange,
  })

  // View state: day grid by default; the caption cycles to month / year pickers
  // (only when a single month is shown, to keep the navigation legible).
  const canSwitchView = numberOfMonths === 1
  const [view, setView] = React.useState<"days" | "months" | "years">("days")

  // Roving focus across the grid.
  const [focusedDate, setFocusedDate] = React.useState<Date | null>(null)
  const dayRefs = React.useRef(new Map<string, HTMLButtonElement>())

  // Range hover preview while picking the second endpoint.
  const [hovered, setHovered] = React.useState<Date | null>(null)

  const isDisabled = React.useCallback(
    (day: Date) => {
      if (min && startOfDay(day) < startOfDay(min)) return true
      if (max && startOfDay(day) > startOfDay(max)) return true
      return isDateDisabled?.(day) ?? false
    },
    [min, max, isDateDisabled],
  )

  const displayedMonths = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i))
  const firstDisplayed = startOfMonth(displayedMonths[0])
  const lastDisplayed = endOfMonth(displayedMonths[displayedMonths.length - 1])

  // The single tab stop in the grid (roving tabindex). Falls back to selection, then today, then 1st.
  const tabbable = React.useMemo(() => {
    const anchor = focusedDate ?? single ?? range?.from ?? today
    if (anchor >= firstDisplayed && anchor <= lastDisplayed) return anchor
    return firstDisplayed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedDate, single, range?.from, month, numberOfMonths])

  // Move focus to the day the keyboard navigated to (after a possible month change).
  React.useEffect(() => {
    if (!focusedDate) return
    dayRefs.current.get(isoKey(focusedDate))?.focus()
  }, [focusedDate, month])

  function commitSelection(day: Date) {
    if (mode === "single") {
      ;(setSelection as (v: Date | undefined) => void)(day)
    } else {
      const next: DateRange =
        !range?.from || (range.from && range.to)
          ? { from: day, to: undefined } // start a fresh range
          : orderRange(range.from, day) // close it
      ;(setSelection as (v: DateRange | undefined) => void)(next)
    }
  }

  function handleDayClick(day: Date) {
    if (isDisabled(day)) return
    setFocusedDate(day)
    if (!isSameMonth(day, month) && numberOfMonths === 1) setMonth(startOfMonth(day))
    commitSelection(day)
  }

  function handleDayKeyDown(e: React.KeyboardEvent, day: Date) {
    let next: Date | null = null
    switch (e.key) {
      case "ArrowLeft": next = addDays(day, -1); break
      case "ArrowRight": next = addDays(day, 1); break
      case "ArrowUp": next = addDays(day, -7); break
      case "ArrowDown": next = addDays(day, 7); break
      case "Home": next = startOfWeek(day, weekStartsOn); break
      case "End": next = addDays(startOfWeek(day, weekStartsOn), 6); break
      // PageUp/Down move a month while preserving the day-of-month (JS overflow clamps).
      case "PageUp": next = new Date(day.getFullYear(), day.getMonth() - 1, day.getDate()); break
      case "PageDown": next = new Date(day.getFullYear(), day.getMonth() + 1, day.getDate()); break
      case "Enter":
      case " ":
        e.preventDefault()
        handleDayClick(day)
        return
      default:
        return
    }
    if (!next) return
    e.preventDefault()
    setFocusedDate(next)
    if (next < firstDisplayed) setMonth(addMonths(month, -1))
    else if (next > lastDisplayed) setMonth(addMonths(month, 1))
  }

  // Header navigation: step depends on the active view.
  function shiftView(dir: 1 | -1) {
    if (view === "days") setMonth(addMonths(month, dir))
    else if (view === "months") setMonth(new Date(month.getFullYear() + dir, month.getMonth(), 1))
    else setMonth(new Date(month.getFullYear() + dir * 12, month.getMonth(), 1))
  }

  const weekdays = getWeekdayLabels(weekStartsOn, locale)

  // ── Month / year views ──────────────────────────────────────────────────────
  if (canSwitchView && view !== "days") {
    const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" })
    const decadeStart = month.getFullYear() - (month.getFullYear() % 12)
    const captionLabel =
      view === "months" ? String(month.getFullYear()) : `${decadeStart} – ${decadeStart + 11}`

    return (
      <div className={slots.root({ className })} data-slot="calendar">
        <div className={slots.header()}>
          <button
            type="button"
            aria-label="Previous"
            className={cn(slots.nav(), "absolute left-1")}
            onClick={() => shiftView(-1)}
          >
            <CaretLeft weight="bold" />
          </button>
          <button
            type="button"
            className={slots.caption()}
            onClick={() => setView(view === "months" ? "years" : "months")}
          >
            {captionLabel}
          </button>
          <button
            type="button"
            aria-label="Next"
            className={cn(slots.nav(), "absolute right-1")}
            onClick={() => shiftView(1)}
          >
            <CaretRight weight="bold" />
          </button>
        </div>

        <div className={slots.gridCells()}>
          {view === "months"
            ? Array.from({ length: 12 }, (_, m) => {
                const isCurrent = today.getFullYear() === month.getFullYear() && today.getMonth() === m
                const isSelected = month.getMonth() === m
                return (
                  <button
                    key={m}
                    type="button"
                    data-current={isCurrent || undefined}
                    data-selected={isSelected || undefined}
                    className={slots.cellButton()}
                    onClick={() => {
                      setMonth(new Date(month.getFullYear(), m, 1))
                      setView("days")
                    }}
                  >
                    {monthFmt.format(new Date(2023, m, 1))}
                  </button>
                )
              })
            : Array.from({ length: 12 }, (_, i) => {
                const y = decadeStart + i
                const isCurrent = today.getFullYear() === y
                const isSelected = month.getFullYear() === y
                return (
                  <button
                    key={y}
                    type="button"
                    data-current={isCurrent || undefined}
                    data-selected={isSelected || undefined}
                    className={slots.cellButton()}
                    onClick={() => {
                      setMonth(new Date(y, month.getMonth(), 1))
                      setView("months")
                    }}
                  >
                    {y}
                  </button>
                )
              })}
        </div>
      </div>
    )
  }

  // ── Day view ──────────────────────────────────────────────────────────────────
  function renderMonth(monthDate: Date, index: number) {
    const matrix = getMonthMatrix(monthDate, weekStartsOn)
    const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthDate)
    const showPrev = index === 0
    const showNext = index === numberOfMonths - 1

    // Effective range for fill + endpoints, factoring the live hover preview.
    let rFrom = range?.from
    let rTo = range?.to
    if (mode === "range" && rFrom && !rTo && hovered) {
      const preview = orderRange(rFrom, hovered)
      rFrom = preview.from
      rTo = preview.to
    }

    return (
      <div className={slots.month()} key={index}>
        <div className={slots.header()}>
          {showPrev && (
            <button
              type="button"
              aria-label="Previous month"
              className={cn(slots.nav(), "absolute left-1")}
              onClick={() => shiftView(-1)}
            >
              <CaretLeft weight="bold" />
            </button>
          )}
          {canSwitchView ? (
            <button type="button" className={slots.caption()} onClick={() => setView("months")}>
              {monthLabel}
            </button>
          ) : (
            <span className={slots.captionStatic()}>{monthLabel}</span>
          )}
          {showNext && (
            <button
              type="button"
              aria-label="Next month"
              className={cn(slots.nav(), "absolute right-1")}
              onClick={() => shiftView(1)}
            >
              <CaretRight weight="bold" />
            </button>
          )}
        </div>

        <div className={slots.weekRow()} aria-hidden>
          {weekdays.map((w, i) => (
            <span key={i} className={slots.weekday()}>
              {w}
            </span>
          ))}
        </div>

        <div className={slots.grid()} role="grid">
          {Array.from({ length: Math.ceil(matrix.length / 7) }, (_, week) => (
            // role="row" with display:contents keeps the single 7-col grid layout while giving
            // role="grid" the row > gridcell structure that assistive tech requires.
            <div role="row" className="contents" key={week}>
              {matrix.slice(week * 7, week * 7 + 7).map((day, col) => {
                const outside = !isSameMonth(day, monthDate)
                const disabled = isDisabled(day)
                const isToday = isSameDay(day, today)

                // Selection flags.
                const isStart = mode === "range" && isSameDay(day, rFrom)
                const isEnd = mode === "range" && isSameDay(day, rTo)
                const inRange = mode === "range" && !!rFrom && !!rTo && day >= rFrom && day <= rTo
                const selected =
                  mode === "single" ? isSameDay(day, single) : isStart || isEnd

                // Range fill lives on the cell; compute its rounding so the bar reads as one
                // continuous shape with rounded outer ends (and rounded row edges).
                let cellRange = ""
                if (inRange) {
                  const roundLeft = isStart || col === 0
                  const roundRight = isEnd || col === 6
                  const rounding =
                    roundLeft && roundRight ? "rounded-md" : roundLeft ? "rounded-l-md" : roundRight ? "rounded-r-md" : "rounded-none"
                  cellRange = cn("bg-accent", rounding)
                }

                return (
                  <div
                    className={cn(slots.cell(), cellRange)}
                    key={isoKey(day)}
                    role="gridcell"
                    // Every day inside the range is exposed as selected, not only the endpoints.
                    aria-selected={selected || inRange || undefined}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) dayRefs.current.set(isoKey(day), el)
                        else dayRefs.current.delete(isoKey(day))
                      }}
                      tabIndex={isSameDay(day, tabbable) ? 0 : -1}
                      disabled={disabled}
                      aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(day)}
                      data-today={isToday || undefined}
                      data-outside={outside || undefined}
                      data-disabled={disabled || undefined}
                      data-selected={selected || undefined}
                      className={slots.day()}
                      onClick={() => handleDayClick(day)}
                      onKeyDown={(e) => handleDayKeyDown(e, day)}
                      onMouseEnter={() => mode === "range" && rFrom && !range?.to && setHovered(day)}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Polite live region so changing month via the chevrons (which keeps focus on the button, not a
  // day) is announced. Keyboard day-nav is already announced through the newly focused day's label.
  const liveMonthLabel = displayedMonths
    .map((m) => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(m))
    .join(", ")

  return (
    <div
      className={slots.root({ className })}
      data-slot="calendar"
      onMouseLeave={() => setHovered(null)}
    >
      <div role="status" aria-live="polite" className="sr-only">
        {liveMonthLabel}
      </div>
      <div className={slots.months()}>{displayedMonths.map((m, i) => renderMonth(m, i))}</div>
    </div>
  )
}

// ─── Trigger (shared by both pickers) ────────────────────────────────────────────

interface PickerTriggerProps {
  label: React.ReactNode
  isPlaceholder: boolean
  size: NonNullable<VariantProps<typeof datePickerTriggerVariants>["size"]>
  block: boolean
  disabled?: boolean
  invalid?: boolean
  clearable: boolean
  hasValue: boolean
  onClear: () => void
  className?: string
  id?: string
  describedBy?: string
}

function PickerTrigger({
  label,
  isPlaceholder,
  size,
  block,
  disabled,
  invalid,
  clearable,
  hasValue,
  onClear,
  className,
  id,
  describedBy,
}: PickerTriggerProps) {
  const showClear = clearable && hasValue && !disabled
  return (
    <div className={cn("relative inline-flex", block && "w-full")}>
      <PopoverPrimitive.Trigger
        id={id}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        data-placeholder={isPlaceholder || undefined}
        className={datePickerTriggerVariants({ size, block, clearable: showClear, className })}
      >
        <CalendarBlank weight="bold" className="shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{label}</span>
      </PopoverPrimitive.Trigger>
      {showClear && (
        <button
          type="button"
          aria-label="Clear"
          onClick={onClear}
          className={cn(
            "absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm",
            "text-muted-foreground cursor-pointer transition-[color,background-color,scale] duration-fast ease-out",
            "hover:bg-accent hover:text-foreground active:scale-[0.96]",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand",
          )}
        >
          <X weight="bold" className="size-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Presets rail ─────────────────────────────────────────────────────────────────

function PresetRail({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex max-h-72 w-36 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border p-2">
      {children}
    </div>
  )
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active || undefined}
      className={cn(
        "flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm cursor-pointer",
        "text-muted-foreground transition-[background-color,color,scale] duration-fast ease-out",
        "hover:bg-accent hover:text-foreground active:scale-[0.98]",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand",
        "data-[active]:bg-accent data-[active]:font-medium data-[active]:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

// ─── Popover content shell ──────────────────────────────────────────────────────

const contentClass = cn(
  "z-50 w-auto overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg",
  // Expose the surface so nested controls blend with the popover, not the page.
  "[--surface:var(--popover)]",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
  "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
)

// ─── DatePicker (single date) ─────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  /** Trigger size. @default "md" */
  size?: NonNullable<VariantProps<typeof datePickerTriggerVariants>["size"]>
  /** Stretch the trigger to its container width. */
  block?: boolean
  disabled?: boolean
  /** Mark the trigger invalid (also auto-picked up inside a Field). */
  hasError?: boolean
  /** Show a clear (×) affordance once a date is chosen. */
  clearable?: boolean
  /** Quick-pick shortcuts. `true` uses the built-in set; pass an array to customize. */
  presets?: DatePreset[] | boolean
  /** Format the trigger label. Defaults to a locale medium date. */
  format?: (date: Date) => string
  min?: Date
  max?: Date
  isDateDisabled?: (date: Date) => boolean
  weekStartsOn?: WeekStart
  locale?: string
  numberOfMonths?: number
  density?: Density
  /** Popover alignment relative to the trigger. @default "start" */
  align?: "start" | "center" | "end"
  className?: string
  /** Class for the trigger button. */
  triggerClassName?: string
  id?: string
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  size,
  block = false,
  disabled,
  hasError,
  clearable = false,
  presets,
  format,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 1,
  locale,
  numberOfMonths = 1,
  density,
  align = "start",
  className,
  triggerClassName,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = useControllableState<Date | undefined>({ value, defaultValue, onChange })
  const field = useFieldContext()

  const fmt = React.useMemo(
    () => format ?? ((dd: Date) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(dd)),
    [format, locale],
  )
  const presetList = presets === true ? getDatePresets() : Array.isArray(presets) ? presets : null

  function select(next: Date | undefined) {
    setDate(next)
    if (next) setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PickerTrigger
        label={date ? fmt(date) : placeholder}
        isPlaceholder={!date}
        size={useControlSize(size, density)}
        block={block}
        disabled={disabled ?? field?.disabled}
        invalid={hasError ?? field?.hasError}
        clearable={clearable}
        hasValue={!!date}
        onClear={() => setDate(undefined)}
        className={cn(className, triggerClassName)}
        id={id ?? field?.id}
        describedBy={field?.describedBy}
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align={align} sideOffset={8} className={contentClass}>
          <div className="flex">
            {presetList && (
              <PresetRail>
                {presetList.map((p) => (
                  <PresetButton key={p.label} active={isSameDay(p.value, date)} onClick={() => select(p.value)}>
                    {p.label}
                  </PresetButton>
                ))}
              </PresetRail>
            )}
            <div className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={select}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
                weekStartsOn={weekStartsOn}
                locale={locale}
                numberOfMonths={numberOfMonths}
                density={density}
              />
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────────

const rangesEqual = (a?: DateRange, b?: DateRange) =>
  isSameDay(a?.from, b?.from) && isSameDay(a?.to, b?.to)

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  size?: NonNullable<VariantProps<typeof datePickerTriggerVariants>["size"]>
  block?: boolean
  disabled?: boolean
  hasError?: boolean
  clearable?: boolean
  /** Range shortcuts. `true` uses the built-in set; pass an array to customize. */
  presets?: DateRangePreset[] | boolean
  format?: (date: Date) => string
  min?: Date
  max?: Date
  isDateDisabled?: (date: Date) => boolean
  weekStartsOn?: WeekStart
  locale?: string
  /** Months shown side by side. @default 2 */
  numberOfMonths?: number
  density?: Density
  align?: "start" | "center" | "end"
  className?: string
  triggerClassName?: string
  id?: string
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date range",
  size,
  block = false,
  disabled,
  hasError,
  clearable = false,
  presets,
  format,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 1,
  locale,
  numberOfMonths = 2,
  density,
  align = "start",
  className,
  triggerClassName,
  id,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = useControllableState<DateRange | undefined>({ value, defaultValue, onChange })
  const field = useFieldContext()

  const fmt = React.useMemo(
    () => format ?? ((dd: Date) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(dd)),
    [format, locale],
  )
  const presetList = presets === true ? getDateRangePresets(new Date(), weekStartsOn) : Array.isArray(presets) ? presets : null

  const label =
    range?.from && range.to
      ? `${fmt(range.from)} – ${fmt(range.to)}`
      : range?.from
        ? `${fmt(range.from)} – …`
        : placeholder

  function handleSelect(next: DateRange | undefined) {
    setRange(next)
    if (next?.from && next.to) setOpen(false) // close once both ends are set
  }

  function applyPreset(next: DateRange) {
    setRange(next)
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PickerTrigger
        label={label}
        isPlaceholder={!range?.from}
        size={useControlSize(size, density)}
        block={block}
        disabled={disabled ?? field?.disabled}
        invalid={hasError ?? field?.hasError}
        clearable={clearable}
        hasValue={!!range?.from}
        onClear={() => setRange(undefined)}
        className={cn(className, triggerClassName)}
        id={id ?? field?.id}
        describedBy={field?.describedBy}
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align={align} sideOffset={8} className={contentClass}>
          <div className="flex">
            {presetList && (
              <PresetRail>
                {presetList.map((p) => (
                  <PresetButton key={p.label} active={rangesEqual(p.value, range)} onClick={() => applyPreset(p.value)}>
                    {p.label}
                  </PresetButton>
                ))}
              </PresetRail>
            )}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={range}
                onSelect={handleSelect}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
                weekStartsOn={weekStartsOn}
                locale={locale}
                numberOfMonths={numberOfMonths}
                density={density}
              />
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
