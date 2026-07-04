import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Placeholder brand logos: a curated set of fictional companies, each a colored inline-SVG
 * symbol beside an invented wordmark. They fill the "customer logos" slots in marketing demos,
 * social-proof walls, dashboards, and screenshots without shipping a real brand asset.
 *
 * Every mark is a dependency-free `<svg>` that paints with `currentColor` (a few use a low
 * `fillOpacity` on a secondary shape, or an even-odd hole, for depth). The brand color is the
 * one place these step outside the token system: literal hex is intentional here, the same
 * documented exception as the OAuth brand marks in `auth-form/brand-logos.tsx`. Because the
 * mark is `currentColor`, the wordmark re-themes with `text-foreground` and the symbol can be
 * tinted to any brand color, so the lockups read across all four Koala themes.
 *
 * OPTICAL SIZING: every mark shares a 32x32 viewBox, but a thin three-stroke signal and a solid
 * hexagon do NOT carry the same visual weight at the same extent. Each mark passes an optical
 * `scale` to {@link Mark}, applied about the viewBox center, so dense fills shrink and airy
 * strokes grow until the whole set reads at one weight (the lever, not redrawn paths). 1 = the
 * geometric size; >1 grows, <1 shrinks. Re-tune by eye against the `/docs/logos` symbol grid.
 */

// Omit the rarely-used SVG `scale` presentation attribute so our numeric optical `scale` prop
// (see Mark) doesn't collide with it.
type MarkProps = Omit<React.SVGProps<SVGSVGElement>, "scale">

const baseSvg = (props: MarkProps): MarkProps => ({
  viewBox: "0 0 32 32",
  "aria-hidden": true,
  focusable: false,
  ...props,
})

/**
 * Shared mark shell: applies the standard svg attributes and an optical `scale` about the center
 * (16 16), so each glyph can be balanced to a common visual weight with a single number.
 */
function Mark({
  scale = 1,
  children,
  ...props
}: MarkProps & { scale?: number }) {
  return (
    <svg {...baseSvg(props)}>
      {scale === 1 ? (
        children
      ) : (
        <g transform={`translate(16 16) scale(${scale}) translate(-16 -16)`}>{children}</g>
      )}
    </svg>
  )
}

/** Halcyon: two overlapping circles, an optical "lens". */
function HalcyonMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.95} fill="currentColor">
      <circle cx="12" cy="16" r="9" />
      <circle cx="20" cy="16" r="9" fillOpacity="0.55" />
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

/** Sonar: a broadcasting signal, a nucleus under two expanding arcs. */
function SonarMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.36} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="16" cy="24" r="2.25" fill="currentColor" stroke="none" />
      <path d="M11 21 Q 16 15 21 21" />
      <path d="M7.5 19 Q 16 9 24.5 19" strokeOpacity="0.55" />
    </Mark>
  )
}

/** Corewave: three stacked sine waves. */
function CorewaveMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M4 9 q 3 -4 6 0 t 6 0 t 6 0 t 6 0" strokeOpacity="0.55" />
      <path d="M4 16 q 3 4 6 0 t 6 0 t 6 0 t 6 0" />
      <path d="M4 23 q 3 -4 6 0 t 6 0 t 6 0 t 6 0" strokeOpacity="0.55" />
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

/** Verde: a rounded plus, two crossed bars. */
function VerdeMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.95} fill="currentColor">
      <rect x="12.5" y="4" width="7" height="24" rx="3.5" />
      <rect x="4" y="12.5" width="24" height="7" rx="3.5" fillOpacity="0.6" />
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

/** Voltic: a lightning bolt. */
function VolticMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <path d="M18 3 L7 17 L14 17 L13 29 L25 14 L18 14 Z" />
    </Mark>
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

/** Vela: a crescent (a disc with an inner, right-tangent disc punched out). */
function VelaMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.97} fill="currentColor" fillRule="evenodd">
      <path d="M16 4 A12 12 0 1 0 16 28 A12 12 0 1 0 16 4 Z M19 7 A9 9 0 1 0 19 25 A9 9 0 1 0 19 7 Z" />
    </Mark>
  )
}

