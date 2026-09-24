"use client"

import * as React from "react"
import { Collapsible, Slot } from "radix-ui"
import { CaretDown, Check, DotsThree, Minus, Plus, Warning } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { hitY } from "@/lib/hit-area"
import { tv, type VariantProps } from "@/lib/tv"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

/**
 * Plan: the card an assistant hands you before it acts. It writes a plan, you read it and
 * approve, and then the card shows the plan running itself. The 5th piece of the AI module
 * (after PromptInput, Chat, AIPanel and Suggestions).
 *
 * The register is deliberately quiet, and the card is the ONLY container in it. An approval is
 * a glance and a decision, so nothing inside gets boxed again: a muted eyebrow for identity, a
 * semibold line for the title, and the work as a flat list of to-dos grouped by a label and
 * whitespace — the Accordion `minimal` idiom, not a panel in a panel. Status lives in a 14px
 * mark at the head of each row (a dashed ring waiting, a spinner running, a green check done),
 * never in a filled disc or a colored row, because a column of solid circles reads as a diagram
 * and this is a paragraph you happen to be able to click.
 *
 * Built like Card/Checklist: one `tv` recipe with `slots`, shared state through React Context,
 * never prop-drilled or cloned. See docs/ARCHITECTURE.md §2.
 *
 * Two status scopes, deliberately different words so a row is never confused with the card:
 *   - the **plan** moves `drafting → review → running → complete` (or `failed`). It drives the
 *     optional `PlanStatus` chip and the entrance each row plays while the model is writing.
 *   - each **step** is `pending | active | done | failed`, which is the whole of its mark.
 *
 * Read-only is the default. `PlanStepEdit` and `PlanAddStep` render nothing at all until the
 * root is `editing`, so a plan you are only looking at carries no editing chrome.
 */
