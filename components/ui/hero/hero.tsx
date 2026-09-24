"use client"

import * as React from "react"
import { CheckCircle } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ButtonSize } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"
import { AnimatedLabel } from "@/components/ui/animated-label"
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
 * title. The announcement pill above the title is NOT a Hero part: it is the standalone
 * `Announcement` atom (components/ui/announcement), so the same pill can sit in a navbar or a
 * pricing header. Over media pass `variant="glass"`.
 *
 * `layout` is the single knob that flips the whole composition (set once on `<Hero>`): `centered`
 * is the classic stacked column; `split` turns `HeroContent` into a two-column grid so a `HeroColumn`
 * of copy sits beside a `HeroMedia` visual. The same parts read the layout from context, so a
 * variant is a prop change, not a different component.
 */
export const heroVariants = tv({
  slots: {
    // Full-bleed; relative + isolate establish a stacking/positioning context for the section.
    // `overflow-clip`, not `hidden`: both cut media that bleeds past the page edges, but a hidden
    // box is still a scroll container, so tabbing to a live control out in the clipped bleed (a
    // component collage wider than the viewport) would scroll the whole hero sideways. A clipped
    // box cannot scroll at all.
    root: "relative isolate w-full overflow-clip bg-background text-foreground",
    // A hero sits at the very top of the page (a header already sits above it), so the vertical
    // rhythm is asymmetric: a lighter top and a generous bottom that opens into the next section.
    // The Hero owns this `py` itself (added per-layout below), so compose it WITHOUT a band that
    // also pads (see components/ui/section: wrap in `padding="none"`), or override here.
    content: "mx-auto w-full px-6 sm:px-8",
    // The copy stack for `split` (eyebrow → title → subtitle → actions). Harmless in `centered`,
    // where `content` is already the flex column, but available if a composer wants to group copy.
    // `min-w-0` is load-bearing: as a grid/flex item the column defaults to `min-width:auto`, so a
    // single non-wrapping child (a `whitespace-nowrap` eyebrow Badge, a long unbroken word) would set
    // the track's min-content wider than the viewport and drag the whole column, title included, past
    // the hero's `overflow-hidden` edge on a narrow frame. `min-w-0` lets the column shrink to its
    // track so the copy wraps instead of overflowing. See memory `scroll-viewport-flex-min-h`.
    column: "flex w-full min-w-0 flex-col gap-4",
    // Bold, with 1.1 leading: DM Sans follows its optical-size axis, so at 60-72px it sets in its
    // thin display cut and a 600 headline read lighter than the subtitle under it; the scale's own
    // 1.0 leading glued a two-line headline's lines together.
    title: "text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl",
    // A keyword marker inside the title: a soft brand wash so it tracks the active accent across all
    // four themes. `box-decoration-clone` keeps the rounded wash intact when the word wraps a line.
    highlight: "box-decoration-clone rounded-lg bg-brand/10 px-2 text-brand",
    subtitle: "max-w-2xl text-lg text-balance text-body",
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
    //
    // The vertical rhythm is a LADDER, not one gap: the copy block (eyebrow, title, subtitle) sits
    // tight on the column's 16px gap, and each group after it steps further out, so the eye reads
    // "statement → act → proof → product" as separate beats. The groups carry a top margin over the
    // gap: actions and the checklist land 32px down, the social proof 40px, the media 64px (centered,
    // below). One uniform 24px read as a single undifferentiated stack.
    actions:
      "mt-4 flex flex-col items-stretch gap-3 self-stretch sm:flex-row sm:flex-wrap sm:items-center sm:self-auto",
    features: "mt-4 flex flex-wrap items-center gap-x-6 gap-y-3",
    feature:
      "inline-flex items-center gap-1.5 text-sm font-medium text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
    // The check-circle mark: green reads as "done/included" on every theme.
    featureIcon: "text-success",
    // The three slots below only paint under `featureLayout="columns"`, where a feature grows from
    // a one-line check into a small capability column. The mark is a BARE glyph, not a chip: a
    // marketing section draws with type and whitespace, and boxing a 20px icon into a filled,
    // bordered 48px tile is exactly the container look the house style turns down. The lone accent
    // in the row is the glyph itself, the same treatment the feature-grid columns use.
    featureMark: "text-brand [&_svg]:size-5",
    featureTitle: "text-base font-semibold text-balance text-foreground",
    // Copy someone actually reads sits on the reading ink, not the muted one.
    featureText: "text-sm leading-relaxed text-pretty text-body",
    socialProof: "mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4",
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
    // The multiplayer-cursor layer (HeroCursors): pure decoration over the whole band. It lets every
    // click through and is a size container, so each cursor shows only when the HERO is wide enough
    // to leave real gutters beside the copy (a docs preview is narrower than the window, so a
    // viewport breakpoint would get this wrong).
    cursors: "pointer-events-none absolute inset-0 z-10 select-none @container",
    // One cursor is a zero-size anchor AT the arrow tip: `className` positions the tip, and the arrow,
    // ripple and label hang off it, so a cursor placed at `left-[20%]` points exactly there.
    cursor: "absolute hidden @5xl:block",
    // Carries the whole cursor (arrow + label) along its loop. See --animate-cursor-drift.
    cursorDrift: "absolute top-0 left-0 animate-cursor-drift motion-reduce:animate-none",
    // The pointer presses toward its own tip (origin top-left, where the tip sits). The halo stroke in
    // the page ground plus a small drop shadow lift it off any surface, a photo included.
    cursorArrow:
      "absolute top-0 left-0 size-5 origin-top-left overflow-visible fill-current stroke-background drop-shadow-sm animate-cursor-click motion-reduce:animate-none",
    // The click ripple, centered on the tip, in the cursor's own color. Invisible between clicks.
    cursorPing:
      "absolute -top-3 -left-3 size-6 rounded-full bg-current opacity-0 animate-cursor-ping motion-reduce:hidden",
    // The name tag: a solid pill in the cursor color, ringed in the page ground like the arrow's halo,
    // tilted a few degrees away from where the arrow points (the hand-placed multiplayer look). Its
    // text is the page ground, not white: the dark themes lift purple/teal/pink/success to pastel
    // tints, where white text washes out, and the ground flips with them (white on a saturated fill
    // in light, near-black on a pastel in dark). Brand overrides it back to white below, the primary
    // Button's contract, because the brand fill stays saturated in every theme.
    cursorLabel:
      "absolute top-5 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap text-background shadow-md ring-2 ring-background",
    // The poster-wall layer (HeroScatter): tilted photo cards scattered through the band around the
    // copy. Like `cursors` it is pure decoration that lets every click through, but it sits BEHIND
    // the copy (`-z-10`, under the root's own `isolate` stacking context) rather than over it, so a
    // card can be cropped by the band edge without ever landing on a word. It is a size container,
    // so each card shows and grows against the HERO's width, not the window's (a docs preview is
    // narrower than the page it will ship on).
    scatter: "pointer-events-none absolute inset-0 -z-10 select-none @container",
    // One card is a photo print: a padded surface whose 4px inset steps the 16px card radius down to
    // the 12px picture inside it (the concentric ladder), on the elevation the popover layer uses, so
    // the wall floats over the band instead of lying flat on it. `className` pins it (`left-[8%]
    // top-16`) and may gate it on a container width; `tilt` leans it. The cards drift in on mount
    // with the same rise-and-defocus a `Stagger` cascade plays, one after the other.
    // The picture gets its own hairline on top of it, painted by the card's `::after` rather than a
    // ring on the `<img>`: an inset ring is drawn under replaced content, so it would never show over
    // the photo (see memory `inset-ring-under-children`). Pure black/white alphas, never a tinted
    // neutral, which would pick up the surface under it and read as dirt on the picture's edge.
    scatterTile:
      "absolute animate-stagger-in-blur overflow-hidden rounded-2xl bg-card p-1 shadow-lg ring-1 ring-border after:pointer-events-none after:absolute after:inset-1 after:rounded-xl after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] motion-reduce:animate-none dark:after:ring-white/10 [&>img]:size-full [&>img]:rounded-xl [&>img]:object-cover",
    // ── The scroll stage (HeroStage): the opening that plays itself as you scroll ──────────────
    // A picture fills the screen under one display word, contracts into a card, and a collage
    // assembles around it. The beats live in the `hero-stage-*` utilities (app/globals.css), which
    // own the scroll timeline and the geometry; these slots own only what the parts LOOK like, so
    // the two can be read separately. The track is pure scroll length: it paints nothing, it just
    // gives the pin somewhere to travel.
    stage: "hero-stage-track",
    // The pinned viewport. Everything inside it is absolutely positioned against this box, so the
    // contracting frame never reflows its neighbours as it resizes, and the stage is a size
    // container so a collage piece can be held back until the HERO (not the window) is wide enough
    // to have a gutter for it, the same call `scatter` and `cursors` make.
    stagePin: "hero-stage-pin @container",
    // The frame that contracts: full-bleed at the top of the band, a card by the end of it. It sits
    // ABOVE the late copy (`z-10`), which is load-bearing rather than cosmetic: while the picture
    // still covers the viewport it is also covering the CTAs that have not arrived yet, so there is
    // nothing invisible to click underneath it. The edge is an `::after` overlay, never a ring on
    // the box: an inset ring paints under the picture, which would swallow it whole.
    stageMedia:
      "hero-stage-media z-10 overflow-hidden bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10 [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover",
    // The display line, set INSIDE the contracting frame so the frame's own clip is part of how it
    // goes: as the frame closes, the line is growing past it, lifting and defocusing, so it is
    // trimmed by the card's edges at the same moment it blurs out. The two together read as the
    // camera pushing through the words rather than as text that happens to fade while a box
    // resizes. Its size is in `vw`, not container units, so the letters hold their size while the
    // frame leaves them behind. Centred rather than bottom-anchored, because a line the camera
    // passes through should sit where the lens is pointed. `whitespace-nowrap` keeps it on one
    // line: allowed to wrap, it re-lays itself onto two as the frame narrows, which looks like a
    // bug rather than a move. Two or three words never need to.
    stageTitle:
      "hero-stage-exit pointer-events-none absolute inset-x-0 top-1/2 z-20 -mt-[0.42em] select-none px-4 text-center text-[clamp(2.75rem,13vw,13rem)] leading-[0.84] font-bold tracking-tight whitespace-nowrap text-white [--hero-stage-exit-stagger:1.1%]",
    // One letter of the display line, when the line is a plain string and can be split. It carries
    // the fade and the defocus on its OWN beat (its `--hero-stage-step` shifts the range), while the
    // line around it carries the growth and the lift, so the word travels as one object while its
    // letters slide out from under it one after another.
    //
    // The mask box for one letter: the letter does not fade, it LEAVES, and this box is the edge it
    // leaves behind. A hard clip rather than a fade is the whole point of the treatment, so the
    // letterform stays crisp right up to the moment it is cut, instead of spending its exit as a
    // grey smear. `overflow-hidden` is the mask; the letter inside translates up out of it.
    //
    // The padding is not spacing, it is mask HEIGHT. The display line sets `leading-[0.84]`, so a
    // glyph box is shorter than the font's own ascent-plus-descent and the clip would slice the
    // descender off the "g" while it is still sitting still. The bottom padding grows the box (and
    // with it the clip) to cover the descender, and the matching negative margin takes that growth
    // back out of the layout, so the line keeps its exact leading. `align-bottom` because an
    // overflow-hidden inline-block aligns its BOTTOM MARGIN EDGE to the baseline rather than its own
    // internal baseline: pinning every box to the same edge keeps the row on one line.
    stageTitleMask: "inline-block -mb-[0.16em] overflow-hidden pb-[0.16em] align-bottom",
    // The letter itself, sliding up out of its mask on its own staggered beat. It rides
    // `hero-stage-letter` rather than the shared exit: a letter has to travel past its INK, not past
    // its box (a descender hangs below the box at display sizes), and it has to be guaranteed gone
    // at the end, because these letters do not fade and whatever the mask fails to cut stays on
    // screen at full strength. `inline-block` is load-bearing: `translate` does not apply to a
    // non-replaced inline box, so an unstyled span would simply not move. The window ends earlier
    // than the line's own so the last letter is away before the card lands.
    stageTitleGlyph: "hero-stage-letter inline-block [--hero-stage-exit-end:24%]",
    // Legibility under the display line. Weighted to the middle band, where the line sits, and it
    // leaves with the line, because it is there to carry it and a scrim over a finished card is
    // just dirt. Literal `black/` rather than a token is the documented exception: a scrim over a
    // photograph is inherently dark and must not re-theme.
    stageScrim:
      "hero-stage-exit pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-black/50 to-black/40 [--hero-stage-exit-blur:0px] [--hero-stage-exit-scale:1] [--hero-stage-exit-shift:0%]",
    // One collage piece: a photograph that arrives once the card has landed. Placed by `className`
    // with inset utilities, never `translate-*`/`scale-*`, which Tailwind v4 writes to the same two
    // properties the entrance animates (see HeroStageCard).
    stageCard:
      "hero-stage-enter hero-stage-photo absolute overflow-hidden rounded-2xl bg-muted shadow-xl after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10 [&>img]:size-full [&>img]:object-cover",
    // A band of late copy (the eyebrow over the card, the lede and CTAs under it). Full-width and
    // centred by its own flex row rather than a `-translate-x-1/2`, for the same reason: the
    // entrance owns `translate`.
    stageReveal: "hero-stage-enter absolute inset-x-0 flex flex-col items-center gap-4 px-6 text-center",
    // ── The editorial spread (HeroSpread): a magazine opening ──────────────────────────────────
    // Two half-bands meeting on one seam: a photograph that runs to the page edge beside a panel of
    // brand or ink. Nothing is centred and nothing overlaps, because the split IS the composition.
    // It is a grid of two equal tracks rather than a `split` HeroContent, which is a different
    // thing: that one centres a copy column beside a media box INSIDE the gutter, where this one
    // spends the whole width and lets the panel carry its own padding.
    //
    // Compose it INSTEAD of `HeroContent`, not inside it (the same call `HeroStage` makes).
    spread: "grid w-full grid-cols-1 lg:grid-cols-2",
    // The picture half. It carries an aspect ratio while the halves are stacked, because a covering
    // photo has no intrinsic box and a grid cell holding only absolute children collapses to zero;
    // from `lg` the row is as tall as the panel beside it and the picture covers whatever that comes
    // to. The ratio steps 4:3 → 16:9 so a phone gets a portrait-ish frame worth looking at and a
    // tablet gets a letterbox instead of half a screen of photograph.
    spreadMedia:
      "relative isolate aspect-[4/3] overflow-hidden bg-muted sm:aspect-[16/9] lg:aspect-auto lg:min-h-[42rem] [&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:object-cover [&>video]:absolute [&>video]:inset-0 [&>video]:size-full [&>video]:object-cover",
    // The inked half: the headline holds the TOP edge, the reading copy sits at the FOOT, and the
    // space between them is left empty on purpose, which is the whole move of a printed spread.
    // `justify-between` is the layout, so give the panel exactly two groups and let its height do
    // the spacing; the `gap` is only the floor for a short panel on a phone.
    spreadPanel: "relative flex flex-col justify-between gap-16 p-8 sm:p-12 lg:min-h-[42rem] lg:p-16",
    // The chapter mark in the panel's outer corner: editorial furniture, the one element here that
    // says "page" rather than "product". `tabular-nums` so 01 → 02 never nudges it sideways, and it
    // sits on the same rhythm as the panel's own padding at every width.
    spreadIndex:
      "absolute top-8 right-8 grid size-10 place-items-center rounded-full text-sm font-semibold tabular-nums sm:top-12 sm:right-12 lg:top-16 lg:right-16",
    // ── The statement (HeroStatement · HeroSignoff): a hero that is one sentence ───────────────
    // A whole sentence set at display scale: the opening that says what a company believes instead
    // of what its product does. The MEASURE is what makes it read: ~36 characters a line holds a
    // long statement to four or five lines, so it lands as a paragraph someone meant rather than a
    // headline that ran on. It is lighter than `HeroTitle` (semibold, 1.2 leading) because a
    // sentence this long in bold display type reads as shouting.
    statement:
      "max-w-[36ch] text-3xl leading-[1.2] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl",
    // The sign-off under it, a letter's closing in two or three short lines. Monospace at the small
    // size with open tracking is the house's typed-note voice, and it is deliberately the quietest
    // type on the band so the statement keeps every bit of the attention.
    signoff:
      "flex flex-col gap-0.5 font-mono text-xs leading-relaxed tracking-[0.08em] text-muted-foreground uppercase",
    // ── The picture frame (HeroFrame) and the mosaic (HeroMosaic) ─────────────────────────────
    // One framed picture, anywhere in a hero: the unpinned sibling of a `HeroScatterTile` (that is a
    // print pinned into a wall; this is a photo box that sits in normal flow, sized by the layout
    // around it). It crops what it is given, keeps the hairline ON TOP of the picture with an
    // `::after` (an inset ring paints under replaced content, so it would never show), and drifts in
    // on mount like everything else that arrives in a hero. Pure black/white alphas for that edge,
    // never a tinted neutral, which picks up the surface under it and reads as dirt.
    frame:
      "relative animate-stagger-in-blur overflow-hidden rounded-2xl bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] motion-reduce:animate-none dark:after:ring-white/10 [&>img]:size-full [&>img]:object-cover",
    // The mosaic: a band of pictures ACROSS THE TOP of a hero with the copy reading underneath it,
    // rather than a wall standing around it (`HeroScatter`) or one picture under it (`HeroMedia`).
    // Twelve tracks, so a tile can take a third, a quarter or a sixth of the row and every tile
    // still lands on one grid; each drops its own `mt-*` to break the top line, which is what keeps
    // the band from reading as a stock-photo grid. Two tracks while stacked, because four pictures
    // across a phone are four thumbnails.
    //
    // Viewport breakpoints, NOT container queries, and deliberately so: the tracks are declared on
    // the same element that would have to be the container, and an element cannot answer its own
    // container query, so a `@container … @2xl:grid-cols-12` here silently never fires. The
    // decorative layers (`scatter`, `cursors`, `stagePin`) can be size containers because the thing
    // being gated is always a CHILD of them. A section previewed in a docs frame still responds
    // correctly: the frame is an iframe, so its width is the viewport the `lg:` answers to.
    mosaic: "grid w-full grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-12",
  },
  variants: {
    layout: {
      centered: {
        content: "flex max-w-3xl flex-col items-center gap-4 pt-10 pb-16 text-center sm:pt-14 sm:pb-24",
        column: "items-center text-center",
        actions: "sm:justify-center",
        features: "justify-center",
        socialProof: "items-center",
        // The last rung of the ladder: the product sits 64px under the proof.
        media: "mt-12",
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
        // The band declares the parallax timeline whether or not anything reads it: it costs one
        // property on an element that is never transformed, and it is what lets a composer turn
        // the move on per instance with `<HeroBackground parallax>` instead of re-wiring the band.
        root: "hero-parallax-track grid min-h-[40rem] place-items-center text-white",
        content:
          "relative z-10 flex max-w-3xl flex-col items-center gap-4 py-20 text-center sm:py-28",
        column: "items-center text-center",
        subtitle: "text-white/75",
        actions: "sm:justify-center",
        features: "justify-center",
        feature: "text-white/80",
        socialProof: "items-center",
      },
      /**
       * The cover: a full-viewport photograph or clip with the copy standing on its bottom edge,
       * the headline in one corner and the paragraph in the other. Where `background` centers a
       * copy column in the middle of the band and treats the media as a backdrop for it, here the
       * media IS the statement and the copy is a caption laid along the foot of it, so the picture
       * keeps its whole frame. The editorial opener: an About page, a story, a collection.
       *
       * It takes the WHOLE viewport (`100svh`, the small viewport unit, so a phone's shrinking
       * browser chrome can never cut the caption off), with a floor for the short-and-wide case
       * (a landscape phone, a docs frame) where a caption on two lines needs more room than the
       * viewport is tall.
       *
       * And it does not stay full bleed: as the reader scrolls, the frame pulls in to the page's
       * own container (90rem, the `max-w-8xl` every other section sits in) and rounds its corners,
       * with the caption stepping in beside it, so the opening picture hands the page back to its
       * grid instead of ending at a hard seam. Pair it with `<HeroBackground parallax>` and the
       * picture drifts inside the frame while that happens. Both beats are scrubbed by the scroll
       * position through one CSS view timeline (`hero-cover-*` / `hero-parallax-*`,
       * app/globals.css): no animation library, no scroll listener, and nothing at all under
       * `prefers-reduced-motion`, where it stays the full-bleed cover it opened as.
       */
      cover: {
        // `bg-background`, not the media's own dark: once the frame has contracted, the page ground
        // is what shows in the gutter and through the rounded corners, so the band has to BE the
        // page there. Nothing of it is visible until then, since the frame covers the viewport.
        root: "hero-cover-band grid h-[100svh] min-h-[34rem] items-end bg-background text-white sm:[--hero-cover-pad:2rem]",
        // The frame that contracts: full bleed as the section opens, the site container by the end
        // of it. `after:` is the edge, never a ring on the layer: an inset ring paints UNDER the
        // picture, so it would be swallowed whole (memory inset-ring-under-children). Pure black
        // and white alphas, never a tinted neutral, which reads as dirt on a picture's edge.
        background:
          "hero-cover-frame after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] dark:after:ring-white/10",
        // The caption sits ON the picture's bottom edge, not in a band under it: `items-end` above
        // pins this row to the foot of the band and the padding here is the only thing holding it
        // off the edge. It rides the parallax lift, so the copy leaves a touch faster than the
        // picture behind it, and `hero-cover-caption` steps its padding in by exactly the gutter
        // the frame pulls in by, so the words never close on the frame's edge (app/globals.css).
        content:
          "hero-parallax-lift relative z-10 flex max-w-8xl flex-col items-start gap-6 px-(--hero-cover-caption-pad) pb-10 sm:px-(--hero-cover-caption-pad) sm:pb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        column: "items-start text-left",
        // The two corners of the caption are NOT a heading over a subtitle: they are set at the
        // same optical weight on opposite ends of one line, so the paragraph keeps a full reading
        // measure and its own left edge rather than trailing off the headline's.
        subtitle: "max-w-xl text-pretty text-white/85 lg:max-w-md lg:shrink-0",
        actions: "sm:justify-start",
        features: "justify-start",
        feature: "text-white/80",
        socialProof: "items-start",
        // Bottom-weighted, because that is where the words are. The stop sits at 40%, not the
        // middle: the caption can run five lines on a phone, so the wash has to be at full strength
        // well before the words start, and a symmetric gradient leaves the top of the copy on bare
        // picture. Above it the scrim is a whisper, so the frame opens on its own light instead of
        // under a grey pane. Literal `black/` is the documented scrim exception: a scrim over a
        // photograph is inherently dark and must not re-theme.
        scrim: "bg-gradient-to-t from-black/80 via-black/40 via-40% to-black/5",
      },
    },
    // `text-wrap: balance`, but for the checklist row. A wrapping flex row fills greedily, so a
    // four-item list that overflows by one strands the last item alone on its own line (3 + 1),
    // which reads as an orphan under a centered column. There is no `flex-wrap: balance`, so the
    // knob is a measure: capping the row at 36rem (the same order as a paragraph measure) makes
    // it break BEFORE the greedy row fills, and the items settle into even rows that each center
    // on their own axis (2 + 2). It only ever bites when the content is wider than the cap, so a
    // short list still sits on one line.
    balance: {
      true: { features: "max-w-xl" },
    },
    /**
     * What one feature IS. `inline` (default) is the checklist: a wrapping row of short
     * check-circle claims hugging the CTAs. `columns` promotes each item to a capability column,
     * an icon tile over a title and a sentence, on a three-track grid under the actions. Reach for
     * it when the three claims each deserve a sentence rather than three words and the page has no
     * room for a separate feature section below the fold. It is a GRID, not a wrapping row, so the
     * titles stay on one baseline however long each sentence runs, and it folds to a single stacked
     * column below `sm`.
     */
    featureLayout: {
      inline: {},
      columns: {
        // The next rung of the hero's rhythm ladder: the CTAs land 32px under the copy, this row 48px
        // under them, and the media 64px under that, so the eye reads "statement → act →
        // capabilities → product" as four separate beats. Capped at a 48rem measure so three
        // sentences stay readable instead of stretching the whole band.
        //
        // Nothing draws a line between the columns: the gutter alone separates them, so it has to
        // be wide (`gap-x-12`), the way any un-boxed multi-column list does, or the three blocks
        // read as one ragged paragraph.
        //
        // Three tracks across, three tracks DOWN (mark, title, sentence). Each column subgrids onto
        // those shared rows, so a title that wraps to two lines in one column pushes every
        // sentence down together instead of stranding its own neighbours half a line high: the
        // failure that shows up the moment the row is measured at tablet width rather than desktop.
        // The row gap is restated as `gap-3` on the column below so the subgrid's tracks and the
        // column's own spacing are the same 12px; `gap-y-10` only ever applies while stacked.
        features:
          "mt-8 grid w-full max-w-3xl grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-3 sm:grid-rows-[auto_auto_1fr] sm:gap-y-3",
        // Each column is its own stack, carried entirely by type and whitespace: no rule, no
        // padding, no surface. `justify-items-center` is load-bearing, NOT a duplicate of the
        // base `items-center`: that one is the flex cross axis, and the same declaration in a
        // grid is the BLOCK axis, so the mark would drop to the start of its track the moment the
        // column became a subgrid.
        feature:
          "flex flex-col gap-3 text-center text-sm font-normal [&_svg]:size-5 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:justify-items-center",
      },
    },
    // A HeroCursor's fill. Semantic roles only (the same tints Badge/Avatar use), so each cursor
    // tracks all four themes. The arrow and ripple read `currentColor` off the cursor root.
    cursorColor: {
      brand: { cursor: "text-brand", cursorLabel: "bg-brand text-white" },
      purple: { cursor: "text-purple", cursorLabel: "bg-purple" },
      teal: { cursor: "text-teal", cursorLabel: "bg-teal" },
      pink: { cursor: "text-pink", cursorLabel: "bg-pink" },
      orange: { cursor: "text-orange", cursorLabel: "bg-orange" },
      success: { cursor: "text-success", cursorLabel: "bg-success" },
    },
    // Which way the arrow points. The label always hangs on the side AWAY from the point, below the
    // arrow's body, and tilts the same way the body leans.
    cursorFacing: {
      left: { cursorLabel: "left-3.5 -rotate-6" },
      right: { cursorLabel: "right-3.5 rotate-6" },
    },
    // A tag that rolls through `labels` carries the metronome (`.hero-cursor-tick`, globals.css): an
    // invisible half-loop animation whose every iteration lands on a click, so the name changes
    // exactly as the arrow presses. It only runs while the cursor is shown and motion is allowed.
    cursorCycling: {
      true: { cursorLabel: "hero-cursor-tick" },
    },
    // The headline's scale, set on `HeroTitle`. `lg` (default) peaks at 60px, level with a
    // `SectionHeader size="lg"`; `xl` is the display cut for the page's one big statement, peaking
    // at 72px. It keeps `tracking-tight`: DM Sans follows its optical-size axis here, so at 72px it
    // already sets in its tight display cut, and `tracking-tighter` glues the words together ("built
    // for" read as one word). The -0.06em a static-font trace needed does not transfer.
    size: {
      lg: {},
      // The leading is restated: tailwind-merge treats a later base-prefix `text-4xl` as resetting
      // line-height, so it would drop the base slot's `leading-[1.1]` and the 72px title would set
      // solid at 1.0.
      xl: { title: "text-4xl leading-[1.1] sm:text-6xl lg:text-7xl" },
      // The poster cut, for a headline that IS the page: two or three words set at 96px along the
      // foot of a cover. It sets tighter than `xl` (`leading-[1.02]`), because a line this size is
      // read as a shape before it is read as words, and the scale's own leading opens a gap you
      // could park a sentence in. Keep it to a phrase: it is sized to fill a screen, not to hold a
      // sentence, and the leading that flatters two words shreds five lines.
      "2xl": { title: "text-5xl leading-[1.02] sm:text-7xl lg:text-8xl" },
    },
    /**
     * A `HeroScatterTile`'s size, and with it its place in the wall: the big cards read as the
     * foreground of the scatter, the small ones as its far edge. Square, like the event posters and
     * cover art they hold, and they step up twice as the hero widens so the wall keeps its density
     * instead of leaving one size stranded on a wide page.
     */
    scatterSize: {
      sm: { scatterTile: "size-16 @3xl:size-20 @5xl:size-24" },
      md: { scatterTile: "size-20 @3xl:size-24 @5xl:size-28" },
      lg: { scatterTile: "size-24 @3xl:size-28 @5xl:size-36" },
    },
    /**
     * How far back a card sits. `near` is full strength; `far` steps it into the page (a lighter
     * shadow and a little of the ground over it), so the wall reads as depth around the copy rather
     * than one flat plane of pictures.
     */
    scatterDepth: {
      near: {},
      far: { scatterTile: "opacity-70 shadow-md" },
    },
    /**
     * What the spread's panel is made of. `brand` is the poster half: the raw accent, the page's
     * loudest surface, with the white chip as its action (a brand band is never re-darkened for
     * contrast; the AA fix lives in the chip). `ink` pins the panel dark on every page theme by
     * re-declaring the tokens inside it, so its links, CTAs, hairlines and focus rings all resolve
     * their dark values with no hand-picked colours, and its action is the near-white `neutral`
     * fill. Both state `--surface`, the ground anything nested is really sitting on.
     */
    spreadTone: {
      brand: {
        spreadPanel: "bg-brand text-white [--surface:var(--brand)]",
        // The chip's label is `brand-strong`, not `brand`: contrast is symmetric, so a raw-accent
        // label on white is the same 3.6:1 as white on the accent, and the darker step is what
        // carries it to AA on all eight presets. Same call the on-media Button makes.
        spreadIndex: "bg-white text-brand-strong",
      },
      ink: {
        spreadPanel:
          "dark [color-scheme:dark] bg-background text-foreground [--surface:var(--background)]",
        // A hairline chip, not a filled one: on ink the panel's whole job is restraint, and a solid
        // near-white disc in the corner is the loudest thing on it. The mark reads as a page number
        // in a book, which is what it is.
        spreadIndex: "text-muted-foreground ring-1 ring-border",
      },
    },
    /**
     * A framed picture's ink. `mono` drops the colour out of it, which is how a mosaic of a dozen
     * unrelated photographs reads as one thing instead of a dozen competing palettes; the band's
     * own accent then stays the only colour on the page.
     */
    frameTone: {
      color: {},
      // The filter goes on the PICTURE, not on the frame: the frame's entrance keyframe
      // (`stagger-in-blur`) animates `filter` and settles on `filter: none`, so a `grayscale` on the
      // box would be wiped the moment the card landed. On the `<img>` the two never meet.
      mono: { frame: "[&>img]:grayscale" },
    },
  },
  compoundVariants: [
    // A capability column follows the layout it sits in: centered under a centered column (the
    // default above), flush-left in a `split`, where every other beat of the copy stack is
    // left-aligned and a centered column would read as a stray.
    {
      layout: "split",
      featureLayout: "columns",
      class: { feature: "items-start text-left sm:justify-items-start" },
    },
    // Over media the brand mark loses its contrast against a scrimmed photo, so the column flips
    // to white alphas: the glyph at full strength, the sentence stepped back, the same ladder the
    // subtitle already follows in this layout.
    {
      layout: "background",
      featureLayout: "columns",
      class: {
        featureMark: "text-white",
        featureTitle: "text-white",
        featureText: "text-white/75",
      },
    },
  ],
  defaultVariants: {
    layout: "centered",
    size: "lg",
    featureLayout: "inline",
    scatterSize: "md",
    scatterDepth: "near",
    spreadTone: "brand",
    frameTone: "color",
  },
})

