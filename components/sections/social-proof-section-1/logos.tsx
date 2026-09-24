"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Placeholder customer logos: invented companies, each a colored symbol beside a wordmark, so the
 * section reads like a real customer list without shipping anyone's brand. Replace `BRANDS` with
 * your customers: any mark that paints with `currentColor` drops into `Mark`, or swap `Logo`
 * for an `<img>` of their SVG.
 *
 * The brand colors are literal on purpose: a logo is the one thing that keeps its own color in
 * every theme. The wordmark still follows `text-foreground`.
 *
 * Every mark shares a 32x32 viewBox, and each passes an optical `scale` so a thin stroke glyph and
 * a solid shape read at the same weight.
 */

type MarkProps = Omit<React.SVGProps<SVGSVGElement>, "scale">

function Mark({ scale = 1, children, ...props }: MarkProps & { scale?: number }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden focusable={false} {...props}>
      {scale === 1 ? children : <g transform={`translate(16 16) scale(${scale}) translate(-16 -16)`}>{children}</g>}
    </svg>
  )
}

/** Apex: two stacked chevrons, ascending. */
function ApexMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <path d="M16 4 L27 15 L22 15 L16 9 L10 15 L5 15 Z" />
      <path d="M16 14 L27 25 L22 25 L16 19 L10 25 L5 25 Z" fillOpacity="0.5" />
    </Mark>
  )
}

/** Helio: a duotone disc, a phase split. */
function HelioMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.94} fill="currentColor">
      <circle cx="16" cy="16" r="12" fillOpacity="0.4" />
      <path d="M16 4 A12 12 0 0 0 16 28 Z" />
    </Mark>
  )
}

/** Dewn: a droplet. */
function DewnMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.95} fill="currentColor">
      <path d="M16 3 Q 26 15 26 20 A 10 10 0 1 1 6 20 Q 6 15 16 3 Z" />
    </Mark>
  )
}

/** Cobalt: a four-point sparkle. */
function CobaltMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <path d="M16 2 Q 17.5 14.5 30 16 Q 17.5 17.5 16 30 Q 14.5 17.5 2 16 Q 14.5 14.5 16 2 Z" />
    </Mark>
  )
}

/** Blossom: a four-petal quatrefoil. */
function BlossomMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.84} fill="currentColor">
      <circle cx="16" cy="9.5" r="6.5" fillOpacity="0.7" />
      <circle cx="22.5" cy="16" r="6.5" fillOpacity="0.7" />
      <circle cx="16" cy="22.5" r="6.5" fillOpacity="0.7" />
      <circle cx="9.5" cy="16" r="6.5" fillOpacity="0.7" />
      <circle cx="16" cy="16" r="4.5" />
    </Mark>
  )
}

/** Forge: an isometric cube, three lit faces. */
function ForgeMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.88} fill="currentColor">
      <path d="M16 4 L28 11 L16 18 L4 11 Z" />
      <path d="M28 11 L16 18 L16 28 L28 21 Z" fillOpacity="0.7" />
      <path d="M4 11 L16 18 L16 28 L4 21 Z" fillOpacity="0.45" />
    </Mark>
  )
}

/** Halo: a bold ring. */
function HaloMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="none" stroke="currentColor" strokeWidth="5">
      <circle cx="16" cy="16" r="9.5" />
    </Mark>
  )
}

/** Quanta: a tilted orbit ring around a nucleus. */
function QuantaMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.16} fill="none" stroke="currentColor">
      <ellipse cx="16" cy="16" rx="13" ry="6" strokeWidth="2.5" transform="rotate(-32 16 16)" />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    </Mark>
  )
}

/** Frame: two concentric rounded squares. */
function FrameMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.04} fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="4.5" y="4.5" width="23" height="23" rx="6" />
      <rect x="11" y="11" width="10" height="10" rx="3" strokeOpacity="0.6" />
    </Mark>
  )
}

/** Pico: a play triangle. */
function PicoMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.04} fill="currentColor">
      <path d="M10 6 L26 16 L10 26 Z" />
    </Mark>
  )
}

/** Astra: a five-point star. */
function AstraMark(props: MarkProps) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 12 : 5
    const a = ((-90 + i * 36) * Math.PI) / 180
    return `${(16 + Math.cos(a) * r).toFixed(2)} ${(16 + Math.sin(a) * r).toFixed(2)}`
  })
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <path d={`M${pts.join(" L")} Z`} />
    </Mark>
  )
}

/** Ripple: concentric rings around a dot. */
function RippleMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="16" cy="16" r="12" strokeOpacity="0.45" />
      <circle cx="16" cy="16" r="7.5" strokeOpacity="0.75" />
      <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
    </Mark>
  )
}

/** Pentad: a pentagon. */
function PentadMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.88} fill="currentColor">
      <path d="M16 4 L27.4 12.3 L23.05 25.7 L8.95 25.7 L4.6 12.3 Z" />
    </Mark>
  )
}

