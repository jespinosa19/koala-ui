"use client"

import {
  SquaresFour,
  FolderSimple,
  Users,
  GearSix,
  EnvelopeSimple,
  Sun,
  Moon,
  MoonStars,
  Plus,
  Check,
  UserCircle,
  CreditCard,
  SignOut,
  Export,
  Receipt,
  GoogleLogo,
  AppleLogo,
  Quotes,
} from "@phosphor-icons/react"

import { BrandMark } from "@/components/landing/brand-mark"
import {
  Layout,
  LayoutSidebar,
  LayoutContent,
  LayoutContainer,
  LayoutAside,
  LayoutHeader,
  LayoutMobileBar,
  LayoutMobileSidebar,
  PageHeader,
  PageHeaderContent,
  PageHeaderHeading,
  PageHeaderDescription,
  PageHeaderActions,
  SplitLayout,
  SplitPane,
  SplitPaneBody,
  SplitMedia,
  SplitMediaOverlay,
  type LayoutContainerProps,
} from "@/components/ui/layout"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarSwitcher,
} from "@/components/ui/sidebar"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import { Field, FieldLabel, FieldHint } from "@/components/ui/field"
import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Density } from "@/lib/density"
import { cn } from "@/lib/utils"

// ── The rail: the DS Sidebar, reused on desktop (in the gutter) and mobile (in a drawer) ──
// `className` lets each host tune the chrome: transparent + borderless in the Layout gutter,
// full-bleed inside the mobile Drawer.
function SidebarNav({ density, className }: { density?: Density; className?: string }) {
  return (
      <Sidebar density={density} aria-label="Main" className={className}>
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarSwitcher
                leading={<BrandMark wordmark={false} className="shrink-0 [&>img]:size-9" />}
                title="Koala"
                subtitle="Workspace"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuItem>
                <BrandMark wordmark={false} className="[&>img]:size-5" />
                Koala
                <Check weight="bold" className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus weight="bold" />
                Create workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup aria-label="Primary">
            <SidebarItem>
              <SquaresFour weight="bold" />
              Overview
            </SidebarItem>
            <SidebarItem>
              <FolderSimple weight="bold" />
              Projects
            </SidebarItem>
            <SidebarItem>
              <Users weight="bold" />
              Team
            </SidebarItem>
            <SidebarItem active>
              <GearSix weight="bold" />
              Settings
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarSwitcher
                leading={
                  <AvatarRoot size="sm" className="shrink-0">
                    <AvatarImage src="https://i.pravatar.cc/160?img=47" alt="Mara Okonkwo" />
                    <AvatarFallback>MO</AvatarFallback>
                  </AvatarRoot>
                }
                title="Mara Okonkwo"
                subtitle="mara@koala.io"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserCircle weight="bold" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard weight="bold" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SignOut weight="bold" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
  )
}

// The desktop rail: the DS Sidebar, made transparent so it sits in the Layout gutter.
// lg:flex on LayoutSidebar shows it only at wider sizes, forced on here, and stripped of
// its gutter padding so the Sidebar fills it edge-to-edge.
function AppSidebar({ density }: { density?: Density }) {
  return (
    <LayoutSidebar className="flex p-0">
      <SidebarNav density={density} className="w-full border-r-0 bg-transparent" />
    </LayoutSidebar>
  )
}

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "moonlight", label: "Moonlight", icon: MoonStars },
]

const notifications = [
  {
    id: "digest",
    label: "Weekly digest",
    hint: "A Monday summary of what changed across your projects.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    label: "Mentions & comments",
    hint: "Get notified the moment a teammate mentions you.",
    defaultChecked: true,
  },
  {
    id: "marketing",
    label: "Product updates",
    hint: "Occasional news about new features. No spam.",
    defaultChecked: false,
  },
]

/** A settings row: heading + description on the left, controls on the right. The classic
 *  two-column settings layout, separated by hairline dividers, no nested cards (the panel
 *  is already `bg-card`, so same-color cards would read flat). */
