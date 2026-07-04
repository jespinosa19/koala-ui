"use client"

import * as React from "react"
import { Check, Circle } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { createContext } from "@/lib/create-context"

// ─── Variants ─────────────────────────────────────────────────────────────────

// A single recipe for the whole component. The strength *tone* (red→green) is uniform
// across all filled segments and the label, so it's applied per element via the
// className arg (TONE_FILL / TONE_TEXT) rather than as a tv variant. tailwind-merge
// (through lib/tv) lets the tone color win over the muted base cleanly.
const passwordStrengthVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-2",
    meter: "flex w-full items-center gap-1.5",
    // Each bar starts muted; a filled bar gets its tone color layered on top.
    // Width/color animate so the meter glides as you type instead of snapping.
    segment:
      "h-1.5 flex-1 rounded-full bg-muted transition-colors duration-base ease-out",
    label:
      "text-sm font-medium tabular-nums transition-colors duration-fast ease-out",
    list: "flex flex-col gap-1.5",
    item: "flex items-center gap-2 text-sm text-pretty transition-colors duration-fast ease-out",
    // Fixed box so the cross-fading check/dot icons stack without shifting the text.
    itemIcon: "relative flex size-4 shrink-0 items-center justify-center",
  },
})

// ─── Rules & scoring ────────────────────────────────────────────────────────────

export interface PasswordRule {
  /** Stable key, also used as the React key in the requirements list. */
  id: string
  /** Human-readable requirement, shown in `PasswordStrengthList`. */
  label: string
  /** Returns true when the password satisfies this rule. */
  test: (value: string) => boolean
}

interface ResolvedRule extends PasswordRule {
  met: boolean
}

/** The default policy: length, mixed case, a number, and a symbol. */
export const defaultPasswordRules: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  {
    id: "case",
    label: "Upper & lowercase letters",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "At least one number", test: (v) => /\d/.test(v) },
  {
    id: "symbol",
    label: "At least one symbol",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
]

type Tone = "empty" | "destructive" | "orange" | "warning" | "success"

// Level 0 = nothing typed; 1→4 climb red → orange → amber → green. Indexed by `level`.
const LEVELS: { label: string; tone: Tone }[] = [
  { label: "", tone: "empty" },
  { label: "Weak", tone: "destructive" },
  { label: "Fair", tone: "orange" },
  { label: "Good", tone: "warning" },
  { label: "Strong", tone: "success" },
]

const TONE_FILL: Record<Tone, string> = {
  empty: "",
  destructive: "bg-destructive",
  orange: "bg-orange",
  warning: "bg-warning",
  success: "bg-success",
}

const TONE_TEXT: Record<Tone, string> = {
  empty: "text-muted-foreground",
  destructive: "text-destructive",
  orange: "text-orange",
  warning: "text-warning",
  success: "text-success",
}

const SEGMENT_COUNT = 4

/** Pure helper: score a password against a rule set. Exposed for headless use. */
export function getPasswordStrength(
  value: string,
  rules: PasswordRule[] = defaultPasswordRules,
) {
  const resolved: ResolvedRule[] = rules.map((rule) => ({
    ...rule,
    met: rule.test(value),
  }))
  const score = resolved.filter((r) => r.met).length
  const max = resolved.length
  let level = max === 0 ? 0 : Math.round((score / max) * SEGMENT_COUNT)
  // Anything typed reads as at least "Weak" so the meter never looks empty while filled.
  if (value.length > 0 && level === 0) level = 1
  const { label, tone } = LEVELS[level]
  return { score, max, level, label, tone, rules: resolved }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type Strength = ReturnType<typeof getPasswordStrength>
type Slots = ReturnType<typeof passwordStrengthVariants>

const [PasswordStrengthProvider, usePasswordStrengthContext] =
  createContext<{ strength: Strength; slots: Slots }>("PasswordStrength")

// ─── PasswordStrength (root) ────────────────────────────────────────────────────

export interface PasswordStrengthProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** The current password. Strength is recomputed from this on every render. */
  value: string
  /** Override the policy. Defaults to {@link defaultPasswordRules}. */
  rules?: PasswordRule[]
}

