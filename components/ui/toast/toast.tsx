"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { CheckCircle, Warning, XCircle, Info, X } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { hitBoxPositioned } from "@/lib/hit-area"
import { AnimatedLabel } from "@/components/ui/animated-label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { type ToastData, startDismiss } from "./use-toast"

export const toastVariants = tv({
  slots: {
    root: ["group/toast absolute bottom-0 left-0 right-0"],
    surface: [
      "relative flex w-full items-start gap-3 rounded-xl bg-popover p-4 [--surface:var(--popover)]",
      "shadow-lg ring-1 ring-inset ring-border",
      "transition-[opacity,translate] duration-base ease-out",
      "group-data-[swipe=move]/toast:translate-x-(--radix-toast-swipe-move-x) group-data-[swipe=move]/toast:transition-none",
      "group-data-[swipe=cancel]/toast:translate-x-0",
      "group-data-[swipe=end]/toast:translate-x-(--radix-toast-swipe-end-x)",
      "[--shake-distance:3px] motion-reduce:animate-none",
    ],
    iconWrap: "relative mt-px size-[18px] shrink-0 [&_svg]:size-[18px]",
    iconLayer: "absolute inset-0 grid place-items-center transition-[opacity,scale,filter] duration-fast ease-out",
    content: "flex min-w-0 flex-1 flex-col gap-0.5 pr-5",
    title: "text-sm font-semibold leading-snug",
    description: "text-sm text-pretty leading-snug text-muted-foreground",
    close: [
      "absolute top-3 right-3",
      "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md",
      hitBoxPositioned,
      "text-muted-foreground/60",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "active:scale-[0.96]",
      "hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      "[&_svg]:size-3.5 [&_svg]:pointer-events-none",
    ],
    action: "mt-2 self-start",
    anchored: [
      "pointer-events-none fixed z-[100] flex items-center gap-1.5 whitespace-nowrap",
      "rounded-lg bg-popover px-2.5 py-1.5 text-sm font-medium text-popover-foreground [--surface:var(--popover)]",
      "shadow-lg ring-1 ring-inset ring-border",
      "data-[side=top]:origin-bottom data-[side=bottom]:origin-top",
      "transition-[opacity,scale,translate] duration-fast ease-out",
      "[--shake-distance:2px] motion-reduce:animate-none",
    ],
  },
  variants: {
    variant: {
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
        action: "bg-destructive/10 text-destructive-strong hover:bg-destructive/20",
      },
      info: {
        iconWrap: "text-info",
        action: "bg-info/10 text-info hover:bg-info/20",
      },
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

const LAYER_SHOWN = "opacity-100 scale-100 blur-[0px]"
const LAYER_HIDDEN = "opacity-0 scale-[0.25] blur-[4px]"

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
  stackStyle: React.CSSProperties
  onHeightChange: (id: string, height: number | null) => void
  onExpand: () => void
  onCollapse: () => void
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
  const [entered, setEntered] = React.useState(false)
  const surfaceRef = React.useRef<HTMLDivElement>(null)

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
  const closeAfter = Number.isFinite(toast.duration) ? toast.duration + (toast.replay % 2) : toast.duration

  return (
    <ToastPrimitive.Root
      ref={ref}
      data-slot="toast"
      open={toast.open}
      type={toast.variant === "destructive" ? "foreground" : "background"}
      onOpenChange={open => {
        if (!open) startDismiss(toast.id)
      }}
      duration={closeAfter}
      onMouseEnter={onExpand}
      onMouseLeave={onCollapse}
      className={cn(
        slots.root(),
        !toast.open && "opacity-0",
      )}
      style={stackStyle}
    >
      <div
        ref={surfaceRef}
        data-slot="toast-surface"
        className={cn(
          slots.surface(),
          !entered && "translate-y-2 opacity-0",
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
            <ToastPrimitive.Action altText={toast.action.label} asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={toast.action.onClick}
                data-slot="toast-action"
                className={slots.action()}
              >
                {toast.action.label}
              </Button>
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

const ANCHOR_GAP = 8
const VIEWPORT_MARGIN = 8
const FLIP_THRESHOLD = 48

export interface AnchoredToastProps {
  toast: ToastData
}

export function AnchoredToast({ toast }: AnchoredToastProps) {
  const [entered, setEntered] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const rect = toast.anchorRect

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
        !entered && "scale-[0.96] opacity-0 data-[side=top]:translate-y-1 data-[side=bottom]:-translate-y-1",
        !toast.open && "scale-[0.96] opacity-0",
        replayClass(toast),
      )}
    >
      {(Icon || toast.wasLoading) && (
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
