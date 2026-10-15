import * as React from "react"
import { Slot } from "radix-ui"
import { X } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { readableInk, tint } from "./color"

export const badgeVariants = tv({
  base: [
    "inline-flex items-center justify-center shrink-0 whitespace-nowrap",
    "rounded-md border border-transparent font-medium",
    "tabular-nums",
    "transition duration-fast ease-out",
  ],
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border-border text-foreground",
      success: "bg-success/10 text-success-strong",
      warning: "bg-warning/10 text-warning-strong",
      info: "bg-info/10 text-info-strong",
      destructive: "bg-destructive/10 text-destructive-strong",
      purple: "bg-purple/10 text-purple",
      pink: "bg-pink/10 text-pink",
      teal: "bg-teal/10 text-teal",
      orange: "bg-orange/10 text-orange",
      overlay: "border-white/15 bg-black/45 text-white",
      overlayLight: "border-white/25 bg-white/15 text-white backdrop-blur-md",    },
    size: {
      sm: "gap-1 px-1.5 py-0.5 text-xs [&>svg]:size-3",
      md: "gap-1.5 px-2 py-1 text-xs [&>svg]:size-3.5",
      lg: "gap-1.5 px-2.5 py-1 text-sm [&>svg]:size-4",
    },
    pill: {
      true: "rounded-full",
    },
    dot: {
      true: "",
    },
    paint: {
      soft: [
        "bg-(color:--badge-tint) text-(color:--badge-color)",
        "supports-[color:color-mix(in_oklab,red,red)]:text-[color-mix(in_oklab,var(--badge-color),var(--foreground)_40%)]",
      ],
      solid: "bg-(color:--badge-color)",
      outline: "border-(color:--badge-color)",
    },
    ink: {
      dark: "text-neutral-950",
      light: "text-white",
    },
  },
  compoundVariants: [
    {
      dot: true,
      variant: ["default", "primary", "secondary", "success", "warning", "info", "destructive", "purple", "pink", "teal", "orange"],
      class: "border-border bg-transparent [&>[data-slot=badge-label]]:text-foreground",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface BadgeProps
  extends React.ComponentProps<"span">,
    Omit<VariantProps<typeof badgeVariants>, "paint" | "ink"> {
  asChild?: boolean
  dot?: boolean
  onRemove?: () => void
  removeLabel?: string
  color?: string
}

type BadgePaint = "soft" | "solid" | "outline"

const SOLID = new Set(["primary", "secondary"])
const OWN_FILL = new Set(["overlay", "overlayLight"])

function paintFor(variant: BadgeProps["variant"], dot: boolean): BadgePaint | undefined {
  const v = variant ?? "default"
  if (OWN_FILL.has(v)) return undefined
  if (dot) return "soft"
  if (SOLID.has(v)) return "solid"
  if (v === "outline") return "outline"
  return "soft"
}

export function Badge({
  className,
  variant,
  size,
  pill,
  asChild = false,
  dot,
  onRemove,
  removeLabel = "Remove",
  color,
  style,
  children,
  ...props
}: BadgeProps) {
  const paint = color ? paintFor(variant, !!dot) : undefined
  const ink = paint === "solid" && color ? readableInk(color) : undefined
  const classes = badgeVariants({ variant, size, pill, dot: !!dot, paint, ink, className })
  const colorStyle = color
    ? ({ "--badge-color": color, "--badge-tint": tint(color, 0.12), ...style } as React.CSSProperties)
    : style
  const colorProps = color ? { "data-color": "", "data-ink": ink } : {}
  const dotSlot = dot !== undefined

  if (asChild) {
    return (
      <Slot.Root data-slot="badge" className={classes} style={colorStyle} {...colorProps} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <span data-slot="badge" className={classes} style={colorStyle} {...colorProps} {...props}>
      {dotSlot && (
        <span
          aria-hidden
          data-slot="badge-dot"
          className={cn(
            "h-1.5 shrink-0 rounded-full",
            color ? "bg-(color:--badge-color)" : "bg-current",
            "transition-[width,margin,scale,opacity] duration-base ease-out motion-reduce:transition-none",
            dot ? "w-1.5" : ["w-0 scale-0 opacity-0", size === "sm" ? "-me-1" : "-me-1.5"],
          )}
        />
      )}
      {dotSlot ? (
        <span data-slot="badge-label" className="transition-colors duration-fast ease-out">
          {children}
        </span>
      ) : (
        children
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className={cn(
            "relative -mr-0.5 grid size-3.5 shrink-0 place-items-center rounded-full",
            "text-current/60 transition-colors duration-fast ease-out",
            "hover:bg-current/15 hover:text-current",
            "outline-none focus-visible:ring-2 focus-visible:ring-current/40",
            "before:absolute before:-inset-1 before:content-['']",
            "[&>svg]:size-3 [&>svg]:pointer-events-none",
          )}
        >
          <X weight="bold" />
        </button>
      )}
    </span>
  )
}
