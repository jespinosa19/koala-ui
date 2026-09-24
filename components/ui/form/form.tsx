"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { tv } from "@/lib/tv"
import {
  ControlSizeProvider,
  DensityProvider,
  useDensity,
  type ControlSize,
  type Density,
} from "@/lib/density"

/**
 * Form: the anatomy layer above `Field`. `Field` solves ONE labelled control (its ids, its
 * aria, its label/hint stack); everything *around* the controls was being hand-rolled, so
 * this owns it: the `<form>` element and its vertical rhythm, the titled chapter inside a
 * long form, and the bar that closes it.
 *
 * The rules it encodes, which is what the docs page documents as the anatomy:
 *   one control                          → `Field`
 *   several controls, one question       → `FieldGroup` (a real fieldset + legend)
 *   two values that belong on one line   → `FieldRow`
 *   a chapter of a long form             → `FormSection`
 *   the closing bar                      → `FormActions`
 *   several controls fused into one box  → `InputGroup`
 *
 * Deliberately NOT a validation or state library: no react-hook-form, no zod, no schema
 * prop. It renders a plain `<form>`, so `action`, `onSubmit`, server actions, or whatever
 * the consumer already uses all work untouched.
 *
 * `"use client"` because it reads the density context.
 */
export const formVariants = tv({
  slots: {
    root: "flex w-full flex-col",
    // The section's own `display` comes from its layout variant, not the base, so `split` can
    // swap it for a grid without fighting a `flex` it never wanted.
    section: "w-full min-w-0",
    sectionBody: "flex min-w-0 flex-col",
    sectionHeader: "flex flex-col gap-1",
    // `font-sans` opts this h3 out of the DM Sans heading face: at 14px, sitting directly
    // among Inter field labels of the same size, a display face reads as a mismatch rather
    // than a level. The chapter label belongs to the form's UI voice, not its display voice.
    sectionTitle: "font-sans text-sm font-semibold text-foreground text-balance",
    sectionDescription: "text-sm text-pretty text-muted-foreground",
    actions: "flex items-center gap-3",
  },
  variants: {
    // The canonical vertical rhythm. Before this the repo held three values in conflict
    // (gap-4 in the form blocks, gap-5 in the Field docs, gap-6/gap-8 in checkout); density
    // is the axis that already tunes every other gap in Koala, so it settles it here too.
    density: {
      // Extra air AFTER a chapter, whatever follows it: the next chapter, or the action bar
      // that closes the form. Keyed off the section's own data-slot as a sibling rule, so
      // FormSection never has to know whether it's the first one. Total = gap + mt (32/40px).
      compact: {
        root: "gap-4 [&>[data-slot=form-section]+*]:mt-4",
        section: "gap-4",
        sectionBody: "gap-4",
      },
      comfortable: {
        root: "gap-5 [&>[data-slot=form-section]+*]:mt-5",
        section: "gap-5",
        sectionBody: "gap-5",
      },
    },
    // A separate axis from the Form's `layout`: both are exposed as a `layout` prop, but on
    // different components, and merging them into one variant would let `Form layout="split"`
    // typecheck and do nothing.
    sectionLayout: {
      stack: { section: "flex flex-col" },
      // Title and description in one column, the fields beside them: the classic settings row
      // (Tailwind UI, Stripe, Linear). Stacks below `md`. Declared after `density` so the wider
      // column gap wins the merge while the row gap stays on the rhythm.
      split: { section: "grid gap-x-8 md:grid-cols-3", sectionBody: "md:col-span-2" },
    },
    layout: {
      stack: {},
      // The one-line capture (newsletter, waitlist, a CTA email grab): the field and its
      // button sit side by side once there's room, and stack below `sm`. Declared after
      // `density` so its tighter gap wins the merge.
      row: { root: "gap-2 sm:flex-row sm:items-center" },
      // The form element IS a card shell whose header / body / footer sit flush against its
      // borders. It contributes no rhythm at all: a FormSection inside owns that instead.
      plain: { root: "gap-0 [&>[data-slot=form-section]+*]:mt-0" },
    },
    align: {
      start: { actions: "justify-start" },
      end: { actions: "justify-end" },
      between: { actions: "justify-between" },
      // The full-width submit. `items-stretch` is what makes a lone Button span the form,
      // so the 6 hand-written `className="w-full"` submits don't need it any more.
      stack: { actions: "flex-col items-stretch" },
    },
    bordered: {
      true: { actions: "border-t border-border pt-4" },
    },
  },
  defaultVariants: {
    density: "compact",
    layout: "stack",
    sectionLayout: "stack",
    align: "end",
    bordered: false,
  },
})

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface FormProps extends React.ComponentPropsWithoutRef<"form"> {
  /** Sets the vertical rhythm. Falls back to the density provider. */
  density?: Density
  /**
   * Height of every control inside: sm 32 · md 36 · lg 40px. Defaults to `lg`, because a form
   * field is the thing being filled in, not a control tucked into a toolbar. A control's own
   * `size` prop still wins, so this is the default, not an override.
   */
  size?: ControlSize
  /**
   * `stack` (default) is the field column; `row` is the one-line capture; `plain` contributes
   * no rhythm, for a form element that is itself a card shell.
   */
  layout?: "stack" | "row" | "plain"
}

