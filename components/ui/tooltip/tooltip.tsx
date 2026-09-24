"use client"

import * as React from "react"
import tippy, { createSingleton } from "tippy.js/headless"
import { createPortal } from "react-dom"
import type { Instance, Props, Content, CreateSingletonInstance } from "tippy.js"

import { tv } from "@/lib/tv"

/**
 * Tooltip: a small text hint shown on hover/focus. Positioning, hover-intent and a11y come
 * from Tippy.js in **headless** mode, so Koala owns the markup: the bubble is a `tv` recipe
 * built from our tokens, not Tippy's default theme (no `tippy.js/dist/tippy.css` needed).
 * This is the one place Koala uses a non-Radix behavior primitive. See docs/ARCHITECTURE.md.
 *
 * Enter/exit is an interruptible CSS transition (polish) driven by a
 * `data-state` flip. In headless mode Tippy won't auto-unmount with `animation`, so we wait
 * for the exit `transitionend` before calling `instance.unmount()`, and cancel that wait if
 * a re-hover interrupts the exit.
 *
 * Wrap a set of tooltips in {@link TooltipGroup} to share ONE bubble that *glides* between
 * triggers (Tippy singleton): the smooth way to tooltip a toolbar or an avatar stack.
 */
export const tooltipVariants = tv({
  base: [
    "flex",
    // 12px label on the popover surface, hairline + soft shadow for depth.
    "rounded-md border border-border bg-popover text-popover-foreground text-xs",
    "max-w-xs text-pretty shadow-md select-none",
    // Interruptible transition: `transition` names opacity+scale+translate (never `transition: all`).
    "transition duration-fast ease-out",
    "data-[state=hidden]:opacity-0",
    "data-[state=visible]:opacity-100",
    // Grow out of the edge nearest the trigger.
    "data-[placement^=top]:origin-bottom data-[placement^=bottom]:origin-top",
    "data-[placement^=left]:origin-right data-[placement^=right]:origin-left",
  ],
  variants: {
    // Content shape. `text` is the default short-label hint: a single centered line.
    // `graph` hosts a richer multi-line data card (a title plus stats, like the body
    // shown over a chart bar), so it drops the centering for a left-aligned block and
    // trades the tight label padding for room to breathe.
    variant: {
      // Spec: centered, gap 4px, padding 2px 6px.
      text: "items-center justify-center gap-1 px-1.5 py-0.5",
      // Left-aligned block; padding 8px 12px so multi-line content isn't cramped. The gap
      // spaces stacked content blocks (header / separator / sections) when composing the
      // graph parts below; single-child content (a plain card) is unaffected.
      graph: "flex-col items-start gap-2 px-3 py-2 text-left",
    },
    transition: {
      // ShiftAway: scale down + slide away from the trigger on exit.
      default: [
        "data-[state=hidden]:scale-95 data-[state=visible]:scale-100",
        "data-[placement^=top]:data-[state=hidden]:-translate-y-1",
        "data-[placement^=bottom]:data-[state=hidden]:translate-y-1",
        "data-[placement^=left]:data-[state=hidden]:-translate-x-1",
        "data-[placement^=right]:data-[state=hidden]:translate-x-1",
      ],
      // Singleton: opacity-only. The `moveTransition` glide handles spatial motion.
      singleton: ["scale-100"],
    },
  },
  defaultVariants: {
    variant: "text",
    transition: "default",
  },
})

/** Stash the in-flight exit cleanup on the instance so a re-show can cancel it. */
type TooltipInstance = Instance & { _koalaCancelExit?: () => void }

function box(instance: Instance): HTMLElement | null {
  return instance.popper.firstElementChild as HTMLElement | null
}

/** Fade+scale the bubble in once Tippy has mounted/positioned it. */
function handleMount(instance: Instance) {
  ;(instance as TooltipInstance)._koalaCancelExit?.()
  const el = box(instance)
  if (!el) return
  // Stamp the Popper.js-computed placement so CSS origin/translate rules fire correctly.
  const p = (
    instance as unknown as { popperInstance?: { state?: { placement?: string } } }
  ).popperInstance?.state?.placement
  if (p) el.setAttribute("data-placement", p)
  requestAnimationFrame(() => el.setAttribute("data-state", "visible"))
}

