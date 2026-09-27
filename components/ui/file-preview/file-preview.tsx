"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, Slider as SliderPrimitive, VisuallyHidden } from "radix-ui"
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsInSimple,
  ArrowsOutLineHorizontal,
  ArrowsOutSimple,
  CaretDown,
  CaretUp,
  DownloadSimple,
  FrameCorners,
  Minus,
  Pause,
  Play,
  Plus,
  SidebarSimple,
  X,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { duration, easing, prefersReducedMotion } from "@/lib/motion"
import { type VariantProps } from "@/lib/tv"
import { Button } from "@/components/ui/button"
import { dialogVariants } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { FileIcon, type FileIconType } from "@/components/ui/file-icon"
import { Spinner } from "@/components/ui/spinner"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  type ToolbarButtonProps,
  type ToolbarProps,
} from "@/components/ui/toolbar"
import {
  Video,
  VideoBar,
  VideoControls,
  VideoFullscreen,
  VideoPlayButton,
  VideoPlayer,
  VideoSeek,
  VideoSpinner,
  VideoTime,
  VideoVolume,
} from "@/components/ui/video-player"

import { PdfDocumentView, PdfThumbnails, usePdfDocument, type FilePreviewPdfOptions } from "./file-preview-pdf"
import {
  FilePreviewProvider,
  ZOOM_PRESETS,
  clamp,
  extensionOf,
  filePreviewKind,
  filePreviewVariants,
  formatDuration,
  formatFileSize,
  normalizeRotation,
  resolveScale,
  stepZoom,
  useFilePreviewContext,
  type FilePreviewAnchor,
  type FilePreviewDetails,
  type FilePreviewFitBehavior,
  type FilePreviewFitMode,
  type FilePreviewKind,
  type FilePreviewPageSize,
  type FilePreviewReport,
  type FilePreviewStatus,
  type FilePreviewZoom,
} from "./shared"

/**
 * FilePreview: look at a file where it is, instead of opening it in another tab. A PDF pages
 * through with selectable text, an image zooms and pans, a text file reads as a numbered sheet,
 * video and audio play, and anything else offers its download. One set of view controls drives
 * them all: fit to page, fit to width, zoom in and out (buttons, the menu, ⌘/Ctrl + wheel, a
 * pinch), rotate, page through, full screen.
 *
 * Multi-part like VideoPlayer: one `tv` recipe with `slots` (shared.ts), and every piece of state
 * (the file, what the renderer learned about it, the zoom, the page) flows to the parts through
 * React Context, never prop-drilled. Compose it:
 *
 *   <FilePreview file={file}>
 *     <FilePreviewHeader>
 *       <FilePreviewIcon />
 *       <FilePreviewInfo>
 *         <FilePreviewTitle />
 *         <FilePreviewMeta />
 *       </FilePreviewInfo>
 *       <FilePreviewActions>
 *         <FilePreviewDownload />
 *       </FilePreviewActions>
 *     </FilePreviewHeader>
 *     <FilePreviewThumbnails />
 *     <FilePreviewViewport>
 *       <FilePreviewToolbar>
 *         <FilePreviewPageNav />
 *         <ToolbarSeparator />
 *         <FilePreviewZoomOut />
 *         <FilePreviewZoomMenu />
 *         <FilePreviewZoomIn />
 *         <ToolbarSeparator />
 *         <FilePreviewFit />
 *         <FilePreviewRotate />
 *       </FilePreviewToolbar>
 *     </FilePreviewViewport>
 *   </FilePreview>
 *
 * Every part can be left out. A control that has nothing to do for the file in hand (page
 * navigation on a photo, zoom on a video) renders nothing, and the toolbar folds away the
 * separator it leaves behind. `FilePreviewDialog` is the same preview in a modal.
 */

/* ------------------------------------------------------------------ utils --- */

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined
  defaultValue: T
  onChange?: (next: T) => void
}) {
  const [isControlled] = React.useState(value !== undefined)
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const resolved = isControlled ? (value as T) : internal
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [resolved, set, setInternal] as const
}

/**
 * An object URL for a Blob, created after mount and revoked on change or unmount. The URL is
 * tagged with the Blob it belongs to, so a render between a file swap and its effect never hands
 * the old (revoked) URL to the new file.
 */
function useObjectUrl(blob: Blob | undefined) {
  const [entry, setEntry] = React.useState<{ blob: Blob; url: string } | null>(null)
  React.useEffect(() => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    publish(url)
    return () => URL.revokeObjectURL(url)
    function publish(next: string) {
      setEntry({ blob: blob as Blob, url: next })
    }
  }, [blob])
  return blob && entry?.blob === blob ? entry.url : undefined
}

function nameFromUrl(src?: string) {
  if (!src) return undefined
  try {
    const path = new URL(src, "http://x").pathname
    const last = decodeURIComponent(path.split("/").pop() ?? "")
    return last || undefined
  } catch {
    return undefined
  }
}

