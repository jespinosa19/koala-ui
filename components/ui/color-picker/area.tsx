"use client"

import * as React from "react"

import { clamp } from "./color"
import { useColorPickerContext } from "./context"

// ─── ColorPickerArea (saturation × value) ───────────────────────────────────────────

/**
 * The 2D saturation/value square. No Radix primitive exists for a 2D field, so it's hand-rolled on
 * pointer events (lint-safe: handlers, never effects) with full arrow-key support via `role=slider`.
 */
export function ColorPickerArea({ className }: { className?: string }) {
  const { hsva, update, slots } = useColorPickerContext("ColorPickerArea")
  const ref = React.useRef<HTMLDivElement>(null)

  function commitFromPointer(clientX: number, clientY: number) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clamp((clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((clientY - rect.top) / rect.height, 0, 1)
    update({ s: Math.round(x * 100), v: Math.round((1 - y) * 100) })
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    commitFromPointer(e.clientX, e.clientY)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    // Only track while the press is captured (the button is held).
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    commitFromPointer(e.clientX, e.clientY)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 10 : 1
    let { s, v } = hsva
    switch (e.key) {
      case "ArrowRight":
        s = clamp(s + step, 0, 100)
        break
      case "ArrowLeft":
        s = clamp(s - step, 0, 100)
        break
      case "ArrowUp":
        v = clamp(v + step, 0, 100)
        break
      case "ArrowDown":
        v = clamp(v - step, 0, 100)
        break
      default:
        return
    }
    e.preventDefault()
    update({ s, v })
  }

  return (
    <div
      ref={ref}
      data-slot="color-picker-area"
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={hsva.s}
      aria-valuetext={`saturation ${hsva.s}%, brightness ${hsva.v}%`}
      className={slots.area({ className })}
      style={{
        // Pure hue, then white→transparent (saturation) and transparent→black (value) overlays.
        backgroundColor: `hsl(${hsva.h} 100% 50%)`,
        backgroundImage:
          "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      <span
        className={slots.areaThumb()}
        style={{
          left: `${hsva.s}%`,
          top: `${100 - hsva.v}%`,
        }}
      />
    </div>
  )
}
