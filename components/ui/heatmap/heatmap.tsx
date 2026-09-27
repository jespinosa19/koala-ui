"use client"

import * as React from "react"

import { createContext } from "@/lib/create-context"
import { duration } from "@/lib/motion"
import { tv } from "@/lib/tv"
import {
  Tooltip,
  TooltipDescription,
  TooltipGroup,
  TooltipHeader,
  TooltipHeaderText,
  TooltipTitle,
  TooltipValue,
} from "@/components/ui/tooltip"

/**
 * Heatmap: a grid of cells tinted by how large their value is. Weekday by hour activity, a
 * GitHub-style contribution strip, a cohort retention triangle, the events-by-day card of a
 * dashboard: rows by columns of numbers, read as colour.
 *
 * Multi-part, built like Chart: the `Heatmap` root owns the data, the labels and the colour scale,
 * and the parts read it from Context. `HeatmapGrid` draws the cells (and is the scroll box that
 * keeps a wide grid inside its own bounds on a phone); `HeatmapRowLabels` and `HeatmapColumnLabels`
 * sit inside it and line up with the cells through CSS subgrid; `HeatmapLegend` is the Less / More
 * key. Every part is droppable: leave the labels out for a bare strip, the legend out for a tight
 * card.
 *
 * Colour is a stepped scale of one semantic hue, mixed into the muted track: an empty (zero) cell
 * IS the track, and each step adds more of the hue until the last step is the hue itself. The mix
 * is a runtime value, so it rides a CSS variable per cell (`--heatmap-alpha`), never a generated
 * class. Everything else is tokens, so the scale re-themes across all four palettes.
 *
 * Accessibility: the cells are an ARIA grid (`role="grid"` / `row` / `gridcell`) with one tab stop
 * and roving focus under the arrow keys, Home / End and Ctrl+Home / Ctrl+End. Every cell carries
 * its full reading as its name ("Sign-ups, Mon: 131"), so the label parts are decorative
 * (`aria-hidden`) duplicates for the eye. Focus and hover open the same shared tooltip, which
 * glides from cell to cell (a {@link TooltipGroup}). See docs/ARCHITECTURE.md.
 */
