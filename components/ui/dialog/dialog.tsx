"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from "@phosphor-icons/react"

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
      "[[data-slot=dialog-overlay][data-state=open]~&]:bg-black/25",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    positioner: [
      "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
      "[&:has(~[data-slot=dialog-overlay][data-state=open])]:[--dialog-nested:1]",
      "[&:has(~[data-slot=dialog-overlay][data-state=open]~[data-slot=dialog-overlay][data-state=open])]:[--dialog-nested:2]",
    ],
    content: [
      "relative grid w-full rounded-xl border border-border-soft bg-popover text-popover-foreground shadow-lg",
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
      "absolute top-4 right-4 inline-flex cursor-pointer items-center justify-center rounded-md",
      hitBoxPositioned,
      "text-muted-foreground transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    header: "flex flex-col text-left",
    stepper: "",
    body: "min-h-0 flex-1 overflow-y-auto scroll-fade scroll-py-10",
    footer: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    title: "text-base leading-none font-semibold tracking-tight",
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
      comfortable: { content: "gap-4 p-5", header: "gap-1.5", stepper: "-mx-5 px-5 pb-4", body: "-mx-5 px-5", footer: "mt-4", close: "size-7", icon: "[&_svg]:size-6" },
      compact: { content: "gap-3 p-4", header: "gap-1", stepper: "-mx-4 px-4 pb-3", body: "-mx-4 px-4", footer: "mt-2", close: "size-6", icon: "[&_svg]:size-5" },
    },
    bordered: {
      true: {},
      false: {},
    },
    mobile: {
      sheet: {
        positioner: "max-sm:items-end max-sm:p-0",
        content: [
          "max-sm:max-w-none max-sm:max-h-[92dvh] max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0",
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
      class: { footer: "mt-0 -mx-5 -mb-5 border-t border-border px-5 pt-3 pb-3" },
    },
    {
      bordered: true,
      density: "compact",
      class: { footer: "mt-0 -mx-4 -mb-4 border-t border-border px-4 pt-3 pb-3" },
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
  closeLabel = "Close",
  style,
  onCloseAutoFocus,
  onPointerDownOutside,
  ...props
}: DialogContentProps) {
  const focusReturn = useFocusReturn({ onCloseAutoFocus, onPointerDownOutside })
  const resolvedDensity = useDensity(density)
  const slots = dialogVariants({ size, density: resolvedDensity, mobile })

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" className={slots.overlay()} />
      <div data-slot="dialog-positioner" className={slots.positioner()}>
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
            <DialogPrimitive.Close aria-label={closeLabel} className={slots.close()}>
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
  bordered = true,
  density,
  orientation = "horizontal",
  ...props
}: DialogStepperProps) {
  const resolvedDensity = useDensity(density)
  const slots = dialogVariants({ density: resolvedDensity })
  return (
    <Stepper
      data-slot="dialog-stepper"
      orientation={orientation}
      density={resolvedDensity}
      className={slots.stepper({ className: cn(bordered && "border-b border-border", className) })}
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
