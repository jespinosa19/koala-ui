import { AvatarFallback, AvatarImage, AvatarRoot } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"
import {
  Testimonial,
  TestimonialAuthor,
  TestimonialFooter,
  TestimonialName,
  TestimonialQuote,
  TestimonialTitle,
} from "@/components/ui/testimonials"

/**
 * testimonials-section-1: minimal social proof.
 *
 * Three testimonials with no card around them: the author byline leads each column, then a bold
 * headline over the longer quote. Nothing but whitespace separates the columns, so it sits flush on
 * any band. Stacks to one column on a phone.
 */

const FACE_CROP = "q=80&w=160&h=160&auto=format&fit=crop&crop=faces"

const TESTIMONIALS = [
  {
    name: "Ana Ruiz",
    title: "Head of Product at Halcyon",
    initials: "AR",
    photo: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${FACE_CROP}`,
    headline: "We shipped the redesign a month early.",
    body: "Everything we needed was already there, and it all fit together. The team spent its time on the product instead of rebuilding the basics.",
  },
  {
    name: "Pedro Núñez",
    title: "CTO at Quanta",
    initials: "PN",
    photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${FACE_CROP}`,
    headline: "The fastest onboarding we have ever had.",
    body: "New engineers were productive in their first week. Every part follows the same patterns, so once you learn one you know them all.",
  },
  {
    name: "María López",
    title: "Design Lead at Verde",
    initials: "ML",
    photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${FACE_CROP}`,
    headline: "Our designs and our code finally match.",
    body: "What we design is what ships. Reviews went from pixel-pushing to real product decisions, and the whole team can feel the difference.",
  },
]

export function TestimonialsSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              Testimonials
            </Badge>
            <SectionHeaderHeading>Loved by teams who ship</SectionHeaderHeading>
            <SectionHeaderDescription>
              Thousands of product teams build with us every day. Here is what a few of them have to
              say.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {TESTIMONIALS.map((t) => (
            <Testimonial key={t.name} variant="bare" className="gap-4">
              {/* Author on top: clear the footer's mt-auto so the byline leads instead of trailing. */}
              <TestimonialFooter className="mt-0">
                <AvatarRoot size="md">
                  <AvatarImage src={t.photo} alt={t.name} />
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </AvatarRoot>
                <TestimonialAuthor>
                  <TestimonialName>{t.name}</TestimonialName>
                  <TestimonialTitle>{t.title}</TestimonialTitle>
                </TestimonialAuthor>
              </TestimonialFooter>
              <div className="flex flex-col gap-2">
                <TestimonialQuote className="font-semibold text-foreground">{t.headline}</TestimonialQuote>
                <p className="text-sm leading-relaxed text-pretty text-body">{t.body}</p>
              </div>
            </Testimonial>
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