export const heatmapVariants = tv({
  slots: {
    root: "flex min-w-0 flex-col gap-3",
    // The scroll box. A grid wider than its container (53 weeks on a phone) scrolls sideways in
    // here, so the page never does. The 4px pad (pulled back with a negative margin) is room for
    // the focus outline of the edge cells, which the overflow would otherwise clip.
    grid: "-m-1 min-w-0 overflow-x-auto overscroll-x-contain p-1",
    // The CSS grid every part lines up on: one track per column (at least the cell minimum, all
    // sharing the rest equally) and one per row. A leading label track or row only exists while
    // the label part is there, so dropping a part leaves no gutter behind. `min-w-min` is what
    // overflows the scroll box once the columns can shrink no further. The corner over the row
    // labels only shows when both label parts do.
    layout: [
      "grid w-full min-w-min",
      "grid-cols-[repeat(var(--heatmap-columns),minmax(var(--heatmap-cell-min),1fr))]",
      "has-[>[data-slot=heatmap-row-labels]]:grid-cols-[auto_repeat(var(--heatmap-columns),minmax(var(--heatmap-cell-min),1fr))]",
      "grid-rows-[repeat(var(--heatmap-rows),auto)]",
      "has-[>[data-slot=heatmap-column-labels]]:grid-rows-[auto_repeat(var(--heatmap-rows),auto)]",
      "[&:has(>[data-slot=heatmap-row-labels]):has(>[data-slot=heatmap-column-labels])>[data-slot=heatmap-corner]]:block",
    ],
    // Row labels share the rows of the cells (subgrid), so a label always centres on its row.
    // They stick to the start edge while a wide grid scrolls under them, on the surface they sit
    // on (the --surface contract), so the cells slide beneath rather than through the text. The
    // box reaches back over the scroll box's pad (and sticks there), so no sliver of a cell shows
    // at the edge.
    rowLabels: [
      "sticky -start-1 z-10 col-start-1 -ms-1 ps-1 [grid-row:span_var(--heatmap-rows)/-1]",
      "grid grid-rows-subgrid bg-[var(--surface,var(--background))] text-muted-foreground",
    ],
    // A label takes its width from its text but none of its height (`h-0`, then the full row): a
    // row is exactly as tall as its cells, and the text centres on it even when it is the taller.
    rowLabel:
      "flex h-0 min-h-full items-center whitespace-nowrap transition-colors duration-fast ease-out data-active:text-foreground",
    // The same cover above the row labels, so the column labels slide under it too.
    corner: "sticky -start-1 z-10 col-start-1 row-start-1 -ms-1 hidden bg-[var(--surface,var(--background))]",
    // Column labels share the columns of the cells, and never widen one (`contain-inline-size`):
    // every column stays the same width. A label with a neighbour on each side centres on its
    // column; a label with an empty slot after it (a month over a year of weeks, every third hour)
    // is a tick that marks its column from the start edge and spills over the empty slots. The
    // row clips at the last column, so a spilling label never makes the box scroll.
    columnLabels:
      "row-start-1 [grid-column:span_var(--heatmap-columns)/-1] grid grid-cols-subgrid items-end overflow-x-clip text-muted-foreground",
    columnLabel:
      "contain-inline-size whitespace-nowrap text-center tabular-nums transition-colors duration-fast ease-out data-active:text-foreground data-spill:text-start",
    cells: "[grid-column:span_var(--heatmap-columns)/-1] [grid-row:span_var(--heatmap-rows)/-1] grid grid-cols-subgrid grid-rows-subgrid",
    // `display: contents`: the row exists for the accessibility tree, its cells flow into the grid.
    row: "contents",
    // The hue mixed into the muted track by the cell's own `--heatmap-alpha` (0% is the track).
    // Hover and focus draw an outline, which paints above the neighbouring cells, where a ring
    // (a box-shadow) would be covered by them. Only the fill transitions, so a data change tweens
    // while the hover outline follows the pointer without a trail.
    cell: [
      "cursor-default outline-2 outline-offset-1 outline-transparent",
      "bg-[color-mix(in_oklab,var(--heatmap-color)_var(--heatmap-alpha),var(--muted))]",
      "transition-[background-color] duration-base ease-out motion-reduce:transition-none",
      "hover:outline-foreground/25 focus-visible:outline-foreground",
    ],
    legend: "flex items-center justify-end gap-1 text-xs text-muted-foreground",
    legendLabel: "",
    swatch: "shrink-0 bg-[color-mix(in_oklab,var(--heatmap-color)_var(--heatmap-alpha),var(--muted))]",
    // A dashed frame where the cells would be, so the card keeps its shape and reads as waiting.
    empty:
      "flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-sm text-pretty text-muted-foreground",
  },
  variants: {
    // The hue the scale is built from. Complete class strings, never interpolated. `blue` is the
    // house chart hue (Chart's default); `brand` is the accent, for a heatmap that IS the story of
    // the screen; `current` takes the ambient text colour, set with a `text-*` utility.
    color: {
      current: { root: "[--heatmap-color:currentColor]" },
      blue: { root: "[--heatmap-color:var(--color-blue-500)]" },
      brand: { root: "[--heatmap-color:var(--brand)]" },
      primary: { root: "[--heatmap-color:var(--primary)]" },
      purple: { root: "[--heatmap-color:var(--purple)]" },
      pink: { root: "[--heatmap-color:var(--pink)]" },
      teal: { root: "[--heatmap-color:var(--teal)]" },
      orange: { root: "[--heatmap-color:var(--orange)]" },
      success: { root: "[--heatmap-color:var(--success)]" },
      warning: { root: "[--heatmap-color:var(--warning)]" },
      info: { root: "[--heatmap-color:var(--info)]" },
      destructive: { root: "[--heatmap-color:var(--destructive)]" },
    },
    // `md` is the dashboard card (cells at least 24px, 4px apart, room for a three-letter label
    // over every column); `sm` is the dense strip (a year of days: at least 10px, 2px apart), whose
    // labels set solid so a row never grows taller than its cells.
    size: {
      sm: {
        layout: "gap-0.5 [--heatmap-cell-min:--spacing(2.5)]",
        rowLabels: "pe-1.5 text-xs leading-none",
        columnLabels: "pb-1 text-xs leading-none",
        cell: "rounded-[calc(var(--radius-xs)*0.5)]",
        swatch: "size-2.5 rounded-[calc(var(--radius-xs)*0.4)]",
      },
      md: {
        layout: "gap-1 [--heatmap-cell-min:--spacing(6)]",
        rowLabels: "pe-1 text-xs",
        columnLabels: "pb-1 text-xs",
        cell: "rounded-xs",
        swatch: "size-3 rounded-[calc(var(--radius-xs)*0.6)]",
      },
    },
    // `square` cells are as tall as they are wide. `wide` cells keep one row height and stretch
    // across their column, for a card with few columns and a lot of width.
    aspect: {
      square: { cell: "aspect-square" },
      wide: {},
    },
    // The one-shot load reveal: each cell fades and grows in, in a diagonal wave from the top-left
    // corner (the per-cell delay is set inline). Held still under prefers-reduced-motion.
    animate: {
      true: { cell: "animate-in fade-in-0 zoom-in-75 fill-mode-both duration-base ease-out motion-reduce:animate-none" },
      false: {},
    },
  },
  compoundVariants: [
    { size: "sm", aspect: "wide", class: { cell: "h-3" } },
    { size: "md", aspect: "wide", class: { cell: "h-7" } },
  ],
  defaultVariants: {
    color: "blue",
    size: "md",
    aspect: "square",
    animate: true,
  },
})

