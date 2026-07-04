"use client"

import * as React from "react"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * SectionHeader: the canonical section lede that every section opens with, the "header" half of
 * the universal `header + content` shape. Multi-part like Card/Hero: one `tv` recipe with `slots`
 * shared through a typed Context, so every part reads the same `align`/`orientation`/`size` styles
 * (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * Pure layout, composed from existing Koala parts: drop a `Badge` at the top of
 * `SectionHeaderText` for the eyebrow, and our `Button`s (or an `Input` + `Button`) into
 * `SectionHeaderActions`. The eyebrow Badge is ALWAYS the `dot` variant (`<Badge variant=… dot
 * pill>`); marketing sections never show a filled, icon, or outline Badge. Two orthogonal axes:
 *   - `align`: "left" (default) or "center" the whole block.
 *   - `orientation`: "stacked" (actions below the text) or "split" (actions beside the text on a
 *     row from `lg` up). `split` only applies when left-aligned; centered always stacks.
 *
 * This generalizes the landing-only `SectionHeading` (components/landing/section.tsx): same lede,
 * plus a Badge eyebrow, a CTA row, and the alignment/orientation axes. That landing primitive can
 * migrate onto SectionHeader later; Hero stays its own (bigger, fixed-centered) component.
 */
export const sectionHeaderVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-6",
    // Groups the lede (eyebrow Badge + heading + description) so it can sit beside the actions in
    // `split`, and so alignment applies to the text as a unit.
    text: "flex flex-col gap-4",
    heading: "font-semibold tracking-tight text-balance text-foreground",
    // `text-balance` (not `text-pretty`) on the lede copy too: a section description is a short
    // 1–3 line lede inside `max-w-2xl`, not a long body paragraph, so balancing the line lengths
    // reads better than `pretty`'s greedy-wrap-with-orphan-guard, especially when centered (where
    // a long first line + a stub last line is most visible). Balance's ~6-line cap never bites a
    // lede this short.
    description: "text-balance text-muted-foreground",
    // On a phone the CTAs stack one under the other and go full-width, the standard mobile CTA layout,
    // so a two-button pair never sits cramped side by side or wraps awkwardly. From `sm` up they return
    // to a wrapping row (`sm:flex-row`), vertically centered, and the `align` variant's `justify-*`
    // takes over the horizontal placement (below `sm` the buttons already fill the row, so justify is
    // moot and is gated behind `sm:`). `self-stretch` (dropped at `sm:self-auto`) is what actually
    // reaches 100%: in `align="left"` the root is already `align-items: stretch` so it's a no-op, but in
    // `center` the root is `items-center`, so without it this actions box shrinks to its buttons' content
    // width and `items-stretch` only fills *that*. `self-stretch` makes the row own the block's width in
    // either case; `self-*` (not `w-full`) so a per-instance `max-w-*` cap still wins.
    actions:
      "flex flex-col items-stretch gap-3 self-stretch sm:flex-row sm:flex-wrap sm:items-center sm:self-auto",
  },
  variants: {
    align: {
      left: {
        text: "items-start text-left",
        actions: "sm:justify-start",
      },
      center: {
        root: "items-center",
        // `w-full` so the capped block still shrinks to the viewport: as a flex item under the root's
        // `items-center`, the text would otherwise size to its (max-w-2xl-capped) max-content and
        // overflow a narrow screen with long copy. `w-full` + `max-w-2xl` = fill-but-cap; `mx-auto`
        // keeps it centered on wide screens.
        text: "w-full mx-auto max-w-2xl items-center text-center",
        actions: "sm:justify-center",
      },
    },
    orientation: {
      stacked: {},
      split: {},
    },
    size: {
      sm: { heading: "text-2xl sm:text-3xl", description: "text-sm sm:text-base" },
      md: { heading: "section-heading", description: "text-base sm:text-lg" },
      lg: { heading: "text-4xl sm:text-5xl lg:text-6xl", description: "text-lg" },
    },
  },
  compoundVariants: [
    {
      // Split lays the lede and actions side by side from `lg` up; it only makes sense
      // left-aligned (centered always stacks). Below `lg` it falls back to the stacked column.
      orientation: "split",
      align: "left",
      class: {
        root: "lg:flex-row lg:items-center lg:justify-between lg:gap-10",
        text: "lg:max-w-2xl",
        actions: "lg:shrink-0",
      },
    },
  ],
  defaultVariants: { align: "left", orientation: "stacked", size: "md" },
})

