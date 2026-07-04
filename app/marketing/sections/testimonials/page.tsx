import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Testimonials sections" }

const VARIANTS = [
  "testimonials-section-1",
  "testimonials-section-2",
  "testimonials-section-3",
] as const

export default function TestimonialsSectionsPage() {
  return (
    <>
      <DocHeader
        title="Testimonials"
        description="Finished testimonial sections: a minimal author-led row (byline on top, then headline and body), a logo-led row (company logo on top, headline, body, and author byline), and a spotlight carousel that features one quote at a time with a portrait beside it. The grids collapse from three columns to one; the carousel swipes."
      />

      <div className="flex flex-col gap-8">
        {VARIANTS.map((slug, i) => {
          const section = SECTIONS[slug]
          return (
            <PreviewFrame
              key={slug}
              id={slug}
              slug={slug}
              label={`Variant ${i + 1}`}
              code={section.code}
              locked={section.locked}
            />
          )
        })}
      </div>

      <DocSection title="Installation">
        <Installation component="testimonials" />
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The quote cards lay out three across on desktop, two at{" "}
          <code className="font-mono text-sm">sm</code>, and a single column on mobile. Resize the
          preview to watch the wall reflow and the cards keep their balanced spacing.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between this and the Testimonials component?",
              a: "The component (in /docs/components/testimonials) is the installable engine. This section is a finished social-proof wall built from it: a responsive grid of quote cards with author rows, ready to drop between a hero and a CTA.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right of the docs to confirm the cards and avatars read in light, dark, and moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
