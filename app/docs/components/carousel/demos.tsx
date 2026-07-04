"use client"

import * as React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Real photography from Unsplash's "Urban Luxe" collection, so the docs read like a finished
// gallery instead of placeholder tiles. One coherent set per carousel: the shared slides are the
// dark A-frame cabins at dusk (below), the photo galleries are the bright interiors (PHOTOS).
const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// image-outline polish (#11): a 1px inset edge in pure black/white (never a tinted neutral) so a
// photo reads as framed against the page; flips to white in dark/moonlight so it never looks like
// dirt. Applied on the slide wrapper (the viewport's rounded clip trims the corners).
const IMG_OUTLINE =
  "after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10"

// A staggered "assemble" that replays each time a slide becomes active (dot, arrow, key, or a
// drag-release), mirroring testimonials-section-3. The canonical `animate-stagger-in-blur` keyframe
// (rise + defocus + fade) is gated on the slide's `data-active` via a NAMED `group/slide` (named so
// it never collides with the Carousel root's own unnamed `group` that reveals the arrows): applying
// the animation ONLY while active re-runs it every time data-active flips true, with no remount.
// Crucially the RESTING state is the plain, fully-visible caption (no opacity-0 base), so a slide
// peeking in mid-drag still shows its label and travels with its photo; only activation animates.
// `motion-safe:` keeps it off under reduced motion (the token carries `both` fill, holding hidden
// through any delay so it never flashes early).
const SLIDE_ENTER = "motion-safe:group-data-[active=true]/slide:animate-stagger-in-blur"

// The shared slide set: four dark cabins in an autumn forest at dusk, visually a family (same
// photographer, palette, and mood) so swiping between them reads as one gallery.
const SLIDES = [
  { id: "1697462248369-254119899872", tab: "Retreat", alt: "A-frame cabin lit at dusk beside a firepit and Adirondack chairs" },
  { id: "1697807646004-31ae73a1a625", tab: "Firepit", alt: "Modern black cabin in an autumn forest with a glowing firepit" },
  { id: "1697807650304-907257330a3e", tab: "Deck", alt: "Two dark timber cabins with a lit deck at dusk" },
  { id: "1697462248415-0ead58a3daba", tab: "Dusk", alt: "Black A-frame cabin against a pink dusk sky" },
]

// A photographed slide from the shared set: fills the viewport (object-cover), framed by the #11
// outline. `draggable={false}` so a native image drag never eats the swipe ([[carousel-image-drag]]).
function Slide({ id, alt }: { id: string; alt: string }) {
  return (
    <div className={cn("relative aspect-[16/9]", IMG_OUTLINE)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img(id)}
        alt={alt}
        draggable={false}
        loading="lazy"
        className="size-full object-cover"
      />
    </div>
  )
}

/** Uncontrolled: click a dot or focus the carousel and press ←/→. */
export function BasicDemo() {
  return (
    <Carousel className="w-full max-w-sm" label="Cabin gallery">
      <CarouselContent>
        {SLIDES.map(({ id, alt }) => (
          <CarouselSlide key={id}>
            <Slide id={id} alt={alt} />
          </CarouselSlide>
        ))}
      </CarouselContent>
      <CarouselIndicators />
    </Carousel>
  )
}

// The photo galleries (image card + hero) run on a second coherent set: bright, modern interiors
// from the same collection. A caption sits over a bottom scrim so white text stays legible on any
// frame, and each carries the #11 outline.
const PHOTOS = [
  { id: "1697462247834-7d55761daea3", label: "Dining room", alt: "Sunlit dining area with wood floors and floor-to-ceiling windows" },
  { id: "1713365860516-256d20dbb7e0", label: "The great room", alt: "Bright living room with arched windows and a wood stove" },
  { id: "1722247478581-17f7d9ffb3a6", label: "Kitchen", alt: "Minimal kitchen in white and walnut" },
  { id: "1622372738946-62e02505feb3", label: "Walnut bar", alt: "Dark luxe kitchen with walnut cabinetry and a green bar stool" },
]

