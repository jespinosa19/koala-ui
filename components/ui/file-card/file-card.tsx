"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { CheckCircle, WarningCircle } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

/**
 * FileCard: a card for a single file: a realistic file-type illustration (or image
 * thumbnail), the name, a meta line (size · date), trailing actions, and an optional
 * upload progress bar.
 * A multi-part component built like Card/Stat: one `tv` recipe with `slots`, shared
 * state flowing to every part through React Context (never prop-drilled or cloned).
 * Compose the named parts (`FileCardIcon`, `FileCardThumbnail`, `FileCardContent`,
 * `FileCardName`, `FileCardMeta`, `FileCardValue`, `FileCardActions`, `FileCardProgress`)
 * into a row. See docs/ARCHITECTURE.md §2.
 *
 * Two layouts, one component (`layout`): `row` is the attachment line, `tile` is the square
 * thumbnail cell of an image grid, where the media fills the card and the actions become a
 * scrim that fades in on hover. Same parts either way; only the arrangement changes.
 */
export const fileCardVariants = tv({
  slots: {
    // A horizontal row: media left, content fills, actions ride the right edge. No fill here:
    // fill is elevation, so only `elevated` paints one (see Card). No border either: the edge is
    // a ring (box-shadow) set per variant, so it takes no layout and the media tile stays concentric.
    root: "flex items-center gap-3 rounded-xl text-card-foreground",
    // The leading media footprint (sized per density below). The realistic file
    // illustration is freestanding (its own paper + outline), so this is just a centered
    // box: no tile chrome. The type tone rides as `currentColor`, which the label band
    // inside the SVG picks up via `fill-current`.
    glyph: "grid shrink-0 place-items-center",
    // Used only for the custom-children escape hatch (your own glyph in a soft tile). The
    // concentric radius is set per density below, since it depends on the root's padding.
    icon: "grid shrink-0 place-items-center bg-muted text-muted-foreground",
    // Same footprint as the icon tile, but clips an <img> to the concentric radius.
    // Image outline (#11): a 1px ring in pure black/white, never a tinted neutral, which would
    // read as dirt on the image edge. `dark:` covers .dark and .moonlight. It rides on ::after,
    // OVER the photo: a ring on the tile itself is an inset box-shadow, which paints under the
    // filling <img> and never shows (memory `inset-ring-under-children`).
    thumbnail:
      "relative shrink-0 overflow-hidden bg-muted [&>img]:size-full [&>img]:object-cover after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
    // min-w-0 lets the name truncate instead of pushing the actions off the card.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    name: "truncate text-sm font-medium text-foreground",
    // tabular-nums so a live-updating size/percent never reflows the meta line.
    meta: "flex items-center gap-1.5 truncate text-xs tabular-nums text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0",
    // The trailing readout ("60%", "2.4 MB of 8 MB"): a sibling of `content`, not a child, so a
    // full-width progress bar can run under the name while the number holds the row's right edge
    // on the vertical centre. tabular-nums so a ticking percentage never shifts the row.
    value: "shrink-0 text-xs tabular-nums text-muted-foreground",
    // Centered on the row, like every other trailing slot in the library (list.meta,
    // orderSummary.actions, checklist.action). Never `self-start`: the row grows when a
    // FileCardProgress is present, and a top-pinned cluster then drifts off the glyph's axis.
    actions: "flex shrink-0 items-center gap-0.5",
    // Progress lives below the meta line; the row stays a single column with content. The bar
    // itself is the Progress component (see FileCardProgress) - this slot only positions it.
    progress: "mt-1.5",
  },
  variants: {
    variant: {
      // In-flow rows are contours on whatever ground holds them; only `elevated` floats, and in
      // dark the lifted fill (not the shadow, which barely reads on near-black) is what shows it.
      // Shadows over borders: `default` is an `--edge` ring plus the xs lift, `outline` the bare
      // ring at full `--border` strength (no lift to help it), `elevated` the lift alone.
      default: { root: "shadow-xs ring-1 ring-edge" },
      outline: { root: "shadow-none ring-1 ring-border" },
      elevated: { root: "bg-card shadow-lg [--surface:var(--card)]" },
      // Chrome-less: no edge, surface, or shadow. The type-tinted icon still carries the
      // file's identity, so a `ghost` row reads as a minimal attachment that sits flush on its
      // container (feeds, comment threads, dense lists) instead of a "card inside a card".
      ghost: { root: "bg-transparent shadow-none" },
    },
    // Upload/validation state tints the surface. `idle` is the resting state; `error` pulls a
    // soft destructive edge so a failed file reads at a glance (FileCardProgress reads the
    // state from context and re-tones its bar); `success` keeps the surface calm, because the
    // trailing check already carries the signal. The edge restates `ring-1` so it shows on every
    // variant, the ringless `elevated` and `ghost` included.
    state: {
      idle: {},
      uploading: {},
      success: {},
      error: {
        root: "bg-destructive/5 ring-1 ring-destructive/40",
        value: "text-destructive",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For FileCard it
    // governs padding, gap, and the media tile. `compact` is the dense app default
    // (file lists, upload trays); `comfortable` is the roomier marketing alternative.
    // The icon tile's radius is concentric with the root, not fixed: the card is rounded-xl
    // (20px), so the inner tile is 20 minus the padding (memory `concentric-padding-ladder`).
    density: {
      compact: {
        root: "gap-3 p-3",
        glyph: "size-10",
        icon: "size-10 rounded-sm [&>svg]:size-6",
        thumbnail: "size-10 rounded-sm",
      },
      comfortable: {
        root: "gap-4 p-4",
        glyph: "size-12",
        icon: "size-12 rounded-md [&>svg]:size-7",
        thumbnail: "size-12 rounded-md",
      },
    },
    // When the whole card is a link/button (an attachment that opens), add affordance:
    // pointer, hover lift, focus ring. File rows are inert by default.
    interactive: {
      true: {
        // A full card scaling 0.96 reads janky; 0.98 gives press feedback on a large
        // surface while staying above the 0.95 floor. `transition` is curated, not `all`.
        root: "cursor-pointer text-left transition duration-fast ease-out hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      },
    },
    /**
     * `row` is the attachment line: media left, content fills, actions ride the right edge.
     * `tile` is the square cell of an image grid: the thumbnail *is* the card, and the actions
     * become a centred scrim over it. Everything below is the delta from `row`.
     *
     * **Declared LAST on purpose.** tv concatenates variants in declaration order and hands the
     * result to twMerge, so the last axis to speak wins the conflict. Layout is the most
     * structural axis - a tile that fills its cell must beat density's `size-10` and variant's
     * `ring-1` - so it goes here rather than being mirrored into a compound for every
     * colliding utility. Safe because `row` contributes nothing: this ordering only ever
     * changes `tile`. (Same move as form.tsx's `layout` and sidebar.tsx's `docked`.)
     */
    layout: {
      row: {},
      tile: {
        root: [
          "group/tile relative aspect-square w-full items-stretch overflow-hidden gap-0 p-0",
          // A 1px border would inset the filling image and break the concentric corner
          // (memory `border-breaks-concentric-radius`), so the edge is a ring instead. The variant's
          // outer ring is dropped (`ring-0`): a tile's edge is the image outline (#11), pure
          // black/white, riding on ::after so it paints OVER the photo. An inset ring on the card
          // itself sits under the filling thumbnail and never shows (memory `inset-ring-under-children`).
          "ring-0",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
          // The photo scales on hover, and Chromium skips a non-composited ancestor's radius
          // clip on a composited child - promote the clipping card so the corners hold
          // (memory `rounded-clip-composited-child`).
          "[transform:translateZ(0)]",
        ],
        // The media fills the cell edge to edge; the row's tile chrome is dropped entirely, its
        // square ::after outline included (the card's own ::after draws the rounded edge).
        thumbnail: [
          "absolute inset-0 size-full rounded-none bg-transparent after:hidden",
          // `scale` is a standalone CSS property in Tailwind v4, so it must be named
          // (memory `tailwind-v4-transition-scale-translate`); `transition-transform` would snap.
          "[&>img]:transition-[scale] [&>img]:duration-slow [&>img]:ease-out",
          "group-hover/tile:[&>img]:scale-105 motion-reduce:[&>img]:transition-none",
        ],
        // The scrim. It must NOT fade with `opacity-0`: a backdrop-blur still paints through a
        // transparent layer (memory `backdrop-blur-leaks-through-opacity-0`), so the blur and the
        // wash are toggled directly and only the buttons use opacity.
        actions: [
          "absolute inset-0 z-10 flex items-center justify-center gap-1",
          "bg-transparent backdrop-blur-none",
          "transition-[background-color,backdrop-filter] duration-base ease-out",
          "group-hover/tile:bg-black/40 group-hover/tile:backdrop-blur-xs",
          "group-focus-within/tile:bg-black/40 group-focus-within/tile:backdrop-blur-xs",
          // A dark ground of our own: the controls inside must blend with it, not the page.
          "[--surface:oklch(0_0_0)]",
          "*:opacity-0 *:transition-opacity *:duration-base *:ease-out",
          "group-hover/tile:*:opacity-100 group-focus-within/tile:*:opacity-100",
        ],
      },
    },
  },
  compoundVariants: [
    // Ghost is chrome-less, so the density padding (which exists to inset content from the
    // edge/surface) just floats the row off its left edge, so drop it so a ghost attachment
    // aligns flush with the surrounding text.
    { variant: "ghost", class: { root: "p-0" } },
    // …unless the whole row is interactive: then restore a little padding and trade the
    // default hover-shadow for a soft surface, so it behaves like a hoverable list item.
    {
      variant: "ghost",
      interactive: true,
      class: { root: "-mx-2 p-2 hover:bg-muted hover:shadow-none" },
    },
    // An interactive tile still doesn't move: image cards hold their footprint and let the photo
    // and the scrim carry the hover (memory `image-hover-badge-and-lightbox`). This one stays a
    // compound even though `layout` is declared last: it cancels utilities `tile` never sets,
    // and ordering can only override a class, never remove a different one.
    {
      layout: "tile",
      interactive: true,
      class: { root: "hover:shadow-none active:scale-100" },
    },
    // A tile signals on the ::after ring, never a border - a 1px border insets the filling photo.
    // `tile`'s `ring-0` wins over the error state's `ring-1`, so without this a failed tile would
    // carry no signal at all. Both prefixes of the ::after edge are restated
    // so tailwind-merge replaces each; a bare one would lose to `dark:after:ring-white/10` in dark
    // (memory `tailwind-merge-variant-prefix-dedupe`).
    {
      layout: "tile",
      state: "error",
      class: { root: "after:ring-destructive/50 dark:after:ring-destructive/50" },
    },
  ],
  defaultVariants: {
    layout: "row",
    variant: "default",
    state: "idle",
    density: "compact",
  },
})

type FileCardSlots = ReturnType<typeof fileCardVariants>
type FileCardState = NonNullable<VariantProps<typeof fileCardVariants>["state"]>

const [FileCardProvider, useFileCardContext] = createContext<{
  slots: FileCardSlots
  state: FileCardState
}>("FileCard")

/* ------------------------------------------------------------ file types --- */

/** The visual categories a file collapses to: each maps to a tone and a short label. */
export type FileCardType =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "sheet"
  | "slides"
  | "archive"
  | "code"
  | "text"
  | "default"

/** Tone + short label per category. The tone is a semantic color role (so it re-themes
 *  across all four palettes); it rides the icon wrapper as `currentColor`, which the SVG
 *  label band picks up via `fill-current`. The label is the text stamped on that band:
 *  a short, generic stand-in (PDF, DOC, XLS…) — pass an explicit `label` to FileCardIcon
 *  to stamp the real extension instead (e.g. "DOCX", "CSV"). */
const FILE_TYPES: Record<FileCardType, { color: string; label: string }> = {
  pdf: { color: "text-destructive", label: "PDF" },
  image: { color: "text-purple", label: "IMG" },
  video: { color: "text-pink", label: "VID" },
  audio: { color: "text-orange", label: "MP3" },
  doc: { color: "text-info", label: "DOC" },
  sheet: { color: "text-success", label: "XLS" },
  slides: { color: "text-warning", label: "PPT" },
  archive: { color: "text-teal", label: "ZIP" },
  code: { color: "text-teal", label: "</>" },
  text: { color: "text-muted-foreground", label: "TXT" },
  default: { color: "text-muted-foreground", label: "FILE" },
}

/** Extension → category, so a filename resolves straight to the right tone + label. */
const EXTENSION_TYPES: Record<string, FileCardType> = {
  pdf: "pdf",
  png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image", webp: "image", avif: "image", heic: "image",
  mp4: "video", mov: "video", webm: "video", avi: "video", mkv: "video",
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio",
  doc: "doc", docx: "doc", rtf: "doc", pages: "doc", odt: "doc",
  xls: "sheet", xlsx: "sheet", csv: "sheet", numbers: "sheet", ods: "sheet",
  ppt: "slides", pptx: "slides", key: "slides", odp: "slides",
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
  js: "code", ts: "code", jsx: "code", tsx: "code", json: "code", html: "code", css: "code", py: "code", rb: "code", go: "code", rs: "code", sh: "code",
  txt: "text", md: "text", log: "text",
}

/**
 * fileTypeFromName: derive a {@link FileCardType} from a filename's extension, so a
 * consumer can drive `FileCardIcon` straight from the file: `type={fileTypeFromName(f.name)}`.
 * Falls back to `"default"` for unknown or extensionless names.
 */
export function fileTypeFromName(name: string): FileCardType {
  const ext = name.split(".").pop()?.toLowerCase()
  return (ext && EXTENSION_TYPES[ext]) || "default"
}

/* ------------------------------------------------------------------ parts --- */

export interface FileCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof fileCardVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not `FileCard.Icon` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do. Compose
 * as `<FileCard><FileCardIcon … /><FileCardContent>…`.
 */
export function FileCard({
  className,
  layout,
  variant,
  state,
  density,
  interactive,
  asChild = false,
  ...props
}: FileCardProps) {
  // Density resolves prop > provider > "compact"; compute the slots once, every part
  // reads them from context.
  const resolvedState = state ?? "idle"
  const slots = fileCardVariants({
    layout,
    variant,
    state,
    interactive,
    density: useDensity(density),
  })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <FileCardProvider slots={slots} state={resolvedState}>
      <Comp data-slot="file-card" data-state={resolvedState} className={slots.root({ className })} {...props} />
    </FileCardProvider>
  )
}

/**
 * FileGlyph: the realistic file illustration: a sheet of paper with a dog-eared corner and
 * a colored label band stamped with the extension. The paper blends with the card surface
 * (defined by a hairline outline so it reads on any background); the band is tinted by the
 * wrapper's `currentColor` via `fill-current`, and the knockout label uses the card color.
 * Pure SVG, no raw values: every fill/stroke is a semantic token utility.
 */
function FileGlyph({ label }: { label: string }) {
  // Four-character extensions (DOCX, XLSX, FILE) step down a touch so they never crowd the
  // band edges; the short, common labels stay big and legible at the 40px compact size.
  const fontSize = label.length >= 4 ? 7 : 8.5
  return (
    <svg viewBox="0 0 40 48" fill="none" className="h-full w-auto" aria-hidden focusable="false">
      {/* The sheet: A4 proportions (≈1:√2, width 70% of height), blends with the card
          surface, defined by a 1px outline + the fold. */}
      <path
        d="M8 3 H26 L35 12 V42 A3 3 0 0 1 32 45 H8 A3 3 0 0 1 5 42 V6 A3 3 0 0 1 8 3 Z"
        className="fill-card stroke-border"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* The dog-eared corner: a hair darker than the page so the fold reads as depth. */}
      <path
        d="M26 3 V12 H35 Z"
        className="fill-muted stroke-border"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Two faint content lines imply text on the page above the label. */}
      <path
        d="M10 17 H24 M10 21.5 H30"
        className="stroke-muted-foreground/25"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* The colored label band, tinted by the wrapper's text color. */}
      <rect x="8" y="27" width="24" height="13" rx="2.5" className="fill-current" />
      <text
        x="20"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-card font-sans"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="-0.3"
      >
        {label}
      </text>
    </svg>
  )
}