/** Fade+scale the bubble out, then unmount once the exit transition ends. */
function handleHide(instance: Instance) {
  const el = box(instance)
  // No bubble to fade (it hid before the portal committed, which a fast hover or arrow-keying
  // across a TooltipGroup will do), so unmount straight away. It has to leave this call stack
  // first: tippy runs `onHide` from inside `hide()` while `state.isVisible` is still true, and
  // `unmount()` calls `hide()` again whenever it sees that flag, so unmounting inline recurses
  // until the stack blows. By the microtask, `hide()` has returned and the flag is down.
  if (!el) {
    queueMicrotask(() => instance.unmount())
    return
  }
  el.setAttribute("data-state", "hidden")
  const onEnd = (event: TransitionEvent) => {
    if (event.target !== el || event.propertyName !== "opacity") return
    cancel()
    instance.unmount()
  }
  const cancel = () => el.removeEventListener("transitionend", onEnd)
  ;(instance as TooltipInstance)._koalaCancelExit = cancel
  el.addEventListener("transitionend", onEnd)
}

/** The bubble itself, shared by the standalone tooltip and the singleton group. */
function TooltipBubble({
  attrs,
  className,
  variant,
  transition,
  children,
}: {
  attrs: Record<string, unknown>
  className?: string
  variant?: "text" | "graph"
  transition?: "default" | "singleton"
  children: React.ReactNode
}) {
  return (
    <div
      role="tooltip"
      data-slot="tooltip"
      data-state="hidden"
      tabIndex={-1}
      className={tooltipVariants({ className, variant, transition })}
      {...attrs}
    >
      {children}
    </div>
  )
}

/**
 * Set by {@link TooltipGroup}. A child {@link Tooltip} inside a group registers its trigger
 * tippy instance here; the group feeds the collected instances to tippy's `createSingleton`
 * so one shared bubble glides between them. Returns an unregister cleanup.
 */
type RegisterTrigger = (instance: Instance) => () => void
const TooltipGroupContext = React.createContext<RegisterTrigger | null>(null)

export interface TooltipProps {
  /** The hint contents: text, or text plus a small leading glyph (the 4px gap). */
  content: React.ReactNode
  /** The trigger. Must be a single element that forwards its ref to a DOM node. */
  children: React.ReactElement
  /**
   * Content shape: `text` (default) is a single centered label; `graph` is a roomier
   * left-aligned block for a multi-line data card (e.g. a stat readout over a chart bar).
   * Ignored on a `Tooltip` inside a `TooltipGroup`; set it on the group instead.
   */
  variant?: "text" | "graph"
  placement?: Props["placement"]
  /** Hover-intent delay in ms: `[open, close]` or a single number for both. Ignored in a group. */
  delay?: Props["delay"]
  /** Distance from the trigger as `[skidding, distance]`. Ignored in a group. */
  offset?: Props["offset"]
  /** Keep the tooltip open while hovered, for tooltips with links/actions. */
  interactive?: boolean
  /**
   * Space-separated event names that open the tooltip. Defaults to `"mouseenter focus"`.
   * Use `"mouseenter"` to suppress focus-triggered tooltips (e.g. inside dialogs where
   * Radix auto-focuses the first interactive element on open).
   */
  trigger?: string
  /**
   * Whether clicking the trigger hides the tooltip. Tippy defaults to `true`; pass `false`
   * for a toggle control (play/pause, mute) whose label changes on click, so the hint stays
   * up and its text can cross-fade in place instead of vanishing on every click.
   */
  hideOnClick?: boolean
  disabled?: boolean
  className?: string
}

