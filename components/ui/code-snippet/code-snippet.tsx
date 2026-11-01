"use client"

import * as React from "react"
import { CaretDown, Check, Copy } from "koala-icons"

import { useCodeHighlighter, type CodeToken } from "@/lib/code-highlighter"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { AnimatedLabel } from "@/components/ui/animated-label"
import { Button } from "@/components/ui/button"

type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "tag"
  | "attribute"
  | "punctuation"
  | "flag"
  | "text"
  | "prompt"
  | "output"
  | "success"

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-syntax-comment italic",
  string: "text-syntax-string",
  keyword: "text-syntax-keyword",
  number: "text-syntax-number",
  function: "text-syntax-function",
  tag: "text-syntax-tag",
  attribute: "text-syntax-attribute",
  punctuation: "text-syntax-punctuation",
  flag: "text-syntax-keyword",
  text: "text-foreground",
  prompt: "text-muted-foreground/60 select-none",
  output: "text-muted-foreground",
  success: "inline-block w-[1ch] text-success",
}

type Grammar = "tsx" | "bash" | "console" | "css"

const GRAMMARS: Record<Grammar, [TokenType, RegExp][]> = {
  tsx: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ["text", /(?<=>)(?=[^<>{}()=;&|\n]*[A-Za-z])[^<>{}()=;&|\n]+(?=<)/],
    ["text", /(?<=>\n[ \t]*)(?=[^<>{}()=;&|\n]*[A-Za-z])[^<>{}()=;&|\n]+(?=\n[ \t]*<)/],
    ["string", /`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    [
      "keyword",
      /\b(?:import|from|export|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|interface|type|enum|namespace|async|await|yield|of|in|instanceof|typeof|keyof|as|satisfies|public|private|protected|readonly|static|get|set|true|false|null|undefined|void|never|this|super)\b/,
    ],
    ["attribute", /[A-Za-z_$][\w$-]*(?==(?!=))/],
    ["number", /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/],
    ["function", /\b[A-Za-z_$][\w$]*(?=\s*\()/],
    ["tag", /(?<=<\/?)[a-z][\w.-]*/],
    ["tag", /\b[A-Z][\w$]*\b/],
    ["punctuation", /=>|\.{3}|[{}()[\].,;:]|[=<>+\-*/%!&|?~]+/],
  ],
  bash: [
    ["comment", /#[^\n]*/],
    ["string", /"(?:\\.|[^"\\])*"|'[^']*'/],
    ["flag", /(?<=\s)--?[A-Za-z][\w-]*/],
  ],
  console: [
    ["comment", /#[^\n]*/],
    ["prompt", /^\$(?= )/],
    ["success", /^[✓✔](?= )/],
    ["output", /(?<=^(?:[✓✔] )?)(?![$#\n])[^\n]+/],
    ["string", /"(?:\\.|[^"\\])*"|'[^']*'/],
    ["flag", /(?<=\s)--?[A-Za-z][\w-]*/],
  ],
  css: [
    ["comment", /\/\*[\s\S]*?\*\//],
    ["string", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    ["keyword", /@[\w-]+|:root\b|::?[\w-]+/],
    ["function", /[A-Za-z][\w-]*(?=\()/],
    ["number", /#[0-9a-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:rem|px|em|%|deg|m?s|fr|vh|vw)?\b/],
  ],
}

const COLLAPSE_MARGIN = 40
const COLLAPSE_RESERVE = 56

type Token = { type?: TokenType; value: string }

function tokenize(code: string, lang: Grammar): Token[] {
  const grammar = GRAMMARS[lang]
  const master = new RegExp(
    grammar.map(([, re]) => `(${re.source})`).join("|"),
    "gm",
  )
  const tokens: Token[] = []
  let last = 0
  let match: RegExpExecArray | null

  while ((match = master.exec(code))) {
    if (match.index > last) {
      tokens.push({ value: code.slice(last, match.index) })
    }
    const groupIndex = grammar.findIndex((_, i) => match![i + 1] !== undefined)
    tokens.push({ type: grammar[groupIndex][0], value: match[0] })
    last = match.index + match[0].length
    if (match[0].length === 0) master.lastIndex++
  }
  if (last < code.length) tokens.push({ value: code.slice(last) })
  return tokens
}

function splitLines(tokens: Token[], lineCount: number): Token[][] {
  const lines: Token[][] = [[]]
  for (const tok of tokens) {
    tok.value.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ type: tok.type, value: part })
    })
  }
  return lines.slice(0, lineCount)
}

export type CodeSnippetLineMark = "added" | "removed"

const LINE_MARK: Record<CodeSnippetLineMark, string> = {
  added: "bg-success/10",
  removed: "bg-destructive/10",
}
const GUTTER_MARK: Record<CodeSnippetLineMark, string> = {
  added: "bg-success/10 text-success before:bg-success",
  removed: "bg-destructive/10 text-destructive before:bg-destructive",
}

const LANG_LABEL: Record<string, string> = {
  tsx: "TSX",
  ts: "TS",
  js: "JS",
  css: "CSS",
  bash: "Bash",
  sh: "Shell",
  text: "Text",
  json: "JSON",
  py: "Python",
  python: "Python",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  html: "HTML",
  swift: "Swift",
  kotlin: "Kotlin",
  java: "Java",
  ruby: "Ruby",
  php: "PHP",
}

export const codeSnippetVariants = tv({
  slots: {
    root: "group relative overflow-hidden rounded-sm bg-[var(--surface,var(--background))] shadow-xs ring-1 ring-edge",
    header: "flex items-center gap-3",
    dots: "flex gap-1.5",
    dot: "size-2.5 rounded-full bg-muted-foreground/25",
    filename: "font-mono text-xs text-muted-foreground",
    langLabel:
      "ml-auto font-mono text-[10px] font-medium tracking-wide text-muted-foreground/60 uppercase",
    viewport: "relative",
    copy: "absolute top-3 right-3 z-10 size-7 bg-card/90 backdrop-blur opacity-0 before:absolute before:-inset-2 before:content-[''] group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100",
    scroller: "flex text-sm leading-relaxed",
    gutter:
      "shrink-0 border-r border-border/60 text-right font-mono text-muted-foreground/40 tabular-nums select-none",
    gutterCell: "relative before:absolute before:inset-y-0 before:left-0 before:w-0.5",
    pre: "min-w-0 flex-1 overflow-x-auto",
    code: "block min-w-fit font-mono text-foreground",
    line: "block min-h-lh",
    fade: "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background via-background/85 to-transparent",
    toggle: "absolute bottom-3 left-1/2 z-20 -translate-x-1/2",
  },
  variants: {
    chrome: {
      none: {},
      inset: {
        root: [
          "flex flex-col rounded-xl px-2 pb-2 shadow-none",
          "bg-[color-mix(in_oklab,var(--muted)_50%,var(--surface,var(--background)))]",
          "dark:bg-[color-mix(in_oklab,var(--foreground)_3%,var(--surface,var(--background)))]",
        ],
        header: "shrink-0",
        viewport:
          "grow overflow-hidden rounded-md bg-[var(--surface,var(--background))] ring-1 ring-edge",
      },
      band: { header: "border-b border-border/70" },
    },
    density: {
      comfortable: {
        header: "px-4 py-2.5",
        gutter: "py-4",
        gutterCell: "px-4",
        pre: "py-4",
        line: "pr-12 pl-4",
      },
      compact: {
        header: "px-3 py-1.5",
        gutter: "py-3",
        gutterCell: "px-3",
        pre: "py-3",
        line: "pr-10 pl-3",
      },
    },
  },
  compoundVariants: [
    { chrome: "inset", density: "compact", class: { header: "h-9 py-0" } },
    { chrome: "inset", density: "comfortable", class: { header: "h-10 py-0" } },
  ],
  defaultVariants: {
    chrome: "none",
    density: "compact",
  },
})

export type CodeSnippetLang = "tsx" | "ts" | "js" | "css" | "bash" | "sh" | "text" | (string & {})

/** The built-in grammar for a language, by its usual names, or `null` to leave it plain. */
function builtinGrammar(lang: string, code: string): Grammar | null {
  if (/^(?:tsx|jsx|ts|typescript|mts|cts|js|javascript|mjs|cjs|json|jsonc)$/.test(lang)) return "tsx"
  if (/^(?:css|scss|less)$/.test(lang)) return "css"
  if (/^(?:bash|sh|shell|zsh|console|terminal|shellscript)$/.test(lang)) return /^\$ /m.test(code) ? "console" : "bash"
  return null
}

/**
 * The provided highlighter's lines for `code`, once they arrive. While a block streams, the code
 * outgrows the last answer between calls: its finished lines keep their color and only the line
 * being written waits, plain, so nothing flickers back to the built-in grammar.
 */
function useHighlightedLines(code: string, lang: string, enabled: boolean): CodeToken[][] | null {
  const highlighter = useCodeHighlighter()
  const [result, setResult] = React.useState<{ code: string; lang: string; lines: CodeToken[][] } | null>(null)

  React.useEffect(() => {
    if (!highlighter || !enabled) return
    let current = true
    Promise.resolve(highlighter(code, lang)).then(
      (lines) => {
        if (current) setResult(lines ? { code, lang, lines } : null)
      },
      () => {
        if (current) setResult(null)
      },
    )
    return () => {
      current = false
    }
  }, [highlighter, enabled, code, lang])

  if (!highlighter || !enabled || !result || result.lang !== lang) return null
  if (result.code === code) return result.lines
  if (!code.startsWith(result.code)) return null
  const done = result.lines.slice(0, -1)
  const rest = code.split("\n").slice(done.length)
  return [...done, ...rest.map((value) => (value ? [{ value }] : []))]
}

export interface CodeSnippetProps
  extends Omit<React.ComponentProps<"div">, "children">,
    Omit<VariantProps<typeof codeSnippetVariants>, "chrome"> {
  code: string
  /**
   * The language. TSX, TS, JS (and JSON), CSS and shell are highlighted out of the box; any other
   * reads as plain text unless a `CodeHighlighterProvider` above knows it.
   */
  lang?: CodeSnippetLang
  filename?: string
  /** A header with just the language chip, for a block with no file name: a code block in a reply. */
  showLang?: boolean
  dots?: boolean
  inset?: boolean
  showLineNumbers?: boolean
  startLine?: number
  diff?: { added?: number[]; removed?: number[] }
  collapsible?: boolean
  collapsedHeight?: number
}

export function CodeSnippet({
  code,
  lang = "tsx",
  filename,
  showLang = false,
  dots = false,
  inset = true,
  showLineNumbers = false,
  startLine = 1,
  diff,
  collapsible = false,
  collapsedHeight = 320,
  density,
  className,
  ...props
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const [contentHeight, setContentHeight] = React.useState<number | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const showHeader = Boolean(filename) || dots || (showLang && lang !== "text")
  const slots = codeSnippetVariants({
    density: useDensity(density),
    chrome: !showHeader ? "none" : inset ? "inset" : "band",
  })
  const grammar = builtinGrammar(lang, code)
  const session = grammar === "console"
  const tokens = React.useMemo(() => (grammar ? tokenize(code, grammar) : [{ value: code }]), [code, grammar])
  const lineCount = code.replace(/\n+$/, "").split("\n").length
  const builtinLines = React.useMemo(() => splitLines(tokens, lineCount), [tokens, lineCount])
  // A shell session keeps the built-in grammar: its prompts and output are Koala's own reading.
  const highlighted = useHighlightedLines(code, lang, lang !== "text" && !session)
  const lines = highlighted ? highlighted.slice(0, lineCount) : builtinLines
  // The highlighter answers after the first paint: its colors settle in from the text color
  // instead of jumping in. The built-in grammar paints with the first frame and needs none of it.
  const settle = highlighted ? " transition-colors duration-base ease-out starting:text-foreground" : ""
  const markOf = (n: number): CodeSnippetLineMark | undefined =>
    diff?.added?.includes(n) ? "added" : diff?.removed?.includes(n) ? "removed" : undefined

  React.useLayoutEffect(() => {
    if (!collapsible) return
    const el = contentRef.current
    if (!el) return
    const measure = () => {
      const node = contentRef.current
      if (node) setContentHeight(node.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [collapsible, code])

  const overflows =
    collapsible &&
    contentHeight !== null &&
    contentHeight > collapsedHeight + COLLAPSE_MARGIN
  const viewportStyle = overflows
    ? { height: expanded ? (contentHeight ?? 0) + COLLAPSE_RESERVE : collapsedHeight }
    : undefined

  async function copy() {
    const text = session
      ? code
          .split("\n")
          .filter((line) => line.startsWith("$ "))
          .map((line) => line.slice(2))
          .join("\n")
      : code
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div data-slot="code-snippet" className={slots.root({ className })} {...props}>
      {showHeader && (
        <div data-slot="code-snippet-header" className={slots.header()}>
          {dots && (
            <span data-slot="code-snippet-dots" className={slots.dots()} aria-hidden>
              <span className={slots.dot()} />
              <span className={slots.dot()} />
              <span className={slots.dot()} />
            </span>
          )}
          {filename && (
            <span data-slot="code-snippet-filename" className={slots.filename()}>
              {filename}
            </span>
          )}
          <span data-slot="code-snippet-lang" className={slots.langLabel()}>
            {LANG_LABEL[lang] ?? lang}
          </span>
        </div>
      )}

      <div
        data-slot="code-snippet-viewport"
        className={slots.viewport({
          className: overflows
            ? "overflow-hidden transition-[height] duration-slow ease-out motion-reduce:transition-none"
            : undefined,
        })}
        style={viewportStyle}
      >
        <Button
          type="button"
          iconOnly
          variant="outline"
          size="sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          tooltipPlacement="left"
          className={slots.copy()}
        >
          <span className="relative flex size-4 items-center justify-center">
            <Copy weight="bold"
              aria-hidden
              className={`absolute size-4 transition-[opacity,scale,filter] duration-fast ease-out ${copied ? "opacity-0 scale-[0.25] blur-[4px]" : "opacity-100 scale-100 blur-[0px]"}`}
            />
            <Check weight="bold"
              aria-hidden
              className={`absolute size-4 transition-[opacity,scale,filter] duration-fast ease-out ${copied ? "opacity-100 scale-100 blur-[0px]" : "opacity-0 scale-[0.25] blur-[4px]"}`}
            />
          </span>
        </Button>

        <div
          ref={contentRef}
          data-slot="code-snippet-scroller"
          className={slots.scroller()}
        >
          {showLineNumbers && (
            <div data-slot="code-snippet-gutter" aria-hidden className={slots.gutter()}>
              {lines.map((_, i) => {
                const mark = markOf(startLine + i)
                return (
                  <div
                    key={i}
                    data-diff={mark}
                    className={slots.gutterCell({ className: mark && GUTTER_MARK[mark] })}
                  >
                    {startLine + i}
                  </div>
                )
              })}
            </div>
          )}
          <pre data-slot="code-snippet-pre" className={slots.pre()}>
            <code className={slots.code()}>
              {lines.map((line, n) => {
                const mark = markOf(startLine + n)
                return (
                  <span
                    key={n}
                    data-slot="code-snippet-line"
                    data-diff={mark}
                    className={slots.line({ className: mark && LINE_MARK[mark] })}
                  >
                    {mark && (
                      <span className="sr-only select-none">
                        {mark === "added" ? "Added: " : "Removed: "}
                      </span>
                    )}
                    {line.map((tok, i) =>
                      tok.type ? (
                        <span key={i} className={TOKEN_CLASS[tok.type] + settle}>
                          {tok.value}
                        </span>
                      ) : (
                        <span key={i}>{tok.value}</span>
                      ),
                    )}
                    {n < lines.length - 1 && <span className="hidden">{"\n"}</span>}
                  </span>
                )
              })}
            </code>
          </pre>
        </div>

        {overflows && !expanded && (
          <span data-slot="code-snippet-fade" aria-hidden className={slots.fade()} />
        )}

        {overflows && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={slots.toggle()}
          >
            <AnimatedLabel swapKey={expanded ? "less" : "more"}>
              {expanded ? "Show less" : "Show more"}
            </AnimatedLabel>
            <CaretDown
              weight="bold"
              aria-hidden
              className={`size-4 caret-turn ${expanded ? "rotate-180" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
