import { Quotes, ShieldCheck } from "@phosphor-icons/react/ssr"

import {
  LoginForm,
  ProviderForm,
  SignUpForm,
  type AuthProvider,
  type SocialLink,
} from "@/components/ui/auth-form"
import { DiscordLogo } from "@/components/ui/auth-form/brand-logos"
import { Badge } from "@/components/ui/badge"
import {
  SplitLayout,
  SplitPane,
  SplitPaneBody,
  SplitMedia,
  SplitMediaOverlay,
} from "@/components/ui/layout"
import { BrandMark } from "@/components/landing/brand-mark"
import { cn } from "@/lib/utils"

/**
 * The application-domain **authentication** sections: complete sign-in / sign-up SCREENS (the
 * page tier of the atomic ladder, see memory `site-ia-tiers`), each a real responsive layout that
 * fills the frame. Unlike the narrow, fixed-height demos on the auth-form component page, these
 * use the shipped breakpoints: `SplitLayout` is `min-h-svh` with the media pane `hidden lg:block`,
 * so the frame recomposes to a single column as it narrows. They compose the same three auth
 * blocks (`LoginForm` / `SignUpForm` / `ProviderForm`) that the component page documents, so the
 * screens stay in lockstep with the engine. Registered in `sections-registry.tsx` under
 * `domain: "application"`, rendered by the shared iframe target (`app/preview/sections/[slug]`).
 */

// Real Unsplash imagery stands in for product screenshots and cover art; swap for next/Image.
const cover = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

/** A decorative cover photo filling a `SplitMedia` (or a collage tile). */
function CoverImage({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- demo imagery; swap for next/Image
    <img src={src} alt="" aria-hidden className={cn("size-full object-cover", className)} />
  )
}

// The Discord app tile: the real Discord mark on Discord's blurple, not a generic "gaming" glyph.
function DiscordAppMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-14 place-items-center rounded-2xl bg-[#5865F2] text-white shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <DiscordLogo className="size-8" />
    </span>
  )
}

// The flat, centered stage hosting the boxed-card screens (no colored glow). `min-h-svh` makes it
// fill the frame; the PreviewFrame `minHeight` floors the actual preview height.
function CenteredStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">{children}</div>
    </div>
  )
}

// The Eleven-style community form props, shared by the centered and split screens.
const elevenProps = {
  title: "Want to join Eleven?",
  description: "Sign in with Discord to request your whitelist and start your story.",
  providers: ["discord"] as AuthProvider[],
  emphasizeFirst: true,
  action: "sign-in" as const,
  requireTerms: true,
  termsLabel: (
    <>
      I accept the{" "}
      <a href="#" className="font-medium text-brand underline-offset-4 hover:underline">
        terms and conditions
      </a>{" "}
      of Eleven
    </>
  ),
  social: [
    { network: "x", href: "#" },
    { network: "discord", href: "#" },
    { network: "youtube", href: "#" },
    { network: "instagram", href: "#" },
  ] as SocialLink[],
}

// ── Sign in ─────────────────────────────────────────────────────────────────────────────

/** Sign in · split: a bare LoginForm under a brand lockup, a photo + testimonial on the right. */
export function AuthLoginSplitSection() {
  return (
    <SplitLayout>
      <SplitPane>
        <SplitPaneBody width="sm" className="gap-8">
          <BrandMark className="justify-center" />
          <LoginForm variant="bare" />
        </SplitPaneBody>
      </SplitPane>

      <SplitMedia>
        <CoverImage src={cover("1522708323590-d24dbb6b0267")} className="absolute inset-0" />
        <SplitMediaOverlay>
          <Quotes weight="bold" className="size-7 opacity-80" />
          <p className="text-lg font-medium text-balance">
            Koala UI let us ship a polished product in days, not months.
          </p>
          <p className="text-sm text-white/70">Mara Okonkwo · Founder, Nimbus</p>
        </SplitMediaOverlay>
      </SplitMedia>
    </SplitLayout>
  )
}

/** Sign in · centered: the default bordered card centered on a soft, flat backdrop. */
export function AuthLoginCenteredSection() {
  return (
    <CenteredStage>
      <BrandMark />
      <LoginForm className="w-full" />
    </CenteredStage>
  )
}

// ── Sign up ─────────────────────────────────────────────────────────────────────────────

/** Sign up · split: a branded photo panel on the left, the SignUpForm on the right. */
export function AuthSignUpSplitSection() {
  return (
    <SplitLayout>
      <SplitMedia>
        <CoverImage src={cover("1531403009284-440f080d1e12")} className="absolute inset-0" />
        <SplitMediaOverlay className="justify-between">
          <BrandMark className="text-white" />
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-semibold tracking-tight text-balance">
              Build faster with a design system that ships finished.
            </p>
            <p className="text-sm text-pretty text-white/75">
              Join thousands of teams already building on Koala UI.
            </p>
          </div>
        </SplitMediaOverlay>
      </SplitMedia>

      <SplitPane>
        <SplitPaneBody width="sm">
          <SignUpForm variant="bare" />
        </SplitPaneBody>
      </SplitPane>
    </SplitLayout>
  )
}

/** Sign up · centered: a SOC 2 trust badge above the SignUpForm card. */
export function AuthSignUpCenteredSection() {
  return (
    <CenteredStage>
      <Badge variant="success" size="lg" pill>
        <ShieldCheck weight="bold" />
        SOC 2 compliant
      </Badge>
      <SignUpForm className="w-full" />
    </CenteredStage>
  )
}

// ── Provider-first ──────────────────────────────────────────────────────────────────────

/** Provider stack · magic link: "Continue with X" buttons over a magic-link email, centered. */
export function AuthProviderStackSection() {
  return (
    <CenteredStage>
      <ProviderForm
        className="w-full"
        title="Sign in to Koala"
        description="Use a provider or get a magic link by email."
        showEmail
      />
    </CenteredStage>
  )
}

/** Community sign-in · centered: a single dominant Discord button, consent gate, social footer. */
export function AuthCommunitySection() {
  return (
    <CenteredStage>
      <DiscordAppMark />
      <ProviderForm className="w-full" {...elevenProps} />
    </CenteredStage>
  )
}

/** Community sign-in · split: the same gated block bare, with a media collage on the right. */
export function AuthCommunitySplitSection() {
  return (
    <SplitLayout>
      <SplitPane>
        <SplitPaneBody width="sm" className="gap-8">
          <ProviderForm variant="bare" {...elevenProps} />
        </SplitPaneBody>
      </SplitPane>

      <SplitMedia>
        {/* A collage of real world imagery: the game-server screenshots you'd show here. */}
        <div className="absolute inset-0 grid grid-rows-3 gap-3 bg-background p-3">
          {["1493809842364-78817add7ffb", "1469474968028-56623f02e42e", "1615529182904-14819c35db37"].map(
            (id) => (
              <CoverImage key={id} src={cover(id)} className="rounded-xl" />
            ),
          )}
        </div>
      </SplitMedia>
    </SplitLayout>
  )
}
