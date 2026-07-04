import {
  Storefront,
  ChartLineUp,
  Palette,
  BookOpen,
  Stack,
} from "@phosphor-icons/react/ssr"

import {
  Bento,
  BentoItem,
  BentoItemIcon,
  BentoItemTitle,
  BentoItemDescription,
  BentoItemImage,
} from "@/components/ui/bento"
import { Section, SectionHeading } from "@/components/landing/section"
import { Reveal } from "@/components/landing/reveal"

/**
 * "Deliver fast without sacrificing quality" - the landing-page bento, composed from the
 * Bento design-system component. Each tile pairs a tinted icon and copy with a screenshot
 * that peeks up from the bottom edge. The images are placeholders (public/bento/*.svg) at
 * the right proportions; swap the `src` for real product captures.
 */
export function BentoSection() {
  return (
    <Section id="bento">
      <SectionHeading
        eyebrow="Built to ship"
        title="Deliver fast without sacrificing quality"
        description="Everything you need to go from idea to production in a single afternoon, with the polish your design team would have demanded anyway."
      />

      <Reveal>
        <Bento>
          {/* Top row: two wide tiles. */}
          <BentoItem size="md" tone="brand">
            <BentoItemIcon>
              <Storefront weight="bold" />
            </BentoItemIcon>
            <BentoItemTitle>Store templates</BentoItemTitle>
            <BentoItemDescription>
              Crafted layouts that highlight product benefits, build trust, and drive
              conversion. A wide variety of templates to start from.
            </BentoItemDescription>
            <BentoItemImage src="/bento/store.svg" alt="Storefront template preview" unoptimized />
          </BentoItem>

          <BentoItem size="md" tone="teal">
            <BentoItemIcon>
              <ChartLineUp weight="bold" />
            </BentoItemIcon>
            <BentoItemTitle>High-converting experience</BentoItemTitle>
            <BentoItemDescription>
              Structures meticulously created for maximum conversion and end-to-end completion of
              the purchasing flow.
            </BentoItemDescription>
            <BentoItemImage src="/bento/checkout.svg" alt="Checkout flow preview" unoptimized />
          </BentoItem>

          {/* Bottom row: three tiles. */}
          <BentoItem size="sm" tone="purple">
            <BentoItemIcon>
              <Palette weight="bold" />
            </BentoItemIcon>
            <BentoItemTitle>Maximum personalization</BentoItemTitle>
            <BentoItemDescription>
              Customize the components to your liking so that each project is unique.
            </BentoItemDescription>
            <BentoItemImage
              src="/bento/personalize.svg"
              alt="Theme personalization panel preview"
              unoptimized
            />
          </BentoItem>

          <BentoItem size="sm" tone="orange">
            <BentoItemIcon>
              <BookOpen weight="bold" />
            </BentoItemIcon>
            <BentoItemTitle>Detailed documentation</BentoItemTitle>
            <BentoItemDescription>
              Maintain consistency across projects thanks to our extensive documentation.
            </BentoItemDescription>
            <BentoItemImage
              src="/bento/docs.svg"
              alt="Component documentation preview"
              unoptimized
            />
          </BentoItem>

          <BentoItem size="sm" tone="pink">
            <BentoItemIcon>
              <Stack weight="bold" />
            </BentoItemIcon>
            <BentoItemTitle>All assets in 1 place</BentoItemTitle>
            <BentoItemDescription>
              No more juggling multiple files. Avatars, flags, and every asset stay centralized
              in one place.
            </BentoItemDescription>
            <BentoItemImage src="/bento/assets.svg" alt="Asset library preview" unoptimized />
          </BentoItem>
        </Bento>
      </Reveal>
    </Section>
  )
}
