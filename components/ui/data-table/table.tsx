"use client"

import * as React from "react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Table: the styling layer over TanStack Table. Koala keeps the two concerns split the way
 * the references do: TanStack owns the *behavior* (sorting, grouping, selection, pinning) in
 * `data-table.tsx`; these primitives own the *look*. They are plain styled `<table>` elements
 * usable on their own for static tables, and the render target the `DataTable` wires
 * TanStack into.
 *
 * Pattern: one `tv` recipe with `slots`, the resolved slots flowing to every part through
 * React Context (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * `border-separate` (not `border-collapse`) is deliberate: collapsed borders drop out from
 * under sticky headers/columns while scrolling, so dividers live on the cells themselves.
 * Rows carry a concrete surface color so a pinned `bg-inherit` cell tracks its row's stripe,
 * hover, and selected states instead of going transparent over the scrolling content. That
 * surface is the `--table-surface` variable, set once on the root by the `variant` knob, so
 * every opaque mix below (rows, stripe, hover, footer, sticky header/column) rebases together:
 * the chromeless default tracks the container's `--surface` (Dialog → popover, Layout → card),
 * falling back to `--background` on a plain page; `--card` for the opt-in bordered `container`.
 */
export const tableVariants = tv({
  slots: {
    root: "relative w-full overflow-auto",
    table: "w-full border-separate border-spacing-0 text-sm",
    header: "",
    // Last body row drops its divider so it never doubles up with the container's border (or,
    // in `minimal`, so the table closes on the content rather than a dangling rule).
    body: "[&>tr:last-child>td]:border-b-0",
    footer: "[&>tr>td]:border-t [&>tr>td]:border-b-0 [&>tr>td]:border-border bg-[color-mix(in_oklab,var(--muted)_50%,var(--table-surface))] font-medium",
    row: "bg-[var(--table-surface)] transition-colors duration-fast ease-out data-[state=selected]:bg-muted",
    // The `transition-[height,padding]` is what makes a density change *glide* instead of snap:
    // toggling `density` swaps the cell's height/padding classes, and these are the only two
    // properties that differ between the tiers, so the rows ease open/closed (make-interfaces #4:
    // an interruptible CSS transition, so rapid toggling reverses cleanly). Held instant under
    // reduced-motion. Kept off the `row` (a `<tr>` has no height/padding of its own; the cells do).
    head: "px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap border-b border-border transition-[height,padding] duration-base ease-out motion-reduce:transition-none",
    cell: "px-3 align-middle whitespace-nowrap border-b border-border transition-[height,padding] duration-base ease-out motion-reduce:transition-none",
    caption: "mt-4 text-sm text-pretty text-muted-foreground",
  },
  variants: {
    // The surface treatment. `minimal` is the default: no border, radius, or fill, with the edge
    // cells pulled flush so the rows read as lined records and drop into whatever already frames
    // them. `container` is the opt-in: the bordered, rounded card for when the table stands on its
    // own. Both rebase every opaque surface via `--table-surface` so stripe/hover/sticky keep
    // working in either.
    variant: {
      minimal: {
        // Honors the `--surface` contract: a container that declares one (Dialog → popover,
        // Layout → card) gets a table that blends into it; on a plain page `--surface` is unset
        // so this falls back to `--background`, identical to before.
        root: "[--table-surface:var(--surface,var(--background))]",
        // Edge cells go flush with the table's bounds: without a container border to sit
        // inside, the leading/trailing padding would just read as a stray indent.
        table: "[&_tr>*:first-child]:pl-0 [&_tr>*:last-child]:pr-0",
      },
      container: {
        root: "rounded-xl border border-border bg-card text-card-foreground [--table-surface:var(--card)]",
      },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). For a table it is the
    // "condensed rows" knob: `compact` is the Koala default (dense, scannable); `comfortable`
    // is the roomier alternative for lower-density app screens.
    density: {
      comfortable: { head: "h-12 px-4", cell: "h-12 px-4 py-3" },
      compact: { head: "h-9 px-3", cell: "h-9 px-3 py-1.5" },
    },
    // Zebra striping. Scoped with `:not(:hover):not([data-state=selected])` so the stripe never
    // fights the hover or selected backgrounds; those stay deterministic regardless of cascade.
    // The tint is mixed into the table surface (not layered with alpha) so it stays fully opaque:
    // a pinned `bg-inherit` cell that takes it on must cover content scrolling under it, not bleed it.
    striped: {
      true: { body: "[&>tr:nth-child(even):not(:hover):not([data-state=selected])]:bg-[color-mix(in_oklab,var(--muted)_40%,var(--table-surface))]" },
      false: {},
    },
    // Row hover. Applied on the body so only data rows light up; header/footer rows never do.
    // Opaque (mixed into the table surface, not `/50` alpha) for the same pinned-column reason as `striped`.
    hoverable: {
      true: { body: "[&>tr:hover]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--table-surface))]" },
      false: {},
    },
    // Sticky header: header cells pin to the top of the scroll container. The consumer caps the
    // container height (e.g. `containerProps={{ className: "max-h-96" }}`) to create the scroll.
    stickyHeader: {
      true: { head: "sticky top-0 z-20 bg-[var(--table-surface)]" },
      false: {},
    },
  },
  defaultVariants: {
    variant: "minimal",
    density: "compact",
    striped: false,
    hoverable: true,
    stickyHeader: false,
  },
})

type TableSlots = ReturnType<typeof tableVariants>
const [TableProvider, useTableContext] = createContext<{ slots: TableSlots }>("Table")

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

type Align = keyof typeof alignClass

/** Pinned-cell classes. `head` cells pin solid (the table surface, above the header at z-30);
 *  body cells inherit their row's background so they track stripe/hover/selected. The divider
 *  sits on the inner edge so the pinned column reads as a fixed rail when the rest scrolls under
 *  it. The surface tracks the `variant` via `--table-surface`, so pins stay opaque in `minimal`. */
function stickyClass(sticky: "left" | "right" | undefined, surface: "head" | "cell") {
  if (!sticky) return undefined
  const z = surface === "head" ? "z-30 bg-[var(--table-surface)]" : "z-10 bg-inherit"
  return sticky === "left"
    ? cn("sticky left-0 border-r border-border", z)
    : cn("sticky right-0 border-l border-border", z)
}

export interface TableProps
  extends React.ComponentProps<"table">,
    VariantProps<typeof tableVariants> {
  /** Surface treatment: `minimal` (no border/radius/fill, edge cells flush, lined records on the
   *  page; the default) or `container` (the bordered, rounded card). @default "minimal" */
  variant?: "minimal" | "container"
  /** Props for the scroll container that wraps the table, e.g. a `max-h-*` for sticky-header scroll. */
  containerProps?: React.ComponentProps<"div">
}

/**
 * Parts are exported individually (not `Table.Row` dot-notation) because namespaced statics
 * don't survive the RSC server→client boundary; only named exports do. Compose as
 * `<Table><TableHeader><TableRow><TableHead>…`.
 */
export function Table({
  className,
  variant,
  density,
  striped,
  hoverable,
  stickyHeader,
  containerProps,
  ...props
}: TableProps) {
  // Density resolves prop > provider > "compact"; compute the slots once, every part reads them.
  const slots = tableVariants({
    variant,
    density: useDensity(density),
    striped,
    hoverable,
    stickyHeader,
  })
  const { className: containerClassName, ...restContainer } = containerProps ?? {}
  return (
    <TableProvider slots={slots}>
      <div
        data-slot="table-container"
        className={slots.root({ className: containerClassName })}
        {...restContainer}
      >
        <table data-slot="table" className={slots.table({ className })} {...props} />
      </div>
    </TableProvider>
  )
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const { slots } = useTableContext("TableHeader")
  return <thead data-slot="table-header" className={slots.header({ className })} {...props} />
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const { slots } = useTableContext("TableBody")
  return <tbody data-slot="table-body" className={slots.body({ className })} {...props} />
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  const { slots } = useTableContext("TableFooter")
  return <tfoot data-slot="table-footer" className={slots.footer({ className })} {...props} />
}

export interface TableRowProps extends React.ComponentProps<"tr"> {
  /** Highlight the row as selected; stamps `data-state="selected"`. */
  selected?: boolean
}

export function TableRow({ className, selected, ...props }: TableRowProps) {
  const { slots } = useTableContext("TableRow")
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      className={slots.row({ className })}
      {...props}
    />
  )
}

