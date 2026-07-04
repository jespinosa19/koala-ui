"use client"

import * as React from "react"
import { ShieldCheck } from "@phosphor-icons/react"

import { AnimatedNumber } from "@/components/ui/animated-number"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup } from "@/components/ui/input-group"
import { InputRoot, InputField } from "@/components/ui/input"
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
  OrderSummaryItemActions,
  OrderSummaryItemQuantity,
  OrderSummaryItemRemove,
  OrderSummaryPromo,
  OrderSummaryTotals,
  OrderSummaryRow,
  OrderSummaryTotal,
  OrderSummaryFooter,
} from "@/components/ui/order-summary"

// Real product photos stand in for a live catalog; a square crop keeps the thumbnails crisp.
// Swap for next/Image in a real project.
const shot = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=80`

const CART = [
  { name: "Retro Sneakers", options: "Size 10 · Red", price: "$64.00", qty: 2, src: shot("1542291026-7eec264c27ff") },
  { name: "Chrono Watch", options: "40mm · Leather", price: "$78.00", src: shot("1523275335684-37898b6baf30") },
  { name: "Studio Headphones", options: "Black · Over-ear", price: "$149.00", src: shot("1505740420928-5e560c06d30e") },
] as const

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- demo imagery; swap for next/Image
  return <img src={src} alt={alt} />
}

function CartLines() {
  return (
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
  )
}

/** Flagship: a full checkout sidebar — header, line items, promo code, totals, CTA. */
export function OrderSummaryDemo() {
  return (
    <OrderSummary density="comfortable" className="w-full max-w-sm">
      <OrderSummaryHeader>
        <OrderSummaryTitle asChild>
          <h3>Order summary</h3>
        </OrderSummaryTitle>
        <Badge variant="secondary" pill>
          4 items
        </Badge>
      </OrderSummaryHeader>

      <CartLines />

      <OrderSummaryPromo>
        <InputGroup>
          <InputRoot>
            <InputField placeholder="Promo code" defaultValue="WELCOME10" />
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
        <OrderSummaryRow label="Discount (WELCOME10)" tone="discount">
          -$29.10
        </OrderSummaryRow>
        <OrderSummaryTotal label="Total">$285.18</OrderSummaryTotal>
      </OrderSummaryTotals>

      <OrderSummaryFooter>
        <Button size="lg" className="w-full">
          Checkout
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Taxes and shipping calculated at checkout.
        </p>
      </OrderSummaryFooter>
    </OrderSummary>
  )
}

/** Just the line items — the thumbnail + name + options + price row. */
export function OrderSummaryItemsDemo() {
  return (
    <OrderSummary className="w-full max-w-sm">
      <OrderSummaryHeader>
        <OrderSummaryTitle>Your cart</OrderSummaryTitle>
        <Badge variant="secondary" pill>
          4 items
        </Badge>
      </OrderSummaryHeader>
      <CartLines />
    </OrderSummary>
  )
}

/** The totals band, showing the discount and muted tones plus the emphasized grand total. */
export function OrderSummaryTotalsDemo() {
  return (
    <OrderSummary className="w-full max-w-sm">
      <OrderSummaryTotals className="border-t-0">
        <OrderSummaryRow label="Subtotal">$291.00</OrderSummaryRow>
        <OrderSummaryRow label="Shipping" tone="muted">
          Free
        </OrderSummaryRow>
        <OrderSummaryRow label="Estimated tax">$23.28</OrderSummaryRow>
        <OrderSummaryRow label="Store credit" tone="discount">
          -$15.00
        </OrderSummaryRow>
        <OrderSummaryTotal label="Total due">$299.28</OrderSummaryTotal>
      </OrderSummaryTotals>
    </OrderSummary>
  )
}

/** Compact density on the chrome-less `plain` variant — a mini-cart for a Drawer. */
export function OrderSummaryPlainDemo() {
  return (
    <OrderSummary variant="plain" density="compact" className="w-full max-w-xs">
      <OrderSummaryItems>
        {CART.slice(0, 2).map((item) => (
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
      <OrderSummaryTotals>
        <OrderSummaryRow label="Subtotal">$142.00</OrderSummaryRow>
        <OrderSummaryRow label="Shipping" tone="muted">
          Free
        </OrderSummaryRow>
        <OrderSummaryTotal label="Total">$142.00</OrderSummaryTotal>
      </OrderSummaryTotals>
      <OrderSummaryFooter>
        <Button className="w-full">
          <ShieldCheck weight="bold" />
          Secure checkout
        </Button>
      </OrderSummaryFooter>
    </OrderSummary>
  )
}

const money = (n: number) => "$" + n.toFixed(2)

const EDITABLE_INITIAL = [
  { id: "sneakers", name: "Retro Sneakers", options: "Size 10 · Red", unit: 64, qty: 1, src: shot("1542291026-7eec264c27ff") },
  { id: "watch", name: "Chrono Watch", options: "40mm · Leather", unit: 78, qty: 1, src: shot("1523275335684-37898b6baf30") },
  { id: "headphones", name: "Studio Headphones", options: "Black · Over-ear", unit: 149, qty: 1, src: shot("1505740420928-5e560c06d30e") },
]

/** Shopping cart: per-line quantity steppers and a remove button, with a live subtotal. */
export function OrderSummaryShoppingCartDemo() {
  const [items, setItems] = React.useState(EDITABLE_INITIAL)
  const [leaving, setLeaving] = React.useState<Set<string>>(() => new Set())
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  // Removing marks the row `leaving` (it plays its exit); the row is dropped from state only once
  // that animation ends. Subtotal excludes leaving rows, so it rolls down the moment you click.
  const remove = (id: string) => setLeaving((prev) => new Set(prev).add(id))
  const finalize = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setLeaving((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }
  const visible = items.filter((i) => !leaving.has(i.id))
  const subtotal = visible.reduce((sum, i) => sum + i.unit * i.qty, 0)
  // Shown the moment no items remain VISIBLE (i.e. the last one is on its way out), not after its
  // exit finishes — so the empty state appears immediately, with no wait after the rows collapse.
  const emptyState = (
    <div className="grid place-items-center py-10">
      <p className="text-sm text-muted-foreground">Your cart is empty.</p>
    </div>
  )

  return (
    <OrderSummary density="comfortable" className="w-full max-w-lg">
      <OrderSummaryHeader className="flex-col items-start gap-1">
        <OrderSummaryTitle asChild>
          <h3>Summary</h3>
        </OrderSummaryTitle>
        <p className="text-sm text-pretty text-muted-foreground">
          Review your items carefully before proceeding to checkout.
        </p>
      </OrderSummaryHeader>

      {items.length === 0 ? (
        emptyState
      ) : (
        <>
          <OrderSummaryItems>
            {items.map((item) => (
              <OrderSummaryItem
                key={item.id}
                leaving={leaving.has(item.id)}
                onAnimationEnd={(e) => {
                  if (e.target === e.currentTarget) finalize(item.id)
                }}
              >
                <OrderSummaryItemThumbnail>
                  <ProductThumb src={item.src} alt={item.name} />
                </OrderSummaryItemThumbnail>
                <OrderSummaryItemContent>
                  <OrderSummaryItemName>{item.name}</OrderSummaryItemName>
                  <OrderSummaryItemOptions>{item.options}</OrderSummaryItemOptions>
                </OrderSummaryItemContent>
                <OrderSummaryItemPrice>
                  <AnimatedNumber value={money(item.unit * item.qty)} />
                </OrderSummaryItemPrice>
                <OrderSummaryItemActions>
                  <OrderSummaryItemQuantity
                    value={item.qty}
                    onValueChange={(v) => v != null && setQty(item.id, v)}
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <OrderSummaryItemRemove
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.id)}
                  />
                </OrderSummaryItemActions>
              </OrderSummaryItem>
            ))}
          </OrderSummaryItems>

          {visible.length === 0 ? (
            emptyState
          ) : (
            <OrderSummaryTotals>
              <OrderSummaryRow label="Subtotal">
                <AnimatedNumber value={money(subtotal)} />
              </OrderSummaryRow>
              <OrderSummaryRow label="Shipping" tone="muted">
                Free
              </OrderSummaryRow>
              <OrderSummaryTotal label="Total">
                <AnimatedNumber value={money(subtotal)} />
              </OrderSummaryTotal>
            </OrderSummaryTotals>
          )}
        </>
      )}
    </OrderSummary>
  )
}
