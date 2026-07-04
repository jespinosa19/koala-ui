"use client"

import * as React from "react"
import { Rocket, Crown, Buildings, Package, Truck, AirplaneTilt, User, CreditCard, Wallet } from "@phosphor-icons/react"

import {
  RadioGroup,
  RadioGroupItem,
  RadioCard,
  RadioCardTitle,
  RadioCardDescription,
} from "@/components/ui/radio-group"

/** Hero: a single choice from a small, visible set, each item paired with a label. */
const PLANS = ["Starter", "Pro", "Enterprise"] as const

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="Pro" className="w-56">
      {PLANS.map((plan) => (
        <label
          key={plan}
          htmlFor={plan}
          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium"
        >
          <RadioGroupItem id={plan} value={plan} />
          {plan}
        </label>
      ))}
    </RadioGroup>
  )
}

/** Two sizes: sm (matches a dense table's checkbox) and md (the default for forms). */
export function SizesDemo() {
  return (
    <div className="flex items-start gap-12">
      {(["sm", "md"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <RadioGroup size={size} defaultValue="b">
            <RadioGroupItem value="a" aria-label={`${size} a`} />
            <RadioGroupItem value="b" aria-label={`${size} b`} />
          </RadioGroup>
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  )
}

/** States: a disabled item is skipped by keyboard navigation; the whole group can be disabled. */
export function StatesDemo() {
  return (
    <div className="flex items-start gap-12">
      <RadioGroup defaultValue="on" className="w-40">
        <label htmlFor="s-on" className="flex cursor-pointer items-center gap-2.5 text-sm">
          <RadioGroupItem id="s-on" value="on" />
          Enabled
        </label>
        <label
          htmlFor="s-off"
          className="flex cursor-not-allowed items-center gap-2.5 text-sm text-muted-foreground"
        >
          <RadioGroupItem id="s-off" value="off" disabled />
          Disabled item
        </label>
      </RadioGroup>

      <RadioGroup defaultValue="x" disabled className="w-40">
        <label htmlFor="g-x" className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <RadioGroupItem id="g-x" value="x" />
          Group disabled
        </label>
        <label htmlFor="g-y" className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <RadioGroupItem id="g-y" value="y" />
          Also disabled
        </label>
      </RadioGroup>
    </div>
  )
}

/** Each option carries supporting text and a leading glyph, the same RadioCard the plan picker uses. */
const SHIPPING = [
  { value: "standard", icon: <Package />, title: "Standard", hint: "4–6 business days. Free." },
  { value: "express", icon: <Truck />, title: "Express", hint: "2–3 business days. $9." },
  { value: "overnight", icon: <AirplaneTilt />, title: "Overnight", hint: "Next business day. $24." },
] as const

export function WithDescriptionDemo() {
  return (
    <RadioGroup defaultValue="express" className="w-full max-w-sm gap-3">
      {SHIPPING.map(({ value, icon, title, hint }) => (
        <RadioCard key={value} value={value} icon={icon}>
          <RadioCardTitle>{title}</RadioCardTitle>
          <RadioCardDescription>{hint}</RadioCardDescription>
        </RadioCard>
      ))}
    </RadioGroup>
  )
}

/**
 * Cards: the whole option becomes a selectable surface. Each RadioCard is itself the radio, so
 * a leading icon, title and description sit inside one button, and the card borders brand + lifts
 * the accent halo when picked. The flooded circle mirrors the standalone control.
 */
const CARD_PLANS = [
  { value: "starter", icon: <Rocket />, title: "Starter", hint: "$0 / month. For side projects and prototypes." },
  { value: "pro", icon: <Crown />, title: "Pro", hint: "$59 / month. For growing teams that ship." },
  { value: "enterprise", icon: <Buildings />, title: "Enterprise", hint: "$99 / month. SSO, audit logs and support." },
] as const

export function CardsDemo() {
  return (
    <RadioGroup defaultValue="pro" className="w-full max-w-sm gap-3">
      {CARD_PLANS.map(({ value, icon, title, hint }) => (
        <RadioCard key={value} value={value} icon={icon}>
          <RadioCardTitle>{title}</RadioCardTitle>
          <RadioCardDescription>{hint}</RadioCardDescription>
        </RadioCard>
      ))}
    </RadioGroup>
  )
}

/**
 * Card sizes: `md` (default, shown above) suits a title + description. `sm` tightens the padding
 * and control so a ONE-LINE option (a title on its own, or an icon + text) doesn't float in dead
 * space, the affordance behind a billing-type toggle or a compact payment-method list.
 */
export function CardSizesDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <RadioGroup
        defaultValue="individual"
        aria-label="Billing type"
        className="grid grid-cols-2 gap-3"
      >
        <RadioCard value="individual" size="sm" icon={<User />}>
          <RadioCardTitle>Individual</RadioCardTitle>
        </RadioCard>
        <RadioCard value="company" size="sm" icon={<Buildings />}>
          <RadioCardTitle>Company</RadioCardTitle>
        </RadioCard>
      </RadioGroup>

      <RadioGroup defaultValue="card" aria-label="Payment method" className="gap-2.5">
        <RadioCard value="card" size="sm" icon={<CreditCard />}>
          <RadioCardTitle>Credit or debit card</RadioCardTitle>
        </RadioCard>
        <RadioCard value="paypal" size="sm" icon={<Wallet />}>
          <RadioCardTitle>PayPal balance</RadioCardTitle>
        </RadioCard>
      </RadioGroup>
    </div>
  )
}

/** A controlled group that reports the live selection. */
export function ControlledDemo() {
  const [value, setValue] = React.useState("comfortable")
  return (
    <div className="flex flex-col items-center gap-4">
      <RadioGroup value={value} onValueChange={setValue} className="grid-flow-col gap-5">
        {["comfortable", "compact"].map((option) => (
          <label
            key={option}
            htmlFor={`d-${option}`}
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium capitalize"
          >
            <RadioGroupItem id={`d-${option}`} value={option} />
            {option}
          </label>
        ))}
      </RadioGroup>
      <span className="text-xs text-muted-foreground">
        Density: <span className="font-medium text-foreground">{value}</span>
      </span>
    </div>
  )
}