export function Tooltip({
  content,
  children,
  variant,
  placement = "top",
  delay = [150, 0],
  offset = [0, 6],
  interactive,
  trigger,
  hideOnClick,
  disabled,
  className,
}: TooltipProps) {
  const register = React.useContext(TooltipGroupContext)

  // Inside a group: register this trigger with the group's shared (singleton) bubble.
  // Like the standalone path, this owns the trigger ref the React 19 way (children.props.ref),
  // so it never reads the deprecated element.ref getter that @tippyjs/react tripped.
  if (register) {
    return (
      <GroupTooltip register={register} content={content} placement={placement} trigger={trigger}>
        {children}
      </GroupTooltip>
    )
  }

  // Standalone: bypass @tippyjs/react entirely to avoid the React 19 element.ref crash.
  return (
    <StandaloneTooltip
      content={content}
      variant={variant}
      placement={placement}
      delay={delay}
      offset={offset}
      interactive={interactive}
      trigger={trigger}
      hideOnClick={hideOnClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </StandaloneTooltip>
  )
}

/**
 * Direct tippy.js implementation of the standalone (non-group) tooltip.
 *
 * @tippyjs/react 4.x reads the deprecated `element.ref` getter when it clones the trigger
 * child in React 19, which crashes in headless-with-render-prop mode. This component owns
 * the trigger ref directly (via `children.props.ref`, the React 19 API) and drives
 * tippy.js imperatively in a `useEffect`, so the React wrapper never touches `element.ref`.
 */
function StandaloneTooltip({
  content,
  children,
  variant,
  placement = "top",
  delay = [150, 0],
  offset = [0, 6],
  interactive,
  trigger,
  hideOnClick,
  disabled,
  className,
}: TooltipProps) {
  const [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null)
  // The portal target is tippy's imperatively-created popper element. Hold it in state (not a
  // ref) so the bubble re-renders into it once it exists, without reading a ref during render.
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  const instanceRef = React.useRef<Instance | null>(null)

  // Mutable ref so the stable refCallback can forward the original child ref without
  // capturing a stale closure over `children`. The useLatest pattern: written in render but
  // only ever read later inside the ref callback, so the render-time write is safe.
  const childOrigRefRef = React.useRef<React.Ref<unknown> | undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/refs
  childOrigRefRef.current = (children as React.ReactElement<any>).props?.ref

  // Stable ref callback: captures the trigger DOM node and forwards any original child ref.
  // Reads `children.props.ref` (React 19 way); never accesses the deprecated `element.ref`.
  const triggerRefCallback = React.useCallback((node: HTMLElement | null) => {
    setTriggerEl(node)
    const origRef = childOrigRefRef.current
    if (typeof origRef === "function") {
      ;(origRef as (node: HTMLElement | null) => void)(node)
    } else if (origRef != null && typeof origRef === "object") {
      ;(origRef as React.MutableRefObject<HTMLElement | null>).current = node
    }
  }, [])

  // Create the tippy.js instance once the trigger element mounts.
  // Only re-runs when the trigger DOM element itself is replaced.
  // Prop changes are handled by the sync effect below.
  React.useEffect(() => {
    if (!triggerEl) return
    const popperEl = document.createElement("div")
    const instance = tippy(triggerEl, {
      render: () => ({ popper: popperEl }),
      placement,
      delay: delay as Props["delay"],
      offset: offset as [number, number],
      interactive: interactive ?? false,
      trigger: trigger ?? "mouseenter focus",
      hideOnClick: hideOnClick ?? true,
      animation: true,
      onMount: handleMount,
      onHide: handleHide,
    }) as Instance
    if (disabled) instance.disable()
    instanceRef.current = instance
    // Keep the bubble centered on the trigger when its content resizes (e.g. a label whose width
    // animates Play↔Pause): Popper only repositions on its own scroll/resize events, so nudge it
    // on every size change of the popper, otherwise it grows from one edge and drifts off-center.
    const ro = new ResizeObserver(() => instance.popperInstance?.forceUpdate())
    ro.observe(popperEl)
    // Hand the imperatively-created popper to React so the bubble portals into it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(popperEl)
    return () => {
      ro.disconnect()
      instance.destroy()
      instanceRef.current = null
      setContainer(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEl])

  // Keep tippy in sync with prop changes without recreating the instance.
  React.useEffect(() => {
    const inst = instanceRef.current
    if (!inst) return
    inst.setProps({
      placement,
      delay: delay as Props["delay"],
      offset: offset as [number, number],
      interactive: interactive ?? false,
      trigger: trigger ?? "mouseenter focus",
      hideOnClick: hideOnClick ?? true,
    })
    if (disabled) inst.disable()
    else inst.enable()
  }, [placement, delay, offset, interactive, trigger, hideOnClick, disabled])

  // Pass our stable ref callback to the trigger child.
  // `cloneElement` here only SETS `ref`; it never reads `element.ref`, so no React 19 warning.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerNode = React.cloneElement(children as React.ReactElement<any>, { ref: triggerRefCallback })

  return (
    <>
      {triggerNode}
      {container &&
        createPortal(
          // attrs is empty here; handleMount stamps data-placement on this element
          // from the Popper.js-computed placement so CSS origin/translate rules fire correctly.
          <TooltipBubble attrs={{}} className={className} variant={variant}>
            {content}
          </TooltipBubble>,
          container,
        )}
    </>
  )
}

/**
 * GroupTooltip: a {@link Tooltip} rendered inside a {@link TooltipGroup}. It creates a tippy
 * instance on its trigger and registers it with the group; the group hands every registered
 * instance to tippy's `createSingleton`, which disables the individual poppers and drives ONE
 * shared bubble that glides between the triggers. Owns its trigger ref via the React 19
 * `children.props.ref` API, so (unlike @tippyjs/react) it never reads the deprecated `element.ref`.
 */
function GroupTooltip({
  register,
  content,
  children,
  placement = "top",
  trigger,
}: {
  register: RegisterTrigger
  content: React.ReactNode
  children: React.ReactElement
  placement?: Props["placement"]
  trigger?: string
}) {
  const [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null)
  const instanceRef = React.useRef<Instance | null>(null)

  // Same stable-ref-forwarding dance as StandaloneTooltip (useLatest): read children.props.ref
  // (React 19) in render but only consume it later in the ref callback; never the deprecated getter.
  const childOrigRefRef = React.useRef<React.Ref<unknown> | undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react-hooks/refs
  childOrigRefRef.current = (children as React.ReactElement<any>).props?.ref

  const triggerRefCallback = React.useCallback((node: HTMLElement | null) => {
    setTriggerEl(node)
    const origRef = childOrigRefRef.current
    if (typeof origRef === "function") {
      ;(origRef as (node: HTMLElement | null) => void)(node)
    } else if (origRef != null && typeof origRef === "object") {
      ;(origRef as React.MutableRefObject<HTMLElement | null>).current = node
    }
  }, [])

  // Create the trigger instance and register it with the group. The instance's own popper is a
  // throwaway: createSingleton disables it and paints content through the shared bubble. The
  // `content`/`placement` stay on the instance's props so the group can read them on hover.
  React.useEffect(() => {
    if (!triggerEl) return
    const instance = tippy(triggerEl, {
      // Required by headless tippy, but never shown — the singleton owns display.
      render: () => ({ popper: document.createElement("div") }),
      // Headless tippy never renders `content` itself; it's opaque data the group reads back
      // and paints through the shared bubble, so passing a React node here is safe.
      content: content as unknown as Content,
      placement,
      trigger: trigger ?? "mouseenter focus",
    }) as Instance
    instanceRef.current = instance
    const unregister = register(instance)
    return () => {
      // Drop it from the singleton's list BEFORE destroying, so it never references a dead instance.
      unregister()
      instance.destroy()
      instanceRef.current = null
    }
    // Prop changes are handled by the sync effect below; only recreate on a new trigger node.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEl])

  // Keep content/placement in sync. Never enable/disable the instance here: createSingleton
  // disables every child to take over their triggers, so re-enabling would break the glide.
  React.useEffect(() => {
    instanceRef.current?.setProps({
      content: content as unknown as Content,
      placement,
      trigger: trigger ?? "mouseenter focus",
    })
  }, [content, placement, trigger])

  // cloneElement only SETS ref; it never reads element.ref, so no React 19 warning.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.cloneElement(children as React.ReactElement<any>, { ref: triggerRefCallback })
}

export interface TooltipGroupProps {
  children: React.ReactNode
  /** Content shape of the shared bubble: `text` (default) or `graph`. See {@link TooltipProps.variant}. */
  variant?: "text" | "graph"
  /** Hover-intent delay shared by the group, in ms: `[open, close]` or a single number. */
  delay?: Props["delay"]
  /** Distance from each trigger as `[skidding, distance]`. */
  offset?: Props["offset"]
  disabled?: boolean
  /** Classes merged onto the shared bubble. */
  className?: string
}

/**
 * TooltipGroup: share a single bubble across many {@link Tooltip} triggers so it *glides*
 * from one to the next instead of each fading out and in with its own delay. The smooth choice
 * for an avatar stack, a toolbar, or a segmented control.
 *
 * Built on raw tippy's `createSingleton` (not @tippyjs/react) so it never reads the deprecated
 * React 19 `element.ref` getter. Children register their trigger instances through context; this
 * collects them into one singleton and portals the shared bubble. The bubble's content mirrors
 * the hovered trigger through the headless render's `onUpdate` hook.
 */
export function TooltipGroup({
  children,
  variant,
  delay = [150, 0],
  offset = [0, 6],
  disabled,
  className,
}: TooltipGroupProps) {
  const [content, setContent] = React.useState<React.ReactNode>(null)
  // Portal target for the shared bubble: tippy's imperatively-created popper, held in state so
  // the bubble renders into it once it exists without reading a ref during render.
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  const singletonRef = React.useRef<CreateSingletonInstance | null>(null)
  const instancesRef = React.useRef<Instance[]>([])

  // Push the current trigger list onto the singleton (no-op until it's created below).
  const syncInstances = React.useCallback(() => {
    singletonRef.current?.setInstances(instancesRef.current)
  }, [])

  // Children register in their own effects, which run before this parent's effect — so by the
  // time the singleton is built, every trigger instance is already in the list.
  const register = React.useCallback<RegisterTrigger>(
    (instance) => {
      instancesRef.current = [...instancesRef.current, instance]
      syncInstances()
      return () => {
        instancesRef.current = instancesRef.current.filter((i) => i !== instance)
        syncInstances()
      }
    },
    [syncInstances],
  )

  React.useEffect(() => {
    const popperEl = document.createElement("div")
    const singleton = createSingleton(instancesRef.current, {
      // Per-trigger placement wins; `content` always tracks the hovered trigger.
      overrides: ["placement"],
      delay: delay as Props["delay"],
      offset: offset as [number, number],
      // The glide: animate the popper's move between triggers (named prop, not `all`).
      moveTransition: "transform var(--duration-fast) var(--ease-out)",
      onMount: handleMount,
      onHide: handleHide,
      render: () => ({
        popper: popperEl,
        // Fires on every setProps; createSingleton sets `content` to the hovered trigger's node.
        onUpdate: (prev, next) => {
          if (prev.content !== next.content) setContent(next.content as React.ReactNode)
        },
      }),
    })
    if (disabled) singleton.disable()
    singletonRef.current = singleton
    // Hand the imperatively-created popper to React so the shared bubble portals into it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(popperEl)
    return () => {
      singleton.destroy()
      singletonRef.current = null
      setContainer(null)
    }
    // delay/offset/disabled are synced below; the singleton itself is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const s = singletonRef.current
    if (!s) return
    s.setProps({ delay: delay as Props["delay"], offset: offset as [number, number] })
    if (disabled) s.disable()
    else s.enable()
  }, [delay, offset, disabled])

  return (
    <TooltipGroupContext.Provider value={register}>
      {children}
      {container &&
        createPortal(
          <TooltipBubble attrs={{}} className={className} variant={variant} transition="singleton">
            {content}
          </TooltipBubble>,
          container,
        )}
    </TooltipGroupContext.Provider>
  )
}

/* -------------------------------------------------------------- graph content --- */

/**
 * Building blocks for a rich `variant="graph"` tooltip: a header with a trailing value chip,
 * a hairline separator, and tone-railed sections of label / percent / value stat rows (a
 * capacity or breakdown readout). Drop these into a graph {@link Tooltip}'s `content`. The
 * rail color is a token role (`tone`), never a raw hex, so it tracks the theme.
 */
export const tooltipGraphVariants = tv({
  slots: {
    header: "flex w-full items-start justify-between gap-4",
    headerText: "flex min-w-0 flex-col gap-0.5",
    title: "text-sm font-semibold leading-tight text-balance text-popover-foreground",
    description: "text-xs text-muted-foreground",
    // Value chip: one tonal step off the popover surface, tabular so columns of times align.
    value:
      "inline-flex shrink-0 items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-popover-foreground",
    separator: "h-px w-full bg-border",
    // Colored rail: a rounded pseudo-bar inset from the section's top/bottom edges (so it
    // reads as a pill, not a full-height border). `tone` paints it.
    section:
      "relative flex w-full flex-col gap-1.5 pl-3 before:absolute before:inset-y-0.5 before:left-0 before:w-0.5 before:rounded-full before:content-['']",
    stat: "flex items-center gap-2.5",
    statLabel: "min-w-0 flex-1 truncate text-xs text-popover-foreground",
    statPercent: "shrink-0 text-xs tabular-nums text-muted-foreground",
  },
  variants: {
    tone: {
      brand: { section: "before:bg-brand" },
      info: { section: "before:bg-info" },
      success: { section: "before:bg-success" },
      warning: { section: "before:bg-warning" },
      destructive: { section: "before:bg-destructive" },
      // High-contrast neutral rail (white on dark themes, near-black on light).
      neutral: { section: "before:bg-foreground" },
    },
    // Nested stat rows sit a step in from their parent.
    indent: { true: { stat: "pl-3" } },
  },
  defaultVariants: { tone: "brand" },
})

/** Header row: the title block (use {@link TooltipHeaderText}) plus a trailing {@link TooltipValue}. */
export function TooltipHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tooltip-header" className={tooltipGraphVariants().header({ className })} {...props} />
}

/** The stacked title + description column inside {@link TooltipHeader}. */
export function TooltipHeaderText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="tooltip-header-text" className={tooltipGraphVariants().headerText({ className })} {...props} />
  )
}

export function TooltipTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tooltip-title" className={tooltipGraphVariants().title({ className })} {...props} />
}

export function TooltipDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="tooltip-description" className={tooltipGraphVariants().description({ className })} {...props} />
  )
}

