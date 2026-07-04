"use client"

import { X } from "@phosphor-icons/react"

import { dialogVariants } from "@/components/ui/dialog"

/**
 * The dialog's top-right close glyph, styled by the real `close` slot. These docs render several
 * dialog patterns *inline* (no Radix Root/Portal) so they're visible without a trigger to click;
 * the close is decorative there (an inline preview has nothing to dismiss), so it's a
 * non-interactive span kept out of the a11y tree.
 */
export function InlineClose({
  density = "comfortable",
}: {
  density?: "comfortable" | "compact"
}) {
  const slots = dialogVariants({ density })
  return (
    <span className={slots.close()} aria-hidden>
      <X weight="bold" />
    </span>
  )
}
