"use client"

import { Slider as SliderPrimitive } from "radix-ui"

import { hsvaToRgbaString } from "./color"
import { CHECKER_STYLE, useColorPickerContext } from "./context"

/** Pure-spectrum hue rail: constants of the color wheel, not theme surfaces. */
const HUE_GRADIENT =
  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"

// ─── Hue / Alpha rails (Radix Slider) ───────────────────────────────────────────────

export function ColorPickerHueSlider({ className }: { className?: string }) {
  const { hsva, update, slots } = useColorPickerContext("ColorPickerHueSlider")
  return (
    <SliderPrimitive.Root
      data-slot="color-picker-hue"
      className={slots.sliderRoot({ className })}
      min={0}
      max={360}
      step={1}
      value={[hsva.h]}
      onValueChange={([h]) => update({ h })}
      aria-label="Hue"
    >
      <SliderPrimitive.Track className={slots.sliderTrack()} style={{ backgroundImage: HUE_GRADIENT }} />
      <SliderPrimitive.Thumb
        className={slots.sliderThumb()}
        style={{ backgroundColor: `hsl(${hsva.h} 100% 50%)` }}
      />
    </SliderPrimitive.Root>
  )
}

export function ColorPickerAlphaSlider({ className }: { className?: string }) {
  const { hsva, update, slots } = useColorPickerContext("ColorPickerAlphaSlider")
  const opaque = hsvaToRgbaString({ ...hsva, a: 1 })
  return (
    <SliderPrimitive.Root
      data-slot="color-picker-alpha"
      className={slots.sliderRoot({ className })}
      min={0}
      max={100}
      step={1}
      value={[Math.round(hsva.a * 100)]}
      onValueChange={([a]) => update({ a: a / 100 })}
      aria-label="Alpha"
    >
      <SliderPrimitive.Track className={slots.sliderTrack()} style={CHECKER_STYLE}>
        {/* Transparent → opaque-color wash, laid over the checkerboard. */}
        <span
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(to right, transparent, ${opaque})` }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={slots.sliderThumb()}
        style={{ backgroundColor: hsvaToRgbaString(hsva) }}
      />
    </SliderPrimitive.Root>
  )
}

// ─── ColorPickerControls (preview chip + the rails) ─────────────────────────────────

export function ColorPickerControls({ className }: { className?: string }) {
  const { showAlpha, slots } = useColorPickerContext("ColorPickerControls")
  return (
    <div data-slot="color-picker-controls" className={slots.controls({ className })}>
      <ColorPickerPreview />
      <div className={slots.rails()}>
        <ColorPickerHueSlider />
        {showAlpha && <ColorPickerAlphaSlider />}
      </div>
    </div>
  )
}

// ─── ColorPickerPreview (current color over a checkerboard) ──────────────────────────

export function ColorPickerPreview({ className }: { className?: string }) {
  const { hsva, slots } = useColorPickerContext("ColorPickerPreview")
  return (
    <div data-slot="color-picker-preview" className={slots.preview({ className })} style={CHECKER_STYLE}>
      <span className="absolute inset-0" style={{ backgroundColor: hsvaToRgbaString(hsva) }} />
    </div>
  )
}
