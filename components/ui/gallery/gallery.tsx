"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Gallery: a marketing "concepts / templates wall" section. Multi-part like Hero/Card: one
 * `tv` recipe with `slots`, shared through a typed React Context so every part reads the same
 * styles (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * It is pure layout: a full-bleed `<section>` whose lede + (optional) tab rail live in a
 * centered gutter, while `GalleryMasonry` lays the tiles out as a fake masonry with plain CSS
 * columns (varied natural image heights do the staggering). The section is `overflow-hidden`,
 * so a masonry wider than the gutter clips its outer tiles at the edges for the wide,
 * immersive band. To tab between concept sets, compose the DS `Tabs` inside it.
 *
 * Interactive tiles (`GalleryItem action="…"`) reveal a centered pill on hover/focus WITHOUT
 * shifting position — the badge is the only affordance — which pairs with the `Lightbox`
 * component: wrap the item in a `LightboxTrigger` to open the full-screen viewer.
 */
export const galleryVariants = tv({
  slots: {
    // Full-bleed band; overflow-hidden clips the masonry's outer tiles for the edge bleed.
    root: "relative isolate w-full overflow-hidden bg-background text-foreground",
    // Centered lede column for title + description + the tab rail.
    header:
      "mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-5 pt-16 text-center sm:px-8 sm:pt-24",
    // Shares the canonical `section-heading` size utility (app/globals.css) with SectionHeader and
    // FAQs, so the Gallery lede follows the one section-H2 scale and never drifts.
    title: "section-heading font-semibold tracking-tight text-balance",
    description: "text-base text-pretty text-muted-foreground sm:text-lg",
    // The fake-masonry wall: wider than the gutter so the outer columns clip at the section edges.
    // Sides use the canonical section gutter (px-5 sm:px-8); the wide max-w is the intentional bleed.
    masonry:
      "mx-auto mt-12 w-full max-w-[110rem] columns-2 gap-4 px-5 pb-16 sm:columns-3 sm:px-8 sm:pb-24 lg:columns-4",
    // One framed tile. Concentric radius + hairline frame + a faint inset ring (the image-outline
    // polish principle). Hover deepens the shadow only — never a position change.
    item: [
      "group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-xs",
      "transition-[box-shadow,border-color] duration-base ease-out hover:shadow-md",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-foreground/5",
    ],
    // The preview image: fills its tile. No hover transform, so the tile never shifts.
    image: "w-full select-none object-cover",
    // Hover scrim that darkens the image so the pill stays legible over any photo (a fixed dark
    // wash, like the Dialog overlay — it must read in every theme).
    scrim:
      "pointer-events-none absolute inset-0 rounded-[inherit] bg-black/0 transition-colors duration-base ease-out group-hover:bg-black/30 group-focus-visible:bg-black/30",
    // Centering layer for the badge.
    overlay: "pointer-events-none absolute inset-0 grid place-items-center",
    // The "See image" pill: fades and scales in on hover/focus (in place — no layout shift).
    badge: [
      "inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm",
      // Settle-in with a gentle spring overshoot (a pelín de bounce), in place — no layout shift.
      "scale-90 opacity-0 transition-[opacity,transform] duration-base ease-spring",
      "group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
  },
  variants: {
    // An interactive tile (renders a <button>). The ONLY hover/press affordance is the badge —
    // never a position or scale change (no active:scale, no lift, no zoom). Keep the focus ring
    // for keyboard users.
    interactive: {
      true: {
        item: [
          "cursor-pointer text-left hover:shadow-xs",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
})

type GallerySlots = ReturnType<typeof galleryVariants>
const [GalleryProvider, useGalleryContext] = createContext<{ slots: GallerySlots }>("Gallery")

export type GalleryProps = React.ComponentProps<"section">

/**
 * Parts are exported individually (not `Gallery.Title` dot-notation): namespaced statics don't
 * survive the RSC server→client boundary. Compose as `<Gallery><GalleryHeader>…`.
 */
export function Gallery({ className, children, ...props }: GalleryProps) {
  const slots = galleryVariants()
  return (
    <GalleryProvider slots={slots}>
      <section data-slot="gallery" className={slots.root({ className })} {...props}>
        {children}
      </section>
    </GalleryProvider>
  )
}

export function GalleryHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGalleryContext("GalleryHeader")
  return <div data-slot="gallery-header" className={slots.header({ className })} {...props} />
}

export function GalleryTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { slots } = useGalleryContext("GalleryTitle")
  return <h2 data-slot="gallery-title" className={slots.title({ className })} {...props} />
}

export function GalleryDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useGalleryContext("GalleryDescription")
  return <p data-slot="gallery-description" className={slots.description({ className })} {...props} />
}

export function GalleryMasonry({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useGalleryContext("GalleryMasonry")
  return <div data-slot="gallery-masonry" className={slots.masonry({ className })} {...props} />
}

export interface GalleryItemProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof galleryVariants> {
  /**
   * Render as the single child element (e.g. a `LightboxTrigger`) while keeping the tile
   * styles. Ignored when `action` is set (the badge needs sibling nodes, so the tile renders
   * its own interactive `<button>`).
   */
  asChild?: boolean
  /**
   * When set, the tile becomes an accessible `<button>` that reveals this label as a centered
   * pill on hover/focus — without shifting position. Pair it with `LightboxTrigger`, a link,
   * or your own `onClick`. The tile's accessible name comes from the image `alt`.
   */
  action?: React.ReactNode
}

export function GalleryItem({ className, asChild = false, action, children, ...props }: GalleryItemProps) {
  const { slots } = useGalleryContext("GalleryItem")
  const interactive = action != null
  const Comp = interactive ? "button" : asChild ? Slot.Root : "figure"
  return (
    <Comp
      data-slot="gallery-item"
      className={slots.item({ interactive, className })}
      {...(interactive ? { type: "button" as const } : {})}
      {...props}
    >
      {children}
      {interactive && (
        <>
          <span aria-hidden className={slots.scrim()} />
          <span aria-hidden className={slots.overlay()}>
            <span className={slots.badge()}>{action}</span>
          </span>
        </>
      )}
    </Comp>
  )
}

export type GalleryImageProps = React.ComponentProps<"img">

export function GalleryImage({ className, alt = "", ...props }: GalleryImageProps) {
  const { slots } = useGalleryContext("GalleryImage")
  // Decorative-by-default preview; pass a real `alt` when the image carries meaning. A plain
  // <img> (not next/image) keeps it config-free for any remote source, matching ActivityImage.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="gallery-image"
      alt={alt}
      draggable={false}
      loading="lazy"
      className={slots.image({ className })}
      {...props}
    />
  )
}
