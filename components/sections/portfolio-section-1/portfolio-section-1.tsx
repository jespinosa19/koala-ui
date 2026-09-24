import Link from "next/link"
import { CaretRight } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  List,
  ListItem,
  ListItemContent,
  ListItemDescription,
  ListItemMedia,
  ListItemMeta,
  ListItemTitle,
} from "@/components/ui/list"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderActions,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"

/**
 * portfolio-section-1: work index.
 *
 * The back catalogue of a studio as one scannable table: a thumbnail, the project name, then
 * three aligned meta columns for duration, years and client, with a case study chip riding the
 * right edge. It is built on the plain, divided List, so the rule between rows is a hairline
 * pseudo-element and hovering lifts a detached rounded pill behind the row rather than a fill that
 * bleeds to the page edge (a bottom border would take the pill radius and curl up at both ends).
 *
 * The meta columns carry fixed widths so they line up down the list instead of ragging with each
 * title. Below md they fold into the secondary line under the name and the chip becomes a caret.
 */

const THUMB_CROP = "auto=format&fit=crop&w=160&h=160&q=80"

const PROJECTS = [
  {
    href: "/work/halcyon-design-system",
    name: "Design system rebuild",
    client: "Halcyon",
    duration: "8 months",
    years: "2024-2025",
    image: `https://images.unsplash.com/photo-1561070791-2526d30994b5?${THUMB_CROP}`,
  },
  {
    href: "/work/lumen-site-relaunch",
    name: "Marketing site relaunch",
    client: "Lumen",
    duration: "6 months",
    years: "2024",
    image: `https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?${THUMB_CROP}`,
  },
  {
    href: "/work/prism-plugin-suite",
    name: "Plugin suite redesign",
    client: "Prism",
    duration: "5 months",
    years: "2023-2024",
    image: `https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?${THUMB_CROP}`,
  },
  {
    href: "/work/nimbus-docs",
    name: "Documentation platform",
    client: "Nimbus",
    duration: "10 months",
    years: "2023-2024",
    image: `https://images.unsplash.com/photo-1542744094-3a31f272c490?${THUMB_CROP}`,
  },
  {
    href: "/work/cobalt-onboarding",
    name: "Onboarding overhaul",
    client: "Cobalt",
    duration: "7 months",
    years: "2023",
    image: `https://images.unsplash.com/photo-1545235617-9465d2a55698?${THUMB_CROP}`,
  },
  {
    href: "/work/strata-brand-refresh",
    name: "Brand and web refresh",
    client: "Strata",
    duration: "9 months",
    years: "2022-2023",
    image: `https://images.unsplash.com/photo-1572044162444-ad60f128bdea?${THUMB_CROP}`,
  },
  {
    href: "/work/tally-reporting",
    name: "Reporting dashboard",
    client: "Tally",
    duration: "6 months",
    years: "2022",
    image: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?${THUMB_CROP}`,
  },
  {
    href: "/work/sonar-creator-hub",
    name: "Creator hub launch",
    client: "Sonar",
    duration: "4 months",
    years: "2022",
    image: `https://images.unsplash.com/photo-1519389950473-47ba0277781c?${THUMB_CROP}`,
  },
]

// A hairline inset ring in pure black (pure white in dark themes) frames the photo without picking
// up the surface tint, and a muted bed stops a slow image from flashing the page through. The ring
// is a pseudo-element, not a border, so it never eats into the crop.
const FRAME =
  "relative overflow-hidden bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] dark:after:ring-white/10"

// The title underlines on row hover by fading the decoration in, so the text never shifts.
const TITLE_HOVER =
  "underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-base ease-out group-hover:decoration-current"

export function PortfolioSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="left">
          <SectionHeaderText>
            <Badge variant="orange" dot pill>
              Our work
            </Badge>
            <SectionHeaderHeading>Selected work from the last four years</SectionHeaderHeading>
            <SectionHeaderDescription>
              Design systems, product surfaces, and the sites that sell them. Every project below
              shipped, and every one of them is still running.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild>
              <Link href="/contact">Start a project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/work">Browse the archive</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>

        <List variant="plain" divided>
          {PROJECTS.map((project) => (
            <ListItem key={project.href} asChild>
              <a href={project.href} className="group py-3">
                <ListItemMedia>
                  <span className={cn(FRAME, "block size-10 rounded-md")}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
                    <img
                      src={project.image}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="size-full object-cover"
                    />
                  </span>
                </ListItemMedia>

                <ListItemContent>
                  <ListItemTitle className={cn("text-base", TITLE_HOVER)}>
                    {project.name}
                  </ListItemTitle>
                  <ListItemDescription className="tabular-nums md:hidden">
                    {project.duration} · {project.years} · {project.client}
                  </ListItemDescription>
                </ListItemContent>

                <ListItemMeta className="gap-6">
                  <span className="hidden w-24 tabular-nums md:block">{project.duration}</span>
                  <span className="hidden w-24 tabular-nums md:block">{project.years}</span>
                  <span className="hidden w-24 truncate md:block">{project.client}</span>
                  {/* The whole row is the link, so the chip is a styled span and never a real
                      control: a button nested in an anchor is invalid and traps the keyboard. It
                      still presses along with the row through group-active. */}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hidden group-active:scale-[0.96] md:inline-flex"
                  >
                    <span>View case study</span>
                  </Button>
                  <CaretRight aria-hidden className="size-4 md:hidden" />
                </ListItemMeta>
              </a>
            </ListItem>
          ))}
        </List>
      </SectionContainer>
    </Section>
  )
}
