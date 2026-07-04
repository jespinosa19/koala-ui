"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"
import {
  InputRoot,
  InputField,
  InputPrefix,
  InputSuffix,
  type InputFieldProps,
  type InputRootProps,
} from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"

/**
 * DataTableToolbar: the control rail that sits above a DataTable: search on the left, view
 * actions on the right (filter, sort, export, view options, a primary action). Pure layout
 * built from Koala natives (Input for the search, Button for every action) so it inherits
 * the same focus rings, density, and press feedback as the rest of the system.
 *
 * It's the seam the multi-view DataTable will grow from: today it frames the table; next it
 * hosts the view switcher (table · board · …) without the consumer re-wiring the layout.
 *
 * Composition (not config): the root spaces two `DataTableToolbarSection` clusters apart, each
 * a flex row of controls. Drop `DataTableSearch` and any `Button`s inside.
 */
const dataTableToolbarVariants = tv({
  slots: {
    // Wraps to a stacked layout on narrow screens so the two clusters never collide.
    root: "flex flex-wrap items-center justify-between gap-x-3 gap-y-2",
    section: "flex items-center gap-1.5",
  },
})

const { root: rootSlot, section: sectionSlot } = dataTableToolbarVariants()

export type DataTableToolbarProps = React.ComponentProps<"div">

export function DataTableToolbar({ className, ...props }: DataTableToolbarProps) {
  return <div data-slot="data-table-toolbar" className={rootSlot({ className })} {...props} />
}

export type DataTableToolbarSectionProps = React.ComponentProps<"div">

/** A cluster of controls. Place two inside the toolbar (left for search + filters and right
 *  for actions) and the root pushes them to opposite edges. */
export function DataTableToolbarSection({ className, ...props }: DataTableToolbarSectionProps) {
  return (
    <div data-slot="data-table-toolbar-section" className={sectionSlot({ className })} {...props} />
  )
}

export interface DataTableSearchProps extends InputFieldProps {
  /** Control size, forwarded to the underlying Input. @default "md" */
  size?: InputRootProps["size"]
  /** Classes for the search box (the InputRoot), e.g. to set its width. */
  rootClassName?: string
  /**
   * Keyboard-shortcut hint shown on the right edge as a `Kbd`. Pass `false` to hide it.
   * @default "⌘K"
   */
  shortcut?: React.ReactNode | false
}

/**
 * The search box preset: a magnifier-prefixed Input with a trailing shortcut hint. It's a thin
 * arrangement of Input parts (no new styling) so it tracks the Input component exactly; pass any
 * `<input>` prop straight through, and grab the `ref` to focus it from a ⌘K handler.
 */
export function DataTableSearch({
  size = "md",
  rootClassName,
  shortcut = "⌘K",
  placeholder = "Search for anything",
  className,
  ...props
}: DataTableSearchProps) {
  return (
    <InputRoot size={size} className={cn("w-full sm:w-72", rootClassName)}>
      <InputPrefix>
        <MagnifyingGlass weight="bold" />
      </InputPrefix>
      <InputField type="search" placeholder={placeholder} className={className} {...props} />
      {shortcut !== false && (
        <InputSuffix>
          <Kbd size="sm" variant="outline">
            {shortcut}
          </Kbd>
        </InputSuffix>
      )}
    </InputRoot>
  )
}
