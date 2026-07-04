import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import { Section } from "@/components/landing/section"

/** Closing CTA: a brand-lit panel that funnels to pricing and the docs. */
export function CtaBand() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-lg sm:px-12 sm:py-20">
        {/* The lede now composes the canonical SectionHeader (no hand-rolled h2/p), so the closing
            CTA shares the system's heading scale, balance, and CTA-row rhythm with every other band. */}
        <SectionHeader align="center" className="relative mx-auto max-w-2xl">
          <SectionHeaderText>
            <SectionHeaderHeading>Build polished products, starting today</SectionHeaderHeading>
            <SectionHeaderDescription>
              Install the free tier in minutes, or unlock the full Figma and React system. Pay
              once, and use it forever.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button asChild size="lg">
              <Link href="#pricing">
                Get Koala UI
                <ArrowRight weight="bold" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Read the docs</Link>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>
      </div>
    </Section>
  )
}
