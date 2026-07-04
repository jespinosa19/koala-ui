"use client"

import * as React from "react"

import {
  NumberInput,
  PhoneInput,
  InputLabel,
  type PhoneChangePayload,
} from "@/components/ui/input"

export function NumberInputDemo() {
  const [value, setValue] = React.useState<number | null>(8)
  const [qty, setQty] = React.useState<number | null>(2)
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <InputLabel htmlFor="number-basic">Stacked (default)</InputLabel>
        <NumberInput
          id="number-basic"
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <InputLabel htmlFor="number-inline">Inline · quantity</InputLabel>
        <NumberInput
          id="number-inline"
          layout="inline"
          value={qty}
          onValueChange={setQty}
          min={1}
          max={10}
        />
      </div>
    </div>
  )
}

export function QuantityStepperDemo() {
  const [qty, setQty] = React.useState<number | null>(1)
  return (
    <div className="flex items-center gap-4">
      <InputLabel htmlFor="qty-stepper">Quantity</InputLabel>
      <NumberInput
        id="qty-stepper"
        layout="inline"
        size="sm"
        value={qty}
        onValueChange={setQty}
        min={1}
        max={99}
        rootClassName="w-24"
        aria-label="Quantity"
      />
    </div>
  )
}

export function PhoneInputDemo() {
  const [payload, setPayload] = React.useState<PhoneChangePayload | null>(null)
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <InputLabel htmlFor="phone">Phone number</InputLabel>
        <PhoneInput
          id="phone"
          defaultCountry="US"
          defaultValue="555 0142"
          onChange={setPayload}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        E.164:{" "}
        <code className="tabular-nums text-foreground">
          {payload?.e164 ?? "+15550142"}
        </code>
      </p>
    </div>
  )
}
