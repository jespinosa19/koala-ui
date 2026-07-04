"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { CaretDown } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Accordion: a multi-part component over Radix Accordion (keyboard nav, ARIA, single/
 * multiple expansion, the `--radix-accordion-content-height` var that drives the height
 * animation). Pattern: one `tv` recipe with `slots`, shared variants flowing to every
 * part through React Context. See docs/ARCHITECTURE.md §2.
 *
 * `variant` spans the minimal→contained range: `minimal` is a borderless list of rows
 * separated by hairlines; `card` wraps the set in one bordered surface with dividers;
 * `separated` gives every item its own card. The open/close height tween rides
 * tw-animate-css's `accordion-down`/`accordion-up` keyframes, retimed to Koala's
 * `duration-base`/`ease-out` tokens (the same way Dialog drives its enter/exit): no raw
 * ms/cubic-bezier in the component.
 */
export const accordionVariants = tv({
  slots: {
    root: "w-full",
    item: "",
    // Header is the Radix-rendered heading; it just lets the trigger stretch full width.
    header: "flex",
    trigger: [
      // `group/trigger` so the chevron can react to this trigger's own data-state.
      "group/trigger flex flex-1 items-center justify-between gap-4 text-left font-medium text-foreground",
      "cursor-pointer outline-none",
      // Specific transition (never `transition: all`). No scale-on-press here: a
      // full-width row shrinking on click reads as a layout jump, not a tactile press;
      // the chevron flip and panel tween carry the feedback instead.
      "transition-colors duration-fast ease-out",
      "hover:text-foreground/80",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:pointer-events-none",
    ],
    // Chevron flips on open. `duration-base ease-out` matches the panel below, so the
    // glyph and the height tween move as one gesture.
    icon: "size-4 shrink-0 text-muted-foreground transition-transform duration-base ease-out group-data-[state=open]/trigger:rotate-180",
    // Animated wrapper: overflow-hidden clips the inner padded div while height tweens.
    // `duration-base`/`ease-out` feed tw-animate-css's keyframes via --tw-duration/--tw-ease.
    // `group/content` lets the inner body read this wrapper's data-state for its own fade.
    content: [
      "group/content overflow-hidden text-sm text-muted-foreground",
      "duration-base ease-out",
      "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
    ],
    // Padding lives on the inner div, not the animated wrapper, so the height tween stays smooth.
    // The body also fades/slides in as one gesture with the height: Radix mounts Content fresh on
    // open, so a CSS *transition* would never fire (it mounts at its end state) — we use
    // tw-animate-css *animations* (which run on mount), keyed off the wrapper's data-state. Enter
    // is fade + a 4px drop (the content settling under the trigger); exit is a softer plain fade
    // (#6: exits subtler than enters), riding the same `duration-base`/`ease-out` as the height.
    contentInner: [
      "duration-base ease-out",
      "group-data-[state=open]/content:animate-in group-data-[state=open]/content:fade-in-0 group-data-[state=open]/content:slide-in-from-top-1",
      "group-data-[state=closed]/content:animate-out group-data-[state=closed]/content:fade-out-0",
    ],
  },
  variants: {
    variant: {
      // Borderless rows divided by a hairline: the minimal FAQ list.
      minimal: { item: "border-b border-border last:border-b-0" },
      // One bordered surface; items share dividers. Shadow over border for depth (#3).
      // Declares `--surface` so nested controls (Input/Select/ToggleGroup, e.g. a FaqsFeedback
      // row) blend onto the card instead of painting the darker page `--background` (the
      // --surface contract).
      card: {
        root: "rounded-xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
        item: "border-b border-border last:border-b-0",
      },
      // Every item is its own standalone card, stacked with a gap. The card surface (and its
      // `--surface` declaration) lives on the item here, since each item is the bordered card.
      separated: {
        root: "flex flex-col gap-3",
        item: "rounded-xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For Accordion it
    // governs the row height and content inset; horizontal inset for the contained variants
    // lives in compoundVariants below. `comfortable` is the spacious marketing default.
    density: {
      comfortable: { trigger: "py-4 text-base", contentInner: "pb-4" },
      compact: { trigger: "py-3 text-sm", contentInner: "pb-3" },
    },
    // Where the chevron sits relative to the question. `trailing` (default) keeps the glyph
    // pinned to the right via the base `justify-between`; `leading` moves it ahead of the
    // label (the knowledge-base / help-center look) by packing the row to the start and
    // tightening the caret↔label gap. The DOM order is swapped in AccordionTrigger so the
    // caret reads first; nothing else about the row changes. Default stays `trailing`, so
    // every existing Accordion is untouched.
    iconPosition: {
      trailing: {},
      leading: { trigger: "justify-start gap-3" },
    },
  },
  compoundVariants: [
    // Contained variants need horizontal inset so the chrome doesn't kiss the text; the
    // minimal variant stays flush-left. Inset tracks density.
    { variant: ["card", "separated"], density: "comfortable", className: { trigger: "px-5", contentInner: "px-5" } },
    { variant: ["card", "separated"], density: "compact", className: { trigger: "px-4", contentInner: "px-4" } },
  ],
  defaultVariants: {
    variant: "minimal",
    density: "comfortable",
    iconPosition: "trailing",
  },
})

type AccordionSlots = ReturnType<typeof accordionVariants>
type IconPosition = NonNullable<VariantProps<typeof accordionVariants>["iconPosition"]>
const [AccordionProvider, useAccordionContext] = createContext<{
  slots: AccordionSlots
  iconPosition: IconPosition
}>("Accordion")

// Radix's Root props are a discriminated union (single vs. multiple expansion); model
// our extras as an intersection `type` so that union survives; an `interface extends`
// would collapse it and drop `children`/`type`.
export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>

/**
 * Parts are exported individually (not `Accordion.Item` dot-notation): namespaced statics
 * don't survive the RSC server→client boundary. Compose as `<Accordion><AccordionItem>…`.
 * Forwards Radix's `type` ("single" | "multiple"), `collapsible`, `value`/`defaultValue`.
 */
export function Accordion({
  className,
  variant,
  density,
  iconPosition = "trailing",
  ...props
}: AccordionProps) {
  // Resolve density once (prop > provider > "comfortable"); every part reads the slots
  // from context.
  const slots = accordionVariants({ variant, density: useDensity(density), iconPosition })
  return (
    <AccordionProvider slots={slots} iconPosition={iconPosition}>
      <AccordionPrimitive.Root data-slot="accordion" className={slots.root({ className })} {...props} />
    </AccordionProvider>
  )
}

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { slots } = useAccordionContext("AccordionItem")
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={slots.item({ className })} {...props} />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const { slots, iconPosition } = useAccordionContext("AccordionTrigger")
  // Same glyph either way; only the DOM order flips so a `leading` caret reads before the
  // label. The flip is in markup (not CSS `order`) so the tab/read order stays caret→label.
  const icon = <CaretDown weight="bold" data-slot="accordion-icon" aria-hidden className={slots.icon()} />
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className={slots.header()}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={slots.trigger({ className })}
        {...props}
      >
        {iconPosition === "leading" ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          <>
            {children}
            {icon}
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { slots } = useAccordionContext("AccordionContent")
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className={slots.content()} {...props}>
      <div className={slots.contentInner({ className })}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
