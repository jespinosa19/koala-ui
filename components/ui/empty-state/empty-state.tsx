"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize } from "@/lib/density"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * EmptyState: the zero-data / no-results placeholder. Multi-part like Card: one `tv`
 * recipe with `slots`, shared variant + density flowing to every part through React
 * Context (never prop-drilled or cloned). Compose as
 * `<EmptyState><EmptyStateMedia><Icon /></EmptyStateMedia><EmptyStateTitle>…`.
 *
 * `variant` colors the media icon from a single semantic token; the tile itself stays
 * neutral (no fill, plain ring edge), so it re-themes across all four themes. `density` retunes spacing and the media/title scale only, never color.
 */
export const emptyStateVariants = tv({
  slots: {
    root: "flex flex-col items-center justify-center text-center",
    // Neutral tile holding the icon: hairline edge, no fill, in every variant (only the icon
    // takes the status color). The edge is an `--edge` ring plus the xs lift, not a border
    // (docs/FOUNDATIONS.md, "Shadows over borders").
    media:
      "flex shrink-0 items-center justify-center bg-transparent shadow-xs ring-1 ring-edge [&_svg]:shrink-0",
    // Rendered as a div, so the base layer's heading `text-wrap: balance` won't reach it.
    title: "text-balance font-semibold text-foreground",
    // max-width keeps the supporting copy to a readable measure instead of one long line.
    description: "text-sm text-pretty text-muted-foreground",
    // One action, never a pair: an empty state points at a single next step. The DS
    // convention is a lone `variant="outline"` Button; the row imposes `sm` on it.
    actions: "flex flex-wrap items-center justify-center",
  },
  variants: {
    // Status colors the ICON only. The tile keeps the same neutral edge and no fill in
    // every variant, so a row of empty states reads as one family and the glyph carries
    // the meaning.
    variant: {
      default: { media: "text-muted-foreground" },
      primary: { media: "text-primary" },
      success: { media: "text-success" },
      warning: { media: "text-warning" },
      info: { media: "text-info" },
      destructive: { media: "text-destructive" },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For EmptyState it
    // governs outer padding, the media box + icon size, the title size, the description
    // measure, and the gap above the actions. `comfortable` is the spacious default (full
    // page / marketing); `compact` suits an in-panel placeholder. The media box stays a
    // soft square (rounded-md) at both sizes: a tile, never a squircle.
    density: {
      comfortable: {
        root: "gap-2 px-6 py-12",
        media: "mb-5 size-14 rounded-md [&_svg]:size-7",
        title: "text-lg",
        description: "max-w-sm",
        actions: "mt-6 gap-3",
      },
      compact: {
        root: "gap-1.5 px-4 py-8",
        media: "mb-4 size-12 rounded-md [&_svg]:size-6",
        title: "text-base",
        description: "max-w-xs",
        actions: "mt-5 gap-2",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    density: "comfortable",
  },
})

type EmptyStateSlots = ReturnType<typeof emptyStateVariants>
const [EmptyStateProvider, useEmptyStateContext] =
  createContext<{ slots: EmptyStateSlots }>("EmptyState")

export interface EmptyStateProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof emptyStateVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not as `EmptyState.Media` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary; only named exports
 * do. See docs/ARCHITECTURE.md §2.
 */
export function EmptyState({
  className,
  variant,
  density,
  asChild = false,
  ...props
}: EmptyStateProps) {
  // Density resolves prop > provider > "comfortable"; compute the slots once, every part
  // reads them from context.
  const slots = emptyStateVariants({ variant, density: useDensity(density) })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <EmptyStateProvider slots={slots}>
      <Comp data-slot="empty-state" className={slots.root({ className })} {...props} />
    </EmptyStateProvider>
  )
}

export function EmptyStateMedia({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const { slots } = useEmptyStateContext("EmptyStateMedia")
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp aria-hidden data-slot="empty-state-media" className={slots.media({ className })} {...props} />
  )
}

export function EmptyStateTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useEmptyStateContext("EmptyStateTitle")
  return <div data-slot="empty-state-title" className={slots.title({ className })} {...props} />
}

export function EmptyStateDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useEmptyStateContext("EmptyStateDescription")
  return (
    <p data-slot="empty-state-description" className={slots.description({ className })} {...props} />
  )
}

export interface EmptyStateActionsProps extends React.ComponentProps<"div"> {
  /**
   * Control height for the block. The empty state's single action is a quiet `sm` outline
   * button, a pointer to the next step rather than a hero CTA. Imposed on the children (see
   * lib/density.tsx) so the button need not carry a `size`; an explicit one still wins.
   * @default "sm"
   */
  size?: ControlSize
}

export function EmptyStateActions({ className, size = "sm", children, ...props }: EmptyStateActionsProps) {
  const { slots } = useEmptyStateContext("EmptyStateActions")
  return (
    <div
      data-slot="empty-state-actions"
      data-control-size={size}
      className={slots.actions({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}
