"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * DescriptionList: the Data Display key/value detail view. A multi-part component
 * built like Card: one `tv` recipe with `slots`, shared variants flowing to every part
 * through React Context (never prop-drilled or cloned). Renders a semantic
 * `<dl>` → `<div>` group → `<dt>`/`<dd>` tree, so it reads as a real description list
 * to assistive tech. Compose the parts (`DescriptionListItem`, `DescriptionTerm`,
 * `DescriptionDetails`) to assemble a record/detail panel (profile, invoice, settings
 * read-out). See docs/ARCHITECTURE.md §2.
 */
export const descriptionListVariants = tv({
  slots: {
    root: "text-sm",
    // Each item is its own grid so `row` can place term + details side by side while
    // `stack` keeps the natural block flow. Wrapping <dt>/<dd> in a <div> is valid
    // HTML5 and lets us own the per-pair layout.
    item: "grid gap-1",
    // Term is the muted side; its leading icon is optically softened a touch so the
    // label stays the focus, and sized to the cap height of the text.
    term: "flex items-center gap-1.5 font-medium text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground/70",
    // min-w-0 lets long values (URLs, tokens) wrap/truncate inside the grid track. tabular-nums
    // because values stack into a column (amounts, dates, IDs on an invoice/record read-out).
    details: "min-w-0 text-pretty tabular-nums text-foreground",
  },
  variants: {
    layout: {
      // Term in a fixed-ish column, details filling the rest: the classic detail
      // panel. Stacks on mobile, splits at `sm`. The column width is a CSS variable
      // (`--dl-term`, default 12rem) so a consumer can retune it per instance without
      // fighting the recipe. Baseline-aligned so the term sits on the value's first line.
      row: {
        item: "sm:grid-cols-[var(--dl-term,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-4",
      },
      // Term above details: better for narrow surfaces and long values.
      stack: {},
    },
    // Hairline rule between rows for a scannable, table-like read. The padding lives on
    // the item so the rule sits centered in the gutter; the last row drops its border.
    divided: {
      true: { item: "border-b border-border last:border-b-0" },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For a
    // DescriptionList it governs the per-row vertical padding. `compact` is the
    // dashboard default; `comfortable` gives a roomier marketing read.
    density: {
      compact: { item: "py-2" },
      comfortable: { item: "py-3" },
    },
  },
  defaultVariants: {
    layout: "row",
    divided: false,
    density: "compact",
  },
})

type DescriptionListSlots = ReturnType<typeof descriptionListVariants>
const [DescriptionListProvider, useDescriptionListContext] = createContext<{
  slots: DescriptionListSlots
}>("DescriptionList")

export interface DescriptionListProps
  extends React.ComponentProps<"dl">,
    VariantProps<typeof descriptionListVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `DescriptionList.Item` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary; only named exports
 * do. Compose as `<DescriptionList><DescriptionListItem>…`.
 */
export function DescriptionList({
  className,
  layout,
  divided,
  density,
  asChild = false,
  ...props
}: DescriptionListProps) {
  // Density resolves prop > provider > "compact"; compute the slots once, every part
  // reads them from context.
  const slots = descriptionListVariants({
    layout,
    divided,
    density: useDensity(density),
  })
  const Comp = asChild ? Slot.Root : "dl"
  return (
    <DescriptionListProvider slots={slots}>
      <Comp data-slot="description-list" className={slots.root({ className })} {...props} />
    </DescriptionListProvider>
  )
}

export interface DescriptionListItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean
}

/** A single term/details pair. A `<div>` grouping inside the `<dl>` (valid HTML5). */
export function DescriptionListItem({
  className,
  asChild = false,
  ...props
}: DescriptionListItemProps) {
  const { slots } = useDescriptionListContext("DescriptionListItem")
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp data-slot="description-list-item" className={slots.item({ className })} {...props} />
  )
}

/** The label side (`<dt>`). Accepts a leading Phosphor icon. */
export function DescriptionTerm({ className, ...props }: React.ComponentProps<"dt">) {
  const { slots } = useDescriptionListContext("DescriptionTerm")
  return <dt data-slot="description-term" className={slots.term({ className })} {...props} />
}

/** The value side (`<dd>`). Holds plain text or composed parts (Badge, Avatar, links). */
export function DescriptionDetails({ className, ...props }: React.ComponentProps<"dd">) {
  const { slots } = useDescriptionListContext("DescriptionDetails")
  return (
    <dd data-slot="description-details" className={slots.details({ className })} {...props} />
  )
}
