import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Contact sections" }

const VARIANTS = [
  "contact-section-1",
  "contact-section-2",
  "contact-section-3",
  "contact-section-4",
] as const

export default function ContactSectionsPage() {
  return (
    <>
      <DocHeader
        title="Contact"
        description="Contact and lead-capture sections that pair a marketing message with a way to reach you. Variant 1 is the split lead capture, with a floating LeadForm card over an interior photo that bleeds along the bottom; Variant 2 the classic split, with a channel list (email, call, visit) beside a ContactForm card; Variant 3 a centered lede over a trust row and a single ContactForm card; Variant 4 a department directory of whole-card mailto links that routes each message to the right team."
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
          Every variant leads with the{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">SectionHeader</a>{" "}
          lede and composes a block from the{" "}
          <a href="/docs/components/contact-form" className="underline underline-offset-4">ContactForm</a>{" "}
          family. Variant 1 floats the <code className="font-mono text-sm">LeadForm</code> as a{" "}
          <code className="font-mono text-sm">card</code> over a bleeding{" "}
          <a href="/docs/components/hero" className="underline underline-offset-4">Hero</a> photo;
          Variants 2 and 3 place the <code className="font-mono text-sm">ContactForm</code> card
          beside a channel list or under a centered lede; and Variant 4 swaps the form for a grid of{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a> tiles
          rendered as <code className="font-mono text-sm">mailto</code> links. Swap the copy, channels,
          and form for your own.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every variant folds cleanly on a narrow frame: the splits (1, 2) stack to a single column,
          the centered form (3) keeps its lede and card intact, and the directory grid (4) steps from
          three columns to two to one. The forms&apos; own name and email rows collapse to one column
          on narrow frames. Step any preview through Mobile, Tablet, and Desktop to confirm the rhythm
          holds and nothing overflows.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Which variant should I use?",
              a: "Variant 2 (the split with a channel list) is the safe default for a standalone contact page. Variant 3 (centered) is the leanest drop-in when you just need a form under a heading. Variant 1 (the photo split) suits a warmer, lifestyle brand. Variant 4 (the directory) fits when different messages should reach different teams, so people route themselves instead of filling one catch-all form.",
            },
            {
              q: "Can I use a different contact form in these layouts?",
              a: "Yes. Variant 1 composes LeadForm and Variants 2 and 3 compose ContactForm, but the ContactForm family shares one recipe, so you can drop in ContactForm (general get-in-touch), LeadForm (sales lead capture), or SupportForm (help-desk request) in the same slot with no other changes. Pass variant=\"bare\" instead if you want the form to fill the column with no card chrome.",
            },
            {
              q: "Do the directory cards in Variant 4 need JavaScript?",
              a: "No. Each card is the canonical Card rendered asChild as a plain mailto anchor, so the whole tile is one link and one 40px+ hit target with no client state. Swap the department addresses for your own inboxes, or point the hrefs at routes instead of mailto if you'd rather link to per-team pages.",
            },
            {
              q: "Does the slab re-theme and re-accent correctly?",
              a: "Yes. Every surface is token-driven: the band background, the form card, and the eyebrow all read from semantic color roles, so the section reads correctly in light, dark, and moonlight and re-tints with the active accent. Switch the site theme from the top-right of the docs to check.",
            },
            {
              q: "How do I wire the form up to my backend?",
              a: "Pass an onSubmit handler to the LeadForm; it receives the typed LeadFormData object ({ firstName, linkedin, email, companySize, phone, message }). Return a promise and the submit button drives its loading spinner until it resolves, then the form swaps to the success panel.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
