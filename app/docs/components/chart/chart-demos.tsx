"use client"

import * as React from "react"
import { ArrowClockwise } from "@phosphor-icons/react"

import {
  Chart,
  ChartArea,
  ChartAreas,
  ChartLine,
  ChartBar,
  ChartBars,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartReferenceLine,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

/* Shared demo data: peaks and dips (not a monotonic climb) so every chart has shape.
 * `desktop`/`mobile` sit at a comparable scale for the multi-series line; `revenue` and
 * `orders` live alongside them and each demo's `config` picks the keys it plots. */
const MONTHS = [
  { month: "Jan", revenue: 4200, desktop: 2400, mobile: 1800, orders: 240 },
  { month: "Feb", revenue: 3800, desktop: 2900, mobile: 2100, orders: 198 },
  { month: "Mar", revenue: 5100, desktop: 2200, mobile: 2600, orders: 312 },
  { month: "Apr", revenue: 4600, desktop: 3400, mobile: 2300, orders: 277 },
  { month: "May", revenue: 6200, desktop: 3100, mobile: 3200, orders: 388 },
  { month: "Jun", revenue: 5400, desktop: 4200, mobile: 2900, orders: 305 },
  { month: "Jul", revenue: 7100, desktop: 3800, mobile: 3600, orders: 372 },
  { month: "Aug", revenue: 6500, desktop: 4600, mobile: 4100, orders: 410 },
]

const usd = (v: number) => `$${v.toLocaleString()}`

/* Net change per month: crosses zero, so bars rise above the baseline and drop below it. */
const NET = [
  { month: "Jan", net: 12 },
  { month: "Feb", net: -8 },
  { month: "Mar", net: 15 },
  { month: "Apr", net: -4 },
  { month: "May", net: 22 },
  { month: "Jun", net: -11 },
  { month: "Jul", net: 18 },
  { month: "Aug", net: 9 },
]

/* A series with missing readings (null) to show gap handling. */
const SIGNAL = [
  { day: "Mon", signal: 40 },
  { day: "Tue", signal: 52 },
  { day: "Wed", signal: null },
  { day: "Thu", signal: 48 },
  { day: "Fri", signal: 61 },
  { day: "Sat", signal: null },
  { day: "Sun", signal: 70 },
]

/* ----------------------------------------------------------------- showcase --- */

export function ShowcaseDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Monthly revenue"
      config={{ revenue: { label: "Revenue", color: "blue" } }}
      padding={{ bottom: 28, left: 44, top: 12, right: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <ChartArea dataKey="revenue" />
      <ChartLine dataKey="revenue" />
      <ChartXAxis />
      <ChartTooltip valueFormatter={usd} />
    </Chart>
  )
}

/* ---------------------------------------------------------------- animation --- */

/**
 * The load reveal plays once when a chart mounts (the parts only render after the box is measured,
 * so it fires exactly as the chart appears). Bumping a key remounts both charts so you can replay it:
 * the line self-draws while the area rises from the baseline, and the bars grow up from the baseline
 * in a left→right cascade.
 */
export function AnimationDemo() {
  const [runId, setRunId] = React.useState(0)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setRunId((n) => n + 1)}>
          <ArrowClockwise weight="bold" />
          Replay
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Chart
          key={`area-${runId}`}
          data={MONTHS}
          index="month"
          config={{ revenue: { label: "Revenue", color: "blue" } }}
          padding={{ bottom: 28, top: 12, right: 8, left: 8 }}
          className="h-64"
        >
          <ChartGrid />
          <ChartArea dataKey="revenue" />
          <ChartLine dataKey="revenue" />
          <ChartXAxis />
          <ChartTooltip valueFormatter={usd} />
        </Chart>

        <Chart
          key={`bar-${runId}`}
          data={MONTHS}
          index="month"
          config={{ orders: { label: "Orders", color: "blue" } }}
          padding={{ bottom: 28, top: 12, right: 8, left: 8 }}
          className="h-64"
        >
          <ChartGrid />
          <ChartBar dataKey="orders" />
          <ChartXAxis />
          <ChartTooltip />
        </Chart>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- line --- */

export function LineDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Desktop vs. mobile visitors by month"
      config={{
        desktop: { label: "Desktop", color: "blue" },
        mobile: { label: "Mobile", color: "teal" },
      }}
      padding={{ bottom: 28, left: 40, top: 12, right: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis />
      <ChartLine dataKey="desktop" />
      <ChartLine dataKey="mobile" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* --------------------------------------------------------------------- area --- */

export function AreaDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Monthly revenue"
      config={{ revenue: { label: "Revenue", color: "blue" } }}
      padding={{ bottom: 28, top: 12, right: 8, left: 8 }}
      className="h-64"
    >
      <ChartGrid />
      <ChartArea dataKey="revenue" />
      <ChartLine dataKey="revenue" />
      <ChartXAxis />
      <ChartTooltip valueFormatter={usd} />
    </Chart>
  )
}

/* ---------------------------------------------------------------------- bar --- */

export function BarDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Orders by month"
      config={{ orders: { label: "Orders", color: "blue" } }}
      padding={{ bottom: 28, left: 36, top: 12, right: 8 }}
      className="h-64"
    >
      <ChartGrid />
      <ChartYAxis />
      <ChartBar dataKey="orders" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* ---------------------------------------------------------------- negatives --- */

export function NegativeDemo() {
  return (
    <Chart
      data={NET}
      index="month"
      label="Net change by month"
      config={{ net: { label: "Net change", color: "blue" } }}
      padding={{ bottom: 28, left: 36, top: 12, right: 8 }}
      className="h-64"
    >
      <ChartGrid />
      <ChartYAxis />
      <ChartBar dataKey="net" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* ----------------------------------------------------------------- forecast --- */

/* Actuals through Jun, then a projection: the two series share the Jun point so the solid line and
 * the dashed continuation meet seamlessly. */
const TREND = [
  { month: "Jan", actual: 4200, projected: null },
  { month: "Feb", actual: 4600, projected: null },
  { month: "Mar", actual: 5100, projected: null },
  { month: "Apr", actual: 4800, projected: null },
  { month: "May", actual: 5600, projected: null },
  { month: "Jun", actual: 6100, projected: 6100 },
  { month: "Jul", actual: null, projected: 6700 },
  { month: "Aug", actual: null, projected: 7200 },
]

export function ForecastDemo() {
  return (
    <Chart
      data={TREND}
      index="month"
      label="Revenue with projection"
      config={{
        actual: { label: "Actual", color: "blue", format: usd },
        projected: { label: "Projected", color: "blue", format: usd },
      }}
      padding={{ bottom: 28, left: 44, top: 12, right: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <ChartLine dataKey="actual" markEnd />
      <ChartLine dataKey="projected" dashed />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* ---------------------------------------------------------------- dual axis --- */

export function DualAxisDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Revenue and orders by month"
      config={{
        revenue: { label: "Revenue", color: "blue", format: (v) => `$${v.toLocaleString()}`, axis: "left" },
        orders: { label: "Orders", color: "teal", axis: "right" },
      }}
      padding={{ bottom: 28, left: 48, right: 44, top: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <ChartYAxis side="right" />
      <ChartLine dataKey="revenue" />
      <ChartLine dataKey="orders" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* ---------------------------------------------------------------- reference --- */

export function ReferenceDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      label="Monthly revenue against target"
      config={{ revenue: { label: "Revenue", color: "blue" } }}
      padding={{ bottom: 28, left: 44, top: 16, right: 12 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <ChartArea dataKey="revenue" />
      <ChartLine dataKey="revenue" />
      {/* Drawn after the data so it annotates on top. */}
      <ChartReferenceLine y={5000} label="Target $5k" color="destructive" />
      <ChartXAxis />
      <ChartTooltip valueFormatter={usd} />
    </Chart>
  )
}

/* ------------------------------------------------------------------- legend --- */

const VISITORS_CONFIG = {
  desktop: { label: "Desktop", color: "blue" as const },
  mobile: { label: "Mobile", color: "teal" as const },
}

export function LegendDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <ChartLegend config={VISITORS_CONFIG} align="end" />
      <Chart
        data={MONTHS}
        index="month"
        label="Desktop vs. mobile visitors by month"
        config={VISITORS_CONFIG}
        padding={{ bottom: 28, left: 40, top: 12, right: 12 }}
        className="h-72"
      >
        <ChartGrid />
        <ChartYAxis />
        <ChartLine dataKey="desktop" />
        <ChartLine dataKey="mobile" />
        <ChartXAxis />
        <ChartTooltip />
      </Chart>
    </div>
  )
}

/* -------------------------------------------------------------- stacked area --- */

export function AreaStackDemo() {
  return (
    <Chart
      data={MONTHS}
      index="month"
      stack
      label="Desktop vs. mobile visitors, stacked"
      config={{
        desktop: { label: "Desktop", color: "blue" },
        mobile: { label: "Mobile", color: "teal" },
      }}
      padding={{ bottom: 28, left: 40, top: 12, right: 8 }}
      className="h-72"
    >
      <ChartGrid />
      <ChartYAxis />
      <ChartAreas keys={["desktop", "mobile"]} />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  )
}

/* ---------------------------------------------------------- grouped/stacked --- */

export function BarSeriesDemo() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      {[
        { label: "Grouped", stack: false },
        { label: "Stacked", stack: true },
      ].map((v) => (
        <div key={v.label} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{v.label}</p>
          <Chart
            data={MONTHS}
            index="month"
            stack={v.stack}
            label={`Desktop vs. mobile visitors (${v.label.toLowerCase()})`}
            config={{
              desktop: { label: "Desktop", color: "blue" },
              mobile: { label: "Mobile", color: "teal" },
            }}
            padding={{ bottom: 28, left: 40, top: 12, right: 8 }}
            className="h-64"
          >
            <ChartGrid />
            <ChartYAxis />
            <ChartBars keys={["desktop", "mobile"]} />
            <ChartXAxis />
            <ChartTooltip />
          </Chart>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------------- gaps --- */

export function GapsDemo() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      {[
        { label: "Default: line breaks at gaps", connect: false },
        { label: "connectNulls: bridged", connect: true },
      ].map((v) => (
        <div key={v.label} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{v.label}</p>
          <Chart
            data={SIGNAL}
            index="day"
            config={{ signal: { label: "Signal", color: "blue" } }}
            padding={{ bottom: 28, left: 32, top: 12, right: 8 }}
            className="h-56"
          >
            <ChartGrid />
            <ChartYAxis />
            <ChartArea dataKey="signal" connectNulls={v.connect} />
            <ChartLine dataKey="signal" connectNulls={v.connect} />
            <ChartXAxis />
            <ChartTooltip />
          </Chart>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------- states --- */

export function StatesDemo() {
  const common = {
    data: MONTHS,
    index: "month",
    config: { revenue: { label: "Revenue", color: "blue" as const } },
    padding: { bottom: 24, top: 12, right: 8, left: 8 },
    className: "h-44",
  }
  return (
    <div className="grid w-full gap-6 sm:grid-cols-3">
      {[
        { label: "With data", node: (
          <Chart {...common}>
            <ChartGrid />
            <ChartArea dataKey="revenue" />
            <ChartLine dataKey="revenue" />
            <ChartXAxis />
          </Chart>
        ) },
        { label: "Loading", node: <Chart {...common} loading /> },
        { label: "Empty", node: <Chart {...common} data={[]} /> },
      ].map((s) => (
        <div key={s.label} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
          {s.node}
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- sparkline --- */

export function SparklineDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {[
        { label: "Revenue", color: "text-success", data: [31, 40, 28, 51, 42, 60, 58, 71] },
        { label: "Sessions", color: "text-info", data: [12, 19, 14, 17, 22, 20, 27, 31] },
        { label: "Refunds", color: "text-destructive", data: [9, 8, 11, 7, 8, 6, 5, 4] },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
          <Chart data={s.data} sparkline className={`mt-3 h-12 ${s.color}`}>
            <ChartArea />
            <ChartLine />
            <ChartTooltip labelFormatter={(i) => `Point ${i}`} />
          </Chart>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------- colors --- */

export function ColorsDemo() {
  const series: { key: string; color: "blue" | "teal" | "purple" | "orange" | "pink" }[] = [
    { key: "blue", color: "blue" },
    { key: "teal", color: "teal" },
    { key: "purple", color: "purple" },
    { key: "orange", color: "orange" },
    { key: "pink", color: "pink" },
  ]
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {series.map((s) => (
        <div key={s.key} className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-sm font-medium capitalize text-muted-foreground">{s.color}</p>
          <Chart data={[8, 14, 10, 18, 15, 24, 21, 30]} sparkline className="mt-3 h-12">
            <ChartArea color={s.color} />
            <ChartLine color={s.color} />
          </Chart>
        </div>
      ))}
    </div>
  )
}
