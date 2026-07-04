import Image from "next/image"
import { Lightning } from "@phosphor-icons/react/dist/ssr"

import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
  SectionHeaderChip,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputRoot, InputField } from "@/components/ui/input"
import { Divider } from "@/components/ui/divider"
import { ComponentPreview } from "@/components/docs/component-preview"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { SectionHeaderStaggerDemo } from "./stagger-demo"

export const metadata = { title: "Section Header" }

export default function SectionHeaderDocsPage() {
  return (
    <>
      <DocHeader
        title="Section Header"
        description="The lede every section opens with: an optional Badge eyebrow, a balanced heading, a supporting paragraph, and a CTA row. Two orthogonal axes, align (left or center) and orientation (stacked or split), recompose it for any section, so every block on the page shares one header rhythm. Pure layout, built from our Badge, Button, and Input."
      />

      <ComponentPreview
        previewClassName="block p-6 sm:p-10"
        code={`<SectionHeader align="left" orientation="split">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Best value</Badge>
    <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
    <SectionHeaderDescription>
      At Koala Studio, we take pride in providing a unique set of essential
      features that truly distinguish us from the competition.
    </SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <Button>Get started</Button>
    <Button variant="outline">Explore features</Button>
  </SectionHeaderActions>
</SectionHeader>`}
      >
        <SectionHeader align="left" orientation="split">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              Best value
            </Badge>
            <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
            <SectionHeaderDescription>
              At Koala Studio, we take pride in providing a unique set of essential features that
              truly distinguish us from the competition.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button>Get started</Button>
            <Button variant="outline">Explore features</Button>
          </SectionHeaderActions>
        </SectionHeader>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="section-header" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          className="mt-4"
          code={`import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <SectionHeader>
      <SectionHeaderText>
        <Badge variant="success" dot pill>Best value</Badge>
        <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
        <SectionHeaderDescription>
          A unique set of essential features that distinguish us.
        </SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button>Get started</Button>
        <Button variant="outline">Explore features</Button>
      </SectionHeaderActions>
    </SectionHeader>
  )
}`}
        />
      </DocSection>

      <DocSection title="Alignment">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">align=&quot;left&quot;</code> (default) anchors the
          block to the leading edge; <code className="font-mono text-sm">align=&quot;center&quot;</code>{" "}
          centers it in a capped column, the classic centered section lede.
        </p>
        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader align="left">…</SectionHeader>

<SectionHeader align="center">…</SectionHeader>`}
        >
          <div className="flex w-full flex-col gap-10">
            <SectionHeader align="left">
              <SectionHeaderText>
                <Badge variant="success" dot pill>
                  Best value
                </Badge>
                <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
                <SectionHeaderDescription>
                  At Koala Studio, we take pride in providing a unique set of essential features.
                </SectionHeaderDescription>
              </SectionHeaderText>
              <SectionHeaderActions>
                <Button>Get started</Button>
                <Button variant="outline">Explore features</Button>
              </SectionHeaderActions>
            </SectionHeader>

            <Divider />

            <SectionHeader align="center">
              <SectionHeaderText>
                <Badge variant="success" dot pill>
                  Best value
                </Badge>
                <SectionHeaderHeading>Choose your perfect plan</SectionHeaderHeading>
                <SectionHeaderDescription>Pay once, get access forever.</SectionHeaderDescription>
              </SectionHeaderText>
              <SectionHeaderActions>
                <Button>Get started</Button>
                <Button variant="outline">Explore features</Button>
              </SectionHeaderActions>
            </SectionHeader>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Orientation">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">orientation=&quot;stacked&quot;</code> (default) drops
          the actions below the text. <code className="font-mono text-sm">split</code> moves them
          beside the text on a row from the <code className="font-mono text-sm">lg</code> breakpoint
          up (and stacks again below it). Split is a left-aligned layout; centered headers always
          stack.
        </p>
        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader orientation="stacked">…</SectionHeader>

<SectionHeader orientation="split">…</SectionHeader>`}
        >
          <div className="flex w-full flex-col gap-10">
            <SectionHeader orientation="stacked">
              <SectionHeaderText>
                <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
                <SectionHeaderDescription>
                  At Koala Studio, we take pride in providing a unique set of essential features.
                </SectionHeaderDescription>
              </SectionHeaderText>
              <SectionHeaderActions>
                <Button>Get started</Button>
                <Button variant="outline">Explore features</Button>
              </SectionHeaderActions>
            </SectionHeader>

            <Divider />

            <SectionHeader orientation="split">
              <SectionHeaderText>
                <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
                <SectionHeaderDescription>
                  At Koala Studio, we take pride in providing a unique set of essential features.
                </SectionHeaderDescription>
              </SectionHeaderText>
              <SectionHeaderActions>
                <Button>Get started</Button>
                <Button variant="outline">Explore features</Button>
              </SectionHeaderActions>
            </SectionHeader>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">size</code> scales the heading and description
          together to roughly the scale of a Heading 1 (
          <code className="font-mono text-sm">lg</code>), Heading 2 (
          <code className="font-mono text-sm">md</code>, the default), or Heading 3 (
          <code className="font-mono text-sm">sm</code>). It is independent of the heading{" "}
          <code className="font-mono text-sm">level</code> (the semantic tag), so an{" "}
          <code className="font-mono text-sm">h2</code> can read at the Heading 1 size.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Size</th>
                <th className="py-2 pr-4 font-medium">Heading</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-border/60">
                <td className="py-3 pr-4">
                  <code className="font-mono">sm</code>{" "}
                  <span className="text-muted-foreground">Heading 3</span>
                </td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-xs">text-2xl sm:text-3xl</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">24 → 30px</div>
                </td>
                <td className="py-3">
                  <code className="font-mono text-xs">text-sm sm:text-base</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">14 → 16px</div>
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-3 pr-4">
                  <code className="font-mono">md</code>{" "}
                  <span className="text-muted-foreground">Heading 2 · default</span>
                </td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-xs">text-4xl sm:text-5xl</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">36 → 48px</div>
                </td>
                <td className="py-3">
                  <code className="font-mono text-xs">text-base sm:text-lg</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">16 → 18px</div>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4">
                  <code className="font-mono">lg</code>{" "}
                  <span className="text-muted-foreground">Heading 1</span>
                </td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-xs">text-4xl sm:text-5xl lg:text-6xl</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">36 → 48 → 60px</div>
                </td>
                <td className="py-3">
                  <code className="font-mono text-xs">text-lg</code>
                  <div className="mt-1 text-muted-foreground tabular-nums">18px</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-pretty text-muted-foreground">
          Values are mobile → <code className="font-mono">sm</code> (640px) →{" "}
          <code className="font-mono">lg</code> (1024px); the heading and description step up together
          at those breakpoints. Both slots inherit Tailwind&apos;s default type scale (no token
          override).
        </p>

        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader size="sm">…</SectionHeader>  {/* Heading 3 scale */}
<SectionHeader size="md">…</SectionHeader>  {/* Heading 2 scale */}
<SectionHeader size="lg">…</SectionHeader>  {/* Heading 1 scale */}`}
        >
          <div className="flex w-full flex-col gap-10">
            {(
              [
                { size: "sm", heading: "Heading 3" },
                { size: "md", heading: "Heading 2" },
                { size: "lg", heading: "Heading 1" },
              ] as const
            ).map(({ size, heading }) => (
              <SectionHeader key={size} size={size}>
                <SectionHeaderText>
                  <Badge variant="secondary" size="sm" pill>
                    {size} · {heading}
                  </Badge>
                  <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
                  <SectionHeaderDescription>
                    At Koala Studio, we take pride in providing a unique set of essential features.
                  </SectionHeaderDescription>
                </SectionHeaderText>
              </SectionHeader>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The header is responsive on every axis at once.{" "}
          <code className="font-mono text-sm">size</code> steps the heading and description up at{" "}
          <code className="font-mono text-sm">sm</code> and{" "}
          <code className="font-mono text-sm">lg</code>; the actions row stacks full-width on a phone
          (<code className="font-mono text-sm">items-stretch</code>) and returns to a wrapping row from{" "}
          <code className="font-mono text-sm">sm</code>; a{" "}
          <code className="font-mono text-sm">split</code> header lays the lede and actions side by
          side from <code className="font-mono text-sm">lg</code> and falls back to the stacked column
          below it; a centered block shrinks to the viewport instead of overflowing; and any inline{" "}
          <code className="font-mono text-sm">SectionHeaderChip</code> rides the heading (it is sized
          in <code className="font-mono text-sm">em</code>). Drag the frame, or use the mobile /
          tablet / desktop presets, to watch it recompose.
        </p>
        <PreviewFrame
          src="/preview/section-header"
          minHeight="32rem"
          code={`{/* Recomposes across breakpoints: the size scale, the actions row, and the split layout. */}
<SectionHeader align="left" orientation="split">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Best value</Badge>
    <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
    <SectionHeaderDescription>
      At Koala Studio, we take pride in providing a unique set of essential features
      that truly distinguish us from the competition.
    </SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <Button>Get started</Button>
    <Button variant="outline">Explore features</Button>
  </SectionHeaderActions>
</SectionHeader>

{/* Centered headers with em-sized chips ride the heading at each breakpoint. */}
<SectionHeader align="center" size="lg">
  <SectionHeaderText>
    <SectionHeaderHeading level={1}>
      The daily <SectionHeaderChip variant="bare">📅</SectionHeaderChip> planner to keep{" "}
      <SectionHeaderChip variant="bare">⚡</SectionHeaderChip> distracted{" "}
      <SectionHeaderChip variant="bare">🧠</SectionHeaderChip> minds on track
    </SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>`}
        />
      </DocSection>

      <DocSection title="With an email capture">
        <p className="mt-4 text-pretty text-muted-foreground">
          The actions row composes any control, not just buttons: drop an{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a> beside
          a <code className="font-mono text-sm">Button</code> for a newsletter or waitlist lede.
        </p>
        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader align="center">
  <SectionHeaderText>
    <SectionHeaderHeading>Stay in the loop</SectionHeaderHeading>
    <SectionHeaderDescription>Get product updates and design tips. No spam.</SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <InputRoot className="w-full max-w-xs">
      <InputField type="email" placeholder="you@company.com" aria-label="Email address" />
    </InputRoot>
    <Button>Subscribe</Button>
  </SectionHeaderActions>
</SectionHeader>`}
        >
          <SectionHeader align="center">
            <SectionHeaderText>
              <SectionHeaderHeading>Stay in the loop</SectionHeaderHeading>
              <SectionHeaderDescription>
                Get product updates and design tips. No spam.
              </SectionHeaderDescription>
            </SectionHeaderText>
            <SectionHeaderActions>
              <InputRoot className="w-full max-w-xs">
                <InputField type="email" placeholder="you@company.com" aria-label="Email address" />
              </InputRoot>
              <Button>Subscribe</Button>
            </SectionHeaderActions>
          </SectionHeader>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inline media">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a <code className="font-mono text-sm">SectionHeaderChip</code> between the words of the
          heading to flow a mark or emoji inline with the copy. A{" "}
          <code className="font-mono text-sm">framed</code> chip (default) is a rounded tile that holds
          a logo, icon, or image, the app-icon look set right into the headline; a{" "}
          <code className="font-mono text-sm">bare</code> chip drops the box for a naked glyph or
          emoji interleaved with the text. It is sized entirely in{" "}
          <code className="font-mono text-sm">em</code>, so the tile, its radius, and the glyph inside
          all scale with the heading at every <code className="font-mono text-sm">size</code> and
          breakpoint. Chips are decorative by default (
          <code className="font-mono text-sm">aria-hidden</code>); pass an{" "}
          <code className="font-mono text-sm">aria-label</code> when one stands in for a word.
        </p>

        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader align="center" size="lg">
  <SectionHeaderText>
    <SectionHeaderHeading level={1}>
      Be yourself until you can be a{" "}
      <SectionHeaderChip aria-label="Koala">
        <Image src="/koala-logo.webp" alt="" width={80} height={80} className="size-full" />
      </SectionHeaderChip>
    </SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>