function isSameOrigin(href: string) {
  if (href.startsWith("blob:") || href.startsWith("data:")) return true
  try {
    return new URL(href, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

const subscribeNothing = () => () => {}

/** Where the page rail can show: Tailwind's `md`, the breakpoint the rail's own `max-md:hidden` uses. */
const RAIL_QUERY = "(min-width: 48rem)"

function subscribeRail(onChange: () => void) {
  const query = window.matchMedia(RAIL_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * Whether the page rail has room. The server can't know, so it answers no; the toggle it gates only
 * appears once a PDF has loaded, which is always after hydration, so the answer never flickers.
 */
function useRailFits() {
  return React.useSyncExternalStore(
    subscribeRail,
    () => window.matchMedia(RAIL_QUERY).matches,
    () => false,
  )
}

/** Full screen for one element, following the browser (Esc and the native UI included). */
function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = React.useState(false)
  // Read once on the client; the server renders the control as unavailable, and hydration
  // re-renders it without a mismatch.
  const enabled = React.useSyncExternalStore(
    subscribeNothing,
    () => document.fullscreenEnabled === true,
    () => false,
  )
  React.useEffect(() => {
    const sync = () => setActive(document.fullscreenElement === ref.current)
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [ref])
  const toggle = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    // Both reject when the browser refuses (no gesture, not allowed): nothing to recover.
    if (document.fullscreenElement === el) void document.exitFullscreen().catch(() => {})
    else void el.requestFullscreen?.().catch(() => {})
  }, [ref])
  return { active, enabled, toggle }
}

const ICON_TYPE: Record<FilePreviewKind, FileIconType> = {
  pdf: "pdf",
  image: "image",
  video: "video",
  audio: "audio",
  text: "text",
  unsupported: "default",
}

/** Set inside FilePreviewDialog, so FilePreviewClose knows it can close something. */
const FilePreviewDialogContext = React.createContext(false)

/* ------------------------------------------------------------------- root --- */

interface ReportedState {
  status: FilePreviewStatus
  error: string | null
  details: FilePreviewDetails
  pages: FilePreviewPageSize[]
}

const initialReport = (kind: FilePreviewKind): ReportedState => ({
  // Nothing to load for a file the canvas can't show: it goes straight to its fallback.
  status: kind === "unsupported" ? "ready" : "loading",
  error: null,
  details: {},
  pages: [],
})

interface PendingAnchor {
  /** The page the point fell on, or null for the single-surface kinds. */
  page: number | null
  /** The point, as a fraction of that surface, and where it was on screen. */
  fx: number
  fy: number
  x: number
  y: number
  /** The canvas centre: restored to the centre of the canvas as it is then, not the old point. */
  center: boolean
  /** Glide to the new scale instead of jumping (a discrete change, not a wheel or a pinch). */
  animate: boolean
}

/**
 * The page under a screen height, or the nearer neighbour when it falls in the gap between two;
 * a single-surface file answers with its surface. Pages stack top to bottom, so a binary search
 * finds it in a handful of reads, however long the document.
 */
function surfaceAt(scroller: HTMLElement, y: number): HTMLElement | null {
  const pages = scroller.querySelectorAll<HTMLElement>("[data-slot=file-preview-page]")
  if (!pages.length) return scroller.querySelector<HTMLElement>("[data-file-preview-surface]")
  let lo = 0
  let hi = pages.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pages[mid].getBoundingClientRect().bottom < y) lo = mid + 1
    else hi = mid
  }
  const below = pages[lo]
  const above = lo > 0 ? pages[lo - 1] : null
  if (above) {
    const top = below.getBoundingClientRect().top
    if (top > y && y - above.getBoundingClientRect().bottom < top - y) return above
  }
  return below
}

export interface FilePreviewProps
  extends Omit<React.ComponentProps<"div">, "onError">,
    VariantProps<typeof filePreviewVariants> {
  /** The file to show: a `File` from an input or a drop, or any `Blob`. */
  file?: Blob | null
  /** Or a URL to read it from. Ignored when `file` is set. */
  src?: string
  /** Display name. Defaults to the File's name, else the last segment of `src`. */
  name?: string
  /** MIME type. Defaults to the File's type; the name's extension decides otherwise. */
  type?: string
  /** Size in bytes, for the meta line. Defaults to the File's size. */
  size?: number
  /** Pick the renderer yourself instead of detecting it from the type and the name. */
  kind?: FilePreviewKind
  /** Controlled zoom: `"fit"`, `"width"`, or a scale (1 = 100%). */
  zoom?: FilePreviewZoom
  /** @default "fit" */
  defaultZoom?: FilePreviewZoom
  onZoomChange?: (zoom: FilePreviewZoom) => void
  /** Controlled rotation in degrees (multiples of 90). */
  rotation?: number
  /** @default 0 */
  defaultRotation?: number
  onRotationChange?: (rotation: number) => void
  /** The page to open a PDF at. @default 1 */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Lowest scale the zoom controls reach (a fit may go lower). @default 0.1 */
  minZoom?: number
  /** Highest scale the zoom controls reach. @default 5 */
  maxZoom?: number
  /** Whether the thumbnail rail starts open (it only exists where there's room, from `md`). @default true */
  defaultThumbnailsOpen?: boolean
  /** Lay PDF.js's selectable text over each page, so text can be selected, copied and found. @default true */
  textLayer?: boolean
  /** Passed to PDF.js's `getDocument`: `cMapUrl`, `standardFontDataUrl`, `wasmUrl`, `password`, `withCredentials`… */
  pdfOptions?: FilePreviewPdfOptions
  /** Replace the built-in download (an anchor with the file's name). */
  onDownload?: () => void
}

/**
 * The root: resolves the file (a Blob becomes an object URL), detects how to show it, owns the view
 * state and hands it all to the parts. The zoom is a request (`"fit"`, `"width"` or a scale); the
 * scale it resolves to follows the canvas as it resizes, and every change of scale holds a point
 * still (the pointer for a pinch or a wheel, the centre of the canvas otherwise), so zooming never
 * throws the reader somewhere else in the document.
 */
export function FilePreview({
  file,
  src,
  name: nameProp,
  type,
  size: sizeProp,
  kind: kindProp,
  zoom: zoomProp,
  defaultZoom = "fit",
  onZoomChange,
  rotation: rotationProp,
  defaultRotation = 0,
  onRotationChange,
  defaultPage = 1,
  onPageChange,
  minZoom = 0.1,
  maxZoom = 5,
  defaultThumbnailsOpen = true,
  textLayer = true,
  pdfOptions,
  onDownload,
  variant,
  className,
  children,
  onKeyDown,
  ...props
}: FilePreviewProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const [scroller, setScrollerNode] = React.useState<HTMLDivElement | null>(null)

  // ── The file ───────────────────────────────────────────────────────────────────────
  const blob = file ?? undefined
  const fileName = blob && "name" in blob ? (blob as File).name : undefined
  const name = nameProp ?? fileName ?? nameFromUrl(src) ?? "Untitled"
  const mimeType = type ?? (blob?.type || undefined)
  const size = sizeProp ?? blob?.size
  const kind = kindProp ?? filePreviewKind({ type: mimeType, name })
  const extension = extensionOf(name)
  const objectUrl = useObjectUrl(blob)
  const url = blob ? objectUrl : src
  // How "fit" behaves for this file: a photo never enlarges, a text sheet fits its width.
  const behavior: FilePreviewFitBehavior =
    kind === "text"
      ? "flow"
      : kind === "image" && extension !== "svg" && mimeType !== "image/svg+xml"
        ? "raster"
        : "vector"

  // ── What the renderer reports, reset with the source ───────────────────────────────
  const source = blob ?? src ?? null
  const [reported, setReported] = React.useState<ReportedState>(() => initialReport(kind))
  const [zoom, setZoomValue, resetZoom] = useControllableState<FilePreviewZoom>({
    value: zoomProp,
    defaultValue: defaultZoom,
    onChange: onZoomChange,
  })
  const [rotation, setRotationValue, resetRotation] = useControllableState<number>({
    value: rotationProp,
    defaultValue: defaultRotation,
    onChange: onRotationChange,
  })
  const [page, setPage] = React.useState(1)
  const [prevSource, setPrevSource] = React.useState(source)
  if (prevSource !== source) {
    setPrevSource(source)
    setReported(initialReport(kind))
    setPage(1)
    resetZoom(defaultZoom)
    resetRotation(defaultRotation)
  }

  const report = React.useCallback((patch: FilePreviewReport) => {
    setReported((prev) => ({
      status: patch.status ?? prev.status,
      error: patch.error !== undefined ? patch.error : prev.error,
      details: patch.details ? { ...prev.details, ...patch.details } : prev.details,
      pages: patch.pages ?? prev.pages,
    }))
  }, [])

  const pdf = usePdfDocument({ url, enabled: kind === "pdf", options: pdfOptions, report })

  // ── The canvas and the scale ───────────────────────────────────────────────────────
  const [available, setAvailable] = React.useState<{ width: number; height: number } | null>(null)
  const scale = resolveScale({
    zoom,
    available,
    pages: reported.pages,
    rotation,
    behavior,
    min: minZoom,
    max: maxZoom,
  })

  const [thumbnailsOpen, setThumbnailsOpen] = React.useState(defaultThumbnailsOpen)
  const fullscreen = useFullscreen(rootRef)

  const pageCount = kind === "pdf" ? reported.pages.length : reported.pages.length ? 1 : 0
  const zoomable = kind === "pdf" || kind === "image" || kind === "text"
  const rotatable = kind === "pdf" || kind === "image"
  const paged = kind === "pdf"

  // ── Anchoring ──────────────────────────────────────────────────────────────────────
  // Every change of scale or rotation holds one point of the file still. An action names it (the
  // pointer for a wheel or a pinch, the centre of the canvas otherwise) before the state changes,
  // and the commit that applies the new scale scrolls that point back to where it was. A change
  // nobody anchored (a controlled zoom set from outside, a fit following a resize) falls back to
  // the centre, which is kept current as the reader scrolls. `requestedScale` is the scale asked for
  // but not yet committed, so a burst of wheel events compounds instead of re-reading a stale one.
  const pendingAnchor = React.useRef<PendingAnchor | null>(null)
  const centerAnchor = React.useRef<PendingAnchor | null>(null)
  const committed = React.useRef({ scale, rotation })
  const requestedScale = React.useRef<number | null>(null)
  const zoomAnimation = React.useRef<Animation | null>(null)

  /** Where a screen point falls in the file: the page (or the one surface) and the fraction across it. */
  const locate = React.useCallback((x?: number, y?: number): PendingAnchor | null => {
    const node = scrollerRef.current
    if (!node) return null
    const view = node.getBoundingClientRect()
    const center = x === undefined || y === undefined
    const px = x ?? view.left + node.clientWidth / 2
    const py = y ?? view.top + node.clientHeight / 2
    const target = surfaceAt(node, py)
    if (!target) return null
    const rect = target.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    return {
      page: target.dataset.pageNumber ? Number(target.dataset.pageNumber) : null,
      fx: (px - rect.left) / rect.width,
      fy: (py - rect.top) / rect.height,
      x: px,
      y: py,
      center,
      animate: false,
    }
  }, [])

  const captureAnchor = React.useCallback(
    (anchor: FilePreviewAnchor | undefined, animate: boolean) => {
      const found = locate(anchor?.x, anchor?.y)
      if (found) found.animate = animate
      pendingAnchor.current = found
    },
    [locate],
  )

  // Runs after every commit: settle the refs, put the anchored point back in place and, for a
  // discrete change (a step, a preset, a fit), glide the stage from the old size to the new one
  // around that point. The glide is a transform on the stage laid over a layout that is already
  // final (the FLIP technique), so the scroll position is right from the first frame and a new
  // zoom mid-glide picks up from wherever the last one had got to.
  React.useLayoutEffect(() => {
    const previous = committed.current
    committed.current = { scale, rotation }
    requestedScale.current = null
    const node = scrollerRef.current
    const changed = previous.scale !== scale || previous.rotation !== rotation
    const pending = pendingAnchor.current ?? (changed ? centerAnchor.current : null)
    pendingAnchor.current = null
    if (!node) return
    if (pending && changed) {
      const stage = node.querySelector<HTMLElement>("[data-slot=file-preview-stage]")
      let carry = 1
      const running = zoomAnimation.current
      if (running) {
        if (running.playState === "running" && stage) {
          carry = new DOMMatrixReadOnly(getComputedStyle(stage).transform).a || 1
        }
        running.cancel()
        zoomAnimation.current = null
      }
      const target =
        pending.page != null
          ? node.querySelector<HTMLElement>(`[data-slot=file-preview-page][data-page-number="${pending.page}"]`)
          : node.querySelector<HTMLElement>("[data-file-preview-surface]")
      if (target) {
        const view = node.getBoundingClientRect()
        const x = pending.center ? view.left + node.clientWidth / 2 : pending.x
        const y = pending.center ? view.top + node.clientHeight / 2 : pending.y
        const rect = target.getBoundingClientRect()
        node.scrollLeft += rect.left + pending.fx * rect.width - x
        node.scrollTop += rect.top + pending.fy * rect.height - y
        centerAnchor.current = locate()
        if (
          pending.animate &&
          typeof stage?.animate === "function" &&
          previous.scale !== scale &&
          !prefersReducedMotion()
        ) {
          const box = stage.getBoundingClientRect()
          const transformOrigin = `${x - box.left}px ${y - box.top}px`
          zoomAnimation.current = stage.animate(
            [
              { transform: `scale(${(previous.scale * carry) / scale})`, transformOrigin },
              { transform: "none", transformOrigin },
            ],
            { duration: duration.fast, easing: easing.out },
          )
        }
        return
      }
    }
    centerAnchor.current = locate()
  })

  // Keep the centre anchor current as the reader scrolls.
  React.useEffect(() => {
    if (!scroller) return
    let frame = 0
    const update = () => {
      frame = 0
      centerAnchor.current = locate()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    scroller.addEventListener("scroll", schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener("scroll", schedule)
    }
  }, [scroller, locate])

  const setZoom = React.useCallback(
    (next: FilePreviewZoom, anchor?: FilePreviewAnchor, options?: { animate?: boolean }) => {
      const value = typeof next === "number" ? clamp(next, minZoom, maxZoom) : next
      if (typeof value === "number") requestedScale.current = value
      captureAnchor(anchor, options?.animate ?? true)
      setZoomValue(value)
    },
    [captureAnchor, maxZoom, minZoom, setZoomValue],
  )
  const currentScale = () => requestedScale.current ?? committed.current.scale
  const zoomIn = React.useCallback(
    (anchor?: FilePreviewAnchor) => setZoom(stepZoom(currentScale(), 1, minZoom, maxZoom), anchor),
    [maxZoom, minZoom, setZoom],
  )
  const zoomOut = React.useCallback(
    (anchor?: FilePreviewAnchor) => setZoom(stepZoom(currentScale(), -1, minZoom, maxZoom), anchor),
    [maxZoom, minZoom, setZoom],
  )
  const zoomBy = React.useCallback(
    (factor: number, anchor?: FilePreviewAnchor) => {
      const base = currentScale()
      const next = clamp(base * factor, minZoom, maxZoom)
      if (Math.abs(next - base) < 1e-4) return
      // Continuous input is its own animation: no glide on top of it.
      setZoom(next, anchor, { animate: false })
    },
    [maxZoom, minZoom, setZoom],
  )
  const rotate = React.useCallback(
    (degrees: number) => {
      captureAnchor(undefined, false)
      setRotationValue(rotation + degrees)
    },
    [captureAnchor, rotation, setRotationValue],
  )

  const goToPage = React.useCallback(
    (target: number, behavior?: ScrollBehavior) => {
      const node = scrollerRef.current
      if (!node || !pageCount) return
      const next = clamp(Math.round(target), 1, pageCount)
      const el = node.querySelector<HTMLElement>(`[data-slot=file-preview-page][data-page-number="${next}"]`)
      if (!el) return
      const paddingTop = parseFloat(getComputedStyle(node).paddingTop) || 0
      node.scrollTo({
        top: el.offsetTop - paddingTop,
        behavior: behavior ?? (prefersReducedMotion() ? "auto" : "smooth"),
      })
      setPage(next)
    },
    [pageCount],
  )

  const setVisiblePage = React.useCallback((next: number) => setPage(next), [])

  // Measure the canvas the document can use: the scroller's box inside its padding (which already
  // leaves room for a floating toolbar). A fit that follows the new size keeps the centre still,
  // through the centre anchor above.
  const setScroller = React.useCallback((node: HTMLDivElement | null) => {
    scrollerRef.current = node
    setScrollerNode(node)
  }, [])
  const availableRef = React.useRef(available)
  React.useLayoutEffect(() => {
    if (!scroller) return
    const measure = () => {
      const style = getComputedStyle(scroller)
      const inset = (value: string) => parseFloat(value) || 0
      const width = scroller.clientWidth - inset(style.paddingLeft) - inset(style.paddingRight)
      const height = scroller.clientHeight - inset(style.paddingTop) - inset(style.paddingBottom)
      const prev = availableRef.current
      if (prev && Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5) return
      availableRef.current = { width, height }
      setAvailable(availableRef.current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [scroller])

  // Open a PDF at `defaultPage`, once its pages exist.
  const openedAt = React.useRef<unknown>(null)
  React.useEffect(() => {
    if (kind !== "pdf" || reported.status !== "ready" || !reported.pages.length) return
    if (openedAt.current === source) return
    openedAt.current = source
    if (defaultPage > 1) requestAnimationFrame(() => goToPage(defaultPage, "auto"))
  }, [kind, reported.status, reported.pages.length, source, defaultPage, goToPage])

  const onPageChangeRef = React.useRef(onPageChange)
  React.useEffect(() => {
    onPageChangeRef.current = onPageChange
  })
  React.useEffect(() => {
    if (paged) onPageChangeRef.current?.(page)
  }, [page, paged])

  const download = React.useCallback(() => {
    if (onDownload) return onDownload()
    if (!url) return
    const save = (href: string) => {
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = name
      anchor.rel = "noopener"
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
    }
    if (blob || isSameOrigin(url)) return save(url)
    // A cross-origin URL ignores `download`, so fetch it into a Blob first; a server that refuses
    // (no CORS) still gets the file opened, in a new tab, as the last resort.
    void fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.blob()
      })
      .then((data) => {
        const href = URL.createObjectURL(data)
        save(href)
        window.setTimeout(() => URL.revokeObjectURL(href), 1000)
      })
      .catch(() => window.open(url, "_blank", "noopener,noreferrer"))
  }, [blob, name, onDownload, url])

  // ── Keyboard ───────────────────────────────────────────────────────────────────────
  // While focus is anywhere in the preview: + / − / 0 zoom (with or without ⌘/Ctrl, so the
  // browser's own zoom stays out of it), R rotates (⇧R the other way), F toggles full screen, and
  // ← / → page through a PDF when nothing scrolls sideways. Typing in a field, an open menu (which
  // is portalled into the preview while it is full screen) and a video player (it has its own keys)
  // are left alone.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey) return
    const target = event.target as HTMLElement
    const root = rootRef.current
    if (!root || !root.contains(target)) return
    if (
      target.closest(
        "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role=menu], [role=listbox], [data-slot=video-player]",
      )
    ) {
      return
    }
    const mod = event.metaKey || event.ctrlKey
    const ready = reported.status === "ready"
    switch (event.key) {
      case "+":
      case "=":
        if (!zoomable || !ready) return
        event.preventDefault()
        zoomIn()
        return
      case "-":
      case "_":
        if (!zoomable || !ready) return
        event.preventDefault()
        zoomOut()
        return
      case "0":
        if (!zoomable || !ready) return
        event.preventDefault()
        setZoom("fit")
        return
      case "r":
      case "R":
        if (mod || !rotatable || !ready) return
        event.preventDefault()
        rotate(event.shiftKey ? -90 : 90)
        return
      case "f":
      case "F":
        if (mod || !fullscreen.enabled) return
        event.preventDefault()
        fullscreen.toggle()
        return
      case "ArrowLeft":
      case "ArrowRight": {
        const node = scrollerRef.current
        if (mod || !paged || !node || (target !== node && target !== root)) return
        if (node.scrollWidth > node.clientWidth + 1) return
        event.preventDefault()
        goToPage(page + (event.key === "ArrowRight" ? 1 : -1))
        return
      }
    }
  }

  // Zoom changes are announced once they settle, for anyone not watching the readout.
  const [announcement, setAnnouncement] = React.useState("")
  React.useEffect(() => {
    if (reported.status !== "ready" || !zoomable) return
    const timer = window.setTimeout(() => announce(`Zoom ${Math.round(scale * 100)}%`), 400)
    return () => window.clearTimeout(timer)
    function announce(text: string) {
      setAnnouncement(text)
    }
  }, [scale, reported.status, zoomable])

  const slots = React.useMemo(() => filePreviewVariants({ variant }), [variant])

  return (
    <FilePreviewProvider
      slots={slots}
      kind={kind}
      name={name}
      extension={extension}
      mimeType={mimeType}
      size={size}
      url={url}
      blob={blob}
      status={reported.status}
      error={reported.error}
      details={reported.details}
      pages={reported.pages}
      pdf={pdf}
      zoom={zoom}
      scale={scale}
      minZoom={minZoom}
      maxZoom={maxZoom}
      rotation={rotation}
      page={page}
      pageCount={pageCount}
      fullscreen={fullscreen.active}
      fullscreenEnabled={fullscreen.enabled}
      thumbnailsOpen={thumbnailsOpen}
      zoomable={zoomable}
      rotatable={rotatable}
      paged={paged}
      setZoom={setZoom}
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      zoomBy={zoomBy}
      rotate={rotate}
      goToPage={goToPage}
      toggleFullscreen={fullscreen.toggle}
      setThumbnailsOpen={setThumbnailsOpen}
      download={download}
      rootRef={rootRef}
      scrollerRef={scrollerRef}
      report={report}
      setVisiblePage={setVisiblePage}
      setScroller={setScroller}
      textLayer={textLayer}
    >
      <div
        ref={rootRef}
        data-slot="file-preview"
        data-kind={kind}
        data-status={reported.status}
        data-fullscreen={fullscreen.active || undefined}
        className={slots.root({ className })}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <span role="status" className="sr-only">
          {announcement}
        </span>
      </div>
    </FilePreviewProvider>
  )
}

/* ----------------------------------------------------------------- header --- */

export function FilePreviewHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFilePreviewContext("FilePreviewHeader")
  return <div data-slot="file-preview-header" className={slots.header({ className })} {...props} />
}

export type FilePreviewIconProps = Omit<React.ComponentProps<typeof FileIcon>, "type" | "extension">

/** The file-type illustration for the file in hand (the FileIcon a FileCard leads with). */
export function FilePreviewIcon({ className, size = "sm", ...props }: FilePreviewIconProps) {
  const { slots, name, extension, kind } = useFilePreviewContext("FilePreviewIcon")
  return (
    <FileIcon
      data-slot="file-preview-icon"
      type={extension ? undefined : ICON_TYPE[kind]}
      extension={extension ? name : undefined}
      size={size}
      className={slots.icon({ className })}
      {...props}
    />
  )
}

/** The name-over-meta column. Drop it and place the title alone; the actions still hold the edge. */
export function FilePreviewInfo({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFilePreviewContext("FilePreviewInfo")
  return <div data-slot="file-preview-info" className={slots.info({ className })} {...props} />
}

/** The file's name, one line, truncated (the whole name on hover). Children replace it. */
export function FilePreviewTitle({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots, name } = useFilePreviewContext("FilePreviewTitle")
  return (
    <div data-slot="file-preview-title" title={name} className={slots.title({ className })} {...props}>
      {children ?? name}
    </div>
  )
}

/**
 * The meta line, composed from what is known: the format, the size, then what the renderer
 * learned (the page count, the pixel size, the running time, the line count), so it fills in as
 * the file loads. Children replace it.
 */
export function FilePreviewMeta({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots, extension, kind, size, details } = useFilePreviewContext("FilePreviewMeta")
  const parts: string[] = []
  parts.push(extension ? extension.toUpperCase() : kind === "unsupported" ? "File" : kind.toUpperCase())
  if (size != null) parts.push(formatFileSize(size))
  if (details.pageCount) parts.push(`${details.pageCount} ${details.pageCount === 1 ? "page" : "pages"}`)
  if (details.width && details.height) parts.push(`${details.width} × ${details.height}`)
  if (details.duration) parts.push(formatDuration(details.duration))
  if (details.lines) parts.push(`${details.lines.toLocaleString("en-US")} ${details.lines === 1 ? "line" : "lines"}`)
  return (
    <div data-slot="file-preview-meta" className={slots.meta({ className })} {...props}>
      {children ?? parts.join(" · ")}
    </div>
  )
}

export function FilePreviewActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFilePreviewContext("FilePreviewActions")
  return <div data-slot="file-preview-actions" className={slots.actions({ className })} {...props} />
}

export type FilePreviewActionProps = Omit<React.ComponentProps<typeof Button>, "iconOnly">

// The header actions are the library's Button, ghost and small, and they hold still when pressed
// (no press scale on new work): the colour change and the focus ring are the feedback.

/** Download the file under its own name. Icon-only by default; pass children for a labelled button. */
export function FilePreviewDownload({
  children,
  onClick,
  variant = "ghost",
  size = "sm",
  static: isStatic = true,
  ...props
}: FilePreviewActionProps) {
  const { download, url } = useFilePreviewContext("FilePreviewDownload")
  const labelled = children != null
  return (
    <Button
      variant={variant}
      size={size}
      static={isStatic}
      iconOnly={!labelled}
      aria-label={labelled ? undefined : "Download"}
      disabled={!url}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) download()
      }}
      {...props}
    >
      {children ?? <DownloadSimple weight="bold" />}
    </Button>
  )
}

