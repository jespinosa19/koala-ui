"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"

/**
 * ScrollArea: a scrolling region with Koala's own scrollbar, over Radix ScrollArea. The content
 * still scrolls natively (wheel, trackpad momentum, touch, keyboard, find-in-page); Radix hides the
 * browser's bar and draws one that looks the same on every OS and theme.
 *
 * The bar is an overlay, not a gutter: it takes no width from the content, shows while the pointer
 * is over the region (`type="hover"`, Radix's default; `"scroll"` shows it only while scrolling,
 * `"always"` keeps it), and fades out rather than blinking off. It is a translucent ink pill, so it
 * reads on the page, a card, a popover or a dark band without a token per surface, and it thickens
 * a step under the pointer, the way a native overlay bar does when you reach for it.
 *
 * `fade` softens the edge you can still scroll toward (the `scroll-fade` utilities, pure CSS), so
 * the region says "there is more" before anyone hovers it. For a plain list where the page's hidden
 * scrollbars and a fade are enough, the `scroll-fade` utility on an `overflow-y-auto` box is lighter
 * still; reach for ScrollArea when the bar itself should show.
 *
 * Give the root a height (`h-72`, `max-h-96`, or `flex-1 min-h-0` in a flex column): the viewport
 * fills it. `className` styles the root; the viewport takes `rounded-[inherit]`, so a rounded frame
 * clips the content and the focus ring to its own corners.
 */
export const scrollAreaVariants = tv({
  slots: {
    root: "relative overflow-hidden",
    viewport: [
      "size-full rounded-[inherit]",
      // A scroller can take focus (browsers make it focusable when nothing inside is), and the arrow
      // keys then scroll it. The ring is inset, since the root clips anything drawn outside it.
      "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
      "transition-shadow duration-fast ease-out",
    ],
    scrollbar: [
      "flex touch-none select-none p-0.5",
      // Thickens a step under the pointer (10 → 12px, a 6 → 8px thumb). Width and height are both
      // named so either orientation eases; the bar is absolutely placed, so nothing reflows.
      "transition-[width,height] motion-reduce:transition-none",
      // Radix mounts the bar while the region is hovered or scrolling and waits on its exit
      // animation before unmounting, so it fades in and out instead of cutting. One beat for both
      // the fade and the thickening: `duration-*` feeds the transition and tw-animate-css alike.
      "data-[state=visible]:animate-in data-[state=visible]:fade-in-0",
      "data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0",
      "duration-fast ease-out",
    ],
    // A translucent ink pill: one step off whatever ground it lands on, in every theme.
    thumb: [
      "relative flex-1 cursor-default rounded-full bg-foreground/20",
      "transition-colors duration-fast ease-out hover:bg-foreground/35 active:bg-foreground/45",
    ],
    corner: "bg-transparent",
  },
  variants: {
    orientation: {
      vertical: { scrollbar: "h-full w-2.5 hover:w-3" },
      horizontal: { scrollbar: "h-2.5 flex-col hover:h-3" },
    },
  },
})

type Orientation = "vertical" | "horizontal" | "both"

// Which edges the optional fade dissolves: the axis you scroll along. Two axes can't share one mask
// (both utilities write `mask-image`), so a two-way region fades its vertical edges, the usual lead.
const FADE: Record<Orientation, string> = {
  vertical: "scroll-fade",
  horizontal: "scroll-fade-x",
  both: "scroll-fade",
}

export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which way the content scrolls, and so which bars draw. @default "vertical" */
  orientation?: Orientation
  /** Fade the edge that still has content beyond it. @default false */
  fade?: boolean
  /** A ref to the scrolling element itself: read `scrollTop`, call `scrollTo`, observe it. */
  viewportRef?: React.Ref<HTMLDivElement>
}

export function ScrollArea({
  className,
  orientation = "vertical",
  fade = false,
  viewportRef,
  children,
  ...props
}: ScrollAreaProps) {
  const slots = scrollAreaVariants()
  const vertical = orientation !== "horizontal"
  const horizontal = orientation !== "vertical"
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={slots.root({ className })} {...props}>
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={slots.viewport({
          className: cn(
            fade && FADE[orientation],
            // Radix wraps the content in a `display: table` box so a horizontal region can grow to
            // its content's width. A vertical-only region has no use for that, and it breaks
            // `truncate` and long-word wrapping inside, so it goes back to a plain block.
            !horizontal && "[&>div]:!block",
          ),
        })}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {vertical && <ScrollAreaScrollbar orientation="vertical" />}
      {horizontal && <ScrollAreaScrollbar orientation="horizontal" />}
      {vertical && horizontal && <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" className={slots.corner()} />}
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollAreaScrollbar({
  orientation,
}: {
  orientation: "vertical" | "horizontal"
}) {
  const slots = scrollAreaVariants({ orientation })
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={slots.scrollbar()}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className={slots.thumb()} />
    </ScrollAreaPrimitive.Scrollbar>
  )
}
