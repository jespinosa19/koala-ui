"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { Quotes } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Testimonial: a quote card for social-proof sections. Multi-part like Card: one `tv`
 * recipe with `slots`, shared through a typed React Context so every part reads the same
 * styles (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * It is pure layout composed from existing parts: drop our `Avatar` into the footer and our
 * `Rating` (readOnly) for the stars. Lay a set of these out in a grid or inside our
 * `Carousel` to build a testimonial wall.
 */
export const testimonialVariants = tv({
  slots: {
    // No border: the edge is a ring (box-shadow) set per variant, so it takes no layout and the
    // chrome-less variants need nothing to cancel it.
    root: "flex h-full flex-col gap-4 rounded-2xl p-6 text-card-foreground sm:gap-5",
    // A soft watermark quote glyph; muted gray, decorative. Outline weight per the DS rule.
    mark: "shrink-0 text-muted-foreground/30 [&>svg]:size-8",
    // The quote is the content of the card: it always reads at medium (500) weight so social
    // proof feels deliberate, not passing body copy.
    //
    // A quote FOLLOWED by a `TestimonialBody` is a headline instead ("The UI kit looks fantastic!"
    // over the longer quote), so it adapts itself to that neighbour: full-strength ink, semibold,
    // snug leading. It keys off the sibling (`:has(+ body)`) rather than a prop, so the headline
    // look can never disagree with the markup, and dropping the body reverts it to a pull-quote.
    quote: [
      "text-pretty text-base font-medium leading-relaxed",
      "[&:has(+[data-slot=testimonial-body])]:font-semibold [&:has(+[data-slot=testimonial-body])]:leading-snug [&:has(+[data-slot=testimonial-body])]:text-foreground",
    ],
    // The supporting copy under a headline quote: quieter and a step smaller than the headline.
    body: "text-pretty text-sm leading-relaxed text-body",
    // `mt-auto` pins the byline to the card's bottom edge, so a row of cards settles every
    // byline on one line however long each quote runs. To add breathing room above it, use
    // `pt-*`: `mt-*` is the same class group and tailwind-merge would silently drop the pin.
    // (`mt-0` is the one intended override: it leads the card when the footer comes first.)
    footer: "mt-auto flex items-center gap-3",
    author: "flex min-w-0 flex-col",
    name: "text-sm font-semibold text-foreground",
    // Muted meta. It truncates only at `md` (below), the dense card in a carousel or a tight grid;
    // at the landing steps a role like "Founder of brandingwebsite.com" is read, so it wraps.
    title: "text-sm text-muted-foreground",
    // A company wordmark/logo. Inside the footer it pushes to the trailing edge; anywhere else
    // (leading the card, the logo-led layout) it stays on the start edge, where a bare `ml-auto`
    // in the root's flex column would shove it to the right.
    logo: "shrink-0 text-muted-foreground [[data-slot=testimonial-footer]_&]:ml-auto [&>svg]:h-6 [&>svg]:w-auto",
  },
  variants: {
    variant: {
      // The minimal default: a flat, tinted surface, no border line, no shadow.
      plain: { root: "bg-muted/40 shadow-none [--surface:color-mix(in_oklab,var(--muted)_40%,var(--background))]" },
      // A clean hairline ring at full `--border` strength, nothing else. No fill: fill is
      // elevation (docs/FOUNDATIONS.md), so an in-flow card takes the ground it sits on.
      outline: { root: "shadow-none ring-1 ring-border" },
      // polish: prefer a soft shadow for depth over a hard border: an `--edge` ring (softer than
      // `--border`) plus the xs lift. Still no fill, same rule.
      soft: { root: "shadow-xs ring-1 ring-edge" },
      // Borderless and lifted, to feature one quote. The one that floats, so the one that fills.
      elevated: { root: "bg-card shadow-lg [--surface:var(--card)]" },
      // No surface at all, but keeps its padding: for walls on a tinted section.
      ghost: { root: "bg-transparent shadow-none" },
      // Container-less: no surface, no padding, no radius. The quote sits flush on the page.
      bare: { root: "rounded-none bg-transparent p-0 shadow-none" },
    },
    // Center the quote, byline, and mark: for a single, standout pull-quote.
    align: {
      start: {},
      center: {
        root: "items-center text-center",
        footer: "justify-center",
        author: "items-center",
        mark: "[&>svg]:mx-auto",
      },
    },
    // A hairline rule above the author row (Vercel-style), separating quote from byline.
    divided: {
      true: { footer: "border-t border-border pt-4 sm:pt-5" },
    },
    // The type scale. `md` is the compact card that fits a dense grid or a carousel slide. The
    // bigger steps are the marketing scale a landing page sets quotes at, where each testimonial
    // is read on its own rather than scanned in a wall of cards:
    //   - `lg`: an 18px headline over 16px body and name (logo-led rows, the masonry wall).
    //   - `xl`: a 24px headline over 18px body, for ONE quote given room beside a picture.
    // The role under the name stays 14px at every step: it is a secondary line, like a caption, and
    // growing it with the quote made the byline read as a second headline.
    // They exist because the step is not one class: the headline, the body, the byline and the
    // rhythm between them move together, and a className per part would drift between sections.
    // Pair `lg`/`xl` with an `lg` Avatar so the portrait matches the two-line byline; the 48px
    // portrait takes a 16px step to the byline (12px at `md` sat it against the name).
    size: {
      md: { title: "truncate" },
      lg: {
        root: "gap-5 sm:gap-6",
        quote: "text-lg",
        body: "text-base",
        footer: "gap-4",
        name: "text-base",
        title: "text-sm",
      },
      xl: {
        root: "gap-6 sm:gap-8",
        quote: "text-2xl",
        body: "text-lg",
        footer: "gap-4",
        name: "text-base",
        title: "text-sm",
      },
    },
  },
  defaultVariants: {
    variant: "plain",
    align: "start",
    size: "md",
  },
})

type TestimonialSlots = ReturnType<typeof testimonialVariants>
const [TestimonialProvider, useTestimonialContext] =
  createContext<{ slots: TestimonialSlots }>("Testimonial")

export interface TestimonialProps
  extends React.ComponentProps<"figure">,
    VariantProps<typeof testimonialVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `Testimonial.Quote` dot-notation): namespaced
 * statics don't survive the RSC server→client boundary. Compose as
 * `<Testimonial><TestimonialQuote>…`. For the stars, drop our `Rating` (readOnly) in.
 */
