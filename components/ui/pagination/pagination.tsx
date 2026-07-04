"use client"

import * as React from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity, type Density } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { Button } from "@/components/ui/button"
import { InputRoot, InputField } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Pagination: a multi-part toolbar for navigating a paged dataset. Pattern: one `tv`
 * recipe with `slots`, shared state (current page, total pages, rows-per-page) flowing
 * to every part through React Context (never prop-drilled). See docs/ARCHITECTURE.md §2.
 *
 * The heavy lifting (control styling, focus, a11y) is delegated to the existing Button,
 * Input, and Select primitives so Pagination stays a thin, token-consistent assembler.
 * Every addon is its own named export, so a consumer can compose a custom layout, and
 * the `<Pagination>` convenience wrapper toggles each one with a `show*` boolean.
 */
export const paginationVariants = tv({
  slots: {
    // Two clusters that spread to the edges; wraps gracefully on narrow toolbars.
    root: "flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
    // Generic horizontal group (a label + its control, or prev/next).
    cluster: "flex items-center gap-2",
    label: "text-muted-foreground whitespace-nowrap select-none",
    // polish: tabular-nums so the counter never reflows as digits change.
    info: "text-muted-foreground tabular-nums whitespace-nowrap select-none",
    current: "font-medium text-foreground",
    // The go-to field is a fixed, centered numeric box. Hide the native number spinners:
    // they crowd a narrow centered field and break its optical balance.
    goToField:
      "w-14 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). For Pagination it
    // retunes the label/info type scale and (via `controlSizes` below) the sub-control
    // heights: compact lands an h-8 toolbar, comfortable an h-10 one.
    density: {
      comfortable: { label: "text-sm", info: "text-sm" },
      compact: { label: "text-xs", info: "text-xs" },
    },
  },
  defaultVariants: { density: "compact" },
})

type PaginationSlots = ReturnType<typeof paginationVariants>

/**
 * Sub-control sizing per density, picked so the whole toolbar lands on one matched
 * control height (compact → 32px row, comfortable → 40px row).
 */
type ControlSizes = {
  button: "sm" | "lg"
  input: "sm" | "lg"
  select: Density
}
const controlSizes: Record<Density, ControlSizes> = {
  comfortable: { button: "lg", input: "lg", select: "comfortable" },
  compact: { button: "sm", input: "sm", select: "compact" },
}

type PaginationContextValue = {
  page: number
  pageCount: number
  /** Clamp `page` into [1, pageCount] and emit it (only when it actually changes). */
  setPage: (page: number) => void
  rowsPerPage?: number
  onRowsPerPageChange?: (rows: number) => void
  rowsPerPageOptions: number[]
  disabled: boolean
  density: Density
  control: ControlSizes
  slots: PaginationSlots
}

const [PaginationProvider, usePaginationContext] =
  createContext<PaginationContextValue>("Pagination")

// ─── PaginationRoot ─────────────────────────────────────────────────────────────

export interface PaginationRootProps
  extends Omit<React.ComponentProps<"nav">, "onChange">,
    VariantProps<typeof paginationVariants> {
  /** Current page, 1-based. */
  page: number
  /** Total number of pages. Clamped to a minimum of 1. */
  pageCount: number
  /** Called with the next (already clamped) page when navigation happens. */
  onPageChange?: (page: number) => void
  /** Current rows-per-page value. Required for `<PaginationRowsPerPage>`. */
  rowsPerPage?: number
  /** Called with the next rows-per-page value. */
  onRowsPerPageChange?: (rows: number) => void
  /** Options offered by `<PaginationRowsPerPage>`. @default [10, 20, 30, 50] */
  rowsPerPageOptions?: number[]
  /** Disable every control at once. */
  disabled?: boolean
}

/**
 * The provider + `<nav>` wrapper. Use this directly when you want a fully custom layout
 * of the parts; reach for `<Pagination>` when the default toolbar + `show*` toggles fit.
 */
