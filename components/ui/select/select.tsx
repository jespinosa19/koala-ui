"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { CaretDown, Check } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity, useControlSize } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"
import { Tooltip, type TooltipProps } from "@/components/ui/tooltip"

export const selectVariants = tv({
  slots: {
    trigger: [
      "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-pill border border-input",
      "bg-[var(--surface,var(--background))] px-3.5 text-sm pointer-coarse:text-base font-medium text-left text-foreground shadow-xs",
      "transition-[border-color,box-shadow,scale] duration-fast ease-out",
      "hover:border-ring/50",
      "outline-none focus-visible:border-brand focus-visible:brand-ring",
      "active:scale-[0.99]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:destructive-ring aria-[invalid=true]:data-[state=open]:destructive-ring",
      "data-[placeholder]:font-normal data-[placeholder]:text-muted-foreground",
      "[&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-2 [&>span]:truncate",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
      "[&>span_svg]:text-muted-foreground",
      "[&>svg]:text-muted-foreground",
    ],
    chevron: [
      "size-4 shrink-0 text-muted-foreground",
      "caret-turn-fast",
      "group-data-[state=open]:rotate-180",
    ],
    content: [
      "relative z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden",
      "rounded-lg border border-border bg-popover text-popover-foreground shadow-lg [--surface:var(--popover)]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[side=bottom]:slide-out-to-top-2 data-[side=top]:slide-out-to-bottom-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
    item: [
      "relative flex w-full cursor-pointer select-none items-center gap-2 pl-2 pr-7",
      "text-sm font-medium outline-none",
      "transition-colors duration-fast ease-out",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
      "[&>span:last-child]:flex [&>span:last-child]:min-w-0 [&>span:last-child]:items-center [&>span:last-child]:gap-2",
      "[&>span:last-child_svg]:text-muted-foreground",
    ],
    itemText: "flex min-w-0 items-center gap-2",
    itemIndicator: "absolute right-2 flex size-4 items-center justify-center text-brand",
    label: "px-2 font-medium text-muted-foreground",
    separator: "-mx-0.75 h-px bg-border",
    scrollButton: "absolute inset-x-0 z-10 flex h-7 cursor-pointer items-center justify-center text-muted-foreground",

    searchValue: "flex min-w-0 flex-1 items-center gap-2 truncate text-left",
    search: "shrink-0 p-1",
    list: [
      "group/select-search-list p-1",
      "max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))]",
      "overflow-y-auto overscroll-contain scroll-fade scroll-py-10",
    ],
    empty: "px-3 py-6 text-center text-sm text-muted-foreground group-has-[[data-slot=select-search-item]]/select-search-list:hidden",
  },
  variants: {
    size: {
      sm: { trigger: "h-8 px-3" },
      md: { trigger: "h-9" },
      lg: { trigger: "h-10 px-4 text-sm pointer-coarse:text-base" },
    },
    panel: {
      floating: { trigger: "data-[state=open]:border-brand data-[state=open]:brand-ring" },
      inline: {},
    },
    density: {
      comfortable: {
        item: "py-2 rounded-md",
        label: "py-1.5 text-xs",
        separator: "my-1.5",
      },
      compact: {
        item: "py-1.5 rounded-md",
        label: "py-1 text-xs",
        separator: "my-1",
      },
    },
  },
  defaultVariants: { size: "md", density: "comfortable", panel: "floating" },
})

const viewportPadding: Record<"comfortable" | "compact", string> = {
  comfortable: "p-1",
  compact: "p-1",
}

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

type SelectVariantProps = VariantProps<typeof selectVariants>

export interface SelectTriggerProps
  extends React.ComponentProps<typeof SelectPrimitive.Trigger>,
    Pick<SelectVariantProps, "size" | "density"> {}

export function SelectTrigger({
  className,
  children,
  size,
  density,
  id,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectTriggerProps) {
  const slots = selectVariants({ size: useControlSize(size, density) })
  const field = useFieldContext()
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      id={id ?? field?.id}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={field?.hasError || undefined}
      className={slots.trigger({ className })}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown weight="bold" className={slots.chevron()} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export interface SelectContentProps
  extends React.ComponentProps<typeof SelectPrimitive.Content>,
    Pick<SelectVariantProps, "density"> {}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 6,
  density,
  ...props
}: SelectContentProps) {
  const d = useDensity(density)
  const slots = selectVariants({ density: d })
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={slots.content({
          className: cn(
            position === "popper" && "max-h-[min(20rem,var(--radix-select-content-available-height,20rem))]",
            className,
          ),
        })}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className={slots.scrollButton({ className: "top-0" })}>
          <CaretDown weight="bold" className="size-4 rotate-180" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "scroll-fade scroll-py-10",
            viewportPadding[d],
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className={slots.scrollButton({ className: "bottom-0" })}>
          <CaretDown weight="bold" className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item>,
    Pick<SelectVariantProps, "density"> {
  tooltip?: React.ReactNode
  tooltipPlacement?: TooltipProps["placement"]
}

export function SelectItem({
  className,
  children,
  density,
  tooltip,
  tooltipPlacement = "right",
  ...props
}: SelectItemProps) {
  const slots = selectVariants({ density: useDensity(density) })
  const item = (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={slots.item({ className })}
      {...props}
    >
      <span className={slots.itemIndicator()}>
        <SelectPrimitive.ItemIndicator>
          <Check weight="bold" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className={slots.itemText()}>
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )

  if (!tooltip) return item

  return (
    <Tooltip auto content={tooltip} placement={tooltipPlacement} offset={[0, 8]}>
      {item}
    </Tooltip>
  )
}

export function SelectLabel({
  className,
  density,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label> & Pick<SelectVariantProps, "density">) {
  const slots = selectVariants({ density: useDensity(density) })
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={slots.label({ className })}
      {...props}
    />
  )
}

export function SelectSeparator({
  className,
  density,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator> & Pick<SelectVariantProps, "density">) {
  const slots = selectVariants({ density: useDensity(density) })
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}