export function Testimonial({
  className,
  variant,
  align,
  divided,
  size,
  asChild = false,
  ...props
}: TestimonialProps) {
  const slots = testimonialVariants({ variant, align, divided, size })
  const Comp = asChild ? Slot.Root : "figure"
  return (
    <TestimonialProvider slots={slots}>
      <Comp data-slot="testimonial" className={slots.root({ className })} {...props} />
    </TestimonialProvider>
  )
}

/** Optional decorative quotation mark, sits above the quote. */
export function TestimonialMark({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTestimonialContext("TestimonialMark")
  return (
    <div data-slot="testimonial-mark" aria-hidden className={slots.mark({ className })} {...props}>
      <Quotes weight="bold" />
    </div>
  )
}

export function TestimonialQuote({ className, ...props }: React.ComponentProps<"blockquote">) {
  const { slots } = useTestimonialContext("TestimonialQuote")
  return (
    <blockquote data-slot="testimonial-quote" className={slots.quote({ className })} {...props} />
  )
}

/**
 * The longer quote under a headline. Placing it right after `TestimonialQuote` turns that quote
 * into the card's headline (semibold, full-strength ink); drop it and the quote reads as a plain
 * pull-quote again.
 */
export function TestimonialBody({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useTestimonialContext("TestimonialBody")
  return <p data-slot="testimonial-body" className={slots.body({ className })} {...props} />
}

/** The author row: drop an `Avatar` beside a `TestimonialAuthor`. */
export function TestimonialFooter({ className, ...props }: React.ComponentProps<"figcaption">) {
  const { slots } = useTestimonialContext("TestimonialFooter")
  return (
    <figcaption data-slot="testimonial-footer" className={slots.footer({ className })} {...props} />
  )
}

/** Name + title stack. */
export function TestimonialAuthor({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTestimonialContext("TestimonialAuthor")
  return <div data-slot="testimonial-author" className={slots.author({ className })} {...props} />
}

export function TestimonialName({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTestimonialContext("TestimonialName")
  return <div data-slot="testimonial-name" className={slots.name({ className })} {...props} />
}

export function TestimonialTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTestimonialContext("TestimonialTitle")
  return <div data-slot="testimonial-title" className={slots.title({ className })} {...props} />
}

/**
 * Optional trailing slot in the footer for a company wordmark or logo: sits flush to the
 * right edge (Vercel/Clay "from <company>" treatment). Pass an SVG logo or styled text.
 */
export function TestimonialLogo({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTestimonialContext("TestimonialLogo")
  return <div data-slot="testimonial-logo" className={slots.logo({ className })} {...props} />
}
