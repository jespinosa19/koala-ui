import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"

/**
 * faq-section-1: questions, answered.
 *
 * A single-open hairline accordion under a centered lede, and the baseline of the FAQ family:
 * flush rows split by hairlines with no card around them, because a marketing FAQ leads with type
 * and whitespace rather than chrome. The chrome axis lives on the Accordion itself, so swapping
 * `variant="minimal"` for `card` or `separated` is the one edit that changes the look.
 *
 * The measure is capped on the LIST (`max-w-3xl`), not on the container: the lede keeps the
 * section's full width and stays centered against it, while the questions hold a reading measure.
 *
 * One column at every width. On a phone the rows already run the full gutter, so nothing stacks.
 */

const FAQS = [
  {
    question: "What does the platform actually do?",
    answer:
      "It brings your team's projects, documents and reporting into one workspace. Everything lives in the same place, so nothing has to be copied between four separate tools.",
  },
  {
    question: "Who is it built for?",
    answer:
      "Teams that have outgrown a spreadsheet but do not want an enterprise rollout. Product, marketing and operations groups of five to two hundred people get the most out of it.",
  },
  {
    question: "How long does it take to get set up?",
    answer:
      "Most teams are running the same afternoon. You import your existing projects, invite the people who need access, and pick up where your old tool left off.",
  },
  {
    question: "Does it work with the tools we already use?",
    answer:
      "Yes. Slack, Google Workspace, GitHub and Figma have native integrations, and a REST API with webhooks covers anything that is not on the list yet.",
  },
  {
    question: "Can I import our data from another tool?",
    answer:
      "Yes. The importer reads a CSV export or connects straight to your current tool, and it shows you the field mapping before a single record is written.",
  },
  {
    question: "Is our data backed up?",
    answer:
      "Continuously, with point-in-time restore for the last thirty days. Backups are encrypted and kept in a second region, and you can export everything yourself at any time.",
  },
  {
    question: "How does pricing work?",
    answer:
      "You pay per active member each month, and only for the people who actually signed in. Paying annually takes two months off the total.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Fourteen days on the full plan, with no card up front. When it ends your workspace stays exactly as it is, and you choose a plan or drop to the free tier.",
  },
  {
    question: "Can I change or cancel my plan later?",
    answer:
      "At any time, from the billing page. An upgrade applies immediately and is prorated; a downgrade takes effect at the end of the period you already paid for.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, within thirty days of a charge. Write to billing, tell us what went wrong, and the money goes back to the card it came from.",
  },
  {
    question: "Where is our data stored?",
    answer:
      "In the region you pick when the workspace is created, either the EU or the US. Nothing leaves that region, backups and logs included.",
  },
  {
    question: "Are you SOC 2 compliant?",
    answer:
      "Yes, SOC 2 Type II, audited every year, and the report is available under NDA. A signed DPA and full GDPR coverage come with every plan.",
  },
  {
    question: "Can I enforce single sign-on?",
    answer:
      "SAML single sign-on and SCIM provisioning are included on the Business plan. Once SSO is enforced, password logins are switched off for the whole workspace.",
  },
  {
    question: "Who can see what inside a workspace?",
    answer:
      "Access is set per project across four roles, from viewer to admin. Guests only ever see the projects they were invited to, and nothing around them.",
  },
  {
    question: "How do I get help when something breaks?",
    answer:
      "Email support replies within one business day on every plan, and Business adds a shared Slack channel. Live incidents are posted on the status page as they happen.",
  },
  {
    question: "Do you help with onboarding and migration?",
    answer:
      "Every plan includes a guided setup and a migration review. Larger teams get an onboarding call and a workspace template built around how they already work.",
  },
]

export function FaqSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="info" dot pill>
              FAQ
            </Badge>

            <SectionHeaderHeading>Questions, answered</SectionHeaderHeading>
            <SectionHeaderDescription>
              Everything worth knowing before you start.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <Accordion type="single" collapsible variant="minimal" className="mx-auto max-w-3xl">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContainer>
    </Section>
  )
}
