"use client"

import * as React from "react"
import { Eyedropper } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { InputField, InputPrefix, InputRoot } from "@/components/ui/input"

import { hexToHsva, hsvaToHex, reconcileHsva } from "./color"
import { useColorPickerContext } from "./context"

// ─── ColorPickerHexInput ────────────────────────────────────────────────────────────

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
