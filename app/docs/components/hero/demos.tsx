"use client"

import Image from "next/image"
import { Lock } from "@phosphor-icons/react"

import {
  RotatingPlaceholderLogo,
  useLogoSwap,
} from "@/components/docs/placeholder-logos"
import {
  Hero,
  HeroContent,
  HeroColumn,
  HeroEyebrow,
  HeroTitle,
  HeroHighlight,
  HeroSubtitle,
  HeroActions,
  HeroFeatures,
  HeroFeature,
  HeroSocialProof,
  HeroRating,
  HeroMedia,
  HeroBackground,
} from "@/components/ui/hero"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Tooltip } from "@/components/ui/tooltip"

// Marketing-section heroes show real headshots. We serve them from the Unsplash CDN (the same
// image host this file already uses for the room shots) with a square face crop, NOT pravatar:
// the hero *family* page mounts three heroes at once (~14 avatars), and pravatar rate-limits that
// burst and 503s, so a chunk of the stack fell back to the colored initials chip. Unsplash holds
// under the same load, so every face resolves to a photo. The colored `color` + initials stay as
// the fallback so a failed image still lands on a colored chip, never gray, in the same
// stride-mixed order as the landing hero's fallback stack.
const FACE_CROP = "q=80&w=160&h=160&auto=format&fit=crop&crop=faces"
const FACES = [
  { initials: "AR", name: "Ana Ruiz", color: "brand", photo: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${FACE_CROP}` },
  { initials: "PN", name: "Pedro Núñez", color: "purple", photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${FACE_CROP}` },
  { initials: "TB", name: "Tom Becker", color: "teal", photo: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?${FACE_CROP}` },
  { initials: "ML", name: "María López", color: "orange", photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${FACE_CROP}` },
  { initials: "DO", name: "Diego Ortega", color: "pink", photo: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?${FACE_CROP}` },
  { initials: "JS", name: "Julia Santos", color: "brand", photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?${FACE_CROP}` },
] as const

export function HeroDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent>
        <Badge variant="orange" dot pill>
          Koala UI v1.0 is here
        </Badge>

        <HeroTitle>A design system built to feel finished</HeroTitle>

        <HeroSubtitle>
          89 accessible React components and four themes, with the real source copied straight
          into your repo. Assemble production screens in an afternoon, not a sprint.
        </HeroSubtitle>

        <HeroActions>
          <Button size="md">Buy once, use forever</Button>
          <Button size="md" variant="outline">Get the Figma kit</Button>
          <Button size="md" variant="outline">Browse the docs</Button>
        </HeroActions>

        <HeroFeatures>
          <HeroFeature>89 accessible components</HeroFeature>
          <HeroFeature>Light, dark, cream &amp; moonlight themes</HeroFeature>
          <HeroFeature>Own every line of source</HeroFeature>
          <HeroFeature>New components every month</HeroFeature>
          <HeroFeature>Responsive, typed by default</HeroFeature>
          <HeroFeature>Never start from a blank file</HeroFeature>
        </HeroFeatures>

        <HeroSocialProof>
          <AvatarGroup size="sm">
            {FACES.map(({ initials, name, color, photo }) => (
              <Tooltip key={initials} content={name}>
                <AvatarRoot size="sm" color={color}>
                  <AvatarImage src={photo} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </AvatarRoot>
              </Tooltip>
            ))}
          </AvatarGroup>
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-balance text-sm font-medium text-muted-foreground">
              +11,300 builders have joined already
            </span>
            <HeroRating>
              <span className="font-medium text-muted-foreground">4.8/5 average rating</span>
            </HeroRating>
          </div>
        </HeroSocialProof>
      </HeroContent>
    </Hero>
  )
}

export function HeroMinimalDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="py-16 sm:py-20">
        <Badge variant="info" dot pill>
          New: Koala UI for React
        </Badge>
        <HeroTitle>Build polished products, faster</HeroTitle>
        <HeroSubtitle>
          A production-ready component library you can install with one command and own
          forever.
        </HeroSubtitle>
        <HeroActions>
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            Browse components
          </Button>
        </HeroActions>
      </HeroContent>
    </Hero>
  )
}

// A lean hero that shows the rotating highlight on its own (no media/social proof), so the docs page
// can isolate the behavior. The keyword wash hugs each phrase, tweening its width as the word
// swaps; `leading-[1.2]` keeps the wash off the line above it.
const ROTATING_PHRASES = ["every decision", "every workflow", "every release", "every roadmap"]

