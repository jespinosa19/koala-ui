"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * RadioGroup: a Radix RadioGroup styled with Koala tokens. Multi-part (the group root and its
 * items), so the recipe lives in two slots and the shared `size` flows from `RadioGroup` to each
 * `RadioGroupItem` through a typed Context, never prop-drilled. Use it for a single choice from a
 * small, visible set. Reach for a Select once the options grow long enough to want a dropdown.
 *
 * Sizes mirror Checkbox exactly (sm = 16px, md = 20px) so a radio and a checkbox line up pixel-for-
 * pixel in the same form. Checked, it also fills like Checkbox: the whole circle floods with the
 * accent (brand) and a white dot is knocked out of the center, the canonical "one of many" affordance.
 *
 * `"use client"` because Radix RadioGroup is interactive (roving focus + state). Each item renders
 * only the control; pair it with a `<label htmlFor>` for an accessible name and a larger hit target.
 */
export const radioGroupVariants = tv({
  slots: {
    root: "grid gap-2.5",
    item: [
      "peer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-background shadow-xs",
      // Specific transition (never `transition: all`, #14); tactile press scale (#12).
      "transition-colors duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Checked floods with the accent (brand) exactly like Checkbox; the white dot below is knocked out.
      "data-[state=checked]:border-brand data-[state=checked]:bg-brand",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    // The indicator is force-mounted (always in the DOM), so the dot tweens both IN on select and
    // OUT on deselect via an interruptible CSS transition (#4) instead of a one-shot mount keyframe.
    // Rapid switches between options now cross-fade smoothly. Scale is a standalone prop in v4, so
    // it's named explicitly in transition-[…] (a bare `transform` would snap it).
    indicator: [
      "flex items-center justify-center scale-50 opacity-0",
      "transition-[scale,opacity] duration-fast ease-out",
      "data-[state=checked]:scale-100 data-[state=checked]:opacity-100",
    ],
    // White dot knocked out of the brand fill; the indicator above carries the enter/exit motion.
    dot: "rounded-full bg-white",
  },
  variants: {
    size: {
      sm: { item: "size-4", dot: "size-1.5" },
      md: { item: "size-5", dot: "size-2" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type RadioGroupSlots = ReturnType<typeof radioGroupVariants>
const [RadioGroupProvider, useRadioGroupContext] =
  createContext<{ slots: RadioGroupSlots }>("RadioGroup")

// ─── RadioGroup ─────────────────────────────────────────────────────────────────

export interface RadioGroupProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {}

export function RadioGroup({ className, size, ...props }: RadioGroupProps) {
  const slots = radioGroupVariants({ size })
  return (
    <RadioGroupProvider slots={slots}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={slots.root({ className })}
        {...props}
      />
    </RadioGroupProvider>
  )
}

// ─── RadioGroupItem ─────────────────────────────────────────────────────────────

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>

export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  const { slots } = useRadioGroupContext("RadioGroupItem")
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={slots.item({ className })}
      {...props}
    >
      {/* forceMount keeps the indicator in the DOM while unchecked so the dot can animate OUT, not
          just IN. The recipe hides it (scale-50 opacity-0) until data-state flips to checked. */}
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className={slots.indicator()}
      >
        <span className={slots.dot()} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

// ─── RadioCard ──────────────────────────────────────────────────────────────────

/**
 * RadioCard: a RadioGroupItem dressed as a full selectable card, the affordance behind a
 * "choose your plan / theme / payment method" list. The whole card IS the radio (a Radix
 * `RadioGroup.Item`, so roving focus, keyboard and ARIA come for free); it renders an optional
 * leading `icon`, a `RadioCardTitle` + `RadioCardDescription` body, and a trailing circle that
 * flood-fills exactly like the standalone control.
 *
 * That circle reflects the CARD's checked state through `group-data-[state=checked]` (the card
 * is the state owner), so there's no second Radix Indicator to keep in sync. Selected, the card
 * borders brand and lifts the soft accent halo (`brand-ring`); the white dot tweens in.
 *
 * Content is `<span>`-based on purpose: a Radix Item renders a `<button>`, which may only hold
 * phrasing content, so `<p>`/`<h3>` in here would be invalid HTML.
 */
export const radioCardVariants = tv({
  slots: {
    card: [
      "group relative flex w-full cursor-pointer items-start border border-input bg-transparent text-left text-card-foreground shadow-xs",
      // Specific transition (never `transition: all`, #14); scale is a standalone prop in v4 so it's
      // named explicitly (a bare `transform` would snap the press). Gentle press on the big surface (#12).
      "transition-[border-color,box-shadow,background-color,scale] duration-fast ease-out active:scale-[0.99]",
      // Soft accent halo (brand-ring) on focus + checked. brand-ring wins over the base shadow-xs by
      // specificity, so only one box-shadow ever paints (see the ring-utility rule).
      "outline-none focus-visible:border-brand focus-visible:brand-ring",
      "data-[state=unchecked]:hover:border-brand/40",
      "data-[state=checked]:border-brand data-[state=checked]:brand-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    // Bare leading glyph (no chip), muted until the card is picked, then brand. Colour only, no
    // scale pop on select (deliberate: the flooded dot carries the motion).
    icon: "mt-px shrink-0 text-muted-foreground transition-colors duration-fast ease-out group-data-[state=checked]:text-brand",
    body: "flex min-w-0 flex-1 flex-col gap-1",
    title: "block text-sm font-semibold leading-none text-foreground",
    description: "block text-pretty text-sm leading-snug text-muted-foreground",
    // The embedded radio circle mirrors the standalone RadioGroupItem, but keyed to the CARD's
    // state via group-data (the card itself is the Radix Item, so it owns data-state).
    control:
      "mt-0.5 grid shrink-0 place-items-center self-start rounded-full border border-input bg-background transition-colors duration-fast ease-out group-data-[state=checked]:border-brand group-data-[state=checked]:bg-brand",
    // White dot knocked out of the brand fill; scales + fades in when the card is picked (#4/#15).
    dot: "rounded-full bg-white scale-50 opacity-0 transition-[scale,opacity] duration-fast ease-out group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100",
  },
  variants: {
    // `md` (default) suits a title + description, so it top-aligns (icon/control to the title's
    // first line). `sm` tightens the padding and shrinks the control, icon and radius (concentric,
    // #7) for a ONE-LINE option (title-only, or icon + text): it also centers everything vertically
    // (there's no description to align to) and drops the title to medium (600 reads heavy on a lone
    // line). The title weight is set from here via its data-slot, since RadioCardTitle is a separate
    // component that can't see `size`. Control/dot sizes mirror the standalone RadioGroupItem's sm/md.
    size: {
      sm: {
        card: "items-center gap-2.5 rounded-lg p-3 [&_[data-slot=radio-card-title]]:font-medium",
        icon: "mt-0 [&>svg]:size-5",
        control: "mt-0 size-4 self-center",
        dot: "size-1.5",
      },
      md: { card: "gap-3 rounded-xl p-4", icon: "[&>svg]:size-6", control: "size-5", dot: "size-2" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface RadioCardProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "size">,
    VariantProps<typeof radioCardVariants> {
  /** Optional leading glyph (a single Phosphor icon). Muted until the card is selected, then brand. */
  icon?: React.ReactNode
}

export function RadioCard({ className, icon, size, children, ...props }: RadioCardProps) {
  const { card, icon: iconSlot, body, control, dot } = radioCardVariants({ size })
  return (
    <RadioGroupPrimitive.Item data-slot="radio-card" className={card({ className })} {...props}>
      {icon ? (
        <span data-slot="radio-card-icon" className={iconSlot()} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={body()}>{children}</span>
      {/* Decorative: the real input is the card itself, so this circle only mirrors its state. */}
      <span data-slot="radio-card-control" className={control()} aria-hidden>
        <span className={dot()} />
      </span>
    </RadioGroupPrimitive.Item>
  )
}

export function RadioCardTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { title } = radioCardVariants()
  return <span data-slot="radio-card-title" className={title({ className })} {...props} />
}

export function RadioCardDescription({ className, ...props }: React.ComponentProps<"span">) {
  const { description } = radioCardVariants()
  return (
    <span data-slot="radio-card-description" className={description({ className })} {...props} />
  )
}
