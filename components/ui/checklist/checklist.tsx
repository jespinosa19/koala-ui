"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive, Slot } from "radix-ui"
import { Check } from "@phosphor-icons/react"

import { AnimatedNumber } from "@/components/ui/animated-number"
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
 * itself, tabular so a step flipping done never reflows the line. Leave them out and the
 * Checklist counts its own items instead (each `ChecklistItem` reports whether it is done).
 * The bar fills brand while there's work left and shifts to success-green the moment
 * everything's done, so the panel rewards completion without any per-call-site wiring.
 *
 * Each `ChecklistItem` carries a `status` (`todo` | `active` | `complete`) that styles the
 * row and auto-renders its indicator, the task mark: an empty ring, a brand ring half filled on
 * the one recommended next step (Linear's "in progress"; the row itself stays flat, its primary
 * action draws the eye), the brand fill with a tick that draws itself in once done. Completed rows de-emphasize their title via a
 * `data-status` group selector, no second context.
 *
 * Give an item `checked` / `defaultChecked` / `onCheckedChange` and it becomes a task the
 * reader ticks: the same mark becomes a real Radix checkbox named by the item's title; the
 * whole row is its hit area, and a done title is struck through. `ChecklistMark` draws the mark
 * on its own, for task lists laid out by something else (an Accordion of steps). One mark, one
 * size, one set of colours, in every task list of the kit.
 */
export const checklistVariants = tv({
  slots: {
    // The outer contour lives on the `variant` axis (card by default, none for `plain`).
    root: "text-card-foreground",
    // The header block: heading, description, then the progress bar.
    header: "flex flex-col gap-1.5",
    title: "text-balance text-base font-semibold text-foreground",
    description: "text-pretty text-sm text-muted-foreground",
    // The labeled progress bar. `mt-4` separates it from the description without inflating the
    // tight title↔description gap above it; `first:mt-0` when it leads the header on its own
    // (a plain Checklist under a Card's own title), so it inherits no gap meant for a sibling.
    progress: "mt-4 flex flex-col gap-2 first:mt-0",
    // Fades in when a self-counting Checklist has heard from its items (see `pending`), so a
    // server render never flashes "0 of 0" before the real count.
    progressMeta: "flex items-center justify-between gap-3 text-sm transition-opacity duration-base ease-out",
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
    // The task mark, every row's indicator whatever the row: the round checkbox of a task list,
    // drawn as the small Checkbox is, only round. 16px, so it sits inside the 20px line of the
    // title beside it instead of standing over it, and `mt-0.5` centres it on that first line,
    // between the capitals and the lowercase, where the eye reads the line's middle. `--input`
    // edge, `--surface` fill (inside a card it blends with the card instead of reading as a hole)
    // and xs lift. Complete, it fills with the brand and its tick draws itself in, black in every
    // theme like every Koala tick. The `active` step, the one up next, is Linear's "in progress":
    // a brand ring half filled, started but not done, so a full fill only ever means done. The
    // row itself never lights up; the step's primary action is what draws the eye. A row the
    // reader ticks makes the mark a real checkbox; {@link ChecklistMark} draws it alone.
    mark: [
      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-input bg-[var(--surface,var(--background))] text-black shadow-xs [&_svg]:size-3",
      "transition-colors duration-fast ease-out",
      "data-[status=active]:border-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand",
    ],
    // Title + description column. min-w-0 lets a long title wrap instead of shoving the action
    // off the row. No nudge: the mark centres itself on the first line, so the row's padding
    // stays even top and bottom.
    content: "flex min-w-0 flex-1 flex-col gap-0.5",
    // Completed titles de-emphasize; the transition makes the flip feel deliberate. On a row the
    // reader ticks (it carries `data-state`), the title is also struck through: the line is always
    // drawn and only its colour moves, transparent while open, the muted ink once done, so the
    // strike fades in with the colour (\`transition-colors\` carries text-decoration-color).
    itemTitle: [
      "text-pretty text-sm font-medium text-foreground transition-colors duration-base ease-out group-data-[status=complete]/item:text-muted-foreground",
      "group-data-[state]/item:line-through group-data-[state=unchecked]/item:decoration-transparent group-data-[state=checked]/item:decoration-muted-foreground",
    ],
    itemDescription: "text-pretty text-sm text-muted-foreground",
    // Trailing action slot: a Button ("Start", "Set up"), a Badge, or nothing on a done row.
    // self-center rides the action on the row's optical middle; ml-auto pins it right. On a row
    // the reader ticks, `relative` lifts it above the row-wide hit area so it stays its own target.
    action: "ml-auto flex shrink-0 items-center self-center pl-3 group-data-[state]/item:relative",
  },
  variants: {
    // `card` is the panel on its own: a 2xl contour (so nested item pills step down to xl and
    // their buttons to md), the edge an `--edge` ring plus the xs lift, not a border, so it takes
    // no layout (docs/FOUNDATIONS.md, "Shadows over borders"). No fill: fill is elevation.
    // `plain` drops the contour and the outer padding, for a Checklist that sits inside a Card
    // (or any surface that already frames it): the rows then line their indicator up with the
    // surface's own copy and bleed their pill into its padding, the way List's plain rows do.
    variant: {
      card: { root: "rounded-2xl shadow-xs ring-1 ring-edge" },
      plain: {},
    },
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
    // Set per row by {@link ChecklistItem} when it is a task the reader ticks. The indicator is
    // the task mark (the `mark` slot), made a real checkbox. Its `::after` stretches over the
    // whole row (it is `static`, so the pseudo anchors to the `relative` row), so a click anywhere
    // on the row toggles it; no press scale, which would re-anchor that pseudo mid-press. The
    // glyph centres on a grid rather than `absolute`, which would anchor to the row too. The row
    // answers the pointer with the List wash (hover half, press full) and shows the focus ring for
    // its checkbox, since a ring on a 16px circle is easy to miss.
    toggleable: {
      true: {
        item: [
          "hover:bg-muted/60 active:bg-muted",
          "has-[[data-slot=checklist-indicator]:focus-visible]:ring-2 has-[[data-slot=checklist-indicator]:focus-visible]:ring-ring",
        ],
        mark: "static cursor-pointer outline-none after:absolute after:inset-0 after:content-['']",
      },
    },
  },
  compoundVariants: [
    // Plain: no contour, so no inset from one either. The row pills pull out by their own
    // horizontal padding, so the indicator lines up with the surface's copy, and round to lg,
    // concentric with a Card whose padding they bleed into.
    { variant: "plain", class: { header: "px-0 pt-0", items: "px-0 pb-0" } },
    { variant: "plain", density: "comfortable", class: { item: "-mx-3 rounded-lg" } },
    { variant: "plain", density: "compact", class: { item: "-mx-2.5 rounded-lg" } },
  ],
  defaultVariants: {
    variant: "card",
    density: "comfortable",
  },
})