/**
 * Close the preview. Inside FilePreviewDialog it closes the dialog; anywhere else it is a plain
 * button, so wire `onClick` to whatever put the preview on screen.
 */
export function FilePreviewClose({
  children,
  variant = "ghost",
  size = "sm",
  static: isStatic = true,
  ...props
}: FilePreviewActionProps) {
  useFilePreviewContext("FilePreviewClose")
  const inDialog = React.useContext(FilePreviewDialogContext)
  const button = (
    <Button variant={variant} size={size} static={isStatic} iconOnly aria-label="Close" {...props}>
      {children ?? <X weight="bold" />}
    </Button>
  )
  return inDialog ? <DialogPrimitive.Close asChild>{button}</DialogPrimitive.Close> : button
}

/* ------------------------------------------------------------- thumbnails --- */

/**
 * The page rail beside the canvas: a thumbnail per page, the current one ringed, a click to jump.
 * Only a document with pages has one (it renders nothing for a photo), and only from `md` up.
 */
export function FilePreviewThumbnails({ className, ...props }: React.ComponentProps<"nav">) {
  const { slots, paged, pageCount, thumbnailsOpen } = useFilePreviewContext("FilePreviewThumbnails")
  if (!paged || pageCount < 2) return null
  return (
    <nav
      data-slot="file-preview-thumbnails"
      data-state={thumbnailsOpen ? "open" : "closed"}
      aria-label="Pages"
      className={slots.sidebar({ className })}
      {...props}
    >
      <PdfThumbnails />
    </nav>
  )
}

