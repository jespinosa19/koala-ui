"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { useFieldContext } from "@/lib/field-context"
import { hitBox, hitCoarse } from "@/lib/hit-area"

export const radioGroupVariants = tv({
  slots: {
    root: "grid gap-2.5",
    item: [
      "peer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-[var(--surface,var(--background))] shadow-xs",
      hitCoarse,
      "transition-colors duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=checked]:border-brand data-[state=checked]:bg-brand",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    indicator: [
      "flex items-center justify-center scale-50 opacity-0",
      "transition-[scale,opacity] duration-fast ease-out",
      "data-[state=checked]:scale-100 data-[state=checked]:opacity-100",
    ],
    dot: "rounded-full bg-brand-foreground",
    swatch: [
      "inline-flex shrink-0 cursor-pointer rounded-full",
      hitBox,
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/15",
      "ring-offset-[3px] ring-offset-[var(--surface,var(--background))]",
      "transition-[box-shadow,scale] duration-fast ease-out active:scale-[0.96]",
      "data-[state=unchecked]:hover:ring-[1.5px] data-[state=unchecked]:hover:ring-foreground/25",
      "data-[state=checked]:ring-[1.5px] data-[state=checked]:ring-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brand",
      "disabled:cursor-not-allowed disabled:opacity-40",
    ],
  },
  variants: {
    size: {
      sm: { item: "size-4", dot: "size-1.5", swatch: "size-6" },
      md: { item: "size-5", dot: "size-2", swatch: "size-8" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

type RadioGroupSlots = ReturnType<typeof radioGroupVariants>
const [RadioGroupProvider, useRadioGroupContext] =
  createContext<{ slots: RadioGroupSlots }>("RadioGroup")

export interface RadioGroupProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {}

export function RadioGroup({
  className,
  size,
  disabled,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  const slots = radioGroupVariants({ size })
  const field = useFieldContext()
  return (
    <RadioGroupProvider slots={slots}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        disabled={disabled ?? field?.disabled}
        aria-labelledby={ariaLabelledBy ?? field?.labelledBy}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-invalid={field?.hasError || undefined}
        className={slots.root({ className })}
        {...props}
      />
    </RadioGroupProvider>
  )
}

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>

export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  const { slots } = useRadioGroupContext("RadioGroupItem")
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={slots.item({ className })}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className={slots.indicator()}
      >
        <span className={slots.dot()} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export interface RadioSwatchProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "color" | "children"> {
  color: string
  label: string
}

export function RadioSwatch({ className, color, label, style, ...props }: RadioSwatchProps) {
  const { slots } = useRadioGroupContext("RadioSwatch")
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-swatch"
      aria-label={label}
      className={slots.swatch({ className })}
      style={{ backgroundColor: color, ...style }}
      {...props}
    />
  )
}

export const radioCardVariants = tv({
  slots: {
    card: [
      "group relative flex w-full cursor-pointer items-start border border-input bg-transparent text-left text-card-foreground shadow-xs",
      "transition-[border-color,box-shadow,background-color,scale] duration-fast ease-out active:scale-[0.99]",
      "outline-none focus-visible:border-brand focus-visible:brand-ring",
      "data-[state=unchecked]:hover:border-brand/40",
      "data-[state=checked]:border-brand data-[state=checked]:brand-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    icon: "mt-px shrink-0 text-muted-foreground transition-colors duration-fast ease-out group-data-[state=checked]:text-brand",
    body: "flex min-w-0 flex-1 flex-col gap-1 break-words",
    title: "block text-sm font-semibold leading-none text-foreground",
    description: "block text-pretty text-sm leading-snug text-muted-foreground",
    control:
      "mt-0.5 grid shrink-0 place-items-center self-start rounded-full border border-input bg-[var(--surface,var(--background))] transition-colors duration-fast ease-out group-data-[state=checked]:border-brand group-data-[state=checked]:bg-brand",
    dot: "rounded-full bg-brand-foreground scale-50 opacity-0 transition-[scale,opacity] duration-fast ease-out group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100",
  },
  variants: {
    size: {
      sm: {
        card: "items-center gap-2.5 rounded-lg p-3 [&_[data-slot=radio-card-title]]:font-medium",
        icon: "mt-0 [&>svg]:size-5",
        control: "mt-0 size-4 self-center",
        dot: "size-1.5",
      },
      md: { card: "gap-3 rounded-xl p-4", icon: "[&>svg]:size-6", control: "size-5", dot: "size-2" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface RadioCardProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "size">,
    VariantProps<typeof radioCardVariants> {
  icon?: React.ReactNode
}

export function RadioCard({ className, icon, size, children, ...props }: RadioCardProps) {
  const { card, icon: iconSlot, body, control, dot } = radioCardVariants({ size })
  return (
    <RadioGroupPrimitive.Item data-slot="radio-card" className={card({ className })} {...props}>
      {icon ? (
        <span data-slot="radio-card-icon" className={iconSlot()} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={body()}>{children}</span>
      <span data-slot="radio-card-control" className={control()} aria-hidden>
        <span className={dot()} />
      </span>
    </RadioGroupPrimitive.Item>
  )
}

export function RadioCardTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { title } = radioCardVariants()
  return <span data-slot="radio-card-title" className={title({ className })} {...props} />
}

export function RadioCardDescription({ className, ...props }: React.ComponentProps<"span">) {
  const { description } = radioCardVariants()
  return (
    <span data-slot="radio-card-description" className={description({ className })} {...props} />
  )
}
