import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/landing/section"
import { ShowcaseGallery } from "@/components/landing/showcase-gallery"
import { Reveal } from "@/components/landing/reveal"

/** "89 components ready to use" - a gallery of real, interactive components to try inline. */
export function ComponentShowcase() {
  return (
    <Section id="components">
      <SectionHeading
        eyebrow="Components"
        title="89 components, ready to use"
        description="These are live, not screenshots. Toggle, drag, and open them right here, then drop the same source into your project."
      />

      <Reveal>
        <ShowcaseGallery />
      </Reveal>

      <div className="flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/docs">
            See all components
            <ArrowRight weight="bold" />
          </Link>
        </Button>
      </div>
    </Section>
  )
}
