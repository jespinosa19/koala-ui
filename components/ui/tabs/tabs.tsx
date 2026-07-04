"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Tabs: multi-part component over Radix Tabs. Pattern: one `tv` recipe with `slots`,
 * shared variants flowing to every part through React Context. See docs/ARCHITECTURE.md §2.
 *
 * The active state is drawn by a single **sliding indicator** measured in JS and moved
 * with `transform`: the one detail that makes tabs feel alive (polish:
 * interruptible transitions, skip-animation-on-load).
 */
export const tabsVariants = tv({
  slots: {
    root: "flex flex-col gap-2",
    // Responsive: when the row of tabs is wider than its container it scrolls on the main axis
    // instead of overflowing the page (the classic mobile break). `max-w-full` caps the inline-flex
    // at the container so the overflow lands *inside* the list; `overflow-y-hidden` keeps it a single
    // row; `scroll-fade-x` fades the edge you can still scroll toward - the canonical segmented-bar
    // cue (globals.css), and the only affordance left once scrollbars are hidden site-wide. Inert
    // when the tabs fit: edges stay crisp and nothing scrolls, so wide layouts are unchanged.
    list: "relative inline-flex max-w-full self-start items-center overflow-x-auto overflow-y-hidden scroll-fade-x",
    trigger: [
      // `relative z-10` keeps the label above the indicator that slides behind it.
      "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap",
      // One tight size: 14px label in a 28px-tall trigger with snug 10px sides.
      "h-7 px-2.5 text-sm",
      // `tracking-tight` crisps the label; inactive tabs answer hover so the control feels alive.
      "font-medium tracking-tight text-muted-foreground hover:text-foreground",
      // Specific transition (never `transition: all`); `transition` covers colors + scale.
      "transition duration-fast ease-out",
      // polish: tactile scale-on-press. Disable via the `static` prop.
      "active:scale-[0.96]",
      // Inset (not offset) focus ring: the list is a scroll box (see the `list` slot), which clips
      // on both axes, so an offset ring would be trimmed at the top/bottom edge. Drawn inside the
      // trigger, the ring stays whole in every variant/density, scroll or not.
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
      "disabled:pointer-events-none disabled:opacity-50",
      // Active label is full ink; the indicator behind it does the lifting.
      "data-[state=active]:text-foreground",
      // polish: ≥40px hit area without growing the visual.
      // Vertical-only, so it never overlaps a horizontally-adjacent trigger.
      "before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    // Radix unmounts the inactive panel and mounts the active one fresh, so the new panel
    // appears at its end state: a CSS transition wouldn't fire, but a tw-animate-css animation
    // runs on mount. Cross-fade + a 4px rise on activate, riding the same motion tokens as the
    // sliding indicator, so switching tabs reads as one gesture instead of a snap.
    content: [
      "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
      "duration-base ease-out",
    ],
    // Positioned/sized by JS (see useActiveIndicator); transition added once ready.
    indicator: "pointer-events-none absolute left-0 top-0 z-0",
  },
  variants: {
    variant: {
      // Active pill floats off the track: a hairline ring draws a crisp 1px edge and
      // `shadow-sm` lifts it (the "shadow as border" stack), so the segment reads sharp
      // instead of melting into the muted track. Both are theme tokens, so it adapts.
      pill: {
        list: "gap-1 bg-muted dark:bg-card",
        indicator: "bg-background dark:bg-muted shadow-sm ring-1 ring-border",
      },
      // Active trigger shows a pill background (CSS fade) + a sliding bar on the bottom rule.
      // `pb-1.5` opens the gap that separates the pill from the colored indicator below it.
      folder: {
        list: "gap-1 border-b border-border pb-2.5",
        trigger: "data-[state=active]:bg-muted",
        indicator: "rounded-full bg-primary",
      },
      // Folder geometry (bar on the bottom rule, gap below) but no pill container: the
      // only active affordance is a single bar in the accent color, keyed off `--brand`
      // so it follows whatever accent is active (see globals.css §accent).
      line: {
        list: "gap-1 border-b border-border pb-2.5",
        indicator: "rounded-full bg-brand",
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For Tabs it
    // tightens the pill chrome (container padding + concentric radii); the trigger keeps
    // its single height/text tier. Geometry lives in compoundVariants below.
    density: {
      comfortable: {},
      compact: {},
    },
  },
  compoundVariants: [
    // polish: concentric radius. inner = outer − padding. Kept tight/sharp: a small
    // corner reads crisper than a pillowy one, and still nests concentrically.
    // pill·comfortable: list rounded-lg(16) + p-1(4) → trigger/indicator rounded-md(12).
    { variant: "pill", density: "comfortable", className: { list: "rounded-lg p-1", trigger: "rounded-md", indicator: "rounded-md" } },
    // pill·compact: list rounded-md(12) + p-0.5(2) → trigger/indicator rounded-sm(8).
    { variant: "pill", density: "compact", className: { list: "rounded-md p-0.5", trigger: "rounded-sm", indicator: "rounded-sm" } },
    // Line triggers are square; the moving accent bar is the only active affordance.
    { variant: "line", className: { trigger: "rounded-none" } },
    // Folder: concentric radius on active trigger background (outer list has no padding container).
    { variant: "folder", density: "comfortable", className: { trigger: "rounded-md" } },
    { variant: "folder", density: "compact", className: { trigger: "rounded-sm" } },
  ],
  defaultVariants: {
    variant: "pill",
    density: "compact",
  },
})

type TabsSlots = ReturnType<typeof tabsVariants>
type TabsVariant = NonNullable<VariantProps<typeof tabsVariants>["variant"]>

const [TabsProvider, useTabsContext] = createContext<{
  slots: TabsSlots
  variant: TabsVariant
}>("Tabs")

/**
 * Tracks the active trigger's box and returns the indicator's transform/size. Re-measures
 * on selection change (data-state mutation), on resize, and on font/layout shifts, never
 * polls. `ready` gates visibility so the indicator never paints at the origin; `animate`
 * turns the transition on one frame *after* the first placement, so it snaps into position
 * on load and only slides on later selection changes (polish).
 */
function useActiveIndicator(
  listRef: React.RefObject<HTMLDivElement | null>,
  variant: TabsVariant,
) {
  const [style, setStyle] = React.useState<React.CSSProperties>()
  const [ready, setReady] = React.useState(false)
  const [animate, setAnimate] = React.useState(false)

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]')
      if (!active) {
        setReady(false)
        return
      }
      const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = active
      let next: React.CSSProperties
      if (variant === "line") {
        // Bar sits on the bottom rule like folder, but inset to the trigger's content box
        // (padding removed) so it underlines the *label*, not the full padded hit area;
        // otherwise it spills left of the first tab's text and reads misaligned.
        const cs = getComputedStyle(active)
        const padL = parseFloat(cs.paddingLeft) || 0
        const padR = parseFloat(cs.paddingRight) || 0
        next = { transform: `translate(${left + padL}px, ${list.clientHeight - 1}px)`, width: width - padL - padR, height: 2 }
      } else if (variant === "folder") {
        // Bar sits on the list's bottom rule, in the gap below the active pill, so the
        // pill background never covers it (no z-index fight with the trigger).
        next = { transform: `translate(${left}px, ${list.clientHeight - 1}px)`, width, height: 2 }
      } else {
        next = { transform: `translate(${left}px, ${top}px)`, width, height }
      }
      setStyle(next)
      setReady(true)
    }

    measure()

    // Enable the slide only after the first placement has painted, so loading the
    // component never animates the bar in from the origin.
    const raf = requestAnimationFrame(() => setAnimate(true))

    // Width/position can change without a selection change (resize, late-loading fonts).
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    for (const child of list.children) ro.observe(child)

    // Radix flips `data-state` on the triggers when the value changes; watch that.
    const mo = new MutationObserver(measure)
    mo.observe(list, { attributes: true, attributeFilter: ["data-state"], subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [listRef, variant])

  return { style, ready, animate }
}

export interface TabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsVariants> {}

export function Tabs({ className, variant, density, ...props }: TabsProps) {
  const slots = tabsVariants({ variant, density: useDensity(density) })
  return (
    <TabsProvider slots={slots} variant={variant ?? "pill"}>
      <TabsPrimitive.Root data-slot="tabs" className={slots.root({ className })} {...props} />
    </TabsProvider>
  )
}

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { slots, variant } = useTabsContext("Tabs.List")
  const listRef = React.useRef<HTMLDivElement>(null)
  const { style, ready, animate } = useActiveIndicator(listRef, variant)

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={slots.list({ className })}
      {...props}
    >
      <span
        aria-hidden
        data-slot="tabs-indicator"
        // Interruptible transition (CSS, named properties, never `transition: all`);
        // hidden until the first measure, and the transition only switches on after that
        // placement has painted, so it never slides in from the origin on load.
        className={cn(
          slots.indicator(),
          ready ? "opacity-100" : "opacity-0",
          animate && "transition-[transform,width,height] duration-base ease-out",
        )}
        style={style}
      />
      {children}
    </TabsPrimitive.List>
  )
}

export interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Disable the tactile scale-on-press, e.g. where motion would distract. */
  static?: boolean
}

export function TabsTrigger({ className, static: isStatic = false, ...props }: TabsTriggerProps) {
  const { slots } = useTabsContext("Tabs.Trigger")
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={slots.trigger({ className: cn(isStatic && "active:scale-100", className) })}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const { slots } = useTabsContext("TabsContent")
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={slots.content({ className })} {...props} />
  )
}