export interface FileCardIconProps extends React.ComponentProps<"div"> {
  /** File category: picks the tone and the band label. Ignored when `children` are passed. */
  type?: FileCardType
  /** Override the text stamped on the label band (e.g. the real extension, "DOCX"). */
  label?: string
}

/**
 * FileCardIcon: the leading file illustration. Pass `type` to render a realistic file glyph
 * (sheet + dog-eared corner + tinted extension band) for that category, or derive it with
 * {@link fileTypeFromName}. Override the band text with `label` (e.g. the real extension).
 * Pass `children` instead to render your own glyph in a soft muted tile, toned via `className`.
 */
export function FileCardIcon({ type, label, className, children, ...props }: FileCardIconProps) {
  const { slots } = useFileCardContext("FileCardIcon")

  // Escape hatch: a custom glyph sits in the soft, rounded muted tile (the old look).
  if (children) {
    return (
      <div data-slot="file-card-icon" aria-hidden className={slots.icon({ className })} {...props}>
        {children}
      </div>
    )
  }

  // Default: the realistic file illustration, tinted by the category's tone (currentColor).
  const meta = FILE_TYPES[type ?? "default"]
  return (
    <div
      data-slot="file-card-icon"
      aria-hidden
      className={slots.glyph({ className: cn(meta.color, className) })}
      {...props}
    >
      <FileGlyph label={label ?? meta.label} />
    </div>
  )
}

