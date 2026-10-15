"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import { CaretRight, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { DensityProvider, useDensity } from "@/lib/density"
import { Kbd } from "@/components/ui/kbd"
import { SwitchIndicator } from "@/components/ui/switch"

export const contextMenuVariants = tv({
  slots: {
    content: [
      "z-50 min-w-[8rem] overflow-hidden rounded-xl bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "text-popover-foreground shadow-lg",
      "max-w-(--radix-context-menu-content-available-width)",
      "origin-(--radix-popper-transform-origin)",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "duration-base ease-out",
    ],
    item: [
      "relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    ],
    checkboxItem: [
      "relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    ],
    radioItem: [
      "relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    ],
    subTrigger: [
      "group flex cursor-pointer select-none items-center gap-2 text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    ],
    subContent: [
      "z-50 min-w-[8rem] overflow-hidden rounded-xl bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "text-popover-foreground shadow-lg",
      "origin-(--radix-popper-transform-origin)",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "duration-base ease-out",
    ],
    itemIndicator: "absolute right-2 flex size-4 items-center justify-center text-brand",
    label: "font-medium text-muted-foreground",
    separator: "-mx-1.75 h-px bg-border",
    subCaret: "ml-auto size-4 text-muted-foreground",
  },
  variants: {
    density: {
      comfortable: {
        content: "p-2",
        item: "px-2 py-2 rounded-md",
        checkboxItem: "px-2 pr-8 py-2 rounded-md",
        radioItem: "px-2 pr-8 py-2 rounded-md",
        subTrigger: "px-2 py-2 rounded-md",
        subContent: "p-2",
        label: "px-2 py-1.5 text-xs",
        separator: "my-1.5",
      },
      compact: {
        content: "p-2",
        item: "px-2 py-1.5 rounded-md",
        checkboxItem: "px-2 pr-8 py-1.5 rounded-md",
        radioItem: "px-2 pr-8 py-1.5 rounded-md",
        subTrigger: "px-2 py-1.5 rounded-md",
        subContent: "p-2",
        label: "px-2 py-1 text-xs",
        separator: "my-1",
      },
    },
    variant: {
      default: {},
      destructive: {
        item: "text-destructive focus:bg-destructive/10 focus:text-destructive [&>svg]:text-destructive",
      },
    },
    indicator: {
      check: {},
      switch: { checkboxItem: "pr-2" },
    },
  },
  defaultVariants: { density: "comfortable", variant: "default", indicator: "check" },
})

type ContextMenuDensityProps = Pick<VariantProps<typeof contextMenuVariants>, "density">

function withDensity(density: ContextMenuDensityProps["density"], children: React.ReactNode) {
  return density ? <DensityProvider density={density}>{children}</DensityProvider> : children
}

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuPortal = ContextMenuPrimitive.Portal

export interface ContextMenuContentProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Content>,
    ContextMenuDensityProps {}

export function ContextMenuContent({
  className,
  density,
  updatePositionStrategy = "always",
  collisionPadding = 8,
  children,
  ...props
}: ContextMenuContentProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        updatePositionStrategy={updatePositionStrategy}
        collisionPadding={collisionPadding}
        className={slots.content({ className })}
        {...props}
      >
        {withDensity(density, children)}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  )
}

export interface ContextMenuItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Item>,
    Omit<VariantProps<typeof contextMenuVariants>, "indicator"> {
  inset?: boolean
}

export function ContextMenuItem({
  className,
  inset,
  density,
  variant,
  ...props
}: ContextMenuItemProps) {
  const slots = contextMenuVariants({ density: useDensity(density), variant })
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      className={slots.item({ className: cn(inset && "pl-9", className) })}
      {...props}
    />
  )
}

export interface ContextMenuCheckboxItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>,
    Omit<VariantProps<typeof contextMenuVariants>, "variant" | "indicator"> {
  variant?: "check" | "switch"
  closeOnSelect?: boolean
}

export function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  density,
  variant = "check",
  closeOnSelect = variant !== "switch",
  onSelect,
  ...props
}: ContextMenuCheckboxItemProps) {
  const slots = contextMenuVariants({ density: useDensity(density), indicator: variant })
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={slots.checkboxItem({ className })}
      checked={checked}
      onSelect={(event) => {
        onSelect?.(event)
        if (!closeOnSelect) event.preventDefault()
      }}
      {...props}
    >
      {variant === "switch" ? (
        <>
          {children}
          <SwitchIndicator checked={checked === true} className="ml-auto" />
        </>
      ) : (
        <>
          <span className={slots.itemIndicator()}>
            <ContextMenuPrimitive.ItemIndicator>
              <Check weight="bold" className="size-4" />
            </ContextMenuPrimitive.ItemIndicator>
          </span>
          {children}
        </>
      )}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

export interface ContextMenuRadioItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>,
    ContextMenuDensityProps {}

export function ContextMenuRadioItem({
  className,
  children,
  density,
  ...props
}: ContextMenuRadioItemProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={slots.radioItem({ className })}
      {...props}
    >
      <span className={slots.itemIndicator()}>
        <ContextMenuPrimitive.ItemIndicator>
          <Check weight="bold" className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

export interface ContextMenuLabelProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Label>,
    ContextMenuDensityProps {
  inset?: boolean
}

export function ContextMenuLabel({ className, inset, density, ...props }: ContextMenuLabelProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      className={slots.label({ className: cn(inset && "pl-9", className) })}
      {...props}
    />
  )
}

export function ContextMenuSeparator({
  className,
  density,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator> & ContextMenuDensityProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

export function ContextMenuShortcut({ className, ...props }: React.ComponentProps<typeof Kbd>) {
  return (
    <Kbd
      data-slot="context-menu-shortcut"
      size="sm"
      className={cn("ml-auto", className)}
      {...props}
    />
  )
}

export interface ContextMenuSubTriggerProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger>,
    ContextMenuDensityProps {
  inset?: boolean
}

export function ContextMenuSubTrigger({
  className,
  inset,
  children,
  density,
  ...props
}: ContextMenuSubTriggerProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      className={slots.subTrigger({ className: cn(inset && "pl-9", className) })}
      {...props}
    >
      {children}
      <CaretRight weight="bold" className={slots.subCaret()} />
    </ContextMenuPrimitive.SubTrigger>
  )
}

export interface ContextMenuSubContentProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.SubContent>,
    ContextMenuDensityProps {}

export function ContextMenuSubContent({
  className,
  density,
  children,
  ...props
}: ContextMenuSubContentProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={slots.subContent({ className })}
      {...props}
    >
      {withDensity(density, children)}
    </ContextMenuPrimitive.SubContent>
  )
}
