"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * List: the canonical vertical list group: stacked rows, each with leading media
 * (icon/Avatar), a title + description, and trailing meta or actions. A multi-part
 * component built like Card/Stat: one `tv` recipe with `slots`, shared state flowing to
 * every part through React Context (never prop-drilled or cloned). Compose the named
 * parts (`ListItem`, `ListItemMedia`, `ListItemContent`, `ListItemTitle`,
 * `ListItemDescription`, `ListItemMeta`) into a settings list, member list, or menu.
 * See docs/ARCHITECTURE.md §2.
 *
 * Distinct from its Data Display cousins: DescriptionList is key/value, Data Table is
 * columnar, Tree is nested, Activity Feed is a timeline, Ranking is a leaderboard. List
 * is the plain "rows of content" primitive everything else specializes from.
 */
export const listVariants = tv({
  slots: {
    root: "text-sm",
    // The outer <li>: carries the divider only; the row layout lives on `item` so an
    // interactive row can move it onto an inner <a>/<button> (valid <li><a> nesting).
    // `relative` anchors the divider, which is a positioned pseudo-element (see `divided`).
    row: "relative",
    // The row surface: media left, content fills, meta rides the right edge. Carries the
    // per-row padding and gap directly (plain rows drop the horizontal padding below).
    item: "flex items-center gap-3 px-3 py-2.5",
    // Leading slot: holds a bare icon, an Avatar, or a small image. Bare svgs are sized
    // and toned here; an Avatar brings its own.
    media: "flex shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-5",
    // min-w-0 lets the title truncate instead of pushing the meta off the row.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    // How many lines the title and description take is the `lines` prop on each part (LINES
    // below), so neither slot carries `truncate` itself: the title's default of one line adds it.
    // `text-pretty` rides a zero-specificity `:where()` so it is only ever a default. The
    // `text-wrap` shorthand resets `text-wrap-mode`, so at full strength it beat a consumer's
    // `truncate` or `whitespace-nowrap` (both write `white-space`) and wrapped the line anyway.
    title: "font-medium text-foreground [:where(&)]:text-pretty",
    description: "text-xs text-muted-foreground [:where(&)]:text-pretty",
    // Trailing slot: badges, a timestamp, a chevron, or an action button.
    meta: "ml-auto flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground [&>svg]:size-4",
  },
  variants: {
    variant: {
      // A ring-edged contour that bands the rows together; overflow-hidden clips the flush rows
      // (and their hover fills) to the radius. The edge is an `--edge` ring plus the xs lift, not a
      // border: a box-shadow sits outside the clip, so the flush rows reach the true radius
      // (docs/FOUNDATIONS.md, "Shadows over borders"). No fill: fill is elevation, so the list
      // takes the ground it sits on.
      card: {
        root: "overflow-hidden rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
      },
      // Chrome-less: rows sit flush on whatever surface holds the list.
      plain: {},
    },
    // Hairline rule between rows: the list-group identity.
    //
    // A LINE OF ITS OWN, not a `border-b`. A row can be rounded (a consumer's `rounded-*`), and
    // in the non-`asChild` shape `row` and `item` land on the SAME <li>, so a bottom border would
    // inherit that radius and curve up at both ends. A pseudo-element is a separate box with no
    // radius, so it stays straight whatever the row does. (An inset box-shadow would follow the
    // radius too, so it is no alternative.) `::after` generates as the last child, so the rule
    // still paints above the hover fill exactly as the border did. `last:` is safe here because
    // `row` is always the <li> in both shapes, unlike `item`.
    divided: {
      true: {
        row: "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:content-[''] last:after:hidden",
      },
    },
    // Set per row on {@link ListItem} when the whole row is a link/button: pointer, a soft
    // hover fill, a deeper press fill, and an inset focus ring (inset so overflow-hidden
    // can't clip it). Plain rows stay inert.
    interactive: {
      true: {
        // No press scale: a row sits flush to the card edges, so shrinking it on press pulls
        // the fill off those edges and the row reads as a floating tile inside the card.
        // Press feedback is the fill deepening instead: hover lands on a half-strength wash,
        // active on the full one. Specific transition, never `all`.
        // `w-full text-left`: a <button> row is inline-block with centred text by default, so without
        // them it hugs its content and the meta stops short of the right edge.
        item: "w-full cursor-pointer text-left transition-colors duration-fast ease-out hover:bg-muted/60 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      },
    },
    // Set per row on {@link ListItem}: the row whose record the rest of the screen shows (the open
    // thread, the chapter being read). It must never read as a hover, so it answers on two channels
    // a hover never touches: the fill goes to full strength and STAYS there under the pointer (the
    // hover wash would otherwise lighten it), and a 3x16 brand bar sits on the row's leading edge,
    // the same mark the Sidebar's active row carries. `relative` anchors the bar on an asChild
    // <a>/<button>; the static <li> already is. Declared after `interactive` so its hover wins.
    current: {
      true: {
        item: "relative bg-muted hover:bg-muted before:pointer-events-none before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-brand before:content-['']",
      },
    },
    // Set by {@link ListItem} under `asChild`: the row surface is the <li>'s child, not the <li>
    // itself, so `row` and `item` are two boxes that can differ in width. No classes of its own.
    nested: {
      true: {},
    },
  },
  compoundVariants: [
    // Plain rows align flush to the container's left edge (no surface to inset from).
    { variant: "plain", class: { item: "px-0" } },
    // …but an interactive plain row gives its fill 8px of air around the text: negative margin
    // bleeds it out, padding brings the text back to the column. The width grows by the same
    // 1rem, or a <button> row (sized, not stretched) stops 8px short on the right.
    { variant: "plain", interactive: true, class: { item: "-mx-2 w-[calc(100%+1rem)] px-2" } },
    // What the fill looks like depends on whether rules bound it. With none, it is a detached
    // rounded pill, a menu row. Between rules it stays square and fills the band they draw: a
    // rounded fill would press its corners against two straight lines, a card jammed between
    // rules. Straight edges against straight edges, and the current row next to a hovered one
    // reads as two bands split by the rule rather than two pills colliding.
    // Pills keep 2px apart (the Sidebar's row gap), so the current row and a hovered neighbour
    // stay two shapes instead of fusing into one blob with notched corners.
    {
      variant: "plain",
      interactive: true,
      divided: false,
      class: { row: "not-last:mb-0.5", item: "rounded-lg" },
    },
    // …and the rule spans exactly that band. Without asChild the <li> IS the widened surface, so
    // its own line already does; under asChild the <li> stays on the text column while the <a>/
    // <button> inside bleeds, so the line bleeds with it.
    { variant: "plain", interactive: true, divided: true, nested: true, class: { row: "after:-inset-x-2" } },
  ],
  defaultVariants: {
    variant: "card",
    divided: true,
  },
})

type ListSlots = ReturnType<typeof listVariants>
type ListConfig = {
  variant: NonNullable<VariantProps<typeof listVariants>["variant"]>
  divided: boolean
}

const [ListProvider, useListContext] = createContext<{
  slots: ListSlots
  config: ListConfig
}>("List")

export interface ListProps
  extends React.ComponentProps<"ul">,
    Omit<VariantProps<typeof listVariants>, "interactive" | "current" | "nested"> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `List.Item` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do. Compose
 * as `<List><ListItem>…`.
 */
export function List({
  className,
  variant,
  divided,
  asChild = false,
  ...props
}: ListProps) {
  // The resolved config rides context so each ListItem can recompute its row class with
  // its own `interactive` flag.
  const config: ListConfig = {
    variant: variant ?? "card",
    divided: divided ?? true,
  }
  const slots = listVariants(config)
  const Comp = asChild ? Slot.Root : "ul"
  return (
    <ListProvider slots={slots} config={config}>
      <Comp data-slot="list" className={slots.root({ className })} {...props} />
    </ListProvider>
  )
}

export interface ListItemProps extends React.ComponentProps<"li"> {
  /**
   * Render the row's surface as the single child element (e.g. an `<a>` or `<button>`)
   * while keeping the `<li>` wrapper, so a link row is valid `<li><a>…</a></li>` and the
   * divider stays on the list item, not the link. Implies `interactive`.
   */
  asChild?: boolean
  /** Add hover/press/focus affordance. Defaults to `true` when `asChild` is set. */
  interactive?: boolean
  /**
   * Mark this row as the current one in its set: the open thread in an inbox, the chapter being
   * read. Paints a full-strength fill that a hover never lightens plus a brand bar on the leading
   * edge, and sets `aria-current` on the row surface (the `<a>`/`<button>` under `asChild`).
   * `true` announces `aria-current="true"`; pass a token (`"page"`, `"location"`…) when the row
   * is a navigation link. An explicit `aria-current` prop still wins.
   */
  current?: boolean | "page" | "step" | "location" | "date" | "time"
}

/**
 * ListItem: one row. By default a plain `<li>` carrying the row layout. Pass `asChild`
 * with an `<a>`/`<button>` child to make the whole row a link/button: the `<li>` stays as
 * the list item (and keeps the divider) while the child becomes the interactive,
 * hover-lit surface.
 */
export function ListItem({
  className,
  asChild = false,
  interactive,
  current,
  children,
  ...props
}: ListItemProps) {
  const { config } = useListContext("ListItem")
  const isInteractive = interactive ?? asChild
  const slots = listVariants({
    ...config,
    interactive: isInteractive,
    current: Boolean(current),
    nested: asChild,
  })
  // Written before `props` is spread, so a consumer's own `aria-current` keeps the last word.
  const ariaCurrent = current === true ? "true" : current || undefined

  // asChild: the <li> keeps only the divider; the child element owns the row layout +
  // interaction, giving valid <li><a>…</a></li>.
  if (asChild) {
    return (
      <li data-slot="list-item" className={slots.row()}>
        <Slot.Root aria-current={ariaCurrent} className={slots.item({ className })} {...props}>
          {children}
        </Slot.Root>
      </li>
    )
  }

  // Static row: the <li> carries both the divider and the row layout.
  return (
    <li
      data-slot="list-item"
      aria-current={ariaCurrent}
      className={cn(slots.row(), slots.item({ className }))}
      {...props}
    >
      {children}
    </li>
  )
}

/** Leading media: a bare icon, an Avatar, or a small image. */
export function ListItemMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemMedia")
  return <div data-slot="list-item-media" className={slots.media({ className })} {...props} />
}

