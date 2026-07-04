import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ShowcaseDemo,
  ToolbarDemo,
  CustomToolbarDemo,
  ViewOptionsDemo,
  FacetedFilterDemo,
  PersistenceDemo,
  InfiniteScrollDemo,
  CellTypesDemo,
  ColumnTooltipsDemo,
  ContainerDemo,
  DefaultInSectionDemo,
  StripedDemo,
  DensityDemo,
  SortingDemo,
  GroupingDemo,
  ExpandableRowDemo,
  SelectionDemo,
  BulkActionsDemo,
  StickyHeaderDemo,
  StickyColumnDemo,
  PaginationDemo,
  ServerSideDemo,
  LoadingDemo,
  EmptyDemo,
  NoResultsDemo,
  PrimitivesDemo,
  CheckboxDemo,
} from "./data-table-examples-demo"

export const metadata = { title: "Data Table" }

export default function DataTableDocsPage() {
  return (
    <>
      <DocHeader
        title="Data Table"
        description="A data grid built on TanStack Table for behavior (sorting, grouping, row selection, column pinning) with Koala styling on top. Use the DataTable to drive features from column defs, or compose the styled primitives directly for static tables."
      />

      <ComponentPreview previewClassName="block" code={SHOWCASE_CODE}>
        <ShowcaseDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="data-table"
          dependencies="npm install @tanstack/react-table radix-ui tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          Koala splits the two concerns the way TanStack does. The{" "}
          <code className="font-mono text-sm">Table</code> primitives own the look; TanStack
          owns the behavior. <code className="font-mono text-sm">DataTable</code> wires them
          together: hand it <code className="font-mono text-sm">columns</code> and{" "}
          <code className="font-mono text-sm">data</code>, flip on the features you want, and
          ride alignment and pinning along on each column&rsquo;s{" "}
          <code className="font-mono text-sm">meta</code>.
        </p>
        <CodeSnippet filename="members-table.tsx" className="mt-4" collapsible code={USAGE_CODE} />
      </DocSection>

      <DocSection title="Container">
        <p className="mt-4 text-pretty text-muted-foreground">
          The table is chromeless by default (no border, radius, or fill, with the edge cells
          pulled flush) so it reads as lined records and drops into whatever already frames it.
          That is the <code className="font-mono text-sm">minimal</code> surface you see throughout
          this page. When the table needs to stand on its own, set{" "}
          <code className="font-mono text-sm">variant=&quot;container&quot;</code> to wrap it in the
          bordered, rounded card. Striping, hover, and pinned columns rebase onto each surface
          automatically, so every feature keeps working either way.
        </p>
        <ComponentPreview previewClassName="block" code={CONTAINER_CODE}>
          <ContainerDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          Left at its default, the table drops straight into the page section it belongs to (a
          settings panel, a dashboard block) sitting on the page surface with only its own row
          rules, no box stacked around content that&rsquo;s already laid out. The minimal surface
          renders on the page background; for a distinct surface, reach for{" "}
          <code className="font-mono text-sm">variant=&quot;container&quot;</code>.
        </p>
        <ComponentPreview previewClassName="block" code={DEFAULT_IN_SECTION_CODE}>
          <DefaultInSectionDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Toolbar">
        <p className="mt-4 text-pretty text-muted-foreground">
          The control rail above the table is built in and toggled with simple booleans, no
          wiring. <code className="font-mono text-sm">searchable</code> adds a search box that
          filters every column (TanStack&rsquo;s global filter), and{" "}
          <code className="font-mono text-sm">toolbarActions</code> is a right-side slot for your
          own buttons (filter, export, a primary action). The search and any icon buttons are Koala
          natives (<a href="/docs/components/input" className="underline underline-offset-4">Input</a>{" "}
          and <a href="/docs/components/button" className="underline underline-offset-4">Button</a>),
          so they share the system&rsquo;s focus rings, density, and press feedback.
        </p>
        <ComponentPreview previewClassName="block" code={TOOLBAR_CODE}>
          <ToolbarDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          Need a layout the toggles don&rsquo;t cover? The parts:{" "}
          <code className="font-mono text-sm">DataTableToolbar</code>,{" "}
          <code className="font-mono text-sm">DataTableToolbarSection</code>, and{" "}
          <code className="font-mono text-sm">DataTableSearch</code> are exported, so you can
          compose your own rail and drop it above a plain <code className="font-mono text-sm">DataTable</code>.
        </p>
        <ComponentPreview previewClassName="block" code={CUSTOM_TOOLBAR_CODE}>
          <CustomToolbarDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="View options">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">viewOptions</code> adds a{" "}
          <code className="font-mono text-sm">SlidersHorizontal</code> dropdown to the toolbar for
          showing and hiding columns. Every column with a label appears as a checkbox, and the menu
          stays open so you can toggle several at once. Give a column a{" "}
          <code className="font-mono text-sm">meta.label</code> for its name there (a string{" "}
          <code className="font-mono text-sm">header</code> is used as the fallback); the selection
          and icon-only action columns have no label, so they&rsquo;re left out.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">enableCardLayout</code> adds a Rows/Cards switch to the
          same dropdown and renders the rows as a responsive card grid when chosen: the first
          column becomes the card title, the rest stack as labelled fields, and an icon-only action
          rides along top-right. Pass <code className="font-mono text-sm">renderCard</code> to take
          over the card entirely. The cards cascade in on load via the shared{" "}
          <a href="/docs/foundations/motion" className="underline underline-offset-4">Stagger</a>{" "}
          primitive.
        </p>
        <ComponentPreview previewClassName="block" code={VIEW_OPTIONS_CODE}>
          <ViewOptionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Filtering">
        <p className="mt-4 text-pretty text-muted-foreground">
          Beyond the global <code className="font-mono text-sm">searchable</code> box, pass{" "}
          <code className="font-mono text-sm">filters</code> to add per-column faceted filters. Each
          field becomes a multi-select dropdown in the toolbar (with the count of matching rows per
          option) and a removable chip below it; a <code className="font-mono text-sm">Reset</code>{" "}
          clears them all. Filtered columns use the built-in{" "}
          <code className="font-mono text-sm">filterFn: &quot;arrIncludesSome&quot;</code>.
        </p>
        <ComponentPreview previewClassName="block" code={FILTERING_CODE}>
          <FacetedFilterDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          The parts are exported too:{" "}
          <code className="font-mono text-sm">DataTableFacetedFilter</code> and{" "}
          <code className="font-mono text-sm">DataTableActiveFilters</code>, for hand-composed
          toolbars over a table instance you own.
        </p>
      </DocSection>

      <DocSection title="Remembering view state">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass a <code className="font-mono text-sm">persistKey</code> and the table remembers how
          the user left it (which columns are visible, the sort, the rows/cards layout, and the page
          size) by writing them to <code className="font-mono text-sm">localStorage</code> under that
          key. It&rsquo;s SSR-safe: the server renders the defaults and the saved state is applied
          after mount, so hydration stays clean. Hide a column or switch to cards below, then reload
          the page, and it comes back the same.
        </p>
        <ComponentPreview previewClassName="block" code={PERSIST_CODE}>
          <PersistenceDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          Use a key that&rsquo;s unique per table (and per user, if you scope storage that way).
          Persistence is best-effort: unavailable or full storage fails quietly and the table just
          opens at its defaults.
        </p>
      </DocSection>

      <DocSection title="Cell types">
        <p className="mt-4 text-pretty text-muted-foreground">
          A column&rsquo;s <code className="font-mono text-sm">cell</code> renders anything, so a
          row reads like a record rather than a wall of text. Compose the cells from the same DS
          parts you use everywhere else: an avatar beside two-line text
          (<code className="font-mono text-sm">TableCellText</code>), a status{" "}
          <a href="/docs/components/badge" className="underline underline-offset-4">Badge</a>, a row
          of tag chips, a directional trend delta tinted{" "}
          <code className="font-mono text-sm">success</code>/<code className="font-mono text-sm">destructive</code>,
          an inline sparkline built on{" "}
          <a href="/docs/components/chart" className="underline underline-offset-4">Chart</a> in
          sparkline mode, and an overlapping{" "}
          <a href="/docs/components/avatar" className="underline underline-offset-4">Avatar</a> stack
          with a <code className="font-mono text-sm">+N</code> overflow. Numbers right-align with{" "}
          <code className="font-mono text-sm">meta.numeric</code> (it adds{" "}
          <code className="font-mono text-sm">tabular-nums</code>).
        </p>
        <ComponentPreview previewClassName="block" code={CELL_TYPES_CODE}>
          <CellTypesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Column tooltips">
        <p className="mt-4 text-pretty text-muted-foreground">
          Two per-column hints ride along on{" "}
          <code className="font-mono text-sm">meta</code>, both backed by the shared{" "}
          <a href="/docs/components/tooltip" className="underline underline-offset-4">Tooltip</a>.{" "}
          <code className="font-mono text-sm">headerTooltip</code> appends a small info icon after
          the header label, for explaining what a column measures without crowding the title (hover
          the Balance header). <code className="font-mono text-sm">cellTooltip</code> is a function
          given the cell context that returns the hint to show for each cell. Return{" "}
          <code className="font-mono text-sm">null</code> to skip one. It pairs naturally with a
          clamped column: truncate the cell and reveal the full value on hover or focus (hover a
          member name). Both triggers are keyboard-reachable.
        </p>
        <ComponentPreview previewClassName="block" code={COLUMN_TOOLTIPS_CODE}>
          <ColumnTooltipsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sorting">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">enableSorting</code> to make headers
          click-to-sort. The header shows a muted up/down caret until active, then a solid
          directional one. Seed an order with{" "}
          <code className="font-mono text-sm">initialSorting</code>.
        </p>
        <ComponentPreview previewClassName="block" code={SORTING_CODE}>
          <SortingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Row hover">
        <p className="mt-4 text-pretty text-muted-foreground">
          Rows highlight on hover by default: only body rows, never the header. Pass{" "}
          <code className="font-mono text-sm">hoverable={`{false}`}</code> to opt out (the
          striped example below does, so the zebra pattern stays crisp).
        </p>
      </DocSection>

      <DocSection title="Striped rows">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">striped</code> zebra-stripes even rows for
          faster scanning. The stripe is scoped to skip hovered and selected rows, so those
          states always read clearly.
        </p>
        <ComponentPreview previewClassName="block" code={STRIPED_CODE}>
          <StripedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Condensed rows">
        <p className="mt-4 text-pretty text-muted-foreground">
          Density is Koala&rsquo;s cross-cutting spacing axis (see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>
          ). For a table it&rsquo;s the condensed-rows knob:{" "}
          <code className="font-mono text-sm">compact</code> is the dense default;{" "}
          <code className="font-mono text-sm">comfortable</code> is roomier. Set it per-table
          or for a whole subtree with{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview previewClassName="block" code={DENSITY_CODE}>
          <DensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Grouping">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">enableGrouping</code> with an{" "}
          <code className="font-mono text-sm">initialGrouping</code> column collapses rows
          into expandable groups. Give a column an{" "}
          <code className="font-mono text-sm">aggregationFn</code> and{" "}
          <code className="font-mono text-sm">aggregatedCell</code> to summarize each group;
          here the balance column sums per team.
        </p>
        <ComponentPreview previewClassName="block" code={GROUPING_CODE}>
          <GroupingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Expandable rows">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">renderSubRow</code> to reveal a detail panel under
          a row. It prepends a caret toggle column and renders your node full-width beneath the
          expanded row. Limit which rows can expand with{" "}
          <code className="font-mono text-sm">getRowCanExpand</code>.
        </p>
        <ComponentPreview previewClassName="block" code={EXPANDABLE_CODE}>
          <ExpandableRowDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With checkboxes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">enableRowSelection</code> prepends a checkbox
          column with a header &ldquo;select all&rdquo; that goes indeterminate on a partial
          selection. Subscribe with{" "}
          <code className="font-mono text-sm">onRowSelectionChange</code>; pass a stable{" "}
          <code className="font-mono text-sm">getRowId</code> so selection survives re-sorts.
        </p>
        <ComponentPreview previewClassName="block" code={SELECTION_CODE}>
          <SelectionDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          The selection control is the shared{" "}
          <a href="/docs/components/checkbox" className="underline underline-offset-4">Checkbox</a>{" "}
          component, in checked, indeterminate, and disabled states:
        </p>
        <ComponentPreview code={CHECKBOX_CODE}>
          <CheckboxDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Bulk actions">
        <p className="mt-4 text-pretty text-muted-foreground">
          With selection on, pass{" "}
          <code className="font-mono text-sm">renderSelectionActions</code> and a floating pill rises
          while rows are selected: the live count, a clear button, and your actions. It&rsquo;s a
          dark bar (the Figma/Linear look) that reads as one distinct object over the table, and any
          Koala <code className="font-mono text-sm">Button</code> or menu you drop in re-tints to it
          automatically. It overlays the bottom of the table out of flow, so it appears and leaves
          without shifting the toolbar above or anything on the page below. The renderer receives the
          selected rows and the table instance, so an action can read the selection and reset it.
          Select a couple of rows below.
        </p>
        <ComponentPreview previewClassName="block" code={BULK_ACTIONS_CODE}>
          <BulkActionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sticky header">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">stickyHeader</code> pins the header while the
          body scrolls. Cap the scroll container&rsquo;s height with{" "}
          <code className="font-mono text-sm">containerClassName</code> (e.g.{" "}
          <code className="font-mono text-sm">max-h-72</code>) to create the scroll.
        </p>
        <ComponentPreview previewClassName="block" code={STICKY_HEADER_CODE}>
          <StickyHeaderDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sticky column">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pin a column to an edge with{" "}
          <code className="font-mono text-sm">meta: {`{ sticky: "left" }`}</code> (or{" "}
          <code className="font-mono text-sm">&quot;right&quot;</code>). It stays put, tracking
          the row&rsquo;s hover and selected background, while the rest scrolls sideways.
        </p>
        <ComponentPreview previewClassName="block" code={STICKY_COLUMN_CODE}>
          <StickyColumnDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Pagination">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">enablePagination</code> pages the rows client-side
          and drops a{" "}
          <a href="/docs/components/pagination" className="underline underline-offset-4">Pagination</a>{" "}
          toolbar below the table: prev/next, a &ldquo;Page X of Y&rdquo; readout, and a
          rows-per-page select. Set the initial page size with{" "}
          <code className="font-mono text-sm">pageSize</code> and the select&rsquo;s choices with{" "}
          <code className="font-mono text-sm">pageSizeOptions</code>. It shares the table&rsquo;s
          density, and pages are disabled while <code className="font-mono text-sm">loading</code>.
        </p>
        <ComponentPreview previewClassName="block" code={PAGINATION_CODE}>
          <PaginationDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Load on scroll">
        <p className="mt-4 text-pretty text-muted-foreground">
          For server-driven lists, swap paging for infinite scroll: pass{" "}
          <code className="font-mono text-sm">onLoadMore</code> and a{" "}
          <code className="font-mono text-sm">hasMore</code> flag, and the table fetches the next
          batch as a sentinel scrolls into view (prefetching ~200px early). Flip{" "}
          <code className="font-mono text-sm">loadingMore</code> while the request is in flight; it
          shows a loading row and blocks duplicate calls. You fetch and append to{" "}
          <code className="font-mono text-sm">data</code>; the sentinel watches the nearest scroll
          container (here a capped <code className="font-mono text-sm">max-h</code> wrapper) or the
          viewport. It replaces the pagination toolbar; the two are mutually exclusive.
        </p>
        <ComponentPreview previewClassName="block" code={INFINITE_SCROLL_CODE}>
          <InfiniteScrollDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Server-side data">
        <p className="mt-4 text-pretty text-muted-foreground">
          By default the table sorts, filters, and pages the rows it&rsquo;s given. For large or
          remote datasets, flip the work to the server: set{" "}
          <code className="font-mono text-sm">manualSorting</code>,{" "}
          <code className="font-mono text-sm">manualFiltering</code>, and/or{" "}
          <code className="font-mono text-sm">manualPagination</code>, then fetch on the{" "}
          <code className="font-mono text-sm">onSortingChange</code> /{" "}
          <code className="font-mono text-sm">onPaginationChange</code> /{" "}
          <code className="font-mono text-sm">onColumnFiltersChange</code> callbacks and feed back the
          current page as <code className="font-mono text-sm">data</code>. Pass{" "}
          <code className="font-mono text-sm">pageCount</code> (or{" "}
          <code className="font-mono text-sm">rowCount</code>) so the pager knows the total. The demo
          simulates a 500ms round-trip per sort and page.
        </p>
        <ComponentPreview previewClassName="block" code={SERVER_SIDE_CODE}>
          <ServerSideDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Loading">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">loading</code> to swap the rows for skeleton
          placeholders while data is in flight. They mirror the real column layout (numeric columns
          get a short right-aligned bar, the select column a checkbox-sized square) so the table
          doesn&rsquo;t reflow when data lands. Tune the count with{" "}
          <code className="font-mono text-sm">loadingRows</code>; the region is announced with{" "}
          <code className="font-mono text-sm">aria-busy</code>.
        </p>
        <ComponentPreview previewClassName="block" code={LOADING_CODE}>
          <LoadingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Empty states">
        <p className="mt-4 text-pretty text-muted-foreground">
          When there are no rows, the table renders{" "}
          <code className="font-mono text-sm">DataTableEmpty</code>, a preset over{" "}
          <a href="/docs/components/empty-state" className="underline underline-offset-4">EmptyState</a>{" "}
          built for the two cases a grid hits. The default is{" "}
          <code className="font-mono text-sm">kind=&quot;empty&quot;</code> (nothing here yet);
          override the <code className="font-mono text-sm">emptyState</code> prop and pass action
          buttons as children.
        </p>
        <ComponentPreview previewClassName="block" code={EMPTY_CODE}>
          <EmptyDemo />
        </ComponentPreview>
        <p className="mt-6 text-pretty text-muted-foreground">
          When a search or filter comes up empty, switch to{" "}
          <code className="font-mono text-sm">kind=&quot;search&quot;</code>: the not-found icon
          and copy, with a &ldquo;clear filters&rdquo; escape hatch. With the built-in{" "}
          <code className="font-mono text-sm">searchable</code> toolbar this happens automatically:
          an active search that matches nothing falls back to the search-empty placeholder.
        </p>
        <ComponentPreview previewClassName="block" code={NO_RESULTS_CODE}>
          <NoResultsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Primitives">
        <p className="mt-4 text-pretty text-muted-foreground">
          For a static or fully bespoke table, skip TanStack and compose the styled primitives
          directly: <code className="font-mono text-sm">Table</code>,{" "}
          <code className="font-mono text-sm">TableHeader</code>,{" "}
          <code className="font-mono text-sm">TableBody</code>,{" "}
          <code className="font-mono text-sm">TableFooter</code>,{" "}
          <code className="font-mono text-sm">TableRow</code>,{" "}
          <code className="font-mono text-sm">TableHead</code>,{" "}
          <code className="font-mono text-sm">TableCell</code>. The same variants (variant,
          striped, hover, density, sticky) apply.
        </p>
        <ComponentPreview previewClassName="block" code={PRIMITIVES_CODE}>
          <PrimitivesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I use DataTable versus composing the Table primitives directly?",
              a: "Reach for DataTable when you need behavior driven from column defs: sorting, grouping, row selection, faceted filters, pagination, or the card layout. For a static or fully bespoke table, skip TanStack and compose Table, TableHeader, TableBody, TableRow, TableHead, and TableCell yourself, which keep the same variant, striped, hover, density, and sticky options.",
            },
            {
              q: "How do I right-align a numeric column and pin one to an edge?",
              a: "Both ride along on a column's meta. Set meta.numeric to right-align the header and cells and apply tabular-nums, and set meta.sticky to 'left' or 'right' to pin a column while the rest scrolls horizontally. Use meta.align for non-numeric center or right alignment.",
            },
            {
              q: "Why does row selection lose its checks after I sort or filter?",
              a: "Selection is keyed by row id, so without a stable key TanStack falls back to the row index and the selection no longer follows the row. Pass a stable getRowId, for example getRowId={(r) => r.id}, and the selection (and grouping) survives re-sorts.",
            },
            {
              q: "How do I build a custom toolbar instead of using the searchable and toolbarActions toggles?",
              a: "Compose the exported parts: DataTableToolbar, DataTableToolbarSection, and DataTableSearch for the rail, plus DataTableFacetedFilter and DataTableActiveFilters for filters. Drop your rail above a plain DataTable when the built-in booleans do not cover the layout you need.",
            },
            {
              q: "Can the toolbar search and icon buttons be reached by keyboard, and are the tooltips accessible?",
              a: "Yes. The search box is the Koala Input and toolbar buttons are the Koala Button, so they share the system focus rings and press feedback. The headerTooltip info icon and cellTooltip wrapper are both focusable triggers, so the hints are reachable by keyboard, not only on hover.",
            },
            {
              q: "Can I use both client-side pagination and infinite scroll at the same time?",
              a: "No, they are mutually exclusive. Setting onLoadMore (with hasMore and loadingMore) enables infinite scroll and replaces the Pagination toolbar that enablePagination would render, so choose one. For remote datasets, flip manualSorting, manualFiltering, or manualPagination and refetch on the matching on*Change callback.",
            },
          ]}
        />
      </DocSection>

    </>
  )
}


