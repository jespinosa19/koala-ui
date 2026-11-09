"use client"

import * as React from "react"
import { Eye, EyeSlash } from "koala-icons"
import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

const inputVariants = tv({
  slots: {
    root: [
      "flex items-center w-full overflow-hidden",
      "border border-input bg-[var(--surface,var(--background))]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "focus-within:outline-none focus-within:border-brand focus-within:brand-ring",
      "autofill-tint",
    ],
    field: [
      "flex-1 min-w-0 bg-transparent outline-none",
      "autofill-clear",
      "text-foreground placeholder:text-placeholder",
      "disabled:cursor-not-allowed",
      "file:border-0 file:bg-transparent file:font-medium",
    ],
    adornment: [
      "flex shrink-0 items-center",
      "text-muted-foreground",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ],
    floating: "relative flex min-w-0 flex-1 self-stretch",
    floatingField: [
      "peer size-full min-w-0 bg-transparent outline-none",
      "autofill-clear",
      "text-foreground placeholder:text-transparent focus:placeholder:text-placeholder",
      "placeholder:transition-[color] placeholder:duration-fast placeholder:ease-out",
      "disabled:cursor-not-allowed",
    ],
    floatingLabel: [
      "pointer-events-none absolute left-0 top-1/2 max-w-full origin-left -translate-y-1/2 truncate select-none",
      "text-muted-foreground",
      "transition-[translate,scale,color] duration-base ease-out",
      "motion-reduce:duration-fast motion-reduce:ease-linear",
      "peer-focus:scale-[0.8] peer-[:not(:placeholder-shown)]:scale-[0.8] peer-autofill:scale-[0.8]",
    ],
    prefixLabel: [
      "flex shrink-0 items-center self-stretch",
      "border-r border-input bg-[var(--surface,var(--background))] text-muted-foreground",
      "whitespace-nowrap select-none font-medium",
    ],
    suffixButton: [
      "flex shrink-0 cursor-pointer items-center justify-center",
      "text-muted-foreground hover:text-foreground hover:bg-accent",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
  },
  variants: {
    variant: {
      default: {},
      inline: {
        root: [
          "border-transparent bg-transparent",
          "transition-[border-color,box-shadow,background-color] duration-fast ease-out",
          "[&:not(:focus-within)]:hover:border-input",
          "[&:not(:focus-within)]:hover:bg-[var(--surface,var(--background))]",
        ],
        prefixLabel: "border-transparent bg-transparent",
      },
    },
    size: {
      sm: {
        root: "h-control-sm rounded-md gap-1.5 px-2.5 has-[>[data-slot=input-field]:first-child]:pl-3 has-[>[data-slot=input-floating]]:h-11 has-[>[data-slot=input-floating]:first-child]:pl-3",
        field: "py-0 text-sm pointer-coarse:text-base",
        adornment: "[&_svg:not([class*='size-'])]:size-[15px]",
        floatingField: "pt-3.5 text-sm pointer-coarse:text-base",
        floatingLabel: "text-sm peer-focus:-translate-y-[calc(50%+0.5625rem)] peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+0.5625rem)] peer-autofill:-translate-y-[calc(50%+0.5625rem)]",
        prefixLabel: "-ml-2.5 pl-2.5 pr-2.5 text-xs",
        suffixButton: "size-6 -mr-1.5 rounded-sm pointer-coarse:h-auto pointer-coarse:w-10 pointer-coarse:self-stretch pointer-coarse:-mr-2.5 pointer-coarse:not-last:mr-0",
      },
      md: {
        root: "h-control-md rounded-[calc(var(--radius)*0.875)] gap-2 px-3 has-[>[data-slot=input-field]:first-child]:pl-3.5 has-[>[data-slot=input-floating]]:h-12 has-[>[data-slot=input-floating]:first-child]:pl-3.5",
        field: "py-0 text-sm pointer-coarse:text-base",
        adornment: "[&_svg:not([class*='size-'])]:size-4",
        floatingField: "pt-4 text-sm pointer-coarse:text-base",
        floatingLabel: "text-sm peer-focus:-translate-y-[calc(50%+0.625rem)] peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+0.625rem)] peer-autofill:-translate-y-[calc(50%+0.625rem)]",
        prefixLabel: "-ml-3 pl-3 pr-3 text-sm",
        suffixButton: "size-7 -mr-2 rounded-[calc(var(--radius)*0.625)] pointer-coarse:h-auto pointer-coarse:w-10 pointer-coarse:self-stretch pointer-coarse:-mr-3 pointer-coarse:not-last:mr-0",
      },
      lg: {
        root: "h-control-lg rounded-lg gap-2 px-3.5 has-[>[data-slot=input-field]:first-child]:pl-4 has-[>[data-slot=input-floating]]:h-14 has-[>[data-slot=input-floating]:first-child]:pl-4",
        field: "py-0 text-sm pointer-coarse:text-base",
        adornment: "[&_svg:not([class*='size-'])]:size-[18px]",
        floatingField: "pt-5 text-base",
        floatingLabel: "text-base peer-focus:-translate-y-[calc(50%+0.75rem)] peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+0.75rem)] peer-autofill:-translate-y-[calc(50%+0.75rem)]",
        prefixLabel: "-ml-3.5 pl-3.5 pr-3.5 text-sm",
        suffixButton: "size-8 -mr-2 rounded-md pointer-coarse:h-auto pointer-coarse:w-10 pointer-coarse:self-stretch pointer-coarse:-mr-3.5 pointer-coarse:not-last:mr-0",
      },
    },
    hasError: {
      true: {
        root: [
          "border-destructive",
          "focus-within:border-destructive focus-within:destructive-ring",
        ],
        floatingLabel: "text-destructive",
      },
    },
    disabled: {
      true: {
        root: "opacity-50 pointer-events-none select-none",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

type Size = NonNullable<VariantProps<typeof inputVariants>["size"]>
type Variant = NonNullable<VariantProps<typeof inputVariants>["variant"]>

type InputContextValue = {
  size: Size
  variant: Variant
  disabled: boolean
  hasError: boolean
  slots: ReturnType<typeof inputVariants>
}

const [InputProvider, useInputContext] = createContext<InputContextValue>("Input")

export interface InputRootProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: Size
  variant?: Variant
  hasError?: boolean
  disabled?: boolean
  density?: Density
}

function InputRoot({
  size,
  variant = "default",
  hasError,
  disabled,
  density,
  className,
  children,
  ...props
}: InputRootProps) {
  const field = useFieldContext()
  const resolvedError = hasError ?? field?.hasError ?? false
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedSize = useControlSize(size, density)
  const slots = inputVariants({
    size: resolvedSize,
    variant,
    hasError: resolvedError,
    disabled: resolvedDisabled,
  })
  return (
    <InputProvider
      size={resolvedSize}
      variant={variant}
      disabled={resolvedDisabled}
      hasError={resolvedError}
      slots={slots}
    >
      <div
        data-slot="input-root"
        data-disabled={resolvedDisabled || undefined}
        data-error={resolvedError || undefined}
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </div>
    </InputProvider>
  )
}

export type InputFieldProps = Omit<React.ComponentProps<"input">, "size">

function InputField({
  className,
  disabled,
  id,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputFieldProps) {
  const { slots, disabled: ctxDisabled, hasError } = useInputContext("InputField")
  const field = useFieldContext()
  return (
    <input
      data-slot="input-field"
      id={id ?? field?.id}
      className={slots.field({ className })}
      disabled={disabled ?? ctxDisabled}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={hasError || field?.hasError || undefined}
      {...props}
    />
  )
}

export interface InputFloatingFieldProps extends InputFieldProps {
  label: React.ReactNode
  labelClassName?: string
}

function InputFloatingField({
  label,
  labelClassName,
  className,
  disabled,
  id,
  placeholder = " ",
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputFloatingFieldProps) {
  const { slots, disabled: ctxDisabled, hasError } = useInputContext("InputFloatingField")
  const field = useFieldContext()
  const fallbackId = React.useId()
  const inputId = id ?? field?.id ?? fallbackId
  return (
    <div data-slot="input-floating" className={slots.floating()}>
      <input
        data-slot="input-field"
        id={inputId}
        placeholder={placeholder}
        className={slots.floatingField({ className })}
        disabled={disabled ?? ctxDisabled}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-invalid={hasError || field?.hasError || undefined}
        {...props}
      />
      <label
        data-slot="input-floating-label"
        htmlFor={inputId}
        className={slots.floatingLabel({ className: labelClassName })}
      >
        {label}
      </label>
    </div>
  )
}

export type InputPrefixProps = React.ComponentPropsWithoutRef<"span">

function InputPrefix({ className, ...props }: InputPrefixProps) {
  const { slots } = useInputContext("InputPrefix")
  return (
    <span
      data-slot="input-prefix"
      aria-hidden="true"
      className={slots.adornment({ className })}
      {...props}
    />
  )
}

export type InputSuffixProps = React.ComponentPropsWithoutRef<"span">

function InputSuffix({ className, ...props }: InputSuffixProps) {
  const { slots } = useInputContext("InputSuffix")
  return (
    <span
      data-slot="input-suffix"
      aria-hidden="true"
      className={slots.adornment({ className })}
      {...props}
    />
  )
}

export type InputPrefixLabelProps = React.ComponentPropsWithoutRef<"span">

function InputPrefixLabel({ className, ...props }: InputPrefixLabelProps) {
  const { slots } = useInputContext("InputPrefixLabel")
  return (
    <span
      data-slot="input-prefix-label"
      className={slots.prefixLabel({ className })}
      {...props}
    />
  )
}

export type InputSuffixButtonProps = React.ComponentPropsWithoutRef<"button">

function InputSuffixButton({ className, ...props }: InputSuffixButtonProps) {
  const { slots } = useInputContext("InputSuffixButton")
  return (
    <button
      data-slot="input-suffix-button"
      type="button"
      className={slots.suffixButton({ className })}
      {...props}
    />
  )
}

export interface PasswordInputProps extends InputFieldProps {
  rootClassName?: string
  size?: Size
  variant?: Variant
  hasError?: boolean
  density?: Density
}

function PasswordInput({
  rootClassName,
  size,
  variant,
  hasError,
  disabled,
  density,
  className,
  ...fieldProps
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <InputRoot
      size={size}
      variant={variant}
      hasError={hasError}
      disabled={disabled}
      density={density}
      className={rootClassName}
    >
      <InputField
        type={visible ? "text" : "password"}
        className={className}
        {...fieldProps}
      />
      <InputSuffixButton
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
      >
        <span className="relative flex size-4 items-center justify-center">
          <Eye
            weight="bold"
            className={`absolute size-4 transition-[opacity,scale,filter] duration-fast ease-out ${visible ? "opacity-0 scale-[0.25] blur-[4px]" : "opacity-100 scale-100 blur-[0px]"}`}
            aria-hidden="true"
          />
          <EyeSlash
            weight="bold"
            className={`absolute size-4 transition-[opacity,scale,filter] duration-fast ease-out ${visible ? "opacity-100 scale-100 blur-[0px]" : "opacity-0 scale-[0.25] blur-[4px]"}`}
            aria-hidden="true"
          />
        </span>
      </InputSuffixButton>
    </InputRoot>
  )
}

export {
  InputRoot,
  InputField,
  InputFloatingField,
  InputPrefix,
  InputSuffix,
  InputPrefixLabel,
  InputSuffixButton,
  PasswordInput,
  inputVariants,
}

export {
  Label as InputLabel,
  Hint as InputHint,
  type LabelProps as InputLabelProps,
  type HintProps as InputHintProps,
} from "@/components/ui/label"
