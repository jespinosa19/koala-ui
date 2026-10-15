"use client"

import * as React from "react"

export interface FitBoxProps extends React.ComponentProps<"div"> {
  width: number | string
  height?: number | string
  basis?: "viewport" | "container"
  factor?: number
  fit?: "width" | "cover"
  property?: "zoom" | "scale"
  until?: number
}

function toPx(value: number | string) {
  if (typeof value === "number") return value
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return value.endsWith("rem") ? parseFloat(value) * rem : parseFloat(value)
}

function sizeContainer(el: HTMLElement) {
  let node = el.parentElement
  while (node) {
    const type = getComputedStyle(node).containerType
    if (type && type !== "normal") return node
    node = node.parentElement
  }
  return el.parentElement
}

export function FitBox({
  width,
  height,
  basis = "container",
  factor = 1,
  fit = "width",
  property = "zoom",
  until,
  ...props
}: FitBoxProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reference = basis === "container" ? sizeContainer(el) : null

    const apply = () => {
      if (until !== undefined && window.innerWidth >= until) {
        for (const prop of ["zoom", "scale", "transform-origin", "margin-right", "margin-bottom"]) el.style.removeProperty(prop)
        return
      }
      let w: number
      let h: number
      if (reference) {
        const cs = getComputedStyle(reference)
        w = reference.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
        h = reference.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      } else {
        w = window.innerWidth
        h = window.innerHeight
      }
      let ratio = (w * factor) / toPx(width)
      if (fit === "cover" && height !== undefined) ratio = Math.max(ratio, (h * factor) / toPx(height))
      if (!Number.isFinite(ratio) || ratio <= 0) return
      if (property === "scale") {
        el.style.setProperty("scale", String(ratio))
        return
      }
      el.style.zoom = "1"
      el.style.scale = String(ratio)
      el.style.transformOrigin = "top left"
      el.style.marginRight = `${-(1 - ratio) * el.offsetWidth}px`
      el.style.marginBottom = `${-(1 - ratio) * el.offsetHeight}px`
    }

    apply()
    const observer = new ResizeObserver(apply)
    if (reference) observer.observe(reference)
    observer.observe(el)
    window.addEventListener("resize", apply)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", apply)
    }
  }, [basis, factor, fit, height, property, until, width])

  return <div ref={ref} {...props} />
}
