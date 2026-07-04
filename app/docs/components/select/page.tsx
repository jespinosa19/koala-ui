import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  SelectDishDemo,
  SelectScrollDemo,
  SelectCountryDemo,
  SelectTimezoneDemo,
  SelectPlanDemo,
  SelectReasoningDemo,
  SelectDensityDemo,
} from "./demos"

export const metadata = {
  title: "Select",
}

export default function SelectDocsPage() {
  return (
    <>
      <DocHeader
        title="Select"
        description="A dropdown for picking one value from a list. Built on Radix Select for keyboard navigation, type-ahead, and a11y; styled with a tv slots recipe and animated with interruptible enter/exit."
      />

      <ComponentPreview
        code={`import { Pizza, Hamburger, Fish, Egg, Coffee } from "@phosphor-icons/react"

<Select>
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Select a dish" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="coffee">
      <span className="flex items-center gap-2"><Coffee /> Coffee</span>
    </SelectItem>
    <SelectItem value="egg">
      <span className="flex items-center gap-2"><Egg /> Eggs benedict</span>
    </SelectItem>
    <SelectItem value="fish">
      <span className="flex items-center gap-2"><Fish /> Grilled fish</span>
    </SelectItem>
    <SelectItem value="burger">
      <span className="flex items-center gap-2"><Hamburger /> Hamburger</span>
    </SelectItem>
    <SelectItem value="pizza">
      <span className="flex items-center gap-2"><Pizza /> Pizza</span>
    </SelectItem>
  </SelectContent>
</Select>`}
      >
        <SelectDishDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="select" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Pizza, Hamburger } from "@phosphor-icons/react"
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectItem, SelectGroup, SelectLabel, SelectSeparator,
} from "@/components/ui/select"

