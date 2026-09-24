"use client"

import * as React from "react"
import { DotsThreeVertical, type Icon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Toolbar, ToolbarButton, ToolbarSeparator, type ToolbarProps } from "./toolbar"

/**
 * ToolbarOverflow: a {@link Toolbar} that keeps itself from overflowing. It shows as many
 * controls as fit its width and folds the rest into a trailing three-dots menu, recomputing live
 * as the space changes. Give it your controls as data (`items`); it renders each one twice — as a
 * bar control and as a menu row — from a single source, so the two never drift.
 *
 * How it fits: on first paint every control is in the DOM, so each one's pixel footprint is
 * measured ONCE into a ref; from then on a ResizeObserver only re-runs a cheap greedy pack against
 * the live track width (reserving room for the overflow trigger + its divider, and never ending
 * the visible run on a separator). The reads and the single setState live inside `measure()`, not
 * the effect body, to satisfy the strict react-hooks lint.
 *
 * Horizontal only (the overflow model is width-based). For a scrolling bar instead of a menu, use
 * `<Toolbar scrollable>`; for hand-curated caret groups, compose Toolbar + DropdownMenu yourself.
 */

/** A visual divider between groups; collapses cleanly when it lands on the fold. */
export type ToolbarOverflowSeparator = { type: "separator"; id: string }

/** A one-shot command: a bar button and, in the menu, a normal row. */
export type ToolbarOverflowAction = {
  type: "action"
  id: string
  icon: Icon
  label: string
  shortcut?: string
  disabled?: boolean
  /** Style the menu row (and mark it) as destructive. */
  destructive?: boolean
  onSelect?: () => void
}

