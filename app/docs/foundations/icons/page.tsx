import {
  Bell,
  Star,
  Info,
  Check,
  X,
  Warning,
} from "@phosphor-icons/react/ssr"

import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { ScaleRow, Specimen } from "@/components/docs/foundation"
import { CodeSnippet } from "@/components/ui/code-snippet"

export const metadata = { title: "Icons" }

const SIZES = [
  { cls: "size-3",   px: "12px",  note: "tight inline, badge counters" },
  { cls: "size-3.5", px: "14px",  note: "separators, tag icons" },
  { cls: "size-4",   px: "16px",  note: "default - most components" },
  { cls: "size-5",   px: "20px",  note: "emphasis, standalone labels" },
  { cls: "size-6",   px: "24px",  note: "display, empty states" },
]

export default function IconsPage() {
  return (
    <>
      <DocHeader
        title="Icons"
        description="Phosphor Icons - a flexible, MIT-licensed family with 6 weights per glyph and over 1 400 icons. Always import from /ssr in Server Components; the bare import is for 'use client' files only."
      />

      <DocSection title="Import">
        <p className="mt-4 text-pretty text-muted-foreground">
          Phosphor ships two barrels. The <code className="font-mono text-sm">/ssr</code>{" "}
          barrel is tree-shaken and safe to use in any environment - Server Components,
          Edge, Node. The bare <code className="font-mono text-sm">@phosphor-icons/react</code>{" "}
          import registers a React context for the default weight, which requires a client
          boundary. Default to <code className="font-mono text-sm">/ssr</code> everywhere and
          only switch to the bare import inside <code className="font-mono text-sm">&quot;use client&quot;</code>{" "}
          files that need the context API.
        </p>
        <CodeSnippet
          filename="example.tsx"
          className="mt-4"
          code={`// ✓ Server Components and most files - default to this
import { Bell, Star, ArrowRight } from "@phosphor-icons/react/ssr"

// ✓ Client Components that need the context API (e.g. global weight)
"use client"
import { Bell, Star, ArrowRight } from "@phosphor-icons/react"

// ✗ Never import the whole package
import * as Icons from "@phosphor-icons/react"`}
        />
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Icons use Tailwind’s <code className="font-mono text-sm">size-*</code> utility
          (shorthand for <code className="font-mono text-sm">width</code> +{" "}
          <code className="font-mono text-sm">height</code>). Components apply a default of{" "}
          <code className="font-mono text-sm">size-4</code> to any unclassed{" "}
          <code className="font-mono">svg</code> child - only override when the context calls
          for a different size.
        </p>
        <div className="mt-4">
          {SIZES.map((s) => (
            <ScaleRow key={s.cls} name={s.cls} meta={s.px} detail={s.note}>
              <Bell className={`${s.cls} text-foreground`} />
            </ScaleRow>
          ))}
        </div>
      </DocSection>

      <DocSection title="Weights">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Every Phosphor icon ships in six weights. Pass the{" "}
          <code className="font-mono text-sm">weight</code> prop - no separate import
          per style. <code className="font-mono text-sm">bold</code> is the default in
          Koala UI - it holds its weight at small sizes and reads as deliberate next to
          our type. Use <code className="font-mono text-sm">fill</code> for selected /
          active states, and drop to <code className="font-mono text-sm">regular</code> or{" "}
          <code className="font-mono text-sm">light</code> when you want a softer, more
          delicate mark.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-6">
          <Specimen label="thin">
            <Star weight="thin" className="size-8 text-foreground" />
          </Specimen>
          <Specimen label="light">
            <Star weight="light" className="size-8 text-foreground" />
          </Specimen>
          <Specimen label="regular">
            <Star weight="regular" className="size-8 text-foreground" />
          </Specimen>
          <Specimen label="bold">
            <Star weight="bold" className="size-8 text-foreground" />
          </Specimen>
          <Specimen label="fill">
            <Star weight="fill" className="size-8 text-foreground" />
          </Specimen>
          <Specimen label="duotone">
            <Star weight="duotone" className="size-8 text-foreground" />
          </Specimen>
        </div>
        <CodeSnippet
          filename="example.tsx"
          className="mt-6"
          code={`// Pass weight directly - no separate import
<Star weight="bold" />      {/* default */}
<Star weight="fill" />      {/* selected state */}
<Star weight="regular" />   {/* softer, lighter mark */}`}
        />
      </DocSection>

      <DocSection title="Color">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Icons inherit the current text color - set{" "}
          <code className="font-mono text-sm">text-*</code> on the icon or any ancestor.
          Never hardcode a hex value; always use a semantic token so the icon re-themes
          correctly across all four Koala themes.
        </p>
        <div className="mt-6 grid grid-cols-4 gap-x-6 gap-y-8 sm:grid-cols-7">
          <Specimen label="foreground">
            <Bell className="size-6 text-foreground" />
          </Specimen>
          <Specimen label="muted-fg">
            <Bell className="size-6 text-muted-foreground" />
          </Specimen>
          <Specimen label="primary">
            <Bell className="size-6 text-primary" />
          </Specimen>
          <Specimen label="destructive">
            <X className="size-6 text-destructive" />
          </Specimen>
          <Specimen label="success">
            <Check className="size-6 text-success" />
          </Specimen>
          <Specimen label="warning">
            <Warning className="size-6 text-warning" />
          </Specimen>
          <Specimen label="info">
            <Info className="size-6 text-info" />
          </Specimen>
        </div>
      </DocSection>

      <DocSection title="Accessibility">
        <p className="mt-4 text-pretty text-muted-foreground">
          Most icons are decorative - they reinforce meaning already conveyed by adjacent
          text, so screen readers should skip them entirely. Interactive icons (icon-only
          buttons, links) need an accessible label so a keyboard or AT user knows what
          they do.
        </p>
        <CodeSnippet
          filename="a11y.tsx"
          className="mt-4"
          code={`// ✓ Decorative icon alongside text - silence it
<button>
  <ArrowRight aria-hidden />
  Continue
</button>

// ✓ Icon-only - label the interactive element, not the icon
<button aria-label="Go to next step">
  <ArrowRight aria-hidden />
</button>

// ✓ Icon-only with visible tooltip - sr-only is redundant, but keep aria-label
//   so AT users get the label without waiting for the tooltip to appear
<button aria-label="Notifications">
  <Bell aria-hidden />
</button>

// ✗ aria-label on the icon itself - AT reads "Go to next step" then "image"
<button>
  <ArrowRight aria-label="Go to next step" />
</button>`}
        />
      </DocSection>

      <DocSection title="In context">
        <p className="mt-4 text-pretty text-muted-foreground">
          Button, Badge, and Breadcrumb all size icons automatically via{" "}
          <code className="font-mono text-sm">[&_svg]</code> selectors - you rarely need
          to pass a size class when composing with those components.
        </p>
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { ArrowRight, Plus, Check } from "@phosphor-icons/react/ssr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Button sizes the svg to size-4 automatically
<Button><Plus /> New project</Button>
<Button variant="outline">Continue <ArrowRight /></Button>

// Badge sizes the svg to match its own size step
<Badge variant="success"><Check /> Deployed</Badge>`}
        />
      </DocSection>
    </>
  )
}
