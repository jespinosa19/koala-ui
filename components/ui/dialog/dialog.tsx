"use client"

import * as React from "react"
import { useLabels } from "@/lib/labels"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "koala-icons"

import { DensityProvider, useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBoxPositioned } from "@/lib/hit-area"
import { useFocusReturn } from "@/lib/focus-return"
import { Stepper, type StepperProps } from "@/components/ui/stepper"

export const dialogVariants = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50 bg-black/50",
      "data-stacked:bg-black/25",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    positioner: [
      "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
    ],
    content: [
      "relative grid w-full rounded-xl border border-border-soft bg-popover text-popover-foreground",
      "[--surface:var(--popover)]",
      "outline-none",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "duration-base ease-out",
      "scale-[calc(1-0.1*var(--dialog-nested,0))] translate-y-[calc(var(--dialog-nested,0)*-0.75rem)]",
      "transition-[scale,translate] motion-reduce:transition-none",
      "has-[[data-slot=dialog-body]]:flex has-[[data-slot=dialog-body]]:flex-col has-[[data-slot=dialog-body]]:max-h-[calc(100dvh-2rem)]",
    ],
    close: [
      "absolute inline-flex cursor-pointer items-center justify-center rounded-md",
      hitBoxPositioned,
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    header: "flex flex-col text-left [&:has(+[data-slot=dialog-footer])]:mb-0",
    stepper: "",
    body: "min-h-0 flex-1 overflow-y-auto scroll-fade scroll-py-10",
    footer: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    title: "text-base font-semibold tracking-tight text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    icon: "text-muted-foreground [&_svg]:shrink-0",
  },
  variants: {
    size: {
      sm: { content: "max-w-sm" },
      md: { content: "max-w-[30rem]" },
      lg: { content: "max-w-2xl" },
      xl: { content: "max-w-4xl" },
      media: { content: "aspect-video max-w-[min(96vw,calc(92dvh*16/9))] overflow-hidden border-0 bg-black" },
    },
    density: {
      comfortable: { content: "gap-4 p-5 [--dialog-inset:--spacing(5)]", header: "mb-2 gap-1", title: "leading-6", stepper: "-mx-5 px-5 pb-4", body: "-mx-5 px-5", footer: "mt-4", close: "top-4.5 right-3.5 size-7", icon: "-mb-2 [&_svg]:size-6" },
      compact: { content: "gap-3 p-4 [--dialog-inset:--spacing(4)]", header: "mb-2 gap-0.5", title: "leading-5", stepper: "-mx-4 px-4 pb-3", body: "-mx-4 px-4", footer: "mt-2", close: "top-3.5 right-3 size-6", icon: "-mb-1 [&_svg]:size-5" },
    },
    bordered: {
      true: {},
      false: {},
    },
    mobile: {
      sheet: {
        positioner: "max-sm:items-end max-sm:p-0",
        content: [
          "max-sm:max-w-none max-sm:max-h-[92dvh] max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0",
          "max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom",
          "max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100 max-sm:ease-drawer",
        ],
      },
      center: {},
    },
  },
  compoundVariants: [
    {
      bordered: true,
      density: "comfortable",
      class: { footer: "mt-1 -mx-5 -mb-5 border-t border-border px-5 py-4" },
    },
    {
      bordered: true,
      density: "compact",
      class: { footer: "mt-1 -mx-4 -mb-4 border-t border-border px-4 py-3" },
    },
    {
      size: "media",
      class: {
        content: [
          "gap-0 p-0",
          "[&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full",
          "[&_video]:absolute [&_video]:inset-0 [&_video]:size-full",
        ],
        close: "z-10 text-white/80 hover:bg-white/10 hover:text-white",
      },
    },
    {
      mobile: "sheet",
      density: "comfortable",
      class: { content: "max-sm:pb-[calc(var(--spacing)*5+env(safe-area-inset-bottom))]" },
    },
    {
      mobile: "sheet",
      density: "compact",
      class: { content: "max-sm:pb-[calc(var(--spacing)*4+env(safe-area-inset-bottom))]" },
    },
  ],
  defaultVariants: {
    size: "md",
    density: "comfortable",
    bordered: true,
    mobile: "sheet",
  },
})

type DialogStackEntry = { overlay: HTMLElement | null; positioner: HTMLElement | null }
const dialogStack = new Set<DialogStackEntry>()

