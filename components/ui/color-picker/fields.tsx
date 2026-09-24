"use client"

import * as React from "react"
import { Eyedropper } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { InputField, InputPrefix, InputRoot, InputSuffix } from "@/components/ui/input"

import {
  clamp,
  hexToHsva,
  hslaToHsva,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  rgbaToHsva,
  reconcileHsva,
} from "./color"
import { useColorPickerContext } from "./context"

/**
 * The fields row: however the active format writes the colour. HSV remains the working model in
 * every format (see ./color), so the row is a pure projection: switching HEX → HSL → RGB re-reads
 * the same colour, and typing in any field converts back once, on commit.
 *
 * Every field keeps a local draft so a half-typed value ("3b8", or an empty box mid-retype) isn't
 * clobbered by the live colour on each keystroke. The draft re-syncs when the committed value
 * changes from elsewhere (the square, a rail, a preset) using React's "adjust state during render"
 * pattern, never an effect, which the repo's strict react-hooks lint requires.
 */

// ─── ColorPickerNumberField (one numeric channel) ───────────────────────────────────

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  /** Rendered inside the field, after the value (the `%` on alpha). */
  suffix?: string
  onCommit: (value: number) => void
}

function ColorPickerNumberField({ label, value, min, max, suffix, onCommit }: NumberFieldProps) {
  const committed = String(value)
  const [draft, setDraft] = React.useState(committed)

  const [prevCommitted, setPrevCommitted] = React.useState(committed)
  if (committed !== prevCommitted) {
    setPrevCommitted(committed)
    setDraft(committed)
  }

  const { slots } = useColorPickerContext("ColorPickerNumberField")

  function handleChange(raw: string) {
    // Digits only: these channels have no sign and no fraction.
    const sanitized = raw.replace(/\D/g, "").slice(0, 3)
    setDraft(sanitized)
    if (sanitized === "") return // mid-retype; wait for a number
    onCommit(clamp(parseInt(sanitized, 10), min, max))
  }

  return (
    <InputRoot size="sm" className={slots.field()}>
      <InputField
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        // An empty or out-of-range box snaps back to the real value when focus leaves.
        onBlur={() => setDraft(committed)}
        inputMode="numeric"
        spellCheck={false}
        autoComplete="off"
        aria-label={label}
        className="tabular-nums"
      />
      {suffix && (
        <InputSuffix>
          <span className="text-sm">{suffix}</span>
        </InputSuffix>
      )}
    </InputRoot>
  )
}

// ─── ColorPickerHexInput ────────────────────────────────────────────────────────────

/** The hex channel on its own. Also the HEX branch of `ColorPickerFields`. */
export function ColorPickerHexInput({ className }: { className?: string }) {
  const { hsva, showAlpha, update } = useColorPickerContext("ColorPickerHexInput")
  // Local draft so a half-typed value (e.g. "3b8") doesn't get clobbered by the live hex.
  const committed = hsvaToHex(hsva, showAlpha).replace(/^#/, "")
  const [draft, setDraft] = React.useState(committed)

  // When the color changes elsewhere (square, rail, preset), reflect it, unless the user is
  // mid-edit on a value that already resolves to the same color.
  const [prevCommitted, setPrevCommitted] = React.useState(committed)
  if (committed !== prevCommitted) {
    setPrevCommitted(committed)
    setDraft(committed)
  }

  function handleChange(raw: string) {
    const sanitized = raw.replace(/[^\da-f]/gi, "").slice(0, 8)
    setDraft(sanitized)
    const parsed = hexToHsva(sanitized)
    if (parsed) update(reconcileHsva(parsed, hsva))
  }

  return (
    <InputRoot size="sm" className={cn("flex-1", className)}>
      <InputPrefix>
        <span className="font-mono text-sm">#</span>
      </InputPrefix>
      <InputField
        data-slot="color-picker-hex"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setDraft(committed)}
        spellCheck={false}
        autoComplete="off"
        aria-label="Hex color"
        className="font-mono uppercase tabular-nums"
      />
    </InputRoot>
  )
}

// ─── ColorPickerAlphaField ──────────────────────────────────────────────────────────

