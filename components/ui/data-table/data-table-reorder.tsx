"use client"

import * as React from "react"
import { DotsSix, DotsSixVertical } from "@phosphor-icons/react"

import { Tooltip } from "@/components/ui/tooltip"
import { duration, easing, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Manual reordering: the grip, and the drag engine both axes share.
 *
 * The model is "lift and make room", not "draw a line between two rows": the grabbed row follows
 * the pointer and the rows it passes step aside, so the gap you are about to drop into is the
 * indicator. It runs on Pointer Events rather than the native HTML5 drag and drop API, which buys
 * the four things that model needs and DnD cannot give: it works on touch (HTML5 DnD never fires
 * there), the cursor stays ours, the moving thing is the real row rather than the browser's
 * washed-out snapshot, and the drop can ease into place instead of teleporting.
 */

/**
 * Move one item of an array to a new index, returning a new array (the original is untouched).
 * `toIndex` is the index the item should sit at *after* the move, so an in-place move is a no-op
 * and the caller can feed the result straight back into state:
 *
 * ```tsx
 * onRowReorder={({ fromIndex, toIndex }) => setData((rows) => moveItem(rows, fromIndex, toIndex))}
 * ```
 */
export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length) return items
  const next = items.slice()
  const [moved] = next.splice(fromIndex, 1)
  if (moved === undefined) return items
  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, moved)
  return next
}

/** How far the pointer travels before a press becomes a drag: below this it was a click. */
const DRAG_THRESHOLD = 4
/** Distance from the scroll container's edge where the drag starts pulling the view along. */
const AUTOSCROLL_EDGE = 56
/** Peak autoscroll speed, in pixels per frame, reached at the very edge. */
const AUTOSCROLL_SPEED = 16

/** One item's geometry along the drag axis, measured once when the drag starts. */
interface Measured {
  id: string
  start: number
  size: number
}

/**
 * What the table needs to paint a drag in progress. The live offset is deliberately NOT here: it
 * changes every frame, so it is published as a CSS variable instead, and this state only changes
 * when the gap moves to another slot. A drag re-renders the table a handful of times, not sixty
 * times a second.
 */
export interface ReorderState {
  /** The item being dragged. */
  id: string
  /** Where it started, as an index into the items the table handed over. */
  fromIndex: number
  /** Where it would land if the pointer were released now. */
  toIndex: number
  /** Its size along the axis: exactly how far each item it passes has to step aside. */
  size: number
  /** The pointer is up and the lifted item is easing into the gap. */
  settling: boolean
}

export interface UseReorderOptions {
  /** `y` reorders rows, `x` reorders columns. */
  axis: "x" | "y"
  /** The element the live offset is published on, for the moving parts to read. */
  getRoot: () => HTMLElement | null
  /** Custom property carrying that offset, e.g. `--row-offset`. */
  offsetVar: string
  /** Every item, in the order they are painted. Measured when the drag starts. */
  getItems: () => { id: string; element: HTMLElement | null }[]
  /** First and last index the dragged item may land on, when some items are fixed in place. */
  getBounds?: () => [number, number]
  /** The element that scrolls, so a drag towards its edge pulls the view along. */
  getScrollContainer?: () => HTMLElement | null
  /** The move the user made. Indices are into the same list `getItems` returned. */
  onCommit: (fromIndex: number, toIndex: number) => void
}

