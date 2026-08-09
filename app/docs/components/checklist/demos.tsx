"use client"

import * as React from "react"
import {
  ArrowCounterClockwise,
  CreditCard,
  GitBranch,
  RocketLaunch,
  Terminal,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Checklist,
  ChecklistDescription,
  ChecklistHeader,
  ChecklistItem,
  ChecklistItemAction,
  ChecklistItemContent,
  ChecklistItemDescription,
  ChecklistItemTitle,
  ChecklistItems,
  ChecklistProgress,
  ChecklistTitle,
} from "@/components/ui/checklist"

interface Step {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  cta: string
}

const STEPS: Step[] = [
  {
    id: "account",
    icon: <UserCircle weight="bold" />,
    title: "Create your account",
    description: "You're in. Welcome to Koala.",
    cta: "Done",
  },
  {
    id: "team",
    icon: <UsersThree weight="bold" />,
    title: "Invite your team",
    description: "Add teammates to collaborate on projects together.",
    cta: "Invite",
  },
  {
    id: "repo",
    icon: <GitBranch weight="bold" />,
    title: "Connect a repository",
    description: "Link your Git provider to sync changes automatically.",
    cta: "Connect",
  },
  {
    id: "cli",
    icon: <Terminal weight="bold" />,
    title: "Install the CLI",
    description: "Ship straight from your terminal with npx koalaui.",
    cta: "Install",
  },
  {
    id: "billing",
    icon: <CreditCard weight="bold" />,
    title: "Set up billing",
    description: "Add a payment method to move to production.",
    cta: "Add card",
  },
  {
    id: "deploy",
    icon: <RocketLaunch weight="bold" />,
    title: "Deploy your first project",
    description: "Push to main and watch it go live in seconds.",
    cta: "Deploy",
  },
]

/**
 * The hero demo: a live onboarding checklist. Two steps start done; completing the next
 * recommended step (the brand-highlighted `active` row) flows progress up, promotes the
 * following task, and — at 100% — turns the bar green.
 */
export function ChecklistDemo() {
  const [done, setDone] = React.useState<string[]>(() => ["account", "team"])

  // The active step is the first one still outstanding, in list order.
  const activeId = STEPS.find((s) => !done.includes(s.id))?.id
  const complete = done.length === STEPS.length

  const finish = (id: string) => setDone((d) => (d.includes(id) ? d : [...d, id]))

  return (
    <div className="w-full max-w-md">
      <Checklist value={done.length} total={STEPS.length}>
        <ChecklistHeader>
          <ChecklistTitle>Finish setting up your workspace</ChecklistTitle>
          <ChecklistDescription>
            A few quick steps to get the most out of Koala.
          </ChecklistDescription>
          <ChecklistProgress />
        </ChecklistHeader>

        <ChecklistItems>
          {STEPS.map((step) => {
            const isDone = done.includes(step.id)
            const status = isDone ? "complete" : step.id === activeId ? "active" : "todo"
            return (
              <ChecklistItem key={step.id} status={status} icon={step.icon}>
                <ChecklistItemContent>
                  <ChecklistItemTitle>{step.title}</ChecklistItemTitle>
                  <ChecklistItemDescription>{step.description}</ChecklistItemDescription>
                </ChecklistItemContent>
                {!isDone && (
                  <ChecklistItemAction>
                    <Button
                      size="sm"
                      variant={status === "active" ? "primary" : "outline"}
                      onClick={() => finish(step.id)}
                    >
                      {step.cta}
                    </Button>
                  </ChecklistItemAction>
                )}
              </ChecklistItem>
            )
          })}
        </ChecklistItems>
      </Checklist>

      {complete && (
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setDone(["account", "team"])}
          >
            <ArrowCounterClockwise weight="bold" />
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
