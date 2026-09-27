"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * TableOfContents: the "On this page" nav beside a long document. It lists the document's
 * sections and marks the one being read as you scroll (a scroll-spy), so a reader who came for
 * one clause can jump to it and always knows where they are.
 *
 * The spy needs no list of ids: every `TableOfContentsItem` registers the `#id` its `href` points
 * at, and the root watches those headings. The items are plain anchors, so the jump, the URL hash,
 * the back button and the focus starting point all stay the browser's. For a glide, set
 * `scroll-behavior: smooth` on `html` (behind `prefers-reduced-motion: no-preference`). The one
 * exception is a TOC that spies a scroll `container`: there a native jump would scroll the page as
 * well, so the item scrolls the container instead.
 *
 * A heading counts as reached once it sits where an anchor jump would park it: the top of the view
 * plus its own `scroll-margin-top`. Reading the margin off the heading keeps the spy and the jump in
 * agreement under a sticky header with no second offset to keep in sync. A clicked item holds the
 * mark while the page travels to it, so a smooth scroll doesn't flick through every section it
 * passes, and gives it back the moment the reader scrolls themselves.
 *
 * Six looks, one behaviour. `line` slides a bar along a hairline track and `progress` fills the
 * track down to the section being read; `pill` slides a soft chip behind the active row; `dash`
 * leads every row with a short rule that extends for the active one; `plain` marks it by ink
 * alone; `minimap` rests as a column of dashes, one per section, and opens into the full list on
 * hover or focus. The sliding marks are the list's own `::before`, placed from JS through two CSS
 * variables, so the list stays a valid `<ol>` and a consumer restyles them with `before:` classes
 * on `TableOfContentsList`.
 *
 * EVERY PART IS DROPPABLE (ARCHITECTURE.md §3): the title is optional, and the root's gap is the
 * only spacing between the parts, so nothing leans on a sibling that might not be there.
 */
// The sliding mark (line, progress, pill): the list's `::before`, sized and placed by the two CSS
// variables `TableOfContentsList` writes. Hidden until the first placement, which snaps; every
// later move slides, and a reduced-motion reader gets the jump alone.
const slidingMark = [
  "before:pointer-events-none before:absolute before:top-0 before:content-['']",
  "before:h-(--toc-indicator-h) before:translate-y-(--toc-indicator-y) before:opacity-0",
  "data-[indicator=visible]:before:opacity-100",
  "data-indicator-motion:before:transition-[translate,height,opacity] before:duration-base before:ease-out motion-reduce:before:transition-none",
]

// The hairline track (line, progress): the bar is 2px on the 1px track, overhanging it by a pixel
// on the inside. The inset ring keeps focus inside the rail, where a scrolling column would clip
// an outer one, and hovering a row darkens its stretch of the track, except under the bar.
const track = {
  list: ["border-l border-border", ...slidingMark, "before:-left-px before:w-0.5 before:rounded-full before:bg-brand"],
  item: [
    "pr-2 focus-visible:ring-inset",
    "before:absolute before:inset-y-0 before:-left-px before:w-px before:bg-foreground/25 before:opacity-0 before:content-['']",
    "before:transition-opacity before:duration-fast before:ease-out hover:before:opacity-100",
    "aria-[current=location]:before:hidden",
  ],
}