interface Session {
  items: Measured[]
  index: number
  bounds: [number, number]
  root: HTMLElement
  container: HTMLElement | null
  /** Pointer coordinate where the grab started, and the scroll offset at that moment. */
  origin: number
  scrollOrigin: number
  pointer: number
  offset: number
  toIndex: number
  /** −1/1 when the item is already pinned against the start/end of the list, 0 otherwise. */
  pinned: number
  /** Past the threshold: the press became a drag. */
  active: boolean
  /** The pointer is up: ignore anything still in flight. */
  closed: boolean
  frame: number | null
  stop: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Where the lifted item comes to rest: the combined size of everything it stepped over. */
function restOffset(items: Measured[], from: number, to: number) {
  let offset = 0
  if (to > from) for (let i = from + 1; i <= to; i++) offset += items[i]!.size
  if (to < from) for (let i = to; i < from; i++) offset -= items[i]!.size
  return offset
}

/**
 * How far the item at `index` steps aside for the drag in progress, in pixels. Everything between
 * the grabbed slot and the target moves by exactly the grabbed item's size: the gap opens at one
 * end as it closes at the other. `null` means "no drag": no transform at all.
 */
export function reorderShift(state: ReorderState | null, index: number): number | null {
  if (!state) return null
  const { fromIndex, toIndex, size } = state
  if (index === fromIndex) return null
  if (fromIndex < toIndex && index > fromIndex && index <= toIndex) return -size
  if (toIndex < fromIndex && index >= toIndex && index < fromIndex) return size
  return 0
}

/** The transition the stepping-aside parts ride. Interruptible: the gap can change its mind. */
export const reorderTransition = `transform ${duration.fast}ms ${easing.out}`

/**
 * The drag engine. Owns one drag at a time and reports it as {@link ReorderState}; the table turns
 * that into transforms. Escape cancels, the view autoscrolls at the edges, and releasing eases the
 * lifted item into the gap before the move is committed, so nothing ever teleports.
 */
export function useReorder(options: UseReorderOptions) {
  const [state, setState] = React.useState<ReorderState | null>(null)
  const session = React.useRef<Session | null>(null)
  // A drag's handlers are made once and close over its session; the options they need are read
  // through this ref, so a re-render mid-drag can't leave them pointing at a stale callback.
  const optionsRef = React.useRef(options)
  React.useEffect(() => {
    optionsRef.current = options
  })

  // A drag that outlives its table (route change, data wiped) would leave the body locked.
  React.useEffect(() => () => session.current?.stop(), [])

  const start = (event: React.PointerEvent<HTMLElement>, id: string) => {
    if (event.button !== 0 || session.current) return
    const { axis, getItems, getBounds, getRoot, getScrollContainer, offsetVar } = optionsRef.current
    const root = getRoot()
    if (!root) return

    const scrollOf = (container: HTMLElement | null) => {
      if (container) return axis === "y" ? container.scrollTop : container.scrollLeft
      return axis === "y" ? window.scrollY : window.scrollX
    }

    const items: Measured[] = []
    for (const item of getItems()) {
      if (!item.element) return
      const rect = item.element.getBoundingClientRect()
      items.push({
        id: item.id,
        start: axis === "y" ? rect.top : rect.left,
        size: axis === "y" ? rect.height : rect.width,
      })
    }
    const index = items.findIndex((item) => item.id === id)
    const bounds = getBounds?.() ?? [0, items.length - 1]
    if (index < bounds[0] || index > bounds[1]) return

    const container = getScrollContainer?.() ?? null
    const pointer = axis === "y" ? event.clientY : event.clientX
    const s: Session = {
      items,
      index,
      bounds,
      root,
      container,
      origin: pointer,
      scrollOrigin: scrollOf(container),
      pointer,
      offset: 0,
      toIndex: index,
      pinned: 0,
      active: false,
      closed: false,
      frame: null,
      stop: () => undefined,
    }
    const publish = () => root.style.setProperty(offsetVar, `${s.offset}px`)

    /** Where the item would land, given how far it has travelled: the last slot whose midpoint it
     *  has crossed. Midpoints, not edges, are what make the gap feel decided rather than twitchy.
     *  Scrolling counts as travel, so the row keeps up with an autoscrolling view. */
    const resolve = () => {
      const me = s.items[s.index]!
      const first = s.items[s.bounds[0]]!
      const last = s.items[s.bounds[1]]!
      const travel = s.pointer - s.origin + (scrollOf(s.container) - s.scrollOrigin)
      const min = first.start - me.start
      const max = last.start + last.size - (me.start + me.size)
      s.offset = clamp(travel, min, max)
      s.pinned = travel <= min ? -1 : travel >= max ? 1 : 0
      publish()

      let to = s.index
      if (s.offset > 0) {
        for (let i = s.index + 1; i <= s.bounds[1]; i++) {
          const other = s.items[i]!
          if (me.start + me.size + s.offset >= other.start + other.size / 2) to = i
        }
      } else if (s.offset < 0) {
        for (let i = s.index - 1; i >= s.bounds[0]; i--) {
          const other = s.items[i]!
          if (me.start + s.offset <= other.start + other.size / 2) to = i
        }
      }
      if (to !== s.toIndex) {
        s.toIndex = to
        setState((prev) => (prev ? { ...prev, toIndex: to } : prev))
      }
    }

    /** Pull the view along when the pointer nears an edge, so a long list stays reachable. */
    const autoscroll = () => {
      const view = s.container?.getBoundingClientRect()
      const min = view ? (axis === "y" ? view.top : view.left) : 0
      const max = view
        ? axis === "y"
          ? view.bottom
          : view.right
        : axis === "y"
          ? window.innerHeight
          : window.innerWidth
      let speed = 0
      if (s.pointer - min < AUTOSCROLL_EDGE) {
        speed = -(1 - (s.pointer - min) / AUTOSCROLL_EDGE) * AUTOSCROLL_SPEED
      } else if (max - s.pointer < AUTOSCROLL_EDGE) {
        speed = (1 - (max - s.pointer) / AUTOSCROLL_EDGE) * AUTOSCROLL_SPEED
      }
      // Nothing to reach for once the item is already against that end of the list: scrolling on
      // would just drag the page out from under the table.
      if (!speed || Math.sign(speed) === s.pinned) return
      if (s.container) {
        if (axis === "y") s.container.scrollTop += speed
        else s.container.scrollLeft += speed
      } else {
        window.scrollBy(axis === "y" ? 0 : speed, axis === "y" ? speed : 0)
      }
    }

    const tick = () => {
      if (s.closed) return
      autoscroll()
      resolve()
      s.frame = requestAnimationFrame(tick)
    }

    const detach = () => {
      s.closed = true
      if (s.frame != null) cancelAnimationFrame(s.frame)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      window.removeEventListener("keydown", onKey)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    const clear = () => {
      root.style.removeProperty(offsetVar)
      session.current = null
      setState(null)
    }
    // Escape, a cancelled pointer, or an unmount: drop the drag and leave the data alone.
    s.stop = () => {
      detach()
      clear()
    }

    function onMove(moveEvent: PointerEvent) {
      if (s.closed) return
      s.pointer = axis === "y" ? moveEvent.clientY : moveEvent.clientX
      if (!s.active) {
        if (Math.abs(s.pointer - s.origin) < DRAG_THRESHOLD) return
        s.active = true
        // The whole page takes the drag cursor, so a drag that wanders off the table still reads
        // as a drag, and nothing selects text under it.
        document.body.style.cursor = "grabbing"
        document.body.style.userSelect = "none"
        setState({
          id,
          fromIndex: s.index,
          toIndex: s.index,
          size: s.items[s.index]!.size,
          settling: false,
        })
        s.frame = requestAnimationFrame(tick)
      }
      resolve()
    }

    function onUp() {
      if (s.closed) return
      // A press that never travelled is a click on the grip, not a drag.
      if (!s.active) {
        s.stop()
        return
      }
      detach()
      const from = s.index
      const to = s.toIndex
      const commit = () => {
        clear()
        if (to !== from) optionsRef.current.onCommit(from, to)
      }
      // Ease the lifted item from wherever the pointer left it into the gap, and only THEN commit:
      // the re-render lands on pixels that already match, so the row settles instead of jumping.
      const rest = restOffset(s.items, from, to)
      if (prefersReducedMotion() || Math.abs(rest - s.offset) < 1) {
        commit()
        return
      }
      setState((prev) => (prev ? { ...prev, settling: true } : prev))
      s.offset = rest
      publish()
      window.setTimeout(commit, duration.fast)
    }

    function onCancel() {
      s.stop()
    }

    function onKey(keyEvent: KeyboardEvent) {
      if (keyEvent.key !== "Escape") return
      keyEvent.preventDefault()
      s.stop()
    }

    session.current = s
    publish()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    window.addEventListener("keydown", onKey)
  }

  return { state, start }
}

export interface DataTableGripProps
  extends Omit<React.ComponentProps<"button">, "onPointerDown" | "aria-disabled"> {
  /** Accessible name, e.g. "Reorder row" or "Reorder the Status column". */
  label: string
  /** Which way the thing being dragged travels: rows go up/down, columns left/right. */
  axis: "rows" | "columns"
  /** Why dragging is off right now (e.g. a sort is on). Shown as a tooltip; the grip goes inert. */
  locked?: React.ReactNode
  /** Starts a drag from this handle. */
  onGrab?: (event: React.PointerEvent<HTMLElement>) => void
  /** Keyboard path: −1 moves one step up/left, 1 one step down/right. */
  onNudge?: (direction: -1 | 1) => void
  /** This grip's row/column is the one being dragged: holds the handle visible and lit. */
  dragging?: boolean
}

/**
 * The drag handle. Hidden until its row or header is hovered or something inside it takes focus
 * (the parent passes the reveal classes), always visible on touch, where there is no hover to
 * reveal it with.
 *
 * It is the *only* drag source, so selecting text in a cell still works, and `touch-none` hands
 * the gesture to us instead of to the page's scroll. Every drag has a keyboard twin: focus the
 * grip and press the arrow keys for the axis (announced via `aria-keyshortcuts`), since a pointer
 * gesture has no keyboard path of its own.
 */
export function DataTableGrip({
  label,
  axis,
  locked,
  onGrab,
  onNudge,
  dragging,
  className,
  ...props
}: DataTableGripProps) {
  const Icon = axis === "rows" ? DotsSixVertical : DotsSix
  // The arrow pair for the axis: up/down walks a column of rows, left/right a row of columns.
  const keys: readonly string[] =
    axis === "rows" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"]
  const isLocked = locked != null

  const grip = (
    <button
      type="button"
      aria-label={label}
      // `aria-disabled` rather than `disabled`: a disabled button takes no pointer events, so the
      // tooltip that explains *why* it's off would never open. The handlers below bail instead.
      aria-disabled={isLocked || undefined}
      aria-keyshortcuts={isLocked ? undefined : keys.join(" ")}
      data-dragging={dragging ? "true" : undefined}
      onPointerDown={isLocked ? undefined : onGrab}
      onKeyDown={(event) => {
        if (isLocked) return
        const index = keys.indexOf(event.key)
        if (index === -1) return
        event.preventDefault()
        onNudge?.(index === 0 ? -1 : 1)
      }}
      className={cn(
        "inline-flex size-7 shrink-0 touch-none items-center justify-center rounded-md",
        "text-muted-foreground/60 outline-none",
        // Specific properties, never `transition: all`: the parent adds opacity to the reveal.
        "transition-[color,background-color,opacity] duration-fast ease-out",
        "cursor-grab hover:bg-accent hover:text-foreground active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-brand",
        // While this one is the dragged handle it stays lit, so the eye keeps the grabbed thing.
        "data-[dragging=true]:bg-accent data-[dragging=true]:text-foreground",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        "aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground/60",
        className,
      )}
      {...props}
    >
      <Icon weight="bold" className="size-4" />
    </button>
  )

  return isLocked ? <Tooltip content={locked}>{grip}</Tooltip> : grip
}
