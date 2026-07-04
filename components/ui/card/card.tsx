"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Card: the reference multi-part component. Pattern: one `tv` recipe with `slots`,
 * shared variants flowing to every part through React Context (never prop-drilled or
 * cloned). See docs/ARCHITECTURE.md §2.
 */
export const cardVariants = tv({
  slots: {
    // `[--surface:var(--card)]` opts the card into the DS surface contract: nested Inputs,
    // Selects, Textareas and ToggleGroups read `--surface` and blend with the card instead of
    // falling back to the page `--background`. Invisible in light (card = background) but the
    // difference that keeps them from looking like a mismatched darker block in dark/moonlight.
    // `[--surface:var(--card)]` opts the card into the DS surface contract: nested Inputs,
    // Selects, Textareas and ToggleGroups read `--surface` and blend with the card instead of
    // falling back to the page `--background` (which resolves to the light/root value and paints
    // a jarring white block inside a dark/moonlight card). Invisible in light (card = background).
    root: "flex flex-col rounded-xl border bg-card text-card-foreground [--surface:var(--card)]",
    // Header is a grid so an optional Action sits top-right, optically aligned.
    header:
      "grid auto-rows-min items-start gap-1.5 [&:has([data-slot=card-action])]:grid-cols-[1fr_auto]",
    title: "font-semibold leading-none",
    description: "text-sm text-pretty text-muted-foreground",
    action: "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
    content: "",
    footer: "flex items-center",
  },
  variants: {
    variant: {
      // polish: prefer shadow for depth over hard borders.
      default: { root: "border-border shadow-xs" },
      outline: { root: "border-border shadow-none" },
      elevated: { root: "border-transparent shadow-lg" },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For Card it
    // governs padding, gap, and title size. `compact` is the Koala default (16px
    // padding/gaps, 1rem title); `comfortable` is the spacious marketing alternative.
    density: {
      compact: { root: "gap-4 py-4", header: "px-4", content: "px-4", footer: "px-4", title: "text-base" },
      comfortable: { root: "gap-6 py-6", header: "px-6", content: "px-6", footer: "px-6", title: "text-lg" },
    },
  },
  defaultVariants: {
    variant: "default",
    density: "compact",
  },
})

type CardSlots = ReturnType<typeof cardVariants>
const [CardProvider, useCardContext] = createContext<{ slots: CardSlots }>("Card")

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

/**
 * Parts are exported individually (not as `Card.Header` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary; only named
 * exports do. Compose as `<Card><CardHeader>…`.
 */
export function Card({
  className,
  variant,
  density,
  asChild = false,
  ...props
}: CardProps) {
  // Density resolves prop > provider > "compact"; compute the slots once, every part
  // reads them from context.
  const slots = cardVariants({ variant, density: useDensity(density) })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <CardProvider slots={slots}>
      <Comp data-slot="card" className={slots.root({ className })} {...props} />
    </CardProvider>
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardHeader")
  return <div data-slot="card-header" className={slots.header({ className })} {...props} />
}

export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardTitle")
  return <div data-slot="card-title" className={slots.title({ className })} {...props} />
}

export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardDescription")
  return (
    <div data-slot="card-description" className={slots.description({ className })} {...props} />
  )
}

export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardAction")
  return <div data-slot="card-action" className={slots.action({ className })} {...props} />
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardContent")
  return <div data-slot="card-content" className={slots.content({ className })} {...props} />
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCardContext("CardFooter")
  return <div data-slot="card-footer" className={slots.footer({ className })} {...props} />
}
