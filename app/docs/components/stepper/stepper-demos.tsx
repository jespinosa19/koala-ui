"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogStepper,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InputRoot, InputField, InputLabel } from "@/components/ui/input"
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from "@/components/ui/stepper"

const STEPS = ["Your details", "Company", "Confirm"] as const

/** The hero: a controlled stepper driven by Back / Next, with click-to-jump on the steps. */
export function NavigableStepperDemo() {
  const [step, setStep] = React.useState(1)
  const isLast = step === STEPS.length

  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Stepper value={step} onValueChange={setStep} density="comfortable">
        {STEPS.map((title, i) => {
          const n = i + 1
          return (
            <StepperItem key={title} step={n}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
              {n < STEPS.length && <StepperSeparator />}
            </StepperItem>
          )
        })}
      </Stepper>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          <ArrowLeft weight="bold" /> Back
        </Button>
        <Button
          onClick={() => (isLast ? setStep(1) : setStep((s) => Math.min(STEPS.length, s + 1)))}
        >
          {isLast ? (
            <>
              <Check weight="bold" /> Done
            </>
          ) : (
            <>
              Next <ArrowRight weight="bold" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

const WIZARD = [
  { title: "Profile", description: "Tell us who you are" },
  { title: "Workspace", description: "Name your workspace" },
  { title: "Invite", description: "Add your teammates" },
] as const

/** The headline use case: a multi-step create flow inside a Dialog. */
export function WizardDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(1)
  const isLast = step === WIZARD.length

  function reset() {
    setStep(1)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>Create workspace</Button>
      </DialogTrigger>
      <DialogContent size="lg" density="compact">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>{WIZARD[step - 1].description}.</DialogDescription>
        </DialogHeader>

        <DialogStepper value={step} onValueChange={setStep}>
          {WIZARD.map((s, i) => {
            const n = i + 1
            return (
              <StepperItem key={s.title} step={n} disabled={n > step}>
                <StepperTrigger>
                  <StepperIndicator />
                  <StepperTitle>{s.title}</StepperTitle>
                </StepperTrigger>
                {n < WIZARD.length && <StepperSeparator />}
              </StepperItem>
            )
          })}
        </DialogStepper>

        <div className="grid gap-3">
          {step === 1 && (
            <>
              <div className="grid gap-1.5">
                <InputLabel htmlFor="wiz-name">Full name</InputLabel>
                <InputRoot>
                  <InputField id="wiz-name" placeholder="Alex Johnson" autoFocus />
                </InputRoot>
              </div>
              <div className="grid gap-1.5">
                <InputLabel htmlFor="wiz-email">Email</InputLabel>
                <InputRoot>
                  <InputField id="wiz-email" type="email" placeholder="alex@acme.com" />
                </InputRoot>
              </div>
            </>
          )}
          {step === 2 && (
            <div className="grid gap-1.5">
              <InputLabel htmlFor="wiz-ws">Workspace name</InputLabel>
              <InputRoot>
                <InputField id="wiz-ws" placeholder="Koala Inc." autoFocus />
              </InputRoot>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-1.5">
              <InputLabel htmlFor="wiz-invite">Invite by email</InputLabel>
              <InputRoot>
                <InputField id="wiz-invite" placeholder="teammate@acme.com" autoFocus />
              </InputRoot>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ArrowLeft weight="bold" /> Back
          </Button>
          <Button
            onClick={() => (isLast ? setOpen(false) : setStep((s) => s + 1))}
          >
            {isLast ? "Create workspace" : (
              <>
                Next <ArrowRight weight="bold" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
