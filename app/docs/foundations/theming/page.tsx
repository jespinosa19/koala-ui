import Link from "next/link"

import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { ThemePlayground } from "@/components/docs/theme-playground"

export const metadata = { title: "Theming" }

export default function ThemingPage() {
  return (
    <>
      <DocHeader
        title="Theming"
        description="Koala is themed entirely through CSS variables. Components never reference a raw color, radius or shadow - they read semantic tokens, so one block of variables restyles the whole system. Make it yours below, then copy the result."
      />

      {/* Hero: the live sandbox */}
      <div className="mt-2">
        <ThemePlayground />
      </div>

      <DocSection title="How theming works">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every Koala component is built from <strong>semantic color roles</strong>{" "}
          (<code>bg-background</code>, <code>text-foreground</code>, <code>bg-primary</code>,
          <code>border-border</code> …), a single radius knob (<code>--radius</code>) and a
          single accent knob (<code>--brand</code>). None of those are hard-coded in a
          component - they resolve to CSS variables defined once per theme. Switch the
          variables, and every surface, control and focus ring follows.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          The roles themselves are documented on the{" "}
          <Link href="/docs/foundations/colors" className="font-medium text-foreground underline underline-offset-4">
            Colors
          </Link>{" "}
          page. This page is about <em>changing</em> them.
        </p>
        <CodeSnippet
          className="mt-6"
          lang="css"
          filename="how a component resolves a color"
          code={`/* A button reads a role, never a literal: */
.button { background: var(--primary); }

/* …and the role is defined once, per theme: */
:root      { --primary: oklch(0.205 0 0); }  /* light  */
.dark      { --primary: oklch(0.922 0 0); }  /* dark   */
.moonlight { --primary: oklch(0.704 0.14 264); }`}
        />
      </DocSection>

      <DocSection title="The three built-in themes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Koala ships <strong>light</strong>, <strong>dark</strong> and{" "}
          <strong>moonlight</strong> (blue-tinted dark). Each is a class on{" "}
          <code>&lt;html&gt;</code>; <code>light</code> is the bare <code>:root</code>, so it
          needs no class. We drive the class with{" "}
          <code>next-themes</code> through a thin <code>ThemeProvider</code>.
        </p>
        <CodeSnippet
          className="mt-6"
          filename="app/layout.tsx"
          code={`import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* attribute="class" · themes: light, dark, moonlight */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          Theme and accent are <strong>orthogonal axes</strong>: any of the eight accents
          works under any of the four themes, because the themes deliberately never redefine{" "}
          <code>--brand</code>.
        </p>
      </DocSection>

      <DocSection title="Accent color">
        <p className="mt-4 text-pretty text-muted-foreground">
          The accent is one variable, <code>--brand</code>. Every component reads it through{" "}
          <code>bg-brand</code> / <code>border-brand</code> / <code>ring-brand</code>, so a
          single value recolors checkboxes, switches, sliders, focus rings and links at once.
          Eight presets ship as <code>[data-accent]</code> blocks - apply one by setting the
          attribute on <code>&lt;html&gt;</code>:
        </p>
        <CodeSnippet
          className="mt-6"
          lang="tsx"
          code={`<html data-accent="violet">`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          For a brand color outside the presets, set <code>--brand</code> yourself. The focus
          ring (<code>--ring-brand</code>) derives from it automatically.
        </p>
        <CodeSnippet
          className="mt-6"
          lang="css"
          filename="globals.css"
          code={`:root {
  --brand: oklch(0.55 0.2 255); /* or any hex / rgb, color-mix converts it */
}`}
        />
      </DocSection>

      <DocSection title="Corner radius">
        <p className="mt-4 text-pretty text-muted-foreground">
          One knob, <code>--radius</code>, drives the entire rounding scale. <code>rounded-lg</code>{" "}
          is <code>--radius</code> itself; <code>rounded-sm</code> … <code>rounded-4xl</code> are
          relative multiples of it, so changing the base re-rounds every component concentrically.
        </p>
        <CodeSnippet
          className="mt-6"
          lang="css"
          filename="globals.css"
          code={`:root {
  --radius: 0.5rem; /* default 0.71rem, set 0 for sharp corners */
}`}
        />
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Density is Koala’s spacing axis - the knob that retunes padding, gaps and control
          heights without touching color or radius. Koala serves both information-dense
          application UI and generous marketing surfaces, so <code>density</code> lets one
          subtree tighten or relax with no per-instance props. There are two values:{" "}
          <code>compact</code> (the default - 16px padding/gaps, smaller titles, shorter
          controls) and <code>comfortable</code> (the spacious alternative).
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap a subtree in <code>DensityProvider</code> and every nested Koala component
          follows. The wrapper is <code>display: contents</code>, so it never introduces a box
          into the layout, and it stamps <code>data-density</code> on itself as a CSS/debug
          escape hatch.
        </p>
        <CodeSnippet
          className="mt-6"
          filename="app shell"
          code={`import { DensityProvider } from "@/lib/density"

export default function AppShell({ children }) {
  return (
    // Every Koala component inside tightens up.
    <DensityProvider density="compact">
      {children}
    </DensityProvider>
  )
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          A component resolves its effective density with <code>useDensity()</code>. Precedence
          is <strong>explicit prop &gt; nearest provider &gt; <code>compact</code></strong>, and
          the result feeds the component’s <code>tv</code> recipe. Unlike most Koala contexts,
          density has a safe default, so it works with no provider at all.
        </p>
        <CodeSnippet
          className="mt-6"
          filename="inside a component"
          code={`import { useDensity, type Density } from "@/lib/density"

function Card({ density }: { density?: Density }) {
  // explicit prop > nearest provider > "compact"
  const resolved = useDensity(density)
  return <div className={card({ density: resolved })} />
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          Density is <strong>orthogonal</strong> to theme, accent and radius - it changes only
          spacing, so any density composes with any theme or accent.
        </p>
      </DocSection>

      <DocSection title="Create your own theme">
        <p className="mt-4 text-pretty text-muted-foreground">
          A theme is just a class that redefines the role variables. The fastest path is to
          copy an existing block (light or dark, whichever is closer) and retune the values -
          that guarantees you cover every role a component might read.
        </p>
        <CodeSnippet
          className="mt-6"
          lang="css"
          filename="app/globals.css"
          code={`.sunset {
  /* Surfaces */
  --background: oklch(0.98 0.02 70);
  --foreground: oklch(0.25 0.03 50);
  --card: oklch(1 0.01 70);
  --card-foreground: oklch(0.25 0.03 50);
  --popover: oklch(1 0.01 70);
  --popover-foreground: oklch(0.25 0.03 50);
  /* Brand-neutral actions + muted/accent fills */
  --primary: oklch(0.45 0.15 30);
  --primary-foreground: oklch(0.98 0.02 70);
  --secondary: oklch(0.94 0.03 70);
  --secondary-foreground: oklch(0.3 0.04 40);
  --muted: oklch(0.94 0.03 70);
  --muted-foreground: oklch(0.52 0.03 55);
  --accent: oklch(0.92 0.04 65);
  --accent-foreground: oklch(0.3 0.04 40);
  /* Status, lines + focus */
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.03 70);
  --border-soft: color-mix(in oklch, var(--border) 50%, transparent);
  --input: oklch(0.89 0.03 70);
  --ring: oklch(0.7 0.05 60);
  /* …also copy the success/warning/info, categorical hue,
     --syntax-* and per-theme --shadow-* roles from a sibling block. */
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          Then register the name so <code>next-themes</code> can apply it, and it shows up in
          any theme switcher built from <code>THEMES</code>:
        </p>
        <CodeSnippet
          className="mt-6"
          filename="components/theme-provider.tsx"
          code={`export const THEMES = ["light", "dark", "moonlight", "sunset"] as const`}
        />
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="text-pretty">
            <strong className="text-foreground">Tip:</strong> a colored container (a tinted
            hero, a brand panel) should declare <code>--surface</code> rather than paint a{" "}
            <code>--background</code> block, so nested Inputs, Selects and minimal Tables blend
            into it instead of cutting their own surface.
          </p>
        </div>
      </DocSection>

      <DocSection title="Switching themes at runtime">
        <p className="mt-4 text-pretty text-muted-foreground">
          Because the theme is a class, swapping it live is just <code>setTheme()</code> from{" "}
          <code>next-themes</code>. The header switcher on this site dogfoods exactly this with
          a <code>ButtonGroup</code>:
        </p>
        <CodeSnippet
          className="mt-6"
          filename="theme-switcher.tsx"
          code={`"use client"
import { useTheme } from "next-themes"
import { THEMES } from "@/components/theme-provider"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return THEMES.map((t) => (
    <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>
      {t}
    </button>
  ))
}`}
        />
      </DocSection>
    </>
  )
}
