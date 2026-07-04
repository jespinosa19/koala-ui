"use client"

import * as React from "react"
import { CheckCircle, EnvelopeSimple } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * NewsletterForm: a ready-to-ship email-capture block. Two layouts: a single-row `inline`
 * signup for footers and hero sections, and a self-contained `card` with a heading, lead, and
 * fine print. Composes Input + Button; it owns only its email + submit state, so dropping it on
 * a page Just Works. Wire `onSubscribe` to your API. The local handler simulates the request so
 * the loading to success flow ships out of the box. See docs/ARCHITECTURE.md §2.
 *
 * The card root declares `--surface: var(--card)` so the nested Input blends with the panel
 * instead of painting a darker `--background` block (the --surface contract).
 */
export const newsletterFormVariants = tv({
  slots: {
    root: "w-full",
    // Card surface: concentric radius (rounded-2xl outer, controls stay rounded-md inside).
    card: "flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
    header: "flex flex-col gap-1.5",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    // The control row: input grows, button hugs. Stacks below sm so the button isn't cramped.
    form: "flex flex-col gap-2 sm:flex-row sm:items-center",
    input: "w-full",
    fineprint: "text-xs text-pretty text-muted-foreground",
    // Success panel that replaces the form once subscribed.
    success: "flex items-center gap-2.5 text-sm font-medium text-success animate-in fade-in-0 duration-base ease-out",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): card padding, gap, and
    // title size. `compact` is the Koala default (16px); `comfortable` is 24px. Declared before
    // `variant` so the inline override (p-0/gap-2) still wins via tailwind-merge.
    density: {
      compact: { card: "gap-4 p-4", title: "text-base" },
      comfortable: { card: "gap-5 p-6", title: "text-lg" },
    },
    variant: {
      card: {},
      // Inline: no card chrome, just the row, for footers and hero sections.
      inline: { card: "gap-2 border-0 bg-transparent p-0 shadow-none [--surface:initial]" },
    },
  },
  defaultVariants: { variant: "card", density: "compact" },
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface NewsletterFormProps
  extends Omit<React.ComponentProps<"div">, "onSubmit" | "title">,
    VariantProps<typeof newsletterFormVariants> {
  /** Heading shown above the form (card variant only). */
  title?: React.ReactNode
  /** Supporting line under the heading (card variant only). */
  description?: React.ReactNode
  /** Placeholder for the email field. */
  placeholder?: string
  /** Submit button label. */
  action?: React.ReactNode
  /** Small print under the form (card variant only). Pass `null` to hide. */
  fineprint?: React.ReactNode
  /** Called with the entered email on a valid submit. Return a promise to drive the spinner. */
  onSubscribe?: (email: string) => void | Promise<void>
}

export function NewsletterForm({
  variant,
  density,
  title = "Subscribe to our newsletter",
  description = "Product updates, design tips, and the occasional deep dive. No spam, unsubscribe anytime.",
  placeholder = "you@company.com",
  action = "Subscribe",
  fineprint = "We care about your data. Read our privacy policy.",
  onSubscribe,
  className,
  ...props
}: NewsletterFormProps) {
  const slots = newsletterFormVariants({ variant, density: useDensity(density) })
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const isInline = variant === "inline"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setStatus("error")
      return
    }
    setStatus("loading")
    // Replace this with your real request. The await keeps the spinner honest.
    await Promise.resolve(onSubscribe?.(email))
    setStatus("success")
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    if (status === "error") setStatus("idle")
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.card()}>
        {!isInline && (
          <div className={slots.header()}>
            <h3 className={slots.title()}>{title}</h3>
            {description != null && <p className={slots.description()}>{description}</p>}
          </div>
        )}

        {status === "success" ? (
          <p className={slots.success()} role="status">
            <CheckCircle weight="fill" className="size-5 shrink-0" />
            You&apos;re subscribed. Check your inbox to confirm.
          </p>
        ) : (
          <form className={slots.form()} onSubmit={handleSubmit} noValidate>
            <InputRoot
              size="md"
              hasError={status === "error"}
              className={slots.input()}
            >
              <InputPrefix>
                <EnvelopeSimple weight="bold" />
              </InputPrefix>
              <InputField
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={placeholder}
                aria-label="Email address"
                aria-invalid={status === "error"}
                value={email}
                onChange={handleChange}
              />
            </InputRoot>
            <Button
              type="submit"
              size="md"
              loading={status === "loading"}
              className="shrink-0 max-sm:w-full"
            >
              {action}
            </Button>
          </form>
        )}

        {!isInline && fineprint != null && status !== "success" && (
          <p className={slots.fineprint()}>{fineprint}</p>
        )}
      </div>
    </div>
  )
}
