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
    // Across the bar, or down a `NavigationMenuSub` rail, where the triggers stack full width.
    list: "flex list-none items-center gap-0.5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
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
      // Down a `NavigationMenuSub` rail the trigger is a panel row: full width on the row's 8px
      // inset, the row's fill in every theme, a muted caret turned toward the pane it opens (it
      // points, it doesn't flip), and no hit-area extender, which would let stacked rows steal
      // each other's pointer. Keyed on the Sub's orientation, so a bar trigger never matches.
      "group-data-[orientation=vertical]/navigation-menu-sub:w-full group-data-[orientation=vertical]/navigation-menu-sub:justify-between group-data-[orientation=vertical]/navigation-menu-sub:px-2 group-data-[orientation=vertical]/navigation-menu-sub:before:hidden",
      "group-data-[orientation=vertical]/navigation-menu-sub:dark:hover:bg-accent group-data-[orientation=vertical]/navigation-menu-sub:dark:data-[state=open]:bg-accent",
      // Focus keeps its ring (the fill already means "this pane is showing"), drawn inside the row:
      // an offset ring would take the page's colour and run into the panel's clipped edge.
      "group-data-[orientation=vertical]/navigation-menu-sub:focus-visible:ring-inset group-data-[orientation=vertical]/navigation-menu-sub:focus-visible:ring-offset-0",
      "group-data-[orientation=vertical]/navigation-menu-sub:[&_svg]:-rotate-90 group-data-[orientation=vertical]/navigation-menu-sub:[&[data-state=open]_svg]:-rotate-90 group-data-[orientation=vertical]/navigation-menu-sub:[&_svg]:text-muted-foreground",
    ],
    // A row inside a panel. The DropdownMenuItem shape on the same ladder (panel rounded-lg 16,
    // p-1 4, row rounded-md 12, 12px edge inset), so the two menus read as one family.
    link: [
      "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground no-underline outline-none",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent focus-visible:bg-accent data-active:bg-accent",
      // The leading icon only (a direct child): a glyph inside a `NavigationMenuLinkIcon` tile
      // takes the tile's size and colour.
      "[&>svg]:text-muted-foreground [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-5",
      // A described row pins its icon to the title line: the 20px icon and the 20px title line
      // share a box, so top alignment is also optical alignment.
      "has-[[data-slot=navigation-menu-link-description]]:items-start",
      // A 32px tile is an object of its own, near the two lines' height: it centres on them.
      "has-[[data-slot=navigation-menu-link-icon]]:has-[[data-slot=navigation-menu-link-description]]:items-center",
    ],
    linkText: "flex min-w-0 flex-col gap-0.5",
    linkDescription: "text-sm font-normal text-pretty text-muted-foreground",
    // A 32px tile for a row's leading glyph, where a bare icon won't do: a brand logo that has to
    // keep its own colours (a bare svg in a row is muted), or a set of icons that should read as
    // apps. Ring, no fill, so the row's hover shows through it.
    linkIcon:
      "flex size-8 shrink-0 items-center justify-center rounded-sm text-foreground ring-1 ring-inset ring-border [&>svg:not([class*='size-'])]:size-4",
    // The picture on a `card` link: 4px in from the card (rounded-md 12 − 4 = rounded-sm 8), a
    // ratio of its own, a muted fill while it loads, and CardMedia's ::after outline painted OVER
    // the image, since a ring on the img itself paints under the picture.
    linkMedia: [
      "relative block aspect-video w-full overflow-hidden rounded-sm bg-muted",
      "[&>img]:size-full [&>img]:object-cover",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
    ],
    // A labelled column in a wide panel. `role="group"` like DropdownMenuGroup; the label is
    // DropdownMenuLabel's small muted line on the row's 8px inset, so it sits over the titles.
    group: "flex min-w-0 flex-col",
    groupLabel: "px-2 text-xs font-medium text-muted-foreground",
    // The panel's foot: the "see everything" row under a hairline that stops at the panel's ring
    // (DropdownMenuSeparator's -mx-0.75, handed back as padding). With nothing above it, no rule.
    footer: [
      "-mx-0.75 flex items-center justify-between gap-2 border-t border-border px-0.75",
      "first:mt-0 first:border-t-0 first:pt-0",
    ],
    // A menu inside a panel: a rail of triggers beside a pane that switches as the pointer moves
    // down the rail. The pane is its own viewport, sized from the active content like the panel.
    // No transition on it: the panel already eases to the new height, and two eased boxes, one
    // inside the other, lag each other.
    sub: "group/navigation-menu-sub flex gap-1 data-[orientation=horizontal]:flex-col",
    subViewport:
      "relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) shrink-0 overflow-hidden",
    // The tip that slides under the active trigger. Radix writes its `width` and `transform`
    // inline on every switch; the transition is what turns that jump into a slide. It paints
    // above the panel (z-60 over the viewport's z-50) so its popover fill covers the panel's top
    // edge where they meet, and the tip reads as part of the panel rather than a loose chip.
    indicator: [
      // The tip belongs to the shared panel; without one, each panel already sits under its trigger.
      // The clip is the panel's `mt-2` gap plus its 1px ring, so the tip's sides stop ON the
      // panel's border line: one row shallower and the border shows through the tip's base, one
      // row deeper and its sides run past the line into the panel.
      "top-full z-60 flex h-[calc(--spacing(2)+1px)] items-end justify-center overflow-hidden group-data-[viewport=false]/navigation-menu:hidden",
      "transition-[width,transform] duration-base ease-out",
      // Never tw-animate's animate-in/out here: those keyframes animate `transform`, the property
      // Radix positions the tip with (see --animate-indicator-in in globals.css).
      "data-[state=visible]:animate-indicator-in data-[state=hidden]:animate-indicator-out",
    ],
    // A rotated square, centred on the clip line so only its top half shows. The ring is INSET,
    // like the panel's: an outer ring falls on the page behind the gap and comes out a different
    // grey from the panel's border it continues. A 2px tip at the default knob; `xs` would turn
    // a 10px square into a round bump.
    indicatorArrow:
      "size-2.5 translate-y-1/2 rotate-45 rounded-tl-[calc(var(--radius-xs)*0.4)] bg-popover ring-1 ring-inset ring-border [--surface:var(--popover)]",
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
      // A pane beside a vertical Sub rail: flush, since the panel's p-1 already insets it, and the
      // switch travels along the rail, so the pane rises (moving down the rail) or drops (moving
      // up) 8px instead of sliding sideways. The x reset outranks the sideways slides above.
      "group-data-[orientation=vertical]/navigation-menu-sub:p-0",
      "group-data-[orientation=vertical]/navigation-menu-sub:data-[motion]:[--tw-enter-translate-x:0px] group-data-[orientation=vertical]/navigation-menu-sub:data-[motion]:[--tw-exit-translate-x:0px]",
      "group-data-[orientation=vertical]/navigation-menu-sub:data-[motion=from-start]:slide-in-from-top-2 group-data-[orientation=vertical]/navigation-menu-sub:data-[motion=from-end]:slide-in-from-bottom-2",
      "group-data-[orientation=vertical]/navigation-menu-sub:data-[motion=to-start]:slide-out-to-top-2 group-data-[orientation=vertical]/navigation-menu-sub:data-[motion=to-end]:slide-out-to-bottom-2",
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
    // Density tunes row heights and the rhythm around them (DropdownMenu's label and separator
    // steps). The panel padding is the ladder rung and stays put.
    density: {
      comfortable: {
        link: "py-2",
        groupLabel: "py-1.5",
        footer: "mt-1.5 pt-1.5",
      },
      compact: {
        link: "py-1.5",
        // A rail trigger matches the 32px compact row beside it; the bar trigger never changes.
        trigger: "group-data-[orientation=vertical]/navigation-menu-sub:h-8",
        groupLabel: "py-1",
        footer: "mt-1 pt-1",
      },
    },
    // Where a link sits: a `row` inside a panel; `bar`, a plain entry in the list beside the
    // triggers, which takes the trigger's chip so the row of entries reads as one set; or `card`,
    // a featured block with a `NavigationMenuLinkMedia` picture over its title and description.
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
      // The picture sits 4px in, the text 8px in (4 + the text's px-1), on the rows' text line.
      card: {
        link: [
          "flex-col items-stretch gap-2 p-1 pb-2",
          "has-[[data-slot=navigation-menu-link-description]]:items-stretch",
          "[&>[data-slot=navigation-menu-link-text]]:px-1",
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
  const slots = navigationMenuVariants({ density: useDensity() })
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
 * A row inside `NavigationMenuContent`; with `variant="bar"` a plain entry in the list beside the
 * triggers; with `variant="card"` a featured block (a `NavigationMenuLinkMedia` over its text).
 * Radix's `Link` wires arrow-key focus, `data-active` (pass `active` for the current page) and
 * "close the panel on select", which a plain `<a>` would not.
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

/**
 * A ringed 32px tile for a row's leading glyph, in place of a bare icon: a brand logo keeps its
 * own colours in it, and a set of icons reads as apps. Decorative, so hidden from assistive tech.
 */
export function NavigationMenuLinkIcon({ className, ...props }: React.ComponentProps<"span">) {
  const slots = navigationMenuVariants()
  return <span data-slot="navigation-menu-link-icon" aria-hidden className={slots.linkIcon({ className })} {...props} />
}

/** The picture of a `variant="card"` link: an `<img>` inside an inset, ratioed, outlined frame. */
export function NavigationMenuLinkMedia({ className, ...props }: React.ComponentProps<"span">) {
  const slots = navigationMenuVariants()
  return <span data-slot="navigation-menu-link-media" className={slots.linkMedia({ className })} {...props} />
}

/**
 * A labelled column in a wide panel: a `NavigationMenuGroupLabel` over its links. Set the columns
 * side by side with a grid on the content's wrapper.
 */
export function NavigationMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  const slots = navigationMenuVariants()
  return <div role="group" data-slot="navigation-menu-group" className={slots.group({ className })} {...props} />
}

/** The small muted heading over a group's links. */
export function NavigationMenuGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const slots = navigationMenuVariants({ density: useDensity() })
  return <div data-slot="navigation-menu-group-label" className={slots.groupLabel({ className })} {...props} />
}

