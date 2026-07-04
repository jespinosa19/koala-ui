"use client"

import * as React from "react"
import { SlidersHorizontal, Rows, SquaresFour } from "@phosphor-icons/react"
import type { Column, Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

/** The two ways a DataTable can lay its rows out: a `rows` grid (the table) or a `cards` grid. */
export type DataTableLayout = "rows" | "cards"

/**
 * The display name a column shows in the view-options menu and as a card field label. Prefers an
 * explicit `meta.label`, falls back to a string `header`. Columns with neither (the selection
 * column, an icon-only actions column) return `undefined`; they're not user-toggleable and don't
 * caption a card field, so callers filter them out.
 */
export function columnLabel<TData>(column: Column<TData, unknown>): string | undefined {
  const meta = column.columnDef.meta
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  if (typeof header === "string" && header.trim() !== "") return header
  return undefined
}

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  /** Current layout. Pass with `onLayoutChange` to surface the Rows/Cards switch. */
  layout?: DataTableLayout
  onLayoutChange?: (layout: DataTableLayout) => void
  /** Show the Rows/Cards layout switch above the column toggles. @default false */
  enableLayout?: boolean
  /** Trigger button label (also its tooltip text via the menu trigger). @default "View options" */
  label?: string
}

/**
 * View options: a `SlidersHorizontal` dropdown that switches the table's layout (rows ⟷ cards)
 * and shows/hides columns. Built from the shared `DropdownMenu`: a radio group for the mutually
 * exclusive layout, checkbox items for the independent column toggles. `DataTable` renders this
 * for you when `viewOptions`/`enableCardLayout` is set; it's exported for hand-composed toolbars
 * over a table instance you own.
 */
export function DataTableViewOptions<TData>({
  table,
  layout = "rows",
  onLayoutChange,
  enableLayout = false,
  label = "View options",
}: DataTableViewOptionsProps<TData>) {
  // Only real, labelled columns are toggleable; the selection and icon-only action columns have
  // no label and aren't things a user hides.
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide() && columnLabel(column) !== undefined)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* `tooltip={false}`: a menu trigger owns its own open state, so it doesn't double up with
            the icon-button tooltip (same call the row-action trigger makes). */}
        <Button variant="outline" iconOnly aria-label={label} tooltip={false}>
          <SlidersHorizontal weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {enableLayout && (
          <>
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={layout}
              onValueChange={(value) => onLayoutChange?.(value as DataTableLayout)}
            >
              <DropdownMenuRadioItem value="rows">
                <Rows weight="bold" />
                Rows
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cards">
                <SquaresFour weight="bold" />
                Cards
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            // Keep the menu open so several columns can be toggled in one pass.
            onSelect={(event) => event.preventDefault()}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
