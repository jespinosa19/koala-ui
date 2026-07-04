"use client"

import * as React from "react"
import { CaretDown, Check, Copy } from "@phosphor-icons/react"

import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { Button } from "@/components/ui/button"

/**
 * CodeSnippet is Koala's code block: a rounded, bordered surface with optional window
 * chrome (filename chip + macOS dots), copy-on-hover, an optional line-number gutter,
 * and lightweight syntax highlighting driven by the `--syntax-*` theme tokens (so it
 * re-themes across every theme). The highlighter is a small, self-contained tokenizer
 * scoped to TS/TSX, shell, and CSS, with no external dependency.
 *
 * Long listings can be `collapsible`: the block clamps to `collapsedHeight`, the last
 * lines dissolve into a bottom fade, and a "Show more / Show less" pill floats over that
 * fade, expanding the whole block to full height (animated). The pill only appears once
 * the content actually overflows the clamp, measured from the DOM, so short blocks are untouched.
 *
 * Single-element in spirit (one `code` prop drives everything), but styled the house
 * way: one `tv` recipe with `slots`, semantic tokens only, density-aware padding, and
 * `className` merged last. See docs/ARCHITECTURE.md.
 */
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

// Complete class strings (Tailwind can't see concatenated names) selected by a map.
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
}