{/* A framed chip frames an icon just as well as an image. */}
<SectionHeader align="center" size="lg">
  <SectionHeaderText>
    <SectionHeaderHeading level={1}>
      Built for <SectionHeaderChip><Lightning weight="bold" /></SectionHeaderChip> fast teams
    </SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>`}
        >
          <div className="flex w-full flex-col gap-10">
            <SectionHeader align="center" size="lg">
              <SectionHeaderText>
                <SectionHeaderHeading level={1}>
                  Be yourself until you can be a{" "}
                  <SectionHeaderChip aria-label="Koala">
                    <Image src="/koala-logo.webp" alt="" width={80} height={80} className="size-full" />
                  </SectionHeaderChip>
                </SectionHeaderHeading>
              </SectionHeaderText>
            </SectionHeader>

            <Divider />

            <SectionHeader align="center" size="lg">
              <SectionHeaderText>
                <SectionHeaderHeading level={1}>
                  Built for{" "}
                  <SectionHeaderChip>
                    <Lightning weight="bold" />
                  </SectionHeaderChip>{" "}
                  fast teams
                </SectionHeaderHeading>
              </SectionHeaderText>
            </SectionHeader>
          </div>
        </ComponentPreview>

        <p className="mt-8 text-pretty text-muted-foreground">
          Drop the frame with <code className="font-mono text-sm">variant=&quot;bare&quot;</code> and
          the chip is just a glyph or emoji sized to the cap height, so icons and emoji sit inline
          between the words without a container.
        </p>

        <ComponentPreview
          previewClassName="block p-6 sm:p-10"
          code={`<SectionHeader align="center" size="lg">
  <SectionHeaderText>
    <SectionHeaderHeading level={1}>
      The daily <SectionHeaderChip variant="bare">📅</SectionHeaderChip> planner to keep{" "}
      <SectionHeaderChip variant="bare">⚡</SectionHeaderChip> distracted{" "}
      <SectionHeaderChip variant="bare">🧠</SectionHeaderChip> minds on track
    </SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>

