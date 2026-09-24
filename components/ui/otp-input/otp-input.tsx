"use client"

import * as React from "react"
import { prefersReducedMotion } from "@/lib/motion"
import { tv, type VariantProps } from "@/lib/tv"
import { Label, Hint } from "@/components/ui/label"

// The wrong-code shake, applied imperatively so it can be re-armed. Kept as a literal const so
// Tailwind's scanner still emits the utility (same reason as the Banner icon pop).
const SHAKE_CLASS = "animate-otp-shake"

// ─── Variants ─────────────────────────────────────────────────────────────────

const otpInputVariants = tv({
  slots: {
    // Outer field wrapper: stacks label · control · hint.
    field: "flex flex-col gap-2",
    // The row of digit slots. This is the part that shakes on a rejected code: the label above and
    // the hint below hold still, so the error message is readable the instant it appears.
    control: "flex items-center gap-2",
    // One slot: the input plus the digit painted over it. `relative` anchors the glyph layer; the
    // focused cell lifts above its neighbours so its ring is never covered.
    cell: "relative flex focus-within:z-10",
    // Inserted between groups of slots when `separator` is set.
    separator:
      "flex shrink-0 select-none items-center justify-center self-center leading-none text-muted-foreground/60",
    // The line drawn for the "dash" separator.
    separatorDash: "rounded-full bg-border",
    slot: [
      // The input's own ink is transparent: the digit you see is the `glyphs` layer on top, because
      // text inside an <input> can't move independently of its box, and the digit has to rise into
      // place. The caret, the selection wash and the placeholder are still the input's own.
      "text-center font-medium tabular-nums text-transparent caret-brand",
      // iOS offers the SMS code as autofill; keep the browser's paint and forced text color off.
      // (No `autofill-tint`: the slot IS the input, so it has no frame to wash.) An autofilled slot
      // gets its ink forced back on, which lands exactly under the glyph layer's copy of the digit.
      "autofill-clear",
      // A slot is a text field, so it fills like one: `--surface` is the DS contract for "what
      // surface am I sitting on" (see Input). A code field almost always lives in a Dialog or a
      // card, and painting `--background` there would punch a darker hole in the dark themes.
      "rounded-lg border border-input bg-[var(--surface,var(--background))]",
      "placeholder:text-muted-foreground/40",
      // Hide the placeholder while focused: it only guides empty, unfocused slots.
      "focus:placeholder:text-transparent",
      "appearance-none outline-none",
      "transition-[border-color,box-shadow,background-color] duration-fast ease-out",
      "selection:bg-brand/20",
      "focus:border-brand focus:brand-ring",
      "disabled:cursor-not-allowed",
      // A filled slot keeps the resting `border-input` stroke: the digit alone says it's filled. A
      // lit border on every typed slot competed with the focus ring for "where am I" and made a
      // finished code read as six active fields.
      // Hide the number-spinner affordances some browsers add to numeric fields.
      "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
    ],
    // The visible digit, laid over the input box. One grid cell, so the incoming and outgoing glyph
    // stack on the same spot while they swap. Same type as the slot, so it sits exactly where the
    // input's own (transparent) ink does. That match needs `line-height: normal` (set per size,
    // after `text-*`, so tailwind-merge keeps it): a text field lays its line out that way, and the
    // size's own leading lands the glyph 1px high at `md` (measured on screen, all three sizes).
    glyphs: [
      "pointer-events-none absolute inset-0 grid place-items-center",
      "select-none font-medium tabular-nums text-foreground",
    ],
    // The digit that's there now. Gets `number-roll-in` only when it just arrived (see OTPInput).
    glyph: "[grid-area:1/1]",
    // The digit it replaced, lifting up and out. Rests at opacity-0, so if the roll never runs
    // (reduced motion) it's already invisible instead of overlapping the new one.
    glyphOut: "[grid-area:1/1] opacity-0 number-roll-out",
  },
  variants: {
    // `--shake-distance` scales the error shake's throw with the row, so a 40px row wobbles
    // less than a 56px one and the motion reads the same weight at every size. Deliberately small:
    // the wobble only has to be *noticed*, and past ~4px it stops reading as a settle and starts
    // reading as a flinch.
    size: {
      sm: {
        control: "gap-1.5 [--shake-distance:2px]",
        slot: "size-10 rounded-md text-base",
        glyphs: "text-base leading-[normal]",
        separator: "text-xl",
        separatorDash: "h-0.5 w-2",
      },
      md: {
        control: "gap-2 [--shake-distance:3px]",
        slot: "size-12 rounded-lg text-lg",
        glyphs: "text-lg leading-[normal]",
        separator: "text-2xl",
        separatorDash: "h-0.5 w-2.5",
      },
      lg: {
        control: "gap-2.5 [--shake-distance:4px]",
        slot: "size-14 rounded-xl text-xl",
        glyphs: "text-xl leading-[normal]",
        separator: "text-3xl",
        separatorDash: "h-0.5 w-3",
      },
    },
    hasError: {
      true: {
        slot: [
          "border-destructive caret-destructive",
          "focus:border-destructive focus:destructive-ring",
        ],
      },
    },
    disabled: {
      true: {
        control: "opacity-50 pointer-events-none select-none",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = NonNullable<VariantProps<typeof otpInputVariants>["size"]>

const onlyDigits = (value: string) => value.replace(/\D/g, "")

/** Map any incoming string to a fixed-length array of single digits (positions preserved). */
const toChars = (value: string | undefined, length: number) => {
  const digits = onlyDigits(value ?? "")
  return Array.from({ length }, (_, i) => digits[i] ?? "")
}

/**
 * Ceiling on the paste stagger, in steps (same cap as AnimatedNumber). A long pasted code still
 * lands as one gesture instead of crawling across the row.
 */
const MAX_STAGGER_STEPS = 6

type RollSlot = {
  /** Bumped each time this slot's digit changes; 0 = never changed since mount (no roll). */
  seq: number
  /** The digit being replaced, rolling out. Null once it has left. */
  prev: string | null
  /** Unitless stagger multiplier; the step itself is the `--number-roll-stagger` token. */
  step: number
}

type Roll = { chars: string[]; slots: RollSlot[]; seq: number }

const rollSignature = (chars: string[]) => chars.join(",")

// On mount nothing rolls: a prefilled code (`defaultValue`, a restored form) is already there, it
// didn't just arrive.
const initialRoll = (chars: string[]): Roll => ({
  chars,
  slots: chars.map(() => ({ seq: 0, prev: null, step: 0 })),
  seq: 0,
})

/** Hand every slot whose digit changed a fresh key and its place in the left → right stagger. */
function advanceRoll(current: Roll, chars: string[]): Roll {
  if (current.slots.length !== chars.length) return initialRoll(chars)
  const changed = chars.flatMap((char, i) => (char !== current.chars[i] ? [i] : []))
  // One digit typed starts at once; a paste fans out so the code reads in as it would be spoken.
  const spread =
    changed.length > 1 ? Math.min(1, MAX_STAGGER_STEPS / (changed.length - 1)) : 0
  const seq = current.seq + 1
  const slots = [...current.slots]
  changed.forEach((i, order) => {
    slots[i] = { seq, prev: current.chars[i] || null, step: order * spread }
  })
  return { chars, slots, seq }
}

const rollDelay = (step: number): React.CSSProperties | undefined =>
  step ? { animationDelay: `calc(var(--number-roll-stagger) * ${step})` } : undefined

// ─── OTPInput ─────────────────────────────────────────────────────────────────

export interface OTPInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "onChange" | "defaultValue"
  > {
  /** Number of digit slots. Defaults to 6. */
  length?: number
  size?: Size
  /**
   * Marks the code as rejected: every slot switches to the destructive border and ring,
   * `aria-invalid` is set, the `hint` turns destructive, and the digit row plays one short shake.
   */
  hasError?: boolean
  /**
   * Re-arms the error shake when it changes while `hasError` stays `true`. Only needed if you pin
   * `hasError` across attempts: if typing clears the error, the `false → true` flip already fires
   * the shake on its own. Pass an attempt counter, or the code that was rejected.
   */
  errorKey?: string | number
  disabled?: boolean
  /** Field label rendered above the slots and wired as the group's accessible name. */
  label?: React.ReactNode
  /** Helper text below the slots. Turns destructive when `hasError` is set. */
  hint?: React.ReactNode
  /** Appends a destructive asterisk to the label. */
  required?: boolean
  /** Controlled value: the concatenated digits. */
  value?: string
  /** Uncontrolled initial value. */
  defaultValue?: string
  /** Fires on every edit with the concatenated digits. */
  onChange?: (value: string) => void
  /** Fires once, when the last empty slot is filled. */
  onComplete?: (value: string) => void
  autoFocus?: boolean
  /** Renders a hidden input so the value participates in native form submission. */
  name?: string
  /** Single placeholder character shown in empty slots. */
  placeholder?: string
  /**
   * Visual separator inserted between groups of slots. `"dash"` draws a short
   * divider line, `"dot"` renders a centered `·`, or pass any node for a custom
   * mark. Omit for a plain, evenly-spaced row.
   */
  separator?: "dash" | "dot" | React.ReactNode
  /**
   * Slots per group before a `separator` is drawn. Defaults to two even halves
   * (`Math.ceil(length / 2)`). Ignored when `separator` is unset.
   */
  groupSize?: number
  /** Class applied to each digit slot. */
  slotClassName?: string
  "aria-label"?: string
}

function OTPInput({
  length = 6,
  size = "md",
  hasError = false,
  errorKey,
  disabled = false,
  value: valueProp,
  defaultValue = "",
  onChange,
  onComplete,
  autoFocus = false,
  name,
  placeholder,
  separator,
  groupSize,
  label,
  hint,
  required = false,
  className,
  slotClassName,
  "aria-label": ariaLabel = "One-time passcode",
  ...props
}: OTPInputProps) {
  const isControlled = valueProp !== undefined
  const [internalChars, setInternalChars] = React.useState(() =>
    toChars(defaultValue, length),
  )

  // Single source of truth for what each slot renders.
  const chars = isControlled
    ? toChars(valueProp, length)
    : // Keep internal state aligned if `length` changes between renders.
      internalChars.length === length
      ? internalChars
      : toChars(internalChars.join(""), length)

  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const controlRef = React.useRef<HTMLDivElement | null>(null)

  // The digit roll. Each slot remembers its own last change (`seq`), the digit it replaced (`prev`)
  // and its place in the stagger (`step`), so a slot that didn't change keeps its key and its roll
  // runs to the end: typing fast never cuts the previous digit's rise short. Adjusted *during
  // render* (React's "store the previous value" pattern, same as AnimatedNumber): the strict
  // react-hooks lint forbids setting state in an effect.
  const [roll, setRoll] = React.useState(() => initialRoll(chars))
  if (rollSignature(roll.chars) !== rollSignature(chars)) {
    setRoll((current) => advanceRoll(current, chars))
  }

  // An outgoing glyph is dropped the moment its roll ends (an event handler, not an effect).
  const clearOutgoing = (index: number) =>
    setRoll((current) => ({
      ...current,
      slots: current.slots.map((slot, i) =>
        i === index ? { ...slot, prev: null } : slot,
      ),
    }))

  // One value that changes exactly when a *new* rejection lands: null while the field is clean, and
  // a fresh string when `hasError` flips true or `errorKey` moves under a standing error.
  const errorSignal = hasError ? `e:${errorKey ?? ""}` : null
  const lastErrorSignal = React.useRef<string | null>(null)

  // Shake the digit row on each new rejection. A CSS animation only replays if it is removed,
  // reflowed, then re-added (same mechanism as the Banner icon pop), so the class is driven from
  // here rather than rendered: an error raised twice in a row must register twice. Mounting already
  // in an error state shakes too, and that is deliberate: a form that came back rejected is a real
  // error arriving in front of the user, not a page-load entrance. Purely decorative, so it is
  // skipped outright under reduced motion; `aria-invalid` and the hint carry the meaning.
  React.useEffect(() => {
    const previous = lastErrorSignal.current
    lastErrorSignal.current = errorSignal
    if (errorSignal === null || errorSignal === previous) return
    const control = controlRef.current
    if (!control || prefersReducedMotion()) return
    control.classList.remove(SHAKE_CLASS)
    void control.offsetWidth
    control.classList.add(SHAKE_CLASS)
  }, [errorSignal])

  const labelId = React.useId()
  const hintId = React.useId()
  const hasLabel = label != null
  const hasHint = hint != null

  const slots = otpInputVariants({ size, hasError, disabled })

  const hasSeparator = separator != null && separator !== false
  // Slots per group: explicit, else two even halves.
  const groupCount = groupSize ?? Math.ceil(length / 2)

  const renderSeparator = (key: number) => (
    <div
      key={`sep-${key}`}
      role="separator"
      aria-hidden="true"
      data-slot="otp-input-separator"
      className={slots.separator()}
    >
      {separator === "dash" ? (
        <span className={slots.separatorDash()} />
      ) : separator === "dot" ? (
        "·"
      ) : (
        separator
      )}
    </div>
  )

  const emit = (nextChars: string[]) => {
    if (!isControlled) setInternalChars(nextChars)
    const joined = nextChars.join("")
    onChange?.(joined)
    const wasComplete = chars.every(Boolean)
    if (!wasComplete && joined.length === length) onComplete?.(joined)
  }

  const focusSlot = (index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1))
    const el = refs.current[clamped]
    el?.focus()
    el?.select()
  }

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digit = onlyDigits(event.target.value)
    // Deletions arrive as an empty value, handled in keydown so we ignore them here.
    if (!digit) return
    const next = [...chars]
    next[index] = digit.slice(-1)
    emit(next)
    focusSlot(index + 1)
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (event.key) {
      case "Backspace": {
        event.preventDefault()
        const next = [...chars]
        if (chars[index]) {
          // Clear the current slot, stay put.
          next[index] = ""
          emit(next)
        } else if (index > 0) {
          // Already empty: step back and clear the previous slot.
          next[index - 1] = ""
          emit(next)
          focusSlot(index - 1)
        }
        break
      }
      case "Delete": {
        event.preventDefault()
        const next = [...chars]
        next[index] = ""
        emit(next)
        break
      }
      case "ArrowLeft":
        event.preventDefault()
        focusSlot(index - 1)
        break
      case "ArrowRight":
        event.preventDefault()
        focusSlot(index + 1)
        break
      case "Home":
        event.preventDefault()
        focusSlot(0)
        break
      case "End":
        event.preventDefault()
        focusSlot(length - 1)
        break
    }
  }

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault()
    const digits = onlyDigits(event.clipboardData.getData("text"))
    if (!digits) return
    const next = [...chars]
    let cursor = index
    for (const digit of digits) {
      if (cursor >= length) break
      next[cursor] = digit
      cursor++
    }
    emit(next)
    focusSlot(cursor)
  }

  return (
    <div data-slot="otp-input" className={slots.field({ className })} {...props}>
      {hasLabel ? (
        // Shared Label primitive, but *not* an htmlFor label (the control is a group, not one
        // input): we give it an id, the group references it via aria-labelledby, and clicking
        // it focuses the first slot. Standalone (no Field), so it adds no htmlFor of its own.
        <Label
          id={labelId}
          data-slot="otp-input-label"
          required={required}
          disabled={disabled}
          onClick={() => focusSlot(0)}
        >
          {label}
        </Label>
      ) : null}

      <div
        ref={controlRef}
        role="group"
        aria-label={hasLabel ? undefined : ariaLabel}
        aria-labelledby={hasLabel ? labelId : undefined}
        aria-describedby={hasHint ? hintId : undefined}
        data-slot="otp-input-control"
        data-error={hasError || undefined}
        data-disabled={disabled || undefined}
        className={slots.control()}
      >
        {Array.from({ length }, (_, index) => {
        const startsNewGroup =
          hasSeparator &&
          groupCount > 0 &&
          index > 0 &&
          index % groupCount === 0
        const char = chars[index]
        const { seq, prev, step } = roll.slots[index] ?? { seq: 0, prev: null, step: 0 }
        return (
        <React.Fragment key={index}>
        {startsNewGroup ? renderSeparator(index) : null}
        <div data-slot="otp-input-cell" className={slots.cell()}>
        <input
          ref={(el) => {
            refs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={hasError || undefined}
          placeholder={placeholder}
          value={chars[index]}
          data-filled={chars[index] ? "true" : undefined}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={slots.slot({ className: slotClassName })}
        />
        {/* What you see. The input above keeps the value (and so the accessible name, selection
            and caret); this layer only paints it, so it stays out of the accessibility tree. The
            keys carry the slot's `seq`: a new digit remounts its glyph and the roll replays. */}
        <span aria-hidden="true" data-slot="otp-input-glyphs" className={slots.glyphs()}>
          {char ? (
            <span
              key={`in-${seq}`}
              className={slots.glyph({ className: seq > 0 ? "number-roll-in" : undefined })}
              style={rollDelay(step)}
            >
              {char}
            </span>
          ) : null}
          {prev ? (
            <span
              key={`out-${seq}`}
              className={slots.glyphOut()}
              style={rollDelay(step)}
              onAnimationEnd={() => clearOutgoing(index)}
            >
              {prev}
            </span>
          ) : null}
        </span>
        </div>
        </React.Fragment>
        )
        })}
        {name ? (
          <input type="hidden" name={name} value={chars.join("")} />
        ) : null}
      </div>

      {hasHint ? (
        <Hint id={hintId} data-slot="otp-input-hint" hasError={hasError}>
          {hint}
        </Hint>
      ) : null}
    </div>
  )
}

export { OTPInput, otpInputVariants }
