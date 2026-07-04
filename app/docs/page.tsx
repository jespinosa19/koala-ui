import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DocHeader } from "@/components/docs/doc-page"

export const metadata = {
  title: "Introduction",
}

export default function DocsIntroPage() {
  return (
    <>
      <DocHeader
        title="Koala UI"
        description="The React implementation of Koala UI, built on Next.js, Tailwind v4, Radix, and tailwind-variants."
      />

      <p className="text-pretty text-muted-foreground">
        This is the React side of{" "}
        <a
          href="https://koalaui.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline underline-offset-2"
        >
          koalaui.com
        </a>
        : the same design system, as production-ready React components. Components are owned
        source in your repo, styled with a single{" "}
        <code className="font-mono text-sm">tv</code> recipe, accessible by way of Radix
        primitives, and themed entirely through semantic design tokens. Four themes ship out
        of the box: light, dark, cream, and moonlight.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/docs/installation">Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs/components">Browse components</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/docs/architecture">Architecture</Link>
        </Button>
      </div>
    </>
  )
}
