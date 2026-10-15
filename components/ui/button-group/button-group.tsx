"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useButtonSize, type ControlSize, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { buttonVariants, type ButtonProps } from "@/components/ui/button"

declare const process: { env: { NODE_ENV?: string } }

export const buttonGroupVariants = tv({
  base: "inline-flex",
  variants: {
    attached: {
      true: [
        "[&>[data-slot=button-group-item]]:relative",
        "[&>[data-slot=button-group-item]:not(:first-child)]:rounded-l-none",
        "[&>[data-slot=button-group-item]:not(:last-child)]:rounded-r-none",
        "[&>[data-slot=button-group-item]:not(:first-child)]:border-l-0",
        "[&>[data-slot=button-group-item]:focus-visible]:z-10",
      ],
      false: "gap-1",
    },
  },
  defaultVariants: { attached: true },
})

type GroupVariant = NonNullable<ButtonProps["variant"]>
type GroupSize = ControlSize | "xs"
type GroupDensity = Density

interface ButtonGroupContextValue {
  variant: GroupVariant
  size?: GroupSize
  density?: GroupDensity
  attached: boolean
}

const [ButtonGroupProvider, useButtonGroupContext] =
  createContext<ButtonGroupContextValue>("ButtonGroup")

export interface ButtonGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof buttonGroupVariants> {
  variant?: GroupVariant
  size?: GroupSize
  density?: GroupDensity
}

export function ButtonGroup({
  className,
  variant = "outline",
  size,
  density,
  attached = true,
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <ButtonGroupProvider
      variant={variant}
      size={size}
      density={density}
      attached={attached ?? true}
    >
      <div
        role="group"
        data-slot="button-group"
        className={buttonGroupVariants({ attached, className })}
        {...props}
      >
        {children}
      </div>
    </ButtonGroupProvider>
  )
}

export interface ButtonGroupItemProps extends React.ComponentProps<"button"> {
  variant?: GroupVariant
  size?: GroupSize
  density?: GroupDensity
  iconOnly?: boolean
  asChild?: boolean
}

export function ButtonGroupItem({
  className,
  variant,
  size,
  density,
  iconOnly = false,
  asChild = false,
  ...props
}: ButtonGroupItemProps) {
  const ctx = useButtonGroupContext("ButtonGroupItem")
  const Comp = asChild ? Slot.Root : "button"

  const ariaLabel = props["aria-label"]
  const ariaLabelledby = props["aria-labelledby"]
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      iconOnly &&
      !asChild &&
      !ariaLabel &&
      !ariaLabelledby
    ) {
      console.warn(
        "ButtonGroupItem: an `iconOnly` item has no accessible name. " +
          "Pass `aria-label` (or `aria-labelledby`) so screen readers can announce it.",
      )
    }
  }, [iconOnly, asChild, ariaLabel, ariaLabelledby])

  const buttonSize = useButtonSize(size ?? (density ? undefined : ctx.size), density ?? ctx.density)
  const resolvedSize: GroupSize = buttonSize === "xl" ? "lg" : buttonSize

  return (
    <Comp
      data-slot="button-group-item"
      className={buttonVariants({
        variant: variant ?? ctx.variant,
        size: resolvedSize,
        iconOnly,
        className: cn("active:scale-100", className),
      })}
      {...props}
    />
  )
}
