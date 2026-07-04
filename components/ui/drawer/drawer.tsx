"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, Slot } from "radix-ui"
import { X, CaretLeft } from "@phosphor-icons/react"

import { DensityProvider, useDensity, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Drawer: a panel that slides in from an edge of the viewport. Built on Radix Dialog
 * (focus trap, scroll lock, Escape, a11y, exit animations via Presence), the same
 * foundation as Dialog, specialized into an edge sheet. Pattern: one `tv` recipe with
 * `slots`; `side`, `size` and `density` flow to the parts through a typed Context.
 *
 * Mobile is a first-class target, not an afterthought:
 *  - Side panels are `w-full max-w-*`: they fill a phone screen but cap to a panel on
 *    desktop. `bottom` is the native mobile sheet (rounded top, grab handle, safe-area
 *    inset for the home indicator); `top` mirrors it for notifications/menus.
 *  - **Swipe-to-dismiss** (`swipeToClose`, on by default): drag the handle or header
 *    toward the edge to flick the drawer closed, the gesture every mobile user expects.
 *    The drag only arms after a small slop so taps on header controls still register, and
 *    it never starts on the scrollable body, so a drag and a scroll never fight.
 *
 * Animation uses the `ease-drawer` curve + `duration-base` tokens (lib/motion.ts), the
 * dedicated sheet easing. See docs/ARCHITECTURE.md §2.
 */

export type DrawerSide = "top" | "right" | "bottom" | "left"

export const drawerVariants = tv({
  slots: {
    // Fixed dark scrim (not a theme token): it must darken behind the sheet in every theme.
    overlay: [
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    content: [
      "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-lg",
      // Expose this surface so nested inputs blend with the drawer (not the page).
      "[--surface:var(--popover)] border-border-soft",
      // Radix focuses the content container on open (tabIndex -1) for SR announcement;
      // suppress its focus ring so the whole sheet isn't outlined.
      "outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "duration-base ease-drawer",
    ],
    // The grab handle on bottom/top sheets: the universal "drag me" affordance. The bar
    // stays a slim 6px, but a transparent pseudo-element widens its drag/touch target well
    // past 40px (polish) so it's easy to grab with a thumb.
    handle: [
      "mx-auto h-1.5 w-12 shrink-0 cursor-grab rounded-full bg-border transition-colors duration-fast ease-out active:cursor-grabbing hover:bg-muted-foreground/40",
      "relative before:absolute before:-inset-x-6 before:-inset-y-2.5 before:content-['']",
    ],
    close: [
      "absolute top-4 right-4 z-10 inline-flex cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      // Extend the sub-40px button to a 40×40 hit target without enlarging the glyph (#16).
      "before:absolute before:inset-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
    ],
    header: "flex flex-col",
    // The body scrolls within the flex column. `min-h-0` lets it shrink below its content
    // so `overflow-y-auto` actually engages (flex-basis would otherwise pin the height).
    body: "min-h-0 flex-1 overflow-y-auto",
    footer: "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    title: "leading-none font-semibold tracking-tight text-pretty",
    description: "text-sm text-pretty text-muted-foreground",
    // In-sheet navigation. `nav` is the viewport: it clips the sliding views and animates
    // its height to whichever view is active. `view` is one page in the stack; it enters
    // with a horizontal push (direction set at runtime). `navBack` is the back affordance.
    nav: "relative overflow-hidden transition-[height] duration-base ease-drawer",
    view: "flex flex-col",
    navBack: [
      "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      // Extend the sub-40px button to a 40×40 hit target without enlarging the glyph (#16).
      "relative before:absolute before:inset-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
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
        // Pad past the home indicator on devices that report a safe-area inset.
        content: "inset-x-0 bottom-0 w-full rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        handle: "mt-1",
      },
      left: {
        content: "inset-y-0 left-0 h-full w-full rounded-r-xl border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
      },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). `comfortable`
    // is the marketing default; `compact` tightens padding/gaps for application UI.
    density: {
      comfortable: { handle: "mt-3", close: "size-7", navBack: "size-7", header: "gap-1.5 p-6 pb-4", body: "px-6 py-1", footer: "p-6 pt-4", title: "text-lg" },
      compact: { handle: "mt-2", close: "size-6", navBack: "size-6", header: "gap-1 p-4 pb-3", body: "px-4 py-1", footer: "p-4 pt-3", title: "text-base" },
    },
    // `size` caps the panel's cross-axis extent: width for left/right, height for top/bottom.
    // The two orientations read the same token differently, so the values live in the
    // side-grouped compounds below; this axis only declares the keys.
    size: {
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  compoundVariants: [
    // Side panels (left/right): `size` caps the width, full-bleed on phones, a panel on desktop.
    { side: ["left", "right"], size: "sm", class: { content: "max-w-sm" } },
    { side: ["left", "right"], size: "md", class: { content: "max-w-md" } },
    { side: ["left", "right"], size: "lg", class: { content: "max-w-lg" } },
    { side: ["left", "right"], size: "xl", class: { content: "max-w-xl" } },
    // Sheets (top/bottom): `size` caps the height. `dvh` tracks the *visible* viewport so a
    // mobile browser's collapsing toolbar never clips the sheet.
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
  /** Pointer handlers + class for the draggable regions (handle, header). Null when swipe is off. */
  swipe: { regionProps: SwipeRegionProps; regionClassName: string } | null
}

const [DrawerProvider, useDrawerContext] = createContext<DrawerContextValue>("Drawer")

/** Root: controls open state. Pass-through to Radix (`open` / `onOpenChange`). */
export const Drawer = DialogPrimitive.Root

/** Trigger: use with `asChild` to make any element open the drawer. */
export const DrawerTrigger = DialogPrimitive.Trigger

/** Close: use with `asChild` on footer buttons to dismiss the drawer. */
export const DrawerClose = DialogPrimitive.Close

// Swipe-to-dismiss
// Which axis a side is dragged along, and the sign of the *closing* direction (px).
const SWIPE_AXIS: Record<DrawerSide, { axis: "x" | "y"; sign: 1 | -1 }> = {
  top: { axis: "y", sign: -1 },
  right: { axis: "x", sign: 1 },
  bottom: { axis: "y", sign: 1 },
  left: { axis: "x", sign: -1 },
}
// Movement (px) before a drag is recognized; below this, the press stays a tap/click so
// buttons inside the header still fire.
const SWIPE_SLOP = 6

type SwipeRegionProps = Pick<
  React.ComponentProps<"div">,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
>

/**
 * Drag-to-dismiss for the drawer, lint-safe (no set-state-in-effect, no refs read during
 * render). State (`offset`, `dragging`) updates only inside pointer handlers. The closing
 * direction follows `side`; dragging the *wrong* way is clamped so the sheet can't be
 * pulled off its edge. Past ~45% of the panel (or a fast flick) the gesture clicks the
 * hidden Close, handing the exit animation back to Radix; otherwise it springs back.
 */
function useDrawerSwipe(side: DrawerSide, enabled: boolean) {
  const [offset, setOffset] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)

  // Mutated only in handlers, never read during render.
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
      // Only commit to a drag once it clears the slop AND is mostly along the close axis,
      // so a header tap or a cross-axis swipe is never hijacked.
      if (Math.abs(delta) < SWIPE_SLOP || Math.abs(delta) <= Math.abs(crossDelta)) return
      active.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    // Distance traveled toward the closing edge; resist (rubber-band) the opposite way.
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
    // Distance traveled toward the closing edge, read straight from the last pointer sample
    // (never from render state, so no ref is written during render).
    const startPoint = axis === "x" ? start.current.x : start.current.y
    const traveled = Math.max(0, (last.current.pos - startPoint) * sign)
    const flickedOut = last.current.velocity * sign > 0.5 && traveled > 40
    const draggedPast = dim > 0 && traveled > dim * 0.45

    if (el && (flickedOut || draggedPast)) {
      // Hand off to Radix's exit animation. Keep `dragging` true so the snap-back transition
      // doesn't compete with the exit keyframe (both animate `transform`); the content
      // unmounts on close, discarding this state.
      el.querySelector<HTMLElement>("[data-drawer-close]")?.click()
    } else {
      // Spring back to the edge: the re-enabled transition animates offset → 0.
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
  // `touch-none` stops the browser from scrolling/refreshing under the gesture; `select-none`
  // keeps a title-drag from selecting text.
  return { offset, dragging, regionProps, regionClassName: "touch-none select-none" }
}

export interface DrawerContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  /** Hide the built-in top-right close button. */
  showClose?: boolean
  /** Accessible label for the built-in close button. */
  closeLabel?: string
  /** Show the grab handle on `top` / `bottom` sheets. @default true */
  showHandle?: boolean
  /** Enable drag-to-dismiss from the handle and header. @default true */
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
  ...props
}: DrawerContentProps) {
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
          // No transition while the finger drives it (1:1 follow); spring back otherwise.
          className: cn(
            swipe.dragging ? "transition-none will-change-transform" : "transition-transform",
            className,
          ),
        })}
        style={{ ...dragStyle, ...style }}
        {...props}
      >
        {/* Hidden Close target so swipe-to-dismiss reuses Radix's exit animation. */}
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

/**
 * DrawerHeader: the title block at the panel's edge. It doubles as a drag region for
 * swipe-to-dismiss, so users can grab the title area, not just the handle.
 */
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

/** DrawerBody: the scrollable content region between header and footer. */
export function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useDrawerContext("DrawerBody")
  return <div data-slot="drawer-body" className={slots.body({ className })} {...props} />
}

