"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

/**
 * Link: the standalone text link. A single-element component (Button's sibling) for the UI links
 * that live outside running prose: contact rows, directory cards, footer columns, meta rows. It
 * rests at the full-strength `text-foreground` and lifts to the brand accent on hover, the calm
 * "black, brand on hover" treatment, distinct from the inline-prose hyperlink (the blue `--link`
 * token, see globals.css / memory `links-blue-link-token`) which stays for links embedded in body
 * copy. `tv` recipe + Radix `Slot` for `asChild`, semantic tokens only, `className` merged last.
 *
 * `"use client"` only because `asChild` composes with `next/link` and other client links; the
 * markup itself is inert.
 */
export const linkVariants = tv({
  base: [
    "cursor-pointer rounded-xs underline-offset-4 outline-none",
    // inline-flex so a trailing glyph sits centered beside the label instead of dropping to its
    // own line (Preflight makes `svg { display: block }`). The label still wraps within its item.
    "inline-flex items-center gap-1",
    // Specific transition (never `transition: all`, #14); only the color animates.
    "transition-colors duration-base ease-out",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // A trailing icon is a hover affordance, not chrome: it's hidden at rest and slides + fades
    // (with a touch of de-blur, #7) into place when the link is hovered or keyboard-focused. The
    // motion is a CSS transition so it's interruptible (#4). Tailwind v4 compiles `translate-*` to
    // the standalone `translate` property, so that (not `transform`) is what the transition names
    // or the slide would snap (memory: tailwind-v4-transition-scale-translate). The icon inherits
    // the link's animating color for free (currentColor tracks the parent), and never eats clicks.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg]:transition-[opacity,translate,filter] [&_svg]:duration-base [&_svg]:ease-out motion-reduce:[&_svg]:transition-none",
    // v4 note: `blur-0` is NOT a utility here (the scale is blur-xs/sm/…/none), so clear the blur
    // with the arbitrary `blur-[0px]` — it interpolates from blur(2px), where `blur-none`/filter:none
    // would snap and leave the arrow stuck blurred.
    "[&_svg]:-translate-x-1 [&_svg]:opacity-0 [&_svg]:blur-[2px]",
    "[&:hover_svg]:translate-x-0 [&:hover_svg]:opacity-100 [&:hover_svg]:blur-[0px]",
    "[&:focus-visible_svg]:translate-x-0 [&:focus-visible_svg]:opacity-100 [&:focus-visible_svg]:blur-[0px]",
  ],
  variants: {
    // Rest color. Both lift to the brand accent on hover.
    variant: {
      // Full-strength label that warms to brand on hover: the default UI link.
      default: "text-foreground hover:text-brand",
      // Quiet by default (a value in a directory, a footer link), brand on hover.
      muted: "text-muted-foreground hover:text-brand",
    },
    // Underline at rest. Off by default (the color shift carries the affordance in-context); turn
    // on for a prose-like link that must read as underlined without the blue token.
    underline: {
      true: "underline decoration-1",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    underline: false,
  },
})

export interface LinkProps
  extends React.ComponentProps<"a">,
    VariantProps<typeof linkVariants> {
  /** Render the child element as the link (Radix Slot), e.g. to wrap `next/link`. */
  asChild?: boolean
}

export function Link({ className, variant, underline, asChild = false, ...props }: LinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="link"
      className={linkVariants({ variant, underline, className })}
      {...props}
    />
  )
}
