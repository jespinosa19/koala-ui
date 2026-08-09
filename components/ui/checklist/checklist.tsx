"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { Check } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Checklist: the onboarding / "get started" / pending-actions panel. A card that tracks
 * a short list of setup tasks and their progress: some done, some the next recommended
 * step, the rest still to do. Built like Card/List/ActivityFeed: one `tv` recipe with
 * `slots`, shared state (the resolved slots + the derived progress) flowing to every part
 * through React Context, never prop-drilled or cloned. See docs/ARCHITECTURE.md §2.
 *
 * The progress is *derived*, not decorated: pass `value` (completed count) and `total` on
 * the root and `ChecklistProgress` renders the labeled bar and the "3 of 6" read-out
 * itself, tabular so a step flipping done never reflows the line. The bar fills brand while
 * there's work left and shifts to success-green the moment everything's done, so the panel
 * rewards completion without any per-call-site wiring.
 *
 * Each `ChecklistItem` carries a `status` (`todo` | `active` | `complete`) that styles the
 * row and auto-renders its indicator: the task's own `icon` for a pending step, cross-faded
 * to a check the instant it completes (the password-strength icon-swap, no motion lib). The
 * one recommended next step takes `active` for a soft brand highlight; completed rows
 * de-emphasize their title via a `data-status` group selector, no second context.
 */
