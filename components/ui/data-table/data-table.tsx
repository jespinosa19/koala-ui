"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type CellContext,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type GroupingState,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"
import { CaretDown, CaretUpDown, CaretRight, Info } from "@phosphor-icons/react"

import { useDensity, type Density } from "@/lib/density"
import { prefersReducedMotion } from "@/lib/motion"
import { Spinner } from "@/components/ui/spinner"
import { Stagger } from "@/lib/stagger"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Pagination } from "@/components/ui/pagination"
import { TabsContent } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { DataTableEmpty } from "./data-table-empty"
import { useDataTableTabs } from "./data-table-tabs"
import {
  DataTableToolbar,
  DataTableToolbarSection,
  DataTableSearch,
} from "./data-table-toolbar"
import {
  DataTableViewOptions,
  columnLabel,
  type DataTableLayout,
} from "./data-table-view-options"
import {
  DataTableFacetedFilter,
  DataTableActiveFilters,
  type DataTableFilterField,
} from "./data-table-faceted-filter"
import { DataTableSelectionBar } from "./data-table-selection-bar"
import {
  DataTableGrip,
  moveItem,
  reorderShift,
  reorderTransition,
  useReorder,
} from "./data-table-reorder"

/**
 * Per-column display hints. TanStack's `meta` is the documented escape hatch for passing
 * presentational config from a column def down to the cell renderer: we use it for alignment
 * and column pinning so the *behavior* (TanStack) and the *look* (these primitives) stay
 * declared in one place: the `ColumnDef`.
 */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Pin this column to an edge while the rest scrolls horizontally. */
    sticky?: "left" | "right"
    /** Text alignment for both the header and its cells. */
    align?: "left" | "center" | "right"
    /** `tabular-nums` + right alignment for figure columns. */
    numeric?: boolean
    /** Display name for the column in the view-options menu and as a card-layout field label.
     *  Falls back to a string `header`; columns with neither aren't user-toggleable. */
    label?: string
    /** Extra classes for this column's header and cells, e.g. to tighten padding or pin a width. */
    className?: string
    /** Hint shown in the column header: appends a small info icon after the label that reveals
     *  this content on hover/focus. Use it to explain what a column measures (e.g. how a score is
     *  computed) without crowding the header text. */
    headerTooltip?: React.ReactNode
    /** Wrap every cell in this column in a tooltip. Given the cell context, return the hint to show
     *  (or `null`/`undefined` to skip a given cell), e.g. the full, untruncated text for a clamped
     *  column, or a timestamp behind a relative "2h ago". */
    cellTooltip?: (context: CellContext<TData, TValue>) => React.ReactNode
  }
}

/** A row the user dragged (or arrow-nudged) to a new place. Apply it to your own `data`:
 *  `setData((rows) => moveItem(rows, fromIndex, toIndex))`. */
export interface DataTableRowReorder<TData> {
  /** The row that moved. */
  row: Row<TData>
  /** Where it sat in `data` before the move. */
  fromIndex: number
  /** Where it should sit in `data` after the move. */
  toIndex: number
}

/**
 * DataTable: the TanStack-wired data grid. It owns the *behavior* (sorting, grouping, row
 * selection, column pinning) and renders into the Koala `Table` primitives, which own the
 * *look*. Drive features with flags; alignment and pinning ride along on each column's
 * `meta`. For static or fully bespoke tables, use the `Table` primitives directly.
 */
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable row id, required for selection/grouping to survive re-sorts. */
  getRowId?: (row: TData, index: number) => string

  // Opening a row. The record-list pattern: click a row (or focus it and press Enter) and the
  //   screen shows that record, in a detail pane beside the table, a drawer or a page of its own.
  /** Open a row: called when the user clicks anywhere on a body row, or focuses one and presses
   *  Enter. Clicks that land on a control inside the row (a button, link, checkbox, input, label or
   *  menu item) do their own job instead, and so does a click that ends a text selection. Setting it
   *  makes every body row focusable, with a brand focus ring. The event rides along for modifier
   *  keys (a ⌘-click that opens in a new tab). */
  onRowClick?: (
    row: Row<TData>,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void
  /** The id (as `getRowId` returns it) of the row that is open elsewhere, e.g. in a detail pane.
   *  That row is painted as the current one (a brand tint, distinct from the checkbox-selected fill)
   *  and carries `aria-current="true"`. `null` or unset: no row is current. */
  activeRowId?: string | null

  /** Click-to-sort headers. @default false */
  enableSorting?: boolean
  initialSorting?: SortingState
  /** The sort, controlled. Pair it with `onSortingChange`; `initialSorting` is then ignored. */
  sorting?: SortingState
  /** Leading checkbox column with a header "select all". @default false */
  enableRowSelection?: boolean
  /** Notified after each selection change (once the table has re-rendered with it), including
   *  when rows that left `data` drop out of the selection. */
  onRowSelectionChange?: (selection: RowSelectionState) => void
  /** Collapse rows into expandable groups (pass `initialGrouping` to choose the column). @default false */
  enableGrouping?: boolean
  initialGrouping?: GroupingState

  // Manual order. Both axes work the same way: a grip you drag, with an arrow-key twin for the
  // keyboard, since the native drag-and-drop API has no keyboard path of its own.
  /** Let the user drag rows into their own order. Setting it prepends a grip column; every move
   *  fires with the row and the indices it travelled between, and you apply it to your own `data`
   *  (`moveItem(data, fromIndex, toIndex)` does the array move). The table never reorders `data`
   *  itself, so the order stays in the source of truth you already own. Held inert while a sort or
   *  grouping is on, since the rows aren't in data order then. */
  onRowReorder?: (event: DataTableRowReorder<TData>) => void
  /** Let the user drag column headers into their own order. Utility columns (the grip, the
   *  selection checkbox, the expander) and columns pinned with `meta.sticky` stay put.
   *  @default false */
  enableColumnOrdering?: boolean
  /** Initial left-to-right column order, by column id. @default the order of `columns` */
  initialColumnOrder?: string[]
  /** Notified when the column order changes. */
  onColumnOrderChange?: (order: string[]) => void
  /** Page the rows client-side and render a Pagination toolbar below the table. The page never
   *  falls out of range: when `data` shrinks under it (a delete, a tab that filters the rows) it
   *  steps back to the last page that still exists. @default false */
  enablePagination?: boolean
  /** Initial rows per page. @default 8 */
  pageSize?: number
  /** Options offered by the rows-per-page select. The current page size is always among them
   *  (merged in and sorted if you leave it out), so the select never goes blank.
   *  @default one, two and three pages of `pageSize`, then 50 and 100 ([8, 16, 24, 50, 100]) */
  pageSizeOptions?: number[]

  // Toolbar (the control rail above the table). Each piece is its own toggle.
  /** Force the toolbar rail on even with no search/actions. Auto-on when `searchable` or
   *  `toolbarActions` is set. @default false */
  toolbar?: boolean
  /** Add a search box that filters every column (TanStack global filter). @default false */
  searchable?: boolean
  /** Placeholder for the search box. @default "Search for anything" */
  searchPlaceholder?: string
  /** The search text, controlled. Pair it with `onGlobalFilterChange`. Works with the built-in
   *  box (`searchable`) or without it, for a search field that lives elsewhere on the screen. */
  globalFilter?: string
  /** Right-cluster slot for app actions: filter/export/primary buttons, etc. */
  toolbarActions?: React.ReactNode
  /** Add a "View options" dropdown to the toolbar for showing/hiding columns. Give a column a
   *  `meta.label` (or a string header) for it to appear there. @default false */
  viewOptions?: boolean
  /** Which columns are visible, controlled (`{ columnId: false }` hides one). Pair it with
   *  `onColumnVisibilityChange`. */
  columnVisibility?: VisibilityState
  /** Notified when a column is shown or hidden. */
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  /** Per-column faceted filters. Each field adds a multi-select dropdown to the toolbar and a
   *  removable chip below it. The filtered columns must use `filterFn: "arrIncludesSome"`. */
  filters?: DataTableFilterField[]

  // Layout (rows vs. cards)
  /** Offer a Rows/Cards layout switch (in the view-options dropdown) and render cards when chosen.
   *  Implies `viewOptions`. @default false */
  enableCardLayout?: boolean
  /** Initial layout when `enableCardLayout` is on. @default "rows" */
  defaultLayout?: DataTableLayout
  /** Custom card renderer for the cards layout. Defaults to a generated card: the first column as
   *  the title, the rest as labelled fields, any icon-only action top-right. */
  renderCard?: (row: Row<TData>) => React.ReactNode

  /** Swap the rows for skeleton placeholders while data is in flight. @default false */
  loading?: boolean
  /** How many skeleton rows to show while `loading`. @default 5 */
  loadingRows?: number

  // Infinite scroll (load on scroll). Mutually exclusive with `enablePagination`.
  /** Called when the user scrolls near the end and there's more to load. Setting it enables
   *  infinite scroll and replaces the pagination toolbar; the consumer fetches and appends to
   *  `data`. The sentinel observes the nearest scroll container (or the viewport). */
  onLoadMore?: () => void
  /** Whether more rows can still be loaded. The sentinel stops firing (and hides) when false. */
  hasMore?: boolean
  /** Whether a load-more fetch is in flight; shows a loading row and blocks duplicate calls. */
  loadingMore?: boolean

  // Expandable rows (detail panel)
  /** Render an expandable detail panel under a row. Setting it prepends a caret toggle column and
   *  renders this node full-width beneath each expanded row. Not combined with `enableGrouping`. */
  renderSubRow?: (row: Row<TData>) => React.ReactNode
  /** Which rows can expand a detail panel. @default all rows (when `renderSubRow` is set) */
  getRowCanExpand?: (row: Row<TData>) => boolean

  // Bulk actions
  /** Render bulk-action controls in a floating pill while rows are selected. Receives the selected
   *  rows. Requires `enableRowSelection`. */
  renderSelectionActions?: (rows: Row<TData>[], table: TanstackTable<TData>) => React.ReactNode

  // Server-side mode. Flip a feature to manual to drive it from the server; you fetch on the
  //   matching `on*Change` callback and feed back fresh `data` (and `pageCount`/`rowCount`).
  /** Sorting is handled server-side; don't sort the rows client-side. @default false */
  manualSorting?: boolean
  /** Filtering/search is handled server-side; don't filter the rows client-side. @default false */
  manualFiltering?: boolean
  /** Pagination is handled server-side; `data` is already the current page. Pass `pageCount` or
   *  `rowCount` so the pager knows how many pages there are. @default false */
  manualPagination?: boolean
  /** Total page count for `manualPagination`. Falls back to one derived from `rowCount`. */
  pageCount?: number
  /** Total row count across all pages; used to derive `pageCount` under `manualPagination`. */
  rowCount?: number
  // Every on*Change below is called after the table has committed the change, never from inside
  //   a state update, so it is safe to set your own state from it.
  /** Notified when the sort changes (e.g. to refetch server-side). With `sorting` set, this is
   *  the change you apply. */
  onSortingChange?: (sorting: SortingState) => void
  /** Notified when the page or page size changes. */
  onPaginationChange?: (pagination: PaginationState) => void
  /** Notified when the column filters change. */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  /** Notified when the search text changes, as the user types in the built-in box too. With
   *  `globalFilter` set, this is the change you apply. */
  onGlobalFilterChange?: (value: string) => void
  /** The rows the table currently shows, in the order it shows them: every row that passes the
   *  search and filters, sorted, across all pages (group header rows left out). Called after mount
   *  and again whenever that list changes (new data, a search, a filter, a sort), not on paging. Use
   *  it to walk the rows with previous/next from a detail pane or to export the current view. Rows
   *  are compared by id and item, so keep `data` items stable between renders (state or memo), as
   *  TanStack expects. */
  onDisplayedRowsChange?: (rows: Row<TData>[]) => void

  /** Persist view state (visible columns, sorting, layout, page size) to localStorage under this
   *  key, so the table reopens the way the user left it. SSR-safe: applied after mount. */
  persistKey?: string

  // Presentational passthrough to <Table>
  /** Surface treatment: `minimal` (chromeless, flush, the default) or `container` (ring-edged card). */
  variant?: "minimal" | "container"
  density?: Density
  striped?: boolean
  hoverable?: boolean
  stickyHeader?: boolean
  /**
   * Shown when there are no rows. Defaults to a `<DataTableEmpty />` ("No data yet"); pass
   * `<DataTableEmpty kind="search" />` when a search/filter came up empty, or any node.
   */
  emptyState?: React.ReactNode
  className?: string
  /** Classes for the scroll container, e.g. `max-h-96` to drive sticky-header scroll. */
  containerClassName?: string
}

