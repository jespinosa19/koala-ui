"use client"

import * as React from "react"
import { ThumbsDown, ThumbsUp } from "@phosphor-icons/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * FAQs: a marketing-ready "frequently asked questions" section built *on top of* our
 * Accordion. Multi-part like Bento/Banner: one `tv` recipe with `slots`, shared through a
 * typed React Context so every part reads the same `layout`. See docs/ARCHITECTURE.md §2.
 *
 * The value-add over a bare Accordion is the section composition: a header (title +
 * description), the Q&A list, and an optional footer CTA, arranged by `layout`:
 *   - `stacked` - centered header above a width-constrained list (the classic centered FAQ).
 *   - `split`   - a two-column grid: a sticky header column on the left, the list on the
 *                 right (the Stripe/Linear-style FAQ). The footer spans both columns.
 *
 * `FaqsList` wraps Accordion with marketing defaults (single-expand, collapsible, `card`),
 * and `FaqsItem` collapses the Accordion's item/trigger/content trio into one
 * `question` + answer call. All Accordion behavior (keyboard nav, ARIA, the height tween)
 * comes along for free, so there's no new behavior to hand-roll. Marketing is comfortable
 * by nature, so the section owns no density axis - density still forwards through to the
 * underlying Accordion via `FaqsList`.
 *
 * For a long, categorized help center, `FaqsGroup` slots topic clusters between the header
 * and footer: a topic heading (+ optional blurb) above its own question list. Each group is
 * a self-contained `FaqsList`, so single-expand is scoped per topic (one open answer per
 * category, the knowledge-base norm) and the minimal hairline dividers reset cleanly at
 * every group boundary. The header→topic→questions→topic rhythm is the grouped variant.
 */
export const faqsVariants = tv({
  slots: {
    root: "w-full",
    header: "flex flex-col",
    // Shares the canonical `section-heading` size utility (app/globals.css) with SectionHeader and
    // Gallery, so the FAQ lede follows the one section-H2 scale and never drifts.
    title: "section-heading font-semibold tracking-tight text-balance text-foreground",
    description: "mt-4 text-base text-pretty text-body sm:text-lg",
    // List spacing/placement only; the Accordion's own chrome (border, dividers) comes from
    // its `variant`. Merged onto the Accordion root, so no extra wrapper node.
    list: "",
    // A topic cluster (the grouped variant): a heading above its own question list. The
    // top margin (set per-layout) is what separates one topic from the header and the next.
    group: "flex flex-col",
    // The topic heading: an <h3>, clearly subordinate to the section <h2> (FaqsTitle) so the
    // outline reads header → topic → questions. Smaller than the section lede, never rivals it.
    groupTitle: "text-xl font-semibold tracking-tight text-balance text-foreground sm:text-2xl",
    groupDescription: "mt-2 max-w-2xl text-sm text-pretty text-muted-foreground sm:text-base",
    // Gap between the topic heading and its questions. Merged onto the inner FaqsList, so it
    // overrides the layout's own `list` margin within a group.
    groupList: "mt-5",
    // The "still have questions?" CTA row: muted prose with the action sitting beside it.
    footer:
      "flex flex-col items-center justify-center gap-x-4 gap-y-3 text-pretty text-center text-muted-foreground sm:flex-row",
  },
  variants: {
    layout: {
      stacked: {
        root: "mx-auto flex max-w-3xl flex-col",
        header: "items-center text-center",
        list: "mt-10",
        // Topics stand apart from the header and from each other with a uniform top margin;
        // the centered header above, the left-aligned topic clusters below.
        group: "mt-12 first:mt-10",
        footer: "mt-12",
      },
      // items-start lets the header column go `sticky`. Grid is 1-col on mobile (stacks),
      // splitting into header | list from `lg` up. Grouped topics are a stacked-layout
      // pattern; if one is dropped here it spans both columns rather than wedging into the grid.
      split: {
        root: "grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]",
        header: "lg:sticky lg:top-24",
        group: "lg:col-span-2",
        footer: "mt-2 lg:col-span-2",
      },
    },
    // The type scale. `md` is the help-centre scale. `lg` is the landing-page FAQ: topic headings
    // big enough to scan the page by (30/36px), and every list inside takes the Accordion's own
    // `lg` step (an 18px semibold question on a taller row) through `FaqsList`, so the questions
    // and their topic step up together. A list's own `size` still wins.
    size: {
      md: {},
      lg: { groupTitle: "text-3xl sm:text-4xl", groupList: "mt-4" },
    },
  },
  compoundVariants: [
    // Topics at the landing scale sit a full 48px apart, and the FIRST one resets to zero: the
    // stacked `first:mt-10` only ever made sense below a FaqsHeader, and a landing FAQ usually
    // has its lede in a SectionHeader outside the block, where that margin doubles the gap.
    { layout: "stacked", size: "lg", class: { group: "mt-12 first:mt-0" } },
  ],
  defaultVariants: {
    layout: "stacked",
    size: "md",
  },
})

