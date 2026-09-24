"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { CHECKER_STYLE, colorPickerVariants } from "./context"

// ─── Popover wrappers ─────────────────────────────────────────────────────────────────

export const ColorPickerPopover = PopoverPrimitive.Root
export const ColorPickerTrigger = PopoverPrimitive.Trigger

/**
 * A ready-made trigger swatch: a button showing the current color over a checkerboard. Wrap it in
 * `ColorPickerTrigger asChild` to open the panel. Pass the same `value` you give the picker.
 */
export interface ColorPickerTriggerSwatchProps
  extends Omit<React.ComponentProps<"button">, "value"> {
  value: string
}

export function ColorPickerTriggerSwatch({
  value,
  className,
  ...props
}: ColorPickerTriggerSwatchProps) {
  const slots = colorPickerVariants()
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

export type ColorPickerContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

/**
 * Portals a ColorPicker panel into a positioned, animated popover. It draws **no chrome** of its
 * own: the `ColorPicker` inside already paints the card (border, radius, elevation, `--surface`)
 * in its default `surface="card"`, so adding a frame here would nest one card in another.
 */
export function ColorPickerContent({
  className,
  align = "start",
  sideOffset = 8,
  children,
  ...props
}: ColorPickerContentProps) {
  const slots = colorPickerVariants()
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
