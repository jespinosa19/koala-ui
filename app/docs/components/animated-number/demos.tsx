"use client"

import * as React from "react"
import { Minus, Plus, ArrowsClockwise } from "@phosphor-icons/react"

import { AnimatedNumber } from "@/components/ui/animated-number"
import { Button } from "@/components/ui/button"

/** A big counter with controls, so the roll plays on every change. */
export function AnimatedNumberDemo() {
  const [n, setN] = React.useState(2450)
  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatedNumber
        value={n.toLocaleString("en-US")}
        className="text-6xl font-semibold tracking-tight text-foreground"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" iconOnly aria-label="Decrease" onClick={() => setN((v) => Math.max(0, v - 125))}>
          <Minus weight="bold" />
        </Button>
        <Button variant="outline" onClick={() => setN(Math.floor(Math.random() * 9000) + 1000)}>
          <ArrowsClockwise weight="bold" />
          Shuffle
        </Button>
        <Button variant="outline" iconOnly aria-label="Increase" onClick={() => setN((v) => v + 125)}>
          <Plus weight="bold" />
        </Button>
      </div>
    </div>
  )
}

/** A currency figure, showing `tabular-nums` holding the width steady as digits change. */
export function AnimatedNumberCurrencyDemo() {
  const [cents, setCents] = React.useState(3442)
  const money = (c: number) => "$" + (c / 100).toFixed(2)
  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatedNumber
        value={money(cents)}
        className="text-4xl font-semibold tracking-tight text-foreground"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCents((v) => Math.max(0, v - 517))}>
          −$5.17
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCents((v) => v + 1299)}>
          +$12.99
        </Button>
      </div>
    </div>
  )
}
