"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { type VariantProps } from "@/lib/tv"
import { useControlSize, useDensity, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"
import { createContext } from "@/lib/create-context"
import { InputField, InputPrefix, InputRoot } from "@/components/ui/input/input"
import { selectVariants } from "./select"

export type SelectSearchFilter = (
  query: string,
  value: string,
  keywords?: string[],
) => number

const defaultFilter: SelectSearchFilter = (query, value, keywords) => {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const haystack = `${value} ${keywords?.join(" ") ?? ""}`.toLowerCase()
  return haystack.includes(q) ? 1 : 0
}

function offsetWithin(el: HTMLElement, container: HTMLElement) {
  let top = 0
  let node: HTMLElement | null = el
  while (node && node !== container) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

function scrollIntoList(list: HTMLElement, el: HTMLElement) {
  if (list.scrollHeight <= list.clientHeight) return
  const style = getComputedStyle(list)
  const padTop = parseFloat(style.scrollPaddingTop) || 0
  const padBottom = parseFloat(style.scrollPaddingBottom) || 0
  const top = offsetWithin(el, list)
  const bottom = top + el.offsetHeight
  if (top - padTop < list.scrollTop) list.scrollTop = top - padTop
  else if (bottom + padBottom > list.scrollTop + list.clientHeight)
    list.scrollTop = bottom + padBottom - list.clientHeight
}

type SelectSlots = ReturnType<typeof selectVariants>

const [SelectSearchProvider, useSelectSearchContext] = createContext<{
  value: string
  label: React.ReactNode
  select: (value: string, label: React.ReactNode) => void
  open: boolean
  setOpen: (open: boolean) => void
  query: string
  setQuery: (query: string) => void
  filter: SelectSearchFilter
  inline: boolean
  density: Density
  slots: SelectSlots
  disabled: boolean
  inputId: string
  listId: string
  contentRef: React.RefObject<HTMLDivElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  getItems: () => HTMLElement[]
  setActive: (el: HTMLElement | null) => void
}>("SelectSearch")

export interface SelectSearchProps
  extends Omit<VariantProps<typeof selectVariants>, "panel"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  inline?: boolean
  filter?: SelectSearchFilter
  name?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function SelectSearch({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  inline = false,
  filter = defaultFilter,
  name,
  size,
  density,
  disabled,
  className,
  children,
}: SelectSearchProps) {
  const d = useDensity(density)
  const slots = selectVariants({
    size: useControlSize(size, density),
    density: d,
    panel: inline ? "inline" : "floating",
  })
  const field = useFieldContext()

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const selected = isControlled ? value : internalValue

  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = isOpenControlled ? open : internalOpen

  const [query, setQuery] = React.useState("")
  const [label, setLabel] = React.useState<React.ReactNode>(null)

  const reactId = React.useId()
  const inputId = `${reactId}-input`
  const listId = `${reactId}-list`
  const contentRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next)
      onOpenChange?.(next)
      if (!next) setQuery("")
    },
    [isOpenControlled, onOpenChange],
  )

  const select = React.useCallback(
    (next: string, nextLabel: React.ReactNode) => {
      if (!isControlled) setInternalValue(next)
      setLabel(nextLabel)
      onValueChange?.(next)
      if (!inline) setOpen(false)
    },
    [isControlled, onValueChange, inline, setOpen],
  )

  const getItems = React.useCallback(
    () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLElement>(
          '[data-slot="select-search-item"]:not([data-disabled])',
        ) ?? [],
      ),
    [],
  )

  const setActive = React.useCallback((el: HTMLElement | null) => {
    const list = listRef.current
    if (!list) return
    for (const item of list.querySelectorAll<HTMLElement>(
      '[data-slot="select-search-item"][data-active]',
    )) {
      item.removeAttribute("data-active")
    }
    if (!el) {
      inputRef.current?.removeAttribute("aria-activedescendant")
      return
    }
    el.setAttribute("data-active", "true")
    inputRef.current?.setAttribute("aria-activedescendant", el.id)
    scrollIntoList(list, el)
  }, [])

  const body = (
    <>
      {children}
      {name ? <input type="hidden" name={name} value={selected} /> : null}
    </>
  )

  return (
    <SelectSearchProvider
      value={selected}
      label={label}
      select={select}
      open={isOpen}
      setOpen={setOpen}
      query={query}
      setQuery={setQuery}
      filter={filter}
      inline={inline}
      density={d}
      slots={slots}
      disabled={disabled ?? field?.disabled ?? false}
      inputId={inputId}
      listId={listId}
      contentRef={contentRef}
      listRef={listRef}
      inputRef={inputRef}
      getItems={getItems}
      setActive={setActive}
    >
      {inline ? (
        <div data-slot="select-search" className={cn("flex flex-col gap-2", className)}>
          {body}
        </div>
      ) : (
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setOpen}>
          {body}
        </PopoverPrimitive.Root>
      )}
    </SelectSearchProvider>
  )
}

