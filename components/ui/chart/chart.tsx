"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv } from "@/lib/tv"
import { duration } from "@/lib/motion"
import { Tooltip, TooltipGroup } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Chart: a small, dependency-free plotting primitive for line / area / bar trends.
 * It's a multi-part component built like Card: the `Chart` root owns the data, the
 * series config, and the measured geometry, and the parts (`ChartGrid`, `ChartArea`,
 * `ChartLine`, `ChartBar`, `ChartXAxis`, `ChartYAxis`, `ChartTooltip`)
 * read it from React Context and draw into one shared, pixel-measured `<svg>`.
 *
 * Everything paints from tokens: series take a semantic hue (`primary`, `teal`,
 * `purple`, …) resolved to a `currentColor` so the stroke, fill gradient and dots
 * theme across all four palettes for free. There is no chart library underneath:
 * just `<path>`/`<rect>` math, the same hand-rolled approach as Calendar (native Date).
 *
 * Hover is delegated to Koala's own {@link Tooltip}: a full-height transparent band
 * per category becomes a tooltip trigger, wrapped in a {@link TooltipGroup} so one
 * bubble *glides* across the columns while a crosshair tracks the active point.
 * See docs/ARCHITECTURE.md.
 */
export const chartVariants = tv({
  slots: {
    // Geometry comes from measuring this box, so it must carry the height utility.
    root: "relative w-full text-foreground",
    // overflow-visible lets edge dots and the last x-axis label spill past the plot.
    svg: "absolute inset-0 size-full overflow-visible",
    // The hover bubble's inner column (label on top, one row per series below).
    tooltip: "flex flex-col gap-1.5 tabular-nums",
  },
})

/* ------------------------------------------------------------------- colors --- */

/** The semantic hues a series can take. `current` inherits the ambient `currentColor`
 *  (set with a `text-*` utility). That's how the chromeless Stat sparkline themes. */
export type ChartColor =
  | "current"
  | "blue"
  | "primary"
  | "purple"
  | "pink"
  | "teal"
  | "orange"
  | "success"
  | "warning"
  | "info"
  | "destructive"

// Complete class strings (never interpolated) so Tailwind can see every utility. `blue` is the
// default chart hue: a blue-500 stroke whose area wash (currentColor @ ~22%) lands at blue-100/200.
const SERIES_TEXT: Record<ChartColor, string> = {
  current: "",
  blue: "text-blue-500",
  primary: "text-primary",
  purple: "text-purple",
  pink: "text-pink",
  teal: "text-teal",
  orange: "text-orange",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
}
const SERIES_BG: Record<ChartColor, string> = {
  current: "bg-current",
  blue: "bg-blue-500",
  primary: "bg-primary",
  purple: "bg-purple",
  pink: "bg-pink",
  teal: "bg-teal",
  orange: "bg-orange",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
}

/** Default hue rotation for series that don't name a color. `blue` leads (the house chart hue). */
const PALETTE: ChartColor[] = ["blue", "teal", "purple", "orange", "pink", "info"]

/* -------------------------------------------------------------------- types --- */

// `null` (or an absent key) marks a missing point: it becomes a gap in the line/area.
export type ChartDatum = Record<string, number | string | null>
export interface ChartSeriesConfig {
  /** Human label shown in the tooltip. Defaults to the data key. */
  label?: string
  /** Semantic hue. Defaults to a rotating slot in {@link PALETTE}. */
  color?: ChartColor
  /** Format this series' value in the tooltip (overrides ChartTooltip's `valueFormatter`). */
  format?: (value: number) => string
  /** Scale this series against the secondary (right) y-axis instead of the primary. */
  axis?: "left" | "right"
}
export type ChartConfig = Record<string, ChartSeriesConfig>

interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

interface ResolvedSeries {
  key: string
  label: string
  color: ChartColor
  format?: (value: number) => string
  axis: "left" | "right"
}

interface ChartContextValue {
  data: ChartDatum[]
  index?: string
  series: ResolvedSeries[]
  /** Quick lookup from data key to its resolved label + color. */
  seriesByKey: Record<string, ResolvedSeries>
  domain: [number, number]
  plot: Insets & { width: number; height: number }
  /** True once the box has been measured and the plot has a positive area. */
  ready: boolean
  sparkline: boolean
  /** When true, the data parts play their one-shot load reveal on mount. */
  animate: boolean
  /** When true, multi-series bars/areas stack (and the domain covers the per-category total). */
  stacked: boolean
  xFor: (i: number) => number
  yFor: (v: number) => number
  /** Scale for series on the secondary (right) axis. Equals `yFor` when no right axis is used. */
  yForRight: (v: number) => number
  /** True when at least one series is assigned to the right axis. */
  hasRight: boolean
  /** The y-pixel of the value baseline (0 for full charts, clamped into the plot; the plot
   *  floor for sparklines). Bars and areas grow from here, so negatives read correctly. */
  baseline: number
  /** The baseline for the secondary axis. */
  baselineRight: number
  /** The chart's resolved `color` (currentColor as a concrete value). The tooltip bubble is
   *  portaled out of the chart, so a `current`-hued series can't inherit it via CSS; the legend
   *  dot uses this instead. Re-read on theme change. */
  ink: string
  /** Center-to-center category spacing (also the bar/hover-band width). */
  band: number
  ticks: (count: number) => number[]
  /** Tick values for the secondary (right) axis. */
  ticksRight: (count: number) => number[]
  active: number | null
  /** The most recent hovered index; retained when `active` clears so the hover
   *  chrome (crosshair, active dot) can scale + fade out *in place* instead of
   *  unmounting and popping. */
  lastActive: number
  setActive: (i: number | null) => void
}

const [ChartProvider, useChartContext] = createContext<ChartContextValue>("Chart")

/* --------------------------------------------------------------------- root --- */

