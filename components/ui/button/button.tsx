"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { CircleNotch } from "@phosphor-icons/react"

import { useControlSize, type Density } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { Tooltip, type TooltipProps } from "@/components/ui/tooltip/tooltip"

/**
 * Button: the reference single-element component. Pattern: one `tv` recipe, Radix
 * `Slot` for `asChild`, semantic tokens only, `className` merged last. See
 * docs/ARCHITECTURE.md.
 *
 * `"use client"` because Button reads the density context (lib/density.tsx) so a compact
 * app shell tightens its buttons with no per-instance props.
 */
// polish: where a size's visual height drops below the 40px hit
// target, a transparent pseudo-element extends the click area without changing the visual
// or overlapping a horizontally-adjacent control. `hitX` extends vertically only (text
// buttons keep their full width); `hitBox` extends a square icon-only button on both axes.
const hitX =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']"
const hitBox =
  "relative before:absolute before:inset-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"

export const buttonVariants = tv({
  base: [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    // Specific transition (never `transition: all`, #14); `transition` covers colors + scale.
    "transition duration-fast ease-out",
    // polish: tactile scale-on-press. Disable via the `static` prop.
    "active:scale-[0.96]",
    "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    // Icons: default to a 1rem box unless the consumer sets their own `size-*`; never shrink
    // or swallow clicks.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  variants: {
    variant: {
      // The primary action carries the brand accent (--brand): every CTA across the library
      // (dialogs, forms, marketing) is brand-colored without per-call-site changes. White label
      // holds AA on the deep/saturated accent across all four themes (see globals.css). The focus
      // ring is already brand (base), so a primary button reads as a brand halo on focus.
      primary: "bg-brand text-white shadow-xs hover:bg-brand/90",
      secondary:
        "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      // `bg-transparent` (not `bg-background`) so the button blends with whatever surface
      // it sits on, whether page, card, or popover. With `bg-background` it rendered as a darker
      // filled rectangle on lighter surfaces (card/popover in dark themes).
      outline:
        "border border-border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/40",
      // Quiet destructive: a chrome-less ghost in the destructive hue. Red icon/label at rest,
      // a soft red tint on hover (never a full fill) - the low-emphasis delete affordance for a
      // remove-line trash in a list/cart, where a solid `destructive` button would shout.
      destructiveGhost:
        "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/40",
      link: "text-primary underline-offset-4 hover:underline",
    },
    // Three sizes: sm 32px, md 36px, lg 40px; label stays text-sm across
    // the scale. Horizontal padding tracks the height rhythm in lockstep: the heights step
    // 32→36→40 (+4 each), so the padding steps px-3→px-4→px-5 (12→16→20, +4 each) to match.
    // lg was px-6 (24px), which overshot the cadence by 4px a side and read chunky next to a
    // 40px height (a short CTA like "Book a demo" looked wider than its label warranted); px-5
    // keeps lg substantial without the extra width. Polish (optical over geometric): an icon
    // reads lighter than a text edge, so a button carrying a direct `<svg>` trims its
    // horizontal padding one step (`has-[>svg]:px-*`) to stay optically balanced.
    // Padding scale: px-3/2.5 (sm), px-4/3 (md), px-5/4 (lg).
    size: {
      sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
      md: "h-9 px-4 py-2 has-[>svg]:px-3",
      lg: "h-10 px-5 has-[>svg]:px-4",
    },
    // Icon-only collapses the button to a square (width tracks height) and drops the
    // label padding/gap so the glyph optically centers. The squares live in
    // compoundVariants since the dimension depends on the active size.
    iconOnly: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    // Icon-only: collapse to a square that tracks the size's height (sm 32 · md 36 · lg 40),
    // zeroing label padding/gap so the glyph optically centers. `has-[>svg]:px-0` overrides the
    // size's icon-padding step (an icon-only button always has a direct svg, so it would
    // otherwise inherit px-2.5/3/4). sm is under the 40px hit target, so it also carries a
    // centered box extender.
    { size: "sm", iconOnly: true, className: `w-8 gap-0 px-0 has-[>svg]:px-0 ${hitBox}` },
    { size: "md", iconOnly: true, className: "w-9 gap-0 px-0 has-[>svg]:px-0" },
    { size: "lg", iconOnly: true, className: "w-10 gap-0 px-0 has-[>svg]:px-0" },

    // sm text (32px) is under the 40px hit target, so it gets a vertical-only hit extender.
    { size: "sm", iconOnly: false, className: hitX },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    iconOnly: false,
  },
})

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /**
   * Spacing tier. Height comes from `size`, not density; this only sets the DEFAULT `size`
   * when none is given (compact → "sm", comfortable → "md"). Resolves prop > DensityProvider >
   * "compact". An explicit `size` always wins.
   */
  density?: Density
  /** Render the child element as the button (Radix Slot), merging styles onto it. */
  asChild?: boolean
  /** Disable the tactile scale-on-press, e.g. where motion would distract. */
  static?: boolean
  /**
   * Show a spinner and mark the button busy (`aria-busy`) while an action is in flight.
   * The label is hidden but its space is reserved, so the button never reflows; the
   * button is also disabled so it can't be re-triggered. Ignored with `asChild` (the
   * rendered child owns its content). @default false
   */
  loading?: boolean
  /**
   * Tooltip content for icon-only buttons. Defaults to `aria-label` when `iconOnly` is true.
   * Pass `false` to opt out (e.g. when wrapping with `<Tooltip>` explicitly for custom content).
   */
  tooltip?: React.ReactNode | false
  /** Tooltip placement. Only applies when `iconOnly` is true. @default "top" */
  tooltipPlacement?: TooltipProps["placement"]
}

