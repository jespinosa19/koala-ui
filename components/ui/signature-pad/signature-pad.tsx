"use client"

import * as React from "react"
import { X } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { createContext } from "@/lib/create-context"
import { useFieldContext } from "@/lib/field-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * SignaturePad: a surface to sign on with a mouse, a finger or a stylus.
 *
 * Each pen stroke is kept as one smoothed SVG path, in the order it was written, which is exactly
 * what a `Signature` takes as its children: the pad captures a hand and the Signature writes it
 * back. It reads like paper, a baseline with a cross at its start and a "Sign here" that clears
 * the moment the pen touches down, and it is framed like every other form control, so it sits in
 * a `Field` beside Inputs and takes the field's label, hint, error and disabled state.
 *
 * Undo and Clear are parts (`SignaturePadActions`, `SignaturePadUndo`, `SignaturePadClear`), so a
 * pad that should not offer them simply leaves them out. They stay out of sight until there is
 * something to undo.
 */
export const signaturePadVariants = tv({
  slots: {
    root: [
      "group/signature-pad relative isolate h-40 w-full overflow-hidden select-none",
      // The Textarea's frame: an opaque surface that matches whatever it sits on.
      "rounded-md border border-input bg-[var(--surface,var(--background))]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      // Lit by focus, like every field, not by the pen: the first stroke focuses the pad and it
      // stays lit through every lift between strokes and on Undo and Clear, until focus leaves.
      // Lit only while the pen was down, a signature of five strokes blinked five times.
      "outline-none focus-within:border-brand focus-within:brand-ring",
    ],
    // The page itself. `touch-none` keeps a finger signing instead of scrolling the document.
    surface: [
      "absolute inset-0 size-full cursor-crosshair touch-none text-foreground",
      "fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]",
    ],
    // The line to sign on, set a hand's descender above the bottom edge, with the cross at its
    // start. Decorative: the pad's name and status carry the meaning.
    guide: [
      "pointer-events-none absolute inset-x-5 bottom-8 flex items-end gap-2 pb-1.5",
      "border-b border-border text-muted-foreground",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
    ],
    placeholder: [
      "text-sm leading-none opacity-0 transition-opacity duration-fast ease-out",
      "group-data-empty/signature-pad:opacity-100",
    ],
    // Top right, out of the writing. Hidden while there is nothing to undo, so an empty pad reads
    // as a blank page rather than a toolbar.
    actions: [
      "absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5",
      "transition-opacity duration-fast ease-out",
      "group-data-empty/signature-pad:pointer-events-none group-data-empty/signature-pad:opacity-0",
    ],
  },
  variants: {
    hasError: {
      true: {
        root: "border-destructive focus-within:border-destructive focus-within:destructive-ring",
      },
    },
    disabled: {
      true: {
        root: "pointer-events-none opacity-50",
      },
    },
  },
})

type SignaturePadSlots = ReturnType<typeof signaturePadVariants>

interface SignaturePadContextValue {
  slots: SignaturePadSlots
  empty: boolean
  disabled: boolean
  undo: () => void
  clear: () => void
}

const [SignaturePadProvider, useSignaturePadContext] =
  createContext<SignaturePadContextValue>("SignaturePad")

/* ─── Geometry ────────────────────────────────────────────────────────────────────────────────── */

type Point = readonly [number, number]

/** Samples closer than this (px) to the last one are jitter, not writing. */
const MIN_STEP = 1.5

const round = (value: number) => Math.round(value * 10) / 10
const pair = ([x, y]: Point) => `${round(x)} ${round(y)}`

/**
 * One stroke as a smooth path through its samples: a Catmull-Rom spline written as cubic Béziers,
 * so the curve passes through every point the pen touched without the corners a polyline shows. A
 * tap becomes a dot (a hair-long line, which the round cap draws as a point).
 */