export interface TableHeadProps extends React.ComponentProps<"th"> {
  /** Text alignment for the column. @default "left" */
  align?: Align
  /** Pin the column to the left or right edge while the rest scrolls horizontally. */
  sticky?: "left" | "right"
}

export function TableHead({ className, align, sticky, ...props }: TableHeadProps) {
  const { slots } = useTableContext("TableHead")
  return (
    <th
      data-slot="table-head"
      className={slots.head({
        className: cn(align && alignClass[align], stickyClass(sticky, "head"), className),
      })}
      {...props}
    />
  )
}

export interface TableCellProps extends React.ComponentProps<"td"> {
  /** Text alignment. @default "left" */
  align?: Align
  /** `tabular-nums` so columns of dynamic figures don't jitter (polish). */
  numeric?: boolean
  /** Pin the column to the left or right edge while the rest scrolls horizontally. */
  sticky?: "left" | "right"
}

export function TableCell({ className, align, numeric, sticky, ...props }: TableCellProps) {
  const { slots } = useTableContext("TableCell")
  return (
    <td
      data-slot="table-cell"
      className={slots.cell({
        className: cn(
          align && alignClass[align],
          numeric && "text-right tabular-nums",
          stickyClass(sticky, "cell"),
          className,
        ),
      })}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  const { slots } = useTableContext("TableCaption")
  return <caption data-slot="table-caption" className={slots.caption({ className })} {...props} />
}

/**
 * A two-line cell: primary label over muted supporting text (e.g. name over email). One of the
 * common "cell types" a data table reaches for; compose it inside a `<TableCell>`.
 */
export function TableCellText({
  primary,
  secondary,
  className,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="font-medium text-foreground">{primary}</span>
      {secondary != null && (
        <span className="text-xs text-muted-foreground">{secondary}</span>
      )}
    </div>
  )
}

/** Full-width empty state: a single cell spanning every column. Drop into `<TableBody>` when
 *  there are no rows. */
export function TableEmpty({
  colSpan,
  children = "No results.",
  className,
}: {
  colSpan: number
  children?: React.ReactNode
  className?: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn("h-24 text-center text-muted-foreground", className)}
      >
        {children}
      </TableCell>
    </TableRow>
  )
}
