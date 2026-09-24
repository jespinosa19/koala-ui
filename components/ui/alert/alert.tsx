"use client"

import * as React from "react"
import { CheckCircle, Warning, XCircle, Info, X } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Alert: inline status banner. Use for page-level messages, validation
 * summaries, or contextual feedback. For ephemeral toasts, prefer Toast.
 *
 * polish applied:
 *   #12 – close button uses active:scale-[0.96]
 *   #14 – transition specifies exact properties, never "all"
 *   Concentric radius: rounded-lg root > rounded-md close button.
 */
export const alertVariants = tv({
  slots: {
    root: [
      // The edge is a full-strength `--border` ring (no lift to help it), not a border: it takes
      // no layout (docs/FOUNDATIONS.md, "Shadows over borders"). Each variant sets its color.
      "relative flex w-full items-start rounded-lg ring-1",
      "transition-colors duration-fast ease-out",
    ],
    iconWrap: "mt-px shrink-0",
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "font-semibold leading-snug text-balance text-foreground",
    description: "text-pretty leading-snug text-muted-foreground",
    close: [
      "relative -mr-1 grid shrink-0 place-items-center self-start rounded-md",
      "text-muted-foreground/60",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "active:scale-[0.96]",
      "hover:bg-foreground/5 hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      "[&_svg]:pointer-events-none",
    ],
    actions: "mt-3 flex flex-wrap items-center gap-2",
  },
  variants: {
    variant: {
      default: {
        root: "bg-[var(--surface,var(--background))] ring-border",
        iconWrap: "text-muted-foreground/60",
      },
      success: {
        root: "bg-[var(--surface,var(--background))] ring-border",
        iconWrap: "text-success",
      },
      warning: {
        root: "bg-[var(--surface,var(--background))] ring-border",
        iconWrap: "text-warning",
      },
      destructive: {
        root: "bg-[var(--surface,var(--background))] ring-border",
        iconWrap: "text-destructive",
      },
      info: {
        root: "bg-[var(--surface,var(--background))] ring-border",
        iconWrap: "text-info",
      },
    },
    size: {
      sm: {
        root: "gap-2.5 p-3 text-xs",
        iconWrap: "[&_svg]:size-4",
        title: "text-xs",
        description: "text-xs",
        close: "size-5 [&_svg]:size-3 before:absolute before:-inset-2.5 before:content-['']",
      },
      md: {
        root: "gap-3 p-4 text-sm",
        iconWrap: "[&_svg]:size-[18px]",
        title: "text-sm",
        description: "text-sm",
        close: "size-6 [&_svg]:size-3.5 before:absolute before:-inset-2 before:content-['']",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>
type AlertSlots = ReturnType<typeof alertVariants>

const VARIANT_ICONS: Partial<Record<AlertVariant, React.ElementType>> = {
  default: Info,
  success: CheckCircle,
  warning: Warning,
  destructive: XCircle,
  info: Info,
}

const [AlertProvider, useAlertContext] = createContext<{
  slots: AlertSlots
  variant: AlertVariant
}>("Alert")

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  /** When set, renders a dismiss button that calls this handler. */
  onDismiss?: () => void
  /** Accessible label for the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string
}

export function Alert({
  className,
  variant = "default",
  size,
  onDismiss,
  dismissLabel = "Dismiss",
  children,
  ...props
}: AlertProps) {
  const slots = alertVariants({ variant, size })
  return (
    <AlertProvider slots={slots} variant={variant}>
      <div role="alert" data-slot="alert" className={slots.root({ className })} {...props}>
        {children}
        {onDismiss && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className={slots.close()}
          >
            <X weight="bold" />
          </button>
        )}
      </div>
    </AlertProvider>
  )
}

/**
 * Optional icon area: auto-picks the variant icon when no children are given.
 * Every variant renders a solid badge (weight="fill"); the neutral `default`
 * uses the same filled glyph in muted gray, so color (gray vs the blue `info`
 * badge) is what separates them, not weight.
 */
export function AlertIcon({ children, className, ...props }: React.ComponentProps<"div">) {
  const { slots, variant } = useAlertContext("AlertIcon")
  const Icon = VARIANT_ICONS[variant]
  return (
    <div data-slot="alert-icon" className={slots.iconWrap({ className })} {...props}>
      {children ?? (Icon ? <Icon weight="fill" /> : null)}
    </div>
  )
}

/** Flex-1 wrapper that stacks title, description, and actions vertically. */
export function AlertContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAlertContext("AlertContent")
  return <div data-slot="alert-content" className={slots.content({ className })} {...props} />
}

export function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useAlertContext("AlertTitle")
  return <p data-slot="alert-title" className={slots.title({ className })} {...props} />
}

export function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useAlertContext("AlertDescription")
  return <p data-slot="alert-description" className={slots.description({ className })} {...props} />
}

/** Optional row of action buttons rendered below the description. */
export interface AlertActionsProps extends React.ComponentProps<"div"> {
  /**
   * Control height for the block. An alert's actions are secondary to its message, so they stay on the small tier. Imposed on the children (see lib/density.tsx) so each
   * control need not carry a `size`; an explicit one still wins. @default "sm"
   */
  size?: ControlSize
}

export function AlertActions({ className, size = "sm", children, ...props }: AlertActionsProps) {
  const { slots } = useAlertContext("AlertActions")
  return (
    <div
      data-slot="alert-actions"
      data-control-size={size}
      className={slots.actions({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}
