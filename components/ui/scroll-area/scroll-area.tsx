"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"

export const scrollAreaVariants = tv({
  slots: {
    root: "relative overflow-hidden",
    viewport: [
      "size-full rounded-[inherit]",
      "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
      "transition-shadow duration-fast ease-out",
      "scroll-p-2",
    ],
    scrollbar: [
      "flex touch-none select-none p-0.5",
      "transition-[width,height] motion-reduce:transition-none",
      "data-[state=visible]:animate-in data-[state=visible]:fade-in-0",
      "data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0",
      "duration-fast ease-out",
    ],
    thumb: [
      "relative flex-1 cursor-default rounded-full bg-foreground/20",
      "transition-colors duration-fast ease-out hover:bg-foreground/35 active:bg-foreground/45",
    ],
    corner: "bg-transparent",
  },
  variants: {
    orientation: {
      vertical: { scrollbar: "h-full w-2.5 hover:w-3" },
      horizontal: { scrollbar: "h-2.5 flex-col hover:h-3" },
    },
    draggable: {
      true: {
        viewport: [
          "select-none data-[overflowing]:cursor-grab",
          "data-[dragging]:cursor-grabbing [&[data-dragging]_*]:cursor-grabbing",
        ],
      },
    },
  },
})

type Orientation = "vertical" | "horizontal" | "both"

const FADE: Record<Orientation, string> = {
  vertical: "scroll-fade",
  horizontal: "scroll-fade-x",
  both: "scroll-fade",
}

const DRAG_SLOP = 4
const THROW_WINDOW = 80
const GLIDE_FRICTION = 0.95
const GLIDE_DECAY = -Math.log(GLIDE_FRICTION) / 16
const GLIDE_REST = 0.05
const CATCH_SPEED = 0.25

type Sample = { t: number; x: number; y: number }

const canScroll = (el: HTMLElement, orientation: Orientation) =>
  (orientation !== "vertical" && el.scrollWidth > el.clientWidth) ||
  (orientation !== "horizontal" && el.scrollHeight > el.clientHeight)

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") return ref(node)
  if (ref) (ref as React.RefObject<T | null>).current = node
}

