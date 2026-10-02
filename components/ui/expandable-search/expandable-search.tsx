"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { tv } from "@/lib/tv"
import { useControlSize, type ControlSize } from "@/lib/density"
import { hitBox } from "@/lib/hit-area"
import {
  InputRoot,
  InputField,
  type InputRootProps,
  type InputFieldProps,
} from "@/components/ui/input"

/**
 * ExpandableSearch: a search that rests as an icon button and grows into a full field on click.
 * Pattern: one `tv` recipe with `slots` over the DS `Input` parts. The field IS an `InputRoot`
 * (same border, surface, focus ring and sizes), so an open ExpandableSearch is indistinguishable
 * from an `Input` with a leading magnifier; only its resting state is new.
 *
 * One box, not two elements swapping: the square the magnifier sits in widens to the field's
 * width, so the glyph never moves and the placeholder is revealed from under the growing edge.
 * The trigger stays in place as the field's prefix once open. The field that follows it starts
 * on the same x an `Input` with an `InputPrefix` puts its text (md: 12 + 16 + 8 = the 36px
 * square), so an open ExpandableSearch lines up with any plain search field beside it.
 *
 * Width is the consumer's: `className="w-80"` sets the OPEN width (default `w-64`); the closed
 * width is pinned by the size, so the one class can't fight it.
 */
