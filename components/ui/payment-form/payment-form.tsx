"use client"

import * as React from "react"
import { CheckCircle, CreditCard, Lock, SealPercent, Tag, X } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldRow } from "@/components/ui/field"
import {
  InputRoot,
  InputField,
  InputPrefix,
  InputSuffix,
  CountrySelect,
} from "@/components/ui/input"
import { useDensity, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"

/**
 * PaymentForm: a complete card-checkout block: an order total, a brand-aware card number field,
 * expiry + CVC, cardholder name, and a searchable billing-country picker (CountrySelect). The card
 * number, expiry, and CVC are masked as you type; the brand is detected live and shown in the
 * field. It owns its own state and submit flow. Wire `onSubmit` to your payment provider (Stripe
 * et al.). See docs/ARCHITECTURE.md §2.
 *
 * Pass `promoCodes` to accept discount codes: a "Promo code" field appears under the billing
 * country, and applying a valid code drops a subtotal → discount breakdown into the summary while
 * the total rolls to its new value. Codes are matched case-insensitively; each carries a
 * `percentOff` and/or `amountOff`.
 *
 * The card root declares `--surface: var(--card)` so nested controls blend with the panel (the
 * --surface contract). Never render a real card number unmasked. This is presentation only.
 */
export const paymentFormVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
    header: "flex flex-col gap-1.5",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    // Order total row: a quiet inset panel so the amount reads as a summary, not a field.
    summary: "flex items-center justify-between rounded-xl bg-muted px-4 py-3",
    // Promo-aware summary: the same inset panel, now a column that stacks the breakdown, the
    // total, and the promo-code row (with a hairline between the total and whatever sits beside it).
    summaryPanel: "flex flex-col gap-3 rounded-xl bg-muted p-4",
    summaryLabel: "text-sm text-muted-foreground",
    summaryAmount: "text-xl font-semibold tabular-nums text-foreground",
    totalRow: "flex items-center justify-between",
    // The subtotal → discount breakdown that slides in when a code is applied.
    breakdown: "flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-base ease-out",
    breakdownRow: "flex items-center justify-between text-sm",
    subtotalAmount: "tabular-nums text-muted-foreground",
    discountLabel: "flex items-center gap-1.5 font-medium text-success",
    discountAmount: "flex items-center gap-1.5 font-medium tabular-nums text-success",
    // Remove-code affordance: a 20px glyph with a pseudo-element extending the hit area to 40px.
    discountRemove:
      "relative flex size-5 cursor-pointer items-center justify-center rounded-full text-success/70 transition-[color,background-color,scale] duration-fast ease-out before:absolute before:-inset-2.5 before:content-[''] hover:bg-success/10 hover:text-success active:scale-[0.96] [&_svg]:size-3",
    rule: "h-px bg-border",
    promoField: "flex items-stretch gap-2",
    promoHint: "text-xs text-muted-foreground",
    promoError: "text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-fast ease-out",
    form: "flex flex-col gap-4",
    brand: "select-none text-xs font-medium uppercase tracking-wide text-muted-foreground",
    secure: "flex items-center justify-center gap-1.5 text-xs text-muted-foreground",
    success: "flex flex-col items-center gap-3 text-center animate-in fade-in-0 zoom-in-95 duration-base ease-out",
    successTitle: "text-base font-semibold text-foreground",
    successText: "text-sm text-pretty text-muted-foreground",
  },
  // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): card padding, outer gap,
  // title size, success padding. `compact` is the Koala default (16px); `comfortable` is 24px.
  variants: {
    density: {
      compact: { root: "gap-4 p-4", title: "text-base", success: "py-4" },
      comfortable: { root: "gap-6 p-6", title: "text-lg", success: "py-6" },
    },
  },
  defaultVariants: {
    density: "compact",
  },
})

// ─── Masking + brand detection ────────────────────────────────────────────────

/** Group a raw card number into 4-digit blocks (max 19 digits). */
function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

/** Insert the `MM/YY` slash and clamp to 4 digits. */
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