export const tableOfContentsVariants = tv({
  slots: {
    // `group/toc` lets the minimap open while the pointer or the focus is anywhere inside it.
    root: "group/toc flex flex-col",
    title: "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
    // `relative` makes the list the items' offsetParent, which is what the marks are measured
    // against. The counter feeds `numbered`; it costs nothing when the numbers aren't rendered.
    list: "relative flex flex-col [counter-reset:toc]",
    // The <li>. A level-2 row opens a fresh sub-count, so a level-3 row under it reads "2.1". A
    // counter reset on an element reaches its following siblings, which is what lets flat <li>s
    // nest their numbering without nested lists.
    row: "",
    item: [
      "relative flex gap-2 rounded-sm text-sm text-pretty text-muted-foreground",
      "outline-none transition-colors duration-fast ease-out",
      "hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand",
      "aria-[current=location]:font-medium aria-[current=location]:text-foreground",
    ],
    // Generated from the list's counter, so it can never disagree with the order on screen. Screen
    // readers get the order from the <ol> itself, so the glyph is aria-hidden.
    number: "shrink-0 tabular-nums",
    // The minimap's resting column: one dash per item, hung from the inline-end edge. Decorative
    // (the links live in the list), so it is aria-hidden; `cursor-pointer` also lets a tap open it.
    minimap: "hidden",
    mark: "h-0.5 w-4 rounded-full bg-muted-foreground/35 transition-[width,background-color] duration-base ease-out motion-reduce:transition-none",
  },
  variants: {
    variant: {
      // A hairline track with a bar that slides to the active item.
      line: track,
      // The same track, filled from the top down to the bottom of the active row: how far in the
      // reader is, not only where.
      progress: track,
      // A soft chip that slides behind the active row, the Sidebar's active fill. The title steps
      // in by the rows' padding so its text lines up with theirs; the chip never bleeds past the
      // column, so a scrolling rail can't clip it.
      pill: {
        title: "px-3",
        list: [...slidingMark, "before:inset-x-0 before:rounded-md before:bg-accent"],
        item: "rounded-md px-3 focus-visible:ring-inset",
      },
      // A short rule leads every row and runs to full length on the active one. It sits on the
      // first line of a label that wraps, and its box keeps its width, so the text never shifts.
      dash: {
        item: [
          "items-start pr-2",
          "before:mt-2.5 before:h-px before:w-4 before:shrink-0 before:origin-left before:rounded-full before:content-['']",
          "before:scale-x-50 before:bg-muted-foreground/40 before:transition-[scale,background-color] before:duration-base before:ease-out motion-reduce:before:transition-none",
          "[&:not([aria-current]):hover]:before:scale-x-75 [&:not([aria-current]):hover]:before:bg-muted-foreground",
          "aria-[current=location]:before:scale-x-100 aria-[current=location]:before:bg-brand",
        ],
      },
      // No track and no bar: the active item is marked by ink and weight alone.
      plain: {
        item: "pr-2",
      },
      // At rest, a column of dashes (a map of the document's shape) and nothing else. Hovering
      // or tabbing into it opens the list: the menu surface grows out of the column, clipped from
      // its corner, so the dashes swell into the panel rather than a popover appearing beside
      // them. The links stay in the tab order while it is closed, so Tab opens it; keyboard focus
      // holds it open, a mouse click (which also focuses the link) does not. The title is
      // kept for assistive tech; the nav's own label already names it.
      minimap: {
        root: "relative",
        title: "sr-only",
        // Faded while the panel is open, and 2px in from the edge so no dash peeks past its corner.
        minimap: [
          "flex cursor-pointer flex-col items-end gap-2 self-end py-2 pr-0.5 pl-4",
          "transition-opacity duration-base ease-out group-hover/toc:opacity-0 group-has-[:focus-visible]/toc:opacity-0 motion-reduce:transition-none",
        ],
        mark: "data-[level=3]:w-2.5 data-active:w-6 data-active:bg-brand",
        list: [
          "absolute top-0 right-0 z-20 w-60 max-w-[calc(100vw-2rem)] p-1",
          // The DropdownMenu surface: rounded-lg (16) with p-1 (4) around rounded-md (12) rows.
          "rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-border ring-inset [--surface:var(--popover)]",
          "pointer-events-none opacity-0",
          "[clip-path:inset(0_0_calc(100%-var(--toc-rest-h,0px))_calc(100%-var(--toc-rest-w,0px))_round_var(--radius-lg))]",
          "transition-[opacity,clip-path] duration-base ease-out motion-reduce:transition-none",
          "group-hover/toc:pointer-events-auto group-hover/toc:opacity-100 group-hover/toc:[clip-path:inset(0_round_var(--radius-lg))]",
          "group-has-[:focus-visible]/toc:pointer-events-auto group-has-[:focus-visible]/toc:opacity-100 group-has-[:focus-visible]/toc:[clip-path:inset(0_round_var(--radius-lg))]",
        ],
        item: [
          "rounded-md px-2 hover:bg-accent focus-visible:bg-accent focus-visible:ring-0",
          "aria-[current=location]:bg-accent",
        ],
      },
    },
    level: {
      2: { row: "[counter-increment:toc] [counter-reset:toc-sub]", number: "before:content-[counter(toc)_'.']" },
      3: { row: "[counter-increment:toc-sub]", number: "before:content-[counter(toc)_'.'_counter(toc-sub)]" },
    },
    // Compact rows match the Sidebar's (32px); comfortable ones reach the 40px house minimum, so
    // the whole row is an easy target on a marketing page. On a coarse pointer both grow to 44px.
    // The row itself grows rather than a pseudo-element: stacked rows would overlap their targets.
    density: {
      compact: { root: "gap-3", item: "py-1.5 pointer-coarse:py-3" },
      comfortable: { root: "gap-4", item: "py-2.5 pointer-coarse:py-3" },
    },
  },
  compoundVariants: [
    // A level-3 row steps in by one 16px unit from where its parent's text starts.
    { variant: ["line", "progress"], level: 2, class: { item: "pl-4" } },
    { variant: ["line", "progress"], level: 3, class: { item: "pl-8" } },
    { variant: "pill", level: 3, class: { item: "pl-7" } },
    { variant: ["dash", "plain"], level: 3, class: { item: "pl-4" } },
    { variant: "minimap", level: 3, class: { item: "pl-6" } },
  ],
  defaultVariants: {
    variant: "line",
    level: 2,
  },
})

