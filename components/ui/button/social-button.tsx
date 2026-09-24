"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Button, type ButtonProps } from "./button"
import { socialProviders, type SocialProvider } from "./social-logos"

/**
 * SocialButton: an OAuth / "Continue with…" button carrying a real brand logo. It wraps
 * {@link Button}, so it inherits the whole button system for free: sizes, density, the press
 * scale, the loading spinner, the 40px hit area, focus rings, and the icon-only tooltip + a11y
 * guard. SocialButton only adds the brand mark and the two brand appearances. See ARCHITECTURE.md.
 *
 * - `outline` (default): a neutral bordered button with the full-color logo (Google stays
 *   multicolor, GitHub/Apple/X follow the theme). The universal "Continue with X" look.
 * - `solid`: filled with the provider's official color, the logo flattened to white. For a single
 *   dominant choice or a brand-forward row.
 */
export interface SocialButtonProps extends Omit<ButtonProps, "variant" | "children"> {
  /** Which brand to render: selects the logo, label, and brand color. */
  provider: SocialProvider
  /** `outline` (default) or `solid`. @see {@link SocialButton} */
  appearance?: "outline" | "solid"
  /** Replace the default "Continue with {label}" text. Ignored when `iconOnly`. */
  children?: React.ReactNode
}

export function SocialButton({
  provider,
  appearance = "outline",
  iconOnly = false,
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: SocialButtonProps) {
  const { Logo, label, solid } = socialProviders[provider]

  return (
    <Button
      // `outline` is the structural base for both appearances; `solid` overrides its border, bg,
      // and text below (tailwind-merge keeps the last of each conflicting utility).
      variant="outline"
      iconOnly={iconOnly}
      // An icon-only social button has no visible text, so name it for AT (and the auto-tooltip).
      aria-label={iconOnly ? (ariaLabel ?? `Continue with ${label}`) : ariaLabel}
      className={cn(
        appearance === "solid" && [
          solid,
          "border-transparent text-white hover:text-white",
          // Flatten the mark (multicolor or `currentColor`) to white on the brand fill.
          "[&_path]:fill-white",
        ],
        className,
      )}
      {...props}
    >
      {/* A touch larger than the default 1rem icon box, to give the brand mark presence. */}
      <Logo className="size-5" />
      {!iconOnly && (children ?? <>Continue with {label}</>)}
    </Button>
  )
}
