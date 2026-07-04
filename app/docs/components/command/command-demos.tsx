"use client"

import * as React from "react"
import {
  Calendar,
  ChartBar,
  CreditCard,
  FilePlus,
  Gear,
  GithubLogo,
  Lifebuoy,
  MagnifyingGlass,
  Moon,
  Plus,
  Sun,
  User,
  UserPlus,
} from "@phosphor-icons/react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

/** Hero: a ⌘K button that opens the palette in a modal, grouped with shortcuts. */
export function CommandDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [last, setLast] = React.useState<string | null>(null)

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          "group flex h-9 w-64 items-center gap-2 rounded-md border border-input bg-background pl-2.5 pr-2 text-sm text-muted-foreground shadow-xs",
          "transition-[border-color,box-shadow,scale] duration-fast ease-out",
          "hover:border-ring/50 active:scale-[0.98]",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent",
        )}
      >
        <MagnifyingGlass weight="bold" className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search components…</span>
        <span className="flex items-center gap-1">
          <Kbd size="sm" variant="ghost">⌘</Kbd>
          <Kbd size="sm" variant="ghost">K</Kbd>
        </span>
      </button>
      <p className="text-sm text-muted-foreground">
        {last ? (
          <>
            Last run: <span className="font-medium text-foreground">{last}</span>
          </>
        ) : (
          <>
            Press <Kbd size="sm" variant="ghost">⌘</Kbd>{" "}
            <Kbd size="sm" variant="ghost">K</Kbd> or click the button.
          </>
        )}
      </p>

      <CommandDialog open={open} onOpenChange={setOpen} onSelect={setLast}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="New file" keywords={["create", "document"]}>
              <FilePlus weight="bold" />
              New file
              <CommandShortcut>
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">N</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem value="Invite member" keywords={["team", "user", "add"]}>
              <UserPlus weight="bold" />
              Invite member
            </CommandItem>
            <CommandItem value="Calendar" keywords={["schedule", "events"]}>
              <Calendar weight="bold" />
              Calendar
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem value="Profile" keywords={["account"]}>
              <User weight="bold" />
              Profile
              <CommandShortcut>
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">P</Kbd>
              </CommandShortcut>
            </CommandItem>
            <CommandItem value="Billing" keywords={["invoice", "payment", "plan"]}>
              <CreditCard weight="bold" />
              Billing
            </CommandItem>
            <CommandItem value="Preferences" keywords={["settings", "config"]}>
              <Gear weight="bold" />
              Preferences
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

/** Inline palette (no dialog): drops straight into a page or popover. */
export function CommandInlineDemo() {
  const [selected, setSelected] = React.useState<string | null>(null)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Command label="Quick actions" onSelect={setSelected}>
        <CommandInput placeholder="Search actions…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Create">
            <CommandItem value="New project" keywords={["create"]}>
              <Plus weight="bold" />
              New project
            </CommandItem>
            <CommandItem value="Invite teammate" keywords={["user", "member"]}>
              <UserPlus weight="bold" />
              Invite teammate
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigate">
            <CommandItem value="Dashboard">
              <ChartBar weight="bold" />
              Dashboard
            </CommandItem>
            <CommandItem value="Account" keywords={["profile"]}>
              <User weight="bold" />
              Account
            </CommandItem>
            <CommandItem value="Support" keywords={["help"]} disabled>
              <Lifebuoy weight="bold" />
              Support (offline)
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="text-sm text-muted-foreground">
        {selected ? (
          <>
            Selected: <span className="font-medium text-foreground">{selected}</span>
          </>
        ) : (
          "Highlight with ↑ ↓, run with Enter."
        )}
      </p>
    </div>
  )
}

/** Compact density: tighter rows for an information-dense surface. */
export function CommandDensityDemo() {
  return (
    <Command label="Theme" density="compact" className="w-full max-w-md">
      <CommandInput placeholder="Search themes…" />
      <CommandList>
        <CommandEmpty>No themes found.</CommandEmpty>
        <CommandGroup heading="Appearance">
          <CommandItem value="Light">
            <Sun weight="bold" />
            Light
          </CommandItem>
          <CommandItem value="Dark">
            <Moon weight="bold" />
            Dark
          </CommandItem>
          <CommandItem value="System" keywords={["auto"]}>
            <Gear weight="bold" />
            System
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Resources">
          <CommandItem value="GitHub repository" keywords={["source", "code"]}>
            <GithubLogo weight="bold" />
            GitHub repository
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