type TableOfContentsSlots = ReturnType<typeof tableOfContentsVariants>
type TableOfContentsVariant = NonNullable<VariantProps<typeof tableOfContentsVariants>["variant"]>

/** The heading levels an item can stand for: a section (2) and a subsection under it (3). */
export type TableOfContentsLevel = 2 | 3

// ─── Scroll-spy ────────────────────────────────────────────────────────────────────────────────

type ContainerRef = React.RefObject<HTMLElement | null>

/** The in-page id an href points at, or undefined for a link that leaves the page. */
function hashId(href: string | undefined) {
  if (!href?.startsWith("#") || href.length < 2) return undefined
  return decodeURIComponent(href.slice(1))
}

function scrollMarginTop(el: Element) {
  return parseFloat(getComputedStyle(el).scrollMarginTop) || 0
}

function byDocumentOrder(a: Node, b: Node) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

/** The section being read, given its headings in document order. */
function readingTarget(targets: HTMLElement[], container: HTMLElement | null) {
  const scroller = container ?? document.scrollingElement ?? document.documentElement
  const viewTop = container ? container.getBoundingClientRect().top : 0
  const viewHeight = container ? container.clientHeight : window.innerHeight
  const last = targets[targets.length - 1]

  // The closing sections of a document are often too short to ever reach the top, so at the very
  // end the last one wins. Only once the reader has scrolled: a page too short to scroll would
  // otherwise open on its final section.
  if (scroller.scrollTop > 0 && scroller.scrollTop + viewHeight >= scroller.scrollHeight - 2) {
    return last
  }

  // The first heading not yet past its parking line (with a pixel of slack, since an anchor jump
  // can land a sub-pixel short of it).
  const index = targets.findIndex(
    (target) => target.getBoundingClientRect().top - viewTop - scrollMarginTop(target) > -1,
  )
  if (index === -1) return last
  // Already in the top half of the view, it is the section being read; lower down, the reader is
  // still finishing the one before it. Before the first heading, the first one stands in.
  const upcoming = targets[index]
  const inTopHalf = upcoming.getBoundingClientRect().top - viewTop < viewHeight / 2
  return inTopHalf ? upcoming : targets[Math.max(index - 1, 0)]
}