export interface ChartProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** A row per category (objects), or a bare `number[]` for a single `value` series. */
  data: ChartDatum[] | number[]
  /** Key holding each row's category label (for the x-axis / tooltip heading). */
  index?: string
  /** Per-series label + color. Omitted keys fall back to the rotating palette. */
  config?: ChartConfig
  /** Fix the y-domain as `[min, max]`. Defaults to the data extent (0-anchored
   *  for full charts, tight min→max for sparklines). */
  domain?: [number, number]
  /** Chromeless mode: zero padding, points span the full width, currentColor. */
  sparkline?: boolean
  /** Stack multi-series `ChartBars`/`ChartAreas` and size the domain to the per-category total.
   *  Without it, `ChartBars` renders series grouped side by side. */
  stack?: boolean
  /** Override the plot insets (raise `bottom`/`left` to make room for axes). */
  padding?: Partial<Insets>
  /**
   * Play the one-shot load reveal when the chart first mounts: the line self-draws, the area rises,
   * and bars grow from the baseline. Honors `prefers-reduced-motion`. @default true
   */
  animate?: boolean
  /**
   * Show the vertical hover crosshair. It paints *behind* the data layers (under the line and any
   * markers) so the trend always reads on top. Defaults to `true` for full charts, `false` for
   * sparklines.
   */
  crosshair?: boolean
  /** Render a loading placeholder (Skeleton) in place of the plot. Sets `aria-busy`. */
  loading?: boolean
  /** Shown when `data` is empty (and not loading). Defaults to a muted "No data" message. */
  empty?: React.ReactNode
  /**
   * Accessible name for the chart. The SVG is decorative (`aria-hidden`); screen readers read a
   * visually-hidden data table instead, captioned with this label. Strongly recommended.
   */
  label?: string
  children?: React.ReactNode
}

function numericKeys(row: ChartDatum | undefined, index?: string): string[] {
  if (!row) return []
  return Object.keys(row).filter((k) => k !== index && typeof row[k] === "number")
}

/** Round a number up (or, when `round`, to nearest) to a "nice" 1/2/5 × 10^k value. */
function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range || 1))
  const frac = (range || 1) / 10 ** exp
  const nf = round
    ? frac < 1.5
      ? 1
      : frac < 3
        ? 2
        : frac < 7
          ? 5
          : 10
    : frac <= 1
      ? 1
      : frac <= 2
        ? 2
        : frac <= 5
          ? 5
          : 10
  return nf * 10 ** exp
}

/** "Nice" axis bounds + step for `[min, max]` targeting ~`count` ticks (the d3-style algorithm). */
function niceScale(min: number, max: number, count: number): { lo: number; hi: number; step: number } {
  if (min === max) max = min + 1
  const step = niceNum(niceNum(max - min, false) / Math.max(count, 1), true)
  return {
    lo: Math.floor(min / step) * step,
    hi: Math.ceil(max / step) * step,
    step,
  }
}

