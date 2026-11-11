"use client"

import * as React from "react"
import { Slot, Tabs as TabsPrimitive } from "radix-ui"
import { CheckCircle } from "koala-icons"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { morphBox, useMorphBox } from "@/lib/morph"
import { tv, type VariantProps } from "@/lib/tv"
import { hitY } from "@/lib/hit-area"

export const tabsVariants = tv({
  slots: {
    root: "flex flex-col gap-2 data-[orientation=vertical]:gap-3 sm:data-[orientation=vertical]:flex-row sm:data-[orientation=vertical]:gap-8",
    list: [
      "relative inline-flex max-w-full self-start items-center overflow-x-auto overflow-y-hidden scroll-fade-x",
      "sm:data-[orientation=vertical]:flex-col sm:data-[orientation=vertical]:items-stretch",
      "sm:data-[orientation=vertical]:overflow-visible sm:data-[orientation=vertical]:[mask-image:none]",
    ],
    trigger: [
      "group/tabs-trigger relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap",
      "data-[orientation=vertical]:justify-start sm:data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:text-left",
      "h-7 px-2.5 text-sm",
      "font-medium tracking-tight text-muted-foreground hover:text-foreground",
      "transition-colors duration-fast ease-out",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-foreground",
      hitY,
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    content: [
      "min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
      "duration-base ease-out",
    ],
    panels: "[&>[data-slot=tabs-content]]:ring-inset [&>[data-slot=tabs-content]]:ring-offset-0",
    indicator: "pointer-events-none absolute left-0 top-0 z-0",
    triggerIcon: "inline-grid shrink-0 place-items-center",
    label: "inline-flex",
    labelInner: "",
    labelText: "",
    triggerIconIdle: [
      "col-start-1 row-start-1 flex transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none",
      "group-data-[state=active]/tabs-trigger:scale-25 group-data-[state=active]/tabs-trigger:opacity-0 group-data-[state=active]/tabs-trigger:blur-xs",
    ],
    triggerIconActive: [
      "col-start-1 row-start-1 flex transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none",
      "scale-25 opacity-0 blur-xs",
      "group-data-[state=active]/tabs-trigger:scale-100 group-data-[state=active]/tabs-trigger:opacity-100 group-data-[state=active]/tabs-trigger:blur-none",
    ],
  },
  variants: {
    variant: {
      pill: {
        list: "gap-1 bg-muted dark:bg-foreground/6",
        indicator: [
          "bg-background dark:bg-foreground/10 shadow-sm ring-1 ring-border",
          "[[data-orientation=vertical]_&]:bg-muted dark:[[data-orientation=vertical]_&]:bg-foreground/8",
          "[[data-orientation=vertical]_&]:shadow-none [[data-orientation=vertical]_&]:ring-0",
        ],
      },
      segmented: {
        list: "inline-grid grid-flow-col auto-cols-[minmax(max-content,1fr)] gap-0 bg-muted dark:bg-foreground/6 data-[orientation=vertical]:grid-flow-row",
        trigger: [
          "px-3",
          "after:absolute after:inset-y-1.5 after:left-0 after:w-px after:bg-border after:content-['']",
          "after:transition-opacity after:duration-fast after:ease-out",
          "data-[state=active]:after:opacity-0 [[data-state=active]+&]:after:opacity-0",
          "[[data-slot=tabs-indicator]+&]:after:hidden data-[orientation=vertical]:after:hidden",
        ],
        indicator: "bg-background dark:bg-foreground/10 shadow-sm ring-1 ring-border",
      },
      folder: {
        list: "gap-1 border-b border-border pb-2.5",
        trigger: "data-[state=active]:bg-muted",
        indicator: "rounded-full bg-primary",
      },
      line: {
        list: "gap-1 border-b border-border pb-2.5",
        indicator: "rounded-full bg-primary",
      },
      chip: {
        list: "gap-2 py-1",
        trigger: [
          "h-9 rounded-pill border border-border px-3 text-base text-foreground shadow-xs has-[>svg]:pl-2.5 has-[>[data-slot=tabs-trigger-icon]]:pl-2.5",
          "bg-[var(--surface,var(--background))]",
          "hover:border-foreground/20 hover:text-foreground data-[state=active]:bg-muted",
          "[&_svg]:size-5 [&_svg]:text-muted-foreground data-[state=active]:[&_svg]:text-foreground",
        ],
        indicator: "hidden",
      },
    },
    density: {
      comfortable: {},
      compact: {},
    },
    collapse: {
      true: {
        trigger: [
          "gap-0 rounded-sm after:hidden",
          "transition-[background-color,box-shadow,color] duration-base ease-out",
          "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border",
          "dark:data-[state=active]:bg-foreground/10",
        ],
        list: "inline-flex",
        indicator: "hidden",
        label: [
          "grid grid-cols-[1fr] opacity-100",
          "transition-[grid-template-columns,opacity] duration-base ease-drawer",
          "group-data-[state=inactive]/tabs-trigger:grid-cols-[0fr] group-data-[state=inactive]/tabs-trigger:opacity-0",
          "motion-reduce:transition-[opacity] motion-reduce:duration-fast motion-reduce:ease-linear",
        ],
        labelInner: "min-w-0 overflow-hidden",
        labelText: "block ps-1.5",
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: ["pill", "segmented"],
      className: { list: "[--button-corner:var(--radius-md)]", trigger: "h-[calc(var(--spacing-control-sm)-0.25rem)] rounded-[var(--button-radius,var(--button-corner))]", indicator: "rounded-[var(--button-radius,var(--button-corner))]" },
    },
    { variant: ["pill", "segmented"], density: "comfortable", className: { list: "rounded-[calc(var(--button-radius,var(--button-corner))+var(--spacing))] p-1" } },
    { variant: ["pill", "segmented"], density: "compact", className: { list: "rounded-[calc(var(--button-radius,var(--button-corner))+var(--spacing)*0.5)] p-0.5" } },
    {
      variant: ["pill", "folder", "segmented"],
      className: {
        trigger: [
          "data-[orientation=horizontal]:has-[>[data-slot=badge]:last-child]:pe-0.75",
          "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:my-0.75 data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:self-stretch data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:py-0 data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:h-auto",
        ],
      },
    },
    { variant: ["pill", "segmented"], className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--button-radius,var(--button-corner))-var(--spacing)*0.75)]" } },
    { variant: "folder", density: "comfortable", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--radius-md)-var(--spacing)*0.75)]" } },
    { variant: "folder", density: "compact", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--radius-sm)-var(--spacing)*0.75)]" } },
    { variant: "line", className: { trigger: "rounded-none" } },
    { variant: "folder", density: "comfortable", className: { trigger: "rounded-md" } },
    { variant: "folder", density: "compact", className: { trigger: "rounded-sm" } },
    {
      variant: "pill",
      className: {
        list: "data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:rounded-none data-[orientation=vertical]:bg-transparent data-[orientation=vertical]:p-0 dark:data-[orientation=vertical]:bg-transparent",
        trigger: "data-[orientation=vertical]:h-auto data-[orientation=vertical]:min-h-control-sm data-[orientation=vertical]:rounded-md data-[orientation=vertical]:px-2.5 data-[orientation=vertical]:py-1.5",
        indicator: "[[data-orientation=vertical]_&]:rounded-md",
      },
    },
  ],
  defaultVariants: {
    variant: "segmented",
    density: "compact",
  },
})