export function PaginationRoot({
  page,
  pageCount,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 30, 50],
  disabled = false,
  density,
  className,
  children,
  ...props
}: PaginationRootProps) {
  const d = useDensity(density)
  const slots = paginationVariants({ density: d })
  const safeCount = Math.max(pageCount, 1)

  const setPage = React.useCallback(
    (p: number) => {
      const next = Math.min(Math.max(Math.trunc(p), 1), safeCount)
      if (next !== page) onPageChange?.(next)
    },
    [page, safeCount, onPageChange],
  )

  return (
    <PaginationProvider
      page={page}
      pageCount={safeCount}
      setPage={setPage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      disabled={disabled}
      density={d}
      control={controlSizes[d]}
      slots={slots}
    >
      <nav
        data-slot="pagination"
        role="navigation"
        aria-label="Pagination"
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </nav>
    </PaginationProvider>
  )
}

// ─── PaginationInfo: "Página en la que estoy / cuántas páginas hay" ──────────────

export type PaginationInfoProps = React.ComponentProps<"p">



/**
 * "Page X of Y". Pass `children` to fully override the copy (e.g. for localization);
 * the current/total numbers are rendered with `tabular-nums` either way.
 */
export function PaginationInfo({ className, children, ...props }: PaginationInfoProps) {
  const { slots, page, pageCount } = usePaginationContext("PaginationInfo")
  return (
    <p
      data-slot="pagination-info"
      // aria-live so assistive tech announces the page as it changes, without moving focus.
      aria-live="polite"
      className={slots.info({ className })}
      {...props}
    >
      {children ?? (
        <>
          Page <span className={slots.current()}>{page}</span> of{" "}
          <span className={slots.current()}>{pageCount}</span>
        </>
      )}
    </p>
  )
}

// ─── PaginationPrevButton / PaginationNextButton: "avanzar, retroceder" ──────────

export type PaginationNavButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "iconOnly" | "size" | "variant"
>

export function PaginationPrevButton({
  className,
  children,
  ...props
}: PaginationNavButtonProps) {
  const { setPage, page, disabled, control } = usePaginationContext("PaginationPrevButton")
  return (
    <Button
      data-slot="pagination-prev"
      variant="outline"
      size={control.button}
      iconOnly
      aria-label="Previous page"
      disabled={disabled || page <= 1}
      onClick={() => setPage(page - 1)}
      className={className}
      {...props}
    >
      {children ?? <CaretLeft weight="bold" />}
    </Button>
  )
}

export function PaginationNextButton({
  className,
  children,
  ...props
}: PaginationNavButtonProps) {
  const { setPage, page, pageCount, disabled, control } =
    usePaginationContext("PaginationNextButton")
  return (
    <Button
      data-slot="pagination-next"
      variant="outline"
      size={control.button}
      iconOnly
      aria-label="Next page"
      disabled={disabled || page >= pageCount}
      onClick={() => setPage(page + 1)}
      className={className}
      {...props}
    >
      {children ?? <CaretRight weight="bold" />}
    </Button>
  )
}

// ─── PaginationControls: prev + next as one group ───────────────────────────────

export type PaginationControlsProps = React.ComponentProps<"div">



/** Convenience wrapper that renders the prev/next pair with the recipe's cluster spacing. */
export function PaginationControls({ className, ...props }: PaginationControlsProps) {
  const { slots } = usePaginationContext("PaginationControls")
  return (
    <div data-slot="pagination-controls" className={slots.cluster({ className })} {...props}>
      <PaginationPrevButton />
      <PaginationNextButton />
    </div>
  )
}

// ─── PaginationGoTo: "escribir número e irme a la página X" ──────────────────────

export interface PaginationGoToProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** Label rendered before the field. Pass `null`/`false` to hide it. @default "Go to" */
  label?: React.ReactNode
}

/**
 * A numeric field that jumps to an arbitrary page. The value commits on Enter or blur and
 * is clamped into range; it always re-syncs to the live page (so an out-of-range entry
 * snaps back to the clamped page).
 */
