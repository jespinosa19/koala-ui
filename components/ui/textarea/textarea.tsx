"use client"

import * as React from "react"
import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

const textareaVariants = tv({
  slots: {
    root: [
      "flex flex-col w-full overflow-hidden",
      "rounded-xl border border-input bg-[var(--surface,var(--background))]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "focus-within:outline-none focus-within:border-brand focus-within:brand-ring",
      "autofill-tint",
    ],
    field: [
      "w-full bg-transparent outline-none",
      "text-foreground placeholder:text-muted-foreground",
      "disabled:cursor-not-allowed",
      "autofill-clear",
    ],
    footer: [
      "flex shrink-0 items-center justify-between gap-2",
      "text-muted-foreground",
    ],
    count: "shrink-0 whitespace-nowrap tabular-nums select-none",
  },
  variants: {
    size: {
      sm: {
        field: "min-h-16 px-2.5 py-2 text-sm pointer-coarse:text-base",
        footer: "px-2.5 pb-2 text-xs",
        count: "text-xs",
      },
      md: {
        field: "min-h-20 px-3 py-2.5 text-sm pointer-coarse:text-base",
        footer: "px-3 pb-2.5 text-xs",
        count: "text-xs",
      },
      lg: {
        field: "min-h-24 px-3.5 py-3 text-sm pointer-coarse:text-base",
        footer: "px-3.5 pb-3 text-sm",
        count: "text-sm",
      },
    },
    resize: {
      none: { field: "resize-none" },
      vertical: { field: "resize-y" },
      horizontal: { field: "resize-x" },
      both: { field: "resize" },
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
      true: {
        root: "opacity-50 pointer-events-none select-none",
      },
    },
  },
  defaultVariants: {
    size: "md",
    resize: "vertical",
  },
})

type Size = NonNullable<VariantProps<typeof textareaVariants>["size"]>
type Resize = NonNullable<VariantProps<typeof textareaVariants>["resize"]>

type TextareaContextValue = {
  size: Size
  resize: Resize
  disabled: boolean
  hasError: boolean
  slots: ReturnType<typeof textareaVariants>
}

const [TextareaProvider, useTextareaContext] =
  createContext<TextareaContextValue>("Textarea")

export interface TextareaRootProps
  extends React.ComponentPropsWithoutRef<"div"> {
  size?: Size
  density?: Density
  resize?: Resize
  hasError?: boolean
  disabled?: boolean
}

function TextareaRoot({
  size,
  density,
  resize = "vertical",
  hasError,
  disabled,
  className,
  children,
  ...props
}: TextareaRootProps) {
  const field = useFieldContext()
  const resolvedError = hasError ?? field?.hasError ?? false
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedSize = useControlSize(size, density)
  const slots = textareaVariants({
    size: resolvedSize,
    resize,
    hasError: resolvedError,
    disabled: resolvedDisabled,
  })
  return (
    <TextareaProvider
      size={resolvedSize}
      resize={resize}
      disabled={resolvedDisabled}
      hasError={resolvedError}
      slots={slots}
    >
      <div
        data-slot="textarea-root"
        data-disabled={resolvedDisabled || undefined}
        data-error={resolvedError || undefined}
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </div>
    </TextareaProvider>
  )
}

let fieldSizingSupported: boolean | null = null
function supportsFieldSizing() {
  if (fieldSizingSupported === null) {
    fieldSizingSupported =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("field-sizing", "content")
  }
  return fieldSizingSupported
}

function autoSize(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}

export interface TextareaFieldProps
  extends Omit<React.ComponentProps<"textarea">, "size"> {
  autoResize?: boolean
  showCount?: boolean
}

function TextareaField({
  className,
  disabled,
  autoResize,
  showCount,
  id,
  ref,
  value,
  defaultValue,
  onInput,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaFieldProps) {
  const { slots, disabled: ctxDisabled, hasError } =
    useTextareaContext("TextareaField")
  const field = useFieldContext()

  const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
  const fallbackActive = autoResize && !supportsFieldSizing()

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      if (node && fallbackActive) autoSize(node)
    },
    [ref, fallbackActive],
  )

  React.useEffect(() => {
    if (fallbackActive && innerRef.current) autoSize(innerRef.current)
  }, [fallbackActive, value])

  const isControlled = value !== undefined
  const [uncontrolledCount, setUncontrolledCount] = React.useState(
    () => String(defaultValue ?? "").length,
  )
  const count = isControlled ? String(value ?? "").length : uncontrolledCount

  const handleInput: NonNullable<TextareaFieldProps["onInput"]> = (event) => {
    if (fallbackActive) autoSize(event.currentTarget)
    if (showCount && !isControlled) setUncontrolledCount(event.currentTarget.value.length)
    onInput?.(event)
  }

  const autoClasses = autoResize ? "field-sizing-content resize-none" : ""
  const textarea = (
    <textarea
      data-slot="textarea-field"
      ref={setRefs}
      id={id ?? field?.id}
      value={value}
      defaultValue={defaultValue}
      onInput={handleInput}
      className={slots.field({
        className: `${autoClasses} ${className ?? ""}`.trim() || undefined,
      })}
      disabled={disabled ?? ctxDisabled}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={hasError || field?.hasError || undefined}
      {...props}
    />
  )

  if (!showCount) return textarea
  return (
    <>
      {textarea}
      <TextareaFooter>
        <TextareaCount current={count} max={props.maxLength} />
      </TextareaFooter>
    </>
  )
}

export type TextareaFooterProps = React.ComponentPropsWithoutRef<"div">

function TextareaFooter({ className, ...props }: TextareaFooterProps) {
  const { slots } = useTextareaContext("TextareaFooter")
  return (
    <div
      data-slot="textarea-footer"
      className={slots.footer({ className })}
      {...props}
    />
  )
}

export interface TextareaCountProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  current: number
  max?: number
}

function TextareaCount({ current, max, className, ...props }: TextareaCountProps) {
  const { slots } = useTextareaContext("TextareaCount")
  const over = max != null && current > max
  return (
    <span
      data-slot="textarea-count"
      data-over={over || undefined}
      aria-live="polite"
      className={slots.count({
        className: `${over ? "text-destructive" : ""} ${className ?? ""}`.trim(),
      })}
      {...props}
    >
      {current}
      {max != null ? ` / ${max}` : null}
    </span>
  )
}

export {
  TextareaRoot,
  TextareaField,
  TextareaFooter,
  TextareaCount,
  textareaVariants,
}

export {
  Label as TextareaLabel,
  Hint as TextareaHint,
  type LabelProps as TextareaLabelProps,
  type HintProps as TextareaHintProps,
} from "@/components/ui/label"
