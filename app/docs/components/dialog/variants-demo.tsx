"use client"

import * as React from "react"
import {
  UserCircle,
  Trash,
  Rows,
  FileText,
  LinkSimple,
  EnvelopeSimple,
  Copy,
  Megaphone,
  DeviceMobile,
  Info,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { dialogVariants } from "@/components/ui/dialog"
import {
  InputRoot,
  InputField,
  InputPrefix,
  InputSuffixButton,
  InputLabel,
} from "@/components/ui/input"
import { InlineClose } from "./inline-close"

/**
 * The core dialog patterns, each painted *inline* (the real `dialogVariants` slots on plain
 * elements, no Radix Root/Portal) so it renders always-open inside its own responsive PreviewFrame
 * iframe (see components/docs/dialog-registry.tsx + app/preview/dialogs/[slug]). Title/description
 * use plain h2/p (the Radix parts need a Dialog context); the footer buttons and the close glyph are
 * visual, since an inline preview has nothing to submit or dismiss. Every dialog keeps its real
 * `shadow-lg` here (unlike the old flat gallery) so it reads as a floating modal over the frame's
 * dimmed backdrop. The Code tab on each block shows the real, openable `Dialog` + `DialogContent`
 * API you'd copy into an app.
 */

// === Default (Edit profile) ===

export function DefaultDialog() {
  const slots = dialogVariants()
  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <UserCircle weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Edit profile</h2>
        <p className={slots.description()}>
          Make changes to your profile here. Click save when you&apos;re done.
        </p>
      </div>
      <div className={slots.footer()}>
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </div>
      <InlineClose />
    </div>
  )
}

// === Confirmation (destructive, no close button) ===

export function ConfirmationDialog() {
  const slots = dialogVariants({ size: "sm" })
  return (
    <div className={slots.content()}>
      {/* Tint the leading icon red for a destructive action. */}
      <div className={slots.icon({ className: "text-destructive" })}>
        <Trash weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Delete account?</h2>
        <p className={slots.description()}>
          This permanently deletes your account and all data. This cannot be undone.
        </p>
      </div>
      <div className={slots.footer()}>
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </div>
      {/* No close glyph: showClose={false} forces an explicit choice. */}
    </div>
  )
}

// === Compact (tighter padding for application UI) ===

export function CompactDialog() {
  const slots = dialogVariants({ size: "sm", density: "compact" })
  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <Rows weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Compact dialog</h2>
        <p className={slots.description()}>
          Tighter padding and a 1rem title for dense application UI.
        </p>
      </div>
      <div className={slots.footer()}>
        <Button>Got it</Button>
      </div>
      <InlineClose density="compact" />
    </div>
  )
}

// === Scrollable body (pinned header/footer, the body scrolls) ===

export function ScrollableDialog() {
  const slots = dialogVariants()
  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <FileText weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Terms of service</h2>
        <p className={slots.description()}>Please read the full terms before accepting.</p>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-4 text-sm text-muted-foreground [scrollbar-width:thin]">
        <p className="mb-3">
          By using this service, you agree to be bound by these Terms of Service. Please read them
          carefully before proceeding.
        </p>
        <p className="mb-3">
          <strong className="text-foreground">1. Acceptance.</strong> Your access to and use of the
          service is conditioned on your acceptance of and compliance with these Terms.
        </p>
        <p className="mb-3">
          <strong className="text-foreground">2. Accounts.</strong> When you create an account you
          must provide accurate, complete and current information at all times.
        </p>
        <p>
          <strong className="text-foreground">3. Termination.</strong> We may suspend access to the
          service immediately, without prior notice, for any breach of these Terms.
        </p>
      </div>
      <div className={slots.footer()}>
        <Button variant="ghost">Decline</Button>
        <Button>Accept</Button>
      </div>
      <InlineClose />
    </div>
  )
}

// === Share (leading icon + composed Input parts) ===

export function ShareDialog() {
  const slots = dialogVariants()
  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <LinkSimple weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Share incident</h2>
        <p className={slots.description()}>Choose who you want to share the incident with.</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <InputLabel htmlFor="demo-share-link" required>
            Copy the link directly
          </InputLabel>
          <InputRoot>
            <InputField
              id="demo-share-link"
              readOnly
              value="lspcad.flab/incident21414"
              className="text-muted-foreground"
            />
            <InputSuffixButton aria-label="Copy link">
              <Copy weight="bold" className="size-4" />
            </InputSuffixButton>
          </InputRoot>
        </div>
        <div className="grid gap-1.5">
          <InputLabel htmlFor="demo-share-email" required>
            Send the link via invitation
          </InputLabel>
          {/* Stack on mobile so the button never overflows a narrow dialog; row from sm. */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <InputRoot className="min-w-0 sm:flex-1">
              <InputPrefix>
                <EnvelopeSimple weight="bold" />
              </InputPrefix>
              <InputField id="demo-share-email" type="email" placeholder="Enter your email address" />
            </InputRoot>
            <Button className="w-full sm:w-auto">Send invite</Button>
          </div>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}

// === Announcement (leading icon, hero, split footer helper + actions) ===

export function AnnouncementDialog() {
  const slots = dialogVariants()
  return (
    <div className={slots.content()}>
      <div className={slots.icon()}>
        <Megaphone weight="bold" />
      </div>
      <div className={slots.header()}>
        <h2 className={slots.title()}>Mobile Version Now Available!</h2>
        <p className={slots.description()}>Access your dashboard anytime, anywhere.</p>
      </div>
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-accent to-muted text-muted-foreground">
        <DeviceMobile weight="bold" className="size-12" />
        <span className="text-sm font-medium">Dashboard on mobile</span>
      </div>
      <p className="text-pretty text-sm text-muted-foreground">
        Enjoy a seamless experience on the go with our mobile-friendly dashboard. Manage your data,
        track progress, and stay updated in real-time, all from your smartphone.
      </p>
      <div className={slots.footer({ className: "sm:items-center sm:justify-between" })}>
        <span className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Info weight="bold" className="size-4 text-muted-foreground/70" />
          Need some help?
        </span>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline">Cancel</Button>
          <Button>Create</Button>
        </div>
      </div>
      <InlineClose />
    </div>
  )
}
