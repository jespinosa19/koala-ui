"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  DeviceMobile,
  DeviceTablet,
  Monitor,
  ArrowsOutLineHorizontal,
  Eye,
  Code,
  Copy,
  Check,
  ArrowSquareOut,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { PremiumCode } from "@/components/docs/premium-code"
import { THEMES, type Theme } from "@/components/theme-provider"
import { DEFAULT_ACCENT } from "@/components/accent-provider"
import { cn } from "@/lib/utils"

/**
 * PreviewFrame: the device-frame preview for sections and pages (the organism/page tiers; see
 * memory `site-ia-tiers`). Where `ComponentPreview` is a flat Preview/Code tab for small
 * controls, a section is a full-width slab whose responsiveness IS the point, so this renders it
 * inside an `<iframe>` pointed at the isolated render target (app/preview/sections/[slug]). The
 * slab's own `sm:`/`md:`/`lg:` utilities then respond to the FRAME width, which the toolbar
 * drives via breakpoint presets and a drag handle. The frame follows the site theme (the global
 * switcher in the docs header) through the iframe `?theme=`; there is no per-frame theme control,
 * so to preview a slab in another theme you change the site theme top-right. Mirrors the
 * `ComponentPreview` prop surface so a docs page swaps one for the other. Follows the polish
 * baseline and the strict react-hooks rules (drag state lives in refs; setState only ever fires
 * from event handlers / observer callbacks, never in render).
 */

interface PreviewFrameProps {
  /**
   * Section slug; the key into the sections registry and the render-target route
   * (`/preview/sections/<slug>`). Provide this OR {@link src} (a one-off isolated route, e.g. a
   * component doc that wants the same drag-to-resize responsive frame without registering a section).
   */
  slug?: string
  /**
   * Override the iframe's base path (without query). When set, the frame points here instead of the
   * sections render-target, so any isolated `/preview/*` route can borrow the breakpoint toolbar and
   * drag handle. The route must render a same-origin `[data-preview-content]` wrapper (for
   * auto-height) and read `?theme=`/`?accent=` like `app/preview/sections/[slug]`.
   */
  src?: string
  /**
   * Anchor id for the frame's root, so a page that stacks several variants can be deep-linked to
   * one of them (e.g. the ⌘K palette routing to `…/banner#banner-countdown`). Adds a scroll margin
   * so the landed frame clears the sticky docs header.
   */
  id?: string
  /** Source shown under the "Code" tab. */
  code: string
  /** Gate the source behind the PRO "Get full code" lock while keeping the live preview. */
  locked?: boolean
  /**
   * Optional variant heading shown at the start of the toolbar (e.g. "On dark", "On brand").
   * Lets a page stack several labeled previews of the same component, Tailwind-Plus-style.
   */
  label?: string
  /**
   * Floor for the stage/iframe height. Defaults to `22rem` (a roomy slab). Thin bars like
   * banners pass a shorter value so the preview reads as "pinned to the top of a page region"
   * instead of floating in a tall empty box.
   */
  minHeight?: string
  className?: string
}

/**
 * Frame width presets. `"fill"` tracks the available column width; `"wide"` (1280) forces a real
 * desktop viewport EVEN WHEN the docs column is narrower, so a slab whose two-column layout only
 * unlocks at `lg` (auth splits, checkout) can be seen without an ultra-wide monitor: the frame
 * renders at 1280 and is scaled down to fit the column (see the `scale` math below).
 */
const PRESETS = [
  { id: "mobile", label: "Mobile", icon: DeviceMobile, width: 375 as number | "fill" },
  { id: "tablet", label: "Tablet", icon: DeviceTablet, width: 768 as number | "fill" },
  { id: "desktop", label: "Desktop", icon: Monitor, width: "fill" as number | "fill" },
  { id: "wide", label: "Wide (1280px)", icon: ArrowsOutLineHorizontal, width: 1280 as number | "fill" },
] as const

const MIN_WIDTH = 320
const KEY_STEP = 16
const KEY_STEP_LARGE = 48

function clamp(value: number, lo: number, hi: number) {
  return Math.min(Math.max(value, lo), hi)
}

