import { ArrowUp, Command, Option } from "@phosphor-icons/react/ssr"

import { Kbd } from "@/components/ui/kbd"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Kbd",
}

export default function KbdDocsPage() {
  return (
    <>
      <DocHeader
        title="Kbd"
        description="A keyboard key indicator for documenting shortcuts. Renders a native <kbd>; the default variant is a flat outline cap (hairline border, transparent fill, no shadow) that re-themes everywhere. Compose combos by placing several side by side."
      />

      <ComponentPreview
        code={`<Kbd><Command /></Kbd>
<Kbd>K</Kbd>
<Kbd variant="outline">Esc</Kbd>
<Kbd variant="solid">⏎ Enter</Kbd>`}
      >
        <Kbd>
          <Command weight="bold" />
        </Kbd>
        <Kbd>K</Kbd>
        <Kbd variant="outline">Esc</Kbd>
        <Kbd variant="solid">⏎ Enter</Kbd>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="kbd" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Kbd } from "@/components/ui/kbd"

export function Example() {
  return <Kbd>Esc</Kbd>
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">default</code> is a flat outline cap (hairline
          border, transparent fill, no shadow),{" "}
          <code className="font-mono text-sm">soft</code> is a filled chip, borderless and
          flat, for shortcuts that sit inside another tinted surface (a tooltip
          or menu row) where a bordered cap reads as a competing outline,{" "}
          <code className="font-mono text-sm">outline</code> is an explicit alias of that same
          flat cap, for naming the treatment on purpose in dense inline help,{" "}
          <code className="font-mono text-sm">solid</code> inverts for
          high-contrast callouts, and <code className="font-mono text-sm">ghost</code> drops
          the cap entirely: just the muted glyph, for ⌘K hints inside a button or input where
          a raised key would read as a second control.
        </p>
        <ComponentPreview
          code={`<Kbd variant="default">K</Kbd>
<Kbd variant="soft">K</Kbd>
<Kbd variant="outline">K</Kbd>
<Kbd variant="solid">K</Kbd>
<Kbd variant="ghost">K</Kbd>`}
        >
          <Kbd variant="default">K</Kbd>
          <Kbd variant="soft">K</Kbd>
          <Kbd variant="outline">K</Kbd>
          <Kbd variant="solid">K</Kbd>
          <Kbd variant="ghost">K</Kbd>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <ComponentPreview
          code={`<Kbd size="sm">⇧</Kbd>
<Kbd size="md">⇧</Kbd>
<Kbd size="lg">⇧</Kbd>`}
        >
          <Kbd size="sm">⇧</Kbd>
          <Kbd size="md">⇧</Kbd>
          <Kbd size="lg">⇧</Kbd>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Combinations">
        <p className="mt-4 text-pretty text-muted-foreground">
          Kbd is a single key by design. Build a shortcut by placing several side by side
          in an <code className="font-mono text-sm">inline-flex</code> row, and each key keeps
          its own cap.
        </p>
        <ComponentPreview
          code={`<span className="inline-flex items-center gap-1">
  <Kbd><Command /></Kbd>
  <Kbd><ArrowUp /></Kbd>
  <Kbd>P</Kbd>
</span>
<span className="inline-flex items-center gap-1">
  <Kbd><Option /></Kbd>
  <Kbd>Tab</Kbd>
</span>`}
        >
          <span className="inline-flex items-center gap-1">
            <Kbd>
              <Command weight="bold" />
            </Kbd>
            <Kbd>
              <ArrowUp weight="bold" />
            </Kbd>
            <Kbd>P</Kbd>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>
              <Option weight="bold" />
            </Kbd>
            <Kbd>Tab</Kbd>
          </span>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inline">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a key straight into running text. The <code className="font-mono text-sm">outline</code>{" "}
          variant sits quietly inside a sentence.
        </p>
        <ComponentPreview
          code={`<p>Press <Kbd variant="outline" size="sm">⌘</Kbd>{" "}
<Kbd variant="outline" size="sm">K</Kbd> to open the command menu.</p>`}
        >
          <p className="text-pretty text-foreground">
            Press <Kbd variant="outline" size="sm">⌘</Kbd>{" "}
            <Kbd variant="outline" size="sm">K</Kbd> to open the command menu.
          </p>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I render a multi-key shortcut like Cmd+K?", a: "Kbd is one key by design, so place several side by side in an `inline-flex` row: each `Kbd` keeps its own cap. There is no combo prop." },
            { q: "Which variant should I use for a hint inside a button or input?", a: "Use `variant=\"ghost\"`. It drops the keycap box entirely and renders just the muted glyph, so it does not read as a second, competing control next to the one it sits inside." },
            { q: "Why does Kbd render a native <kbd> element?", a: "So it carries the correct semantics for assistive tech and document outlines. It is a single styled element with one `tv` recipe, like Badge." },
            { q: "When would I use the outline variant?", a: "Use `variant=\"outline\"` for keys dropped into running text: it is a flat hairline with a transparent fill, so it sits quietly inside a sentence rather than reading as a raised cap." },
            { q: "Can I wrap another element as the key?", a: "Yes. Pass `asChild` and Kbd renders your child as the key via Radix Slot, merging the keycap styling onto it instead of emitting its own `<kbd>`." },
            { q: "Does Kbd re-theme automatically?", a: "Yes. It uses semantic tokens only (`border-border`, `text-muted-foreground`, and a transparent fill by default), so the cap stays legible across all themes with no per-theme overrides." },
          ]}
        />
      </DocSection>

    </>
  )
}