/* ------------------------------------------------------------ code blocks --- */

const SHOWCASE_CODE = `// The whole component from booleans + a filter set + an actions slot.
<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableSorting
  enableRowSelection
  searchable
  viewOptions
  enableCardLayout
  enablePagination
  pageSize={8}
  filters={[
    { columnId: "status", title: "Status", options: statusOptions },
  ]}
  renderSelectionActions={(rows, table) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
        <Export /> Export
      </Button>
      <Button variant="destructive" size="sm"><Trash /> Delete</Button>
    </>
  )}
  toolbarActions={
    <>
      <Button variant="outline" iconOnly aria-label="Filter"><FunnelSimple /></Button>
      <Button variant="outline" iconOnly aria-label="Export"><Export /></Button>
      <Button>Register</Button>
    </>
  }
/>`

const FILTERING_CODE = `// Each filtered column uses filterFn: "arrIncludesSome".
const columns = [
  { accessorKey: "status", header: "Status", filterFn: "arrIncludesSome", cell: StatusBadge },
  { accessorKey: "team", header: "Team", filterFn: "arrIncludesSome" },
]

<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  searchable
  filters={[
    {
      columnId: "status",
      title: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Invited", label: "Invited" },
        { value: "Suspended", label: "Suspended" },
      ],
    },
    {
      columnId: "team",
      title: "Team",
      options: [
        { value: "Engineering", label: "Engineering", icon: <UsersThree /> },
        { value: "Design", label: "Design", icon: <UsersThree /> },
        { value: "Marketing", label: "Marketing", icon: <UsersThree /> },
      ],
    },
  ]}
/>`

