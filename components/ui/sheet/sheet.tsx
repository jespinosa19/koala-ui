"use client"

import * as React from "react"

import { DensityProvider, useDensity } from "@/lib/density"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

export type SheetDetent = "peek" | "half" | "full"
export type SheetLayout = "floating" | "bottom"
export type SheetSide = "left" | "right"

export interface SheetInsets {
  top: number
  right: number
  bottom: number
  left: number
}

const DETENTS: SheetDetent[] = ["peek", "half", "full"]
const DRAG_SLOP = 6
const PROJECTION = 220
const FULL_GAP = 56

export const sheetVariants = tv({
  slots: {
    root: [
      "absolute z-10 flex flex-col overflow-hidden",
      "border-border-soft bg-popover text-popover-foreground shadow-xl outline-none",
      "[--surface:var(--popover)]",
      "[&:not([data-layout])]:invisible",
      "data-[layout=floating]:inset-y-3 data-[layout=floating]:max-w-[calc(100%-1.5rem)] data-[layout=floating]:rounded-2xl data-[layout=floating]:border",
      "data-[layout=bottom]:inset-x-0 data-[layout=bottom]:bottom-0 data-[layout=bottom]:w-auto data-[layout=bottom]:max-w-none",
      "data-[layout=bottom]:rounded-t-2xl data-[layout=bottom]:border-t",
      "data-[layout=bottom]:pb-[env(safe-area-inset-bottom)]",
      "transition-[height,width] duration-base ease-drawer data-[dragging]:transition-none motion-reduce:transition-none",
    ],
    handle: [
      "relative mx-auto h-1.5 w-12 shrink-0 cursor-grab touch-none rounded-full bg-border select-none active:cursor-grabbing",
      "transition-colors duration-fast ease-out hover:bg-muted-foreground/40",
      "before:absolute before:-inset-x-6 before:-inset-y-[17px] before:content-['']",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
    ],
    header: "flex shrink-0 flex-col",
    body: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
    footer: "mt-auto flex shrink-0 items-center gap-2 [&>:only-child]:min-w-0 [&>:only-child]:flex-1",
    title: "leading-none font-semibold tracking-tight text-pretty",
    description: "text-sm text-pretty text-muted-foreground",
  },
  variants: {
    side: {
      left: { root: "data-[layout=floating]:left-3" },
      right: { root: "data-[layout=floating]:right-3" },
    },
    size: {
      sm: { root: "w-sm" },
      md: { root: "w-md" },
      lg: { root: "w-lg" },
      xl: { root: "w-xl" },
    },
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
  visible: number
  canvasHeight: number
  titleId: string
  drag: { regionProps: DragRegionProps; regionClassName: string } | null
  draggedRef: React.RefObject<boolean>
}

const [SheetProvider, useSheetContext] = createContext<SheetContextValue>("Sheet")

function stepUp(d: SheetDetent): SheetDetent {
  return d === "peek" ? "half" : d === "half" ? "full" : "half"
}

export interface SheetProps
  extends Omit<React.ComponentProps<"aside">, "children">,
    VariantProps<typeof sheetVariants> {
  children?: React.ReactNode
  detent?: SheetDetent
  defaultDetent?: SheetDetent
  onDetentChange?: (detent: SheetDetent) => void
  breakpoint?: number
  peekHeight?: number
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

  const [ownDetent, setOwnDetent] = React.useState<SheetDetent>(defaultDetent)
  const detent = detentProp ?? ownDetent
  const setDetent = React.useCallback(
    (next: SheetDetent) => {
      if (detentProp === undefined) setOwnDetent(next)
      onDetentChange?.(next)
    },
    [detentProp, onDetentChange],
  )

  const full = Math.max(peekHeight, canvasHeight - FULL_GAP)
  const heights: Record<SheetDetent, number> = {
    peek: Math.min(peekHeight, full),
    half: Math.min(full, Math.max(peekHeight, Math.round(canvasHeight / 2))),
    full,
  }

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
    if (dt > 0) g.v = (g.lastY - e.clientY) / dt
    g.lastY = e.clientY
    g.lastT = e.timeStamp
    const raw = g.h - dy
    g.now = raw < heights.peek ? heights.peek - (heights.peek - raw) * 0.3 : Math.min(heights.full, raw)
    setDragHeight(g.now)
  }

  function endDrag() {
    const g = gestureRef.current
    gestureRef.current = null
    if (!g?.active) return
    draggedRef.current = true
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
          regionClassName: "touch-none select-none",
        }
      : null

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

export function useSheet(): { layout: SheetLayout | null; detent: SheetDetent; setDetent: (detent: SheetDetent) => void } {
  const { layout, detent, setDetent } = useSheetContext("useSheet")
  return { layout, detent, setDetent }
}

const DETENT_TEXT: Record<SheetDetent, string> = { peek: "Peek", half: "Half height", full: "Full height" }

export interface SheetHandleProps extends React.ComponentProps<"div"> {
  detentLabels?: Partial<Record<SheetDetent, string>>
}

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

export function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { slots, titleId } = useSheetContext("SheetTitle")
  return <h2 id={titleId} data-slot="sheet-title" className={slots.title({ className })} {...props} />
}

export function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useSheetContext("SheetDescription")
  return <p data-slot="sheet-description" className={slots.description({ className })} {...props} />
}

export function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSheetContext("SheetBody")
  return <div data-slot="sheet-body" className={slots.body({ className })} {...props} />
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSheetContext("SheetFooter")
  return <div data-slot="sheet-footer" className={slots.footer({ className })} {...props} />
}
