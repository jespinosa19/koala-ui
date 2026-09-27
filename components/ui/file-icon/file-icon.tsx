import * as React from "react"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * FileIcon: a file-type illustration as inline SVG. A sheet of paper with a dog-eared corner,
 * two faint lines of text, and the extension stamped on it, toned by the file's category. It is
 * the glyph FileCard leads with, available on its own for upload trays, attachment chips, tables
 * and empty states.
 *
 * A multi-part SVG, so the recipe is a `tv` with `slots` (one per shape of the drawing), and every
 * fill and stroke is a semantic token utility: no raw colour anywhere. The category tone rides the
 * `<svg>` as `currentColor`, which each variant spends differently:
 *
 * - `default`: the paper blends with the card surface (a hairline outline defines it) and the tone
 *   fills a label band holding the extension, knocked out in the card colour.
 * - `soft`: the whole sheet is washed in the tone at low strength, outlined in it, and the extension
 *   is set in the tone itself. Quieter, for dense lists.
 * - `solid`: the sheet is the tone, the fold catches a lighter wash, and the extension is knocked
 *   out. The loudest, for a single hero file.
 *
 * The label sits at the same place in every variant, so swapping the variant never moves it.
 * Size is the HEIGHT; the width follows the sheet's 5:6 box.
 *
 * Changing `variant` morphs instead of snapping: every shape transitions its fill and stroke, and
 * the band fades out with `opacity` rather than `hidden`, since `display` cannot animate. No colour
 * here is a `color-mix()` over `currentColor` (what `fill-current/10` compiles to): Chrome cannot
 * interpolate one and starts the transition from transparent, so the icon blinks. The washes are
 * the bare tone at a `fill-opacity` instead, the same paint.
 */
const MORPH =
  "transition-[fill,stroke,fill-opacity,stroke-opacity,opacity,color] duration-base ease-out motion-reduce:transition-none"

