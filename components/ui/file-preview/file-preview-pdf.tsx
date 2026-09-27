"use client"

import * as React from "react"
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
  TextLayer,
} from "pdfjs-dist"
import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api"

import { prefersReducedMotion } from "@/lib/motion"
import { Spinner } from "@/components/ui/spinner"
import {
  PDF_TO_CSS_UNITS,
  normalizeRotation,
  useFilePreviewContext,
  type FilePreviewPageSize,
  type FilePreviewReport,
  type FilePreviewSlots,
} from "./shared"

/**
 * The PDF half of FilePreview, on Mozilla's PDF.js: the document loads once at the root (so the
 * pages and the thumbnail rail share it), every page gets a placeholder at its true size up front,
 * and only the pages near the view are painted, each onto a fresh canvas that is swapped in whole.
 * A zoom stretches the bitmaps already on screen at once and repaints them sharp a beat later, so
 * a pinch never waits on the renderer.
 *
 * PDF.js is imported on demand, so nobody pays for it until a PDF is opened.
 */

type PdfjsModule = typeof import("pdfjs-dist")

let pdfjsModule: Promise<PdfjsModule> | null = null

/**
 * The PDF.js module, loaded once. Its worker is started from the package's own module worker; a
 * consumer who already configured `GlobalWorkerOptions` (a CDN worker, a shared port) keeps theirs.
 */
export function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsModule) {
    pdfjsModule = import("pdfjs-dist").then((pdfjs) => {
      const options = pdfjs.GlobalWorkerOptions
      if (!options.workerPort && !options.workerSrc) {
        options.workerPort = new Worker(new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), {
          type: "module",
        })
      }
      return pdfjs
    })
    // A failed import (offline, a blocked chunk) must not poison every later attempt.
    pdfjsModule.catch(() => {
      pdfjsModule = null
    })
  }
  return pdfjsModule
}

/** Options passed through to PDF.js's `getDocument` (fonts, CMaps, a password, credentials). */
export type FilePreviewPdfOptions = Omit<DocumentInitParameters, "url" | "data" | "range">

// The most pixels one page's canvas may hold. Past it the page paints at a lower density and the
// browser stretches it: slightly soft at extreme zoom, instead of a tab killed for canvas memory
// (mobile Safari caps it tightly, hence the smaller budget on touch devices).
function maxCanvasPixels() {
  return window.matchMedia("(pointer: coarse)").matches ? 5_242_880 : 16_777_216
}

function outputScaleFor(width: number, height: number) {
  const ratio = Math.min(window.devicePixelRatio || 1, 3)
  const area = width * height
  if (!area) return ratio
  return Math.min(ratio, Math.sqrt(maxCanvasPixels() / area))
}

function sizeOf(page: PDFPageProxy): FilePreviewPageSize {
  // Default rotation is the page's own /Rotate: this is the page as its author set it.
  const viewport = page.getViewport({ scale: PDF_TO_CSS_UNITS })
  return { width: viewport.width, height: viewport.height }
}

function describePdfError(error: unknown): string {
  const name = (error as { name?: string } | null)?.name
  if (name === "PasswordException") return "This PDF is password protected."
  if (name === "InvalidPDFException") return "This file isn't a valid PDF."
  if (name === "ResponseException" || name === "MissingPDFException" || name === "UnexpectedResponseException") {
    return "The file couldn't be loaded."
  }
  return "This PDF couldn't be displayed."
}

/**
 * Open the document at `url`. Reports the page sizes to the root as soon as the first page is
 * known (every page assumes that size), then corrects the odd page out in the background, so a
 * 400-page file shows its first page without waiting for the other 399.
 */
