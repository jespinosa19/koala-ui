"use client"

import * as React from "react"
import { ArrowCounterClockwise } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { THEMES, type Theme } from "@/components/theme-provider"
import { type Accent } from "@/components/accent-provider"
import { DensityProvider, type Density } from "@/lib/density"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { InputRoot, InputField, InputLabel } from "@/components/ui/input"
import {
  ColorPicker,
  ColorPickerPopover,
  ColorPickerTrigger,
  ColorPickerContent,
} from "@/components/ui/color-picker"
import { CodeSnippet } from "@/components/docs/code-snippet"

/**
 * The eight built-in accent presets, mirrored from the `[data-accent="…"]` blocks in
 * app/globals.css. Kept as literal values here (rather than read off the DOM) so the
 * playground is fully self-contained: the same string drives the live preview, the swatch,
 * and the copyable CSS. If you add or retune an accent in globals.css, mirror it here.
 */
const ACCENT_PRESETS: { name: Accent; value: string }[] = [
  { name: "orange", value: "oklch(0.648 0.222 34.2)" },
  { name: "red", value: "oklch(0.585 0.222 27)" },
  { name: "amber", value: "oklch(0.705 0.165 70)" },
  { name: "green", value: "oklch(0.62 0.17 150)" },
  { name: "teal", value: "oklch(0.6 0.13 192)" },
  { name: "blue", value: "oklch(0.55 0.2 255)" },
  { name: "violet", value: "oklch(0.52 0.23 285)" },
  { name: "pink", value: "oklch(0.59 0.23 354)" },
]

/** Koala's tuned default radius (xl = ×1.4 lands cards at exactly 16px). */
const DEFAULT_RADIUS = 0.71

/**
 * Base-radius presets for the `--radius` knob. Each value is the base ring (which `rounded-lg`
 * resolves to verbatim); the rest of the scale re-rounds concentrically off it. Mirrors the
 * swatch language of the accent row: each preset previews its own corner.
 */
const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: "None", value: 0 },
  { label: "Small", value: 0.35 },
  { label: "Default", value: DEFAULT_RADIUS },
  { label: "Large", value: 1 },
  { label: "Full", value: 1.5 },
]

const DEFAULT_BRAND = ACCENT_PRESETS[0]

/** The theme the playground opens on. */
const DEFAULT_THEME: Theme = "dark"

/** Koala's density default: the tight, app-UI tuning. */
const DEFAULT_DENSITY: Density = "compact"

const DENSITIES: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
]

type BrandLabel = Accent | "custom"

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  moonlight: "Moonlight",
}

/**
 * Selected-swatch indicator. Mirrors the Checkbox's self-drawing stroked glyph (same path and
 * `animate-check-draw`), rendered white so it sits on any accent dot. A hairline drop-shadow
 * keeps it legible on the lighter accents (amber).
 */
const SwatchCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
    aria-hidden
  >
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      pathLength={1}
      className="animate-check-draw [stroke-dasharray:1]"
    />
  </svg>
)

const SectionLabel = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <p
    className={cn(
      "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
      className,
    )}
  >
    {children}
  </p>
)

/**
 * ThemePlayground: a self-contained, live theming sandbox. Theme, accent (`--brand`) and
 * corner radius (`--radius`) are applied as scoped CSS variables on the preview surface, so
 * a real cross-section of Koala components restyles instantly without touching the page's
 * own theme. The copyable CSS mirrors exactly what the consumer would drop into their
 * `:root`. All state lives in handlers (no effects), per the repo's strict react-hooks lint.
 */
