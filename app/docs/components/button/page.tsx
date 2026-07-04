import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  DownloadSimple,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react/ssr"

import { Button, SocialButton, SOCIAL_PROVIDER_IDS } from "@/components/ui/button"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Button",
}

function IconSideCard({
  verdict,
  label,
  caption,
  children,
}: {
  verdict: "do" | "dont"
  label: string
  caption: string
  children: React.ReactNode
}) {
  const isDo = verdict === "do"
  return (
    <div
      className={cn(
        "rounded-2xl border",
        isDo ? "border-border" : "border-destructive/30",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-3.5">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            isDo ? "bg-emerald-500" : "bg-destructive",
          )}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div
        className={cn(
          "mx-2 flex min-h-40 items-center justify-center overflow-hidden rounded-lg p-8 shadow-inner",
          isDo ? "bg-muted/50" : "bg-destructive/5",
        )}
      >
        {children}
      </div>
      <p className="px-4 py-3 text-pretty text-sm text-muted-foreground">
        {caption}
      </p>
    </div>
  )
}

export default function ButtonDocsPage() {
  return (
    <>
      <DocHeader
        title="Button"
        description="Triggers an action or event. The reference single-element component: one tv recipe, Radix Slot for asChild, semantic tokens only."
      />

      <ComponentPreview
        code={`<Button>
  <Plus /> New project
</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Learn more</Button>`}
      >
        <Button>
          <Plus weight="bold" /> New project
        </Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Learn more</Button>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="button" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Button } from "@/components/ui/button"

export function Example() {
  return <Button>Click me</Button>
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <ComponentPreview
          code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="destructiveGhost">Destructive ghost</Button>
<Button variant="link">Link</Button>
<Button loading>Loading</Button>`}
        >
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructiveGhost">Destructive ghost</Button>
          <Button variant="link">Link</Button>
          <Button loading>Loading</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three sizes on a 4px grid - <code className="font-mono text-sm">sm</code> (32px),{" "}
          <code className="font-mono text-sm">md</code> (36px, the default), and{" "}
          <code className="font-mono text-sm">lg</code> (40px). The label stays{" "}
          <code className="font-mono text-sm">text-sm</code> across the scale; only height,
          padding, and the icon gap step up - so a larger button reads as the same control
          with more presence, not bigger text.
        </p>
        <ComponentPreview
          code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
        >
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Height always comes from <code className="font-mono text-sm">size</code>, never from
          density. <code className="font-mono text-sm">density</code> only picks the{" "}
          <em>default</em> size for a subtree - a compact app shell defaults buttons to{" "}
          <code className="font-mono text-sm">sm</code>, a comfortable one to{" "}
          <code className="font-mono text-sm">md</code> - so you tune a whole screen from one
          place while an explicit <code className="font-mono text-sm">size</code> on any button
          always wins. The two below show those defaults (comfortable md vs compact sm); a
          pseudo-element holds the smaller button at a hit target of ≥40px. Set it per-button or for a
          whole subtree with <code className="font-mono text-sm">DensityProvider</code> - see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <ComponentPreview
          code={`<Button density="comfortable">Comfortable</Button>
<Button density="compact">Compact</Button>`}
        >
          <Button density="comfortable">Comfortable</Button>
          <Button density="compact">Compact</Button>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icons">
        <p className="mt-4 text-pretty text-muted-foreground">
          Icons are composed as children, not props - the recipe sizes any{" "}
          <code className="font-mono text-sm">svg</code> to{" "}
          <code className="font-mono text-sm">size-4</code> and a{" "}
          <code className="font-mono text-sm">gap</code> spaces it from the label. Put the icon
          before or after the text to place it <strong>left</strong> or{" "}
          <strong>right</strong>. A button carrying an icon trims its horizontal padding one
          step (<code className="font-mono text-sm">has-[&gt;svg]:px-*</code>) - an icon reads
          lighter than a text edge, so this keeps it optically balanced. For an{" "}
          <strong>icon-only</strong> button set{" "}
          <code className="font-mono text-sm">iconOnly</code> - it collapses to a square at any
          size - and always pass an <code className="font-mono text-sm">aria-label</code>, since
          there is no visible text. Koala warns in development if an{" "}
          <code className="font-mono text-sm">iconOnly</code> button has no accessible name.
        </p>

        <h3 className="mt-8 text-lg font-semibold tracking-tight">Left or right: a UX rule</h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          Placement is not decorative. In left-to-right reading the eye lands on the start of the
          button and leaves at the end, so each side has a different job: a{" "}
          <strong className="text-foreground">leading</strong> icon identifies the action, a{" "}
          <strong className="text-foreground">trailing</strong> icon signals where it goes.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <IconSideCard
            verdict="do"
            label="Leading - identifies the action"
            caption="Read before the label, the icon says what kind of action this is and doubles as a scannable anchor. The default, and right for actions that operate on something: add, download, delete, search."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button>
                <Plus weight="bold" /> New project
              </Button>
              <Button variant="outline">
                <DownloadSimple weight="bold" /> Download
              </Button>
              <Button variant="destructive">
                <Trash weight="bold" /> Delete
              </Button>
              <Button variant="secondary">
                <MagnifyingGlass weight="bold" /> Search
              </Button>
            </div>
          </IconSideCard>

          <IconSideCard
            verdict="do"
            label="Trailing - signals what comes next"
            caption="Sitting where the eye exits the label, a trailing icon should point onward rather than name the action. Reserve it for forward navigation, disclosure chevrons, and links that leave the page."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button>
                Continue <ArrowRight weight="bold" />
              </Button>
              <Button variant="outline">
                Sort by <CaretDown weight="bold" />
              </Button>
              <Button variant="ghost">
                Open docs <ArrowUpRight weight="bold" />
              </Button>
            </div>
          </IconSideCard>
        </div>

        <div className="mt-4">
          <IconSideCard
            verdict="dont"
            label="Don't - an icon on both sides"
            caption="Flanking the label with two icons splits the focal point: the leading glyph names the action, the trailing one points elsewhere, and the button reads as two competing ideas. Pick the single side that matches the intent."
          >
            <Button>
              <Plus weight="bold" /> Add item <ArrowRight weight="bold" />
            </Button>
          </IconSideCard>
        </div>

        <p className="mt-5 text-pretty text-muted-foreground">
          One nuance overrides the default: keep the icon on the side that matches its{" "}
          <em>meaning</em>. A back-arrow belongs on the left because it points the way the action
          travels, even though most icons lead. When unsure, lead with the icon.
        </p>
        <ComponentPreview
          code={`{/* Icon left */}
<Button>
  <Plus /> New project
</Button>

{/* Icon right */}
<Button variant="outline">
  Continue <ArrowRight />
</Button>

{/* No icon */}
<Button variant="secondary">Save</Button>

{/* Icon only */}
<Button iconOnly aria-label="Add">
  <Plus />
</Button>`}
        >
          <Button>
            <Plus weight="bold" /> New project
          </Button>
          <Button variant="outline">
            Continue <ArrowRight weight="bold" />
          </Button>
          <Button variant="secondary">Save</Button>
          <Button iconOnly aria-label="Add">
            <Plus weight="bold" />
          </Button>
        </ComponentPreview>

        <h3 className="mt-10 text-lg font-semibold tracking-tight">Attached to the label, not the edge</h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          The icon rides directly beside the label, and the pair centers together as one unit. This
          matters most on <strong className="text-foreground">full-width</strong> buttons - form
          submits, social sign-in, mobile CTAs - where pinning the icon to the button&apos;s edge
          opens a gap that strands the mark away from the text it belongs to.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <IconSideCard
            verdict="do"
            label="Attached - reads as one unit"
            caption="The mark sits next to the label and the group centers together, so the icon stays glued to the action even when the button stretches full-width."
          >
            <div className="w-full max-w-xs">
              <Button size="lg" className="w-full">
                <DownloadSimple weight="bold" /> Download for macOS
              </Button>
            </div>
          </IconSideCard>

          <IconSideCard
            verdict="dont"
            label="Don't - pinned to the edge"
            caption="Anchoring the icon to the far edge while the label centers splits the two apart: a gap opens across the button and the mark looks stranded, disconnected from what it labels."
          >
            <div className="w-full max-w-xs">
              <Button size="lg" className="relative w-full">
                <DownloadSimple weight="bold" className="absolute left-4" /> Download for macOS
              </Button>
            </div>
          </IconSideCard>
        </div>
      </DocSection>

      <DocSection title="Social buttons">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SocialButton</code> is a sign-in button carrying a
          real brand logo - the authentic marks, not icon-style approximations. It wraps{" "}
          <code className="font-mono text-sm">Button</code>, so every size, density, the press
          scale, loading, and the icon-only tooltip all carry over. Pass a{" "}
          <code className="font-mono text-sm">provider</code> and it supplies the logo and the
          default <em>Continue with…</em> label.
        </p>
        <ComponentPreview
          code={`<SocialButton provider="google" />
<SocialButton provider="apple" />
<SocialButton provider="github" />
<SocialButton provider="figma" />
<SocialButton provider="x" />`}
        >
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
          <SocialButton provider="github" />
          <SocialButton provider="figma" />
          <SocialButton provider="x" />
        </ComponentPreview>

        <h3 className="mt-8 text-lg font-semibold tracking-tight">Solid</h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">appearance=&quot;solid&quot;</code> fills the button
          with the provider&apos;s official color and flattens the logo to white - for a single
          dominant choice or a brand-forward row.
        </p>
        <ComponentPreview
          code={`<SocialButton provider="discord" appearance="solid" />
<SocialButton provider="google" appearance="solid" />
<SocialButton provider="slack" appearance="solid" />
<SocialButton provider="spotify" appearance="solid" />`}
        >
          <SocialButton provider="discord" appearance="solid" />
          <SocialButton provider="google" appearance="solid" />
          <SocialButton provider="slack" appearance="solid" />
          <SocialButton provider="spotify" appearance="solid" />
        </ComponentPreview>

        <h3 className="mt-8 text-lg font-semibold tracking-tight">Icon only</h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">iconOnly</code> for a square logo button - the
          provider name becomes the <code className="font-mono text-sm">aria-label</code> and the
          hover tooltip. Every supported provider:
        </p>
        <ComponentPreview
          code={`{SOCIAL_PROVIDER_IDS.map((id) => (
  <SocialButton key={id} provider={id} iconOnly />
))}`}
        >
          {SOCIAL_PROVIDER_IDS.map((id) => (
            <SocialButton key={id} provider={id} iconOnly />
          ))}
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview
          code={`<Button disabled>Disabled</Button>
<Button variant="outline" disabled>Disabled</Button>`}
        >
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Loading">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">loading</code> shows a spinner and marks the
          button busy (<code className="font-mono text-sm">aria-busy</code>) while an action is
          in flight. The label is hidden but its space is reserved, so the button never reflows;
          it&apos;s also disabled so it can&apos;t be re-triggered. The spinner respects{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code>.
        </p>
        <ComponentPreview
          code={`<Button loading>Saving</Button>
<Button variant="outline" loading>Saving</Button>
<Button loading iconOnly aria-label="Saving" />`}
        >
          <Button loading>Saving</Button>
          <Button variant="outline" loading>
            Saving
          </Button>
          <Button loading iconOnly aria-label="Saving" />
        </ComponentPreview>
      </DocSection>

      <DocSection title="As child">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code className="font-mono text-sm">asChild</code> to render the
          button styles on a different element - e.g. a Next.js{" "}
          <code className="font-mono text-sm">Link</code> - via Radix Slot, with no
          extra wrapper.
        </p>
        <ComponentPreview
          code={`<Button asChild>
  <a href="/docs">Documentation</a>
</Button>`}
        >
          <Button asChild>
            <a href="/docs">Documentation</a>
          </Button>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use variant=\"link\" instead of a plain anchor?", a: "Reach for variant=\"link\" when a text action lives inline among other buttons and should share their focus ring and press behavior. For real navigation, pair it with asChild so the styles wrap an actual `<a>` or Next.js Link and the element stays a link." },
            { q: "What does iconOnly do beyond hiding the label?", a: "It collapses the button to a square that tracks the active size and zeroes the label padding and gap so the glyph optically centers. It also auto-wraps the button in a Tooltip from your `aria-label`, and Koala warns in development if no accessible name is present." },
            { q: "How is loading different from disabled?", a: "loading shows a centered spinner, sets `aria-busy`, and disables the button so it cannot be re-triggered, while reserving the label's space so the width never reflows. Plain disabled just greys it out with no spinner or busy state." },
            { q: "Why does my asChild button ignore the loading prop?", a: "Radix Slot expects a single child, so a sibling spinner would break it. Under asChild the rendered child owns its content, and loading is intentionally a no-op there." },
            { q: "How do I tighten buttons for a dense app shell without setting density on each one?", a: "Wrap the subtree in a DensityProvider set to compact. Button reads the density context and defaults every unsized button to sm (comfortable defaults to md), while a pseudo-element keeps the smaller hit target at least 40px. Density only sets the default size - an explicit size on a button always wins, and height never comes from density." },
            { q: "How do I opt out of the press animation?", a: "Pass the `static` prop, which neutralizes the active:scale press effect for places where the motion would distract." },
          ]}
        />
      </DocSection>

    </>
  )
}
