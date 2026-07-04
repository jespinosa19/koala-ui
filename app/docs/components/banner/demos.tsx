"use client"

import * as React from "react"
import { Megaphone, ArrowRight, Tag } from "@phosphor-icons/react"

import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"

/**
 * Dismissible banner demo: keeps the live banner in a "use client" island (state + reset)
 * so the docs RSC page never tries to own interactive state.
 */
export function DismissibleBannerDemo() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className="w-full">
      {open ? (
        <Banner
          variant="purple"
          dismissible
          open={open}
          onOpenChange={setOpen}
          dismissLabel="Dismiss announcement"
          className="overflow-hidden rounded-xl"
        >
          <BannerIcon>
            <Megaphone weight="bold" />
          </BannerIcon>
          <BannerContent>New: cream and moonlight themes just landed.</BannerContent>
          <BannerAction href="#">
            Check it out
            <ArrowRight weight="bold" />
          </BannerAction>
        </Banner>
      ) : (
        <div className="grid place-items-center py-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Show banner again
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Live countdown banner section (consumed by the sections registry under the `banner-countdown`
 * slug). The clock runs in this "use client" island, so the server-only registry can still own a
 * ticking timer. The deadline is re-anchored to a real moment on mount, so the demo always shows a
 * fresh ~2.5-day countdown that never expires.
 *
 * polish applied:
 *   - tabular-nums + 2-digit padding so the chips hold a fixed width and never reflow as the
 *     digits tick (CLAUDE.md standing rule for dynamically-updating numbers).
 *   - the visual chips are aria-hidden; one `role="timer"` label carries the value to assistive tech
 *     instead of announcing four boxes every second.
 */

// 2 days, 14 hours, 53 minutes, 9 seconds. A constant initial value keeps the first server and
// client renders identical (no hydration mismatch); the effect re-anchors it to a real deadline.
const SALE_DURATION_MS = ((2 * 24 + 14) * 60 + 53) * 60_000 + 9_000

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = React.useState(durationMs)

  React.useEffect(() => {
    const deadline = Date.now() + durationMs
    // Named handler (not a synchronous setState in the effect body) to satisfy the strict
    // react-hooks lint; it only fires from the interval, never during render.
    function tick() {
      setRemaining(Math.max(0, deadline - Date.now()))
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [durationMs])

  const totalSeconds = Math.floor(remaining / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const pad = (n: number) => n.toString().padStart(2, "0")

function BannerCountdown() {
  const { days, hours, minutes, seconds } = useCountdown(SALE_DURATION_MS)
  const units: Array<[number, string]> = [
    [days, "d"],
    [hours, "h"],
    [minutes, "m"],
    [seconds, "s"],
  ]
  const label =
    days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds remaining"

  return (
    <span role="timer" aria-label={label} className="inline-flex items-center gap-1">
      {units.map(([value, unit]) => (
        <span
          key={unit}
          aria-hidden
          className="inline-flex items-baseline gap-0.5 rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 leading-none"
        >
          <span className="text-sm font-semibold tabular-nums">{pad(value)}</span>
          <span className="text-xs font-medium text-muted-foreground">{unit}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * The `banner-countdown` section slab: a limited-time promo bar with the live timer ticking
 * between the message and the CTA. Renders bare and full-bleed like the other banner sections.
 */
export function BannerCountdownSection() {
  return (
    <Banner variant="orange" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Tag weight="bold" />
      </BannerIcon>
      <BannerContent>Summer sale ends in</BannerContent>
      <BannerCountdown />
      <BannerAction href="#">
        Shop the sale
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  )
}