type FaqsSlots = ReturnType<typeof faqsVariants>
type FaqsSize = NonNullable<VariantProps<typeof faqsVariants>["size"]>
const [FaqsProvider, useFaqsContext] = createContext<{ slots: FaqsSlots; size: FaqsSize }>("Faqs")

export interface FaqsProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof faqsVariants> {}

/**
 * The section container. Parts are exported individually (not `Faqs.Item` dot-notation):
 * namespaced statics don't survive the RSC server→client boundary. Compose as
 * `<Faqs><FaqsHeader>…</FaqsHeader><FaqsList><FaqsItem>…</FaqsItem></FaqsList></Faqs>`.
 */
export function Faqs({ className, layout, size = "md", ...props }: FaqsProps) {
  const slots = faqsVariants({ layout, size })
  return (
    <FaqsProvider slots={slots} size={size}>
      <div data-slot="faqs" className={slots.root({ className })} {...props} />
    </FaqsProvider>
  )
}

/** The header column: holds the title and description (and anything else you drop in). */
export function FaqsHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFaqsContext("FaqsHeader")
  return <div data-slot="faqs-header" className={slots.header({ className })} {...props} />
}

/** The section heading. Renders an `<h2>` by default for a sensible document outline. */
export function FaqsTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { slots } = useFaqsContext("FaqsTitle")
  return <h2 data-slot="faqs-title" className={slots.title({ className })} {...props} />
}

/** The supporting blurb under the title. */
export function FaqsDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useFaqsContext("FaqsDescription")
  return <p data-slot="faqs-description" className={slots.description({ className })} {...props} />
}

export type FaqsListProps = Partial<AccordionProps>

// `type` intersection, not `interface extends`: FaqsListProps is `Partial<AccordionProps>`,
// and AccordionProps carries Radix's single/multiple discriminated union, which an interface
// can't extend (no statically-known members). The intersection keeps every forwarded list prop.
export type FaqsGroupProps = FaqsListProps & {
  /** The topic heading shown above this group's questions. Rendered as an `<h3>`. */
  title?: React.ReactNode
  /** Optional supporting copy under the topic heading. */
  description?: React.ReactNode
  /** Class for the group wrapper (the topic heading + list). */
  className?: string
  /** Class forwarded to the inner `FaqsList`. */
  listClassName?: string
  /** The group's `FaqsItem`s. */
  children?: React.ReactNode
}

/**
 * A topic cluster for the grouped / help-center variant: a heading (and optional blurb)
 * above its own question list. Drop several between `FaqsHeader` and `FaqsFooter` to split a
 * long FAQ into categories ("Most asked", "Billing", ...). Each group owns its own
 * `FaqsList`, so single-expand is scoped to the topic and the hairline dividers reset at
 * every boundary. Defaults to the borderless `minimal` list (the categorized look); every
 * `FaqsList` / Accordion prop (`variant`, `type`, `defaultValue`, `iconPosition`, `density`)
 * still forwards through, so a group can opt into `card` or open its first answer like any list.
 */
export function FaqsGroup({
  title,
  description,
  className,
  listClassName,
  children,
  ...listProps
}: FaqsGroupProps) {
  const { slots } = useFaqsContext("FaqsGroup")
  return (
    <div data-slot="faqs-group" className={slots.group({ className })}>
      {title ? <h3 className={slots.groupTitle()}>{title}</h3> : null}
      {description ? <p className={slots.groupDescription()}>{description}</p> : null}
      <FaqsList variant="minimal" className={slots.groupList({ className: listClassName })} {...listProps}>
        {children}
      </FaqsList>
    </div>
  )
}

/**
 * The Q&A list. A thin wrapper over Accordion with marketing defaults (single-expand,
 * collapsible, the contained `card` variant). Any of them - plus `type="multiple"`,
 * `defaultValue`, `density`, etc. - can be overridden; they forward straight to Accordion.
 */
export function FaqsList({ className, ...props }: FaqsListProps) {
  const { slots, size } = useFaqsContext("FaqsList")
  // The cast resolves Radix's single/multiple discriminated union once, at this boundary,
  // so the defaults stay overridable without each prop fighting the union narrowing. `size`
  // defaults to the section's own, so a landing-scale Faqs steps its questions up with it.
  const accordionProps = {
    type: "single",
    collapsible: true,
    variant: "card",
    size,
    ...props,
  } as AccordionProps
  return <Accordion className={slots.list({ className })} {...accordionProps} />
}

