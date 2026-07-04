import {
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  Confetti,
  GitBranch,
  GitPullRequest,
  Lightning,
  Lock,
  Minus,
  Package,
  Rocket,
  Star,
  Tag,
  X,
} from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { DismissibleDemo } from "./dismissible-demo"

export const metadata = {
  title: "Badge",
}

export default function BadgeDocsPage() {
  return (
    <>
      <DocHeader
        title="Badge"
        description="A compact label for status, counts, and categories. Single-element like Button; status variants are soft tints derived from semantic tokens, so they re-theme everywhere."
      />

      <ComponentPreview
        code={`<Badge variant="success" dot pill>Online</Badge>
<Badge variant="purple" pill><Lightning /> Beta</Badge>
<Badge variant="info" pill>v2.4.0</Badge>
<Badge variant="outline"><GitBranch /> main</Badge>`}
      >
        <Badge variant="success" dot pill>
          Online
        </Badge>
        <Badge variant="purple" pill>
          <Lightning weight="bold" /> Beta
        </Badge>
        <Badge variant="info" pill>
          v2.4.0
        </Badge>
        <Badge variant="outline">
          <GitBranch weight="bold" /> main
        </Badge>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="badge" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Badge } from "@/components/ui/badge"

export function Example() {
  return <Badge>New</Badge>
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <ComponentPreview
          code={`<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>`}
        >
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Status">
        <p className="mt-4 text-pretty text-muted-foreground">
          Soft status variants pair a tinted background (the status hue at{" "}
          <code className="font-mono text-sm">/10</code>) with a darker text counterpart and
          no border, so the fill carries the color while the label stays legible. Both derive
          from one semantic token (<code className="font-mono text-sm">--success</code>,{" "}
          <code className="font-mono text-sm">--warning</code>,{" "}
          <code className="font-mono text-sm">--info</code>), so they re-theme across all
          four themes.
        </p>
        <ComponentPreview
          code={`<Badge variant="success"><CheckCircle weight="fill" /> Approved</Badge>
<Badge variant="success"><Confetti /> Merged</Badge>
<Badge variant="info"><GitPullRequest /> In review</Badge>
<Badge variant="warning"><Clock weight="fill" /> Pending</Badge>
<Badge variant="destructive"><X /> Failed</Badge>
<Badge variant="secondary"><CircleNotch className="animate-spin motion-reduce:animate-none" /> Running</Badge>
<Badge variant="default"><Minus /> Skipped</Badge>`}
        >
          <Badge variant="success">
            <CheckCircle weight="fill" /> Approved
          </Badge>
          <Badge variant="success">
            <Confetti weight="bold" /> Merged
          </Badge>
          <Badge variant="info">
            <GitPullRequest weight="bold" /> In review
          </Badge>
          <Badge variant="warning">
            <Clock weight="bold" /> Pending
          </Badge>
          <Badge variant="destructive">
            <X weight="bold" /> Failed
          </Badge>
          <Badge variant="secondary">
            <CircleNotch weight="bold" className="animate-spin motion-reduce:animate-none" /> Running
          </Badge>
          <Badge variant="default">
            <Minus weight="bold" /> Skipped
          </Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Categorical">
        <p className="mt-4 text-pretty text-muted-foreground">
          Four extra hues for labeling categories, feature flags, and tags. All follow the
          same soft-tint pattern and re-theme across all four themes.
        </p>
        <ComponentPreview
          code={`<Badge variant="purple"><Lightning /> Beta</Badge>
<Badge variant="purple"><Rocket /> New</Badge>
<Badge variant="pink"><Star /> Featured</Badge>
<Badge variant="pink"><Tag /> Design</Badge>
<Badge variant="teal">Engineering</Badge>
<Badge variant="teal">Frontend</Badge>
<Badge variant="orange">Deprecated</Badge>
<Badge variant="orange"><Package /> v1 Legacy</Badge>`}
        >
          <Badge variant="purple">
            <Lightning weight="bold" /> Beta
          </Badge>
          <Badge variant="purple">
            <Rocket weight="bold" /> New
          </Badge>
          <Badge variant="pink">
            <Star weight="bold" /> Featured
          </Badge>
          <Badge variant="pink">
            <Tag weight="bold" /> Design
          </Badge>
          <Badge variant="teal">Engineering</Badge>
          <Badge variant="teal">Frontend</Badge>
          <Badge variant="orange">Deprecated</Badge>
          <Badge variant="orange">
            <Package weight="bold" /> v1 Legacy
          </Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With dot">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code className="font-mono text-sm">dot</code> prop adds a leading status
          dot in the variant color - ideal for presence and at-a-glance state. The
          background is stripped so only the dot carries the color.
        </p>
        <ComponentPreview
          code={`<Badge variant="success" dot>Online</Badge>
<Badge variant="warning" dot>Away</Badge>
<Badge variant="destructive" dot>Busy</Badge>
<Badge variant="default" dot>Offline</Badge>
<Badge variant="info" dot>In a call</Badge>
<Badge variant="purple" dot>Focused</Badge>
<Badge variant="teal" dot>On break</Badge>
<Badge variant="pink" dot>Do not disturb</Badge>`}
        >
          <Badge variant="success" dot>Online</Badge>
          <Badge variant="warning" dot>Away</Badge>
          <Badge variant="destructive" dot>Busy</Badge>
          <Badge variant="default" dot>Offline</Badge>
          <Badge variant="info" dot>In a call</Badge>
          <Badge variant="purple" dot>Focused</Badge>
          <Badge variant="teal" dot>On break</Badge>
          <Badge variant="pink" dot>Do not disturb</Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <ComponentPreview
          code={`<Badge variant="success" size="sm" dot>Online</Badge>
<Badge variant="success" size="md" dot>Online</Badge>
<Badge variant="success" size="lg" dot>Online</Badge>
<Badge variant="info" size="sm" pill>v2.4.0</Badge>
<Badge variant="info" size="md" pill>v2.4.0</Badge>
<Badge variant="info" size="lg" pill>v2.4.0</Badge>`}
        >
          <Badge variant="success" size="sm" dot>Online</Badge>
          <Badge variant="success" size="md" dot>Online</Badge>
          <Badge variant="success" size="lg" dot>Online</Badge>
          <Badge variant="info" size="sm" pill>v2.4.0</Badge>
          <Badge variant="info" size="md" pill>v2.4.0</Badge>
          <Badge variant="info" size="lg" pill>v2.4.0</Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Pill">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">pill</code> for fully rounded edges -
          pairs well with dot and icon badges.
        </p>
        <ComponentPreview
          code={`<Badge pill>Default</Badge>
<Badge variant="success" pill dot>Online</Badge>
<Badge variant="purple" pill><Lightning /> Beta</Badge>
<Badge variant="info" pill>v2.4.0</Badge>`}
        >
          <Badge pill>Default</Badge>
          <Badge variant="success" pill dot>
            Online
          </Badge>
          <Badge variant="purple" pill>
            <Lightning weight="bold" /> Beta
          </Badge>
          <Badge variant="info" pill>
            v2.4.0
          </Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With icon">
        <ComponentPreview
          code={`<Badge variant="success"><Check /> Verified</Badge>
<Badge variant="purple"><Lightning /> Beta</Badge>
<Badge variant="orange"><Rocket /> New</Badge>
<Badge variant="info"><Star /> Featured</Badge>
<Badge variant="outline"><Lock /> Private</Badge>
<Badge variant="outline"><GitBranch /> feature/auth</Badge>`}
        >
          <Badge variant="success">
            <Check weight="bold" /> Verified
          </Badge>
          <Badge variant="purple">
            <Lightning weight="bold" /> Beta
          </Badge>
          <Badge variant="orange">
            <Rocket weight="bold" /> New
          </Badge>
          <Badge variant="info">
            <Star weight="bold" /> Featured
          </Badge>
          <Badge variant="outline">
            <Lock weight="bold" /> Private
          </Badge>
          <Badge variant="outline">
            <GitBranch weight="bold" /> feature/auth
          </Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dismissible">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">onRemove</code> to render a trailing
          dismiss button. Give each a descriptive{" "}
          <code className="font-mono text-sm">removeLabel</code> for screen readers.
        </p>
        <ComponentPreview
          code={`<Badge
  variant="secondary"
  pill
  onRemove={() => remove(tag)}
  removeLabel={\`Remove \${tag}\`}
>
  {tag}
</Badge>`}
        >
          <DismissibleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="As child">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code className="font-mono text-sm">asChild</code> to render the badge
          styles on another element - e.g. a link - via Radix Slot.
        </p>
        <ComponentPreview
          code={`<Badge asChild variant="info">
  <a href="/changelog">What's new</a>
</Badge>`}
        >
          <Badge asChild variant="info">
            <a href="/changelog">What&apos;s new</a>
          </Badge>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I use a Badge instead of a Button?",
              a: "A Badge labels: it states status, a count, or a category and is not meant to be clicked. A Button performs an action. If a user is expected to interact, reach for Button (or a chip with an explicit control). The exception is asChild, which lets the badge styling wrap a link.",
            },
            {
              q: "What's the difference between the dot and the soft status variants?",
              a: "Both read from the same semantic token. The soft variant tints a background plus text; adding the dot prop strips the background so only a small colored dot carries the state, ideal for presence indicators and dense lists where a full tinted pill would be too heavy.",
            },
            {
              q: "How do I make a dismissible tag?",
              a: "Pass an onRemove handler to render a trailing dismiss button, and always give a descriptive removeLabel (e.g. `Remove Design`) so screen readers announce what is being removed. pill pairs well with removable tags.",
            },
            {
              q: "Can I put a Badge inside a link or another element?",
              a: "Yes: set asChild and pass a single child element (an <a>, for instance). The badge renders its styles onto that element via Radix Slot instead of emitting its own <span>, so you keep valid markup.",
            },
            {
              q: "Will the colors adapt to dark and the other themes?",
              a: "Yes. Every variant, including the categorical hues, derives from semantic tokens, so badges re-theme automatically across light, dark, cream, and moonlight. Avoid hard-coding a palette color if you want that behavior.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