function strokePath(points: Point[]) {
  const [first] = points
  if (points.length === 1) return `M${pair(first)}L${pair([first[0] + 0.1, first[1]])}`
  let d = `M${pair(first)}`
  for (let i = 0; i < points.length - 1; i++) {
    const before = points[i - 1] ?? points[i]
    const from = points[i]
    const to = points[i + 1]
    const after = points[i + 2] ?? to
    const c1: Point = [from[0] + (to[0] - before[0]) / 6, from[1] + (to[1] - before[1]) / 6]
    const c2: Point = [to[0] - (after[0] - from[0]) / 6, to[1] - (after[1] - from[1]) / 6]
    d += `C${pair(c1)} ${pair(c2)} ${pair(to)}`
  }
  return d
}

/**
 * The box around a drawing's ink, padded, as a `viewBox` string. It reads the absolute
 * coordinates a pad writes (`M`, `L`, `C`), so it is exact for pad output. Pass it to a
 * `Signature` to reserve its width from the first paint.
 */
export function signatureViewBox(strokes: string[], padding = 4) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const d of strokes) {
    const numbers = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? []
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      minX = Math.min(minX, numbers[i])
      maxX = Math.max(maxX, numbers[i])
      minY = Math.min(minY, numbers[i + 1])
      maxY = Math.max(maxY, numbers[i + 1])
    }
  }
  if (minX === Infinity) return "0 0 0 0"
  return [minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2]
    .map((value) => round(value))
    .join(" ")
}

/**
 * The drawing as a standalone SVG document: what the pad submits under its `name`, and what you
 * would store or turn into a file. Ink is `currentColor`, so it takes the color of wherever it lands.
 */