const EXPANDABLE_CODE = `<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  // Optional: only some rows expand
  getRowCanExpand={(row) => row.original.role !== "Viewer"}
  renderSubRow={(row) => (
    <div className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-3">
      <Field label="Email" value={row.original.email} />
      <Field label="Role" value={row.original.role} />
      <Field label="Team" value={row.original.team} />
    </div>
  )}
/>`

const BULK_ACTIONS_CODE = `<DataTable
  columns={columns}
  data={data}
  getRowId={(r) => r.id}
  enableRowSelection
  // The pill is a dark bar; drop plain Koala Buttons in and they read light on it for free.
  renderSelectionActions={(rows, table) => (
    <>
      {/* Quiet actions: icon-only ghosts (aria-label doubles as the tooltip). */}
      <Button variant="ghost" size="sm" iconOnly aria-label="Assign"><UserPlus /></Button>
      <Button variant="ghost" size="sm" iconOnly aria-label="Add tag"><Tag /></Button>
      <Button variant="ghost" size="sm" iconOnly aria-label="Archive"><Archive /></Button>
      <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
        <Export /> Export
      </Button>
      {/* Overflow menu for the rest. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" iconOnly aria-label="More actions" tooltip={false}>
            <DotsThree />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem><Copy /> Duplicate</DropdownMenuItem>
          <DropdownMenuItem><FolderSimple /> Move to project</DropdownMenuItem>
          <DropdownMenuItem><EnvelopeSimple /> Email selected</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          const ids = new Set(rows.map((r) => r.original.id))
          setData((prev) => prev.filter((m) => !ids.has(m.id)))
          table.resetRowSelection()
        }}
      >
        <Trash /> Delete
      </Button>
    </>
  )}
/>`

