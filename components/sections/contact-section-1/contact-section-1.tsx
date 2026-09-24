import { Hero, HeroColumn, HeroTitle, HeroSubtitle, HeroActions } from "@/components/ui/hero"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LeadForm } from "@/components/ui/contact-form"

/**
 * contact-section-1: split lead capture.
 *
 * A copy column (eyebrow, headline, subtitle and a CTA pair) sits on the band, a photo runs edge to
 * edge along the bottom, and a lead form card floats over the seam so it bridges the two. The copy
 * and the card keep the site gutter while the photo bleeds past it, the same idiom as a full-bleed
 * split hero.
 *
 * The Hero is its own full-bleed band, so drop it straight onto the page with no Section wrapper.
 * Below the lg breakpoint it folds to one stacked column: copy, then the card, then the photo, which
 * holds its own aspect ratio so it never thins into a sliver on a wide tablet.
 */

// A warm interior shot off the Unsplash CDN, so the section renders the moment it lands in your
// project. Swap the src for your own photo.
const IMAGE = "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop"

export function ContactSection1() {
  return (
    // Everything is in normal flow (only the photo's cover img is absolutely positioned), so the
    // band's height is its content. The card overlaps the photo through the photo's negative margin.
    <Hero layout="split">
      {/* Copy and card, side by side on lg, held to the canonical gutter (max-w-7xl with px-6 sm:px-8,
          matching SectionContainer) so their edges line up with every other section. */}
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* Copy: its natural height keeps the CTA row well above the photo below. */}
          <div className="pt-10 sm:pt-14 lg:pt-16">
            <HeroColumn className="lg:max-w-md">
              <Badge variant="info" dot pill>
                New collection
              </Badge>

              <HeroTitle>Design made to feel like home</HeroTitle>

              <HeroSubtitle className="max-w-md text-base">
                We bring your interior dreams to life with personalized designs that reflect your
                style and personality.
              </HeroSubtitle>

              <HeroActions className="pt-2">
                <Button size="md">Explore projects</Button>
                <Button size="md" variant="outline">
                  Get a quote
                </Button>
              </HeroActions>
            </HeroColumn>
          </div>

          {/* Card: taller than the copy, so it dips over the photo below. relative z-10 lifts it
              above the photo, a later sibling that would otherwise paint on top. On mobile it is
              simply the second block in the stack. */}
          <div className="relative z-10 pb-10 pt-6 sm:pt-8 lg:pb-0 lg:pt-16">
            <LeadForm
              density="comfortable"
              defaultCountry="ES"
              title="Let's Collaborate"
              description="Share your ideas with us, and together we'll create a space that truly reflects you."
              className="mx-auto w-full max-w-lg shadow-xl lg:mr-0 lg:ml-auto lg:w-[28rem] lg:max-w-none"
            />
          </div>
        </div>
      </div>

      {/* Photo: a full-bleed band across the whole width. On lg a negative top margin slides it up
          so its top sits just under the CTA row and it runs behind the card's lower half. Stacked,
          the band is the picture itself, so it holds a ratio (3:2, then 2:1) instead of a fixed
          height. On lg the card overlaps it and the band only needs a floor, so the ratio lets go. */}
      <div className="relative aspect-[3/2] sm:aspect-[2/1] lg:-mt-48 lg:aspect-auto lg:min-h-[22rem]">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
        <img src={IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </Hero>
  )
}
