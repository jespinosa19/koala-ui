"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

/**
 * Link: the text link, in both of the house treatments.
 *
 * `default` / `muted` are the STANDALONE UI link (Button's single-element sibling), for the links
 * that live outside running prose: contact rows, directory cards, footer columns, meta rows. They
 * rest at the full-strength `text-foreground` (or muted) and lift to the brand accent on hover, the
 * calm "black, brand on hover" treatment, and can carry a trailing glyph that reveals on hover.
 *
 * `prose` is the hyperlink EMBEDDED IN RUNNING COPY. It sets no rest color, so it inherits the
 * paragraph it sits in (muted inside a `<p>`, `text-foreground` inside a Pricing feature row); it
 * wears a hairline `decoration-border` underline at rest and turns text + underline the `--link`
 * token on hover (see globals.css / /docs/foundations/colors / memory `links-blue-link-token`).
 * `--link` DERIVES from `--brand`, so a prose link carries the active accent; it stays a role of
 * its own only because it is tuned for TEXT (darkened on light, where the raw accent misses the
 * AA floor) while `--brand` is tuned for fills. It stays `display: inline` so it breaks across
 * lines mid-sentence.
 *
 * `tv` recipe + Radix `Slot` for `asChild`, semantic tokens only, `className` merged last.
 *
 * `"use client"` only because `asChild` composes with `next/link` and other client links; the
 * markup itself is inert.
 */

/**
 * Layout + the trailing-icon reveal, shared by the two STANDALONE variants. It sits on the variants
 * and NOT in `base` because `prose` wants neither: an atomic `inline-flex` box cannot break across
 * lines mid-sentence (it wraps as an unbreakable rectangle), and a glyph inside a prose link is
 * content rather than a hover affordance, so it must not start at `opacity-0`. `defaultVariants`
 * guarantees one of the two standalone variants is always applied.
 */
const standalone = [
  // inline-flex so a trailing glyph sits centered beside the label instead of dropping to its
  // own line (Preflight makes `svg { display: block }`). The label still wraps within its item.
  "inline-flex items-center gap-1",
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
]

export const linkVariants = tv({
  base: [
    "cursor-pointer rounded-xs underline-offset-4 outline-none",
    // Specific transition (never `transition: all`, #14); only the color animates. v4's
    // `transition-colors` names `text-decoration-color`, so a hovering underline fades with the text.
    "transition-colors duration-base ease-out",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ],
  variants: {
    // The link's whole appearance, not just its rest color.
    variant: {
      // Full-strength label that warms to brand on hover: the default UI link.
      default: [...standalone, "text-foreground hover:text-brand"],
      // Quiet by default (a value in a directory, a footer link), brand on hover.
      muted: [...standalone, "text-muted-foreground hover:text-brand"],
      // The in-prose hyperlink. Deliberately colorless at rest: it inherits the copy around it.
      prose: [
        "inline font-medium underline decoration-border",
        // 160ms, not base's 300ms. A word-sized target in running text is hovered constantly and
        // briefly; at 300ms a cursor sweeping a paragraph leaves a trail of words slowly cooling
        // back down, because the fade OUT is just as slow. twMerge drops base's `duration-base`.
        "duration-fast",
        // No thickness: `auto` lets the underline track the font metrics. (This is also why `prose`
        // refuses the `underline` prop, which would pin it to 1px. See LinkProps.)
        "hover:text-link hover:decoration-link",
        // The halo hugs the word. Base's `ring-offset-2` paints an OPAQUE `--background` layer,
        // which on a tinted surface (the `bg-muted/30` card on /docs/patterns) would smear the page
        // color around the link, and at `text-sm` there is only ~1.5px of half-leading for it to
        // live in, so it would bleed into the line above.
        "focus-visible:ring-offset-0",
        // A wrapped prose link is two inline fragments; `slice` (the default) would draw the focus
        // ring open at the break. `clone` closes it around each fragment. Inert at rest: there is
        // no background, border or shadow on this element until it is focused.
        "box-decoration-clone",
      ],
    },
    // Underline at rest, for `default`/`muted`. Off by default (the color shift carries the
    // affordance in-context); turn on for a prose-like link that must read as underlined without
    // the `--link` role. `prose` is underlined by definition and does not take this prop.
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

type LinkVariants = VariantProps<typeof linkVariants>

/**
 * `prose` is underlined by definition, so it does not take `underline`: passing both would stack a
 * pinned `decoration-1` thickness on top of the prose treatment, which is subtly wrong and never
 * obviously broken. A type error beats a silent, slightly-off render.
 */
type LinkVariantProps =
  | { variant?: Exclude<LinkVariants["variant"], "prose">; underline?: LinkVariants["underline"] }
  | { variant: "prose"; underline?: never }

export type LinkProps = React.ComponentProps<"a"> &
  LinkVariantProps & {
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
