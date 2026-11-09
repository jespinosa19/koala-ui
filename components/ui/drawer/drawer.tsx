"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, Slot } from "radix-ui"
import { X, CaretLeft } from "koala-icons"

import { DensityProvider, useDensity, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox, hitBoxPositioned } from "@/lib/hit-area"
import { useFocusReturn } from "@/lib/focus-return"
import { FLICK_VELOCITY, createVelocityTracker, rubberband } from "@/lib/gesture"
import { duration, prefersReducedMotion } from "@/lib/motion"

export type DrawerSide = "top" | "right" | "bottom" | "left"

export const drawerVariants = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50 bg-black/50",
      "transition-opacity duration-base ease-drawer motion-reduce:duration-fast",
      "starting:opacity-0",
      "data-[state=closed]:pointer-events-none data-[state=closed]:animate-presence-hold data-[state=closed]:opacity-0",
      "data-[swipe=dragging]:transition-none data-[swipe=release]:duration-fast",
    ],
    content: [
      "fixed z-50 flex flex-col bg-popover text-popover-foreground",
      "[--surface:var(--popover)] border-border-soft",
      "outline-none",
      "transition-[translate,opacity] duration-base ease-drawer motion-reduce:duration-fast",
      "data-[state=closed]:pointer-events-none data-[state=closed]:animate-presence-hold",
      "motion-reduce:starting:opacity-0 motion-reduce:data-[state=closed]:opacity-0",
      "data-[swipe=dragging]:transition-none data-[swipe=release]:duration-fast",
    ],
    handle: [
      "mx-auto h-1.5 w-12 shrink-0 cursor-grab rounded-full bg-border transition-colors duration-fast ease-out active:cursor-grabbing hover:bg-muted-foreground/40",
      "relative before:absolute before:-inset-x-6 before:-inset-y-[17px] before:content-['']",
    ],
    close: [
      "absolute top-4 right-4 z-10 inline-flex cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      hitBoxPositioned,
    ],
    header: "flex flex-col",
    body: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
    footer: "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    title: "leading-none font-semibold tracking-tight text-pretty",
    description: "text-sm text-pretty text-muted-foreground",
    nav: "relative overflow-hidden transition-[height] duration-base ease-drawer",
    view: "flex flex-col",
    navBack: [
      "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      hitBox,
    ],
  },
  variants: {
    side: {
      top: {
        content: "inset-x-0 top-0 w-full rounded-b-xl border-b motion-safe:starting:-translate-y-full motion-safe:data-[state=closed]:-translate-y-full",
        handle: "order-last mb-1",
      },
      right: {
        content: "inset-y-0 right-0 h-full w-full rounded-l-xl border-l motion-safe:starting:translate-x-full motion-safe:data-[state=closed]:translate-x-full",
      },
      bottom: {
        content: "inset-x-0 bottom-0 w-full rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] motion-safe:starting:translate-y-full motion-safe:data-[state=closed]:translate-y-full",
        handle: "mt-1",
      },
      left: {
        content: "inset-y-0 left-0 h-full w-full rounded-r-xl border-r motion-safe:starting:-translate-x-full motion-safe:data-[state=closed]:-translate-x-full",
      },
    },
    density: {
      comfortable: { handle: "mt-3", close: "size-7", navBack: "size-7", header: "gap-1.5 p-6 pb-4", body: "px-6 py-1", footer: "p-6 pt-4", title: "text-lg" },
      compact: { handle: "mt-2", close: "size-6", navBack: "size-6", header: "gap-1 p-4 pb-3", body: "px-4 py-1", footer: "p-4 pt-3", title: "text-base" },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
    contained: {
      true: { overlay: "absolute", content: "absolute" },
      false: {},
    },
  },
  compoundVariants: [
    { side: ["left", "right"], size: "sm", class: { content: "max-w-sm" } },
    { side: ["left", "right"], size: "md", class: { content: "max-w-md" } },
    { side: ["left", "right"], size: "lg", class: { content: "max-w-lg" } },
    { side: ["left", "right"], size: "xl", class: { content: "max-w-xl" } },
    { side: ["top", "bottom"], size: "sm", class: { content: "max-h-[40dvh]" } },
    { side: ["top", "bottom"], size: "md", class: { content: "max-h-[60dvh]" } },
    { side: ["top", "bottom"], size: "lg", class: { content: "max-h-[80dvh]" } },
    { side: ["top", "bottom"], size: "xl", class: { content: "max-h-[92dvh]" } },
  ],
  defaultVariants: {
    side: "right",
    size: "md",
    density: "comfortable",
  },
})