/* --------------------------------------------------------------- viewport --- */

/**
 * The canvas: renders the file (the kind decides how) inside its own scroller, and holds whatever
 * floats over it, the toolbar first. It is where the pointer gestures live: ⌘/Ctrl + wheel and a
 * trackpad or two-finger pinch zoom around the pointer, and a zoomed photo drags to pan.
 */
export function FilePreviewViewport({
  className,
  children,
  contentProps,
  ...props
}: React.ComponentProps<"div"> & {
  /** Props for the scroller inside (the element that takes focus and scrolls). */
  contentProps?: Omit<React.ComponentProps<"div">, "ref" | "children">
}) {
  const ctx = useFilePreviewContext("FilePreviewViewport")
  const { slots, kind, name, status, setScroller, scrollerRef } = ctx

  // The gestures read the latest actions through a ref, so the listeners attach once.
  const live = React.useRef(ctx)
  React.useEffect(() => {
    live.current = ctx
  })

  React.useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    const zoomable = () => live.current.zoomable && live.current.status === "ready"

    // ⌘/Ctrl + wheel, which is also what a trackpad pinch arrives as in Chrome, Edge and Firefox.
    // A pinch sends small deltas (followed 1:1); a mouse notch sends ~100, clamped to one step.
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !zoomable()) return
      event.preventDefault()
      const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1
      const delta = clamp(event.deltaY * lines, -25, 25)
      live.current.zoomBy(Math.exp(-delta / 100), { x: event.clientX, y: event.clientY })
    }

    // Two fingers on a touch screen. One finger keeps the native scroll (and its momentum).
    let pinch: { distance: number; scale: number } | null = null
    const spread = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !zoomable()) return
      pinch = { distance: spread(event.touches), scale: live.current.scale }
    }
    const onTouchMove = (event: TouchEvent) => {
      if (!pinch || event.touches.length !== 2) return
      event.preventDefault()
      const [a, b] = [event.touches[0], event.touches[1]]
      live.current.setZoom(
        pinch.scale * (spread(event.touches) / pinch.distance),
        { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 },
        { animate: false },
      )
    }
    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinch = null
    }

    // Safari on a Mac pinches with its own gesture events instead of ⌘ + wheel.
    let gestureScale = 1
    const onGestureStart = (event: Event) => {
      if (!zoomable()) return
      event.preventDefault()
      gestureScale = live.current.scale
    }
    const onGestureChange = (event: Event) => {
      if (!zoomable()) return
      event.preventDefault()
      const gesture = event as Event & { scale: number; clientX: number; clientY: number }
      live.current.setZoom(gestureScale * gesture.scale, { x: gesture.clientX, y: gesture.clientY }, { animate: false })
    }

    // Drag to pan a photo bigger than the canvas (a document keeps its drag for selecting text).
    let drag: { id: number; x: number; y: number; left: number; top: number } | null = null
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || live.current.kind !== "image") return
      if (!node.hasAttribute("data-pannable")) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: node.scrollLeft, top: node.scrollTop }
      node.setPointerCapture(event.pointerId)
      node.setAttribute("data-panning", "")
      event.preventDefault()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      node.scrollLeft = drag.left - (event.clientX - drag.x)
      node.scrollTop = drag.top - (event.clientY - drag.y)
    }
    const onPointerUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return
      drag = null
      node.removeAttribute("data-panning")
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId)
    }

    // Double-click a photo: to 100% at that point, and back to the fit.
    const onDoubleClick = (event: MouseEvent) => {
      if (live.current.kind !== "image" || !zoomable()) return
      const { zoom } = live.current
      live.current.setZoom(typeof zoom === "number" ? "fit" : 1, { x: event.clientX, y: event.clientY })
    }

    node.addEventListener("wheel", onWheel, { passive: false })
    node.addEventListener("touchstart", onTouchStart, { passive: true })
    node.addEventListener("touchmove", onTouchMove, { passive: false })
    node.addEventListener("touchend", onTouchEnd)
    node.addEventListener("touchcancel", onTouchEnd)
    node.addEventListener("gesturestart", onGestureStart)
    node.addEventListener("gesturechange", onGestureChange)
    node.addEventListener("pointerdown", onPointerDown)
    node.addEventListener("pointermove", onPointerMove)
    node.addEventListener("pointerup", onPointerUp)
    node.addEventListener("pointercancel", onPointerUp)
    node.addEventListener("dblclick", onDoubleClick)
    return () => {
      node.removeEventListener("wheel", onWheel)
      node.removeEventListener("touchstart", onTouchStart)
      node.removeEventListener("touchmove", onTouchMove)
      node.removeEventListener("touchend", onTouchEnd)
      node.removeEventListener("touchcancel", onTouchEnd)
      node.removeEventListener("gesturestart", onGestureStart)
      node.removeEventListener("gesturechange", onGestureChange)
      node.removeEventListener("pointerdown", onPointerDown)
      node.removeEventListener("pointermove", onPointerMove)
      node.removeEventListener("pointerup", onPointerUp)
      node.removeEventListener("pointercancel", onPointerUp)
      node.removeEventListener("dblclick", onDoubleClick)
    }
  }, [scrollerRef])

  // A photo that no longer fits can be dragged: say so with the cursor. Checked after every
  // commit, since a zoom, a turn or a fit that followed a resize can all change it.
  React.useLayoutEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    const overflows = node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1
    node.toggleAttribute("data-pannable", kind === "image" && status === "ready" && overflows)
  })

  const { className: contentClassName, ...content } = contentProps ?? {}

  return (
    <div data-slot="file-preview-viewport" className={slots.viewport({ className })} {...props}>
      <div
        ref={setScroller}
        data-slot="file-preview-content"
        role="group"
        aria-label={name}
        aria-busy={status === "loading" || undefined}
        tabIndex={0}
        className={slots.content({ className: contentClassName })}
        {...content}
      >
        <div data-slot="file-preview-stage" className={slots.stage()}>
          <FilePreviewDocument />
        </div>
      </div>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------- renderers --- */

function FilePreviewDocument() {
  const { kind, status, pdf, pages, textLayer } = useFilePreviewContext("FilePreviewViewport")
  if (status === "error") return <FilePreviewFallback />
  switch (kind) {
    case "pdf":
      return pdf && pages.length ? <PdfDocumentView textLayer={textLayer} /> : <FilePreviewLoading />
    case "image":
      return <ImageView />
    case "text":
      return <TextView />
    case "video":
      return <VideoView />
    case "audio":
      return <AudioView />
    default:
      return <FilePreviewFallback />
  }
}

function FilePreviewLoading() {
  const { slots } = useFilePreviewContext("FilePreviewViewport")
  return (
    <div data-slot="file-preview-loading" className={slots.status()}>
      <Spinner size="lg" label="Loading preview" />
    </div>
  )
}

/** The canvas's answer when it can't show the file: what it is, why, and the way to open it. */
function FilePreviewFallback() {
  const { slots, name, extension, kind, status, error, url } = useFilePreviewContext("FilePreviewViewport")
  const failed = status === "error"
  const format = extension ? `.${extension}` : "this"
  return (
    <EmptyState density="compact">
      <FileIcon
        type={extension ? undefined : ICON_TYPE[kind]}
        extension={extension ? name : undefined}
        size="xl"
        className={slots.statusIcon()}
      />
      <EmptyStateTitle>{failed ? "Preview unavailable" : "No preview for this file"}</EmptyStateTitle>
      <EmptyStateDescription>
        {failed
          ? `${error ?? "This file couldn't be displayed."} Download it to open it on your device.`
          : `There's no preview for ${format} files. Download it to open it on your device.`}
      </EmptyStateDescription>
      {url && (
        <EmptyStateActions>
          <FilePreviewDownload variant="outline">Download</FilePreviewDownload>
        </EmptyStateActions>
      )}
    </EmptyState>
  )
}

function ImageView() {
  const { slots, url, name, scale, rotation, pages, report } = useFilePreviewContext("FilePreviewViewport")
  const [loaded, setLoaded] = React.useState<string | null>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const natural = pages[0]

  const settle = React.useCallback(
    (img: HTMLImageElement) => {
      // An SVG without intrinsic size reports 0: give it a sensible sheet to scale from.
      const width = img.naturalWidth || 1024
      const height = img.naturalHeight || 768
      report({
        status: "ready",
        error: null,
        pages: [{ width, height }],
        details: img.naturalWidth ? { width, height } : {},
      })
      // Keyed to the URL this render asked for (currentSrc is absolute; the prop may not be).
      setLoaded(url ?? null)
    },
    [report, url],
  )

  // A server-rendered <img> can finish loading before hydration attaches onLoad, and that event
  // is gone for good. Ask the element itself once mounted: complete with pixels is loaded,
  // complete without is broken.
  React.useEffect(() => {
    const img = imgRef.current
    if (!img?.complete) return
    if (img.naturalWidth) settle(img)
    else if (img.getAttribute("src")) report({ status: "error", error: "This image couldn't be displayed." })
  }, [settle, report])
  const ready = !!natural && loaded === url
  const turned = normalizeRotation(rotation) % 180 !== 0
  const box = natural
    ? {
        width: (turned ? natural.height : natural.width) * scale,
        height: (turned ? natural.width : natural.height) * scale,
      }
    : undefined

  return (
    <>
      {!ready && (
        <div className={slots.status()}>
          <Spinner size="lg" label="Loading preview" />
        </div>
      )}
      <div
        data-slot="file-preview-image"
        data-file-preview-surface=""
        className={slots.image()}
        style={box ?? { width: 0, height: 0, overflow: "hidden" }}
      >
        {url && (
          // Native img: the source is usually an object URL for a file not uploaded yet, which
          // next/image can't optimize.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={url}
            alt={name}
            draggable={false}
            decoding="async"
            data-loaded={ready}
            className={slots.imageElement()}
            style={
              natural
                ? { width: natural.width * scale, height: natural.height * scale, rotate: `${rotation}deg` }
                : undefined
            }
            onLoad={(event) => settle(event.currentTarget)}
            onError={() => report({ status: "error", error: "This image couldn't be displayed." })}
          />
        )}
      </div>
    </>
  )
}

// A preview, not an editor: past these the sheet says what it left out.
const MAX_TEXT_BYTES = 1024 * 1024
const MAX_TEXT_LINES = 5000
// The sheet at 100%: 80-odd columns of the 12px mono face, the measure a code viewer reads at.
const SHEET = { width: 720, height: 960 }

/**
 * A file's lines, the way an editor counts them: a newline ends a line rather than starting an
 * empty one, so a file that ends with one (as most do) has no blank line of its own at the bottom.
 */
function splitLines(value: string): string[] {
  const lines = value.split(/\r\n|\r|\n/)
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop()
  return lines
}

function TextView() {
  const { slots, url, blob, scale, report } = useFilePreviewContext("FilePreviewViewport")
  const [text, setText] = React.useState<{ source: string | Blob; lines: string[]; clipped: boolean } | null>(null)
  const source = blob ?? url

  React.useEffect(() => {
    if (!source) return
    let cancelled = false
    const read: Promise<{ value: string; truncated: boolean }> =
      typeof source === "string"
        ? fetch(source).then(async (response) => {
            if (!response.ok) throw new Error(String(response.status))
            const value = await response.text()
            return { value: value.slice(0, MAX_TEXT_BYTES), truncated: value.length > MAX_TEXT_BYTES }
          })
        : source
            .slice(0, MAX_TEXT_BYTES)
            .text()
            .then((value) => ({ value, truncated: source.size > MAX_TEXT_BYTES }))
    read
      .then(({ value, truncated }) => {
        if (cancelled) return
        const all = splitLines(value)
        const clipped = truncated || all.length > MAX_TEXT_LINES
        setText({ source, lines: all.slice(0, MAX_TEXT_LINES), clipped })
        // A file cut short at the byte cap has more lines than were read: say nothing rather than
        // a count that is wrong.
        report({ status: "ready", error: null, pages: [SHEET], details: truncated ? {} : { lines: all.length } })
      })
      .catch(() => {
        if (!cancelled) report({ status: "error", error: "This file couldn't be read." })
      })
    return () => {
      cancelled = true
    }
  }, [source, report])

  if (!text || text.source !== source) return <FilePreviewLoading />

  const { lines, clipped } = text

  return (
    <div data-slot="file-preview-sheet" data-file-preview-surface="" className={slots.sheet()}>
      <div className={slots.sheetBody()} style={{ zoom: scale }}>
        {lines.map((line, index) => (
          <div key={index} className={slots.line()}>
            {line}
          </div>
        ))}
        {clipped && (
          <p className={slots.note()}>
            The preview shows the first {lines.length.toLocaleString("en-US")} lines. Download the file for the rest.
          </p>
        )}
      </div>
    </div>
  )
}

function VideoView() {
  const { slots, url, report } = useFilePreviewContext("FilePreviewViewport")
  if (!url) return <FilePreviewLoading />
  return (
    <div data-slot="file-preview-media" className={slots.media()}>
      <VideoPlayer>
        <Video
          src={url}
          preload="metadata"
          onLoadedData={(event) => {
            const video = event.currentTarget
            report({
              status: "ready",
              error: null,
              details: {
                duration: Number.isFinite(video.duration) ? video.duration : undefined,
                width: video.videoWidth || undefined,
                height: video.videoHeight || undefined,
              },
            })
          }}
          onError={() => report({ status: "error", error: "This video couldn't be played." })}
        />
        <VideoSpinner />
        <VideoControls>
          <VideoBar>
            <VideoPlayButton />
            <VideoSeek />
            <VideoTime />
            <VideoVolume />
            <VideoFullscreen />
          </VideoBar>
        </VideoControls>
      </VideoPlayer>
    </div>
  )
}

/** The waveform's geometry in CSS pixels: `audioBar`'s width, and the least gap between two bars. */
const WAVE_BAR = 3
const WAVE_GAP = 2
/** How finely the clip is measured, before it is binned to however many bars the width holds. */
const WAVE_RESOLUTION = 1024
/** Past this the clip isn't decoded (it would sit whole in memory): the rail stays dotted. */
const WAVE_MAX_BYTES = 20 * 1024 * 1024
/** The rate the clip is decoded at. A waveform needs no more, and it keeps a long clip small. */
const WAVE_SAMPLE_RATE = 8000

async function readAudio(url: string, blob: Blob | undefined, signal: AbortSignal): Promise<ArrayBuffer> {
  if (blob) {
    if (blob.size > WAVE_MAX_BYTES) throw new Error("too large")
    return blob.arrayBuffer()
  }
  const response = await fetch(url, { signal })
  if (!response.ok || Number(response.headers.get("content-length")) > WAVE_MAX_BYTES) {
    void response.body?.cancel()
    throw new Error("unreadable")
  }
  return response.arrayBuffer()
}

/**
 * The clip's loudness over its length: `WAVE_RESOLUTION` values (the RMS of each slice, across
 * every channel), scaled so the loudest slice is 1 and square-rooted, so a fading tail reads the
 * way the ear hears it ring out (on a linear scale it drops to dots) without flattening a loud
 * track into a block the way decibels would. An offline context decodes without asking for the
 * speakers, so the browser's autoplay policy never warns about it.
 */
async function measureAudio(data: ArrayBuffer): Promise<number[]> {
  let context: OfflineAudioContext
  try {
    context = new OfflineAudioContext(1, 1, WAVE_SAMPLE_RATE)
  } catch {
    // An engine that won't run a context that slow gets its usual rate.
    context = new OfflineAudioContext(1, 1, 44100)
  }
  const buffer = await context.decodeAudioData(data)
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index))
  const slices = Math.min(WAVE_RESOLUTION, buffer.length)
  const levels: number[] = []
  let loudest = 0
  for (let slice = 0; slice < slices; slice++) {
    const start = Math.floor((slice * buffer.length) / slices)
    const end = Math.floor(((slice + 1) * buffer.length) / slices)
    let sum = 0
    for (const channel of channels) for (let i = start; i < end; i++) sum += channel[i] * channel[i]
    const level = Math.sqrt(sum / Math.max(1, (end - start) * channels.length))
    levels.push(level)
    loudest = Math.max(loudest, level)
  }
  return loudest > 0 ? levels.map((level) => Math.sqrt(level / loudest)) : levels
}

