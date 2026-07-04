import Image from "next/image"

import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
  SectionHeaderChip,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Section Header responsive preview" }

// Inlined allowlists on purpose: this is a SERVER component and the canonical THEMES/ACCENTS live in
// "use client" modules, so importing their runtime values here yields a client-reference proxy. Keep
// these in sync with theme-provider / accent-provider (matches app/preview/sections/[slug]).
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
 * Isolated render target for the SectionHeader `Responsive` docs section, the body of a docs
 * PreviewFrame iframe. It inherits only the root layout (no docs chrome), so the header's own
 * `sm:`/`lg:` utilities respond to the IFRAME width, not the browser viewport: dragging the frame
 * from mobile to desktop shows the real breakpoint recomposition (the `size` scale steps, the
 * actions row stacking, the `split` layout, and `em`-sized chips). Theme and accent are forced from
 * query params onto a wrapper so the preview re-themes without any client state.
 */
export default async function SectionHeaderResponsivePreview({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; accent?: string }>
}) {
  const { theme: themeParam, accent: accentParam } = await searchParams
  const theme = asTheme(themeParam)
  const accent = asAccent(accentParam)

  return (
    <div
      className={theme}
      data-accent={accent}
      style={{ colorScheme: theme === "light" ? "light" : "dark" }}
    >
      <div
        data-preview-content
        className="flex flex-col gap-14 bg-background px-6 py-10 text-foreground sm:px-8 sm:py-12"
      >
        {/* Canonical header: split orientation + actions. Shows the size scale, the actions row
            stacking full-width on a phone then becoming a row from `sm`, and `split` laying the lede
            and actions side by side from `lg` (stacked below). */}
        <SectionHeader align="left" orientation="split">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              Best value
            </Badge>
            <SectionHeaderHeading>Discover our key features</SectionHeaderHeading>
            <SectionHeaderDescription>
              At Koala Studio, we take pride in providing a unique set of essential features that
              truly distinguish us from the competition.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button>Get started</Button>
            <Button variant="outline">Explore features</Button>
          </SectionHeaderActions>
        </SectionHeader>

        {/* Centered header with a framed brand chip: the centered block shrinks to the viewport, and
            the tile rides the heading's font size at each breakpoint. */}
        <SectionHeader align="center" size="lg">
          <SectionHeaderText>
            <SectionHeaderHeading level={1}>
              Be yourself until you can be a{" "}
              <SectionHeaderChip aria-label="Koala">
                <Image src="/koala-logo.webp" alt="" width={80} height={80} className="size-full" />
              </SectionHeaderChip>
            </SectionHeaderHeading>
          </SectionHeaderText>
        </SectionHeader>

        {/* Centered header with bare emoji chips interleaved with the copy. */}
        <SectionHeader align="center" size="lg">
          <SectionHeaderText>
            <SectionHeaderHeading level={1}>
              The daily{" "}
              <SectionHeaderChip variant="bare">📅</SectionHeaderChip> planner to keep{" "}
              <SectionHeaderChip variant="bare">⚡</SectionHeaderChip> distracted{" "}
              <SectionHeaderChip variant="bare">🧠</SectionHeaderChip> minds on track
            </SectionHeaderHeading>
          </SectionHeaderText>
        </SectionHeader>
      </div>
    </div>
  )
}