export const checklistVariants = tv({
  slots: {
    // The outer card. Concentric anchor: 2xl (24px) so nested item pills step down to xl and
    // their buttons to md. Shadow over a hard border for depth (#3).
    root: "rounded-2xl border border-border bg-card text-card-foreground shadow-xs",
    // The header block: heading, description, then the progress bar.
    header: "flex flex-col gap-1.5",
    title: "text-balance text-base font-semibold text-foreground",
    description: "text-pretty text-sm text-muted-foreground",
    // The labeled progress bar. `mt-4` separates it from the description without inflating the
    // tight title↔description gap above it.
    progress: "mt-4 flex flex-col gap-2",
    progressMeta: "flex items-center justify-between gap-3 text-sm",
    // The completed count. tabular-nums (#9) so "3 of 6" → "4 of 6" never nudges the row.
    progressLabel: "flex items-center gap-1.5 font-medium tabular-nums text-foreground",
    progressPercent: "tabular-nums text-muted-foreground",
    // The rail. overflow-hidden clips the fill to the pill radius.
    track: "relative h-2 w-full overflow-hidden rounded-full bg-muted",
    // The fill. Width + color animate (never `transition: all`, #14) so the bar glides as steps
    // complete instead of snapping, and eases to green at 100%.
    bar: "h-full rounded-full bg-brand transition-[width,background-color] duration-slow ease-out",
    // The task list.
    items: "flex flex-col gap-1",
    // One task row. items-start keeps the indicator on the title's line when the description
    // wraps; the pill radius steps down concentrically from the card.
    item: "relative flex items-start gap-3 rounded-xl transition-colors duration-base ease-out",
    // The status indicator: a 28px circle holding the task icon, cross-fading to a check on
    // completion. Fixed footprint so the row's left rail never shifts between states.
    indicator:
      "relative flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-base ease-out [&_svg]:size-4",
    // Title + description column. min-w-0 lets a long title wrap instead of shoving the action
    // off the row. pt-0.5 optically centers the first line against the 28px indicator.
    content: "flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5",
    // Completed titles de-emphasize; the transition makes the flip feel deliberate.
    itemTitle:
      "text-pretty text-sm font-medium text-foreground transition-colors duration-base ease-out group-data-[status=complete]/item:text-muted-foreground",
    itemDescription: "text-pretty text-sm text-muted-foreground",
    // Trailing action slot: a Button ("Start", "Set up"), a Badge, or nothing on a done row.
    // self-center rides the action on the row's optical middle; ml-auto pins it right.
    action: "ml-auto flex shrink-0 items-center self-center pl-3",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). For the Checklist it
    // tunes the card padding and the per-row padding; the indicator footprint stays fixed so
    // the left rail aligns identically at both densities. comfortable reproduces the default.
    density: {
      comfortable: {
        header: "px-6 pt-6 pb-5",
        items: "px-3 pb-3",
        item: "gap-3 p-3",
      },
      compact: {
        header: "px-5 pt-5 pb-4",
        items: "px-2.5 pb-2.5",
        item: "gap-3 p-2.5",
      },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

type ChecklistSlots = ReturnType<typeof checklistVariants>

/** A task's state in the checklist. */
export type ChecklistStatus = "todo" | "active" | "complete"

/**
 * Soft per-status styling for the row pill. `active` (the one recommended next step) gets an
 * inset brand tint + ring so the eye lands on it; todo/complete rows stay chrome-less. Follows
 * the Badge/ActivityFeed record pattern so it re-themes across all four palettes.
 */
const ITEM_STATUS: Record<ChecklistStatus, string> = {
  todo: "",
  active: "bg-brand/[0.06] ring-1 ring-inset ring-brand/25",
  complete: "",
}

/** The indicator circle per status: a soft outline for todo, a brand ring for the active step,
 *  a filled success disc for a completed one (white check reads AA on the saturated green). */
const INDICATOR_STATUS: Record<ChecklistStatus, string> = {
  todo: "border border-border bg-transparent text-muted-foreground",
  active: "border-2 border-brand bg-brand/10 text-brand",
  complete: "border-transparent bg-success text-white",
}

const [ChecklistProvider, useChecklistContext] = createContext<{
  slots: ChecklistSlots
  value: number
  total: number
  percent: number
  complete: boolean
}>("Checklist")

export interface ChecklistProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof checklistVariants> {
  /** Number of completed tasks. Drives the progress bar and the "{value} of {total}" read-out. */
  value: number
  /** Total number of tasks. */
  total: number
  asChild?: boolean
}

/**
 * Parts are exported individually (not `Checklist.Item` dot-notation) because namespaced
 * statics don't survive the RSC server→client boundary; only named exports do. Compose as
 * `<Checklist><ChecklistHeader>…<ChecklistProgress/></ChecklistHeader><ChecklistItems>…`.
 */
export function Checklist({
  className,
  value,
  total,
  density,
  asChild = false,
  ...props
}: ChecklistProps) {
  const slots = checklistVariants({ density: useDensity(density) })
  // Clamp so a bad count can never overrun the bar or report >100%.
  const safeTotal = Math.max(0, total)
  const safeValue = Math.min(Math.max(0, value), safeTotal)
  const percent = safeTotal === 0 ? 0 : Math.round((safeValue / safeTotal) * 100)
  const complete = safeTotal > 0 && safeValue >= safeTotal
  const Comp = asChild ? Slot.Root : "div"

  return (
    <ChecklistProvider
      slots={slots}
      value={safeValue}
      total={safeTotal}
      percent={percent}
      complete={complete}
    >
      <Comp data-slot="checklist" className={slots.root({ className })} {...props} />
    </ChecklistProvider>
  )
}

/** The header block: drop a `ChecklistTitle`, `ChecklistDescription`, and `ChecklistProgress` in. */
export function ChecklistHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistHeader")
  return <div data-slot="checklist-header" className={slots.header({ className })} {...props} />
}

export interface ChecklistTitleProps extends React.ComponentProps<"h3"> {
  asChild?: boolean
}

/** The panel heading, e.g. "Finish setting up your workspace". */
export function ChecklistTitle({ className, asChild = false, ...props }: ChecklistTitleProps) {
  const { slots } = useChecklistContext("ChecklistTitle")
  const Comp = asChild ? Slot.Root : "h3"
  return <Comp data-slot="checklist-title" className={slots.title({ className })} {...props} />
}

/** The muted supporting line under the title. */
export function ChecklistDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useChecklistContext("ChecklistDescription")
  return (
    <p data-slot="checklist-description" className={slots.description({ className })} {...props} />
  )
}

export interface ChecklistProgressProps extends React.ComponentProps<"div"> {
  /**
   * Leading label. Defaults to a live "{value} of {total} complete" that swaps to
   * "All steps complete" (with a check) once everything's done. Pass a node to override.
   */
  label?: React.ReactNode
}

/**
 * ChecklistProgress: the labeled bar. Reads the derived progress off context and renders a
 * `role="progressbar"` track whose fill animates its width as steps complete and shifts from
 * brand to success at 100%. The count and percentage are tabular so the line never reflows.
 */
export function ChecklistProgress({ className, label, ...props }: ChecklistProgressProps) {
  const { slots, value, total, percent, complete } = useChecklistContext("ChecklistProgress")
  const defaultLabel = complete ? (
    <>
      <Check weight="bold" className="size-4 text-success" aria-hidden />
      <span className="text-success">All steps complete</span>
    </>
  ) : (
    `${value} of ${total} complete`
  )

  return (
    <div data-slot="checklist-progress" className={slots.progress({ className })} {...props}>
      <div className={slots.progressMeta()}>
        <span className={slots.progressLabel()}>{label ?? defaultLabel}</span>
        <span className={slots.progressPercent()}>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${value} of ${total} complete`}
        className={slots.track()}
      >
        <div
          data-slot="checklist-bar"
          className={slots.bar({ className: complete ? "bg-success" : "" })}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

/** The task list wrapper: a semantic `<ul>` of `ChecklistItem`s. */
export function ChecklistItems({ className, ...props }: React.ComponentProps<"ul">) {
  const { slots } = useChecklistContext("ChecklistItems")
  return <ul data-slot="checklist-items" className={slots.items({ className })} {...props} />
}

const STATUS_LABEL: Record<ChecklistStatus, string> = {
  todo: "Not started",
  active: "In progress",
  complete: "Completed",
}

export interface ChecklistItemProps extends React.ComponentProps<"li"> {
  /** The task's state. Styles the row and its indicator. @default "todo" */
  status?: ChecklistStatus
  /**
   * The task's glyph, shown in the indicator while pending and cross-faded to a check once
   * complete. Optional: without it a pending row shows an empty circle carrying just the status.
   */
  icon?: React.ReactNode
}

/**
 * ChecklistItem: one task row. Renders its status indicator automatically (the `icon`
 * cross-fading to a check on completion), then lays out the composed `ChecklistItemContent`
 * and `ChecklistItemAction`. Sets `data-status` so descendants (the title) can react without a
 * second context, and an sr-only status so the row's state is announced, not just colored.
 */
export function ChecklistItem({
  className,
  status = "todo",
  icon,
  children,
  ...props
}: ChecklistItemProps) {
  const { slots } = useChecklistContext("ChecklistItem")
  const isComplete = status === "complete"

  return (
    <li
      data-slot="checklist-item"
      data-status={status}
      className={cn("group/item", slots.item({ className: [ITEM_STATUS[status], className] }))}
      {...props}
    >
      <span
        data-slot="checklist-indicator"
        aria-hidden
        className={slots.indicator({ className: INDICATOR_STATUS[status] })}
      >
        {/* Cross-fade icon → check with opacity/scale/blur (the password-strength swap, no
            motion lib). Both stay mounted and absolutely stacked (inset-0 so each layer fills
            the circle and centers its glyph) so nothing reflows on the flip. */}
        <Check
          weight="bold"
          className={cn(
            "absolute inset-0 m-auto transition-[opacity,scale,filter] duration-base ease-out",
            isComplete
              ? "opacity-100 scale-100 blur-[0px]"
              : "opacity-0 scale-[0.25] blur-[4px]",
          )}
        />
        {icon != null && (
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-[opacity,scale,filter] duration-base ease-out",
              isComplete
                ? "opacity-0 scale-[0.25] blur-[4px]"
                : "opacity-100 scale-100 blur-[0px]",
            )}
          >
            {icon}
          </span>
        )}
      </span>
      {children}
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </li>
  )
}

/** Wraps the title + description; flexes to fill so the action rides the right edge. */
export function ChecklistItemContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemContent")
  return (
    <div data-slot="checklist-item-content" className={slots.content({ className })} {...props} />
  )
}

/** The task name. Auto-mutes on a completed row via the item's `data-status` group selector. */
export function ChecklistItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemTitle")
  return <div data-slot="checklist-item-title" className={slots.itemTitle({ className })} {...props} />
}

/** The muted secondary line under the task name. */
export function ChecklistItemDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemDescription")
  return (
    <div
      data-slot="checklist-item-description"
      className={slots.itemDescription({ className })}
      {...props}
    />
  )
}

/**
 * The trailing action slot: drop a `Button` ("Start", "Set up") for a pending task, or leave it
 * off a completed row. When `status` is `active` the recommended CTA typically goes brand-primary.
 */
export function ChecklistItemAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemAction")
  return <div data-slot="checklist-item-action" className={slots.action({ className })} {...props} />
}