/** Plexus: a faceted diamond ring (even-odd hole). */
function PlexusMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.96} fill="currentColor" fillRule="evenodd">
      <path d="M16 3 L29 16 L16 29 L3 16 Z M16 11 L24 16 L16 21 L8 16 Z" />
    </Mark>
  )
}

/** Strata: three staggered diagonal strokes. */
function StrataMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.2} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <line x1="4" y1="16" x2="11" y2="9" strokeOpacity="0.5" />
      <line x1="12" y1="24" x2="24" y2="12" />
      <line x1="7" y1="21" x2="16" y2="12" strokeOpacity="0.7" />
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

/** Hexel: a flat-top hexagon. */
function HexelMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.82} fill="currentColor">
      <path d="M10 4 L22 4 L28 16 L22 28 L10 28 L4 16 Z" />
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

/** Mote: a nucleus ringed by six satellites. */
function MoteMark(props: MarkProps) {
  const dots = [0, 60, 120, 180, 240, 300].map((deg) => {
    const a = (deg * Math.PI) / 180
    return (
      <circle
        key={deg}
        cx={(16 + Math.cos(a) * 10).toFixed(2)}
        cy={(16 + Math.sin(a) * 10).toFixed(2)}
        r="2.6"
        fillOpacity="0.85"
      />
    )
  })
  return (
    <Mark {...props} scale={1.14} fill="currentColor">
      {dots}
      <circle cx="16" cy="16" r="4" />
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

/** Onyx: a shield. */
function OnyxMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.91} fill="currentColor">
      <path d="M16 3 L27 7.5 V15 C27 22 22 26.5 16 29 C10 26.5 5 22 5 15 V7.5 Z" />
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

/** Loop: an infinity knot. */
function LoopMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.28} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M16 16 C 12.5 10.5, 4.5 10.5, 4.5 16 C 4.5 21.5, 12.5 21.5, 16 16 C 19.5 10.5, 27.5 10.5, 27.5 16 C 27.5 21.5, 19.5 21.5, 16 16 Z" />
    </Mark>
  )
}

/** Prism: a faceted triangle. */
function PrismMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.12} fill="currentColor">
      <path d="M16 5 L5 25 L16 25 Z" />
      <path d="M16 5 L27 25 L16 25 Z" fillOpacity="0.55" />
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

/** Quad: a two-by-two tile grid. */
function QuadMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.9} fill="currentColor">
      <rect x="4.5" y="4.5" width="10.5" height="10.5" rx="3" />
      <rect x="17" y="4.5" width="10.5" height="10.5" rx="3" fillOpacity="0.6" />
      <rect x="4.5" y="17" width="10.5" height="10.5" rx="3" fillOpacity="0.6" />
      <rect x="17" y="17" width="10.5" height="10.5" rx="3" />
    </Mark>
  )
}

/** Gyro: a three-ring atom. */
function GyroMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.14} fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="16" cy="16" rx="12" ry="5" />
      <ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(60 16 16)" strokeOpacity="0.7" />
      <ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(120 16 16)" strokeOpacity="0.7" />
      <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
    </Mark>
  )
}

/** Coral: a wave through a ring. */
function CoralMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.14} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="16" cy="16" r="12" />
      <path d="M6 17 q 2.5 -3.5 5 0 t 5 0 t 5 0 t 5 0" strokeOpacity="0.85" />
    </Mark>
  )
}

/** Locus: a map pin with a punched hole. */
function LocusMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.95} fill="currentColor" fillRule="evenodd">
      <path d="M16 3 C 22 3 27 7.5 27 13.5 C 27 21 16 29 16 29 C 16 29 5 21 5 13.5 C 5 7.5 10 3 16 3 Z M16 9.5 A4 4 0 1 0 16 17.5 A4 4 0 1 0 16 9.5 Z" />
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

/** Spire: a three-tier pyramid. */
function SpireMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.05} fill="currentColor">
      <path d="M16 4 L21 11 L11 11 Z" />
      <path d="M16 11 L24 20 L8 20 Z" fillOpacity="0.7" />
      <path d="M16 19 L28 29 L4 29 Z" fillOpacity="0.45" />
    </Mark>
  )
}

