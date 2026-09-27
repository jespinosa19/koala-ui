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

/**
 * Menubar: the File · Edit · View row of a desktop-style app, over Radix Menubar. One Tab stop for
 * the whole bar, arrow keys across the menus, and once one menu is open, hovering or arrowing to its
 * neighbour opens that one instead: the behavior people expect from a real application menu.
 *
 * Reach for it in an editor, a design tool or an admin console with enough commands to need a
 * vocabulary of menus. A single menu behind a button is a DropdownMenu; a row of icon actions is a
 * Toolbar.
 *
 * The bar is the Toolbar's shape: a 12px band with 4px of padding and 8px triggers, so the corners
 * nest concentrically (12 = 8 + 4), and the edge is an inset ring that takes no layout. The menus
 * are DropdownMenu's panels, built from its recipe rather than restyled here, so a menu opened from
 * the bar and one opened from a button are the same object: same 12px edge inset, same muted icons
 * and 500 labels, same brand check, same `Kbd` shortcuts.
 */
export const menubarVariants = tv({
  slots: {
    root: "flex items-center gap-0.5",
    trigger: [
      "flex h-7 cursor-pointer select-none items-center gap-1.5 rounded-sm px-2.5 text-sm font-medium text-foreground outline-none",
      "transition-colors duration-fast ease-out",
      // Hover, keyboard focus and the open menu all light the same chip, so the bar always shows
      // which menu you are in.
      "hover:bg-accent focus-visible:bg-accent data-[state=open]:bg-accent",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      // polish: the triggers are 28px tall, under the 40px target. They sit edge to edge, so the
      // target grows vertically only and never steals the neighbouring menu's click.
      hitY,
    ],
  },
  variants: {
    variant: {
      // In-flow chrome: the "shadows over borders" edge (an inset `--edge` ring plus the xs lift),
      // no fill of its own, so it takes the ground it sits on. Inset, not a border, so the triggers
      // stay 4px from the edge and the corners stay concentric.
      outline: { root: "rounded-md p-1 shadow-xs ring-1 ring-inset ring-edge" },
      // Chromeless, for an app header that already owns the band.
      plain: { root: "" },
    },
  },
  defaultVariants: { variant: "outline" },
})

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface MenubarProps
  extends React.ComponentProps<typeof MenubarPrimitive.Root>,
    VariantProps<typeof menubarVariants> {}

export function Menubar({ className, variant, ...props }: MenubarProps) {
  const { root } = menubarVariants({ variant })
  return <MenubarPrimitive.Root data-slot="menubar" className={root({ className })} {...props} />
}

// ─── Behavioral passthroughs ──────────────────────────────────────────────────

export const MenubarMenu = MenubarPrimitive.Menu
export const MenubarGroup = MenubarPrimitive.Group
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup
export const MenubarSub = MenubarPrimitive.Sub
export const MenubarPortal = MenubarPrimitive.Portal

// ─── Trigger ──────────────────────────────────────────────────────────────────

export function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const { trigger } = menubarVariants()
  return <MenubarPrimitive.Trigger data-slot="menubar-trigger" className={trigger({ className })} {...props} />
}

// ─── Content ──────────────────────────────────────────────────────────────────

export interface MenubarContentProps
  extends React.ComponentProps<typeof MenubarPrimitive.Content>,
    Pick<VariantProps<typeof dropdownMenuVariants>, "density"> {}

/**
 * The menu panel. It opens under its trigger with its rows' text on the trigger's own text line:
 * the trigger's label sits 10px in (`px-2.5`), a row's 12px in (panel `p-1` + row `px-2`), so the
 * panel starts 2px to the left. `sideOffset` clears the band's 4px padding and leaves 4px of air.
 */
export function MenubarContent({
  className,
  align = "start",
  alignOffset = -2,
  sideOffset = 8,
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
        className={slots.content({ className })}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
}

// ─── Items ────────────────────────────────────────────────────────────────────

export interface MenubarItemProps
  extends React.ComponentProps<typeof MenubarPrimitive.Item>,
    VariantProps<typeof dropdownMenuVariants> {
  /** Indent left to align text with icon-bearing siblings. */
  inset?: boolean
}

/** A command. `variant="destructive"` turns the whole row red, icon included. */
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
  /**
   * How the checked state reads: `check` (the default) is the brand check on the right; `switch` is
   * a mini Switch on the same line, for a setting that applies the moment it flips.
   */
  variant?: "check" | "switch"
  /** Close the menu when the row is toggled. Defaults to `true` for `check`, `false` for `switch`. */
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
        // Radix closes the menu on select; keeping it open is opting out of that default.
        if (!closeOnSelect) event.preventDefault()
      }}
      {...props}
    >
      {variant === "switch" ? (
        <>
          {children}
          {/* The switch's drawing, not a second control: the row owns focus, the toggle and
              `aria-checked` (a menuitemcheckbox), so a real Switch here would nest one control in another. */}
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

/** One exclusive choice inside a `MenubarRadioGroup`. It shares the checkbox row's brand check. */
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

/** The row's shortcut, as the shared `Kbd` chip on the row's 12px right edge. Display only. */
export function MenubarShortcut({ className, ...props }: React.ComponentProps<typeof Kbd>) {
  return <Kbd data-slot="menubar-shortcut" size="sm" className={cn("ml-auto", className)} {...props} />
}

// ─── Submenus ─────────────────────────────────────────────────────────────────

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
