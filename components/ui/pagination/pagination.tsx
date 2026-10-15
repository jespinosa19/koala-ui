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

export const paginationVariants = tv({
  slots: {
    root: "flex flex-wrap items-center justify-between gap-x-6 gap-y-3",
    cluster: "flex items-center gap-2",
    label: "text-muted-foreground whitespace-nowrap select-none",
    info: "text-muted-foreground tabular-nums whitespace-nowrap select-none",
    current: "font-medium text-foreground",
    goToField:
      "w-14 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  },
  variants: {
    density: {
      comfortable: { label: "text-sm", info: "text-sm" },
      compact: { label: "text-xs", info: "text-xs" },
    },
  },
  defaultVariants: { density: "compact" },
})

type PaginationSlots = ReturnType<typeof paginationVariants>

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

export interface PaginationRootProps
  extends Omit<React.ComponentProps<"nav">, "onChange">,
    VariantProps<typeof paginationVariants> {
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  rowsPerPage?: number
  onRowsPerPageChange?: (rows: number) => void
  rowsPerPageOptions?: number[]
  disabled?: boolean
}

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

export type PaginationInfoProps = React.ComponentProps<"p">

export function PaginationInfo({ className, children, ...props }: PaginationInfoProps) {
  const { slots, page, pageCount } = usePaginationContext("PaginationInfo")
  return (
    <p
      data-slot="pagination-info"
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

export type PaginationControlsProps = React.ComponentProps<"div">

export function PaginationControls({ className, ...props }: PaginationControlsProps) {
  const { slots } = usePaginationContext("PaginationControls")
  return (
    <div data-slot="pagination-controls" className={slots.cluster({ className })} {...props}>
      <PaginationPrevButton />
      <PaginationNextButton />
    </div>
  )
}

export interface PaginationGoToProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  label?: React.ReactNode
}

export function PaginationGoTo({ label = "Go to", className, ...props }: PaginationGoToProps) {
  const { slots, page, pageCount, setPage, disabled, control } =
    usePaginationContext("PaginationGoTo")
  const id = React.useId()
  const [value, setValue] = React.useState(String(page))

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

export interface PaginationRowsPerPageProps extends React.ComponentProps<"div"> {
  label?: React.ReactNode
}

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
          className="w-auto gap-2 tabular-nums"
        >
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent density={control.select} className="tabular-nums">
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

export interface PaginationProps extends PaginationRootProps {
  showInfo?: boolean
  showControls?: boolean
  showGoTo?: boolean
  showRowsPerPage?: boolean
}

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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {showRowsPerPage ? <PaginationRowsPerPage /> : null}
            {showInfo ? <PaginationInfo /> : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {showGoTo ? <PaginationGoTo /> : null}
            {showControls ? <PaginationControls /> : null}
          </div>
        </>
      )}
    </PaginationRoot>
  )
}
