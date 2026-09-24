"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox } from "@/lib/hit-area"

/**
 * Footer: multi-part site footer for marketing, product, and ecommerce pages. Pattern:
 * one `tv` recipe with `slots`, shared variants flowing to every part through React
 * Context (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * It's pure layout, no Radix primitive, because a footer owns no focus/keyboard/ARIA
 * behavior beyond ordinary links. The upper region (`FooterTop`) is a brand column plus
 * grouped link columns; the lower bar (`FooterBottom`) carries copyright, legal links, and
 * social icons. A newsletter or app-download block is just children composed from `Input`
 * and `Button`, so the footer itself stays dependency-free.
 */
export const footerVariants = tv({
  slots: {
    // The footer always sits on the page ground, closed by a hairline top rule. There is no
    // filled panel treatment: every footer in the design system reads as part of the page, never
    // as a card bolted onto the bottom of it.
    root: "w-full border-t border-border bg-background text-foreground",
    // The max-width gutter, shared by the top region and the bottom bar. Matches the canonical
    // section gutter (max-w-7xl + px-6 sm:px-8) so the footer lines up with the header and sections.
    container: "mx-auto flex w-full max-w-7xl flex-col px-6 sm:px-8",
    // Brand column beside the link columns; stacks on top below lg.
    top: "flex flex-col gap-10 lg:flex-row lg:justify-between",
    brand: "flex flex-col gap-4 lg:max-w-xs",
    tagline: "text-sm text-pretty text-muted-foreground",
    // Link columns: a 2/3-up grid on small screens, a single row on lg. The `layout` variant below
    // decides how much of that row they own; `justify-between` spreads them inside it and `gap-16`
    // is the floor, not the rhythm.
    columns: "grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-16",
    column: "flex flex-col gap-3",
    // `font-sans` opts this h3 out of the DM Sans heading face: it caps a list of `text-sm`
    // Inter links at the same size, so weight alone separates them. A face change there
    // reads as an inconsistency, not a hierarchy.
    columnTitle: "font-sans text-sm font-semibold text-foreground",
    // Dense footer link. polish: text links in a tight list deliberately skip the 40px hit
    // target: a pseudo-extender would overlap vertical neighbors (gap-3 < 40px), which the
    // rules forbid; `py-1` widens the row as far as is safe here.
    link: [
      "inline-flex w-fit items-center gap-2 py-1 text-sm text-muted-foreground",
      "transition-colors duration-fast ease-out hover:text-foreground",
      // A link for a page that is not live yet ("Store · Soon"): inert to the pointer, so it keeps
      // its resting muted ink instead of brightening on hover. Pair it with a Badge.
      "aria-disabled:pointer-events-none",
      "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    social: "flex items-center gap-1",
    // Icon link: square, ghost, with a 40px hit box and tactile press.
    socialLink: [
      "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
      "transition duration-fast ease-out hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-5 [&_svg]:shrink-0",
      hitBox,
    ],
    // Lower bar: copyright on one side, legal/locale on the other; a hairline separates it
    // from the top region.
    bottom:
      "flex flex-col gap-4 border-t border-border sm:flex-row sm:items-center sm:justify-between",
    // tabular-nums keeps the © year from shifting if it animates/updates.
    copyright: "text-sm text-muted-foreground tabular-nums",
    legal: "flex flex-wrap items-center gap-x-6 gap-y-2",
  },
  variants: {
    // How much of the top region the link columns own. Both readings come straight from the
    // design: the brand column can sit beside a right-hand cluster, or be dropped (or moved above)
    // so the columns run the full measure.
    // Width, not flex-basis: `FooterColumns` is sometimes a direct child of the column-flex
    // container (the image-overlay composition), where a basis would size its HEIGHT.
    layout: {
      // Brand column on the left, link columns clustered across the right band.
      aside: { columns: "lg:w-[55%]" },
      // No brand beside them: the columns take the whole row and distribute edge to edge. The gap
      // floor drops, because a full-measure grid carries more columns in the same width.
      wide: { columns: "lg:w-full lg:gap-8" },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For Footer it
    // tunes the block padding and the gap to the bottom bar. `comfortable` is the marketing
    // default; `compact` tightens it for app shells.
    density: {
      comfortable: { container: "py-12", bottom: "mt-10 pt-8" },
      compact: { container: "py-8", bottom: "mt-8 pt-6" },
    },
  },
  defaultVariants: {
    layout: "aside",
    density: "comfortable",
  },
})

type FooterSlots = ReturnType<typeof footerVariants>
const [FooterProvider, useFooterContext] = createContext<{ slots: FooterSlots }>("Footer")

export interface FooterProps
  extends React.ComponentProps<"footer">,
    VariantProps<typeof footerVariants> {}

export function Footer({ className, layout, density, children, ...props }: FooterProps) {
  // Density resolves prop > provider > "comfortable"; compute the slots once, every part
  // reads them from context (the Card/Navbar pattern).
  const slots = footerVariants({ layout, density: useDensity(density) })
  return (
    <FooterProvider slots={slots}>
      <footer data-slot="footer" className={slots.root({ className })} {...props}>
        <div className={slots.container()}>{children}</div>
      </footer>
    </FooterProvider>
  )
}

/** The upper region: a brand column beside the grouped link columns. */
export function FooterTop({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterTop")
  return <div data-slot="footer-top" className={slots.top({ className })} {...props} />
}

/** Brand column: logo lockup, tagline, and optionally social or a newsletter. */
export function FooterBrand({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterBrand")
  return <div data-slot="footer-brand" className={slots.brand({ className })} {...props} />
}

/** Muted lead line under the brand mark. */
export function FooterTagline({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useFooterContext("FooterTagline")
  return <p data-slot="footer-tagline" className={slots.tagline({ className })} {...props} />
}

/** Wrapper for the link columns. */
export function FooterColumns({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterColumns")
  return <div data-slot="footer-columns" className={slots.columns({ className })} {...props} />
}

export interface FooterColumnProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Heading rendered above the column's links. */
  title?: React.ReactNode
}

/** A single titled column of links. */
export function FooterColumn({ className, title, children, ...props }: FooterColumnProps) {
  const { slots } = useFooterContext("FooterColumn")
  return (
    <div data-slot="footer-column" className={slots.column({ className })} {...props}>
      {title != null && (
        <h3 data-slot="footer-column-title" className={slots.columnTitle()}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export interface FooterLinkProps extends Omit<React.ComponentProps<"a">, "ref"> {
  /** Render the child as the link (Radix Slot), e.g. a Next.js `<Link>`. */
  asChild?: boolean
}

export function FooterLink({ className, asChild = false, ...props }: FooterLinkProps) {
  const { slots } = useFooterContext("FooterLink")
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="footer-link" className={slots.link({ className })} {...props} />
}

/** Row of social icon links. */
export function FooterSocial({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterSocial")
  return <div data-slot="footer-social" className={slots.social({ className })} {...props} />
}

export interface FooterSocialLinkProps extends Omit<React.ComponentProps<"a">, "ref"> {
  asChild?: boolean
}

/**
 * An icon-only social link. Pass `aria-label` (e.g. "Instagram") so assistive tech can
 * announce it. The glyph alone has no accessible name.
 */
export function FooterSocialLink({ className, asChild = false, ...props }: FooterSocialLinkProps) {
  const { slots } = useFooterContext("FooterSocialLink")
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="footer-social-link" className={slots.socialLink({ className })} {...props} />
}

/** The lower bar: copyright, legal links, locale switch. */
export function FooterBottom({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterBottom")
  return <div data-slot="footer-bottom" className={slots.bottom({ className })} {...props} />
}

export function FooterCopyright({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useFooterContext("FooterCopyright")
  return <p data-slot="footer-copyright" className={slots.copyright({ className })} {...props} />
}

/** Inline group for legal/secondary links in the bottom bar. */
export function FooterLegal({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFooterContext("FooterLegal")
  return <div data-slot="footer-legal" className={slots.legal({ className })} {...props} />
}
