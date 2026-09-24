"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Bento: an asymmetric marketing grid of feature tiles (the "deliver fast without sacrificing
 * quality" board). Multi-part like Card/Hero: one `tv` recipe with `slots`, shared through a
 * typed React Context so every part of a tile reads the same styles (never prop-drilled or
 * cloned). See docs/ARCHITECTURE.md §2.
 *
 * `Bento` is the responsive grid (1 col → 2 on sm → 6 on lg; `collapse="lg"` holds one column
 * until lg). Each `BentoItem` claims a `size` (how many cells it spans) and a `tone` (the icon
 * tint), then composes a tinted `BentoItemIcon`, a `BentoItemTitle`, a `BentoItemDescription`,
 * and either a `BentoItemImage` (a screenshot clipped by the tile edge: a framed window that
 * peeks up from the bottom, or with `imageFit="bleed"` bare art that runs off the tile and
 * dissolves; give it a `darkSrc` and the shot follows the theme) or a freeform `BentoItemMedia`.
 * Marketing is comfortable by nature, so there's no density axis; `scale="lg"` on `Bento` is the
 * landing step (32px tiles, 18px descriptions) for a board that is the page's feature story rather
 * than a block among many.
 */
export const bentoVariants = tv({
  slots: {
    // The grid. 6 lg columns give room for asymmetric spans; tiles stack on small screens. The
    // intermediate two-column step belongs to the `collapse` variant below.
    root: "grid grid-cols-1 gap-4 lg:grid-cols-6",
    // One tile: a static contour (no hover motion or state change by design). The edge is an
    // `--edge` ring plus the xs lift, not a border (docs/FOUNDATIONS.md, "Shadows over borders"):
    // a box-shadow sits outside the clip, so a bled image reaches the tile's true edge. No fill:
    // fill is elevation, so the tile takes the ground it sits on.
    // `overflow-hidden` is what clips a peeking BentoItemImage at the tile's rounded edge.
    item: "relative flex h-full flex-col gap-4 overflow-hidden rounded-xl p-6 text-card-foreground shadow-xs ring-1 ring-edge",
    // The tinted icon chip; the glyph is sized via the direct-child selector.
    icon: "grid size-11 shrink-0 place-items-center rounded-xl [&>svg]:size-6",
    // A tile title is a card title: 20px, the step above the 16px description under it.
    title: "text-xl font-semibold leading-snug text-balance",
    // The title and its description are one unit, so they sit closer (8px) than the tile's 16px
    // rhythm between parts. Keyed on the pair itself (a description right after a title), so a tile
    // with only one of them, or with media between them, keeps the plain rhythm.
    description: "text-pretty text-body [[data-slot=bento-item-title]+&]:-mt-2",
    // Freeform visual region: pushed to the bottom so tiles in a row align their media edges.
    // Composed FIRST (art above the copy), it flips: it sits at the top and hands the free space
    // to the copy, so the title and description settle on the tile's bottom edge instead.
    media: "mt-auto first:mt-0 first:mb-auto",
    // The art window. Always bled to the tile's bottom edge (-mb-6 cancels the tile padding) and
    // clipped there by the tile's own overflow-hidden; what it looks like is the `imageFit` axis.
    imageFrame: "relative mt-auto -mb-6 shrink-0 overflow-hidden",
    // The shot fills the window it peeks from and crops to it.
    image: "absolute inset-0 size-full object-cover",
  },
  variants: {
    // How many cells the tile claims, plus how tall its peeking image is. `feature` is the
    // tall hero tile (2 rows), `full` spans the whole row as a closing band. The `sm:col-span-2`
    // of the wide sizes lives in a compound keyed on `collapse`, because it is only safe while the
    // grid actually has two columns at `sm`.
    size: {
      sm: { item: "lg:col-span-2", imageFrame: "h-52" },
      md: { item: "lg:col-span-3", imageFrame: "h-72" },
      lg: { item: "lg:col-span-4", imageFrame: "h-72" },
      feature: { item: "lg:col-span-4 lg:row-span-2", imageFrame: "h-96" },
      full: { item: "lg:col-span-6", imageFrame: "h-72" },
    },
    // Icon tint only: every theme ships these hue roles as soft 10%/solid pairs.
    tone: {
      brand: { icon: "bg-brand/10 text-brand" },
      purple: { icon: "bg-purple/10 text-purple" },
      teal: { icon: "bg-teal/10 text-teal" },
      orange: { icon: "bg-orange/10 text-orange" },
      pink: { icon: "bg-pink/10 text-pink" },
    },
    // Where the grid leaves one column. `sm` (default) steps 1 → 2 → 6; `lg` stays one column until
    // it can lay the real rows out. It exists for boards whose rows don't pair: a 3-tile row in a
    // two-column grid always strands one tile on a line of its own, so a 2 / 3 / 2 board breaks into
    // pairs with a lone tile in the middle on a tablet. Set on `Bento`; the tiles read it from context, because a wide tile's
    // `sm:col-span-2` in a one-column grid would conjure an implicit second column out of nothing.
    collapse: {
      sm: { root: "sm:grid-cols-2" },
      lg: {},
    },
    // The board's type and spacing step, set on `Bento` and read by every tile. `md` is the block
    // among many; `lg` is the landing board a home page tells its feature story with: 32px tiles
    // and a 32px step to the art, 18px descriptions. The title → description pair stays 8px apart
    // (the negative margin grows with the gap), and the bleed cancels the bigger padding.
    scale: {
      md: {},
      lg: {
        item: "gap-8 p-8",
        title: "[[data-slot=bento-item-icon]+&]:-mt-4",
        description: "text-lg [[data-slot=bento-item-title]+&]:-mt-6",
        imageFrame: "-mb-8",
      },
    },
    // What the art window IS.
    //   - `frame` (default): a floating screenshot window inset by the tile padding, its top corners
    //     rounded, on a muted ground with a hairline and a lift. Reads as "here is the product".
    //   - `bleed`: no window at all. The art is larger than the tile, pinned to the copy's left
    //     edge and the window's top, and runs off the tile's right and bottom edges, dissolving into
    //     the ground through the `fade-b` mask (a mask, never a painted gradient, so it vanishes
    //     into any theme's ground rather than into white). Reads as a crop of a bigger surface.
    //     The frame runs wider than the tile (per size below) and the tile's overflow clips it.
    imageFit: {
      frame: {
        imageFrame: "w-full rounded-t-xl border border-b-0 border-border bg-muted shadow-md",
        image: "object-top",
      },
      bleed: {
        imageFrame: "[--fade-size:min(3rem,20%)] fade-b",
        image: "object-left-top",
      },
    },
  },
  compoundVariants: [
    // The wide sizes span both columns of the intermediate grid, and only when that grid exists.
    { collapse: "sm", size: ["lg", "feature", "full"], class: { item: "sm:col-span-2" } },
    // Bleed geometry per size: the art window is wider than the tile (that overshoot is the bleed)
    // and taller than a framed shot, since there is no chrome eating into it. Heights step with the
    // frame so a stacked phone tile never gets a slab of art taller than its copy.
    { imageFit: "bleed", size: "sm", class: { imageFrame: "h-64 w-[125%] lg:h-72" } },
    { imageFit: "bleed", size: "md", class: { imageFrame: "h-64 w-[130%] sm:h-96 lg:h-104 lg:w-[160%]" } },
    { imageFit: "bleed", size: ["lg", "feature"], class: { imageFrame: "h-64 w-[130%] sm:h-96 lg:h-104" } },
    { imageFit: "bleed", size: "full", class: { imageFrame: "h-64 w-full sm:h-96 lg:h-104" } },
    // Under `collapse="lg"` a narrow tile spans the whole column from `sm` to `lg`, so its art
    // window is as wide as a wide tile's and needs the matching height, or it shows a thin strip.
    { collapse: "lg", imageFit: "bleed", size: "sm", class: { imageFrame: "sm:h-96 lg:h-72" } },
  ],
  defaultVariants: {
    size: "sm",
    tone: "brand",
    collapse: "sm",
    imageFit: "frame",
    scale: "md",
  },
})

