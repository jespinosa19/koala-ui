import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { AnimatedNumberDemo, AnimatedNumberCurrencyDemo } from "./demos"

export const metadata = {
  title: "Animated Number",
}

export default function AnimatedNumberDocsPage() {
  return (
    <>
      <DocHeader
        title="Animated Number"
        description="A figure that rolls when it changes: the old value lifts up and out while the new one rises from below into place. Backed by the motion tokens and tabular-nums, so the width never jumps and neighbours stay put. Drop it around any changing number, a cart total, a KPI, a live counter."
      />

      <ComponentPreview
        previewClassName="p-10 sm:p-16"
        code={`const [n, setN] = React.useState(2450)

<AnimatedNumber
  value={n.toLocaleString("en-US")}
  className="text-6xl font-semibold tracking-tight"
/>`}
      >
        <AnimatedNumberDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="animated-number" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { AnimatedNumber } from "@/components/ui/animated-number"

export function Example({ total }: { total: string }) {
  // Whenever \`total\` changes, the old value rolls up and the new rolls in.
  return <AnimatedNumber value={total} className="text-2xl font-semibold" />
}`}
        />
      </DocSection>

      <DocSection title="Currency & formatting">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">value</code> takes whatever you want to display, a
          pre-formatted string is easiest. The container is <code className="font-mono text-sm">tabular-nums</code>,
          so even as the digit count changes the figure keeps a steady width and the layout never
          shifts. Format with <code className="font-mono text-sm">Intl.NumberFormat</code> /{" "}
          <code className="font-mono text-sm">toFixed</code> and pass the result.
        </p>
        <ComponentPreview
          previewClassName="p-10 sm:p-16"
          code={`const money = (c) => "$" + (c / 100).toFixed(2)
const [cents, setCents] = React.useState(3442)

<AnimatedNumber value={money(cents)} className="text-4xl font-semibold" />`}
        >
          <AnimatedNumberCurrencyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="How it works">
        <p className="mt-4 text-pretty text-muted-foreground">
          On each change, the component keeps two layers: the incoming value in normal flow and the
          outgoing value taken out of flow, so the box never widens as the old figure leaves. The two{" "}
          <code className="font-mono text-sm">number-roll-*</code> keyframes (a directional pair, like
          the logo swap) run at <code className="font-mono text-sm">--duration-base</code> and{" "}
          <span className="font-medium">cross-fade on opacity</span> rather than clipping in a window,
          so there are no hard top or bottom edges: the old value lifts up and dissolves while the new
          rises from below and fades in. Both run at once, so they read as a single upward roll, and a
          sub-glyph drift keeps the travel reading as direction, not distance. The first paint never
          animates, and everything holds still under{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code> (the value simply
          swaps).
        </p>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">AnimatedNumber</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Renders a single <code className="font-mono text-sm">&lt;span&gt;</code>. Props:{" "}
              <code className="font-mono text-sm">value</code> (the figure to show, any{" "}
              <code className="font-mono text-sm">ReactNode</code>, usually a formatted string; a
              change triggers the roll), <code className="font-mono text-sm">className</code>{" "}
              (styles the figure, e.g. size / weight / color), plus all{" "}
              <code className="font-mono text-sm">&lt;span&gt;</code> props.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Does it animate on first render?",
              a: "No. The enter roll is gated so the initial paint shows the value at rest; only subsequent changes roll. This keeps a list of numbers from all rolling in at once on page load.",
            },
            {
              q: "Can I animate a currency or a percentage?",
              a: "Yes, pass the fully formatted string as value (e.g. \"$34.42\" or \"98%\"). AnimatedNumber rolls the whole value as one unit and tabular-nums keeps the width stable, so the surrounding layout doesn't shift as the digits change.",
            },
            {
              q: "What happens under reduced motion?",
              a: "The roll is disabled and the value swaps instantly. The animation classes are motion-safe, and the outgoing layer is hidden under prefers-reduced-motion, so nothing lingers.",
            },
            {
              q: "Where does the timing come from?",
              a: "The number-roll-in / number-roll-out keyframes in globals.css, applied under a prefers-reduced-motion query and built on --duration-base and --ease-out. There are no raw durations or easings in the component, so retuning the motion is a one-line change in the token layer.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