{/* Mix in any emoji you like: a bare chip keeps them sized and aligned with the copy. */}
<SectionHeader align="center" size="lg">
  <SectionHeaderText>
    <SectionHeaderHeading level={1}>
      Ship faster <SectionHeaderChip variant="bare">🚀</SectionHeaderChip> sleep better{" "}
      <SectionHeaderChip variant="bare">😴</SectionHeaderChip>
    </SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>`}
        >
          <div className="flex w-full flex-col gap-10">
            <SectionHeader align="center" size="lg">
              <SectionHeaderText>
                <SectionHeaderHeading level={1}>
                  The daily{" "}
                  <SectionHeaderChip variant="bare">📅</SectionHeaderChip> planner to keep{" "}
                  <SectionHeaderChip variant="bare">⚡</SectionHeaderChip> distracted{" "}
                  <SectionHeaderChip variant="bare">🧠</SectionHeaderChip> minds on track
                </SectionHeaderHeading>
              </SectionHeaderText>
            </SectionHeader>

            <Divider />

            <SectionHeader align="center" size="lg">
              <SectionHeaderText>
                <SectionHeaderHeading level={1}>
                  Ship faster{" "}
                  <SectionHeaderChip variant="bare">🚀</SectionHeaderChip> sleep better{" "}
                  <SectionHeaderChip variant="bare">😴</SectionHeaderChip>
                </SectionHeaderHeading>
              </SectionHeaderText>
            </SectionHeader>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Stagger">
        <p className="mt-4 text-pretty text-muted-foreground">
          A section can <em>opt in</em> to a load animation: set{" "}
          <code className="font-mono text-sm">stagger</code> and the lede cascades in on mount, each
          unit rising one beat after the last rather than the whole block appearing at once. It is off
          by default, so you choose where motion earns its keep. Pass{" "}
          <code className="font-mono text-sm">stagger</code> (or{" "}
          <code className="font-mono text-sm">stagger={"{true}"}</code>) for the default 70&nbsp;ms
          cadence, or a number to set the gap between units yourself.
        </p>
        <p className="mt-3 text-pretty text-muted-foreground">
          Two knobs shape how it reads. <code className="font-mono text-sm">staggerBy</code> picks the
          unit: <code className="font-mono text-sm">&quot;phrase&quot;</code> (default) reveals the
          lede part by part (eyebrow, heading, description, then the actions row);{" "}
          <code className="font-mono text-sm">&quot;word&quot;</code> reveals the heading and
          description word by word, so the copy types itself in. And{" "}
          <code className="font-mono text-sm">staggerBlur</code> adds a soft 4px&nbsp;→&nbsp;0 focus
          pull as each unit lands, on top of the rise and fade. Try the combinations:
        </p>

        <div className="mt-6 rounded-lg border border-border bg-background p-6 sm:p-10">
          <SectionHeaderStaggerDemo />
        </div>

        <CodeSnippet
          className="mt-4"
          code={`// Off by default: the header just renders.
