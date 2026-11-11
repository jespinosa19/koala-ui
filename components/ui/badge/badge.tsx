import * as React from "react"
import { Slot } from "radix-ui"
import { X } from "koala-icons"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { readableInk, tint } from "./color"

type BadgeVariant = "default" | "primary" | "secondary" | "outline" | "success" | "warning" | "info" | "destructive" | "purple" | "pink" | "teal" | "orange" | "overlay" | "overlayLight"

const TONED: BadgeVariant[] = ["default", "primary", "secondary", "outline", "success", "warning", "info", "destructive", "purple", "pink", "teal", "orange"]
const HUED: BadgeVariant[] = ["success", "warning", "info", "destructive", "purple", "pink", "teal", "orange"]

export const badgeVariants = tv({
  base: [
    "inline-flex items-center justify-center shrink-0 whitespace-nowrap",
    "rounded-[var(--badge-corner)] border border-transparent font-medium leading-none",
    "tabular-nums",
    "transition-[color,background-color,border-color,box-shadow] duration-fast ease-out",
    "[&>svg]:shrink-0 [&>svg]:pointer-events-none",
    "[&>[data-slot=badge-avatar]:first-child]:-ms-1 [&>[data-slot=flag]:first-child]:-ms-0.5",
    "[&:is(a[href],button)]:cursor-pointer [&:is(a[href],button)]:outline-none",
    "[&:is(a[href],button)]:focus-visible:ring-2 [&:is(a[href],button)]:focus-visible:ring-brand [&:is(a[href],button)]:focus-visible:ring-offset-2 [&:is(a[href],button)]:focus-visible:ring-offset-[var(--surface,var(--background))]",
    "[&:is(a[href],button)>svg:last-child]:transition-transform [&:is(a[href],button)>svg:last-child]:duration-fast [&:is(a[href],button)>svg:last-child]:ease-out",
    "[&:is(a[href],button):hover>svg:last-child]:translate-x-0.5",
  ],
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground [--badge-tone:var(--muted-foreground)]",
      primary: "bg-primary text-primary-foreground [--badge-tone:var(--primary)]",
      secondary: "bg-secondary text-secondary-foreground [--badge-tone:var(--secondary-foreground)]",
      outline: "border-input text-foreground [--badge-tone:var(--muted-foreground)]",
      success: "text-(--badge-ink) [--badge-tone:var(--success)] [--badge-ink:var(--success-strong)] [--badge-solid:var(--success-solid)]",
      warning: "text-(--badge-ink) [--badge-tone:var(--warning)] [--badge-ink:var(--warning-strong)] [--badge-solid:var(--warning-solid)]",
      info: "text-(--badge-ink) [--badge-tone:var(--info)] [--badge-ink:var(--info-strong)] [--badge-solid:var(--info-solid)]",
      destructive: "text-(--badge-ink) [--badge-tone:var(--destructive)] [--badge-ink:var(--destructive-strong)] [--badge-solid:var(--destructive-solid)]",
      purple: "text-(--badge-ink) [--badge-tone:var(--purple)] [--badge-ink:var(--purple-strong)] [--badge-solid:var(--purple-solid)]",
      pink: "text-(--badge-ink) [--badge-tone:var(--pink)] [--badge-ink:var(--pink-strong)] [--badge-solid:var(--pink-solid)]",
      teal: "text-(--badge-ink) [--badge-tone:var(--teal)] [--badge-ink:var(--teal-strong)] [--badge-solid:var(--teal-solid)]",
      orange: "text-(--badge-ink) [--badge-tone:var(--orange)] [--badge-ink:var(--orange-strong)] [--badge-solid:var(--orange-solid)]",
      overlay: "border-white/15 bg-black/45 text-white [--badge-tone:white]",
      overlayLight: "border-white/25 bg-white/15 text-white backdrop-blur-md [--badge-tone:white]",
    },
    appearance: {
      soft: "",
      surface: "",
      solid: "",
      modern: "",
    },
    size: {
      sm: [
        "h-5 gap-1 px-1.5 text-xs [--badge-corner:calc(var(--radius)*0.375)] [&>svg:not([class*='size-'])]:size-3 [&>[data-slot=badge-icon]_svg:not([class*='size-'])]:size-3",
        "[&>[data-slot=badge-avatar]]:size-4 [&>[data-slot=flag]]:size-3",
        "[&>[data-slot=badge-count]]:-me-0.75 [&>[data-slot=badge-count]]:h-3.5 [&>[data-slot=badge-count]]:min-w-3.5",
      ],
      md: [
        "h-6 gap-1.5 px-2 text-xs [--badge-corner:var(--radius-sm)] [&>svg:not([class*='size-'])]:size-3.5 [&>[data-slot=badge-icon]_svg:not([class*='size-'])]:size-3.5",
        "[&>[data-slot=badge-avatar]]:size-4.5 [&>[data-slot=flag]]:size-3.5",
        "[&>[data-slot=badge-count]]:-me-1 [&>[data-slot=badge-count]]:h-4 [&>[data-slot=badge-count]]:min-w-4",
      ],
      lg: [
        "h-7 gap-1.5 px-2.5 text-sm [--badge-corner:var(--radius-md)] [&>svg:not([class*='size-'])]:size-4 [&>[data-slot=badge-icon]_svg:not([class*='size-'])]:size-4",
        "[&>[data-slot=badge-avatar]]:size-5 [&>[data-slot=badge-avatar]:first-child]:-ms-1.5 [&>[data-slot=flag]]:size-4",
        "[&>[data-slot=badge-count]]:-me-1.5 [&>[data-slot=badge-count]]:h-5 [&>[data-slot=badge-count]]:min-w-5",
      ],
    },
    pill: {
      true: "[--badge-corner:var(--radius-pill)] rounded-full",
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
    { appearance: ["soft", "surface"], variant: HUED, class: "bg-(--badge-tone)/12 dark:bg-(--badge-tone)/15" },
    { appearance: ["soft", "surface"], variant: "warning", class: "bg-(--badge-tone)/18 dark:bg-(--badge-tone)/15" },
    { appearance: "surface", variant: HUED, class: "border-(--badge-ink)/22 dark:border-(--badge-tone)/25" },
    { appearance: "surface", variant: "default", class: "border-border text-foreground" },
    { appearance: "solid", variant: HUED, class: "bg-(--badge-solid) text-white dark:text-neutral-950" },
    { appearance: "solid", variant: "warning", class: "text-neutral-950" },
    { appearance: "solid", variant: ["default", "outline"], class: "border-transparent bg-foreground text-background" },
    {
      appearance: "modern",
      variant: TONED,
      class: [
        "border-border dark:border-border bg-(--surface,var(--background)) text-foreground shadow-xs",
        "[&>svg]:text-(--badge-tone) [&>[data-slot=badge-icon]]:text-(--badge-tone)",
      ],
    },
    {
      dot: true,
      variant: TONED,
      appearance: ["soft", "surface"],
      class: "border-input dark:border-input bg-transparent dark:bg-transparent [&>[data-slot=badge-label]]:text-foreground",
    },
    { dot: true, size: "sm", class: "ps-1" },
    { dot: true, size: "md", class: "ps-1.5" },
    { dot: true, size: "lg", class: "ps-2" },
    { appearance: ["soft", "surface"], variant: HUED, class: "[&:is(a[href],button)]:hover:bg-(--badge-tone)/22" },
    { appearance: "solid", variant: HUED, class: "[&:is(a[href],button)]:hover:bg-(--badge-solid)/88" },
    { appearance: "soft", variant: "default", class: "[&:is(a[href],button)]:hover:bg-foreground/10" },
    { appearance: "modern", class: "[&:is(a[href],button)]:hover:bg-muted" },
    { dot: true, class: "[&:is(a[href],button)]:hover:bg-muted" },
  ],
  defaultVariants: {
    variant: "default",
    appearance: "soft",
    size: "md",
  },
})

