"use client"

import * as React from "react"
import { Copy, Check, DownloadSimple, ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react"

import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Tooltip } from "@/components/ui/tooltip"
import { InputRoot, InputField, InputPrefix, InputSuffixButton } from "@/components/ui/input"
import {
  BRAND_LOGOS,
  BrandLogo,
  brandHref,
  type BrandLogoEntry,
} from "@/components/docs/brand-logos"
import { toSvgMarkup } from "@/components/docs/logo-grid"

/**
 * The interactive, searchable grid of real brand logos for `/docs/logos`, laid out like the
 * placeholder gallery: each card is the imagotype (mark + brand name) over a single slot where the
 * domain caption cross-fades to a Copy / Download toolbar on hover or keyboard focus. Two things
 * differ for real brands: the imagotype links to the company (so there is always a link to the
 * brand), and the hover toolbar carries a third action when the brand publishes guidelines, a link to
 * its trademark / brand guidelines. Export reuses {@link toSvgMarkup}, so a copied mark pastes into
 * Figma with the brand color baked in.
 */

const COLS = 4

function BrandLogoCard({ brand }: { brand: BrandLogoEntry }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [copied, setCopied] = React.useState(false)

  function getMarkup() {
    const svg = ref.current?.querySelector("svg")
    return svg ? toSvgMarkup(svg, brand.color) : null
  }

  async function handleCopy() {
    const markup = getMarkup()
    if (!markup) return
    try {
      await navigator.clipboard.writeText(markup)
    } catch {
      // Fallback when the async Clipboard API is blocked: a transient textarea + execCommand.
      const textarea = document.createElement("textarea")
      textarea.value = markup
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand("copy")
      } catch {
        /* no-op: clipboard unavailable */
      }
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    const markup = getMarkup()
    if (!markup) return
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${brand.name.toLowerCase().replace(/\s+/g, "-")}.svg`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <figure className="group flex flex-col items-center gap-3 bg-background px-4 py-8 text-center">
      {/* The imagotype: the mark beside its wordmark, linked to the brand (always a link to the
          company). The link wraps both, so `ref` still finds the mark `<svg>` for export. */}
      <span ref={ref} className="flex min-h-10 items-center justify-center">
        <a
          href={brandHref(brand)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${brand.name} (opens ${brand.domain})`}
          className="inline-flex items-center gap-2.5 rounded-sm outline-none transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandLogo brand={brand} className="size-6 shrink-0" />
          <span className="text-lg font-semibold tracking-tight text-foreground">{brand.name}</span>
        </a>
      </span>
      {/* One slot, no container: the domain at rest MARCHES OFF (rises + fades) while the Copy /
          Download (+ guidelines) toolbar ARRIVES (rises into place + fades in), both at once. */}
      <div className="relative flex h-8 items-center justify-center">
        <figcaption className="min-w-0 truncate font-mono text-xs text-muted-foreground transition-[opacity,translate] duration-base ease-out group-hover:-translate-y-2 group-hover:opacity-0 group-focus-within:-translate-y-2 group-focus-within:opacity-0">
          {brand.domain}
        </figcaption>
        <ButtonGroup
          size="sm"
          className="pointer-events-none absolute inset-0 m-auto size-fit translate-y-2 opacity-0 transition-[opacity,translate] duration-base ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100"
        >
          <Tooltip content={copied ? "Copied!" : "Copy SVG"}>
            <ButtonGroupItem iconOnly onClick={handleCopy} aria-label={`Copy ${brand.name} SVG`}>
              {copied ? <Check weight="bold" /> : <Copy weight="bold" />}
            </ButtonGroupItem>
          </Tooltip>
          <Tooltip content="Download SVG">
            <ButtonGroupItem
              iconOnly
              onClick={handleDownload}
              aria-label={`Download ${brand.name} SVG`}
            >
              <DownloadSimple weight="bold" />
            </ButtonGroupItem>
          </Tooltip>
          {brand.guidelines && (
            <Tooltip content="Brand guidelines">
              <ButtonGroupItem iconOnly asChild aria-label={`${brand.name} brand guidelines`}>
                <a href={brand.guidelines} target="_blank" rel="noopener noreferrer">
                  <ArrowSquareOut weight="bold" />
                </a>
              </ButtonGroupItem>
            </Tooltip>
          )}
        </ButtonGroup>
      </div>
    </figure>
  )
}

/**
 * A searchable four-up grid of every real brand logo. Same containerless hairline gallery as the
 * placeholder set (a 1px gap reveals a faint `bg-border/60`; each cell paints `bg-background`). The
 * filter can yield any count, so the trailing cells of the last row are padded with blank
 * `bg-background` fillers up to a multiple of the column count: that keeps the hairline grid full so
 * no faint border-colored tracks ever show through.
 */
export function BrandLogoGrid() {
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()
  const filtered = q
    ? BRAND_LOGOS.filter(
        (b) => b.name.toLowerCase().includes(q) || b.domain.toLowerCase().includes(q),
      )
    : BRAND_LOGOS

  // Pad to a multiple of COLS (also even, so the 2-col mobile grid stays full too).
  const fillers = filtered.length ? (COLS - (filtered.length % COLS)) % COLS : 0

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InputRoot className="sm:max-w-xs">
          <InputPrefix>
            <MagnifyingGlass weight="bold" />
          </InputPrefix>
          <InputField
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logos"
            aria-label="Search brand logos by name"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <InputSuffixButton aria-label="Clear search" onClick={() => setQuery("")}>
              <X weight="bold" />
            </InputSuffixButton>
          )}
        </InputRoot>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {filtered.length} of {BRAND_LOGOS.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No logos found</p>
          <p className="text-sm text-pretty text-muted-foreground">
            Nothing matches <span className="font-medium text-foreground">{query}</span>. Try another
            brand name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
          {filtered.map((brand) => (
            <BrandLogoCard key={brand.name} brand={brand} />
          ))}
          {Array.from({ length: fillers }).map((_, i) => (
            <div key={`filler-${i}`} aria-hidden className="bg-background" />
          ))}
        </div>
      )}
    </div>
  )
}
