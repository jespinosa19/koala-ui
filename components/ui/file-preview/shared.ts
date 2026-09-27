import type * as React from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"

import { createContext } from "@/lib/create-context"
import { hitY } from "@/lib/hit-area"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * The pieces every FilePreview part shares: the one `tv` recipe, the context, the file-kind
 * resolver and the zoom arithmetic. They live apart from the parts so the PDF renderer
 * (file-preview-pdf.tsx) and the parts (file-preview.tsx) can both read them without importing
 * each other.
 */

export const filePreviewVariants = tv({
  slots: {
    // The frame is a grid, not a flex column, so every part keeps its own place when another is
    // dropped: the header spans the top row, the thumbnail rail and the canvas share the second,
    // and an absent part simply leaves its `auto` track at zero. `isolate` keeps the floating
    // toolbar's z-index local. In fullscreen the element fills the screen (the UA stylesheet sizes
    // it); it paints the page ground so the black ::backdrop never shows through, and loses its
    // corners and its contour.
    root: [
      "group/file-preview relative isolate grid h-[36rem] min-h-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden text-foreground outline-none",
      "[&:fullscreen]:rounded-none [&:fullscreen]:bg-background [&:fullscreen]:shadow-none [&:fullscreen]:ring-0",
    ],
    // The identity bar: the file's glyph, its name over a meta line, and the actions on the right.
    // The rule under it is an internal divider between two regions, so it stays a `border`.
    header: "col-span-full row-start-1 flex min-w-0 items-center gap-3 border-b border-border px-4 py-3",
    icon: "shrink-0",
    // min-w-0 lets a long filename truncate instead of pushing the actions off the bar.
    info: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "truncate text-sm font-medium text-foreground",
    // tabular-nums: the page count and the dimensions arrive after load and must not reflow the line.
    meta: "truncate text-xs tabular-nums text-muted-foreground",
    actions: "ml-auto flex shrink-0 items-center gap-1",
    // ── Thumbnail rail ─────────────────────────────────────────────────────────────────
    // A column of page thumbnails beside the canvas, on the page ground (no fill of its own), and
    // only where there is room for it: under `md` the canvas keeps the whole width.
    sidebar: [
      "col-start-1 row-start-2 flex w-40 min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain border-r border-border p-4",
      "[scrollbar-width:thin] max-md:hidden data-[state=closed]:hidden",
    ],
    thumb: "group/thumb flex shrink-0 cursor-pointer flex-col items-center gap-1.5 outline-none",
    // The page is paper: white in every theme, the one literal here (the PDF's own colors assume
    // it). Its edge is the image outline (pure black at 10%), the current page's is the brand ring.
    thumbPage: [
      "relative w-full overflow-hidden rounded-xs bg-white shadow-xs ring-1 ring-black/10 dark:ring-white/10",
      "transition-[box-shadow] duration-fast ease-out motion-reduce:transition-none",
      "group-hover/thumb:ring-black/25 dark:group-hover/thumb:ring-white/25",
      "group-data-[active]/thumb:ring-2 group-data-[active]/thumb:ring-brand",
      "group-focus-visible/thumb:ring-2 group-focus-visible/thumb:ring-brand group-focus-visible/thumb:ring-offset-2 group-focus-visible/thumb:ring-offset-background",
      "[&>img]:absolute [&>img]:inset-0 [&>img]:size-full",
    ],
    thumbLabel: [
      "text-xs font-medium tabular-nums text-muted-foreground",
      "transition-colors duration-fast ease-out group-data-[active]/thumb:text-foreground",
    ],
    // ── Canvas ─────────────────────────────────────────────────────────────────────────
    // The well every document sits in. bg-muted is a deliberate ground (not elevation), declared
    // as the surface for any control inside it. A toolbar floating over it reserves room at the
    // bottom of the scroll area, so the last page scrolls clear of the bar.
    viewport: [
      "relative col-start-2 row-start-2 min-h-0 min-w-0 overflow-hidden bg-muted [--surface:var(--muted)]",
      "has-[>[data-slot=file-preview-toolbar]]:[--file-preview-toolbar-space:4rem]",
      // The toolbar floats bottom-centre, inset from the edges, and scrolls sideways (the Toolbar's
      // own `scrollable`) rather than overflowing a narrow canvas. The wrapper lets clicks through
      // everywhere but on the bar itself.
      // On a phone it clears the home indicator (a full-screen dialog reaches the bottom edge).
      "[&>[data-slot=file-preview-toolbar]]:pointer-events-none [&>[data-slot=file-preview-toolbar]]:absolute [&>[data-slot=file-preview-toolbar]]:inset-x-4 [&>[data-slot=file-preview-toolbar]]:bottom-[max(1rem,env(safe-area-inset-bottom))] [&>[data-slot=file-preview-toolbar]]:z-10 [&>[data-slot=file-preview-toolbar]]:justify-center",
      "[&>[data-slot=file-preview-toolbar]>*]:pointer-events-auto",
    ],
    // The scroller. `container-type: size` so a player can size itself to the canvas with cq units.
    // A stable gutter keeps the fit arithmetic from oscillating as a scrollbar comes and goes. One
    // finger scrolls natively; two are the component's pinch, so the browser's own page zoom stays
    // out of it. The focus mark is an outline pulled inside: an inset ring would paint under the pages.
    content: [
      "absolute inset-0 overflow-auto overscroll-contain outline-none [container-type:size]",
      "px-4 pt-4 pb-[calc(1rem+var(--file-preview-toolbar-space,0px))]",
      "sm:px-6 sm:pt-6 sm:pb-[calc(1.5rem+var(--file-preview-toolbar-space,0px))]",
      "[scrollbar-gutter:stable] [scrollbar-width:thin] touch-pan-x touch-pan-y",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
      "data-[pannable]:cursor-grab data-[panning]:cursor-grabbing data-[panning]:select-none",
    ],
    // What the scroller scrolls: at least as big as the canvas, as big as the document when it is
    // bigger. `safe` centering centres a document that fits and falls back to the start edge the
    // moment it overflows, so nothing is ever pushed out of reach above or left of the scroll origin.
    stage: "flex min-h-full w-max min-w-full flex-col items-center justify-center-safe gap-4",
    // ── Documents ──────────────────────────────────────────────────────────────────────
    // A PDF page: paper (white in every theme, see thumbPage), lifted off the canvas. The custom
    // properties are the ones PDF.js's text layer lays itself out with.
    page: [
      "group/page relative shrink-0 overflow-hidden bg-white shadow-md ring-1 ring-black/10 dark:ring-white/10",
      "[--scale-round-x:1px] [--scale-round-y:1px] [--total-scale-factor:calc(var(--scale-factor)*var(--user-unit,1))]",
    ],
    // The page's bitmap host: canvases are swapped in imperatively, whole, so a re-render never
    // shows a half-painted page.
    pageCanvas: [
      "absolute inset-0 [&>canvas]:absolute [&>canvas]:inset-0 [&>canvas]:block [&>canvas]:size-full",
      // The first paint fades in over the blank sheet; a repaint after a zoom swaps in place.
      "opacity-0 transition-opacity duration-base ease-out motion-reduce:transition-none group-data-[painted]/page:opacity-100",
    ],
    // Waiting for a page's first paint: a quiet spinner on the paper (black at 25%, since the paper
    // is white in every theme).
    pageSpinner: "absolute inset-0 m-auto text-black/25",
    // PDF.js's selectable text: transparent runs laid exactly over the glyphs of the bitmap, so a
    // drag selects real text and the browser's find-in-page lands on it. These are the rules of
    // PDF.js's own text layer stylesheet, restated as utilities (the runs carry `--font-height`,
    // `--scale-x` and `--rotate` inline; the container carries `--min-font-size`).
    textLayer: [
      "absolute inset-0 z-0 origin-top-left overflow-clip leading-none [text-align:initial] [text-size-adjust:none] [forced-color-adjust:none] [letter-spacing:normal] [word-spacing:normal]",
      "[--text-scale-factor:calc(var(--total-scale-factor)*var(--min-font-size,1))] [--min-font-size-inv:calc(1/var(--min-font-size,1))]",
      "[&_:is(span,br)]:absolute [&_:is(span,br)]:origin-top-left [&_:is(span,br)]:cursor-text [&_:is(span,br)]:whitespace-pre [&_:is(span,br)]:text-transparent",
      "[&_span:not(.markedContent)]:z-[1] [&_span:not(.markedContent)]:[font-size:calc(var(--text-scale-factor)*var(--font-height,0px))]",
      "[&_span:not(.markedContent)]:[transform:rotate(var(--rotate,0deg))_scaleX(var(--scale-x,1))_scale(var(--min-font-size-inv))]",
      "[&_.markedContent]:contents",
      "selection:bg-brand/25 selection:text-transparent",
      "data-[main-rotation='90']:[transform:rotate(90deg)_translateY(-100%)]",
      "data-[main-rotation='180']:[transform:rotate(180deg)_translate(-100%,-100%)]",
      "data-[main-rotation='270']:[transform:rotate(270deg)_translateX(-100%)]",
    ],
    // An image: a box at the rotated, scaled size, with the picture centred in it and turned
    // about its own centre. The checkerboard only shows through transparent pixels, so a dark logo
    // on a transparent ground still reads in the dark themes. The edge is the image outline (#11).
    image: "relative shrink-0",
    imageElement: [
      "absolute left-1/2 top-1/2 -translate-1/2 max-w-none select-none",
      "bg-[conic-gradient(var(--color-muted)_25%,var(--color-card)_0_50%,var(--color-muted)_0_75%,var(--color-card)_0)] bg-size-[16px_16px]",
      "outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
      "transition-[opacity,rotate] duration-base ease-out motion-reduce:transition-none",
      "data-[loaded=false]:opacity-0",
    ],
    // A text file on a sheet. It rises off the canvas, so it fills (`bg-card`) and declares it.
    // The inner body is what zooms (CSS `zoom`, so the text re-lays out crisp at every level).
    sheet: "relative shrink-0 overflow-hidden rounded-sm bg-card text-card-foreground shadow-md ring-1 ring-edge [--surface:var(--card)]",
    sheetBody: "w-[720px] px-10 py-8 font-mono text-xs leading-5 [counter-reset:line] [tab-size:2]",
    // One line per row, numbered from a CSS counter in a gutter the selection skips.
    line: [
      "relative min-h-5 whitespace-pre-wrap break-words pl-12 [counter-increment:line]",
      "before:absolute before:left-0 before:w-8 before:text-right before:text-muted-foreground/60 before:select-none before:content-[counter(line)]",
    ],
    note: "mt-6 border-t border-border pt-4 font-sans text-xs text-muted-foreground",
    // A video takes the widest 16:9 box the canvas can hold, in container units of the scroller.
    media: "w-[min(100cqw,calc(100cqh*16/9))] max-w-5xl",
    // An audio file is a pill on the canvas: play, the clip's waveform, the time. The header
    // already names the file, so the player carries no glyph of its own. It rises, so it fills.
    // The 40px button sits in 8px of padding, so the pill's radius is its own (20 + 8): concentric.
    audio: [
      "flex w-full max-w-md items-center gap-3 rounded-pill bg-card p-2 pr-5 text-card-foreground shadow-md ring-1 ring-edge [--surface:var(--card)]",
    ],
    // The seek is the waveform itself: a Radix Slider whose track is the bars, 40px tall so the
    // whole strip is the hit area (#16). The pointer's position is written to --hover from JS.
    audioSeek: [
      "group/seek relative flex h-10 min-w-0 flex-1 cursor-pointer touch-none select-none items-center outline-none",
      "data-[disabled]:cursor-default",
    ],
    // Three identical rows of bars stacked: the rest (quiet), what the pointer would play to
    // (hover), and what has played (full ink). The upper two are clipped from the right, so the
    // split falls mid-bar and glides instead of stepping a bar at a time.
    audioWave: "relative h-7 w-full",
    audioBars: "absolute inset-0 flex items-center justify-between text-foreground/20",
    audioBarsHover: [
      "text-foreground/45 opacity-0 [clip-path:inset(0_calc(100%-var(--hover,0%))_0_0)]",
      "transition-opacity duration-fast ease-out motion-reduce:transition-none group-hover/seek:opacity-100 group-data-[disabled]/seek:hidden",
    ],
    audioBarsPlayed: "text-foreground",
    // px, not rem: the bar count is worked out from this width in JS. A bar never drops below a
    // dot, so silence (and a clip still decoding, or one that can't be read) is a dotted rail.
    // The bars rise from those dots once the clip is decoded, swept left to right.
    audioBar: [
      "w-[3px] min-h-[3px] shrink-0 rounded-full bg-current",
      "transition-[height] duration-base ease-out motion-reduce:transition-none",
    ],
    // The thumb only shows under the keyboard: a brand playhead line, since the ink split already
    // marks the position for the pointer.
    audioPlayhead: [
      "block h-8 w-0.5 rounded-full bg-brand opacity-0 outline-none",
      "transition-opacity duration-fast ease-out motion-reduce:transition-none",
      "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand/30",
    ],
    // One readout: the length at rest, the running clock once it plays. It never shifts as it
    // ticks (tabular-nums, and a floor on its width set inline from the length's digits).
    audioTime: [
      "shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground",
      "transition-colors duration-fast ease-out data-[started]:text-foreground",
    ],
    // Two glyphs that mean different things (play and pause, enter and leave full screen) stay
    // mounted in one grid cell and cross-fade: opacity, scale from 0.25 and a 4px blur. Their size
    // is the host's (the Button's 16px, the toolbar's 20px), so the cell sets none.
    swap: "grid place-items-center [&>svg]:col-start-1 [&>svg]:row-start-1",
    swapGlyph: [
      "scale-25 opacity-0 blur-[4px]",
      "transition-[opacity,scale,filter] duration-fast ease-out motion-reduce:transition-none",
      "data-[visible]:scale-100 data-[visible]:opacity-100 data-[visible]:blur-[0px]",
    ],
    // Loading sits centred on the canvas.
    status: "flex flex-col items-center gap-3 text-center text-sm text-muted-foreground",
    // The file's glyph standing in for an empty state's media tile: the illustration is its own
    // frame, so it takes the tile's gap to the title but none of its chrome.
    statusIcon: "mb-4",
    // ── Toolbar controls ───────────────────────────────────────────────────────────────
    // The positioned wrapper around the Toolbar (the canvas places it, see `viewport`). A control
    // with nothing to do for this file renders nothing, so a separator it leaves leading,
    // trailing or doubled folds away. The bar may shrink below its content (then it scrolls).
    toolbar: [
      "flex min-w-0 [&>[data-slot=toolbar]]:min-w-0 [&>[data-slot=toolbar]]:max-w-full",
      "[&_[data-slot=toolbar-separator]:first-child]:hidden [&_[data-slot=toolbar-separator]:last-child]:hidden",
      "[&_[data-slot=toolbar-separator]+[data-slot=toolbar-separator]]:hidden",
    ],
    // The page field: a control you type into that sits in a row of buttons, so it takes their
    // chip (8px corners, the hover fill) instead of a field's frame, and widens with the digit
    // count (set inline as --digits). The label around it carries the 40px target, since an
    // <input> can't hold a pseudo-element of its own.
    pageField: `flex items-center ${hitY}`,
    pageInput: [
      "h-7 w-[calc(var(--digits,1)*1ch+1rem)] min-w-8 rounded-sm bg-transparent px-1 text-center text-sm font-medium tabular-nums text-foreground pointer-coarse:text-base",
      "outline-none transition-colors duration-fast ease-out hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-brand",
      "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      "disabled:pointer-events-none disabled:opacity-40",
    ],
    pageTotal: "shrink-0 select-none pr-1.5 pl-0.5 text-sm tabular-nums text-muted-foreground",
    // The zoom readout on the menu trigger: wide enough for "100%" so the bar never shifts as it ticks.
    zoomValue: "min-w-[4.5ch] text-center text-sm font-medium tabular-nums",
    // ── Dialog ─────────────────────────────────────────────────────────────────────────
    // The modal surface: edge to edge on a phone, inset with the dialog corner from `sm`. It
    // rises, so it fills and declares its surface.
    dialog: [
      "fixed inset-0 z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-xl outline-none [--surface:var(--popover)]",
      "sm:inset-4 sm:rounded-xl sm:ring-1 sm:ring-border-soft lg:inset-8",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-98",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-98",
      "duration-base ease-out",
    ],
  },
  variants: {
    // The frame's chrome, for the preview in the page flow. In-flow containers paint no fill
    // (docs/FOUNDATIONS.md "Fill is elevation"): `default` is the edge ring plus the xs lift,
    // `outline` the bare ring at full border strength, `plain` nothing at all, for a preview that
    // sits in a surface which already owns its chrome (a pane, a dialog).
    variant: {
      default: { root: "rounded-xl shadow-xs ring-1 ring-edge" },
      outline: { root: "rounded-xl ring-1 ring-border" },
      plain: { root: "" },
    },
  },
  defaultVariants: { variant: "default" },
})