/** DrawerFooter: pinned action row at the panel's far edge. */
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

// In-sheet navigation
// A mobile bottom sheet often drills into nested views (an action sheet that opens a
// "Share to…" sub-panel, a settings menu, a filter flow) without ever leaving the sheet.
// `DrawerNav` is a small in-place navigation stack: it swaps `DrawerView` pages with a
// native horizontal push/pop, and resizes the sheet to fit whichever page is active.

type NavDirection = "forward" | "back"

interface DrawerNavContextValue {
  activeView: string
  /** null until the first navigation, so the root view doesn't horizontally slide on open. */
  direction: NavDirection | null
  canGoBack: boolean
  navigate: (view: string) => void
  back: () => void
  /** Callback ref the active view attaches so the viewport can size to it. */
  viewRef: (node: HTMLElement | null) => void
}

const [DrawerNavProvider, useDrawerNavContext] =
  createContext<DrawerNavContextValue>("DrawerNav")

/**
 * Public navigation handle for advanced flows: drive the stack from anywhere inside a
 * `DrawerNav` (e.g. navigate after an async action). Prefer `DrawerNavTrigger` /
 * `DrawerNavBack` for the common declarative cases.
 */
export function useDrawerNav() {
  const { activeView, canGoBack, navigate, back } = useDrawerNavContext("useDrawerNav")
  return { activeView, canGoBack, navigate, back }
}