/** A control that holds a pressed state: a lit chip in the bar, a checkbox row in the menu. */
export type ToolbarOverflowToggle = {
  type: "toggle"
  id: string
  icon: Icon
  label: string
  shortcut?: string
  disabled?: boolean
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export type ToolbarOverflowItem =
  | ToolbarOverflowSeparator
  | ToolbarOverflowAction
  | ToolbarOverflowToggle

export interface ToolbarOverflowProps
  extends Omit<ToolbarProps, "children" | "orientation" | "scrollable"> {
  /** The controls, in order. Whatever doesn't fit folds into the overflow menu, in this order. */
  items: ToolbarOverflowItem[]
  /** Tooltip + accessible name for the overflow trigger (a count is appended). @default "More" */
  overflowLabel?: string
  /** Which edge the overflow menu aligns to. @default "end" */
  menuAlign?: "start" | "center" | "end"
}

// Drop separators that would dangle in the overflow menu: no leading, trailing, or doubled rules.
function withoutDanglingSeparators(items: ToolbarOverflowItem[]) {
  const out: ToolbarOverflowItem[] = []
  for (const item of items) {
    if (item.type === "separator" && (out.length === 0 || out[out.length - 1].type === "separator"))
      continue
    out.push(item)
  }
  while (out.length > 0 && out[out.length - 1].type === "separator") out.pop()
  return out
}

export function ToolbarOverflow({
  items,
  overflowLabel = "More",
  menuAlign = "end",
  className,
  ...toolbarProps
}: ToolbarOverflowProps) {
  const [visibleCount, setVisibleCount] = React.useState(items.length)
  const trackRef = React.useRef<HTMLDivElement>(null)
  // Cached control footprints, keyed by count. `sep` marks which are dividers (read from the DOM,
  // so `measure` never closes over `items` — only `items.length`). Recaptured when the count changes.
  const footprintsRef = React.useRef<{ len: number; sizes: number[]; sep: boolean[] }>({
    len: -1,
    sizes: [],
    sep: [],
  })

  // When the number of controls changes, re-show all of them (so every control is in the DOM to be
  // re-measured). Render-time state reset per the strict react-hooks lint — no effect, no ref write.
  const [measuredLen, setMeasuredLen] = React.useState(items.length)
  if (measuredLen !== items.length) {
    setMeasuredLen(items.length)
    setVisibleCount(items.length)
  }

  React.useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      const box = trackRef.current
      const bar = box?.querySelector<HTMLElement>('[data-slot="toolbar"]')
      if (!bar || !box) return

      // Cache each control's footprint (border-box + margins) once per control count, while every
      // control is still in the DOM. `data-tool-sep` tags the dividers for the reserve/trim math.
      const cache = footprintsRef.current
      if (cache.len !== items.length) {
        const els = bar.querySelectorAll<HTMLElement>("[data-tool]")
        if (els.length !== items.length) return
        const sizes: number[] = []
        const sep: boolean[] = []
        els.forEach((el) => {
          const cs = getComputedStyle(el)
          sizes.push(el.offsetWidth + parseFloat(cs.marginLeft) + parseFloat(cs.marginRight))
          sep.push(el.hasAttribute("data-tool-sep"))
        })
        footprintsRef.current = { len: items.length, sizes, sep }
      }

      const { sizes, sep } = footprintsRef.current
      const barStyle = getComputedStyle(bar)
      const chrome =
        parseFloat(barStyle.paddingLeft) +
        parseFloat(barStyle.paddingRight) +
        parseFloat(barStyle.borderLeftWidth) +
        parseFloat(barStyle.borderRightWidth)
      const available = box.clientWidth - chrome
      const total = sizes.reduce((sum, w) => sum + w, 0)

      let count = items.length
      if (total > available) {
        // Reserve room for the overflow trigger and the divider that fences it off.
        const firstButton = sep.findIndex((s) => !s)
        const firstSeparator = sep.findIndex((s) => s)
        const reserve =
          (firstButton >= 0 ? sizes[firstButton] : 0) +
          (firstSeparator >= 0 ? sizes[firstSeparator] : 0)
        let used = 0
        count = 0
        for (const w of sizes) {
          if (used + w > available - reserve) break
          used += w
          count += 1
        }
      }
      // Never end the visible run on a divider (it would float against the overflow fence).
      while (count > 0 && sep[count - 1]) count -= 1
      setVisibleCount(count)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [items.length])

  const overflow = withoutDanglingSeparators(items.slice(visibleCount))
  const overflowCount = overflow.filter((it) => it.type !== "separator").length

  return (
    <div ref={trackRef} className={cn("flex w-full min-w-0 items-center", className)}>
      <Toolbar {...toolbarProps}>
        {items.slice(0, visibleCount).map((item) => (
          <BarControl key={item.id} item={item} />
        ))}

        {overflow.length > 0 && (
          <>
            <ToolbarSeparator />
            <DropdownMenu>
              <Tooltip content={overflowLabel}>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton aria-label={`${overflowLabel} (${overflowCount})`}>
                    <DotsThreeVertical weight="bold" />
                  </ToolbarButton>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent align={menuAlign} className="w-56">
                {overflow.map((item) => (
                  <MenuRow key={item.id} item={item} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </Toolbar>
    </div>
  )
}

/** One control as it appears in the bar. `data-tool` tags it for the width measurement. */
function BarControl({ item }: { item: ToolbarOverflowItem }) {
  if (item.type === "separator") return <ToolbarSeparator data-tool data-tool-sep />
  const Glyph = item.icon
  if (item.type === "toggle") {
    return (
      <ToolbarButton
        data-tool
        tooltip={item.label}
        shortcut={item.shortcut}
        pressed={item.pressed}
        disabled={item.disabled}
        onClick={() => item.onPressedChange?.(!item.pressed)}
      >
        <Glyph weight="bold" />
      </ToolbarButton>
    )
  }
  return (
    <ToolbarButton
      data-tool
      tooltip={item.label}
      shortcut={item.shortcut}
      disabled={item.disabled}
      onClick={item.onSelect}
    >
      <Glyph weight="bold" />
    </ToolbarButton>
  )
}

/** The same control as a row in the overflow menu. */
function MenuRow({ item }: { item: ToolbarOverflowItem }) {
  if (item.type === "separator") return <DropdownMenuSeparator />
  const Glyph = item.icon
  if (item.type === "toggle") {
    return (
      <DropdownMenuCheckboxItem
        checked={item.pressed}
        disabled={item.disabled}
        onCheckedChange={(next) => item.onPressedChange?.(next)}
        onSelect={(event) => event.preventDefault()}
      >
        <Glyph weight="bold" />
        {item.label}
      </DropdownMenuCheckboxItem>
    )
  }
  return (
    <DropdownMenuItem
      disabled={item.disabled}
      variant={item.destructive ? "destructive" : undefined}
      onSelect={() => item.onSelect?.()}
    >
      <Glyph weight="bold" />
      {item.label}
      {item.shortcut ? <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut> : null}
    </DropdownMenuItem>
  )
}