/**
 * The inline media chip you drop *inside* `SectionHeaderHeading`, between the words: a `framed` tile
 * that holds a logo, icon, or image (the app-icon look, dropped into the headline), or a `bare` glyph
 * or emoji interleaved with the copy. Everything is sized in `em`, so one chip reads right at any
 * `size` and breakpoint without per-use tuning: the tile, its radius, the glyph inside, and the
 * optical nudge all track the heading's font size. Separate single-part recipe (its `variant` axis is
 * its own, independent of the header's `align`/`orientation`/`size`).
 */
export const sectionHeaderChipVariants = tv({
  base: [
    // Flows inline with the heading and holds its child centered.
    "inline-flex shrink-0 items-center justify-center align-middle",
    // `align-middle` lands the chip on the x-height; nudge it up so it centers on the cap height of
    // the display text (in `em`, so the nudge scales with the heading too).
    "-translate-y-[0.06em]",
  ],
  variants: {
    variant: {
      // A rounded tile (surface + ring + lift) that frames a logo/icon/image inline in the headline.
      // `overflow-hidden` clips a full-bleed image to the tile's concentric radius; a bare glyph
      // sits centered on the `bg-card` surface. The `:not([class*='size-'])` guard lets a caller
      // pass `size-full` (fill the tile) or any explicit size without fighting the default.
      framed: [
        "size-[1.16em] overflow-hidden rounded-[0.26em]",
        "bg-card text-foreground ring-1 ring-border shadow-sm",
        "[&_svg:not([class*='size-'])]:size-[0.62em] [&_img:not([class*='size-'])]:size-[0.62em]",
      ],
      // No box: a bare glyph or emoji scaled to about the cap height, for icons and emoji interleaved
      // between the words.
      bare: [
        "[&_svg:not([class*='size-'])]:size-[0.9em] [&_img:not([class*='size-'])]:size-[0.9em]",
      ],
    },
  },
  defaultVariants: { variant: "framed" },
})

/**
 * Default gap between each cascade unit's entrance, in ms, when `stagger` is `true`. Matches the
 * `Stagger` primitive (lib/stagger.tsx) so the whole DS cascades at one cadence; a number passed to
 * `stagger` overrides it per-header.
 */
const STAGGER_STEP = 70

/**
 * The granularity of the cascade: what counts as one "unit" that rises in on its own beat.
 *   - `"phrase"` (default): each part is a unit (eyebrow, heading, description, actions) — the lede
 *     reveals block by block.
 *   - `"word"`: every word of the heading and description is a unit, so the copy types itself in
 *     word by word (the eyebrow and actions stay whole units, sequenced at the ends).
 */
export type SectionHeaderStaggerBy = "phrase" | "word"

/**
 * When the cascade fires:
 *   - `"mount"` (default): on first render, the right gate for an above-the-fold "load" reveal.
 *   - `"inView"`: the first time the header scrolls into the viewport, so a section deep down the
 *     page reveals as the reader reaches it instead of having already finished off-screen.
 */
export type SectionHeaderStaggerTrigger = "mount" | "inView"

type SectionHeaderSlots = ReturnType<typeof sectionHeaderVariants>
const [SectionHeaderProvider, useSectionHeaderContext] = createContext<{
  slots: SectionHeaderSlots
  /** The per-unit delay in ms when staggering, or `null` when the cascade is off. */
  staggerStep: number | null
  /** Whether one unit is a part (`"phrase"`) or a word (`"word"`). */
  staggerBy: SectionHeaderStaggerBy
  /** Whether the entrance defocuses (4px → 0 blur) as well as rises and fades. */
  staggerBlur: boolean
  /** Hold the cascade at its start (the `inView` trigger before the header is on screen). */
  staggerPaused: boolean
  /** The cascade slot the actions row lands on, so it follows the last lede unit (see root). */
  actionsIndex: number
}>("SectionHeader")