const SERVER_SIDE_CODE = `function MembersTable() {
  const [rows, setRows] = useState(() => fetchPage({ sorting: [], pageIndex: 0 }))
  const [loading, setLoading] = useState(false)

  async function load(query) {
    setLoading(true)
    const { rows, pageCount } = await fetchPage(query) // your server
    setRows(rows)
    setLoading(false)
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      enableSorting
      enablePagination
      manualSorting
      manualPagination
      pageCount={pageCount}
      loading={loading}
      onSortingChange={(sorting) => load({ sorting, pageIndex: 0 })}
      onPaginationChange={(p) => load({ sorting, pageIndex: p.pageIndex })}
    />
  )
}`

const VIEW_OPTIONS_CODE = `// viewOptions: column show/hide. enableCardLayout: Rows/Cards switch + card grid.
<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableSorting
  searchable
  viewOptions
  enableCardLayout
/>

// Name a column in the menu (and as a card field label):
const columns = [
  { accessorKey: "balance", header: "Balance", meta: { label: "Balance", numeric: true } },
]

// Or take over the card entirely:
<DataTable columns={columns} data={members} enableCardLayout renderCard={(row) => (
  <Card>…</Card>
)} />`

const PERSIST_CODE = `// Remembers visible columns, sort, layout, and page size across reloads.
<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableSorting
  viewOptions
  enableCardLayout
  persistKey="members"
/>`

