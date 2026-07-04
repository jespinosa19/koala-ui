"use client"

import * as React from "react"
import {
  DotsThreeVertical,
  DotsThree,
  FunnelSimple,
  ArrowsDownUp,
  Export,
  Trash,
  EnvelopeSimple,
  IdentificationBadge,
  UsersThree,
  UserPlus,
  Tag,
  Archive,
  Copy,
  FolderSimple,
  TrendUp,
  TrendDown,
  Minus,
} from "@phosphor-icons/react"

import { Avatar, AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BadgeGroup } from "@/components/ui/badge-group"
import { Chart, ChartArea, ChartLine } from "@/components/ui/chart"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  type ColumnDef,
  type SortingState,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCellText,
  DataTableToolbar,
  DataTableToolbarSection,
  DataTableSearch,
  DataTableEmpty,
} from "@/components/ui/data-table"

/* ------------------------------------------------------------------ data --- */

type Status = "Active" | "Invited" | "Suspended"

interface Collaborator {
  img: number
  name: string
}

interface Member {
  id: string
  name: string
  email: string
  avatar?: string
  role: "Owner" | "Admin" | "Member" | "Viewer"
  team: "Engineering" | "Design" | "Marketing"
  status: Status
  balance: number
  /** Skill/label chips for the tags cell. */
  tags: string[]
  /** Period-over-period change (%) for the trend cell. */
  delta: number
  /** Recent activity series for the inline sparkline cell. */
  activity: number[]
  /** Overlapping assignees for the avatar-stack cell. */
  assignees: Collaborator[]
}

const members: Member[] = [
  { id: "1", name: "Aria Montgomery", email: "aria@koala.dev", avatar: "https://i.pravatar.cc/160?img=1", role: "Owner", team: "Engineering", status: "Active", balance: 4820, tags: ["React", "Infra", "Design Systems"], delta: 12.4, activity: [3, 5, 4, 7, 6, 9, 12], assignees: [{ img: 12, name: "Esteban Alonso" }, { img: 5, name: "Marie Dubois" }, { img: 32, name: "Liam Chen" }] },
  { id: "2", name: "Bruno Vasquez", email: "bruno@koala.dev", avatar: "https://i.pravatar.cc/160?img=3", role: "Admin", team: "Engineering", status: "Active", balance: 1290, tags: ["Node", "DevOps"], delta: 4.1, activity: [8, 6, 7, 5, 6, 7, 8], assignees: [{ img: 47, name: "Sofia Rossi" }, { img: 12, name: "Esteban Alonso" }] },
  { id: "3", name: "Cleo Nakamura", email: "cleo@koala.dev", avatar: "https://i.pravatar.cc/160?img=9", role: "Member", team: "Design", status: "Invited", balance: 0, tags: ["Figma", "Brand", "Motion", "Research"], delta: 0, activity: [4, 4, 5, 4, 4, 3, 4], assignees: [{ img: 5, name: "Marie Dubois" }] },
  { id: "4", name: "Dario Field", email: "dario@koala.dev", avatar: "https://i.pravatar.cc/160?img=13", role: "Member", team: "Design", status: "Active", balance: 760, tags: ["Illustration"], delta: -3.2, activity: [9, 8, 7, 6, 5, 5, 4], assignees: [{ img: 32, name: "Liam Chen" }, { img: 47, name: "Sofia Rossi" }, { img: 5, name: "Marie Dubois" }, { img: 12, name: "Esteban Alonso" }] },
  { id: "5", name: "Esme Holloway", email: "esme@koala.dev", avatar: "https://i.pravatar.cc/160?img=16", role: "Viewer", team: "Marketing", status: "Suspended", balance: -120, tags: ["SEO", "Content"], delta: -8.7, activity: [6, 5, 6, 4, 3, 3, 2], assignees: [{ img: 47, name: "Sofia Rossi" }] },
  { id: "6", name: "Finn Albrecht", email: "finn@koala.dev", avatar: "https://i.pravatar.cc/160?img=33", role: "Member", team: "Marketing", status: "Active", balance: 3410, tags: ["Ads", "Analytics", "Lifecycle"], delta: 21.9, activity: [2, 4, 3, 6, 8, 10, 13], assignees: [{ img: 12, name: "Esteban Alonso" }, { img: 32, name: "Liam Chen" }, { img: 5, name: "Marie Dubois" }] },
]