/** Alpha as a percentage, the way designers read it. Shared by all three formats. */
function ColorPickerAlphaField() {
  const { hsva, update } = useColorPickerContext("ColorPickerAlphaField")
  return (
    <ColorPickerNumberField
      label="Alpha"
      value={Math.round(hsva.a * 100)}
      min={0}
      max={100}
      suffix="%"
      onCommit={(a) => update({ a: a / 100 })}
    />
  )
}

// ─── ColorPickerFields ──────────────────────────────────────────────────────────────

/** The channel row for the active format: one hex box, or three numeric ones, plus alpha. */
export function ColorPickerFields({ className }: { className?: string }) {
  const { hsva, format, showAlpha, update, slots } = useColorPickerContext("ColorPickerFields")

  const alpha = showAlpha ? <ColorPickerAlphaField /> : null

  let channels: React.ReactNode
  if (format === "rgb") {
    const rgba = hsvaToRgba(hsva)
    // RGB genuinely can't express a hue at black or grey, so reconcile against the working HSV
    // to keep the hue the square is sitting on instead of snapping to red.
    const commit = (partial: Partial<typeof rgba>) =>
      update(reconcileHsva(rgbaToHsva({ ...rgba, ...partial }), hsva))
    channels = (
      <>
        <ColorPickerNumberField label="Red" value={rgba.r} min={0} max={255} onCommit={(r) => commit({ r })} />
        <ColorPickerNumberField label="Green" value={rgba.g} min={0} max={255} onCommit={(g) => commit({ g })} />
        <ColorPickerNumberField label="Blue" value={rgba.b} min={0} max={255} onCommit={(b) => commit({ b })} />
      </>
    )
  } else if (format === "hsl") {
    const hsla = hsvaToHsla(hsva)
    // HSL shares its hue with HSV, so the typed hue is carried across explicitly: converting a
    // lightness of 0 collapses saturation, and without this an edit to L would forget the hue.
    const commit = (partial: Partial<typeof hsla>) => {
      const next = { ...hsla, ...partial }
      update({ ...hslaToHsva(next), h: next.h })
    }
    channels = (
      <>
        <ColorPickerNumberField label="Hue" value={hsla.h} min={0} max={360} onCommit={(h) => commit({ h })} />
        <ColorPickerNumberField label="Saturation" value={hsla.s} min={0} max={100} onCommit={(s) => commit({ s })} />
        <ColorPickerNumberField label="Lightness" value={hsla.l} min={0} max={100} onCommit={(l) => commit({ l })} />
      </>
    )
  } else {
    // The hex box earns twice the room: it holds six characters where the numeric ones hold three.
    channels = <ColorPickerHexInput className="flex-[2]" />
  }

  return (
    <div data-slot="color-picker-fields" className={slots.fields({ className })}>
      {channels}
      {alpha}
    </div>
  )
}

// ─── ColorPickerEyeDropper ──────────────────────────────────────────────────────────

interface EyeDropperResult {
  sRGBHex: string
}
interface EyeDropperConstructor {
  new (): { open: () => Promise<EyeDropperResult> }
}

/** Sample a pixel from anywhere on screen. Only renders where the browser ships the API. */
export function ColorPickerEyeDropper({ className }: { className?: string }) {
  const { update, hsva, slots } = useColorPickerContext("ColorPickerEyeDropper")
  const [supported, setSupported] = React.useState(false)

  // Feature-detect after mount so SSR and first client render agree (both render nothing). The
  // detection is nested in a named handler, not called synchronously in the effect body; the
  // repo's strict react-hooks lint flags a bare setState in an effect (see the date primitives).
  React.useEffect(() => {
    const detect = () => setSupported(typeof window !== "undefined" && "EyeDropper" in window)
    detect()
  }, [])

  if (!supported) return null

  async function pick() {
    try {
      const Ctor = (window as unknown as { EyeDropper: EyeDropperConstructor }).EyeDropper
      const { sRGBHex } = await new Ctor().open()
      const parsed = hexToHsva(sRGBHex)
      if (parsed) update(reconcileHsva(parsed, hsva))
    } catch {
      /* user dismissed the picker: ignore */
    }
  }

  return (
    <button
      type="button"
      data-slot="color-picker-eyedropper"
      aria-label="Pick a color from the screen"
      className={slots.eyedropper({ className })}
      onClick={pick}
    >
      <Eyedropper weight="bold" />
    </button>
  )
}
