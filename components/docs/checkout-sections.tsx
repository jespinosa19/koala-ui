"use client"

import { CreditCard } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { BrandMark } from "@/components/landing/brand-mark"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldHint, FieldRow } from "@/components/ui/field"
import { InputRoot, InputField, InputSuffix, CountrySelect } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { SplitLayout, SplitPane, SplitPaneBody } from "@/components/ui/layout"
import {
  OrderSummary,
  OrderSummaryHeader,
  OrderSummaryTitle,
  OrderSummaryItems,
  OrderSummaryItem,
  OrderSummaryItemThumbnail,
  OrderSummaryItemContent,
  OrderSummaryItemName,
  OrderSummaryItemOptions,
  OrderSummaryItemPrice,
  OrderSummaryPromo,
  OrderSummaryTotals,
  OrderSummaryRow,
  OrderSummaryTotal,
} from "@/components/ui/order-summary"
import { RadioGroup, RadioCard, RadioCardTitle, RadioCardDescription } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

/**
 * The application-domain **checkout** sections: complete payment / billing SCREENS (the page
 * tier of the atomic ladder, see memory `site-ia-tiers`), each a real responsive layout that
 * fills the frame. Built like the auth sections: a two-pane `SplitLayout` that is `min-h-svh`
 * and recomposes to a single stacked column below `lg`. Unlike auth (form + photo), a checkout
 * pairs TWO content panes: the billing form on the left, the order Summary on the right, so both
 * stay visible when stacked on mobile. They compose the shipped components (`OrderSummary`,
 * `Field`/`Input`, `RadioCard`, `CountrySelect`, `InputGroup`, `Button`) documented on their
 * component pages. Registered in `sections-registry.tsx` under `domain: "application"`, rendered
 * by the shared iframe target (`app/preview/sections/[slug]`).
 */

// The Visa wordmark shown in the card-number field. A brand mark (its blue is Visa's, not a
// token) rendered inline, the same way the auth screens use real Discord/X brand colors.
function VisaMark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-5 items-center rounded-[3px] bg-[#1434CB] px-1.5 text-[10px] font-bold italic tracking-wide text-white"
    >
      VISA
    </span>
  )
}

// The segmented-address shell: one bordered surface whose rows melt together, joined by hairline
// seams. It reuses the sanctioned InputGroup neutralization pattern (strip each inner control's
// own frame via [data-slot=…] descendants; the shell owns the single border + focus ring),
// applied vertically with `divide-y` instead of horizontally. No control is restyled, only its
// frame dropped inside the group.
const SEGMENTED_SHELL = cn(
  "overflow-hidden rounded-md border border-input bg-[var(--surface,var(--background))]",
  "divide-y divide-input transition-[border-color,box-shadow] duration-fast ease-out",
  "focus-within:border-brand focus-within:brand-ring",
  "[&_[data-slot=input-root]]:rounded-none [&_[data-slot=input-root]]:border-0 [&_[data-slot=input-root]]:bg-transparent",
  "[&_[data-slot=input-root]:focus-within]:[box-shadow:none]",
  "[&_[data-slot=country-select-trigger]]:rounded-none [&_[data-slot=country-select-trigger]]:border-0 [&_[data-slot=country-select-trigger]]:bg-transparent [&_[data-slot=country-select-trigger]]:shadow-none",
)

interface AddressFieldsProps {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal?: string
  country?: string
}

