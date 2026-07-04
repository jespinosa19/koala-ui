"use client"

import * as React from "react"
import { SidebarSimple, ArrowsOutSimple } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { tv } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * AIPanel: the assistant sidepanel shell: a header, a scrollable conversation region, and a
 * pinned composer footer, as one flex column. The third piece of the AI module: it's the
 * surface that brings Chat and Prompt Input together (drop a `<Conversation>` in the body and
 * a `<PromptInput>` in the footer).
 *
 * It's pure layout: by default (`inline`) it fills its container (`h-full`), so it works both
 * docked in a page (a Copilot/Cursor-style rail) and dropped inside a `DrawerContent`, where
 * the Drawer supplies the chrome and slide animation. Exposes `--surface: var(--popover)` so
 * the nested composer blends with the panel, not the page.
 *
 * It can also manage its own window, Notion/Edge-style. Two extra view modes:
 * `split` (a full-height rail pinned to the right edge, the split-screen assistant) and
 * `floating` (a compact window hovering bottom-right). Drop an `AIPanelExpandToggle` in the
 * header to flip between them; the view is controllable via `view` / `defaultView` /
 * `onViewChange`. The split/floating panels are non-modal: the page stays interactive, so
 * closing is the host's call (conditionally render the panel, e.g. behind a launcher button).
 */
const aiPanelVariants = tv({
  slots: {
    root: [
      "flex h-full min-h-0 flex-col overflow-hidden",
      "bg-popover text-popover-foreground [--surface:var(--popover)]",
    ],
    // Header row: optional leading media (avatar/icon) · title/description column · actions.
    header: "flex shrink-0 items-center gap-3 border-b border-border-soft px-4 py-3",
    heading: "flex min-w-0 flex-col",
    title: "truncate text-sm leading-tight font-semibold",
    description: "truncate text-xs text-muted-foreground",
    actions: "ml-auto flex shrink-0 items-center gap-0.5",
    // The conversation region: the only scrolling part. `min-h-0` lets it shrink below its
    // content so `overflow-y-auto` engages inside the flex column (a Koala scroll-viewport
    // staple), keeping the header and composer pinned. `scroll-fade` softens the content into
    // the header/composer edges (a dropped-in Conversation doesn't scroll here, so the fade
    // rides this body, the actual scroller).
    body: "min-h-0 flex-1 overflow-y-auto px-4 py-4 scroll-fade",
    // The composer dock: never scrolls, sits against the panel's bottom edge.
    footer: "shrink-0 border-t border-border-soft p-3",
  },
  variants: {
    view: {
      // Embedded: fills whatever container it's placed in (page rail, Drawer, etc.).
      inline: {},
      // Split screen and floating both anchor to the bottom-right corner and size themselves
      // with explicit `bottom`/`right`/`width`/`height`/`border-radius` (no `auto` on any
      // animated property) so the toggle *morphs* between them via the shared transition below
      // a full-height rail collapsing into a card, not a snap. `top-auto` keeps the height
      // owned by `bottom + height`. The `animate-in` enter only fires on first mount (the
      // `enter` keyframe doesn't replay when the variant swaps), so the two never fight.
      split: {
        root: [
          "fixed top-auto right-0 bottom-0 z-40 h-[100dvh] w-[min(26rem,100vw)] rounded-none",
          "border border-border shadow-xl",
          "transition-[right,bottom,width,height,border-radius] duration-base ease-drawer",
          "animate-in fade-in-0 slide-in-from-right",
        ],
      },
      floating: {
        root: [
          "fixed top-auto right-4 bottom-4 z-40 h-[min(30rem,calc(100dvh-2rem))] w-[min(23rem,calc(100vw-2rem))] rounded-2xl",
          "border border-border shadow-xl",
          "transition-[right,bottom,width,height,border-radius] duration-base ease-drawer",
          "animate-in fade-in-0 slide-in-from-bottom-2",
        ],
      },
    },
  },
  defaultVariants: { view: "inline" },
})

export type AIPanelView = "inline" | "split" | "floating"
type AIPanelSlots = ReturnType<typeof aiPanelVariants>
const [AIPanelProvider, useAIPanelContext] = createContext<{
  slots: AIPanelSlots
  view: AIPanelView
  setView: (view: AIPanelView) => void
  toggleView: () => void
}>("AIPanel")