/**
 * Watches the headings `getIds` names and reports the one being read. Measures at most once a
 * frame, on scroll and resize, and never polls. Reports only changes.
 */
function watchScrollSpy(
  getIds: () => readonly string[],
  container: HTMLElement | null,
  onChange: (id: string) => void,
) {
  let frame = 0
  let current: string | undefined

  const measure = () => {
    frame = 0
    const targets = getIds()
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .sort(byDocumentOrder)
    if (targets.length === 0) return
    const { id } = readingTarget(targets, container)
    if (id === current) return
    current = id
    onChange(id)
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  const scroller: HTMLElement | Window = container ?? window
  scroller.addEventListener("scroll", schedule, { passive: true })
  window.addEventListener("resize", schedule)
  schedule()

  return {
    update: schedule,
    destroy() {
      cancelAnimationFrame(frame)
      scroller.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    },
  }
}

export interface UseScrollSpyOptions {
  /** A scroll container to watch instead of the window. */
  container?: ContainerRef
}

/**
 * The id of the section being read, for a nav of your own (a mobile section bar, a progress
 * readout). `TableOfContents` runs the same spy for its items; reach for this only when you are
 * not rendering one. Starts on the first id, so the server render already marks a section.
 *
 *   const active = useScrollSpy(["intro", "setup", "usage"])
 */
export function useScrollSpy(ids: readonly string[], { container }: UseScrollSpyOptions = {}) {
  const [active, setActive] = React.useState<string | undefined>(ids[0])
  // Ids can't contain whitespace, so a joined key is a stable dependency for an inline array.
  const key = ids.join(" ")
  React.useEffect(() => {
    const list = key ? key.split(" ") : []
    const spy = watchScrollSpy(() => list, container?.current ?? null, setActive)
    return spy.destroy
  }, [key, container])
  return active
}

export interface TableOfContentsHeading {
  id: string
  /** The heading's text, without the controls that live in it (a copy-link anchor, a button). */
  text: string
  level: TableOfContentsLevel
}

/**
 * The headings on the page, read from the DOM, to build the items from instead of listing them by
 * hand. Levels are relative: the shallowest heading found is a section (2) and anything deeper a
 * subsection (3), so an article whose sections are h3s nests the same as one built from h2s. Pass
 * a `key` that changes when the content does (the route, in a layout that persists across pages)
 * to read them again. Returns [] on the server and on the first render.
 *
 *   const headings = useHeadings("article h2[id], article h3[id]")
 */
export function useHeadings(selector = "h2[id], h3[id]", key?: unknown) {
  const [headings, setHeadings] = React.useState<TableOfContentsHeading[]>([])
  React.useEffect(() => {
    // A frame later, so a route's content has painted before it is read.
    const frame = requestAnimationFrame(() => {
      const found = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => el.id)
      const base = Math.min(...found.map(headingRank))
      setHeadings(found.map((el) => readHeading(el, base)))
    })
    return () => cancelAnimationFrame(frame)
  }, [selector, key])
  return headings
}

/** 1 for an h1 through 6 for an h6; anything else (an aria heading on a div) ranks as an h2. */
function headingRank(el: HTMLElement) {
  return Number(/^H([1-6])$/.exec(el.tagName)?.[1] ?? 2)
}

function readHeading(el: HTMLElement, base: number): TableOfContentsHeading {
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll("a, button, [aria-hidden='true']").forEach((node) => node.remove())
  return {
    id: el.id,
    text: clone.textContent?.trim() ?? "",
    level: headingRank(el) > base ? 3 : 2,
  }
}

