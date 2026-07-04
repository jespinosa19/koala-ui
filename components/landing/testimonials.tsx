"use client"

import {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel"
import {
  Testimonial,
  TestimonialMark,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
} from "@/components/ui/testimonials"
import { Rating } from "@/components/ui/rating"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Section, SectionHeading } from "@/components/landing/section"
import { TESTIMONIALS } from "@/components/landing/data"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

/** Testimonials carousel: one quote card per slide, with arrows and indicator dots. */
export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Loved by builders"
        title="If they say it, it might be true"
        description="Teams shipping real products on top of Koala UI."
      />

      <Carousel label="Testimonials" className="mx-auto max-w-3xl">
        <CarouselContent>
          {TESTIMONIALS.map((t) => (
            <CarouselSlide key={t.name} className="px-1">
              <Testimonial variant="elevated" className="h-full">
                <TestimonialMark />
                <Rating readOnly value={5} size="sm" />
                <TestimonialQuote>{t.quote}</TestimonialQuote>
                <TestimonialFooter>
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
            </CarouselSlide>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselIndicators className="mt-6" />
      </Carousel>
    </Section>
  )
}
