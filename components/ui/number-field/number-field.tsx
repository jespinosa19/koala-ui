"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ArrowsHorizontal, ArrowsVertical, Minus, Plus } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, type ControlSize } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"
import {
  InputRoot,
  InputField,
  InputSuffixButton,
  type InputRootProps,
  type InputFieldProps,
  type InputSuffixButtonProps,
} from "@/components/ui/input"

export const numberFieldVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-1.5",
    input: "tabular-nums",
    button: [
      "active:scale-100 select-none touch-manipulation",
      "disabled:pointer-events-none disabled:opacity-40",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    ],
    scrubArea: [
      "inline-flex w-fit select-none touch-none",
      "[&_*]:cursor-[inherit]",
      "data-[disabled]:pointer-events-none",
    ],
    scrubCursor: [
      "pointer-events-none fixed top-0 left-0 z-50 flex -translate-x-1/2 -translate-y-1/2",
      "text-foreground drop-shadow-xs [&_svg]:size-5",
    ],
  },
  variants: {
    size: {
      sm: { button: "first:-ml-1.5 not-last:mr-0 [&_svg:not([class*='size-'])]:size-3" },
      md: { button: "first:-ml-2 not-last:mr-0 [&_svg:not([class*='size-'])]:size-3.5" },
      lg: { button: "first:-ml-2 not-last:mr-0 [&_svg:not([class*='size-'])]:size-4" },
    },
    direction: {
      horizontal: { scrubArea: "cursor-ew-resize" },
      vertical: { scrubArea: "cursor-ns-resize" },
    },
  },
  defaultVariants: { size: "md", direction: "horizontal" },
})

const HOLD_DELAY = 400
const HOLD_INTERVAL = 60

const subscribeNever = () => () => {}
const SERVER_LOCALE = "en-US"
const runtimeLocale = () => new Intl.NumberFormat().resolvedOptions().locale

function useLocale(locale?: string): string {
  const runtime = React.useSyncExternalStore(subscribeNever, runtimeLocale, () => SERVER_LOCALE)
  return locale ?? runtime
}

function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0
  const [mantissa, exponent] = String(n).toLowerCase().split("e")
  const dot = mantissa.indexOf(".")
  const places = dot === -1 ? 0 : mantissa.length - dot - 1
  return Math.max(0, places - Number(exponent ?? 0))
}

function roundTo(n: number, decimals: number): number {
  const factor = 10 ** Math.min(decimals, 15)
  return Math.round(n * factor) / factor
}

function clamp(n: number, min: number | undefined, max: number | undefined): number {
  if (min != null && n < min) return min
  if (max != null && n > max) return max
  return n
}

function resolveFormat(
  format: Intl.NumberFormatOptions | undefined,
  steps: number[],
): Intl.NumberFormatOptions {
  const options = { ...format }
  if ((options.style ?? "decimal") === "decimal" && options.maximumFractionDigits == null) {
    const needed = Math.max(3, ...steps.map(decimalsOf))
    options.maximumFractionDigits = Math.max(needed, options.minimumFractionDigits ?? 0)
  }
  return options
}

interface NumberCodec {
  format: (n: number) => string
  parse: (text: string) => number | null | undefined
  accepts: (text: string) => boolean
  fractionDigits: number
  inputMode: "decimal" | "numeric"
}

