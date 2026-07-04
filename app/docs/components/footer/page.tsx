import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  FooterDemo,
  FooterNewsletterDemo,
  FooterMutedDemo,
  FooterSimpleDemo,
  FooterCompactDemo,
} from "./demos"

export const metadata = { title: "Footer" }

export default function FooterDocsPage() {
  return (
    <>
      <DocHeader
        title="Footer"
        description="A composable site footer for marketing, product, and ecommerce pages. Pure layout: a brand column plus grouped link columns up top, and a bottom bar with copyright, legal links, and social icons. Everything is named parts you assemble; a newsletter is just Input + Button composed in."
      />

      <ComponentPreview
        locked
        previewClassName="block p-0"
        code={`<Footer>
  <FooterTop>
    <FooterBrand>
      <BrandMark />
      <FooterTagline>The commercial React design system…</FooterTagline>
      <FooterSocial>
        <FooterSocialLink href="#" aria-label="X"><XLogo /></FooterSocialLink>
        <FooterSocialLink href="#" aria-label="GitHub"><GithubLogo /></FooterSocialLink>
      </FooterSocial>
    </FooterBrand>
    <FooterColumns>
      <FooterColumn title="Product">
        <FooterLink href="#">Features</FooterLink>
        <FooterLink href="#">Pricing</FooterLink>
      </FooterColumn>
      {/* …more columns */}
    </FooterColumns>
  </FooterTop>
  <FooterBottom>
    <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
    <FooterLegal>
      <FooterLink href="#">Privacy</FooterLink>
      <FooterLink href="#">Terms</FooterLink>
    </FooterLegal>
  </FooterBottom>
</Footer>`}
      >
        <FooterDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="footer" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="With newsletter">
        <p className="mt-4 text-pretty text-muted-foreground">
          A newsletter signup is just an{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a>{" "}
          and a{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">Button</a>{" "}
          composed inside <code className="font-mono text-sm">FooterBrand</code>. The footer
          stays dependency-free.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-0"
          code={`<FooterBrand>
  <BrandMark />
  <FooterTagline>Get product updates. No spam.</FooterTagline>
  <form className="flex items-center gap-2">
    <InputRoot size="sm" className="max-w-2xs">
      <InputField type="email" placeholder="you@company.com" aria-label="Email address" />
    </InputRoot>
    <Button size="sm" iconOnly aria-label="Subscribe"><ArrowRight /></Button>
  </form>
</FooterBrand>`}
        >
          <FooterNewsletterDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Muted panel">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">variant=&quot;muted&quot;</code> swaps the hairline
          top rule for a subtle filled panel that separates the footer from the page.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-0"
          code={`<Footer variant="muted">
  …
</Footer>`}
        >
          <FooterMutedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Bottom bar only">
        <p className="mt-4 text-pretty text-muted-foreground">
          For simple pages, drop the columns and render just the{" "}
          <code className="font-mono text-sm">FooterBottom</code> bar: brand, social, copyright,
          and legal on one line.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-0"
          code={`<Footer density="compact">
  <FooterBottom className="mt-0 border-t-0 pt-0">
    <div className="flex items-center gap-3">
      <BrandMark />
      <FooterCopyright>© 2026 Koala UI</FooterCopyright>
    </div>
    <FooterLegal>
      <FooterLink href="#">Privacy</FooterLink>
      <FooterLink href="#">Terms</FooterLink>
    </FooterLegal>
  </FooterBottom>
</Footer>`}
        >
          <FooterSimpleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density</code> tunes the block padding and the gap
          to the bottom bar. Set it per footer or for a whole subtree with{" "}
          <code className="font-mono text-sm">DensityProvider</code>. See{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-0"
          code={`<Footer density="compact">…</Footer>`}
        >
          <FooterCompactDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Footer</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root <code className="font-mono text-sm">&lt;footer&gt;</code>. Provides the
              styling context to every part and renders the max-width gutter. Forwards all{" "}
              <code className="font-mono text-sm">&lt;footer&gt;</code> props.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">variant</code>:{" "}
                <code className="font-mono text-sm">&quot;default&quot;</code> (hairline top rule) or{" "}
                <code className="font-mono text-sm">&quot;muted&quot;</code> (filled panel).
              </li>
              <li>
                <code className="font-mono text-sm">density</code>:{" "}
                <code className="font-mono text-sm">&quot;comfortable&quot;</code> (default) or{" "}
                <code className="font-mono text-sm">&quot;compact&quot;</code>. Falls back to the nearest{" "}
                <code className="font-mono text-sm">DensityProvider</code>.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono font-semibold">FooterTop · FooterBrand · FooterTagline</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">FooterTop</code> lays the brand column beside the
              link columns; <code className="font-mono text-sm">FooterBrand</code> is that column
              (logo, tagline, social, or a newsletter);{" "}
              <code className="font-mono text-sm">FooterTagline</code> is the muted lead line.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">FooterColumns · FooterColumn · FooterLink</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">FooterColumns</code> grids the columns;{" "}
              <code className="font-mono text-sm">FooterColumn</code> takes a{" "}
              <code className="font-mono text-sm">title</code> and stacks{" "}
              <code className="font-mono text-sm">FooterLink</code>s (each accepts{" "}
              <code className="font-mono text-sm">asChild</code> for a framework{" "}
              <code className="font-mono text-sm">&lt;Link&gt;</code>).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">FooterSocial · FooterSocialLink</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A row of icon-only links. Pass{" "}
              <code className="font-mono text-sm">aria-label</code> to each{" "}
              <code className="font-mono text-sm">FooterSocialLink</code>. The glyph has no
              accessible name on its own.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">FooterBottom · FooterCopyright · FooterLegal</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The lower bar (separated by a hairline), the tabular-nums copyright line, and the
              inline group for legal/secondary links.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I add a newsletter signup to the footer?", a: "There is no newsletter part. Compose an Input and a Button inside `FooterBrand`, which keeps the footer dependency-free and lets it reuse the controls you already have." },
            { q: "What does the `variant=\"muted\"` prop change?", a: "It swaps the default hairline top rule for a subtle filled panel, which visually separates the footer from the page above it. The default `variant` keeps the lighter hairline." },
            { q: "How do I render just a one-line footer without the link columns?", a: "Drop `FooterTop` and `FooterColumns` and render only the `FooterBottom` bar: brand, social, copyright, and legal links sit together on one line." },
            { q: "How do I use a framework Link inside FooterLink?", a: "Pass `asChild` to `FooterLink` and provide your own `<Link>` as the child. The footer link styling wraps your routing component instead of a plain anchor." },
            { q: "Why do my social icons have no accessible name?", a: "`FooterSocialLink` is icon-only, so the glyph has no text. Pass an `aria-label` to each one so screen readers announce the destination." },
            { q: "How do I tighten the footer spacing?", a: "Set `density` to `compact` on `Footer` to reduce the block padding and the gap to the bottom bar. Set it per footer or for a whole subtree with `DensityProvider`." },
          ]}
        />
      </DocSection>
    </>
  )
}
