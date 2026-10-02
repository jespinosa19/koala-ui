"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { tv } from "@/lib/tv"
import { useDensity, type Density } from "@/lib/density"
import { popoverVariants } from "@/components/ui/popover"

/**
 * HoverCard: a preview that opens while the pointer rests on a link, over Radix HoverCard (hover
 * intent with open and close delays, collision-aware positioning, and a card the pointer can move
 * into without it closing). The profile behind an @mention, the page behind a link, the commit
 * behind a hash: something a sighted mouse user can peek at *before* deciding to follow the link.
 *
 * Where it sits among the floating surfaces:
 * - Tooltip names a control in a few words and never takes the pointer.
 * - HoverCard previews what a link leads to, and may hold its own links and a button.
 * - Popover opens on a click, takes focus, and is where anything you must be able to reach by
 *   keyboard lives (forms, pickers, confirmations).
 *
 * The card never takes focus and does not open on touch, so it must only ever *preview*: the
 * trigger is a real link that goes to the same place, and nothing in the card is reachable only
 * from the card.
 *
 * The shell is Popover's (extended, not copied): the same `bg-popover` panel, soft edge, lift and
 * `--surface`, so nested controls blend with it. What it adds is the origin: the card grows out of
 * the trigger it previews (Radix's transform-origin var) instead of from its own centre.
 */
export const hoverCardVariants = tv({
  extend: popoverVariants,
  slots: {
    content: "origin-(--radix-hover-card-content-transform-origin)",
  },
})

// ─── Root / Trigger (behavioral passthroughs) ───────────────────────────────────

/** The root. `openDelay` (700ms) and `closeDelay` (300ms) are Radix's hover intent, forwarded. */
export const HoverCard = HoverCardPrimitive.Root

/** The link being previewed. Use `asChild` onto a real link, so the trigger goes somewhere on its own. */
export function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

// ─── Content ─────────────────────────────────────────────────────────────────────

export interface HoverCardContentProps extends React.ComponentProps<typeof HoverCardPrimitive.Content> {
  /** Content padding: `comfortable` (16px) or `compact` (12px). Cascades from a DensityProvider. */
  density?: Density
  /** Render a small pointer toward the trigger. @default false */
  showArrow?: boolean
}

export function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  density,
  showArrow = false,
  children,
  ...props
}: HoverCardContentProps) {
  const slots = hoverCardVariants({ density: useDensity(density) })
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={slots.content({ className })}
        {...props}
      >
        {children}
        {showArrow && <HoverCardPrimitive.Arrow className={slots.arrow()} width={12} height={6} />}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
}

// ─── Optional structured-content helpers ────────────────────────────────────────

/** The card's heading: the name, the page title, the commit subject. */
export function HoverCardTitle({ className, ...props }: React.ComponentProps<"h4">) {
  const { title } = hoverCardVariants()
  return <h4 data-slot="hover-card-title" className={title({ className })} {...props} />
}

/** Muted supporting copy under a `HoverCardTitle`. */
export function HoverCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { description } = hoverCardVariants()
  return <p data-slot="hover-card-description" className={description({ className })} {...props} />
}

/**
 * The picture of what the link leads to, set 8px in from the card's edges (4px compact) with
 * concentric corners: Popover's inset media. Put it first or last; it pulls into that edge.
 */
export function HoverCardMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { media } = hoverCardVariants()
  return <div data-slot="hover-card-media" className={media({ className })} {...props} />
}

/** A muted well that closes the card (a commit's counts, a profile's stats). Always the last part. */
export function HoverCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { footer } = hoverCardVariants()
  return <div data-slot="hover-card-footer" className={footer({ className })} {...props} />
}