export const expandableSearchVariants = tv({
  slots: {
    root: [
      // `group/search` lets the trigger and body read the open state without prop-drilling it.
      "group/search w-64 gap-0 px-0",
      // The trigger's hit area reaches past the square; the body clips its own content instead,
      // so the root can stay unclipped.
      "overflow-visible",
      // Closed: no frame, no surface. The chip only materializes under the pointer, like a ghost
      // icon Button. The frame and surface fade in as the box widens.
      "data-[state=closed]:border-transparent data-[state=closed]:bg-transparent",
      "data-[state=closed]:hover:bg-accent",
      // Specific properties, never `all`. Radius is on the list because the closed chip is a
      // circle and the open field is `rounded-md`; both are lengths, so they interpolate cleanly.
      "transition-[width,border-color,background-color,box-shadow,border-radius] duration-base ease-out",
      "motion-reduce:transition-none",
    ],
    trigger: [
      "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[inherit] outline-none",
      // Ink while it is a button, the prefix's meta grey once it is part of the field.
      "text-foreground transition-colors duration-fast ease-out",
      "group-data-[state=open]/search:cursor-text group-data-[state=open]/search:text-muted-foreground",
      "disabled:cursor-not-allowed",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      hitBox,
    ],
    // Everything after the magnifier: the field and any trailing content (a ⌘K hint). It clips
    // itself, so a `Kbd` never pokes out of the square mid-transition, and it fades with the box.
    body: [
      "flex min-w-0 flex-1 items-center gap-2 overflow-hidden",
      "transition-opacity duration-base ease-out motion-reduce:transition-none",
      "group-data-[state=closed]/search:opacity-0",
    ],
  },
  variants: {
    // The Input's own size axis. Closed, the box is a square of the field's height (a ghost icon
    // Button of the same size); open, the right padding is the Input's, so the field's text and
    // trailing content sit where a plain Input puts them. The closed radius is the pill clamped
    // to half the height: a circle at every radius preset and square at `None`, like the icon
    // Button, but as a real length it can interpolate to the field's `rounded-md` (a raw
    // `--radius-pill` would hold the circle until the last frame and snap).
    size: {
      sm: {
        root: "data-[state=closed]:w-8 data-[state=closed]:rounded-[min(var(--radius-pill),16px)] data-[state=open]:pr-2.5",
        trigger: "size-8 [&_svg]:size-[15px]",
        body: "gap-1.5",
      },
      md: {
        root: "data-[state=closed]:w-9 data-[state=closed]:rounded-[min(var(--radius-pill),18px)] data-[state=open]:pr-3",
        trigger: "size-9 [&_svg]:size-4",
      },
      lg: {
        root: "data-[state=closed]:w-10 data-[state=closed]:rounded-[min(var(--radius-pill),20px)] data-[state=open]:pr-3.5",
        trigger: "size-10 [&_svg]:size-[18px]",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface ExpandableSearchProps extends Omit<InputRootProps, "children" | "size"> {
  /** Controlled open state. */
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  /** Notified when the field expands or collapses. */
  onOpenChange?: (open: boolean) => void
  /** Control height, the Input's axis. Unset, it follows the container's imposed size. */
  size?: ControlSize
  /** @default "Search" */
  placeholder?: string
  /** Accessible name for the button and the field. @default the placeholder */
  label?: string
  /** Props forwarded to the underlying `<input>` (value, onChange, name, ref…). */
  inputProps?: InputFieldProps
  /** Trailing content inside the open field, e.g. `<InputSuffix><Kbd>⌘K</Kbd></InputSuffix>`. */
  children?: React.ReactNode
}

/**
 * Empties the field the way typing would, so a controlled `value` hears about it through its own
 * `onChange` (React tracks the native setter, not a plain `input.value = ""`).
 */
function clearField(input: HTMLInputElement) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "")
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

/** Point `ref` (a consumer's, callback or object) at `node`. A module helper, so the ref merge
 *  below never writes to a value a hook closed over (the repo's react-hooks lint forbids it). */
function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") return ref(node)
  if (ref) (ref as React.RefObject<T | null>).current = node
}

export function ExpandableSearch({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  size,
  density,
  disabled,
  placeholder = "Search",
  label,
  inputProps,
  className,
  children,
  onBlur,
  ...props
}: ExpandableSearchProps) {
  const resolvedSize = useControlSize(size, density)
  const slots = expandableSearchVariants({ size: resolvedSize })
  const name = label ?? placeholder

  // Uncontrolled by default, controllable when `open` is supplied, the Radix convention.
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { ref: inputPropsRef, id: inputPropsId, onKeyDown, ...fieldProps } = inputProps ?? {}
  const generatedId = React.useId()
  const inputId = inputPropsId ?? generatedId

  // Forward the field to the consumer's ref too (a ⌘K handler focuses it).
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      assignRef(inputPropsRef, node)
    },
    [inputPropsRef],
  )

  // Focus moves with the state the user changed: into the field when they open it, back to the
  // button when they dismiss it. It waits for the commit because the closed body is `inert` (the
  // field can't take focus until it isn't), and it never fires for `defaultOpen` or a controlled
  // `open` flipped from outside, so a bar that mounts open doesn't steal the page's focus.
  const pendingFocus = React.useRef<"field" | "trigger" | null>(null)
  React.useEffect(() => {
    const target = pendingFocus.current
    pendingFocus.current = null
    if (target === "field" && open) inputRef.current?.focus()
    if (target === "trigger" && !open) triggerRef.current?.focus()
  }, [open])

  return (
    <InputRoot
      {...props}
      data-slot="expandable-search"
      data-state={open ? "open" : "closed"}
      size={resolvedSize}
      disabled={disabled}
      className={slots.root({ className })}
      // Leaving the component collapses it, unless the field holds a query: folding a live search
      // away would hide the very text that is filtering the page.
      onBlur={(event) => {
        onBlur?.(event)
        if (!open || event.currentTarget.contains(event.relatedTarget as Node | null)) return
        if (inputRef.current?.value) return
        setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-slot="expandable-search-trigger"
        aria-label={name}
        aria-expanded={open}
        aria-controls={inputId}
        disabled={disabled}
        // Open, the button is only the field's prefix glyph: out of the tab order and the a11y tree,
        // and a press on it keeps focus in the field instead of stealing it.
        tabIndex={open ? -1 : undefined}
        aria-hidden={open || undefined}
        onMouseDown={(event) => {
          if (open) event.preventDefault()
        }}
        onClick={() => {
          if (open) {
            inputRef.current?.focus()
            return
          }
          pendingFocus.current = "field"
          setOpen(true)
        }}
        className={slots.trigger()}
      >
        <MagnifyingGlass weight="bold" />
      </button>
      <span data-slot="expandable-search-body" inert={!open} className={slots.body()}>
        <InputField
          {...fieldProps}
          ref={setInputRef}
          id={inputId}
          type="search"
          placeholder={placeholder}
          aria-label={name}
          // Escape steps back one layer at a time: first it empties the field, then it folds the
          // search away and hands focus back to the button.
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented || event.key !== "Escape") return
            event.preventDefault()
            if (event.currentTarget.value) {
              clearField(event.currentTarget)
              return
            }
            pendingFocus.current = "trigger"
            setOpen(false)
          }}
        />
        {children}
      </span>
    </InputRoot>
  )
}
