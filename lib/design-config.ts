export const DESIGN_THEMES = ["light", "dark", "cream", "moonlight"] as const
export type DesignTheme = (typeof DESIGN_THEMES)[number]

export const COLOR_ROLES = [
  "background",
  "card",
  "foreground",
  "body",
  "muted-foreground",
  "muted",
  "border",
] as const
export type ColorRole = (typeof COLOR_ROLES)[number]

export const ROLE_TOKENS: Record<ColorRole, string[]> = {
  background: ["background"],
  card: ["card", "popover"],
  foreground: ["foreground", "card-foreground", "popover-foreground"],
  body: ["body"],
  "muted-foreground": ["muted-foreground"],
  muted: ["muted", "secondary", "accent"],
  border: ["border"],
}

export type TypePairing = "inter-dm" | "inter" | "dm"

export const EASES = {
  koala: "cubic-bezier(0.23, 1, 0.32, 1)",
  soft: "cubic-bezier(0.4, 0, 0.2, 1)",
  snappy: "cubic-bezier(0.16, 1, 0.3, 1)",
  linear: "linear",
} as const
export type EaseName = keyof typeof EASES

export interface DesignConfig {
  accent?: string
  radius?: number
  pills?: boolean
  shadowDepth?: number
  durations?: Partial<Record<DurationStep, number>>
  ease?: EaseName
  spacing?: number
  text?: Partial<Record<TextStep, TextSpec>>
  tracking?: number
  weightMedium?: number
  weightSemibold?: number
  weightBold?: number
  controls?: Partial<Record<ControlStep, number>>
  hairline?: number
  figureWeight?: number
  figureTracking?: number
  figureFace?: "heading" | "sans"
  type?: TypePairing
  themes?: Partial<Record<DesignTheme, Partial<Record<ColorRole, string>>>>
}

export const DEFAULTS = {
  spacing: 0.25,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
}

export const CONTROLS = { sm: 32, md: 36, lg: 40, xl: 44 }
export type ControlStep = keyof typeof CONTROLS

export const FIGURE = { weight: 600, tracking: -0.025 }

export const DURATIONS = { fast: 160, base: 300, slow: 450 }
export type DurationStep = keyof typeof DURATIONS

export interface TextSpec {
  size: number
  line: number
}

export const TEXT_SCALE = {
  xs: { size: 12, line: 16 },
  sm: { size: 14, line: 20 },
  base: { size: 16, line: 24 },
  lg: { size: 18, line: 28 },
  xl: { size: 20, line: 28 },
  "2xl": { size: 24, line: 32 },
  "3xl": { size: 30, line: 36 },
  "4xl": { size: 36, line: 40 },
  "5xl": { size: 48, line: 48 },
  "6xl": { size: 60, line: 60 },
} satisfies Record<string, TextSpec>
export type TextStep = keyof typeof TEXT_SCALE

const TRACKING: Record<string, number> = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
}

function rootVars(config: DesignConfig) {
  const vars: Record<string, string> = {}
  const fixed = (n: number, d = 4) => String(Number(n.toFixed(d)))
  if (config.radius !== undefined) vars.radius = `${config.radius}rem`
  if (config.pills === false) vars["radius-pill-factor"] = "1"
  for (const [step, ms] of Object.entries(config.durations ?? {})) vars[`duration-${step}`] = `${ms}ms`
  if (config.ease) vars["ease-out"] = EASES[config.ease]
  if (config.spacing !== undefined) vars.spacing = `${config.spacing}rem`
  for (const [step, spec] of Object.entries(config.text ?? {})) {
    vars[`text-${step}`] = `${fixed(spec.size / 16)}rem`
    vars[`text-${step}--line-height`] = fixed(spec.line / spec.size, 4)
  }
  if (config.tracking !== undefined) {
    for (const [step, em] of Object.entries(TRACKING)) vars[`tracking-${step}`] = `${fixed(em + config.tracking)}em`
  }
  if (config.weightMedium !== undefined) vars["font-weight-medium"] = String(config.weightMedium)
  if (config.weightSemibold !== undefined) vars["font-weight-semibold"] = String(config.weightSemibold)
  if (config.weightBold !== undefined) vars["font-weight-bold"] = String(config.weightBold)
  for (const [step, px] of Object.entries(config.controls ?? {})) vars[`spacing-control-${step}`] = `${fixed(px / 16)}rem`
  if (config.hairline !== undefined) vars.hairline = `${config.hairline}px`
  if (config.figureWeight !== undefined) vars["font-weight-numeral"] = String(config.figureWeight)
  if (config.figureTracking !== undefined) vars["tracking-figure"] = `${config.figureTracking}em`
  if (config.figureFace === "sans") vars["font-figure"] = "var(--font-sans)"
  return vars
}

const SHADOW_INK: Record<DesignTheme, string> = {
  light: "#000000",
  cream: "#2a1f12",
  dark: "#000000",
  moonlight: "#02050f",
}

const SHADOW_ALPHA: Record<DesignTheme, number[][]> = {
  light: [[0.05], [0.1, 0.1], [0.1, 0.1], [0.1, 0.1], [0.1, 0.1]],
  cream: [[0.06], [0.11, 0.11], [0.11, 0.11], [0.11, 0.11], [0.11, 0.11]],
  dark: [[0.25], [0.35, 0.3], [0.4, 0.3], [0.4, 0.3], [0.45, 0.3]],
  moonlight: [[0.35], [0.45, 0.35], [0.5, 0.4], [0.5, 0.4], [0.55, 0.4]],
}