export function PaginationGoTo({ label = "Go to", className, ...props }: PaginationGoToProps) {
  const { slots, page, pageCount, setPage, disabled, control } =
    usePaginationContext("PaginationGoTo")
  const id = React.useId()
  const [value, setValue] = React.useState(String(page))

  // Re-sync the field whenever the page changes from anywhere (prev/next, external state…).
  // Adjusting state during render: React's recommended alternative to a setState effect.
  const [lastPage, setLastPage] = React.useState(page)
  if (page !== lastPage) {
    setLastPage(page)
    setValue(String(page))
  }

  const commit = () => {
    const parsed = Number.parseInt(value, 10)
    const clamped = Number.isNaN(parsed)
      ? page
      : Math.min(Math.max(parsed, 1), pageCount)
    setValue(String(clamped))
    setPage(clamped)
  }

  return (
    <div
      data-slot="pagination-goto"
      className={slots.cluster({ className })}
      {...props}
    >
      {label ? (
        <label htmlFor={id} className={slots.label()}>
          {label}
        </label>
      ) : null}
      <InputRoot size={control.input} disabled={disabled} className="w-auto">
        <InputField
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={pageCount}
          aria-label="Go to page"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commit()
            }
          }}
          className={slots.goToField()}
        />
      </InputRoot>
    </div>
  )
}

// ─── PaginationRowsPerPage: "cuántas rows cargar" ───────────────────────────────

export interface PaginationRowsPerPageProps extends React.ComponentProps<"div"> {
  /** Label rendered before the select. Pass `null`/`false` to hide it. @default "Rows per page" */
  label?: React.ReactNode
}

/** A select for how many rows to load per page, wired to `rowsPerPage` on the root. */
export function PaginationRowsPerPage({
  label = "Rows per page",
  className,
  ...props
}: PaginationRowsPerPageProps) {
  const { slots, rowsPerPage, onRowsPerPageChange, rowsPerPageOptions, disabled, control } =
    usePaginationContext("PaginationRowsPerPage")
  const id = React.useId()

  return (
    <div
      data-slot="pagination-rows"
      className={slots.cluster({ className })}
      {...props}
    >
      {label ? (
        <label htmlFor={id} className={slots.label()}>
          {label}
        </label>
      ) : null}
      <Select
        value={rowsPerPage != null ? String(rowsPerPage) : undefined}
        onValueChange={(v) => onRowsPerPageChange?.(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          density={control.select}
          aria-label="Rows per page"
          className="w-auto gap-2"
        >
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent density={control.select}>
          {rowsPerPageOptions.map((opt) => (
            <SelectItem key={opt} value={String(opt)} density={control.select}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ─── Pagination: the convenience toolbar with `show*` addon toggles ─────────────

export interface PaginationProps extends PaginationRootProps {
  /** Show the "Page X of Y" readout. @default true */
  showInfo?: boolean
  /** Show the prev/next buttons. @default true */
  showControls?: boolean
  /** Show the "go to page" field. @default false */
  showGoTo?: boolean
  /** Show the rows-per-page select. @default false */
  showRowsPerPage?: boolean
}

/**
 * The batteries-included Pagination. Each addon is toggled by a `show*` boolean; pass your
 * own `children` to bypass the default layout entirely and compose the parts by hand.
 */
export function Pagination({
  showInfo = true,
  showControls = true,
  showGoTo = false,
  showRowsPerPage = false,
  children,
  ...rootProps
}: PaginationProps) {
  return (
    <PaginationRoot {...rootProps}>
      {children ?? (
        <>
          {/* Left cluster: how much to load + where you are. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {showRowsPerPage ? <PaginationRowsPerPage /> : null}
            {showInfo ? <PaginationInfo /> : null}
          </div>
          {/* Right cluster: jump + step. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {showGoTo ? <PaginationGoTo /> : null}
            {showControls ? <PaginationControls /> : null}
          </div>
        </>
      )}
    </PaginationRoot>
  )
}
