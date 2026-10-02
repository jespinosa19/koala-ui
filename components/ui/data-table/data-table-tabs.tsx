"use client"

import * as React from "react"

import { AnimatedNumber } from "@/components/ui/animated-number"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  type TabsProps,
  type TabsTriggerProps,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * DataTableTabs: line tabs over a DataTable that split one list into views ("All", "Paid",
 * "Refunded"), each with a live count. Composition, not configuration: wrap the table and put the
 * tabs above it.
 *
 *   <DataTableTabs value={view} onValueChange={setView}>
 *     <DataTableTabsList aria-label="Order status">
 *       <DataTableTab value="all" count={orders.length}>All</DataTableTab>
 *       <DataTableTab value="paid" count={paid.length}>Paid</DataTableTab>
 *     </DataTableTabsList>
 *     <DataTable columns={columns} data={view === "paid" ? paid : orders} />
 *   </DataTableTabs>
 *
 * The rows stay yours to filter (you already own `data`, and the counts come from the same place),
 * so the parts only own what every screen was hand-rolling around them: the line look, the count
 * chip, the tab panel the table sits in, and the paging. A DataTable inside reads the active view
 * from context and goes back to its first page when it changes, while its search, filters, sort and
 * the selection that still applies stay put: switching views no longer means remounting the table
 * with a `key` and losing all of it.
 *
 * Every part is droppable: without `DataTableTabs` the table renders exactly as before, and the
 * tabs without a table are plain line Tabs.
 */

interface DataTableTabsContextValue {
  /** The active view, or `undefined` when nothing is selected yet. */
  value: string | undefined
}

const DataTableTabsContext = React.createContext<DataTableTabsContextValue | null>(null)

/** The nearest `DataTableTabs`, or `null` when the table stands on its own. */
export function useDataTableTabs() {
  return React.useContext(DataTableTabsContext)
}

export type DataTableTabsProps = Omit<TabsProps, "variant" | "orientation">

/** The root: line `Tabs` spaced to the table's own rhythm (the gap the toolbar keeps above it). */
export function DataTableTabs({
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: DataTableTabsProps) {
  // Mirror the value so the table below can read it whether the tabs are controlled or not.
  const [ownValue, setOwnValue] = React.useState(defaultValue)
  const active = value ?? ownValue
  const context = React.useMemo(() => ({ value: active }), [active])

  return (
    <DataTableTabsContext.Provider value={context}>
      <Tabs
        variant="line"
        value={active}
        onValueChange={(next) => {
          setOwnValue(next)
          onValueChange?.(next)
        }}
        className={cn("gap-4", className)}
        {...props}
      />
    </DataTableTabsContext.Provider>
  )
}

/** The rail. Spans the table's width so the line under the tabs rules the whole block, and scrolls
 *  sideways on a phone like any Tabs list. Give it an `aria-label` naming what the views split. */
export function DataTableTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return <TabsList className={cn("w-full", className)} {...props} />
}

export interface DataTableTabProps extends TabsTriggerProps {
  /** How many rows the view holds, shown as a count chip after the label. Leave it out for a tab
   *  without one. */
  count?: number
}

/** One view. `count` adds the chip, which rolls to the new figure as a row action recounts it;
 *  everything else is a `TabsTrigger`, press-scale off. */
export function DataTableTab({ count, children, static: isStatic = true, ...props }: DataTableTabProps) {
  return (
    <TabsTrigger static={isStatic} {...props}>
      {children}
      {count != null && (
        <Badge variant="secondary" size="sm" className="tabular-nums">
          <AnimatedNumber value={count} />
        </Badge>
      )}
    </TabsTrigger>
  )
}
