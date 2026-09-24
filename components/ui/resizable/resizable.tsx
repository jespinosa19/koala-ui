"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Resizable: split a surface into panels the user can drag to resize, the
 * foundation of dashboards, editors, and split views. No Radix primitive ships
 * this behavior, so the drag/keyboard/ARIA is hand-rolled (the documented kind of
 * exception, like Tooltip/Tippy): `ResizableHandle` carries `role="separator"`,
 * is arrow-key operable, and reports its position through `aria-valuenow`.
 *
 * Pattern: one `tv` recipe with `slots`; `direction` flows to every part through a
 * typed Context. Sizing is **DOM-driven** for 60fps drags: panels lay out with
 * `flex-grow` weights and the handle rewrites the two it sits between directly,
 * never re-rendering the tree on each pointer move. The group mirrors the live
 * weights into a ref and re-applies them after every commit, so an unrelated parent
 * re-render can't snap the layout back to its defaults.
 *
 * Panels size by **weight**: give every panel a `defaultSize` (conventionally
 * summing to 100) for explicit proportions, or omit it on all of them for an equal
 * split. `minSize` / `maxSize` clamp the drag; `collapsible` snaps a panel shut past
 * half its `minSize`. See docs/ARCHITECTURE.md §2.
 */

export type ResizableDirection = "horizontal" | "vertical"

export const resizableVariants = tv({
  slots: {
    // The flex container. Consumers give it a concrete size via `className`
    // (e.g. `h-72 rounded-lg border`): panels fill whatever box it gets.
    group: "flex h-full w-full overflow-hidden",
    // `min-*-0` lets a panel shrink below its content so flexbox honors the drag;
    // `basis-0` makes `flex-grow` the sole size driver (set imperatively per panel). The
    // `flex-grow` transition glides keyboard nudges and the collapse snap; the handle
    // suppresses it inline during a pointer drag so the finger-follow stays 1:1.
    panel: "relative min-h-0 min-w-0 basis-0 overflow-hidden transition-[flex-grow] duration-fast ease-out",
    // A hair-thin divider with a generous invisible hit zone (the `before` pseudo).
    // Dividers can't be a 40px-wide visual without eating into content, so the touch
    // target is widened on the cross axis only: the line stays 1px.
    handle: [
      "group/handle relative flex shrink-0 items-center justify-center self-stretch bg-border",
      "transition-colors duration-fast ease-out",
      "hover:bg-brand/50 data-[dragging=true]:bg-brand",
      "outline-none focus-visible:z-10 focus-visible:bg-brand focus-visible:ring-2 focus-visible:ring-brand",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60",
    ],
    // The optional grab pill centered on the line, minimal: a fully rounded bar, no
    // border/shadow/icon. A touch wider than the hairline so it reads as a grabbable
    // bump at rest, then lifts to the brand color on hover/drag.
    grip: [
      "z-10 rounded-full bg-border transition-colors duration-fast ease-out",
      "group-hover/handle:bg-brand group-data-[dragging=true]/handle:bg-brand",
    ],
  },
  variants: {
    direction: {
      horizontal: {
        group: "flex-row",
        handle: "w-px cursor-col-resize before:absolute before:inset-y-0 before:-inset-x-2 before:content-['']",
        grip: "h-8 w-1",
      },
      vertical: {
        group: "flex-col",
        handle: "h-px cursor-row-resize before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
        grip: "h-1 w-8",
      },
    },
  },
  defaultVariants: { direction: "horizontal" },
})

type ResizableSlots = ReturnType<typeof resizableVariants>

interface ResizableContextValue {
  slots: ResizableSlots
  direction: ResizableDirection
  /** Store the live panel weights so they survive re-renders; fires `onLayout`. */
  commit: (sizes: number[]) => void
}

const [ResizableProvider, useResizableContext] = createContext<ResizableContextValue>("Resizable")

// DOM helpers (the layout lives in the DOM, read/written only in event handlers)

const PANEL_SELECTOR = ':scope > [data-slot="resizable-panel"]'
// Below this fraction of a panel's `minSize`, a collapsible panel snaps to its collapsed size.
const COLLAPSE_THRESHOLD = 0.5
// Arrow-key nudge, in px of the group, converted to a weight delta. Shift = coarse.
const KEY_STEP = 16
const KEY_STEP_LARGE = 48

function isPanel(el: Element | null): el is HTMLElement {
  return !!el && el.getAttribute("data-slot") === "resizable-panel"
}

function panelsOf(group: HTMLElement): HTMLElement[] {
  return Array.from(group.querySelectorAll<HTMLElement>(PANEL_SELECTOR))
}

function axisSize(el: HTMLElement, axis: "x" | "y") {
  return axis === "x" ? el.offsetWidth : el.offsetHeight
}

