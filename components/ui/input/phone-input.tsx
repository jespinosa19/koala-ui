"use client"

import * as React from "react"
import { Popover } from "radix-ui"
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react"
import * as Flags from "country-flag-icons/react/3x2"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useFieldContext } from "@/lib/field-context"
import {
  InputRoot,
  InputField,
  InputPrefix,
  type InputFieldProps,
  type InputRootProps,
} from "./input"
import { COUNTRIES, COUNTRY_BY_ISO2, type Country } from "./countries"

// country-flag-icons exports one component per ISO2 code; index them by code.
const FLAGS = Flags as unknown as Record<
  string,
  React.ComponentType<{ className?: string; title?: string }>
>

// ─── Variants ─────────────────────────────────────────────────────────────────

const phoneInputVariants = tv({
  slots: {
    // Country button: flush against the root's left border with a divider on the right,
    // same negative-margin trick InputPrefixLabel uses, so it clips at the rounded corner.
    trigger: [
      "group flex shrink-0 cursor-pointer items-center gap-1.5 self-stretch",
      "border-r border-input text-muted-foreground",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-foreground",
      "focus-visible:outline-none focus-visible:bg-accent focus-visible:text-foreground",
      "disabled:pointer-events-none",
    ],
    caret: "size-3 shrink-0 transition-transform duration-fast ease-out group-data-[state=open]:rotate-180",
    dial: "shrink-0 select-none tabular-nums text-muted-foreground",
    content: [
      // Declare --surface so the nested search Input blends with the popover instead of
      // painting the page background (the --surface contract).
      "z-50 w-72 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg [--surface:var(--popover)]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
      "data-[state=open]:duration-fast data-[state=closed]:duration-[100ms] ease-out",
    ],
    list: "max-h-64 overflow-y-auto overscroll-contain p-1.5",
    option: [
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-2 text-left text-sm",
      "outline-none transition-colors duration-fast ease-out",
      "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
      // Skip paint/layout of off-screen rows so all 200+ flag SVGs don't render at once on
      // open. DOM-only hint: keyboard nav, search and aria are untouched; the reserved
      // intrinsic height keeps the scrollbar stable.
      "[content-visibility:auto] [contain-intrinsic-size:auto_2.25rem]",
    ],
    optionName: "flex-1 truncate",
    optionDial: "shrink-0 tabular-nums text-muted-foreground",
    check: "size-4 shrink-0 text-brand",
    empty: "px-3 py-6 text-center text-sm text-muted-foreground",
  },
  variants: {
    size: {
      sm: { trigger: "-ml-2.5 pl-2.5 pr-2.5 text-xs", dial: "text-sm" },
      md: { trigger: "-ml-3 pl-3 pr-3 text-sm", dial: "text-sm" },
      lg: { trigger: "-ml-3.5 pl-3.5 pr-3.5 text-sm", dial: "text-base" },
    },
  },
  defaultVariants: { size: "md" },
})

// ─── Flag ───────────────────────────────────────────────────────────────────────

/**
 * A 3:2 flag cropped into a circle so every country reads at one consistent diameter,
 * matching the icon rhythm used across Selects. `ring-border` keeps mostly-white flags
 * (Japan, Finland) legible against the surface.
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

// ─── PhoneInput ─────────────────────────────────────────────────────────────────

export interface PhoneChangePayload {
  /** Selected country ISO 3166-1 alpha-2 code. */
  country: string
  /** That country's calling code without `+` (e.g. `"1"`). */
  dialCode: string
  /** The national number exactly as typed. */
  nationalNumber: string
  /** Best-effort E.164 string: `+` + dial code + digits of the national number. */
  e164: string
}

export interface PhoneInputProps
  extends Omit<
    InputFieldProps,
    "value" | "defaultValue" | "onChange" | "type" | "size"
  > {
  /** Controlled country (ISO2). Pair with `onCountryChange`. */
  country?: string
  /** Initial country when uncontrolled. Defaults to `"US"`. */
  defaultCountry?: string
  onCountryChange?: (iso2: string) => void
  /** Controlled national number. Pair with `onValueChange`. */
  value?: string
  /** Initial national number when uncontrolled. */
  defaultValue?: string
  onValueChange?: (nationalNumber: string) => void
  /** Fires with the composed `{ country, dialCode, nationalNumber, e164 }` on any change. */
  onChange?: (payload: PhoneChangePayload) => void
  size?: InputRootProps["size"]
  hasError?: boolean
  /** Forwarded to the wrapping `InputRoot`. */
  rootClassName?: string
}

