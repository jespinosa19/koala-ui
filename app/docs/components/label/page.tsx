import { Label, Hint } from "@/components/ui/label"
import { InputRoot, InputField } from "@/components/ui/input"
import { Field, FieldLabel, FieldHint } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Label",
}

export default function LabelDocsPage() {
  return (
    <>
      <DocHeader
        title="Label"
        description="The one label + helper-text recipe behind every form control in Koala. Input, Field, and OTP Input all compose Label and Hint, so a field reads identically everywhere, and inside a Field they auto-wire their own ids, htmlFor, and aria-describedby."
      />

      <ComponentPreview
        code={`<div className="flex w-full max-w-sm flex-col gap-1.5">
  <Label htmlFor="email" required>Email</Label>
  <InputRoot>
    <InputField id="email" type="email" placeholder="you@company.com" />
  </InputRoot>
  <Hint>We'll only use this to send receipts.</Hint>
</div>`}
      >
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <Label htmlFor="email" required>
            Email
          </Label>
          <InputRoot>
            <InputField id="email" type="email" placeholder="you@company.com" />
          </InputRoot>
          <Hint>We&apos;ll only use this to send receipts.</Hint>
        </div>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="label" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Label, Hint } from "@/components/ui/label"

export function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="name">Name</Label>
      <input id="name" />
      <Hint>As it appears on your ID.</Hint>
    </div>
  )
}`}
        />
      </DocSection>

      <DocSection title="Required">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">required</code> to append a destructive
          asterisk. It carries a visually-hidden <code className="font-mono text-sm">(required)</code>{" "}
          so screen readers announce it. The glyph itself is{" "}
          <code className="font-mono text-sm">aria-hidden</code>.
        </p>
        <ComponentPreview
          code={`<div className="flex w-full max-w-sm flex-col gap-4">
  <div className="flex flex-col gap-1.5">
    <Label>Workspace name</Label>
    <Skeleton animation="none" className="h-9 w-full" />
  </div>
  <div className="flex flex-col gap-1.5">
    <Label required>Workspace name</Label>
    <Skeleton animation="none" className="h-9 w-full" />
  </div>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Workspace name</Label>
              <Skeleton animation="none" className="h-9 w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label required>Workspace name</Label>
              <Skeleton animation="none" className="h-9 w-full" />
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Hint & error">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Hint</code> is the helper text below a control.
          The same element doubles as the error message: set{" "}
          <code className="font-mono text-sm">hasError</code> and it switches to the destructive
          tone (the color transitions, so it fades in rather than snaps).
        </p>
        <ComponentPreview
          code={`<div className="flex w-full max-w-sm flex-col gap-4">
  <div className="flex flex-col gap-1.5">
    <Skeleton animation="none" className="h-9 w-full" />
    <Hint>Use 8 or more characters.</Hint>
  </div>
  <div className="flex flex-col gap-1.5">
    <Skeleton animation="none" className="h-9 w-full" />
    <Hint hasError>Password is too short.</Hint>
  </div>
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton animation="none" className="h-9 w-full" />
              <Hint>Use 8 or more characters.</Hint>
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton animation="none" className="h-9 w-full" />
              <Hint hasError>Password is too short.</Hint>
            </div>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">disabled</code> dims the label to match a
          disabled control. Inside a <code className="font-mono text-sm">Field</code> it&apos;s
          inferred from <code className="font-mono text-sm">{`<Field disabled>`}</code>.
        </p>
        <ComponentPreview
          code={`<div className="flex w-full max-w-sm flex-col gap-1.5">
  <Label disabled>Billing email</Label>
  <Skeleton animation="none" className="h-9 w-full opacity-50" />
</div>`}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label disabled>Billing email</Label>
            <Skeleton animation="none" className="h-9 w-full opacity-50" />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inside a Field">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrapped in a <code className="font-mono text-sm">Field</code>, the label and hint need
          no ids: the label adopts the control&apos;s{" "}
          <code className="font-mono text-sm">htmlFor</code> and{" "}
          <code className="font-mono text-sm">required</code>, and the hint registers itself so
          the control points <code className="font-mono text-sm">aria-describedby</code> at it.{" "}
          <code className="font-mono text-sm">FieldLabel</code> /{" "}
          <code className="font-mono text-sm">FieldHint</code> are these same two primitives,
          re-exported.
        </p>
        <ComponentPreview
          code={`<Field required className="max-w-sm">
  <FieldLabel>Email</FieldLabel>
  <InputRoot>
    <InputField type="email" placeholder="you@company.com" />
  </InputRoot>
  <FieldHint>We'll send a confirmation here.</FieldHint>
</Field>`}
        >
          <Field required className="max-w-sm">
            <FieldLabel>Email</FieldLabel>
            <InputRoot>
              <InputField type="email" placeholder="you@company.com" />
            </InputRoot>
            <FieldHint>We&apos;ll send a confirmation here.</FieldHint>
          </Field>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "What is the difference between Label and Hint?", a: "`Label` is the form label above a control; `Hint` is the helper text below it. They are the single recipe behind every Koala form control, so a field reads identically everywhere." },
            { q: "How do I wire a standalone Label to its input?", a: "Pass `htmlFor` on the `Label` pointing at the control's `id` so clicking the label focuses it. Inside a `Field` you can skip this: the label adopts the field's `id` from context automatically." },
            { q: "How do I show a required field?", a: "Set `required` on `Label` to append a destructive asterisk. The glyph is `aria-hidden`, and a visually hidden `(required)` is added so screen readers still announce it." },
            { q: "How do I turn a Hint into an error message?", a: "Set `hasError` on `Hint` and it switches to the destructive tone. The color transitions, so the error fades in rather than snapping, and the same element doubles as both helper and error text." },
            { q: "What do I gain by wrapping Label and Hint in a Field?", a: "Inside a `Field` they auto-wire: the label adopts the control's `htmlFor` and `required`, and the hint registers itself so the control points `aria-describedby` at it, with no manual ids. `FieldLabel` and `FieldHint` are these same two primitives re-exported." },
            { q: "How do I dim a label for a disabled control?", a: "Pass `disabled` to `Label`, or set `disabled` on the surrounding `Field` and the label infers it from context. The opacity transitions so it dims smoothly." },
          ]}
        />
      </DocSection>

    </>
  )
}