type HeatmapSlots = ReturnType<typeof heatmapVariants>

/* -------------------------------------------------------------------- types --- */

/** The hues a heatmap scale can be built from. The same names as Chart's series colours. */
export type HeatmapColor =
  | "current"
  | "blue"
  | "brand"
  | "primary"
  | "purple"
  | "pink"
  | "teal"
  | "orange"
  | "success"
  | "warning"
  | "info"
  | "destructive"

/**
 * What the colour scale is measured against. `grid` shades every cell against the whole grid;
 * `row` shades each row from its own lowest value to its highest (rows at different magnitudes,
 * like visits and refunds); `column` does the same per column.
 */
export type HeatmapNormalize = "grid" | "row" | "column"

/** One cell, as the tooltip and label callbacks see it. */
export interface HeatmapCell {
  /** Row index, from 0. */
  row: number
  /** Column index, from 0. */
  column: number
  rowLabel: string
  columnLabel: string
  value: number
  /** `value` through the root's `valueFormatter`. */
  formattedValue: string
  /** The scale step the cell is painted at: 0 is the empty track, `steps` the full hue. */
  level: number
}

interface Position {
  row: number
  column: number
}

interface HeatmapContextValue {
  slots: HeatmapSlots
  /** The data, squared off to `rowCount` x `columnCount`; a missing value is `null`. */
  matrix: (number | null)[][]
  /** The scale step of every cell, `null` where there is no value. */
  levels: (number | null)[][]
  rowLabels: string[]
  columnLabels: string[]
  rowCount: number
  columnCount: number
  steps: number
  format: (value: number) => string
  label?: string
  empty?: React.ReactNode
  isEmpty: boolean
  /** The hovered or focused cell, which lifts its row and column labels. */
  active: Position | null
  setActive: (position: Position | null) => void
}

const [HeatmapProvider, useHeatmapContext] = createContext<HeatmapContextValue>("Heatmap")

/* ------------------------------------------------------------------ scale --- */

/**
 * The heatmap's own figures, pinned to one locale. The grid renders on the server and hydrates on
 * the client; a bare `toLocaleString()` would take each side's locale and the two would disagree.
 * Pass `valueFormatter` to show a different one.
 */
const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
const formatNumber = (value: number) => NUMBER.format(value)