function useDragScroll(enabled: boolean, orientation: Orientation, viewportRef?: React.Ref<HTMLDivElement>) {
  const [dragging, setDragging] = React.useState(false)
  const [overflowing, setOverflowing] = React.useState(false)
  const gesture = React.useRef<{
    id: number
    x: number
    y: number
    left: number
    top: number
    active: boolean
    samples: Sample[]
  } | null>(null)
  const swallowClick = React.useRef(false)
  const frame = React.useRef(0)
  const speed = React.useRef(0)

  const stopGlide = React.useCallback(() => {
    if (!frame.current) return false
    cancelAnimationFrame(frame.current)
    frame.current = 0
    return speed.current > CATCH_SPEED
  }, [])

  const attach = React.useCallback(
    (node: HTMLDivElement | null) => {
      const cleanup = assignRef(viewportRef, node)
      let observer: ResizeObserver | undefined
      if (node && enabled && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => setOverflowing(canScroll(node, orientation)))
        observer.observe(node)
        if (node.firstElementChild) observer.observe(node.firstElementChild)
      }
      return () => {
        observer?.disconnect()
        if (typeof cleanup === "function") cleanup()
        else assignRef(viewportRef, null)
      }
    },
    [enabled, orientation, viewportRef],
  )

  React.useEffect(() => () => void stopGlide(), [stopGlide])

  function glide(el: HTMLElement, vx: number, vy: number) {
    const left = el.scrollLeft
    const top = el.scrollTop
    const v0 = Math.hypot(vx, vy)
    const roomX = vx > 0 ? el.scrollWidth - el.clientWidth - left : left
    const roomY = vy > 0 ? el.scrollHeight - el.clientHeight - top : top
    const fit = (v: number, room: number) => (v ? (Math.abs(v) * (1 - GLIDE_REST / v0)) / Math.max(room, 1) : 0)
    const decay = Math.max(GLIDE_DECAY, fit(vx, roomX), fit(vy, roomY))
    const duration = Math.log(v0 / GLIDE_REST) / decay
    const start = performance.now()
    speed.current = v0
    const step = (now: number) => {
      const t = Math.min(Math.max(now - start, 0), duration)
      const travel = (1 - Math.exp(-decay * t)) / decay
      el.scrollLeft = left + vx * travel
      el.scrollTop = top + vy * travel
      speed.current = v0 * Math.exp(-decay * t)
      frame.current = t < duration ? requestAnimationFrame(step) : 0
    }
    frame.current = requestAnimationFrame(step)
  }

  if (!enabled) return { attach, viewportProps: {} }

  const viewportProps: React.ComponentProps<"div"> & Record<`data-${string}`, unknown> = {
    "data-overflowing": overflowing || undefined,
    "data-dragging": dragging || undefined,
    onPointerDown(e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return
      swallowClick.current = stopGlide()
      const el = e.currentTarget
      const target = e.target as Element
      if (!canScroll(el, orientation) || target.closest("input, textarea, select, [contenteditable='true']")) return
      gesture.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        left: el.scrollLeft,
        top: el.scrollTop,
        active: false,
        samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }],
      }
    },
    onPointerMove(e) {
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      if (!(e.buttons & 1)) {
        gesture.current = null
        swallowClick.current = false
        if (g.active) setDragging(false)
        return
      }
      const dx = orientation === "vertical" ? 0 : e.clientX - g.x
      const dy = orientation === "horizontal" ? 0 : e.clientY - g.y
      if (!g.active) {
        if (Math.hypot(dx, dy) < DRAG_SLOP) return
        g.active = true
        swallowClick.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
        setDragging(true)
      }
      e.currentTarget.scrollLeft = g.left - dx
      e.currentTarget.scrollTop = g.top - dy
      g.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY })
      while (g.samples.length > 2 && e.timeStamp - g.samples[0].t > THROW_WINDOW) g.samples.shift()
    },
    onPointerUp(e) {
      if (swallowClick.current) {
        window.setTimeout(() => {
          swallowClick.current = false
        })
      }
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      gesture.current = null
      if (!g.active) return
      const el = e.currentTarget
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
      setDragging(false)
      const first = g.samples[0]
      const last = g.samples[g.samples.length - 1]
      const span = last.t - first.t
      if (span <= 0 || e.timeStamp - last.t > THROW_WINDOW || prefersReducedMotion()) return
      const vx = orientation === "vertical" ? 0 : -(last.x - first.x) / span
      const vy = orientation === "horizontal" ? 0 : -(last.y - first.y) / span
      if (Math.hypot(vx, vy) >= GLIDE_REST) glide(el, vx, vy)
    },
    onPointerCancel(e) {
      if (gesture.current?.id !== e.pointerId) return
      gesture.current = null
      swallowClick.current = false
      setDragging(false)
    },
    onClickCapture(e) {
      if (!swallowClick.current) return
      e.preventDefault()
      e.stopPropagation()
      swallowClick.current = false
    },
    onDragStart(e) {
      e.preventDefault()
    },
    onWheel() {
      stopGlide()
    },
  }
  return { attach, viewportProps }
}

export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  orientation?: Orientation
  fade?: boolean
  draggable?: boolean
  viewportRef?: React.Ref<HTMLDivElement>
}

export function ScrollArea({
  className,
  orientation = "vertical",
  fade = false,
  draggable = false,
  viewportRef,
  children,
  ...props
}: ScrollAreaProps) {
  const slots = scrollAreaVariants({ draggable })
  const vertical = orientation !== "horizontal"
  const horizontal = orientation !== "vertical"
  const { attach, viewportProps } = useDragScroll(draggable, orientation, viewportRef)
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={slots.root({ className })} {...props}>
      <ScrollAreaPrimitive.Viewport
        ref={attach}
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={slots.viewport({
          className: cn(
            fade && FADE[orientation],
            !horizontal && "[&>div]:!block",
          ),
        })}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {vertical && <ScrollAreaScrollbar orientation="vertical" />}
      {horizontal && <ScrollAreaScrollbar orientation="horizontal" />}
      {vertical && horizontal && <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" className={slots.corner()} />}
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollAreaScrollbar({
  orientation,
}: {
  orientation: "vertical" | "horizontal"
}) {
  const slots = scrollAreaVariants({ orientation })
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={slots.scrollbar()}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className={slots.thumb()} />
    </ScrollAreaPrimitive.Scrollbar>
  )
}