export function Example() {
  return (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a dish" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pizza">
          <span className="flex items-center gap-2"><Pizza /> Pizza</span>
        </SelectItem>
        <SelectItem value="burger">
          <span className="flex items-center gap-2"><Hamburger /> Hamburger</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}`}
        />
      </DocSection>

      <DocSection title="Groups and labels">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code className="font-mono text-sm">SelectGroup</code> and{" "}
          <code className="font-mono text-sm">SelectLabel</code> to group related options. Add{" "}
          <code className="font-mono text-sm">SelectSeparator</code> between groups for visual
          clarity.
        </p>
        <ComponentPreview
          code={`import { Clock } from "@phosphor-icons/react"

<Select>
  <SelectTrigger className="w-64">
    <SelectValue placeholder="Select a timezone" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="cet">
        <span className="flex items-center gap-2"><Clock /> Central European Time (CET)</span>
      </SelectItem>
      <SelectItem value="gmt">
        <span className="flex items-center gap-2"><Clock /> Greenwich Mean Time (GMT)</span>
      </SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>North America</SelectLabel>
      <SelectItem value="cst">
        <span className="flex items-center gap-2"><Clock /> Central Standard Time (CST)</span>
      </SelectItem>
      <SelectItem value="est">
        <span className="flex items-center gap-2"><Clock /> Eastern Standard Time (EST)</span>
      </SelectItem>
      <SelectItem value="pst">
        <span className="flex items-center gap-2"><Clock /> Pacific Standard Time (PST)</span>
      </SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
        >
          <SelectTimezoneDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Long lists">
        <p className="mt-4 text-pretty text-muted-foreground">
          When the options outgrow the available height the menu scrolls, and its top and bottom
          edges fade softly into the popover, the{" "}
          <a href="/docs/foundations/scroll-fade" className="underline underline-offset-4">
            scroll fade
          </a>{" "}
          utility, so there&rsquo;s a clear &ldquo;more above / below&rdquo; cue without a
          scrollbar. Open this and scroll: the leading edge stays crisp, the trailing edge
          dissolves, and a keyboard-focused row always lands clear of the fade.
        </p>
        <ComponentPreview
          code={`import { MapPin } from "@phosphor-icons/react"

const cities = ["Amsterdam", "Bangkok", "Berlin" /* … */]

<Select>
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Select a city" />
  </SelectTrigger>
  <SelectContent>
    {cities.map((city) => (
      <SelectItem key={city} value={city}>
        <span className="flex items-center gap-2"><MapPin /> {city}</span>
      </SelectItem>
    ))}
  </SelectContent>
</Select>`}
        >
          <SelectScrollDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Country select">
        <p className="mt-4 text-pretty text-muted-foreground">
          A plain <code className="font-mono text-sm">Select</code> over ~250 countries is a long
          scroll, so reach for <code className="font-mono text-sm">CountrySelect</code>, a
          searchable picker that looks like a Select trigger but filters as you type and is fully
          keyboard-navigable. It returns the selected ISO 3166-1 alpha-2 code and lives in the{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a>{" "}
          family, sharing the canonical country dataset and circular flags with{" "}
          <code className="font-mono text-sm">PhoneInput</code>. Inside a{" "}
          <a href="/docs/components/field" className="underline underline-offset-4">Field</a> it
          wires up label, aria, and error state automatically.
        </p>
        <ComponentPreview
          code={`import { CountrySelect } from "@/components/ui/input"

const [country, setCountry] = useState("US")

<CountrySelect
  value={country}
  onValueChange={setCountry}
  className="w-56"
/>`}
        >
          <SelectCountryDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled items">
        <ComponentPreview
          code={`import { Gift, Lightning, Buildings } from "@phosphor-icons/react"

<Select>
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Select a plan" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="enterprise" disabled>
      <span className="flex items-center gap-2"><Buildings /> Enterprise (contact us)</span>
    </SelectItem>
    <SelectItem value="free">
      <span className="flex items-center gap-2"><Gift /> Free</span>
    </SelectItem>
    <SelectItem value="pro">
      <span className="flex items-center gap-2"><Lightning /> Pro</span>
    </SelectItem>
  </SelectContent>
</Select>`}
        >
          <SelectPlanDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Option hints">
        <p className="mt-4 text-pretty text-muted-foreground">
          Some labels are too terse to stand on their own. <code className="font-mono text-sm">High</code>{" "}
          and <code className="font-mono text-sm">Medium</code> say nothing about the trade-off
          behind them. Pass a <code className="font-mono text-sm">tooltip</code> to{" "}
          <code className="font-mono text-sm">SelectItem</code> to attach a hint that surfaces on
          hover and on keyboard focus, so the choice is informed without crowding the row. Use{" "}
          <code className="font-mono text-sm">tooltipPlacement</code> to change the side it grows
          toward (defaults to <code className="font-mono text-sm">right</code>).
        </p>
        <ComponentPreview
          code={`import { Gauge, Lightning, Brain } from "@phosphor-icons/react"

<Select defaultValue="low">
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Reasoning effort" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="minimal" tooltip="Fastest, shallowest pass. Good for simple, well-scoped tasks.">
      <span className="flex items-center gap-2"><Gauge /> Minimal</span>
    </SelectItem>
    <SelectItem value="low" tooltip="Optimizes for latency over depth.">
      <span className="flex items-center gap-2"><Lightning /> Low</span>
    </SelectItem>
    <SelectItem value="medium" tooltip="Balances response speed against how hard the model thinks.">
      <span className="flex items-center gap-2"><Gauge /> Medium</span>
    </SelectItem>
    <SelectItem value="high" tooltip="Deepest reasoning. Slower and more expensive, best for hard problems.">
      <span className="flex items-center gap-2"><Brain /> High</span>
    </SelectItem>
  </SelectContent>
</Select>`}
        >
          <SelectReasoningDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          The trigger height comes from{" "}
          <code className="font-mono text-sm">size</code> on{" "}
          <code className="font-mono text-sm">SelectTrigger</code> -{" "}
          <code className="font-mono text-sm">sm</code>/<code className="font-mono text-sm">md</code>/<code className="font-mono text-sm">lg</code>{" "}
          map to 32/36/40px, the same scale as Button and Input, so a Select lines up with them
          at a shared size. <code className="font-mono text-sm">density</code> no longer sets the
          trigger height; it picks the <em>default</em> size when you do not pass one (compact →{" "}
          <code className="font-mono text-sm">sm</code>, comfortable →{" "}
          <code className="font-mono text-sm">md</code>) and tightens the dropdown menu rows.
          Pass <code className="font-mono text-sm">density</code> to{" "}
          <code className="font-mono text-sm">SelectContent</code> (or a parent{" "}
          <code className="font-mono text-sm">DensityProvider</code>) for the menu spacing.
        </p>
        <ComponentPreview
          code={`import { Circle } from "@phosphor-icons/react"

<Select>
  <SelectTrigger className="w-48" density="compact">
    <SelectValue placeholder="Compact" />
  </SelectTrigger>
  <SelectContent density="compact">
    <SelectItem value="a">
      <span className="flex items-center gap-2"><Circle /> Option A</span>
    </SelectItem>
    <SelectItem value="b">
      <span className="flex items-center gap-2"><Circle /> Option B</span>
    </SelectItem>
  </SelectContent>
</Select>`}
        >
          <SelectDensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Selecting multiple values">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Select</code> picks exactly one value and closes on
          pick. For checkboxes, switches, and sections that stay open while you toggle several
          values, reach for{" "}
          <a href="/docs/components/multi-select" className="underline underline-offset-4">
            Multi Select
          </a>{" "}
          - a Popover-backed sibling with the same surface and motion.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use Select versus MultiSelect or CountrySelect?", a: "Use `Select` to pick exactly one value from a short list; it closes on pick. For toggling several values with checkboxes or switches that stay open, reach for `MultiSelect`, and for the ~250-country case use the searchable `CountrySelect` from the Input family." },
            { q: "How do I compose the parts?", a: "Wrap everything in `Select`, put `SelectValue` (with a `placeholder`) inside a `SelectTrigger`, and list `SelectItem`s inside `SelectContent`. Organize long lists with `SelectGroup` plus `SelectLabel`, and divide groups with `SelectSeparator`." },
            { q: "How do I attach a hint to a terse option?", a: "Pass a `tooltip` string to `SelectItem` to surface a hint on hover and on keyboard focus, useful for labels like High or Medium that say nothing about the trade-off. Use `tooltipPlacement` to change the side it grows toward (defaults to `right`)." },
            { q: "How do I size the trigger, and where does density go?", a: "Trigger height comes from `size` on `SelectTrigger` (sm/md/lg = 32/36/40px, the same scale as Button and Input). `density` no longer sets the height - it picks the default size when you don't pass one (compact -> sm, comfortable -> md) and tightens the dropdown rows; pass it to `SelectContent` (or a parent `DensityProvider`) for the menu spacing. An explicit `size` always wins." },
            { q: "Is keyboard navigation and type-ahead handled for me?", a: "Yes. Select is built on Radix Select, so arrow-key navigation, type-ahead search, and ARIA come for free. Mark an option `disabled` to skip it in that navigation." },
            { q: "How do I add an icon to each option?", a: "Koala's convention is a leading Phosphor icon per option: wrap the icon and label in a `<span className=\"flex items-center gap-2\">` inside the `SelectItem`. Render icons in outline weight to match the rest of the system." },
          ]}
        />
      </DocSection>

    </>
  )
}
