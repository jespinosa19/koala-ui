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
    root: "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground",
    header: "flex items-start justify-between gap-3",
    title: "text-base font-semibold leading-none",
    description: "text-sm text-pretty text-muted-foreground",
    action: "shrink-0",
    list: "",
    item: "",
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
      // polish: prefer shadow for depth over hard borders.
      default: { root: "border-border shadow-xs" },
      outline: { root: "border-border shadow-none" },
      elevated: { root: "border-transparent shadow-lg" },
    },
    // Two ways to read a "top" list: stacked rows, or a vertical bar chart.
    layout: {
      list: {
        // Row gap (12px) runs ~2:1 over the label→bar spacing (mt-1.5 = 6px) so each row
        // reads as one block and multi-part rows (bar under label) breathe instead of blurring
        // into the next. A near-equal gap (e.g. 8px over 6px) still reads cramped.
        list: "flex flex-col gap-3",
        item: "flex items-center gap-3",
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
            "group/item -mx-2 cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-fast ease-out hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
}

/**
 * RankingBar: a thin relative-share bar. The fill paints `bg-blue-500` by default, the
 * same chart hue the Chart's line and bars use, so a Ranking and a Chart read as one system.
 * Recolor it with a `className` on the fill via the `[&>div]` child, or pass a tone
 * class. The width is a runtime value, so it rides a CSS variable, not a generated class.
 */
export function RankingBar({ className, value, ...props }: RankingBarProps) {
  const { slots } = useRankingContext("RankingBar")
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div data-slot="ranking-bar" className={slots.barTrack({ className })} {...props}>
      <div
        className={slots.barFill()}
        style={{ "--ranking-bar": `${pct}%` } as React.CSSProperties}
      />
    </div>
  )
}
