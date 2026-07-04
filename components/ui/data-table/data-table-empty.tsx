"use client"

import * as React from "react"
import { Tray, MagnifyingGlass } from "@phosphor-icons/react"

import {
  EmptyState,
  EmptyStateMedia,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/components/ui/empty-state"

/**
 * DataTableEmpty: the table's zero-row placeholder, a thin preset over EmptyState so the two
 * cases a grid hits read differently out of the box:
 *
 *  • `kind="empty"`:  there's genuinely nothing yet (a fresh, unfilled table).
 *  • `kind="search"`: there *is* data, but nothing matched the active search/filters.
 *
 * Drop it straight into `DataTable`'s `emptyState` prop (it's the default when none is given).
 * It runs `density="compact"` because it lives inside a panel, not on a full page. Override the
 * copy/icon with props, and pass action buttons as `children`.
 */
const PRESETS = {
  empty: {
    icon: <Tray weight="bold" />,
    title: "No data yet",
    description: "There's nothing here yet. New records will show up in this table.",
  },
  search: {
    icon: <MagnifyingGlass weight="bold" />,
    title: "No results found",
    description: "No records matched your search or filters. Try broadening them.",
  },
} as const

export interface DataTableEmptyProps {
  /** Which case this is: drives the default icon and copy. @default "empty" */
  kind?: keyof typeof PRESETS
  /** Override the media icon. */
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** Action buttons, rendered below the copy (e.g. "Clear filters"). */
  children?: React.ReactNode
  className?: string
}

export function DataTableEmpty({
  kind = "empty",
  icon,
  title,
  description,
  children,
  className,
}: DataTableEmptyProps) {
  const preset = PRESETS[kind]
  return (
    <EmptyState density="compact" className={className}>
      <EmptyStateMedia>{icon ?? preset.icon}</EmptyStateMedia>
      <EmptyStateTitle>{title ?? preset.title}</EmptyStateTitle>
      <EmptyStateDescription>{description ?? preset.description}</EmptyStateDescription>
      {children && <EmptyStateActions>{children}</EmptyStateActions>}
    </EmptyState>
  )
}
