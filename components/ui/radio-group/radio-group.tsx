"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { useFieldContext } from "@/lib/field-context"
import { hitBox, hitCoarse } from "@/lib/hit-area"

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
      // The empty circle fills with `--surface`, the DS contract for "what surface am I sitting
      // on" (same as Input and Checkbox): inside a card, a Dialog or a Survey it blends with that
      // surface rather than painting the page `--background`, a step darker in the dark themes.
      "peer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-[var(--surface,var(--background))] shadow-xs",
      // Same as Checkbox: a 16-20px circle grows its hit area to 44x44 on touch (lib/hit-area.ts).
      hitCoarse,
      // Specific transition (never `transition: all`, #14); tactile press scale (#12).
      "transition-colors duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Checked floods with the accent (brand) exactly like Checkbox; the dot below is knocked out in
      // the accent's ink (--brand-foreground: white, or dark on a light accent like lime).
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
    dot: "rounded-full bg-brand-foreground",
    // RadioSwatch: the colour chip of a product-variant picker. The chip IS the radio, filled with
    // the option's own colour (inline style: a product colour is data, not a token).
    swatch: [
      "inline-flex shrink-0 cursor-pointer rounded-full",
      // The chip is 24-32px, so the house extender grows its target to 40px (44 on touch). Keep
      // the group's gap at 8px or more and neighbouring targets never overlap.
      hitBox,
      // Image-outline edge (#11) on ::after, so a white or pale chip never dissolves into the page.
      // Pure black/white alpha, never a tinted neutral; ::after because the ring below owns box-shadow.
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/15",
      // Selection is a fine ring held off the chip by a gap painted in the ground's own colour, so
      // it reads on every chip colour (a check glyph would have to guess its contrast per swatch).
      // The gap takes `--surface`, so the cut-out matches a card or popover, not just the page.
      "ring-offset-[3px] ring-offset-[var(--surface,var(--background))]",
      // Specific transition (never `transition: all`, #14); scale is a standalone prop in v4, so it
      // is named. The ring draws in from nothing because only its spread changes. Press (#12).
      "transition-[box-shadow,scale] duration-fast ease-out active:scale-[0.96]",
      // The ring is ink, not brand, and this is the one selected control that breaks the brand rule
      // on purpose: every other control has no colour of its own, but here the chip's colour IS the
      // content. A brand ring round a sage or graphite chip adds a third colour the product doesn't
      // have and competes with the brand CTA beside it. Hover previews the same ring, faint.
      "data-[state=unchecked]:hover:ring-[1.5px] data-[state=unchecked]:hover:ring-foreground/25",
      "data-[state=checked]:ring-[1.5px] data-[state=checked]:ring-foreground",
      // Keyboard focus is a brand OUTLINE outside the ring (outline and box-shadow don't collide),
      // so a focused chip and the chosen chip never look alike.
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brand",
      "disabled:cursor-not-allowed disabled:opacity-40",
    ],
  },
  variants: {
    size: {
      sm: { item: "size-4", dot: "size-1.5", swatch: "size-6" },
      md: { item: "size-5", dot: "size-2", swatch: "size-8" },
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

export function RadioGroup({
  className,
  size,
  disabled,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  const slots = radioGroupVariants({ size })
  // Radix renders a `div`, which `htmlFor` can't name, so a surrounding Field is picked up
  // through `aria-labelledby` instead. Prefer `FieldGroup` for a radio cluster (a real
  // fieldset + legend names it with no ARIA at all); this keeps the Field case correct too.
  const field = useFieldContext()
  return (
    <RadioGroupProvider slots={slots}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        disabled={disabled ?? field?.disabled}
        aria-labelledby={ariaLabelledBy ?? field?.labelledBy}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-invalid={field?.hasError || undefined}
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

// ─── RadioSwatch ────────────────────────────────────────────────────────────────

export interface RadioSwatchProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "color" | "children"> {
  /** The chip's fill: any CSS colour. A product colour is data, so it is set inline, not tokenized. */
  color: string
  /**
   * The option's accessible name, e.g. "Navy". Required: a colour chip carries no visible text,
   * so this is the only thing a screen reader can announce. Show the chosen name in the group's
   * label ("Color: Navy") for sighted users.
   */
  label: string
}

/**
 * RadioSwatch: a RadioGroupItem dressed as a colour chip, the affordance behind a product's
 * "Color" picker. Radix still owns roving focus, arrow keys and ARIA; the chip is filled with
 * `color`, outlined so pale colours hold their edge, and ringed in ink when chosen. Its size
 * follows the group's `size` through context (`sm` = 24px, `md` = 32px). Lay the group out as a
 * row: `<RadioGroup className="flex flex-wrap gap-3">`.
 */
export function RadioSwatch({ className, color, label, style, ...props }: RadioSwatchProps) {
  const { slots } = useRadioGroupContext("RadioSwatch")
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-swatch"
      aria-label={label}
      className={slots.swatch({ className })}
      style={{ backgroundColor: color, ...style }}
      {...props}
    />
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
      "mt-0.5 grid shrink-0 place-items-center self-start rounded-full border border-input bg-[var(--surface,var(--background))] transition-colors duration-fast ease-out group-data-[state=checked]:border-brand group-data-[state=checked]:bg-brand",
    // White dot knocked out of the brand fill; scales + fades in when the card is picked (#4/#15).
    dot: "rounded-full bg-brand-foreground scale-50 opacity-0 transition-[scale,opacity] duration-fast ease-out group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100",
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