export interface SectionHeaderProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof sectionHeaderVariants> {
  /**
   * Cascade the lede in on mount: the eyebrow, heading, description, then the actions row each
   * rise-and-fade one beat after the last (the "split and stagger" entrance, not one block). Opt
   * in per-header so a page chooses where motion earns its keep:
   *   - `false` (default): no entrance, the header simply renders.
   *   - `true`: cascade at the DS's {@link STAGGER_STEP}ms cadence.
   *   - a number: cascade at that many ms between units (tighter or looser).
   * Plays once on mount (the right gate for a "load" cascade) and honors `prefers-reduced-motion`
   * (units appear at once). Backed by the shared `animate-stagger-in` token, so it reads identically
   * to the `Stagger` primitive used elsewhere. @default false
   */
  stagger?: boolean | number
  /**
   * The unit the cascade steps through when `stagger` is on: `"phrase"` (default) reveals the lede
   * part by part; `"word"` reveals the heading and description word by word. @default "phrase"
   */
  staggerBy?: SectionHeaderStaggerBy
  /**
   * Add a 4px → 0 defocus to the entrance so each unit resolves into focus as it arrives, on top of
   * the rise and fade. Off by default; pairs especially well with `staggerBy="word"`. @default false
   */
  staggerBlur?: boolean
  /**
   * When the cascade fires: `"mount"` (default) plays on first render; `"inView"` waits until the
   * header scrolls into view, so a section below the fold reveals as the reader reaches it rather
   * than finishing off-screen. Reach for `"inView"` on any header that isn't above the fold.
   * @default "mount"
   */
  staggerTrigger?: SectionHeaderStaggerTrigger
}

/**
 * Parts are exported individually (not `SectionHeader.Text` dot-notation): namespaced statics
 * don't survive the RSC server→client boundary. Compose as
 * `<SectionHeader><SectionHeaderText>…</SectionHeaderText><SectionHeaderActions>…`.
 */
export function SectionHeader({
  align,
  orientation,
  size,
  stagger = false,
  staggerBy = "phrase",
  staggerBlur = false,
  staggerTrigger = "mount",
  ref,
  className,
  children,
  ...props
}: SectionHeaderProps) {
  const slots = sectionHeaderVariants({ align, orientation, size })
  // Normalize the friendly `stagger` switch to a single delay: false → off, true → the DS step, a
  // number → that step.
  const staggerStep = stagger === false ? null : stagger === true ? STAGGER_STEP : stagger

  // The `inView` trigger holds the cascade until the header is on screen. `visible` starts true for
  // every other case (mount trigger, or stagger off) so the animation plays on the first frame as
  // before; only an armed `inView` header starts hidden and flips on intersect.
  const armInView = staggerStep != null && staggerTrigger === "inView"
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = React.useState(!armInView)

  React.useEffect(() => {
    if (!armInView || visible) return
    const el = rootRef.current
    if (!el) return
    // Set state from the observer callback (not synchronously in the effect body) to stay clear of
    // the repo's strict react-hooks rules; reveal a touch before the header is fully in view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [armInView, visible])

  const staggerPaused = armInView && !visible

  // Keep the IntersectionObserver target while still honoring a forwarded ref (no merge util in the
  // repo, so compose inline in the commit-phase callback, never during render).
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  // Continue the cascade from the lede onto the actions row: sum the units in the text block so the
  // actions land on the *next* slot (eyebrow → heading → description → actions), with no stutter
  // whatever the granularity. In word mode a part can be many units; in phrase mode each is one. A
  // single shallow read of the children, never a recursive walk.
  let actionsIndex = 0
  if (staggerStep != null) {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === SectionHeaderText) {
        React.Children.forEach(child.props.children, (unit) => {
          actionsIndex += unitCount(unit, staggerBy)
        })
      }
    })
  }

  return (
    <SectionHeaderProvider
      slots={slots}
      staggerStep={staggerStep}
      staggerBy={staggerBy}
      staggerBlur={staggerBlur}
      staggerPaused={staggerPaused}
      actionsIndex={actionsIndex}
    >
      <div ref={setRef} data-slot="section-header" className={slots.root({ className })} {...props}>
        {children}
      </div>
    </SectionHeaderProvider>
  )
}