type AIPanelProps = React.ComponentProps<"div"> & {
  /** View mode (controlled): `inline` (fills container), `split` (right rail), `floating`. */
  view?: AIPanelView
  /** Initial view mode (uncontrolled). @default "inline" */
  defaultView?: AIPanelView
  /** Fires when the view mode changes. */
  onViewChange?: (view: AIPanelView) => void
}

// ─── AIPanel (root) ─────────────────────────────────────────────────────────

export function AIPanel({
  view: viewProp,
  defaultView = "inline",
  onViewChange,
  className,
  children,
  ...props
}: AIPanelProps) {
  const isControlled = viewProp !== undefined
  const [internalView, setInternalView] = React.useState<AIPanelView>(defaultView)
  const view = isControlled ? viewProp : internalView
  const slots = aiPanelVariants({ view })

  const setView = React.useCallback(
    (next: AIPanelView) => {
      if (!isControlled) setInternalView(next)
      onViewChange?.(next)
    },
    [isControlled, onViewChange],
  )
  // The header toggle flips between the two windowed modes: floating ⇄ split (anything that
  // isn't already floating expands into the split rail).
  const toggleView = React.useCallback(
    () => setView(view === "split" ? "floating" : "split"),
    [setView, view],
  )

  return (
    <AIPanelProvider slots={slots} view={view} setView={setView} toggleView={toggleView}>
      <div data-slot="ai-panel" data-view={view} className={slots.root({ className })} {...props}>
        {children}
      </div>
    </AIPanelProvider>
  )
}

// ─── AIPanelHeader ────────────────────────────────────────────────────────────

export function AIPanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelHeader")
  return <div data-slot="ai-panel-header" className={slots.header({ className })} {...props} />
}

/** Title + description column that grows between the leading media and the actions. */
export function AIPanelHeading({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelHeading")
  return <div data-slot="ai-panel-heading" className={slots.heading({ className })} {...props} />
}

export function AIPanelTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelTitle")
  return <div data-slot="ai-panel-title" className={slots.title({ className })} {...props} />
}

export function AIPanelDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelDescription")
  return (
    <div data-slot="ai-panel-description" className={slots.description({ className })} {...props} />
  )
}

// ─── AIPanelActions / AIPanelAction ─────────────────────────────────────────

export function AIPanelActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelActions")
  return <div data-slot="ai-panel-actions" className={slots.actions({ className })} {...props} />
}

/**
 * A header action: new chat, history, settings, close. A thin wrapper over our `Button`
 * (ghost + icon-only by default), so it inherits the press scale, focus ring, and a tooltip
 * from its `aria-label`.
 */
export function AIPanelAction({
  variant = "ghost",
  size = "sm",
  iconOnly = true,
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      data-slot="ai-panel-action"
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * The window-mode toggle: flips the panel between the split-screen rail and the floating
 * window. A thin `AIPanelAction` that swaps its icon and label with the current view, so it
 * inherits the press scale, focus ring, and a tooltip from its `aria-label`. In `split` it
 * offers "Float" (pop out to a window); otherwise it offers "Dock to side". Drop it in the
 * header `AIPanelActions` (it must live inside an `AIPanel`).
 */
export function AIPanelExpandToggle({ className, ...props }: ButtonProps) {
  const { view, toggleView } = useAIPanelContext("AIPanelExpandToggle")
  const split = view === "split"
  return (
    <AIPanelAction
      data-slot="ai-panel-expand-toggle"
      aria-label={split ? "Float" : "Dock to side"}
      onClick={toggleView}
      className={className}
      {...props}
    >
      {split ? <ArrowsOutSimple weight="bold" /> : <SidebarSimple weight="bold" />}
    </AIPanelAction>
  )
}

// ─── AIPanelBody ──────────────────────────────────────────────────────────────

/** The scrollable conversation region: drop a `<Conversation>` (Chat) inside. */
export function AIPanelBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelBody")
  return <div data-slot="ai-panel-body" className={slots.body({ className })} {...props} />
}

// ─── AIPanelFooter ────────────────────────────────────────────────────────────

/** The composer dock: drop a `<PromptInput>` (Prompt Input) inside. */
export function AIPanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useAIPanelContext("AIPanelFooter")
  return <div data-slot="ai-panel-footer" className={slots.footer({ className })} {...props} />
}

export { aiPanelVariants }
