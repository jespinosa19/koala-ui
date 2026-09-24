"use client"

import * as React from "react"
import { CaretDown } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { AnimatedLabel } from "@/components/ui/animated-label"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * LoadMore: the "there's more below" pattern. A long region is clamped to a couple of rows, its
 * cut edge fades out, and one button under it reveals the rest. Marketing grids that would
 * otherwise run for three screens (a component catalog, a template gallery, a long FAQ) keep a
 * scannable height without hiding anything from the reader who wants it all.
 *
 * Not Radix Collapsible: that primitive hides its content entirely when closed, and the whole
 * point here is the PARTIAL peek — the clamp has to leave rows visible and cut mid-grid. So the
 * behaviour is hand-rolled, with the ARIA wired by hand (`aria-expanded` + `aria-controls`).
 *
 * The reveal is a smooth height animation, not a jump: `max-height` transitions (an interruptible
 * CSS transition, `duration-slow ease-out`) from the collapsed clamp to the region's measured
 * `scrollHeight`, then settles to `none` on transition end so a later reflow (a resize, a font
 * swap) is never clipped. `max-height: none` is not interpolatable, so that settle snaps with no
 * visual move — the box already sits at content height. Collapsing from `none` re-pins the
 * concrete height for one frame so there's a value to animate down from.
 *
 * The cut edge fades via the `fade-b` MASK utility rather than a background-coloured gradient
 * panel, so it works unchanged on any surface: the page, a muted band, the dark section, a brand
 * fill. A painted gradient would have to know its backdrop; a mask just makes the content
 * transparent. Depth is the shared `--fade-size` knob, dialled well past its default here (see the
 * recipe): a marquee only tucks its edge, a clamp has to trail off over a long band. The ramp
 * inside that band is an eased smoothstep, not a straight line, so neither end of the dissolve
 * lands on a visible edge (see globals.css). The mask swaps rather than cross-fades: `--fade-size`
 * isn't a registered @property, so it can't interpolate, and the swap lands on the same frame the
 * height starts moving, which reads as the clamp releasing.
 *
 * The whole affordance stands down when there's nothing to reveal. A region shorter than its own
 * clamp fades and offers a button that would do nothing, which is a small lie; a ResizeObserver
 * measures the region and drops both the fade and the trigger in that case.
 *
 * Accessibility note: the clamped content stays in the DOM and in the accessibility tree on
 * purpose. This is a VISUAL clamp, not a disclosure — a screen-reader user gets the whole list
 * either way, and `aria-expanded` reports the visual state for anyone who can see the cut.
 *
 * polish applied:
 *   #4  - an interruptible CSS transition: collapsing mid-open reverses in flight.
 *   #14 - the transition names `max-height` exactly, never "all". No `will-change`: max-height
 *         isn't GPU-compositable, so the hint would cost a layer and buy nothing.
 *   #7  - the trigger's caret ROTATES between the two states rather than being swapped for a
 *         second glyph: one mark that turns is read as the same thing changing direction.
 *   both the reveal and that rotation stand down under `prefers-reduced-motion`.
 *   the trigger is ONE control that stays mounted across the toggle, so focus survives the reveal
 *   and the label *rolls* between the two verbs instead of being swapped out from under the
 *   cursor. That roll is an inline `AnimatedLabel` around the words alone, NOT Button's `swapKey`:
 *   `swapKey` boxes every child, which would drag the caret into the swap and dissolve it instead
 *   of turning it. Its row is always in flow, so opening costs no layout shift of its own.
 */
