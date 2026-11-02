"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { progressVariants } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox } from "@/lib/hit-area"
import { duration } from "@/lib/motion"

const progressTrack = progressVariants().track()

const MAGNET = 0.015
const DRAG_SLOP = 3

export const sliderVariants = tv({
  slots: {
    root: [
      "group/slider relative flex touch-none select-none items-center",
      "before:absolute before:content-[''] data-[orientation=horizontal]:before:inset-x-0 data-[orientation=horizontal]:before:-inset-y-4 data-[orientation=vertical]:before:inset-y-0 data-[orientation=vertical]:before:-inset-x-4",
      "data-[orientation=horizontal]:w-full",
      "data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[gliding]:[&>span:has(>[data-slot=slider-thumb])]:transition-[left,right,top,bottom]",
      "data-[gliding]:[&>span:has(>[data-slot=slider-thumb])]:duration-base",
      "data-[gliding]:[&>span:has(>[data-slot=slider-thumb])]:ease-out",
      "motion-reduce:data-[gliding]:[&>span:has(>[data-slot=slider-thumb])]:transition-none",
    ],
    track: [
      "transition-[height,width] duration-fast ease-out motion-reduce:transition-none",
      "data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
      "grow",
    ],
    range: [
      "absolute rounded-full",
      "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
      "group-data-[gliding]/slider:transition-[left,right,top,bottom] group-data-[gliding]/slider:duration-base group-data-[gliding]/slider:ease-out",
      "motion-reduce:transition-none",
    ],
    thumb: [
      "group/thumb relative block shrink-0 rounded-full border-2 bg-background shadow-sm",
      "cursor-grab active:cursor-grabbing group-data-[dragging]/slider:cursor-grabbing",
      "transition-shadow duration-fast ease-out",
      "group-hover/slider:shadow-md group-data-[dragging]/slider:focus:shadow-lg",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[disabled]:cursor-not-allowed",
      hitBox,
    ],
    tooltip: [
      "pointer-events-none absolute bottom-full mb-2 origin-bottom",
      "left-[calc(var(--slider-edge,0.5)*100%)] -translate-x-[calc(var(--slider-edge,0.5)*100%)]",
      "rounded-md bg-foreground px-2 py-1 text-xs font-medium tabular-nums text-background shadow-sm",
      "whitespace-nowrap",
      "translate-y-1 scale-90 opacity-0 transition-[opacity,translate,scale] duration-fast ease-out motion-reduce:translate-y-0 motion-reduce:scale-100",
      "group-hover/thumb:translate-y-0 group-hover/thumb:scale-100 group-hover/thumb:opacity-100",
      "group-focus-visible/thumb:translate-y-0 group-focus-visible/thumb:scale-100 group-focus-visible/thumb:opacity-100",
      "group-data-[dragging]/slider:group-focus/thumb:translate-y-0 group-data-[dragging]/slider:group-focus/thumb:scale-100 group-data-[dragging]/slider:group-focus/thumb:opacity-100",
    ],
    mark: "pointer-events-none absolute -translate-x-1/2 rounded-full bg-foreground/25 data-[filled]:bg-background/70",
    markLabel:
      "pointer-events-none absolute top-full mt-2 -translate-x-[calc(var(--slider-edge)*100%)] whitespace-nowrap text-xs tabular-nums text-muted-foreground transition-colors duration-fast ease-out data-[filled]:text-foreground",
  },
  variants: {
    size: {
      sm: {
        root: "[--slider-thumb:1rem]",
        track:
          "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1 group-data-[dragging]/slider:data-[orientation=horizontal]:h-1.5 group-data-[dragging]/slider:data-[orientation=vertical]:w-1.5",
        thumb: "size-4",
        mark: "size-0.5",
      },
      md: {
        root: "[--slider-thumb:1.25rem]",
        track:
          "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5 group-data-[dragging]/slider:data-[orientation=horizontal]:h-2 group-data-[dragging]/slider:data-[orientation=vertical]:w-2",
        thumb: "size-5",
        mark: "size-1",
      },
      lg: {
        root: "[--slider-thumb:1.5rem]",
        track:
          "data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 group-data-[dragging]/slider:data-[orientation=horizontal]:h-3 group-data-[dragging]/slider:data-[orientation=vertical]:w-3",
        thumb: "size-6",
        mark: "size-1",
      },
    },
    variant: {
      default: { range: "bg-primary", thumb: "border-primary" },
      brand: { range: "bg-brand", thumb: "border-brand" },
      success: { range: "bg-success", thumb: "border-success" },
      warning: { range: "bg-warning", thumb: "border-warning" },
      destructive: { range: "bg-destructive", thumb: "border-destructive" },
    },
    shape: {
      round: {},
      square: {
        track: "rounded-sm",
        range: "rounded-sm",
        thumb: "rounded-[calc(var(--radius-sm)*0.7)]",
      },
    },
    labelled: {
      true: { root: "mb-6" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    shape: "round",
  },
})

export interface SliderMark {
  value: number
  label?: React.ReactNode
}

export interface SliderProps
  extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "asChild">,
    Omit<VariantProps<typeof sliderVariants>, "labelled"> {
  tooltip?: boolean
  formatValue?: (value: number) => React.ReactNode
  marks?: Array<number | SliderMark>
  static?: boolean
}

function snapToMarks(next: number[], previous: number[], marks: SliderMark[], reach: number) {
  return next.map((value, i) => {
    if (value === previous[i]) return value
    const mark = marks.find((m) => Math.abs(m.value - value) <= reach)
    return mark ? mark.value : value
  })
}

export function Slider({
  className,
  size,
  variant,
  shape,
  tooltip = false,
  formatValue = (v) => v,
  marks,
  static: isStatic,
  value,
  defaultValue,
  onValueChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onLostPointerCapture,
  min = 0,
  max = 100,
  orientation = "horizontal",
  inverted = false,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  const points = React.useMemo(
    () => marks?.map((m) => (typeof m === "number" ? { value: m } : m)) ?? [],
    [marks],
  )
  const labelled = orientation === "horizontal" && points.some((m) => m.label != null)
  const slots = sliderVariants({ size, variant, shape, labelled })

  const [internal, setInternal] = React.useState<number[]>(defaultValue ?? value ?? [min])
  const current = value ?? internal

  const [dragging, setDragging] = React.useState(false)
  const [gliding, setGliding] = React.useState(false)
  const pressed = React.useRef<{ x: number; y: number } | null>(null)
  const glideTimer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(glideTimer.current), [])

  function stopGliding() {
    window.clearTimeout(glideTimer.current)
    setGliding(false)
  }

  function endDrag() {
    pressed.current = null
    setDragging(false)
  }

  function handleValueChange(next: number[]) {
    const settled = pressed.current ? snapToMarks(next, current, points, (max - min) * MAGNET) : next
    if (value === undefined) setInternal(settled)
    onValueChange?.(settled)
  }

  const fractionOf = (v: number) => {
    const fraction = max > min ? (v - min) / (max - min) : 0
    return inverted ? 1 - fraction : fraction
  }

  const low = current.length > 1 ? Math.min(...current) : min
  const high = Math.max(...current)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-static={isStatic ? "" : undefined}
      data-dragging={dragging ? "" : undefined}
      data-gliding={gliding ? "" : undefined}
      className={slots.root({ className })}
      value={current}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      orientation={orientation}
      inverted={inverted}
      aria-label={ariaLabel}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (props.disabled) return
        pressed.current = { x: event.clientX, y: event.clientY }
        setDragging(true)
        if ((event.target as HTMLElement).closest("[data-slot=slider-thumb]")) return
        setGliding(true)
        window.clearTimeout(glideTimer.current)
        glideTimer.current = window.setTimeout(() => setGliding(false), duration.base)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!pressed.current || !gliding) return
        if (event.buttons === 0) return endDrag()
        const travel = Math.hypot(event.clientX - pressed.current.x, event.clientY - pressed.current.y)
        if (travel > DRAG_SLOP) stopGliding()
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        endDrag()
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event)
        endDrag()
      }}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className={cn(progressTrack, slots.track())}>
        <SliderPrimitive.Range data-slot="slider-range" className={slots.range()} />
      </SliderPrimitive.Track>
      {points.map((mark) => {
        const fraction = fractionOf(mark.value)
        const position = `calc(${fraction * 100}% + ${0.5 - fraction} * var(--slider-thumb))`
        const filled = mark.value >= low && mark.value <= high ? "" : undefined
        return (
          <React.Fragment key={mark.value}>
            <span
              data-slot="slider-mark"
              data-filled={filled}
              aria-hidden
              className={slots.mark()}
              style={
                orientation === "horizontal"
                  ? { left: position }
                  : { bottom: position, left: "50%", transform: "translate(-50%, 50%)" }
              }
            />
            {orientation === "horizontal" && mark.label != null && (
              <span
                data-slot="slider-mark-label"
                data-filled={filled}
                aria-hidden
                className={slots.markLabel()}
                style={{ left: position, "--slider-edge": fraction } as React.CSSProperties}
              >
                {mark.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
      {current.map((thumbValue, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          aria-label={current.length > 1 && ariaLabel ? `${ariaLabel} ${i === 0 ? "start" : "end"}` : ariaLabel}
          className={slots.thumb()}
        >
          {tooltip && (
            <span
              data-slot="slider-tooltip"
              className={slots.tooltip()}
              style={
                orientation === "horizontal"
                  ? ({ "--slider-edge": fractionOf(thumbValue) } as React.CSSProperties)
                  : undefined
              }
              aria-hidden
            >
              {formatValue(thumbValue)}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}
