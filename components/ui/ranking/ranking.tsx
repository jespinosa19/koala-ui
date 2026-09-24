"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Ranking: the Data Display "tops" widget. A leaderboard card listing ranked rows
 * (top products, customers, countries…) with a position chip, optional media, a
 * value, and an optional relative-share bar. Multi-part, built like Card/Stat: one
 * `tv` slots recipe whose slots flow to every part through React Context. It's a
 * dashboard widget, so its spacing is fixed compact (no density knob). Compose the
 * named parts. See docs/ARCHITECTURE.md §2.
 */
export const rankingVariants = tv({
  slots: {
    // No fill here: fill is elevation, so only `elevated` paints one (see Card).
    // No border either: the edge is a ring (box-shadow) set per variant, so it takes no layout.
    root: "flex flex-col gap-3 rounded-xl p-4 text-card-foreground",
    header: "flex items-start justify-between gap-3",
    title: "text-base font-semibold leading-none",
    description: "text-sm text-pretty text-muted-foreground",
    action: "shrink-0",
    list: "",
    // `group/item` is named here, not on the interactive branch, so the bar-aware alignment
    // below (and the hover swaps) resolve on plain rows too.
    item: "group/item",
    // Position chip: square, tabular so 1/10/100 hold a column. On an interactive row
    // the hover wash is bg-accent, which in some themes equals bg-muted, so the chip
    // dissolves. Swap it to bg-card (one gentle step under the wash, never the near-black
    // bg-background) so it keeps the SAME definition it has at rest, just inverted.
    rank: "grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground transition-colors duration-fast ease-out group-hover/item:bg-card",
    // Tinted icon tile for non-people rows (products, countries). People use Avatar.
    media: "grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground transition-colors duration-fast ease-out group-hover/item:bg-card [&>svg]:size-4",
    content: "min-w-0 flex-1",
    label: "truncate text-sm font-medium text-foreground",
    meta: "truncate text-xs text-muted-foreground",
    value: "shrink-0 text-sm font-semibold tabular-nums text-foreground",
    barTrack: "",
    barFill: "",
  },
  variants: {
    variant: {
      // In-flow widgets are contours on whatever ground holds them; only `elevated` floats, and in
      // dark the lifted fill (not the shadow, which barely reads on near-black) is what shows it.
      // Shadows over borders: `default` is an `--edge` ring plus the xs lift, `outline` the bare
      // ring at full `--border` strength (no lift to help it), `elevated` the lift alone.
      default: { root: "shadow-xs ring-1 ring-edge" },
      outline: { root: "shadow-none ring-1 ring-border" },
      elevated: { root: "bg-card shadow-lg [--surface:var(--card)]" },
    },
    // Two ways to read a "top" list: stacked rows, or a vertical bar chart.
    layout: {
      list: {
        // Row gap (12px) runs ~2:1 over the label→bar spacing (mt-1.5 = 6px) so each row
        // reads as one block and multi-part rows (bar under label) breathe instead of blurring
        // into the next. A near-equal gap (e.g. 8px over 6px) still reads cramped.
        list: "flex flex-col gap-3",
        // Two row shapes, two right answers. Label + meta is two lines of TEXT, so the rank
        // chip, media tile and value center on the block, the way any contact row does.
        // Label + bar is not: the bar is a decoration under the label, and centering against
        // it drops the chip and the figure ~6px below the name they annotate. So the row
        // top-aligns only when a bar is present, and `rank`/`media` carry the matching nudge
        // that re-centers each on the label's own line.
        item: "flex items-center gap-3 has-[[data-slot=ranking-bar]]:items-start",
        // The nudges live in this layout only: `bars` rows also contain a ranking-bar, but
        // there the item is a vertical column where nothing needs re-centering.
        rank: "group-has-[[data-slot=ranking-bar]]/item:-mt-0.5",
        media: "group-has-[[data-slot=ranking-bar]]/item:-mt-1.5",
        barTrack:
          "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted transition-colors duration-fast ease-out group-hover/item:bg-card",
        // Runtime width rides a CSS var per the house rule (no generated classes).
        barFill: "h-full w-(--ranking-bar) rounded-full bg-blue-500 transition-[width] duration-slow ease-out",
      },
      bars: {
        list: "flex h-44 flex-row items-end justify-between gap-2 sm:gap-3",
        item: "flex h-full flex-1 flex-col items-center justify-end gap-2 text-center",
        // The track is the full-height column; the fill rises from the bottom. Top corners round
        // at 4px to match the Chart's bars (blue-500, radius 4); the base sits square on the row.
        barTrack: "flex w-8 flex-1 flex-col justify-end overflow-hidden rounded-t-[4px] bg-muted/60 sm:w-10",
        barFill: "w-full rounded-t-[4px] bg-blue-500 h-(--ranking-bar) transition-[height] duration-slow ease-out",
      },
      // A horizontal bar chart: the name holds a fixed column and the bar runs beside it, thick
      // enough to read as the row's figure. The bars rest neutral, and the brand is the hover:
      // the bar under the pointer (or keyboard focus, when the bar is a tooltip trigger) lights
      // up, the Chart's `neutral` + `brand` pairing. Nothing is lit at rest; `highlight` pins one
      // only when a row really is "the one in question". No track: the empty run is just the card.
      inline: {
        // 16px between 32px bars: the rows read as a chart's bands, not a packed stack.
        list: "flex flex-col gap-4",
        item: "flex items-center gap-3",
        content: "w-16 flex-none",
        barTrack: "group/bar h-8 min-w-0 flex-1 outline-none",
        // Two clocks: the width eases slow (a new range settles), the color answers the pointer
        // fast. The focus ring sits on the fill, the shape that actually lights up.
        barFill:
          "h-full w-(--ranking-bar) rounded-md bg-foreground/10 [transition:width_var(--duration-slow)_var(--ease-out),background-color_var(--duration-fast)_var(--ease-out)] group-hover/bar:bg-brand group-focus-visible/bar:bg-brand group-focus-visible/bar:ring-2 group-focus-visible/bar:ring-brand group-focus-visible/bar:ring-offset-2 group-focus-visible/bar:ring-offset-background motion-reduce:transition-none",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    layout: "list",
  },
})

type RankingSlots = ReturnType<typeof rankingVariants>
const [RankingProvider, useRankingContext] = createContext<{ slots: RankingSlots }>("Ranking")

export interface RankingProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof rankingVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `Ranking.Item` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do.
 */
export function Ranking({
  className,
  variant,
  layout,
  asChild = false,
  ...props
}: RankingProps) {
  const slots = rankingVariants({ variant, layout })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <RankingProvider slots={slots}>
      <Comp data-slot="ranking" className={slots.root({ className })} {...props} />
    </RankingProvider>
  )
}

export function RankingHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingHeader")
  return <div data-slot="ranking-header" className={slots.header({ className })} {...props} />
}

