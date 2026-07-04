import {
  Testimonial,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
  TestimonialLogo,
} from "@/components/ui/testimonials"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Section } from "@/components/landing/section"
import { Reveal } from "@/components/landing/reveal"
import { HERO_TESTIMONIALS } from "@/components/landing/data"
import { PLACEHOLDER_BRANDS, PlaceholderLogo } from "@/components/docs/placeholder-logos"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

/**
 * Logo-led social proof sitting directly under the hero: three container-less testimonials
 * (`bare` variant), each with the colored company logo on top, a bold headline, supporting body,
 * and an author byline. Pure composition of our `Testimonial` parts.
 */
export function HeroTestimonials() {
  return (
    <Section className="pt-0 sm:pt-0">
      <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
        {HERO_TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 75}>
            <Testimonial variant="bare" className="gap-3">
              {/* Colored logo on top: reset the footer's trailing-edge defaults to lead the card. */}
              <TestimonialLogo className="ml-0">
                <PlaceholderLogo
                  brand={PLACEHOLDER_BRANDS.find((b) => b.name === t.brand) ?? PLACEHOLDER_BRANDS[0]}
                  variant="lockup"
                />
              </TestimonialLogo>
              <TestimonialQuote className="font-semibold text-foreground">
                {t.headline}
              </TestimonialQuote>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {t.body}
              </p>
              <TestimonialFooter className="mt-4">
                <AvatarRoot size="md">
                  <AvatarImage src={`https://i.pravatar.cc/160?img=${t.img}`} alt={t.name} />
                  <AvatarFallback>{initials(t.name)}</AvatarFallback>
                </AvatarRoot>
                <TestimonialAuthor>
                  <TestimonialName>{t.name}</TestimonialName>
                  <TestimonialTitle>{t.title}</TestimonialTitle>
                </TestimonialAuthor>
              </TestimonialFooter>
            </Testimonial>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
