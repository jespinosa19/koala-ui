"use client"

import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

/**
 * Suggestions: inline AI edit suggestions over a body of text. The AI marks spans that could
 * be improved; each `SuggestionMark` shows a colored dotted underline (by category), and clicking
 * it opens a popover with the proposed replacement and a reason. "Apply" swaps the text in
 * place; "Dismiss" keeps the original. A fourth piece of the AI module: the Grammarly/Notion
 * "suggested edits" pattern, built on our Popover + Button + Badge.
 */
const suggestionVariants = tv({
  slots: {
    // The prose container the marks live in.
    root: "text-pretty leading-relaxed text-foreground",
    // The marked span: a focusable inline control with a category-colored dotted underline.
    // Text color is inherited (the word stays readable); only the underline + hover tint carry
    // the category color. Resets the native button box so it flows inline with the copy.
    mark: [
      "inline cursor-pointer rounded-sm p-0 align-baseline",
      "underline decoration-2 decoration-dotted underline-offset-2",
      "transition-colors duration-fast ease-out outline-none",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "data-[state=open]:bg-accent",
    ],
    // Popover card.
    card: "flex flex-col gap-3",
    header: "flex items-center justify-between gap-2",
    // original to suggested, stacked like a small diff.
    diff: "flex flex-col gap-1 text-sm",
    original: "text-muted-foreground line-through decoration-1",
    suggested: "font-medium text-foreground",
    reason: "text-xs text-pretty text-muted-foreground",
    actions: "flex items-center justify-end gap-2",
    // The applied-edit morph: an inline grid that tweens its own width from the old text's to the
    // new text's (measured + transitioned in JS; two competing fr tracks can't morph an auto width
    // reliably). Both cells stack in the one grid cell; the swap reads as a slot flip: the old line
    // slides up and out while the new line rises from below into place ("one out, one in"), with the
    // width tweening underneath so the surrounding copy reflows smoothly instead of snapping.
    // Clipping is `clip-path: inset(0)`, NOT overflow: any overflow other than visible re-anchors an
    // inline box's baseline to its bottom edge (CSS2 §10.8.1) and lifts the text off the line, while
    // clip-path clips at paint time without touching layout or baseline. `items-baseline` makes the
    // grid expose the cells' text baseline so it sits on the surrounding copy's line.
    morph: "inline-grid items-baseline align-baseline [clip-path:inset(0)] transition-[width] duration-base ease-out",
    // Each cell sits at its own intrinsic width (`w-max`, single line) so we can measure it and let
    // the container clip it. Old fades + slides up and out; new fades + slides up from below into
    // center with a category-tinted flash (globals.css). Transform is driven inline (Tailwind v4
    // maps translate-* to the standalone `translate` prop, which `transition-[…,transform]` would
    // skip), so we name `transform` here and set it via style on each cell.
    morphOld: "col-start-1 row-start-1 w-max whitespace-nowrap transition-[opacity,transform] duration-base ease-out",
    morphNew: "col-start-1 row-start-1 w-max whitespace-nowrap rounded-sm transition-[opacity,background-color,transform] duration-base ease-out",
  },
  variants: {
    variant: {
      default: { mark: "decoration-brand hover:bg-brand/10" },
      grammar: { mark: "decoration-destructive hover:bg-destructive/10" },
      clarity: { mark: "decoration-info hover:bg-info/10" },
      tone: { mark: "decoration-purple hover:bg-purple/10" },
    },
  },
  defaultVariants: { variant: "default" },
})

type Variant = NonNullable<VariantProps<typeof suggestionVariants>["variant"]>

// Per-category badge tint + default label for the popover header.
const CATEGORY: Record<Variant, { badge: React.ComponentProps<typeof Badge>["variant"]; label: string }> = {
  default: { badge: "secondary", label: "Suggestion" },
  grammar: { badge: "destructive", label: "Grammar" },
  clarity: { badge: "info", label: "Clarity" },
  tone: { badge: "purple", label: "Tone" },
}

// ─── Context ──────────────────────────────────────────────────────────────────

const [SuggestionsProvider, useSuggestionsContext] = createContext<{
  onApply?: (suggestion: string, original: string) => void
  onDismiss?: (original: string) => void
}>("Suggestions")

// ─── Suggestions (root) ─────────────────────────────────────────────────────

export interface SuggestionsProps extends React.ComponentProps<"div"> {
  /** Called when any mark is applied, with the replacement and the original text. */
  onApply?: (suggestion: string, original: string) => void
  /** Called when any mark is dismissed, with the original text. */
  onDismiss?: (original: string) => void
}

export function Suggestions({ className, onApply, onDismiss, ...props }: SuggestionsProps) {
  const { root } = suggestionVariants()
  return (
    <SuggestionsProvider onApply={onApply} onDismiss={onDismiss}>
      <div data-slot="suggestions" className={root({ className })} {...props} />
    </SuggestionsProvider>
  )
}

// ─── SuggestionMark ───────────────────────────────────────────────────────────

