"use client"

import {
  XLogo,
  InstagramLogo,
  LinkedinLogo,
  GithubLogo,
  YoutubeLogo,
  ArrowRight,
} from "@phosphor-icons/react"

import {
  Footer,
  FooterTop,
  FooterBrand,
  FooterTagline,
  FooterColumns,
  FooterColumn,
  FooterLink,
  FooterSocial,
  FooterSocialLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { InputRoot, InputField } from "@/components/ui/input"
import { NewsletterForm } from "@/components/ui/newsletter-form"
import { BrandMark } from "@/components/landing/brand-mark"

const COLUMNS = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Resources", links: ["Docs", "Help center", "Community", "Status"] },
]

function Social() {
  return (
    <FooterSocial>
      <FooterSocialLink href="#" aria-label="X">
        <XLogo weight="bold" />
      </FooterSocialLink>
      <FooterSocialLink href="#" aria-label="Instagram">
        <InstagramLogo weight="bold" />
      </FooterSocialLink>
      <FooterSocialLink href="#" aria-label="LinkedIn">
        <LinkedinLogo weight="bold" />
      </FooterSocialLink>
      <FooterSocialLink href="#" aria-label="GitHub">
        <GithubLogo weight="bold" />
      </FooterSocialLink>
      <FooterSocialLink href="#" aria-label="YouTube">
        <YoutubeLogo weight="bold" />
      </FooterSocialLink>
    </FooterSocial>
  )
}

function Columns() {
  return (
    <FooterColumns>
      {COLUMNS.map((col) => (
        <FooterColumn key={col.title} title={col.title}>
          {col.links.map((label) => (
            <FooterLink key={label} href="#">
              {label}
            </FooterLink>
          ))}
        </FooterColumn>
      ))}
    </FooterColumns>
  )
}

function Bottom() {
  return (
    <FooterBottom>
      <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
      <FooterLegal>
        <FooterLink href="#">Privacy</FooterLink>
        <FooterLink href="#">Terms</FooterLink>
        <FooterLink href="#">Cookies</FooterLink>
      </FooterLegal>
    </FooterBottom>
  )
}

/** Canonical marketing footer: brand + social, three link columns, legal bottom bar. */
export function FooterDemo() {
  return (
    <Footer>
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>
            The commercial React design system for teams that ship polished products, fast.
          </FooterTagline>
          <Social />
        </FooterBrand>
        <Columns />
      </FooterTop>
      <Bottom />
    </Footer>
  )
}

/** Brand column carries a newsletter signup composed from Input + Button. */
export function FooterNewsletterDemo() {
  return (
    <Footer>
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>Get product updates and design tips. No spam.</FooterTagline>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <InputRoot size="sm" className="w-full max-w-2xs">
              <InputField type="email" placeholder="you@company.com" aria-label="Email address" />
            </InputRoot>
            <Button size="sm" iconOnly aria-label="Subscribe">
              <ArrowRight weight="bold" />
            </Button>
          </form>
        </FooterBrand>
        <Columns />
      </FooterTop>
      <Bottom />
    </Footer>
  )
}

/** A subtle filled panel instead of a hairline rule. */
export function FooterMutedDemo() {
  return (
    <Footer variant="muted">
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>
            The commercial React design system for teams that ship polished products, fast.
          </FooterTagline>
          <Social />
        </FooterBrand>
        <Columns />
      </FooterTop>
      <Bottom />
    </Footer>
  )
}

/** Minimal: a single bottom bar with brand, social, copyright, and legal. */
export function FooterSimpleDemo() {
  return (
    <Footer density="compact">
      <FooterBottom className="mt-0 border-t-0 pt-0">
        <div className="flex items-center gap-3">
          <BrandMark />
          <FooterCopyright>© 2026 Koala UI</FooterCopyright>
        </div>
        <div className="flex items-center gap-4">
          <FooterLegal>
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
          </FooterLegal>
          <Social />
        </div>
      </FooterBottom>
    </Footer>
  )
}

