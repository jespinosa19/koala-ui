"use client"

import * as React from "react"
import { Sparkle } from "@phosphor-icons/react"

import { Suggestions, SuggestionMark } from "@/components/ui/suggestions"

export function SuggestionsDemo() {
  const TOTAL = 4
  const [reviewed, setReviewed] = React.useState(0)
  const bump = () => setReviewed((n) => Math.min(TOTAL, n + 1))

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkle weight="bold" className="size-4 shrink-0 text-brand" />
        {reviewed < TOTAL ? (
          <span>
            <span className="font-medium tabular-nums text-foreground">{TOTAL - reviewed}</span>{" "}
            suggestions to review. Click a highlight to see it.
          </span>
        ) : (
          <span>All suggestions reviewed.</span>
        )}
      </div>

      <Suggestions onApply={bump} onDismiss={bump} className="text-base">
        Our onboarding flow{" "}
        <SuggestionMark
          variant="clarity"
          suggestion="helps new users get started in minutes"
          reason="Be specific about the outcome, not just that it is good."
        >
          is really good for users
        </SuggestionMark>
        . We{" "}
        <SuggestionMark
          variant="tone"
          suggestion="believe"
          reason="A confident, active verb reads stronger than a hedge."
        >
          kinda think
        </SuggestionMark>{" "}
        it{" "}
        <SuggestionMark
          variant="grammar"
          suggestion="increases"
          reason='Subject-verb agreement: "it increases".'
        >
          increase
        </SuggestionMark>{" "}
        activation, and the{" "}
        <SuggestionMark
          variant="default"
          suggestion="data backs that up"
          reason="Tighten the closing clause."
        >
          numbers are showing that this is the case
        </SuggestionMark>
        .
      </Suggestions>
    </div>
  )
}

export function CategoriesDemo() {
  const items = [
    {
      variant: "grammar",
      lead: "Grammar:",
      text: "they're house",
      suggestion: "their house",
      reason: "Possessive, not a contraction.",
    },
    {
      variant: "clarity",
      lead: "Clarity:",
      text: "utilize the tooling",
      suggestion: "use the tools",
      reason: "Plainer words read faster.",
    },
    {
      variant: "tone",
      lead: "Tone:",
      text: "we kinda think",
      suggestion: "we believe",
      reason: "Confident, active voice.",
    },
    {
      variant: "default",
      lead: "Concise:",
      text: "at this point in time",
      suggestion: "now",
      reason: "Cut the filler.",
    },
  ] as const

  return (
    <Suggestions className="flex w-full max-w-xl flex-col gap-2.5 text-base">
      {items.map((it) => (
        <p key={it.variant}>
          <span className="text-muted-foreground">{it.lead}</span> Let&apos;s{" "}
          <SuggestionMark variant={it.variant} suggestion={it.suggestion} reason={it.reason}>
            {it.text}
          </SuggestionMark>
          .
        </p>
      ))}
    </Suggestions>
  )
}
