"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { ImageSquare, Warning } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { duration } from "@/lib/motion"
import { tv, type VariantProps } from "@/lib/tv"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Progress, type ProgressProps } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

/**
 * Generation: the card a model fills while it paints a picture. You hand it a prompt, it shows
 * you the frame it is painting into, and the picture develops in that frame. The 6th piece of the
 * AI module (after PromptInput, Chat, AIPanel, Suggestions and Plan).
 *
 * The frame is the whole idea. A generation is a wait with a shape: you know how big the picture
 * will be long before you know what is in it, so the canvas takes its ratio up front and never
 * resizes — the shimmer, the percentage, the failure and the finished photograph all happen inside
 * one box that never moves. Nothing here reflows between states, which is why a grid of four
 * variations settling one by one reads as a contact sheet developing rather than as a layout
 * jumping.
 *
 * The picture does not appear, it COMES THROUGH. Mount a `GenerationImage` as soon as you have
 * a URL — not when you are finished — and it sits under a halftone screen whose holes open as
 * `progress` climbs: at 62% you are looking at the picture through a plate that is 62% open,
 * everywhere at once. The percentage stops being a number beside the picture and becomes the
 * picture.
 *
 * Nothing sweeps, nothing blurs, nothing is coloured but the picture, and nothing moves in a
 * direction. A shimmer, a blurred veil, a brand-tinted field, a lit hairline and a top-to-bottom
 * wipe were each built and each thrown out: every one of them read as an effect laid over the work
 * rather than as the work itself.
 *
 * The reveal is a registered custom property (`--generation-reveal`, globals.css), so it
 * INTERPOLATES: a model reporting 40 → 62 → 100 reads as one continuous movement instead of three
 * jumps, and finishing simply carries it to 100 rather than cutting. The picture fades up as its
 * bytes decode, so a cache miss looks like a photograph arriving rather than a gap. Swap the `src`
 * and it all happens again: a regenerate is the same frame being re-exposed, not a new box.
 *
 * Built like Card/Plan: one `tv` recipe with `slots`, shared state through React Context, never
 * prop-drilled or cloned. See docs/ARCHITECTURE.md §2. The geometry is the DS's inset-media
 * geometry (CardMedia): the picture sits 8px in from the card's edge at every density, with the
 * concentric radius that follows from it, and the copy keeps its own, wider, measure.
 */
