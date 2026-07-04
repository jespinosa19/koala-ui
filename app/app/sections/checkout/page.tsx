import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Checkout sections" }

// One numbered variant per preview, stacked on the family page. Each slug keys into the sections
// registry; the shared iframe render target (app/preview/sections/[slug]) reads the same map.
const VARIANTS = ["checkout-billing-split", "checkout-cart"] as const

export default function CheckoutSectionsPage() {
  return (
    <>
      <DocHeader
        title="Checkout"
        description="Complete payment and checkout screens, ready to drop in. Two finished layouts: a SaaS billing page (billing type, contact details, a segmented address block, and card fields, beside a plan + discount + totals summary) and an ecommerce one-page checkout (contact, shipping, delivery method, and payment, beside the cart itself, real line items with thumbnails and quantity). Each pairs a form with the order Summary; the panes divide at the lg breakpoint and stack into one column below it, so the summary never disappears on mobile. Open any frame full-screen, or drag the handle to watch it recompose."
      />

      <div className="flex flex-col gap-8">
        {VARIANTS.map((slug, i) => {
          const section = SECTIONS[slug]
          return (
            <PreviewFrame
              key={slug}
              id={slug}
              slug={slug}
              label={`Variant ${i + 1}`}
              code={section.code}
              locked={section.locked}
              minHeight={section.minHeight}
            />
          )
        })}
      </div>

      <DocSection title="Built from">
        <p className="mt-4 text-pretty text-muted-foreground">
          The screen is a composition of shipped components, never re-styled inline. The totals
          read-out is the{" "}
          <a href="/docs/components/order-summary" className="underline underline-offset-4">
            <code>OrderSummary</code>
          </a>{" "}
          in its flush <code>plain</code> variant; the billing fields pair{" "}
          <a href="/docs/components/field" className="underline underline-offset-4">
            <code>Field</code>
          </a>{" "}
          with{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">
            <code>Input</code>
          </a>{" "}
          and a <code>CountrySelect</code>; the billing-type toggle is a pair of{" "}
          <a href="/docs/components/radio-group" className="underline underline-offset-4">
            <code>RadioCard</code>
          </a>
          s; and the discount field is an{" "}
          <a href="/docs/components/input-group" className="underline underline-offset-4">
            <code>InputGroup</code>
          </a>
          . The two-column shell is the same{" "}
          <a href="/docs/components/layout" className="underline underline-offset-4">
            <code>SplitLayout</code>
          </a>{" "}
          the auth screens use, here with two content panes instead of a media pane.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each preview renders inside an iframe, so the screen&apos;s own breakpoints respond to
          the <strong>frame</strong> width, not the browser. Below <code>lg</code> the two panes
          stack into a single column, the form first and the summary beneath it (kept visible, not
          dropped like an auth photo pane). Drag the handle or pick Mobile to see it recompose, and
          switch the site theme top-right to check it in dark or moonlight.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Where do I find the order-summary component?",
              a: "On the Order Summary component page (/docs/components/order-summary). This screen composes it (in the flush plain variant) alongside Field, Input, RadioCard, CountrySelect, and InputGroup; each of those has its own component page documenting props and wiring.",
            },
            {
              q: "How do I wire the form to a payment provider?",
              a: "These panes are presentational. Wrap the fields in your own form and pass an onSubmit that tokenizes the card with your provider (Stripe, Braintree, …) and creates the subscription. Drive the Summary totals from your billing model, and hand the discount-code InputGroup an onApply that validates the code server-side.",
            },
            {
              q: "Why is the summary a separate pane instead of a card?",
              a: "So it can share the full-height split with the form and collapse cleanly on mobile. The totals still use the OrderSummary component (plain, unpadded) so the read-out stays in lockstep with the cart/checkout variants; the plan header and usage note are page-level composition around it.",
            },
            {
              q: "Why is the code locked?",
              a: "Checkout is a Pro family. The live previews stay fully interactive so you can size and theme them, while the full source ships with a Koala UI Pro license.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
