"use client"

import * as React from "react"
import {
  ArrowUp,
  CheckCircle,
  Smiley,
  SmileyAngry,
  SmileyMeh,
  SmileySad,
  SmileyWink,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  TextareaRoot,
  TextareaField,
  TextareaFooter,
  TextareaCount,
} from "@/components/ui/textarea"
import { useDensity, type Density } from "@/lib/density"
import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * FeedbackForm: a compact sentiment + comment block. A single-select rating row (five faces via
 * ToggleGroup) reveals an optional comment field once a face is picked, then submits. It owns its
 * rating + message state; wire `onSubmit` to your feedback sink. See docs/ARCHITECTURE.md §2.
 *
 * The card root declares `--surface: var(--card)` so the nested ToggleGroup/Textarea blend with
 * the panel (the --surface contract).
 */
export const feedbackFormVariants = tv({
  slots: {
    root: "flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
    header: "flex flex-col gap-1.5",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    form: "flex flex-col gap-4",
    ratings: "w-full justify-between",
    // Bigger, friendlier faces (48px, concentric rounded-xl inside the rounded-2xl card). The
    // chosen face gives a gentle pop; an unselected face previews its lift on hover. Per-face
    // sentiment color is layered on per item (TONE_ITEM) so a pick reads emotionally, not just
    // as a neutral brand ring.
    ratingItem:
      "size-12 rounded-xl px-0 [&_svg]:size-7 data-[state=on]:scale-105 data-[state=off]:hover:scale-105",
    // Live caption echoing the chosen sentiment; reserves height so picking never shifts the row,
    // and eases its color as the sentiment changes.
    ratingLabel: "min-h-5 text-center text-sm font-medium transition-colors duration-fast ease-out",
    success: "flex flex-col items-center gap-3 text-center animate-in fade-in-0 zoom-in-95 duration-base ease-out",
    successTitle: "text-base font-semibold text-foreground",
    successText: "text-sm text-pretty text-muted-foreground",
  },
  // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For the form card it
  // governs the card padding, outer gap, title size, and success padding. `compact` is the
  // Koala default (16px padding/gap); `comfortable` is the spacious marketing alternative (24px).
  variants: {
    density: {
      compact: { root: "gap-4 p-4", title: "text-base", success: "py-2" },
      comfortable: { root: "gap-5 p-6", title: "text-lg", success: "py-4" },
    },
  },
  defaultVariants: {
    density: "compact",
  },
})

const RATINGS = [
  { value: "1", label: "Terrible", icon: SmileyAngry },
  { value: "2", label: "Bad", icon: SmileySad },
  { value: "3", label: "Okay", icon: SmileyMeh },
  { value: "4", label: "Good", icon: Smiley },
  { value: "5", label: "Great", icon: SmileyWink },
] as const

// Sentiment ramp for the *selected* face: red → orange → amber → green. Literal token classes
// (tv needs static strings); overrides the recipe's neutral brand ring so a pick reads emotionally.
const TONE_ITEM: Record<string, string> = {
  "1": "data-[state=on]:border-destructive data-[state=on]:text-destructive data-[state=on]:ring-destructive/15",
  "2": "data-[state=on]:border-orange data-[state=on]:text-orange data-[state=on]:ring-orange/15",
  "3": "data-[state=on]:border-warning data-[state=on]:text-warning data-[state=on]:ring-warning/15",
  "4": "data-[state=on]:border-success data-[state=on]:text-success data-[state=on]:ring-success/15",
  "5": "data-[state=on]:border-success data-[state=on]:text-success data-[state=on]:ring-success/15",
}

const TONE_LABEL: Record<string, string> = {
  "1": "text-destructive",
  "2": "text-orange",
  "3": "text-warning",
  "4": "text-success",
  "5": "text-success",
}

const MESSAGE_MAX = 280

export interface FeedbackFormData {
  rating: string
  message: string
}

export interface FeedbackFormProps
  extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Called with `{ rating, message }` on submit. Return a promise to drive the spinner. */
  onSubmit?: (data: FeedbackFormData) => void | Promise<void>
}

export function FeedbackForm({
  title = "How was your experience?",
  description = "Your feedback helps us make the product better for everyone.",
  action = "Send feedback",
  density,
  onSubmit,
  className,
  ...props
}: FeedbackFormProps) {
  const slots = feedbackFormVariants({ density: useDensity(density) })
  const [rating, setRating] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")
  const activeLabel = RATINGS.find((r) => r.value === rating)?.label

  function handleRating(value: string) {
    // ToggleGroup single returns "" when the active item is toggled off; keep the selection.
    if (value) setRating(value)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!rating) return
    setStatus("loading")
    await Promise.resolve(onSubmit?.({ rating, message }))
    setStatus("success")
  }

  if (status === "success") {
    return (
      <div className={slots.root({ className })} {...props}>
        <div className={slots.success()} role="status">
          <CheckCircle weight="fill" className="size-12 text-success" />
          <p className={slots.successTitle()}>Thanks for the feedback</p>
          <p className={slots.successText()}>We read every response and use it to improve.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      <form className={slots.form()} onSubmit={handleSubmit}>
        <ToggleGroup
          type="single"
          value={rating}
          onValueChange={handleRating}
          className={slots.ratings()}
          aria-label="Rate your experience"
        >
          {RATINGS.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className={cn(slots.ratingItem(), TONE_ITEM[value])}
            >
              <Icon weight="bold" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p
          className={cn(
            slots.ratingLabel(),
            rating ? TONE_LABEL[rating] : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {activeLabel ?? "Tap a face to rate"}
        </p>

        {rating && (
          <Field className="animate-in fade-in-0 slide-in-from-top-1 duration-base ease-out">
            <FieldLabel>Tell us more (optional)</FieldLabel>
            <TextareaRoot resize="none">
              <TextareaField
                autoResize
                placeholder="What went well, or what could be better?"
                maxLength={MESSAGE_MAX}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <TextareaFooter>
                <span />
                <TextareaCount current={message.length} max={MESSAGE_MAX} />
              </TextareaFooter>
            </TextareaRoot>
          </Field>
        )}

        <Button
          type="submit"
          size="lg"
          loading={status === "loading"}
          disabled={!rating}
          className="w-full"
        >
          <ArrowUp weight="bold" />
          {action}
        </Button>
      </form>
    </div>
  )
}
