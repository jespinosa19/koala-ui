"use client"

import * as React from "react"

import { tv } from "@/lib/tv"
import { prefersReducedMotion } from "@/lib/motion"
import { FieldContextProvider } from "@/lib/field-context"
import { FieldGroupContextProvider, useFieldGroupContext } from "@/lib/field-group-context"
import {
  fieldControls,
  readFieldValue,
  readFormData,
  toErrorList,
  useFormContext,
  type FormFieldHandle,
  type FormValues,
  type ValidationMode,
  type ValidationResult,
} from "@/lib/form-context"
import { labelVariants } from "@/components/ui/label"

const fieldVariants = tv({
  base: [
    "flex w-full flex-col gap-1.5",
    "[&:has(>[data-slot=field-error])>[data-slot=hint]]:hidden",
  ],
})

export type FieldValidityKey =
  | "badInput"
  | "customError"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "tooLong"
  | "tooShort"
  | "typeMismatch"
  | "valueMissing"

const VALIDITY_KEYS: readonly FieldValidityKey[] = [
  "badInput",
  "customError",
  "patternMismatch",
  "rangeOverflow",
  "rangeUnderflow",
  "stepMismatch",
  "tooLong",
  "tooShort",
  "typeMismatch",
  "valueMissing",
]

export type FieldValidity = Record<FieldValidityKey, boolean> & { valid: boolean }

const VALID: FieldValidity = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true,
}

function snapshotValidity(state: ValidityState): FieldValidity {
  const copy = { ...VALID, valid: state.valid }
  for (const key of VALIDITY_KEYS) copy[key] = state[key]
  return copy
}

const FALLBACK_MESSAGES: Partial<Record<FieldValidityKey, string>> = {
  valueMissing: "Fill out this field.",
  typeMismatch: "Enter a valid value.",
  patternMismatch: "Match the requested format.",
  tooShort: "This is too short.",
  tooLong: "This is too long.",
  rangeUnderflow: "This value is too low.",
  rangeOverflow: "This value is too high.",
  stepMismatch: "Enter a valid value.",
  badInput: "Enter a valid value.",
}

function fallbackMessage(validity: FieldValidity) {
  const key = VALIDITY_KEYS.find((k) => validity[k])
  return (key && FALLBACK_MESSAGES[key]) || "Enter a valid value."
}

function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return typeof (value as PromiseLike<T> | null)?.then === "function"
}

function isFilled(value: unknown) {
  if (value == null) return false
  if (typeof value === "string") return value.length > 0
  if (typeof value === "boolean") return value
  if (Array.isArray(value)) return value.length > 0
  return true
}