/** The share of the hue in the lightest non-empty step, and the curve up to the full hue. The
 *  curve spends more of the range on the low steps, where the eye tells mixes apart least. */
const ALPHA_FLOOR = 15
const ALPHA_CURVE = 1.3

/** How much of the hue a step mixes into the track, as a percentage. Step 0 is the track. */
function alphaFor(level: number, steps: number): number {
  if (level <= 0) return 0
  if (steps <= 1) return 100
  const t = (level - 1) / (steps - 1)
  return Math.round(ALPHA_FLOOR + (100 - ALPHA_FLOOR) * t ** ALPHA_CURVE)
}

/** The step a value falls on, between `low` and `high`. Zero (or less) is the empty track; the
 *  quietest value of a range is step 1 and the busiest is `steps`. */
function levelFor(value: number, low: number, high: number, steps: number): number {
  if (value <= 0) return 0
  if (high <= low) return steps
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)))
  return 1 + Math.round(t * (steps - 1))
}

function extent(values: (number | null)[]): [number, number] {
  let low = Infinity
  let high = -Infinity
  for (const value of values) {
    if (value == null) continue
    if (value < low) low = value
    if (value > high) high = value
  }
  return Number.isFinite(low) ? [low, high] : [0, 0]
}

/** Every cell's step, measured against the grid, its row or its column (or a fixed `domain`). */
function computeLevels(
  matrix: (number | null)[][],
  columnCount: number,
  normalize: HeatmapNormalize,
  steps: number,
  domain?: readonly [number, number],
): (number | null)[][] {
  const gridRange = domain ?? extent(matrix.flat())
  const rowRanges = matrix.map((row) => domain ?? extent(row))
  const columnRanges = Array.from({ length: columnCount }, (_, column) =>
    domain ?? extent(matrix.map((row) => row[column])),
  )
  return matrix.map((row, r) =>
    row.map((value, c) => {
      if (value == null) return null
      const [low, high] =
        normalize === "row" ? rowRanges[r] : normalize === "column" ? columnRanges[c] : gridRange
      return levelFor(value, low, high, steps)
    }),
  )
}

/** The CSS variable a cell or swatch carries: its share of the hue. */
function alphaStyle(alpha: number): React.CSSProperties {
  return { "--heatmap-alpha": `${alpha}%` } as React.CSSProperties
}

/* --------------------------------------------------------------------- root --- */

export interface HeatmapProps extends Omit<React.ComponentProps<"div">, "color"> {
  /**
   * The values, one array per row and one entry per column. `null` (or a missing entry) is a
   * blank cell: no fill, no tooltip, skipped by the arrow keys, which is how a retention triangle
   * or the days before a calendar starts read. Zero is an empty cell on the muted track.
   */
  data: ReadonlyArray<ReadonlyArray<number | null | undefined>>
  /** Row labels, in order. They name the rows for `HeatmapRowLabels`, the tooltips and every cell's accessible name. */
  rows?: readonly string[]
  /** Column labels, in order. They name the columns for `HeatmapColumnLabels`, the tooltips and every cell's accessible name. */
  columns?: readonly string[]
  /**
   * What each cell's shade is measured against: the whole `grid`, its own `row` (for rows at very
   * different magnitudes) or its own `column`. @default "grid"
   */
  normalize?: HeatmapNormalize
  /**
   * Pin the scale to `[low, high]` instead of measuring it from the data, for figures with a known
   * range such as percentages (`[0, 100]`). It applies to every cell, so `normalize` has no effect.
   */
  domain?: readonly [number, number]
  /** How many shades the scale has above the empty track. @default 4 */
  steps?: number
  /** The hue the scale is built from. @default "blue" */
  color?: HeatmapColor
  /** `md` for a dashboard card, `sm` for a dense strip (a year of days). @default "md" */
  size?: "sm" | "md"
  /** `square` cells, or `wide` ones that keep a row height and stretch across their column. @default "square" */
  aspect?: "square" | "wide"
  /** Format a value for the tooltip and each cell's accessible name. Defaults to `en-US` grouping. */
  valueFormatter?: (value: number) => string
  /** Accessible name of the grid, for example "Events per day, Sep 21 to Sep 27". Strongly recommended. */
  label?: string
  /** Play the one-shot load reveal (a diagonal wave of cells). Honors `prefers-reduced-motion`. @default true */
  animate?: boolean
  /** Shown in place of the grid when `data` has no rows or no columns. Defaults to a muted "No data to display". */
  empty?: React.ReactNode
}

