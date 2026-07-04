import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  RadioGroupDemo,
  SizesDemo,
  StatesDemo,
  WithDescriptionDemo,
  CardsDemo,
  CardSizesDemo,
  ControlledDemo,
} from "./radio-group-examples-demo"

export const metadata = { title: "Radio Group" }

export default function RadioGroupDocsPage() {
  return (
    <>
      <DocHeader
        title="Radio Group"
        description="A set of mutually exclusive options where exactly one can be selected, built on Radix RadioGroup. Sizes line up pixel-for-pixel with Checkbox, so radios and checkboxes sit flush in the same form."
      />

      <ComponentPreview previewClassName="block" code={HERO_CODE}>
        <RadioGroupDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="radio-group" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Example() {
  return (
    <RadioGroup defaultValue="pro">
      <label htmlFor="pro" className="flex items-center gap-2.5">
        <RadioGroupItem id="pro" value="pro" />
        Pro
      </label>
    </RadioGroup>
  )
}`}
        />
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">sm</code> (16px) matches the dense table checkbox;{" "}
          <code className="font-mono text-sm">md</code> (20px) is the default for forms. Set{" "}
          <code className="font-mono text-sm">size</code> on the group and every item inherits it
          through context.
        </p>
        <ComponentPreview code={SIZES_CODE}>
          <SizesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="States">
        <p className="mt-4 text-pretty text-muted-foreground">
          Disable a single <code className="font-mono text-sm">RadioGroupItem</code> and roving
          focus skips it, or disable the whole <code className="font-mono text-sm">RadioGroup</code>{" "}
          at once.
        </p>
        <ComponentPreview code={STATES_CODE}>
          <StatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With descriptions">
        <p className="mt-4 text-pretty text-muted-foreground">
          Give each option a line of supporting text with{" "}
          <code className="font-mono text-sm">RadioCardDescription</code>. The whole card is the
          radio, so the entire surface is the hit target: selected, it borders brand, lifts the
          accent halo and pops its icon, exactly like the plan picker below.
        </p>
        <ComponentPreview previewClassName="block" code={WITH_DESCRIPTION_CODE}>
          <WithDescriptionDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Cards">
        <p className="mt-4 text-pretty text-muted-foreground">
          Reach for <code className="font-mono text-sm">RadioCard</code> when each option deserves an
          icon and a line of supporting text, the affordance behind a plan, theme or payment-method
          picker. The card <em>is</em> the radio, so keyboard and focus come for free; selected, it
          borders <code className="font-mono text-sm">brand</code> and lifts the accent halo while the
          flooded dot tweens in.
        </p>
        <ComponentPreview previewClassName="block" code={CARDS_CODE}>
          <CardsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Card sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">md</code> (the default, above) suits a title plus a
          line of description. Drop a <code className="font-mono text-sm">RadioCard</code> to{" "}
          <code className="font-mono text-sm">size=&quot;sm&quot;</code> when the option is a single
          line, a title on its own or an icon and text, so it doesn&apos;t float in dead space. The
          padding, control and radius all tighten together, the row centers vertically, and the
          title drops to medium; the control still lines up with the standalone radio.
        </p>
        <ComponentPreview previewClassName="block" code={CARD_SIZES_CODE}>
          <CardSizesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">value</code> and{" "}
          <code className="font-mono text-sm">onValueChange</code> to own the selection. The group
          lays out horizontally here with a <code className="font-mono text-sm">grid-flow-col</code>{" "}
          override on <code className="font-mono text-sm">className</code>.
        </p>
        <ComponentPreview code={CONTROLLED_CODE}>
          <ControlledDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use a RadioGroup instead of a Select?", a: "Use RadioGroup for a single choice from a small, visible set so every option is in view. Reach for a Select once the options grow long enough to want a dropdown." },
            { q: "How do I set the size, and why does it match Checkbox?", a: "Set `size` on the RadioGroup (`sm` is 16px, `md` is 20px) and each RadioGroupItem inherits it through context. The sizes mirror Checkbox exactly so radios and checkboxes line up pixel-for-pixel in the same form." },
            { q: "RadioGroupItem renders only a circle. How do I give it a label and a bigger hit target?", a: "Pair each item with a `<label htmlFor>` matching the item's `id`. The label supplies the accessible name and extends the clickable area, since the item itself renders only the control." },
            { q: "How do the keyboard and disabled states behave?", a: "It is built on Radix RadioGroup, so arrow keys move roving focus and select. Disable a single RadioGroupItem and roving focus skips it, or set `disabled` on the whole RadioGroup at once." },
            { q: "How do I make the whole option card highlight when selected, without JavaScript?", a: "Reach for `RadioCard` (same import): it dresses a RadioGroupItem as a full selectable card with an optional `icon`, plus `RadioCardTitle` and `RadioCardDescription`. The card itself is the radio, so the whole surface is the hit target and it borders brand and lifts the accent halo when selected, no JavaScript. See the Cards example above." },
            { q: "Is RadioGroup controlled or uncontrolled?", a: "Both. Use `defaultValue` to let it manage its own selection, or pass `value` with `onValueChange` to own the state. These props forward straight to Radix." },
          ]}
        />
      </DocSection>

    </>
  )
}

const HERO_CODE = `<RadioGroup defaultValue="Pro" className="w-56">
  {["Starter", "Pro", "Enterprise"].map((plan) => (
    <label key={plan} htmlFor={plan} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
      <RadioGroupItem id={plan} value={plan} />
      {plan}
    </label>
  ))}
</RadioGroup>`

const SIZES_CODE = `<RadioGroup size="sm" defaultValue="b">
  <RadioGroupItem value="a" />
  <RadioGroupItem value="b" />
</RadioGroup>

<RadioGroup size="md" defaultValue="b">
  <RadioGroupItem value="a" />
  <RadioGroupItem value="b" />
</RadioGroup>`

const STATES_CODE = `<RadioGroup defaultValue="on">
  <RadioGroupItem value="on" />
  <RadioGroupItem value="off" disabled />
</RadioGroup>

<RadioGroup defaultValue="x" disabled>
  <RadioGroupItem value="x" />
  <RadioGroupItem value="y" />
</RadioGroup>`

const WITH_DESCRIPTION_CODE = `import { RadioGroup, RadioCard, RadioCardTitle, RadioCardDescription } from "@/components/ui/radio-group"
import { Package, Truck, AirplaneTilt } from "@phosphor-icons/react"

const SHIPPING = [
  { value: "standard", icon: <Package />, title: "Standard", hint: "4–6 business days. Free." },
  { value: "express", icon: <Truck />, title: "Express", hint: "2–3 business days. $9." },
  { value: "overnight", icon: <AirplaneTilt />, title: "Overnight", hint: "Next business day. $24." },
]

<RadioGroup defaultValue="express" className="w-full max-w-sm gap-3">
  {SHIPPING.map(({ value, icon, title, hint }) => (
    <RadioCard key={value} value={value} icon={icon}>
      <RadioCardTitle>{title}</RadioCardTitle>
      <RadioCardDescription>{hint}</RadioCardDescription>
    </RadioCard>
  ))}
</RadioGroup>`

const CARDS_CODE = `import { RadioGroup, RadioCard, RadioCardTitle, RadioCardDescription } from "@/components/ui/radio-group"
import { Rocket, Crown, Buildings } from "@phosphor-icons/react"

const PLANS = [
  { value: "starter", icon: <Rocket />, title: "Starter", hint: "$0 / month. For side projects and prototypes." },
  { value: "pro", icon: <Crown />, title: "Pro", hint: "$59 / month. For growing teams that ship." },
  { value: "enterprise", icon: <Buildings />, title: "Enterprise", hint: "$99 / month. SSO, audit logs and support." },
]

<RadioGroup defaultValue="pro" className="w-full max-w-sm gap-3">
  {PLANS.map(({ value, icon, title, hint }) => (
    <RadioCard key={value} value={value} icon={icon}>
      <RadioCardTitle>{title}</RadioCardTitle>
      <RadioCardDescription>{hint}</RadioCardDescription>
    </RadioCard>
  ))}
</RadioGroup>`

const CARD_SIZES_CODE = `import { RadioGroup, RadioCard, RadioCardTitle } from "@/components/ui/radio-group"
import { User, Buildings, CreditCard, Wallet } from "@phosphor-icons/react"

{/* One-line options: title-only, in a two-up grid. sm centers + sets the title to medium. */}
<RadioGroup defaultValue="individual" className="grid grid-cols-2 gap-3">
  <RadioCard value="individual" size="sm" icon={<User />}>
    <RadioCardTitle>Individual</RadioCardTitle>
  </RadioCard>
  <RadioCard value="company" size="sm" icon={<Buildings />}>
    <RadioCardTitle>Company</RadioCardTitle>
  </RadioCard>
</RadioGroup>

{/* Icon + text, stacked. */}
<RadioGroup defaultValue="card" className="gap-2.5">
  <RadioCard value="card" size="sm" icon={<CreditCard />}>
    <RadioCardTitle>Credit or debit card</RadioCardTitle>
  </RadioCard>
  <RadioCard value="paypal" size="sm" icon={<Wallet />}>
    <RadioCardTitle>PayPal balance</RadioCardTitle>
  </RadioCard>
</RadioGroup>`

const CONTROLLED_CODE = `const [value, setValue] = useState("comfortable")

<RadioGroup value={value} onValueChange={setValue} className="grid-flow-col gap-5">
  {["comfortable", "compact"].map((option) => (
    <label key={option} htmlFor={\`d-\${option}\`} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium capitalize">
      <RadioGroupItem id={\`d-\${option}\`} value={option} />
      {option}
    </label>
  ))}
</RadioGroup>`