type DrawerSlots = ReturnType<typeof drawerVariants>

interface DrawerSwipe {
  regionProps: SwipeRegionProps
  regionClassName: string
  bodyProps: SwipeRegionProps
  bodyClassName: string
}

interface DrawerContextValue {
  slots: DrawerSlots
  side: DrawerSide
  swipe: DrawerSwipe | null
}

const [DrawerProvider, useDrawerContext] = createContext<DrawerContextValue>("Drawer")

export const Drawer = DialogPrimitive.Root

export const DrawerTrigger = DialogPrimitive.Trigger

export const DrawerClose = DialogPrimitive.Close

const SWIPE_AXIS: Record<DrawerSide, { axis: "x" | "y"; sign: 1 | -1 }> = {
  top: { axis: "y", sign: -1 },
  right: { axis: "x", sign: 1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
}
const SWIPE_SLOP = 6
const DISMISS_FRACTION = 0.4
const RUBBERBAND = 0.55
const NO_DRAG =
  '[data-no-drag], input, textarea, select, [contenteditable=""], [contenteditable="true"]'

type SwipeRegionProps = Pick<
  React.ComponentProps<"div">,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>

function atCloseEdge(el: HTMLElement, sign: 1 | -1) {
  if (sign === 1) return el.scrollTop <= 0
  return el.scrollTop >= el.scrollHeight - el.clientHeight - 1
}

function syncBodyTouchAction(el: HTMLElement, side: DrawerSide) {
  const { axis, sign } = SWIPE_AXIS[side]
  if (axis === "x") return
  el.style.touchAction = atCloseEdge(el, sign) ? (sign === 1 ? "pan-x pan-down" : "pan-x pan-up") : ""
}

function hasTextSelection() {
  const selection = typeof window === "undefined" ? null : window.getSelection()
  return !!selection && !selection.isCollapsed && selection.toString().length > 0
}

function unrubberband(offset: number, dimension: number) {
  const r = Math.min(Math.abs(offset), dimension * 0.999)
  return -((dimension / RUBBERBAND) * (r / (dimension - r)))
}

function useDrawerSwipe(side: DrawerSide, enabled: boolean) {
  const [tracker] = React.useState(createVelocityTracker)
  const overlayRef = React.useRef<HTMLDivElement | null>(null)

  const gesture = React.useRef({
    armed: false,
    active: false,
    fromBody: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    origin: 0,
    base: 0,
    dimension: 0,
    offset: 0,
    content: null as HTMLElement | null,
    settle: 0,
  })

  const { axis, sign } = SWIPE_AXIS[side]

  function write(closeAmount: number) {
    const g = gesture.current
    const el = g.content
    if (!el) return
    g.offset = closeAmount
    const resolved = closeAmount < 0 ? rubberband(closeAmount, g.dimension, RUBBERBAND) : closeAmount
    const value = resolved * sign
    el.style.translate = axis === "x" ? `${value}px 0` : `0 ${value}px`
    const overlay = overlayRef.current
    if (overlay && g.dimension > 0) {
      const progress = Math.min(1, Math.max(0, resolved / g.dimension))
      overlay.style.opacity = String(1 - progress)
    }
  }

  function setPhase(phase: "dragging" | "release" | null) {
    const targets = [gesture.current.content, overlayRef.current]
    for (const node of targets) {
      if (!node) continue
      if (phase) node.dataset.swipe = phase
      else delete node.dataset.swipe
    }
  }

  function begin(e: React.PointerEvent<HTMLElement>, fromBody: boolean) {
    const g = gesture.current
    if (g.active) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (target?.closest(NO_DRAG)) return
    if (hasTextSelection()) return
    if (fromBody) {
      if (e.pointerType === "mouse") return
      if (axis === "y" && !atCloseEdge(e.currentTarget, sign)) return
    }
    const content = e.currentTarget.closest<HTMLElement>('[data-slot="drawer-content"]')
    if (!content || content.dataset.state === "closed") return

    g.armed = true
    g.active = false
    g.fromBody = fromBody
    g.pointerId = e.pointerId
    g.startX = e.clientX
    g.startY = e.clientY
    g.content = content
  }

  function activate(e: React.PointerEvent<HTMLElement>, point: number) {
    const g = gesture.current
    const el = g.content
    if (!el) return
    window.clearTimeout(g.settle)
    const before = el.getBoundingClientRect()
    setPhase("dragging")
    el.style.translate = "none"
    const rest = el.getBoundingClientRect()
    const live = (axis === "x" ? before.left - rest.left : before.top - rest.top) * sign
    g.dimension = axis === "x" ? el.offsetWidth : el.offsetHeight
    g.base = live < 0 ? unrubberband(live, g.dimension) : live
    g.origin = point
    g.active = true
    tracker.reset(point, e.timeStamp)
    e.currentTarget.setPointerCapture(e.pointerId)
    write(g.base)
  }

  function move(e: React.PointerEvent<HTMLElement>) {
    const g = gesture.current
    if (!g.armed || e.pointerId !== g.pointerId) return
    const point = axis === "x" ? e.clientX : e.clientY

    if (!g.active) {
      const delta = point - (axis === "x" ? g.startX : g.startY)
      const cross = (axis === "x" ? e.clientY : e.clientX) - (axis === "x" ? g.startY : g.startX)
      if (Math.abs(delta) < SWIPE_SLOP) return
      if (Math.abs(delta) <= Math.abs(cross) || (g.fromBody && axis === "y" && delta * sign < 0)) {
        g.armed = false
        return
      }
      activate(e, point)
      return
    }

    tracker.add(point, e.timeStamp)
    write(g.base + (point - g.origin) * sign)
  }

  function settleBack() {
    const g = gesture.current
    const el = g.content
    setPhase("release")
    if (el) el.style.translate = ""
    if (overlayRef.current) overlayRef.current.style.opacity = ""
    g.settle = window.setTimeout(() => setPhase(null), duration.fast)
  }

  function dismiss() {
    const g = gesture.current
    const el = g.content
    if (!el) return
    setPhase(null)
    if (!prefersReducedMotion()) {
      el.style.translate = axis === "x" ? `${sign * 100}% 0` : `0 ${sign * 100}%`
    }
    if (overlayRef.current) overlayRef.current.style.opacity = "0"
    el.querySelector<HTMLElement>("[data-drawer-close]")?.click()
  }

  function end(e: React.PointerEvent<HTMLElement>, cancelled: boolean) {
    const g = gesture.current
    if (!g.armed || e.pointerId !== g.pointerId) return
    g.armed = false
    if (!g.active) return
    g.active = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    const velocity = tracker.velocity() * sign
    const travelled = g.offset
    const vetoed = velocity <= -FLICK_VELOCITY
    const shouldClose =
      !cancelled &&
      !vetoed &&
      travelled > 0 &&
      (travelled >= g.dimension * DISMISS_FRACTION || velocity >= FLICK_VELOCITY)

    if (shouldClose) dismiss()
    else settleBack()
  }

  if (!enabled) return { overlayRef, swipe: null }

  const regionProps: SwipeRegionProps = {
    onPointerDown: (e) => begin(e, false),
    onPointerMove: move,
    onPointerUp: (e) => end(e, false),
    onPointerCancel: (e) => end(e, true),
  }
  const bodyProps: SwipeRegionProps = {
    onPointerDown: (e) => begin(e, true),
    onPointerMove: move,
    onPointerUp: (e) => end(e, false),
    onPointerCancel: (e) => end(e, true),
  }
  const swipe: DrawerSwipe = {
    regionProps,
    regionClassName: cn("select-none", axis === "x" ? "touch-pan-y" : "touch-pan-x"),
    bodyProps,
    bodyClassName: axis === "x" ? "touch-pan-y" : "",
  }
  return { overlayRef, swipe }
}

export interface DrawerContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  showClose?: boolean
  closeLabel?: string
  showHandle?: boolean
  swipeToClose?: boolean
  container?: HTMLElement | null
}

