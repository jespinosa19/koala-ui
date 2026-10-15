import * as React from "react"

export type MorphAxis = "both" | "height" | "width"

export const morphBox = [
  "relative overflow-hidden",
  "data-[morph-ready]:transition-[width,height] data-[morph-ready]:duration-base data-[morph-ready]:ease-out",
  "motion-reduce:transition-none",
]

export interface MorphBox<T extends HTMLElement> {
  ref: React.RefCallback<T>
  style: React.CSSProperties | undefined
  ready: boolean
  viewportClassName: string
}

export function useMorphBox<T extends HTMLElement = HTMLDivElement>(
  axis: MorphAxis = "both",
): MorphBox<T> {
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)

  const ref = React.useCallback((node: T | null) => {
    if (!node) return
    const measure = () => setSize({ width: node.offsetWidth, height: node.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      observer.disconnect()
      setSize(null)
    }
  }, [])

  const style = size
    ? {
        width: axis === "height" ? undefined : size.width,
        height: axis === "width" ? undefined : size.height,
      }
    : undefined

  return {
    ref,
    style,
    ready: size !== null,
    viewportClassName: axis === "height" ? "w-full" : "w-max",
  }
}
