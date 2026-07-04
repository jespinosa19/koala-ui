import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Stats sections" }

const VARIANTS = [
  "stats-section-1",
  "stats-section-2",
  "stats-section-3",
  "stats-section-4",
  "stats-section-5",
  "stats-section-6",
  "stats-section-7",
  "stats-section-8",
  "stats-section-9",
  "stats-section-10",
] as const

export default function StatsSectionsPage() {
  return (
    <>
      <DocHeader
        title="Stats"
        description="Proof, counted. Ten ways to turn coverage, adoption, and outcomes into a band of figures, from a bare ruled row to an elevated inverse panel and a mixed grid of numbers and voices. Tabular figures keep every row from reflowing as it updates."
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
        <Installation component="stat" />
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The four metrics sit on one segmented row on desktop and fold to a two-up grid on mobile.
          The figures use <code className="font-mono text-sm">tabular-nums</code> so the band never
          reflows. Resize the preview to watch the columns collapse.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How is this different from the Stat component?",
              a: "The Stat component (in /docs/components/stat) is the installable engine. These sections are finished bands built from it: a StatGroup composed into a ruled row, an inverse panel, or a mixed grid of figures and voices, ready to drop between two larger sections.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. Previews follow the site theme, so switch it from the top-right of the docs to check any band in light, dark, cream, or moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
