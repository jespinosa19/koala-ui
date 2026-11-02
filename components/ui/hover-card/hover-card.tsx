"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity, type Density } from "@/lib/density"
import { popoverVariants } from "@/components/ui/popover"

export const hoverCardVariants = tv({
  extend: popoverVariants,
  slots: {
    content: "max-w-(--radix-hover-card-content-available-width) origin-(--radix-hover-card-content-transform-origin)",
  },
})

const LONG_PRESS = 450
const PRESS_SLOP = 10

const [HoverCardRootProvider, useHoverCardRoot] = createContext<{ show: () => void }>("HoverCard")

export function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const setOpen = (next: boolean) => {
    setUncontrolled(next)
    onOpenChange?.(next)
  }
  return (
    <HoverCardRootProvider show={() => setOpen(true)}>
      <HoverCardPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </HoverCardRootProvider>
  )
}

export function HoverCardTrigger({
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClick,
  onContextMenu,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  const { show } = useHoverCardRoot("HoverCardTrigger")
  const press = React.useRef<{ timer: number; x: number; y: number } | null>(null)
  const pressed = React.useRef(false)
  const release = () => {
    if (press.current) window.clearTimeout(press.current.timer)
    press.current = null
  }
  React.useEffect(() => release, [])

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      className={cn("pointer-coarse:[-webkit-touch-callout:none]", className)}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        pressed.current = false
        release()
        if (e.pointerType !== "touch") return
        const timer = window.setTimeout(() => {
          pressed.current = true
          press.current = null
          show()
        }, LONG_PRESS)
        press.current = { timer, x: e.clientX, y: e.clientY }
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        const start = press.current
        if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > PRESS_SLOP) release()
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        release()
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e)
        release()
      }}
      onContextMenu={(e) => {
        if (press.current || pressed.current) e.preventDefault()
        onContextMenu?.(e)
      }}
      onClick={(e) => {
        if (pressed.current) e.preventDefault()
        pressed.current = false
        onClick?.(e)
      }}
      {...props}
    />
  )
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
        className={slots.content({
          className: [
            !showArrow && "max-h-(--radix-hover-card-content-available-height) overflow-y-auto overscroll-contain",
            className,
          ],
        })}
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
