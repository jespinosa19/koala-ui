import type { ComponentType } from "react"
import Link from "next/link"

import { Megaphone, ArrowRight, Rocket, Lightning } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { BannerCountdownSection } from "@/app/docs/components/banner/demos"
import { BentoDemo } from "@/app/docs/components/bento/demos"
import {
  FooterDemo,
  FooterOverlayDemo,
  FooterNewsletterStripDemo,
  FooterNewsletterCardDemo,
  FooterCenteredDemo,
} from "@/app/docs/components/footer/demos"
import {
  GalleryDemo,
  GalleryMarqueeDemo,
  GalleryTabbedDemo,
  GalleryRingDemo,
  GalleryStoryDemo,
  GalleryExpandDemo,
} from "@/app/docs/components/gallery/demos"
import {
  HeroDemo,
  HeroSpotlightDemo,
  HeroMockupDemo,
  HeroDeviceLandscapeDemo,
  HeroDevicePhoneDemo,
  HeroDeviceDuoDemo,
  HeroSplitDemo,
  HeroSplitBleedDemo,
  HeroCollageDemo,
  HeroPhotoPairDemo,
  HeroMarqueeDemo,
  HeroBrandTileDemo,
  HeroVideoDemo,
  HeroImageDemo,
} from "@/app/docs/components/hero/demos"
import { NavbarDemo } from "@/app/docs/components/navbar/demos"
import { PricingDemo } from "@/app/docs/components/pricing/demos"
import { ShowcaseGallery } from "@/components/landing/showcase-gallery"
import {
  VideoShowcaseFrame,
  MinimalTestimonialsContent,
  LogoLedTestimonialsContent,
  SpotlightTestimonialsContent,
  FeatureGridContent,
  FeatureMosaicContent,
  FeatureStrokeContent,
  StatsContent,
  StatsSpotlightContent,
  StatsTrendsContent,
  StatsSplitContent,
  StatsCaptionTopContent,
  StatsCenteredContent,
  StatsPanelContent,
  StatsMediaContent,
  StatsSteppedContent,
  StatsMixedContent,
  FaqContent,
  FaqGroupedContent,
  ChangelogContent,
  ChangelogTimelineContent,
  ChangelogMediaContent,
  ChangelogEditorialContent,
  ChangelogNotesContent,
  BlogContent,
  BlogEditorialContent,
  BlogSidebarContent,
  BlogOverlayContent,
  BlogNotesContent,
  InstallCliContent,
  CtaBandContent,
  CtaEmailCaptureContent,
  CtaBrandBandContent,
  CtaDeviceContent,
  CtaSpotlightContent,
  CtaStatementContent,
  CtaContactFaqContent,
  ContactSplitContent,
  ContactSplitFormContent,
  ContactCenteredContent,
  ContactDirectoryContent,
  LogoCloudContent,
  LogoMarqueeContent,
  LogoBorderedGridContent,
  LogoSplitContent,
  LogoBentoContent,
} from "@/components/docs/section-demos"
import {
  AuthLoginSplitSection,
  AuthLoginCenteredSection,
  AuthSignUpSplitSection,
  AuthSignUpCenteredSection,
  AuthProviderStackSection,
  AuthCommunitySection,
  AuthCommunitySplitSection,
} from "@/components/docs/auth-sections"
import {
  CheckoutBillingSplitSection,
  CheckoutCartSplitSection,
} from "@/components/docs/checkout-sections"
import {
  BlogPostContent,
  BlogPostSidebarContent,
  BlogPostHeroContent,
} from "@/components/docs/blog-post-demos"

/**
 * Docs-facing registry of marketing/application **sections** and **pages** (the organism- and
 * page-level tiers of the atomic ladder; see memory `site-ia-tiers`). Distinct from the
 * CLI-facing `registry.json` (built by scripts/build-registry.mjs, metadata only): this maps a
 * slug to a LIVE React component + its source, the single source of truth read by BOTH the
 * iframe render-target (app/preview/sections/[slug]) and the docs page (app/marketing/...).
 *
 * It MUST stay a server module (no "use client"): a lookup table exported from a client module
 * arrives at the server route as a client-reference proxy and indexes to `undefined` (the same
 * trap the render target guards against with inlined THEME/ACCENT allowlists). The referenced components may themselves
 * be client components, which the server route renders as children just fine. Each section reuses
 * the flagship demo from the matching component docs page, so the slab stays in lockstep with the
 * component (the engine) it is built from.
 */
export interface SectionEntry {
  /** Display name (sidebar + DocHeader). */
  title: string
  /** One-line lead shown under the title. */
  description: string
  /** Which catalog this belongs to. */
  domain: "marketing" | "application"
  /** Atomic tier: a composed slab (`section`) or a full stacked page (`page`). */
  level: "section" | "page"
  /** The live slab, rendered both in the iframe preview and (later) the docs hero. */
  component: ComponentType
  /** Source shown under the "Code" tab (or copied by the toolbar when `locked`). */
  code: string
  /** Gate the source behind the PRO "Get full code" lock while keeping the live preview. */
  locked?: boolean
  /**
   * Render full-bleed and pinned to the top of a short page region instead of inside the
   * centered marketing gutter. For thin site-wide bars (Banner) that span edge to edge and sit
   * atop a page rather than as a centered card. See the render target.
   */
  bleed?: boolean
  /**
   * The slab is already its own band: it brings its OWN full padding on BOTH axes, the horizontal
   * gutter + width cap AND the vertical rhythm (e.g. Hero, Navbar, Footer, each of which centers and
   * pads itself). Composers (the home page, the preview render target) then render it raw, skipping
   * BOTH the band's vertical padding and the centered SectionContainer gutter, so the page rhythm
   * keeps a SINGLE owner and the slab is never double-padded on either axis.
   */
  ownsPadding?: boolean
  /**
   * Floor for the PreviewFrame iframe height (a CSS length, e.g. `"40rem"`). Set it to a tall slab's
   * own fixed min-height so the frame never sits at its default short floor while heavy media (a
   * background video, large photos) still loads, which would otherwise strand the slab scrolling
   * inside the iframe until the late re-measure. Match the slab's min-height exactly so there is no
   * empty gap below it either.
   */
  minHeight?: string
}

const BANNER_SOFT_CODE = `<Banner variant="purple" dismissible>
  <BannerIcon>
    <Megaphone />
  </BannerIcon>
  <BannerContent>New: cream and moonlight themes just landed.</BannerContent>
  <BannerAction href="#">
    Check it out
    <ArrowRight />
  </BannerAction>
</Banner>`

const BANNER_BRAND_CODE = `<Banner appearance="solid" variant="brand" dismissible>
  <BannerIcon>
    <Rocket />
  </BannerIcon>
  <BannerContent>Koala UI v1.0 is here.</BannerContent>
  <BannerAction href="#">
    Read the release notes
    <ArrowRight />
  </BannerAction>
</Banner>`

const BANNER_DARK_CODE = `<Banner appearance="solid" variant="default" dismissible>
  <BannerIcon>
    <Megaphone />
  </BannerIcon>
  <BannerContent>GeneriCon 2026 · Join us in Denver from June 7 to 9.</BannerContent>
  <BannerAction href="#">
    Register now
    <ArrowRight />
  </BannerAction>
</Banner>`

const BANNER_CTA_CODE = `<Banner align="between" variant="info" dismissible>
  <BannerIcon>
    <Lightning />
  </BannerIcon>
  <BannerContent>You have 14 days left in your free trial.</BannerContent>
  <Button size="sm" asChild>
    <a href="#">Upgrade</a>
  </Button>
</Banner>`

const BANNER_COUNTDOWN_CODE = `"use client"

import * as React from "react"
import { Tag, ArrowRight } from "@phosphor-icons/react"

import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"

// 2 days, 14 hours, 53 minutes, 9 seconds. A constant initial value keeps the first server and
// client renders identical (no hydration mismatch); the effect re-anchors to a real deadline.
const SALE_DURATION_MS = ((2 * 24 + 14) * 60 + 53) * 60_000 + 9_000

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = React.useState(durationMs)

  React.useEffect(() => {
    const deadline = Date.now() + durationMs
    function tick() {
      setRemaining(Math.max(0, deadline - Date.now()))
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [durationMs])

  const s = Math.floor(remaining / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const pad = (n: number) => n.toString().padStart(2, "0")

function BannerCountdown() {
  const { days, hours, minutes, seconds } = useCountdown(SALE_DURATION_MS)
  const units: Array<[number, string]> = [
    [days, "d"],
    [hours, "h"],
    [minutes, "m"],
    [seconds, "s"],
  ]
  const label =
    days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds remaining"

  return (
    <span role="timer" aria-label={label} className="inline-flex items-center gap-1">
      {units.map(([value, unit]) => (
        <span
          key={unit}
          aria-hidden
          className="inline-flex items-baseline gap-0.5 rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 leading-none"
        >
          <span className="text-sm font-semibold tabular-nums">{pad(value)}</span>
          <span className="text-xs font-medium text-muted-foreground">{unit}</span>
        </span>
      ))}
    </span>
  )
}

export function SaleCountdownBanner() {
  return (
    <Banner variant="orange" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Tag />
      </BannerIcon>
      <BannerContent>Summer sale ends in</BannerContent>
      <BannerCountdown />
      <BannerAction href="#">
        Shop the sale
        <ArrowRight />
      </BannerAction>
    </Banner>
  )
}`

const BENTO_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Features</Badge>
    <SectionHeaderHeading>Everything you need to ship</SectionHeaderHeading>
    <SectionHeaderDescription>
      A complete toolkit of polished components, theming, and assets.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<Bento>
  {/* Top row: two wide tiles. */}
  <BentoItem size="md" tone="brand">
    <BentoItemIcon><Storefront /></BentoItemIcon>
    <BentoItemTitle>Store templates</BentoItemTitle>
    <BentoItemDescription>
      Crafted layouts that highlight product benefits, build trust, and drive conversion.
    </BentoItemDescription>
    <BentoItemImage src="/bento/store.svg" alt="Storefront template preview" />
  </BentoItem>

  <BentoItem size="md" tone="teal">
    <BentoItemIcon><ChartLineUp /></BentoItemIcon>
    <BentoItemTitle>High-converting experience</BentoItemTitle>
    <BentoItemDescription>Structures built for maximum conversion.</BentoItemDescription>
    <BentoItemImage src="/bento/checkout.svg" alt="Checkout flow preview" />
  </BentoItem>

  {/* Bottom row: three tiles. */}
  <BentoItem size="sm" tone="purple">
    <BentoItemIcon><Palette /></BentoItemIcon>
    <BentoItemTitle>Maximum personalization</BentoItemTitle>
    <BentoItemDescription>Customize the components so each project is unique.</BentoItemDescription>
    <BentoItemImage src="/bento/personalize.svg" alt="Personalization preview" />
  </BentoItem>

  <BentoItem size="sm" tone="orange">
    <BentoItemIcon><BookOpen /></BentoItemIcon>
    <BentoItemTitle>Detailed documentation</BentoItemTitle>
    <BentoItemDescription>Maintain consistency with extensive documentation.</BentoItemDescription>
    <BentoItemImage src="/bento/docs.svg" alt="Documentation preview" />
  </BentoItem>

  <BentoItem size="sm" tone="pink">
    <BentoItemIcon><Stack /></BentoItemIcon>
    <BentoItemTitle>All assets in 1 place</BentoItemTitle>
    <BentoItemDescription>Avatars, flags, and every asset, centralized.</BentoItemDescription>
    <BentoItemImage src="/bento/assets.svg" alt="Asset library preview" />
  </BentoItem>
</Bento>`

const FEATURE_SECTION_2_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>See it in motion</Badge>
    <SectionHeaderHeading>See it move before you build it</SectionHeaderHeading>
    <SectionHeaderDescription>
      Every component and section in motion, exactly as it behaves in your product. Press play,
      then drop the same source into your repo.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Concentric radius: rounded-2xl frame over the player's rounded-xl surface. */}
<div className="mx-auto w-full max-w-4xl rounded-2xl border border-border bg-card p-2 shadow-xl">
  <VideoPlayer className="rounded-xl" revealOn="hover">
    <Video src={src} poster={poster} autoPlay loop muted preload="auto" />
    <VideoSpinner />
    <VideoControls>
      <VideoBar>
        <VideoPlayButton />
        <VideoSeek />
        <VideoTime />
        <VideoVolume />
        <VideoFullscreen />
      </VideoBar>
    </VideoControls>
  </VideoPlayer>
</div>`

const TESTIMONIALS_SECTION_2_CODE = `<div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
  {testimonials.map((t) => (
    <Testimonial key={t.name} variant="bare" className="gap-3">
      <TestimonialLogo>{t.logo}</TestimonialLogo>
      <TestimonialQuote className="font-semibold text-foreground">{t.headline}</TestimonialQuote>
      <p className="text-sm text-pretty text-muted-foreground">{t.body}</p>
      <TestimonialFooter>
        <Avatar>
          <AvatarImage src={\`https://i.pravatar.cc/160?img=\${t.img}\`} alt={t.name} />
          <AvatarFallback>{initials(t.name)}</AvatarFallback>
        </Avatar>
        <TestimonialAuthor>
          <TestimonialName>{t.name}</TestimonialName>
          <TestimonialTitle>{t.title}</TestimonialTitle>
        </TestimonialAuthor>
      </TestimonialFooter>
    </Testimonial>
  ))}
</div>`

const TESTIMONIALS_SECTION_3_CODE = `const AUTOPLAY_MS = 6000

// Advances one slide every AUTOPLAY_MS, wrapping at the end, and pauses while \`paused\` (hover /
// focus). Never starts under prefers-reduced-motion. The Carousel runs controlled off this index.
function useAutoplay(count, delay) {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  React.useEffect(() => {
    if (paused || count <= 1) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), delay)
    return () => window.clearInterval(id)
  }, [paused, count, delay])
  return { index, setIndex, setPaused }
}

// A staggered "assemble" that replays each time a slide becomes active. It's the canonical
// animate-stagger-in-blur keyframe gated on the slide's data-active, so applying it only while active
// re-runs it on every activation with no remount. The RESTING state is the plain, fully-visible
// element (no hidden base), so inactive/peeking slides show their content while you DRAG them in;
// only the moment of activation animates. motion-safe: keeps it off under reduced motion.
const SLIDE_ENTER = "motion-safe:group-data-[active=true]/slide:animate-stagger-in-blur"

// A flanking circular arrow parked in the gutter OUTSIDE the card; wraps around the ends so both
// stay live on every slide. Reveals on hover of the carousel (root carries group) and on focus.
// Press-scale, focus ring, cursor, and the 40px hit target come from Button.
function Arrow({ side, onClick }) {
  const isPrev = side === "prev"
  return (
    <Button
      variant="outline"
      size="lg"
      iconOnly
      tooltip={false}
      aria-label={isPrev ? "Previous testimonial" : "Next testimonial"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full sm:inline-flex",
        "opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 focus-visible:opacity-100",
        isPrev ? "right-full mr-3" : "left-full ml-3",
      )}
    >
      {isPrev ? <CaretLeft weight="bold" /> : <CaretRight weight="bold" />}
    </Button>
  )
}

function SpotlightTestimonials() {
  const count = testimonials.length
  const { index, setIndex, setPaused } = useAutoplay(count, AUTOPLAY_MS)

  return (
    <div
      className="mx-auto w-full max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Carousel index={index} onIndexChange={setIndex} label="Customer testimonials" className="sm:px-16">
        {/* Wrap just the viewport so the flanking arrows center on the CARD, not the dots below it. */}
        <div className="relative">
          <CarouselContent>
            {testimonials.map((t, i) => (
              // group/slide + data-active gate the stagger below (named group so it doesn't collide
              // with the Carousel root's own group, which reveals the arrows).
              <CarouselSlide
                key={t.name}
                className="group/slide px-1"
                data-active={i === index ? "true" : undefined}
              >
                <Testimonial
                  variant="soft"
                  className="grid h-full items-center gap-6 rounded-2xl p-6 sm:gap-8 sm:p-8 md:grid-cols-[auto_1fr] md:p-10"
                >
                  {/* Concentric rounded-xl portrait inside the rounded-2xl card; 1px image-outline.
                      animationDelay staggers each part ~70ms behind the last (the longhand beats the
                      animate-* shorthand's implicit 0 delay). */}
                  <img
                    src={\`https://i.pravatar.cc/480?img=\${t.img}\`}
                    alt={t.name}
                    className={cn(
                      "size-28 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-black/10 sm:size-36 md:size-44 dark:ring-white/10",
                      SLIDE_ENTER,
                    )}
                  />
                  <div className="flex flex-col gap-5">
                    <TestimonialLogo className={cn("ml-0", SLIDE_ENTER)} style={{ animationDelay: "70ms" }}>{t.logo}</TestimonialLogo>
                    <TestimonialQuote className={cn("text-lg leading-relaxed text-foreground sm:text-xl", SLIDE_ENTER)} style={{ animationDelay: "140ms" }}>
                      {t.body}
                    </TestimonialQuote>
                    <TestimonialFooter className={cn("mt-0", SLIDE_ENTER)} style={{ animationDelay: "210ms" }}>
                      <TestimonialAuthor>
                        <TestimonialName>{t.name}</TestimonialName>
                        <TestimonialTitle>{t.title}</TestimonialTitle>
                      </TestimonialAuthor>
                    </TestimonialFooter>
                  </div>
                </Testimonial>
              </CarouselSlide>
            ))}
          </CarouselContent>
          <Arrow side="prev" onClick={() => setIndex((i) => (i - 1 + count) % count)} />
          <Arrow side="next" onClick={() => setIndex((i) => (i + 1) % count)} />
        </div>
        <CarouselIndicators variant="lines" className="mt-6" />
      </Carousel>
    </div>
  )
}`

const FEATURE_SECTION_1_CODE = `<SectionHeader align="center" stagger staggerTrigger="inView">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Components</Badge>
    <SectionHeaderHeading>89 components, ready to use</SectionHeaderHeading>
    <SectionHeaderDescription>
      These are live, not screenshots. Toggle, drag, and open them right here.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* A CSS-multicolumn masonry of real components dropped straight in: no tile chrome,
    no caption, no docs link. Self-contained surfaces (Stat, LoginForm, Chart, Ranking,
    Pricing, Table) interleaved with bare interactive clusters (Slider, Switch, Accordion,
    ToggleGroup, OTPInput, ColorPicker). */}
<div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
  {items.map((item, i) => (
    <div key={i} className="mb-6 break-inside-avoid">{item}</div>
  ))}
</div>

<Button asChild variant="outline" size="lg">
  <a href="/docs">See all components <ArrowRight /></a>
</Button>`

const FEATURE_SECTION_4_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="orange" dot pill>Why Koala UI</Badge>
    <SectionHeaderHeading>The hard parts, already handled</SectionHeaderHeading>
    <SectionHeaderDescription>
      A foundation that handles the hard parts, so your team spends its time on the product.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Minimal ruled grid: only the 1px rules between cells (the bg-border parent through a
    gap-px), no card chrome or icon chip. Each cell fills with bg-background so only the
    rules read. The small brand glyph is the lone accent. */}
<div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
  {features.map((feature) => (
    <div key={feature.title} className="flex flex-col gap-3 bg-background p-8">
      <feature.Icon weight="bold" className="size-5 text-brand" />
      <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        {feature.description}
      </p>
    </div>
  ))}
</div>`

const FEATURE_SECTION_5_CODE = `<SectionHeader align="left">
  <SectionHeaderText>
    <Badge variant="teal" dot pill>Ecosystem</Badge>
    <SectionHeaderHeading>Meet the Koala ecosystem</SectionHeaderHeading>
    <SectionHeaderDescription>
      Everything you need to design and ship a product, from the smallest token to a full
      marketing page, on one consistent system.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* A 2-up wall of image-led tiles. Each is one clickable surface: a cover photo seated behind
    the copy with isolate + -z-10, paired scrims for legibility, a category kicker on top, and the
    surface name + one line at the foot. The corner chip is held back until hover/focus, then it
    unblurs and scales in (scale 0.25→1, opacity 0→1, blur 4px→0). Scale/translate are named
    per-transition (never transform) so they animate, not snap. */}
<div className="grid gap-4 sm:grid-cols-2">
  {tiles.map((tile) => (
    <Link
      key={tile.title}
      href={tile.href}
      className="group relative isolate flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-md ring-1 ring-inset ring-black/10 transition-[translate,scale,box-shadow] duration-base ease-out hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] sm:p-6 dark:ring-white/10"
    >
      <img src={tile.src} alt={tile.alt} className="absolute inset-0 -z-10 size-full object-cover transition-[scale] duration-slow ease-out group-hover:scale-[1.03]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">{tile.eyebrow}</span>
        <span aria-hidden className="flex size-8 shrink-0 scale-[0.25] items-center justify-center rounded-full bg-white/20 text-white opacity-0 shadow-sm blur-[4px] ring-1 ring-inset ring-white/30 backdrop-blur-none transition-[scale,opacity,filter,backdrop-filter] duration-base ease-out group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0 group-hover:backdrop-blur-md">
          <ArrowUpRight weight="bold" className="size-4" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-balance text-white sm:text-xl">{tile.title}</h3>
        <p className="text-sm text-pretty text-white/70">{tile.description}</p>
      </div>
    </Link>
  ))}
</div>`

const FEATURE_SECTION_6_CODE = `<SectionHeader align="left">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Built in</Badge>
    <SectionHeaderHeading>Everything the system already handles</SectionHeaderHeading>
    <SectionHeaderDescription>
      Five foundations working together on every screen you ship, so the hard parts are done
      before you start.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Stroke column wall: each column hangs from a full-height hairline stroke on its left edge,
    capped at the top by a thicker brand accent segment. The tall min height is gated to lg (the
    narrow five-up layout) for editorial presence; below that, one- and two-column rows compact to
    their content rather than trailing a long empty stroke. gap-x keeps a column's copy clear of the
    next stroke. Steps from one column to five as the frame widens. */}
<div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
  {features.map((feature) => (
    <div key={feature.title} className="relative pl-6 lg:min-h-56">
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
      <span aria-hidden className="absolute left-0 top-0 h-8 w-0.5 bg-brand" />
      <h3 className="text-base font-semibold text-balance text-foreground">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
        {feature.description}
      </p>
    </div>
  ))}
</div>`

const STATS_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>In the box</Badge>
    <SectionHeaderHeading>The whole library, counted</SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>

{/* Minimal ruled grid: only the 1px rules between figures (the bg-border parent through a gap-px),
    no container, frame, or cell fill. The Stats run flush. */}
<div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
  {metrics.map((metric) => (
    <Stat
      key={metric.label}
      density="comfortable"
      className="items-center gap-1.5 rounded-none border-0 bg-background p-8 text-center shadow-none"
    >
      <StatValue countUp className="text-3xl sm:text-4xl">{metric.value}</StatValue>
      <StatLabel>{metric.label}</StatLabel>
    </Stat>
  ))}
</div>`