function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-x-8 gap-y-5 border-t border-border py-8 md:grid-cols-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-5 md:col-span-2">{children}</div>
    </div>
  )
}

// ── The shared sidebar-indent shell, parameterized by the two documented axes ──────
function Shell({
  width,
  density,
}: {
  width?: LayoutContainerProps["width"]
  density?: Density
}) {
  return (
    <Layout density={density} className="h-[560px] overflow-hidden">
      <AppSidebar density={density} />

      <LayoutContent>
        <LayoutContainer width={width}>
          <LayoutHeader>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>General</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </LayoutHeader>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">General settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account details and how Koala looks for you.
            </p>
          </div>

          <div className="mt-2">
            <Section
              title="Profile"
              description="This information is shown to your teammates."
            >
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <InputRoot>
                  <InputField defaultValue="Mara Okonkwo" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Email address</FieldLabel>
                <InputRoot>
                  <InputPrefix>
                    <EnvelopeSimple weight="bold" />
                  </InputPrefix>
                  <InputField type="email" defaultValue="mara@koala.io" />
                </InputRoot>
                <FieldHint>Used for sign-in and notifications.</FieldHint>
              </Field>
            </Section>

            <Section
              title="Appearance"
              description="Pick a theme and a name for this workspace."
            >
              <Field>
                <FieldLabel>Workspace name</FieldLabel>
                <InputRoot>
                  <InputField defaultValue="Koala HQ" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Theme</FieldLabel>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon weight="bold" /> {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            <Section
              title="Notifications"
              description="Choose what Koala emails you about."
            >
              {notifications.map((n) => (
                <label key={n.id} className="flex items-start gap-3">
                  <Checkbox defaultChecked={n.defaultChecked} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">{n.label}</span>
                    <span className="block text-sm text-muted-foreground">{n.hint}</span>
                  </span>
                </label>
              ))}
            </Section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </div>
        </LayoutContainer>
      </LayoutContent>
    </Layout>
  )
}

// ── Anatomy blueprint: a labeled schematic that maps each slot to its region ──────
// Not a live render of the component: dashed "shells" with mono labels, mirroring the
// real nesting (Layout → Sidebar + Content → Container → Header) and proportions so the
// structure reads at a glance, the way Tailwind sketches its application shells.

/** One labeled shell: a dashed box with a small mono tag pinned to its top-left corner.
 *  `tone="panel"` paints the card surface to echo the real LayoutContent indent. */
function Region({
  label,
  className,
  tone = "muted",
  children,
}: {
  label: string
  className?: string
  tone?: "muted" | "panel"
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-dashed border-border",
        tone === "panel" && "bg-card shadow-sm",
        className,
      )}
    >
      <span className="absolute left-2 top-2 z-10 rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground ring-1 ring-border backdrop-blur-sm">
        {label}
      </span>
      {children}
    </div>
  )
}

