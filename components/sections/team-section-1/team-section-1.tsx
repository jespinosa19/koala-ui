import Link from "next/link"
import { GithubLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/ssr"

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
import {
  TeamMember,
  TeamMemberMedia,
  TeamMemberContent,
  TeamMemberName,
  TeamMemberRole,
  TeamMemberSocials,
  TeamMemberSocial,
} from "@/components/ui/team-member"

/**
 * team-section-1: the portrait grid.
 *
 * The roster most About pages open with: a split lede with the action pair on the right, then the
 * team as tall 4:5 portraits, three to a row, each with the name, the role and a row of links under
 * the photograph. The portraits carry the section, so the copy under them stays at two short lines
 * and the links sit on the quiet ink until they are hovered.
 *
 * Three columns rather than four: at three the portraits are large enough to read as people rather
 * than as thumbnails. Two columns from `sm`, one on a phone, where each portrait takes the width.
 */

const PHOTO = "q=80&w=640&h=800&auto=format&fit=crop&crop=faces"

const TEAM = [
  { name: "Lucía Ferrer", role: "Co-founder & CEO", photo: "1580489944761-15a19d654956" },
  { name: "Daniel Weiss", role: "Co-founder & CTO", photo: "1500648767791-00dcc994a43e" },
  { name: "Sara Benali", role: "Head of Design", photo: "1567532939604-b6b5b0db2604" },
  { name: "Marcus Obi", role: "Design Engineer", photo: "1566492031773-4f4e44671857" },
  { name: "Amara Nwosu", role: "Accessibility Lead", photo: "1611432579699-484f7990b127" },
  { name: "Kenji Mori", role: "Frontend Engineer", photo: "1542909168-82c3e7fdca5c" },
]

const SOCIALS = [
  { network: "LinkedIn", icon: LinkedinLogo },
  { network: "X", icon: XLogo },
  { network: "GitHub", icon: GithubLogo },
]

export function TeamSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader orientation="split">
          <SectionHeaderText>
            <Badge variant="purple" dot pill>
              Our team
            </Badge>
            <SectionHeaderHeading>The people behind every component</SectionHeaderHeading>
            <SectionHeaderDescription>
              Designers and engineers who ship the system they use every day, from the first token
              to the last template.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild>
              <Link href="#">Open roles</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#">Our story</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((person) => (
            <TeamMember key={person.name} asChild>
              <li>
                <TeamMemberMedia shape="portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote crop; swap for next/Image */}
                  <img
                    src={`https://images.unsplash.com/photo-${person.photo}?${PHOTO}`}
                    alt={person.name}
                    loading="lazy"
                    draggable={false}
                  />
                </TeamMemberMedia>
                <TeamMemberContent>
                  <TeamMemberName>{person.name}</TeamMemberName>
                  <TeamMemberRole>{person.role}</TeamMemberRole>
                  <TeamMemberSocials>
                    {SOCIALS.map(({ network, icon: Icon }) => (
                      <TeamMemberSocial key={network} href="#" label={`${person.name} on ${network}`}>
                        <Icon weight="bold" />
                      </TeamMemberSocial>
                    ))}
                  </TeamMemberSocials>
                </TeamMemberContent>
              </li>
            </TeamMember>
          ))}
        </ul>
      </SectionContainer>
    </Section>
  )
}
