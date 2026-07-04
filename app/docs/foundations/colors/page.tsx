import Link from "next/link"

import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { HexSwatch, PaletteTable, Swatch, SwatchGroup } from "@/components/docs/foundation"
import { SHADES, TAILWIND_PALETTE } from "./palette-data"

export const metadata = { title: "Colors" }

export default function ColorsPage() {
  return (
    <>
      <DocHeader
        title="Colors"
        description="Koala's color system is three layers deep: a literal value (a hex or oklch), the CSS variable that holds it, and the semantic token a component actually writes. Components only ever reach for the top layer, so all themes restyle from one place. Switch themes in the header to see every role update live."
      />

      <DocSection title="Three layers">
        <p className="mt-4 text-pretty text-muted-foreground">
          It helps to keep three things apart. A <strong>literal value</strong> is a raw,
          theme-blind color (<code>#F84416</code>, <code>oklch(1 0 0)</code>). A{" "}
          <strong>CSS variable</strong> (<code>--background</code>, <code>--primary</code>)
          holds one literal per theme. A <strong>semantic token</strong> is the utility a
          component writes (<code>bg-background</code>, <code>text-foreground</code>). It
          resolves to the variable, never to a literal. Change a theme by swapping the
          variables; the literals move, the tokens stay put.
        </p>
        <CodeSnippet
          className="mt-6"
          lang="css"
          filename="the chain, bottom to top"
          code={`/* 1: literal value (raw, theme-blind) */
oklch(0.205 0 0)

/* 2: CSS variable, one literal per theme */
:root  { --primary: oklch(0.205 0 0); }   /* light */
.dark  { --primary: oklch(0.922 0 0); }   /* dark  */

/* 3: semantic token, what a component writes */
@theme inline { --color-primary: var(--primary); }
.button { background: var(--color-primary); }  /* bg-primary */`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          The swatches below document the <strong>token and variable</strong> layers,
          the part you build with. The <Link href="#literal-colors" className="font-medium text-foreground underline underline-offset-4">literal colors</Link>{" "}
          at the bottom are the raw escape hatch. For <em>changing</em> the variables, see{" "}
          <Link href="/docs/foundations/theming" className="font-medium text-foreground underline underline-offset-4">Theming</Link>.
        </p>
      </DocSection>

      {/* ─── Tokens & variables ─────────────────────────────────────────────── */}

      <DocSection title="Surfaces">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each swatch shows the token a component writes and, below it, the CSS variable it
          resolves to.
        </p>
        <div className="mt-6">
          <SwatchGroup title="Backgrounds & surfaces">
            <Swatch surface="bg-background" token="bg-background" variable="--background" description="App background" bordered />
            <Swatch surface="bg-card" token="bg-card" variable="--card" description="Cards, raised panels" bordered />
            <Swatch surface="bg-popover" token="bg-popover" variable="--popover" description="Popovers, menus" bordered />
            <Swatch surface="bg-muted" token="bg-muted" variable="--muted" description="Subtle fills" />
            <Swatch surface="bg-secondary" token="bg-secondary" variable="--secondary" description="Secondary fills" />
            <Swatch surface="bg-accent" token="bg-accent" variable="--accent" description="Hover / active accent" />
          </SwatchGroup>
        </div>
      </DocSection>

      <DocSection title="Content">
        <div className="mt-6">
          <SwatchGroup title="Text & foreground">
            <Swatch surface="bg-foreground" token="text-foreground" variable="--foreground" description="Primary text" />
            <Swatch surface="bg-muted-foreground" token="text-muted-foreground" variable="--muted-foreground" description="Secondary text" />
            <Swatch surface="bg-card-foreground" token="text-card-foreground" variable="--card-foreground" description="Text on cards" />
          </SwatchGroup>
        </div>
        <p className="mt-8 text-pretty text-muted-foreground">
          Inline text links use one role, <code>text-link</code> (a blue, themed per mode), kept
          distinct from <code>text-info</code> (a status hue) and <code>bg-brand</code> (the accent
          action color) so a link still reads as a link under any accent. Links carry an underline at
          rest and turn <code>text-link</code> on hover.
        </p>
        <div className="mt-6">
          <SwatchGroup title="Links">
            <Swatch surface="bg-link" token="text-link" variable="--link" description="Inline text links" />
          </SwatchGroup>
        </div>
      </DocSection>

      <DocSection title="Brand & state">
        <div className="mt-6">
          <SwatchGroup title="Actions">
            <Swatch surface="bg-primary" token="bg-primary" variable="--primary" description="Primary actions" />
            <Swatch surface="bg-secondary" token="bg-secondary" variable="--secondary" description="Secondary actions" />
            <Swatch surface="bg-brand" token="bg-brand" variable="--brand" description="Accent, set via data-accent" />
            <Swatch surface="bg-destructive" token="bg-destructive" variable="--destructive" description="Destructive / error" />
          </SwatchGroup>
        </div>
      </DocSection>

      <DocSection title="Status">
        <p className="mt-4 text-pretty text-muted-foreground">
          Status roles read at full strength for text and icons; soft badges derive their
          tint from the same role via opacity (<code>bg-success/10</code> + <code>text-success</code>).
        </p>
        <div className="mt-6">
          <SwatchGroup title="Feedback roles">
            <Swatch surface="bg-success" token="bg-success" variable="--success" description="Success / positive" />
            <Swatch surface="bg-warning" token="bg-warning" variable="--warning" description="Warning / caution" />
            <Swatch surface="bg-info" token="bg-info" variable="--info" description="Informational" />
            <Swatch surface="bg-destructive" token="bg-destructive" variable="--destructive" description="Error / danger" />
          </SwatchGroup>
        </div>
      </DocSection>

      <DocSection title="Categorical hues">
        <p className="mt-4 text-pretty text-muted-foreground">
          A small, fixed set of distinct hues for labels, tags and category badges. Use
          these when items need to be told apart, not ranked.
        </p>
        <div className="mt-6">
          <SwatchGroup title="Label & tag hues">
            <Swatch surface="bg-purple" token="bg-purple" variable="--purple" />
            <Swatch surface="bg-pink" token="bg-pink" variable="--pink" />
            <Swatch surface="bg-teal" token="bg-teal" variable="--teal" />
            <Swatch surface="bg-orange" token="bg-orange" variable="--orange" />
          </SwatchGroup>
        </div>
      </DocSection>

      <DocSection title="Lines & focus">
        <div className="mt-6">
          <SwatchGroup title="Borders & rings">
            <Swatch surface="bg-border" token="border-border" variable="--border" description="Default borders" />
            <Swatch surface="bg-input" token="border-input" variable="--input" description="Form field borders" />
            <Swatch surface="bg-ring" token="ring-ring" variable="--ring" description="Focus rings" />
          </SwatchGroup>
        </div>
      </DocSection>

      {/* ─── Literal values ─────────────────────────────────────────────────── */}

      <DocSection title="Literal colors">
        <p className="mt-4 text-pretty text-muted-foreground">
          The bottom layer: raw values that do <strong>not</strong> respond to theming. Koala
          authors these in <code>oklch</code> for a wider, more even gamut, but any{" "}
          <code>color-mix()</code>-friendly literal works, including plain hex. Reach for a
          literal only when a color must stay fixed across every theme (a logo, a chart series,
          a brand mark). For anything that should restyle, use a semantic token above.
        </p>

        <div className="mt-6">
          <SwatchGroup title="The brand accent (default)">
            <HexSwatch value="#F84416" name="#F84416" description="Hex: the default Koala accent" />
            <HexSwatch value="oklch(0.648 0.222 34.2)" name="oklch(0.648 0.222 34.2)" description="The same color, as authored" />
          </SwatchGroup>
        </div>

        <p className="mt-8 text-pretty text-muted-foreground">
          Tailwind v4&rsquo;s entire oklch palette ships out of the box: 22 families ×
          11 shades, each a <code>bg-*</code> / <code>text-*</code> / <code>border-*</code>{" "}
          utility (<code>bg-blue-500</code>, <code>text-rose-600</code>, …). Every chip below
          is a fixed literal; hover one to read its <code>family-shade</code> name and oklch
          value.
        </p>
        <div className="mt-6">
          <PaletteTable shades={SHADES} families={TAILWIND_PALETTE} />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="text-pretty">
            <strong className="text-foreground">Rule of thumb:</strong> if it should change
            when the theme changes, it is a <strong>token</strong>: reach for a role above. If
            it must stay exactly that color forever, it is a <strong>literal</strong>.
          </p>
        </div>
      </DocSection>
    </>
  )
}
