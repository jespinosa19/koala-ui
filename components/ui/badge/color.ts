export interface Rgb {
  r: number
  g: number
  b: number
  a: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function parseColor(input: string): Rgb | null {
  const value = input.trim().toLowerCase()

  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value)
  if (hex) {
    let h = hex[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join("")
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    }
  }

  const fn = /^rgba?\(\s*([^)]*)\)$/.exec(value)
  if (fn) {
    const parts = fn[1].split(/\s*[,/]\s*|\s+/).filter(Boolean)
    if (parts.length < 3 || parts.length > 4) return null
    const channel = (p: string) =>
      p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p)
    const [r, g, b] = parts.slice(0, 3).map(channel)
    const a = parts[3] === undefined ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])
    if ([r, g, b, a].some((n) => Number.isNaN(n))) return null
    return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255), a: clamp(a, 0, 1) }
  }

  return null
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const DARK_INK_LUMINANCE = 0.0030

export function readableInk(color: string): "dark" | "light" {
  const rgb = parseColor(color)
  if (!rgb) return "light"
  const l = relativeLuminance(rgb)
  const onWhite = 1.05 / (l + 0.05)
  const onDark = (l + 0.05) / (DARK_INK_LUMINANCE + 0.05)
  return onDark > onWhite ? "dark" : "light"
}

export function tint(color: string, alpha: number): string {
  const rgb = parseColor(color)
  if (rgb) {
    const a = Math.round(rgb.a * alpha * 1000) / 1000
    return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`
  }
  return `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`
}
