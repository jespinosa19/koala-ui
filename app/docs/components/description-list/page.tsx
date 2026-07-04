import type { CSSProperties } from "react"
import {
  CalendarDots,
  CreditCard,
  EnvelopeSimple,
  Hash,
  MapPin,
  ShieldCheck,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react/ssr"

import {
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Description List",
}

export default function DescriptionListDocsPage() {
  return (
    <>
      <DocHeader
        title="Description List"
        description="A semantic key/value detail view for records: profiles, invoices, settings read-outs. Renders a real <dl>/<dt>/<dd> tree; the row layout splits term and value at sm and stacks on mobile, and any value cell composes Koala parts like Badge or Avatar."
      />

      <ComponentPreview
        previewClassName="block"
        code={`<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Subscription</CardTitle>
  </CardHeader>
  <CardContent>
    <DescriptionList divided>
      <DescriptionListItem>
        <DescriptionTerm>
          <CreditCard /> Plan
        </DescriptionTerm>
        <DescriptionDetails>
          Pro <Badge variant="success" size="sm" pill>Annual</Badge>
        </DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>
          <UsersThree /> Seats
        </DescriptionTerm>
        <DescriptionDetails>12 of 20</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>
          <CalendarDots /> Renews
        </DescriptionTerm>
        <DescriptionDetails>March 1, 2026</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>
          <UserCircle /> Owner
        </DescriptionTerm>
        <DescriptionDetails>Esteban Alonso</DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  </CardContent>
</Card>`}
      >
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList divided>
              <DescriptionListItem>
                <DescriptionTerm>
                  <CreditCard weight="bold" /> Plan
                </DescriptionTerm>
                <DescriptionDetails>
                  Pro <Badge variant="success" size="sm" pill>Annual</Badge>
                </DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>
                  <UsersThree weight="bold" /> Seats
                </DescriptionTerm>
                <DescriptionDetails>12 of 20</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>
                  <CalendarDots weight="bold" /> Renews
                </DescriptionTerm>
                <DescriptionDetails>March 1, 2026</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>
                  <UserCircle weight="bold" /> Owner
                </DescriptionTerm>
                <DescriptionDetails>Esteban Alonso</DescriptionDetails>
              </DescriptionListItem>
            </DescriptionList>
          </CardContent>
        </Card>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="description-list" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list"

export function Example() {
  return (
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionTerm>Email</DescriptionTerm>
        <DescriptionDetails>esteban@koalaui.com</DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  )
}`}
        />
      </DocSection>

      <DocSection title="Layout">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">row</code> (default) places the term in a
          fixed-width column with the value beside it, splitting at the{" "}
          <code className="font-mono text-sm">sm</code> breakpoint and stacking on mobile.{" "}
          <code className="font-mono text-sm">stack</code> keeps the term above the value
          at every width, better for narrow surfaces and long values.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<DescriptionList layout="row">
  <DescriptionListItem>
    <DescriptionTerm>Email</DescriptionTerm>
    <DescriptionDetails>esteban@koalaui.com</DescriptionDetails>
  </DescriptionListItem>
  <DescriptionListItem>
    <DescriptionTerm>Location</DescriptionTerm>
    <DescriptionDetails>Barcelona, Spain</DescriptionDetails>
  </DescriptionListItem>
</DescriptionList>

<DescriptionList layout="stack">
  {/* term sits above the value */}
</DescriptionList>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8 sm:grid-cols-2">
            <DescriptionList layout="row" divided>
              <DescriptionListItem>
                <DescriptionTerm>
                  <EnvelopeSimple weight="bold" /> Email
                </DescriptionTerm>
                <DescriptionDetails>esteban@koalaui.com</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>
                  <MapPin weight="bold" /> Location
                </DescriptionTerm>
                <DescriptionDetails>Barcelona, Spain</DescriptionDetails>
              </DescriptionListItem>
            </DescriptionList>
            <DescriptionList layout="stack" divided>
              <DescriptionListItem>
                <DescriptionTerm>
                  <EnvelopeSimple weight="bold" /> Email
                </DescriptionTerm>
                <DescriptionDetails>esteban@koalaui.com</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>
                  <MapPin weight="bold" /> Location
                </DescriptionTerm>
                <DescriptionDetails>Barcelona, Spain</DescriptionDetails>
              </DescriptionListItem>
            </DescriptionList>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Divided">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">divided</code> for a hairline rule
          between rows. Turns a loose list into a scannable, table-like read.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<DescriptionList divided>
  <DescriptionListItem>
    <DescriptionTerm>Invoice</DescriptionTerm>
    <DescriptionDetails>INV-2026-0042</DescriptionDetails>
  </DescriptionListItem>
  <DescriptionListItem>
    <DescriptionTerm>Status</DescriptionTerm>
    <DescriptionDetails>
      <Badge variant="success" size="sm" pill>Paid</Badge>
    </DescriptionDetails>
  </DescriptionListItem>
</DescriptionList>`}
        >
          <DescriptionList divided className="mx-auto w-full max-w-md">
            <DescriptionListItem>
              <DescriptionTerm>
                <Hash weight="bold" /> Invoice
              </DescriptionTerm>
              <DescriptionDetails>INV-2026-0042</DescriptionDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionTerm>
                <CreditCard weight="bold" /> Method
              </DescriptionTerm>
              <DescriptionDetails>Visa ending 4242</DescriptionDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionTerm>
                <ShieldCheck weight="bold" /> Status
              </DescriptionTerm>
              <DescriptionDetails>
                <Badge variant="success" size="sm" pill>
                  Paid
                </Badge>
              </DescriptionDetails>
            </DescriptionListItem>
          </DescriptionList>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Density tunes the per-row vertical padding. <code className="font-mono text-sm">compact</code>{" "}
          (the default) suits dashboards; <code className="font-mono text-sm">comfortable</code>{" "}
          gives a roomier marketing read. It also honors a surrounding{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<DescriptionList density="compact" divided>…</DescriptionList>
<DescriptionList density="comfortable" divided>…</DescriptionList>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8 sm:grid-cols-2">
            <DescriptionList density="compact" divided>
              <DescriptionListItem>
                <DescriptionTerm>Plan</DescriptionTerm>
                <DescriptionDetails>Pro</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>Seats</DescriptionTerm>
                <DescriptionDetails>12 of 20</DescriptionDetails>
              </DescriptionListItem>
            </DescriptionList>
            <DescriptionList density="comfortable" divided>
              <DescriptionListItem>
                <DescriptionTerm>Plan</DescriptionTerm>
                <DescriptionDetails>Pro</DescriptionDetails>
              </DescriptionListItem>
              <DescriptionListItem>
                <DescriptionTerm>Seats</DescriptionTerm>
                <DescriptionDetails>12 of 20</DescriptionDetails>
              </DescriptionListItem>
            </DescriptionList>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Custom term width">
        <p className="mt-4 text-pretty text-muted-foreground">
          In <code className="font-mono text-sm">row</code> layout the term column width
          is the CSS variable <code className="font-mono text-sm">--dl-term</code>{" "}
          (default <code className="font-mono text-sm">12rem</code>). Override it per
          instance via an inline style or class, no recipe surgery needed.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<DescriptionList style={{ "--dl-term": "8rem" }}>
  <DescriptionListItem>
    <DescriptionTerm>SKU</DescriptionTerm>
    <DescriptionDetails>KOALA-DS-001</DescriptionDetails>
  </DescriptionListItem>
</DescriptionList>`}
        >
          <DescriptionList
            divided
            className="mx-auto w-full max-w-md"
            style={{ "--dl-term": "8rem" } as CSSProperties}
          >
            <DescriptionListItem>
              <DescriptionTerm>SKU</DescriptionTerm>
              <DescriptionDetails>KOALA-DS-001</DescriptionDetails>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionTerm>Stock</DescriptionTerm>
              <DescriptionDetails>248 units</DescriptionDetails>
            </DescriptionListItem>
          </DescriptionList>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">DescriptionList</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root <code className="font-mono">&lt;dl&gt;</code>. Forwards all native{" "}
              <code className="font-mono">&lt;dl&gt;</code> props.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono">layout</code>: <code className="font-mono">&quot;row&quot;</code>{" "}
                (default) | <code className="font-mono">&quot;stack&quot;</code>.
              </li>
              <li>
                <code className="font-mono">divided</code>: <code className="font-mono">boolean</code>; hairline rule between rows.
              </li>
              <li>
                <code className="font-mono">density</code>: <code className="font-mono">&quot;compact&quot;</code>{" "}
                (default) | <code className="font-mono">&quot;comfortable&quot;</code>; honors{" "}
                <code className="font-mono">DensityProvider</code>.
              </li>
              <li>
                <code className="font-mono">asChild</code>: <code className="font-mono">boolean</code>; render via Radix Slot.
              </li>
              <li>
                <code className="font-mono">--dl-term</code> (CSS var): term column width in{" "}
                <code className="font-mono">row</code> layout (default <code className="font-mono">12rem</code>).
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">DescriptionListItem</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Groups one term/value pair (a <code className="font-mono">&lt;div&gt;</code>{" "}
              inside the list). Accepts <code className="font-mono">asChild</code> and all native div props.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">DescriptionTerm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The label (<code className="font-mono">&lt;dt&gt;</code>). Renders a leading
              Phosphor icon when given one. Forwards native{" "}
              <code className="font-mono">&lt;dt&gt;</code> props.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">DescriptionDetails</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The value (<code className="font-mono">&lt;dd&gt;</code>). Holds plain text
              or composed parts (Badge, Avatar, links). Forwards native{" "}
              <code className="font-mono">&lt;dd&gt;</code> props.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I reach for DescriptionList instead of a Table?",
              a: "Use DescriptionList for the fields of a single record, like a profile, invoice, or settings read-out, where each row is one term/value pair. Reach for a Table when you are comparing the same fields across many records (rows of data), since a `<dl>` models one entity, not a grid.",
            },
            {
              q: "What is the difference between layout=\"row\" and layout=\"stack\"?",
              a: "`row` (the default) puts the term in a fixed-width column with the value beside it, splitting at the `sm` breakpoint and stacking on mobile. `stack` keeps the term above the value at every width, which reads better on narrow surfaces and for long values like URLs or tokens.",
            },
            {
              q: "How do I assemble a row from the named parts?",
              a: "Wrap each pair in DescriptionListItem, then place a DescriptionTerm (the `<dt>` label) and a DescriptionDetails (the `<dd>` value) inside it. Import the parts as named exports rather than dot-notation, since `DescriptionList.Item` style statics do not survive the RSC server to client boundary.",
            },
            {
              q: "Can a value cell hold more than plain text?",
              a: "Yes. DescriptionDetails accepts composed Koala parts, so you can drop a Badge, Avatar, or link straight into the value. DescriptionTerm also renders a leading Phosphor icon when you pass one, sized to the label's cap height.",
            },
            {
              q: "How do I widen the term column?",
              a: "In `row` layout the term column width is the CSS variable `--dl-term` (default `12rem`). Override it per instance with an inline style like `style={{ \"--dl-term\": \"8rem\" }}` or a class, with no changes to the recipe needed.",
            },
            {
              q: "Does it pick up density automatically?",
              a: "The `density` prop tunes the per-row vertical padding, defaulting to `compact` for dashboards with `comfortable` as the roomier option. If you omit the prop it honors a surrounding DensityProvider, so wrapping a region resolves density for every list inside it.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
