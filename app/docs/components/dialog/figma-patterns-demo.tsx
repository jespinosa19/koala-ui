"use client"

import * as React from "react"
import {
  Star,
  ShieldCheck,
  Info,
  Palette,
  Sun,
  Moon,
  Desktop,
  Sparkle,
  Crown,
  LockKey,
  FolderLock,
  UsersThree,
  Cloud,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { Divider } from "@/components/ui/divider"
import { dialogVariants } from "@/components/ui/dialog"
import { InlineClose } from "./inline-close"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  TextareaRoot,
  TextareaField,
  TextareaLabel,
} from "@/components/ui/textarea"
import { OTPInput } from "@/components/ui/otp-input"
import { QRCode } from "@/components/ui/qr-code"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioCard, RadioCardTitle, RadioCardDescription } from "@/components/ui/radio-group"

/**
 * Dialog patterns translated from Figma (Koala UI 12.0 · Dialog frame). Each one is a
 * *composition* over the single `dialogVariants` recipe, not a new variant: a leading icon
 * (`icon` slot), real Koala controls dropped into the body (never hand-rolled), and the
 * `bordered` footer for the split helper/action row. The Figma brand-orange CTA maps to the DS
 * `primary` button, and icons render outline (Phosphor's default weight) per the house style.
 *
 * These render *inline* — the real `dialogVariants` slots on plain elements, no Radix
 * Root/Portal — so every pattern is visible at a glance without a trigger to click (matching the
 * Sizes and Variants showcases). The interactive controls inside stay live; the footer
 * Cancel/close are visual, since an inline preview has nothing to dismiss. Title/description use
 * plain h2/p (the Radix parts need a Dialog context). The Code tab shows the real, openable
 * `Dialog` + `DialogContent` API you'd copy into an app.
 */

// A small "Need some help?" helper for the bordered footer's left side, plus the tiny info
// button used beside required labels. Shared by all three form dialogs below so the idiom stays one.
function FooterHelp() {
  return (
    <span className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
      <Tooltip content="Email support@koala.app, we usually reply within a few hours." trigger="mouseenter">
        <button
          type="button"
          aria-label="How to contact support"
          onClick={(e) => e.preventDefault()}
          className="inline-flex rounded-full text-muted-foreground/70 outline-none transition-colors duration-fast ease-out hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Info weight="bold" aria-hidden className="size-4" />
        </button>
      </Tooltip>
      Need some help?
    </span>
  )
}

function LabelInfo({ content }: { content: string }) {
  return (
    <Tooltip content={content} trigger="mouseenter">
      <button
        type="button"
        aria-label="More information"
        onClick={(e) => e.preventDefault()}
        className="inline-flex rounded-full text-muted-foreground/70 outline-none transition-colors duration-fast ease-out hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Info weight="bold" aria-hidden className="size-3.5" />
      </button>
    </Tooltip>
  )
}

// === Feedback (category: Feedback / Rating Text) ===

