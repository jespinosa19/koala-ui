"use client"

import * as React from "react"
import { CaretDown } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { useControlSize, type ControlSize, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"

/**
 * NativeSelect: the browser's own `<select>`, dressed as Koala's Select trigger. The list that opens
 * is the operating system's: the wheel on iOS, the sheet on Android, the menu on the desktop. Reach
 * for it where that is the better picker (a mobile checkout, a long country or year list, a plain
 * HTML form that must post without JavaScript) and for Select where the options need icons,
 * descriptions or a search.
 *
 * The closed control is indistinguishable from a Select trigger of the same `size` (sm 32 · md 36 ·
 * lg 40px, the shared control scale): the same frame, the same `--surface` ground, the same brand
 * border and halo on focus, the same caret. It stands beside Inputs and Selects in a Form row
 * without anyone noticing it is native.
 *
 * Inside a `Field` it picks up the generated id, the hint's `aria-describedby`, and `hasError`
 * (which turns the frame red), like every other control. An empty-valued first option is the
 * placeholder: while it is the selected one the control reads in the muted placeholder ink.
 *
 * Deliberately not a `multiple` listbox: a native multi-select is a box of rows you ctrl-click,
 * which nobody finds. Several values from a list is a MultiSelect.
 */
export const nativeSelectVariants = tv({
  slots: {
    // The frame the caret is positioned against. It takes the consumer's `className`, so a width
    // (`w-56`, `max-w-xs`) sizes the control and the caret together.
    root: "group/native-select relative flex w-full",
    field: [
      // The Select trigger's frame, token for token: the pressable-field shape (docs/ARCHITECTURE.md
      // §3), because pressing it opens a list, like the trigger's.
      "w-full min-w-0 cursor-pointer appearance-none truncate rounded-md border border-input",
      "bg-[var(--surface,var(--background))] pl-3 text-sm pointer-coarse:text-base font-medium text-foreground shadow-xs",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "hover:border-ring/50",
      // Plain `focus:`, where the Select trigger uses `focus-visible:` + its open state: a native
      // select is focused for exactly as long as its list is open (and a browser may not count a
      // click as focus-visible), so focus IS the open state, and the halo holds through the choice.
      "outline-none focus:border-brand focus:brand-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:destructive-ring",
      // The placeholder: while the empty-valued option is the chosen one, the value reads muted and
      // at normal weight, the same "empty" as the Select trigger's.
      "has-[option[value='']:checked]:font-normal has-[option[value='']:checked]:text-muted-foreground",
      // The open list is the OS's, but on Windows it paints its rows in the select's own ink, so a
      // muted placeholder would mute every option. Rows keep the foreground; the placeholder row
      // (disabled) stays muted, as it should.
      "[&_option]:font-normal [&_option]:text-foreground [&_option:disabled]:text-muted-foreground",
      // Ask for the dark native picker in the dark themes (both of them: `dark:` honours moonlight).
      "dark:scheme-dark",
    ],
    // The caret sits in the frame's right padding and lets clicks through to the select below.
    icon: [
      "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
      "group-has-[select:disabled]/native-select:opacity-50",
    ],
  },
  variants: {
    // Height from `size` alone, the scale every control shares. The right padding reserves the
    // caret's lane: its inset + 16px glyph + an 8px gap. The caret sits at the frame's padding PLUS
    // the 1px border (10+1, 12+1, 14+1), because the Select trigger's caret sits inside its border;
    // measured side by side, that lands the two carets on the same pixel.
    size: {
      sm: { field: "h-8 pl-2.5 pr-8", icon: "right-2.75" },
      md: { field: "h-9 pr-9", icon: "right-3.25" },
      lg: { field: "h-10 pl-3.5 pr-10", icon: "right-3.75" },
    },
  },
  defaultVariants: { size: "md" },
})

export interface NativeSelectProps
  extends Omit<React.ComponentProps<"select">, "size" | "multiple">,
    Omit<VariantProps<typeof nativeSelectVariants>, "size"> {
  /** Control height: `sm` 32 · `md` 36 · `lg` 40px. Defaults from the nearest Form or density. */
  size?: ControlSize
  /** Picks the default `size` when none is given (compact → sm, comfortable → md). */
  density?: Density
}

/**
 * The control. `className` goes on the frame (so a width moves the caret with it); every other prop
 * goes on the `<select>`, including `ref`, `name`, `value`/`defaultValue` and `onChange`.
 */
export function NativeSelect({
  className,
  size,
  density,
  id,
  disabled,
  required,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  children,
  ...props
}: NativeSelectProps) {
  const slots = nativeSelectVariants({ size: useControlSize(size, density) })
  // A surrounding Field supplies the id and the aria wiring; explicit props still win.
  const field = useFieldContext()
  return (
    <div data-slot="native-select" className={slots.root({ className })}>
      <select
        data-slot="native-select-field"
        id={id ?? field?.id}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        aria-invalid={ariaInvalid ?? (field?.hasError || undefined)}
        disabled={disabled ?? field?.disabled}
        required={required ?? field?.required}
        className={slots.field()}
        {...props}
      >
        {children}
      </select>
      <CaretDown weight="bold" data-slot="native-select-icon" aria-hidden className={slots.icon()} />
    </div>
  )
}

/** One choice. Give the placeholder `value=""` and `disabled` so it can't be chosen back. */
export function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

/** A labelled group of options; the OS draws the label as a heading in the list. */
export function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}