export function Heatmap({
  data,
  rows,
  columns,
  normalize = "grid",
  domain,
  steps: stepsProp = 4,
  color = "blue",
  size = "md",
  aspect = "square",
  valueFormatter,
  label,
  animate = true,
  empty,
  className,
  children,
  ...props
}: HeatmapProps) {
  const [active, setActive] = React.useState<Position | null>(null)

  const steps = Math.min(10, Math.max(1, Math.round(stepsProp)))
  const rowCount = data.length
  const columnCount = data.reduce((most, row) => Math.max(most, row.length), columns?.length ?? 0)
  const isEmpty = rowCount === 0 || columnCount === 0

  // Square the data off (ragged rows pad with blanks) and drop anything that is not a number.
  const matrix = React.useMemo(
    () =>
      data.map((row) =>
        Array.from({ length: columnCount }, (_, c) => {
          const value = row[c]
          return typeof value === "number" && Number.isFinite(value) ? value : null
        }),
      ),
    [data, columnCount],
  )

  const domainLow = domain?.[0]
  const domainHigh = domain?.[1]
  const levels = React.useMemo(
    () =>
      computeLevels(
        matrix,
        columnCount,
        normalize,
        steps,
        domainLow != null && domainHigh != null ? [domainLow, domainHigh] : undefined,
      ),
    [matrix, columnCount, normalize, steps, domainLow, domainHigh],
  )

  const rowLabels = React.useMemo(
    () => Array.from({ length: rowCount }, (_, r) => rows?.[r] ?? `Row ${r + 1}`),
    [rows, rowCount],
  )
  const columnLabels = React.useMemo(
    () => Array.from({ length: columnCount }, (_, c) => columns?.[c] ?? `Column ${c + 1}`),
    [columns, columnCount],
  )

  const slots = heatmapVariants({ color, size, aspect, animate })

  return (
    <HeatmapProvider
      slots={slots}
      matrix={matrix}
      levels={levels}
      rowLabels={rowLabels}
      columnLabels={columnLabels}
      rowCount={rowCount}
      columnCount={columnCount}
      steps={steps}
      format={valueFormatter ?? formatNumber}
      label={label}
      empty={empty}
      isEmpty={isEmpty}
      active={active}
      setActive={setActive}
    >
      <div
        data-slot="heatmap"
        data-size={size}
        data-aspect={aspect}
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </div>
    </HeatmapProvider>
  )
}

/* --------------------------------------------------------------------- grid --- */

export interface HeatmapGridProps extends React.ComponentProps<"div"> {
  /**
   * The tooltip body for a cell. Defaults to the row label as the title, the column label under
   * it and the formatted value in a chip. Return `null` for no tooltip on that cell; return `null`
   * for every cell to drop tooltips altogether. It renders in a `graph` tooltip, so compose it
   * from the Tooltip graph parts (`TooltipHeader`, `TooltipTitle`, `TooltipValue`, ...).
   */
  renderTooltip?: (cell: HeatmapCell) => React.ReactNode
  /**
   * The accessible name of a cell. Defaults to "row, column: value" ("Sign-ups, Mon: 131"). Write
   * your own when the labels alone do not say what the cell is, like a calendar day.
   */
  cellLabel?: (cell: HeatmapCell) => string
  /** `HeatmapRowLabels` and `HeatmapColumnLabels` go here, so they line up with the cells. */
  children?: React.ReactNode
}

/** The default tooltip: which row, which column, how much. */
function defaultTooltip(cell: HeatmapCell) {
  return (
    <TooltipHeader>
      <TooltipHeaderText>
        <TooltipTitle>{cell.rowLabel}</TooltipTitle>
        <TooltipDescription>{cell.columnLabel}</TooltipDescription>
      </TooltipHeaderText>
      <TooltipValue>{cell.formattedValue}</TooltipValue>
    </TooltipHeader>
  )
}

