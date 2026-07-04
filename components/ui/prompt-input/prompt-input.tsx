"use client"

import * as React from "react"
import { ArrowUp, Stop, Info, Warning, WarningCircle, X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * PromptInput: the AI composer, an auto-growing textarea with a built-in toolbar and a
 * send⇄stop button. The anchor of the AI module. Multi-part `tv` recipe with `slots`;
 * the composer's value + streaming state flow to every part through React Context (see
 * docs/ARCHITECTURE.md §2), so a consumer wires `onSubmit` once and the textarea, submit
 * button and count all stay in sync.
 *
 * Built *out of* existing Koala parts: the toolbar actions and the send button are our
 * `Button`, not a re-styled copy. Composes a model `<Select>`, attachment `<FileCard>`s,
 * etc. by dropping them into the toolbar.
 */
const promptInputVariants = tv({
  slots: {
    // The composer surface. Opaque background that blends with whatever surface it sits on
    // (reads `--surface` if a container set one, else the page background): same contract as
    // Textarea/Input, so it never looks "filled". Shares the standard field radius (`rounded-md`)
    // so the composer lines up with Textarea/Input.
    root: [
      "flex flex-col rounded-md border border-input bg-[var(--surface,var(--background))] shadow-xs",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "focus-within:border-brand focus-within:brand-ring",
    ],
    // Auto-grows to fit content (native `field-sizing`, JS fallback below), capped at
    // max-h-48 where it starts to scroll. No manual resize grip: the bar owns the chrome.
    // Padding / text / min-height come from the `size` variant below.
    textarea: [
      "w-full resize-none bg-transparent leading-relaxed",
      "text-foreground outline-none placeholder:text-muted-foreground",
      "field-sizing-content max-h-48 overflow-y-auto",
      "disabled:cursor-not-allowed",
    ],
    // Bottom action bar. Ghost controls sit flush (gap-0): each button's own padding is the
    // breathing room, so the bar reads tight, not airy (a gap on top of the padding double-
    // spaces them). The submit uses `ml-auto` to claim the right edge. Padding from `size`.
    toolbar: "flex items-center gap-0",
    count: "tabular-nums select-none text-xs text-muted-foreground",
    // Banner: a notice card that tucks behind the composer (model availability, usage caps, errors,
    // promos). No absolute positioning: it sits as a sibling in a `relative isolate flex flex-col`
    // and slides under the composer via a negative margin + negative z, so only its outer edge peeks
    // out. The `side` variant picks which edge (top/bottom) it peeks from.
    banner: "rounded-md border border-input bg-[var(--surface,var(--background))]",
    bannerRow: "flex items-center gap-2.5 px-4 py-3 text-sm",
    bannerIcon: "shrink-0 [&>svg]:size-5",
    bannerContent: "flex min-w-0 flex-1 items-center gap-3 text-pretty text-foreground",
    bannerAction: [
      "shrink-0 cursor-pointer font-medium text-foreground underline underline-offset-2",
      "rounded-sm outline-none transition-colors duration-fast ease-out",
      "hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    ],
    bannerClose: [
      "relative -mr-1 grid size-6 shrink-0 cursor-pointer place-items-center self-center rounded-md",
      "text-muted-foreground/70 [&>svg]:size-3.5",
      "transition-[color,background-color,scale] duration-fast ease-out active:scale-[0.96]",
      "hover:bg-foreground/5 hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "before:absolute before:-inset-2 before:content-['']",
    ],
    // Suggestion chips: context-free starter pills, meant to sit *above* the composer. Outlined
    // and transparent (the outline-Button surface: `border-border` + `bg-transparent` + a soft
    // `shadow-xs`, hover washing to `accent`), so the row reads as a quiet, cohesive set that
    // blends on any surface rather than a filled block. The leading glyph stays muted and the
    // distinct per-starter icon (set at the call site) carries the differentiation, not color.
    suggestions: "flex flex-wrap gap-2",
    suggestion: [
      "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full",
      "border border-border bg-transparent px-3 py-1.5 text-sm text-foreground shadow-xs",
      "transition-[color,background-color,transform] duration-fast ease-out",
      "hover:bg-accent hover:text-accent-foreground active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
    ],
  },
  variants: {
    // Three sizes: they retune the field's padding, text, and min-height plus the toolbar's
    // padding (the surface radius stays constant, a brand trait). The submit button scales
    // with these via context (see PromptInputSubmit).
    size: {
      sm: {
        textarea: "px-3 pt-2.5 pb-1 text-sm min-h-10",
        toolbar: "px-2 pb-2 pt-0.5",
      },
      md: {
        textarea: "px-4 pt-3.5 pb-1.5 text-sm min-h-12",
        toolbar: "px-2.5 pb-2.5 pt-1",
      },
      lg: {
        textarea: "px-5 pt-4 pb-2 text-base min-h-14",
        toolbar: "px-3 pb-3 pt-1.5",
      },
    },
    disabled: {
      true: { root: "opacity-50 pointer-events-none select-none" },
    },
    // Banner tone. Tone tints the leading icon only (the strip shares the composer's fill) —
    // restraint mirrors the Alert component, which colors the glyph, not the card. `default` is a
    // neutral notice.
    tone: {
      default: { bannerIcon: "text-muted-foreground" },
      info: { bannerIcon: "text-info" },
      warning: { bannerIcon: "text-warning" },
      destructive: { bannerIcon: "text-destructive" },
    },
    // Which edge the banner peeks from behind the composer. The composer always stays a complete
    // rounded card on top; the banner slides *under* it and only its outer edge peeks out. The
    // banner squares the tucked edge, keeps the peeking edge rounded, and pulls toward the composer
    // by a full radius (`-mb-3`/`-mt-3` = rounded-md) so it genuinely passes beneath, dropping
    // behind via negative z. No absolute positioning: `relative -z-10` + an `isolate` on the
    // wrapper keeps the static composer (and its shadow) painting on top.
    //  · `top`: the banner sits *before* the composer and peeks above (square bottom, extra bottom pad).
    //  · `bottom`: the banner sits *after* the composer and peeks below (square top, extra top pad).
    side: {
      top: { banner: "relative -z-10 -mb-3 rounded-b-none", bannerRow: "pb-6 pt-3" },
      bottom: { banner: "relative -z-10 -mt-3 rounded-t-none", bannerRow: "pt-6 pb-3" },
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
    side: "top",
  },
})

type Size = NonNullable<VariantProps<typeof promptInputVariants>["size"]>

// Every toolbar control (action buttons, the submit button, and, in a demo, the model
// picker) tracks the composer size, so the whole bar shares one control height. The
// PromptInput size scale lines up 1:1 with the Button size scale (sm 32 · md 36 · lg 40).
const controlSize: Record<Size, NonNullable<ButtonProps["size"]>> = {
  sm: "sm",
  md: "md",
  lg: "lg",
}

// Static slots for the context-free parts (suggestions live outside the provider).
const staticSlots = promptInputVariants()

// One source of truth for the composer's icon size: 20px across the whole bar (toolbar actions +
// the send⇄stop button). `Button` ships `[&_svg:not([class*='size-'])]:size-4`; repeating that *same*
// variant at `size-5` lets `tailwind-merge` swap the 16px step for 20px (it keeps the last utility
// sharing a variant + property), with no `!important` and no per-icon hardcoding. (Menu rows like
// DropdownMenuItem already default to size-5, so this is a harmless no-op there.) An icon that sets
// its own `size-*` (e.g. a smaller caret) is still left untouched by the `:not()` guard.
const ICON_20 = "[&_svg:not([class*='size-'])]:size-5"

// ─── Context ──────────────────────────────────────────────────────────────────

type PromptInputContextValue = {
  value: string
  setValue: (value: string) => void
  /** Fire `onSubmit` with the current value (guards empty / disabled / loading). */
  submit: () => void
  /** Fire `onStop` while a response streams. */
  stop: () => void
  loading: boolean
  disabled: boolean
  size: Size
  slots: ReturnType<typeof promptInputVariants>
}

const [PromptInputProvider, usePromptInputContext] =
  createContext<PromptInputContextValue>("PromptInput")

// ─── PromptInput (root) ─────────────────────────────────────────────────────

export interface PromptInputProps
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  /** Controlled value. Omit (and use `defaultValue`) to let the composer own its state. */
  value?: string
  /** Initial value when uncontrolled. */
  defaultValue?: string
  /** Called on every keystroke with the next value. */
  onValueChange?: (value: string) => void
  /**
   * Called when the prompt is submitted (Enter or the send button) with the current value.
   * Skipped when the value is empty, disabled, or a response is streaming. When uncontrolled,
   * the field clears itself after a submit.
   */
  onSubmit?: (value: string) => void
  /** Called when the stop button is pressed (only rendered while `loading`). */
  onStop?: () => void
  /** A response is streaming: the send button becomes a stop button. */
  loading?: boolean
  disabled?: boolean
  /** Field padding, text size, and min-height (the submit button scales with it). @default "md" */
  size?: Size
}

export function PromptInput({
  value,
  defaultValue,
  onValueChange,
  onSubmit,
  onStop,
  loading = false,
  disabled = false,
  size = "md",
  className,
  children,
  ...props
}: PromptInputProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const current = isControlled ? value : internal

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  const submit = () => {
    if (disabled || loading || !current.trim()) return
    onSubmit?.(current)
    // Controlled callers clear by resetting `value`; uncontrolled we clear ourselves.
    if (!isControlled) setInternal("")
  }

  const stop = () => onStop?.()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  const slots = promptInputVariants({ size, disabled })

  return (
    <PromptInputProvider
      value={current}
      setValue={setValue}
      submit={submit}
      stop={stop}
      loading={loading}
      disabled={disabled}
      size={size}
      slots={slots}
    >
      <form
        data-slot="prompt-input"
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        className={slots.root({ className })}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </PromptInputProvider>
  )
}

// ─── PromptInputTextarea ──────────────────────────────────────────────────────

// Auto-resize rides native CSS `field-sizing: content` (no JS). Where the browser lacks it
// we measure `scrollHeight`. Detection is memoized and SSR-safe (`false` on the server), so
// the JS path only ever runs on the client. Mirrors the Textarea component's approach.
let fieldSizingSupported: boolean | null = null
function supportsFieldSizing() {
  if (fieldSizingSupported === null) {
    fieldSizingSupported =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("field-sizing", "content")
  }
  return fieldSizingSupported
}

// JS fallback: grow to fit content, clamped to the element's computed `max-height` (read from
// CSS, so no raw value lives here), toggling its own scrollbar past the cap. Writes inline
// style directly, no React state, so it stays clear of the repo's set-state-in-effect lint.
function autoSize(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  const max = Number.parseFloat(getComputedStyle(el).maxHeight)
  const next = Number.isFinite(max) ? Math.min(el.scrollHeight, max) : el.scrollHeight
  el.style.height = `${next}px`
  el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden"
}

export interface PromptInputTextareaProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "onChange" | "defaultValue"> {
  /**
   * Submit on Enter (Shift+Enter inserts a newline). Turn off for surfaces where Enter
   * should add a line and only the button (or ⌘+Enter) sends. @default true
   */
  submitOnEnter?: boolean
}

export function PromptInputTextarea({
  className,
  placeholder = "Ask anything…",
  submitOnEnter = true,
  disabled,
  onKeyDown,
  ref,
  ...props
}: PromptInputTextareaProps) {
  const { value, setValue, submit, disabled: ctxDisabled, slots } =
    usePromptInputContext("PromptInputTextarea")

  const innerRef = React.useRef<HTMLTextAreaElement | null>(null)
  const fallbackActive = !supportsFieldSizing()

  // Compose our measuring ref with the caller's; size on first mount.
  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      if (node && fallbackActive) autoSize(node)
    },
    [ref, fallbackActive],
  )

  // Re-fit when the value changes from the outside (paste, reset, controlled update).
  // Mutates style only, no state, so the strict hooks lint stays happy.
  React.useEffect(() => {
    if (fallbackActive && innerRef.current) autoSize(innerRef.current)
  }, [fallbackActive, value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    // IME guard: don't submit mid-composition (e.g. selecting a kanji candidate).
    const composing = event.nativeEvent.isComposing
    const enter = event.key === "Enter"
    const send = submitOnEnter
      ? enter && !event.shiftKey && !composing
      : enter && (event.metaKey || event.ctrlKey) && !composing
    if (send) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <textarea
      data-slot="prompt-input-textarea"
      ref={setRefs}
      rows={1}
      value={value}
      placeholder={placeholder}
      disabled={disabled ?? ctxDisabled}
      onChange={(event) => {
        setValue(event.target.value)
        if (fallbackActive) autoSize(event.currentTarget)
      }}
      onKeyDown={handleKeyDown}
      className={slots.textarea({ className })}
      {...props}
    />
  )
}