export const planVariants = tv({
  slots: {
    /**
     * The card. One surface and no others: no fill (fill is elevation, so it takes the ground it
     * sits on) and nothing inside it is boxed again. The whole card is the only container in the
     * component — the work is grouped by a quiet label and whitespace, the way the Accordion's
     * `minimal` variant groups rows, because a panel inside a card reads as a slab in the dark
     * themes and as a redundant line in the light ones.
     */
    root: "flex flex-col text-card-foreground",
    // The eyebrow row: a small muted glyph, the label, then whatever trails (a chip, icon actions).
    header: "flex items-center gap-2",
    // A bare glyph, not a tinted tile: the smallest mark that still says what kind of card this is.
    icon: "shrink-0 text-muted-foreground [&_svg]:size-4",
    label: "min-w-0 truncate text-sm font-medium text-muted-foreground",
    // Trailing header slot for ghost icon buttons. `ml-auto` pins it right whether or not a
    // PlanStatus chip sits beside it.
    actions: "ml-auto flex shrink-0 items-center gap-0.5",
    // Title + description. Its own block under the eyebrow, not a column inside it. `text-base`
    // semibold is the DS's card-title step (Checklist, PromoCard), so a Plan reads as a sibling
    // of every other Koala card rather than as an import from somewhere else.
    heading: "flex min-w-0 flex-col gap-1",
    title: "text-balance text-base font-semibold text-foreground",
    description: "text-pretty text-sm text-muted-foreground",
    // A group of work. No chrome at all: a label and whitespace do the grouping, so a card with
    // two groups ("To-dos", "Files") still reads as one surface.
    group: "flex min-w-0 flex-col",
    // The group's quiet label row: "To-dos", and how many.
    groupHeader: "flex items-center gap-2.5 pb-1",
    groupTitle: "min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground",
    // tabular so a count ticking 9 → 10 can't nudge the row.
    groupCount: "shrink-0 tabular-nums text-sm text-muted-foreground",
    // The to-do list. No gap: the rows' own padding is the rhythm, the way a list reads.
    steps: "flex flex-col",
    /**
     * One row. No rail, no fill, no number, no gutter — the mark at its head is the entire state,
     * and every row starts on the card's own left edge so the card has exactly one text axis.
     * The mount entrance is the DS's `stagger-in`: rows arrive one at a time while a model
     * writes them, and rows revealed by "Show less" glide in rather than appearing mid-card.
     *
     * In edit mode the row reserves a right gutter for the out-of-flow `PlanStepEdit`. It is on
     * the ROW rather than on the tool so the reservation is uniform: every row narrows by the
     * same 36px the instant you press Edit, instead of each one re-wrapping around whichever
     * control happens to be hovered.
     */
    step: [
      "group/step relative flex items-start gap-2.5 rounded-sm",
      "group-data-[editing]/plan:pr-9",
      "animate-stagger-in motion-reduce:animate-none",
    ],
    /**
     * The 14px status mark. `mt-0.5` rides it on the first line of a 20px row rather than on the
     * block's middle, so a wrapping to-do never drags it down. Fixed footprint in every state so
     * the column of text stays on one axis as rows flip.
     */
    mark: "relative mt-0.5 flex size-3.5 shrink-0 items-center justify-center",
    stepContent: "flex min-w-0 flex-1 flex-col gap-1",
    /**
     * Muted by default: the to-dos are what the plan SAYS, and the title above is what it IS.
     * The one step of ink each state gets rides on the row's `data-status` through the
     * `group/step` selector — no second context, and it still lands if the title is swapped for
     * an inline input. This is the whole of a row's styling besides its 14px mark.
     */
    stepTitle: [
      "text-pretty text-sm text-muted-foreground transition-colors duration-base ease-out",
      "group-data-[status=active]/step:text-foreground",
      "group-data-[status=done]/step:text-muted-foreground/70",
      "group-data-[status=failed]/step:text-destructive",
    ],
    stepDescription: "text-pretty text-sm text-muted-foreground/70",
    /**
     * The disclosure row of a collapsible step: the whole line, not just the caret. `hitY` grows
     * it to the 40px floor vertically only, because growing it sideways would steal the trailing
     * action's tap. No press scale anywhere in this component, by request.
     */
    stepTrigger: [
      "group/step-trigger flex w-full cursor-pointer items-start gap-1.5 rounded-sm text-left",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,var(--background))]",
      hitY,
    ],
    stepTriggerBody: "flex min-w-0 flex-1 flex-col gap-1",
    stepCaret: [
      "mt-0.5 size-3 shrink-0 text-muted-foreground/50 group-hover/step-trigger:text-foreground",
      // `caret-turn` is the DS's shared turn (transition-transform on the motion tokens).
      "caret-turn group-data-[state=open]/step-trigger:rotate-180",
    ],
    // Animated wrapper: overflow-hidden clips while the height tweens (tw-animate-css keyframes
    // retimed to Koala's tokens, same as Accordion, Tree and Chat).
    stepDetail: [
      "min-w-0 overflow-hidden duration-base ease-out",
      "data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
    ],
    stepDetailInner: "mt-1.5 flex min-w-0 flex-col gap-1.5",
    // Sub-tasks: a step's own beats. Quieter again, and marked with a dash rather than a ring so
    // they can never be mistaken for to-dos of the plan itself.
    tasks: "flex min-w-0 flex-col gap-1.5",
    task: "flex min-w-0 items-start gap-2 text-sm text-muted-foreground/70",
    taskMark: "relative mt-1.5 flex size-2.5 shrink-0 items-center justify-center",
    // Always-visible trailing slot: a duration, a Badge, a Retry on a failed row.
    stepAction: "ml-auto flex shrink-0 items-center self-start pl-2",
    /**
     * The edit-only trailing slot, taken OUT of the row's flow. In flow it was a disaster in
     * miniature: a 32px `sm` Button is taller than a 20px line, so every single-line to-do grew
     * to the button's height while a wrapped one stayed taller, and the rows drifted out of
     * rhythm the moment you pressed Edit. Absolute, it can neither set the row's height nor take
     * width from the text — the row is sized by its copy in both modes, as it should be. The
     * gutter it sits in is reserved by the row (`pr-9` under `data-editing`), so it has somewhere
     * to be without ever landing on top of a word.
     *
     * It fades in with the pointer — but never behind a hover a finger can't perform
     * (`pointer-coarse`) and never away from the keyboard (`focus-within`), which is how a reveal
     * like this usually breaks.
     */
    stepEdit: [
      "absolute right-0 top-1/2 flex shrink-0 -translate-y-1/2 items-center",
      "opacity-0 transition-opacity duration-fast ease-out",
      "group-hover/step:opacity-100 group-focus-within/step:opacity-100 pointer-coarse:opacity-100",
    ],
    /**
     * The inline editor. It inherits the row's type AND its resting tone exactly, and paints no
     * frame — so switching a plan into edit mode changes nothing on screen: the rows sit where
     * they sat, in the ink they were in, and simply start taking keys. Ink arrives on the row
     * you actually reach for (hover) or land in (focus), which is the only feedback an inline
     * edit needs. `field-sizing-content` grows it with the copy (PromptInput's trick), so a
     * rewritten to-do wraps instead of scrolling inside itself.
     */
    stepInput: [
      "w-full resize-none bg-transparent p-0 text-sm text-muted-foreground",
      "transition-colors duration-base ease-out hover:text-foreground focus:text-foreground",
      "field-sizing-content outline-none placeholder:text-muted-foreground/50",
    ],
    // The quiet row that closes the list: "+ Add step" while editing, "3 more" / "Show less" for
    // the overflow. Same geometry as a to-do, so the column never steps sideways.
    rowButton: [
      "group/row flex w-full cursor-pointer items-center gap-2.5 rounded-sm text-left text-sm text-muted-foreground",
      "transition-colors duration-fast ease-out hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,var(--background))]",
      hitY,
    ],
    // The glyph column of those rows, sized to the status mark so everything shares one axis.
    rowButtonMark: "flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3",
    /**
     * The commit bar. No divider: whitespace is the boundary, and a rule here would be one more
     * line in a card whose whole point is having few. When the row wraps on a narrow card, the
     * actions keep the right edge instead of orphaning themselves on the left — `ml-auto` on
     * every child but the first, so a footer holding ONLY actions still sits right and a footer
     * holding only a summary still sits left.
     */
    footer: "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 [&>*:not(:first-child)]:ml-auto",
    summary: "text-sm tabular-nums text-muted-foreground",
  },
  variants: {
    /**
     * Density tunes the card's padding, the block gaps and the row rhythm. Nothing here is
     * pinned by a concentric corner, because nothing is nested: the card is the only surface.
     */
    density: {
      comfortable: {
        root: "gap-4 p-5",
        step: "py-1.5",
        rowButton: "py-1.5",
      },
      compact: {
        root: "gap-3 p-4",
        step: "py-1",
        rowButton: "py-1",
      },
    },
    /**
     * Where the plan is rendered. `card` is the standalone artifact — the edge is an `--edge`
     * ring plus the xs lift, not a border, so it costs no layout and the radius arithmetic stays
     * whole. `plain` strips the chrome and the gutter for a plan dropped straight into a Chat
     * turn or an AIPanel body, where a card inside the surface reads as a box in a box.
     *
     * Declared after `density` so its gutter reset wins the merge.
     */
    variant: {
      card: { root: "rounded-2xl shadow-xs ring-1 ring-edge" },
      plain: { root: "p-0" },
    },
  },
  defaultVariants: {
    density: "comfortable",
    variant: "card",
  },
})