export type SelectSearchTriggerProps = Omit<React.ComponentProps<"button">, "type">

export function SelectSearchTrigger({
  className,
  children,
  id,
  onClick,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectSearchTriggerProps) {
  const { slots, inline, open, setOpen, listId, disabled } =
    useSelectSearchContext("SelectSearchTrigger")
  const field = useFieldContext()

  const button = (
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props -- see aria-invalid below
    <button
      type="button"
      data-slot="select-search-trigger"
      data-state={open ? "open" : "closed"}
      id={id ?? field?.id}
      disabled={disabled}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={listId}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={field?.hasError || undefined}
      className={slots.trigger({ className })}
      onClick={(event) => {
        onClick?.(event)
        if (inline && !event.defaultPrevented) setOpen(!open)
      }}
      {...props}
    >
      {children}
      <CaretDown weight="bold" className={slots.chevron()} />
    </button>
  )

  if (inline) return button
  return <PopoverPrimitive.Trigger asChild>{button}</PopoverPrimitive.Trigger>
}

export interface SelectSearchValueProps extends React.ComponentProps<"span"> {
  placeholder?: React.ReactNode
  renderValue?: (value: string) => React.ReactNode
}

export function SelectSearchValue({
  className,
  placeholder,
  renderValue,
  ...props
}: SelectSearchValueProps) {
  const { value, label, slots } = useSelectSearchContext("SelectSearchValue")
  const picked = value ? (renderValue?.(value) ?? label ?? value) : null
  return (
    <span
      data-slot="select-search-value"
      data-placeholder={picked ? undefined : ""}
      className={slots.searchValue({
        className: cn(!picked && "font-normal text-muted-foreground", className),
      })}
      {...props}
    >
      {picked ?? placeholder}
    </span>
  )
}

export type SelectSearchContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

export function SelectSearchContent({
  className,
  children,
  onKeyDown,
  align = "start",
  sideOffset = 6,
  side,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  forceMount,
  asChild,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  ...props
}: SelectSearchContentProps) {
  const {
    slots,
    inline,
    open,
    query,
    setQuery,
    contentRef,
    inputRef,
    getItems,
    setActive,
  } = useSelectSearchContext("SelectSearchContent")

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const items = getItems()
    if (event.key === "Enter") {
      const active = items.find((el) => el.getAttribute("data-active") === "true")
      if (active) {
        event.preventDefault()
        active.click()
      }
      return
    }
    if (event.key === "Escape" && inline) {
      if (query) {
        event.preventDefault()
        setQuery("")
      }
      return
    }
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return
    if (items.length === 0) return
    event.preventDefault()
    const current = items.findIndex((el) => el.getAttribute("data-active") === "true")
    const next =
      event.key === "ArrowDown"
        ? current < items.length - 1
          ? current + 1
          : 0
        : current > 0
          ? current - 1
          : items.length - 1
    setActive(items[next] ?? null)
  }

  const panel = slots.content({
    className: cn(
      inline
        ? "z-auto w-full bg-transparent shadow-none [--surface:inherit]"
        : "w-[var(--radix-popover-trigger-width)]",
      className,
    ),
  })

  if (inline) {
    if (!open) return null
    return (
      <div
        ref={contentRef}
        data-slot="select-search-content"
        data-state="open"
        className={panel}
        onKeyDown={handleKeyDown}
        {...(props as React.ComponentProps<"div">)}
      >
        {children}
      </div>
    )
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={contentRef}
        data-slot="select-search-content"
        align={align}
        sideOffset={sideOffset}
        side={side}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        arrowPadding={arrowPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        forceMount={forceMount}
        asChild={asChild}
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={onFocusOutside}
        onInteractOutside={onInteractOutside}
        className={panel}
        onKeyDown={handleKeyDown}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event)
          if (event.defaultPrevented) return
          if (inputRef.current) {
            event.preventDefault()
            inputRef.current.focus()
          }
        }}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export interface SelectSearchInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "size"> {
  className?: string
  inputClassName?: string
}