/**
 * The clip's levels, read once per file; null while it decodes, and for good when it can't be read
 * (a cross-origin URL without CORS, a codec the engine can decode for playback but not here, a clip
 * past `WAVE_MAX_BYTES`). The result is tagged with its URL, so a file swap never shows the old shape.
 */
function useAudioLevels(url: string | undefined, blob: Blob | undefined) {
  const [entry, setEntry] = React.useState<{ url: string; levels: number[] } | null>(null)
  React.useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    readAudio(url, blob, controller.signal)
      .then(measureAudio)
      .then((levels) => {
        if (!controller.signal.aborted) setEntry({ url, levels })
      })
      .catch(() => {})
    return () => controller.abort()
  }, [url, blob])
  return entry && entry.url === url ? entry.levels : null
}

/** How many bars fit an element's width: tracked as it resizes. */
function useBarCount(ref: React.RefObject<HTMLElement | null>) {
  const [count, setCount] = React.useState(0)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setCount(Math.max(8, Math.floor((entry.contentRect.width + WAVE_GAP) / (WAVE_BAR + WAVE_GAP))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return count
}

/** `levels` binned to `count` bars, each the loudest slice under it (so a transient never vanishes). */
function binLevels(levels: number[], count: number) {
  return Array.from({ length: count }, (_, bar) => {
    const from = Math.floor((bar * levels.length) / count)
    const to = Math.max(from + 1, Math.floor(((bar + 1) * levels.length) / count))
    let level = 0
    for (let i = from; i < to && i < levels.length; i++) level = Math.max(level, levels[i])
    return level
  })
}

/**
 * Audio: a pill on the canvas holding play, the clip's waveform and its time, built from the
 * library's own parts (a Button, a Radix Slider) since the browser's control would ignore the
 * theme entirely. The waveform is the seek bar: click or drag anywhere on it, hover to see where a
 * click would land, arrow keys once it has focus (Space plays and pauses from there too).
 */
function AudioView() {
  const { slots, url, blob, report } = useFilePreviewContext("FilePreviewViewport")
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const waveRef = React.useRef<HTMLSpanElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [length, setLength] = React.useState(0)
  const levels = useAudioLevels(url, blob)
  const count = useBarCount(waveRef)

  // `timeupdate` fires four times a second, which steps the ink along; while it plays, the frame
  // loop reads the clock instead, so the split glides.
  React.useEffect(() => {
    if (!playing) return
    let frame = requestAnimationFrame(function tick() {
      const audio = audioRef.current
      if (audio) setTime(audio.currentTime)
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [playing])

  // The bars, built once per shape and shared by the three rows, so a frame of playback re-renders
  // the clip of each row and nothing inside it. They key on the count: a resize lays out a fresh
  // row at its final heights, and only the decode's arrival sweeps them up from the dots.
  const bars = React.useMemo(() => {
    const heights = levels ? binLevels(levels, count) : null
    return Array.from({ length: count }, (_, bar) => (
      <span
        key={`${count}-${bar}`}
        className={slots.audioBar()}
        style={{
          // 0%, not unset: `auto` can't be transitioned from, and the min height holds the dot.
          height: heights ? `${heights[bar] * 100}%` : "0%",
          transitionDelay: `${(bar / count) * duration.base}ms`,
        }}
      />
    ))
  }, [levels, count, slots])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  const position = Math.min(time, length)
  const progress = length ? (position / length) * 100 : 0
  const started = playing || position > 0

  return (
    <div data-slot="file-preview-audio" className={slots.audio()}>
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration
          setLength(Number.isFinite(value) ? value : 0)
          report({ status: "ready", error: null, details: { duration: Number.isFinite(value) ? value : undefined } })
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => report({ status: "error", error: "This audio couldn't be played." })}
      />
      <Button
        variant="neutral"
        size="lg"
        iconOnly
        static
        aria-label={playing ? "Pause" : "Play"}
        aria-pressed={playing}
        tooltip={false}
        onClick={toggle}
      >
        {/* Two meanings, two glyphs: both stay mounted and cross-fade (opacity, scale, blur). */}
        <span className={slots.swap()}>
          {/* The triangle's weight sits left of its box: nudged a pixel right to look centred. */}
          <Play weight="fill" data-visible={!playing || undefined} className={slots.swapGlyph({ className: "translate-x-px" })} />
          <Pause weight="fill" data-visible={playing || undefined} className={slots.swapGlyph()} />
        </span>
      </Button>
      <SliderPrimitive.Root
        data-slot="file-preview-audio-seek"
        className={slots.audioSeek()}
        value={[position]}
        max={length || 1}
        step={0.01}
        disabled={!length}
        onValueChange={([value]) => {
          const audio = audioRef.current
          if (!audio) return
          audio.currentTime = value
          setTime(value)
        }}
        onKeyDown={(event) => {
          if (event.key === " ") {
            event.preventDefault()
            toggle()
            return
          }
          // The step is fine so a drag lands where it's let go; an arrow jumps like the
          // VideoPlayer's (5 seconds), or a tenth of a short clip. Handled here, Radix stands down.
          const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
          const audio = audioRef.current
          if (!dir || !audio || !length) return
          event.preventDefault()
          const next = clamp(audio.currentTime + dir * Math.min(5, length / 10), 0, length)
          audio.currentTime = next
          setTime(next)
        }}
        // Where a click would land, for the hover row. Written straight to the element: it moves
        // with every pointer event and nothing else needs to re-render for it.
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const at = clamp((event.clientX - rect.left) / rect.width, 0, 1)
          event.currentTarget.style.setProperty("--hover", `${at * 100}%`)
        }}
      >
        <SliderPrimitive.Track ref={waveRef} className={slots.audioWave()}>
          <span aria-hidden className={slots.audioBars()}>
            {bars}
          </span>
          <span aria-hidden className={slots.audioBars({ className: slots.audioBarsHover() })}>
            {bars}
          </span>
          <span
            aria-hidden
            className={slots.audioBars({ className: slots.audioBarsPlayed() })}
            style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
          >
            {bars}
          </span>
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label="Seek"
          aria-valuetext={`${formatDuration(position)} of ${formatDuration(length)}`}
          className={slots.audioPlayhead()}
        />
      </SliderPrimitive.Root>
      <span
        data-slot="file-preview-audio-time"
        data-started={started || undefined}
        className={slots.audioTime()}
        style={{ minWidth: `${formatDuration(length).length}ch` }}
      >
        {formatDuration(started ? position : length)}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- toolbar --- */

export type FilePreviewToolbarProps = ToolbarProps

/**
 * The view controls, on the library's Toolbar (roving focus, arrow keys, one gliding tooltip).
 * Inside FilePreviewViewport it floats over the canvas, bottom centre; put it in the header
 * (`variant="plain"`) for a docked bar instead. It scrolls sideways when the canvas is narrower
 * than the bar, and renders nothing for a file with nothing to control (a video, an audio clip,
 * an unsupported file) or one that failed to load.
 */
export function FilePreviewToolbar({ className, scrollable = true, ...props }: FilePreviewToolbarProps) {
  const { slots, zoomable, status } = useFilePreviewContext("FilePreviewToolbar")
  if (!zoomable || status === "error") return null
  return (
    <div data-slot="file-preview-toolbar" className={slots.toolbar()}>
      <Toolbar aria-label="Preview controls" scrollable={scrollable} className={className} {...props} />
    </div>
  )
}

type ControlProps = Omit<ToolbarButtonProps, "tooltip" | "shortcut">

/**
 * Every control is the library's ToolbarButton, held still on press (no press scale on new work):
 * the chip, the colour and the focus ring are the feedback.
 */
function Control(props: ToolbarButtonProps) {
  return <ToolbarButton static {...props} />
}

export function FilePreviewZoomOut({ children, onClick, disabled, ...props }: ControlProps) {
  const { zoomable, status, scale, minZoom, zoomOut } = useFilePreviewContext("FilePreviewZoomOut")
  if (!zoomable) return null
  return (
    <Control
      tooltip="Zoom out"
      shortcut="−"
      disabled={disabled || status !== "ready" || scale <= minZoom + 1e-3}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) zoomOut()
      }}
      {...props}
    >
      {children ?? <Minus weight="bold" />}
    </Control>
  )
}

export function FilePreviewZoomIn({ children, onClick, disabled, ...props }: ControlProps) {
  const { zoomable, status, scale, maxZoom, zoomIn } = useFilePreviewContext("FilePreviewZoomIn")
  if (!zoomable) return null
  return (
    <Control
      tooltip="Zoom in"
      shortcut="+"
      disabled={disabled || status !== "ready" || scale >= maxZoom - 1e-3}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) zoomIn()
      }}
      {...props}
    >
      {children ?? <Plus weight="bold" />}
    </Control>
  )
}

