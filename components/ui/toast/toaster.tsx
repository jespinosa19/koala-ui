"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { duration, easing } from "@/lib/motion"
import { dismissAnchoredToasts, useToastStore } from "./use-toast"
import { AnchoredToast, ToastItem } from "./toast"

/**
 * Toaster: renders the fixed toast viewport and orchestrates the stacking interaction, plus the
 * anchored bubbles (toasts raised with `anchor`), which live outside the stack.
 *
 * Stacking model (newest toast is index 0, rendered at the front/bottom):
 *
 *   Collapsed (default, ≥2 toasts):
 *     toast[0]  translateY(0)      scale(1)     : fully visible
 *     toast[1]  translateY(-16px)  scale(0.96)  : peeks behind
 *     toast[2]  translateY(-32px)  scale(0.92)  : barely peeks
 *     toast[3+] hidden (opacity 0, pointer-events none)
 *
 *   Expanded (hover/focus):
 *     toast[0]  translateY(0)
 *     toast[1]  translateY(-(h₀ + gap))
 *     toast[2]  translateY(-(h₀ + h₁ + 2·gap))
 *     all toasts visible at full size with 16px gaps
 *
 * Transitions: expand uses --ease-out (leaves at once, settles smoothly).
 *              collapse uses --ease-in-out (on-screen movement back to the fan).
 *              All transition props live in inline styles so they are never
 *              overridden by a Tailwind utility class.
 *
 * Place <Toaster /> once in your root layout, outside any scroll container.
 */

const MAX_COLLAPSED_VISIBLE = 3
const COLLAPSED_OFFSET = 16  // px per level in collapsed mode
const COLLAPSED_SCALE = 0.04 // scale reduction per level
const EXPANDED_GAP = 16      // px between toasts in expanded mode
// Used before ResizeObserver fires. Matches a title-only toast (p-4 top/bottom + ~20px line).
const FALLBACK_H = 56

// Timing comes from lib/motion, the JS mirror of the --ease-* / --duration-* tokens, never inline
// values. Principle #4: interruptible CSS transitions, never keyframes here. Expand leaves at once
// on ease-out; collapse is on-screen movement back into the fan, so it takes ease-in-out. The back
// toasts' fade runs on the shorter beat so it never lags the move.
const EXPAND_TRANSITION   = `transform ${duration.base}ms ${easing.out}, opacity ${duration.fast}ms ${easing.out}`
const COLLAPSE_TRANSITION = `transform ${duration.base}ms ${easing.inOut}, opacity ${duration.fast}ms ${easing.out}`
const SNAP_TRANSITION     = `opacity ${duration.fast}ms ${easing.out}, transform ${duration.fast}ms ${easing.out}`
const VIEWPORT_COLLAPSE   = `height ${duration.base}ms ${easing.inOut}`
// Hover intent: moving between two toasts crosses a gap, so wait this long before collapsing and the
// stack never flickers shut mid-move. A delay, not an animation.
const COLLAPSE_DELAY = 100

// Scroll in any container counts (capture), and neither listener ever blocks scrolling (passive).
const ANCHOR_LISTENER = { capture: true, passive: true } as const