export function Button({
  className,
  variant,
  size,
  iconOnly,
  density,
  asChild = false,
  static: isStatic = false,
  loading = false,
  tooltip,
  tooltipPlacement,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  // `loading` only drives the spinner overlay on a native button. With `asChild`, Slot
  // expects a single child, so a sibling spinner would break it; the child owns its content.
  const isLoading = loading && !asChild

  // a11y guard: an icon-only button has no visible text, so it needs an explicit accessible
  // name. Warn in development when one is missing (skipped for `asChild`, where the rendered
  // child owns its own labelling). Stripped from production builds.
  const ariaLabel = props["aria-label"]
  const ariaLabelledby = props["aria-labelledby"]
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      iconOnly &&
      !asChild &&
      !ariaLabel &&
      !ariaLabelledby
    ) {
      console.warn(
        "Button: an `iconOnly` button has no accessible name. Pass `aria-label` " +
          "(or `aria-labelledby`) so assistive tech can announce it.",
      )
    }
  }, [iconOnly, asChild, ariaLabel, ariaLabelledby])

  const button = (
    <Comp
      data-slot="button"
      // While loading the button is busy and non-interactive (disabled also neutralizes the
      // press scale and hover via the base `disabled:` rules). `isLoading` is false under
      // `asChild`, so this forwards a plain `disabled` there exactly as before.
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      data-loading={isLoading || undefined}
      className={buttonVariants({
        variant,
        // Height comes from `size`; density only picks the DEFAULT size when none is given
        // (compact → sm, comfortable → md). An explicit `size` always wins.
        size: useControlSize(size, density),
        iconOnly,
        // `static` neutralizes the press scale; `relative` anchors the loading spinner.
        // twMerge keeps this last.
        className: cn(isStatic && "active:scale-100", isLoading && "relative", className),
      })}
      {...props}
    >
      {isLoading ? (
        <>
          {/* Centered spinner; inset-0 + m-auto centers the fixed (size-4) glyph. */}
          <CircleNotch weight="bold"
            aria-hidden
            className="absolute inset-0 m-auto animate-spin motion-reduce:animate-none"
          />
          {/* Keep the label's box (visibility, not display) so width never reflows;
              `[gap:inherit]` mirrors the active size's icon/label gap. */}
          <span className="inline-flex items-center [gap:inherit] invisible">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )

  // Auto-wrap icon-only buttons with a Tooltip. Content resolves: explicit `tooltip` prop >
  // `aria-label` > nothing (no wrap). Pass `tooltip={false}` to opt out when you're wrapping
  // with <Tooltip> explicitly (e.g. for rich/interactive content or custom placement).
  const tooltipContent = tooltip === false ? null : (tooltip ?? ariaLabel)
  if (iconOnly && !asChild && tooltipContent) {
    return (
      <Tooltip content={tooltipContent} placement={tooltipPlacement ?? "top"}>
        {button}
      </Tooltip>
    )
  }

  return button
}