export interface FilePreviewZoomMenuProps extends Omit<ControlProps, "children"> {
  /** The fixed levels listed under the two fit modes (1 = 100%). */
  presets?: number[]
}

/**
 * The live zoom readout, which opens the levels: fit to page, fit to width, then fixed steps. The
 * current request carries the brand check; a zoom reached by pinching (137%) checks nothing.
 */
export function FilePreviewZoomMenu({ presets = ZOOM_PRESETS, disabled, ...props }: FilePreviewZoomMenuProps) {
  const { slots, zoomable, status, zoom, scale, setZoom, minZoom, maxZoom } =
    useFilePreviewContext("FilePreviewZoomMenu")
  if (!zoomable) return null
  const percent = `${Math.round(scale * 100)}%`
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Control caret aria-label={`Zoom ${percent}`} disabled={disabled || status !== "ready"} {...props}>
          <span className={slots.zoomValue()}>{percent}</span>
        </Control>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" className="min-w-44">
        <DropdownMenuRadioGroup
          value={typeof zoom === "number" ? String(zoom) : zoom}
          onValueChange={(value) => setZoom(value === "fit" || value === "width" ? value : Number(value))}
        >
          {/* Text only, so the fit modes and the levels share one left edge; the glyphs live on
              the fit toggles in the bar. */}
          <DropdownMenuRadioItem value="fit">Fit to page</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="width">Fit to width</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {presets
            .filter((level) => level >= minZoom && level <= maxZoom)
            .map((level) => (
              <DropdownMenuRadioItem key={level} value={String(level)} className="tabular-nums">
                {Math.round(level * 100)}%
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The two fit modes as a pair of toggles: the whole page, or the full width. The pressed one is
 * the mode in force; zoom by hand and neither is, until you pick one again.
 */
export function FilePreviewFit({
  className,
  disabled,
}: {
  className?: string
  disabled?: boolean
}) {
  const { zoomable, status, zoom, setZoom } = useFilePreviewContext("FilePreviewFit")
  if (!zoomable) return null
  const off = disabled || status !== "ready"
  return (
    <ToolbarToggleGroup
      type="single"
      aria-label="Fit"
      className={className}
      value={zoom === "fit" || zoom === "width" ? zoom : ""}
      onValueChange={(value) => {
        if (value) setZoom(value as FilePreviewFitMode)
      }}
    >
      <ToolbarToggleItem static value="fit" tooltip="Fit to page" shortcut="0" disabled={off}>
        <FrameCorners weight="bold" />
      </ToolbarToggleItem>
      <ToolbarToggleItem static value="width" tooltip="Fit to width" disabled={off}>
        <ArrowsOutLineHorizontal weight="bold" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  )
}

export interface FilePreviewRotateProps extends ControlProps {
  /** @default "clockwise" */
  direction?: "clockwise" | "counterclockwise"
}

/** A quarter turn. The view turns, not the file: download still saves the original. */
export function FilePreviewRotate({ direction = "clockwise", children, onClick, disabled, ...props }: FilePreviewRotateProps) {
  const { rotatable, status, rotate } = useFilePreviewContext("FilePreviewRotate")
  if (!rotatable) return null
  const clockwise = direction === "clockwise"
  return (
    <Control
      tooltip={clockwise ? "Rotate right" : "Rotate left"}
      shortcut={clockwise ? "R" : "⇧R"}
      disabled={disabled || status !== "ready"}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) rotate(clockwise ? 90 : -90)
      }}
      {...props}
    >
      {children ?? (clockwise ? <ArrowClockwise weight="bold" /> : <ArrowCounterClockwise weight="bold" />)}
    </Control>
  )
}

/**
 * Previous page, the page field, the count, next page. The field takes a number and jumps there
 * on Enter (Escape puts the current page back); the arrows glide to the neighbouring page. Only a
 * paged document has one.
 */
export function FilePreviewPageNav({ className }: { className?: string }) {
  const { slots, paged, page, pageCount, goToPage, status } = useFilePreviewContext("FilePreviewPageNav")
  const [draft, setDraft] = React.useState<string | null>(null)
  const totalId = React.useId()
  if (!paged) return null
  const ready = status === "ready" && pageCount > 0

  const commit = () => {
    if (draft == null) return
    const target = Number.parseInt(draft, 10)
    setDraft(null)
    if (Number.isFinite(target) && target !== page) goToPage(target, "auto")
  }

  return (
    <ToolbarGroup aria-label="Pages" className={className}>
      <Control tooltip="Previous page" shortcut="←" disabled={!ready || page <= 1} onClick={() => goToPage(page - 1)}>
        <CaretUp weight="bold" />
      </Control>
      {/* The field is 28px, like the buttons beside it; the label around it carries the 40px
          target (an input can't hold a pseudo-element of its own). */}
      <label className={slots.pageField()}>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Page"
          aria-describedby={totalId}
          disabled={!ready}
          className={slots.pageInput()}
          style={{ "--digits": String(Math.max(pageCount, 1)).length } as React.CSSProperties}
          value={draft ?? String(ready ? page : 0)}
          onFocus={(event) => {
            setDraft(String(page))
            event.currentTarget.select()
          }}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              commit()
              event.currentTarget.select()
            } else if (event.key === "Escape" && draft != null) {
              // Put the page back rather than let the Escape close a dialog around the preview.
              event.preventDefault()
              event.stopPropagation()
              setDraft(String(page))
              event.currentTarget.select()
            }
          }}
        />
      </label>
      <span id={totalId} className={slots.pageTotal()}>
        <span aria-hidden>/ </span>
        <span className="sr-only">of </span>
        {ready ? pageCount : 0}
      </span>
      <Control tooltip="Next page" shortcut="→" disabled={!ready || page >= pageCount} onClick={() => goToPage(page + 1)}>
        <CaretDown weight="bold" />
      </Control>
    </ToolbarGroup>
  )
}

