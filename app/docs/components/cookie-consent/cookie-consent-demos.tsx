"use client"

import * as React from "react"
import { ArrowClockwise, ChartBar, Cookie, Gear, Megaphone, ShieldCheck } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  CookieAcceptAllButton,
  CookieBanner,
  CookieBannerActions,
  CookieBannerContent,
  CookieBannerDescription,
  CookieBannerIcon,
  CookieBannerTitle,
  CookieCategoryList,
  CookieConsent,
  CookieCustomizeButton,
  CookiePreferences,
  CookiePreferencesContent,
  CookiePreferencesDescription,
  CookiePreferencesFooter,
  CookiePreferencesHeader,
  CookiePreferencesTitle,
  CookiePreferencesTrigger,
  CookieRejectAllButton,
  CookieSavePreferencesButton,
  type CookieCategoryDef,
} from "@/components/ui/cookie-consent"
import { cn } from "@/lib/utils"

// Shared category set used across the demos: a leading icon, a label, and a one-line purpose.
// "Strictly necessary" is `required`, so it renders locked-on with an "Always on" badge.
const COOKIE_CATEGORIES: CookieCategoryDef[] = [
  {
    id: "necessary",
    label: "Strictly necessary",
    required: true,
    icon: ShieldCheck,
    description: "Essential for the site to work: security, networking, and your saved settings.",
  },
  {
    id: "functional",
    label: "Functional",
    icon: Gear,
    description: "Remember choices like language and region to personalise your experience.",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartBar,
    description: "Help us understand how visitors use the site so we can improve it.",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    description: "Used to deliver relevant ads and measure their performance.",
  },
]

// A bounded "page" frame so the fixed banner has somewhere to anchor inside the docs preview.
// CookieBanner is given `className="absolute"` at each call site, which twMerge swaps in for
// its own `fixed`, scoping it to this frame instead of the viewport. `isolate` opens a new
// stacking context so the banner's `z-50` stays trapped inside the frame and never paints over
// the docs' sticky header; `overflow-hidden` clips it to the rounded corners.
function CookieFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate w-full overflow-hidden rounded-xl border border-border bg-muted/40", className)}>
      {/* Faux page chrome behind the banner, so the surface reads as an overlay. */}
      <div aria-hidden className="flex flex-col gap-3 p-6">
        <div className="h-2.5 w-32 rounded-full bg-foreground/10" />
        <div className="h-2 w-full max-w-md rounded-full bg-foreground/[0.07]" />
        <div className="h-2 w-full max-w-sm rounded-full bg-foreground/[0.07]" />
        <div className="h-2 w-40 rounded-full bg-foreground/[0.07]" />
      </div>
      {children}
    </div>
  )
}

// The preferences dialog body, reused by every demo that opens it.
function PreferencesDialog() {
  return (
    <CookiePreferencesContent>
      <CookiePreferencesHeader>
        <CookiePreferencesTitle>Cookie preferences</CookiePreferencesTitle>
        <CookiePreferencesDescription>
          Choose which cookies we can use. You can change these anytime from the footer.
        </CookiePreferencesDescription>
      </CookiePreferencesHeader>
      <CookieCategoryList />
      <CookiePreferencesFooter>
        <CookieRejectAllButton variant="ghost" />
        <CookieSavePreferencesButton />
      </CookiePreferencesFooter>
    </CookiePreferencesContent>
  )
}