function createCodec(locale: string, options: Intl.NumberFormatOptions): NumberCodec {
  const formatter = new Intl.NumberFormat(locale, options)
  const resolved = formatter.resolvedOptions()
  const percent = resolved.style === "percent"

  const separators = new Intl.NumberFormat(locale).formatToParts(12345.6)
  const group = separators.find((p) => p.type === "group")?.value ?? ","
  const decimal = separators.find((p) => p.type === "decimal")?.value ?? "."

  const digitFormatter = new Intl.NumberFormat(locale, { useGrouping: false })
  const digits = new Map<string, string>()
  for (let i = 0; i <= 9; i++) digits.set(digitFormatter.format(i), String(i))

  const allowed = new Set<string>([..."0123456789.,-+()%−", group, decimal, ...digits.keys()])
  for (const part of formatter.formatToParts(-1234.5)) {
    if (part.type !== "integer" && part.type !== "fraction") for (const ch of part.value) allowed.add(ch)
  }

  const fractionDigits = (resolved.maximumFractionDigits ?? 3) + (percent ? 2 : 0)

  return {
    format: (n) => formatter.format(n),
    fractionDigits,
    inputMode: fractionDigits > 0 ? "decimal" : "numeric",
    accepts: (text) => [...text].every((ch) => allowed.has(ch) || /\s/.test(ch)),
    parse: (text) => {
      let s = [...text.trim()].map((ch) => digits.get(ch) ?? ch).join("")
      if (s === "") return null
      const negative = /[-−(]/.test(s)
      s = s.replace(/\s/g, "").split(group).join("")
      if (decimal === ",") {
        if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".")
        else if (!/^[^.]*\.\d{3}$/.test(s.replace(/[^\d.]/g, ""))) s = s.replace(/\.(?=.*\.)/g, "")
        else s = s.replace(/\./g, "")
      } else {
        s = s.replace(/,/g, "")
        if (decimal !== ".") s = s.split(decimal).join(".")
      }
      s = s.replace(/[^\d.]/g, "")
      if (s === "" || s === "." || s.split(".").length > 2) return undefined
      let n = Number(s)
      if (!Number.isFinite(n)) return undefined
      if (negative) n = -n
      if (percent) n = roundTo(n / 100, fractionDigits)
      return n
    },
  }
}

function isWebKit(): boolean {
  return typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent)
}

interface StepModifiers {
  shiftKey?: boolean
  altKey?: boolean
}

interface NumberFieldContextValue {
  value: number | null
  inputValue: string
  inputId: string
  cursorId: string
  min: number | undefined
  max: number | undefined
  disabled: boolean
  readOnly: boolean
  required: boolean
  allowWheelScrub: boolean
  inputMode: "decimal" | "numeric"
  scrubbing: boolean
  setScrubbing: (scrubbing: boolean) => void
  onType: (text: string) => void
  settle: () => void
  stepBy: (direction: 1 | -1, modifiers?: StepModifiers, count?: number) => void
  setToBound: (bound: "min" | "max") => void
  commit: () => void
  slots: ReturnType<typeof numberFieldVariants>
}

const [NumberFieldProvider, useNumberFieldContext] =
  createContext<NumberFieldContextValue>("NumberField")

const [NumberFieldGroupProvider, useNumberFieldGroupContext] =
  createContext<{ size: ControlSize }>("NumberFieldGroup")

interface ScrubAreaContextValue {
  direction: "horizontal" | "vertical"
  lockedAt: { x: number; y: number } | null
}

const [ScrubAreaProvider, useScrubAreaContext] = createContext<ScrubAreaContextValue>("NumberFieldScrubArea")

export interface NumberFieldProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  onValueCommitted?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  smallStep?: number
  largeStep?: number
  format?: Intl.NumberFormatOptions
  locale?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  allowWheelScrub?: boolean
}

