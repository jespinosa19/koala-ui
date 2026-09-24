"use client"

import * as React from "react"
import { Check } from "@phosphor-icons/react"

import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldHint, FieldRow } from "@/components/ui/field"
import { Form, FormSection, FormActions } from "@/components/ui/form"
import {
  InputRoot,
  InputField,
  InputPrefixLabel,
} from "@/components/ui/input"
import {
  TextareaRoot,
  TextareaField,
  TextareaFooter,
  TextareaCount,
} from "@/components/ui/textarea"
import { useDensity, type Density } from "@/lib/density"
import { tv } from "@/lib/tv"

/**
 * SettingsForm: an account-profile editing block: an avatar with change/remove controls, name
 * row, a prefixed username, email, and a bio with a live count, closed by a Cancel / Save footer
 * (the ghost + primary action pairing). It owns its field state and a saved confirmation; wire
 * `onSave` to your API. See docs/ARCHITECTURE.md §2.
 *
 * The card paints no fill (fill is elevation, docs/FOUNDATIONS.md), so nested Inputs/Textarea
 * take the ground it sits on.
 */
export const settingsFormVariants = tv({
  slots: {
    // The edge is an `--edge` ring plus the xs lift, not a border (docs/FOUNDATIONS.md, "Shadows
    // over borders"): it takes no layout, so the header and footer seams run to the true edge.
    root: "flex w-full max-w-lg flex-col rounded-2xl text-card-foreground shadow-xs ring-1 ring-edge",
    header: "flex flex-col gap-1.5 border-b border-border",
    title: "font-semibold tracking-tight text-foreground text-balance",
    description: "text-sm text-pretty text-muted-foreground",
    // The body's field rhythm and the footer's border + alignment now come from FormSection /
    // FormActions; these slots only carry the card's own padding.
    body: "",
    photoRow: "flex items-center gap-4",
    photoActions: "flex items-center gap-2",
    photoHint: "mt-1 text-xs text-muted-foreground",
    footer: "",
    saved: "mr-auto flex items-center gap-1.5 text-sm font-medium text-success",
  },
  // Density is Koala's cross-cutting spacing axis (see lib/density.tsx): the section padding
  // (header/body/footer), body gap, and title size. `compact` is the Koala default (16px);
  // `comfortable` is the spacious alternative (24px).
  variants: {
    density: {
      compact: { header: "px-4 py-4", body: "px-4 py-4", footer: "px-4 py-3", title: "text-base" },
      comfortable: { header: "px-6 py-6", body: "px-6 py-6", footer: "px-6 py-4", title: "text-lg" },
    },
  },
  defaultVariants: {
    density: "compact",
  },
})

const BIO_MAX = 160

export interface SettingsFormData {
  firstName: string
  lastName: string
  username: string
  email: string
  bio: string
}

export interface SettingsFormProps
  extends Omit<React.ComponentProps<"form">, "onSubmit" | "title" | "defaultValue"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Spacing axis: `compact` (16px, default) or `comfortable` (24px). Falls back to the nearest DensityProvider. */
  density?: Density
  /** Initial field values. */
  defaultValues?: Partial<SettingsFormData>
  /** Avatar image src; falls back to initials when absent. */
  avatarSrc?: string
  /** Prefix shown before the username (e.g. `"koala.ui/"`). */
  usernamePrefix?: string
  /** Called with the full form data on save. Return a promise to drive the spinner. */
  onSave?: (data: SettingsFormData) => void | Promise<void>
  onCancel?: () => void
}

export function SettingsForm({
  title = "Profile",
  description = "This information will be displayed publicly on your profile.",
  defaultValues,
  avatarSrc,
  usernamePrefix = "koala.ui/",
  density,
  onSave,
  onCancel,
  className,
  ...props
}: SettingsFormProps) {
  const resolvedDensity = useDensity(density)
  const slots = settingsFormVariants({ density: resolvedDensity })
  const [data, setData] = React.useState<SettingsFormData>({
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    username: defaultValues?.username ?? "",
    email: defaultValues?.email ?? "",
    bio: defaultValues?.bio ?? "",
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "saved">("idle")

  function update<K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
    // Any edit clears a prior "saved" confirmation.
    setStatus((prev) => (prev === "saved" ? "idle" : prev))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus("loading")
    await Promise.resolve(onSave?.(data))
    setStatus("saved")
  }

  const initials =
    `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase() || "?"

  return (
    // `layout="plain"`: this form element IS the card, so its header / body / footer sit flush
    // against the card edge and the FormSection inside owns the field rhythm.
    <Form
      layout="plain"
      onSubmit={handleSubmit}
      className={slots.root({ className })}
      {...props}
    >
      {(title != null || description != null) && (
        <div className={slots.header()}>
          {title != null && <h3 className={slots.title()}>{title}</h3>}
          {description != null && <p className={slots.description()}>{description}</p>}
        </div>
      )}

      <FormSection density={resolvedDensity} className={slots.body()}>
        <div className={slots.photoRow()}>
          <AvatarRoot size="xl">
            {avatarSrc && <AvatarImage src={avatarSrc} alt="Your avatar" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
          <div>
            <div className={slots.photoActions()}>
              <Button type="button" variant="outline" size="sm">
                Change photo
              </Button>
              <Button type="button" variant="ghost" size="sm">
                Remove
              </Button>
            </div>
            <p className={slots.photoHint()}>JPG, GIF or PNG. 2MB max.</p>
          </div>
        </div>

        <FieldRow>
          <Field>
            <FieldLabel required>First name</FieldLabel>
            <InputRoot>
              <InputField
                autoComplete="given-name"
                placeholder="Jane"
                value={data.firstName}
                onChange={(event) => update("firstName", event.target.value)}
              />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel required>Last name</FieldLabel>
            <InputRoot>
              <InputField
                autoComplete="family-name"
                placeholder="Cooper"
                value={data.lastName}
                onChange={(event) => update("lastName", event.target.value)}
              />
            </InputRoot>
          </Field>
        </FieldRow>

        <Field>
          <FieldLabel required>Username</FieldLabel>
          <InputRoot>
            <InputPrefixLabel>{usernamePrefix}</InputPrefixLabel>
            <InputField
              autoComplete="username"
              placeholder="janecooper"
              value={data.username}
              onChange={(event) => update("username", event.target.value)}
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
              value={data.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </InputRoot>
          <FieldHint>Used for sign-in and notifications.</FieldHint>
        </Field>

        <Field>
          <FieldLabel>Bio</FieldLabel>
          <TextareaRoot resize="none">
            <TextareaField
              autoResize
              placeholder="A short description about yourself…"
              maxLength={BIO_MAX}
              value={data.bio}
              onChange={(event) => update("bio", event.target.value)}
            />
            <TextareaFooter>
              <FieldHint>Brief, appears under your name.</FieldHint>
              <TextareaCount current={data.bio.length} max={BIO_MAX} />
            </TextareaFooter>
          </TextareaRoot>
        </Field>
      </FormSection>

      {/* The card's own `py` overrides the bordered variant's `pt` through twMerge, so the
          seam lands flush with the card edge instead of inheriting the standalone spacing. */}
      <FormActions bordered className={slots.footer()}>
        {status === "saved" && (
          <span className={slots.saved()} role="status">
            <Check weight="bold" className="size-4" />
            All changes saved
          </span>
        )}
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={status === "loading"}>
          Save changes
        </Button>
      </FormActions>
    </Form>
  )
}
