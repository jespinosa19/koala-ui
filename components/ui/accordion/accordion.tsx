"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { CaretDown, Plus } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

export const accordionVariants = tv({
  slots: {
    root: "w-full",
    item: "",
    header: "flex",
    trigger: [
      "group/trigger flex flex-1 items-center justify-between gap-4 text-left font-medium text-foreground",
      "cursor-pointer outline-none",
      "transition-colors duration-fast ease-out",
      "hover:text-foreground/80",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:pointer-events-none",
    ],
    icon: "size-4 shrink-0 text-muted-foreground",
    content: [
      "group/content flow-root text-sm text-body",
      "data-[state=open]:animate-disclosure-open data-[state=closed]:animate-disclosure-close",
    ],
    contentInner: [
      "duration-base ease-out",
      "group-data-[state=open]/content:animate-in group-data-[state=open]/content:fade-in-0 group-data-[state=open]/content:slide-in-from-top-1",
      "group-data-[state=closed]/content:animate-out group-data-[state=closed]/content:fade-out-0",
    ],
  },
  variants: {
    variant: {
      minimal: { item: "border-b border-border last:border-b-0" },
      card: {
        root: "rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
        item: "border-b border-border last:border-b-0",
      },
      separated: {
        root: "flex flex-col gap-3",
        item: "rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
      },
      pill: {
        root: "flex flex-col items-start gap-2",
        item: [
          "interpolate-size w-fit max-w-full rounded-2xl bg-foreground/6",
          "transition-[width,background-color,transform] duration-base ease-out motion-reduce:transition-none",
          "hover:bg-foreground/10 active:scale-[0.97]",
          "has-[[data-slot=accordion-content]:not([hidden])]:w-full",
          "has-[[data-slot=accordion-content]:not([hidden])]:transition-[background-color,transform]",
          "has-[[data-slot=accordion-content]:not([hidden])]:hover:bg-foreground/6",
          "has-[[data-slot=accordion-content]:not([hidden])]:active:scale-100",
        ],
        header: "rounded-[inherit]",
        trigger: [
          "rounded-[inherit] text-foreground hover:text-foreground",
          "transition-[color] duration-fast ease-out",
        ],
        content: "w-0 min-w-full",
        icon: "size-6 rounded-full bg-foreground/10 p-1",
      },
      board: {
        root: "grid grid-cols-1 gap-3 sm:grid-cols-2",
        item: [
          "flex flex-col rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
          "transition-shadow duration-fast ease-out hover:shadow-sm",
          "has-[[data-slot=accordion-content]:not([hidden])]:col-span-full",
        ],
        header: "flex-1",
        trigger: "items-start",
        icon: "mt-1",
        contentInner: "max-w-3xl",
      },
    },
    density: {
      comfortable: { trigger: "py-4 text-base", contentInner: "pb-4" },
      compact: { trigger: "py-3 text-sm", contentInner: "pb-3" },
    },
    iconPosition: {
      trailing: {},
      leading: { trigger: "justify-start gap-3" },
    },
    marker: {
      caret: { icon: "caret-turn group-data-[state=open]/trigger:rotate-180" },
      plus: { icon: "caret-turn group-data-[state=open]/trigger:rotate-45" },
    },
    size: {
      md: {},
      lg: { trigger: "py-5 text-lg font-semibold", icon: "size-5", contentInner: "pb-5 text-base" },
    },
  },
  compoundVariants: [
    { variant: ["card", "separated", "board"], density: "comfortable", className: { trigger: "px-5", contentInner: "px-5" } },
    { variant: ["card", "separated", "board"], density: "compact", className: { trigger: "px-4", contentInner: "px-4" } },
    { variant: "pill", density: "comfortable", className: { trigger: "gap-3 px-5 py-3", contentInner: "px-5 pb-4" } },
    { variant: "pill", density: "compact", className: { trigger: "gap-2.5 px-4 py-2.5", contentInner: "px-4 pb-3" } },
    { variant: "pill", size: "lg", className: { icon: "size-7" } },
  ],
  defaultVariants: {
    variant: "minimal",
    density: "comfortable",
    iconPosition: "trailing",
    marker: "caret",
    size: "md",
  },
})

type AccordionSlots = ReturnType<typeof accordionVariants>
type IconPosition = NonNullable<VariantProps<typeof accordionVariants>["iconPosition"]>
type Marker = NonNullable<VariantProps<typeof accordionVariants>["marker"]>
const [AccordionProvider, useAccordionContext] = createContext<{
  slots: AccordionSlots
  iconPosition: IconPosition
  marker: Marker
}>("Accordion")

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>

export function Accordion({
  className,
  variant,
  density,
  iconPosition = "trailing",
  marker = "caret",
  size,
  ...props
}: AccordionProps) {
  const slots = accordionVariants({ variant, density: useDensity(density), iconPosition, marker, size })
  return (
    <AccordionProvider slots={slots} iconPosition={iconPosition} marker={marker}>
      <AccordionPrimitive.Root data-slot="accordion" className={slots.root({ className })} {...props} />
    </AccordionProvider>
  )
}

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { slots } = useAccordionContext("AccordionItem")
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={slots.item({ className })} {...props} />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const { slots, iconPosition, marker } = useAccordionContext("AccordionTrigger")
  const Glyph = marker === "plus" ? Plus : CaretDown
  const icon = <Glyph weight="bold" data-slot="accordion-icon" aria-hidden className={slots.icon()} />
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className={slots.header()}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={slots.trigger({ className })}
        {...props}
      >
        {iconPosition === "leading" ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          <>
            {children}
            {icon}
          </>
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { slots } = useAccordionContext("AccordionContent")
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className={slots.content()} {...props}>
      <div className={slots.contentInner({ className })}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
