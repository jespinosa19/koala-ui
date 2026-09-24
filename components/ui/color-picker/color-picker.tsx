"use client"

import * as React from "react"

import { type VariantProps } from "@/lib/tv"
import { type Density } from "@/lib/density"

import {
  clamp,
  colorAtPosition,
  gradientToCss,
  hexToHsva,
  hsvaToHex,
  reconcileHsva,
  sortStops,
  type GradientValue,
  type Hsva,
} from "./color"
import {
  ColorPickerProvider,
  colorPickerVariants,
  defaultColorPresets,
  type ColorPickerFormatValue,
  type ColorPickerImageValue,
  type ColorPickerMode,
} from "./context"
import { ColorPickerArea } from "./area"
import { ColorPickerControls } from "./rails"
import { ColorPickerEyeDropper, ColorPickerFields } from "./fields"
import { ColorPickerFormat } from "./format"
import { ColorPickerSwatches } from "./swatches"
import { ColorPickerModes } from "./modes"
import { ColorPickerGradient } from "./gradient"
import { ColorPickerImage } from "./image"

/**
 * ColorPicker: a full HSV color picker. The panel is a card: a HEX/HSL/RGB format switcher, a
 * draggable saturation/value square, hue and alpha rails, a row of channel fields for the active
 * format, an eyedropper (where the browser supports it), and a labelled preset palette. There is
 * no Radix primitive for a 2D color field, so the square is hand-rolled on pointer events
 * (lint-safe: handlers, never effects); the 1D hue/alpha rails ride on **Radix Slider** so
 * keyboard, drag, and ARIA come for free, per the DS "Radix first" rule.
 *
 * Two footprints: `md` (324px, the full panel) and `sm` (216px: square, rails and presets, with
 * no room for the fields). `surface="card"` paints the panel's own frame, which is also what the
 * popover build shows: `ColorPickerContent` positions and animates but draws no chrome, so there
 * is exactly one card either way.
 *
 * HSV is the working model (see ./color): keeping it as the source of truth means dragging value
 * to black never loses the hue. `value`/`onValueChange` speak hex at the edges. State flows to the
 * parts through a typed Context (./context), with named exports, never dot-notation (RSC-safe).
 * Pass `children` to recompose the parts in any order; omit them for the standard stacked layout.
 *
 * The colored gradients (hue spectrum, the white/black square overlays, the alpha checkerboard)
 * are the color space itself, not themeable surfaces: they're the one place literal colors are
 * correct. Everything chrome-side (borders, rings, text, the panel) stays on semantic tokens.
 *
 * Beyond a single solid color, the picker can edit a **gradient** (a draggable stop track plus an
 * angle rail) or an **image** fill (upload or URL with a cover/contain fit). These are opt-in via
 * `modes`; with two or more fill kinds a **Figma-style fill-type row** of live-preview tiles
 * renders at the top: Solid, each gradient geometry (linear/radial), then Image, so picking a
 * gradient tile both switches mode and sets its geometry in one click. The gradient editor reuses
 * the very same square/rails/hex to edit whichever stop is active (the Context's `update` maps to
 * the selected stop), so there's no second color editor. Solid's hex `value`/`onValueChange` is
 * unchanged; `onFillChange` is the single callback that speaks CSS across all three modes (a hex,
 * a `linear-gradient()/radial-gradient()`, or a `url("…")`).
 *
 * The parts live in sibling files (area, rails, hex-input, swatches, modes, gradient, image,
 * popover); this file owns the root state machine and the default stacked layout.
 */

// ─── Root-only constants ────────────────────────────────────────────────────────────

const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: 90,
  stops: [
    { id: "g-0", color: "#6366f1", position: 0 },
    { id: "g-1", color: "#ec4899", position: 100 },
  ],
}

const DEFAULT_IMAGE: ColorPickerImageValue = { src: "", fit: "cover" }

const FALLBACK_HSVA: Hsva = { h: 217, s: 76, v: 96, a: 1 }

// A monotonic id source for stops added at runtime; deterministic-free since stops are only ever
// created in event handlers (never during render), so it can't desync SSR/hydration.
let stopIdSeq = 0
const nextStopId = () => `stop-${++stopIdSeq}`