/** Density compact: tighter padding for application shells. */
export function FooterCompactDemo() {
  return (
    <Footer density="compact">
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>Tighter spacing for app shells.</FooterTagline>
          <Social />
        </FooterBrand>
        <Columns />
      </FooterTop>
      <Bottom />
    </Footer>
  )
}

/* ─────────────────────────── footer-section-2 (Image overlay) ────────────────────────────────── */

// The full-bleed media slot that sits BEHIND the nav, so the illustration is the protagonist (the
// Duna / Corgi pattern). Swap the `src` for your own illustration / photo; here it shows a scenic
// Unsplash landscape so the overlay reads finished. A top-and-bottom scrim keeps the white nav
// legible over the brighter middle of the image, while the open band shows the scene through.
function FooterImageBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- demo backdrop; swap for next/Image */}
      <img
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80"
        alt=""
        className="size-full object-cover"
      />
      {/* Scrim: darkens the top (columns) and bottom (legal bar) edges so the white text reads. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/55" />
    </div>
  )
}

const OVERLAY_COLUMNS = [
  { title: "Product", links: ["Components", "Templates", "Themes", "Pricing", "Changelog"] },
  { title: "Solutions", links: ["Startups", "Agencies", "Enterprise", "Education"] },
  { title: "Resources", links: ["Documentation", "Figma kit", "Guides", "Showcase"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Support", links: ["Help center", "Community", "Status", "Changelog"] },
]

/**
 * Image-overlay footer (Duna / Poly pattern): a full-bleed illustration becomes the backdrop and the
 * nav rides on top. The link columns sit at the top, an open scenic band shows the image through the
 * middle, and a minimal copyright + legal bar closes it at the bottom-left. Pure layout over the
 * `Footer` parts: the root goes transparent (`border-t-0 bg-transparent`) so the media reads, and
 * the text stays in foreground/muted tokens so it re-themes (swap in a dark illustration and flip the
 * text to white). Renders `bleed` so the image spans edge to edge; the `Footer` container insets the
 * columns to the 1280px gutter.
 */
export function FooterOverlayDemo() {
  return (
    <div className="relative isolate overflow-hidden border-t border-border">
      <FooterImageBackdrop />
      {/* Transparent root over the media; the column titles ride white via the data-slot override,
          links + copyright go white per element. Drop a dark image and the text already reads. */}
      <Footer className="border-t-0 bg-transparent [&_[data-slot=footer-column-title]]:text-white">
        <FooterColumns className="w-full grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid lg:grid-cols-5 lg:gap-8">
          {OVERLAY_COLUMNS.map((col) => (
            <FooterColumn key={col.title} title={col.title}>
              {col.links.map((label) => (
                <FooterLink key={label} href="#" className="text-white/75 hover:text-white">
                  {label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </FooterColumns>

        {/* Open scenic band: reserves the space where the illustration shows through. */}
        <div aria-hidden className="h-44 sm:h-56 lg:h-64" />

        <FooterBottom className="mt-0 border-t-0 pt-0 sm:justify-start sm:gap-x-8">
          <FooterCopyright className="text-white/75">© 2026 Koala UI</FooterCopyright>
          <FooterLegal>
            <FooterLink href="#" className="text-white/75 hover:text-white">Privacy</FooterLink>
            <FooterLink href="#" className="text-white/75 hover:text-white">Terms</FooterLink>
            <FooterLink href="#" className="text-white/75 hover:text-white">Security</FooterLink>
          </FooterLegal>
        </FooterBottom>
      </Footer>
    </div>
  )
}

/* ─────────────────────────── footer-section-3 (Newsletter strip) ─────────────────────────────── */

const WIDE_COLUMNS = [
  { title: "Product", links: ["Components", "Templates", "Themes", "Pricing", "Changelog"] },
  { title: "Resources", links: ["Documentation", "Figma kit", "Guides", "Showcase", "Blog"] },
  { title: "Company", links: ["About", "Careers", "Customers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "License", "Security"] },
]

/**
 * Newsletter-strip footer (Dovetail / Zendesk pattern): an email-capture band leads on top, a
 * hairline splits it from a wide link grid, and the brand, social, and legal bar close it below.
 * The signup is the canonical NewsletterForm in its `inline` layout, so it ships the
 * loading → success flow out of the box; wire `onSubscribe` to your API.
 */
export function FooterNewsletterStripDemo() {
  return (
    <Footer>
      <div className="flex flex-col gap-6 pb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-semibold tracking-tight text-balance text-foreground">
            Stay in the loop
          </h3>
          <p className="max-w-md text-sm text-pretty text-muted-foreground">
            Product updates, design tips, and the occasional deep dive. No spam, unsubscribe anytime.
          </p>
        </div>
        <NewsletterForm variant="inline" action="Subscribe" className="w-full lg:max-w-md" />
      </div>

      <FooterTop className="border-t border-border pt-10">
        <FooterBrand>
          <BrandMark />
          <FooterTagline>
            The commercial React design system for teams that ship polished products, fast.
          </FooterTagline>
          <Social />
        </FooterBrand>
        <FooterColumns>
          {WIDE_COLUMNS.map((col) => (
            <FooterColumn key={col.title} title={col.title}>
              {col.links.map((label) => (
                <FooterLink key={label} href="#">
                  {label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </FooterColumns>
      </FooterTop>

      <Bottom />
    </Footer>
  )
}

/* ─────────────────────────── footer-section-4 (Newsletter card) ──────────────────────────────── */

/**
 * Newsletter-card footer (Maze / Bird pattern): the brand and link columns sit on the left, and a
 * self-contained NewsletterForm card (heading, lead, fine print) anchors the right. The card brings
 * its own concentric surface and the --surface contract, so the nested input blends with the panel
 * instead of painting a darker block.
 *
 * Responsive: brand + three columns + a 384px card only fit in one row at xl, so the three-way
 * split holds until then (`lg:flex-col … xl:flex-row`). In the lg band the card drops below the
 * columns, capped at max-w-md so it stays a compact card and never bleeds full-width.
 */
export function FooterNewsletterCardDemo() {
  return (
    <Footer>
      <FooterTop className="gap-12 lg:flex-col lg:justify-start xl:flex-row xl:items-start xl:gap-16">
        <div className="flex flex-col gap-10 lg:flex-1 lg:flex-row lg:gap-16">
          <FooterBrand>
            <BrandMark />
            <FooterTagline>
              The commercial React design system for teams that ship polished products, fast.
            </FooterTagline>
            <Social />
          </FooterBrand>
          <Columns />
        </div>
        <NewsletterForm
          variant="card"
          title="Subscribe to our newsletter"
          description="The latest components, templates, and design tips, straight to your inbox."
          fineprint="No spam. Unsubscribe anytime."
          className="w-full shrink-0 sm:max-w-md xl:max-w-sm"
        />
      </FooterTop>
      <Bottom />
    </Footer>
  )
}

/* ─────────────────────────── footer-section-5 (Minimal centered) ─────────────────────────────── */

const CENTERED_NAV = ["Components", "Templates", "Pricing", "Docs", "Blog", "Changelog"]

/**
 * Minimal centered footer (studio / landing pattern): a centered brand mark, a single inline nav
 * row, a capped inline newsletter, the social row, and a centered legal line. For simpler marketing
 * pages that want a light footer instead of a mega link grid.
 */
export function FooterCenteredDemo() {
  return (
    <Footer>
      <div className="flex flex-col items-center gap-8 text-center">
        <BrandMark />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {CENTERED_NAV.map((label) => (
            <FooterLink key={label} href="#">
              {label}
            </FooterLink>
          ))}
        </nav>
        <NewsletterForm variant="inline" action="Subscribe" className="w-full max-w-md" />
        <Social />
      </div>
      <FooterBottom className="items-center justify-center text-center sm:justify-center">
        <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
      </FooterBottom>
    </Footer>
  )
}