export function LayoutAnatomyDemo() {
  return (
    <div className="w-full p-6">
      {/* Layout: the flex row on the bg-background canvas (the gutter). The padding is
          drawn wider than the real m-2 (8px) so the gutter is legible enough to label. */}
      <Region
        label="Layout"
        className="relative flex h-[460px] gap-2.5 bg-background p-5 pt-10"
      >
        {/* Gutter cota: the bg-background inset that frames the panel on every side. */}
        <span className="pointer-events-none absolute inset-y-5 right-1 flex items-center font-mono text-[10px] tracking-wide text-muted-foreground [writing-mode:vertical-rl]">
          gutter · m-2
        </span>

        {/* LayoutSidebar: the w-64 rail living in the gutter, with faux nav rows. */}
        <Region
          label="LayoutSidebar"
          className="hidden w-52 shrink-0 flex-col gap-2.5 p-3 pt-9 sm:flex"
        >
          <div className="h-7 rounded-md bg-muted/70" />
          <div className="mt-1 flex flex-col gap-1.5">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-3/5 rounded bg-muted" />
          </div>
          <div className="mt-auto h-7 rounded-md bg-muted/70" />
        </Region>

        {/* Flush seam: the left inset drops at lg (lg:ml-0), so the panel meets the rail. */}
        <div className="relative hidden items-center sm:flex" aria-hidden>
          <div className="h-full w-px bg-border" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-background px-1 py-1 font-mono text-[10px] text-muted-foreground ring-1 ring-border [writing-mode:vertical-rl]">
            lg:ml-0
          </span>
        </div>

        {/* LayoutContent: the inset, rounded, elevated card panel ("the indent"). */}
        <Region
          label="LayoutContent"
          tone="panel"
          className="flex flex-1 rounded-2xl p-3 pt-9"
        >
          {/* LayoutContainer: the centered max-width column. */}
          <Region
            label="LayoutContainer"
            className="mx-auto flex w-full max-w-md flex-col gap-3 p-3 pt-9"
          >
            {/* LayoutHeader: the breadcrumbs band at the top of the column. */}
            <Region label="LayoutHeader" className="flex h-12 items-center px-3 pt-9">
              <div className="flex items-center gap-2 self-end pb-2.5">
                <div className="h-3 w-14 rounded bg-muted" />
                <div className="size-1 rounded-full bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
            </Region>

            {/* Your content: the striped placeholder, à la Tailwind's shell sketches. */}
            <div
              className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 11px)",
              }}
            >
              <span className="rounded-sm bg-background/70 px-2 py-1 font-mono text-xs text-muted-foreground ring-1 ring-border backdrop-blur-sm">
                your page content
              </span>
            </div>
          </Region>
        </Region>
      </Region>
    </div>
  )
}

// ── Container-width blueprint: small multiples ────────────────────────────────────
// One diagram per width so the *relationship* reads at a glance (the live demo can only
// show one width at a time). Same bg-card panel in each; the dashed column is drawn as a
// fraction of it (wider = more of the panel), with the gutter shrinking to nothing at
// `full`. Fractions are schematic; the real max-w-* values are labeled below each.

const widthBlueprints = [
  { width: "narrow", token: "max-w-3xl", px: "768px", fraction: "52%" },
  { width: "default", token: "max-w-6xl", px: "1152px", fraction: "74%" },
  { width: "wide", token: "max-w-7xl", px: "1280px", fraction: "88%" },
  { width: "full", token: "max-w-none", px: "100%", fraction: "100%" },
] as const

