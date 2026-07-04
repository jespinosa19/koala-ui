import { OTPInput } from "@/components/ui/otp-input"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "OTP Input",
}

export default function OTPInputDocsPage() {
  return (
    <>
      <DocHeader
        title="OTP Input"
        description="A numeric one-time-passcode field. Auto-advances on entry, distributes pasted codes across slots, and supports SMS autofill on mobile. Configure the digit count, size, and error state with plain props."
      />

      <ComponentPreview
        code={`<OTPInput
  length={6}
  placeholder="0"
  label="Verification code"
  hint="Enter the 6-digit code we sent to your phone."
/>`}
      >
        <OTPInput
          length={6}
          placeholder="0"
          label="Verification code"
          hint="Enter the 6-digit code we sent to your phone."
        />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="otp-input" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { OTPInput } from "@/components/ui/otp-input"

export function Example() {
  return (
    <OTPInput
      length={6}
      onComplete={(code) => verify(code)}
    />
  )
}`}
        />
      </DocSection>

      <DocSection title="Length">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>length</code> sets the number of digit slots, defaulting to{" "}
          <code>6</code>. Four-digit PINs and longer codes use the same
          component; paste a full code into any slot and it spreads across the
          rest.
        </p>
        <ComponentPreview
          code={`<OTPInput length={4} placeholder="0" />

<OTPInput length={6} placeholder="0" />`}
        >
          <div className="flex w-full flex-col items-center gap-5">
            <OTPInput length={4} label="4 digits" placeholder="0" />
            <OTPInput length={6} label="6 digits" placeholder="0" />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Label & hint">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code>label</code> to caption the field and <code>hint</code> for
          helper text below it. The label wires up as the group&rsquo;s{" "}
          <code>aria-labelledby</code> (clicking it focuses the first slot) and
          the hint as its <code>aria-describedby</code>. Add <code>required</code>{" "}
          for a destructive asterisk.
        </p>
        <ComponentPreview
          code={`<OTPInput
  length={6}
  required
  label="Verification code"
  hint="Check your authenticator app."
  placeholder="0"
/>`}
        >
          <OTPInput
            length={6}
            required
            label="Verification code"
            hint="Check your authenticator app."
            placeholder="0"
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three sizes: <code>sm</code> (40 px slots), <code>md</code> (48 px,
          the default), and <code>lg</code> (56 px). Each stays at or above the
          40 px minimum touch target.
        </p>
        <ComponentPreview
          code={`<OTPInput size="sm" length={4} label="Small" placeholder="0" />

<OTPInput size="md" length={4} label="Medium" placeholder="0" />

<OTPInput size="lg" length={4} label="Large" placeholder="0" />`}
        >
          <div className="flex w-full flex-col items-center gap-5">
            <OTPInput size="sm" length={4} label="Small" placeholder="0" />
            <OTPInput size="md" length={4} label="Medium" placeholder="0" />
            <OTPInput size="lg" length={4} label="Large" placeholder="0" />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Separators">
        <p className="mt-4 text-pretty text-muted-foreground">
          Split the slots into groups with <code>separator</code>:{" "}
          <code>&quot;dash&quot;</code> draws a short divider line,{" "}
          <code>&quot;dot&quot;</code> renders a centered <code>·</code>, or pass
          any node for a custom mark. Groups default to two even halves; override
          with <code>groupSize</code>.
        </p>
        <ComponentPreview
          code={`<OTPInput length={6} separator="dash" placeholder="0" />

<OTPInput length={6} separator="dot" placeholder="0" />

<OTPInput length={6} separator="dash" groupSize={2} placeholder="0" />`}
        >
          <div className="flex w-full flex-col items-center gap-5">
            <OTPInput length={6} separator="dash" label="Dash" placeholder="0" />
            <OTPInput length={6} separator="dot" label="Dot" placeholder="0" />
            <OTPInput
              length={6}
              separator="dash"
              groupSize={2}
              label="Groups of 2"
              placeholder="0"
            />
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Validation & errors">
        <p className="mt-4 text-pretty text-muted-foreground">
          Input is numeric-only by construction: non-digit characters (and
          non-numeric pasted content) are stripped before they ever reach a
          slot, so you never validate the format yourself. For a{" "}
          <em>wrong code</em>, pass <code>hasError</code> to switch every slot to
          the destructive border and ring and set <code>aria-invalid</code>;
          pair it with a message below the field. Use <code>onComplete</code> to
          run verification the moment the last slot fills, and{" "}
          <code>onChange</code> for keystroke-level state. When{" "}
          <code>hasError</code> is set, the <code>hint</code> turns destructive
          so it doubles as the error message.
        </p>
        <ComponentPreview
          code={`<OTPInput
  length={6}
  hasError
  defaultValue="123456"
  label="Verification code"
  hint="That code didn't match. Try again."
/>`}
        >
          <OTPInput
            length={6}
            hasError
            defaultValue="123456"
            label="Verification code"
            hint="That code didn’t match. Try again."
          />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview code={`<OTPInput length={6} disabled defaultValue="12" />`}>
          <OTPInput length={6} disabled defaultValue="12" />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "What is the difference between onChange and onComplete?", a: "`onChange` fires on every keystroke with the current value, so use it for keystroke-level state. `onComplete` fires once the moment the last slot fills, which is the right place to kick off verification." },
            { q: "Do I need to validate or filter the input myself?", a: "No. The field is numeric-only by construction: non-digit characters and non-numeric pasted content are stripped before they ever reach a slot, so you never validate the format yourself." },
            { q: "How do I show a wrong-code error?", a: "Pass `hasError` to switch every slot to the destructive border and ring and set `aria-invalid`. When set, the `hint` text also turns destructive, so it doubles as the error message." },
            { q: "How do I split the digits into groups?", a: "Use `separator`: \"dash\" draws a short divider line, \"dot\" renders a centered middle dot, or pass any node for a custom mark. Groups default to two even halves; override the chunk size with `groupSize`." },
            { q: "Does paste and SMS autofill work across the slots?", a: "Yes. Pasting a full code into any slot spreads it across the rest, and on mobile the first slot carries `autoComplete=\"one-time-code\"` so the OS can autofill a code from SMS." },
            { q: "How are the label and hint wired for accessibility?", a: "The `label` becomes the group's `aria-labelledby` (clicking it focuses the first slot) and the `hint` becomes its `aria-describedby`. Add `required` for a destructive asterisk." },
          ]}
        />
      </DocSection>

    </>
  )
}
