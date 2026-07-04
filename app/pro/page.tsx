import Link from "next/link"
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Koala UI Pro",
  description: "Unlock the polished, copy-paste marketing sections and app templates.",
}

// The Stripe Payment Link (one-time, lifetime). Set in the deployment env; falls back to the
// pricing page if unset so the button is never dead.
const BUY_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#"
// Display only — Stripe is the source of truth for the actual charge.
const PRICE = "€99"

const INCLUDED = [
  "Every marketing section: heroes, pricing, feature grids, testimonials, CTAs, footers",
  "Full landing-page and app-screen templates",
  "Owned source, copied into your repo — yours to edit forever",
  "Lifetime updates and new sections as they ship",
]

export default function ProPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Koala UI Pro</h1>
          <p className="text-pretty text-muted-foreground">
            The components are free. Pro unlocks the polished, copy-paste{" "}
            <strong className="text-foreground">sections and templates</strong> the whole system
            is built to compose.
          </p>
        </div>

        {/* The plan: a single lifetime purchase. */}
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight">{PRICE}</span>
            <span className="text-sm text-muted-foreground">one-time · lifetime</span>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {INCLUDED.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span className="text-pretty text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button asChild className="mt-6 w-full">
            <a href={BUY_URL}>
              Get lifetime access
              <ArrowRight aria-hidden />
            </a>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm text-muted-foreground">
            Already purchased? Activate your key:
          </p>
          <code className="rounded-md border border-border bg-muted/40 px-2.5 py-1 font-mono text-sm">
            koalaui login &lt;key&gt;
          </code>
        </div>

        <Link
          href="/docs/components"
          className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Or browse the free components
        </Link>
      </div>
    </main>
  )
}
