"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * ActivityFeed: a vertical timeline of activity events: comments, mentions, status
 * changes, uploads, reactions, members joining… Built like Card/Ranking/FileCard, one
 * `tv` recipe with `slots`, shared state (density + whether the connecting rail shows)
 * flowing to every part through React Context, never prop-drilled or cloned. Compose the
 * named parts; an event is as small as an actor + a line of text, or as rich as a quoted
 * comment card with image and file attachments. See docs/ARCHITECTURE.md §2.
 *
 * The connecting rail is pure layout, no JS: each item's marker column `self-stretch`es to
 * the item height and an `ActivityConnector` (a `flex-1` hairline) fills the space below the
 * marker, then a negative bottom margin carries it across the gap to the next marker. The feed
 * root hides the connector on its last `<li>`, so the rail stops cleanly at the final event.
 *
 * An event's vertical rhythm is its OWN symmetric padding plus the list's gap, never a trailing
 * padding on the content. That is what lets an interactive row's hover fill centre on its text
 * instead of hanging below it, and it keeps the first and last events padded like every other.
 *
 * EVERY PART IS DROPPABLE (ARCHITECTURE.md §3). There is no `showTime`/`showBody` prop: you
 * compose the parts you want. That only holds if no part inherits spacing from a sibling that
 * might not exist, so `ActivityBody`/`ActivityCard`/`ActivityAttachments` each reset their
 * leading margin with `first:` and take over the marker alignment when they lead the content.
 */
