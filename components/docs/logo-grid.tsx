"use client"

import * as React from "react"
import { Copy, Check, DownloadSimple } from "@phosphor-icons/react"

import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Tooltip } from "@/components/ui/tooltip"
import {
  PLACEHOLDER_BRANDS,
  PlaceholderLogo,
  type PlaceholderBrand,
} from "@/components/docs/placeholder-logos"

/**
 * The interactive logo asset grid for `/docs/logos`: every placeholder brand as a card with the
 * colored symbol, its name, and Copy / Download SVG actions. The marks paint with `currentColor`, so
 * on export we clone the live `<svg>`, strip the runtime class/style, add `xmlns` + an explicit size,
 * and bake the brand color in. The copied markup pastes straight into Figma (Ctrl+V), and the
 * download writes a standalone `<name>.svg`.
 */

/**
 * Clone a rendered mark `<svg>` into a standalone, color-baked SVG string. Exported so the brand
 * logo grid reuses the exact same export path (strip runtime attrs, add `xmlns` + size, bake color).
 */
export function toSvgMarkup(svg: SVGSVGElement, color: string, size = 48) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  for (const attr of ["class", "style", "aria-hidden", "focusable"]) {
    clone.removeAttribute(attr)
  }
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(size))
  clone.setAttribute("height", String(size))
  return clone.outerHTML.replace(/currentColor/g, color)
}

function LogoCard({ brand }: { brand: PlaceholderBrand }) {
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
    anchor.download = `${brand.name.toLowerCase()}.svg`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <figure className="group flex flex-col items-center gap-3 bg-background px-4 py-8 text-center">
      {/* The imagotype: the colored symbol beside its wordmark (Symbol + Typography). */}
      <span ref={ref} className="flex min-h-10 items-center justify-center">
        <PlaceholderLogo brand={brand} variant="lockup" />
      </span>
      {/* One slot, no container: the domain at rest cross-fades to the Copy / Download toolbar on
          hover or keyboard focus, so the actions never add chrome or shift the layout. */}
      <div className="relative flex h-8 items-center justify-center">
        {/* On hover / keyboard focus the domain MARCHES OFF (rises + fades) while the Copy/Download
            buttons ARRIVE (rise into place from below + fade), both at the same time. `translate` is
            named in the transition (Tailwind v4 treats it as a standalone prop). */}
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
        </ButtonGroup>
      </div>
    </figure>
  )
}

/** A four-up grid of every placeholder logo, each with Copy / Download SVG actions. */
export function LogoGrid() {
  return (
    // Soft dividers without containers: a 1px gap reveals a faint `bg-border/60`, and each cell
    // paints `bg-background` so it melts into the page, leaving only hairline gridlines between logos.
    <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
      {PLACEHOLDER_BRANDS.map((brand) => (
        <LogoCard key={brand.name} brand={brand} />
      ))}
    </div>
  )
}