/** The panel's foot, under a hairline: the "see everything" link, and a second one on the right. */
export function NavigationMenuFooter({ className, ...props }: React.ComponentProps<"div">) {
  const slots = navigationMenuVariants({ density: useDensity() })
  return <div data-slot="navigation-menu-footer" className={slots.footer({ className })} {...props} />
}

export type NavigationMenuSubProps = React.ComponentProps<typeof NavigationMenuPrimitive.Sub>

/**
 * A menu inside a panel: a rail of triggers (a `NavigationMenuList` of items, each with its
 * `NavigationMenuContent`) and, after it, a `NavigationMenuSubViewport` the active pane shows in.
 * The pane switches as the pointer moves down the rail, with no delay. Vertical by default; pass
 * `defaultValue` so a pane is showing the moment the panel opens.
 */
export function NavigationMenuSub({ className, orientation = "vertical", ...props }: NavigationMenuSubProps) {
  const slots = navigationMenuVariants()
  return (
    <NavigationMenuPrimitive.Sub
      data-slot="navigation-menu-sub"
      orientation={orientation}
      className={slots.sub({ className })}
      {...props}
    />
  )
}

/** Where a `NavigationMenuSub`'s active pane shows, sized to it. Place it after the rail. */
export function NavigationMenuSubViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  const slots = navigationMenuVariants()
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-sub-viewport"
      className={slots.subViewport({ className })}
      {...props}
    />
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