/** The shared entrance utility: the rise + fade, with the optional 4px → 0 defocus. When `paused`
 *  (the `inView` trigger before the header is on screen), the animation is held at its `from` state
 *  by `animation-play-state: paused` + the keyframe's `both` fill, so nothing flashes; flipping it to
 *  running on intersect plays the cascade from the start. Reduced-motion drops the animation entirely
 *  (so `paused` is moot and the content is simply visible). */
function staggerInClass(blur: boolean, paused = false) {
  return cn(
    blur ? "animate-stagger-in-blur" : "animate-stagger-in",
    paused && "[animation-play-state:paused]",
    "motion-reduce:animate-none",
  )
}

/** Split a part's text into words, or `null` when it isn't a plain string (then treat it as one
 *  unit, so markup-bearing headings degrade gracefully instead of being torn apart). */
function splitWords(children: React.ReactNode): string[] | null {
  if (typeof children !== "string") return null
  const words = children.split(/\s+/).filter(Boolean)
  return words.length > 1 ? words : null
}

/** How many cascade units a direct child of `SectionHeaderText` contributes, for the granularity:
 *  one per part in phrase mode; one per word for the heading/description in word mode. */
function unitCount(child: React.ReactNode, by: SectionHeaderStaggerBy): number {
  if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return 0
  if (by === "word" && (child.type === SectionHeaderHeading || child.type === SectionHeaderDescription)) {
    const words = splitWords(child.props.children)
    if (words) return words.length
  }
  return 1
}

/**
 * Wrap each word of a text part in its own inline-block span so it can rise + fade (+ blur) in turn;
 * `base` is the global slot the part starts on, so the cascade stays continuous across the eyebrow,
 * heading, and description. Words are inline-block (transforms don't apply to raw inline text) and
 * separated by real space nodes so the line still wraps naturally. The inline `animation-delay`
 * longhand beats the `animation` shorthand's reset regardless of stylesheet order.
 */
function renderStaggerWords(
  words: string[],
  base: number,
  step: number,
  blur: boolean,
  paused: boolean,
) {
  const cls = cn("inline-block", staggerInClass(blur, paused))
  return words.map((word, i) => (
    <React.Fragment key={i}>
      <span className={cls} style={{ animationDelay: `${(base + i) * step}ms` }}>
        {word}
      </span>
      {i < words.length - 1 ? " " : null}
    </React.Fragment>
  ))
}

/** The lede group: put the eyebrow `Badge`, `SectionHeaderHeading`, and description inside it. */
export function SectionHeaderText({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots, staggerStep, staggerBy, staggerBlur, staggerPaused } =
    useSectionHeaderContext("SectionHeaderText")
  return (
    <div data-slot="section-header-text" className={slots.text({ className })} {...props}>
      {staggerStep == null
        ? children
        : staggerChildren(children, staggerStep, staggerBy, staggerBlur, staggerPaused)}
    </div>
  )
}

/**
 * Sequence the lede's direct children (eyebrow, heading, description) into one cascade. Each child
 * gets a running `base` slot; a word-mode text part is handed its `base` (via an internal prop) and
 * splits its own words from there, while every other unit (the eyebrow, or any part in phrase mode)
 * is shallow-cloned with the entrance class and a one-slot delay. Only direct children are cloned
 * (never descendants, per the DS no-recursive-clone rule); word splitting is owned by the part
 * itself, not reached into from here. Mirrors the `Stagger` primitive's per-unit delay.
 */
function staggerChildren(
  children: React.ReactNode,
  step: number,
  by: SectionHeaderStaggerBy,
  blur: boolean,
  paused: boolean,
) {
  let base = 0
  return React.Children.map(children, (child) => {
    if (!React.isValidElement<StaggerableProps>(child)) return child
    const start = base
    const isTextPart =
      child.type === SectionHeaderHeading || child.type === SectionHeaderDescription
    // Word mode hands a splittable text part its starting slot; the part animates its own words.
    const words = by === "word" && isTextPart ? splitWords(child.props.children) : null
    base += words ? words.length : 1
    if (words) {
      return React.cloneElement(child, { _staggerBase: start })
    }
    // Everything else (the eyebrow, any part in phrase mode, or text we couldn't split) rises as a
    // single block.
    return React.cloneElement(child, {
      className: cn(staggerInClass(blur, paused), child.props.className),
      style: { animationDelay: `${start * step}ms`, ...child.props.style },
    })
  })
}

