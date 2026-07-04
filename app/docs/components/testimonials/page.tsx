import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  TestimonialsDemo,
  TestimonialVariantsDemo,
  TestimonialRatingDemo,
  TestimonialAuthorTopDemo,
  TestimonialDividedDemo,
  TestimonialLogoLeadDemo,
  TestimonialBareDemo,
  TestimonialCenteredDemo,
  TestimonialSingleDemo,
} from "./demos"

export const metadata = { title: "Testimonials" }

export default function TestimonialsDocsPage() {
  return (
    <>
      <DocHeader
        title="Testimonials"
        description="A minimal quote card for social-proof walls. Named parts you assemble: an optional quote mark, the quote, an author row, and an optional logo. Stars come from our Rating and the headshot from our Avatar, so the card stays pure layout."
      />

      <ComponentPreview
        locked
        previewClassName="block p-6 sm:p-8"
        code={`<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Testimonial>
    <TestimonialQuote>We replaced our in-house kit in a weekend…</TestimonialQuote>
    <TestimonialFooter>
      <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
      <TestimonialAuthor>
        <TestimonialName>Alex Rivera</TestimonialName>
        <TestimonialTitle>Founder, Lumen</TestimonialTitle>
      </TestimonialAuthor>
    </TestimonialFooter>
  </Testimonial>
  {/* …more */}
</div>`}
      >
        <TestimonialsDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="testimonials" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          The default is <code className="font-mono text-sm">plain</code>: a flat, tinted surface
          with no border line or shadow. <code className="font-mono text-sm">outline</code> adds a
          hairline border, <code className="font-mono text-sm">soft</code> trades it for a subtle
          shadow, and <code className="font-mono text-sm">elevated</code> drops the border and lifts
          the card to feature one quote. There is also a borderless{" "}
          <code className="font-mono text-sm">ghost</code> for walls on a tinted section, and{" "}
          <code className="font-mono text-sm">bare</code>, which strips the surface and padding
          entirely so the quote sits flush on the page.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial variant="plain">…</Testimonial>
<Testimonial variant="outline">…</Testimonial>
<Testimonial variant="soft">…</Testimonial>
<Testimonial variant="elevated">…</Testimonial>
<Testimonial variant="ghost">…</Testimonial>
<Testimonial variant="bare">…</Testimonial>`}
        >
          <TestimonialVariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With a rating">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop our{" "}
          <a href="/docs/components/rating" className="underline underline-offset-4">Rating</a> with{" "}
          <code className="font-mono text-sm">readOnly</code> above the quote for star social proof.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial variant="outline">
  <Rating readOnly value={5} size="sm" />
  <TestimonialQuote>…</TestimonialQuote>
  <TestimonialFooter>…</TestimonialFooter>
</Testimonial>`}
        >
          <TestimonialRatingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Author on top">
        <p className="mt-4 text-pretty text-muted-foreground">
          Lead with the byline by rendering the{" "}
          <code className="font-mono text-sm">TestimonialFooter</code> first with{" "}
          <code className="font-mono text-sm">className=&quot;mt-0&quot;</code>: a compact, scannable
          layout for dense walls.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial>
  <TestimonialFooter className="mt-0">
    <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
    <TestimonialAuthor>
      <TestimonialName>Alex Rivera</TestimonialName>
      <TestimonialTitle>Founder, Lumen</TestimonialTitle>
    </TestimonialAuthor>
  </TestimonialFooter>
  <TestimonialQuote className="text-sm">…</TestimonialQuote>
</Testimonial>`}
        >
          <TestimonialAuthorTopDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Divided, with a logo">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">divided</code> for a hairline rule above the author
          row, and drop a <code className="font-mono text-sm">TestimonialLogo</code> in the footer
          for a company wordmark; it sits flush to the trailing edge.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial variant="outline" divided>
  <TestimonialQuote>…</TestimonialQuote>
  <TestimonialFooter>
    <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
    <TestimonialAuthor>
      <TestimonialName>Alex Rivera</TestimonialName>
      <TestimonialTitle>Founder, Lumen</TestimonialTitle>
    </TestimonialAuthor>
    <TestimonialLogo>Lumen</TestimonialLogo>
  </TestimonialFooter>
</Testimonial>`}
        >
          <TestimonialDividedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Logo-led">
        <p className="mt-4 text-pretty text-muted-foreground">
          Lead the card with the company logo instead of trailing it: drop a{" "}
          <code className="font-mono text-sm">TestimonialLogo</code> at the top, reset its footer
          defaults (<code className="font-mono text-sm">ml-0</code>) so it aligns left above the
          quote, and put a logo lockup inside it (here, a colored mark from the placeholder set).
          Pairs well with <code className="font-mono text-sm">variant=&quot;bare&quot;</code> for a
          logo wall.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<div className="grid gap-x-10 gap-y-10 sm:grid-cols-3">
  <Testimonial variant="bare" className="gap-3">
    <TestimonialLogo className="ml-0">
      <CompanyLogo /> {/* a colored SVG mark + wordmark */}
    </TestimonialLogo>
    <TestimonialQuote className="font-semibold text-foreground">…</TestimonialQuote>
    <TestimonialFooter className="mt-4">
      <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
      <TestimonialAuthor>
        <TestimonialName>Alex Rivera</TestimonialName>
        <TestimonialTitle>Founder, Halcyon</TestimonialTitle>
      </TestimonialAuthor>
    </TestimonialFooter>
  </Testimonial>
  {/* …more */}