export function usePdfDocument({
  url,
  enabled,
  options,
  report,
}: {
  url: string | undefined
  enabled: boolean
  options?: FilePreviewPdfOptions
  report: (patch: FilePreviewReport) => void
}) {
  const [pdf, setPdf] = React.useState<PDFDocumentProxy | null>(null)
  // Read through refs: an inline options object or callback must not reload the document on
  // every render of the parent.
  const optionsRef = React.useRef(options)
  const reportRef = React.useRef(report)
  React.useEffect(() => {
    optionsRef.current = options
    reportRef.current = report
  })

  React.useEffect(() => {
    if (!enabled || !url) return
    let cancelled = false
    let task: PDFDocumentLoadingTask | null = null
    void open(url)
    return () => {
      cancelled = true
      // Destroying the loading task destroys the document with it and frees the worker's copy.
      void task?.destroy()
      forget()
    }

    async function open(source: string) {
      try {
        const pdfjs = await loadPdfjs()
        if (cancelled) return
        task = pdfjs.getDocument({ ...optionsRef.current, url: source })
        const doc = await task.promise
        if (cancelled) return
        const first = await doc.getPage(1)
        if (cancelled) return
        const base = sizeOf(first)
        const pages = Array.from({ length: doc.numPages }, () => base)
        setPdf(doc)
        reportRef.current({ status: "ready", error: null, pages, details: { pageCount: doc.numPages } })
        // Most documents are one size throughout and this changes nothing; a mixed one (a
        // landscape table among portrait pages) gets every box right before it is scrolled to.
        let mixed = false
        for (let n = 2; n <= doc.numPages; n++) {
          const size = sizeOf(await doc.getPage(n))
          if (cancelled) return
          if (size.width !== base.width || size.height !== base.height) {
            pages[n - 1] = size
            mixed = true
          }
        }
        if (mixed) reportRef.current({ pages: [...pages] })
      } catch (error) {
        if (!cancelled) reportRef.current({ status: "error", error: describePdfError(error) })
      }
    }

    function forget() {
      setPdf(null)
    }
  }, [url, enabled])

  return pdf
}

/* ------------------------------------------------------------------ pages --- */

interface Range {
  /** Pages to paint: the ones in view plus a screen either side. */
  from: number
  to: number
  /** Pages whose bitmaps are kept: three screens either side. Everything else is released. */
  keepFrom: number
  keepTo: number
}

/**
 * The document itself: every page as a placeholder of its true size, stacked in the stage. Tracks
 * which page holds most of the view (the toolbar's page number) and which are close enough to
 * paint, from the pages' own offsets, so it costs one pass per scrolled frame.
 */
export function PdfDocumentView({ textLayer }: { textLayer: boolean }) {
  const { slots, pdf, pages, scale, rotation, scrollerRef, setVisiblePage } =
    useFilePreviewContext("FilePreviewContent")
  const [range, setRange] = React.useState<Range>({ from: 0, to: 1, keepFrom: 0, keepTo: 1 })
  const measureRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !pdf) return
    let frame = 0

    const measure = () => {
      frame = 0
      const nodes = scroller.querySelectorAll<HTMLElement>("[data-slot=file-preview-page]")
      if (!nodes.length) return
      const top = scroller.scrollTop
      const view = scroller.clientHeight
      const bottom = top + view
      let current = 0
      let currentArea = -1
      const next: Range = { from: -1, to: -1, keepFrom: -1, keepTo: -1 }
      nodes.forEach((node, index) => {
        const start = node.offsetTop
        const end = start + node.offsetHeight
        const visible = Math.min(bottom, end) - Math.max(top, start)
        // Ties go to the earlier page: the one you are reading into, not the one peeking below.
        if (visible > currentArea + 1) {
          current = index
          currentArea = visible
        }
        if (end > top - view && start < bottom + view) {
          if (next.from < 0) next.from = index
          next.to = index
        }
        if (end > top - 3 * view && start < bottom + 3 * view) {
          if (next.keepFrom < 0) next.keepFrom = index
          next.keepTo = index
        }
      })
      setVisiblePage(current + 1)
      setRange((prev) =>
        prev.from === next.from && prev.to === next.to && prev.keepFrom === next.keepFrom && prev.keepTo === next.keepTo
          ? prev
          : next,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measureRef.current = schedule

    schedule()
    scroller.addEventListener("scroll", schedule, { passive: true })
    const observer = new ResizeObserver(schedule)
    observer.observe(scroller)
    return () => {
      cancelAnimationFrame(frame)
      measureRef.current = null
      scroller.removeEventListener("scroll", schedule)
      observer.disconnect()
    }
  }, [pdf, scrollerRef, setVisiblePage])

  // A zoom or a turn moves every page without necessarily scrolling: measure again.
  React.useEffect(() => {
    measureRef.current?.()
  }, [scale, rotation, pages])

  if (!pdf) return null
  const turn = normalizeRotation(rotation)

  return pages.map((size, index) => (
    <PdfPage
      key={index}
      index={index}
      size={size}
      pdf={pdf}
      scale={scale}
      rotation={turn}
      slots={slots}
      near={index >= range.from && index <= range.to}
      keep={index >= range.keepFrom && index <= range.keepTo}
      textLayer={textLayer}
    />
  ))
}

