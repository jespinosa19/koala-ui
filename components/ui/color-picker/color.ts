/**
 * Color math for ColorPicker: native, dependency-free (same spirit as the date primitives,
 * which run on the platform `Date`/`Intl` rather than pulling a library). HSV is the working
 * model: a 2D saturation/value square + a 1D hue rail map cleanly onto it, and keeping HSV as
 * the source of truth means dragging value to 0 (black) doesn't lose the hue the way a round-trip
 * through hex would. We convert to RGB/HEX only at the edges (display + `onValueChange`).
 */

export interface Hsva {
  /** Hue, 0–360. */
  h: number
  /** Saturation, 0–100. */
  s: number
  /** Value / brightness, 0–100. */
  v: number
  /** Alpha, 0–1. */
  a: number
}

export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const round = (n: number) => Math.round(n)

// ─── HSV ⇄ RGB ──────────────────────────────────────────────────────────────────

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  h = ((h % 360) + 360) % 360
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return { r: round((r + m) * 255), g: round((g + m) * 255), b: round((b + m) * 255), a }
}

export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h: round(h), s: round(s * 100), v: round(max * 100), a }
}

// ─── HEX ⇄ … ────────────────────────────────────────────────────────────────────

const toHex = (n: number) => clamp(round(n), 0, 255).toString(16).padStart(2, "0")

/** `{r,g,b,a}` → `#rrggbb`, or `#rrggbbaa` when `withAlpha` and alpha < 1. */
export function rgbaToHex({ r, g, b, a }: Rgba, withAlpha = false): string {
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  return withAlpha && a < 1 ? `${base}${toHex(a * 255)}` : base
}

export function hsvaToHex(hsva: Hsva, withAlpha = false): string {
  return rgbaToHex(hsvaToRgba(hsva), withAlpha)
}

/**
 * Parse `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` (with or without the leading `#`).
 * Returns `null` on anything malformed, so callers can ignore mid-typing junk.
 */
export function hexToRgba(input: string): Rgba | null {
  let hex = input.trim().replace(/^#/, "")
  if (/^[\da-f]{3,4}$/i.test(hex)) {
    // Shorthand: expand each nibble (#abc → #aabbcc).
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }
  if (!/^[\da-f]{6}$/i.test(hex) && !/^[\da-f]{8}$/i.test(hex)) return null
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
  return { r, g, b, a }
}

export function hexToHsva(input: string): Hsva | null {
  const rgba = hexToRgba(input)
  return rgba ? rgbaToHsva(rgba) : null
}

/** A plain `rgb()/rgba()` string, used for the live gradient stops in the picker. */
export function hsvaToRgbaString(hsva: Hsva): string {
  const { r, g, b, a } = hsvaToRgba(hsva)
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
}

/**
 * Reconcile a freshly parsed color against the working HSV. When the parsed color is grey/black
 * (saturation or value collapses to 0) hue is mathematically undefined, so we keep the previous
 * hue/saturation instead of letting the picker snap to red. Keeps dragging brightness to black
 * and back lossless.
 */
export function reconcileHsva(next: Hsva, prev: Hsva): Hsva {
  return {
    h: next.s === 0 ? prev.h : next.h,
    s: next.v === 0 ? prev.s : next.s,
    v: next.v,
    a: next.a,
  }
}

// ─── Gradient model ────────────────────────────────────────────────────────────────
//
// The gradient mode keeps a list of color stops plus a type/angle. Each stop owns a stable `id`
// so a React key survives re-sorting (stops render in array order but serialize by position). We
// only ever *write* gradients (no parser for incoming CSS strings): the editor starts from a
// default or a caller-supplied `GradientValue` and emits `linear-gradient()/radial-gradient()`.

export type GradientType = "linear" | "radial"

export interface GradientStop {
  /** Stable identity, so a key survives re-sorting and a drag never remounts the handle. */
  id: string
  /** Hex (`#rrggbb`, or `#rrggbbaa` when the stop carries alpha). */
  color: string
  /** Position along the gradient axis, 0–100. */
  position: number
}

export interface GradientValue {
  type: GradientType
  /** Angle in degrees for `linear` gradients (ignored for `radial`). */
  angle: number
  stops: GradientStop[]
}

/** A copy of the stops sorted by position (ascending), for serialization + bar rendering. */
export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

/** Serialize the stops to a `color pos%, …` list, sorted left→right. */
function stopList(stops: GradientStop[]): string {
  return sortStops(stops)
    .map((s) => `${s.color} ${round(clamp(s.position, 0, 100))}%`)
    .join(", ")
}

/** Serialize a gradient to a CSS `linear-gradient()/radial-gradient()` value. */
export function gradientToCss(g: GradientValue): string {
  return g.type === "radial"
    ? `radial-gradient(circle, ${stopList(g.stops)})`
    : `linear-gradient(${round(g.angle)}deg, ${stopList(g.stops)})`
}

/**
 * A left→right linear gradient of the stops, for the editor's preview bar. The bar always reads
 * horizontally regardless of the gradient's real type/angle, so it stays a legible stop track.
 */
export function stopsToBarCss(stops: GradientStop[]): string {
  return `linear-gradient(to right, ${stopList(stops)})`
}

/**
 * A fixed-geometry preview of the stops for the gradient-type tiles: a left→right bar for linear,
 * a centred circle for radial. Geometry only (the real angle is ignored) so each tile reads as its
 * *type* at a glance, the way Figma's fill-type row previews each kind.
 */
export function stopsToTypePreviewCss(type: GradientType, stops: GradientStop[]): string {
  return type === "radial"
    ? `radial-gradient(circle, ${stopList(stops)})`
    : `linear-gradient(to right, ${stopList(stops)})`
}

/**
 * Linear-RGB interpolate the gradient color at `position` (0–100). Used when a click on empty
 * track adds a stop: it samples the color already showing there, so the new stop lands invisibly
 * and the user tweaks from a sensible base (the Figma behaviour) rather than a jarring default.
 */
export function colorAtPosition(stops: GradientStop[], position: number): string {
  const sorted = sortStops(stops)
  if (sorted.length === 0) return "#ffffff"
  if (position <= sorted[0].position) return sorted[0].color
  const last = sorted[sorted.length - 1]
  if (position >= last.position) return last.color

  let lo = sorted[0]
  let hi = last
  for (let i = 0; i < sorted.length - 1; i++) {
    if (position >= sorted[i].position && position <= sorted[i + 1].position) {
      lo = sorted[i]
      hi = sorted[i + 1]
      break
    }
  }
  const span = hi.position - lo.position || 1
  const t = (position - lo.position) / span
  const a = hexToRgba(lo.color) ?? { r: 0, g: 0, b: 0, a: 1 }
  const b = hexToRgba(hi.color) ?? { r: 0, g: 0, b: 0, a: 1 }
  const mix: Rgba = {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  }
  return rgbaToHex(mix, mix.a < 1)
}