/**
 * Shows or hides the page rail. Renders only where the rail can exist (a document with pages, from
 * `md` up), so on a phone the bar folds the separator beside it instead of leading with a stray rule.
 */
export function FilePreviewThumbnailsToggle({ children, onClick, ...props }: ControlProps) {
  const { paged, pageCount, thumbnailsOpen, setThumbnailsOpen } = useFilePreviewContext("FilePreviewThumbnailsToggle")
  const fits = useRailFits()
  if (!paged || pageCount < 2 || !fits) return null
  return (
    <Control
      tooltip={thumbnailsOpen ? "Hide pages" : "Show pages"}
      pressed={thumbnailsOpen}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setThumbnailsOpen(!thumbnailsOpen)
      }}
      {...props}
    >
      {children ?? <SidebarSimple weight="bold" />}
    </Control>
  )
}

/** The whole preview full screen (where the browser allows it; nothing renders where it can't). */
export function FilePreviewFullscreen({ children, onClick, ...props }: ControlProps) {
  const { slots, fullscreen, fullscreenEnabled, toggleFullscreen } = useFilePreviewContext("FilePreviewFullscreen")
  if (!fullscreenEnabled) return null
  return (
    <Control
      tooltip={fullscreen ? "Exit full screen" : "Full screen"}
      shortcut="F"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggleFullscreen()
      }}
      {...props}
    >
      {children ?? (
        // Entering and leaving are different things, so both glyphs stay mounted and cross-fade.
        <span className={slots.swap()}>
          <ArrowsOutSimple weight="bold" data-visible={!fullscreen || undefined} className={slots.swapGlyph()} />
          <ArrowsInSimple weight="bold" data-visible={fullscreen || undefined} className={slots.swapGlyph()} />
        </span>
      )}
    </Control>
  )
}