/** Solis: a six-spoke burst. */
function SolisMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="16" y1="5" x2="16" y2="27" />
      <line x1="6.5" y1="10.5" x2="25.5" y2="21.5" />
      <line x1="25.5" y1="10.5" x2="6.5" y2="21.5" />
    </Mark>
  )
}

/** Wedge: a circle with a slice cut away. */
function WedgeMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <path d="M16 16 L26.4 10 A12 12 0 1 0 26.4 22 Z" />
    </Mark>
  )
}

/** Stellar: a six-point star (hexagram). */
function StellarMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <path d="M16 3 L26.4 21 L5.6 21 Z" />
      <path d="M16 29 L5.6 11 L26.4 11 Z" fillOpacity="0.55" />
    </Mark>
  )
}

/** Venn: three overlapping circles. */
function VennMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <circle cx="16" cy="11" r="7" fillOpacity="0.55" />
      <circle cx="10.5" cy="20.5" r="7" fillOpacity="0.55" />
      <circle cx="21.5" cy="20.5" r="7" fillOpacity="0.55" />
    </Mark>
  )
}

/** Fern: a leaf with a midrib. */
function FernMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <path d="M7 25 Q 7 7 25 7 L7 25 Z" />
      <path d="M25 7 Q 25 25 7 25 L25 7 Z" fillOpacity="0.6" />
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

/** Tidal: a single bold wave. */
function TidalMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.1} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M5 16 q 5.5 -8 11 0 t 11 0" />
    </Mark>
  )
}

/** Layers: three isometric stacked plates. */
function LayersMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.96} fill="currentColor">
      <path d="M16 4 L27 9 L16 14 L5 9 Z" />
      <path d="M16 12 L27 17 L16 22 L5 17 Z" fillOpacity="0.7" />
      <path d="M16 20 L27 25 L16 30 L5 25 Z" fillOpacity="0.45" />
    </Mark>
  )
}

/** Vector: an arrow pointing up-right. */
function VectorMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.08} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 24 L24 8" />
      <path d="M14 8 L24 8 L24 18" />
    </Mark>
  )
}

/** Tally: three ascending bars. */
function TallyMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.95} fill="currentColor">
      <rect x="5" y="18" width="5.5" height="9" rx="2" fillOpacity="0.55" />
      <rect x="13.25" y="13" width="5.5" height="14" rx="2" fillOpacity="0.8" />
      <rect x="21.5" y="8" width="5.5" height="19" rx="2" />
    </Mark>
  )
}

/** Nexus: an hourglass of two triangles. */
function NexusMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <path d="M6 5 L26 5 L16 16 Z" />
      <path d="M6 27 L26 27 L16 16 Z" fillOpacity="0.6" />
    </Mark>
  )
}

/** Garnet: a horizontally faceted diamond. */
function GarnetMark(props: MarkProps) {
  return (
    <Mark {...props} scale={0.96} fill="currentColor">
      <path d="M16 4 L27 16 L5 16 Z" />
      <path d="M5 16 L27 16 L16 28 Z" fillOpacity="0.6" />
    </Mark>
  )
}

/** Trio: three circles in a triangle. */
function TrioMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <circle cx="16" cy="8.5" r="4.5" />
      <circle cx="8" cy="22" r="4.5" fillOpacity="0.7" />
      <circle cx="24" cy="22" r="4.5" fillOpacity="0.7" />
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

/** Rotor: a four-blade pinwheel. */
function RotorMark(props: MarkProps) {
  return (
    <Mark {...props} scale={1.0} fill="currentColor">
      <path d="M16 16 L16 4 A12 12 0 0 1 26 11 Z" />
      <path d="M16 16 L16 4 A12 12 0 0 1 26 11 Z" transform="rotate(90 16 16)" fillOpacity="0.7" />
      <path d="M16 16 L16 4 A12 12 0 0 1 26 11 Z" transform="rotate(180 16 16)" />
      <path d="M16 16 L16 4 A12 12 0 0 1 26 11 Z" transform="rotate(270 16 16)" fillOpacity="0.7" />
    </Mark>
  )
}

