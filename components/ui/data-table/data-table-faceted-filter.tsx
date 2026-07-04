"use client"

import * as React from "react"
import { Check, FunnelSimple, X } from "@phosphor-icons/react"
import type { Column, Table } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

/** One choice in a faceted filter: a value with a display label and an optional leading icon. */
export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ReactNode
}

/**
 * A column the table can filter by, paired with the choices to offer. `DataTable` takes an array
 * of these as its `filters` prop and renders a `DataTableFacetedFilter` per field in the toolbar,
 * plus the active-filter chips below it. The column must use `filterFn: "arrIncludesSome"` (the
 * built-in TanStack filter for the array value these write).
 */
export interface DataTableFilterField {
  /** The column's id (or `accessorKey`) to filter. */
  columnId: string
  /** Label shown on the filter button and as the chip prefix. */
  title: string
  options: DataTableFilterOption[]
}

/**
 * DataTableFacetedFilter: a multi-select column filter, an outline button that opens a Popover
 * of checkable options, each with the faceted count of matching rows. Selecting writes an array
 * to the column's filter value (pair the column with `filterFn: "arrIncludesSome"`). `DataTable`
 * renders one per `filters` field; it's exported for hand-composed toolbars over a table you own.
 *
 * The option rows are plain buttons with a *visual* checkbox (not the interactive `Checkbox`,
 * which is itself a button, nesting buttons is invalid), so the whole row is one hit target.
 */