const INFINITE_SCROLL_CODE = `function MembersTable() {
  const [rows, setRows] = useState(() => fetchPage(0))
  const [loadingMore, setLoadingMore] = useState(false)
  const hasMore = rows.length < total

  async function loadMore() {
    setLoadingMore(true)
    const next = await fetchPage(rows.length)
    setRows((prev) => [...prev, ...next])
    setLoadingMore(false)
  }

  return (
    // The sentinel watches the nearest scroll container (or the viewport).
    <div className="max-h-96 overflow-auto">
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        variant="container"
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  )
}`

const PAGINATION_CODE = `<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enablePagination
  pageSize={8}
  pageSizeOptions={[8, 16, 24, 50, 100]}
/>`

const LOADING_CODE = `<DataTable columns={columns} data={data} loading loadingRows={5} />`

const EMPTY_CODE = `import { DataTable, DataTableEmpty } from "@/components/ui/data-table"

<DataTable
  columns={columns}
  data={[]}
  emptyState={
    <DataTableEmpty>
      <Button size="sm">Register</Button>
    </DataTableEmpty>
  }
/>`

const NO_RESULTS_CODE = `// when a search/filter comes up empty
<DataTable
  columns={columns}
  data={filtered}
  emptyState={
    <DataTableEmpty kind="search">
      <Button size="sm" variant="ghost">Clear filters</Button>
    </DataTableEmpty>
  }
/>`