interface PdfPageProps {
  index: number
  size: FilePreviewPageSize
  pdf: PDFDocumentProxy
  scale: number
  rotation: number
  slots: FilePreviewSlots
  near: boolean
  keep: boolean
  textLayer: boolean
}

/**
 * One page. Props only (no context), so scrolling, which changes the root's current page, never
 * re-renders a page that has nothing new to show.
 */
const PdfPage = React.memo(function PdfPage({
  index,
  size,
  pdf,
  scale,
  rotation,
  slots,
  near,
  keep,
  textLayer,
}: PdfPageProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const textRef = React.useRef<HTMLDivElement>(null)
  const layerRef = React.useRef<TextLayer | null>(null)
  const [painted, setPainted] = React.useState(false)
  const [userUnit, setUserUnit] = React.useState(1)

  const turned = rotation % 180 !== 0
  const width = (turned ? size.height : size.width) * scale
  const height = (turned ? size.width : size.height) * scale

  React.useEffect(() => {
    if (!near) return
    let cancelled = false
    let task: RenderTask | null = null
    const host = hostRef.current
    // First paint at once; a repaint after a zoom or a turn waits for the gesture to settle, while
    // the bitmap already there stretches to the new size.
    const timer = window.setTimeout(() => void paint(), host?.firstChild ? 140 : 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      task?.cancel()
    }

    async function paint() {
      if (!host) return
      try {
        const [pdfjs, page] = await Promise.all([loadPdfjs(), pdf.getPage(index + 1)])
        if (cancelled) return
        const viewport = page.getViewport({
          scale: scale * PDF_TO_CSS_UNITS,
          rotation: normalizeRotation(page.rotate + rotation),
        })
        const output = outputScaleFor(viewport.width, viewport.height)
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.floor(viewport.width * output))
        canvas.height = Math.max(1, Math.floor(viewport.height * output))
        task = page.render({
          canvas,
          viewport,
          transform: output === 1 ? undefined : [output, 0, 0, output, 0, 0],
        })
        await task.promise
        if (cancelled) return
        host.replaceChildren(canvas)
        settle(page.userUnit)

        const container = textRef.current
        if (!textLayer || !container) return
        if (layerRef.current) {
          layerRef.current.update({ viewport })
          return
        }
        const layer = new pdfjs.TextLayer({
          textContentSource: page.streamTextContent({ includeMarkedContent: true, disableNormalization: true }),
          container,
          viewport,
        })
        layerRef.current = layer
        await layer.render()
      } catch {
        // A render cancelled by a newer one rejects on purpose; a page that fails to paint keeps
        // its placeholder rather than taking the document down with it.
      }
    }

    function settle(unit: number) {
      setPainted(true)
      setUserUnit(unit || 1)
    }
  }, [near, pdf, index, scale, rotation, textLayer])

  // Far off screen, hand the bitmap back (a long document would otherwise hold every page it ever
  // showed). The text layer stays: it is light, and it keeps find-in-page working on pages read.
  React.useEffect(() => {
    if (keep || !painted) return
    hostRef.current?.replaceChildren()
    release()
    function release() {
      setPainted(false)
    }
  }, [keep, painted])

  React.useEffect(() => () => layerRef.current?.cancel(), [])

  return (
    <div
      data-slot="file-preview-page"
      data-page-number={index + 1}
      data-painted={painted || undefined}
      role="group"
      aria-label={`Page ${index + 1}`}
      className={slots.page()}
      style={
        {
          width,
          height,
          "--scale-factor": scale * PDF_TO_CSS_UNITS,
          "--user-unit": userUnit,
        } as React.CSSProperties
      }
    >
      <div ref={hostRef} aria-hidden className={slots.pageCanvas()} />
      {textLayer && <div ref={textRef} className={slots.textLayer()} />}
      {!painted && <Spinner aria-hidden size="lg" className={slots.pageSpinner()} />}
    </div>
  )
})

/* ------------------------------------------------------------- thumbnails --- */

// Thumbnails paint one at a time, after the pages in view, so the rail never competes with the
// page being read.
let thumbnailQueue: Promise<void> = Promise.resolve()

/**
 * The page rail's contents: a thumbnail per page, painted lazily as the rail scrolls, each kept as
 * a small image rather than a canvas. The current page wears the brand ring and scrolls itself
 * into view as the reader moves through the document.
 */