// ─── PromptInputToolbar ───────────────────────────────────────────────────────

export function PromptInputToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { slots } = usePromptInputContext("PromptInputToolbar")
  return (
    <div data-slot="prompt-input-toolbar" className={slots.toolbar({ className })} {...props} />
  )
}

// ─── PromptInputButton ────────────────────────────────────────────────────────

/**
 * A toolbar action: attach, model picker trigger, mic, etc. A thin wrapper over our
 * `Button` (ghost by default) so the bar's controls stay consistent with the DS and never
 * drift from the real recipe. Size tracks the composer (override with `size`).
 */
export function PromptInputButton({
  variant = "ghost",
  size,
  className,
  ...props
}: ButtonProps) {
  const { size: ctxSize } = usePromptInputContext("PromptInputButton")
  return (
    <Button
      data-slot="prompt-input-button"
      variant={variant}
      size={size ?? controlSize[ctxSize]}
      className={cn("text-muted-foreground", ICON_20, className)}
      {...props}
    />
  )
}

// ─── PromptInputSubmit ────────────────────────────────────────────────────────

export interface PromptInputSubmitProps
  extends Omit<ButtonProps, "children" | "iconOnly" | "asChild"> {
  /** Glyph for the send state. @default an upward arrow */
  children?: React.ReactNode
  sendLabel?: string
  stopLabel?: string
}

