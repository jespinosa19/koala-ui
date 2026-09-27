"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
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
 * Multi-part (`SliderInput` root + `SliderInputValue` + `SliderInputTrack` + `SliderInputLabel`)
 * because every part is independently droppable: a track alone reads as a compact fader, a value
 * box alone is a scrubbable number. The root owns the single number and shares it through Context.
 *
 * Give the track children and it becomes the field: `SliderInputLabel` sits inside it on the
 * left, `SliderInputValue` turns into a read-only readout on the right, and the fill paints as a
 * raised chip that ends at the pill, the generation-panel slider ("Strength ▮ 60%").
 *
 * Both halves edit the value: drag or click the track (Radix Slider: arrows, Shift+arrows,
 * PageUp/PageDown, Home/End), type into the box (arrows step, Shift steps ×10, Enter commits,
 * Escape reverts), or drag sideways on the box to scrub it. A drag past either end stretches the
 * rail a few pixels, rubber-band style, and it eases back on release.
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
    // The track is the Radix root and stays the full control height: the whole row is the hit
    // target (a click anywhere jumps the thumb there and the drag continues). What paints inside
    // it depends on `field`.
    track: [
      "group/track relative flex min-w-0 flex-1 touch-none select-none items-center",
      // How far a drag past the left or right end has stretched the rail: 0 at rest, written by
      // the pointer handlers while a drag pulls beyond an end.
      "[--slider-input-pull-l:0px] [--slider-input-pull-r:0px]",
    ],
    // The visible rail, centred on the row. Its horizontal insets follow the pull, so a drag past
    // an end stretches it that way; the release eases it home.
    rail: [
      "pointer-events-none absolute top-1/2 -translate-y-1/2",
      "left-[calc(var(--slider-input-pull-l)*-1)] right-[calc(var(--slider-input-pull-r)*-1)]",
      "overflow-hidden rounded-md bg-foreground/6",
      "transition-[height,background-color,box-shadow,left,right] duration-base ease-out",
      // While a drag is in hand the stretch tracks the pointer 1:1, so left/right drop out.
      "group-data-[dragging]/track:transition-[height,background-color,box-shadow]",
      "group-hover/track:bg-foreground/8 group-active/track:bg-foreground/8",
    ],
    // The filled share. Radix keeps the thumb inside the track by offsetting it half its width at
    // the ends, so the pill's centre sits at `thumb/2 + (100% - thumb) * fraction`, and the fill
    // copies that formula (to the pill's centre, or to the thumb box's far edge in a field).
    fill: [
      "absolute inset-y-0 left-0",
      "transition-[background-color] duration-fast ease-out",
    ],
    ticks: "absolute inset-0",
    // One mark per stop, placed with the pill's own formula so the pill lands on it exactly.
    // Inside the fill a mark only shows while the track is in hand; at rest the filled share
    // reads as one clean surface.
    tick: [
      "absolute top-1/2 h-1/4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/10",
      "left-[calc(var(--slider-input-thumb)/2_+_(100%_-_var(--slider-input-thumb))_*_var(--slider-input-tick))]",
      "transition-opacity duration-fast ease-out",
      "data-[filled]:opacity-0",
      "group-hover/track:data-[filled]:opacity-100 group-active/track:data-[filled]:opacity-100",
      "group-has-[:focus-visible]/track:data-[filled]:opacity-100",
    ],
    // The thumb box is wider than the pill: the transparent sides inset the pill from the
    // rail's rounded ends, so at 0 and 100 it never kisses the edge. It rides the pull too, so
    // the pill stays at the end of a stretched rail.
    thumb: [
      "group/thumb flex w-(--slider-input-thumb) items-center justify-center outline-none",
      "translate-x-[calc(var(--slider-input-pull-r)-var(--slider-input-pull-l))]",
      "transition-[height,translate] duration-base ease-out",
      "group-data-[dragging]/track:transition-[height]",
    ],
    // `covered` (set when the pill passes under the label or the readout) fades it so it never
    // strikes through text; the fill's edge still shows where the value is.
    pill: [
      "h-full w-1 rounded-full",
      "transition-[background-color,box-shadow,opacity] duration-fast ease-out",
      "group-data-[covered]/thumb:opacity-0",
    ],
    // Field parts. Both inset by the thumb box, which in a field equals Input's side padding, so
    // their text lines up with an Input's above and below, and the pill at either end sits in
    // that padding, clear of the text. They ride the pull on their own side.
    label: [
      "pointer-events-none absolute left-(--slider-input-thumb) top-1/2 max-w-2/3 -translate-y-1/2 truncate",
      "text-sm text-muted-foreground",
      "translate-x-[calc(var(--slider-input-pull-l)*-1)]",
      "transition-[translate] duration-base ease-out group-data-[dragging]/track:transition-none",
    ],
    readout: [
      "pointer-events-none absolute right-(--slider-input-thumb) top-1/2 -translate-y-1/2",
      "flex items-baseline gap-0.5 whitespace-nowrap",
      "text-sm tabular-nums text-foreground",
      "translate-x-(--slider-input-pull-r)",
      "transition-[translate] duration-base ease-out group-data-[dragging]/track:transition-none",
    ],
  },
  variants: {
    size: {
      sm: { root: "h-8", value: "w-16 px-2.5" },
      md: { root: "h-9", value: "w-18 px-3" },
      lg: { root: "h-10", value: "w-20 px-3" },
    },
    // `default` stays neutral chrome (an inspector is a wall of these; colour would shout).
    // `brand` tints the fill and the pill with the accent for the one slider that matters.
    // The colours themselves live in the compounds, per layout.
    variant: {
      default: {},
      brand: {},
    },
    // Set by the track itself: `true` when it has parts inside (a label, a readout), which makes
    // the track the field. Not a prop.
    field: {
      // Slim rail beside the number box. The rail opens to the full row height while hovered,
      // dragged or keyboard-focused (heights per size in the compounds).
      false: {
        // Width of the thumb's box (the pill plus its transparent inset). Shared with the fill
        // and the ticks so both end under the pill's centre, wherever Radix places it.
        track: "cursor-pointer [--slider-input-thumb:calc(var(--spacing)*4)]",
        fill: "w-[calc(var(--slider-input-thumb)/2_+_(100%_-_var(--slider-input-thumb))_*_var(--slider-input-fraction))]",
        thumb: "cursor-pointer",
        pill: [
          "group-focus-visible/thumb:ring-2 group-focus-visible/thumb:ring-brand",
          "group-focus-visible/thumb:ring-offset-1 group-focus-visible/thumb:ring-offset-background",
        ],
      },
      // The track is the field: a full-height wash like the number box, a raised chip for the
      // fill, and one focus edge around the whole field (the pill is too small to carry a ring).
      true: {
        track: "cursor-ew-resize",
        rail: [
          "h-full",
          "group-has-[:focus-visible]/track:outline group-has-[:focus-visible]/track:outline-brand",
          "group-has-[:focus-visible]/track:-outline-offset-1 group-has-[:focus-visible]/track:brand-ring",
        ],
        // Ends at the thumb box's far edge, so the pill rides inside the chip's end. Flush with
        // the rail on three sides, so it takes the rail's radius, and the rail's overflow clips
        // its shadow to the one edge that moves.
        fill: "w-[calc(var(--slider-input-thumb)_+_(100%_-_var(--slider-input-thumb))_*_var(--slider-input-fraction))] rounded-md shadow-xs",
        // Marks fade out where the label and the readout sit (their edges are measured into these
        // two variables) so a mark never strikes through text.
        ticks:
          "[mask-image:linear-gradient(to_right,transparent_calc(var(--slider-input-label-end,0px)+var(--spacing)*1),black_calc(var(--slider-input-label-end,0px)+var(--spacing)*6),black_calc(var(--slider-input-value-start,100%)-var(--spacing)*6),transparent_calc(var(--slider-input-value-start,100%)-var(--spacing)*1))]",
        thumb: "cursor-[inherit]",
      },
    },
  },
  compoundVariants: [
    // Slim rail at rest (16/18/20) → open (hover, drag, keyboard focus) at the full row height
    // (32/36/40), the same as the value box. The pill goes 10/12/14 → 20/22/24. `duration-base`
    // because the travel is ~2x, too far for the fast step to read as smooth.
    {
      field: false,
      size: "sm",
      class: {
        rail: "h-4 group-hover/track:h-8 group-active/track:h-8 group-has-[:focus-visible]/track:h-8",
        thumb: "h-2.5 group-hover/track:h-5 group-active/track:h-5 group-has-[:focus-visible]/track:h-5",
      },
    },
    {
      field: false,
      size: "md",
      class: {
        rail: "h-4.5 group-hover/track:h-9 group-active/track:h-9 group-has-[:focus-visible]/track:h-9",
        thumb: "h-3 group-hover/track:h-5.5 group-active/track:h-5.5 group-has-[:focus-visible]/track:h-5.5",
      },
    },
    {
      field: false,
      size: "lg",
      class: {
        rail: "h-5 group-hover/track:h-10 group-active/track:h-10 group-has-[:focus-visible]/track:h-10",
        thumb: "h-3.5 group-hover/track:h-6 group-active/track:h-6 group-has-[:focus-visible]/track:h-6",
      },
    },
    // Field: the thumb box equals Input's side padding (10/12/14), so the pill sits centred in
    // that gutter at either end. The pill is 12/14/16, about 40% of the row.
    { field: true, size: "sm", class: { track: "[--slider-input-thumb:calc(var(--spacing)*2.5)]", thumb: "h-3" } },
    { field: true, size: "md", class: { track: "[--slider-input-thumb:calc(var(--spacing)*3)]", thumb: "h-3.5" } },
    { field: true, size: "lg", class: { track: "[--slider-input-thumb:calc(var(--spacing)*3.5)]", thumb: "h-4" } },
    // Colours. Beside a number box the pill is the value's mark, so it reads dark; inside a field
    // it sits next to text, so it stays a quiet grey and the chip carries the value instead.
    {
      field: false,
      variant: "default",
      class: {
        fill: "bg-foreground/8",
        pill: "bg-muted-foreground group-hover/track:bg-foreground group-active/track:bg-foreground",
      },
    },
    { field: false, variant: "brand", class: { fill: "bg-brand/15", pill: "bg-brand" } },
    {
      field: true,
      variant: "default",
      class: {
        fill: "bg-foreground/5 group-hover/track:bg-foreground/6 group-active/track:bg-foreground/7",
        pill: "bg-foreground/25 group-hover/track:bg-foreground/45 group-active/track:bg-foreground/45",
      },
    },
    {
      field: true,
      variant: "brand",
      class: {
        fill: "bg-brand/12 group-hover/track:bg-brand/16 group-active/track:bg-brand/20",
        pill: "bg-brand",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    variant: "default",
    field: false,
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

/** Point a consumer's ref (callback or object) at the same node as an internal one. */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) ref.current = node
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SliderInputContextValue {
  slots: SliderInputSlots
  size: ControlSize
  variant: VariantProps<typeof sliderInputVariants>["variant"]
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
  /** Root-level text for a value: what the readout shows and what the thumb announces. */
  formatValue: ((value: number) => string) | undefined
  inputId: string | undefined
  label: string | undefined
  labelledBy: string | undefined
  describedBy: string | undefined
  name: string | undefined
}

const [SliderInputProvider, useSliderInputContext] =
  createContext<SliderInputContextValue>("SliderInput")

/**
 * Present only inside a track that has children (the field layout). Optional on purpose:
 * `SliderInputValue` reads it to decide between the editable box and the in-track readout.
 */
interface SliderInputFieldContextValue {
  slots: SliderInputSlots
  labelId: string
  /** The label and readout register their node so the track can measure where text sits. */
  setLabelEl: (node: HTMLSpanElement | null) => void
  setReadoutEl: (node: HTMLSpanElement | null) => void
}

const SliderInputFieldContext = React.createContext<SliderInputFieldContextValue | null>(null)
SliderInputFieldContext.displayName = "SliderInputFieldContext"

// ─── SliderInput (root) ───────────────────────────────────────────────────────

export interface SliderInputProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">,
    Omit<VariantProps<typeof sliderInputVariants>, "size" | "field"> {
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
   * Text for a value, used by the value part and announced by the thumb. Name the stops of a
   * discrete scale here (`(v) => ["1K", "2K", "4K"][v]`) so a screen reader hears "2K", not "1".
   */
  formatValue?: (value: number) => string
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
  formatValue,
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
      size={resolvedSize}
      variant={variant}
      value={value}
      min={min}
      max={max}
      step={step}
      decimals={decimals}
      disabled={resolvedDisabled}
      setValue={setValue}
      commit={commit}
      formatValue={formatValue}
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
  /** Format the number while the box isn't being edited. Defaults to the root's `formatValue`, then the step's precision. */
  formatValue?: (value: number) => string
  /** Classes for the box around the input (the input itself takes `className`). */
  boxClassName?: string
}

/**
 * The value. Beside the track it is an editable number box; inside a track (the field layout) it
 * is a read-only readout, since the whole field is already the thing you drag.
 */
export function SliderInputValue(props: SliderInputValueProps) {
  const fieldTrack = React.useContext(SliderInputFieldContext)
  return fieldTrack ? (
    <SliderInputReadout {...props} fieldTrack={fieldTrack} />
  ) : (
    <SliderInputBox {...props} />
  )
}

function SliderInputBox({
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
  const format = formatValue ?? ctx.formatValue

  // While the box has focus it edits a string draft, so partial input ("", "-", "1.") survives;
  // outside it shows the formatted value. `null` = not editing.
  const [draft, setDraft] = React.useState<string | null>(null)
  const display = draft ?? (format ? format(value) : value.toFixed(decimals))

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

/** The in-track readout. Hidden from assistive tech: the thumb announces the same value. */
function SliderInputReadout({
  suffix,
  formatValue,
  boxClassName,
  className,
  fieldTrack,
}: SliderInputValueProps & { fieldTrack: SliderInputFieldContextValue }) {
  const ctx = useSliderInputContext("SliderInputValue")
  const format = formatValue ?? ctx.formatValue
  // Pulled apart so the compiler doesn't read the whole context as a ref (one field is a ref callback).
  const { slots, setReadoutEl } = fieldTrack

  return (
    <span
      ref={setReadoutEl}
      data-slot="slider-input-readout"
      aria-hidden
      className={slots.readout({ className: cn(boxClassName, className) })}
    >
      {format ? format(ctx.value) : ctx.value.toFixed(ctx.decimals)}
      {suffix != null && (
        <span data-slot="slider-input-suffix" className={slots.suffix()}>
          {suffix}
        </span>
      )}
    </span>
  )
}

// ─── SliderInputLabel ─────────────────────────────────────────────────────────

export type SliderInputLabelProps = React.ComponentProps<"span">

/**
 * The name of the setting, painted inside the track on the left. It names the thumb for
 * assistive tech (it wins over a surrounding `Field` label, and loses to an explicit `aria-label`).
 * Only valid inside `SliderInputTrack`.
 */
export function SliderInputLabel({ className, ref, ...props }: SliderInputLabelProps) {
  const fieldTrack = React.useContext(SliderInputFieldContext)
  if (!fieldTrack) {
    throw new Error("`SliderInputLabel` must be used within `SliderInputTrack`")
  }
  const { setLabelEl } = fieldTrack

  const composedRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      setLabelEl(node)
      assignRef(ref, node)
    },
    [ref, setLabelEl],
  )

  return (
    <span
      id={fieldTrack.labelId}
      data-slot="slider-input-label"
      className={fieldTrack.slots.label({ className })}
      {...props}
      ref={composedRef}
    />
  )
}

// ─── SliderInputTrack ─────────────────────────────────────────────────────────

/** Most pixels the rail stretches while a drag pulls past an end. */
const MAX_PULL = 6
/** Pointer travel past the end that earns ~63% of the stretch: the rubber band's softness. */
const PULL_SOFTNESS = 40
/** Most marks `ticks` paints; past this they blur into a band, so none are drawn. */
const MAX_TICKS = 64
/** Room kept between the pill's centre and text in the field: half the pill plus a hairline. */
const PILL_CLEARANCE = 4

/** Every interior stop that gets a mark (the two ends never do: the rail's edges mark them). */
function tickStops(
  ticks: boolean | number | undefined,
  min: number,
  max: number,
  step: number,
): number[] {
  if (!ticks || max <= min) return []
  const every = ticks === true ? step : ticks
  if (!(every > 0)) return []
  const count = Math.floor((max - min) / every + 1e-9)
  if (count > MAX_TICKS) return []
  const decimals = Math.max(decimalsOf(step), decimalsOf(every))
  const stops: number[] = []
  for (let i = 1; i <= count; i++) {
    const stop = Number((min + i * every).toFixed(decimals))
    if (stop < max) stops.push(stop)
  }
  return stops
}

/** Where things sit inside a field track, in px from its left edge. */
interface TrackGeometry {
  width: number
  thumb: number
  label: [number, number] | null
  readout: [number, number] | null
}

function sameSpan(a: [number, number] | null, b: [number, number] | null) {
  return a === b || (a != null && b != null && a[0] === b[0] && a[1] === b[1])
}

function spanOf(node: HTMLElement | null): [number, number] | null {
  return node ? [node.offsetLeft, node.offsetLeft + node.offsetWidth] : null
}

/** The value, bounds and step come from the root; the track takes the rest of Radix Root. */
export interface SliderInputTrackProps
  extends Omit<
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
  > {
  /**
   * Marks along the rail: `true` for one at every `step`, or a number for one every that many
   * units (`ticks={10}` on a 0-100 scale). Past 64 marks none are drawn.
   */
  ticks?: boolean | number
}

export function SliderInputTrack({
  className,
  style,
  children,
  ticks,
  ref,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  ...props
}: SliderInputTrackProps) {
  const ctx = useSliderInputContext("SliderInputTrack")
  const { size, variant, value, min, max, step, disabled, setValue, commit } = ctx
  const fraction = max === min ? 0 : (value - min) / (max - min)

  // Parts inside the track make it the field. `toArray` drops null/false, so a conditional part
  // that renders nothing leaves the slim rail in place.
  const field = React.Children.toArray(children).length > 0
  // Memoised: the slots feed the field context, and a fresh object would re-render every part.
  const slots = React.useMemo(
    () => sliderInputVariants({ size, variant, field }),
    [size, variant, field],
  )

  const labelId = React.useId()
  const [labelEl, setLabelEl] = React.useState<HTMLSpanElement | null>(null)
  const [readoutEl, setReadoutEl] = React.useState<HTMLSpanElement | null>(null)
  const trackRef = React.useRef<HTMLSpanElement | null>(null)
  const thumbRef = React.useRef<HTMLSpanElement | null>(null)
  const [geometry, setGeometry] = React.useState<TrackGeometry | null>(null)

  // Measure where the label and the readout sit, so the ticks can fade under them and the pill
  // can step aside when it passes beneath. The readout's width moves with the value; a
  // ResizeObserver on it catches that as well as the track resizing.
  React.useEffect(() => {
    const track = trackRef.current
    if (!field || !track) return
    const observer = new ResizeObserver(() => {
      const next: TrackGeometry = {
        width: track.clientWidth,
        thumb: thumbRef.current?.offsetWidth ?? 0,
        label: spanOf(labelEl),
        readout: spanOf(readoutEl),
      }
      setGeometry((prev) =>
        prev &&
        prev.width === next.width &&
        prev.thumb === next.thumb &&
        sameSpan(prev.label, next.label) &&
        sameSpan(prev.readout, next.readout)
          ? prev
          : next,
      )
    })
    observer.observe(track)
    if (thumbRef.current) observer.observe(thumbRef.current)
    if (labelEl) observer.observe(labelEl)
    if (readoutEl) observer.observe(readoutEl)
    return () => observer.disconnect()
  }, [field, labelEl, readoutEl])

  const covered = React.useMemo(() => {
    if (!field || !geometry) return false
    const centre = geometry.thumb / 2 + (geometry.width - geometry.thumb) * fraction
    return [geometry.label, geometry.readout].some(
      (span) => span != null && centre > span[0] - PILL_CLEARANCE && centre < span[1] + PILL_CLEARANCE,
    )
  }, [field, fraction, geometry])

  const composedRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      trackRef.current = node
      assignRef(ref, node)
    },
    [ref],
  )

  // ── Elastic ends. A ref, not state: it changes on every pointermove, and the stretch is
  // written straight to the track's style so the drag never waits on a render.
  const drag = React.useRef<{ id: number; still: boolean } | null>(null)

  function pull(track: HTMLElement, overshoot: number) {
    const amount = MAX_PULL * (1 - Math.exp(-Math.abs(overshoot) / PULL_SOFTNESS))
    track.style.setProperty("--slider-input-pull-r", `${overshoot > 0 ? amount : 0}px`)
    track.style.setProperty("--slider-input-pull-l", `${overshoot < 0 ? amount : 0}px`)
  }

  function release(e: React.PointerEvent<HTMLSpanElement>) {
    if (drag.current?.id !== e.pointerId) return
    drag.current = null
    const track = e.currentTarget
    // Back to the class defaults (0); with the drag flag gone, left/right transition again,
    // so the rail eases home.
    track.removeAttribute("data-dragging")
    track.style.removeProperty("--slider-input-pull-r")
    track.style.removeProperty("--slider-input-pull-l")
  }

  const fieldContext = React.useMemo<SliderInputFieldContextValue>(
    () => ({ slots, labelId, setLabelEl, setReadoutEl }),
    [slots, labelId],
  )

  const tickValues = tickStops(ticks, min, max, step)

  return (
    <SliderPrimitive.Root
      ref={composedRef}
      data-slot="slider-input-track"
      className={slots.track({ className })}
      style={
        {
          ...style,
          "--slider-input-fraction": fraction,
          ...(geometry?.label && { "--slider-input-label-end": `${geometry.label[1]}px` }),
          ...(geometry?.readout && { "--slider-input-value-start": `${geometry.readout[0]}px` }),
        } as React.CSSProperties
      }
      value={[value]}
      onValueChange={([next]) => setValue(next)}
      onValueCommit={([next]) => commit(next)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      name={ctx.name}
      {...props}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        if (e.defaultPrevented || disabled || e.button !== 0) return
        drag.current = {
          id: e.pointerId,
          // Reduced motion keeps the drag, drops the stretch.
          still: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        }
        e.currentTarget.setAttribute("data-dragging", "")
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        const d = drag.current
        if (!d || d.id !== e.pointerId || d.still) return
        const rect = e.currentTarget.getBoundingClientRect()
        const overshoot =
          e.clientX > rect.right ? e.clientX - rect.right : e.clientX < rect.left ? e.clientX - rect.left : 0
        pull(e.currentTarget, overshoot)
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        release(e)
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e)
        release(e)
      }}
      onLostPointerCapture={(e) => {
        onLostPointerCapture?.(e)
        release(e)
      }}
    >
      <span data-slot="slider-input-rail" className={slots.rail()} aria-hidden>
        <span data-slot="slider-input-fill" className={slots.fill()} />
        {tickValues.length > 0 && (
          <span data-slot="slider-input-ticks" className={slots.ticks()}>
            {tickValues.map((stop) => (
              <span
                key={stop}
                data-slot="slider-input-tick"
                data-filled={stop <= value ? "" : undefined}
                className={slots.tick()}
                style={{ "--slider-input-tick": (stop - min) / (max - min) } as React.CSSProperties}
              />
            ))}
          </span>
        )}
      </span>
      {field && (
        <SliderInputFieldContext.Provider value={fieldContext}>
          {children}
        </SliderInputFieldContext.Provider>
      )}
      <SliderPrimitive.Thumb
        ref={thumbRef}
        data-slot="slider-input-thumb"
        data-covered={covered ? "" : undefined}
        className={slots.thumb()}
        aria-label={ctx.label}
        aria-labelledby={ctx.label ? undefined : labelEl ? labelId : ctx.labelledBy}
        aria-describedby={ctx.describedBy}
        aria-valuetext={ctx.formatValue?.(value)}
      >
        <span data-slot="slider-input-pill" className={slots.pill()} />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
}