export function RankingTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingTitle")
  return <div data-slot="ranking-title" className={slots.title({ className })} {...props} />
}

export function RankingDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingDescription")
  return (
    <div data-slot="ranking-description" className={slots.description({ className })} {...props} />
  )
}

export function RankingAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingAction")
  return <div data-slot="ranking-action" className={slots.action({ className })} {...props} />
}

/** Semantic ordered list so assistive tech announces positions. */
export function RankingList({ className, ...props }: React.ComponentProps<"ol">) {
  const { slots } = useRankingContext("RankingList")
  return <ol data-slot="ranking-list" className={slots.list({ className })} {...props} />
}

export interface RankingItemProps extends React.ComponentProps<"li"> {
  /** Adds pointer, hover wash, and a focus ring for clickable rows. */
  interactive?: boolean
}

export function RankingItem({ className, interactive = false, ...props }: RankingItemProps) {
  const { slots } = useRankingContext("RankingItem")
  return (
    <li
      data-slot="ranking-item"
      className={slots.item({
        className: cn(
          interactive &&
            "-mx-2 cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-fast ease-out hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        ),
      })}
      {...props}
    />
  )
}

export interface RankingRankProps extends React.ComponentProps<"span"> {
  /** Emphasize the leader with a filled primary chip. */
  highlight?: boolean
}

export function RankingRank({ className, highlight = false, ...props }: RankingRankProps) {
  const { slots } = useRankingContext("RankingRank")
  return (
    <span
      data-slot="ranking-rank"
      className={slots.rank({
        // The leader keeps its primary fill on hover too: override the row's bg-card swap.
        className: cn(
          highlight && "bg-primary text-primary-foreground group-hover/item:bg-primary",
          className,
        ),
      })}
      {...props}
    />
  )
}

export function RankingMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingMedia")
  return <div data-slot="ranking-media" aria-hidden className={slots.media({ className })} {...props} />
}

export function RankingContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingContent")
  return <div data-slot="ranking-content" className={slots.content({ className })} {...props} />
}

export function RankingLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingLabel")
  return <div data-slot="ranking-label" className={slots.label({ className })} {...props} />
}

export function RankingMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingMeta")
  return <div data-slot="ranking-meta" className={slots.meta({ className })} {...props} />
}

export function RankingValue({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useRankingContext("RankingValue")
  return <div data-slot="ranking-value" className={slots.value({ className })} {...props} />
}

export interface RankingBarProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Share of the leader, 0-100. Drives the fill width. */
  value: number
  /**
   * Pin this one bar in the brand, for a row that stays "the one in question". In the `inline`
   * layout the brand is already the hover, so leave it off unless something is truly selected.
   */
  highlight?: boolean
}

/**
 * RankingBar: a thin relative-share bar. The fill paints `bg-blue-500` by default, the
 * same chart hue the Chart's line and bars use, so a Ranking and a Chart read as one system.
 * Recolor it with a `className` on the fill via the `[&>div]` child, or pass a tone
 * class. The width is a runtime value, so it rides a CSS variable, not a generated class.
 */
export function RankingBar({ className, value, highlight = false, ...props }: RankingBarProps) {
  const { slots } = useRankingContext("RankingBar")
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div data-slot="ranking-bar" className={slots.barTrack({ className })} {...props}>
      <div
        className={slots.barFill({ className: highlight && "bg-brand" })}
        style={{ "--ranking-bar": `${pct}%` } as React.CSSProperties}
      />
    </div>
  )
}
