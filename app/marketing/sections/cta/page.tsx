import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "CTA sections" }

const VARIANTS = [
  "cta-section-1",
  "cta-section-2",
  "cta-section-3",
  "cta-section-4",
  "cta-section-5",
  "cta-section-6",
  "cta-section-7",
  "cta-section-8",
] as const

export default function CtaSectionsPage() {
  return (
    <>
      <DocHeader
        title="CTA"
        description="Calls to action, from a quiet mid-page nudge to a bold closing band. Variant 1 is the install and source-ownership story; Variant 2 the brand-lit closing panel; Variant 3 an inline email lead-capture; Variant 4 a saturated split brand band; Variant 5 a device-led product shot; Variant 6 a dramatic dark spotlight; Variant 7 an oversized typographic statement; Variant 8 a contact + FAQ closer with a load-more overlay."
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
          Every variant composes the{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">SectionHeader</a>{" "}
          lede and a{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">Button</a> row.
          Variant 1 adds two stacked{" "}
          <a href="/docs/components/code-snippet" className="underline underline-offset-4">CodeSnippet</a>{" "}
          panels; Variant 3 drops an{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a> beside the
          button for the email capture; Variant 4 lays the lede out with SectionHeader&apos;s split
          orientation on a saturated brand fill; and Variant 5 pairs the copy with the finished device
          renders the heroes ship. Variant 8 lays the shared{" "}
          <a href="/marketing/sections/faq" className="underline underline-offset-4">FAQ</a> list out as
          an icon-led features grid under a contact strip, clipped behind a fade-to-band overlay with a
          load-more button.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every variant folds cleanly on a narrow frame: the two-column layouts (1, 4, 5) stack to a
          single column, the email field and button (3) go full-width and stack before returning to a
          row from sm up, and the centered statements (6, 7) keep their lede and action row intact.
          Variant 8&apos;s features grid folds from three columns to two to one, and the load-more
          overlay stays pinned to the clipped edge at every width. Step any preview through Mobile,
          Tablet, and Desktop to confirm the rhythm holds.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do the variants differ?",
              a: "Variant 1 is the mid-page install story that explains how Koala UI is delivered. Variant 2 is a brand-lit closing panel. Variant 3 is an inline lead-capture with an email field. Variant 4 is a bold, saturated split band. Variant 5 is a device-led product shot. Variant 6 is a dramatic dark spotlight for the boldest closing moment. Variant 7 is an oversized typographic statement with no surface at all. Pick the emphasis the moment calls for, from a quiet mid-page nudge to a page-ending band.",
            },
            {
              q: "Do the colored variants follow the theme?",
              a: "Yes. Variant 4's fill is the accent token, so the whole band recolors with the active accent and white keeps AA contrast on the deep accent in every theme. Variant 2's glow re-tints the same way. Switch the site theme and accent from the top-right of the docs to check.",
            },
            {
              q: "Is the email field in Variant 3 wired up?",
              a: "The preview flips to an inline confirmation on submit so you can feel the interaction, but it does no network call. Point the form's onSubmit at your own signup or newsletter endpoint. The button stays a real Button beside the field, never crammed inside it, so it reads as a genuine CTA.",
            },
            {
              q: "How does the load-more overlay in Variant 8 work?",
              a: "The FAQ grid is clipped to about two rows while collapsed, and a gradient that fades up into the band's own background sits over the cut, so the last row dissolves instead of ending on a hard line. The 'See all questions' button floats on that fade. Clicking it flips one piece of state that drops the clip and reveals the rest in place; the docs frame re-measures and grows to fit. The questions are the same shared FAQ list every FAQ section uses, so they never drift, with one icon mapped per entry.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
