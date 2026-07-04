"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { type VariantProps } from "@/lib/tv"
import { useDensity } from "@/lib/density"

import { CHECKER_STYLE, colorPickerVariants } from "./context"

// ─── Popover wrappers ─────────────────────────────────────────────────────────────────

export const ColorPickerPopover = PopoverPrimitive.Root
export const ColorPickerTrigger = PopoverPrimitive.Trigger

/**
 * A ready-made trigger swatch: a button showing the current color over a checkerboard. Wrap it in
 * `ColorPickerTrigger asChild` to open the panel. Pass the same `value` you give the picker.
 */
export interface ColorPickerTriggerSwatchProps
  extends Omit<React.ComponentProps<"button">, "value">,
    VariantProps<typeof colorPickerVariants> {
  value: string
}

export function ColorPickerTriggerSwatch({
  value,
  className,
  density,
  ...props
}: ColorPickerTriggerSwatchProps) {
  const slots = colorPickerVariants({ density: useDensity(density) })
  return (
    <button
      type="button"
      data-slot="color-picker-trigger-swatch"
      className={slots.trigger({ className })}
      style={CHECKER_STYLE}
      {...props}
    >
      <span className="absolute inset-0" style={{ backgroundColor: value }} />
    </button>
  )
}

export interface ColorPickerContentProps
  extends React.ComponentProps<typeof PopoverPrimitive.Content>,
    VariantProps<typeof colorPickerVariants> {}

/** Portals a ColorPicker panel into a positioned, animated popover. */
export function ColorPickerContent({
  className,
  align = "start",
  sideOffset = 8,
  density,
  children,
  ...props
}: ColorPickerContentProps) {
  const slots = colorPickerVariants({ density: useDensity(density) })
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="color-picker-content"
        align={align}
        sideOffset={sideOffset}
        className={slots.content({ className })}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