function NumberField({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onValueCommitted,
  min,
  max,
  step = 1,
  smallStep = 0.1,
  largeStep = 10,
  format,
  locale: localeProp,
  disabled,
  readOnly = false,
  required,
  name,
  id,
  allowWheelScrub = false,
  className,
  children,
  ...props
}: NumberFieldProps) {
  const field = useFieldContext()
  const generatedId = React.useId()
  const inputId = id ?? field?.id ?? generatedId
  const cursorId = React.useId()
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required ?? false

  const locale = useLocale(localeProp)
  const formatKey = JSON.stringify(format ?? null)
  const codec = React.useMemo(
    () => createCodec(locale, resolveFormat(JSON.parse(formatKey) ?? undefined, [step, smallStep])),
    [locale, formatKey, step, smallStep],
  )

  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<number | null>(defaultValue)
  const value = isControlled ? valueProp : uncontrolled
  const valueRef = React.useRef(value)
  React.useEffect(() => {
    valueRef.current = value
  })

  const setValue = React.useCallback(
    (next: number | null) => {
      if (Object.is(next, valueRef.current)) return
      valueRef.current = next
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const commit = React.useCallback(() => onValueCommitted?.(valueRef.current), [onValueCommitted])

  const [typed, setTyped] = React.useState<string | null>(null)
  const inputValue = typed ?? (value == null ? "" : codec.format(value))

  const onType = React.useCallback(
    (text: string) => {
      if (!codec.accepts(text)) return
      setTyped(text)
      const parsed = codec.parse(text)
      if (parsed !== undefined) setValue(parsed)
    },
    [codec, setValue],
  )

  const settle = React.useCallback(() => {
    if (typed === null) return
    const parsed = codec.parse(typed)
    let next = parsed === undefined ? valueRef.current : parsed
    if (next != null) next = clamp(roundTo(next, codec.fractionDigits), min, max)
    setTyped(null)
    setValue(next)
    commit()
  }, [typed, codec, min, max, setValue, commit])

  const locked = resolvedDisabled || readOnly

  const stepBy = React.useCallback(
    (direction: 1 | -1, modifiers?: StepModifiers, count = 1) => {
      if (locked) return
      const amount = modifiers?.shiftKey ? largeStep : modifiers?.altKey ? smallStep : step
      const current = valueRef.current
      const next =
        current == null
          ? clamp(0, min, max)
          : clamp(
              roundTo(current + direction * amount * count, Math.max(decimalsOf(amount), decimalsOf(current))),
              min,
              max,
            )
      setTyped(null)
      setValue(next)
    },
    [locked, largeStep, smallStep, step, min, max, setValue],
  )

  const setToBound = React.useCallback(
    (bound: "min" | "max") => {
      const target = bound === "min" ? min : max
      if (locked || target == null) return
      setTyped(null)
      setValue(target)
    },
    [locked, min, max, setValue],
  )

  const [scrubbing, setScrubbing] = React.useState(false)
  const slots = numberFieldVariants()

  return (
    <NumberFieldProvider
      value={value}
      inputValue={inputValue}
      inputId={inputId}
      cursorId={cursorId}
      min={min}
      max={max}
      disabled={resolvedDisabled}
      readOnly={readOnly}
      required={resolvedRequired}
      allowWheelScrub={allowWheelScrub}
      inputMode={codec.inputMode}
      scrubbing={scrubbing}
      setScrubbing={setScrubbing}
      onType={onType}
      settle={settle}
      stepBy={stepBy}
      setToBound={setToBound}
      commit={commit}
      slots={slots}
    >
      <div
        data-slot="number-field"
        data-disabled={resolvedDisabled || undefined}
        data-readonly={readOnly || undefined}
        data-required={resolvedRequired || undefined}
        data-scrubbing={scrubbing || undefined}
        className={slots.root({ className })}
        {...props}
      >
        {children}
        {name && <input type="hidden" name={name} value={value ?? ""} disabled={resolvedDisabled} />}
      </div>
    </NumberFieldProvider>
  )
}

export type NumberFieldGroupProps = InputRootProps

function NumberFieldGroup({ size, density, disabled, ...props }: NumberFieldGroupProps) {
  const ctx = useNumberFieldContext("NumberFieldGroup")
  const resolvedSize = useControlSize(size, density)
  return (
    <NumberFieldGroupProvider size={resolvedSize}>
      <InputRoot
        size={resolvedSize}
        disabled={disabled ?? ctx.disabled}
        data-scrubbing={ctx.scrubbing || undefined}
        {...props}
      />
    </NumberFieldGroupProvider>
  )
}

export type NumberFieldInputProps = Omit<
  InputFieldProps,
  "value" | "defaultValue" | "type" | "min" | "max" | "step"
>

function NumberFieldInput({ className, onChange, onBlur, onKeyDown, ...props }: NumberFieldInputProps) {
  const ctx = useNumberFieldContext("NumberFieldInput")

  const wheelRef = React.useRef<(event: WheelEvent) => void>(() => {})
  React.useEffect(() => {
    wheelRef.current = (event) => {
      const input = event.currentTarget as HTMLInputElement
      if (!ctx.allowWheelScrub || document.activeElement !== input || event.deltaY === 0) return
      event.preventDefault()
      ctx.stepBy(event.deltaY < 0 ? 1 : -1, event)
      ctx.commit()
    }
  })
  React.useEffect(() => {
    const input = document.getElementById(ctx.inputId)
    if (!input) return
    const listener = (event: WheelEvent) => wheelRef.current(event)
    input.addEventListener("wheel", listener, { passive: false })
    return () => input.removeEventListener("wheel", listener)
  }, [ctx.inputId])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || ctx.readOnly) return
    const { key } = event
    if (key === "ArrowUp" || key === "ArrowDown") {
      ctx.stepBy(key === "ArrowUp" ? 1 : -1, event)
    } else if (key === "PageUp" || key === "PageDown") {
      ctx.stepBy(key === "PageUp" ? 1 : -1, { shiftKey: true })
    } else if ((key === "Home" && ctx.min != null) || (key === "End" && ctx.max != null)) {
      ctx.setToBound(key === "Home" ? "min" : "max")
    } else if (key === "Enter") {
      ctx.settle()
      return
    } else {
      return
    }
    event.preventDefault()
    ctx.commit()
  }

  return (
    <InputField
      id={ctx.inputId}
      type="text"
      role="spinbutton"
      inputMode={ctx.inputMode}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-valuenow={ctx.value ?? undefined}
      aria-valuemin={ctx.min}
      aria-valuemax={ctx.max}
      aria-valuetext={ctx.value != null ? ctx.inputValue : undefined}
      required={ctx.required}
      readOnly={ctx.readOnly}
      disabled={ctx.disabled}
      className={ctx.slots.input({ className })}
      {...props}
      value={ctx.inputValue}
      onChange={(event) => {
        onChange?.(event)
        if (!event.defaultPrevented) ctx.onType(event.target.value)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        ctx.settle()
      }}
      onKeyDown={handleKeyDown}
    />
  )
}

