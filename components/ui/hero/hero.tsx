"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { CheckCircle } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"
import { Rating } from "@/components/ui/rating"

/**
 * Hero: the marketing hero section. Multi-part like Card/Footer: one `tv` recipe with `slots`,
 * shared through a typed React Context so every part reads the same styles (never prop-drilled or
 * cloned). See docs/ARCHITECTURE.md §2.
 *
 * It is pure layout composed from existing Koala parts: drop our `Button`s into `HeroActions`, an
 * `AvatarGroup` into `HeroSocialProof`, a product window or logo wall into `HeroMedia`. The root is
 * a full-bleed `<section>` wrapping a `HeroContent` column. `HeroFeature` carries its own
 * check-circle glyph; `HeroRating` renders the star row; `HeroHighlight` marks a keyword in the
 * title.
 *
 * `layout` is the single knob that flips the whole composition (set once on `<Hero>`): `centered`
 * is the classic stacked column; `split` turns `HeroContent` into a two-column grid so a `HeroColumn`
 * of copy sits beside a `HeroMedia` visual. The same parts read the layout from context, so a
 * variant is a prop change, not a different component.
 */
export const heroVariants = tv({
  slots: {
    // Full-bleed; relative + isolate establish a stacking/positioning context for the section.
    root: "relative isolate w-full overflow-hidden bg-background text-foreground",
    // A hero sits at the very top of the page (a header already sits above it), so the vertical
    // rhythm is asymmetric: a lighter top and a generous bottom that opens into the next section.
    // The Hero owns this `py` itself (added per-layout below), so compose it WITHOUT a band that
    // also pads (see components/ui/section: wrap in `padding="none"`), or override here.
    content: "mx-auto w-full px-5 sm:px-8",
    // The copy stack for `split` (eyebrow → title → subtitle → actions). Harmless in `centered`,
    // where `content` is already the flex column, but available if a composer wants to group copy.
    // `min-w-0` is load-bearing: as a grid/flex item the column defaults to `min-width:auto`, so a
    // single non-wrapping child (a `whitespace-nowrap` eyebrow Badge, a long unbroken word) would set
    // the track's min-content wider than the viewport and drag the whole column, title included, past
    // the hero's `overflow-hidden` edge on a narrow frame. `min-w-0` lets the column shrink to its
    // track so the copy wraps instead of overflowing. See memory `scroll-viewport-flex-min-h`.
    column: "flex w-full min-w-0 flex-col gap-6",
    // Pill above the title; reads on any surface, hairline + soft shadow for depth.
    // `[&>svg]` (direct child only) sizes a bare leading glyph; a nested Badge keeps control of
    // its own icon, so the eyebrow doesn't reach in and fight the Badge's `[&>svg]` sizing.
    // When the eyebrow leads with a nested Badge (the announcement pill), tighten the left
    // padding to `pl-1` (4px) so it matches the `py-1` vertical inset: the inner pill then
    // nests in a uniform crescent (concentric) instead of floating with a wide left gap.
    eyebrow:
      "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground shadow-xs [&>svg]:size-4 [&>svg]:shrink-0 has-[>[data-slot=badge]:first-child]:pl-1",
    title: "text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl",
    // A keyword marker inside the title: a soft brand wash so it tracks the active accent across all
    // four themes. `box-decoration-clone` keeps the rounded wash intact when the word wraps a line.
    highlight: "box-decoration-clone rounded-lg bg-brand/10 px-2 text-brand",
    subtitle: "max-w-2xl text-lg text-balance text-muted-foreground",
    // On a phone the CTAs stack one under the other (`flex-col`) and take the row's full width, the
    // standard mobile CTA layout, so a pair never sits cramped side by side or wraps awkwardly; from
    // `sm` up they return to a wrapping row and the layout's `justify-*` takes over (gated behind
    // `sm:`). `self-stretch` (dropped at `sm:self-auto`) is load-bearing, NOT redundant with
    // `items-stretch`: every layout centers or left-aligns the content column (`items-center` in
    // centered/background, `items-start` in split), so this actions box, a child of that column, would
    // otherwise shrink to its buttons' content width and the inner `items-stretch` would only fill
    // *that*. `self-stretch` overrides the column's cross-axis alignment so the row spans the full
    // column width and the stacked buttons truly hit 100% on mobile. It's `self-*` (not `w-full`) so a
    // per-instance width cap like `max-w-sm` still wins (explicit width beats `align-self`). Mirrors the
    // SectionHeader actions recipe so section CTAs stack the same way everywhere.
    actions:
      "flex flex-col items-stretch gap-3 self-stretch sm:flex-row sm:flex-wrap sm:items-center sm:self-auto",
    features: "flex flex-wrap items-center gap-x-6 gap-y-3",
    feature:
      "inline-flex items-center gap-1.5 text-sm font-medium text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
    // The check-circle mark: green reads as "done/included" on every theme.
    featureIcon: "text-success",
    socialProof: "flex flex-col gap-3 sm:flex-row sm:gap-4",
    rating: "flex items-center gap-2 text-sm text-muted-foreground",
    // The visual region: a product window, screenshot, or logo wall. Fills its grid cell in `split`;
    // sits below the copy in `centered`. Composers size it (max-w / mt) per slab.
    media: "relative w-full",
    // The full-bleed media layer for a `background` hero: an absolute bottom layer holding a cover
    // image or video. Any child `<img>`/`<video>` is stretched to fill; `HeroBackground` lays the
    // scrim over them so the section's own `overflow-hidden` + rounded corners clip the media too.
    background:
      "absolute inset-0 overflow-hidden [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
    // Legibility scrim over the media: a vertical gradient, darker at top and bottom so the centered
    // copy and a trailing logo row stay readable on any photo. Literal `black/` (not a token) is the
    // right call here, the same documented exception as an image overlay: a scrim over a photo is
    // inherently dark and must not re-theme.
    scrim: "absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70",
  },
  variants: {
    layout: {
      centered: {
        content: "flex max-w-3xl flex-col items-center gap-6 pt-10 pb-16 text-center sm:pt-14 sm:pb-24",
        column: "items-center text-center",
        actions: "sm:justify-center",
        features: "justify-center",
        socialProof: "items-center",
      },
      split: {
        content:
          "grid max-w-6xl grid-cols-1 items-center gap-x-16 gap-y-12 pt-10 pb-16 sm:pt-14 sm:pb-24 lg:grid-cols-2",
        column: "items-start text-left",
        actions: "sm:justify-start",
        features: "justify-start",
        socialProof: "items-start sm:items-center",
      },
      // Full-bleed media hero: the root becomes a min-height band that centers a single copy column
      // over a `HeroBackground` (photo or video). The base text flips to white and the eyebrow goes
      // glassy so the copy reads on the scrimmed media; `HeroContent` lifts above it with `z-10`.
      // The min-height is a single fixed value (not responsive) so a docs PreviewFrame can floor its
      // iframe at the same height and never strand the slab scrolling while the media still loads.
      background: {
        root: "grid min-h-[40rem] place-items-center text-white",
        content:
          "relative z-10 flex max-w-3xl flex-col items-center gap-6 py-20 text-center sm:py-28",
        column: "items-center text-center",
        eyebrow: "border-white/20 bg-white/10 text-white shadow-none backdrop-blur-sm",
        subtitle: "text-white/75",
        actions: "sm:justify-center",
        features: "justify-center",
        feature: "text-white/80",
        socialProof: "items-center",
      },
    },
  },
  defaultVariants: { layout: "centered" },
})

