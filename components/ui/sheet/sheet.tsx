"use client"

import * as React from "react"

import { DensityProvider, useDensity } from "@/lib/density"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Sheet: a panel that stays open over a full-bleed canvas (a map, a design board, a media
 * wall) without ever blocking it, the way Apple Maps keeps its place card on top of the map. It
 * is the non-modal sibling of Drawer: no overlay, no focus trap, no scroll lock, and it is part
 * of the page rather than a layer that opens and closes.
 *
 * Its shape follows the CONTAINER, not the viewport, so it behaves the same full-screen and in a
 * docs preview:
 *  - wider than `breakpoint` (768px by default) it is a **floating** card docked to one side,
 *    top to bottom with a margin all round;
 *  - narrower, it is a **bottom** sheet with three detents, `peek`, `half` and `full`. Drag the
 *    handle (or the header) and let go: the release velocity is projected and the sheet settles
 *    on the nearest detent. A tap on the handle steps it up, and the handle is a focusable
 *    separator, so the arrow keys, Home and End move it too.
 *
 * Put it inside the positioned element it floats over (usually the map's own `relative` box):
 * it is `absolute` in there, and that element is what it measures. `onInsetChange` reports how
 * much of it the sheet covers, which is the padding a map needs to centre things in the part
 * that is still visible. Pattern: one `tv` recipe with `slots`; layout, detent and the drag
 * regions reach the parts through a typed Context. See docs/ARCHITECTURE.md §2.
 */

export type SheetDetent = "peek" | "half" | "full"
export type SheetLayout = "floating" | "bottom"
export type SheetSide = "left" | "right"

/** How much of the canvas the sheet covers, in px, per edge. */
export interface SheetInsets {
  top: number
  right: number
  bottom: number
  left: number
}

const DETENTS: SheetDetent[] = ["peek", "half", "full"]
// Movement (px) before a drag is recognized; below this, a press stays a tap, so buttons in
// the header still fire. Same slop as Drawer.
const DRAG_SLOP = 6
// How far (ms) the release velocity is projected before picking the nearest detent.
const PROJECTION = 220
// The strip of canvas the `full` detent leaves visible at the top, so the page is never lost.
const FULL_GAP = 56

export const sheetVariants = tv({
  slots: {
    root: [
      "absolute z-10 flex flex-col overflow-hidden",
      "border-border-soft bg-popover text-popover-foreground shadow-xl outline-none",
      // Nested controls read this so they paint the panel surface, not a --background block.
      "[--surface:var(--popover)]",
      // Until its canvas has been measured the sheet doesn't know its shape: keep it out of
      // sight for that first frame rather than flash the wrong one.
      "[&:not([data-layout])]:invisible",
      "data-[layout=floating]:inset-y-3 data-[layout=floating]:max-w-[calc(100%-1.5rem)] data-[layout=floating]:rounded-2xl data-[layout=floating]:border",
      "data-[layout=bottom]:inset-x-0 data-[layout=bottom]:bottom-0 data-[layout=bottom]:w-auto data-[layout=bottom]:max-w-none",
      "data-[layout=bottom]:rounded-t-2xl data-[layout=bottom]:border-t",
      // Pad past the home indicator on devices that report a safe-area inset.
      "data-[layout=bottom]:pb-[env(safe-area-inset-bottom)]",
      // The height follows the detent with the sheet easing; a finger drives it 1:1.
      "transition-[height,width] duration-base ease-drawer data-[dragging]:transition-none motion-reduce:transition-none",
    ],
    // The grab handle: a slim bar with a pseudo-element that widens its drag and touch target
    // well past 40px. It is also the keyboard control, so it takes a focus ring.
    handle: [
      "relative mx-auto h-1.5 w-12 shrink-0 cursor-grab touch-none rounded-full bg-border select-none active:cursor-grabbing",
      "transition-colors duration-fast ease-out hover:bg-muted-foreground/40",
      // 96 × 40 px: the bar is 6px tall, the pseudo-element adds 17px above and below it.
      "before:absolute before:-inset-x-6 before:-inset-y-[17px] before:content-['']",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
    ],
    header: "flex shrink-0 flex-col",
    // The body scrolls within the flex column. `min-h-0` lets it shrink below its content so
    // `overflow-y-auto` actually engages (flex-basis would otherwise pin the height).
    body: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
    // A row, so several actions sit side by side (give them `flex-1` to share it). A lone child
    // (an app's tab bar, one primary action) fills it: a flex item otherwise shrinks to its
    // content, and a tab bar squeezed to its labels runs them together.
    footer: "mt-auto flex shrink-0 items-center gap-2 [&>:only-child]:min-w-0 [&>:only-child]:flex-1",
    title: "leading-none font-semibold tracking-tight text-pretty",
    description: "text-sm text-pretty text-muted-foreground",
  },
  variants: {
    side: {
      left: { root: "data-[layout=floating]:left-3" },
      right: { root: "data-[layout=floating]:right-3" },
    },
    // The floating card's width, on Tailwind's container scale (the same steps Drawer caps its
    // side panels at). A bottom sheet always spans the canvas.
    size: {
      sm: { root: "w-sm" },
      md: { root: "w-md" },
      lg: { root: "w-lg" },
      xl: { root: "w-xl" },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx), with Drawer's values.
    density: {
      comfortable: { handle: "mt-3", header: "gap-1.5 p-6 pb-4", body: "px-6 py-1", footer: "p-6 pt-4", title: "text-lg" },
      compact: { handle: "mt-2", header: "gap-1 p-4 pb-3", body: "px-4 py-1", footer: "p-4 pt-3", title: "text-base" },
    },
  },
  defaultVariants: {
    side: "left",
    size: "md",
    density: "comfortable",
  },
})

type SheetSlots = ReturnType<typeof sheetVariants>

type DragRegionProps = Pick<
  React.ComponentProps<"div">,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>

interface SheetContextValue {
  slots: SheetSlots
  layout: SheetLayout | null
  detent: SheetDetent
  setDetent: (detent: SheetDetent) => void
  /** The height on screen right now (px), 0 while floating: the handle's aria value. */
  visible: number
  /** The canvas height (px), the handle's aria scale. */
  canvasHeight: number
  titleId: string
  /** Pointer handlers + class for the drag regions (handle, header). Null while floating. */
  drag: { regionProps: DragRegionProps; regionClassName: string } | null
  /** Set by a drag's release so the click it produces on the handle doesn't also step it. */
  draggedRef: React.RefObject<boolean>
}

const [SheetProvider, useSheetContext] = createContext<SheetContextValue>("Sheet")

/** The next detent up, the way a tap on the handle (or Enter) moves it: back to half from full. */
function stepUp(d: SheetDetent): SheetDetent {
  return d === "peek" ? "half" : d === "half" ? "full" : "half"
}

export interface SheetProps
  extends Omit<React.ComponentProps<"aside">, "children">,
    VariantProps<typeof sheetVariants> {
  children?: React.ReactNode
  /** The detent on a narrow canvas (controlled). */
  detent?: SheetDetent
  /** The detent it starts at when uncontrolled. @default "half" */
  defaultDetent?: SheetDetent
  onDetentChange?: (detent: SheetDetent) => void
  /** Canvas width (px) at and above which the sheet floats instead of rising from the bottom. @default 768 */
  breakpoint?: number
  /** Height (px) of the `peek` detent: enough for the header and a row or two. @default 176 */
  peekHeight?: number
  /**
   * How much of the canvas the sheet covers, whenever that changes (layout, detent, width, and
   * on every frame of a drag). Feed it to a map's padding so it centres what is still visible.
   */
  onInsetChange?: (insets: SheetInsets) => void
}

export function Sheet({
  className,
  children,
  side,
  size,
  density,
  detent: detentProp,
  defaultDetent = "half",
  onDetentChange,
  breakpoint = 768,
  peekHeight = 176,
  onInsetChange,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SheetProps) {
  const resolvedSide = side ?? "left"
  const resolvedDensity = useDensity(density)
  const slots = sheetVariants({ side: resolvedSide, size, density: resolvedDensity })
  const titleId = React.useId()

  // The canvas is the element the sheet sits in. Its size is read through
  // useSyncExternalStore, so a resize re-renders without a set-state-in-effect.
  const [root, setRoot] = React.useState<HTMLElement | null>(null)
  const canvas = root?.parentElement ?? null
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!canvas) return () => {}
      const ro = new ResizeObserver(onChange)
      ro.observe(canvas)
      return () => ro.disconnect()
    },
    [canvas],
  )
  const measured = React.useSyncExternalStore(
    subscribe,
    () => (canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : ""),
    () => "",
  )
  const [canvasWidth, canvasHeight] = measured ? measured.split("x").map(Number) : [0, 0]
  const layout: SheetLayout | null = measured ? (canvasWidth >= breakpoint ? "floating" : "bottom") : null

  // Controlled or not: the owner's detent wins when given.
  const [ownDetent, setOwnDetent] = React.useState<SheetDetent>(defaultDetent)
  const detent = detentProp ?? ownDetent
  const setDetent = React.useCallback(
    (next: SheetDetent) => {
      if (detentProp === undefined) setOwnDetent(next)
      onDetentChange?.(next)
    },
    [detentProp, onDetentChange],
  )

  // The three heights, from the canvas: peek fixed, half of it, full less a strip at the top.
  const full = Math.max(peekHeight, canvasHeight - FULL_GAP)
  const heights: Record<SheetDetent, number> = {
    peek: Math.min(peekHeight, full),
    half: Math.min(full, Math.max(peekHeight, Math.round(canvasHeight / 2))),
    full,
  }

  // Dragging: state changes only inside the pointer handlers; the gesture's own bookkeeping
  // lives in a ref that is never read during render.
  const [dragHeight, setDragHeight] = React.useState<number | null>(null)
  const gestureRef = React.useRef<{ y: number; h: number; lastY: number; lastT: number; v: number; now: number; active: boolean } | null>(null)
  const draggedRef = React.useRef(false)
  const visible = layout === "bottom" ? (dragHeight ?? heights[detent]) : 0

  function beginDrag(e: React.PointerEvent) {
    draggedRef.current = false
    gestureRef.current = { y: e.clientY, h: visible, lastY: e.clientY, lastT: e.timeStamp, v: 0, now: visible, active: false }
  }

  function moveDrag(e: React.PointerEvent) {
    const g = gestureRef.current
    if (!g) return
    const dy = e.clientY - g.y
    if (!g.active) {
      if (Math.abs(dy) < DRAG_SLOP) return
      g.active = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const dt = e.timeStamp - g.lastT
    // px per ms, positive while the sheet rises.
    if (dt > 0) g.v = (g.lastY - e.clientY) / dt
    g.lastY = e.clientY
    g.lastT = e.timeStamp
    // Follow the finger, with a little give below peek and none above full.
    const raw = g.h - dy
    g.now = raw < heights.peek ? heights.peek - (heights.peek - raw) * 0.3 : Math.min(heights.full, raw)
    setDragHeight(g.now)
  }

  function endDrag() {
    const g = gestureRef.current
    gestureRef.current = null
    if (!g?.active) return
    draggedRef.current = true
    // Project the release and settle on the nearest detent.
    const target = g.now + g.v * PROJECTION
    let best: SheetDetent = detent
    let nearest = Infinity
    for (const d of DETENTS) {
      const gap = Math.abs(heights[d] - target)
      if (gap < nearest) {
        nearest = gap
        best = d
      }
    }
    setDragHeight(null)
    setDetent(best)
  }

  const drag =
    layout === "bottom"
      ? {
          regionProps: { onPointerDown: beginDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag },
          // `touch-none` stops the browser scrolling under the gesture; `select-none` keeps a
          // header drag from selecting text.
          regionClassName: "touch-none select-none",
        }
      : null

  // Report what the sheet covers. The callback is read through a ref so a new function from
  // the owner on every render doesn't re-run this.
  const insetRef = React.useRef(onInsetChange)
  React.useEffect(() => {
    insetRef.current = onInsetChange
  })
  React.useEffect(() => {
    if (!root || !layout) return
    let insets: SheetInsets = { top: 0, right: 0, bottom: 0, left: 0 }
    if (layout === "bottom") {
      insets = { ...insets, bottom: visible }
    } else {
      // Measured, so the card's margin counts too, on both of its sides.
      const edge = resolvedSide === "left" ? root.offsetLeft : canvasWidth - root.offsetLeft - root.offsetWidth
      const covered = root.offsetWidth + edge * 2
      insets = resolvedSide === "left" ? { ...insets, left: covered } : { ...insets, right: covered }
    }
    insetRef.current?.(insets)
  }, [root, layout, visible, resolvedSide, canvasWidth, canvasHeight, size, className])

  const ctx: SheetContextValue = {
    slots,
    layout,
    detent,
    setDetent,
    visible,
    canvasHeight,
    titleId,
    drag,
    draggedRef,
  }

  return (
    <aside
      ref={setRoot}
      data-slot="sheet"
      data-layout={layout ?? undefined}
      data-detent={layout === "bottom" ? detent : undefined}
      data-dragging={dragHeight != null ? "" : undefined}
      data-side={resolvedSide}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? ariaLabelledBy : (ariaLabelledBy ?? titleId)}
      className={slots.root({ className })}
      style={layout === "bottom" ? { height: visible, ...style } : style}
      {...props}
    >
      <SheetProvider {...ctx}>
        <DensityProvider density={resolvedDensity}>{children}</DensityProvider>
      </SheetProvider>
    </aside>
  )
}

