"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { CaretDown } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { DensityProvider, useDensity, type Density } from "@/lib/density"
import { hitY } from "@/lib/hit-area"

/**
 * NavigationMenu: a Radix-backed bar menu that opens ON HOVER and shares ONE floating viewport
 * across every item, so moving the pointer from one trigger to another resizes the SAME panel
 * and slides its contents instead of closing one popover and opening another. A click-triggered
 * `DropdownMenu` on a `NavbarLink` is the pick for a single menu; this is for several triggers in
 * a row that should read as one continuous surface.
 *
 * Radix owns the hover choreography: a trigger opens after `delayDuration` (200ms), and a sibling
 * trigger reached within `skipDelayDuration` (300ms) opens at once. Nothing here hand-rolls it.
 */
export const navigationMenuVariants = tv({
  slots: {
    root: "group/navigation-menu relative flex max-w-max items-center",
    list: "flex list-none items-center gap-0.5",
    // Positioned only without a shared viewport, to anchor each panel under its own trigger. Never
    // by default: Radix places the indicator from the trigger's `offsetLeft`, and a positioned item
    // becomes its offsetParent, which reads 0 for every trigger and pins the tip to the first one.
    item: "group-data-[viewport=false]/navigation-menu:relative",
    // The NavbarLink `pill` chip, so a trigger sits flush beside plain bar links.
    trigger: [
      "group/navigation-menu-trigger inline-flex h-9 w-max cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-medium text-foreground outline-none",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent dark:hover:bg-foreground/8",
      "data-[state=open]:bg-accent dark:data-[state=open]:bg-foreground/8",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // The caret turns, never crossfades (the disclosure convention, see globals.css).
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:caret-turn-fast [&[data-state=open]_svg]:rotate-180",
      hitY,
    ],
    // A row inside a panel. The DropdownMenuItem shape on the same ladder (panel rounded-lg 16,
    // p-1 4, row rounded-md 12, 12px edge inset), so the two menus read as one family.
    link: [
      "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground no-underline outline-none",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent focus-visible:bg-accent data-active:bg-accent",
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
      // A described row pins its icon to the title line: the 20px icon and the 20px title line
      // share a box, so top alignment is also optical alignment.
      "has-[[data-slot=navigation-menu-link-description]]:items-start",
    ],
    linkText: "flex min-w-0 flex-col gap-0.5",
    linkDescription: "text-sm font-normal text-pretty text-muted-foreground",
    // The tip that slides under the active trigger. Radix writes its `width` and `transform`
    // inline on every switch; the transition is what turns that jump into a slide. It paints
    // above the panel (z-60 over the viewport's z-50) so its popover fill covers the panel's top
    // edge where they meet, and the tip reads as part of the panel rather than a loose chip.
    indicator: [
      // The tip belongs to the shared panel; without one, each panel already sits under its trigger.
      "top-full z-60 flex h-2.5 items-end justify-center overflow-hidden group-data-[viewport=false]/navigation-menu:hidden",
      "transition-[width,transform] duration-base ease-out",
      "data-[state=visible]:animate-in data-[state=visible]:fade-in-0",
      "data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0",
    ],
    indicatorArrow: "relative top-1/2 size-2.5 rotate-45 rounded-tl-xs bg-popover ring-1 ring-border [--surface:var(--popover)]",
    // Start-aligned with the menu and sized to the panel. A `w-full` + centered wrapper tied the
    // panel to the width of the trigger row, which a short row (one trigger) squeezed it into.
    viewportWrapper: "absolute start-0 top-full isolate z-50 flex",
    // The one surface every content mounts into. Radix measures the active content and writes
    // its size to the two vars; `transition-[width,height]` eases between panels of different
    // sizes. `shrink-0`: an `overflow-hidden` flex item may otherwise shrink below that size.
    viewport: [
      "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) shrink-0",
      "overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "transition-[width,height] duration-base ease-out",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
    ],
    // One panel's contents. `absolute` is load-bearing: every content renders as a child of the
    // viewport, whose own size is measured FROM the content, so an in-flow content would size to
    // the viewport and feed that back; and two in-flow contents (the one leaving, the one
    // arriving) would stack instead of crossing. `p-1` is the ladder rung, fixed across density.
    content: [
      "absolute start-0 top-0 p-1",
      "data-[motion=from-start]:animate-in data-[motion=from-start]:fade-in-0 data-[motion=from-start]:slide-in-from-left-12",
      "data-[motion=from-end]:animate-in data-[motion=from-end]:fade-in-0 data-[motion=from-end]:slide-in-from-right-12",
      "data-[motion=to-start]:animate-out data-[motion=to-start]:fade-out-0 data-[motion=to-start]:slide-out-to-left-12",
      "data-[motion=to-end]:animate-out data-[motion=to-end]:fade-out-0 data-[motion=to-end]:slide-out-to-right-12",
      "duration-base ease-out",
      // No shared viewport (`viewport={false}`): each content is its own panel under its trigger.
      "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:z-50 group-data-[viewport=false]/navigation-menu:mt-2",
      "group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground",
      "group-data-[viewport=false]/navigation-menu:shadow-lg group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-inset group-data-[viewport=false]/navigation-menu:ring-border",
      "group-data-[viewport=false]/navigation-menu:[--surface:var(--popover)]",
      "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:slide-in-from-top-2",
      "group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:slide-out-to-top-2",
    ],
  },
  variants: {
    // Density tunes the row height only. The panel padding is the ladder rung and stays put.
    density: {
      comfortable: { link: "py-2" },
      compact: { link: "py-1.5" },
    },
    // Where a link sits: a `row` inside a panel, or `bar`, a plain entry in the list beside the
    // triggers, which takes the trigger's chip so the row of entries reads as one set.
    variant: {
      row: {},
      bar: {
        link: [
          "inline-flex h-9 w-max justify-center whitespace-nowrap px-3",
          "dark:hover:bg-foreground/8 dark:data-active:bg-foreground/8",
          "focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          hitY,
        ],
      },
    },
  },
  defaultVariants: { density: "compact", variant: "row" },
})

