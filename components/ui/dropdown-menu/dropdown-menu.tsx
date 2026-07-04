"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { CaretRight, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity } from "@/lib/density"
import { Kbd } from "@/components/ui/kbd"

export const dropdownMenuVariants = tv({
  slots: {
    content: [
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover",
      "text-popover-foreground shadow-lg",
      // Enter & exit: fade + directional slide only, no scale.
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "data-[side=bottom]:slide-out-to-top-2 data-[side=top]:slide-out-to-bottom-2",
      "data-[side=left]:slide-out-to-right-2 data-[side=right]:slide-out-to-left-2",
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
    // `group` lets the caret nudge on sub-menu open.
    subTrigger: [
      "group flex cursor-pointer select-none items-center gap-2 text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
    ],
    subContent: [
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover",
      "text-popover-foreground shadow-lg",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "duration-base ease-out",
    ],
    // Brand-colored check: a selected checkbox/radio row reads as an on-brand confirmation
    // (matching Select + country-select), not a muted glyph. The leading icon stays muted.
    itemIndicator: "absolute right-2 flex size-4 items-center justify-center text-brand",
    label: "font-medium text-muted-foreground",
    separator: "-mx-1 h-px bg-border",
    subCaret: "ml-auto size-4 text-muted-foreground",
  },
  variants: {
    density: {
      comfortable: {
        // content rounded-md (~10px) − viewport p-1.5 (6px) ≈ 4px → rounded-sm keeps items concentric
        content: "p-1.5",
        item: "px-3 py-2 rounded-sm",
        checkboxItem: "px-3 pr-8 py-2 rounded-sm",
        radioItem: "px-3 pr-8 py-2 rounded-sm",
        subTrigger: "px-3 py-2 rounded-sm",
        subContent: "p-1.5",
        label: "px-3 py-1.5 text-xs",
        separator: "my-1.5",
      },
      compact: {
        // content rounded-md (~10px) − viewport p-1 (4px) ≈ 6px → rounded-sm keeps items concentric
        content: "p-1",
        item: "px-2 py-1.5 rounded-sm",
        checkboxItem: "px-2 pr-7 py-1.5 rounded-sm",
        radioItem: "px-2 pr-7 py-1.5 rounded-sm",
        subTrigger: "px-2 py-1.5 rounded-sm",
        subContent: "p-1",
        label: "px-2 py-1 text-xs",
        separator: "my-1",
      },
    },
    // Destructive (delete / log out) rows. The leading icon is colored to match the label,
    // not left muted, so a red row reads as one red unit; the hover background tints red to
    // match. `[&>svg]` overrides the base muted leading-icon rule via tailwind-merge while
    // never touching the check indicator (it isn't a direct svg child).
    variant: {
      default: {},
      destructive: {
        item: "text-destructive focus:bg-destructive/10 focus:text-destructive [&>svg]:text-destructive",
      },
    },
  },
  defaultVariants: { density: "comfortable", variant: "default" },
})

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup
export const DropdownMenuSub = DropdownMenuPrimitive.Sub
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal

export interface DropdownMenuContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropdownMenuVariants> {}

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  density,
  ...props
}: DropdownMenuContentProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={slots.content({ className })}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuVariants> {
  /** Indent left to align text with icon-bearing siblings. */
  inset?: boolean
}

export function DropdownMenuItem({
  className,
  inset,
  density,
  variant,
  ...props
}: DropdownMenuItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density), variant })
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      className={slots.item({ className: cn(inset && "pl-8", className) })}
      {...props}
    />
  )
}

export interface DropdownMenuCheckboxItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
    VariantProps<typeof dropdownMenuVariants> {}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  density,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={slots.checkboxItem({ className })}
      checked={checked}
      {...props}
    >
      <span className={slots.itemIndicator()}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check weight="bold" className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export interface DropdownMenuRadioItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>,
    VariantProps<typeof dropdownMenuVariants> {}

export function DropdownMenuRadioItem({
  className,
  children,
  density,
  ...props
}: DropdownMenuRadioItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={slots.radioItem({ className })}
      {...props}
    >
      {/* Selected items in a menu read clearest with a check (the native-menu convention,
          macOS/Linear), so radio and checkbox share one indicator. The exclusive-vs-toggle
          semantics still live in the role (`menuitemradio`) and the section grouping, not the glyph. */}
      <span className={slots.itemIndicator()}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check weight="bold" className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export interface DropdownMenuLabelProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.Label>,
    VariantProps<typeof dropdownMenuVariants> {
  inset?: boolean
}

export function DropdownMenuLabel({
  className,
  inset,
  density,
  ...props
}: DropdownMenuLabelProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={slots.label({ className: cn(inset && "pl-8", className) })}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  density,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator> &
  VariantProps<typeof dropdownMenuVariants>) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

/**
 * Right-aligned shortcut hint for a menu item. Renders the shared `Kbd` primitive
 * (`outline` variant: the documented choice for dense inline help text) so every
 * keyboard key across the DS shares one treatment, rather than bespoke text styling.
 */
export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<typeof Kbd>) {
  return (
    <Kbd
      data-slot="dropdown-menu-shortcut"
      variant="outline"
      size="sm"
      className={cn("ml-auto", className)}
      {...props}
    />
  )
}

export interface DropdownMenuSubTriggerProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>,
    VariantProps<typeof dropdownMenuVariants> {
  inset?: boolean
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  density,
  ...props
}: DropdownMenuSubTriggerProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={slots.subTrigger({ className: cn(inset && "pl-8", className) })}
      {...props}
    >
      {children}
      <CaretRight weight="bold" className={slots.subCaret()} />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

export interface DropdownMenuSubContentProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>,
    VariantProps<typeof dropdownMenuVariants> {}

export function DropdownMenuSubContent({
  className,
  density,
  ...props
}: DropdownMenuSubContentProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={slots.subContent({ className })}
      {...props}
    />
  )
}
