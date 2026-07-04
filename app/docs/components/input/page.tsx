import {
  MagnifyingGlass,
  EnvelopeSimple,
  Globe,
  X,
} from "@phosphor-icons/react/ssr"

import {
  InputRoot,
  InputField,
  InputLabel,
  InputHint,
  InputPrefix,
  InputSuffix,
  InputSuffixButton,
  InputPrefixLabel,
  PasswordInput,
} from "@/components/ui/input"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { NumberInputDemo, QuantityStepperDemo, PhoneInputDemo } from "./demos"

export const metadata = {
  title: "Input",
}

export default function InputDocsPage() {
  return (
    <>
      <DocHeader
        title="Input"
        description="A compound text field with a label, optional hint, prefix icons, suffix icons, prefix labels, and interactive suffix buttons. Built with slots and Context - each part is a named export."
      />

      <ComponentPreview
        code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="search">Search</InputLabel>
  <InputRoot>
    <InputPrefix><MagnifyingGlass /></InputPrefix>
    <InputField id="search" placeholder="Search components…" />
  </InputRoot>
</div>`}
      >
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <InputLabel htmlFor="search">Search</InputLabel>
          <InputRoot>
            <InputPrefix>
              <MagnifyingGlass weight="bold" />
            </InputPrefix>
            <InputField id="search" placeholder="Search components…" />
          </InputRoot>
        </div>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="input" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  InputRoot,
  InputField,
  InputLabel,
} from "@/components/ui/input"

export function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <InputLabel htmlFor="email">Email</InputLabel>
      <InputRoot>
        <InputField id="email" placeholder="you@example.com" type="email" />
      </InputRoot>
    </div>
  )
}`}
        />
      </DocSection>

      <DocSection title="Label & hint">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>InputLabel</code> sits above the control - wire it to the field
          with <code>htmlFor</code> pointing at the <code>InputField</code>’s{" "}
          <code>id</code> so clicking the label focuses the input. Pass{" "}
          <code>required</code> to append a destructive asterisk.{" "}
          <code>InputHint</code> renders helper text below; give it an{" "}
          <code>id</code> and reference it from the field’s{" "}
          <code>aria-describedby</code>.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="workspace" required>
    Workspace name
  </InputLabel>
  <InputRoot>
    <InputField
      id="workspace"
      placeholder="acme-inc"
      aria-describedby="workspace-hint"
    />
  </InputRoot>
  <InputHint id="workspace-hint">
    Used in your team URL. Lowercase letters and dashes only.
  </InputHint>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="workspace" required>
              Workspace name
            </InputLabel>
            <InputRoot>
              <InputField
                id="workspace"
                placeholder="acme-inc"
                aria-describedby="workspace-hint"
              />
            </InputRoot>
            <InputHint id="workspace-hint">
              Used in your team URL. Lowercase letters and dashes only.
            </InputHint>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Prefix icon">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code>InputPrefix</code> to place a decorative icon on the left.
          The slot sizes any <code>svg</code> automatically and marks it{" "}
          <code>aria-hidden</code> so it stays invisible to assistive tech.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="email-prefix">Email address</InputLabel>
  <InputRoot>
    <InputPrefix><EnvelopeSimple /></InputPrefix>
    <InputField id="email-prefix" placeholder="you@example.com" type="email" />
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="email-prefix">Email address</InputLabel>
            <InputRoot>
              <InputPrefix>
                <EnvelopeSimple weight="bold" />
              </InputPrefix>
              <InputField
                id="email-prefix"
                placeholder="you@example.com"
                type="email"
              />
            </InputRoot>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Suffix icon">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code>InputSuffix</code> to place a decorative icon on the right -
          useful for status indicators or type hints.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="search-suffix">Search</InputLabel>
  <InputRoot>
    <InputField id="search-suffix" placeholder="Search…" />
    <InputSuffix><MagnifyingGlass /></InputSuffix>
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="search-suffix">Search</InputLabel>
            <InputRoot>
              <InputField id="search-suffix" placeholder="Search…" />
              <InputSuffix>
                <MagnifyingGlass weight="bold" />
              </InputSuffix>
            </InputRoot>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Prefix label">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>InputPrefixLabel</code> renders a fixed text segment flush
          against the left border - ideal for URL schemes, currency symbols, or
          units. It uses a negative margin to reach the container edge and{" "}
          <code>overflow-hidden</code> on the root clips it at the rounded
          corner.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="domain">Custom domain</InputLabel>
  <InputRoot>
    <InputPrefixLabel>https://</InputPrefixLabel>
    <InputField id="domain" placeholder="yourdomain.com" />
  </InputRoot>
</div>

<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="domain-icon">Custom domain</InputLabel>
  <InputRoot>
    <InputPrefixLabel><Globe /></InputPrefixLabel>
    <InputField id="domain-icon" placeholder="yourdomain.com" />
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="domain">Custom domain</InputLabel>
              <InputRoot>
                <InputPrefixLabel>https://</InputPrefixLabel>
                <InputField id="domain" placeholder="yourdomain.com" />
              </InputRoot>
            </div>
            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="domain-icon">Custom domain</InputLabel>
              <InputRoot>
                <InputPrefixLabel>
                  <Globe weight="bold" />
                </InputPrefixLabel>
                <InputField id="domain-icon" placeholder="yourdomain.com" />
              </InputRoot>
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Suffix button">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>InputSuffixButton</code> renders an interactive ghost button
          inside the field - e.g. a clear action. Always pass{" "}
          <code>aria-label</code> since there is no visible text.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="clearable">Project name</InputLabel>
  <InputRoot>
    <InputField id="clearable" defaultValue="clearable value" />
    <InputSuffixButton aria-label="Clear" onClick={() => {}}>
      <X className="size-4" />
    </InputSuffixButton>
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="clearable">Project name</InputLabel>
            <InputRoot>
              <InputField id="clearable" defaultValue="clearable value" />
              <InputSuffixButton aria-label="Clear">
                <X weight="bold" className="size-4" />
              </InputSuffixButton>
            </InputRoot>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Password">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>PasswordInput</code> is a convenience wrapper that manages the
          show/hide toggle internally. It renders{" "}
          <code>InputRoot</code> + <code>InputField</code> +{" "}
          <code>InputSuffixButton</code> with an Eye / EyeSlash icon from
          Phosphor. Pass <code>rootClassName</code> to style the wrapper,{" "}
          and all other props go to the underlying <code>input</code> element.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="password">Password</InputLabel>
  <PasswordInput id="password" placeholder="Enter your password" />
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="password">Password</InputLabel>
            <PasswordInput id="password" placeholder="Enter your password" />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Number">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>NumberInput</code> adds stepper controls that clamp to{" "}
          <code>min</code>/<code>max</code>, snap to <code>step</code>, and
          respond to <code>↑</code>/<code>↓</code> keys, click, and
          press-and-hold to repeat. The default <code>stacked</code> carets sit
          on the right; <code>{'layout="inline"'}</code> gives a{" "}
          <code>−</code> / <code>+</code> quantity stepper with full-height hit
          targets.
        </p>
        <ComponentPreview
          code={`// stacked (default)
<NumberInput value={value} onValueChange={setValue} min={0} max={100} />

// inline quantity stepper
<NumberInput layout="inline" value={qty} onValueChange={setQty} min={1} max={10} />`}
        >
          <NumberInputDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Quantity stepper">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code>{'layout="inline"'}</code> <code>NumberInput</code> <strong>is</strong> the{" "}
          <code>−</code> value <code>+</code> quantity stepper: compact, clamped at{" "}
          <code>min</code>, and keyboard- and hold-to-repeat friendly. It&apos;s the control behind
          a cart row&apos;s{" "}
          <a href="/docs/components/order-summary" className="underline underline-offset-4">
            <code>OrderSummaryItemQuantity</code>
          </a>{" "}
          (see Order Summary → Shopping cart). Give it a fixed <code>rootClassName</code> width so
          it stays tidy in a row.
        </p>
        <ComponentPreview
          code={`<NumberInput
  layout="inline"
  size="sm"
  value={qty}
  onValueChange={setQty}
  min={1}
  max={99}
  rootClassName="w-24"
  aria-label="Quantity"
/>`}
        >
          <QuantityStepperDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Phone">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>PhoneInput</code> pairs the field with a searchable country
          picker - circular flags, type-to-filter, full keyboard navigation, and
          a live <code>+code</code> prefix. <code>onChange</code> reports a{" "}
          <code>{"{ country, dialCode, nationalNumber, e164 }"}</code> payload;
          store <code>e164</code> as the canonical value.
        </p>
        <ComponentPreview
          code={`<PhoneInput
  defaultCountry="US"
  defaultValue="555 0142"
  onChange={(p) => console.log(p.e164)}
/>`}
        >
          <PhoneInputDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three sizes on a 4px grid - <code>sm</code> (32 px),{" "}
          <code>md</code> (36 px, the default), and <code>lg</code> (40 px).
          Set <code>size</code> on <code>InputRoot</code>; all parts pick it up
          from context.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="size-sm">Small</InputLabel>
  <InputRoot size="sm">
    <InputField id="size-sm" placeholder="Small" />
  </InputRoot>
</div>

<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="size-md">Medium (default)</InputLabel>
  <InputRoot size="md">
    <InputField id="size-md" placeholder="Medium" />
  </InputRoot>
</div>

<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="size-lg">Large</InputLabel>
  <InputRoot size="lg">
    <InputField id="size-lg" placeholder="Large" />
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="size-sm">Small</InputLabel>
              <InputRoot size="sm">
                <InputField id="size-sm" placeholder="Small" />
              </InputRoot>
            </div>
            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="size-md">Medium (default)</InputLabel>
              <InputRoot size="md">
                <InputField id="size-md" placeholder="Medium" />
              </InputRoot>
            </div>
            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="size-lg">Large</InputLabel>
              <InputRoot size="lg">
                <InputField id="size-lg" placeholder="Large" />
              </InputRoot>
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Error">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code>hasError</code> to <code>InputRoot</code> to switch the
          border and focus ring to the destructive color and set{" "}
          <code>aria-invalid</code> on the underlying <code>input</code>. Pass
          the same <code>hasError</code> to <code>InputHint</code> so the helper
          text doubles as the error message.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="email-error" required>Email</InputLabel>
  <InputRoot hasError>
    <InputField
      id="email-error"
      defaultValue="wrong@"
      type="email"
      aria-describedby="email-error-hint"
    />
  </InputRoot>
  <InputHint id="email-error-hint" hasError>
    Enter a valid email address.
  </InputHint>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="email-error" required>
              Email
            </InputLabel>
            <InputRoot hasError>
              <InputField
                id="email-error"
                defaultValue="wrong@"
                type="email"
                aria-describedby="email-error-hint"
              />
            </InputRoot>
            <InputHint id="email-error-hint" hasError>
              Enter a valid email address.
            </InputHint>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="disabled">Email</InputLabel>
  <InputRoot disabled>
    <InputField id="disabled" placeholder="Disabled" />
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="disabled">Email</InputLabel>
            <InputRoot disabled>
              <InputField id="disabled" placeholder="Disabled" />
            </InputRoot>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inline">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code>{'variant="inline"'}</code> to <code>InputRoot</code> for a
          chromeless field: the border and fill stay invisible at rest and the
          container only materializes on hover, while focus keeps the usual brand
          ring. Perfect for edit-in-place UI - editable titles, table cells, or
          settings rows that should read as plain text until you reach for them.
        </p>
        <ComponentPreview
          code={`<div className="flex flex-col gap-1.5">
  <InputLabel htmlFor="inline-title">Project title</InputLabel>
  <InputRoot variant="inline">
    <InputField id="inline-title" defaultValue="Untitled project" />
  </InputRoot>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <InputLabel htmlFor="inline-title">Project title</InputLabel>
            <InputRoot variant="inline">
              <InputField id="inline-title" defaultValue="Untitled project" />
            </InputRoot>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Why is the input split into InputRoot and InputField?", a: "`InputRoot` is the bordered container that owns the size, error, and disabled state and shares it via context, while `InputField` is the actual `<input>`. Splitting them lets `InputPrefix`, `InputSuffix`, and buttons sit inside the same border as siblings of the field." },
            { q: "Where do I set the size, and does it propagate to the parts?", a: "Set `size` on `InputRoot` (`sm`, `md`, the default, or `lg`). Every part reads it from context, so the prefix, suffix, and field all scale together." },
            { q: "When should I use InputSuffix versus InputSuffixButton?", a: "Use `InputSuffix` for a decorative, non-interactive icon (it is marked `aria-hidden`). Use `InputSuffixButton` for an interactive control like a clear action, and always pass `aria-label` since it has no visible text." },
            { q: "How do I show a validation error?", a: "Pass `hasError` to `InputRoot` to switch the border and focus ring to the destructive color and set `aria-invalid` on the input. Pass the same `hasError` to `InputHint` so the helper text reads as the error message." },
            { q: "Should I build my own password show/hide toggle?", a: "No. Use `PasswordInput`, which wraps `InputRoot` + `InputField` + `InputSuffixButton` and manages the Eye / EyeSlash toggle internally. Use `rootClassName` to style the wrapper; other props pass through to the input." },
            { q: "What value should I store from PhoneInput?", a: "Store `e164` as the canonical value. `onChange` reports a `{ country, dialCode, nationalNumber, e164 }` payload, and `e164` is the normalized form you can persist and re-parse." },
          ]}
        />
      </DocSection>

    </>
  )
}