export function DrawerContent({
  className,
  children,
  side,
  size,
  density,
  showClose = true,
  closeLabel = "Close",
  showHandle = true,
  swipeToClose = true,
  container,
  onCloseAutoFocus,
  onPointerDownOutside,
  ...props
}: DrawerContentProps) {
  const focusReturn = useFocusReturn({ onCloseAutoFocus, onPointerDownOutside })
  const resolvedSide = side ?? "right"
  const resolvedDensity = useDensity(density)
  const slots = drawerVariants({ side: resolvedSide, size, density: resolvedDensity, contained: !!container })

  const { overlayRef, swipe } = useDrawerSwipe(resolvedSide, swipeToClose)
  const isSheet = resolvedSide === "top" || resolvedSide === "bottom"

  const ctx: DrawerContextValue = { slots, side: resolvedSide, swipe }

  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay ref={overlayRef} data-slot="drawer-overlay" className={slots.overlay()} />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        data-side={resolvedSide}
        className={slots.content({ className })}
        {...props}
        {...focusReturn.contentProps}
      >
        {focusReturn.marker}
        <DialogPrimitive.Close data-drawer-close tabIndex={-1} aria-hidden className="sr-only" />

        <DrawerProvider {...ctx}>
          {isSheet && showHandle && (
            <div
              data-slot="drawer-handle"
              aria-hidden
              className={cn(slots.handle(), swipe?.regionClassName)}
              {...swipe?.regionProps}
            />
          )}
          <DensityProvider density={resolvedDensity}>{children}</DensityProvider>
        </DrawerProvider>

        {showClose && (
          <DialogPrimitive.Close aria-label={closeLabel} className={slots.close()}>
            <X weight="bold" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, swipe } = useDrawerContext("DrawerHeader")
  return (
    <div
      data-slot="drawer-header"
      className={slots.header({ className: cn(swipe?.regionClassName, className) })}
      {...swipe?.regionProps}
      {...props}
    />
  )
}

export function DrawerBody({ className, ref, onScroll, ...props }: React.ComponentProps<"div">) {
  const { slots, side, swipe } = useDrawerContext("DrawerBody")
  const tracksEdge = !!swipe && SWIPE_AXIS[side].axis === "y"

  const bodyRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      if (!node || !tracksEdge) {
        return () => {
          if (typeof ref === "function") ref(null)
          else if (ref) ref.current = null
        }
      }
      const sync = () => syncBodyTouchAction(node, side)
      sync()
      const observer = new ResizeObserver(sync)
      observer.observe(node)
      for (const child of Array.from(node.children)) observer.observe(child)
      return () => {
        observer.disconnect()
        node.style.touchAction = ""
        if (typeof ref === "function") ref(null)
        else if (ref) ref.current = null
      }
    },
    [ref, side, tracksEdge],
  )

  return (
    <div
      ref={bodyRef}
      data-slot="drawer-body"
      className={slots.body({ className: cn(swipe?.bodyClassName, className) })}
      onScroll={(e) => {
        onScroll?.(e)
        if (tracksEdge) syncBodyTouchAction(e.currentTarget, side)
      }}
      {...swipe?.bodyProps}
      {...props}
    />
  )
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useDrawerContext("DrawerFooter")
  return <div data-slot="drawer-footer" className={slots.footer({ className })} {...props} />
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  const { slots } = useDrawerContext("DrawerTitle")
  return (
    <DialogPrimitive.Title data-slot="drawer-title" className={slots.title({ className })} {...props} />
  )
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const { slots } = useDrawerContext("DrawerDescription")
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={slots.description({ className })}
      {...props}
    />
  )
}