export function FeedbackDialog() {
  const [rating, setRating] = React.useState("")
  const slots = dialogVariants({ size: "sm", bordered: true })

  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <Star weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Help us improve!</h2>
        <p className={slots.description()}>
          Share your experience with us so we can make it better.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label id="rating-label" required>
            Rate your experience
            <LabelInfo content="1 is poor, 5 is excellent." />
          </Label>
          {/* Single-select rating; the pills stretch to fill the row evenly. */}
          <ToggleGroup
            type="single"
            size="sm"
            value={rating}
            onValueChange={setRating}
            aria-labelledby="rating-label"
            className="w-full"
          >
            {["1", "2", "3", "4", "5"].map((n) => (
              <ToggleGroupItem key={n} value={n} aria-label={`${n} out of 5`} className="flex-1">
                {n}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid gap-2">
          <TextareaLabel htmlFor="feedback-message">Your message</TextareaLabel>
          <TextareaRoot>
            <TextareaField
              id="feedback-message"
              placeholder="Write your message here..."
              rows={4}
              maxLength={500}
              showCount
            />
          </TextareaRoot>
        </div>
      </div>

      <div className={slots.footer({ className: "sm:items-center sm:justify-between" })}>
        <FooterHelp />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline">Cancel</Button>
          <Button disabled={!rating}>Submit</Button>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}

// === Two-factor (category: 2FA) ===

export function TwoFactorDialog() {
  const [code, setCode] = React.useState("")
  const slots = dialogVariants({ size: "sm", bordered: true })

  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <ShieldCheck weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Enable two-factor authentication</h2>
        <p className={slots.description()}>
          Scan the QR code with your authentication app, then enter the 6-digit
          code to verify and activate 2FA.
        </p>
      </div>

      {/* Concentric radius: rounded-lg panel nested inside the rounded-xl content; the QR
          takes a tighter rounded-md one step further in. */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-accent p-6">
        <QRCode
          value="otpauth://totp/Koala:esteban?secret=JBSWY3DPEHPK3PXP&issuer=Koala"
          level="Q"
          size={176}
          margin={2}
          title="Two-factor authentication QR code"
          className="rounded-md p-3 shadow-xs"
        />
      </div>

      {/* size="sm" keeps all six slots on one row inside the sm dialog at the mobile frame width. */}
      <OTPInput
        label="Introduce code"
        required
        size="sm"
        length={6}
        value={code}
        onChange={setCode}
      />

      <div className={slots.footer({ className: "sm:items-center sm:justify-between" })}>
        <FooterHelp />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline">Cancel</Button>
          <Button disabled={code.length < 6}>Verify</Button>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}

// === Selectable cards (category: Theme) ===

const THEMES = [
  { value: "light", title: "Light theme", hint: "For a clean and minimal look.", icon: Sun },
  { value: "dark", title: "Dark theme", hint: "Perfect for working in low-light conditions.", icon: Moon },
  { value: "system", title: "System", hint: "Automatically adapts to your device's settings.", icon: Desktop },
] as const

export function SelectableCardsDialog() {
  const [theme, setTheme] = React.useState("light")
  const slots = dialogVariants({ size: "sm", bordered: true })

  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <Palette weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Change theme</h2>
        <p className={slots.description()}>
          Choose your preferred theme to customize your experience.
        </p>
      </div>

      <div className="grid gap-2">
        <Label id="theme-label" required>
          Choose your theme
          <LabelInfo content="You can change this anytime from settings." />
        </Label>
        <RadioGroup value={theme} onValueChange={setTheme} aria-labelledby="theme-label">
          {THEMES.map(({ value, title, hint, icon: Icon }) => (
            <RadioCard key={value} value={value} icon={<Icon />}>
              <RadioCardTitle>{title}</RadioCardTitle>
              <RadioCardDescription>{hint}</RadioCardDescription>
            </RadioCard>
          ))}
        </RadioGroup>
      </div>

      <div className={slots.footer({ className: "sm:items-center sm:justify-between" })}>
        <FooterHelp />
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline">Cancel</Button>
          <Button>Apply</Button>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}

// === Upgrade / Subscribe (category: Upsell) ===

// Real Unsplash imagery stands in for the cover art. Plain <img> keeps the demo
// dependency-free; swap for next/Image (or your own asset) in your app.
const UPGRADE_COVER =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop"

const UPGRADE_BENEFITS = [
  {
    icon: LockKey,
    title: "Internal comments",
    description:
      "Separate internal team discussion from external stakeholder comments in shares.",
  },
  {
    icon: FolderLock,
    title: "Restricted projects",
    description:
      "Create projects that are only accessible to you and the specific people you invite.",
  },
  {
    icon: UsersThree,
    title: "Up to 15 members",
    description:
      "Add more people to your account for maximum collaboration on every project.",
  },
  {
    icon: Cloud,
    title: "3 TB storage",
    description:
      "Even more room to store your media and assets, all within your workspace.",
  },
] as const

/**
 * Upgrade / Subscribe upsell: a two-column dialog with edge-to-edge cover art on the left and a
 * benefits list + brand CTA on the right. It composes the single `dialogVariants` recipe: we
 * cancel the content's own padding/gap (`p-0 gap-0`) and split it into two columns, so the cover
 * bleeds to the rounded corners while the benefits column keeps its own padding. The close lands
 * top-right (over the content column on desktop, over the cover on mobile); the CTA is the DS
 * `primary` (brand) button, and the value prop word carries the brand accent.
 */
export function UpgradeDialog() {
  const slots = dialogVariants({ size: "xl" })

  return (
    // Edge-to-edge split: cancel the content padding/gap and lay the cover beside the benefits
    // column. `overflow-hidden` clips the cover to the content's rounded corners.
    <div className={slots.content({ className: "gap-0 overflow-hidden p-0 sm:grid-cols-2" })}>
      {/* Left: cover art. On mobile it's a banner (aspect-ratio); on sm+ it fills the column. */}
      <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- demo imagery; swap for next/Image */}
        <img
          src={UPGRADE_COVER}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
        {/* Subtle inset outline so the photo reads as framed, not floating (polish). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10"
        />
      </div>

      {/* Right: benefits + CTA. */}
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className={slots.icon()}>
          <Crown weight="bold" />
        </div>
        <div className={slots.header({ className: "gap-2 text-left" })}>
          <h2 className={slots.title({ className: "text-xl leading-snug" })}>
            Upgrade to{" "}
            <span className="relative whitespace-nowrap text-brand">
              Team
              <Sparkle
                weight="bold"
                aria-hidden
                className="absolute -top-0.5 -right-3.5 size-3"
              />
            </span>
          </h2>
          <p className={slots.description()}>
            Everything your team needs to collaborate, with room to grow.
          </p>
        </div>

        {/* Benefits: a minimal divided list, a Divider between each feature (no boxed container). */}
        <div role="list" className="flex flex-col gap-4">
          {UPGRADE_BENEFITS.map(({ icon: Icon, title, description }, i) => (
            <React.Fragment key={title}>
              {i > 0 && <Divider />}
              <div role="listitem" className="flex gap-3.5">
                <Icon
                  weight="bold"
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-brand"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {title}
                  </p>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button size="lg" className="w-full">
            <Sparkle weight="bold" aria-hidden />
            Subscribe to Team
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <span className="tabular-nums text-foreground">$25</span>/mo. + tax per user
            <span aria-hidden className="mx-1.5 text-muted-foreground/50">
              ·
            </span>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-fast ease-out hover:text-link hover:decoration-link"
            >
              Compare plans
            </a>
          </p>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}
