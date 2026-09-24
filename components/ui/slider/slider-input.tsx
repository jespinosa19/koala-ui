"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, type ControlSize } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

/**
 * SliderInput: the inspector slider. An editable number box beside a slim rail with a pill
 * thumb, the pair you find in video, design and audio tools ("Feather 0 ▮────"). The rail
 * opens to the full control height under the pointer. Where `Slider` is a settings/filter
 * rail with a round knob, this one is a form control: the row shares the 32/36/40 height scale
 * with Input (and that whole height is the track's hit area), so a column of them lines up
 * with a panel.
 *
 * Multi-part (`SliderInput` root + `SliderInputValue` + `SliderInputTrack`) because the two
 * halves are independently droppable: a track alone reads as a compact fader, a value box alone
 * is a scrubbable number. The root owns the single number and shares it through Context.
 *
 * Both halves edit the value: drag or click the track (Radix Slider: arrows, Shift+arrows,
 * PageUp/PageDown, Home/End), type into the box (arrows step, Shift steps ×10, Enter commits,
 * Escape reverts), or drag sideways on the box to scrub it.
 */
export const sliderInputVariants = tv({
  slots: {
    root: [
      "flex w-full items-stretch gap-1.5",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    ],
    // The number box. A control, so it paints a fill (Fill is elevation: controls rise), the
    // same ink wash as the track so the pair reads as one instrument.
    value: [
      "relative flex shrink-0 items-center gap-0.5 rounded-md bg-foreground/6",
      // Resting cursor advertises the scrub; once the field is focused it is plain text entry.
      "cursor-ew-resize has-[input:focus]:cursor-text",
      "transition-[background-color,box-shadow] duration-fast ease-out",
      "hover:bg-foreground/8",
      // No border to recolour, so the focus edge is a 1px inset outline (follows the radius and
      // leaves box-shadow free for the soft `brand-ring` halo, the same pair as Input's focus).
      "focus-within:bg-foreground/8 focus-within:outline focus-within:outline-brand focus-within:-outline-offset-1 focus-within:brand-ring",
      "autofill-tint",
    ],
    input: [
      // Sized to its content so a unit reads "80%", not "80   %". Where `field-sizing` isn't
      // supported the input just shrinks to the box (`flex-initial`) and the unit sits at the end.
      "h-full min-w-[1ch] flex-initial field-sizing-content bg-transparent outline-none",
      // Typed text is 14px at every size (16px on touch so iOS doesn't zoom).
      "text-sm pointer-coarse:text-base tabular-nums text-foreground",
      "cursor-[inherit] autofill-clear",
      "selection:bg-brand/25",
    ],
    suffix: "shrink-0 select-none text-sm tabular-nums text-muted-foreground",
    // The track is the Radix root and stays the full control height, invisible: the whole row
    // is the hit target (a click anywhere jumps the thumb there and the drag continues), while
    // the visible rail inside it is slim.
    track: [
      "group/track relative flex min-w-0 flex-1 touch-none select-none items-center cursor-pointer",
      // Width of the thumb's box (the pill plus its transparent inset). Shared with the fill so
      // the fill always ends under the pill's centre, wherever Radix places it.
      "[--slider-input-thumb:calc(var(--spacing)*4)]",
    ],
    // The visible rail: slim at rest, and while the track is hovered, dragged or keyboard-focused
    // it opens to the full control height, level with the value box, so it becomes a field the
    // moment it's the thing you're moving. Centred on the row, so it grows both ways and the row
    // never shifts. Height (not scaleY) so the rounded ends and the pill inside keep their shape;
    // `duration-base` because the travel is ~2x, too far for the fast step to read as smooth.
    rail: [
      "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2",
      "overflow-hidden rounded-md bg-foreground/6",
      "transition-[height,background-color] duration-base ease-out",
      "group-hover/track:bg-foreground/8 group-active/track:bg-foreground/8",
    ],
    // The filled share, from the left edge to the pill's centre. Radix keeps the thumb inside
    // the track by offsetting it half its width at the ends, so the centre sits at
    // `thumb/2 + (100% - thumb) * fraction`, and the fill copies that formula exactly.
    fill: [
      "absolute inset-y-0 left-0",
      "w-[calc(var(--slider-input-thumb)/2_+_(100%_-_var(--slider-input-thumb))_*_var(--slider-input-fraction))]",
    ],
    // The thumb box is wider than the pill: the transparent sides inset the pill from the
    // rail's rounded ends, so at 0 and 100 it never kisses the edge. Its height tracks the
    // rail's with the same timing: inset 3px on the slim rail, 6-8px on the open one.
    thumb: [
      "group/thumb flex w-(--slider-input-thumb) items-center justify-center",
      "cursor-pointer outline-none",
      "transition-[height] duration-base ease-out",
    ],
    pill: [
      "h-full w-1 rounded-full",
      "transition-[background-color,box-shadow] duration-fast ease-out",
      "group-focus-visible/thumb:ring-2 group-focus-visible/thumb:ring-brand",
      "group-focus-visible/thumb:ring-offset-1 group-focus-visible/thumb:ring-offset-background",
    ],
  },
  variants: {
    // Rail at rest (16/18/20) → open (hover, drag, keyboard focus) at the full row height
    // (32/36/40), the same as the value box. The pill goes 10/12/14 → 20/22/24. The row is the
    // hit area in both states.
    size: {
      sm: {
        root: "h-8",
        value: "w-16 px-2.5",
        rail: "h-4 group-hover/track:h-8 group-active/track:h-8 group-has-[:focus-visible]/track:h-8",
        thumb: "h-2.5 group-hover/track:h-5 group-active/track:h-5 group-has-[:focus-visible]/track:h-5",
      },
      md: {
        root: "h-9",
        value: "w-18 px-3",
        rail: "h-4.5 group-hover/track:h-9 group-active/track:h-9 group-has-[:focus-visible]/track:h-9",
        thumb: "h-3 group-hover/track:h-5.5 group-active/track:h-5.5 group-has-[:focus-visible]/track:h-5.5",
      },
      lg: {
        root: "h-10",
        value: "w-20 px-3",
        rail: "h-5 group-hover/track:h-10 group-active/track:h-10 group-has-[:focus-visible]/track:h-10",
        thumb: "h-3.5 group-hover/track:h-6 group-active/track:h-6 group-has-[:focus-visible]/track:h-6",
      },
    },
    // `default` stays neutral chrome (an inspector is a wall of these; colour would shout).
    // `brand` tints the fill and the pill with the accent for the one slider that matters.
    variant: {
      default: {
        fill: "bg-foreground/8",
        pill: "bg-muted-foreground group-hover/track:bg-foreground group-active/track:bg-foreground",
      },
      brand: {
        fill: "bg-brand/15",
        pill: "bg-brand",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
})

type SliderInputSlots = ReturnType<typeof sliderInputVariants>

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Decimal places implied by `step` (0.25 → 2), so arithmetic and display stay free of float drift. */
function decimalsOf(step: number): number {
  const s = String(step)
  const dot = s.indexOf(".")
  return dot === -1 ? 0 : s.length - dot - 1
}

/** Clamp to the bounds and snap to the step grid anchored at `min`. */
function normalize(value: number, min: number, max: number, step: number, decimals: number) {
  const snapped = min + Math.round((value - min) / step) * step
  const clamped = Math.min(max, Math.max(min, snapped))
  return Number(clamped.toFixed(decimals))
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SliderInputContextValue {
  slots: SliderInputSlots
  value: number
  min: number
  max: number
  step: number
  decimals: number
  disabled: boolean
  /** Normalizes, then publishes: every part funnels its edits through here. */
  setValue: (next: number) => void
  /** Fires `onValueCommit` once an interaction ends (drag release, blur, Enter). */
  commit: (next: number) => void
  inputId: string | undefined
  label: string | undefined
  labelledBy: string | undefined
  describedBy: string | undefined
  name: string | undefined
}

const [SliderInputProvider, useSliderInputContext] =
  createContext<SliderInputContextValue>("SliderInput")

// ─── SliderInput (root) ───────────────────────────────────────────────────────

export interface SliderInputProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">,
    Omit<VariantProps<typeof sliderInputVariants>, "size"> {
  /** Controlled value. */
  value?: number
  /** Initial value when uncontrolled. Defaults to `min`. */
  defaultValue?: number
  /** Fires on every change: each drag frame, each keystroke that parses, each scrub step. */
  onValueChange?: (value: number) => void
  /** Fires once when an interaction ends: drag release, blur, or Enter in the box. */
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  /** Snap increment for the track, the arrow keys and the scrub. Defaults to `1`. */
  step?: number
  disabled?: boolean
  /** Control height, shared with Input: `sm` 32, `md` 36, `lg` 40. Defaults from density. */
  size?: ControlSize
  /** Form field name, submitted through Radix's hidden input on the track. */
  name?: string
  /**
   * Goes to the number box so a `<label htmlFor>` focuses it (the thumb is a `span`, which
   * `htmlFor` can't name). Inside a `Field` the generated id is used automatically.
   */
  id?: string
}

export function SliderInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  size,
  variant,
  name,
  id,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SliderInputProps) {
  const field = useFieldContext()
  const resolvedSize = useControlSize(size)
  const slots = sliderInputVariants({ size: resolvedSize, variant })
  const decimals = React.useMemo(() => decimalsOf(step), [step])

  const isControlled = valueProp !== undefined
  const [internal, setInternal] = React.useState(() => defaultValue ?? min)
  const value = isControlled ? valueProp : internal
  const resolvedDisabled = disabled ?? field?.disabled ?? false

  const setValue = React.useCallback(
    (next: number) => {
      const normalized = normalize(next, min, max, step, decimals)
      if (normalized === value) return
      if (!isControlled) setInternal(normalized)
      onValueChange?.(normalized)
    },
    [decimals, isControlled, max, min, onValueChange, step, value],
  )

  const commit = React.useCallback(
    (next: number) => onValueCommit?.(normalize(next, min, max, step, decimals)),
    [decimals, max, min, onValueCommit, step],
  )

  return (
    <SliderInputProvider
      slots={slots}
      value={value}
      min={min}
      max={max}
      step={step}
      decimals={decimals}
      disabled={resolvedDisabled}
      setValue={setValue}
      commit={commit}
      inputId={id ?? field?.id}
      label={ariaLabel}
      labelledBy={ariaLabelledBy ?? field?.labelledBy}
      describedBy={ariaDescribedBy ?? field?.describedBy}
      name={name}
    >
      <div
        role="group"
        data-slot="slider-input"
        data-disabled={resolvedDisabled ? "" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? field?.labelledBy}
        className={slots.root({ className })}
        {...props}
      >
        {/* No parts passed: the canonical pair, value box first. */}
        {children ?? (
          <>
            <SliderInputValue />
            <SliderInputTrack />
          </>
        )}
      </div>
    </SliderInputProvider>
  )
}

// ─── SliderInputValue ─────────────────────────────────────────────────────────

/** Pointer travel before a press on the box becomes a scrub instead of a click-to-edit. */
const SCRUB_THRESHOLD = 3
/** Pixels of scrub that sweep the full range: wide enough to land on a single step. */
const SCRUB_SPAN = 240

export interface SliderInputValueProps
  extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type" | "size"> {
  /** Unit painted after the number, muted (`%`, `px`, `°`). Not part of the typed value. */
  suffix?: React.ReactNode
  /** Format the number while the box isn't being edited. Defaults to the step's precision. */
  formatValue?: (value: number) => string
  /** Classes for the box around the input (the input itself takes `className`). */
  boxClassName?: string
}

export function SliderInputValue({
  suffix,
  formatValue,
  boxClassName,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: SliderInputValueProps) {
  const ctx = useSliderInputContext("SliderInputValue")
  const { slots, value, min, max, step, decimals, disabled, setValue, commit } = ctx
  const inputRef = React.useRef<HTMLInputElement>(null)

  // While the box has focus it edits a string draft, so partial input ("", "-", "1.") survives;
  // outside it shows the formatted value. `null` = not editing.
  const [draft, setDraft] = React.useState<string | null>(null)
  const display = draft ?? (formatValue ? formatValue(value) : value.toFixed(decimals))

  // Scrub gesture bookkeeping. A ref, not state: it changes on every pointermove.
  const scrub = React.useRef<{ x: number; start: number; active: boolean; id: number } | null>(null)

  function parse(raw: string): number | null {
    const n = Number(raw.trim())
    return raw.trim() === "" || Number.isNaN(n) ? null : n
  }

  function finishEditing(revert: boolean) {
    if (draft !== null && !revert) {
      const parsed = parse(draft)
      if (parsed !== null) {
        setValue(parsed)
        commit(parsed)
      }
    }
    setDraft(null)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return
    setDraft(raw)
    // Live-apply anything that already parses so the track follows the typing.
    const parsed = parse(raw)
    if (parsed !== null && parsed >= min && parsed <= max) setValue(parsed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const base = parse(draft ?? "") ?? value
      const next = normalize(
        base + (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1),
        min,
        max,
        step,
        decimals,
      )
      setValue(next)
      commit(next)
      setDraft(next.toFixed(decimals))
      // Keep the whole number selected so the next keystroke replaces it.
      requestAnimationFrame(() => inputRef.current?.select())
    } else if (e.key === "Enter") {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === "Escape") {
      e.preventDefault()
      finishEditing(true)
      // Blur after the draft is dropped so blur doesn't commit it.
      requestAnimationFrame(() => inputRef.current?.blur())
    }
  }

  // Press on the unfocused box: wait to see whether it's a click (edit) or a drag (scrub).
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || e.button !== 0 || document.activeElement === inputRef.current) return
    e.preventDefault() // hold focus back until we know it's a click
    e.currentTarget.setPointerCapture(e.pointerId)
    scrub.current = { x: e.clientX, start: value, active: false, id: e.pointerId }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = scrub.current
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    if (!s.active && Math.abs(dx) < SCRUB_THRESHOLD) return
    s.active = true
    setValue(s.start + (dx / SCRUB_SPAN) * (max - min))
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = scrub.current
    if (!s || s.id !== e.pointerId) return
    scrub.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (s.active) {
      commit(value)
    } else {
      // A plain click: enter edit mode (focus selects the number, ready to be retyped).
      inputRef.current?.focus()
    }
  }

  return (
    <div
      data-slot="slider-input-value"
      className={slots.value({ className: boxClassName })}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        scrub.current = null
      }}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode={decimals > 0 || min < 0 ? "decimal" : "numeric"}
        autoComplete="off"
        spellCheck={false}
        role="spinbutton"
        id={ctx.inputId}
        aria-label={ctx.label}
        aria-labelledby={ctx.label ? undefined : ctx.labelledBy}
        aria-describedby={ctx.describedBy}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        data-slot="slider-input-field"
        className={slots.input({ className })}
        value={display}
        {...props}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          setDraft(value.toFixed(decimals))
          // After the draft renders: swapping the formatted text for the raw number would
          // otherwise drop a selection made now.
          requestAnimationFrame(() => inputRef.current?.select())
          onFocus?.(e)
        }}
        onBlur={(e) => {
          finishEditing(false)
          onBlur?.(e)
        }}
      />
      {suffix != null && (
        <span data-slot="slider-input-suffix" className={slots.suffix()} aria-hidden>
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── SliderInputTrack ─────────────────────────────────────────────────────────

/** The value, bounds and step come from the root; the track takes the rest of Radix Root. */
export type SliderInputTrackProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  | "asChild"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onValueCommit"
  | "min"
  | "max"
  | "step"
  | "disabled"
  | "orientation"
  | "name"
>

export function SliderInputTrack({ className, style, ...props }: SliderInputTrackProps) {
  const ctx = useSliderInputContext("SliderInputTrack")
  const { slots, value, min, max, step, disabled, setValue, commit } = ctx
  const fraction = max === min ? 0 : (value - min) / (max - min)

  return (
    <SliderPrimitive.Root
      data-slot="slider-input-track"
      className={slots.track({ className })}
      style={{ ...style, "--slider-input-fraction": fraction } as React.CSSProperties}
      value={[value]}
      onValueChange={([next]) => setValue(next)}
      onValueCommit={([next]) => commit(next)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      name={ctx.name}
      {...props}
    >
      <span data-slot="slider-input-rail" className={slots.rail()} aria-hidden>
        <span data-slot="slider-input-fill" className={slots.fill()} />
      </span>
      <SliderPrimitive.Thumb
        data-slot="slider-input-thumb"
        className={slots.thumb()}
        aria-label={ctx.label}
        aria-labelledby={ctx.label ? undefined : ctx.labelledBy}
        aria-describedby={ctx.describedBy}
      >
        <span data-slot="slider-input-pill" className={slots.pill()} />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
}