function weight(el: HTMLElement) {
  return parseFloat(el.style.flexGrow || "0")
}

/**
 * Read a size bound off a panel's data attribute and return it as a **weight percentage**
 * (the unit the drag math runs in). A `"240px"` value is converted against the live total
 * px of the panel area, so a pixel min/max becomes the right proportion at any group size;
 * a number or `"30%"` is already a percentage.
 */
function boundPct(el: HTMLElement, name: string, totalPx: number, fallback: number) {
  const raw = el.dataset[name]
  if (raw == null || raw === "") return fallback
  const value = raw.trim()
  if (value.endsWith("px")) {
    const px = parseFloat(value)
    return Number.isFinite(px) && totalPx > 0 ? (px / totalPx) * 100 : fallback
  }
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : fallback
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi)
}

/**
 * Convert every panel's `flex-grow` to its current size as a percentage of the total
 * panel area, so all panels share one unit (percent, summing ~100) before we
 * redistribute. Visually a no-op (ratios are preserved); idempotent, so it's safe to
 * call at the start of every interaction. Returns the total px for px↔weight math.
 */
function normalize(group: HTMLElement, axis: "x" | "y") {
  const panels = panelsOf(group)
  const total = panels.reduce((sum, p) => sum + axisSize(p, axis), 0)
  if (total > 0) {
    for (const p of panels) p.style.flexGrow = String((axisSize(p, axis) / total) * 100)
  }
  return total
}

/**
 * Given a desired weight for the `prev` panel, resolve the legal weight after honoring
 * both panels' min/max and either panel's collapse behavior. The pair shares a fixed
 * `combined` budget: whatever `prev` takes, `next` gives up.
 */
function resolvePrev(
  prev: HTMLElement,
  next: HTMLElement,
  combined: number,
  desired: number,
  totalPx: number,
) {
  const prevMin = boundPct(prev, "minSize", totalPx, 0)
  const prevMax = boundPct(prev, "maxSize", totalPx, 100)
  const nextMin = boundPct(next, "minSize", totalPx, 0)
  const nextMax = boundPct(next, "maxSize", totalPx, 100)
  const lower = Math.max(prevMin, combined - nextMax)
  const upper = Math.min(prevMax, combined - nextMin)

  // Collapse prev: dragged below its min and collapsible → snap shut past the threshold,
  // otherwise hold at min so it doesn't visually shrink before it snaps.
  if (prev.dataset.collapsible !== undefined && desired < prevMin) {
    const collapsed = boundPct(prev, "collapsedSize", totalPx, 0)
    return desired <= prevMin * COLLAPSE_THRESHOLD ? clamp(collapsed, 0, combined) : lower
  }
  // Collapse next: prev grew enough to push next below its min.
  if (next.dataset.collapsible !== undefined && combined - desired < nextMin) {
    const collapsed = boundPct(next, "collapsedSize", totalPx, 0)
    return combined - desired <= nextMin * COLLAPSE_THRESHOLD ? clamp(combined - collapsed, 0, combined) : upper
  }
  return clamp(desired, lower, upper)
}

function reflectAria(handle: HTMLElement, prev: HTMLElement, totalPx: number) {
  handle.setAttribute("aria-valuemin", String(Math.round(boundPct(prev, "minSize", totalPx, 0))))
  handle.setAttribute("aria-valuemax", String(Math.round(boundPct(prev, "maxSize", totalPx, 100))))
  handle.setAttribute("aria-valuenow", String(Math.round(weight(prev))))
}

/** A `"240px"` bound becomes a real CSS min/max so the floor/ceiling holds on window resize too. */
function cssPx(value: number | string | undefined) {
  return typeof value === "string" && value.trim().endsWith("px") ? value.trim() : undefined
}

// Group

export interface ResizablePanelGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof resizableVariants> {
  /** Lay panels side-by-side (`horizontal`) or stacked (`vertical`). @default "horizontal" */
  direction?: ResizableDirection
  /** Called with the panel weights (in DOM order) whenever the layout changes. */
  onLayout?: (sizes: number[]) => void
}

/**
 * ResizablePanelGroup: the split container. Compose `ResizablePanel` and
 * `ResizableHandle` as direct children, alternating panel / handle / panel.
 */