// Ordered grammars; earlier patterns win at a given position (e.g. keyword before
// function, so `return(` highlights as a keyword, not a call). No capturing groups
// inside the patterns: each is wrapped in one group so its index maps to its type.
const GRAMMARS: Record<"tsx" | "bash" | "css", [TokenType, RegExp][]> = {
  tsx: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ["string", /`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    [
      "keyword",
      /\b(?:import|from|export|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|interface|type|enum|namespace|async|await|yield|of|in|instanceof|typeof|keyof|as|satisfies|public|private|protected|readonly|static|get|set|true|false|null|undefined|void|never|this|super)\b/,
    ],
    // JSX attribute / prop names: an identifier glued to `=` (no space), so `brand={x}`
    // and `className="…"` light up but `const x = 1` (space before `=`) does not.
    ["attribute", /[A-Za-z_$][\w$-]*(?==(?!=))/],
    ["number", /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/],
    ["function", /\b[A-Za-z_$][\w$]*(?=\s*\()/],
    // Lowercase host tags (`<div>`, `</li>`): keyed off the angle bracket so plain
    // identifiers stay uncolored; capitalized components/types/constants follow.
    ["tag", /(?<=<\/?)[a-z][\w.-]*/],
    ["tag", /\b[A-Z][\w$]*\b/],
    // Brackets, operators and separators get a subtle tint so structure reads at a glance.
    ["punctuation", /=>|\.{3}|[{}()[\].,;:]|[=<>+\-*/%!&|?~]+/],
  ],
  bash: [
    ["comment", /#[^\n]*/],
    ["string", /"(?:\\.|[^"\\])*"|'[^']*'/],
    ["flag", /(?<=\s)--?[A-Za-z][\w-]*/],
  ],
  // Scoped to the kind of CSS the docs actually show: token blocks and at-rules. Functions
  // (oklch(), var(), color-mix()) read as calls; lengths, percentages and hex read as numbers.
  css: [
    ["comment", /\/\*[\s\S]*?\*\//],
    ["string", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    ["keyword", /@[\w-]+|:root\b|::?[\w-]+/],
    ["function", /[A-Za-z][\w-]*(?=\()/],
    ["number", /#[0-9a-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:rem|px|em|%|deg|m?s|fr|vh|vw)?\b/],
  ],
}

// Below this much overflow past the clamp, don't collapse - hiding a line or two isn't worth
// fading otherwise-visible content and floating a control over it. Roughly two lines.
const COLLAPSE_MARGIN = 40
// When expanded, the block grows this much past its content so the floating "Show less" pill has a
// clear band to sit in and never covers the last line. Fits a sm pill (h-8) at its `bottom-3` offset.
const COLLAPSE_RESERVE = 56

type Token = { type?: TokenType; value: string }

function tokenize(code: string, lang: "tsx" | "bash" | "css"): Token[] {
  const grammar = GRAMMARS[lang]
  const master = new RegExp(
    grammar.map(([, re]) => `(${re.source})`).join("|"),
    "g",
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
    if (match[0].length === 0) master.lastIndex++ // guard against zero-width loops
  }
  if (last < code.length) tokens.push({ value: code.slice(last) })
  return tokens
}

const LANG_LABEL: Record<string, string> = {
  tsx: "TSX",
  ts: "TS",
  js: "JS",
  css: "CSS",
  bash: "Bash",
  sh: "Shell",
}

export const codeSnippetVariants = tv({
  slots: {
    root: "group relative overflow-hidden rounded-sm border border-border bg-background shadow-xs",
    header: "flex items-center gap-3 border-b border-border/70",
    dots: "flex gap-1.5",
    dot: "size-2.5 rounded-full bg-muted-foreground/25",
    filename: "font-mono text-xs text-muted-foreground",
    langLabel:
      "ml-auto font-mono text-[10px] font-medium tracking-wide text-muted-foreground/60 uppercase",
    viewport: "relative",
    // polish: the copy control sits over the source and reveals on hover/focus; the
    // `before` pseudo extends the hit area past the 28px glyph without growing the visual.
    copy: "absolute top-3 right-3 z-10 size-7 bg-card/90 backdrop-blur opacity-0 before:absolute before:-inset-2 before:content-[''] group-hover:opacity-100 focus-visible:opacity-100",
    scroller: "flex text-sm leading-relaxed",
    gutter:
      "shrink-0 border-r border-border/60 text-right font-mono text-muted-foreground/40 tabular-nums select-none",
    pre: "min-w-0 flex-1 overflow-x-auto",
    code: "font-mono text-foreground",
    // Collapse chrome. `fade` dissolves the clamped code into the surface (a hint that more sits
    // below the fold); `toggle` only POSITIONS the canonical Button (a `secondary` pill) so it
    // floats centered over that fade - and, when expanded, over a reserved band at the foot.
    fade: "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background via-background/85 to-transparent",
    toggle: "absolute bottom-3 left-1/2 z-20 -translate-x-1/2",
  },
  variants: {
    // Density retunes only padding (never radius or color). `compact` is the Koala default
    // (tight, app-dense); `comfortable` is the spacious marketing alternative.
    density: {
      comfortable: {
        header: "px-4 py-2.5",
        gutter: "py-4 pr-4 pl-4",
        pre: "py-4 pr-12 pl-4",
      },
      compact: {
        header: "px-3 py-1.5",
        gutter: "py-3 pr-3 pl-3",
        pre: "py-3 pr-10 pl-3",
      },
    },
  },
  defaultVariants: {
    density: "compact",
  },
})

export interface CodeSnippetProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof codeSnippetVariants> {
  code: string
  /** Source language for highlighting. Defaults to `tsx`. */
  lang?: "tsx" | "ts" | "js" | "css" | "bash" | "sh"
  /** Filename chip shown in the header (also enables the header bar). */
  filename?: string
  /** Show macOS-style window dots in the header. */
  dots?: boolean
  /** Render a line-number gutter. */
  showLineNumbers?: boolean
  /**
   * Clamp long listings to `collapsedHeight` behind a "Show more / Show less" toggle. The
   * toggle only appears once the content actually overflows the clamp; shorter blocks render
   * in full with no chrome added. @default false
   */
  collapsible?: boolean
  /** Clamped height in px when `collapsible` and collapsed. @default 320 */
  collapsedHeight?: number
}

export function CodeSnippet({
  code,
  lang = "tsx",
  filename,
  dots = false,
  showLineNumbers = false,
  collapsible = false,
  collapsedHeight = 320,
  density,
  className,
  ...props
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  // Natural height of the code content, measured from the DOM. `null` until first measured,
  // so on the server (and the first client paint) the block renders in full and only clamps
  // once we know it actually overflows - no flash of a wrongly-collapsed block.
  const [contentHeight, setContentHeight] = React.useState<number | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const slots = codeSnippetVariants({ density: useDensity(density) })
  const grammar =
    lang === "bash" || lang === "sh" ? "bash" : lang === "css" ? "css" : "tsx"
  const tokens = React.useMemo(() => tokenize(code, grammar), [code, grammar])
  const lineCount = code.replace(/\n+$/, "").split("\n").length

  // Measure the content once it's in the DOM and whenever it resizes. The read + single
  // setState live inside `measure()` (not the effect body) to satisfy the strict react-hooks
  // lint. Clamping the viewport doesn't shrink this child, so it always reports the full height.
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

  // Only collapse when there's enough below the fold to be worth it: a sliver overflow would fade
  // and float a control over a line or two that would just as easily have fit (see COLLAPSE_MARGIN).
  const overflows =
    collapsible &&
    contentHeight !== null &&
    contentHeight > collapsedHeight + COLLAPSE_MARGIN
  // Drive an explicit `height` (not max-height) between the two known values so it animates crisply
  // AND, when expanded, stretches past the content by COLLAPSE_RESERVE to open the band the floating
  // pill lives in. When there's nothing to collapse we leave it unstyled so nothing ever clips.
  const viewportStyle = overflows
    ? { height: expanded ? (contentHeight ?? 0) + COLLAPSE_RESERVE : collapsedHeight }
    : undefined

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const showHeader = Boolean(filename) || dots

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
          iconOnly
          variant="outline"
          size="sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          tooltipPlacement="left"
          className={slots.copy()}
        >
          {/* #7 contextual icon swap: keep both glyphs mounted and cross-fade (opacity/scale/
              blur) on copy, so the confirmation reads as a transform, not a hard swap. */}
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
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre data-slot="code-snippet-pre" className={slots.pre()}>
            <code className={slots.code()}>
              {tokens.map((tok, i) =>
                tok.type ? (
                  <span key={i} className={TOKEN_CLASS[tok.type]}>
                    {tok.value}
                  </span>
                ) : (
                  <span key={i}>{tok.value}</span>
                ),
              )}
            </code>
          </pre>
        </div>

        {/* The fade only paints while collapsed - it dissolves the clamped code into the surface.
            The pill floats over it (and, expanded, over the reserved band) so it never displaces code. */}
        {overflows && !expanded && (
          <span data-slot="code-snippet-fade" aria-hidden className={slots.fade()} />
        )}

        {overflows && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={slots.toggle()}
          >
            {expanded ? "Show less" : "Show more"}
            {/* one glyph, rotated on toggle - reads as a transform, not a swap (#7) */}
            <CaretDown
              weight="bold"
              aria-hidden
              className={`size-4 transition-transform duration-base ease-out ${expanded ? "rotate-180" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
