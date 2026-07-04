"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { CheckCircle, Info, XCircle } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { Tooltip } from "@/components/ui/tooltip"
import { Divider } from "@/components/ui/divider"

/**
 * Pricing: the canonical marketing pricing table: a responsive row of plan cards (tiers),
 * each with a name, a description, a big tabular price, a feature checklist, and a call to
 * action. Multi-part like Bento/Card: one `tv` recipe with `slots`, shared through a typed
 * React Context so every part of a tier reads the same styles (never prop-drilled or cloned).
 * See docs/ARCHITECTURE.md §2.
 *
 * `Pricing` is the grid (1 col → 2 at sm → `columns` at lg). Each `PricingTier` is a card
 * that can be `featured` (a brand ring + elevated shadow to anchor the recommended plan), and
 * composes a `PricingTierHeader` (name + description), a `PricingPrice` (a baseline-aligned
 * `PricingAmount` + `PricingPeriod`), a `PricingFeatures` checklist of `PricingFeature` rows,
 * and a bottom-pinned `PricingTierAction` for the CTA `Button`. Marketing is comfortable by
 * nature, so there's no density axis (matches Bento/Banner).
 *
 * polish applied:
 *   #6  - the feature check/exclude glyph is optically nudged (mt-0.5) to sit on the text baseline.
 *   #14 - the featured ring transition names exact properties, never "all".
 *   tabular-nums on PricingAmount so swapping monthly⇄annual prices never reflows the row.
 *   concentric radius: rounded-2xl card over rounded-md inner Button/Badge.
 */
