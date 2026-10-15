"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { CheckCircle } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { morphBox, useMorphBox } from "@/lib/morph"
import { tv, type VariantProps } from "@/lib/tv"
import { hitY } from "@/lib/hit-area"

export const tabsVariants = tv({
  slots: {
    root: "flex flex-col gap-2 data-[orientation=vertical]:flex-row data-[orientation=vertical]:gap-8",
    list: [
      "relative inline-flex max-w-full self-start items-center overflow-x-auto overflow-y-hidden scroll-fade-x",
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
      "data-[orientation=vertical]:overflow-visible data-[orientation=vertical]:[mask-image:none]",
    ],
    trigger: [
      "group/tabs-trigger relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap",
      "data-[orientation=vertical]:justify-start data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:text-left",
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
        list: "inline-grid grid-flow-col auto-cols-fr gap-0 bg-muted dark:bg-foreground/6 data-[orientation=vertical]:grid-flow-row",
        trigger: [
          "h-7 px-3",
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
        indicator: "rounded-full bg-brand",
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
  },
  compoundVariants: [
    { variant: "pill", density: "comfortable", className: { list: "rounded-pill p-1", trigger: "rounded-pill", indicator: "rounded-pill" } },
    { variant: "pill", density: "compact", className: { list: "rounded-pill p-0.5", trigger: "rounded-pill", indicator: "rounded-pill" } },
    { variant: "segmented", density: "comfortable", className: { list: "rounded-[calc(var(--radius-sm)+var(--spacing))] p-1", trigger: "rounded-sm", indicator: "rounded-sm" } },
    { variant: "segmented", density: "compact", className: { list: "rounded-[calc(var(--radius-sm)+var(--spacing)*0.5)] p-0.5", trigger: "rounded-sm", indicator: "rounded-sm" } },
    {
      variant: ["pill", "folder", "segmented"],
      className: {
        trigger: [
          "data-[orientation=horizontal]:has-[>[data-slot=badge]:last-child]:pe-0.75",
          "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:my-0.75 data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:self-stretch data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:py-0",
        ],
      },
    },
    { variant: "pill", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-pill" } },
    { variant: "segmented", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--radius-sm)-var(--spacing)*0.75)]" } },
    { variant: "folder", density: "comfortable", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--radius-md)-var(--spacing)*0.75)]" } },
    { variant: "folder", density: "compact", className: { trigger: "data-[orientation=horizontal]:[&>[data-slot=badge]:last-child]:rounded-[calc(var(--radius-sm)-var(--spacing)*0.75)]" } },
    { variant: "line", className: { trigger: "rounded-none" } },
    { variant: "folder", density: "comfortable", className: { trigger: "rounded-md" } },
    { variant: "folder", density: "compact", className: { trigger: "rounded-sm" } },
    {
      variant: "pill",
      className: {
        list: "data-[orientation=vertical]:gap-0.5 data-[orientation=vertical]:rounded-none data-[orientation=vertical]:bg-transparent data-[orientation=vertical]:p-0 dark:data-[orientation=vertical]:bg-transparent",
        trigger: "data-[orientation=vertical]:h-auto data-[orientation=vertical]:rounded-lg data-[orientation=vertical]:px-3 data-[orientation=vertical]:py-2.5",
        indicator: "[[data-orientation=vertical]_&]:rounded-lg",
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

export function Tabs({ className, variant: variantProp, density, orientation, ...props }: TabsProps) {
  const variant = variantProp ?? (orientation === "vertical" ? "pill" : "segmented")
  const slots = tabsVariants({ variant, density: useDensity(density) })
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
        className={cn(
          slots.indicator(),
          ready ? "opacity-100" : "opacity-0",
          animate &&
            "transition-[transform,width,height] duration-base ease-out motion-reduce:transition-none",
        )}
        style={style}
      />
      {children}
    </TabsPrimitive.List>
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
