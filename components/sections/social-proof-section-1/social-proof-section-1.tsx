"use client"

import { Badge } from "@/components/ui/badge"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"

import { RotatingLogo, SLOTS, useLogoSwap } from "./logos"

/**
 * social-proof-section-1: the logo cloud.
 *
 * A centered lede over an airy grid of customer logos, the strip that usually sits right under a
 * hero. A grid, not a wrapping row: its column count divides the logo count, so the rows always
 * balance (two-up on a phone, four-up above) and never strand one logo on the last line. Every few
 * seconds the whole wall rolls over to the next set of customers.
 */

export function SocialProofSection1() {
  const swap = useLogoSwap()
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              Customers
            </Badge>
            <SectionHeaderHeading>Trusted by the teams behind great products</SectionHeaderHeading>
            <SectionHeaderDescription>
              From fast-moving startups to the Fortune 500, thousands of companies build with us
              every day.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <ul className="grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-8 sm:grid-cols-4 sm:gap-x-14">
          {Array.from({ length: SLOTS }, (_, i) => (
            <li key={i}>
              <RotatingLogo index={i} swap={swap} />
            </li>
          ))}
        </ul>
      </SectionContainer>
    </Section>
  )
}
