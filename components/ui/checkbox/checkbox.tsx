"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"
import { useFieldContext } from "@/lib/field-context"
import { hitCoarse } from "@/lib/hit-area"

export const checkboxVariants = tv({
  slots: {
    root: [
      "peer inline-flex shrink-0 cursor-pointer items-center justify-center border border-input bg-[var(--surface,var(--background))] shadow-xs",
      hitCoarse,
      "transition-colors duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-[var(--surface,var(--background))]",
      "data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-[var(--surface,var(--background))]",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    indicator: "flex items-center justify-center text-current",
    icon: "",
    group: "flex flex-col gap-3",
  },
  variants: {
    size: {
      sm: { root: "size-4 rounded-[calc(var(--radius-sm)*0.8)]", icon: "size-3" },
      md: { root: "size-5 rounded-sm", icon: "size-3.5" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface CheckboxGroupContextValue {
  value: string[]
  setValue: (next: string[]) => void
  allValues: readonly string[]
  disabled: boolean
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null)

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((v) => b.includes(v))

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  parent?: boolean
}

export function Checkbox({
  className,
  size,
  checked: checkedProp,
  onCheckedChange,
  parent = false,
  value,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const { root, indicator, icon } = checkboxVariants({ size })
  const field = useFieldContext()
  const group = React.useContext(CheckboxGroupContext)

  const snapshot = React.useRef<string[] | null>(null)
  const lastWritten = React.useRef<string[] | null>(null)

  let checked = checkedProp
  let handleCheckedChange = onCheckedChange

  if (group && parent) {
    const scope = group.allValues
    const selected = scope.filter((v) => group.value.includes(v))
    const status: boolean | "indeterminate" =
      scope.length > 0 && selected.length === scope.length
        ? true
        : selected.length > 0
          ? "indeterminate"
          : false
    checked = status
    handleCheckedChange = (next) => {
      if (!lastWritten.current || !sameSet(lastWritten.current, selected)) snapshot.current = null
      const rest = group.value.filter((v) => !scope.includes(v))
      let nextSelected: string[]
      if (status === "indeterminate") {
        snapshot.current = selected
        nextSelected = [...scope]
      } else if (status === true) {
        nextSelected = []
      } else {
        nextSelected = snapshot.current ?? [...scope]
      }
      lastWritten.current = nextSelected
      group.setValue([...rest, ...nextSelected])
      onCheckedChange?.(next)
    }
  } else if (group && value !== undefined) {
    const name = String(value)
    checked = group.value.includes(name)
    handleCheckedChange = (next) => {
      const others = group.value.filter((v) => v !== name)
      group.setValue(next === true ? [...others, name] : others)
      onCheckedChange?.(next)
    }
  }

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-parent={group && parent ? "" : undefined}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      value={value}
      id={id ?? field?.id}
      disabled={disabled ?? (group?.disabled || undefined) ?? field?.disabled}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={field?.hasError || undefined}
      className={root({ className })}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className={indicator()}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={icon()}
          aria-hidden
        >
          <path
            d={checked === "indeterminate" ? "M5 12h14" : "M5 12.5l4.5 4.5L19 7.5"}
            pathLength={1}
            className="animate-check-draw [stroke-dasharray:1]"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export interface CheckboxGroupProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  allValues?: readonly string[]
  disabled?: boolean
}

export function CheckboxGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  allValues,
  disabled = false,
  className,
  ...props
}: CheckboxGroupProps) {
  const outer = React.useContext(CheckboxGroupContext)
  const { group } = checkboxVariants()
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? [])

  const inherits = outer !== null && valueProp === undefined && defaultValue === undefined
  const value = inherits ? outer.value : (valueProp ?? uncontrolled)

  const setValue = React.useCallback(
    (next: string[]) => {
      if (inherits) outer.setValue(next)
      else if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [inherits, outer, valueProp, onValueChange],
  )

  const context = React.useMemo<CheckboxGroupContextValue>(
    () => ({
      value,
      setValue,
      allValues: allValues ?? [],
      disabled: disabled || (inherits && outer.disabled),
    }),
    [value, setValue, allValues, disabled, inherits, outer],
  )

  return (
    <CheckboxGroupContext.Provider value={context}>
      <div
        role="group"
        data-slot="checkbox-group"
        data-disabled={context.disabled ? "" : undefined}
        className={group({ className })}
        {...props}
      />
    </CheckboxGroupContext.Provider>
  )
}