const SHADOW_GEOMETRY = [
  ["0 1px 2px"],
  ["0 1px 3px", "0 1px 2px -1px"],
  ["0 4px 6px -1px", "0 2px 4px -2px"],
  ["0 10px 15px -3px", "0 4px 6px -4px"],
  ["0 20px 25px -5px", "0 8px 10px -6px"],
]

const SHADOW_STEPS = ["xs", "sm", "md", "lg", "xl"]

export function parseHex(hex: string) {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }
}

export function hexToOklch(hex: string) {
  const { r, g, b, a } = parseHex(hex)
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.sqrt(A * A + B * B)
  const H = C < 0.0005 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c: C, h: H, a }
}

export function oklchString(hex: string, alpha = 1) {
  const { l, c, h, a } = hexToOklch(hex)
  const round = (v: number, d: number) => Number(v.toFixed(d))
  const alphaOut = round(a * alpha, 3)
  const tail = alphaOut < 1 ? ` / ${round(alphaOut * 100, 1)}%` : ""
  return `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)}${tail})`
}

function rgbString(hex: string, alpha = 1) {
  const { r, g, b, a } = parseHex(hex)
  return `rgb(${r} ${g} ${b} / ${Number((a * alpha).toFixed(3))})`
}

export function brandForeground(hex: string) {
  return hexToOklch(hex).l > 0.78 ? "#171717" : "#ffffff"
}

function shadowSet(theme: DesignTheme, depth: number, paint: (hex: string, alpha: number) => string) {
  const ink = SHADOW_INK[theme]
  return Object.fromEntries(
    SHADOW_STEPS.map((step, i) => [
      `shadow-${step}`,
      SHADOW_GEOMETRY[i]
        .map((geo, j) => `${geo} ${paint(ink, Math.min(1, SHADOW_ALPHA[theme][i][j] * depth))}`)
        .join(", "),
    ]),
  )
}

export function isEmptyConfig(config: DesignConfig) {
  return Object.keys(config).length === 0
}

function block(selector: string, vars: Record<string, string>) {
  const body = Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`)
  return body.length ? `${selector} {\n${body.join("\n")}\n}\n` : ""
}

const THEME_SELECTORS: Record<DesignTheme, string> = {
  light: ":root:not(.dark, .cream, .moonlight),\n.light.light",
  cream: ".cream.cream",
  dark: ".dark.dark",
  moonlight: ".moonlight.moonlight,\n.moonlight.moonlight .dark",
}

export function buildKoalaCss(config: DesignConfig) {
  if (isEmptyConfig(config)) return ""
  const out: string[] = []

  if (config.accent) {
    out.push(
      block(':root:not([data-accent]),\n[data-accent="orange"][data-accent]', {
        brand: oklchString(config.accent),
        "brand-foreground": oklchString(brandForeground(config.accent)),
      }),
    )
  }

  out.push(block(":root:root", rootVars(config)))

  if (config.type === "inter") out.push(block("html:root", { "font-heading": "var(--font-sans)" }))
  if (config.type === "dm") out.push(block("html:root", { "font-sans": "var(--font-heading)" }))

  for (const theme of DESIGN_THEMES) {
    const vars: Record<string, string> = {}
    for (const [role, hex] of Object.entries(config.themes?.[theme] ?? {})) {
      for (const token of ROLE_TOKENS[role as ColorRole]) vars[token] = oklchString(hex)
    }
    if (config.shadowDepth !== undefined) {
      Object.assign(vars, shadowSet(theme, config.shadowDepth, oklchString))
    }
    out.push(block(THEME_SELECTORS[theme], vars))
  }

  return out.filter(Boolean).join("\n")
}

export function buildScopeVars(config: DesignConfig, theme: DesignTheme) {
  const vars = buildDemoVars({ ...config, type: undefined }, theme)
  if (config.type === "inter") vars["--font-heading"] = "var(--font-sans)"
  if (config.type === "dm") vars["--font-sans"] = "var(--font-heading)"
  return vars
}

export function buildDemoVars(config: DesignConfig, theme: DesignTheme) {
  const vars: Record<string, string> = {}
  const color = (token: string, hex: string) => {
    const { r, g, b, a } = parseHex(hex)
    vars[`--${token}`] = rgbString(hex)
    vars[`--${token}-r`] = String(r)
    vars[`--${token}-g`] = String(g)
    vars[`--${token}-b`] = String(b)
    vars[`--${token}-a`] = String(Number(a.toFixed(3)))
  }

  if (config.accent) {
    color("brand", config.accent)
    color("brand-foreground", brandForeground(config.accent))
  }
  for (const [k, v] of Object.entries(rootVars(config))) vars[`--${k}`] = v
  if (config.type === "inter") vars["--font-heading"] = '"Inter Variable", ui-sans-serif, system-ui, sans-serif'
  if (config.type === "dm") vars["--font-sans"] = '"DM Sans Variable", ui-sans-serif, system-ui, sans-serif'

  for (const [role, hex] of Object.entries(config.themes?.[theme] ?? {})) {
    for (const token of ROLE_TOKENS[role as ColorRole]) color(token, hex)
  }
  if (config.shadowDepth !== undefined) {
    for (const [k, v] of Object.entries(shadowSet(theme, config.shadowDepth, rgbString))) vars[`--${k}`] = v
  }
  return vars
}
