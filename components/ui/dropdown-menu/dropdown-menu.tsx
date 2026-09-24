"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { CaretRight, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity } from "@/lib/density"
import { Kbd } from "@/components/ui/kbd"
import { SwitchIndicator } from "@/components/ui/switch"

export const dropdownMenuVariants = tv({
  slots: {
    // The edge is an inset ring, not a border: a border spends 1px of layout, which would
    // push every row off the 12px inset and break the concentric corners.
    content: [
      "z-50 min-w-[8rem] overflow-hidden rounded-lg bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
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
      // A described row (a navigation menu: title over a sentence) pins its leading icon to the
      // title's line instead of centering it on the whole block. The 20px icon and the 20px title
      // line share a box, so top alignment is also optical alignment.
      "has-[[data-slot=dropdown-menu-item-description]]:items-start",
    ],
    // Title + description column of a described row. `min-w-0` lets a long sentence wrap inside
    // the menu's width instead of pushing it wider.
    itemText: "flex min-w-0 flex-col gap-0.5",
    // The sentence under a row's title: same size as the title, set back by color and weight only,
    // so the row reads as one unit and the title keeps the hierarchy.
    itemDescription: "text-sm font-normal text-pretty text-muted-foreground",
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
      "z-50 min-w-[8rem] overflow-hidden rounded-lg bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "text-popover-foreground shadow-lg",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "duration-base ease-out",
    ],
    // Brand-colored check: a selected checkbox/radio row reads as an on-brand confirmation
    // (matching Select + country-select), not a muted glyph. The leading icon stays muted.
    // right-2 lands the check on the same 12px line as the shortcut and sub caret.
    itemIndicator: "absolute right-2 flex size-4 items-center justify-center text-brand",
    label: "font-medium text-muted-foreground",
    // -mx-0.75, not -mx-1: the rule stops at the ring's inner edge instead of painting over
    // it. --border carries alpha on dark themes, so an overlap would brighten both ends.
    separator: "-mx-0.75 h-px bg-border",
    subCaret: "ml-auto size-4 text-muted-foreground",
  },
  variants: {
    // 12px edge inset, both sides, both densities: content p-1 (4) + row px-2 (8). Leading
    // icon, label text, shortcut, sub caret and check all sit on that line. The padding also
    // sets the corner (rounded-lg 16 − p-1 4 = rounded-md 12: soft rows, not pills, which the user
    // preferred over 24/16 on 2026-09-19; a two-line row stays concentric), so it never moves with density;
    // density only tunes row height (36 vs 32). Checkable rows reserve pr-8 for the check:
    // right-2 (8) + size-4 (16) + gap (8).
    density: {
      comfortable: {
        content: "p-1",
        item: "px-2 py-2 rounded-md",
        checkboxItem: "px-2 pr-8 py-2 rounded-md",
        radioItem: "px-2 pr-8 py-2 rounded-md",
        subTrigger: "px-2 py-2 rounded-md",
        subContent: "p-1",
        label: "px-2 py-1.5 text-xs",
        separator: "my-1.5",
      },
      compact: {
        content: "p-1",
        item: "px-2 py-1.5 rounded-md",
        checkboxItem: "px-2 pr-8 py-1.5 rounded-md",
        radioItem: "px-2 pr-8 py-1.5 rounded-md",
        subTrigger: "px-2 py-1.5 rounded-md",
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
    // How a checkbox row shows its state: the brand check on the right, or a mini Switch on that
    // same line. The switch sits in the row's own padding (pr-2) instead of the check's reserved
    // pr-8, so it lands on the 12px edge line with the shortcut and the sub caret.
    indicator: {
      check: {},
      switch: { checkboxItem: "pr-2" },
    },
  },
  defaultVariants: { density: "comfortable", variant: "default", indicator: "check" },
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
      className={slots.item({ className: cn(inset && "pl-9", className) })}
      {...props}
    />
  )
}

/**
 * The text column of a described row: put the title and a `DropdownMenuItemDescription` inside,
 * after the leading icon. Both parts are optional; a row without a description stays a plain
 * one-line item, so nothing changes for menus that never use them.
 *
 *   <DropdownMenuItem>
 *     <Megaphone />
 *     <DropdownMenuItemText>
 *       Changelog
 *       <DropdownMenuItemDescription>What shipped this month</DropdownMenuItemDescription>
 *     </DropdownMenuItemText>
 *   </DropdownMenuItem>
 */
export function DropdownMenuItemText({ className, ...props }: React.ComponentProps<"span">) {
  const slots = dropdownMenuVariants()
  return <span data-slot="dropdown-menu-item-text" className={slots.itemText({ className })} {...props} />
}

/** The muted sentence under a row's title. Place it inside `DropdownMenuItemText`. */
export function DropdownMenuItemDescription({ className, ...props }: React.ComponentProps<"span">) {
  const slots = dropdownMenuVariants()
  return (
    <span
      data-slot="dropdown-menu-item-description"
      className={slots.itemDescription({ className })}
      {...props}
    />
  )
}

export interface DropdownMenuCheckboxItemProps
  extends React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
    Omit<VariantProps<typeof dropdownMenuVariants>, "variant" | "indicator"> {
  /**
   * How the checked state reads. `check` (the default) is the brand check on the right; `switch`
   * is a mini Switch on the same line, for a setting that applies the moment it flips.
   */
  variant?: "check" | "switch"
  /**
   * Close the menu when the row is toggled. Defaults to `true` for `check` and `false` for
   * `switch`, whose whole point is watching it flip, often several in a row.
   */
  closeOnSelect?: boolean
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  density,
  variant = "check",
  closeOnSelect = variant !== "switch",
  onSelect,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const slots = dropdownMenuVariants({ density: useDensity(density), indicator: variant })
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
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
              `aria-checked` (Radix renders it as a menuitemcheckbox), and a real Switch nested inside
              it would be an interactive control within an interactive row. */}
          <SwitchIndicator checked={checked === true} className="ml-auto" />
        </>
      ) : (
        <>
          <span className={slots.itemIndicator()}>
            <DropdownMenuPrimitive.ItemIndicator>
              <Check weight="bold" className="size-4" />
            </DropdownMenuPrimitive.ItemIndicator>
          </span>
          {children}
        </>
      )}
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
      className={slots.label({ className: cn(inset && "pl-9", className) })}
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
 * (default gray chip, whose translucent fill stays visible on the highlighted row) so
 * every keyboard key across the DS shares one treatment, rather than bespoke text styling.
 */
export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<typeof Kbd>) {
  return (
    <Kbd
      data-slot="dropdown-menu-shortcut"
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
      className={slots.subTrigger({ className: cn(inset && "pl-9", className) })}
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
