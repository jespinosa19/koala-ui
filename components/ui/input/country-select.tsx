"use client"

import * as React from "react"
import { Popover } from "radix-ui"
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react"
import * as Flags from "country-flag-icons/react/3x2"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useFieldContext } from "@/lib/field-context"
import { InputRoot, InputField, InputPrefix } from "./input"
import { COUNTRIES, COUNTRY_BY_ISO2, type Country } from "./countries"

// country-flag-icons exports one component per ISO2 code; index them by code.
const FLAGS = Flags as unknown as Record<
  string,
  React.ComponentType<{ className?: string; title?: string }>
>

/**
 * CountrySelect: a searchable country picker that looks like a `Select` trigger but opens a
 * filterable, keyboard-navigable list on a Radix Popover, the way the country picker inside
 * `PhoneInput` works. A plain `Select` over ~250 countries is a long scroll; this lets the user
 * type to filter. Returns the selected ISO 3166-1 alpha-2 code via `onValueChange`.
 *
 * Lives in the Input family because it shares the canonical COUNTRIES dataset and the circular-flag
 * rendering with PhoneInput. Wires into a surrounding Field (id / aria-describedby / aria-invalid)
 * exactly like SelectTrigger does. Trigger styling mirrors `selectVariants.trigger` so it sits in a
 * form indistinguishable from a Select.
 */
const countrySelectVariants = tv({
  slots: {
    // Mirrors selectVariants.trigger so it reads as a native Select in a form.
    trigger: [
      "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input",
      "bg-[var(--surface,var(--background))] text-left text-foreground shadow-xs",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "hover:border-ring/50",
      // Focus + open read like an Input/Select: brand border + soft `brand-ring` halo, not a
      // hard 2px ring. `data-[state=open]` keeps the halo while the listbox owns focus.
      "outline-none focus-visible:border-brand focus-visible:brand-ring",
      "data-[state=open]:border-brand data-[state=open]:brand-ring",
      "active:scale-[0.99]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:destructive-ring aria-[invalid=true]:data-[state=open]:destructive-ring",
    ],
    value: "flex min-w-0 items-center gap-2",
    valueText: "truncate",
    placeholder: "text-muted-foreground",
    chevron: [
      "size-4 shrink-0 text-muted-foreground",
      "transition-transform duration-fast ease-out",
      "group-data-[state=open]:rotate-180",
    ],
    content: [
      // Match the trigger width; declare --surface so the nested search Input blends with the
      // popover instead of painting the page background (the --surface contract).
      "z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg [--surface:var(--popover)]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
    list: "max-h-64 overflow-y-auto overscroll-contain p-1.5",
    option: [
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-2 pl-2 pr-7 text-left text-sm",
      "outline-none transition-colors duration-fast ease-out",
      "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
      // Skip paint/layout of off-screen rows so all 200+ flag SVGs don't render at once on open.
      "[content-visibility:auto] [contain-intrinsic-size:auto_2.25rem]",
    ],
    optionName: "flex-1 truncate",
    check: "size-4 shrink-0 text-brand",
    empty: "px-3 py-6 text-center text-sm text-muted-foreground",
  },
  variants: {
    // Heights mirror InputRoot (sm 32 / md 36 / lg 40) so the picker lines up with sibling fields.
    size: {
      sm: { trigger: "h-8 px-2.5 text-sm" },
      md: { trigger: "h-9 px-3 text-sm" },
      lg: { trigger: "h-10 px-3.5 text-base" },
    },
  },
  defaultVariants: { size: "md" },
})

/**
 * A 3:2 flag cropped into a circle so every country reads at one diameter, matching the icon
 * rhythm used across Selects. `ring-border` keeps mostly-white flags (Japan, Finland) legible.
 */
function CountryFlag({ iso2, className }: { iso2: string; className?: string }) {
  const Flag = FLAGS[iso2]
  return (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset ring-border",
        className,
      )}
      aria-hidden="true"
    >
      {Flag ? <Flag className="size-auto h-full w-auto max-w-none" /> : null}
    </span>
  )
}

