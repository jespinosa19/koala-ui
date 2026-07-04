import { notFound } from "next/navigation"

import { SECTIONS } from "@/components/docs/sections-registry"
import { SectionContainer } from "@/components/ui/section"

export const metadata = { title: "Section preview" }

// Allowlists inlined as plain literals on purpose: this is a SERVER component, and the canonical
// THEMES/ACCENTS arrays live in "use client" modules (theme-provider / accent-provider). Importing
// their runtime VALUES here yields a client-reference proxy (`THEMES.includes` is not a function),
// the same trap as a client-exported registry. Keep these in sync with those providers.
const THEME_NAMES = ["light", "dark", "moonlight"] as const
const ACCENT_NAMES = [
  "orange",
  "red",
  "amber",
  "green",
  "teal",
  "blue",
  "violet",
  "pink",
] as const
const DEFAULT_ACCENT: Accent = "orange"

type Theme = (typeof THEME_NAMES)[number]
type Accent = (typeof ACCENT_NAMES)[number]

function asTheme(value: string | undefined): Theme {
  return (THEME_NAMES as readonly string[]).includes(value ?? "") ? (value as Theme) : "light"
}

function asAccent(value: string | undefined): Accent {
  return (ACCENT_NAMES as readonly string[]).includes(value ?? "") ? (value as Accent) : DEFAULT_ACCENT
}

/**
 * Isolated render target for a single section/page, the body of the docs PreviewFrame's iframe.
 * It inherits only the root layout (no docs chrome), so the slab's own `sm:`/`md:`/`lg:`
 * utilities respond to the IFRAME width, not the browser viewport: the whole reason the preview
 * can show real responsive behavior. Theme/accent are forced from query params onto a wrapper
 * (theme = a class, accent = `data-accent`, both cascade-safe) so the preview re-themes without
 * any next-themes client state. The lookup runs server-side; see sections-registry.tsx.
 */
export default async function SectionPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ theme?: string; accent?: string }>
}) {
  const { slug } = await params
  const { theme: themeParam, accent: accentParam } = await searchParams

  const entry = SECTIONS[slug]
  if (!entry) notFound()

  const theme = asTheme(themeParam)
  const accent = asAccent(accentParam)
  const Demo = entry.component

  return (
    <div
      className={theme}
      data-accent={accent}
      style={{ colorScheme: theme === "light" ? "light" : "dark" }}
    >
      {/* No min-height from the document itself: it grows to the content so the PreviewFrame can
          size its iframe to the content's `scrollHeight` without a measurement feedback loop.
          Three treatments, mirroring how a real page composes the slab:
            - `bleed` (Banner and other full-bleed bars): skip the gutter and the band padding and
              pin to the very top of a short page region, so it reads as "a bar sitting atop a page".
            - `ownsPadding` (Hero, Navbar, Footer): the slab is its OWN band. It brings its own
              horizontal gutter, width cap, and vertical rhythm, so render it raw, with NO
              SectionContainer gutter and NO band padding. Wrapping it would double-pad it (the exact
              bug this flag guards against).
            - everything else: bare content that needs the canonical marketing gutter, so wrap it in
              SectionContainer (responsive side gutter + 1440px cap) with a `py-10` band so it reads
              as a framed region inside the iframe instead of bleeding to its edges. */}
      {entry.bleed ? (
        <div data-preview-content className="min-h-[13rem] bg-background text-foreground">
          <Demo />
        </div>
      ) : entry.ownsPadding ? (
        <div data-preview-content className="bg-background text-foreground">
          <Demo />
        </div>
      ) : (
        <div data-preview-content className="bg-background py-10 text-foreground">
          <SectionContainer>
            <Demo />
          </SectionContainer>
        </div>
      )}
    </div>
  )
}
