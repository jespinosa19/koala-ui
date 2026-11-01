"use client"

import * as React from "react"

/**
 * A surface that hosts rendered Markdown and styles it itself: Chat's `MessageContent` is one.
 * Inside a host, `Markdown` leaves typography to it (no `Prose` of its own) and takes its
 * `streaming` from it, so the caret lands at the end of the last line instead of under the block.
 *
 * It lives in lib/ so the two sides need not import each other: each ships as its own item.
 */
export type MarkdownHostValue = { streaming: boolean }

const MarkdownHostContext = React.createContext<MarkdownHostValue | null>(null)
MarkdownHostContext.displayName = "MarkdownHostContext"

export function MarkdownHost({ streaming, children }: MarkdownHostValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ streaming }), [streaming])
  return <MarkdownHostContext.Provider value={value}>{children}</MarkdownHostContext.Provider>
}

/** The host around this Markdown, or `null` when it stands on its own. */
export function useMarkdownHost() {
  return React.useContext(MarkdownHostContext)
}
