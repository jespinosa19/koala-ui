"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import {
  Airplane,
  Clock,
  Confetti,
  Flag,
  ForkKnife,
  HandWaving,
  Heart,
  Lightbulb,
  MagnifyingGlass,
  PawPrint,
  Smiley,
  Star,
  X,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity, type Density } from "@/lib/density"
import {
  InputField,
  InputPrefix,
  InputRoot,
  InputSuffixButton,
} from "@/components/ui/input"

import {
  emojiCategories,
  defaultEmojiPresets,
  type EmojiCategory,
  type EmojiDatum,
} from "./data"

/**
 * EmojiPicker: a complete, self-contained picker: search, a scroll-spy category nav,
 * a pinned "frequently used" preset row, a persisted "recently used" row, a hovered/focused
 * preview footer, and **lazy category pagination** so a large emoji set never paints all at
 * once (categories mount in batches as you scroll; search results stream the same way).
 *
 * It's a cohesive widget rather than a kit of recompose-able parts: the search, nav,
 * viewport and footer are too tightly coupled (shared scroll position, active section,
 * roving focus) to hand to a consumer as loose parts. So the public surface is the
 * configured `EmojiPicker` plus a thin Radix-Popover trio (`EmojiPickerPopover`,
 * `EmojiPickerTrigger`, `EmojiPickerContent`) for the common "click a button → pick" flow.
 *
 * The dataset is a `data` prop (defaults to a curated set in ./data), so a consumer can
 * swap in the full Unicode export without touching the component. See docs/ARCHITECTURE.md.
 */

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Fixed grid width: keeps roving-focus arithmetic (±COLUMNS) deterministic. */
const COLUMNS = 8

/**
 * Category id → nav icon. Outline (default Phosphor weight), per the DS icon rule.
 * Kept as a map (not inline) so swapping a category's glyph is a one-line change.
 */
const CATEGORY_ICON_MAP: Record<string, Icon> = {
  smileys: Smiley,
  people: HandWaving,
  animals: PawPrint,
  food: ForkKnife,
  activities: Confetti,
  travel: Airplane,
  objects: Lightbulb,
  symbols: Heart,
  flags: Flag,
}

// ─── Variants ───────────────────────────────────────────────────────────────────