export function PreviewFrame({
  slug,
  src: srcOverride,
  id,
  code,
  locked = false,
  label,
  minHeight = "22rem",
  className,
}: PreviewFrameProps) {
  const [view, setView] = React.useState<"preview" | "code">("preview")
  // The frame follows the site theme (next-themes, driven by the global switcher in the docs
  // header); there is no per-frame override. next-themes reads localStorage synchronously, so
  // `resolvedTheme` is already the real theme on the FIRST client render but is unknown during SSR
  // (always "light" there). To avoid a hydration mismatch, we ignore `resolvedTheme` until
  // `mounted`, matching the SSR fallback; the iframe just re-themes once after mount, then again
  // whenever the site theme changes. Same `mounted` gate the docs ThemeSwitcher uses.
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), [])
  const theme: Theme =
    mounted && (THEMES as readonly string[]).includes(resolvedTheme ?? "")
      ? (resolvedTheme as Theme)
      : "light"
  // The chosen frame width: a number (px) or "fill" (track the column). Drag/preset write here.
  const [width, setWidth] = React.useState<number | "fill">("fill")
  // Live measurements (set only from observer callbacks / load events).
  const [stageWidth, setStageWidth] = React.useState(0)
  const [frameHeight, setFrameHeight] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const stageRef = React.useRef<HTMLDivElement>(null)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const contentObserver = React.useRef<ResizeObserver | null>(null)
  const dragActive = React.useRef(false)

  const basePath = srcOverride ?? `/preview/sections/${slug}`
  const src = `${basePath}?theme=${theme}&accent=${DEFAULT_ACCENT}`

  // The frame emulates a viewport `logicalWidth` px wide. Presets/drag can request a width WIDER
  // than the docs column (the 1280 "Wide" preset), so a slab's `lg:` breakpoint fires even when the
  // column is narrower than `lg`. When the request exceeds the column the iframe renders at its true
  // logical width and is scaled DOWN to fit, so the child viewport (and its media queries) still see
  // the full width. `fill` and any width the column can hold stay at scale 1 (untouched).
  const logicalWidth = width === "fill" ? stageWidth : width
  const scale = stageWidth > 0 && logicalWidth > stageWidth ? stageWidth / logicalWidth : 1
  const scaled = scale !== 1
  // The visual footprint the column flow reserves once scaled.
  const footprintWidth = logicalWidth * scale
  const footprintHeight = frameHeight * scale
  // The physical width the resize handle / aria range operate over (drag stays within the column).
  const renderedWidth =
    width === "fill" ? stageWidth : Math.min(logicalWidth, stageWidth || logicalWidth)
  const activePreset =
    width === "fill"
      ? "desktop"
      : width === 375
        ? "mobile"
        : width === 768
          ? "tablet"
          : width === 1280
            ? "wide"
            : "custom"

  // Measure the available column so "fill" knows its width and the drag/keys can clamp to it.
  // Ignore 0-width reports: the stage is `display:none` while the Code tab is open (we hide it
  // rather than unmount it, see below), and a 0 would clobber the last good width and flip the
  // "Fill" label / clamp until the next real measurement.
  React.useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 0) setStageWidth(w)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Disconnect the content observer when the frame unmounts.
  React.useEffect(() => () => contentObserver.current?.disconnect(), [])

  // Read the slab's true height from the render target (same-origin) and keep it in sync as the
  // slab reflows when the frame width changes. We measure `[data-preview-content]`, not the
  // document, because the root layout pins html to the iframe height (`h-full`), which would
  // feed back into the measurement.
  const measureHeight = React.useCallback(() => {
    const iframe = iframeRef.current
    const content = iframe?.contentDocument?.querySelector<HTMLElement>("[data-preview-content]")
    if (!iframe || !content) return
    // Round UP off the sub-pixel rect height so the iframe is never a fraction short. Take the larger
    // of the box height and scrollHeight so a child that overflows the wrapper still counts: the
    // frame must be tall enough that the slab never scrolls inside the iframe. It's the content
    // wrapper (auto height), not the document, so this never feeds back off the iframe's `h-full`.
    const contentH = Math.max(content.getBoundingClientRect().height, content.scrollHeight)
    // The iframe is border-box with a 1px border, so its CSS `height` includes that border and the
    // inner viewport (clientHeight) lands 2px short, stranding a 2px scrollbar. Add the element's
    // own chrome (border + any horizontal scrollbar) so the viewport fits the slab EXACTLY. `chrome`
    // is a constant (the border), independent of the height we set, so there is no feedback loop.
    const chrome = iframe.offsetHeight - iframe.clientHeight
    const h = Math.ceil(contentH + chrome)
    if (h > 0) setFrameHeight(h)
  }, [])

  const handleLoad = React.useCallback(() => {
    const iframe = iframeRef.current
    const win = iframe?.contentWindow as (Window & typeof globalThis) | null
    const doc = iframe?.contentDocument
    if (!win || !doc) return
    measureHeight()
    // The slab's final height can land AFTER `load`: client islands hydrate, the BrandMark / media
    // `next/Image` settles, a web font swaps. A single measure would strand the frame at its
    // minHeight and the tall slab would scroll inside the iframe. Re-measure on the next paint and
    // after a short beat to catch those, without polling.
    win.requestAnimationFrame(measureHeight)
    win.setTimeout(measureHeight, 200)
    contentObserver.current?.disconnect()
    // Observe with the IFRAME's own ResizeObserver (its realm), not the parent's: a parent-realm RO
    // misses reflows that happen purely inside the child document (hydration, the logo wall mounting,
    // a font swap), which left the iframe measured too short and scrolling. Observe the content
    // wrapper, or the document element until it mounts, so the frame always grows to the slab's full
    // height instead of scrolling it.
    const target = doc.querySelector<HTMLElement>("[data-preview-content]") ?? doc.documentElement
    const ro = new win.ResizeObserver(() => measureHeight())
    ro.observe(target)
    contentObserver.current = ro
    // A web-font swap after load nudges text height; re-measure once fonts settle.
    doc.fonts.ready.then(measureHeight, () => {})
  }, [measureHeight])

  // Auto-height must also survive a MISSED `load` event. With `loading="lazy"` on a page full of
  // stacked frames, a lazy iframe can finish loading BEFORE React hydrates this component and wires
  // up `onLoad`, so the `load` fires into a handler that isn't attached yet, is lost, and
  // `handleLoad` never runs: the frame is stranded at `minHeight` and reads as a cropped slab, as if
  // it had a `max-height`. Poll a few frames until the child's content wrapper exists, then run the
  // same setup `onLoad` would have. Idempotent with `onLoad` (it re-measures and swaps the observer),
  // and keyed on `src` so a theme/accent change re-arms it. setState only ever fires from the rAF
  // callback, never the effect body, per the strict react-hooks rules.
  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let raf = 0
    let frames = 0
    const tick = () => {
      const content = iframe.contentDocument?.querySelector("[data-preview-content]")
      if (content) {
        handleLoad()
        return
      }
      // ~4s of frames covers the pre-hydration race window; a load that lands later is caught by
      // `onLoad`, whose handler is attached by then, so we can stop polling.
      if (frames++ < 240) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [src, handleLoad])

  // Drag handle: left-anchored (Tailwind-style), so the frame's left edge stays pinned and only
  // the right edge follows the pointer as you size it. Pointer capture keeps the gesture alive
  // over the iframe (which would otherwise swallow the events).
  function beginResize(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragActive.current = true
    setDragging(true)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"
    e.preventDefault()
  }

  function moveResize(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragActive.current) return
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    // Left-anchored: the frame pins to the stage's left edge, so the width is simply the
    // pointer's distance from that edge. (Previously this resized symmetrically about the
    // center, which moved both edges at once and felt like a "double handle".)
    setWidth(clamp(Math.round(e.clientX - rect.left), MIN_WIDTH, Math.round(rect.width)))
  }

  function endResize(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragActive.current) return
    dragActive.current = false
    setDragging(false)
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Pointer was never captured (cancel before move): nothing to release.
    }
  }

  function onHandleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return
    e.preventDefault()
    const max = Math.round(stageRef.current?.getBoundingClientRect().width ?? renderedWidth)
    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP
    const current = width === "fill" ? max : Math.min(width, max)
    let next = current
    if (e.key === "ArrowLeft") next = current - step
    else if (e.key === "ArrowRight") next = current + step
    else if (e.key === "Home") next = MIN_WIDTH
    else if (e.key === "End") next = max
    setWidth(clamp(next, MIN_WIDTH, max))
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const widthLabel =
    activePreset === "desktop" && !stageWidth
      ? "Fill"
      : `${Math.round(logicalWidth)}px${scaled ? ` · ${Math.round(scale * 100)}%` : ""}`

  return (
    <div id={id} className={cn("my-6 flex flex-col gap-3", id && "scroll-mt-24", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {label && (
            <span className="mr-1 text-sm font-medium text-foreground">{label}</span>
          )}
          <ButtonGroup size="sm" variant="outline" attached>
            {PRESETS.map((preset) => {
              const active = activePreset === preset.id
              const Icon = preset.icon
              return (
                <ButtonGroupItem
                  key={preset.id}
                  iconOnly
                  aria-label={preset.label}
                  aria-pressed={active}
                  variant={active ? "secondary" : "outline"}
                  onClick={() => setWidth(preset.width)}
                >
                  <Icon weight="bold" />
                </ButtonGroupItem>
              )
            })}
          </ButtonGroup>
          <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
            {widthLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview/Code is a controlled segmented control: the canonical Tabs (default
              pill variant) drives `view`, but the panels live OUTSIDE the Tabs root (the
              always-mounted iframe stage + the code block), so there's no TabsContent. */}
          <Tabs value={view} onValueChange={(value) => setView(value as "preview" | "code")}>
            <TabsList>
              <TabsTrigger value="preview">
                <Eye weight="bold" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code weight="bold" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            iconOnly
            variant="ghost"
            size="sm"
            aria-label={copied ? "Copied" : "Copy code"}
            onClick={handleCopy}
          >
            {copied ? <Check weight="bold" /> : <Copy weight="bold" />}
          </Button>

          <Button asChild iconOnly variant="ghost" size="sm" aria-label="Open preview in a new tab">
            <a href={src} target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut weight="bold" />
            </a>
          </Button>
        </div>
      </div>

      {/* Single container (Untitled / Tailwind-style): the iframe IS the bordered preview box;
          there's no outer "canvas" card around it. Left-anchored, so shrinking the frame reveals
          the plain page background on the right as the resize track. `stageRef` measures the full
          column so "fill" and the drag clamp know the available width.

          The stage is ALWAYS mounted; the Code tab just hides it with `display:none` instead of
          unmounting it. Unmounting tore the `<iframe>` down, so flipping back to Preview reloaded
          the whole render-target route (`loading="lazy"` + fresh `src`) — a visible blank-then-
          repaint flash, plus a height re-measure jump. Hiding keeps the document loaded and its
          measured height intact, so the toggle is instant with no glitch. */}
      <div
        ref={stageRef}
        className={cn("relative flex justify-start", view === "code" && "hidden")}
        // `minHeight` is a PRE-MEASUREMENT placeholder only: it keeps a not-yet-loaded frame a roomy
        // slab so it doesn't flash tiny, but the moment we have a real `frameHeight` the frame hugs
        // its content EXACTLY. Keeping the floor after measurement made short slabs float in a too-tall
        // box (dead space) and, when scaled, let the footprint (computed from the un-floored height)
        // clip a few px off the iframe (which the floor had made taller). Drop it once measured or
        // scaling (the scaled footprint already hugs the shrunk height).
        style={{ minHeight: scaled || frameHeight ? undefined : minHeight }}
      >
        <div
          className={cn(
            "relative",
            // 1:1 finger-follow while dragging; glide only for preset jumps.
            !dragging && "transition-[width] duration-base ease-out",
          )}
          style={{ width: width === "fill" ? "100%" : `${footprintWidth}px` }}
        >
          {/* Footprint box: reserves the SCALED size in the column flow and clips the larger,
              untransformed iframe layout box whenever we emulate a viewport wider than the column.
              At scale 1 (fill, or any width the column holds) it's a transparent passthrough that
              lets the iframe drive its own height and keep its drop shadow. */}
          <div
            className={cn("relative", scaled && "overflow-hidden")}
            // Scaled: reserve the footprint (the scaled height once measured, else the placeholder).
            // Unscaled: let the iframe drive its own height once measured; only floor it beforehand.
            style={
              scaled
                ? { height: frameHeight ? `${footprintHeight}px` : minHeight }
                : frameHeight
                  ? undefined
                  : { minHeight }
            }
          >
            <iframe
              ref={iframeRef}
              src={src}
              title="Section preview"
              loading="lazy"
              onLoad={handleLoad}
              style={{
                width: width === "fill" ? "100%" : `${logicalWidth}px`,
                height: frameHeight ? `${frameHeight}px` : undefined,
                // Floor only until measured: once we know the real height the iframe is exactly that
                // tall, so a short slab neither pads out to dead space nor (when scaled) gets clipped
                // by the footprint box that hugs the un-floored height.
                minHeight: frameHeight ? undefined : minHeight,
                transform: scaled ? `scale(${scale})` : undefined,
                transformOrigin: "top left",
              }}
              className={cn(
                "block rounded-xl border border-border bg-background shadow-xs",
                dragging && "pointer-events-none select-none",
              )}
            />
          </div>

          {/* Left-anchored resize handle on the frame's right edge: drag it to size the width
              while the frame's left edge stays pinned (Tailwind / Untitled-style). */}
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label="Resize preview width"
            aria-valuenow={Math.round(renderedWidth)}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={Math.round(stageWidth || renderedWidth)}
            onPointerDown={beginResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            onKeyDown={onHandleKey}
            className="group/handle absolute inset-y-0 -right-6 z-10 flex w-8 cursor-col-resize touch-none items-center justify-center outline-none"
          >
            <span
              aria-hidden
              className={cn(
                "h-10 w-1.5 rounded-full bg-border transition-colors duration-fast ease-out",
                "group-hover/handle:bg-brand group-focus-visible/handle:bg-brand group-focus-visible/handle:ring-2 group-focus-visible/handle:ring-brand",
                dragging && "bg-brand",
              )}
            />
          </div>
        </div>
      </div>

      {view === "code" &&
        (locked ? <PremiumCode /> : <CodeSnippet code={code} lang="tsx" />)}
    </div>
  )
}