// A larger set so paging has somewhere to go: the six members cloned across pages with
// unique ids/emails and lightly varied balances.
const manyMembers: Member[] = Array.from({ length: 24 }, (_, i) => {
  const base = members[i % members.length]
  return {
    ...base,
    id: `m${i + 1}`,
    email: `${base.email.split("@")[0]}${i + 1}@koala.dev`,
    balance: base.balance + i * 35,
  }
})

// A page of cloned members starting at `start`: stands in for a server fetch in the infinite
// scroll demo.
const makeInfiniteRows = (start: number, count: number): Member[] =>
  Array.from({ length: count }, (_, i) => {
    const index = start + i
    const base = members[index % members.length]
    return {
      ...base,
      id: `inf-${index}`,
      email: `${base.email.split("@")[0]}${index + 1}@koala.dev`,
      balance: base.balance + index * 25,
    }
  })

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const statusVariant: Record<Status, React.ComponentProps<typeof Badge>["variant"]> = {
  Active: "success",
  Invited: "secondary",
  Suspended: "destructive",
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

/* --------------------------------------------------------- cell renderers --- */

function MemberCell({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      <AvatarRoot size="sm">
        {member.avatar && <AvatarImage src={member.avatar} alt="" />}
        <AvatarFallback>{initials(member.name)}</AvatarFallback>
      </AvatarRoot>
      <TableCellText primary={member.name} secondary={member.email} />
    </div>
  )
}

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" iconOnly aria-label="Row actions" tooltip={false}>
          <DotsThreeVertical weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View profile</DropdownMenuItem>
        <DropdownMenuItem>Edit role</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Tags cell: a row of label chips via the shared `BadgeGroup`. Past `max` they collapse into a
 *  `+N` chip that reveals the full list in a tooltip, so a long tag set never blows out the column. */
function TagsCell({ tags, max = 2 }: { tags: string[]; max?: number }) {
  return (
    <BadgeGroup max={max}>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" size="sm">
          {tag}
        </Badge>
      ))}
    </BadgeGroup>
  )
}

/** Trend cell: a directional delta. An arrow + signed percentage tinted success/destructive (flat
 *  is muted), `tabular-nums` so the figures align down the column. The trend chip lives inside
 *  Stat (it reads Stat context); a table cell wants this lighter inline form. */
function TrendCell({ delta }: { delta: number }) {
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "neutral"
  const Arrow = direction === "up" ? TrendUp : direction === "down" ? TrendDown : Minus
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        direction === "up" && "text-success",
        direction === "down" && "text-destructive",
        direction === "neutral" && "text-muted-foreground",
      )}
    >
      <Arrow weight="bold" className="size-3.5" />
      {delta > 0 ? "+" : ""}
      {delta.toFixed(1)}%
    </span>
  )
}

/** Activity cell: an inline sparkline built on the shared `Chart` in `sparkline` mode. It paints
 *  in `currentColor`, so a `text-*` utility themes it; here it tracks the trend direction. Marked
 *  decorative, as the figure it summarizes already reads elsewhere in the row. */
