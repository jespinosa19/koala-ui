"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * EmptyState: the zero-data / no-results placeholder. Multi-part like Card: one `tv`
 * recipe with `slots`, shared variant + density flowing to every part through React
 * Context (never prop-drilled or cloned). Compose as
 * `<EmptyState><EmptyStateMedia><Icon /></EmptyStateMedia><EmptyStateTitle>…`.
 *
 * `variant` tints the media surface from a single semantic token via opacity (the same
 * soft pattern as Badge), so an error/search/success empty state re-themes across all
 * four themes. `density` retunes spacing and the media/title scale only, never color.
 */
export const emptyStateVariants = tv({
  slots: {
    root: "flex flex-col items-center justify-center text-center",
    // Standalone tinted surface holding the icon. Border always present (soft variants
    // swap its color); shadow over hard border for depth (polish).
    media:
      "flex shrink-0 items-center justify-center border shadow-xs [&_svg]:shrink-0",
    // Rendered as a div, so the base layer's heading `text-wrap: balance` won't reach it.
    title: "text-balance font-semibold text-foreground",
    // max-width keeps the supporting copy to a readable measure instead of one long line.
    description: "text-sm text-pretty text-muted-foreground",
    // Author actions secondary-first so the primary lands on the right (DS convention,
    // matching dialog footers). DOM order = visual = tab order, no CSS reversal, which
    // would focus the primary last out of sequence.
    actions: "flex flex-wrap items-center justify-center",
  },
  variants: {
    // Media tint: soft variants derive a background + icon color from one status token
    // via opacity, mirroring Badge so they stay legible in every theme.
    variant: {
      default: { media: "border-border bg-transparent text-muted-foreground" },
      primary: { media: "border-primary/20 bg-primary/10 text-primary" },
      success: { media: "border-success/20 bg-success/10 text-success" },
      warning: { media: "border-warning/20 bg-warning/10 text-warning" },
      info: { media: "border-info/20 bg-info/10 text-info" },
      destructive: {
        media: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For EmptyState it
    // governs outer padding, the media box + icon size, the title size, the description
    // measure, and the gap above the actions. `comfortable` is the spacious default (full
    // page / marketing); `compact` suits an in-panel placeholder. Concentric radius:
    // the larger comfortable box rounds one step up.
    density: {
      comfortable: {
        root: "gap-2 px-6 py-12",
        media: "mb-5 size-14 rounded-2xl [&_svg]:size-7",
        title: "text-lg",
        description: "max-w-sm",
        actions: "mt-6 gap-3",
      },
      compact: {
        root: "gap-1.5 px-4 py-8",
        media: "mb-4 size-12 rounded-xl [&_svg]:size-6",
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

export function EmptyStateActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useEmptyStateContext("EmptyStateActions")
  return <div data-slot="empty-state-actions" className={slots.actions({ className })} {...props} />
}
