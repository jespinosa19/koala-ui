import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { LightboxDemo, LightboxSingleDemo } from "./demos"

export const metadata = { title: "Lightbox" }

export default function LightboxDocsPage() {
  return (
    <>
      <DocHeader
        title="Lightbox"
        description="A full-screen, browsable image viewer over Radix Dialog. Give it the image list once and any LightboxTrigger opens the viewer at its index. It opens with a clean fade and soft zoom, and you can page between images with arrow buttons, ←/→ keys, and a thumbnail rail. Pairs with Gallery for the hover-pill tiles."
      />

      <ComponentPreview
        code={`<Lightbox images={images}>
  <div className="grid grid-cols-3 gap-3">
    {images.map((image, i) => (
      <LightboxTrigger key={image.src} index={i} className="aspect-[4/3] rounded-xl border">
        <img src={image.src} alt={image.alt} className="size-full object-cover" />
      </LightboxTrigger>
    ))}
  </div>
</Lightbox>`}
      >
        <LightboxDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="lightbox" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          className="mt-4"
          code={`import { Lightbox, LightboxTrigger, type LightboxImage } from "@/components/ui/lightbox"

const images: LightboxImage[] = [
  { src: "/previews/1.jpg", alt: "Homepage" },
  { src: "/previews/2.jpg", alt: "Pricing" },
]

<Lightbox images={images}>
  {images.map((image, i) => (
    <LightboxTrigger key={image.src} index={i}>
      <img src={image.src} alt={image.alt} />
    </LightboxTrigger>
  ))}
</Lightbox>`}
        />
      </DocSection>

      <DocSection title="With Gallery">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap a{" "}
          <a href="/docs/components/gallery" className="underline underline-offset-4">
            Gallery
          </a>{" "}
          tile in a <code className="font-mono text-sm">LightboxTrigger</code> with{" "}
          <code className="font-mono text-sm">asChild</code>, and give the{" "}
          <code className="font-mono text-sm">GalleryItem</code> an{" "}
          <code className="font-mono text-sm">action</code> label so it reveals the &ldquo;See
          image&rdquo; pill on hover and opens the viewer on click.
        </p>
        <CodeSnippet
          className="mt-4"
          code={`<Lightbox images={images}>
  <GalleryMasonry>
    {images.map((image, i) => (
      <LightboxTrigger key={image.src} index={i} asChild>
        <GalleryItem action="See image">
          <GalleryImage src={image.src} alt={image.alt} />
        </GalleryItem>
      </LightboxTrigger>
    ))}
  </GalleryMasonry>
</Lightbox>`}
        />
      </DocSection>

      <DocSection title="Single image">
        <p className="mt-4 text-pretty text-muted-foreground">
          With one image the arrows and the thumbnail rail disappear, so a lone trigger works as a
          simple click-to-zoom for a single screenshot, with its own pill label.
        </p>
        <ComponentPreview
          code={`<Lightbox images={[{ src: "/preview.jpg", alt: "Preview" }]}>
  <LightboxTrigger index={0} label="See project" className="aspect-video w-full max-w-md rounded-xl border">
    <img src="/preview.jpg" alt="Preview" className="size-full object-cover" />
  </LightboxTrigger>
</Lightbox>`}
        >
          <LightboxSingleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Lightbox</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root. Takes <code className="font-mono text-sm">images</code> (an array of{" "}
              <code className="font-mono text-sm">{"{ src, alt? }"}</code>) and renders the viewer.
              Open state is uncontrolled by default; pass{" "}
              <code className="font-mono text-sm">open</code> +{" "}
              <code className="font-mono text-sm">onOpenChange</code> to control it, and{" "}
              <code className="font-mono text-sm">defaultIndex</code> to set the first image. Built
              on Radix Dialog, so focus trap, scroll lock, Esc, and exit animations are handled.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">LightboxTrigger</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Opens the viewer at its <code className="font-mono text-sm">index</code>. Renders a{" "}
              <code className="font-mono text-sm">&lt;button&gt;</code> with a hover/focus{" "}
              <code className="font-mono text-sm">label</code> pill (default &ldquo;See
              image&rdquo;, pass <code className="font-mono text-sm">null</code> to hide). Pass{" "}
              <code className="font-mono text-sm">asChild</code> to make any tile (for example a{" "}
              <code className="font-mono text-sm">GalleryItem</code>) the trigger — then it draws no
              pill and defers to that element&apos;s affordance.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">Navigation</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The arrow buttons, the <kbd className="font-mono text-xs">←</kbd> /{" "}
              <kbd className="font-mono text-xs">→</kbd> keys, the thumbnail rail, and a
              swipe/drag on the image itself page between images (looping); the active thumbnail is
              ringed and a counter sits top-left. They all appear only with more than one image. The
              image follows the finger while you drag and commits on a firm swipe (by distance or a
              quick flick), otherwise it springs back to center. The rail is bounded to the screen
              width and scrolls sideways when the thumbnails outrun it (common on mobile or with many
              images), keeping the active tile scrolled to center as you page. Click the scrim or
              press <kbd className="font-mono text-xs">Esc</kbd> to close. All motion is gated behind{" "}
              <code className="font-mono text-sm">motion-safe</code>.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I open the viewer at a specific image?", a: "Give each trigger its position in the `images` array via the `index` prop. `LightboxTrigger` calls into the Lightbox to open at that index, so clicking the third tile opens the third image. The viewer then owns navigation from there." },
            { q: "How do I move between photos?", a: "Once the viewer is open, use the left/right arrow buttons, the ← and → keys, click a thumbnail in the bottom rail, or swipe/drag the image sideways (great on touch). The image follows your finger and commits on a firm swipe (distance or a quick flick), otherwise it springs back. Paging loops, and the photo crossfades as it changes. Arrows, the rail, and swipe only apply when there is more than one image." },
            { q: "Can a Gallery tile open the lightbox?", a: "Yes, that is the intended pairing. Wrap the `GalleryItem` in a `LightboxTrigger` with `asChild`, and set the item's `action` (for example `\"See image\"`). The tile reveals its pill on hover without shifting position, and clicking opens the viewer." },
            { q: "How does it open and close?", a: "It is a clean fade with a soft zoom-in, handled by Radix Dialog's enter/exit animations (no morph or flying transition). Opening fades the dark scrim in and the image zooms slightly into place; closing reverses it. Everything is gated behind `motion-safe`, so reduced-motion users get an instant open/close." },
            { q: "Why is the chrome dark instead of themed?", a: "The viewer always sits over a photo on a near-black scrim, so the controls (scrim, arrows, close, thumbnails) use a fixed dark wash rather than theme tokens. This mirrors the Dialog overlay, which is also a fixed scrim so it reads in every theme." },
            { q: "Do I need next/image for the images?", a: "No. The viewer and thumbnails use plain lazy-loaded `<img>` elements so any remote source works without extra configuration." },
          ]}
        />
      </DocSection>
    </>
  )
}