type TabsSlots = ReturnType<typeof tabsVariants>
type TabsVariant = NonNullable<VariantProps<typeof tabsVariants>["variant"]>

const [TabsProvider, useTabsContext] = createContext<{
  slots: TabsSlots
  variant: TabsVariant
}>("Tabs")

function useActiveIndicator(
  listRef: React.RefObject<HTMLElement | null>,
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
        const cs = getComputedStyle(active)
        const padL = parseFloat(cs.paddingLeft) || 0
        const padR = parseFloat(cs.paddingRight) || 0
        next = { transform: `translateX(${left + padL}px)`, top: "auto", bottom: 0, width: width - padL - padR, height: 2 }
      } else if (variant === "folder") {
        next = { transform: `translateX(${left}px)`, top: "auto", bottom: 0, width, height: 2 }
      } else {
        next = { transform: `translate(${left}px, ${top}px)`, width, height }
      }
      setStyle(next)
      setReady(true)
    }

    measure()

    const raf = requestAnimationFrame(() => setAnimate(true))

    const ro = new ResizeObserver(measure)
    ro.observe(list)
    for (const child of list.children) ro.observe(child)

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

export function Tabs({ className, variant: variantProp, density, collapse, orientation, ...props }: TabsProps) {
  const variant = variantProp ?? (orientation === "vertical" ? "pill" : "segmented")
  const slots = tabsVariants({ variant, density: useDensity(density), collapse })
  return (
    <TabsProvider slots={slots} variant={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        orientation={orientation}
        className={slots.root({ className })}
        {...props}
      />
    </TabsProvider>
  )
}

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { slots, variant } = useTabsContext("Tabs.List")
  const listRef = React.useRef<HTMLDivElement>(null)
  const indicator = useActiveIndicator(listRef, variant)

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={slots.list({ className })}
      {...props}
    >
      <TabsIndicator slots={slots} {...indicator} />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsIndicator({ slots, style, ready, animate }: { slots: TabsSlots } & ReturnType<typeof useActiveIndicator>) {
  return (
    <span
      aria-hidden
      data-slot="tabs-indicator"
      className={cn(
        slots.indicator(),
        ready ? "opacity-100" : "opacity-0",
        animate && "transition-[transform,width,height] duration-base ease-out motion-reduce:transition-none",
      )}
      style={style}
    />
  )
}

function useRevealActive(listRef: React.RefObject<HTMLElement | null>) {
  const shown = React.useRef<Element | null>(null)

  React.useLayoutEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[data-state="active"]')
    if (!list || !active || active === shown.current) return
    const first = shown.current === null
    shown.current = active
    const start = active.offsetLeft
    const end = start + active.offsetWidth
    if (start >= list.scrollLeft && end <= list.scrollLeft + list.clientWidth) return
    list.scrollTo({ left: start - (list.clientWidth - active.offsetWidth) / 2, behavior: first ? "instant" : "smooth" })
  })
}

