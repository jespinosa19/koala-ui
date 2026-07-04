import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Hero sections" }

// One numbered variant per preview, stacked on the family page (Flowbase-style). Each slug keys
// into the sections registry; the iframe render target reads the same map. Twelve finished hero
// layouts: the centered marketing hero, a product-led spotlight, a product-mockup hero, three
// realistic device heroes (iPad, iPhone, and a multi-device duo), a contained split, a full-bleed
// split, two full-bleed media heroes (video and photo backgrounds), a centered hero over a masonry
// photo collage, and a centered hero over a two-photo row.
const VARIANTS = [
  "hero-section-1",
  "hero-section-3",
  "hero-section-8",
  "hero-section-10",
  "hero-section-11",
  "hero-section-12",
  "hero-section-4",
  "hero-section-9",
  "hero-section-6",
  "hero-section-7",
  "hero-section-13",
  "hero-section-14",
  "hero-section-15",
  "hero-section-16",
] as const

export default function HeroSectionsPage() {
  return (
    <>
      <DocHeader
        title="Hero"
        description="The opening section of a landing page. Twelve finished layouts: the centered marketing hero, a product-led spotlight, a product-mockup hero, three realistic device heroes (iPad, iPhone, and a multi-device duo), a contained split, a full-bleed split, two full-bleed media heroes with a video or photo background, a centered hero over a masonry photo collage, and a centered hero over a two-photo row."
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
              minHeight={section.minHeight}
            />
          )
        })}
      </div>

      <DocSection title="Built from">
        <p className="mt-4 text-pretty text-muted-foreground">
          All twelve variants are built on the{" "}
          <a href="/docs/components/hero" className="underline underline-offset-4">Hero</a> component:
          one <code>layout</code> prop swaps the composition between a centered column, a two-column{" "}
          <code>split</code>, and a full-bleed <code>background</code>, with{" "}
          <code>HeroHighlight</code> marking a keyword and <code>HeroMedia</code> holding the
          visual. Variants 3 through 6 fill <code>HeroMedia</code> with a product shot: Variant 3
          hand-frames a browser mockup (window dots and an address bar) around a screenshot, while
          Variants 4, 5, and 6 drop finished device renders (iPad and iPhone PNGs from{" "}
          <code>/public/devices</code>, each with its bezel and shadow baked in) that float on the
          band with no wrapper. Variant 8 takes the <code>split</code> parts into a full-viewport
          slab (100svw &times; 100svh): a bottom-left-anchored copy column beside a photo that bleeds
          to the section&apos;s own edges. Variants 9 and 10 set{" "}
          <code>layout=&quot;background&quot;</code>: a <code>HeroBackground</code> covers the band
          with a video or a photo under a legibility scrim and the copy flips to white. Variant 11
          returns to the centered column and fills <code>HeroMedia</code> with a masonry collage of
          four room photos: a fixed-height grid where the two side images span both rows while the
          middle column stacks a pair, folding to a 2&times;2 below the <code>sm</code> breakpoint.
          Variant 12 keeps the centered column but pares the wall down to two large photos, a wider
          near-square frame beside a taller portrait one on a <code>1.7fr</code>&nbsp;:&nbsp;
          <code>1fr</code> grid, stacking below <code>sm</code>. All are finished, copy-pasteable
          slabs ready to open a marketing page.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each preview renders inside an iframe, so the slab&apos;s own breakpoints respond to the{" "}
          <strong>frame</strong> width. Drag the handle or pick Mobile, Tablet, or Desktop on any
          variant to watch it recompose, and switch the per-frame theme to check it in dark or
          moonlight.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do the variants differ?",
              a: "Variants 1 to 3 are centered columns: 1 is the classic hero; 2 a product-led spotlight whose highlighted keyword rotates through phrases in a wash that hugs each word; 3 anchors a hand-framed browser mockup below the copy. Variants 4 to 6 lead with realistic device renders: 4 centers a copy column over a full iPad in landscape; 5 is a split with an iPhone beside the copy; 6 is a split showing a device duo, an iPad with an iPhone overlapping its corner. Variants 7 and 8 are two-column splits with a photo: 7 is a rounded image card beside the copy; 8 is a full-viewport (100svw x 100svh) split where a photo bleeds to the section's edges beside a bottom-left-anchored copy column with an announcement-pill link. Variants 9 and 10 are full-bleed media heroes: 9 runs an ambient video behind centered white copy, and 10 does the same over a single photo, closed by a monochrome trusted-by row. Variant 11 is a centered hero over a masonry photo collage: the classic centered copy stack above a fixed-height wall of four room photos, two tall side images framing a stacked pair, which folds to a 2x2 grid on mobile. Variant 12 is the same centered copy over a two-photo row: a wider near-square frame beside a taller portrait one on a fixed-height grid, stacking to two rows on mobile.",
            },
            {
              q: "Why is the code locked?",
              a: "Hero is a flagship Pro family. The live previews stay fully interactive so you can size and theme them, while the full source ships with a Koala UI Pro license.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