const TOOLBAR_CODE = `// searchable filters every column; toolbarActions is the right-side slot.
<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableSorting
  searchable
  toolbarActions={
    <>
      <Button variant="outline" iconOnly aria-label="Filter"><FunnelSimple /></Button>
      <Button variant="outline" iconOnly aria-label="Export"><Export /></Button>
      <Button>Register</Button>
    </>
  }
/>`

const CUSTOM_TOOLBAR_CODE = `import {
  DataTable,
  DataTableToolbar,
  DataTableToolbarSection,
  DataTableSearch,
} from "@/components/ui/data-table"

// Compose your own rail, then drop it above a plain DataTable.
<div className="flex flex-col gap-4">
  <DataTableToolbar>
    <DataTableToolbarSection>
      <DataTableSearch />
      <Button variant="outline" iconOnly aria-label="Filter"><FunnelSimple /></Button>
      <Button variant="outline" iconOnly aria-label="Sort"><ArrowsDownUp /></Button>
    </DataTableToolbarSection>
    <DataTableToolbarSection>
      <Button variant="outline" iconOnly aria-label="Export"><Export /></Button>
      <Button>Register</Button>
    </DataTableToolbarSection>
  </DataTableToolbar>

  <DataTable columns={columns} data={members} enableSorting />
</div>`

