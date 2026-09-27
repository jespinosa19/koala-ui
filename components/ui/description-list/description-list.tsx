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
    //
    // Baseline, with the icon centred on its own: a flex box takes its baseline from its first
    // item, and an svg has none, so under `items-center` the term's "baseline" was the icon's
    // bottom edge and a row layout sat the value ~3px low. With `items-baseline` the text is the
    // only item taking part in baseline alignment, so the term's baseline is the text's; the icon
    // opts out with `self-center` and lands exactly where `items-center` put it.
    term: "flex items-baseline gap-1.5 font-medium text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:self-center [&>svg]:text-muted-foreground/70",
    // min-w-0 lets long values (URLs, tokens) wrap/truncate inside the grid track. tabular-nums
    // because values stack into a column (amounts, dates, IDs on an invoice/record read-out).
    //
    // A value that holds a picture (an Avatar, a Flag, a logo or icon svg, an img), a Badge or a
    // Select trigger keeps the row on the TEXT baseline. The value stays in inline flow, never a
    // flex row: a flex box takes its baseline from its first item, so a leading picture handed the
    // row its bottom edge (an avatar row sat ~7px low) and a dot Badge its dot. In inline flow the
    // line's baseline is the text's (the strut's, even when the value is only a badge or a select),
    // and each of those children sits on it with `vertical-align: middle`. Middle is the x-height's
    // centre, ~0.12em under the centre of a capitalised name, so the pictures and the trigger rise
    // that much to meet the text's optical middle (measured: 0 to 0.5px off at 14px). A Badge is
    // text itself and stays put, its label on the term's baseline. svg and img are block in the
    // preflight, so they go inline-block; the trigger goes inline-flex (its width classes still
    // apply). A LEADING picture keeps 8px from what follows, the gap a consumer used to reach for
    // `flex gap-2` for (CSS can't see the text after it, so it keys on first-child).
    //
    // All of it stands down when a consumer made the value a flex or grid box themselves (the old
    // `flex gap-2` / `self-center` workaround): that value lays its own children out, and the
    // margin and nudge would only double its gap and lift its picture.
    details: [
      "min-w-0 text-pretty tabular-nums text-foreground",
      "[&:not(.flex,.inline-flex,.grid)>:is([data-slot=avatar],[data-slot=flag],[data-slot=badge],[data-slot=select-trigger],img,svg)]:align-middle",
      "[&:not(.flex,.inline-flex,.grid)>:is([data-slot=avatar],[data-slot=flag],[data-slot=select-trigger],img,svg)]:relative [&:not(.flex,.inline-flex,.grid)>:is([data-slot=avatar],[data-slot=flag],[data-slot=select-trigger],img,svg)]:-top-[0.125em]",
      "[&:not(.flex,.inline-flex,.grid)>:is(img,svg)]:inline-block [&:not(.flex,.inline-flex,.grid)>[data-slot=select-trigger]]:inline-flex",
      "[&:not(.flex,.inline-flex,.grid)>:is([data-slot=avatar],[data-slot=flag],img,svg):first-child]:mr-2",
    ],
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
      // Row when the CONTAINER has room, stacked when it doesn't: the split follows the list's own
      // width, not the viewport, so a narrow card on a wide screen stacks and a phone drawer with a
      // short term keeps its rows. It is the "sidebar" wrap, no container query: the term asks for
      // `--dl-term` (12rem), the value for `--dl-value` (10rem), and when both don't fit on one
      // line the value wraps under the term and takes the full width. So the switch point moves
      // with the term column instead of a fixed breakpoint, and nothing is size-contained (a
      // container query would stop the list sizing from its content). The value grows 999x the
      // term, so on a shared line the term keeps its column and the value takes the rest.
      auto: {
        item: "flex flex-wrap items-baseline gap-x-4 gap-y-1",
        term: "grow basis-[var(--dl-term,12rem)]",
        details: "grow-[999] basis-[var(--dl-value,10rem)]",
      },
      // Pairs flow along a line and wrap, each term straight before its value: a stat strip
      // ("Fine $150  Points 2") under a heading or inside a row. No per-pair padding and no rule
      // (see the compounds), the gaps between pairs do the separating.
      inline: {
        root: "flex flex-wrap items-baseline gap-x-5 gap-y-2",
        item: "flex items-baseline gap-1.5",
      },
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
  compoundVariants: [
    // An inline strip is one line of pairs: density's row padding and the hairline rule both
    // belong to stacked rows, so neither applies here.
    { layout: "inline", class: { item: "border-b-0 py-0" } },
  ],
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