type HeroSlots = ReturnType<typeof heroVariants>
const [HeroProvider, useHeroContext] = createContext<{ slots: HeroSlots }>("Hero")

export interface HeroProps extends React.ComponentProps<"section"> {
  /**
   * Composition: a single centered column (`centered`, default); a two-column `split` where a
   * `HeroColumn` of copy sits beside a `HeroMedia` visual; `background`, a full-bleed band that
   * centers one copy column over a `HeroBackground` photo or video (light copy on a scrim); or
   * `cover`, a full-viewport picture with the copy standing along its bottom edge, the headline in
   * one corner and the paragraph in the other. Set once here; every part reads it from context.
   */
  layout?: "centered" | "split" | "background" | "cover"
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

export interface HeroTitleProps extends React.ComponentProps<"h1"> {
  /**
   * `lg` peaks at 60px; `xl` is the display cut, peaking at 72px; `2xl` is the poster cut, peaking
   * at 96px, for the two or three words along the foot of a `cover`. @default "lg"
   */
  size?: "lg" | "xl" | "2xl"
}

export function HeroTitle({ className, size, ...props }: HeroTitleProps) {
  const { slots } = useHeroContext("HeroTitle")
  return <h1 data-slot="hero-title" className={slots.title({ size, className })} {...props} />
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

export interface HeroActionsProps extends React.ComponentProps<"div"> {
  /**
   * Control height for the row. A hero CTA is the biggest button on the page, so the row imposes
   * the marketing `xl` tier (44px, 16px label) once rather than each Button carrying a `size`; an
   * explicit one still wins. A field in the row (a signup Input) resolves `xl` to `lg`, so a hero
   * with an inline form passes `size="lg"` to keep the field and its button the same height.
   * @default "xl"
   */
  size?: ButtonSize
}

/** The CTA row: drop our `Button`s in here. */
export function HeroActions({ className, size = "xl", children, ...props }: HeroActionsProps) {
  const { slots } = useHeroContext("HeroActions")
  return (
    <div
      data-slot="hero-actions"
      data-control-size={size}
      className={slots.actions({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}

export type HeroFeatureLayout = "inline" | "columns"

// The row tells each item what shape it is. It is a `tv` variant, so both the `<ul>` and every
// `<li>` have to resolve it, and an `<li>` can't read a prop its parent took: hence a context of
// its own, the same way the Hero root shares `layout` (never prop-drilled, never cloned).
const [HeroFeaturesProvider, useHeroFeaturesContext] =
  createContext<{ layout: HeroFeatureLayout }>("HeroFeatures")

export interface HeroFeaturesProps extends React.ComponentProps<"ul"> {
  /**
   * Wrap the items into even rows instead of letting the last one strand alone on its own line:
   * the flex-row analogue of `text-wrap: balance`. Caps the row at a 36rem measure, so a list that
   * would break 3 + 1 breaks 2 + 2 and each row centers on the same axis. A list that already fits
   * the measure is untouched. Reach for it on any checklist of four or more items. `columns` runs
   * on a fixed grid, so it has nothing to balance and ignores this.
   */
  balance?: boolean
  /**
   * `inline` (default) is the wrapping check-circle checklist. `columns` lays the items out as
   * hairline-divided capability columns, each an icon tile over a title and a sentence: pass
   * `icon` and `title` to every `HeroFeature` inside, and three items, which is what the grid's
   * three tracks are cut for. @default "inline"
   */
  layout?: HeroFeatureLayout
}

/** Wrapper for the feature row; renders a `<ul>`. */
export function HeroFeatures({
  className,
  balance = false,
  layout = "inline",
  children,
  ...props
}: HeroFeaturesProps) {
  const { slots } = useHeroContext("HeroFeatures")
  return (
    <HeroFeaturesProvider layout={layout}>
      <ul
        data-slot="hero-features"
        data-layout={layout}
        className={slots.features({ balance, featureLayout: layout, className })}
        {...props}
      >
        {children}
      </ul>
    </HeroFeaturesProvider>
  )
}

// `title` is the column's heading, a ReactNode, so the native `title` tooltip attribute is
// omitted rather than narrowed (the same trade FooterColumn and SidebarButton make).
export interface HeroFeatureProps extends Omit<React.ComponentProps<"li">, "title"> {
  /**
   * `columns` only: the column's mark, rendered bare (no tile, no chip) in the brand accent. A
   * Phosphor icon in the house `bold` weight; the slot sizes it to 20px, so pass it without a
   * size of its own (`<ShieldCheck weight="bold" />`). Give every item in a `columns` row one
   * or give none of them one: the row's shared tracks line the marks, titles and sentences up
   * across all three columns, and a single item missing its mark shifts its own copy up a track.
   */
  icon?: React.ReactNode
  /**
   * `columns` only: the column's one-line claim, set above the sentence in `children`. Without it
   * the item stays the inline check-circle row, whatever the parent's layout.
   */
  title?: React.ReactNode
}

/**
 * One feature. In an `inline` row it is a checklist line carrying its own green check-circle
 * glyph; in a `columns` row, given a `title`, it becomes a capability column: the bare `icon`
 * mark, the title, then `children` as the supporting sentence.
 */
export function HeroFeature({ className, icon, title, children, ...props }: HeroFeatureProps) {
  const { slots } = useHeroContext("HeroFeature")
  const { layout } = useHeroFeaturesContext("HeroFeature")
  const columns = layout === "columns" && title !== undefined
  return (
    <li
      data-slot="hero-feature"
      className={slots.feature({ featureLayout: columns ? "columns" : "inline", className })}
      {...props}
    >
      {columns ? (
        <>
          {icon ? (
            <span aria-hidden className={slots.featureMark({ featureLayout: layout })}>
              {icon}
            </span>
          ) : null}
          <h3 className={slots.featureTitle({ featureLayout: layout })}>{title}</h3>
          {children ? (
            <p className={slots.featureText({ featureLayout: layout })}>{children}</p>
          ) : null}
        </>
      ) : (
        <>
          <CheckCircle weight="fill" aria-hidden className={slots.featureIcon()} />
          {children}
        </>
      )}
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
  /**
   * Star size, forwarded to `Rating`. `sm` (16px) sits beside a one-line label; `md` (20px) holds
   * its own next to a larger avatar stack, where 16px stars read as an afterthought. @default "sm"
   */
  size?: "sm" | "md" | "lg"
}

/** Our read-only `Rating` plus a label (e.g. "5.0 Ratings") passed as children. */
export function HeroRating({
  value = 5,
  max = 5,
  size = "sm",
  className,
  children,
  ...props
}: HeroRatingProps) {
  const { slots } = useHeroContext("HeroRating")
  return (
    <div data-slot="hero-rating" className={slots.rating({ className })} {...props}>
      <Rating readOnly value={value} max={max} size={size} aria-label="Rating" />
      {children}
    </div>
  )
}

/** The visual region: drop a product window, screenshot, or logo wall in here. */
export function HeroMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroMedia")
  return <div data-slot="hero-media" className={slots.media({ className })} {...props} />
}

export interface HeroBackgroundProps extends React.ComponentProps<"div"> {
  /**
   * Drift the media against the page as the reader scrolls: it travels slower than the band it
   * fills while the copy over it travels a little faster, so the two planes separate and the band
   * reads as a window rather than a picture glued to the page. Scrubbed by the scroll position
   * through a CSS view timeline (`hero-parallax-*`, app/globals.css), so there is no scroll
   * listener and no animation library; it holds still under reduced motion and in browsers without
   * scroll-driven animations, where the media simply covers its band.
   *
   * The media is held a quarter larger than its frame for the whole travel, which is the slack the
   * drift moves within, so it is cropped tighter than a still backdrop: give it a picture with room
   * around its subject. Retune with `[--hero-parallax-travel:…]` /
   * `[--hero-parallax-zoom:…]` on the hero, keeping travel at or under (zoom - 1) / 2.
   * @default false
   */
  parallax?: boolean
}

/**
 * The full-bleed media layer for a `layout="background"` or `layout="cover"` hero. Renders an
 * absolutely-positioned bottom layer that stretches its child to cover the section, then lays a
 * gradient scrim over it so the light copy stays legible on any photo. Drop a plain
 * `<img src=… alt="" />` or an autoplay, muted, looping `<video>` (or a next `<Image fill>`)
 * inside; sits behind `HeroContent`, which lifts above it. The section's `overflow-clip` (plus any
 * rounded corners) clips the media to the band, which is also what contains the parallax travel.
 */
export function HeroBackground({ parallax, className, children, ...props }: HeroBackgroundProps) {
  const { slots } = useHeroContext("HeroBackground")
  return (
    <div
      data-slot="hero-background"
      data-parallax={parallax ? "" : undefined}
      // The beat rides the picture inside this layer, never the layer itself: the layer is what
      // crops the travel, so it has to stay still (see `hero-parallax-media`).
      className={slots.background({ className: cn(parallax && "hero-parallax-media", className) })}
      {...props}
    >
      {children}
      <div data-slot="hero-scrim" aria-hidden className={slots.scrim()} />
    </div>
  )
}

/**
 * The multiplayer-cursor layer: place `HeroCursor`s inside it for the feel of a live, shared design
 * file. It covers the whole hero, sits above the copy but lets every click through, and is hidden
 * from assistive tech (the cursors say nothing a reader needs). It is a size container: its cursors
 * only show once the hero is at least 64rem wide, where the gutters beside the copy can hold them.
 */
export function HeroCursors({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroCursors")
  return <div data-slot="hero-cursors" aria-hidden className={slots.cursors({ className })} {...props} />
}

export type HeroCursorColor = "brand" | "purple" | "teal" | "pink" | "orange" | "success"

export interface HeroCursorProps extends React.ComponentProps<"div"> {
  /** The cursor and name-tag fill, a semantic color role. @default "brand" */
  color?: HeroCursorColor
  /** Which way the arrow points; the label hangs on the other side. @default "left" */
  facing?: "left" | "right"
  /** Seconds per loop (wander, pause and click, twice). Vary it per cursor. @default 16 */
  duration?: number
  /** Where in its loop the cursor starts, 0 to 1, so siblings never move in step. @default 0 */
  phase?: number
  /**
   * Names the tag rolls through, one step per click (twice a loop), in place of `children`. The
   * words swap with `AnimatedLabel` and the pill eases between their widths. Holds the first name
   * under reduced motion and while the cursor is hidden.
   */
  labels?: readonly string[]
}

// The pointer, drawn with its tip at the SVG origin so the anchor, the press origin and the ripple
// all share one point. `right` is the same arrowhead mirrored (drawn at negative x, painted through
// `overflow-visible`), which keeps `scale` free for the click keyframe: a `-scale-x-100` flip would
// write the same property and the press would cancel it.
const CURSOR_ARROW = {
  left: "M0 0 19 7 9.6 9.6 7 19Z",
  right: "M0 0-19 7-9.6 9.6-7 19Z",
}

/**
 * One cursor: an arrow, a click ripple, and an optional name tag (`children`). Position its TIP with
 * `className` (`left-*` / `top-*`). It wanders a slow loop, holds twice, and clicks at each hold;
 * give siblings different `duration` and `phase` values so they never sync. Resize the loop with
 * `[--cursor-x:…]` / `[--cursor-y:…]` (28px / 20px by default; a negative x mirrors it). It shows
 * once the hero is 64rem wide; a cursor that roams space the copy never reaches (above or below it)
 * can reveal sooner with `className="@2xl:block"` (a 42rem hero). Pass `labels` instead of children
 * and the name tag rolls to the next name on every click. Holds still under reduced motion. Render inside
 * `HeroCursors` (the container its reveal measures).
 */
export function HeroCursor({
  color = "brand",
  facing = "left",
  duration = 16,
  phase = 0,
  labels,
  className,
  style,
  children,
  ...props
}: HeroCursorProps) {
  const { slots } = useHeroContext("HeroCursor")
  const cycling = labels != null && labels.length > 1
  const variants = { cursorColor: color, cursorFacing: facing, cursorCycling: cycling }
  const [index, setIndex] = React.useState(0)
  // The roll is pinned to the edge the tag hangs from, so the pill grows away from the arrow.
  const label = labels?.length ? (
    <AnimatedLabel swapKey={index} align={facing === "left" ? "start" : "end"}>
      {labels[index % labels.length]}
    </AnimatedLabel>
  ) : (
    children
  )
  return (
    <div
      data-slot="hero-cursor"
      data-color={color}
      data-facing={facing}
      aria-hidden
      className={slots.cursor({ ...variants, className })}
      style={
        {
          "--cursor-duration": `${duration}s`,
          // A negative delay starts the loop part-way through instead of waiting before it begins.
          "--cursor-delay": `${-phase * duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div data-slot="hero-cursor-drift" className={slots.cursorDrift()}>
        <span data-slot="hero-cursor-ping" className={slots.cursorPing()} />
        <svg
          data-slot="hero-cursor-arrow"
          viewBox="0 0 20 20"
          strokeWidth={1.5}
          strokeLinejoin="round"
          className={slots.cursorArrow()}
        >
          <path d={CURSOR_ARROW[facing]} />
        </svg>
        {label != null ? (
          <span
            data-slot="hero-cursor-label"
            className={slots.cursorLabel(variants)}
            // One tick = one click. Only the metronome's own iterations count: the roll's layers
            // animate inside the tag too, and animation events bubble.
            onAnimationIteration={
              cycling
                ? (event) => {
                    if (event.target === event.currentTarget && event.animationName === "hero-cursor-tick")
                      setIndex((i) => (i + 1) % labels.length)
                  }
                : undefined
            }
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The poster-wall layer: place `HeroScatterTile`s inside it and the hero opens on a field of
 * pictures with the copy standing in the clearing at its centre. It covers the whole band, sits
 * behind the copy, never blocks a click, and is hidden from assistive tech (the wall is scenery:
 * anything a reader needs belongs in the copy). It is a size container, so each card shows and
 * grows against the hero's own width rather than the window's.
 */
export function HeroScatter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroScatter")
  return <div data-slot="hero-scatter" aria-hidden className={slots.scatter({ className })} {...props} />
}

export interface HeroScatterTileProps extends React.ComponentProps<"div"> {
  /** The card's size (square): `sm` reads as the far edge of the wall, `lg` as its foreground. @default "md" */
  size?: "sm" | "md" | "lg"
  /** How far back it sits: `far` steps it into the page behind the `near` cards. @default "near" */
  depth?: "near" | "far"
  /** Degrees it leans, positive clockwise. Keep the wall between about -12 and 12. @default 0 */
  tilt?: number
  /** ms this card waits before it drifts in, so the wall assembles card by card. @default 0 */
  delay?: number
}

/**
 * One card of the wall: a photo print (a padded surface around the picture) pinned by `className`,
 * which places it (`left-[8%] top-16`) and may hold it back until the hero is wide enough to have
 * room for it (`hidden @5xl:block`). Drop a plain `<img src alt="">` inside; the card sizes, rounds
 * and crops it. The tilt is set through the `rotate` property, not `transform`, so it survives the
 * entrance keyframe (which animates `transform`) instead of being flattened by it.
 */
export function HeroScatterTile({
  size,
  depth,
  tilt = 0,
  delay = 0,
  className,
  style,
  ...props
}: HeroScatterTileProps) {
  const { slots } = useHeroContext("HeroScatterTile")
  return (
    <div
      data-slot="hero-scatter-tile"
      className={slots.scatterTile({ scatterSize: size, scatterDepth: depth, className })}
      style={{ rotate: `${tilt}deg`, animationDelay: `${delay}ms`, ...style }}
      {...props}
    />
  )
}

/* ─────────────────────────── The scroll stage ────────────────────────────────────────────────
 * A hero that plays itself as the reader scrolls: one picture fills the screen under a display
 * word, contracts into a card, and a collage assembles around it. The movement is scrubbed by the
 * scroll position through a named CSS view timeline (the `hero-stage-*` utilities in
 * app/globals.css), so there is no scroll listener, no rAF loop, and no animation library: the
 * reader drives it, and running the page back up runs the hero backwards.
 *
 * Compose it INSTEAD of `HeroContent`, not inside it:
 *
 *   <Hero>
 *     <HeroStage>
 *       <HeroStageMedia>
 *         <img src={…} alt="" />
 *         <HeroStageTitle>Go further</HeroStageTitle>
 *       </HeroStageMedia>
 *       <HeroStageCard index={0} className="top-[14%] left-[6%] h-[22%] w-[18%]">
 *         <img src={…} alt="" />
 *       </HeroStageCard>
 *       <HeroStageReveal index={3} className="bottom-[9%]">…</HeroStageReveal>
 *     </HeroStage>
 *   </Hero>
 *
 * Every part is droppable: a stage with nothing but a `HeroStageMedia` is a picture that contracts,
 * and nothing else needs to exist for that to read.
 *
 * ONE RULE for anything placed on the stage: position it with inset utilities (`top-*`, `left-*`,
 * `inset-x-0`), never `translate-*` or `scale-*`. Tailwind v4 writes those to the standalone
 * `translate` and `scale` properties, which are exactly the two the entrance keyframe animates, so
 * a `-translate-x-1/2` would be overwritten mid-reveal and the part would slide sideways as it
 * arrives. The parts centre themselves, so there is nothing to translate.
 */

/**
 * The stage: a scroll track taller than the viewport with one pinned screen inside it. The track is
 * the section's real height and the only thing that declares the timeline; the pin is what the
 * reader sees. Children are absolutely positioned against the pin, so the contracting frame resizes
 * without ever reflowing what sits around it.
 *
 * Browsers with no scroll-driven animations, and readers who asked for reduced motion, get a single
 * viewport instead of three, holding the composition's LAST frame: the picture at its card size
 * with the collage assembled around it and the copy where it lands. A finished hero, not a
 * half-played one. Only the display word is missing there, since a word cut to fill a screen cannot
 * sit inside a card (see `HeroStageReveal` for where a headline goes when it must show at rest).
 */
export function HeroStage({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroStage")
  return (
    <div data-slot="hero-stage" className={slots.stage({ className })} {...props}>
      <div data-slot="hero-stage-pin" className={slots.stagePin()}>
        {children}
      </div>
    </div>
  )
}

export interface HeroStageMediaProps extends React.ComponentProps<"div"> {
  /**
   * Lay a bottom-weighted gradient over the picture so the display word holds on any photograph.
   * It leaves with the word, since it exists to carry it. Drop it (`scrim={false}`) for a picture
   * dark enough to take white lettering on its own, or when the stage carries no word at all.
   * @default true
   */
  scrim?: boolean
}

/**
 * The frame that contracts: full-bleed as the section opens, a centred card by the end of the
 * contraction. Drop a plain `<img src alt="">` or an autoplay, muted, looping `<video>` inside and
 * it is stretched to cover; because it COVERS rather than fits, the crop tightens as the frame
 * closes, so the picture reframes itself on the way down instead of just getting smaller.
 *
 * Put `HeroStageTitle` in here too, not beside it: the frame's own clip is what cuts the word down.
 *
 * Size the card it lands on with `[--hero-stage-w:…]` / `[--hero-stage-h:…]` on the stage, and its
 * corner with `[--hero-stage-radius:…]`.
 */
export function HeroStageMedia({ scrim = true, className, children, ...props }: HeroStageMediaProps) {
  const { slots } = useHeroContext("HeroStageMedia")
  return (
    <div data-slot="hero-stage-media" className={slots.stageMedia({ className })} {...props}>
      {children}
      {scrim ? <div data-slot="hero-stage-scrim" aria-hidden className={slots.stageScrim()} /> : null}
    </div>
  )
}

/**
 * The display line: the section's `<h1>`, set at poster scale over the full-bleed picture and gone
 * by the time the card lands. It is the real heading, not decoration, so the page keeps a proper
 * outline at every scroll position (fading to nothing is a visual state; the text stays in the
 * accessibility tree throughout).
 *
 * Given a plain string it leaves CHARACTER BY CHARACTER: the line as a whole grows past the frame
 * and lifts, while each letter slides up out of a mask of its own a beat after the one before it, so the word
 * comes apart as the camera passes through it rather than dissolving all at once. The split row is
 * hidden from assistive tech and the heading carries the text as its label, so a screen reader
 * still reads a word, never a column of letters. Pass anything that is not a plain string (a node,
 * a fragment) and the whole line simply leaves together.
 *
 * Retune the cascade with `[--hero-stage-exit-stagger:…]` (how far apart two letters sit; 0 turns
 * the stagger off) and the window with `[--hero-stage-exit-start/-end:…]`.
 *
 * Keep it SHORT, two or three words. It is sized in `vw` and will be trimmed by the contracting
 * frame, so a sentence would be unreadable at the top and shredded on the way down.
 */
export function HeroStageTitle({ className, children, ...props }: React.ComponentProps<"h1">) {
  const { slots } = useHeroContext("HeroStageTitle")
  const text = typeof children === "string" ? children : null
  return (
    <h1
      data-slot="hero-stage-title"
      // Split: the line keeps the growth and the lift, and hands the fade and the defocus to its
      // letters. Without these two the line would fade over its own fading letters (a dark band
      // through the middle of the cascade) and blur what is already blurred.
      className={slots.stageTitle({
        className: cn(
          text && "[--hero-stage-exit-blur:0px] [--hero-stage-exit-opacity:1]",
          className,
        ),
      })}
      aria-label={text ?? undefined}
      {...props}
    >
      {text ? (
        <span aria-hidden>
          {Array.from(text).map((char, i) => (
            <span key={i} className={slots.stageTitleMask()}>
              <span
                className={slots.stageTitleGlyph()}
                style={{ "--hero-stage-step": i } as React.CSSProperties}
              >
                {/* A real space in an `inline-block` cell collapses to nothing, taking the word gap
                    with it; a non-breaking one holds its width. */}
                {char === " " ? " " : char}
              </span>
            </span>
          ))}
        </span>
      ) : (
        children
      )}
    </h1>
  )
}

/** How far along the stagger a late part sits, as a style object the entrance's range reads. */
function stageStep(index: number, style?: React.CSSProperties) {
  return { "--hero-stage-step": index, ...style } as React.CSSProperties
}

export interface HeroStageRevealProps extends React.ComponentProps<"div"> {
  /**
   * Place in the stagger: 0 arrives first, then each step waits a little further into the scroll
   * (4% of the pin by default, retuned on the stage with `[--hero-stage-stagger:…]`). Number the
   * parts in the order you want them to land, not in DOM order. @default 0
   */
  index?: number
}

/**
 * A band of late copy: the eyebrow over the card, the lede and CTAs under it. It spans the stage and
 * centres its own children, so place it on the vertical axis alone (`top-[12%]`, `bottom-[9%]`) and
 * leave the horizontal to the part.
 *
 * It rises 1.75rem into place; `[--hero-stage-shift:-1.5rem]` drops it in from above instead, which
 * suits a band that sits above the card. Where the stage never animates it simply shows, so the
 * hero keeps its eyebrow, its lede and its CTA there. That also makes this the place to put an
 * ordinary `HeroTitle` when the section needs a headline visible at rest: the display word is a
 * scroll-time flourish and is gone by the last frame.
 */
export function HeroStageReveal({ index = 0, className, style, ...props }: HeroStageRevealProps) {
  const { slots } = useHeroContext("HeroStageReveal")
  return (
    <div
      data-slot="hero-stage-reveal"
      className={slots.stageReveal({ className })}
      style={stageStep(index, style)}
      {...props}
    />
  )
}

export interface HeroStageCardProps extends React.ComponentProps<"div"> {
  /** Place in the stagger, exactly as {@link HeroStageRevealProps.index}. @default 0 */
  index?: number
}

/**
 * One piece of the collage: a photograph that arrives around the card once the card has landed.
 * Drop a plain `<img src alt="">` inside; the card crops, rounds and lifts it. Place and size it
 * with inset utilities (`top-[14%] left-[6%] h-[22%] w-[18%]`) and gate the outer pieces on the
 * stage's own width (`hidden @3xl:block`) so a phone gets the two that fit rather than six that
 * pile onto the card.
 *
 * It rides the same beat as `HeroStageReveal` (they differ in what they are, not in when they
 * arrive), so a stage that never animates shows the collage assembled around the card.
 */
export function HeroStageCard({ index = 0, className, style, ...props }: HeroStageCardProps) {
  const { slots } = useHeroContext("HeroStageCard")
  return (
    <div
      data-slot="hero-stage-card"
      className={slots.stageCard({ className })}
      style={stageStep(index, {
        // Each card's picture breathes on its own clock and in its own direction, derived from the
        // index so a composer gets the variety for free: neighbours drifting in step read as the
        // whole wall swaying, which is the one way this effect goes wrong. Override any of the
        // three per card with `[--hero-stage-float-x:…]` and friends.
        "--hero-stage-float-duration": `${22 + index * 4}s`,
        "--hero-stage-float-x": index % 2 === 0 ? "-1.5%" : "1.8%",
        "--hero-stage-float-y": index % 3 === 0 ? "-2%" : "-1.2%",
        ...style,
      } as React.CSSProperties)}
      {...props}
    />
  )
}

/* ────────────────────────── The editorial spread ─────────────────────────────────────────────
 * A magazine opening: one photograph running to the page edge beside a panel of brand or ink, the
 * headline holding the top of that panel and the reading copy sitting at its foot. Compose it
 * INSTEAD of `HeroContent` (the panel pads itself, so a gutter around it would be a second one):
 *
 *   <Hero layout="split">
 *     <HeroSpread>
 *       <HeroSpreadMedia><img src={…} alt="" /></HeroSpreadMedia>
 *       <HeroSpreadPanel>
 *         <HeroSpreadIndex>01</HeroSpreadIndex>
 *         <HeroColumn>…the headline…</HeroColumn>
 *         <HeroColumn>…the copy and the CTAs…</HeroColumn>
 *       </HeroSpreadPanel>
 *     </HeroSpread>
 *   </Hero>
 *
 * `layout="split"` is what left-aligns the columns inside the panel; every part is droppable, so a
 * spread with no index, or with the panel alone, still reads.
 */

/** The two-track grid: the picture half and the panel half, stacked below `lg`. */
export function HeroSpread({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroSpread")
  return <div data-slot="hero-spread" className={slots.spread({ className })} {...props} />
}

/**
 * The picture half. Drop a plain `<img src alt="">` (or a muted, looping `<video>`) inside; it is
 * covered and cropped, never fitted, so the half is always full of photograph. Put the picture
 * FIRST in the DOM and it leads on a phone, where the halves stack.
 */
export function HeroSpreadMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroSpreadMedia")
  return <div data-slot="hero-spread-media" className={slots.spreadMedia({ className })} {...props} />
}

export interface HeroSpreadPanelProps extends React.ComponentProps<"div"> {
  /** The panel's surface: the raw accent (`brand`) or a slab pinned dark on every theme (`ink`). @default "brand" */
  tone?: "brand" | "ink"
}

/**
 * The inked half. Give it exactly two groups: `justify-between` pushes the first to the top edge
 * and the second to the foot, and the emptiness between them is the composition. Over `brand` the
 * lead action is the white chip (`<Button tone="onMedia">`); over `ink` it is `variant="neutral"`.
 */
export function HeroSpreadPanel({ tone, className, ...props }: HeroSpreadPanelProps) {
  const { slots } = useHeroContext("HeroSpreadPanel")
  return (
    <div
      data-slot="hero-spread-panel"
      className={slots.spreadPanel({ spreadTone: tone, className })}
      {...props}
    />
  )
}

export interface HeroSpreadIndexProps extends React.ComponentProps<"div"> {
  /** The panel tone it sits on, so the chip inverts with it. @default "brand" */
  tone?: "brand" | "ink"
}

/**
 * The chapter mark in the panel's outer corner ("01", "3", "A"). It is furniture, not information:
 * hidden from assistive tech, because a screen reader announcing a lone number above a headline is
 * noise. Anything a reader actually needs belongs in the copy.
 */
export function HeroSpreadIndex({ tone, className, ...props }: HeroSpreadIndexProps) {
  const { slots } = useHeroContext("HeroSpreadIndex")
  return (
    <div
      data-slot="hero-spread-index"
      aria-hidden
      className={slots.spreadIndex({ spreadTone: tone, className })}
      {...props}
    />
  )
}

/* ────────────────────────── The statement ────────────────────────────────────────────────────
 * The hero that is one sentence: a belief set at display scale, a sign-off under it, and a single
 * picture in the space left over. Use `HeroStatement` INSTEAD of `HeroTitle` (it is the section's
 * `<h1>`, so there is only ever one of them), and mark a phrase inside it with `HeroHighlight` the
 * same way a headline does.
 */

/**
 * The statement itself: the section's `<h1>`, set at display scale on a ~36-character measure so a
 * long sentence breaks into four or five lines instead of running the width of the band. Keep it to
 * one sentence; a second belongs in a `HeroSubtitle` under the sign-off.
 */
export function HeroStatement({ className, ...props }: React.ComponentProps<"h1">) {
  const { slots } = useHeroContext("HeroStatement")
  return <h1 data-slot="hero-statement" className={slots.statement({ className })} {...props} />
}

/**
 * The sign-off: a letter's closing in two or three short lines ("Sincerely," / "The studio"). One
 * line per child; it is the quietest type on the band by design.
 */
export function HeroSignoff({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroSignoff")
  return <div data-slot="hero-signoff" className={slots.signoff({ className })} {...props} />
}

/* ────────────────────────── The mosaic and its frames ────────────────────────────────────────
 * A band of pictures across the top of a hero with the copy reading underneath it: the "our story"
 * opening, where the page leads on the people and the product waits its turn. The tiles are
 * `HeroFrame`s placed on the mosaic's twelve tracks, each breaking the top line with its own
 * `mt-*`; `tone="mono"` is what holds a dozen unrelated photographs together as one picture.
 *
 *   <HeroMosaic className="-mt-10">
 *     <HeroFrame tone="mono" delay={0} className="aspect-square @2xl:col-span-3">
 *       <img src={…} alt="" />
 *     </HeroFrame>
 *     …
 *   </HeroMosaic>
 */

/** The picture band: a twelve-track grid of `HeroFrame`s, two tracks wide while stacked. */
export function HeroMosaic({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useHeroContext("HeroMosaic")
  return <div data-slot="hero-mosaic" className={slots.mosaic({ className })} {...props} />
}

export interface HeroFrameProps extends React.ComponentProps<"div"> {
  /** The picture's ink: `mono` drops its colour so a wall of photographs reads as one. @default "color" */
  tone?: "color" | "mono"
  /** ms this frame waits before it drifts in, so a row of them arrives one after the other. @default 0 */
  delay?: number
}

/**
 * One framed picture: a rounded, cropping box with a hairline over the photograph. Give it its own
 * shape with `className` (`aspect-square`, `aspect-[4/5]`, a `max-w-*`) and a plain
 * `<img src alt="">` inside. It drifts in on mount and holds still under reduced motion.
 */
export function HeroFrame({ tone, delay = 0, className, style, ...props }: HeroFrameProps) {
  const { slots } = useHeroContext("HeroFrame")
  return (
    <div
      data-slot="hero-frame"
      className={slots.frame({ frameTone: tone, className })}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    />
  )
}
