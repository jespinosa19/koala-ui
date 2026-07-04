"use client"

import * as React from "react"
import { X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * DataTableSelectionBar: the floating bulk-action pill that appears while rows are selected.
 * A presentational shell (count · clear · actions) styled as a centered, rounded bar that floats
 * over the bottom of the table region. `DataTable` mounts it for you when `enableRowSelection`
 * and `renderSelectionActions` are set; it's exported for hand-composed tables over a TanStack
 * instance you own.
 *
 * **Dark by default** (the Figma/Linear look): the pill scopes itself to the dark theme (`dark`
 * class), so it reads as an elevated black bar floating over the light table AND every Koala part
 * dropped inside — `Button`s, a `DropdownMenu` trigger, the divider — re-resolves its tokens
 * against the dark surface with no per-call-site styling. It stays dark in every theme, so the bar
 * is always the same distinct object over the content.
 *
 * It's an **absolute overlay**, so it must sit inside a `relative` container (the table region):
 * pinning it out of the document flow is what lets it appear and leave without ever reflowing the
 * page around it. It only occupies the pixels it paints, floating over the last rows.
 *
 * Pure layout: drop any `Button`s in as `children` (Export, Delete, …). The count is
 * `tabular-nums` so it doesn't jitter as the selection grows.
 */
export interface DataTableSelectionBarProps extends React.ComponentProps<"div"> {
  /** How many rows are selected, shown as "N selected". */
  count: number
  /** Clears the selection (the × button). */
  onClear: () => void
  /** Bulk-action controls, rendered after the divider. */
  children?: React.ReactNode
}

export function DataTableSelectionBar({
  count,
  onClear,
  children,
  className,
  ...props
}: DataTableSelectionBarProps) {
  return (
    <div
      data-slot="data-table-selection-bar"
      role="status"
      aria-live="polite"
      // An absolute overlay pinned to the bottom-centre of the (relative) table region: it floats
      // over the last rows without taking a layout slot, so showing or hiding it never reflows the
      // page. `pointer-events-none` lets clicks fall through the empty gutter; the pill re-enables
      // them.
      className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center"
      {...props}
    >
      <div
        className={cn(
          // `dark` re-scopes the tokens below (and every Koala part inside) to the dark theme, so
          // the pill is an elevated black bar in any theme. Token-pure: no raw hex.
          // A rounded rectangle, NOT a stadium: `rounded-lg` (12px controls nest concentrically,
          // 16 = 12 + 4). The hairline is an inset ring, not a `border`, so it doesn't push the
          // padding box in and break that 4px gap (see the Toolbar band). `p-1` gives the uniform
          // 4px gap the concentric corners need; `pl-4` just breathes the count text off the edge.
          "dark pointer-events-auto flex items-center gap-1.5 rounded-lg bg-popover py-1 pl-4 pr-1 text-sm text-popover-foreground shadow-lg ring-1 ring-inset ring-border",
          // Enter is transform + opacity only (no layout properties), so the rise never nudges the
          // rows it floats over. Runs once on mount; a changing count re-renders in place.
          "animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-95 duration-base ease-out",
          className,
        )}
      >
        <span className="whitespace-nowrap ps-0.5">
          <span className="font-semibold tabular-nums">{count}</span>{" "}
          <span className="text-muted-foreground">selected</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onClear}
          aria-label="Clear selection"
          className="size-7 text-muted-foreground"
        >
          <X weight="bold" />
        </Button>
        {children != null && (
          <>
            <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
            <div className="flex items-center gap-1">{children}</div>
          </>
        )}
      </div>
    </div>
  )
}