/** The ids the items point at. A count per id, so two items on one section can't unregister it. */
function createRegistry() {
  const counts = new Map<string, number>()
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())
  return {
    ids: () => Array.from(counts.keys()),
    add(id: string) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
      notify()
      return () => {
        const count = (counts.get(id) ?? 1) - 1
        if (count > 0) counts.set(id, count)
        else counts.delete(id)
        notify()
      }
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

// Keys that scroll the page: pressing one is the reader taking over from a clicked jump.
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "])

// ─── Parts ─────────────────────────────────────────────────────────────────────────────────────

const [TableOfContentsProvider, useTableOfContentsContext] = createContext<{
  slots: TableOfContentsSlots
  variant: TableOfContentsVariant
  numbered: boolean
  activeId: string | undefined
  registry: ReturnType<typeof createRegistry>
  navigate: (id: string, event: React.MouseEvent<HTMLAnchorElement>) => void
}>("TableOfContents")

export interface TableOfContentsProps
  extends React.ComponentProps<"nav">,
    Omit<VariantProps<typeof tableOfContentsVariants>, "level"> {
  /** The active section's id, to drive the mark yourself. The spy still reports through `onValueChange`. */
  value?: string
  /** The section marked before the spy's first reading, so the server render already has one. */
  defaultValue?: string
  /** Called with the id of the section being read, as the reader scrolls or clicks an item. */
  onValueChange?: (id: string) => void
  /** Number the items ("1.", and "2.1" for a level-3 item), for a document cited by clause. */
  numbered?: boolean
  /** A scroll container to watch instead of the window: a pane, a dialog, a preview frame. */
  container?: ContainerRef
}

export function TableOfContents({
  className,
  variant,
  density,
  numbered = false,
  value,
  defaultValue,
  onValueChange,
  container,
  "aria-label": ariaLabel = "On this page",
  ...props
}: TableOfContentsProps) {
  const slots = tableOfContentsVariants({ variant, density: useDensity(density) })
  const [registry] = React.useState(createRegistry)
  const [spied, setSpied] = React.useState(defaultValue)
  // A clicked item holds the mark until the reader scrolls on their own (see the header note).
  const [pinned, setPinned] = React.useState<string | null>(null)
  const current = pinned ?? spied

  React.useEffect(() => {
    const spy = watchScrollSpy(registry.ids, container?.current ?? null, setSpied)
    const unsubscribe = registry.subscribe(spy.update)
    return () => {
      unsubscribe()
      spy.destroy()
    }
  }, [registry, container])

  React.useEffect(() => {
    if (!pinned) return
    const release = (event: Event) => {
      if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key)) return
      // A press inside a TOC is the next jump, not the reader taking over.
      if (event.target instanceof Element && event.target.closest("[data-slot=table-of-contents]")) return
      setPinned(null)
    }
    const types = ["wheel", "touchstart", "pointerdown", "keydown"] as const
    types.forEach((type) => window.addEventListener(type, release, { capture: true, passive: true }))
    return () => types.forEach((type) => window.removeEventListener(type, release, { capture: true }))
  }, [pinned])

  // Report each change once. The ref only remembers what was last reported, so a consumer passing
  // an inline callback doesn't hear the same id again on every render.
  const reported = React.useRef(current)
  React.useEffect(() => {
    if (current === undefined || current === reported.current) return
    reported.current = current
    onValueChange?.(current)
  }, [current, onValueChange])

  function navigate(id: string, event: React.MouseEvent<HTMLAnchorElement>) {
    setPinned(id)
    const scroller = container?.current
    const target = document.getElementById(id)
    if (!scroller || !target) return
    // Scroll the container alone: a native jump would move the page around it too.
    event.preventDefault()
    const top =
      scroller.scrollTop +
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      scrollMarginTop(target)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scroller.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <TableOfContentsProvider
      slots={slots}
      variant={variant ?? "line"}
      numbered={numbered}
      activeId={value ?? current}
      registry={registry}
      navigate={navigate}
    >
      <nav data-slot="table-of-contents" aria-label={ariaLabel} className={slots.root({ className })} {...props} />
    </TableOfContentsProvider>
  )
}

