"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"
import { CaretDown } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { hitY } from "@/lib/hit-area"
import { morphBox, useMorphBox } from "@/lib/morph"
import { duration, prefersReducedMotion } from "@/lib/motion"
import { Kbd } from "@/components/ui/kbd"
import { Progress, type ProgressProps } from "@/components/ui/progress"
import { Tooltip, TooltipGroup, type TooltipProps } from "@/components/ui/tooltip"

/**
 * Island: a floating pill whose contents change with what the viewer is doing, and whose shape
 * follows them. Browsing, it holds the page's controls; reading, it holds the way back, the
 * title and how far along you are. Each state is a view, and switching views is one gesture:
 * the pill eases to the new width (and height, and corner) while the old contents blur out and
 * the new ones blur in, in place.
 *
 *   <Island aria-label="Page" view={reading ? "reading" : "browse"}>
 *     <IslandView value="browse">
 *       <IslandButton tooltip="Dark theme" shortcut="L"><Moon /></IslandButton>
 *     </IslandView>
 *     <IslandView value="reading">
 *       <IslandButton tooltip="Back"><ArrowLeft /></IslandButton>
 *       <IslandSeparator />
 *       <IslandTitle>Designing with constraints</IslandTitle>
 *     </IslandView>
 *   </Island>
 *
 * Ported from the dynamic island on jordiespinosa.com. Behaviour and a11y come from Radix Toolbar:
 * `role="toolbar"`, one Tab stop and arrow keys between the controls. The box morph is the shared
 * `useMorphBox` (lib/morph.ts, the Dock's), so the pill measures where it is going rather than
 * where it is. No motion library: the crossfade is two CSS keyframes and an `animationend`.
 */

// Where a view sits while it leaves. Out of flow, so the box can already size itself to the view
// coming in, and pinned to the centre, which is where it was: views fill the pill, and the pill is
// centred on its own viewport. `w-max` stops the absolute box from shrink-wrapping (and wrapping or
// truncating early) against half the viewport it is anchored to.
const leaving =
  "data-[state=exit]:pointer-events-none data-[state=exit]:absolute data-[state=exit]:top-1/2 data-[state=exit]:left-1/2 data-[state=exit]:w-max data-[state=exit]:-translate-x-1/2 data-[state=exit]:-translate-y-1/2"

export const islandVariants = tv({
  slots: {
    // The morphing pill. The width, height and `--island-height` arrive inline from the measured
    // viewport; until the first measurement there are none, so SSR paints the natural size and
    // `data-morph-ready` withholds the transition, so nothing animates in from zero on load.
    //
    // The corner is derived from the height it is going to, never a fixed step: half of it while
    // the island is one row (a true pill, concentric with the round controls inside by
    // construction), capped at `radius-4xl` once a view grows into a card, so a tall island keeps
    // a card's corner instead of turning into a stadium. `--radius-pill` joins the `min()` so the
    // radius knob still rules: at None the island is square like every other pill in the system.
    // One formula, so the corner eases with the box instead of snapping between two classes.
    root: [
      ...morphBox,
      "isolate inline-flex items-center justify-center shadow-lg",
      "rounded-[min(var(--radius-pill),calc(var(--island-height,9999px)/2),var(--radius-4xl))]",
      // One clock for the whole island: the box and the crossfade inside it move together.
      "data-[morph-ready]:transition-[width,height,border-radius] data-[morph-ready]:duration-fast",
    ],
    // Measured, never sized, and centred in the box: while the pill is narrower than where it is
    // going, the viewport overflows both edges equally and the clip reveals it from the middle
    // out. `shrink-0` stops the flex box from squeezing it back down to the size it is leaving.
    viewport: "relative flex w-max shrink-0 items-center",
    // A state of the island. The one on screen enters with the liquid crossfade (blur + a slight
    // scale); the one leaving is lifted out of flow and blurs away over the same beat. The enter is
    // armed only after the first view change, so on page load the island is simply there.
    view: [
      "flex items-center",
      "data-[state=enter]:animate-in data-[state=enter]:fade-in-0 data-[state=enter]:zoom-in-96 data-[state=enter]:blur-in-4",
      leaving,
      "data-[state=exit]:animate-out data-[state=exit]:fade-out-0 data-[state=exit]:zoom-out-98 data-[state=exit]:blur-out-4 data-[state=exit]:fill-mode-forwards",
      // `duration-fast` is here for the keyframes (tw-animate reads it), but it also writes
      // `transition-duration`, and with no property list that means `all`: the leaving view would
      // then SLIDE into its centring translate instead of taking it at once. Nothing on a view
      // transitions; everything it does is the keyframes.
      "transition-none duration-fast ease-out motion-reduce:animate-none",
    ],
    // A region inside a view that swaps on its own (the title becoming the progress readout, a
    // button that only exists past the fold). Its own small morph box, with no surface. It pads
    // itself by 4px and gives the 4px back with a negative margin, so the clip that makes the swap
    // read as one object sits just outside the content: focus rings survive it, and an empty swap
    // takes up no room at all.
    swap: [
      ...morphBox,
      "-m-1 inline-flex shrink-0 items-center justify-center",
      "data-[morph-ready]:duration-fast",
    ],
    swapViewport: "relative flex w-max shrink-0 items-center p-1",
    // Round at rest (a circle when it holds one glyph, a pill when it holds a word), and on the
    // radius knob like every Koala button. No press-scale: the chip and the colour carry the state.
    button: [
      "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center rounded-pill font-medium whitespace-nowrap outline-none",
      // Vertical-only hit extender: side by side, growing sideways would steal a neighbour's tap.
      // The pill's own padding holds the extra height, so the clip never cuts into it.
      hitY,
      "transition-[background-color,color] duration-fast ease-out motion-reduce:transition-none",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      "disabled:pointer-events-none disabled:opacity-40",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      // A menu trigger turns its caret toward the menu while it is open.
      "data-[state=open]:[&>[data-slot=island-button-caret]]:rotate-180",
    ],
    caret: "size-3 caret-turn-fast",
    // A status glyph that is not a control: a spinner, a live dot, a check. It gets a button's
    // square so it lines up with the controls around it and sits concentric in the pill's end.
    icon: "inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0",
    separator: "w-px shrink-0 rounded-full",
    // What you are looking at, in one line. Capped so a long headline truncates rather than
    // stretching the pill across the screen; 40vw keeps it honest on a phone.
    title: "block max-w-[min(14rem,40vw)] min-w-0 truncate",
    progress: "flex items-center",
    // The readout is fixed-width and tabular, so 9% → 10% → 100% never nudges the bar sideways.
    progressValue: "shrink-0 text-right tabular-nums",
    progressBar: "w-20 sm:w-32",
  },
  variants: {
    // NOTE: in a slotted recipe every variant value MUST be a `{ slot: "…" }` object. A bare
    // string typechecks and silently does nothing (memory `tv-slots-variant-object-not-string`).
    variant: {
      // Floating (default): the house's elevated popover surface with an inset ring, never a
      // border, which would spend 1px of layout and push the controls off the concentric corner.
      // Controls rest muted and only brighten on hover; the chip is reserved for a state (pressed,
      // or a menu that is open), which keeps a bar of five icons quiet until one of them means
      // something.
      floating: {
        root: "bg-popover text-popover-foreground ring-1 ring-inset ring-border [--surface:var(--popover)]",
        button:
          "text-muted-foreground hover:text-foreground data-[pressed]:bg-accent data-[pressed]:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground focus-visible:ring-offset-popover",
        icon: "text-muted-foreground",
        separator: "bg-border",
        title: "text-foreground",
        progressValue: "text-foreground",
      },
      // Solid: the inverted slab, the closest thing to the hardware island, and the one to use
      // over a photograph, a video or a canvas. It flips foreground and background instead of
      // hardcoding black, so it stays legible in all four themes. The bar is re-tinted from the
      // outside: Progress's own track is `muted`, which would vanish on this ground.
      solid: {
        root: "bg-foreground text-background [--surface:var(--foreground)]",
        button:
          "text-background/65 hover:text-background data-[pressed]:bg-background/15 data-[pressed]:text-background data-[state=open]:bg-background/15 data-[state=open]:text-background focus-visible:ring-offset-foreground",
        icon: "text-background/65",
        separator: "bg-background/20",
        title: "text-background",
        progress:
          "[&_[data-slot=progress-track]]:bg-background/20 [&_[data-slot=progress-indicator]]:bg-background",
        progressValue: "text-background",
      },
    },
    /**
     * `size` is the island's OWN density axis, the same call as Dock and Toolbar: a floating
     * control bar that shrinks to form-compact becomes hard to hit. `md` is the original's 44px
     * pill (a 36px control inside 4px of padding); `lg` is the touch step. Every step keeps the
     * identity padding + half a control = half the pill, so the controls come out concentric.
     */
    size: {
      sm: {
        viewport: "gap-0.5 p-1",
        view: "gap-0.5",
        button: "h-8 min-w-8 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-4",
        separator: "mx-0.5 h-4",
        title: "px-2.5 text-sm",
        progress: "gap-2.5 px-2.5",
        progressValue: "w-10 text-sm",
      },
      md: {
        viewport: "gap-0.5 p-1",
        view: "gap-0.5",
        button: "h-9 min-w-9 gap-1.5 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-4",
        separator: "mx-0.5 h-5",
        title: "px-3 text-sm",
        progress: "gap-3 px-3",
        progressValue: "w-10 text-sm",
      },
      lg: {
        viewport: "gap-1 p-1.5",
        view: "gap-1",
        button: "h-11 min-w-11 gap-2 px-3 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 [&_svg:not([class*='size-'])]:size-5",
        separator: "mx-1 h-6",
        title: "px-3.5 text-base",
        progress: "gap-3.5 px-3.5",
        progressValue: "w-12 text-base",
      },
    },
  },
  defaultVariants: {
    variant: "floating",
    size: "md",
  },
})

type IslandSlots = ReturnType<typeof islandVariants>

const [IslandProvider, useIslandContext] = createContext<{
  slots: IslandSlots
  tooltipPlacement: TooltipProps["placement"]
}>("Island")

// ─── views ────────────────────────────────────────────────────────────────────

interface IslandViewsValue {
  /** The view on screen. */
  current: string | undefined
  /** The view on its way out, kept mounted until its blur has played. */
  exiting: string | undefined
  /** Whether the views have changed at least once, which is what arms the enter animation. */
  animate: boolean
  finishExit: (value: string) => void
}

// The nearest owner of a set of views: the Island itself, or an IslandSwap inside one.
const [IslandViewsProvider, useIslandViews] = createContext<IslandViewsValue>("Island")

/**
 * Which view is on screen, and which one is leaving. Views are declared up front and switch
 * themselves on and off from this, so a leaving view is the SAME instance that was on screen a
 * moment ago (its state, its tooltips), not a snapshot re-rendered in its place.
 *
 * Render-time previous-value pattern rather than an effect (the strict react-hooks lint), the
 * same shape the Dock uses to arm its layer animation.
 */
function useViews(view: string | undefined): IslandViewsValue {
  const [state, setState] = React.useState<{
    current: string | undefined
    exiting: string | undefined
    animate: boolean
  }>({ current: view, exiting: undefined, animate: false })

  if (state.current !== view) {
    setState({
      current: view,
      // Under reduced motion there is no blur to wait for, so the old view simply goes.
      exiting: prefersReducedMotion() ? undefined : state.current,
      animate: true,
    })
  }

  const finishExit = React.useCallback((value: string) => {
    setState((s) => (s.exiting === value ? { ...s, exiting: undefined } : s))
  }, [])

  return { ...state, finishExit }
}

// ─── Island (root) ────────────────────────────────────────────────────────────

export interface IslandProps
  extends Omit<React.ComponentProps<typeof ToolbarPrimitive.Root>, "orientation">,
    VariantProps<typeof islandVariants> {
  /**
   * The view on screen: the `value` of one of its `IslandView` children. Change it and the pill
   * morphs to the new view's size while the contents crossfade. Leave it unset for an island
   * without views, whose children are simply its contents (it still eases when they change size).
   */
  view?: string
  /** Where the controls' tooltips open. The island usually sits at the bottom. @default "top" */
  tooltipPlacement?: TooltipProps["placement"]
}

export function Island({
  className,
  variant,
  size,
  view,
  tooltipPlacement = "top",
  style: styleProp,
  children,
  ...props
}: IslandProps) {
  const slots = islandVariants({ variant, size })
  const views = useViews(view)
  // Destructured: reading a property off the returned object trips `react-hooks/refs` (it holds
  // a ref). See lib/morph.ts.
  const { ref, style, ready } = useMorphBox("both")
  const height = style?.height

  return (
    <IslandProvider slots={slots} tooltipPlacement={tooltipPlacement}>
      <ToolbarPrimitive.Root
        data-slot="island"
        data-morph-ready={ready ? "" : undefined}
        // Radix requires an accessible name.
        aria-label={props["aria-label"] ?? "Island"}
        orientation="horizontal"
        style={
          {
            ...styleProp,
            ...style,
            // The height the island is going to, for the corner formula in the recipe.
            ...(typeof height === "number" && { "--island-height": `${height}px` }),
          } as React.CSSProperties
        }
        className={slots.root({ className })}
        {...props}
      >
        {/* One gliding tooltip for every control (Tippy singleton), outside the views so it
            survives a view change instead of being torn down mid-glide. */}
        <TooltipGroup>
          <div ref={ref} data-slot="island-viewport" className={slots.viewport()}>
            <IslandViewsProvider {...views}>{children}</IslandViewsProvider>
          </div>
        </TooltipGroup>
      </ToolbarPrimitive.Root>
    </IslandProvider>
  )
}