export function DataTableFacetedFilter<TData>({
  column,
  title,
  options,
}: {
  column?: Column<TData, unknown>
  title: string
  options: DataTableFilterOption[]
}) {
  const facets = column?.getFacetedUniqueValues()
  const selected = new Set((column?.getFilterValue() as string[]) ?? [])

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    const arr = Array.from(next)
    column?.setFilterValue(arr.length ? arr : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed">
          <FunnelSimple weight="bold" />
          {title}
          {selected.size > 0 && (
            <>
              <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />
              {selected.size <= 2 ? (
                options
                  .filter((option) => selected.has(option.value))
                  .map((option) => (
                    <Badge key={option.value} variant="secondary" size="sm" pill>
                      {option.label}
                    </Badge>
                  ))
              ) : (
                <Badge variant="secondary" size="sm" pill className="tabular-nums">
                  {selected.size} selected
                </Badge>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" density="compact" className="w-56 p-1">
        <div role="listbox" aria-multiselectable className="flex flex-col">
          {options.map((option) => {
            const isSelected = selected.has(option.value)
            const count = facets?.get(option.value)
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
                  "transition-colors duration-fast ease-out hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:bg-accent focus-visible:text-accent-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--radius-sm)*0.8)] border transition-colors duration-fast ease-out",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {isSelected && <Check weight="bold" className="size-3" />}
                </span>
                {option.icon && (
                  <span className="flex shrink-0 items-center text-muted-foreground [&>svg]:size-5">
                    {option.icon}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
                {count != null && (
                  <span className="ml-auto pl-2 text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {selected.size > 0 && (
          <>
            <div role="separator" className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={() => column?.setFilterValue(undefined)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
                "transition-colors duration-fast ease-out hover:bg-accent hover:text-accent-foreground",
                "focus-visible:bg-accent focus-visible:text-accent-foreground",
              )}
            >
              Clear filter
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** One active filter value, surfaced as a chip. */
interface ActiveChip {
  key: string
  columnId: string
  value: string
  title: string
  label: string
}

/** A chip in the rendered list. `exiting` chips are on their way out (playing the out-animation
 *  before they unmount). */
interface RenderedChip extends ActiveChip {
  exiting: boolean
}

/** Merge the live chips into the previously-rendered list: chips that are still active stay (in
 *  their original slot, so an exit fades in place), chips that vanished are flagged `exiting`, and
 *  newly-active chips are appended. */
function reconcileChips(prev: RenderedChip[], chips: ActiveChip[]): RenderedChip[] {
  const live = new Map(chips.map((c) => [c.key, c]))
  const seen = new Set<string>()
  const next: RenderedChip[] = []
  for (const old of prev) {
    seen.add(old.key)
    const liveChip = live.get(old.key)
    next.push(liveChip ? { ...liveChip, exiting: false } : { ...old, exiting: true })
  }
  for (const c of chips) {
    if (!seen.has(c.key)) next.push({ ...c, exiting: false })
  }
  return next
}

/**
 * DataTableActiveFilters: the chip rail under the toolbar. Renders one removable `Badge` per
 * active value across every `filters` field, plus a "Reset" button that clears all column filters
 * and the global search. Chips animate in when added and out when removed (presence reconciled in
 * render, finalized in onAnimationEnd). Returns nothing when no filter is active. `DataTable`
 * renders it for you.
 */
export function DataTableActiveFilters<TData>({
  table,
  filters,
}: {
  table: Table<TData>
  filters: DataTableFilterField[]
}) {
  const { columnFilters, globalFilter } = table.getState()
  // A signature of the active filters; drives the render-phase presence reconcile below.
  const filterSig = JSON.stringify(columnFilters)

  const chips = React.useMemo<ActiveChip[]>(() => {
    return filters.flatMap((field) => {
      const values = (table.getColumn(field.columnId)?.getFilterValue() as string[]) ?? []
      return values.map((value) => ({
        key: `${field.columnId}:${value}`,
        columnId: field.columnId,
        value,
        title: field.title,
        label: field.options.find((o) => o.value === value)?.label ?? value,
      }))
    })
    // `table` is stable; recompute when the active filters or the field defs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSig, filters])

  // Presence: keep removed chips mounted (flagged `exiting`) so they can play an out-animation
  // before they leave, and let new chips animate in. With no motion library this is the
  // Radix-style "stay mounted until the animation ends" pattern, finalized in onAnimationEnd.
  // State is reconciled *during render* (guarded by the filter signature) rather than in an
  // effect, the repo's approved way to adjust state from changing inputs.
  const [rendered, setRendered] = React.useState<RenderedChip[]>(() =>
    chips.map((c) => ({ ...c, exiting: false })),
  )
  const [prevSig, setPrevSig] = React.useState(filterSig)
  if (filterSig !== prevSig) {
    setPrevSig(filterSig)
    setRendered((prev) => reconcileChips(prev, chips))
  }

  function finalizeExit(key: string) {
    setRendered((prev) => prev.filter((c) => c.key !== key))
  }

  const hasGlobalFilter = typeof globalFilter === "string" && globalFilter.trim().length > 0
  const hasActive = rendered.some((c) => !c.exiting)

  if (rendered.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {rendered.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          size="md"
          pill
          // Enter on mount, out-animation while exiting, matched to the popover's fade + zoom.
          // onAnimationEnd finalizes only the exit (guarded) so the enter keyframe ending never
          // drops a fresh chip.
          className={cn(
            "duration-fast ease-out",
            chip.exiting
              ? "pointer-events-none animate-out fade-out-0 zoom-out-95"
              : "animate-in fade-in-0 zoom-in-95",
          )}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && chip.exiting) finalizeExit(chip.key)
          }}
          onRemove={
            chip.exiting
              ? undefined
              : () => {
                  const column = table.getColumn(chip.columnId)
                  const values = (column?.getFilterValue() as string[]) ?? []
                  const next = values.filter((v) => v !== chip.value)
                  column?.setFilterValue(next.length ? next : undefined)
                }
          }
          removeLabel={`Remove ${chip.title} ${chip.label} filter`}
        >
          <span className="text-muted-foreground">{chip.title}:</span>
          <span className="font-medium">{chip.label}</span>
        </Badge>
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            table.resetColumnFilters()
            if (hasGlobalFilter) table.setGlobalFilter("")
          }}
          className="animate-in fade-in-0 gap-1.5 text-muted-foreground duration-fast ease-out"
        >
          <X weight="bold" />
          Reset
        </Button>
      )}
    </div>
  )
}