const SELECT_COLUMN_ID = "__select__"
const EXPAND_COLUMN_ID = "__expand__"
const REORDER_COLUMN_ID = "__reorder__"
/** The columns the table adds for itself. They are never user-orderable, hideable, or card fields. */
const UTILITY_COLUMN_IDS = new Set<string>([SELECT_COLUMN_ID, EXPAND_COLUMN_ID, REORDER_COLUMN_ID])
const PERSIST_PREFIX = "koala-data-table:"

/** Which side of the item under the pointer the dragged one lands on. */
type DropEdge = "before" | "after"

/** `CSS.escape` where it exists (attribute selectors built from user-supplied row ids). */
const escapeId = (value: string) =>
  typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value

/**
 * One slice of table state that a consumer may control (a value prop + its `on*Change`) or leave to
 * the table (kept here, with `on*Change` as a notification).
 *
 * Controlled, a change goes straight to `onChange` from the event that caused it: the consumer owns
 * the value, so the table only proposes. Uncontrolled, the table keeps the value and reports it
 * AFTER the commit, from an effect. TanStack hands us functional updaters; calling the consumer from
 * inside one runs their `setState` in the middle of this component's render ("Cannot update a
 * component while rendering a different component"), and twice under StrictMode. The report
 * compares against the last value it reported, so mounting (or StrictMode's remount) is silent and
 * a change that arrives from anywhere (a click, the search box, persistence) is reported once.
 */
function useTableState<T>(
  controlled: T | undefined,
  initial: T | (() => T),
  onChange: ((value: T) => void) | undefined,
) {
  const [own, setOwn] = React.useState<T>(initial)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : own

  // The latest props, for the report below and for the setter, which runs from event handlers and
  // effects (never during render). Refreshed in a layout effect, ahead of every effect the table
  // declares after this hook, so a setter called from one of those already sees this commit.
  const latestRef = React.useRef({ controlled, onChange })
  React.useLayoutEffect(() => {
    latestRef.current = { controlled, onChange }
  })

  const reportedRef = React.useRef(own)
  React.useEffect(() => {
    if (Object.is(reportedRef.current, own)) return
    reportedRef.current = own
    if (!isControlled) latestRef.current.onChange?.(own)
  }, [own, isControlled])

  // Stable, like a `useState` setter, so it can sit in the table options and effect deps freely.
  const setValue = React.useCallback((updater: Updater<T>) => {
    const { controlled: current, onChange: notify } = latestRef.current
    if (current === undefined) {
      setOwn(updater)
      return
    }
    notify?.(typeof updater === "function" ? (updater as (old: T) => T)(current) : updater)
  }, [])

  return [value, setValue] as const
}

/** The rows-per-page choices when none are given: one, two and three pages, then 50 and 100 where
 *  they are bigger still. `pageSize` 8 gives the long-standing [8, 16, 24, 50, 100]. */
function defaultPageSizeOptions(pageSize: number) {
  const pages = [pageSize, pageSize * 2, pageSize * 3]
  return [...pages, ...[50, 100].filter((size) => size > pages[2]!)]
}

/** Anything inside a row that already does something when clicked. A click that lands on one of
 *  these is that control's, not a request to open the row. */
