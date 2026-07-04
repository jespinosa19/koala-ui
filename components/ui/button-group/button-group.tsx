"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useControlSize, useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { buttonVariants, type ButtonProps } from "@/components/ui/button"

// ─── Structural recipe ────────────────────────────────────────────────────────
//
// Only container shape lives here. Variant/size/density flow via context so
// each ButtonGroupItem can still override them individually.
//
// Attached mode CSS: parent-class (0,1,0) + [data-slot] (0,1,0) + :not (0,1,0)
// = (0,3,0) specificity, which beats the child's own rounded-md at (0,1,0).
// The rounded-r-none / rounded-l-none longhand props override the rounded-md
// shorthand on the child element through the normal cascade.

export const buttonGroupVariants = tv({
  base: "inline-flex",
  variants: {
    attached: {
      true: [
        // `relative` gives every item a stacking context for z-index.
        "[&>[data-slot=button-group-item]]:relative",
        // Strip the radius on interior edges so adjacent items look joined.
        "[&>[data-slot=button-group-item]:not(:first-child)]:rounded-l-none",
        "[&>[data-slot=button-group-item]:not(:last-child)]:rounded-r-none",
        // Collapse the shared border to 1px via a -1px left-margin overlap.
        "[&>[data-slot=button-group-item]:not(:first-child)]:-ml-px",
        // Raise the active item so its full border shows above its neighbour.
        "[&>[data-slot=button-group-item]:hover]:z-10",
        "[&>[data-slot=button-group-item]:focus-visible]:z-10",
      ],
      false: "gap-1",
    },
  },
  defaultVariants: { attached: true },
})

// ─── Context ──────────────────────────────────────────────────────────────────

type GroupVariant = NonNullable<ButtonProps["variant"]>
type GroupSize = NonNullable<ButtonProps["size"]>
type GroupDensity = "comfortable" | "compact"

interface ButtonGroupContextValue {
  variant: GroupVariant
  size: GroupSize
  density: GroupDensity
  attached: boolean
}

const [ButtonGroupProvider, useButtonGroupContext] =
  createContext<ButtonGroupContextValue>("ButtonGroup")

// ─── ButtonGroup ──────────────────────────────────────────────────────────────

export interface ButtonGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof buttonGroupVariants> {
  /** Variant propagated to every ButtonGroupItem. Default: "outline". */
  variant?: GroupVariant
  /** Size propagated to every ButtonGroupItem. Default: "md". */
  size?: GroupSize
  /** Density propagated to every ButtonGroupItem. Resolves prop > DensityProvider > context default. */
  density?: GroupDensity
}

export function ButtonGroup({
  className,
  variant = "outline",
  size = "md",
  density,
  attached = true,
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <ButtonGroupProvider
      variant={variant}
      size={size}
      density={useDensity(density)}
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

// ─── ButtonGroupItem ──────────────────────────────────────────────────────────

export interface ButtonGroupItemProps extends React.ComponentProps<"button"> {
  /** Override the variant from ButtonGroup. */
  variant?: GroupVariant
  /** Override the size from ButtonGroup. */
  size?: GroupSize
  /** Override the density from ButtonGroup. */
  density?: GroupDensity
  /** Collapse to a square icon-only button. Always pair with `aria-label`. */
  iconOnly?: boolean
  /** Render the child element as the button via Radix Slot. */
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

  // polish: dev warning for icon-only without accessible name.
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

  return (
    <Comp
      data-slot="button-group-item"
      className={buttonVariants({
        variant: variant ?? ctx.variant,
        // Height comes from size; density only picks the default size when none is given.
        size: useControlSize(size ?? ctx.size, density ?? ctx.density),
        iconOnly,
        className: cn("active:scale-100", className),
      })}
      {...props}
    />
  )
}
