"use client"

import { Check } from "@phosphor-icons/react"

import { hexToHsva, hsvaToRgba, reconcileHsva } from "./color"
import { defaultColorPresets, useColorPickerContext } from "./context"

// ─── ColorPickerSwatches (presets) ───────────────────────────────────────────────────

export interface ColorPickerSwatchesProps {
  presets?: string[]
  className?: string
}

export function ColorPickerSwatches({
  presets = defaultColorPresets,
  className,
}: ColorPickerSwatchesProps) {
  const { hex, update, slots } = useColorPickerContext("ColorPickerSwatches")
  const currentHex = hex.toLowerCase()

  return (
    <div data-slot="color-picker-swatches" className={slots.swatches({ className })} role="group" aria-label="Color presets">
      {presets.map((preset) => {
        const parsed = hexToHsva(preset)
        const selected = preset.toLowerCase() === currentHex
        // Pick a check color that contrasts with the swatch (white on dark, dark on light).
        const checkOnDark = parsed ? hsvaToRgba(parsed).r * 0.299 + hsvaToRgba(parsed).g * 0.587 + hsvaToRgba(parsed).b * 0.114 < 150 : false
        return (
          <button
            key={preset}
            type="button"
            aria-label={preset}
            aria-pressed={selected}
            className={slots.swatch()}
            style={{ backgroundColor: preset }}
            onClick={() => parsed && update(reconcileHsva(parsed, parsed))}
          >
            {selected && <Check weight="bold" className={checkOnDark ? "text-white" : "text-black"} />}
          </button>
        )
      })}
    </div>
  )
}