/** What content can read to adapt to the sheet: its current layout and detent, and a setter. */
export function useSheet(): { layout: SheetLayout | null; detent: SheetDetent; setDetent: (detent: SheetDetent) => void } {
  const { layout, detent, setDetent } = useSheetContext("useSheet")
  return { layout, detent, setDetent }
}

const DETENT_TEXT: Record<SheetDetent, string> = { peek: "Peek", half: "Half height", full: "Full height" }

export interface SheetHandleProps extends React.ComponentProps<"div"> {
  /** What the handle announces for each detent (its `aria-valuetext`), for your language. */
  detentLabels?: Partial<Record<SheetDetent, string>>
}

/**
 * SheetHandle: the grab bar of the bottom sheet, and its keyboard control: a focusable window
 * splitter (`role="separator"`) where ArrowUp and ArrowDown step between detents, Home and End
 * jump to the ends, and Enter or Space (or a tap) steps it up. It renders nothing while the
 * sheet floats.
 */
export function SheetHandle({
  className,
  detentLabels,
  onClick,
  onKeyDown,
  "aria-label": ariaLabel = "Resize the sheet",
  ...props
}: SheetHandleProps) {
  const { slots, layout, detent, setDetent, visible, canvasHeight, drag, draggedRef } = useSheetContext("SheetHandle")
  if (layout !== "bottom") return null
  const labels = { ...DETENT_TEXT, ...detentLabels }

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const i = DETENTS.indexOf(detent)
    const next: SheetDetent | null =
      e.key === "ArrowUp"
        ? DETENTS[Math.min(DETENTS.length - 1, i + 1)]
        : e.key === "ArrowDown"
          ? DETENTS[Math.max(0, i - 1)]
          : e.key === "Home"
            ? "peek"
            : e.key === "End"
              ? "full"
              : e.key === "Enter" || e.key === " "
                ? stepUp(detent)
                : null
    if (!next) return
    e.preventDefault()
    setDetent(next)
  }

  return (
    <div
      data-slot="sheet-handle"
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={canvasHeight ? Math.round((visible / canvasHeight) * 100) : 0}
      aria-valuetext={labels[detent]}
      className={slots.handle({ className: cn(drag?.regionClassName, className) })}
      onClick={(e) => {
        onClick?.(e)
        // The click a drag's release produces is not a tap.
        if (draggedRef.current) {
          draggedRef.current = false
          return
        }
        if (!e.defaultPrevented) setDetent(stepUp(detent))
      }}
      onKeyDown={onKey}
      {...drag?.regionProps}
      {...props}
    />
  )
}

