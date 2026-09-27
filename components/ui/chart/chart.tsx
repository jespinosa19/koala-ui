"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv } from "@/lib/tv"
import { duration } from "@/lib/motion"
import { Tooltip, TooltipGroup, TooltipSeparator } from "@/components/ui/tooltip"
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
  | "brand"
  | "neutral"
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
  // The accent, for the one datum a chart singles out (the current week, the leader).
  brand: "text-brand",
  // The recessive ink for the rest of the data when one datum carries the brand: the foreground at
  // 10% reads as a quiet grey on every theme, light or dark, without a token of its own.
  neutral: "text-foreground/10",
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
  brand: "bg-brand",
  neutral: "bg-foreground/10",
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

/**
 * How a bar recedes while ANOTHER column is hovered. Saturated hues drop to 40%. `neutral` is already
 * the foreground at 10%, so the same dim would leave it at 4% and all but erase it: it holds its ink
 * instead, and the hovered neutral bar steps up to 20% ({@link barLift}) so the column still reads.
 */
function barDim(color: ChartColor): string {
  return color === "neutral" ? "opacity-100" : "opacity-40"
}
function barLift(color: ChartColor): string {
  return color === "neutral" ? "text-foreground/20" : ""
}

/**
 * The chart's own figures (the screen-reader table, the axis ticks, the default tooltip), pinned
 * to one locale. The table renders on the server and hydrates on the client; a bare
 * `toLocaleString()` takes each side's locale, so "18,484" from the server meets "18.484" in a
 * Spanish browser and React throws the whole page away to re-render it. Pass `tickFormatter` /
 * `valueFormatter` to show a different locale.
 */
const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

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

/**
 * How a line or area joins its points. `linear` draws straight segments; `monotone` draws a monotone
 * cubic (Fritsch-Carlson), a smooth curve that still passes through every point and never swings
 * above a peak or below a trough the data does not have.
 */
export type ChartCurve = "linear" | "monotone"

/**
 * Which bars a {@link ChartBar} paints in its `highlightColor`: a category index, a list of them,
 * `"active"` for the bar under the pointer, or a predicate that also receives the active index.
 */
export type ChartBarHighlight =
  | number
  | number[]
  | "active"
  | ((datum: ChartDatum, index: number, active: number | null) => boolean)

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
  /** A bar part announces itself on mount (and withdraws on unmount), so a sparkline that draws
   *  bars can lay its categories out in bands and anchor its scale to zero. */
  registerBars: () => () => void
  /** The categories each bar series currently paints in a highlight hue, keyed by data key, so the
   *  tooltip swatch matches the bar it describes. */
  highlights: Record<string, { color: ChartColor; indices: number[] }>
  /** A highlighted {@link ChartBar} publishes its lit categories (returns the withdrawal). */
  markHighlight: (key: string, color: ChartColor, indices: number[]) => () => void
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
  /**
   * The y-domain. `"auto"` (the default) anchors full charts to zero and rounds the top to a nice
   * value; sparklines run tight from min to max. `"fit"` wraps the data's own extent in nice rounded
   * bounds with nice ticks, for a rate or a balance that moves in a band far from zero (a line or an
   * area; bars read against zero, so keep `"auto"` for them). A `[min, max]` pair fixes it exactly,
   * with ticks dividing it evenly by the axis `count`.
   * @default "auto"
   */
  domain?: [number, number] | "auto" | "fit"
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
  /**
   * The active (hovered) category, controlled. `null` means none. Leave it undefined and the chart
   * tracks hover itself; set it to drive the crosshair, the active dot, the bar dim and an
   * `"active"` bar highlight from outside (a table row, a legend).
   */
  activeIndex?: number | null
  /**
   * Called when the active category changes: the index under the pointer as it crosses the
   * {@link ChartTooltip} bands, and `null` when it leaves the plot. Fires for controlled and
   * uncontrolled charts alike, only on a real change.
   */
  onActiveIndexChange?: (index: number | null) => void
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

/**
 * The y-scale a full chart draws against, from the raw data `extent`: nice 1/2/5 × 10^k bounds and
 * the tick set on that step. `"zero"` (the default look) stretches the range down to 0; `"fit"`
 * wraps the data's own extent, so a series moving in a band far from zero fills the plot. A flat
 * series is padded ±10% (or ±1 at zero) so it sits mid-plot instead of collapsing the scale.
 */