export interface BadgeProps
  extends React.ComponentProps<"span">,
    Omit<VariantProps<typeof badgeVariants>, "paint" | "ink"> {
  asChild?: boolean
  dot?: boolean
  pulse?: boolean
  onRemove?: () => void
  removeLabel?: string
  color?: string
}

type BadgePaint = "soft" | "solid" | "outline"

const SOLID = new Set(["primary", "secondary"])
const OWN_FILL = new Set(["overlay", "overlayLight"])

function paintFor(variant: BadgeProps["variant"], dot: boolean, appearance: BadgeProps["appearance"]): BadgePaint | undefined {
  const v = variant ?? "default"
  if (OWN_FILL.has(v) || appearance === "modern") return undefined
  if (dot) return "soft"
  if (v === "outline") return "outline"
  if (appearance === "solid") return "solid"
  if (SOLID.has(v)) return "solid"
  return "soft"
}

export function Badge({
  className,
  variant,
  appearance,
  size,
  pill,
  asChild = false,
  dot,
  pulse,
  onRemove,
  removeLabel = "Remove",
  color,
  style,
  children,
  ...props
}: BadgeProps) {
  const paint = color ? paintFor(variant, !!dot, appearance) : undefined
  const ink = paint === "solid" && color ? readableInk(color) : undefined
  const classes = badgeVariants({ variant, appearance, size, pill, dot: !!dot, paint, ink, className })
  const colorStyle = color
    ? ({ "--badge-color": color, "--badge-tone": color, "--badge-tint": tint(color, 0.12), ...style } as React.CSSProperties)
    : style
  const colorProps = color ? { "data-color": "", "data-ink": ink } : {}
  const dotSlot = dot !== undefined || pulse !== undefined

  if (asChild) {
    return (
      <Slot.Root data-slot="badge" data-size={size ?? "md"} data-variant={variant ?? "default"} className={classes} style={colorStyle} {...colorProps} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <span data-slot="badge" data-size={size ?? "md"} data-variant={variant ?? "default"} className={classes} style={colorStyle} {...colorProps} {...props}>
      {dotSlot && <BadgeDot on={!!(dot || pulse)} pulse={pulse} size={size} />}
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
            "relative -me-0.5 grid size-3.5 shrink-0 cursor-pointer place-items-center rounded-full",
            "text-current/60 transition-colors duration-fast ease-out",
            "hover:bg-current/15 hover:text-current",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand",
            "before:absolute before:-inset-1 before:content-[''] pointer-coarse:before:-inset-3",
            "[&>svg]:size-3 [&>svg]:pointer-events-none",
          )}
        >
          <X weight="bold" />
        </button>
      )}
    </span>
  )
}

