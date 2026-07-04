import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { PaymentFormDemo } from "./demos"

export const metadata = { title: "Payment Form" }

export default function PaymentFormDocsPage() {
  return (
    <>
      <DocHeader
        title="Payment Form"
        description="A complete card-checkout block. The card number, expiry, and CVC are masked as you type, the card brand is detected live, and the billing country shows circular flags. Accept promo codes to reveal a discount breakdown and roll the total. It owns its own state and runs the loading → success flow. Wire onSubmit to your payment provider."
      />

      <ComponentPreview
        locked
        code={`<PaymentForm
  amount="$49.00"
  promoCodes={{
    KOALA20: { percentOff: 20, label: "KOALA20 · 20% off" },
    WELCOME10: { amountOff: 10, label: "WELCOME10 · $10 off" },
  }}
  promoHint="Try KOALA20 for 20% off, or WELCOME10 for $10 off."
  onSubmit={(data) => pay(data)}
/>`}
      >
        <PaymentFormDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="payment-form" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">PaymentForm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Composes{" "}
              <a href="/docs/components/field" className="underline underline-offset-4">Field</a>,{" "}
              <a href="/docs/components/input" className="underline underline-offset-4">Input</a>, and{" "}
              <a href="/docs/components/select" className="underline underline-offset-4">Select</a>.
              The masking and brand detection are presentation only; never store an unmasked card
              number. Forwards all <code className="font-mono text-sm">&lt;div&gt;</code> props.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">amount</code>: display total (e.g.{" "}
                <code className="font-mono text-sm">&quot;$49.00&quot;</code>). Shows the summary row
                and labels the Pay button. When a code is applied, the shown total is the discounted
                one.
              </li>
              <li>
                <code className="font-mono text-sm">promoCodes</code>:{" "}
                <code className="font-mono text-sm">Record&lt;string, PaymentPromoCode&gt;</code>{" "}
                keyed by code (matched case-insensitively). Reveals the promo-code row; each code
                carries a <code className="font-mono text-sm">percentOff</code> and/or{" "}
                <code className="font-mono text-sm">amountOff</code> (and an optional{" "}
                <code className="font-mono text-sm">label</code>). Applying one drops in a subtotal →
                discount breakdown and rolls the total. Requires a parseable{" "}
                <code className="font-mono text-sm">amount</code>.
              </li>
              <li>
                <code className="font-mono text-sm">promoHint</code>: caption under the promo input
                (e.g. <code className="font-mono text-sm">&quot;Try KOALA20&quot;</code>).
              </li>
              <li>
                <code className="font-mono text-sm">defaultCountry</code>: billing country ISO2
                (default <code className="font-mono text-sm">&quot;US&quot;</code>).
              </li>
              <li>
                <code className="font-mono text-sm">onSubmit</code>:{" "}
                <code className="font-mono text-sm">(data: PaymentFormData) =&gt; void | Promise&lt;void&gt;</code>
                , where <code className="font-mono text-sm">PaymentFormData</code> is{" "}
                <code className="font-mono text-sm">{`{ cardNumber, expiry, cvc, name, country, promoCode? }`}</code>.
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Does PaymentForm process payments or store card data?", a: "No. The masking and live brand detection are presentation only, and PaymentForm never touches a network. Wire your `onSubmit` handler to a provider like Stripe, and never store the unmasked card number yourself." },
            { q: "How do I run a loading spinner while the charge settles?", a: "Return a promise from `onSubmit`. The form sets its internal status to loading (the Pay button shows a spinner) until the promise resolves, then flips to the built-in success screen." },
            { q: "How do promo codes work?", a: "Pass `promoCodes` as a map of code to a `{ percentOff?, amountOff?, label? }` discount. A \"Promo code\" field appears under the billing country; codes are matched case-insensitively. Applying a valid one slides a subtotal → discount breakdown into the summary and rolls the total to its new value, an invalid one shows an inline error, and the applied code arrives on `onSubmit` as `data.promoCode`. The discount math re-uses your `amount` string's currency symbol, decimals, and grouping." },
            { q: "What shape is the data passed to onSubmit?", a: "A `PaymentFormData` object with `cardNumber`, `expiry`, `cvc`, `name`, and `country` (ISO2). The card number, expiry, and CVC arrive masked exactly as displayed." },
            { q: "How do I set the order total and the default billing country?", a: "Pass `amount` as a preformatted string like `\"$49.00\"` to show the summary row and label the Pay button, and `defaultCountry` as an ISO2 code (default `\"US\"`) to preselect the CountrySelect." },
            { q: "Why do the nested Inputs blend into the card instead of looking filled?", a: "The root declares `--surface: var(--card)`, so the composed Field, Input, and CountrySelect paint the card surface rather than a separate background block. This is the DS --surface contract." },
            { q: "Can I change the spacing to match a denser layout?", a: "Set `density` to `compact` (16px, the default) or `comfortable` (24px). Omit it and the form inherits from the nearest DensityProvider." },
          ]}
        />
      </DocSection>
    </>
  )
}
