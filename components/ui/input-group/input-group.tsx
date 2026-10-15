"use client"

import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, ControlSizeProvider, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

export const inputGroupVariants = tv({
  slots: {
    root: [
      "flex w-full items-stretch overflow-hidden",
      "rounded-pill border border-input bg-[var(--surface,var(--background))]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "focus-within:border-brand focus-within:brand-ring",

      "[&_[data-slot=input-root]]:h-auto [&_[data-slot=input-root]]:min-w-0 [&_[data-slot=input-root]]:w-auto [&_[data-slot=input-root]]:flex-1",
      "[&_[data-slot=input-root]]:rounded-none [&_[data-slot=input-root]]:border-0 [&_[data-slot=input-root]]:bg-transparent",
      "[&_[data-slot=input-root]:focus-within]:[box-shadow:none]",

      "[&_[data-slot=select-trigger]]:h-auto [&_[data-slot=select-trigger]]:w-auto [&_[data-slot=select-trigger]]:shrink-0",
      "[&_[data-slot=select-trigger]]:rounded-none [&_[data-slot=select-trigger]]:border-0 [&_[data-slot=select-trigger]]:bg-transparent [&_[data-slot=select-trigger]]:shadow-none",
      "[&_[data-slot=select-trigger]]:focus:ring-0 [&_[data-slot=select-trigger]]:focus:border-transparent [&_[data-slot=select-trigger]]:active:scale-100",

      "[&_[data-slot=button]]:h-auto [&_[data-slot=button]]:rounded-none [&_[data-slot=button]]:shadow-none",
      "[&_[data-slot=button]]:focus-visible:ring-0 [&_[data-slot=button]]:focus-visible:ring-offset-0 [&_[data-slot=button]]:active:scale-100",

      "[&>*:not(:first-child)]:!border-l [&>*:not(:first-child)]:border-input",
    ],
    addon: [
      "flex shrink-0 items-center self-stretch",
      "bg-[var(--surface,var(--background))] text-muted-foreground",
      "select-none whitespace-nowrap font-medium",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
  },
  variants: {
    size: {
      sm: {
        root: "h-8 text-sm",
        addon: "gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-[15px]",
      },
      md: {
        root: "h-9 text-sm",
        addon: "gap-1.5 px-3 text-sm",
      },
      lg: {
        root: "h-10 text-sm pointer-coarse:text-base",
        addon: "gap-1.5 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-[18px]",
      },
    },
    hasError: {
      true: {
        root: [
          "border-destructive",
          "focus-within:border-destructive focus-within:destructive-ring",
        ],
      },
    },
    disabled: {
      true: { root: "opacity-50 pointer-events-none select-none" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type Size = NonNullable<VariantProps<typeof inputGroupVariants>["size"]>

interface InputGroupContextValue {
  size: Size
  hasError: boolean
  disabled: boolean
  slots: ReturnType<typeof inputGroupVariants>
}

const [InputGroupProvider, useInputGroupContext] =
  createContext<InputGroupContextValue>("InputGroup")

export interface InputGroupProps extends React.ComponentProps<"div"> {
  size?: Size
  density?: Density
  hasError?: boolean
  disabled?: boolean
}

function InputGroup({
  size,
  density,
  hasError,
  disabled,
  className,
  children,
  ...props
}: InputGroupProps) {
  const field = useFieldContext()
  const resolvedError = hasError ?? field?.hasError ?? false
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedSize = useControlSize(size, density)
  const slots = inputGroupVariants({
    size: resolvedSize,
    hasError: resolvedError,
    disabled: resolvedDisabled,
  })
  return (
    <InputGroupProvider
      size={resolvedSize}
      hasError={resolvedError}
      disabled={resolvedDisabled}
      slots={slots}
    >
      <div
        data-slot="input-group"
        data-control-size={resolvedSize}
        data-disabled={resolvedDisabled || undefined}
        data-error={resolvedError || undefined}
        role="group"
        className={slots.root({ className })}
        {...props}
      >
        <ControlSizeProvider size={resolvedSize}>{children}</ControlSizeProvider>
      </div>
    </InputGroupProvider>
  )
}

export type InputGroupAddonProps = React.ComponentPropsWithoutRef<"span">

function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  const { slots } = useInputGroupContext("InputGroupAddon")
  return (
    <span
      data-slot="input-group-addon"
      className={slots.addon({ className })}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon }
