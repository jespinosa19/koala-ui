"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { InputField, InputRoot, type InputFieldProps } from "@/components/ui/input"
import { Rating, type RatingProps } from "@/components/ui/rating"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TextareaField, TextareaRoot, type TextareaFieldProps } from "@/components/ui/textarea"
import { createContext } from "@/lib/create-context"
import { useDensity, ControlSizeProvider } from "@/lib/density"
import { glideIndicator, glideMoving, useGlide, type Glide } from "@/lib/glide"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Survey: the Google-Forms-style question card. Each `SurveyQuestion` is one self-contained
 * card: a small eyebrow ("Pregunta 1"), the question title (with an optional required asterisk),
 * an optional description, and a list of selectable options. Multi-part, so one `tv` recipe with
 * `slots` styles every piece, and the shared `density` / `type` flow through a typed Context, never
 * prop-drilled.
 *
 * Survey owns layout + semantics only; the *controls are the real DS components*. A single choice
 * composes `RadioGroup`/`RadioGroupItem` (roving focus, the canonical centered dot); `multiple`
 * composes `Checkbox` (the drawn check). We deliberately don't re-style the control here, reusing
 * the DS parts keeps a radio/checkbox identical to one anywhere else and means the look only ever
 * drifts on purpose (see docs/ARCHITECTURE.md, "compose, don't reinvent").
 *
 * Motion: the rows paint no fill of their own. ONE highlight travels to the row under the cursor
 * (or under the keyboard focus ring), the same single-object wash the Command palette roves over
 * its list, here through the shared `useGlide` hook. A choice list is scanned, not read, and an
 * object that moves is followed by the eye, where a fill blinking on and off per row is not.
 *
 * `"use client"` because the controls are interactive (Radix state + multi-select bookkeeping) and
 * the parts read density/selection from Context. Each option is a `<label htmlFor>` paired with its
 * control, so the whole row is the hit target and the label clicks through to the control.
 */