export function Toaster() {
  const toasts = useToastStore()
  const stacked = React.useMemo(() => toasts.filter((t) => !t.anchorRect), [toasts])
  const anchored = React.useMemo(() => toasts.filter((t) => t.anchorRect), [toasts])
  const hasOpenAnchored = anchored.some((t) => t.open)
  const [expanded, setExpanded] = React.useState(false)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expand immediately; collapse after a short delay so moving between
  // toasts (where there is a brief gap) does not flash the collapsed state.
  const handleExpand = React.useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current)
      collapseTimer.current = null
    }
    setExpanded(true)
  }, [])

  const handleCollapse = React.useCallback(() => {
    collapseTimer.current = setTimeout(() => setExpanded(false), COLLAPSE_DELAY)
  }, [])

  React.useEffect(() => () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
  }, [])

  // An anchored bubble describes an element where it was. Once the page scrolls or resizes it would
  // float away from that element, so it closes instead. Listening only while one is on screen.
  React.useEffect(() => {
    if (!hasOpenAnchored) return
    window.addEventListener("scroll", dismissAnchoredToasts, ANCHOR_LISTENER)
    window.addEventListener("resize", dismissAnchoredToasts, ANCHOR_LISTENER)
    return () => {
      window.removeEventListener("scroll", dismissAnchoredToasts, ANCHOR_LISTENER)
      window.removeEventListener("resize", dismissAnchoredToasts, ANCHOR_LISTENER)
    }
  }, [hasOpenAnchored])

  const handleHeightChange = React.useCallback((id: string, h: number | null) => {
    setHeights(prev => {
      if (h === null) {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      }
      if (prev[id] === h) return prev
      return { ...prev, [id]: h }
    })
  }, [])

  function getStackStyle(index: number): React.CSSProperties {
    // Overflow toasts: snap to the back of the visible stack, invisible.
    if (!expanded && index >= MAX_COLLAPSED_VISIBLE) {
      const backY     = (MAX_COLLAPSED_VISIBLE - 1) * COLLAPSED_OFFSET
      const backScale = 1 - (MAX_COLLAPSED_VISIBLE - 1) * COLLAPSED_SCALE
      return {
        transform: `translateY(-${backY}px) scale(${backScale})`,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 30 - index,
        transition: SNAP_TRANSITION,
      }
    }

    if (!expanded) {
      return {
        transform: `translateY(-${index * COLLAPSED_OFFSET}px) scale(${1 - index * COLLAPSED_SCALE})`,
        // Fade back toasts so their shadows don't bleed through the front toast.
        opacity: index === 0 ? 1 : 1 - index * 0.15,
        zIndex: 30 - index,
        transition: COLLAPSE_TRANSITION,
      }
    }

    // Expanded: fan toasts upward, each above the previous by its height + gap.
    let y = 0
    for (let i = 0; i < index; i++) {
      y += (heights[stacked[i]?.id] ?? FALLBACK_H) + EXPANDED_GAP
    }
    return {
      transform: `translateY(-${y}px) scale(1)`,
      zIndex: 30 - index,
      transition: EXPAND_TRANSITION,
    }
  }

  const viewportHeight = React.useMemo(() => {
    if (stacked.length === 0) return 0
    if (!expanded) {
      const frontH  = heights[stacked[0]?.id] ?? FALLBACK_H
      const peeking = Math.min(stacked.length - 1, MAX_COLLAPSED_VISIBLE - 1)
      return frontH + peeking * COLLAPSED_OFFSET
    }
    return stacked.reduce(
      (sum, t, i) => sum + (heights[t.id] ?? FALLBACK_H) + (i > 0 ? EXPANDED_GAP : 0),
      0,
    )
  }, [stacked, heights, expanded])

  // The bubbles are aria-hidden; this is what a screen reader hears instead.
  const announced = anchored.find((t) => t.open)?.title

  return (
    <>
      {stacked.length > 0 && (
        <ToastPrimitive.Provider swipeDirection="right">
          {stacked.map((t, index) => (
            <ToastItem
              // The epoch changes only when a timed toast goes back to persisting; remounting then
              // drops Radix's stale close timer (see addToast in use-toast.ts).
              key={`${t.id}:${t.epoch}`}
              toast={t}
              stackStyle={getStackStyle(index)}
              onHeightChange={handleHeightChange}
              onExpand={handleExpand}
              onCollapse={handleCollapse}
            />
          ))}

          {/*
           * Viewport is the fixed anchor. Toast.Root items portal themselves into it.
           * Height is driven by viewportHeight so the hover area covers the full stack.
           */}
          <ToastPrimitive.Viewport
            data-slot="toast-viewport"
            onMouseEnter={handleExpand}
            onMouseMove={handleExpand}
            onMouseLeave={handleCollapse}
            onFocus={handleExpand}
            onBlur={() => setExpanded(false)}
            style={{
              height: viewportHeight > 0 ? viewportHeight : undefined,
              // Expand: instant resize so the hover target is already correct from frame 0
              // and there's no height/transform de-sync while the stack opens.
              // Collapse: match the toast collapse easing so everything shrinks together.
              transition: expanded ? undefined : VIEWPORT_COLLAPSE,
            }}
            className={cn(
              "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]",
              "w-[380px] max-w-[calc(100vw-2rem)]",
              "m-0 list-none p-0 outline-none",
            )}
          />
        </ToastPrimitive.Provider>
      )}

      {/* Outside the viewport on purpose: its centering transform would make `fixed` relative to it. */}
      {anchored.map((t) => (
        <AnchoredToast key={t.id} toast={t} />
      ))}

      {/* Always mounted, so a new message is a content change a screen reader announces. */}
      <div data-slot="toast-announcer" role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </div>
    </>
  )
}
