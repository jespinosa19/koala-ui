"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { Plus } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * GalleryAccordion: a "collections" gallery — a vertical list of photo sets where each row
 * previews its collection with a peeking thumbnail stack, then blooms open into a strip of
 * framed photos that stagger in. The list-that-reveals-images idea, told the Koala way: a
 * quiet, scannable index at rest; a delightful unfold on demand. Sibling of the masonry
 * `Gallery` (everything at once) — reach here when the list and its labels are the spine and
 * the photos are the reward.
 *
 * Built on Radix Accordion (`type="single"`, keyboard nav, ARIA, the
 * `--radix-accordion-content-height` var driving the height tween), so it is accessible for
 * free. Rows open on **click/keyboard only — never hover** (a standing rule for every
 * accordion in the DS). The flourish that rides on top is purely visual: the open panel's
 * tiles **stagger in** left to right while the peek stack fades out.
 *
 * Multi-part like Accordion/Card: one `tv` recipe with `slots`, shared variants flowing to
 * every part through a typed React Context. See docs/ARCHITECTURE.md §2.
 */
export const galleryAccordionVariants = tv({
  slots: {
    // Hairlines enclose the list and divide every row; no per-item border needed.
    root: "w-full divide-y divide-border border-y border-border",
    item: "",
    // Lets the trigger stretch the full width of the row.
    header: "flex",
    // The collection row: title + tagline on the left, peek stack + count + toggle on the right.
    // `group/trigger` so every part can react to this row's own open/closed/hover state.
    trigger: [
      "group/trigger flex w-full items-center gap-5 text-left",
      "cursor-pointer outline-none",
      // Specific transition only (never `transition: all`). No scale-on-press: a full-width
      // row shrinking reads as a layout jump — the toggle flip and reveal carry the feedback.
      "transition-colors duration-base ease-out",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
    // Title + tagline column; min-w-0 so the tagline can truncate instead of pushing the meta.
    titleWrap: "flex min-w-0 flex-1 flex-col gap-1",
    title: "font-semibold tracking-tight text-foreground",
    // One-line tagline, always visible (the row reads even when every collection is closed).
    tagline: "truncate text-sm text-pretty text-muted-foreground",
    // Right cluster: the peek stack, the count, and the toggle glyph.
    meta: "flex shrink-0 items-center gap-3 sm:gap-4",
    // The peeking thumbnail stack — overlapping mini tiles that hint at the photos inside.
    // It fades away as the full strip takes over on open.
    peek: [
      "hidden items-center sm:flex",
      "transition-opacity duration-base ease-out group-data-[state=open]/trigger:opacity-0",
    ],
    // One mini tile in the peek stack: overlaps its neighbour, ringed in the page color to
    // separate the layers (the AvatarGroup move). Concentric-ready rounded-lg.
    peekTile: "size-9 shrink-0 -ml-2.5 first:ml-0 rounded-lg object-cover shadow-sm ring-2 ring-background",
    // The collection size. Dynamically meaningful number → tabular-nums so it never jitters.
    count: "hidden text-sm font-medium tabular-nums text-muted-foreground sm:block",
    // The open/close affordance: a Plus that rotates 45° into an ✕ on open. Motion only — it
    // keeps its neutral color in every state.
    toggle: [
      "grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground",
      "transition-transform duration-base ease-out",
      "group-data-[state=open]/trigger:rotate-45",
      "[&_svg]:size-4",
    ],
    // Animated height wrapper: overflow-hidden clips the inner padded div while height tweens.
    // `duration-base`/`ease-out` feed tw-animate-css's accordion keyframes via --tw-duration/--tw-ease.
    content: [
      // `group/content` so the caption + tiles can read THIS panel's open state for their stagger.
      "group/content overflow-hidden",
      "duration-base ease-out",
      "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
    ],
    // Padding lives on the inner wrapper (not the animated one) so the height tween stays smooth.
    contentInner: "flex flex-col gap-4",
    // Optional caption above the strip; fades + slides in under the row on open.
    caption: [
      "max-w-prose text-pretty text-sm text-muted-foreground",
      "duration-base ease-out group-data-[state=open]/content:animate-in group-data-[state=open]/content:fade-in-0 group-data-[state=open]/content:slide-in-from-bottom-1",
    ],
    // The photo strip. Tiles flow in a row (scrolls on overflow) and STAGGER in: each tile
    // fades + rises, with an incrementing delay down the line (delay-* are token utilities,
    // not raw ms). Radix mounts Content fresh on open, so these mount-time animations fire.
    media: [
      // overflow-y-hidden: with overflow-x-auto, the y axis would compute to `auto` and the tiles'
      // downward slide would flash a vertical scrollbar mid-animation. Hidden clips that cleanly.
      "flex gap-3 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      "[&>*]:duration-base [&>*]:ease-out",
      // `fill-mode-backwards` holds the FROM frame (invisible) during each tile's delay — without
      // it, a delayed tile flashes at its final state before snapping back to animate (the glitch).
      "group-data-[state=open]/content:[&>*]:animate-in group-data-[state=open]/content:[&>*]:fade-in-0 group-data-[state=open]/content:[&>*]:slide-in-from-bottom-3 group-data-[state=open]/content:[&>*]:fill-mode-backwards",
      "[&>*:nth-child(2)]:delay-75 [&>*:nth-child(3)]:delay-150 [&>*:nth-child(4)]:delay-200 [&>*:nth-child(5)]:delay-300 [&>*:nth-child(n+6)]:delay-300",
    ],
    // One framed photo: a polaroid-style mat (concentric — rounded-xl outer, p-1, rounded-lg
    // inner) with a faint inset ring (the image-outline polish) and a soft shadow.
    image: "relative shrink-0 overflow-hidden rounded-xl bg-card p-1 shadow-sm ring-1 ring-inset ring-foreground/5",
    img: "h-full w-full select-none rounded-lg object-cover",
    // Optional "+N" overlay on the last tile, signalling more photos behind it.
    overlay: [
      "pointer-events-none absolute inset-1 grid place-items-center rounded-lg",
      "bg-foreground/40 text-sm font-semibold tabular-nums text-background backdrop-blur-[1px]",
    ],
    // ── Interactive tile (action set): hover/focus reveals a pill IN PLACE — the tile never
    // moves or scales (the image-hover-badge rule). Pairs with LightboxTrigger asChild. ──
    tileScrim:
      "pointer-events-none absolute inset-1 rounded-lg bg-black/0 transition-colors duration-base ease-out group-hover/tile:bg-black/30 group-focus-visible/tile:bg-black/30",
    tilePillLayer: "pointer-events-none absolute inset-0 grid place-items-center",
    tilePill: [
      "inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm",
      // Settle-in with a gentle spring overshoot (a pelín de bounce), in place — no layout shift.
      "scale-90 opacity-0 transition-[opacity,transform] duration-base ease-spring",
      "group-hover/tile:scale-100 group-hover/tile:opacity-100 group-focus-visible/tile:scale-100 group-focus-visible/tile:opacity-100",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
  },
  variants: {
    // Marks a tile that opens something (e.g. a Lightbox): adds the hover group, pointer cursor,
    // and focus ring. The pill (drawn in markup) is the only affordance — no scale/lift.
    interactive: {
      true: {
        image: [
          "group/tile cursor-pointer outline-none",
          "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
      },
      false: {},
    },
    // Koala's cross-cutting spacing axis (lib/density.tsx): governs row height + panel inset.
    density: {
      comfortable: { trigger: "py-5", contentInner: "pb-7" },
      compact: { trigger: "py-4", contentInner: "pb-5" },
    },
    // Title scale. Lighter than an editorial chapter index by default; `lg` for hero use.
    size: {
      md: { title: "text-base sm:text-lg" },
      lg: { title: "text-lg sm:text-xl" },
    },
  },
  defaultVariants: {
    density: "comfortable",
    size: "md",
    interactive: false,
  },
})

type GalleryAccordionSlots = ReturnType<typeof galleryAccordionVariants>
const [GalleryAccordionProvider, useGalleryAccordionContext] = createContext<{
  slots: GalleryAccordionSlots
}>("GalleryAccordion")

export interface GalleryAccordionProps
  extends Omit<
      React.ComponentProps<typeof AccordionPrimitive.Root>,
      "type" | "value" | "defaultValue" | "onValueChange" | "asChild"
    >,
    VariantProps<typeof galleryAccordionVariants> {
  /** The open collection (controlled). Pair with `onValueChange`. */
  value?: string
  /** The collection open on mount (uncontrolled). Defaults to none open (`""`). */
  defaultValue?: string
  /** Fires when the open collection changes — via click or keyboard. */
  onValueChange?: (value: string) => void
}

/**
 * Parts are exported individually (not `GalleryAccordion.Item` dot-notation): namespaced
 * statics don't survive the RSC server→client boundary. Compose as
 * `<GalleryAccordion><GalleryAccordionItem value="…">…`.
 *
 * A thin pass-through to Radix's single Accordion: open/close state, controlled
 * (`value`/`onValueChange`) or uncontrolled (`defaultValue`), is Radix's own. Click/keyboard
 * only — no hover-open (a standing DS rule for accordions).
 */
export function GalleryAccordion({
  className,
  density,
  size,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: GalleryAccordionProps) {
  const slots = galleryAccordionVariants({ density: useDensity(density), size })
  return (
    <GalleryAccordionProvider slots={slots}>
      <AccordionPrimitive.Root
        type="single"
        collapsible
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        data-slot="gallery-accordion"
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </AccordionPrimitive.Root>
    </GalleryAccordionProvider>
  )
}

export interface GalleryAccordionItemProps
  extends React.ComponentProps<typeof AccordionPrimitive.Item> {
  value: string
}

export function GalleryAccordionItem({
  className,
  value,
  ...props
}: GalleryAccordionItemProps) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionItem")
  return (
    <AccordionPrimitive.Item
      data-slot="gallery-accordion-item"
      value={value}
      className={slots.item({ className })}
      {...props}
    />
  )
}

export interface GalleryAccordionTriggerProps
  extends Omit<React.ComponentProps<typeof AccordionPrimitive.Trigger>, "children"> {
  /** The collection title. */
  children: React.ReactNode
  /** One-line tagline shown under the title (always visible). */
  tagline?: React.ReactNode
  /** The collection size, e.g. a photo total. Rendered with tabular numbers. */
  count?: React.ReactNode
  /** A `GalleryAccordionPeek` (or any node) shown at rest and faded out on open. */
  peek?: React.ReactNode
}

export function GalleryAccordionTrigger({
  className,
  children,
  tagline,
  count,
  peek,
  ...props
}: GalleryAccordionTriggerProps) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionTrigger")
  return (
    <AccordionPrimitive.Header data-slot="gallery-accordion-header" className={slots.header()}>
      <AccordionPrimitive.Trigger
        data-slot="gallery-accordion-trigger"
        className={slots.trigger({ className })}
        {...props}
      >
        <span className={slots.titleWrap()}>
          <span className={slots.title()}>{children}</span>
          {tagline != null && <span className={slots.tagline()}>{tagline}</span>}
        </span>
        <span className={slots.meta()}>
          {peek}
          {count != null && <span className={slots.count()}>{count}</span>}
          <span aria-hidden className={slots.toggle()}>
            <Plus weight="bold" />
          </span>
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export interface GalleryAccordionPeekProps extends React.ComponentProps<"span"> {
  /** Thumbnails to stack. Only the first `max` are shown. */
  images: { src: string; alt?: string }[]
  /** How many tiles to peek. @default 3 */
  max?: number
}

/** The overlapping thumbnail stack on a collapsed row. Decorative; fades out on open. */
export function GalleryAccordionPeek({ className, images, max = 3, ...props }: GalleryAccordionPeekProps) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionPeek")
  return (
    <span aria-hidden data-slot="gallery-accordion-peek" className={slots.peek({ className })} {...props}>
      {images.slice(0, max).map((image, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.src}-${i}`}
          src={image.src}
          alt=""
          draggable={false}
          loading="lazy"
          className={slots.peekTile()}
        />
      ))}
    </span>
  )
}

export function GalleryAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionContent")
  return (
    <AccordionPrimitive.Content
      data-slot="gallery-accordion-content"
      className={slots.content()}
      {...props}
    >
      <div className={slots.contentInner({ className })} data-slot="gallery-accordion-panel">
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

/** Optional caption line above the photo strip. */
export function GalleryAccordionCaption({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionCaption")
  return <p data-slot="gallery-accordion-caption" className={slots.caption({ className })} {...props} />
}

/** The horizontal photo strip. Drop `GalleryAccordionImage`s inside; they stagger in on open. */
export function GalleryAccordionMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionMedia")
  return <div data-slot="gallery-accordion-media" className={slots.media({ className })} {...props} />
}

export interface GalleryAccordionImageProps
  extends Omit<React.ComponentProps<"button">, "children" | "type"> {
  /** The photo source. */
  src: string
  /** Alt text — also the accessible name of the tile when `action` makes it a button. */
  alt?: string
  /** Size the framed tile here (e.g. `className="h-48 w-36"`). */
  className?: string
  /** Renders a dimmed "+N"-style overlay over the tile to signal more photos behind it. */
  overlay?: React.ReactNode
  /**
   * When set, the tile becomes an interactive `<button>` that reveals this label as a centered
   * pill on hover/focus (in place — the tile never moves). Pair it with `LightboxTrigger asChild`
   * to open the full-screen viewer, or your own `onClick`.
   */
  action?: React.ReactNode
  /** Native `<img>` loading attribute. @default "lazy" */
  loading?: "lazy" | "eager"
}

export function GalleryAccordionImage({
  className,
  overlay,
  action,
  src,
  alt = "",
  loading = "lazy",
  ...rest
}: GalleryAccordionImageProps) {
  const { slots } = useGalleryAccordionContext("GalleryAccordionImage")
  // Plain lazy <img> (not next/image), like GalleryImage/ActivityImage: config-free for any
  // remote source. The mat/ring/shadow live on the wrapper; size the tile via `className`.
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} loading={loading} className={slots.img()} />
      {overlay != null && (
        <span aria-hidden className={slots.overlay()}>
          {overlay}
        </span>
      )}
      {action != null && (
        <>
          <span aria-hidden className={slots.tileScrim()} />
          <span aria-hidden className={slots.tilePillLayer()}>
            <span className={slots.tilePill()}>{action}</span>
          </span>
        </>
      )}
    </>
  )

  // Interactive: a real <button> (accessible name from `alt`) so it works with keyboard +
  // LightboxTrigger asChild, which merges its open-on-click onto this element via `...rest`.
  if (action != null) {
    return (
      <button
        type="button"
        data-slot="gallery-accordion-image"
        className={slots.image({ interactive: true, className })}
        {...rest}
      >
        {inner}
      </button>
    )
  }

  return (
    <div
      data-slot="gallery-accordion-image"
      className={slots.image({ className })}
      {...(rest as React.ComponentProps<"div">)}
    >
      {inner}
    </div>
  )
}
