import { CodeSnippet } from "@/components/ui/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Code Snippet",
}

const HERO_CODE = `import { Button } from "@/components/ui/button"
import { ArrowRight } from "@phosphor-icons/react"

export function CallToAction() {
  // The label is the affordance; the icon just clarifies it.
  return (
    <Button>
      Get started
      <ArrowRight className="size-4" />
    </Button>
  )
}`

const BASH_CODE = `# One-time setup (tokens + lib helpers)
npx koalaui init

# Add a component (its dependencies come along)
npx koalaui add button`

const CSS_CODE = `:root {
  --radius: 1rem;
  --primary: oklch(0.62 0.19 256);
  --syntax-keyword: oklch(0.5 0.2 295);
}

.dark {
  --primary: oklch(0.7 0.16 256);
}`

const LONG_CODE = `import * as React from "react"

import { tv } from "@/lib/tv"
import { Button } from "@/components/ui/button"

type Member = {
  id: string
  name: string
  email: string
  status: "Active" | "Invited" | "Suspended"
  balance: number
}

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <TableCellText primary={row.original.name} secondary={row.original.email} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Badge size="sm">{getValue<string>()}</Badge>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    meta: { numeric: true },
    cell: ({ getValue }) => \`$\${getValue<number>()}\`,
  },
]

export function MembersTable({ data }: { data: Member[] }) {
  return <DataTable columns={columns} data={data} />
}`

