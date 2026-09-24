"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { useDensity } from "@/lib/density"

/**
 * Popover: the general-purpose floating surface over Radix Popover (focus management,
 * dismiss, collision-aware positioning). Where DropdownMenu is for action menus and
 * Tooltip for hover hints, Popover hosts arbitrary content: forms, pickers, info cards.
 *
 * Named parts, not dot-notation (RSC-safe). The content shell matches the rest of the DS
 * (`bg-popover`, soft border, layered shadow, fade + zoom + slide enter and a softer exit)
 * and exposes `--surface` so nested Inputs/Selects blend with the panel, not the page.
 * `density` tunes the content padding (and nothing else). See docs/ARCHITECTURE.md.
 */

export const popoverVariants = tv({
  slots: {
    content: [
      "z-50 w-72 rounded-lg border border-border-soft bg-popover text-popover-foreground shadow-lg outline-none",
      // Nested controls read this so they paint the panel surface, not a --background block.
      "[--surface:var(--popover)]",
      // Enter: fade + zoom + directional slide. Exit: fade + zoom only, and snappier, softer
      // than the enter (polish).
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
    // The arrow is filled with the panel color; the soft border doesn't trace it (kept simple,
    // matching how the rest of the DS treats popover arrows).
    arrow: "fill-popover",
    title: "text-base font-semibold leading-none tracking-tight text-foreground",
    description: "text-sm text-muted-foreground",
    close: [
      "absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md",
      "text-muted-foreground cursor-pointer transition-[background-color,color,scale] duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
  },
  variants: {
    density: {
      comfortable: { content: "p-4" },
      compact: { content: "p-3" },
    },
  },
  defaultVariants: { density: "comfortable" },
})

// ─── Root / Trigger / Anchor / Close (behavioral passthroughs) ──────────────────

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor
export const PopoverClose = PopoverPrimitive.Close

// ─── Content ─────────────────────────────────────────────────────────────────────

export interface PopoverContentProps
  extends React.ComponentProps<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverVariants> {
  /** Render a small pointer toward the trigger. @default false */
  showArrow?: boolean
}

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  density,
  showArrow = false,
  children,
  ...props
}: PopoverContentProps) {
  const slots = popoverVariants({ density: useDensity(density) })
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={slots.content({ className })}
        {...props}
      >
        {children}
        {showArrow && <PopoverPrimitive.Arrow className={slots.arrow()} width={12} height={6} />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

// ─── Optional structured-content helpers ────────────────────────────────────────

/** A semantic title for the panel. Pair with `aria-labelledby` on the content if needed. */
export function PopoverTitle({ className, ...props }: React.ComponentProps<"h4">) {
  const { title } = popoverVariants()
  return <h4 data-slot="popover-title" className={title({ className })} {...props} />
}

/** Muted supporting copy under a `PopoverTitle`. */
export function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { description } = popoverVariants()
  return <p data-slot="popover-description" className={description({ className })} {...props} />
}

/**
 * A styled close (×) button anchored to the panel's top-right. Wraps Radix `Popover.Close`,
 * so it dismisses the popover with no extra wiring. Pass your own icon as the child.
 */
export function PopoverCloseButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  const { close } = popoverVariants()
  return (
    <PopoverPrimitive.Close data-slot="popover-close" className={close({ className })} {...props}>
      {children}
    </PopoverPrimitive.Close>
  )
}
