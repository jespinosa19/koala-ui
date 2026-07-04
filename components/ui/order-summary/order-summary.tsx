"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { Trash } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity, type Density } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { Button } from "@/components/ui/button"
import { NumberInput } from "@/components/ui/input"

/**
 * OrderSummary: the checkout/cart order read-out. A Data Display sibling of
 * DescriptionList (key/value) and Stat (KPI): one `tv` recipe with `slots`, shared
 * config flowing to every part through React Context (never prop-drilled or cloned).
 * See docs/ARCHITECTURE.md §2.
 *
 * It stacks three bands inside one card: a header (title + item count), a divided list
 * of line items (thumbnail + name + options + line price), and a totals breakdown
 * (subtotal / shipping / tax / discount → grand total). A promo-code band and a footer
 * (the "Checkout" CTA) are optional slots the consumer fills with the canonical
 * InputGroup / Button. Every price is `tabular-nums` so the column never jitters as the
 * cart changes. Compose the named parts (`OrderSummaryItem`, `OrderSummaryRow`,
 * `OrderSummaryTotal`, …) into a cart page, a checkout sidebar, or a mini-cart drawer.
 */
export const orderSummaryVariants = tv({
  slots: {
    // The card owns the frame; overflow-hidden clips the flush bands (and their dividers)
    // to the card's radius. Each band brings its own horizontal padding so their edges align.
    root: "flex flex-col text-sm",
    // Title band: title (+ optional description) left, an item-count Badge or edit link right.
    header: "flex items-center justify-between gap-3",
    title: "text-base font-semibold text-foreground",
    // The line-item list (<ul>): rows stacked with clear whitespace (the `items` gap) — no
    // dividers, no boxing. The house minimal style.
    items: "flex flex-col",
    item: "flex items-center gap-4",
    // Product tile: a concentric rounded-lg surface (the card is rounded-xl) with the DS
    // image-outline so a photo never floats edgeless. Transparent fill so a glyph blends into
    // the surface; an <img> rounds to the tile itself (`rounded-[inherit]`) rather than relying
    // on `overflow-hidden` — which would clip the count pill parked outside the corner. Holds an
    // <img>, a Phosphor glyph, or nothing (a bare outlined tile).
    thumbnail:
      "relative grid shrink-0 place-items-center rounded-lg text-muted-foreground ring-1 ring-inset ring-black/10 dark:ring-white/10 [&>img]:size-full [&>img]:rounded-[inherit] [&>img]:object-cover [&>svg]:size-5",
    // The qty pill parked on the tile's corner. The neutral inverse pair (bg-foreground /
    // text-background) reads on any theme; the ring-card cutout lifts it off the photo.
    count:
      "absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-semibold tabular-nums text-background ring-2 ring-card",
    // min-w-0 lets the name truncate instead of shoving the price off the row.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    name: "truncate font-medium text-foreground",
    options: "truncate text-xs text-muted-foreground",
    // Line total: rides the right edge, never wraps under the name.
    price: "shrink-0 pl-3 font-medium tabular-nums text-foreground",
    // Trailing controls for an editable line: the quantity stepper + the remove button. The
    // remove button itself is the canonical Button (variant="destructiveGhost"), not a slot.
    actions: "flex shrink-0 items-center gap-1",
    // Promo-code band: wraps a canonical InputGroup (field + Apply button).
    promo: "",
    // Totals band (<dl>): the subtotal/shipping/tax/discount rows + the grand total.
    totals: "flex flex-col",
    row: "flex items-center justify-between gap-4",
    rowLabel: "text-muted-foreground",
    rowValue: "tabular-nums text-foreground",
    // Grand total: heavier and set apart by extra whitespace (no divider).
    total: "flex items-center justify-between gap-4",
    totalLabel: "text-base font-semibold text-foreground",
    totalValue: "text-base font-semibold tabular-nums text-foreground",
    // CTA band: the "Checkout" Button + a trust note.
    footer: "flex flex-col gap-3",
  },
  variants: {
    variant: {
      // A bordered card wrapping the summary (a checkout sidebar). No internal dividers: bands
      // are set apart by whitespace, and the card insets them with padding (see compounds).
      card: {
        root: "rounded-xl border border-border bg-card text-card-foreground shadow-xs",
      },
      // Chrome-less: the summary sits flush on whatever surface holds it (a page column, a
      // Drawer, a checkout pane). Drops the count's ring-card cutout since there's no card.
      plain: {
        count: "ring-background",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). Here it governs the
    // whitespace between bands (`root` gap) and between line items (`items` gap), the extra
    // space that sets off the grand total, and the thumbnail size (the card's inset padding
    // lives in the compounds). `comfortable` is the roomy checkout default; `compact` a drawer.
    density: {
      comfortable: {
        root: "gap-6",
        items: "gap-5",
        totals: "gap-3",
        total: "mt-2",
        thumbnail: "size-14",
      },
      compact: {
        root: "gap-5",
        items: "gap-4",
        totals: "gap-2.5",
        total: "mt-1",
        thumbnail: "size-12",
      },
    },
    // Per-row accent for the totals, recomputed on {@link OrderSummaryRow}. `discount`
    // greens the value (a credit); `muted` softens it (a "Free" / "Calculated at checkout"
    // placeholder). Uses the -strong text token so it stays legible across all themes.
    tone: {
      default: {},
      discount: { rowValue: "text-success-strong" },
      muted: { rowValue: "text-muted-foreground" },
    },
  },
  compoundVariants: [
    // Only the card variant insets its content (it's a contained surface); the plain variant
    // sits flush and adds no padding. Whitespace between bands comes from `root` gap either way.
    { variant: "card", density: "comfortable", class: { root: "p-6" } },
    { variant: "card", density: "compact", class: { root: "p-5" } },
  ],
  defaultVariants: {
    variant: "card",
    density: "comfortable",
    tone: "default",
  },
})

type OrderSummarySlots = ReturnType<typeof orderSummaryVariants>
type OrderSummaryConfig = {
  variant: NonNullable<VariantProps<typeof orderSummaryVariants>["variant"]>
  density: Density
}

const [OrderSummaryProvider, useOrderSummaryContext] = createContext<{
  slots: OrderSummarySlots
  config: OrderSummaryConfig
}>("OrderSummary")

export interface OrderSummaryProps
  extends React.ComponentProps<"section">,
    Omit<VariantProps<typeof orderSummaryVariants>, "tone"> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `OrderSummary.Item` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary; only named exports do.
 * Compose as `<OrderSummary><OrderSummaryHeader>…`.
 */
export function OrderSummary({
  className,
  variant,
  density,
  asChild = false,
  ...props
}: OrderSummaryProps) {
  // Density resolves prop > provider > "comfortable"; the resolved config rides context so
  // each toned row can recompute its value class off the same variant + density.
  const config: OrderSummaryConfig = {
    variant: variant ?? "card",
    density: useDensity(density),
  }
  const slots = orderSummaryVariants(config)
  const Comp = asChild ? Slot.Root : "section"
  return (
    <OrderSummaryProvider slots={slots} config={config}>
      <Comp data-slot="order-summary" className={slots.root({ className })} {...props} />
    </OrderSummaryProvider>
  )
}

/** Title band: a heading on the left, an item-count Badge or "Edit" link on the right. */
export function OrderSummaryHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryHeader")
  return <div data-slot="order-summary-header" className={slots.header({ className })} {...props} />
}

