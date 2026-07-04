import type { Icon } from "@phosphor-icons/react"
import {
  Atom,
  PersonArmsSpread,
  Swatches,
  Rows,
  Code,
  FileTs,
} from "@phosphor-icons/react/ssr"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Section, SectionHeading } from "@/components/landing/section"
import { FEATURES, type Feature } from "@/components/landing/data"

const FEATURE_ICONS: Record<Feature["icon"], Icon> = {
  react: Atom,
  accessibility: PersonArmsSpread,
  themes: Swatches,
  density: Rows,
  source: Code,
  typescript: FileTs,
}

/** "The hard parts, already handled" feature grid, one Card per real differentiator. */
export function FeatureGrid() {
  return (
    <Section id="features" className="bg-muted/40">
      <SectionHeading
        eyebrow="Why Koala UI"
        title="The hard parts, already handled"
        description="A foundation that handles the hard parts, so your team spends its time on the product, not the primitives."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = FEATURE_ICONS[feature.icon]
          return (
            <Card key={feature.title} density="comfortable" variant="default">
              <CardHeader>
                <span className="mb-2 grid size-11 place-items-center rounded-xl bg-brand/10 text-brand [&>svg]:size-6">
                  <Icon weight="bold" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}