</div>`}
        >
          <TestimonialLogoLeadDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Container-less">
        <p className="mt-4 text-pretty text-muted-foreground">
          The most minimal option: <code className="font-mono text-sm">variant=&quot;bare&quot;</code>{" "}
          strips the surface entirely (no border, background, padding, or radius) so the quotes sit
          flush on the page with nothing but whitespace between them.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
  <Testimonial variant="bare">
    <TestimonialQuote className="text-sm">…</TestimonialQuote>
    <TestimonialFooter>
      <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
      <TestimonialAuthor>
        <TestimonialName>Alex Rivera</TestimonialName>
        <TestimonialTitle>Founder, Lumen</TestimonialTitle>
      </TestimonialAuthor>
    </TestimonialFooter>
  </Testimonial>
  {/* …more */}
</div>`}
        >
          <TestimonialBareDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Centered pull-quote">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pair <code className="font-mono text-sm">variant=&quot;bare&quot;</code> with{" "}
          <code className="font-mono text-sm">align=&quot;center&quot;</code> for a single standout
          quote: centers the mark, quote, and byline with no chrome at all.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial variant="bare" align="center" className="mx-auto max-w-xl gap-6">
  <TestimonialMark />
  <TestimonialQuote className="text-xl text-balance sm:text-2xl">…</TestimonialQuote>
  <TestimonialFooter>
    <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=13" alt="Alex Rivera" /><AvatarFallback>AR</AvatarFallback></Avatar>
    <TestimonialAuthor>
      <TestimonialName>Alex Rivera</TestimonialName>
      <TestimonialTitle>Founder, Lumen</TestimonialTitle>
    </TestimonialAuthor>
  </TestimonialFooter>
</Testimonial>`}
        >
          <TestimonialCenteredDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Featured">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a <code className="font-mono text-sm">TestimonialMark</code> in for a quotation glyph
          and use <code className="font-mono text-sm">variant=&quot;elevated&quot;</code> to lift one
          standout quote.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6 sm:p-8"
          code={`<Testimonial variant="elevated" className="max-w-md">
  <TestimonialMark />
  <TestimonialQuote className="text-lg">Radix under the hood means I stopped worrying about a11y bugs.</TestimonialQuote>
  <TestimonialFooter>
    <Avatar size="md"><AvatarImage src="https://i.pravatar.cc/160?img=32" alt="Mei Lin" /><AvatarFallback>ML</AvatarFallback></Avatar>
    <TestimonialAuthor>
      <TestimonialName>Mei Lin</TestimonialName>
      <TestimonialTitle>Frontend Lead, Cadence</TestimonialTitle>
    </TestimonialAuthor>
  </TestimonialFooter>