export const loadMoreVariants = tv({
  slots: {
    root: "flex flex-col",
    // The clamped region. `overflow-hidden` and the fade mask are layered on per state by the
    // part, since both must lift once the region settles to its natural height.
    //
    // The dissolve is DEEP on purpose: `--fade-size` defaults to a 40px edge tuck, which is right
    // for a marquee bleeding past its container but reads as a slab cut on a clamp that is hundreds
    // of pixels tall - the last row sits at full strength and then stops. 40% of the clamp (up to
    // 16rem) gives the cut row ALL of its visible height to disappear over, so the grid trails off
    // instead of ending. The first cut (22%, up to 7rem) still read harsh on a row of bright
    // screenshots: a 370px picture went from full white to the band in about 100px. Capped in rem so
    // a very tall clamp does not swallow the row above it, and proportional below that so short
    // regions keep the same feel. Override per instance with a later `[--fade-size:…]` on
    // LoadMoreContent.
    content:
      "[--fade-size:min(16rem,40%)] transition-[max-height] duration-slow ease-out motion-reduce:transition-none",
    // The trigger's row. Always in flow (never absolute over the fade), so the button is a real
    // hit target at a real position and the reveal doesn't shift the page around it.
    trigger: "mt-10 flex",
  },
  variants: {
    /** Where the reveal button sits under the region. Centred reads as a page-level affordance. */
    align: {
      center: { trigger: "justify-center" },
      start: { trigger: "justify-start" },
      end: { trigger: "justify-end" },
    },
  },
  defaultVariants: {
    align: "center",
  },
})

type LoadMoreSlots = ReturnType<typeof loadMoreVariants>

const [LoadMoreProvider, useLoadMoreContext] = createContext<{
  slots: LoadMoreSlots
  expanded: boolean
  toggle: () => void
  maxHeight: string
  contentId: string
  overflowing: boolean
  measureContent: (node: HTMLDivElement | null) => void
  onContentTransitionEnd: (event: React.TransitionEvent<HTMLDivElement>) => void
}>("LoadMore")

export interface LoadMoreProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof loadMoreVariants> {
  /**
   * How tall the region is while collapsed. Any CSS length. Pick a value that cuts THROUGH a row
   * rather than between two, so the fade reads as "more below" instead of a tidy end.
   */
  collapsedHeight?: string
  /** Start revealed. Uncontrolled: the component owns the state from there on. */
  defaultExpanded?: boolean
  /** Fires after each toggle, e.g. to log the reveal or re-measure an embedding frame. */
  onExpandedChange?: (expanded: boolean) => void
}

/**
 * The root. Owns the reveal state and the height animation, and hands both to its parts through
 * Context (never prop-drilled, never cloned children). Compose as
 * `<LoadMore><LoadMoreContent>…</LoadMoreContent><LoadMoreTrigger more="…" less="…" /></LoadMore>`.
 */
export function LoadMore({
  className,
  align,
  collapsedHeight = "28rem",
  defaultExpanded = false,
  onExpandedChange,
  ...props
}: LoadMoreProps) {
  const slots = loadMoreVariants({ align })
  const contentId = React.useId()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [maxHeight, setMaxHeight] = React.useState(defaultExpanded ? "none" : collapsedHeight)
  // Whether the region is actually taller than its clamp. Starts optimistic so the affordance is
  // present on the server render and the first paint, then corrects on measure.
  const [overflowing, setOverflowing] = React.useState(true)

  // A callback ref, not an effect: it attaches the observer in the commit phase (keeping the strict
  // react-hooks lint happy, which bans set-state-in-an-effect) and re-attaches across remounts.
  // The verdict is only meaningful while a clamp is active, which the DOM itself reports, so no
  // React state has to be threaded in and the callback identity can stay stable.
  const measureContent = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
    if (!node) return
    const update = () => {
      if (node.style.maxHeight !== "none") setOverflowing(node.scrollHeight > node.clientHeight)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function commit(next: boolean) {
    setExpanded(next)
    onExpandedChange?.(next)
  }

  function expand() {
    const el = contentRef.current
    if (!el) return
    // Animate from the collapsed clamp up to the true content height.
    setMaxHeight(`${el.scrollHeight}px`)
    commit(true)
  }

  function collapse() {
    const el = contentRef.current
    if (maxHeight === "none" && el) {
      // Settled at natural height: pin a concrete start value, then drop to the clamp next frame
      // so the transition has two lengths to interpolate between (a double rAF guarantees the pin
      // paints first).
      setMaxHeight(`${el.scrollHeight}px`)
      commit(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setMaxHeight(collapsedHeight)))
    } else {
      // Still mid-open (a px value): reverse straight down, interrupting the open in flight.
      setMaxHeight(collapsedHeight)
      commit(false)
    }
  }

  function onContentTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    // Only the region's own max-height, and only when open: release the clamp to natural height so
    // a later resize can't crop it. `none` snaps (no interpolation), so there's no visible jump.
    if (
      event.target === event.currentTarget &&
      event.propertyName === "max-height" &&
      expanded
    ) {
      setMaxHeight("none")
    }
  }

  return (
    <LoadMoreProvider
      slots={slots}
      expanded={expanded}
      toggle={expanded ? collapse : expand}
      maxHeight={maxHeight}
      contentId={contentId}
      overflowing={overflowing}
      measureContent={measureContent}
      onContentTransitionEnd={onContentTransitionEnd}
    >
      <div data-slot="load-more" className={slots.root({ className })} {...props} />
    </LoadMoreProvider>
  )
}

