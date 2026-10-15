import * as React from "react"
import { Separator } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

export const dividerVariants = tv({
  slots: {
    root: "flex items-center",
    line: "shrink-0 border-border",
    label: "shrink-0 text-xs font-medium text-muted-foreground",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "w-full flex-row",
        line: "w-full border-t",
        label: "px-3",
      },
      vertical: {
        root: "h-full flex-col",
        line: "h-full self-stretch border-l",
        label: "py-3",
      },
    },
    variant: {
      solid: {},
      dashed: { line: "border-dashed" },
      dotted: { line: "border-dotted" },
      gradient: { line: "border-0" },
    },
  },
  compoundVariants: [
    {
      variant: "gradient",
      orientation: "horizontal",
      class: { line: "h-px bg-gradient-to-r from-transparent via-border to-transparent" },
    },
    {
      variant: "gradient",
      orientation: "vertical",
      class: { line: "w-px bg-gradient-to-b from-transparent via-border to-transparent" },
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    variant: "solid",
  },
})

export interface DividerProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof dividerVariants> {
  children?: React.ReactNode
  labelPosition?: "start" | "center" | "end"
  decorative?: boolean
  static?: boolean
}

export function Divider({
  className,
  orientation = "horizontal",
  variant = "solid",
  labelPosition = "center",
  decorative = false,
  static: isStatic = false,
  children,
  ...props
}: DividerProps) {
  const slots = dividerVariants({ orientation, variant })

  const smart = isStatic ? undefined : ""

  if (children == null || orientation === "vertical") {
    return (
      <Separator.Root
        data-slot="divider"
        data-smart={smart}
        orientation={orientation}
        decorative={decorative}
        className={slots.line({ className })}
        {...props}
      />
    )
  }

  const showStart = labelPosition !== "start"
  const showEnd = labelPosition !== "end"
  return (
    <div
      data-slot="divider"
      data-smart={smart}
      role={decorative ? "none" : "separator"}
      aria-orientation="horizontal"
      className={slots.root({ className })}
      {...props}
    >
      {showStart && <span aria-hidden className={slots.line({ className: "w-auto flex-1" })} />}
      <span data-slot="divider-label" className={slots.label()}>
        {children}
      </span>
      {showEnd && <span aria-hidden className={slots.line({ className: "w-auto flex-1" })} />}
    </div>
  )
}