export const fileIconVariants = tv({
  slots: {
    root: "inline-block aspect-[5/6] w-auto shrink-0 align-middle",
    sheet: MORPH,
    fold: MORPH,
    lines: MORPH,
    band: MORPH,
    label: ["font-sans", MORPH],
  },
  variants: {
    variant: {
      default: {
        sheet: "fill-card stroke-border",
        // A hair darker than the page so the fold reads as depth.
        fold: "fill-muted stroke-border",
        lines: "stroke-muted-foreground/25",
        band: "fill-current",
        label: "fill-card",
      },
      soft: {
        sheet: "fill-current stroke-current [fill-opacity:0.1] [stroke-opacity:0.3]",
        fold: "fill-current stroke-current [fill-opacity:0.15] [stroke-opacity:0.3]",
        lines: "stroke-current [stroke-opacity:0.3]",
        band: "fill-current opacity-0",
        // The bare tone is too light to read as text on its own 10% wash (sky and green fall
        // under 3:1), so the label leans 30% toward the ink: darker in light themes, lighter in
        // dark ones, the same move the `-strong` status tokens make. The mix goes on `color`, where
        // `currentColor` resolves to the inherited tone, so the fill it feeds stays interpolable.
        label: "text-[color:color-mix(in_oklab,currentColor_70%,var(--foreground))] fill-current",
      },
      solid: {
        // The stroke keeps the silhouette identical to the outlined variants (a 1.25 stroke grows
        // the shape by half its width); in the tone it simply reads as more sheet.
        sheet: "fill-current stroke-current",
        fold: "fill-card/35 stroke-current",
        lines: "stroke-card/40",
        band: "fill-current opacity-0",
        label: "fill-card",
      },
    },
    size: {
      sm: { root: "h-8" },
      md: { root: "h-10" },
      lg: { root: "h-12" },
      xl: { root: "h-16" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

/* ------------------------------------------------------------ file types --- */

/** The categories a file collapses to: each maps to a tone and a short generic label. */
export type FileIconType =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "sheet"
  | "slides"
  | "archive"
  | "code"
  | "design"
  | "text"
  | "default"

/**
 * Name, tone and generic label per category. The tone is a semantic colour role, so it re-themes
 * across all four palettes; the label is what the sheet shows when no extension is given (pass
 * `extension` or `label` to stamp the real one, "DOCX", "CSV"); the name reads in a meta line
 * ("Spreadsheet · 2.4 MB").
 */
export const FILE_ICON_TYPES: Record<FileIconType, { name: string; tone: string; label: string }> = {
  pdf: { name: "PDF", tone: "text-destructive", label: "PDF" },
  image: { name: "Image", tone: "text-purple", label: "IMG" },
  video: { name: "Video", tone: "text-pink", label: "VID" },
  audio: { name: "Audio", tone: "text-orange", label: "MP3" },
  doc: { name: "Document", tone: "text-info", label: "DOC" },
  sheet: { name: "Spreadsheet", tone: "text-success", label: "XLS" },
  slides: { name: "Presentation", tone: "text-warning", label: "PPT" },
  archive: { name: "Archive", tone: "text-teal", label: "ZIP" },
  code: { name: "Code", tone: "text-teal", label: "</>" },
  // Ink, not a hue: every colour role is taken by a busier category, and design tools dress their
  // own files in black. Near-black reads apart from the muted gray of text and unknown files.
  design: { name: "Design", tone: "text-foreground", label: "FIG" },
  text: { name: "Text", tone: "text-muted-foreground", label: "TXT" },
  default: { name: "Other", tone: "text-muted-foreground", label: "FILE" },
}

/** Extension → category, so a filename resolves straight to the right tone. */
const EXTENSION_TYPES: Record<string, FileIconType> = {
  pdf: "pdf",
  png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image", webp: "image", avif: "image", heic: "image", tif: "image", tiff: "image", bmp: "image", ico: "image",
  mp4: "video", mov: "video", webm: "video", avi: "video", mkv: "video", m4v: "video",
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio", aac: "audio",
  doc: "doc", docx: "doc", rtf: "doc", pages: "doc", odt: "doc",
  xls: "sheet", xlsx: "sheet", csv: "sheet", numbers: "sheet", ods: "sheet",
  ppt: "slides", pptx: "slides", key: "slides", odp: "slides",
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
  js: "code", ts: "code", jsx: "code", tsx: "code", json: "code", html: "code", css: "code", py: "code", rb: "code", go: "code", rs: "code", sh: "code", xml: "code", yml: "code", yaml: "code", sql: "code", php: "code",
  fig: "design", sketch: "design", ai: "design", psd: "design", xd: "design", eps: "design", indd: "design",
  txt: "text", md: "text", log: "text",
}

/**
 * fileTypeFromName: the {@link FileIconType} of a filename (`"report.pdf"`) or a bare extension
 * (`"pdf"`, `".pdf"`), so a list can drive the icon straight from the file. Falls back to
 * `"default"` for unknown or extensionless names.
 */
export function fileTypeFromName(name: string): FileIconType {
  const ext = name.split(".").pop()?.toLowerCase()
  return (ext && EXTENSION_TYPES[ext]) || "default"
}

/* ------------------------------------------------------------------ part --- */

export interface FileIconProps
  extends Omit<React.ComponentProps<"svg">, "children">,
    VariantProps<typeof fileIconVariants> {
  /** The category: picks the tone and the generic label. Derived from `extension` when omitted. */
  type?: FileIconType
  /**
   * The file's extension (`"docx"`, `".csv"`) or its whole name (`"q3.xlsx"`). Stamps the real
   * extension on the sheet and, without an explicit `type`, picks the category from it.
   */
  extension?: string
  /** Override the stamped text outright (`"</>"`, `"RAW"`). Wins over `extension`. */
  label?: string
}

/**
 * `<FileIcon extension="pdf" />`, `<FileIcon extension="report.xlsx" variant="soft" size="lg" />`.
 *
 * Decorative by default (`aria-hidden`): the filename next to it already says what it is. Pass an
 * `aria-label` when the icon stands alone and it announces as an image. Override the tone with a
 * text colour in `className` (`text-brand`).
 */
export function FileIcon({
  type,
  extension,
  label,
  variant,
  size,
  className,
  ...props
}: FileIconProps) {
  const ext = extension?.split(".").pop()?.toUpperCase()
  const resolvedType = type ?? (extension ? fileTypeFromName(extension) : "default")
  const meta = FILE_ICON_TYPES[resolvedType]
  const text = label ?? ext ?? meta.label
  const slots = fileIconVariants({ variant, size })
  // Longer extensions step down so they never crowd the band edges; the short, common labels stay
  // big and legible at the 40px size.
  const fontSize = text.length <= 3 ? 8.5 : text.length === 4 ? 7 : 5.75
  const labelled = props["aria-label"] != null

  return (
    <svg
      data-slot="file-icon"
      viewBox="0 0 40 48"
      fill="none"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      className={slots.root({ className: cn(meta.tone, className) })}
      {...props}
    >
      {/* The sheet: A4 proportions (width 70% of the height), rounded 3 at the three square
          corners, cut on the diagonal where the fold is. */}
      <path
        d="M8 3 H26 L35 12 V42 A3 3 0 0 1 32 45 H8 A3 3 0 0 1 5 42 V6 A3 3 0 0 1 8 3 Z"
        className={slots.sheet()}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* The dog-eared corner. */}
      <path
        d="M26 3 V12 H35 Z"
        className={slots.fold()}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Two faint content lines imply text on the page above the label. */}
      <path
        d="M10 17 H24 M10 21.5 H30"
        className={slots.lines()}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="8" y="27" width="24" height="13" rx="2.5" className={slots.band()} />
      <text
        x="20"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        className={slots.label()}
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="-0.3"
      >
        {text}
      </text>
    </svg>
  )
}