type NavDirection = "forward" | "back"

interface DrawerNavContextValue {
  activeView: string
  direction: NavDirection | null
  canGoBack: boolean
  navigate: (view: string) => void
  back: () => void
  viewRef: (node: HTMLElement | null) => void
}

const [DrawerNavProvider, useDrawerNavContext] =
  createContext<DrawerNavContextValue>("DrawerNav")

export function useDrawerNav() {
  const { activeView, canGoBack, navigate, back } = useDrawerNavContext("useDrawerNav")
  return { activeView, canGoBack, navigate, back }
}

function useMeasuredHeight() {
  const [height, setHeight] = React.useState<number>()
  const observer = React.useRef<ResizeObserver | null>(null)

  const ref = React.useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect()
    if (!node) return
    const el = node
    function measure() {
      setHeight(el.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    observer.current = ro
  }, [])

  return [height, ref] as const
}

export interface DrawerNavProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  defaultView: string
  onViewChange?: (view: string) => void
}

export function DrawerNav({
  defaultView,
  onViewChange,
  className,
  children,
  ...props
}: DrawerNavProps) {
  const { slots } = useDrawerContext("DrawerNav")
  const [stack, setStack] = React.useState<string[]>([defaultView])
  const [direction, setDirection] = React.useState<NavDirection | null>(null)
  const [height, viewRef] = useMeasuredHeight()

  const activeView = stack[stack.length - 1]
  const canGoBack = stack.length > 1

  function navigate(view: string) {
    setDirection("forward")
    setStack((s) => [...s, view])
    onViewChange?.(view)
  }

  function back() {
    if (stack.length <= 1) return
    setDirection("back")
    setStack((s) => s.slice(0, -1))
    onViewChange?.(stack[stack.length - 2])
  }

  return (
    <DrawerNavProvider
      activeView={activeView}
      direction={direction}
      canGoBack={canGoBack}
      navigate={navigate}
      back={back}
      viewRef={viewRef}
    >
      <div
        data-slot="drawer-nav"
        className={slots.nav({ className })}
        style={{ height: height ?? "auto" }}
        {...props}
      >
        {children}
      </div>
    </DrawerNavProvider>
  )
}