type NavigationMenuVariants = VariantProps<typeof navigationMenuVariants>

export interface NavigationMenuProps extends React.ComponentProps<typeof NavigationMenuPrimitive.Root> {
  /**
   * Render the shared floating panel every `NavigationMenuContent` mounts into, which is what
   * makes switching triggers fluid. With `false`, each content opens as its own panel under its
   * trigger (or place a `NavigationMenuViewport` yourself).
   * @default true
   */
  viewport?: boolean
  /** Row height for every link in the menu. @default inherited from `DensityProvider`, else compact */
  density?: Density
}

export function NavigationMenu({ className, children, viewport = true, density, ...props }: NavigationMenuProps) {
  const slots = navigationMenuVariants()
  const body = (
    <>
      {children}
      {viewport && <NavigationMenuViewport />}
    </>
  )
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={slots.root({ className })}
      {...props}
    >
      {density ? <DensityProvider density={density}>{body}</DensityProvider> : body}
    </NavigationMenuPrimitive.Root>
  )
}

export function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const slots = navigationMenuVariants()
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={slots.list({ className })} {...props} />
}

export function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  const slots = navigationMenuVariants()
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={slots.item({ className })} {...props} />
}

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  const slots = navigationMenuVariants()
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={slots.trigger({ className })} {...props}>
      {children}
      <CaretDown weight="bold" aria-hidden />
    </NavigationMenuPrimitive.Trigger>
  )
}

export type NavigationMenuContentProps = React.ComponentProps<typeof NavigationMenuPrimitive.Content>

export function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  const slots = navigationMenuVariants()
  return (
    <NavigationMenuPrimitive.Content data-slot="navigation-menu-content" className={slots.content({ className })} {...props} />
  )
}

export interface NavigationMenuLinkProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Link>,
    Pick<NavigationMenuVariants, "density" | "variant"> {}

/**
 * A row inside `NavigationMenuContent`, or with `variant="bar"` a plain entry in the list beside
 * the triggers. Radix's `Link` wires arrow-key focus, `data-active` (pass `active` for the current
 * page) and "close the panel on select", which a plain `<a>` would not.
 */
export function NavigationMenuLink({ className, density, variant, ...props }: NavigationMenuLinkProps) {
  const slots = navigationMenuVariants({ density: useDensity(density), variant })
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" className={slots.link({ className })} {...props} />
}

/** Title + description column of a described row, after the leading icon. Both are optional. */
export function NavigationMenuLinkText({ className, ...props }: React.ComponentProps<"span">) {
  const slots = navigationMenuVariants()
  return <span data-slot="navigation-menu-link-text" className={slots.linkText({ className })} {...props} />
}

/** The muted sentence under a row's title. Place it inside `NavigationMenuLinkText`. */
export function NavigationMenuLinkDescription({ className, ...props }: React.ComponentProps<"span">) {
  const slots = navigationMenuVariants()
  return (
    <span data-slot="navigation-menu-link-description" className={slots.linkDescription({ className })} {...props} />
  )
}

/** The tip that tracks the active trigger. Optional: drop it as the list's last child. */
export function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  const slots = navigationMenuVariants()
  return (
    <NavigationMenuPrimitive.Indicator data-slot="navigation-menu-indicator" className={slots.indicator({ className })} {...props}>
      <div className={slots.indicatorArrow()} />
    </NavigationMenuPrimitive.Indicator>
  )
}

/** The shared floating panel. `NavigationMenu` renders one unless `viewport={false}`. */
export function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  const slots = navigationMenuVariants()
  return (
    <div className={slots.viewportWrapper()}>
      <NavigationMenuPrimitive.Viewport data-slot="navigation-menu-viewport" className={slots.viewport({ className })} {...props} />
    </div>
  )
}
