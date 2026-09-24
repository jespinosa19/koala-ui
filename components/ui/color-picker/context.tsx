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
 * The default preset palette, drawn from Koala's own colour ramps (the set the Figma panel ships
 * with) rather than a generic spectrum: neutrals first, then the purple/blue family, the greens,
 * and the warm end. Duplicates are removed because the swatch key is the hex itself.
 */
export const defaultColorPresets = [
  "#676a83", // slate 500
  "#85817a", // cream 500
  "#7c3aed", // purple 600
  "#60a5fa", // blue 400
  "#c4b5fd", // purple 300
  "#8b5cf6", // purple 500
  "#67aa38", // soft green 500
  "#86b467", // dark green 400
  "#a5ca8c", // dark green 300
  "#3f5d2e", // dark green 700
  "#93c5fd", // blue 300
  "#1e3a8a", // blue 900
  "#3b82f6", // blue 500
  "#fc9e75", // dark orange 300
  "#f0b100", // yellow 500
  "#d08700", // yellow 600
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
    // The panel is a real card by default (the Figma spec): border, radius, elevation. It only
    // declares `--surface` in that variant, where it actually paints; `surface="plain"` keeps the
    // old chrome-less root that inherits whatever holds it, so a picker embedded in an existing
    // card doesn't double up borders. See the `surface` variant below.
    root: "flex flex-col",
    // 2D saturation (x) / value (y) field. Square in both sizes, per the design.
    area: [
      "relative aspect-square w-full shrink-0 cursor-crosshair touch-none select-none overflow-hidden rounded-md",
      // The edge is an ::after overlay ring, same as the rails, never a `border`: backgrounds paint
      // under a border, and the white/black overlays (origin padding-box, repeating) tile their
      // transparent end into it, so the raw hue leaked out as a 1px line on the left and bottom
      // edges, reading as a frame around the square. No shadow either: it sits in-flow on the card.
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand",
    ],
    areaThumb: [
      // A 16px rounded *square*, not a circle: `rounded-xs` (5px) is the one radius small enough
      // to stay square-ish at this size, which is why the token exists.
      // `z-10` lifts it over the square's ::after edge, which comes later in paint order.
      "pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-xs",
      // Hollow: the centre shows the colour underneath (no fill to blend away). A white ring
      // fenced by a dark ring on BOTH sides (outset + inset) plus a soft drop shadow keeps the
      // handle visible on pure white (top-left) and pure black (bottom) alike. A filled white
      // handle vanished against the white corner of the square.
      "border-2 border-white",
      "shadow-[0_0_0_1px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.45)]",
    ],
    // Hue + alpha rails share a shape; the track background is set per-rail inline. The edge rides
    // on ::after so it paints over the alpha rail's `absolute inset-0` wash; an inset ring on the
    // track sat under that span and vanished (memory `inset-ring-under-children`).
    sliderRoot: "relative flex h-4 w-full touch-none select-none items-center",
    sliderTrack:
      "relative h-2.5 w-full grow overflow-hidden rounded-full after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10",
    sliderThumb: [
      // Same rounded-square language as the area handle, so both drag affordances match.
      "block size-4 rounded-xs border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.4)]",
      "cursor-grab active:cursor-grabbing",
      "transition-[scale] duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
    ],
    // The rails, stacked. Inset a touch from the square so the round track ends line up optically
    // with the square's straight edge (the design nudges them 4px in).
    controls: "flex w-full flex-col gap-2.5 px-1",
    // A real border, not an inset ring: the opaque color span (`absolute inset-0`) paints over an
    // inset ring, so the frame would vanish on solid colors. A border sits outside the span and
    // stays visible: `border-border` keeps the chip from blending into a white/dark surface.
    preview: "relative size-9 shrink-0 overflow-hidden rounded-md border border-border",
    // Top row: the format switcher, plus the eyedropper where the browser has one.
    formatRow: "flex w-full items-center gap-2",
    // A full-width segmented ToggleGroup row inside the panel, shared by the format switcher
    // (HEX/HSL/RGB) and the image-fit toggle (Cover/Contain) so both troughs read alike. Width
    // only: the `segmented` variant already owns the track, its padding and its `gap-0.5`, and
    // overriding those (a `flex` beating `inline-flex`, a `gap-1.5` beating `gap-0.5`) is what
    // made the two rows disagree and forced the sliding thumb across a visible gutter.
    segmentedRow: "w-full",
    segmentedItem: "flex-1 px-0",
    // The numeric/hex fields for the active format.
    fields: "flex w-full items-center gap-2",
    field: "min-w-0 flex-1",
    // Generic single-control row, reused by the image URL field.
    inputRow: "flex items-center gap-2",
    eyedropper: [
      // Sized to the segmented switcher it sits beside (both 32px tall).
      "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input",
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
    // Rides the DS ToggleGroup in its `outline` variant, so the pill base has to be neutralised
    // back to a bare 36px tile: `size-9` cancels `h-10`, `p-0` cancels `px-3.5`, `border-0`
    // cancels `border` (the item's `border-input` / `data-[state=on]:border-brand` colours go
    // inert at zero width), and `bg-transparent` cancels `bg-[var(--surface,…)]` so the inline
    // checkerboard paints straight onto the panel.
    fillTile: [
      "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0 ring-1 ring-black/10",
      "flex items-center justify-center text-muted-foreground",
      "transition-[scale,box-shadow,color] duration-fast ease-out active:scale-[0.94]",
      "hover:text-foreground",
      // The item's unselected hover paints a plate + accent text; a tile has no plate (the empty
      // image tile would flash an accent square behind its icon). Cancelled on the SAME
      // `data-[state=off]:hover:` prefix so tailwind-merge deletes it, rather than leaving two
      // rules whose Tailwind v4 variant weight would decide the winner.
      "data-[state=off]:hover:bg-transparent data-[state=off]:hover:text-foreground",
      // A chosen tile keeps the muted glyph: the ring is the whole selected affordance.
      "data-[state=on]:text-muted-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
      // Selected tile takes the brand ring with an offset gap, the DS selected-control look. On
      // the item's own `data-[state=on]:` prefix, so it replaces the pill's `ring-brand/10` halo
      // instead of stacking with it.
      "data-[state=on]:ring-2 data-[state=on]:ring-brand data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-popover",
      "[&_svg]:relative [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    fillTilePreview: "absolute inset-0",
    // ── Gradient editor ──
    // Stop track: a checkerboard wrapper; the live stop gradient + handles layer on top. The edge
    // lives on the fill, not the bar: the fill is `absolute inset-0`, so it painted over an inset
    // ring on the bar (and turned the bar's focus ring inset, hiding that too). On the fill it
    // sits above the gradient and under the stop handles, which come later in paint order.
    gradientBar: [
      "relative h-7 w-full cursor-copy touch-none select-none rounded-md",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand",
    ],
    gradientFill: "absolute inset-0 rounded-md ring-1 ring-inset ring-black/10",
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
    // The image outline rides on ::after, over the filling <img> (an inset ring on the frame
    // painted under the photo and never showed).
    imagePreview:
      "group relative aspect-[16/10] w-full overflow-hidden rounded-lg after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
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
    // ── Presets ──
    // A labelled section, fenced off from the editor above by a hairline.
    presets: "flex w-full flex-col border-t border-border",
    presetsLabel: "text-sm font-medium text-muted-foreground",
    // A wrapping row of fixed 24px chips, not a column grid: the palette can be any length and
    // still breaks evenly at whichever panel width it lands in.
    swatches: "flex flex-wrap gap-1",
    swatch: [
      "relative size-6 shrink-0 cursor-pointer rounded-sm ring-1 ring-inset ring-black/10",
      "transition-[scale] duration-fast ease-out active:scale-[0.92]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface,var(--background))]",
      // polish: a 24px chip is under the 40px hit target (#9). The palette is a dense grid, so the
      // target can only grow into the 4px gutter without swallowing its neighbours: this claims
      // exactly that, taking each chip to 28px. The grid size is the design's, not ours to inflate.
      "before:absolute before:-inset-0.5 before:content-['']",
      // Selected: a gap ring in the panel surface, fenced by a halo of the swatch's own colour
      // (set inline, since only the swatch knows it). No glyph: the design marks it with the ring.
      "data-[selected=true]:ring-2 data-[selected=true]:ring-[var(--surface,var(--background))]",
    ],
    // Trigger swatch (opens the popover): shows the current color over a checkerboard.
    trigger: [
      "relative inline-flex size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input",
      "transition-[scale,box-shadow] duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    // Positioning + animation only. The chrome (border, radius, elevation, `--surface`) belongs to
    // the `ColorPicker` inside, which already paints exactly that card in its default `surface`
    // variant: painting it here too would draw the panel twice, one card inside another.
    content: [
      "z-50 outline-none",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
  },
  variants: {
    // Panel footprint. `size` is the real knob (like every other DS control); `density` only picks
    // its default at the root (comfortable → md, compact → sm). It tunes width and rhythm, never
    // colour or radius, and never the 24px preset chip, which is fixed in both sizes.
    size: {
      md: { root: "w-81 gap-3", presets: "gap-2 pt-4" },
      sm: { root: "w-54 gap-2", presets: "gap-1.5 pt-3" },
    },
    // Whether the panel paints its own card.
    surface: {
      // The Figma panel: a floating card. It declares `--surface` here (in the same variant that
      // paints the background) so the Inputs and swatch rings inside blend with it, per the
      // --surface contract.
      card: {
        root: [
          "rounded-xl border border-border bg-popover text-popover-foreground shadow-xl",
          "[--surface:var(--popover)]",
        ],
      },
      // Chrome-less: inherits whatever holds it. For embedding inside a card/dialog that already
      // draws the frame, or for a recomposed sub-picker.
      plain: { root: "" },
    },
  },
  compoundVariants: [
    // Padding belongs to the card: a plain root has nothing to pad away from.
    { surface: "card", size: "md", className: { root: "p-4" } },
    { surface: "card", size: "sm", className: { root: "p-2" } },
  ],
  defaultVariants: {
    size: "md",
    surface: "card",
  },
})

export type ColorPickerSlots = ReturnType<typeof colorPickerVariants>

// ─── Cross-part value types ─────────────────────────────────────────────────────────

/** The fill kinds the picker can edit. Solid is the classic single color; gradient and image
 * are opt-in via the `modes` prop and add the fill-type row at the top of the panel. */
export type ColorPickerMode = "solid" | "gradient" | "image"

/**
 * How the colour is *written* in the fields row. Purely a display choice: HSV stays the working
 * model in every format, so switching HEX → HSL → RGB never nudges the colour.
 */
export type ColorPickerFormatValue = "hex" | "hsl" | "rgb"

/** The formats the switcher offers, in display order. */
export const colorPickerFormats: ColorPickerFormatValue[] = ["hex", "hsl", "rgb"]

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
  // How the fields row writes the colour (hex / hsl / rgb).
  format: ColorPickerFormatValue
  setFormat: (format: ColorPickerFormatValue) => void
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