/** The CSS value for a mode's current state: hex (solid), gradient string, or `url()` (image). */
function fillFor(
  mode: ColorPickerMode,
  hsva: Hsva,
  showAlpha: boolean,
  gradient: GradientValue,
  image: ColorPickerImageValue,
): string {
  if (mode === "gradient") return gradientToCss(gradient)
  if (mode === "image") return image.src ? `url("${image.src}")` : "none"
  return hsvaToHex(hsva, showAlpha)
}

// ─── ColorPicker (root) ─────────────────────────────────────────────────────────────

export interface ColorPickerProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue">,
    // `size` and `surface` are redeclared below with their own docs and defaults.
    Omit<VariantProps<typeof colorPickerVariants>, "size" | "surface"> {
  /** Controlled color as a hex string (`#rrggbb` or `#rrggbbaa`). Drives the solid color. */
  value?: string
  /** Initial color when uncontrolled. @default "#3b82f6" */
  defaultValue?: string
  /** Fires with the new hex string on every solid-color change. */
  onValueChange?: (hex: string) => void
  /**
   * The fill kinds to offer. With a single mode (the default) no switcher renders and the picker
   * behaves exactly as before. List two or more to add the Solid / Gradient / Image switcher.
   * @default ["solid"]
   */
  modes?: ColorPickerMode[]
  /** Controlled active mode. */
  mode?: ColorPickerMode
  /** Initial mode when uncontrolled. @default the first entry of `modes` */
  defaultMode?: ColorPickerMode
  /** Fires when the active mode changes. */
  onModeChange?: (mode: ColorPickerMode) => void
  /**
   * Fires with the composed CSS fill on any change, in every mode: a hex for solid, a
   * `linear-gradient()/radial-gradient()` for gradient, or `url("…")` for image. Use this (instead
   * of `onValueChange`) when you enable gradient/image so one callback covers the whole value.
   */
  onFillChange?: (fill: string) => void
  /** Initial gradient when uncontrolled. */
  defaultGradient?: GradientValue
  /** Initial image fill when uncontrolled. */
  defaultImage?: ColorPickerImageValue
  /**
   * Show the alpha (transparency) rail and its field. Emitted hex carries `aa` when alpha < 1.
   * @default true
   */
  showAlpha?: boolean
  /**
   * Show the format switcher and its fields row. They are one unit: the switcher exists to choose
   * how the fields write the colour, so hiding the fields hides it too.
   * @default true at `size="md"`, false at `size="sm"` (the small panel has no room for them)
   */
  showInput?: boolean
  /** Show the preset swatch grid. @default true */
  showPresets?: boolean
  /** Preset colors (hex) for the swatch grid. */
  presets?: string[]
  /**
   * Panel footprint: `md` is the full 324px panel, `sm` the 216px one (square, rails and presets,
   * no fields). Defaults from `density` when given, else `md`.
   *
   * Note this reads the `density` **prop** and not the ambient `DensityProvider`, unlike the form
   * controls: the two footprints are fixed panel widths rather than height tiers, and the ambient
   * default (`compact`) would otherwise hand every bare picker the small panel, which by design
   * cannot hold the fields row at all.
   */
  size?: "sm" | "md"
  /**
   * Whether the panel paints its own card (border, radius, elevation). Drop to `plain` when it
   * already sits inside a surface that draws the frame.
   * @default "card"
   */
  surface?: "card" | "plain"
  /** Controlled channel format for the fields row. */
  format?: ColorPickerFormatValue
  /** Initial channel format when uncontrolled. @default "hex" */
  defaultFormat?: ColorPickerFormatValue
  /** Fires when the channel format changes. */
  onFormatChange?: (format: ColorPickerFormatValue) => void
  density?: Density
  /** Recompose the parts yourself. When omitted, the standard stacked layout renders. */
  children?: React.ReactNode
}

