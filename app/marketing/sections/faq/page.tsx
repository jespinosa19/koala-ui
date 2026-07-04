import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "FAQ sections" }

const VARIANTS = ["faq-section-1", "faq-section-2"] as const

export default function FaqSectionsPage() {
  return (
    <>
      <DocHeader
        title="FAQ"
        description="The product's common questions as a finished section. Variant 1 is a single-open, separated accordion that caps its width so questions stay easy to scan. Variant 2 splits the same questions into topic groups (the help-center look), each a borderless minimal list with single-expand scoped per topic."
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
        <Installation component="accordion" />
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The accordion caps its width so the questions stay easy to scan, and only one panel opens
          at a time. Resize the preview to confirm the rhythm holds from mobile to desktop.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between this and the Accordion component?",
              a: "The component (in /docs/components/accordion) is the installable engine. This section is a finished FAQ built from it: a single-open, separated accordion of the product's common questions.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right of the docs to check the panels and dividers in light, dark, or moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
