import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  BasicDemo,
  ImageCardDemo,
  IndicatorVariantsDemo,
  OverlayHeroDemo,
  ControlledDemo,
} from "./demos"

export const metadata = {
  title: "Carousel",
}

export default function CarouselDocsPage() {
  return (
    <>
      <DocHeader
        title="Carousel"
        description="A horizontal slide viewer with a clickable indicator. The track translates between full-width slides, ←/→ step it while focused, and the indicator ships as one component with a closed set of forms (dots, lines, fraction, thumbnails). Controlled or uncontrolled. Distinct from Pagination, which is the data-table page toolbar."
      />

      <ComponentPreview
        code={`<Carousel label="Product highlights">
  <CarouselContent>
    <CarouselSlide>{/* slide one */}</CarouselSlide>
    <CarouselSlide>{/* slide two */}</CarouselSlide>
    <CarouselSlide>{/* slide three */}</CarouselSlide>
  </CarouselContent>
  <CarouselIndicators />
</Carousel>`}
      >
        <BasicDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="carousel" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Carousel, CarouselContent, CarouselSlide, CarouselIndicators,
} from "@/components/ui/carousel"

export function Example() {
  return (
    <Carousel label="Product highlights">
      <CarouselContent>
        <CarouselSlide>{/* … */}</CarouselSlide>
        <CarouselSlide>{/* … */}</CarouselSlide>
      </CarouselContent>
      <CarouselIndicators />
    </Carousel>
  )
}`}
        />
      </DocSection>

      <DocSection title="Indicator variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          The indicator ships as one component with a closed set of forms, picked with the{" "}
          <code className="font-mono text-sm">variant</code> prop. Never hand-roll a new
          indicator per carousel: pick the form that fits the surface.
        </p>
        <ul className="mt-3 ml-4 list-disc text-pretty text-sm text-muted-foreground [&>li]:mt-1">
          <li>
            <code className="font-mono">dots</code> (default): pill-morphing bullets, for most
            cards and testimonials.
          </li>
          <li>
            <code className="font-mono">lines</code>: thin fixed-width ticks, a quieter
            alternative to dots.
          </li>
          <li>
            <code className="font-mono">fraction</code>: a contained{" "}
            <span className="tabular-nums">2 / 5</span> readout for dense image galleries; the
            active number rolls like an odometer, and the pill grows smoothly by one digit-width
            when the count crosses a boundary (<span className="tabular-nums">99 / 100</span>).
          </li>
          <li>
            <code className="font-mono">thumbnails</code>: one slide preview per slide; pass a{" "}
            <code className="font-mono">thumbnails</code> node array indexed to the slides. A single
            brand ring glides from tile to tile rather than toggling per preview.
          </li>
          <li>
            <code className="font-mono">tabs</code>: one text label per slide; pass a{" "}
            <code className="font-mono">labels</code> array indexed to the slides. A single underline
            glides to the active tab rather than toggling per label.
          </li>
          <li>
            <code className="font-mono">numbers</code>: a numbered chip per slide; the active one
            fills like a numbered pager. Good for short, countable sets.
          </li>
          <li>
            <code className="font-mono">progress</code>: a single continuous bar that fills with
            position (<span className="tabular-nums">25%</span> on slide 1 of 4). A readout, not
            per-slide clickable; navigate with arrows, drag, or the arrow keys.
          </li>
        </ul>
        <ComponentPreview
          code={`{/* one component, pick the form with \`variant\` */}
<CarouselIndicators variant="dots" />
<CarouselIndicators variant="lines" />
<CarouselIndicators variant="fraction" />
<CarouselIndicators
  variant="thumbnails"
  thumbnails={slides.map((s) => <img key={s.id} src={s.thumb} alt="" />)}
/>
<CarouselIndicators variant="tabs" labels={["Photo", "Stats", "Map", "Camera"]} />
<CarouselIndicators variant="numbers" />
<CarouselIndicators variant="progress" />`}
        >
          <IndicatorVariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Over a hero">
        <p className="mt-4 text-pretty text-muted-foreground">
          Positioning is orthogonal to the form: any variant composes with{" "}
          <code className="font-mono text-sm">overlay</code> (float over the image, white
          treatment) and <code className="font-mono text-sm">align</code> (
          <code className="font-mono text-sm">end</code> bottom-right or{" "}
          <code className="font-mono text-sm">center</code> bottom-centered). Full-bleed heroes
          usually want centered overlay dots.
        </p>
        <ComponentPreview
          code={`{/* centered white dots */}
<CarouselIndicators overlay align="center" />`}
        >
          <OverlayHeroDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="On images / cards">
        <p className="mt-4 text-pretty text-muted-foreground">
          For photo galleries, add{" "}
          <code className="font-mono text-sm">CarouselPrevious</code> /{" "}
          <code className="font-mono text-sm">CarouselNext</code>: overlay arrows that reveal
          on hover (and on keyboard focus), and stay hidden at the first/last slide. Pass{" "}
          <code className="font-mono text-sm">overlay</code> to{" "}
          <code className="font-mono text-sm">CarouselIndicators</code> to float the dots over
          the bottom-right of the image; over photos they switch to fixed white so they stay
          legible on any background.
        </p>
        <ComponentPreview
          code={`<Carousel label="Photo gallery">
  <CarouselContent>
    <CarouselSlide><img … /></CarouselSlide>
    <CarouselSlide><img … /></CarouselSlide>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselIndicators overlay />
</Carousel>`}
        >
          <ImageCardDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">index</code> and{" "}
          <code className="font-mono text-sm">onIndexChange</code> to drive the active slide
          from your own state, e.g. to pair the dots with external prev/next buttons or a
          step counter. Omit them for uncontrolled use with{" "}
          <code className="font-mono text-sm">defaultIndex</code>.
        </p>
        <ComponentPreview
          code={`const [index, setIndex] = useState(0)

<Carousel index={index} onIndexChange={setIndex}>
  <CarouselContent>{/* slides */}</CarouselContent>
  <CarouselIndicators />
</Carousel>
<Button onClick={() => setIndex((i) => i - 1)}>Previous</Button>
<Button onClick={() => setIndex((i) => i + 1)}>Next</Button>`}
        >
          <ControlledDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use Carousel instead of Pagination?", a: "Carousel is a slide viewer: it translates a track between full-width slides with clickable indicator dots. Pagination is the page toolbar on the data table. If you are paging through tabular records rather than swiping through panels, reach for Pagination." },
            { q: "How do I add the hover arrows for an image gallery?", a: "Drop CarouselPrevious and CarouselNext inside the Carousel. They are overlay arrows that reveal on hover and on keyboard focus, and stay hidden at the first and last slide." },
            { q: "What indicator forms are there, and do I create a new component for each?", a: "No, never hand-roll a new indicator. CarouselIndicators is one component with a closed set of forms picked via the variant prop: dots (default), lines, fraction (a contained 2 / 5 readout), and thumbnails (one slide preview per slide, passed via the thumbnails prop). Positioning with overlay and align composes with every form." },
            { q: "What does the overlay prop on CarouselIndicators do?", a: "It floats the indicator over the image instead of below it, and switches it to a fixed white treatment so it stays legible on any photo background. Use align to place overlay indicators bottom-right (end) or bottom-centered (center)." },
            { q: "Should I control the active slide?", a: "Pass index and onIndexChange to drive it from your own state, for example to pair the dots with external prev/next buttons or a step counter. Omit them for uncontrolled use with defaultIndex." },
            { q: "Is the carousel keyboard and screen-reader accessible?", a: "Yes. The region exposes aria-roledescription=\"carousel\" with your label, ArrowLeft and ArrowRight step the active slide while it is focused, and each dot is a button with an aria-label from dotLabel plus aria-current on the active one." },
            { q: "Can I disable swipe and customize the dot labels?", a: "Pass draggable={false} on CarouselContent to turn off pointer and touch swiping, and pass a dotLabel function to CarouselIndicators to build each dot's accessible label, for example by slide title." },
          ]}
        />
      </DocSection>

    </>
  )
}