/** Best-effort brand from the leading digits: purely cosmetic. */
function detectBrand(value: string): string | null {
  const d = value.replace(/\D/g, "")
  if (/^4/.test(d)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard"
  if (/^3[47]/.test(d)) return "Amex"
  if (/^(6011|65|64[4-9])/.test(d)) return "Discover"
  return null
}

// ─── Money parsing (for promo discounts) ──────────────────────────────────────

// A display total like "$1,499.00" split into its parts so we can re-price it and put the
// currency symbol / decimals / grouping back exactly as they came in. US-style formatting
// (`,` groups, `.` decimals), which is what the DS uses throughout.
type AmountTemplate = {
  prefix: string
  suffix: string
  value: number
  decimals: number
  grouped: boolean
}

function parseAmount(formatted: string): AmountTemplate | null {
  const match = formatted.match(/[\d.,]+/)
  if (!match || match.index == null) return null
  const raw = match[0]
  const value = Number(raw.replace(/,/g, ""))
  if (!Number.isFinite(value)) return null
  const dot = raw.lastIndexOf(".")
  return {
    prefix: formatted.slice(0, match.index),
    suffix: formatted.slice(match.index + raw.length),
    value,
    decimals: dot === -1 ? 0 : raw.length - dot - 1,
    grouped: raw.includes(","),
  }
}

/** Re-format a number with the original amount's symbol, decimals, and thousands grouping. */
function formatAmount(value: number, t: AmountTemplate): string {
  const [int, frac] = Math.max(0, value).toFixed(t.decimals).split(".")
  const grouped = t.grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : int
  const body = frac ? `${grouped}.${frac}` : grouped
  return `${t.prefix}${body}${t.suffix}`
}

/** Money off for a code, clamped so a total never dips below zero. */
function discountFor(promo: PaymentPromoCode, subtotal: number): number {
  const off = (promo.percentOff ? subtotal * (promo.percentOff / 100) : 0) + (promo.amountOff ?? 0)
  return Math.min(Math.max(0, off), subtotal)
}

// ─── RollingTotal ──────────────────────────────────────────────────────────────

/**
 * Rolls the total when it changes: the outgoing amount slides up and fades while the incoming one
 * rises from below, so applying a code reads as one smooth swap instead of a snap. Both layers are
 * `tabular-nums` and the incoming value stays in flow, so the row baseline never moves. Commit on
 * `animationEnd` keeps it interruptible and inside the repo's strict react-hooks lint (no set-state
 * in an effect). Mirrors the Pricing billing-cycle roller.
 */
function RollingTotal({ value, className }: { value: string; className?: string }) {
  const [shown, setShown] = React.useState(value)
  const rolling = value !== shown

  // Named handler, fired when the incoming layer finishes entering: drop the outgoing layer.
  function commit() {
    setShown(value)
  }

  return (
    <span className={cn("relative inline-block tabular-nums", className)}>
      <span
        key={value}
        onAnimationEnd={rolling ? commit : undefined}
        className={cn(rolling && "animate-in fade-in slide-in-from-bottom-2 duration-base ease-out")}
      >
        {value}
      </span>
      {rolling && (
        <span
          key={shown}
          aria-hidden
          className="absolute inset-0 animate-out fade-out slide-out-to-top-2 fill-mode-forwards duration-base ease-out"
        >
          {shown}
        </span>
      )}
    </span>
  )
}

// ─── PaymentForm ──────────────────────────────────────────────────────────────

/** A discount code: a percentage off, a fixed amount off, or both. */
export interface PaymentPromoCode {
  /** Percent off the order total (0–100). */
  percentOff?: number
  /** Fixed amount off, in the amount's own units (e.g. `10` → $10 off). */
  amountOff?: number
  /** Row label for the applied discount. Defaults to the entered code, uppercased. */
  label?: string
}

export interface PaymentFormData {
  cardNumber: string
  expiry: string
  cvc: string
  name: string
  country: string
  /** The applied promo code, if any (set when `promoCodes` is used). */
  promoCode?: string
}

export interface PaymentFormProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  /** Heading above the form. */
  title?: React.ReactNode
  /** Supporting line under the heading. */
  description?: React.ReactNode
  /** Order total, formatted for display (e.g. `"$49.00"`). Shows a summary row when set. */
  amount?: string
  /**
   * Accepted discount codes, keyed by code (matched case-insensitively). Enables the promo-code
   * row under the total. Requires a parseable `amount`.
   */
  promoCodes?: Record<string, PaymentPromoCode>
  /** Caption under the promo-code input (e.g. `"Try KOALA20"`). Only shown when `promoCodes` is set. */
  promoHint?: React.ReactNode
  /** Default billing country (ISO2). */
  defaultCountry?: string
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Called with the (masked) form data on submit. Return a promise to drive the spinner. */
  onSubmit?: (data: PaymentFormData) => void | Promise<void>
}

