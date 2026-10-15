"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CaretDown, Check, X } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { useDensity, type ControlSize, type Density } from "@/lib/density"
import { useFieldContext } from "@/lib/field-context"
import { createContext } from "@/lib/create-context"
import {
  InputField,
  InputPrefix,
  InputRoot,
  InputSuffixButton,
  type InputFieldProps,
} from "@/components/ui/input/input"
import { selectVariants } from "@/components/ui/select/select"
import { Spinner } from "@/components/ui/spinner"

export const comboboxVariants = tv({
  slots: {
    root: "group",
    clear: "-mr-1",
    content: "w-[var(--radix-popover-trigger-width)]",
    empty: "group-has-[[data-slot=combobox-item]]/select-search-list:hidden",
    group: "not-has-[[data-slot=combobox-item]]:hidden",
    status: "flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground",
  },
})

export type ComboboxFilter = (query: string, textValue: string, keywords?: string[]) => number

function fold(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

const defaultFilter: ComboboxFilter = (query, textValue, keywords) => {
  const q = fold(query.trim())
  if (!q) return 1
  return fold(`${textValue} ${keywords?.join(" ") ?? ""}`).includes(q) ? 1 : 0
}

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
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

const ITEM = '[data-slot="combobox-item"]'

type Mode = "combobox" | "autocomplete"
type Pending = "first" | "last" | null

const [ComboboxProvider, useComboboxContext] = createContext<{
  mode: Mode
  value: string
  text: string
  query: string
  open: boolean
  setOpen: (open: boolean) => void
  type: (text: string) => void
  commit: (value: string, label: string) => void
  clear: () => void
  revert: () => boolean
  filter: ComboboxFilter | null
  autoHighlight: boolean
  openOnInputClick: boolean
  name: string | undefined
  disabled: boolean
  size: ControlSize | undefined
  density: Density
  slots: ReturnType<typeof selectVariants>
  parts: ReturnType<typeof comboboxVariants>
  listId: string
  inputRef: React.RefObject<HTMLInputElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  setPending: (pending: Pending) => void
  takePending: () => Pending
  getItems: () => HTMLElement[]
  getActive: () => HTMLElement | null
  setActive: (el: HTMLElement | null) => void
}>("Combobox")

interface SharedRootProps extends Omit<VariantProps<typeof selectVariants>, "panel" | "size"> {
  size?: ControlSize
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  filter?: ComboboxFilter | null
  autoHighlight?: boolean
  openOnInputClick?: boolean
  name?: string
  disabled?: boolean
  children?: React.ReactNode
}

export interface ComboboxProps extends SharedRootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (inputValue: string) => void
  itemToString?: (value: string) => string
}

export interface AutocompleteProps extends SharedRootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type RootProps = ComboboxProps & { mode: Mode }

