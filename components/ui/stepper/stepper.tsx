"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { Check } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { Spinner } from "@/components/ui/spinner"
import { useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox } from "@/lib/hit-area"

export const stepperVariants = tv({
  slots: {
    root: "flex",
    item: "group/step relative flex",
    trigger: [
      "group/trigger inline-flex outline-none cursor-pointer",
      "transition-transform duration-fast ease-out active:scale-[0.96]",
      "disabled:pointer-events-none disabled:cursor-not-allowed",
    ],
    indicator: [
      "relative z-10 inline-flex size-[var(--step-size)] shrink-0 items-center justify-center rounded-full",
      "border-2 border-border bg-background font-medium text-muted-foreground",
      "transition duration-fast ease-out",
      "group-focus-visible/trigger:outline-2 group-focus-visible/trigger:outline-offset-2 group-focus-visible/trigger:outline-brand",
      "group-data-[state=active]/step:border-primary group-data-[state=active]/step:text-primary group-data-[state=active]/step:ring-4 group-data-[state=active]/step:ring-primary/10",
      "group-data-[state=completed]/step:border-primary group-data-[state=completed]/step:bg-primary group-data-[state=completed]/step:text-primary-foreground",
      "group-data-[disabled]/step:opacity-50",
      hitBox,
      "[&_svg]:shrink-0",
    ],
    title:
      "font-medium text-muted-foreground transition-colors duration-fast ease-out group-data-[state=active]/step:text-foreground group-data-[state=completed]/step:text-foreground",
    description: "text-pretty text-muted-foreground",
    separator: "absolute overflow-hidden bg-border",
    separatorFill: "block size-full bg-primary transition-transform duration-base ease-out",
  },
  variants: {
    variant: {
      outline: {},
      solid: {
        indicator: [
          "border-transparent bg-muted text-muted-foreground",
          "group-data-[state=active]/step:border-transparent group-data-[state=active]/step:bg-primary group-data-[state=active]/step:text-primary-foreground group-data-[state=active]/step:ring-0",
          "group-data-[state=completed]/step:border-transparent",
        ],
      },
    },
    orientation: {
      horizontal: {
        item: "min-w-0 flex-1 flex-col items-center",
        trigger: "flex-col items-center gap-2 text-center",
        separator:
          "top-[calc(var(--step-size)/2)] left-[calc(50%+var(--step-size)/2)] h-0.5 w-[calc(100%-var(--step-size))] -translate-y-1/2 rounded-full",
        separatorFill: "origin-left scale-x-0 group-data-[state=completed]/step:scale-x-100",
      },
      vertical: {
        root: "flex-col",
        item: "flex-row items-start gap-3 [&:not(:last-child)]:min-h-[calc(var(--step-size)+2rem)]",
        trigger: "flex-row items-start gap-3 text-left",
        title: "pt-1",
        separator:
          "left-[calc(var(--step-size)/2)] top-[calc(var(--step-size)+0.25rem)] bottom-1 w-0.5 -translate-x-1/2 rounded-full",
        separatorFill: "origin-top scale-y-0 group-data-[state=completed]/step:scale-y-100",
      },
    },
    density: {
      comfortable: {
        root: "[--step-size:1.75rem]",
        indicator: "text-sm [&_svg]:size-4",
        title: "text-sm",
        description: "text-xs",
      },
      compact: {
        root: "[--step-size:1.5rem]",
        indicator: "text-xs [&_svg]:size-3.5",
        title: "text-xs",
        description: "text-xs",
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    orientation: "horizontal",
    density: "comfortable",
  },
})

type StepperSlots = ReturnType<typeof stepperVariants>

const [StepperProvider, useStepperContext] = createContext<{
  slots: StepperSlots
  activeStep: number
  setActiveStep: (step: number) => void
}>("Stepper")

type StepState = "completed" | "active" | "inactive"

const [StepperItemProvider, useStepperItemContext] = createContext<{
  step: number
  state: StepState
  disabled: boolean
  loading: boolean
}>("StepperItem")

export interface StepperProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    VariantProps<typeof stepperVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (step: number) => void
}

export function Stepper({
  className,
  variant,
  orientation,
  density,
  value,
  defaultValue = 1,
  onValueChange,
  ...props
}: StepperProps) {
  const slots = stepperVariants({ variant, orientation, density: useDensity(density) })

  const [internalStep, setInternalStep] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const activeStep = isControlled ? value : internalStep

  const setActiveStep = React.useCallback(
    (step: number) => {
      if (!isControlled) setInternalStep(step)
      onValueChange?.(step)
    },
    [isControlled, onValueChange],
  )

  return (
    <StepperProvider slots={slots} activeStep={activeStep} setActiveStep={setActiveStep}>
      <div
        role="group"
        data-slot="stepper"
        data-orientation={orientation ?? "horizontal"}
        className={slots.root({ className })}
        {...props}
      />
    </StepperProvider>
  )
}

export interface StepperItemProps extends React.ComponentProps<"div"> {
  step: number
  completed?: boolean
  disabled?: boolean
  loading?: boolean
}

export function StepperItem({
  className,
  step,
  completed,
  disabled = false,
  loading = false,
  ...props
}: StepperItemProps) {
  const { slots, activeStep } = useStepperContext("StepperItem")
  const state: StepState = (completed ?? activeStep > step)
    ? "completed"
    : activeStep === step
      ? "active"
      : "inactive"

  return (
    <StepperItemProvider step={step} state={state} disabled={disabled} loading={loading}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        className={slots.item({ className })}
        {...props}
      />
    </StepperItemProvider>
  )
}

export interface StepperTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  static?: boolean
}

export function StepperTrigger({
  className,
  asChild = false,
  static: isStatic = false,
  onClick,
  ...props
}: StepperTriggerProps) {
  const { slots, setActiveStep } = useStepperContext("StepperTrigger")
  const { step, state, disabled } = useStepperItemContext("StepperTrigger")
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      type={asChild ? undefined : "button"}
      data-slot="stepper-trigger"
      disabled={disabled || undefined}
      aria-current={state === "active" ? "step" : undefined}
      className={slots.trigger({ className: cn(isStatic && "active:scale-100", className) })}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (!event.defaultPrevented) setActiveStep(step)
      }}
      {...props}
    />
  )
}

export function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { slots } = useStepperContext("StepperIndicator")
  const { step, state, loading } = useStepperItemContext("StepperIndicator")

  return (
    <span data-slot="stepper-indicator" className={slots.indicator({ className })} {...props}>
      {loading ? (
        <Spinner aria-hidden />
      ) : state === "completed" ? (
        <Check weight="bold" aria-hidden className="animate-in zoom-in-50 fade-in duration-base ease-out" />
      ) : (
        <span className="tabular-nums">{children ?? step}</span>
      )}
    </span>
  )
}

export function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useStepperContext("StepperTitle")
  return <span data-slot="stepper-title" className={slots.title({ className })} {...props} />
}

export function StepperDescription({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useStepperContext("StepperDescription")
  return (
    <span
      data-slot="stepper-description"
      className={slots.description({ className })}
      {...props}
    />
  )
}

export function StepperSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useStepperContext("StepperSeparator")
  return (
    <div
      aria-hidden
      data-slot="stepper-separator"
      className={slots.separator({ className })}
      {...props}
    >
      <span className={slots.separatorFill()} />
    </div>
  )
}
