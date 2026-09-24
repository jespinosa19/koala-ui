"use client"

import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Tooltip } from "@/components/ui/tooltip"

/**
 * BadgeGroup: a cluster of {@link Badge}s with optional overflow. Pass `max` and the badges past
 * it collapse into a single `+N` chip; hovering or focusing the chip reveals the full list in a
 * {@link Tooltip}, so a long tag set never blows out its column. It owns only layout + the
 * overflow affordance; the badges themselves stay plain `Badge`s, styled by the consumer, so
 * it composes anywhere a row of tags, labels, or categories appears.
 *
 * This is the companion to a single `Badge` the way {@link ButtonGroup} is to `Button`. The one
 * place Koala leans on Tippy.js (via Tooltip) carries the reveal; no new Tooltip variant needed:
 * the bubble already takes arbitrary content and an `interactive` mode for hoverable popups.
 */
export const badgeGroupVariants = tv({
  // Inline row of chips. `min-w-0` lets it sit in a constrained cell without forcing overflow.
  base: "flex min-w-0 items-center gap-1",
  variants: {
    /** Wrap to multiple lines instead of capping on one. Pair with `max` for a hard cap either way. */
    wrap: {
      true: "flex-wrap",
      false: "",
    },
  },
  defaultVariants: {
    wrap: false,
  },
})

export interface BadgeGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof badgeGroupVariants> {
  /** Cap the badges shown inline; the rest collapse into a `+N` chip. Omit to show every badge. */
  max?: number
  /** Variant of the `+N` overflow chip. @default "outline" */
  overflowVariant?: BadgeProps["variant"]
  /** Size of the `+N` overflow chip: match it to the badges it stands in for. @default "sm" */
  overflowSize?: BadgeProps["size"]
  /** Accessible label for the overflow chip. @default "`{n}` more" */
  overflowLabel?: string
  /** Keep the overflow tooltip open while hovered, for badges with links or a remove button. */
  interactive?: boolean
  /**
   * Render your own overflow tooltip body, given the full list and the hidden slice. Defaults to
   * the whole list stacked vertically, so the chip reveals everything in one place.
   */
  renderOverflow?: (items: React.ReactNode[], hidden: React.ReactNode[]) => React.ReactNode
}

export function BadgeGroup({
  className,
  wrap,
  max,
  overflowVariant = "outline",
  overflowSize = "sm",
  overflowLabel,
  interactive,
  renderOverflow,
  children,
  ...props
}: BadgeGroupProps) {
  // Count only real elements: whitespace or a falsy child never becomes a phantom badge or skews
  // the overflow count.
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const visible = max == null ? items : items.slice(0, max)
  const hidden = max == null ? [] : items.slice(max)

  const overflowContent =
    renderOverflow?.(items, hidden) ?? (
      <ul className="flex flex-col items-start gap-1 py-0.5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )

  return (
    <div data-slot="badge-group" className={badgeGroupVariants({ wrap, className })} {...props}>
      {visible}
      {hidden.length > 0 && (
        <Tooltip content={overflowContent} interactive={interactive}>
          {/* Focusable so the reveal is reachable by keyboard, not just hover; `cursor-help`
              marks it as explanatory, and `tabular-nums` keeps the count aligned. */}
          <Badge
            variant={overflowVariant}
            size={overflowSize}
            tabIndex={0}
            aria-label={overflowLabel ?? `${hidden.length} more`}
            className="cursor-help tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            +{hidden.length}
          </Badge>
        </Tooltip>
      )}
    </div>
  )
}