function ComboboxRoot({
  mode,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue,
  onInputValueChange,
  itemToString,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  filter = defaultFilter,
  autoHighlight = mode === "combobox",
  openOnInputClick = mode === "combobox",
  name,
  disabled,
  size,
  density,
  children,
}: RootProps) {
  const d = useDensity(density)
  const slots = selectVariants({ density: d })
  const parts = comboboxVariants()
  const field = useFieldContext()

  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = valueProp ?? internalValue

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen

  const [picked, setPicked] = React.useState<{ value: string; label: string } | null>(null)
  const label =
    mode === "autocomplete" || !value
      ? value
      : picked?.value === value
        ? picked.label
        : (itemToString?.(value) ?? value)

  const [draft, setDraft] = React.useState<string | null>(defaultInputValue ?? null)
  const text =
    mode === "autocomplete" ? value : (inputValueProp ?? draft ?? label)
  const query = mode === "combobox" && text === label ? "" : text

  const listId = `${React.useId()}-list`
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const pendingRef = React.useRef<Pending>(null)
  const setPending = React.useCallback((pending: Pending) => {
    pendingRef.current = pending
  }, [])
  const takePending = React.useCallback(() => {
    const pending = pendingRef.current
    pendingRef.current = null
    return pending
  }, [])

  const getItems = React.useCallback(
    () =>
      Array.from(listRef.current?.querySelectorAll<HTMLElement>(`${ITEM}:not([data-disabled])`) ?? []),
    [],
  )
  const getActive = React.useCallback(
    () => listRef.current?.querySelector<HTMLElement>(`${ITEM}[data-active]`) ?? null,
    [],
  )
  const setActive = React.useCallback((el: HTMLElement | null) => {
    const list = listRef.current
    list?.querySelectorAll(`${ITEM}[data-active]`).forEach((item) => item.removeAttribute("data-active"))
    if (!el || !list) {
      inputRef.current?.removeAttribute("aria-activedescendant")
      return
    }
    el.setAttribute("data-active", "true")
    inputRef.current?.setAttribute("aria-activedescendant", el.id)
    scrollIntoList(list, el)
  }, [])

  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setInternalValue(next)
      if (next !== value) onValueChange?.(next)
    },
    [valueProp, value, onValueChange],
  )

  const setText = React.useCallback(
    (next: string) => {
      if (mode === "autocomplete") setValue(next)
      else setDraft(next)
      onInputValueChange?.(next)
    },
    [mode, setValue, onInputValueChange],
  )

  const commit = React.useCallback(
    (nextValue: string, nextLabel: string) => {
      if (mode === "autocomplete") {
        setText(nextLabel)
      } else {
        setPicked({ value: nextValue, label: nextLabel })
        setValue(nextValue)
        setDraft(null)
        onInputValueChange?.(nextLabel)
      }
    },
    [mode, setText, setValue, onInputValueChange],
  )

  const revert = React.useCallback(() => {
    if (mode === "autocomplete" || text === label) {
      setDraft(null)
      return false
    }
    setDraft(null)
    onInputValueChange?.(label)
    return true
  }, [mode, text, label, onInputValueChange])

  const changeOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return
      if (!next) {
        inputRef.current?.removeAttribute("aria-activedescendant")
        if (mode === "combobox" && draft !== null) {
          const typed = draft.trim()
          const exact = typed
            ? getItems().find((el) => fold(el.dataset.text ?? "") === fold(typed))
            : undefined
          if (exact) commit(exact.dataset.value ?? "", exact.dataset.text ?? "")
          else if (!typed && value) {
            setValue("")
            setDraft(null)
            onInputValueChange?.("")
          } else revert()
        }
      }
      if (openProp === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [open, mode, draft, getItems, commit, value, setValue, onInputValueChange, revert, openProp, onOpenChange],
  )

  const pick = React.useCallback(
    (nextValue: string, nextLabel: string) => {
      commit(nextValue, nextLabel)
      if (openProp === undefined) setInternalOpen(false)
      onOpenChange?.(false)
      inputRef.current?.removeAttribute("aria-activedescendant")
    },
    [commit, openProp, onOpenChange],
  )

  const type = React.useCallback(
    (next: string) => {
      setText(next)
      if (!open) changeOpen(true)
    },
    [setText, open, changeOpen],
  )

  const clear = React.useCallback(() => {
    if (mode === "combobox") {
      setValue("")
      setDraft(null)
      onInputValueChange?.("")
    } else {
      setText("")
    }
    inputRef.current?.focus()
  }, [mode, setValue, setText, onInputValueChange])

  return (
    <ComboboxProvider
      mode={mode}
      value={value}
      text={text}
      query={query}
      open={open}
      setOpen={changeOpen}
      type={type}
      commit={pick}
      clear={clear}
      revert={revert}
      filter={filter}
      autoHighlight={autoHighlight}
      openOnInputClick={openOnInputClick}
      name={name}
      disabled={disabled ?? field?.disabled ?? false}
      size={size}
      density={d}
      slots={slots}
      parts={parts}
      listId={listId}
      inputRef={inputRef}
      listRef={listRef}
      setPending={setPending}
      takePending={takePending}
      getItems={getItems}
      getActive={getActive}
      setActive={setActive}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={changeOpen}>
        {children}
        {name && mode === "combobox" ? <input type="hidden" name={name} value={value} /> : null}
      </PopoverPrimitive.Root>
    </ComboboxProvider>
  )
}

