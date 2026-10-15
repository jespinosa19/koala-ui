"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

export const avatarVariants = tv({
  slots: {
    root: [
      "relative isolate inline-flex shrink-0 select-none items-center justify-center align-middle",
      "bg-muted",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
      "after:border after:border-foreground/10 after:content-['']",
    ],
    image: "size-full rounded-[inherit] object-cover",
    fallback:
      "flex size-full items-center justify-center rounded-[inherit] bg-muted font-medium uppercase text-muted-foreground",
    status: "absolute z-10 rounded-full ring-2 ring-[var(--surface,var(--background))]",
    badge: [
      "absolute z-10 flex items-center justify-center overflow-hidden",
      "border border-foreground/10 bg-background ring-2 ring-background",
      "[&>img]:size-full [&>img]:object-contain [&>svg]:size-full",
    ],
  },
  variants: {
    size: {
      xs: { root: "size-6 rounded-full text-xs", status: "size-1.5", badge: "size-3" },
      sm: { root: "size-8 rounded-full text-xs", status: "size-2", badge: "size-3.5" },
      md: { root: "size-10 rounded-full text-sm", status: "size-2.5", badge: "size-4" },
      lg: { root: "size-12 rounded-full text-base", status: "size-3", badge: "size-5" },
      xl: { root: "size-16 rounded-full text-lg", status: "size-3.5", badge: "size-6" },
    },
    shape: {
      circle: { root: "rounded-full" },
      square: { root: "rounded-lg" },
    },
    color: {
      default: {},
      brand: { root: "bg-background after:border-brand/20", fallback: "bg-brand/10 text-brand" },
      purple: { root: "bg-background after:border-purple/20", fallback: "bg-purple/10 text-purple" },
      pink: { root: "bg-background after:border-pink/20", fallback: "bg-pink/10 text-pink" },
      teal: { root: "bg-background after:border-teal/20", fallback: "bg-teal/10 text-teal" },
      orange: { root: "bg-background after:border-orange/20", fallback: "bg-orange/10 text-orange" },
    },
  },
  defaultVariants: {
    size: "md",
    shape: "circle",
    color: "default",
  },
})

type AvatarSlots = ReturnType<typeof avatarVariants>
type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>
const [AvatarProvider, useAvatarContext] = createContext<{
  slots: AvatarSlots
  size: AvatarSize
}>("Avatar")

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "color">,
    VariantProps<typeof avatarVariants> {}

export function AvatarRoot({ className, size, shape, color, ...props }: AvatarProps) {
  const slots = avatarVariants({ size, shape, color })
  return (
    <AvatarProvider slots={slots} size={size ?? "md"}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={slots.root({ className })}
        {...props}
      />
    </AvatarProvider>
  )
}

export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const { slots } = useAvatarContext("AvatarImage")
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={slots.image({ className })}
      {...props}
    />
  )
}

export interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  maxInitials?: number
}

export function AvatarFallback({
  className,
  maxInitials,
  children,
  ...props
}: AvatarFallbackProps) {
  const { slots, size } = useAvatarContext("AvatarFallback")
  const cap = maxInitials ?? (size === "xs" || size === "sm" ? 1 : 2)
  const content = typeof children === "string" ? children.slice(0, cap) : children
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={slots.fallback({ className })}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  )
}

const statusColor = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-muted-foreground",
} as const

const statusPosition = {
  "bottom-right": "right-0 bottom-0",
  "top-right": "right-0 top-0",
  "bottom-left": "left-0 bottom-0",
  "top-left": "left-0 top-0",
} as const

export interface AvatarStatusProps extends React.ComponentProps<"span"> {
  variant?: keyof typeof statusColor
  position?: keyof typeof statusPosition
}

export function AvatarStatus({
  className,
  variant = "online",
  position = "bottom-right",
  ...props
}: AvatarStatusProps) {
  const { slots } = useAvatarContext("AvatarStatus")
  return (
    <span
      data-slot="avatar-status"
      className={cn(slots.status(), statusColor[variant], statusPosition[position], className)}
      {...props}
    />
  )
}

const badgeShape = {
  circle: "rounded-full",
  square: "rounded-md",
} as const

export interface AvatarBadgeProps extends React.ComponentProps<"span"> {
  position?: keyof typeof statusPosition
  shape?: keyof typeof badgeShape
}

export function AvatarBadge({
  className,
  position = "bottom-right",
  shape = "circle",
  ...props
}: AvatarBadgeProps) {
  const { slots } = useAvatarContext("AvatarBadge")
  return (
    <span
      data-slot="avatar-badge"
      className={cn(slots.badge(), badgeShape[shape], statusPosition[position], className)}
      {...props}
    />
  )
}

export const Avatar = AvatarRoot