export const activityFeedVariants = tv({
  slots: {
    // The timeline is a semantic ordered list (most-recent first reads top-down). The gap is
    // part of the rhythm: each event carries its own symmetric padding and the list adds the
    // rest between them (see `item` below). The child selector closes the rail on the final
    // event, and is inert when the rail is off: nothing renders to hide.
    root: [
      "flex flex-col gap-1",
      // Density and `divided` both retune this gap, so ease it: same call DataTable makes for its
      // own density padding. Interruptible, so toggling fast reverses cleanly (#4).
      "transition-[row-gap] duration-base ease-out motion-reduce:transition-none",
      "[&>li:last-child_[data-slot=activity-connector]]:hidden",
    ],
    // The outer <li>: carries the divider and the list position only. The row layout lives on
    // `item` so an interactive event can move it onto an inner <a>/<button> (valid <li><a>).
    row: "relative",
    // align-items: stretch (the flex default) is load-bearing: it lets the marker column
    // grow to the full item height so the connector can reach the next marker.
    //
    // The event's vertical rhythm is SYMMETRIC padding here, not a trailing padding on the
    // content. That's what lets an interactive row's hover fill centre on its text: paint the
    // fill on a box whose spacing all hangs below the text and the text rides 10px high in it.
    // The padding and gap are the two things density moves here, so they ease rather than snap.
    item: "flex transition-[padding,column-gap] duration-base ease-out motion-reduce:transition-none",
    // The marker column is a FIXED-WIDTH rail anchor (w-8 = the largest marker, an Avatar sm), so
    // the connector sits at the same x for every event regardless of what the marker holds.
    // `self-stretch` makes it as tall as the content; the head + connector stack vertically in it.
    marker: "relative flex w-8 shrink-0 flex-col items-center self-stretch",
    // The head is a FIXED-HEIGHT box (h-8) that vertically centers the marker, so a 28px icon
    // tile, a 32px round Avatar, and a dot all share one optical center, and that center lines up
    // with the header's first line (same min-height). This is what keeps a single-line event's
    // marker and text aligned.
    markerHead: "flex h-8 items-center justify-center",
    // The tinted/avatar tile. Concentric, circular by default so a status glyph and a round Avatar
    // share the same silhouette. Small glyph (size-3.5): the tint ring carries the category, the
    // glyph is secondary.
    icon: "grid shrink-0 place-items-center rounded-full border [&>svg]:size-3.5",
    // A low-emphasis marker for minor events: a small dot centered in the head's footprint.
    dot: "grid shrink-0 place-items-center",
    dotInner: "size-2 rounded-full ring-4 ring-background",
    // The rail: a hairline that grows to fill the column below the head. `mt-1` keeps a small,
    // consistent gap between the marker and the line. Runtime-free.
    //
    // The marker column only stretches to the item's CONTENT box, so on its own the line would
    // stop short of the next marker by the item's bottom padding + the list gap + the next
    // item's top padding. A negative bottom margin (set per density below) bridges exactly
    // that: in flex layout the outer size includes margins, so a `-mb` on a `flex-1` child
    // lets it grow by that amount and overflow, landing on the next marker head's top edge.
    connector: "mt-1 w-px flex-1 bg-border transition-[margin] duration-base ease-out motion-reduce:transition-none",
    // The event body. min-w-0 lets long text/attachments wrap instead of blowing out the row.
    // No padding of its own: the rhythm belongs to `item`, so the row's fill can wrap the text.
    content: "flex min-w-0 flex-1 flex-col",
    // The lead line: actor + action + timestamp. `min-h-8` matches the marker head so a single
    // line of text centers against the marker; it wraps gracefully on narrow widths.
    header: "flex min-h-8 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug text-muted-foreground",
    actor: "font-medium text-foreground",
    // tabular-nums so a live "2m ago → 3m ago" tick never reflows the line.
    time: "text-xs tabular-nums text-muted-foreground",
    // A muted prose block for descriptions / one-liners under the header. Drop the header and
    // this leads instead: `first:mt-0` kills the gap meant for a sibling above, and `first:pt-1.5`
    // puts the first line's optical center back on the marker head's 16px axis.
    body: "mt-1 text-pretty text-sm text-muted-foreground first:mt-0 first:pt-1.5",
    // A nested surface for quoted content (a comment, a review). Concentric radius: the feed
    // usually sits inside a rounded-xl Card, so the quote steps down to lg. Its own py already
    // sits the first line near the marker axis, so leading it only needs the margin reset. The
    // edge is a full-strength `--border` ring (no lift to help it), not a border: it takes no layout.
    card: "mt-2 rounded-lg bg-muted/40 px-3 py-2.5 text-sm text-foreground ring-1 ring-border first:mt-0",
    // Attachments stack vertically: drop FileCard rows in for files (don't re-roll the chip), and
    // an ActivityImage gallery row for images. `mt-1.5` since it follows the header's own padding.
    attachments: "mt-1.5 flex flex-col gap-2 first:mt-0 first:pt-1.5",
    // A small image thumbnail for galleries. The ::after ring is the "image outline" polish: pure
    // black/white at low alpha so the edge reads on any surface without looking like a tinted border.
    // It rides OVER the photo: a ring on the tile itself is an inset box-shadow, which paints under
    // the filling <img> and never shows (memory `inset-ring-under-children`).
    image:
      "relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted [&>img]:size-full [&>img]:object-cover after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
    // Trailing controls (a menu, a reply button). `min-h-8` + `self-start` park them on the same
    // 16px axis as the marker head, so they ride the event's first line and never stretch.
    actions: "flex min-h-8 shrink-0 items-center gap-1 self-start",
    // The unread indicator rides the far end of the row on that same axis.
    indicator: "flex min-h-8 shrink-0 items-center self-start",
    indicatorDot: "size-2 rounded-full bg-brand",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For the feed it
    // tunes the gap to the rail and the per-event rhythm. `comfortable` is the default
    // marketing/inbox spacing; `compact` tightens it for dense app timelines. Marker footprint
    // stays fixed so the rail aligns identically at both densities.
    //
    // The three numbers per density are one budget and move together: the connector's `-mb`
    // must equal item.pb + root.gap + item.pt, or the rail breaks. Comfortable spends
    // 8 + 4 + 8 = 20px between one event's text and the next; compact spends 6 + 4 + 6 = 16px.
    density: {
      comfortable: {
        item: "gap-3 py-2",
        connector: "-mb-5",
        icon: "size-7",
        dot: "size-7",
      },
      compact: {
        item: "gap-2.5 py-1.5",
        connector: "-mb-4",
        icon: "size-7",
        dot: "size-7",
      },
    },
    // Hairline rule between events instead of the vertical rail: the audit-log / notification-
    // inbox reading. The list gap goes to zero so the rule lands flush between two events and
    // their symmetric padding sits evenly on either side of it.
    //
    // A LINE OF ITS OWN, not a `border-b`. An interactive row is rounded, and in the plain (not
    // `asChild`) shape `row` and `item` land on the SAME <li>, so a bottom border would inherit
    // that radius and curve up at both ends. A pseudo-element is a separate box with no radius,
    // so it stays straight whatever the row does. (An inset box-shadow would follow the radius
    // too, so it is no alternative.) `::after` generates as the last child, so the rule still
    // paints above the hover fill exactly as the border did. `last:` is safe here because `row`
    // is always the <li> in both shapes, unlike `item`.
    divided: {
      true: {
        root: "gap-0",
        row: "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-[''] last:after:hidden",
      },
    },
    // Set per event on {@link ActivityItem}. Not structure, state: the event is new to this
    // reader. Full-strength header text plus a brand dot; deliberately NO row fill, since a
    // timeline is chrome-less and a tinted band would read as a container.
    unread: {
      true: {
        item: "[&_[data-slot=activity-header]]:font-medium [&_[data-slot=activity-header]]:text-foreground",
      },
    },
    // Set per event on {@link ActivityItem} when the whole row is a link/button.
    interactive: {
      true: {
        // No press scale (the CLAUDE.md default): a feed row sits flush against the text column,
        // so shrinking it detaches the hover fill from that column and the row reads as a floating
        // tile. Press feedback is the fill deepening instead, the same call List makes for flush
        // rows. The negative margin turns the fill into a pill that breathes past the text without
        // moving it: -mx-2 and px-2 cancel, so an interactive row's marker still lines up with an
        // inert one's. Specific transition, never `all`.
        item: "-mx-2 cursor-pointer rounded-lg px-2 transition-colors duration-fast ease-out hover:bg-muted/60 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      },
    },
  },
  compoundVariants: [
    // A rule needs air on both sides, so a divided event spends its whole budget on its own
    // padding (16/16 comfortable, 14/14 compact) instead of splitting it with the list gap.
    // Same totals between texts as the rail layout would give: 32px and 28px.
    { divided: true, density: "comfortable", class: { item: "py-4" } },
    { divided: true, density: "compact", class: { item: "py-3.5" } },
  ],
  defaultVariants: {
    density: "comfortable",
  },
})

type ActivityFeedSlots = ReturnType<typeof activityFeedVariants>
type ActivityFeedConfig = {
  density: NonNullable<VariantProps<typeof activityFeedVariants>["density"]>
  divided: boolean
}

const [ActivityFeedProvider, useActivityFeedContext] = createContext<{
  slots: ActivityFeedSlots
  config: ActivityFeedConfig
  connector: boolean
}>("ActivityFeed")

/* ----------------------------------------------------------------------- tones --- */

/** The soft color a marker carries: pick one that matches the kind of event. */
export type ActivityTone =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "purple"
  | "pink"
  | "teal"
  | "orange"

/** Soft tile tint per tone, following the Badge pattern (`border-<role>/20 bg-<role>/10
 *  text-<role>`) so every tone re-themes across all four palettes. */
const ICON_TONES: Record<ActivityTone, string> = {
  default: "border-transparent bg-muted text-muted-foreground",
  brand: "border-brand/20 bg-brand/10 text-brand",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  info: "border-info/20 bg-info/10 text-info",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
  purple: "border-purple/20 bg-purple/10 text-purple",
  pink: "border-pink/20 bg-pink/10 text-pink",
  teal: "border-teal/20 bg-teal/10 text-teal",
  orange: "border-orange/20 bg-orange/10 text-orange",
}

/** Solid dot fill per tone for the low-emphasis `ActivityDot` marker. */
const DOT_TONES: Record<ActivityTone, string> = {
  default: "bg-border",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  purple: "bg-purple",
  pink: "bg-pink",
  teal: "bg-teal",
  orange: "bg-orange",
}

/* ------------------------------------------------------------------------ parts --- */

export interface ActivityFeedProps
  extends React.ComponentProps<"ol">,
    Omit<VariantProps<typeof activityFeedVariants>, "interactive" | "unread"> {
  /**
   * Draw the vertical rail connecting markers. @default true
   *
   * Ignored when the feed is `divided`: a rule and a rail are two answers to the same question,
   * and drawing both reads as a mistake, so `divided` always wins.
   */
  connector?: boolean
}

/**
 * Parts are exported individually (not `ActivityFeed.Item` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do. Compose as
 * `<ActivityFeed><ActivityItem><ActivityMarker>…</ActivityMarker><ActivityContent>…`.
 */
export function ActivityFeed({
  className,
  density,
  divided = false,
  connector,
  ...props
}: ActivityFeedProps) {
  // The resolved config rides context so each ActivityItem can recompute its own row classes
  // with its per-event `interactive`/`unread` flags.
  const config: ActivityFeedConfig = { density: useDensity(density), divided }
  const slots = activityFeedVariants(config)
  // A divided feed never draws the rail. The two say the same thing, so letting a consumer ask
  // for both would only ever produce a mistake; the component settles it instead of offering it.
  const showConnector = divided ? false : (connector ?? true)
  return (
    <ActivityFeedProvider slots={slots} config={config} connector={showConnector}>
      <ol data-slot="activity-feed" className={slots.root({ className })} {...props} />
    </ActivityFeedProvider>
  )
}

export interface ActivityItemProps extends React.ComponentProps<"li"> {
  /**
   * Render the event's row as the single child element (e.g. an `<a>`) while keeping the
   * `<li>` wrapper, so a link event is valid `<li><a>…</a></li>` and the divider stays on the
   * list item. Implies `interactive`.
   */
  asChild?: boolean
  /** Add hover/press/focus affordance. Defaults to `true` when `asChild` is set. */
  interactive?: boolean
  /** Mark the event as new to this reader: a brand dot and full-strength header text. */
  unread?: boolean
}

/**
 * ActivityItem: one event. By default a plain `<li>` carrying the row layout. Pass `asChild`
 * with an `<a>`/`<button>` child to make the whole event a link: the `<li>` stays as the list
 * item (and keeps the divider) while the child becomes the interactive, hover-lit surface.
 *
 * Don't pair `asChild` with {@link ActivityActions}: that nests a control inside a link. Use
 * `interactive` with an `onClick` on the row instead, so the action stays its own hit target.
 */
export function ActivityItem({
  className,
  asChild = false,
  interactive,
  unread = false,
  children,
  ...props
}: ActivityItemProps) {
  const { config } = useActivityFeedContext("ActivityItem")
  const isInteractive = interactive ?? asChild
  const slots = activityFeedVariants({ ...config, interactive: isInteractive, unread })

  // Rendered last so it lands at the far end of the row, after any ActivityActions, without
  // either part having to know about the other.
  const indicator = unread ? (
    <span data-slot="activity-unread" className={slots.indicator()}>
      <span aria-hidden className={slots.indicatorDot()} />
      <span className="sr-only">Unread</span>
    </span>
  ) : null

  // asChild: the <li> keeps the divider and list semantics; the child element owns the row
  // layout + interaction. Slottable lets the indicator ride inside that child.
  if (asChild) {
    return (
      <li data-slot="activity-item" className={slots.row()}>
        <Slot.Root className={slots.item({ className })} {...props}>
          <Slot.Slottable>{children}</Slot.Slottable>
          {indicator}
        </Slot.Root>
      </li>
    )
  }

  return (
    <li
      data-slot="activity-item"
      className={cn(slots.row(), slots.item({ className }))}
      {...props}
    >
      {children}
      {indicator}
    </li>
  )
}

/**
 * ActivityMarker: the rail column. Drop an {@link ActivityIcon}, {@link ActivityDot}, or an
 * `Avatar` inside as the visual; the connecting rail is appended automatically (and hidden on
 * the feed's last item, or whenever the feed's `connector` is `false`).
 */
export function ActivityMarker({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots, connector } = useActivityFeedContext("ActivityMarker")
  return (
    <div data-slot="activity-marker" className={slots.marker({ className })} {...props}>
      {/* Fixed-height head vertically centers whatever marker is dropped in, so its center lines
          up with the header's first line and with every other event's marker. */}
      <div data-slot="activity-marker-head" className={slots.markerHead()}>
        {children}
      </div>
      {connector && (
        <span data-slot="activity-connector" aria-hidden className={slots.connector()} />
      )}
    </div>
  )
}

export interface ActivityIconProps extends React.ComponentProps<"div"> {
  /** Soft tint matching the event kind. @default "default" */
  tone?: ActivityTone
}

/**
 * ActivityIcon: the tinted tile marker. Pass a Phosphor glyph as `children` and a `tone`
 * that matches the event (e.g. `info` for a comment, `teal` for an upload, `destructive` for
 * a deletion). A 28px tile centered in the marker head, so it aligns with avatar and dot markers.
 */
export function ActivityIcon({ tone = "default", className, ...props }: ActivityIconProps) {
  const { slots } = useActivityFeedContext("ActivityIcon")
  return (
    <div
      data-slot="activity-icon"
      aria-hidden
      className={slots.icon({ className: cn(ICON_TONES[tone], className) })}
      {...props}
    />
  )
}

export interface ActivityDotProps extends React.ComponentProps<"div"> {
  /** Solid dot color. @default "default" */
  tone?: ActivityTone
}

/**
 * ActivityDot: a low-emphasis marker for minor events (a field edit, a view). The dot is
 * centered in the same head footprint as {@link ActivityIcon}, so swapping between them keeps
 * the rail perfectly aligned. A background-colored ring lifts it off the rail behind it.
 */
export function ActivityDot({ tone = "default", className, ...props }: ActivityDotProps) {
  const { slots } = useActivityFeedContext("ActivityDot")
  return (
    <div data-slot="activity-dot" aria-hidden className={slots.dot({ className })} {...props}>
      <span className={cn(slots.dotInner(), DOT_TONES[tone])} />
    </div>
  )
}

export function ActivityContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityContent")
  return <div data-slot="activity-content" className={slots.content({ className })} {...props} />
}

