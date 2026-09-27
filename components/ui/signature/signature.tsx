"use client"

import * as React from "react"

import { useInView } from "@/lib/in-view"
import { easing, prefersReducedMotion, signatureDraw, type SignatureSpeed } from "@/lib/motion"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Signature: a handwritten signature that writes itself, stroke by stroke, the way a hand signed it.
 *
 * The drawing is plain SVG: one `<path>` per pen stroke, in the order they were written (the word,
 * the bar across the t, the dot on the i, the underline). The component owns the pen, so a path needs
 * nothing but its `d`: ink, weight and round ends come from the recipe and override whatever an SVG
 * export wrote on it. Draw one in a `SignaturePad` and its strokes drop straight in.
 *
 * Once the signature is on screen the pen writes each stroke in turn and lifts between them. The
 * whole signature takes the same time at a given `speed` however long the hand is, each stroke
 * getting its share by length, so the pen keeps one pace. Under reduced motion, or with `static`,
 * it is simply there.
 */
export const signatureVariants = tv({
  base: [
    "block w-fit shrink-0 overflow-visible text-foreground",
    // The pen. The weight is a screen width (`--signature-weight`), divided by how far the viewBox
    // is scaled (`--signature-scale`, measured on the client), so a hand drawn at any size writes
    // with the same nib. The descendant rules beat the presentation attributes an SVG export puts
    // on its paths (`stroke="#000"`, `stroke-width="2"`), so a pasted drawing takes the pen too.
    "fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]",
    "[stroke-width:calc(var(--signature-weight)/var(--signature-scale,1))]",
    "[&_*]:fill-none [&_*]:stroke-current [&_*]:[stroke-width:inherit]",
    // Hidden until the client has lifted the pen off every stroke (`data-ready`), so the finished
    // drawing the server sends never flashes before the writing starts.
    "opacity-0 data-ready:opacity-100",
  ],
  variants: {
    size: {
      sm: "h-10 [--signature-weight:1.25px]",
      md: "h-14 [--signature-weight:1.6px]",
      lg: "h-20 [--signature-weight:2px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface SignatureProps
  extends Omit<React.ComponentProps<"svg">, "aria-label">,
    VariantProps<typeof signatureVariants> {
  /** What the signature says. It is read out in place of the drawing, which is an image. */
  "aria-label": string
  /**
   * The drawing's coordinate box. Leave it out and the signature fits itself to its strokes on the
   * client; pass it to reserve the right width from the first paint.
   */
  viewBox?: string
  /** How fast the pen writes: `fast` for a small mark, `slow` for a hero moment. @default "base" */
  speed?: SignatureSpeed
  /** ms the pen waits, once the signature is on screen, before it touches down. @default 0 */
  delay?: number
  /** Already signed: render the finished drawing, with no writing. @default false */
  static?: boolean
}

/** Every stroke the pen can write: a path, a line or a polyline. */
function strokesIn(svg: SVGSVGElement) {
  return Array.from(svg.querySelectorAll<SVGGeometryElement>("path, line, polyline"))
}

const round = (value: number) => Math.round(value * 10) / 10

/**
 * A handwritten signature that writes itself. Give it an `aria-label` with what it says and one
 * `<path>` per pen stroke, in writing order.
 *
 *   <Signature viewBox="0 0 166 70" aria-label="The Atelier team">
 *     <path d="M2 55.7C15 43.7 …" />
 *     <path d="M21.5 33.7C36.2 30.7 …" />
 *   </Signature>
 *
 * The drawing is written once, when it first comes on screen. To write it again (a new drawing, a
 * replay), give it a new `key`.
 */
export function Signature({
  size,
  speed = "base",
  delay = 0,
  static: isStatic = false,
  viewBox,
  className,
  ref,
  ...props
}: SignatureProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const [setInViewRef, inView] = useInView<SVGSVGElement>({ enabled: !isStatic })
  // Keep the gate's target while honoring a forwarded ref (the hook can't merge it for us).
  const setRef = React.useCallback(
    (node: SVGSVGElement | null) => {
      svgRef.current = node
      setInViewRef(node)
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<SVGSVGElement | null>).current = node
    },
    [setInViewRef, ref],
  )

  // Fit and scale. With no `viewBox`, the box is the ink itself plus a little air. The scale is how
  // many screen pixels one drawing unit covers, which the recipe divides the nib by; it follows the
  // box through every resize.
  React.useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (!viewBox) {
      const box = svg.getBBox()
      if (box.width || box.height) {
        const air = Math.max(box.width, box.height) * 0.03
        svg.setAttribute(
          "viewBox",
          [box.x - air, box.y - air, box.width + air * 2, box.height + air * 2].map(round).join(" "),
        )
      }
    }
    const measure = () => {
      const box = svg.viewBox.baseVal
      const rect = svg.getBoundingClientRect()
      if (!box || !box.width || !box.height || !rect.height) return
      const scale = Math.min(rect.width / box.width, rect.height / box.height)
      svg.style.setProperty("--signature-scale", `${scale}`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [viewBox])

  // Before the first client paint, lift the pen: each stroke becomes one dash as long as itself,
  // pushed back by its whole length, so it holds blank until it is written. Static or reduced
  // motion clears that instead, and the drawing stands finished.
  React.useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const still = isStatic || prefersReducedMotion()
    for (const stroke of strokesIn(svg)) {
      const length = still ? "" : `${stroke.getTotalLength()}`
      stroke.style.strokeDasharray = length
      stroke.style.strokeDashoffset = length
    }
    svg.dataset.ready = ""
  }, [isStatic])

  // On screen: write the strokes in order, each starting once the one before has landed and the
  // pen has travelled. A new `speed` or `delay` writes it again from the top.
  React.useEffect(() => {
    const svg = svgRef.current
    if (!svg || isStatic || !inView || prefersReducedMotion()) return
    const strokes = strokesIn(svg)
    const lengths = strokes.map((stroke) => stroke.getTotalLength())
    const ink = lengths.reduce((sum, length) => sum + length, 0)
    if (!ink) return
    const pen = signatureDraw[speed]
    let at = delay
    const writing = strokes.map((stroke, i) => {
      const time = (lengths[i] / ink) * pen.duration
      const animation = stroke.animate(
        [{ strokeDashoffset: `${lengths[i]}` }, { strokeDashoffset: "0" }],
        { duration: time, delay: at, easing: easing.sine, fill: "forwards" },
      )
      at += time + pen.lift
      return animation
    })
    return () => writing.forEach((animation) => animation.cancel())
  }, [inView, isStatic, speed, delay])

  return (
    <svg
      ref={setRef}
      role="img"
      viewBox={viewBox}
      data-slot="signature"
      data-ready={isStatic ? "" : undefined}
      className={signatureVariants({ size, className })}
      {...props}
    />
  )
}

export type { SignatureSpeed }
