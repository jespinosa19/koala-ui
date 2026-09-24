"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { CheckCircle, Warning, XCircle, Info, X } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { hitBoxPositioned, hitX } from "@/lib/hit-area"
import { AnimatedLabel } from "@/components/ui/animated-label"
import { Spinner } from "@/components/ui/spinner"
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
 *   #6  : subtle exit: slides right (direction-hinting) on the base beat
 *   #7  : a loading toast's spinner cross-fades into its result icon (opacity + scale + blur),
 *         both layers mounted, instead of one glyph hard-cutting to another
 *   #11 : surface rests on bg-popover so it reads as elevated above the page (matters in
 *         dark/cream/moonlight, where popover is lighter than the background).
 *   #12 : close + action buttons use active:scale-[0.96] (scale is in their transition list)
 *   #14 : transition specifies exact properties, never "all"
 *   #16 : the 24px close and the 28px action reach 40px (44 on touch) through lib/hit-area.ts
 */
export const toastVariants = tv({
  slots: {
    // Transparent positioner <li>: stacking transform plus opacity-on-exit live here.
    // Transition is fully owned by getStackStyle inline styles (never Tailwind class)
    // so there is no specificity conflict between the two. `group/toast` lets the surface read
    // the swipe state Radix writes on this element.
    root: ["group/toast absolute bottom-0 left-0 right-0"],
    // Visible card surface <div>.
    surface: [
      "relative flex w-full items-start gap-3 rounded-xl bg-popover p-4 [--surface:var(--popover)]",
      // polish/#3: a clear theme-aware border + a strong drop shadow so the card always reads
      // as lifted and never gets lost on a blank corner. Uses stock utilities (shadow + ring,
      // which compose through Tailwind's ring var system) rather than a bespoke [box-shadow:…]
      // arbitrary value, so no new class has to be JIT-generated and HMR picks it up at once.
      "shadow-lg ring-1 ring-inset ring-border",
      // Enter/exit animation only on translate + opacity (never "all").
      "transition-[opacity,translate] duration-base ease-out",
      // Swipe: the card follows the finger. Radix writes the offsets on the <li> as custom
      // properties, which inherit; while dragging there is no transition, so it tracks 1:1.
      "group-data-[swipe=move]/toast:translate-x-(--radix-toast-swipe-move-x) group-data-[swipe=move]/toast:transition-none",
      "group-data-[swipe=cancel]/toast:translate-x-0",
      "group-data-[swipe=end]/toast:translate-x-(--radix-toast-swipe-end-x)",
      // Replay (the same id raised again): the shake's throw, and no replay under reduced motion.
      "[--shake-distance:3px] motion-reduce:animate-none",
    ],
    // A fixed box holding stacked icon layers, so the spinner and the result icon cross-fade in place.
    iconWrap: "relative mt-px size-[18px] shrink-0 [&_svg]:size-[18px]",
    iconLayer: "absolute inset-0 grid place-items-center transition-[opacity,scale,filter] duration-fast ease-out",
    content: "flex min-w-0 flex-1 flex-col gap-0.5 pr-5",
    title: "text-sm font-semibold leading-snug",
    description: "text-sm text-pretty leading-snug text-muted-foreground",
    close: [
      "absolute top-3 right-3",
      "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md",
      // polish/#16: pad the 24px target out to 40px (44 on touch) without changing its look. It is
      // already `absolute`, so it takes the positioned variant.
      hitBoxPositioned,
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
      hitX,
      "transition-[color,background-color,scale] duration-fast ease-out",
      "active:scale-[0.96]",
    ],
    // The anchored bubble ("Copied" beside a copy button): the same elevated surface in a chip's
    // proportions. Not interactive (no close, no action), so it never blocks the element under it.
    anchored: [
      "pointer-events-none fixed z-[100] flex items-center gap-1.5 whitespace-nowrap",
      "rounded-lg bg-popover px-2.5 py-1.5 text-sm font-medium text-popover-foreground [--surface:var(--popover)]",
      "shadow-lg ring-1 ring-inset ring-border",
      // It grows out of the element it points at: the bottom edge above it, the top edge below it.
      "data-[side=top]:origin-bottom data-[side=bottom]:origin-top",
      "transition-[opacity,scale,translate] duration-fast ease-out",
      "[--shake-distance:2px] motion-reduce:animate-none",
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
      // Work in flight: a muted spinner, until the same id is raised with its result.
      loading: {
        iconWrap: "text-muted-foreground",
        action: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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

// The cross-fade pair (make-interfaces #7), the same values CodeSnippet and Checklist swap with.
const LAYER_SHOWN = "opacity-100 scale-100 blur-[0px]"
const LAYER_HIDDEN = "opacity-0 scale-[0.25] blur-[4px]"

// A re-raised toast alternates between two animation names that play the same keyframes: swapping
// the name restarts the animation, so every repeat registers without a remove/reflow/add dance.
const REPLAY = {
  pop: ["animate-toast-pop-a", "animate-toast-pop-b"],
  shake: ["animate-shake-a", "animate-shake-b"],
} as const

function replayClass({ replay, variant }: ToastData): string | undefined {
  if (replay === 0 || variant === "loading") return undefined
  const kind = variant === "destructive" || variant === "warning" ? "shake" : "pop"
  return REPLAY[kind][replay % 2]
}

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
  const isLoading = toast.variant === "loading"
  const Icon =
    toast.variant && toast.variant !== "default" && toast.variant !== "loading"
      ? VARIANT_ICONS[toast.variant]
      : null
  // Radix only restarts its close timer when `duration` changes, so a re-raise with the same
  // duration would inherit the old countdown. A one-millisecond nudge on every replay restarts it.
  const closeAfter = Number.isFinite(toast.duration) ? toast.duration + (toast.replay % 2) : toast.duration

  return (
    <ToastPrimitive.Root
      ref={ref}
      data-slot="toast"
      open={toast.open}
      // An error interrupts (assertive); everything else waits its turn (polite).
      type={toast.variant === "destructive" ? "foreground" : "background"}
      onOpenChange={open => {
        // Fires when Radix wants to close (duration elapsed or Close clicked).
        if (!open) startDismiss(toast.id)
      }}
      duration={closeAfter}
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      className={cn(
        slots.root(),
        // Exit: fade the positioner so Radix Presence detects transitionend
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
        data-slot="toast-surface"
        className={cn(
          slots.surface(),
          // Enter: start slightly below + transparent, then transition to resting state.
          !entered && "translate-y-2 opacity-0",
          // polish: exit slides right (directional cue).
          !toast.open && "translate-x-full",
          replayClass(toast),
        )}
      >
        {(Icon || toast.wasLoading) && (
          <div data-slot="toast-icon" className={slots.iconWrap()}>
            {toast.wasLoading && (
              <span className={cn(slots.iconLayer(), isLoading ? LAYER_SHOWN : LAYER_HIDDEN)}>
                <Spinner aria-hidden />
              </span>
            )}
            {Icon && (
              <span className={cn(slots.iconLayer(), isLoading ? LAYER_HIDDEN : LAYER_SHOWN)}>
                <Icon weight="fill" />
              </span>
            )}
          </div>
        )}
        <div data-slot="toast-content" className={slots.content()}>
          {toast.title && (
            <ToastPrimitive.Title data-slot="toast-title" className={slots.title()}>
              {/* A toast born loading has a short status line that flips in place ("Saving…" →
                  "Saved"), so it rolls. Other titles stay plain, since the roll's snapshot can't wrap
                  a long line; their repeats are carried by the pop or the shake instead. */}
              {toast.wasLoading ? (
                <AnimatedLabel swapKey={toast.replay} align="start">
                  {toast.title}
                </AnimatedLabel>
              ) : (
                toast.title
              )}
            </ToastPrimitive.Title>
          )}
          {toast.description && (
            <ToastPrimitive.Description data-slot="toast-description" className={slots.description()}>
              {toast.description}
            </ToastPrimitive.Description>
          )}
          {toast.action && (
            <ToastPrimitive.Action
              altText={toast.action.label}
              onClick={toast.action.onClick}
              data-slot="toast-action"
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

// ─── Anchored ─────────────────────────────────────────────────────────────────

// How far the bubble sits from its element, and how close it may come to the viewport edge (px).
const ANCHOR_GAP = 8
const VIEWPORT_MARGIN = 8
// The room the bubble needs above its element before it flips below instead (px).
const FLIP_THRESHOLD = 48

export interface AnchoredToastProps {
  toast: ToastData
}

/**
 * AnchoredToast: the bubble a toast becomes when it is raised with `anchor` ("Copied" beside a copy
 * button). Rendered by Toaster outside the Radix viewport, whose centering transform would turn
 * `fixed` into positioned-to-the-viewport-box. The bubble is `aria-hidden`: Toaster's always-mounted
 * live region announces it instead, so it is heard once.
 */
export function AnchoredToast({ toast }: AnchoredToastProps) {
  const [entered, setEntered] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const rect = toast.anchorRect

  // Place against the anchor's rect, clamped to the viewport. Written straight to the node in a
  // layout effect (before paint, so it never flashes in the wrong place) because the bubble has to
  // be measured first, and a position held in state would render a frame late.
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || !rect) return
    const side = rect.top < FLIP_THRESHOLD ? "bottom" : "top"
    const width = el.offsetWidth
    const center = rect.left + rect.width / 2
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, center - width / 2),
      window.innerWidth - VIEWPORT_MARGIN - width,
    )
    const top = side === "top" ? rect.top - ANCHOR_GAP - el.offsetHeight : rect.bottom + ANCHOR_GAP
    el.style.left = `${left}px`
    el.style.top = `${top}px`
    el.dataset.side = side
  }, [rect, toast.title])

  React.useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const slots = toastVariants({ variant: toast.variant })
  const isLoading = toast.variant === "loading"
  const Icon =
    toast.variant && toast.variant !== "default" && toast.variant !== "loading"
      ? VARIANT_ICONS[toast.variant]
      : null

  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="toast-anchored"
      className={cn(
        slots.anchored(),
        // Enter: grows out of the element it points at, a hair off to its side.
        !entered && "scale-[0.96] opacity-0 data-[side=top]:translate-y-1 data-[side=bottom]:-translate-y-1",
        // Exit: softer than the enter, no travel (make-interfaces #6).
        !toast.open && "scale-[0.96] opacity-0",
        replayClass(toast),
      )}
    >
      {(Icon || toast.wasLoading) && (
        // The card's icon box at chip size: 16px, flush with the text.
        <span className={cn(slots.iconWrap(), "mt-0 size-4 [&_svg]:size-4")}>
          {toast.wasLoading && (
            <span className={cn(slots.iconLayer(), isLoading ? LAYER_SHOWN : LAYER_HIDDEN)}>
              <Spinner />
            </span>
          )}
          {Icon && (
            <span className={cn(slots.iconLayer(), isLoading ? LAYER_HIDDEN : LAYER_SHOWN)}>
              <Icon weight="fill" />
            </span>
          )}
        </span>
      )}
      {toast.title}
    </div>
  )
}