export function ColorPicker({
  className,
  value,
  defaultValue = "#3b82f6",
  onValueChange,
  modes = ["solid"],
  mode: controlledMode,
  defaultMode,
  onModeChange,
  onFillChange,
  defaultGradient,
  defaultImage,
  showAlpha = true,
  showInput,
  showPresets = true,
  presets = defaultColorPresets,
  size,
  surface = "card",
  format: controlledFormat,
  defaultFormat = "hex",
  onFormatChange,
  density,
  children,
  ...props
}: ColorPickerProps) {
  // See the `size` prop: density is consulted only when passed explicitly, so a bare picker in a
  // (compact by default) app shell still gets the full panel rather than the fields-less small one.
  const resolvedSize = size ?? (density === "comfortable" ? "md" : density === "compact" ? "sm" : "md")
  // The switcher + fields are one unit, and the small panel has no room for them.
  const withInput = showInput ?? resolvedSize === "md"
  const slots = colorPickerVariants({ size: resolvedSize, surface })

  // ── Solid state ──
  const [solidHsva, setSolidHsva] = React.useState<Hsva>(
    () => hexToHsva(value ?? defaultValue) ?? FALLBACK_HSVA,
  )

  // Sync an external (controlled) value → working HSV without losing hue on greys/black. The
  // React-recommended "adjust state during render on prop change" pattern (no effect, lint-safe).
  const [prevValue, setPrevValue] = React.useState(value)
  if (value !== undefined && value !== prevValue) {
    setPrevValue(value)
    const parsed = hexToHsva(value)
    if (parsed) setSolidHsva((curr) => reconcileHsva(parsed, curr))
  }

  // ── Channel format (controlled or uncontrolled) ──
  // Display-only: the working HSV is untouched by a format switch.
  const [formatState, setFormatState] = React.useState<ColorPickerFormatValue>(defaultFormat)
  const format = controlledFormat ?? formatState

  const setFormat = React.useCallback(
    (next: ColorPickerFormatValue) => {
      if (controlledFormat === undefined) setFormatState(next)
      onFormatChange?.(next)
    },
    [controlledFormat, onFormatChange],
  )

  // ── Mode state (controlled or uncontrolled) ──
  const [modeState, setModeState] = React.useState<ColorPickerMode>(
    () => defaultMode ?? modes[0] ?? "solid",
  )
  const mode = controlledMode ?? modeState

  // ── Gradient state ──
  const [gradient, setGradient] = React.useState<GradientValue>(
    () => defaultGradient ?? DEFAULT_GRADIENT,
  )
  const [activeStopId, setActiveStopId] = React.useState<string>(
    () => (defaultGradient ?? DEFAULT_GRADIENT).stops[0]?.id ?? "g-0",
  )

  // ── Image state ──
  const [image, setImageState] = React.useState<ColorPickerImageValue>(
    () => defaultImage ?? DEFAULT_IMAGE,
  )

  // The active gradient stop, with a guard for when the id falls out of the list (after a remove).
  const activeStop =
    gradient.stops.find((s) => s.id === activeStopId) ?? gradient.stops[0]
  const activeStopHsva = activeStop ? hexToHsva(activeStop.color) ?? FALLBACK_HSVA : FALLBACK_HSVA

  // The color the square/rails/hex/swatches edit: solid color, or the active stop in gradient mode.
  const editingHsva = mode === "gradient" ? activeStopHsva : solidHsva
  const hex = hsvaToHex(editingHsva, showAlpha)
  // The solid colour stands on its own (the fill-type row's Solid tile previews it in any mode).
  const solidHex = hsvaToHex(solidHsva, showAlpha)

  // Each mutation computes `next` from the current render (never inside a setState updater) so the
  // emit side-effects fire exactly once under StrictMode, mirroring the original `update`.
  const emit = onFillChange

  const updateSolid = React.useCallback(
    (partial: Partial<Hsva>) => {
      const next = { ...solidHsva, ...partial }
      setSolidHsva(next)
      const nextHex = hsvaToHex(next, showAlpha)
      onValueChange?.(nextHex)
      emit?.(nextHex)
    },
    [solidHsva, onValueChange, emit, showAlpha],
  )

  const updateActiveStop = React.useCallback(
    (partial: Partial<Hsva>) => {
      if (!activeStop) return
      const nextHsva = { ...activeStopHsva, ...partial }
      const nextColor = hsvaToHex(nextHsva, showAlpha)
      const stops = gradient.stops.map((s) =>
        s.id === activeStop.id ? { ...s, color: nextColor } : s,
      )
      const next = { ...gradient, stops }
      setGradient(next)
      emit?.(gradientToCss(next))
    },
    [activeStop, activeStopHsva, gradient, showAlpha, emit],
  )

  const update = mode === "gradient" ? updateActiveStop : updateSolid

  const setMode = React.useCallback(
    (next: ColorPickerMode) => {
      if (controlledMode === undefined) setModeState(next)
      onModeChange?.(next)
      emit?.(fillFor(next, solidHsva, showAlpha, gradient, image))
    },
    [controlledMode, onModeChange, emit, solidHsva, showAlpha, gradient, image],
  )

  const commitGradient = React.useCallback(
    (next: GradientValue) => {
      setGradient(next)
      emit?.(gradientToCss(next))
    },
    [emit],
  )

  const addStop = React.useCallback(
    (position: number) => {
      const pos = clamp(position, 0, 100)
      const id = nextStopId()
      const stops = [...gradient.stops, { id, color: colorAtPosition(gradient.stops, pos), position: pos }]
      setActiveStopId(id)
      commitGradient({ ...gradient, stops })
    },
    [gradient, commitGradient, setActiveStopId],
  )

  const removeStop = React.useCallback(
    (id: string) => {
      if (gradient.stops.length <= 2) return // a gradient needs at least two stops
      const stops = gradient.stops.filter((s) => s.id !== id)
      if (activeStopId === id) setActiveStopId(sortStops(stops)[0].id)
      commitGradient({ ...gradient, stops })
    },
    [gradient, activeStopId, commitGradient, setActiveStopId],
  )

  const moveStop = React.useCallback(
    (id: string, position: number) => {
      const pos = clamp(position, 0, 100)
      const stops = gradient.stops.map((s) => (s.id === id ? { ...s, position: pos } : s))
      commitGradient({ ...gradient, stops })
    },
    [gradient, commitGradient],
  )

  const setGradientType = React.useCallback(
    (type: GradientValue["type"]) => commitGradient({ ...gradient, type }),
    [gradient, commitGradient],
  )

  const setGradientAngle = React.useCallback(
    (angle: number) => commitGradient({ ...gradient, angle: clamp(angle, 0, 360) }),
    [gradient, commitGradient],
  )

  const setImage = React.useCallback(
    (partial: Partial<ColorPickerImageValue>) => {
      const next = { ...image, ...partial }
      setImageState(next)
      emit?.(next.src ? `url("${next.src}")` : "none")
    },
    [image, emit],
  )

  // The standard stacked layout, picked by mode. Solid and the active gradient stop share the
  // same square/rails/hex/swatches (driven by the mode-aware `update`); image swaps in its own UI.
  const solidEditor = (
    <>
      {/* The switcher heads the panel; the eyedropper rides beside it so the fields row below
          stays a clean row of channels. It removes itself where the browser has no EyeDropper,
          and the switcher simply spans the full width. */}
      {withInput && (
        <div className={slots.formatRow()}>
          <ColorPickerFormat />
          <ColorPickerEyeDropper />
        </div>
      )}
      <ColorPickerArea />
      <ColorPickerControls />
      {withInput && <ColorPickerFields />}
      {showPresets && <ColorPickerSwatches presets={presets} />}
    </>
  )

  return (
    <ColorPickerProvider
      hsva={editingHsva}
      hex={hex}
      solidHex={solidHex}
      showAlpha={showAlpha}
      update={update}
      format={format}
      setFormat={setFormat}
      mode={mode}
      modes={modes}
      setMode={setMode}
      gradient={gradient}
      activeStopId={activeStop?.id ?? activeStopId}
      setActiveStopId={setActiveStopId}
      addStop={addStop}
      removeStop={removeStop}
      moveStop={moveStop}
      setGradientType={setGradientType}
      setGradientAngle={setGradientAngle}
      image={image}
      setImage={setImage}
      slots={slots}
    >
      <div data-slot="color-picker" className={slots.root({ className })} {...props}>
        {children ?? (
          <>
            <ColorPickerModes />
            {mode === "gradient" && <ColorPickerGradient />}
            {mode === "image" ? <ColorPickerImage /> : solidEditor}
          </>
        )}
      </div>
    </ColorPickerProvider>
  )
}