export function ResizablePanelGroup({
  className,
  direction = "horizontal",
  onLayout,
  children,
  ...props
}: ResizablePanelGroupProps) {
  const slots = resizableVariants({ direction })
  const groupRef = React.useRef<HTMLDivElement>(null)
  // The source of truth for sizes once the user interacts; null means "use JSX defaults".
  const sizes = React.useRef<number[] | null>(null)

  const commit = React.useCallback(
    (next: number[]) => {
      sizes.current = next
      onLayout?.(next)
    },
    [onLayout],
  )

  // Re-apply the live weights after every commit so an unrelated parent re-render
  // (which would reassert each panel's JSX default `flex-grow`) can't snap the layout
  // back. DOM writes only, no state, no refs read during render.
  React.useLayoutEffect(() => {
    const group = groupRef.current
    if (!group || !sizes.current) return
    const panels = panelsOf(group)
    sizes.current.forEach((s, i) => {
      if (panels[i]) panels[i].style.flexGrow = String(s)
    })
  })

  return (
    <ResizableProvider slots={slots} direction={direction} commit={commit}>
      <div
        ref={groupRef}
        data-slot="resizable-panel-group"
        data-direction={direction}
        className={slots.group({ className })}
        {...props}
      >
        {children}
      </div>
    </ResizableProvider>
  )
}

// Panel

/**
 * A panel size bound. A `number` (or `"30%"`) is a proportional **weight** that scales with
 * the group; a pixel string like `"240px"` is a hard bound that holds at any group size.
 */
export type ResizableSize = number | string

export interface ResizablePanelProps extends React.ComponentProps<"div"> {
  /** Starting weight (conventionally a percentage). Omit on every panel for an equal split. */
  defaultSize?: number
  /** Smallest size the panel may be dragged to: a weight, or `"240px"` for a hard min width. */
  minSize?: ResizableSize
  /** Largest size the panel may be dragged to: a weight, or `"480px"` for a hard max width. */
  maxSize?: ResizableSize
  /** Allow the panel to snap shut when dragged past half its `minSize`. */
  collapsible?: boolean
  /** Size to settle at when collapsed (weight, or a `"px"` string). @default 0 */
  collapsedSize?: ResizableSize
  /** Render as the child element (Radix Slot) instead of a `div`. */
  asChild?: boolean
}

/** ResizablePanel: one region of the split. Constraints ride along as data attributes. */
export function ResizablePanel({
  className,
  defaultSize,
  minSize,
  maxSize,
  collapsible,
  collapsedSize = 0,
  asChild,
  style,
  ...props
}: ResizablePanelProps) {
  const { slots, direction } = useResizableContext("ResizablePanel")
  const Comp = asChild ? Slot.Root : "div"

  // `flex-grow` is the live size knob (seeded for SSR/first paint; the handle rewrites it
  // during a drag and the group restores it after commits). Pixel min/max bounds are also
  // pinned as real CSS on the layout axis, so the floor/ceiling survives a window resize:
  // a `"240px"` sidebar stays 240px instead of scaling away.
  const sizeStyle: React.CSSProperties = { flexGrow: defaultSize ?? 1 }
  if (direction === "horizontal") {
    sizeStyle.minWidth = cssPx(minSize)
    sizeStyle.maxWidth = cssPx(maxSize)
  } else {
    sizeStyle.minHeight = cssPx(minSize)
    sizeStyle.maxHeight = cssPx(maxSize)
  }

  return (
    <Comp
      data-slot="resizable-panel"
      data-min-size={minSize}
      data-max-size={maxSize}
      data-collapsible={collapsible ? "" : undefined}
      data-collapsed-size={collapsedSize}
      className={slots.panel({ className })}
      style={{ ...sizeStyle, ...style }}
      {...props}
    />
  )
}

// Handle

export interface ResizableHandleProps extends React.ComponentProps<"div"> {
  /** Show the minimal centered grab pill: a clear "drag me" affordance on wide gutters. */
  withHandle?: boolean
  /** Disable dragging and keyboard resizing. */
  disabled?: boolean
  /**
   * Custom handle content, centered on the divider, replaces the default `withHandle`
   * pill entirely (an icon, a dotted nub, a brand chip, …). The drag/keyboard behavior is
   * unchanged; this only swaps the visual.
   */
  children?: React.ReactNode
}

/**
 * ResizableHandle: the draggable divider between two panels. It owns the gesture
 * (pointer drag with capture so it tracks over iframes and off-element), the keyboard
 * (arrows nudge, Shift = coarse, Home/End jump to min/max), and the ARIA
 * (`role="separator"` + live `aria-valuenow`). It resizes the panels on either side of
 * it in the DOM, so no panel registration or indices are needed.
 */
