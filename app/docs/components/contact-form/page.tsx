import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { ContactFormDemo, LeadFormDemo, SupportFormDemo } from "./demos"

export const metadata = { title: "Contact Form" }

export default function ContactFormDocsPage() {
  return (
    <>
      <DocHeader
        title="Contact Form"
        description="A family of ready get-in-touch blocks sharing one recipe: ContactForm (general), LeadForm (sales / collaboration lead capture), and SupportForm (help-desk request). Each wires every control through Field for automatic label, aria, and error association, manages its own state, and confirms on submit. Use the card variant for a standalone block, or bare to embed inside a page shell."
      />

      <ComponentPreview
        locked
        previewClassName="flex justify-center"
        code={`<ContactForm onSubmit={(data) => send(data)} />`}
      >
        <ContactFormDemo />
      </ComponentPreview>

      <DocSection title="Lead capture">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">LeadForm</code> is the richer sales / collaboration
          block: a name and social row, a company-size Select, a country-aware{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">PhoneInput</a>, and
          a message. Drop it beside a hero to capture qualified leads.
        </p>
        <ComponentPreview
          locked
          previewClassName="flex justify-center"
          code={`<LeadForm defaultCountry="ES" onSubmit={(data) => send(data)} />`}
        >
          <LeadFormDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Support request">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SupportForm</code> is tuned for an inbound support
          queue: a name and email row, a support-topic Select, an optional order / reference field so
          an agent can pull the account up fast, and a message.
        </p>
        <ComponentPreview
          locked
          previewClassName="flex justify-center"
          code={`<SupportForm onSubmit={(data) => openTicket(data)} />`}
        >
          <SupportFormDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Installation">
        <Installation component="contact-form" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">ContactForm / LeadForm / SupportForm</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Each composes{" "}
              <a href="/docs/components/field" className="underline underline-offset-4">Field</a>,{" "}
              <a href="/docs/components/input" className="underline underline-offset-4">Input</a>,{" "}
              <a href="/docs/components/select" className="underline underline-offset-4">Select</a>, and{" "}
              <a href="/docs/components/textarea" className="underline underline-offset-4">Textarea</a>{" "}
              (LeadForm adds{" "}
              <a href="/docs/components/input" className="underline underline-offset-4">PhoneInput</a>).
              Each forwards all <code className="font-mono text-sm">&lt;div&gt;</code> props.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">onSubmit</code>: called with the block&apos;s data
                object on a valid submit ({" "}
                <code className="font-mono text-sm">{`{ name, email, subject, message }`}</code> for
                ContactForm,{" "}
                <code className="font-mono text-sm">{`{ firstName, linkedin, email, companySize, phone, message }`}</code>{" "}
                for LeadForm,{" "}
                <code className="font-mono text-sm">{`{ name, email, topic, reference, message }`}</code>{" "}
                for SupportForm). Return a promise to drive the loading spinner.
              </li>
              <li>
                <code className="font-mono text-sm">variant</code>:{" "}
                <code className="font-mono text-sm">card</code> (default, standalone bordered block) or{" "}
                <code className="font-mono text-sm">bare</code> (drops the chrome to embed in a page
                shell).
              </li>
              <li>
                <code className="font-mono text-sm">density</code>:{" "}
                <code className="font-mono text-sm">compact</code> (16px, default) or{" "}
                <code className="font-mono text-sm">comfortable</code> (24px).
              </li>
              <li>
                <code className="font-mono text-sm">title</code>,{" "}
                <code className="font-mono text-sm">description</code>,{" "}
                <code className="font-mono text-sm">action</code>: override the default copy.
              </li>
              <li>
                <code className="font-mono text-sm">defaultCountry</code> (LeadForm only): initial ISO2
                for the phone field.
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Which block should I reach for: ContactForm, LeadForm, or SupportForm?",
              a: "Use ContactForm for an open-ended `get in touch` block (name, email, a general subject, and a message). Use LeadForm to capture qualified sales or collaboration leads: it adds a LinkedIn field, a company-size Select, and a country-aware phone field. Use SupportForm for an inbound support queue: it swaps in support-focused topics and an order / reference field. All three share one recipe and the same loading to success flow, so they feel identical to drop in.",
            },
            {
              q: "How do I embed a block inside a hero or marketing slab without the doubled card chrome?",
              a: "Pass variant=\"bare\" to drop the border, surface, shadow, max-width, and padding, so the block fills whatever shell hosts it. The card variant (the default) is the standalone bordered panel and declares --surface: var(--card) so nested Inputs, Selects, and Textareas blend with it. The Contact marketing section composes LeadForm as a card floating over a photo.",
            },
            {
              q: "What shape is the data passed to onSubmit, and how do I drive the loading spinner?",
              a: "onSubmit receives the block's typed data object (ContactFormData, LeadFormData, or SupportFormData). Return a promise from your handler and the submit Button shows its loading state until that promise resolves, after which the form swaps to the success panel, which renders with role=\"status\" so it is announced to screen readers.",
            },
            {
              q: "How do I change the heading, supporting text, or submit button label?",
              a: "Pass the title, description, and action props to override the defaults. Set description to null to drop the supporting line entirely.",
            },
            {
              q: "How does the family handle density and how do nested controls blend with the card?",
              a: "The density prop accepts compact (16px, the default) or comfortable (24px), and falls back to the nearest DensityProvider when omitted. The card root declares --surface: var(--card), so the nested Input, Select, PhoneInput, and Textarea blend with the panel instead of painting their own background block.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
