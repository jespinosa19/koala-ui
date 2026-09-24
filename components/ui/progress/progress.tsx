"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"

/**
 * Progress: a determinate (or indeterminate) bar on Radix Progress, styled with Koala tokens.
 *
 * Conceptually single-part — track and fill scale together, so one `tv` recipe with `slots`, the
 * same shape as Slider. What *is* optional is the row above the bar, so the label and the readout
 * are real, droppable parts (memory `parts-must-be-droppable`): a bare bar is
 * `<Progress value={64} />` and there is no `showLabel` prop anywhere. Anything passed as children
 * becomes that header row; the track is always the root's own last child, so it can never be
 * composed away by accident.
 *
 *   <Progress value={64} />
 *
 *   <Progress value={64}>
 *     <ProgressLabel>Uploading assets</ProgressLabel>
 *     <ProgressValue />
 *   </Progress>
 *
 * Pass `value={null}` for indeterminate: the fill becomes a short pill sweeping the track, which is
 * the honest reading when there is no percentage to report.
 *
 * `"use client"` because Radix Progress carries context and the value animates on change.
 */
export const progressVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    header: "flex items-center justify-between gap-4",
    label: "text-sm font-medium text-foreground",
    value: "text-sm tabular-nums text-muted-foreground",
    // The track clips the fill, so the fill inherits the track's pill ends and an indeterminate
    // sweep can run past both edges without escaping.
    track: "relative w-full overflow-hidden rounded-full bg-muted",
    // Width (not scaleX) is driven inline from `value`: scaling would squash the pill's rounded
    // caps into ellipses at low values, and the fill is one contained element, so the layout cost
    // is nil.
    indicator: "h-full rounded-full",
  },
  variants: {
    /**
     * `default` is a measured bar sitting in content: a pill on a muted track that shows the whole
     * distance. `chrome` is the full-bleed page treatment — a reading or loading bar pinned under a
     * header — where the track is dropped and the ends squared off, because a bar that spans the
     * viewport has no edges to round and no gutter to sit a track in.
     */
    variant: {
      default: {},
      chrome: {
        root: "gap-0",
        track: "rounded-none bg-transparent",
        indicator: "rounded-none",
      },
    },
    size: {
      // 4px: page chrome — the reading bar that rides under a navbar.
      xs: { track: "h-1" },
      sm: { track: "h-1.5" },
      md: { track: "h-2" },
      lg: { track: "h-3" },
    },
    tone: {
      brand: { indicator: "bg-brand" },
      foreground: { indicator: "bg-foreground" },
      success: { indicator: "bg-success" },
      warning: { indicator: "bg-warning" },
      destructive: { indicator: "bg-destructive" },
      info: { indicator: "bg-info" },
    },
    /**
     * How the fill reacts to a new value. `smooth` glides between discrete steps (an upload going
     * 0 → 33 → 66); `none` welds the fill to the value, which is what a continuously-driven bar
     * wants — a scroll-progress bar under a transition would trail the scrollbar by 300ms and read
     * as lag rather than polish.
     */
    transition: {
      // Named property, never `transition: all`.
      smooth: {
        indicator: "transition-[width] duration-base ease-out motion-reduce:transition-none",
      },
      none: { indicator: "transition-none" },
    },
  },
  defaultVariants: { variant: "default", size: "sm", tone: "brand", transition: "smooth" },
})

type Slots = ReturnType<typeof progressVariants>

const [ProgressProvider, useProgressContext] = createContext<{
  /** null while indeterminate. */
  value: number | null
  max: number
  slots: Slots
  /** Id the root points `aria-labelledby` at; `ProgressLabel` claims it. */
  labelId: string
}>("Progress")

// ─── Progress (root) ──────────────────────────────────────────────────────────

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "asChild" | "value">,
    VariantProps<typeof progressVariants> {
  /** 0…`max`. Pass `null` for indeterminate (no known percentage). */
  value?: number | null
  /** Upper bound of the scale. Defaults to 100, so `value` reads as a percentage. */
  max?: number
}

