"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { tv } from "@/lib/tv"
import { useDensity, type Density } from "@/lib/density"
import { popoverVariants } from "@/components/ui/popover"

export const hoverCardVariants = tv({
  extend: popoverVariants,
  slots: {
    content: "origin-(--radix-hover-card-content-transform-origin)",
  },
})

export const HoverCard = HoverCardPrimitive.Root

export function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

export interface HoverCardContentProps extends React.ComponentProps<typeof HoverCardPrimitive.Content> {
  density?: Density
  showArrow?: boolean
}

export function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
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
        collisionPadding={collisionPadding}
        className={slots.content({ className })}
        {...props}
      >
        {children}
        {showArrow && <HoverCardPrimitive.Arrow className={slots.arrow()} width={12} height={6} />}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
}

export function HoverCardTitle({ className, ...props }: React.ComponentProps<"h4">) {
  const { title } = hoverCardVariants()
  return <h4 data-slot="hover-card-title" className={title({ className })} {...props} />
}

export function HoverCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { description } = hoverCardVariants()
  return <p data-slot="hover-card-description" className={description({ className })} {...props} />
}

export function HoverCardMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { media } = hoverCardVariants()
  return <div data-slot="hover-card-media" className={media({ className })} {...props} />
}

export function HoverCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { footer } = hoverCardVariants()
  return <div data-slot="hover-card-footer" className={footer({ className })} {...props} />
}