export function LayoutWidthBlueprintDemo() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 p-6 lg:grid-cols-4">
      {widthBlueprints.map((b) => (
        <figure key={b.width} className="flex flex-col gap-2.5">
          {/* The panel (bg-card), echoing LayoutContent. */}
          <div className="h-36 rounded-xl bg-card p-2 shadow-sm ring-1 ring-border">
            {/* The centered column at this width: dashed, with faux content rows. */}
            <div
              className="mx-auto flex h-full flex-col gap-1.5 rounded-md border border-dashed border-border p-2"
              style={{ width: b.fraction }}
            >
              <div className="h-2 w-1/2 rounded-full bg-muted" />
              <div className="mt-0.5 flex-1 rounded bg-muted/60" />
              <div className="h-2 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
          <figcaption className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-medium text-foreground">
              width=&quot;{b.width}&quot;
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {b.token} · {b.px}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function LayoutShellDemo() {
  return <Shell />
}

export function LayoutWidthDemo() {
  return <Shell width="narrow" />
}

export function LayoutDensityDemo() {
  return <Shell density="comfortable" />
}

// ── Faux content: an invoice list, long enough to scroll the panel ────────────────────
const invoices = [
  { id: "INV-2042", client: "Northwind Trading", amount: "$4,200.00", status: "Paid" },
  { id: "INV-2041", client: "Globex Corporation", amount: "$1,850.00", status: "Paid" },
  { id: "INV-2040", client: "Soylent Industries", amount: "$9,300.00", status: "Overdue" },
  { id: "INV-2039", client: "Initech LLC", amount: "$640.00", status: "Pending" },
  { id: "INV-2038", client: "Umbrella Co.", amount: "$12,100.00", status: "Paid" },
  { id: "INV-2037", client: "Hooli", amount: "$3,720.00", status: "Pending" },
  { id: "INV-2036", client: "Stark Industries", amount: "$28,400.00", status: "Paid" },
  { id: "INV-2035", client: "Wayne Enterprises", amount: "$7,050.00", status: "Overdue" },
  { id: "INV-2034", client: "Vandelay Industries", amount: "$960.00", status: "Paid" },
  { id: "INV-2033", client: "Cyberdyne Systems", amount: "$15,500.00", status: "Pending" },
]

const statusTone: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Overdue: "bg-destructive/10 text-destructive",
  Pending: "bg-muted text-muted-foreground",
}

function InvoiceList() {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {invoices.map((inv) => (
        <li key={inv.id} className="flex items-center gap-4 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            <Receipt weight="bold" className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{inv.client}</span>
            <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
          </span>
          <span
            className={cn(
              "ml-auto hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline",
              statusTone[inv.status],
            )}
          >
            {inv.status}
          </span>
          <span className="w-24 text-right text-sm font-medium tabular-nums">{inv.amount}</span>
        </li>
      ))}
    </ul>
  )
}

// ── PageHeader: title + supporting text + action cluster, above the content ───────────
export function LayoutPageHeaderDemo() {
  return (
    <Layout className="h-[560px] overflow-hidden">
      <AppSidebar />
      <LayoutContent>
        <LayoutContainer width="wide">
          <LayoutHeader className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Billing</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invoices</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </LayoutHeader>

          <PageHeader>
            <PageHeaderContent>
              <PageHeaderHeading>Invoices</PageHeaderHeading>
              <PageHeaderDescription>
                Every charge across your workspace, with status and totals.
              </PageHeaderDescription>
            </PageHeaderContent>
            <PageHeaderActions>
              <Button variant="outline">
                <Export weight="bold" />
                Export
              </Button>
              <Button>
                <Plus weight="bold" />
                New invoice
              </Button>
            </PageHeaderActions>
          </PageHeader>

          <InvoiceList />
        </LayoutContainer>
      </LayoutContent>
    </Layout>
  )
}

// ── Sticky header: breadcrumbs + actions pinned as the panel scrolls ──────────────────
export function LayoutStickyHeaderDemo() {
  return (
    <Layout className="h-[560px] overflow-hidden">
      <AppSidebar />
      <LayoutContent>
        <LayoutContainer width="wide">
          <LayoutHeader sticky>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Billing</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Invoices</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Button size="sm">
              <Plus weight="bold" />
              New invoice
            </Button>
          </LayoutHeader>

          <p className="mb-4 text-sm text-muted-foreground">
            Scroll the panel, and the breadcrumbs bar stays pinned to the top with a blurred
            fill.
          </p>
          <InvoiceList />
          <InvoiceList />
        </LayoutContainer>
      </LayoutContent>
    </Layout>
  )
}

// ── Mobile: the rail collapses into a Drawer behind a hamburger in the mobile bar ─────
// The demo forces the mobile UI on at every width (the real `lg:hidden` / `lg:flex`
// breakpoints would otherwise hide it on this wide docs page) and frames it as a phone.
export function LayoutMobileDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Layout className="h-[560px] overflow-hidden">
        {/* No desktop rail here: on mobile the nav lives entirely in the drawer below. */}
        <LayoutContent>
          <LayoutMobileBar className="flex lg:flex">
            <LayoutMobileSidebar triggerClassName="inline-flex lg:inline-flex">
              <SidebarNav className="h-full w-full border-r-0" />
            </LayoutMobileSidebar>
            <BrandMark />
          </LayoutMobileBar>

          {/* Pin the horizontal padding to its mobile value (px-4 = 16px). The container's
              responsive `sm:px-6 lg:px-8` keys off the real desktop viewport, not this phone
              frame, so without the override it would render 32px here instead of 16px. */}
          <LayoutContainer className="px-4 sm:px-4 lg:px-4">
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderHeading>Invoices</PageHeaderHeading>
                <PageHeaderDescription>
                  Tap the menu to open navigation.
                </PageHeaderDescription>
              </PageHeaderContent>
            </PageHeader>
            <InvoiceList />
          </LayoutContainer>
        </LayoutContent>
      </Layout>
    </div>
  )
}