/** Matrix: a three-by-three dot grid. */
function MatrixMark(props: MarkProps) {
  const dots = [8, 16, 24].flatMap((x) =>
    [8, 16, 24].map((y) => (
      <circle
        key={`${x}-${y}`}
        cx={x}
        cy={y}
        r="2.3"
        fillOpacity={x === 16 && y === 16 ? 1 : 0.72}
      />
    )),
  )
  return (
    <Mark {...props} scale={1.05} fill="currentColor">
      {dots}
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

export interface PlaceholderBrand {
  /** Invented company name, rendered as the wordmark. */
  name: string
  /** Invented domain, for the gallery caption. */
  domain: string
  /** Literal brand color (the documented brand-mark exception to tokens-only). */
  color: string
  /** The colored symbol, an inline `<svg>` painting with `currentColor`. */
  Mark: React.ComponentType<MarkProps>
}

/**
 * The placeholder set, ordered around the hue wheel so a wall of them reads as a varied, real
 * customer list rather than one tinted family. Order is hue (warm to cool to neutral), not
 * alphabetical, so the gallery looks deliberately arranged.
 */
export const PLACEHOLDER_BRANDS: PlaceholderBrand[] = [
  { name: "Apex", domain: "apex.io", color: "#EF4444", Mark: ApexMark },
  { name: "Locus", domain: "locus.io", color: "#DC2626", Mark: LocusMark },
  { name: "Vela", domain: "vela.studio", color: "#F43F5E", Mark: VelaMark },
  { name: "Pico", domain: "pico.app", color: "#E11D48", Mark: PicoMark },
  { name: "Prism", domain: "prism.io", color: "#FB7185", Mark: PrismMark },
  { name: "Spire", domain: "spire.io", color: "#C2410C", Mark: SpireMark },
  { name: "Coral", domain: "coral.io", color: "#EA580C", Mark: CoralMark },
  { name: "Forge", domain: "forgehq.com", color: "#F97316", Mark: ForgeMark },
  { name: "Solis", domain: "solis.io", color: "#FB923C", Mark: SolisMark },
  { name: "Wedge", domain: "wedge.io", color: "#D97706", Mark: WedgeMark },
  { name: "Lumen", domain: "lumen.io", color: "#F59E0B", Mark: LumenMark },
  { name: "Helio", domain: "helio.io", color: "#FBBF24", Mark: HelioMark },
  { name: "Voltic", domain: "voltic.io", color: "#EAB308", Mark: VolticMark },
  { name: "Stellar", domain: "stellar.studio", color: "#CA8A04", Mark: StellarMark },
  { name: "Astra", domain: "astra.io", color: "#FACC15", Mark: AstraMark },
  { name: "Hexel", domain: "hexel.io", color: "#84CC16", Mark: HexelMark },
  { name: "Venn", domain: "venn.io", color: "#65A30D", Mark: VennMark },
  { name: "Fern", domain: "fern.io", color: "#15803D", Mark: FernMark },
  { name: "Halo", domain: "halo.io", color: "#16A34A", Mark: HaloMark },
  { name: "Quad", domain: "quad.io", color: "#059669", Mark: QuadMark },
  { name: "Verde", domain: "verde.io", color: "#10B981", Mark: VerdeMark },
  { name: "Nimbus", domain: "nimbus.app", color: "#14B8A6", Mark: NimbusMark },
  { name: "Dewn", domain: "dewn.io", color: "#0D9488", Mark: DewnMark },
  { name: "Tidal", domain: "tidal.io", color: "#2DD4BF", Mark: TidalMark },
  { name: "Corewave", domain: "corewave.io", color: "#06B6D4", Mark: CorewaveMark },
  { name: "Ripple", domain: "ripple.io", color: "#0891B2", Mark: RippleMark },
  { name: "Layers", domain: "layers.io", color: "#0E7490", Mark: LayersMark },
  { name: "Sonar", domain: "sonar.io", color: "#0EA5E9", Mark: SonarMark },
  { name: "Vector", domain: "vector.io", color: "#38BDF8", Mark: VectorMark },
  { name: "Quanta", domain: "quanta.dev", color: "#3B82F6", Mark: QuantaMark },
  { name: "Tally", domain: "tally.io", color: "#60A5FA", Mark: TallyMark },
  { name: "Loop", domain: "loop.io", color: "#2563EB", Mark: LoopMark },
  { name: "Nexus", domain: "nexus.io", color: "#1D4ED8", Mark: NexusMark },
  { name: "Cobalt", domain: "cobalt.io", color: "#4F46E5", Mark: CobaltMark },
  { name: "Garnet", domain: "garnet.io", color: "#4338CA", Mark: GarnetMark },
  { name: "Halcyon", domain: "halcyon.io", color: "#6366F1", Mark: HalcyonMark },
  { name: "Pentad", domain: "pentad.io", color: "#818CF8", Mark: PentadMark },
  { name: "Strata", domain: "strata.design", color: "#8B5CF6", Mark: StrataMark },
  { name: "Trio", domain: "trio.io", color: "#7C3AED", Mark: TrioMark },
  { name: "Mote", domain: "mote.dev", color: "#A855F7", Mark: MoteMark },
  { name: "Frame", domain: "frame.io", color: "#9333EA", Mark: FrameMark },
  { name: "Plexus", domain: "plexus.io", color: "#D946EF", Mark: PlexusMark },
  { name: "Rotor", domain: "rotor.io", color: "#A21CAF", Mark: RotorMark },
  { name: "Gyro", domain: "gyro.io", color: "#C026D3", Mark: GyroMark },
  { name: "Blossom", domain: "blossom.studio", color: "#EC4899", Mark: BlossomMark },
  { name: "Matrix", domain: "matrix.io", color: "#DB2777", Mark: MatrixMark },
  { name: "Onyx", domain: "onyx.io", color: "#334155", Mark: OnyxMark },
  { name: "Crux", domain: "crux.io", color: "#64748B", Mark: CruxMark },
]

/**
 * The set in HUE-INTERLEAVED order: a deterministic permutation that walks the hue-ordered list in
 * strides (coprime to the length, so it visits every brand exactly once with no repeats), stepping
 * roughly a sixth of the wheel each time. Consecutive brands differ in hue and a short slice reads
 * as a full rainbow, so a logo WALL or ROW never shows a run of reds then oranges; any contiguous
 * slice stays color-balanced. The plain, hue-ordered {@link PLACEHOLDER_BRANDS} is for the
 * `/docs/logos` gallery sweep. One source of varied order for every wall (hero + social proof).
 */
export const PLACEHOLDER_BRANDS_VARIED: PlaceholderBrand[] = (() => {
  const n = PLACEHOLDER_BRANDS.length
  if (n < 3) return PLACEHOLDER_BRANDS
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  // ~1/6 of the wheel per step spreads a typical 6-8 logo slice into a smooth rainbow; nudge up
  // until it's coprime to the length so the stride is a full permutation (every brand once).
  let step = Math.max(2, Math.round(n / 6))
  while (gcd(step, n) !== 1) step += 1
  return Array.from({ length: n }, (_, i) => PLACEHOLDER_BRANDS[(i * step) % n])
})()

export type PlaceholderLogoVariant = "mark" | "lockup"

const WORDMARK = "font-semibold tracking-tight"

/**
 * Render one placeholder brand as the colored symbol alone (`mark`) or the symbol beside its
 * wordmark (`lockup`, the default).
 *
 * `mono` drops the literal brand color and the `text-foreground` wordmark so BOTH the symbol and the
 * wordmark inherit `currentColor`. Set a text color on the wrapper (e.g. `text-white/70`) to tint
 * the whole row at once: the monochrome treatment that keeps a logo wall calm over a photo or a
 * dark surface, instead of a clash of brand hues.
 */
export function PlaceholderLogo({
  brand,
  variant = "lockup",
  mono = false,
  className,
}: {
  brand: PlaceholderBrand
  variant?: PlaceholderLogoVariant
  mono?: boolean
  className?: string
}) {
  const { Mark: BrandMark, name, color } = brand
  const markStyle = mono ? undefined : { color }

  if (variant === "mark") {
    return <BrandMark style={markStyle} className={cn("size-9", className)} />
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark style={markStyle} className="size-6 shrink-0" />
      <span className={cn(WORDMARK, "text-lg", !mono && "text-foreground")}>{name}</span>
    </span>
  )
}

/* ─────────────────────────────── Rotating logo wall ─────────────────────────────── */

/**
 * How many slots a rotating wall can show before its two disjoint halves would overlap: slot `i`
 * cross-fades between {@link PLACEHOLDER_BRANDS_VARIED}`[i]` and `[i + LOGO_ROTATE_SLOTS]`, so as long
 * as a wall (or row) renders at most this many slots, no two slots ever show the same brand at once.
 * Keeps the social-proof grids a clean 2x4.
 */
export const LOGO_ROTATE_SLOTS = 8

// The whole wall swaps together every HOLD ms: one synchronized cross-fade, not per-slot flicker.
const ROTATE_HOLD = 5600

// The two layers stack in one grid cell, so the slot is sized to the wider wordmark and a swap never
// shifts layout. Motion is a directional vertical roll from the logo-roll keyframes (globals.css):
// `roll-out` lifts the outgoing logo up + blurs it away, `roll-in` rises the incoming one from below
// into focus, at the same time. Alternating the two each swap restarts the animation (the name
// changes), and `both` fill holds each end state between swaps; at rest (swap 0) the hidden layer is
// just faded out, so nothing animates on load.
const LOGO_LAYER = "col-start-1 row-start-1 motion-reduce:animate-none"

function swapLayer(swap: number, visible: boolean) {
  if (swap === 0) return visible ? "" : "pointer-events-none opacity-0"
  return visible ? "animate-logo-roll-in" : "pointer-events-none animate-logo-roll-out"
}

/**
 * Drives a logo wall on ONE shared counter so every slot rolls in the same frame: a synchronized
 * swap reads far calmer than per-slot flicker. Holds the at-rest set for the first HOLD ms (nothing
 * animates on load), then ticks every HOLD. Honors `prefers-reduced-motion` by never starting.
 *
 * One hook drives every rotating logo wall in the product (hero trusted-by strips and the
 * social-proof walls both call it), so they all roll on the same cadence. See memory
 * `logo-swap-roll-motion`.
 */
export function useLogoSwap() {
  const [swap, setSwap] = React.useState(0)
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setSwap((n) => n + 1), ROTATE_HOLD)
    return () => clearInterval(id)
  }, [])
  return swap
}