export const surveyVariants = tv({
  slots: {
    // A contour with no fill (fill is elevation, docs/FOUNDATIONS.md), so any nested DS
    // control (Input, Select…) takes the ground the survey sits on. The edge is an `--edge` ring
    // plus the xs lift, not a border ("Shadows over borders"), so it takes no layout.
    card: "flex flex-col rounded-xl text-card-foreground shadow-xs ring-1 ring-edge",
    header: "flex flex-col",
    eyebrow: "text-sm font-medium text-muted-foreground",
    // Question title labels the options group below it. `items-start` keeps the asterisk pinned to
    // the first line when the question wraps; `text-balance` evens out multi-line titles (#7).
    title: "flex items-start gap-1 text-base font-semibold leading-snug text-balance text-foreground",
    requiredMark: "leading-none text-destructive",
    description: "text-sm text-pretty text-muted-foreground",
    // `min-w-0` because the multiple-choice branch renders a `<fieldset>`, which the UA gives
    // `min-inline-size: min-content` and which would otherwise refuse to shrink.
    // `relative` positions the travelling highlight against the group (lib/glide measures with
    // offsetLeft/offsetTop, which are relative to the nearest positioned ancestor).
    options: "relative flex min-w-0 flex-col",
    option: [
      // min-h-10 holds every row at the 40px hit-target floor even at compact density (#9).
      "relative flex min-h-10 cursor-pointer select-none items-center gap-3 rounded-lg text-sm text-muted-foreground",
      // Tailwind's curated `transition` (explicit, never `all`, #14) so the press scale eases back
      // out instead of snapping; a restrained scale suits the wide row (#12, stays above 0.95).
      "transition duration-fast ease-out active:scale-[0.99]",
      // The row paints NO fill of its own: the shared `highlight` pill below travels to whichever
      // row the cursor (or a keyboard focus ring) is on, so the ink is all that changes here. The
      // DS control carries its own focus ring, so the row doesn't add a second one.
      "hover:text-foreground",
      // Selected only brightens the label; the filled control carries the state, so the row stays
      // clean (no fill) exactly like the reference's chosen option.
      "has-[[data-state=checked]]:font-medium has-[[data-state=checked]]:text-foreground",
      // A disabled control dims and freezes its row (and never takes the pill: no `data-glide`).
      "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:disabled]:hover:text-muted-foreground",
    ],
    optionLabel: "leading-snug",
    // The magnetic wash itself: one pill, behind the rows, that glides to the one under the
    // cursor instead of each row fading its own background in and out (see lib/glide, and the
    // Command palette, where the same single-object highlight roves the list).
    highlight: "rounded-lg bg-accent",
    // Linear-scale slots (used by SurveyScale).
    scaleRoot: "flex flex-col gap-2",
    // Same deal as `options`: positioned for the pill, and pulled back in by the points' own
    // vertical padding so adding room for the wash doesn't push the end captions down.
    scaleTrack: "relative -my-2 flex items-end justify-between gap-2",
    scalePoint: [
      "relative flex flex-1 cursor-pointer select-none flex-col items-center gap-1.5 rounded-lg py-2 text-sm text-muted-foreground",
      "transition-colors duration-fast ease-out hover:text-foreground",
      "has-[[data-state=checked]]:font-medium has-[[data-state=checked]]:text-foreground",
    ],
    // tabular-nums so the numbers never shift width as the row renders (#9).
    scaleNumber: "tabular-nums",
    scaleEnds: "flex items-center justify-between text-xs text-muted-foreground",
  },
  variants: {
    // Density retunes only spacing (never radius/color). `comfortable` is the marketing default,
    // `compact` tightens the card and rows for embedded app forms.
    // Each option carries its own horizontal padding so the hover/selected highlight has breathing
    // room around the control. That padding would otherwise indent the radio/checkbox from the title;
    // the matching negative margin on `options` pulls the group back out so the control optically
    // aligns with the title while the highlight bleeds into the card's own padding (#5, optical
    // alignment). The card padding (p-5/p-4) stays larger than the bleed so the highlight keeps an
    // inset from the card edge.
    density: {
      comfortable: { card: "gap-5 p-5", header: "gap-1.5", options: "gap-1.5 -mx-3.5", option: "px-3.5 py-3" },
      compact: { card: "gap-4 p-4", header: "gap-1", options: "gap-1 -mx-3", option: "px-3 py-2.5" },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

type SurveySlots = ReturnType<typeof surveyVariants>

type SurveyDensity = "comfortable" | "compact"

const [SurveyProvider, useSurveyContext] = createContext<{
  slots: SurveySlots
  density: SurveyDensity
  titleId: string
  required: boolean
}>("SurveyQuestion")

const [SurveyOptionsProvider, useSurveyOptionsContext] = createContext<{
  slots: SurveySlots
  type: "single" | "multiple"
  /** Group-level disabled, so a frozen row can opt out of the travelling highlight. */
  disabled: boolean
  isChecked: (value: string) => boolean
  toggle: (value: string) => void
}>("SurveyOptions")

// ─── SurveyHighlight ────────────────────────────────────────────────────────────

/**
 * The single pill that travels to the row under the cursor. A sibling of the rows (never a
 * wrapper: a wrapper would have to re-parent itself on every move), rendered BEFORE them so the
 * labels paint on top without a negative z-index.
 *
 * It only needs the measurements, not the container type, so it takes the read-only part of the
 * glide and the fieldset / div callers share it.
 */
function SurveyHighlight({
  glide,
  className,
}: {
  glide: Pick<Glide<HTMLElement>, "style" | "animate" | "visible">
  className?: string
}) {
  return (
    <span
      aria-hidden
      data-slot="survey-highlight"
      style={glide.style}
      className={cn(
        glideIndicator,
        // Place first, glide after: the pill appears on its row rather than flying in from the
        // group's corner the first time the cursor enters.
        glide.animate && glideMoving,
        glide.visible ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  )
}

// ─── SurveyQuestion ─────────────────────────────────────────────────────────────

export interface SurveyQuestionProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof surveyVariants> {
  /** Appends a destructive asterisk to the title (read by `SurveyTitle` from context). */
  required?: boolean
}

export function SurveyQuestion({
  className,
  density,
  required = false,
  ...props
}: SurveyQuestionProps) {
  // Density resolves prop > provider > "comfortable".
  const resolvedDensity = useDensity(density)
  const slots = surveyVariants({ density: resolvedDensity })
  // Links the title to the options group below it for assistive tech.
  const titleId = React.useId()

  // ONE control size for everything in the card: the short answer, the paragraph and the dropdown.
  // Before, the two text controls carried a hand-mapped `size` while the dropdown resolved from
  // ambient density, so a compact card could hold a small input beside a medium select.
  //
  // Imposed only when this card was TOLD a density (the same rule Form uses to re-provide one):
  // then the card is deliberately its own tier and owns its controls. Left unset it imposes
  // nothing, so a `Form` around the card finally reaches the fields instead of being silently
  // overridden from in here, and with no container at all the ambient density decides as before.
  const controlSize = density ? (resolvedDensity === "compact" ? "sm" : "md") : undefined

  const card = (
    <div
      data-slot="survey-question"
      data-control-size={controlSize}
      className={slots.card({ className })}
      {...props}
    />
  )

  return (
    <SurveyProvider slots={slots} density={resolvedDensity} titleId={titleId} required={required}>
      {controlSize ? <ControlSizeProvider size={controlSize}>{card}</ControlSizeProvider> : card}
    </SurveyProvider>
  )
}

// ─── SurveyHeader ───────────────────────────────────────────────────────────────

// Groups the eyebrow + title + description with a tight gap, separated from the options by the
// card's own gap, so the spacing reads correctly without per-part margins.
export function SurveyHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSurveyContext("SurveyHeader")
  return <div data-slot="survey-header" className={slots.header({ className })} {...props} />
}

// ─── SurveyEyebrow ──────────────────────────────────────────────────────────────

// The small muted label above the question ("Pregunta 1", "Question 3", "Section A").
export function SurveyEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useSurveyContext("SurveyEyebrow")
  return <p data-slot="survey-eyebrow" className={slots.eyebrow({ className })} {...props} />
}

// ─── SurveyTitle ────────────────────────────────────────────────────────────────

export interface SurveyTitleProps extends React.ComponentProps<"h3"> {
  /** Overrides the required state inherited from `SurveyQuestion`. */
  required?: boolean
}

export function SurveyTitle({ className, children, required, ...props }: SurveyTitleProps) {
  const { slots, titleId, required: ctxRequired } = useSurveyContext("SurveyTitle")
  const resolvedRequired = required ?? ctxRequired
  return (
    <h3 data-slot="survey-title" id={titleId} className={slots.title({ className })} {...props}>
      {children}
      {resolvedRequired ? (
        <>
          <span aria-hidden="true" className={slots.requiredMark()}>
            *
          </span>
          <span className="sr-only">(required)</span>
        </>
      ) : null}
    </h3>
  )
}

// ─── SurveyDescription ──────────────────────────────────────────────────────────

export function SurveyDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useSurveyContext("SurveyDescription")
  return <p data-slot="survey-description" className={slots.description({ className })} {...props} />
}

// ─── SurveyOptions ──────────────────────────────────────────────────────────────

interface SurveyOptionsBaseProps {
  className?: string
  children?: React.ReactNode
  /** Disables every option in the group. */
  disabled?: boolean
  /** Submitted under this name (single only: maps to the RadioGroup form field). */
  name?: string
}

type SurveyOptionsSingleProps = SurveyOptionsBaseProps & {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type SurveyOptionsMultipleProps = SurveyOptionsBaseProps & {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type SurveyOptionsProps = SurveyOptionsSingleProps | SurveyOptionsMultipleProps

// Each branch is its own component so neither one's hooks (the multi-select state, the glide)
// are called conditionally (Rules of Hooks, [[react-hooks-strict-lint]]).
export function SurveyOptions(props: SurveyOptionsProps) {
  return props.multiple ? <SurveyOptionsMultiple {...props} /> : <SurveyOptionsSingle {...props} />
}

function SurveyOptionsSingle({
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
}: SurveyOptionsSingleProps) {
  const { slots, titleId } = useSurveyContext("SurveyOptions")
  // Pointer, not selection: the selected row is spoken by the filled control, so the pill is
  // purely the hover / focus-visible wash chasing the cursor across the rows. Destructured, and
  // not read as `glide.ref` in the JSX, which the strict react-hooks lint reads as a ref access
  // during render ([[react-hooks-strict-lint]]).
  const { ref: glideRef, containerProps, ...glide } = useGlide<HTMLDivElement>({ track: "pointer" })

  return (
    <RadioGroup
      data-slot="survey-options"
      aria-labelledby={titleId}
      ref={glideRef}
      {...containerProps}
      className={slots.options({ className })}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
    >
      <SurveyHighlight glide={glide} className={slots.highlight()} />
      <SurveyOptionsProvider
        slots={slots}
        type="single"
        disabled={disabled ?? false}
        isChecked={() => false}
        toggle={() => {}}
      >
        {children}
      </SurveyOptionsProvider>
    </RadioGroup>
  )
}

// Multiple choice owns its own state: RadioGroup owns single-select state for us; here we own
// the `string[]` and toggle items in/out, driving plain DS `Checkbox`es.
function SurveyOptionsMultiple({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
}: SurveyOptionsMultipleProps) {
  const { slots, titleId } = useSurveyContext("SurveyOptions")
  const {
    ref: glideRef,
    containerProps,
    ...glide
  } = useGlide<HTMLFieldSetElement>({ track: "pointer" })
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const current = isControlled ? value : internal

  const isChecked = (v: string) => current.includes(v)
  const toggle = (v: string) => {
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    // A real `<fieldset>`, not a `div role="group"`: `aria-disabled` only *announced* the
    // disabled state while every checkbox stayed clickable, because the group-level `disabled`
    // was never threaded down to the individual controls. `<fieldset disabled>` disables them
    // natively, with nothing passed down, and names the set through `aria-labelledby` alone.
    //
    // Not `FieldGroup`: that carries the legend + hint wiring and its own vertical rhythm, and
    // here the name comes from the `SurveyTitle` heading (which stays an `<h3>` so a long survey
    // keeps its heading outline) and the layout is the survey's own. Only the element is needed.
    <fieldset
      data-slot="survey-options"
      aria-labelledby={titleId}
      disabled={disabled || undefined}
      ref={glideRef}
      {...containerProps}
      className={slots.options({ className })}
    >
      <SurveyHighlight glide={glide} className={slots.highlight()} />
      <SurveyOptionsProvider
        slots={slots}
        type="multiple"
        disabled={disabled ?? false}
        isChecked={isChecked}
        toggle={toggle}
      >
        {children}
      </SurveyOptionsProvider>
    </fieldset>
  )
}

// ─── SurveyOption ───────────────────────────────────────────────────────────────

export interface SurveyOptionProps extends Omit<React.ComponentProps<"label">, "onChange"> {
  /** The value this option contributes to the group's selection. */
  value: string
  disabled?: boolean
}

export function SurveyOption({ className, children, value, disabled, ...props }: SurveyOptionProps) {
  const { slots, type, disabled: groupDisabled, isChecked, toggle } = useSurveyOptionsContext("SurveyOption")
  // The label's `htmlFor` points at the control's `id`, so clicking anywhere on the row activates
  // it and the row is one large hit target (#9). Group `disabled` flows from the RadioGroup itself
  // for single choice, so the per-item disabled only needs to be threaded through for multiple.
  const id = React.useId()

  return (
    <label
      htmlFor={id}
      data-slot="survey-option"
      // What the pill may land on. A frozen row is left out, so the wash never travels onto a
      // choice that can't be made.
      data-glide={disabled || groupDisabled ? undefined : ""}
      className={slots.option({ className })}
      {...props}
    >
      {type === "single" ? (
        <RadioGroupItem id={id} value={value} disabled={disabled} />
      ) : (
        <Checkbox
          id={id}
          checked={isChecked(value)}
          onCheckedChange={() => toggle(value)}
          disabled={disabled}
        />
      )}
      <span className={slots.optionLabel()}>{children}</span>
    </label>
  )
}

// ─── SurveyShortAnswer ──────────────────────────────────────────────────────────

export interface SurveyShortAnswerProps extends InputFieldProps {
  /** Classes for the bordered Input container (the field itself still takes `className`). */
  rootClassName?: string
}

// Short-answer question: a single-line answer composed from the DS Input. Labelled by the
// question title so the control needs no separate visible label.
export function SurveyShortAnswer({ rootClassName, ...field }: SurveyShortAnswerProps) {
  // No `size`: the question card (or whatever contains it) decides, like every other control.
  const { titleId } = useSurveyContext("SurveyShortAnswer")
  return (
    <InputRoot data-slot="survey-short-answer" className={rootClassName}>
      <InputField aria-labelledby={titleId} {...field} />
    </InputRoot>
  )
}

// ─── SurveyParagraph ──────────────────────────────────────────────────────────

export interface SurveyParagraphProps extends TextareaFieldProps {
  /** Classes for the bordered Textarea container (the field itself still takes `className`). */
  rootClassName?: string
}

// Long-answer question: a multi-line answer composed from the DS Textarea. Auto-grows by
// default (override with `autoResize={false}`); pass `showCount` + `maxLength` for a counter.
export function SurveyParagraph({ rootClassName, ...field }: SurveyParagraphProps) {
  const { titleId } = useSurveyContext("SurveyParagraph")
  return (
    <TextareaRoot data-slot="survey-paragraph" className={rootClassName}>
      <TextareaField aria-labelledby={titleId} autoResize {...field} />
    </TextareaRoot>
  )
}

// ─── SurveyDropdown ──────────────────────────────────────────────────────────

export interface SurveyDropdownProps {
  /** The choices, in display order. */
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  /** Classes for the Select trigger. */
  className?: string
}

// Single choice as a dropdown: for long option lists where radios would crowd the card.
// Composes the DS Select; the trigger is labelled by the question title.
export function SurveyDropdown({
  options,
  placeholder = "Select an answer…",
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  className,
}: SurveyDropdownProps) {
  const { titleId } = useSurveyContext("SurveyDropdown")
  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectTrigger data-slot="survey-dropdown" aria-labelledby={titleId} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── SurveyRating ──────────────────────────────────────────────────────────────

export type SurveyRatingProps = RatingProps

// Star-rating question: composes the DS Rating, labelled by the question title. Forwards every
// Rating prop (max, size, readOnly, icon…).
export function SurveyRating(props: SurveyRatingProps) {
  const { titleId } = useSurveyContext("SurveyRating")
  return <Rating aria-labelledby={titleId} {...props} />
}

// ─── SurveyScale ──────────────────────────────────────────────────────────────

export interface SurveyScaleProps {
  /** First value on the scale (default 1). */
  min?: number
  /** Last value on the scale (default 5). */
  max?: number
  /** Caption under the lowest point (e.g. "Strongly disagree"). */
  minLabel?: string
  /** Caption under the highest point (e.g. "Strongly agree"). */
  maxLabel?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  className?: string
}

// Linear-scale question: a 1-to-N rating row built on the DS RadioGroup (one canonical dot per
// point), with optional end captions. Reach for it for agreement/satisfaction ratings.
export function SurveyScale({
  min = 1,
  max = 5,
  minLabel,
  maxLabel,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  className,
}: SurveyScaleProps) {
  const { titleId, slots } = useSurveyContext("SurveyScale")
  // A small, bounded local range: build the points inline (no need for an external list).
  const points = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i)
  // The same magnetic wash as the option rows, sideways: one pill sliding along the scale.
  const { ref: glideRef, containerProps, ...glide } = useGlide<HTMLDivElement>({ track: "pointer" })

  return (
    <div data-slot="survey-scale" className={slots.scaleRoot({ className })}>
      <RadioGroup
        aria-labelledby={titleId}
        ref={glideRef}
        {...containerProps}
        className={slots.scaleTrack()}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
      >
        <SurveyHighlight glide={glide} className={slots.highlight()} />
        {points.map((point) => {
          const pointValue = String(point)
          const id = `${name ?? "scale"}-${pointValue}`
          return (
            <label
              key={point}
              htmlFor={id}
              data-glide={disabled ? undefined : ""}
              className={slots.scalePoint()}
            >
              <span className={slots.scaleNumber()}>{point}</span>
              <RadioGroupItem id={id} value={pointValue} />
            </label>
          )
        })}
      </RadioGroup>
      {minLabel || maxLabel ? (
        <div className={slots.scaleEnds()}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
    </div>
  )
}
