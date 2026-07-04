import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/landing/section"
import { CHANGELOG } from "@/components/landing/data"

/** "New month, new updates": the recent release log as a simple timeline of cards. */
export function Changelog() {
  return (
    <Section id="changelog">
      <SectionHeading
        eyebrow="Changelog"
        title="New month, new updates"
        description="The library ships improvements every month. Here is what landed recently."
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {CHANGELOG.map((entry) => (
          <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs sm:flex-row sm:items-start sm:gap-6" key={entry.version}>
            <div className="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start">
              <Badge variant="outline" pill>
                {entry.version}
              </Badge>
              <time className="text-sm text-muted-foreground tabular-nums">{entry.date}</time>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold">{entry.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{entry.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center">
        <Button asChild variant="ghost">
          <Link href="/docs">Read the docs</Link>
        </Button>
      </div>
    </Section>
  )
}
