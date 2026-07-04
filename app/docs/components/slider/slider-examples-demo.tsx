"use client"

import * as React from "react"
import { SpeakerHigh, SpeakerLow, Sun } from "@phosphor-icons/react"

import { Slider } from "@/components/ui/slider"

/** Hero: a branded slider with a live value bubble on the thumb. */
export function SliderDemo() {
  return (
    <div className="w-full max-w-xs">
      <Slider
        defaultValue={[60]}
        variant="brand"
        tooltip
        formatValue={(v) => `${v}%`}
        aria-label="Brightness"
      />
    </div>
  )
}

/** The three sizes: track thickness and thumb diameter scale together. */
export function SizesDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground">{size}</span>
          <Slider size={size} defaultValue={[50]} aria-label={`Size ${size}`} />
        </div>
      ))}
    </div>
  )
}

/** Fill variants: each tints the range, thumb border, and tooltip together. */
export function VariantsDemo() {
  const variants = ["default", "brand", "success", "warning", "destructive"] as const
  return (
    <div className="flex w-full max-w-xs flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground">{variant}</span>
          <Slider variant={variant} defaultValue={[55]} aria-label={variant} />
        </div>
      ))}
    </div>
  )
}

/** Range: two thumbs from a two-value array; drag either end. */
export function RangeDemo() {
  return (
    <div className="w-full max-w-xs">
      <Slider
        defaultValue={[25, 75]}
        variant="brand"
        tooltip
        formatValue={(v) => `$${v}`}
        aria-label="Price range"
      />
    </div>
  )
}

/** Stepped: `step` snaps the thumb; combine with min/max for a discrete scale. */
export function StepsDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Slider
        defaultValue={[3]}
        min={0}
        max={5}
        step={1}
        tooltip
        aria-label="Rating"
      />
      <div className="flex justify-between px-0.5 text-xs tabular-nums text-muted-foreground">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  )
}

/** Vertical: pass `orientation="vertical"`; give the root a height. */
export function VerticalDemo() {
  return (
    <div className="flex items-end gap-8">
      <Slider
        orientation="vertical"
        defaultValue={[70]}
        variant="brand"
        className="h-40"
        aria-label="Channel 1"
      />
      <Slider
        orientation="vertical"
        defaultValue={[40]}
        variant="brand"
        className="h-40"
        aria-label="Channel 2"
      />
      <Slider
        orientation="vertical"
        defaultValue={[85]}
        variant="brand"
        className="h-40"
        aria-label="Channel 3"
      />
    </div>
  )
}

/** Square: squared rail + fader-cap thumb; reads especially well vertical. */
export function SquareDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-8">
      <Slider shape="square" defaultValue={[60]} aria-label="Square default" />
      <Slider shape="square" size="lg" variant="brand" defaultValue={[40]} aria-label="Square brand" />
    </div>
  )
}

/** Equalizer: a row of vertical, square sliders behaving as faders. */
export function EqualizerDemo() {
  const bands = [
    { label: "60", value: [70] },
    { label: "150", value: [45] },
    { label: "400", value: [80] },
    { label: "1k", value: [55] },
    { label: "2.4k", value: [65] },
    { label: "6k", value: [35] },
    { label: "15k", value: [60] },
  ]
  return (
    <div className="flex items-end gap-5">
      {bands.map((band) => (
        <div key={band.label} className="flex flex-col items-center gap-3">
          <Slider
            orientation="vertical"
            shape="square"
            variant="brand"
            defaultValue={band.value}
            className="h-40"
            aria-label={`${band.label} Hz`}
          />
          <span className="text-xs tabular-nums text-muted-foreground">{band.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Disabled: the whole control dims and stops responding. */
export function DisabledDemo() {
  return (
    <div className="w-full max-w-xs">
      <Slider defaultValue={[40]} disabled aria-label="Disabled" />
    </div>
  )
}

/** Controlled: drive the value from state and read it back into the UI. */
export function ControlledDemo() {
  const [value, setValue] = React.useState([35])
  const v = value[0]
  const VolumeIcon = v === 0 ? SpeakerLow : SpeakerHigh
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <VolumeIcon weight="bold" className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <Slider value={value} onValueChange={setValue} aria-label="Volume" />
      <span className="w-9 text-right text-sm tabular-nums text-muted-foreground">{v}%</span>
    </div>
  )
}

/** A settings row: icon, label, and a slider that reports its own value. */
export function SettingsRowDemo() {
  const [value, setValue] = React.useState([72])
  return (
    <div className="w-full max-w-sm rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sun weight="bold" className="size-4 text-muted-foreground" aria-hidden />
          Brightness
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">{value[0]}%</span>
      </div>
      <Slider value={value} onValueChange={setValue} variant="brand" aria-label="Brightness" />
    </div>
  )
}