/**
 * One rotating logo slot: rolls between its two brands as the shared `swap` counter ticks (drive it
 * from {@link useLogoSwap}). Both layers stay mounted (no layout shift), the visible one rolls up
 * from below as the other rolls up and out, and the hidden brand is taken out of the a11y tree. Pass
 * `mono` to drop the brand hues and inherit `currentColor` (tint the wrapper, e.g. `text-white/70`)
 * for a calm row over a photo; `align="start"` left-aligns the lockup within its slot.
 */
export function RotatingPlaceholderLogo({
  index,
  swap,
  align = "center",
  mono = false,
  className,
}: {
  index: number
  swap: number
  align?: "center" | "start"
  mono?: boolean
  className?: string
}) {
  const n = PLACEHOLDER_BRANDS_VARIED.length
  const first = PLACEHOLDER_BRANDS_VARIED[index % n]
  const second = PLACEHOLDER_BRANDS_VARIED[(index + LOGO_ROTATE_SLOTS) % n]
  const firstVisible = swap % 2 === 0
  return (
    <span
      className={cn(
        "inline-grid",
        align === "start" ? "justify-items-start" : "justify-items-center",
        className,
      )}
    >
      <span aria-hidden={!firstVisible} className={cn(LOGO_LAYER, swapLayer(swap, firstVisible))}>
        <PlaceholderLogo brand={first} variant="lockup" mono={mono} />
      </span>
      <span aria-hidden={firstVisible} className={cn(LOGO_LAYER, swapLayer(swap, !firstVisible))}>
        <PlaceholderLogo brand={second} variant="lockup" mono={mono} />
      </span>
    </span>
  )
}
