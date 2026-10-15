"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { CaretDown, CaretRight, Plus } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { hitX } from "@/lib/hit-area"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

export const collapsibleVariants = tv({
  slots: {
    root: "",
    trigger: [
      "group/collapsible-trigger inline-flex cursor-pointer select-none items-center gap-1.5 rounded-sm text-sm font-medium text-foreground",
      "transition-colors duration-fast ease-out hover:text-foreground/80",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&_svg]:pointer-events-none",
      hitX,
    ],
    icon: "size-4 shrink-0 text-muted-foreground",
    content: [
      "group/collapsible-content flow-root",
      "data-[state=open]:animate-disclosure-open data-[state=closed]:animate-disclosure-close",
    ],
    body: "",
  },
  variants: {
    marker: {
      caret: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-180" },
      branch: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-90" },
      plus: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-45" },
    },
    animated: {
      true: {
        body: [
          "duration-base ease-out",
          "group-data-[state=open]/collapsible-content:animate-in group-data-[state=open]/collapsible-content:fade-in-0 group-data-[state=open]/collapsible-content:slide-in-from-top-1",
          "group-data-[state=closed]/collapsible-content:animate-out group-data-[state=closed]/collapsible-content:fade-out-0",
        ],
      },
      false: {},
    },
  },
  defaultVariants: { marker: "caret", animated: false },
})

const [CollapsibleProvider, useCollapsibleContext] = createContext<{ animated: boolean }>("Collapsible")

export type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>

export function Collapsible({
  className,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: CollapsibleProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const [previous, setPrevious] = React.useState(open)
  const [moved, setMoved] = React.useState(false)
  if (open !== previous) {
    setPrevious(open)
    setMoved(true)
  }

  const { root } = collapsibleVariants()
  return (
    <CollapsibleProvider animated={moved}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        open={open}
        onOpenChange={(next) => {
          if (openProp === undefined) setUncontrolled(next)
          onOpenChange?.(next)
        }}
        className={root({ className }) || undefined}
        {...props}
      />
    </CollapsibleProvider>
  )
}

export function CollapsibleTrigger({
  className,
  asChild,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  const { trigger } = collapsibleVariants()
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      asChild={asChild}
      className={asChild ? cn("group/collapsible-trigger", className) : trigger({ className })}
      {...props}
    />
  )
}

const MARKS = { caret: CaretDown, branch: CaretRight, plus: Plus } as const

export interface CollapsibleIconProps
  extends Omit<React.ComponentProps<"svg">, "ref">,
    Pick<VariantProps<typeof collapsibleVariants>, "marker"> {}

export function CollapsibleIcon({ className, marker, ...props }: CollapsibleIconProps) {
  const resolved = marker ?? "caret"
  const { icon } = collapsibleVariants({ marker: resolved })
  const Mark = MARKS[resolved]
  return (
    <Mark weight="bold" data-slot="collapsible-icon" aria-hidden className={icon({ className })} {...props} />
  )
}

export function CollapsibleContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const { animated } = useCollapsibleContext("CollapsibleContent")
  const slots = collapsibleVariants({ animated })
  return (
    <CollapsiblePrimitive.Content data-slot="collapsible-content" className={slots.content()} {...props}>
      <div data-slot="collapsible-body" className={slots.body({ className }) || undefined}>
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  )
}