export const pricingVariants = tv({
  slots: {
    // The grid. Stacks on mobile, pairs at sm, fans to `columns` at lg. `items-stretch`
    // (the grid default) makes every tier in a row equal height so prices/CTAs line up.
    root: "grid grid-cols-1 gap-6 sm:grid-cols-2",
    // One plan card: a static surface (the CTA is the interactive element, not the card). The fill
    // is `bg-transparent`, so the card reads as the same colour as whatever it sits on (page or a
    // coloured section) instead of an elevated panel; it's delineated by its border alone. The
    // `solid`/`muted` tones paint over this. `h-full` + `flex-col` lets the card stretch to the row
    // height and pin its action bottom. Shadow lives on the `featured` variant (not here), because
    // the featured ring is itself a box-shadow (brand-ring) and the two would collide on one element.
    tier: [
      "relative flex h-full flex-col gap-6 rounded-2xl border border-border bg-transparent p-6 text-card-foreground",
      "transition-[border-color,box-shadow] duration-base ease-out",
    ],
    header: "flex flex-col gap-1.5",
    name: "text-lg font-semibold leading-snug text-balance",
    description: "text-pretty text-sm text-muted-foreground",
    // Baseline-aligned so a tall amount and its small period sit on the same line.
    price: "flex flex-wrap items-baseline gap-x-1.5 gap-y-1",
    amount: "text-4xl font-semibold tracking-tight tabular-nums text-foreground",
    period: "text-sm font-medium text-muted-foreground",
    // The checklist: a hairline rule separates it from the price, then rows stack.
    features: "flex flex-col gap-3 border-t border-border pt-6 text-sm",
    feature: "flex items-start gap-2.5 text-pretty text-muted-foreground",
    // Shared glyph geometry. Colour is layered on per state: included rows add `featureCheck`
    // (the success/inverse fill); excluded rows inherit the (dimmed) row colour via currentColor,
    // so a filled XCircle reads as a muted token without a second colour rule.
    featureIcon: "mt-0.5 size-5 shrink-0 [&>svg]:size-5",
    // The included check's fill colour. Success green by default, flipped to white on `solid`.
    featureCheck: "text-success",
    // Label + its optional hint, kept on one line so the info glyph sits right beside the text
    // (not pushed to the row's far edge).
    featureLabel: "flex min-w-0 items-center gap-1.5",
    // Trailing info affordance (a `hint`): muted by default, brightens on hover/focus, and
    // gets a ≥hit-area via a `before` pseudo that stays inside the row gap so it never
    // overlaps the neighbouring feature.
    featureHint: [
      "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/50",
      "transition-colors duration-fast ease-out hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      "[&>svg]:size-4",
      "before:absolute before:left-1/2 before:top-1/2 before:size-9 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
    ],
    // ── Feature groups: the "features with icons" layout ───────────────────────────────────
    // An alternative to the flat checklist: features split into labelled sections, each led by a
    // centred Divider header, each row carrying its own contextual icon (not a status check). It
    // suits a lifetime / all-in bundle, where the value is a long, categorised inventory rather
    // than a have/have-not list. Compose with `PricingFeatureGroup` (one per section).
    // One group: a header rule stacked over its own icon list.
    featureGroup: "flex flex-col",
    // The centred label inside the group's Divider: an optional leading icon + the text, held
    // together so the icon hugs the label between the flanking rules (the icon tracks the label's
    // muted colour via currentColor).
    featureGroupLabel: "flex items-center gap-1.5 [&>svg]:size-4",
    // The group's row list. Rows read at full strength here (text-foreground): the leading icon,
    // not a dimmed weight, carries the "list" affordance, so the label can sit at full contrast.
    featureGroupList: "mt-5 flex flex-col gap-3.5 text-sm [&>[data-slot=pricing-feature]]:text-foreground",
    // A contextual (custom `icon`) glyph: neutral + muted, so it reads as a category marker beside
    // the label rather than a success check. (The default check/cross keep their success/dim tints.)
    featureCustomIcon: "text-muted-foreground",
    // The CTA wrapper; the direct child (Button, or a link via asChild) is stretched to the full
    // card width. `mt-auto` (the `bottom` position) is layered on by the `actionPosition` variant
    // so CTAs line up across cards; `top` drops it for an action that sits under the price.
    action: "pt-2 [&>*]:w-full",
    // The "banner-behind" frame: a brand panel the card nests inside, peeking as a top label and a
    // thin edge all around. Concentric: the outer radius is derived from the inner card's
    // `rounded-2xl` (--radius-2xl, 24px) + the `p-0.5` edge (2px), so the corners nest exactly and
    // the frame still tracks the radius knob. `h-full` + the flexed last child keep banner cards the
    // same height as their plain neighbours. The nested tier is forced opaque (`bg-background`):
    // tiers are transparent by default, which would let this brand panel bleed through the card.
    bannerFrame: [
      "flex h-full flex-col rounded-[calc(var(--radius-2xl)+2px)] bg-brand p-0.5",
      "[&>[data-slot=pricing-tier]]:flex-1 [&>[data-slot=pricing-tier]]:bg-background",
    ],
    bannerLabel: "py-2 text-center text-sm font-semibold text-white",
  },
  variants: {
    // How many tiers sit in a row at the `lg` breakpoint. Always one column on mobile and two
    // at `sm`, so cards never get too narrow to read.
    columns: {
      2: { root: "sm:grid-cols-2" },
      3: { root: "lg:grid-cols-3" },
      4: { root: "lg:grid-cols-4" },
    },
    // The card's surface treatment, orthogonal to `featured` (the recommended ring), so the two
    // can combine. `default` is the white card; `outline` swaps the hairline for a brand edge;
    // `solid` fills the card with the accent and flips every part to inverse text/glyphs; `muted`
    // sits the card on a soft grey panel. For the "banner behind" look, wrap a tier in
    // `PricingTierBanner` (a separate part) instead of a tone, so any tone can carry a banner.
    tone: {
      default: {},
      outline: { tier: "border-brand" },
      solid: {
        tier: "border-brand bg-brand text-white",
        description: "text-white/80",
        amount: "text-white",
        period: "text-white/75",
        features: "border-white/20",
        feature: "text-white/85",
        featureCheck: "text-white",
        // Keep grouped rows + their contextual icons legible on the accent fill.
        featureGroupList: "[&>[data-slot=pricing-feature]]:text-white",
        featureCustomIcon: "text-white/80",
      },
      muted: { tier: "border-transparent bg-secondary" },
    },
    // Where the CTA sits inside the card. `bottom` (default) pins it to the foot via `mt-auto` so
    // CTAs line up across cards; `top` lets it sit in flow directly under the price, dropping the
    // base `pt-2` (which only earns its keep separating the button from the list below) so the
    // button sits snug under the price on the tier's own `gap-6`.
    actionPosition: {
      bottom: { action: "mt-auto" },
      top: { action: "mt-0 pt-0" },
    },
    // The recommended plan. The brand border plus the canonical `brand-ring` (the same soft
    // accent ring our form controls use on focus): a 3px halo flush against the border, no gap,
    // so it reads as one emphasized edge. Non-featured tiers carry the resting `shadow-xs`
    // instead. Pair it with a "Most popular" Badge in the header and a primary CTA.
    featured: {
      true: { tier: "border-brand brand-ring" },
      false: { tier: "shadow-xs" },
    },
  },
  defaultVariants: {
    columns: 3,
    tone: "default",
    actionPosition: "bottom",
    featured: false,
  },
})

