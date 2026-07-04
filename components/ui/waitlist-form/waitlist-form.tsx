"use client"

import * as React from "react"
import { ArrowRight, CheckCircle } from "@phosphor-icons/react"

import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { InputRoot, InputField } from "@/components/ui/input"
import { useDensity, type Density } from "@/lib/density"
import { tv } from "@/lib/tv"

/**
 * WaitlistForm: a centered "join the waitlist" block: a headline, a one-row email capture, and a
 * social-proof footer (overlapping avatars + a running count). On submit it flips to a confirmed
 * state. It owns its email + status; wire `onJoin` to your list. See docs/ARCHITECTURE.md §2.
 *
 * The card root declares `--surface: var(--card)` so the nested Input blends with the panel (the
 * --surface contract).
 */
export const waitlistFormVariants = tv({
  slots: {
    root: "flex w-full max-w-md flex-col items-center rounded-2xl border border-border bg-card text-center text-card-foreground shadow-xs [--surface:var(--card)]",
    badge:
      "inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand",
    header: "flex flex-col gap-2",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    form: "flex w-full flex-col gap-2 sm:flex-row sm:items-center",
    proof: "flex items-center gap-3",
    // Overlapping avatar stack; ring-card lifts each off the one behind it.
    avatars: "flex -space-x-2",
    avatar: "ring-2 ring-card",
    count: "text-sm text-muted-foreground tabular-nums",
    success: "flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-base ease-out",
    successTitle: "text-lg font-semibold text-foreground",
    successText: "text-sm text-pretty text-muted-foreground",
  },
  // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): card padding, outer gap,
  // and title size. `compact` is the Koala default (16px); `comfortable` is 24px.
  variants: {
    density: {
      compact: { root: "gap-4 p-4", title: "text-xl" },
      comfortable: { root: "gap-6 p-6", title: "text-2xl" },
    },
  },
  defaultVariants: {
    density: "compact",
  },
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface WaitlistAvatar {
  src?: string
  fallback: string
  alt?: string
}

const DEFAULT_AVATARS: WaitlistAvatar[] = [
  { fallback: "AK", alt: "Member" },
  { fallback: "JD", alt: "Member" },
  { fallback: "MR", alt: "Member" },
  { fallback: "SL", alt: "Member" },
]

export interface WaitlistFormProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  /** Small pill above the headline. Pass `null` to hide. */
  badge?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
  /** Join button label. */
  action?: React.ReactNode
  /** Number of people already on the list, shown beside the avatars. */
  count?: number
  /** Avatars for the social-proof stack. */
  avatars?: WaitlistAvatar[]
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Called with the entered email on a valid submit. Return a promise to drive the spinner. */
  onJoin?: (email: string) => void | Promise<void>
}

export function WaitlistForm({
  badge = "Early access",
  title = "Join the waitlist",
  description = "Be the first to know when we launch. We'll send a single email when your invite is ready.",
  placeholder = "you@company.com",
  action = "Join",
  count = 1200,
  avatars = DEFAULT_AVATARS,
  density,
  onJoin,
  className,
  ...props
}: WaitlistFormProps) {
  const slots = waitlistFormVariants({ density: useDensity(density) })
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setStatus("error")
      return
    }
    setStatus("loading")
    await Promise.resolve(onJoin?.(email))
    setStatus("success")
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    if (status === "error") setStatus("idle")
  }

  if (status === "success") {
    return (
      <div className={slots.root({ className })} {...props}>
        <div className={slots.success()} role="status">
          <CheckCircle weight="fill" className="size-12 text-success" />
          <p className={slots.successTitle()}>You&apos;re on the list</p>
          <p className={slots.successText()}>
            We&apos;ll email <span className="font-medium text-foreground">{email}</span> the moment
            your invite is ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={slots.root({ className })} {...props}>
      {badge != null && <span className={slots.badge()}>{badge}</span>}

      <div className={slots.header()}>
        <h3 className={slots.title()}>{title}</h3>
        {description != null && <p className={slots.description()}>{description}</p>}
      </div>

      <form className={slots.form()} onSubmit={handleSubmit} noValidate>
        <InputRoot size="lg" hasError={status === "error"} className="w-full">
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
          size="lg"
          loading={status === "loading"}
          className="shrink-0 max-sm:w-full"
        >
          {action}
          <ArrowRight weight="bold" />
        </Button>
      </form>

      {count != null && count > 0 && (
        <div className={slots.proof()}>
          <div className={slots.avatars()}>
            {avatars.map((avatar, index) => (
              <AvatarRoot key={index} size="sm" className={slots.avatar()}>
                {avatar.src && <AvatarImage src={avatar.src} alt={avatar.alt ?? ""} />}
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </AvatarRoot>
            ))}
          </div>
          <p className={slots.count()}>
            <span className="font-medium text-foreground">{count.toLocaleString()}+</span> already
            joined
          </p>
        </div>
      )}
    </div>
  )
}