/** The tonal value pill (a time, count, or amount). Reused by the header and every stat row. */
export function TooltipValue({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="tooltip-value" className={tooltipGraphVariants().value({ className })} {...props} />
}

export function TooltipSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      data-slot="tooltip-separator"
      className={tooltipGraphVariants().separator({ className })}
      {...props}
    />
  )
}

export type TooltipTone = "brand" | "info" | "success" | "warning" | "destructive" | "neutral"

export interface TooltipSectionProps extends React.ComponentProps<"div"> {
  /** Color of the left rail. A token role, not a raw color, so it tracks the theme. */
  tone?: TooltipTone
}

/** A group of stat rows banded by a colored left rail. */
export function TooltipSection({ className, tone, ...props }: TooltipSectionProps) {
  return (
    <div data-slot="tooltip-section" className={tooltipGraphVariants({ tone }).section({ className })} {...props} />
  )
}

export interface TooltipStatProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  /** The value pill on the right (time, count, amount). */
  value: React.ReactNode
  /** Optional share/percent, shown muted just before the value. */
  percent?: React.ReactNode
  /** Nest the row one step in from its parent (e.g. a sub-line under a total). */
  indent?: boolean
}

/** One breakdown row: a label, an optional percent, and a {@link TooltipValue} pill. */
export function TooltipStat({ className, label, value, percent, indent, ...props }: TooltipStatProps) {
  const slots = tooltipGraphVariants({ indent })
  return (
    <div data-slot="tooltip-stat" className={slots.stat({ className })} {...props}>
      <span className={slots.statLabel()}>{label}</span>
      {percent != null && <span className={slots.statPercent()}>{percent}</span>}
      <TooltipValue>{value}</TooltipValue>
    </div>
  )
}
