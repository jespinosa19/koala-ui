import Link from "next/link"
import { MagnifyingGlass } from "@phosphor-icons/react/ssr"

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
import { InputField, InputPrefix, InputRoot } from "@/components/ui/input"
import { Link as TextLink } from "@/components/ui/link"
import { hitX } from "@/lib/hit-area"

/**
 * status-section-1: the not-found page.
 *
 * A 404 that helps rather than apologises: it says plainly what happened, offers the two ways out
 * most people want (home, or a person), and puts a search field and the site's most visited pages
 * right under them, so a broken link still ends somewhere useful.
 *
 * The band holds a screen's worth of height and centres its content in it, so on a page it reads as
 * a destination between the navbar and the footer rather than a short strip. The search is a plain
 * GET form, so it works without JavaScript and the section stays a server component. On a phone the
 * actions stack full width and the links wrap onto balanced lines.
 */

const LINKS = [
  { label: "Documentation", href: "#" },
  { label: "Components", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Changelog", href: "#" },
]

export function StatusSection1() {
  return (
    <Section className="flex min-h-[40rem] items-center">
      <SectionContainer className="items-center gap-10 lg:gap-12">
        <SectionHeader align="center" size="lg">
          <SectionHeaderText>
            <Badge variant="warning" dot pill>
              Error 404
            </Badge>
            <SectionHeaderHeading level={1}>We can&apos;t find that page</SectionHeaderHeading>
            <SectionHeaderDescription>
              The link may be broken, or the page may have moved. Search for it, or start again from
              one of the pages below.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#">Contact support</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>

        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <form role="search" action="#" className="w-full">
            <InputRoot size="lg">
              <InputPrefix>
                <MagnifyingGlass weight="bold" />
              </InputPrefix>
              <InputField type="search" name="q" placeholder="Search the site" aria-label="Search the site" />
            </InputRoot>
          </form>
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>Popular:</span>
            {LINKS.map((link) => (
              <TextLink key={link.label} asChild className={`${hitX} font-medium`}>
                <Link href={link.href}>{link.label}</Link>
              </TextLink>
            ))}
          </p>
        </div>
      </SectionContainer>
    </Section>
  )
}