type ChecklistSlots = ReturnType<typeof checklistVariants>
type ChecklistConfig = {
  variant: NonNullable<VariantProps<typeof checklistVariants>["variant"]>
  density: NonNullable<VariantProps<typeof checklistVariants>["density"]>
}

/** A task's state in the checklist. */
export type ChecklistStatus = "todo" | "active" | "complete"

const [ChecklistProvider, useChecklistContext] = createContext<{
  slots: ChecklistSlots
  config: ChecklistConfig
  value: number
  total: number
  percent: number
  complete: boolean
  /** True while a self-counting Checklist has not heard from its items yet (the server render). */
  pending: boolean
  report: (id: string, complete: boolean) => void
  forget: (id: string) => void
}>("Checklist")

/** Per-item wiring the parts read without a second provider layer: ids that name the checkbox. */
const ChecklistItemContext = React.createContext<{ titleId: string; toggleable: boolean } | null>(
  null,
)

export interface ChecklistProps
  extends React.ComponentProps<"div">,
    Omit<VariantProps<typeof checklistVariants>, "toggleable"> {
  /**
   * Number of completed tasks. Drives the progress bar and the "{value} of {total}" read-out.
   * Leave it out and the Checklist counts its own complete items (a `status="complete"` row, or a
   * checked one), so a list the reader ticks keeps its progress with no wiring.
   */
  value?: number
  /** Total number of tasks. Leave it out and the Checklist counts its `ChecklistItem`s. */
  total?: number
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
  variant,
  density,
  asChild = false,
  ...props
}: ChecklistProps) {
  const config: ChecklistConfig = { variant: variant ?? "card", density: useDensity(density) }
  const slots = checklistVariants(config)

  // What the items report: id → done. Only read when `value` or `total` is left out, but always
  // kept, so switching a Checklist between counted and supplied numbers needs nothing else. Each
  // item reports from a layout effect, so on the client the count lands before the first paint.
  const [reported, setReported] = React.useState<Record<string, boolean>>({})
  const report = React.useCallback(
    (id: string, done: boolean) =>
      setReported((current) => (current[id] === done ? current : { ...current, [id]: done })),
    [],
  )
  const forget = React.useCallback(
    (id: string) =>
      setReported((current) => {
        if (!(id in current)) return current
        const next = { ...current }
        delete next[id]
        return next
      }),
    [],
  )
  const states = Object.values(reported)
  const counted = value === undefined || total === undefined
  const pending = counted && states.length === 0

  // Clamp so a bad count can never overrun the bar or report >100%.
  const safeTotal = Math.max(0, total ?? states.length)
  const safeValue = Math.min(Math.max(0, value ?? states.filter(Boolean).length), safeTotal)
  const percent = safeTotal === 0 ? 0 : Math.round((safeValue / safeTotal) * 100)
  const complete = safeTotal > 0 && safeValue >= safeTotal
  const Comp = asChild ? Slot.Root : "div"

  return (
    <ChecklistProvider
      slots={slots}
      config={config}
      value={safeValue}
      total={safeTotal}
      percent={percent}
      complete={complete}
      pending={pending}
      report={report}
      forget={forget}
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
  const { slots, value, total, percent, complete, pending } =
    useChecklistContext("ChecklistProgress")
  // The count and the percent roll as a step flips done. Plain text while a self-counting
  // Checklist is still pending, so the first real count mounts in place instead of rolling up
  // from the server's zero as the row fades in.
  const roll = (figure: string | number) => (pending ? figure : <AnimatedNumber value={figure} />)
  const defaultLabel = complete ? (
    <>
      <Check weight="bold" className="size-4 text-success" aria-hidden />
      <span className="text-success">All steps complete</span>
    </>
  ) : (
    <span>
      {roll(value)} of {total} complete
    </span>
  )

  return (
    <div data-slot="checklist-progress" className={slots.progress({ className })} {...props}>
      <div className={slots.progressMeta({ className: pending ? "opacity-0" : undefined })}>
        <span className={slots.progressLabel()}>{label ?? defaultLabel}</span>
        <span className={slots.progressPercent()}>{roll(`${percent}%`)}</span>
      </div>
      {/* Named, so the bar is more than a bare number to a screen reader (axe's
          aria-progressbar-name); the value text carries the count. */}
      <div
        role="progressbar"
        aria-label="Progress"
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

export interface ChecklistItemProps extends Omit<React.ComponentProps<"li">, "defaultChecked"> {
  /**
   * The task's state. Styles the row and its indicator. On a row the reader ticks, `checked`
   * decides `complete`, and `status` only picks between `todo` and `active` while it is open.
   * @default "todo"
   */
  status?: ChecklistStatus
  /**
   * Make the row a task the reader ticks, controlled. The indicator becomes a real checkbox
   * (Radix, named by the `ChecklistItemTitle`), the whole row toggles it, and a checked row
   * completes with its title struck through. Pair it with `onCheckedChange`.
   */
  checked?: boolean
  /** The uncontrolled version of `checked`: the row keeps its own state from this start. */
  defaultChecked?: boolean
  /** Called with the new state when the reader ticks or unticks the row. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * ChecklistItem: one task row. Renders its indicator automatically (the task mark, following
 * `status`), then lays out the composed `ChecklistItemContent` and `ChecklistItemAction`. Sets `data-status` so descendants (the title) can react without a
 * second context, and an sr-only status so the row's state is announced, not just colored.
 *
 * With `checked`, `defaultChecked` or `onCheckedChange` the row is one the reader ticks: the
 * indicator is a checkbox (it announces its own state, so the sr-only status is dropped) and the
 * row also carries `data-state="checked" | "unchecked"`.
 */
export function ChecklistItem({
  className,
  status = "todo",
  checked,
  defaultChecked,
  onCheckedChange,
  children,
  ...props
}: ChecklistItemProps) {
  const { config, report, forget } = useChecklistContext("ChecklistItem")
  const id = React.useId()
  const titleId = `${id}-title`

  const toggleable =
    checked !== undefined || defaultChecked !== undefined || onCheckedChange !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false)
  const isChecked = checked ?? uncontrolled
  const setChecked = (next: boolean) => {
    if (checked === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  // A ticked row is complete whatever `status` says, and an unticked one can't be.
  const resolved: ChecklistStatus = toggleable
    ? isChecked
      ? "complete"
      : status === "complete"
        ? "todo"
        : status
    : status
  const isComplete = resolved === "complete"

  // Tell the root whether this task is done, so a Checklist without value/total counts itself.
  // A layout effect, so the count is there before the first client paint.
  React.useLayoutEffect(() => {
    report(id, isComplete)
  }, [report, id, isComplete])
  React.useLayoutEffect(() => () => forget(id), [forget, id])

  const slots = checklistVariants({ ...config, toggleable })

  return (
    <ChecklistItemContext.Provider value={{ titleId, toggleable }}>
      <li
        data-slot="checklist-item"
        data-status={resolved}
        data-state={toggleable ? (isChecked ? "checked" : "unchecked") : undefined}
        className={cn("group/item", slots.item({ className }))}
        {...props}
      >
        {toggleable ? (
          <CheckboxPrimitive.Root
            data-slot="checklist-indicator"
            data-status={resolved}
            checked={isChecked}
            onCheckedChange={(next) => setChecked(next === true)}
            aria-labelledby={titleId}
            className={slots.mark()}
          >
            <CheckboxPrimitive.Indicator className="flex">
              <Tick />
            </CheckboxPrimitive.Indicator>
            {resolved === "active" && <HalfDisc />}
          </CheckboxPrimitive.Root>
        ) : (
          <ChecklistMark data-slot="checklist-indicator" status={resolved} />
        )}
        {children}
        {toggleable ? null : <span className="sr-only">{STATUS_LABEL[resolved]}</span>}
      </li>
    </ChecklistItemContext.Provider>
  )
}

/**
 * The Checkbox's own tick: a stroke that draws itself in (`pathLength={1}` makes the dash math a
 * clean 1 → 0). Mounted only while the mark is checked, so every tick replays the draw.
 */
function Tick() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} className="animate-check-draw [stroke-dasharray:1]" />
    </svg>
  )
}

/**
 * The `active` step's glyph, Linear's "in progress": the right half of a disc half the ring's
 * size, so the mark reads as started, not done. It scales in when the step comes up.
 */
function HalfDisc() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="fill-brand animate-in fade-in zoom-in-50 duration-base ease-out"
    >
      <path d="M6 2a4 4 0 0 1 0 8z" />
    </svg>
  )
}

