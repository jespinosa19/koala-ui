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
    root: "flex h-full flex-col gap-4 rounded-2xl border p-6 text-card-foreground sm:gap-5",
    // A soft watermark quote glyph; muted gray, decorative. Outline weight per the DS rule.
    mark: "text-muted-foreground/30 [&>svg]:size-8",
    // The quote is the content of the card: it always reads at medium (500) weight so social
    // proof feels deliberate, not passing body copy. Override to `font-semibold` for a logo-led
    // headline treatment; the base stays medium everywhere else.
    quote: "text-pretty text-base font-medium leading-relaxed",
    footer: "mt-auto flex items-center gap-3",
    author: "flex min-w-0 flex-col",
    name: "text-sm font-semibold text-foreground",
    title: "truncate text-sm text-muted-foreground",
    // Pushes to the trailing edge of the footer: a company wordmark/logo sits here.
    logo: "ml-auto shrink-0 text-muted-foreground [&>svg]:h-6 [&>svg]:w-auto",
  },
  variants: {
    variant: {
      // The minimal default: a flat, tinted surface, no border line, no shadow.
      plain: { root: "border-transparent bg-muted/40 shadow-none" },
      // A clean hairline border, nothing else.
      outline: { root: "border-border bg-card shadow-none" },
      // polish: prefer a soft shadow for depth over a hard border.
      soft: { root: "border-border/60 bg-card shadow-xs" },
      // Borderless and lifted, to feature one quote.
      elevated: { root: "border-transparent bg-card shadow-lg" },
      // No surface at all, but keeps its padding: for walls on a tinted section.
      ghost: { root: "border-transparent bg-transparent shadow-none" },
      // Container-less: no surface, no padding, no radius. The quote sits flush on the page.
      bare: { root: "rounded-none border-transparent bg-transparent p-0 shadow-none" },
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
  },
  defaultVariants: {
    variant: "plain",
    align: "start",
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
  asChild = false,
  ...props
}: TestimonialProps) {
  const slots = testimonialVariants({ variant, align, divided })
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