/* ----------------------------------------------------------------- dialog --- */

export interface FilePreviewDialogProps extends FilePreviewProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The dialog's accessible title. @default the file's name */
  title?: string
  /** Classes for the preview inside (the dialog surface takes `className`). */
  previewClassName?: string
}

/**
 * The preview in a modal, over the page: the file opens where the reader is and closes back to
 * it (Esc, the scrim, or a FilePreviewClose in the header). Edge to edge on a phone, inset with
 * the dialog corner from `sm`. Built on Radix Dialog (focus trap, scroll lock, the exit animation)
 * with the Dialog's own scrim. Focus lands on the canvas, so the keys and the scroll work at once.
 *
 * Keeps showing the last file while it animates out, so `open={!!file}` with the file cleared on
 * close still fades the document, not an empty frame.
 */
export function FilePreviewDialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  className,
  previewClassName,
  file,
  src,
  name,
  type,
  size,
  kind,
  ...previewProps
}: FilePreviewDialogProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const incoming = file ?? src ? { file, src, name, type, size, kind } : null
  const [held, setHeld] = React.useState(incoming)
  if (incoming && (incoming.file !== held?.file || incoming.src !== held?.src || incoming.name !== held?.name)) {
    setHeld(incoming)
  }
  const current = incoming ?? held
  const slots = React.useMemo(() => filePreviewVariants(), [])
  const overlay = dialogVariants().overlay()
  const fileName = current?.file && "name" in current.file ? (current.file as File).name : undefined
  const label = title ?? current?.name ?? fileName ?? nameFromUrl(current?.src) ?? "File preview"

  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlay} />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="file-preview-dialog"
          aria-describedby={undefined}
          className={slots.dialog({ className })}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            contentRef.current?.querySelector<HTMLElement>("[data-slot=file-preview-content]")?.focus({ preventScroll: true })
          }}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>{label}</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <FilePreviewDialogContext.Provider value={true}>
            {current && (
              <FilePreview
                variant="plain"
                {...current}
                {...previewProps}
                className={cn("h-auto min-h-0 flex-1", previewClassName)}
              />
            )}
          </FilePreviewDialogContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