/**
 * The send⇄stop button: the defining AI affordance. While `loading` it renders a stop
 * button (`onStop`); otherwise it's a `type="submit"` send button, disabled until the
 * prompt has content. `ml-auto` claims the right edge of the toolbar. Wraps our `Button`.
 */
export function PromptInputSubmit({
  className,
  variant = "primary",
  size,
  sendLabel = "Send message",
  stopLabel = "Stop generating",
  // Pulled out so a stray `disabled` in `...props` can't clobber the computed value below
  // (later spreads win in JSX). A caller-passed `disabled` still forces the button off.
  disabled: disabledProp,
  children,
  ...props
}: PromptInputSubmitProps) {
  const { value, loading, disabled: ctxDisabled, stop, size: ctxSize } =
    usePromptInputContext("PromptInputSubmit")
  // Track the composer size unless the caller pins one explicitly: same height as the
  // toolbar's action buttons, so the bar reads as one set of controls.
  const buttonSize = size ?? controlSize[ctxSize]

  if (loading) {
    return (
      <Button
        data-slot="prompt-input-submit"
        type="button"
        iconOnly
        variant={variant}
        size={buttonSize}
        onClick={stop}
        aria-label={stopLabel}
        className={cn("ml-auto", ICON_20, className)}
        {...props}
      >
        <Stop weight="bold" />
      </Button>
    )
  }

  return (
    <Button
      data-slot="prompt-input-submit"
      type="submit"
      iconOnly
      variant={variant}
      size={buttonSize}
      disabled={disabledProp || ctxDisabled || value.trim().length === 0}
      aria-label={sendLabel}
      className={cn("ml-auto", ICON_20, className)}
      {...props}
    >
      {children ?? <ArrowUp weight="bold" />}
    </Button>
  )
}