export function PaymentForm({
  title = "Payment details",
  description = "Enter your card to complete the purchase. Your details are encrypted end to end.",
  amount,
  promoCodes,
  promoHint,
  defaultCountry = "US",
  density,
  onSubmit,
  className,
  ...props
}: PaymentFormProps) {
  const slots = paymentFormVariants({ density: useDensity(density) })
  const [data, setData] = React.useState<PaymentFormData>({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
    country: defaultCountry,
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  // Promo-code state: what's typed, what's been applied, and the last validation error.
  const [codeInput, setCodeInput] = React.useState("")
  const [applied, setApplied] = React.useState<{ code: string; promo: PaymentPromoCode } | null>(null)
  const [codeError, setCodeError] = React.useState<string | null>(null)
  const errorId = React.useId()

  const brand = detectBrand(data.cardNumber)

  // Pricing math: parse the display amount once, then derive the discount + rolled total. The
  // promo UI only lights up when there's a parseable amount and at least one code to accept.
  const template = amount != null ? parseAmount(amount) : null
  const canPromo = template != null && promoCodes != null && Object.keys(promoCodes).length > 0
  const discount = applied && template ? discountFor(applied.promo, template.value) : 0
  const totalDisplay = template ? formatAmount(template.value - discount, template) : amount

  function update<K extends keyof PaymentFormData>(key: K, value: PaymentFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  // Named handlers keep set-state out of render / inline arrows (repo's strict react-hooks lint).
  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCodeInput(event.target.value)
    if (codeError) setCodeError(null)
  }

  function applyPromo() {
    const typed = codeInput.trim()
    if (!typed || !promoCodes) return
    const matchKey = Object.keys(promoCodes).find((k) => k.toLowerCase() === typed.toLowerCase())
    if (!matchKey) {
      setCodeError("That code isn't valid.")
      return
    }
    setApplied({ code: matchKey, promo: promoCodes[matchKey] })
    setCodeError(null)
    setCodeInput("")
  }

  // The promo input lives outside the payment <form>, so Enter can't submit the card; wire it here.
  function handleCodeKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      applyPromo()
    }
  }

  function removePromo() {
    setApplied(null)
    setCodeError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("loading")
    await Promise.resolve(onSubmit?.({ ...data, promoCode: applied?.code }))
    setStatus("success")
  }

  if (status === "success") {
    return (
      <div className={slots.root({ className })} {...props}>
        <div className={slots.success()} role="status">
          <CheckCircle weight="fill" className="size-12 text-success" />
          <p className={slots.successTitle()}>Payment successful</p>
          <p className={slots.successText()}>
            {totalDisplay ? `We charged ${totalDisplay}. ` : ""}A receipt is on its way to your inbox.
          </p>
        </div>
      </div>
    )
  }

  const payLabel = totalDisplay ? `Pay ${totalDisplay}` : "Pay now"

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      {canPromo ? (
        <div className={slots.summaryPanel()}>
          {applied && (
            <div className={slots.breakdown()}>
              <div className={slots.breakdownRow()}>
                <span className={slots.summaryLabel()}>Subtotal</span>
                <span className={slots.subtotalAmount()}>{amount}</span>
              </div>
              <div className={slots.breakdownRow()}>
                <span className={slots.discountLabel()}>
                  <SealPercent weight="fill" className="size-4" />
                  {applied.promo.label ?? applied.code}
                </span>
                <span className={slots.discountAmount()}>
                  <span>{`−${formatAmount(discount, template!)}`}</span>
                  <button
                    type="button"
                    onClick={removePromo}
                    aria-label={`Remove code ${applied.code}`}
                    className={slots.discountRemove()}
                  >
                    <X weight="bold" />
                  </button>
                </span>
              </div>
            </div>
          )}

          {applied && <div className={slots.rule()} />}

          <div className={slots.totalRow()}>
            <span className={slots.summaryLabel()}>Total due</span>
            <RollingTotal value={totalDisplay!} className={slots.summaryAmount()} />
          </div>
        </div>
      ) : (
        amount != null && (
          <div className={slots.summary()}>
            <span className={slots.summaryLabel()}>Total due</span>
            <span className={slots.summaryAmount()}>{amount}</span>
          </div>
        )
      )}

      <form className={slots.form()} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel required>Card number</FieldLabel>
          <InputRoot>
            <InputPrefix>
              <CreditCard weight="bold" />
            </InputPrefix>
            <InputField
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              required
              className="tabular-nums"
              value={data.cardNumber}
              onChange={(event) => update("cardNumber", formatCardNumber(event.target.value))}
            />
            {brand && (
              <InputSuffix>
                <span className={slots.brand()}>{brand}</span>
              </InputSuffix>
            )}
          </InputRoot>
        </Field>

        <FieldRow>
          <Field>
            <FieldLabel required>Expiry</FieldLabel>
            <InputRoot>
              <InputField
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                required
                className="tabular-nums"
                value={data.expiry}
                onChange={(event) => update("expiry", formatExpiry(event.target.value))}
              />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel required>CVC</FieldLabel>
            <InputRoot>
              <InputField
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                required
                maxLength={4}
                className="tabular-nums"
                value={data.cvc}
                onChange={(event) => update("cvc", event.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </InputRoot>
          </Field>
        </FieldRow>

        <Field>
          <FieldLabel required>Cardholder name</FieldLabel>
          <InputRoot>
            <InputField
              autoComplete="cc-name"
              placeholder="Jane Cooper"
              required
              value={data.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </InputRoot>
        </Field>

        <Field>
          <FieldLabel required>Billing country</FieldLabel>
          <CountrySelect
            value={data.country}
            onValueChange={(value) => update("country", value)}
          />
        </Field>

        {canPromo && !applied && (
          <Field>
            <FieldLabel>Promo code</FieldLabel>
            <div className={slots.promoField()}>
              <InputRoot className="flex-1" hasError={codeError != null}>
                <InputPrefix>
                  <Tag weight="bold" />
                </InputPrefix>
                <InputField
                  placeholder="Enter code"
                  autoComplete="off"
                  value={codeInput}
                  onChange={handleCodeChange}
                  onKeyDown={handleCodeKeyDown}
                  aria-invalid={codeError != null || undefined}
                  aria-describedby={codeError != null ? errorId : undefined}
                />
              </InputRoot>
              {/* h-auto lets items-stretch match the Apply button to the input's height. The
                  input is density-invariant (always h-9), but Button shrinks with density, so
                  its own sizing would leave it shorter than the field. */}
              <Button
                type="button"
                variant="secondary"
                onClick={applyPromo}
                disabled={codeInput.trim().length === 0}
                className="h-auto"
              >
                Apply
              </Button>
            </div>
            {codeError != null ? (
              <p id={errorId} role="alert" className={slots.promoError()}>
                {codeError}
              </p>
            ) : promoHint != null ? (
              <p className={slots.promoHint()}>{promoHint}</p>
            ) : null}
          </Field>
        )}

        <Button type="submit" size="lg" loading={status === "loading"} className="mt-1 w-full">
          {payLabel}
        </Button>

        <p className={slots.secure()}>
          <Lock weight="fill" className="size-3.5" />
          Payments are secure and encrypted
        </p>
      </form>
    </div>
  )
}