type PricingSlots = ReturnType<typeof pricingVariants>
const [PricingTierProvider, usePricingTierContext] = createContext<{ slots: PricingSlots }>(
  "PricingTier",
)

export interface PricingProps
  extends React.ComponentProps<"div">,
    Pick<VariantProps<typeof pricingVariants>, "columns"> {}

/**
 * The grid container. Parts are exported individually (not `Pricing.Tier` dot-notation):
 * namespaced statics don't survive the RSC server→client boundary. Compose as
 * `<Pricing><PricingTier><PricingTierHeader>…`.
 */
export function Pricing({ className, columns, ...props }: PricingProps) {
  // The grid owns `columns`; tiers read `featured` from their own props, so the root recipe
  // only needs the column axis here.
  const { root } = pricingVariants({ columns })
  return <div data-slot="pricing" className={root({ className })} {...props} />
}

export interface PricingTierProps
  extends React.ComponentProps<"div">,
    Omit<VariantProps<typeof pricingVariants>, "columns"> {
  /** Render the tier as its child (e.g. an `<a>`) so the whole card becomes one link. */
  asChild?: boolean
}

/** One plan card. Owns `featured`/`tone`/`actionPosition` for itself and its parts via Context. */
export function PricingTier({
  className,
  featured,
  tone,
  actionPosition,
  asChild = false,
  ...props
}: PricingTierProps) {
  const slots = pricingVariants({ featured, tone, actionPosition })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <PricingTierProvider slots={slots}>
      <Comp
        data-slot="pricing-tier"
        data-featured={featured || undefined}
        data-tone={tone || undefined}
        className={slots.tier({ className })}
        {...props}
      />
    </PricingTierProvider>
  )
}

/** Name + description block at the top of a tier. */
export function PricingTierHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePricingTierContext("PricingTierHeader")
  return <div data-slot="pricing-tier-header" className={slots.header({ className })} {...props} />
}

export function PricingTierName({ className, ...props }: React.ComponentProps<"h3">) {
  const { slots } = usePricingTierContext("PricingTierName")
  return <h3 data-slot="pricing-tier-name" className={slots.name({ className })} {...props} />
}

export function PricingTierDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = usePricingTierContext("PricingTierDescription")
  return (
    <p data-slot="pricing-tier-description" className={slots.description({ className })} {...props} />
  )
}

