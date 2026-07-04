"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { CheckCircle, Warning, XCircle, Info, X } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { type ToastData, startDismiss } from "./use-toast"

/**
 * Toast: a multi-part component over Radix Toast (swipe-to-dismiss, keyboard, a11y).
 * Stacking logic lives in Toaster; this file owns the visual recipe and the per-toast item.
 *
 * Architecture: the <li> (Toast.Root) is a transparent positioner. Its transform and
 * opacity are driven by the Toaster's stacking engine via inline style. The inner <div>
 * (surface) owns all visible styling and the enter/exit animations, keeping both axes of
 * motion independent so they never fight each other.
 *
 * polish applied:
 *   #1  : concentric radius: viewport rounded-xl, surface rounded-xl (viewport is not visible so no nesting issue)
 *   #3  : shadow-lg + ring-border (an inset hairline) so every toast reads as a lifted card and
 *         never gets lost on a blank corner. Status colour is carried by the icon, not the edge
 *         (matching Alert). Stock utilities, so no arbitrary class needs JIT-generating.
 *   #6  : subtle exit: slides right (direction-hinting) with a shorter implicit 200 ms
 *   #11 : surface rests on bg-popover so it reads as elevated above the page (matters in
 *         dark/cream/moonlight, where popover is lighter than the background).
 *   #12 : close + action buttons use active:scale-[0.96] (scale is in their transition list)
 *   #14 : transition specifies exact properties, never "all"
 *   #16 : the 24px close target is padded out to a 40px hit area with a ::before pseudo
 */
export const toastVariants = tv({
  slots: {
    // Transparent positioner <li>: stacking transform plus opacity-on-exit live here.
    // Transition is fully owned by getStackStyle inline styles (never Tailwind class)
    // so there is no specificity conflict between the two.
    root: [
      "absolute bottom-0 left-0 right-0",
    ],
    // Visible card surface <div>.
    surface: [
      "relative flex w-full items-start gap-3 rounded-xl bg-popover p-4",
      // polish/#3: a clear theme-aware border + a strong drop shadow so the card always reads
      // as lifted and never gets lost on a blank corner. Uses stock utilities (shadow + ring,
      // which compose through Tailwind's ring var system) rather than a bespoke [box-shadow:…]
      // arbitrary value, so no new class has to be JIT-generated and HMR picks it up at once.
      "shadow-lg ring-1 ring-inset ring-border",
      // Enter/exit animation only on translate + opacity (never "all").
      "transition-[opacity,translate] duration-300 ease-out",
    ],
    iconWrap: "mt-px shrink-0 [&_svg]:size-[18px]",
    content: "flex min-w-0 flex-1 flex-col gap-0.5 pr-5",
    title: "text-sm font-semibold leading-snug",
    description: "text-sm text-pretty leading-snug text-muted-foreground",
    close: [
      "absolute top-3 right-3",
      "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md",
      // polish/#16: pad the 24px target out to a 40px hit area without changing its look.
      "before:absolute before:-inset-2 before:content-['']",
      "text-muted-foreground/60",
      // polish/#14: scale is its own property in v4, so list it or active:scale snaps.
      "transition-[color,background-color,scale] duration-fast ease-out",
      // polish/#12
      "active:scale-[0.96]",
      "hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      "[&_svg]:size-3.5 [&_svg]:pointer-events-none",
    ],
    action: [
      "mt-2 inline-flex h-7 cursor-pointer items-center rounded-md px-2.5 text-xs font-medium",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "active:scale-[0.96]",
    ],
  },
  variants: {
    variant: {
      // Every variant shares the same neutral elevation (border + shadow on the base surface);
      // the status colour is carried by the icon and action button only, matching Alert.
      default: {
        iconWrap: "text-muted-foreground",
        action: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      success: {
        iconWrap: "text-success",
        action: "bg-success/10 text-success hover:bg-success/20",
      },
      warning: {
        iconWrap: "text-warning",
        action: "bg-warning/10 text-warning hover:bg-warning/20",
      },
      destructive: {
        iconWrap: "text-destructive",
        action: "bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      info: {
        iconWrap: "text-info",
        action: "bg-info/10 text-info hover:bg-info/20",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const VARIANT_ICONS = {
  success: CheckCircle,
  warning: Warning,
  destructive: XCircle,
  info: Info,
} satisfies Partial<Record<NonNullable<ToastData["variant"]>, React.ElementType>>

export interface ToastItemProps {
  toast: ToastData
  /** Inline style containing the stack transform and z-index. */
  stackStyle: React.CSSProperties
  /** Fired on mount, resize, and unmount (null = cleanup). */
  onHeightChange: (id: string, height: number | null) => void
  /** Called when the cursor enters this toast: expands the stack. */
  onExpand: () => void
  /** Called when the cursor leaves this toast: starts the collapse timer. */
  onCollapse: () => void
  /** Optional ref to the positioner <li>. React 19: ref is a regular prop. */
  ref?: React.Ref<HTMLLIElement>
}

export function ToastItem({
  toast,
  stackStyle,
  onHeightChange,
  onExpand,
  onCollapse,
  ref,
}: ToastItemProps) {
  // polish: trigger enter animation after first paint.
  const [entered, setEntered] = React.useState(false)
  const surfaceRef = React.useRef<HTMLDivElement>(null)

  // Report surface height so Toaster can compute expanded-stack offsets.
  React.useLayoutEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    onHeightChange(toast.id, el.offsetHeight)
    const ro = new ResizeObserver(() => onHeightChange(toast.id, el.offsetHeight))
    ro.observe(el)
    return () => {
      ro.disconnect()
      onHeightChange(toast.id, null)
    }
  }, [toast.id, onHeightChange])

  React.useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const slots = toastVariants({ variant: toast.variant })
  const Icon = toast.variant && toast.variant !== "default" ? VARIANT_ICONS[toast.variant] : null

  return (
    <ToastPrimitive.Root
      ref={ref}
      open={toast.open}
      onOpenChange={open => {
        // Fires when Radix wants to close (duration elapsed or Close clicked).
        if (!open) startDismiss(toast.id)
      }}
      duration={toast.duration ?? 5000}
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      className={cn(
        slots.root(),
        // Exit: fade the positioner so Radix Presence detects transitionend (300 ms)
        // and the outer layer dissolves while the surface slides right.
        !toast.open && "opacity-0",
      )}
      style={stackStyle}
    >
      {/*
       * Surface <div>: handles the enter slide-up and exit slide-right independently
       * from the stacking transform on the <li> above.
       */}
      <div
        ref={surfaceRef}
        className={cn(
          slots.surface(),
          // Enter: start slightly below + transparent, then transition to resting state.
          !entered && "translate-y-2 opacity-0",
          // polish: exit slides right (directional cue).
          !toast.open && "translate-x-full",
        )}
      >
        {Icon && (
          <div className={slots.iconWrap()}>
            <Icon weight="fill" />
          </div>
        )}
        <div className={slots.content()}>
          {toast.title && (
            <ToastPrimitive.Title className={slots.title()}>
              {toast.title}
            </ToastPrimitive.Title>
          )}
          {toast.description && (
            <ToastPrimitive.Description className={slots.description()}>
              {toast.description}
            </ToastPrimitive.Description>
          )}
          {toast.action && (
            <ToastPrimitive.Action
              altText={toast.action.label}
              onClick={toast.action.onClick}
              className={slots.action()}
            >
              {toast.action.label}
            </ToastPrimitive.Action>
          )}
        </div>
        <ToastPrimitive.Close data-slot="toast-close" className={slots.close()}>
          <X weight="bold" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  )
}
