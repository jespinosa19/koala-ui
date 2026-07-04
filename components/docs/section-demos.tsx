"use client"

import * as React from "react"
import type { Icon } from "@phosphor-icons/react"
import Link from "next/link"
import {
  Atom,
  PersonArmsSpread,
  Swatches,
  Rows,
  Code,
  FileTs,
  Check,
  ArrowRight,
  ArrowUpRight,
  UsersThree,
  Cube,
  RocketLaunch,
  Timer,
  CaretLeft,
  CaretRight,
  EnvelopeSimple,
  Package,
  Key,
  Sparkle,
  Palette,
  ArrowsClockwise,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  ChatCircle,
  Lifebuoy,
  Handshake,
  Newspaper,
  Briefcase,
  Tag,
  ChartBar,
  ListChecks,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  PLACEHOLDER_BRANDS,
  PLACEHOLDER_BRANDS_VARIED,
  PlaceholderLogo,
  RotatingPlaceholderLogo,
  useLogoSwap,
  LOGO_ROTATE_SLOTS,
  type PlaceholderBrand,
} from "@/components/docs/placeholder-logos"

import {
  VideoPlayer,
  Video,
  VideoControls,
  VideoBar,
  VideoPlayButton,
  VideoSeek,
  VideoTime,
  VideoVolume,
  VideoFullscreen,
  VideoSpinner,
} from "@/components/ui/video-player"
import {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselIndicators,
} from "@/components/ui/carousel"
import {
  Testimonial,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
  TestimonialLogo,
} from "@/components/ui/testimonials"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Stat,
  StatLabel,
  StatValue,
  StatCaption,
  StatIcon,
  StatTrend,
} from "@/components/ui/stat"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Faqs, FaqsGroup, FaqsItem } from "@/components/ui/faqs"
import {
  ActivityFeed,
  ActivityItem,
  ActivityMarker,
  ActivityIcon,
  ActivityContent,
  ActivityHeader,
  ActivityBody,
  ActivityTime,
} from "@/components/ui/activity-feed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Link as UiLink } from "@/components/ui/link"
import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import { LeadForm, ContactForm } from "@/components/ui/contact-form"
import {
  Hero,
  HeroColumn,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
} from "@/components/ui/hero"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { CodeSnippet } from "@/components/docs/code-snippet"
import {
  FEATURES,
  type Feature,
  HERO_TESTIMONIALS,
  METRICS,
  FAQ,
  FAQ_TOPICS,
  CHANGELOG,
  type ChangelogCategory,
} from "@/components/landing/data"

/**
 * Client demos for the marketing **section** slabs (the organism tier; see memory `site-ia-tiers`).
 * These are the isolated, copy-pasteable compositions the docs sections render: a clean demo per
 * section, NOT the landing component itself (which carries the full-bleed `Section` band + the
 * scroll-in `Reveal`). Where a section leads with a centered lede, the matching `SectionHeader` is
 * composed in `sections-registry.tsx` and each export here is the content that sits below it; the
 * two side-by-side sections (Install, CTA panel) embed their own lede. Content is shared with the
 * landing via `components/landing/data` (pure data, no JSX) so the catalog stays in lockstep with
 * the home page. Kept in one "use client" module so the server registry can compose the
 * interactive parts (Radix/stateful) without becoming a client module itself.
 */

// ── feature-section-2 ──────────────────────────────────────────────────────────────────────────
// Openly-hosted sample clip (W3C's canonical HTML5 media host, has audio so the volume control is
// meaningful) so the preview plays with no bundled project assets. The old Google
// `gtv-videos-bucket` sample now 403s.
const VIDEO_SRC = "https://media.w3.org/2010/05/sintel/trailer.mp4"
const VIDEO_POSTER = "https://media.w3.org/2010/05/sintel/poster.png"

/**
 * feature-section-2 — the framed product video below the "See it in motion" lede. A concentric
 * radius (rounded-2xl frame over the player's rounded-xl surface) lifts the player off the band;
 * controls stay hidden until hover (`revealOn="hover"`) for the cinematic feel. Autoplay is
 * browser-gated on muted playback, so it starts muted and loops.
 */
export function VideoShowcaseFrame() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-xl">
        <VideoPlayer className="rounded-xl" revealOn="hover">
          <Video src={VIDEO_SRC} poster={VIDEO_POSTER} autoPlay loop muted preload="auto" />
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
      </div>
    </div>
  )
}

// ── testimonials-section-2 ─────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

/**
 * testimonials-section-2 — logo-led social proof: three container-less testimonials (`bare`), each
 * with the colored company logo on top, a bold headline, supporting body, and an author byline.
 * Pairs well directly beneath a hero.
 */
export function LogoLedTestimonialsContent() {
  return (
    <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
      {HERO_TESTIMONIALS.map((t) => (
        <Testimonial key={t.name} variant="bare" className="gap-3">
          {/* Colored logo on top: reset the footer's trailing-edge defaults to lead the card. */}
          <TestimonialLogo className="ml-0">
            <PlaceholderLogo
              brand={PLACEHOLDER_BRANDS.find((b) => b.name === t.brand) ?? PLACEHOLDER_BRANDS[0]}
              variant="lockup"
            />
          </TestimonialLogo>
          <TestimonialQuote className="font-semibold text-foreground">{t.headline}</TestimonialQuote>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{t.body}</p>
          <TestimonialFooter className="mt-4">
            <AvatarRoot size="md">
              <AvatarImage src={`https://i.pravatar.cc/160?img=${t.img}`} alt={t.name} />
              <AvatarFallback>{initials(t.name)}</AvatarFallback>
            </AvatarRoot>
            <TestimonialAuthor>
              <TestimonialName>{t.name}</TestimonialName>
              <TestimonialTitle>{t.title}</TestimonialTitle>
            </TestimonialAuthor>
          </TestimonialFooter>
        </Testimonial>
      ))}
    </div>
  )
}

/**
 * testimonials-section-1 — minimal social proof: the same three container-less testimonials (`bare`)
 * as the logo-led variant, but stripped to the essentials. No company logo; the author byline leads
 * each card, then the bold headline and supporting body sit below it. The leanest, most flush-on-page
 * treatment, made for sitting directly on a band with nothing but whitespace separating the columns.
 */
export function MinimalTestimonialsContent() {
  return (
    <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
      {HERO_TESTIMONIALS.map((t) => (
        <Testimonial key={t.name} variant="bare" className="gap-4">
          {/* Author on top: clear the footer's mt-auto so the byline leads instead of trailing. */}
          <TestimonialFooter className="mt-0">
            <AvatarRoot size="md">
              <AvatarImage src={`https://i.pravatar.cc/160?img=${t.img}`} alt={t.name} />
              <AvatarFallback>{initials(t.name)}</AvatarFallback>
            </AvatarRoot>
            <TestimonialAuthor>
              <TestimonialName>{t.name}</TestimonialName>
              <TestimonialTitle>{t.title}</TestimonialTitle>
            </TestimonialAuthor>
          </TestimonialFooter>
          <div className="flex flex-col gap-2">
            <TestimonialQuote className="font-semibold text-foreground">{t.headline}</TestimonialQuote>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{t.body}</p>
          </div>
        </Testimonial>
      ))}
    </div>
  )
}

// testimonials-section-3 advances every 6s; long enough to read a spotlight quote before it moves.
const SPOTLIGHT_AUTOPLAY_MS = 6000

/**
 * Autoplay for the spotlight carousel: advances one slide every `delay`, wrapping at the end, and
 * pausing whenever `paused` (hover / keyboard focus). Never starts under `prefers-reduced-motion`,
 * modeled on `useLogoSwap`. It owns a plain index the `Carousel` consumes in controlled mode, so
 * drag, arrow keys, and the indicators all drive the same source of truth.
 */
function useSpotlightAutoplay(count: number, delay: number) {
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

/**
 * A flanking circular nav arrow that sits in the gutter OUTSIDE the card (never over the quote) and
 * wraps around the ends, so both stay live on every slide. It reveals on hover of the carousel (the
 * root carries `group`) and on keyboard focus, so at rest the card stands alone; hidden on mobile,
 * where swipe and the indicators lead. Press-scale, focus ring, cursor, and the 40px hit target all
 * come from Button.
 */
function SpotlightArrow({ side, onClick }: { side: "prev" | "next"; onClick: () => void }) {
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
        // Reveal on hover/focus only (specific transition on opacity, never `all`).
        "opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 focus-visible:opacity-100",
        // right-full / left-full park the button just past the card edge; the margin keeps a small gap.
        isPrev ? "right-full mr-3" : "left-full ml-3",
      )}
    >
      {isPrev ? <CaretLeft weight="bold" /> : <CaretRight weight="bold" />}
    </Button>
  )
}

// A staggered "assemble" that replays each time a slide becomes active (autoplay, arrows, dots, or a
// drag-release). It's the canonical `animate-stagger-in-blur` keyframe (rise + defocus + fade) gated
// on the slide's `data-active`: applying the animation only while active means it re-runs every time
// data-active flips true, with no remount. Crucially the RESTING state is the plain, fully-visible
// element (no opacity-0 base), so inactive/peeking slides show their content while you DRAG them in;
// only the moment of activation animates. `motion-safe:` keeps it off under reduced motion (the token
// carries `both` fill, so each part holds hidden through its own delay and never flashes early).
const SLIDE_ENTER = "motion-safe:group-data-[active=true]/slide:animate-stagger-in-blur"

/**
 * testimonials-section-3 — a spotlight carousel built on our `Carousel`: one featured quote per
 * slide, a large portrait beside the company logo, the quote, and the author byline. It autoplays
 * (6s, looping) and pauses on hover or focus; the flanking arrows sit outside the card and wrap
 * around the ends, and the line indicators track position below. When a slide becomes active its
 * portrait, logo, quote, and byline cascade in (`SLIDE_ENTER`, ~70ms apart). Every card stretches to
 * a uniform height (`h-full`) so the frame never jumps as quotes change length.
 */
