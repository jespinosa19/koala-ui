"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Divider } from "@/components/ui/divider"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputRoot, InputField, PasswordInput } from "@/components/ui/input"
import {
  PasswordStrength,
  PasswordStrengthMeter,
  PasswordStrengthLabel,
} from "@/components/ui/password-strength"
import { useDensity, type Density } from "@/lib/density"
import { tv } from "@/lib/tv"

import {
  AppleLogo,
  DiscordLogo,
  GithubLogo,
  GoogleLogo,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
  YoutubeLogo,
} from "./brand-logos"

/**
 * AuthForm: three ready auth blocks sharing one recipe: `LoginForm`, `SignUpForm`, and
 * `ProviderForm`. Login/Sign-up are the email/password pair (sign-up adds a name field and a live
 * password-strength meter); `ProviderForm` is the password-less, provider-first block: a stack of
 * full-width "Continue with X" buttons with an optional magic-link email and a social footer. Each
 * is a self-contained card that owns its field state and submit flow; wire `onSubmit` /
 * `onProvider` to your auth backend. See docs/ARCHITECTURE.md §2.
 *
 * The `card` variant's root declares `--surface: var(--card)` so nested Inputs blend with the
 * panel (the --surface contract). The `bare` variant drops the card chrome so the same block can
 * be dropped into a full-page shell (a `SplitPane`, a centered hero) that owns its own surface.
 */
export const authFormVariants = tv({
  slots: {
    // Neutral base: the surface treatment (card chrome vs. bare) lives in the `variant` axis,
    // padding in the variant×density compounds, so `bare` fills its host edge-to-edge.
    root: "flex w-full flex-col",
    header: "flex flex-col gap-1.5 text-center",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    // Provider icons stack in one column on narrow screens (a phone / a split pane below the fold)
    // and spread to a 3-up row once there's room at `sm`, so they never crowd a 320px viewport.
    social: "grid grid-cols-1 gap-2 sm:grid-cols-3",
    // Provider-first (`ProviderForm`): a vertical stack of full-width "Continue with X" buttons,
    // the legal line under them, and the social footer rail.
    providerStack: "flex flex-col gap-2.5",
    legal: "text-center text-xs leading-relaxed text-balance text-muted-foreground",
    socialFooter:
      "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground",
    socialLink:
      "flex items-center gap-1.5 rounded-sm font-medium outline-none transition-colors duration-fast ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    form: "flex flex-col gap-4",
    labelRow: "flex items-center justify-between",
    forgot:
      "rounded-sm text-sm font-medium text-brand outline-none transition-colors duration-fast ease-out hover:text-brand/80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    check: "flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground",
    footer: "text-center text-sm text-muted-foreground",
    footerLink:
      "rounded-sm font-medium text-brand outline-none transition-colors duration-fast ease-out hover:text-brand/80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
  },
  variants: {
    // `card` is the standalone bordered block (the default); `bare` strips the chrome (no
    // border, surface, shadow, max-width, or padding) to embed inside a page shell.
    variant: {
      card: {
        root: "max-w-sm rounded-2xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
      },
      bare: {},
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): outer gap and title
    // size here; the card padding rides the variant×density compounds below. `compact` is the
    // Koala default (16px); `comfortable` is 24px.
    density: {
      compact: { root: "gap-4", title: "text-lg" },
      comfortable: { root: "gap-6", title: "text-xl" },
    },
  },
  compoundVariants: [
    // Only the `card` variant carries padding; `bare` lets the host shell space it.
    { variant: "card", density: "compact", class: { root: "p-4" } },
    { variant: "card", density: "comfortable", class: { root: "p-6" } },
    // Bare sits on the host's background, so its focus rings offset against that, not the card.
    {
      variant: "bare",
      class: {
        forgot: "focus-visible:ring-offset-background",
        footerLink: "focus-visible:ring-offset-background",
        socialLink: "focus-visible:ring-offset-background",
      },
    },
  ],
  defaultVariants: {
    variant: "card",
    density: "compact",
  },
})

export type AuthProvider = "google" | "github" | "apple" | "discord"