function ActivityCell({ data, delta }: { data: number[]; delta: number }) {
  return (
    <Chart
      data={data}
      sparkline
      aria-hidden
      className={cn(
        "h-8 w-24",
        delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <ChartArea />
      <ChartLine strokeWidth={2} hideActiveDot />
    </Chart>
  )
}

/** Avatar-stack cell: overlapping assignees with a `+N` overflow, the canonical stack from the
 *  Avatar docs. Each avatar rings the surface to read as separated; hover lifts it clear. */
const stackAvatar =
  "ring-2 ring-background transition duration-fast ease-out hover:z-10 hover:-translate-y-0.5"

function AssigneesCell({ people, max = 3 }: { people: Collaborator[]; max?: number }) {
  const shown = people.slice(0, max)
  const overflow = people.slice(max)
  return (
    <div className="flex -space-x-2.5">
      {shown.map(({ img, name }) => (
        <Tooltip key={img} content={name}>
          <Avatar size="sm" className={stackAvatar}>
            <AvatarImage src={`https://i.pravatar.cc/160?img=${img}`} alt={name} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </Tooltip>
      ))}
      {overflow.length > 0 && (
        <Tooltip
          content={
            <ul className="flex flex-col gap-0.5 py-0.5 text-left">
              {overflow.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          }
        >
          <Avatar size="sm" className={stackAvatar}>
            <AvatarFallback className="tabular-nums">+{overflow.length}</AvatarFallback>
          </Avatar>
        </Tooltip>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- columns --- */

const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    // `arrIncludesSome` (built-in) matches a row against the array of values a faceted filter writes.
    filterFn: "arrIncludesSome",
    cell: ({ getValue }) => {
      const status = getValue<Status>()
      return (
        <Badge variant={statusVariant[status]} size="sm">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    meta: { numeric: true },
    cell: ({ getValue }) => currency.format(getValue<number>()),
  },
  {
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: () => <RowActions />,
  },
]

// A wide column set that puts every cell type on display at once: avatar + two-line text, a status
// Badge, a row of tag chips, a tinted trend delta, an inline sparkline, and an avatar stack.
const cellTypeColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Status>()
      return (
        <Badge variant={statusVariant[status]} size="sm">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    enableSorting: false,
    cell: ({ row }) => <TagsCell tags={row.original.tags} />,
  },
  {
    accessorKey: "delta",
    header: "Trend",
    meta: { align: "right" },
    cell: ({ row }) => <TrendCell delta={row.original.delta} />,
  },
  {
    accessorKey: "activity",
    header: "Activity",
    enableSorting: false,
    cell: ({ row }) => <ActivityCell data={row.original.activity} delta={row.original.delta} />,
  },
  {
    id: "assignees",
    header: "Assignees",
    meta: { label: "Assignees" },
    cell: ({ row }) => <AssigneesCell people={row.original.assignees} />,
  },
]

// Columns that lean on per-column tooltips: an info hint on a header that needs explaining
// (`meta.headerTooltip`), and a per-cell hint that reveals the full value of a clamped column
// (`meta.cellTooltip`).
const tooltipColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    // Clamp the member + email to a narrow column, then tooltip each cell with the full value so
    // nothing is lost to the truncation.
    meta: {
      cellTooltip: ({ row }) => `${row.original.name} · ${row.original.email}`,
    },
    cell: ({ row }) => (
      <span className="block max-w-[12rem] truncate">
        {row.original.name} · {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    // The header carries an info icon explaining what the figure means.
    meta: {
      numeric: true,
      headerTooltip: "Outstanding balance for the current billing cycle, in USD.",
    },
    cell: ({ getValue }) => currency.format(getValue<number>()),
  },
]

/* ============================================================== demos === */

/** Action buttons for the toolbar's right slot, shared by the toolbar/showcase demos. All
 *  Koala-native Buttons; the icon-only ones get tooltips from their `aria-label`. */
function ToolbarActions() {
  return (
    <>
      <Button variant="outline" iconOnly aria-label="Filter">
        <FunnelSimple weight="bold" />
      </Button>
      <Button variant="outline" iconOnly aria-label="Export">
        <Export weight="bold" />
      </Button>
      <Button>Register</Button>
    </>
  )
}

/** Toolbar: built into the table with simple toggles. `searchable` adds a column-filtering
 *  search box, `toolbarActions` is the right-side slot for your buttons. */
export function ToolbarDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      searchable
      className="min-w-[34rem]"
      toolbarActions={<ToolbarActions />}
    />
  )
}

/** A hand-composed toolbar for layouts the toggles don't cover. The parts are exported
 *  (`DataTableToolbar`, `DataTableToolbarSection`, `DataTableSearch`) so you can arrange them
 *  freely. Here filter/sort sit next to the search on the left. */
export function CustomToolbarDemo() {
  return (
    <DataTableToolbar>
      <DataTableToolbarSection>
        <DataTableSearch />
        <Button variant="outline" iconOnly aria-label="Filter">
          <FunnelSimple weight="bold" />
        </Button>
        <Button variant="outline" iconOnly aria-label="Sort">
          <ArrowsDownUp weight="bold" />
        </Button>
      </DataTableToolbarSection>
      <DataTableToolbarSection>
        <Button variant="outline" iconOnly aria-label="Export">
          <Export weight="bold" />
        </Button>
        <Button>Register</Button>
      </DataTableToolbarSection>
    </DataTableToolbar>
  )
}

/** Hero: the whole thing from booleans: a searchable, sortable, paginated table with toolbar
 *  actions and every cell type (avatar+text, muted text, status badge, numeric, row actions). */
export function ShowcaseDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={manyMembers}
      getRowId={(row) => row.id}
      enableSorting
      enableRowSelection
      searchable
      viewOptions
      enableCardLayout
      enablePagination
      pageSize={8}
      pageSizeOptions={[8, 16, 24, 50, 100]}
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
      ]}
      renderSelectionActions={(rows, table) => (
        <>
          <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
            <Export weight="bold" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={() => table.resetRowSelection()}>
            <Trash weight="bold" />
            Delete
          </Button>
        </>
      )}
      className="min-w-[34rem]"
      toolbarActions={<ToolbarActions />}
    />
  )
}