export const generationVariants = tv({
  slots: {
    root: "flex min-w-0 flex-col text-card-foreground",
    // The eyebrow row: a small muted glyph, the label, then whatever trails (a chip, icon actions).
    header: "flex items-center gap-2",
    // A bare glyph, not a tinted tile — the quiet identity mark Plan established for AI cards.
    icon: "shrink-0 text-muted-foreground [&_svg]:size-4",
    label: "min-w-0 truncate text-sm font-medium text-muted-foreground",
    actions: "ml-auto flex shrink-0 items-center gap-0.5",
    /**
     * The prompt, as the model received it. Muted and quiet: it is what you already said, so it
     * sits below the identity line and above the picture without competing with either.
     */
    prompt: "text-pretty text-sm text-muted-foreground",
    /**
     * The frame. Everything that happens during a generation happens inside this box, and the box
     * is sized by its `ratio` before there is anything to put in it — so the card stands at its
     * final height from the first frame and nothing below it ever jumps.
     *
     * Its own chrome, in stacking order: the picture, the halftone screen it comes through, then:
     *   - `after:` is the image edge ring, painted OVER the picture (an inset ring on the `<img>`
     *     or on the frame lands under it) in pure black / pure white, so it never picks up a tint
     *     from the surface below it (make-interfaces #11).
     *   - a `Progress` dropped straight in is pinned to the bottom edge, where a render bar reads
     *     as the picture filling in rather than as a control laid on top of it.
     */
    canvas: [
      // Declares the surface it paints, so a control laid over an empty frame (a Retry on a failed
      // one, say) gets its ring offset from the muted ground and not from the page behind it.
      "group/canvas relative isolate mx-2 overflow-hidden rounded-lg bg-muted [--surface:var(--muted)]",
      "after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] dark:after:ring-white/10",
      // A failed frame is tinted, not slabbed: enough for the eye to find it in a sheet of four.
      "data-[status=failed]:bg-destructive/5",
      "[&>[data-slot=progress]]:absolute [&>[data-slot=progress]]:inset-x-0 [&>[data-slot=progress]]:bottom-0 [&>[data-slot=progress]]:z-20",
      // A tile arrives on the DS entrance; a grid staggers the delays (see the `grid` slot).
      "animate-stagger-in motion-reduce:animate-none",
    ],
    /**
     * The picture. It fills the frame and simply fades up as its bytes decode — the reveal is not
     * its job, it is the screen's. Nothing here blurs and nothing scales: a picture that also
     * swelled or defocused on arrival would be three things happening at once.
     */
    image: [
      "size-full object-cover",
      "opacity-0 transition-opacity duration-base ease-out motion-reduce:transition-none",
      "data-[loaded]:opacity-100",
    ],
    /**
     * The screen: a halftone plate laid over the picture, which the picture comes through. It is
     * the frame's ground with two layers of one 12px dot grid drawn on it — small dots everywhere,
     * large ones in the middle, so the field has a real tonal falloff instead of a flat texture —
     * and the dot radius breathes on `--generation-dot`, so the plate swells and settles like
     * something being worked on rather than blinking.
     *
     * **How the reveal works.** The plate is punched with a grid of round holes whose radius IS
     * `--generation-reveal`: nothing at 0%, wide enough to swallow a whole cell at 100%, at which
     * point there is no plate left. So the picture does not arrive from a direction — it comes
     * through, everywhere at once, the way a halftone resolves when you step back from it. A
     * top-to-bottom wipe was built first and thrown out: a line crossing the picture reads as a
     * scanner passing over it rather than as an image being made.
     *
     * The holes are offset half a cell from the dots (`mask-position`), so they open BETWEEN the
     * dots and the dots are the last thing left standing.
     *
     * Percentages in a background mask resolve against the mask's own tile, so `closest-side` puts
     * 100% at half a cell (6px). The hole grows to 170% of that (10.2px), well past the 8.49px
     * corner of a cell, which is what makes the plate vanish completely instead of leaving a
     * lattice of dark diamonds behind: at 1.45 the scraps hung on until 97% and read as debris in
     * a finished picture. They close around 83% now, so the last stretch is clean.
     */
    dots: [
      // The frame's own ground, so at 0% the plate is indistinguishable from an empty frame.
      "bg-muted",
      // Plain ink at a whisper, never a brand colour: the picture is the only thing in this frame
      // allowed to be colourful, and a tinted field competes with whatever the model painted. It
      // re-themes by itself — near-white on the dark themes, near-black on the light ones.
      "text-foreground/30",
      "[background-image:radial-gradient(circle,currentColor_var(--generation-dot),transparent_calc(var(--generation-dot)+0.5px))]",
      "[background-size:0.75rem_0.75rem]",
      "[mask-image:radial-gradient(circle_closest-side,transparent_calc(var(--generation-reveal)*1.7),black_calc(var(--generation-reveal)*1.7+14%))]",
      "[mask-size:0.75rem_0.75rem]",
      "[mask-position:0.375rem_0.375rem]",
      // The middle of the field, in dots nearly twice the size on the same grid. It sits inside the
      // parent's mask, so the holes open through it too.
      "before:absolute before:inset-0 before:content-['']",
      "before:[background-image:radial-gradient(circle,currentColor_calc(var(--generation-dot)*1.9),transparent_calc(var(--generation-dot)*1.9+0.5px))]",
      "before:[background-size:0.75rem_0.75rem]",
      "before:[mask-image:radial-gradient(circle_at_50%_50%,black_0%,transparent_40%)]",
      "animate-generation-halftone motion-reduce:animate-none",
      /**
       * On while something is coming and there is nothing to show yet — which includes `complete`
       * with the bytes still in flight, because the URL arriving and the picture arriving are two
       * different moments and the frame would otherwise go dead grey for the whole download. Both
       * conditions live in ONE selector each rather than as an on-rule plus an off-rule, because
       * two rules of equal specificity would be settled by stylesheet order, which is not something
       * a component should be betting on.
       */
      "pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-base ease-out",
      "group-data-[status=generating]/canvas:opacity-100",
      "group-data-[status=complete]/canvas:group-not-has-[[data-slot=generation-image][data-loaded]]/canvas:opacity-100",
    ],
    /**
     * What the frame says about itself while there is no picture in it: "Generating…", a failure,
     * an empty prompt. Centered, muted, and carrying the glyph its state implies. Tabular, because
     * the percentage most callers put here ticks.
     */
    caption: [
      "pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 p-4",
      "text-center text-sm tabular-nums text-muted-foreground",
      // The moment the picture starts coming in, the words get out of its way. They are only there
      // to fill an empty frame, and a line of text sitting across a half-painted photograph is the
      // one thing that would break the illusion.
      "transition-opacity duration-base ease-out",
      "group-has-[[data-slot=generation-image][data-loaded]]/canvas:opacity-0",
    ],
    captionGlyph: "flex size-5 items-center justify-center [&_svg]:size-5",
    /**
     * The percentage, as a chip in the corner of the frame rather than a number in the copy. It
     * belongs to the picture, so it rides on it: bottom-right, out of the way of a caption in the
     * middle, and it leaves with the wait. Tabular, because it is a number that ticks.
     */
    percent: "absolute bottom-2 right-2 z-30 tabular-nums",
    /**
     * The hover layer over a finished picture: a scrim off the bottom edge and whatever tools the
     * caller lays on it. The tile itself never moves — no lift, no zoom, no press: the only thing
     * that happens is that the tools arrive, rising the last few percent on the spring, which is
     * the DS's reveal curve for a chip over a photo.
     */
    overlay: [
      "pointer-events-none absolute inset-0 z-30 flex items-end justify-end gap-1 p-2",
      "bg-gradient-to-t from-black/45 via-black/5 to-transparent",
      "opacity-0 transition-opacity duration-base ease-out",
      "group-hover/canvas:opacity-100 group-focus-within/canvas:opacity-100 pointer-coarse:opacity-100",
      "[&>*]:pointer-events-auto [&>*]:scale-95 [&>*]:transition-[scale] [&>*]:duration-base [&>*]:ease-spring",
      "group-hover/canvas:[&>*]:scale-100 group-focus-within/canvas:[&>*]:scale-100 pointer-coarse:[&>*]:scale-100",
    ],
    /**
     * A sheet of variations on one prompt. The tiles are already inset by the canvas, so the grid
     * takes that margin over and spaces them itself; each tile lands one beat after the last
     * (make-interfaces #5), which is the difference between a contact sheet developing and four
     * boxes appearing at once.
     */
    grid: [
      "mx-2 grid grid-cols-1 [&>[data-slot=generation-canvas]]:mx-0",
      "[&>*:nth-child(2)]:[animation-delay:var(--generation-stagger)]",
      "[&>*:nth-child(3)]:[animation-delay:calc(var(--generation-stagger)*2)]",
      "[&>*:nth-child(4)]:[animation-delay:calc(var(--generation-stagger)*3)]",
      "[&>*:nth-child(5)]:[animation-delay:calc(var(--generation-stagger)*4)]",
      "[&>*:nth-child(6)]:[animation-delay:calc(var(--generation-stagger)*5)]",
    ],
    /**
     * The closing row. No divider: whitespace is the boundary, and a rule here would be one more
     * line in a card whose picture is already a rectangle. When it wraps on a narrow card the
     * actions keep the right edge instead of orphaning themselves on the left.
     */
    footer:
      "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 [&>*:not(:first-child)]:ml-auto",
    // What the picture is, in the smallest words: model, size, seed, elapsed. Tabular, so a live
    // timer can't reflow the row it sits in.
    meta: "min-w-0 truncate text-xs tabular-nums text-muted-foreground",
  },
  variants: {
    /**
     * The picture's shape, taken before there is a picture. It lives on the root so one prop sizes
     * the hero frame and every tile of a variations grid at once; a `GenerationCanvas` can still
     * overrule it for a single frame.
     */
    ratio: {
      square: { canvas: "aspect-square" },
      portrait: { canvas: "aspect-[3/4]" },
      landscape: { canvas: "aspect-[4/3]" },
      wide: { canvas: "aspect-video" },
      tall: { canvas: "aspect-[9/16]" },
      // For a frame whose height comes from the layout around it (a pane, a full-bleed band).
      auto: { canvas: "aspect-auto" },
    },
    /**
     * Density tunes the card's padding, the gaps and the grid's gutter. The media inset does NOT
     * move with it: the picture sits 8px in from the card at both densities (docs/ARCHITECTURE.md,
     * "Inset media"), so the vertical pull-in cancels exactly the padding the density just set.
     *
     * That pull is written on the ROOT, as a rule about its own first and last child, rather than
     * on the canvas itself. It has to be: a tile inside a `GenerationGrid` is also a first or last
     * child, and a `first:-mt-2` living on the canvas pulled the top-left tile of every sheet 8px
     * out of the grid's rhythm — a ragged row that measures as a 14px gap on one axis and 6px on
     * the other. Scoped to a direct child of the card, only a picture that actually touches the
     * card's edge is pulled toward it.
     */
    density: {
      comfortable: {
        root: [
          "gap-4 py-5",
          "[&>[data-slot=generation-canvas]:first-child]:-mt-3",
          "[&>[data-slot=generation-canvas]:last-child]:-mb-3",
          "[&>[data-slot=generation-grid]:first-child]:-mt-3",
          "[&>[data-slot=generation-grid]:last-child]:-mb-3",
        ],
        header: "px-5",
        prompt: "px-5",
        footer: "px-5",
        grid: "gap-2",
      },
      compact: {
        root: [
          "gap-3 py-4",
          "[&>[data-slot=generation-canvas]:first-child]:-mt-2",
          "[&>[data-slot=generation-canvas]:last-child]:-mb-2",
          "[&>[data-slot=generation-grid]:first-child]:-mt-2",
          "[&>[data-slot=generation-grid]:last-child]:-mb-2",
        ],
        header: "px-4",
        prompt: "px-4",
        footer: "px-4",
        grid: "gap-1.5",
      },
    },
    /**
     * Where the generation is rendered. `card` is the standalone artifact — an `--edge` ring plus
     * the xs lift, never a border, so the radius arithmetic stays whole. `plain` drops the chrome
     * and the gutter for a generation dropped straight into a Chat turn or an AIPanel body, where
     * a card inside the surface reads as a box in a box; the picture then takes the full measure
     * and the inset has nothing left to be inset from.
     *
     * Declared after `density` so its gutter reset wins the merge.
     */
    variant: {
      card: { root: "rounded-2xl shadow-xs ring-1 ring-edge" },
      plain: {
        root: [
          "py-0",
          // Same selectors as the density's pull-in, so tailwind-merge resolves them against each
          // other (same variant prefix, same property) and the negative margins simply go away
          // with the padding they were cancelling.
          "[&>[data-slot=generation-canvas]:first-child]:mt-0",
          "[&>[data-slot=generation-canvas]:last-child]:mb-0",
          "[&>[data-slot=generation-grid]:first-child]:mt-0",
          "[&>[data-slot=generation-grid]:last-child]:mb-0",
        ],
        header: "px-0",
        prompt: "px-0",
        footer: "px-0",
        canvas: "mx-0",
        grid: "mx-0",
      },
    },
    /**
     * How the reveal reacts to a new percentage, the same axis `Progress` carries for the same
     * reason. `smooth` glides between the steps a model reports (12% at a time, so without it the
     * front marches). `none` welds the reveal to the number, which is what a continuously-driven
     * frame wants: a slider dragged under your finger, or a stream that reports every frame, would
     * otherwise trail by a third of a second and read as lag rather than polish.
     */
    transition: {
      smooth: {
        root: "transition-[--generation-reveal] duration-base ease-out motion-reduce:transition-none",
      },
      none: { root: "transition-none" },
    },
    /** How many frames a `GenerationGrid` lays out. Two columns hold on a phone; more fan out. */
    columns: {
      2: { grid: "grid-cols-2" },
      3: { grid: "grid-cols-2 sm:grid-cols-3" },
      4: { grid: "grid-cols-2 sm:grid-cols-4" },
    },
  },
  defaultVariants: {
    ratio: "square",
    density: "comfortable",
    variant: "card",
    transition: "smooth",
    columns: 2,
  },
})

