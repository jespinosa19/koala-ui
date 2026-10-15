import * as React from "react"
import * as ReactDOM from "react-dom"

export type GlideTrack = "selection" | "pointer"

export interface GlideOptions {
  track?: GlideTrack
  selected?: string[]
  items?: string
}

export type GlideContainerProps<T extends HTMLElement> = Pick<
  React.DOMAttributes<T>,
  "onPointerOver" | "onPointerLeave" | "onFocus" | "onBlur"
>

export interface Glide<T extends HTMLElement> {
  ref: React.RefCallback<T>
  style: React.CSSProperties | undefined
  visible: boolean
  animate: boolean
  containerProps: GlideContainerProps<T>
}

export const glideIndicator = [
  "pointer-events-none absolute left-0 top-0",
  "transition-opacity duration-fast ease-out",
  "motion-reduce:transition-none",
]

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
  const shownRef = React.useRef(false)
  const settleFrame = React.useRef(0)

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
    ReactDOM.flushSync(() => {
      setAnimate(false)
      setBox(next)
      setShown(true)
    })
    settleFrame.current = requestAnimationFrame(() => {
      settleFrame.current = requestAnimationFrame(() => setAnimate(true))
    })
  }, [])

  const selectedKey = selected.join(",")

  const ref = React.useCallback(
    (node: T | null) => {
      rootRef.current = node
      if (!node) return

      const findSelected = () => {
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

        const resizes = new ResizeObserver(sync)
        resizes.observe(node)
        for (const child of node.children) resizes.observe(child)
        cleanups.push(() => resizes.disconnect())
      } else {
        const resizes = new ResizeObserver(() => {
          const root = rootRef.current
          const hovered = root?.querySelector<HTMLElement>(`${items}:hover`)
          if (hovered) place(hovered)
        })
        resizes.observe(node)
        cleanups.push(() => resizes.disconnect())
      }

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
    style: box
      ? { translate: `${box.x}px ${box.y}px`, width: box.width, height: box.height }
      : undefined,
    visible: shown,
    animate,
    containerProps,
  }
}
