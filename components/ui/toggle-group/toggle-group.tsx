"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * ToggleGroup: a set of pressable pills where a selection is held, built on Radix ToggleGroup.
 * Multi-part (the group root and its items), so the recipe lives in two slots and the shared
 * `size` flows from `ToggleGroup` to each `ToggleGroupItem` through a typed Context, never
 * prop-drilled.
 *
 * Reach for it when one (or several) options from a small, visible set should look *chosen*: a
 * rating, a view switch, a text-style band. Pass `type="single"` for a mutually exclusive choice
 * (selecting one clears the rest) or `type="multiple"` for independent on/off toggles. It differs
 * from RadioGroup (the dot affordance, always a single choice) and Switch (a lone on/off setting):
 * here the control *is* the label, and a selected pill carries the brand outline.
 *
 * Selected (`data-[state=on]`) draws a brand outline + a soft brand halo, with the label and glyph
 * in the foreground (only the border is brand, matching Figma) and no fill, so it reads as chosen
 * under all four themes without a background that would fight nested surfaces.
 *
 * `"use client"` because Radix ToggleGroup is interactive (roving focus + pressed state). Each item
 * is its own labelled button, so unlike RadioGroup it needs no paired `<label>`.
 */

// polish: the sm pill is 32px tall, under the 40px hit target (#9). A transparent
// pseudo-element extends the click area vertically only, so it never overlaps the neighbouring
// pill in a horizontal row (the text already gives a wide horizontal target).
const hitX =
  "before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']"

export const toggleGroupVariants = tv({
  slots: {
    root: "inline-flex items-center gap-2",
    item: [
      // Background reads `--surface` so the pill blends with whatever surface it sits on (card,
      // popover, page) instead of painting a darker `--background` block (the --surface contract).
      "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-input bg-[var(--surface,var(--background))] font-medium text-muted-foreground",
      // Specific transition (never `transition: all`, #14); tactile press scale (#12).
      "transition duration-fast ease-out active:scale-[0.96]",
      // Hover only lifts an *unselected* pill; a chosen one shouldn't shift under the cursor.
      "data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground",
      // Selected: brand outline + soft brand halo, no fill. The label and glyph turn foreground
      // (not brand) so the icon reads as one with the text, matching Figma; only the border is brand.
      "data-[state=on]:border-brand data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-brand/10",
      // Focus ring is listed after the selected halo, so a focused pill shows the stronger brand ring.
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      // Icons default to a 1rem box unless the consumer sets their own `size-*`.
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
  },
  variants: {
    size: {
      // sm matches the compact Figma rating pill (32px) and adds the vertical hit extender.
      sm: { item: `h-8 px-2.5 text-sm ${hitX}` },
      // md (40px) is the default; it meets the hit target on its own, no extender needed.
      md: { item: "h-10 px-3.5 text-sm" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type ToggleGroupSlots = ReturnType<typeof toggleGroupVariants>
const [ToggleGroupProvider, useToggleGroupContext] =
  createContext<{ slots: ToggleGroupSlots }>("ToggleGroup")

// ─── ToggleGroup ──────────────────────────────────────────────────────────────

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>

export function ToggleGroup({ className, size, ...props }: ToggleGroupProps) {
  const slots = toggleGroupVariants({ size })
  return (
    <ToggleGroupProvider slots={slots}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        className={slots.root({ className })}
        {...props}
      />
    </ToggleGroupProvider>
  )
}

// ─── ToggleGroupItem ────────────────────────────────────────────────────────────

export type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item>

export function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  const { slots } = useToggleGroupContext("ToggleGroupItem")
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={slots.item({ className })}
      {...props}
    />
  )
}
