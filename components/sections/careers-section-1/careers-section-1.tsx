import { CalendarBlank, Money } from "@phosphor-icons/react/ssr"

import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
} from "@/components/ui/section-header"
import {
  JobCard,
  JobCardContent,
  JobCardTitle,
  JobCardMeta,
  JobCardMetaItem,
  JobCardAction,
  JobCardFlag,
} from "@/components/ui/job-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * careers-section-1: the openings table.
 *
 * The densest read of a careers board: no summaries, just role, place, contract and pay lined up in
 * columns under each department heading. `layout="inline"` is the whole trick: it puts the title
 * and the meta tier on ONE line and turns the meta into equal-width auto columns, so every row
 * repeats the identical template and the columns align down the whole board without a grid on the
 * list itself. The rows say nothing about spacing beyond `divided`, because the recipe pins the
 * role column and gives a divided row its own band.
 *
 * `short` on the meta abbreviates the country to its code: equal-width columns are only as wide as
 * the narrowest fact allows, and "San Francisco, United States" does not fit in one of them.
 *
 * Below md the same rows fall back to a stacked block and the Apply button goes full-width, which
 * is the only shape that survives 375px. A five-column table cannot reflow, so it must not try.
 */

type Department = "Engineering" | "Design" | "Product" | "Marketing" | "Sales" | "Operations"

interface Job {
  slug: string
  title: string
  department: Department
  /** ISO 3166-1 alpha-2. `JobCardFlag` draws the flag; the table shows the code, not the name. */
  iso2: string
  city: string
  type: "Full-time" | "Part-time" | "Contract" | "Remote" | "Hybrid"
  salary: { min: number; max: number; currency: "USD" | "EUR" }
}

/**
 * Your board. At least two roles per department, so a filtered view never collapses to one lonely
 * row, and a spread of countries and currencies so the flags and the money formatting are exercised
 * by real data rather than by fourteen identical dollar rows.
 */
const JOBS: Job[] = [
  { slug: "senior-product-designer", title: "Senior Product Designer", department: "Design", iso2: "US", city: "San Francisco", type: "Full-time", salary: { min: 90000, max: 120000, currency: "USD" } },
  { slug: "brand-designer", title: "Brand Designer", department: "Design", iso2: "ES", city: "Barcelona", type: "Hybrid", salary: { min: 55000, max: 75000, currency: "EUR" } },
  { slug: "motion-designer", title: "Motion Designer", department: "Design", iso2: "US", city: "Portland", type: "Contract", salary: { min: 55000, max: 90000, currency: "USD" } },
  { slug: "senior-frontend-engineer", title: "Senior Frontend Engineer", department: "Engineering", iso2: "US", city: "Austin", type: "Remote", salary: { min: 130000, max: 175000, currency: "USD" } },
  { slug: "infrastructure-engineer", title: "Infrastructure Engineer", department: "Engineering", iso2: "DE", city: "Berlin", type: "Full-time", salary: { min: 80000, max: 110000, currency: "EUR" } },
  { slug: "design-engineer", title: "Design Engineer", department: "Engineering", iso2: "GB", city: "London", type: "Hybrid", salary: { min: 75000, max: 105000, currency: "EUR" } },
  { slug: "product-manager", title: "Product Manager", department: "Product", iso2: "US", city: "Boston", type: "Full-time", salary: { min: 100000, max: 150000, currency: "USD" } },
  { slug: "ux-researcher", title: "UX Researcher", department: "Product", iso2: "US", city: "Seattle", type: "Full-time", salary: { min: 70000, max: 100000, currency: "USD" } },
  { slug: "developer-advocate", title: "Developer Advocate", department: "Marketing", iso2: "FR", city: "Paris", type: "Part-time", salary: { min: 45000, max: 65000, currency: "EUR" } },
  { slug: "content-strategist", title: "Content Strategist", department: "Marketing", iso2: "US", city: "Chicago", type: "Remote", salary: { min: 65000, max: 95000, currency: "USD" } },
  { slug: "account-executive", title: "Account Executive", department: "Sales", iso2: "US", city: "New York", type: "Full-time", salary: { min: 80000, max: 120000, currency: "USD" } },
  { slug: "customer-success-manager", title: "Customer Success Manager", department: "Sales", iso2: "US", city: "Denver", type: "Hybrid", salary: { min: 65000, max: 95000, currency: "USD" } },
  { slug: "people-operations-lead", title: "People Operations Lead", department: "Operations", iso2: "US", city: "Miami", type: "Full-time", salary: { min: 75000, max: 110000, currency: "USD" } },
  { slug: "finance-analyst", title: "Finance Analyst", department: "Operations", iso2: "PT", city: "Lisbon", type: "Full-time", salary: { min: 50000, max: 70000, currency: "EUR" } },
]

/** The order the board groups by. Only the first three are shown; widen the slice below to add more. */
const DEPARTMENT_ORDER: Department[] = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
]

/**
 * Locale-PINNED formatters, built once at module scope. This section renders on the server and then
 * hydrates on the client; a bare `new Intl.NumberFormat()` would pick up each side's own locale and
 * produce a hydration mismatch on any machine not set to en-US.
 */
const MONEY = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  EUR: new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
} as const

/** "$90,000 – $120,000". En dash between the bounds, never a hyphen. */
function jobSalary(job: Job) {
  const format = MONEY[job.salary.currency]
  return `${format.format(job.salary.min)} – ${format.format(job.salary.max)}`
}

function jobsIn(department: Department) {
  return JOBS.filter((job) => job.department === department)
}

/**
 * The three meta facts, in one place so the rows cannot drift apart on icon choice or ordering.
 * `tabular-nums` on the salary alone: it is the only figure here, and lining up digits down a
 * column is the whole point of the table layout.
 */
function JobMeta({ job }: { job: Job }) {
  return (
    <JobCardMeta>
      <JobCardMetaItem icon={<JobCardFlag country={job.iso2} />}>
        {/* The short form. The spelled-out country is the longest label in the row, so in an
            equal-width column it is the one thing that truncates, and a location cut off
            mid-country tells you less than the code does. */}
        {job.city}, {job.iso2}
      </JobCardMetaItem>
      <JobCardMetaItem icon={<CalendarBlank />}>{job.type}</JobCardMetaItem>
      <JobCardMetaItem icon={<Money />}>
        <span className="tabular-nums">{jobSalary(job)}</span>
      </JobCardMetaItem>
    </JobCardMeta>
  )
}

export function CareersSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="left" orientation="split">
          <SectionHeaderText>
            <Badge variant="success" dot pill>
              Join us
            </Badge>
            <SectionHeaderHeading>Current openings</SectionHeaderHeading>
            <SectionHeaderDescription>
              Fourteen roles across six teams, from the product itself to the people who help
              customers adopt it.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button>View all roles</Button>
            <Button variant="outline">Life here</Button>
          </SectionHeaderActions>
        </SectionHeader>

        <div className="flex flex-col gap-14">
          {DEPARTMENT_ORDER.slice(0, 3).map((department) => (
            <section key={department} className="flex flex-col gap-4">
              <h3 className="text-xl font-medium text-balance text-foreground">{department}</h3>
              <ul className="flex flex-col">
                {jobsIn(department).map((job) => (
                  <li key={job.slug}>
                    <JobCard layout="inline" divided>
                      <JobCardContent>
                        <JobCardTitle>{job.title}</JobCardTitle>
                        <JobMeta job={job} />
                      </JobCardContent>
                      <JobCardAction>
                        <Button variant="outline" className="max-md:w-full">
                          Apply
                        </Button>
                      </JobCardAction>
                    </JobCard>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