const STATS_SECTION_2_CODE = `<SectionHeader align="left" orientation="split">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Outcomes</Badge>
    <SectionHeaderHeading>Like hiring a design team overnight</SectionHeaderHeading>
    <SectionHeaderDescription>
      Teams that standardize on Koala ship accessible, finished interfaces in a fraction of the
      time, on one system across every surface.
    </SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <Button size="lg">Get started<ArrowRight /></Button>
  </SectionHeaderActions>
</SectionHeader>

<div className="flex flex-col gap-8 border-t border-border pt-10">
  <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border">
    {metrics.map((metric) => (
      <Stat
        key={metric.eyebrow}
        density="comfortable"
        className="min-h-44 gap-3 border-0 bg-transparent p-0 shadow-none lg:px-8 lg:first:pl-0 lg:last:pr-0"
      >
        <StatLabel className="text-xs font-semibold uppercase tracking-wider text-brand">
          {metric.eyebrow}
        </StatLabel>
        <StatValue countUp className="text-4xl sm:text-5xl">{metric.value}</StatValue>
        <StatCaption className="mt-auto pt-6">{metric.caption}</StatCaption>
      </Stat>
    ))}
  </div>
  <p className="text-sm text-muted-foreground">
    *From the 2026 Koala UI design systems survey of 400+ product teams.{" "}
    <a className="font-medium text-foreground underline-offset-4 hover:underline">Read the report</a>
  </p>
</div>`

const STATS_SECTION_3_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Momentum</Badge>
    <SectionHeaderHeading>Growing with every release</SectionHeaderHeading>
    <SectionHeaderDescription>How adoption of the library is trending, quarter over quarter.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
  {metrics.map((metric) => {
    const Icon = metric.icon
    return (
      <Stat
        key={metric.label}
        variant="outline"
        density="comfortable"
        className="items-center gap-3 bg-transparent p-8"
      >
        <StatIcon className="size-12 rounded-full border border-border bg-transparent text-muted-foreground [&>svg]:size-6"><Icon /></StatIcon>
        <StatValue countUp className="text-4xl">{metric.value}</StatValue>
        <StatLabel>{metric.label}</StatLabel>
        <StatTrend direction={metric.direction} inverted={metric.inverted}>{metric.delta}</StatTrend>
      </Stat>
    )
  })}
</div>`

const STATS_SECTION_4_CODE = `<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
  <SectionHeader align="left">
    <SectionHeaderText>
      <Badge variant="info" dot pill>Coverage</Badge>
      <SectionHeaderHeading>One system, fully measured</SectionHeaderHeading>
      <SectionHeaderDescription>
        Every figure below is something you get on install, not a line on a roadmap.
      </SectionHeaderDescription>
    </SectionHeaderText>
  </SectionHeader>

  <div className="grid grid-cols-2 gap-x-8 gap-y-10">
    {metrics.map((metric) => (
      <Stat key={metric.label} density="comfortable" className="gap-1 border-0 bg-transparent p-0 shadow-none">
        <StatValue countUp className="text-4xl sm:text-5xl">{metric.value}</StatValue>
        <StatLabel>{metric.label}</StatLabel>
      </Stat>
    ))}
  </div>
</div>`

const STATS_SECTION_5_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Reach</Badge>
    <SectionHeaderHeading>Adoption you can measure</SectionHeaderHeading>
    <SectionHeaderDescription>Teams, installs, and time-to-ship, counted across everyone building on Koala.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="grid gap-x-10 gap-y-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border">
  {metrics.map((metric) => (
    <Stat
      key={metric.caption}
      density="comfortable"
      className="min-h-44 gap-4 border-0 bg-transparent p-0 shadow-none lg:px-8 lg:first:pl-0 lg:last:pr-0"
    >
      <StatCaption>{metric.caption}</StatCaption>
      <StatValue countUp className="mt-auto text-4xl sm:text-5xl">{metric.value}</StatValue>
    </Stat>
  ))}
</div>`

const STATS_SECTION_6_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Why teams stay</Badge>
    <SectionHeaderHeading>Built for products in production</SectionHeaderHeading>
    <SectionHeaderDescription>The things that matter after launch day, not just on it.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="grid gap-12 text-center sm:grid-cols-3 sm:gap-10">
  {metrics.map((metric) => (
    <Stat
      key={metric.title}
      density="comfortable"
      className="items-center gap-2 border-0 bg-transparent p-0 shadow-none"
    >
      <StatValue countUp className="text-4xl sm:text-5xl">{metric.value}</StatValue>
      <StatLabel className="text-base font-semibold text-foreground">{metric.title}</StatLabel>
      <StatCaption className="mt-1 max-w-xs">{metric.caption}</StatCaption>
    </Stat>
  ))}
</div>`

const STATS_SECTION_7_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>At a glance</Badge>
    <SectionHeaderHeading>The numbers behind the polish</SectionHeaderHeading>
    <SectionHeaderDescription>
      From the teams building on it to the parts in the box, here is Koala by the figures.
    </SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <Button size="lg">Get started<ArrowRight weight="bold" /></Button>
    <Button variant="outline" size="lg">Explore components</Button>
  </SectionHeaderActions>
</SectionHeader>

{/* The elevated inverse panel: the neutral inverse pair (bg-foreground / text-background) flips with
    the theme, so the band reads dark-on-light in light themes and light-on-dark in dark ones with no
    bespoke color. Figures run flush (Stat chrome stripped) and keep tabular-nums so the row stays steady. */}
<div className="rounded-3xl bg-foreground p-8 text-background shadow-lg sm:p-10 lg:p-12">
  <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
    {metrics.map((metric) => (
      <Stat
        key={metric.label}
        density="comfortable"
        className="items-start gap-1.5 border-0 bg-transparent p-0 text-left shadow-none"
      >
        <StatValue countUp className="text-4xl text-background sm:text-5xl">{metric.value}</StatValue>
        <StatLabel className="text-background/70">{metric.label}</StatLabel>
      </Stat>
    ))}
  </div>
</div>`

const STATS_SECTION_8_CODE = `<div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
  {/* Left: the lede, a supporting photo, and its caption. */}
  <div className="flex flex-col gap-10">
    <SectionHeader align="left">
      <SectionHeaderText>
        <Badge variant="success" dot pill>The story in numbers</Badge>
        <SectionHeaderHeading>Numbers with a team behind them</SectionHeaderHeading>
        <SectionHeaderDescription>
          From the teams shipping on it to the parts in the box, these figures trace a design
          system built to feel finished.
        </SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button size="lg">Get started<ArrowRight weight="bold" /></Button>
        <Button variant="outline" size="lg">Explore components</Button>
      </SectionHeaderActions>
    </SectionHeader>

    <figure className="flex flex-col gap-4">
      {/* DS image outline (ring-1 ring-inset ring-black/10 dark:ring-white/10) so the photo never floats edgeless. */}
      <img
        src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80"
        alt="A product team collaborating in a bright studio"
        className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
      />
      <figcaption className="flex flex-col gap-1">
        <p className="text-lg font-semibold text-balance text-foreground">Loved by the teams who ship on it</p>
        <p className="text-sm text-pretty text-muted-foreground">
          Recognized for accessible, polished components that arrive finished, not almost-finished.
        </p>
      </figcaption>
    </figure>
  </div>

  {/* Right: a narrated vertical list, one detailed metric per block. */}
  <div className="flex flex-col gap-10 lg:gap-12">
    {metrics.map((metric) => (
      <Stat
        key={metric.label}
        density="comfortable"
        className="gap-2 border-0 bg-transparent p-0 shadow-none"
      >
        <StatValue countUp className="text-5xl sm:text-6xl">{metric.value}</StatValue>
        <StatLabel className="text-base font-semibold text-foreground">{metric.label}</StatLabel>
        <StatCaption className="max-w-md">{metric.caption}</StatCaption>
      </Stat>
    ))}
  </div>
</div>`

const STATS_SECTION_9_CODE = `<SectionHeader align="left">
  <SectionHeaderText className="max-w-2xl">
    <Badge variant="purple" dot pill>By the numbers</Badge>
    <SectionHeaderHeading>We build the foundation, teams build the product</SectionHeaderHeading>
    <SectionHeaderDescription>
      The proof is in what teams do with it: source pulled every day, engineering time saved,
      and finished screens shipped across every surface.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* The staircase: bottoms align (lg:items-end) while each card keeps its own lg min-height, so the
    tops step. The figure pins to the TOP of each card and the label + line drop to the bottom
    (mt-auto). Three tone treatments carry the emphasis: a muted card, the theme-flipping inverse
    panel (bg-foreground / text-background), and the brand-accent card (bg-brand text-white). */}
<div className="grid gap-4 sm:grid-cols-3 sm:gap-6 lg:items-end">
  {metrics.map((metric) => {
    const tone = TONES[metric.tone] // muted | dark | brand → root/value/label/caption colors
    return (
      <Stat
        key={metric.value}
        density="comfortable"
        className={cn("rounded-2xl p-8", tone.root, metric.height)}
      >
        <StatValue countUp className={cn("text-3xl sm:text-4xl", tone.value)}>{metric.value}</StatValue>
        <div className="mt-auto flex flex-col gap-2 pt-10">
          <StatLabel className={cn("text-base font-semibold text-balance", tone.label)}>
            {metric.label}
          </StatLabel>
          <StatCaption className={tone.caption}>{metric.caption}</StatCaption>
        </div>
      </Stat>
    )
  })}
</div>`

const STATS_SECTION_10_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="teal" dot pill>Trusted by teams</Badge>
    <SectionHeaderHeading>52,800 hours and a mountain of rebuilds, saved</SectionHeaderHeading>
  </SectionHeaderText>
</SectionHeader>

{/* Mixed band: oversized figures and logo-led voices share ONE aligned three-column grid. */}
<div className="flex flex-col gap-12 sm:gap-14">
  {/* Row 1 — the headline figures (mt-auto lands every figure on a shared baseline). */}
  <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
    {metrics.map((metric) => (
      <Stat key={metric.value} variant="default" density="comfortable" className="gap-8 rounded-2xl p-8 sm:min-h-56">
        <StatLabel>{metric.prefix}</StatLabel>
        <div className="mt-auto flex flex-col gap-3">
          <StatValue countUp className="text-5xl sm:text-6xl">{metric.value}</StatValue>
          <StatCaption>{metric.caption}</StatCaption>
        </div>
      </Stat>
    ))}
  </div>

  {/* Row 2 — logo-led voices aligned to the same three columns. */}
  <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
    {testimonials.map((t) => (
      <Testimonial key={t.name} variant="bare" divided className="gap-5">
        <div className="flex flex-col gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10">
            <BrandMark className="size-6" />
          </div>
          <TestimonialName className="text-base">{t.brand}</TestimonialName>
        </div>
        <TestimonialQuote className="text-base leading-relaxed">{t.body}</TestimonialQuote>
        <TestimonialFooter>
          <TestimonialAuthor>
            <TestimonialName className="font-medium text-muted-foreground">{t.name}</TestimonialName>
            <TestimonialTitle>{t.title}</TestimonialTitle>
          </TestimonialAuthor>
        </TestimonialFooter>
      </Testimonial>
    ))}
  </div>
</div>`

const PRICING_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Pricing</Badge>
    <SectionHeaderHeading>Simple, transparent pricing</SectionHeaderHeading>
    <SectionHeaderDescription>
      Start free and upgrade as your team grows. No hidden fees, cancel anytime.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<Pricing>
  {tiers.map((tier) => (
    <PricingTier key={tier.id} featured={tier.featured}>
      <PricingName>{tier.name}</PricingName>
      <PricingPrice>{tier.price}</PricingPrice>
      <PricingFeatures>{/* PricingFeature × N */}</PricingFeatures>
      <PricingAction>{tier.cta.label}</PricingAction>
    </PricingTier>
  ))}
</Pricing>`