export function SpotlightTestimonialsContent() {
  const count = HERO_TESTIMONIALS.length
  const { index, setIndex, setPaused } = useSpotlightAutoplay(count, SPOTLIGHT_AUTOPLAY_MS)

  return (
    // Pause autoplay while the viewer is engaged: hover covers pointers, focus-within covers keyboards.
    <div
      className="mx-auto w-full max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Carousel
        index={index}
        onIndexChange={setIndex}
        label="Customer testimonials"
        className="sm:px-16"
      >
        {/* Wrap just the viewport so the flanking arrows center on the CARD, not the dots below it. */}
        <div className="relative">
          <CarouselContent>
            {HERO_TESTIMONIALS.map((t, i) => (
              // group/slide + data-active gate the stagger below; the group is NAMED so it doesn't
              // collide with the Carousel root's own unnamed `group` (which reveals the arrows).
              <CarouselSlide
                key={t.name}
                className="group/slide px-1"
                data-active={i === index ? "true" : undefined}
              >
                <Testimonial
                  variant="soft"
                  // Recompose the vertical card into a portrait-beside-copy spotlight. The parts still
                  // read the recipe from context, so the grid is just connective tissue over the slots.
                  className="grid h-full items-center gap-6 rounded-2xl p-6 sm:gap-8 sm:p-8 md:grid-cols-[auto_1fr] md:p-10"
                >
                  {/* Concentric: a rounded-xl portrait inside the rounded-2xl card; 1px image-outline (#11).
                      animationDelay staggers each part ~70ms behind the last (a longhand beats the
                      `animate-*` shorthand's implicit 0 delay, the same trick our Stagger uses). */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.pravatar.cc/480?img=${t.img}`}
                    alt={t.name}
                    // The portrait is the main drag surface; without this the browser's native
                    // image-drag fires first and cancels the carousel's pointer gesture, so a
                    // mouse-drag started on the photo never advances the slide.
                    draggable={false}
                    className={cn(
                      "size-28 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-black/10 sm:size-36 md:size-44 dark:ring-white/10",
                      SLIDE_ENTER,
                    )}
                  />
                  <div className="flex flex-col gap-5">
                    <TestimonialLogo className={cn("ml-0", SLIDE_ENTER)} style={{ animationDelay: "70ms" }}>
                      <PlaceholderLogo
                        brand={PLACEHOLDER_BRANDS.find((b) => b.name === t.brand) ?? PLACEHOLDER_BRANDS[0]}
                        variant="lockup"
                      />
                    </TestimonialLogo>
                    <TestimonialQuote
                      className={cn("text-lg leading-snug text-foreground sm:text-xl", SLIDE_ENTER)}
                      style={{ animationDelay: "140ms" }}
                    >
                      {t.body}
                    </TestimonialQuote>
                    <TestimonialFooter
                      className={cn("mt-0", SLIDE_ENTER)}
                      style={{ animationDelay: "210ms" }}
                    >
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
          <SpotlightArrow side="prev" onClick={() => setIndex((i) => (i - 1 + count) % count)} />
          <SpotlightArrow side="next" onClick={() => setIndex((i) => (i + 1) % count)} />
        </div>
        <CarouselIndicators variant="lines" className="mt-6" />
      </Carousel>
    </div>
  )
}

// ── feature-section-4 ──────────────────────────────────────────────────────────────────────────
const FEATURE_ICONS: Record<Feature["icon"], Icon> = {
  react: Atom,
  accessibility: PersonArmsSpread,
  themes: Swatches,
  density: Rows,
  source: Code,
  typescript: FileTs,
}

/**
 * feature-section-4 — one differentiator per cell, a balanced three-up feature grid. Minimal: no
 * card chrome and no filled icon chip, just a bare icon, title, and supporting line. A ruled grid
 * (the `bg-border` parent showing through a `gap-px`) separates the cells with nothing but thin 1px
 * rules on both axes; each cell fills with `bg-background` so only the rules read. The lone brand
 * accent is the small leading glyph.
 */
export function FeatureGridContent() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => {
        const Icon = FEATURE_ICONS[feature.icon]
        return (
          <div key={feature.title} className="flex flex-col gap-3 bg-background p-8">
            <Icon weight="bold" className="size-5 text-brand" />
            <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {feature.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── feature-section-5 ──────────────────────────────────────────────────────────────────────────
// Cover photos for the ecosystem tiles. Plain remote `<img>` (config-free, like the Gallery), sized
// for a wide tile so the crop stays sharp on retina. IDs are the verified Unsplash set reused across
// the catalog.
const ecosystemImg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

interface EcosystemTile {
  /** The category kicker pinned to the top-left of the tile. */
  eyebrow: string
  /** The surface name, set in the heading face at the foot. */
  title: string
  /** One supporting line under the title. */
  description: string
  href: string
  src: string
  alt: string
}

const ECOSYSTEM: EcosystemTile[] = [
  {
    eyebrow: "Components",
    title: "89 React primitives",
    description: "Accessible, themeable, and typed end to end.",
    href: "#",
    src: ecosystemImg("1467232004584-a241de8bcf5d"),
    alt: "A minimal product layout open on a designer's desk",
  },
  {
    eyebrow: "Foundations",
    title: "Tokens, themes & density",
    description: "Semantic tokens drive every theme and density.",
    href: "#",
    src: ecosystemImg("1483058712412-4245e9b90334"),
    alt: "An open notebook beside a laptop in a calm workspace",
  },
  {
    eyebrow: "Marketing",
    title: "Sections & full pages",
    description: "Composed blocks that assemble into landing pages.",
    href: "#",
    src: ecosystemImg("1460925895917-afdab827c52f"),
    alt: "An analytics layout spread across a screen",
  },
  {
    eyebrow: "Figma kit",
    title: "Design in lockstep",
    description: "A Figma library that mirrors the code, one to one.",
    href: "#",
    src: ecosystemImg("1531403009284-440f080d1e12"),
    alt: "A modern studio workspace with the team at work",
  },
]

/**
 * feature-section-5 — the ecosystem mosaic. A left-aligned lede (composed in the registry) leads
 * into a 2-up wall of image-led tiles, each ONE clickable surface: a cover photo under paired
 * legibility scrims, a small category kicker pinned top-left, and the surface name + one supporting
 * line at the foot. The affordance is held back until you hover or focus the card: a glassy corner
 * chip then unblurs and scales into place (the contextual icon animation, scale 0.25→1, opacity
 * 0→1, blur 4px→0) while the photo eases in and the card lifts a hair, so the still wall reads
 * premium and quiet at rest. `isolate` + `-z-10` seat the photo and scrims behind the in-flow copy
 * without per-layer z plumbing. The grid collapses to one column as the frame narrows. Scale and
 * translate are named in every `transition-[…]` (never `transform`) so they animate rather than
 * snap, per the Tailwind v4 standalone-property gotcha.
 */
export function FeatureMosaicContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ECOSYSTEM.map((tile) => (
        <Link
          key={tile.title}
          href={tile.href}
          className="group relative isolate flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-md ring-1 ring-inset ring-black/10 transition-[translate,scale,box-shadow] duration-base ease-out hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] sm:p-6 dark:ring-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.src}
            alt={tile.alt}
            className="absolute inset-0 -z-10 size-full object-cover transition-[scale] duration-slow ease-out group-hover:scale-[1.03]"
          />
          {/* Paired scrims: a faint top wash keeps the kicker legible, a deeper bottom gradient seats
              the title + line over any photo. Both decorative. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />

          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {tile.eyebrow}
            </span>
            {/* Held back until hover/focus, then it unblurs and scales into place. The frosted
                backdrop is gated to the same states: at rest we keep backdrop-blur-none, because a
                live backdrop-filter leaks through opacity-0 (Chromium composites the blurred backdrop
                patch even on an invisible element) and would show as a soft blob in the corner. */}
            <span
              aria-hidden
              className="flex size-8 shrink-0 scale-[0.25] items-center justify-center rounded-full bg-white/20 text-white opacity-0 shadow-sm blur-[4px] ring-1 ring-inset ring-white/30 backdrop-blur-none transition-[scale,opacity,filter,backdrop-filter] duration-base ease-out group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0 group-hover:backdrop-blur-md group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:blur-0 group-focus-visible:backdrop-blur-md"
            >
              <ArrowUpRight weight="bold" className="size-4" />
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-balance text-white sm:text-xl">
              {tile.title}
            </h3>
            <p className="text-sm text-pretty text-white/70">{tile.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── feature-section-6 ──────────────────────────────────────────────────────────────────────────
interface StrokeFeature {
  /** Short two-word capability label, set in the heading face. */
  title: string
  /** One supporting line under the title, in the clipped two-fragment marketing rhythm. */
  description: string
}

const STROKE_FEATURES: StrokeFeature[] = [
  { title: "Design tokens", description: "Four themes, eight accents. One source." },
  { title: "Accessibility", description: "Radix behavior and ARIA. Built in." },
  { title: "Density system", description: "Comfortable or compact. Every control." },
  { title: "Motion tokens", description: "Shared easings and durations. Nothing snaps." },
  { title: "Dark mode", description: "Light, dark, moonlight. Every surface." },
]

/**
 * feature-section-6 — the stroke column wall. A left-aligned lede (composed in the registry) leads
 * into a flush row of capability columns, each hanging from a full-height hairline STROKE on its
 * left edge (the design element): a `bg-border` rule the height of the tallest column, capped at the
 * top by a thicker `bg-brand` accent segment. The tall min height is gated to `lg`, the narrow
 * five-up layout where it reads as editorial presence; below that (one- and two-column) each row
 * compacts to its content instead of trailing a long empty stroke. `gap-x` keeps a column's copy
 * clear of the next stroke. The grid steps from one column to five as the frame widens.
 */
export function FeatureStrokeContent() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
      {STROKE_FEATURES.map((feature) => (
        <div key={feature.title} className="relative pl-6 lg:min-h-56">
          {/* The base hairline the column hangs from. */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
          {/* The thicker brand accent cap at the top of the stroke. */}
          <span aria-hidden className="absolute left-0 top-0 h-8 w-0.5 bg-brand" />
          <h3 className="text-base font-semibold text-balance text-foreground">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── stats-section-1 ────────────────────────────────────────────────────────────────────────────
/**
 * stats-section-1 — the library at a glance: minimal, no container. A ruled grid (the `bg-border`
 * parent showing through a `gap-px`) separates the figures with nothing but thin 1px rules, on both
 * axes and at any column count, so it reads as bare type on the page rather than a boxed band. The
 * Stats run flush (chrome stripped) and collapse from four columns to a two-up grid on mobile.
 */
export function StatsContent() {
  return (
    <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
      {METRICS.map((metric) => (
        <Stat
          key={metric.label}
          density="comfortable"
          className="items-center gap-1.5 rounded-none border-0 bg-background p-8 text-center shadow-none"
        >
          <StatValue countUp className="text-3xl sm:text-4xl">{metric.value}</StatValue>
          <StatLabel>{metric.label}</StatLabel>
        </Stat>
      ))}
    </div>
  )
}

// ── stats-section-2 ────────────────────────────────────────────────────────────────────────────
const SPOTLIGHT_METRICS = [
  {
    eyebrow: "Ship speed",
    value: "4.6×",
    caption:
      "Faster to a production screen once the system is in place, with no design debt trailing behind it.",
  },
  {
    eyebrow: "Less code",
    value: "74%",
    caption:
      "Of the UI you would hand-write is gone, since every part arrives styled, accessible, and composable.",
  },
  {
    eyebrow: "Hours saved",
    value: "52,800",
    caption:
      "Engineering hours recaptured in year one, no longer spent rebuilding the same primitives twice.",
  },
  {
    eyebrow: "Re-theme",
    value: "6 hrs",
    caption: "To re-skin an entire product for a new brand, driven by a single layer of semantic tokens.",
  },
] as const

/**
 * stats-section-2 — the spotlight row: minimal, no card. A top hairline and thin vertical rules (lg
 * `divide-x`) are the only chrome; each metric carries an accent eyebrow, an oversized figure, and a
 * supporting line pinned to the bottom (`mt-auto`) so the captions align across columns. The Stats
 * run bare (chrome stripped) so the figures read as type on the page, not as a strip of tiles. A
 * footnote with a source link closes it.
 */
export function StatsSpotlightContent() {
  return (
    <div className="flex flex-col gap-8 border-t border-border pt-10">
      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border">
        {SPOTLIGHT_METRICS.map((metric) => (
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
      <p className="text-sm text-pretty text-muted-foreground">
        *From the 2026 Koala UI design systems survey of 400+ product teams.{" "}
        <Link href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
          Read the report
        </Link>
      </p>
    </div>
  )
}

// ── stats-section-3 ────────────────────────────────────────────────────────────────────────────
const TREND_METRICS = [
  { label: "Active teams", value: "4,100", delta: "+19%", icon: UsersThree, direction: "up", inverted: false },
  { label: "Installs / week", value: "58k", delta: "+48%", icon: Cube, direction: "up", inverted: false },
  { label: "Screens shipped", value: "214k", delta: "+24%", icon: RocketLaunch, direction: "up", inverted: false },
  { label: "Time to first screen", value: "9 min", delta: "-33%", icon: Timer, direction: "down", inverted: true },
] as const

/**
 * stats-section-3 — centered icon stats in outlined cards. Each metric sits in its own card with a
 * transparent fill and a soft gray hairline (`variant="outline"`, no shadow), stacking a secondary
 * icon in a ring (gray-bordered circle, no fill), a tabular figure, a label, and a directional trend
 * chip. The setup-time metric uses `inverted` so a falling number still reads as the good outcome
 * (green), while its arrow keeps pointing the honest way.
 */
export function StatsTrendsContent() {
  return (
    <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
      {TREND_METRICS.map((metric) => {
        const Icon = metric.icon
        return (
          <Stat
            key={metric.label}
            variant="outline"
            density="comfortable"
            className="items-center gap-3 bg-transparent p-8"
          >
            <StatIcon className="size-12 rounded-full border border-border bg-transparent text-muted-foreground [&>svg]:size-6">
              <Icon weight="bold" />
            </StatIcon>
            <StatValue countUp className="text-4xl">{metric.value}</StatValue>
            <StatLabel>{metric.label}</StatLabel>
            <StatTrend direction={metric.direction} inverted={metric.inverted}>
              {metric.delta}
            </StatTrend>
          </Stat>
        )
      })}
    </div>
  )
}

// ── stats-section-4 ────────────────────────────────────────────────────────────────────────────
const SPLIT_METRICS = [
  { value: "260+", label: "Variants & recipes" },
  { value: "100", label: "Lighthouse accessibility" },
  { value: "0", label: "Locked dependencies" },
  { value: "7,900", label: "GitHub stars" },
] as const

/**
 * stats-section-4 — the split layout: minimal, no panel. A left-aligned lede sits beside a flat
 * two-up grid of oversized figures (it folds to one column on mobile). The numbers run as bare Stats
 * on the page background, so the section reads as type and whitespace rather than a boxed band. The
 * lede lives in the left column, so the registry renders this directly with no outer SectionHeader.
 */
export function StatsSplitContent() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <SectionHeader align="left">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Coverage
          </Badge>
          <SectionHeaderHeading>One system, fully measured</SectionHeaderHeading>
          <SectionHeaderDescription>
            Every figure below is something you get on install, not a line on a roadmap.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <div className="grid grid-cols-2 gap-x-8 gap-y-10">
        {SPLIT_METRICS.map((metric) => (
          <Stat
            key={metric.label}
            density="comfortable"
            className="gap-1 border-0 bg-transparent p-0 shadow-none"
          >
            <StatValue countUp className="text-4xl sm:text-5xl">{metric.value}</StatValue>
            <StatLabel>{metric.label}</StatLabel>
          </Stat>
        ))}
      </div>
    </div>
  )
}

// ── stats-section-5 ────────────────────────────────────────────────────────────────────────────
const MEASURE_METRICS = [
  { caption: "Production teams building on the library", value: "4,100+" },
  { caption: "Component installs from the registry each week", value: "58k" },
  { caption: "Theme and accent combinations out of the box", value: "32" },
  { caption: "From install to a themed, accessible screen", value: "1 day" },
] as const

/**
 * stats-section-5 — caption-led: minimal, no card. The inverse of the spotlight row, so the small
 * supporting line sits on top and the oversized figure is pinned to the bottom (`mt-auto`) and lands
 * on a shared baseline. Only a top hairline and thin vertical rules (lg `divide-x`) frame it.
 */
export function StatsCaptionTopContent() {
  return (
    <div className="grid gap-x-10 gap-y-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border">
      {MEASURE_METRICS.map((metric) => (
        <Stat
          key={metric.caption}
          density="comfortable"
          className="min-h-44 gap-4 border-0 bg-transparent p-0 shadow-none lg:px-8 lg:first:pl-0 lg:last:pr-0"
        >
          <StatCaption>{metric.caption}</StatCaption>
          <StatValue countUp className="mt-auto text-4xl sm:text-5xl">{metric.value}</StatValue>
        </Stat>
      ))}
    </div>
  )
}

// ── stats-section-6 ────────────────────────────────────────────────────────────────────────────
const SUPPORT_METRICS = [
  {
    value: "24/7",
    title: "Answers when you're stuck",
    caption:
      "Docs, runnable examples, and a community that replies, so an integration never blocks a release.",
  },
  {
    value: "100%",
    title: "Accessible by default",
    caption:
      "Keyboard, focus, and screen-reader behavior come handled by Radix under every component.",
  },
  {
    value: "1 layer",
    title: "Re-theme the whole system",
    caption: "Repaint every surface for a new brand from a single layer of semantic tokens.",
  },
] as const

/**
 * stats-section-6 — centered, pure type: minimal, no cards or icons. Each metric stacks an oversized
 * figure, a bold title, and a supporting line, centered and separated by whitespace alone. The
 * StatLabel is restyled into the title so the typography still flows from the canonical component.
 */
export function StatsCenteredContent() {
  return (
    <div className="grid gap-12 text-center sm:grid-cols-3 sm:gap-10">
      {SUPPORT_METRICS.map((metric) => (
        <Stat
          key={metric.title}
          density="comfortable"
          className="items-center gap-2 border-0 bg-transparent p-0 shadow-none"
        >
          <StatValue className="text-4xl sm:text-5xl">{metric.value}</StatValue>
          <StatLabel className="text-base font-semibold text-foreground">{metric.title}</StatLabel>
          <StatCaption className="mt-1 max-w-xs">{metric.caption}</StatCaption>
        </Stat>
      ))}
    </div>
  )
}

// ── stats-section-7 ────────────────────────────────────────────────────────────────────────────
const PANEL_METRICS = [
  { value: "4,100+", label: "Teams building on Koala" },
  { value: "89", label: "Components & blocks" },
  { value: "4.8/5", label: "Average rating" },
  { value: "7,900", label: "GitHub stars" },
] as const

/**
 * stats-section-7 — the elevated inverse panel: unlike the whitespace-only siblings, the metrics
 * ride a single dark, rounded surface that lifts them off the page. The panel uses the neutral
 * inverse pair (`bg-foreground text-background`, the same theme-flipping ink as Banner's solid
 * variant), so it reads dark-on-light in light themes and light-on-dark in dark ones without a
 * bespoke color. Figures are left-aligned and run flush (Stat chrome stripped), the label dims to
 * `text-background/70`, and the figure keeps the canonical `tabular-nums` so the four-up row never
 * reflows. The centered lede with its CTA pair is composed above in the registry.
 */
export function StatsPanelContent() {
  return (
    <div className="rounded-3xl bg-foreground p-8 text-background shadow-lg sm:p-10 lg:p-12">
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
        {PANEL_METRICS.map((metric) => (
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
    </div>
  )
}

// ── stats-section-8 ────────────────────────────────────────────────────────────────────────────
const MEDIA_METRICS = [
  {
    value: "4,100+",
    label: "Teams building on Koala",
    caption: "Product teams shipping on the system, from solo founders to full design orgs.",
  },
  {
    value: "89",
    label: "Components & blocks",
    caption: "Accessible React primitives and composed marketing blocks, typed end to end.",
  },
  {
    value: "8",
    label: "Accent colors",
    caption: "Semantic accents that repaint the whole system from a single layer of tokens.",
  },
  {
    value: "4.8/5",
    label: "Average rating",
    caption: "How teams rate the polish and developer experience once the library is in place.",
  },
] as const

/**
 * stats-section-8 — the media split: a left-aligned lede over a supporting photo and its caption in
 * one column, beside a vertical list of detailed metrics in the other. Unlike the terse siblings,
 * each metric here carries a full supporting line (`StatCaption`), so the numbers read as a narrated
 * spec sheet rather than a bare band. The photo is a plain remote `<img>` (config-free, like the
 * Gallery) with the DS image outline (`ring-1 ring-inset ring-black/10 dark:ring-white/10`) so it
 * never floats edgeless on the page. Figures keep the canonical `tabular-nums`. The lede lives in
 * the left column, so the registry renders this directly with no outer SectionHeader; it folds to a
 * single stacked column below `lg`.
 */
export function StatsMediaContent() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      {/* Left: the lede, a supporting photo, and its caption. */}
      <div className="flex flex-col gap-10">
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              The story in numbers
            </Badge>
            <SectionHeaderHeading>Numbers with a team behind them</SectionHeaderHeading>
            <SectionHeaderDescription>
              From the teams shipping on it to the parts in the box, these figures trace a design
              system built to feel finished.
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

        <figure className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ecosystemImg("1531403009284-440f080d1e12")}
            alt="A product team collaborating in a bright studio"
            className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-inset ring-black/10 dark:ring-white/10"
          />
          <figcaption className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-balance text-foreground">
              Loved by the teams who ship on it
            </p>
            <p className="text-sm text-pretty text-muted-foreground">
              Recognized for accessible, polished components that arrive finished, not almost-finished.
            </p>
          </figcaption>
        </figure>
      </div>

      {/* Right: a narrated vertical list, one detailed metric per block. */}
      <div className="flex flex-col gap-10 lg:gap-12">
        {MEDIA_METRICS.map((metric) => (
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
    </div>
  )
}

// ── stats-section-9 ────────────────────────────────────────────────────────────────────────────
// Three tone treatments for the stepped cards: the subtle muted surface, the neutral inverse pair
// (bg-foreground / text-background, theme-flipping like Banner's solid — see stats-section-7), and
// the brand-accent surface (bg-brand text-white, the same primary-action ink as Button). Each maps
// to the value + label + caption text colors so the figures and copy stay legible on their bed.
const STEPPED_TONES = {
  muted: {
    root: "border-0 bg-muted shadow-none",
    value: "text-foreground",
    label: "text-foreground",
    caption: "text-muted-foreground",
  },
  dark: {
    root: "border-0 bg-foreground text-background shadow-lg",
    value: "text-background",
    label: "text-background",
    caption: "text-background/70",
  },
  brand: {
    root: "border-0 bg-brand text-white shadow-lg",
    value: "text-white",
    label: "text-white",
    caption: "text-white/80",
  },
} as const

// The staircase: bottoms align (lg:items-end) while each card carries its own lg min-height, so the
// tops step and the tallest (dark) card gives its headline the most room. Heights only bite at lg;
// below it the cards stack at natural height.
const STEPPED_METRICS = [
  {
    tone: "muted",
    value: "236k",
    label: "Installs a month",
    caption: "Component source pulled straight from the registry by teams shipping in production.",
    height: "lg:min-h-[15rem]",
  },
  {
    tone: "dark",
    value: "$4.2M",
    label: "Teams have saved over six million dollars in engineering time.",
    caption:
      "Recaptured in the first year alone, no longer spent rebuilding the same primitives from scratch.",
    height: "lg:min-h-[25rem]",
  },
  {
    tone: "brand",
    value: "214,000",
    label: "Screens shipped this year",
    caption: "Accessible, polished interfaces assembled on Koala across every product surface.",
    height: "lg:min-h-[19rem]",
  },
] as const

/**
 * stats-section-9 — the stepped staircase: three metric cards whose bottoms align (`lg:items-end`)
 * while each keeps its own `lg` min-height, so the tops step up and the row reads as a staircase.
 * The oversized figure is pinned to the TOP of each card and the label + supporting line drop to the
 * bottom (`mt-auto`), so the numbers land at stepped heights while the copy settles on a shared lower
 * band. Three tone treatments carry the emphasis: a subtle muted card, the theme-flipping inverse
 * panel (its taller card and full-sentence headline make it the hero), and the brand-accent card.
 * The figures keep the canonical `tabular-nums` from StatValue. Below `lg` the min-heights release
 * and the cards stack. The left-aligned lede is composed above in the registry.
 */
export function StatsSteppedContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 lg:items-end">
      {STEPPED_METRICS.map((metric) => {
        const tone = STEPPED_TONES[metric.tone]
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
              <StatCaption className={cn(tone.caption)}>{metric.caption}</StatCaption>
            </div>
          </Stat>
        )
      })}
    </div>
  )
}

// ── stats-section-10 ───────────────────────────────────────────────────────────────────────────
// The three headline figures, each carrying a small "Up to" kicker and a supporting caption.
const MIXED_METRICS = [
  { prefix: "Up to", value: "4.6×", caption: "faster to ship a polished, production screen" },
  { prefix: "Up to", value: "74%", caption: "less UI boilerplate to hand-write" },
  { prefix: "Up to", value: "9×", caption: "fewer accessibility bugs in review" },
] as const

/**
 * stats-section-10 — the mixed band (Ramp-style): oversized headline figures and logo-led
 * testimonials share ONE aligned three-column grid, so the proof reads as numbers and voices
 * together rather than two separate slabs. The top row is three soft stat cards — a small "Up to"
 * kicker, an oversized `tabular-nums` figure pinned low (`mt-auto`) so the numbers land on a shared
 * baseline, and a supporting caption. The bottom row drops three container-less testimonials (`bare`)
 * into the same columns: a framed brand-mark tile (concentric rounded-xl over the card's radius), the
 * company name, the quote at its canonical medium weight, and an author byline pinned to the bottom
 * (`divided`, a hairline above it) so every byline settles on one line. The whole thing folds to a
 * single column on mobile.
 */
export function StatsMixedContent() {
  return (
    <div className="flex flex-col gap-12 sm:gap-14">
      {/* Row 1 — the headline figures. Grid stretch + mt-auto lands every figure on a shared baseline. */}
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {MIXED_METRICS.map((metric) => (
          <Stat
            key={metric.value}
            variant="default"
            density="comfortable"
            className="gap-8 rounded-2xl p-8 sm:min-h-56"
          >
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
        {HERO_TESTIMONIALS.map((t) => {
          const brand = PLACEHOLDER_BRANDS.find((b) => b.name === t.brand) ?? PLACEHOLDER_BRANDS[0]
          return (
            <Testimonial key={t.name} variant="bare" divided className="gap-5">
              {/* Framed brand tile + company name lead the card (concentric rounded-xl on the card). */}
              <div className="flex flex-col gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10">
                  <PlaceholderLogo brand={brand} variant="mark" className="size-6" />
                </div>
                <TestimonialName className="text-base">{t.brand}</TestimonialName>
              </div>
              <TestimonialQuote className="text-base leading-relaxed">{t.body}</TestimonialQuote>
              <TestimonialFooter>
                <TestimonialAuthor>
                  <TestimonialName className="font-medium text-muted-foreground">
                    {t.name}
                  </TestimonialName>
                  <TestimonialTitle>{t.title}</TestimonialTitle>
                </TestimonialAuthor>
              </TestimonialFooter>
            </Testimonial>
          )
        })}
      </div>
    </div>
  )
}

// ── faq-section-1 ──────────────────────────────────────────────────────────────────────────────
/** faq-section-1 — a single-open separated accordion of the product's common questions. */
export function FaqContent() {
  return (
    <Accordion type="single" collapsible variant="separated" className="mx-auto max-w-3xl">
      {FAQ.map((item, i) => (
        <AccordionItem key={item.question} value={`item-${i}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// ── faq-section-2 ──────────────────────────────────────────────────────────────────────────────
/**
 * faq-section-2 — the sectioned / help-center FAQ: the same questions split into topic groups
 * (FaqsGroup), each a borderless `minimal` list with single-expand scoped to its topic.
 */
export function FaqGroupedContent() {
  return (
    <Faqs>
      {FAQ_TOPICS.map((group) => (
        <FaqsGroup key={group.topic} title={group.topic}>
          {group.questions.map((item, i) => (
            <FaqsItem key={item.question} value={`${group.topic}-${i}`} question={item.question}>
              {item.answer}
            </FaqsItem>
          ))}
        </FaqsGroup>
      ))}
    </Faqs>
  )
}

// ── changelog-section-1 ────────────────────────────────────────────────────────────────────────
/** changelog-section-1 — the recent release log as a simple timeline of version cards. */
export function ChangelogContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {CHANGELOG.map((entry) => (
          <article
            key={entry.version}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs sm:flex-row sm:items-start sm:gap-6"
          >
            <div className="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start">
              <Badge variant="info" dot pill>
                {entry.version}
              </Badge>
              <time className="text-sm text-muted-foreground tabular-nums">{entry.date}</time>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">{entry.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/docs">Read the docs</Link>
        </Button>
      </div>
    </div>
  )
}

// ── changelog-section-2..4 (shared release meta) ─────────────────────────────────────────────────
// A Phosphor glyph per release, keyed by version, for the timeline and media-card variants. The
// base card list (variant 1) stays glyph-free; these richer layouts lead each entry with a marker.
const CHANGELOG_ICON: Record<string, Icon> = {
  "v1.0": RocketLaunch,
  "v0.9": ChartBar,
  "v0.8": ListChecks,
  "v0.7": ShieldCheck,
}

// Category → the soft Badge variant that labels an entry (New / Improved / Fixed).
const CATEGORY_BADGE: Record<ChangelogCategory, "success" | "info" | "warning"> = {
  New: "success",
  Improved: "info",
  Fixed: "warning",
}
// Soft tile tint for the media-card cover, following the Badge/ActivityIcon pattern (bg-<role>/10 +
// text-<role>) so every tone re-themes cleanly across all four palettes.
const CATEGORY_TILE: Record<ChangelogCategory, string> = {
  New: "border-success/20 bg-success/10 text-success",
  Improved: "border-info/20 bg-info/10 text-info",
  Fixed: "border-warning/20 bg-warning/10 text-warning",
}

// ── changelog-section-2 ────────────────────────────────────────────────────────────────────────
/**
 * changelog-section-2 — the release log as a vertical timeline (the Vercel / Stripe pattern).
 * Composes the canonical `ActivityFeed` (its connecting rail is pure layout, no JS) so the versions
 * read as one continuous thread: a neutral glyph marker per release, then a version + category + date
 * header over the title and note. The marker stays monochrome so the small category Badge carries the
 * only color; the feed collapses the rail cleanly under the final entry.
 */
export function ChangelogTimelineContent() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <ActivityFeed>
        {CHANGELOG.map((entry) => {
          const Glyph = CHANGELOG_ICON[entry.version] ?? Sparkle
          return (
            <ActivityItem key={entry.version}>
              <ActivityMarker>
                <ActivityIcon>
                  <Glyph />
                </ActivityIcon>
              </ActivityMarker>
              <ActivityContent className="pb-8">
                <ActivityHeader className="gap-2">
                  <Badge variant="outline" pill className="tabular-nums">
                    {entry.version}
                  </Badge>
                  {entry.category ? (
                    <Badge variant={CATEGORY_BADGE[entry.category]} pill>
                      {entry.category}
                    </Badge>
                  ) : null}
                  <ActivityTime>{entry.date}</ActivityTime>
                </ActivityHeader>
                <h3 className="mt-1.5 font-semibold text-foreground">{entry.title}</h3>
                <ActivityBody>{entry.description}</ActivityBody>
              </ActivityContent>
            </ActivityItem>
          )
        })}
      </ActivityFeed>
    </div>
  )
}

// ── changelog-section-3 ────────────────────────────────────────────────────────────────────────
/**
 * changelog-section-3 — the release log as a row of media cards (the Linear pattern). Each release
 * gets a cover: a soft, category-tinted glyph tile on a muted panel with a floating category badge,
 * then the date and version below the fold, the title, and a short note. Cards lift on hover and the
 * cover tile eases up with them. Folds 4 → 2 → 1 columns.
 */
export function ChangelogMediaContent() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CHANGELOG.map((entry) => {
          const Glyph = CHANGELOG_ICON[entry.version] ?? Sparkle
          return (
            <article
              key={entry.version}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-[transform,box-shadow] duration-base ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-muted">
                <div
                  className={cn(
                    "grid size-14 place-items-center rounded-xl border transition-transform duration-base ease-out group-hover:scale-110 [&>svg]:size-7",
                    entry.category
                      ? CATEGORY_TILE[entry.category]
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  <Glyph />
                </div>
                {entry.category ? (
                  <Badge
                    variant={CATEGORY_BADGE[entry.category]}
                    pill
                    className="absolute left-3 top-3"
                  >
                    {entry.category}
                  </Badge>
                ) : null}
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
          )
        })}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/docs">See all releases</Link>
        </Button>
      </div>
    </div>
  )
}

// ── changelog-section-4 ────────────────────────────────────────────────────────────────────────
/**
 * changelog-section-4 — the editorial two-column log (the Notion / Plain pattern). The lede sits in
 * a sticky left rail; the right column is a hairline-divided list of dated entries. Minimal, no
 * cards, all typography. Embeds its own left-aligned `SectionHeader`, so the registry renders it
 * raw (no centered lede on top). Stacks to one column below `lg`.
 */
export function ChangelogEditorialContent() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              Changelog
            </Badge>
            <SectionHeaderHeading>Every update, in one place</SectionHeaderHeading>
            <SectionHeaderDescription>
              Follow along as the library grows. New components and refinements ship every month.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild variant="outline">
              <Link href="/docs">Read the docs</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>
      </div>

      <ol className="flex flex-col divide-y divide-border">
        {CHANGELOG.map((entry) => (
          <li
            key={entry.version}
            className="flex flex-col gap-2 py-6 first:pt-0 last:pb-0 sm:flex-row sm:gap-8"
          >
            <div className="flex shrink-0 items-center gap-2 sm:w-36 sm:flex-col sm:items-start sm:pt-0.5">
              <time className="text-sm text-muted-foreground tabular-nums">{entry.date}</time>
              {entry.category ? (
                <Badge variant={CATEGORY_BADGE[entry.category]} pill>
                  {entry.category}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">{entry.title}</h3>
                <Badge variant="outline" pill className="tabular-nums">
                  {entry.version}
                </Badge>
              </div>
              <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── changelog-section-5 ────────────────────────────────────────────────────────────────────────
/**
 * changelog-section-5 — release notes as a bare single-column list (the Basecamp / Attio pattern).
 * Each entry leads with its date on an outline pill, then a bold title and a short note, split by
 * hairline dividers. No cards, no version chips, no margin rail: the most minimal, text-first log.
 * A narrow centered column keeps line lengths readable.
 */
export function ChangelogNotesContent() {
  return (
    <ol className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border">
      {CHANGELOG.map((entry) => (
        <li
          key={entry.version}
          className="flex flex-col items-start gap-3.5 py-8 first:pt-0 last:pb-0"
        >
          <Badge variant="outline" size="lg" className="tabular-nums">
            {entry.date}
          </Badge>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-balance text-foreground">{entry.title}</h3>
            <p className="text-pretty text-muted-foreground">{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

// ── cta-section-1 (Install) ────────────────────────────────────────────────────────────────────
const INSTALL = `# add components straight into your project
npx koalaui add button card dialog

# they land as editable source you own
components/ui/button/button.tsx`

const USAGE = `import { Button } from "@/components/ui/button"

export function Cta() {
  return <Button size="lg">Get started</Button>
}`

const POINTS = [
  "Source copied into your repo, not a black-box package",
  "No runtime dependency you cannot read or edit",
  "Built on Radix primitives and Tailwind v4 tokens",
  "Free tier needs no auth, PRO is token-gated",
]

/**
 * cta-section-1 — the CLI + source-ownership story. A two-column slab: a left-aligned lede and
 * benefit checklist beside two stacked code snippets. The lede is embedded here (not added in the
 * registry) because it sits inside the left column rather than centered on top.
 */
export function InstallCliContent() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              Install
            </Badge>
            <SectionHeaderHeading>One command. You own the code.</SectionHeaderHeading>
            <SectionHeaderDescription>
              The koalaui CLI copies real component source into your project. Tweak any recipe, and
              it still matches the rest of the system.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>
        <ul className="flex flex-col gap-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Check weight="bold" className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <CodeSnippet code={INSTALL} lang="bash" filename="Terminal" dots />
        <CodeSnippet code={USAGE} lang="tsx" filename="cta.tsx" />
      </div>
    </div>
  )
}

// ── cta-section-2 (closing CTA panel) ──────────────────────────────────────────────────────────
/**
 * cta-section-2 — the closing CTA: a brand-lit panel that funnels to pricing and the docs. The
 * lede is embedded (centered inside the panel) and composes `SectionHeader` like every other band.
 */
export function CtaBandContent() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-lg sm:px-12 sm:py-20">
      <SectionHeader
        align="center"
        stagger
        staggerBlur
        staggerTrigger="inView"
        className="relative mx-auto max-w-2xl"
      >
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Get started
          </Badge>
          <SectionHeaderHeading>Build polished products, starting today</SectionHeaderHeading>
          <SectionHeaderDescription>
            Install the free tier in minutes, or unlock the full Figma and React system. Pay once,
            and use it forever.
          </SectionHeaderDescription>
        </SectionHeaderText>
        <SectionHeaderActions>
          <Button asChild size="lg">
            <Link href="#">
              Get Koala UI
              <ArrowRight weight="bold" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#">Read the docs</Link>
          </Button>
        </SectionHeaderActions>
      </SectionHeader>
    </div>
  )
}

// ── cta-section-3 (email / lead capture) ───────────────────────────────────────────────────────
/**
 * cta-section-3 — the inline lead-capture CTA (the "Ready to get started?" pattern from Circle,
 * Ramp, Copy.ai): a centered lede over an email field and a detached submit button, with a
 * reassurance row of checks below. The button is a real `Button` beside the field, never crammed
 * *inside* it (memory `no-big-buttons-inside-inputs`), sized to match so the heights line up. On
 * submit the row flips to an inline confirmation, so the live preview actually responds. Field +
 * button stack full-width on mobile and return to a row from `sm` up.
 */
export function CtaEmailCaptureContent() {
  const [sent, setSent] = React.useState(false)
  return (
    <SectionHeader align="center" className="mx-auto max-w-2xl">
      <SectionHeaderText>
        <Badge variant="info" dot pill>
          Get started
        </Badge>
        <SectionHeaderHeading>Start building today</SectionHeaderHeading>
        <SectionHeaderDescription>
          Join 4,100+ teams shipping polished interfaces with Koala UI. Spin up the free tier in
          minutes, no credit card required.
        </SectionHeaderDescription>
      </SectionHeaderText>

      <div className="flex w-full flex-col items-center gap-4">
        {sent ? (
          <p
            role="status"
            className="flex items-center gap-2 py-2.5 text-sm font-medium text-foreground animate-stagger-in"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Check weight="bold" className="size-3" />
            </span>
            You&apos;re on the list. Check your inbox to confirm.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center"
          >
            {/* `w-full`, not `flex-1`: when the form stacks (flex-col) the main axis is
                vertical, so a `flex-1` here would override the field's `h-10` and collapse it
                to content height (tiny input beside a full-height button). `w-full` keeps the
                field its own height stacked and still fills the row from sm up (it shrinks to
                share the row with the `shrink-0` button). Matches NewsletterForm / WaitlistForm. */}
            <InputRoot size="lg" className="w-full">
              <InputPrefix>
                <EnvelopeSimple />
              </InputPrefix>
              <InputField
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                aria-label="Work email"
              />
            </InputRoot>
            <Button type="submit" size="lg" className="shrink-0 max-sm:w-full">
              Start free trial
            </Button>
          </form>
        )}

        {/* Same benefit unit as cta-section-1: a tinted icon container + text (memory
            `hero-buttons-no-icon` sibling — one benefit treatment across the CTA family). */}
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {["Free forever plan", "No credit card", "Cancel anytime"].map((point) => (
            <li key={point} className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Check weight="bold" className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </SectionHeader>
  )
}

// ── cta-section-4 (split brand band) ───────────────────────────────────────────────────────────
/**
 * cta-section-4 — the bold split band (the Intercom / Webflow "grow faster" pattern): a saturated
 * `bg-brand` panel with the headline on the left and the action pair on the right, laid out by the
 * canonical `SectionHeader` `orientation="split"` (side by side from `lg`, stacked below). The fill
 * is the `--brand` token, so the whole band recolors with the active accent, and white always holds
 * AA on the deep accent (the same contract every primary Button relies on). The primary CTA inverts
 * to a white chip with brand-colored label; the secondary is a hairline ghost on the fill.
 */
export function CtaBrandBandContent() {
  return (
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
          <Button asChild size="lg" className="bg-white text-brand shadow-xs hover:bg-white/90">
            <Link href="#">Get started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="#">Book a demo</Link>
          </Button>
        </SectionHeaderActions>
      </SectionHeader>
    </div>
  )
}

// ── cta-section-5 (device showcase) ────────────────────────────────────────────────────────────
/**
 * cta-section-5 — the product-shot closing CTA (the Aboard / VanMoof pattern): an elevated card
 * with the lede + action pair on the left and a finished device duo on the right (an iPad portrait
 * with an iPhone overlapping its lower corner, the same renders the heroes ship; bezel + shadow are
 * baked into the transparent PNGs, so the frame IS the visual). Two columns from `lg`, stacked
 * below, and the device stays contained so the preview measures the card height cleanly.
 */
export function CtaDeviceContent() {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-lg">
      <div className="grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-8 lg:p-14">
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="purple" dot pill>
              Responsive by default
            </Badge>
            <SectionHeaderHeading>Looks flawless on every screen</SectionHeaderHeading>
            <SectionHeaderDescription>
              Every Koala component is tuned for touch and built to scale, from a 320px phone to an
              ultrawide display, with no per-breakpoint rework.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild size="lg">
              <Link href="#">Start building</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#">Browse components</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>

        {/* Device duo: the iPad sits centered, the iPhone overlaps its lower-right corner. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <img
            src="/devices/ipad-portrait.png"
            alt=""
            width={802}
            height={1035}
            className="mx-auto block w-[82%]"
          />
          <img
            src="/devices/iphone.png"
            alt=""
            width={419}
            height={757}
            className="absolute bottom-0 right-0 w-[42%]"
          />
        </div>
      </div>
    </div>
  )
}

// ── cta-section-6 (spotlight) ──────────────────────────────────────────────────────────────────
/**
 * cta-section-6 — the dramatic spotlight (the Superpower / Superhuman moment): a deep inverse band
 * with a single focused message caught in a soft cone of light from above. The surface is the
 * neutral inverse pair (`bg-foreground text-background`, theme-flipping like Banner's solid — see
 * stats-section-7), and the "spotlight" is a crisp radial gradient of a low-alpha white (NOT a
 * colored blur), so it lights the message without tinting the band or fighting the accent. The lede
 * cascades in with a soft focus-pull as the section scrolls into view.
 */
export function CtaSpotlightContent() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-20 text-center text-background shadow-lg sm:px-12 sm:py-24">
      {/* Spotlight from top-center: a soft light cone, not a blurred colored glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 58% at 50% 0%, color-mix(in oklab, white 16%, transparent), transparent 70%)",
        }}
      />
      <SectionHeader
        align="center"
        stagger
        staggerBlur
        staggerTrigger="inView"
        className="relative mx-auto max-w-2xl"
      >
        <SectionHeaderText>
          <SectionHeaderHeading className="text-background">
            Your best work starts here
          </SectionHeaderHeading>
          <SectionHeaderDescription className="text-background/70">
            Design, build, and launch on a system that already feels finished. Start free, and keep
            the code forever.
          </SectionHeaderDescription>
        </SectionHeaderText>
        <SectionHeaderActions>
          <Button
            asChild
            size="lg"
            className="bg-background text-foreground shadow-xs hover:bg-background/90"
          >
            <Link href="#">Get started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-background/25 text-background hover:bg-background/10 hover:text-background"
          >
            <Link href="#">Talk to sales</Link>
          </Button>
        </SectionHeaderActions>
      </SectionHeader>
    </div>
  )
}

// ── cta-section-7 (oversized statement) ────────────────────────────────────────────────────────
/**
 * cta-section-7 — the oversized statement (the Better Stack / Linear closing line): no panel, no
 * glow, just a display-scale headline sitting bare on the band with a subtitle, a text-only action
 * pair, and a quiet trust line below. Uses SectionHeader at `size="lg"` for the big-type moment
 * (the lede's own scale carries the section; memory `prefer-minimal-no-containers`), so it reads as
 * the confident, typographic period at the end of a landing page.
 */
export function CtaStatementContent() {
  return (
    <SectionHeader align="center" size="lg" className="mx-auto max-w-3xl">
      <SectionHeaderText>
        <Badge variant="info" dot pill>
          Ready when you are
        </Badge>
        <SectionHeaderHeading>Build interfaces people remember</SectionHeaderHeading>
        <SectionHeaderDescription>
          Everything you need to design and ship a polished, accessible product, in one system.
        </SectionHeaderDescription>
      </SectionHeaderText>
      <SectionHeaderActions>
        <Button asChild size="lg">
          <Link href="#">Start for free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#">Read the docs</Link>
        </Button>
      </SectionHeaderActions>
      {/* Same benefit unit as cta-section-1/3: tinted icon container + text, one treatment. */}
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {["Free forever plan", "No credit card required"].map((point) => (
          <li key={point} className="flex items-center gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Check weight="bold" className="size-3" />
            </span>
            {point}
          </li>
        ))}
      </ul>
    </SectionHeader>
  )
}

// ── cta-section-8 (contact + FAQ features with load-more) ──────────────────────────────────────
/**
 * The support channels for the contact strip. Label + value, rendered calm (muted → foreground on
 * hover) rather than as blue links, so the row reads as a quiet directory under the lede.
 */
const CONTACT_CHANNELS = [
  { label: "Email us", value: "hello@koalaui.com", href: "mailto:hello@koalaui.com" },
  { label: "Documentation", value: "koalaui.com/docs", href: "/docs" },
  { label: "Community", value: "Join our Discord", href: "#" },
]

/**
 * One icon per FAQ entry, index-matched to the shared `FAQ` list so the questions stay the single
 * source of truth (same as faq-section-1/2) and never drift. Bold, outline-family Phosphor icons
 * per the house convention (memory `icons-always-outline`).
 */
const FAQ_ICONS: Icon[] = [
  Package,
  Key,
  Sparkle,
  Code,
  Palette,
  ArrowsClockwise,
  CreditCard,
  GraduationCap,
  ShieldCheck,
]

// Collapsed clamp: ~two rows of the desktop grid, so the reveal actually hides (and then animates
// in) a full row instead of a thin sliver. Smaller frames stack more rows, so the reveal is larger
// there still.
const COLLAPSED_MAX_HEIGHT = "28rem"

/**
 * cta-section-8 — the contact + FAQ "load more" CTA (the help-center closing pattern): a centered
 * lede over a three-channel contact strip, then the shared FAQ list laid out as an icon-led
 * features grid. The grid is clipped to ~two rows and a fade-to-band overlay rises over the cut,
 * with a "See all questions" button floating on it: the load-more affordance.
 *
 * The reveal is a SMOOTH height animation, not a jump: `max-height` transitions (an interruptible
 * CSS transition, `duration-slow ease-out`) from the collapsed clamp to the grid's measured
 * `scrollHeight`, then settles to `none` on transition end so a later reflow (resize) is never
 * clipped. `max-height: none` is not interpolatable, so that settle snaps with no visual move (the
 * box is already at content height). Collapsing from `none` re-pins the concrete height for one
 * frame so there's a value to animate down from. The overlay cross-fades (opacity) rather than
 * unmounting, and its button is de-focused/hidden while open so there's no invisible hit target.
 * Strict react-hooks safe: all setState fires from the click handlers / a rAF, never render or an
 * effect; the ref is read only inside handlers. The docs PreviewFrame re-measures as it grows.
 */
export function CtaContactFaqContent() {
  const [expanded, setExpanded] = React.useState(false)
  const [maxHeight, setMaxHeight] = React.useState<string>(COLLAPSED_MAX_HEIGHT)
  const gridRef = React.useRef<HTMLDivElement>(null)

  function expand() {
    const el = gridRef.current
    if (!el) return
    // Animate from the collapsed clamp up to the true content height.
    setMaxHeight(`${el.scrollHeight}px`)
    setExpanded(true)
  }

  function collapse() {
    const el = gridRef.current
    if (maxHeight === "none" && el) {
      // Settled to natural height: pin a concrete start value, then drop to the clamp next frame
      // so the transition has two lengths to interpolate between (a double rAF guarantees the pin
      // paints first).
      setMaxHeight(`${el.scrollHeight}px`)
      setExpanded(false)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setMaxHeight(COLLAPSED_MAX_HEIGHT)),
      )
    } else {
      // Still mid-open (a px value): reverse straight down, interrupting the open in flight.
      setMaxHeight(COLLAPSED_MAX_HEIGHT)
      setExpanded(false)
    }
  }

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    // Only the wrapper's own max-height, and only when open: release the clamp to natural height so
    // a later resize can't crop the grid. `none` snaps (no interpolation), no visible jump.
    if (e.target === e.currentTarget && e.propertyName === "max-height" && expanded) {
      setMaxHeight("none")
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <SectionHeader align="center" className="mx-auto max-w-2xl">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Support
          </Badge>
          <SectionHeaderHeading>Get in touch with us</SectionHeaderHeading>
          <SectionHeaderDescription>
            Everything you need to know about the library, the CLI, and billing. Can&apos;t find
            your answer? Our team is a message away.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>

      {/* Contact strip: label + value, three channels, calm muted → foreground on hover. */}
      <dl className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:text-left">
        {CONTACT_CHANNELS.map((channel) => (
          <div key={channel.label} className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-foreground">{channel.label}</dt>
            <dd>
              <a
                href={channel.href}
                className="text-sm text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
              >
                {channel.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      {/* FAQ-as-features grid with the load-more overlay. */}
      <div>
        <div className="relative">
          <div
            ref={gridRef}
            onTransitionEnd={handleTransitionEnd}
            style={{ maxHeight }}
            className={cn(
              "grid grid-cols-1 gap-x-8 gap-y-12 transition-[max-height] duration-slow ease-out sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12",
              // Clip while a clamp is active; only the settled `none` runs unclipped so focus rings
              // on the last row aren't cropped.
              maxHeight !== "none" && "overflow-hidden",
            )}
          >
            {FAQ.map((item, i) => {
              const FaqIcon = FAQ_ICONS[i]
              return (
                <div key={item.question} className="flex flex-col gap-3">
                  <FaqIcon weight="bold" className="size-6 shrink-0 text-foreground" aria-hidden />
                  <h3 className="text-base font-semibold text-balance text-foreground">
                    {item.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Load-more overlay: a fade from the band up over the clipped last row, with the reveal
              button floating on it. Kept mounted and cross-faded (opacity) rather than unmounted so
              the exit is soft; while open it's de-focused (tabIndex -1 / aria-hidden) and its
              pointer events are off, so the invisible fade is never a hit target. */}
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
    </div>
  )
}

// ── contact-section-1 (split lead capture) ─────────────────────────────────────────────────────
// A warm interior shot (Unsplash) for the full-bleed contact split, the same lifestyle vibe as the
// full-bleed hero. It bleeds along the bottom of the slab while the copy sits on the band above it
// and the LeadForm card floats over the seam; swap the src for your own photo.
const CONTACT_INTERIOR_IMAGE =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop"

/**
 * contact-section-1 — the split lead-capture hero: a left copy column (announcement eyebrow,
 * headline, subtitle, CTA pair) on the band, an interior photo bleeding along the bottom, and the
 * `LeadForm` (composed as a `card`) floating over the seam on the right so it bridges the copy band
 * and the photo. Connective tissue around the `Hero` root: a plain grid that lets the media bleed
 * while the copy and card keep their gutter, the same idiom as the full-bleed split hero. Folds to a
 * single stacked column (copy → card) below the lg breakpoint, and the whole slab re-themes because
 * every surface is token-driven.
 */
export function ContactSplitContent() {
  return (
    // No rounded frame: the `bleed` registry flag hands the slab the full width, so the photo below
    // can run edge to edge while the copy and card stay in the site gutter. Everything is in normal
    // flow (nothing absolutely positioned but the photo's own cover img) so the docs PreviewFrame
    // measures the slab height correctly; the card overlaps the photo via the photo's negative margin.
    <Hero layout="split">
      {/* Copy + card, side by side on lg, held to the canonical gutter (max-w-8xl + px-5 sm:px-8,
          matching SectionContainer) so their edges line up with every other section; photo bleeds past. */}
      <div className="mx-auto w-full max-w-8xl px-5 sm:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* Copy: its natural height keeps the CTA row well above the photo below. */}
          <div className="pt-10 sm:pt-14 lg:pt-16">
            <HeroColumn className="lg:max-w-md">
              <Badge variant="info" dot pill>
                New collection
              </Badge>

              <HeroTitle>Design made to feel like home</HeroTitle>

              <HeroSubtitle className="max-w-md text-base">
                We bring your interior dreams to life with personalized designs that reflect your
                style and personality.
              </HeroSubtitle>

              <HeroActions className="pt-2">
                <Button size="md">Explore features</Button>
                <Button size="md" variant="outline">
                  Sign up
                </Button>
              </HeroActions>
            </HeroColumn>
          </div>

          {/* Card: taller than the copy, so it dips over the photo below. `relative z-10` lifts it
              above the photo it overlaps (the photo is a later sibling and would otherwise paint on
              top). On mobile it's just the second block in the stack. */}
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

      {/* Photo: full-bleed band across the slab's whole width. On lg a negative top margin slides it
          up so its top sits just under the copy's CTA row and it runs behind the card's lower half. */}
      <div className="relative min-h-64 sm:min-h-80 lg:-mt-48 lg:min-h-[22rem]">
        {/* eslint-disable-next-line @next/next/no-img-element -- demo lifestyle shot; swap for next/Image */}
        <img src={CONTACT_INTERIOR_IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </Hero>
  )
}

// ── contact-section-2 (split: contact channels + form) ─────────────────────────────────────────
/**
 * How-to-reach-us channels for the split contact layout. Actionable values (email, phone) are
 * `text-link` anchors (mailto/tel); the address is plain. Icons are 20px leading marks in a tinted
 * tile, the same benefit-unit treatment as the CTA sections.
 */
const CONTACT_METHODS = [
  {
    icon: EnvelopeSimple,
    label: "Email us",
    value: "hello@koalaui.com",
    href: "mailto:hello@koalaui.com",
  },
  { icon: Phone, label: "Call us", value: "+1 (219) 555-0114", href: "tel:+12195550114" },
  { icon: MapPin, label: "Visit us", value: "8502 Preston Rd, Inglewood, CA", href: null },
]

/**
 * contact-section-2 — the split contact layout (the Complex Law / Maxima Therapy pattern, the most
 * common contact section): a left copy column (eyebrow, heading, subtitle, a channel list of
 * email / call / visit, and an office-hours line) beside the `ContactForm` composed as a `card`.
 * Two columns from `lg`, stacked below; `items-start` so the taller form never stretches the copy.
 * The form gets a short functional heading so it doesn't compete with the section lede.
 */
export function ContactSplitFormContent() {
  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-8">
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              Contact
            </Badge>
            <SectionHeaderHeading>Talk to our team</SectionHeaderHeading>
            <SectionHeaderDescription>
              Questions about the library, a plan, or a partnership? Send a note and we&apos;ll reply
              within one business day.
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
                    <UiLink href={method.href} className="text-sm">
                      {method.value}
                    </UiLink>
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
          <span>Mon&ndash;Fri, 8:00&ndash;17:00 CET</span>
        </div>
      </div>

      <ContactForm
        variant="card"
        density="comfortable"
        title="Send us a message"
        description={null}
        className="max-w-none lg:ml-auto lg:max-w-lg"
      />
    </div>
  )
}

// ── contact-section-3 (centered lede + form card) ──────────────────────────────────────────────
/** The inline trust row above the centered form: three calm channel/response chips. */
const CONTACT_CHIPS = [
  { icon: EnvelopeSimple, label: "hello@koalaui.com" },
  { icon: ChatCircle, label: "Live chat, 9-5" },
  { icon: Clock, label: "Replies within 24h" },
]

/**
 * contact-section-3 — the centered contact (the Rox / Wise pattern): a centered lede over a slim
 * trust row and a single centered `ContactForm` card. The leanest, most drop-in contact section;
 * the card keeps a short functional heading and left-aligns its own fields inside the centered
 * column. Everything is token-driven, so it re-themes and re-accents cleanly.
 */
export function ContactCenteredContent() {
  return (
    <div className="flex flex-col items-center gap-10">
      <SectionHeader align="center" className="mx-auto max-w-2xl">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Get in touch
          </Badge>
          <SectionHeaderHeading>We&apos;d love to hear from you</SectionHeaderHeading>
          <SectionHeaderDescription>
            Tell us what you&apos;re building and how we can help. Every message reaches a real person
            on the team.
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
    </div>
  )
}

// ── contact-section-4 (department directory) ───────────────────────────────────────────────────
/**
 * The "route yourself to the right inbox" directory (the Fiasco / In Common With pattern). Each
 * entry becomes a whole-card mailto link, so the whole tile is one 40px+ hit target.
 */
const CONTACT_DEPARTMENTS = [
  { icon: Tag, name: "Sales", description: "Plans, quotes, and live demos.", email: "sales@koalaui.com" },
  { icon: Lifebuoy, name: "Support", description: "Help with the library or CLI.", email: "support@koalaui.com" },
  { icon: Handshake, name: "Partnerships", description: "Integrations and co-marketing.", email: "partners@koalaui.com" },
  { icon: Newspaper, name: "Press", description: "Media, brand assets, and story.", email: "press@koalaui.com" },
  { icon: Briefcase, name: "Careers", description: "Help build the system with us.", email: "jobs@koalaui.com" },
  { icon: ChatCircle, name: "Everything else", description: "Not sure who to ask? Start here.", email: "hello@koalaui.com" },
]

/**
 * contact-section-4 — the department directory (the Fiasco / In Common With pattern): a centered
 * lede over a grid of routing cards, one per team, each a whole-card `mailto` link. Reuses the
 * canonical `Card` (asChild → anchor) so the surface, radius, and shadow stay on-system; hover lifts
 * the border and nudges the trailing arrow. A quiet address + hours line closes the section. Folds
 * from three columns to two to one as the frame narrows.
 */
export function ContactDirectoryContent() {
  return (
    <div className="flex flex-col gap-12">
      <SectionHeader align="center" className="mx-auto max-w-2xl">
        <SectionHeaderText>
          <Badge variant="info" dot pill>
            Contact
          </Badge>
          <SectionHeaderHeading>Reach the right team</SectionHeaderHeading>
          <SectionHeaderDescription>
            Pick the inbox that fits and your message lands with the people who can help. We reply
            within one business day.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTACT_DEPARTMENTS.map((dept) => {
          const Icon = dept.icon
          return (
            <Card key={dept.name} asChild density="comfortable" className="group/dept">
              <a href={`mailto:${dept.email}`}>
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
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {dept.email}
                    {/* The card's only hover feedback: the arrow fades + slides up-right into place
                        (matching its own direction). No card shadow or color shift. `translate` is a
                        standalone property in Tailwind v4, so the transition must NAME it
                        (`transition-[opacity,translate]`) or the motion snaps (memory
                        `tailwind-v4-transition-scale-translate`). */}
                    <ArrowUpRight
                      weight="bold"
                      aria-hidden
                      className="size-4 -translate-x-1 translate-y-0.5 opacity-0 transition-[opacity,translate] duration-base ease-out group-hover/dept:translate-x-0 group-hover/dept:translate-y-0 group-hover/dept:opacity-100"
                    />
                  </span>
                </CardContent>
              </a>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
        <span className="flex items-center gap-2">
          <MapPin weight="bold" className="size-4 shrink-0" />
          8502 Preston Rd, Inglewood, CA
        </span>
        <span aria-hidden className="hidden text-border sm:inline">
          &bull;
        </span>
        <span className="flex items-center gap-2">
          <Clock weight="bold" className="size-4 shrink-0" />
          Mon&ndash;Fri, 8:00&ndash;17:00 CET
        </span>
      </div>
    </div>
  )
}

// ── social-proof sections ────────────────────────────────────────────────────────────────────────
/**
 * Company logos drawn from the shared placeholder set: a colored inline-SVG symbol beside an
 * invented wordmark, the canonical fake-customer logos documented at `/docs/logos`. They render in
 * full brand color, so the wall reads as a real, varied customer list rather than a desaturated
 * type-only strip. `PLACEHOLDER_BRANDS_VARIED` is the hue-interleaved order (the module owns the
 * permutation), so every row mixes warm and cool and a rotation swaps to a differently-hued logo.
 * One source of order for every variant below (cloud, grid, split, bento, marquee). See memory
 * `placeholder-logos-canonical`.
 */
const BRANDS = PLACEHOLDER_BRANDS_VARIED

// The rotating logo wall itself (the shared swap timer + one rolling slot) lives in
// placeholder-logos, so the hero trusted-by strips and these social-proof walls roll identically:
// useLogoSwap + RotatingPlaceholderLogo. Slot i cross-fades brand i with brand i + LOGO_ROTATE_SLOTS,
// so a wall of up to LOGO_ROTATE_SLOTS slots never shows one brand twice.

/**
 * social-proof-section-1 — the logo cloud: a centered, airy grid of logos below the lede, the strip
 * that usually sits right under a hero. A grid (not flex-wrap) with a column count that divides the
 * logo count keeps the rows always balanced (2-up on a phone, 4-up above), never a full row over a
 * lone orphan.
 */
export function LogoCloudContent() {
  const swap = useLogoSwap()
  return (
    <ul className="grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-8 sm:grid-cols-4 sm:gap-x-14">
      {Array.from({ length: LOGO_ROTATE_SLOTS }, (_, i) => (
        <li key={i}>
          <RotatingPlaceholderLogo index={i} swap={swap} />
        </li>
      ))}
    </ul>
  )
}

/**
 * social-proof-section-2 — the marquee: a minimal caption over an infinite, edge-masked logo strip
 * that drifts on the shared `--animate-marquee` token. The set is rendered twice so the loop returns
 * with no seam, it pauses on hover, and it stops entirely under `prefers-reduced-motion`.
 */
export function LogoMarqueeContent() {
  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-sm font-medium text-muted-foreground">
        Trusted by more than 4,100 product teams worldwide
      </p>
      <div className="group/marquee relative w-full overflow-hidden fade-x [--fade-size:8%]">
        <ul className="flex w-max animate-marquee items-center gap-x-14 pr-14 [--marquee-duration:180s] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none]">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <li key={`${brand.name}-${i}`} className="shrink-0" aria-hidden={i >= BRANDS.length}>
              <PlaceholderLogo brand={brand} variant="lockup" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * social-proof-section-3 — the ruled grid: logos aligned in a grid with nothing but thin 1px rules
 * between them (the `bg-border` parent showing through a `gap-px`). No enclosing frame, rounding, or
 * cell fill, so it reads as a minimal lattice rather than a boxed container; the rules stay crisp at
 * any column count as the grid collapses from four columns to two.
 */
export function LogoBorderedGridContent() {
  const swap = useLogoSwap()
  return (
    <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
      {Array.from({ length: LOGO_ROTATE_SLOTS }, (_, i) => (
        <li key={i} className="flex min-h-28 items-center justify-center bg-background p-8">
          <RotatingPlaceholderLogo index={i} swap={swap} />
        </li>
      ))}
    </ul>
  )
}

/**
 * social-proof-section-4 — the split: a left-aligned lede with the headline count carried in
 * tabular figures, beside a borderless two-up grid of logos as the visual. Folds to a single
 * stacked column below the lg breakpoint. The lede lives in the left column, so the registry renders
 * this directly with no outer SectionHeader.
 */
export function LogoSplitContent() {
  const swap = useLogoSwap()
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <SectionHeader align="left">
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            Customers
          </Badge>
          <SectionHeaderHeading>
            Join <span className="tabular-nums">4,100+</span> teams building on Koala UI
          </SectionHeaderHeading>
          <SectionHeaderDescription>
            From seed-stage startups to the Fortune 500, product teams ship on one consistent system.
          </SectionHeaderDescription>
        </SectionHeaderText>
      </SectionHeader>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-8">
        {Array.from({ length: LOGO_ROTATE_SLOTS }, (_, i) => (
          <li key={i}>
            <RotatingPlaceholderLogo index={i} swap={swap} align="start" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * social-proof-section-5 — the bento: the lede, a rotating logo wall, and a featured customer card
 * with a headline stat, combined in one asymmetric grid (a text + logos + image mix). The lede and
 * the media card book-end the wall on lg; everything stacks on a phone. The media card is an image
 * PLACEHOLDER (a fixed dark surface with the stat overlaid, theme-independent so the white overlay
 * always reads) so the section stays dependency-free; drop an <img> behind the overlay for a real
 * case-study photo. The lede lives inside the grid, so the registry renders this with no outer header.
 */
export function LogoBentoContent() {
  const swap = useLogoSwap()
  // The featured customer: pulled from outside the 4 wall slots (which show brands 0-3 and 8-11), so
  // the same logo never appears twice in this section.
  const study: PlaceholderBrand = BRANDS[12]
  const StudyMark = study.Mark

  return (
    // Minimal: no nested fills to tell apart. One hairline frame, 1px gridlines (the frame's
    // bg-border showing through gap-px) carry the structure, and the lone dark media tile is the
    // section's only filled surface, so it reads as the deliberate focal point.
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-6 lg:grid-rows-2">
      {/* Lede: heading + report link, on the plain surface, set off only by the gridlines. */}
      <div className="col-span-2 flex flex-col justify-center bg-background p-6 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:p-8">
        <SectionHeader align="left" size="sm">
          <SectionHeaderText>
            <SectionHeaderHeading>
              Join <span className="tabular-nums">4,100</span> of the most ambitious product teams
            </SectionHeaderHeading>
            <SectionHeaderDescription>
              Teams ship{" "}
              <span className="font-medium text-foreground tabular-nums">4.6×</span> faster on one
              consistent system.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button variant="link" size="sm" className="px-0">
              Read the report <ArrowRight weight="bold" />
            </Button>
          </SectionHeaderActions>
        </SectionHeader>
      </div>

      {/* Rotating logo wall: flat cells on the page surface (fills the center on lg, a 2-up block
          on a phone); the gridlines do the separating, no card fill needed. */}
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex min-h-24 items-center justify-center bg-background">
          <RotatingPlaceholderLogo index={i} swap={swap} />
        </div>
      ))}

      {/* Featured customer card: the one dark image placeholder, with the stat overlaid at the foot. */}
      <div className="relative col-span-2 min-h-56 overflow-hidden bg-black lg:col-span-2 lg:col-start-5 lg:row-span-2 lg:row-start-1">
        {/* A soft top highlight keeps the surface from reading flat; a faint oversized customer
            glyph stands in for photo texture. Both purely decorative. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        <StudyMark
          aria-hidden
          className="pointer-events-none absolute -right-6 -bottom-8 size-44 text-white/[0.06]"
        />
        <div className="relative flex h-full flex-col justify-end gap-1 p-5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
            <StudyMark className="size-4" aria-hidden /> {study.name}
          </span>
          <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">
            128 <span className="text-2xl font-medium text-white/60">hrs</span>
          </p>
          <p className="text-sm text-white/70">Saved every release on UI QA</p>
        </div>
      </div>
    </div>
  )
}

// ── blog-section-1 (Blog index) ─────────────────────────────────────────────────────────────────
// An editorial index: a category filter, one featured lead story, and a responsive grid of article
// cards. Composed from Badge (category tint), Avatar (author), and ToggleGroup (the filter). Images
// are token-agnostic photos; everything else is a semantic token so it re-themes across all four.

export const blogCover = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

export type BlogCategory = "Product" | "Engineering" | "Design" | "Company"

// Category → soft Badge tint. One hue per topic, drawn from the categorical Badge variants so the
// chip re-themes with the rest of the system (memory `soft-badge-strong-text-no-border`).
export const blogTone: Record<BlogCategory, "info" | "purple" | "pink" | "teal"> = {
  Product: "info",
  Engineering: "purple",
  Design: "pink",
  Company: "teal",
}

// Shared title hover: a link-style underline that fades in by transitioning the decoration color
// from transparent to `currentColor` (never the brand fill). It animates smoothly with no layout
// shift, follows each wrapped line natively, and inherits the text color, so the same class works
// on a foreground title and a white-on-image overlay title.
export const blogTitleHover =
  "underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-base ease-out group-hover:decoration-current"

export interface BlogPost {
  slug: string
  category: BlogCategory
  title: string
  excerpt: string
  cover: string
  coverAlt: string
  author: { name: string; img: number; initials: string }
  date: string
  readingTime: string
}

// Index 0 is the featured lead in the "All" view; the rest fill the grid. Every category carries at
// least two stories so a filtered view never collapses to a single lonely card.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "design-system-2600-teams",
    category: "Product",
    title: "How we built a design system 2,600 teams actually ship with",
    excerpt:
      "The principles, the tradeoffs, and the tooling behind a component library that stays consistent as it scales across every product surface.",
    cover: blogCover("1486312338219-ce68d2c6f44d"),
    coverAlt: "Product homepage concept open on a laptop",
    author: { name: "Alex Rivera", img: 13, initials: "AR" },
    date: "Jul 2, 2026",
    readingTime: "8 min read",
  },
  {
    slug: "tokens-that-scale",
    category: "Engineering",
    title: "A token architecture that survives four themes",
    excerpt:
      "Semantic color roles, a single radius knob, and per-theme shadows: how the foundation layer keeps components honest.",
    cover: blogCover("1498050108023-c5249f4df085"),
    coverAlt: "Code editor open on a developer's screen",
    author: { name: "Mei Lin", img: 32, initials: "ML" },
    date: "Jun 24, 2026",
    readingTime: "6 min read",
  },
  {
    slug: "motion-that-feels-right",
    category: "Design",
    title: "Motion that feels right, not just fast",
    excerpt:
      "Our easing and duration tokens, and the small rules (press scale, staggered enters) that make interactions feel considered.",
    cover: blogCover("1467232004584-a241de8bcf5d"),
    coverAlt: "Minimal designer workspace with a laptop",
    author: { name: "Jonas Berg", img: 45, initials: "JB" },
    date: "Jun 17, 2026",
    readingTime: "5 min read",
  },
  {
    slug: "series-b",
    category: "Company",
    title: "We raised our Series B to make good design the default",
    excerpt:
      "What the new chapter means for the roadmap, the team, and the thousands of products already built on Koala.",
    cover: blogCover("1522202176988-66273c2fd55f"),
    coverAlt: "Team collaborating together in an office",
    author: { name: "Priya Nair", img: 24, initials: "PN" },
    date: "Jun 9, 2026",
    readingTime: "4 min read",
  },
  {
    slug: "shipping-density",
    category: "Product",
    title: "One system, two densities: comfortable meets compact",
    excerpt:
      "Why every control carries a density axis, and how the same components dress up for marketing and dress down for dense app UI.",
    cover: blogCover("1519222970733-f546218fa6d7"),
    coverAlt: "Bright workspace with a laptop and notebook",
    author: { name: "Sofia Marchetti", img: 60, initials: "SM" },
    date: "May 30, 2026",
    readingTime: "7 min read",
  },
  {
    slug: "accessibility-radix",
    category: "Engineering",
    title: "Radix-first: why we don't hand-roll focus and ARIA",
    excerpt:
      "Behavior and accessibility come from primitives so we can spend our time on the surface. The exceptions, and why they earn it.",
    cover: blogCover("1504384308090-c894fdcc538d"),
    coverAlt: "Developer reviewing a layout on a screen",
    author: { name: "Daniel Okafor", img: 11, initials: "DO" },
    date: "May 21, 2026",
    readingTime: "6 min read",
  },
  {
    slug: "designing-in-the-open",
    category: "Design",
    title: "Designing in the open with a living Figma library",
    excerpt:
      "Keeping the Figma kit and the React source in lockstep, so what a designer draws is what an engineer ships.",
    cover: blogCover("1531403009284-440f080d1e12"),
    coverAlt: "Modern studio workspace",
    author: { name: "Hana Kim", img: 5, initials: "HK" },
    date: "May 14, 2026",
    readingTime: "5 min read",
  },
  {
    slug: "support-that-scales",
    category: "Company",
    title: "How our team keeps support human at scale",
    excerpt:
      "The rituals and tools behind fast, thoughtful answers, from the first commit all the way to global rollout.",
    cover: blogCover("1517077304055-6e89abbf09b0"),
    coverAlt: "Colleagues collaborating at a desk",
    author: { name: "Tomás Duarte", img: 68, initials: "TD" },
    date: "May 6, 2026",
    readingTime: "4 min read",
  },
]

const BLOG_CATEGORIES = ["All", "Product", "Engineering", "Design", "Company"] as const

function BlogMeta({ post }: { post: BlogPost }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-sm text-muted-foreground">
      <AvatarRoot size="sm">
        <AvatarImage src={`https://i.pravatar.cc/160?img=${post.author.img}`} alt="" />
        <AvatarFallback>{post.author.initials}</AvatarFallback>
      </AvatarRoot>
      <span className="font-medium text-foreground">{post.author.name}</span>
      <span aria-hidden className="text-border">
        &middot;
      </span>
      <time className="tabular-nums">{post.date}</time>
      <span aria-hidden className="text-border">
        &middot;
      </span>
      <span className="tabular-nums">{post.readingTime}</span>
    </div>
  )
}

function BlogFeatured({ post }: { post: BlogPost }) {
  return (
    <a
      href="#"
      className="group grid animate-stagger-in cursor-pointer items-center gap-6 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:gap-8 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-inset ring-foreground/10">
        <img
          src={post.cover}
          alt={post.coverAlt}
          className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col items-start gap-4">
        <Badge variant={blogTone[post.category]}>{post.category}</Badge>
        <h3
          className={`text-2xl font-semibold leading-snug text-balance sm:text-3xl ${blogTitleHover}`}
        >
          {post.title}
        </h3>
        <p className="text-pretty text-muted-foreground">{post.excerpt}</p>
        <BlogMeta post={post} />
      </div>
    </a>
  )
}

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href="#"
      className="group flex animate-stagger-in cursor-pointer flex-col gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-inset ring-foreground/10">
        <img
          src={post.cover}
          alt={post.coverAlt}
          className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-2">
        <Badge variant={blogTone[post.category]}>{post.category}</Badge>
        <h3 className={`text-lg font-semibold leading-snug text-balance ${blogTitleHover}`}>
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{post.excerpt}</p>
        <BlogMeta post={post} />
      </div>
    </a>
  )
}

export function BlogContent() {
  const [active, setActive] = React.useState<string>("All")
  const showFeatured = active === "All"
  const visible = showFeatured ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === active)
  const [featured, ...rest] = visible
  const grid = showFeatured ? rest : visible

  return (
    <div className="flex flex-col gap-12">
      {/* Category filter: single-select pills. Deselecting falls back to "All" so a story is
          always on screen. */}
      <ToggleGroup
        type="single"
        value={active}
        onValueChange={(value) => setActive(value || "All")}
        size="sm"
        className="w-full flex-wrap justify-center gap-2"
        aria-label="Filter articles by category"
      >
        {BLOG_CATEGORIES.map((category) => (
          <ToggleGroupItem key={category} value={category}>
            {category}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Keyed by the active filter so the stagger replays as the set recomposes. */}
      <div key={active} className="flex flex-col gap-12">
        {showFeatured && featured && <BlogFeatured post={featured} />}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((post, i) => (
            <BlogCard key={post.slug} post={post} index={showFeatured ? i + 1 : i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── blog-section-2 (Editorial list) ─────────────────────────────────────────────────────────────
// A minimal, text-forward "latest writing" module: no covers, just divided rows led by the title,
// with a trailing arrow that slides in on hover. Drops cleanly under a hero or on an about page.

function BlogListRow({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href="#"
      style={{ animationDelay: `${index * 60}ms` }}
      className="group flex animate-stagger-in flex-col items-start gap-3 py-7 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset sm:grid sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-10"
    >
      <div className="flex flex-col items-start gap-2.5">
        <Badge variant={blogTone[post.category]} size="sm">
          {post.category}
        </Badge>
        <h3 className={`text-xl font-semibold leading-snug text-balance ${blogTitleHover}`}>
          {post.title}
        </h3>
        <p className="max-w-2xl text-pretty text-muted-foreground">{post.excerpt}</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <AvatarRoot size="xs">
            <AvatarImage src={`https://i.pravatar.cc/160?img=${post.author.img}`} alt="" />
            <AvatarFallback>{post.author.initials}</AvatarFallback>
          </AvatarRoot>
          <span className="font-medium text-foreground">{post.author.name}</span>
        </div>
      </div>
      <time className="shrink-0 text-sm text-muted-foreground tabular-nums">{post.date}</time>
    </a>
  )
}

export function BlogEditorialContent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col divide-y divide-border">
      {BLOG_POSTS.map((post, i) => (
        <BlogListRow key={post.slug} post={post} index={i} />
      ))}
    </div>
  )
}

// ── blog-section-3 (Featured + latest rail) ─────────────────────────────────────────────────────
// A homepage blog module: one large lead story beside a compact "Latest" rail of thumbnail rows.
// Stacks the rail under the lead on mobile.

export function BlogSidebarContent() {
  const [lead, ...rest] = BLOG_POSTS
  const latest = rest.slice(0, 4)
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
      {/* Lead story, stacked (image over text) so it fits the wider column. */}
      <a
        href="#"
        className="group flex animate-stagger-in cursor-pointer flex-col gap-5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-inset ring-foreground/10">
          <img
            src={lead.cover}
            alt={lead.coverAlt}
            className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-col items-start gap-3">
          <Badge variant={blogTone[lead.category]}>{lead.category}</Badge>
          <h3
            className={`text-2xl font-semibold leading-snug text-balance sm:text-3xl ${blogTitleHover}`}
          >
            {lead.title}
          </h3>
          <p className="text-pretty text-muted-foreground">{lead.excerpt}</p>
          <BlogMeta post={lead} />
        </div>
      </a>

      {/* Latest rail: compact thumbnail rows. */}
      <div className="flex flex-col divide-y divide-border">
        {latest.map((post, i) => (
            <a
              key={post.slug}
              href="#"
              className="group flex animate-stagger-in cursor-pointer items-start gap-4 py-4 outline-none first:pt-0 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
              style={{ animationDelay: `${(i + 1) * 70}ms` }}
            >
              <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-foreground/10">
                <img
                  src={post.cover}
                  alt={post.coverAlt}
                  className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <Badge variant={blogTone[post.category]} size="sm">
                  {post.category}
                </Badge>
                <h3
                  className={`line-clamp-2 text-sm font-semibold leading-snug ${blogTitleHover}`}
                >
                  {post.title}
                </h3>
                <time className="text-xs text-muted-foreground tabular-nums">{post.date}</time>
              </div>
            </a>
          ))}
      </div>
    </div>
  )
}

// ── blog-section-4 (Overlay magazine grid) ──────────────────────────────────────────────────────
// A punchy, image-led index: each card is a photo with a dark scrim and the title + byline laid
// over it. A category-colored dot rides a solid (never backdrop-blurred) chip so it survives the
// opacity-0 stagger enter (memory `backdrop-blur-leaks-through-opacity-0`).

const blogDot: Record<BlogCategory, string> = {
  Product: "bg-info",
  Engineering: "bg-purple",
  Design: "bg-pink",
  Company: "bg-teal",
}

function BlogOverlayCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href="#"
      className="group relative flex aspect-[4/5] animate-stagger-in cursor-pointer flex-col justify-end overflow-hidden rounded-2xl text-white outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <img
        src={post.cover}
        alt={post.coverAlt}
        className="absolute inset-0 size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.04]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5"
      />
      {/* image outline as its own overlay so the card's focus ring stays a clean offset ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
      />
      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
        <span className={`size-1.5 rounded-full ${blogDot[post.category]}`} />
        {post.category}
      </span>
      <div className="relative flex flex-col gap-3 p-5">
        <h3 className={`text-lg font-semibold leading-snug text-balance ${blogTitleHover}`}>
          {post.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
          <AvatarRoot size="xs">
            <AvatarImage src={`https://i.pravatar.cc/160?img=${post.author.img}`} alt="" />
            <AvatarFallback>{post.author.initials}</AvatarFallback>
          </AvatarRoot>
          <span className="font-medium text-white">{post.author.name}</span>
          <span aria-hidden className="text-white/40">
            &middot;
          </span>
          <time className="tabular-nums">{post.date}</time>
        </div>
      </div>
    </a>
  )
}

export function BlogOverlayContent() {
  const [active, setActive] = React.useState<string>("All")
  const visible = active === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === active)
  return (
    <div className="flex flex-col gap-12">
      <ToggleGroup
        type="single"
        value={active}
        onValueChange={(value) => setActive(value || "All")}
        size="sm"
        className="w-full flex-wrap justify-center gap-2"
        aria-label="Filter articles by category"
      >
        {BLOG_CATEGORIES.map((category) => (
          <ToggleGroupItem key={category} value={category}>
            {category}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div key={active} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post, i) => (
          <BlogOverlayCard key={post.slug} post={post} index={i} />
        ))}
      </div>
    </div>
  )
}

// ── blog-section-5 (Minimal archive list) ──────────────────────────────────────────────────────
// The barest writing index: no covers, no filter, no bylines. Each post leads with its date on an
// outline pill, then a bold title (with the shared underline-on-hover) and a one-line excerpt, split
// by hairline dividers. A narrow centered column, ideal as a "latest writing" block under a hero.

export function BlogNotesContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border">
      {BLOG_POSTS.map((post, i) => (
        <a
          key={post.slug}
          href="#"
          className="group flex animate-stagger-in cursor-pointer flex-col items-start gap-3.5 py-8 outline-none first:pt-0 last:pb-0 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <Badge variant="outline" size="lg" className="tabular-nums">
            {post.date}
          </Badge>
          <div className="flex flex-col gap-2">
            <h3 className={`text-xl font-semibold text-balance ${blogTitleHover}`}>{post.title}</h3>
            <p className="text-pretty text-muted-foreground">{post.excerpt}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