/**
 * Measure an element's height into state via a ResizeObserver, lint-safe: the observer is
 * wired in a callback ref (commit phase, not render) and only its async callback calls
 * setState, never an effect body, and no ref is read during render. Drives the smooth
 * height transition as views of different sizes come and go.
 */
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
  /** The view shown first when the drawer opens. */
  defaultView: string
  /** Notified whenever the active view changes (push or pop). */
  onViewChange?: (view: string) => void
}

/**
 * DrawerNav: the in-sheet navigation stack. Wrap the `DrawerView` pages in it; place a
 * `DrawerNavTrigger` on any control that should drill in, and a `DrawerNavBack` in a view's
 * header to pop. The stack resets automatically when the drawer closes (the content
 * unmounts), so each open starts at `defaultView`.
 */
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
        // `auto` until the first measure, so opening the sheet doesn't animate from 0.
        style={{ height: height ?? "auto" }}
        {...props}
      >
        {children}
      </div>
    </DrawerNavProvider>
  )
}

export interface DrawerViewProps extends React.ComponentProps<"div"> {
  /** Identifier this page is shown for: matches `defaultView` / a `DrawerNavTrigger`'s `view`. */
  view: string
}

/**
 * DrawerView: one page in the navigation stack. Only the active page renders; it enters
 * with a horizontal push (from the right going forward, from the left on back). Compose
 * `DrawerHeader` / `DrawerBody` / `DrawerFooter` inside it exactly as in a flat drawer. A
 * view taller than the sheet should cap its own `DrawerBody` so the sheet stays bounded.
 */
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
          // No horizontal slide on the very first view (direction null): the sheet itself
          // is already sliding up; only animate once the user navigates.
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
  /** The `DrawerView` to push onto the stack when activated. */
  view: string
  /** Render the child element as the trigger (Radix Slot), merging the handler onto it. */
  asChild?: boolean
}

/** DrawerNavTrigger: drills into `view` when clicked. Wrap a row/button with `asChild`. */
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
  /** Accessible label for the back button. @default "Back" */
  label?: string
}

/**
 * DrawerNavBack: pops the stack. Renders nothing at the root view, so you can place it
 * unconditionally in a shared header. Defaults to a caret glyph; pass children to override.
 */
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
