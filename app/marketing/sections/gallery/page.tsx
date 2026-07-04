import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Gallery sections" }

const VARIANTS = [
  "gallery-section-1",
  "gallery-section-2",
  "gallery-section-3",
  "gallery-section-4",
  "gallery-section-5",
  "gallery-section-6",
] as const

export default function GallerySectionsPage() {
  return (
    <>
      <DocHeader
        title="Gallery"
        description="Marketing image walls built on the Gallery and Lightbox components: a tabbed fake-masonry of framed previews, a two-direction marquee that drifts past and pauses on hover, a floating ring of frames that orbits a centered lede as you scroll, an interactive story where a canvas cross-fades as you click through numbered chapters, or an expanding spotlight rail where one panel opens wide while the rest tuck into minimal slivers. Every tile opens a full-screen lightbox."
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
        <Installation component="gallery" />
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The tab rail scrolls sideways as a single row (with a soft edge fade) rather than wrapping,
          and the fake-masonry wall reflows its columns as the frame narrows, dropping to a single
          stack on mobile. The marquee variant keeps its drift at any width and
          fades its frames into the band at both edges. The floating ring scales its ellipse with the
          stage and thins its inner frames on narrow widths so the centered lede always keeps its
          breathing room. The story variant lays its canvas and chapters side by side from{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">lg</code> up, vertically centred as
          one block, and stacks them into a single column below it, the canvas leading on top. The
          spotlight rail keeps its panels in a row at any width, the open one taking the lion&apos;s
          share while the slivers hold a minimum tappable width so the rail never crushes; the captions
          scale down on narrow frames. Each tile opens a full-screen lightbox; resize the preview to
          see the layouts adapt.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between this and the Gallery component?",
              a: "The component (in /docs/components/gallery) is the installable engine. This section is a finished concepts wall built from it: a heading, a tab rail, and a lightbox-backed masonry, ready to showcase work on a landing page.",
            },
            {
              q: "Can I preview it in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right of the docs and the framed tiles and headings re-theme into light, dark, or moonlight along with everything else.",
            },
            {
              q: "How does the scroll rotation on the floating ring work?",
              a: "It is a pure-CSS scroll-driven animation (an animation-timeline tied to the section's journey through the viewport), the same family as the scroll-fade utility, so there is no JavaScript or scroll listener. The ring passes through a neutral angle while the section is centered and tilts a little as it enters and leaves. It respects prefers-reduced-motion (the ring holds still), and browsers without scroll-driven animations simply show the ring at its resting angle. The embedded preview frame is sized to the slab's height so it does not scroll internally; scroll the docs page, or open the preview in a new tab on a short viewport, to watch the ring turn.",
            },
            {
              q: "How does the story variant switch chapters?",
              a: "It is click-driven: every chapter is a button, so clicking a title sets it active, brightens it, reveals its description, and slides its canvas to the front on the left. There is no scroll dependency, so it behaves the same everywhere, including inside the embedded preview frame, which is sized to the slab's height and does not scroll internally, and it opens deterministically on the first chapter rather than guessing one from scroll position. Only one canvas shows at rest, never a stacked pile; the motion (a pure vertical slide) plays only while changing: the chosen image slides up from below over the current one, which peeks at the top until covered, settling back to a single image. The animation is identical whichever chapter you pick: every card rests in the same waiting pose (parked off the bottom edge) and the incoming always slides up from there. The card you leave is parked at the front for the slide so the incoming covers it, then released back to the waiting pose once the slide ends, so direction never changes the motion. It respects prefers-reduced-motion (the canvas swaps with no transition). The front card opens the shared full-screen lightbox.",
            },
            {
              q: "How does the spotlight rail expand and collapse?",
              a: "It is click-driven too (the standing rule for accordion-style reveals: open on click or keyboard, never hover). It opens on a middle panel so the rail reads balanced at rest, with slivers on both sides. The width change is a real layout animation, not a transform: each panel's flex-grow tweens between a wide weight when open and a narrow one when collapsed, so the slivers genuinely shrink to a minimal strip rather than scaling. Every panel is one stable button whose data-state flips between active and collapsed, which keeps that tween smooth with no remount. A collapsed sliver shows just a sequence number and a + to expand; clicking it brings it forward and slides its caption in. Clicking the panel that is already open opens it in the shared full-screen lightbox. It respects prefers-reduced-motion (the rail snaps between widths with no tween), and the slivers keep a minimum tappable width so they stay a real hit target.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