const ROW_CONTROL_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[contenteditable=true]",
  "[role=button]",
  "[role=link]",
  "[role=checkbox]",
  "[role=radio]",
  "[role=switch]",
  "[role=menuitem]",
  "[role=menuitemcheckbox]",
  "[role=menuitemradio]",
  "[role=option]",
  "[role=combobox]",
  "[role=slider]",
  "[role=tab]",
  "[role=textbox]",
].join(",")

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  onRowClick,
  activeRowId,
  enableSorting = false,
  initialSorting = [],
  sorting: sortingProp,
  enableRowSelection = false,
  onRowSelectionChange,
  enableGrouping = false,
  initialGrouping = [],
  onRowReorder,
  enableColumnOrdering = false,
  initialColumnOrder,
  onColumnOrderChange,
  enablePagination = false,
  pageSize = 8,
  pageSizeOptions,
  toolbar = false,
  searchable = false,
  searchPlaceholder = "Search for anything",
  globalFilter: globalFilterProp,
  toolbarActions,
  viewOptions = false,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  filters,
  enableCardLayout = false,
  defaultLayout = "rows",
  renderCard,
  renderSubRow,
  getRowCanExpand,
  renderSelectionActions,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  pageCount,
  rowCount,
  onSortingChange,
  onPaginationChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onDisplayedRowsChange,
  loading = false,
  loadingRows = 5,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  persistKey,
  variant,
  density,
  striped,
  hoverable,
  stickyHeader,
  emptyState,
  className,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  // Each slice either follows its controlled prop or lives here and reports after commit (see
  // useTableState). Grouping and layout have no callbacks, so they stay plain state.
  const [sorting, setSorting] = useTableState<SortingState>(
    sortingProp,
    initialSorting,
    onSortingChange,
  )
  const [grouping, setGrouping] = React.useState<GroupingState>(initialGrouping)
  const [rowSelection, setRowSelection] = useTableState<RowSelectionState>(
    undefined,
    {},
    onRowSelectionChange,
  )
  const [columnVisibility, setColumnVisibility] = useTableState<VisibilityState>(
    columnVisibilityProp,
    {},
    onColumnVisibilityChange,
  )
  const [pagination, setPagination] = useTableState<PaginationState>(
    undefined,
    () => ({ pageIndex: 0, pageSize }),
    onPaginationChange,
  )
  const [globalFilter, setGlobalFilter] = useTableState<string>(
    globalFilterProp,
    "",
    onGlobalFilterChange,
  )
  const [columnFilters, setColumnFilters] = useTableState<ColumnFiltersState>(
    undefined,
    [],
    onColumnFiltersChange,
  )
  const [columnOrder, setColumnOrder] = useTableState<string[]>(
    undefined,
    initialColumnOrder ?? [],
    onColumnOrderChange,
  )
  // The card layout is a sibling of the row layout, switched from the view-options dropdown.
  const [layout, setLayout] = React.useState<DataTableLayout>(defaultLayout)
  const resolvedDensity = useDensity(density)

  // Persist view state to localStorage when `persistKey` is set. Read once after mount (so the
  //   server markup matches the defaults and hydration stays clean), then write on every change.
  //   `persistHydrated` gates the writer so it can't clobber stored state with defaults before the
  //   read lands.
  const [persistHydrated, setPersistHydrated] = React.useState(false)
  React.useEffect(() => {
    if (!persistKey) return
    try {
      const raw = window.localStorage.getItem(`${PERSIST_PREFIX}${persistKey}`)
      if (raw) {
        const saved = JSON.parse(raw) as {
          columnVisibility?: VisibilityState
          columnOrder?: string[]
          sorting?: SortingState
          layout?: DataTableLayout
          pageSize?: number
        }
        if (saved.columnVisibility) setColumnVisibility(saved.columnVisibility)
        if (saved.columnOrder) setColumnOrder(saved.columnOrder)
        if (saved.sorting) setSorting(saved.sorting)
        if (saved.layout) setLayout(saved.layout)
        if (saved.pageSize) setPagination((prev) => ({ ...prev, pageSize: saved.pageSize! }))
      }
    } catch {
      // Unreadable/garbled storage: fall back to the defaults already in state.
    }
    setPersistHydrated(true)
    // The setters are stable (useTableState), so this still runs once per key.
  }, [persistKey, setColumnVisibility, setColumnOrder, setSorting, setPagination])

  React.useEffect(() => {
    if (!persistKey || !persistHydrated) return
    try {
      window.localStorage.setItem(
        `${PERSIST_PREFIX}${persistKey}`,
        JSON.stringify({
          columnVisibility,
          columnOrder,
          sorting,
          layout,
          pageSize: pagination.pageSize,
        }),
      )
    } catch {
      // Quota/availability errors: persistence is best-effort, never fatal.
    }
  }, [
    persistKey,
    persistHydrated,
    columnVisibility,
    columnOrder,
    sorting,
    layout,
    pagination.pageSize,
  ])

  // Detail panels and row selection each ride a leading utility column the consumer never has to
  // hand-roll. The expander only appears for standalone detail rows; grouping owns expansion when
  // it's on, so the two aren't stacked.
  const showExpander = renderSubRow != null && !enableGrouping
  // Row dragging is opt-in by handler, like Tree's `onMove`: hand us somewhere to send the move
  // and the grip column appears.
  const reorderRows = onRowReorder != null

  // Prepend the selection column when row selection is on. A leading checkbox column is the
  // expected shape, and keeping it here means consumers never hand-roll the header/all toggle.
  const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const leading: ColumnDef<TData, TValue>[] = []

    if (reorderRows) {
      // The grip leads the row, ahead of the checkbox and the expander: it addresses the whole
      // record, so it reads as the row's own handle rather than one more control in the rail. Its
      // cell is rendered by the body (it needs the row's live drag wiring), which keeps this
      // column definition static and out of the memo's way.
      leading.push({
        id: REORDER_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableGrouping: false,
        meta: { className: "w-0 pr-0" },
        // A named column, even though the name is never painted: an empty <th> is a column with
        // no heading, which axe flags and a screen reader reads as a blank.
        header: () => <span className="sr-only">Reorder</span>,
        cell: () => null,
      })
    }

    if (showExpander) {
      leading.push({
        id: EXPAND_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableGrouping: false,
        meta: { className: "w-0 pr-0" },
        header: () => <span className="sr-only">Expand</span>,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
              aria-expanded={row.getIsExpanded()}
              className="-mx-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-fast ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
            >
              <CaretRight
                weight="bold"
                className={cn(
                  "size-3.5 caret-turn",
                  row.getIsExpanded() && "rotate-90",
                )}
              />
            </button>
          ) : null,
      })
    }

    if (!enableRowSelection) return [...leading, ...columns]
    const selectionColumn: ColumnDef<TData, TValue> = {
      id: SELECT_COLUMN_ID,
      enableSorting: false,
      enableGrouping: false,
      // `w-0` shrinks the column to its content and `pr-0` drops the right padding, so the
      // checkbox sits tight against the next column instead of floating in a wide cell.
      meta: { align: "center", className: "w-0 pr-0" },
      header: ({ table }) => (
        <Checkbox
          size="sm"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    }
    return [...leading, selectionColumn, ...columns]
  }, [columns, enableRowSelection, showExpander, reorderRows])

  // Filtering is on when there's a search box or any faceted filter field. Faceted counts only
  // make sense on the client, so they ride along with the (non-manual) filtered row model.
  const hasFilters = (filters?.length ?? 0) > 0
  // A controlled `globalFilter` searches too, with or without the built-in box.
  const searching = searchable || globalFilterProp !== undefined
  const filteringEnabled = searching || hasFilters
  // Expansion drives both grouping's group rows and standalone detail panels.
  const showExpansion = enableGrouping || renderSubRow != null

  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    state: {
      sorting,
      grouping,
      rowSelection,
      columnVisibility,
      ...(enableColumnOrdering && { columnOrder }),
      ...(enablePagination && { pagination }),
      ...(searching && { globalFilter }),
      ...(filteringEnabled && { columnFilters }),
    },
    getRowId,
    enableSorting,
    enableRowSelection,
    enableGrouping,
    // Server-side hand-offs: when a feature is manual, TanStack skips the matching client row
    // model below and the consumer refetches on the on*Change callback.
    manualSorting,
    manualFiltering,
    manualPagination,
    // TanStack's `autoResetPageIndex` (default on) calls `setPagination` from inside the row-model
    // memo on the very first render, i.e. a state update during render, before the table has
    // mounted. React rejects that ("Can't perform a React state update on a component that hasn't
    // mounted yet"), and the thrown warning derails the initial passive-effect flush for the whole
    // tree. We turn it off and reset to the first page ourselves, after mount, when the filter
    // inputs change (the case where the active page can fall out of range), in the effect below.
    autoResetPageIndex: false,
    ...(manualPagination && {
      pageCount:
        pageCount ?? (rowCount != null ? Math.ceil(rowCount / pagination.pageSize) : undefined),
    }),
    ...(renderSubRow && { getRowCanExpand: getRowCanExpand ?? (() => true) }),
    // Every setter notifies the consumer on its own, after commit (useTableState), so these are
    // handed over as they are: server-side mode needs no extra wiring.
    onGroupingChange: setGrouping,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    ...(filteringEnabled && !manualFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    ...(hasFilters && !manualFiltering && {
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
    }),
    ...(enableSorting && !manualSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableGrouping && { getGroupedRowModel: getGroupedRowModel() }),
    ...(showExpansion && { getExpandedRowModel: getExpandedRowModel() }),
    ...(enablePagination && !manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
  })

  // The view picked in a DataTableTabs around this table, if there is one.
  const tabs = useDataTableTabs()
  const tabValue = tabs?.value

  // Replaces the disabled `autoResetPageIndex` (see the table options above): a new search, a
  // faceted filter or another tab is a new list, so it starts on its first page. Skipping the mount
  // run keeps this out of the initial render (the whole point of disabling the built-in), and
  // client-paged tables only: in `manualPagination` the consumer owns paging and refetches on its
  // own callbacks. A layout effect, so the page flips before paint instead of flashing the old one.
  const didMountRef = React.useRef(false)
  React.useLayoutEffect(() => {
    if (!enablePagination || manualPagination) return
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    // Only when we're actually past the first page, so an already-first-page table never fires a
    // redundant pagination update (incl. under dev StrictMode's mount/remount).
    if (table.getState().pagination.pageIndex !== 0) table.setPageIndex(0)
  }, [globalFilter, columnFilters, tabValue, enablePagination, manualPagination, table])

  // The page never points past the end. `data` can shrink under it from outside (a delete, a filter
  // the screen applies itself), and a page that no longer exists would show an empty table with a
  // pager that says "Page 4 of 2". Step back to the last page that does exist: an in-place edit
  // keeps its page, a shrink lands on the nearest one. Functional, so it composes with the reset
  // above when both land in one commit (min(0, last) is still 0).
  const clientPaged = enablePagination && !manualPagination
  const clientPageCount = clientPaged ? table.getPageCount() : 0
  React.useLayoutEffect(() => {
    if (!clientPaged || loading) return
    const last = Math.max(0, clientPageCount - 1)
    if (pagination.pageIndex > last) table.setPageIndex((index) => Math.min(index, last))
  }, [clientPageCount, pagination.pageIndex, clientPaged, loading, table])

  // Selection follows the rows that are still here: when `data` changes, rows that left it leave
  // the selection too, so a bulk action or a mirrored count never includes something the user can
  // no longer see. Rows that stayed keep their checks. Not under server-side paging or filtering,
  // where `data` is one page of a larger set and a selection may span pages, nor while loading,
  // when `data` is often an empty placeholder, nor under grouping, whose group rows carry ids of
  // their own that `data` never had.
  React.useEffect(() => {
    if (manualPagination || manualFiltering || loading || enableGrouping) return
    const { rowsById } = table.getCoreRowModel()
    const stale = Object.keys(rowSelection).filter((id) => !(id in rowsById))
    if (stale.length === 0) return
    setRowSelection((current) => {
      const next = { ...current }
      for (const id of stale) delete next[id]
      return next
    })
  }, [
    data,
    rowSelection,
    manualPagination,
    manualFiltering,
    loading,
    enableGrouping,
    table,
    setRowSelection,
  ])

  // The rows on show, in order, for a consumer that walks or exports them (onDisplayedRowsChange).
  // TanStack's sorted model sits after search, filters and grouping and before paging, and falls
  // back to the unsorted one when sorting is off or manual. Reported after commit, and only when the
  // list really changed (by id and item), so a consumer that stores it in state and hands back a
  // freshly filtered `data` array on every render doesn't loop.
  const displayedModel = onDisplayedRowsChange ? table.getSortedRowModel() : null
  const onDisplayedRowsChangeRef = React.useRef(onDisplayedRowsChange)
  const reportedRowsRef = React.useRef<Row<TData>[] | null>(null)
  React.useEffect(() => {
    onDisplayedRowsChangeRef.current = onDisplayedRowsChange
  })
  React.useEffect(() => {
    if (!displayedModel) return
    const rows = displayedModel.flatRows.filter((row) => !row.getIsGrouped())
    const last = reportedRowsRef.current
    const same =
      last != null &&
      last.length === rows.length &&
      last.every((row, index) => row.id === rows[index]!.id && row.original === rows[index]!.original)
    if (same) return
    reportedRowsRef.current = rows
    onDisplayedRowsChangeRef.current?.(rows)
  }, [displayedModel])

  // ── Manual reordering ──────────────────────────────────────────────────────────────────────
  // "Lift and make room": the grabbed row follows the pointer and the rows it passes step aside,
  // so the gap IS the drop indicator. `useReorder` owns the gesture (pointer events, so it works
  // on touch too) and publishes the live offset as a CSS variable on the scroll container; the
  // render below only turns its state into transforms.
  const containerRef = React.useRef<HTMLDivElement>(null)
  // A drag has the pointer to follow; an arrow-key move has nothing, so every keyboard move says
  // where the thing landed.
  const [reorderMessage, setReorderMessage] = React.useState("")

  // A hand-made order only means something while the rows are in data order. With a sort or a
  // grouping deciding it instead, the grips go inert and say why, rather than firing moves that
  // the sort would immediately paint over.
  const rowReorderLock =
    sorting.length > 0
      ? "Clear the sort to reorder rows"
      : grouping.length > 0
        ? "Clear the grouping to reorder rows"
        : undefined

  /** Turn a drop (this row, this edge) into the pair of `data` indices the consumer applies. */
  const commitRowMove = (dragId: string, targetId: string, edge: DropEdge) => {
    if (!onRowReorder || rowReorderLock || dragId === targetId) return
    const { rowsById, rows } = table.getRowModel()
    const dragged = rowsById[dragId]
    const target = rowsById[targetId]
    if (!dragged || !target) return
    // `row.index` is the row's place in `data`, so the move is expressed in the consumer's own
    // terms whatever the table happens to be showing. Dropping *after* the target lands one slot
    // further along, and a row travelling down frees the slot it left behind: hence the -1.
    const fromIndex = dragged.index
    let toIndex = edge === "before" ? target.index : target.index + 1
    if (fromIndex < toIndex) toIndex -= 1
    if (toIndex === fromIndex) return
    onRowReorder({ row: dragged, fromIndex, toIndex })
    const order = rows.map((row) => row.id)
    let place = order.indexOf(targetId) + (edge === "before" ? 0 : 1)
    if (order.indexOf(dragId) < place) place -= 1
    setReorderMessage(`Row moved to position ${place + 1} of ${order.length}.`)
  }

  const nudgeRow = (rowId: string, direction: -1 | 1) => {
    const rows = table.getRowModel().rows
    const neighbour = rows[rows.findIndex((row) => row.id === rowId) + direction]
    if (!neighbour) return
    commitRowMove(rowId, neighbour.id, direction === -1 ? "before" : "after")
    // The consumer re-renders from new data, which can take the grip's DOM node with it. Put
    // focus back on the row that moved so a second press carries on from there.
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          `[data-slot="data-table-row-grip"][data-id="${escapeId(rowId)}"]`,
        )
        ?.focus()
    })
  }

  /** Columns the user may move: named ones (an icon-only actions column has no name to grab it
   *  by, and belongs at the end anyway), none of ours, and none pinned to an edge, since a sticky
   *  column that wandered into the middle of the table would only look broken. */
  const canOrderColumn = (column: Column<TData, unknown>) =>
    enableColumnOrdering &&
    !UTILITY_COLUMN_IDS.has(column.id) &&
    column.columnDef.meta?.sticky == null &&
    columnLabel(column) !== undefined

  const commitColumnMove = (dragId: string, targetId: string, edge: DropEdge) => {
    if (dragId === targetId) return
    // TanStack leaves `columnOrder` empty until something moves; the definition order stands in.
    const saved = table.getState().columnOrder
    const order = saved.length > 0 ? [...saved] : table.getAllLeafColumns().map((c) => c.id)
    const fromIndex = order.indexOf(dragId)
    const targetIndex = order.indexOf(targetId)
    if (fromIndex === -1 || targetIndex === -1) return
    let toIndex = edge === "before" ? targetIndex : targetIndex + 1
    if (fromIndex < toIndex) toIndex -= 1
    if (toIndex === fromIndex) return
    const next = moveItem(order, fromIndex, toIndex)
    table.setColumnOrder(next)
    // Announced in the user's terms: their columns, not ours, and not counting the hidden ones.
    const moved = table.getColumn(dragId)
    const visible = next.filter((id) => {
      const column = table.getColumn(id)
      return column != null && !UTILITY_COLUMN_IDS.has(id) && column.getIsVisible()
    })
    const label = (moved && columnLabel(moved)) || "Column"
    setReorderMessage(
      `${label} moved to position ${visible.indexOf(dragId) + 1} of ${visible.length}.`,
    )
  }

  const nudgeColumn = (id: string, direction: -1 | 1) => {
    const movable = table.getVisibleLeafColumns().filter(canOrderColumn)
    const neighbour = movable[movable.findIndex((column) => column.id === id) + direction]
    if (!neighbour) return
    commitColumnMove(id, neighbour.id, direction === -1 ? "before" : "after")
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          `[data-slot="data-table-column-grip"][data-id="${escapeId(id)}"]`,
        )
        ?.focus()
    })
  }

  // The box that actually scrolls under a row drag: the table's own when the consumer capped it
  // (`containerClassName="max-h-96"`), else whatever scrolls above it, else the window (null).
  const rowScrollContainer = () => {
    const el = containerRef.current
    if (!el) return null
    return el.scrollHeight > el.clientHeight ? el : getScrollParent(el)
  }

  const rowDrag = useReorder({
    axis: "y",
    offsetVar: "--row-drag",
    getRoot: () => containerRef.current,
    getScrollContainer: rowScrollContainer,
    getItems: () =>
      table.getRowModel().rows.map((row) => ({
        id: row.id,
        element:
          containerRef.current?.querySelector<HTMLElement>(
            `[data-slot="table-row"][data-row-id="${escapeId(row.id)}"]`,
          ) ?? null,
      })),
    onCommit: (fromIndex, toIndex) => {
      const rows = table.getRowModel().rows
      const dragged = rows[fromIndex]
      const target = rows[toIndex]
      if (!dragged || !target) return
      commitRowMove(dragged.id, target.id, toIndex > fromIndex ? "after" : "before")
    },
  })

  const columnDrag = useReorder({
    axis: "x",
    offsetVar: "--column-drag",
    getRoot: () => containerRef.current,
    // A wide table scrolls sideways in its own container; there is nothing else to pull.
    getScrollContainer: () => containerRef.current,
    getItems: () =>
      table.getVisibleLeafColumns().map((column) => ({
        id: column.id,
        element:
          containerRef.current?.querySelector<HTMLElement>(
            `[data-slot="table-head"][data-column-id="${escapeId(column.id)}"]`,
          ) ?? null,
      })),
    // Every column is measured (the gap has to add up), but only the orderable stretch can be
    // landed on: the utility rail on the left and a pinned or unnamed column stay put.
    getBounds: () => {
      const orderable = table
        .getVisibleLeafColumns()
        .map((column, index) => (canOrderColumn(column) ? index : -1))
        .filter((index) => index >= 0)
      return [orderable[0] ?? 0, orderable[orderable.length - 1] ?? 0]
    },
    onCommit: (fromIndex, toIndex) => {
      const columns = table.getVisibleLeafColumns()
      const dragged = columns[fromIndex]
      const target = columns[toIndex]
      if (!dragged || !target) return
      commitColumnMove(dragged.id, target.id, toIndex > fromIndex ? "after" : "before")
    },
  })

  const isDragging = rowDrag.state != null || columnDrag.state != null

  /**
   * The transform for a part caught up in a drag. The lifted one reads the engine's CSS variable,
   * so following the pointer costs no React render; the ones stepping aside get a plain offset and
   * ease into it. Only the settle gets a transition on the lifted part: while the pointer owns it,
   * any easing would just make it lag behind the finger.
   */
  const dragStyle = (
    axis: "x" | "y",
    variable: string,
    lifted: boolean,
    shift: number | null,
    settling: boolean,
  ): React.CSSProperties | undefined => {
    const move = (value: string) =>
      axis === "y" ? `translate3d(0, ${value}, 0)` : `translate3d(${value}, 0, 0)`
    const still = prefersReducedMotion()
    if (lifted) {
      return {
        transform: move(`var(${variable}, 0px)`),
        transition: settling && !still ? reorderTransition : "none",
        willChange: "transform",
      }
    }
    if (shift == null) return undefined
    return { transform: move(`${shift}px`), transition: still ? "none" : reorderTransition }
  }

  // Columns move as a whole: the header and every cell under it carry the same transform, so a
  // dragged column travels as one object rather than a header sliding off its own data.
  const columnIndex = new Map(table.getVisibleLeafColumns().map((column, index) => [column.id, index]))
  const columnDragProps = (id: string) => {
    const state = columnDrag.state
    if (!state) return undefined
    const lifted = state.id === id
    return {
      style: dragStyle("x", "--column-drag", lifted, reorderShift(state, columnIndex.get(id) ?? -1), state.settling),
      // The lifted column has to paint its own surface, or the columns it passes over show
      // through it, and a hairline down each side reads as one body being carried.
      lifted,
    }
  }
  const LIFTED_COLUMN_CELL =
    "relative z-20 bg-inherit shadow-[inset_1px_0_0_0_var(--border),inset_-1px_0_0_0_var(--border)]"

  const leafColumnCount = table.getVisibleLeafColumns().length

  // ── Opening a row ─────────────────────────────────────────────────────────────────────────────
  // The row is the target, but the controls inside it keep their own jobs: the checkbox checks, the
  // menu opens, the link navigates. Only a click that lands on the row itself opens it.
  const openRowOnClick = (row: Row<TData>, event: React.MouseEvent<HTMLElement>) => {
    if (!onRowClick) return
    const element = event.currentTarget
    const target = event.target as Element
    // React bubbles events along the component tree, portals included, so a click in a row's own
    // dropdown menu or dialog arrives here from outside the row's DOM.
    if (!element.contains(target)) return
    const control = target.closest(ROW_CONTROL_SELECTOR)
    if (control && control !== element && element.contains(control)) return
    // Dragging across a cell to copy its text ends in a click as well; that is not a request to open.
    const selection = typeof window !== "undefined" ? window.getSelection() : null
    if (selection && !selection.isCollapsed && element.contains(selection.anchorNode)) return
    onRowClick(row, event)
  }

  // The keyboard twin: Enter on the focused row. Only on the row itself, so Enter on a control
  // inside it (a focused button, the checkbox) stays that control's.
  const openRowOnKey = (row: Row<TData>, event: React.KeyboardEvent<HTMLElement>) => {
    if (!onRowClick || event.key !== "Enter" || event.target !== event.currentTarget) return
    event.preventDefault()
    onRowClick(row, event)
  }

  /** The props that make a record (a table row or a card) openable, when `onRowClick` is set. */
  const openableProps = (row: Row<TData>) =>
    onRowClick && !row.getIsGrouped()
      ? {
          tabIndex: 0,
          onClick: (event: React.MouseEvent<HTMLElement>) => openRowOnClick(row, event),
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => openRowOnKey(row, event),
        }
      : undefined

  const isActiveRow = (row: Row<TData>) => activeRowId != null && row.id === activeRowId

  // A search/filter that came up empty is a different story than a table with no data; default
  // the placeholder to the matching `kind` so "no results" vs "no data yet" reads right. An
  // explicit `emptyState` always wins.
  const isFiltered =
    (searching && globalFilter.trim().length > 0) || columnFilters.length > 0
  const resolvedEmptyState =
    emptyState ?? <DataTableEmpty kind={isFiltered ? "search" : "empty"} />

  // View options (column show/hide) ride along whenever the dropdown is asked for, or implicitly
  // when the layout switch needs somewhere to live. The cards layout only renders when enabled.
  const showViewOptions = viewOptions || enableCardLayout
  const isCards = enableCardLayout && layout === "cards"

  // The toolbar rail shows when explicitly on, or implicitly when it has something to hold.
  const showToolbar =
    toolbar || searchable || hasFilters || toolbarActions != null || showViewOptions

  const tableElement = (
    <Table
      variant={variant}
      density={resolvedDensity}
      striped={striped}
      hoverable={hoverable}
      stickyHeader={stickyHeader}
      // While a drag is in flight the table takes no pointer events: the gesture is tracked on the
      // window from geometry, so nothing needs hit-testing, and this keeps hover fills and link
      // cursors from flickering under the moving row.
      className={cn(isDragging && "pointer-events-none", className)}
      containerProps={{
        ref: containerRef,
        className: containerClassName,
        "aria-busy": loading || undefined,
      }}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta
              const align = meta?.numeric ? "right" : meta?.align
              const canSort = enableSorting && header.column.getCanSort()
              const sorted = header.column.getIsSorted()
              const hasTooltip = meta?.headerTooltip != null && !header.isPlaceholder
              const headerText = header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())
              const tooltip = hasTooltip ? <HeaderTooltip content={meta?.headerTooltip} /> : null

              // The header always reads label · tooltip · sort, with the info icon glued to the
              // right of the label. When a tooltip is present the sort caret can't share the label's
              // <button> (the tooltip trigger is a focusable sibling, and a button may contain no
              // focusable/`tabindex` descendant), so the label button, the icon, and the caret sit as
              // siblings in a `group/sort` row, so the caret tracks the row's hover. Without a tooltip
              // we keep the single-button layout (caret inside, reversed for right-aligned columns).
              let content: React.ReactNode
              if (header.isPlaceholder) {
                content = null
              } else if (canSort && hasTooltip) {
                content = (
                  <span className="group/sort inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "-ml-1 inline-flex h-8 items-center rounded-md pl-1 font-medium",
                        "cursor-pointer outline-none transition-colors duration-fast ease-out",
                        "hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand",
                      )}
                    >
                      {headerText}
                    </button>
                    {tooltip}
                    <SortIndicator state={sorted} />
                  </span>
                )
              } else if (canSort) {
                content = (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "group/sort -mx-1 inline-flex h-8 items-center gap-1.5 rounded-md px-1 font-medium",
                      "cursor-pointer outline-none transition-colors duration-fast ease-out",
                      "hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand",
                      align === "right" && "flex-row-reverse",
                    )}
                  >
                    {headerText}
                    <SortIndicator state={sorted} />
                  </button>
                )
              } else if (hasTooltip) {
                content = (
                  <span className="inline-flex items-center gap-1.5">
                    {headerText}
                    {tooltip}
                  </span>
                )
              } else {
                content = headerText
              }
              // The column's drag handle. It keeps its space at all times and only fades in on
              // hover, so revealing it never nudges anything sideways, and it *trails* the label,
              // beside the sort caret: put in front, its reserved space would indent every header
              // out of line with the cells under it. Mirrored in a right-aligned column, where the
              // header reads the other way.
              const canOrder = canOrderColumn(header.column)
              const headerDrag = columnDragProps(header.column.id)
              if (canOrder) {
                content = (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      align === "right" && "flex-row-reverse",
                    )}
                  >
                    {content}
                    <DataTableGrip
                      axis="columns"
                      data-slot="data-table-column-grip"
                      data-id={header.column.id}
                      label={`Reorder the ${columnLabel(header.column) ?? header.column.id} column`}
                      dragging={columnDrag.state?.id === header.column.id}
                      onGrab={(event) => columnDrag.start(event, header.column.id)}
                      onNudge={(direction) => nudgeColumn(header.column.id, direction)}
                      className={cn(
                        "opacity-0 group-hover/head:opacity-100 group-focus-within/head:opacity-100",
                        // Touch has no hover to reveal it with, so there it simply stays.
                        "pointer-coarse:opacity-100 data-[dragging=true]:opacity-100",
                        align === "right" ? "-ml-1" : "-mr-1",
                      )}
                    />
                  </span>
                )
              }
              return (
                <TableHead
                  key={header.id}
                  align={align}
                  sticky={meta?.sticky}
                  data-column-id={enableColumnOrdering ? header.column.id : undefined}
                  style={headerDrag?.style}
                  className={cn(
                    canOrder && "group/head",
                    // The lifted header paints the table surface for the same reason its cells do:
                    // it travels over its neighbours and must not show them through.
                    headerDrag?.lifted && [LIFTED_COLUMN_CELL, "bg-[var(--table-surface)]"],
                    meta?.className,
                  )}
                >
                  {content}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {loading ? (
          // Skeleton rows mirror the real column layout so the table doesn't reflow when data
          // lands. The whole region is announced via `aria-busy` on the container; the
          // individual Skeletons stay decorative (aria-hidden).
          Array.from({ length: loadingRows }).map((_, rowIndex) => (
            <TableRow key={`skeleton-${rowIndex}`}>
              {table.getVisibleLeafColumns().map((column, colIndex) => {
                const meta = column.columnDef.meta
                const align = meta?.numeric ? "right" : meta?.align
                const drag = columnDragProps(column.id)
                return (
                  <TableCell
                    key={column.id}
                    align={align}
                    sticky={meta?.sticky}
                    style={drag?.style}
                    className={cn(drag?.lifted && LIFTED_COLUMN_CELL, meta?.className)}
                  >
                    <SkeletonCell column={column} index={colIndex} />
                  </TableCell>
                )
              })}
            </TableRow>
          ))
        ) : table.getRowModel().rows.length === 0 ? (
          <TableEmpty colSpan={leafColumnCount} className="h-auto p-0">
            {resolvedEmptyState}
          </TableEmpty>
        ) : (
          table.getRowModel().rows.map((row, rowIndex) => (
            <React.Fragment key={row.id}>
            <TableRow
              selected={row.getIsSelected()}
              current={isActiveRow(row)}
              {...openableProps(row)}
              data-row-id={reorderRows ? row.id : undefined}
              style={
                rowDrag.state
                  ? dragStyle(
                      "y",
                      "--row-drag",
                      rowDrag.state.id === row.id,
                      reorderShift(rowDrag.state, rowIndex),
                      rowDrag.state.settling,
                    )
                  : undefined
              }
              // Group children (depth > 0) only enter the DOM when their group expands: fade and
              // rise them in on mount. Stable row ids mean a re-sort reuses the DOM, so the enter
              // doesn't replay. Top-level/group rows (depth 0) stay put and aren't animated.
              className={cn(
                row.depth > 0 && "animate-stagger-in",
                reorderRows && "group/row",
                // An openable row takes focus as a whole, so its ring is an outline: a <tr> paints
                // no box-shadow of its own (see the lift below). Inset by its own width so the flush
                // `minimal` edges and the scroll box can't clip it.
                onRowClick != null && !row.getIsGrouped() && [
                  "cursor-pointer outline-none",
                  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-brand",
                ],
                // The lifted row rides above the ones making way for it. A drop shadow is not on
                // the table: a <tr>'s shadow paints in the row-background layer, so the next row
                // covers it, and moving it onto the cells puts a seam at every cell boundary
                // (each cell's blur spills over the one painted before it). So the lift is a
                // raised fill plus a hairline along the top edge, both continuous across cells,
                // with the row's own bottom border closing it.
                rowDrag.state?.id === row.id && [
                  "relative z-20",
                  "[&>td]:bg-[color-mix(in_oklab,var(--muted)_60%,var(--table-surface))]",
                  "[&>td]:shadow-[inset_0_1px_0_0_var(--border)]",
                ],
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta
                const align = meta?.numeric ? "right" : meta?.align
                const numeric = meta?.numeric
                // A dragged column travels as one object: this cell carries the same transform as
                // its header, so the data never slides out from under its own label.
                const drag = columnDragProps(cell.column.id)

                // The row's own handle. Rendered from here, not from the column definition, so it
                // reads the live drag state without the column memo churning on every render.
                if (cell.column.id === REORDER_COLUMN_ID) {
                  return (
                    <TableCell key={cell.id} className={meta?.className}>
                      <DataTableGrip
                        axis="rows"
                        data-slot="data-table-row-grip"
                        data-id={row.id}
                        label="Reorder row"
                        locked={rowReorderLock}
                        dragging={rowDrag.state?.id === row.id}
                        onGrab={(event) => rowDrag.start(event, row.id)}
                        onNudge={(direction) => nudgeRow(row.id, direction)}
                        className={cn(
                          "-mx-1 opacity-0",
                          "group-hover/row:opacity-100 group-focus-within/row:opacity-100",
                          "pointer-coarse:opacity-100 data-[dragging=true]:opacity-100",
                        )}
                      />
                    </TableCell>
                  )
                }

                // Grouped cell: the column the rows are grouped by. Render an expand toggle,
                // the group value, and the subtree count.
                if (cell.getIsGrouped()) {
                  return (
                    <TableCell
                      key={cell.id}
                      align={align}
                      sticky={meta?.sticky}
                      style={drag?.style}
                      className={cn("font-medium", drag?.lifted && LIFTED_COLUMN_CELL, meta?.className)}
                    >
                      <button
                        type="button"
                        onClick={row.getToggleExpandedHandler()}
                        aria-label={row.getIsExpanded() ? "Collapse group" : "Expand group"}
                        aria-expanded={row.getIsExpanded()}
                        className="-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 outline-none transition-colors duration-fast ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <CaretRight
                          weight="bold"
                          className={cn(
                            "size-3.5 text-muted-foreground caret-turn",
                            row.getIsExpanded() && "rotate-90",
                          )}
                        />
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        <span className="text-muted-foreground tabular-nums">
                          ({row.subRows.length})
                        </span>
                      </button>
                    </TableCell>
                  )
                }

                // Aggregated cell: a summary for the group row (e.g. sum/avg), if the column
                // defines one. Placeholder cells (grouped-away values) render nothing.
                if (cell.getIsAggregated()) {
                  return (
                    <TableCell
                      key={cell.id}
                      align={align}
                      numeric={numeric}
                      sticky={meta?.sticky}
                      style={drag?.style}
                      className={cn("text-muted-foreground", drag?.lifted && LIFTED_COLUMN_CELL, meta?.className)}
                    >
                      {flexRender(
                        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  )
                }
                if (cell.getIsPlaceholder()) {
                  return (
                    <TableCell
                      key={cell.id}
                      align={align}
                      sticky={meta?.sticky}
                      style={drag?.style}
                      className={cn(drag?.lifted && LIFTED_COLUMN_CELL, meta?.className)}
                    />
                  )
                }

                const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext())
                const tooltip = meta?.cellTooltip?.(cell.getContext())
                return (
                  <TableCell
                    key={cell.id}
                    align={align}
                    numeric={numeric}
                    sticky={meta?.sticky}
                    style={drag?.style}
                    className={cn(drag?.lifted && LIFTED_COLUMN_CELL, meta?.className)}
                  >
                    {tooltip != null ? (
                      <CellTooltip content={tooltip}>{cellContent}</CellTooltip>
                    ) : (
                      cellContent
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
            {showExpander && row.getIsExpanded() && (
              // Full-width detail panel under the expanded row. Tracks the row's selected state so
              // it reads as one unit, and drops the bottom rule (the parent row already drew it).
              <TableRow selected={row.getIsSelected()} className="[&>td]:border-b-0">
                <TableCell colSpan={leafColumnCount} className="p-0">
                  {/* Grid wrapper tweens its single track 0fr→1fr (a real height expand) while the
                      panel fades up; the inner clip hides the overflow mid-tween. One-shot on the
                      row's expand, driven by the motion tokens via --animate-table-reveal. */}
                  <div className="grid animate-table-reveal grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <div className="px-3 py-3">{renderSubRow!(row)}</div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Cards layout: the same rows, the same column cells, re-flowed into a responsive card grid.
  // Loading and empty states mirror the table's so switching layout never changes what's announced.
  const rows = table.getRowModel().rows
  const cardGridClass = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  const cardsElement = loading ? (
    <div data-slot="data-table-cards" aria-busy className={cardGridClass}>
      {Array.from({ length: loadingRows }).map((_, index) => (
        <SkeletonCard key={`skeleton-card-${index}`} />
      ))}
    </div>
  ) : rows.length === 0 ? (
    <div data-slot="data-table-cards" className={cardGridClass}>
      <div className="col-span-full">{resolvedEmptyState}</div>
    </div>
  ) : (
    // The cards cascade in on mount via <Stagger>: on the skeleton→data hand-off, a fresh page,
    // or a switch from the rows layout. Stable row ids mean a re-sort reuses the DOM and doesn't
    // replay (polish).
    <Stagger data-slot="data-table-cards" className={cardGridClass}>
      {rows.map((row) =>
        renderCard ? (
          renderCard(row)
        ) : (
          <DataTableCard
            key={row.id}
            row={row}
            current={isActiveRow(row)}
            openable={openableProps(row)}
          />
        ),
      )}
    </Stagger>
  )

  const contentElement = isCards ? cardsElement : tableElement

  // Infinite scroll replaces paging: when `onLoadMore` is set, a sentinel below the content fetches
  // the next batch and the Pagination toolbar steps aside.
  const infiniteScroll = onLoadMore != null
  const showPagination = enablePagination && !infiniteScroll

  // Bulk-action pill: only when selection is on and a renderer is given. The bar shows once a
  // row is selected, overlaying the table region; `hasSelectionBar` gates the `relative` wrapper
  // that hosts it (and the bare-table guard below).
  const selectedRows = enableRowSelection ? table.getSelectedRowModel().rows : []
  const hasSelectionBar = renderSelectionActions != null
  const showSelectionBar = hasSelectionBar && selectedRows.length > 0

  // Bare table when nothing wraps it: output stays identical to the pre-toolbar/pagination shape.
  // Reordering counts as something to wrap, because its keyboard moves need a live region to
  // announce themselves in and a <table> has nowhere to put one.
  const announceReorder = reorderRows || enableColumnOrdering

  // Inside a DataTableTabs the whole table is the panel the tabs drive, so the tablist's
  // `aria-controls` lands on it and a screen reader hears which view it is in. The panel's `value`
  // follows the active tab: one element whose value changes, never a remount, so the search, sort
  // and selection ride through a switch.
  const inTabPanel = (node: React.ReactElement) =>
    tabValue != null ? (
      <TabsContent value={tabValue} className="min-w-0">
        {node}
      </TabsContent>
    ) : (
      node
    )

  if (!showToolbar && !showPagination && !infiniteScroll && !hasSelectionBar && !announceReorder)
    return inTabPanel(contentElement)

  // Match the toolbar's controls to the TABLE's density rather than the ambient one: the bar
  // imposes it on everything inside (search, filters, view options, the consumer's own actions),
  // so they can't drift apart when the table is given an explicit density.
  const toolbarSize = resolvedDensity === "compact" ? "sm" : "md"

  // The rows-per-page choices always include the size in use, so the select never shows a blank
  // (a `pageSize` of 10 against the default options, or a size restored by `persistKey`).
  const pageSizeChoices = [
    ...new Set([...(pageSizeOptions ?? defaultPageSizeOptions(pageSize)), pagination.pageSize]),
  ].sort((a, b) => a - b)

  return inTabPanel(
    <div className="flex flex-col gap-4">
      {/* A drag has the pointer to follow; an arrow-key move has nothing, so it says where the row
          or column landed. `sr-only` is out of flow, so it never opens a gap in this column. */}
      {announceReorder && (
        <span aria-live="polite" className="sr-only">
          {reorderMessage}
        </span>
      )}
      {showToolbar && (
        <DataTableToolbar size={toolbarSize}>
          {/* Both sections always render so `justify-between` spreads search ⟷ actions even when
              only one side is present. */}
          <DataTableToolbarSection className="flex-wrap">
            {searchable && (
              <DataTableSearch
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                disabled={loading}
              />
            )}
            {filters?.map((field) => (
              <DataTableFacetedFilter
                key={field.columnId}
                column={table.getColumn(field.columnId)}
                title={field.title}
                options={field.options}
              />
            ))}
          </DataTableToolbarSection>
          <DataTableToolbarSection>
            {showViewOptions && (
              <DataTableViewOptions
                table={table}
                layout={layout}
                onLayoutChange={setLayout}
                enableLayout={enableCardLayout}
              />
            )}
            {toolbarActions}
          </DataTableToolbarSection>
        </DataTableToolbar>
      )}
      {hasFilters && <DataTableActiveFilters table={table} filters={filters!} />}
      {hasSelectionBar ? (
        // The table region is the positioning context for the floating bulk-action pill, so the
        // pill overlays the last rows out of flow: raising or dismissing it never shifts the
        // toolbar above or the pagination below.
        <div className="relative">
          {contentElement}
          {showSelectionBar && (
            <DataTableSelectionBar
              count={selectedRows.length}
              onClear={() => table.resetRowSelection()}
            >
              {renderSelectionActions!(selectedRows, table)}
            </DataTableSelectionBar>
          )}
        </div>
      ) : (
        contentElement
      )}
      {infiniteScroll && (
        <LoadMoreSentinel
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      )}
      {showPagination && (
        // Client-side paging: the Pagination toolbar drives TanStack's pagination state, which
        // slices the row model. Disabled while loading so you can't page an empty skeleton.
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
          onPageChange={(p) => table.setPageIndex(p - 1)}
          rowsPerPage={table.getState().pagination.pageSize}
          onRowsPerPageChange={(rows) => table.setPageSize(rows)}
          rowsPerPageOptions={pageSizeChoices}
          disabled={loading}
          density={resolvedDensity}
          showRowsPerPage
        />
      )}
    </div>,
  )
}

/** Per-column loading placeholder. The select column gets a checkbox-sized square; numeric
 *  columns a short right-aligned bar; text columns a bar whose width varies by column so the
 *  skeleton reads as data, not a grid of identical blocks. */
const SKELETON_WIDTHS = ["w-28", "w-20", "w-32", "w-24"] as const

function SkeletonCell<TData>({ column, index }: { column: Column<TData>; index: number }) {
  const meta = column.columnDef.meta
  // The utility rails (grip, expander) hold no data, so they hold no placeholder either: a bar
  // there would promise a value that never arrives.
  if (column.id === REORDER_COLUMN_ID || column.id === EXPAND_COLUMN_ID) return null
  if (column.id === SELECT_COLUMN_ID) {
    return <Skeleton className="size-4 rounded-[0.3rem]" />
  }
  if (meta?.numeric) {
    return <Skeleton variant="text" className="ml-auto w-12" />
  }
  return <Skeleton variant="text" className={SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]} />
}

/** Default card for the cards layout. Re-flows a row's cells: the selection checkbox and first
 *  column lead the header, an icon-only action column (no label) sits top-right, and the remaining
 *  labelled columns stack as `label: value` fields. Override the whole card with `renderCard`. */
function DataTableCard<TData>({
  row,
  current = false,
  openable,
  className,
  style,
}: {
  row: Row<TData>
  /** The card is the open record (`activeRowId`). */
  current?: boolean
  /** Focus + click + Enter wiring when the table has `onRowClick`. */
  openable?: Pick<React.ComponentProps<"div">, "tabIndex" | "onClick" | "onKeyDown">
  // Forwarded to the Card root so a wrapping <Stagger> can attach its entrance class + delay.
  className?: string
  style?: React.CSSProperties
}) {
  const cells = row.getVisibleCells()
  const selectCell = cells.find((cell) => cell.column.id === SELECT_COLUMN_ID)
  const dataCells = cells.filter((cell) => !UTILITY_COLUMN_IDS.has(cell.column.id))
  const [primaryCell, ...restCells] = dataCells
  // Columns with no label (e.g. an icon-only actions column) become header actions, not fields.
  const fieldCells = restCells.filter((cell) => columnLabel(cell.column) !== undefined)
  const actionCells = restCells.filter((cell) => columnLabel(cell.column) === undefined)

  return (
    <Card
      data-state={row.getIsSelected() ? "selected" : undefined}
      aria-current={current ? "true" : undefined}
      {...openable}
      style={style}
      className={cn(
        // Card's edge is a ring, not a border, so the selected state thickens and tints that same
        // ring (2px brand, the weight the old border + ring pair drew). Transition the shadow it is.
        "transition-shadow duration-fast ease-out data-[state=selected]:ring-2 data-[state=selected]:ring-brand",
        // The open record takes the same brand tint as a current table row (a tint is colour, not
        // elevation, so an in-flow card may carry it).
        "aria-[current=true]:bg-[color-mix(in_oklab,var(--brand)_8%,var(--surface,var(--background)))]",
        // Openable: the ring already means "selected", so focus draws an outline, offset clear of it.
        openable && [
          "cursor-pointer outline-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand",
        ],
        className,
      )}
    >
      <CardHeader>
        <div className="flex min-w-0 items-center gap-3">
          {selectCell && flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
          {primaryCell && (
            <div className="min-w-0">
              {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
            </div>
          )}
        </div>
        {actionCells.length > 0 && (
          <CardAction>
            {actionCells.map((cell) => (
              <React.Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </React.Fragment>
            ))}
          </CardAction>
        )}
      </CardHeader>
      {fieldCells.length > 0 && (
        <CardContent className="flex flex-col gap-2 text-sm">
          {fieldCells.map((cell) => (
            <div key={cell.id} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{columnLabel(cell.column)}</span>
              <span
                className={cn(
                  "text-right",
                  cell.column.columnDef.meta?.numeric && "tabular-nums",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

/** Loading placeholder for the cards layout: mirrors the default card's shape (avatar + two lines
 *  in the header, a few labelled rows) so the grid doesn't reflow when data lands. */
function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton variant="text" className="w-24" />
            <Skeleton variant="text" className="w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton variant="text" className="w-16" />
            <Skeleton variant="text" className="w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Nearest scrollable ancestor of `node`, or `null` (meaning the viewport) if none. Lets the
 *  load-more sentinel observe whichever element actually scrolls: a capped container the consumer
 *  wrapped the table in, or the page itself. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
      return el
    }
    el = el.parentElement
  }
  return null
}

/** Infinite-scroll sentinel. Sits below the content and calls `onLoadMore` when it scrolls into
 *  view (prefetching ~200px early) as long as there's more to load and nothing's already in flight.
 *  Reads live props from a ref so the IntersectionObserver is set up once and never churns. */
function LoadMoreSentinel({
  onLoadMore,
  hasMore,
  loadingMore,
}: {
  onLoadMore: () => void
  hasMore: boolean
  loadingMore: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  // Keep the latest callback + flags in a ref so the observer (set up once) always reads current
  // values without re-subscribing. Updated in an effect, never mutated during render.
  const stateRef = React.useRef({ onLoadMore, hasMore, loadingMore })
  React.useEffect(() => {
    stateRef.current = { onLoadMore, hasMore, loadingMore }
  })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const state = stateRef.current
        if (entries[0]?.isIntersecting && state.hasMore && !state.loadingMore) {
          state.onLoadMore()
        }
      },
      { root: getScrollParent(el), rootMargin: "0px 0px 200px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-live="polite"
      className="flex min-h-2 items-center justify-center py-2 text-sm text-muted-foreground"
    >
      {loadingMore && (
        <span className="inline-flex items-center gap-2">
          <Spinner aria-hidden size="md" />
          Loading more…
        </span>
      )}
    </div>
  )
}

/** Info affordance after a column header (`meta.headerTooltip`). A focusable, decorative trigger:
 *  the header label already names the column, so this only surfaces the extra hint. `cursor-help`
 *  signals "explanatory", not "actionable". */
function HeaderTooltip({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        aria-label="More information"
        className="inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground/70 outline-none transition-colors duration-fast ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Info weight="bold" className="size-3.5" />
      </button>
    </Tooltip>
  )
}

/** Wraps a cell's content in a tooltip (`meta.cellTooltip`). The trigger is a focusable, layout-
 *  transparent block (see below) that never fights the column width: a cell that clamps itself
 *  (`max-w-* truncate`) still truncates, and the tooltip carries the full value. `cursor-help` marks
 *  it as explanatory; the hint is reachable by keyboard, not just hover. */
function CellTooltip({
  content,
  children,
}: {
  content: React.ReactNode
  children: React.ReactNode
}) {
  // A `block`, so it fills the cell's content box exactly as the cell's own content would: a
  // full-width child (a Progress, a sparkline) keeps the column's width instead of collapsing to
  // nothing inside a shrink-to-fit box, text keeps the cell's alignment, and a `truncate` child
  // still clamps. The hint answers anywhere over the cell's content.
  return (
    <Tooltip content={content}>
      <span
        tabIndex={0}
        data-slot="data-table-cell-tooltip"
        className="block cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {children}
      </span>
    </Tooltip>
  )
}

/**
 * Sort affordance: a muted up/down caret when unsorted, a solid directional caret when active.
 *
 * asc and desc are ONE glyph that TURNS, not two glyphs swapped: they are the same mark pointing
 * two ways, so a rotation reads as the direction flipping where a swap read as a substitution
 * (#7). The unsorted leg keeps its own glyph on purpose - CaretUpDown is a third state
 * ("sortable, currently unsorted"), not a direction, so it has nothing to rotate from.
 */
function SortIndicator({ state }: { state: false | "asc" | "desc" }) {
  if (state)
    return (
      <CaretDown
        weight="bold"
        className={cn("size-3.5 caret-turn", state === "asc" && "rotate-180")}
      />
    )
  return (
    <CaretUpDown
      weight="bold"
      className="size-3.5 text-muted-foreground/60 transition-colors duration-fast ease-out group-hover/sort:text-muted-foreground"
    />
  )
}

export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  GroupingState,
  TanstackTable,
  VisibilityState,
}
