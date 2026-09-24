"use client"

import { ImageSquare } from "@phosphor-icons/react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipGroup } from "@/components/ui/tooltip"

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
 *
 * It rides the DS `ToggleGroup` like the panel's other two selectors: the tiles are `role="radio"`
 * with roving focus, so the row is a single tab stop the arrow keys move within.
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

  // The row's value is the tile key, because a gradient tile carries a geometry as well as a
  // kind: `mode` alone can't tell Linear from Radial.
  const value = mode === "gradient" ? `gradient-${gradient.type}` : mode

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
    // One shared bubble for the row, so the label glides tile to tile (and rides the arrow-key
    // focus) instead of four bubbles fading in and out. It renders no DOM of its own, so the
    // ToggleGroup stays the row's only child and the flex layout is untouched.
    <TooltipGroup>
      <ToggleGroup
        type="single"
        // `outline`, not `segmented`: these are free-standing tiles, not pills sharing a track.
        // It also means no sliding thumb is rendered and no ResizeObserver is attached
        // (`useSelectedThumb` is gated on the variant), which a 36px preview tile has no use for.
        variant="outline"
        // `md`, not `sm`: both sizes are cancelled by the tile's `size-9`/`p-0`, but `sm` also
        // carries a `before:` hit extender that this tile's `overflow-hidden` would clip to
        // nothing, which only makes the 40px target look met.
        size="md"
        // Radix's root is `role="group"`; its `type="single"` items are real `role="radio"`, so
        // name the container the group they already belong to. (The arrow keys move focus and
        // Space/Enter selects, where a native radiogroup would select on focus: naming the group
        // makes it match its children, it doesn't create that gap.)
        role="radiogroup"
        data-slot="color-picker-modes"
        aria-label="Fill type"
        value={value}
        // Radix clears the value when the active item is pressed again; that deselect matches no
        // tile and falls through, so the row always has exactly one fill kind chosen.
        onValueChange={(next) => {
          const tile = tiles.find((t) => t.key === next)
          if (tile) select(tile)
        }}
        className={slots.fillTypes({ className })}
      >
        {tiles.map((t) => (
          <Tooltip key={t.key} content={t.label} placement="top">
            <ToggleGroupItem
              value={t.key}
              // Load-bearing: a `role="radio"` needs an accessible name, and its children are
              // presentational, so the preview span can never supply one.
              aria-label={t.label}
              className={slots.fillTile()}
              // Checkerboard under the colour/preview so transparency reads; the empty image tile
              // (just an icon) keeps the plain panel surface instead.
              style={t.kind === "image" && !image.src ? undefined : CHECKER_STYLE}
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
            </ToggleGroupItem>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipGroup>
  )
}