const FAQ_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>FAQ</Badge>
    <SectionHeaderHeading>Questions, answered</SectionHeaderHeading>
    <SectionHeaderDescription>Everything worth knowing before you install.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<Accordion type="single" collapsible variant="separated" className="mx-auto max-w-3xl">
  {faq.map((item, i) => (
    <AccordionItem key={item.question} value={\`item-\${i}\`}>
      <AccordionTrigger>{item.question}</AccordionTrigger>
      <AccordionContent>{item.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>`

const FAQ_SECTION_2_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>FAQ</Badge>
    <SectionHeaderHeading>Answers, by topic</SectionHeaderHeading>
    <SectionHeaderDescription>Browse the common questions, grouped by what you are trying to do.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* The same questions, split into topic groups. Each FaqsGroup is its own minimal list,
    so single-expand is scoped per topic. */}
<Faqs>
  {faqTopics.map((group) => (
    <FaqsGroup key={group.topic} title={group.topic}>
      {group.questions.map((item, i) => (
        <FaqsItem key={item.question} value={\`\${group.topic}-\${i}\`} question={item.question}>
          {item.answer}
        </FaqsItem>
      ))}
    </FaqsGroup>
  ))}
</Faqs>`

const CHANGELOG_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Changelog</Badge>
    <SectionHeaderHeading>What shipped recently</SectionHeaderHeading>
    <SectionHeaderDescription>The library gains components and refinements every month.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="mx-auto flex max-w-3xl flex-col gap-4">
  {changelog.map((entry) => (
    <article key={entry.version} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 sm:flex-row sm:gap-6">
      <div className="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start">
        <Badge variant="info" dot pill>{entry.version}</Badge>
        <time className="text-sm text-muted-foreground tabular-nums">{entry.date}</time>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{entry.title}</h3>
        <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
      </div>
    </article>
  ))}
</div>`

const CHANGELOG_SECTION_2_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Changelog</Badge>
    <SectionHeaderHeading>Every release, in order</SectionHeaderHeading>
    <SectionHeaderDescription>The full version history as one continuous thread, newest first.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Composes the canonical ActivityFeed: the connecting rail is pure layout, no JS.
    The marker stays neutral (default tone) so the small category Badge carries the only color. */}
<div className="mx-auto w-full max-w-2xl">
  <ActivityFeed>
    {changelog.map((entry) => (
      <ActivityItem key={entry.version}>
        <ActivityMarker>
          <ActivityIcon>
            <entry.icon />
          </ActivityIcon>
        </ActivityMarker>
        <ActivityContent className="pb-8">
          <ActivityHeader className="gap-2">
            <Badge variant="outline" pill className="tabular-nums">{entry.version}</Badge>
            <Badge variant={BADGE[entry.category]} pill>{entry.category}</Badge>
            <ActivityTime>{entry.date}</ActivityTime>
          </ActivityHeader>
          <h3 className="mt-1.5 font-semibold text-foreground">{entry.title}</h3>
          <ActivityBody>{entry.description}</ActivityBody>
        </ActivityContent>
      </ActivityItem>
    ))}
  </ActivityFeed>
</div>`

const CHANGELOG_SECTION_3_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Changelog</Badge>
    <SectionHeaderHeading>New in Koala UI</SectionHeaderHeading>
    <SectionHeaderDescription>The most recent releases, each with a cover and a short note.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="flex flex-col gap-8">
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {changelog.map((entry) => (
      <article
        key={entry.version}
        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-[transform,box-shadow] duration-base ease-out hover:-translate-y-1 hover:shadow-md"
      >
        <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-muted">
          <div className={cn("grid size-14 place-items-center rounded-xl border transition-transform duration-base ease-out group-hover:scale-110 [&>svg]:size-7", TILE[entry.category])}>
            <entry.icon />
          </div>
          <Badge variant={BADGE[entry.category]} pill className="absolute left-3 top-3">{entry.category}</Badge>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <time className="tabular-nums">{entry.date}</time>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{entry.version}</span>
          </div>
          <h3 className="font-semibold text-foreground">{entry.title}</h3>
          <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
        </div>
      </article>
    ))}
  </div>
  <div className="flex justify-center">
    <Button asChild variant="ghost">
      <Link href="/docs">See all releases</Link>
    </Button>
  </div>
</div>`

const CHANGELOG_SECTION_4_CODE = `{/* The lede lives in the sticky left rail, so this variant embeds its own SectionHeader. */}
<div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-16">
  <div className="lg:sticky lg:top-8 lg:self-start">
    <SectionHeader align="left">
      <SectionHeaderText>
        <Badge variant="success" dot pill>Changelog</Badge>
        <SectionHeaderHeading>Every update, in one place</SectionHeaderHeading>
        <SectionHeaderDescription>Follow along as the library grows. New components and refinements ship every month.</SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button asChild variant="outline">
          <Link href="/docs">Read the docs</Link>
        </Button>
      </SectionHeaderActions>
    </SectionHeader>
  </div>

  <ol className="flex flex-col divide-y divide-border">
    {changelog.map((entry) => (
      <li key={entry.version} className="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-8">
        <div className="flex shrink-0 items-center gap-2 sm:w-36 sm:flex-col sm:items-start sm:pt-0.5">
          <time className="text-sm text-muted-foreground tabular-nums">{entry.date}</time>
          <Badge variant={BADGE[entry.category]} pill>{entry.category}</Badge>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{entry.title}</h3>
            <Badge variant="outline" pill className="tabular-nums">{entry.version}</Badge>
          </div>
          <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
        </div>
      </li>
    ))}
  </ol>
</div>`

const CHANGELOG_SECTION_5_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Changelog</Badge>
    <SectionHeaderHeading>Latest updates</SectionHeaderHeading>
    <SectionHeaderDescription>A running log of what shipped, newest first.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* The barest editorial log: a date pill, a bold title, and a note per release, split by hairlines. */}
<ol className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border">
  {changelog.map((entry) => (
    <li key={entry.version} className="flex flex-col items-start gap-3.5 py-8 first:pt-0 last:pb-0">
      <Badge variant="outline" size="lg" className="tabular-nums">{entry.date}</Badge>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-balance text-foreground">{entry.title}</h3>
        <p className="text-pretty text-muted-foreground">{entry.description}</p>
      </div>
    </li>
  ))}
</ol>`

const BLOG_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Blog</Badge>
    <SectionHeaderHeading>From the Koala blog</SectionHeaderHeading>
    <SectionHeaderDescription>Product notes, engineering deep-dives, and the thinking behind the system.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* One hue per topic, drawn from the categorical Badge variants so chips re-theme with the system. */}
const tone = { Product: "info", Engineering: "purple", Design: "pink", Company: "teal" }
{/* Title hover: a link-style underline that fades in via decoration-color (transparent -> current),
    so it animates with no layout shift and follows each wrapped line. Never the brand fill. */}
const titleHover = "underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-base ease-out group-hover:decoration-current"
const [active, setActive] = useState("All")
const showFeatured = active === "All"
const visible = showFeatured ? posts : posts.filter((p) => p.category === active)
const [featured, ...rest] = visible

<div className="flex flex-col gap-12">
  <ToggleGroup
    type="single"
    value={active}
    onValueChange={(value) => setActive(value || "All")}
    size="sm"
    className="w-full flex-wrap justify-center gap-2"
    aria-label="Filter articles by category"
  >
    {["All", "Product", "Engineering", "Design", "Company"].map((category) => (
      <ToggleGroupItem key={category} value={category}>{category}</ToggleGroupItem>
    ))}
  </ToggleGroup>

  {/* Keyed by the filter so the stagger replays as the set recomposes. */}
  <div key={active} className="flex flex-col gap-12">
    {showFeatured && featured && (
      <a href={featured.href} className="group grid animate-stagger-in cursor-pointer items-center gap-6 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:gap-8 lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-inset ring-foreground/10">
          <img src={featured.cover} alt={featured.coverAlt} className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-col items-start gap-4">
          <Badge variant={tone[featured.category]}>{featured.category}</Badge>
          <h3 className={\`text-2xl font-semibold leading-snug text-balance sm:text-3xl \${titleHover}\`}>{featured.title}</h3>
          <p className="text-pretty text-muted-foreground">{featured.excerpt}</p>
          <BlogMeta post={featured} />
        </div>
      </a>
    )}

    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {(showFeatured ? rest : visible).map((post) => (
        <a key={post.slug} href={post.href} className="group flex animate-stagger-in cursor-pointer flex-col gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-inset ring-foreground/10">
            <img src={post.cover} alt={post.coverAlt} className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]" />
          </div>
          <div className="flex flex-1 flex-col items-start gap-2">
            <Badge variant={tone[post.category]}>{post.category}</Badge>
            <h3 className={\`text-lg font-semibold leading-snug text-balance \${titleHover}\`}>{post.title}</h3>
            <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{post.excerpt}</p>
            <BlogMeta post={post} />
          </div>
        </a>
      ))}
    </div>
  </div>
</div>

{/* BlogMeta: author avatar + name, then a tabular date and reading time. */}
<div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-sm text-muted-foreground">
  <Avatar size="sm"><AvatarImage src={post.author.avatar} alt="" /><AvatarFallback>{post.author.initials}</AvatarFallback></Avatar>
  <span className="font-medium text-foreground">{post.author.name}</span>
  <span aria-hidden className="text-border">&middot;</span>
  <time className="tabular-nums">{post.date}</time>
  <span aria-hidden className="text-border">&middot;</span>
  <span className="tabular-nums">{post.readingTime}</span>
</div>`

const BLOG_SECTION_2_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Writing</Badge>
    <SectionHeaderHeading>Latest from the team</SectionHeaderHeading>
    <SectionHeaderDescription>Notes on the craft, shipped as we learn. A minimal, text-first index.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Text-forward list: no covers, title-led rows split by hairlines, with a trailing arrow that
    slides in on hover. \`titleHover\` and \`tone\` are the shared helpers from blog-section-1. */}
<div className="mx-auto flex w-full max-w-3xl flex-col divide-y divide-border">
  {posts.map((post, i) => (
    <a
      key={post.slug}
      href={post.href}
      style={{ animationDelay: \`\${i * 60}ms\` }}
      className="group flex animate-stagger-in flex-col items-start gap-3 py-7 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset sm:grid sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-10"
    >
      <div className="flex flex-col items-start gap-2.5">
        <Badge variant={tone[post.category]} size="sm">{post.category}</Badge>
        <h3 className={\`text-xl font-semibold leading-snug text-balance \${titleHover}\`}>{post.title}</h3>
        <p className="max-w-2xl text-pretty text-muted-foreground">{post.excerpt}</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar size="xs"><AvatarImage src={post.author.avatar} alt="" /><AvatarFallback>{post.author.initials}</AvatarFallback></Avatar>
          <span className="font-medium text-foreground">{post.author.name}</span>
        </div>
      </div>
      <time className="shrink-0 text-sm text-muted-foreground tabular-nums">{post.date}</time>
    </a>
  ))}
</div>`

const BLOG_SECTION_3_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Blog</Badge>
    <SectionHeaderHeading>Fresh off the blog</SectionHeaderHeading>
    <SectionHeaderDescription>One lead story, plus the latest from every corner of the product.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* A homepage module: one large lead story beside a compact "Latest" rail. Stacks on mobile.
    \`titleHover\`, \`tone\`, and \`BlogMeta\` are the shared helpers from blog-section-1. */}
const [lead, ...rest] = posts
const latest = rest.slice(0, 4)

<div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
  <a href={lead.href} className="group flex animate-stagger-in cursor-pointer flex-col gap-5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background">
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-inset ring-foreground/10">
      <img src={lead.cover} alt={lead.coverAlt} className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]" />
    </div>
    <div className="flex flex-col items-start gap-3">
      <Badge variant={tone[lead.category]}>{lead.category}</Badge>
      <h3 className={\`text-2xl font-semibold leading-snug text-balance sm:text-3xl \${titleHover}\`}>{lead.title}</h3>
      <p className="text-pretty text-muted-foreground">{lead.excerpt}</p>
      <BlogMeta post={lead} />
    </div>
  </a>

  <div className="flex flex-col divide-y divide-border">
    {latest.map((post, i) => (
      <a key={post.slug} href={post.href} style={{ animationDelay: \`\${(i + 1) * 70}ms\` }} className="group flex animate-stagger-in cursor-pointer items-start gap-4 py-4 outline-none first:pt-0 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset">
        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-foreground/10">
          <img src={post.cover} alt={post.coverAlt} className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.05]" />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <Badge variant={tone[post.category]} size="sm">{post.category}</Badge>
          <h3 className={\`line-clamp-2 text-sm font-semibold leading-snug \${titleHover}\`}>{post.title}</h3>
          <time className="text-xs text-muted-foreground tabular-nums">{post.date}</time>
        </div>
      </a>
    ))}
  </div>
</div>`

const BLOG_SECTION_4_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Blog</Badge>
    <SectionHeaderHeading>Stories worth your time</SectionHeaderHeading>
    <SectionHeaderDescription>An image-led index: filter by topic and dive into any cover.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Solid dot color per topic (the chip sits on a photo, so it can't use the soft Badge tint).
    \`titleHover\` is the shared helper from blog-section-1. */}
const dot = { Product: "bg-info", Engineering: "bg-purple", Design: "bg-pink", Company: "bg-teal" }
const [active, setActive] = useState("All")
const visible = active === "All" ? posts : posts.filter((p) => p.category === active)

<div className="flex flex-col gap-12">
  <ToggleGroup type="single" value={active} onValueChange={(value) => setActive(value || "All")} size="sm" className="w-full flex-wrap justify-center gap-2" aria-label="Filter articles by category">
    {["All", "Product", "Engineering", "Design", "Company"].map((category) => (
      <ToggleGroupItem key={category} value={category}>{category}</ToggleGroupItem>
    ))}
  </ToggleGroup>

  <div key={active} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {visible.map((post, i) => (
      <a key={post.slug} href={post.href} style={{ animationDelay: \`\${i * 70}ms\` }} className="group relative flex aspect-[4/5] animate-stagger-in cursor-pointer flex-col justify-end overflow-hidden rounded-2xl text-white outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background">
        <img src={post.cover} alt={post.coverAlt} className="absolute inset-0 size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.04]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
          <span className={\`size-1.5 rounded-full \${dot[post.category]}\`} />
          {post.category}
        </span>
        <div className="relative flex flex-col gap-3 p-5">
          <h3 className={\`text-lg font-semibold leading-snug text-balance \${titleHover}\`}>{post.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
            <Avatar size="xs"><AvatarImage src={post.author.avatar} alt="" /><AvatarFallback>{post.author.initials}</AvatarFallback></Avatar>
            <span className="font-medium text-white">{post.author.name}</span>
            <span aria-hidden className="text-white/40">&middot;</span>
            <time className="tabular-nums">{post.date}</time>
          </div>
        </div>
      </a>
    ))}
  </div>
</div>`

const BLOG_SECTION_5_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Blog</Badge>
    <SectionHeaderHeading>Writing & updates</SectionHeaderHeading>
    <SectionHeaderDescription>Notes from the team, newest first. A minimal, date-led index.</SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* The barest archive: a date pill, a bold title, and a one-line excerpt per post, split by hairlines.
    \`titleHover\` is the shared underline helper from blog-section-1. */}
<div className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border">
  {posts.map((post, i) => (
    <a
      key={post.slug}
      href={post.href}
      style={{ animationDelay: \`\${i * 70}ms\` }}
      className="group flex animate-stagger-in cursor-pointer flex-col items-start gap-3.5 py-8 outline-none first:pt-0 last:pb-0 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
    >
      <Badge variant="outline" size="lg" className="tabular-nums">{post.date}</Badge>
      <div className="flex flex-col gap-2">
        <h3 className={\`text-xl font-semibold text-balance \${titleHover}\`}>{post.title}</h3>
        <p className="text-pretty text-muted-foreground">{post.excerpt}</p>
      </div>
    </a>
  ))}
</div>`

const CTA_SECTION_1_CODE = `<div className="grid items-center gap-12 lg:grid-cols-2">
  <div className="flex flex-col gap-6">
    <SectionHeader align="left">
      <SectionHeaderText>
        <Badge variant="info" dot pill>Install</Badge>
        <SectionHeaderHeading>One command. You own the code.</SectionHeaderHeading>
        <SectionHeaderDescription>
          The koalaui CLI copies real component source into your project.
        </SectionHeaderDescription>
      </SectionHeaderText>
    </SectionHeader>
    <ul>{/* benefit checklist with Check icons */}</ul>
  </div>

  <div className="flex flex-col gap-4">
    <CodeSnippet code={install} lang="bash" filename="Terminal" dots />
    <CodeSnippet code={usage} lang="tsx" filename="cta.tsx" />
  </div>
</div>`

const CTA_SECTION_2_CODE = `<div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-lg sm:px-12 sm:py-20">
  {/* The closing panel reveals part by part, with a soft focus pull, as it scrolls into view. */}
  <SectionHeader
    align="center"
    stagger
    staggerBlur
    staggerTrigger="inView"
    className="relative mx-auto max-w-2xl"
  >
    <SectionHeaderText>
      <Badge variant="info" dot pill>Get started</Badge>
      <SectionHeaderHeading>Build polished products, starting today</SectionHeaderHeading>
      <SectionHeaderDescription>
        Install the free tier in minutes, or unlock the full Figma and React system.
      </SectionHeaderDescription>
    </SectionHeaderText>
    <SectionHeaderActions>
      <Button size="lg">Get Koala UI <ArrowRight /></Button>
      <Button size="lg" variant="outline">Read the docs</Button>
    </SectionHeaderActions>
  </SectionHeader>
</div>`

const CTA_SECTION_3_CODE = `const [sent, setSent] = useState(false)

<SectionHeader align="center" className="mx-auto max-w-2xl">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Get started</Badge>
    <SectionHeaderHeading>Start building today</SectionHeaderHeading>
    <SectionHeaderDescription>
      Join 4,100+ teams shipping polished interfaces with Koala UI. Spin up the free tier in
      minutes, no credit card required.
    </SectionHeaderDescription>
  </SectionHeaderText>

  <div className="flex w-full flex-col items-center gap-4">
    {sent ? (
      <p role="status" className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground animate-stagger-in">
        <span className="grid size-5 place-items-center rounded-full bg-brand/10 text-brand">
          <Check weight="bold" className="size-3" />
        </span>
        You're on the list. Check your inbox to confirm.
      </p>
    ) : (
      // The submit button is a detached sibling beside the field, never crammed inside it.
      <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center">
        {/* w-full, not flex-1: flex-1 would collapse the field's height when the form stacks. */}
        <InputRoot size="lg" className="w-full">
          <InputPrefix><EnvelopeSimple /></InputPrefix>
          <InputField type="email" required autoComplete="email" placeholder="you@company.com" aria-label="Work email" />
        </InputRoot>
        <Button type="submit" size="lg" className="shrink-0 max-sm:w-full">Start free trial</Button>
      </form>
    )}

    {/* Same benefit unit as cta-section-1: a tinted icon container + text. */}
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {["Free forever plan", "No credit card", "Cancel anytime"].map((point) => (
        <li key={point} className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-brand/10 text-brand">
            <Check weight="bold" className="size-3" />
          </span>
          {point}
        </li>
      ))}
    </ul>
  </div>
</SectionHeader>`

const CTA_SECTION_4_CODE = `{/* Saturated brand band: the fill is the \`--brand\` token, so it recolors with the active accent;
    white holds AA on the deep accent. SectionHeader's split lays the headline left, actions right. */}
<div className="rounded-3xl bg-brand px-8 py-14 text-white shadow-lg sm:px-12 sm:py-16 lg:px-16">
  <SectionHeader align="left" orientation="split">
    <SectionHeaderText className="lg:max-w-xl">
      <SectionHeaderHeading className="text-white">
        Ready to ship your best work yet?
      </SectionHeaderHeading>
      <SectionHeaderDescription className="text-white/80">
        Join 4,100+ teams building polished, accessible products on Koala UI. Start free and
        upgrade the day you need the full system.
      </SectionHeaderDescription>
    </SectionHeaderText>
    <SectionHeaderActions>
      {/* Primary inverts to a white chip with a brand-colored label; secondary is a ghost on the fill. */}
      <Button asChild size="lg" className="bg-white text-brand shadow-xs hover:bg-white/90">
        <Link href="#">Get started</Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
        <Link href="#">Book a demo</Link>
      </Button>
    </SectionHeaderActions>
  </SectionHeader>
</div>`

const CTA_SECTION_5_CODE = `<div className="rounded-3xl border border-border bg-card shadow-lg">
  <div className="grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-8 lg:p-14">
    <SectionHeader align="left">
      <SectionHeaderText>
        <Badge variant="purple" dot pill>Responsive by default</Badge>
        <SectionHeaderHeading>Looks flawless on every screen</SectionHeaderHeading>
        <SectionHeaderDescription>
          Every Koala component is tuned for touch and built to scale, from a 320px phone to an
          ultrawide display, with no per-breakpoint rework.
        </SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button asChild size="lg"><Link href="#">Start building</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="#">Browse components</Link></Button>
      </SectionHeaderActions>
    </SectionHeader>

    {/* Finished device duo (transparent PNGs, bezel + shadow baked in): the iPad sits centered,
        the iPhone overlaps its lower-right corner. */}
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <img src="/devices/ipad-portrait.png" alt="" width={802} height={1035} className="mx-auto block w-[82%]" />
      <img src="/devices/iphone.png" alt="" width={419} height={757} className="absolute bottom-0 right-0 w-[42%]" />
    </div>
  </div>
</div>`

const CTA_SECTION_6_CODE = `{/* Deep inverse band: the inverse pair (bg-foreground / text-background) flips per theme. The
    spotlight is a crisp radial gradient of a low-alpha white, NOT a blurred colored glow. */}
<div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-20 text-center text-background shadow-lg sm:px-12 sm:py-24">
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0"
    style={{ background: "radial-gradient(72% 58% at 50% 0%, color-mix(in oklab, white 16%, transparent), transparent 70%)" }}
  />
  <SectionHeader align="center" stagger staggerBlur staggerTrigger="inView" className="relative mx-auto max-w-2xl">
    <SectionHeaderText>
      <SectionHeaderHeading className="text-background">Your best work starts here</SectionHeaderHeading>
      <SectionHeaderDescription className="text-background/70">
        Design, build, and launch on a system that already feels finished. Start free, and keep
        the code forever.
      </SectionHeaderDescription>
    </SectionHeaderText>
    <SectionHeaderActions>
      <Button asChild size="lg" className="bg-background text-foreground shadow-xs hover:bg-background/90">
        <Link href="#">Get started</Link>
      </Button>
      <Button asChild size="lg" variant="outline" className="border-background/25 text-background hover:bg-background/10 hover:text-background">
        <Link href="#">Talk to sales</Link>
      </Button>
    </SectionHeaderActions>
  </SectionHeader>
</div>`

const CTA_SECTION_7_CODE = `{/* No panel, no glow: a display-scale headline bare on the band carries the whole section. */}
<SectionHeader align="center" size="lg" className="mx-auto max-w-3xl">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Ready when you are</Badge>
    <SectionHeaderHeading>Build interfaces people remember</SectionHeaderHeading>
    <SectionHeaderDescription>
      Everything you need to design and ship a polished, accessible product, in one system.
    </SectionHeaderDescription>
  </SectionHeaderText>
  <SectionHeaderActions>
    <Button asChild size="lg"><Link href="#">Start for free</Link></Button>
    <Button asChild size="lg" variant="outline"><Link href="#">Read the docs</Link></Button>
  </SectionHeaderActions>
  {/* Same benefit unit as cta-section-1/3: tinted icon container + text. */}
  <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
    {["Free forever plan", "No credit card required"].map((point) => (
      <li key={point} className="flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-full bg-brand/10 text-brand">
          <Check weight="bold" className="size-3" />
        </span>
        {point}
      </li>
    ))}
  </ul>
</SectionHeader>`

const CTA_SECTION_8_CODE = `{/* Contact + FAQ "load more": a centered lede, a three-channel contact strip, then the shared FAQ
    list as an icon-led features grid clipped to ~two rows. A fade-to-band overlay rises over the cut
    with the reveal button floating on it. The reveal is a SMOOTH height animation: max-height
    transitions from the clamp to the grid's measured scrollHeight, then settles to \`none\` on
    transition end so a later resize is never clipped (\`none\` isn't interpolatable, so it snaps with
    no visible move). Collapsing re-pins the concrete height for one frame to animate down from.
    FAQ_ICONS is index-matched to FAQ so the questions stay the single source of truth. */}
const COLLAPSED = "28rem"   // ~two rows of the desktop grid
const [expanded, setExpanded] = React.useState(false)
const [maxHeight, setMaxHeight] = React.useState(COLLAPSED)
const gridRef = React.useRef(null)

function expand() {
  const el = gridRef.current
  if (!el) return
  setMaxHeight(el.scrollHeight + "px")
  setExpanded(true)
}

function collapse() {
  const el = gridRef.current
  if (maxHeight === "none" && el) {
    setMaxHeight(el.scrollHeight + "px")           // pin a concrete start value…
    setExpanded(false)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setMaxHeight(COLLAPSED)),  // …then drop to the clamp next frame
    )
  } else {
    setMaxHeight(COLLAPSED)                          // mid-open: reverse straight down
    setExpanded(false)
  }
}

function handleTransitionEnd(e) {
  if (e.target === e.currentTarget && e.propertyName === "max-height" && expanded) {
    setMaxHeight("none")                             // release the clamp once fully open
  }
}

<div className="flex flex-col gap-12">
  <SectionHeader align="center" className="mx-auto max-w-2xl">
    <SectionHeaderText>
      <Badge variant="info" dot pill>Support</Badge>
      <SectionHeaderHeading>Get in touch with us</SectionHeaderHeading>
      <SectionHeaderDescription>
        Everything you need to know about the library, the CLI, and billing. Can't find your
        answer? Our team is a message away.
      </SectionHeaderDescription>
    </SectionHeaderText>
  </SectionHeader>

  {/* Contact strip: label + value, calm muted → foreground on hover. */}
  <dl className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:text-left">
    {CONTACT_CHANNELS.map((channel) => (
      <div key={channel.label} className="flex flex-col gap-1">
        <dt className="text-sm font-semibold text-foreground">{channel.label}</dt>
        <dd>
          <a href={channel.href} className="text-sm text-muted-foreground transition-colors duration-base ease-out hover:text-foreground">
            {channel.value}
          </a>
        </dd>
      </div>
    ))}
  </dl>

  {/* FAQ-as-features grid + smooth load-more overlay */}
  <div>
    <div className="relative">
      <div
        ref={gridRef}
        onTransitionEnd={handleTransitionEnd}
        style={{ maxHeight }}
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-12 transition-[max-height] duration-slow ease-out sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12",
          maxHeight !== "none" && "overflow-hidden",
        )}
      >
        {FAQ.map((item, i) => {
          const FaqIcon = FAQ_ICONS[i]
          return (
            <div key={item.question} className="flex flex-col gap-3">
              <FaqIcon weight="bold" className="size-6 shrink-0 text-foreground" aria-hidden />
              <h3 className="text-base font-semibold text-balance text-foreground">{item.question}</h3>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{item.answer}</p>
            </div>
          )
        })}
      </div>

      {/* Overlay stays mounted and cross-fades; de-focused + no pointer events while open. */}
      <div
        aria-hidden={expanded || undefined}
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex h-44 items-center justify-center bg-gradient-to-t from-background via-background to-transparent transition-opacity duration-base ease-out",
          expanded && "opacity-0",
        )}
      >
        <Button
          variant="outline"
          tabIndex={expanded ? -1 : undefined}
          className={cn("pointer-events-auto", expanded && "pointer-events-none")}
          onClick={expand}
        >
          See all questions
        </Button>
      </div>
    </div>

    {expanded && (
      <div className="mt-10 flex justify-center">
        <Button variant="outline" onClick={collapse}>
          Show less
        </Button>
      </div>
    )}
  </div>
</div>`

const CONTACT_SECTION_1_CODE = `{/* Register with \`bleed: true\` so the slab gets the full width; the photo runs edge to edge while
    the copy and card re-add the site gutter (max-w-8xl + px-8). Everything is in normal flow (only
    the photo's own cover img is absolute) so the docs PreviewFrame measures the slab height right;
    the card overlaps the photo via the photo's negative top margin. */}
<Hero layout="split">
  {/* Copy + card, side by side on lg, held to the canonical gutter so their edges line up with every
      other section; the photo bleeds past it. */}
  <div className="mx-auto w-full max-w-8xl px-6 sm:px-8">
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
      {/* Copy: its natural height keeps the CTA row well above the photo below. */}
      <div className="pt-10 sm:pt-14 lg:pt-16">
        <HeroColumn className="lg:max-w-md">
          <Badge variant="info" dot pill>New collection</Badge>

          <HeroTitle>Design made to feel like home</HeroTitle>
          <HeroSubtitle className="max-w-md text-base">
            We bring your interior dreams to life with personalized designs that reflect your style
            and personality.
          </HeroSubtitle>

          <HeroActions className="pt-2">
            <Button size="md">Explore features</Button>
            <Button size="md" variant="outline">Sign up</Button>
          </HeroActions>
        </HeroColumn>
      </div>

      {/* Card: taller than the copy, so it dips over the photo below. relative z-10 lifts it above
          the photo it overlaps (a later sibling that would otherwise paint on top). */}
      <div className="relative z-10 pb-10 pt-6 sm:pt-8 lg:pb-0 lg:pt-16">
        <LeadForm
          density="comfortable"
          defaultCountry="ES"
          title="Let's Collaborate"
          description="Share your ideas with us, and together we'll create a space that truly reflects you."
          className="mx-auto w-full max-w-lg shadow-xl lg:mr-0 lg:ml-auto lg:w-[28rem] lg:max-w-none"
        />
      </div>
    </div>
  </div>

  {/* Photo: full-bleed band across the whole width. On lg a negative top margin slides it up so its
      top sits under the copy's CTA row and it runs behind the card's lower half. */}
  <div className="relative min-h-64 sm:min-h-80 lg:-mt-48 lg:min-h-[22rem]">
    <img src={interior} alt="" className="absolute inset-0 size-full object-cover" />
  </div>
</Hero>`

const CONTACT_SECTION_2_CODE = `{/* Split contact: a left copy column (lede + a channel list of email / call / visit + an hours
    line) beside the ContactForm as a card. Two columns from lg, stacked below; items-start keeps
    the taller form from stretching the copy. Icon tiles are the feature treatment (transparent,
    hairline stroke, muted glyph); actionable values use the Link component (black, brand on hover). */}
<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
  <div className="flex flex-col gap-8">
    <SectionHeader align="left">
      <SectionHeaderText>
        <Badge variant="info" dot pill>Contact</Badge>
        <SectionHeaderHeading>Talk to our team</SectionHeaderHeading>
        <SectionHeaderDescription>
          Questions about the library, a plan, or a partnership? Send a note and we'll reply within
          one business day.
        </SectionHeaderDescription>
      </SectionHeaderText>
    </SectionHeader>

    <ul className="flex flex-col gap-5">
      {CONTACT_METHODS.map((method) => {
        const Icon = method.icon
        return (
          <li key={method.label} className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
              <Icon weight="bold" className="size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{method.label}</span>
              {method.href ? (
                <Link href={method.href} className="text-sm">{method.value}</Link>
              ) : (
                <span className="text-sm text-muted-foreground">{method.value}</span>
              )}
            </div>
          </li>
        )
      })}
    </ul>

    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock weight="bold" className="size-4 shrink-0" />
      <span>Mon–Fri, 8:00–17:00 CET</span>
    </div>
  </div>

  <ContactForm
    variant="card"
    density="comfortable"
    title="Send us a message"
    description={null}
    className="max-w-none lg:ml-auto lg:max-w-lg"
  />
</div>`

const CONTACT_SECTION_3_CODE = `{/* Centered contact: a centered lede over a slim trust row and a single centered ContactForm card.
    The card keeps a short heading and left-aligns its own fields inside the centered column. */}
<div className="flex flex-col items-center gap-10">
  <SectionHeader align="center" className="mx-auto max-w-2xl">
    <SectionHeaderText>
      <Badge variant="info" dot pill>Get in touch</Badge>
      <SectionHeaderHeading>We'd love to hear from you</SectionHeaderHeading>
      <SectionHeaderDescription>
        Tell us what you're building and how we can help. Every message reaches a real person on the team.
      </SectionHeaderDescription>
    </SectionHeaderText>
  </SectionHeader>

  <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
    {CONTACT_CHIPS.map((chip) => {
      const Icon = chip.icon
      return (
        <li key={chip.label} className="flex items-center gap-2">
          <Icon weight="bold" className="size-4 shrink-0 text-muted-foreground" />
          {chip.label}
        </li>
      )
    })}
  </ul>

  <ContactForm
    variant="card"
    density="comfortable"
    title="Send us a message"
    description={null}
    className="mx-auto w-full max-w-xl text-left"
  />
</div>`

const CONTACT_SECTION_4_CODE = `{/* Department directory: a centered lede over a grid of routing cards, each a whole-card mailto
    link built on the canonical Card (asChild → anchor). Hover lifts the border and nudges the arrow.
    Folds 3 → 2 → 1 columns. */}
<div className="flex flex-col gap-12">
  <SectionHeader align="center" className="mx-auto max-w-2xl">
    <SectionHeaderText>
      <Badge variant="info" dot pill>Contact</Badge>
      <SectionHeaderHeading>Reach the right team</SectionHeaderHeading>
      <SectionHeaderDescription>
        Pick the inbox that fits and your message lands with the people who can help. We reply within
        one business day.
      </SectionHeaderDescription>
    </SectionHeaderText>
  </SectionHeader>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {CONTACT_DEPARTMENTS.map((dept) => {
      const Icon = dept.icon
      return (
        <Card key={dept.name} asChild density="comfortable" className="group/dept">
          <a href={\`mailto:\${dept.email}\`}>
            <CardHeader className="flex flex-col gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground">
                <Icon weight="bold" className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle>{dept.name}</CardTitle>
                <CardDescription>{dept.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* The card's only hover feedback: the arrow fades + slides up-right into place. No
                  card shadow or colour shift. NAME \`translate\` in the transition (standalone prop in
                  Tailwind v4) or the motion snaps. */}
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {dept.email}
                <ArrowUpRight weight="bold" aria-hidden className="size-4 -translate-x-1 translate-y-0.5 opacity-0 transition-[opacity,translate] duration-base ease-out group-hover/dept:translate-x-0 group-hover/dept:translate-y-0 group-hover/dept:opacity-100" />
              </span>
            </CardContent>
          </a>
        </Card>
      )
    })}
  </div>

  <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
    <span className="flex items-center gap-2"><MapPin weight="bold" className="size-4 shrink-0" /> 8502 Preston Rd, Inglewood, CA</span>
    <span aria-hidden className="hidden text-border sm:inline">•</span>
    <span className="flex items-center gap-2"><Clock weight="bold" className="size-4 shrink-0" /> Mon–Fri, 8:00–17:00 CET</span>
  </div>
</div>`

const SOCIAL_PROOF_SECTION_1_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="info" dot pill>Social proof</Badge>
    <SectionHeaderHeading>Trusted by the teams behind great products</SectionHeaderHeading>
    <SectionHeaderDescription>
      The companies building their interfaces on Koala UI, from fast-moving startups to the
      Fortune 500.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Logos are wordmarks: muted by default, lifting to the foreground on hover. */}
<ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
  {brands.map(({ name, Icon }) => (
    <li key={name}>
      <span className="flex items-center gap-2 text-muted-foreground transition-colors duration-base ease-out hover:text-foreground">
        <Icon className="size-6 shrink-0" aria-hidden />
        <span className="text-lg font-semibold tracking-tight">{name}</span>
      </span>
    </li>
  ))}
</ul>`

const SOCIAL_PROOF_SECTION_2_CODE = `<div className="flex flex-col items-center gap-8">
  <p className="text-sm font-medium text-muted-foreground">
    Trusted by more than 4,100 product teams worldwide
  </p>

  {/* The set is rendered twice so the -50% translate loops with no seam. Pauses on hover and
      stops under prefers-reduced-motion. */}
  <div className="group/marquee relative w-full overflow-hidden fade-x [--fade-size:8%]">
    <ul className="flex w-max animate-marquee items-center gap-x-14 pr-14 [--marquee-duration:180s] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none]">
      {[...brands, ...brands].map(({ name, Icon }, i) => (
        <li key={\`\${name}-\${i}\`} className="shrink-0" aria-hidden={i >= brands.length}>
          <span className="flex items-center gap-2 text-muted-foreground transition-colors duration-base ease-out hover:text-foreground">
            <Icon className="size-6 shrink-0" aria-hidden />
            <span className="text-lg font-semibold tracking-tight">{name}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
</div>`

const SOCIAL_PROOF_SECTION_3_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="purple" dot pill>Customers</Badge>
    <SectionHeaderHeading>Powering products at companies of every size</SectionHeaderHeading>
    <SectionHeaderDescription>
      A system trusted in production, from the first commit all the way to global scale.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

{/* Minimal ruled grid: only the 1px rules between cells (the bg-border parent through a gap-px),
    no enclosing frame, rounding, or cell fill. Crisp at any column count. */}
<ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
  {brands.map(({ name, Icon }) => (
    <li key={name} className="flex min-h-28 items-center justify-center bg-background p-8">
      <span className="flex items-center gap-2 text-muted-foreground transition-colors duration-base ease-out hover:text-foreground">
        <Icon className="size-6 shrink-0" aria-hidden />
        <span className="text-lg font-semibold tracking-tight">{name}</span>
      </span>
    </li>
  ))}
</ul>`

const SOCIAL_PROOF_SECTION_4_CODE = `<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
  <SectionHeader align="left">
    <SectionHeaderText>
      <Badge variant="success" dot pill>Customers</Badge>
      <SectionHeaderHeading>
        Join <span className="tabular-nums">4,100+</span> teams building on Koala UI
      </SectionHeaderHeading>
      <SectionHeaderDescription>
        From seed-stage startups to the Fortune 500, product teams ship on one consistent system.
      </SectionHeaderDescription>
    </SectionHeaderText>
  </SectionHeader>

  <ul className="grid grid-cols-2 gap-x-8 gap-y-8">
    {brands.map(({ name, Icon }) => (
      <li key={name}>
        <span className="flex items-center gap-2 text-muted-foreground transition-colors duration-base ease-out hover:text-foreground">
          <Icon className="size-6 shrink-0" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">{name}</span>
        </span>
      </li>
    ))}
  </ul>
</div>`

const SOCIAL_PROOF_SECTION_5_CODE = `{/* A minimal bento: 1px gridlines (the frame's bg-border through gap-px) carry the structure,
    with the lone dark media tile as the only filled surface. No near-identical card fills. */}
<div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-6 lg:grid-rows-2">
  {/* Lede + report link, on the plain surface */}
  <div className="col-span-2 flex flex-col justify-center bg-background p-6 lg:col-span-2 lg:row-span-2 lg:p-8">
    <SectionHeader align="left" size="sm">
      <SectionHeaderText>
        <SectionHeaderHeading>Join 4,100 of the most ambitious product teams</SectionHeaderHeading>
        <SectionHeaderDescription>Teams ship 4.6× faster on one consistent system.</SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button variant="link" size="sm" className="px-0">Read the report <ArrowRight /></Button>
      </SectionHeaderActions>
    </SectionHeader>
  </div>

  {/* Logo wall: flat cells, separated by the gridlines */}
  {brands.slice(0, 4).map(({ name, Icon }) => (
    <div key={name} className="flex min-h-24 items-center justify-center bg-background">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="size-6" /> {name}</span>
    </div>
  ))}

  {/* Featured customer card: the one dark image placeholder + stat overlay */}
  <div className="relative col-span-2 min-h-56 overflow-hidden bg-black p-5 text-white lg:col-span-2 lg:col-start-5 lg:row-span-2">
    <div className="flex h-full flex-col justify-end gap-1">
      <span className="text-sm font-semibold text-white/90">Quanta</span>
      <p className="text-4xl font-semibold tabular-nums">128 <span className="text-2xl text-white/60">hrs</span></p>
      <p className="text-sm text-white/70">Saved every release on UI QA</p>
    </div>
  </div>
</div>`

// Sketches for the PRO (locked) sections: the Code tab shows the PremiumCode lock, so these only
// back the toolbar's copy affordance. They show the composition shape, not the full source.
const FOOTER_CODE = `<Footer>
  <FooterTop>
    <FooterBrand>
      <BrandMark />
      <FooterTagline>The commercial React design system.</FooterTagline>
      <FooterSocial>{/* X · Instagram · LinkedIn · GitHub · YouTube */}</FooterSocial>
    </FooterBrand>
    <FooterColumns>
      <FooterColumn title="Product">{/* links */}</FooterColumn>
      <FooterColumn title="Company">{/* links */}</FooterColumn>
      <FooterColumn title="Resources">{/* links */}</FooterColumn>
    </FooterColumns>
  </FooterTop>
  <FooterBottom>
    <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
    <FooterLegal>{/* Privacy · Terms · Cookies */}</FooterLegal>
  </FooterBottom>
</Footer>`

const FOOTER_SECTION_2_CODE = `{/* A full-bleed image becomes the backdrop; the nav rides on top (Duna / Poly). Swap the
    <img> src for your own illustration / photo; the scrim keeps the white text legible. */}
<div className="relative isolate overflow-hidden border-t border-border">
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <img src="/footer-landscape.jpg" alt="" className="size-full object-cover" />
    {/* Scrim: darkens the top (columns) and bottom (legal bar) so the white text reads. */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/55" />
  </div>

  {/* Transparent root so the media reads; column titles ride white via the data-slot override. */}
  <Footer className="border-t-0 bg-transparent [&_[data-slot=footer-column-title]]:text-white">
    <FooterColumns className="w-full lg:grid lg:grid-cols-5 lg:gap-8">
      <FooterColumn title="Product">
        <FooterLink href="#" className="text-white/75 hover:text-white">Components</FooterLink>
        {/* …more links */}
      </FooterColumn>
      <FooterColumn title="Solutions">{/* links */}</FooterColumn>
      <FooterColumn title="Resources">{/* links */}</FooterColumn>
      <FooterColumn title="Company">{/* links */}</FooterColumn>
      <FooterColumn title="Support">{/* links */}</FooterColumn>
    </FooterColumns>

    {/* Open scenic band where the image shows through. */}
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
</div>`

const FOOTER_SECTION_3_CODE = `{/* Newsletter-strip footer: an email-capture band on top, then a wide link grid. The signup is
    the canonical NewsletterForm in its inline layout (ships the loading → success flow). */}
<Footer>
  <div className="flex flex-col gap-6 pb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
    <div className="flex flex-col gap-1.5">
      <h3 className="text-lg font-semibold tracking-tight text-balance text-foreground">Stay in the loop</h3>
      <p className="max-w-md text-sm text-pretty text-muted-foreground">
        Product updates, design tips, and the occasional deep dive. No spam, unsubscribe anytime.
      </p>
    </div>
    <NewsletterForm variant="inline" action="Subscribe" className="w-full lg:max-w-md" />
  </div>

  <FooterTop className="border-t border-border pt-10">
    <FooterBrand>
      <BrandMark />
      <FooterTagline>The commercial React design system for teams that ship fast.</FooterTagline>
      <FooterSocial>{/* X · Instagram · LinkedIn · GitHub · YouTube */}</FooterSocial>
    </FooterBrand>
    <FooterColumns>
      <FooterColumn title="Product">{/* links */}</FooterColumn>
      <FooterColumn title="Resources">{/* links */}</FooterColumn>
      <FooterColumn title="Company">{/* links */}</FooterColumn>
      <FooterColumn title="Legal">{/* links */}</FooterColumn>
    </FooterColumns>
  </FooterTop>

  <FooterBottom>
    <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
    <FooterLegal>{/* Privacy · Terms · Cookies */}</FooterLegal>
  </FooterBottom>
</Footer>`

const FOOTER_SECTION_4_CODE = `{/* Newsletter-card footer: brand + link columns on the left, a self-contained NewsletterForm
    card on the right. The card brings its own concentric surface + the --surface contract. */}
<Footer>
  <FooterTop className="gap-12 lg:flex-col lg:justify-start xl:flex-row xl:items-start xl:gap-16">
    <div className="flex flex-col gap-10 lg:flex-1 lg:flex-row lg:gap-16">
      <FooterBrand>
        <BrandMark />
        <FooterTagline>The commercial React design system for teams that ship fast.</FooterTagline>
        <FooterSocial>{/* X · Instagram · LinkedIn · GitHub · YouTube */}</FooterSocial>
      </FooterBrand>
      <FooterColumns>
        <FooterColumn title="Product">{/* links */}</FooterColumn>
        <FooterColumn title="Company">{/* links */}</FooterColumn>
        <FooterColumn title="Resources">{/* links */}</FooterColumn>
      </FooterColumns>
    </div>
    <NewsletterForm
      variant="card"
      title="Subscribe to our newsletter"
      description="The latest components, templates, and design tips, straight to your inbox."
      fineprint="No spam. Unsubscribe anytime."
      className="w-full shrink-0 sm:max-w-md xl:max-w-sm"
    />
  </FooterTop>
  <FooterBottom>
    <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
    <FooterLegal>{/* Privacy · Terms · Cookies */}</FooterLegal>
  </FooterBottom>
</Footer>`

const FOOTER_SECTION_5_CODE = `{/* Minimal centered footer: a centered brand mark, an inline nav row, a capped inline
    newsletter, the social row, and a centered legal line. */}
<Footer>
  <div className="flex flex-col items-center gap-8 text-center">
    <BrandMark />
    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
      <FooterLink href="#">Components</FooterLink>
      {/* Templates · Pricing · Docs · Blog · Changelog */}
    </nav>
    <NewsletterForm variant="inline" action="Subscribe" className="w-full max-w-md" />
    <FooterSocial>{/* X · Instagram · LinkedIn · GitHub · YouTube */}</FooterSocial>
  </div>
  <FooterBottom className="items-center justify-center text-center sm:justify-center">
    <FooterCopyright>© 2026 Koala UI. All rights reserved.</FooterCopyright>
  </FooterBottom>
</Footer>`

const GALLERY_CODE = `<Gallery>
  <Tabs defaultValue="home">
    <GalleryHeader>
      <SectionHeader align="center">
        <SectionHeaderText>
          <SectionHeaderHeading>Create concepts in seconds</SectionHeaderHeading>
          <SectionHeaderDescription>Pre-designed sections and templates.</SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <TabsList>{/* Home · Blog · About · Pricing · Careers */}</TabsList>
    </GalleryHeader>
    <TabsContent value="home">
      <Lightbox images={images}>
        <GalleryMasonry>
          <LightboxTrigger index={0} asChild>
            <GalleryItem action="See image">
              <GalleryImage src="…" alt="…" />
            </GalleryItem>
          </LightboxTrigger>
          {/* … */}
        </GalleryMasonry>
      </Lightbox>
    </TabsContent>
  </Tabs>
</Gallery>`

const GALLERY_MARQUEE_CODE = `<Gallery>
  <GalleryHeader>
    <SectionHeader align="center">
      <SectionHeaderText>
        <Badge variant="purple" dot pill>Gallery section</Badge>
        <SectionHeaderHeading>Jambo Team Gallery</SectionHeaderHeading>
        <SectionHeaderDescription>A living wall of moments, drifting past in two directions.</SectionHeaderDescription>
      </SectionHeaderText>
    </SectionHeader>
  </GalleryHeader>

  <Lightbox images={images}>
    <div className="mt-12 flex flex-col gap-4 overflow-hidden">
      {/* Row drifts left; the set is rendered twice so the marquee loops with no seam. */}
      <div className="group/marquee relative flex overflow-hidden fade-x [--fade-size:3%]">
        <div className="flex w-max animate-marquee gap-4 pr-4 group-hover/marquee:[animation-play-state:paused]">
          {[...row, ...row].map((preview, i) => (
            <LightboxTrigger key={i} index={i % row.length} asChild aria-hidden={i >= row.length}>
              <GalleryItem action="See image" className="mb-0 w-80 shrink-0 sm:w-[28rem]">
                <GalleryImage src={preview.src} alt={preview.alt} className="h-56 sm:h-72" />
              </GalleryItem>
            </LightboxTrigger>
          ))}
        </div>
      </div>
      {/* A second row adds [animation-direction:reverse] to drift the other way. */}
    </div>
  </Lightbox>

  <div className="flex justify-center pb-20 pt-14">
    <Button size="lg" className="rounded-full">Read all FAQs</Button>
  </div>
</Gallery>`

const GALLERY_TABBED_CODE = `<Gallery>
  <Tabs defaultValue="home">
    <GalleryHeader>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>Gallery section</Badge>
          <SectionHeaderHeading>Create concepts in seconds</SectionHeaderHeading>
          <SectionHeaderDescription>Switch categories with the tabs, then open any frame full-screen.</SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <TabsList>{/* Home · Blog · About · Pricing · Careers */}</TabsList>
    </GalleryHeader>
    <TabsContent value="home">
      <Lightbox images={images}>
        {/* Device-width band with a horizontal fade that dissolves the tiles into the background at
            both edges, so the bleed fades smoothly instead of hard-clipping at the frame. */}
        <div className="relative w-full fade-x [--fade-size:6%]">
          {/* Bleed past the frame (120vw, centered) so the outer columns spill off both edges,
              up to a fifth column on xl. */}
          <GalleryMasonry className="relative left-1/2 w-[120vw] max-w-none -translate-x-1/2 px-0 pb-0 sm:pb-0 xl:columns-5">
            <LightboxTrigger index={0} asChild>
              <GalleryItem action="See image">
                <GalleryImage src="…" alt="…" />
              </GalleryItem>
            </LightboxTrigger>
            {/* … */}
          </GalleryMasonry>
        </div>
      </Lightbox>
    </TabsContent>
  </Tabs>

  <div className="flex justify-center pb-20 pt-14">
    <Button size="lg" className="rounded-full">Browse all templates</Button>
  </div>
</Gallery>`

const GALLERY_RING_CODE = `// 16 frames evenly distributed (~22.5° apart) so none overlap — the lede is far narrower than the
// ring is wide, so frames clear the headline even at 3 and 9 o'clock. Large frames sit every 4th
// slot (never adjacent); side frames carry a larger radius + hideOnMobile to stay clear of the text.
const RING = [
  { id: "1486312338219-…", alt: "Landing page concept", angle: 359, r: 1.0, tilt: -8, size: "size-14 sm:size-24" },
  { id: "1517694712202-…", alt: "Product homepage", angle: 23, r: 0.98, tilt: 7, size: "size-14 sm:size-20" },
  { id: "1467232004584-…", alt: "Minimal hero layout", angle: 44, r: 1.02, tilt: -10, size: "size-12 sm:size-16" },
  { id: "1455390582262-…", alt: "Writing setup", angle: 68, r: 1.04, tilt: 9, size: "size-14 sm:size-20", hideOnMobile: true },
  // …16 frames around the ring; the six near 3 & 9 o'clock carry hideOnMobile.
]

const RX = 44, RY = 40 // ellipse radii as a share of the stage box (wider than tall)
function ringStyle(tile, i) {
  const rad = (tile.angle * Math.PI) / 180
  return {
    left: \`\${50 + RX * tile.r * Math.sin(rad)}%\`,
    top: \`\${50 - RY * tile.r * Math.cos(rad)}%\`,
    // standalone props, so they don't clobber the entrance keyframe's transform
    translate: "-50% -50%",
    rotate: \`\${tile.tilt}deg\`,
    animationDelay: \`\${i * 55}ms\`,
  }
}

const images = RING.map((t) => ({ src: ringFull(t.id), alt: t.alt }))

<Gallery>
  <Lightbox images={images}>
    <div className="relative mx-auto w-full max-w-[90rem] px-6 py-12 sm:py-16">
      {/* Stage: explicit height gives the ring room; overflow-hidden clips frames that spill off.
          Taller on mobile so the top/bottom frames clear the headline once the side frames drop. */}
      <div className="relative mx-auto h-[42rem] w-full sm:h-[42rem] lg:h-[46rem]">
        {/* Orbiting layer: ring-orbit rotates it with scroll (pure CSS, reduced-motion safe); the
            sweep is tuned here via custom props so the utility stays untouched. */}
        <div className="ring-orbit pointer-events-none absolute inset-0 [--ring-orbit-from:-14deg] [--ring-orbit-to:14deg]">
          {RING.map((tile, i) => (
            <LightboxTrigger key={tile.id} index={i} asChild>
              <GalleryItem
                action={<MagnifyingGlassPlus />}
                className={cn("pointer-events-auto absolute m-0 animate-stagger-in-blur motion-reduce:animate-none", tile.size, tile.hideOnMobile && "hidden sm:block")}
                style={ringStyle(tile, i)}
              >
                <GalleryImage src={ringThumb(tile.id)} alt={tile.alt} className="h-full" />
              </GalleryItem>
            </LightboxTrigger>
          ))}
        </div>

        {/* Centered lede, above the ring and never rotating. */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-4">
          <div className="pointer-events-auto w-full max-w-md">
            <SectionHeader align="center" stagger staggerBlur staggerTrigger="inView">
              <SectionHeaderText>
                <Badge variant="purple" dot pill>Gallery</Badge>
                <SectionHeaderHeading>Built with Koala, <em className="italic">from every angle.</em></SectionHeaderHeading>
                <SectionHeaderDescription>A ring of real interfaces shipped with the system. Scroll to set them orbiting, or click any frame to open it full-screen.</SectionHeaderDescription>
              </SectionHeaderText>
              <SectionHeaderActions>
                <Button size="lg">Explore the gallery<ArrowRight /></Button>
              </SectionHeaderActions>
            </SectionHeader>
          </div>
        </div>
      </div>
    </div>
  </Lightbox>
</Gallery>`

const GALLERY_STORY_CODE = `const STORY = [
  { title: "Design tokens", description: "Four themes, eight accents, one token layer.", id: "1486312338219-…", alt: "Landing page concept" },
  { title: "Composable parts", description: "89 components in one recipe language.", id: "1460925895917-…", alt: "Analytics dashboard" },
  { title: "Built-in motion", description: "Staggers, spring presses, scroll reveals.", id: "1467232004584-…", alt: "Minimal hero layout" },
  { title: "Ship anywhere", description: "Copy the source; it reads finished on first render.", id: "1531403009284-…", alt: "Studio workspace" },
]

// Click-driven, not scroll-driven: opens on the first chapter, behaves the same everywhere. Only ONE
// canvas at rest; the slide plays on change. EVERY click animates identically: each card rests in the
// same waiting pose (parked off the bottom) and slides UP from there. We park the outgoing at the
// front for the slide (so the incoming covers it), then release it back after, re-arming every card.
function GalleryStory() {
  const [active, setActive] = React.useState(0)
  const [prev, setPrev] = React.useState(null)
  const resetTimer = React.useRef(null)
  const images = STORY.map((s) => ({ src: full(s.id), alt: s.alt }))

  function select(index) {
    if (index === active) return
    if (resetTimer.current) clearTimeout(resetTimer.current)
    setPrev(active)
    setActive(index)
    // After the slide, drop the outgoing card to the waiting pose (hidden behind the new front card,
    // so it's invisible) — that keeps every transition identical whichever chapter you pick.
    resetTimer.current = window.setTimeout(() => setPrev(null), 520)
  }

  return (
    <>
      <SectionHeader align="center" stagger staggerTrigger="inView">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>Gallery</Badge>
          <SectionHeaderHeading>See it work, chapter by chapter</SectionHeaderHeading>
          <SectionHeaderDescription>Click through the chapters. Each one slides its canvas up to the front on the left.</SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>

      {/* items-center aligns the shorter chapter column to the vertical centre of the canvas. */}
      <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
        {/* Left: a single canvas at rest. Clicking plays a vertical slide: the chosen image slides UP
            from below over the current one, which peeks at the top until covered. */}
        <div>
          <Lightbox images={images}>
            <LightboxTrigger index={active} asChild>
              <button type="button" className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-card shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                {STORY.map((step, i) => {
                  // active = front; prev = parked at the front one layer DOWN, covered as the incoming
                  // slides up over it; hidden = waiting off the bottom (so it's 1 image at rest).
                  const state = i === active ? "active" : i === prev ? "prev" : "hidden"
                  return (
                    <img
                      key={step.id}
                      src={stage(step.id)}
                      alt={i === active ? step.alt : ""}
                      aria-hidden={i !== active}
                      draggable={false}
                      loading="eager"
                      data-state={state}
                      className="absolute inset-0 z-10 size-full translate-y-full rounded-[1.5rem] object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10 transition-[translate] duration-slow ease-out motion-reduce:transition-none data-[state=prev]:z-20 data-[state=prev]:translate-y-0 data-[state=active]:z-30 data-[state=active]:translate-y-0"
                    />
                  )
                })}
              </button>
            </LightboxTrigger>
          </Lightbox>
        </div>

        {/* Right: each chapter is a button that shuffles its card to the front on click. */}
        <ol className="flex flex-col">
          {STORY.map((step, i) => (
            <li key={step.title} data-active={i === active} className="group/step border-t border-border/60 first:border-t-0">
              <button type="button" onClick={() => select(i)} aria-pressed={i === active} className="flex w-full cursor-pointer items-baseline gap-4 py-6 text-left lg:py-7">
                <span className="text-sm font-medium tabular-nums text-muted-foreground/50 transition-colors duration-base ease-out group-data-[active=true]/step:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-balance text-muted-foreground/40 transition-colors duration-base ease-out group-data-[active=true]/step:text-foreground sm:text-3xl">
                  {step.title}
                </span>
              </button>
              {/* Description reveal: grid 0fr→1fr animates height:auto; same gentle ease, slight delay. */}
              <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-slow ease-in-out group-data-[active=true]/step:grid-rows-[1fr] group-data-[active=true]/step:opacity-100 group-data-[active=true]/step:delay-75">
                <div className="overflow-hidden">
                  <p className="max-w-md pb-6 pl-9 text-pretty text-muted-foreground lg:pb-7">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}`

const GALLERY_EXPAND_CODE = `const PANELS = [
  { title: "Design tokens", description: "Four themes, eight accents, one token layer.", id: "1486312338219-…", alt: "Landing page concept" },
  { title: "Composable parts", description: "89 components in one recipe language.", id: "1460925895917-…", alt: "Analytics dashboard" },
  { title: "Built-in motion", description: "Staggers, spring presses, scroll reveals.", id: "1467232004584-…", alt: "Minimal hero layout" },
  { title: "Accessible by default", description: "Focus, keyboard, ARIA from Radix underneath.", id: "1517694712202-…", alt: "Product homepage" },
  { title: "Ship anywhere", description: "Copy the source; it reads finished on first render.", id: "1531403009284-…", alt: "Studio workspace" },
]

// Click-driven, not hover/scroll: opens on a middle panel so the rail reads balanced at rest. Each
// panel is ONE stable button whose data-state flips active/collapsed, so the flex-grow width tween
// stays smooth. Click a sliver to bring it forward; click the open panel to open the lightbox.
function GalleryExpand() {
  const [active, setActive] = React.useState(2)
  const images = PANELS.map((p) => ({ src: full(p.id), alt: p.alt }))

  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="mx-auto w-full max-w-2xl px-6 pt-16 text-center sm:pt-20">
        <SectionHeader align="center" stagger staggerTrigger="inView">
          <SectionHeaderText>
            <Badge variant="purple" dot pill>Gallery</Badge>
            <SectionHeaderHeading>A closer look, one panel at a time</SectionHeaderHeading>
            <SectionHeaderDescription>Click a panel to bring it forward. The rest tuck into the rail.</SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>
      </div>

      <Lightbox images={images}>
        <div className="mx-auto mt-12 w-full max-w-[110rem] px-4 pb-16 sm:px-6 sm:pb-20 lg:mt-16">
          <div className="flex h-[22rem] gap-2.5 sm:h-[28rem] sm:gap-4 lg:h-[32rem]">
            {PANELS.map((panel, i) => {
              const isActive = i === active
              return (
                // Collapsed → preventDefault + setActive (expand). Open → the trigger opens the viewer.
                <LightboxTrigger key={panel.id} index={i} asChild onClick={(e) => { if (!isActive) { e.preventDefault(); setActive(i) } }}>
                  <button
                    type="button"
                    data-state={isActive ? "active" : "collapsed"}
                    aria-label={isActive ? "Open " + panel.title + " full screen" : "Show " + panel.title}
                    // flex-grow tweens the width; the open panel lifts on a per-theme shadow. ::after is
                    // the pure-black/white image-outline ring (crisp edge in every theme).
                    className="group/panel relative basis-0 grow cursor-pointer select-none overflow-hidden rounded-3xl bg-card text-left outline-none shadow-none transition-[flex-grow,box-shadow] duration-slow ease-out motion-reduce:transition-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10 data-[state=active]:grow-[7] data-[state=active]:min-w-0 data-[state=active]:shadow-xl data-[state=collapsed]:grow-[1] data-[state=collapsed]:min-w-[2.75rem] focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <img src={rail(panel.id)} alt={isActive ? panel.alt : ""} aria-hidden={!isActive} className="absolute inset-0 size-full object-cover" />
                    {/* dim recedes the slivers, lifts on hover to preview, clears when active */}
                    <span aria-hidden className="pointer-events-none absolute inset-0 bg-black/30 transition-[opacity,background-color] duration-slow ease-out group-hover/panel:bg-black/15 group-data-[state=active]/panel:opacity-0" />
                    {/* bottom gradient for the open caption */}
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-slow ease-out group-data-[state=active]/panel:opacity-100" />
                    {/* collapsed face: spaced number + glassy "+" that grows on hover, presses on click */}
                    <span aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-5 transition-opacity duration-base ease-out group-data-[state=active]/panel:opacity-0">
                      <span className="text-xs font-medium tabular-nums tracking-[0.2em] text-white/75">{String(i + 1).padStart(2, "0")}</span>
                      <span className="grid size-9 place-items-center rounded-full bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/25 backdrop-blur-md transition-[background-color,scale] duration-base ease-out group-hover/panel:bg-white/20 group-hover/panel:scale-110 group-active/panel:scale-95"><Plus weight="bold" /></span>
                    </span>
                    {/* open face: caption slides up + fades in after the panel widens */}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1.5 p-5 opacity-0 transition-[opacity,translate] duration-slow ease-out group-data-[state=active]/panel:translate-y-0 group-data-[state=active]/panel:opacity-100 group-data-[state=active]/panel:delay-100 sm:gap-2.5 sm:p-8 lg:p-10">
                      {/* span (block), not h3/p: a button's content model is phrasing only */}
                      <span className="block text-balance text-xl font-semibold tracking-tight text-white sm:text-[1.75rem] sm:leading-tight">{panel.title}</span>
                      <span className="line-clamp-3 max-w-md text-pretty text-sm leading-relaxed text-white/85 sm:text-base">{panel.description}</span>
                    </span>
                  </button>
                </LightboxTrigger>
              )
            })}
          </div>
        </div>
      </Lightbox>
    </section>
  )
}`

const HERO_CODE = `<Hero>
  <HeroContent>
    <Badge variant="orange" dot pill>Koala UI v1.0 is here</Badge>
    <HeroTitle>A design system built to feel finished</HeroTitle>
    <HeroSubtitle>89 accessible components and four themes, with the source copied straight into your repo.</HeroSubtitle>
    <HeroActions>
      <Button size="md">Buy once, use forever</Button>
      <Button size="md" variant="outline">Get the Figma kit</Button>
    </HeroActions>
    <HeroFeatures>{/* HeroFeature × N */}</HeroFeatures>
    <HeroSocialProof>{/* AvatarGroup + rating */}</HeroSocialProof>
  </HeroContent>
</Hero>`

const HERO_SECTION_3_CODE = `<Hero>
  <HeroContent className="max-w-5xl gap-8">
    <Badge variant="orange" dot pill>Koala UI v1.0 is here</Badge>
    <HeroTitle className="max-w-3xl leading-[1.2]">
      Bring your product into{" "}
      <HeroHighlight rotate={["every decision", "every workflow", "every release", "every roadmap"]}>
        every decision
      </HeroHighlight>
    </HeroTitle>
    <HeroSubtitle>Ship polished, accessible interfaces from the first commit.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Start for free</Button>
      <Button size="lg" variant="outline">Book a demo</Button>
    </HeroActions>
    {/* trusted-by logo row */}
    <HeroMedia className="mt-6 max-w-5xl">
      <img src={imageSrc} alt="" className="aspect-video w-full rounded-2xl border object-cover" />
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_8_CODE = `<Hero>
  <HeroContent className="max-w-5xl gap-8">
    <Badge variant="purple" dot pill>Koala UI v1.0 is here</Badge>
    <HeroTitle className="max-w-3xl">
      Ship your next product in a <HeroHighlight>weekend</HeroHighlight>
    </HeroTitle>
    <HeroSubtitle>A production-ready design system with everything wired up.</HeroSubtitle>
    <div className="flex flex-col items-center gap-3">
      <HeroActions>
        <Button size="lg">Start for free</Button>
        <Button size="lg" variant="outline">Book a demo</Button>
      </HeroActions>
      <p className="text-sm text-muted-foreground">No credit card required. Cancel anytime.</p>
    </div>
    <HeroMedia className="mt-6 w-full max-w-5xl">
      {/* Concentric frame: rounded-2xl shell over a rounded-xl browser window. */}
      <div className="rounded-2xl border border-border bg-card p-1.5 shadow-xl">
        <div className="overflow-hidden rounded-xl border border-border">
          {/* Chrome bar: window dots left, address pill centered via a 3-col grid. */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-muted-foreground/25" />
              <span className="size-3 rounded-full bg-muted-foreground/25" />
              <span className="size-3 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
              <Lock className="size-3" /> app.koala.com
            </div>
            <div aria-hidden />
          </div>
          <img src={imageSrc} alt="" className="aspect-video w-full object-cover" />
        </div>
      </div>
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_4_CODE = `<Hero layout="split">
  <HeroContent>
    <HeroColumn>
      <Badge variant="info" dot pill>Now in public beta</Badge>
      <HeroTitle>Analytics your whole team actually uses</HeroTitle>
      <HeroSubtitle>Real-time dashboards with no setup.</HeroSubtitle>
      <HeroActions>
        <Button size="lg">Get started</Button>
        <Button size="lg" variant="outline">Live demo</Button>
      </HeroActions>
      <HeroSocialProof>{/* AvatarGroup + rating */}</HeroSocialProof>
    </HeroColumn>
    <HeroMedia>
      <img src={imageSrc} alt="" className="aspect-[4/3] w-full rounded-2xl border object-cover" />
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_9_CODE = `{/* Full-viewport split: the section fills the screen (100svw x 100svh) and cuts down the middle,
    copy on one half, photo bleeding to the edges on the other. Mobile stacks it into a full-height
    column (grid-rows-[auto_1fr]); at lg the two halves sit side by side, 50/50. */}
<Hero layout="split">
  <div className="grid min-h-svh grid-rows-[auto_1fr] items-stretch lg:grid-cols-2 lg:grid-rows-1">
    {/* Copy, bottom-anchored (left-aligned), keeps its gutter */}
    <HeroColumn className="justify-end px-8 py-12 sm:px-12 lg:px-16 lg:py-20">
      {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
      <Badge variant="success" dot pill>New collection</Badge>
      <HeroTitle>Design made to feel like home</HeroTitle>
      <HeroSubtitle className="max-w-md text-base">
        We bring your interior dreams to life with personalized designs that reflect your style.
      </HeroSubtitle>
      <HeroActions className="pt-2">
        <Button size="md">Explore features</Button>
        <Button size="md" variant="outline">Sign up</Button>
      </HeroActions>
    </HeroColumn>
    {/* Media bleeds to the section edges: no frame, no gutter */}
    <div className="relative min-h-64 sm:min-h-80 lg:min-h-0">
      <img src={imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
    </div>
  </div>
</Hero>`

const HERO_SECTION_13_CODE = `<Hero>
  <HeroContent className="max-w-6xl gap-8">
    {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
    <Badge variant="success" dot pill>New collection</Badge>
    <HeroTitle className="max-w-2xl">Design made to feel like home</HeroTitle>
    <HeroSubtitle className="max-w-xl">
      We bring your interior dreams to life with personalized designs that reflect your style.
    </HeroSubtitle>
    <HeroActions>
      <Button size="md">Explore features</Button>
      <Button size="md" variant="outline">Sign up</Button>
    </HeroActions>
    {/* Masonry collage: fixed-height grid, 2x2 below sm; from sm up the two side images span both
        rows (tall) and the middle column stacks a pair. */}
    <HeroMedia className="mt-6 w-full max-w-6xl">
      <div className="grid h-[26rem] grid-cols-2 grid-rows-2 gap-3 sm:h-[30rem] sm:grid-cols-3 sm:gap-4 lg:h-[34rem]">
        <img src={photos[0]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border sm:col-start-1 sm:row-span-2 sm:row-start-1" />
        <img src={photos[1]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border sm:col-start-2 sm:row-start-1" />
        <img src={photos[2]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border sm:col-start-2 sm:row-start-2" />
        <img src={photos[3]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border sm:col-start-3 sm:row-span-2 sm:row-start-1" />
      </div>
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_14_CODE = `<Hero>
  <HeroContent className="max-w-6xl gap-8">
    {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
    <Badge variant="success" dot pill>New collection</Badge>
    <HeroTitle className="max-w-2xl">Design made to feel like home</HeroTitle>
    <HeroSubtitle className="max-w-xl">
      We bring your interior dreams to life with personalized designs that reflect your style.
    </HeroSubtitle>
    <HeroActions>
      <Button size="md">Explore features</Button>
      <Button size="md" variant="outline">Sign up</Button>
    </HeroActions>
    {/* Two-photo row: stacked below sm; side by side from sm up on a fixed-height grid so the wider
        left frame and the taller right frame share one baseline (1.7fr : 1fr split). */}
    <HeroMedia className="mt-6 w-full max-w-6xl">
      <div className="grid h-[30rem] grid-cols-1 grid-rows-2 gap-4 sm:h-[32rem] sm:grid-cols-[1.7fr_1fr] sm:grid-rows-1 lg:h-[38rem]">
        <img src={photos[0]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border" />
        <img src={photos[1]} alt="" className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border" />
      </div>
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_15_CODE = `{/* layout="split" is borrowed only to left-align the copy parts (not for the grid). Register the
    section \`bleed\` so the strip runs edge to edge while the copy re-adds the site gutter. */}
<Hero layout="split">
  {/* Copy: kept in the gutter (max-w-8xl + px), left-aligned. */}
  <div className="mx-auto w-full max-w-8xl px-6 pb-14 pt-12 sm:px-8 sm:pt-16">
    <HeroColumn className="max-w-2xl">
      {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
      <Badge variant="success" dot pill>New collection</Badge>
      <HeroTitle>Design made to feel like home</HeroTitle>
      <HeroSubtitle className="max-w-md text-base">
        We bring your interior dreams to life with personalized designs that reflect your style.
      </HeroSubtitle>
      <HeroActions className="pt-2">
        <Button size="md">Explore features</Button>
        <Button size="md" variant="outline">Sign up</Button>
      </HeroActions>
    </HeroColumn>
  </div>

  {/* Full-bleed photo marquee: the wrapper carries the seam clip + edge fade + hover pause; the
      \`w-max\` track holds two copies of the set so shifting it -50% (the --animate-marquee keyframe)
      loops seamlessly. \`pr\` matches \`gap\` so the seam spacing stays uniform. */}
  <div className="pb-16 sm:pb-24">
    <div className="group/marquee relative w-full overflow-hidden fade-x [--fade-size:10%]">
      <ul className="flex w-max animate-marquee items-center gap-4 pr-4 [--marquee-duration:60s] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none] sm:gap-5 sm:pr-5">
        {[...photos, ...photos].map((photo, i) => (
          <li key={i} className="shrink-0" aria-hidden={i >= photos.length}>
            <img
              src={photo.src}
              alt={i < photos.length ? photo.alt : ""}
              className="h-72 w-56 rounded-2xl object-cover ring-1 ring-inset ring-border sm:h-80 sm:w-64 lg:h-[26rem] lg:w-80"
            />
          </li>
        ))}
      </ul>
    </div>
  </div>
</Hero>`

const HERO_SECTION_16_CODE = `<Hero>
  <HeroContent className="max-w-3xl gap-8">
    {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
    <Badge variant="success" dot pill>New collection</Badge>

    {/* The headline ends in the Koala mark: the canonical BrandMark tile (/koala-logo.webp) dropped
        inline at cap height stands in for the last word (never a hand-rolled glyph). */}
    <HeroTitle className="leading-[1.15]">
      Be yourself until you can be a{" "}
      <Image
        src="/koala-logo.webp"
        alt="Koala"
        width={80}
        height={80}
        className="inline-block size-11 rounded-2xl align-middle shadow-md ring-1 ring-black/5 sm:size-14 lg:size-[4.25rem] dark:ring-white/10"
      />
    </HeroTitle>

    <HeroSubtitle className="max-w-xl">
      We bring your interior dreams to life with personalized designs that reflect your style.
    </HeroSubtitle>

    {/* Stacked, equal-width CTAs: a capped column so both buttons span one width. */}
    <HeroActions className="w-full max-w-sm flex-col">
      <Button size="lg" className="w-full">Get started</Button>
      <Button size="lg" variant="outline" className="w-full">Explore features</Button>
    </HeroActions>

    {/* Rotating trusted-by strip (colored lockups on the shared logo-swap roll), no label. */}
    <HeroLogoRow />

    {/* Three-photo row: one portrait tile per room, side by side from sm up. */}
    <HeroMedia className="mt-4 w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {photos.map((photo) => (
          <img key={photo.src} src={photo.src} alt={photo.alt} className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-inset ring-border" />
        ))}
      </div>
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_10_CODE = `<Hero>
  <HeroContent className="max-w-4xl gap-8">
    <Badge variant="teal" dot pill>Responsive by default</Badge>
    <HeroTitle className="max-w-3xl">Your product looks flawless on every screen</HeroTitle>
    <HeroSubtitle>Design once and ship a polished experience from mobile to desktop.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Start building</Button>
      <Button size="lg" variant="outline">See it live</Button>
    </HeroActions>
    {/* Finished device render (transparent PNG, bezel + shadow baked in): the frame IS the visual. */}
    <HeroMedia className="mt-8 w-full max-w-3xl">
      <img src="/devices/ipad-landscape.png" alt="" width={1030} height={807} className="h-auto w-full" />
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_11_CODE = `<Hero layout="split">
  <HeroContent>
    <HeroColumn>
      <Badge variant="purple" dot pill>iOS & Android</Badge>
      <HeroTitle>Ship a mobile app your users love</HeroTitle>
      <HeroSubtitle className="max-w-xl">Beautiful, accessible components tuned for touch.</HeroSubtitle>
      <HeroActions>
        <Button size="lg">Get the app</Button>
        <Button size="lg" variant="outline">Watch demo</Button>
      </HeroActions>
      <HeroSocialProof>{/* AvatarGroup + "4.9 on the App Store" */}</HeroSocialProof>
    </HeroColumn>
    {/* Finished iPhone render; the frame IS the visual, no wrapper needed. */}
    <HeroMedia className="flex justify-center">
      <img src="/devices/iphone.png" alt="" width={419} height={757} className="h-auto w-full max-w-[18rem]" />
    </HeroMedia>
  </HeroContent>
</Hero>`

const HERO_SECTION_12_CODE = `<Hero layout="split">
  <HeroContent>
    <HeroColumn>
      <Badge variant="info" dot pill>One system, every device</Badge>
      <HeroTitle>Design for phone, tablet, and beyond</HeroTitle>
      <HeroSubtitle className="max-w-xl">A single component library that scales across form factors.</HeroSubtitle>
      <HeroActions>
        <Button size="lg">Explore components</Button>
        <Button size="lg" variant="outline">Read the docs</Button>
      </HeroActions>
    </HeroColumn>
    {/* Device duo: an iPad (portrait) behind, an iPhone overlapping its lower-right corner. */}
    <HeroMedia className="mx-auto w-full max-w-md lg:max-w-none">
      <img src="/devices/ipad-portrait.png" alt="" width={802} height={1035} className="mx-auto block w-[82%]" />
      <img src="/devices/iphone.png" alt="" width={419} height={757} className="absolute bottom-0 right-0 w-[42%]" />
    </HeroMedia>
  </HeroContent>
</Hero>`


const HERO_SECTION_6_CODE = `<Hero layout="background" className="rounded-lg">
  <HeroBackground>
    {/* autoplay + muted + loop is the only kind browsers play unprompted */}
    <video src={videoSrc} poster={posterSrc} autoPlay loop muted playsInline />
    <img className="hidden motion-reduce:block" src={posterSrc} alt="" />
  </HeroBackground>
  <HeroContent>
    <HeroEyebrow><span className="size-1.5 rounded-full bg-white" /> Now in private beta</HeroEyebrow>
    <HeroTitle>Support that never sleeps</HeroTitle>
    <HeroSubtitle>AI agents pick up every call and answer in seconds.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Get started</Button>
    </HeroActions>
  </HeroContent>
</Hero>`

const HERO_SECTION_7_CODE = `<Hero layout="background" className="rounded-lg">
  <HeroBackground>
    <img src={photoSrc} alt="" />
  </HeroBackground>
  <HeroContent>
    <HeroEyebrow><span className="size-1.5 rounded-full bg-white" /> Series A: $61M to scale support</HeroEyebrow>
    <HeroTitle>AI that talks like a human. Handles millions of calls.</HeroTitle>
    <HeroSubtitle>AI agents for enterprise support.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Talk to us</Button>
    </HeroActions>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/70">
      {brands.map((b) => <PlaceholderLogo key={b.name} brand={b} mono />)}
    </div>
  </HeroContent>
</Hero>`

const NAVBAR_CODE = `<Navbar>
  <NavbarInner>
    <NavbarBrand href="/"><BrandMark /></NavbarBrand>
    <NavbarNav>
      <NavbarLink href="#" active>Features</NavbarLink>
      {/* Home · About · Blog · Pricing */}
    </NavbarNav>
    <NavbarSpacer />
    <NavbarActions>
      <Button size="sm" variant="ghost">Sign in</Button>
      <Button size="sm">Sign up</Button>
    </NavbarActions>
    <NavbarMobileToggle />
  </NavbarInner>
  <NavbarMobileMenu>{/* NavbarMobileLink × N */}</NavbarMobileMenu>
</Navbar>`

const TESTIMONIALS_CODE = `<SectionHeader align="center">
  <SectionHeaderText>
    <Badge variant="success" dot pill>Testimonials</Badge>
    <SectionHeaderHeading>Loved by teams who ship</SectionHeaderHeading>
    <SectionHeaderDescription>
      Thousands of product teams build their interfaces on Koala UI.
    </SectionHeaderDescription>
  </SectionHeaderText>
</SectionHeader>

<div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
  <Testimonial variant="bare" className="gap-4">
    {/* Author on top: clear mt-auto so the byline leads the card. */}
    <TestimonialFooter className="mt-0">
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/160?img=12" alt="Liam McCabe" />
        <AvatarFallback>LM</AvatarFallback>
      </Avatar>
      <TestimonialAuthor>
        <TestimonialName>Liam McCabe</TestimonialName>
        <TestimonialTitle>Founder, Halcyon</TestimonialTitle>
      </TestimonialAuthor>
    </TestimonialFooter>
    <div className="flex flex-col gap-2">
      <TestimonialQuote className="font-semibold text-foreground">
        The UI kit looks fantastic, incredibly extensive.
      </TestimonialQuote>
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        Especially impressed that it's all there from day one.
      </p>
    </div>
  </Testimonial>
  {/* … two more */}
</div>`

/**
 * Section slabs that lead with a `SectionHeader` lede. The render target wraps each `component` in
 * a `SectionContainer` (a flex column with the canonical 56px gap), so a slab that returns the
 * header followed by the content lands the lede 56px above the block for free, no per-slab margin.
 * Sections that already lead with their own heading (Hero, Gallery) or are page chrome (Navbar,
 * Footer) keep their bare demo. The copy here is real marketing copy (not the docs description),
 * since the docs page already shows that above the frame.
 */
/**
 * Banner variants render BARE and full-bleed (no SectionHeader, no rounding): each is its own
 * labeled preview on the docs page, pinned to the top of a short page region by the `bleed`
 * render path, so it reads as a real site-wide bar sitting atop a page. `Banner` owns its own
 * dismiss state, so these stay plain server-rendered compositions. The exception is the live
 * countdown bar (`banner-countdown`), which needs a ticking client clock and so is imported from
 * the banner demos island as `BannerCountdownSection`.
 */
function BannerSoftSection() {
  return (
    <Banner variant="purple" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Megaphone weight="bold" />
      </BannerIcon>
      <BannerContent>New: cream and moonlight themes just landed.</BannerContent>
      <BannerAction href="#">
        Check it out
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  )
}

function BannerBrandSection() {
  return (
    <Banner appearance="solid" variant="brand" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Rocket weight="bold" />
      </BannerIcon>
      <BannerContent>Koala UI v1.0 is here.</BannerContent>
      <BannerAction href="#">
        Read the release notes
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  )
}

function BannerDarkSection() {
  return (
    <Banner appearance="solid" variant="default" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Megaphone weight="bold" />
      </BannerIcon>
      <BannerContent>GeneriCon 2026 · Join us in Denver from June 7 to 9.</BannerContent>
      <BannerAction href="#">
        Register now
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  )
}

function BannerCtaSection() {
  return (
    <Banner align="between" variant="info" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Lightning weight="bold" />
      </BannerIcon>
      <BannerContent>You have 14 days left in your free trial.</BannerContent>
      <Button size="sm" asChild>
        <a href="#">Upgrade</a>
      </Button>
    </Banner>
  )
}

function BentoSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Features
          </Badge>
          <SectionHeaderHeading>Everything you need to ship</SectionHeaderHeading>
          <SectionHeaderDescription>
            A complete toolkit of polished components, theming, and assets, so you can go from idea
            to production without sweating the details.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BentoDemo />
    </>
  )
}

function VideoShowcaseSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            See it in motion
          </Badge>
          <SectionHeaderHeading>See it move before you build it</SectionHeaderHeading>
          <SectionHeaderDescription>
            Every component and section in motion, exactly as it behaves in your product. Press
            play, then drop the same source into your repo.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <VideoShowcaseFrame />
    </>
  )
}

function TestimonialsSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Testimonials
          </Badge>
          <SectionHeaderHeading>Loved by teams who ship</SectionHeaderHeading>
          <SectionHeaderDescription>
            Thousands of product teams build their interfaces on Koala UI. Here is what a few of
            them have to say.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <MinimalTestimonialsContent />
    </>
  )
}

function LogoLedTestimonialsSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Social proof
          </Badge>
          <SectionHeaderHeading>Backed by teams shipping real products</SectionHeaderHeading>
          <SectionHeaderDescription>
            Logo-led proof: founders and engineers who build on Koala UI every day.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <LogoLedTestimonialsContent />
    </>
  )
}

function SpotlightTestimonialsSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Testimonials
          </Badge>
          <SectionHeaderHeading>Real words, real impact</SectionHeaderHeading>
          <SectionHeaderDescription>
            One story at a time. Swipe through the teams building their products on Koala UI.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <SpotlightTestimonialsContent />
    </>
  )
}

function ComponentShowcaseSection() {
  return (
    <>
      <SectionHeader align="center" stagger staggerTrigger="inView">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Components
          </Badge>
          <SectionHeaderHeading>89 components, ready to use</SectionHeaderHeading>
          <SectionHeaderDescription>
            These are live, not screenshots. Toggle, drag, and open them right here, then drop the
            same source into your project.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      {/* Group the gallery and its trailing CTA so the container's 56px gap only sits above the
          header, not between the wall and the button. */}
      <div className="flex flex-col gap-10">
        <ShowcaseGallery />
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/docs">
              See all components
              <ArrowRight weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}

function FeatureGridSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="orange" dot pill>
            Why Koala UI
          </Badge>
          <SectionHeaderHeading>The hard parts, already handled</SectionHeaderHeading>
          <SectionHeaderDescription>
            A foundation that handles the hard parts, so your team spends its time on the product,
            not the primitives.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <FeatureGridContent />
    </>
  )
}

function FeatureMosaicSection() {
  return (
    <>
      <SectionHeader align="left">
        <SectionHeaderText>
          <Badge variant="teal" dot pill>
            Ecosystem
          </Badge>
          <SectionHeaderHeading>Meet the Koala ecosystem</SectionHeaderHeading>
          <SectionHeaderDescription>
            Everything you need to design and ship a product, from the smallest token to a full
            marketing page, on one consistent system.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <FeatureMosaicContent />
    </>
  )
}

function FeatureStrokeSection() {
  return (
    <>
      <SectionHeader align="left">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Built in
          </Badge>
          <SectionHeaderHeading>Everything the system already handles</SectionHeaderHeading>
          <SectionHeaderDescription>
            Five foundations working together on every screen you ship, so the hard parts are done
            before you start.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <FeatureStrokeContent />
    </>
  )
}

function StatsSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            In the box
          </Badge>
          <SectionHeaderHeading>The whole library, counted</SectionHeaderHeading>
          <SectionHeaderDescription>
            Every component, theme, and recipe you get on install, banded onto one segmented surface.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <StatsContent />
    </>
  )
}

function StatsSpotlightSection() {
  return (
    <>
      <SectionHeader align="left" orientation="split">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Outcomes
          </Badge>
          <SectionHeaderHeading>Like hiring a design team overnight</SectionHeaderHeading>
          <SectionHeaderDescription>
            Teams that standardize on Koala ship accessible, finished interfaces in a fraction of the
            time, on one system across every surface.
          </SectionHeaderDescription>
        </SectionHeaderText>
        <SectionHeaderActions>
          <Button asChild size="lg">
            <Link href="#">
              Get started
              <ArrowRight weight="bold" />
            </Link>
          </Button>
        </SectionHeaderActions>
      </SectionHeader>
      <StatsSpotlightContent />
    </>
  )
}

function StatsTrendsSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Momentum
          </Badge>
          <SectionHeaderHeading>Growing with every release</SectionHeaderHeading>
          <SectionHeaderDescription>
            How adoption of the library is trending, quarter over quarter.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <StatsTrendsContent />
    </>
  )
}

function StatsCaptionTopSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Reach
          </Badge>
          <SectionHeaderHeading>Adoption you can measure</SectionHeaderHeading>
          <SectionHeaderDescription>
            Teams, installs, and time-to-ship, counted across everyone building on Koala.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <StatsCaptionTopContent />
    </>
  )
}

function StatsCenteredSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Why teams stay
          </Badge>
          <SectionHeaderHeading>Built for products in production</SectionHeaderHeading>
          <SectionHeaderDescription>
            The things that matter after launch day, not just on it.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <StatsCenteredContent />
    </>
  )
}

function StatsPanelSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            At a glance
          </Badge>
          <SectionHeaderHeading>The numbers behind the polish</SectionHeaderHeading>
          <SectionHeaderDescription>
            From the teams building on it to the parts in the box, here is Koala by the figures.
          </SectionHeaderDescription>
        </SectionHeaderText>
        <SectionHeaderActions>
          <Button asChild size="lg">
            <Link href="#">
              Get started
              <ArrowRight weight="bold" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#">Explore components</Link>
          </Button>
        </SectionHeaderActions>
      </SectionHeader>
      <StatsPanelContent />
    </>
  )
}

function StatsSteppedSection() {
  return (
    <>
      <SectionHeader align="left">
        <SectionHeaderText className="max-w-2xl">
          <Badge variant="purple" dot pill>
            By the numbers
          </Badge>
          <SectionHeaderHeading>
            We build the foundation, teams build the product
          </SectionHeaderHeading>
          <SectionHeaderDescription>
            The proof is in what teams do with it: source pulled every day, engineering time saved,
            and finished screens shipped across every surface.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <StatsSteppedContent />
    </>
  )
}

function StatsMixedSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="teal" dot pill>
            Trusted by teams
          </Badge>
          <SectionHeaderHeading>52,800 hours and a mountain of rebuilds, saved</SectionHeaderHeading>
        </SectionHeaderText>
      </SectionHeader>
      <StatsMixedContent />
    </>
  )
}

function PricingSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Pricing
          </Badge>
          <SectionHeaderHeading>Simple, transparent pricing</SectionHeaderHeading>
          <SectionHeaderDescription>
            Start free and upgrade as your team grows. No hidden fees, cancel anytime.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <PricingDemo />
    </>
  )
}

function FaqSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            FAQ
          </Badge>
          <SectionHeaderHeading>Questions, answered</SectionHeaderHeading>
          <SectionHeaderDescription>
            Everything worth knowing before you install.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <FaqContent />
    </>
  )
}

function FaqGroupedSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            FAQ
          </Badge>
          <SectionHeaderHeading>Answers, by topic</SectionHeaderHeading>
          <SectionHeaderDescription>
            Browse the common questions, grouped by what you are trying to do.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <FaqGroupedContent />
    </>
  )
}

function ChangelogSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Changelog
          </Badge>
          <SectionHeaderHeading>What shipped recently</SectionHeaderHeading>
          <SectionHeaderDescription>
            The library gains components and refinements every month. Here is the latest.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <ChangelogContent />
    </>
  )
}

function ChangelogTimelineSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Changelog
          </Badge>
          <SectionHeaderHeading>Every release, in order</SectionHeaderHeading>
          <SectionHeaderDescription>
            The full version history as one continuous thread, newest first.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <ChangelogTimelineContent />
    </>
  )
}

function ChangelogMediaSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Changelog
          </Badge>
          <SectionHeaderHeading>New in Koala UI</SectionHeaderHeading>
          <SectionHeaderDescription>
            The most recent releases, each with a cover and a short note.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <ChangelogMediaContent />
    </>
  )
}

// The editorial variant carries its own left-aligned lede inside the sticky rail, so it renders raw.
function ChangelogEditorialSection() {
  return <ChangelogEditorialContent />
}

function ChangelogNotesSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Changelog
          </Badge>
          <SectionHeaderHeading>Latest updates</SectionHeaderHeading>
          <SectionHeaderDescription>
            A running log of what shipped, newest first.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <ChangelogNotesContent />
    </>
  )
}

function BlogSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Blog
          </Badge>
          <SectionHeaderHeading>From the Koala blog</SectionHeaderHeading>
          <SectionHeaderDescription>
            Product notes, engineering deep-dives, and the thinking behind the system.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BlogContent />
    </>
  )
}

function BlogEditorialSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Writing
          </Badge>
          <SectionHeaderHeading>Latest from the team</SectionHeaderHeading>
          <SectionHeaderDescription>
            Notes on the craft, shipped as we learn. A minimal, text-first index.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BlogEditorialContent />
    </>
  )
}

function BlogSidebarSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Blog
          </Badge>
          <SectionHeaderHeading>Fresh off the blog</SectionHeaderHeading>
          <SectionHeaderDescription>
            One lead story, plus the latest from every corner of the product.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BlogSidebarContent />
    </>
  )
}

function BlogOverlaySection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Blog
          </Badge>
          <SectionHeaderHeading>Stories worth your time</SectionHeaderHeading>
          <SectionHeaderDescription>
            An image-led index: filter by topic and dive into any cover.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BlogOverlayContent />
    </>
  )
}

function BlogNotesSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Blog
          </Badge>
          <SectionHeaderHeading>Writing &amp; updates</SectionHeaderHeading>
          <SectionHeaderDescription>
            Notes from the team, newest first. A minimal, date-led index.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <BlogNotesContent />
    </>
  )
}

function LogoCloudSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Social proof
          </Badge>
          <SectionHeaderHeading>Trusted by the teams behind great products</SectionHeaderHeading>
          <SectionHeaderDescription>
            The companies building their interfaces on Koala UI, from fast-moving startups to the
            Fortune 500.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <LogoCloudContent />
    </>
  )
}

function LogoGridSection() {
  return (
    <>
      <SectionHeader align="center">
        <SectionHeaderText>
          <Badge variant="purple" dot pill>
            Customers
          </Badge>
          <SectionHeaderHeading>Powering products at companies of every size</SectionHeaderHeading>
          <SectionHeaderDescription>
            A system trusted in production, from the first commit all the way to global scale.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <LogoBorderedGridContent />
    </>
  )
}

// ── Authentication (application-domain page sections) ─────────────────────────────────────────

const AUTH_LOGIN_SPLIT_CODE = `<SplitLayout>
  <SplitPane>
    <SplitPaneBody width="sm" className="gap-8">
      <BrandMark />
      <LoginForm variant="bare" onSubmit={signIn} onProvider={oauth} />
    </SplitPaneBody>
  </SplitPane>

  <SplitMedia>
    <img className="absolute inset-0 size-full object-cover" src="/cover.jpg" alt="" />
    <SplitMediaOverlay>
      <p>Koala UI let us ship a polished product in days, not months.</p>
      <p>Mara Okonkwo · Founder, Nimbus</p>
    </SplitMediaOverlay>
  </SplitMedia>
</SplitLayout>`

const AUTH_LOGIN_CENTERED_CODE = `<div className="grid min-h-svh place-items-center bg-muted/30 p-6">
  <div className="flex w-full max-w-sm flex-col items-center gap-6">
    <BrandMark />
    <LoginForm className="w-full" onSubmit={signIn} onProvider={oauth} />
  </div>
</div>`

const AUTH_SIGNUP_SPLIT_CODE = `<SplitLayout>
  <SplitMedia>
    <img className="absolute inset-0 size-full object-cover" src="/cover.jpg" alt="" />
    <SplitMediaOverlay className="justify-between">
      <BrandMark className="text-white" />
      <p>Build faster with a design system that ships finished.</p>
    </SplitMediaOverlay>
  </SplitMedia>

  <SplitPane>
    <SplitPaneBody width="sm">
      <SignUpForm variant="bare" onSubmit={register} onProvider={oauth} />
    </SplitPaneBody>
  </SplitPane>
</SplitLayout>`

const AUTH_SIGNUP_CENTERED_CODE = `<div className="grid min-h-svh place-items-center bg-muted/30 p-6">
  <div className="flex w-full max-w-sm flex-col items-center gap-6">
    <Badge variant="success" size="lg" pill>
      <ShieldCheck /> SOC 2 compliant
    </Badge>
    <SignUpForm className="w-full" onSubmit={register} onProvider={oauth} />
  </div>
</div>`

const AUTH_PROVIDER_STACK_CODE = `<div className="grid min-h-svh place-items-center bg-muted/30 p-6">
  <ProviderForm
    className="w-full max-w-sm"
    title="Sign in to Koala"
    description="Use a provider or get a magic link by email."
    providers={["google", "github", "apple"]}
    showEmail
    onProvider={oauth}
    onSubmit={sendMagicLink}
  />
</div>`

const AUTH_COMMUNITY_CODE = `<div className="grid min-h-svh place-items-center bg-muted/30 p-6">
  <div className="flex w-full max-w-sm flex-col items-center gap-6">
    <DiscordAppMark />
    <ProviderForm
      className="w-full"
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
      onProvider={oauth}
    />
  </div>
</div>`

const AUTH_COMMUNITY_SPLIT_CODE = `<SplitLayout>
  <SplitPane>
    <SplitPaneBody width="sm" className="gap-8">
      <ProviderForm
        variant="bare"
        providers={["discord"]}
        emphasizeFirst
        action="sign-in"
        requireTerms
        social={socials}
        onProvider={oauth}
      />
    </SplitPaneBody>
  </SplitPane>

  <SplitMedia>
    <img className="absolute inset-0 size-full object-cover" src="/cover.jpg" alt="" />
  </SplitMedia>
</SplitLayout>`

const CHECKOUT_BILLING_SPLIT_CODE = `<SplitLayout density="comfortable">
  {/* LEFT — billing form */}
  <SplitPane>
    <SplitPaneBody width="md" className="my-0 gap-8">
      <BrandMark />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#">Plans</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Payment</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <RadioGroup defaultValue="individual" className="grid grid-cols-2 gap-3">
          <RadioCard value="individual" className="items-center">
            <RadioCardTitle>Bill as individual</RadioCardTitle>
          </RadioCard>
          <RadioCard value="company" className="items-center">
            <RadioCardTitle>Bill as company</RadioCardTitle>
          </RadioCard>
        </RadioGroup>

        <Field>
          <FieldLabel>Billing name</FieldLabel>
          <InputRoot><InputField defaultValue="Alex Smith" /></InputRoot>
        </Field>

        <Field>
          <FieldLabel>Billing email</FieldLabel>
          <FieldHint>Where invoices get sent. This can be different from your account email.</FieldHint>
          <InputRoot><InputField type="email" defaultValue="alexsmith.koala+1@gmail.com" /></InputRoot>
        </Field>

        {/* Segmented address: one shell, hairline-joined rows (InputGroup pattern, vertical) */}
        <Field>
          <FieldLabel>Billing address</FieldLabel>
          <BillingAddress />
        </Field>

        <Field>
          <FieldLabel>Card number</FieldLabel>
          <InputRoot>
            <InputField defaultValue="•••• •••• •••• 0123" />
            <InputSuffix><VisaMark /></InputSuffix>
          </InputRoot>
        </Field>

        <FieldRow>
          <Field>
            <FieldLabel>Expiration (MM/YY)</FieldLabel>
            <InputRoot><InputField placeholder="MM / YY" defaultValue="02 / 45" /></InputRoot>
          </Field>
          <Field>
            <FieldLabel>Security code</FieldLabel>
            <InputRoot>
              <InputField placeholder="CVC" defaultValue="808" />
              <InputSuffix><CreditCard weight="bold" /></InputSuffix>
            </InputRoot>
          </Field>
        </FieldRow>

        <Button size="lg" type="submit" className="mt-2 w-full">Confirm payment</Button>
      </form>
    </SplitPaneBody>
  </SplitPane>

  {/* RIGHT — order summary (faint panel, divided; stacks under the form below lg) */}
  <SplitPane className="border-t border-border bg-muted/30 lg:border-t-0 lg:border-l">
    <SplitPaneBody width="sm" className="gap-8">
      <h2 className="text-base font-semibold">Summary</h2>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium">Plan</span>
          <a href="#" className="text-sm font-medium text-link underline-offset-4 hover:underline">Change</a>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span>Growth</span>
          <span className="tabular-nums text-foreground">$20.00</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">Discount code</span>
          <span className="text-sm text-muted-foreground">Discounts are applied before billing.</span>
        </div>
        <InputGroup>
          <InputRoot><InputField placeholder="Enter discount code" /></InputRoot>
          <Button variant="secondary">Apply</Button>
        </InputGroup>
      </div>

      {/* The shipped OrderSummary read-out, flush (plain, unpadded) */}
      <OrderSummary variant="plain">
        <OrderSummaryTotals className="gap-4 border-t-0 p-0">
          <OrderSummaryRow label="Subtotal">$20.00</OrderSummaryRow>
          <OrderSummaryRow label="Credits" tone="discount">-$5.00</OrderSummaryRow>
          <OrderSummaryRow label="Taxes">$0.00</OrderSummaryRow>
          <OrderSummaryTotal label="Due today">
            $15.00 <span className="font-normal text-muted-foreground">+ usage</span>
          </OrderSummaryTotal>
        </OrderSummaryTotals>
      </OrderSummary>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-pretty text-muted-foreground">
          Monthly usage will be calculated at the end of the billing cycle, with any overage
          (after allowances and discounts) added to your next invoice.
        </p>
        <a href="#" className="text-sm font-medium text-link underline-offset-4 hover:underline">Learn more</a>
      </div>
    </SplitPaneBody>
  </SplitPane>
</SplitLayout>`

const CHECKOUT_CART_SPLIT_CODE = `<SplitLayout density="comfortable" ratio="start">
  {/* LEFT — contact · shipping · delivery · payment */}
  <SplitPane>
    <SplitPaneBody width="md" className="my-0 gap-8">
      <BrandMark />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#">Cart</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Checkout</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Contact</h2>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <InputRoot><InputField type="email" defaultValue="alex@example.com" /></InputRoot>
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Shipping address</h2>
          <Field>
            <FieldLabel>Full name</FieldLabel>
            <InputRoot><InputField defaultValue="Alex Smith" /></InputRoot>
          </Field>
          <Field>
            <FieldLabel>Address</FieldLabel>
            <AddressFields line1="1 Marina Boulevard" city="Singapore" postal="018989" country="SG" />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Delivery method</h2>
          <RadioGroup defaultValue="standard" className="flex flex-col gap-3">
            <RadioCard value="standard">
              <RadioCardTitle>Standard</RadioCardTitle>
              <RadioCardDescription>Free · 4 to 6 business days</RadioCardDescription>
            </RadioCard>
            <RadioCard value="express">
              <RadioCardTitle>Express</RadioCardTitle>
              <RadioCardDescription>$12.00 · 1 to 2 business days</RadioCardDescription>
            </RadioCard>
          </RadioGroup>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Payment</h2>
          <Field>
            <FieldLabel>Card number</FieldLabel>
            <InputRoot>
              <InputField defaultValue="•••• •••• •••• 0123" />
              <InputSuffix><VisaMark /></InputSuffix>
            </InputRoot>
          </Field>
          <FieldRow>
            <Field>
              <FieldLabel>Expiration (MM/YY)</FieldLabel>
              <InputRoot><InputField placeholder="MM / YY" defaultValue="02 / 45" /></InputRoot>
            </Field>
            <Field>
              <FieldLabel>Security code</FieldLabel>
              <InputRoot>
                <InputField placeholder="CVC" defaultValue="808" />
                <InputSuffix><CreditCard weight="bold" /></InputSuffix>
              </InputRoot>
            </Field>
          </FieldRow>
        </section>

        <Button size="lg" type="submit" className="w-full">Pay $314.28</Button>
      </form>
    </SplitPaneBody>
  </SplitPane>

  {/* RIGHT — the cart, as the shipped OrderSummary with real line items */}
  <SplitPane className="border-t border-border bg-muted/30 lg:border-t-0 lg:border-l">
    <SplitPaneBody width="sm" className="my-0">
      <OrderSummary variant="plain" density="comfortable">
        <OrderSummaryHeader>
          <OrderSummaryTitle asChild><h2>Order summary</h2></OrderSummaryTitle>
          <Badge variant="secondary" pill>4 items</Badge>
        </OrderSummaryHeader>

        <OrderSummaryItems>
          {cart.map((item) => (
            <OrderSummaryItem key={item.name}>
              <OrderSummaryItemThumbnail count={item.qty}>
                <img src={item.src} alt={item.name} />
              </OrderSummaryItemThumbnail>
              <OrderSummaryItemContent>
                <OrderSummaryItemName>{item.name}</OrderSummaryItemName>
                <OrderSummaryItemOptions>{item.options}</OrderSummaryItemOptions>
              </OrderSummaryItemContent>
              <OrderSummaryItemPrice>{item.price}</OrderSummaryItemPrice>
            </OrderSummaryItem>
          ))}
        </OrderSummaryItems>

        <OrderSummaryPromo>
          <InputGroup>
            <InputRoot><InputField placeholder="Discount code" /></InputRoot>
            <Button variant="secondary">Apply</Button>
          </InputGroup>
        </OrderSummaryPromo>

        <OrderSummaryTotals>
          <OrderSummaryRow label="Subtotal">$291.00</OrderSummaryRow>
          <OrderSummaryRow label="Shipping" tone="muted">Free</OrderSummaryRow>
          <OrderSummaryRow label="Estimated tax">$23.28</OrderSummaryRow>
          <OrderSummaryTotal label="Total">$314.28</OrderSummaryTotal>
        </OrderSummaryTotals>
      </OrderSummary>
    </SplitPaneBody>
  </SplitPane>
</SplitLayout>`

// ── Page-tier code (blog post pages) ────────────────────────────────────────────────────────────
// Pages are full compositions, so the previewed source is the page's outline: the shell + the
// shared blocks it stacks. The real implementation ships behind the PRO lock (memory
// `distribution-gated-cli`); the copy button hands over this scaffold as the starting point.
const BLOG_POST_PAGE_CODE = `export function BlogPostPage() {
  return (
    <PageShell>            {/* Navbar + main + Footer */}
      <article>
        <BackLink />
        <header className="mx-auto max-w-3xl px-6 text-center">
          <Badge variant={blogTone[article.category]}>{article.category}</Badge>
          <h1>{article.title}</h1>
          <p className="text-muted-foreground">{article.deck}</p>
          <Byline />
        </header>

        <img src={article.cover} alt={article.coverAlt} className="rounded-2xl ring-1 ring-inset ring-foreground/10" />

        <div className="mx-auto max-w-3xl px-6">
          <ArticleBody />   {/* prose: h2 + p + list + pull-quote + figure */}
          <TagsShare />     {/* tag Badges + icon-only ShareRow */}
          <AuthorBio />
        </div>
      </article>

      <NewsletterCta />     {/* NewsletterForm variant="card" */}
      <RelatedPosts />      {/* three BlogCards, the other posts */}
    </PageShell>
  )
}`

const BLOG_POST_SIDEBAR_PAGE_CODE = `export function BlogPostWithTocPage() {
  return (
    <PageShell>
      <header className="mx-auto max-w-3xl px-6">{/* left-aligned Badge + h1 + deck + Byline */}</header>
      <img src={article.cover} className="rounded-2xl ring-1 ring-inset ring-foreground/10" />

      {/* Sticky table-of-contents rail beside the reading column. */}
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <TableOfContents />   {/* scroll-spy highlights the section in view */}
          </div>
        </aside>
        <div className="max-w-3xl">
          <ArticleBody />
          <TagsShare />
          <AuthorBio />
        </div>
      </div>

      <NewsletterCta />
      <RelatedPosts />
    </PageShell>
  )
}`

const BLOG_POST_HERO_PAGE_CODE = `export function BlogPostImageHeroPage() {
  return (
    <PageShell>
      {/* Full-bleed cover with the title laid over a bottom-weighted scrim. */}
      <header className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden">
        <img src={article.cover} className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
        <div className="mx-auto w-full max-w-4xl px-6 pb-16 text-white">
          <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-inset ring-white/25 backdrop-blur-md">
            {article.category}
          </span>
          <h1>{article.title}</h1>
          <p className="text-white/80">{article.deck}</p>
          <Byline onImage />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6">
        <ArticleBody />
        <TagsShare />
        <AuthorBio />
      </div>

      <NewsletterCta />
      <RelatedPosts />
    </PageShell>
  )
}`

export const SECTIONS: Record<string, SectionEntry> = {
  banner: {
    title: "Soft tones",
    description:
      "A soft-tinted announcement bar: the tone tints the background while the icon and action carry the hue, so it re-themes across every theme.",
    domain: "marketing",
    level: "section",
    component: BannerSoftSection,
    code: BANNER_SOFT_CODE,
    bleed: true,
  },
  "banner-brand": {
    title: "On brand",
    description:
      "A solid brand bar. The brand accent is constant across themes, so white text stays legible on every surface.",
    domain: "marketing",
    level: "section",
    component: BannerBrandSection,
    code: BANNER_BRAND_CODE,
    bleed: true,
  },
  "banner-dark": {
    title: "On dark",
    description:
      "A solid inverse bar: dark-on-light or light-on-dark, flipping with the theme for a high-contrast site-wide notice.",
    domain: "marketing",
    level: "section",
    component: BannerDarkSection,
    code: BANNER_DARK_CODE,
    bleed: true,
  },
  "banner-cta": {
    title: "With a CTA button",
    description:
      "Message pinned left, a Button call to action pinned right (align=between), the natural home for a primary action.",
    domain: "marketing",
    level: "section",
    component: BannerCtaSection,
    code: BANNER_CTA_CODE,
    bleed: true,
  },
  "banner-countdown": {
    title: "Countdown timer",
    description:
      "A limited-time promo bar with a live countdown ticking between the message and the CTA. The days, hours, minutes, and seconds segments use tabular figures so the bar never reflows as it counts down, and the soft tone re-themes across every theme.",
    domain: "marketing",
    level: "section",
    component: BannerCountdownSection,
    code: BANNER_COUNTDOWN_CODE,
    bleed: true,
  },
  "feature-section-3": {
    title: "Bento",
    description:
      "An asymmetric marketing grid of feature tiles: tinted icons, balanced titles, and screenshots that peek up from the bottom edge. The grid collapses from six columns to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: BentoSection,
    code: BENTO_CODE,
  },
  "feature-section-2": {
    title: "Video showcase",
    description:
      "A centered lede over a full-width product video, played through Koala's own VideoPlayer in a concentric-radius frame. Controls stay hidden until you hover, and the clip autoplays muted and loops for the cinematic feel.",
    domain: "marketing",
    level: "section",
    component: VideoShowcaseSection,
    code: FEATURE_SECTION_2_CODE,
    locked: true,
  },
  "feature-section-5": {
    title: "Ecosystem mosaic",
    description:
      "A left-aligned lede over a two-up wall of image-led tiles. Each tile is one clickable surface: a cover photo seated behind the copy under paired scrims, a category kicker pinned to the top, and the surface name plus one supporting line at the foot. Quiet at rest. On hover or focus a glassy corner chip unblurs and scales into place while the photo eases in and the card lifts a hair. The grid collapses to a single column as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: FeatureMosaicSection,
    code: FEATURE_SECTION_5_CODE,
  },
  footer: {
    title: "Footer",
    description:
      "A composable site footer: a brand column with social links, grouped link columns, and a legal bottom bar. Pure layout that drops onto any marketing or product page.",
    domain: "marketing",
    level: "section",
    component: FooterDemo,
    code: FOOTER_CODE,
    locked: true,
    // The Footer is its own band: it centers and pads itself (max-w-7xl + px-6 + its own block
    // padding), so composers skip the SectionContainer gutter to avoid double-padding it.
    ownsPadding: true,
  },
  "footer-section-2": {
    title: "Image overlay",
    description:
      "An image-led footer where a full-bleed photo becomes the backdrop and the nav rides on top: five link columns at the top, an open scenic band through the middle, and a minimal copyright + legal bar at the bottom. A scrim keeps the white text legible; swap the image src for your own art.",
    domain: "marketing",
    level: "section",
    component: FooterOverlayDemo,
    code: FOOTER_SECTION_2_CODE,
    locked: true,
    bleed: true,
  },
  "footer-section-3": {
    title: "Newsletter strip",
    description:
      "A newsletter-led footer: an email-capture band leads on top, a hairline splits it from a wide four-column link grid, and the brand, social, and legal bar close it. The signup is the canonical NewsletterForm in its inline layout, shipping the loading-to-success flow out of the box.",
    domain: "marketing",
    level: "section",
    component: FooterNewsletterStripDemo,
    code: FOOTER_SECTION_3_CODE,
    locked: true,
    ownsPadding: true,
  },
  "footer-section-4": {
    title: "Newsletter card",
    description:
      "A footer with the signup as a self-contained card: the brand and link columns sit on the left, and a NewsletterForm card (heading, lead, and fine print) anchors the right. The card brings its own concentric surface so the nested input blends with the panel.",
    domain: "marketing",
    level: "section",
    component: FooterNewsletterCardDemo,
    code: FOOTER_SECTION_4_CODE,
    locked: true,
    ownsPadding: true,
  },
  "footer-section-5": {
    title: "Minimal centered",
    description:
      "A compact, centered footer for simpler pages: a centered brand mark, a single inline nav row, a capped inline newsletter, the social row, and a centered legal line. A lighter alternative to the mega link grid.",
    domain: "marketing",
    level: "section",
    component: FooterCenteredDemo,
    code: FOOTER_SECTION_5_CODE,
    locked: true,
    ownsPadding: true,
  },
  "gallery-section-1": {
    title: "Gallery",
    description:
      "A marketing concepts wall: a balanced headline, an optional tab rail to switch categories, and a full-bleed fake-masonry of framed preview tiles with a built-in lightbox.",
    domain: "marketing",
    level: "section",
    component: GalleryDemo,
    code: GALLERY_CODE,
    locked: true,
    // The Gallery is its own full-bleed band: it brings its own gutter, width caps (a centered lede
    // plus a masonry that bleeds WIDER than the 1440 gutter), and vertical rhythm. Wrapping it in a
    // SectionContainer would double-pad it and cap the bleed, so it owns its padding like Hero.
    ownsPadding: true,
  },
  "gallery-section-2": {
    title: "Gallery",
    description:
      "A two-direction marquee wall: framed previews drift past in opposite rows (pause on hover), each opening a built-in full-screen lightbox, capped with a centered CTA.",
    domain: "marketing",
    level: "section",
    component: GalleryMarqueeDemo,
    code: GALLERY_MARQUEE_CODE,
    locked: true,
    bleed: true,
  },
  "gallery-section-3": {
    title: "Gallery",
    description:
      "The tabbed fake-masonry wall with chrome: a badge eyebrow and a balanced headline up top, a tab rail to switch categories, then a full-bleed lightbox-backed masonry that spans edge to edge (its outer columns clip at the section edges), capped with a centered CTA below.",
    domain: "marketing",
    level: "section",
    component: GalleryTabbedDemo,
    code: GALLERY_TABBED_CODE,
    locked: true,
    bleed: true,
  },
  "gallery-section-4": {
    title: "Gallery",
    description:
      "A floating ring of framed previews orbiting a centered lede: the eyebrow, headline, and CTA sit at the heart of the band while the photos scatter around them on an ellipse. The whole ring slowly rotates as the section scrolls through the viewport (a pure-CSS scroll-driven animation, reduced-motion safe), and every frame opens the shared full-screen lightbox.",
    domain: "marketing",
    level: "section",
    component: GalleryRingDemo,
    code: GALLERY_RING_CODE,
    locked: true,
    bleed: true,
  },
  "gallery-section-5": {
    title: "Gallery",
    description:
      "An interactive story wall: a single canvas on the left and numbered chapters on the right, vertically centred as one block. Only one canvas shows at rest, never a stacked pile. Click a chapter and it brightens, reveals its description, and slides its canvas in vertically: the chosen image slides up from below into the front while the one it replaces is nudged up and back so it peeks at the top, then the full front card covers it and it settles to a single image. It opens on the first chapter and is click-driven, so it behaves the same everywhere, and the front card opens the shared full-screen lightbox.",
    domain: "marketing",
    level: "section",
    component: GalleryStoryDemo,
    code: GALLERY_STORY_CODE,
    locked: true,
  },
  "gallery-section-6": {
    title: "Gallery",
    description:
      "An expanding spotlight rail: a row of full-bleed panels where one is open and wide, showing its image and a slid-in caption, while the rest collapse to minimal slivers on either side, each marked with just a sequence number and a + to expand. It opens on a middle panel so the rail reads balanced at rest, and it is click-driven (the standing accordion rule, never hover; no scroll), so it behaves the same everywhere, including inside the fixed-height preview frame. The width change is a real layout animation, flex-grow tweens each panel open or down to minimal rather than transforming, so the slivers genuinely shrink. Every panel is one stable button, so the tween stays smooth; click a sliver to bring it forward, and click the open panel to open it in the shared full-screen lightbox.",
    domain: "marketing",
    level: "section",
    component: GalleryExpandDemo,
    code: GALLERY_EXPAND_CODE,
    locked: true,
    bleed: true,
  },
  "hero-section-1": {
    title: "Hero",
    description:
      "A centered marketing hero: an announcement eyebrow, a balanced headline and subtitle, a CTA row, a feature checklist, and integrated social proof.",
    domain: "marketing",
    level: "section",
    component: HeroDemo,
    code: HERO_CODE,
    locked: true,
    // The Hero is its own full-bleed band and owns its vertical rhythm, so composers skip the
    // page band's padding (single owner; no double-padding).
    ownsPadding: true,
  },
  navbar: {
    title: "Navbar",
    description:
      "A composable top navigation bar for marketing, product, and ecommerce shells. A spacer pushes groups apart, and a hamburger menu takes over below the md breakpoint.",
    domain: "marketing",
    level: "section",
    component: NavbarDemo,
    code: NAVBAR_CODE,
    locked: true,
    // The Navbar is its own band: NavbarInner centers and pads itself (max-w-8xl + px-6), so
    // composers skip the SectionContainer gutter to avoid double-padding it.
    ownsPadding: true,
  },
  "testimonials-section-1": {
    title: "Testimonials",
    description:
      "Minimal social proof: three container-less testimonials with the author byline on top, then a bold headline and supporting body. No logo, no card chrome, just whitespace between the columns.",
    domain: "marketing",
    level: "section",
    component: TestimonialsSection,
    code: TESTIMONIALS_CODE,
    locked: true,
  },
  "testimonials-section-2": {
    title: "Logo-led testimonials",
    description:
      "Logo-led social proof: three container-less testimonials, each with the company logo (a colored symbol beside the name) on top, a bold headline, supporting body, and an author byline. Pairs well directly beneath a hero.",
    domain: "marketing",
    level: "section",
    component: LogoLedTestimonialsSection,
    code: TESTIMONIALS_SECTION_2_CODE,
    locked: true,
  },
  "testimonials-section-3": {
    title: "Spotlight carousel",
    description:
      "A spotlight carousel built on Koala's Carousel: one featured quote per slide, with a large portrait beside the company logo, the quote, and the author byline. It autoplays on a 6s loop and pauses the moment you hover or focus it (and never autoplays under reduced-motion). Circular arrows sit in the gutter outside the card and wrap around the ends, so both stay live on every slide; you can also swipe by drag or use the arrow keys, and the line indicators track position below. Every card stretches to a uniform height so the frame never jumps between quotes.",
    domain: "marketing",
    level: "section",
    component: SpotlightTestimonialsSection,
    code: TESTIMONIALS_SECTION_3_CODE,
    locked: true,
  },
  "hero-section-3": {
    title: "Spotlight hero",
    description:
      "A centered, product-led hero: an announcement eyebrow, a headline whose highlighted keyword rotates through phrases with a per-character stagger inside a wash that hugs each word and recolors per phrase, a CTA pair, a trusted-by logo strip, and a product shot anchored below.",
    domain: "marketing",
    level: "section",
    component: HeroSpotlightDemo,
    code: HERO_SECTION_3_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-8": {
    title: "Product mockup hero",
    description:
      "A centered, product-led hero (Linear / Vercel pattern): an announcement eyebrow, a headline with a highlighted keyword, a subtitle, a CTA pair with a reassurance line, and a framed browser-window mockup anchored below. The mockup gets a concentric-radius card frame with a soft shadow (echoing feature-section-2's video showcase) and a chrome bar with window dots and an address pill, so the product shot reads as a real screenshot and carries the section.",
    domain: "marketing",
    level: "section",
    component: HeroMockupDemo,
    code: HERO_SECTION_8_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-10": {
    title: "iPad device hero",
    description:
      "A centered device hero: the copy column anchored over a full iPad (landscape) render. The device version of the product-mockup hero, but the mockup is a real device, a transparent PNG with the bezel and a soft shadow baked in, so the shot needs no wrapper and floats on the band. Swap the render for your own screenshot.",
    domain: "marketing",
    level: "section",
    component: HeroDeviceLandscapeDemo,
    code: HERO_SECTION_10_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-11": {
    title: "iPhone split hero",
    description:
      "A two-column mobile hero: a left copy column with avatar social proof beside a full iPhone render on the right. The device floats on its baked shadow, with no extra frame, and folds to a stacked column below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: HeroDevicePhoneDemo,
    code: HERO_SECTION_11_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-12": {
    title: "Multi-device hero",
    description:
      "A multi-device hero: a left copy column beside a device duo, an iPad (portrait) with an iPhone overlapping its lower-right corner, so the section shows one product across two form factors. Both renders float on their baked shadows and scale proportionally, and it folds to a stacked column below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: HeroDeviceDuoDemo,
    code: HERO_SECTION_12_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-4": {
    title: "Split hero",
    description:
      "A two-column hero: a left-aligned copy column (eyebrow, headline, subtitle, CTA pair, and avatar social proof) beside a product shot. Folds to a single stacked column below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: HeroSplitDemo,
    code: HERO_SECTION_4_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-9": {
    title: "Full-screen split hero",
    description:
      "A full-viewport split hero: the section fills the screen (100svw x 100svh) and cuts down the middle, a bottom-left-anchored copy column on one half beside a photo that bleeds to the edges on the other (no frame, no gutter, no rounded card), so the two halves read as one full-bleed slab. The eyebrow is the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. Folds to a full-height copy-over-photo column below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: HeroSplitBleedDemo,
    code: HERO_SECTION_9_CODE,
    locked: true,
    // Full-bleed: render edge to edge with no marketing gutter or band padding (the render target
    // drops the SectionContainer + `py`), so the slab really is 100svw. `minHeight` floors the
    // PreviewFrame iframe, and since the slab is `min-h-svh`, its 100svh resolves to that floored
    // iframe height. On a real page that's a true 100svh; in the docs we floor it shorter (44rem) so
    // the preview reads as a full-screen split without towering over the family page.
    bleed: true,
    minHeight: "44rem",
  },
  "hero-section-13": {
    title: "Collage hero",
    description:
      "A centered hero over a photo collage (the interior / lifestyle 'look book' pattern): the classic centered copy stack (a dot+pill Badge eyebrow, a balanced headline, a subtitle, and a text-only CTA pair) anchored above a masonry wall of four room photos. Two tall side images frame a stacked pair in the middle on a fixed-height grid so the block always reads balanced, and it folds to a clean 2x2 below the sm breakpoint. Swap the photos for your own lifestyle or product shots.",
    domain: "marketing",
    level: "section",
    component: HeroCollageDemo,
    code: HERO_SECTION_13_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-14": {
    title: "Photo pair hero",
    description:
      "A centered hero over a two-photo row: the same centered copy stack as the collage hero (a dot+pill Badge eyebrow, a balanced headline, a subtitle, and a text-only CTA pair) anchored above a pair of large room photos, a wider near-square frame beside a taller portrait one on a fixed-height grid so both share one baseline. It stacks the two photos below the sm breakpoint. The quieter, editorial sibling of the four-photo collage: fewer, larger frames that let each room breathe. Swap the photos for your own lifestyle or product shots.",
    domain: "marketing",
    level: "section",
    component: HeroPhotoPairDemo,
    code: HERO_SECTION_14_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-15": {
    title: "Photo marquee hero",
    description:
      "A left-aligned hero over a full-bleed photo marquee: the same dot+pill Badge eyebrow, a balanced headline, a subtitle, and a text-only CTA pair as the collage and photo-pair heroes, but set in the gutter over an edge-to-edge strip of room photos that drifts sideways on a seamless loop. The track is duplicated so it loops with no seam, a soft edge fade melts both ends into the page, it pauses on hover, and it holds still under reduced motion. The copy keeps the site gutter while the strip runs full-bleed. Swap the photos for your own lifestyle or product shots.",
    domain: "marketing",
    level: "section",
    component: HeroMarqueeDemo,
    code: HERO_SECTION_15_CODE,
    locked: true,
    // Full-bleed slab: the marquee runs edge to edge, so it takes the gutter-free band and re-adds
    // the gutter to only the copy column. The Hero brings its own top/bottom rhythm.
    bleed: true,
    ownsPadding: true,
  },
  "hero-section-16": {
    title: "Brand tile hero",
    description:
      "A centered hero whose headline resolves into the Koala mark: the canonical BrandMark tile dropped inline at cap height stands in for the last word, so the finished logo is the punchline. Below it a stacked pair of equal-width CTAs (the brand primary over an outline), a rotating trusted-by logo strip of colored lockups, and a three-photo row of rooms. The playful, brand-forward sibling of the collage and photo-pair heroes: the mark carries the personality, the photos carry the proof. Swap the photos for your own lifestyle or product shots.",
    domain: "marketing",
    level: "section",
    component: HeroBrandTileDemo,
    code: HERO_SECTION_16_CODE,
    locked: true,
    ownsPadding: true,
  },
  "hero-section-6": {
    title: "Video hero",
    description:
      "A full-bleed hero with an ambient video background: an autoplay, muted, looping clip drifts behind a centered copy column, a gradient scrim carries the white headline, subtitle, and CTA, and a glassy announcement pill sits above. The poster holds the frame before the clip loads, and a still image takes over under reduced motion.",
    domain: "marketing",
    level: "section",
    component: HeroVideoDemo,
    code: HERO_SECTION_6_CODE,
    locked: true,
    ownsPadding: true,
    // Floor the iframe at the slab's full height (hero `min-h-[40rem]` + the preview's `py-8`, 2rem
    // top and bottom = 44rem) so it never scrolls while the background video/poster loads.
    minHeight: "44rem",
  },
  "hero-section-7": {
    title: "Image hero",
    description:
      "A full-bleed hero over a single photo (the Giga pattern): a calm landscape fills the band, a scrim carries a centered white headline, subtitle, and CTA, and a monochrome trusted-by row closes it, so the customer logos read as one quiet ink instead of a clash of brand hues.",
    domain: "marketing",
    level: "section",
    component: HeroImageDemo,
    code: HERO_SECTION_7_CODE,
    locked: true,
    ownsPadding: true,
    // Match the hero's fixed `min-h-[40rem]` so the iframe floors at the full height and never
    // scrolls the slab while the background photo loads.
    minHeight: "40rem",
  },
  "feature-section-1": {
    title: "Component showcase",
    description:
      "A masonry wall of real, interactive components dropped straight in, not screenshots: toggle a Switch, drag a Slider, open an Accordion. No tile chrome or labels, just the system in use, with a CTA to the full catalog below.",
    domain: "marketing",
    level: "section",
    component: ComponentShowcaseSection,
    code: FEATURE_SECTION_1_CODE,
    locked: true,
  },
  "feature-section-4": {
    title: "Feature grid",
    description:
      "A balanced three-up grid of features, one per real differentiator. Minimal with no container: a bare brand glyph, a title, and a supporting line, separated by nothing but thin 1px rules between cells, no cards or icon chips. Collapses from three columns to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: FeatureGridSection,
    code: FEATURE_SECTION_4_CODE,
    locked: true,
  },
  "feature-section-6": {
    title: "Stroke columns",
    description:
      "A left-aligned lede over a flush row of capability columns, each hanging from a full-height hairline stroke on its left edge, capped at the top by a thicker brand accent segment. Minimal with no container: the strokes are the only chrome. Steps from one column to five as the frame widens.",
    domain: "marketing",
    level: "section",
    component: FeatureStrokeSection,
    code: FEATURE_SECTION_6_CODE,
    locked: true,
  },
  "stats-section-1": {
    title: "Stats",
    description:
      "The library at a glance: a four-up band of metrics, minimal with no container, separated by nothing but thin hairline rules, with tabular figures that keep the row steady. Collapses to a two-up grid on mobile.",
    domain: "marketing",
    level: "section",
    component: StatsSection,
    code: STATS_SECTION_1_CODE,
    locked: true,
  },
  "stats-section-2": {
    title: "Spotlight",
    description:
      "A split lede with a CTA over a minimal row of metrics: just a top hairline and thin vertical rules, with each column carrying an accent eyebrow, an oversized figure, and a supporting line pinned to the bottom so the captions stay aligned. A footnote with a source link closes it.",
    domain: "marketing",
    level: "section",
    component: StatsSpotlightSection,
    code: STATS_SECTION_2_CODE,
    locked: true,
  },
  "stats-section-3": {
    title: "Trends",
    description:
      "A centered lede over a four-up row of minimal metrics, each stacking a soft circular icon, a tabular figure, a label, and a directional trend chip on whitespace alone. Collapses from four columns to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: StatsTrendsSection,
    code: STATS_SECTION_3_CODE,
    locked: true,
  },
  "stats-section-4": {
    title: "Split",
    description:
      "A left-aligned lede beside a flat two-up grid of oversized figures, with no panel or cards: the numbers read as type and whitespace on the page. Folds to a single column on mobile.",
    domain: "marketing",
    level: "section",
    component: StatsSplitContent,
    code: STATS_SECTION_4_CODE,
    locked: true,
  },
  "stats-section-5": {
    title: "Caption top",
    description:
      "A centered lede over a minimal row that inverts the spotlight: a small supporting line sits on top and the oversized figure is pinned to a shared baseline below. Only a top hairline and thin vertical rules frame it.",
    domain: "marketing",
    level: "section",
    component: StatsCaptionTopSection,
    code: STATS_SECTION_5_CODE,
    locked: true,
  },
  "stats-section-6": {
    title: "Centered",
    description:
      "A centered, pure-type row with no cards or icons: each metric stacks an oversized figure, a bold title, and a supporting line on whitespace alone. Collapses from three columns to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: StatsCenteredSection,
    code: STATS_SECTION_6_CODE,
    locked: true,
  },
  "stats-section-7": {
    title: "Panel",
    description:
      "A centered lede with a CTA pair over an elevated inverse panel: the metrics ride one dark, rounded surface instead of running as bare type. The panel uses the neutral inverse pair (bg-foreground / text-background), so it flips dark-on-light in light themes and light-on-dark in dark ones with no bespoke color, and the tabular figures keep the four-up row steady. Collapses to a two-up grid on mobile.",
    domain: "marketing",
    level: "section",
    component: StatsPanelSection,
    code: STATS_SECTION_7_CODE,
    locked: true,
  },
  "stats-section-8": {
    title: "Media split",
    description:
      "A two-column split that pairs the numbers with imagery: a left-aligned lede and CTA pair sit over a supporting photo (with the DS image outline) and its caption, beside a vertical list of narrated metrics on the right, each figure carrying a full supporting line rather than a bare label. The tabular figures keep the column steady, and it folds to a single stacked column on mobile.",
    domain: "marketing",
    level: "section",
    component: StatsMediaContent,
    code: STATS_SECTION_8_CODE,
    locked: true,
  },
  "stats-section-9": {
    title: "Stepped",
    description:
      "A left-aligned lede over a staircase of three metric cards: their bottoms align while each keeps its own height, so the tops step up the row. The oversized figure pins to the top of each card and the label with its supporting line drops to the bottom, so the numbers land at stepped heights while the copy settles on a shared lower band. Three tone treatments carry the emphasis: a subtle muted card, the theme-flipping inverse panel (bg-foreground / text-background) as the taller hero, and the brand-accent card. Below the widest breakpoint the min-heights release and the cards stack.",
    domain: "marketing",
    level: "section",
    component: StatsSteppedSection,
    code: STATS_SECTION_9_CODE,
    locked: true,
  },
  "stats-section-10": {
    title: "Mixed",
    description:
      "A Ramp-style mixed band: oversized headline figures and logo-led testimonials share one aligned three-column grid, so the proof reads as numbers and voices together. The top row is three soft stat cards, each with an 'Up to' kicker, an oversized tabular figure pinned to a shared baseline, and a supporting caption; the bottom row drops three container-less testimonials into the same columns, each led by a framed brand-mark tile and the company name, then the quote and an author byline pinned above a hairline. The whole band folds to a single column on mobile.",
    domain: "marketing",
    level: "section",
    component: StatsMixedSection,
    code: STATS_SECTION_10_CODE,
    locked: true,
  },
  "pricing-section-1": {
    title: "Pricing",
    description:
      "A three-tier pricing table with a highlighted plan: tabular prices, a feature checklist of included and excluded items, and a bottom-pinned CTA on each card. The featured tier carries a brand ring.",
    domain: "marketing",
    level: "section",
    component: PricingSection,
    code: PRICING_SECTION_1_CODE,
    locked: true,
  },
  "faq-section-1": {
    title: "FAQ",
    description:
      "A single-open, separated accordion of the product's common questions. Only one panel is open at a time, and the section caps its width so the questions stay easy to scan.",
    domain: "marketing",
    level: "section",
    component: FaqSection,
    code: FAQ_SECTION_1_CODE,
    locked: true,
  },
  "faq-section-2": {
    title: "FAQ",
    description:
      "The sectioned / help-center FAQ: the same questions split into topic groups (Getting started, The product, Plans and billing), each a borderless minimal list with single-expand scoped per topic.",
    domain: "marketing",
    level: "section",
    component: FaqGroupedSection,
    code: FAQ_SECTION_2_CODE,
    locked: true,
  },
  "changelog-section-1": {
    title: "Changelog",
    description:
      "The recent release log as a simple timeline of version cards: a pill version, a tabular date, and a short note per entry, with a CTA to the full docs below.",
    domain: "marketing",
    level: "section",
    component: ChangelogSection,
    code: CHANGELOG_SECTION_1_CODE,
    locked: true,
  },
  "changelog-section-2": {
    title: "Changelog",
    description:
      "The release log as a vertical timeline (the Vercel / Stripe pattern): the canonical ActivityFeed threads every version on one continuous rail, each with a tinted glyph marker, a version + category + date header, and a short note. The rail is pure layout, and it closes cleanly under the final entry.",
    domain: "marketing",
    level: "section",
    component: ChangelogTimelineSection,
    code: CHANGELOG_SECTION_2_CODE,
    locked: true,
  },
  "changelog-section-3": {
    title: "Changelog",
    description:
      "The release log as a row of media cards (the Linear pattern): each version gets a cover with a soft, category-tinted glyph tile and a floating tag, then a tabular date and version, the title, and a short note. Cards lift on hover. Folds from four columns to two to one.",
    domain: "marketing",
    level: "section",
    component: ChangelogMediaSection,
    code: CHANGELOG_SECTION_3_CODE,
    locked: true,
  },
  "changelog-section-4": {
    title: "Changelog",
    description:
      "The editorial two-column log (the Notion / Plain pattern): the lede sits in a sticky left rail beside a hairline-divided list of dated entries. Minimal, no cards, all typography. Stacks to one column below lg.",
    domain: "marketing",
    level: "section",
    component: ChangelogEditorialSection,
    code: CHANGELOG_SECTION_4_CODE,
    locked: true,
  },
  "changelog-section-5": {
    title: "Changelog",
    description:
      "Release notes as a bare single-column list (the Basecamp / Attio pattern): each entry leads with its date on an outline pill, then a bold title and a short note, split by hairline dividers. No cards, no version chips, all typography, in a narrow centered column.",
    domain: "marketing",
    level: "section",
    component: ChangelogNotesSection,
    code: CHANGELOG_SECTION_5_CODE,
    locked: true,
  },
  "blog-section-1": {
    title: "Blog",
    description:
      "An editorial blog index: a centered lede, a single-select category filter, one featured lead story, and a responsive grid of article cards (cover, category tint, title, excerpt, and an author + tabular date meta row).",
    domain: "marketing",
    level: "section",
    component: BlogSection,
    code: BLOG_SECTION_1_CODE,
    locked: true,
  },
  "blog-section-2": {
    title: "Blog",
    description:
      "A minimal, text-first editorial list: no covers, just title-led rows split by hairlines, each with a category tint, an excerpt, an author byline, a tabular date, and a trailing arrow that slides in on hover. Drops under a hero or on an about page.",
    domain: "marketing",
    level: "section",
    component: BlogEditorialSection,
    code: BLOG_SECTION_2_CODE,
    locked: true,
  },
  "blog-section-3": {
    title: "Blog",
    description:
      "A homepage blog module: one large lead story beside a compact 'Latest' rail of thumbnail rows. The rail stacks under the lead on mobile.",
    domain: "marketing",
    level: "section",
    component: BlogSidebarSection,
    code: BLOG_SECTION_3_CODE,
    locked: true,
  },
  "blog-section-4": {
    title: "Blog",
    description:
      "An image-led magazine grid: each card is a cover photo with a dark scrim and the title + byline laid over it, plus a category-colored dot chip. The same single-select category filter narrows the grid.",
    domain: "marketing",
    level: "section",
    component: BlogOverlaySection,
    code: BLOG_SECTION_4_CODE,
    locked: true,
  },
  "blog-section-5": {
    title: "Blog",
    description:
      "A minimal, date-led archive list: no covers, no filter, no bylines. Each post leads with its date on an outline pill, then a bold title (with an underline that fades in on hover) and a one-line excerpt, split by hairline dividers. A narrow centered column, ideal as a 'latest writing' block under a hero.",
    domain: "marketing",
    level: "section",
    component: BlogNotesSection,
    code: BLOG_SECTION_5_CODE,
    locked: true,
  },
  "blog-post-1": {
    title: "Centered classic",
    description:
      "A full blog post page: navbar, a centered header (category, title, deck, author byline), a wide cover, a long-form reading column with headings, a pull-quote, a list and an inline figure, then tags, a share row, an author bio, a newsletter card, and a 'Keep reading' grid of related posts above the footer.",
    domain: "marketing",
    level: "page",
    component: BlogPostContent,
    code: BLOG_POST_PAGE_CODE,
    locked: true,
    ownsPadding: true,
    minHeight: "45rem",
  },
  "blog-post-2": {
    title: "With table of contents",
    description:
      "The same article with a sticky table-of-contents rail: a scroll-spy nav and share cluster sit beside the reading column and highlight the section in view. The rail drops away below the large breakpoint so the article reads full-width on mobile.",
    domain: "marketing",
    level: "page",
    component: BlogPostSidebarContent,
    code: BLOG_POST_SIDEBAR_PAGE_CODE,
    locked: true,
    ownsPadding: true,
    minHeight: "45rem",
  },
  "blog-post-3": {
    title: "Image-led hero",
    description:
      "An editorial variant led by a full-bleed cover: the title, category chip, and author byline ride over a bottom-weighted scrim on the photo, then the article opens into a centered reading column. Same body, tags, author, newsletter, and related-posts grid.",
    domain: "marketing",
    level: "page",
    component: BlogPostHeroContent,
    code: BLOG_POST_HERO_PAGE_CODE,
    locked: true,
    ownsPadding: true,
    minHeight: "45rem",
  },
  "cta-section-1": {
    title: "Install",
    description:
      "The CLI and source-ownership story: a left-aligned lede and benefit checklist beside two stacked code snippets (the install command and a usage example). Stacks to one column on mobile.",
    domain: "marketing",
    level: "section",
    component: InstallCliContent,
    code: CTA_SECTION_1_CODE,
    locked: true,
  },
  "cta-section-2": {
    title: "Closing CTA",
    description:
      "A brand-lit closing panel that funnels to pricing and the docs: a centered lede over a primary and a secondary action, with a token-driven brand glow that tracks the active accent.",
    domain: "marketing",
    level: "section",
    component: CtaBandContent,
    code: CTA_SECTION_2_CODE,
    locked: true,
  },
  "cta-section-3": {
    title: "Lead capture",
    description:
      "The inline sign-up CTA (the Circle / Ramp pattern): a centered lede over an email field and a detached submit button, with a reassurance row of checks below. The button sits beside the field, never crammed inside it, and the row flips to an inline confirmation on submit. Field and button stack full-width on mobile and return to a row from sm up.",
    domain: "marketing",
    level: "section",
    component: CtaEmailCaptureContent,
    code: CTA_SECTION_3_CODE,
    locked: true,
  },
  "cta-section-4": {
    title: "Brand band",
    description:
      "The bold split band (the Intercom / Webflow pattern): a saturated brand panel with the headline on the left and the action pair on the right, laid out by SectionHeader's split orientation. The fill is the accent token so the whole band recolors per theme, and the primary CTA inverts to a white chip with a brand-colored label. Stacks below lg.",
    domain: "marketing",
    level: "section",
    component: CtaBrandBandContent,
    code: CTA_SECTION_4_CODE,
    locked: true,
  },
  "cta-section-5": {
    title: "Product shot",
    description:
      "The device-led closing CTA (the Aboard / VanMoof pattern): an elevated card with the lede and action pair on the left and a finished device duo on the right (an iPad portrait with an iPhone overlapping its corner). Two columns from lg, stacked below, with the device staying contained inside the card.",
    domain: "marketing",
    level: "section",
    component: CtaDeviceContent,
    code: CTA_SECTION_5_CODE,
    locked: true,
  },
  "cta-section-6": {
    title: "Spotlight",
    description:
      "The dramatic spotlight (the Superpower / Superhuman pattern): a deep inverse band with a single focused message caught in a soft cone of light from above. The surface is the theme-flipping inverse pair, and the spotlight is a crisp radial gradient of a low-alpha white, not a colored blur, so it lights the copy without tinting the band. The lede cascades in with a focus-pull as it scrolls into view.",
    domain: "marketing",
    level: "section",
    component: CtaSpotlightContent,
    code: CTA_SECTION_6_CODE,
    locked: true,
  },
  "cta-section-7": {
    title: "Statement",
    description:
      "The oversized statement (the Better Stack / Linear closing line): no panel and no glow, just a display-scale headline sitting bare on the band with a subtitle, a text-only action pair, and a quiet trust line below. The lede's own scale carries the section, so it reads as the confident, typographic period at the end of a landing page.",
    domain: "marketing",
    level: "section",
    component: CtaStatementContent,
    code: CTA_SECTION_7_CODE,
    locked: true,
  },
  "cta-section-8": {
    title: "Contact + FAQ",
    description:
      "The contact + FAQ 'load more' closer (the help-center pattern): a centered lede over a three-channel contact strip, then the shared FAQ list laid out as an icon-led features grid. The grid is clipped to about two rows with a fade-to-band overlay rising over the cut and a 'See all questions' button floating on it; clicking reveals the rest in place. Folds from three columns to two to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: CtaContactFaqContent,
    code: CTA_SECTION_8_CODE,
    locked: true,
  },
  "contact-section-1": {
    title: "Split lead capture",
    description:
      "A split lead-capture hero: a left copy column (announcement eyebrow, headline, subtitle, CTA pair) on the band, a full-bleed interior photo spanning the whole width along the bottom, and a LeadForm card floating over the seam so it bridges the copy band and the photo. The copy and card stay in the site gutter while the photo runs edge to edge. Folds to a single stacked column (copy → card → photo) below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: ContactSplitContent,
    code: CONTACT_SECTION_1_CODE,
    locked: true,
    // Full-bleed slab: the photo runs edge to edge, so it takes the gutter-free band and re-adds the
    // gutter to only the copy + card itself.
    bleed: true,
  },
  "contact-section-2": {
    title: "Split with form",
    description:
      "The split contact layout (the Complex Law / Maxima Therapy pattern, the most common contact section): a left copy column (eyebrow, heading, subtitle, a channel list of email / call / visit, and an office-hours line) beside the ContactForm composed as a card. Two columns from lg, stacked below, with items-start so the taller form never stretches the copy. Icon tiles use the feature treatment (transparent fill, hairline stroke, muted glyph); actionable channel values are Link components (black, brand on hover) wired to mailto / tel.",
    domain: "marketing",
    level: "section",
    component: ContactSplitFormContent,
    code: CONTACT_SECTION_2_CODE,
    locked: true,
  },
  "contact-section-3": {
    title: "Centered form",
    description:
      "The centered contact (the Rox / Wise pattern): a centered lede over a slim trust row (email, live chat, response time) and a single centered ContactForm card. The leanest, most drop-in contact section; the card keeps a short functional heading and left-aligns its own fields inside the centered column.",
    domain: "marketing",
    level: "section",
    component: ContactCenteredContent,
    code: CONTACT_SECTION_3_CODE,
    locked: true,
  },
  "contact-section-4": {
    title: "Department directory",
    description:
      "The department directory (the Fiasco / In Common With pattern): a centered lede over a grid of routing cards, one per team (Sales, Support, Partnerships, Press, Careers, and a catch-all), each a whole-card mailto link built on the canonical Card. The card's only hover feedback is a trailing arrow that fades and slides up-right into place, no shadow or color shift; a quiet address and hours line closes the section. Folds from three columns to two to one as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: ContactDirectoryContent,
    code: CONTACT_SECTION_4_CODE,
    locked: true,
  },
  "social-proof-section-1": {
    title: "Logo cloud",
    description:
      "The classic trusted-by strip: a centered lede over a wrapping row of customer logos, each a colored symbol beside the company name. The wall quietly rotates through the set, and the row reflows from one line to several as the frame narrows.",
    domain: "marketing",
    level: "section",
    component: LogoCloudSection,
    code: SOCIAL_PROOF_SECTION_1_CODE,
    locked: true,
  },
  "social-proof-section-2": {
    title: "Logo marquee",
    description:
      "A minimal caption over an infinite, edge-masked logo strip that drifts on the shared marquee token. The set is rendered twice so the loop returns with no seam, it pauses on hover, and it stops entirely under prefers-reduced-motion.",
    domain: "marketing",
    level: "section",
    component: LogoMarqueeContent,
    code: SOCIAL_PROOF_SECTION_2_CODE,
    locked: true,
  },
  "social-proof-section-3": {
    title: "Bordered grid",
    description:
      "Logos seated in a concentric rounded frame, each in its own cell. The hairline gridlines are the frame's background showing through a one-pixel gap, so the rules stay crisp as the grid collapses from four columns to two.",
    domain: "marketing",
    level: "section",
    component: LogoGridSection,
    code: SOCIAL_PROOF_SECTION_3_CODE,
    locked: true,
  },
  "social-proof-section-4": {
    title: "Split with count",
    description:
      "An editorial split: a left-aligned lede with the headline count in tabular figures, beside a borderless two-up grid of logos as the visual. Folds to a single stacked column below the lg breakpoint.",
    domain: "marketing",
    level: "section",
    component: LogoSplitContent,
    code: SOCIAL_PROOF_SECTION_4_CODE,
    locked: true,
  },
  "social-proof-section-5": {
    title: "Bento with case study",
    description:
      "An asymmetric bento mixing text, logos, and image: a lede with a report link and a featured customer card (a headline stat over an image placeholder) book-end the rotating logo wall. Everything stacks to one column on a phone.",
    domain: "marketing",
    level: "section",
    component: LogoBentoContent,
    code: SOCIAL_PROOF_SECTION_5_CODE,
    locked: true,
  },

  // ── Authentication ── the first application-domain, page-level family. Each is a full auth
  // SCREEN: the shipped LoginForm / SignUpForm / ProviderForm blocks composed into a page. They
  // are `min-h-svh`, so `bleed` renders them raw (no gutter) and `minHeight` floors the iframe;
  // the slab's 100svh then resolves to that floored height (see memory `full-viewport-section-in-preview`).
  "auth-login-split": {
    title: "Sign in · split",
    description:
      "A full-screen sign-in split: a bare LoginForm under the Koala brand lockup on one half, a full-bleed photo with a testimonial scrim on the other. Below the lg breakpoint the media pane drops and the form fills the screen.",
    domain: "application",
    level: "page",
    component: AuthLoginSplitSection,
    code: AUTH_LOGIN_SPLIT_CODE,
    locked: true,
    bleed: true,
    minHeight: "44rem",
  },
  "auth-login-centered": {
    title: "Sign in · centered",
    description:
      "The classic single-column login page: the default bordered LoginForm card centered on a soft, flat backdrop under the brand lockup, with the social provider row, email + password core, remember-me, and forgot-password link.",
    domain: "application",
    level: "page",
    component: AuthLoginCenteredSection,
    code: AUTH_LOGIN_CENTERED_CODE,
    locked: true,
    bleed: true,
    minHeight: "44rem",
  },
  "auth-signup-split": {
    title: "Sign up · split",
    description:
      "A full-screen sign-up split with the branded photo panel on the left and the SignUpForm on the right: a name field, a live password-strength meter, and a terms gate. The columns hold an even 50/50 and fold to a single stacked column below the lg breakpoint.",
    domain: "application",
    level: "page",
    component: AuthSignUpSplitSection,
    code: AUTH_SIGNUP_SPLIT_CODE,
    locked: true,
    bleed: true,
    minHeight: "46rem",
  },
  "auth-signup-centered": {
    title: "Sign up · centered",
    description:
      "The centered sign-up page: a SOC 2 trust Badge above the default SignUpForm card on a soft, flat backdrop, with the password-strength meter and the terms-gated submit.",
    domain: "application",
    level: "page",
    component: AuthSignUpCenteredSection,
    code: AUTH_SIGNUP_CENTERED_CODE,
    locked: true,
    bleed: true,
    minHeight: "46rem",
  },
  "auth-provider-stack": {
    title: "Provider stack · magic link",
    description:
      "The password-less, provider-first screen: a stack of full-width 'Continue with…' buttons over a magic-link email field, centered on a flat backdrop. The OAuth-plus-magic-link pattern (Reflect, Copy.ai).",
    domain: "application",
    level: "page",
    component: AuthProviderStackSection,
    code: AUTH_PROVIDER_STACK_CODE,
    locked: true,
    bleed: true,
    minHeight: "44rem",
  },
  "auth-community": {
    title: "Community sign-in · centered",
    description:
      "The OAuth-only community screen used by game servers and Discord-native products: a Discord app tile over a single dominant 'Sign in with Discord' button gated behind a consent checkbox, closed by a social link rail. Real brand logos throughout.",
    domain: "application",
    level: "page",
    component: AuthCommunitySection,
    code: AUTH_COMMUNITY_CODE,
    locked: true,
    bleed: true,
    minHeight: "44rem",
  },
  "auth-community-split": {
    title: "Community sign-in · split",
    description:
      "The same gated Discord block gone bare in a SplitLayout pane, with a photo collage on the other half. Folds to a single column below the lg breakpoint.",
    domain: "application",
    level: "page",
    component: AuthCommunitySplitSection,
    code: AUTH_COMMUNITY_SPLIT_CODE,
    locked: true,
    bleed: true,
    minHeight: "44rem",
  },

  // ── Checkout ── the second application-domain, page-level family. A full billing SCREEN: the
  // shipped OrderSummary + Field/Input + RadioCard + CountrySelect + InputGroup composed into a
  // two-pane SplitLayout (form left, summary right). `min-h-svh`, so `bleed` renders it raw and
  // `minHeight` floors the iframe (see memory `full-viewport-section-in-preview`).
  "checkout-billing-split": {
    title: "Billing · split",
    description:
      "A full-screen checkout: the billing form (billing type, name, email, a segmented address block, and card fields) on the left, the order Summary (plan, discount code, and the totals read-out) on the right. The two panes divide at lg and stack into one column below it, so the summary stays visible on mobile.",
    domain: "application",
    level: "page",
    component: CheckoutBillingSplitSection,
    code: CHECKOUT_BILLING_SPLIT_CODE,
    locked: true,
    bleed: true,
    minHeight: "52rem",
  },
  "checkout-cart": {
    title: "Cart · split",
    description:
      "An ecommerce one-page checkout: the contact, shipping, delivery-method, and payment form on the left, the cart itself, real line items with product thumbnails and quantity, as the order Summary on the right. A discount-code field and the totals close the summary; the panes stack into one column below lg.",
    domain: "application",
    level: "page",
    component: CheckoutCartSplitSection,
    code: CHECKOUT_CART_SPLIT_CODE,
    locked: true,
    bleed: true,
    minHeight: "56rem",
  },
}
