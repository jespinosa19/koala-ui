"use client"

import * as React from "react"
import { X } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize, useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * PromoCard: the in-app feature promotion. A dashboard card that sells one capability of the
 * product (a module, an add-on, a new feature) with the copy on the left and a live crop of that
 * feature on the right. Multi-part like Card: one `tv` recipe with `slots`, the root's variants
 * flowing to every part through React Context (docs/ARCHITECTURE.md §2).
 *
 * The media is a PEEK, not an inset picture: a framed screen that starts on the copy's top line and
 * runs off the card's right and bottom edges, dissolving to the right through the `fade-r` mask. It
 * is the deliberate exception to "inset media in cards" (the same call as Bento's `bleed`): the
 * crop is the point, it says "there is a whole product behind this" without shrinking it to fit.
 */
export const promoCardVariants = tv({
  slots: {
    // `isolate` so the peek's mask and the close button stack inside the card, never over the page.
    // No border: the edge is a ring per variant (shadows over borders), so it takes no layout.
    // The root is a size container: whether the peek sits beside the copy or under it depends on the
    // CARD's width, not the viewport's, since a dashboard drops the same promo into a full row, a
    // half column or a narrow rail. The price of `container-type: inline-size` is that the card
    // can't size itself from its content: as a shrink-to-fit flex item with no width it collapses
    // to 0. Grid cells and block flow give it a width; in a flex row, give it `flex-1` or a `w-*`.
    root: [
      "@container/promo-card relative isolate overflow-hidden rounded-xl text-card-foreground",
      // Leaving is softer than arriving (there is no arrival: a promo is on the page at load): a
      // short fade with a 2% settle, then the root unmounts on animationend.
      "duration-fast ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-98",
      // A close button rides the top-right corner; the eyebrow row yields it room so a long product
      // name never runs under it (only matters without media, or stacked).
      "[&:has([data-slot=promo-card-close])_[data-slot=promo-card-eyebrow]]:pe-10",
    ],
    // The grid the parts land in (a container can't restyle itself from its own query, so the grid
    // is one level down). The second column only exists when a PromoCardMedia is present (every part
    // is droppable), and the media track runs a touch wider than the copy.
    inner: [
      "grid grid-cols-1",
      "@2xl/promo-card:has-[>[data-slot=promo-card-media]]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
    ],
    // The copy column. Content sits at the bottom (`justify-end`); the eyebrow claims the top with
    // `mb-auto`, so with it the column reads top/bottom like the reference and without it the pitch
    // still lands on the same baseline.
    content: "flex min-w-0 flex-col justify-end",
    // Product identity row: the app icon and its name. Its bottom gap only exists to part it from a
    // pitch below; left alone in the column, it drops it.
    eyebrow: "mb-auto flex items-center gap-2.5 pb-10 text-sm font-medium text-foreground last:pb-0",
    // The app's own mark: an `<img>` of the product logo fills the tile, sized and rounded like the
    // BrandMark tile (size-7, rounded-lg) so either can lead the eyebrow. There is no color axis: the
    // mark is the brand, not a per-feature tint. A bare glyph gets a neutral muted tile. The edge is an
    // ::after ring painted over the image (an inset ring on the img paints under it), pure black/white
    // at 10% per the image-outline rule.
    icon: [
      "relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-foreground shadow-xs",
      "[&>svg]:size-4 [&>img]:size-full [&>img]:object-cover",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
    ],
    // Title and description share one measure (left-aligned blocks, one max-w) so a wide card
    // without media never stretches the pitch into a 120-character line.
    title: "max-w-md font-medium text-balance text-foreground",
    // Reading ink (`text-body`): it's a sentence someone reads, not a label.
    description: "mt-1 max-w-md text-pretty text-body first:mt-0",
    actions: "mt-5 flex flex-wrap items-center gap-2 first:mt-0",
    // The peek window. Layout-driven height on desktop (it spans the card beside the copy); stacked
    // on a phone it owns a ratio instead, so the crop keeps its shape at every width.
    media: "relative aspect-[4/3] min-w-0 @sm/promo-card:aspect-video @2xl/promo-card:aspect-auto",
    // The tray: a translucent ink wash with an edge ring, the frame's padding sets the inner corner
    // (rounded-xl 20 − p-2 8 = rounded-md 12, the ladder's first rung). Pinned to the copy's top
    // line and overshooting right and bottom; the card's overflow is what crops it.
    frame: [
      "absolute -right-12 -bottom-8 rounded-xl bg-foreground/4 p-2 ring-1 ring-edge",
      // The band is deep enough that most of it lands INSIDE the card: the overshoot hides the last
      // 3rem, and a shallow band would be cropped before it read as a dissolve.
      "[--fade-size:min(14rem,45%)] fade-r",
    ],
    // The screen inside the tray: a lifted surface, so it declares `--surface` for any DS control
    // composed into it. An image fills it from the top-left (the part of a UI that carries meaning).
    screen: [
      "relative size-full overflow-hidden rounded-md bg-card text-card-foreground shadow-sm [--surface:var(--card)]",
      "[&>img]:size-full [&>img]:object-cover [&>img]:object-left-top",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
    ],
    close: "absolute z-10",
  },
  variants: {
    // Fill is elevation (docs/FOUNDATIONS.md): `default` is an in-flow contour with no fill, the
    // edge ring plus the xs lift. `muted` and `brand` are deliberate tints, not elevation, for a
    // promo that should stand apart from the data cards around it. `elevated` floats, so it fills
    // and declares `--surface`.
    variant: {
      default: { root: "shadow-xs ring-1 ring-edge" },
      // A tint is a ground too. No token equals a 50% muted wash, so the declaration is the mix
      // itself (docs/FOUNDATIONS.md): without it an Input composed into a tinted promo paints
      // `--background` and reads as a darker hole punched through the tint, in dark only.
      muted: {
        root: "bg-muted/50 ring-1 ring-edge [--surface:color-mix(in_oklab,var(--muted)_50%,var(--background))]",
      },
      brand: {
        root: "bg-brand/5 ring-1 ring-brand/15 [--surface:color-mix(in_oklab,var(--brand)_5%,var(--background))]",
        frame: "bg-brand/5 ring-brand/15",
      },
      elevated: { root: "bg-card shadow-lg [--surface:var(--card)]" },
    },
    // Density tunes the padding, the resting height (with a peek only) and the type step. The
    // frame's top offset is the copy padding minus the tray's own p-2, so the SCREEN (not the tray)
    // lines up with the eyebrow; stacked, the tray sits at the copy's left edge instead.
    density: {
      compact: {
        inner: "@2xl/promo-card:has-[>[data-slot=promo-card-media]]:min-h-72",
        content: "p-6",
        title: "text-base",
        description: "text-sm",
        frame: "top-0 left-6 @2xl/promo-card:top-4 @2xl/promo-card:left-0",
        close: "top-3 right-3",
      },
      comfortable: {
        inner: "@2xl/promo-card:has-[>[data-slot=promo-card-media]]:min-h-80",
        content: "p-8",
        title: "text-lg",
        description: "text-base",
        frame: "top-0 left-8 @2xl/promo-card:top-6 @2xl/promo-card:left-0",
        close: "top-4 right-4",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    density: "compact",
  },
})

type PromoCardSlots = ReturnType<typeof promoCardVariants>
const [PromoCardProvider, usePromoCardContext] = createContext<{
  slots: PromoCardSlots
  dismiss: () => void
}>("PromoCard")

export interface PromoCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof promoCardVariants> {
  /** Controlled visibility. Omit for the built-in uncontrolled behavior. */
  open?: boolean
  /** Uncontrolled initial visibility. @default true */
  defaultOpen?: boolean
  /** Fires when a `PromoCardClose` dismisses the card (persist the choice here). */
  onOpenChange?: (open: boolean) => void
}

/**
 * Parts are exported individually (not `PromoCard.Title` dot-notation) so they survive the RSC
 * server→client boundary. Compose as
 * `<PromoCard><PromoCardContent>…</PromoCardContent><PromoCardMedia>…</PromoCardMedia></PromoCard>`.
 */
export function PromoCard({
  className,
  variant,
  density,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  onAnimationEnd,
  children,
  ...props
}: PromoCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? internalOpen

  // Stay mounted through the exit so a dismissal fades out instead of popping. React's adjust-state-
  // during-render pattern (never an effect, per the strict hooks lint), as CookieBanner does:
  // reopening remounts at once; closing paints `data-state="closed"` and unmounts on animationend.
  // tw-animate-css runs the exit even under reduced motion, so animationend always fires.
  const [mounted, setMounted] = React.useState(open)
  if (open && !mounted) setMounted(true)

  const slots = promoCardVariants({ variant, density: useDensity(density) })

  function dismiss() {
    if (controlledOpen === undefined) setInternalOpen(false)
    onOpenChange?.(false)
  }

  if (!mounted) return null

  // No `asChild`: the card is not a link. Its action is a Button inside it, and a card-sized anchor
  // around that button would nest one interactive element in another.
  return (
    <PromoCardProvider slots={slots} dismiss={dismiss}>
      <div
        data-slot="promo-card"
        data-state={open ? "open" : "closed"}
        className={slots.root({ className })}
        onAnimationEnd={(event) => {
          onAnimationEnd?.(event)
          // Only the root's own exit, never a child's animation bubbling up.
          if (event.target === event.currentTarget && !open) setMounted(false)
        }}
        {...props}
      >
        <div data-slot="promo-card-inner" className={slots.inner()}>
          {children}
        </div>
      </div>
    </PromoCardProvider>
  )
}

/** The copy column: eyebrow on top, the pitch and its action at the bottom. */
export function PromoCardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePromoCardContext("PromoCardContent")
  return <div data-slot="promo-card-content" className={slots.content({ className })} {...props} />
}

/** The product row: a `PromoCardIcon` and the feature's name. */
export function PromoCardEyebrow({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePromoCardContext("PromoCardEyebrow")
  return <div data-slot="promo-card-eyebrow" className={slots.eyebrow({ className })} {...props} />
}

/**
 * The app's mark: pass an `<img>` of the product logo, which fills the tile (in Koala's own UI,
 * drop `<BrandMark wordmark={false} />` in the eyebrow instead). Decorative next to the name, so
 * hidden from assistive tech.
 */
export function PromoCardIcon({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePromoCardContext("PromoCardIcon")
  return (
    <span data-slot="promo-card-icon" aria-hidden className={slots.icon({ className })} {...props} />
  )
}

export function PromoCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePromoCardContext("PromoCardTitle")
  return <div data-slot="promo-card-title" className={slots.title({ className })} {...props} />
}

export function PromoCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = usePromoCardContext("PromoCardDescription")
  return (
    <p data-slot="promo-card-description" className={slots.description({ className })} {...props} />
  )
}

export interface PromoCardActionsProps extends React.ComponentProps<"div"> {
  /**
   * Control height imposed on the buttons inside (see lib/density.tsx). A promo's action is a quiet
   * pointer, not a hero CTA, so it defaults small; an explicit `size` on a Button still wins.
   * @default "sm"
   */
  size?: ControlSize
}

export function PromoCardActions({ className, size = "sm", children, ...props }: PromoCardActionsProps) {
  const { slots } = usePromoCardContext("PromoCardActions")
  return (
    <div
      data-slot="promo-card-actions"
      data-control-size={size}
      className={slots.actions({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}

/**
 * The peek: a framed screen cropped by the card's right and bottom edges. Put an `<img>` of the
 * feature (it fills from the top-left) or live DS parts. It is a picture of the product, so by
 * default it is `aria-hidden` and `inert` (nothing inside is focusable or announced); pass
 * `aria-hidden={false} inert={false}` if its contents must be read.
 */
export function PromoCardMedia({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePromoCardContext("PromoCardMedia")
  return (
    <div data-slot="promo-card-media" aria-hidden inert className={slots.media({ className })} {...props}>
      <div data-slot="promo-card-frame" className={slots.frame()}>
        <div data-slot="promo-card-screen" className={slots.screen()}>
          {children}
        </div>
      </div>
    </div>
  )
}

export interface PromoCardCloseProps extends Omit<React.ComponentProps<typeof Button>, "children"> {
  /** Accessible name (and tooltip). @default "Dismiss" */
  "aria-label"?: string
}

/**
 * The dismiss control, top-right. Closing plays the card's exit and fires `onOpenChange(false)`
 * on the root, which is where a dashboard persists "don't show this again".
 */
export function PromoCardClose({
  className,
  onClick,
  "aria-label": ariaLabel = "Dismiss",
  ...props
}: PromoCardCloseProps) {
  const { slots, dismiss } = usePromoCardContext("PromoCardClose")
  return (
    <Button
      data-slot="promo-card-close"
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={ariaLabel}
      className={slots.close({ className })}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) dismiss()
      }}
      {...props}
    >
      <X weight="bold" />
    </Button>
  )
}