export function ThemePlayground() {
  const [theme, setTheme] = React.useState<Theme>(DEFAULT_THEME)
  const [brand, setBrand] = React.useState<string>(DEFAULT_BRAND.value)
  const [brandLabel, setBrandLabel] = React.useState<BrandLabel>(DEFAULT_BRAND.name)
  // The DS ColorPicker speaks hex; presets are oklch, so the custom panel keeps its own hex value.
  const [customHex, setCustomHex] = React.useState<string>("#f84416")
  const [radius, setRadius] = React.useState<number>(DEFAULT_RADIUS)
  const [density, setDensity] = React.useState<Density>(DEFAULT_DENSITY)

  const isDefault =
    theme === DEFAULT_THEME &&
    brandLabel === DEFAULT_BRAND.name &&
    radius === DEFAULT_RADIUS &&
    density === DEFAULT_DENSITY

  function selectPreset(preset: (typeof ACCENT_PRESETS)[number]) {
    setBrand(preset.value)
    setBrandLabel(preset.name)
  }

  function selectCustom(hex: string) {
    setCustomHex(hex)
    setBrand(hex)
    setBrandLabel("custom")
  }

  function reset() {
    setTheme(DEFAULT_THEME)
    setBrand(DEFAULT_BRAND.value)
    setBrandLabel(DEFAULT_BRAND.name)
    setCustomHex("#f84416")
    setRadius(DEFAULT_RADIUS)
    setDensity(DEFAULT_DENSITY)
  }

  // Scope the three knobs to the preview only. --ring-brand is derived from --brand the same
  // way :root does, so focus rings track the chosen accent (we set it explicitly because a
  // child override of --brand alone won't recompute a parent-declared --ring-brand).
  const previewStyle = {
    "--brand": brand,
    "--ring-brand": `color-mix(in oklch, ${brand} 10%, transparent)`,
    "--radius": `${radius}rem`,
  } as React.CSSProperties

  // Scope the theme to the preview canvas. `light` carries its own class (mirrored from
  // :root in globals.css) so it can override the docs page's own dark/moonlight theme
  // instead of inheriting it. Without it, a light preview reads dark inside a dark page.
  const themeClass = theme

  const generatedCss = [
    ":root {",
    `  --brand: ${brand};`,
    `  --radius: ${radius}rem;`,
    "}",
  ].join("\n")

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* ── Controls ─────────────────────────────────────────────────────── */}
      {/* items-end lines every group up by the bottom of its control (the button row, swatch row,
          slider, Reset); labels float above, so the whole bar reads as one aligned strip instead
          of Reset wrapping awkwardly onto its own line. */}
      <div className="flex flex-col gap-6 border-b border-border p-5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8 sm:gap-y-6">
        {/* Theme */}
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Theme</SectionLabel>
          <ButtonGroup size="sm" variant="outline" attached>
            {THEMES.map((t) => (
              <ButtonGroupItem
                key={t}
                aria-pressed={theme === t}
                variant={theme === t ? "secondary" : "outline"}
                onClick={() => setTheme(t)}
              >
                {THEME_LABELS[t]}
              </ButtonGroupItem>
            ))}
          </ButtonGroup>
        </div>

        {/* Accent */}
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Accent · --brand</SectionLabel>
          <div className="flex items-center gap-3">
            {ACCENT_PRESETS.map((preset) => {
              const active = brandLabel === preset.name
              return (
                <button
                  key={preset.name}
                  type="button"
                  aria-label={preset.name}
                  aria-pressed={active}
                  onClick={() => selectPreset(preset)}
                  // The selected ring is the accent's own color (via outline, so it never collides
                  // with the box-shadow focus ring); the offset gap shows the card beneath.
                  style={{
                    backgroundColor: preset.value,
                    outlineColor: active ? preset.value : undefined,
                  }}
                  className={cn(
                    "relative grid size-7 cursor-pointer place-items-center rounded-full",
                    "transition-transform duration-fast ease-out active:scale-[0.96]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    active && "outline outline-2 outline-offset-2",
                    // Expand the hit target to ~40px without growing the dot (the slider-thumb trick).
                    "before:absolute before:-inset-1.5 before:content-['']",
                  )}
                >
                  {active && <SwatchCheck />}
                </button>
              )
            })}

            {/* Custom color: the DS ColorPicker in a popover (square, hue rail, hex, eyedropper).
                The dot trigger keeps the swatch language: rainbow until a custom value is picked. */}
            <ColorPickerPopover>
              <ColorPickerTrigger asChild>
                <button
                  type="button"
                  aria-label="Custom accent color"
                  aria-pressed={brandLabel === "custom"}
                  title="Custom color"
                  style={{
                    background:
                      brandLabel === "custom"
                        ? brand
                        : "conic-gradient(from 90deg, #f84416, #f5b800, #2ecc71, #2d9cdb, #9b51e0, #f84416)",
                    outlineColor: brandLabel === "custom" ? brand : undefined,
                  }}
                  className={cn(
                    "relative ml-0.5 grid size-7 cursor-pointer place-items-center rounded-full",
                    "transition-transform duration-fast ease-out active:scale-[0.96]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    brandLabel === "custom" && "outline outline-2 outline-offset-2",
                    "before:absolute before:-inset-1.5 before:content-['']",
                  )}
                >
                  {brandLabel === "custom" && <SwatchCheck />}
                </button>
              </ColorPickerTrigger>
              <ColorPickerContent align="start">
                <ColorPicker value={customHex} onValueChange={selectCustom} />
              </ColorPickerContent>
            </ColorPickerPopover>
          </div>
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Radius · --radius</SectionLabel>
          <div className="flex items-center gap-3">
            {RADIUS_PRESETS.map((preset) => {
              const active = radius === preset.value
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-label={`${preset.label} (${preset.value}rem)`}
                  aria-pressed={active}
                  title={`${preset.label} · ${preset.value}rem`}
                  onClick={() => setRadius(preset.value)}
                  className={cn(
                    "relative grid size-7 cursor-pointer place-items-center",
                    "transition-transform duration-fast ease-out active:scale-[0.96]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    // Expand the hit target to ~40px without growing the swatch.
                    "before:absolute before:-inset-1.5 before:content-['']",
                  )}
                >
                  {/* The swatch previews its own corner: only the top-left is rounded so even
                      tiny differences read at a glance, and the border carries the radius. */}
                  <span
                    aria-hidden
                    style={{ borderTopLeftRadius: `${preset.value}rem` }}
                    className={cn(
                      "size-7 border-2 bg-muted/40 transition-colors duration-fast ease-out",
                      active
                        ? "border-brand bg-brand/10"
                        : "border-border hover:border-muted-foreground",
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Density */}
        <div className="flex flex-col gap-2.5">
          <SectionLabel>Density</SectionLabel>
          <ButtonGroup size="sm" variant="outline" attached>
            {DENSITIES.map((d) => (
              <ButtonGroupItem
                key={d.value}
                aria-pressed={density === d.value}
                variant={density === d.value ? "secondary" : "outline"}
                onClick={() => setDensity(d.value)}
              >
                {d.label}
              </ButtonGroupItem>
            ))}
          </ButtonGroup>
        </div>

        {/* Reset: pinned right, aligned to the control baseline via the parent's items-end. */}
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isDefault}
          className="sm:ml-auto"
        >
          <ArrowCounterClockwise weight="bold" />
          Reset
        </Button>
      </div>

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex justify-center bg-background p-6 text-foreground sm:p-10",
          // Smoothly retune the preview when density flips. Scope the transition to the Card
          // slots only (data-slot^=card): exactly the elements density resizes (padding, gap,
          // title size) and the only ones with no transition of their own, so we never clobber
          // the interactive controls' own transform/color animations, and never `transition: all`.
          "[&_[data-slot^=card]]:transition-[padding,gap,font-size] [&_[data-slot^=card]]:duration-base [&_[data-slot^=card]]:ease-out",
          themeClass,
        )}
        style={previewStyle}
      >
        <DensityProvider density={density}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Workspace
              <Badge>Pro</Badge>
            </CardTitle>
            <CardDescription>
              Every surface, control and focus ring below reads the same tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <InputRoot>
              <InputLabel htmlFor="playground-name">Display name</InputLabel>
              <InputField id="playground-name" placeholder="Koala team" defaultValue="Koala team" />
            </InputRoot>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Volume</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">68</span>
              </div>
              <Slider defaultValue={[68]} variant="brand" aria-label="Volume" />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="playground-switch" className="text-sm text-foreground">
                Email notifications
              </label>
              <Switch id="playground-switch" defaultChecked />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-foreground">
              <Checkbox defaultChecked />
              Subscribe to the changelog
            </label>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Save changes</Button>
          </CardFooter>
        </Card>
        </DensityProvider>
      </div>

      {/* ── Generated CSS ────────────────────────────────────────────────── */}
      <div className="border-t border-border p-5">
        <p className="mb-3 text-sm text-muted-foreground">
          Drop this into your global stylesheet to ship the look above
          {brandLabel !== "custom" && (
            <>
              {" "}
              (the same accent is also available as{" "}
              <code className="font-mono text-xs">data-accent=&quot;{brandLabel}&quot;</code>)
            </>
          )}
          .
        </p>
        <CodeSnippet code={generatedCss} lang="css" filename="globals.css" />
      </div>
    </div>
  )
}