/** Crux: a rounded saltire (X). */
function CruxMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.04} fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
      <line x1="8" y1="8" x2="24" y2="24" />
      <line x1="24" y1="8" x2="8" y2="24" />
    </Mark>
  )
}

/** Lumen: a sunburst, a core ringed by eight rays. */
function LumenMark(props: MarkProps) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const a = (deg * Math.PI) / 180
    return (
      <line
        key={deg}
        x1={(16 + Math.cos(a) * 8).toFixed(2)}
        y1={(16 + Math.sin(a) * 8).toFixed(2)}
        x2={(16 + Math.cos(a) * 12).toFixed(2)}
        y2={(16 + Math.sin(a) * 12).toFixed(2)}
      />
    )
  })
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <circle cx="16" cy="16" r="5.5" />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {rays}
      </g>
    </Mark>
  )
}

/** Nimbus: two overlapping rounded squares, a soft stack. */
function NimbusMark(props: MarkProps) {
  return (
    <Mark {...props} fill="currentColor">
      <rect x="6" y="6" width="14" height="14" rx="4.5" fillOpacity="0.55" />
      <rect x="12" y="12" width="14" height="14" rx="4.5" />
    </Mark>
  )
}

export interface Brand {
  name: string
  color: string
  Mark: React.ComponentType<MarkProps>
}

/** Ordered so neighbours differ in hue: any run of them reads as a varied list, never a block of reds. */
export const BRANDS: Brand[] = [
  { name: "Apex", color: "#EF4444", Mark: ApexMark },
  { name: "Helio", color: "#FBBF24", Mark: HelioMark },
  { name: "Dewn", color: "#0D9488", Mark: DewnMark },
  { name: "Cobalt", color: "#4F46E5", Mark: CobaltMark },
  { name: "Blossom", color: "#EC4899", Mark: BlossomMark },
  { name: "Forge", color: "#F97316", Mark: ForgeMark },
  { name: "Halo", color: "#16A34A", Mark: HaloMark },
  { name: "Quanta", color: "#3B82F6", Mark: QuantaMark },
  { name: "Frame", color: "#9333EA", Mark: FrameMark },
  { name: "Pico", color: "#E11D48", Mark: PicoMark },
  { name: "Astra", color: "#FACC15", Mark: AstraMark },
  { name: "Ripple", color: "#0891B2", Mark: RippleMark },
  { name: "Pentad", color: "#818CF8", Mark: PentadMark },
  { name: "Crux", color: "#64748B", Mark: CruxMark },
  { name: "Lumen", color: "#F59E0B", Mark: LumenMark },
  { name: "Nimbus", color: "#14B8A6", Mark: NimbusMark },
]

/** One logo: the colored symbol beside the wordmark. */
export function Logo({ brand, className }: { brand: Brand; className?: string }) {
  const { Mark: BrandMark, name, color } = brand
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark style={{ color }} className="size-6 shrink-0" />
      <span className="text-lg font-semibold tracking-tight text-foreground">{name}</span>
    </span>
  )
}

/**
 * How many slots the wall shows. Slot `i` alternates `BRANDS[i]` with `BRANDS[i + SLOTS]`, so the
 * logos on screen and the ones rolling out never repeat.
 */
export const SLOTS = 8

// The whole wall swaps together every HOLD ms: one calm, synchronized roll instead of per-slot flicker.
const HOLD = 5600

/**
 * The shared swap counter for a wall. Nothing moves for the first HOLD ms, and it never starts under
 * `prefers-reduced-motion`.
 */
export function useLogoSwap() {
  const [swap, setSwap] = React.useState(0)
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setSwap((n) => n + 1), HOLD)
    return () => clearInterval(id)
  }, [])
  return swap
}

// Both layers share one grid cell, so the slot is sized to the wider wordmark and a swap never shifts
// the layout. The roll keyframes lift the outgoing logo up and out as the next rises into focus.
const LAYER = "col-start-1 row-start-1 motion-reduce:animate-none"

function layer(swap: number, visible: boolean) {
  if (swap === 0) return visible ? "" : "pointer-events-none opacity-0"
  return visible ? "animate-logo-roll-in" : "pointer-events-none animate-logo-roll-out"
}

/** One slot of a rotating wall, driven by the shared `swap` from `useLogoSwap`. */
export function RotatingLogo({
  index,
  swap,
  align = "center",
  className,
}: {
  index: number
  swap: number
  align?: "center" | "start"
  className?: string
}) {
  // The layers alternate by parity, and that alternation is what restarts the roll keyframes.
  const firstVisible = swap % 2 === 0
  const first = BRANDS[index % BRANDS.length]
  const second = BRANDS[(index + SLOTS) % BRANDS.length]
  return (
    <span className={cn("inline-grid", align === "start" ? "justify-items-start" : "justify-items-center", className)}>
      <span aria-hidden={!firstVisible} className={cn(LAYER, layer(swap, firstVisible))}>
        <Logo brand={first} />
      </span>
      <span aria-hidden={firstVisible} className={cn(LAYER, layer(swap, !firstVisible))}>
        <Logo brand={second} />
      </span>
    </span>
  )
}
