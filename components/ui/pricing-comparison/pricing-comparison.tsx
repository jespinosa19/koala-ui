"use client"

import * as React from "react"
import { Check, Info, Minus } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { Tooltip } from "@/components/ui/tooltip"

/**
 * PricingComparison: the canonical feature-by-feature pricing matrix, the companion to the
 * card-based `Pricing` table (own folder/nav/registry/docs, the way `BadgeGroup` sits next to
 * `Badge`). Where `Pricing` is a row of self-contained plan cards, this is a `<table>`:
 * rows are features, columns are plans, and each cell is a check, a minus, or a value like
 * "100 GB". Multi-part like `Pricing`: one `tv` recipe with `slots` shared through a typed
 * React Context. See docs/ARCHITECTURE.md §2.
 *
 * Assemble it as a `PricingComparisonHeader` of `PricingComparisonPlan`s, then one or more
 * `PricingComparisonSection`s of `PricingComparisonRow`s, each holding one
 * `PricingComparisonCell` per plan. The recommended plan is highlighted as a tinted column:
 * set `featured` (the 0-based plan index) on the root, the single source of truth, and the
 * header cap + body tint follow.
 *
 * polish applied:
 *   #1  - concentric radius: rounded-2xl shell over rounded-t-xl featured cap over rounded-md CTA.
 *   #4  - row hover + featured tint are interruptible CSS transitions on named properties.
 *   #9  - tabular-nums on prices and numeric cells so columns align and never reflow.
 *   #16 - the info-hint glyph gets a 36px pseudo hit area that stays inside the row padding.
 */
export const pricingComparisonVariants = tv({
  slots: {
    // The shell: a single bordered surface. `overflow-hidden` clips the featured frame to the
    // rounded corners; `overflow-x-auto` lets the matrix scroll sideways on narrow screens.
    root: "w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs",
    scroll: "w-full overflow-x-auto",
    // Positioned offset-parent that holds the table plus the two featured-column overlays, so
    // they share one coordinate space and scroll together horizontally.
    viewport: "relative w-full",
    // `relative z-10` lifts the table above the tint overlay; the frame overlay sits above it.
    table: "relative z-10 w-full border-collapse text-left text-sm",
    // The featured column, drawn as one continuous element each, measured in JS (see
    // useFeaturedColumn). `tint` sits behind the cells (z-0); `frame` rides on top (z-20) so the
    // brand outline is never broken by a row rule or a full-width section band. Hidden until the
    // first measure so neither paints at the origin.
    tint: "pointer-events-none absolute left-0 top-0 z-0 rounded-xl bg-brand/[0.05] transition-opacity duration-base ease-out",
    frame: "pointer-events-none absolute left-0 top-0 z-20 rounded-xl border border-brand brand-ring transition-opacity duration-base ease-out",

    // Header. Sticky so the plans stay in view while you scan a long feature list; the opaque
    // `bg-card` keeps scrolled rows from bleeding through.
    head: "",
    headRow: "",
    // Top-left corner cell: empty by default, or a small caption via the Header `label` prop.
    lead: "sticky top-0 z-10 bg-card p-5 align-bottom",
    // One plan column header: name, price, optional badge, and a CTA pinned to the bottom so
    // buttons line up across columns regardless of name length.
    plan: "relative sticky top-0 z-10 bg-card p-5 align-bottom",
    // `relative z-10` lifts the plan content above the featured column's tint overlay.
    planInner: "relative z-10 flex flex-col items-start gap-3",
    planMeta: "flex flex-col gap-1",
    planName: "text-sm font-semibold text-foreground text-balance",
    planPrice: "flex flex-wrap items-baseline gap-x-1 gap-y-0.5",
    planAmount: "text-2xl font-semibold tracking-tight tabular-nums text-foreground",
    planPeriod: "text-xs font-medium text-muted-foreground",
    planAction: "w-full pt-1 [&>*]:w-full",

    // Section band: a quiet uppercase label that groups related rows.
    sectionRow: "",
    sectionTitle: "bg-muted/40 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",

    // Feature row. A hairline top rule plus a hover wash makes long lists scannable.
    row: "border-t border-border transition-colors duration-fast ease-out hover:bg-muted/30",
    rowHeader: "px-5 py-3.5 text-left align-middle font-medium text-foreground",
    rowHeaderInner: "flex items-center gap-1.5",
    // Trailing info affordance, identical in feel to PricingFeature's hint.
    hint: [
      "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/50",
      "transition-colors duration-fast ease-out hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      "[&>svg]:size-4",
      "before:absolute before:left-1/2 before:top-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
    ],

    // Value cell. Centered, tabular so digit values line up down the column.
    cell: "px-5 py-3.5 text-center align-middle tabular-nums text-muted-foreground",
    cellIcon: "inline-flex size-5 items-center justify-center [&>svg]:size-5",
  },
  // A booleanless recipe: `featured` highlighting is applied per-cell from the root index
  // (positional, see below), not as a variant axis, so there are no variants to declare.
  variants: {},
})