type BentoVariantProps = VariantProps<typeof bentoVariants>
type BentoSlots = ReturnType<typeof bentoVariants>
const [BentoItemProvider, useBentoItemContext] = createContext<{ slots: BentoSlots }>("BentoItem")

/**
 * What the grid hands its tiles. A plain React context WITH a default rather than the throwing
 * `createContext` helper, on purpose: a `BentoItem` dropped into a consumer's own grid (no `Bento`
 * around it) must keep rendering as it always has, with the default collapse and frame.
 */
const BentoRootContext = React.createContext<{
  collapse: NonNullable<BentoVariantProps["collapse"]>
  imageFit?: BentoVariantProps["imageFit"]
  scale?: BentoVariantProps["scale"]
}>({ collapse: "sm" })

export interface BentoProps extends React.ComponentProps<"div"> {
  /**
   * Where the grid leaves one column: `"sm"` (1 → 2 → 6) or `"lg"` (1 → 6). Use `"lg"` when a row
   * holds three tiles, which a two-column grid can only lay out with an orphan. @default "sm"
   */
  collapse?: BentoVariantProps["collapse"]
  /** The default `imageFit` for every tile; a tile's own `imageFit` wins. @default "frame" */
  imageFit?: BentoVariantProps["imageFit"]
  /**
   * The board's type and spacing step: `"md"` (24px tiles, 16px descriptions) or `"lg"`, the
   * landing board (32px tiles, 18px descriptions). Set once here; every tile reads it, so a board
   * never mixes steps. @default "md"
   */
  scale?: BentoVariantProps["scale"]
}