function Progress({
  value = 0,
  max = 100,
  variant,
  size,
  tone,
  transition,
  className,
  children,
  ...props
}: ProgressProps) {
  const slots = progressVariants({ variant, size, tone, transition })
  const labelId = React.useId()

  // Clamp before painting: a value outside the scale would otherwise overflow the track, and Radix
  // warns on out-of-range values.
  const clamped = value === null || Number.isNaN(value) ? null : Math.min(Math.max(value, 0), max)
  const percent = clamped === null ? 0 : (clamped / max) * 100

  // `role="progressbar"` is a leaf role: a screen reader reads its accessible NAME, not the text
  // sitting inside it, so a visible `ProgressLabel` would go unannounced. Point the root at the
  // label when one is actually composed in — never unconditionally, since a dangling
  // `aria-labelledby` wins over the caller's own `aria-label` and leaves the bar nameless.
  const hasLabel = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === ProgressLabel,
  )
  const labelled = hasLabel && !props["aria-label"] && !props["aria-labelledby"]

  return (
    <ProgressProvider value={clamped} max={max} slots={slots} labelId={labelId}>
      <ProgressPrimitive.Root
        data-slot="progress"
        value={clamped}
        max={max}
        aria-labelledby={labelled ? labelId : undefined}
        className={slots.root({ className })}
        {...props}
      >
        {children ? (
          <div data-slot="progress-header" className={slots.header()}>
            {children}
          </div>
        ) : null}
        <div data-slot="progress-track" className={slots.track()}>
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={slots.indicator({
              // Indeterminate: a short pill sweeps the track on the shared motion token, so no
              // width is implied. Determinate: the width *is* the value.
              className:
                clamped === null
                  ? "w-1/4 animate-progress-indeterminate transition-none motion-reduce:animate-none"
                  : undefined,
            })}
            style={clamped === null ? undefined : { width: `${percent}%` }}
          />
        </div>
      </ProgressPrimitive.Root>
    </ProgressProvider>
  )
}

// ─── ProgressLabel ────────────────────────────────────────────────────────────

export type ProgressLabelProps = React.ComponentProps<"span">

function ProgressLabel({ className, id, ...props }: ProgressLabelProps) {
  const { slots, labelId } = useProgressContext("ProgressLabel")
  // Carries the id the root's `aria-labelledby` points at, so the visible label is also the bar's
  // accessible name. An explicit `id` still wins.
  return (
    <span
      data-slot="progress-label"
      id={id ?? labelId}
      className={slots.label({ className })}
      {...props}
    />
  )
}

// ─── ProgressValue ────────────────────────────────────────────────────────────

export interface ProgressValueProps extends Omit<React.ComponentProps<"span">, "children"> {
  /**
   * Render the readout yourself (`(value, max) => …`), e.g. "3 of 8" or a byte count. Defaults to a
   * whole percentage. `value` is null while indeterminate.
   */
  children?: (value: number | null, max: number) => React.ReactNode
}

function ProgressValue({ className, children, ...props }: ProgressValueProps) {
  const { value, max, slots } = useProgressContext("ProgressValue")
  const content = children
    ? children(value, max)
    : value === null
      ? "—"
      : `${Math.round((value / max) * 100)}%`

  // aria-hidden: Radix already exposes the value on the root's progressbar role, so announcing the
  // readout again would double it up for a screen reader.
  return (
    <span
      data-slot="progress-value"
      aria-hidden="true"
      className={slots.value({ className })}
      {...props}
    >
      {content}
    </span>
  )
}

// ─── useScrollProgress ────────────────────────────────────────────────────────

/**
 * How far the document has been scrolled, 0→100. The building block for a reading-progress bar:
 *
 *   const progress = useScrollProgress()
 *   <Progress value={progress} size="xs" aria-label="Reading progress" />
 *
 * Reads its own `document`, so it works unchanged inside the docs preview iframes (the component
 * executes in that realm). State is only ever set from the scroll/resize listener, never from the
 * effect body, per the strict react-hooks lint (memory `react-hooks-strict-lint`); the first
 * measurement is taken by calling the same handler once on mount.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const doc = document.documentElement
      // The scrollable distance, not the document height: at the bottom of a page one viewport
      // taller than the window, scrollTop equals this and the bar reads a true 100%.
      const scrollable = doc.scrollHeight - doc.clientHeight
      setProgress(scrollable <= 0 ? 0 : Math.min(100, (doc.scrollTop / scrollable) * 100))
    }

    // Coalesce to one measurement per frame: scroll fires far faster than we can paint.
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return progress
}

export { Progress, ProgressLabel, ProgressValue }
