import { Sparkle, Lightning, Palette } from "@phosphor-icons/react/ssr"

import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = { title: "Section" }

export default function SectionDocsPage() {
  return (
    <>
      <DocHeader
        title="Section"
        description="The content half of every marketing section: a full-bleed band and a centered 1440px gutter with 32px side padding and a canonical 56px gap to the content below. Pair it with SectionHeader (the lede) and every block on the page shares one rhythm. Pure layout, so it stays a server component."
      />

      <ComponentPreview
        previewClassName="block p-0"
        code={`<Section className="bg-muted/40">
  <SectionContainer>
    <SectionHeader align="center">
      <SectionHeaderText>
        <Badge variant="purple" pill>Features</Badge>
        <SectionHeaderHeading>Everything in one system</SectionHeaderHeading>
        <SectionHeaderDescription>
          One container width, one side padding, one 56px gap to the content
          below. Every section on the page shares the same rhythm.
        </SectionHeaderDescription>
      </SectionHeaderText>
    </SectionHeader>

    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardHeader><CardTitle>Fast</CardTitle>…</CardHeader></Card>
      <Card><CardHeader><CardTitle>Polished</CardTitle>…</CardHeader></Card>
      <Card><CardHeader><CardTitle>Themeable</CardTitle>…</CardHeader></Card>
    </div>
  </SectionContainer>
</Section>`}
      >
        <Section className="bg-muted/40">
          <SectionContainer>
            <SectionHeader align="center">
              <SectionHeaderText>
                <Badge variant="purple" pill>
                  Features
                </Badge>
                <SectionHeaderHeading>Everything in one system</SectionHeaderHeading>
                <SectionHeaderDescription>
                  One container width, one side padding, one 56px gap to the content below. Every
                  section on the page shares the same rhythm.
                </SectionHeaderDescription>
              </SectionHeaderText>
            </SectionHeader>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card density="comfortable">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-brand/10 text-brand [&>svg]:size-6">
                    <Lightning weight="bold" />
                  </span>
                  <CardTitle>Fast</CardTitle>
                  <CardDescription>From idea to production in a single afternoon.</CardDescription>
                </CardHeader>
              </Card>
              <Card density="comfortable">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-brand/10 text-brand [&>svg]:size-6">
                    <Sparkle weight="bold" />
                  </span>
                  <CardTitle>Polished</CardTitle>
                  <CardDescription>Every component ships feeling finished.</CardDescription>
                </CardHeader>
              </Card>
              <Card density="comfortable">
                <CardHeader>
                  <span className="mb-2 grid size-11 place-items-center rounded-xl bg-brand/10 text-brand [&>svg]:size-6">
                    <Palette weight="bold" />
                  </span>
                  <CardTitle>Themeable</CardTitle>
                  <CardDescription>Four themes from one set of semantic tokens.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </SectionContainer>
        </Section>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="section" />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Section</code> is the full-bleed band;{" "}
          <code className="font-mono text-sm">SectionContainer</code> is the centered gutter. Drop a{" "}
          <a href="/docs/components/section-header" className="underline underline-offset-4">
            SectionHeader
          </a>{" "}
          and your content inside the container, and the 56px gap between them comes for free.
        </p>
        <CodeSnippet
          className="mt-4"
          code={`import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"

export function Features() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <SectionHeaderHeading>Everything in one system</SectionHeaderHeading>
            <SectionHeaderDescription>One rhythm for every section.</SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="grid gap-4 sm:grid-cols-3">{/* content */}</div>
      </SectionContainer>
    </Section>
  )
}`}
        />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          Two parts, one job each.{" "}
          <code className="font-mono text-sm">Section</code> is the band: it owns the vertical
          rhythm (<code className="font-mono text-sm">py-16 sm:py-24</code>) and spans edge to edge,
          so a background tint or image bleeds full-width. <code className="font-mono text-sm">SectionContainer</code>{" "}
          is the gutter: it caps the width, pads <code className="font-mono text-sm">20px</code> on
          the sides (<code className="font-mono text-sm">32px</code> from <code className="font-mono text-sm">sm</code>),
          and stacks its children in a flex column with a <strong>56px gap</strong>{" "}
          (<code className="font-mono text-sm">gap-14</code>). Because the gap lives on the
          container, you never set a header-to-content margin per section again.
        </p>
        <CodeSnippet
          className="mt-4"
          code={`<Section>                {/* full-bleed band — py-16 sm:py-24 */}
  <SectionContainer>     {/* centered gutter — max-w 1440px, px-5 sm:px-8, gap-14 (56px) */}
    <SectionHeader … />  {/* the lede */}
    <YourContent />      {/* lands 56px below the header */}
  </SectionContainer>
</Section>`}
        />
      </DocSection>

      <DocSection title="Container width">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">width</code> caps the content column.{" "}
          <code className="font-mono text-sm">xlarge</code> (default, 1440px) is the marketing
          width; the rest map to Tailwind&apos;s native scale:{" "}
          <code className="font-mono text-sm">wide</code> (1280px),{" "}
          <code className="font-mono text-sm">default</code> (1152px),{" "}
          <code className="font-mono text-sm">narrow</code> (768px) for reading-width content, or{" "}
          <code className="font-mono text-sm">full</code> for an edge-to-edge row. It mirrors{" "}
          <a href="/docs/components/layout" className="underline underline-offset-4">
            LayoutContainer
          </a>
          , so app and marketing shells share one width vocabulary.
        </p>
        <CodeSnippet
          className="mt-4"
          code={`<SectionContainer width="xlarge">…</SectionContainer>  {/* 1440px (default) */}
<SectionContainer width="wide">…</SectionContainer>    {/* 1280px */}
<SectionContainer width="default">…</SectionContainer> {/* 1152px */}
<SectionContainer width="narrow">…</SectionContainer>  {/* 768px  */}
<SectionContainer width="full">…</SectionContainer>    {/* edge to edge */}`}
        />
      </DocSection>

      <DocSection title="Full-bleed band">
        <p className="mt-4 text-pretty text-muted-foreground">
          The band spans the page, so a tint, gradient, or image set on{" "}
          <code className="font-mono text-sm">Section</code> reads edge to edge while the content
          stays in the centered gutter. Override the vertical rhythm with a{" "}
          <code className="font-mono text-sm">className</code> when a section needs to sit tighter
          (it merges last).
        </p>
        <ComponentPreview
          previewClassName="block p-0"
          code={`<Section className="bg-brand/10">
  <SectionContainer>
    <SectionHeader align="center">
      <SectionHeaderText>
        <SectionHeaderHeading>Ship polished products, starting today</SectionHeaderHeading>
        <SectionHeaderDescription>Pay once, and use it forever.</SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button size="lg">Get Koala UI</Button>
        <Button size="lg" variant="outline">Read the docs</Button>
      </SectionHeaderActions>
    </SectionHeader>
  </SectionContainer>
</Section>`}
        >
          <Section className="bg-brand/10">
            <SectionContainer>
              <SectionHeader align="center">
                <SectionHeaderText>
                  <SectionHeaderHeading>Ship polished products, starting today</SectionHeaderHeading>
                  <SectionHeaderDescription>Pay once, and use it forever.</SectionHeaderDescription>
                </SectionHeaderText>
                <SectionHeaderActions>
                  <Button size="lg">Get Koala UI</Button>
                  <Button size="lg" variant="outline">
                    Read the docs
                  </Button>
                </SectionHeaderActions>
              </SectionHeader>
            </SectionContainer>
          </Section>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Section</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The full-bleed band. Renders a{" "}
              <code className="font-mono text-sm">&lt;section&gt;</code> landmark with{" "}
              <code className="font-mono text-sm">py-16 sm:py-24</code> rhythm. Forwards native{" "}
              <code className="font-mono text-sm">&lt;section&gt;</code> props and{" "}
              <code className="font-mono text-sm">className</code> (merged last, so a{" "}
              <code className="font-mono text-sm">bg-*</code> or padding override wins).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SectionContainer</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The centered gutter: caps width per <code className="font-mono text-sm">width</code>{" "}
              (<code className="font-mono text-sm">&quot;xlarge&quot;</code> default,{" "}
              <code className="font-mono text-sm">&quot;wide&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;default&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;narrow&quot;</code>,{" "}
              <code className="font-mono text-sm">&quot;full&quot;</code>), pads 32px on the sides,
              and stacks children in a flex column with a 56px gap. Forwards native{" "}
              <code className="font-mono text-sm">&lt;div&gt;</code> props and{" "}
              <code className="font-mono text-sm">className</code>.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between Section and SectionHeader?",
              a: "They are the two halves of a section. SectionHeader is the lede (eyebrow, heading, description, optional CTA row). Section is the shell around it: the full-bleed band plus the centered gutter that holds the header and the content below it. Use them together.",
            },
            {
              q: "Why is the 56px gap on the container instead of the content?",
              a: "So you never tune a header-to-content margin per section. SectionContainer is a flex column with gap-14 (56px), so dropping a SectionHeader followed by your content yields one canonical gap automatically, and every section on the page matches.",
            },
            {
              q: "How do I make a section full-bleed edge to edge?",
              a: "Set width=\"full\" on SectionContainer to remove the max-width cap, or skip the container entirely and place a full-bleed child directly inside Section. The band itself is always full-width, so background tints set on Section reach the page edges either way.",
            },
            {
              q: "Where does the 1440px width come from?",
              a: "From a --container-8xl token (90rem) added to globals.css, which generates the max-w-8xl utility. It is one step past Tailwind's 7xl (1280px) and is the marketing default; the other widths map to Tailwind's native container scale.",
            },
            {
              q: "Can I use it in a Server Component?",
              a: "Yes. Section and SectionContainer are pure layout with no client state, so they stay server components and drop into RSC marketing pages directly. SectionHeader is a client component, but a server page renders it as a child just fine.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
