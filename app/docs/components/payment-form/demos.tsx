"use client"

import { PaymentForm } from "@/components/ui/payment-form"

/**
 * Card checkout with an order total, brand-aware masking, a billing country, and a promo-code
 * row. Apply `KOALA20` or `WELCOME10` to drop in a discount breakdown and roll the total.
 */
export function PaymentFormDemo() {
  return (
    <PaymentForm
      amount="$49.00"
      promoCodes={{
        KOALA20: { percentOff: 20, label: "KOALA20 · 20% off" },
        WELCOME10: { amountOff: 10, label: "WELCOME10 · $10 off" },
      }}
      promoHint="Try KOALA20 for 20% off, or WELCOME10 for $10 off."
    />
  )
}
