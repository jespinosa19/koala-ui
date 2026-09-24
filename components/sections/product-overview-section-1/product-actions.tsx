"use client"

import * as React from "react"
import { ArrowCounterClockwise, Heart, Truck } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** The buy box actions: add to cart, save to wishlist, and the trust lines under them. */

// How long the confirmation holds before the label rolls back.
const CONFIRM_MS = 1800

/** The add-to-cart button: its label rolls to a confirmation, then rolls back. */
export function AddToCart({ className, size }: { className?: string; size?: "md" | "lg" | "xl" }) {
  const [added, setAdded] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const add = () => {
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), CONFIRM_MS)
  }

  return (
    <Button size={size} className={className} swapKey={added ? "added" : "add"} aria-live="polite" onClick={add}>
      {added ? "Added to cart" : "Add to cart"}
    </Button>
  )
}

/** A heart toggle: bold outline at rest, filled in the destructive red once saved. */
export function WishlistButton({ className }: { className?: string }) {
  const [saved, setSaved] = React.useState(false)
  return (
    <Button
      size="xl"
      variant="outline"
      className={className}
      iconOnly
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={() => setSaved((s) => !s)}
    >
      <Heart weight={saved ? "fill" : "bold"} className={cn(saved && "text-destructive")} />
    </Button>
  )
}

/** The trust lines under the buy button: free shipping, free returns. */
export function Assurances() {
  return (
    <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
      <li className="flex items-center gap-2.5">
        <Truck weight="bold" className="size-5 shrink-0" aria-hidden />
        Free shipping on orders over $75
      </li>
      <li className="flex items-center gap-2.5">
        <ArrowCounterClockwise weight="bold" className="size-5 shrink-0" aria-hidden />
        Free returns within 30 days
      </li>
    </ul>
  )
}
