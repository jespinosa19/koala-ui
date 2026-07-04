"use client"

import {
  Sneaker,
  TShirt,
  Watch,
  Headphones,
  Handbag,
  CaretRight,
} from "@phosphor-icons/react"

import {
  Ranking,
  RankingHeader,
  RankingTitle,
  RankingDescription,
  RankingAction,
  RankingList,
  RankingItem,
  RankingRank,
  RankingMedia,
  RankingContent,
  RankingLabel,
  RankingMeta,
  RankingValue,
  RankingBar,
} from "@/components/ui/ranking"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"

/* Top products by units sold, with each row's share of the leader for the bars.
   The richer numbers (revenue, MoM) live in the tooltip, not crammed into the row. */
const PRODUCTS = [
  { name: "Trail Runner GTX", short: "Runner", category: "Footwear", units: 1284, share: 100, revenue: "$92,448", delta: "+14%", icon: Sneaker },
  { name: "Merino Base Tee", short: "Tee", category: "Apparel", units: 968, share: 75, revenue: "$48,400", delta: "+9%", icon: TShirt },
  { name: "Field Watch 38mm", short: "Watch", category: "Accessories", units: 742, share: 58, revenue: "$133,560", delta: "+5%", icon: Watch },
  { name: "Studio Headphones", short: "Audio", category: "Audio", units: 511, share: 40, revenue: "$76,650", delta: "-3%", icon: Headphones },
  { name: "Weekender Bag", short: "Bag", category: "Bags", units: 388, share: 30, revenue: "$31,040", delta: "+2%", icon: Handbag },
]

type Product = (typeof PRODUCTS)[number]

/* One tooltip body, reused by every "tops" surface: this is the detail we keep OUT
   of the row so it can breathe. */
function ProductTip({ p }: { p: Product }) {
  return (
    <div className="space-y-0.5 text-left">
      <div className="font-medium text-popover-foreground">{p.name}</div>
      <div className="text-muted-foreground">
        {p.units.toLocaleString()} units · {p.share}% of #1
      </div>
      <div className="text-muted-foreground">
        {p.revenue} revenue · {p.delta} MoM
      </div>
    </div>
  )
}

const CUSTOMERS = [
  { name: "Esteban Alonso", orders: 42, spent: "$8,420", img: 12, delta: "up" as const },
  { name: "Mara Devlin", orders: 38, spent: "$7,180", img: 45, delta: "up" as const },
  { name: "Liang Wei", orders: 31, spent: "$5,960", img: 32, delta: "down" as const },
  { name: "Priya Nair", orders: 27, spent: "$5,210", img: 5, delta: "up" as const },
]

/* ----------------------------------------------------------------- showcase --- */

