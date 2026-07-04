"use client"

import {
  SquaresFour,
  Tray,
  Stack,
  CalendarBlank,
  MagnifyingGlass,
  UsersThree,
  GearSix,
  Rocket,
  Check,
  Plus,
  CreditCard,
  UserCircle,
  SignOut,
  Sparkle,
  Cube,
  Target,
  Gift,
  Signpost,
  SmileySad,
  Globe,
  IdentificationBadge,
} from "@phosphor-icons/react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarItem,
  SidebarItemIcon,
  SidebarCollapsible,
  SidebarSwitcher,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { BrandMark } from "@/components/landing/brand-mark"
import type { Density } from "@/lib/density"

type SwitcherVariant = "default" | "full"

// ── Workspace switcher (top): SidebarSwitcher composed with the DS DropdownMenu ──────
// `default` (no prop) is the compact trigger; `full` is the roomier identity row with a
// subtitle and a larger leading.
function WorkspaceSwitcher({ variant }: { variant?: SwitcherVariant }) {
  const full = variant === "full"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarSwitcher
          variant={variant}
          leading={
            <BrandMark
              wordmark={false}
              className={full ? "shrink-0 [&>img]:size-10" : "shrink-0"}
            />
          }
          title="Koala"
          subtitle={full ? "Enterprise plan" : undefined}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuItem>
          <BrandMark wordmark={false} className="[&>img]:size-5" />
          Koala
          <Check weight="bold" className="ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Rocket weight="bold" />
          Skunkworks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus weight="bold" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Profile switcher (bottom): same trigger, menu opens upward ───────────────────────
function ProfileSwitcher({ variant }: { variant?: SwitcherVariant }) {
  const full = variant === "full"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarSwitcher
          variant={variant}
          leading={
            <AvatarRoot size={full ? "md" : "xs"} className="shrink-0">
              <AvatarImage src="https://i.pravatar.cc/160?img=47" alt="Mara Okonkwo" />
              <AvatarFallback>MO</AvatarFallback>
            </AvatarRoot>
          }
          title="Mara Okonkwo"
          subtitle={full ? "mara@koala.io" : undefined}
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
        <DropdownMenuItem>
          <Sparkle weight="bold" />
          Upgrade plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOut weight="bold" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** A colored page dot for the Favorites section, aligned to the icon column. */
function FavDot({ className }: { className: string }) {
  return (
    <span className="flex size-[1.125rem] shrink-0 items-center justify-center">
      <span className={`size-2 rounded-full ${className}`} />
    </span>
  )
}

// ── The full rail, parameterized by density / collapsed for the demos ─────────────────
// Every SidebarItem carries a `label` so the collapsed (icon-only) rail can show a hover
// tooltip and name the row once the inline text is hidden.
function AppSidebar({
  density,
  collapsed,
  floating,
  side,
  className = "h-[600px]",
}: {
  density?: Density
  collapsed?: boolean
  floating?: boolean
  side?: "left" | "right"
  className?: string
}) {
  return (
    <Sidebar
      density={density}
      collapsed={collapsed}
      floating={floating}
      side={side}
      aria-label="Main"
      className={className}
    >
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Primary pages: first, unlabeled, the spine of the app. */}
        <SidebarGroup aria-label="Primary">
          <SidebarItem label="Search">
            <MagnifyingGlass weight="bold" />
            Search
            <Kbd size="sm" className="ml-auto">
              ⌘K
            </Kbd>
          </SidebarItem>
          <SidebarItem active label="Dashboard">
            <SquaresFour weight="bold" />
            Dashboard
          </SidebarItem>
          <SidebarItem label="Inbox">
            <Tray weight="bold" />
            Inbox
            <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">
              8
            </Badge>
          </SidebarItem>
          <SidebarItem label="Projects">
            <Stack weight="bold" />
            Projects
          </SidebarItem>
          <SidebarItem label="Calendar">
            <CalendarBlank weight="bold" />
            Calendar
          </SidebarItem>
        </SidebarGroup>

        {/* Favorites: starred pages, marked with their page color. A secondary section, so it
            drops out of the collapsed icon rail rather than reducing to bare dots. */}
        <SidebarGroup aria-label="Favorites" hideWhenCollapsed>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarItem label="Q3 Roadmap">
            <FavDot className="bg-purple" />
            Q3 Roadmap
          </SidebarItem>
          <SidebarItem label="Design System">
            <FavDot className="bg-teal" />
            Design System
          </SidebarItem>
          <SidebarItem label="Hiring Plan">
            <FavDot className="bg-orange" />
            Hiring Plan
          </SidebarItem>
        </SidebarGroup>

        {/* A clearly-labeled workspace section. */}
        <SidebarGroup aria-label="Workspace">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarItem label="Members">
            <UsersThree weight="bold" />
            Members
          </SidebarItem>
          <SidebarItem label="Settings">
            <GearSix weight="bold" />
            Settings
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ProfileSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

export function SidebarDemo() {
  return (
    <div className="flex w-full justify-center">
      <AppSidebar />
    </div>
  )
}

export function SidebarDensityDemo() {
  return (
    <div className="flex w-full justify-center">
      <AppSidebar density="comfortable" />
    </div>
  )
}

// ── The two rail variants side by side: the full default rail and the collapsed icon rail.
// Same markup, only the `collapsed` prop differs (hover a collapsed row for its tooltip).
export function SidebarVariantsDemo() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-10">
      <div className="flex flex-col items-center gap-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">default</span>
        <AppSidebar className="h-[560px]" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">collapsed</span>
        <AppSidebar collapsed className="h-[560px]" />
      </div>
    </div>
  )
}

// ── Focused: switchers on their own ───────────────────────────────────────────────────
export function SidebarSwitcherDemo() {
  return (
    <Sidebar aria-label="Switchers" className="h-auto w-64 border-r-0">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarFooter className="border-b-0 border-t-0">
        <ProfileSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}

// ── Focused: the compact default vs the roomier full switcher, side by side ───────────
export function SidebarSwitcherVariantDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <div className="flex flex-col gap-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">default (compact)</span>
        <Sidebar aria-label="Default switchers" className="h-auto w-60 rounded-xl border">
          <SidebarHeader>
            <WorkspaceSwitcher />
          </SidebarHeader>
          <SidebarFooter>
            <ProfileSwitcher />
          </SidebarFooter>
        </Sidebar>
      </div>

      <div className="flex flex-col gap-2">
        <span className="px-1 text-xs font-medium text-muted-foreground">full</span>
        <Sidebar aria-label="Full switchers" className="h-auto w-60 rounded-xl border">
          <SidebarHeader>
            <WorkspaceSwitcher variant="full" />
          </SidebarHeader>
          <SidebarFooter>
            <ProfileSwitcher variant="full" />
          </SidebarFooter>
        </Sidebar>
      </div>
    </div>
  )
}