/** Props every cloned lede child may receive: the className/style for a block entrance, or the
 *  internal `_staggerBase` slot for a word-mode text part. */
interface StaggerableProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /** @internal Injected by `staggerChildren` in word mode; the part's first cascade slot. */
  _staggerBase?: number
}

export interface SectionHeaderHeadingProps extends React.ComponentProps<"h2"> {
  /** Semantic heading level (the visual scale is the SectionHeader `size` prop). @default 2 */
  level?: 1 | 2 | 3
}

/** The heading. `level` picks the tag (h1/h2/h3); the visual size comes from `size` on the root. */
export function SectionHeaderHeading({
  level = 2,
  className,
  children,
  _staggerBase,
  ...props
}: SectionHeaderHeadingProps & { _staggerBase?: number }) {
  const { slots, staggerStep, staggerBlur, staggerPaused } =
    useSectionHeaderContext("SectionHeaderHeading")
  const Tag = `h${level}` as "h1" | "h2" | "h3"
  // In word mode `staggerChildren` hands us our starting slot; split the copy and cascade each word.
  const words = _staggerBase != null && staggerStep != null ? splitWords(children) : null
  return (
    <Tag data-slot="section-header-heading" className={slots.heading({ className })} {...props}>
      {words
        ? renderStaggerWords(words, _staggerBase!, staggerStep!, staggerBlur, staggerPaused)
        : children}
    </Tag>
  )
}

/** The muted supporting paragraph under the heading. */
export function SectionHeaderDescription({
  className,
  children,
  _staggerBase,
  ...props
}: React.ComponentProps<"p"> & { _staggerBase?: number }) {
  const { slots, staggerStep, staggerBlur, staggerPaused } =
    useSectionHeaderContext("SectionHeaderDescription")
  const words = _staggerBase != null && staggerStep != null ? splitWords(children) : null
  return (
    <p data-slot="section-header-description" className={slots.description({ className })} {...props}>
      {words
        ? renderStaggerWords(words, _staggerBase!, staggerStep!, staggerBlur, staggerPaused)
        : children}
    </p>
  )
}

/** The CTA row: drop our `Button`s in here, or an `Input` + `Button` for a newsletter lede. */
export function SectionHeaderActions({ className, style, ...props }: React.ComponentProps<"div">) {
  const { slots, staggerStep, staggerBlur, staggerPaused, actionsIndex } =
    useSectionHeaderContext("SectionHeaderActions")
  // When the header staggers, the actions arrive as one final chunk (the CTAs land together), one
  // slot after the last lede unit rather than animating each button separately.
  const staggered = staggerStep != null
  return (
    <div
      data-slot="section-header-actions"
      className={slots.actions({
        className: staggered ? cn(staggerInClass(staggerBlur, staggerPaused), className) : className,
      })}
      style={staggered ? { animationDelay: `${actionsIndex * staggerStep}ms`, ...style } : style}
      {...props}
    />
  )
}

export interface SectionHeaderChipProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof sectionHeaderChipVariants> {}

/**
 * An inline media chip for the heading: a `framed` tile (default) that holds a logo, icon, or image,
 * or a `bare` glyph/emoji, dropped between the words of `SectionHeaderHeading` so a mark or emoji
 * flows inline with the copy. Sized entirely in `em`, so it scales with the heading at every `size`
 * and breakpoint. Decorative by default (`aria-hidden`, so a screen reader reads the heading as pure
 * text); pass an `aria-label` when the chip carries meaning the surrounding words don't, and it stays
 * announced.
 */
export function SectionHeaderChip({ variant, className, ...props }: SectionHeaderChipProps) {
  // Decorative flourish by default (`aria-hidden`, so the heading reads as pure text); an explicit
  // `aria-label` opts the chip back into the accessible name as an image with that label.
  const labelled = props["aria-label"] != null
  return (
    <span
      data-slot="section-header-chip"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={sectionHeaderChipVariants({ variant, className })}
      {...props}
    />
  )
}