export interface LoadMoreContentProps extends React.ComponentProps<"div"> {
  /**
   * Fade the cut edge while collapsed. On by default: without it the clamp ends on a hard line
   * that reads as the true end of the list, which is the opposite of the message. Turn it off for
   * content that must stay fully opaque to the last pixel (a legal notice, a data table).
   */
  fade?: boolean
}

/**
 * The clamped region. Put the long thing — a grid, a list, a stack of cards — straight inside; it
 * keeps its own layout, this part only governs how much of it shows.
 */
export function LoadMoreContent({ className, fade = true, ...props }: LoadMoreContentProps) {
  const { slots, expanded, maxHeight, contentId, overflowing, measureContent, onContentTransitionEnd } =
    useLoadMoreContext("LoadMoreContent")
  // Only the settled `none` runs unclipped and unmasked, so focus rings on the last row are never
  // cropped once the region is fully open.
  const clamped = maxHeight !== "none"
  return (
    <div
      id={contentId}
      ref={measureContent}
      data-slot="load-more-content"
      data-expanded={expanded || undefined}
      style={{ maxHeight }}
      onTransitionEnd={onContentTransitionEnd}
      className={slots.content({
        className: cn(
          clamped && "overflow-hidden",
          // No fade when the region already fits: there'd be nothing behind it to hint at.
          fade && !expanded && overflowing && "fade-b",
          className,
        ),
      })}
      {...props}
    />
  )
}

export interface LoadMoreTriggerProps extends Omit<ButtonProps, "children"> {
  /** Label while collapsed, e.g. "See all components". Name what's below, not the mechanism. */
  more: React.ReactNode
  /** Label while expanded, e.g. "Show less". */
  less: React.ReactNode
}

/**
 * The reveal button. One control for both directions: it stays mounted across the toggle so focus
 * survives, its label rolls between the two verbs while the box eases between their widths, and a
 * caret turns to point wherever the region is about to move.
 */
export function LoadMoreTrigger({
  className,
  more,
  less,
  tone,
  // On a band (`onMedia` / `onInverse`) the reveal is the only action on the fill, so it defaults
  // to the solid light chip, the way a band's lead action does; on the page it stays a quiet outline.
  variant = tone === "onMedia" || tone === "onInverse" ? "secondary" : "outline",
  ...props
}: LoadMoreTriggerProps) {
  const { slots, expanded, toggle, contentId, overflowing } = useLoadMoreContext("LoadMoreTrigger")
  // Nothing to reveal, nothing to offer. Stays mounted while expanded, so the way back is never
  // taken away mid-interaction.
  if (!expanded && !overflowing) return null
  return (
    <div data-slot="load-more-trigger" className={slots.trigger()}>
      <Button
        variant={variant}
        tone={tone}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={toggle}
        className={className}
        {...props}
      >
        {/* Only the words roll. Handing the whole button to Button's `swapKey` would box the
            caret in the swap too and it would dissolve rather than rotate. The label carries the
            width change (more → less), so the box morphs and the caret rides along. */}
        <AnimatedLabel swapKey={expanded ? "less" : "more"}>{expanded ? less : more}</AnimatedLabel>
        {/* One glyph, turned on toggle: it points where the region is about to go, and reads as a
            transform rather than a swap (#7). `caret-turn` is the shared content-reveal beat, so
            the caret and the height it announces move on one clock and stand down together. */}
        <CaretDown
          weight="bold"
          aria-hidden
          className={cn("size-4 caret-turn", expanded && "rotate-180")}
        />
      </Button>
    </div>
  )
}