export interface DrawerViewProps extends React.ComponentProps<"div"> {
  view: string
}

export function DrawerView({ view, className, children, ...props }: DrawerViewProps) {
  const { slots } = useDrawerContext("DrawerView")
  const { activeView, direction, viewRef } = useDrawerNavContext("DrawerView")

  if (activeView !== view) return null

  return (
    <div
      ref={viewRef}
      data-slot="drawer-view"
      data-direction={direction ?? undefined}
      className={slots.view({
        className: cn(
          direction && "animate-in duration-base ease-drawer",
          direction === "forward" && "slide-in-from-right",
          direction === "back" && "slide-in-from-left",
          className,
        ),
      })}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DrawerNavTriggerProps extends React.ComponentProps<"button"> {
  view: string
  asChild?: boolean
}

export function DrawerNavTrigger({
  view,
  asChild = false,
  onClick,
  ...props
}: DrawerNavTriggerProps) {
  const { navigate } = useDrawerNavContext("DrawerNavTrigger")
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="drawer-nav-trigger"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        if (!e.defaultPrevented) navigate(view)
      }}
      {...props}
    />
  )
}

export interface DrawerNavBackProps extends React.ComponentProps<"button"> {
  label?: string
}

export function DrawerNavBack({
  label = "Back",
  className,
  children,
  onClick,
  ...props
}: DrawerNavBackProps) {
  const { slots } = useDrawerContext("DrawerNavBack")
  const { canGoBack, back } = useDrawerNavContext("DrawerNavBack")

  if (!canGoBack) return null

  return (
    <button
      type="button"
      data-slot="drawer-nav-back"
      aria-label={label}
      className={slots.navBack({ className })}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) back()
      }}
      {...props}
    >
      {children ?? <CaretLeft weight="bold" />}
    </button>
  )
}

export type { Density }
