import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ShowcaseDemo,
  SimpleDemo,
  AvatarsDemo,
  BarsDemo,
  BarChartDemo,
  InteractiveDemo,
  VariantsDemo,
} from "./ranking-demos"

export const metadata = { title: "Ranking" }

export default function RankingDocsPage() {
  return (
    <>
      <DocHeader
        title="Ranking"
        description="A leaderboard card for the “tops” of a dashboard: top products, customers, or countries. Read it as stacked rows or a vertical bar chart, with each row carrying a position chip, optional media, a value, and a relative-share bar. Detail rides in a Tooltip, not crammed into the row. Composed from named parts and sized to sit beside a Stat row."
      />

      <ComponentPreview code={SHOWCASE_CODE}>
        <ShowcaseDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="ranking"
          dependencies="npm install @phosphor-icons/react radix-ui tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          Ranking is composed from named parts, like{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a> and{" "}
          <a href="/docs/components/stat" className="underline underline-offset-4">Stat</a>. The{" "}
          <code className="font-mono text-sm">Ranking</code> root owns the surface and variant;{" "}
          <code className="font-mono text-sm">RankingList</code> is a semantic{" "}
          <code className="font-mono text-sm">&lt;ol&gt;</code> so assistive tech announces the
          positions, and each <code className="font-mono text-sm">RankingItem</code> lays out a
          rank, content, and value.
        </p>
        <CodeSnippet filename="top-categories.tsx" className="mt-4" code={USAGE_CODE} />
        <div className="mt-4">
          <ComponentPreview code={SIMPLE_CODE}>
            <SimpleDemo />
          </ComponentPreview>
        </div>
      </DocSection>

      <DocSection title="Media and meta">
        <p className="mt-4 text-pretty text-muted-foreground">
          Give a row a face. <code className="font-mono text-sm">RankingMedia</code> is a tinted
          icon tile for things (products, countries); for people, drop an{" "}
          <a href="/docs/components/avatar" className="underline underline-offset-4">Avatar</a>{" "}
          in the same slot. <code className="font-mono text-sm">RankingMeta</code> adds a muted
          second line under the label (a category, an order count) and{" "}
          <code className="font-mono text-sm">RankingValue</code> holds the figure in{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the column stays aligned.
        </p>
        <ComponentPreview code={AVATARS_CODE}>
          <AvatarsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Relative bars">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">RankingBar</code> draws each row&rsquo;s share of the
          leader from a <code className="font-mono text-sm">value</code> of 0–100, so the list reads
          as a chart at a glance. The fill width is a runtime value, so it rides a CSS variable
          (never a generated class) and animates when the data changes.
        </p>
        <ComponentPreview code={BARS_CODE}>
          <BarsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Vertical bars">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">layout=&quot;bars&quot;</code> to read the same
          list as a vertical bar chart: <code className="font-mono text-sm">RankingList</code> turns
          into a row of full-height columns and each <code className="font-mono text-sm">RankingBar</code>{" "}
          grows from the bottom to its share. The columns are narrow, so lean on the{" "}
          <a href="/docs/components/tooltip" className="underline underline-offset-4">Tooltip</a>{" "}
          and wrap each <code className="font-mono text-sm">RankingItem</code> and surface the full
          detail on hover instead of squeezing it under the bar.
        </p>
        <ComponentPreview code={BARCHART_CODE}>
          <BarChartDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Interactive rows">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">interactive</code> to a{" "}
          <code className="font-mono text-sm">RankingItem</code> for a clickable row: pointer, a
          hover wash that bleeds to the card edge, and a focus ring. The wash sits close to the
          rank chip, media tile, and bar track, so those nested surfaces step down to the card
          surface on hover to keep their definition instead of dissolving into the wash, while the
          highlighted leader chip holds its primary fill. Wire it with{" "}
          <code className="font-mono text-sm">onClick</code> and add a trailing chevron to signal
          the affordance.
        </p>
        <ComponentPreview code={INTERACTIVE_CODE}>
          <InteractiveDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">default</code> sits on a hairline border with a soft
          shadow; <code className="font-mono text-sm">outline</code> drops the shadow for flat,
          gridded dashboards; <code className="font-mono text-sm">elevated</code> trades the border
          for a lifted shadow.
        </p>
        <ComponentPreview previewClassName="block" code={VARIANTS_CODE}>
          <VariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Ranking</code> forwards all{" "}
          <code className="font-mono text-sm">div</code> props and adds{" "}
          <code className="font-mono text-sm">variant</code> (
          <code className="font-mono text-sm">default | outline | elevated</code>) and{" "}
          <code className="font-mono text-sm">asChild</code>.{" "}
          <code className="font-mono text-sm">RankingList</code> renders an{" "}
          <code className="font-mono text-sm">&lt;ol&gt;</code>;{" "}
          <code className="font-mono text-sm">RankingItem</code> renders an{" "}
          <code className="font-mono text-sm">&lt;li&gt;</code> and adds{" "}
          <code className="font-mono text-sm">interactive</code>.{" "}
          <code className="font-mono text-sm">RankingRank</code> adds{" "}
          <code className="font-mono text-sm">highlight</code> for the leader;{" "}
          <code className="font-mono text-sm">RankingBar</code> takes a{" "}
          <code className="font-mono text-sm">value</code> (0–100). The rest:{" "}
          <code className="font-mono text-sm">RankingHeader</code>,{" "}
          <code className="font-mono text-sm">RankingTitle</code>,{" "}
          <code className="font-mono text-sm">RankingDescription</code>,{" "}
          <code className="font-mono text-sm">RankingAction</code>,{" "}
          <code className="font-mono text-sm">RankingMedia</code>,{" "}
          <code className="font-mono text-sm">RankingContent</code>,{" "}
          <code className="font-mono text-sm">RankingLabel</code>,{" "}
          <code className="font-mono text-sm">RankingMeta</code>,{" "}
          <code className="font-mono text-sm">RankingValue</code>, forward their element props.
          Every part accepts <code className="font-mono text-sm">className</code>, merged last.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Why is RankingList an <ol> and what do I compose inside each row?", a: "RankingList renders a semantic ordered list so assistive tech announces the positions. Each RankingItem (an `<li>`) lays out a RankingRank, optional RankingMedia or an Avatar, a RankingContent (RankingLabel plus RankingMeta), and a RankingValue." },
            { q: "How do I highlight the leader of the list?", a: "Pass `highlight` to the first RankingRank to give it a filled primary chip. On interactive rows the leader chip keeps its primary fill even through the hover wash." },
            { q: "What does the value on RankingBar mean?", a: "RankingBar takes a `value` from 0 to 100 representing each row's share of the leader, so the list reads as a chart. The fill width is a runtime value, so it rides a CSS variable and animates when the data changes." },
            { q: "How do I read the same list as a vertical bar chart?", a: "Set `layout=\"bars\"` on the Ranking root. RankingList becomes a row of full-height columns and each RankingBar grows from the bottom. The columns are narrow, so wrap each RankingItem in a Tooltip for the detail instead of crowding the row." },
            { q: "How do I make rows clickable?", a: "Pass `interactive` to a RankingItem for a pointer, hover wash, and focus ring, then wire `onClick`. Nested surfaces (rank chip, media tile, bar track) step down to the card surface on hover so they keep definition; add a trailing chevron to signal the affordance." },
            { q: "How does variant change the card?", a: "`variant` sets the surface treatment: `default` (border plus soft shadow), `outline` (flat, no shadow), or `elevated` (lifted shadow, no border). Ranking is a dashboard widget, so its spacing is fixed compact, there's no density knob to tune." },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------ code blocks --- */

const SHOWCASE_CODE = `<Ranking>
  <RankingHeader>
    <div className="space-y-1">
      <RankingTitle>Top products</RankingTitle>
      <RankingDescription>By units sold this month</RankingDescription>
    </div>
    <RankingAction>
      <Button variant="outline" size="sm">View all</Button>
    </RankingAction>
  </RankingHeader>

  <RankingList>
    {products.map((p, i) => (
      // Keep the row light; let the detail live in a Tooltip.
      <Tooltip key={p.name} content={<ProductTip p={p} />} variant="graph" placement="right">
        <RankingItem interactive>
          <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
          <RankingMedia><p.icon /></RankingMedia>
          <RankingContent>
            <RankingLabel>{p.name}</RankingLabel>
            <RankingBar value={p.share} />
          </RankingContent>
          <RankingValue>{p.units.toLocaleString()}</RankingValue>
        </RankingItem>
      </Tooltip>
    ))}
  </RankingList>
</Ranking>`

const USAGE_CODE = `import {
  Ranking,
  RankingHeader,
  RankingTitle,
  RankingList,
  RankingItem,
  RankingRank,
  RankingContent,
  RankingLabel,
  RankingValue,
} from "@/components/ui/ranking"

export function TopCategories({ rows }: { rows: { name: string; revenue: string }[] }) {
  return (
    <Ranking>
      <RankingHeader>
        <RankingTitle>Top categories</RankingTitle>
      </RankingHeader>
      <RankingList>
        {rows.map((r, i) => (
          <RankingItem key={r.name}>
            <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
            <RankingContent>
              <RankingLabel>{r.name}</RankingLabel>
            </RankingContent>
            <RankingValue>{r.revenue}</RankingValue>
          </RankingItem>
        ))}
      </RankingList>
    </Ranking>
  )
}`

const SIMPLE_CODE = `<Ranking>
  <RankingHeader>
    <RankingTitle>Top categories</RankingTitle>
  </RankingHeader>
  <RankingList>
    {rows.map((r, i) => (
      <RankingItem key={r.name}>
        <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
        <RankingContent><RankingLabel>{r.name}</RankingLabel></RankingContent>
        <RankingValue>{r.revenue}</RankingValue>
      </RankingItem>
    ))}
  </RankingList>
</Ranking>`

const AVATARS_CODE = `<RankingItem>
  <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
  <Avatar size="sm">
    <AvatarImage src={customer.avatar} alt={customer.name} />
    <AvatarFallback>{initials(customer.name)}</AvatarFallback>
  </Avatar>
  <RankingContent>
    <RankingLabel>{customer.name}</RankingLabel>
    <RankingMeta>{customer.orders} orders</RankingMeta>
  </RankingContent>
  <RankingValue>{customer.spent}</RankingValue>
</RankingItem>`

const BARS_CODE = `<RankingItem>
  <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
  <RankingContent>
    <div className="flex items-baseline justify-between gap-3">
      <RankingLabel>{p.name}</RankingLabel>
      <RankingValue>{p.units.toLocaleString()}</RankingValue>
    </div>
    {/* value is the share of the leader, 0–100 */}
    <RankingBar value={p.share} />
  </RankingContent>
</RankingItem>`

const BARCHART_CODE = `// layout="bars" reads the list as a vertical bar chart.
<Ranking layout="bars">
  <RankingHeader>
    <RankingTitle>Top products</RankingTitle>
    <Badge size="sm" variant="success">+12% MoM</Badge>
  </RankingHeader>
  <RankingList>
    {products.map((p) => (
      // Narrow columns: wrap each bar in a Tooltip for the detail.
      <Tooltip key={p.name} content={<ProductTip p={p} />}>
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
</Ranking>`

const INTERACTIVE_CODE = `<RankingItem interactive onClick={() => openProduct(p.id)}>
  <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
  <RankingMedia><p.icon /></RankingMedia>
  <RankingContent>
    <RankingLabel>{p.name}</RankingLabel>
    <RankingMeta>{p.units.toLocaleString()} units</RankingMeta>
  </RankingContent>
  <CaretRight className="size-4 shrink-0 text-muted-foreground" />
</RankingItem>`

const VARIANTS_CODE = `<Ranking variant="default">…</Ranking>
<Ranking variant="outline">…</Ranking>
<Ranking variant="elevated">…</Ranking>`
