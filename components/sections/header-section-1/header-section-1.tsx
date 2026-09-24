import Link from "next/link"

import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * header-section-1: the centered page header.
 *
 * The opening of an inner page rather than a landing page: the eyebrow, the page's one H1 and a
 * short lede on the page ground, with nothing competing with them. A hero sells; a page header
 * only has to say where you are, so it drops the media, the proof and the display scale a hero
 * reaches for and lets the content below start sooner.
 *
 * The heading is `level={1}`: this band is the page title, so it owns the page's single H1 and
 * every section under it keeps its H2. Actions are optional and render only when you pass some.
 * On a phone the copy stays centred and the actions stack to full width.
 */

export interface HeaderSection1Props {
  eyebrow?: string
  title?: string
  description?: string
  actions?: { label: string; href: string }[]
}

const HEADER = {
  eyebrow: "Blog",
  title: "Field notes on building design systems",
  description:
    "Deep dives, release notes and the thinking behind Koala UI, written by the people who build it.",
  actions: [] as { label: string; href: string }[],
}

export function HeaderSection1({
  eyebrow = HEADER.eyebrow,
  title = HEADER.title,
  description = HEADER.description,
  actions = HEADER.actions,
}: HeaderSection1Props) {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center" size="lg">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              {eyebrow}
            </Badge>
            <SectionHeaderHeading level={1}>{title}</SectionHeaderHeading>
            <SectionHeaderDescription>{description}</SectionHeaderDescription>
          </SectionHeaderText>
          {actions.length > 0 && (
            <SectionHeaderActions>
              {actions.map((action, i) => (
                <Button key={action.label} asChild variant={i === 0 ? "primary" : "outline"}>
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </SectionHeaderActions>
          )}
        </SectionHeader>
      </SectionContainer>
    </Section>
  )
}