const USAGE_CODE = `import {
  DataTable,
  TableCellText,
  type ColumnDef,
} from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

type Member = {
  id: string
  name: string
  email: string
  status: "Active" | "Invited" | "Suspended"
  balance: number
}

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <TableCellText primary={row.original.name} secondary={row.original.email} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Badge size="sm">{getValue<string>()}</Badge>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    meta: { numeric: true },
    cell: ({ getValue }) => \`$\${getValue<number>()}\`,
  },
]

export function MembersTable({ data }: { data: Member[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      enableSorting
      enableRowSelection
    />
  )
}`

const CELL_TYPES_CODE = `import { Chart, ChartArea, ChartLine } from "@/components/ui/chart"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Badge variant={statusVariant[getValue<Status>()]} size="sm">{getValue<string>()}</Badge>,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    // First few as chips, the rest rolled into a tooltipped "+N".
    cell: ({ row }) => <TagsCell tags={row.original.tags} />,
  },
  {
    accessorKey: "delta",
    header: "Trend",
    meta: { align: "right" },
    // Arrow + signed % tinted success/destructive, tabular-nums.
    cell: ({ row }) => <TrendCell delta={row.original.delta} />,
  },
  {
    accessorKey: "activity",
    header: "Activity",
    // Chart in sparkline mode; paints in currentColor, so a text-* utility themes it.
    cell: ({ row }) => (
      <Chart data={row.original.activity} sparkline aria-hidden className="h-8 w-24 text-success">
        <ChartArea />
        <ChartLine strokeWidth={2} hideActiveDot />
      </Chart>
    ),
  },
  {
    id: "assignees",
    header: "Assignees",
    // Overlapping avatars with a +N overflow (the canonical Avatar stack).
    cell: ({ row }) => <AssigneesCell people={row.original.assignees} />,
  },
]

<DataTable columns={columns} data={members} getRowId={(r) => r.id} enableSorting />`