/** View options: the SlidersHorizontal dropdown switches layout (rows ⟷ cards) and shows/hides
 *  columns. Try toggling Role or Balance off, then flip to the cards layout. */
export function ViewOptionsDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      searchable
      viewOptions
      enableCardLayout
      className="min-w-[34rem]"
    />
  )
}

/** Remembering view state: with a `persistKey`, the visible columns, sort, layout, and page size
 *  survive a reload. Hide a column or switch to cards, then refresh the page: it comes back. */
export function PersistenceDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      viewOptions
      enableCardLayout
      persistKey="docs-members"
      className="min-w-[34rem]"
    />
  )
}

/** Pagination: client-side paging with a rows-per-page select. The toolbar drives TanStack's
 *  pagination state, which slices the rows the table renders. */
export function PaginationDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={manyMembers}
      getRowId={(row) => row.id}
      enableSorting
      enablePagination
      pageSize={8}
      pageSizeOptions={[8, 16, 24, 50, 100]}
      className="min-w-[34rem]"
    />
  )
}

/** Infinite scroll: rows load as you scroll near the end instead of paging. The demo simulates a
 *  fetch with a short delay; the table grows until all 48 rows are in. */
export function InfiniteScrollDemo() {
  const PAGE_SIZE = 8
  const TOTAL = 48
  const [rows, setRows] = React.useState<Member[]>(() => makeInfiniteRows(0, PAGE_SIZE))
  const [loadingMore, setLoadingMore] = React.useState(false)
  const hasMore = rows.length < TOTAL
  const handleLoadMore = React.useCallback(() => {
    setLoadingMore(true)
    // Stand-in for a server fetch.
    window.setTimeout(() => {
      setRows((prev) => [...prev, ...makeInfiniteRows(prev.length, PAGE_SIZE)].slice(0, TOTAL))
      setLoadingMore(false)
    }, 700)
  }, [])
  return (
    <div className="max-h-96 w-full overflow-auto">
      <DataTable
        columns={memberColumns}
        data={rows}
        getRowId={(row) => row.id}
        variant="container"
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
        className="min-w-[34rem]"
      />
    </div>
  )
}

/** Loading: skeleton rows stand in while data is in flight, mirroring the real column layout
 *  so nothing reflows when it lands. */
export function LoadingDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={[]}
      loading
      enableSorting
      className="min-w-[34rem]"
    />
  )
}

/** Empty: no data yet. The default placeholder; here with a primary action to add the first row. */
export function EmptyDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={[]}
      enableSorting
      className="min-w-[34rem]"
      emptyState={
        <DataTableEmpty>
          <Button size="sm">Register</Button>
        </DataTableEmpty>
      }
    />
  )
}

/** No results: there is data, but nothing matched the search/filters. `kind="search"` swaps the
 *  icon and copy for the not-found case. */
export function NoResultsDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={[]}
      enableSorting
      className="min-w-[34rem]"
      emptyState={
        <DataTableEmpty kind="search">
          <Button size="sm" variant="ghost">
            Clear filters
          </Button>
        </DataTableEmpty>
      }
    />
  )
}

/** Many cell types in one table: avatar + two-line text, a status Badge, a row of tag chips, a
 *  tinted trend delta, an inline sparkline, and an avatar stack, all composed from DS parts. */
export function CellTypesDemo() {
  return (
    <DataTable
      columns={cellTypeColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      className="min-w-[48rem]"
    />
  )
}

/** Column tooltips: `meta.headerTooltip` adds an info icon after a header label (hover the
 *  Balance header), and `meta.cellTooltip` wraps each cell in a hint (hover a truncated member
 *  name to read the full name and email). */
export function ColumnTooltipsDemo() {
  return (
    <DataTable
      columns={tooltipColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      className="min-w-[34rem]"
    />
  )
}

/** Container: the opt-in bordered, rounded card. For when the table stands on its own rather
 *  than inside something that already frames it. */
export function ContainerDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      variant="container"
      enableSorting
      className="min-w-[34rem]"
    />
  )
}

