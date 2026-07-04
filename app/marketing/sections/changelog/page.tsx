import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Changelog sections" }

const VARIANTS = [
  "changelog-section-1",
  "changelog-section-2",
  "changelog-section-3",
  "changelog-section-4",
  "changelog-section-5",
] as const

export default function ChangelogSectionsPage() {
  return (
    <>
      <DocHeader
        title="Changelog"
        description="The recent release log, in five layouts. Variant 1 is the simple timeline of version cards; Variant 2 a vertical ActivityFeed rail; Variant 3 a row of media cards (the Linear pattern); Variant 4 a minimal editorial two-column list (the Notion / Plain pattern); Variant 5 a bare date-led notes list (the Basecamp / Attio pattern)."
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
          Every variant is a light composition over the surface tokens, led by the same shared release
          data. All five use a pill{" "}
          <a href="/docs/components/badge" className="underline underline-offset-4">Badge</a> and a
          tabular date; Variant 2 threads the entries on the canonical{" "}
          <a href="/docs/components/activity-feed" className="underline underline-offset-4">ActivityFeed</a>{" "}
          rail, Variant 3 lays them out as hover-lifting media cards, Variant 4 pairs a sticky{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">SectionHeader</a>{" "}
          lede with a hairline-divided list, and Variant 5 strips it back to a bare date-pill notes list.
          Trailing CTAs use a{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">Button</a>.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each layout folds cleanly on a narrow frame: the card and list variants (1, 2, 4) lay the
          version and date beside the note on desktop and stack them on mobile; the media grid (3) steps
          from four columns to two to one; the editorial rail (4) drops from two columns to one; and the
          notes list (5) is single-column at every width. Dates use{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the column stays aligned. Resize the
          preview to watch the rows recompose.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Is the changelog a single component?",
              a: "No, each variant is a small composition fed by one shared release list: a pill Badge, a tabular date, a category tag, and a short note per entry. Variant 2 reuses the canonical ActivityFeed for its rail; the rest are light surface-token layouts. Copy the slab you like and feed it your own release notes.",
            },
            {
              q: "How do the five variants differ?",
              a: "Variant 1 is the simple stacked timeline of version cards. Variant 2 is a vertical ActivityFeed rail that threads every release on one continuous line. Variant 3 is a row of media cards with a tinted cover per release (the Linear pattern). Variant 4 is a minimal editorial two-column list with a sticky lede beside hairline-divided rows (the Notion / Plain pattern). Variant 5 strips it all the way back to a single-column notes list, each entry led by its date on an outline pill (the Basecamp / Attio pattern). Pick the density the page calls for.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right of the docs to check the cards, rails, and category tags in light, dark, cream, or moonlight, across all eight accents.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
