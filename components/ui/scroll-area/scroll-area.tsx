"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"

/**
 * ScrollArea: a scrolling region with Koala's own scrollbar, over Radix ScrollArea. The content
 * still scrolls natively (wheel, trackpad momentum, touch, keyboard, find-in-page); Radix hides the
 * browser's bar and draws one that looks the same on every OS and theme.
 *
 * The bar is an overlay, not a gutter: it takes no width from the content, shows while the pointer
 * is over the region (`type="hover"`, Radix's default; `"scroll"` shows it only while scrolling,
 * `"always"` keeps it), and fades out rather than blinking off. It is a translucent ink pill, so it
 * reads on the page, a card, a popover or a dark band without a token per surface, and it thickens
 * a step under the pointer, the way a native overlay bar does when you reach for it.
 *
 * `fade` softens the edge you can still scroll toward (the `scroll-fade` utilities, pure CSS), so
 * the region says "there is more" before anyone hovers it. For a plain list where the page's hidden
 * scrollbars and a fade are enough, the `scroll-fade` utility on an `overflow-y-auto` box is lighter
 * still; reach for ScrollArea when the bar itself should show.
 *
 * `draggable` lets a mouse pull the content the way a finger already does: press, drag, let go and
 * it glides on and settles. For a strip of cards or photos, where people reach for the content
 * rather than the bar. Touch and pen keep their native scroll; a press that barely moves is still a
 * click, and a real drag swallows the click it would end on, so a link under the pointer never fires.
 *
 * Give the root a height (`h-72`, `max-h-96`, or `flex-1 min-h-0` in a flex column): the viewport
 * fills it. `className` styles the root; the viewport takes `rounded-[inherit]`, so a rounded frame
 * clips the content and the focus ring to its own corners.
 */
