"use client"

import * as React from "react"

import { tv } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import type { GradientType, GradientValue, Hsva } from "./color"

/**
 * Shared foundation for the ColorPicker parts: the `tv` recipe (every slot, for every part), the
 * literal color-space constants, the cross-part value types, and the typed Context the root fills
 * and each part reads. It lives in one module so the root and the parts can both import it without
 * a cycle: the root imports the parts, and the parts import only this.
 */

// ─── Constants ────────────────────────────────────────────────────────────────────

/**
 * A curated, theme-agnostic default palette for the preset row (Tailwind-500-ish hues): a full
 * spectrum then neutrals, sized to two even rows of the 8-column grid.
 */
export const defaultColorPresets = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#000000", // black
  "#ffffff", // white
]

/** Alpha checkerboard: a constant 8px chequer so transparency reads on any backdrop. */
export const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, color-mix(in srgb, var(--muted-foreground) 22%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in srgb, var(--muted-foreground) 22%, transparent) 75%), linear-gradient(45deg, color-mix(in srgb, var(--muted-foreground) 22%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in srgb, var(--muted-foreground) 22%, transparent) 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 4px 4px",
}

// ─── Variants ───────────────────────────────────────────────────────────────────

export const colorPickerVariants = tv({
  slots: {
    root: [
      "flex flex-col gap-3 rounded-xl",
      // Lets nested controls (the hex Input) paint this surface when the picker sits in a popover.
      "[--surface:var(--popover)]",
    ],
    // 2D saturation (x) / value (y) field. The crosshair + ring read on every backdrop color.
    area: [
      "relative w-full shrink-0 cursor-crosshair touch-none select-none overflow-hidden rounded-lg",
      "ring-1 ring-inset ring-black/10 outline-none",
      "focus-visible:ring-2 focus-visible:ring-brand",
    ],
    areaThumb: [
      "pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full",
      // Hollow: the centre shows the colour underneath (no fill to blend away). A white ring
      // fenced by a dark ring on BOTH sides (outset + inset) plus a soft drop shadow keeps the
      // handle visible on pure white (top-left) and pure black (bottom) alike. A filled white
      // handle vanished against the white corner of the square.
      "border-2 border-white",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.45)]",
    ],
    // Hue + alpha rails share a shape; the track background is set per-rail inline.
    sliderRoot: "relative flex h-4 w-full touch-none select-none items-center",
    sliderTrack: "relative h-3 w-full grow overflow-hidden rounded-full ring-1 ring-inset ring-black/10",
    sliderThumb: [
      "block size-4 rounded-full border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.4)]",
      "cursor-grab active:cursor-grabbing",
      "transition-[scale] duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
    ],
    // Left: live preview chip over a checkerboard. Right: the rails stacked.
    controls: "flex items-stretch gap-3",
    // A real border, not an inset ring: the opaque color span (`absolute inset-0`) paints over an
    // inset ring, so the frame would vanish on solid colors. A border sits outside the span and
    // stays visible: `border-border` keeps the chip from blending into a white/dark surface.
    preview: "relative shrink-0 overflow-hidden rounded-md border border-border",
    rails: "flex min-w-0 flex-1 flex-col justify-center gap-3",
    // Hex field + eyedropper row.
    inputRow: "flex items-center gap-2",
    eyedropper: [
      "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input",
      "bg-[var(--surface,var(--background))] text-muted-foreground",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    // Fill-type row (Figma's top selector): one row of small tiles, each a live preview of a
    // fill kind: the solid colour, every gradient geometry, then the image. Picking a tile sets
    // the kind (and, for a gradient tile, the geometry), so the whole choice lives up top.
    fillTypes: "flex w-full items-center gap-1.5",
    fillTile: [
      "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-black/10",
      "flex items-center justify-center text-muted-foreground",
      "transition-[scale,box-shadow,color] duration-fast ease-out active:scale-[0.94]",
      "hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
      // Selected tile takes the brand ring with an offset gap, the DS selected-control look.
      "data-[active=true]:ring-2 data-[active=true]:ring-brand data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-popover",
      "[&_svg]:relative [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    fillTilePreview: "absolute inset-0",
    // A full-width segmented ToggleGroup row, reused by the image-fit (Cover / Contain) toggle.
    modes: "flex w-full gap-1.5",
    modeItem: "flex-1 px-0",
    // ── Gradient editor ──
    // Stop track: a checkerboard wrapper; the live stop gradient + handles layer on top.
    gradientBar: [
      "relative h-7 w-full cursor-copy touch-none select-none rounded-md ring-1 ring-inset ring-black/10",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand",
    ],
    gradientFill: "absolute inset-0 rounded-md",
    // A stop handle rides the track; its fill is the stop color over a white casing so light
    // stops still read. Selected gets the brand ring; it drags horizontally only.
    gradientStop: [
      "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full",
      "border-2 border-white bg-clip-padding shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.4)]",
      "transition-[scale] duration-fast ease-out active:scale-[0.92] active:cursor-grabbing",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
      "data-[active=true]:ring-2 data-[active=true]:ring-brand data-[active=true]:ring-offset-1 data-[active=true]:ring-offset-popover",
    ],
    // Angle rail row (the gradient geometry now lives in the top fill-type row).
    gradientControls: "flex items-center gap-2",
    angleRail: "flex min-w-0 flex-1 items-center gap-2",
    angleValue: "w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground",
    // ── Image fill ──
    imageDropzone: [
      "flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg p-4 text-center",
      "border border-dashed border-input bg-[var(--surface,var(--background))] text-muted-foreground",
      "transition-[color,background-color,border-color] duration-fast ease-out",
      "hover:border-brand/50 hover:bg-accent hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
      "[&_svg]:size-6 [&_svg]:shrink-0",
    ],
    imagePreview: "group relative aspect-[16/10] w-full overflow-hidden rounded-lg ring-1 ring-inset ring-black/10",
    imageRemove: [
      "absolute right-1.5 top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-md",
      // backdrop-blur is gated to the reveal states: a live backdrop-filter leaks through opacity-0
      // (the blurred backdrop patch composites even on an invisible element) and would show as a soft
      // blob in the image corner at rest. Keep backdrop-blur-none until hover/focus.
      "bg-black/55 text-white opacity-0 backdrop-blur-none transition-[opacity,backdrop-filter] duration-fast ease-out",
      "group-hover:opacity-100 group-hover:backdrop-blur-sm focus-visible:opacity-100 focus-visible:backdrop-blur-sm",
      "outline-none focus-visible:ring-2 focus-visible:ring-white/70",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    // Preset swatch grid.
    swatches: "grid grid-cols-8 gap-1.5",
    swatch: [
      "relative aspect-square w-full cursor-pointer rounded-md ring-1 ring-inset ring-black/10",
      "transition-[scale] duration-fast ease-out active:scale-[0.92]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
      // Selected check is drawn in the contrasting glyph color the swatch computes for itself.
      "[&_svg]:absolute [&_svg]:left-1/2 [&_svg]:top-1/2 [&_svg]:size-3.5 [&_svg]:-translate-x-1/2 [&_svg]:-translate-y-1/2",
    ],
    // Trigger swatch (opens the popover): shows the current color over a checkerboard.
    trigger: [
      "relative inline-flex shrink-0 cursor-pointer overflow-hidden rounded-md border border-input",
      "transition-[scale,box-shadow] duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    content: [
      "z-50 rounded-xl border border-border-soft bg-popover p-3 text-popover-foreground shadow-lg outline-none",
      "[--surface:var(--popover)]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
  },
  variants: {
    // Density tunes the panel width and the SV square's height, never color or radius.
    density: {
      comfortable: { root: "w-80", area: "h-52", preview: "w-12", trigger: "size-9" },
      compact: { root: "w-72", area: "h-44", preview: "w-11", trigger: "size-8" },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

export type ColorPickerSlots = ReturnType<typeof colorPickerVariants>

// ─── Cross-part value types ─────────────────────────────────────────────────────────

/** The fill kinds the picker can edit. Solid is the classic single color; gradient and image
 * are opt-in via the `modes` prop and add the fill-type row at the top of the panel. */
export type ColorPickerMode = "solid" | "gradient" | "image"

/** How an image fill sits in its box. Maps straight to CSS `object-fit`/`background-size`. */
export type ColorPickerImageFit = "cover" | "contain"

export interface ColorPickerImageValue {
  /** Image URL or data URL. Empty string = no image chosen yet. */
  src: string
  fit: ColorPickerImageFit
}

// ─── Context ──────────────────────────────────────────────────────────────────────

export interface ColorPickerContextValue {
  // The current color under edit. In gradient mode this maps to the active stop, so the square,
  // rails, hex field, and swatches all drive whichever stop is selected without special-casing.
  hsva: Hsva
  hex: string
  // The solid colour as hex, regardless of the active mode: the fill-type row's Solid tile
  // previews this even while a gradient stop is the thing under edit.
  solidHex: string
  showAlpha: boolean
  update: (partial: Partial<Hsva>) => void
  // Mode switching.
  mode: ColorPickerMode
  modes: ColorPickerMode[]
  setMode: (mode: ColorPickerMode) => void
  // Gradient editing.
  gradient: GradientValue
  activeStopId: string
  setActiveStopId: (id: string) => void
  addStop: (position: number) => void
  removeStop: (id: string) => void
  moveStop: (id: string, position: number) => void
  setGradientType: (type: GradientType) => void
  setGradientAngle: (angle: number) => void
  // Image editing.
  image: ColorPickerImageValue
  setImage: (partial: Partial<ColorPickerImageValue>) => void
  slots: ColorPickerSlots
}

export const [ColorPickerProvider, useColorPickerContext] =
  createContext<ColorPickerContextValue>("ColorPicker")