<SectionHeader>…</SectionHeader>

// Opt in: cascade the parts at the DS's 70ms cadence.
<SectionHeader stagger>…</SectionHeader>

// Reveal the copy word by word, with a soft focus pull.
<SectionHeader stagger staggerBy="word" staggerBlur>…</SectionHeader>

// Tune the gap between units (snappier or more relaxed).
<SectionHeader stagger={40} staggerBy="word">…</SectionHeader>

// Below the fold? Play as the reader reaches it, not on load.
<SectionHeader stagger staggerTrigger="inView">…</SectionHeader>`}
        />

        <p className="mt-4 text-pretty text-muted-foreground">
          By default the cascade plays on <strong>mount</strong>, the right gate for an above-the-fold
          load reveal. For a section further down the page, set{" "}
          <code className="font-mono text-sm">staggerTrigger=&quot;inView&quot;</code> and it waits
          until the header scrolls into view, so the reveal happens as the reader arrives instead of
          finishing off-screen. (The demo above uses{" "}
          <code className="font-mono text-sm">inView</code>, which is why it replays each time you
          scroll back to it.)
        </p>
        <p className="mt-3 text-pretty text-muted-foreground">
          The whole cascade is continuous: in word mode the eyebrow leads, the heading and
          description words flow in reading order, and the actions land last, one slot after the final
          word. It plays once and honors{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code> (every unit simply
          appears). It is backed by the same{" "}
          <a href="/docs/foundations/motion" className="underline underline-offset-4">motion</a>{" "}
          tokens as the <code className="font-mono text-sm">Stagger</code> primitive, so a header reads
          identically to a staggered list or grid below it. For the content <em>below</em> the header
          (a feature grid, a list of cards), wrap it in the{" "}
          <code className="font-mono text-sm">Stagger</code> primitive (which takes the matching{" "}
          <code className="font-mono text-sm">blur</code> and{" "}
          <code className="font-mono text-sm">inView</code> props) to keep one cascade down the
          section.
        </p>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">SectionHeader</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root. <code className="font-mono text-sm">align</code> is{" "}
              <code className="font-mono text-sm">&quot;left&quot;</code> (default) or{" "}
              <code className="font-mono text-sm">&quot;center&quot;</code>;{" "}
              <code className="font-mono text-sm">orientation</code> is{" "}
              <code className="font-mono text-sm">&quot;stacked&quot;</code> (default) or{" "}
              <code className="font-mono text-sm">&quot;split&quot;</code> (left-aligned only);{" "}
              <code className="font-mono text-sm">size</code> is{" "}
              <code className="font-mono text-sm">&quot;sm&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;md&quot;</code> (default), or{" "}
              <code className="font-mono text-sm">&quot;lg&quot;</code>;{" "}
              <code className="font-mono text-sm">stagger</code> is{" "}
              <code className="font-mono text-sm">false</code> (default),{" "}
              <code className="font-mono text-sm">true</code> (cascade the lede in on mount at
              70&nbsp;ms), or a number (the ms gap between units);{" "}
              <code className="font-mono text-sm">staggerBy</code> is{" "}
              <code className="font-mono text-sm">&quot;phrase&quot;</code> (default, part by part) or{" "}
              <code className="font-mono text-sm">&quot;word&quot;</code> (word by word);{" "}
              <code className="font-mono text-sm">staggerBlur</code> (default{" "}
              <code className="font-mono text-sm">false</code>) adds a 4px&nbsp;→&nbsp;0 focus pull to
              the entrance; <code className="font-mono text-sm">staggerTrigger</code> is{" "}
              <code className="font-mono text-sm">&quot;mount&quot;</code> (default) or{" "}
              <code className="font-mono text-sm">&quot;inView&quot;</code> (cascade when scrolled
              into view). Forwards native{" "}
              <code className="font-mono text-sm">&lt;div&gt;</code> props and{" "}
              <code className="font-mono text-sm">className</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SectionHeaderText</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Groups the lede (eyebrow <code className="font-mono text-sm">Badge</code>, heading, and
              description) so alignment applies as a unit and it can sit beside the actions in{" "}
              <code className="font-mono text-sm">split</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SectionHeaderHeading</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The heading. <code className="font-mono text-sm">level</code> is{" "}
              <code className="font-mono text-sm">1</code>,{" "}
              <code className="font-mono text-sm">2</code> (default), or{" "}
              <code className="font-mono text-sm">3</code> and picks the semantic tag (
              <code className="font-mono text-sm">h1</code>/<code className="font-mono text-sm">h2</code>/
              <code className="font-mono text-sm">h3</code>); the visual scale comes from the root{" "}
              <code className="font-mono text-sm">size</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SectionHeaderDescription · SectionHeaderActions</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The muted supporting <code className="font-mono text-sm">&lt;p&gt;</code>, and the CTA
              row: drop our{" "}
              <a href="/docs/components/button" className="underline underline-offset-4">Button</a>s
              (or an <code className="font-mono text-sm">Input</code> + Button) into it. The row wraps
              and aligns with the block.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SectionHeaderChip</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              An inline media chip for the heading: drop it between the words to flow a logo, icon, or
              emoji inline with the copy. <code className="font-mono text-sm">variant</code> is{" "}
              <code className="font-mono text-sm">&quot;framed&quot;</code> (default, a rounded tile
              that holds the mark) or <code className="font-mono text-sm">&quot;bare&quot;</code> (no
              box, a naked glyph or emoji). Sized in <code className="font-mono text-sm">em</code> so
              it scales with the heading. Decorative by default (
              <code className="font-mono text-sm">aria-hidden</code>); pass an{" "}
              <code className="font-mono text-sm">aria-label</code> and it is exposed as an image with
              that name. Forwards native <code className="font-mono text-sm">&lt;span&gt;</code> props
              and <code className="font-mono text-sm">className</code>.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When do I use this instead of Hero?",
              a: "Hero is the page-opening statement (big, fixed-centered, with social proof and a feature checklist). SectionHeader is the lighter lede for every section below it (features, pricing, gallery), with left/center alignment and an optional split actions row.",
            },
            {
              q: "How do I add the eyebrow pill?",
              a: "Drop a `Badge` as the first child of `SectionHeaderText`. It composes our real Badge, so you control its variant, dot, and size; the text wrapper handles its alignment.",
            },
            {
              q: "What is the difference between level and size?",
              a: "`level` (on SectionHeaderHeading) sets the semantic tag h1/h2/h3 for document outline and accessibility. `size` (on SectionHeader) sets the visual scale of the heading and description. They are independent, so an h2 can render at the large size.",
            },
            {
              q: "Why does split stack on mobile?",
              a: "Side-by-side text and actions only fit on wider screens, so `split` becomes a row from the `lg` breakpoint and falls back to the stacked column below it. It is a responsive layout, not a desktop-only one.",
            },
            {
              q: "How do I put a logo or emoji inside the heading?",
              a: "Drop a `SectionHeaderChip` between the words of `SectionHeaderHeading`. A `framed` chip (default) frames a logo, icon, or image in a rounded tile; `variant=\"bare\"` drops the box for a naked glyph or emoji. It's sized in `em`, so it scales with the heading automatically at every size and breakpoint. It's decorative by default (aria-hidden); pass an `aria-label` when the chip stands in for a word so screen readers still get it.",
            },
            {
              q: "When should I turn on stagger?",
              a: "Reach for `stagger` on hero-adjacent or above-the-fold section headers where a brief entrance adds polish; leave it off for dense, content-heavy pages where every section animating would feel busy. It plays once on mount and respects reduced-motion, so it never gets in the way. It's the header counterpart to the `Stagger` primitive you'd wrap the content below it in.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
