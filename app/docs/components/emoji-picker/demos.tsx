"use client"

import * as React from "react"
import { Smiley } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  EmojiPicker,
  EmojiPickerPopover,
  EmojiPickerTrigger,
  EmojiPickerContent,
} from "@/components/ui/emoji-picker"

/** Hero: the inline picker, echoing the last pick below it. */
export function EmojiPickerInlineDemo() {
  const [emoji, setEmoji] = React.useState("👋")
  return (
    <div className="flex flex-col items-center gap-4">
      <EmojiPicker onEmojiSelect={(char) => setEmoji(char)} />
      <p className="text-sm text-muted-foreground">
        Last picked: <span className="text-2xl align-middle leading-none">{emoji}</span>
      </p>
    </div>
  )
}

/** The common flow: a trigger button opens the picker in a popover and closes on select. */
export function EmojiPickerPopoverDemo() {
  const [emoji, setEmoji] = React.useState<string | null>(null)
  return (
    <EmojiPickerPopover>
      <EmojiPickerTrigger asChild>
        <Button variant="outline">
          {emoji ? (
            <span className="text-base leading-none">{emoji}</span>
          ) : (
            <Smiley weight="bold" />
          )}
          {emoji ? "Change emoji" : "Add emoji"}
        </Button>
      </EmojiPickerTrigger>
      <EmojiPickerContent onEmojiSelect={(char) => setEmoji(char)} />
    </EmojiPickerPopover>
  )
}

/** Density: the spacing axis retunes width, viewport height, grid gap and glyph size. */
export function EmojiPickerDensityDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">comfortable</span>
        <EmojiPicker density="comfortable" storageKey={null} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">compact</span>
        <EmojiPicker density="compact" storageKey={null} />
      </div>
    </div>
  )
}

/** Minimal: drop the preview footer and the recents/presets rows; keep search + categories. */
export function EmojiPickerMinimalDemo() {
  return (
    <EmojiPicker
      showPreview={false}
      showRecent={false}
      showPresets={false}
      storageKey={null}
    />
  )
}
