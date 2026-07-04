"use client"

import * as React from "react"
import { ArrowClockwise, Check, Cube, Lightning, Sparkle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/**
 * Live demos for the Motion foundation page that complement <MotionDemo>/<StaggerDemo>:
 *  - SpringDemo: the `ease-spring` overshoot curve, side by side with `ease-out`.
 *  - PressDemo:  the standing hover-lift + `active:scale` press feedback on interactive cards.
 * Both name `scale`/`translate` explicitly in their transition lists: in Tailwind v4 those are
 * standalone CSS properties, so a `transition-[...,transform]` would never tween them.
 */

const SPRING_TILES = [
  { name: "ease-spring", className: "ease-spring", note: "Overshoots, then settles" },
  { name: "ease-out", className: "ease-out", note: "Eases in, no overshoot" },
]

/** Pop two tiles in at once: spring overshoots past full size, ease-out lands flat. */
export function SpringDemo() {
  const [on, setOn] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {SPRING_TILES.map((t) => (
          <div key={t.name} className="flex flex-col items-center gap-4 bg-card p-6">
            <div className="flex h-24 w-full items-center justify-center">
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-[scale,opacity] duration-base",
                  t.className,
                  on ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              >
                <Check weight="bold" className="size-7" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-foreground">{t.name}</p>
              <p className="text-[11px] text-muted-foreground">{t.note}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOn((v) => !v)}>
          {on ? "Reset" : "Play"}
        </Button>
      </div>
    </div>
  )
}

const PRESS_ITEMS = [
  { icon: Lightning, title: "Quick actions", desc: "Hover lifts the card" },
  { icon: Cube, title: "Components", desc: "Press scales to 0.97" },
  { icon: Sparkle, title: "Polish", desc: "Specific props, fast curve" },
]

/** A real card grid: hover to lift, press to scale. No Play button - just interact. */
export function PressDemo() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PRESS_ITEMS.map(({ icon: Icon, title, desc }) => (
        <button
          key={title}
          type="button"
          className={cn(
            "group flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left",
            // Name scale + translate explicitly: in Tailwind v4 they're standalone CSS
            // properties, so transition-[...,transform] would never tween them.
            "transition-[scale,translate,box-shadow,border-color] duration-fast ease-out",
            "hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground transition-colors duration-fast ease-out group-hover:bg-brand group-hover:text-white">
            <Icon weight="bold" className="size-5" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

const ORIGINS = [
  { name: "the trigger corner", origin: "origin-top-left", note: "origin-(--radix-popper-transform-origin)" },
  { name: "its own center", origin: "origin-center", note: "default origin - detached from the trigger" },
]

/** Two panels open at once: one scales out of the trigger corner, one from its center. */
export function OriginScaleDemo() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ORIGINS.map((o) => (
          <div
            key={o.origin}
            className="relative h-56 overflow-hidden rounded-lg border border-border bg-card p-5"
          >
            <span className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
              Trigger
            </span>
            <div
              className={cn(
                "absolute top-16 left-5 w-48 rounded-lg border border-border bg-popover p-3 shadow-lg",
                "transition-[scale,opacity] duration-base ease-out",
                o.origin,
                open ? "scale-100 opacity-100" : "scale-0 opacity-0",
              )}
            >
              <p className="text-sm font-medium text-popover-foreground">Menu panel</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Scales from {o.name}.</p>
            </div>
            <span className="absolute bottom-3 left-5 font-mono text-[11px] text-muted-foreground">
              {o.note}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Open"}
        </Button>
      </div>
    </div>
  )
}

const REDUCED_ITEMS = ["Overview", "Activity", "Reports", "Members", "Billing", "Settings"]

/** Flip "reduced motion" and Replay: the cascade either plays or the tiles simply appear. */
export function ReducedMotionDemo() {
  const [reduced, setReduced] = React.useState(false)
  const [runId, setRunId] = React.useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Simulate</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={reduced ? "reduced" : "full"}
          onValueChange={(v) => v && setReduced(v === "reduced")}
          aria-label="Motion preference"
        >
          <ToggleGroupItem value="full">Full motion</ToggleGroupItem>
          <ToggleGroupItem value="reduced">Reduced motion</ToggleGroupItem>
        </ToggleGroup>
        <Button size="sm" variant="outline" onClick={() => setRunId((n) => n + 1)}>
          <ArrowClockwise weight="bold" />
          Replay
        </Button>
      </div>
      <div
        key={runId}
        className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-5 sm:grid-cols-3"
      >
        {REDUCED_ITEMS.map((item, i) => (
          <div
            key={item}
            className={cn(
              "flex h-16 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium",
              !reduced && "animate-stagger-in",
            )}
            style={reduced ? undefined : { animationDelay: `${i * 70}ms` }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