function defaultCellLabel(cell: HeatmapCell) {
  return `${cell.rowLabel}, ${cell.columnLabel}: ${cell.formattedValue}`
}

/** The first or last cell that holds a value, reading row by row. */
function edgeCell(levels: (number | null)[][], from: "start" | "end"): Position | null {
  for (let i = 0; i < levels.length; i++) {
    const found = rowEdge(levels, from === "start" ? i : levels.length - 1 - i, from)
    if (found) return found
  }
  return null
}

/** Walk from a cell in one direction to the next cell that holds a value (blanks are skipped). */
function stepFrom(levels: (number | null)[][], from: Position, dr: number, dc: number): Position | null {
  let row = from.row + dr
  let column = from.column + dc
  while (row >= 0 && row < levels.length && column >= 0 && column < (levels[row]?.length ?? 0)) {
    if (levels[row][column] != null) return { row, column }
    row += dr
    column += dc
  }
  return null
}

/** The first or last cell with a value in one row. */
function rowEdge(levels: (number | null)[][], row: number, from: "start" | "end"): Position | null {
  const cells = levels[row] ?? []
  for (let i = 0; i < cells.length; i++) {
    const column = from === "start" ? i : cells.length - 1 - i
    if (cells[column] != null) return { row, column }
  }
  return null
}