type PricingComparisonSlots = ReturnType<typeof pricingComparisonVariants>

const [PricingComparisonProvider, usePricingComparisonContext] = createContext<{
  slots: PricingComparisonSlots
  /** 0-based index of the highlighted plan column, or `null` for none. */
  featured: number | null
}>("PricingComparison")

// The featured overlay (frame + tint) is inset from the shell on every side by this many pixels,
// so the brand ring floats inside the `rounded-2xl` (24px) shell instead of colliding with its
// edge. 4px is also the concentric gap: 24px shell − 4px = the frame's own `rounded-xl` (20px),
// so the two radii nest cleanly. Kept in sync with the header tint's `after:inset-x-1`/`top-1`
// (both 4px) below.
const FEATURED_INSET = 4

// The featured plan's header cell. The continuous brand outline + body tint are drawn by the
// measured overlays (frame/tint); the header is opaque (sticky `bg-card`), so the tint overlay
// behind it would be hidden. It carries its own matching tint via an `after` overlay, inset 4px on
// the sides and top to sit under the frame (bottom flush, so it meets the body tint at the
// header/body seam), with a concentric rounded top that lines up under the frame's rounded corner.
// `pt-7` (over the base `p-5`) gives the name/badge headroom below that rounded top corner so it
// never crowds the ceiling; the cells are `align-bottom`, so the extra height only lifts this
// column's top and leaves the CTAs aligned across every plan.
const FEATURED_PLAN = "pt-7 after:pointer-events-none after:absolute after:inset-x-1 after:top-1 after:bottom-0 after:rounded-t-xl after:bg-brand/[0.05] after:content-['']"

/**
 * Measures the highlighted plan column and returns the box for the `tint`/`frame` overlays:
 * the featured header cell gives the column's left + width, the table its full height. Like the
 * Tabs indicator, it re-measures on resize and on row height changes (fonts, content) via a
 * `ResizeObserver`, never polls, and gates `ready` so the overlays never paint at the origin.
 * Drawing the highlight as one element per layer (not per-cell borders) is what keeps the brand
 * outline unbroken across row rules and full-width section bands.
 */
function useFeaturedColumn(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  featured: number | null,
) {
  const [style, setStyle] = React.useState<React.CSSProperties>()
  const [ready, setReady] = React.useState(false)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || featured == null) {
      setReady(false)
      return
    }

    const measure = () => {
      const cell = viewport.querySelector<HTMLElement>(
        '[data-slot="pricing-comparison-plan"][data-featured]',
      )
      const table = viewport.querySelector<HTMLTableElement>("table")
      if (!cell || !table) {
        setReady(false)
        return
      }
      // Inset by FEATURED_INSET on every side so the ring floats off the shell edge (and nests
      // concentrically inside it), rather than running flush against it.
      setStyle({
        transform: `translateX(${cell.offsetLeft + FEATURED_INSET}px)`,
        top: FEATURED_INSET,
        width: cell.offsetWidth - FEATURED_INSET * 2,
        height: table.offsetHeight - FEATURED_INSET * 2,
      })
      setReady(true)
    }

    measure()

    // Width/position and total height can change without a prop change (resize, late fonts).
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    const table = viewport.querySelector("table")
    if (table) for (const row of table.querySelectorAll("tr")) ro.observe(row)

    return () => ro.disconnect()
  }, [viewportRef, featured])

  return { style, ready }
}