/** The summary's title. A `<div>` by default; pass `asChild` to render a real heading. */
export function OrderSummaryTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const { slots } = useOrderSummaryContext("OrderSummaryTitle")
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="order-summary-title" className={slots.title({ className })} {...props} />
}

/** The line-item list. Wraps {@link OrderSummaryItem} rows in a semantic `<ul>`. */
export function OrderSummaryItems({ className, ...props }: React.ComponentProps<"ul">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItems")
  return <ul data-slot="order-summary-items" className={slots.items({ className })} {...props} />
}

export interface OrderSummaryItemProps extends React.ComponentProps<"li"> {
  /**
   * Play the row's exit animation (collapse + fade + drift) instead of vanishing. Set it when the
   * user removes the line, then wire `onAnimationEnd` (guarded to the row itself with
   * `e.target === e.currentTarget`) to drop the item from state once the roll finishes. Under
   * reduced-motion the exit is instant but still fires `animationend`, so the removal always completes.
   */
  leaving?: boolean
}

/** One cart line: a thumbnail, the name + options, and the line price. A `<li>` row. */
export function OrderSummaryItem({ className, leaving, ...props }: OrderSummaryItemProps) {
  const { slots } = useOrderSummaryContext("OrderSummaryItem")
  return (
    <li
      data-slot="order-summary-item"
      data-leaving={leaving || undefined}
      className={slots.item({ className: cn(leaving && "order-summary-item-leave", className) })}
      {...props}
    />
  )
}