export interface SuggestionMarkProps
  extends Omit<React.ComponentProps<"button">, "onSelect"> {
  /** The replacement text applied in place of the children when accepted. */
  suggestion: string
  /** Category: tints the underline and the popover badge. @default "default" */
  variant?: Variant
  /** Short category label in the popover header. Defaults to the variant's name. */
  label?: string
  /** One-line explanation of the suggestion. */
  reason?: string
  /** Per-mark apply/dismiss hooks (the root's run too). */
  onApply?: (suggestion: string) => void
  onDismiss?: () => void
}

export function SuggestionMark({
  suggestion,
  variant = "default",
  label,
  reason,
  className,
  children,
  onApply,
  onDismiss,
  ...props
}: SuggestionMarkProps) {
  const ctx = useSuggestionsContext("SuggestionMark")
  const slots = suggestionVariants({ variant })
  const [status, setStatus] = React.useState<
    "pending" | "applying" | "applied" | "dismissed"
  >("pending")
  // The morph's measured endpoints (old → new width) and a one-frame-later "go" flag: the width
  // tween + cross-fade only kick in once the start state has painted (mirrors the Tabs indicator).
  const morphRef = React.useRef<HTMLSpanElement>(null)
  const [morph, setMorph] = React.useState<{ from: number; to: number } | null>(null)
  const [settled, setSettled] = React.useState(false)

  // The original text, read from children for the diff + the root callbacks.
  const original = typeof children === "string" ? children : ""
  const category = CATEGORY[variant]

  // Measure the two cells at their intrinsic widths, commit the morph at the start state (old text,
  // old width), then flip to the end state only AFTER that start state has actually painted, so the
  // transitions run instead of snapping straight to the end. useLayoutEffect runs before paint, so
  // the natural max-content frame never shows; the double rAF is the key: a single rAF scheduled
  // from the layout phase still fires in the same frame *before* the start paints, so the browser
  // only ever sees the end value (a hard cut). The first rAF lets the start state paint; the second
  // flips to the end. setState stays nested in named helpers (repo lint forbids bare
  // set-state-in-effect).
  React.useLayoutEffect(() => {
    if (status !== "applying") return
    const el = morphRef.current
    if (!el) return

    function measure() {
      const oldCell = el!.querySelector<HTMLElement>('[data-cell="old"]')
      const newCell = el!.querySelector<HTMLElement>('[data-cell="new"]')
      if (!oldCell || !newCell) return
      setMorph({
        from: oldCell.getBoundingClientRect().width,
        to: newCell.getBoundingClientRect().width,
      })
    }
    function go() {
      setSettled(true)
    }

    measure()
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(go)
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [status])

  function apply() {
    onApply?.(suggestion)
    ctx.onApply?.(suggestion, original)
    // Honor reduced-motion: skip the morph and settle straight to the replacement.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setStatus(reduce ? "applied" : "applying")
  }

  function dismiss() {
    setStatus("dismissed")
    onDismiss?.()
    ctx.onDismiss?.(original)
  }

  // The morph finished: collapse the grid to a single plain text node so the replacement wraps and
  // flows like the rest of the copy. Key off the new cell's opacity (it always tweens 0 → 1, so it
  // fires even when old and new happen to be the same width and the width tween is a no-op).
  function onMorphEnd(event: React.TransitionEvent<HTMLSpanElement>) {
    const target = event.target as HTMLElement
    if (event.propertyName === "opacity" && target.dataset.cell === "new") {
      setStatus("applied")
    }
  }

  // Applying: play the old → new morph in place of the popover, then collapse to plain text.
  if (status === "applying") {
    return (
      <span
        ref={morphRef}
        data-slot="suggestion-applied"
        data-variant={variant}
        data-settled={settled ? "true" : "false"}
        onTransitionEnd={onMorphEnd}
        className={slots.morph()}
        style={morph ? { width: settled ? morph.to : morph.from } : undefined}
      >
        <span
          aria-hidden
          data-cell="old"
          className={slots.morphOld()}
          style={{
            opacity: settled ? 0 : 1,
            transform: settled ? "translateY(-100%)" : "translateY(0)",
          }}
        >
          {children}
        </span>
        <span
          data-cell="new"
          className={slots.morphNew()}
          style={{
            opacity: settled ? 1 : 0,
            transform: settled ? "translateY(0)" : "translateY(100%)",
          }}
        >
          {suggestion}
        </span>
      </span>
    )
  }

  // Settled: the mark is plain text now: the accepted replacement, or the kept original.
  if (status !== "pending") {
    return (
      <span data-slot="suggestion-resolved" data-status={status}>
        {status === "applied" ? suggestion : children}
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        data-slot="suggestion-mark"
        className={slots.mark({ className })}
        {...props}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="start" density="compact" showArrow className="w-72">
        <div className={slots.card()}>
          <div className={slots.header()}>
            <Badge variant={category.badge} size="sm" dot>
              {label ?? category.label}
            </Badge>
          </div>
          <div className={slots.diff()}>
            <span className={slots.original()}>{children}</span>
            <span className={slots.suggested()}>{suggestion}</span>
          </div>
          {reason ? <p className={slots.reason()}>{reason}</p> : null}
          <div className={slots.actions()}>
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Dismiss
            </Button>
            <Button variant="primary" size="sm" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { suggestionVariants }
