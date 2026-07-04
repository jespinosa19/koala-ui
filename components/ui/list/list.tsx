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
    row: "",
    // The row surface: media left, content fills, meta rides the right edge. Carries the
    // per-row padding and gap directly (plain rows drop the horizontal padding below).
    item: "flex items-center gap-3 px-3 py-2.5",
    // Leading slot: holds a bare icon, an Avatar, or a small image. Bare svgs are sized
    // and toned here; an Avatar brings its own.
    media: "flex shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-5",
    // min-w-0 lets the title truncate instead of pushing the meta off the row.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "truncate font-medium text-foreground",
    description: "text-pretty text-xs text-muted-foreground",
    // Trailing slot: badges, a timestamp, a chevron, or an action button.
    meta: "ml-auto flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground [&>svg]:size-4",
  },
  variants: {
    variant: {
      // A bordered card surface that bands the rows together; overflow-hidden clips the
      // flush rows (and their hover fills) to the card's radius.
      card: {
        root: "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs",
      },
      // Chrome-less: rows sit flush on whatever surface holds the list.
      plain: {},
    },
    // Hairline rule between rows: the list-group identity. Sits on the outer <li> so an
    // interactive inner surface paints its hover fill above the line, not through it.
    divided: {
      true: { row: "border-b border-border last:border-b-0" },
    },
    // Set per row on {@link ListItem} when the whole row is a link/button: pointer, a soft
    // hover fill, a press nudge, and an inset focus ring (inset so overflow-hidden can't
    // clip it). Plain rows stay inert.
    interactive: {
      true: {
        // Specific transition (never `all`); 0.99 press on a wide surface stays subtle and
        // above the 0.95 floor.
        item: "cursor-pointer transition-[background-color,transform] duration-fast ease-out hover:bg-muted active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      },
    },
  },
  compoundVariants: [
    // Plain rows align flush to the container's left edge (no surface to inset from).
    { variant: "plain", class: { item: "px-0" } },
    // …but an interactive plain row pulls its hover fill back into a detached pill so it
    // doesn't bleed to the very edge: negative margin keeps the text aligned flush.
    { variant: "plain", interactive: true, class: { item: "-mx-2 rounded-lg px-2" } },
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
    Omit<VariantProps<typeof listVariants>, "interactive"> {
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
  children,
  ...props
}: ListItemProps) {
  const { config } = useListContext("ListItem")
  const isInteractive = interactive ?? asChild
  const slots = listVariants({ ...config, interactive: isInteractive })

  // asChild: the <li> keeps only the divider; the child element owns the row layout +
  // interaction, giving valid <li><a>…</a></li>.
  if (asChild) {
    return (
      <li data-slot="list-item" className={slots.row()}>
        <Slot.Root className={slots.item({ className })} {...props}>
          {children}
        </Slot.Root>
      </li>
    )
  }

  // Static row: the <li> carries both the divider and the row layout.
  return (
    <li
      data-slot="list-item"
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

/** The primary line. Truncates rather than pushing the meta off the row. */
export function ListItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemTitle")
  return <div data-slot="list-item-title" className={slots.title({ className })} {...props} />
}

/** The muted secondary line under the title. */
export function ListItemDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemDescription")
  return (
    <div data-slot="list-item-description" className={slots.description({ className })} {...props} />
  )
}

/** Trailing slot: badges, a timestamp, a chevron, or an action button. */
export function ListItemMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useListContext("ListItemMeta")
  return <div data-slot="list-item-meta" className={slots.meta({ className })} {...props} />
}