export interface TableOfContentsTitleProps extends React.ComponentProps<"p"> {
  /** Render as the child element instead, e.g. an `<h2>` where the rail needs a heading. */
  asChild?: boolean
}

export function TableOfContentsTitle({ className, asChild = false, ...props }: TableOfContentsTitleProps) {
  const { slots } = useTableOfContentsContext("TableOfContentsTitle")
  const Comp = asChild ? Slot.Root : "p"
  return <Comp data-slot="table-of-contents-title" className={slots.title({ className })} {...props} />
}

const ACTIVE_ITEM = "[data-slot=table-of-contents-item][aria-current=location]"

/**
 * Tracks the active item's box inside the list for the sliding bar. Re-measures when the active
 * item changes and when the list resizes (a label re-wrapping in its bolder weight, a late font),
 * never polls. The first placement snaps; the slide switches on a frame after it has painted.
 */
function useIndicator(list: HTMLElement | null, enabled: boolean) {
  const [box, setBox] = React.useState({ top: 0, height: 0, visible: false, motion: false })

  React.useLayoutEffect(() => {
    if (!list || !enabled) return
    let frame = 0
    const measure = () => {
      const active = list.querySelector<HTMLElement>(ACTIVE_ITEM)
      if (!active) {
        setBox((prev) => (prev.visible ? { ...prev, visible: false } : prev))
        return
      }
      const { offsetTop: top, offsetHeight: height } = active
      setBox((prev) =>
        prev.visible && prev.top === top && prev.height === height ? prev : { ...prev, top, height, visible: true },
      )
      if (!frame) frame = requestAnimationFrame(() => setBox((prev) => (prev.motion ? prev : { ...prev, motion: true })))
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(list)
    const mutation = new MutationObserver(measure)
    mutation.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current"] })
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutation.disconnect()
    }
  }, [list, enabled])

  return box
}

/**
 * Keeps the active item in view when the nav itself scrolls: a docs rail capped at the viewport
 * height, on a page with more sections than fit. Only the nav moves, never the page, and only
 * when the mark would otherwise sit out of sight.
 */
function useActiveInView(list: HTMLElement | null) {
  React.useEffect(() => {
    const nav = list?.closest<HTMLElement>("[data-slot=table-of-contents]")
    if (!list || !nav) return
    const reveal = () => {
      const active = list.querySelector<HTMLElement>(ACTIVE_ITEM)
      if (!active || nav.scrollHeight <= nav.clientHeight) return
      const top = active.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop
      const bottom = top + active.offsetHeight
      const target =
        top < nav.scrollTop ? top : bottom > nav.scrollTop + nav.clientHeight ? bottom - nav.clientHeight : null
      if (target === null) return
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      nav.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" })
    }
    const mutation = new MutationObserver(reveal)
    mutation.observe(list, { subtree: true, attributes: true, attributeFilter: ["aria-current"] })
    return () => mutation.disconnect()
  }, [list])
}

type MinimapMark = { level: string; active: boolean }

/**
 * The minimap's dashes, read off the list's own items (their level and which one is active), so
 * the column always matches the links it stands for. Also measures the column, which is the box
 * the closed panel is clipped to.
 */
