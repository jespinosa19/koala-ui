import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Blog sections" }

const VARIANTS = [
  "blog-section-1",
  "blog-section-2",
  "blog-section-3",
  "blog-section-4",
  "blog-section-5",
] as const

export default function BlogSectionsPage() {
  return (
    <>
      <DocHeader
        title="Blog"
        description="Editorial indexes for a company blog or resource hub. Five layouts: a filtered featured grid, a minimal text-first list, a lead-plus-latest-rail module, an image-led magazine grid, and a bare date-led archive list. All composed from Badge, Avatar, and ToggleGroup, so they re-theme across all four themes."
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

      <DocSection title="Built from">
        <p className="mt-4 text-pretty text-muted-foreground">
          A composition over the surface tokens: a{" "}
          <a href="/docs/components/toggle-group" className="underline underline-offset-4">
            ToggleGroup
          </a>{" "}
          for the category filter, a soft{" "}
          <a href="/docs/components/badge" className="underline underline-offset-4">
            Badge
          </a>{" "}
          per topic (one hue each), and an{" "}
          <a href="/docs/components/avatar" className="underline underline-offset-4">
            Avatar
          </a>{" "}
          for the author byline. The cover images carry a hairline inset ring so they never float
          against a light surface.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The featured story lays image beside copy on desktop and stacks on mobile; the grid steps
          from three columns to two to one as the frame narrows. Dates and reading times use{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the meta rows stay aligned.
          Resize the preview to watch the cards recompose.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Is the blog index a single component?",
              a: "No, it is a composition: a ToggleGroup filter, a featured story, and a grid of article cards built from Badge and Avatar. Copy the slab and feed it your own posts.",
            },
            {
              q: "How does the category filter behave?",
              a: "It is a single-select ToggleGroup. Picking a topic filters the grid to that category and hides the featured lead; the All view restores the featured story. Deselecting always falls back to All so a story is on screen.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right of the docs to check the category tints, cards, and cover rings in light, dark, or moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
