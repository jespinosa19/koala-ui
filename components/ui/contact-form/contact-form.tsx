"use client"

import * as React from "react"
import {
  Bank,
  Bug,
  Buildings,
  ChatCircleDots,
  CheckCircle,
  CreditCard,
  Handshake,
  Lifebuoy,
  LinkedinLogo,
  Package,
  Star,
  Tag,
  User,
  UserCircle,
  UsersFour,
  UsersThree,
  Question,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldHint, FieldRow } from "@/components/ui/field"
import { InputRoot, InputField, InputPrefix, PhoneInput } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  TextareaRoot,
  TextareaField,
  TextareaFooter,
  TextareaCount,
} from "@/components/ui/textarea"
import { DensityProvider, useDensity, type Density } from "@/lib/density"
import { tv } from "@/lib/tv"

/**
 * ContactForm family: three ready "get in touch" blocks sharing one recipe. `ContactForm` is the
 * general contact block (name + email row, a categorized subject Select, and a message Textarea with
 * a live count); `LeadForm` is the sales / collaboration lead-capture block (name + social row, a
 * company-size Select, a country-aware PhoneInput, and a message); `SupportForm` is the help-desk
 * request (name + email row, a support-topic Select, an order / reference field, and a message).
 * Each is self-contained: it owns its field state and submit flow, all wired through Field for
 * automatic label / aria / error association, so it works on drop-in. Wire `onSubmit` to your
 * endpoint. See docs/ARCHITECTURE.md §2.
 *
 * The `card` variant's root declares `--surface: var(--card)` so nested Inputs / Select / Textarea
 * blend with the panel (the --surface contract). The `bare` variant drops the card chrome (border,
 * surface, shadow, max-width, padding) so the same block can be dropped into a page shell that owns
 * its own surface (a split hero, a marketing slab), the way the Contact marketing section composes
 * `LeadForm`.
 */
export const contactFormVariants = tv({
  slots: {
    // Neutral base: the surface treatment (card chrome vs. bare) lives in the `variant` axis, and
    // padding rides the variant×density compounds, so `bare` fills its host edge-to-edge.
    root: "flex w-full flex-col",
    header: "flex flex-col gap-1.5",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    form: "flex flex-col gap-4",
    success:
      "flex flex-col items-center gap-3 text-center animate-in fade-in-0 zoom-in-95 duration-base ease-out",
    successIcon: "text-success",
    successTitle: "text-base font-semibold text-foreground",
    successText: "text-sm text-pretty text-muted-foreground",
  },
  variants: {
    // `card` is the standalone bordered block (the default); `bare` strips the chrome (no border,
    // surface, shadow, max-width, or padding) to embed inside a page shell that owns its surface.
    // With `slots`, each variant value maps slot→classes (an object), not a bare string.
    variant: {
      card: {
        root: "max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-xs [--surface:var(--card)]",
      },
      bare: {},
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): outer gap, title size, and
    // success padding here; the card padding rides the variant×density compounds below. `compact` is
    // the Koala default (16px); `comfortable` is 24px.
    density: {
      compact: { root: "gap-4", title: "text-base", success: "py-4" },
      comfortable: { root: "gap-6", title: "text-lg", success: "py-6" },
    },
  },
  compoundVariants: [
    // Only the `card` variant carries padding; `bare` lets the host shell space it.
    { variant: "card", density: "compact", class: { root: "p-4" } },
    { variant: "card", density: "comfortable", class: { root: "p-6" } },
  ],
  defaultVariants: {
    variant: "card",
    density: "compact",
  },
})

type ContactSlots = ReturnType<typeof contactFormVariants>

const MESSAGE_MAX = 500

/** Shared surface + spacing props every block in the family accepts. */
interface ContactFormBaseProps extends Omit<React.ComponentProps<"div">, "onSubmit" | "title"> {
  /** Heading above the form. */
  title?: React.ReactNode
  /** Supporting line under the heading. Pass `null` to drop it. */
  description?: React.ReactNode
  /** Submit button label. */
  action?: React.ReactNode
  /** `card` (default) ships the standalone bordered block; `bare` drops the chrome to embed inside a page shell. */
  variant?: "card" | "bare"
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
}