/**
 * SheetHeader: the title block at the top. On a bottom sheet it doubles as a drag region, so the
 * whole top of the sheet can be grabbed, not just the handle.
 */
export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, drag } = useSheetContext("SheetHeader")
  return (
    <div
      data-slot="sheet-header"
      className={slots.header({ className: cn(drag?.regionClassName, className) })}
      {...drag?.regionProps}
      {...props}
    />
  )
}

/** SheetTitle: the sheet's name. The sheet is labelled by it unless you pass an `aria-label`. */
export function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { slots, titleId } = useSheetContext("SheetTitle")
  return <h2 id={titleId} data-slot="sheet-title" className={slots.title({ className })} {...props} />
}

export function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useSheetContext("SheetDescription")
  return <p data-slot="sheet-description" className={slots.description({ className })} {...props} />
}

/** SheetBody: the scrollable content between header and footer. */
export function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSheetContext("SheetBody")
  return <div data-slot="sheet-body" className={slots.body({ className })} {...props} />
}

/**
 * SheetFooter: a row pinned to the sheet's bottom edge. On a bottom sheet that edge is the
 * canvas's own, so what sits here (an app's tab bar, the primary action) stays in reach at any
 * detent while the body scrolls above it. A lone child fills the row.
 */
export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSheetContext("SheetFooter")
  return <div data-slot="sheet-footer" className={slots.footer({ className })} {...props} />
}
