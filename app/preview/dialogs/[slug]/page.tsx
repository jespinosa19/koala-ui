import { notFound } from "next/navigation"

import { DIALOG_PREVIEWS } from "@/components/docs/dialog-registry"

export const metadata = { title: "Dialog preview" }

// Allowlists inlined as plain literals on purpose: this is a SERVER component, and the canonical
// THEMES/ACCENTS arrays live in "use client" modules (theme-provider / accent-provider). Importing
// their runtime VALUES here yields a client-reference proxy, the same trap as a client-exported
// registry. Keep these in sync with those providers (matches app/preview/sections/[slug]).
const THEME_NAMES = ["light", "dark", "moonlight"] as const
const ACCENT_NAMES = ["orange", "red", "amber", "green", "teal", "blue", "violet", "pink"] as const
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
 * Isolated render target for a single Dialog pattern, the body of the docs PreviewFrame iframe. It
 * inherits only the root layout (no docs chrome), so the dialog's own `max-w-*` and `sm:` utilities
 * respond to the IFRAME width, not the browser viewport: drag the frame from mobile to desktop and
 * the 30rem card shrinks to fit, the split Upgrade dialog collapses to one column. The demo renders
 * inline (always-open, non-portal; see dialog-registry.tsx) centered over a dimmed backdrop so it
 * reads as a real open modal. Theme/accent are forced from query params onto a wrapper (theme = a
 * class, accent = `data-accent`, both cascade-safe) so the preview re-themes without client state.
 */
export default async function DialogPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ theme?: string; accent?: string }>
}) {
  const { slug } = await params
  const { theme: themeParam, accent: accentParam } = await searchParams

  const entry = DIALOG_PREVIEWS[slug]
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
      {/* The dialog's own border + shadow-lg carry the elevation, so the stage stays on the plain
          page background (same as the PreviewFrame iframe's own bg): any difference between the
          measured content height and the frame's minHeight floor is then a seamless continuation,
          never a visible band. `justify-center` centers the card; the padding is the empty gutter
          that reveals the responsive shrink as the frame narrows. No document min-height, so the
          wrapper grows to the content and PreviewFrame sizes the iframe to `scrollHeight` without a
          measurement feedback loop. */}
      <div
        data-preview-content
        className="flex justify-center bg-background px-5 py-12 text-foreground sm:px-8"
      >
        <Demo />
      </div>
    </div>
  )
}
