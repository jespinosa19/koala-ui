"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  colorPickerFormats,
  useColorPickerContext,
  type ColorPickerFormatValue,
} from "./context"

// ─── ColorPickerFormat (HEX / HSL / RGB switcher) ───────────────────────────────────

const FORMAT_LABELS: Record<ColorPickerFormatValue, string> = {
  hex: "HEX",
  hsl: "HSL",
  rgb: "RGB",
}

/**
 * The format switcher that heads the panel. It changes how the colour is *written* in the fields
 * row underneath, never the colour itself: HSV stays the working model, so cycling HEX → HSL → RGB
 * round-trips losslessly.
 *
 * It rides the DS `ToggleGroup` in its `segmented` variant rather than Radix Tabs: this is a
 * radiogroup of pressable pills, and a tablist would promise tabpanels that the panel's layout
 * (the square and rails sit between the switcher and the fields) can't honour.
 */
export function ColorPickerFormat({ className }: { className?: string }) {
  const { format, setFormat, slots } = useColorPickerContext("ColorPickerFormat")
  return (
    <ToggleGroup
      data-slot="color-picker-format"
      type="single"
      variant="segmented"
      size="sm"
      value={format}
      // Radix clears the value when the active item is pressed again; ignore that so the row
      // always has exactly one format chosen.
      onValueChange={(next) => next && setFormat(next as ColorPickerFormatValue)}
      className={slots.segmentedRow({ className })}
      // Radix's root is `role="group"`, but its `type="single"` items are real `role="radio"`.
      role="radiogroup"
      aria-label="Color format"
    >
      {colorPickerFormats.map((value) => (
        <ToggleGroupItem key={value} value={value} className={slots.segmentedItem()}>
          {FORMAT_LABELS[value]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