type PlanSlots = ReturnType<typeof planVariants>

/** Where the plan itself is in its life: written → reviewed → run → done. */
export type PlanState = "drafting" | "review" | "running" | "complete" | "failed"

/** One step's state inside a plan. */
export type PlanStepState = "pending" | "active" | "done" | "failed"

/** The optional header chip per plan state. A turning glyph while the model works. */
const PLAN_STATUS: Record<
  PlanState,
  { label: string; variant: BadgeProps["variant"]; glyph: "spinner" | "check" | "warning" | null }
> = {
  drafting: { label: "Drafting", variant: "default", glyph: "spinner" },
  review: { label: "Ready for review", variant: "outline", glyph: null },
  running: { label: "Running", variant: "info", glyph: "spinner" },
  complete: { label: "Complete", variant: "success", glyph: "check" },
  failed: { label: "Failed", variant: "destructive", glyph: "warning" },
}

const STEP_LABEL: Record<PlanStepState, string> = {
  pending: "Not started",
  active: "In progress",
  done: "Done",
  failed: "Failed",
}

const [PlanProvider, usePlanContext] = createContext<{
  slots: PlanSlots
  status: PlanState
  editing: boolean
}>("Plan")

export interface PlanProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof planVariants> {
  /**
   * Where the plan is in its life. Drives the optional `PlanStatus` chip, `aria-busy`, and the
   * entrance each row plays while the model is still writing. @default "review"
   */
  status?: PlanState
  /**
   * Put the card in edit mode. **A plan is read-only by default**, because that is how it is
   * looked at nine times out of ten: you read what the assistant proposes and approve it. Edit
   * is a mode you deliberately enter (a quiet "Edit" in the footer), and only then do the tools
   * appear — `PlanStepEdit` and `PlanAddStep` render nothing at all until this is on.
   *
   * It is a cross-cutting state on the root rather than a prop on every row, so one flag turns
   * the whole card editable and no call site can leave half of it in the wrong mode.
   * @default false
   */
  editing?: boolean
  asChild?: boolean
}

