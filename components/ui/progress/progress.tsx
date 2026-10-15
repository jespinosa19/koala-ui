"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"

export const progressVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    header: "flex items-center justify-between gap-4",
    label: "text-sm font-medium text-foreground",
    value: "text-sm tabular-nums text-muted-foreground",
    track: [
      "relative w-full overflow-hidden rounded-full bg-(--progress-track)",
      "[--progress-track:color-mix(in_oklab,var(--foreground)_4%,transparent)]",
      "dark:[--progress-track:color-mix(in_oklab,var(--foreground)_6%,transparent)]",
    ],
    rail: "absolute inset-0 flex flex-col justify-end rounded-[inherit] p-[inherit]",
    sweep: "absolute top-0 left-1/2 aspect-square h-full -translate-x-1/2 -rotate-90",
    indicator: "h-full rounded-full",
    timer: [
      "transition-none data-[direction=drain]:[animation-direction:reverse]",
      "data-paused:[animation-play-state:paused]",
      "motion-reduce:[animation-timing-function:steps(var(--progress-steps,4),end)]",
    ],
  },
  variants: {
    variant: {
      default: {},
      chrome: {
        root: "gap-0",
        track: "rounded-none bg-transparent",
        indicator: "rounded-none",
      },
    },
    size: {
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
    transition: {
      smooth: {
        indicator: "transition-[width] duration-base ease-out motion-reduce:transition-none",
      },
      none: { indicator: "transition-none" },
    },
    orientation: {
      horizontal: {},
      vertical: {
        root: "h-32 w-fit items-center",
        header: "flex-col justify-center gap-0.5 text-center",
        track: "min-h-0 flex-1",
        indicator: "w-full shrink-0 rounded-[inherit]",
      },
    },
  },
  compoundVariants: [
    { orientation: "vertical", size: "xs", className: { track: "h-auto w-1" } },
    { orientation: "vertical", size: "sm", className: { track: "h-auto w-1.5" } },
    { orientation: "vertical", size: "md", className: { track: "h-auto w-2" } },
    { orientation: "vertical", size: "lg", className: { track: "h-auto w-3" } },
    {
      orientation: "vertical",
      transition: "smooth",
      className: { indicator: "transition-[height] duration-base ease-out motion-reduce:transition-none" },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "sm",
    tone: "brand",
    transition: "smooth",
    orientation: "horizontal",
  },
})

type Slots = ReturnType<typeof progressVariants>

const [ProgressProvider, useProgressContext] = createContext<{
  value: number | null
  max: number
  slots: Slots
  labelId: string
}>("Progress")

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "asChild" | "value">,
    VariantProps<typeof progressVariants> {
  value?: number | null
  max?: number
  orientation?: "horizontal" | "vertical"
  duration?: number
  direction?: "drain" | "fill"
  paused?: boolean
  runKey?: React.Key
  onComplete?: () => void
}

function useTimedRun(duration: number | undefined, paused: boolean, run: string, onComplete?: () => void) {
  const remaining = React.useRef(duration ?? 0)
  const fired = React.useRef(false)
  const [completeRun, setCompleteRun] = React.useState<string | null>(null)
  const complete = React.useEffectEvent(() => onComplete?.())

  React.useEffect(() => {
    remaining.current = duration ?? 0
    fired.current = false
  }, [run, duration])

  React.useEffect(() => {
    if (duration === undefined || paused || fired.current) return
    const started = performance.now()
    const timer = window.setTimeout(() => {
      fired.current = true
      remaining.current = 0
      setCompleteRun(run)
      complete()
    }, remaining.current)
    return () => {
      clearTimeout(timer)
      if (!fired.current) remaining.current = Math.max(0, remaining.current - (performance.now() - started))
    }
  }, [duration, paused, run])

  return completeRun === run
}

function Progress({
  value = 0,
  max = 100,
  variant,
  size,
  tone,
  transition,
  orientation = "horizontal",
  duration,
  direction = "drain",
  paused = false,
  runKey,
  onComplete,
  className,
  children,
  ...props
}: ProgressProps) {
  const slots = progressVariants({ variant, size, tone, transition, orientation })
  const vertical = orientation === "vertical"
  const labelId = React.useId()

  const timed = duration !== undefined && Number.isFinite(duration) && duration >= 0
  const run = `${String(runKey ?? "")}|${duration}|${direction}`
  const complete = useTimedRun(timed ? duration : undefined, paused, run, onComplete)

  const clamped = timed || value === null || Number.isNaN(value) ? null : Math.min(Math.max(value, 0), max)
  const percent = clamped === null ? 0 : (clamped / max) * 100

  const hasLabel = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === ProgressLabel,
  )
  const labelled = hasLabel && !props["aria-label"] && !props["aria-labelledby"]

  const indicator = timed ? (
    <ProgressPrimitive.Indicator
      key={run}
      data-slot="progress-indicator"
      data-direction={direction}
      data-paused={paused ? "" : undefined}
      className={slots.indicator({
        className: cn(
          slots.timer(),
          vertical ? "h-full animate-progress-timer-y" : "w-full animate-progress-timer",
        ),
      })}
      style={
        {
          "--progress-duration": `${duration}ms`,
          "--progress-steps": Math.max(4, Math.round((duration ?? 0) / 1000)),
        } as React.CSSProperties
      }
    />
  ) : (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={slots.indicator({
        className:
          clamped === null
            ? cn(
                "w-1/4 animate-progress-indeterminate transition-none motion-reduce:animate-none",
                vertical && "h-full rounded-none",
              )
            : undefined,
      })}
      style={clamped === null ? undefined : vertical ? { height: `${percent}%` } : { width: `${percent}%` }}
    />
  )

  return (
    <ProgressProvider value={clamped} max={max} slots={slots} labelId={labelId}>
      <ProgressPrimitive.Root
        data-slot="progress"
        data-orientation={orientation}
        data-timed={timed ? "" : undefined}
        data-paused={timed && paused ? "" : undefined}
        data-complete={timed && complete ? "" : undefined}
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
          {!vertical ? (
            indicator
          ) : clamped === null && !timed ? (
            <div className={slots.sweep()}>{indicator}</div>
          ) : (
            <div className={slots.rail()}>{indicator}</div>
          )}
        </div>
      </ProgressPrimitive.Root>
    </ProgressProvider>
  )
}

export type ProgressLabelProps = React.ComponentProps<"span">

function ProgressLabel({ className, id, ...props }: ProgressLabelProps) {
  const { slots, labelId } = useProgressContext("ProgressLabel")
  return (
    <span
      data-slot="progress-label"
      id={id ?? labelId}
      className={slots.label({ className })}
      {...props}
    />
  )
}

export interface ProgressValueProps extends Omit<React.ComponentProps<"span">, "children"> {
  children?: (value: number | null, max: number) => React.ReactNode
}

function ProgressValue({ className, children, ...props }: ProgressValueProps) {
  const { value, max, slots } = useProgressContext("ProgressValue")
  const content = children
    ? children(value, max)
    : value === null
      ? "—"
      : `${Math.round((value / max) * 100)}%`

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

export function useScrollProgress(target?: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const box = target?.current ?? null
    let frame = 0

    const measure = () => {
      frame = 0
      const scroller = box ?? document.documentElement
      const scrollable = scroller.scrollHeight - scroller.clientHeight
      setProgress(scrollable <= 0 ? 0 : Math.min(100, (scroller.scrollTop / scrollable) * 100))
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    const source: HTMLElement | Window = box ?? window
    onScroll()
    source.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      source.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [target])

  return progress
}

export { Progress, ProgressLabel, ProgressValue }
