import { GoogleLogo } from "@phosphor-icons/react/ssr"

import { Divider } from "@/components/ui/divider"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { SmartDividerDemo } from "./demos"

export const metadata = {
  title: "Divider",
}

export default function DividerDocsPage() {
  return (
    <>
      <DocHeader
        title="Divider"
        description="A thin rule that separates content, optionally with a centered label. Smart by default: it collapses when it would be orphaned, so a dynamic list never leaves a rule at the edge or floating over an empty state. Stroke styles ride border tokens, and the gradient variant fades a hairline out at both ends, so every form re-themes across all four themes."
      />

      <ComponentPreview
        previewClassName="flex-col items-stretch gap-6"
        code={`<Divider static />
<Divider static variant="dashed" />
<Divider static>OR</Divider>
<Divider static variant="gradient" />`}
      >
        <Divider static />
        <Divider static variant="dashed" />
        <Divider static>OR</Divider>
        <Divider static variant="gradient" />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="divider" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Divider } from "@/components/ui/divider"

export function Example() {
  return (
    <div>
      <p>Above</p>
      <Divider />
      <p>Below</p>
    </div>
  )
}`}
        />
      </DocSection>

      <DocSection title="Smart by default">
        <p className="mt-4 text-pretty text-muted-foreground">
          A divider only earns its space when it actually separates two things. By default it
          auto-collapses when it would be orphaned: at the very start or end of a group, doubled
          against another divider, or stranded next to content that filtered or rendered away. So
          you can drop a <code className="font-mono text-sm">{`<Divider />`}</code> after every row
          without guarding it: a dynamic list never shows a rule at the edge, and the empty state
          stays clean. Toggle the rows below, then flip{" "}
          <code className="font-mono text-sm">static</code> to switch the guarantee off and watch
          the orphaned trailing rule reappear.
        </p>
        <ComponentPreview
          code={`{sections.map((s) =>
  show[s.id] && (
    <Fragment key={s.id}>
      <Row {...s} />
      {/* one after every row; smart-collapse drops the orphans */}
      <Divider />
    </Fragment>
  ),
)}`}
        >
          <SmartDividerDemo />
        </ComponentPreview>
        <p className="mt-4 text-pretty text-muted-foreground">
          The contract is the idiomatic one: absent content renders{" "}
          <code className="font-mono text-sm">null</code> (or carries the{" "}
          <code className="font-mono text-sm">hidden</code> attribute), so a neighbour that is gone
          is gone from the layout too. Where the dividers are the content themselves (a showcase),
          or a leading or trailing rule is intentional, pass{" "}
          <code className="font-mono text-sm">static</code> to opt out.
        </p>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          Four stroke styles. <code className="font-mono text-sm">solid</code>,{" "}
          <code className="font-mono text-sm">dashed</code>, and{" "}
          <code className="font-mono text-sm">dotted</code> ride the{" "}
          <code className="font-mono text-sm">border-*</code> utilities;{" "}
          <code className="font-mono text-sm">gradient</code> fades a hairline out at
          both ends for a softer separation between large surfaces. The gallery pins each rule
          with <code className="font-mono text-sm">static</code> so every stroke shows at once; on
          its own a Divider is smart by default.
        </p>
        <ComponentPreview
          previewClassName="flex-col items-stretch gap-6"
          code={`<Divider static variant="solid" />
<Divider static variant="dashed" />
<Divider static variant="dotted" />
<Divider static variant="gradient" />`}
        >
          <Divider static variant="solid" />
          <Divider static variant="dashed" />
          <Divider static variant="dotted" />
          <Divider static variant="gradient" />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With label">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass children to render a centered label between two lines, ideal for an
          &ldquo;OR&rdquo; separator in auth forms. The label is text or an icon; the
          flanking lines are <code className="font-mono text-sm">aria-hidden</code> so
          the a11y tree still exposes exactly one separator.
        </p>
        <ComponentPreview
          previewClassName="flex-col items-stretch gap-6"
          code={`<Divider static>OR</Divider>
<Divider static variant="dashed">Continue with</Divider>
<Divider static variant="gradient">
  <GoogleLogo /> Google
</Divider>`}
        >
          <Divider static>OR</Divider>
          <Divider static variant="dashed">Continue with</Divider>
          <Divider static variant="gradient">
            <span className="inline-flex items-center gap-1.5">
              <GoogleLogo weight="bold" /> Google
            </span>
          </Divider>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Label position">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">labelPosition</code> sets where the label
          sits. <code className="font-mono text-sm">start</code> and{" "}
          <code className="font-mono text-sm">end</code> drop the line on that side so the
          label hugs the edge.
        </p>
        <ComponentPreview
          previewClassName="flex-col items-stretch gap-6"
          code={`<Divider static labelPosition="start">Start</Divider>
<Divider static labelPosition="center">Center</Divider>
<Divider static labelPosition="end">End</Divider>`}
        >
          <Divider static labelPosition="start">Start</Divider>
          <Divider static labelPosition="center">Center</Divider>
          <Divider static labelPosition="end">End</Divider>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Vertical">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">orientation=&quot;vertical&quot;</code> to
          separate inline content. The divider stretches to the height of its container, so
          place it in a flex row. Vertical dividers don&apos;t take a label.
        </p>
        <ComponentPreview
          code={`<div className="flex h-5 items-center gap-4">
  <span>Docs</span>
  <Divider orientation="vertical" />
  <span>Guides</span>
  <Divider orientation="vertical" variant="dashed" />
  <span>API</span>
  <Divider orientation="vertical" variant="gradient" />
  <span>Blog</span>
</div>`}
        >
          <div className="flex h-5 items-center gap-4 text-sm text-foreground">
            <span>Docs</span>
            <Divider orientation="vertical" />
            <span>Guides</span>
            <Divider orientation="vertical" variant="dashed" />
            <span>API</span>
            <Divider orientation="vertical" variant="gradient" />
            <span>Blog</span>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "What happens to a divider with no content on one side?", a: "By default a Divider is smart: it auto-collapses when it would be orphaned, at the very start or end of its group, doubled against another divider, or stranded next to content that filtered or rendered away. So you can place a divider after every item in a dynamic list and never end with a trailing rule or one floating over an empty state. The contract is the idiomatic one: absent content renders `null` (or carries the `hidden` attribute), so a neighbour that is gone is gone from the layout." },
            { q: "How do I keep a divider that the smart collapse hides?", a: "Pass `static`. It opts the divider out of the auto-collapse so the rule always paints, which is what you want where the dividers are the content themselves (a showcase of stroke styles), or where a leading or trailing rule is intentional." },
            { q: "What is the difference between the gradient variant and the solid, dashed, and dotted ones?", a: "The `solid`, `dashed`, and `dotted` variants ride the `border-*` utilities so they track the `--border` token across themes. The `gradient` variant drops the hard border and paints a one-pixel hairline that fades to transparent at both ends, which reads softer between large surfaces." },
            { q: "How do I add an OR label between two lines?", a: "Pass children to the Divider, for example `<Divider>OR</Divider>`. The label is text or an icon, and the two flanking lines are rendered `aria-hidden` so the accessibility tree still exposes exactly one separator." },
            { q: "What does labelPosition do?", a: "`labelPosition` sets where a label sits: `center` (default) keeps lines on both sides, while `start` and `end` drop the line on that side so the label hugs the edge. It is ignored when there are no children." },
            { q: "Can a vertical divider have a label?", a: "No. Labels are a horizontal-only affordance, so a vertical divider ignores children. Set `orientation=\"vertical\"` and place it inside a flex row, since it stretches to the height of its container." },
            { q: "When should I use the decorative prop?", a: "Pass `decorative` when the rule is purely visual and carries no structural meaning. It swaps the Radix Separator role for `role=\"none\"` so it is removed from the accessibility tree." },
          ]}
        />
      </DocSection>

    </>
  )
}