function restackDialogs() {
  const open: HTMLElement[] = []
  for (const { overlay } of dialogStack) {
    if (overlay?.isConnected && overlay.getAttribute("data-state") === "open") open.push(overlay)
  }
  const follows = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  for (const { overlay, positioner } of dialogStack) {
    if (overlay) overlay.toggleAttribute("data-stacked", open.some((o) => o !== overlay && follows(o, overlay)))
    if (positioner) {
      const above = open.filter((o) => follows(positioner, o)).length
      if (above > 0) positioner.style.setProperty("--dialog-nested", String(Math.min(above, 2)))
      else positioner.style.removeProperty("--dialog-nested")
    }
  }
}

export function useDialogStack() {
  const entryRef = React.useRef<DialogStackEntry | null>(null)
  const attach = React.useCallback((part: keyof DialogStackEntry, node: HTMLElement) => {
    const entry = (entryRef.current ??= { overlay: null, positioner: null })
    entry[part] = node
    dialogStack.add(entry)
    restackDialogs()
    return () => {
      if (entry[part] === node) entry[part] = null
      if (!entry.overlay && !entry.positioner) dialogStack.delete(entry)
      restackDialogs()
    }
  }, [])
  const overlayRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (!node) return
      const detach = attach("overlay", node)
      const observer = new MutationObserver(restackDialogs)
      observer.observe(node, { attributes: true, attributeFilter: ["data-state"] })
      return () => {
        observer.disconnect()
        detach()
      }
    },
    [attach],
  )
  const positionerRef = React.useCallback(
    (node: HTMLElement | null) => (node ? attach("positioner", node) : undefined),
    [attach],
  )
  return { overlayRef, positionerRef }
}

export const Dialog = DialogPrimitive.Root

export const DialogTrigger = DialogPrimitive.Trigger

export const DialogClose = DialogPrimitive.Close

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    Pick<VariantProps<typeof dialogVariants>, "size" | "density" | "mobile"> {
  showClose?: boolean
  closeLabel?: string
}

export function DialogContent({
  className,
  children,
  size,
  density,
  mobile,
  showClose = true,
  closeLabel,
  style,
  onCloseAutoFocus,
  onPointerDownOutside,
  ...props
}: DialogContentProps) {
  const labels = useLabels()
  const focusReturn = useFocusReturn({ onCloseAutoFocus, onPointerDownOutside })
  const resolvedDensity = useDensity(density)
  const slots = dialogVariants({ size, density: resolvedDensity, mobile })
  const { overlayRef, positionerRef } = useDialogStack()

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay ref={overlayRef} data-slot="dialog-overlay" className={slots.overlay()} />
      <div ref={positionerRef} data-slot="dialog-positioner" className={slots.positioner()}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={slots.content({ className })}
          style={style}
          {...props}
          {...focusReturn.contentProps}
        >
          {focusReturn.marker}
          <DensityProvider density={resolvedDensity}>{children}</DensityProvider>
          {showClose && (
            <DialogPrimitive.Close aria-label={closeLabel ?? labels.close} className={slots.close()}>
              <X weight="bold" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  )
}

export function DialogIcon({ className, ...props }: React.ComponentProps<"div">) {
  const slots = dialogVariants({ density: useDensity() })
  return <div data-slot="dialog-icon" className={slots.icon({ className })} {...props} />
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const slots = dialogVariants({ density: useDensity() })
  return <div data-slot="dialog-header" className={slots.header({ className })} {...props} />
}

export interface DialogStepperProps extends StepperProps {
  bordered?: boolean
}

export function DialogStepper({
  className,
  variant,
  bordered = variant !== "bars",
  density,
  orientation = "horizontal",
  ...props
}: DialogStepperProps) {
  const resolvedDensity = useDensity(density)
  const slots = dialogVariants({ density: resolvedDensity })
  return (
    <Stepper
      data-slot="dialog-stepper"
      variant={variant}
      orientation={orientation}
      density={resolvedDensity}
      className={slots.stepper({
        className: cn(
          bordered && "border-b border-border",
          variant === "bars" && (resolvedDensity === "compact" ? "mx-0 px-0 pr-7 pb-2" : "mx-0 px-0 pr-8 pb-3"),
          className,
        ),
      })}
      {...props}
    />
  )
}

export function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  const slots = dialogVariants({ density: useDensity() })
  return <div data-slot="dialog-body" className={slots.body({ className })} {...props} />
}

export interface DialogFooterProps extends React.ComponentProps<"div"> {
  bordered?: boolean
}

export function DialogFooter({ className, bordered, ...props }: DialogFooterProps) {
  const slots = dialogVariants({ density: useDensity(), bordered })
  return <div data-slot="dialog-footer" className={slots.footer({ className })} {...props} />
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  const slots = dialogVariants({ density: useDensity() })
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={slots.title({ className })}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const slots = dialogVariants({ density: useDensity() })
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={slots.description({ className })}
      {...props}
    />
  )
}