export interface FaqsItemProps
  extends Omit<React.ComponentProps<typeof AccordionItem>, "value"> {
  /** The question shown in the trigger row. */
  question: React.ReactNode
  /**
   * The Radix item value (must be unique within the list). Optional: a stable auto-id is
   * generated when omitted. Pass an explicit value when you want to target it with the
   * list's `defaultValue`/`value`.
   */
  value?: string
  /**
   * Append a "Helpful / Not helpful" feedback row beneath the answer (the knowledge-base /
   * help-center pattern). Pass `true` for the defaults, or a `FaqsFeedback` props object to
   * customize labels / wire `onVote`. For full control, drop a `<FaqsFeedback>` into
   * `children` instead. @default false
   */
  feedback?: boolean | FaqsFeedbackProps
}

/**
 * One question/answer pair: collapses the Accordion item/trigger/content trio into a single
 * call. The answer is the `children` (plain prose, inline `<code>`, links - whatever).
 */
export function FaqsItem({ question, value, feedback, children, ...props }: FaqsItemProps) {
  // useId gives every item a stable, SSR-safe value without making callers hand-author one.
  const autoValue = React.useId()
  return (
    <AccordionItem value={value ?? autoValue} {...props}>
      <AccordionTrigger>{question}</AccordionTrigger>
      {/* Named group so a `feedback={{ reveal: "hover" }}` row has a hover target without the
          caller wiring one up. Inert for the default `always`. */}
      <AccordionContent className="group/faq-answer">
        {children}
        {feedback ? <FaqsFeedback {...(feedback === true ? {} : feedback)} /> : null}
      </AccordionContent>
    </AccordionItem>
  )
}

/**
 * The voting row's own recipe. Single-part, and deliberately not a slot on `faqsVariants`:
 * `FaqsFeedback` never reads the Faqs context, so it still works dropped anywhere on its own.
 *
 * `reveal="hover"` is for the always-open reading model (faq-section-7), where every answer is
 * visible at once and a permanent vote row under each one turns the page into a wall of pills.
 * It opens with the row instead. Three rules keep that from costing anyone the control:
 *   - The space is NOT reserved: it opens as the row appears, so there is no empty gap sitting
 *     under every answer. Only the hovered row grows, and it grows downward from inside itself,
 *     so the pointer stays where it was.
 *   - It opens on `focus-within` too, so tabbing to it works, and while collapsed the row is
 *     clipped to nothing, so it is unclickable without being pulled out of the tab order.
 *   - Touch has no hover at all, so `(hover: none)` opts back out entirely rather than leaving
 *     the vote unreachable on a phone.
 * Once a vote is cast the row is pinned open via `data-voted`, or the acknowledgement would
 * vanish mid-read the moment the pointer left.
 *
 * Needs an ancestor marked `group/faq-answer` as the hover target; `FaqsItem` adds one for you.
 */
export const faqsFeedbackVariants = tv({
  slots: {
    // Only `hover` uses this wrapper; `always` renders the row alone, so its DOM and the class
    // its `className` lands on are exactly what they were before the axis existed.
    root: "",
    clip: "",
    row: "flex flex-wrap items-center gap-x-3 gap-y-2",
  },
  variants: {
    reveal: {
      always: { row: "mt-5" },
      hover: {
        // The 0fr→1fr grid track is what makes the space APPEAR with the row instead of being
        // reserved under every answer: collapsed, the track is zero-height and the `mt-5` inside
        // it collapses with it, so there is no gap to see. `height: auto` cannot be transitioned;
        // a fractional track can, and unlike a `max-height` guess it lands on the true height
        // however the pills wrap.
        root: [
          "-mx-1 grid grid-rows-[0fr] opacity-0",
          "transition-[grid-template-rows,opacity] duration-base ease-out motion-reduce:transition-none",
          "group-hover/faq-answer:grid-rows-[1fr] group-hover/faq-answer:opacity-100",
          "group-focus-within/faq-answer:grid-rows-[1fr] group-focus-within/faq-answer:opacity-100",
          "data-[voted=true]:grid-rows-[1fr] data-[voted=true]:opacity-100",
          "[@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100",
        ],
        // Collapsed the row is clipped to nothing, so it is unclickable without needing
        // `pointer-events-none`. Tab still reaches it (overflow clipping, unlike `hidden`, keeps
        // content focusable) and `focus-within` above opens the track around it.
        clip: "min-h-0 overflow-hidden",
        // The clip would otherwise slice a focus ring off the pills. `-mx-1` on the wrapper opens
        // 4px of room inside it on each side and this `px-1` puts the pills back where they were;
        // `pb-1` does the same below. Vertically above, the `mt-5` is already room enough.
        row: "mt-5 px-1 pb-1",
      },
    },
  },
  defaultVariants: {
    reveal: "always",
  },
})

