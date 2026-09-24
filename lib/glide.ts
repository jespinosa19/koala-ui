import * as React from "react"
import * as ReactDOM from "react-dom"

/**
 * The glide: ONE indicator that travels to the child it belongs to, instead of every child
 * fading its own background in and out. The eye follows an object that moves; it only notices a
 * flicker that jumps.
 *
 * Koala already does this in six places, each hand-rolled: the Tabs underline, the ToggleGroup
 * pill, the Command row highlight, the Sidebar active pill, the SelectSearch highlight, and the
 * Toolbar's single gliding tooltip. This is that idea, once, with the lessons of all six.
 *
 * Two jobs, one hook:
 * - `"selection"` follows the child that IS something (selected tab, current page, the menu row
 *   Radix has moved focus to). It watches attributes AND focus, because a primitive announces its
 *   highlight one way or the other and you should not have to care which.
 * - `"pointer"` follows the child under the cursor, for a hover wash on a list of rows.
 *
 * Two things the six taught us, both easy to get wrong:
 * - Measure with `offsetLeft`/`offsetTop`, not a rect. They are already relative to the positioned
 *   container and already account for its scroll, so a scrolled list needs no correction. THE
 *   CONTAINER MUST BE POSITIONED (`relative`), or the numbers are relative to something else.
 * - Place first, animate after. `animate` stays false until a frame after the first placement, so
 *   the indicator never flies in from the container's origin on load. It snaps into place, and
 *   only later moves are a glide.
 */
export type GlideTrack = "selection" | "pointer"

export interface GlideOptions {
  /** What the indicator follows. @default "selection" */
  track?: GlideTrack
  /**
   * Priority-ordered selectors for the child to sit on, in `"selection"` mode. The first one that
   * matches wins, so a list can say "the selected row, or else the focused one".
   * @default ['[data-state="active"]', "[data-active]", '[aria-current="page"]', ":focus"]
   */
  selected?: string[]
  /** Which children the pointer may land on, in `"pointer"` mode. @default "[data-glide]" */
  items?: string
}

/**
 * Only the handlers the hook actually sets, never the whole `HTMLAttributes` bag: a Radix root
 * narrows props like `dir`, so spreading the wide type onto one is a type error for props the
 * glide never touches.
 */
export type GlideContainerProps<T extends HTMLElement> = Pick<
  React.DOMAttributes<T>,
  "onPointerOver" | "onPointerLeave" | "onFocus" | "onBlur"
>

export interface Glide<T extends HTMLElement> {
  /** Goes on the container. It must be positioned, and it is what gets observed. */
  ref: React.RefCallback<T>
  /** Inline transform/size for the indicator element. */
  style: React.CSSProperties | undefined
  /** Whether there is anything to point at right now. */
  visible: boolean
  /** Whether the indicator may slide. False for the first placement. */
  animate: boolean
  /** Spread on the container. Empty in `"selection"` mode, where nothing needs listening to. */
  containerProps: GlideContainerProps<T>
}

/**
 * Base classes for the indicator element. It is a sibling of the rows, never a wrapper: a wrapper
 * would have to re-parent itself on every move.
 *
 * Render it BEFORE the rows and give the rows `position: relative` (every Koala row recipe already
 * does). Both are positioned, so paint order follows the DOM and the labels sit on top. Do NOT
 * reach for a negative z-index: inside a surface that paints its own background (a menu, a popover)
 * it would drop the indicator behind that background and it would simply never appear.
 */
export const glideIndicator = [
  "pointer-events-none absolute left-0 top-0",
  "transition-opacity duration-fast ease-out",
  "motion-reduce:transition-none",
]

/** Added once the first placement has painted: from here on, moves are a glide. */
export const glideMoving =
  "transition-[translate,width,height,opacity] duration-base ease-out motion-reduce:transition-none"

interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function useGlide<T extends HTMLElement = HTMLDivElement>(
  options: GlideOptions = {},
): Glide<T> {
  const {
    track = "selection",
    selected = ['[data-state="active"]', "[data-active]", '[aria-current="page"]', ":focus"],
    items = "[data-glide]",
  } = options

  const rootRef = React.useRef<T | null>(null)
  const [box, setBox] = React.useState<Box | null>(null)
  const [shown, setShown] = React.useState(false)
  const [animate, setAnimate] = React.useState(false)
  // `shown` as a ref too: `place` runs from observers and handlers that fire several times
  // between renders, and it has to know whether the indicator is CURRENTLY out.
  const shownRef = React.useRef(false)
  const settleFrame = React.useRef(0)

  /**
   * Put the indicator on `el`, or take it away when there is nothing to point at.
   *
   * Two things this does NOT do, both learned the same way. It does not drop the measurements
   * when it hides: the box stays, so the indicator fades out where it was instead of collapsing
   * to nothing first (width and height cannot interpolate back from `auto`, so the fade would
   * never be seen). And it does not glide the placement that brings it back: a hidden indicator
   * turns up ON its row, rather than streaking across from wherever it last hid.
   */
  const place = React.useCallback((el: HTMLElement | null) => {
    if (!el) {
      shownRef.current = false
      setShown(false)
      return
    }
    const next = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
    if (shownRef.current) {
      setBox(next)
      return
    }
    shownRef.current = true
    cancelAnimationFrame(settleFrame.current)
    // The reveal has to COMMIT with the glide off, or React folds both state changes into one
    // render (`pointerover` is a continuous event, so its updates are not flushed synchronously)
    // and the indicator streaks in from wherever it last hid. `flushSync` draws that boundary;
    // it runs once per reveal, never on a move.
    ReactDOM.flushSync(() => {
      setAnimate(false)
      setBox(next)
      setShown(true)
    })
    // Two frames, not one: the placement has to have been PAINTED before the transition comes
    // back, since a transition is decided by the style in force after the change.
    settleFrame.current = requestAnimationFrame(() => {
      settleFrame.current = requestAnimationFrame(() => setAnimate(true))
    })
  }, [])

  // `selected` is an array literal at most call sites, so a new identity every render. Joining it
  // gives the effect a primitive to compare, which keeps the observers from tearing down for free.
  const selectedKey = selected.join(",")

  const ref = React.useCallback(
    (node: T | null) => {
      rootRef.current = node
      // The container of a menu or a dialog mounts long after the component that owns this hook,
      // and can unmount again. A callback ref sees both; a mount-time effect sees neither.
      if (!node) return

      const findSelected = () => {
        // Priority order, not one big selector: `querySelector` with a comma list returns whatever
        // comes first in the DOM, which is not the same as "the most specific claim".
        for (const one of selectedKey.split(",")) {
          const hit = node.querySelector<HTMLElement>(one.trim())
          if (hit) return hit
        }
        return null
      }

      const cleanups: (() => void)[] = []

      if (track === "selection") {
        const sync = () => place(findSelected())
        sync()

        // A primitive announces its highlight either by flipping an attribute (Radix Tabs sets
        // `data-state`) or by moving real focus (Radix menus do). Watch both and neither surface
        // has to be special-cased.
        const mutations = new MutationObserver(sync)
        mutations.observe(node, {
          attributes: true,
          subtree: true,
          attributeFilter: ["data-state", "data-active", "aria-current", "aria-selected"],
        })
        node.addEventListener("focusin", sync)
        node.addEventListener("focusout", sync)
        cleanups.push(() => {
          mutations.disconnect()
          node.removeEventListener("focusin", sync)
          node.removeEventListener("focusout", sync)
        })

        // Position and width change without any selection change: a resize, a late font, a row
        // that grows. Observe the children too, not just the container.
        const resizes = new ResizeObserver(sync)
        resizes.observe(node)
        for (const child of node.children) resizes.observe(child)
        cleanups.push(() => resizes.disconnect())
      } else {
        // Pointer mode still re-measures on resize; where it sits is driven by the handlers.
        const resizes = new ResizeObserver(() => {
          const root = rootRef.current
          const hovered = root?.querySelector<HTMLElement>(`${items}:hover`)
          if (hovered) place(hovered)
        })
        resizes.observe(node)
        cleanups.push(() => resizes.disconnect())
      }

      // Place first, animate after: one frame later, so loading the page never animates the
      // indicator in from the container's corner.
      const frame = requestAnimationFrame(() => setAnimate(true))
      cleanups.push(() => cancelAnimationFrame(frame))

      return () => {
        for (const cleanup of cleanups) cleanup()
        cancelAnimationFrame(settleFrame.current)
        setAnimate(false)
        setShown(false)
        shownRef.current = false
        setBox(null)
      }
    },
    [track, selectedKey, items, place],
  )

  const moveToPointer = (target: EventTarget | null) => {
    const root = rootRef.current
    if (!root || !(target instanceof Element)) return
    const item = target.closest<HTMLElement>(items)
    if (!item || !root.contains(item)) return
    place(item)
  }

  const containerProps: GlideContainerProps<T> =
    track === "pointer"
      ? {
          onPointerOver: (event) => moveToPointer(event.target),
          onPointerLeave: () => place(null),
          // Keyboard users get the same indicator, but only when the focus ring is showing.
          onFocus: (event) => {
            if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
              moveToPointer(event.target)
            }
          },
          onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) place(null)
          },
        }
      : {}

  return {
    ref,
    // `translate` rather than `transform`: it is the standalone property Tailwind v4 animates, and
    // naming it in the transition is what keeps the move eased instead of snapped.
    style: box
      ? { translate: `${box.x}px ${box.y}px`, width: box.width, height: box.height }
      : undefined,
    visible: shown,
    animate,
    containerProps,
  }
}
