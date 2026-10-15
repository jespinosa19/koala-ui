"use client"

import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"
import { CaretRight, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity } from "@/lib/density"
import { hitY } from "@/lib/hit-area"
import { dropdownMenuVariants } from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { SwitchIndicator } from "@/components/ui/switch"

export const menubarVariants = tv({
  slots: {
    root: "flex items-center gap-0.5",
    trigger: [
      "flex h-7 cursor-pointer select-none items-center gap-1.5 rounded-sm px-2.5 text-sm font-medium text-foreground outline-none",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent focus-visible:bg-accent data-[state=open]:bg-accent",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      hitY,
    ],
  },
  variants: {
    variant: {
      outline: { root: "rounded-md p-1 shadow-xs ring-1 ring-inset ring-edge" },
      plain: { root: "" },
    },
  },
  defaultVariants: { variant: "outline" },
})

export interface MenubarProps
  extends React.ComponentProps<typeof MenubarPrimitive.Root>,
    VariantProps<typeof menubarVariants> {}

export function Menubar({ className, variant, ...props }: MenubarProps) {
  const { root } = menubarVariants({ variant })
  return <MenubarPrimitive.Root data-slot="menubar" className={root({ className })} {...props} />
}

export const MenubarMenu = MenubarPrimitive.Menu
export const MenubarGroup = MenubarPrimitive.Group
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup
export const MenubarSub = MenubarPrimitive.Sub
export const MenubarPortal = MenubarPrimitive.Portal

export function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const { trigger } = menubarVariants()
  return <MenubarPrimitive.Trigger data-slot="menubar-trigger" className={trigger({ className })} {...props} />
}

export interface MenubarContentProps
  extends React.ComponentProps<typeof MenubarPrimitive.Content>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density"> {}

export function MenubarContent({
  className,
  align = "start",
  alignOffset = -2,
  sideOffset = 8,
  collisionPadding = 8,
  density,
  ...props
}: MenubarContentProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={slots.content({ className })}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}

export interface MenubarItemProps
  extends React.ComponentProps<typeof MenubarPrimitive.Item>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density" | "variant"> {
  inset?: boolean
}

export function MenubarItem({ className, inset, density, variant, ...props }: MenubarItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density), variant })
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset || undefined}
      className={slots.item({ className: cn(inset && "pl-9", className) })}
      {...props}
    />
  )
}

export interface MenubarCheckboxItemProps
  extends React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>,
    Omit<VariantProps<typeof dropdownMenuVariants>, "variant" | "indicator"> {
  variant?: "check" | "switch"
  closeOnSelect?: boolean
}

export function MenubarCheckboxItem({
  className,
  children,
  checked,
  density,
  variant = "check",
  closeOnSelect = variant !== "switch",
  onSelect,
  ...props
}: MenubarCheckboxItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density), indicator: variant })
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
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
            <MenubarPrimitive.ItemIndicator>
              <Check weight="bold" className="size-4" />
            </MenubarPrimitive.ItemIndicator>
          </span>
          {children}
        </>
      )}
    </MenubarPrimitive.CheckboxItem>
  )
}

export interface MenubarRadioItemProps
  extends React.ComponentProps<typeof MenubarPrimitive.RadioItem>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density"> {}

export function MenubarRadioItem({ className, children, density, ...props }: MenubarRadioItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={slots.radioItem({ className })} {...props}>
      <span className={slots.itemIndicator()}>
        <MenubarPrimitive.ItemIndicator>
          <Check weight="bold" className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

export interface MenubarLabelProps
  extends React.ComponentProps<typeof MenubarPrimitive.Label>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density"> {
  inset?: boolean
}

export function MenubarLabel({ className, inset, density, ...props }: MenubarLabelProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      className={slots.label({ className: cn(inset && "pl-9", className) })}
      {...props}
    />
  )
}

export function MenubarSeparator({
  className,
  density,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator> & Pick<VariantProps<typeof dropdownMenuVariants>, "density">) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={slots.separator({ className })} {...props} />
}

export function MenubarShortcut({ className, ...props }: React.ComponentProps<typeof Kbd>) {
  return <Kbd data-slot="menubar-shortcut" size="sm" className={cn("ml-auto", className)} {...props} />
}

export interface MenubarSubTriggerProps
  extends React.ComponentProps<typeof MenubarPrimitive.SubTrigger>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density"> {
  inset?: boolean
}

export function MenubarSubTrigger({ className, inset, children, density, ...props }: MenubarSubTriggerProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      className={slots.subTrigger({ className: cn(inset && "pl-9", className) })}
      {...props}
    >
      {children}
      <CaretRight weight="bold" className={slots.subCaret()} />
    </MenubarPrimitive.SubTrigger>
  )
}

export function MenubarSubContent({
  className,
  density,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent> & Pick<VariantProps<typeof dropdownMenuVariants>, "density">) {
  const slots = dropdownMenuVariants({ density: useDensity(density) })
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        data-slot="menubar-sub-content"
        className={slots.subContent({ className })}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}
