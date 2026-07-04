import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  LoginFormDemo,
  SignUpFormDemo,
  ProviderStackDemo,
  ConsentGateDemo,
} from "./demos"

export const metadata = { title: "Authentication" }

export default function AuthFormDocsPage() {
  return (
    <>
      <DocHeader
        title="Authentication"
        description="The sign-in and sign-up pair, shipped as two ready blocks. Each is a self-contained card with social providers, an email and password core, and the cross-link to its sibling. Sign-up adds a name field and a live password-strength meter. Wire onSubmit and onProvider to your auth backend."
      />

      <ComponentPreview
        locked
        previewClassName="items-start"
        code={`<LoginForm onSubmit={signIn} onProvider={oauth} />`}
      >
        <LoginFormDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="auth-form" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="Sign up">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SignUpForm</code> adds a full-name field and a{" "}
          <a href="/docs/components/password-strength" className="underline underline-offset-4">
            password-strength
          </a>{" "}
          meter, and gates the submit on the terms checkbox.
        </p>
        <ComponentPreview
          locked
          previewClassName="items-start"
          code={`<SignUpForm onSubmit={register} onProvider={oauth} />`}
        >
          <SignUpFormDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Provider-first">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">ProviderForm</code> drops the password core for a
          stack of full-width{" "}
          <code className="font-mono text-sm">Continue with…</code> buttons: the password-less
          OAuth pattern. Add <code className="font-mono text-sm">showEmail</code> for a magic-link
          fallback below the providers.
        </p>
        <ComponentPreview
          locked
          previewClassName="items-start"
          code={`<ProviderForm
  providers={["google", "github", "apple"]}
  showEmail
  onProvider={oauth}
  onSubmit={sendMagicLink}
/>`}
        >
          <ProviderStackDemo />
        </ComponentPreview>

        <h3 className="mt-10 text-lg font-semibold tracking-tight">Single provider · consent gate</h3>
        <p className="mt-3 text-pretty text-muted-foreground">
          Pass one provider with{" "}
          <code className="font-mono text-sm">emphasizeFirst</code> for a single dominant button,
          and <code className="font-mono text-sm">requireTerms</code> to gate it behind a consent
          checkbox. A <code className="font-mono text-sm">social</code> rail links out to the
          community: the OAuth-only screen used by game servers and Discord-native products.
        </p>
        <ComponentPreview
          locked
          previewClassName="items-start"
          code={`<ProviderForm
  title="Want to join Eleven?"
  description="Sign in with Discord to request your whitelist."
  providers={["discord"]}
  emphasizeFirst
  action="sign-in"
  requireTerms
  termsLabel={<>I accept the <a href="/terms">terms and conditions</a> of Eleven</>}
  social={[
    { network: "x", href: "#" },
    { network: "discord", href: "#" },
    { network: "youtube", href: "#" },
    { network: "instagram", href: "#" },
  ]}
/>`}
        >
          <ConsentGateDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Full-page screens">
        <p className="mt-4 text-pretty text-muted-foreground">
          Composed into complete pages, these blocks become the{" "}
          <a href="/app/sections/authentication" className="underline underline-offset-4">
            Authentication
          </a>{" "}
          section family: seven finished sign-in and sign-up screens (split and centered, plus the
          community Discord screens), each with a full-screen, resizable device-frame preview. For a
          split screen, drop <code className="font-mono text-sm">variant=&quot;bare&quot;</code> on
          the form and place it in a{" "}
          <a href="/docs/components/layout" className="underline underline-offset-4">
            SplitLayout
          </a>{" "}
          pane so the shell owns the surface; for a centered page, keep the default bordered card on
          a soft backdrop.
        </p>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">LoginForm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Composes{" "}
              <a href="/docs/components/input" className="underline underline-offset-4">Input</a>,{" "}
              <a href="/docs/components/checkbox" className="underline underline-offset-4">Checkbox</a>, and{" "}
              <a href="/docs/components/divider" className="underline underline-offset-4">Divider</a>.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">onSubmit</code>:{" "}
                <code className="font-mono text-sm">{`(data: { email, password, remember }) => void | Promise<void>`}</code>.
              </li>
              <li>
                <code className="font-mono text-sm">onProvider</code>:{" "}
                <code className="font-mono text-sm">{`(provider: "google" | "github" | "apple") => void`}</code>.
              </li>
              <li>
                <code className="font-mono text-sm">variant</code>:{" "}
                <code className="font-mono text-sm">&quot;card&quot;</code> (default) or{" "}
                <code className="font-mono text-sm">&quot;bare&quot;</code> to embed in a page shell.
              </li>
              <li>
                <code className="font-mono text-sm">showSocial</code> (default{" "}
                <code className="font-mono text-sm">true</code>),{" "}
                <code className="font-mono text-sm">forgotHref</code>,{" "}
                <code className="font-mono text-sm">signUpHref</code>.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono font-semibold">SignUpForm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Adds a password-strength meter and a terms gate.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">onSubmit</code>:{" "}
                <code className="font-mono text-sm">{`(data: { name, email, password, acceptedTerms }) => void | Promise<void>`}</code>.
              </li>
              <li>
                <code className="font-mono text-sm">variant</code> (
                <code className="font-mono text-sm">&quot;card&quot;</code> /{" "}
                <code className="font-mono text-sm">&quot;bare&quot;</code>),{" "}
                <code className="font-mono text-sm">showSocial</code>,{" "}
                <code className="font-mono text-sm">signInHref</code>,{" "}
                <code className="font-mono text-sm">termsHref</code>,{" "}
                <code className="font-mono text-sm">privacyHref</code>.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono font-semibold">ProviderForm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The password-less provider-first block: a stack of full-width{" "}
              <code className="font-mono text-sm">Continue with…</code> buttons with an optional
              magic-link email and social rail.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">providers</code>:{" "}
                <code className="font-mono text-sm">{`("google" | "github" | "apple" | "discord")[]`}</code>{" "}
                (default the first three).
              </li>
              <li>
                <code className="font-mono text-sm">emphasizeFirst</code> renders the first provider
                as the solid primary button; <code className="font-mono text-sm">action</code> sets
                the verb (<code className="font-mono text-sm">&quot;continue&quot;</code> /{" "}
                <code className="font-mono text-sm">&quot;sign-in&quot;</code>).
              </li>
              <li>
                <code className="font-mono text-sm">requireTerms</code> gates every action behind a
                consent checkbox; <code className="font-mono text-sm">termsLabel</code>,{" "}
                <code className="font-mono text-sm">termsHref</code>,{" "}
                <code className="font-mono text-sm">privacyHref</code> control the copy.
              </li>
              <li>
                <code className="font-mono text-sm">showEmail</code> +{" "}
                <code className="font-mono text-sm">onSubmit</code>{" "}
                <code className="font-mono text-sm">{`(email: string) => void | Promise<void>`}</code>{" "}
                add a magic-link field; <code className="font-mono text-sm">social</code> renders the
                community link rail.
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between LoginForm and SignUpForm?",
              a: "LoginForm is the sign-in block with email, password, a \"Remember me\" checkbox, and a forgot-password link. SignUpForm adds a full-name field and a live password-strength meter, and gates its submit button on the terms checkbox via `acceptedTerms`.",
            },
            {
              q: "How do I wire these blocks to my auth backend?",
              a: "Pass `onSubmit`, which receives the field data (`{ email, password, remember }` for login, `{ name, email, password, acceptedTerms }` for sign-up), and `onProvider`, which receives the OAuth provider id. Return a promise from `onSubmit` and the submit button drives its own loading spinner until it resolves.",
            },
            {
              q: "When should I use variant=\"bare\" instead of the default card?",
              a: "Use the default `card` variant for a standalone bordered block on a backdrop. Switch to `bare` to drop the border, surface, shadow, max-width, and padding so the form fills a page shell such as a SplitPane, letting the host own the surface and spacing.",
            },
            {
              q: "How does density affect the form?",
              a: "density sets the outer gap and title size, and the card padding through variant by density compounds: `compact` (the Koala default, 16px) and `comfortable` (24px). If you omit the prop it falls back to the nearest DensityProvider, so a section-wide density setting flows in automatically.",
            },
            {
              q: "Can I hide the social provider row?",
              a: "Yes, set `showSocial={false}` to drop the provider button grid and the \"or continue with email\" divider, leaving just the email and password core. It defaults to `true`.",
            },
            {
              q: "Why do nested Inputs blend into the card automatically?",
              a: "The `card` variant root declares `--surface: var(--card)`, the Koala surface contract, so the composed Input, Checkbox, and password-strength parts read that variable and blend with the panel instead of painting their own background. In `bare` the host shell owns the surface, and the focus rings offset against the background accordingly.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