export function ResizableHandle({
  className,
  withHandle,
  disabled,
  children,
  ...props
}: ResizableHandleProps) {
  const { slots, direction, commit } = useResizableContext("ResizableHandle")
  const [dragging, setDragging] = React.useState(false)

  const horizontal = direction === "horizontal"
  const axis = horizontal ? "x" : "y"

  // All mutated only inside handlers, never read during render.
  const active = React.useRef(false)
  const startPos = React.useRef(0)
  const startPrev = React.useRef(0)
  const combined = React.useRef(0)
  const pxPerWeight = React.useRef(1)
  const prevEl = React.useRef<HTMLElement | null>(null)
  const nextEl = React.useRef<HTMLElement | null>(null)
  const groupEl = React.useRef<HTMLElement | null>(null)

  function siblings(handle: HTMLElement) {
    const group = handle.closest<HTMLElement>('[data-slot="resizable-panel-group"]')
    const prev = handle.previousElementSibling
    const next = handle.nextElementSibling
    if (!group || !isPanel(prev) || !isPanel(next)) return null
    return { group, prev, next }
  }

  function reportLayout(group: HTMLElement) {
    commit(panelsOf(group).map(weight))
  }

  function beginDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return
    const handle = e.currentTarget
    const ctx = siblings(handle)
    if (!ctx) return

    const total = normalize(ctx.group, axis)
    pxPerWeight.current = total > 0 ? total / 100 : 1
    startPos.current = axis === "x" ? e.clientX : e.clientY
    startPrev.current = weight(ctx.prev)
    combined.current = weight(ctx.prev) + weight(ctx.next)
    prevEl.current = ctx.prev
    nextEl.current = ctx.next
    groupEl.current = ctx.group

    // Suppress the panels' flex-grow transition so the drag follows the pointer 1:1
    // (the glide is for keyboard/snap, not the finger).
    ctx.prev.style.transition = "none"
    ctx.next.style.transition = "none"

    active.current = true
    setDragging(true)
    handle.setPointerCapture(e.pointerId)
    // Kill text selection and pin the resize cursor for the whole gesture.
    document.body.style.userSelect = "none"
    document.body.style.cursor = horizontal ? "col-resize" : "row-resize"
    e.preventDefault()
  }

  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current || !prevEl.current || !nextEl.current) return
    const pos = axis === "x" ? e.clientX : e.clientY
    const totalPx = pxPerWeight.current * 100
    const desired = startPrev.current + (pos - startPos.current) / pxPerWeight.current
    const newPrev = resolvePrev(prevEl.current, nextEl.current, combined.current, desired, totalPx)
    prevEl.current.style.flexGrow = String(newPrev)
    nextEl.current.style.flexGrow = String(combined.current - newPrev)
    reflectAria(e.currentTarget, prevEl.current, totalPx)
    if (groupEl.current) reportLayout(groupEl.current)
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current) return
    active.current = false
    setDragging(false)
    // Restore the flex-grow transition (re-enables the glide for keyboard/snap afterward).
    if (prevEl.current) prevEl.current.style.transition = ""
    if (nextEl.current) nextEl.current.style.transition = ""
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // pointer was never captured (e.g. cancel before move): nothing to release.
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const handle = e.currentTarget
    const ctx = siblings(handle)
    if (!ctx) return

    const dec = horizontal ? "ArrowLeft" : "ArrowUp"
    const inc = horizontal ? "ArrowRight" : "ArrowDown"
    if (![dec, inc, "Home", "End"].includes(e.key)) return
    e.preventDefault()

    const total = normalize(ctx.group, axis)
    const pair = weight(ctx.prev) + weight(ctx.next)
    const step = ((e.shiftKey ? KEY_STEP_LARGE : KEY_STEP) / (total || 1)) * 100

    let desired = weight(ctx.prev)
    if (e.key === dec) desired -= step
    else if (e.key === inc) desired += step
    else if (e.key === "Home") desired = boundPct(ctx.prev, "minSize", total, 0)
    else if (e.key === "End") desired = boundPct(ctx.prev, "maxSize", total, 100)

    const newPrev = resolvePrev(ctx.prev, ctx.next, pair, desired, total)
    ctx.prev.style.flexGrow = String(newPrev)
    ctx.next.style.flexGrow = String(pair - newPrev)
    reflectAria(handle, ctx.prev, total)
    reportLayout(ctx.group)
  }

  // Seed the ARIA value from the prev panel's initial weight (its ref ran first). Read the
  // axis off the group so a pixel min/max can be converted with the live total px.
  const initAria = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const group = node.closest<HTMLElement>('[data-slot="resizable-panel-group"]')
    const prev = node.previousElementSibling
    if (!group || !isPanel(prev)) return
    const initAxis = group.getAttribute("data-direction") === "vertical" ? "y" : "x"
    const totalPx = panelsOf(group).reduce((sum, p) => sum + axisSize(p, initAxis), 0)
    reflectAria(node, prev, totalPx)
  }, [])

  return (
    <div
      ref={initAria}
      data-slot="resizable-handle"
      role="separator"
      tabIndex={disabled ? -1 : 0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={slots.handle({ className })}
      onPointerDown={beginDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children ?? (withHandle && <span aria-hidden data-slot="resizable-grip" className={slots.grip()} />)}
    </div>
  )
}