/** Hero: a floating bottom-right banner wired to a full preferences dialog. Replays via Reset. */
export function CookieBannerDemo() {
  const [round, setRound] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)

  return (
    <CookieFrame className="min-h-80">
      <CookieConsent
        key={round}
        categories={COOKIE_CATEGORIES}
        onAcceptAll={() => setDismissed(true)}
        onRejectAll={() => setDismissed(true)}
        onSave={() => setDismissed(true)}
      >
        <CookieBanner className="absolute" position="bottom-right">
          <CookieBannerIcon>
            <Cookie weight="bold" />
          </CookieBannerIcon>
          <CookieBannerContent>
            <CookieBannerTitle>We value your privacy</CookieBannerTitle>
            <CookieBannerDescription>
              We use cookies to enhance your experience and analyse traffic. Read our{" "}
              <a href="#" className="font-medium text-foreground underline underline-offset-4">
                Cookie Policy
              </a>
              .
            </CookieBannerDescription>
          </CookieBannerContent>
          <CookieBannerActions>
            <CookieCustomizeButton size="sm" />
            <CookieRejectAllButton size="sm" />
            <CookieAcceptAllButton size="sm" />
          </CookieBannerActions>
        </CookieBanner>

        <CookiePreferences>
          <PreferencesDialog />
        </CookiePreferences>
      </CookieConsent>

      {dismissed ? (
        <div className="absolute inset-0 grid place-items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDismissed(false)
              setRound((r) => r + 1)
            }}
          >
            <ArrowClockwise weight="bold" /> Replay banner
          </Button>
        </div>
      ) : null}
    </CookieFrame>
  )
}

/** Position: a full-bleed bottom bar vs. a floating corner card. */
export function CookiePositionsDemo() {
  return (
    <div className="grid w-full gap-4">
      <CookieFrame className="min-h-44">
        <CookieConsent categories={COOKIE_CATEGORIES}>
          <CookieBanner className="absolute" position="bottom">
            <CookieBannerContent>
              <CookieBannerTitle>Cookies on this site</CookieBannerTitle>
              <CookieBannerDescription>
                A full-width bar lays its copy and actions out in a row on wide screens.
              </CookieBannerDescription>
            </CookieBannerContent>
            <CookieBannerActions>
              <CookieCustomizeButton size="sm" />
              <CookieRejectAllButton size="sm" />
              <CookieAcceptAllButton size="sm" />
            </CookieBannerActions>
          </CookieBanner>
          <CookiePreferences>
            <PreferencesDialog />
          </CookiePreferences>
        </CookieConsent>
      </CookieFrame>

      <CookieFrame className="min-h-72">
        <CookieConsent categories={COOKIE_CATEGORIES}>
          <CookieBanner className="absolute" position="bottom-left">
            <CookieBannerIcon>
              <Cookie weight="bold" />
            </CookieBannerIcon>
            <CookieBannerContent>
              <CookieBannerTitle>We value your privacy</CookieBannerTitle>
              <CookieBannerDescription>
                A compact corner card that stacks its content and stretches its actions.
              </CookieBannerDescription>
            </CookieBannerContent>
            <CookieBannerActions>
              <CookieRejectAllButton size="sm" />
              <CookieAcceptAllButton size="sm" />
            </CookieBannerActions>
          </CookieBanner>
          <CookiePreferences>
            <PreferencesDialog />
          </CookiePreferences>
        </CookieConsent>
      </CookieFrame>
    </div>
  )
}

/** Preferences dialog: opened from a standalone "Cookie settings" trigger (banner already dismissed). */
export function CookiePreferencesDemo() {
  return (
    <CookieConsent categories={COOKIE_CATEGORIES} defaultConsented>
      <CookiePreferences>
        <CookiePreferencesTrigger asChild>
          <Button variant="outline">
            <Gear weight="bold" /> Cookie settings
          </Button>
        </CookiePreferencesTrigger>
        <CookiePreferencesContent>
          <CookiePreferencesHeader>
            <CookiePreferencesTitle>Cookie preferences</CookiePreferencesTitle>
            <CookiePreferencesDescription>
              Choose which cookies we can use. Strictly necessary cookies are always on.
            </CookiePreferencesDescription>
          </CookiePreferencesHeader>
          <CookieCategoryList />
          <CookiePreferencesFooter>
            <CookieRejectAllButton variant="ghost" />
            <CookieAcceptAllButton variant="secondary" />
            <CookieSavePreferencesButton />
          </CookiePreferencesFooter>
        </CookiePreferencesContent>
      </CookiePreferences>
    </CookieConsent>
  )
}