export function niceDomain(
  extent: [number, number],
  mode: "zero" | "fit" = "zero",
  count = 4,
): { domain: [number, number]; ticks: number[] } {
  let [min, max] = extent
  if (mode === "zero") min = Math.min(0, min)
  else if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1
    // Never pad across zero: a flat positive series keeps a floor at or above 0, and vice versa.
    min = min >= 0 ? Math.max(0, min - pad) : min - pad
    max = max <= 0 ? Math.min(0, max + pad) : max + pad
  }
  const { lo, hi, step } = niceScale(min, max, count)
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 1e6; v += step) ticks.push(Number(v.toPrecision(12)))
  return { domain: [lo, hi], ticks }
}

/**
 * How many categories each x-axis label covers so none collide: the smallest step at which one
 * label (`labelWidth` plus `gap`) fits the distance between the labelled categories, never below
 * `min`. `spacing` is the distance between two neighbouring categories.
 */
export function autoTickInterval(
  count: number,
  spacing: number,
  labelWidth: number,
  gap = 12,
  min = 1,
): number {
  const floor = Math.max(1, Math.floor(min))
  if (count <= 1 || spacing <= 0 || labelWidth <= 0) return floor
  return Math.max(floor, Math.ceil((labelWidth + gap) / spacing))
}

/** Whether the label at `i` shows at `step`, counted back from the LAST category, so the latest
 *  period always carries its name. */
export function tickShownFromEnd(i: number, count: number, step: number): boolean {
  return (count - 1 - i) % Math.max(1, step) === 0
}

interface Point {
  x: number
  y: number
}

/**
 * The slope at each point of a monotone cubic through `points` (Fritsch-Carlson, 1980). Interior
 * slopes average the two neighbouring secants, and drop to 0 where the data turns (a peak, a trough)
 * or runs flat, so an extreme sits exactly on its point. Each segment's pair is then scaled into the
 * monotone region (α² + β² ≤ 9), so no segment can rise past its higher end or dip past its lower.
 */
function monotoneSlopes(points: Point[]): number[] {
  const n = points.length
  const m = new Array<number>(n).fill(0)
  if (n < 2) return m
  const secant: number[] = []
  for (let k = 0; k < n - 1; k++) {
    const h = points[k + 1].x - points[k].x
    secant.push(h ? (points[k + 1].y - points[k].y) / h : 0)
  }
  m[0] = secant[0]
  m[n - 1] = secant[n - 2]
  for (let k = 1; k < n - 1; k++) {
    m[k] = secant[k - 1] * secant[k] <= 0 ? 0 : (secant[k - 1] + secant[k]) / 2
  }
  for (let k = 0; k < n - 1; k++) {
    if (secant[k] === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const a = m[k] / secant[k]
    const b = m[k + 1] / secant[k]
    const r = a * a + b * b
    if (r > 9) {
      const t = 3 / Math.sqrt(r)
      m[k] = t * a * secant[k]
      m[k + 1] = t * b * secant[k]
    }
  }
  return m
}

/**
 * The path commands that carry the pen through `points`, reaching the first one with `start` (`M`
 * to begin a subpath, `L` to continue one): straight segments for `linear`, cubic Béziers for
 * `monotone`. `reverse` walks the same curve backwards (an area's lower edge), with the slopes
 * computed left to right either way, so two stacked bands that share an edge draw it identically.
 */
export function curveThrough(
  points: Point[],
  curve: ChartCurve = "linear",
  start: "M" | "L" = "M",
  reverse = false,
): string {
  if (!points.length) return ""
  const order = reverse ? [...points].reverse() : points
  if (curve === "linear" || points.length < 3) {
    return order.map((p, k) => `${k === 0 ? start : "L"}${p.x},${p.y}`).join(" ")
  }
  const m = monotoneSlopes(points)
  // Hermite to Bézier: each control point sits a third of the way along the segment, on its slope.
  const segments: string[] = []
  for (let k = 0; k < points.length - 1; k++) {
    const p0 = points[k]
    const p1 = points[k + 1]
    const third = (p1.x - p0.x) / 3
    const c0 = `${p0.x + third},${p0.y + m[k] * third}`
    const c1 = `${p1.x - third},${p1.y - m[k + 1] * third}`
    segments.push(reverse ? `C${c1} ${c0} ${p0.x},${p0.y}` : `C${c0} ${c1} ${p1.x},${p1.y}`)
  }
  if (reverse) segments.reverse()
  return `${start}${order[0].x},${order[0].y} ${segments.join(" ")}`
}

/** Point `ref` (a consumer's, callback or object) at `node`. A module helper, so the ref merge below
 *  never reads or writes a ref during render. */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") return ref(node)
  if (ref) (ref as React.RefObject<T | null>).current = node
}