export function ShowcaseDemo() {
  return (
    <Ranking className="w-full max-w-lg">
      <RankingHeader>
        <div className="space-y-1">
          <RankingTitle>Top products</RankingTitle>
          <RankingDescription>By units sold this month</RankingDescription>
        </div>
        <RankingAction>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </RankingAction>
      </RankingHeader>

      <RankingList>
        {PRODUCTS.map((p, i) => (
          // The row stays light: rank, product, share bar, units. Revenue and MoM
          // ride in the tooltip instead of crowding the line.
          <Tooltip key={p.name} content={<ProductTip p={p} />} variant="graph" placement="right">
            <RankingItem interactive>
              <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
              <RankingMedia>
                <p.icon weight="bold" />
              </RankingMedia>
              <RankingContent>
                <RankingLabel>{p.name}</RankingLabel>
                <RankingBar value={p.share} />
              </RankingContent>
              <RankingValue>{p.units.toLocaleString()}</RankingValue>
            </RankingItem>
          </Tooltip>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* ------------------------------------------------------------- vertical bars --- */

export function BarChartDemo() {
  return (
    <Ranking layout="bars" className="w-full max-w-md">
      <RankingHeader>
        <RankingTitle>Top products</RankingTitle>
        <Badge size="sm" variant="success">
          +12% MoM
        </Badge>
      </RankingHeader>
      <RankingList>
        {PRODUCTS.map((p) => (
          // Each bar is a trigger; hover surfaces the full detail without labels
          // fighting for space in the narrow column.
          <Tooltip key={p.name} content={<ProductTip p={p} />} variant="graph">
            <RankingItem>
              <RankingValue className="text-xs">{p.units.toLocaleString()}</RankingValue>
              <RankingBar value={p.share} />
              <RankingLabel className="w-full text-xs font-normal text-muted-foreground">
                {p.short}
              </RankingLabel>
            </RankingItem>
          </Tooltip>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* -------------------------------------------------------------------- simple --- */

export function SimpleDemo() {
  return (
    <Ranking className="w-full max-w-md">
      <RankingHeader>
        <RankingTitle>Top categories</RankingTitle>
      </RankingHeader>
      <RankingList>
        {[
          ["Footwear", "$24,180"],
          ["Apparel", "$18,640"],
          ["Accessories", "$12,920"],
          ["Audio", "$9,310"],
        ].map(([name, revenue], i) => (
          <RankingItem key={name}>
            <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
            <RankingContent>
              <RankingLabel>{name}</RankingLabel>
            </RankingContent>
            <RankingValue>{revenue}</RankingValue>
          </RankingItem>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* ------------------------------------------------------------------- avatars --- */

export function AvatarsDemo() {
  return (
    <Ranking className="w-full max-w-md">
      <RankingHeader>
        <RankingTitle>Top customers</RankingTitle>
        <RankingDescription>By lifetime spend</RankingDescription>
      </RankingHeader>
      <RankingList>
        {CUSTOMERS.map((c, i) => (
          <RankingItem key={c.name}>
            <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
            <Avatar size="sm">
              <AvatarImage src={`https://i.pravatar.cc/80?img=${c.img}`} alt={c.name} />
              <AvatarFallback>
                {c.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <RankingContent>
              <RankingLabel>{c.name}</RankingLabel>
              <RankingMeta>{c.orders} orders</RankingMeta>
            </RankingContent>
            <RankingValue>{c.spent}</RankingValue>
          </RankingItem>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* ---------------------------------------------------------------------- bars --- */

export function BarsDemo() {
  return (
    <Ranking className="w-full max-w-md">
      <RankingHeader>
        <RankingTitle>Top products</RankingTitle>
        <Badge size="sm" variant="success">
          +12% MoM
        </Badge>
      </RankingHeader>
      <RankingList>
        {PRODUCTS.map((p, i) => (
          <RankingItem key={p.name}>
            <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
            <RankingContent>
              <div className="flex items-baseline justify-between gap-3">
                <RankingLabel>{p.name}</RankingLabel>
                <RankingValue>{p.units.toLocaleString()}</RankingValue>
              </div>
              <RankingBar value={p.share} />
            </RankingContent>
          </RankingItem>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* --------------------------------------------------------------- interactive --- */

export function InteractiveDemo() {
  return (
    <Ranking className="w-full max-w-md">
      <RankingHeader>
        <RankingTitle>Top products</RankingTitle>
        <RankingDescription>Tap a row to open the product</RankingDescription>
      </RankingHeader>
      <RankingList>
        {PRODUCTS.slice(0, 4).map((p, i) => (
          <RankingItem key={p.name} interactive onClick={() => {}}>
            <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
            <RankingMedia>
              <p.icon />
            </RankingMedia>
            <RankingContent>
              <RankingLabel>{p.name}</RankingLabel>
              <RankingMeta>{p.units.toLocaleString()} units</RankingMeta>
            </RankingContent>
            <CaretRight weight="bold" aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          </RankingItem>
        ))}
      </RankingList>
    </Ranking>
  )
}

/* ------------------------------------------------------------------ variants --- */

export function VariantsDemo() {
  const rows = (
    <RankingList>
      {PRODUCTS.slice(0, 3).map((p, i) => (
        <RankingItem key={p.name}>
          <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
          <RankingContent>
            <RankingLabel>{p.name}</RankingLabel>
          </RankingContent>
          <RankingValue>{p.units.toLocaleString()}</RankingValue>
        </RankingItem>
      ))}
    </RankingList>
  )
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Ranking variant="default">
        <RankingHeader>
          <RankingTitle>Default</RankingTitle>
        </RankingHeader>
        {rows}
      </Ranking>
      <Ranking variant="outline">
        <RankingHeader>
          <RankingTitle>Outline</RankingTitle>
        </RankingHeader>
        {rows}
      </Ranking>
      <Ranking variant="elevated">
        <RankingHeader>
          <RankingTitle>Elevated</RankingTitle>
        </RankingHeader>
        {rows}
      </Ranking>
    </div>
  )
}