export interface FaqsFeedbackProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    VariantProps<typeof faqsFeedbackVariants> {
  /** Optional lede before the buttons, e.g. "Was this helpful?". Omitted by default. */
  label?: React.ReactNode
  /** Label for the positive button. @default "Helpful" */
  helpfulLabel?: React.ReactNode
  /** Label for the negative button. @default "Not helpful" */
  notHelpfulLabel?: React.ReactNode
  /**
   * Message shown once a vote is cast. Pass `null` to suppress it.
   * @default "Thanks for your feedback."
   */
  acknowledgement?: React.ReactNode
  /** Called with the chosen vote when the reader rates the answer. */
  onVote?: (vote: "up" | "down") => void
}

/**
 * The "was this answer helpful?" voting row. A single-select `ToggleGroup` of two pills
 * (thumb up / down): the chosen pill holds the DS selected look (brand outline + halo, no
 * fill) and an acknowledgement fades in beside it. Built entirely from the canonical
 * ToggleGroup, so the pressed state, roving focus, and a11y come for free, no custom styling.
 * Drop it inside a `FaqsItem`'s answer (or let `FaqsItem feedback` mount one for you), and
 * wire `onVote` to forward the rating to analytics / your help-center backend.
 */
export function FaqsFeedback({
  className,
  label,
  helpfulLabel = "Helpful",
  notHelpfulLabel = "Not helpful",
  acknowledgement = "Thanks for your feedback.",
  reveal,
  onVote,
  ...props
}: FaqsFeedbackProps) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null)
  // Named handler (not an inline arrow) keeps the set-state out of render. Radix single-select
  // hands back "" when the reader clears their pick; only a real up/down counts as a vote.
  function handleChange(next: string) {
    const value = next === "up" || next === "down" ? next : null
    setVote(value)
    if (value) onVote?.(value)
  }
  const slots = faqsFeedbackVariants({ reveal })
  const row = (
    <>
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <ToggleGroup
        type="single"
        size="sm"
        value={vote ?? ""}
        onValueChange={handleChange}
        aria-label="Was this answer helpful?"
      >
        {/* The verdict is carried by the glyph, in the semantic success/destructive roles, so the
            pair reads before either label does. Set on the icon rather than the pill: a filled
            green/red button would read as a state the reader is already in, not a choice, and the
            pressed look stays the DS's one selected treatment. The explicit colour also survives
            ToggleGroupItem's `data-[state=on]:text-foreground`, which only sets inherited colour. */}
        <ToggleGroupItem value="up">
          <ThumbsUp weight="bold" className="text-success-strong" />
          {helpfulLabel}
        </ToggleGroupItem>
        <ToggleGroupItem value="down">
          <ThumbsDown weight="bold" className="text-destructive-strong" />
          {notHelpfulLabel}
        </ToggleGroupItem>
      </ToggleGroup>
      {vote && acknowledgement ? (
        <span
          role="status"
          className="text-sm text-muted-foreground animate-in fade-in slide-in-from-left-1 duration-base ease-out"
        >
          {acknowledgement}
        </span>
      ) : null}
    </>
  )

  // `always` keeps the original single-node shape, so `className` still lands on the flex row and
  // nothing that already uses it shifts. `hover` needs the collapsing track and its clip.
  if (reveal !== "hover") {
    return (
      <div data-slot="faqs-feedback" className={slots.row({ className })} {...props}>
        {row}
      </div>
    )
  }

  return (
    <div
      data-slot="faqs-feedback"
      // Pins the row open once it has been used, so the acknowledgement survives the pointer
      // leaving instead of collapsing away mid-read.
      data-voted={vote ? "true" : undefined}
      className={slots.root({ className })}
      {...props}
    >
      <div className={slots.clip()}>
        <div className={slots.row()}>{row}</div>
      </div>
    </div>
  )
}

/** Optional closing CTA, e.g. "Still have questions? <Button>Contact us</Button>". */
export interface FaqsFooterProps extends React.ComponentProps<"div"> {
  /**
   * Control height for the block. The closing "still have questions?" action sits on a marketing page, not in an app bar. Imposed on the children (see lib/density.tsx) so each
   * control need not carry a `size`; an explicit one still wins. @default "md"
   */
  size?: ControlSize
}

export function FaqsFooter({ className, size = "md", children, ...props }: FaqsFooterProps) {
  const { slots } = useFaqsContext("FaqsFooter")
  return (
    <div
      data-slot="faqs-footer"
      data-control-size={size}
      className={slots.footer({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}