export interface TabNavProps
  extends React.ComponentProps<"nav">,
    Pick<VariantProps<typeof tabsVariants>, "variant" | "density"> {}

export function TabNav({ className, variant, density, ref, children, ...props }: TabNavProps) {
  const resolved = variant ?? "line"
  const slots = tabsVariants({ variant: resolved, density: useDensity(density) })
  const listRef = React.useRef<HTMLElement | null>(null)
  const indicator = useActiveIndicator(listRef, resolved)
  useRevealActive(listRef)

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      listRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  return (
    <TabsProvider slots={slots} variant={resolved}>
      <nav ref={setRef} data-slot="tab-nav" data-orientation="horizontal" className={slots.list({ className })} {...props}>
        <TabsIndicator slots={slots} {...indicator} />
        {children}
      </nav>
    </TabsProvider>
  )
}

export interface TabNavLinkProps extends React.ComponentProps<"a"> {
  active?: boolean
  asChild?: boolean
}

export function TabNavLink({ className, active = false, asChild = false, ...props }: TabNavLinkProps) {
  const { slots } = useTabsContext("TabNavLink")
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="tab-nav-link"
      data-state={active ? "active" : "inactive"}
      data-orientation="horizontal"
      aria-current={active ? "page" : undefined}
      className={slots.trigger({ className })}
      {...props}
    />
  )
}

export interface TabsTriggerProps
  extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  static?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TabsTrigger({ className, static: _static, ...props }: TabsTriggerProps) {
  const { slots } = useTabsContext("Tabs.Trigger")
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={slots.trigger({ className })}
      {...props}
    />
  )
}

export interface TabsTriggerIconProps extends Omit<React.ComponentProps<"span">, "children"> {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

export function TabsTriggerIcon({
  icon,
  activeIcon = <CheckCircle weight="fill" />,
  className,
  ...props
}: TabsTriggerIconProps) {
  const { slots } = useTabsContext("TabsTriggerIcon")
  return (
    <span data-slot="tabs-trigger-icon" aria-hidden className={slots.triggerIcon({ className })} {...props}>
      <span data-slot="tabs-trigger-icon-idle" className={slots.triggerIconIdle()}>
        {icon}
      </span>
      <span data-slot="tabs-trigger-icon-active" className={slots.triggerIconActive()}>
        {activeIcon}
      </span>
    </span>
  )
}

export function TabsTriggerLabel({ className, children, ...props }: React.ComponentProps<"span">) {
  const { slots } = useTabsContext("TabsTriggerLabel")
  return (
    <span data-slot="tabs-trigger-label" className={slots.label({ className })} {...props}>
      <span className={slots.labelInner()}>
        <span className={slots.labelText()}>{children}</span>
      </span>
    </span>
  )
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const { slots } = useTabsContext("TabsContent")
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={slots.content({ className })} {...props} />
  )
}

export function TabsPanels({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTabsContext("TabsPanels")
  const { ref, style, ready, viewportClassName } = useMorphBox<HTMLDivElement>("height")

  return (
    <div
      data-slot="tabs-panels"
      data-morph-ready={ready ? "" : undefined}
      style={style}
      className={cn(morphBox, slots.panels({ className }))}
      {...props}
    >
      <div ref={ref} className={viewportClassName}>
        {children}
      </div>
    </div>
  )
}
