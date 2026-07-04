"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { CheckCircle, WarningCircle, CircleNotch } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * FileCard: a card for a single file: a realistic file-type illustration (or image
 * thumbnail), the name, a meta line (size · date), trailing actions, and an optional
 * upload progress bar.
 * A multi-part component built like Card/Stat: one `tv` recipe with `slots`, shared
 * state flowing to every part through React Context (never prop-drilled or cloned).
 * Compose the named parts (`FileCardIcon`, `FileCardThumbnail`, `FileCardContent`,
 * `FileCardName`, `FileCardMeta`, `FileCardActions`, `FileCardProgress`) into a row.
 * See docs/ARCHITECTURE.md §2.
 */
export const fileCardVariants = tv({
  slots: {
    // A horizontal row: media left, content fills, actions ride the right edge.
    root: "flex items-center gap-3 rounded-xl border bg-card text-card-foreground",
    // The leading media footprint (sized per density below). The realistic file
    // illustration is freestanding (its own paper + outline), so this is just a centered
    // box: no tile chrome. The type tone rides as `currentColor`, which the label band
    // inside the SVG picks up via `fill-current`.
    glyph: "grid shrink-0 place-items-center",
    // Concentric radius: the card is rounded-xl (16px), so the inner tile drops to lg.
    // Used only for the custom-children escape hatch (your own glyph in a soft tile).
    icon: "grid shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground",
    // Same footprint as the icon tile, but clips an <img> to the concentric radius.
    // Image outline (#11): a 1px inset ring in pure black/white, never a tinted neutral,
    // which would read as dirt on the image edge. `dark:` covers .dark and .moonlight.
    thumbnail:
      "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-black/10 dark:ring-white/10 [&>img]:size-full [&>img]:object-cover",
    // min-w-0 lets the name truncate instead of pushing the actions off the card.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    name: "truncate text-sm font-medium text-foreground",
    // tabular-nums so a live-updating size/percent never reflows the meta line.
    meta: "flex items-center gap-1.5 truncate text-xs tabular-nums text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0",
    actions: "flex shrink-0 items-center gap-0.5 self-start",
    // Progress lives below the meta line; the row stays a single column with content.
    progress: "mt-1.5 flex flex-col gap-1",
    progressTrack: "h-1.5 w-full overflow-hidden rounded-full bg-muted",
    // Width is a runtime value, so it rides a CSS var (no generated class). Specific
    // transition on width only, never `transition: all`.
    progressFill:
      "h-full rounded-full bg-primary transition-[width] duration-slow ease-out w-(--file-card-progress)",
    progressMeta:
      "flex items-center justify-between text-xs tabular-nums text-muted-foreground",
  },
  variants: {
    variant: {
      // polish: prefer shadow for depth over hard borders.
      default: { root: "border-border shadow-xs" },
      outline: { root: "border-border shadow-none" },
      elevated: { root: "border-transparent shadow-lg" },
      // Chrome-less: no border, surface, or shadow. The type-tinted icon still carries the
      // file's identity, so a `ghost` row reads as a minimal attachment that sits flush on its
      // container (feeds, comment threads, dense lists) instead of a "card inside a card".
      ghost: { root: "border-transparent bg-transparent shadow-none" },
    },
    // Upload/validation state tints the surface and the progress fill. `idle` is the
    // resting state; `error` pulls a soft destructive border so a failed file reads at
    // a glance; `success` keeps the surface calm (the trailing check carries the signal).
    state: {
      idle: {},
      uploading: {},
      success: {},
      error: {
        root: "border-destructive/40 bg-destructive/5",
        progressFill: "bg-destructive",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For FileCard it
    // governs padding, gap, and the media tile. `compact` is the dense app default
    // (file lists, upload trays); `comfortable` is the roomier marketing alternative.
    density: {
      compact: { root: "gap-3 p-3", glyph: "size-10", icon: "size-10 [&>svg]:size-6", thumbnail: "size-10" },
      comfortable: { root: "gap-4 p-4", glyph: "size-12", icon: "size-12 [&>svg]:size-7", thumbnail: "size-12" },
    },
    // When the whole card is a link/button (an attachment that opens), add affordance:
    // pointer, hover lift, focus ring. File rows are inert by default.
    interactive: {
      true: {
        // A full card scaling 0.96 reads janky; 0.98 gives press feedback on a large
        // surface while staying above the 0.95 floor. `transition` is curated, not `all`.
        root: "cursor-pointer transition duration-fast ease-out hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      },
    },
  },
  compoundVariants: [
    // Ghost is chrome-less, so the density padding (which exists to inset content from the
    // border/surface) just floats the row off its left edge, so drop it so a ghost attachment
    // aligns flush with the surrounding text.
    { variant: "ghost", class: { root: "p-0" } },
    // …unless the whole row is interactive: then restore a little padding and trade the
    // default hover-shadow for a soft surface, so it behaves like a hoverable list item.
    {
      variant: "ghost",
      interactive: true,
      class: { root: "-mx-2 p-2 hover:bg-muted hover:shadow-none" },
    },
  ],
  defaultVariants: {
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
 * FileCardProgress: an upload bar with a label/percentage meta line. The fill width
 * rides a CSS variable (runtime value, no generated class) and tints destructive when the
 * card's `state` is `error`. Renders the bar in `idle` too; omit it once upload completes.
 */
export function FileCardProgress({
  className,
  value = 0,
  label,
  hideValue = false,
  ...props
}: FileCardProgressProps) {
  const { slots, state } = useFileCardContext("FileCardProgress")
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div
      data-slot="file-card-progress"
      className={slots.progress({ className })}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {(label || !hideValue) && (
        <div className={slots.progressMeta()}>
          <span className="truncate">{label}</span>
          {!hideValue && (
            <span className={cn(state === "error" && "text-destructive")}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={slots.progressTrack()}>
        <div
          className={slots.progressFill()}
          style={{ "--file-card-progress": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ status glyph --- */

const STATUS_ICON = {
  uploading: { icon: CircleNotch, tone: "text-muted-foreground animate-spin motion-reduce:animate-none" },
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
      <Glyph weight="bold" />
    </span>
  )
}