// ─── PromptInputCount ─────────────────────────────────────────────────────────

export interface PromptInputCountProps
  extends Omit<React.ComponentProps<"span">, "children"> {
  /** Defaults to the composer's current character count; pass to override (e.g. tokens). */
  current?: number
  /** Optional limit: rendered as `current / max` and turns destructive once exceeded. */
  max?: number
}

export function PromptInputCount({
  current,
  max,
  className,
  ...props
}: PromptInputCountProps) {
  const { value, slots } = usePromptInputContext("PromptInputCount")
  const count = current ?? value.length
  const over = max != null && count > max
  return (
    <span
      data-slot="prompt-input-count"
      data-over={over || undefined}
      aria-live="polite"
      className={slots.count({ className: cn(over && "text-destructive", className) })}
      {...props}
    >
      {count}
      {max != null ? ` / ${max}` : null}
    </span>
  )
}

// ─── PromptInputBanner ────────────────────────────────────────────────────────

type BannerTone = NonNullable<VariantProps<typeof promptInputVariants>["tone"]>
type BannerSide = NonNullable<VariantProps<typeof promptInputVariants>["side"]>

// Outline icons only (DS rule) — no `weight`, default/regular weight throughout.
const BANNER_TONE_ICONS: Record<BannerTone, React.ElementType> = {
  default: Info,
  info: Info,
  warning: Warning,
  destructive: WarningCircle,
}

