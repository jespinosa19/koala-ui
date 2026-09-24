import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Stat, StatValue, StatLabel } from "@/components/ui/stat"

/**
 * stats-section-1: the library at a glance.
 *
 * A ruled grid with no container: the `bg-border` parent shows through a `gap-px`, which draws the
 * separators as true 1px hairlines on both axes at any column count. That is why the Stats run
 * flush with their own chrome stripped: the grid supplies the structure, so a card around each
 * figure would only box in something that already reads as bare type on the page.
 *
 * Collapses from four columns to a two-up grid on mobile.
 */

const METRICS = [
  { value: "95", label: "React components" },
  { value: "260+", label: "Variants & recipes" },
  { value: "4", label: "Themes" },
  { value: "100%", label: "TypeScript" },
]

export function StatsSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              In the box
            </Badge>
            <SectionHeaderHeading>The whole library, counted</SectionHeaderHeading>
            <SectionHeaderDescription>
              Every component, theme, and recipe you get on install, banded onto one segmented
              surface.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {METRICS.map((metric) => (
            <Stat
              key={metric.label}
              density="comfortable"
              className="items-center gap-1.5 rounded-none border-0 bg-background p-8 text-center shadow-none"
            >
              <StatValue countUp className="text-3xl sm:text-4xl">
                {metric.value}
              </StatValue>
              <StatLabel>{metric.label}</StatLabel>
            </Stat>
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