function PasswordStrength({
  value,
  rules = defaultPasswordRules,
  className,
  children,
  ...props
}: PasswordStrengthProps) {
  const strength = React.useMemo(
    () => getPasswordStrength(value, rules),
    [value, rules],
  )
  const slots = passwordStrengthVariants()

  return (
    <PasswordStrengthProvider strength={strength} slots={slots}>
      <div
        data-slot="password-strength"
        data-level={strength.level}
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </div>
    </PasswordStrengthProvider>
  )
}

// ─── PasswordStrengthMeter ──────────────────────────────────────────────────────

export type PasswordStrengthMeterProps = React.ComponentPropsWithoutRef<"div">

function PasswordStrengthMeter({
  className,
  ...props
}: PasswordStrengthMeterProps) {
  const { strength, slots } = usePasswordStrengthContext("PasswordStrengthMeter")
  const { level, tone, score, max, label } = strength

  return (
    <div
      data-slot="password-strength-meter"
      role="meter"
      aria-label="Password strength"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={score}
      aria-valuetext={label || "Empty"}
      className={slots.meter({ className })}
      {...props}
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <span
          key={i}
          data-slot="password-strength-segment"
          data-filled={i < level || undefined}
          className={slots.segment({
            className: i < level ? TONE_FILL[tone] : "",
          })}
        />
      ))}
    </div>
  )
}

// ─── PasswordStrengthLabel ──────────────────────────────────────────────────────

export interface PasswordStrengthLabelProps
  extends React.ComponentPropsWithoutRef<"p"> {
  /** Shown before any password is typed (e.g. "Enter a password"). */
  placeholder?: string
}

function PasswordStrengthLabel({
  className,
  placeholder,
  ...props
}: PasswordStrengthLabelProps) {
  const { strength, slots } = usePasswordStrengthContext("PasswordStrengthLabel")
  const { tone, label } = strength

  return (
    // Polite live region so the strength is announced as it changes, not on every keypress burst.
    <p
      data-slot="password-strength-label"
      aria-live="polite"
      className={slots.label({ className: [TONE_TEXT[tone], className] })}
      {...props}
    >
      {label || placeholder || ""}
    </p>
  )
}

// ─── PasswordStrengthList ───────────────────────────────────────────────────────

export type PasswordStrengthListProps = React.ComponentPropsWithoutRef<"ul">

function PasswordStrengthList({
  className,
  ...props
}: PasswordStrengthListProps) {
  const { strength, slots } = usePasswordStrengthContext("PasswordStrengthList")

  return (
    <ul
      data-slot="password-strength-list"
      className={slots.list({ className })}
      {...props}
    >
      {strength.rules.map((rule) => (
        <li
          key={rule.id}
          data-slot="password-strength-item"
          data-met={rule.met || undefined}
          className={slots.item({
            className: rule.met ? "text-foreground" : "text-muted-foreground",
          })}
        >
          <span className={slots.itemIcon()} aria-hidden="true">
            {/* Cross-fade the dot → check with opacity/scale/blur (no motion lib). */}
            <Circle
              weight="bold"
              className={`absolute size-3 text-muted-foreground transition-[opacity,scale,filter] duration-fast ease-out ${
                rule.met
                  ? "opacity-0 scale-[0.25] blur-[4px]"
                  : "opacity-100 scale-100 blur-[0px]"
              }`}
            />
            <Check
              weight="bold"
              className={`absolute size-4 text-success transition-[opacity,scale,filter] duration-fast ease-out ${
                rule.met
                  ? "opacity-100 scale-100 blur-[0px]"
                  : "opacity-0 scale-[0.25] blur-[4px]"
              }`}
            />
          </span>
          {rule.label}
          <span className="sr-only">{rule.met ? " (met)" : " (not met)"}</span>
        </li>
      ))}
    </ul>
  )
}

export {
  PasswordStrength,
  PasswordStrengthMeter,
  PasswordStrengthLabel,
  PasswordStrengthList,
  passwordStrengthVariants,
}
