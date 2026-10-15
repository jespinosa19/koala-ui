"use client"

import * as React from "react"

export type ValidationMode = "onSubmit" | "onBlur" | "onChange"

export type FormValues = Record<string, unknown>

export type ValidationResult = string | string[] | null | undefined

export type FormErrors = Record<string, string | string[] | null | undefined>

export interface FormFieldHandle {
  getRoot: () => HTMLElement | null
  getName: () => string | undefined
  getValue: () => unknown
  validate: () => boolean | Promise<boolean>
  focus: () => void
  shake: () => void
  reset: () => void
}

export interface FormContextValue {
  validationMode: ValidationMode
  validationDebounceTime: number
  nativeValidation: boolean
  submitAttempted: boolean
  errors: FormErrors
  clearError: (name: string) => void
  register: (field: FormFieldHandle) => () => void
  getValues: () => FormValues
}

const FormContext = React.createContext<FormContextValue | null>(null)
FormContext.displayName = "FormContext"

export const FormContextProvider = FormContext.Provider

export function useFormContext(): FormContextValue | null {
  return React.useContext(FormContext)
}

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const NON_VALUE_TYPES = new Set(["submit", "button", "reset", "image"])

export function fieldControls(root: HTMLElement): Control[] {
  return Array.from(root.querySelectorAll<Control>("input, select, textarea")).filter(
    (el) =>
      !(el instanceof HTMLInputElement && NON_VALUE_TYPES.has(el.type)) &&
      el.closest('[data-slot="field"]') === root,
  )
}

export function readFieldValue(root: HTMLElement): unknown {
  const controls = fieldControls(root)
  const first = controls[0]
  if (!first) return undefined
  if (first instanceof HTMLInputElement && (first.type === "checkbox" || first.type === "radio")) {
    const group = controls.filter(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.type === first.type,
    )
    if (first.type === "radio") return group.find((el) => el.checked)?.value ?? null
    if (group.length === 1) return first.checked
    return group.filter((el) => el.checked).map((el) => el.value)
  }
  if (first instanceof HTMLSelectElement && first.multiple) {
    return Array.from(first.selectedOptions, (option) => option.value)
  }
  if (first instanceof HTMLInputElement && first.type === "file") return Array.from(first.files ?? [])
  return first.value
}

export function readFormData(form: HTMLFormElement | null): FormValues {
  const values: FormValues = {}
  if (!form) return values
  for (const [key, value] of new FormData(form)) {
    const current = values[key]
    if (current === undefined) values[key] = value
    else values[key] = Array.isArray(current) ? [...current, value] : [current, value]
  }
  return values
}

export function toErrorList(result: ValidationResult): string[] {
  if (!result) return []
  return (Array.isArray(result) ? result : [result]).filter(Boolean)
}

export function inDocumentOrder<T extends { getRoot: () => HTMLElement | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ra = a.getRoot()
    const rb = b.getRoot()
    if (!ra || !rb) return 0
    return ra.compareDocumentPosition(rb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })
}
