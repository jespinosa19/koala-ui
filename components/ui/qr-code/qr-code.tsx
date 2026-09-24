import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { encodeQR, type QRErrorCorrection } from "./qr-encoder"

/**
 * QRCode: a single-element component that renders a QR code as crisp, dependency-free SVG.
 * One `tv` recipe, semantic tokens only, `className` merged last (see docs/ARCHITECTURE.md).
 *
 * The matrix is generated in-house ([qr-encoder.ts](./qr-encoder.ts)) so there is no runtime
 * dependency to vendor, matching the rest of Koala's hard primitives (Chart, Calendar, the
 * Command palette). Modules paint in `currentColor` (`text-foreground` by default) over a
 * `bg-background` quiet zone, so the code keeps high contrast and re-themes across all four
 * themes. Encoding is memoized on `value` + `level`, so re-renders are free.
 *
 * No `"use client"`: it is pure render with no state or browser API, safe in Server Components.
 */
export const qrCodeVariants = tv({
  base: ["inline-block shrink-0 bg-background text-foreground"],
})

export interface QRCodeProps
  extends Omit<React.ComponentProps<"svg">, "children">,
    VariantProps<typeof qrCodeVariants> {
  /** The text to encode: a URL, plain text, or an `otpauth://` URI. */
  value: string
  /**
   * Error-correction level. Higher levels survive more damage/occlusion at the cost of a
   * denser code. `L` ~7%, `M` ~15% (default), `Q` ~25%, `H` ~30%.
   */
  level?: QRErrorCorrection
  /** Rendered width/height in pixels. Defaults to 160. Override per breakpoint with `className`. */
  size?: number
  /**
   * Quiet-zone width in modules around the code. The spec requires at least 4 for reliable
   * scanning; lower only when the surrounding surface already provides light padding.
   */
  margin?: number
  /**
   * Corner rounding of each module, as a fraction of a module (0 = sharp squares, 0.5 = full
   * dots). Defaults to `0` for crisp, sharp squares. Keep any rounding subtle so the code stays
   * comfortably scannable.
   */
  moduleRadius?: number
  /** Accessible name announced to screen readers and shown as the SVG tooltip. */
  title?: string
}

/** One module as a path subpath: a sharp square when `r` is 0, else a rounded square. */
function moduleSubpath(x: number, y: number, r: number): string {
  if (r <= 0) return `M${x} ${y}h1v1h-1z`
  const s = 1 - 2 * r
  return (
    `M${x + r} ${y}h${s}` +
    `a${r} ${r} 0 0 1 ${r} ${r}v${s}` +
    `a${r} ${r} 0 0 1 ${-r} ${r}h${-s}` +
    `a${r} ${r} 0 0 1 ${-r} ${-r}v${-s}` +
    `a${r} ${r} 0 0 1 ${r} ${-r}z`
  )
}

export function QRCode({
  value,
  level = "M",
  size = 160,
  margin = 4,
  moduleRadius = 0,
  title = "QR code",
  className,
  style,
  ...props
}: QRCodeProps) {
  const r = Math.max(0, Math.min(0.5, moduleRadius))

  // Encoding is the expensive part; recompute only when the inputs actually change.
  const { dim, path } = React.useMemo(() => {
    const { size: count, modules } = encodeQR(value, level)
    const dimension = count + margin * 2
    // One combined path for every dark module: far fewer DOM nodes than a <rect> per module.
    let d = ""
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (modules[y][x]) d += moduleSubpath(x + margin, y + margin, r)
      }
    }
    return { dim: dimension, path: d }
  }, [value, level, margin, r])

  return (
    <svg
      data-slot="qr-code"
      role="img"
      aria-label={title}
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      // Sharp squares scan best with anti-aliasing off; rounded modules need it back on, or the
      // arcs render stair-stepped.
      shapeRendering={r > 0 ? "geometricPrecision" : "crispEdges"}
      className={qrCodeVariants({ className })}
      style={style}
      {...props}
    >
      <title>{title}</title>
      <path d={path} fill="currentColor" />
    </svg>
  )
}