export interface CountrySelectProps extends VariantProps<typeof countrySelectVariants> {
  /** Controlled country (ISO2). Pair with `onValueChange`. */
  value?: string
  /** Initial country (ISO2) when uncontrolled. */
  defaultValue?: string
  onValueChange?: (iso2: string) => void
  hasError?: boolean
  disabled?: boolean
  /** Shown when no country is selected. */
  placeholder?: string
  /** Placeholder for the in-list search box. */
  searchPlaceholder?: string
  /** Renders a hidden input so the value posts with a native form submit. */
  name?: string
  id?: string
  /** Class for the trigger button. */
  className?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

export function CountrySelect({
  value,
  defaultValue,
  onValueChange,
  size = "md",
  hasError,
  disabled,
  placeholder = "Select country",
  searchPlaceholder = "Search countries…",
  name,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: CountrySelectProps) {
  const slots = countrySelectVariants({ size })
  const field = useFieldContext()
  const resolvedDisabled = disabled ?? field?.disabled ?? false

  // Standard controlled/uncontrolled split.
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const activeIso = isControlled ? value! : internal
  const selected: Country | undefined = activeIso ? COUNTRY_BY_ISO2[activeIso] : undefined

  // ── Picker (search + keyboard-navigable list) ──
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  // Stable id so the combobox trigger can point aria-controls at the listbox.
  const listboxId = React.useId()

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase() === q,
    )
  }, [query])

  function selectCountry(iso2: string) {
    if (!isControlled) setInternal(iso2)
    onValueChange?.(iso2)
    setOpen(false)
  }

  // Reset the search each open, starting the highlight on the current country.
  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setQuery("")
      const idx = COUNTRIES.findIndex((c) => c.iso2 === activeIso)
      setActiveIndex(idx === -1 ? 0 : idx)
    }
  }

  // Keep the highlighted option in view as the user arrows or filters.
  React.useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, results])

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const picked = results[activeIndex]
      if (picked) selectCountry(picked.iso2)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-slot="country-select-trigger"
          id={id ?? field?.id}
          disabled={resolvedDisabled}
          aria-label={ariaLabel ?? (selected ? `Country: ${selected.name}` : placeholder)}
          aria-describedby={ariaDescribedBy ?? field?.describedBy}
          aria-invalid={field?.hasError || hasError || undefined}
          // It's a button that opens a listbox popup: combobox is the role that fits, and it
          // (unlike a plain button) supports aria-invalid/aria-expanded.
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          className={slots.trigger({ className })}
        >
          {selected ? (
            <span className={slots.value()}>
              <CountryFlag iso2={selected.iso2} />
              <span className={slots.valueText()}>{selected.name}</span>
            </span>
          ) : (
            <span className={slots.placeholder()}>{placeholder}</span>
          )}
          <CaretDown weight="bold" className={slots.chevron()} aria-hidden="true" />
        </button>
      </Popover.Trigger>

      {name ? <input type="hidden" name={name} value={activeIso} /> : null}

      <Popover.Portal>
        <Popover.Content
          data-slot="country-select-content"
          align="start"
          sideOffset={6}
          className={slots.content()}
          onOpenAutoFocus={(e) => {
            // Focus the search box, not the first option.
            e.preventDefault()
            searchRef.current?.focus()
          }}
        >
          <div className="border-b border-border p-1.5">
            <InputRoot size="sm">
              <InputPrefix>
                <MagnifyingGlass weight="bold" />
              </InputPrefix>
              <InputField
                ref={searchRef}
                placeholder={searchPlaceholder}
                value={query}
                aria-label="Search countries"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onSearchKeyDown}
              />
            </InputRoot>
          </div>

          <div id={listboxId} role="listbox" aria-label="Countries" className={slots.list()}>
            {results.length === 0 ? (
              <p className={slots.empty()}>No countries found.</p>
            ) : (
              results.map((c, i) => {
                const isSelected = c.iso2 === activeIso
                return (
                  <button
                    key={c.iso2}
                    ref={(el) => {
                      optionRefs.current[i] = el
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-active={i === activeIndex}
                    className={slots.option()}
                    onPointerMove={() => setActiveIndex(i)}
                    onClick={() => selectCountry(c.iso2)}
                  >
                    <CountryFlag iso2={c.iso2} />
                    <span className={slots.optionName()}>{c.name}</span>
                    {isSelected ? (
                      <Check weight="bold" className={slots.check()} aria-hidden="true" />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