function PhotoFigure({ id, label, alt, aspect }: { id: string; label: string; alt: string; aspect: string }) {
  return (
    // `translateZ(0)` collapses the whole figure (image + caption) into ONE compositing layer.
    // Without it, while the slide transition animates the track's transform the track is its own GPU
    // layer, and the caption's scrim — which overlaps it — gets force-promoted to a SEPARATE
    // "Overlap" layer (verified in the DevTools layer tree). That standalone layer doesn't stay
    // slaved to the track's animated transform, so the photo slides but the caption lags and appears
    // to swap in place instead of travelling with its image. Merging them removes the Overlap layer.
    <figure className={cn("relative [transform:translateZ(0)]", aspect, IMG_OUTLINE)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img(id)} alt={alt} draggable={false} loading="lazy" className="size-full object-cover" />
      {/* Legibility scrim: the white caption sits on a bottom gradient so it holds on bright frames.
          Shadow via `text-shadow` (a paint property) rather than `drop-shadow` (a CSS `filter`), to
          avoid spinning up an extra filter layer inside the figure. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-10">
        <figcaption className={cn("text-sm font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.45)]", SLIDE_ENTER)}>{label}</figcaption>
      </div>
    </figure>
  )
}

/** Card / image carousel: arrows reveal on hover, dots float bottom-right over the image. */
export function ImageCardDemo() {
  // Controlled so each slide can carry `data-active`, which drives the caption's assemble (SLIDE_ENTER).
  const [index, setIndex] = React.useState(0)
  return (
    <Carousel index={index} onIndexChange={setIndex} className="w-full max-w-sm" label="Interior gallery">
      <CarouselContent>
        {PHOTOS.map(({ id, label, alt }, i) => (
          <CarouselSlide key={id} className="group/slide" data-active={i === index ? "true" : undefined}>
            <PhotoFigure id={id} label={label} alt={alt} aspect="aspect-[4/3]" />
          </CarouselSlide>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselIndicators overlay />
    </Carousel>
  )
}

const VARIANTS = ["dots", "lines", "fraction", "thumbnails", "tabs", "numbers", "progress"] as const

// Short text labels for the `tabs` cell, indexed to SLIDES (one per slide).
const TAB_LABELS = SLIDES.map((s) => s.tab)

// A 100-slide set for the fraction cell so its odometer crosses the 99 -> 100 digit boundary and
// the smooth width-grow is visible. Reuses the gallery photos, cycling through them (four unique
// URLs, so the browser caches them and only downloads four).
const FRACTION_SLIDES = Array.from({ length: 100 }, (_, i) => ({
  id: `fraction-${i}`,
  src: SLIDES[i % SLIDES.length].id,
  alt: SLIDES[i % SLIDES.length].alt,
}))

/**
 * One closed set of indicator forms, all driven by the same `variant` prop. Positioning
 * (`overlay`/`align`) is orthogonal and composes with each. Never hand-roll a new indicator.
 */
export function IndicatorVariantsDemo() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-2">
      {VARIANTS.map((variant) => {
        // Fraction isn't per-slide clickable and shines on big counts: give it a 100-slide gallery
        // starting at 99/100 (hover-reveal arrows to navigate) so the odometer roll + smooth
        // width-grow show. Progress is a readout too, so it also gets arrows (on the 4-slide set).
        // The rest stay on the shared 4-slide set, navigated by their own indicator.
        const isFraction = variant === "fraction"
        const isReadout = isFraction || variant === "progress"
        const slides = isFraction
          ? FRACTION_SLIDES
          : SLIDES.map(({ id, alt }) => ({ id, src: id, alt }))
        return (
          <div key={variant} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">{variant}</span>
            <Carousel
              className="w-full"
              label={`${variant} indicator`}
              defaultIndex={isFraction ? slides.length - 2 : 0}
            >
              <CarouselContent>
                {slides.map(({ id, src, alt }) => (
                  <CarouselSlide key={id}>
                    <Slide id={src} alt={alt} />
                  </CarouselSlide>
                ))}
              </CarouselContent>
              {isReadout && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
              <CarouselIndicators
                variant={variant}
                labels={variant === "tabs" ? TAB_LABELS : undefined}
                thumbnails={
                  variant === "thumbnails"
                    ? SLIDES.map(({ id, alt }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={id} src={img(id, 160)} alt={alt} draggable={false} loading="lazy" />
                      ))
                    : undefined
                }
              />
            </Carousel>
          </div>
        )
      })}
    </div>
  )
}

/** Overlay indicator floating over a full-bleed hero: white dots bottom-centered. */
export function OverlayHeroDemo() {
  // Controlled so each slide can carry `data-active`, which replays the caption's assemble
  // (SLIDE_ENTER) as it lands, matching testimonials-section-3's spotlight carousel.
  const [index, setIndex] = React.useState(0)
  return (
    <Carousel index={index} onIndexChange={setIndex} className="w-full max-w-md" label="Interior hero">
      <CarouselContent>
        {PHOTOS.map(({ id, label, alt }, i) => (
          <CarouselSlide key={id} className="group/slide" data-active={i === index ? "true" : undefined}>
            <PhotoFigure id={id} label={label} alt={alt} aspect="aspect-video" />
          </CarouselSlide>
        ))}
      </CarouselContent>
      <CarouselIndicators overlay align="center" />
    </Carousel>
  )
}

/** Controlled: drive `index` from your own state and external buttons. */
export function ControlledDemo() {
  const [index, setIndex] = React.useState(0)
  const last = SLIDES.length - 1

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Carousel index={index} onIndexChange={setIndex} label="Controlled carousel">
        <CarouselContent>
          {SLIDES.map(({ id, alt }) => (
            <CarouselSlide key={id}>
              <Slide id={id} alt={alt} />
            </CarouselSlide>
          ))}
        </CarouselContent>
        <CarouselIndicators />
      </Carousel>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={index <= 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Previous
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {index + 1} / {SLIDES.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={index >= last}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