export interface OrderSummaryItemThumbnailProps extends React.ComponentProps<"div"> {
  /** Quantity pill on the tile's corner. Omit for single-quantity lines. */
  count?: React.ReactNode
}

/** Product tile: holds an `<img>`, a Phosphor glyph, or nothing. Optional qty `count` pill. */
export function OrderSummaryItemThumbnail({
  className,
  count,
  children,
  ...props
}: OrderSummaryItemThumbnailProps) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemThumbnail")
  return (
    <div data-slot="order-summary-item-thumbnail" className={slots.thumbnail({ className })} {...props}>
      {children}
      {count != null && (
        <span data-slot="order-summary-item-count" className={slots.count()}>
          {count}
        </span>
      )}
    </div>
  )
}

/** Wraps the name + options; flexes to fill so the price rides the right edge. */
export function OrderSummaryItemContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemContent")
  return (
    <div data-slot="order-summary-item-content" className={slots.content({ className })} {...props} />
  )
}

/** The product name. Truncates rather than pushing the price off the row. */
export function OrderSummaryItemName({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemName")
  return <div data-slot="order-summary-item-name" className={slots.name({ className })} {...props} />
}

/** The muted variant/options line under the name (e.g. "Size M · Oat · Qty 2"). */
export function OrderSummaryItemOptions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemOptions")
  return (
    <div data-slot="order-summary-item-options" className={slots.options({ className })} {...props} />
  )
}

/** The line total. `tabular-nums`, right-aligned, never wraps under the name. */
export function OrderSummaryItemPrice({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemPrice")
  return <div data-slot="order-summary-item-price" className={slots.price({ className })} {...props} />
}

/** Trailing controls for an editable line: holds the quantity stepper and the remove button. */
export function OrderSummaryItemActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryItemActions")
  return (
    <div data-slot="order-summary-item-actions" className={slots.actions({ className })} {...props} />
  )
}

export interface OrderSummaryItemQuantityProps {
  /** Controlled quantity. Pair with `onValueChange`. */
  value?: number | null
  /** Initial quantity when uncontrolled. */
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  /** Lowest allowed quantity. @default 1 */
  min?: number
  max?: number
  "aria-label"?: string
  /** Class for the stepper shell (e.g. to retune its width). */
  className?: string
}

/** The quantity stepper: the canonical NumberInput in its compact inline (− value +) form. */
export function OrderSummaryItemQuantity({
  min = 1,
  "aria-label": ariaLabel = "Quantity",
  className,
  ...props
}: OrderSummaryItemQuantityProps) {
  return (
    <NumberInput
      layout="inline"
      size="sm"
      min={min}
      aria-label={ariaLabel}
      rootClassName={cn("w-24", className)}
      {...props}
    />
  )
}