export type FilePreviewSlots = ReturnType<typeof filePreviewVariants>
export type FilePreviewVariant = NonNullable<VariantProps<typeof filePreviewVariants>["variant"]>

/* ------------------------------------------------------------------ kinds --- */

/**
 * How a file is shown: `pdf` and `image` are paged, zoomable documents, `text` is a numbered
 * sheet, `video` and `audio` play, and anything else is `unsupported` (the canvas offers the
 * download instead).
 */
export type FilePreviewKind = "pdf" | "image" | "video" | "audio" | "text" | "unsupported"

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico", "apng", "jfif"])
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogv"])
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "oga", "m4a", "aac", "flac", "opus", "weba"])
const TEXT_EXTENSIONS = new Set([
  "txt", "text", "md", "markdown", "mdx", "csv", "tsv", "log", "ini", "toml", "env", "conf",
  "json", "jsonc", "json5", "xml", "yml", "yaml", "graphql", "gql", "sql",
  "js", "mjs", "cjs", "jsx", "ts", "mts", "cts", "tsx", "css", "scss", "sass", "less", "html", "htm",
  "vue", "svelte", "astro", "py", "rb", "go", "rs", "java", "kt", "swift", "c", "h", "cc", "cpp",
  "hpp", "cs", "php", "sh", "bash", "zsh", "ps1", "lua", "dart", "r", "pl", "ex", "exs",
])
// MIME types a browser labels as `application/*` that are really text.
const TEXT_MIME = new Set([
  "application/json", "application/ld+json", "application/xml", "application/javascript",
  "application/x-javascript", "application/typescript", "application/x-sh", "application/sql",
  "application/graphql", "application/toml", "application/yaml", "application/x-yaml",
])

