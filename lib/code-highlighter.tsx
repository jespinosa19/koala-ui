"use client"

import * as React from "react"

/**
 * An optional, pluggable highlighter for CodeSnippet. Out of the box CodeSnippet tokenizes TSX,
 * TS, JS, CSS and shell itself, with no dependencies. Provide a highlighter (Shiki, Prism, your
 * own) and every snippet below the provider reaches the languages it knows.
 *
 * A highlighter answers in Koala's token types, not colors, so the result is painted with the
 * theme's own syntax tokens and follows light, cream, dark and moonlight like the built-in one.
 *
 * It lives in lib/ so CodeSnippet never imports the highlighter itself: a project without Shiki
 * installed builds exactly as before.
 */
export type CodeTokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "tag"
  | "attribute"
  | "punctuation"

export type CodeToken = { type?: CodeTokenType; value: string }

/**
 * Lines of tokens for `code` in `lang`, or `null` when the language is not one it knows (the
 * snippet then falls back on its own grammar). May answer synchronously or with a promise.
 */
export type CodeHighlighter = (
  code: string,
  lang: string,
) => CodeToken[][] | null | Promise<CodeToken[][] | null>

const CodeHighlighterContext = React.createContext<CodeHighlighter | null>(null)
CodeHighlighterContext.displayName = "CodeHighlighterContext"

export function CodeHighlighterProvider({
  highlighter,
  children,
}: {
  highlighter: CodeHighlighter
  children: React.ReactNode
}) {
  return <CodeHighlighterContext.Provider value={highlighter}>{children}</CodeHighlighterContext.Provider>
}

/** The highlighter in scope, or `null` for the built-in grammars. */
export function useCodeHighlighter() {
  return React.useContext(CodeHighlighterContext)
}
