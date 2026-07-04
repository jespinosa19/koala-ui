"use client"

import * as React from "react"
import { Dialog as DialogPrimitive, Slot } from "radix-ui"
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"

/**
 * Lightbox: a full-screen, browsable image viewer over Radix Dialog (focus trap, scroll lock,
 * Esc, a11y, enter/exit animations via Presence). Pattern: one `tv` recipe with `slots`, shared
 * through a typed React Context. See docs/ARCHITECTURE.md §2.
 *
 * Give it the image list once (`images`); `LightboxTrigger` opens the viewer at an index. The
 * viewer owns navigation (arrow buttons, ←/→ keys, a thumbnail rail, a counter) and loops. It
 * opens with a clean fade + soft zoom (no morph), and the chrome is a fixed dark wash (not theme
 * tokens) because it always sits over a photo, like the Dialog overlay.
 *
 * Pairs with `Gallery`: wrap a `GalleryItem action="…"` in a `LightboxTrigger asChild` so each
 * tile reveals its pill on hover and opens the viewer on click.
 */
export interface LightboxImage {
  src: string
  alt?: string
}

export const lightboxVariants = tv({
  slots: {
    // Dark scrim, fading via Radix Presence (data-state).
    overlay: [
      "fixed inset-0 z-50 bg-black/90",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    // Full-screen click-to-close layer. The image + thumbnail rail are centered together as a
    // group (gap between them) so the rail sits just under the image, not pinned to the floor.
    // Tighter gap on mobile so the small landscape image + rail keep their vertical breathing room.
    content: [
      "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-4 py-4 sm:gap-6 cursor-zoom-out outline-none",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "duration-base ease-out",
    ],
    // The active image: sized to its own pixels (no letterbox bars), with a faint outline so a
    // light photo doesn't bleed into the black. Soft zoom-in on enter / per-image crossfade. The
    // height cap is set by the `hasRail` variant (see below); `dvh` (not `vh`) so mobile browser
    // chrome showing/hiding never pushes the image under the fold.
    image: [
      "h-auto w-auto max-w-[90vw] min-h-0 rounded-lg object-contain shadow-2xl ring-1 ring-inset ring-white/10",
      "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-base motion-safe:ease-out",
    ],
    // Swipe frame around the image. Follows the finger 1:1 while dragging (inline transform set
    // straight on the node, so a drag never re-renders the rail), then this `transition-transform`
    // springs it back to center on release, or the image swaps and glides in from the swipe side on
    // commit. Kept separate from the image so the drag translate never fights the enter zoom.
    imageFrame: "relative flex min-h-0 transition-transform duration-base ease-out motion-reduce:transition-none",
    // Shared round, dark control (close + arrows): ≥40px, tactile press.
    control: [
      "inline-flex size-10 cursor-pointer items-center justify-center rounded-full",
      "bg-white/10 text-white backdrop-blur-sm transition-[background-color,transform] duration-fast ease-out",
      "hover:bg-white/20 active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
      "disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-5 [&_svg]:shrink-0",
    ],
    close: "absolute right-4 top-4 z-10",
    counter:
      "absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white tabular-nums backdrop-blur-sm",
    arrow: "absolute top-1/2 z-10 -translate-y-1/2",
    // Scroll viewport that BOUNDS the rail to the screen. Without it the `w-max` rail (wider than a
    // phone once there are more than a few images) overflows both edges with no way to reach the
    // off-screen tiles and no guarantee the active one is visible. Capped at the image width, it
    // scrolls horizontally instead, and the effect keeps the active thumb centered. Scrollbar hidden
    // (the gliding ring already signals position); smooth scroll respects reduced motion.
    thumbsViewport: [
      "w-full max-w-[90vw] shrink-0 overflow-x-auto overscroll-x-contain",
      "scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    ],
    // Thumbnail rail. `relative w-max gap-2` so the gliding ring's left-0 origin lines up with the
    // first tile (equal-width tiles separated by gap-2), mirroring the Carousel. `mx-auto` centers
    // the rail inside the viewport when it fits and collapses to a scrollable start when it overflows.
    thumbs: "relative mx-auto flex w-max shrink-0 items-center gap-2",
    thumb: [
      "relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-md",
      "opacity-50 transition-[opacity] duration-fast ease-out hover:opacity-100",
      "outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand",
      "data-[active=true]:opacity-100",
    ],
    // The single white ring that GLIDES between thumbnails (equal-width w-20 tiles + gap-2),
    // instead of a per-tile toggle — a fluid selection frame.
    thumbRing:
      "pointer-events-none absolute left-0 top-0 z-10 h-14 w-20 rounded-md ring-2 ring-white transition-transform duration-base ease-out motion-reduce:transition-none",
    thumbImage: "size-full object-cover",
    // ── Trigger tile (non-asChild): the image + its hover/focus pill ──────────────────────
    // The tile NEVER moves or scales — the only affordance is the pill fading in. Frame
    // (radius/border/aspect) is left to the consumer's className.
    trigger: [
      "group relative block cursor-pointer overflow-hidden",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
    scrim:
      "pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-base ease-out group-hover:bg-black/30 group-focus-visible:bg-black/30",
    badgeLayer: "pointer-events-none absolute inset-0 grid place-items-center",
    badge: [
      "inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm",
      // Settle-in with a gentle spring overshoot (a pelín de bounce), in place — no layout shift.
      "scale-90 opacity-0 transition-[opacity,transform] duration-base ease-spring",
      "group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
  },
  variants: {
    // Whether the thumbnail rail is showing (more than one image). When it is, the image must leave
    // room for the rail + gaps + padding (~8rem) so short/landscape viewports don't clip the image
    // top or push the rail off the bottom; the `min()` still caps it at 78dvh on tall screens so it
    // never dominates. A lone image (no rail) keeps a taller cap.
    hasRail: {
      true: { image: "max-h-[min(78dvh,calc(100dvh_-_8rem))]" },
      false: { image: "max-h-[85dvh]" },
    },
  },
  defaultVariants: { hasRail: false },
})

type LightboxSlots = ReturnType<typeof lightboxVariants>

const [LightboxProvider, useLightboxContext] = createContext<{
  images: LightboxImage[]
  index: number
  openAt: (index: number) => void
  close: () => void
  go: (delta: number) => void
  goTo: (index: number) => void
  slots: LightboxSlots
}>("Lightbox")

export interface LightboxProps {
  images: LightboxImage[]
  children?: React.ReactNode
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Index to open at first (uncontrolled). @default 0 */
  defaultIndex?: number
}

export function Lightbox({ images, children, open: openProp, onOpenChange, defaultIndex = 0 }: LightboxProps) {
  const [openState, setOpenState] = React.useState(false)
  const [index, setIndex] = React.useState(defaultIndex)
  const slots = lightboxVariants({ hasRail: images.length > 1 })

  const open = openProp ?? openState
  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next)
      if (openProp === undefined) setOpenState(next)
    },
    [onOpenChange, openProp],
  )

  const openAt = React.useCallback(
    (i: number) => {
      setIndex(i)
      setOpen(true)
    },
    [setOpen],
  )
  const close = React.useCallback(() => setOpen(false), [setOpen])
  // Loop both ways so the arrows never dead-end.
  const go = React.useCallback(
    (delta: number) => setIndex((i) => (images.length ? (i + delta + images.length) % images.length : 0)),
    [images.length],
  )
  const goTo = React.useCallback((i: number) => setIndex(i), [])

  return (
    <LightboxProvider
      images={images}
      index={index}
      openAt={openAt}
      close={close}
      go={go}
      goTo={goTo}
      slots={slots}
    >
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
        <LightboxViewport />
      </DialogPrimitive.Root>
    </LightboxProvider>
  )
}

export interface LightboxTriggerProps extends React.ComponentProps<"button"> {
  /** Index into the Lightbox `images` list to open at. */
  index: number
  /**
   * Render onto the single child element (e.g. a `GalleryItem`) instead of a bare button. When
   * `asChild`, this trigger draws no pill — the wrapping element owns the hover affordance
   * (e.g. `GalleryItem action`), so set the label there instead.
   */
  asChild?: boolean
  /**
   * The hover/focus pill shown over the image (the only affordance — the tile never moves or
   * scales). Pass `null` to hide it. Ignored when `asChild`. @default "See image"
   */
  label?: React.ReactNode
}

/** Opens the viewer at `index`. Use `asChild` to make any tile (e.g. a GalleryItem) the trigger. */
export function LightboxTrigger({
  index,
  asChild = false,
  label = "See image",
  className,
  onClick,
  children,
  ...props
}: LightboxTriggerProps) {
  const { openAt, slots } = useLightboxContext("LightboxTrigger")
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) openAt(index)
  }

  // asChild: merge open-on-click onto the consumer's element (it brings its own pill/frame).
  if (asChild) {
    return (
      <Slot.Root data-slot="lightbox-trigger" className={className} onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      type="button"
      data-slot="lightbox-trigger"
      className={slots.trigger({ className })}
      onClick={handleClick}
      {...props}
    >
      {children}
      {label != null && (
        <>
          <span aria-hidden className={slots.scrim()} />
          <span aria-hidden className={slots.badgeLayer()}>
            <span className={slots.badge()}>{label}</span>
          </span>
        </>
      )}
    </button>
  )
}