/** Wraps the title + description; flexes to fill so the meta rides the right edge. */
export function ListItemContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemContent")
  return <div data-slot="list-item-content" className={slots.content({ className })} {...props} />
}

/** How many lines a title or description may take. */
export type ListItemLines = 1 | 2 | 3 | "none"

/**
 * A static map, never a computed `line-clamp-${n}`: the Tailwind compiler has to see the class.
 * `1` is `truncate` (one line cut with an ellipsis, what a list row has always done); 2 and 3
 * clamp at a word boundary; `"none"` lets the text wrap as long as it needs.
 */
const LINES: Record<ListItemLines, string> = {
  1: "truncate",
  2: "line-clamp-2",
  3: "line-clamp-3",
  none: "",
}

export interface ListItemTitleProps extends React.ComponentProps<"div"> {
  /**
   * How many lines the title may take before it ends in an ellipsis. One line keeps the meta on
   * the row; pass `2` or `3` to clamp there, or `"none"` for a title that wraps in full (a note, a
   * message). @default 1
   */
  lines?: ListItemLines
}

/** The primary line. One line by default, so a long title never pushes the meta off the row. */
export function ListItemTitle({ className, lines = 1, ...props }: ListItemTitleProps) {
  const { slots } = useListContext("ListItemTitle")
  return (
    <div
      data-slot="list-item-title"
      className={slots.title({ className: cn(LINES[lines], className) })}
      {...props}
    />
  )
}

export interface ListItemDescriptionProps extends React.ComponentProps<"div"> {
  /**
   * How many lines the description may take. It wraps in full by default; pass `1` to keep it on
   * one line with an ellipsis (an inbox excerpt), or `2`/`3` to clamp there. A `truncate` class
   * works too. @default "none"
   */
  lines?: ListItemLines
}

/** The muted secondary line under the title. Wraps by default; `lines` clamps or truncates it. */
export function ListItemDescription({
  className,
  lines = "none",
  ...props
}: ListItemDescriptionProps) {
  const { slots } = useListContext("ListItemDescription")
  return (
    <div
      data-slot="list-item-description"
      className={slots.description({ className: cn(LINES[lines], className) })}
      {...props}
    />
  )
}

/** Trailing slot: badges, a timestamp, a chevron, or an action button. */
export function ListItemMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemMeta")
  return <div data-slot="list-item-meta" className={slots.meta({ className })} {...props} />
}