export function HeroRotatingDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="py-16 sm:py-20">
        <Badge variant="orange" dot pill>
          Koala UI v1.0 is here
        </Badge>
        <HeroTitle className="max-w-3xl leading-[1.2]">
          Bring your product into <HeroHighlight rotate={ROTATING_PHRASES}>every decision</HeroHighlight>
        </HeroTitle>
        <HeroSubtitle>
          The highlight wash hugs each word, resizing as it rotates, paints each phrase in its own
          color, and the letters arrive with a per-character stagger, so the headline stays alive on
          its own.
        </HeroSubtitle>
        <HeroActions>
          <Button size="lg">Start for free</Button>
          <Button size="lg" variant="outline">
            Book a demo
          </Button>
        </HeroActions>
      </HeroContent>
    </Hero>
  )
}

/* ───────────────────────────────── shared media ─────────────────────────────────────────────── */

// The product-shot slot that anchors the spotlight and split heroes: "Russafa" by Claudio Schwarz
// (Unsplash, photo 19q8mjvlumM), the same media the Pro success screen uses. A plain `<img>` covers
// the slot; swap the `src` for your own screenshot. `rounded-2xl border` frames it and the aspect
// ratio reserves the layout footprint so the column never collapses.
const HERO_MEDIA_IMAGE =
  "https://images.unsplash.com/photo-1719658414944-e4ba1c6a340a?q=80&w=1600&auto=format&fit=crop"

// The trusted-by strip in the spotlight hero: full-color logo lockups in hue-interleaved order (not a
// run of reds then oranges) that rotate on the shared logo-swap timer, the same directional roll as
// the social-proof walls. Six slots stay under LOGO_ROTATE_SLOTS (8), so no brand shows twice.
const HERO_ROW_SLOTS = 6

/** A horizontal trusted-by strip of colored logo lockups for the spotlight hero; each slot rolls
 *  through the placeholder set on the shared swap counter. */
