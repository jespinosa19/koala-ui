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
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

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
    description: "mt-4 text-base text-pretty text-muted-foreground sm:text-lg",
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
  },
  defaultVariants: {
    layout: "stacked",
  },
})

type FaqsSlots = ReturnType<typeof faqsVariants>
const [FaqsProvider, useFaqsContext] = createContext<{ slots: FaqsSlots }>("Faqs")

export interface FaqsProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof faqsVariants> {}

/**
 * The section container. Parts are exported individually (not `Faqs.Item` dot-notation):
 * namespaced statics don't survive the RSC server→client boundary. Compose as
 * `<Faqs><FaqsHeader>…</FaqsHeader><FaqsList><FaqsItem>…</FaqsItem></FaqsList></Faqs>`.
 */
export function Faqs({ className, layout, ...props }: FaqsProps) {
  const slots = faqsVariants({ layout })
  return (
    <FaqsProvider slots={slots}>
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
  const { slots } = useFaqsContext("FaqsList")
  // The cast resolves Radix's single/multiple discriminated union once, at this boundary,
  // so the defaults stay overridable without each prop fighting the union narrowing.
  const accordionProps = {
    type: "single",
    collapsible: true,
    variant: "card",
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
      <AccordionContent>
        {children}
        {feedback ? <FaqsFeedback {...(feedback === true ? {} : feedback)} /> : null}
      </AccordionContent>
    </AccordionItem>
  )
}

export interface FaqsFeedbackProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
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
  return (
    <div
      data-slot="faqs-feedback"
      className={cn("mt-5 flex flex-wrap items-center gap-x-3 gap-y-2", className)}
      {...props}
    >
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <ToggleGroup
        type="single"
        size="sm"
        value={vote ?? ""}
        onValueChange={handleChange}
        aria-label="Was this answer helpful?"
      >
        <ToggleGroupItem value="up">
          <ThumbsUp weight="bold" />
          {helpfulLabel}
        </ToggleGroupItem>
        <ToggleGroupItem value="down">
          <ThumbsDown weight="bold" />
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
    </div>
  )
}

/** Optional closing CTA, e.g. "Still have questions? <Button>Contact us</Button>". */
export function FaqsFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFaqsContext("FaqsFooter")
  return <div data-slot="faqs-footer" className={slots.footer({ className })} {...props} />
}