export type NumberFieldStepperProps = InputSuffixButtonProps

function useStepper(direction: 1 | -1, consumer: string) {
  const ctx = useNumberFieldContext(consumer)
  const { size } = useNumberFieldGroupContext(consumer)
  const bound = direction === 1 ? ctx.max : ctx.min
  const atBound = bound != null && ctx.value != null && (direction === 1 ? ctx.value >= bound : ctx.value <= bound)
  const disabled = ctx.disabled || ctx.readOnly || atBound

  const timers = React.useRef<{ timeout?: number; interval?: number; held?: boolean }>({})
  const pressedByPointer = React.useRef(false)

  const stop = React.useCallback(() => {
    window.clearTimeout(timers.current.timeout)
    window.clearInterval(timers.current.interval)
    const held = timers.current.held
    timers.current = {}
    if (held) ctx.commit()
  }, [ctx])

  React.useEffect(() => {
    if (disabled) stop()
  }, [disabled, stop])
  React.useEffect(() => () => {
    window.clearTimeout(timers.current.timeout)
    window.clearInterval(timers.current.interval)
  }, [])

  const handlers = {
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || disabled) return
      event.preventDefault()
      pressedByPointer.current = true
      const modifiers = { shiftKey: event.shiftKey, altKey: event.altKey }
      ctx.stepBy(direction, modifiers)
      timers.current.held = true
      timers.current.timeout = window.setTimeout(() => {
        timers.current.interval = window.setInterval(() => ctx.stepBy(direction, modifiers), HOLD_INTERVAL)
      }, HOLD_DELAY)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (pressedByPointer.current) {
        pressedByPointer.current = false
        return
      }
      ctx.stepBy(direction, event)
      ctx.commit()
    },
  }

  return { ctx, size, disabled, handlers }
}

function Stepper({
  direction,
  consumer,
  className,
  children,
  disabled: disabledProp,
  onPointerDown,
  onClick,
  ...props
}: NumberFieldStepperProps & { direction: 1 | -1; consumer: string }) {
  const { ctx, size, disabled, handlers } = useStepper(direction, consumer)
  const up = direction === 1
  return (
    <InputSuffixButton
      data-slot={up ? "number-field-increment" : "number-field-decrement"}
      tabIndex={-1}
      aria-label={up ? "Increase" : "Decrease"}
      aria-controls={ctx.inputId}
      disabled={disabledProp || disabled}
      className={ctx.slots.button({ size, className })}
      {...props}
      {...handlers}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented) handlers.onPointerDown(event)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) handlers.onClick(event)
      }}
    >
      {children ?? (up ? <Plus weight="bold" aria-hidden="true" /> : <Minus weight="bold" aria-hidden="true" />)}
    </InputSuffixButton>
  )
}

function NumberFieldIncrement(props: NumberFieldStepperProps) {
  return <Stepper direction={1} consumer="NumberFieldIncrement" {...props} />
}

