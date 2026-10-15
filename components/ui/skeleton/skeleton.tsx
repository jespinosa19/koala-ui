import * as React from "react"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

export const skeletonVariants = tv({
  base: [
    "block shrink-0 bg-muted",
    "relative overflow-hidden",
  ],
  variants: {
    variant: {
      rectangle: "rounded-md",
      circle: "aspect-square rounded-full",
      text: "h-[1lh] w-full rounded-sm",
    },
    animation: {
      pulse: "animate-pulse",
      shimmer: [
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent",
        "after:[will-change:transform]",
      ],
      none: "",
    },
  },
  defaultVariants: {
    variant: "rectangle",
    animation: "pulse",
  },
})

export interface SkeletonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {
  lines?: number
}

export function Skeleton({
  className,
  variant = "rectangle",
  animation,
  lines,
  ...props
}: SkeletonProps) {
  if (variant === "text" && lines && lines > 1) {
    return (
      <div className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            data-slot="skeleton"
            className={skeletonVariants({
              variant,
              animation,
              className: i === lines - 1 ? "w-3/5" : undefined,
            })}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={skeletonVariants({ variant, animation, className })}
      {...props}
    />
  )
}
