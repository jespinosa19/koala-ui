"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Copy, Check, ArrowRight, SpinnerGap } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  SplitLayout,
  SplitPane,
  SplitPaneBody,
  SplitMedia,
} from "@/components/ui/layout"

// The Supabase Edge Functions base (e.g. https://<ref>.supabase.co/functions/v1). The success
// page polls the stripe-webhook GET endpoint until the webhook has minted the key.
const FUNCTIONS = process.env.NEXT_PUBLIC_KOALA_FUNCTIONS_URL ?? ""

// Right-side media: "Russafa" by Claudio Schwarz (Unsplash, photo 19q8mjvlumM).
const IMAGE =
  "https://images.unsplash.com/photo-1719658414944-e4ba1c6a340a?q=80&w=1600&auto=format&fit=crop"

type License = { key: string; email?: string | null }

/** A copy control that flips to a check for 1.5s (polish #2/#14). */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-muted-foreground outline-none transition duration-fast ease-out hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-brand"
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </button>
  )
}

/** Labelled, copyable monospace value (the key, the activate command). */
function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <code className="flex h-9 min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-md border border-border bg-muted/40 px-3 font-mono text-sm">
          {value}
        </code>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </div>
    </div>
  )
}

/** The page is always the split shell; only the left column's content changes by status. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <SplitLayout density="comfortable" className="min-h-svh">
      <SplitPane>
        {/* Brand lockup pins to the top; SplitPaneBody centers the content below it. */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/koala-logo.webp" alt="" aria-hidden width={24} height={24} className="size-6 rounded-md" />
          Koala UI
        </Link>
        <SplitPaneBody width="sm">{children}</SplitPaneBody>
      </SplitPane>
      <SplitMedia>
        {/* Plain img (no next/image remote config needed); object-cover fills the panel. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMAGE} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
      </SplitMedia>
    </SplitLayout>
  )
}

function SuccessInner() {
  const params = useSearchParams()
  const sessionId = params.get("session_id")
  // `?preview` renders the populated "ready" state with a sample key, for local design review.
  const preview = params.get("preview")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [license, setLicense] = useState<License | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let tries = 0

    function finish(next: "ready" | "error", lic?: License) {
      if (cancelled) return
      if (lic) setLicense(lic)
      setStatus(next)
    }

    async function poll() {
      tries += 1
      try {
        const res = await fetch(
          `${FUNCTIONS}/stripe-webhook?session_id=${encodeURIComponent(sessionId ?? "")}`,
        )
        if (res.status === 200) {
          finish("ready", (await res.json()) as License)
          return
        }
      } catch {
        // network blip: retry
      }
      if (tries >= 20) {
        finish("error")
        return
      }
      timer = setTimeout(poll, 1500)
    }

    if (preview) {
      finish("ready", { key: "koala_live_0000example0000key0000", email: "you@example.com" })
    } else if (!sessionId || !FUNCTIONS) {
      finish("error")
    } else {
      poll()
    }
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId, preview])

  if (status === "loading") {
    return (
      <Frame>
        <div className="flex flex-col gap-3">
          <SpinnerGap className="size-7 animate-spin text-muted-foreground" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Finalizing your purchase…
          </h1>
          <p className="text-pretty text-muted-foreground">
            Your license is being issued. This usually takes a few seconds.
          </p>
        </div>
      </Frame>
    )
  }

  if (status === "error" || !license) {
    return (
      <Frame>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              We couldn&rsquo;t load your license
            </h1>
            <p className="text-pretty text-muted-foreground">
              If you just paid, your key is on its way by email. Otherwise reach us at{" "}
              <a
                href="mailto:support@koalaui.com"
                className="font-medium text-foreground underline underline-offset-2"
              >
                support@koalaui.com
              </a>
              .
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/pro">Back to Pro</Link>
          </Button>
        </div>
      </Frame>
    )
  }

  return (
    <Frame>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Welcome to Koala UI Pro.
          </h1>
          <p className="text-pretty text-muted-foreground">
            You&rsquo;re all set. Your license is active, copy it and start dropping in Pro
            sections.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CopyRow label="License key" value={license.key} />
          <CopyRow label="Activate" value={`koalaui login ${license.key}`} />
          {license.email ? (
            <p className="text-xs text-muted-foreground">We also emailed it to {license.email}.</p>
          ) : null}
        </div>

        <Button asChild className="w-full">
          <Link href="/marketing/sections/hero">
            Browse Pro sections
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </Frame>
  )
}

export default function ProSuccessPage() {
  return (
    <Suspense
      fallback={
        <Frame>
          <SpinnerGap className="size-7 animate-spin text-muted-foreground" aria-hidden />
        </Frame>
      }
    >
      <SuccessInner />
    </Suspense>
  )
}