export function Chart({
  data,
  index,
  config,
  domain: domainProp,
  sparkline = false,
  stack = false,
  padding,
  animate = true,
  crosshair,
  loading = false,
  empty,
  label,
  className,
  children,
  ...props
}: ChartProps) {
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const [active, setActiveState] = React.useState<number | null>(null)
  const [lastActive, setLastActive] = React.useState(0)
  // The chart's resolved currentColor, captured for the portaled tooltip (see context.ink).
  const [ink, setInk] = React.useState("")

  // Lint-safe: setState lives in named handlers, only called from observer callbacks (never in render).
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = (w: number, h: number) =>
      setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }))
    const readInk = () => setInk(getComputedStyle(el).color)
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (box) apply(box.width, box.height)
      readInk() // fires on mount + resize, so ink is set well before any hover
    })
    ro.observe(el)
    // Re-read on theme switch (the theme is a class on <html>), keeping the tooltip dot in sync.
    const mo = new MutationObserver(readInk)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  // Normalize `number[]` → `[{ value }]` so every path below speaks objects.
  const rows = React.useMemo<ChartDatum[]>(
    () =>
      Array.isArray(data) && typeof data[0] === "number"
        ? (data as number[]).map((value) => ({ value }))
        : (data as ChartDatum[]) ?? [],
    [data],
  )

  // Resolve series once: label + a stable color (explicit > config > palette slot).
  // When a `config` is given it's the source of truth for *which* keys are plotted,
  // so the y-domain isn't dragged by other numeric columns sharing the data rows
  // (e.g. a revenue field next to an orders field at a totally different scale).
  const series = React.useMemo<ResolvedSeries[]>(() => {
    const keys = config
      ? Object.keys(config).filter((k) => rows.some((r) => typeof r[k] === "number"))
      : numericKeys(rows[0], index)
    return keys.map((key, i) => {
      const cfg = config?.[key]
      return {
        key,
        label: cfg?.label ?? key,
        color: cfg?.color ?? (sparkline ? "current" : PALETTE[i % PALETTE.length]),
        format: cfg?.format,
        axis: cfg?.axis ?? "left",
      }
    })
  }, [rows, index, config, sparkline])

  const seriesByKey = React.useMemo(
    () => Object.fromEntries(series.map((s) => [s.key, s])),
    [series],
  )

  // Raw extent over a series SUBSET (so each axis scales to its own series); stacked sums per
  // category, full charts anchor to 0.
  const extentOf = React.useCallback(
    (subset: ResolvedSeries[]): [number, number] => {
      let min = Infinity
      let max = -Infinity
      if (stack) {
        for (const row of rows) {
          let pos = 0
          let neg = 0
          for (const s of subset) {
            const v = row[s.key]
            if (typeof v !== "number") continue
            if (v >= 0) pos += v
            else neg += v
          }
          if (pos > max) max = pos
          if (neg < min) min = neg
        }
      } else {
        for (const row of rows)
          for (const s of subset) {
            const v = row[s.key]
            if (typeof v !== "number") continue // skip gaps so they don't drag the domain to 0
            if (v < min) min = v
            if (v > max) max = v
          }
      }
      if (!Number.isFinite(max)) return [0, 1] // no numeric data
      const lo = Number.isFinite(min) ? min : 0
      return sparkline ? [lo, max] : [Math.min(0, lo), max]
    },
    [rows, sparkline, stack],
  )

  // Full charts round the domain to "nice" bounds + a tick step (0, 2k, 4k…), so the axis reads
  // cleanly and grid lines land on round values. Sparklines and an explicit `domain` skip nicing.
  const makeScale = React.useCallback(
    (ext: [number, number], allowProp: boolean): { domain: [number, number]; ticks: number[] | null } => {
      if (allowProp && domainProp) return { domain: domainProp, ticks: null }
      if (sparkline) return { domain: ext, ticks: null }
      const { lo, hi, step } = niceScale(ext[0], ext[1], 4)
      const ticks: number[] = []
      for (let v = lo; v <= hi + step / 1e6; v += step) ticks.push(Number(v.toPrecision(12)))
      return { domain: [lo, hi], ticks }
    },
    [domainProp, sparkline],
  )

  const hasRight = React.useMemo(() => series.some((s) => s.axis === "right"), [series])
  // Left axis scales the primary series (or all of them when nothing is on the right).
  const leftScale = React.useMemo(
    () => makeScale(extentOf(series.filter((s) => s.axis !== "right")), true),
    [makeScale, extentOf, series],
  )
  const rightScale = React.useMemo(
    () => makeScale(extentOf(series.filter((s) => s.axis === "right")), false),
    [makeScale, extentOf, series],
  )
  const domain = leftScale.domain
  const niceTicks = leftScale.ticks
  const domainRight = rightScale.domain
  const niceTicksRight = rightScale.ticks

  // Plot insets. Sparkline bleeds to the bottom/sides; a 2px top guards the peak cap.
  const plotInsets: Insets = sparkline
    ? { top: 2, right: 0, bottom: 0, left: 0, ...padding }
    : { top: 8, right: 8, bottom: 8, left: 8, ...padding }

  const plot = {
    ...plotInsets,
    width: Math.max(0, size.width - plotInsets.left - plotInsets.right),
    height: Math.max(0, size.height - plotInsets.top - plotInsets.bottom),
  }
  const ready = plot.width > 0 && plot.height > 0 && rows.length > 0

  const n = rows.length
  const band = sparkline ? (n > 1 ? plot.width / (n - 1) : plot.width) : plot.width / Math.max(n, 1)

  const xFor = React.useCallback(
    (i: number) =>
      sparkline
        ? plot.left + (n > 1 ? (i / (n - 1)) * plot.width : plot.width / 2)
        : plot.left + (i + 0.5) * band,
    [sparkline, n, plot.left, plot.width, band],
  )
  // One scale factory for both axes: maps a value to a y-pixel against the given domain.
  const scaleFor = React.useCallback(
    (d: [number, number]) => (v: number) =>
      plot.top + (1 - (v - d[0]) / (d[1] - d[0] || 1)) * plot.height,
    [plot.top, plot.height],
  )
  const yFor = React.useMemo(() => scaleFor(domain), [scaleFor, domain])
  const yForRight = React.useMemo(() => scaleFor(domainRight), [scaleFor, domainRight])

  const tickFor = React.useCallback(
    (nice: number[] | null, d: [number, number]) => (count: number) => {
      // Full charts share ONE nice tick set (so grid lines and y-labels always align, regardless of
      // the requested count); sparklines/custom domains fall back to even division.
      if (nice) return nice
      return Array.from({ length: count + 1 }, (_, i) => d[0] + ((d[1] - d[0]) * i) / count)
    },
    [],
  )
  const ticks = React.useMemo(() => tickFor(niceTicks, domain), [tickFor, niceTicks, domain])
  const ticksRight = React.useMemo(
    () => tickFor(niceTicksRight, domainRight),
    [tickFor, niceTicksRight, domainRight],
  )

  const setActive = React.useCallback((i: number | null) => setActiveState(i), [])

  // Remember the last hovered index during render (lint-safe: no effect, no ref) so
  // the crosshair and active dot can fade out where they were rather than vanishing.
  // Converges in one re-render: once `lastActive` matches `active` the check is false.
  if (active != null && active !== lastActive) setLastActive(active)

  const slots = chartVariants()

  // The crosshair is owned by the root (not ChartTooltip) so it paints BEHIND every data layer:
  // the line and any markers always sit on top of the tracking line. Defaults off for sparklines.
  const showCrosshair = crosshair ?? !sparkline
  // Frozen on the last column so the crosshair fades out in place, never jumping.
  const crosshairX = xFor(active ?? lastActive)

  // Value baseline: bars and areas grow from y(0) (clamped into the plot) so negative values read
  // below it. Sparklines have a tight, non-0-anchored domain, so they fall back to the plot floor.
  const floor = plot.top + plot.height
  const baseline = sparkline ? floor : Math.max(plot.top, Math.min(floor, yFor(0)))
  const baselineRight = sparkline ? floor : Math.max(plot.top, Math.min(floor, yForRight(0)))

  const isEmpty = !loading && rows.length === 0

  return (
    <ChartProvider
      data={rows}
      index={index}
      series={series}
      seriesByKey={seriesByKey}
      domain={domain}
      plot={plot}
      ready={ready}
      sparkline={sparkline}
      animate={animate}
      stacked={stack}
      xFor={xFor}
      yFor={yFor}
      yForRight={yForRight}
      hasRight={hasRight}
      baseline={baseline}
      baselineRight={baselineRight}
      ink={ink}
      band={band}
      ticks={ticks}
      ticksRight={ticksRight}
      active={active}
      lastActive={lastActive}
      setActive={setActive}
    >
      <div
        ref={ref}
        data-slot="chart"
        className={slots.root({ className })}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          // Loading: a placeholder fills the plot; the SVG (and its parts) stay unmounted.
          <Skeleton data-slot="chart-skeleton" className="absolute inset-0 size-full rounded-lg" />
        ) : isEmpty ? (
          // Empty: a centered message in place of the plot.
          <div
            data-slot="chart-empty"
            className="absolute inset-0 flex items-center justify-center p-4 text-center"
          >
            {empty ?? <p className="text-sm text-muted-foreground">No data to display</p>}
          </div>
        ) : (
          <svg
            className={slots.svg()}
            width={size.width || undefined}
            height={size.height || undefined}
            // The SVG is decorative for AT: screen readers read the data table below instead.
            aria-hidden
            // Clearing on leave lives in a handler: no synchronous render setState.
            onPointerLeave={() => setActive(null)}
          >
            {/* Crosshair first => it sits behind the grid, area, line, and markers. The area fades to
                transparent, so the tracking line still reads through it without ever covering data. */}
            {ready && showCrosshair && (
              <line
                data-slot="chart-crosshair"
                x1={crosshairX}
                x2={crosshairX}
                y1={plot.top}
                y2={plot.top + plot.height}
                strokeDasharray="4 4"
                className={cn(
                  "origin-center stroke-border [transform-box:fill-box]",
                  "transition-[opacity,scale] duration-fast ease-out",
                  active != null ? "scale-y-100 opacity-100" : "scale-y-90 opacity-0",
                )}
              />
            )}
            {ready ? children : null}
          </svg>
        )}

        {/* Accessible alternative: a visually-hidden data table is the real semantic content for
            screen readers (the SVG is aria-hidden). Skipped for chromeless sparklines, which are
            decorative and labelled by their surrounding context (e.g. a Stat's value). */}
        {!loading && !isEmpty && !sparkline && (
          <table data-slot="chart-table" className="sr-only">
            {label && <caption>{label}</caption>}
            <thead>
              <tr>
                <th scope="col">{index ?? "Point"}</th>
                {series.map((s) => (
                  <th key={s.key} scope="col">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <th scope="row">{String((index ? row[index] : i + 1) ?? i + 1)}</th>
                  {series.map((s) => {
                    const v = row[s.key]
                    return <td key={s.key}>{typeof v === "number" ? v.toLocaleString() : ""}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ChartProvider>
  )
}

/* ------------------------------------------------------------------ helpers --- */

/** Build the polyline `d` for a series. A non-numeric value is a gap: by default it BREAKS the
 *  line into separate subpaths (the next valid point starts a fresh `M`); `connectNulls` bridges
 *  across the gap instead. */
function linePath(
  data: ChartDatum[],
  key: string,
  xFor: (i: number) => number,
  yFor: (v: number) => number,
  connectNulls = false,
): string {
  let d = ""
  let penDown = false
  data.forEach((row, i) => {
    const v = row[key]
    if (typeof v !== "number") {
      if (!connectNulls) penDown = false
      return
    }
    d += `${penDown ? "L" : "M"}${xFor(i)},${yFor(v)} `
    penDown = true
  })
  return d.trim()
}

/** Build the filled-area `d`: each contiguous run of valid points is closed down to `baseline`
 *  (the y(0) line), so gaps leave holes (unless `connectNulls`) and negatives fill below it. */
function areaPath(
  data: ChartDatum[],
  key: string,
  xFor: (i: number) => number,
  yFor: (v: number) => number,
  baseline: number,
  connectNulls = false,
): string {
  let d = ""
  let seg: number[] = []
  const flush = () => {
    if (seg.length) {
      const first = seg[0]
      const last = seg[seg.length - 1]
      d += `M${xFor(first)},${baseline} `
      for (const i of seg) d += `L${xFor(i)},${yFor(data[i][key] as number)} `
      d += `L${xFor(last)},${baseline} Z `
    }
    seg = []
  }
  data.forEach((row, i) => {
    if (typeof row[key] !== "number") {
      if (!connectNulls) flush()
      return
    }
    seg.push(i)
  })
  flush()
  return d.trim()
}

/** Build a (possibly stacked) area's filled band + its top-edge line in one pass. The band's top
 *  edge follows the series' upper value; its bottom edge is the cumulative below it when stacked, or
 *  the y-zero baseline otherwise. Gaps break both (unless `connectNulls`). */
function buildAreaPaths(
  data: ChartDatum[],
  series: ResolvedSeries[],
  key: string,
  xFor: (i: number) => number,
  yFor: (v: number) => number,
  baseline: number,
  stacked: boolean,
  connectNulls: boolean,
): { band: string; line: string } {
  let band = ""
  let line = ""
  let pen = false
  let run: Array<{ x: number; top: number; bot: number }> = []
  const flush = () => {
    if (run.length) {
      band += `M${run[0].x},${run[0].top} `
      for (const p of run) band += `L${p.x},${p.top} `
      for (let k = run.length - 1; k >= 0; k--) band += `L${run[k].x},${run[k].bot} `
      band += "Z "
    }
    run = []
  }
  data.forEach((row, i) => {
    const v = row[key]
    if (typeof v !== "number") {
      if (!connectNulls) {
        flush()
        pen = false
      }
      return
    }
    let top: number
    let bot: number
    if (stacked) {
      const r = stackedRange(data, series, i, key)
      if (!r) return
      top = yFor(Math.max(r[0], r[1]))
      bot = yFor(Math.min(r[0], r[1]))
    } else {
      const yv = yFor(v)
      top = Math.min(yv, baseline)
      bot = Math.max(yv, baseline)
    }
    const x = xFor(i)
    run.push({ x, top, bot })
    line += `${pen ? "L" : "M"}${x},${top} `
    pen = true
  })
  flush()
  return { band: band.trim(), line: line.trim() }
}

/** The value-space `[start, end]` a series occupies in a stack at row `i`: the same-sign running
 *  total of the series listed before it. Drives stacked bars and stacked areas. Returns null for a
 *  gap. */
function stackedRange(
  data: ChartDatum[],
  series: ResolvedSeries[],
  i: number,
  key: string,
): [number, number] | null {
  const v = data[i]?.[key]
  if (typeof v !== "number") return null
  let base = 0
  for (const s of series) {
    if (s.key === key) break
    const sv = data[i]?.[s.key]
    // Stack same-sign values, so positives pile up and negatives pile down independently.
    if (typeof sv === "number" && sv >= 0 === v >= 0) base += sv
  }
  return [base, base + v]
}

/** Wrap children in a `<g>` carrying the series' hue as `currentColor`. */
function SeriesGroup({
  color,
  className,
  children,
  ...props
}: { color: ChartColor } & React.ComponentProps<"g">) {
  return (
    <g className={cn(SERIES_TEXT[color], className)} {...props}>
      {children}
    </g>
  )
}

/* -------------------------------------------------------------------- parts --- */

export interface ChartLineProps extends Omit<React.ComponentProps<"path">, "d"> {
  /** Which series to plot. Defaults to the lone `value` series. */
  dataKey?: string
  /** Override the resolved hue. */
  color?: ChartColor
  strokeWidth?: number
  /** Hide the dot that marks the hovered point. */
  hideActiveDot?: boolean
  /** Bridge across missing (non-numeric) points instead of breaking the line at the gap. */
  connectNulls?: boolean
  /** Render the line dashed (for projected / forecast data). Skips the self-draw reveal. */
  dashed?: boolean
  /** Always mark the last point with a filled dot (a "current value" marker). */
  markEnd?: boolean
}

export function ChartLine({
  dataKey = "value",
  color,
  strokeWidth = 2,
  hideActiveDot = false,
  connectNulls = false,
  dashed = false,
  markEnd = false,
  className,
  ...props
}: ChartLineProps) {
  const { data, seriesByKey, xFor, yFor, yForRight, active, lastActive, animate } =
    useChartContext("ChartLine")
  const hue = color ?? seriesByKey[dataKey]?.color ?? "blue"
  // Series on the right axis scale against its domain.
  const sy = seriesByKey[dataKey]?.axis === "right" ? yForRight : yFor
  const d = linePath(data, dataKey, xFor, sy, connectNulls)
  // Freeze on the last hovered point so the marker can scale + fade out *in place*
  // (principle 7) rather than unmounting and popping. `shown` drives the in/out.
  const idx = active ?? lastActive
  const mv = data[idx]?.[dataKey] as number | undefined
  const shown = active != null && typeof mv === "number"
  // A dashed line can't also self-draw (the draw reuses stroke-dasharray), so it appears statically.
  const draw = animate && !dashed
  // Last point with a numeric value, for the optional end marker.
  let endIdx = -1
  for (let i = data.length - 1; i >= 0; i--) {
    if (typeof data[i]?.[dataKey] === "number") {
      endIdx = i
      break
    }
  }

  return (
    <SeriesGroup color={hue} data-slot="chart-line">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "6 5" : undefined}
        // pathLength normalizes the trend to length 1 so stroke-dashoffset 1→0 draws it end-to-end.
        pathLength={draw ? 1 : undefined}
        className={cn(
          draw && "[stroke-dasharray:1] animate-chart-draw motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
      {markEnd && endIdx >= 0 && (
        <circle
          cx={xFor(endIdx)}
          cy={sy(data[endIdx][dataKey] as number)}
          r={4}
          // Filled dot in the series hue, with a background ring so it pops off the line.
          className="fill-current stroke-background"
          strokeWidth={2}
        />
      )}
      {!hideActiveDot && typeof mv === "number" && (
        <circle
          cx={xFor(idx)}
          cy={sy(mv)}
          r={4}
          strokeWidth={2}
          className={cn(
            "origin-center fill-background stroke-current [transform-box:fill-box]",
            // v4: scale-* sets the standalone `scale` property, so name it (not `transform`).
            "transition-[opacity,scale] duration-fast ease-out",
            shown ? "scale-100 opacity-100" : "scale-[0.25] opacity-0",
          )}
        />
      )}
    </SeriesGroup>
  )
}

export interface ChartAreaProps extends Omit<React.ComponentProps<"path">, "d"> {
  dataKey?: string
  color?: ChartColor
  /** Bridge across missing (non-numeric) points instead of leaving a hole at the gap. */
  connectNulls?: boolean
}

export function ChartArea({
  dataKey = "value",
  color,
  connectNulls = false,
  className,
  ...props
}: ChartAreaProps) {
  const { data, seriesByKey, xFor, yFor, yForRight, baseline, baselineRight, sparkline, animate } =
    useChartContext("ChartArea")
  const hue = color ?? seriesByKey[dataKey]?.color ?? "blue"
  const onRight = seriesByKey[dataKey]?.axis === "right"
  const sy = onRight ? yForRight : yFor
  const base = onRight ? baselineRight : baseline
  const gradientId = React.useId()
  // Each segment is closed down to the y(0) baseline (the plot floor for sparklines).
  const area = areaPath(data, dataKey, xFor, sy, base, connectNulls)
  if (!area) return null

  return (
    <SeriesGroup color={hue} data-slot="chart-area">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {/* currentColor inherits the series hue; opacity fades to the baseline. */}
          <stop offset="0%" stopColor="currentColor" stopOpacity={sparkline ? 0.18 : 0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill={`url(#${gradientId})`}
        className={cn(
          // scaleY grows from the plot floor (origin-bottom); fill-box anchors it to the path bbox.
          animate &&
            "origin-bottom [transform-box:fill-box] animate-chart-area motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </SeriesGroup>
  )
}

export interface ChartAreasProps extends React.ComponentProps<"g"> {
  /** Series keys to draw, in order (bottom of the stack first). Defaults to every series. */
  keys?: string[]
  /** Bridge across missing (non-numeric) points instead of leaving a hole at the gap. */
  connectNulls?: boolean
}

/**
 * ChartAreas: several area series at once. Set `stack` on {@link Chart} to stack them into a band
 * chart (each series sits on the cumulative total below it, with a more opaque fill so the bands
 * read apart); without it they overlap from the baseline like layered {@link ChartArea}s. Each band
 * carries its own top-edge line. For a single area, reach for {@link ChartArea} + {@link ChartLine}.
 */
export function ChartAreas({ keys, connectNulls = false, className, ...props }: ChartAreasProps) {
  const { data, series, seriesByKey, xFor, yFor, yForRight, baseline, baselineRight, animate, stacked } =
    useChartContext("ChartAreas")
  const drawKeys = keys ?? series.map((s) => s.key)
  // One useId base; per-series gradients derive a suffix (no hooks in the map).
  const gradientBase = React.useId()

  return (
    <g data-slot="chart-areas" className={className} {...props}>
      {drawKeys.map((key, j) => {
        const hue = seriesByKey[key]?.color ?? "blue"
        const onRight = seriesByKey[key]?.axis === "right"
        const { band, line } = buildAreaPaths(
          data,
          series,
          key,
          xFor,
          onRight ? yForRight : yFor,
          onRight ? baselineRight : baseline,
          stacked,
          connectNulls,
        )
        if (!band) return null
        const gid = `${gradientBase}-${j}`
        return (
          <SeriesGroup key={key} color={hue}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                {/* Stacked bands read as solid-ish fills so they separate; overlapping areas stay airy. */}
                <stop offset="0%" stopColor="currentColor" stopOpacity={stacked ? 0.85 : 0.22} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={stacked ? 0.5 : 0} />
              </linearGradient>
            </defs>
            <path
              d={band}
              fill={`url(#${gid})`}
              className={cn(
                animate &&
                  "origin-bottom [transform-box:fill-box] animate-chart-area motion-reduce:animate-none",
              )}
            />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={animate ? 1 : undefined}
              className={cn(
                animate && "[stroke-dasharray:1] animate-chart-draw motion-reduce:animate-none",
              )}
            />
          </SeriesGroup>
        )
      })}
    </g>
  )
}

export interface ChartBarProps extends Omit<React.ComponentProps<"rect">, "x" | "y" | "width" | "height"> {
  dataKey?: string
  color?: ChartColor
  /** Bar width as a fraction of the category band (0–1). */
  barRatio?: number
  /** Corner radius in px. */
  radius?: number
}

export function ChartBar({
  dataKey = "value",
  color,
  barRatio = 0.62,
  radius = 4,
  className,
  ...props
}: ChartBarProps) {
  const { data, seriesByKey, xFor, yFor, yForRight, baseline, baselineRight, band, active, animate } =
    useChartContext("ChartBar")
  const hue = color ?? seriesByKey[dataKey]?.color ?? "blue"
  const onRight = seriesByKey[dataKey]?.axis === "right"
  const sy = onRight ? yForRight : yFor
  const base = onRight ? baselineRight : baseline
  const width = band * barRatio
  const n = data.length

  return (
    <SeriesGroup color={hue} data-slot="chart-bar">
      {data.map((row, i) => {
        const v = row[dataKey]
        if (typeof v !== "number") return null
        // Span from the value to the baseline, so positives rise above it and negatives drop below.
        const y = sy(v)
        const top = Math.min(y, base)
        const h = Math.abs(y - base)
        const negative = v < 0
        return (
          <rect
            key={i}
            x={xFor(i) - width / 2}
            y={top}
            width={width}
            height={h}
            rx={Math.min(radius, width / 2)}
            {...props}
            // Non-active bars sit back; the hovered one comes forward. `fill-current`
            // ties the bar to the series hue.
            className={cn(
              "fill-current transition-opacity duration-fast ease-out",
              active != null && active !== i ? "opacity-40" : "opacity-100",
              // Grow from the baseline edge: up for positives (origin-bottom), down for negatives.
              animate &&
                cn(
                  negative ? "origin-top" : "origin-bottom",
                  "[transform-box:fill-box] animate-chart-bar motion-reduce:animate-none",
                ),
              className,
            )}
            // Spread the column cascade left→right across the line-draw window (delays, not durations).
            style={
              animate
                ? { animationDelay: `${(i / Math.max(n, 1)) * duration.slow}ms`, ...props.style }
                : props.style
            }
          />
        )
      })}
    </SeriesGroup>
  )
}

export interface ChartBarsProps
  extends Omit<React.ComponentProps<"rect">, "x" | "y" | "width" | "height"> {
  /** Series keys to draw, in order. Defaults to every series in the chart. */
  keys?: string[]
  /** Total group width as a fraction of the category band (0–1). @default 0.7 */
  barRatio?: number
  /** Corner radius in px. @default 4 */
  radius?: number
}

/**
 * ChartBars: several bar series sharing each category band. Set `stack` on {@link Chart} to pile the
 * segments from the y-zero baseline (same sign stacks together); otherwise the series render grouped
 * side by side. For a single series, reach for {@link ChartBar}.
 */
export function ChartBars({ keys, barRatio = 0.7, radius = 4, className, ...props }: ChartBarsProps) {
  const { data, series, seriesByKey, xFor, yFor, yForRight, baseline, baselineRight, band, active, animate, stacked } =
    useChartContext("ChartBars")
  const drawKeys = keys ?? series.map((s) => s.key)
  const count = Math.max(drawKeys.length, 1)
  const groupWidth = band * barRatio
  const slot = groupWidth / count
  // Grouped bars get a slot each (with a small inner gap); stacked bars share the full group width.
  const barWidth = stacked ? groupWidth : slot * 0.82
  // A hairline seam between stacked segments reads as a clean segmented column.
  const segGap = stacked ? 2 : 0
  const n = data.length

  return (
    <g data-slot="chart-bars">
      {drawKeys.map((key, j) => {
        const onRight = seriesByKey[key]?.axis === "right"
        const sy = onRight ? yForRight : yFor
        const base = onRight ? baselineRight : baseline
        return (
        <SeriesGroup key={key} color={seriesByKey[key]?.color ?? "blue"}>
          {data.map((row, i) => {
            const v = row[key]
            if (typeof v !== "number") return null
            let top: number
            let h: number
            if (stacked) {
              const r = stackedRange(data, series, i, key)
              if (!r) return null
              const ya = sy(r[0])
              const yb = sy(r[1])
              top = Math.min(ya, yb)
              h = Math.max(0, Math.abs(ya - yb) - segGap)
            } else {
              // Each bar spans value → baseline, so positives rise and negatives drop.
              const yv = sy(v)
              top = Math.min(yv, base)
              h = Math.abs(yv - base)
            }
            const x = stacked
              ? xFor(i) - groupWidth / 2
              : xFor(i) - groupWidth / 2 + j * slot + (slot - barWidth) / 2
            const negative = v < 0
            return (
              <rect
                key={i}
                x={x}
                y={top}
                width={barWidth}
                height={h}
                rx={Math.min(radius, barWidth / 2, h / 2)}
                {...props}
                className={cn(
                  "fill-current transition-opacity duration-fast ease-out",
                  active != null && active !== i ? "opacity-40" : "opacity-100",
                  // Grow from the baseline edge: up for positives, down for negatives.
                  animate &&
                    cn(
                      negative ? "origin-top" : "origin-bottom",
                      "[transform-box:fill-box] animate-chart-bar motion-reduce:animate-none",
                    ),
                  className,
                )}
                // Per-category cascade (delay, not duration); every series at a column moves together.
                style={
                  animate
                    ? { animationDelay: `${(i / Math.max(n, 1)) * duration.slow}ms`, ...props.style }
                    : props.style
                }
              />
            )
          })}
        </SeriesGroup>
        )
      })}
    </g>
  )
}

export interface ChartGridProps extends React.ComponentProps<"g"> {
  /** Number of horizontal bands (default 4). */
  rows?: number
  /** Also draw a vertical line per category. */
  showVertical?: boolean
}

export function ChartGrid({ rows = 4, showVertical = false, className, ...props }: ChartGridProps) {
  const { plot, ticks, data, xFor, yFor } = useChartContext("ChartGrid")
  const left = plot.left
  const right = plot.left + plot.width
  return (
    <g data-slot="chart-grid" className={cn("stroke-border", className)} {...props}>
      {ticks(rows).map((t, i) => {
        const y = yFor(t)
        return <line key={`h${i}`} x1={left} x2={right} y1={y} y2={y} />
      })}
      {showVertical &&
        data.map((_, i) => (
          <line key={`v${i}`} x1={xFor(i)} x2={xFor(i)} y1={plot.top} y2={plot.top + plot.height} />
        ))}
    </g>
  )
}

export interface ChartAxisProps extends React.ComponentProps<"g"> {
  /** Format a category label. */
  tickFormatter?: (value: string | number, index: number) => string
  /** Skip labels to avoid crowding (render every Nth). */
  interval?: number
}

export function ChartXAxis({ tickFormatter, interval = 1, className, ...props }: ChartAxisProps) {
  const { data, index, xFor, plot } = useChartContext("ChartXAxis")
  const baseline = plot.top + plot.height
  return (
    <g
      data-slot="chart-x-axis"
      className={cn("fill-muted-foreground text-[11px]", className)}
      {...props}
    >
      {data.map((row, i) => {
        if (i % interval !== 0) return null
        const raw = (index ? row[index] : i + 1) ?? i + 1
        const label = tickFormatter ? tickFormatter(raw, i) : String(raw)
        return (
          <text key={i} x={xFor(i)} y={baseline + 16} textAnchor="middle">
            {label}
          </text>
        )
      })}
    </g>
  )
}

export interface ChartYAxisProps extends React.ComponentProps<"g"> {
  /** Number of ticks (default 4). */
  count?: number
  tickFormatter?: (value: number) => string
  /** Which axis to label. `right` reads the secondary scale and sits on the right edge. */
  side?: "left" | "right"
}

export function ChartYAxis({ count = 4, tickFormatter, side = "left", className, ...props }: ChartYAxisProps) {
  const { ticks, ticksRight, yFor, yForRight, plot } = useChartContext("ChartYAxis")
  const right = side === "right"
  const scaleY = right ? yForRight : yFor
  const x = right ? plot.left + plot.width + 8 : plot.left - 8
  return (
    <g
      data-slot="chart-y-axis"
      className={cn("fill-muted-foreground text-[11px]", className)}
      {...props}
    >
      {(right ? ticksRight : ticks)(count).map((t, i) => (
        <text key={i} x={x} y={scaleY(t) + 3} textAnchor={right ? "start" : "end"}>
          {tickFormatter ? tickFormatter(t) : t.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </text>
      ))}
    </g>
  )
}

/* ---------------------------------------------------------------- reference --- */

export interface ChartReferenceLineProps extends Omit<React.ComponentProps<"line">, "x" | "y"> {
  /** Draw a horizontal line at this value (a threshold/goal). */
  y?: number
  /** Draw a vertical line at this category index. */
  x?: number
  /** Optional label rendered at the line's end. */
  label?: string
  /** Dashed (default) or solid. */
  variant?: "dashed" | "solid"
  /** Hue; defaults to a muted neutral so it reads as chrome, not data. */
  color?: ChartColor
}

/**
 * ChartReferenceLine: a horizontal threshold (`y`) or vertical marker (`x`) drawn across the plot,
 * with an optional end `label`. Compose it after the data parts so it annotates on top (e.g. a
 * "target" or "limit" line). Defaults to a muted dashed line; pass a `color` to emphasize it.
 */
export function ChartReferenceLine({
  y,
  x,
  label,
  variant = "dashed",
  color,
  className,
  ...props
}: ChartReferenceLineProps) {
  const { plot, xFor, yFor } = useChartContext("ChartReferenceLine")
  if (y == null && x == null) return null
  const left = plot.left
  const right = plot.left + plot.width
  const top = plot.top
  const bottom = plot.top + plot.height
  const isH = y != null
  const yPix = y != null ? yFor(y) : 0
  const xPix = xFor(x ?? 0)

  return (
    <g
      data-slot="chart-reference-line"
      className={cn(color ? SERIES_TEXT[color] : "text-muted-foreground", className)}
    >
      <line
        x1={isH ? left : xPix}
        x2={isH ? right : xPix}
        y1={isH ? yPix : top}
        y2={isH ? yPix : bottom}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray={variant === "dashed" ? "5 4" : undefined}
        className="opacity-70"
        {...props}
      />
      {label && (
        <text
          x={isH ? right : xPix}
          y={isH ? yPix - 5 : top - 5}
          textAnchor={isH ? "end" : "middle"}
          className="fill-current text-[10px] font-medium"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ tooltip --- */

function defaultFormat(v: number): string {
  return v.toLocaleString()
}

export interface ChartTooltipProps {
  /** Format each series value in the bubble. */
  valueFormatter?: (value: number) => string
  /** Format the heading (the category label). */
  labelFormatter?: (value: string | number) => string
  /** Classes merged onto the shared tooltip bubble. */
  className?: string
}

/**
 * ChartTooltip: the hover layer. A full-height transparent band per category is the tooltip trigger;
 * all bands share ONE {@link TooltipGroup} bubble that glides between columns. The bands paint last,
 * on top, so they reliably catch the pointer. The tracking crosshair is owned by the {@link Chart}
 * root (so it paints behind the data); each ChartLine/Bar lights its own point.
 */
export function ChartTooltip({
  valueFormatter = defaultFormat,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  const { data, index, series, xFor, plot, band, ink, setActive } = useChartContext("ChartTooltip")
  const slots = chartVariants()
  const left = plot.left
  const top = plot.top
  const bottom = plot.top + plot.height

  return (
    <g data-slot="chart-tooltip">
      <TooltipGroup className={cn("px-2.5 py-2", className)} offset={[0, 10]}>
        {data.map((row, i) => {
          const raw = (index ? row[index] : i + 1) ?? i + 1
          const heading = labelFormatter ? labelFormatter(raw) : String(raw)
          const content = (
            <div className={slots.tooltip()}>
              <span className="text-[11px] font-medium text-muted-foreground">{heading}</span>
              {series.map((s) => {
                const v = row[s.key]
                if (typeof v !== "number") return null
                return (
                  <span key={s.key} className="flex items-center gap-2 text-xs">
                    {/* The bubble is portaled, so a `current`-hued series can't inherit the chart's
                        color via CSS (`bg-current` would read black); use the captured ink instead. */}
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        s.color !== "current" && SERIES_BG[s.color],
                      )}
                      style={
                        s.color === "current" ? { backgroundColor: ink || "currentColor" } : undefined
                      }
                    />
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="ml-auto font-medium text-popover-foreground">
                      {/* Per-series formatter (config.format) wins, else the shared valueFormatter. */}
                      {(s.format ?? valueFormatter)(v)}
                    </span>
                  </span>
                )
              })}
            </div>
          )
          // Band centered on the point; clamped so edge bands stay inside the plot.
          const bx = Math.max(left, xFor(i) - band / 2)
          const bw = Math.min(plot.left + plot.width - bx, band)
          return (
            <Tooltip key={i} content={content} placement="top">
              <rect
                x={bx}
                y={top}
                width={bw}
                height={Math.max(0, bottom - top)}
                className="fill-transparent"
                onPointerEnter={() => setActive(i)}
              />
            </Tooltip>
          )
        })}
      </TooltipGroup>
    </g>
  )
}

/* ------------------------------------------------------------------- legend --- */

export interface ChartLegendItem {
  label: string
  color?: ChartColor
}

export interface ChartLegendProps extends React.ComponentProps<"div"> {
  /** Derive entries from the same `config` you pass to {@link Chart} (label + color per key). */
  config?: ChartConfig
  /** Or pass entries explicitly. Takes precedence over `config`. */
  items?: ChartLegendItem[]
  /** Horizontal alignment of the row. @default "start" */
  align?: "start" | "center" | "end"
}

const LEGEND_ALIGN: Record<NonNullable<ChartLegendProps["align"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
}

/**
 * ChartLegend: a standalone key for a multi-series chart. It lives OUTSIDE the SVG (it's HTML), so
 * place it above or below the {@link Chart} and feed it the same `config` (or explicit `items`). Each
 * swatch resolves its hue exactly like the chart does, including the rotating palette for keys that
 * omit a color.
 */
export function ChartLegend({ config, items, align = "start", className, ...props }: ChartLegendProps) {
  const resolved: ChartLegendItem[] =
    items ??
    (config
      ? Object.entries(config).map(([key, cfg], i) => ({
          label: cfg.label ?? key,
          color: cfg.color ?? PALETTE[i % PALETTE.length],
        }))
      : [])
  if (!resolved.length) return null

  return (
    <div
      data-slot="chart-legend"
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", LEGEND_ALIGN[align], className)}
      {...props}
    >
      {resolved.map((item, i) => (
        <span key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("size-2.5 shrink-0 rounded-full", SERIES_BG[item.color ?? "blue"])} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