type GenerationSlots = ReturnType<typeof generationVariants>
type GenerationOptions = Omit<VariantProps<typeof generationVariants>, "columns">

/** Where the generation is: nothing asked yet → painting → done, or it didn't come out. */
export type GenerationState = "idle" | "generating" | "complete" | "failed"

/** The shape the picture will have. Taken before it exists, so the frame never resizes. */
export type GenerationRatio = NonNullable<VariantProps<typeof generationVariants>["ratio"]>

/** The optional header chip per state, and what the empty frame says about itself. */
const GENERATION_STATUS: Record<
  GenerationState,
  {
    label: string
    caption: string
    variant: BadgeProps["variant"]
    glyph: "spinner" | "warning" | "image"
  }
> = {
  idle: { label: "Ready", caption: "Nothing generated yet", variant: "outline", glyph: "image" },
  generating: { label: "Generating", caption: "Generating…", variant: "default", glyph: "spinner" },
  complete: { label: "Done", caption: "", variant: "success", glyph: "image" },
  failed: {
    label: "Failed",
    caption: "That one didn't come out",
    variant: "destructive",
    glyph: "warning",
  },
}

/**
 * One beat between tiles of a grid. Half the DS's fast duration: the sheet fills in a touch ahead
 * of each tile's own entrance, so the cascade reads as one gesture instead of a march.
 */
