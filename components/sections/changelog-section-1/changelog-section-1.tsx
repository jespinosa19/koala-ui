import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"

/**
 * changelog-section-1: the release log.
 *
 * A stacked column of version cards under a centered lede, newest release first. Each card keeps
 * its version pill and date in a narrow left rail, then the title and a short note beside it. The
 * list holds a reading measure (`max-w-3xl`) while the lede keeps the full width, and a quiet ghost
 * action under the list points to the rest of the documentation.
 *
 * On a phone the rail folds into one row above the note, with the pill and the date side by side.
 */

const RELEASES = [
  {
    version: "v11",
    date: "December 13, 2025",
    title: "Acme v11",
    description:
      "This release focuses on faster search, shared dashboards, and a fully responsive workspace that feels the same on a laptop as it does on your phone.",
  },
  {
    version: "Mobile",
    date: "August 9, 2025",
    title: "Introducing Acme for iOS and Android",
    description:
      "Acme now runs natively on your phone, including offline projects, push alerts for mentions, and light/dark themes, so your team can keep work moving from anywhere.",
  },
  {
    version: "v10",
    date: "July 14, 2025",
    title: "Acme v10",
    description:
      "Introducing a visual refresh with a calmer sidebar, faster page loads, and enhanced accessibility. This release also adds key tools like a rich text editor, recurring tasks, time tracking, guest access, and emoji reactions.",
  },
  {
    version: "v9",
    date: "June 9, 2025",
    title: "Acme v9",
    description:
      "After our spring security review, we've spent weeks bringing Acme to the next level. Here's everything new and improved in this release.",
  },
]

export function ChangelogSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <SectionHeaderHeading>New Month, New Updates</SectionHeaderHeading>
            <SectionHeaderDescription>
              We spend the weeks updating the product, introducing new features, new integrations,
              and new workflows. Until Acme is perfect.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="flex flex-col gap-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {RELEASES.map((release) => (
              <article
                key={release.version}
                className="flex flex-col gap-3 rounded-xl border border-border p-6 text-card-foreground shadow-xs sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start">
                  <Badge variant="info" dot pill>
                    {release.version}
                  </Badge>
                  <time className="text-sm text-muted-foreground tabular-nums">{release.date}</time>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{release.title}</h3>
                  <p className="text-sm text-pretty text-muted-foreground">{release.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild variant="ghost">
              <Link href="#">Read the docs</Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}