/** The default (chromeless) in context: dropped straight into a titled page section, the table
 *  sits on the page surface and carries only its own row rules. This is what the minimal default
 *  is for: no box stacked around content that is already laid out. */
export function DefaultInSectionDemo() {
  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-0.5">
        <h3 className="text-balance font-semibold">Team members</h3>
        <p className="text-pretty text-sm text-muted-foreground">
          People with access to this workspace.
        </p>
      </div>
      <DataTable
        columns={memberColumns}
        data={members}
        getRowId={(row) => row.id}
        className="min-w-[34rem]"
      />
    </div>
  )
}

/** Zebra striping for quicker row scanning on wide, dense tables. */
export function StripedDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      striped
      hoverable={false}
      className="min-w-[34rem]"
    />
  )
}

/** Density is the "condensed rows" axis: compact (default) vs the roomier comfortable. */
export function DensityDemo() {
  const [density, setDensity] = React.useState<"compact" | "comfortable">("compact")
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Segmented pill Tabs drive the density: the active pill slides between the two on switch,
          reading as one gesture with the rows easing open/closed below. Centered over the table
          (only the tabs center; the table stays stretched full-width). */}
      <div className="flex justify-center">
        <Tabs
          value={density}
          onValueChange={(value) => setDensity(value as "compact" | "comfortable")}
        >
          <TabsList>
            <TabsTrigger value="compact">Condensed</TabsTrigger>
            <TabsTrigger value="comfortable">Comfortable</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <DataTable
        columns={memberColumns}
        data={members}
        getRowId={(row) => row.id}
        density={density}
        className="min-w-[34rem]"
      />
    </div>
  )
}

/** Click-to-sort headers: a muted up/down caret resolves to a solid directional one. */
export function SortingDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
      initialSorting={[{ id: "balance", desc: true }]}
      className="min-w-[34rem]"
    />
  )
}

/** Group rows under an expandable header, with an aggregated balance per group. */
export function GroupingDemo() {
  const columns = React.useMemo<ColumnDef<Member>[]>(
    () => [
      { accessorKey: "team", header: "Team" },
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => <MemberCell member={row.original} />,
        aggregatedCell: () => null,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant={statusVariant[getValue<Status>()]} size="sm">
            {getValue<Status>()}
          </Badge>
        ),
        aggregatedCell: () => null,
      },
      {
        accessorKey: "balance",
        header: "Balance",
        meta: { numeric: true },
        aggregationFn: "sum",
        cell: ({ getValue }) => currency.format(getValue<number>()),
        aggregatedCell: ({ getValue }) => currency.format(getValue<number>()),
      },
    ],
    [],
  )
  return (
    <DataTable
      columns={columns}
      data={members}
      getRowId={(row) => row.id}
      enableGrouping
      initialGrouping={["team"]}
      className="min-w-[34rem]"
    />
  )
}

/** Row selection with a header "select all", indeterminate state, and a live count. */
export function SelectionDemo() {
  const [selection, setSelection] = React.useState<Record<string, boolean>>({})
  const count = Object.values(selection).filter(Boolean).length
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex h-8 items-center text-sm text-muted-foreground">
        {count > 0 ? (
          <span>
            <span className="font-medium text-foreground tabular-nums">{count}</span> of{" "}
            <span className="tabular-nums">{members.length}</span> selected
          </span>
        ) : (
          <span>Select rows to act on them.</span>
        )}
      </div>
      <DataTable
        columns={memberColumns}
        data={members}
        getRowId={(row) => row.id}
        enableRowSelection
        onRowSelectionChange={setSelection}
        className="min-w-[34rem]"
      />
    </div>
  )
}

/** Sticky header: the header pins to the top while a capped-height body scrolls under it. */
export function StickyHeaderDemo() {
  const rows = React.useMemo(
    () => Array.from({ length: 4 }, (_, i) => members.map((m) => ({ ...m, id: `${m.id}-${i}` }))).flat(),
    [],
  )
  return (
    <DataTable
      columns={memberColumns}
      data={rows}
      getRowId={(row) => row.id}
      stickyHeader
      containerClassName="max-h-72"
      className="min-w-[34rem]"
    />
  )
}

