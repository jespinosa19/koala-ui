"use client"

import * as React from "react"

import { hexToHsva, reconcileHsva } from "./color"
import { defaultColorPresets, useColorPickerContext } from "./context"

// ─── ColorPickerSwatches (presets) ───────────────────────────────────────────────────

export interface ColorPickerSwatchesProps {
  presets?: string[]
  /**
   * The section heading above the grid. Pass `null` to drop it and render the bare chips, e.g.
   * for a swatch-only picker where the surrounding UI already names the palette.
   * @default "Colors"
   */
  label?: React.ReactNode
  className?: string
}

/**
 * The preset palette: a labelled section, fenced from the editor above by a hairline, holding a
 * wrapping row of fixed 24px chips.
 *
 * The selected chip is marked by a ring, not a glyph: a gap ring in the panel's own surface with a
 * halo of the swatch colour outside it. That reads at 24px on light and dark chips alike, where a
 * checkmark had to guess its own contrast against every possible preset.
 */
export function ColorPickerSwatches({
  presets = defaultColorPresets,
  label = "Colors",
  className,
}: ColorPickerSwatchesProps) {
  const { hex, update, slots } = useColorPickerContext("ColorPickerSwatches")
  const currentHex = hex.toLowerCase()

  return (
    <div data-slot="color-picker-swatches" className={slots.presets({ className })}>
      {label !== null && label !== undefined && (
        <p className={slots.presetsLabel()}>{label}</p>
      )}
      <div className={slots.swatches()} role="group" aria-label="Color presets">
        {presets.map((preset) => {
          const parsed = hexToHsva(preset)
          const selected = preset.toLowerCase() === currentHex
          return (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              aria-pressed={selected}
              data-selected={selected || undefined}
              className={slots.swatch()}
              style={{
                backgroundColor: preset,
                // The outer halo is the chip's own colour, so only the chip can set it. It has to
                // be an `outline` and not a box-shadow: Tailwind draws `ring` with box-shadow, so
                // an inline boxShadow here would replace the gap ring (and the focus ring) rather
                // than sit outside it.
                outline: selected ? `1.5px solid ${preset}` : undefined,
                outlineOffset: selected ? 0 : undefined,
              }}
              onClick={() => parsed && update(reconcileHsva(parsed, parsed))}
            />
          )
        })}
      </div>
    </div>
  )
}