function HeroLogoRow({ label }: { label?: string }) {
  const swap = useLogoSwap()
  return (
    <div className="flex w-full flex-col items-center gap-5">
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {Array.from({ length: HERO_ROW_SLOTS }, (_, i) => (
          <RotatingPlaceholderLogo key={i} index={i} swap={swap} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────── hero-section-3 (Spotlight) ──────────────────────────────────── */

// The rotating keyword cycles the spotlight headline through a wash that hugs each phrase. All
// phrases lead with "every " so the left edge stays put behind "into"; the right edge resizes.
const SPOTLIGHT_PHRASES = ["every decision", "every workflow", "every release", "every roadmap"]

/**
 * Centered, product-led hero (Dovetail / Craft pattern): an announcement eyebrow, a headline with a
 * highlighted keyword, a CTA pair, a trusted-by logo strip, and an image placeholder anchored below.
 * The keyword is a rotating zone: `leading-[1.2]` opens the line so the wash clears the line above.
 */
export function HeroSpotlightDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-5xl gap-8">
        <Badge variant="orange" dot pill>
          Koala UI v1.0 is here
        </Badge>

        <HeroTitle className="max-w-3xl leading-[1.2]">
          Bring your product into <HeroHighlight rotate={SPOTLIGHT_PHRASES}>every decision</HeroHighlight>
        </HeroTitle>

        <HeroSubtitle>
          The component library and design tokens behind fast-moving product teams. Ship polished,
          accessible interfaces from the very first commit.
        </HeroSubtitle>

        <HeroActions>
          <Button size="lg">Start for free</Button>
          <Button size="lg" variant="outline">
            Book a demo
          </Button>
        </HeroActions>

        <HeroLogoRow label="Trusted by teams at" />

        <HeroMedia className="mx-auto mt-6 max-w-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- demo product shot; swap for next/Image */}
          <img
            src={HERO_MEDIA_IMAGE}
            alt=""
            className="aspect-video w-full rounded-2xl border border-border object-cover"
          />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ──────────────────────────────── hero-section-4 (Split) ─────────────────────────────────────── */

/**
 * Two-column hero (Clay / ClickUp / Lyssna pattern): a left-aligned copy column (eyebrow, headline,
 * subtitle, CTA pair, social proof) beside an image placeholder. Folds to a single stacked column
 * below the lg breakpoint.
 */
export function HeroSplitDemo() {
  return (
    <Hero layout="split" className="rounded-lg">
      <HeroContent>
        <HeroColumn>
          <Badge variant="info" dot pill>
            Now in public beta
          </Badge>

          <HeroTitle>Analytics your whole team actually uses</HeroTitle>

          <HeroSubtitle className="max-w-xl">
            Real-time dashboards with no setup. Connect a source and watch the numbers land in
            seconds, on every device.
          </HeroSubtitle>

          <HeroActions>
            <Button size="lg">Get started</Button>
            <Button size="lg" variant="outline">
              Live demo
            </Button>
          </HeroActions>

          <HeroSocialProof className="pt-2">
            <AvatarGroup size="sm">
              {FACES.slice(0, 4).map(({ initials, name, color, photo }) => (
                <Tooltip key={initials} content={name}>
                  <AvatarRoot size="sm" color={color}>
                    <AvatarImage src={photo} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </AvatarRoot>
                </Tooltip>
              ))}
            </AvatarGroup>
            <HeroRating>
              <span className="font-medium text-muted-foreground">Loved by 2,000+ teams</span>
            </HeroRating>
          </HeroSocialProof>
        </HeroColumn>

        <HeroMedia>
          {/* eslint-disable-next-line @next/next/no-img-element -- demo product shot; swap for next/Image */}
          <img
            src={HERO_MEDIA_IMAGE}
            alt=""
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
          />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ────────────────────── hero-section-9 (Full-screen split, 100svw x 100svh) ──────────────────── */

// A warm interior shot for the full-bleed split hero (Unsplash). Unlike the contained split, the
// photo bleeds to the section's top / right / bottom edges, covering its whole grid cell with no
// frame; swap the src for your own lifestyle or product photo.
const HERO_INTERIOR_IMAGE =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop"

/**
 * Full-bleed two-column hero (the editorial "billboard" split): a bottom-anchored copy column on a
 * plain background beside a photo that bleeds to the section's own edges (no frame, no gutter), so
 * the two halves read as one slab. Distinct from the contained split (hero-section-4), whose media
 * is a rounded, inset card. The eyebrow is an announcement pill carrying an inline "what's new" link.
 * Stacks to copy-over-photo below the lg breakpoint. Composes the Hero root + parts around a plain
 * grid: the connective tissue that lets the media bleed while the copy keeps its gutter.
 */
export function HeroSplitBleedDemo() {
  return (
    // Full-viewport split: the section fills the screen (100svw is the Hero root's own `w-full`; 100svh
    // comes from `min-h-svh`, dropped in favor of no `rounded-lg` so it bleeds edge to edge) and cuts
    // down the middle: copy on one half, photo on the other. On mobile the two halves stack into a
    // full-height column (`grid-rows-[auto_1fr]`, copy over a photo that fills the rest); at `lg` they
    // sit side by side, 50/50 (`lg:grid-cols-2 lg:grid-rows-1`), each column the full `min-h-svh` tall.
    <Hero layout="split">
      <div className="grid min-h-svh grid-rows-[auto_1fr] items-stretch lg:grid-cols-2 lg:grid-rows-1">
        <HeroColumn className="justify-end px-8 py-12 sm:px-12 lg:px-16 lg:py-20">
          {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
          <Badge variant="success" dot pill>
            New collection
          </Badge>

          <HeroTitle>Design made to feel like home</HeroTitle>

          <HeroSubtitle className="max-w-md text-base">
            We bring your interior dreams to life with personalized designs that reflect your style
            and personality.
          </HeroSubtitle>

          <HeroActions className="pt-2">
            <Button size="md">Explore features</Button>
            <Button size="md" variant="outline">
              Sign up
            </Button>
          </HeroActions>
        </HeroColumn>

        <div className="relative min-h-64 sm:min-h-80 lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- demo lifestyle shot; swap for next/Image */}
          <img src={HERO_INTERIOR_IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
    </Hero>
  )
}

/* ─────────────────────── hero-section-13 (Centered + photo collage) ──────────────────────────── */

// A warm interior-design collage under the centered copy (real room photos on Unsplash): two tall
// side images framing a stacked pair in the middle, the "look book" wall the reference hero opens
// with. Each is a plain <img> covering its grid cell; swap the `src`s for your own lifestyle shots
// at a similar portrait / landscape mix. `?w=` is sized to the cell so the collage stays crisp.
const HERO_COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=900&auto=format&fit=crop",
    alt: "Sunlit bedroom with linen bedding",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
    alt: "Living room with a soft sofa and layered cushions",
  },
  {
    src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop",
    alt: "Reading corner with plants and warm light",
  },
  {
    src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=900&auto=format&fit=crop",
    alt: "Open living room bathed in daylight",
  },
] as const

// Per-cell placement from the `sm` breakpoint up: the two side images (0, 3) span both rows so they
// read tall, and the middle column stacks the pair (1, 2). Below `sm` these don't apply, so the four
// photos auto-flow into a clean 2×2 grid. Kept out of the map so the class strings stay static (fully
// spelled out) and Tailwind can see them.
const HERO_COLLAGE_CELL = [
  "sm:col-start-1 sm:row-span-2 sm:row-start-1",
  "sm:col-start-2 sm:row-start-1",
  "sm:col-start-2 sm:row-start-2",
  "sm:col-start-3 sm:row-span-2 sm:row-start-1",
] as const

/**
 * hero-section-13 — Centered hero over a photo collage (the interior / lifestyle "look book"
 * pattern): the same centered copy stack as hero-section-1 (an announcement pill carrying an inline
 * "what's new" link, a balanced headline, a subtitle, and a text-only CTA pair), anchored above a
 * masonry wall of four room photos. Two tall side images frame a stacked pair in the middle, on a
 * fixed-height grid so the block always reads balanced; it folds to a clean 2×2 below the sm
 * breakpoint. Distinct from the product heroes (a single screenshot or device) and the full-bleed
 * media heroes (copy over one photo): here the visual is a warm, editorial collage of real rooms.
 */
export function HeroCollageDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-6xl gap-8">
        {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
        <Badge variant="success" dot pill>
          New collection
        </Badge>

        <HeroTitle className="max-w-2xl">Design made to feel like home</HeroTitle>

        <HeroSubtitle className="max-w-xl">
          We bring your interior dreams to life with personalized designs that reflect your style and
          personality.
        </HeroSubtitle>

        <HeroActions>
          <Button size="md">Explore features</Button>
          <Button size="md" variant="outline">
            Sign up
          </Button>
        </HeroActions>

        <HeroMedia className="mt-6 w-full max-w-6xl">
          {/* Masonry collage: a fixed-height grid so the side images always line up with the stacked
              pair. Below sm the four photos auto-flow into a 2×2; from sm up they take the three-column
              layout via HERO_COLLAGE_CELL. `ring-inset` is the image-outline hairline (crisp edge in
              every theme); `rounded-2xl` matches the surrounding card radius. */}
          <div className="grid h-[26rem] grid-cols-2 grid-rows-2 gap-3 sm:h-[30rem] sm:grid-cols-3 sm:gap-4 lg:h-[34rem]">
            {HERO_COLLAGE.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- demo lifestyle shots; swap for next/Image
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                className={`size-full rounded-2xl object-cover ring-1 ring-inset ring-border ${HERO_COLLAGE_CELL[i]}`}
              />
            ))}
          </div>
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ─────────────────────── hero-section-14 (Centered + two-photo row) ──────────────────────────── */

// Two large room photos side by side under the centered copy: a wider, near-square frame beside a
// taller portrait one, both the same height so the pair reads as one balanced band. Swap the `src`s
// for your own lifestyle shots; `object-cover` handles any crop.
const HERO_PAIR = [
  {
    src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1400&auto=format&fit=crop",
    alt: "Warm modern living and dining room in daylight",
  },
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1100&auto=format&fit=crop",
    alt: "Living room with a green sectional sofa",
  },
] as const

/**
 * hero-section-14 — Centered hero over a two-photo row: the same centered copy stack as
 * hero-section-13 (an announcement pill with an inline "what's new" link, a balanced headline, a
 * subtitle, and a text-only CTA pair) anchored above a pair of large room photos: a wider,
 * near-square frame beside a taller portrait one, on a fixed-height grid so both share one baseline.
 * It stacks the two photos below the sm breakpoint. The quieter, editorial sibling of the four-photo
 * collage (hero-section-13): fewer, larger frames that let each room breathe.
 */
export function HeroPhotoPairDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-6xl gap-8">
        {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
        <Badge variant="success" dot pill>
          New collection
        </Badge>

        <HeroTitle className="max-w-2xl">Design made to feel like home</HeroTitle>

        <HeroSubtitle className="max-w-xl">
          We bring your interior dreams to life with personalized designs that reflect your style and
          personality.
        </HeroSubtitle>

        <HeroActions>
          <Button size="md">Explore features</Button>
          <Button size="md" variant="outline">
            Sign up
          </Button>
        </HeroActions>

        <HeroMedia className="mt-6 w-full max-w-6xl">
          {/* Two-photo row: stacked below sm, side by side from sm up on a fixed-height grid so the
              wider left frame and the taller right frame share one baseline. The 1.7fr : 1fr split
              keeps the left image near-square and the right one portrait, echoing the reference.
              `ring-inset` is the image-outline hairline; `rounded-2xl` matches the card radius. */}
          <div className="grid h-[30rem] grid-cols-1 grid-rows-2 gap-4 sm:h-[32rem] sm:grid-cols-[1.7fr_1fr] sm:grid-rows-1 lg:h-[38rem]">
            {HERO_PAIR.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element -- demo lifestyle shots; swap for next/Image
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                className="size-full rounded-2xl object-cover ring-1 ring-inset ring-border"
              />
            ))}
          </div>
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ───────────────────────── hero-section-15 (Left copy + photo marquee) ───────────────────────── */

// A warm interior / lifestyle set for the marquee strip (real rooms + people on Unsplash). Each is a
// plain <img> cropped to a portrait tile; swap the src's for your own look-book shots at a similar
// mix. `?w=` is sized to the tile so the strip stays crisp as it drifts.
const HERO_MARQUEE_PHOTOS = [
  { src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600&auto=format&fit=crop", alt: "Sunlit bedroom with linen bedding" },
  { src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop", alt: "Living room with a soft sofa and layered cushions" },
  { src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop", alt: "A design team collaborating in a bright studio" },
  { src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop", alt: "Reading corner with plants and warm light" },
  { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop", alt: "Open living room bathed in daylight" },
  { src: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop", alt: "Warm, styled interior nook" },
] as const

/**
 * hero-section-15 — Left copy over a full-bleed photo marquee (the interior / lifestyle "look book"
 * pattern, in motion): the same announcement pill, balanced headline, subtitle, and text-only CTA
 * pair as the collage / photo-pair heroes, but left-aligned in the gutter, over an edge-to-edge strip
 * of room photos that drifts sideways on the shared `--animate-marquee` loop. The track is duplicated
 * so the loop is seamless (the second copy is `aria-hidden`), `fade-x` softens both ends into the
 * page, it pauses on hover, and it holds still under `prefers-reduced-motion`. `layout="split"` is
 * borrowed only to left-align the copy parts (not for the two-column grid). Registered `bleed` so the
 * strip runs full-bleed while the copy keeps the site gutter; owns its own top/bottom rhythm.
 */
export function HeroMarqueeDemo() {
  return (
    <Hero layout="split">
      {/* Copy keeps the site gutter (max-w-8xl + px), left-aligned; the strip below runs full-bleed. */}
      <div className="mx-auto w-full max-w-8xl px-6 pb-14 pt-12 sm:px-8 sm:pt-16">
        <HeroColumn className="max-w-2xl">
          {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
          <Badge variant="success" dot pill>
            New collection
          </Badge>

          <HeroTitle>Design made to feel like home</HeroTitle>

          <HeroSubtitle className="max-w-md text-base">
            We bring your interior dreams to life with personalized designs that reflect your style
            and personality.
          </HeroSubtitle>

          <HeroActions className="pt-2">
            <Button size="md">Explore features</Button>
            <Button size="md" variant="outline">
              Sign up
            </Button>
          </HeroActions>
        </HeroColumn>
      </div>

      {/* Full-bleed photo marquee: the outer wrapper carries the seam clip + edge fade + hover pause;
          the track is `w-max` with two copies of the set so shifting it -50% (the --animate-marquee
          keyframe) loops with no seam. `pr` matches the `gap` so the spacing across the seam stays
          uniform. Images are decorative (the headline carries the meaning), so the duplicate track is
          `alt=""`. */}
      <div className="pb-16 sm:pb-24">
        <div className="group/marquee relative w-full overflow-hidden fade-x [--fade-size:10%]">
          <ul className="flex w-max animate-marquee items-center gap-4 pr-4 [--marquee-duration:60s] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none] sm:gap-5 sm:pr-5">
            {[...HERO_MARQUEE_PHOTOS, ...HERO_MARQUEE_PHOTOS].map((photo, i) => (
              <li key={i} className="shrink-0" aria-hidden={i >= HERO_MARQUEE_PHOTOS.length}>
                {/* eslint-disable-next-line @next/next/no-img-element -- demo look-book shot; swap for next/Image */}
                <img
                  src={photo.src}
                  alt={i < HERO_MARQUEE_PHOTOS.length ? photo.alt : ""}
                  className="h-72 w-56 rounded-2xl object-cover ring-1 ring-inset ring-border sm:h-80 sm:w-64 lg:h-[26rem] lg:w-80"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Hero>
  )
}

/* ──────────────────── hero-section-16 (Brand-tile headline + logos + photo row) ──────────────── */

// The three-photo row under the copy (real rooms on Unsplash): a bedroom, a dining nook, and a
// shelf-lined reading corner, all the same portrait tile so the row reads as one balanced band. Each
// is a plain <img> covering its cell; swap the src's for your own look-book shots.
const HERO_TRIO = [
  { src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop", alt: "Sunlit bedroom with a linen headboard and bedside lamp" },
  { src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop", alt: "Dining nook with a wooden table, black chairs, and plants" },
  { src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800&auto=format&fit=crop", alt: "Reading corner with warm wood shelves and a leather sofa" },
] as const

/**
 * hero-section-16 — Brand-tile headline hero: a centered copy stack whose headline ENDS in the Koala
 * mark, the canonical BrandMark tile (`/koala-logo.webp`) dropped inline at cap height so the finished
 * logo reads as the last "word" (never a hand-rolled glyph, per the DS rule). Below it a stacked pair
 * of equal-width CTAs, then a rotating trusted-by logo strip (the shared `useLogoSwap` roll, reused
 * from the spotlight hero), then a three-photo row of rooms. The playful, brand-forward sibling of the
 * collage / photo-pair heroes: the mark carries the personality, the photos carry the proof.
 */
export function HeroBrandTileDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-3xl gap-8">
        {/* Eyebrow: the canonical dot+pill Badge, the same lede eyebrow as SectionHeader. */}
        <Badge variant="success" dot pill>
          New collection
        </Badge>

        {/* The headline resolves into the brand mark: the koala tile stands in for the last word, so
            the finished logo IS the punchline. `leading-[1.15]` opens the line so the taller tile
            never crowds the line above; `alt="Koala"` lets the headline still read end-to-end. */}
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
          We bring your interior dreams to life with personalized designs that reflect your style and
          personality.
        </HeroSubtitle>

        {/* Stacked, equal-width CTAs (not the side-by-side row): a capped column so both buttons span
            the same width, the brand primary over the outline. */}
        <HeroActions className="w-full max-w-sm flex-col">
          <Button size="lg" className="w-full">
            Get started
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            Explore features
          </Button>
        </HeroActions>

        {/* Trusted-by strip: the shared rotating logo row (colored lockups, hue-interleaved), no
            label, sitting between the CTAs and the photo band. */}
        <HeroLogoRow />

        {/* Three-photo row: one portrait tile per room, side by side from sm up, stacked below it. */}
        <HeroMedia className="mt-4 w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {HERO_TRIO.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element -- demo lifestyle shots; swap for next/Image
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-inset ring-border"
              />
            ))}
          </div>
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ─────────────────────────── hero-section-8 (Product mockup) ─────────────────────────────────── */

/**
 * A framed browser-window mockup: the product-shot slot for the mockup hero. Concentric radius, a
 * `rounded-2xl` card shell (p-1.5) over a `rounded-xl` window, so the window nests inside the frame
 * instead of sharing its edge. A chrome bar carries three monochrome window dots and an address pill
 * (optically centered via a 3-column grid so the dots don't push it off-center), then the screenshot
 * fills the body. Monochrome dots (not the skeuomorphic red/amber/green) keep the frame calm and let
 * it re-theme across all four themes. Swap the `<img>` src for your own product shot.
 */
function ProductWindow() {
  return (
    <div className="rounded-2xl border border-border bg-card p-1.5 shadow-xl">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-muted-foreground/25" />
            <span className="size-3 rounded-full bg-muted-foreground/25" />
            <span className="size-3 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
            <Lock aria-hidden className="size-3" />
            app.koala.com
          </div>
          <div aria-hidden />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- demo product shot; swap for next/Image */}
        <img src={HERO_MEDIA_IMAGE} alt="" className="aspect-video w-full object-cover" />
      </div>
    </div>
  )
}

/**
 * Centered product-mockup hero (Linear / Vercel / Framer pattern): an announcement eyebrow, a
 * headline with a static highlighted keyword, a subtitle, a text-only CTA pair with a reassurance
 * line hugging it, and a framed browser-window mockup anchored below as the visual centerpiece. Like
 * feature-section-2's video showcase, the mockup gets a concentric-radius frame with a soft shadow so
 * it lifts off the band; unlike the spotlight hero it drops the rotating headline and logo strip and
 * lets the product shot carry the section.
 */
export function HeroMockupDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-5xl gap-8">
        <Badge variant="purple" dot pill>
          Koala UI v1.0 is here
        </Badge>

        <HeroTitle className="max-w-3xl">
          Ship your next product in a <HeroHighlight>weekend</HeroHighlight>
        </HeroTitle>

        <HeroSubtitle>
          A production-ready design system with everything wired up. Drop in polished components,
          own the source, and launch faster than you thought possible.
        </HeroSubtitle>

        <div className="flex flex-col items-center gap-3">
          <HeroActions>
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">
              Book a demo
            </Button>
          </HeroActions>
          <p className="text-sm text-muted-foreground">No credit card required. Cancel anytime.</p>
        </div>

        <HeroMedia className="mt-6 w-full max-w-5xl">
          <ProductWindow />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/* ──────────────────── hero-section-6 / -7 (full-bleed background media) ───────────────────────── */

// Calm, low-contrast landscapes (Unsplash) and an openly-licensed alpine clip (Mixkit, no
// attribution) so the previews render with no bundled project assets. Swap each `src` for your own
// media; the `<img>`/`<video>` only needs to cover, which `HeroBackground` handles.
const MOUNTAIN_PHOTO =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80"
const ALPINE_VIDEO = "https://assets.mixkit.co/videos/4283/4283-720.mp4"
const ALPINE_POSTER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80"

// A small static dot for the glassy announcement pill: no pulse, so the over-media eyebrow stays as
// calm as the rest of the composition.
function HeroEyebrowDot() {
  return <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-white" />
}

// A monochrome trusted-by row for the photo hero: the shared placeholder set rendered with `mono` so
// symbol and wordmark inherit one ink, then tinted `text-white/70` so the wall reads as a quiet row
// over the scrim instead of a clash of brand hues. Each slot rotates on the shared swap timer (the
// same roll as the social-proof walls); five slots stay under LOGO_ROTATE_SLOTS (8), so no repeats.
const OVERLAY_SLOTS = 5

function HeroOverlayLogos() {
  const swap = useLogoSwap()
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/70">
      {Array.from({ length: OVERLAY_SLOTS }, (_, i) => (
        <RotatingPlaceholderLogo key={i} index={i} swap={swap} mono />
      ))}
    </div>
  )
}

/**
 * Full-bleed photo hero (Giga / Cluely pattern): a calm landscape fills the band while a scrim
 * carries the white copy and a monochrome trusted-by row closes it. `layout="background"` flips the
 * text and eyebrow for media; `HeroBackground` covers and scrims the photo. `alt=""` because the
 * photo is decorative (the headline carries the meaning).
 */
export function HeroImageDemo() {
  return (
    <Hero layout="background" className="rounded-lg">
      <HeroBackground>
        {/* eslint-disable-next-line @next/next/no-img-element -- demo backdrop; swap for next/Image */}
        <img src={MOUNTAIN_PHOTO} alt="" />
      </HeroBackground>
      <HeroContent>
        <HeroEyebrow>
          <HeroEyebrowDot />
          Series A: $61M to scale support
        </HeroEyebrow>
        <HeroTitle>AI that talks like a human. Handles millions of calls.</HeroTitle>
        <HeroSubtitle>AI agents for enterprise support.</HeroSubtitle>
        <HeroActions>
          <Button size="lg">Talk to us</Button>
        </HeroActions>
        <HeroOverlayLogos />
      </HeroContent>
    </Hero>
  )
}

/**
 * Full-bleed video hero: an autoplay, muted, looping clip drifts behind the copy; the poster holds
 * the same frame so the band never flashes empty, and a still fallback takes over under
 * `prefers-reduced-motion`. Muted autoplay is the only kind browsers allow unprompted, so the clip
 * stays purely ambient.
 */
export function HeroVideoDemo() {
  return (
    <Hero layout="background" className="rounded-lg">
      <HeroBackground>
        <video
          className="motion-reduce:hidden"
          src={ALPINE_VIDEO}
          poster={ALPINE_POSTER}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
        {/* Reduced-motion: drop the moving clip for its still poster. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- demo backdrop; swap for next/Image */}
        <img className="hidden motion-reduce:block" src={ALPINE_POSTER} alt="" />
      </HeroBackground>
      <HeroContent>
        <HeroEyebrow>
          <HeroEyebrowDot />
          Now in private beta
        </HeroEyebrow>
        <HeroTitle>Support that never sleeps</HeroTitle>
        <HeroSubtitle>
          AI agents pick up every call, answer in seconds, and hand off to your team only when it
          matters.
        </HeroSubtitle>
        <HeroActions>
          <Button size="lg">Get started</Button>
        </HeroActions>
      </HeroContent>
    </Hero>
  )
}

/* ─────────────── hero-section-10 / -11 / -12 (realistic device mockups) ──────────────────────── */

// Finished device renders in /public/devices: transparent PNGs with the bezel and a soft drop shadow
// baked in, so each one IS the visual. A plain <img> floats it on the band with no extra frame or
// shadow (unlike the product-mockup hero, which hand-rolls a browser chrome). The intrinsic pixel
// sizes are passed as width/height so the slab reserves the space and never shifts as the render
// decodes. Swap each src for your own device shot at the same aspect ratio.
const DEVICE_IPHONE = "/devices/iphone.png"
const DEVICE_IPAD_LANDSCAPE = "/devices/ipad-landscape.png"
const DEVICE_IPAD_PORTRAIT = "/devices/ipad-portrait.png"

/**
 * hero-section-10 — Centered device hero: a centered copy column over a full iPad (landscape) render.
 * The device version of the product-mockup hero: the mockup is a real device, so the shot needs no
 * wrapper. The PNG carries its own bezel and shadow.
 */
export function HeroDeviceLandscapeDemo() {
  return (
    <Hero className="rounded-lg">
      <HeroContent className="max-w-4xl gap-8">
        <Badge variant="teal" dot pill>
          Responsive by default
        </Badge>

        <HeroTitle className="max-w-3xl">Your product looks flawless on every screen</HeroTitle>

        <HeroSubtitle>
          Design once and ship a polished experience from mobile to desktop. Koala UI handles the
          breakpoints so your interface feels native on every device.
        </HeroSubtitle>

        <HeroActions>
          <Button size="lg">Start building</Button>
          <Button size="lg" variant="outline">
            See it live
          </Button>
        </HeroActions>

        <HeroMedia className="mt-8 w-full max-w-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- finished device render; swap for next/Image */}
          <img src={DEVICE_IPAD_LANDSCAPE} alt="" width={1030} height={807} className="h-auto w-full" />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/**
 * hero-section-11 — Split mobile hero: a left copy column with avatar social proof beside a full
 * iPhone render on the right. The device floats on its baked shadow; folds to a stacked column below
 * the lg breakpoint.
 */
export function HeroDevicePhoneDemo() {
  return (
    <Hero layout="split" className="rounded-lg">
      <HeroContent>
        <HeroColumn>
          <Badge variant="purple" dot pill>
            iOS &amp; Android
          </Badge>

          <HeroTitle>Ship a mobile app your users love</HeroTitle>

          <HeroSubtitle className="max-w-xl">
            Beautiful, accessible components tuned for touch. Build once and launch a native-feeling
            experience on every phone.
          </HeroSubtitle>

          <HeroActions>
            <Button size="lg">Get the app</Button>
            <Button size="lg" variant="outline">
              Watch demo
            </Button>
          </HeroActions>

          <HeroSocialProof className="pt-2">
            <AvatarGroup size="sm">
              {FACES.slice(0, 4).map(({ initials, name, color, photo }) => (
                <Tooltip key={initials} content={name}>
                  <AvatarRoot size="sm" color={color}>
                    <AvatarImage src={photo} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </AvatarRoot>
                </Tooltip>
              ))}
            </AvatarGroup>
            <HeroRating>
              <span className="font-medium text-muted-foreground">4.9 on the App Store</span>
            </HeroRating>
          </HeroSocialProof>
        </HeroColumn>

        <HeroMedia className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- finished device render; swap for next/Image */}
          <img
            src={DEVICE_IPHONE}
            alt=""
            width={419}
            height={757}
            className="h-auto w-full max-w-[18rem]"
          />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}

/**
 * hero-section-12 — Multi-device hero: a left copy column beside a device duo, an iPad (portrait)
 * with an iPhone overlapping its lower-right corner, so the section shows one product across two form
 * factors. Both renders float on their baked shadows; percentage widths keep the duo proportional as
 * it scales. Folds to a stacked column below the lg breakpoint.
 */
export function HeroDeviceDuoDemo() {
  return (
    <Hero layout="split" className="rounded-lg">
      <HeroContent>
        <HeroColumn>
          <Badge variant="info" dot pill>
            One system, every device
          </Badge>

          <HeroTitle>Design for phone, tablet, and beyond</HeroTitle>

          <HeroSubtitle className="max-w-xl">
            A single component library that scales across form factors, so your product stays
            consistent from a pocket-sized phone to a widescreen tablet.
          </HeroSubtitle>

          <HeroActions>
            <Button size="lg">Explore components</Button>
            <Button size="lg" variant="outline">
              Read the docs
            </Button>
          </HeroActions>
        </HeroColumn>

        <HeroMedia className="mx-auto w-full max-w-md lg:max-w-none">
          {/* iPad (portrait) is the back device; as a block element it sets the media's height. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- finished device render; swap for next/Image */}
          <img
            src={DEVICE_IPAD_PORTRAIT}
            alt=""
            width={802}
            height={1035}
            className="mx-auto block w-[82%]"
          />
          {/* iPhone overlaps the lower-right corner, lifted in front. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- finished device render; swap for next/Image */}
          <img
            src={DEVICE_IPHONE}
            alt=""
            width={419}
            height={757}
            className="absolute bottom-0 right-0 w-[42%]"
          />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}
