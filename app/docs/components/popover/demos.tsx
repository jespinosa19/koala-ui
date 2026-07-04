"use client"

import * as React from "react"
import { Gear, Info, Trash, LinkSimple, Copy, Check } from "@phosphor-icons/react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverCloseButton,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { InputRoot, InputField, InputLabel } from "@/components/ui/input"
import { AvatarRoot, AvatarImage, AvatarFallback, AvatarStatus } from "@/components/ui/avatar"

// Basic: title + description.
export function PopoverBasicDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-1">
          <PopoverTitle>Invite teammates</PopoverTitle>
          <PopoverDescription>
            Share this workspace with anyone on your team. They&apos;ll get an email invite.
          </PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// A small form: the canonical Popover use case (Input blends with the panel surface).
export function PopoverFormDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Gear weight="bold" /> Dimensions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="space-y-1">
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 items-center gap-3">
              <InputLabel htmlFor="width">Width</InputLabel>
              <InputRoot size="sm" className="col-span-2">
                <InputField id="width" defaultValue="100%" />
              </InputRoot>
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <InputLabel htmlFor="height">Height</InputLabel>
              <InputRoot size="sm" className="col-span-2">
                <InputField id="height" defaultValue="25px" />
              </InputRoot>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button size="sm">Save</Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// With a pointer arrow + a styled close button.
export function PopoverArrowDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" iconOnly aria-label="About">
          <Info weight="bold" />
        </Button>
      </PopoverTrigger>
      <PopoverContent showArrow className="w-64">
        <PopoverCloseButton aria-label="Close">
          <span aria-hidden>×</span>
        </PopoverCloseButton>
        <div className="space-y-1 pr-4">
          <PopoverTitle>Heads up</PopoverTitle>
          <PopoverDescription>
            Popovers reposition automatically to stay in view near the edges.
          </PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Alignment options.
export function PopoverAlignDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              align=&quot;{align}&quot;
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align} className="w-48">
            <PopoverDescription>
              Aligned to the <span className="font-medium text-foreground">{align}</span> edge.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

// Compact density.
export function PopoverCompactDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Compact
        </Button>
      </PopoverTrigger>
      <PopoverContent density="compact" className="w-56">
        <PopoverDescription>Tighter padding for dense application UI.</PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}

// Destructive confirmation: a ghost + destructive action pair, both dismissing via PopoverClose.
export function PopoverConfirmDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Trash weight="bold" /> Delete project
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <div className="space-y-1">
            <PopoverTitle>Delete project?</PopoverTitle>
            <PopoverDescription>
              This permanently removes the project and all of its data. This can&apos;t be undone.
            </PopoverDescription>
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Profile card: an avatar with presence, identity, and follow/message actions.
export function PopoverProfileDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          @katiep
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AvatarRoot size="lg">
              <AvatarImage src="https://i.pravatar.cc/160?img=5" alt="Katie Park" />
              <AvatarFallback>KP</AvatarFallback>
              <AvatarStatus variant="online" />
            </AvatarRoot>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Katie Park</span>
              <span className="text-sm text-muted-foreground">@katiep</span>
            </div>
          </div>
          <PopoverDescription>
            Design engineer at Koala. Builds the design system and obsesses over micro-interactions.
          </PopoverDescription>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Follow
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Message
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Share: a read-only link Input (blends with the panel via --surface) + a copy button that confirms.
export function PopoverShareDemo() {
  const [copied, setCopied] = React.useState(false)
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = () => {
    navigator.clipboard?.writeText("https://koalaui.com/s/9f3a2")
    setCopied(true)
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setCopied(false), 1800)
  }

  // Clear a pending reset on unmount so it never fires against a gone component.
  React.useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current)
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <LinkSimple weight="bold" /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="space-y-1">
            <PopoverTitle>Share link</PopoverTitle>
            <PopoverDescription>Anyone with this link can view the project.</PopoverDescription>
          </div>
          <div className="flex items-center gap-2">
            <InputRoot size="sm" className="flex-1">
              <InputField readOnly value="koalaui.com/s/9f3a2" aria-label="Shareable link" />
            </InputRoot>
            <Button size="sm" className="shrink-0" onClick={copy}>
              {copied ? (
                <>
                  <Check weight="bold" /> Copied
                </>
              ) : (
                <>
                  <Copy weight="bold" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
