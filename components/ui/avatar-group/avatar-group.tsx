"use client"

import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { AvatarRoot, AvatarFallback } from "@/components/ui/avatar"
import { TooltipGroup } from "@/components/ui/tooltip"

export const avatarGroupVariants = tv({
  base: [
    "flex items-center",
    "[&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background",
    "[&>[data-slot=avatar]]:transition-transform [&>[data-slot=avatar]]:duration-fast [&>[data-slot=avatar]]:ease-out",
    "[&>[data-slot=avatar]:hover]:z-10 [&>[data-slot=avatar]:hover]:-translate-y-0.5",
  ],
  variants: {
    size: {
      xs: "-space-x-1.5",
      sm: "-space-x-2",
      md: "-space-x-2.5",
      lg: "-space-x-3.5",
      xl: "-space-x-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type AvatarGroupSize = NonNullable<VariantProps<typeof avatarGroupVariants>["size"]>

export interface AvatarGroupProps extends React.ComponentProps<"div"> {
  size?: AvatarGroupSize
  max?: number
  total?: number
  renderOverflow?: (overflow: number) => React.ReactNode
}

export function AvatarGroup({
  className,
  size = "md",
  max,
  total,
  renderOverflow,
  children,
  ...props
}: AvatarGroupProps) {
  const items = React.Children.toArray(children)
  const shown = max != null ? items.slice(0, max) : items
  const overflow = Math.max(0, (total ?? items.length) - shown.length)

  return (
    <div data-slot="avatar-group" className={avatarGroupVariants({ size, className })} {...props}>
      <TooltipGroup>
        {shown}
        {overflow > 0 &&
          (renderOverflow ? (
            renderOverflow(overflow)
          ) : (
            <AvatarRoot size={size} aria-label={`${overflow} more`}>
              <AvatarFallback maxInitials={4} className="tabular-nums">
                {`+${overflow}`}
              </AvatarFallback>
            </AvatarRoot>
          ))}
      </TooltipGroup>
    </div>
  )
}
