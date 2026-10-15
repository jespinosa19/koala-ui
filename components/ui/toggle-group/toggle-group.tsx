"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitY } from "@/lib/hit-area"
import { toggleItemBase } from "@/components/ui/toggle"
import { Tooltip, type TooltipProps } from "@/components/ui/tooltip/tooltip"

declare const process: { env: { NODE_ENV?: string } }

const hitX = hitY

export const toggleGroupVariants = tv({
  slots: {
    root: "group/toggle-group inline-flex items-center gap-2",
    thumb: "pointer-events-none absolute left-0 top-0 z-0",
    thumbSurface: [
      "block size-full rounded-[inherit] bg-background shadow-sm ring-1 ring-border dark:bg-foreground/10",
      "transition-[scale] duration-fast ease-out motion-reduce:transition-none",
      "group-has-[[data-state=on]:active]/toggle-group:scale-[0.96]",
    ],
    item: [
      ...toggleItemBase,
      "transition duration-fast ease-out active:scale-[0.96]",
    ],
  },
  variants: {
    variant: {
      outline: {},
      segmented: {
        root: "relative gap-0.5 bg-muted dark:bg-foreground/6",
        item: [
          "z-10 border-transparent bg-transparent",
          "data-[state=off]:hover:bg-transparent data-[state=off]:hover:text-foreground",
          "data-[state=on]:border-transparent data-[state=on]:font-medium data-[state=on]:text-foreground",
          "data-[state=on]:ring-0 data-[state=on]:ring-border",
          "group-data-[thumb=off]/toggle-group:data-[state=on]:bg-background",
          "dark:group-data-[thumb=off]/toggle-group:data-[state=on]:bg-foreground/10",
          "group-data-[thumb=off]/toggle-group:data-[state=on]:shadow-sm",
          "group-data-[thumb=off]/toggle-group:data-[state=on]:ring-1",
        ],
      },
      ghost: {
        item: [
          "border-transparent bg-transparent text-foreground",
          "underline decoration-transparent decoration-[1.5px] underline-offset-[6px]",
          "data-[state=on]:border-transparent data-[state=on]:font-medium data-[state=on]:ring-0 data-[state=on]:decoration-foreground",
        ],
      },
    },
    size: {
      sm: { item: `h-8 px-2.5 text-sm ${hitX}` },
      md: { item: "h-10 px-3.5 text-sm" },
    },
    iconOnly: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    { size: "sm", iconOnly: true, className: { item: "w-8 px-0" } },
    { size: "md", iconOnly: true, className: { item: "w-10 px-0 [&_svg:not([class*='size-'])]:size-5" } },
    { variant: "segmented", size: "sm", className: { root: "rounded-pill p-0.5", item: "rounded-pill", thumb: "rounded-pill" } },
    { variant: "segmented", size: "md", className: { root: "rounded-pill p-1", item: "rounded-pill", thumb: "rounded-pill" } },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
})

type ToggleGroupSlots = ReturnType<typeof toggleGroupVariants>
const [ToggleGroupProvider, useToggleGroupContext] =
  createContext<{ slots: ToggleGroupSlots }>("ToggleGroup")

function useSelectedThumb(rootRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [style, setStyle] = React.useState<React.CSSProperties>()
  const [ready, setReady] = React.useState(false)
  const [animate, setAnimate] = React.useState(false)

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return

    const measure = () => {
      const on = root.querySelectorAll<HTMLElement>('[data-state="on"]')
      if (on.length !== 1) {
        setReady(false)
        return
      }
      const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = on[0]
      setStyle({ transform: `translate(${left}px, ${top}px)`, width, height })
      setReady(true)
    }

    measure()

    const raf = requestAnimationFrame(() => setAnimate(true))

    const ro = new ResizeObserver(measure)
    ro.observe(root)
    for (const child of root.children) ro.observe(child)

    const mo = new MutationObserver(measure)
    mo.observe(root, { attributes: true, attributeFilter: ["data-state"], subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [rootRef, enabled])

  return { style, ready, animate }
}

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  Omit<VariantProps<typeof toggleGroupVariants>, "iconOnly">

export function ToggleGroup({ className, size, variant, children, ref, ...props }: ToggleGroupProps) {
  const slots = toggleGroupVariants({ size, variant })
  const segmented = variant === "segmented"
  const rootRef = React.useRef<HTMLDivElement>(null)
  const { style, ready, animate } = useSelectedThumb(rootRef, segmented)

  return (
    <ToggleGroupProvider slots={slots}>
      <ToggleGroupPrimitive.Root
        ref={(node) => {
          rootRef.current = node
          if (typeof ref === "function") return ref(node)
          if (ref) ref.current = node
        }}
        data-slot="toggle-group"
        data-thumb={segmented ? (ready ? "on" : "off") : undefined}
        className={slots.root({ className })}
        {...props}
      >
        {segmented && (
          <span
            aria-hidden
            data-slot="toggle-group-indicator"
            className={cn(
              slots.thumb(),
              ready ? "opacity-100" : "opacity-0",
              animate &&
                "transition-[transform,width,height,opacity] duration-base ease-out motion-reduce:transition-none",
            )}
            style={style}
          >
            <span className={slots.thumbSurface()} />
          </span>
        )}
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupProvider>
  )
}

export interface ToggleGroupItemProps extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {
  iconOnly?: boolean
  tooltip?: React.ReactNode | false
  tooltipPlacement?: TooltipProps["placement"]
}

export function ToggleGroupItem({
  className,
  iconOnly = false,
  tooltip,
  tooltipPlacement,
  ...props
}: ToggleGroupItemProps) {
  const { slots } = useToggleGroupContext("ToggleGroupItem")

  const ariaLabel = props["aria-label"]
  const ariaLabelledby = props["aria-labelledby"]
  const name =
    ariaLabel ?? (iconOnly && !ariaLabelledby && typeof tooltip === "string" ? tooltip : undefined)

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && iconOnly && !name && !ariaLabelledby) {
      console.warn(
        "ToggleGroupItem: an `iconOnly` item has no accessible name. Pass `aria-label` (or a " +
          "string `tooltip`) so assistive tech can announce it.",
      )
    }
  }, [iconOnly, name, ariaLabelledby])

  const item = (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={slots.item({ iconOnly, className })}
      {...props}
      aria-label={name}
    />
  )

  const tooltipContent = tooltip === false ? null : (tooltip ?? (iconOnly ? ariaLabel : undefined))
  if (tooltipContent) {
    return (
      <Tooltip auto content={tooltipContent} placement={tooltipPlacement ?? "top"}>
        {item}
      </Tooltip>
    )
  }
  return item
}