// The segmented address block, shared by the billing and shipping screens.
function AddressFields({ line1 = "", line2 = "", city = "", state = "", postal = "", country }: AddressFieldsProps) {
  return (
    <div className={SEGMENTED_SHELL}>
      <InputRoot>
        <InputField aria-label="Address line 1" placeholder="Address line 1" defaultValue={line1} />
      </InputRoot>
      <InputRoot>
        <InputField aria-label="Address line 2" placeholder="Address line 2" defaultValue={line2} />
      </InputRoot>
      <InputRoot>
        <InputField aria-label="City" placeholder="City" defaultValue={city} />
      </InputRoot>
      <div className="grid grid-cols-2 divide-x divide-input">
        <InputRoot>
          <InputField aria-label="State / province" placeholder="State/province" defaultValue={state} />
        </InputRoot>
        <InputRoot>
          <InputField aria-label="Postal code" placeholder="Postal code" defaultValue={postal} />
        </InputRoot>
      </div>
      <CountrySelect
        defaultValue={country}
        aria-label="Country"
        className="w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

// The billing-address block used by the split billing screen.
function BillingAddress() {
  return (
    <AddressFields line1="75 Ayer Rajah Crescent, #02-02, Singapore 139953" postal="139953" country="SG" />
  )
}

// Real product photos for the cart; a square crop keeps the thumbnails crisp. Swap for next/Image.
const shot = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=80`

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- demo imagery; swap for next/Image
  return <img src={src} alt={alt} />
}

const CART = [
  { name: "Retro Sneakers", options: "Size 10 · Red", price: "$64.00", qty: 2, src: shot("1542291026-7eec264c27ff") },
  { name: "Chrono Watch", options: "40mm · Leather", price: "$78.00", src: shot("1523275335684-37898b6baf30") },
  { name: "Studio Headphones", options: "Black · Over-ear", price: "$149.00", src: shot("1505740420928-5e560c06d30e") },
] as const

/** Checkout · split: the billing form on the left, the order Summary on the right. */
export function CheckoutBillingSplitSection() {
  return (
    <SplitLayout density="comfortable" className="bg-background">
      {/* LEFT — billing form */}
      <SplitPane>
        <SplitPaneBody width="md" className="my-0 gap-8">
          <BrandMark />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Plans</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Payment</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Inert on purpose: a preview screen. Wire onSubmit to your billing backend. */}
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <RadioGroup
              defaultValue="individual"
              aria-label="Billing type"
              className="grid grid-cols-2 gap-3"
            >
              <RadioCard value="individual" size="sm">
                <RadioCardTitle>Bill as individual</RadioCardTitle>
              </RadioCard>
              <RadioCard value="company" size="sm">
                <RadioCardTitle>Bill as company</RadioCardTitle>
              </RadioCard>
            </RadioGroup>

            <Field>
              <FieldLabel>Billing name</FieldLabel>
              <InputRoot>
                <InputField defaultValue="Alex Smith" />
              </InputRoot>
            </Field>

            <Field>
              <FieldLabel>Billing email</FieldLabel>
              <FieldHint>
                Where invoices get sent. This can be different from your account email address.
              </FieldHint>
              <InputRoot>
                <InputField type="email" defaultValue="alexsmith.koala+1@gmail.com" />
              </InputRoot>
            </Field>

            <Field>
              <FieldLabel>Billing address</FieldLabel>
              <BillingAddress />
            </Field>

            <Field>
              <FieldLabel>Card number</FieldLabel>
              <InputRoot>
                <InputField aria-label="Card number" defaultValue="•••• •••• •••• 0123" />
                <InputSuffix>
                  <VisaMark />
                </InputSuffix>
              </InputRoot>
            </Field>

            <FieldRow>
              <Field>
                <FieldLabel>Expiration (MM/YY)</FieldLabel>
                <InputRoot>
                  <InputField aria-label="Expiration" placeholder="MM / YY" defaultValue="02 / 45" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Security code</FieldLabel>
                <InputRoot>
                  <InputField aria-label="Security code" placeholder="CVC" defaultValue="808" />
                  <InputSuffix>
                    <CreditCard weight="bold" />
                  </InputSuffix>
                </InputRoot>
              </Field>
            </FieldRow>

            <Button type="submit" className="mt-2 w-full">
              Confirm payment
            </Button>
          </form>
        </SplitPaneBody>
      </SplitPane>

      {/* RIGHT — order summary. A faint panel divided from the form; stacks under it below lg. */}
      <SplitPane className="border-t border-border bg-muted/30 lg:border-t-0 lg:border-l">
        <SplitPaneBody width="sm" className="gap-8">
          <h2 className="text-base font-semibold text-foreground">Summary</h2>

          {/* Plan */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-foreground">Plan</span>
              <a
                href="#"
                className="text-sm font-medium text-link underline-offset-4 hover:underline"
              >
                Change
              </a>
            </div>
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span>Growth</span>
              <span className="tabular-nums text-foreground">$20.00</span>
            </div>
          </div>

          {/* Discount code */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Discount code</span>
              <span className="text-sm text-muted-foreground">
                Discounts are applied before billing.
              </span>
            </div>
            <InputGroup>
              <InputRoot>
                <InputField aria-label="Discount code" placeholder="Enter discount code" />
              </InputRoot>
              <Button variant="secondary">Apply</Button>
            </InputGroup>
          </div>

          {/* Totals — the shipped OrderSummary read-out, flush (plain, unpadded). */}
          <OrderSummary variant="plain">
            <OrderSummaryTotals className="gap-4 border-t-0 p-0">
              <OrderSummaryRow label="Subtotal">$20.00</OrderSummaryRow>
              <OrderSummaryRow label="Credits" tone="discount">
                -$5.00
              </OrderSummaryRow>
              <OrderSummaryRow label="Taxes">$0.00</OrderSummaryRow>
              <OrderSummaryTotal label="Due today">
                $15.00 <span className="font-normal text-muted-foreground">+ usage</span>
              </OrderSummaryTotal>
            </OrderSummaryTotals>
          </OrderSummary>

          {/* Usage note */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-pretty text-muted-foreground">
              Monthly usage will be calculated at the end of the billing cycle, with any overage
              (after allowances and discounts) added to your next invoice.
            </p>
            <a
              href="#"
              className="text-sm font-medium text-link underline-offset-4 hover:underline"
            >
              Learn more
            </a>
          </div>
        </SplitPaneBody>
      </SplitPane>
    </SplitLayout>
  )
}

/** Checkout · cart: an ecommerce one-page checkout: the shipping + payment form on the left, the
 *  cart (real line items) as the order Summary on the right. */
export function CheckoutCartSplitSection() {
  return (
    <SplitLayout density="comfortable" ratio="start" className="bg-background">
      {/* LEFT — contact · shipping · delivery · payment */}
      <SplitPane>
        <SplitPaneBody width="md" className="my-0 gap-8">
          <BrandMark />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Cart</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Contact</h2>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <InputRoot>
                  <InputField type="email" defaultValue="alex@example.com" />
                </InputRoot>
              </Field>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Shipping address</h2>
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <InputRoot>
                  <InputField defaultValue="Alex Smith" />
                </InputRoot>
              </Field>
              <Field>
                <FieldLabel>Address</FieldLabel>
                <AddressFields line1="1 Marina Boulevard" city="Singapore" postal="018989" country="SG" />
              </Field>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Delivery method</h2>
              <RadioGroup
                defaultValue="standard"
                aria-label="Delivery method"
                className="flex flex-col gap-3"
              >
                <RadioCard value="standard">
                  <RadioCardTitle>Standard</RadioCardTitle>
                  <RadioCardDescription>Free · 4 to 6 business days</RadioCardDescription>
                </RadioCard>
                <RadioCard value="express">
                  <RadioCardTitle>Express</RadioCardTitle>
                  <RadioCardDescription>$12.00 · 1 to 2 business days</RadioCardDescription>
                </RadioCard>
              </RadioGroup>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Payment</h2>
              <Field>
                <FieldLabel>Card number</FieldLabel>
                <InputRoot>
                  <InputField aria-label="Card number" defaultValue="•••• •••• •••• 0123" />
                  <InputSuffix>
                    <VisaMark />
                  </InputSuffix>
                </InputRoot>
              </Field>
              <FieldRow>
                <Field>
                  <FieldLabel>Expiration (MM/YY)</FieldLabel>
                  <InputRoot>
                    <InputField aria-label="Expiration" placeholder="MM / YY" defaultValue="02 / 45" />
                  </InputRoot>
                </Field>
                <Field>
                  <FieldLabel>Security code</FieldLabel>
                  <InputRoot>
                    <InputField aria-label="Security code" placeholder="CVC" defaultValue="808" />
                    <InputSuffix>
                      <CreditCard weight="bold" />
                    </InputSuffix>
                  </InputRoot>
                </Field>
              </FieldRow>
            </section>

            <Button type="submit" className="w-full">
              Pay $314.28
            </Button>
          </form>
        </SplitPaneBody>
      </SplitPane>

      {/* RIGHT — the cart, as the shipped OrderSummary with real line items */}
      <SplitPane className="border-t border-border bg-muted/30 lg:border-t-0 lg:border-l">
        <SplitPaneBody width="sm" className="my-0">
          <OrderSummary variant="plain" density="comfortable">
            <OrderSummaryHeader>
              <OrderSummaryTitle asChild>
                <h2>Order summary</h2>
              </OrderSummaryTitle>
              <Badge variant="secondary" pill>
                4 items
              </Badge>
            </OrderSummaryHeader>

            <OrderSummaryItems>
              {CART.map((item) => (
                <OrderSummaryItem key={item.name}>
                  <OrderSummaryItemThumbnail count={"qty" in item ? item.qty : undefined}>
                    <ProductThumb src={item.src} alt={item.name} />
                  </OrderSummaryItemThumbnail>
                  <OrderSummaryItemContent>
                    <OrderSummaryItemName>{item.name}</OrderSummaryItemName>
                    <OrderSummaryItemOptions>{item.options}</OrderSummaryItemOptions>
                  </OrderSummaryItemContent>
                  <OrderSummaryItemPrice>{item.price}</OrderSummaryItemPrice>
                </OrderSummaryItem>
              ))}
            </OrderSummaryItems>

            <OrderSummaryPromo>
              <InputGroup>
                <InputRoot>
                  <InputField aria-label="Discount code" placeholder="Discount code" />
                </InputRoot>
                <Button variant="secondary">Apply</Button>
              </InputGroup>
            </OrderSummaryPromo>

            <OrderSummaryTotals>
              <OrderSummaryRow label="Subtotal">$291.00</OrderSummaryRow>
              <OrderSummaryRow label="Shipping" tone="muted">
                Free
              </OrderSummaryRow>
              <OrderSummaryRow label="Estimated tax">$23.28</OrderSummaryRow>
              <OrderSummaryTotal label="Total">$314.28</OrderSummaryTotal>
            </OrderSummaryTotals>
          </OrderSummary>
        </SplitPaneBody>
      </SplitPane>
    </SplitLayout>
  )
}