export function ActivityHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityHeader")
  return <div data-slot="activity-header" className={slots.header({ className })} {...props} />
}

export interface ActivityActorProps extends React.ComponentProps<"span"> {
  /** Render the actor as a child element (e.g. a profile link) via Radix Slot. */
  asChild?: boolean
}

/** ActivityActor: the person/thing that acted. `asChild` to make it a profile link. */
export function ActivityActor({ className, asChild = false, ...props }: ActivityActorProps) {
  const { slots } = useActivityFeedContext("ActivityActor")
  const Comp = asChild ? Slot.Root : "span"
  return <Comp data-slot="activity-actor" className={slots.actor({ className })} {...props} />
}

export type ActivityTimeProps = React.ComponentProps<"time">

/**
 * ActivityTime: the muted, tabular timestamp. Pass `dateTime` (an ISO string) for the machine
 * value and a friendly relative label as children ("2h ago"). Renders a real `<time>` element.
 */
export function ActivityTime({ className, ...props }: ActivityTimeProps) {
  const { slots } = useActivityFeedContext("ActivityTime")
  return <time data-slot="activity-time" className={slots.time({ className })} {...props} />
}

export function ActivityBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityBody")
  return <div data-slot="activity-body" className={slots.body({ className })} {...props} />
}