export function Combobox(props: ComboboxProps) {
  return <ComboboxRoot {...props} mode="combobox" />
}

export function Autocomplete(props: AutocompleteProps) {
  return <ComboboxRoot {...props} mode="autocomplete" />
}

export interface ComboboxInputProps
  extends Omit<InputFieldProps, "value" | "defaultValue" | "onChange" | "prefix"> {
  prefix?: React.ReactNode
  showClear?: boolean
  showTrigger?: boolean
  className?: string
  inputClassName?: string
}

export function ComboboxInput({
  prefix,
  showClear = true,
  showTrigger,
  className,
  inputClassName,
  onKeyDown,
  onClick,
  ...props
}: ComboboxInputProps) {
  const ctx = useComboboxContext("ComboboxInput")
  const { mode, text, open, setOpen, type, clear, disabled, parts, slots, inputRef } = ctx
  const withTrigger = showTrigger ?? mode === "combobox"

  function move(to: "next" | "prev" | "first" | "last") {
    const items = ctx.getItems()
    if (items.length === 0) return
    const index = items.indexOf(ctx.getActive() as HTMLElement)
    const next =
      to === "first"
        ? 0
        : to === "last"
          ? items.length - 1
          : to === "next"
            ? index < items.length - 1
              ? index + 1
              : 0
            : index > 0
              ? index - 1
              : items.length - 1
    ctx.setActive(items[next] ?? null)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        const down = event.key === "ArrowDown"
        if (!open) {
          ctx.setPending(down ? "first" : "last")
          setOpen(true)
        } else if (!event.altKey) move(down ? "next" : "prev")
        return
      }
      case "Home":
      case "End":
        if (!open) return
        event.preventDefault()
        move(event.key === "Home" ? "first" : "last")
        return
      case "Enter": {
        if (!open) return
        const active = ctx.getActive()
        if (active) {
          event.preventDefault()
          active.click()
        } else if (mode === "combobox") {
          event.preventDefault()
        } else {
          setOpen(false)
        }
        return
      }
      case "Escape":
        if (open) return
        if (text) {
          event.preventDefault()
          clear()
        }
        return
      case "Tab":
        if (open) setOpen(false)
        return
    }
  }

  return (
    <PopoverPrimitive.Anchor asChild>
      <InputRoot
        size={ctx.size}
        density={ctx.density}
        disabled={disabled}
        data-slot="combobox"
        data-state={open ? "open" : "closed"}
        className={parts.root({ className })}
      >
        {prefix ? <InputPrefix>{prefix}</InputPrefix> : null}
        <InputField
          ref={inputRef}
          data-slot="combobox-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? ctx.listId : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          name={mode === "autocomplete" ? ctx.name : undefined}
          value={text}
          onChange={(event) => type(event.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(event) => {
            onClick?.(event)
            if (!event.defaultPrevented && ctx.openOnInputClick && !open) setOpen(true)
          }}
          className={inputClassName}
          {...props}
        />
        {showClear && text && !disabled ? (
          <InputSuffixButton
            data-slot="combobox-clear"
            aria-label="Clear"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
            className={withTrigger ? parts.clear() : undefined}
          >
            <X weight="bold" />
          </InputSuffixButton>
        ) : null}
        {withTrigger ? (
          <InputSuffixButton
            data-slot="combobox-trigger"
            aria-label={open ? "Hide options" : "Show options"}
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              inputRef.current?.focus()
              setOpen(!open)
            }}
          >
            <CaretDown weight="bold" className={slots.chevron()} />
          </InputSuffixButton>
        ) : null}
      </InputRoot>
    </PopoverPrimitive.Anchor>
  )
}

export interface ComboboxContentProps
  extends Omit<React.ComponentProps<typeof PopoverPrimitive.Content>, "role"> {
  label?: string
}