export interface ChecklistMarkProps extends React.ComponentProps<"span"> {
  /**
   * The task's state: an empty ring for `todo`, a brand ring half filled for `active` (the step up
   * next), the brand fill with a tick for `complete`.
   * @default "todo"
   */
  status?: ChecklistStatus
}

/**
 * ChecklistMark: the task mark on its own, for a task list the Checklist doesn't lay out (the
 * steps of an Accordion, a row inside a button) so every list of tasks draws the same mark. The
 * one every `ChecklistItem` renders; a row the reader ticks makes it a checkbox, this one stays
 * decoration, `aria-hidden`, so the row it sits in names the task's state. Needs no `Checklist` around it. It carries the
 * `mt-0.5` that centres it on a `text-sm` first line, so drop it in an `items-start` row.
 */
export function ChecklistMark({ className, status = "todo", ...props }: ChecklistMarkProps) {
  const complete = status === "complete"
  return (
    <span
      data-slot="checklist-mark"
      data-status={status}
      data-state={complete ? "checked" : "unchecked"}
      aria-hidden
      className={checklistVariants().mark({ className })}
      {...props}
    >
      {complete && <Tick />}
      {status === "active" && <HalfDisc />}
    </span>
  )
}

/** Wraps the title + description; flexes to fill so the action rides the right edge. */
export function ChecklistItemContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemContent")
  return (
    <div data-slot="checklist-item-content" className={slots.content({ className })} {...props} />
  )
}

/**
 * The task name. Auto-mutes on a completed row via the item's `data-status` group selector, and
 * is struck through once a row the reader ticks is checked. On such a row it names the checkbox.
 */
export function ChecklistItemTitle({ className, id, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemTitle")
  const item = React.useContext(ChecklistItemContext)
  return (
    <div
      data-slot="checklist-item-title"
      id={id ?? (item?.toggleable ? item.titleId : undefined)}
      className={slots.itemTitle({ className })}
      {...props}
    />
  )
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
 * On a row the reader ticks it sits above the row's hit area, so its button stays its own target.
 */
export function ChecklistItemAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useChecklistContext("ChecklistItemAction")
  return <div data-slot="checklist-item-action" className={slots.action({ className })} {...props} />
}