export interface PricingComparisonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof pricingComparisonVariants> {
  /**
   * 0-based index of the plan column to highlight (the recommended plan), or omit for none.
   * The single source of truth: the header cap and the body column tint both derive from it,
   * so callers never mark `featured` in two places.
   */
  featured?: number
}

/**
 * The matrix root: a horizontally-scrollable `<table>`. Parts are exported individually (not
 * `PricingComparison.Plan` dot-notation): namespaced statics don't survive the RSC
 * server→client boundary. Compose as `<PricingComparison><PricingComparisonHeader>…`.
 */
export function PricingComparison({ className, featured, children, ...props }: PricingComparisonProps) {
  const slots = pricingComparisonVariants()
  const ft = featured ?? null
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const { style, ready } = useFeaturedColumn(viewportRef, ft)
  return (
    <PricingComparisonProvider slots={slots} featured={ft}>
      <div data-slot="pricing-comparison" className={slots.root({ className })} {...props}>
        <div className={slots.scroll()}>
          <div ref={viewportRef} className={slots.viewport()}>
            {ft != null && (
              <>
                <span aria-hidden style={style} className={cn(slots.tint(), ready ? "opacity-100" : "opacity-0")} />
                <span aria-hidden style={style} className={cn(slots.frame(), ready ? "opacity-100" : "opacity-0")} />
              </>
            )}
            <table data-slot="pricing-comparison-table" className={slots.table()}>
              {children}
            </table>
          </div>
        </div>
      </div>
    </PricingComparisonProvider>
  )
}

export interface PricingComparisonHeaderProps extends React.ComponentProps<"thead"> {
  /** Optional caption rendered in the empty top-left corner cell (e.g. "Compare plans"). */
  label?: React.ReactNode
}

/**
 * The plan-header row (`<thead>`). Renders the empty leading corner itself, then its
 * `PricingComparisonPlan` children. Each plan is tagged with its column index here (a shallow,
 * single-level map: positional data the children can't read from Context), so the one
 * `featured` index on the root drives the highlight without the caller repeating it.
 */
export function PricingComparisonHeader({ label, className, children, ...props }: PricingComparisonHeaderProps) {
  const { slots } = usePricingComparisonContext("PricingComparisonHeader")
  return (
    <thead data-slot="pricing-comparison-header" className={slots.head({ className })} {...props}>
      <tr className={slots.headRow()}>
        <th scope="col" className={slots.lead()}>
          {label ? <span className="text-xs font-medium text-muted-foreground">{label}</span> : <span className="sr-only">Feature</span>}
        </th>
        {React.Children.map(children, (child, index) =>
          React.isValidElement<PricingComparisonPlanProps>(child)
            ? React.cloneElement(child, { __index: index })
            : child,
        )}
      </tr>
    </thead>
  )
}

export interface PricingComparisonPlanProps extends Omit<React.ComponentProps<"th">, "children"> {
  name: React.ReactNode
  /** The headline price (`tabular-nums`), e.g. "$29" or "Custom". */
  price?: React.ReactNode
  /** The muted suffix after the price, e.g. "/mo". */
  period?: React.ReactNode
  /** A small chip beside the name (e.g. a "Most popular" `Badge`). */
  badge?: React.ReactNode
  /** The CTA, stretched full-width and pinned to the bottom of the cell (drop a Koala `Button`). */
  children?: React.ReactNode
  /** Injected by `PricingComparisonHeader`: this plan's column index. Not part of the public API. */
  __index?: number
}

