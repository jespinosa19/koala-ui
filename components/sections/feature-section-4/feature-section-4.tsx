import type { Icon } from "@phosphor-icons/react"
import {
  ChartLineUp,
  GlobeHemisphereWest,
  Lightning,
  PlugsConnected,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"

/**
 * feature-section-4: the feature grid.
 *
 * One differentiator per cell in a balanced three-up grid, with no card chrome and no filled icon
 * chip: a bare glyph, a title and one supporting line. The separators come from a ruled grid (the
 * border-colored parent showing through a one-pixel gap), so the only lines on the page are thin
 * rules between cells on both axes. Each cell fills with the background so only the rules read,
 * and the small leading glyph is the lone brand accent.
 *
 * Three columns on a wide frame, two on a tablet, one on a phone.
 */

const FEATURES: { icon: Icon; title: string; description: string }[] = [
  {
    icon: Lightning,
    title: "Fast out of the box",
    description:
      "Edge rendering, smart caching, and background sync keep every screen quick, so there is nothing to tune before launch.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "SSO, audit logs, and role-based access ship with every workspace, so security is handled from day one, not bolted on.",
  },
  {
    icon: UsersThree,
    title: "Built for the whole team",
    description:
      "Shared workspaces, comments, and live presence keep everyone on the same page, from the first draft to the release.",
  },
  {
    icon: PlugsConnected,
    title: "Connects to your stack",
    description:
      "Native integrations and a typed API sync the tools you already use. Plug them in once and data flows both ways.",
  },
  {
    icon: ChartLineUp,
    title: "Insight on every screen",
    description:
      "Usage, retention, and revenue sit right beside the work itself, so the numbers that matter are always one glance away.",
  },
  {
    icon: GlobeHemisphereWest,
    title: "Ready for every market",
    description:
      "Multiple currencies, localized copy, and regional data residency let you open a new country without a second setup.",
  },
]

export function FeatureSection4() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="orange" dot pill>
              Why Acme
            </Badge>
            <SectionHeaderHeading>The hard parts, already handled</SectionHeaderHeading>
            <SectionHeaderDescription>
              A platform that handles the hard parts, so your team spends its time on the product,
              not the plumbing.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3 bg-background p-8">
              <feature.icon weight="bold" className="size-5 text-brand" />
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