/** The viewer itself: rendered by `Lightbox`, you never place it yourself. */
function LightboxViewport() {
  const { images, index, close, go, goTo, slots } = useLightboxContext("LightboxViewport")
  const image = images[index]
  const multiple = images.length > 1

  // ── Swipe to navigate ─────────────────────────────────────────────────────────────────────
  // The frame follows the finger 1:1 during the drag by writing `transform` straight onto the node
  // (a ref, never state) so a swipe never re-renders the image or the thumbnail rail. On release we
  // hand styling back to the CSS class: past a distance OR velocity threshold (and mostly
  // horizontal) it commits `go(±1)` — the image swaps and glides in from the swipe side — otherwise
  // the `transition-transform` class springs it back to center. Pointer events cover touch, pen, and
  // mouse-drag alike; the keys/arrows/thumbs still work untouched.
  const frameRef = React.useRef<HTMLDivElement>(null)
  const gesture = React.useRef<{ x: number; y: number; t: number; id: number } | null>(null)

  function onFramePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!multiple || (event.pointerType === "mouse" && event.button !== 0)) return
    const frame = frameRef.current
    if (!frame) return
    gesture.current = { x: event.clientX, y: event.clientY, t: Date.now(), id: event.pointerId }
    frame.setPointerCapture(event.pointerId)
    frame.style.transition = "none" // 1:1 follow while dragging
  }

  function onFramePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current
    const frame = frameRef.current
    if (!g || g.id !== event.pointerId || !frame) return
    frame.style.transform = `translateX(${event.clientX - g.x}px)`
  }

  function onFramePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current
    const frame = frameRef.current
    if (!g || g.id !== event.pointerId || !frame) return
    gesture.current = null
    try {
      frame.releasePointerCapture(event.pointerId)
    } catch {
      // Pointer was never captured (cancel before move): nothing to release.
    }
    const dx = event.clientX - g.x
    const dy = event.clientY - g.y
    const velocity = Math.abs(dx) / Math.max(1, Date.now() - g.t) // px per ms
    const width = frame.getBoundingClientRect().width || 1
    const horizontal = Math.abs(dx) > Math.abs(dy)
    const passed = Math.abs(dx) > Math.min(120, Math.max(48, width * 0.2)) || velocity > 0.5
    // Hand transform/transition back to the class: cleared inline transform → springs to center (or,
    // on commit, carries the incoming image in from the swipe side as it swaps + crossfades).
    frame.style.transition = ""
    frame.style.transform = ""
    if (horizontal && passed) go(dx < 0 ? 1 : -1)
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={slots.overlay()} />
      <DialogPrimitive.Content
        data-slot="lightbox-content"
        className={slots.content()}
        onClick={close}
        onKeyDown={(event) => {
          if (!multiple) return
          if (event.key === "ArrowRight") {
            event.preventDefault()
            go(1)
          } else if (event.key === "ArrowLeft") {
            event.preventDefault()
            go(-1)
          }
        }}
        aria-label="Image viewer"
      >
        {/* Radix wants a titled, described dialog; keep them for SR users without showing chrome. */}
        <DialogPrimitive.Title className="sr-only">Image viewer</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          {image?.alt || `Image ${index + 1} of ${images.length}`}
        </DialogPrimitive.Description>

        {multiple && (
          <span className={slots.counter()}>
            {index + 1} / {images.length}
          </span>
        )}

        <DialogPrimitive.Close aria-label="Close" className={slots.close({ className: slots.control() })}>
          <X weight="bold" />
        </DialogPrimitive.Close>

        {multiple && (
          <button
            type="button"
            aria-label="Previous image"
            className={slots.arrow({ className: cn(slots.control(), "left-3 sm:left-5") })}
            onClick={(event) => {
              event.stopPropagation()
              go(-1)
            }}
          >
            <CaretLeft weight="bold" />
          </button>
        )}

        {image && (
          <div
            ref={frameRef}
            className={slots.imageFrame({
              // Only a browsable set is draggable; the grab cursor and touch-none hint that.
              className: multiple ? "cursor-grab touch-none active:cursor-grabbing" : undefined,
            })}
            // Tap/drag on the image never closes (only the surrounding scrim does).
            onClick={(event) => event.stopPropagation()}
            onPointerDown={onFramePointerDown}
            onPointerMove={onFramePointerMove}
            onPointerUp={onFramePointerEnd}
            onPointerCancel={onFramePointerEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={image.src}
              src={image.src}
              alt={image.alt ?? ""}
              draggable={false}
              className={slots.image()}
            />
          </div>
        )}

        {multiple && (
          <button
            type="button"
            aria-label="Next image"
            className={slots.arrow({ className: cn(slots.control(), "right-3 sm:right-5") })}
            onClick={(event) => {
              event.stopPropagation()
              go(1)
            }}
          >
            <CaretRight weight="bold" />
          </button>
        )}

        {multiple && <LightboxThumbs images={images} index={index} goTo={goTo} slots={slots} />}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/**
 * The bounded, horizontally-scrollable thumbnail rail. Split out from the viewport so it
 * mounts/unmounts with the (portaled) dialog content: its mount effect therefore re-centers the
 * active tile on EVERY open (even reopening at the same index), and the effect stays colocated with
 * the DOM it scrolls. `block: "nearest"` never nudges the page vertically; the viewport's own
 * `scroll-smooth` (reduce-aware) drives the horizontal glide.
 */
function LightboxThumbs({
  images,
  index,
  goTo,
  slots,
}: {
  images: LightboxImage[]
  index: number
  goTo: (index: number) => void
  slots: LightboxSlots
}) {
  const railRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const active = railRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [index])

  return (
    <div
      ref={railRef}
      className={slots.thumbsViewport()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={slots.thumbs()}>
        {/* Single white ring that glides to the active tile: tile width (100%) + gap-2 per step. */}
        <span
          aria-hidden
          className={slots.thumbRing()}
          style={{ transform: `translateX(calc((100% + 0.5rem) * ${index}))` }}
        />
        {images.map((thumb, i) => (
          <button
            key={thumb.src}
            type="button"
            data-active={i === index}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === index}
            className={slots.thumb()}
            onClick={() => goTo(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb.src}
              alt=""
              draggable={false}
              loading="lazy"
              className={slots.thumbImage()}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
