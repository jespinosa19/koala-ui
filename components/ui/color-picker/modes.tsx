"use client"

import { ImageSquare } from "@phosphor-icons/react"

import { Tooltip } from "@/components/ui/tooltip"

import { stopsToTypePreviewCss, type GradientType } from "./color"
import { CHECKER_STYLE, useColorPickerContext, type ColorPickerMode } from "./context"

const MODE_LABELS: Record<ColorPickerMode, string> = {
  solid: "Solid",
  gradient: "Gradient",
  image: "Image",
}

/** The gradient geometries the row offers, in display order, with their hover labels. */
const GRADIENT_TYPES: { type: GradientType; label: string }[] = [
  { type: "linear", label: "Linear" },
  { type: "radial", label: "Radial" },
]

// ─── ColorPickerModes (Figma-style fill-type row) ───────────────────────────────────

/** One tile in the fill-type row. Gradient kinds carry their geometry so the row exposes each. */
type FillTile =
  | { key: string; label: string; kind: "solid" }
  | { key: string; label: string; kind: "image" }
  | { key: string; label: string; kind: "gradient"; type: GradientType }

/**
 * The fill-type row, modelled on Figma's: a single row of small tiles, each a *live* preview of a
 * fill kind. Solid previews the current solid color; every gradient geometry (linear, radial)
 * previews the current gradient in that shape; image shows the chosen picture (or an icon). The
 * gradient geometries sit here, not in a separate control, so picking a gradient tile both
 * switches to gradient mode and sets that geometry in one click. Hidden when fewer than two tiles
 * would show (e.g. a solid-only picker), so the single-mode picker is unchanged.
 */
export function ColorPickerModes({ className }: { className?: string }) {
  const { mode, modes, setMode, gradient, setGradientType, image, solidHex, slots } =
    useColorPickerContext("ColorPickerModes")

  const tiles: FillTile[] = []
  if (modes.includes("solid")) tiles.push({ key: "solid", label: MODE_LABELS.solid, kind: "solid" })
  if (modes.includes("gradient"))
    for (const { type, label } of GRADIENT_TYPES)
      tiles.push({ key: `gradient-${type}`, label, kind: "gradient", type })
  if (modes.includes("image")) tiles.push({ key: "image", label: MODE_LABELS.image, kind: "image" })

  if (tiles.length < 2) return null

  const isActive = (t: FillTile) =>
    t.kind === "gradient" ? mode === "gradient" && gradient.type === t.type : mode === t.kind

  function select(t: FillTile) {
    if (t.kind !== "gradient") {
      setMode(t.kind)
      return
    }
    // Enter gradient mode first (it emits with the prior geometry), then set the geometry so the
    // final emit carries the chosen type. Guard each so an already-active tile stays a no-op.
    if (mode !== "gradient") setMode("gradient")
    if (gradient.type !== t.type) setGradientType(t.type)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Fill type"
      data-slot="color-picker-modes"
      className={slots.fillTypes({ className })}
    >
      {tiles.map((t) => {
        const active = isActive(t)
        return (
          <Tooltip key={t.key} content={t.label} placement="top">
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t.label}
              data-active={active}
              className={slots.fillTile()}
              // Checkerboard under the colour/preview so transparency reads; the empty image tile
              // (just an icon) keeps the plain panel surface instead.
              style={t.kind === "image" && !image.src ? undefined : CHECKER_STYLE}
              onClick={() => select(t)}
            >
              {t.kind === "solid" && (
                <span className={slots.fillTilePreview()} style={{ backgroundColor: solidHex }} />
              )}
              {t.kind === "gradient" && (
                <span
                  className={slots.fillTilePreview()}
                  style={{ backgroundImage: stopsToTypePreviewCss(t.type, gradient.stops) }}
                />
              )}
              {t.kind === "image" &&
                (image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.src} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <ImageSquare weight="bold" />
                ))}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