type HeroSlots = ReturnType<typeof heroVariants>
const [HeroProvider, useHeroContext] = createContext<{ slots: HeroSlots }>("Hero")

export interface HeroProps extends React.ComponentProps<"section"> {
  /**
   * Composition: a single centered column (`centered`, default); a two-column `split` where a
   * `HeroColumn` of copy sits beside a `HeroMedia` visual; or `background`, a full-bleed band that
   * centers one copy column over a `HeroBackground` photo or video (light copy on a scrim). Set once
   * here; every part reads it from context.
   */
  layout?: "centered" | "split" | "background"
}

/**
 * Parts are exported individually (not `Hero.Title` dot-notation): namespaced statics don't
 * survive the RSC server→client boundary. Compose as `<Hero><HeroContent><HeroTitle>…`.
 */
export function Hero({ layout = "centered", className, children, ...props }: HeroProps) {
  const slots = heroVariants({ layout })
  return (
    <HeroProvider slots={slots}>
      <section data-slot="hero" className={slots.root({ className })} {...props}>
        {children}
      </section>
    </HeroProvider>
  )
}

/**
 * The content column. In `centered` it is the stacked column itself (place the eyebrow, title,
 * actions, etc. directly inside it). In `split` it is the two-column grid that holds a `HeroColumn`
 * beside a `HeroMedia`.
 */