export default function CodeSnippetDocsPage() {
  return (
    <>
      <DocHeader
        title="Code Snippet"
        description="A polished code block: rounded surface, optional window chrome, copy-on-hover, line numbers, and token-driven syntax highlighting that re-themes across every theme. The highlighter is a small, dependency-free tokenizer scoped to TS/TSX, shell, and CSS."
      />

      <CodeSnippet filename="call-to-action.tsx" code={HERO_CODE} />

      <DocSection title="Installation">
        <Installation component="code-snippet" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { CodeSnippet } from "@/components/ui/code-snippet"

export function Example() {
  return <CodeSnippet lang="tsx" code={\`const x = 1\`} />
}`}
        />
      </DocSection>

      <DocSection title="Languages">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">lang</code> to switch grammars. TS/TSX, shell
          (<code className="font-mono text-sm">bash</code>/<code className="font-mono text-sm">sh</code>),
          and CSS are highlighted; the language chip in the header reflects the choice.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <CodeSnippet filename="install.sh" lang="bash" code={BASH_CODE} />
          <CodeSnippet filename="globals.css" lang="css" code={CSS_CODE} />
        </div>
      </DocSection>

      <DocSection title="Window chrome">
        <p className="mt-4 text-pretty text-muted-foreground">
          A <code className="font-mono text-sm">filename</code> adds the header bar with a
          language chip; <code className="font-mono text-sm">dots</code> adds macOS-style window
          dots. Omit both for a chromeless block.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <CodeSnippet
            filename="button.tsx"
            dots
            code={`export function Button() {
  return <button className="btn">Click me</button>
}`}
          />
          <CodeSnippet
            code={`export function Button() {
  return <button className="btn">Click me</button>
}`}
          />
        </div>
      </DocSection>

      <DocSection title="Line numbers">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">showLineNumbers</code> to render a
          tabular-nums gutter, useful for longer listings or when referencing a specific line.
        </p>
        <CodeSnippet
          className="mt-4"
          filename="tokenize.ts"
          showLineNumbers
          code={`export function tokenize(code: string) {
  const tokens = []
  for (const line of code.split("\\n")) {
    tokens.push(line.trim())
  }
  return tokens
}`}
        />
      </DocSection>

      <DocSection title="Collapsible">
        <p className="mt-4 text-pretty text-muted-foreground">
          Long listings get noisy. Set{" "}
          <code className="font-mono text-sm">collapsible</code> to clamp the block to{" "}
          <code className="font-mono text-sm">collapsedHeight</code> (320px by default): the last
          lines dissolve into a bottom fade and a <em>Show more</em> toggle expands it to full
          height, animated. The toggle only appears once the content actually overflows the
          clamp, measured from the DOM, so short blocks are left untouched.
        </p>
        <CodeSnippet
          className="mt-4"
          filename="members-table.tsx"
          collapsible
          showLineNumbers
          code={LONG_CODE}
        />
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Like other Koala surfaces, Code Snippet honors{" "}
          <code className="font-mono text-sm">density</code>.{" "}
          <code className="font-mono text-sm">compact</code> (the default) suits dense app UI;{" "}
          <code className="font-mono text-sm">comfortable</code> opens up the padding for docs and
          marketing. Density retunes spacing only, never radius or color.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <CodeSnippet
            filename="comfortable.tsx"
            density="comfortable"
            code={`const theme = "moonlight"`}
          />
          <CodeSnippet
            filename="compact.tsx"
            density="compact"
            code={`const theme = "moonlight"`}
          />
        </div>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-medium">Prop</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Default</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">code</td>
                <td className="px-4 py-2.5 text-muted-foreground">string</td>
                <td className="px-4 py-2.5 text-muted-foreground">-</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  The source to render and copy. Required.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">lang</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  &quot;tsx&quot; | &quot;ts&quot; | &quot;js&quot; | &quot;css&quot; | &quot;bash&quot; | &quot;sh&quot;
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">&quot;tsx&quot;</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Grammar used for highlighting and the header chip.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">filename</td>
                <td className="px-4 py-2.5 text-muted-foreground">string</td>
                <td className="px-4 py-2.5 text-muted-foreground">-</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Filename chip in the header (also enables the header bar).
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">dots</td>
                <td className="px-4 py-2.5 text-muted-foreground">boolean</td>
                <td className="px-4 py-2.5 text-muted-foreground">false</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Show macOS-style window dots in the header.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">showLineNumbers</td>
                <td className="px-4 py-2.5 text-muted-foreground">boolean</td>
                <td className="px-4 py-2.5 text-muted-foreground">false</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Render a line-number gutter.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">collapsible</td>
                <td className="px-4 py-2.5 text-muted-foreground">boolean</td>
                <td className="px-4 py-2.5 text-muted-foreground">false</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Clamp long listings behind a Show more / Show less toggle. The toggle only
                  appears once the content overflows the clamp.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">collapsedHeight</td>
                <td className="px-4 py-2.5 text-muted-foreground">number</td>
                <td className="px-4 py-2.5 text-muted-foreground">320</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Clamped height in px when collapsible and collapsed.
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="px-4 py-2.5">density</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  &quot;comfortable&quot; | &quot;compact&quot;
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">&quot;compact&quot;</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Padding density. Resolves prop &gt; provider &gt; compact.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">className</td>
                <td className="px-4 py-2.5 text-muted-foreground">string</td>
                <td className="px-4 py-2.5 text-muted-foreground">-</td>
                <td className="px-4 py-2.5 font-sans text-muted-foreground">
                  Merged onto the root surface. All other div props forward too.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Which languages does the highlighter support?", a: "Set lang to switch grammars: TS/TSX, shell (bash or sh), and CSS are highlighted by a small, dependency-free tokenizer, and the header chip reflects the choice. Other values render as plain text." },
            { q: "How do I get the window chrome header?", a: "Pass a filename to add the header bar with a language chip, and add the dots prop for macOS-style window dots. Omit both for a chromeless block." },
            { q: "Will the syntax colors follow my theme?", a: "Yes. Highlighting is driven by syntax tokens (CSS variables), so the code re-themes across all four palettes rather than using fixed colors. Density retunes spacing only, never radius or color." },
            { q: "How do I add a line-number gutter?", a: "Set showLineNumbers to render a tabular-nums gutter, useful for longer listings or when referencing a specific line." },
            { q: "How do I collapse a long code block?", a: "Set collapsible to clamp the block to collapsedHeight (320px by default). The last lines fade into the surface and a Show more / Show less toggle expands it to full height. The toggle only shows up once the content actually overflows the clamp, so short blocks stay untouched." },
            { q: "There are two CodeSnippets in Koala. Which import do I use?", a: "For app code use the component at @/components/ui/code-snippet. The @/components/docs/code-snippet import is a docs-site wrapper used by these pages." },
            { q: "Is there a copy button?", a: "Yes. The block shows a copy-on-hover control that copies the exact code string you pass, so consumers can grab it without selecting text." },
          ]}
        />
      </DocSection>
    </>
  )
}
