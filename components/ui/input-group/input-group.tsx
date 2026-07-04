"use client"

import * as React from "react"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { useControlSize, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

// ─── Variants ─────────────────────────────────────────────────────────────────
//
// InputGroup is to the input family what ButtonGroup is to Button: it joins several
// distinct controls (an Input, a Select, a Button, a static affix) into ONE seamless
// segmented shell. Two ideas live in different components and must not be confused:
//
//   • Adornments *inside a single field* (icon, prefix label, suffix button) → InputRoot.
//   • Joining *several controls* into one bordered row → InputGroup (this file).
//
// The mechanism: the group owns the single border + radius + focus ring + background.
// Each child control then goes "chromeless" — we strip its own border / radius / ring /
// shadow / background via `[data-slot=…]` descendant selectors (the same sanctioned
// pattern ButtonGroup and AvatarGroup use; no child cloning) so the segments melt into
// the shell. Interior seams are drawn as a single 1px `border-l` per segment. Height is
// governed by the shell (`items-stretch`), so children no longer fight over it.
//
// Buttons are the deliberate exception, and a narrow one: only a *small icon-only* action
// (copy, clear, a submit arrow) melts into the shell - it keeps its fill and hover, losing
// only its radius / shadow / own ring / press scale so it sits flush. A prominent *text*
// action (Subscribe, Invite, Search) does NOT belong inside: crammed in, it reads as a
// button trapped in a field. Keep it a detached Button beside the group, in a flex row at
// the same size, so the heights line up and it reads as a real button.

export const inputGroupVariants = tv({
  slots: {
    root: [
      // The shell owns the frame. `items-stretch` makes every segment the same height
      // regardless of the size each control would impose on its own.
      "flex w-full items-stretch overflow-hidden",
      "rounded-md border border-input bg-[var(--surface,var(--background))]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      // One ring for the whole group: focusing any inner control lights the shell, never
      // a single segment. Mirrors InputRoot's brand ring so it feels like one field.
      "focus-within:border-brand focus-within:brand-ring",

      // ── Neutralize the Input segment ──────────────────────────────────────────
      // Drop its frame and let it become the elastic part that fills the row.
      "[&_[data-slot=input-root]]:h-auto [&_[data-slot=input-root]]:min-w-0 [&_[data-slot=input-root]]:w-auto [&_[data-slot=input-root]]:flex-1",
      "[&_[data-slot=input-root]]:rounded-none [&_[data-slot=input-root]]:border-0 [&_[data-slot=input-root]]:bg-transparent",
      // The field paints its own focus ring; the group owns the ring now, so silence it.
      "[&_[data-slot=input-root]:focus-within]:[box-shadow:none]",

      // ── Neutralize the Select segment ─────────────────────────────────────────
      // Size to its content (selects are affixes here, not the elastic part).
      "[&_[data-slot=select-trigger]]:h-auto [&_[data-slot=select-trigger]]:w-auto [&_[data-slot=select-trigger]]:shrink-0",
      "[&_[data-slot=select-trigger]]:rounded-none [&_[data-slot=select-trigger]]:border-0 [&_[data-slot=select-trigger]]:bg-transparent [&_[data-slot=select-trigger]]:shadow-none",
      "[&_[data-slot=select-trigger]]:focus:ring-0 [&_[data-slot=select-trigger]]:focus:border-transparent [&_[data-slot=select-trigger]]:active:scale-100",

      // ── Flush the Button segment (keeps its fill) ─────────────────────────────
      "[&_[data-slot=button]]:h-auto [&_[data-slot=button]]:rounded-none [&_[data-slot=button]]:shadow-none",
      "[&_[data-slot=button]]:focus-visible:ring-0 [&_[data-slot=button]]:focus-visible:ring-offset-0 [&_[data-slot=button]]:active:scale-100",

      // ── Seams ─────────────────────────────────────────────────────────────────
      // One 1px divider per junction. `!border-l` (longhand, important) deterministically
      // beats the children's `border-0` strip above — same care ButtonGroup takes with
      // specificity. The first child has no left seam; the shell draws the outer frame.
      "[&>*:not(:first-child)]:!border-l [&>*:not(:first-child)]:border-input",
    ],
    // A static, non-interactive affix segment: "$", "https://", "@", ".com", an icon.
    // Shares the shell background and muted treatment so it reads as a label, not a field.
    addon: [
      "flex shrink-0 items-center self-stretch",
      "bg-[var(--surface,var(--background))] text-muted-foreground",
      "select-none whitespace-nowrap font-medium",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
  },
  variants: {
    size: {
      sm: {
        root: "h-8 text-sm",
        addon: "gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-[15px]",
      },
      md: {
        root: "h-9 text-sm",
        addon: "gap-1.5 px-3 text-sm",
      },
      lg: {
        root: "h-10 text-base",
        addon: "gap-1.5 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-[18px]",
      },
    },
    hasError: {
      true: {
        root: [
          "border-destructive",
          "focus-within:border-destructive focus-within:destructive-ring",
        ],
      },
    },
    disabled: {
      // Visual + interaction lock for the whole shell. For form semantics, also disable the
      // inner control(s) so the field is excluded from submission.
      true: { root: "opacity-50 pointer-events-none select-none" },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

// ─── Context ──────────────────────────────────────────────────────────────────

type Size = NonNullable<VariantProps<typeof inputGroupVariants>["size"]>

interface InputGroupContextValue {
  size: Size
  hasError: boolean
  disabled: boolean
  slots: ReturnType<typeof inputGroupVariants>
}

const [InputGroupProvider, useInputGroupContext] =
  createContext<InputGroupContextValue>("InputGroup")

// ─── InputGroup ─────────────────────────────────────────────────────────────────

export interface InputGroupProps extends React.ComponentProps<"div"> {
  /** Shell height + affix sizing. Give the inner controls the same size. @default "md" */
  size?: Size
  /**
   * Spacing tier. Height comes from `size`, not density; this only sets the DEFAULT `size` when
   * none is given (compact → "sm", comfortable → "md"). Resolves prop > DensityProvider >
   * "compact". An explicit `size` always wins.
   */
  density?: Density
  /** Paint the shell in the error state (red border + ring). */
  hasError?: boolean
  /** Dim and lock the whole group. Also disable the inner control for form semantics. */
  disabled?: boolean
}

function InputGroup({
  size,
  density,
  hasError,
  disabled,
  className,
  children,
  ...props
}: InputGroupProps) {
  // Inside a Field, error/disabled cascade just like InputRoot does, so the consumer sets
  // them once on the field. A local prop always wins over the field default.
  const field = useFieldContext()
  const resolvedError = hasError ?? field?.hasError ?? false
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  // Height comes from `size`; density only picks the DEFAULT size (compact → sm, comfortable →
  // md) so a bare group keeps step with the inner field and a detached Button.
  const resolvedSize = useControlSize(size, density)
  const slots = inputGroupVariants({
    size: resolvedSize,
    hasError: resolvedError,
    disabled: resolvedDisabled,
  })
  return (
    <InputGroupProvider
      size={resolvedSize}
      hasError={resolvedError}
      disabled={resolvedDisabled}
      slots={slots}
    >
      <div
        data-slot="input-group"
        data-disabled={resolvedDisabled || undefined}
        data-error={resolvedError || undefined}
        role="group"
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </div>
    </InputGroupProvider>
  )
}

// ─── InputGroupAddon ──────────────────────────────────────────────────────────

export type InputGroupAddonProps = React.ComponentPropsWithoutRef<"span">

function InputGroupAddon({ className, ...props }: InputGroupAddonProps) {
  const { slots } = useInputGroupContext("InputGroupAddon")
  return (
    <span
      data-slot="input-group-addon"
      className={slots.addon({ className })}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon }
