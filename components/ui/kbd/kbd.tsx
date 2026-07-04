"use client"

// Kbd has no hooks/state of its own, but it's meant to live inside slots that client
// components render lazily on the client, most notably Tooltip `content` (Tippy renders
// it client-side) and menu shortcut rows. A server-only component placed in such a slot
// resolves to `undefined` on the client ("Element type is invalid"), so Kbd opts into the
// client graph to stay embeddable anywhere.
import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

/**
 * Kbd: a keyboard key indicator. A single-element component (like Badge): one `tv`
 * recipe, semantic tokens only, `className` merged last. Renders a native `<kbd>` so it
 * carries the right semantics for assistive tech and document outlines.
 *
 * The default variant is a flat outline cap: a hairline border over a transparent fill, no
 * shadow, so it stays legible across all four themes and blends onto any surface. Compose
 * shortcuts by placing several side by side: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. See docs/ARCHITECTURE.md.
 */
export const kbdVariants = tv({
  base: [
    "inline-flex items-center justify-center shrink-0 whitespace-nowrap select-none",
    // Square-ish even for a single glyph: min-width tracks height so "K" and "Esc"
    // share a baseline. `font-mono` keeps multi-key rows mechanically aligned.
    // Radius is per-size (see below), not fixed on the base.
    "border font-mono font-medium tabular-nums",
    "transition duration-fast ease-out",
  ],
  variants: {
    variant: {
      // Flat outline cap: the default. Hairline border, transparent fill, no shadow.
      default: "border-border bg-transparent text-muted-foreground",
      // Filled but borderless and flat: a tinted chip for shortcuts sitting INSIDE another
      // tinted surface (a tooltip, a menu row), where the default cap's border reads as a
      // competing outline against the surface instead of blending into it.
      soft: "border-transparent bg-muted text-muted-foreground shadow-none",
      // Explicit alias for the default flat cap: kept so call sites (toolbars, help text)
      // can name the outline treatment on purpose even though it now matches the default.
      outline: "border-border bg-transparent text-muted-foreground",
      // Inverted, high-contrast cap, for callouts and onboarding hints.
      solid: "border-transparent bg-foreground text-background shadow-xs",
      // No keycap at all, just the glyph as muted mono text. For inline ⌘K hints inside
      // buttons/inputs where a raised cap would read as a second, competing control.
      // The box sizing (height/min-width/padding) is stripped per size below.
      ghost: "border-transparent bg-transparent text-muted-foreground shadow-none",
    },
    size: {
      // Radius scales with the cap: a constant 0.25x of the height (6px at the md default),
      // so the corner reads the same at every size. No token lands on 6px, hence the literals.
      sm: "h-5 min-w-5 gap-0.5 px-1 text-xs rounded-[5px] [&>svg]:size-3",
      md: "h-6 min-w-6 gap-1 px-1.5 text-xs rounded-[6px] [&>svg]:size-3.5",
      lg: "h-7 min-w-7 gap-1 px-2 text-sm rounded-[7px] [&>svg]:size-4",
    },
  },
  compoundVariants: [
    // Ghost is text, not a cap: drop the fixed height, min-width and padding at every size so
    // it flows inline like the surrounding label (the size's text/gap/svg scale still applies).
    {
      variant: "ghost",
      size: ["sm", "md", "lg"],
      class: "h-auto min-w-0 px-0",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface KbdProps
  extends React.ComponentProps<"kbd">,
    VariantProps<typeof kbdVariants> {
  /** Render the child element as the key (Radix Slot), e.g. to wrap a button. */
  asChild?: boolean
}

export function Kbd({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: KbdProps) {
  const Comp = asChild ? Slot.Root : "kbd"

  return (
    <Comp
      data-slot="kbd"
      className={kbdVariants({ variant, size, className })}
      {...props}
    />
  )
}
