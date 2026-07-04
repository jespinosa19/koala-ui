"use client"

import * as React from "react"
import {
  ThumbsUp,
  ThumbsDown,
  TextB,
  TextItalic,
  TextUnderline,
  ListBullets,
  SquaresFour,
  Kanban,
} from "@phosphor-icons/react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

/** Hero: a single mutually-exclusive choice. Pick one, the other clears. */
export function ToggleGroupDemo() {
  return (
    <ToggleGroup type="single" defaultValue="yes" aria-label="Was this useful?">
      <ToggleGroupItem value="yes">
        <ThumbsUp weight="bold" />
        Yes
      </ToggleGroupItem>
      <ToggleGroupItem value="no">
        <ThumbsDown weight="bold" />
        No
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

/**
 * Single vs. multiple: `type="single"` is a one-of-N switch (a view picker); `type="multiple"`
 * lets each pill toggle independently (a text-style band).
 */
export function SingleVsMultipleDemo() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <ToggleGroup type="single" defaultValue="grid" aria-label="View">
          <ToggleGroupItem value="list">
            <ListBullets weight="bold" />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="grid">
            <SquaresFour weight="bold" />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem value="board">
            <Kanban weight="bold" />
            Board
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground">{`type="single"`}</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Text style">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <TextB weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <TextItalic weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <TextUnderline weight="bold" />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground">{`type="multiple"`}</span>
      </div>
    </div>
  )
}

/** Sizes: sm is the compact rating pill (32px); md (40px) is the default. */
export function SizesDemo() {
  return (
    <div className="flex flex-col items-center gap-8">
      {(["sm", "md"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <ToggleGroup type="single" size={size} defaultValue="yes" aria-label={`Rate (${size})`}>
            <ToggleGroupItem value="yes">
              <ThumbsUp weight="bold" />
              Yes
            </ToggleGroupItem>
            <ToggleGroupItem value="no">
              <ThumbsDown weight="bold" />
              No
            </ToggleGroupItem>
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Rate card: the always-visible Figma "Rate v3" panel. A card with a title, a question, and a
 * single-choice ToggleGroup, rendered open so it reads at a glance. Defaults to "yes" so the
 * brand selected state shows immediately. Drop the same content into a PopoverContent to float it.
 */
export function FeedbackCardDemo() {
  const [rating, setRating] = React.useState("yes")
  return (
    <div className="w-72 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm [--surface:var(--card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">Was this useful?</p>
          <p className="text-sm text-muted-foreground">
            How would you rate your overall experience?
          </p>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          value={rating}
          onValueChange={setRating}
          aria-label="Rate your experience"
        >
          <ToggleGroupItem value="yes">
            <ThumbsUp weight="bold" />
            Yes
          </ToggleGroupItem>
          <ToggleGroupItem value="no">
            <ThumbsDown weight="bold" />
            No
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}

/**
 * Feedback popover: the same prompt floated. A Popover hosting a title, a question, and a
 * single-choice ToggleGroup. The control *is* the label, so no paired inputs are needed.
 */
export function FeedbackPopoverDemo() {
  const [rating, setRating] = React.useState("")
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Was this useful?</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <PopoverTitle className="text-base">Was this useful?</PopoverTitle>
            <PopoverDescription>How would you rate your overall experience?</PopoverDescription>
          </div>
          <ToggleGroup
            type="single"
            size="sm"
            value={rating}
            onValueChange={setRating}
            aria-label="Rate your experience"
          >
            <ToggleGroupItem value="yes">
              <ThumbsUp weight="bold" />
              Yes
            </ToggleGroupItem>
            <ToggleGroupItem value="no">
              <ThumbsDown weight="bold" />
              No
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Inline "Was this useful?" : the compact variant. Just the question and a Yes/No band on a card,
 * no subtitle. Answering swaps the prompt for a thank-you, so the widget always feels resolved.
 */
export function FeedbackInlineDemo() {
  const [answer, setAnswer] = React.useState("")
  return (
    <div className="w-64 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs [--surface:var(--card)]">
      {answer ? (
        <p className="text-sm font-medium text-muted-foreground">
          Thanks for your feedback{answer === "yes" ? "!" : ", we'll do better."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Was this useful?</p>
          <ToggleGroup
            type="single"
            size="sm"
            value={answer}
            onValueChange={setAnswer}
            aria-label="Was this useful?"
          >
            <ToggleGroupItem value="yes">
              <ThumbsUp weight="bold" />
              Yes
            </ToggleGroupItem>
            <ToggleGroupItem value="no">
              <ThumbsDown weight="bold" />
              No
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  )
}