/**
 * Remove-line button: the canonical Button in its quiet-destructive icon form
 * (`variant="destructiveGhost"`, `iconOnly`) - a red-tinted trash that washes soft red on hover.
 * Composing Button (not a hand-styled slot) keeps the press scale, >=40px hit target, focus ring,
 * dev a11y warning, and hover tooltip in lockstep with the rest of the library. Wire `onClick` to
 * drop the item from your cart.
 */
export function OrderSummaryItemRemove({
  className,
  "aria-label": ariaLabel = "Remove item",
  ...props
}: React.ComponentProps<"button">) {
  const { config } = useOrderSummaryContext("OrderSummaryItemRemove")
  return (
    <Button
      type="button"
      variant="destructiveGhost"
      iconOnly
      // Size tracks the summary's density (comfortable -> md 36px, compact -> sm 32px); no explicit
      // `size`, so Button derives it. The sm square carries Button's own >=40px hit-area extender.
      density={config.density}
      data-slot="order-summary-item-remove"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      <Trash weight="bold" aria-hidden />
    </Button>
  )
}

/** Promo band: a divided slot for a canonical InputGroup (field + Apply button). */
export function OrderSummaryPromo({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryPromo")
  return <div data-slot="order-summary-promo" className={slots.promo({ className })} {...props} />
}

/** The totals band. Wraps {@link OrderSummaryRow} + {@link OrderSummaryTotal} in a `<dl>`. */
export function OrderSummaryTotals({ className, ...props }: React.ComponentProps<"dl">) {
  const { slots } = useOrderSummaryContext("OrderSummaryTotals")
  return <dl data-slot="order-summary-totals" className={slots.totals({ className })} {...props} />
}

export interface OrderSummaryRowProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The row label (`<dt>`), e.g. "Subtotal", "Shipping", "Estimated tax". */
  label: React.ReactNode
  /** The value (`<dd>`), e.g. a price. Rendered `tabular-nums`. */
  children: React.ReactNode
  /** Accent the value: `discount` greens it, `muted` softens it. @default "default" */
  tone?: NonNullable<VariantProps<typeof orderSummaryVariants>["tone"]>
}

/** One subtotal/shipping/tax/discount line: a `<dt>` label + a `<dd>` value pair. */
export function OrderSummaryRow({
  className,
  label,
  children,
  tone = "default",
  ...props
}: OrderSummaryRowProps) {
  const { slots, config } = useOrderSummaryContext("OrderSummaryRow")
  // Recompute against the shared config so the toned value stays in lockstep with the
  // recipe (the same per-row recompute ListItem does for `interactive`).
  const toned = orderSummaryVariants({ ...config, tone })
  return (
    <div data-slot="order-summary-row" className={slots.row({ className })} {...props}>
      <dt className={slots.rowLabel()}>{label}</dt>
      <dd className={toned.rowValue()}>{children}</dd>
    </div>
  )
}

export interface OrderSummaryTotalProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The total label (`<dt>`), e.g. "Total" or "Total due". */
  label: React.ReactNode
  /** The grand total (`<dd>`). Rendered `tabular-nums`. */
  children: React.ReactNode
}

/** The grand total: the emphasized final `<dt>`/`<dd>` pair, lifted by its own hairline. */
export function OrderSummaryTotal({
  className,
  label,
  children,
  ...props
}: OrderSummaryTotalProps) {
  const { slots } = useOrderSummaryContext("OrderSummaryTotal")
  return (
    <div data-slot="order-summary-total" className={slots.total({ className })} {...props}>
      <dt className={slots.totalLabel()}>{label}</dt>
      <dd className={slots.totalValue()}>{children}</dd>
    </div>
  )
}

/** CTA band: the "Checkout" Button plus a trust note. A divided slot the consumer fills. */
export function OrderSummaryFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useOrderSummaryContext("OrderSummaryFooter")
  return <div data-slot="order-summary-footer" className={slots.footer({ className })} {...props} />
}