/**
 * Parts are exported individually (not `Plan.Step` dot-notation) because namespaced statics
 * don't survive the RSC server→client boundary; only named exports do.
 */
export function Plan({
  className,
  status = "review",
  editing = false,
  density,
  variant,
  asChild = false,
  ...props
}: PlanProps) {
  const slots = planVariants({ density: useDensity(density), variant })
  const Comp = asChild ? Slot.Root : "div"

  return (
    <PlanProvider slots={slots} status={status} editing={editing}>
      <Comp
        data-slot="plan"
        data-status={status}
        data-editing={editing || undefined}
        // A plan still being written, or running, updates itself; announce the changes politely
        // rather than letting a screen reader re-read the whole card on every token.
        aria-busy={status === "drafting" || status === "running" ? true : undefined}
        // `group/plan` lets a row read the card's edit mode (see the `step` slot's gutter).
        className={cn("group/plan", slots.root({ className }))}
        {...props}
      />
    </PlanProvider>
  )
}

/** The eyebrow row: a `PlanIcon`, a `PlanLabel`, then a `PlanStatus` and/or `PlanActions`. */
export function PlanHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanHeader")
  return <div data-slot="plan-header" className={slots.header({ className })} {...props} />
}

/** The identity tile: a brand-tinted square holding one small glyph. */
export function PlanIcon({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePlanContext("PlanIcon")
  return <span data-slot="plan-icon" aria-hidden className={slots.icon({ className })} {...props} />
}

/** The eyebrow's word: what kind of card this is ("Plan", "Plan overview"). */
export function PlanLabel({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePlanContext("PlanLabel")
  return <span data-slot="plan-label" className={slots.label({ className })} {...props} />
}

/** Trailing header slot for ghost icon buttons (regenerate, expand, a `⋯` menu). */
export function PlanActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanActions")
  return <div data-slot="plan-actions" className={slots.actions({ className })} {...props} />
}

/** The title + description block, under the eyebrow. */
export function PlanHeading({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanHeading")
  return <div data-slot="plan-heading" className={slots.heading({ className })} {...props} />
}

export interface PlanTitleProps extends React.ComponentProps<"h3"> {
  asChild?: boolean
}

/** What the plan will do, in one line: "Session auth migration". */
export function PlanTitle({ className, asChild = false, ...props }: PlanTitleProps) {
  const { slots } = usePlanContext("PlanTitle")
  const Comp = asChild ? Slot.Root : "h3"
  return <Comp data-slot="plan-title" className={slots.title({ className })} {...props} />
}

/** The muted lines under the title — the shape of the work, before the to-dos spell it out. */
export function PlanDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = usePlanContext("PlanDescription")
  return <p data-slot="plan-description" className={slots.description({ className })} {...props} />
}

export interface PlanStatusProps extends Omit<BadgeProps, "children"> {
  /** Override the default per-state wording ("Drafting", "Running", …). */
  children?: React.ReactNode
}

/**
 * PlanStatus: an optional chip derived from the root's `status`, so a call site never has to
 * keep a label and a state in sync. Optional on purpose — in the quiet default the eyebrow says
 * what the card is and the footer says what happens next, and a chip on top of both is one badge
 * too many. Reach for it when a plan sits in a feed where it has to announce itself.
 */
export function PlanStatus({ className, variant, children, ...props }: PlanStatusProps) {
  const { status } = usePlanContext("PlanStatus")
  const { label, variant: stateVariant, glyph } = PLAN_STATUS[status]

  return (
    <Badge
      // No `data-slot` of its own: a part that renders another component keeps that component's
      // slot (docs/ARCHITECTURE.md §2), so the chip stays queryable as a Badge.
      variant={variant ?? stateVariant}
      className={cn("ml-auto shrink-0", className)}
      {...props}
    >
      {glyph === "spinner" && <Spinner aria-hidden />}
      {glyph === "check" && <Check weight="bold" aria-hidden />}
      {glyph === "warning" && <Warning weight="bold" aria-hidden />}
      {children ?? label}
    </Badge>
  )
}

/**
 * PlanGroup: a block of work, grouped by a label and whitespace rather than by a box. One group
 * is usually all a plan needs ("To-dos"), but an agent card that also lists files or commands
 * gets one each — which is why this is a composed part and not something the root puts up on its
 * own. It paints nothing: the card stays the only surface.
 */
export function PlanGroup({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanGroup")
  return <div data-slot="plan-group" className={slots.group({ className })} {...props} />
}

/** The group's quiet label row: a `PlanGroupTitle` and, at its end, a `PlanGroupCount`. */
export function PlanGroupHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanGroupHeader")
  return (
    <div data-slot="plan-group-header" className={slots.groupHeader({ className })} {...props} />
  )
}

/** What the group holds: "To-dos", "Files", "Commands". */
export function PlanGroupTitle({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePlanContext("PlanGroupTitle")
  return (
    <span data-slot="plan-group-title" className={slots.groupTitle({ className })} {...props} />
  )
}

/** How many rows the group holds, at its right edge. Tabular, so a live count can't reflow it. */
export function PlanGroupCount({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = usePlanContext("PlanGroupCount")
  return (
    <span data-slot="plan-group-count" className={slots.groupCount({ className })} {...props} />
  )
}

/** The to-do list: a semantic `<ol>`, so position and count are announced without any numerals. */
export function PlanSteps({ className, ...props }: React.ComponentProps<"ol">) {
  const { slots } = usePlanContext("PlanSteps")
  return <ol data-slot="plan-steps" className={slots.steps({ className })} {...props} />
}

export interface PlanStepProps extends React.ComponentProps<"li"> {
  /** The step's state. It is the whole of the row's mark and ink. @default "pending" */
  status?: PlanStepState
  /**
   * Turn the step into a disclosure: its `PlanStepTrigger` opens a `PlanStepDetail` holding the
   * sub-tasks, the notes, whatever the assistant wants to show for it. Wraps Radix Collapsible,
   * so the keyboard and ARIA wiring comes for free. A step without it is a plain row — a plan
   * can mix both.
   */
  collapsible?: boolean
  /** Controlled open state of a `collapsible` step. */
  open?: boolean
  /** Uncontrolled initial open state of a `collapsible` step. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * PlanStep: one to-do. It renders its own 14px mark from `status` — a dashed ring while it
 * waits, a spinner while it runs, a green check once it's done, a red warning when it isn't —
 * cross-faded with the opacity/scale/blur swap used across the DS, so a row settling can't
 * nudge the text beside it.
 *
 * While the plan is `drafting` a mounting row plays the DS entrance. The cascade needs no
 * per-item delay: rows arrive one at a time as the model writes them.
 */
export function PlanStep({
  className,
  status = "pending",
  collapsible = false,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: PlanStepProps) {
  const { slots } = usePlanContext("PlanStep")
  const waiting = status === "pending"

  const row = (
    <li
      data-slot="plan-step"
      data-status={status}
      className={slots.step({ className })}
      {...props}
    >
      <span data-slot="plan-step-mark" aria-hidden className={slots.mark()}>
        {/* Both layers stay mounted and stacked (absolute inset-0, so each centers in the same
            14px box) — nothing reflows on the flip. */}
        <span
          className={cn(
            "absolute inset-0 rounded-full border border-dashed border-muted-foreground/40",
            "transition-[opacity,scale,filter] duration-base ease-out",
            waiting ? "opacity-100 scale-100 blur-[0px]" : "opacity-0 scale-[0.25] blur-[4px]",
          )}
        />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-[opacity,scale,filter] duration-base ease-out",
            waiting ? "opacity-0 scale-[0.25] blur-[4px]" : "opacity-100 scale-100 blur-[0px]",
          )}
        >
          {status === "active" && <Spinner className="size-3.5 text-brand" aria-hidden />}
          {status === "done" && <Check weight="bold" className="size-3.5 text-success" />}
          {status === "failed" && <Warning weight="bold" className="size-3.5 text-destructive" />}
        </span>
      </span>
      {children}
      <span className="sr-only">{STEP_LABEL[status]}</span>
    </li>
  )

  // `asChild` merges the Collapsible root onto the `<li>` itself, so a disclosure row keeps the
  // list semantics (and its `data-state` lands on the row, where the parts can read it).
  if (!collapsible) return row
  return (
    <Collapsible.Root asChild open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {row}
    </Collapsible.Root>
  )
}

/** Wraps a row's text; flexes to fill so the trailing slots ride the right edge. */
export function PlanStepContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanStepContent")
  return (
    <div data-slot="plan-step-content" className={slots.stepContent({ className })} {...props} />
  )
}

/** The to-do itself. Muted by default; the live row steps up to full ink. */
export function PlanStepTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanStepTitle")
  return <div data-slot="plan-step-title" className={slots.stepTitle({ className })} {...props} />
}

/** An optional second line under a to-do. Quieter again — most rows don't need one. */
export function PlanStepDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanStepDescription")
  return (
    <div
      data-slot="plan-step-description"
      className={slots.stepDescription({ className })}
      {...props}
    />
  )
}