function NumberFieldDecrement(props: NumberFieldStepperProps) {
  return <Stepper direction={-1} consumer="NumberFieldDecrement" {...props} />
}

export interface NumberFieldScrubAreaProps extends React.ComponentProps<"span"> {
  direction?: "horizontal" | "vertical"
  pixelSensitivity?: number
}

function NumberFieldScrubArea({
  direction = "horizontal",
  pixelSensitivity = 2,
  className,
  onPointerDown,
  children,
  ...props
}: NumberFieldScrubAreaProps) {
  const ctx = useNumberFieldContext("NumberFieldScrubArea")
  const [lockedAt, setLockedAt] = React.useState<{ x: number; y: number } | null>(null)
  const teardown = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => teardown.current?.(), [])

  const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    onPointerDown?.(event)
    if (event.defaultPrevented || event.button !== 0 || ctx.disabled || ctx.readOnly) return
    event.preventDefault()
    teardown.current?.()

    const area = event.currentTarget
    let lastX = event.clientX
    let lastY = event.clientY
    let cursorX = event.clientX
    let cursorY = event.clientY
    let travel = 0
    let started = false

    try {
      area.setPointerCapture(event.pointerId)
    } catch {
    }
    if (event.pointerType === "mouse" && !isWebKit()) {
      Promise.resolve(area.requestPointerLock?.()).catch(() => {})
    }

    const onLockChange = () => {
      setLockedAt(document.pointerLockElement === area ? { x: cursorX, y: cursorY } : null)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== event.pointerId) return
      if (!(e.buttons & 1)) return end()
      const isLocked = document.pointerLockElement === area
      const dx = isLocked ? e.movementX : e.clientX - lastX
      const dy = isLocked ? e.movementY : e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      if (!started && dx === 0 && dy === 0) return
      if (!started) {
        started = true
        ctx.setScrubbing(true)
      }

      travel += direction === "horizontal" ? dx : -dy
      const steps = Math.trunc(travel / pixelSensitivity)
      if (steps !== 0) {
        travel -= steps * pixelSensitivity
        ctx.stepBy(steps > 0 ? 1 : -1, e, Math.abs(steps))
      }

      if (isLocked) {
        const w = window.innerWidth
        const h = window.innerHeight
        cursorX = (((cursorX + dx) % w) + w) % w
        cursorY = (((cursorY + dy) % h) + h) % h
        const cursor = document.querySelector<HTMLElement>(`[data-number-field-cursor="${ctx.cursorId}"]`)
        if (cursor) cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`
      }
    }

    const end = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      document.removeEventListener("pointerlockchange", onLockChange)
      if (document.pointerLockElement === area) document.exitPointerLock?.()
      teardown.current = null
      setLockedAt(null)
      if (started) {
        ctx.setScrubbing(false)
        ctx.commit()
      }
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === event.pointerId) end()
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    document.addEventListener("pointerlockchange", onLockChange)
    teardown.current = end
  }

  return (
    <ScrubAreaProvider direction={direction} lockedAt={lockedAt}>
      <span
        role="presentation"
        data-slot="number-field-scrub-area"
        data-scrubbing={ctx.scrubbing || undefined}
        data-disabled={ctx.disabled || ctx.readOnly || undefined}
        className={ctx.slots.scrubArea({ direction, className })}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children}
      </span>
    </ScrubAreaProvider>
  )
}

export type NumberFieldScrubAreaCursorProps = React.ComponentProps<"span">

function NumberFieldScrubAreaCursor({ className, children, style, ...props }: NumberFieldScrubAreaCursorProps) {
  const ctx = useNumberFieldContext("NumberFieldScrubAreaCursor")
  const { direction, lockedAt } = useScrubAreaContext("NumberFieldScrubAreaCursor")
  if (!lockedAt) return null
  const Glyph = direction === "horizontal" ? ArrowsHorizontal : ArrowsVertical
  return createPortal(
    <span
      aria-hidden="true"
      data-slot="number-field-scrub-area-cursor"
      data-number-field-cursor={ctx.cursorId}
      className={ctx.slots.scrubCursor({ className })}
      style={{ transform: `translate3d(${lockedAt.x}px, ${lockedAt.y}px, 0)`, ...style }}
      {...props}
    >
      {children ?? <Glyph weight="bold" />}
    </span>,
    document.body,
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
}