function serialize(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const SHAKE_A = "animate-shake-a"
const SHAKE_B = "animate-shake-b"
const SKIP_SHAKE = new Set(["label", "hint", "field-error"])
const FOCUSABLE = [
  'input:not([type="hidden"]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'textarea:not([tabindex="-1"])',
  'select:not([aria-hidden="true"]):not([tabindex="-1"])',
  'button:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

function reducedMotion() {
  try {
    return prefersReducedMotion()
  } catch {
    return false
  }
}

interface FieldErrorContextValue {
  invalid: boolean
  messages: string[]
  validity: FieldValidity
  registerPart: () => () => void
  registerShown: (id: string) => () => void
}

const FieldErrorContext = React.createContext<FieldErrorContextValue | null>(null)
FieldErrorContext.displayName = "FieldErrorContext"

export interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  hasError?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  validate?: (
    value: unknown,
    formValues: FormValues,
  ) => ValidationResult | Promise<ValidationResult>
  validationMode?: ValidationMode
  validationDebounceTime?: number
}

interface FieldResult {
  validated: boolean
  validity: FieldValidity
  errors: string[]
}

const PRISTINE: FieldResult = { validated: false, validity: VALID, errors: [] }

function Field({
  hasError,
  disabled = false,
  required = false,
  name: nameProp,
  validate,
  validationMode: modeProp,
  validationDebounceTime: debounceProp,
  className,
  children,
  onFocus,
  onBlur,
  onChange,
  ...props
}: FieldProps) {
  const id = React.useId()
  const labelId = React.useId()
  const hintId = React.useId()
  const autoErrorId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)

  const form = useFormContext()
  const mode = modeProp ?? form?.validationMode ?? "onSubmit"
  const debounce = debounceProp ?? form?.validationDebounceTime ?? 0
  const nativeValidation = form?.nativeValidation ?? true

  const [hasHint, setHasHint] = React.useState(false)
  const registerHint = React.useCallback(() => {
    setHasHint(true)
    return () => setHasHint(false)
  }, [])

  const [hasLabel, setHasLabel] = React.useState(false)
  const registerLabel = React.useCallback(() => {
    setHasLabel(true)
    return () => setHasLabel(false)
  }, [])
  const labelledBy = hasLabel ? labelId : undefined

  const [errorParts, setErrorParts] = React.useState(0)
  const registerPart = React.useCallback(() => {
    setErrorParts((n) => n + 1)
    return () => setErrorParts((n) => n - 1)
  }, [])
  const [shownErrorIds, setShownErrorIds] = React.useState<string[]>([])
  const registerShown = React.useCallback((errorId: string) => {
    setShownErrorIds((ids) => [...ids, errorId])
    return () => setShownErrorIds((ids) => ids.filter((x) => x !== errorId))
  }, [])

  const [result, setResult] = React.useState<FieldResult>(PRISTINE)
  const [validating, setValidating] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [filled, setFilled] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [shakeTick, setShakeTick] = React.useState(0)
  const [controlName, setControlName] = React.useState<string | undefined>(undefined)
  const initialValue = React.useRef<string | undefined>(undefined)
  const token = React.useRef(0)
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const blurTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const getName = React.useCallback(() => {
    if (nameProp) return nameProp
    const root = rootRef.current
    return root ? fieldControls(root).find((el) => el.name)?.name || undefined : undefined
  }, [nameProp])

  const getValue = React.useCallback(() => {
    const root = rootRef.current
    return root ? readFieldValue(root) : undefined
  }, [])

  const runValidation = React.useCallback((): boolean | Promise<boolean> => {
    const root = rootRef.current
    if (!root || disabled) return true
    const current = ++token.current
    window.clearTimeout(debounceTimer.current)
    const controls = fieldControls(root).filter((el) => el.willValidate)
    for (const control of controls) control.setCustomValidity("")

    if (nativeValidation) {
      const failing = controls.find((el) => !el.validity.valid)
      if (failing) {
        const validity = snapshotValidity(failing.validity)
        setValidating(false)
        setResult({
          validated: true,
          validity,
          errors: [failing.validationMessage || fallbackMessage(validity)],
        })
        return false
      }
    }

    const settle = (out: ValidationResult): boolean => {
      const errors = toErrorList(out)
      if (current !== token.current) return errors.length === 0
      if (errors.length) controls[0]?.setCustomValidity(errors[0])
      setValidating(false)
      setResult({
        validated: true,
        validity: errors.length ? { ...VALID, customError: true, valid: false } : VALID,
        errors,
      })
      return errors.length === 0
    }

    if (!validate) return settle(null)
    const values = form ? form.getValues() : readFormData(root.closest("form"))
    const out = validate(readFieldValue(root), values)
    if (isThenable<ValidationResult>(out)) {
      setValidating(true)
      return Promise.resolve(out).then(settle, () => settle(null))
    }
    return settle(out)
  }, [disabled, nativeValidation, validate, form])

  const scheduleValidation = React.useCallback(() => {
    window.clearTimeout(debounceTimer.current)
    if (debounce > 0) {
      debounceTimer.current = setTimeout(() => void runValidation(), debounce)
    } else {
      void runValidation()
    }
  }, [debounce, runValidation])

  const reset = React.useCallback(() => {
    token.current++
    window.clearTimeout(debounceTimer.current)
    setResult(PRISTINE)
    setValidating(false)
    setTouched(false)
    setDirty(false)
    setTimeout(() => {
      const root = rootRef.current
      if (!root) return
      const value = readFieldValue(root)
      initialValue.current = serialize(value)
      setFilled(isFilled(value))
    })
  }, [])

  const focusControl = React.useCallback(() => {
    rootRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
  }, [])

  const shake = React.useCallback(() => setShakeTick((n) => n + 1), [])

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getRoot: () => rootRef.current,
      getName,
      getValue,
      validate: runValidation,
      focus: focusControl,
      shake,
      reset,
    }),
    [getName, getValue, runValidation, focusControl, shake, reset],
  )
  const register = form?.register
  React.useEffect(() => register?.(handle), [register, handle])

  React.useEffect(() => {
    function readInitial() {
      const root = rootRef.current
      if (!root) return
      const value = readFieldValue(root)
      initialValue.current = serialize(value)
      setFilled(isFilled(value))
      setControlName(fieldControls(root).find((el) => el.name)?.name || undefined)
    }
    readInitial()
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onInvalid = () => void runValidation()
    root.addEventListener("invalid", onInvalid, true)
    return () => root.removeEventListener("invalid", onInvalid, true)
  }, [runValidation])

  React.useEffect(
    () => () => {
      window.clearTimeout(debounceTimer.current)
      window.clearTimeout(blurTimer.current)
    },
    [],
  )

  React.useEffect(() => {
    if (shakeTick === 0 || reducedMotion()) return
    const root = rootRef.current
    if (!root) return
    for (const el of Array.from(root.children) as HTMLElement[]) {
      if (SKIP_SHAKE.has(el.dataset.slot ?? "")) continue
      const next = el.classList.contains(SHAKE_A) ? SHAKE_B : SHAKE_A
      el.classList.remove(SHAKE_A, SHAKE_B)
      el.classList.add(next)
      el.addEventListener("animationend", () => el.classList.remove(next), { once: true })
    }
  }, [shakeTick])

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event)
    window.clearTimeout(blurTimer.current)
    setFocused(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event)
    window.clearTimeout(blurTimer.current)
    blurTimer.current = setTimeout(() => {
      const root = rootRef.current
      if (root && root.contains(document.activeElement)) return
      setFocused(false)
      setTouched(true)
      if (mode === "onBlur") void runValidation()
    })
  }

  const handleChange = (event: Parameters<NonNullable<FieldProps["onChange"]>>[0]) => {
    onChange?.(event)
    const root = rootRef.current
    if (!root) return
    const value = readFieldValue(root)
    setFilled(isFilled(value))
    setDirty(serialize(value) !== initialValue.current)
    const name = getName()
    if (name && form?.errors[name] != null) form.clearError(name)
    const invalidNow = result.validated && !result.validity.valid
    if (mode === "onChange" || invalidNow || (mode === "onSubmit" && form?.submitAttempted)) {
      scheduleValidation()
    }
  }

  const name = nameProp ?? controlName
  const serverEntry = form && name ? form.errors[name] : undefined
  const { messages, validity, computedInvalid } = React.useMemo(() => {
    const serverErrors = toErrorList(serverEntry)
    const ownInvalid = result.validated && !result.validity.valid
    return {
      messages: ownInvalid ? result.errors : serverErrors,
      computedInvalid: ownInvalid || serverErrors.length > 0,
      validity: ownInvalid
        ? result.validity
        : serverErrors.length
          ? { ...VALID, customError: true, valid: false }
          : VALID,
    }
  }, [result, serverEntry])
  const invalid = hasError ?? computedInvalid

  const autoError = hasError === undefined && errorParts === 0 && computedInvalid && messages.length > 0
  const errorIds = autoError ? [autoErrorId] : shownErrorIds
  const describedBy = errorIds.length ? errorIds.join(" ") : hasHint ? hintId : undefined

  const context = React.useMemo(
    () => ({
      id,
      labelId,
      labelledBy,
      registerLabel,
      hintId,
      describedBy,
      registerHint,
      hasError: invalid,
      disabled,
      required,
    }),
    [id, labelId, labelledBy, registerLabel, hintId, describedBy, registerHint, invalid, disabled, required],
  )

  const errorContext = React.useMemo<FieldErrorContextValue>(
    () => ({ invalid, messages, validity, registerPart, registerShown }),
    [invalid, messages, validity, registerPart, registerShown],
  )

  return (
    <FieldContextProvider value={context}>
      <FieldErrorContext.Provider value={errorContext}>
        <div
          ref={rootRef}
          data-slot="field"
          data-error={invalid || undefined}
          data-invalid={invalid || undefined}
          data-valid={(!invalid && result.validated) || undefined}
          data-validating={validating || undefined}
          data-touched={touched || undefined}
          data-dirty={dirty || undefined}
          data-filled={filled || undefined}
          data-focused={focused || undefined}
          data-disabled={disabled || undefined}
          className={fieldVariants({ className })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        >
          {children}
          {autoError ? <FieldErrorText id={autoErrorId}>{renderMessages(messages)}</FieldErrorText> : null}
        </div>
      </FieldErrorContext.Provider>
    </FieldContextProvider>
  )
}

