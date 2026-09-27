"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { hitBox, hitCoarse, hitY } from "@/lib/hit-area"

/**
 * Toggle: one pressable control that stays pressed, built on Radix Toggle (`aria-pressed`, the
 * `data-state="on" | "off"` hook, Space/Enter). It is the single-item sibling of ToggleGroup: the
 * `outline` paint and the sm/md heights are the group item's, so a lone Toggle beside a group reads
 * as one family. Reach for it for a switch that *looks like a button*: bookmark, pin, mute, "only
 * unread", show grid. A setting that applies to the whole app is a Switch; a choice among several
 * is a ToggleGroup.
 *
 * `variant="outline"` (default) is the group's pill: a framed control whose pressed state is the
 * brand border + halo, no fill. `variant="ghost"` is bare at rest and fills with the accent chip
 * once pressed, the Toolbar's pressed look, for icon toggles that sit in a row of other controls.
 *
 * Pair a pressed glyph with `ToggleIcon`: it keeps both glyphs mounted and cross-fades them
 * (opacity, scale and blur) on the toggle's state, so a bookmark fills in instead of blinking.
 *
 * No press scale: the pressed state *is* the feedback here, and a control that shrinks on click and
 * then changes paint does two things for one gesture.
 */

/**
 * The item paint ToggleGroup's pills share (toggle-group.tsx spreads it into its own item slot),
 * so the lone control and the group can never drift apart.
 */
export const toggleItemBase = [
  // Background reads `--surface` so the pill blends with whatever surface it sits on (card,
  // popover, page) instead of painting a darker `--background` block (the --surface contract).
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-input bg-[var(--surface,var(--background))] font-medium text-muted-foreground",
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
]

// The cross-fade both glyphs of a ToggleIcon ride: a CSS transition on the three properties the
// polish rules name for an icon swap, so a quick double press reverses mid-way instead of restarting.
const glyph =
  "col-start-1 row-start-1 flex items-center justify-center transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none"

export const toggleVariants = tv({
  slots: {
    root: [
      // `group/toggle` lets a nested ToggleIcon read the pressed state off this control.
      "group/toggle",
      ...toggleItemBase,
      // Specific transition (never `transition: all`): the paint and the halo, nothing that moves.
      "transition-[color,background-color,border-color,box-shadow] duration-fast ease-out",
    ],
    icon: "inline-grid shrink-0 place-items-center",
    // At rest: shown. Pressed: shrinks to a quarter, fades and blurs out.
    iconOff: [
      glyph,
      "group-data-[state=on]/toggle:scale-25 group-data-[state=on]/toggle:opacity-0 group-data-[state=on]/toggle:blur-xs",
    ],
    // The mirror image: hidden at rest, resolves into place as the toggle is pressed.
    iconOn: [
      glyph,
      "scale-25 opacity-0 blur-xs",
      "group-data-[state=on]/toggle:scale-100 group-data-[state=on]/toggle:opacity-100 group-data-[state=on]/toggle:blur-none",
    ],
  },
  variants: {
    variant: {
      outline: {},
      // Bare at rest, the accent chip once pressed: the Toolbar's pressed look. The weight holds at
      // medium in both states, so an icon-and-label ghost never widens and nudges its neighbours.
      ghost: {
        root: [
          "border-transparent bg-transparent",
          "data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:font-medium data-[state=on]:ring-0",
        ],
      },
    },
    // The group's scale: sm 32px, md 40px (the default, which meets the hit target on its own).
    size: {
      sm: { root: "h-8 px-2.5 text-sm" },
      md: { root: `h-10 px-3.5 text-sm ${hitCoarse}` },
    },
    // A square control holding one glyph. Name it with `aria-label`: the glyph is not a name.
    iconOnly: {
      true: { root: "px-0" },
      false: {},
    },
  },
  compoundVariants: [
    // polish: sm is 32px, under the 40px target. A text toggle grows its target vertically only,
    // so it never steals a neighbour's tap in a row; an icon-only one gets the full 40px box.
    { size: "sm", iconOnly: false, className: { root: hitY } },
    { size: "sm", iconOnly: true, className: { root: `w-8 ${hitBox}` } },
    // A 16px glyph reads small in a 40px square, so the icon-only md control steps it up to the
    // 20px the Toolbar's md control uses.
    { size: "md", iconOnly: true, className: { root: "w-10 [&_svg:not([class*='size-'])]:size-5" } },
  ],
  defaultVariants: { variant: "outline", size: "md", iconOnly: false },
})

export interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

export function Toggle({ className, variant, size, iconOnly, ...props }: ToggleProps) {
  const { root } = toggleVariants({ variant, size, iconOnly })
  return <TogglePrimitive.Root data-slot="toggle" className={root({ className })} {...props} />
}

export interface ToggleIconProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The glyph at rest. */
  off: React.ReactNode
  /** The glyph while pressed: usually the same icon in its `fill` weight. */
  on: React.ReactNode
}

/**
 * Two glyphs in one cell: `off` at rest, `on` while the toggle is pressed. Both stay mounted and
 * cross-fade on the toggle's `data-state`. Pass the pressed glyph in its filled weight: fill is how
 * the system marks a selected state. Decorative (`aria-hidden`): the Toggle's own name and
 * `aria-pressed` already say what it is and whether it is on.
 *
 *   <Toggle aria-label="Bookmark" iconOnly>
 *     <ToggleIcon off={<BookmarkSimple weight="bold" />} on={<BookmarkSimple weight="fill" />} />
 *   </Toggle>
 */
export function ToggleIcon({ off, on, className, ...props }: ToggleIconProps) {
  const slots = toggleVariants()
  return (
    <span data-slot="toggle-icon" aria-hidden className={slots.icon({ className })} {...props}>
      <span data-slot="toggle-icon-off" className={slots.iconOff()}>
        {off}
      </span>
      <span data-slot="toggle-icon-on" className={slots.iconOn()}>
        {on}
      </span>
    </span>
  )
}
