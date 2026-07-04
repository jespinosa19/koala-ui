import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ShowcaseDemo,
  GroupDemo,
  AnatomyDemo,
  TrendDemo,
  SparklineDemo,
  CountUpDemo,
  VariantsDemo,
  DensityDemo,
  InteractiveDemo,
} from "./stat-demos"

export const metadata = { title: "Stat" }

export default function StatDocsPage() {
  return (
    <>
      <DocHeader
        title="Stat"
        description="A KPI/metric card for dashboards: a label, a big tabular-nums value, a directional trend chip, and optional icon or sparkline. Compose the named parts into a tile, then drop a row of them above a Data Table."
      />

      <ComponentPreview previewClassName="block" code={SHOWCASE_CODE}>
        <ShowcaseDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="stat"
          dependencies="npm install @phosphor-icons/react radix-ui tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          Stat is composed from named parts, like{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a>. The{" "}
          <code className="font-mono text-sm">Stat</code> root owns the surface, variant, and
          density; the parts (<code className="font-mono text-sm">StatLabel</code>,{" "}
          <code className="font-mono text-sm">StatValue</code>,{" "}
          <code className="font-mono text-sm">StatTrend</code>) read it from context.
        </p>
        <CodeSnippet filename="orders-stat.tsx" className="mt-4" code={USAGE_CODE} />
      </DocSection>

      <DocSection title="Group">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">StatGroup</code> fuses a row of tiles into one
          segmented surface, the way a dashboard bands its headline KPIs together instead of
          floating them as separate cards. The group owns the single border, radius, and shadow;
          each nested <code className="font-mono text-sm">Stat</code> senses the group and sheds its
          own chrome to lie flush, with hairline dividers between. Set the widest-breakpoint column
          count with <code className="font-mono text-sm">columns</code> (
          <code className="font-mono text-sm">2 | 3 | 4</code>); it steps down gracefully on narrow
          screens.
        </p>
        <ComponentPreview previewClassName="block" code={GROUP_CODE}>
          <GroupDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          A tile reads top-to-bottom: a <code className="font-mono text-sm">StatHeader</code> pairs
          the label with a tinted <code className="font-mono text-sm">StatIcon</code> (or an action),
          the <code className="font-mono text-sm">StatValue</code> carries the figure in{" "}
          <code className="font-mono text-sm">tabular-nums</code> so it never reflows, and a{" "}
          <code className="font-mono text-sm">StatFooter</code> sets the trend beside a muted
          comparison caption.
        </p>
        <ComponentPreview code={ANATOMY_CODE}>
          <AnatomyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Trend">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">StatTrend</code> is a soft chip whose arrow and color
          come from <code className="font-mono text-sm">direction</code>:{" "}
          <code className="font-mono text-sm">up</code> reads green,{" "}
          <code className="font-mono text-sm">down</code> red, and{" "}
          <code className="font-mono text-sm">neutral</code> muted. For metrics where down is the good
          outcome (refunds, churn, bounce rate), set{" "}
          <code className="font-mono text-sm">inverted</code>: the color flips to match the meaning
          while the arrow keeps pointing the honest way.
        </p>
        <ComponentPreview previewClassName="block" code={TREND_CODE}>
          <TrendDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sparkline">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">StatSparkline</code> is built on{" "}
          <a href="/docs/components/chart" className="underline underline-offset-4">Chart</a> in
          sparkline mode: a soft area fill under a trend line that bleeds to the bottom and side
          edges of the tile. It paints in <code className="font-mono text-sm">currentColor</code>, so
          set the hue with a text utility (<code className="font-mono text-sm">text-success</code>,{" "}
          <code className="font-mono text-sm">text-destructive</code>) and it themes across all four
          palettes for free. Pass <code className="font-mono text-sm">tooltip</code> to light up each
          point on hover with a gliding bubble.
        </p>
        <ComponentPreview previewClassName="block" code={SPARKLINE_CODE}>
          <SparklineDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Count up">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">countUp</code> to{" "}
          <code className="font-mono text-sm">StatValue</code> and the figure counts up from zero to
          its value the first time it scrolls into view, the same trigger the marketing sections use,
          re-counting each time it scrolls back in. It climbs fast and decelerates onto the final
          figure, so it reads as a real count-up. It reads the string children (
          <code className="font-mono text-sm">&quot;4,100+&quot;</code>,{" "}
          <code className="font-mono text-sm">&quot;$4.2M&quot;</code>,{" "}
          <code className="font-mono text-sm">&quot;4.6×&quot;</code>) and preserves the prefix,
          suffix, and comma/decimal format as it counts, riding the built-in{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the row never jitters as the count
          climbs. It no-ops for number-less content and honors{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code> by showing the final
          figure immediately.
        </p>
        <ComponentPreview previewClassName="block" code={COUNT_UP_CODE}>
          <CountUpDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">default</code> sits on a hairline border with a soft
          shadow; <code className="font-mono text-sm">outline</code> drops the shadow for flat,
          gridded dashboards; <code className="font-mono text-sm">elevated</code> trades the border
          for a lifted shadow when a tile needs to float.
        </p>
        <ComponentPreview previewClassName="block" code={VARIANTS_CODE}>
          <VariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Density is Koala&rsquo;s cross-cutting spacing axis (see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>).
          For Stat it tunes padding, gap, the icon tile, and the value size.{" "}
          <code className="font-mono text-sm">compact</code> is the dashboard default;{" "}
          <code className="font-mono text-sm">comfortable</code> is roomier. Set it per-tile or for a
          whole grid with <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview previewClassName="block" code={DENSITY_CODE}>
          <DensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Interactive">
        <p className="mt-4 text-pretty text-muted-foreground">
          A KPI tile is data, not a control, so it stays inert by default. When the whole tile should
          drill into a detail view, pass <code className="font-mono text-sm">asChild</code> to render
          it as a link and <code className="font-mono text-sm">interactive</code> to add the pointer,
          hover lift, and focus ring. For a per-tile menu instead, drop a{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">Button</a> into
          the header.
        </p>
        <ComponentPreview previewClassName="block" code={INTERACTIVE_CODE}>
          <InteractiveDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Stat</code> forwards all{" "}
          <code className="font-mono text-sm">div</code> props and adds{" "}
          <code className="font-mono text-sm">variant</code> (
          <code className="font-mono text-sm">default | outline | elevated</code>),{" "}
          <code className="font-mono text-sm">density</code> (
          <code className="font-mono text-sm">compact | comfortable</code>),{" "}
          <code className="font-mono text-sm">interactive</code>, and{" "}
          <code className="font-mono text-sm">asChild</code>.{" "}
          <code className="font-mono text-sm">StatGroup</code> bands a row of tiles into one
          surface and forwards <code className="font-mono text-sm">div</code> props plus{" "}
          <code className="font-mono text-sm">variant</code> (
          <code className="font-mono text-sm">default | outline | elevated</code>),{" "}
          <code className="font-mono text-sm">columns</code> (
          <code className="font-mono text-sm">2 | 3 | 4</code>), and{" "}
          <code className="font-mono text-sm">asChild</code>. The parts{" "}
          <code className="font-mono text-sm">StatHeader</code>,{" "}
          <code className="font-mono text-sm">StatLabel</code>,{" "}
          <code className="font-mono text-sm">StatValue</code>,{" "}
          <code className="font-mono text-sm">StatCaption</code>,{" "}
          <code className="font-mono text-sm">StatFooter</code>,{" "}
          <code className="font-mono text-sm">StatIcon</code> all forward{" "}
          <code className="font-mono text-sm">div</code> props;{" "}
          <code className="font-mono text-sm">StatValue</code> adds{" "}
          <code className="font-mono text-sm">countUp</code> to count a string figure up from zero on
          scroll.{" "}
          <code className="font-mono text-sm">StatTrend</code> adds{" "}
          <code className="font-mono text-sm">direction</code> (
          <code className="font-mono text-sm">up | down | neutral</code>) and{" "}
          <code className="font-mono text-sm">inverted</code>;{" "}
          <code className="font-mono text-sm">StatSparkline</code> takes a{" "}
          <code className="font-mono text-sm">data: number[]</code>, an optional{" "}
          <code className="font-mono text-sm">strokeWidth</code>, and{" "}
          <code className="font-mono text-sm">tooltip</code> to enable per-point hover. Every part accepts{" "}
          <code className="font-mono text-sm">className</code>, merged last.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I compose a tile from the named parts?", a: "The `Stat` root owns the surface, variant, and density; nest a `StatHeader` (with `StatLabel` plus an optional `StatIcon`), then `StatValue`, then a `StatFooter` pairing `StatTrend` with `StatCaption`. The parts read the root from context, so you never wire props between them." },
            { q: "When should I use StatGroup instead of separate Stat cards?", a: "Reach for `StatGroup` to band a row of headline KPIs into one segmented surface: the group owns the single border, radius, and shadow, and each nested `Stat` sheds its own chrome to lie flush with hairline dividers. Use standalone `Stat` tiles when they should float as separate cards. Set the widest-breakpoint column count with `columns` (`2 | 3 | 4`)." },
            { q: "What does the inverted prop on StatTrend do?", a: "By default `StatTrend` colors `up` green and `down` red. For metrics where down is the good outcome, like refunds, churn, or bounce rate, set `inverted` so the color flips to match the meaning while the arrow keeps pointing the honest way." },
            { q: "How do I make a whole tile clickable?", a: "A KPI tile is data, so it is inert by default. Pass `asChild` to render it as a link (wrap an `<a>`) and `interactive` to add the pointer, hover lift, and focus ring; for a per-tile menu instead, drop a `Button` into the `StatHeader`." },
            { q: "How do I color the StatSparkline and theme it?", a: "`StatSparkline` paints in `currentColor`, so set the hue with a text utility like `text-success` or `text-destructive` and it themes across all four palettes for free. Pass `tooltip` to light up each point on hover." },
            { q: "How do I animate the figures counting up?", a: "Pass `countUp` to `StatValue`. It counts the figure up from zero to its value the first time it scrolls into view (an IntersectionObserver, same trigger as the marketing sections) and re-counts on every re-entry, climbing fast then decelerating onto the final figure. It parses the string children to keep the prefix, suffix, and comma/decimal format: `$4.2M` lands on $4.2M, `4.6×` on 4.6×, `74%` on 74%. It relies on the value's built-in `tabular-nums` so the row never jitters as the count climbs, no-ops for number-less content, and honors `prefers-reduced-motion` by showing the final figure immediately." },
            { q: "Which density should I use for a dashboard?", a: "`compact` is the dashboard default and tunes padding, gap, the icon tile, and the value size down; `comfortable` is roomier. Set it per-tile via the `density` prop or for a whole grid with `DensityProvider`." },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------ code blocks --- */

const SHOWCASE_CODE = `// A row of KPI tiles above your Orders table.
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Stat>
    <StatHeader>
      <StatLabel>Total orders</StatLabel>
      <StatIcon className="bg-primary/10 text-primary"><ShoppingBag /></StatIcon>
    </StatHeader>
    <StatValue>1,429</StatValue>
    <StatFooter>
      <StatTrend direction="up">12.4%</StatTrend>
      <StatCaption>vs last month</StatCaption>
    </StatFooter>
  </Stat>
  {/* …Revenue, Avg. order value, Refunds */}
</div>`

const USAGE_CODE = `import {
  Stat,
  StatHeader,
  StatLabel,
  StatValue,
  StatTrend,
  StatCaption,
  StatFooter,
  StatIcon,
} from "@/components/ui/stat"
import { ShoppingBag } from "@phosphor-icons/react"

export function OrdersStat() {
  return (
    <Stat>
      <StatHeader>
        <StatLabel>Total orders</StatLabel>
        <StatIcon className="bg-primary/10 text-primary"><ShoppingBag /></StatIcon>
      </StatHeader>
      <StatValue>1,429</StatValue>
      <StatFooter>
        <StatTrend direction="up">12.4%</StatTrend>
        <StatCaption>vs last month</StatCaption>
      </StatFooter>
    </Stat>
  )
}`

const GROUP_CODE = `// One bordered surface, hairline dividers, tiles laid flush.
// Each Stat sheds its own border/shadow inside the group automatically.
<StatGroup columns={4}>
  <Stat>
    <StatHeader>
      <StatLabel>Total orders</StatLabel>
      <StatIcon className="bg-primary/10 text-primary"><ShoppingBag /></StatIcon>
    </StatHeader>
    <div className="flex items-center gap-2">
      <StatValue>1,429</StatValue>
      <StatTrend direction="up">12.4%</StatTrend>
    </div>
  </Stat>
  {/* …Revenue, Avg. order value, Refunds */}
</StatGroup>`

const ANATOMY_CODE = `<Stat>
  <StatHeader>
    <StatLabel>Total orders</StatLabel>
    <StatIcon className="bg-primary/10 text-primary"><ShoppingBag /></StatIcon>
  </StatHeader>
  <StatValue>1,429</StatValue>
  <StatFooter>
    <StatTrend direction="up">12.4%</StatTrend>
    <StatCaption>vs last month</StatCaption>
  </StatFooter>
</Stat>`

const TREND_CODE = `<StatTrend direction="up">12.4%</StatTrend>          {/* green, ↑ */}
<StatTrend direction="down">2.3%</StatTrend>          {/* red, ↓ */}
<StatTrend direction="down" inverted>5.0%</StatTrend> {/* green, ↓ down is good */}
<StatTrend direction="neutral">0.0%</StatTrend>       {/* muted, – */}`

const SPARKLINE_CODE = `// Built on Chart: paints in currentColor, bleeds to the tile edges.
// "tooltip" lights each point on hover with a gliding bubble.
<Stat>
  <StatHeader>
    <StatLabel>Orders this week</StatLabel>
    <StatTrend direction="up">18.2%</StatTrend>
  </StatHeader>
  <StatValue>1,429</StatValue>
  <StatSparkline data={[18, 22, 19, 27, 24, 31, 29, 38, 42]} tooltip className="mt-3 text-success" />
</Stat>`

const COUNT_UP_CODE = `// "countUp" counts the figure up from zero to its value the first time it scrolls
// into view, and re-counts on every re-entry. It parses the string (prefix, number,
// suffix) and keeps the format, so "$4.2M" lands on $4.2M and "4.6×" on 4.6×.
// Honors prefers-reduced-motion.
<StatGroup columns={3}>
  <Stat density="comfortable" className="items-center gap-1.5 text-center">
    <StatValue countUp className="text-4xl">4,100+</StatValue>
    <StatLabel>Teams building on Koala</StatLabel>
  </Stat>
  <Stat density="comfortable" className="items-center gap-1.5 text-center">
    <StatValue countUp className="text-4xl">$4.2M</StatValue>
    <StatLabel>Engineering time saved</StatLabel>
  </Stat>
  <Stat density="comfortable" className="items-center gap-1.5 text-center">
    <StatValue countUp className="text-4xl">4.6×</StatValue>
    <StatLabel>Faster to ship</StatLabel>
  </Stat>
</StatGroup>`

const VARIANTS_CODE = `<Stat variant="default">…</Stat>
<Stat variant="outline">…</Stat>
<Stat variant="elevated">…</Stat>`

const DENSITY_CODE = `// "compact" (the dashboard default) or "comfortable"
<Stat density="compact">…</Stat>
<Stat density="comfortable">…</Stat>`

const INTERACTIVE_CODE = `// The whole tile drills into a detail view:
<Stat asChild interactive>
  <a href="/orders">
    <StatHeader>
      <StatLabel>Total orders</StatLabel>
      <StatIcon className="bg-primary/10 text-primary"><ShoppingBag /></StatIcon>
    </StatHeader>
    <StatValue>1,429</StatValue>
    <StatFooter>
      <StatTrend direction="up">12.4%</StatTrend>
      <StatCaption>View all orders</StatCaption>
    </StatFooter>
  </a>
</Stat>

// Or a per-tile menu: drop a Button in the header:
<StatHeader>
  <StatLabel>Revenue</StatLabel>
  <Button variant="ghost" size="sm" iconOnly aria-label="More"><DotsThree /></Button>
</StatHeader>`
