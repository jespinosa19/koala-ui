"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import * as Flags from "country-flag-icons/react/3x2"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * JobCard: the canonical open-role block. One row of a careers board: an optional category
 * or "New" Badge, the role title, a one-line summary, a meta row (location / employment type
 * / salary band), and an optional trailing action (an Apply button, or the hiring team's
 * AvatarGroup). A multi-part component built like Card/List/Stat: one `tv` recipe with
 * `slots`, shared config flowing to every part through React Context (never prop-drilled or
 * cloned). See docs/ARCHITECTURE.md §2.
 *
 * Distinct from its neighbours: `List` is the compact settings/member row (text-sm, a
 * truncating title, meta pinned right on the SAME line); JobCard is a marketing-scale block
 * whose meta is a THIRD tier under the summary and is allowed to wrap. `Card` is the generic
 * surface with no opinion about its contents.
 *
 * Every part is optional and composed, never gated by a `showX` prop: a role with no summary
 * simply omits `JobCardDescription`, and a board with no apply button omits `JobCardAction`.
 */
export const jobCardVariants = tv({
  slots: {
    // `relative` anchors the divider a careers list paints as a pseudo-element on this row.
    root: "relative flex w-full gap-x-6 gap-y-4 text-left",
    // min-w-0 lets a long title wrap instead of pushing the action off the row.
    content: "flex min-w-0 flex-1 flex-col items-start gap-2",
    title: "text-lg font-medium text-pretty text-foreground",
    description: "text-pretty text-muted-foreground",
    // The meta tier. Wraps rather than truncating: a salary band is not something to cut off.
    // `mt-1` on top of the column's `gap-2`: this is the THIRD tier, and title→summary→meta at a
    // flat 8px reads as one undifferentiated block. 12px here is what makes it a tier.
    meta: "mt-1 flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground",
    // 20px leading glyph: the size a text-label row wants, not the 16px a button wants.
    metaItem: "inline-flex min-w-0 items-center gap-1.5 [&>svg]:size-5 [&>svg]:shrink-0",
    action: "flex shrink-0 items-center gap-2",
  },
  variants: {
    variant: {
      // The role gets a box of its own: the BOUNDARY and nothing else, drawn straight on the page
      // ground. No fill — a grid of filled panels reads as chrome competing with the roles, and on
      // the dark themes `--card` is light enough to turn every row into a grey slab.
      //
      // An inset RING, never a border: a 1px border sits outside the padding box and breaks the
      // concentric corner against the inner radius.
      //
      // Deliberately no `--surface` override either: an unfilled box introduces no new ground, so
      // anything nested (a Badge, a Button) must keep resolving the page's.
      card: {
        root: "rounded-xl p-5 ring-1 ring-inset ring-border",
      },
      // Chrome-less: the row sits flush on whatever holds the list, separated by a hairline.
      plain: {},
    },
    /**
     * Where the action sits relative to the content.
     * - `split`   the action rides the right edge, vertically centred (the default row).
     * - `stacked` the action drops below the content, left-aligned (a card with a footer CTA).
     * - `inline`  title and meta share ONE line, the table shape. The meta becomes equal-width
     *             auto columns so the same template repeats on every row and the columns line
     *             up down the whole board without needing a grid on the container.
     */
    layout: {
      // Every layout STARTS as a stacked column and only becomes a row at its breakpoint. A row
      // that never collapses strands its action in the corner of a 375px frame, and an action told
      // to go full-width there would be fighting a `shrink-0` flex sibling.
      split: { root: "flex-col items-stretch sm:flex-row sm:items-center sm:justify-between" },
      stacked: { root: "flex-col items-stretch" },
      inline: {
        root: "flex-col items-stretch md:flex-row md:items-center md:justify-between",
        content: "gap-2 md:flex-row md:items-center md:gap-6",
        // A FIXED first column, not a flexible one. Two `flex-1` siblings split the row 50/50
        // regardless of what is in them, which hands half the width to a two-word role title and
        // squeezes the three meta columns until the location and the salary both truncate. Pinning
        // the title is also what lines the role column up down the board.
        title: "md:w-56 md:shrink-0",
        // `md:mt-0` undoes the tier gap from the base slot: on one line there is no tier.
        meta: "md:mt-0 md:grid md:w-auto md:flex-1 md:auto-cols-fr md:grid-flow-col md:gap-6",
      },
    },
    /**
     * Hairline rule under the row: the board-of-roles identity, set when the list stacks
     * rows directly rather than spacing cards apart.
     *
     * A LINE OF ITS OWN, not a `border-b`. An interactive row is rounded, and a bottom border
     * inherits that radius and curves up at both ends. A pseudo-element is a separate box with
     * no radius, so it stays straight whatever the row does. (An inset box-shadow would follow
     * the radius too, so it is no alternative.)
     *
     * Carries the row's BAND as well as its rule. A list that stacks divided rows has no gap
     * between them by definition — the hairline is the separation — so the padding here is the
     * only thing giving a row height. Without it a 40px Apply button fills the row edge to edge
     * and lands flush on the hairline above and below.
     *
     * The trailing rule is dropped from the LAST LIST ITEM, `[*:last-child>&]`, never a bare
     * `last:`. List and ActivityFeed can say `last:` because they render the <li> themselves and
     * hang the divider on a `row` slot; JobCard does not — it also goes into card grids, scroll
     * rails and standalone previews, so it stays an ordinary element and the list that owns it
     * supplies the <li>. Inside that wrapper the card is ALWAYS its own parent's last child, so
     * `last:` matches on every row and silently hides the rule down the whole board. Keying off
     * the wrapper is what makes it paint. A divided row therefore belongs inside a list item,
     * which is what a board of roles has anyway.
     */
    divided: {
      true: {
        root: "py-5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-[''] [*:last-child>&]:after:hidden",
      },
    },
    /**
     * Set when the whole row is a link: pointer, a soft hover fill, a deeper press fill, and
     * an inset focus ring. No press SCALE: a row that shrinks pulls its fill away from the
     * edges it sits flush against and starts reading as a floating tile. Press feedback is
     * the fill deepening instead (the same call `List` makes).
     */
    interactive: {
      true: {
        root: "cursor-pointer transition-colors duration-fast ease-out hover:bg-muted/60 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      },
    },
  },
  compoundVariants: [
    // A plain interactive row pulls its hover fill back into a detached rounded panel so it
    // does not bleed to the container edge; the negative margin keeps the text flush-aligned.
    //
    // `py-4` restates the band: a hovered panel wants its fill to sit closer to the text than a
    // bare divided row's `py-5`, and this class lands after the `divided` variant's, so
    // tailwind-merge keeps it.
    { variant: "plain", interactive: true, class: { root: "-mx-4 rounded-xl px-4 py-4" } },
    // …but that negative margin also widened the box, so the divider would now overhang the
    // text by 4px at each end. Pull the rule back in by the same amount it grew.
    {
      variant: "plain",
      interactive: true,
      divided: true,
      class: { root: "after:inset-x-4" },
    },
  ],
  defaultVariants: {
    variant: "plain",
    layout: "split",
  },
})

type JobCardSlots = ReturnType<typeof jobCardVariants>

const [JobCardProvider, useJobCardContext] = createContext<{ slots: JobCardSlots }>("JobCard")

export interface JobCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof jobCardVariants> {
  /** Render the card as the single child element (e.g. an `<li>`, `<a>` or `<article>`). */
  asChild?: boolean
}

/**
 * Parts are exported individually (not `JobCard.Title` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do. Compose as
 * `<JobCard><JobCardContent>…`.
 */
export function JobCard({
  className,
  variant,
  layout,
  divided,
  interactive,
  asChild = false,
  ...props
}: JobCardProps) {
  const slots = jobCardVariants({ variant, layout, divided, interactive })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <JobCardProvider slots={slots}>
      <Comp data-slot="job-card" className={slots.root({ className })} {...props} />
    </JobCardProvider>
  )
}