function renderMessages(messages: string[]) {
  if (messages.length < 2) return messages[0]
  return messages.map((message) => (
    <span key={message} className="block">
      {message}
    </span>
  ))
}

function FieldErrorText({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="field-error"
      className={labelVariants({ hasError: true }).hint({ className })}
      {...props}
    />
  )
}

export interface FieldErrorProps extends React.ComponentPropsWithoutRef<"p"> {
  match?: FieldValidityKey | boolean
}

function FieldError({ match, children, id, ...props }: FieldErrorProps) {
  const ctx = React.useContext(FieldErrorContext)
  const generatedId = React.useId()
  const errorId = id ?? generatedId

  const shown =
    ctx !== null &&
    (match === true
      ? true
      : match === false
        ? false
        : match
          ? ctx.invalid && ctx.validity[match]
          : ctx.invalid && (children != null || ctx.messages.length > 0))

  const registerPart = ctx?.registerPart
  const registerShown = ctx?.registerShown
  React.useEffect(() => registerPart?.(), [registerPart])
  React.useEffect(
    () => (shown ? registerShown?.(errorId) : undefined),
    [shown, registerShown, errorId],
  )

  if (!shown) return null
  return (
    <FieldErrorText id={errorId} {...props}>
      {children ?? renderMessages(ctx.messages)}
    </FieldErrorText>
  )
}

