import * as React from "react"
import { Slot } from "radix-ui"
import { X } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Badge: a single-element component (like Button): one `tv` recipe, semantic tokens
 * only, `className` merged last. Status variants (success/warning/info/destructive) are
 * "soft": a tinted background (the status hue at /10) plus a darker, more legible text
 * counterpart (the `-strong` token, see globals.css) and no border, so the fill carries the
 * color and the text stays readable. They re-theme across all four themes. See docs/ARCHITECTURE.md.
 */
export const badgeVariants = tv({
  base: [
    "inline-flex items-center justify-center shrink-0 whitespace-nowrap",
    // Border always present but transparent: it reserves the hairline so the `outline` and
    // `dot` variants can paint a neutral stroke without shifting layout. Tinted (soft)
    // variants keep it transparent: a background fill already carries the color.
    "rounded-md border border-transparent font-medium",
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
    },
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
  },
  compoundVariants: [
    {
      dot: true,
      variant: ["default", "primary", "secondary", "success", "warning", "info", "destructive", "purple", "pink", "teal", "orange"],
      // dot variant: strip the variant fill and tinted border so only the dot carries the
      // color; the hairline falls back to the neutral stroke (like the `outline` variant).
      class: "border-border bg-transparent",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  /** Render the child element as the badge (Radix Slot). Ignores `dot`/`onRemove`. */
  asChild?: boolean
  /** Show a leading status dot in the current text color. */
  dot?: boolean
  /** When set, renders a trailing dismiss button that calls this handler. */
  onRemove?: () => void
  /** Accessible label for the dismiss button. */
  removeLabel?: string
}

export function Badge({
  className,
  variant,
  size,
  pill,
  asChild = false,
  dot = false,
  onRemove,
  removeLabel = "Remove",
  children,
  ...props
}: BadgeProps) {
  const classes = badgeVariants({ variant, size, pill, dot, className })

  // asChild composes the styles onto a consumer element (e.g. a link); the dot/dismiss
  // affordances require our own element, so they're omitted in that mode.
  if (asChild) {
    return (
      <Slot.Root data-slot="badge" className={classes} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <span data-slot="badge" className={classes} {...props}>
      {dot && (
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      )}
      {dot ? (
        <span className="text-foreground">{children}</span>
      ) : (
        children
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          // polish: the visual is small, but `before` extends the
          // hit area beyond the glyph without enlarging the badge.
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
