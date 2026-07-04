import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Feature sections" }

const VARIANTS = [
  "feature-section-1",
  "feature-section-2",
  "feature-section-3",
  "feature-section-4",
  "feature-section-5",
  "feature-section-6",
] as const

export default function FeatureSectionsPage() {
  return (
    <>
      <DocHeader
        title="Feature"
        description="Sections that show what the product does. Variant 1 is a wall of live, interactive component tiles; Variant 2 is a product video showcase; Variant 3 is an asymmetric bento grid; Variant 4 is a balanced grid of feature cards; Variant 5 is a two-up wall of image-led ecosystem tiles; Variant 6 is a left-aligned lede over a flush row of stroke-led capability columns."
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
          Compositions, not a single engine: Variant 2 plays through the{" "}
          <a href="/docs/components/video-player" className="underline underline-offset-4">Video Player</a>,
          Variant 3 on{" "}
          <a href="/docs/components/bento" className="underline underline-offset-4">Bento</a>, Variant 4
          on{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a>, Variant 5
          is a wall of image-led tiles led by a left-aligned{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">Section Header</a>,
          Variant 6 hangs bare capability columns off nothing but a hairline stroke each led by the
          same{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">Section Header</a>,
          and Variant 1 stitches together live controls (Switch, Slider, Tabs, Select, and more).
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each preview renders inside an iframe, so the grids and the video frame respond to the{" "}
          <strong>frame</strong> width. Drag the handle or pick a breakpoint on any variant to watch
          the columns collapse, and switch the per-frame theme to check each surface.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Are the component tiles in Variant 1 real?",
              a: "Yes, every tile is a live, interactive control you can toggle, drag, and open right in the preview, each linking to its docs entry. Drop the same source into your project with the CLI.",
            },
            {
              q: "Can I preview them in another theme?",
              a: "Yes. The previews follow the site theme, so switch it from the top-right of the docs to confirm every variant reads in light, dark, and moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