export function HeroContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroContent")
  return <div data-slot="hero-content" className={slots.content({ className })} {...props} />
}

/** The copy stack for a `split` hero: groups the eyebrow, title, subtitle, and actions. */
export function HeroColumn({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroColumn")
  return <div data-slot="hero-column" className={slots.column({ className })} {...props} />
}

export interface HeroEyebrowProps extends React.ComponentProps<"div"> {
  /** Render the child as the eyebrow (Radix Slot), e.g. a link to the changelog. */
  asChild?: boolean
}

/** The pill above the title (announcement / version chip). */
export function HeroEyebrow({ className, asChild = false, ...props }: HeroEyebrowProps) {
  const { slots } = useHeroContext("HeroEyebrow")
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="hero-eyebrow" className={slots.eyebrow({ className })} {...props} />
}

export function HeroTitle({ className, ...props }: React.ComponentProps<"h1">) {
  const { slots } = useHeroContext("HeroTitle")
  return <h1 data-slot="hero-title" className={slots.title({ className })} {...props} />
}

// Per-character entrance step (ms): each glyph of a freshly-rotated phrase starts one step after the
// last, so a short phrase fully resolves well inside the hold. Reuses the `stagger-in-blur` token
// (rise + 4px→0 defocus) from globals.css, the same entrance a `<Stagger>` cascade plays.
const HIGHLIGHT_CHAR_STEP = 28
/** Default ms a rotated phrase holds before the next swaps in. */
const HIGHLIGHT_ROTATE_INTERVAL = 2600

// Each rotated phrase takes the next wash color (wrapping), so the keyword cycles its hue along with
// its words. Semantic DS color roles only (the same tints Badge/Avatar use), so it tracks all four
// themes; the literal strings keep the utilities statically generated. `brand` leads so the resting
// keyword still reads as the active accent. The tint crossfades on swap (`transition` on the wash).
const HIGHLIGHT_COLORS = [
  "bg-brand/10 text-brand",
  "bg-purple/10 text-purple",
  "bg-teal/10 text-teal",
  "bg-pink/10 text-pink",
]

/**
 * Render a phrase as a row of per-glyph spans. Glyphs must be `inline-block`: a transform (the
 * `translateY` in the stagger keyframe) does not apply to a non-replaced inline box. Spaces become a
 * non-breaking space so an `inline-block` cell keeps its width. When `animate`, each glyph carries
 * the staggered entrance; the measurer renders the same structure unanimated so its width matches the
 * live row exactly (no sub-pixel clip).
 */
function highlightGlyphs(phrase: string, animate: boolean) {
  return Array.from(phrase).map((char, i) => (
    <span
      key={i}
      className={cn(
        "inline-block",
        animate && "animate-stagger-in-blur motion-reduce:animate-none",
      )}
      style={animate ? { animationDelay: `${i * HIGHLIGHT_CHAR_STEP}ms` } : undefined}
    >
      {char === " " ? " " : char}
    </span>
  ))
}

export interface HeroHighlightProps extends React.ComponentProps<"span"> {
  /**
   * Rotate the highlighted keyword through these phrases. The wash locks to the WIDEST phrase so it
   * reads as a fixed *zone*: only the words inside swap, each entering with a per-character stagger
   * while the previous one clears, and the zone itself never resizes, so it can't shift the copy
   * beside it or overlap the line above. Omit for a static keyword (renders `children`). Honors
   * `prefers-reduced-motion` (holds the first phrase, no cascade).
   */
  rotate?: string[]
  /** ms each phrase holds before the next swaps in. @default 2600 */
  interval?: number
}

/** A keyword marker inside `HeroTitle` (a soft brand wash). Wrap the word(s) to emphasize, or pass
 * `rotate` to cycle a fixed zone through several phrases. */
export function HeroHighlight({
  className,
  rotate,
  interval = HIGHLIGHT_ROTATE_INTERVAL,
  children,
  ...props
}: HeroHighlightProps) {
  const { slots } = useHeroContext("HeroHighlight")
  const wash = slots.highlight({ className })
  if (!rotate || rotate.length < 2) {
    return (
      <span data-slot="hero-highlight" className={wash} {...props}>
        {children}
      </span>
    )
  }
  return <HeroHighlightRotate phrases={rotate} interval={interval} washClassName={wash} {...props} />
}

interface HeroHighlightRotateProps extends Omit<React.ComponentProps<"span">, "children"> {
  phrases: string[]
  interval: number
  washClassName: string
}

function HeroHighlightRotate({
  phrases,
  interval,
  washClassName,
  ...props
}: HeroHighlightRotateProps) {
  const [index, setIndex] = React.useState(0)
  // Each phrase's own content width, measured before paint from an out-of-flow probe that renders
  // the same glyph structure as the live row (so widths match exactly). The wash hugs the active
  // phrase and transitions its width as words swap; the word's stagger lags the width tween, so the
  // pill is always already wide enough by the time a glyph lands (no overflow, no clip needed).
  // The pixel widths are font-size-relative, and the title is responsive (text-4xl→5xl→6xl), so the
  // probe stays mounted (it's inert: aria-hidden + invisible + out of flow) and a ResizeObserver
  // re-measures whenever the inherited font-size changes. Without this the zone froze at the size
  // measured on mount: a frame loaded wide (lg:text-6xl) then narrowed to mobile (text-4xl) kept the
  // larger px width with `whitespace-nowrap`, overflowing the column and clipping the centered title.
  const [widths, setWidths] = React.useState<number[]>()
  const probeRef = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    const el = probeRef.current
    if (!el) return
    function measure() {
      setWidths(
        Array.from(el!.querySelectorAll<HTMLElement>("[data-phrase]"), (node) =>
          Math.ceil(node.getBoundingClientRect().width),
        ),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [phrases])

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    function advance() {
      setIndex((i) => (i + 1) % phrases.length)
    }
    const id = window.setInterval(advance, interval)
    return () => window.clearInterval(id)
  }, [phrases.length, interval])

  const active = phrases[index]
  const color = HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]

  // One inline-grid element, like the Suggestions morph: `align-baseline` sits it on the headline's
  // baseline and `items-baseline` keeps the word there; `box-content` makes the explicit `width` the
  // *content* width so the wash's `px-2` breathes around it, and `transition-[width,background-color]`
  // tweens the hug and crossfades the tint as words swap (the new color's letters fade in crisp over
  // it). The live word and the probe stack in the one column; `justify-items-start` keeps the word
  // flush-left so "into" stays tight against the left edge while the right edge resizes. `color`
  // (placed last) overrides the wash's default brand bg/text via tailwind-merge.
  return (
    <span
      data-slot="hero-highlight"
      aria-label={active}
      className={cn(
        washClassName,
        "inline-grid items-baseline justify-items-start box-content whitespace-nowrap align-baseline transition-[width,background-color] duration-base ease-out",
        color,
      )}
      style={{ width: widths?.[index] }}
      {...props}
    >
      {/* Out-of-flow measuring probe: stays mounted so the ResizeObserver above can re-measure as
          the responsive title font-size changes. `invisible absolute` keeps it inert (no paint, no
          layout) and `aria-hidden` keeps it out of the a11y tree (the accessible name is the parent
          `aria-label`). It renders the same per-glyph structure as the live row so widths match. */}
      <span ref={probeRef} aria-hidden className="invisible absolute whitespace-nowrap">
        {phrases.map((phrase, i) => (
          <span key={i} data-phrase className="inline-block">
            {highlightGlyphs(phrase, false)}
          </span>
        ))}
      </span>

      {/* The live word, re-mounted on every swap (keyed by index) so the per-character stagger
          replays: each glyph rises + unblurs a step after the last. */}
      <span key={index} aria-hidden className="col-start-1 row-start-1">
        {highlightGlyphs(active, true)}
      </span>
    </span>
  )
}

