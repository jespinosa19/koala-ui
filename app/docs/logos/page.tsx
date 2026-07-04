import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert"
import { CodeSnippet } from "@/components/ui/code-snippet"
import { LogoGrid } from "@/components/docs/logo-grid"
import { BrandLogoGrid } from "@/components/docs/brand-logo-grid"
import { BRAND_LOGOS } from "@/components/docs/brand-logos"
import { PLACEHOLDER_BRANDS } from "@/components/docs/placeholder-logos"

export const metadata = { title: "Logos" }

const COUNT = PLACEHOLDER_BRANDS.length
const BRAND_COUNT = BRAND_LOGOS.length

export default function LogosPage() {
  return (
    <>
      <DocHeader
        title="Logos"
        description="A set of placeholder brand logos: fictional companies, each a colored symbol beside an invented wordmark. Drop them into logo walls, testimonials, dashboards, and screenshots when you need a customer's brand but don't have one. Pure inline SVG, no binary assets. Plus a small set of real brand logos (like Spotify) for when you need an actual customer's mark."
      />

      <DocSection title="Logos">
        <p className="mt-4 text-pretty text-muted-foreground">
          {COUNT} imagotypes ordered around the hue wheel: a minimalist colored symbol beside its
          wordmark. Hover a logo and use{" "}
          <span className="font-medium text-foreground">Copy SVG</span> to drop the symbol straight
          into Figma (just paste), or <span className="font-medium text-foreground">Download SVG</span>{" "}
          for a standalone file. The brand color is baked into the export.
        </p>
        <div className="mt-6">
          <LogoGrid />
        </div>
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          In code, import the set and a brand, then render the symbol alone or the full lockup. Map
          the whole list for a logo wall. The symbols are decorative, so they are{" "}
          <code className="font-mono text-sm">aria-hidden</code>; the wordmark carries the accessible
          name.
        </p>
        <CodeSnippet
          filename="logo-wall.tsx"
          className="mt-4"
          code={`import {
  PLACEHOLDER_BRANDS,
  PlaceholderLogo,
} from "@/components/docs/placeholder-logos"

const [apex] = PLACEHOLDER_BRANDS

// The colored symbol on its own
<PlaceholderLogo brand={apex} variant="mark" />

// Symbol + wordmark lockup (the default)
<PlaceholderLogo brand={apex} variant="lockup" />

// A logo wall: map the set
<div className="flex flex-wrap items-center gap-x-10 gap-y-6">
  {PLACEHOLDER_BRANDS.map((brand) => (
    <PlaceholderLogo key={brand.name} brand={brand} variant="lockup" />
  ))}
</div>`}
        />
        <p className="mt-6 text-pretty text-muted-foreground">
          These are fictional placeholders, never real companies. Each mark is dependency-free inline
          SVG that paints with its brand color: the one place these step outside the token system,
          the same documented exception as the OAuth brand marks. Because the symbol uses{" "}
          <code className="font-mono text-sm">currentColor</code>, the wordmark re-themes with{" "}
          <code className="font-mono text-sm">text-foreground</code>, so every lockup reads across all
          four Koala themes.
        </p>
      </DocSection>

      <DocSection title="Brand logos">
        <p className="mt-4 text-pretty text-muted-foreground">
          Sometimes you need a <span className="font-medium text-foreground">real</span>{" "}
          customer&apos;s logo, not a placeholder: say, Spotify or Netflix on a{" "}
          &ldquo;works with&rdquo; wall. Here are {BRAND_COUNT} of the most recognizable brand marks,
          ready to copy or download with the official color baked in. Search by name to find one
          fast. They live apart from the fictional set above because, unlike those, each one is a
          trademark you do not own.
        </p>
        <Alert variant="warning" className="mt-5">
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Each logo is a trademark of its respective owner</AlertTitle>
            <AlertDescription>
              Koala UI is not affiliated with, endorsed by, or sponsored by any of these companies.
              Every logo remains the property of its brand. Before using one, read and follow that
              brand&apos;s own trademark and brand guidelines, linked from the logo (the{" "}
              <span className="font-medium text-foreground">guidelines</span> action on hover) wherever
              the brand publishes them.
            </AlertDescription>
          </AlertContent>
        </Alert>
        <div className="mt-6">
          <BrandLogoGrid />
        </div>
        <p className="mt-6 text-pretty text-muted-foreground">
          Hover a logo and use <span className="font-medium text-foreground">Copy SVG</span> to drop
          the mark straight into Figma, or grab it inline here. The Spotify mark, color baked in and
          ready to paste:
        </p>
        <CodeSnippet
          filename="spotify.svg"
          className="mt-4"
          code={`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#1ED760"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/></svg>`}
        />
        <p className="mt-6 text-pretty text-muted-foreground">
          In code, the set works like the placeholders: import{" "}
          <code className="font-mono text-sm">BRAND_LOGOS</code> and render a mark with{" "}
          <code className="font-mono text-sm">BrandLogo</code>. Each entry carries the brand&apos;s
          domain (the homepage link via <code className="font-mono text-sm">brandHref</code>) and, when
          the brand publishes one, a <code className="font-mono text-sm">guidelines</code> URL, so your
          UI can always point back to the source.
        </p>
        <CodeSnippet
          filename="brand-wall.tsx"
          className="mt-4"
          code={`import { BRAND_LOGOS, BrandLogo, brandHref } from "@/components/docs/brand-logos"

const spotify = BRAND_LOGOS.find((b) => b.name === "Spotify")!

// The trademark mark in its official color
<BrandLogo brand={spotify} />

// Link to the brand, and to its guidelines when published
<a href={brandHref(spotify)}>{spotify.name}</a>
{spotify.guidelines && <a href={spotify.guidelines}>Brand guidelines</a>}

// A row of real brand logos
<div className="flex flex-wrap items-center gap-x-10 gap-y-6">
  {BRAND_LOGOS.map((brand) => (
    <BrandLogo key={brand.name} brand={brand} />
  ))}
</div>`}
        />
      </DocSection>
    </>
  )
}
