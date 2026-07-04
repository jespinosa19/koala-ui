import { ArrowUpRight } from "@phosphor-icons/react/ssr"

import { Link } from "@/components/ui/link"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Link",
}

export default function LinkDocsPage() {
  return (
    <>
      <DocHeader
        title="Link"
        description="The standalone text link for UI chrome: contact rows, directory cards, footer columns, meta rows. It rests at full-strength text and warms to the brand accent on hover, distinct from the blue inline-prose hyperlink. Single-element like Button, with asChild to wrap next/link."
      />

      <ComponentPreview
        code={`<Link href="#">hello@koalaui.com</Link>
<Link href="#" variant="muted">Documentation</Link>
<Link href="#" underline>Read the changelog</Link>
<Link href="#">Open in a new tab <ArrowUpRight /></Link>`}
      >
        <Link href="#">hello@koalaui.com</Link>
        <Link href="#" variant="muted">
          Documentation
        </Link>
        <Link href="#" underline>
          Read the changelog
        </Link>
        <Link href="#">
          Open in a new tab <ArrowUpRight weight="bold" />
        </Link>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="link" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Link } from "@/components/ui/link"

export function Example() {
  return <Link href="/pricing">See pricing</Link>
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">default</code> rests at{" "}
          <code className="font-mono text-sm">text-foreground</code> (full-strength, reads as a
          real label); <code className="font-mono text-sm">muted</code> starts quiet for a value in
          a directory or a footer link. Both lift to the brand accent on hover.
        </p>
        <ComponentPreview
          code={`<Link href="#" variant="default">Full-strength link</Link>
<Link href="#" variant="muted">Muted link</Link>`}
        >
          <Link href="#" variant="default">
            Full-strength link
          </Link>
          <Link href="#" variant="muted">
            Muted link
          </Link>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Underline">
        <p className="mt-4 text-pretty text-muted-foreground">
          The color shift carries the affordance in context, so the link is not underlined by
          default. Pass <code className="font-mono text-sm">underline</code> for a prose-like link
          that must read as underlined at rest.
        </p>
        <ComponentPreview
          code={`<Link href="#">No underline</Link>
<Link href="#" underline>Underlined at rest</Link>`}
        >
          <Link href="#">No underline</Link>
          <Link href="#" underline>
            Underlined at rest
          </Link>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With an icon">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a trailing glyph (a directional arrow for an outbound or routing link) beside the
          label. It reads as a hover affordance, so it stays hidden at rest and slides and fades in
          when the link is hovered or keyboard-focused, warming to brand with the text. The motion
          is a plain CSS transition (interruptible), and it collapses to an instant reveal under{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code>.
        </p>
        <ComponentPreview
          code={`<Link href="#">View the docs <ArrowUpRight /></Link>`}
        >
          <Link href="#">
            View the docs <ArrowUpRight weight="bold" />
          </Link>
        </ComponentPreview>
      </DocSection>

      <DocSection title="As child">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code className="font-mono text-sm">asChild</code> to render the link styles onto
          another element, e.g. Next.js&apos;s <code className="font-mono text-sm">Link</code>, via
          Radix Slot, so you keep client-side routing.
        </p>
        <CodeSnippet
          filename="as-child.tsx"
          className="mt-4"
          code={`import NextLink from "next/link"
import { Link } from "@/components/ui/link"

export function Example() {
  return (
    <Link asChild>
      <NextLink href="/pricing">See pricing</NextLink>
    </Link>
  )
}`}
        />
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When do I use Link instead of a blue inline hyperlink?",
              a: "Reach for Link for the UI links that live outside running prose: contact rows, directory cards, footer columns, meta rows. It rests at the full-strength foreground and warms to brand on hover. The blue --link token (text-link / decoration-link) stays for hyperlinks embedded inside body copy, where a colored underline signals \"this word is a link\" mid-sentence.",
            },
            {
              q: "Why isn't it underlined by default?",
              a: "Outside prose, these links sit in a labeled context (a value under a heading, a card, a footer column) where the layout already reads them as links, so the color shift on hover is enough affordance. Pass the underline prop when a link needs to read as underlined at rest.",
            },
            {
              q: "How do I keep Next.js client-side routing?",
              a: "Set asChild and pass a single next/link child. The Link renders its styles onto that element via Radix Slot instead of emitting its own <a>, so the navigation stays client-side.",
            },
            {
              q: "Does it re-theme and re-accent?",
              a: "Yes. The rest color is text-foreground (or text-muted-foreground) and the hover is the brand accent, all semantic tokens, so it reads correctly in light, dark, cream, and moonlight and re-tints with the active accent.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