export function signatureToSvg(strokes: string[]) {
  if (strokes.length === 0) return ""
  const paths = strokes.map((d) => `<path d="${d}"/>`).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${signatureViewBox(strokes)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

/* ─── State ───────────────────────────────────────────────────────────────────────────────────── */

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

/* ─── Parts ───────────────────────────────────────────────────────────────────────────────────── */

export interface SignaturePadProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">,
    VariantProps<typeof signaturePadVariants> {
  /** The strokes, one SVG path per pen stroke in writing order (controlled). */
  value?: string[]
  /** The strokes to start from (uncontrolled). @default [] */
  defaultValue?: string[]
  /** Called when a stroke lands, and on undo and clear, with every stroke so far. */
  onValueChange?: (strokes: string[]) => void
  /** Submitted under this name as a standalone SVG document (see `signatureToSvg`). */
  name?: string
  /** The line under the empty page. @default "Sign here" */
  placeholder?: React.ReactNode
}

/**
 * The pad. Signs on pointer down and lands a stroke on pointer up; drop `SignaturePadActions` in
 * to offer Undo and Clear. Inside a `Field` it takes the field's label, hint, error and disabled.
 */
export function SignaturePad({
  value,
  defaultValue = [],
  onValueChange,
  name,
  placeholder = "Sign here",
  hasError,
  disabled,
  className,
  children,
  onKeyDown,
  ref,
  ...props
}: SignaturePadProps) {
  const field = useFieldContext()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )
  // Programmatic focus only (the pad is `tabIndex={-1}`): a keyboard has nothing to draw with, so
  // the tab order goes to Undo and Clear instead. `preventScroll`, or a tall page jumps to put the
  // pad in view the moment the pen touches it.
  const focusPad = React.useCallback(() => rootRef.current?.focus({ preventScroll: true }), [])
  const resolvedError = hasError ?? field?.hasError ?? false
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const slots = signaturePadVariants({ hasError: resolvedError, disabled: resolvedDisabled })

  const [strokes, setStrokes] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  // The stroke under the pen: its samples in a ref (they arrive faster than renders), its path
  // in state so it paints as it is written.
  const pointsRef = React.useRef<Point[] | null>(null)
  const [draft, setDraft] = React.useState<string | null>(null)

  const pointIn = (element: SVGSVGElement, event: { clientX: number; clientY: number }): Point => {
    const rect = element.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (resolvedDisabled || (event.pointerType === "mouse" && event.button !== 0)) return
    // Cancelling the pointer down also cancels the focus a click would have given, so hand it over.
    event.preventDefault()
    focusPad()
    event.currentTarget.setPointerCapture(event.pointerId)
    pointsRef.current = [pointIn(event.currentTarget, event)]
    setDraft(strokePath(pointsRef.current))
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const points = pointsRef.current
    if (!points) return
    // Coalesced events are the samples the browser merged into this one frame: a fast flourish
    // keeps its curve instead of being cut into straight segments.
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? []
    for (const sample of samples.length ? samples : [event.nativeEvent]) {
      const point = pointIn(event.currentTarget, sample)
      const last = points[points.length - 1]
      if (Math.hypot(point[0] - last[0], point[1] - last[1]) >= MIN_STEP) points.push(point)
    }
    setDraft(strokePath(points))
  }

  const land = () => {
    const points = pointsRef.current
    if (!points) return
    pointsRef.current = null
    setDraft(null)
    setStrokes([...strokes, strokePath(points)])
  }

  const empty = strokes.length === 0 && draft === null
  // An Undo that takes the last stroke, or a Clear, disables the very button that has focus, and a
  // disabled button drops it: the frame would go dark mid-signing. Focus moves to the pad first.
  const undo = React.useCallback(() => {
    if (strokes.length <= 1) focusPad()
    setStrokes(strokes.slice(0, -1))
  }, [focusPad, setStrokes, strokes])
  const clear = React.useCallback(() => {
    focusPad()
    setStrokes([])
  }, [focusPad, setStrokes])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || resolvedDisabled) return
    // The editor's own shortcut, while the pad (or one of its buttons) has focus.
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
      if (strokes.length === 0) return
      event.preventDefault()
      undo()
    }
  }

  return (
    <SignaturePadProvider
      slots={slots}
      empty={strokes.length === 0}
      disabled={resolvedDisabled}
      undo={undo}
      clear={clear}
    >
      <div
        ref={setRef}
        role="group"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-labelledby={field?.labelledBy}
        aria-describedby={field?.describedBy}
        aria-label={field?.labelledBy ? undefined : "Signature"}
        data-slot="signature-pad"
        data-empty={empty || undefined}
        data-drawing={draft !== null || undefined}
        data-disabled={resolvedDisabled || undefined}
        className={slots.root({ className })}
        {...props}
      >
        <div aria-hidden className={slots.guide()}>
          <X weight="bold" />
          <span className={slots.placeholder()}>{placeholder}</span>
        </div>
        <svg
          aria-hidden
          data-slot="signature-pad-surface"
          className={slots.surface()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={land}
          onPointerCancel={land}
          onLostPointerCapture={land}
        >
          {strokes.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {draft !== null && <path d={draft} />}
        </svg>
        {/* Announces the one change that matters to someone who cannot see the page. */}
        <span className="sr-only" aria-live="polite">
          {strokes.length > 0 ? "Signed" : ""}
        </span>
        {name && <input type="hidden" name={name} value={signatureToSvg(strokes)} />}
        {children}
      </div>
    </SignaturePadProvider>
  )
}

/** The corner that holds Undo and Clear. Hidden while the pad is empty. */
export function SignaturePadActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSignaturePadContext("SignaturePadActions")
  return <div data-slot="signature-pad-actions" className={slots.actions({ className })} {...props} />
}

/** Takes back the last stroke. */
export function SignaturePadUndo({
  children = "Undo",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { empty, disabled, undo } = useSignaturePadContext("SignaturePadUndo")
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="signature-pad-undo"
      disabled={empty || disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) undo()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

/** Wipes the page. */
export function SignaturePadClear({
  children = "Clear",
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { empty, disabled, clear } = useSignaturePadContext("SignaturePadClear")
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-slot="signature-pad-clear"
      disabled={empty || disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) clear()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