// ─── IslandView ───────────────────────────────────────────────────────────────

export interface IslandViewProps extends Omit<React.ComponentProps<"div">, "ref"> {
  /** This view's name. It is on screen while the nearest `Island` / `IslandSwap` has `view={value}`. */
  value: string
}

/**
 * One state of the island. Only the view on screen is mounted, plus, for one beat, the view that
 * is leaving: lifted out of flow, `inert`, hidden from assistive tech, and removed once its blur
 * has played. A view is a row by default; give it `flex-col` to turn the pill into a card.
 */
export function IslandView({
  value,
  className,
  children,
  onAnimationEnd,
  ...props
}: IslandViewProps) {
  const { slots } = useIslandContext("IslandView")
  const { current, exiting, animate, finishExit } = useIslandViews("IslandView")
  const node = React.useRef<HTMLDivElement>(null)

  const state = value === current ? "current" : value === exiting ? "exit" : null

  React.useLayoutEffect(() => {
    if (state !== "exit") return
    // The control that was just pressed usually lives in the view it replaced ("Back"). Going
    // inert would drop focus onto `body`, so hand it to the first control still on screen.
    const view = node.current
    if (!view || !view.contains(document.activeElement)) return
    const root = view.closest<HTMLElement>("[data-slot=island]")
    const next = Array.from(
      root?.querySelectorAll<HTMLElement>("[data-island-control]") ?? [],
    ).find((control) => !control.closest("[data-state=exit]"))
    next?.focus({ preventScroll: true })
  }, [state])

  // `animationend` is the normal way out; this is the safety net. A background tab, or a pane
  // that never paints, does not run animations, and a view that never leaves is worse than one
  // that leaves without its fade.
  React.useEffect(() => {
    if (state !== "exit") return
    const timer = setTimeout(() => finishExit(value), duration.fast * 2)
    return () => clearTimeout(timer)
  }, [state, value, finishExit])

  if (!state) return null
  const isLeaving = state === "exit"

  return (
    <div
      ref={node}
      data-slot="island-view"
      data-state={isLeaving ? "exit" : animate ? "enter" : undefined}
      aria-hidden={isLeaving || undefined}
      inert={isLeaving || undefined}
      onAnimationEnd={(event) => {
        onAnimationEnd?.(event)
        // Animations inside the view (a spinner, a nested swap) bubble their own `animationend`.
        if (isLeaving && event.target === event.currentTarget) finishExit(value)
      }}
      className={slots.view({ className })}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── IslandSwap ───────────────────────────────────────────────────────────────

export interface IslandSwapProps extends Omit<React.ComponentProps<"div">, "ref"> {
  /**
   * The `IslandView` on screen inside this region. A value no child answers to empties it, and
   * the region collapses to nothing: the way to grow a control in and out of the pill.
   */
  view?: string
}

/**
 * A region of a view that swaps on its own, with the island's crossfade and its own small morph:
 * the title that becomes a progress readout once you scroll, a "back to top" that only exists
 * past the fold. Declare its states as `IslandView`s, exactly like the island's.
 */
export function IslandSwap({ view, className, style: styleProp, children, ...props }: IslandSwapProps) {
  const { slots } = useIslandContext("IslandSwap")
  const views = useViews(view)
  const { ref, style, ready } = useMorphBox("both")

  return (
    <div
      data-slot="island-swap"
      data-morph-ready={ready ? "" : undefined}
      style={{ ...styleProp, ...style }}
      className={slots.swap({ className })}
      {...props}
    >
      <div ref={ref} className={slots.swapViewport()}>
        <IslandViewsProvider {...views}>{children}</IslandViewsProvider>
      </div>
    </div>
  )
}

// ─── IslandButton ─────────────────────────────────────────────────────────────

export interface IslandButtonProps
  extends Omit<React.ComponentProps<typeof ToolbarPrimitive.Button>, "aria-pressed"> {
  /** A toggle that is on (a layer shown, a post saved). Sets `aria-pressed` and lights the chip. */
  pressed?: boolean
  /** Hover/focus hint. A plain string also becomes the button's `aria-label` when none is set. */
  tooltip?: React.ReactNode
  /** Keyboard shortcut shown as a keycap in the tooltip (display only, e.g. `"L"`). */
  shortcut?: string
  /** A trailing caret that turns toward the menu while it is open: the menu-trigger look. */
  caret?: boolean
}

/**
 * A control in the island. One glyph makes it a circle; a word makes it a pill; `caret` makes it
 * a menu trigger. To open a DropdownMenu from it, keep the Tooltip OUTSIDE the trigger
 * (`Tooltip` → `DropdownMenuTrigger asChild` → `IslandButton`), as with ToolbarButton.
 */
export function IslandButton({
  className,
  pressed,
  tooltip,
  shortcut,
  caret = false,
  asChild = false,
  children,
  "aria-label": ariaLabel,
  ...props
}: IslandButtonProps) {
  const { slots, tooltipPlacement } = useIslandContext("IslandButton")
  // Derive an accessible name from a string tooltip so icon-only controls stay labelled.
  const label = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined)

  const button = (
    <ToolbarPrimitive.Button
      type="button"
      data-slot="island-button"
      data-island-control=""
      data-pressed={pressed || undefined}
      aria-pressed={pressed}
      aria-label={label}
      asChild={asChild}
      className={slots.button({ className })}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {caret && (
            <CaretDown
              weight="bold"
              aria-hidden
              data-slot="island-button-caret"
              className={slots.caret()}
            />
          )}
        </>
      )}
    </ToolbarPrimitive.Button>
  )

  if (!tooltip) return button

  return (
    <Tooltip
      content={
        shortcut ? (
          <span className="flex items-center gap-1.5">
            {tooltip}
            <Kbd size="sm">{shortcut}</Kbd>
          </span>
        ) : (
          tooltip
        )
      }
      placement={tooltipPlacement}
    >
      {button}
    </Tooltip>
  )
}