// ── Focused: item states ──────────────────────────────────────────────────────────────
export function SidebarItemDemo() {
  return (
    <Sidebar aria-label="Items" className="h-auto w-64 border-r-0">
      <SidebarContent>
        <SidebarGroup aria-label="States">
          <SidebarItem active>
            <SquaresFour weight="bold" />
            Active page
          </SidebarItem>
          <SidebarItem>
            <Stack weight="bold" />
            Default page
          </SidebarItem>
          <SidebarItem>
            <Tray weight="bold" />
            With a count
            <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">
              12
            </Badge>
          </SidebarItem>
          <SidebarItem disabled>
            <GearSix weight="bold" />
            Disabled page
          </SidebarItem>
          <SidebarItem asChild>
            <a href="#">
              <CalendarBlank weight="bold" />
              A real link (asChild)
            </a>
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// ── Colored icon tiles: each "space" carries a soft, hue-tinted tile (SidebarItemIcon) ──
// The Productboard/Linear "colored spaces" look: the icon becomes a rounded, tinted square so
// each destination reads by color at a glance. The active row still gets the neutral chip + brand
// bar; the tiles are the decoration, not the selection state.
export function SidebarTilesDemo() {
  const spaces = [
    { icon: <Cube weight="bold" />, tone: "purple" as const, label: "Product Portfolio", active: true },
    { icon: <Target weight="bold" />, tone: "orange" as const, label: "Strategy" },
    { icon: <Gift weight="bold" />, tone: "green" as const, label: "Customer Feedback" },
    { icon: <Signpost weight="bold" />, tone: "pink" as const, label: "Roadmapping" },
    { icon: <SmileySad weight="bold" />, tone: "red" as const, label: "Problems" },
    { icon: <Globe weight="bold" />, tone: "teal" as const, label: "Customers" },
    { icon: <IdentificationBadge weight="bold" />, tone: "blue" as const, label: "People" },
  ]
  return (
    <div className="flex w-full justify-center">
      <Sidebar aria-label="Colored spaces" className="h-[560px] w-64">
        <SidebarHeader>
          <WorkspaceSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup aria-label="Spaces">
            <SidebarGroupLabel>Spaces</SidebarGroupLabel>
            {spaces.map((s) => (
              <SidebarItem key={s.label} active={s.active} label={s.label} asChild>
                <a href="#">
                  <SidebarItemIcon tone={s.tone}>{s.icon}</SidebarItemIcon>
                  {s.label}
                </a>
              </SidebarItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ProfileSwitcher />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

// ── Nested navigation: SidebarCollapsible folds a sub-list of routes under a parent row ──
export function SidebarNestedDemo() {
  return (
    <div className="flex w-full justify-center">
      <Sidebar aria-label="Nested navigation" className="h-[520px] w-64">
        <SidebarHeader>
          <WorkspaceSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup aria-label="Primary">
            <SidebarItem active>
              <SquaresFour weight="bold" />
              Dashboard
            </SidebarItem>
            <SidebarItem>
              <Tray weight="bold" />
              Inbox
              <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">
                8
              </Badge>
            </SidebarItem>
            {/* A section that's also the current page: the parent lights up while a child is open. */}
            <SidebarCollapsible icon={<GearSix weight="bold" />} label="Settings" active defaultOpen>
              <SidebarItem active asChild>
                <a href="#">General</a>
              </SidebarItem>
              <SidebarItem asChild>
                <a href="#">Members</a>
              </SidebarItem>
              <SidebarItem asChild>
                <a href="#">Billing</a>
              </SidebarItem>
            </SidebarCollapsible>
            <SidebarCollapsible
              icon={<Stack weight="bold" />}
              label="Projects"
              actions={
                <Badge variant="secondary" size="sm" className="tabular-nums">
                  3
                </Badge>
              }
            >
              <SidebarItem asChild>
                <a href="#">Koala UI</a>
              </SidebarItem>
              <SidebarItem asChild>
                <a href="#">Marketing site</a>
              </SidebarItem>
              <SidebarItem asChild>
                <a href="#">Mobile app</a>
              </SidebarItem>
            </SidebarCollapsible>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ProfileSwitcher />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

// ── Collapsible sections: the SidebarGroupLabel toggles the whole group ──────────────
export function SidebarCollapsibleGroupDemo() {
  return (
    <div className="flex w-full justify-center">
      <Sidebar aria-label="Collapsible sections" className="h-[520px] w-64">
        <SidebarContent>
          {/* Primary pages stay pinned and open. */}
          <SidebarGroup aria-label="Primary">
            <SidebarItem active>
              <SquaresFour weight="bold" />
              Dashboard
            </SidebarItem>
            <SidebarItem>
              <Tray weight="bold" />
              Inbox
            </SidebarItem>
          </SidebarGroup>

          {/* Favorites: collapsible, starts open. */}
          <SidebarGroup collapsible defaultOpen aria-label="Favorites">
            <SidebarGroupLabel>Favorites</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarItem>
                <FavDot className="bg-purple" />
                Q3 Roadmap
              </SidebarItem>
              <SidebarItem>
                <FavDot className="bg-teal" />
                Design System
              </SidebarItem>
              <SidebarItem>
                <FavDot className="bg-orange" />
                Hiring Plan
              </SidebarItem>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Workspace: collapsible, starts folded. */}
          <SidebarGroup collapsible defaultOpen={false} aria-label="Workspace">
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarItem>
                <UsersThree weight="bold" />
                Members
              </SidebarItem>
              <SidebarItem>
                <GearSix weight="bold" />
                Settings
              </SidebarItem>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}

/** A faux content pane so a docked/floating rail reads against an app shell. */
function FauxContent() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
      <div className="h-6 w-40 rounded-md bg-muted" />
      <div className="h-24 rounded-lg bg-muted/60" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-lg bg-muted/60" />
        <div className="h-20 rounded-lg bg-muted/60" />
      </div>
    </div>
  )
}

// ── Floating (inset) rail: a detached card lifted off the canvas, set in a padded shell ──
export function SidebarFloatingDemo() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex h-[520px] w-full max-w-2xl rounded-xl border border-border bg-muted/30 p-3">
        <AppSidebar floating className="h-full w-60" />
        <FauxContent />
      </div>
    </div>
  )
}

// ── Right-docked rail: side="right" flips the hairline for an inspector/detail panel ──
export function SidebarSideDemo() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex h-[520px] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
        <FauxContent />
        <AppSidebar side="right" className="h-full w-60" />
      </div>
    </div>
  )
}