/**
 * PlanStepTrigger: the disclosure row of a `collapsible` step. Wrap the to-do (and its
 * description, if it should stay visible while collapsed) in it and the whole line becomes the
 * target, with the caret turning at its end. Plain steps skip it and render the title directly.
 */
export function PlanStepTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Trigger>) {
  const { slots } = usePlanContext("PlanStepTrigger")
  return (
    <Collapsible.Trigger
      data-slot="plan-step-trigger"
      className={slots.stepTrigger({ className })}
      {...props}
    >
      <span className={slots.stepTriggerBody()}>{children}</span>
      <CaretDown weight="bold" aria-hidden className={slots.stepCaret()} />
    </Collapsible.Trigger>
  )
}

/**
 * PlanStepDetail: what a `collapsible` step hides — its sub-tasks, a note, a tool's output. The
 * height tweens on the DS collapsible keyframes.
 */
export function PlanStepDetail({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Content>) {
  const { slots } = usePlanContext("PlanStepDetail")
  return (
    <Collapsible.Content
      data-slot="plan-step-detail"
      className={slots.stepDetail({ className })}
      {...props}
    >
      <div className={slots.stepDetailInner()}>{children}</div>
    </Collapsible.Content>
  )
}

/** The sub-task list inside a step's detail. */
export function PlanTasks({ className, ...props }: React.ComponentProps<"ul">) {
  const { slots } = usePlanContext("PlanTasks")
  return <ul data-slot="plan-tasks" className={slots.tasks({ className })} {...props} />
}

export interface PlanTaskProps extends React.ComponentProps<"li"> {
  /** The task is finished: the dash cross-fades to a green check. @default false */
  done?: boolean
}

/**
 * PlanTask: one beat of a step. Marked with a dash rather than a ring, and a step quieter again,
 * so an unfolded step can never be mistaken for more to-dos of the plan itself.
 */
export function PlanTask({ className, done = false, children, ...props }: PlanTaskProps) {
  const { slots } = usePlanContext("PlanTask")

  return (
    <li
      data-slot="plan-task"
      data-done={done || undefined}
      className={slots.task({ className })}
      {...props}
    >
      <span aria-hidden className={slots.taskMark()}>
        <span
          className={cn(
            "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground/40",
            "transition-[opacity,scale,filter] duration-base ease-out",
            done ? "opacity-0 scale-[0.25] blur-[4px]" : "opacity-100 scale-100 blur-[0px]",
          )}
        />
        <Check
          weight="bold"
          className={cn(
            "absolute inset-0 m-auto size-2.5 text-success",
            "transition-[opacity,scale,filter] duration-base ease-out",
            done ? "opacity-100 scale-100 blur-[0px]" : "opacity-0 scale-[0.25] blur-[4px]",
          )}
        />
      </span>
      <span className="min-w-0 flex-1 text-pretty">{children}</span>
      <span className="sr-only">{done ? "Done" : "Not started"}</span>
    </li>
  )
}

export interface PlanStepInputProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "onChange"> {
  value: string
  onValueChange: (value: string) => void
  /** Enter (or blur) accepts the edit. */
  onCommit?: (value: string) => void
  /** Escape abandons it. */
  onCancel?: () => void
}

/**
 * PlanStepInput: edit a to-do in place. It inherits the row's type and paints no frame, so the
 * row doesn't change shape when it goes editable — the caret simply starts blinking where the
 * text already was, which is the whole point of an inline edit. It grows with the copy
 * (`field-sizing-content`, PromptInput's trick), so a rewritten to-do wraps instead of scrolling.
 *
 * Enter commits and Escape cancels; Shift+Enter still breaks a line, and an open IME composition
 * is never hijacked. Blurring commits too, the way every inline title editor behaves.
 */
export function PlanStepInput({
  className,
  value,
  onValueChange,
  onCommit,
  onCancel,
  onKeyDown,
  onBlur,
  ...props
}: PlanStepInputProps) {
  const { slots } = usePlanContext("PlanStepInput")

  return (
    <textarea
      data-slot="plan-step-input"
      rows={1}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        // `nativeEvent.isComposing` guards a half-typed IME candidate: committing there would
        // eat the character the user is still choosing.
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          onCommit?.(value)
        }
        if (event.key === "Escape") {
          event.preventDefault()
          onCancel?.()
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        if (event.defaultPrevented) return
        onCommit?.(value)
      }}
      className={slots.stepInput({ className })}
      {...props}
    />
  )
}