/** The heading block shared by every form in the family. */
function FormHeader({
  slots,
  title,
  description,
}: {
  slots: ContactSlots
  title: React.ReactNode
  description: React.ReactNode
}) {
  return (
    <div className={slots.header()}>
      <h3 className={slots.title()}>{title}</h3>
      {description != null && <p className={slots.description()}>{description}</p>}
    </div>
  )
}

/** The confirmation panel shared by every form in the family (announced via `role="status"`). */
function SuccessPanel({
  slots,
  name,
  className,
  text,
  ...props
}: React.ComponentProps<"div"> & { slots: ContactSlots; name: string; text?: React.ReactNode }) {
  return (
    <div className={slots.root({ className })} {...props}>
      <div className={slots.success()} role="status">
        <CheckCircle weight="fill" className={`size-12 ${slots.successIcon()}`} />
        <p className={slots.successTitle()}>Message sent</p>
        <p className={slots.successText()}>
          {text ?? (
            <>
              Thanks for reaching out, {name || "there"}. We&apos;ll get back to you shortly.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/** Icon + label on one row inside a SelectItem (the icon-bearing Select pattern; see Select docs). */
function SelectOptionRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon weight="bold" />
      {label}
    </span>
  )
}

// ─── ContactForm (general "get in touch") ───────────────────────────────────────

const SUBJECTS = [
  { value: "general", label: "General inquiry", icon: ChatCircleDots },
  { value: "sales", label: "Sales", icon: Tag },
  { value: "support", label: "Support", icon: Lifebuoy },
  { value: "partnership", label: "Partnership", icon: Handshake },
  { value: "feedback", label: "Feedback", icon: Star },
] as const

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactFormProps extends ContactFormBaseProps {
  /** Called with the form data on a valid submit. Return a promise to drive the spinner. */
  onSubmit?: (data: ContactFormData) => void | Promise<void>
}

export function ContactForm({
  title = "Get in touch",
  description = "Have a question or want to work together? Send us a message and we'll reply within one business day.",
  action = "Send message",
  variant,
  density,
  onSubmit,
  className,
  ...props
}: ContactFormProps) {
  const resolvedDensity = useDensity(density)
  const slots = contactFormVariants({ variant, density: resolvedDensity })
  const [data, setData] = React.useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  function update<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("loading")
    await Promise.resolve(onSubmit?.(data))
    setStatus("success")
  }

  if (status === "success") {
    return <SuccessPanel slots={slots} name={data.name} className={className} {...props} />
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <FormHeader slots={slots} title={title} description={description} />

      {/* Propagate the form's density to every nested control so the inputs, selects, textarea, and
          submit button all resolve the SAME height (comfortable → md, compact → sm) and never
          mismatch. */}
      <DensityProvider density={resolvedDensity}>
      <form className={slots.form()} onSubmit={handleSubmit}>
        <FieldRow>
          <Field>
            <FieldLabel required>Name</FieldLabel>
            <InputRoot>
              <InputField
                autoComplete="name"
                placeholder="Jane Cooper"
                required
                value={data.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel required>Email</FieldLabel>
            <InputRoot>
              <InputField
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                required
                value={data.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </InputRoot>
          </Field>
        </FieldRow>

        <Field>
          <FieldLabel>Subject</FieldLabel>
          <Select value={data.subject} onValueChange={(value) => update("subject", value)}>
            <SelectTrigger>
              <SelectValue placeholder="What's this about?" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <SelectOptionRow icon={icon} label={label} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel required>Message</FieldLabel>
          <TextareaRoot resize="none">
            <TextareaField
              autoResize
              placeholder="Tell us how we can help…"
              required
              maxLength={MESSAGE_MAX}
              value={data.message}
              onChange={(event) => update("message", event.target.value)}
            />
            <TextareaFooter>
              <FieldHint className="text-muted-foreground/70">We&apos;ll only use this to reply.</FieldHint>
              <TextareaCount current={data.message.length} max={MESSAGE_MAX} />
            </TextareaFooter>
          </TextareaRoot>
        </Field>

        <Button type="submit" loading={status === "loading"} className="w-full">
          {action}
        </Button>
      </form>
      </DensityProvider>
    </div>
  )
}

// ─── LeadForm (sales / collaboration lead capture) ──────────────────────────────
//
// The richer lead-gen block: a name + social row, a company-size Select, a country-aware
// PhoneInput, and a message. Matches the "book a call / let's collaborate" capture forms that sit
// beside a hero (the Contact marketing section composes this as a `card` floating over a photo).

const COMPANY_SIZES = [
  { value: "freelancer", label: "Freelancer", icon: User },
  { value: "1-10", label: "1–10 employees", icon: UsersThree },
  { value: "11-50", label: "11–50 employees", icon: UsersFour },
  { value: "51-200", label: "51–200 employees", icon: Buildings },
  { value: "201-500", label: "201–500 employees", icon: Bank },
  { value: "500+", label: "500+ employees", icon: Buildings },
] as const

export interface LeadFormData {
  firstName: string
  linkedin: string
  email: string
  companySize: string
  phone: string
  message: string
}

export interface LeadFormProps extends ContactFormBaseProps {
  /** Initial country (ISO2) for the phone field. Defaults to `"US"`. */
  defaultCountry?: string
  /** Called with the form data on a valid submit. Return a promise to drive the spinner. */
  onSubmit?: (data: LeadFormData) => void | Promise<void>
}

export function LeadForm({
  title = "Let's collaborate",
  description = "Tell us about your project and we'll get back to you within one business day.",
  action = "Send message",
  variant,
  density,
  defaultCountry = "US",
  onSubmit,
  className,
  ...props
}: LeadFormProps) {
  const resolvedDensity = useDensity(density)
  const slots = contactFormVariants({ variant, density: resolvedDensity })
  const [data, setData] = React.useState<LeadFormData>({
    firstName: "",
    linkedin: "",
    email: "",
    companySize: "",
    phone: "",
    message: "",
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  function update<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("loading")
    await Promise.resolve(onSubmit?.(data))
    setStatus("success")
  }

  if (status === "success") {
    return <SuccessPanel slots={slots} name={data.firstName} className={className} {...props} />
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <FormHeader slots={slots} title={title} description={description} />

      {/* Propagate the form's density to every nested control so the inputs, selects, textarea, and
          submit button all resolve the SAME height (comfortable → md, compact → sm) and never
          mismatch. */}
      <DensityProvider density={resolvedDensity}>
      <form className={slots.form()} onSubmit={handleSubmit}>
        <FieldRow>
          <Field>
            <FieldLabel required>First name</FieldLabel>
            <InputRoot>
              <InputField
                autoComplete="given-name"
                placeholder="Isaac Reed"
                required
                value={data.firstName}
                onChange={(event) => update("firstName", event.target.value)}
              />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel>LinkedIn</FieldLabel>
            <InputRoot>
              <InputPrefix>
                <LinkedinLogo />
              </InputPrefix>
              <InputField
                placeholder="@isaacreed"
                value={data.linkedin}
                onChange={(event) => update("linkedin", event.target.value)}
              />
            </InputRoot>
          </Field>
        </FieldRow>

        <Field>
          <FieldLabel required>Email</FieldLabel>
          <InputRoot>
            <InputField
              type="email"
              autoComplete="email"
              placeholder="isaacreed@koalaui.com"
              required
              value={data.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </InputRoot>
        </Field>

        <Field>
          <FieldLabel required>Company size</FieldLabel>
          <Select value={data.companySize} onValueChange={(value) => update("companySize", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Freelancer, 1–10 employees…" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <SelectOptionRow icon={icon} label={label} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel required>Phone number</FieldLabel>
          <PhoneInput
            defaultCountry={defaultCountry}
            value={data.phone}
            onValueChange={(value) => update("phone", value)}
          />
        </Field>

        <Field>
          <FieldLabel required>Send message</FieldLabel>
          <TextareaRoot resize="none">
            <TextareaField
              autoResize
              placeholder="Write your message here…"
              required
              maxLength={MESSAGE_MAX}
              value={data.message}
              onChange={(event) => update("message", event.target.value)}
            />
            <TextareaFooter>
              <FieldHint className="text-muted-foreground/70">Max length: 500 characters.</FieldHint>
              <TextareaCount current={data.message.length} max={MESSAGE_MAX} />
            </TextareaFooter>
          </TextareaRoot>
        </Field>

        <Button type="submit" loading={status === "loading"} className="w-full">
          {action}
        </Button>
      </form>
      </DensityProvider>
    </div>
  )
}

// ─── SupportForm (help-desk request) ────────────────────────────────────────────
//
// The help-desk block: a name + email row, a support-topic Select, an order / reference field so an
// agent can pull the account up fast, and a message. Distinct from `ContactForm`'s open-ended
// subject: the topics and the reference field are tuned for an inbound support queue.

const SUPPORT_TOPICS = [
  { value: "order", label: "Order issue", icon: Package },
  { value: "billing", label: "Billing", icon: CreditCard },
  { value: "technical", label: "Technical problem", icon: Bug },
  { value: "account", label: "Account", icon: UserCircle },
  { value: "other", label: "Something else", icon: Question },
] as const

export interface SupportFormData {
  name: string
  email: string
  topic: string
  reference: string
  message: string
}

export interface SupportFormProps extends ContactFormBaseProps {
  /** Called with the form data on a valid submit. Return a promise to drive the spinner. */
  onSubmit?: (data: SupportFormData) => void | Promise<void>
}

export function SupportForm({
  title = "How can we help?",
  description = "Tell us what's going on and our support team will get back to you within a few hours.",
  action = "Submit request",
  variant,
  density,
  onSubmit,
  className,
  ...props
}: SupportFormProps) {
  const resolvedDensity = useDensity(density)
  const slots = contactFormVariants({ variant, density: resolvedDensity })
  const [data, setData] = React.useState<SupportFormData>({
    name: "",
    email: "",
    topic: "",
    reference: "",
    message: "",
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  function update<K extends keyof SupportFormData>(key: K, value: SupportFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("loading")
    await Promise.resolve(onSubmit?.(data))
    setStatus("success")
  }

  if (status === "success") {
    return (
      <SuccessPanel
        slots={slots}
        name={data.name}
        className={className}
        text={
          <>
            Thanks, {data.name || "there"}. Your request is in the queue and we&apos;ll reply by
            email shortly.
          </>
        }
        {...props}
      />
    )
  }

  return (
    <div className={slots.root({ className })} {...props}>
      <FormHeader slots={slots} title={title} description={description} />

      {/* Propagate the form's density to every nested control so the inputs, selects, textarea, and
          submit button all resolve the SAME height (comfortable → md, compact → sm) and never
          mismatch. */}
      <DensityProvider density={resolvedDensity}>
      <form className={slots.form()} onSubmit={handleSubmit}>
        <FieldRow>
          <Field>
            <FieldLabel required>Name</FieldLabel>
            <InputRoot>
              <InputField
                autoComplete="name"
                placeholder="Jane Cooper"
                required
                value={data.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel required>Email</FieldLabel>
            <InputRoot>
              <InputField
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                required
                value={data.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </InputRoot>
          </Field>
        </FieldRow>

        <Field>
          <FieldLabel required>Topic</FieldLabel>
          <Select value={data.topic} onValueChange={(value) => update("topic", value)}>
            <SelectTrigger>
              <SelectValue placeholder="What do you need help with?" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORT_TOPICS.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <SelectOptionRow icon={icon} label={label} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Order or reference ID</FieldLabel>
          <InputRoot>
            <InputField
              placeholder="#12345"
              value={data.reference}
              onChange={(event) => update("reference", event.target.value)}
            />
          </InputRoot>
          <FieldHint>Optional, but it helps us find your account faster.</FieldHint>
        </Field>

        <Field>
          <FieldLabel required>Message</FieldLabel>
          <TextareaRoot resize="none">
            <TextareaField
              autoResize
              placeholder="Describe the problem in as much detail as you can…"
              required
              maxLength={MESSAGE_MAX}
              value={data.message}
              onChange={(event) => update("message", event.target.value)}
            />
            <TextareaFooter>
              <FieldHint className="text-muted-foreground/70">We&apos;ll only use this to reply.</FieldHint>
              <TextareaCount current={data.message.length} max={MESSAGE_MAX} />
            </TextareaFooter>
          </TextareaRoot>
        </Field>

        <Button type="submit" loading={status === "loading"} className="w-full">
          {action}
        </Button>
      </form>
      </DensityProvider>
    </div>
  )
}
