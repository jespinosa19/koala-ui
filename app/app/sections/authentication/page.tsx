import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Authentication sections" }

// One numbered variant per preview, stacked on the family page. Each slug keys into the sections
// registry; the shared iframe render target (app/preview/sections/[slug]) reads the same map.
// Seven finished auth screens: two sign-in layouts (split with a testimonial, centered card), two
// sign-up layouts (split branded panel, centered card), the password-less provider stack with a
// magic-link email, and two community (Discord OAuth-only) screens, centered and split.
const VARIANTS = [
  "auth-login-split",
  "auth-login-centered",
  "auth-signup-split",
  "auth-signup-centered",
  "auth-provider-stack",
  "auth-community",
  "auth-community-split",
] as const

export default function AuthenticationSectionsPage() {
  return (
    <>
      <DocHeader
        title="Authentication"
        description="Complete sign-in and sign-up screens, ready to drop in. Seven finished layouts built from the LoginForm, SignUpForm, and ProviderForm blocks: two sign-in pages (a split with a testimonial and a centered card), two sign-up pages (a split branded panel and a centered card), the password-less provider stack with a magic-link fallback, and two community (Discord-native) screens. Open any frame full-screen, or drag the handle to watch it recompose."
      />

      <div className="flex flex-col gap-8">
        {VARIANTS.map((slug, i) => {
          const section = SECTIONS[slug]
          return (
            <PreviewFrame
              key={slug}
              id={slug}
              slug={slug}
              label={`Variant ${i + 1}`}
              code={section.code}
              locked={section.locked}
              minHeight={section.minHeight}
            />
          )
        })}
      </div>

      <DocSection title="Built from">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every screen composes the three auth blocks documented on the{" "}
          <a href="/docs/components/auth-form" className="underline underline-offset-4">
            Authentication
          </a>{" "}
          component page:{" "}
          <a href="/docs/components/auth-form" className="underline underline-offset-4">
            <code>LoginForm</code>
          </a>{" "}
          and <code>SignUpForm</code> (the email + password pair) and <code>ProviderForm</code>{" "}
          (the password-less, provider-first block). The split layouts drop the form{" "}
          <code>variant=&quot;bare&quot;</code> into a{" "}
          <a href="/docs/components/layout" className="underline underline-offset-4">
            <code>SplitLayout</code>
          </a>{" "}
          pane so the shell owns the surface and a full-bleed <code>SplitMedia</code> holds the
          photo; the centered screens keep the default bordered card on a soft, flat backdrop. The
          brand lockup is the canonical <code>BrandMark</code>, and the community screens carry the
          real Discord, X, YouTube, and Instagram marks, never icon stand-ins.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each preview renders inside an iframe, so the screen&apos;s own breakpoints respond to the{" "}
          <strong>frame</strong> width, not the browser. On the split screens the media pane is{" "}
          <code>hidden lg:block</code>, so drag the handle or pick Mobile below the <code>lg</code>{" "}
          breakpoint and the photo drops away while the form fills the column. Pick{" "}
          <strong>Wide</strong> to force a 1280px viewport (scaled to fit the column) and see the
          two-pane split even on a narrow screen. Switch the site theme top-right to check any screen
          in dark or moonlight.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Where do I find the underlying form components?",
              a: "On the Authentication component page (/docs/components/auth-form). These sections are full-page compositions of those blocks; the component page documents each block's props, density, and the onSubmit / onProvider wiring to your auth backend.",
            },
            {
              q: "How do I wire a screen to my auth backend?",
              a: "Pass onSubmit and onProvider to the form block inside the screen. onSubmit receives the field data ({ email, password, remember } for login, { name, email, password, acceptedTerms } for sign-up, or the email for a magic link), and onProvider receives the OAuth provider id. Return a promise from onSubmit and the submit button drives its own loading spinner until it resolves.",
            },
            {
              q: "Why is the code locked?",
              a: "Authentication is a Pro family. The live previews stay fully interactive so you can size and theme them, while the full source ships with a Koala UI Pro license.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