// ─── IslandIcon ───────────────────────────────────────────────────────────────

export type IslandIconProps = React.ComponentProps<"span">

/**
 * A glyph that says something rather than does something: a spinner while a task runs, a check
 * when it lands, a live dot. It takes a control's square, so it lines up with the buttons beside
 * it and sits concentric in the end of the pill.
 */
export function IslandIcon({ className, ...props }: IslandIconProps) {
  const { slots } = useIslandContext("IslandIcon")
  return <span data-slot="island-icon" className={slots.icon({ className })} {...props} />
}

// ─── IslandSeparator ──────────────────────────────────────────────────────────

/** A hairline between clusters of controls. */
export function IslandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { slots } = useIslandContext("IslandSeparator")
  return (
    <ToolbarPrimitive.Separator
      data-slot="island-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

// ─── IslandTitle ──────────────────────────────────────────────────────────────

export type IslandTitleProps = React.ComponentProps<"span">

/** What you are looking at, in one line: truncates before it stretches the pill. */
export function IslandTitle({ className, ...props }: IslandTitleProps) {
  const { slots } = useIslandContext("IslandTitle")
  return <span data-slot="island-title" className={slots.title({ className })} {...props} />
}

// ─── IslandProgress ───────────────────────────────────────────────────────────

export interface IslandProgressProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 0 to 100. `null` for a task whose length is unknown: the readout goes and the bar sweeps. */
  value: number | null
  /**
   * The fill's easing, passed to Progress. Keep `"smooth"` for a task that reports in steps; use
   * `"none"` when the value follows the scroll, or the bar trails the scrollbar.
   * @default "smooth"
   */
  transition?: ProgressProps["transition"]
}

/**
 * How far along: a tabular readout and a thin bar (our Progress, so the bar is a real
 * `role="progressbar"`). Name it with `aria-label`; the readout is hidden from assistive tech,
 * because the bar already announces the same number.
 */
export function IslandProgress({
  value,
  transition,
  className,
  "aria-label": ariaLabel = "Progress",
  ...props
}: IslandProgressProps) {
  const { slots } = useIslandContext("IslandProgress")
  return (
    <div data-slot="island-progress" className={slots.progress({ className })} {...props}>
      {value !== null && (
        <span aria-hidden data-slot="island-progress-value" className={slots.progressValue()}>
          {Math.round(value)}%
        </span>
      )}
      <Progress
        value={value}
        size="xs"
        tone="foreground"
        transition={transition}
        aria-label={ariaLabel}
        className={slots.progressBar()}
      />
    </div>
  )
}