export function Form({
  density,
  size = "lg",
  layout,
  className,
  children,
  ...props
}: FormProps) {
  const resolvedDensity = useDensity(density)
  const { root } = formVariants({ density: resolvedDensity, layout })

  // A form's controls are bigger than the same control in a toolbar or a table filter, so the
  // Form is where that decision lives: one prop instead of a `size` on every field.
  const form = (
    <ControlSizeProvider size={size}>
      <form
        data-slot="form"
        data-control-size={size}
        className={root({ className })}
        {...props}
      >
        {children}
      </form>
    </ControlSizeProvider>
  )

  // Re-provide density only when this form was told one explicitly: then the nested spacing
  // tracks the form rather than the page. With no prop it's already inheriting, so wrapping
  // would just add a redundant provider.
  return density ? <DensityProvider density={density}>{form}</DensityProvider> : form
}

// ─── FormSection ──────────────────────────────────────────────────────────────

export interface FormSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  density?: Density
  /**
   * Give this chapter's controls a different height from the rest of the form. Unset, the
   * section is pure layout and the surrounding `Form` (or density) decides, so a section never
   * silently overrides the form it sits in.
   */
  size?: ControlSize
  /**
   * `stack` (default) puts the header above the fields. `split` sets the header beside them,
   * the classic settings row, and needs a `FormSectionBody` around the fields so they share one
   * column instead of each taking a grid cell of its own.
   */
  layout?: "stack" | "split"
}

/**
 * A chapter of a long form ("Contact", "Shipping", "Payment"). Carries its own field rhythm
 * and, through the sibling rule on `Form`, extra air from the chapter before it.
 *
 * It also serves as the form body where a `<form>` element can't go: inside a Dialog the
 * actions belong to `DialogFooter`, so there is nothing to submit. There it stays pure layout,
 * which keeps the fields the same height as the dialog's own buttons; pass `size` if you want
 * the taller form controls anyway.
 */
export function FormSection({ density, size, layout, className, ...props }: FormSectionProps) {
  const resolvedDensity = useDensity(density)
  const { section } = formVariants({ density: resolvedDensity, sectionLayout: layout })
  const node = (
    <section
      data-slot="form-section"
      data-control-size={size}
      className={section({ className })}
      {...props}
    />
  )

  return size ? <ControlSizeProvider size={size}>{node}</ControlSizeProvider> : node
}

export function FormSectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { sectionHeader } = formVariants()
  return (
    <div data-slot="form-section-header" className={sectionHeader({ className })} {...props} />
  )
}

export interface FormSectionBodyProps extends React.ComponentProps<"div"> {
  density?: Density
}

/**
 * The field column of a section. Only required by `layout="split"`, where it keeps the fields
 * in ONE grid cell beside the header instead of letting each field claim a cell of its own. In
 * a `stack` section the fields can sit directly in the section, so this is optional there.
 */
export function FormSectionBody({ density, className, ...props }: FormSectionBodyProps) {
  const resolvedDensity = useDensity(density)
  const { sectionBody } = formVariants({ density: resolvedDensity, sectionLayout: "split" })
  return <div data-slot="form-section-body" className={sectionBody({ className })} {...props} />
}

export interface FormSectionTitleProps extends React.ComponentProps<"h3"> {
  /** Render your own heading element when `h3` is the wrong level for the page outline. */
  asChild?: boolean
}

// A real heading, unlike `CardTitle`: a form chapter is a landmark in the document outline,
// and it's how a screen-reader user skips between chapters of a long form.
export function FormSectionTitle({ asChild = false, className, ...props }: FormSectionTitleProps) {
  const Comp = asChild ? Slot.Root : "h3"
  const { sectionTitle } = formVariants()
  return <Comp data-slot="form-section-title" className={sectionTitle({ className })} {...props} />
}

export function FormSectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { sectionDescription } = formVariants()
  return (
    <p
      data-slot="form-section-description"
      className={sectionDescription({ className })}
      {...props}
    />
  )
}

// ─── FormActions ──────────────────────────────────────────────────────────────

export interface FormActionsProps extends React.ComponentPropsWithoutRef<"div"> {
  /** `end` (default) is the ghost + primary pairing; `stack` is the full-width submit. */
  align?: "start" | "end" | "between" | "stack"
  /** Rules the bar off from the fields above, for a form long enough to need the seam. */
  bordered?: boolean
}

/**
 * The bar that closes a form. A status message goes in as a first child with `mr-auto`, which
 * is why there's no dedicated slot for one.
 *
 * Not to be confused with `DialogFooter` / `DrawerFooter`: those reverse to a stacked column
 * on mobile because an overlay's primary action belongs under the thumb. A form's actions sit
 * in the page flow and keep their row.
 */
export function FormActions({ align, bordered, className, ...props }: FormActionsProps) {
  const { actions } = formVariants({ align, bordered })
  return <div data-slot="form-actions" className={actions({ className })} {...props} />
}