const COLUMN_TOOLTIPS_CODE = `const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    // Clamp the cell, then tooltip it with the full value so nothing is lost.
    meta: {
      cellTooltip: ({ row }) => \`\${row.original.name} · \${row.original.email}\`,
    },
    cell: ({ row }) => (
      <span className="block max-w-[12rem] truncate">
        {row.original.name} · {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    // An info icon after the header label reveals this on hover/focus.
    meta: {
      numeric: true,
      headerTooltip: "Outstanding balance for the current billing cycle, in USD.",
    },
    cell: ({ getValue }) => currency.format(getValue<number>()),
  },
]

<DataTable columns={columns} data={members} getRowId={(r) => r.id} enableSorting />`

const SORTING_CODE = `<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableSorting
  initialSorting={[{ id: "balance", desc: true }]}
/>`

const CONTAINER_CODE = `// "minimal" (default, chromeless + flush) or "container" (bordered card)
<DataTable columns={columns} data={members} variant="container" enableSorting />`

const DEFAULT_IN_SECTION_CODE = `// Default (minimal) dropped straight into a page section: no box of its own.
<section>
  <h3 className="font-semibold">Team members</h3>
  <p className="text-sm text-muted-foreground">People with access to this workspace.</p>
  <DataTable columns={columns} data={members} className="mt-4" />
</section>`

const STRIPED_CODE = `<DataTable columns={columns} data={members} striped hoverable={false} />`

const DENSITY_CODE = `// "compact" (condensed, the default) or "comfortable"
<DataTable columns={columns} data={members} density="compact" />`

const GROUPING_CODE = `const columns: ColumnDef<Member>[] = [
  { accessorKey: "team", header: "Team" },
  { accessorKey: "name", header: "Member", aggregatedCell: () => null },
  {
    accessorKey: "balance",
    header: "Balance",
    meta: { numeric: true },
    aggregationFn: "sum",
    cell: ({ getValue }) => format(getValue<number>()),
    aggregatedCell: ({ getValue }) => format(getValue<number>()),
  },
]

<DataTable
  columns={columns}
  data={members}
  enableGrouping
  initialGrouping={["team"]}
/>`

const SELECTION_CODE = `const [selection, setSelection] = useState({})

<DataTable
  columns={columns}
  data={members}
  getRowId={(r) => r.id}
  enableRowSelection
  onRowSelectionChange={setSelection}
/>`

const CHECKBOX_CODE = `<Checkbox checked onCheckedChange={...} />
<Checkbox checked="indeterminate" />
<Checkbox checked={false} />
<Checkbox checked disabled />`

const STICKY_HEADER_CODE = `<DataTable
  columns={columns}
  data={rows}
  stickyHeader
  containerClassName="max-h-72"
/>`

const STICKY_COLUMN_CODE = `const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    meta: { sticky: "left" }, // pinned while the rest scrolls sideways
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  { accessorKey: "team", header: "Team" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status", cell: /* Badge */ },
  { accessorKey: "tags", header: "Tags", cell: /* chips */ },
  { accessorKey: "delta", header: "Trend", cell: /* trend */ },
  { accessorKey: "activity", header: "Activity", cell: /* sparkline */ },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "balance", header: "Balance", meta: { numeric: true } },
]

// The table is wider than its container, so the un-pinned columns scroll under the pinned one.
<DataTable columns={columns} data={members} className="min-w-[72rem]" />`

const PRIMITIVES_CODE = `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Member</TableHead>
      <TableHead>Status</TableHead>
      <TableHead align="right">Balance</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {members.map((m) => (
      <TableRow key={m.id}>
        <TableCell>
          <TableCellText primary={m.name} secondary={m.email} />
        </TableCell>
        <TableCell><Badge size="sm">{m.status}</Badge></TableCell>
        <TableCell numeric>{format(m.balance)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell numeric>{format(total)}</TableCell>
    </TableRow>
  </TableFooter>
</Table>`
