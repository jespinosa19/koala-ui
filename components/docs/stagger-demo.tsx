"use client"

import * as React from "react"
import { ArrowClockwise } from "@phosphor-icons/react"

import { Stagger } from "@/lib/stagger"
import { Button } from "@/components/ui/button"

const ITEMS = ["Overview", "Analytics", "Reports", "Members", "Billing", "Settings"]

/**
 * Live demo for the Stagger primitive: a grid of tiles that cascades in on mount. The Replay
 * button bumps a key so the whole <Stagger> remounts and the cascade plays again.
 */
export function StaggerDemo() {
  const [runId, setRunId] = React.useState(0)
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Items mount in a cascade, 70&thinsp;ms apart.
        </span>
        <Button size="sm" variant="outline" onClick={() => setRunId((n) => n + 1)}>
          <ArrowClockwise weight="bold" />
          Replay
        </Button>
      </div>
      <Stagger key={runId} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div
            key={item}
            className="flex h-16 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium"
          >
            {item}
          </div>
        ))}
      </Stagger>
    </div>
  )
}