export const emojiPickerVariants = tv({
  slots: {
    root: [
      "flex flex-col overflow-hidden rounded-xl border border-border-soft bg-popover text-popover-foreground shadow-lg",
      // Expose this surface so the nested search Input blends with the panel (not the page).
      "[--surface:var(--popover)]",
    ],
    searchRow: "shrink-0 border-b border-border",
    nav: "flex shrink-0 items-center gap-0.5 border-b border-border px-1.5 py-1.5",
    navItem: [
      "relative flex flex-1 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
      "transition-[background-color,color,transform] duration-fast ease-out",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-popover",
      "data-[active=true]:bg-accent data-[active=true]:text-brand",
      // polish: a ≥40px-tall hit target on a dense toolbar without
      // growing the visual. Vertical-only (inset-x-0), so it never overlaps a neighbor.
      "before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
      "[&_svg]:shrink-0",
    ],
    // `min-h-0` lets the viewport shrink inside a height-constrained popover; the per-density
    // `max-h-*` caps it so a large emoji set scrolls instead of growing the panel unbounded.
    // (A plain `h-*` here is silently overridden by `flex-1`'s `flex-basis: 0%` when the parent
    // height is indefinite, which is why the grid used to overflow with no scroll.)
    // No top padding: a `pt-*` here leaves a sliver above the sticky header where the previous
    // section's rows peek through. The header's own padding supplies the top breathing room.
    // `scroll-fade-b` (bottom edge only, never the top) softens the last row into the footer
    // without touching the sticky section header up top; `scroll-pb-10` matches the fade depth so
    // an arrow-focused emoji near the bottom scrolls in clear of the fade.
    viewport:
      "relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 pb-1 scroll-fade-b scroll-pb-10",
    section: "scroll-mt-1",
    // Sticky header. Must be FULLY OPAQUE (no /opacity, no blur) so emojis scrolling beneath it
    // never show through; `-mx-2` bleeds it over the viewport's side padding so nothing peeks at
    // the edges either. tabular-nums keeps the live "Results (N)" count from reflowing.
    sectionHeader:
      "sticky top-0 z-10 -mx-2 bg-popover px-3 pb-1.5 pt-2 text-xs font-medium tabular-nums text-muted-foreground",
    grid: "grid grid-cols-8 gap-0.5",
    emojiButton: [
      "flex aspect-square items-center justify-center rounded-md leading-none select-none cursor-pointer",
      "transition-[background-color,transform] duration-fast ease-out",
      // polish: tactile press (exactly 0.96).
      "hover:bg-accent active:scale-[0.96]",
      "outline-none focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-brand",
    ],
    footer: "flex h-11 shrink-0 items-center gap-2 border-t border-border px-3",
    previewEmoji: "leading-none",
    previewLabel: "truncate text-xs text-muted-foreground",
    empty:
      "flex flex-col items-center justify-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For the picker it
    // tunes the panel width, viewport max-height, grid gap, and emoji size, never color/radius.
    density: {
      comfortable: {
        root: "w-[352px]",
        searchRow: "p-2",
        viewport: "max-h-72",
        grid: "gap-1",
        emojiButton: "text-[22px]",
        navItem: "h-9 [&_svg]:size-[18px]",
        previewEmoji: "text-[26px]",
      },
      compact: {
        root: "w-80",
        searchRow: "p-1.5",
        viewport: "max-h-64",
        grid: "gap-0.5",
        emojiButton: "text-xl",
        navItem: "h-8 [&_svg]:size-4",
        previewEmoji: "text-2xl",
      },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

// ─── A tiny controllable-state hook (for the Popover wrapper) ────────────────────

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T) : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [value, setValue] as const
}

// ─── EmojiPicker ──────────────────────────────────────────────────────────────────

export interface EmojiPickerProps
  extends Omit<React.ComponentProps<"div">, "onSelect">,
    VariantProps<typeof emojiPickerVariants> {
  /** Categorized dataset. Defaults to the curated set in `./data`. */
  data?: EmojiCategory[]
  /** Fixed "frequently used" quick-pick row, pinned above the categories. */
  presets?: string[]
  /** Controlled recently-used list (chars, most-recent first). */
  recent?: string[]
  /** Initial recents when uncontrolled. */
  defaultRecent?: string[]
  /** Fires whenever the recents change (controlled or not). */
  onRecentChange?: (recent: string[]) => void
  /** Max recents kept. */
  recentLimit?: number
  /** localStorage key for persisting uncontrolled recents. Pass `null` to disable. */
  storageKey?: string | null
  /** Fires when an emoji is chosen. */
  onEmojiSelect?: (emoji: string, datum: EmojiDatum) => void
  showSearch?: boolean
  showPreview?: boolean
  showRecent?: boolean
  showPresets?: boolean
  /** How many categories to mount per lazy batch (and initially). Lower = lighter first paint. */
  categoriesPerPage?: number
  searchPlaceholder?: string
  recentLabel?: string
  presetsLabel?: string
  /** Footer hint shown before anything is hovered/focused. */
  previewPlaceholder?: string
  density?: Density
}

export function EmojiPicker({
  className,
  data = emojiCategories,
  presets = defaultEmojiPresets,
  recent: recentProp,
  defaultRecent,
  onRecentChange,
  recentLimit = 24,
  storageKey = "koala-emoji-recent",
  onEmojiSelect,
  showSearch = true,
  showPreview = true,
  showRecent = true,
  showPresets = true,
  categoriesPerPage = 3,
  searchPlaceholder = "Search emoji",
  recentLabel = "Recently used",
  presetsLabel = "Frequently used",
  previewPlaceholder = "Pick an emoji",
  density,
  ...props
}: EmojiPickerProps) {
  const slots = emojiPickerVariants({ density: useDensity(density) })

  const [query, setQuery] = React.useState("")
  const [preview, setPreview] = React.useState<EmojiDatum | null>(null)
  const [activeCategory, setActiveCategory] = React.useState<string>("")

  // Lazy pagination: only `mountedCount` categories are in the DOM; a bottom sentinel bumps
  // it as you scroll. Counts only ever grow, so scroll height never jitters.
  const [mountedCount, setMountedCount] = React.useState(categoriesPerPage)
  const [visibleResults, setVisibleResults] = React.useState(categoriesPerPage * COLUMNS * 2)

  const viewportRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const pendingScrollRef = React.useRef<string | null>(null)

  // Sections are looked up by a data-attribute (not a ref registry) so jump/scroll-spy stay
  // simple and there's no ref-callback churn as categories mount.
  const getSectionEl = React.useCallback(
    (id: string): HTMLElement | null =>
      viewportRef.current?.querySelector<HTMLElement>(`[data-emoji-section="${id}"]`) ?? null,
    [],
  )

  // ── Char → datum index (built from the active dataset, so custom data resolves) ──
  const index = React.useMemo(() => {
    const map = new Map<string, EmojiDatum>()
    for (const cat of data) for (const e of cat.emojis) map.set(e.char, e)
    return map
  }, [data])

  const resolve = React.useCallback(
    (char: string): EmojiDatum => index.get(char) ?? { char, name: char },
    [index],
  )

  // ── Recents (controlled, or uncontrolled + persisted) ──
  const isRecentControlled = recentProp !== undefined
  const [recentState, setRecentState] = React.useState<string[]>(defaultRecent ?? [])

  // Hydrate from storage *after* mount so SSR and the first client render match (both empty),
  // avoiding a hydration mismatch; the effect then fills in the persisted list.
  React.useEffect(() => {
    if (isRecentControlled || !storageKey) return
    const hydrate = () => {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) setRecentState(JSON.parse(raw) as string[])
      } catch {
        /* storage unavailable / malformed, ignore */
      }
    }
    hydrate()
  }, [isRecentControlled, storageKey])

  const recent = isRecentControlled ? recentProp! : recentState

  const pushRecent = React.useCallback(
    (char: string) => {
      const next = [char, ...recent.filter((c) => c !== char)].slice(0, recentLimit)
      onRecentChange?.(next)
      if (!isRecentControlled) {
        setRecentState(next)
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next))
          } catch {
            /* ignore */
          }
        }
      }
    },
    [recent, recentLimit, onRecentChange, isRecentControlled, storageKey],
  )

  const handleSelect = React.useCallback(
    (datum: EmojiDatum) => {
      onEmojiSelect?.(datum.char, datum)
      if (showRecent) pushRecent(datum.char)
    },
    [onEmojiSelect, showRecent, pushRecent],
  )

  // ── Derived sections ──
  const recentData = React.useMemo(() => recent.map(resolve), [recent, resolve])
  const presetData = React.useMemo(() => presets.map(resolve), [presets, resolve])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: EmojiDatum[] = []
    for (const cat of data) {
      for (const e of cat.emojis) {
        if (
          e.name.toLowerCase().includes(q) ||
          e.keywords?.some((k) => k.toLowerCase().includes(q))
        ) {
          out.push(e)
        }
      }
    }
    return out
  }, [query, data])

  const navItems = React.useMemo(() => {
    const items: { id: string; label: string; Icon: Icon }[] = []
    if (showRecent && recentData.length) items.push({ id: "recent", label: recentLabel, Icon: Clock })
    if (showPresets && presetData.length)
      items.push({ id: "presets", label: presetsLabel, Icon: Star })
    for (const cat of data)
      items.push({ id: cat.id, label: cat.label, Icon: CATEGORY_ICON_MAP[cat.id] ?? Smiley })
    return items
  }, [data, showRecent, showPresets, recentData.length, presetData.length, recentLabel, presetsLabel])

  // Reset pagination the instant the query changes: the React-recommended "adjust state
  // during render on input change" pattern (no effect, so no cascading-render lint flag).
  const [prevQuery, setPrevQuery] = React.useState(query)
  if (prevQuery !== query) {
    setPrevQuery(query)
    setMountedCount(categoriesPerPage)
    setVisibleResults(categoriesPerPage * COLUMNS * 2)
  }

  // The scroll-to-top that pairs with that reset is a DOM side effect (no setState).
  React.useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0 })
  }, [query])

  // ── Lazy load-more (categories while browsing, results while searching) ──
  const hasMore = query
    ? visibleResults < results.length
    : mountedCount < data.length

  const loadMore = React.useCallback(() => {
    if (query) setVisibleResults((c) => c + categoriesPerPage * COLUMNS * 2)
    else setMountedCount((c) => c + categoriesPerPage)
  }, [query, categoriesPerPage])

  React.useEffect(() => {
    const vp = viewportRef.current
    const sentinel = sentinelRef.current
    if (!vp || !sentinel || !hasMore) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore()
      },
      { root: vp, rootMargin: "240px" },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [hasMore, loadMore])

  // ── Scroll-spy: highlight the nav item for the section nearest the viewport top ──
  React.useEffect(() => {
    if (query) return
    const vp = viewportRef.current
    if (!vp) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const top = vp.scrollTop
        let current = navItems[0]?.id ?? ""
        for (const item of navItems) {
          const el = getSectionEl(item.id)
          if (el && el.offsetTop - 12 <= top) current = item.id
          else break // sections are ordered; the first one past the fold ends the scan
        }
        setActiveCategory(current)
      })
    }
    vp.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      vp.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [query, navItems, mountedCount, getSectionEl])

  // ── Nav jump (mount the target category first if it's still lazy, then scroll to it) ──
  const scrollToSection = React.useCallback(
    (id: string) => {
      const el = getSectionEl(id)
      const vp = viewportRef.current
      if (el && vp) vp.scrollTo({ top: el.offsetTop - 4, behavior: "smooth" })
    },
    [getSectionEl],
  )

  const handleNavClick = React.useCallback(
    (id: string) => {
      setActiveCategory(id)
      const catIndex = data.findIndex((c) => c.id === id)
      if (catIndex >= 0 && catIndex + 1 > mountedCount) {
        pendingScrollRef.current = id
        setMountedCount(catIndex + 1)
      } else {
        scrollToSection(id)
      }
    },
    [data, mountedCount, scrollToSection],
  )

  React.useLayoutEffect(() => {
    const id = pendingScrollRef.current
    if (id && getSectionEl(id)) {
      scrollToSection(id)
      pendingScrollRef.current = null
    }
  }, [mountedCount, scrollToSection, getSectionEl])

  // ── Roving focus across the grid (arrows + Home/End) ──
  const handleViewportKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    const buttons = Array.from(
      viewportRef.current?.querySelectorAll<HTMLButtonElement>("[data-emoji-button]") ?? [],
    )
    if (!buttons.length) return
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement)
    let next = -1
    switch (e.key) {
      case "ArrowRight":
        next = idx + 1
        break
      case "ArrowLeft":
        next = idx - 1
        break
      case "ArrowDown":
        next = idx + COLUMNS
        break
      case "ArrowUp":
        next = idx - COLUMNS
        break
      case "Home":
        next = 0
        break
      case "End":
        next = buttons.length - 1
        break
      default:
        return
    }
    if (idx === -1) next = 0
    if (next >= 0 && next < buttons.length) {
      e.preventDefault()
      buttons[next].focus()
    }
  }, [])

  const focusFirstEmoji = React.useCallback(() => {
    viewportRef.current
      ?.querySelector<HTMLButtonElement>("[data-emoji-button]")
      ?.focus()
  }, [])

  // ── Render helpers ──
  const renderSection = (id: string, label: string, emojis: EmojiDatum[]) => (
    <div
      key={id}
      data-emoji-section={id}
      data-slot="emoji-picker-section"
      role="group"
      aria-label={label}
      className={slots.section()}
    >
      <div data-slot="emoji-picker-section-header" className={slots.sectionHeader()}>
        {label}
      </div>
      <div className={slots.grid()}>
        {emojis.map((e, i) => (
          <button
            key={`${e.char}-${i}`}
            type="button"
            data-emoji-button
            data-slot="emoji-picker-emoji"
            aria-label={e.name}
            title={e.name}
            className={slots.emojiButton()}
            onClick={() => handleSelect(e)}
            onMouseEnter={() => setPreview(e)}
            onFocus={() => setPreview(e)}
          >
            {e.char}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div data-slot="emoji-picker" className={slots.root({ className })} {...props}>
      {showSearch && (
        <div className={slots.searchRow()}>
          <InputRoot size="sm">
            <InputPrefix>
              <MagnifyingGlass weight="bold" />
            </InputPrefix>
            <InputField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search emoji"
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  focusFirstEmoji()
                }
              }}
            />
            {query && (
              <InputSuffixButton aria-label="Clear search" onClick={() => setQuery("")}>
                <X weight="bold" />
              </InputSuffixButton>
            )}
          </InputRoot>
        </div>
      )}

      {!query && (
        <div data-slot="emoji-picker-nav" className={slots.nav()}>
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Jump to ${label}`}
              data-active={activeCategory === id || undefined}
              className={slots.navItem()}
              onClick={() => handleNavClick(id)}
            >
              <Icon weight="bold" />
            </button>
          ))}
        </div>
      )}

      <div
        ref={viewportRef}
        data-slot="emoji-picker-viewport"
        className={slots.viewport()}
        onKeyDown={handleViewportKeyDown}
      >
        {query ? (
          results.length > 0 ? (
            <>
              {renderSection(
                "search",
                `Results (${results.length})`,
                results.slice(0, visibleResults),
              )}
              {visibleResults < results.length && (
                <div ref={sentinelRef} aria-hidden className="h-px w-full" />
              )}
            </>
          ) : (
            <div data-slot="emoji-picker-empty" className={slots.empty()}>
              <Smiley weight="bold" className="size-6 opacity-60" />
              <p>
                No emoji for <span className="font-medium text-foreground">“{query}”</span>
              </p>
            </div>
          )
        ) : (
          <>
            {showRecent &&
              recentData.length > 0 &&
              renderSection("recent", recentLabel, recentData)}
            {showPresets &&
              presetData.length > 0 &&
              renderSection("presets", presetsLabel, presetData)}
            {data.slice(0, mountedCount).map((cat) => renderSection(cat.id, cat.label, cat.emojis))}
            {mountedCount < data.length && (
              <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            )}
          </>
        )}
      </div>

      {showPreview && (
        <div data-slot="emoji-picker-footer" className={slots.footer()}>
          {preview ? (
            <>
              <span className={slots.previewEmoji()}>{preview.char}</span>
              <span className={slots.previewLabel()}>{preview.name}</span>
            </>
          ) : (
            <span className={slots.previewLabel()}>{previewPlaceholder}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Popover wrappers ─────────────────────────────────────────────────────────────

// Lets EmojiPickerContent close the popover on select. Optional (null when used bare).
const EmojiPickerPopoverContext = React.createContext<((open: boolean) => void) | null>(null)

export type EmojiPickerPopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>

/** Root: manages open state and lets the content close itself on select. */
export function EmojiPickerPopover({
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: EmojiPickerPopoverProps) {
  const [value, setValue] = useControllableState(open, defaultOpen ?? false, onOpenChange)
  return (
    <EmojiPickerPopoverContext.Provider value={setValue}>
      <PopoverPrimitive.Root open={value} onOpenChange={setValue} {...props}>
        {children}
      </PopoverPrimitive.Root>
    </EmojiPickerPopoverContext.Provider>
  )
}

/** Trigger: wrap any element with `asChild` to open the picker. */
export const EmojiPickerTrigger = PopoverPrimitive.Trigger

export interface EmojiPickerContentProps
  extends Omit<React.ComponentProps<typeof PopoverPrimitive.Content>, "onSelect">,
    Omit<EmojiPickerProps, "className"> {
  /** Classes for the Popover content wrapper (the picker keeps its own width). */
  className?: string
  /** Close the popover after a pick. */
  closeOnSelect?: boolean
}

/** Content: portals the picker into a positioned, animated popover. */
export function EmojiPickerContent({
  className,
  sideOffset = 8,
  align = "start",
  closeOnSelect = true,
  onEmojiSelect,
  ...pickerProps
}: EmojiPickerContentProps) {
  const setOpen = React.useContext(EmojiPickerPopoverContext)
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="emoji-picker-popover-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 outline-none",
          // Enter & exit mirror DropdownMenu: fade + directional slide, no scale.
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
          "duration-base ease-out",
          className,
        )}
      >
        <EmojiPicker
          {...pickerProps}
          onEmojiSelect={(char, datum) => {
            onEmojiSelect?.(char, datum)
            if (closeOnSelect) setOpen?.(false)
          }}
        />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
