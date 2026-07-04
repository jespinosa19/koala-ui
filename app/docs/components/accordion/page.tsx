import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Accordion",
}

export default function AccordionDocsPage() {
  return (
    <>
      <DocHeader
        title="Accordion"
        description="A stack of disclosure rows built on Radix Accordion: keyboard nav, ARIA, and single or multiple expansion. The height tween rides Koala's motion tokens, and the variant axis spans a flush minimal list to fully contained cards."
      />

      <ComponentPreview
        previewClassName="block"
        code={`<Accordion type="single" collapsible defaultValue="what">
  <AccordionItem value="what">
    <AccordionTrigger>What is Koala UI?</AccordionTrigger>
    <AccordionContent>
      A commercial React component library: polished, token-driven, and
      Radix-backed, built to ship design systems that feel finished on day one.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="themes">
    <AccordionTrigger>How does theming work?</AccordionTrigger>
    <AccordionContent>
      Every color is a semantic token redefined per theme, so all four themes
      (light, dark, cream, and moonlight) re-skin automatically.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="a11y">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Behavior and a11y come from Radix primitives: focus, keyboard, and ARIA are
      handled for you, never hand-rolled.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <div className="mx-auto w-full max-w-xl">
          <Accordion type="single" collapsible defaultValue="what">
            <AccordionItem value="what">
              <AccordionTrigger>What is Koala UI?</AccordionTrigger>
              <AccordionContent>
                A commercial React component library: polished, token-driven, and
                Radix-backed, built to ship design systems that feel finished on day one.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="themes">
              <AccordionTrigger>How does theming work?</AccordionTrigger>
              <AccordionContent>
                Every color is a semantic token redefined per theme, so all four themes
                (light, dark, cream, and moonlight) re-skin automatically.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a11y">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Behavior and a11y come from Radix primitives: focus, keyboard, and ARIA are
                handled for you, never hand-rolled.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="accordion" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section title</AccordionTrigger>
        <AccordionContent>Section body.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three levels of chrome along one axis.{" "}
          <code className="font-mono text-sm">minimal</code> is a flush list of rows split by
          hairlines; <code className="font-mono text-sm">card</code> wraps the set in a single
          bordered surface with dividers; <code className="font-mono text-sm">separated</code>{" "}
          gives every item its own standalone card.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`{/* minimal: borderless, hairline dividers (default) */}
<Accordion type="single" collapsible variant="minimal">…</Accordion>

{/* card: one container, shared dividers */}
<Accordion type="single" collapsible variant="card">…</Accordion>

{/* separated: each item is its own card */}
<Accordion type="single" collapsible variant="separated">…</Accordion>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8">
            {(["minimal", "card", "separated"] as const).map((variant) => (
              <div key={variant}>
                <p className="mb-3 font-mono text-xs text-muted-foreground">{variant}</p>
                <Accordion type="single" collapsible variant={variant} defaultValue="a">
                  <AccordionItem value="a">
                    <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                    <AccordionContent>
                      Yes, plans are month-to-month and you can cancel from billing in two
                      clicks. Access lasts through the period you&apos;ve paid for.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>Do you offer team seats?</AccordionTrigger>
                    <AccordionContent>
                      Every plan includes unlimited seats for your organization at no extra
                      per-user cost.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Single vs. multiple">
        <p className="mt-4 text-pretty text-muted-foreground">
          Radix drives expansion.{" "}
          <code className="font-mono text-sm">type=&quot;single&quot;</code> keeps one row open
          at a time. Add <code className="font-mono text-sm">collapsible</code> to allow
          closing the open row. <code className="font-mono text-sm">type=&quot;multiple&quot;</code>{" "}
          lets several stay open at once.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<Accordion type="multiple" variant="card" defaultValue={["one", "two"]}>
  <AccordionItem value="one">…</AccordionItem>
  <AccordionItem value="two">…</AccordionItem>
  <AccordionItem value="three">…</AccordionItem>
</Accordion>`}
        >
          <div className="mx-auto w-full max-w-xl">
            <Accordion type="multiple" variant="card" defaultValue={["one", "two"]}>
              <AccordionItem value="one">
                <AccordionTrigger>Shipping</AccordionTrigger>
                <AccordionContent>
                  Free worldwide shipping on orders over $50. Most orders arrive in 3–5
                  business days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="two">
                <AccordionTrigger>Returns</AccordionTrigger>
                <AccordionContent>
                  30-day no-questions returns. We email a prepaid label as soon as you start
                  the return.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="three">
                <AccordionTrigger>Warranty</AccordionTrigger>
                <AccordionContent>
                  Every product is covered by a two-year limited warranty against
                  manufacturing defects.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Like Card and Dialog, Accordion honors Koala&apos;s density axis.{" "}
          <code className="font-mono text-sm">comfortable</code> is the spacious marketing
          default; <code className="font-mono text-sm">compact</code> tightens row height and
          inset for dense application UI. Set it per-instance or once via a{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<Accordion type="single" collapsible variant="card" density="compact">…</Accordion>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8 sm:grid-cols-2">
            {(["comfortable", "compact"] as const).map((density) => (
              <div key={density}>
                <p className="mb-3 font-mono text-xs text-muted-foreground">{density}</p>
                <Accordion type="single" collapsible variant="card" density={density} defaultValue="a">
                  <AccordionItem value="a">
                    <AccordionTrigger>Account</AccordionTrigger>
                    <AccordionContent>
                      Manage your profile, email, and password.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>Notifications</AccordionTrigger>
                    <AccordionContent>
                      Choose which events email you.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icon position">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">iconPosition</code> controls where the caret sits.{" "}
          <code className="font-mono text-sm">trailing</code> (the default) pins it to the right
          edge of the row; <code className="font-mono text-sm">leading</code> moves it ahead of
          the label for a help-center / knowledge-base look. The caret still flips on open and
          keeps its ARIA wiring either way.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`{/* trailing: caret on the right (default) */}
<Accordion type="single" collapsible variant="card" iconPosition="trailing">…</Accordion>

{/* leading: caret ahead of the label */}
<Accordion type="single" collapsible variant="card" iconPosition="leading">…</Accordion>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8">
            {(["trailing", "leading"] as const).map((iconPosition) => (
              <div key={iconPosition}>
                <p className="mb-3 font-mono text-xs text-muted-foreground">{iconPosition}</p>
                <Accordion
                  type="single"
                  collapsible
                  variant="card"
                  iconPosition={iconPosition}
                  defaultValue="a"
                >
                  <AccordionItem value="a">
                    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                    <AccordionContent>
                      Open Settings, choose Security, then Reset password. We email a link that
                      stays valid for one hour.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>Can I export my data?</AccordionTrigger>
                    <AccordionContent>
                      Yes. Export to CSV or JSON from the workspace menu at any time, on every
                      plan.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between the minimal, card, and separated variants?",
              a: "They are three points on one chrome axis. `minimal` (the default) is a borderless list of rows split by hairline dividers; `card` wraps the whole set in a single bordered, shadowed surface with shared dividers; `separated` gives every `AccordionItem` its own standalone card stacked with a gap.",
            },
            {
              q: "How do I allow only one row open at a time but still let the user close it?",
              a: "Set `type=\"single\"` to keep one row open at a time, then add the `collapsible` prop so clicking the open row closes it. Without `collapsible`, single mode always keeps one row expanded.",
            },
            {
              q: "When should I use type=\"multiple\" instead of type=\"single\"?",
              a: "Use `type=\"multiple\"` when several sections can be relevant at once, like an FAQ where readers scan many answers. It lets any number of rows stay open, and its initial state is an array (`defaultValue={[\"one\", \"two\"]}`) rather than a single string.",
            },
            {
              q: "Do I need to wire up keyboard navigation or ARIA myself?",
              a: "No. Accordion is built on Radix Accordion, so arrow-key navigation between triggers, Home/End, Space/Enter to toggle, and the heading/region ARIA wiring are all handled. The caret on each `AccordionTrigger` is marked aria-hidden and flips on open via data-state.",
            },
            {
              q: "How do I make the accordion more compact for dense application UI?",
              a: "Pass `density=\"compact\"` to tighten the row height and content inset (`comfortable` is the spacious default). You can set it per instance or once for a subtree via a `DensityProvider`, and the contained variants adjust their horizontal inset to match.",
            },
            {
              q: "Why does my row not show a height animation when it opens?",
              a: "The open/close tween relies on Radix's `--radix-accordion-content-height` variable feeding the accordion-down/up keyframes, so keep your body inside `AccordionContent` rather than restyling the wrapper. Padding lives on an inner div, so add spacing via `AccordionContent` and avoid overriding its overflow-hidden wrapper.",
            },
          ]}
        />
      </DocSection>

    </>
  )
}