const STAGGER_STEP = duration.fast / 2

const [GenerationProvider, useGenerationContext] = createContext<{
  slots: GenerationSlots
  /**
   * The recipe's own inputs, so a part that overrules one (a canvas with its own `ratio`) can
   * rebuild the recipe without losing the density and variant the root resolved.
   */
  options: GenerationOptions
  status: GenerationState
  progress: number | null
}>("Generation")

export interface GenerationProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof generationVariants> {
  /**
   * Where the generation is. Drives the shimmer in the frame, the optional `GenerationStatus`
   * chip, `aria-busy`, and which of `GenerationCaption` / `GenerationOverlay` is in the DOM at
   * all. @default "complete"
   */
  status?: GenerationState
  /**
   * How far along, 0–100. `null` (the default) is the honest reading when the model reports no
   * percentage: a `GenerationProgress` then sweeps instead of filling. Read by every progress bar
   * in the card, so a call site never keeps two numbers in sync.
   */
  progress?: number | null
  asChild?: boolean
}

/**
 * Parts are exported individually (not `Generation.Canvas` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do.
 */
export function Generation({
  className,
  status = "complete",
  progress = null,
  ratio,
  density,
  variant,
  transition,
  asChild = false,
  style,
  ...props
}: GenerationProps) {
  const options: GenerationOptions = { ratio, density: useDensity(density), variant, transition }
  const slots = generationVariants(options)
  const Comp = asChild ? Slot.Root : "div"

  /**
   * How far down the curtain is. Only a generation that reports a number has one: with no
   * percentage there is nothing honest to wipe to, and every other state is simply all the way in.
   * Clamped, because a model that overshoots 100 would otherwise blow the holes past their cell.
   */
  const reveal =
    status === "generating" && progress !== null && progress !== undefined
      ? Math.min(Math.max(progress, 0), 100)
      : 100

  return (
    <GenerationProvider slots={slots} options={options} status={status} progress={progress}>
      <Comp
        data-slot="generation"
        data-status={status}
        // A card that is painting updates itself; announce the change politely rather than letting
        // a screen reader re-read the whole card on every percent.
        aria-busy={status === "generating" ? true : undefined}
        // The reveal is transitioned HERE, on the element that sets it (the `transition` variant):
        // `--generation-reveal` is a registered percentage (globals.css), so easing the variable
        // glides every hole in the screen open together, and a model reporting 40 → 62 → 100 reads as
        // one movement instead of three jumps. Everything below inherits the interpolated value,
        // which is why nothing else needs a transition of its own.
        className={cn("group/generation", slots.root({ className }))}
        // Both beats are published once here as custom properties, so the grid can space its tiles
        // and the frame can wipe its picture in without anything being cloned onto a child.
        style={
          {
            "--generation-stagger": `${STAGGER_STEP}ms`,
            "--generation-reveal": `${reveal}%`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </GenerationProvider>
  )
}

/** The eyebrow row: a `GenerationIcon`, a `GenerationLabel`, then a status chip and/or actions. */
export function GenerationHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGenerationContext("GenerationHeader")
  return <div data-slot="generation-header" className={slots.header({ className })} {...props} />
}

/** The eyebrow's glyph: the smallest mark that says what kind of card this is. */
export function GenerationIcon({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useGenerationContext("GenerationIcon")
  return (
    <span data-slot="generation-icon" aria-hidden className={slots.icon({ className })} {...props} />
  )
}

/** The eyebrow's word: "Image", "Cover art", the model's name. */
export function GenerationLabel({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useGenerationContext("GenerationLabel")
  return <span data-slot="generation-label" className={slots.label({ className })} {...props} />
}

/** Trailing slot for icon buttons — in the header, in the footer, or over the picture. */
export function GenerationActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGenerationContext("GenerationActions")
  return <div data-slot="generation-actions" className={slots.actions({ className })} {...props} />
}

export type GenerationActionProps = ButtonProps

/**
 * GenerationAction: one tool — download, regenerate, upscale, a `⋯` menu. A thin `Button` wrapper
 * (composed, never re-styled), ghost and icon-only by default. Over a picture, pass
 * `tone="onMedia"` so it keeps its contrast on whatever the model painted.
 */
export function GenerationAction({
  variant = "ghost",
  size = "sm",
  iconOnly = true,
  ...props
}: GenerationActionProps) {
  return <Button variant={variant} size={size} iconOnly={iconOnly} {...props} />
}

export interface GenerationStatusProps extends Omit<BadgeProps, "children"> {
  /** Override the default per-state wording ("Generating", "Done", …). */
  children?: React.ReactNode
}

/**
 * GenerationStatus: an optional chip derived from the root's `status`, so a call site never has to
 * keep a label and a state in sync. Optional on purpose — the frame already says it is working,
 * and a chip on top of a shimmer is the same news twice. Reach for it when the card sits in a feed
 * where it has to announce itself.
 */
export function GenerationStatus({ className, variant, children, ...props }: GenerationStatusProps) {
  const { status } = useGenerationContext("GenerationStatus")
  const { label, variant: stateVariant, glyph } = GENERATION_STATUS[status]

  return (
    <Badge
      // No `data-slot` of its own: a part that renders another component keeps that component's
      // slot (docs/ARCHITECTURE.md §2), so the chip stays queryable as a Badge.
      variant={variant ?? stateVariant}
      className={cn("ml-auto shrink-0", className)}
      {...props}
    >
      {glyph === "spinner" && status === "generating" && <Spinner aria-hidden />}
      {glyph === "warning" && <Warning weight="bold" aria-hidden />}
      {children ?? label}
    </Badge>
  )
}

export interface GenerationPromptProps extends React.ComponentProps<"p"> {
  /**
   * Clamp the prompt to this many lines. Prompts run long and the picture is the point, so a card
   * in a feed usually shows two lines; the full text stays in the DOM for a screen reader and for
   * a caller who wants to expand it. @default undefined (no clamp)
   */
  lines?: 1 | 2 | 3
}

/** A static map, never a computed `line-clamp-${n}`: the Tailwind compiler has to see the class. */
const PROMPT_CLAMP = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const

/** The prompt the picture came from, quoted back to you in the card's quietest ink. */
export function GenerationPrompt({ className, lines, ...props }: GenerationPromptProps) {
  const { slots } = useGenerationContext("GenerationPrompt")
  return (
    <p
      data-slot="generation-prompt"
      className={slots.prompt({ className: cn(lines && PROMPT_CLAMP[lines], className) })}
      {...props}
    />
  )
}

export interface GenerationCanvasProps extends React.ComponentProps<"div"> {
  /** Overrule the root's `ratio` for this one frame (a hero landscape over a square sheet). */
  ratio?: GenerationRatio
  /**
   * Overrule the root's `status` for this one frame. A sheet of variations finishes tile by tile,
   * and each tile owns its own shimmer — which is the whole reason this is a per-frame prop and
   * not something the root dictates. @default the root's status
   */
  status?: GenerationState
  /**
   * Overrule the root's `progress` for this one frame, so each tile of a sheet wipes in at its own
   * pace. @default the root's
   */
  progress?: number | null
}

/**
 * GenerationCanvas: the frame the picture is painted into. It is sized by its ratio from the first
 * frame, so the card never grows around a finished image, and it is the one part that shows a
 * state: the halftone screen while it works, opening as the picture comes through it, gone once
 * it is done.
 *
 * Put a `GenerationImage` in it **as soon as you have a URL, not when you are finished** — that is
 * the whole point of the curtain. Add any of `GenerationCaption`, `GenerationProgress` and
 * `GenerationOverlay`; those three know when they are not wanted, so the markup is the same in
 * every state.
 */
export function GenerationCanvas({
  className,
  ratio,
  status,
  progress,
  children,
  style,
  ...props
}: GenerationCanvasProps) {
  const ctx = useGenerationContext("GenerationCanvas")
  // Only rebuild the recipe when this frame overrules the root's ratio; the root's own slots are
  // already resolved for every other case.
  const slots = ratio ? generationVariants({ ...ctx.options, ratio }) : ctx.slots
  const state = status ?? ctx.status

  /**
   * A frame publishes its own curtain when it is out of step with the card: either because it was
   * given its own percentage, or because it has finished while the card is still working. That
   * second case is not an optimisation but a correctness fix — the reveal inherits, so a tile that
   * is already done inside a card sitting at 62% would otherwise be masked to 62% of a picture it
   * has all of. A tile still generating with nothing of its own simply inherits.
   */
  const reveal =
    progress !== undefined
      ? progress === null
        ? 100
        : Math.min(Math.max(progress, 0), 100)
      : status !== undefined && status !== "generating"
        ? 100
        : undefined

  return (
    <div
      data-slot="generation-canvas"
      data-status={state}
      className={
        // A frame that publishes its own reveal has to ease it itself, since the root's transition
        // only governs the value the root sets. It honors the same `transition` variant, and the
        // two never stack: a frame either inherits the number or owns it.
        reveal === undefined || ctx.options.transition === "none"
          ? slots.canvas({ className })
          : cn(
              "transition-[--generation-reveal] duration-base ease-out motion-reduce:transition-none",
              slots.canvas({ className }),
            )
      }
      style={
        reveal === undefined
          ? style
          : ({ "--generation-reveal": `${reveal}%`, ...style } as React.CSSProperties)
      }
      {...props}
    >
      {children}
      {/* The dot field is the frame's own chrome, not a part you compose: it belongs to whatever
          picture is being painted here and there is never a reason to leave it out. Same contract as
          a PlanStep's status mark. It comes after the children so it stacks over the picture without
          needing a z-index war with it. */}
      <span data-slot="generation-dots" aria-hidden className={slots.dots()} />
    </div>
  )
}

export type GenerationImageProps = React.ComponentProps<"img">

/**
 * GenerationImage: the picture, coming into its frame through the curtain. It fades up as its
 * bytes decode, and the halftone screen over it opens as `progress` climbs.
 *
 * Change the `src` and it happens again: a regenerate is the same frame being re-exposed, not a
 * new box arriving. A cached image can already be complete before React attaches `onLoad`, so the
 * element is asked once on mount rather than left permanently transparent.
 *
 * Raw `<img>`, not `next/image`: a generated picture's URL is remote, unknown at build time, and
 * usually short-lived, which is exactly the case Next's loader can't help with.
 */
export function GenerationImage({ className, src, onLoad, ...props }: GenerationImageProps) {
  const { slots } = useGenerationContext("GenerationImage")
  const ref = React.useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = React.useState(false)

  // Re-arm on a new source, at render time rather than in an effect: the new picture must not
  // paint sharp for a frame before fading back out. (The repo's react-hooks rules also reject
  // setState inside an effect body.)
  const [prevSrc, setPrevSrc] = React.useState(src)
  if (prevSrc !== src) {
    setPrevSrc(src)
    setLoaded(false)
  }

  React.useEffect(() => {
    // A cached image can finish decoding before React wires `onLoad` up, which would leave it
    // transparent forever. Nested so the hooks lint can see this isn't a render-loop setState.
    function syncDecoded() {
      const img = ref.current
      if (img?.complete && img.naturalWidth > 0) setLoaded(true)
    }
    syncDecoded()
  }, [src])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      data-slot="generation-image"
      data-loaded={loaded || undefined}
      src={src}
      alt={props.alt ?? ""}
      draggable={false}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      className={slots.image({ className })}
      {...props}
    />
  )
}

export interface GenerationCaptionProps extends React.ComponentProps<"div"> {
  /**
   * What the frame says. Left out, it says what its state says; passed `null` it says nothing at
   * all and shows only the glyph, which is what a thumbnail in a sheet of variations wants — there
   * is no room for words on a 120px tile and four of them saying "Generating…" is a wall.
   */
  children?: React.ReactNode
}

/**
 * GenerationCaption: the line inside an empty frame — "Generating…", a failure, a prompt not yet
 * run — with the glyph its state implies. Put the percentage here and it reads as the picture
 * counting itself in.
 *
 * It renders **nothing at all** once the picture is there, so a caller leaves it in the markup
 * unconditionally and never writes a ternary around it (the same contract `PlanStepEdit` keeps
 * outside edit mode).
 */
export function GenerationCaption({ className, children, ...props }: GenerationCaptionProps) {
  const { slots, status } = useGenerationContext("GenerationCaption")
  if (status === "complete") return null
  const { caption, glyph } = GENERATION_STATUS[status]

  return (
    <div data-slot="generation-caption" className={slots.caption({ className })} {...props}>
      <span aria-hidden className={slots.captionGlyph()}>
        {/* Plain ink like everything else in a working frame; the failure keeps its own red,
            because that one IS the message. */}
        {glyph === "spinner" && <Spinner size="lg" className="text-muted-foreground" aria-hidden />}
        {glyph === "warning" && <Warning weight="bold" className="text-destructive" />}
        {glyph === "image" && <ImageSquare weight="bold" className="text-muted-foreground/60" />}
      </span>
      {children === undefined ? caption : children}
    </div>
  )
}

export interface GenerationProgressProps extends Omit<ProgressProps, "children"> {
  /** Overrule the root's `progress` for this one bar. */
  value?: number | null
}

/**
 * GenerationProgress: how far along, as a hairline. Dropped straight into a `GenerationCanvas` it
 * pins itself to the picture's bottom edge, where the fill reads as the frame filling in; dropped
 * into the footer it is an ordinary bar. It composes `Progress` rather than drawing its own track,
 * so it inherits the indeterminate sweep for the very common case of a model that reports no
 * percentage at all.
 *
 * Like the caption, it renders nothing once the picture has landed.
 */
export function GenerationProgress({
  className,
  value,
  variant = "chrome",
  size = "xs",
  // Plain ink, like the dot field: nothing in a generating frame is coloured but the picture.
  tone = "foreground",
  "aria-label": ariaLabel = "Generating",
  ...props
}: GenerationProgressProps) {
  const { progress, status } = useGenerationContext("GenerationProgress")
  if (status !== "generating") return null

  return (
    <Progress
      // Keeps Progress's own `data-slot` (docs/ARCHITECTURE.md §2) — which is also the hook the
      // canvas pins it with.
      value={value !== undefined ? value : progress}
      variant={variant}
      size={size}
      tone={tone}
      aria-label={ariaLabel}
      className={className}
      {...props}
    />
  )
}

export interface GenerationPercentProps extends Omit<BadgeProps, "children"> {
  /** Overrule the root's `progress` for this chip. */
  value?: number | null
  /** Format the number. Defaults to a rounded percentage. */
  children?: (percent: number) => React.ReactNode
}

/**
 * GenerationPercent: how far along, as a chip in the corner of the frame — the readout every image
 * model puts on the picture itself rather than beside it. It composes `Badge`, so it is the DS's
 * chip and not a pill drawn again here.
 *
 * It renders nothing without a number to show: no percentage reported means no honest chip, and a
 * finished picture has nothing left to count. Reach for it *or* for `GenerationProgress`, not both
 * — a bar and a number saying the same thing is the same news twice.
 */
export function GenerationPercent({
  className,
  value,
  variant = "overlay",
  size = "sm",
  children,
  ...props
}: GenerationPercentProps) {
  const { slots, progress, status } = useGenerationContext("GenerationPercent")
  const resolved = value !== undefined ? value : progress
  if (status !== "generating" || resolved === null || resolved === undefined) return null
  const percent = Math.round(Math.min(Math.max(resolved, 0), 100))

  return (
    <Badge
      // Keeps Badge's own `data-slot` (docs/ARCHITECTURE.md §2).
      variant={variant}
      size={size}
      pill
      className={slots.percent({ className })}
      {...props}
    >
      {children ? children(percent) : `${percent}%`}
    </Badge>
  )
}

/**
 * GenerationOverlay: the tools that arrive over a finished picture — download, upscale, open. The
 * tile never moves for them: the scrim fades up and the tools rise the last few percent, which is
 * the DS's reveal for anything laid over a photo.
 *
 * Only ever in the DOM once the picture is complete, and reveals on touch without a hover, where
 * "hover to see the controls" would otherwise hide them for good.
 */
export function GenerationOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, status } = useGenerationContext("GenerationOverlay")
  if (status !== "complete") return null
  return <div data-slot="generation-overlay" className={slots.overlay({ className })} {...props} />
}

export interface GenerationGridProps extends React.ComponentProps<"div"> {
  /** How many frames per row. @default 2 */
  columns?: 2 | 3 | 4
}

/** GenerationGrid: a sheet of variations on one prompt, each tile landing a beat after the last. */
export function GenerationGrid({ className, columns = 2, ...props }: GenerationGridProps) {
  const { options } = useGenerationContext("GenerationGrid")
  const slots = generationVariants({ ...options, columns })
  return <div data-slot="generation-grid" className={slots.grid({ className })} {...props} />
}

/** The closing row: a `GenerationMeta` on the left, the actions on the right. No divider. */
export function GenerationFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGenerationContext("GenerationFooter")
  return <div data-slot="generation-footer" className={slots.footer({ className })} {...props} />
}

/** What the picture is, in the smallest words: "Flux 1.1 · 1024×1024 · 6.2s". */
export function GenerationMeta({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useGenerationContext("GenerationMeta")
  return <span data-slot="generation-meta" className={slots.meta({ className })} {...props} />
}