function BadgeDot({ on, pulse, size }: { on: boolean; pulse?: boolean; size: BadgeProps["size"] }) {
  return (
    <span
      aria-hidden
      data-slot="badge-dot"
      className={cn(
        "relative h-1.5 shrink-0 rounded-full bg-(--badge-tone)",
        "transition-[width,margin,scale,opacity] duration-base ease-out motion-reduce:transition-none",
        on ? "w-1.5" : ["w-0 scale-0 opacity-0", size === "sm" ? "-me-1" : "-me-1.5"],
      )}
    >
      {pulse && (
        <span className="absolute inset-0 animate-ping rounded-full bg-(--badge-tone) opacity-60 motion-reduce:hidden" />
      )}
    </span>
  )
}

export interface BadgeAvatarProps extends React.ComponentProps<"img"> {
  alt?: string
}

export function BadgeAvatar({ className, alt = "", ...props }: BadgeAvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="badge-avatar"
      alt={alt}
      className={cn("shrink-0 rounded-[calc(var(--badge-corner)-2px)] object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10", className)}
      {...props}
    />
  )
}

export function BadgeCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge-count"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-[calc(var(--badge-corner)-4px)] bg-current/12 px-1 text-xs leading-none tabular-nums",
        className,
      )}
      {...props}
    />
  )
}