const fieldGroupVariants = tv({
  slots: {
    root: [
      "w-full min-w-0 space-y-1.5",
      "[&:disabled_[data-slot=label]]:opacity-50",
    ],
    legend: "",
  },
})

export interface FieldGroupProps extends React.ComponentPropsWithoutRef<"fieldset"> {
  hasError?: boolean
  disabled?: boolean
  required?: boolean
}

function FieldGroup({
  hasError = false,
  disabled = false,
  required = false,
  className,
  children,
  ...props
}: FieldGroupProps) {
  const hintId = React.useId()

  const [hasHint, setHasHint] = React.useState(false)
  const registerHint = React.useCallback(() => {
    setHasHint(true)
    return () => setHasHint(false)
  }, [])
  const describedBy = hasHint ? hintId : undefined

  const context = React.useMemo(
    () => ({ hintId, describedBy, registerHint, hasError, disabled, required }),
    [hintId, describedBy, registerHint, hasError, disabled, required],
  )

  return (
    <FieldGroupContextProvider value={context}>
      <fieldset
        data-slot="field-group"
        data-error={hasError || undefined}
        disabled={disabled || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={fieldGroupVariants().root({ className })}
        {...props}
      >
        {children}
      </fieldset>
    </FieldGroupContextProvider>
  )
}

export interface FieldGroupLabelProps extends React.ComponentPropsWithoutRef<"legend"> {
  required?: boolean
}

function FieldGroupLabel({ className, children, required, ...props }: FieldGroupLabelProps) {
  const group = useFieldGroupContext()
  const resolvedRequired = required ?? group?.required ?? false
  const { root, requiredMark } = labelVariants({ disabled: group?.disabled ?? false })

  return (
    <legend data-slot="field-group-label" className={root({ className })} {...props}>
      {children}
      {resolvedRequired ? (
        <>
          <span aria-hidden="true" className={requiredMark()}>
            *
          </span>
          <span className="sr-only">(required)</span>
        </>
      ) : null}
    </legend>
  )
}

export interface FieldRowProps extends React.ComponentPropsWithoutRef<"div"> {
  columns?: 2 | 3
}

function FieldRow({ className, columns, ...props }: FieldRowProps) {
  return (
    <div
      data-slot="field-row"
      className={fieldRowVariants({ columns, className })}
      {...props}
    />
  )
}

const fieldRowVariants = tv({
  base: "grid grid-cols-1 gap-x-4 gap-y-5",
  variants: {
    columns: {
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
    },
  },
  defaultVariants: {
    columns: 2,
  },
})

export { Field, FieldError, FieldGroup, FieldGroupLabel, FieldRow, fieldVariants, fieldGroupVariants }

export {
  Label as FieldLabel,
  Hint as FieldHint,
  type LabelProps as FieldLabelProps,
  type HintProps as FieldHintProps,
} from "@/components/ui/label"
