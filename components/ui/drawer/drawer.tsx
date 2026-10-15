"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, Slot } from "radix-ui"
import { X, CaretLeft } from "@phosphor-icons/react"

import { DensityProvider, useDensity, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox, hitBoxPositioned } from "@/lib/hit-area"
import { useFocusReturn } from "@/lib/focus-return"

export type DrawerSide = "top" | "right" | "bottom" | "left"

export const drawerVariants = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    content: [
      "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-lg",
      "[--surface:var(--popover)] border-border-soft",
      "outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "duration-base ease-drawer",
    ],
    handle: [
      "mx-auto h-1.5 w-12 shrink-0 cursor-grab rounded-full bg-border transition-colors duration-fast ease-out active:cursor-grabbing hover:bg-muted-foreground/40",
      "relative before:absolute before:-inset-x-6 before:-inset-y-[17px] before:content-['']",
    ],
    close: [
      "absolute top-4 right-4 z-10 inline-flex cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      hitBoxPositioned,
    ],
    header: "flex flex-col",
    body: "min-h-0 flex-1 overflow-y-auto",
    footer: "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    title: "leading-none font-semibold tracking-tight text-pretty",
    description: "text-sm text-pretty text-muted-foreground",
    nav: "relative overflow-hidden transition-[height] duration-base ease-drawer",
    view: "flex flex-col",
    navBack: [
      "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      hitBox,
    ],
  },
  variants: {
    side: {
      top: {
        content: "inset-x-0 top-0 w-full rounded-b-xl border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
        handle: "order-last mb-1",
      },
      right: {
        content: "inset-y-0 right-0 h-full w-full rounded-l-xl border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
      },
      bottom: {
        content: "inset-x-0 bottom-0 w-full rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        handle: "mt-1",
      },
      left: {
        content: "inset-y-0 left-0 h-full w-full rounded-r-xl border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
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

interface DrawerContextValue {
  slots: DrawerSlots
  side: DrawerSide
  swipe: { regionProps: SwipeRegionProps; regionClassName: string } | null
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

type SwipeRegionProps = Pick<
  React.ComponentProps<"div">,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>

function useDrawerSwipe(side: DrawerSide, enabled: boolean) {
  const [offset, setOffset] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)

  const armed = React.useRef(false)
  const active = React.useRef(false)
  const start = React.useRef({ x: 0, y: 0 })
  const last = React.useRef({ pos: 0, time: 0, velocity: 0 })
  const contentEl = React.useRef<HTMLElement | null>(null)

  const { axis, sign } = SWIPE_AXIS[side]

  function beginDrag(e: React.PointerEvent) {
    armed.current = true
    active.current = false
    start.current = { x: e.clientX, y: e.clientY }
    last.current = { pos: axis === "x" ? e.clientX : e.clientY, time: e.timeStamp, velocity: 0 }
    contentEl.current = (e.currentTarget as HTMLElement).closest<HTMLElement>(
      '[data-slot="drawer-content"]',
    )
  }

  function moveDrag(e: React.PointerEvent) {
    if (!armed.current) return
    const point = axis === "x" ? e.clientX : e.clientY
    const cross = axis === "x" ? e.clientY : e.clientX
    const delta = point - (axis === "x" ? start.current.x : start.current.y)
    const crossDelta = cross - (axis === "x" ? start.current.y : start.current.x)

    if (!active.current) {
      if (Math.abs(delta) < SWIPE_SLOP || Math.abs(delta) <= Math.abs(crossDelta)) return
      active.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    const closeAmount = delta * sign
    const resolved = closeAmount < 0 ? closeAmount * 0.25 : closeAmount

    const now = e.timeStamp
    const dt = now - last.current.time
    if (dt > 0) last.current.velocity = (point - last.current.pos) / dt
    last.current = { pos: point, time: now, velocity: last.current.velocity }

    setOffset(resolved * sign)
  }

  function endDrag() {
    armed.current = false
    if (!active.current) return
    active.current = false

    const el = contentEl.current
    const dim = el ? (axis === "x" ? el.offsetWidth : el.offsetHeight) : 0
    const startPoint = axis === "x" ? start.current.x : start.current.y
    const traveled = Math.max(0, (last.current.pos - startPoint) * sign)
    const flickedOut = last.current.velocity * sign > 0.5 && traveled > 40
    const draggedPast = dim > 0 && traveled > dim * 0.45

    if (el && (flickedOut || draggedPast)) {
      el.querySelector<HTMLElement>("[data-drawer-close]")?.click()
    } else {
      setDragging(false)
      setOffset(0)
    }
  }

  if (!enabled) {
    return { offset: 0, dragging: false, regionProps: {} as SwipeRegionProps, regionClassName: "" }
  }

  const regionProps: SwipeRegionProps = {
    onPointerDown: beginDrag,
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }
  return { offset, dragging, regionProps, regionClassName: "touch-none select-none" }
}

export interface DrawerContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  showClose?: boolean
  closeLabel?: string
  showHandle?: boolean
  swipeToClose?: boolean
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
  style,
  onCloseAutoFocus,
  onPointerDownOutside,
  ...props
}: DrawerContentProps) {
  const focusReturn = useFocusReturn({ onCloseAutoFocus, onPointerDownOutside })
  const resolvedSide = side ?? "right"
  const resolvedDensity = useDensity(density)
  const slots = drawerVariants({ side: resolvedSide, size, density: resolvedDensity })

  const swipe = useDrawerSwipe(resolvedSide, swipeToClose)
  const isSheet = resolvedSide === "top" || resolvedSide === "bottom"

  const dragStyle =
    SWIPE_AXIS[resolvedSide].axis === "x"
      ? { transform: `translateX(${swipe.offset}px)` }
      : { transform: `translateY(${swipe.offset}px)` }

  const ctx: DrawerContextValue = {
    slots,
    side: resolvedSide,
    swipe: swipeToClose ? { regionProps: swipe.regionProps, regionClassName: swipe.regionClassName } : null,
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={slots.overlay()} />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        data-side={resolvedSide}
        className={slots.content({
          className: cn(
            swipe.dragging ? "transition-none will-change-transform" : "transition-transform",
            className,
          ),
        })}
        style={{ ...dragStyle, ...style }}
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
              className={cn(slots.handle(), ctx.swipe?.regionClassName)}
              {...ctx.swipe?.regionProps}
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

export function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useDrawerContext("DrawerBody")
  return <div data-slot="drawer-body" className={slots.body({ className })} {...props} />
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