// ── variant="flat": the docs / reading shell (three columns, no indent) ───────────────
// Content sits flat on the canvas; the rail (left) and a table-of-contents (right) are divided
// by hairlines instead of a floating panel. The frame forces both rails visible (the real
// `lg`/`xl` breakpoints would hide them on this narrower preview) and scrolls the whole shell.

// A docs-style rail: the DS Sidebar with grouped section links (no switchers/chrome).
function DocsRail() {
  return (
    <Sidebar
      aria-label="Documentation"
      className="h-full w-full border-r-0 bg-transparent"
    >
      <SidebarContent className="gap-6">
        <SidebarGroup aria-label="Getting started">
          <SidebarGroupLabel>Getting started</SidebarGroupLabel>
          <SidebarItem>
            <FolderSimple weight="bold" />
            Introduction
          </SidebarItem>
          <SidebarItem>
            <FolderSimple weight="bold" />
            Installation
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup aria-label="Components">
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarItem>
            <SquaresFour weight="bold" />
            Button
          </SidebarItem>
          <SidebarItem active>
            <SquaresFour weight="bold" />
            Layout
          </SidebarItem>
          <SidebarItem>
            <SquaresFour weight="bold" />
            Sidebar
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

const tocItems = ["Overview", "Anatomy", "Variants", "Density"]

export function LayoutDocsDemo() {
  return (
    <Layout variant="flat" className="h-[560px] min-h-0 overflow-y-auto">
      {/* Force the rail visible and pin it to the scrolling frame (not the viewport). */}
      <LayoutSidebar className="flex h-full p-0 lg:flex">
        <DocsRail />
      </LayoutSidebar>

      <LayoutContent>
        <LayoutContainer width="narrow">
          <h1 className="text-3xl font-semibold tracking-tight text-pretty">Layout</h1>
          <p className="mt-2 text-pretty text-muted-foreground">
            The application and page shell. One set of parts, two variants: the SaaS{" "}
            <code className="font-mono text-sm">panel</code> indent and this flat docs shell.
          </p>

          <h2 className="mt-8 text-lg font-semibold tracking-tight">Overview</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            In the flat variant the content sits directly on the page canvas. The navigation
            rail and the on-this-page list are set off by hairline dividers rather than a
            floating, elevated card, which is what a documentation site wants.
          </p>

          <h2 className="mt-8 text-lg font-semibold tracking-tight">Anatomy</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            A flex row of three columns: <code className="font-mono text-sm">LayoutSidebar</code>,{" "}
            <code className="font-mono text-sm">LayoutContent</code> (with a centered{" "}
            <code className="font-mono text-sm">LayoutContainer</code>), and{" "}
            <code className="font-mono text-sm">LayoutAside</code> for the table of contents.
          </p>
          <p className="mt-4 text-pretty text-muted-foreground">
            Because the content is not its own scroll container, the page scrolls as a whole and
            a window-based scroll-spy can drive the on-this-page list on the right.
          </p>
        </LayoutContainer>
      </LayoutContent>

      <LayoutAside className="block h-full">
        <nav aria-label="On this page" className="flex flex-col gap-3 text-sm">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            On this page
          </p>
          <ul className="flex flex-col gap-1 border-l border-border">
            {tocItems.map((item, i) => (
              <li key={item}>
                <a
                  href="#"
                  aria-current={i === 0 ? "location" : undefined}
                  className={cn(
                    "block py-1 pl-4 transition-colors duration-fast ease-out",
                    i === 0
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </LayoutAside>
    </Layout>
  )
}

// ── Layout × Resizable: the rail becomes a draggable panel ────────────────────────────
// Mixing the two components: the app-shell `panel` variant on a fixed-height shell, with the
// sidebar/content wrapped in a ResizablePanelGroup so the rail width is a drag, not a constant.
// The Layout parts still compose inside; the panel just owns the width the recipe used to fix
// at `w-64`. Content scrolls inside the card (`overflow-hidden` group + page-less shell).

// The content column, reused across the resizable variants.
function ResizableContent({ note }: { note: string }) {
  return (
    <LayoutContainer width="wide">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderHeading>Invoices</PageHeaderHeading>
          <PageHeaderDescription>{note}</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button>
            <Plus weight="bold" />
            New invoice
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <InvoiceList />
    </LayoutContainer>
  )
}

// Variant 1: the canonical resizable rail: transparent in the gutter, content as the indent card.
export function LayoutResizableDemo() {
  return (
    <Layout className="h-[560px] min-h-0 overflow-hidden">
      <ResizablePanelGroup className="h-full w-full">
        {/* Hard px bounds keep the rail a sane width at any group size; `collapsible` snaps it
            shut when dragged past half its min. */}
        <ResizablePanel defaultSize={26} minSize="220px" maxSize="380px" collapsible className="p-0">
          <LayoutSidebar className="flex h-full w-full p-0">
            <SidebarNav className="w-full border-r-0 bg-transparent" />
          </LayoutSidebar>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* The indent card fills the padded panel; `m-0` drops the recipe's own gutter so the
            panel's `p-2` provides it instead, keeping the rounded corners from clipping. */}
        <ResizablePanel defaultSize={74} className="p-2">
          <LayoutContent className="m-0 h-full">
            <ResizableContent note="Drag the divider to resize the navigation rail." />
          </LayoutContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  )
}

// Variant 2: inset sidebar: the rail is its own floating card, so two surfaces face off across
// the draggable seam. Both panels are padded; the handle rides the bg-background gutter between.
export function LayoutResizableInsetDemo() {
  return (
    <Layout className="h-[560px] min-h-0 overflow-hidden">
      <ResizablePanelGroup className="h-full w-full">
        <ResizablePanel defaultSize={26} minSize="220px" maxSize="380px" className="p-2">
          <LayoutSidebar className="flex h-full w-full p-0">
            <SidebarNav className="h-full w-full rounded-2xl border-0 shadow-sm ring-1 ring-border" />
          </LayoutSidebar>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={74} className="p-2">
          <LayoutContent className="m-0 h-full">
            <ResizableContent note="Both the rail and the content are inset cards." />
          </LayoutContent>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  )
}

// A simple right-hand inspector column for the three-pane variant.
function InspectorPanel() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border [--surface:var(--card)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <Receipt weight="bold" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">INV-2042</p>
          <p className="text-xs text-muted-foreground">Northwind Trading</p>
        </div>
      </div>
      <dl className="flex flex-col gap-3 text-sm">
        {[
          ["Amount", "$4,200.00"],
          ["Status", "Paid"],
          ["Issued", "Jun 2, 2026"],
          ["Due", "Jun 16, 2026"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <Button variant="ghost" className="mt-auto justify-start">
        <Export weight="bold" />
        Export PDF
      </Button>
    </div>
  )
}

// Variant 3: three panes: rail + content + a collapsible inspector, two draggable handles. The
// classic detail-view dashboard.
export function LayoutResizableInspectorDemo() {
  return (
    <Layout className="h-[560px] min-h-0 overflow-hidden">
      <ResizablePanelGroup className="h-full w-full">
        <ResizablePanel defaultSize={22} minSize="200px" maxSize="320px" collapsible className="p-0">
          <LayoutSidebar className="flex h-full w-full p-0">
            <SidebarNav className="w-full border-r-0 bg-transparent" />
          </LayoutSidebar>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={56} className="p-2">
          <LayoutContent className="m-0 h-full">
            <ResizableContent note="Drag either divider to rebalance the three panes." />
          </LayoutContent>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={22} minSize="260px" maxSize="380px" collapsible className="p-2">
          <InspectorPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  )
}

// ── SplitLayout: the full-viewport two-pane auth / onboarding screen ───────────────────
// The demos force the grid to two columns and the media pane visible (the real
// `grid-cols-1` / `lg:grid-cols-2` + `hidden lg:block` would otherwise collapse to one
// column on this narrower docs preview), and swap `min-h-svh` for a fixed-height frame.

// The Koala brand lockup: the canonical BrandMark, reused across both panes.
function Brand({ className }: { className?: string }) {
  return <BrandMark className={className} />
}

// The two social sign-in buttons, shared by the sign-up and sign-in panes.
function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="w-full">
        <GoogleLogo weight="bold" />
        Google
      </Button>
      <Button variant="outline" className="w-full">
        <AppleLogo weight="bold" />
        Apple
      </Button>
    </div>
  )
}

// ── Canonical: content left, media right (the sign-up screen) ──────────────────────────
export function SplitLayoutDemo() {
  return (
    <SplitLayout className="grid-cols-2 h-[660px] min-h-0">
      <SplitPane>
        <SplitPaneBody>
          <Brand className="mb-8 justify-center" />

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
              Fill in the details below to create your account.
            </p>
          </div>

          <div className="mt-7">
            <SocialButtons />
            <Divider className="my-6">or continue with email</Divider>

            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <InputRoot>
                  <InputField placeholder="Enter your full name" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Email address</FieldLabel>
                <InputRoot>
                  <InputField type="email" placeholder="Enter your email" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <InputRoot>
                  <InputField type="password" placeholder="Create a password" />
                </InputRoot>
              </Field>

              <Button className="mt-1 w-full">Create account</Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Have an account already?{" "}
            <a href="#" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in
            </a>
          </p>
        </SplitPaneBody>
      </SplitPane>

      <SplitMedia className="block">
        {/* A warm gradient "photo" stands in for a real image (DS demo convention). */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600" />
        <SplitMediaOverlay>
          <Quotes weight="bold" className="size-7 opacity-80" />
          <p className="text-lg font-medium text-balance">
            Koala UI let us ship a polished product in days, not months.
          </p>
          <p className="text-sm text-white/70">Mara Okonkwo · Founder, Nimbus</p>
        </SplitMediaOverlay>
      </SplitMedia>
    </SplitLayout>
  )
}

// ── Image left + ratio: media leads and takes the larger share (the sign-in screen) ────
export function SplitLayoutReverseDemo() {
  return (
    <SplitLayout ratio="start" className="grid-cols-[3fr_2fr] h-[560px] min-h-0">
      <SplitMedia className="block">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-500 to-fuchsia-500" />
        <SplitMediaOverlay className="justify-between">
          <Brand className="text-white" />
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-semibold tracking-tight text-balance">
              Welcome back to your workspace.
            </p>
            <p className="text-sm text-white/75 text-pretty">
              Pick up right where you left off across every project.
            </p>
          </div>
        </SplitMediaOverlay>
      </SplitMedia>

      <SplitPane>
        <SplitPaneBody>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Sign in</h1>
          <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
            Enter your credentials to access your account.
          </p>

          <div className="mt-7 flex flex-col gap-4">
            <Field>
              <FieldLabel>Email address</FieldLabel>
              <InputRoot>
                <InputField type="email" placeholder="you@company.com" />
              </InputRoot>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <InputRoot>
                <InputField type="password" placeholder="Enter your password" />
              </InputRoot>
              <FieldHint>
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </FieldHint>
            </Field>

            <Button className="mt-1 w-full">Sign in</Button>
          </div>

          <Divider className="my-6">or</Divider>
          <SocialButtons />
        </SplitPaneBody>
      </SplitPane>
    </SplitLayout>
  )
}