/**
 * ActivityCard: a nested surface for quoted content: a posted comment, a review, a changelog
 * note. Steps the radius down concentrically from the Card the feed usually lives in.
 */
export function ActivityCard({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityCard")
  return <div data-slot="activity-card" className={slots.card({ className })} {...props} />
}

/**
 * ActivityAttachments: a vertical stack for an event's payload. Drop {@link FileCard} rows in
 * for files (reuse the canonical component, don't re-roll a chip), and an {@link ActivityImage}
 * gallery row for images. `FileCard` already ships the type-tinted icon, name, and meta in a
 * compact density, so a feed stays consistent with the rest of the file UI.
 */
export function ActivityAttachments({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityAttachments")
  return (
    <div data-slot="activity-attachments" className={slots.attachments({ className })} {...props} />
  )
}

export interface ActivityImageProps extends React.ComponentProps<"img"> {
  alt: string
}

/**
 * ActivityImage: a small image attachment thumbnail, clipped to the concentric radius with the
 * house image-outline ring. Lay several out in a `flex flex-wrap gap-2` row for a gallery. Sized
 * 56px by default; override with `className`. Always give a meaningful `alt`.
 */
export function ActivityImage({ className, alt, ...props }: ActivityImageProps) {
  const { slots } = useActivityFeedContext("ActivityImage")
  return (
    <div data-slot="activity-image" className={slots.image({ className })}>
      {/* Native img: feed attachments are commonly remote/object URLs next/image can't optimize. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} {...props} />
    </div>
  )
}

/**
 * ActivityActions: trailing controls for one event, a sibling of {@link ActivityContent} (not a
 * child of {@link ActivityHeader}, which wraps: an `ml-auto` there jumps lines on narrow widths).
 * Drop an icon `Button`, a `DropdownMenu` trigger, or a "Reply" in it. Parks on the marker head's
 * axis so it rides the event's first line however tall the event grows.
 */
export function ActivityActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useActivityFeedContext("ActivityActions")
  return <div data-slot="activity-actions" className={slots.actions({ className })} {...props} />
}