export const scrollAreaVariants = tv({
  slots: {
    root: "relative overflow-hidden",
    viewport: [
      "size-full rounded-[inherit]",
      // A scroller can take focus (browsers make it focusable when nothing inside is), and the arrow
      // keys then scroll it. The ring is inset, since the root clips anything drawn outside it.
      "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
      "transition-shadow duration-fast ease-out",
    ],
    scrollbar: [
      "flex touch-none select-none p-0.5",
      // Thickens a step under the pointer (10 → 12px, a 6 → 8px thumb). Width and height are both
      // named so either orientation eases; the bar is absolutely placed, so nothing reflows.
      "transition-[width,height] motion-reduce:transition-none",
      // Radix mounts the bar while the region is hovered or scrolling and waits on its exit
      // animation before unmounting, so it fades in and out instead of cutting. One beat for both
      // the fade and the thickening: `duration-*` feeds the transition and tw-animate-css alike.
      "data-[state=visible]:animate-in data-[state=visible]:fade-in-0",
      "data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0",
      "duration-fast ease-out",
    ],
    // A translucent ink pill: one step off whatever ground it lands on, in every theme.
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
    // Mouse drag: `select-none` so a pull never paints a text selection. The grab cursor only
    // shows when there is somewhere to go (`data-overflowing`), and while a drag is live it wins
    // over every child's own cursor, links included.
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

// Which edges the optional fade dissolves: the axis you scroll along. Two axes can't share one mask
// (both utilities write `mask-image`), so a two-way region fades its vertical edges, the usual lead.
const FADE: Record<Orientation, string> = {
  vertical: "scroll-fade",
  horizontal: "scroll-fade-x",
  both: "scroll-fade",
}

// ─── Mouse drag ──────────────────────────────────────────────────────────────────

/** Travel along the scroll axis, in px, before a press becomes a drag. Below it, it's a click. */
const DRAG_SLOP = 4
/** Only the last stretch of the pull sets the throw, so a pause before letting go lands still. */
const THROW_WINDOW = 80
/** Share of the glide's speed kept per 16ms frame after the pointer lets go. */
const GLIDE_FRICTION = 0.95
/** The same friction as a decay rate per ms, for the glide's closed form. */
const GLIDE_DECAY = -Math.log(GLIDE_FRICTION) / 16
/** Below this speed (px per ms, under a pixel a frame) the glide has settled. */
const GLIDE_REST = 0.05
/** A press stops a glide going faster than this (px per ms) without clicking what it landed on.
 *  Slower, the strip reads as still, so the press is an ordinary click. */
const CATCH_SPEED = 0.25

type Sample = { t: number; x: number; y: number }

const canScroll = (el: HTMLElement, orientation: Orientation) =>
  (orientation !== "vertical" && el.scrollWidth > el.clientWidth) ||
  (orientation !== "horizontal" && el.scrollHeight > el.clientHeight)

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") return ref(node)
  if (ref) (ref as React.RefObject<T | null>).current = node
}

/**
 * Drag-to-scroll for a mouse, on the viewport itself (a native scroller, so everything else about
 * scrolling stays the browser's). Pointer Events with capture, so a pull that leaves the region
 * keeps going; the viewport's own `scrollLeft`/`scrollTop` move, so the bar, the fade and any
 * `onScroll` listener follow as if the wheel had done it. On release the last ~80ms of the pull
 * become a glide that eases out under friction, caught by the next press or wheel, and skipped
 * under reduced motion.
 */
function useDragScroll(enabled: boolean, orientation: Orientation, viewportRef?: React.Ref<HTMLDivElement>) {
  const [dragging, setDragging] = React.useState(false)
  const [overflowing, setOverflowing] = React.useState(false)
  // Gesture bookkeeping: read and written only in handlers, never during render.
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

  /** Stops a running glide. True when it was still moving fast enough that stopping it was the point. */
  const stopGlide = React.useCallback(() => {
    if (!frame.current) return false
    cancelAnimationFrame(frame.current)
    frame.current = 0
    return speed.current > CATCH_SPEED
  }, [])

  // The grab cursor only means something while the content overflows, so the viewport and the
  // content box Radix wraps it in are both watched. Hands the node on to the consumer's ref too.
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

  // A glide still running when the region goes away stops with it.
  React.useEffect(() => () => void stopGlide(), [stopGlide])

  // The release speed decays exponentially and the offset follows that decay's closed form, so the
  // glide is the same at any frame rate and lands where the maths says. A throw that would carry
  // past an end brakes harder instead: it still leaves at the speed the pull let go with, and comes
  // to rest on the end rather than hitting it at speed and stopping dead.
  function glide(el: HTMLElement, vx: number, vy: number) {
    const left = el.scrollLeft
    const top = el.scrollTop
    const v0 = Math.hypot(vx, vy)
    // The room ahead on each axis, and the decay that spends the throw's travel exactly on it.
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
      // A press on a strip still gliding fast catches it, the way a finger stops a flick, and a
      // catch is not a click on whatever it landed on. On the slow tail it's just a click.
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
      // The button came up where this region never heard it: a press that left before becoming a
      // drag has no capture, so its release lands outside. That gesture is over, and a pointer
      // merely passing back over must not pull the content along.
      if (!(e.buttons & 1)) {
        gesture.current = null
        swallowClick.current = false
        if (g.active) setDragging(false)
        return
      }
      // Only the axes the region scrolls along count, so a wobble across a strip isn't a drag.
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
      // The click this release produces fires before any timer, so the flag only has to outlive
      // it: a stale one must never eat a later keyboard click.
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
      // Held still before letting go (or no movement recorded): it lands where it is.
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
    // Links and images start the browser's own drag-and-drop on a pull, which would steal the
    // pointer mid-gesture.
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
  /** Which way the content scrolls, and so which bars draw. @default "vertical" */
  orientation?: Orientation
  /** Fade the edge that still has content beyond it. @default false */
  fade?: boolean
  /**
   * Let a mouse drag the content, with a glide on release. Touch and pen already scroll natively;
   * a press that barely moves is still a click. @default false
   */
  draggable?: boolean
  /** A ref to the scrolling element itself: read `scrollTop`, call `scrollTo`, observe it. */
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
  // Destructured rather than read as `drag.attach` in the JSX, which the strict react-hooks lint
  // takes for a ref access during render.
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
            // Radix wraps the content in a `display: table` box so a horizontal region can grow to
            // its content's width. A vertical-only region has no use for that, and it breaks
            // `truncate` and long-word wrapping inside, so it goes back to a plain block.
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