export function PhoneInput({
  country,
  defaultCountry = "US",
  onCountryChange,
  value,
  defaultValue,
  onValueChange,
  onChange,
  size = "md",
  hasError,
  disabled,
  id,
  className,
  rootClassName,
  placeholder = "Phone number",
  "aria-describedby": ariaDescribedBy,
  ...fieldProps
}: PhoneInputProps) {
  const slots = phoneInputVariants({ size })
  const field = useFieldContext()
  const resolvedDisabled = disabled ?? field?.disabled ?? false

  // Country + number each follow the standard controlled/uncontrolled split.
  const isCountryControlled = country !== undefined
  const [internalCountry, setInternalCountry] = React.useState(defaultCountry)
  const activeIso = (isCountryControlled ? country : internalCountry) ?? "US"
  const current: Country = COUNTRY_BY_ISO2[activeIso] ?? COUNTRY_BY_ISO2.US

  const isValueControlled = value !== undefined
  const [internalNumber, setInternalNumber] = React.useState(defaultValue ?? "")
  const number = isValueControlled ? value! : internalNumber

  const emit = (nextIso: string, nextNumber: string) => {
    const c = COUNTRY_BY_ISO2[nextIso] ?? current
    onChange?.({
      country: nextIso,
      dialCode: c.dial,
      nationalNumber: nextNumber,
      e164: `+${c.dial}${nextNumber.replace(/\D/g, "")}`,
    })
  }

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permit the characters people actually type in phone numbers; drop the rest.
    const next = e.target.value.replace(/[^\d\s()+\-.]/g, "")
    if (!isValueControlled) setInternalNumber(next)
    onValueChange?.(next)
    emit(activeIso, next)
  }

  const selectCountry = (iso2: string) => {
    if (!isCountryControlled) setInternalCountry(iso2)
    onCountryChange?.(iso2)
    emit(iso2, number)
    setOpen(false)
    // Hand focus to the number field: the natural next action after picking a country.
    requestAnimationFrame(() => numberRef.current?.focus())
  }

  // ── Picker (search + keyboard-navigable list) ──
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const numberRef = React.useRef<HTMLInputElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "")
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso2.toLowerCase() === q,
    )
  }, [query])

  // Reset the search each time the picker opens, starting the highlight on the current country.
  const handleOpenChange = (next: boolean) => {
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

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <InputRoot size={size} hasError={hasError} disabled={disabled} className={rootClassName}>
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            data-slot="phone-input-country"
            disabled={resolvedDisabled}
            aria-label={`Country: ${current.name} (+${current.dial})`}
            className={slots.trigger()}
          >
            <CountryFlag iso2={current.iso2} />
            <CaretDown weight="bold" className={slots.caret()} aria-hidden="true" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            data-slot="phone-input-popover"
            align="start"
            sideOffset={8}
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
                  placeholder="Search countries…"
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

            <div role="listbox" aria-label="Countries" className={slots.list()}>
              {results.length === 0 ? (
                <p className={slots.empty()}>No countries found.</p>
              ) : (
                results.map((c, i) => {
                  const selected = c.iso2 === activeIso
                  return (
                    <button
                      key={c.iso2}
                      ref={(el) => {
                        optionRefs.current[i] = el
                      }}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-active={i === activeIndex}
                      className={slots.option()}
                      onPointerMove={() => setActiveIndex(i)}
                      onClick={() => selectCountry(c.iso2)}
                    >
                      <CountryFlag iso2={c.iso2} />
                      <span className={slots.optionName()}>{c.name}</span>
                      <span className={slots.optionDial()}>+{c.dial}</span>
                      {selected ? (
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

      <span data-slot="phone-input-dial" aria-hidden="true" className={slots.dial()}>
        +{current.dial}
      </span>

      <InputField
        ref={numberRef}
        id={id ?? field?.id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        className={cn("tabular-nums", className)}
        value={number}
        disabled={resolvedDisabled}
        {...fieldProps}
        onChange={handleNumber}
      />
    </InputRoot>
  )
}