export function SelectSearchInput({
  className,
  inputClassName,
  placeholder = "Search…",
  "aria-label": ariaLabel = "Search options",
  ...props
}: SelectSearchInputProps) {
  const { slots, query, setQuery, inputId, listId, inputRef } =
    useSelectSearchContext("SelectSearchInput")
  return (
    <div className={slots.search({ className })}>
      <InputRoot size="sm">
        <InputPrefix>
          <MagnifyingGlass weight="bold" />
        </InputPrefix>
        <InputField
          ref={inputRef}
          id={inputId}
          data-slot="select-search-input"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-label={ariaLabel}
          aria-controls={listId}
          placeholder={placeholder}
          className={inputClassName}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          {...props}
        />
      </InputRoot>
    </div>
  )
}

export interface SelectSearchListProps extends React.ComponentProps<"div"> {
  label?: string
}

export function SelectSearchList({
  className,
  label = "Options",
  ...props
}: SelectSearchListProps) {
  const { slots, listId, listRef, value, query, getItems, setActive } =
    useSelectSearchContext("SelectSearchList")

  React.useLayoutEffect(() => {
    const items = getItems()
    const preferred = query ? undefined : items.find((el) => el.dataset.value === value)
    setActive(preferred ?? items[0] ?? null)
  }, [query, value, getItems, setActive])

  return (
    <div
      ref={listRef}
      id={listId}
      data-slot="select-search-list"
      role="listbox"
      aria-label={label}
      className={slots.list({ className })}
      {...props}
    />
  )
}

export interface SelectSearchItemProps
  extends Omit<React.ComponentProps<"div">, "onSelect"> {
  value: string
  textValue?: string
  keywords?: string[]
  disabled?: boolean
  onSelect?: (value: string) => void
}

export function SelectSearchItem({
  className,
  children,
  value,
  textValue,
  keywords,
  disabled,
  onSelect,
  onClick,
  onPointerMove,
  ...props
}: SelectSearchItemProps) {
  const {
    value: selected,
    select,
    query,
    filter,
    slots,
    setActive,
  } = useSelectSearchContext("SelectSearchItem")
  const id = React.useId()

  if (filter(query, textValue ?? value, keywords) === 0) return null

  const isSelected = selected === value
  return (
    <div
      id={id}
      data-slot="select-search-item"
      data-value={value}
      data-disabled={disabled ? "" : undefined}
      data-state={isSelected ? "checked" : "unchecked"}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      className={slots.item({ className })}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!disabled) setActive(event.currentTarget)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (disabled || event.defaultPrevented) return
        onSelect?.(value)
        select(value, children)
      }}
      {...props}
    >
      <span className={slots.itemIndicator()}>
        {isSelected ? <Check weight="bold" className="size-4" /> : null}
      </span>
      <span>{children}</span>
    </div>
  )
}

export function SelectSearchGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-search-group"
      role="group"
      className={cn("not-has-[[data-slot=select-search-item]]:hidden", className)}
      {...props}
    />
  )
}

export function SelectSearchLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSelectSearchContext("SelectSearchLabel")
  return <div data-slot="select-search-label" className={slots.label({ className })} {...props} />
}

export function SelectSearchSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSelectSearchContext("SelectSearchSeparator")
  return (
    <div
      data-slot="select-search-separator"
      role="separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

export function SelectSearchEmpty({
  className,
  children = "No results found.",
  ...props
}: React.ComponentProps<"div">) {
  const { slots } = useSelectSearchContext("SelectSearchEmpty")
  return (
    <div data-slot="select-search-empty" role="presentation" className={slots.empty({ className })} {...props}>
      {children}
    </div>
  )
}
