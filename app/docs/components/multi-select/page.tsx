import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  MultiSelectCategoriesDemo,
  MultiSelectSwitchDemo,
  MultiSelectSectionsDemo,
  MultiSelectChipsDemo,
  MultiSelectDensityDemo,
} from "./demos"

export const metadata = {
  title: "Multi Select",
}

export default function MultiSelectDocsPage() {
  return (
    <>
      <DocHeader
        title="Multi Select"
        description="A select that picks many values and stays open while you toggle them. Radix Select is single-value and closes on pick, so Multi Select is built on Radix Popover instead. The panel matches Select's surface and motion, but each row is a checkbox or a switch that toggles membership in one array."
      />

      <ComponentPreview
        code={`import { Code, PenNib, Megaphone, Package, ChartLineUp } from "@phosphor-icons/react"

<MultiSelect defaultValue={["engineering", "design"]}>
  <MultiSelectTrigger className="w-64">
    <MultiSelectValue placeholder="Select categories" />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectItem value="engineering"><Code /> Engineering</MultiSelectItem>
    <MultiSelectItem value="design"><PenNib /> Design</MultiSelectItem>
    <MultiSelectItem value="marketing"><Megaphone /> Marketing</MultiSelectItem>
    <MultiSelectItem value="product"><Package /> Product</MultiSelectItem>
    <MultiSelectItem value="sales"><ChartLineUp /> Sales</MultiSelectItem>
  </MultiSelectContent>
</MultiSelect>`}
      >
        <MultiSelectCategoriesDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="multi-select" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Code, PenNib } from "@phosphor-icons/react"
import {
  MultiSelect, MultiSelectTrigger, MultiSelectValue, MultiSelectContent,
  MultiSelectItem, MultiSelectSwitchItem,
  MultiSelectGroup, MultiSelectLabel, MultiSelectSeparator,
} from "@/components/ui/multi-select"

export function Example() {
  const [value, setValue] = useState<string[]>([])
  return (
    <MultiSelect value={value} onValueChange={setValue}>
      <MultiSelectTrigger className="w-64">
        <MultiSelectValue placeholder="Select categories" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectItem value="engineering"><Code /> Engineering</MultiSelectItem>
        <MultiSelectItem value="design"><PenNib /> Design</MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  )
}`}
        />
      </DocSection>

      <DocSection title="Checkbox items">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">MultiSelectItem</code> is the default row: a leading
          checkbox, a label, and an optional icon. Clicking anywhere on the row toggles it, and the
          menu stays open so you can pick several. Each value is added to or removed from the
          selection array passed to{" "}
          <code className="font-mono text-sm">onValueChange</code>. Set{" "}
          <code className="font-mono text-sm">disabled</code> on a row to lock it.
        </p>
        <ComponentPreview
          code={`import { Eye, PencilSimple, UploadSimple, UsersThree, CreditCard } from "@phosphor-icons/react"

<MultiSelect defaultValue={["read"]}>
  <MultiSelectTrigger className="w-64">
    <MultiSelectValue placeholder="Select permissions" />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectLabel>Content</MultiSelectLabel>
      <MultiSelectItem value="read"><Eye /> Read</MultiSelectItem>
      <MultiSelectItem value="write"><PencilSimple /> Write</MultiSelectItem>
      <MultiSelectItem value="publish"><UploadSimple /> Publish</MultiSelectItem>
    </MultiSelectGroup>
    <MultiSelectSeparator />
    <MultiSelectGroup>
      <MultiSelectLabel>Admin</MultiSelectLabel>
      <MultiSelectItem value="users"><UsersThree /> Manage users</MultiSelectItem>
      <MultiSelectItem value="billing" disabled><CreditCard /> Billing (owner only)</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>`}
        >
          <MultiSelectSectionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Switch items">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">MultiSelectSwitchItem</code> swaps the checkbox for the
          DS <a href="/docs/components/switch" className="underline underline-offset-4">Switch</a>,
          giving the menu a settings-panel feel for on/off rows like notification channels. It shares
          the same selection state as <code className="font-mono text-sm">MultiSelectItem</code>, so
          the two can be mixed.
        </p>
        <ComponentPreview
          code={`import { EnvelopeSimple, DeviceMobile, ChatCircle, Desktop } from "@phosphor-icons/react"
import { AnimatedNumber } from "@/components/ui/animated-number"

<MultiSelect defaultValue={["email", "push"]}>
  <MultiSelectTrigger className="w-64">
    <MultiSelectValue
      placeholder="Notification channels"
      renderValue={(value) => (
        <>
          <AnimatedNumber value={value.length} /> channels on
        </>
      )}
    />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectSwitchItem value="email"><EnvelopeSimple /> Email</MultiSelectSwitchItem>
    <MultiSelectSwitchItem value="push"><DeviceMobile /> Push</MultiSelectSwitchItem>
    <MultiSelectSwitchItem value="sms"><ChatCircle /> SMS</MultiSelectSwitchItem>
    <MultiSelectSwitchItem value="desktop"><Desktop /> Desktop</MultiSelectSwitchItem>
  </MultiSelectContent>
</MultiSelect>`}
        >
          <MultiSelectSwitchDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Rendering the value">
        <p className="mt-4 text-pretty text-muted-foreground">
          By default <code className="font-mono text-sm">MultiSelectValue</code> shows a count
          (&ldquo;3 selected&rdquo;), robust because the trigger has no access to the row labels
          while the panel is closed. The number rolls as you toggle rows (&ldquo;3 selected&rdquo; →
          &ldquo;4 selected&rdquo;) via{" "}
          <a href="/docs/components/animated-number" className="underline underline-offset-4">
            AnimatedNumber
          </a>
          , so the change registers instead of hard-swapping. Pass{" "}
          <code className="font-mono text-sm">renderValue</code> to draw the selection yourself, e.g.
          as <a href="/docs/components/badge" className="underline underline-offset-4">Badge</a> chips
          mapped from your own data. The chips carry that same on-change polish: each one zoom + fades
          in when selected and out when removed, so the row never hard-swaps.
        </p>
        <ComponentPreview
          code={`const CATEGORY_LABELS = {
  engineering: "Engineering", design: "Design",
  marketing: "Marketing", product: "Product",
}

const [value, setValue] = useState(["engineering", "product"])
// Keep a chip mounted through its exit so a deselected one can animate out,
// not just vanish. A chip is "leaving" once it's no longer in \`value\`.
const [display, setDisplay] = useState(value)

function handleChange(next) {
  setValue(next)
  setDisplay((prev) =>
    next.length === 0 ? [] : [...prev, ...next.filter((v) => !prev.includes(v))],
  )
}

<MultiSelect value={value} onValueChange={handleChange}>
  <MultiSelectTrigger className="w-72">
    <MultiSelectValue
      placeholder="Select categories"
      renderValue={() => (
        <span className="flex gap-1 overflow-hidden">
          {display.map((v) => {
            const leaving = !value.includes(v)
            return (
              <Badge
                key={v}
                variant="secondary"
                size="sm"
                pill
                className={cn(
                  "duration-fast ease-out",
                  leaving
                    // fill-mode-forwards holds opacity-0 after the exit finishes, so the chip
                    // never flashes back to full for a frame before it unmounts.
                    ? "animate-out fade-out-0 zoom-out-95 fill-mode-forwards"
                    : "animate-in fade-in-0 zoom-in-95",
                )}
                onAnimationEnd={() => {
                  if (leaving) setDisplay((d) => d.filter((x) => x !== v))
                }}
              >
                {CATEGORY_LABELS[v] ?? v}
              </Badge>
            )
          })}
        </span>
      )}
    />
  </MultiSelectTrigger>
  <MultiSelectContent>{/* ...items */}</MultiSelectContent>
</MultiSelect>`}
        >
          <MultiSelectChipsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sections">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap related rows in <code className="font-mono text-sm">MultiSelectGroup</code> with a{" "}
          <code className="font-mono text-sm">MultiSelectLabel</code> heading, and split sections
          with <code className="font-mono text-sm">MultiSelectSeparator</code>: the same grouping
          model as <a href="/docs/components/select" className="underline underline-offset-4">Select</a>.
          See the checkbox example above for a two-section menu.
        </p>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Trigger height comes from <code className="font-mono text-sm">size</code> on{" "}
          <code className="font-mono text-sm">MultiSelect</code> (sm/md/lg = 32/36/40px, the same
          scale as Button, Input, and Select). <code className="font-mono text-sm">density</code>{" "}
          no longer sets the height; it picks the default size when you do not pass one (compact →{" "}
          <code className="font-mono text-sm">sm</code>, comfortable →{" "}
          <code className="font-mono text-sm">md</code>) and tightens the menu rows - flowing to
          every part through context, or from a parent{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview
          code={`import { Circle } from "@phosphor-icons/react"

<MultiSelect defaultValue={["a"]} density="compact">
  <MultiSelectTrigger className="w-44">
    <MultiSelectValue placeholder="Compact" />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectItem value="a"><Circle /> Option A</MultiSelectItem>
    <MultiSelectItem value="b"><Circle /> Option B</MultiSelectItem>
  </MultiSelectContent>
</MultiSelect>`}
        >
          <MultiSelectDensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Why is this built on Radix Popover instead of Radix Select?", a: "Radix Select is strictly single-value and closes on pick, so it cannot host checkbox rows or stay open while you toggle. MultiSelect uses Radix Popover styled to match `SelectContent`, and each row toggles membership in one `string[]` instead of committing a single value." },
            { q: "How do I read and control the selection?", a: "The value is a `string[]`. Use `value` + `onValueChange` for controlled state, or `defaultValue` for uncontrolled. `onValueChange` fires with the full next array every time a row is toggled." },
            { q: "What is the difference between MultiSelectItem and MultiSelectSwitchItem?", a: "`MultiSelectItem` renders a leading-label row with a checkbox indicator; `MultiSelectSwitchItem` swaps in the DS Switch for a settings-panel feel. They share the same selection state, so you can mix both in one menu." },
            { q: "Why does the trigger show a count instead of the chosen labels?", a: "`MultiSelectValue` defaults to a count like 3 selected because the trigger has no access to the row labels while the panel is closed. Pass `renderValue={(values) => …}` to draw the selection yourself, for example as Badge chips mapped from your own data." },
            { q: "How do I group and label options?", a: "Wrap related rows in `MultiSelectGroup` with a `MultiSelectLabel` heading, and split sections with `MultiSelectSeparator`, the same grouping model as Select." },
            { q: "What keyboard support do the rows have?", a: "The panel has roving focus: Arrow keys, Home, and End move between option rows, and Enter or Space toggles the focused row. Disabled rows are skipped in the rotation." },
          ]}
        />
      </DocSection>
    </>
  )
}