export function HeroSubtitle({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useHeroContext("HeroSubtitle")
  return <p data-slot="hero-subtitle" className={slots.subtitle({ className })} {...props} />
}

/** The CTA row: drop our `Button`s in here. */
export function HeroActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroActions")
  return <div data-slot="hero-actions" className={slots.actions({ className })} {...props} />
}

/** Wrapper for the feature checklist; renders a `<ul>`. */
export function HeroFeatures({ className, ...props }: React.ComponentProps<"ul">) {
  const { slots } = useHeroContext("HeroFeatures")
  return <ul data-slot="hero-features" className={slots.features({ className })} {...props} />
}

/** One checklist item: carries its own green check-circle glyph. */
export function HeroFeature({ className, children, ...props }: React.ComponentProps<"li">) {
  const { slots } = useHeroContext("HeroFeature")
  return (
    <li data-slot="hero-feature" className={slots.feature({ className })} {...props}>
      <CheckCircle weight="fill" aria-hidden className={slots.featureIcon()} />
      {children}
    </li>
  )
}

/** Row holding the avatar stack and the rating. */
export function HeroSocialProof({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroSocialProof")
  return (
    <div data-slot="hero-social-proof" className={slots.socialProof({ className })} {...props} />
  )
}

export interface HeroRatingProps extends React.ComponentProps<"div"> {
  /** Filled stars. @default 5 */
  value?: number
  /** Total stars. @default 5 */
  max?: number
}

/** Our read-only `Rating` plus a label (e.g. "5.0 Ratings") passed as children. */
export function HeroRating({ value = 5, max = 5, className, children, ...props }: HeroRatingProps) {
  const { slots } = useHeroContext("HeroRating")
  return (
    <div data-slot="hero-rating" className={slots.rating({ className })} {...props}>
      <Rating readOnly value={value} max={max} size="sm" aria-label="Rating" />
      {children}
    </div>
  )
}

/** The visual region: drop a product window, screenshot, or logo wall in here. */
export function HeroMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroMedia")
  return <div data-slot="hero-media" className={slots.media({ className })} {...props} />
}

/**
 * The full-bleed media layer for a `layout="background"` hero. Renders an absolutely-positioned
 * bottom layer that stretches its child to cover the section, then lays a gradient scrim over it so
 * the light copy stays legible on any photo. Drop a plain `<img src=… alt="" />` or an autoplay,
 * muted, looping `<video>` (or a next `<Image fill>`) inside; sits behind `HeroContent`, which lifts
 * above it. The section's `overflow-hidden` (plus any rounded corners) clips the media to the band.
 */
export function HeroBackground({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroBackground")
  return (
    <div data-slot="hero-background" className={slots.background({ className })} {...props}>
      {children}
      <div data-slot="hero-scrim" aria-hidden className={slots.scrim()} />
    </div>
  )
}
