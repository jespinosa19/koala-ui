import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { GalleryDemo, GalleryMinimalDemo } from "./demos"
import { GalleryAccordionDemo, GalleryAccordionCompactDemo } from "./accordion-demos"

export const metadata = { title: "Gallery" }

export default function GalleryDocsPage() {
  return (
    <>
      <DocHeader
        title="Gallery"
        description="A marketing concepts wall: a balanced headline and lead, an optional tab rail to switch template categories, and a full-bleed fake-masonry of framed preview tiles. Tabs come from our own Tabs component and the masonry is plain CSS columns, so the section stays consistent with the rest of the design system."
      />

      <ComponentPreview
        locked
        previewClassName="block p-0"
        code={`<Gallery>
  <Tabs defaultValue="home">
    <GalleryHeader>
      <GalleryTitle>Create Multiple Concepts in a Matter of Seconds</GalleryTitle>
      <GalleryDescription>
        Cover virtually any marketing project with our pre-designed sections and templates.
      </GalleryDescription>
      <TabsList className="mt-5 mx-auto flex w-fit gap-1.5">
        <TabsTrigger value="home" className="gap-1.5"><House /> Home</TabsTrigger>
        <TabsTrigger value="blog" className="gap-1.5"><PencilSimpleLine /> Blog article</TabsTrigger>
        {/* …About, Pricing, Careers */}
      </TabsList>
    </GalleryHeader>

    <TabsContent value="home" className="data-[state=active]:animate-in data-[state=active]:fade-in-0">
      <GalleryMasonry>
        <GalleryItem><GalleryImage src="/previews/home-1.jpg" alt="Landing page concept" /></GalleryItem>
        <GalleryItem><GalleryImage src="/previews/home-2.jpg" alt="Product homepage" /></GalleryItem>
        {/* …more tiles */}
      </GalleryMasonry>
    </TabsContent>
    {/* …a TabsContent per tab */}
  </Tabs>
</Gallery>`}
      >
        <GalleryDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="gallery" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="Without tabs">
        <p className="mt-4 text-pretty text-muted-foreground">
          Tabs are an optional composition. Drop the{" "}
          <code className="font-mono text-sm">Tabs</code> wrapper and render a single{" "}
          <code className="font-mono text-sm">GalleryMasonry</code> directly inside the section for
          a plain heading-plus-wall layout.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<Gallery>
  <GalleryHeader>
    <GalleryTitle>From our customers</GalleryTitle>
    <GalleryDescription>A wall of real projects shipped with Koala UI.</GalleryDescription>
  </GalleryHeader>
  <GalleryMasonry>
    <GalleryItem><GalleryImage src="/previews/1.jpg" alt="Project preview" /></GalleryItem>
    <GalleryItem><GalleryImage src="/previews/2.jpg" alt="Project preview" /></GalleryItem>
    {/* …more tiles */}
  </GalleryMasonry>
</Gallery>`}
        >
          <GalleryMinimalDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="As an accordion">
        <p className="mt-4 text-pretty text-muted-foreground">
          One more gallery layout: instead of a wall, present the work as a vertical index of
          collections. Each row previews itself with a peeking thumbnail stack and opens, on click,
          to a caption and a strip of framed photos that stagger in. It is built on our{" "}
          <a href="/docs/components/accordion" className="underline underline-offset-4">
            Accordion
          </a>{" "}
          (Radix keyboard and ARIA), so only one collection is open at a time. Compose the parts
          with <code className="font-mono text-sm">GalleryAccordion</code> and friends.
        </p>
        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<GalleryAccordion defaultValue="brand">
  <GalleryAccordionItem value="brand">
    <GalleryAccordionTrigger
      tagline="The new mark, palette, and the system behind it."
      count={18}
      peek={<GalleryAccordionPeek images={brandThumbs} />}
    >
      Brand refresh
    </GalleryAccordionTrigger>
    <GalleryAccordionContent>
      <GalleryAccordionCaption>A ground-up rebrand: studies, palette, guidelines.</GalleryAccordionCaption>
      {/* Each tile opens the full-screen Lightbox at its index. */}
      <Lightbox images={brandPhotos}>
        <GalleryAccordionMedia>
          {brandPhotos.map((photo, i) => (
            <LightboxTrigger key={photo.src} index={i} asChild>
              <GalleryAccordionImage className="h-44 w-60" src={photo.src} alt={photo.alt} action="View" />
            </LightboxTrigger>
          ))}
        </GalleryAccordionMedia>
      </Lightbox>
    </GalleryAccordionContent>
  </GalleryAccordionItem>
  {/* …Mobile app, Design system, Marketing site, Illustration */}
</GalleryAccordion>`}
        >
          <GalleryAccordionDemo />
        </ComponentPreview>

        <p className="mt-10 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">{`density="compact"`}</code> tightens the rows for a
          denser index. The open chapter is controlled with{" "}
          <code className="font-mono text-sm">value</code> /{" "}
          <code className="font-mono text-sm">defaultValue</code> /{" "}
          <code className="font-mono text-sm">onValueChange</code>, and opens on click or keyboard,
          never hover.
        </p>
        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<GalleryAccordion density="compact" defaultValue="system">
  {/* …collection rows */}
</GalleryAccordion>`}
        >
          <GalleryAccordionCompactDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Gallery</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The full-bleed <code className="font-mono text-sm">&lt;section&gt;</code> that
              provides the styling context and clips the masonry&apos;s outer tiles at its edges
              (<code className="font-mono text-sm">overflow-hidden</code>). Forwards native section
              props.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">GalleryHeader · GalleryTitle · GalleryDescription</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The centered lede column and its balanced{" "}
              <code className="font-mono text-sm">&lt;h2&gt;</code> + muted lead paragraph. Place a{" "}
              <a href="/docs/components/tabs" className="underline underline-offset-4">
                Tabs
              </a>{" "}
              rail inside the header to switch concept sets.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">GalleryMasonry</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The fake-masonry wall — plain CSS{" "}
              <code className="font-mono text-sm">columns</code> (2 → 3 → 4 across breakpoints), so
              varied natural image heights do the staggering. Wider than the gutter by default;
              override <code className="font-mono text-sm">className</code> to retune the column
              count or width.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">GalleryItem</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              One framed tile: a concentric-radius card that lifts and deepens its shadow on hover.
              Accepts <code className="font-mono text-sm">asChild</code> to render as a link while
              keeping the tile styles.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">GalleryImage</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The preview image; fills its tile and gently scales as the tile is hovered. Defaults
              to a lazy-loaded, non-draggable image with an empty{" "}
              <code className="font-mono text-sm">alt</code> — pass a real{" "}
              <code className="font-mono text-sm">alt</code> when the image carries meaning.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">GalleryAccordion · GalleryAccordionItem · GalleryAccordionTrigger</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The accordion layout (see “As an accordion”). The root is a value-controlled Radix
              Accordion (<code className="font-mono text-sm">{`type="single"`}</code>,{" "}
              <code className="font-mono text-sm">collapsible</code>) with{" "}
              <code className="font-mono text-sm">density</code> /{" "}
              <code className="font-mono text-sm">size</code>; each{" "}
              <code className="font-mono text-sm">GalleryAccordionItem</code> needs a unique{" "}
              <code className="font-mono text-sm">value</code>. The trigger takes{" "}
              <code className="font-mono text-sm">tagline</code>,{" "}
              <code className="font-mono text-sm">count</code>, and a{" "}
              <code className="font-mono text-sm">peek</code> stack, and draws its own{" "}
              <code className="font-mono text-sm">+</code> toggle. Opens on click/keyboard, never
              hover.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              GalleryAccordionPeek · GalleryAccordionContent · GalleryAccordionCaption ·
              GalleryAccordionMedia · GalleryAccordionImage
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">GalleryAccordionPeek</code> is the overlapping
              thumbnail stack on a closed row (it fades out on open). The panel holds an optional{" "}
              <code className="font-mono text-sm">Caption</code> over a{" "}
              <code className="font-mono text-sm">Media</code> strip of framed{" "}
              <code className="font-mono text-sm">GalleryAccordionImage</code> tiles that stagger in;
              give a tile <code className="font-mono text-sm">overlay</code> for a{" "}
              <code className="font-mono text-sm">+N</code> badge or{" "}
              <code className="font-mono text-sm">action</code> to make it an interactive button that
              pairs with{" "}
              <a href="/docs/components/lightbox" className="underline underline-offset-4">
                Lightbox
              </a>
              .
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Where do the tabs come from?", a: "Gallery ships no tabs of its own. The tab rail is composed from the existing Koala Tabs component: put the `TabsList` inside `GalleryHeader` and wrap each `GalleryMasonry` in a `TabsContent`, so the concepts wall stays consistent with the rest of the design system." },
            { q: "How is the masonry built?", a: "With plain CSS multi-column layout on `GalleryMasonry` (`columns-2 sm:columns-3 lg:columns-4`). The tiles keep their images' natural aspect ratios, and the varied heights are what produce the staggered, fake-masonry look. No JS measuring and no masonry library." },
            { q: "Why do the outer tiles get cut off at the edges?", a: "That is intentional. `Gallery` is `overflow-hidden` and the masonry is wider than the centered gutter, so the outer columns clip against the section edges for a wide, immersive band. Constrain `GalleryMasonry` with a narrower `max-w-*` in `className` if you want every tile fully visible." },
            { q: "Can a tile be a link?", a: "Yes. Pass `asChild` to `GalleryItem` and give it a single child (for example a Next `Link`); the tile styling, hover lift, and concentric radius merge onto your element." },
            { q: "Do I have to use tabs?", a: "No. Tabs are optional. Omit the `Tabs` wrapper and render one `GalleryMasonry` directly inside the section for a plain heading-plus-wall gallery." },
            { q: "Should I use next/image for the previews?", a: "`GalleryImage` is a plain lazy-loaded `<img>` so it works with any remote source without extra config. Swap in your own optimized image element via `asChild` on `GalleryItem` if you need `next/image` and have the remote host configured." },
            { q: "Can the gallery be an accordion instead of a wall?", a: "Yes. Gallery ships an accordion layout as one more option (see “As an accordion”): the `GalleryAccordion` parts present the work as a vertical index of collections that open, one at a time, to a strip of photos. It is built on the Accordion's Radix foundation, opens on click or keyboard (never hover), and pairs each photo with the Lightbox just like the masonry tiles." },
          ]}
        />
      </DocSection>
    </>
  )
}
