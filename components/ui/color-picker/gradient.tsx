"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

import { clamp, stopsToBarCss } from "./color"
import { CHECKER_STYLE, useColorPickerContext } from "./context"

// ─── ColorPickerGradient (stop track + angle) ───────────────────────────────────────

/**
 * The gradient editor's chrome: a stop track you click to add stops and drag to move them, plus an
 * angle rail for linear gradients. The geometry (linear/radial) lives in the top fill-type row, so
 * this part owns only stop placement and the angle. The active stop's *color* is edited by the
 * shared square/rails/hex below it (the mode-aware `update`).
 */
export function ColorPickerGradient({ className }: { className?: string }) {
  const {
    gradient,
    activeStopId,
    setActiveStopId,
    addStop,
    removeStop,
    moveStop,
    setGradientAngle,
    slots,
  } = useColorPickerContext("ColorPickerGradient")
  const barRef = React.useRef<HTMLDivElement>(null)

  function positionFromClientX(clientX: number) {
    const el = barRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
  }

  // Click on empty track adds a stop there; clicks that start on a handle stop propagation, so
  // this only fires for the track itself.
  function handleTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    addStop(positionFromClientX(e.clientX))
  }

  function handleStopPointerDown(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    e.stopPropagation()
    setActiveStopId(id)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleStopPointerMove(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    moveStop(id, positionFromClientX(e.clientX))
  }

  function handleStopKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, id: string, position: number) {
    const step = e.shiftKey ? 10 : 1
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      moveStop(id, position - step)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      moveStop(id, position + step)
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault()
      removeStop(id)
    }
  }

  const canRemove = gradient.stops.length > 2

  return (
    <div data-slot="color-picker-gradient" className={cn("flex flex-col gap-3", className)}>
      <div
        ref={barRef}
        className={slots.gradientBar()}
        style={CHECKER_STYLE}
        onPointerDown={handleTrackPointerDown}
        role="group"
        aria-label="Gradient stops"
      >
        <span
          className={slots.gradientFill({ className: "pointer-events-none" })}
          style={{ backgroundImage: stopsToBarCss(gradient.stops) }}
        />
        {gradient.stops.map((stop) => (
          <button
            key={stop.id}
            type="button"
            data-slot="color-picker-gradient-stop"
            data-active={stop.id === activeStopId}
            aria-label={`Color stop at ${Math.round(stop.position)}%${canRemove ? ", press Delete to remove" : ""}`}
            className={slots.gradientStop()}
            style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
            onPointerDown={(e) => handleStopPointerDown(e, stop.id)}
            onPointerMove={(e) => handleStopPointerMove(e, stop.id)}
            onKeyDown={(e) => handleStopKeyDown(e, stop.id, stop.position)}
          />
        ))}
      </div>

      {/* The geometry (linear/radial) lives in the top fill-type row; here, linear gradients get
          their direction rail. Radial has no direction, so the row collapses to just the track. */}
      {gradient.type === "linear" && (
        <div className={slots.gradientControls()}>
          <div className={slots.angleRail()}>
            <SliderPrimitive.Root
              className={slots.sliderRoot()}
              min={0}
              max={360}
              step={1}
              value={[gradient.angle]}
              onValueChange={([a]) => setGradientAngle(a)}
              aria-label="Gradient angle"
            >
              <SliderPrimitive.Track className={slots.sliderTrack({ className: "bg-muted ring-black/5" })}>
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-brand/30" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className={slots.sliderThumb({ className: "bg-background" })} />
            </SliderPrimitive.Root>
            <span className={slots.angleValue()}>{Math.round(gradient.angle)}°</span>
          </div>
        </div>
      )}
    </div>
  )
}