/** Sticky column: pin a column (here the member) to the left while the rest scrolls sideways. The
 *  column set is deliberately wide (`min-w-[72rem]`, wider than the docs preview) so there's always
 *  overflow to scroll: a sticky column only reads as pinned when the rest of the table moves past it. */
export function StickyColumnDemo() {
  const columns = React.useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        meta: { sticky: "left" },
        cell: ({ row }) => <MemberCell member={row.original} />,
      },
      { accessorKey: "team", header: "Team" },
      { accessorKey: "role", header: "Role" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Badge variant={statusVariant[getValue<Status>()]} size="sm">
            {getValue<Status>()}
          </Badge>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        enableSorting: false,
        cell: ({ row }) => <TagsCell tags={row.original.tags} />,
      },
      {
        accessorKey: "delta",
        header: "Trend",
        meta: { align: "right" },
        cell: ({ row }) => <TrendCell delta={row.original.delta} />,
      },
      {
        accessorKey: "activity",
        header: "Activity",
        enableSorting: false,
        cell: ({ row }) => <ActivityCell data={row.original.activity} delta={row.original.delta} />,
      },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> },
      { accessorKey: "balance", header: "Balance", meta: { numeric: true }, cell: ({ getValue }) => currency.format(getValue<number>()) },
    ],
    [],
  )
  return (
    <DataTable
      columns={columns}
      data={members}
      getRowId={(row) => row.id}
      className="min-w-[72rem]"
    />
  )
}

/** Hand-built static table from the primitives (no TanStack), showing a footer total. */
export function PrimitivesDemo() {
  return (
    <Table className="min-w-[28rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.slice(0, 4).map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <TableCellText primary={m.name} secondary={m.email} />
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[m.status]} size="sm">
                {m.status}
              </Badge>
            </TableCell>
            <TableCell numeric>{currency.format(m.balance)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell numeric>
            {currency.format(members.slice(0, 4).reduce((sum, m) => sum + m.balance, 0))}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

/** Standalone selection checkbox preview: the shared Checkbox component the table uses. */
export function CheckboxDemo() {
  const [checked, setChecked] = React.useState<boolean | "indeterminate">("indeterminate")
  return (
    <div className="flex items-center gap-6">
      <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v)} aria-label="Toggle" />
      <Checkbox checked aria-label="Checked" />
      <Checkbox checked="indeterminate" aria-label="Indeterminate" />
      <Checkbox checked={false} aria-label="Unchecked" />
      <Checkbox checked disabled aria-label="Disabled" />
    </div>
  )
}

/* ----------------------------------------------------- columns w/ team --- */

// A column set that surfaces Team so it can be faceted alongside Status.
const filterableColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "team",
    header: "Team",
    filterFn: "arrIncludesSome",
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "arrIncludesSome",
    cell: ({ getValue }) => (
      <Badge variant={statusVariant[getValue<Status>()]} size="sm">
        {getValue<Status>()}
      </Badge>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    meta: { numeric: true },
    cell: ({ getValue }) => currency.format(getValue<number>()),
  },
]

/** Faceted filters: per-column multi-select dropdowns plus removable chips. Each filtered column
 *  uses `filterFn: "arrIncludesSome"`; the dropdown shows the faceted count per option. */
export function FacetedFilterDemo() {
  return (
    <DataTable
      columns={filterableColumns}
      data={members}
      getRowId={(row) => row.id}
      enableSorting
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
            { value: "Engineering", label: "Engineering", icon: <UsersThree weight="bold" /> },
            { value: "Design", label: "Design", icon: <UsersThree weight="bold" /> },
            { value: "Marketing", label: "Marketing", icon: <UsersThree weight="bold" /> },
          ],
        },
      ]}
      className="min-w-[34rem]"
    />
  )
}

/** Bulk actions: selecting rows raises a floating black pill (the Figma/Linear look) with the
 *  count and your actions. Quiet actions ride as icon-only ghost buttons, a three-dots menu holds
 *  the overflow, and Delete is the prominent destructive step. Delete removes the selected rows
 *  from this demo's local data; hit Restore rows to bring them back. */