</Testimonial>`}
        >
          <TestimonialSingleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Testimonial</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root <code className="font-mono text-sm">&lt;figure&gt;</code> card. Provides the
              styling context to every part.{" "}
              <code className="font-mono text-sm">variant</code> is{" "}
              <code className="font-mono text-sm">&quot;plain&quot;</code> (default),{" "}
              <code className="font-mono text-sm">&quot;outline&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;soft&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;elevated&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;ghost&quot;</code> (no surface, keeps
              padding), or <code className="font-mono text-sm">&quot;bare&quot;</code> (container-less:
              no surface or padding). <code className="font-mono text-sm">align</code> is{" "}
              <code className="font-mono text-sm">&quot;start&quot;</code> (default) or{" "}
              <code className="font-mono text-sm">&quot;center&quot;</code>, and{" "}
              <code className="font-mono text-sm">divided</code> adds a rule above the footer. Accepts{" "}
              <code className="font-mono text-sm">asChild</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">TestimonialMark · TestimonialQuote</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              An optional decorative quote glyph and the{" "}
              <code className="font-mono text-sm">&lt;blockquote&gt;</code> itself.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              TestimonialFooter · TestimonialAuthor · TestimonialName · TestimonialTitle ·
              TestimonialLogo
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The author row (<code className="font-mono text-sm">&lt;figcaption&gt;</code>): drop an{" "}
              <a href="/docs/components/avatar" className="underline underline-offset-4">Avatar</a>{" "}
              beside the name/title stack, and an optional{" "}
              <code className="font-mono text-sm">TestimonialLogo</code> for a company wordmark on the
              trailing edge. For the stars, use our{" "}
              <a href="/docs/components/rating" className="underline underline-offset-4">Rating</a>{" "}
              with <code className="font-mono text-sm">readOnly</code>.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I add the star rating and the headshot?", a: "Testimonial is pure layout, so it does not ship its own stars or avatar. Drop our `Rating` with `readOnly` in for the stars, and our `Avatar` into the `TestimonialFooter` beside the author stack." },
            { q: "What is the difference between the variants?", a: "`plain` (default) is a flat tinted surface with no border or shadow, `outline` adds a hairline border, `soft` trades it for a subtle shadow, `elevated` removes the border and lifts the card to feature one quote, and `ghost` is fully transparent for walls on a tinted section. Set it with the `variant` prop." },
            { q: "How do I make a container-less testimonial?", a: "Use `variant=\"bare\"`. It strips the surface entirely: no border, background, padding, or radius, so the quote and byline sit flush on the page. `ghost` is the in-between, dropping the surface but keeping the padding for use inside an already-spaced section." },
            { q: "How do I center a single pull-quote?", a: "Pair `variant=\"bare\"` with `align=\"center\"`. The `align` prop centers the quote mark, the quote text, and the author row, and reads `start` (default) or `center`." },
            { q: "What does the `divided` prop do?", a: "It adds a hairline rule above the author row, separating the quote from the byline (a Vercel-style treatment). Combine it with a `TestimonialLogo` for a clean, branded card footer." },
            { q: "How do I assemble the author row?", a: "Use `TestimonialFooter` as the row, with the `Avatar` first and a `TestimonialAuthor` holding a `TestimonialName` and `TestimonialTitle` stack beside it. Add an optional `TestimonialLogo` for a wordmark on the right. The footer is a real `figcaption`." },
            { q: "How do I put the author above the quote?", a: "Render the `TestimonialFooter` before the `TestimonialQuote` and pass `className=\"mt-0\"` to it. The footer's default `mt-auto` pushes it to the bottom, so resetting the margin lets it lead." },
            { q: "What is TestimonialMark for?", a: "It is an optional decorative quotation glyph that sits above the quote. It is aria-hidden and brand-tinted, so it adds visual flourish without affecting the semantics or screen-reader output." },
            { q: "Can the card be a link?", a: "Yes. `Testimonial` accepts `asChild`, so it renders onto your own element (for example an anchor) via Radix Slot while keeping the figure styling and passing context to every part." },
            { q: "How do I lay out a wall of testimonials?", a: "The root is a self-contained `figure` with `h-full`, so it stretches to equal height in a grid. Arrange a set in a CSS grid, or place them inside our Carousel, to build a testimonial wall." },
          ]}
        />
      </DocSection>
    </>
  )
}