export function PdfThumbnails() {
  const { slots, pdf, pages, page, rotation, goToPage } = useFilePreviewContext("FilePreviewThumbnails")
  const listRef = React.useRef<HTMLDivElement>(null)

  // Scroll the rail itself, never its ancestors: scrollIntoView would also move the page the
  // preview sits in whenever the rail is partly off screen, yanking the reader away mid-document.
  React.useEffect(() => {
    const rail = listRef.current?.closest<HTMLElement>("[data-slot=file-preview-thumbnails]")
    const active = rail?.querySelector<HTMLElement>(`[data-page-number="${page}"]`)
    if (!rail || !active) return
    const inset = parseFloat(getComputedStyle(rail).paddingTop) || 0
    const view = rail.getBoundingClientRect()
    const box = active.getBoundingClientRect()
    let delta = 0
    if (box.top < view.top + inset) delta = box.top - view.top - inset
    else if (box.bottom > view.bottom - inset) delta = box.bottom - view.bottom + inset
    if (delta) rail.scrollTo({ top: rail.scrollTop + delta, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }, [page])

  if (!pdf) return null
  const turn = normalizeRotation(rotation)

  return (
    <div ref={listRef} className="contents">
      {pages.map((size, index) => (
        <PdfThumbnail
          key={index}
          index={index}
          size={size}
          pdf={pdf}
          rotation={turn}
          active={page === index + 1}
          slots={slots}
          onSelect={goToPage}
        />
      ))}
    </div>
  )
}

const THUMB_WIDTH = 128

const PdfThumbnail = React.memo(function PdfThumbnail({
  index,
  size,
  pdf,
  rotation,
  active,
  slots,
  onSelect,
}: {
  index: number
  size: FilePreviewPageSize
  pdf: PDFDocumentProxy
  rotation: number
  active: boolean
  slots: FilePreviewSlots
  onSelect: (page: number, behavior?: ScrollBehavior) => void
}) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  // The object URL on screen, so a newer paint and the unmount can both hand it back.
  const srcRef = React.useRef<string | null>(null)
  const [visible, setVisible] = React.useState(false)
  const [image, setImage] = React.useState<{ src: string; rotation: number } | null>(null)
  const turned = rotation % 180 !== 0
  const ratio = turned ? size.height / size.width : size.width / size.height

  // Paint once the thumbnail is near the rail's view.
  React.useEffect(() => {
    const node = buttonRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal()
      },
      { root: node.closest("[data-slot=file-preview-thumbnails]"), rootMargin: "200px 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
    function reveal() {
      setVisible(true)
    }
  }, [])

  React.useEffect(() => {
    if (!visible || image?.rotation === rotation) return
    let cancelled = false
    thumbnailQueue = thumbnailQueue.then(paint, paint)
    return () => {
      cancelled = true
    }

    async function paint() {
      if (cancelled) return
      try {
        const page = await pdf.getPage(index + 1)
        if (cancelled) return
        const base = page.getViewport({ scale: 1, rotation: normalizeRotation(page.rotate + rotation) })
        const ratioOut = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = page.getViewport({
          scale: (THUMB_WIDTH / base.width) * ratioOut,
          rotation: normalizeRotation(page.rotate + rotation),
        })
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.floor(viewport.width))
        canvas.height = Math.max(1, Math.floor(viewport.height))
        await page.render({ canvas, viewport }).promise
        if (cancelled) return
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
        if (cancelled || !blob) return
        show(URL.createObjectURL(blob))
      } catch {
        // Leave the blank paper: the rail still navigates without a picture.
      }
    }

    function show(src: string) {
      const previous = srcRef.current
      srcRef.current = src
      if (previous) URL.revokeObjectURL(previous)
      setImage({ src, rotation })
    }
  }, [visible, rotation, image?.rotation, pdf, index])

  // Hand the last picture back when the thumbnail goes (a new file, a closed dialog).
  React.useEffect(
    () => () => {
      if (srcRef.current) URL.revokeObjectURL(srcRef.current)
      srcRef.current = null
    },
    [],
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      data-page-number={index + 1}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      aria-label={`Page ${index + 1}`}
      className={slots.thumb()}
      onClick={() => onSelect(index + 1)}
    >
      <span className={slots.thumbPage()} style={{ aspectRatio: ratio }}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt="" draggable={false} />
        )}
      </span>
      <span className={slots.thumbLabel()}>{index + 1}</span>
    </button>
  )
})