export function BulkActionsDemo() {
  const [data, setData] = React.useState(members)
  return (
    <div className="flex w-full flex-col gap-3">
      {data.length === 0 && (
        <Button size="sm" variant="outline" className="self-start" onClick={() => setData(members)}>
          Restore rows
        </Button>
      )}
      <DataTable
        columns={memberColumns}
        data={data}
        getRowId={(row) => row.id}
        enableRowSelection
        renderSelectionActions={(rows, table) => (
          <>
            {/* Quiet, high-frequency actions: icon-only ghosts (aria-label doubles as the tooltip),
                so a wide action set stays compact. They read light on the dark pill for free. */}
            <Button variant="ghost" size="sm" iconOnly aria-label="Assign">
              <UserPlus weight="bold" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly aria-label="Add tag">
              <Tag weight="bold" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly aria-label="Archive">
              <Archive weight="bold" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
              <Export weight="bold" />
              Export
            </Button>
            {/* Overflow: everything that doesn't earn a permanent slot. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" iconOnly aria-label="More actions" tooltip={false}>
                  <DotsThree weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy weight="bold" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FolderSimple weight="bold" />
                  Move to project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <EnvelopeSimple weight="bold" />
                  Email selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Set the destructive step apart from the safe actions. */}
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
              <Trash weight="bold" />
              Delete
            </Button>
          </>
        )}
        className="min-w-[34rem]"
      />
    </div>
  )
}

/** Expandable rows: a caret toggle reveals a full-width detail panel under the row, rendered by
 *  `renderSubRow`. Here it lays the member's contact and org details out in a labelled grid. */
export function ExpandableRowDemo() {
  return (
    <DataTable
      columns={memberColumns}
      data={members}
      getRowId={(row) => row.id}
      renderSubRow={(row) => (
        <div className="grid gap-4 rounded-lg bg-muted/40 p-4 sm:grid-cols-3">
          <DetailField icon={<EnvelopeSimple weight="bold" />} label="Email" value={row.original.email} />
          <DetailField icon={<IdentificationBadge weight="bold" />} label="Role" value={row.original.role} />
          <DetailField icon={<UsersThree weight="bold" />} label="Team" value={row.original.team} />
        </div>
      )}
      className="min-w-[34rem]"
    />
  )
}

/** A labelled detail field for the expandable-row panel. */
function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex text-muted-foreground [&>svg]:size-4">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

/** Server-side data: sorting and pagination handled by a (simulated) server. `manualSorting` and
 *  `manualPagination` stop the table from doing the work client-side; you fetch on the on*Change
 *  callbacks and feed back the current page plus a `pageCount`. */
export function ServerSideDemo() {
  const PAGE = 6
  const [rows, setRows] = React.useState<Member[]>(() => manyMembers.slice(0, PAGE))
  const [loading, setLoading] = React.useState(false)
  const [pageSize, setPageSize] = React.useState(PAGE)
  const queryRef = React.useRef<{ sorting: SortingState; pageIndex: number; pageSize: number }>({
    sorting: [],
    pageIndex: 0,
    pageSize: PAGE,
  })
  const pageCount = Math.ceil(manyMembers.length / pageSize)

  const load = React.useCallback(
    (query: { sorting: SortingState; pageIndex: number; pageSize: number }) => {
      setLoading(true)
      // Stand-in for a server round-trip: sort + slice the full set off the UI thread's clock.
      window.setTimeout(() => {
        const sorted = [...manyMembers]
        const sort = query.sorting[0]
        if (sort) {
          sorted.sort((a, b) => {
            const av = a[sort.id as keyof Member]
            const bv = b[sort.id as keyof Member]
            const cmp =
              typeof av === "number" && typeof bv === "number"
                ? av - bv
                : String(av).localeCompare(String(bv))
            return sort.desc ? -cmp : cmp
          })
        }
        const start = query.pageIndex * query.pageSize
        setRows(sorted.slice(start, start + query.pageSize))
        setLoading(false)
      }, 500)
    },
    [],
  )

  return (
    <DataTable
      columns={memberColumns}
      data={rows}
      getRowId={(row) => row.id}
      enableSorting
      enablePagination
      manualSorting
      manualPagination
      pageCount={pageCount}
      pageSize={PAGE}
      pageSizeOptions={[6, 12, 24]}
      loading={loading}
      onSortingChange={(sorting) => {
        const query = { ...queryRef.current, sorting, pageIndex: 0 }
        queryRef.current = query
        load(query)
      }}
      onPaginationChange={(pagination) => {
        const query = {
          ...queryRef.current,
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }
        queryRef.current = query
        setPageSize(pagination.pageSize)
        load(query)
      }}
      className="min-w-[34rem]"
    />
  )
}
