"use client"

import type { CSSProperties } from "react"
import { LockSimple } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Where "Get full code" sends shoppers. The storefront pricing page on koalaui.com. */
const PRICING_URL = "https://koalaui.com/pricing"

/**
 * PremiumCode: the locked stand-in for a code block on a paid (PRO) docs page. The live
 * preview stays visible (it's the showcase); the source is gated behind a "Get full code"
 * CTA. A clean, empty code surface, the same rounded/bordered card as CodeSnippet, with the
 * lock and CTA centered on it. No faux source behind the gate.
 *
 * Drop it anywhere a CodeSnippet would go on a PRO page, or pass `locked` to
 * ComponentPreview to swap its Code tab for this.
 */
export interface PremiumCodeProps {
  /** Headline above the CTA. @default "This is a Pro component" */
  title?: string
  /** Supporting line under the headline. */
  description?: string
  className?: string
  /**
   * Inline styles for the root. Used to match the sibling Preview tab's height so switching
   * tabs never jumps (ComponentPreview passes a measured `minHeight`).
   */
  style?: CSSProperties
}

export function PremiumCode({
  title = "This is a Pro component",
  description = "The full source ships with Koala UI Pro. Grab a license to copy it into your project.",
  className,
  style,
}: PremiumCodeProps) {
  return (
    <div
      style={style}
      className={cn(
        "flex flex-col items-center justify-center gap-3.5 rounded-xl border border-border bg-card px-6 py-14 text-center shadow-xs",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border ring-inset"
      >
        <LockSimple weight="bold" className="size-[1.35rem]" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold tracking-tight">{title}</p>
        <p className="mx-auto max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Button asChild variant="secondary" size="sm" className="mt-1">
        <a href={PRICING_URL} target="_blank" rel="noopener noreferrer">
          Get full code
        </a>
      </Button>
    </div>
  )
}