export interface PromptInputBannerProps extends React.ComponentProps<"div"> {
  /** Tone of the notice: tints the leading icon. @default "default" */
  tone?: BannerTone
  /**
   * Which edge the banner peeks from behind the composer. `top` sits above; `bottom` tucks below.
   * @default "top"
   */
  side?: BannerSide
  /**
   * Leading icon. Defaults to the tone's icon; pass a node to override, or `false` to drop it.
   */
  icon?: React.ReactNode | false
  /** When set, renders a dismiss (×) button on the right that calls this handler. */
  onClose?: () => void
  /** Accessible label for the dismiss button. @default "Dismiss" */
  closeLabel?: string
}

/**
 * A second card that sits *literally behind* the composer — model availability, usage caps,
 * errors. Place it as the sibling next to `<PromptInput>` (before it for `side="top"`, after for
 * `side="bottom"`) inside a `relative isolate flex flex-col` wrapper. Its negative margin lets the
 * composer overlap it so only a strip peeks out. Context-free: it carries no composer state.
 */
export function PromptInputBanner({
  tone = "default",
  side = "top",
  icon,
  onClose,
  closeLabel = "Dismiss",
  className,
  children,
  ...props
}: PromptInputBannerProps) {
  const slots = promptInputVariants({ tone, side })
  const ToneIcon = BANNER_TONE_ICONS[tone]
  const showIcon = icon !== false
  return (
    <div
      data-slot="prompt-input-banner"
      data-tone={tone}
      data-side={side}
      className={slots.banner({ className })}
      {...props}
    >
      <div className={slots.bannerRow()}>
        {showIcon && (
          <span data-slot="prompt-input-banner-icon" aria-hidden className={slots.bannerIcon()}>
            {icon ?? <ToneIcon weight="bold" />}
          </span>
        )}
        <div data-slot="prompt-input-banner-content" className={slots.bannerContent()}>
          {children}
        </div>
        {onClose && (
          <button
            type="button"
            data-slot="prompt-input-banner-close"
            aria-label={closeLabel}
            onClick={onClose}
            className={slots.bannerClose()}
          >
            <X weight="bold" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * An inline action inside a `PromptInputBanner` (e.g. "Learn more"). Renders a link-styled
 * button; add `className="ml-auto"` to push it to the right edge before the close button. Pass
 * `asChild`-style usage by rendering an `<a>` via the `render` prop pattern is unnecessary here —
 * for a real navigation, just style your own `<a>` with the same classes.
 */
export function PromptInputBannerAction({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="prompt-input-banner-action"
      type={type}
      className={staticSlots.bannerAction({ className })}
      {...props}
    />
  )
}

// ─── PromptInputSuggestions ───────────────────────────────────────────────────

/**
 * A row of prompt-starter chips, meant to sit *above* the composer. Context-free on
 * purpose: clicking a suggestion usually triggers a send, not just a fill, so the consumer
 * owns the `onClick` (set the prompt, submit, or both).
 */
export function PromptInputSuggestions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-suggestions"
      className={staticSlots.suggestions({ className })}
      {...props}
    />
  )
}

export function PromptInputSuggestion({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="prompt-input-suggestion"
      type={type}
      className={staticSlots.suggestion({ className })}
      {...props}
    />
  )
}

export { promptInputVariants }