export interface FileCardThumbnailProps extends React.ComponentProps<"img"> {
  alt: string
}

/**
 * FileCardThumbnail: an image preview that fills the same footprint as `FileCardIcon`,
 * clipped to the concentric radius. Use it for images instead of the type glyph; pass an
 * object URL or remote `src`. Always give a meaningful `alt`.
 */
export function FileCardThumbnail({ className, alt, ...props }: FileCardThumbnailProps) {
  const { slots } = useFileCardContext("FileCardThumbnail")
  return (
    <div data-slot="file-card-thumbnail" className={slots.thumbnail({ className })}>
      {/* Native img: previews are commonly object URLs for not-yet-uploaded blobs, which
          next/image can't optimize. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} {...props} />
    </div>
  )
}

export function FileCardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileCardContext("FileCardContent")
  return <div data-slot="file-card-content" className={slots.content({ className })} {...props} />
}

export function FileCardName({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileCardContext("FileCardName")
  return <div data-slot="file-card-name" className={slots.name({ className })} {...props} />
}

export function FileCardMeta({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileCardContext("FileCardMeta")
  return <div data-slot="file-card-meta" className={slots.meta({ className })} {...props} />
}

/**
 * FileCardValue: the trailing readout - a percentage, a byte count, "3 of 8". It is a sibling of
 * `FileCardContent`, not a child of it, so a full-width `FileCardProgress` can run under the name
 * while the number keeps the row's right edge on the vertical centre. Drop it and the bar simply
 * spans the row; pair it with `<FileCardProgress hideValue />` to avoid printing the same
 * percentage twice.
 */
export function FileCardValue({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileCardContext("FileCardValue")
  return <div data-slot="file-card-value" className={slots.value({ className })} {...props} />
}

export function FileCardActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileCardContext("FileCardActions")
  return <div data-slot="file-card-actions" className={slots.actions({ className })} {...props} />
}

export interface FileCardProgressProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Upload completion, 0-100. Drives the fill width and the trailing percentage. */
  value?: number
  /** Optional leading label on the meta line (e.g. "Uploading…", "Failed"). */
  label?: React.ReactNode
  /** Hide the percentage on the right of the meta line. @default false */
  hideValue?: boolean
}

/**
 * FileCardProgress: an upload bar with an optional label/percentage line above it. The bar is the
 * DS {@link Progress} component (`size="sm"` is the 6px track the design calls for), so the
 * `role="progressbar"` semantics, the clamping, and the width animation all come from one place
 * rather than being re-rolled per component. It re-tones to destructive when the card's `state`
 * is `error`. Renders in `idle` too; omit it once the upload completes.
 *
 * The label and the readout are droppable (memory `parts-must-be-droppable`): `<FileCardProgress
 * value={60} />` prints the percentage, `hideValue` drops it - typically because the number has
 * moved out to a `FileCardValue` on the row's right edge.
 */
export function FileCardProgress({
  className,
  value = 0,
  label,
  hideValue = false,
  ...props
}: FileCardProgressProps) {
  const { slots, state } = useFileCardContext("FileCardProgress")

  // Built as an array, not inline JSX: Progress renders its header row for ANY truthy children,
  // and `{null}{null}` is a truthy array - it would paint an empty, gap-2 row above the bar.
  // An array also survives `React.Children.toArray`, so Progress still finds the label and wires
  // `aria-labelledby` to it (a fragment would hide it behind the fragment's own type).
  const header = [
    label ? (
      <ProgressLabel key="label" className="truncate text-xs">
        {label}
      </ProgressLabel>
    ) : null,
    hideValue ? null : (
      <ProgressValue
        key="value"
        className={cn("text-xs", state === "error" && "text-destructive")}
      />
    ),
  ].filter(Boolean)

  return (
    <div data-slot="file-card-progress" className={slots.progress({ className })} {...props}>
      <Progress
        value={value}
        size="sm"
        tone={state === "error" ? "destructive" : "brand"}
        // With both header parts dropped the bar has no visible text to be named by, so give it
        // one; when a label IS composed, Progress points `aria-labelledby` at it instead.
        aria-label={label ? undefined : "Upload progress"}
      >
        {header.length ? header : undefined}
      </Progress>
    </div>
  )
}

/* ------------------------------------------------------------ status glyph --- */

const STATUS_ICON = {
  // Uploading renders the Spinner (the one loading glyph) rather than a static icon.
  uploading: { icon: null, tone: "text-muted-foreground" },
  success: { icon: CheckCircle, tone: "text-success" },
  error: { icon: WarningCircle, tone: "text-destructive" },
} as const

export interface FileCardStatusProps extends React.ComponentProps<"span"> {
  /** Which status glyph to show. Defaults to the card's `state` from context. */
  status?: "uploading" | "success" | "error"
  /**
   * An accessible name for the glyph. Decorative by default (the glyph just echoes adjacent
   * meta text like "Uploaded"), so it's `aria-hidden`. Pass `label` when the glyph is the ONLY
   * carrier of the status: a failed upload whose reason lives in a tooltip on the icon, with no
   * meta line. It then announces as an image with this name and becomes focusable, so a keyboard
   * user can surface that tooltip too. Wrap it in a `<Tooltip content={label}>` to show the hint.
   */
  label?: string
}

/**
 * FileCardStatus: a small trailing status glyph (spinner / check / warning) that reads
 * the card's `state` from context by default, so `<FileCard state="success">` lights the
 * check automatically. Override per instance with `status`. Pass `label` (and wrap in a
 * `Tooltip`) when the glyph is the sole carrier of the status, e.g. a failed upload whose
 * reason lives only on the icon.
 */
export function FileCardStatus({ status, label, className, ...props }: FileCardStatusProps) {
  const { state } = useFileCardContext("FileCardStatus")
  const resolved = status ?? (state === "idle" ? undefined : state)
  if (!resolved) return null
  const { icon: Glyph, tone } = STATUS_ICON[resolved]
  // A labelled glyph carries the status on its own, so it's announced (role=img + name) and
  // focusable (a keyboard user can reach the tooltip); a bare glyph stays decorative + hidden.
  const informative = label != null
  return (
    <span
      data-slot="file-card-status"
      aria-hidden={informative ? undefined : true}
      role={informative ? "img" : undefined}
      aria-label={informative ? label : undefined}
      tabIndex={informative ? 0 : undefined}
      className={cn(
        "grid place-items-center [&>svg]:size-5",
        informative &&
          "cursor-help rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        tone,
        className,
      )}
      {...props}
    >
      {Glyph ? <Glyph weight="bold" /> : <Spinner aria-hidden />}
    </span>
  )
}
