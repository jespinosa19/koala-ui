"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { CaretDown, CaretRight, Plus } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { hitX } from "@/lib/hit-area"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Collapsible: one region that shows and hides under its trigger, over Radix Collapsible (the
 * `aria-expanded`/`aria-controls` wiring, Space/Enter, and the `--radix-collapsible-content-height`
 * var the height tween reads). It is the one-row Accordion: reach for it when a single block opens
 * on its own ("Show 4 more", "Advanced settings", a sidebar group), and for Accordion when several
 * rows share one set of rules.
 *
 * It paints no chrome. The root is a plain block, so it drops into a card, a form or a list without
 * a container of its own; the parts only carry the behavior and the motion:
 *
 * - `CollapsibleTrigger` is a quiet text control on its own, or `asChild` onto a Button, which then
 *   keeps its own look entirely.
 * - `CollapsibleIcon` is the disclosure mark, and it *turns* with the trigger it sits in (never a
 *   second glyph swapped in): a caret flips 180°, a branch caret turns 90° to point down, a plus
 *   turns 45° into a cross. All three ride `caret-turn`, the same beat as the height.
 * - `CollapsibleContent` tweens its height on the DS collapsible keyframes, retimed to
 *   `duration-base`/`ease-out`, and fades its body in on the same clock (a softer plain fade out).
 *
 * Opening on page load is not animated: Radix already skips the height tween for content that
 * starts open, and the root holds the body fade back until the state has changed once.
 */
export const collapsibleVariants = tv({
  slots: {
    root: "",
    // The bare trigger: a text control with the mark beside it. `group/collapsible-trigger` is what
    // the icon turns on; it is the only class an `asChild` trigger takes, so a Button keeps its own.
    trigger: [
      "group/collapsible-trigger inline-flex cursor-pointer select-none items-center gap-1.5 rounded-sm text-sm font-medium text-foreground",
      "transition-colors duration-fast ease-out hover:text-foreground/80",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&_svg]:pointer-events-none",
      // polish: a line of text is ~20px tall; the target grows to 40 (44 on touch) without the visual.
      hitX,
    ],
    // The mark's box. The turn lives on the `marker` axis below: each glyph turns a different amount,
    // and `caret-turn` is its own tailwind-merge group, so a rotation left here would stack.
    icon: "size-4 shrink-0 text-muted-foreground",
    // The animated wrapper: `animate-disclosure-*` clips the body only while the height tweens (the
    // clip rides in the keyframes), so at rest a focus ring or card edge inside is never shaved.
    // `flow-root` contains the body's margins without a clip.
    content: [
      "group/collapsible-content flow-root",
      "data-[state=open]:animate-disclosure-open data-[state=closed]:animate-disclosure-close",
    ],
    // The body. Padding and layout go here, never on the animated wrapper, so the tween stays smooth.
    body: "",
  },
  variants: {
    marker: {
      caret: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-180" },
      branch: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-90" },
      plus: { icon: "caret-turn group-data-[state=open]/collapsible-trigger:rotate-45" },
    },
    // Whether the body fades with the height. Off until the state has changed once, so content that
    // renders open never fades in on page load; after that, open fades in with a 4px drop (the body
    // settling under its trigger) and close is a plain fade, softer than the enter.
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

/**
 * The root. Forwards Radix's `open` / `defaultOpen` / `onOpenChange` / `disabled`, and renders a
 * plain `<div>` (or your element, with `asChild`).
 */
export function Collapsible({
  className,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: CollapsibleProps) {
  // Held here as well as in Radix so the root can tell a change from the first render: the body
  // fade only switches on once the state has moved (React's "state from the previous render"
  // pattern, no effect, so the class and the new state land in the same commit).
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
      // An `asChild` trigger is the consumer's own control (a Button, a row): it keeps its look and
      // takes only the group hook its icon turns on.
      className={asChild ? cn("group/collapsible-trigger", className) : trigger({ className })}
      {...props}
    />
  )
}

const MARKS = { caret: CaretDown, branch: CaretRight, plus: Plus } as const

export interface CollapsibleIconProps
  extends Omit<React.ComponentProps<"svg">, "ref">,
    Pick<VariantProps<typeof collapsibleVariants>, "marker"> {}

/**
 * The disclosure mark. Put it inside `CollapsibleTrigger` (or the Button it wraps): it turns on
 * that trigger's state. `marker` picks the glyph and its turn: `caret` (default) for a panel that
 * opens below, `branch` for a nested list (the Tree and Sidebar mark), `plus` for a FAQ-style row.
 */
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
