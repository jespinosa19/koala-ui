import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ShowcaseDemo,
  AnimationDemo,
  LineDemo,
  AreaDemo,
  BarDemo,
  BarSeriesDemo,
  AreaStackDemo,
  LegendDemo,
  DualAxisDemo,
  ForecastDemo,
  ReferenceDemo,
  NegativeDemo,
  GapsDemo,
  StatesDemo,
  SparklineDemo,
  ColorsDemo,
} from "./chart-demos"

export const metadata = { title: "Chart" }

export default function ChartDocsPage() {
  return (
    <>
      <DocHeader
        title="Chart"
        description="A dependency-free plotting primitive for line, area, and bar trends. Compose the named parts (grid, axes, series, tooltip) into one measured SVG. Series paint from semantic hues, so every chart themes across all four palettes, and hover is delegated to Koala's own gliding Tooltip."
      />

      <ComponentPreview previewClassName="block" code={SHOWCASE_CODE}>
        <ShowcaseDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="chart"
          dependencies="npm install tailwind-variants tailwind-merge tippy.js"
        />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Chart</code> is composed from named parts, like{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a>. The root
          takes the <code className="font-mono text-sm">data</code>, an optional{" "}
          <code className="font-mono text-sm">index</code> key for category labels, and a{" "}
          <code className="font-mono text-sm">config</code> that names each series&rsquo; label and
          color. The parts (<code className="font-mono text-sm">ChartGrid</code>,{" "}
          <code className="font-mono text-sm">ChartArea</code>,{" "}
          <code className="font-mono text-sm">ChartLine</code>,{" "}
          <code className="font-mono text-sm">ChartTooltip</code>) read it from context and draw
          into one shared, pixel-measured SVG.
        </p>
        <CodeSnippet filename="revenue-chart.tsx" className="mt-4" code={USAGE_CODE} />
      </DocSection>

      <DocSection title="Load animation">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every chart plays a one-shot reveal the first time it mounts: the{" "}
          <code className="font-mono text-sm">ChartLine</code> self-draws left to right, the{" "}
          <code className="font-mono text-sm">ChartArea</code> fill rises from the baseline, and each{" "}
          <code className="font-mono text-sm">ChartBar</code> grows up from the zero line in a
          left-to-right cascade. It fires once, never on hover or re-sort, and honors{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code> (every layer simply
          appears drawn). Pass <code className="font-mono text-sm">animate={`{false}`}</code> on the{" "}
          <code className="font-mono text-sm">Chart</code> root to opt out. Press{" "}
          <span className="font-medium">Replay</span> to watch it again.
        </p>
        <ComponentPreview previewClassName="block" code={ANIMATION_CODE}>
          <AnimationDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Line">
        <p className="mt-4 text-pretty text-muted-foreground">
          Layer a <code className="font-mono text-sm">ChartLine</code> per series; each resolves its
          hue from <code className="font-mono text-sm">config</code>, or takes an explicit{" "}
          <code className="font-mono text-sm">color</code>. The shared{" "}
          <code className="font-mono text-sm">ChartTooltip</code> lists every series at the hovered
          category, and a crosshair tracks the active point.
        </p>
        <ComponentPreview previewClassName="block" code={LINE_CODE}>
          <LineDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Area">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartArea</code> fills the space under the trend with a{" "}
          <code className="font-mono text-sm">currentColor</code> gradient that fades to the baseline,
          so the wash is just the series hue at low opacity: a{" "}
          <code className="font-mono text-sm">blue</code> line yields a soft blue-100/200 fill. Pair it
          with a <code className="font-mono text-sm">ChartLine</code> for a crisp edge.
        </p>
        <ComponentPreview previewClassName="block" code={AREA_CODE}>
          <AreaDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Missing data">
        <p className="mt-4 text-pretty text-muted-foreground">
          A point with a non-numeric (or absent) value is a gap. By default the{" "}
          <code className="font-mono text-sm">ChartLine</code> and{" "}
          <code className="font-mono text-sm">ChartArea</code> <strong>break</strong> at the gap, so a
          dropout reads honestly. Pass{" "}
          <code className="font-mono text-sm">connectNulls</code> to bridge across it instead.
        </p>
        <ComponentPreview previewClassName="block" code={GAPS_CODE}>
          <GapsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Bar">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartBar</code> draws a rounded bar per category from a
          0-anchored baseline. Hovering a column brings it forward and dims the rest, so the active
          value reads at a glance.
        </p>
        <ComponentPreview previewClassName="block" code={BAR_CODE}>
          <BarDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Grouped & stacked bars">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartBars</code> draws several bar series in one band.
          By default they render <strong>grouped</strong> side by side; set{" "}
          <code className="font-mono text-sm">stack</code> on{" "}
          <code className="font-mono text-sm">Chart</code> to <strong>stack</strong> them, and the
          y-axis grows to the per-category total automatically. Each series takes its hue from{" "}
          <code className="font-mono text-sm">config</code>.
        </p>
        <ComponentPreview previewClassName="block" code={BAR_SERIES_CODE}>
          <BarSeriesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Stacked area">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartAreas</code> stacks several area series into a band
          chart when <code className="font-mono text-sm">stack</code> is set on{" "}
          <code className="font-mono text-sm">Chart</code>: each series sits on the cumulative total
          below it, with a more opaque fill so the bands read apart, and every band carries its own
          edge line. Without <code className="font-mono text-sm">stack</code> the series overlap from
          the baseline.
        </p>
        <ComponentPreview previewClassName="block" code={AREA_STACK_CODE}>
          <AreaStackDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Legend">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartLegend</code> is a standalone key for multi-series
          charts. It lives outside the SVG, so place it above or below the{" "}
          <code className="font-mono text-sm">Chart</code> and feed it the same{" "}
          <code className="font-mono text-sm">config</code> (or explicit{" "}
          <code className="font-mono text-sm">items</code>). Each swatch resolves its hue exactly like
          the chart, palette fallback included.
        </p>
        <ComponentPreview previewClassName="block" code={LEGEND_CODE}>
          <LegendDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dual axis & per-series format">
        <p className="mt-4 text-pretty text-muted-foreground">
          Give a series <code className="font-mono text-sm">axis: &quot;right&quot;</code> in{" "}
          <code className="font-mono text-sm">config</code> to scale it against a secondary y-axis (so
          two metrics at different magnitudes share one chart), and render a second{" "}
          <code className="font-mono text-sm">ChartYAxis</code> with{" "}
          <code className="font-mono text-sm">side=&quot;right&quot;</code>. Each series can also carry
          its own <code className="font-mono text-sm">format</code>, so the tooltip shows, say, currency
          for revenue and a plain count for orders.
        </p>
        <ComponentPreview previewClassName="block" code={DUAL_AXIS_CODE}>
          <DualAxisDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forecast & end marker">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartLine</code> takes{" "}
          <code className="font-mono text-sm">dashed</code> for projected data and{" "}
          <code className="font-mono text-sm">markEnd</code> to pin a filled dot on the last point (a
          &ldquo;current value&rdquo; marker). Split actuals and projection into two series that share
          the seam point, and the solid line meets its dashed continuation cleanly.
        </p>
        <ComponentPreview previewClassName="block" code={FORECAST_CODE}>
          <ForecastDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Reference lines">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ChartReferenceLine</code> draws a horizontal threshold
          (<code className="font-mono text-sm">y</code>) or vertical marker (
          <code className="font-mono text-sm">x</code>) across the plot, with an optional{" "}
          <code className="font-mono text-sm">label</code>. Compose it after the data so it annotates
          on top, for a target, limit, or average. It defaults to a muted dashed line; pass a{" "}
          <code className="font-mono text-sm">color</code> to emphasize it.
        </p>
        <ComponentPreview previewClassName="block" code={REFERENCE_CODE}>
          <ReferenceDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Negative values">
        <p className="mt-4 text-pretty text-muted-foreground">
          The domain anchors to zero, and bars and areas grow from the{" "}
          <strong>value baseline</strong> (the y-zero line), so positive values rise above it and
          negative values drop below. No extra config: pass data that crosses zero and it reads
          correctly.
        </p>
        <ComponentPreview previewClassName="block" code={NEGATIVE_CODE}>
          <NegativeDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sparkline">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">sparkline</code> for a chromeless trend: zero
          padding (it bleeds to the edge), points spanning the full width, and{" "}
          <code className="font-mono text-sm">currentColor</code> so a single{" "}
          <code className="font-mono text-sm">text-*</code> utility sets the hue. This is exactly what{" "}
          <a href="/docs/components/stat" className="underline underline-offset-4">StatSparkline</a>{" "}
          renders under the hood.
        </p>
        <ComponentPreview previewClassName="block" code={SPARKLINE_CODE}>
          <SparklineDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Colors">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every series takes a semantic hue: <code className="font-mono text-sm">blue</code> (the
          default), <code className="font-mono text-sm">teal</code>,{" "}
          <code className="font-mono text-sm">purple</code>,{" "}
          <code className="font-mono text-sm">orange</code>,{" "}
          <code className="font-mono text-sm">pink</code>, the status roles, or{" "}
          <code className="font-mono text-sm">current</code> to inherit the ambient color. Series
          without a color fall back to a rotating palette led by{" "}
          <code className="font-mono text-sm">blue</code>.
        </p>
        <ComponentPreview previewClassName="block" code={COLORS_CODE}>
          <ColorsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Loading & empty">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">loading</code> to render a Skeleton in place of the
          plot (it also sets <code className="font-mono text-sm">aria-busy</code>). When{" "}
          <code className="font-mono text-sm">data</code> is empty, the chart shows a muted message;
          override it with the <code className="font-mono text-sm">empty</code> prop.
        </p>
        <ComponentPreview previewClassName="block" code={STATES_CODE}>
          <StatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Accessibility">
        <p className="mt-4 text-pretty text-muted-foreground">
          The SVG is decorative (<code className="font-mono text-sm">aria-hidden</code>): pixels do not
          read well to a screen reader. Instead, every full chart renders a{" "}
          <strong>visually-hidden data table</strong> as its accessible equivalent, so assistive tech
          gets the real numbers, row by row. Pass{" "}
          <code className="font-mono text-sm">label</code> to name the chart, it becomes the
          table&rsquo;s caption. <code className="font-mono text-sm">loading</code> sets{" "}
          <code className="font-mono text-sm">aria-busy</code>. Sparklines stay decorative (no table),
          since they are labelled by their surrounding context, like a{" "}
          <a href="/docs/components/stat" className="underline underline-offset-4">Stat</a>&rsquo;s
          value.
        </p>
        <CodeSnippet filename="accessible-chart.tsx" className="mt-4" code={A11Y_CODE} />
      </DocSection>

      <DocSection title="API reference">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Chart</code> takes{" "}
          <code className="font-mono text-sm">data</code> (an array of rows, or a bare{" "}
          <code className="font-mono text-sm">number[]</code>),{" "}
          <code className="font-mono text-sm">index</code>,{" "}
          <code className="font-mono text-sm">config</code>,{" "}
          <code className="font-mono text-sm">domain</code>,{" "}
          <code className="font-mono text-sm">sparkline</code>,{" "}
          <code className="font-mono text-sm">stack</code> (stack multi-series bars and size the domain
          to the total),{" "}
          <code className="font-mono text-sm">padding</code>,{" "}
          <code className="font-mono text-sm">animate</code> (the load reveal, on by default),{" "}
          <code className="font-mono text-sm">crosshair</code> (the hover tracking line, which paints
          behind the data so the trend stays on top; defaults on for full charts, off for sparklines),{" "}
          <code className="font-mono text-sm">loading</code>,{" "}
          <code className="font-mono text-sm">empty</code>, and{" "}
          <code className="font-mono text-sm">label</code> (accessible name + data-table caption), and
          forwards <code className="font-mono text-sm">div</code> props. The series parts ({" "}
          <code className="font-mono text-sm">ChartLine</code>,{" "}
          <code className="font-mono text-sm">ChartArea</code>,{" "}
          <code className="font-mono text-sm">ChartBar</code>) take a{" "}
          <code className="font-mono text-sm">dataKey</code> and optional{" "}
          <code className="font-mono text-sm">color</code>;{" "}
          <code className="font-mono text-sm">ChartLine</code> and{" "}
          <code className="font-mono text-sm">ChartArea</code> also take{" "}
          <code className="font-mono text-sm">connectNulls</code>;{" "}
          <code className="font-mono text-sm">ChartLine</code> adds{" "}
          <code className="font-mono text-sm">dashed</code> and{" "}
          <code className="font-mono text-sm">markEnd</code>.{" "}
          <code className="font-mono text-sm">ChartBars</code> and{" "}
          <code className="font-mono text-sm">ChartAreas</code> draw several bar / area series
          (grouped, or stacked when <code className="font-mono text-sm">stack</code> is set) from a{" "}
          <code className="font-mono text-sm">keys</code> list.{" "}
          <code className="font-mono text-sm">ChartGrid</code>,{" "}
          <code className="font-mono text-sm">ChartXAxis</code>, and{" "}
          <code className="font-mono text-sm">ChartYAxis</code> (with{" "}
          <code className="font-mono text-sm">side=&quot;right&quot;</code> for the secondary axis) are
          the chrome; per-series <code className="font-mono text-sm">config</code> entries take{" "}
          <code className="font-mono text-sm">format</code> and{" "}
          <code className="font-mono text-sm">axis</code>;{" "}
          <code className="font-mono text-sm">ChartReferenceLine</code> adds a{" "}
          <code className="font-mono text-sm">y</code>/<code className="font-mono text-sm">x</code>{" "}
          threshold with an optional <code className="font-mono text-sm">label</code>;{" "}
          <code className="font-mono text-sm">ChartTooltip</code> adds the hover bubble with{" "}
          <code className="font-mono text-sm">valueFormatter</code> and{" "}
          <code className="font-mono text-sm">labelFormatter</code>; and{" "}
          <code className="font-mono text-sm">ChartLegend</code> is a standalone key (place it outside
          the chart, fed the same <code className="font-mono text-sm">config</code>). Every part accepts{" "}
          <code className="font-mono text-sm">className</code>, merged last.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do the series parts know which values to draw?", a: "Each series part takes a dataKey that names the field in your data rows, for example ChartLine dataKey=\"revenue\". The part resolves its hue from the matching config entry, or you can pass an explicit color." },
            { q: "When do I need an index prop?", a: "Pass index when your data is an array of objects and you want category labels on the x-axis, for example index=\"month\". A bare number[] needs no index, which is the typical sparkline case." },
            { q: "How do I make a chromeless inline trend?", a: "Pass sparkline on Chart. It zeroes the padding so the plot bleeds to the edge, spans the points across the full width, and paints in currentColor so a single text-* utility sets the hue. StatSparkline is just a thin wrapper over this." },
            { q: "How do I format the tooltip and axis values?", a: "ChartTooltip takes valueFormatter and labelFormatter, and ChartYAxis takes tickFormatter, so you can render currency or compact units. For per-series formatting, give a config entry its own format function, which the tooltip uses over the shared valueFormatter." },
            { q: "Can two series use different scales (dual axis)?", a: "Yes. Give a series axis: \"right\" in config to scale it against a secondary y-axis, and render a second ChartYAxis with side=\"right\". It is the right call for two metrics at very different magnitudes, like revenue and order count on one chart." },
            { q: "How do I show a forecast or a current-value dot?", a: "ChartLine takes dashed for projected data (it renders dashed and skips the self-draw) and markEnd to pin a filled dot on the last point. Split actuals and projection into two series that share the seam point so the solid line meets the dashed continuation cleanly." },
            { q: "How does the hover crosshair stack with the data?", a: "The crosshair is owned by the Chart root and paints behind the grid, area, line, and markers, so the trend always reads on top of the tracking line (the area fades to transparent, so the crosshair still shows through). It is on by default for full charts and off for sparklines; toggle it with the crosshair prop on Chart." },
            { q: "Will my chart re-theme across the four palettes?", a: "Yes. Series take semantic hues like blue, teal, purple, orange, and pink (or current to inherit the ambient color), so every chart re-themes across all four palettes. Series with no color fall back to a rotating palette led by blue." },
            { q: "Why layer ChartArea and ChartLine separately?", a: "They are independent parts reading the same measured SVG from context, so you compose the look you want: ChartArea fills under the trend with a fading gradient, and ChartLine adds a crisp edge on top." },
            { q: "How are negative values and missing data handled?", a: "The domain anchors to zero and bars/areas grow from the y-zero baseline, so negative values render below it with no extra config. Missing points (a non-numeric or absent value) break the line and area by default so dropouts read honestly; pass connectNulls on ChartLine/ChartArea to bridge across them." },
            { q: "How do I show multiple bar series, grouped or stacked?", a: "Use ChartBars with a keys list. By default the series render grouped side by side; set stack on Chart to stack them, which also grows the y-axis to the per-category total. ChartBar stays the simple single-series option. The same applies to ChartAreas for stacked area bands." },
            { q: "Where does the legend go?", a: "ChartLegend is a standalone HTML key, so it lives outside the SVG. Place it above or below the Chart and pass it the same config (or explicit items); each swatch resolves its hue exactly like the chart, palette fallback included." },
            { q: "How do I draw a target or threshold line?", a: "Use ChartReferenceLine with y for a horizontal threshold (or x for a vertical marker) and an optional label. Compose it after the data parts so it annotates on top; it is a muted dashed line by default, and a color prop emphasizes it (e.g. destructive for a limit)." },
            { q: "Why does the y-axis go a bit above my largest value?", a: "Full charts round the domain to nice bounds and a 1/2/5 tick step (for example a max of 7,100 extends the axis to 8,000 with ticks at 0, 2k, 4k, 6k, 8k). Grid lines and y-axis labels share that one tick set, so they always align. Sparklines and an explicit domain skip the rounding." },
            { q: "What shows while data is loading or empty?", a: "Pass loading on Chart for a Skeleton placeholder (it also sets aria-busy). With empty data the chart shows a muted message you can replace via the empty prop." },
            { q: "How accessible is the chart to screen readers?", a: "The SVG is aria-hidden (pixels do not read well), and every full chart renders a visually-hidden data table as its accessible equivalent, so assistive tech reads the real values row by row. Pass label to name the chart; it captions that table. Sparklines stay decorative since they are labelled by their context, like a Stat's value." },
            { q: "Can I turn off the load animation?", a: "Pass animate={false} on the Chart root. By default every chart plays a one-shot reveal on mount (the line draws, the area rises, bars grow from the baseline). It fires once, not on hover or re-sort, and is held static under prefers-reduced-motion, so opting out is rarely needed." },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------ code blocks --- */

const SHOWCASE_CODE = `<Chart
  data={revenue}
  index="month"
  config={{ revenue: { label: "Revenue", color: "blue" } }}
  padding={{ bottom: 28, left: 44, top: 12, right: 12 }}
  className="h-72"
>
  <ChartGrid />
  <ChartYAxis tickFormatter={(v) => \`$\${(v / 1000).toFixed(0)}k\`} />
  <ChartArea dataKey="revenue" />
  <ChartLine dataKey="revenue" />
  <ChartXAxis />
  <ChartTooltip valueFormatter={(v) => \`$\${v.toLocaleString()}\`} />
</Chart>`

const USAGE_CODE = `import {
  Chart,
  ChartGrid,
  ChartArea,
  ChartLine,
  ChartXAxis,
  ChartTooltip,
} from "@/components/ui/chart"

const revenue = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 4600 },
  // …
]

export function RevenueChart() {
  return (
    <Chart
      data={revenue}
      index="month"
      config={{ revenue: { label: "Revenue", color: "blue" } }}
      padding={{ bottom: 28, top: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartArea dataKey="revenue" />
      <ChartLine dataKey="revenue" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}`

const ANIMATION_CODE = `// The load reveal is on by default: the line draws, the area rises,
// and bars grow from the baseline. Pass animate={false} to opt out.
<Chart data={months} index="month"
  config={{ revenue: { label: "Revenue", color: "blue" } }}
  padding={{ bottom: 28, top: 12 }} className="h-64">
  <ChartGrid />
  <ChartArea dataKey="revenue" />
  <ChartLine dataKey="revenue" />
  <ChartXAxis />
  <ChartTooltip valueFormatter={(v) => \`$\${v.toLocaleString()}\`} />
</Chart>`

const LINE_CODE = `<Chart
  data={months}
  index="month"
  config={{
    desktop: { label: "Desktop", color: "blue" },
    mobile: { label: "Mobile", color: "teal" },
  }}
  padding={{ bottom: 28, left: 40, top: 12 }}
  className="h-72"
>
  <ChartGrid />
  <ChartYAxis />
  <ChartLine dataKey="desktop" />
  <ChartLine dataKey="mobile" />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const AREA_CODE = `<Chart data={months} index="month"
  config={{ revenue: { label: "Revenue", color: "blue" } }}
  padding={{ bottom: 28, top: 12 }} className="h-64">
  <ChartGrid />
  <ChartArea dataKey="revenue" />
  <ChartLine dataKey="revenue" />
  <ChartXAxis />
  <ChartTooltip valueFormatter={(v) => \`$\${v.toLocaleString()}\`} />
</Chart>`

const BAR_CODE = `<Chart data={months} index="month"
  config={{ orders: { label: "Orders", color: "blue" } }}
  padding={{ bottom: 28, left: 36, top: 12 }} className="h-64">
  <ChartGrid />
  <ChartYAxis />
  <ChartBar dataKey="orders" />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const BAR_SERIES_CODE = `// Grouped (default): series sit side by side.
<Chart data={months} index="month"
  config={{ desktop: { color: "blue" }, mobile: { color: "teal" } }} className="h-64">
  <ChartGrid />
  <ChartYAxis />
  <ChartBars keys={["desktop", "mobile"]} />
  <ChartXAxis />
  <ChartTooltip />
</Chart>

// Stacked: add "stack" on Chart; the y-axis covers the per-category total.
<Chart data={months} index="month" stack
  config={{ desktop: { color: "blue" }, mobile: { color: "teal" } }} className="h-64">
  <ChartGrid />
  <ChartYAxis />
  <ChartBars keys={["desktop", "mobile"]} />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const FORECAST_CODE = `// Two series share the Jun point, so solid meets dashed seamlessly.
const trend = [
  { month: "May", actual: 5600, projected: null },
  { month: "Jun", actual: 6100, projected: 6100 },
  { month: "Jul", actual: null, projected: 6700 },
]

<Chart data={trend} index="month"
  config={{ actual: { color: "blue" }, projected: { color: "blue" } }} className="h-72">
  <ChartGrid />
  <ChartYAxis />
  <ChartLine dataKey="actual" markEnd />
  <ChartLine dataKey="projected" dashed />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const DUAL_AXIS_CODE = `<Chart data={months} index="month"
  config={{
    revenue: { label: "Revenue", color: "blue", axis: "left",
               format: (v) => \`$\${v.toLocaleString()}\` },
    orders:  { label: "Orders", color: "teal", axis: "right" },
  }}
  padding={{ bottom: 28, left: 48, right: 44, top: 12 }} className="h-72">
  <ChartGrid />
  <ChartYAxis tickFormatter={(v) => \`$\${(v / 1000).toFixed(0)}k\`} />
  <ChartYAxis side="right" />
  <ChartLine dataKey="revenue" />
  <ChartLine dataKey="orders" />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const REFERENCE_CODE = `<Chart data={revenue} index="month"
  config={{ revenue: { label: "Revenue", color: "blue" } }} className="h-72">
  <ChartGrid />
  <ChartYAxis tickFormatter={(v) => \`$\${(v / 1000).toFixed(0)}k\`} />
  <ChartArea dataKey="revenue" />
  <ChartLine dataKey="revenue" />
  {/* after the data => annotates on top */}
  <ChartReferenceLine y={5000} label="Target $5k" color="destructive" />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const LEGEND_CODE = `const config = {
  desktop: { label: "Desktop", color: "blue" },
  mobile: { label: "Mobile", color: "teal" },
}

<div className="flex flex-col gap-3">
  <ChartLegend config={config} align="end" />
  <Chart data={months} index="month" config={config} className="h-72">
    <ChartGrid />
    <ChartYAxis />
    <ChartLine dataKey="desktop" />
    <ChartLine dataKey="mobile" />
    <ChartXAxis />
    <ChartTooltip />
  </Chart>
</div>`

const AREA_STACK_CODE = `// Stacked band chart: "stack" on Chart + ChartAreas.
<Chart data={months} index="month" stack
  config={{ desktop: { color: "blue" }, mobile: { color: "teal" } }} className="h-72">
  <ChartGrid />
  <ChartYAxis />
  <ChartAreas keys={["desktop", "mobile"]} />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const NEGATIVE_CODE = `// net crosses zero; bars grow up/down from the y-zero baseline.
const net = [{ month: "Jan", net: 12 }, { month: "Feb", net: -8 }, /* … */]

<Chart data={net} index="month"
  config={{ net: { label: "Net change", color: "blue" } }}
  padding={{ bottom: 28, left: 36, top: 12 }} className="h-64">
  <ChartGrid />
  <ChartYAxis />
  <ChartBar dataKey="net" />
  <ChartXAxis />
  <ChartTooltip />
</Chart>`

const GAPS_CODE = `// Rows with a missing "signal" key are gaps.
const signal = [
  { day: "Mon", signal: 40 },
  { day: "Tue", signal: 52 },
  { day: "Wed" }, // gap → line breaks here
  { day: "Thu", signal: 48 },
]

<Chart data={signal} index="day" config={{ signal: { color: "blue" } }} className="h-56">
  <ChartGrid />
  <ChartArea dataKey="signal" />          {/* break at gaps (default) */}
  <ChartLine dataKey="signal" />
  {/* …or bridge across them: */}
  <ChartLine dataKey="signal" connectNulls />
</Chart>`

const STATES_CODE = `// Loading: a Skeleton replaces the plot (and sets aria-busy).
<Chart data={revenue} loading className="h-44" />

// Empty: a muted message; override with the "empty" prop.
<Chart data={[]} className="h-44" />
<Chart data={[]} empty={<MyEmptyState />} className="h-44" />`

const A11Y_CODE = `// "label" names the chart and captions the visually-hidden data table
// that screen readers read in place of the (aria-hidden) SVG.
<Chart data={revenue} index="month" label="Monthly revenue"
  config={{ revenue: { label: "Revenue", color: "blue" } }} className="h-72">
  <ChartGrid />
  <ChartArea dataKey="revenue" />
  <ChartLine dataKey="revenue" />
  <ChartXAxis />
  <ChartTooltip valueFormatter={(v) => \`$\${v.toLocaleString()}\`} />
</Chart>`

const SPARKLINE_CODE = `// Chromeless: zero padding, full-width points, currentColor.
// Sparklines drop the crosshair automatically (crosshair defaults off).
<Chart data={[31, 40, 28, 51, 42, 60, 58, 71]} sparkline className="h-12 text-success">
  <ChartArea />
  <ChartLine />
  <ChartTooltip />
</Chart>`

const COLORS_CODE = `// Per-series hue via the "color" prop (or resolved from "config"); blue is the default.
<Chart data={trend} sparkline className="h-12">
  <ChartArea color="blue" />
  <ChartLine color="blue" />
</Chart>`