/** One plan column header. */
export function PricingComparisonPlan({
  name,
  price,
  period,
  badge,
  className,
  children,
  __index,
  ...props
}: PricingComparisonPlanProps) {
  const { slots, featured } = usePricingComparisonContext("PricingComparisonPlan")
  const isFeatured = __index != null && __index === featured
  return (
    <th
      scope="col"
      data-slot="pricing-comparison-plan"
      data-featured={isFeatured || undefined}
      className={slots.plan({ className: cn(isFeatured && FEATURED_PLAN, className) })}
      {...props}
    >
      <div className={slots.planInner()}>
        <div className={slots.planMeta()}>
          <div className="flex items-center gap-2">
            <span className={slots.planName()}>{name}</span>
            {badge}
          </div>
          {price != null && (
            <div className={slots.planPrice()}>
              <span className={slots.planAmount()}>{price}</span>
              {period != null && <span className={slots.planPeriod()}>{period}</span>}
            </div>
          )}
        </div>
        {children && <div className={slots.planAction()}>{children}</div>}
      </div>
    </th>
  )
}

export interface PricingComparisonSectionProps extends Omit<React.ComponentProps<"tbody">, "title"> {
  /** The group label rendered as a full-width band above the rows. */
  title?: React.ReactNode
}

/**
 * A labelled group of rows (`<tbody>`). The title spans the full width via an over-large
 * `colSpan` (browsers clamp it to the real column count), so the section never needs to know
 * how many plans there are.
 */
export function PricingComparisonSection({ title, className, children, ...props }: PricingComparisonSectionProps) {
  const { slots } = usePricingComparisonContext("PricingComparisonSection")
  return (
    <tbody data-slot="pricing-comparison-section" className={className} {...props}>
      {title != null && (
        <tr className={slots.sectionRow()}>
          <th scope="colgroup" colSpan={999} className={slots.sectionTitle()}>
            {title}
          </th>
        </tr>
      )}
      {children}
    </tbody>
  )
}

export interface PricingComparisonRowProps extends React.ComponentProps<"tr"> {
  /** The feature name, rendered as the row's leading header cell. */
  label: React.ReactNode
  /** Optional extra detail revealed in a tooltip via a trailing info glyph (hover/focus). */
  hint?: React.ReactNode
  /** Accessible label for the info trigger when `hint` is set. Defaults to "More information". */
  hintLabel?: string
}

/**
 * One feature row (`<tr>`). Renders its own leading `<th scope="row">` (the feature name plus
 * an optional `hint`), then its `PricingComparisonCell` children in plan order. The featured
 * column is painted by the root's overlays, so the cells stay plain.
 */
export function PricingComparisonRow({
  label,
  hint,
  hintLabel = "More information",
  className,
  children,
  ...props
}: PricingComparisonRowProps) {
  const { slots } = usePricingComparisonContext("PricingComparisonRow")
  return (
    <tr data-slot="pricing-comparison-row" className={slots.row({ className })} {...props}>
      <th scope="row" className={slots.rowHeader()}>
        <span className={slots.rowHeaderInner()}>
          <span>{label}</span>
          {hint != null && (
            <Tooltip content={hint}>
              <button type="button" aria-label={hintLabel} className={slots.hint()}>
                <Info weight="bold" />
              </button>
            </Tooltip>
          )}
        </span>
      </th>
      {children}
    </tr>
  )
}

export interface PricingComparisonCellProps extends React.ComponentProps<"td"> {
  /**
   * Whether this plan includes the feature. With no `children`, `true` (default) renders a
   * success check and `false` a muted minus. Ignored when you pass a value as `children`.
   */
  included?: boolean
  /** A value instead of a check/minus, e.g. "100 GB" or "Unlimited". */
  children?: React.ReactNode
}

/** One plan's value for a feature: a check/minus glyph, or any value passed as children. */
export function PricingComparisonCell({
  included = true,
  className,
  children,
  ...props
}: PricingComparisonCellProps) {
  const { slots } = usePricingComparisonContext("PricingComparisonCell")
  return (
    <td
      data-slot="pricing-comparison-cell"
      className={slots.cell({ className })}
      {...props}
    >
      {children != null ? (
        children
      ) : (
        <span
          aria-hidden
          className={slots.cellIcon({ className: included ? "text-success" : "text-muted-foreground/40" })}
        >
          {included ? <Check weight="bold" /> : <Minus weight="bold" />}
        </span>
      )}
      {children == null && <span className="sr-only">{included ? "Included" : "Not included"}</span>}
    </td>
  )
}