/** Brand mark + label for every provider the auth blocks know how to render. */
const PROVIDER_META: Record<AuthProvider, { label: string; icon: typeof GoogleLogo }> = {
  google: { label: "Google", icon: GoogleLogo },
  github: { label: "GitHub", icon: GithubLogo },
  apple: { label: "Apple", icon: AppleLogo },
  discord: { label: "Discord", icon: DiscordLogo },
}

// The icon-grid row (LoginForm / SignUpForm) shows the three classic web providers.
const PROVIDERS: AuthProvider[] = ["google", "github", "apple"]

function SocialRow({
  onProvider,
  slots,
}: {
  onProvider?: (provider: AuthProvider) => void
  slots: ReturnType<typeof authFormVariants>
}) {
  return (
    <div className={slots.social()}>
      {PROVIDERS.map((id) => {
        const { label, icon: Icon } = PROVIDER_META[id]
        return (
          <Button
            key={id}
            type="button"
            variant="outline"
            aria-label={`Continue with ${label}`}
            onClick={() => onProvider?.(id)}
          >
            <Icon />
            {/* Icon-only in the 3-up row (no room for labels); once the row stacks to one column
                below `sm`, the spare width earns the provider name beside the mark. */}
            <span className="sm:hidden">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}

// ─── LoginForm ────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

export interface LoginFormProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** `card` (default) ships the standalone bordered block; `bare` drops the chrome to embed inside a page shell (e.g. a `SplitPane`). */
  variant?: "card" | "bare"
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Show the social provider row above the email form. */
  showSocial?: boolean
  /** Called with the credentials on submit. Return a promise to drive the spinner. */
  onSubmit?: (data: LoginFormData) => void | Promise<void>
  onProvider?: (provider: AuthProvider) => void
  /** Target for the "Forgot password?" link. */
  forgotHref?: string
  /** Target for the "Sign up" cross-link. */
  signUpHref?: string
}

export function LoginForm({
  title = "Welcome back",
  description = "Sign in to your account to continue.",
  showSocial = true,
  variant,
  density,
  onSubmit,
  onProvider,
  forgotHref = "#",
  signUpHref = "#",
  className,
  ...props
}: LoginFormProps) {
  const slots = authFormVariants({ variant, density: useDensity(density) })
  const [data, setData] = React.useState<LoginFormData>({
    email: "",
    password: "",
    remember: false,
  })
  const [loading, setLoading] = React.useState(false)

  function update<K extends keyof LoginFormData>(key: K, value: LoginFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    await Promise.resolve(onSubmit?.(data))
    setLoading(false)
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      {showSocial && (
        <>
          <SocialRow onProvider={onProvider} slots={slots} />
          <Divider>or continue with email</Divider>
        </>
      )}

      <form className={slots.form()} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel required>Email</FieldLabel>
          <InputRoot>
            <InputField
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={data.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </InputRoot>
        </Field>

        <Field>
          <div className={slots.labelRow()}>
            <FieldLabel required>Password</FieldLabel>
            <a href={forgotHref} className={slots.forgot()}>
              Forgot password?
            </a>
          </div>
          <PasswordInput
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            value={data.password}
            onChange={(event) => update("password", event.target.value)}
          />
        </Field>

        <label className={slots.check()}>
          <Checkbox
            checked={data.remember}
            onCheckedChange={(checked) => update("remember", checked === true)}
          />
          Remember me for 30 days
        </label>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <p className={slots.footer()}>
        Don&apos;t have an account?{" "}
        <a href={signUpHref} className={slots.footerLink()}>
          Sign up
        </a>
      </p>
    </div>
  )
}

// ─── SignUpForm ───────────────────────────────────────────────────────────────

export interface SignUpFormData {
  name: string
  email: string
  password: string
  acceptedTerms: boolean
}

export interface SignUpFormProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** `card` (default) ships the standalone bordered block; `bare` drops the chrome to embed inside a page shell (e.g. a `SplitPane`). */
  variant?: "card" | "bare"
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  showSocial?: boolean
  onSubmit?: (data: SignUpFormData) => void | Promise<void>
  onProvider?: (provider: AuthProvider) => void
  /** Target for the "Sign in" cross-link. */
  signInHref?: string
  /** Targets for the terms / privacy links. */
  termsHref?: string
  privacyHref?: string
}

export function SignUpForm({
  title = "Create your account",
  description = "Start your free trial. No credit card required.",
  showSocial = true,
  variant,
  density,
  onSubmit,
  onProvider,
  signInHref = "#",
  termsHref = "#",
  privacyHref = "#",
  className,
  ...props
}: SignUpFormProps) {
  const slots = authFormVariants({ variant, density: useDensity(density) })
  const [data, setData] = React.useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    acceptedTerms: false,
  })
  const [loading, setLoading] = React.useState(false)

  function update<K extends keyof SignUpFormData>(key: K, value: SignUpFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    await Promise.resolve(onSubmit?.(data))
    setLoading(false)
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      {showSocial && (
        <>
          <SocialRow onProvider={onProvider} slots={slots} />
          <Divider>or sign up with email</Divider>
        </>
      )}

      <form className={slots.form()} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel required>Full name</FieldLabel>
          <InputRoot>
            <InputField
              autoComplete="name"
              placeholder="Jane Cooper"
              required
              value={data.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </InputRoot>
        </Field>

        <Field>
          <FieldLabel required>Email</FieldLabel>
          <InputRoot>
            <InputField
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={data.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </InputRoot>
        </Field>

        <Field>
          <FieldLabel required>Password</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Create a password"
            required
            value={data.password}
            onChange={(event) => update("password", event.target.value)}
          />
          <PasswordStrength value={data.password} className="mt-1.5">
            <PasswordStrengthMeter />
            <PasswordStrengthLabel placeholder="Use 8+ characters with a mix of letters, numbers & symbols." />
          </PasswordStrength>
        </Field>

        <label className={slots.check()}>
          <Checkbox
            className="mt-0.5 self-start"
            checked={data.acceptedTerms}
            onCheckedChange={(checked) => update("acceptedTerms", checked === true)}
          />
          <span className="text-pretty">
            I agree to the{" "}
            <a href={termsHref} className={slots.footerLink()}>
              Terms
            </a>{" "}
            and{" "}
            <a href={privacyHref} className={slots.footerLink()}>
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={!data.acceptedTerms}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <p className={slots.footer()}>
        Already have an account?{" "}
        <a href={signInHref} className={slots.footerLink()}>
          Sign in
        </a>
      </p>
    </div>
  )
}

// ─── ProviderForm ───────────────────────────────────────────────────────────────
//
// The provider-first block: no password core, just a stack of full-width "Continue with X"
// buttons. Matches the OAuth-only screens (Discord/Slack communities, Slite, Workable) and the
// "pick a provider, then maybe a magic link" pattern (Reflect, Copy.ai). `emphasizeFirst` makes
// the first provider the solid primary button for a single dominant choice (e.g. just Discord);
// `requireTerms` adds the consent checkbox that gates every action until accepted.

export type SocialNetwork = "x" | "discord" | "youtube" | "instagram" | "github" | "linkedin"

export interface SocialLink {
  network: SocialNetwork
  href: string
  /** Override the visible label (defaults to the network name). */
  label?: string
}

// Real brand marks (Simple Icons), monochrome so they dim/brighten with the footer link.
const SOCIAL_META: Record<
  SocialNetwork,
  { label: string; icon: typeof GoogleLogo }
> = {
  x: { label: "X", icon: XLogo },
  discord: { label: "Discord", icon: DiscordLogo },
  youtube: { label: "YouTube", icon: YoutubeLogo },
  instagram: { label: "Instagram", icon: InstagramLogo },
  github: { label: "GitHub", icon: GithubLogo },
  linkedin: { label: "LinkedIn", icon: LinkedinLogo },
}

export interface ProviderFormProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** `card` (default) ships the standalone bordered block; `bare` drops the chrome to embed inside a page shell (e.g. a `SplitPane`). */
  variant?: "card" | "bare"
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Providers to offer, top to bottom. Defaults to the three classic web providers. */
  providers?: AuthProvider[]
  /** Render the first provider as the solid primary button (the rest stay outline). Set for a single dominant choice, e.g. `providers={["discord"]}`. */
  emphasizeFirst?: boolean
  /** Verb on each provider button: `"continue"` → "Continue with Google" (default), `"sign-in"` → "Sign in with Google". */
  action?: "continue" | "sign-in"
  onProvider?: (provider: AuthProvider) => void
  /** Gate every action behind a consent checkbox the user must tick first. */
  requireTerms?: boolean
  /**
   * Consent copy. When `requireTerms`, it labels the checkbox; otherwise it's the static
   * microcopy under the buttons. Defaults to a "Terms and Privacy Policy" sentence; pass `null`
   * to hide the static line (ignored when `requireTerms`).
   */
  termsLabel?: React.ReactNode
  termsHref?: string
  privacyHref?: string
  /** Add a magic-link email field under a divider. */
  showEmail?: boolean
  /** Label on the email submit button. */
  emailAction?: React.ReactNode
  /** Called with the email on submit. Return a promise to drive the spinner. */
  onSubmit?: (email: string) => void | Promise<void>
  /** Footer cross-link area (e.g. a "Don't have an account? Sign up" line). */
  footer?: React.ReactNode
  /** Social rail at the very bottom: community links (Twitter / Discord / YouTube / …). */
  social?: SocialLink[]
}

export function ProviderForm({
  title = "Welcome",
  description = "Sign in or create your account to continue.",
  variant,
  density,
  providers = ["google", "github", "apple"],
  emphasizeFirst = false,
  action = "continue",
  onProvider,
  requireTerms = false,
  termsLabel,
  termsHref = "#",
  privacyHref = "#",
  showEmail = false,
  emailAction = "Continue with email",
  onSubmit,
  footer,
  social,
  className,
  ...props
}: ProviderFormProps) {
  const slots = authFormVariants({ variant, density: useDensity(density) })
  const [email, setEmail] = React.useState("")
  const [accepted, setAccepted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // When consent is required, every action stays inert until the box is ticked.
  const gated = requireTerms && !accepted

  const verb = action === "sign-in" ? "Sign in with" : "Continue with"

  // The consent sentence: a custom node, the default Terms/Privacy line, or nothing.
  const termsContent =
    termsLabel !== undefined ? (
      termsLabel
    ) : (
      <>
        By continuing, you agree to our{" "}
        <a href={termsHref} className={slots.footerLink()}>
          Terms
        </a>{" "}
        and{" "}
        <a href={privacyHref} className={slots.footerLink()}>
          Privacy Policy
        </a>
        .
      </>
    )

  async function handleEmail(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    await Promise.resolve(onSubmit?.(email))
    setLoading(false)
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      {requireTerms && (
        <label className={slots.check()}>
          <Checkbox
            className="mt-0.5 self-start"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <span className="text-pretty">{termsContent}</span>
        </label>
      )}

      <div className={slots.providerStack()}>
        {providers.map((id, index) => {
          const { label, icon: Icon } = PROVIDER_META[id]
          return (
            <Button
              key={id}
              type="button"
              variant={emphasizeFirst && index === 0 ? "primary" : "outline"}
              size="lg"
              disabled={gated}
              onClick={() => onProvider?.(id)}
              className="w-full"
            >
              {/* Mark rides next to the label; the pair centers together (never pinned to the edge). */}
              <Icon className="size-5" />
              {verb} {label}
            </Button>
          )
        })}
      </div>

      {showEmail && (
        <>
          <Divider>or</Divider>
          <form className={slots.form()} onSubmit={handleEmail}>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <InputRoot>
                <InputField
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </InputRoot>
            </Field>
            <Button type="submit" size="lg" loading={loading} disabled={gated} className="w-full">
              {emailAction}
            </Button>
          </form>
        </>
      )}

      {!requireTerms && termsContent != null && (
        <p className={slots.legal()}>{termsContent}</p>
      )}

      {footer != null && <div className={slots.footer()}>{footer}</div>}

      {social && social.length > 0 && (
        <nav className={slots.socialFooter()} aria-label="Social links">
          {social.map(({ network, href, label }) => {
            const { label: defaultLabel, icon: Icon } = SOCIAL_META[network]
            return (
              <a key={network} href={href} className={slots.socialLink()}>
                <Icon className="size-4" />
                {label ?? defaultLabel}
              </a>
            )
          })}
        </nav>
      )}
    </div>
  )
}
