"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { CaretDown, Plus } from "@phosphor-icons/react"

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
 * `separated` gives every item its own card. Off that axis sits `pill`, where a closed
 * row hugs its own text as a chip and the open one floods into a filled card (the FAQ
 * beside a photo; see the `pill` slot below). `marker` picks the disclosure mark: the
 * default `caret` chevron, or the `plus` that turns into an ✕ (the FAQ / help-centre
 * mark, shared with GalleryAccordion). The open/close height tween rides
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
    // The disclosure mark's box. The *turn* lives on the `marker` variant below, not here: both
    // glyphs rotate by a different amount, and `caret-turn` is its own tailwind-merge group
    // (`koala-caret`, lib/utils.ts) with no conflict entry, so a rotation left on the base slot
    // would survive into the other branch and stack with it.
    icon: "size-4 shrink-0 text-muted-foreground",
    // Animated wrapper: overflow-hidden clips the inner padded div while height tweens.
    // `duration-base`/`ease-out` feed tw-animate-css's keyframes via --tw-duration/--tw-ease.
    // `group/content` lets the inner body read this wrapper's data-state for its own fade.
    content: [
      // The answer is read, so it takes the reading ink (`text-body`), not the meta grey.
      "group/content overflow-hidden text-sm text-body",
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
      // One contour; items share dividers. The edge is an `--edge` ring plus the xs lift, not a
      // border (docs/FOUNDATIONS.md, "Shadows over borders"): it takes no layout. No fill:
      // fill is elevation (docs/FOUNDATIONS.md), so an in-flow box takes the ground it sits on and
      // declares no `--surface`; a nested control (a FaqsFeedback ToggleGroup) inherits that same
      // ground. A filled box here only ever showed in dark, as a grey slab nobody designed.
      card: {
        root: "rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
        item: "border-b border-border last:border-b-0",
      },
      // Every item is its own ring-edged contour, stacked with a gap. Same no-fill rule as `card`.
      separated: {
        root: "flex flex-col gap-3",
        item: "rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
      },
      // Chips. The one variant where a closed row does NOT span the list: each question hugs its
      // own text as a pill, so the stack reads as a ragged column of labels, and the open one
      // floods to full width and squares off into a filled card with its answer inside. Built for
      // a short list beside something else (a photograph, a product shot): the ragged edge is what
      // keeps a column of 5-6 questions from reading as a table of contents.
      //
      // ONE element paints, the item, in both shapes. The tints are alpha, so a chip fill on the
      // trigger and a card fill on the item would double wherever they overlapped, and handing the
      // fill from one element to the other on open left both painting for the length of the fade:
      // the question row flashed a step darker every time you opened it. With a single painted box
      // the fill never changes at all, so there is nothing to hand over and nothing to flash. It
      // is the same `foreground/6 → /10` ink tint Tabs and ToggleGroup use for a segment, so it
      // reads one step off whatever ground it lands on (page, muted band, dark band) rather than
      // needing a token per surface. Unlike the three chrome levels above this one does paint,
      // because a pill is a control, not a container.
      //
      // The shape is keyed on whether THE ANSWER IS SHOWING, not on `data-state`: Radix flips the
      // state at the click but keeps the answer rendered until its exit animation ends, marking it
      // `hidden` only once it is really gone. On `data-state` the card snapped back to a pill while
      // its own answer was still collapsing inside it. Hence also the `:not([hidden])`: a bare
      // `has-[[data-slot=accordion-content]]` matches every row in the list, open or not, because
      // Radix never unmounts it.
      //
      // THE SHAPE IS ONE RADIUS, NOT TWO. A chip and a card look different here only because the
      // box is a different height: at `rounded-2xl` a 44px row is already a perfect stadium (a
      // radius past half the height is clamped to exactly half), and the same 24px reads as a card
      // once the answer grows the box. Tweening `rounded-pill → rounded-2xl` instead, which is the
      // obvious way to write this, looked broken: the clamp holds the corners at half the height
      // for most of the tween, so the opening card ballooned into a giant lozenge and only snapped
      // square at the very end. With one rung there is nothing to tween and the whole morph is
      // carried by the height, which is the thing that is actually changing.
      pill: {
        root: "flex flex-col items-start gap-2",
        item: [
          // `w-fit` is what makes a closed row hug its question. It can only do that because the
          // answer below contributes no intrinsic width (see the `content` slot).
          "interpolate-size w-fit max-w-full rounded-2xl bg-foreground/6",
          "transition-[width,background-color,transform] duration-base ease-out motion-reduce:transition-none",
          // `:active` applies to the ancestors of the pressed button, so the whole chip presses
          // from the trigger inside it. A chip is small enough to; the objection on the base slot
          // (a full-width row shrinking reads as a layout jump) only starts to apply once the pill
          // IS the full-width card, which is exactly where the press stands down again.
          "hover:bg-foreground/10 active:scale-[0.97]",
          "has-[[data-slot=accordion-content]:not([hidden])]:w-full",
          // Width tweens ONE WAY, and that is deliberate. A transition runs when the property
          // changes and the NEW style still lists it, so dropping `width` here makes opening
          // instant and closing animated. Opening must be instant: Radix measures the answer's
          // height the moment it mounts, and mid-tween it would measure the prose wrapped at chip
          // width, i.e. far too tall, then animate to that wrong height while the text re-wrapped
          // under it. Closing has no such problem, because by then the answer is `hidden` and there
          // is nothing left to re-wrap, so the card can narrow back into its chip.
          "has-[[data-slot=accordion-content]:not([hidden])]:transition-[background-color,transform]",
          // Two variants each, so they sort after the single-variant `hover:`/`active:` above and
          // win: an open card neither tints under the pointer nor presses.
          "has-[[data-slot=accordion-content]:not([hidden])]:hover:bg-foreground/6",
          "has-[[data-slot=accordion-content]:not([hidden])]:active:scale-100",
        ],
        // Chains the item's radius down to the trigger, so one swap re-rounds the whole chip
        // rather than each part carrying its own copy of the radius pair.
        header: "rounded-[inherit]",
        trigger: [
          // The row keeps its full-strength ink: the fill carries the hover, so the base slot's
          // dim to `foreground/80` is dropped (same `hover:` prefix, so tailwind-merge takes it).
          "rounded-[inherit] text-foreground hover:text-foreground",
          "transition-[color] duration-fast ease-out",
        ],
        // `w-0` is what keeps the ANSWER out of the item's `w-fit` measurement: a percentage
        // min-width resolves to nothing while the parent is being sized, so the pill is always as
        // wide as its question and never as wide as its answer, while `min-w-full` still lays the
        // prose out across the open card.
        content: "w-0 min-w-full",
        // The mark gets its own chip inside the pill: one more step of the same ink tint, so it
        // reads as a button within a button. Padding on the `<svg>` itself (rather than a wrapper
        // span) keeps the trigger's markup identical across variants — the viewBox scales into the
        // content box, so `size-6 p-1` is a 24px circle around a 16px glyph. Rotating the circle
        // with the glyph is invisible, so `caret-turn` still does the turning.
        icon: "size-6 rounded-full bg-foreground/10 p-1",
      },
      // Tiles on a board. `separated`'s outline, laid out as a grid instead of a stack: the closed
      // questions read as a wall you scan rather than a list you go down, and the one you open
      // takes the full width of the board (`col-span-full`) so its answer gets a real measure
      // instead of a third of one. Same `:has()` key as `pill` and for the same reason: the answer
      // outlives its `data-state` by the length of the collapse, and the tile must keep the width
      // it is collapsing inside.
      //
      // `grid-cols-1` is explicit, never implied: a responsive grid that only names `sm:` up
      // inherits whatever the parent grid had at the narrow end.
      board: {
        root: "grid grid-cols-1 gap-3 sm:grid-cols-2",
        // A flex COLUMN, not a plain block: it is what lets the question stretch into the dead
        // space of an equal-height grid row (see `header`). Never `h-full` on the parts, which
        // measures against the row rather than the tile and pushes the answer out of the bottom.
        item: [
          "flex flex-col rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
          "transition-shadow duration-fast ease-out hover:shadow-sm",
          "has-[[data-slot=accordion-content]:not([hidden])]:col-span-full",
        ],
        // The whole tile is the target. Grid rows stretch to their tallest cell, so a one-line
        // question in a row with a two-line one would otherwise leave a strip under it that looks
        // clickable and is not. `flex-1` hands that strip to the trigger, and takes nothing when
        // the tile is open (a `col-span-full` tile is alone in its row and sized by its answer).
        header: "flex-1",
        trigger: "items-start",
        // `items-start` puts the mark at the top of a wrapped question; the nudge centres it
        // optically on the first line (16px glyph in a 24px line box) instead of on the ascender.
        icon: "mt-1",
        // The open tile is as wide as the whole board, which is far past a reading measure, so the
        // answer keeps its own. The tile stays full width: it is the text that is capped, not the
        // card, so the grid rhythm is unbroken.
        contentInner: "max-w-3xl",
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
    // Which disclosure mark the trigger draws. `caret` (default) is the chevron that flips a full
    // 180°; `plus` is the FAQ / help-centre mark, a Plus that turns 45° into an ✕ — the same glyph
    // and the same turn GalleryAccordion uses, so the library has ONE disclosure mark rather than
    // two idioms for the same gesture. Both take `caret-turn` (duration-base ease-out, held under
    // reduced motion), so glyph and height tween read as one gesture, and both stay neutral in
    // every state: the motion is the feedback, not a color change.
    marker: {
      caret: { icon: "caret-turn group-data-[state=open]/trigger:rotate-180" },
      plus: { icon: "caret-turn group-data-[state=open]/trigger:rotate-45" },
    },
    // The type scale, orthogonal to density (which is spacing only). `md` leaves the row to
    // density. `lg` is the landing-page FAQ, where each question is read as a heading: an 18px
    // semibold question on a taller row, a 16px answer and a 20px mark. Declared after `density`
    // so its row padding and type win the merge.
    size: {
      md: {},
      lg: { trigger: "py-5 text-lg font-semibold", icon: "size-5", contentInner: "pb-5 text-base" },
    },
  },
  compoundVariants: [
    // Contained variants need horizontal inset so the chrome doesn't kiss the text; the
    // minimal variant stays flush-left. Inset tracks density.
    { variant: ["card", "separated", "board"], density: "comfortable", className: { trigger: "px-5", contentInner: "px-5" } },
    { variant: ["card", "separated", "board"], density: "compact", className: { trigger: "px-4", contentInner: "px-4" } },
    // A pill is padded on all four sides, so its row padding lives here rather than on the
    // density variant: `density` is declared after `variant`, so a `py-*` set inside the `pill`
    // slot would lose the merge to it. Compounds apply last, so this is where a variant gets to
    // overrule the shared row height. Both steps clear the 40px hit-area floor (48 / 40).
    // The bottom inset is one rung TIGHTER than the shared variants' would be, because the row
    // above it already contributes the trigger's own bottom padding: measured from the ink, 12 over
    // the question and 16 under the answer read as an even card, while a matching 20 read as a
    // card that had slid up.
    { variant: "pill", density: "comfortable", className: { trigger: "gap-3 px-5 py-3", contentInner: "px-5 pb-4" } },
    { variant: "pill", density: "compact", className: { trigger: "gap-2.5 px-4 py-2.5", contentInner: "px-4 pb-3" } },
    // `size` is declared after `variant` too, so `lg`'s 20px mark would shrink the chip back;
    // the chip steps up with the type instead.
    { variant: "pill", size: "lg", className: { icon: "size-7" } },
  ],
  defaultVariants: {
    variant: "minimal",
    density: "comfortable",
    iconPosition: "trailing",
    marker: "caret",
    size: "md",
  },
})

type AccordionSlots = ReturnType<typeof accordionVariants>
type IconPosition = NonNullable<VariantProps<typeof accordionVariants>["iconPosition"]>
type Marker = NonNullable<VariantProps<typeof accordionVariants>["marker"]>
const [AccordionProvider, useAccordionContext] = createContext<{
  slots: AccordionSlots
  iconPosition: IconPosition
  marker: Marker
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
  marker = "caret",
  size,
  ...props
}: AccordionProps) {
  // Resolve density once (prop > provider > "comfortable"); every part reads the slots
  // from context.
  const slots = accordionVariants({ variant, density: useDensity(density), iconPosition, marker, size })
  return (
    <AccordionProvider slots={slots} iconPosition={iconPosition} marker={marker}>
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
  const { slots, iconPosition, marker } = useAccordionContext("AccordionTrigger")
  // The mark itself is picked by `marker`; its turn is already baked into the `icon` slot.
  const Glyph = marker === "plus" ? Plus : CaretDown
  // Same glyph either way; only the DOM order flips so a `leading` caret reads before the
  // label. The flip is in markup (not CSS `order`) so the tab/read order stays caret→label.
  const icon = <Glyph weight="bold" data-slot="accordion-icon" aria-hidden className={slots.icon()} />
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
