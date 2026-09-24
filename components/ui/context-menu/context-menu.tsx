"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import { CaretRight, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity } from "@/lib/density"
import { Kbd } from "@/components/ui/kbd"
import { SwitchIndicator } from "@/components/ui/switch"

// Right-click sibling of Dropdown Menu: same surface, items, and density tuning, but
// opened by a context (right-click / long-press) gesture on an arbitrary trigger area
// instead of a click on a button. The recipe is intentionally identical to
// `dropdownMenuVariants` so the two menu families read the same across the DS.
export const contextMenuVariants = tv({
  slots: {
    // The edge is an inset ring, not a border: a border spends 1px of layout, which would
    // push every row off the 16px inset and break the concentric corners.
    content: [
      "z-50 min-w-[8rem] overflow-hidden rounded-xl bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "text-popover-foreground shadow-lg",
      // Enter: fade + scale from the cursor corner. A context menu opens at the pointer, so
      // growing out of the Radix popper origin (which points back at the right-click point)
      // reads more natural than a directional slide from a fixed side.
      "origin-(--radix-popper-transform-origin)",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      // No exit animation on the root content, on purpose. Right-clicking a new spot while the
      // menu is open makes Radix dismiss then reopen it (pointerdown closes, contextmenu reopens
      // at the new point). An exit animation keeps that old element mounted through its fade-out,
      // so it gets reused and visibly streaks from the old position to the new one. Closing
      // instantly lets each right-click remount cleanly at the fresh cursor point. Submenus keep
      // their exit (below): they anchor to a trigger, not the cursor, so they never reposition.
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
      "z-50 min-w-[8rem] overflow-hidden rounded-xl bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "text-popover-foreground shadow-lg",
      // Submenus grow from their trigger edge via the same popper origin.
      "origin-(--radix-popper-transform-origin)",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "duration-base ease-out",
    ],
    // Brand-colored check: a selected checkbox/radio row reads as an on-brand confirmation
    // (matching Select + DropdownMenu), not a muted glyph. The leading icon stays muted.
    // right-2 lands the check on the same 16px line as the shortcut and sub caret.
    itemIndicator: "absolute right-2 flex size-4 items-center justify-center text-brand",
    label: "font-medium text-muted-foreground",
    // -mx-1.75, not -mx-2: the rule stops at the ring's inner edge instead of painting over
    // it. --border carries alpha on dark themes, so an overlap would brighten both ends.
    separator: "-mx-1.75 h-px bg-border",
    subCaret: "ml-auto size-4 text-muted-foreground",
  },
  variants: {
    // 16px edge inset, both sides, both densities: content p-2 (8) + row px-2 (8). Leading
    // icon, label text, shortcut, sub caret and check all sit on that line. The padding also
    // sets the corner (rounded-xl 20 − p-2 8 = rounded-md 12: soft rows, not pills, which the user
    // preferred over 24/16 on 2026-09-19; a two-line row stays concentric), so it never moves with density;
    // density only tunes row height (36 vs 32). Checkable rows reserve pr-8 for the check:
    // right-2 (8) + size-4 (16) + gap (8).
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
    // pr-8, so it lands on the 16px edge line with the shortcut and the sub caret.
    indicator: {
      check: {},
      switch: { checkboxItem: "pr-2" },
    },
  },
  defaultVariants: { density: "comfortable", variant: "default", indicator: "check" },
})

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuPortal = ContextMenuPrimitive.Portal

export interface ContextMenuContentProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Content>,
    VariantProps<typeof contextMenuVariants> {}

export function ContextMenuContent({
  className,
  density,
  updatePositionStrategy = "always",
  ...props
}: ContextMenuContentProps) {
  // No `sideOffset` here: a context menu anchors to the cursor position, not to a
  // trigger element, so Radix positions it at the pointer without a gap to offset.
  //
  // `updatePositionStrategy="always"` is the precision knob for the mouse. Radix stores
  // the right-click point in a ref and exposes it through a virtual anchor; the default
  // "optimized" strategy only re-measures that anchor on scroll/resize, so a second or
  // third right-click while the menu is open leaves it stranded at the first point.
  // "always" polls the anchor every animation frame, so each new right-click re-anchors
  // the open menu to the exact cursor position. Override back to "optimized" to opt out.
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        updatePositionStrategy={updatePositionStrategy}
        className={slots.content({ className })}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

export interface ContextMenuItemProps
  extends React.ComponentProps<typeof ContextMenuPrimitive.Item>,
    VariantProps<typeof contextMenuVariants> {
  /** Indent left to align text with icon-bearing siblings. */
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
    VariantProps<typeof contextMenuVariants> {}

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
      {/* Selected items in a menu read clearest with a check (the native-menu convention,
          macOS/Linear), so radio and checkbox share one indicator. The exclusive-vs-toggle
          semantics still live in the role (`menuitemradio`) and the section grouping, not the glyph. */}
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
    VariantProps<typeof contextMenuVariants> {
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
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator> &
  VariantProps<typeof contextMenuVariants>) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
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
    VariantProps<typeof contextMenuVariants> {
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
    VariantProps<typeof contextMenuVariants> {}

export function ContextMenuSubContent({ className, density, ...props }: ContextMenuSubContentProps) {
  const slots = contextMenuVariants({ density: useDensity(density) })
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={slots.subContent({ className })}
      {...props}
    />
  )
}