export function ComboboxContent({
  className,
  children,
  label,
  align = "start",
  sideOffset = 6,
  collisionPadding = 8,
  onEscapeKeyDown,
  onInteractOutside,
  onMouseDown,
  ...props
}: ComboboxContentProps) {
  const { slots, parts, listId, mode, revert, inputRef } = useComboboxContext("ComboboxContent")
  const field = useFieldContext()
  const labelledBy = label ? undefined : field?.labelledBy

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="combobox-content"
        id={listId}
        role="listbox"
        aria-label={labelledBy ? undefined : (label ?? "Options")}
        aria-labelledby={labelledBy}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={slots.content({ className: cn(parts.content(), className) })}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event)
          if (event.defaultPrevented) return
          if (mode === "combobox" && revert()) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event)
          const field = inputRef.current?.closest('[data-slot="combobox"]')
          if (field?.contains(event.target as Node)) event.preventDefault()
        }}
        onMouseDown={(event) => {
          onMouseDown?.(event)
          event.preventDefault()
        }}
        {...props}
      >
        <ComboboxList>{children}</ComboboxList>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function ComboboxList({ children }: { children: React.ReactNode }) {
  const { slots, listRef, query, value, mode, autoHighlight, takePending, getItems, getActive, setActive } =
    useComboboxContext("ComboboxList")
  const lastQuery = React.useRef<string | null>(null)

  React.useLayoutEffect(() => {
    const items = getItems()
    const pending = takePending()
    const active = getActive()
    if (!pending && query === lastQuery.current && active && items.includes(active)) return
    lastQuery.current = query
    const selected = mode === "combobox" ? items.find((el) => el.dataset.value === value) : undefined
    let next: HTMLElement | undefined
    if (pending) next = selected ?? (pending === "first" ? items[0] : items[items.length - 1])
    else if (query) next = autoHighlight ? items[0] : undefined
    else next = selected
    setActive(next ?? null)
  })

  return (
    <div ref={listRef} data-slot="combobox-list" className={slots.list({ className: "relative" })}>
      {children}
    </div>
  )
}

export interface ComboboxItemProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  value: string
  textValue?: string
  keywords?: string[]
  disabled?: boolean
  onSelect?: (value: string) => void
}

export function ComboboxItem({
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
}: ComboboxItemProps) {
  const { mode, value: selected, query, filter, slots, commit, setActive } =
    useComboboxContext("ComboboxItem")
  const id = React.useId()
  const text = textValue ?? (textOf(children).trim() || value)

  if (filter && filter(query, text, keywords) === 0) return null

  const isSelected = mode === "combobox" && selected === value
  return (
    <div
      id={id}
      data-slot="combobox-item"
      data-value={value}
      data-text={text}
      data-disabled={disabled ? "" : undefined}
      data-state={isSelected ? "checked" : "unchecked"}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      className={slots.item({ className })}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!disabled && event.currentTarget.dataset.active !== "true") setActive(event.currentTarget)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (disabled || event.defaultPrevented) return
        onSelect?.(value)
        commit(value, text)
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

export function ComboboxGroup({ className, ...props }: React.ComponentProps<"div">) {
  const { parts } = useComboboxContext("ComboboxGroup")
  return <div data-slot="combobox-group" role="group" className={parts.group({ className })} {...props} />
}

export function ComboboxLabel({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useComboboxContext("ComboboxLabel")
  return <div data-slot="combobox-label" className={slots.label({ className })} {...props} />
}

export function ComboboxSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, query } = useComboboxContext("ComboboxSeparator")
  if (query) return null
  return (
    <div data-slot="combobox-separator" role="separator" className={slots.separator({ className })} {...props} />
  )
}

export function ComboboxEmpty({
  className,
  children = "No results found.",
  ...props
}: React.ComponentProps<"div">) {
  const { slots, parts } = useComboboxContext("ComboboxEmpty")
  return (
    <div
      data-slot="combobox-empty"
      role="presentation"
      className={slots.empty({ className: cn(parts.empty(), className) })}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ComboboxStatusProps extends React.ComponentProps<"div"> {
  loading?: boolean
}

export function ComboboxStatus({ className, loading, children, ...props }: ComboboxStatusProps) {
  const { parts } = useComboboxContext("ComboboxStatus")
  return (
    <div
      data-slot="combobox-status"
      aria-live="polite"
      aria-atomic
      className={parts.status({ className })}
      {...props}
    >
      {loading ? <Spinner aria-hidden /> : null}
      {children}
    </div>
  )
}
