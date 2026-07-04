import {
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react/ssr"

import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Button Group",
}

export default function ButtonGroupDocsPage() {
  return (
    <>
      <DocHeader
        title="Button Group"
        description="A set of related buttons arranged as a visual unit. Supports attached (fused pill) and detached (spaced) layouts, with shared variant, size, and density propagated via context."
      />

      <ComponentPreview
        code={`<ButtonGroup>
  <ButtonGroupItem>Day</ButtonGroupItem>
  <ButtonGroupItem>Week</ButtonGroupItem>
  <ButtonGroupItem>Month</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="sm">
  <ButtonGroupItem iconOnly aria-label="Align left">
    <TextAlignLeft />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Align center">
    <TextAlignCenter />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Align right">
    <TextAlignRight />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Justify">
    <TextAlignJustify />
  </ButtonGroupItem>
</ButtonGroup>`}
      >
        <ButtonGroup>
          <ButtonGroupItem>Day</ButtonGroupItem>
          <ButtonGroupItem>Week</ButtonGroupItem>
          <ButtonGroupItem>Month</ButtonGroupItem>
        </ButtonGroup>
        <ButtonGroup size="sm">
          <ButtonGroupItem iconOnly aria-label="Align left">
            <TextAlignLeft weight="bold" />
          </ButtonGroupItem>
          <ButtonGroupItem iconOnly aria-label="Align center">
            <TextAlignCenter weight="bold" />
          </ButtonGroupItem>
          <ButtonGroupItem iconOnly aria-label="Align right">
            <TextAlignRight weight="bold" />
          </ButtonGroupItem>
          <ButtonGroupItem iconOnly aria-label="Justify">
            <TextAlignJustify weight="bold" />
          </ButtonGroupItem>
        </ButtonGroup>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="button-group" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"

export function Example() {
  return (
    <ButtonGroup>
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem>Week</ButtonGroupItem>
      <ButtonGroupItem>Month</ButtonGroupItem>
    </ButtonGroup>
  )
}`}
        />
      </DocSection>

      <DocSection title="Attached vs Detached">
        <p className="mt-4 text-pretty text-muted-foreground">
          By default, <code className="font-mono text-sm">attached</code> fuses buttons into a single
          pill - interior border radii are stripped and the shared 1px border is collapsed via a
          −1px margin overlap. Set{" "}
          <code className="font-mono text-sm">attached={"{false}"}</code> for a spaced layout where
          each button keeps its own rounding.
        </p>
        <ComponentPreview
          code={`{/* Attached (default) */}
<ButtonGroup>
  <ButtonGroupItem>Day</ButtonGroupItem>
  <ButtonGroupItem>Week</ButtonGroupItem>
  <ButtonGroupItem>Month</ButtonGroupItem>
</ButtonGroup>

{/* Detached */}
<ButtonGroup attached={false}>
  <ButtonGroupItem>Day</ButtonGroupItem>
  <ButtonGroupItem>Week</ButtonGroupItem>
  <ButtonGroupItem>Month</ButtonGroupItem>
</ButtonGroup>`}
        >
          <ButtonGroup>
            <ButtonGroupItem>Day</ButtonGroupItem>
            <ButtonGroupItem>Week</ButtonGroupItem>
            <ButtonGroupItem>Month</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup attached={false}>
            <ButtonGroupItem>Day</ButtonGroupItem>
            <ButtonGroupItem>Week</ButtonGroupItem>
            <ButtonGroupItem>Month</ButtonGroupItem>
          </ButtonGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code className="font-mono text-sm">variant</code> prop on{" "}
          <code className="font-mono text-sm">ButtonGroup</code> is inherited by every{" "}
          <code className="font-mono text-sm">ButtonGroupItem</code> inside it. Supports all the
          same variants as <a href="/docs/components/button" className="underline underline-offset-4">Button</a>.
        </p>
        <ComponentPreview
          code={`<ButtonGroup variant="primary">
  <ButtonGroupItem>One</ButtonGroupItem>
  <ButtonGroupItem>Two</ButtonGroupItem>
  <ButtonGroupItem>Three</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup variant="secondary">
  <ButtonGroupItem>One</ButtonGroupItem>
  <ButtonGroupItem>Two</ButtonGroupItem>
  <ButtonGroupItem>Three</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup variant="outline">
  <ButtonGroupItem>One</ButtonGroupItem>
  <ButtonGroupItem>Two</ButtonGroupItem>
  <ButtonGroupItem>Three</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup variant="ghost">
  <ButtonGroupItem>One</ButtonGroupItem>
  <ButtonGroupItem>Two</ButtonGroupItem>
  <ButtonGroupItem>Three</ButtonGroupItem>
</ButtonGroup>`}
          previewClassName="flex-col"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonGroup variant="primary">
              <ButtonGroupItem>One</ButtonGroupItem>
              <ButtonGroupItem>Two</ButtonGroupItem>
              <ButtonGroupItem>Three</ButtonGroupItem>
            </ButtonGroup>
            <ButtonGroup variant="secondary">
              <ButtonGroupItem>One</ButtonGroupItem>
              <ButtonGroupItem>Two</ButtonGroupItem>
              <ButtonGroupItem>Three</ButtonGroupItem>
            </ButtonGroup>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonGroup variant="outline">
              <ButtonGroupItem>One</ButtonGroupItem>
              <ButtonGroupItem>Two</ButtonGroupItem>
              <ButtonGroupItem>Three</ButtonGroupItem>
            </ButtonGroup>
            <ButtonGroup variant="ghost">
              <ButtonGroupItem>One</ButtonGroupItem>
              <ButtonGroupItem>Two</ButtonGroupItem>
              <ButtonGroupItem>Three</ButtonGroupItem>
            </ButtonGroup>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Inherits the same three sizes as Button - <code className="font-mono text-sm">sm</code>{" "}
          (32px), <code className="font-mono text-sm">md</code> (36px, the default), and{" "}
          <code className="font-mono text-sm">lg</code> (40px).
        </p>
        <ComponentPreview
          code={`<ButtonGroup size="sm">
  <ButtonGroupItem>Small</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="md">
  <ButtonGroupItem>Medium</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup size="lg">
  <ButtonGroupItem>Large</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>`}
        >
          <ButtonGroup size="sm">
            <ButtonGroupItem>Small</ButtonGroupItem>
            <ButtonGroupItem>Group</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup size="md">
            <ButtonGroupItem>Medium</ButtonGroupItem>
            <ButtonGroupItem>Group</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup size="lg">
            <ButtonGroupItem>Large</ButtonGroupItem>
            <ButtonGroupItem>Group</ButtonGroupItem>
          </ButtonGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density</code> tightens the group for application UI -
          the same axis as Button and the rest of Koala. Set it per-group or for a whole subtree
          with <code className="font-mono text-sm">DensityProvider</code>. See{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <ComponentPreview
          code={`<ButtonGroup density="comfortable">
  <ButtonGroupItem>Comfortable</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>

<ButtonGroup density="compact">
  <ButtonGroupItem>Compact</ButtonGroupItem>
  <ButtonGroupItem>Group</ButtonGroupItem>
</ButtonGroup>`}
        >
          <ButtonGroup density="comfortable">
            <ButtonGroupItem>Comfortable</ButtonGroupItem>
            <ButtonGroupItem>Group</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup density="compact">
            <ButtonGroupItem>Compact</ButtonGroupItem>
            <ButtonGroupItem>Group</ButtonGroupItem>
          </ButtonGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icon-only">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">iconOnly</code> on each item to collapse it to a
          square. Always pass an <code className="font-mono text-sm">aria-label</code> - Koala warns
          in development if one is missing.
        </p>
        <ComponentPreview
          code={`{/* Alignment toolbar */}
<ButtonGroup size="sm">
  <ButtonGroupItem iconOnly aria-label="Align left">
    <TextAlignLeft />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Align center">
    <TextAlignCenter />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Align right">
    <TextAlignRight />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Justify">
    <TextAlignJustify />
  </ButtonGroupItem>
</ButtonGroup>

{/* Formatting toolbar */}
<ButtonGroup size="sm">
  <ButtonGroupItem iconOnly aria-label="Bold">
    <TextB />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Italic">
    <TextItalic />
  </ButtonGroupItem>
  <ButtonGroupItem iconOnly aria-label="Underline">
    <TextUnderline />
  </ButtonGroupItem>
</ButtonGroup>`}
        >
          <ButtonGroup size="sm">
            <ButtonGroupItem iconOnly aria-label="Align left">
              <TextAlignLeft weight="bold" />
            </ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="Align center">
              <TextAlignCenter weight="bold" />
            </ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="Align right">
              <TextAlignRight weight="bold" />
            </ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="Justify">
              <TextAlignJustify weight="bold" />
            </ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup size="sm">
            <ButtonGroupItem iconOnly aria-label="Bold">
              <TextB weight="bold" />
            </ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="Italic">
              <TextItalic weight="bold" />
            </ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="Underline">
              <TextUnderline weight="bold" />
            </ButtonGroupItem>
          </ButtonGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Per-item overrides">
        <p className="mt-4 text-pretty text-muted-foreground">
          Any prop set directly on a{" "}
          <code className="font-mono text-sm">ButtonGroupItem</code> overrides the group context.
          Mix variants within the same group to give one action more visual weight - keep all items
          the same surface style (both bordered, or both filled) so the joined edges look intentional.
        </p>
        <ComponentPreview
          code={`{/* secondary base + primary confirm - both have a solid fill */}
<ButtonGroup variant="secondary">
  <ButtonGroupItem>Cancel</ButtonGroupItem>
  <ButtonGroupItem variant="primary">Save changes</ButtonGroupItem>
</ButtonGroup>

{/* detached - mixed variants always work when items are separated */}
<ButtonGroup attached={false}>
  <ButtonGroupItem>Discard</ButtonGroupItem>
  <ButtonGroupItem variant="destructive">Delete</ButtonGroupItem>
</ButtonGroup>`}
        >
          <ButtonGroup variant="secondary">
            <ButtonGroupItem>Cancel</ButtonGroupItem>
            <ButtonGroupItem variant="primary">Save changes</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup attached={false}>
            <ButtonGroupItem>Discard</ButtonGroupItem>
            <ButtonGroupItem variant="destructive">Delete</ButtonGroupItem>
          </ButtonGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use a ButtonGroup instead of separate Buttons?", a: "Use ButtonGroup when several related actions read as one unit, like a Day/Week/Month switch or a formatting toolbar. It shares variant, size, and density across items via context and, when attached, fuses them into a single pill. For unrelated actions, keep them as standalone Buttons." },
            { q: "What is the difference between attached and detached?", a: "attached (the default) strips interior border radii and collapses the shared border with a -1px margin overlap so the items look joined. Set attached={false} for a spaced layout where each item keeps its own rounding." },
            { q: "How do I set the variant or size for the whole group?", a: "Set variant, size, or density on the ButtonGroup and every ButtonGroupItem inherits it through context. The group defaults to variant=\"outline\" and size=\"md\"." },
            { q: "Can I override one item's variant?", a: "Yes. Any prop on a ButtonGroupItem overrides the group context, for example a primary confirm next to secondary items. In attached mode keep all items the same surface style (both bordered or both filled) so the joined edges look intentional." },
            { q: "Do icon-only items need anything special?", a: "Set iconOnly on the item to collapse it to a square, and always pass an `aria-label` since there is no visible text. Koala warns in development when an iconOnly item has no accessible name." },
            { q: "Why does the group lose the press-scale animation?", a: "ButtonGroupItem sets active:scale-100 so adjacent fused items do not visually shift against each other on press. The focus ring and z-index lift on hover and focus still signal the active item." },
          ]}
        />
      </DocSection>

    </>
  )
}
