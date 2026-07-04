"use client"

import * as React from "react"
import {
  Envelope,
  ShieldCheck,
  User,
  Eye,
  CurrencyDollar,
  CurrencyEur,
  CurrencyGbp,
  Copy,
  Check,
} from "@phosphor-icons/react"

import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Hero: the purest fuse - a "$" affix, the elastic amount field, and a trailing currency
// Select, joined into one shell with a single ring. No action button lives inside; a
// prominent action always stays detached (see NewsletterGroupDemo).
export function AmountGroupDemo() {
  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputRoot>
          <InputField
            inputMode="decimal"
            placeholder="0.00"
            defaultValue="1,250.00"
            className="tabular-nums"
            aria-label="Amount"
          />
        </InputRoot>
        <Select defaultValue="usd">
          <SelectTrigger aria-label="Currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">
              <CurrencyDollar weight="bold" /> USD
            </SelectItem>
            <SelectItem value="eur">
              <CurrencyEur weight="bold" /> EUR
            </SelectItem>
            <SelectItem value="gbp">
              <CurrencyGbp weight="bold" /> GBP
            </SelectItem>
          </SelectContent>
        </Select>
      </InputGroup>
    </div>
  )
}

// Static text affixes via InputGroupAddon, on either side of the field.
export function AddonsDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputRoot>
          <InputField placeholder="yourcompany" aria-label="Subdomain" />
        </InputRoot>
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputRoot>
          <InputField placeholder="username" aria-label="Username" />
        </InputRoot>
      </InputGroup>
    </div>
  )
}

// A prominent text action does NOT melt into the field. Keep it a real, self-contained
// Button in a flex row (`items-stretch gap-2`) so the heights line up and it reads as a
// button, not a segment. The field flexes; the Button caps the row from *outside*.
export function NewsletterGroupDemo() {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-stretch gap-2">
        <InputRoot className="flex-1">
          <InputPrefix>
            <Envelope weight="bold" />
          </InputPrefix>
          <InputField
            type="email"
            placeholder="Enter your email address"
            aria-label="Email address"
          />
        </InputRoot>
        <Button>Subscribe</Button>
      </div>
    </div>
  )
}

// The Select IS a fused segment (it melts into the shell), but the "Invite" text action
// stays detached beside the group - same rule as the newsletter, one step richer.
export function InviteGroupDemo() {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-stretch gap-2">
        <InputGroup className="flex-1">
          <Select defaultValue="member">
            <SelectTrigger aria-label="Role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <ShieldCheck weight="bold" /> Admin
              </SelectItem>
              <SelectItem value="member">
                <User weight="bold" /> Member
              </SelectItem>
              <SelectItem value="viewer">
                <Eye weight="bold" /> Viewer
              </SelectItem>
            </SelectContent>
          </Select>
          <InputRoot>
            <InputField
              type="email"
              placeholder="teammate@company.com"
              aria-label="Email to invite"
            />
          </InputRoot>
        </InputGroup>
        <Button>Invite</Button>
      </div>
    </div>
  )
}

// The sanctioned exception: a *small icon-only* action (copy, clear, a submit arrow) may
// melt into the shell as a fused segment. It keeps its fill and hover but drops its radius /
// ring / press-scale, so it sits flush like any other segment.
export function CopyFieldDemo() {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard?.writeText("koala.dev/s/ab12cd").catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="w-full max-w-sm">
      <InputGroup>
        <InputGroupAddon>koala.dev/</InputGroupAddon>
        <InputRoot>
          <InputField
            readOnly
            defaultValue="s/ab12cd"
            aria-label="Share link"
            className="font-mono"
          />
        </InputRoot>
        <Button
          iconOnly
          variant="ghost"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy link"}
        >
          <span className="relative flex size-4 items-center justify-center">
            <Copy
              weight="bold"
              aria-hidden
              className={`absolute size-4 transition-[opacity,scale] duration-fast ease-out ${copied ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
            />
            <Check
              weight="bold"
              aria-hidden
              className={`absolute size-4 text-success transition-[opacity,scale] duration-fast ease-out ${copied ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
            />
          </span>
        </Button>
      </InputGroup>
    </div>
  )
}

// One height knob for the whole shell; give the inner controls - and the detached Button -
// the matching size so every part lines up.
export function SizesDemo() {
  const sizes = ["sm", "md", "lg"] as const
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-stretch gap-2">
          <InputGroup size={size} className="flex-1">
            <Select defaultValue="member">
              <SelectTrigger aria-label={`Role (${size})`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <ShieldCheck weight="bold" /> Admin
                </SelectItem>
                <SelectItem value="member">
                  <User weight="bold" /> Member
                </SelectItem>
                <SelectItem value="viewer">
                  <Eye weight="bold" /> Viewer
                </SelectItem>
              </SelectContent>
            </Select>
            <InputRoot size={size}>
              <InputField
                type="email"
                placeholder="teammate@company.com"
                aria-label={`Email ${size}`}
              />
            </InputRoot>
          </InputGroup>
          <Button size={size}>Invite</Button>
        </div>
      ))}
    </div>
  )
}

// hasError paints the whole shell red; disabled dims and locks the row.
export function StatesDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup hasError>
        <InputGroupAddon>@</InputGroupAddon>
        <InputRoot>
          <InputField defaultValue="not an email" aria-label="Email" />
        </InputRoot>
      </InputGroup>

      <InputGroup disabled>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputRoot>
          <InputField defaultValue="acme" disabled aria-label="Subdomain" />
        </InputRoot>
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>
    </div>
  )
}
