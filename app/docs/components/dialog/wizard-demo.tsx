"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, FolderPlus } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { dialogVariants } from "@/components/ui/dialog"
import { DensityProvider } from "@/lib/density"
import { InputRoot, InputField, InputLabel } from "@/components/ui/input"
import { Stagger } from "@/lib/stagger"
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
} from "@/components/ui/stepper"
import { InlineClose } from "./inline-close"

const STEPS = [
  { title: "Details", description: "Name your project" },
  { title: "Members", description: "Invite your team" },
  { title: "Review", description: "Confirm and create" },
] as const

/**
 * A multi-step create flow with a vertical step rail (title + description per step) on the left
 * and the active step's form on the right: the larger-wizard pattern (Upwork-style).
 *
 * Rendered inline (the real `dialogVariants` slots, no Radix Root/Portal) so the whole flow is
 * visible without a trigger to click; stepping forward/back, the Stagger cascade, and the loading
 * submit all stay live. `DensityProvider` mirrors what a `density="compact"` DialogContent gives
 * its children, so the inputs/buttons sit as tightly as the real dialog. The Code tab shows the
 * openable `Dialog` version.
 */
export function WizardDialogDemo() {
  const [step, setStep] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)
  // The flow carries its own values through to the Review step, like Upwork/Squarespace's
  // create wizards. The last screen confirms exactly what the user typed, not placeholders.
  const [name, setName] = React.useState("")
  const [projectKey, setProjectKey] = React.useState("")
  const [email, setEmail] = React.useState("")
  const isLast = step === STEPS.length
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const slots = dialogVariants({ size: "lg", density: "compact", bordered: true })

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function create() {
    setSubmitting(true)
    // Simulate the request, then loop back to the first step (an inline preview never closes).
    timer.current = setTimeout(() => {
      setSubmitting(false)
      setStep(1)
      setName("")
      setProjectKey("")
      setEmail("")
    }, 1200)
  }

  return (
    <div className={slots.content()}>
      <DensityProvider density="compact">
        <div className={slots.icon()}>
          <FolderPlus weight="bold" />
        </div>
        <div className={slots.header()}>
          <h2 className={slots.title()}>Create project</h2>
          <p className={slots.description()}>Set up your workspace in a few steps.</p>
        </div>

        {/* Tighter gap on a phone so the form column keeps a usable width beside the rail. */}
        <div className="grid grid-cols-[auto_1fr] items-start gap-4 sm:gap-8">
          {/* Step rail: vertical Stepper with solid, brand-filled indicators (check when done) and
              no connectors, the bolder Calendly-style rail. Runs at comfortable density so the
              circles and labels read larger than the compact form on the right. */}
          <Stepper
            value={step}
            onValueChange={setStep}
            orientation="vertical"
            variant="solid"
            density="comfortable"
            className="pr-2"
          >
            {STEPS.map((s, i) => {
              const n = i + 1
              return (
                <StepperItem
                  key={s.title}
                  step={n}
                  disabled={submitting || n > step}
                  loading={submitting && n === step}
                  // No connectors, so tighten the per-step reserve (the default leaves room for
                  // the line). 2.75rem keeps each row's 40px hit area from overlapping its
                  // neighbour while still reading as a compact list.
                  className="[&:not(:last-child)]:min-h-[2.75rem]"
                >
                  <StepperTrigger className="items-center">
                    <StepperIndicator />
                    <StepperTitle className="font-semibold">{s.title}</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              )
            })}
          </Stepper>

          {/*
           * `key={step}` remounts the body each transition, so Stagger replays its rise+fade
           * cascade for the new step's fields. `min-h` keeps the body at least as tall as the
           * rail (content-start pins to the top) so the dialog never jumps as steps swap.
           */}
          <Stagger key={step} className="grid min-h-[18rem] content-start gap-3">
            {step === 1 && (
              <div className="grid gap-1.5">
                <InputLabel htmlFor="wz-name">Project name</InputLabel>
                <InputRoot>
                  <InputField
                    id="wz-name"
                    placeholder="Apollo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </InputRoot>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-1.5">
                <InputLabel htmlFor="wz-key">Project key</InputLabel>
                <InputRoot>
                  <InputField
                    id="wz-key"
                    placeholder="APO"
                    value={projectKey}
                    onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                  />
                </InputRoot>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-1.5">
                <InputLabel htmlFor="wz-invite">Invite by email</InputLabel>
                <InputRoot>
                  <InputField
                    id="wz-invite"
                    type="email"
                    placeholder="teammate@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputRoot>
              </div>
            )}
            {step === 3 && (
              <p className="text-sm text-pretty text-muted-foreground">
                You&apos;re all set. Review the details below, then create your project. You can
                change everything later in settings.
              </p>
            )}
            {step === 3 && (
              // Concentric with the dialog (rounded-xl → rounded-lg); hairline row dividers via a
              // 1px gap over the border color, each row repainting the popover surface.
              <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
                <SummaryRow label="Name" value={name || "Apollo"} />
                <SummaryRow label="Key" value={projectKey || "APO"} />
                <SummaryRow label="Invite" value={email || "teammate@acme.com"} />
              </dl>
            )}
          </Stagger>
        </div>

        <div className={slots.footer({ className: "sm:justify-between" })}>
          <Button
            variant="ghost"
            disabled={step === 1 || submitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ArrowLeft weight="bold" /> Back
          </Button>
          {isLast ? (
            <Button onClick={create} loading={submitting}>
              Create project
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight weight="bold" />
            </Button>
          )}
        </div>
      </DensityProvider>
      <InlineClose density="compact" />
    </div>
  )
}

/** One label/value row in the Review summary. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-popover px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}
