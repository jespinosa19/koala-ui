import { Check } from "@phosphor-icons/react/ssr"

import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { CodeSnippet } from "@/components/ui/code-snippet"

/**
 * cta-section-1: the install CTA.
 *
 * A two-column slab that sells a developer tool with the tool itself: a left-aligned lede and a
 * benefit checklist beside two stacked code snippets, the install command and the usage example it
 * produces. The lede lives inside the left column rather than centered above the grid, because the
 * checklist is part of the same argument and would read as orphaned under a centered header.
 *
 * Folds to a single stacked column below `lg`, with the terminal landing under the copy.
 */

const INSTALL = `# add components straight into your project
npx @acme/cli add button card dialog

# they land as editable source you own
components/ui/button/button.tsx`

const USAGE = `import { Button } from "@/components/ui/button"

export function Cta() {
  return <Button size="lg">Get started</Button>
}`

const POINTS = [
  "Source copied into your repo, not a black-box package",
  "No runtime dependency you cannot read or edit",
  "Built on Radix primitives and Tailwind v4 tokens",
  "Every recipe is yours to fork, rename, or delete",
]

export function CtaSection1() {
  return (
    <Section>
      <SectionContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeader align="left">
              <SectionHeaderText>
                <Badge variant="info" dot pill>
                  Install
                </Badge>
                <SectionHeaderHeading>One command. You own the code.</SectionHeaderHeading>
                <SectionHeaderDescription>
                  The CLI copies real component source into your project. Tweak any recipe, and it
                  still matches the rest of the system.
                </SectionHeaderDescription>
              </SectionHeaderText>
            </SectionHeader>
            <ul className="flex flex-col gap-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                  {/* The tinted chip is the benefit unit shared across this family: one treatment
                      for a check, never a bare glyph in one variant and a chip in the next. */}
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <Check weight="bold" className="size-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <CodeSnippet code={INSTALL} lang="bash" filename="Terminal" dots />
            <CodeSnippet code={USAGE} lang="tsx" filename="cta.tsx" />
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}
