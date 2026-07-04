"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MagnifyingGlass } from "@phosphor-icons/react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { docsNav } from "./nav"
import { SEARCH_ALIASES, EXAMPLE_GROUPS, type SearchGroup } from "./search-index"

/**
 * The full searchable set: the sidebar nav (each page, with its synonyms folded in from
 * `SEARCH_ALIASES` so "modal" finds Dialog, "snackbar" finds Toast…), followed by the
 * deep-link example groups (variants within a section page, e.g. the Banner countdown bar).
 * Built once at module load since the nav is static.
 */
const SEARCH_GROUPS: SearchGroup[] = [
  ...docsNav.map((section) => ({
    heading: section.title,
    items: section.items.map((item) => ({
      title: item.title,
      href: item.href,
      icon: item.icon,
      keywords: [section.title, ...(SEARCH_ALIASES[item.href] ?? [])],
    })),
  })),
  ...EXAMPLE_GROUPS,
]

/**
 * DocsCommandMenu: the docs-wide ⌘K search. The trigger reads like a search box in the
 * header; opening it lets you jump to any page in the sidebar (filtered by title or synonym)
 * or straight to a labeled variant within a section, without leaving the keyboard. The Command
 * palette owns filtering + the roving highlight; we just feed it the index and route on select.
 */
export function DocsCommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

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

  function go(href: string) {
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex h-9 items-center gap-2 rounded-md border border-input bg-background pl-2.5 pr-2 text-sm text-muted-foreground shadow-xs",
          "transition-[border-color,box-shadow,scale] duration-fast ease-out",
          "hover:border-ring/50 active:scale-[0.98]",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent",
        )}
        aria-label="Search components"
      >
        <MagnifyingGlass weight="bold" className="size-4 shrink-0" />
        <span className="hidden sm:inline">Search components…</span>
        <span className="ml-4 hidden items-center gap-1 sm:flex">
          <Kbd size="sm" variant="ghost">⌘</Kbd>
          <Kbd size="sm" variant="ghost">K</Kbd>
        </span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        label="Search documentation"
        title="Search documentation"
        description="Jump to any component or page in the docs."
      >
        <CommandInput placeholder="Search components, sections, foundations…" />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          {SEARCH_GROUPS.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  keywords={item.keywords}
                  onSelect={() => go(item.href)}
                >
                  <item.icon aria-hidden weight="bold" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
