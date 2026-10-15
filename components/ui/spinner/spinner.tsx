"use client"

import { CircleNotch, type IconProps } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"

export const spinnerVariants = tv({
  base: "shrink-0 animate-spin motion-reduce:animate-none",
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-5",
      xl: "size-10",
    },
  },
})

export interface SpinnerProps
  extends Omit<IconProps, "size" | "weight">,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

export function Spinner({ className, size, label = "Loading", ...props }: SpinnerProps) {
  const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true"

  return (
    <CircleNotch
      data-slot="spinner"
      weight="bold"
      role={hidden ? undefined : "status"}
      aria-label={hidden ? undefined : label}
      className={spinnerVariants({ size, className })}
      {...props}
    />
  )
}