/** The text column: the Badge, title, summary and meta tier. Flexes to fill. */
export function JobCardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useJobCardContext("JobCardContent")
  return <div data-slot="job-card-content" className={slots.content({ className })} {...props} />
}

/**
 * The role title. A `<div>` by default so the card can sit inside whatever heading level the
 * page already owns; pass `asChild` with an `<h3>`/`<a>` when the row needs to be one.
 */
export function JobCardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const { slots } = useJobCardContext("JobCardTitle")
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="job-card-title" className={slots.title({ className })} {...props} />
}

/** The muted one-line summary under the title. */
export function JobCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useJobCardContext("JobCardDescription")
  return (
    <p data-slot="job-card-description" className={slots.description({ className })} {...props} />
  )
}

/** The meta tier: wraps `JobCardMetaItem`s (location, employment type, salary). */
export function JobCardMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useJobCardContext("JobCardMeta")
  return <div data-slot="job-card-meta" className={slots.meta({ className })} {...props} />
}

export interface JobCardMetaItemProps extends React.ComponentProps<"span"> {
  /**
   * The leading glyph. A ReactNode rather than a component type so one item can pass a
   * Phosphor icon and the next a `JobCardFlag`, with no branching in the recipe.
   */
  icon?: React.ReactNode
}

/** One meta fact: a leading glyph and its label. */
export function JobCardMetaItem({ className, icon, children, ...props }: JobCardMetaItemProps) {
  const { slots } = useJobCardContext("JobCardMetaItem")
  return (
    <span data-slot="job-card-meta-item" className={slots.metaItem({ className })} {...props}>
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
}

export interface JobCardActionProps extends React.ComponentProps<"div"> {
  /** Control size imposed on the children. `lg` is 40px, the minimum comfortable hit area. */
  size?: ControlSize
}

/**
 * Trailing slot: an Apply `Button`, an `AvatarGroup` of the hiring team, a chevron.
 *
 * Imposes `lg` on the controls inside it, the way `SectionHeaderActions` does, so a board does not
 * have to repeat `size="lg"` on every row. It is the marketing default for a reason: `lg` is 40px,
 * which is the minimum comfortable touch target. A caller that wants a denser row still wins by
 * passing an explicit `size` on the Button itself.
 */
export function JobCardAction({ className, size = "lg", children, ...props }: JobCardActionProps) {
  const { slots } = useJobCardContext("JobCardAction")
  return (
    <div
      data-slot="job-card-action"
      data-control-size={size}
      className={slots.action({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}

// country-flag-icons exports one component per ISO2 code; index them by code, the same way
// CountrySelect and PhoneInput already do. It spreads extra props onto the <svg> but types them as
// HTMLAttributes, so name `preserveAspectRatio` here.
const FLAGS = Flags as unknown as Record<
  string,
  React.ComponentType<{ className?: string; preserveAspectRatio?: string }>
>

export interface JobCardFlagProps {
  /** ISO 3166-1 alpha-2 code, e.g. `US`. Matches the `iso2` field of the COUNTRIES dataset. */
  country: string
  className?: string
}

/**
 * Crops a 3:2 flag SVG into a circle: the SVG fills a square `overflow-hidden rounded-full`
 * wrapper and `preserveAspectRatio="xMidYMid slice"` cover-crops it, so the flag always reaches
 * the edge. The edge is an `after:` ring painted OVER the flag (black/white at 10%) so
 * mostly-white flags (Japan) still read against the surface. Sized to the 20px meta glyph.
 *
 * Decorative: the country is already spelled out in the label beside it.
 */
export function JobCardFlag({ country, className }: JobCardFlagProps) {
  const Flag = FLAGS[country.toUpperCase()]
  if (!Flag) return null
  return (
    <span
      className={cn(
        "relative inline-flex size-5 shrink-0 overflow-hidden rounded-full",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
        className,
      )}
      aria-hidden="true"
    >
      {/* size-full keeps a size- token, so the recipe's `[&>svg]:size-5` rule can't square it. */}
      <Flag className="size-full" preserveAspectRatio="xMidYMid slice" />
    </span>
  )
}