/**
 * The grid container. Parts are exported individually (not `Bento.Item` dot-notation):
 * namespaced statics don't survive the RSC server→client boundary. Compose as
 * `<Bento><BentoItem><BentoItemIcon>…`.
 */
export function Bento({ className, collapse = "sm", imageFit, scale, ...props }: BentoProps) {
  const { root } = bentoVariants({ collapse })
  const context = React.useMemo(() => ({ collapse, imageFit, scale }), [collapse, imageFit, scale])
  return (
    <BentoRootContext.Provider value={context}>
      <div data-slot="bento" data-collapse={collapse} className={root({ className })} {...props} />
    </BentoRootContext.Provider>
  )
}

export interface BentoItemProps
  extends React.ComponentProps<"div">,
    Omit<BentoVariantProps, "collapse" | "scale"> {
  /** Render the tile as its child (e.g. an `<a>`) so the whole card becomes one link. */
  asChild?: boolean
}

/** One tile. Owns the `size`/`tone`/`imageFit` for itself and its parts via Context. */
export function BentoItem({
  className,
  size,
  tone,
  imageFit,
  asChild = false,
  ...props
}: BentoItemProps) {
  const root = React.useContext(BentoRootContext)
  const slots = bentoVariants({
    size,
    tone,
    collapse: root.collapse,
    imageFit: imageFit ?? root.imageFit,
    scale: root.scale,
  })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <BentoItemProvider slots={slots}>
      <Comp data-slot="bento-item" className={slots.item({ className })} {...props} />
    </BentoItemProvider>
  )
}

/** The tinted icon chip. Pass a single Phosphor icon as the child. */
export function BentoItemIcon({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useBentoItemContext("BentoItemIcon")
  return <div data-slot="bento-item-icon" className={slots.icon({ className })} {...props} />
}

export function BentoItemTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const { slots } = useBentoItemContext("BentoItemTitle")
  return <h3 data-slot="bento-item-title" className={slots.title({ className })} {...props} />
}

export function BentoItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useBentoItemContext("BentoItemDescription")
  return (
    <p data-slot="bento-item-description" className={slots.description({ className })} {...props} />
  )
}

/** The bottom-aligned freeform visual region (a stat, a swatch row, custom markup). */
export function BentoItemMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useBentoItemContext("BentoItemMedia")
  return <div data-slot="bento-item-media" className={slots.media({ className })} {...props} />
}

/**
 * A picture: its URL, or what a bundler's static image import returns (an object with `src`, as
 * Next and the Vite image plugins give), so `import shot from "./shot.webp"` passes straight in.
 */
export type BentoImageSource = string | { src: string }

const srcOf = (source: BentoImageSource) => (typeof source === "string" ? source : source.src)

export interface BentoItemImageProps extends Omit<React.ComponentProps<"img">, "src" | "children"> {
  src: BentoImageSource
  /**
   * The same shot taken in a dark theme. With it, `src` shows on the light themes (light, cream)
   * and `darkSrc` on the dark ones (dark, moonlight), so a screenshot sits in the page's own theme
   * instead of glaring out of it. The swap is the `dark:` variant, so it honours the nearest theme
   * scope, and only the visible shot loads: both are lazy, and a browser never fetches a lazy
   * image that is `display: none`. Every other prop (`alt`, `sizes`, `className`…) applies to both.
   */
  darkSrc?: BentoImageSource
  /** Extra classes for the art window (height, width of the bleed, etc.). */
  frameClassName?: string
  /**
   * Extra layers inside the art window, painted over the image and clipped (and, with
   * `imageFit="bleed"`, dissolved) with it: a floating panel over the screenshot, a second shot
   * offset behind it. Position them yourself (`absolute` + inset/width classes).
   */
  children?: React.ReactNode
}

/**
 * A screenshot/preview clipped at the tile edge. With the tile's `imageFit="frame"` (default) it
 * peeks up from the bottom in a floating window; with `"bleed"` it runs off the tile and dissolves.
 * A plain lazy `<img>` filling the window, so it runs in any React app; pass `src`/`alt`, plus
 * `darkSrc` for a shot that follows the theme, and `srcSet`/`sizes` for responsive sources. Height
 * (and the bleed's width) comes from the tile `size`; override via `frameClassName`.
 */
export function BentoItemImage({
  className,
  frameClassName,
  src,
  alt,
  darkSrc,
  loading = "lazy",
  decoding = "async",
  children,
  ...props
}: BentoItemImageProps) {
  const { slots } = useBentoItemContext("BentoItemImage")
  return (
    <div data-slot="bento-item-image" className={slots.imageFrame({ className: frameClassName })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={srcOf(src)}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={slots.image({ className: cn(darkSrc != null && "dark:hidden", className) })}
        {...props}
      />
      {darkSrc != null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          loading={loading}
          decoding={decoding}
          className={slots.image({ className: cn("hidden dark:block", className) })}
          {...props}
          src={srcOf(darkSrc)}
        />
      )}
      {children}
    </div>
  )
}
