"use client"

import * as React from "react"
import { Star } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

/**
 * Rating: a 1-to-N star rating. Single-part (one `tv` recipe with `slots`: the row, each star
 * button, and the two stacked glyphs that paint the fill).
 *
 * Interactive ratings ride on **Radix RadioGroup** for a11y for free: roving focus, arrow-key
 * increment/decrement, a single selected value, with each star as a radio item. Hovering previews
 * the value up to the cursor; the committed selection shows when the pointer leaves.
 *
 * The default `filled` variant is the classic solid-star look: the *active* glyph renders at
 * Phosphor's `weight="fill"` (the empty one stays outline), revealed by a clip that widens with the
 * value, so a half star reads as a half-solid star. Rating is the one place the DS opts out of the
 * "icons always outline" rule, because a filled star is the universal affordance. `variant="outline"`
 * is the rule-preserving alternative: the active glyph is just a tinted outline.
 *
 * The active glyph's hue is the `tone` variant: `amber` (default) is the vivid review-gold for
 * stars; `red` is the love-red for a `Heart` icon. Both ride dedicated `--rating*` tokens that are
 * brighter than the `--warning` status hue (which stays dark enough to read as warning text).
 *
 * `readOnly` drops the RadioGroup for a static, fraction-capable display (e.g. an average of 4.3).
 *
 * `"use client"`: interactive state (hover preview, selection) and Radix RadioGroup.
 */

// polish: a star is 16-24px, under the 40px hit target (#9). A transparent pseudo-element extends
// the click area *vertically only*: extending horizontally would overlap the adjacent star (#16).
const hitY =
  "before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']"

export const ratingVariants = tv({
  slots: {
    root: "inline-flex items-center gap-0.5",
    item: [
      "relative inline-flex shrink-0 items-center justify-center rounded-sm p-0.5",
      // Only the press scales (#12); never `transition: all` (#14).
      "transition-transform duration-fast ease-out active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      hitY,
    ],
    // The star is two stacked outline glyphs; `star` is the sizing wrapper.
    star: "relative inline-flex shrink-0",
    // Empty glyph: a quiet outline that sits under the colored fill.
    starEmpty: "text-muted-foreground/35",
    // Clip that reveals the colored glyph from the left; its width is the fill percentage.
    fillClip: "absolute inset-y-0 left-0 overflow-hidden",
    // Colored (active) glyph: its hue comes from the `tone` variant below.
    starFull: "",
  },
  variants: {
    size: {
      sm: { star: "size-4", starEmpty: "size-4", starFull: "size-4" },
      md: { star: "size-5", starEmpty: "size-5", starFull: "size-5" },
      lg: { star: "size-7", starEmpty: "size-7", starFull: "size-7" },
    },
    // `filled` (default) is the solid-star look: the active glyph renders at weight="fill" in the
    // component and the empty star fades a touch so it reads as a track. `outline` keeps the DS rule.
    variant: {
      outline: {},
      filled: { starEmpty: "text-muted-foreground/25" },
    },
    // The active glyph's hue. `amber` (default) is the vivid review-gold for stars; `red` is the
    // love-red for hearts (a filled heart reads as red, not gold). Both ride dedicated rating
    // tokens, intentionally brighter than --warning (see globals.css).
    tone: {
      amber: { starFull: "text-rating" },
      red: { starFull: "text-rating-red" },
    },
    interactive: {
      true: { item: "cursor-pointer" },
      false: {},
    },
  },
  defaultVariants: {
    size: "md",
    variant: "filled",
    tone: "amber",
    interactive: true,
  },
})

type RatingSlots = ReturnType<typeof ratingVariants>

// A single star: the empty outline with the colored outline clipped over it to `pct` width. The
// inner colored glyph keeps the full star width so the clip reveals a clean partial silhouette.
function RatingStar({
  pct,
  slots,
  icon: IconComp,
  fullWeight,
}: {
  pct: number
  slots: RatingSlots
  icon: Icon
  /** Phosphor weight for the colored (active) glyph: "fill" for the filled variant. */
  fullWeight: "regular" | "fill"
}) {
  return (
    <span className={slots.star()} aria-hidden>
      <IconComp weight="bold" className={slots.starEmpty()} />
      <span className={slots.fillClip()} style={{ width: `${pct}%` }}>
        <IconComp className={slots.starFull()} weight={fullWeight} />
      </span>
    </span>
  )
}

export interface RatingProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue" | "dir">,
    VariantProps<typeof ratingVariants> {
  /** Number of stars (default 5). */
  max?: number
  /** Controlled value. Whole numbers when interactive; fractional allowed when `readOnly`. */
  value?: number
  /** Uncontrolled initial value (default 0). */
  defaultValue?: number
  /** Fires with the new whole-star value on select. */
  onValueChange?: (value: number) => void
  /** Static, non-interactive display: supports fractional values (e.g. an average). */
  readOnly?: boolean
  disabled?: boolean
  /** Submitted under this name (maps to the RadioGroup form field). */
  name?: string
  /** Swap the star for another Phosphor icon (heart, etc.). Rendered in outline weight. */
  icon?: Icon
  /** Accessible group label; also used to build each star's label (e.g. "Rate 3 of 5"). */
  "aria-label"?: string
}

export function Rating({
  className,
  size,
  variant,
  tone,
  max = 5,
  value,
  defaultValue,
  onValueChange,
  readOnly = false,
  disabled = false,
  name,
  icon = Star,
  "aria-label": ariaLabel = "Rating",
  ...props
}: RatingProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue ?? 0)
  const selected = isControlled ? value : internal
  const [hover, setHover] = React.useState<number | null>(null)

  const stars = Array.from({ length: Math.max(0, max) }, (_, i) => i + 1)
  // Fill percentage for star `i` (1-based) given the active value (whole or fractional).
  const fillFor = (i: number, active: number) =>
    Math.max(0, Math.min(100, (active - (i - 1)) * 100))
  // The colored glyph goes solid for the (default) filled variant; only `outline` stays regular.
  const fullWeight = variant === "outline" ? "regular" : "fill"

  // ── Read-only display ──────────────────────────────────────────────────────
  if (readOnly) {
    const slots = ratingVariants({ size, variant, tone, interactive: false })
    return (
      <div
        data-slot="rating"
        role="img"
        aria-label={`${ariaLabel}: ${selected} of ${max}`}
        className={slots.root({ className })}
        {...props}
      >
        {stars.map((i) => (
          <span key={i} className={slots.item()}>
            <RatingStar pct={fillFor(i, selected)} slots={slots} icon={icon} fullWeight={fullWeight} />
          </span>
        ))}
      </div>
    )
  }

  // ── Interactive (Radix RadioGroup) ───────────────────────────────────────────
  const slots = ratingVariants({ size, variant, tone, interactive: true })
  const active = hover ?? selected
  const select = (next: number) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }
  const clearHover = () => setHover(null)

  return (
    <RadioGroupPrimitive.Root
      data-slot="rating"
      aria-label={ariaLabel}
      className={slots.root({ className })}
      value={String(selected)}
      onValueChange={(v) => select(Number(v))}
      disabled={disabled}
      name={name}
      onPointerLeave={clearHover}
      {...props}
    >
      {stars.map((i) => (
        <RadioGroupPrimitive.Item
          key={i}
          value={String(i)}
          aria-label={`${ariaLabel.replace(/:.*/, "")} ${i} of ${max}`}
          className={slots.item()}
          onMouseEnter={() => !disabled && setHover(i)}
        >
          <RatingStar pct={fillFor(i, active)} slots={slots} icon={icon} fullWeight={fullWeight} />
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}
