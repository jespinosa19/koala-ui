"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { hitBox, hitCoarse, hitY } from "@/lib/hit-area"

export const toggleItemBase = [
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-pill border border-input bg-[var(--surface,var(--background))] font-medium text-muted-foreground",
  "data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground",
  "data-[state=on]:border-brand data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-brand/10",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
]

const glyph =
  "col-start-1 row-start-1 flex items-center justify-center transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none"

export const toggleVariants = tv({
  slots: {
    root: [
      "group/toggle",
      ...toggleItemBase,
      "transition-[color,background-color,border-color,box-shadow] duration-fast ease-out",
    ],
    icon: "inline-grid shrink-0 place-items-center",
    iconOff: [
      glyph,
      "group-data-[state=on]/toggle:scale-25 group-data-[state=on]/toggle:opacity-0 group-data-[state=on]/toggle:blur-xs",
    ],
    iconOn: [
      glyph,
      "scale-25 opacity-0 blur-xs",
      "group-data-[state=on]/toggle:scale-100 group-data-[state=on]/toggle:opacity-100 group-data-[state=on]/toggle:blur-none",
    ],
  },
  variants: {
    variant: {
      outline: {},
      ghost: {
        root: [
          "border-transparent bg-transparent",
          "data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:font-medium data-[state=on]:ring-0",
        ],
      },
    },
    size: {
      sm: { root: "h-8 px-2.5 text-sm" },
      md: { root: `h-10 px-3.5 text-sm ${hitCoarse}` },
    },
    iconOnly: {
      true: { root: "px-0" },
      false: {},
    },
  },
  compoundVariants: [
    { size: "sm", iconOnly: false, className: { root: hitY } },
    { size: "sm", iconOnly: true, className: { root: `w-8 ${hitBox}` } },
    { size: "md", iconOnly: true, className: { root: "w-10 [&_svg:not([class*='size-'])]:size-5" } },
  ],
  defaultVariants: { variant: "outline", size: "md", iconOnly: false },
})

export interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

export function Toggle({ className, variant, size, iconOnly, ...props }: ToggleProps) {
  const { root } = toggleVariants({ variant, size, iconOnly })
  return <TogglePrimitive.Root data-slot="toggle" className={root({ className })} {...props} />
}

export interface ToggleIconProps extends Omit<React.ComponentProps<"span">, "children"> {
  off: React.ReactNode
  on: React.ReactNode
}

export function ToggleIcon({ off, on, className, ...props }: ToggleIconProps) {
  const slots = toggleVariants()
  return (
    <span data-slot="toggle-icon" aria-hidden className={slots.icon({ className })} {...props}>
      <span data-slot="toggle-icon-off" className={slots.iconOff()}>
        {off}
      </span>
      <span data-slot="toggle-icon-on" className={slots.iconOn()}>
        {on}
      </span>
    </span>
  )
}