function useMinimap(list: HTMLElement | null, column: HTMLElement | null, enabled: boolean) {
  const [marks, setMarks] = React.useState<MinimapMark[]>([])
  const [rest, setRest] = React.useState({ width: 0, height: 0 })

  React.useLayoutEffect(() => {
    if (!list || !enabled) return
    const read = () => {
      const next = Array.from(list.querySelectorAll<HTMLElement>("[data-slot=table-of-contents-item]")).map((item) => ({
        level: item.dataset.level ?? "2",
        active: item.getAttribute("aria-current") === "location",
      }))
      setMarks((prev) =>
        prev.length === next.length && prev.every((mark, i) => mark.level === next[i].level && mark.active === next[i].active)
          ? prev
          : next,
      )
    }
    read()
    const mutation = new MutationObserver(read)
    mutation.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current", "data-level"] })
    return () => mutation.disconnect()
  }, [list, enabled])

  React.useLayoutEffect(() => {
    if (!column || !enabled) return
    const measure = () => {
      const { offsetWidth: width, offsetHeight: height } = column
      setRest((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(column)
    return () => resize.disconnect()
  }, [column, enabled])

  return { marks, rest }
}

export function TableOfContentsList({ className, style, ...props }: React.ComponentProps<"ol">) {
  const { slots, variant } = useTableOfContentsContext("TableOfContentsList")
  const [list, setList] = React.useState<HTMLOListElement | null>(null)
  const [column, setColumn] = React.useState<HTMLDivElement | null>(null)
  const sliding = variant === "line" || variant === "progress" || variant === "pill"
  const bar = useIndicator(list, sliding)
  const minimap = useMinimap(list, column, variant === "minimap")
  useActiveInView(list)

  // `progress` fills the track from the top to the bottom of the active row; the others sit on it.
  const vars = sliding
    ? variant === "progress"
      ? { "--toc-indicator-y": "0px", "--toc-indicator-h": `${bar.top + bar.height}px` }
      : { "--toc-indicator-y": `${bar.top}px`, "--toc-indicator-h": `${bar.height}px` }
    : variant === "minimap"
      ? { "--toc-rest-w": `${minimap.rest.width}px`, "--toc-rest-h": `${minimap.rest.height}px` }
      : null

  return (
    <>
      {variant === "minimap" && (
        <div ref={setColumn} aria-hidden data-slot="table-of-contents-minimap" className={slots.minimap()}>
          {minimap.marks.map((mark, i) => (
            <span
              key={i}
              data-level={mark.level}
              data-active={mark.active ? "" : undefined}
              className={slots.mark()}
            />
          ))}
        </div>
      )}
      <ol
        data-slot="table-of-contents-list"
        data-indicator={sliding && bar.visible ? "visible" : undefined}
        data-indicator-motion={sliding && bar.motion ? "" : undefined}
        className={slots.list({ className })}
        style={vars ? ({ ...vars, ...style } as React.CSSProperties) : style}
        {...props}
        ref={setList}
      />
    </>
  )
}

export interface TableOfContentsItemProps extends React.ComponentProps<"a"> {
  /** The section's link: `#` plus the id of its heading. The spy watches that heading. */
  href: string
  /** 2 for a section, 3 for a subsection, which steps in under its parent. */
  level?: TableOfContentsLevel
}

export function TableOfContentsItem({
  className,
  href,
  level = 2,
  onClick,
  children,
  ...props
}: TableOfContentsItemProps) {
  const { slots, numbered, activeId, registry, navigate } = useTableOfContentsContext("TableOfContentsItem")
  const id = hashId(href)
  const active = id !== undefined && id === activeId

  React.useEffect(() => (id ? registry.add(id) : undefined), [registry, id])

  return (
    <li data-slot="table-of-contents-row" className={slots.row({ level })}>
      <a
        data-slot="table-of-contents-item"
        data-level={level}
        href={href}
        aria-current={active ? "location" : undefined}
        className={slots.item({ level, className })}
        onClick={(event) => {
          onClick?.(event)
          const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
          if (event.defaultPrevented || event.button !== 0 || modified || !id) return
          navigate(id, event)
        }}
        {...props}
      >
        {numbered && <span aria-hidden data-slot="table-of-contents-number" className={slots.number({ level })} />}
        {children}
      </a>
    </li>
  )
}
