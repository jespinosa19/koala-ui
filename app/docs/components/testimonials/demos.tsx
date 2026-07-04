"use client"

import {
  Testimonial,
  TestimonialMark,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
  TestimonialLogo,
} from "@/components/ui/testimonials"
import { Rating } from "@/components/ui/rating"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PLACEHOLDER_BRANDS, PlaceholderLogo } from "@/components/docs/placeholder-logos"

const ITEMS = [
  {
    quote:
      "We replaced our half-finished in-house kit in a weekend. Everything felt consistent, down to the focus rings.",
    name: "Alex Rivera",
    title: "Founder, Lumen",
    initials: "AR",
    img: 13,
    logo: "Lumen",
  },
  {
    quote:
      "Owning the source is the killer feature. We copy a component in, tweak the recipe, and it still matches.",
    name: "Priya Nair",
    title: "Staff Engineer, Cobalt",
    initials: "PN",
    img: 45,
    logo: "Cobalt",
  },
  {
    quote:
      "It looks finished out of the box. The polish on hover and press states is what sold our designers.",
    name: "Daniel Okafor",
    title: "Co-founder, Quanta",
    initials: "DO",
    img: 59,
    logo: "Quanta",
  },
]

// Default byline: a real headshot (our Avatar with an image), falling back to initials while it
// loads or if it 404s. Images are the default treatment for testimonial authors.
function Author({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <>
      <AvatarRoot size="md">
        <AvatarImage src={`https://i.pravatar.cc/160?img=${item.img}`} alt={item.name} />
        <AvatarFallback>{item.initials}</AvatarFallback>
      </AvatarRoot>
      <TestimonialAuthor>
        <TestimonialName>{item.name}</TestimonialName>
        <TestimonialTitle>{item.title}</TestimonialTitle>
      </TestimonialAuthor>
    </>
  )
}

/* ── Hero: minimal flat grid (default `plain` variant, no chrome) ───────────── */
export function TestimonialsDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <Testimonial key={item.name}>
          <TestimonialQuote>{item.quote}</TestimonialQuote>
          <TestimonialFooter>
            <Author item={item} />
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Variants: every surface, side by side ─────────────────────────────────── */
export function TestimonialVariantsDemo() {
  // All six surfaces the recipe ships. ghost/bare are transparent by design (meant for
  // tinted sections / flush-on-page), so the footer label is what identifies them here.
  const variants = ["plain", "outline", "soft", "elevated", "ghost", "bare"] as const
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {variants.map((variant, i) => {
        const item = ITEMS[i % ITEMS.length]
        return (
          <Testimonial key={variant} variant={variant}>
            <TestimonialQuote>{item.quote}</TestimonialQuote>
            <TestimonialFooter>
              <Author item={item} />
              <TestimonialLogo className="font-mono text-xs uppercase tracking-wide">
                {variant}
              </TestimonialLogo>
            </TestimonialFooter>
          </Testimonial>
        )
      })}
    </div>
  )
}

/* ── With a rating (stars from our Rating, readOnly) ───────────────────────── */
export function TestimonialRatingDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <Testimonial key={item.name} variant="outline">
          <Rating readOnly value={5} size="sm" />
          <TestimonialQuote>{item.quote}</TestimonialQuote>
          <TestimonialFooter>
            <Author item={item} />
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Author on top (Clay-style: byline leads the quote) ────────────────────── */
export function TestimonialAuthorTopDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <Testimonial key={item.name}>
          <TestimonialFooter className="mt-0">
            <Author item={item} />
          </TestimonialFooter>
          <TestimonialQuote className="text-sm">{item.quote}</TestimonialQuote>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Divided, with company logo (Vercel-style hairline rule) ───────────────── */
export function TestimonialDividedDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {ITEMS.slice(0, 2).map((item) => (
        <Testimonial key={item.name} variant="outline" divided>
          <TestimonialQuote>{item.quote}</TestimonialQuote>
          <TestimonialFooter>
            <Author item={item} />
            <TestimonialLogo className="text-sm font-semibold tracking-tight text-foreground/70">
              {item.title.split(", ")[1]}
            </TestimonialLogo>
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Logo-led (company wordmark on top, bold headline, body, byline) ────────── */
export function TestimonialLogoLeadDemo() {
  return (
    <div className="grid w-full gap-x-10 gap-y-10 sm:grid-cols-3">
      {ITEMS.map((item) => (
        <Testimonial key={item.name} variant="bare" className="gap-3">
          {/* Reset the logo's footer defaults (ml-auto/muted) so the colored logo leads the card. */}
          <TestimonialLogo className="ml-0">
            <PlaceholderLogo
              brand={PLACEHOLDER_BRANDS.find((b) => b.name === item.logo) ?? PLACEHOLDER_BRANDS[0]}
              variant="lockup"
            />
          </TestimonialLogo>
          <TestimonialQuote className="font-semibold text-foreground">
            {item.quote}
          </TestimonialQuote>
          <TestimonialFooter className="mt-4">
            <Author item={item} />
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Container-less wall (Plain-style: no card, just whitespace) ────────────── */
export function TestimonialBareDemo() {
  return (
    <div className="grid w-full gap-x-10 gap-y-10 sm:grid-cols-2">
      {ITEMS.map((item) => (
        <Testimonial key={item.name} variant="bare">
          <TestimonialQuote className="text-sm">{item.quote}</TestimonialQuote>
          <TestimonialFooter>
            <Author item={item} />
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/* ── Centered pull-quote (Notion/Steep-style: no container, no chrome) ──────── */
export function TestimonialCenteredDemo() {
  return (
    <Testimonial variant="bare" align="center" className="mx-auto max-w-xl gap-6">
      <TestimonialMark />
      <TestimonialQuote className="text-xl leading-snug text-balance sm:text-2xl">
        We replaced our half-finished in-house kit in a weekend. Everything felt consistent,
        down to the focus rings.
      </TestimonialQuote>
      <TestimonialFooter>
        <AvatarRoot size="md">
          <AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" />
          <AvatarFallback>AR</AvatarFallback>
        </AvatarRoot>
        <TestimonialAuthor>
          <TestimonialName>Alex Rivera</TestimonialName>
          <TestimonialTitle>Founder, Lumen</TestimonialTitle>
        </TestimonialAuthor>
      </TestimonialFooter>
    </Testimonial>
  )
}

/* ── Featured single (elevated + quote mark) ───────────────────────────────── */
export function TestimonialSingleDemo() {
  return (
    <Testimonial variant="elevated" className="max-w-md">
      <TestimonialMark />
      <TestimonialQuote className="text-lg">
        Radix under the hood means I stopped worrying about keyboard and screen-reader bugs.
        They are just handled.
      </TestimonialQuote>
      <TestimonialFooter>
        <AvatarRoot size="md">
          <AvatarImage src="https://i.pravatar.cc/160?img=32" alt="Mei Lin" />
          <AvatarFallback>ML</AvatarFallback>
        </AvatarRoot>
        <TestimonialAuthor>
          <TestimonialName>Mei Lin</TestimonialName>
          <TestimonialTitle>Frontend Lead, Cadence</TestimonialTitle>
        </TestimonialAuthor>
      </TestimonialFooter>
    </Testimonial>
  )
}
