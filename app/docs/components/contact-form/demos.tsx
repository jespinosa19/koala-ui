"use client"

import { ContactForm, LeadForm, SupportForm } from "@/components/ui/contact-form"

/** General "get in touch": name + email row, subject Select, message with live count. */
export function ContactFormDemo() {
  return <ContactForm />
}

/** Sales / collaboration lead capture: name + social row, company-size Select, phone, message. */
export function LeadFormDemo() {
  return <LeadForm defaultCountry="ES" />
}

/** Help-desk request: name + email row, support-topic Select, order / reference field, message. */
export function SupportFormDemo() {
  return <SupportForm />
}

/** All three blocks side by side so the docs page paints every variant without interaction. */
export function ContactFormVariantsDemo() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <ContactFormDemo />
      <LeadFormDemo />
      <SupportFormDemo />
    </div>
  )
}
