import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { InstallCommand } from "@/components/docs/install-command"

export const metadata = {
  title: "Installation",
}

const stepClass =
  "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground"

const CSS_WIRING = `@import "tailwindcss";
@import "./koala.css";`

const TSCONFIG = `{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}`

const USAGE = `import { Button } from "@/components/ui/button"

export function Example() {
  return <Button>Get started</Button>
}`

const MANUAL_DEPS = "npm install clsx tailwind-merge tailwind-variants tw-animate-css"

export default function InstallationPage() {
  return (
    <>
      <DocHeader
        title="Installation"
        description="Add Koala UI to your React app. Run the one-time setup, wire the tokens into your stylesheet, then add the components you need."
      />

      <p className="text-pretty text-muted-foreground">
        Koala UI ships <strong className="text-foreground">owned source</strong>: the CLI copies
        each component into your repo under{" "}
        <code className="font-mono text-sm">components/ui/</code>, so you own and edit the code, no
        runtime dependency on us. The fastest path is the CLI; you can also copy any component by
        hand from its docs page.
      </p>

      <DocSection title="Quick start">
        <ol className="mt-6 flex flex-col gap-8">
          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                1
              </span>
              <h3 className="font-medium">Run the setup</h3>
            </div>
            <div className="ml-9 flex flex-col gap-3">
              <p className="text-pretty text-muted-foreground">
                <code className="font-mono text-sm">init</code> writes the design tokens to{" "}
                <code className="font-mono text-sm">app/koala.css</code>, drops the shared helpers (
                <code className="font-mono text-sm">cn</code> and the{" "}
                <code className="font-mono text-sm">tv</code> wrapper) into{" "}
                <code className="font-mono text-sm">lib/</code>, and installs the base
                dependencies. No account or auth needed.
              </p>
              <InstallCommand command="koalaui init" />
            </div>
          </li>

          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                2
              </span>
              <h3 className="font-medium">Wire it up</h3>
            </div>
            <div className="ml-9 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-pretty text-muted-foreground">
                  Import the tokens from your global stylesheet, right after Tailwind. Skip this and
                  the components render <strong className="text-foreground">completely unstyled</strong>
                  , because none of Koala&rsquo;s theme tokens or utilities exist yet.
                </p>
                <CodeSnippet lang="css" code={CSS_WIRING} />
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-pretty text-muted-foreground">
                  Every component imports through the{" "}
                  <code className="font-mono text-sm">@/*</code> alias, so your{" "}
                  <code className="font-mono text-sm">tsconfig.json</code> needs it too. Most
                  Next.js projects already have this.
                </p>
                <CodeSnippet lang="ts" code={TSCONFIG} />
              </div>
            </div>
          </li>

          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                3
              </span>
              <h3 className="font-medium">Add components</h3>
            </div>
            <div className="ml-9 flex flex-col gap-3">
              <p className="text-pretty text-muted-foreground">
                Pass one or more component slugs. Each lands in{" "}
                <code className="font-mono text-sm">components/ui/&lt;name&gt;/</code> with its
                dependencies pulled along automatically.
              </p>
              <InstallCommand command="koalaui add button card dialog" />
            </div>
          </li>

          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                4
              </span>
              <h3 className="font-medium">Import and use</h3>
            </div>
            <div className="ml-9 flex flex-col gap-3">
              <p className="text-pretty text-muted-foreground">
                Import from the path the CLI wrote to. Every component is a named export, themed
                through tokens, and accepts <code className="font-mono text-sm">className</code>.
              </p>
              <CodeSnippet lang="tsx" code={USAGE} />
            </div>
          </li>
        </ol>
      </DocSection>

      <DocSection title="Pro sections">
        <p className="mt-4 text-pretty text-muted-foreground">
          Components are free. Marketing sections, page examples and templates are{" "}
          <strong className="text-foreground">Pro</strong> and need a license key. Activate it once
          per machine, then add gated items exactly like free ones.
        </p>
        <ol className="mt-6 flex flex-col gap-8">
          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                1
              </span>
              <h3 className="font-medium">Activate your license</h3>
            </div>
            <div className="ml-9 flex flex-col gap-3">
              <p className="text-pretty text-muted-foreground">
                Your key is shown on the checkout success page and emailed to you. It is saved to{" "}
                <code className="font-mono text-sm">~/.koalaui/config.json</code>.
              </p>
              <InstallCommand command="koalaui login koala_live_xxxxxxxx" />
            </div>
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                2
              </span>
              <h3 className="font-medium">Add a Pro item</h3>
            </div>
            <div className="ml-9 flex flex-col gap-3">
              <p className="text-pretty text-muted-foreground">
                Run <code className="font-mono text-sm">koalaui list</code> to see everything; Pro
                items are marked with a lock.
              </p>
              <InstallCommand command="koalaui add marketing-hero" />
            </div>
          </li>
        </ol>
        <p className="mt-6 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">koalaui whoami</code> shows the active license and{" "}
          <code className="font-mono text-sm">koalaui logout</code> removes it. Your key is
          exchanged for the source on our server, so you never receive a repository token and no
          access is granted to your GitHub account.
        </p>
      </DocSection>

      <DocSection title="Manual installation">
        <p className="mt-4 text-pretty text-muted-foreground">
          Prefer to copy by hand? Install the shared dependencies, bring the tokens over, then copy
          any component source straight from its docs page.
        </p>
        <ol className="mt-6 flex flex-col gap-8">
          <li className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={stepClass} aria-hidden>
                1
              </span>
              <h3 className="font-medium">Install the dependencies</h3>
            </div>
            <div className="ml-9">
              <CodeSnippet lang="bash" code={MANUAL_DEPS} />
            </div>
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className={stepClass} aria-hidden>
                2
              </span>
              <h3 className="font-medium">Copy the tokens</h3>
            </div>
            <p className="ml-9 text-pretty text-muted-foreground">
              The whole theme layer, color roles, radius and shadow scales, motion tokens and the
              custom utilities, lives in one stylesheet. Copy it from{" "}
              <code className="font-mono text-sm">app/globals.css</code> in the repo into your own
              project and import it after{" "}
              <code className="font-mono text-sm">@import &quot;tailwindcss&quot;;</code>. Without
              it, nothing is styled.
            </p>
          </li>
          <li className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className={stepClass} aria-hidden>
                3
              </span>
              <h3 className="font-medium">Copy the source</h3>
            </div>
            <p className="ml-9 text-pretty text-muted-foreground">
              Paste a component into{" "}
              <code className="font-mono text-sm">components/ui/&lt;name&gt;/</code> and point its
              imports at your project: components pull{" "}
              <code className="font-mono text-sm">cn</code> from{" "}
              <code className="font-mono text-sm">lib/utils</code>, the{" "}
              <code className="font-mono text-sm">tv</code> wrapper from{" "}
              <code className="font-mono text-sm">lib/tv</code>, and (for multi-part components){" "}
              <code className="font-mono text-sm">createContext</code> from{" "}
              <code className="font-mono text-sm">lib/create-context</code>.
            </p>
          </li>
        </ol>
      </DocSection>

      <DocSection title="Requirements">
        <ul className="mt-4 flex flex-col gap-2 text-pretty text-muted-foreground">
          <li>
            <strong className="text-foreground">React 19</strong> — components use{" "}
            <code className="font-mono text-sm">ref</code> as a regular prop (no{" "}
            <code className="font-mono text-sm">forwardRef</code>).
          </li>
          <li>
            <strong className="text-foreground">Tailwind CSS v4</strong> — the tokens use{" "}
            <code className="font-mono text-sm">@theme</code>,{" "}
            <code className="font-mono text-sm">@utility</code> and{" "}
            <code className="font-mono text-sm">@custom-variant</code>, which v3 cannot read. A v3
            project has to migrate first.
          </li>
          <li>
            <strong className="text-foreground">Next.js App Router</strong> recommended — the
            named-export, server-component-friendly structure is built for it, but any React 19 +
            Tailwind v4 setup works.
          </li>
        </ul>
      </DocSection>
    </>
  )
}