/**
 * The lower-case extension of a filename or URL (`"q3.PDF?x=1"` → `"pdf"`), if it has one. A dot
 * file is all extension (`".env"` → `"env"`), the way an editor reads it.
 */
export function extensionOf(name?: string): string | undefined {
  if (!name) return undefined
  const path = name.split(/[?#]/)[0]
  const base = path.split("/").pop() ?? path
  const dot = base.lastIndexOf(".")
  if (dot < 0 || dot === base.length - 1) return undefined
  return base.slice(dot + 1).toLowerCase()
}

/**
 * filePreviewKind: which renderer a file gets, from its MIME type first and its extension second
 * (a browser reports an empty or generic type for plenty of real files, `.md` and `.ts` among them).
 */
export function filePreviewKind({ type, name }: { type?: string; name?: string }): FilePreviewKind {
  const mime = type?.split(";")[0].trim().toLowerCase()
  if (mime && mime !== "application/octet-stream") {
    if (mime === "application/pdf") return "pdf"
    if (mime.startsWith("image/")) return "image"
    if (mime.startsWith("video/")) return "video"
    if (mime.startsWith("audio/")) return "audio"
    if (mime.startsWith("text/") || TEXT_MIME.has(mime) || mime.endsWith("+json") || mime.endsWith("+xml")) {
      return "text"
    }
  }
  const ext = extensionOf(name)
  if (!ext) return "unsupported"
  if (ext === "pdf") return "pdf"
  if (IMAGE_EXTENSIONS.has(ext)) return "image"
  if (VIDEO_EXTENSIONS.has(ext)) return "video"
  if (AUDIO_EXTENSIONS.has(ext)) return "audio"
  if (TEXT_EXTENSIONS.has(ext)) return "text"
  return "unsupported"
}

/** A byte count in the units the upload components use (1024-based, one decimal). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** m:ss, or h:mm:ss past an hour (the VideoPlayer's format). */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`
}

/* ------------------------------------------------------------------- zoom --- */

/**
 * A zoom request: `"fit"` shows the whole page, `"width"` fills the canvas's width, a number is a
 * fixed scale (1 = 100%, the document's actual size). The fit modes track the canvas as it resizes.
 */
export type FilePreviewFitMode = "fit" | "width"
export type FilePreviewZoom = FilePreviewFitMode | number

/** The steps the zoom buttons walk (the browser's own PDF zoom ladder, widened at both ends). */
export const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8]

/** The fixed levels the zoom menu offers under the two fit modes. */
export const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

/** 100% for a PDF is its printed size: PDF.js works in points (1/72in), CSS in pixels (1/96in). */
export const PDF_TO_CSS_UNITS = 96 / 72

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** The next step above (`dir` 1) or below (`dir` -1) a scale, inside the allowed range. */
export function stepZoom(scale: number, dir: 1 | -1, min: number, max: number): number {
  const steps = ZOOM_STEPS.filter((s) => s >= min && s <= max)
  // A hair of tolerance so 0.9999 (a fit that landed next to a step) steps past it, not onto it.
  const next = dir > 0 ? steps.find((s) => s > scale * 1.001) : [...steps].reverse().find((s) => s < scale * 0.999)
  return next ?? (dir > 0 ? max : min)
}

export interface FilePreviewPageSize {
  /** CSS pixels at 100%, before the viewer's rotation. */
  width: number
  height: number
}

/**
 * How a kind of file answers `"fit"`:
 * - `vector` (a PDF, an SVG): the whole page, at whatever scale that takes.
 * - `raster` (a photo): the whole picture, but never past its own pixels, the way `object-fit:
 *   scale-down` behaves, because an upscaled photo is a blurred one.
 * - `flow` (a text sheet): the sheet's width, never past 100%. Text is read by scrolling, so
 *   shrinking a long sheet until it all fits would only make it unreadable.
 * `"width"` is an explicit ask to fill, so every kind does.
 */
export type FilePreviewFitBehavior = "vector" | "raster" | "flow"

/**
 * The scale a zoom request resolves to on a canvas of `available` pixels. A fit mode measures the
 * largest page (so every page of a mixed document fits, not just the first), turned by the
 * rotation.
 */
export function resolveScale({
  zoom,
  available,
  pages,
  rotation,
  behavior,
  min,
  max,
}: {
  zoom: FilePreviewZoom
  available: { width: number; height: number } | null
  pages: FilePreviewPageSize[]
  rotation: number
  behavior: FilePreviewFitBehavior
  min: number
  max: number
}): number {
  if (typeof zoom === "number") return clamp(zoom, min, max)
  // `!(x > 0)` rather than `x <= 0`, so a canvas that couldn't be measured (NaN) falls back too.
  if (!available || !pages.length || !(available.width > 0) || !(available.height > 0)) return 1
  const turned = Math.abs(rotation % 180) === 90
  let width = 0
  let height = 0
  for (const page of pages) {
    width = Math.max(width, turned ? page.height : page.width)
    height = Math.max(height, turned ? page.width : page.height)
  }
  if (!width || !height) return 1
  const byWidth = available.width / width
  let scale = byWidth
  if (zoom === "fit") {
    if (behavior === "flow") scale = Math.min(1, byWidth)
    else scale = Math.min(byWidth, available.height / height)
    if (behavior === "raster") scale = Math.min(1, scale)
  }
  // A fit can go below the manual floor (a huge panorama), never to nothing.
  return clamp(scale, 0.02, max)
}

/** Degrees into the 0-359 range (the state keeps the running total, so a turn always animates 90°). */
export const normalizeRotation = (degrees: number) => ((degrees % 360) + 360) % 360

/* ---------------------------------------------------------------- context --- */

export type FilePreviewStatus = "loading" | "ready" | "error"

/** What the renderer learns about the file once it has read it (drives FilePreviewMeta). */
export interface FilePreviewDetails {
  pageCount?: number
  /** Intrinsic pixel size of an image or a video. */
  width?: number
  height?: number
  /** Seconds, for audio and video. */
  duration?: number
  /** Line count of a text file. */
  lines?: number
}

/** A point to hold still while the scale changes, in client coordinates. Omit for the canvas centre. */
export interface FilePreviewAnchor {
  x: number
  y: number
}

export interface FilePreviewReport {
  status?: FilePreviewStatus
  error?: string | null
  details?: FilePreviewDetails
  pages?: FilePreviewPageSize[]
}

export interface FilePreviewContextValue {
  slots: FilePreviewSlots
  // ── The file ──
  kind: FilePreviewKind
  name: string
  extension: string | undefined
  mimeType: string | undefined
  size: number | undefined
  /** Where the renderers read from: the object URL of a `file`, or the `src`. */
  url: string | undefined
  /** The file itself, when one was given (text is read straight from it). */
  blob: Blob | undefined
  // ── What the renderer reported ──
  status: FilePreviewStatus
  error: string | null
  details: FilePreviewDetails
  pages: FilePreviewPageSize[]
  pdf: PDFDocumentProxy | null
  // ── View ──
  zoom: FilePreviewZoom
  scale: number
  minZoom: number
  maxZoom: number
  /** Running total in degrees; `normalizeRotation` for the 0-359 angle. */
  rotation: number
  page: number
  pageCount: number
  fullscreen: boolean
  fullscreenEnabled: boolean
  thumbnailsOpen: boolean
  zoomable: boolean
  rotatable: boolean
  paged: boolean
  /** PDF.js's selectable text layer over each page. */
  textLayer: boolean
  // ── Actions ──
  /**
   * Ask for a zoom, holding `anchor` still (the canvas centre when omitted). A discrete change
   * glides to the new scale; pass `{ animate: false }` for continuous input that is already moving.
   */
  setZoom: (zoom: FilePreviewZoom, anchor?: FilePreviewAnchor, options?: { animate?: boolean }) => void
  zoomIn: (anchor?: FilePreviewAnchor) => void
  zoomOut: (anchor?: FilePreviewAnchor) => void
  /** Continuous zoom (wheel, pinch): multiply the current scale, holding `anchor` still. */
  zoomBy: (factor: number, anchor?: FilePreviewAnchor) => void
  rotate: (degrees: number) => void
  goToPage: (page: number, behavior?: ScrollBehavior) => void
  toggleFullscreen: () => void
  setThumbnailsOpen: (open: boolean) => void
  download: () => void
  // ── Wiring between the root and the renderers ──
  rootRef: React.RefObject<HTMLDivElement | null>
  scrollerRef: React.RefObject<HTMLDivElement | null>
  report: (patch: FilePreviewReport) => void
  /** Called by the paged renderer as the reader scrolls. */
  setVisiblePage: (page: number) => void
  /** The scroller mounted/unmounted: the root starts or stops measuring it. */
  setScroller: (node: HTMLDivElement | null) => void
}

export const [FilePreviewProvider, useFilePreviewContext] =
  createContext<FilePreviewContextValue>("FilePreview")