export function HeatmapGrid({
  renderTooltip = defaultTooltip,
  cellLabel = defaultCellLabel,
  className,
  children,
  ...props
}: HeatmapGridProps) {
  const {
    slots,
    matrix,
    levels,
    rowLabels,
    columnLabels,
    rowCount,
    columnCount,
    steps,
    format,
    label,
    empty,
    isEmpty,
    setActive,
  } = useHeatmapContext("HeatmapGrid")

  // Roving focus: the grid is one tab stop, on the last cell focused (or the first with a value).
  const [focused, setFocused] = React.useState<Position | null>(null)
  const tabStop =
    focused && levels[focused.row]?.[focused.column] != null ? focused : edgeCell(levels, "start")

  const onHover = React.useCallback((position: Position) => setActive(position), [setActive])
  const onFocusCell = React.useCallback(
    (position: Position) => {
      setFocused(position)
      setActive(position)
    },
    [setActive],
  )

  if (isEmpty) {
    return (
      <div data-slot="heatmap-grid" className={slots.grid({ className })} {...props}>
        <div data-slot="heatmap-empty" className={slots.empty()}>
          {empty ?? "No data to display"}
        </div>
      </div>
    )
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-slot=heatmap-cell]")
    if (!target) return
    const from = { row: Number(target.dataset.row), column: Number(target.dataset.column) }
    let next: Position | null
    switch (event.key) {
      case "ArrowRight":
        next = stepFrom(levels, from, 0, 1)
        break
      case "ArrowLeft":
        next = stepFrom(levels, from, 0, -1)
        break
      case "ArrowDown":
        next = stepFrom(levels, from, 1, 0)
        break
      case "ArrowUp":
        next = stepFrom(levels, from, -1, 0)
        break
      case "Home":
        next = event.ctrlKey || event.metaKey ? edgeCell(levels, "start") : rowEdge(levels, from.row, "start")
        break
      case "End":
        next = event.ctrlKey || event.metaKey ? edgeCell(levels, "end") : rowEdge(levels, from.row, "end")
        break
      default:
        return
    }
    event.preventDefault()
    if (!next) return
    const cell = event.currentTarget.querySelector<HTMLElement>(
      `[data-slot=heatmap-cell][data-row="${next.row}"][data-column="${next.column}"]`,
    )
    if (!cell) return
    cell.focus()
    // Focus scrolls the cell into the box, but a sticky row label can still cover it: nudge the
    // box back so the cell lands clear of the labels.
    const box = event.currentTarget.closest<HTMLElement>("[data-slot=heatmap-grid]")
    const labels = box?.querySelector<HTMLElement>("[data-slot=heatmap-row-labels]")
    if (box && labels) {
      const overlap = labels.getBoundingClientRect().right - cell.getBoundingClientRect().left
      if (overlap > 0) box.scrollLeft -= overlap
    }
  }

  // Leaving with the pointer hands the highlight back to the focused cell, if focus is in here.
  const onPointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    const inside = event.currentTarget.contains(document.activeElement)
    setActive(inside ? focused : null)
  }
  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null)
  }

  const cellClass = slots.cell()
  const blankClass = slots.cell({ class: "pointer-events-none animate-none bg-transparent" })
  // The reveal runs as a diagonal wave from the top-left corner across the Chart's slow window.
  const diagonal = Math.max(1, rowCount + columnCount - 2)

  return (
    <div data-slot="heatmap-grid" className={slots.grid({ className })} {...props}>
      <div
        data-slot="heatmap-layout"
        className={slots.layout()}
        style={{ "--heatmap-rows": rowCount, "--heatmap-columns": columnCount } as React.CSSProperties}
      >
        <div aria-hidden data-slot="heatmap-corner" className={slots.corner()} />
        {children}
        <TooltipGroup variant="graph">
          <div
            role="grid"
            aria-label={label}
            data-slot="heatmap-cells"
            className={slots.cells()}
            onKeyDown={onKeyDown}
            onPointerLeave={onPointerLeave}
            onBlur={onBlur}
          >
            {matrix.map((values, r) => (
              <div key={r} role="row" data-slot="heatmap-row" className={slots.row()}>
                {values.map((value, c) => {
                  const level = levels[r][c]
                  return (
                    <HeatmapCellView
                      key={c}
                      row={r}
                      column={c}
                      value={value}
                      level={level}
                      alpha={level == null ? 0 : alphaFor(level, steps)}
                      rowLabel={rowLabels[r]}
                      columnLabel={columnLabels[c]}
                      format={format}
                      tabbable={tabStop?.row === r && tabStop.column === c}
                      delay={`${Math.round(((r + c) / diagonal) * duration.slow)}ms`}
                      className={value == null ? blankClass : cellClass}
                      renderTooltip={renderTooltip}
                      cellLabel={cellLabel}
                      onHover={onHover}
                      onFocusCell={onFocusCell}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </TooltipGroup>
      </div>
    </div>
  )
}

interface HeatmapCellViewProps {
  row: number
  column: number
  value: number | null
  level: number | null
  alpha: number
  rowLabel: string
  columnLabel: string
  format: (value: number) => string
  tabbable: boolean
  delay: string
  className: string
  renderTooltip: (cell: HeatmapCell) => React.ReactNode
  cellLabel: (cell: HeatmapCell) => string
  onHover: (position: Position) => void
  onFocusCell: (position: Position) => void
}

/**
 * One cell. Memoised on plain values, so a hover (which re-renders the root to lift the labels)
 * re-renders no cell, and a data change re-renders only the cells whose value moved.
 */
const HeatmapCellView = React.memo(function HeatmapCellView({
  row,
  column,
  value,
  level,
  alpha,
  rowLabel,
  columnLabel,
  format,
  tabbable,
  delay,
  className,
  renderTooltip,
  cellLabel,
  onHover,
  onFocusCell,
}: HeatmapCellViewProps) {
  const style = { ...alphaStyle(alpha), animationDelay: delay }

  // A blank: it holds the grid position and nothing else (no name, no focus, no tooltip).
  if (value == null || level == null) {
    return <div role="gridcell" data-slot="heatmap-cell" data-row={row} data-column={column} data-blank="" className={className} />
  }

  const cell: HeatmapCell = { row, column, rowLabel, columnLabel, value, formattedValue: format(value), level }
  const content = renderTooltip(cell)
  const node = (
    <div
      role="gridcell"
      data-slot="heatmap-cell"
      data-row={row}
      data-column={column}
      data-level={level}
      aria-label={cellLabel(cell)}
      tabIndex={tabbable ? 0 : -1}
      className={className}
      style={style}
      onPointerEnter={() => onHover({ row, column })}
      onFocus={() => onFocusCell({ row, column })}
    />
  )
  return content == null || content === false ? node : <Tooltip content={content}>{node}</Tooltip>
})

/* ------------------------------------------------------------------- labels --- */

const isBlank = (node: React.ReactNode) => node == null || node === false || node === ""

export interface HeatmapLabelsProps extends React.ComponentProps<"div"> {
  /** Format a label, or return `null` to leave its slot empty (show every month once, every sixth hour). */
  tickFormatter?: (label: string, index: number) => React.ReactNode
  /** Show every Nth label only, to thin out a crowded axis. @default 1 */
  interval?: number
}

/** The labels down the start edge, one per row. Place it inside `HeatmapGrid`. Decorative for
 *  assistive tech: every cell already names its row. */
export function HeatmapRowLabels({ tickFormatter, interval = 1, className, ...props }: HeatmapLabelsProps) {
  const { slots, rowLabels, active, isEmpty } = useHeatmapContext("HeatmapRowLabels")
  if (isEmpty) return null
  return (
    <div aria-hidden data-slot="heatmap-row-labels" className={slots.rowLabels({ className })} {...props}>
      {rowLabels.map((text, r) => (
        <div
          key={r}
          data-slot="heatmap-row-label"
          data-active={active?.row === r ? "" : undefined}
          className={slots.rowLabel()}
        >
          {r % Math.max(1, interval) === 0 ? (tickFormatter ? tickFormatter(text, r) : text) : null}
        </div>
      ))}
    </div>
  )
}

/** The labels across the top, one per column. Place it inside `HeatmapGrid`. Decorative for
 *  assistive tech: every cell already names its column. */
export function HeatmapColumnLabels({ tickFormatter, interval = 1, className, ...props }: HeatmapLabelsProps) {
  const { slots, columnLabels, active, isEmpty } = useHeatmapContext("HeatmapColumnLabels")
  if (isEmpty) return null
  const shown = columnLabels.map((text, c) =>
    c % Math.max(1, interval) === 0 ? (tickFormatter ? tickFormatter(text, c) : text) : null,
  )
  return (
    <div aria-hidden data-slot="heatmap-column-labels" className={slots.columnLabels({ className })} {...props}>
      {shown.map((node, c) => (
        <div
          key={c}
          data-slot="heatmap-column-label"
          data-active={active?.column === c ? "" : undefined}
          // A tick: an empty slot follows, so the label marks its column from the start and spills into it.
          data-spill={c < shown.length - 1 && isBlank(shown[c + 1]) ? "" : undefined}
          className={slots.columnLabel()}
        >
          {node}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------- legend --- */

export interface HeatmapLegendProps extends React.ComponentProps<"div"> {
  /** The word before the scale. @default "Less" */
  lowLabel?: React.ReactNode
  /** The word after the scale. @default "More" */
  highLabel?: React.ReactNode
}

/**
 * The scale, low to high: the empty track, then every step. Decorative for assistive tech, since
 * each cell already carries its number.
 */
export function HeatmapLegend({ lowLabel = "Less", highLabel = "More", className, ...props }: HeatmapLegendProps) {
  const { slots, steps, isEmpty } = useHeatmapContext("HeatmapLegend")
  if (isEmpty) return null
  return (
    <div aria-hidden data-slot="heatmap-legend" className={slots.legend({ className })} {...props}>
      {lowLabel != null && (
        <span data-slot="heatmap-legend-label" className={slots.legendLabel({ class: "me-1" })}>
          {lowLabel}
        </span>
      )}
      {Array.from({ length: steps + 1 }, (_, level) => (
        <span
          key={level}
          data-slot="heatmap-legend-swatch"
          data-level={level}
          className={slots.swatch()}
          style={alphaStyle(alphaFor(level, steps))}
        />
      ))}
      {highLabel != null && (
        <span data-slot="heatmap-legend-label" className={slots.legendLabel({ class: "ms-1" })}>
          {highLabel}
        </span>
      )}
    </div>
  )
}