/**
 * PlanStepAction: the trailing slot for what the row is *telling* you — a duration, a Badge, a
 * "Retry" on a failed step. It is part of the read-only plan, so it is always visible. Edit
 * tools do NOT go here; that is `PlanStepEdit`.
 */
export function PlanStepAction({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanStepAction")
  return <div data-slot="plan-step-action" className={slots.stepAction({ className })} {...props} />
}

/**
 * PlanStepEdit: the per-row edit tool, which in practice is one button — remove. There is no
 * "rename" here on purpose: in edit mode every row is already a `PlanStepInput`, so a pencil
 * would be a button whose only job is to focus the field sitting under it.
 *
 * It renders **nothing** unless the plan is `editing`, so a read-only plan carries no editing
 * chrome at all — not hidden, not transparent, not in the DOM. Inside edit mode it fades in with
 * the pointer, because a column of six rows each carrying a trash can is a toolbar, not a plan.
 *
 * Two slots rather than one boolean on `PlanStepAction`: "what the row says" and "what you can do
 * to the row" have different lifetimes, and splitting them means no call site can accidentally
 * hide a Retry button or leak a trash can into a plan someone is only reading.
 */
export function PlanStepEdit({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, editing } = usePlanContext("PlanStepEdit")
  if (!editing) return null
  return <div data-slot="plan-step-edit" className={slots.stepEdit({ className })} {...props} />
}

export interface PlanStepSkeletonProps extends React.ComponentProps<"li"> {
  /** Vary it across rows so a draft reads organic rather than striped. @default "full" */
  width?: "full" | "long" | "short"
}

const SKELETON_WIDTH = { full: "w-[88%]", long: "w-[70%]", short: "w-[52%]" } as const

/**
 * PlanStepSkeleton: the placeholder row while the model is still drafting. It keeps the list's
 * exact geometry — the same 14px mark column, the same row height — so the real to-dos land in
 * place instead of pushing the panel around when they arrive.
 */
export function PlanStepSkeleton({ className, width = "full", ...props }: PlanStepSkeletonProps) {
  const { slots } = usePlanContext("PlanStepSkeleton")

  return (
    <li data-slot="plan-step-skeleton" aria-hidden className={slots.step({ className })} {...props}>
      <span className={slots.mark()}>
        <span className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/25" />
      </span>
      <Skeleton
        animation="shimmer"
        className={cn("mt-1 h-2.5 rounded-full", SKELETON_WIDTH[width])}
      />
    </li>
  )
}

export interface PlanAddStepProps extends React.ComponentProps<"button"> {
  /** The row's label. @default "Add step" */
  children?: React.ReactNode
}

/**
 * PlanAddStep: the row that closes an editable list. Like `PlanStepEdit` it renders **nothing**
 * outside edit mode — an "add a step" control has no meaning in a plan you are only reading — so
 * you can leave it in the markup unconditionally and let the mode decide. It keeps the list's
 * geometry, so a new to-do lands exactly where the row was.
 */
export function PlanAddStep({ className, children = "Add step", ...props }: PlanAddStepProps) {
  const { slots, editing } = usePlanContext("PlanAddStep")
  if (!editing) return null

  return (
    <button
      type="button"
      data-slot="plan-add-step"
      className={slots.rowButton({ className })}
      {...props}
    >
      <span aria-hidden className={slots.rowButtonMark()}>
        <Plus weight="bold" />
      </span>
      {children}
    </button>
  )
}

export interface PlanMoreProps extends React.ComponentProps<"button"> {
  /**
   * The list is fully shown. Flips the row from "{count} more" to "Show less" and its glyph from
   * an ellipsis to a dash. @default false
   */
  expanded?: boolean
  /** How many rows are hidden. Shown when collapsed; ignored once `expanded`. */
  count?: number
}

/**
 * PlanMore: the overflow row that closes a long list — "3 more" collapsed, "Show less" open.
 * A plan is something you scan, so it should open at a readable length and let you ask for the
 * rest, rather than unrolling twelve to-dos at whoever opens the card. Which rows you actually
 * render is yours; this is the control and the label.
 */
export function PlanMore({
  className,
  expanded = false,
  count,
  children,
  ...props
}: PlanMoreProps) {
  const { slots } = usePlanContext("PlanMore")

  return (
    <button
      type="button"
      data-slot="plan-more"
      data-expanded={expanded || undefined}
      aria-expanded={expanded}
      className={slots.rowButton({ className })}
      {...props}
    >
      <span aria-hidden className={slots.rowButtonMark()}>
        {/* A real glyph, not a typographic ellipsis: a `…` character sits on the baseline and
            would drop out of the mark column that every row above it shares. */}
        {expanded ? <Minus weight="bold" /> : <DotsThree weight="bold" />}
      </span>
      {children ?? (expanded ? "Show less" : `${count ?? 0} more`)}
    </button>
  )
}

/** The commit bar: a `PlanSummary` on the left, the ghost + primary action pair on the right. */
export function PlanFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = usePlanContext("PlanFooter")
  return <div data-slot="plan-footer" className={slots.footer({ className })} {...props} />
}

/** The footer's meta read-out, e.g. "6 to-dos · about 4 min". Tabular, so a live count can't reflow it. */
export function PlanSummary({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = usePlanContext("PlanSummary")
  return <p data-slot="plan-summary" className={slots.summary({ className })} {...props} />
}