/**
 * One callback ref that feeds both the part's own `ref` (which it measures through) and a consumer's
 * `ref`, so passing one never silently replaces the other. Honors a React 19 callback ref's cleanup.
 */
function useMergedRef<T>(own: React.RefObject<T | null>, theirs: React.Ref<T> | undefined) {
  return React.useCallback(
    (node: T | null) => {
      assignRef(own, node)
      const cleanup = assignRef(theirs, node)
      return () => {
        assignRef(own, null)
        if (typeof cleanup === "function") cleanup()
        else assignRef(theirs, null)
      }
    },
    [own, theirs],
  )
}

export function Chart({
  data,
  index,
  config,
  domain: domainProp = "auto",
  sparkline = false,
  stack = false,
  padding,
  animate = true,
  crosshair,
  activeIndex,
  onActiveIndexChange,
  loading = false,
  empty,
  label,
  className,
  children,
  ref: refProp,
  ...props
}: ChartProps) {
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const [activeState, setActiveState] = React.useState<number | null>(null)
  const [lastActive, setLastActive] = React.useState(0)
  // The chart's resolved currentColor, captured for the portaled tooltip (see context.ink).
  const [ink, setInk] = React.useState("")
  // How many bar parts are drawn. A sparkline that draws bars lays its categories out in bands.
  const [barLayers, setBarLayers] = React.useState(0)
  const registerBars = React.useCallback(() => {
    setBarLayers((count) => count + 1)
    return () => setBarLayers((count) => count - 1)
  }, [])
  // Which categories each bar series paints in its highlight hue (see context.highlights). Only a
  // real change of hue or categories stores a new value, so publishing never loops.
  const [highlights, setHighlights] = React.useState<ChartContextValue["highlights"]>({})
  const markHighlight = React.useCallback((key: string, color: ChartColor, indices: number[]) => {
    setHighlights((prev) => {
      const current = prev[key]
      if (current && current.color === color && current.indices.join() === indices.join()) return prev
      return { ...prev, [key]: { color, indices } }
    })
    return () =>
      setHighlights((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
  }, [])

  // Lint-safe: setState lives in named handlers, only called from observer callbacks (never in render).
  const ref = React.useRef<HTMLDivElement | null>(null)
  // The root is measured through `ref`; a consumer's own `ref` is merged in rather than replacing it,
  // so passing one never silently stops the chart from sizing itself.
  const rootRef = useMergedRef(ref, refProp)
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

  // A sparkline plots points edge to edge. Once it draws bars it lays its categories out in bands,
  // like a full chart (so the first and last bars keep their whole width), and anchors to zero.
  const barSparkline = sparkline && barLayers > 0
  const pointLayout = sparkline && !barSparkline
  const fixedDomain = Array.isArray(domainProp) ? domainProp : null
  const fit = domainProp === "fit"

  // Raw extent over a series SUBSET (so each axis scales to its own series); stacked sums per
  // category. The zero anchor (or the fit) is applied by `makeScale`.
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
      return [Number.isFinite(min) ? min : 0, max]
    },
    [rows, stack],
  )

  // Full charts round the domain to "nice" bounds + a tick step (0, 2k, 4k…), so the axis reads
  // cleanly and grid lines land on round values: 0-anchored by default, around the data with "fit".
  // Sparklines (tight, or 0-anchored once they draw bars) and an explicit `domain` skip nicing.
  const makeScale = React.useCallback(
    (ext: [number, number], allowProp: boolean): { domain: [number, number]; ticks: number[] | null } => {
      if (allowProp && fixedDomain) return { domain: fixedDomain, ticks: null }
      if (pointLayout) return { domain: ext, ticks: null }
      if (sparkline) return { domain: [Math.min(0, ext[0]), Math.max(0, ext[1])], ticks: null }
      return niceDomain(ext, fit ? "fit" : "zero")
    },
    [fixedDomain, pointLayout, sparkline, fit],
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
  const band = pointLayout ? (n > 1 ? plot.width / (n - 1) : plot.width) : plot.width / Math.max(n, 1)

  const xFor = React.useCallback(
    (i: number) =>
      pointLayout
        ? plot.left + (n > 1 ? (i / (n - 1)) * plot.width : plot.width / 2)
        : plot.left + (i + 0.5) * band,
    [pointLayout, n, plot.left, plot.width, band],
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

  // Controlled when `activeIndex` is passed (null included); otherwise the chart owns hover.
  const controlled = activeIndex !== undefined
  const active = controlled ? activeIndex : activeState
  const setActive = React.useCallback(
    (i: number | null) => {
      if (i === active) return
      if (!controlled) setActiveState(i)
      onActiveIndexChange?.(i)
    },
    [active, controlled, onActiveIndexChange],
  )

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
  // below it. A line sparkline has a tight, non-0-anchored domain, so it falls back to the plot floor.
  const floor = plot.top + plot.height
  const baseline = pointLayout ? floor : Math.max(plot.top, Math.min(floor, yFor(0)))
  const baselineRight = pointLayout ? floor : Math.max(plot.top, Math.min(floor, yForRight(0)))

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
      registerBars={registerBars}
      highlights={highlights}
      markHighlight={markHighlight}
    >
      <div
        ref={rootRef}
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
                    return <td key={s.key}>{typeof v === "number" ? NUMBER.format(v) : ""}</td>
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

/** Split a series into runs of plotted indices. A non-numeric value is a gap that ends a run, unless
 *  `connectNulls` bridges it (the run carries on to the next valid point). */
function runsOf(data: ChartDatum[], key: string, connectNulls: boolean): number[][] {
  const runs: number[][] = []
  let run: number[] = []
  data.forEach((row, i) => {
    if (typeof row[key] === "number") run.push(i)
    else if (!connectNulls && run.length) {
      runs.push(run)
      run = []
    }
  })
  if (run.length) runs.push(run)
  return runs
}

/** Build the line `d` for a series. A non-numeric value is a gap: by default it BREAKS the line into
 *  separate subpaths (the next valid point starts a fresh `M`); `connectNulls` bridges across the gap
 *  instead. `curve` joins each run's points straight or as a monotone cubic. */
function linePath(
  data: ChartDatum[],
  key: string,
  xFor: (i: number) => number,
  yFor: (v: number) => number,
  connectNulls = false,
  curve: ChartCurve = "linear",
): string {
  return runsOf(data, key, connectNulls)
    .map((run) => curveThrough(run.map((i) => ({ x: xFor(i), y: yFor(data[i][key] as number) })), curve))
    .join(" ")
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
  curve: ChartCurve = "linear",
): string {
  return runsOf(data, key, connectNulls)
    .map((run) => {
      const first = xFor(run[0])
      const last = xFor(run[run.length - 1])
      const edge = curveThrough(run.map((i) => ({ x: xFor(i), y: yFor(data[i][key] as number) })), curve, "L")
      return `M${first},${baseline} ${edge} L${last},${baseline} Z`
    })
    .join(" ")
}

/** Build a (possibly stacked) area's filled band + its top-edge line in one pass. The band's top
 *  edge follows the series' upper value; its bottom edge is the cumulative below it when stacked, or
 *  the y-zero baseline otherwise. Gaps break both (unless `connectNulls`). Both edges take the same
 *  `curve`, so a stacked band's floor is exactly the curve of the band beneath it. */
function buildAreaPaths(
  data: ChartDatum[],
  series: ResolvedSeries[],
  key: string,
  xFor: (i: number) => number,
  yFor: (v: number) => number,
  baseline: number,
  stacked: boolean,
  connectNulls: boolean,
  curve: ChartCurve = "linear",
): { band: string; line: string } {
  const bands: string[] = []
  const lines: string[] = []
  for (const run of runsOf(data, key, connectNulls)) {
    const tops: Point[] = []
    const bots: Point[] = []
    for (const i of run) {
      const x = xFor(i)
      if (stacked) {
        // A run only holds numeric values, so the stacked range always exists.
        const r = stackedRange(data, series, i, key) as [number, number]
        tops.push({ x, y: yFor(Math.max(r[0], r[1])) })
        bots.push({ x, y: yFor(Math.min(r[0], r[1])) })
      } else {
        const yv = yFor(data[i][key] as number)
        tops.push({ x, y: Math.min(yv, baseline) })
        bots.push({ x, y: Math.max(yv, baseline) })
      }
    }
    bands.push(
      `M${tops[0].x},${tops[0].y} ${curveThrough(tops, curve, "L")} ${curveThrough(bots, curve, "L", true)} Z`,
    )
    lines.push(curveThrough(tops, curve))
  }
  return { band: bands.join(" "), line: lines.join(" ") }
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
  /**
   * How the line joins its points: straight segments, or a `monotone` cubic that runs smooth through
   * every point without overshooting a peak or a trough. Match it on the `ChartArea` underneath.
   * @default "linear"
   */
  curve?: ChartCurve
}

export function ChartLine({
  dataKey = "value",
  color,
  strokeWidth = 2,
  hideActiveDot = false,
  connectNulls = false,
  dashed = false,
  markEnd = false,
  curve = "linear",
  className,
  ...props
}: ChartLineProps) {
  const { data, seriesByKey, xFor, yFor, yForRight, active, lastActive, animate } =
    useChartContext("ChartLine")
  const hue = color ?? seriesByKey[dataKey]?.color ?? "blue"
  // Series on the right axis scale against its domain.
  const sy = seriesByKey[dataKey]?.axis === "right" ? yForRight : yFor
  const d = linePath(data, dataKey, xFor, sy, connectNulls, curve)
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
  /** How the top edge joins its points; match the `ChartLine` drawn over it. @default "linear" */
  curve?: ChartCurve
}

export function ChartArea({
  dataKey = "value",
  color,
  connectNulls = false,
  curve = "linear",
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
  const area = areaPath(data, dataKey, xFor, sy, base, connectNulls, curve)
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
  /** How every band's edges join their points. Stacked bands share one curve per seam. @default "linear" */
  curve?: ChartCurve
}

/**
 * ChartAreas: several area series at once. Set `stack` on {@link Chart} to stack them into a band
 * chart (each series sits on the cumulative total below it, with a more opaque fill so the bands
 * read apart); without it they overlap from the baseline like layered {@link ChartArea}s. Each band
 * carries its own top-edge line. For a single area, reach for {@link ChartArea} + {@link ChartLine}.
 */
export function ChartAreas({
  keys,
  connectNulls = false,
  curve = "linear",
  className,
  ...props
}: ChartAreasProps) {
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
          curve,
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
  /**
   * Print each bar's value just past its end (above a positive bar, below a negative one). Return
   * any inline content, so a figure can carry a glyph (a crown on the week's best). Give the Chart
   * a `padding.top` of about 24px so the tallest label has room.
   */
  label?: (value: number, index: number) => React.ReactNode
  /**
   * Paint chosen bars in `highlightColor` instead of the series hue, in one series: a category index
   * (today), a list of them, `"active"` (the bar under the pointer), or a predicate that also gets
   * the active index, so `(row, i, active) => i === (active ?? last)` keeps the latest bar lit until
   * another is hovered. Swapping the highlight recolors bars in place; it never replays the grow-in.
   * An `"active"` highlight is the hover feedback, so the other bars do not also dim.
   */
  highlight?: ChartBarHighlight
  /** The hue a highlighted bar takes. @default "brand" */
  highlightColor?: ChartColor
}

/** Height of the box a bar's value label sits in, and its gap to the bar end. */
const BAR_LABEL_HEIGHT = 16
const BAR_LABEL_GAP = 6

/** Whether bar `i` wears the highlight. */
function isHighlighted(
  highlight: ChartBarHighlight | undefined,
  row: ChartDatum,
  i: number,
  active: number | null,
): boolean {
  if (highlight === undefined) return false
  if (highlight === "active") return active === i
  if (typeof highlight === "number") return highlight === i
  if (Array.isArray(highlight)) return highlight.includes(i)
  return highlight(row, i, active)
}

export function ChartBar({
  dataKey = "value",
  color,
  barRatio = 0.62,
  radius = 4,
  label,
  highlight,
  highlightColor = "brand",
  className,
  ...props
}: ChartBarProps) {
  const {
    data,
    seriesByKey,
    xFor,
    yFor,
    yForRight,
    baseline,
    baselineRight,
    band,
    active,
    animate,
    registerBars,
    markHighlight,
  } = useChartContext("ChartBar")
  // Tell the root a bar is drawn, so a sparkline lays out bands and anchors its scale to zero.
  React.useLayoutEffect(registerBars, [registerBars])
  // Publish the lit categories (as a stable string, so an inline predicate never re-publishes an
  // unchanged set) for the tooltip swatch to match the bar.
  const lit =
    highlight === undefined
      ? ""
      : data
          .flatMap((row, i) => (typeof row[dataKey] === "number" && isHighlighted(highlight, row, i, active) ? [i] : []))
          .join(",")
  React.useLayoutEffect(() => {
    if (!lit) return
    return markHighlight(dataKey, highlightColor, lit.split(",").map(Number))
  }, [markHighlight, dataKey, highlightColor, lit])
  const hue = color ?? seriesByKey[dataKey]?.color ?? "blue"
  const onRight = seriesByKey[dataKey]?.axis === "right"
  const sy = onRight ? yForRight : yFor
  const base = onRight ? baselineRight : baseline
  const width = band * barRatio
  const n = data.length
  const dims = highlight !== "active"

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
        const delay = `${(i / Math.max(n, 1)) * duration.slow}ms`
        const on = isHighlighted(highlight, row, i, active)
        const ink = on ? highlightColor : hue
        return (
          <React.Fragment key={i}>
            <rect
              x={xFor(i) - width / 2}
              y={top}
              width={width}
              height={h}
              rx={Math.min(radius, width / 2)}
              {...props}
              // Non-active bars sit back; the hovered one comes forward. `fill-current`
              // ties the bar to the series hue, or to the highlight hue on a lit bar (its own
              // `text-*` over the group's, so a swap recolors in place and the grow-in holds).
              className={cn(
                "fill-current transition-[opacity,color] duration-fast ease-out",
                on && SERIES_TEXT[highlightColor],
                active === i && !on && barLift(hue),
                active != null && active !== i && dims ? barDim(ink) : "opacity-100",
                // Grow from the baseline edge: up for positives (origin-bottom), down for negatives.
                animate &&
                  cn(
                    negative ? "origin-top" : "origin-bottom",
                    "[transform-box:fill-box] animate-chart-bar motion-reduce:animate-none",
                  ),
                className,
              )}
              // Spread the column cascade left→right across the line-draw window (delays, not durations).
              style={animate ? { animationDelay: delay, ...props.style } : props.style}
            />
            {label && (
              // HTML in a foreignObject, so a label can hold an icon beside its figure. It spans the
              // whole category band and centers on the bar; it never takes the pointer, so the
              // tooltip bands underneath keep working through it.
              <foreignObject
                x={xFor(i) - band / 2}
                y={negative ? top + h + BAR_LABEL_GAP : top - BAR_LABEL_GAP - BAR_LABEL_HEIGHT}
                width={band}
                height={BAR_LABEL_HEIGHT}
                className="pointer-events-none overflow-visible"
              >
                <div
                  data-slot="chart-bar-label"
                  className={cn(
                    "flex h-full items-center justify-center gap-1 whitespace-nowrap text-[11px] font-medium leading-none tabular-nums text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0",
                    // The label lands once its bar has grown: same cascade delay, a fade instead of a rise.
                    animate && "animate-in fade-in-0 fill-mode-both duration-slow ease-out motion-reduce:animate-none",
                  )}
                  style={animate ? { animationDelay: delay } : undefined}
                >
                  {label(v, i)}
                </div>
              </foreignObject>
            )}
          </React.Fragment>
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
  const { data, series, seriesByKey, xFor, yFor, yForRight, baseline, baselineRight, band, active, animate, stacked, registerBars } =
    useChartContext("ChartBars")
  // Tell the root bars are drawn, so a sparkline lays out bands and anchors its scale to zero.
  React.useLayoutEffect(registerBars, [registerBars])
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
        const hue = seriesByKey[key]?.color ?? "blue"
        return (
        <SeriesGroup key={key} color={hue}>
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
                  "fill-current transition-[opacity,color] duration-fast ease-out",
                  active === i && barLift(hue),
                  active != null && active !== i ? barDim(hue) : "opacity-100",
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
  /**
   * Skip labels to avoid crowding. A number renders every Nth label, counted from the first.
   * `"auto"` measures the labels against the plot's width and keeps the fewest skips at which none
   * collide, counted back from the LAST category so the latest period always carries its name. It
   * re-thins as the chart resizes, so one axis reads on a phone and a wide screen alike.
   * @default 1
   */
  interval?: number | "auto"
  /**
   * With `interval="auto"`: the minimum clear space between two neighbouring labels, in px, measured
   * against the widest label. 12px keeps 11 to 12px axis figures apart without thinning a week or a
   * year out of a third-width card. @default 12
   */
  minTickGap?: number
  /**
   * With `interval="auto"`: never label more often than every Nth category, however wide the plot
   * (7 keeps a month of days reading by the week). @default 1
   */
  minInterval?: number
}

export function ChartXAxis({
  tickFormatter,
  interval = 1,
  minTickGap = 12,
  minInterval = 1,
  className,
  ref,
  ...props
}: ChartAxisProps) {
  const { data, index, xFor, plot, band, active } = useChartContext("ChartXAxis")
  const baseline = plot.top + plot.height
  const auto = interval === "auto"
  const labels = data.map((row, i) => {
    const raw = (index ? row[index] : i + 1) ?? i + 1
    return tickFormatter ? tickFormatter(raw, i) : String(raw)
  })

  // "auto" renders every label (the skipped ones hidden) so the widest can be measured, then picks
  // the step from that width. A layout effect, so the thinned axis is what paints first.
  const groupRef = React.useRef<SVGGElement>(null)
  const axisRef = useMergedRef(groupRef, ref)
  const [labelWidth, setLabelWidth] = React.useState(0)
  const signature = auto ? labels.join("\n") : ""
  React.useLayoutEffect(() => {
    const group = groupRef.current
    if (!auto || !group) return
    let live = true
    const measure = () => {
      if (!live) return
      let widest = 0
      group.querySelectorAll("text").forEach((text) => {
        if (typeof text.getComputedTextLength === "function") {
          widest = Math.max(widest, text.getComputedTextLength())
        }
      })
      setLabelWidth((prev) => (Math.abs(prev - widest) < 0.5 ? prev : widest))
    }
    measure()
    // Web fonts can land after the first measure and widen every label.
    document.fonts?.ready.then(measure)
    return () => {
      live = false
    }
  }, [auto, signature, className])
  const step = auto ? autoTickInterval(data.length, band, labelWidth, minTickGap, minInterval) : interval

  return (
    <g
      ref={axisRef}
      data-slot="chart-x-axis"
      // tabular-nums: categories are often figures (days, hours, years), and a row of ticks reads
      // evenly only when each label's digits hold one width.
      className={cn("fill-muted-foreground text-[11px] tabular-nums", className)}
      {...props}
    >
      {labels.map((label, i) => {
        const shown = auto ? tickShownFromEnd(i, data.length, step) : i % interval === 0
        if (!shown && !auto) return null
        return (
          <text
            key={i}
            x={xFor(i)}
            y={baseline + 16}
            textAnchor="middle"
            visibility={shown ? undefined : "hidden"}
            // The hovered category's tick steps up to the foreground, naming the column under the
            // pointer while the rest stay muted.
            className={cn("transition-[fill] duration-fast ease-out", active === i && "fill-foreground")}
          >
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
      // tabular-nums: these ticks stack into a column of figures, so the digits must hold one
      // width or the column's edge ripples and shifts as the domain rescales.
      className={cn("fill-muted-foreground text-[11px] tabular-nums", className)}
      {...props}
    >
      {(right ? ticksRight : ticks)(count).map((t, i) => (
        <text key={i} x={x} y={scaleY(t) + 3} textAnchor={right ? "start" : "end"}>
          {tickFormatter ? tickFormatter(t) : NUMBER.format(t)}
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
  return NUMBER.format(v)
}

export interface ChartTooltipProps {
  /** Format each series value in the bubble. */
  valueFormatter?: (value: number) => string
  /**
   * Format the heading. It gets the category label, then the whole row and its index, so a heading
   * can say more than the axis does (a full date, a weekday). Return text or inline content.
   */
  labelFormatter?: (value: string | number, datum: ChartDatum, index: number) => React.ReactNode
  /**
   * Extra rows under the series rows, below a hairline: a figure the chart does not draw, like the
   * net of income and expenses. Build each row with {@link ChartTooltipItem} so it lines up with the
   * series above. Return `null` to leave a category without one.
   */
  footer?: (datum: ChartDatum, index: number) => React.ReactNode
  /** Classes merged onto the shared tooltip bubble. */
  className?: string
}

export interface ChartTooltipItemProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The swatch hue. Omit it for a row without a swatch; the label still lines up with the rest. */
  color?: ChartColor
  /** What the row measures, in the muted ink. */
  label: React.ReactNode
  /** The figure, right-aligned in the foreground. */
  value: React.ReactNode
}

/**
 * ChartTooltipItem: one row of the chart's hover bubble (a swatch, a label, a right-aligned value).
 * {@link ChartTooltip} draws a row per series with it; use it in the tooltip's `footer` to add a row
 * of your own that reads as part of the same list.
 */
export function ChartTooltipItem({ color, label, value, className, ...props }: ChartTooltipItemProps) {
  const { ink } = useChartContext("ChartTooltipItem")
  return (
    <span data-slot="chart-tooltip-item" className={cn("flex items-center gap-2 text-xs", className)} {...props}>
      {/* The bubble is portaled, so a `current`-hued swatch can't inherit the chart's color via CSS
          (`bg-current` would read black); use the captured ink instead. */}
      <span
        className={cn("size-2 shrink-0 rounded-full", color && color !== "current" && SERIES_BG[color])}
        style={color === "current" ? { backgroundColor: ink || "currentColor" } : undefined}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-popover-foreground">{value}</span>
    </span>
  )
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
  footer,
  className,
}: ChartTooltipProps) {
  const { data, index, series, xFor, plot, band, setActive, highlights } = useChartContext("ChartTooltip")
  const slots = chartVariants()
  const left = plot.left
  const top = plot.top
  const bottom = plot.top + plot.height

  return (
    <g data-slot="chart-tooltip">
      {/* A data card, not a hint: the graph variant keeps it on the popover surface its ink is
          tuned for (muted labels, popover-foreground values). */}
      <TooltipGroup variant="graph" className={cn("px-2.5 py-2", className)} offset={[0, 10]}>
        {data.map((row, i) => {
          const raw = (index ? row[index] : i + 1) ?? i + 1
          const heading = labelFormatter ? labelFormatter(raw, row, i) : String(raw)
          const extra = footer?.(row, i)
          const content = (
            <div className={slots.tooltip()}>
              <span className="text-[11px] font-medium text-muted-foreground">{heading}</span>
              {series.map((s) => {
                const v = row[s.key]
                if (typeof v !== "number") return null
                // A bar painted in its highlight hue gets a swatch in that hue, matching what's drawn.
                const lit = highlights[s.key]
                return (
                  <ChartTooltipItem
                    key={s.key}
                    color={lit?.indices.includes(i) ? lit.color : s.color}
                    label={s.label}
                    // Per-series formatter (config.format) wins, else the shared valueFormatter.
                    value={(s.format ?? valueFormatter)(v)}
                  />
                )
              })}
              {extra != null && extra !== false && (
                <>
                  <TooltipSeparator />
                  <div data-slot="chart-tooltip-footer" className="flex flex-col gap-1.5">
                    {extra}
                  </div>
                </>
              )}
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
  /** A figure printed after the label in the foreground (a series total), so the key doubles as a summary. */
  value?: React.ReactNode
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
          {item.value == null ? (
            item.label
          ) : (
            <>
              {item.label}:
              <span className="font-medium tabular-nums text-foreground">{item.value}</span>
            </>
          )}
        </span>
      ))}
    </div>
  )
}