/** Baseline-aligned price row. Compose a `PricingAmount` with an optional `PricingPeriod`. */
export function PricingPrice({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePricingTierContext("PricingPrice")
  return <div data-slot="pricing-price" className={slots.price({ className })} {...props} />
}

/** The large headline price (`tabular-nums`, so swapping plans never shifts the row). */
export function PricingAmount({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePricingTierContext("PricingAmount")
  return <span data-slot="pricing-amount" className={slots.amount({ className })} {...props} />
}

/** The muted suffix after the amount, e.g. "/month" or "per seat". */
export function PricingPeriod({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePricingTierContext("PricingPeriod")
  return <span data-slot="pricing-period" className={slots.period({ className })} {...props} />
}

/** The feature checklist (a `<ul>`). Holds `PricingFeature` rows. */
export function PricingFeatures({ className, ...props }: React.ComponentProps<"ul">) {
  const { slots } = usePricingTierContext("PricingFeatures")
  return <ul data-slot="pricing-features" className={slots.features({ className })} {...props} />
}

export interface PricingFeatureProps extends React.ComponentProps<"li"> {
  /**
   * Whether the plan includes this feature. `true` (default) shows a success check; `false`
   * dims the row and shows a neutral minus, so a single list reads as included vs. not.
   */
  included?: boolean
  /** Replace the leading glyph (e.g. a custom icon). Defaults to a check / minus by `included`. */
  icon?: React.ReactNode
  /**
   * Optional extra detail (a limit, a caveat, "what counts as a seat"). Renders a trailing
   * info glyph that reveals this content in a tooltip on hover/focus, so the label stays terse
   * but the nuance is one hover away. Anything a `Tooltip` accepts: a string or richer node.
   */
  hint?: React.ReactNode
  /** Accessible label for the info trigger when `hint` is set. Defaults to "More information". */
  hintLabel?: string
}

/**
 * One row in the checklist. Renders its own leading glyph: a filled success CheckCircle when
 * `included`, a filled XCircle when not, so consumers just write the label, never a hand-rolled
 * icon. (The filled circle is a deliberate, scoped exception to the outline-icon house rule: it
 * reads as a status token, not an action.) Excluded rows dim the whole line via opacity, so the
 * dimming is tone-aware (it works on the white, grey, and solid-accent surfaces alike). Pass
 * `hint` to append an info affordance whose tooltip carries the extra detail.
 */
export function PricingFeature({
  className,
  included = true,
  icon,
  hint,
  hintLabel = "More information",
  children,
  ...props
}: PricingFeatureProps) {
  const { slots } = usePricingTierContext("PricingFeature")
  return (
    <li
      data-slot="pricing-feature"
      data-included={included || undefined}
      className={slots.feature({ className: cn(!included && "opacity-60", className) })}
      {...props}
    >
      <span
        aria-hidden
        // A custom `icon` is a contextual glyph, so it takes the neutral `featureCustomIcon` tint
        // (never the success green of a status check). The default glyph keeps the status colour:
        // the success/inverse fill when included; the row's dimmed currentColor when excluded.
        className={slots.featureIcon({
          className:
            icon != null
              ? slots.featureCustomIcon()
              : included
                ? slots.featureCheck()
                : undefined,
        })}
      >
        {icon ?? (included ? <CheckCircle weight="fill" /> : <XCircle weight="fill" />)}
      </span>
      {/* Label and hint share one inline group so the info glyph sits right beside the text. */}
      <span className={slots.featureLabel()}>
        <span>{children}</span>
        {hint != null && (
          <Tooltip content={hint}>
            <button type="button" aria-label={hintLabel} className={slots.featureHint()}>
              <Info weight="bold" />
            </button>
          </Tooltip>
        )}
      </span>
    </li>
  )
}

export interface PricingFeatureGroupProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The group's centred header label, e.g. "What's inside" or "Some gifts included". */
  label: React.ReactNode
  /** Optional leading glyph shown beside the label (e.g. a Gift for a "gifts" group). */
  icon?: React.ReactNode
  /** The group's rows: `PricingFeature`s, each with its own contextual `icon`. */
  children?: React.ReactNode
}

/**
 * A labelled section of features: a centred Divider header over a list of icon rows. Stack several
 * inside a tier, in place of a single flat `PricingFeatures`, for the "features with icons" layout
 * a lifetime / all-in bundle wants, where the value is a long, categorised inventory rather than a
 * have/have-not checklist. Each child `PricingFeature` carries its own contextual `icon`, and the
 * rows read at full strength because that icon, not a dimmed weight, marks the line.
 */
export function PricingFeatureGroup({
  label,
  icon,
  className,
  children,
  ...props
}: PricingFeatureGroupProps) {
  const { slots } = usePricingTierContext("PricingFeatureGroup")
  return (
    <div data-slot="pricing-feature-group" className={slots.featureGroup({ className })} {...props}>
      {/* The header is a labelled Divider. `static` keeps it painted: it lands first in the group,
          where the smart :first-child rule would otherwise auto-collapse it. */}
      <Divider static>
        <span className={slots.featureGroupLabel()}>
          {icon}
          {label}
        </span>
      </Divider>
      <ul className={slots.featureGroupList()}>{children}</ul>
    </div>
  )
}

/** CTA wrapper. Drop a Koala `Button` (full-width) inside it. Pin or float it with the tier's
 * `actionPosition` (`bottom` by default; `top` to sit under the price). */
export function PricingTierAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePricingTierContext("PricingTierAction")
  return <div data-slot="pricing-tier-action" className={slots.action({ className })} {...props} />
}

export interface PricingTierBannerProps extends React.ComponentProps<"div"> {
  /** The text shown in the protruding banner (e.g. "Get 40% off"). */
  label: React.ReactNode
}

/**
 * The "banner behind" treatment: a brand panel that a `PricingTier` nests inside, peeking as a
 * top label and a thin accent edge all around. It *wraps* the tier (it doesn't share the tier's
 * Context, so it carries its own slots from the recipe), which keeps any tone usable underneath:
 *
 *   <PricingTierBanner label="Get 40% off">
 *     <PricingTier>…</PricingTier>
 *   </PricingTierBanner>
 *
 * Inside a `Pricing` grid it stretches to the row height and flexes the nested card, so a banner
 * card lines up with its plain neighbours.
 */
export function PricingTierBanner({ label, className, children, ...props }: PricingTierBannerProps) {
  const { bannerFrame, bannerLabel } = pricingVariants()
  return (
    <div data-slot="pricing-tier-banner" className={bannerFrame({ className })} {...props}>
      <div className={bannerLabel()}>{label}</div>
      {children}
    </div>
  )
}
