"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"
import { ArrowLeft, CaretRight, List } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { hitY } from "@/lib/hit-area"
import { duration } from "@/lib/motion"
import { useDensity } from "@/lib/density"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipGroup, type TooltipProps } from "@/components/ui/tooltip"

/**
 * Dock: a floating rail of icon controls that morphs, in place, into a labelled menu with
 * drill-down layers. One box: it animates its own width, height and corner between the two
 * shapes instead of opening a second surface beside itself, so the rail *becomes* the menu.
 *
 *   <Dock aria-label="Workspace">
 *     <DockItem icon={<SquaresFour />} label="Components" shortcut="⌘1" active />
 *     <DockItem icon={<Browsers />} label="Templates" shortcut="⌘2" />
 *     <DockGroup icon={<Palette />} label="Appearance">
 *       <DockLabel>Theme</DockLabel>
 *       <DockItem icon={<Sun />} label="Light" />
 *     </DockGroup>
 *     <DockExpander />
 *   </Dock>
 *
 * Behaviour and a11y come from Radix Toolbar: `role="toolbar"`, roving tab focus (the whole
 * dock is one Tab stop) and arrow-key movement, whose axis follows the shape: horizontal in
 * the rail, vertical in the panel. Everything the primitive does NOT cover (the morph, the
 * layer stack, dismissal) lives here. See docs/ARCHITECTURE.md.
 *
 * The label is a PROP, not children, because the dock renders it twice: as the tooltip on the
 * collapsed icon and as the row's text in the panel. One source, two shapes.
 */

// Shared base for anything pressable in the dock, rail icon and panel row alike. It deliberately
// omits geometry and color: the two shapes are different controls (a square icon with a hit
// extender and a focus ring; a menu row that highlights like DropdownMenu's), so each slot adds its
// own. Only what must never drift between them lives here.
const controlBase = [
  "relative inline-flex shrink-0 cursor-pointer select-none items-center outline-none",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
]

export const dockVariants = tv({
  slots: {
    // The morphing box. `overflow-hidden` is what makes the morph read as one object: the
    // incoming layer is clipped by a box that is still the old size and gets revealed as it
    // grows. The explicit width/height arrive as an inline style from the measured viewport;
    // until the first measurement lands there is none, so SSR paints the natural size and
    // `data-[ready]` withholds the transition so nothing animates in from zero on mount.
    root: [
      "relative isolate inline-block overflow-hidden shadow-lg",
      "data-[ready]:transition-[width,height,border-radius] data-[ready]:duration-base data-[ready]:ease-out",
      "motion-reduce:transition-none",
    ],
    // Measured, never sized: `w-max` keeps it at its natural width inside a parent that is mid-
    // morph, so the ResizeObserver reads where the box is *going*, not where it is.
    viewport: "w-max",
    // The layer currently on screen. Re-keyed on every view change, so the enter animation
    // replays: a fade, plus a directional slide that tells you whether you went in or back.
    // `data-[animate]` arms it only after the first view change. On page load the dock is simply
    // there, it does not fade itself in. The rows inside deliberately do NOT cascade: the box
    // morph IS the entrance here, and six rows rising through a growing box fight it.
    layer: [
      "flex motion-reduce:animate-none",
      "data-[animate]:animate-in data-[animate]:fade-in-0 data-[animate]:duration-base data-[animate]:ease-out",
      "data-[direction=forward]:slide-in-from-right-2",
      "data-[direction=backward]:slide-in-from-left-2",
    ],
    rail: "flex-row items-center",
    // The panel IS a DropdownMenu surface, row for row (see `dropdownMenuVariants`): 4px of
    // container padding, rows of 8px padding, so every icon, label, shortcut and caret sits 12px
    // from the outer edge. No gap between rows, exactly like the menu. What differs is behaviour
    // (the box morphs out of the rail, groups drill in place), never anatomy.
    panel: "min-w-56 flex-col items-stretch p-1",
    railItem: [
      ...controlBase,
      "justify-center",
      // Hit extender (#9), vertical-only so a rail icon never steals its neighbour's tap.
      hitY,
      // Specific transition (#14), never `transition: all`. `scale` is named because in Tailwind v4
      // `scale-*` compiles to the standalone `scale` property, so `transition-colors` alone would
      // make the press snap instead of ease.
      "transition-[background-color,color,scale] duration-fast ease-out",
      "active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      "disabled:pointer-events-none disabled:opacity-40",
    ],
    // DropdownMenuItem's row: text-sm/500 label, 20px muted leading icon 8px from it, rounded-md
    // (the panel's rounded-lg minus its 4px padding), highlight = the accent fill, keyboard focus
    // included, no ring and no press-scale. Height comes from `density`, like the menu's.
    // The current row also gains weight: its fill is the same one hover paints, so the fill alone
    // cannot say which row you are on. Same answer the Sidebar gives its active item.
    panelItem: [
      ...controlBase,
      "w-full justify-start gap-2 rounded-md px-2 text-sm font-medium",
      "transition-colors duration-fast ease-out motion-reduce:transition-none",
      "disabled:pointer-events-none disabled:opacity-50",
      "[&_svg:not([class*='size-'])]:size-5 data-[active]:font-semibold",
    ],
    // `w-max` above means a label never wraps; nowrap keeps that true when a consumer pins a
    // width on the root.
    itemLabel: "whitespace-nowrap",
    // "There is more behind this row." DropdownMenuSubTrigger's caret: 16px, on the 12px edge line.
    itemCaret: "ml-auto size-4",
    // The row's shortcut: DropdownMenuShortcut's gray chip, on the same 12px edge line. The solid
    // variant re-tints it, because a `bg-foreground/8` chip would vanish on the inverted slab.
    itemShortcut: "ml-auto",
    // A caption above a run of rows (DropdownMenuLabel). Never in the rail: there is no room for
    // a word, and the tooltips already name each icon.
    label: "select-none px-2 text-xs font-medium",
    separator: "shrink-0",
  },
  variants: {
    // NOTE: in a slotted recipe every variant value MUST be a `{ slot: "…" }` object. A bare
    // string typechecks and silently does nothing (memory `tv-slots-variant-object-not-string`).
    variant: {
      // Solid: an inverted slab, for a dock that has to hold its own over a photograph, a canvas
      // or a video. It reads dark on the light themes and light on the dark ones because it flips
      // foreground↔background rather than hardcoding black, the same trick the Toolbar's `solid`
      // plays. Declares `--surface` so anything nested blends onto it.
      //
      // One highlight tone for hover, keyboard focus and the current destination: the house accent
      // re-tinted for an inverted surface. A dark slab (light themes) takes the dark themes' accent
      // step (/8); a light slab (dark themes, the `dark:` pair) takes the light theme's far fainter
      // one (/4), so the current icon never reads as a grey button pressed into a white pill.
      // Where you are is said in ink, never in brand: full-strength glyph against 70% ones.
      solid: {
        root: "bg-foreground text-background [--surface:var(--foreground)]",
        railItem: [
          "text-background/70 focus-visible:ring-offset-foreground",
          "hover:bg-background/8 hover:text-background dark:hover:bg-background/4",
          "data-[active]:bg-background/8 data-[active]:text-background dark:data-[active]:bg-background/4",
        ],
        // A panel row is reading text, so it rests at full strength and lets the leading icon
        // carry the hierarchy at 60%: the house menu-row pattern, re-tinted for an inverted
        // surface (muted-foreground would be invisible here).
        panelItem: [
          "text-background [&>svg]:text-background/60 data-[active]:[&>svg]:text-background",
          "hover:bg-background/8 dark:hover:bg-background/4",
          "focus-visible:bg-background/8 dark:focus-visible:bg-background/4",
          "data-[active]:bg-background/8 dark:data-[active]:bg-background/4",
        ],
        itemCaret: "text-background/60",
        itemShortcut: "bg-background/10 text-background/70",
        label: "text-background/60",
        separator: "bg-background/15",
      },
      // Floating (default): the house's elevated popover surface. It is the default because a
      // dock is chrome, and chrome should inherit the page's theme rather than punch a slab of
      // the opposite colour through it. Inset ring, never a border: a border spends 1px of
      // layout and would push the controls off the concentric corner.
      floating: {
        root: "bg-popover text-popover-foreground ring-1 ring-inset ring-border [--surface:var(--popover)]",
        railItem:
          "text-muted-foreground hover:bg-accent hover:text-foreground data-[active]:bg-accent data-[active]:text-foreground focus-visible:ring-offset-popover",
        panelItem: [
          "text-popover-foreground [&>svg]:text-muted-foreground data-[active]:[&>svg]:text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:bg-accent focus-visible:text-accent-foreground",
          "data-[active]:bg-accent data-[active]:text-accent-foreground",
        ],
        itemCaret: "text-muted-foreground",
        itemShortcut: "",
        label: "text-muted-foreground",
        separator: "bg-border",
      },
    },
    /**
     * `size` is the RAIL's density axis, deliberately not the page's comfortable/compact knob
     * (same call as Toolbar): a floating control bar that shrinks to form-compact becomes hard to
     * hit. Each step is built on one identity, **4px padding + half the icon button = the rail's
     * corner**, so the buttons come out as true circles AND concentric inside the pill at every
     * size (16 − 4 = 12 = 24/2, 20 − 4 = 16 = 32/2, 24 − 4 = 20 = 40/2). The 4px is the panel's
     * own padding, and the md button is a compact row's height with the same 20px glyph, so the
     * rail is the panel's rows laid on their side: one object at one scale in both shapes, never
     * a chunky capsule that turns thin when it opens. hitY still grows each icon to 40px tall.
     * The panel ignores `size`: a menu is a menu, so it follows `density` like every DropdownMenu.
     */
    size: {
      sm: {
        rail: "gap-0.5 p-1",
        railItem: "size-6 rounded-md [&_svg:not([class*='size-'])]:size-4",
      },
      md: {
        rail: "gap-1 p-1",
        railItem: "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
      lg: {
        rail: "gap-1 p-1",
        railItem: "size-10 rounded-xl [&_svg:not([class*='size-'])]:size-6",
      },
    },
    /**
     * The panel's row height, the same two steps as DropdownMenu: 36px comfortable (py-2 around a
     * 20px line), 32px compact (py-1.5). Radius and edge inset never move with it.
     */
    density: {
      comfortable: { panelItem: "py-2", label: "py-1.5" },
      compact: { panelItem: "py-1.5", label: "py-1" },
    },
    /**
     * The shape the box is currently in. It drives the corner (below, per size) and flips the
     * separator's axis, the one piece of chrome whose geometry is genuinely different in a row
     * and in a column.
     */
    expanded: {
      // -mx-0.75, like the menu's rule: it stops at the ring's inner edge instead of painting over
      // it. No `w-full`: the column stretches it, and a percentage width would cancel the bleed.
      true: { separator: "-mx-0.75 h-px" },
      false: { separator: "mx-1 h-5 w-px rounded-full" },
    },
  },
  compoundVariants: [
    // Collapsed, the box is a true pill: the corner is exactly half the rail's height
    // (4 + button + 4), so it reads as a capsule rather than a rounded rectangle.
    { expanded: false, size: "sm", class: { root: "rounded-lg" } },
    { expanded: false, size: "md", class: { root: "rounded-xl" } },
    { expanded: false, size: "lg", class: { root: "rounded-2xl" } },
    // Expanded, it is the DropdownMenu surface at every size: rounded-lg (16) over 4px of padding
    // over rounded-md (12) rows, concentric.
    { expanded: true, class: { root: "rounded-lg" } },
    // The panel's rule breathes like the menu's; the rail's tick keeps its own margins.
    { expanded: true, density: "comfortable", class: { separator: "my-1.5" } },
    { expanded: true, density: "compact", class: { separator: "my-1" } },
  ],
  defaultVariants: {
    variant: "floating",
    size: "md",
    density: "comfortable",
    expanded: false,
  },
})

type DockSlots = ReturnType<typeof dockVariants>

interface DockContextValue {
  slots: DockSlots
  /** Whether the box is in its panel shape. */
  expanded: boolean
  setExpanded: (value: boolean) => void
  /** The open drill-down branch, one group id per level. Empty = the top layer. */
  path: string[]
  /** Enter `id`'s layer from `depth`, truncating any deeper branch. */
  openLayer: (depth: number, id: string) => void
  /** Leave the current layer for its parent. */
  back: () => void
  /** What opens the dock: a click on the expander, or hovering it. */
  trigger: "click" | "hover"
  closeOnSelect: boolean
  /** Disable the tactile press-scale on the rail icons. */
  isStatic: boolean
  tooltipPlacement: TooltipProps["placement"]
  /** Hover mode: the pointer came back before the grace period ran out. */
  cancelClose: () => void
  /** Move focus into the next view once it renders. For changes the viewer drove deliberately. */
  armRefocus: () => void
}

const [DockProvider, useDockContext] = createContext<DockContextValue>("Dock")

// Which layer a part belongs to. Parts render only when their own depth is the one on screen,
// which is what lets the same declarative tree describe every layer of the menu.
const [DockLayerProvider, useDockLayerContext] = createContext<{ depth: number }>("Dock")

// ─── Dock (root) ──────────────────────────────────────────────────────────────

export interface DockProps
  extends Omit<React.ComponentProps<typeof ToolbarPrimitive.Root>, "orientation">,
    Omit<VariantProps<typeof dockVariants>, "expanded"> {
  /** Controlled panel state. Leave unset for an uncontrolled dock. */
  expanded?: boolean
  /** Panel state on mount, when uncontrolled. @default false */
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /**
   * What opens the panel. `"hover"` expands when the pointer lands on {@link DockExpander} and
   * collapses shortly after it leaves the dock: the reference behaviour, and the reason the
   * expander exists. `"click"` is the accessible default and the right pick on touch.
   * @default "click"
   */
  trigger?: "click" | "hover"
  /** Collapse back to the rail after an item is chosen. @default true */
  closeOnSelect?: boolean
  /** Tooltip placement for the collapsed icons. @default "top" */
  tooltipPlacement?: TooltipProps["placement"]
  /** Disable the tactile scale-on-press on the rail icons (panel rows never scale, like menu rows). */
  static?: boolean
}

export function Dock({
  className,
  variant,
  density,
  size,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  trigger = "click",
  closeOnSelect = true,
  tooltipPlacement = "top",
  static: isStatic = false,
  children,
  ...props
}: DockProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  // Set by a layer change the user drove, read by the effect that moves focus into the new
  // layer. A ref, not state: it must not cause a render of its own.
  const refocus = React.useRef(false)

  const [uncontrolled, setUncontrolled] = React.useState(defaultExpanded)
  const expanded = expandedProp ?? uncontrolled
  const setExpanded = React.useCallback(
    (value: boolean) => {
      if (expandedProp === undefined) setUncontrolled(value)
      onExpandedChange?.(value)
    },
    [expandedProp, onExpandedChange],
  )

  const [path, setPath] = React.useState<string[]>([])
  const [direction, setDirection] = React.useState<"forward" | "backward" | "none">("none")

  // Collapsing always returns to the top layer, so the rail never ends up describing a branch
  // nobody can see. Render-time reset rather than an effect, per the strict react-hooks lint.
  const [prevExpanded, setPrevExpanded] = React.useState(expanded)
  if (prevExpanded !== expanded) {
    setPrevExpanded(expanded)
    if (!expanded && path.length > 0) {
      setPath([])
      setDirection("none")
    }
  }

  const armRefocus = React.useCallback(() => {
    refocus.current = true
  }, [])

  const openLayer = React.useCallback((depth: number, id: string) => {
    refocus.current = true
    setDirection("forward")
    setPath((current) => [...current.slice(0, depth), id])
  }, [])

  const back = React.useCallback(() => {
    refocus.current = true
    setDirection("backward")
    setPath((current) => current.slice(0, -1))
  }, [])

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }, [])

  // ── The morph ──
  // The box is sized from its own content: the viewport stays at its natural size while the
  // root is mid-transition, so every view change writes the next width/height and CSS tweens
  // between them. offsetWidth/Height (layout box) rather than a rect, so a child's press-scale
  // (a transform, not layout) can never feed jitter back into the measurement.
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null)
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => {
      const node = viewportRef.current
      if (!node) return
      setBox({ w: node.offsetWidth, h: node.offsetHeight })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const layerKey = `${expanded ? "panel" : "rail"}:${path.join("/")}`

  // The enter animation arms itself on the first view change and stays armed. Without this the
  // layer would play its fade on page load, which is the one entrance nobody asked for. Keyed off
  // the view itself rather than the handlers, so a controlled `expanded` flip counts too.
  const [animated, setAnimated] = React.useState(false)
  const [prevKey, setPrevKey] = React.useState(layerKey)
  if (prevKey !== layerKey) {
    setPrevKey(layerKey)
    setAnimated(true)
  }

  // Keyboard users must land inside the layer they just opened; the control they pressed is
  // gone. Only when the change was theirs (the ref), so a hover-driven expand never yanks focus.
  React.useEffect(() => {
    if (!refocus.current) return
    refocus.current = false
    viewportRef.current
      ?.querySelector<HTMLElement>("[data-dock-control]")
      ?.focus({ preventScroll: true })
  }, [layerKey])

  // ── Dismissal ──
  // Escape steps back one layer before it closes the dock (you undo one decision at a time),
  // and a press outside puts it away. Both only exist while the panel is open.
  React.useEffect(() => {
    if (!expanded) return

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) setExpanded(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      if (path.length > 0) back()
      else setExpanded(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [expanded, path.length, back, setExpanded])

  React.useEffect(() => cancelClose, [cancelClose])

  const slots = dockVariants({ variant, size, density: useDensity(density), expanded })

  return (
    <DockProvider
      slots={slots}
      expanded={expanded}
      setExpanded={setExpanded}
      path={path}
      openLayer={openLayer}
      back={back}
      trigger={trigger}
      closeOnSelect={closeOnSelect}
      isStatic={isStatic}
      tooltipPlacement={tooltipPlacement}
      cancelClose={cancelClose}
      armRefocus={armRefocus}
    >
      <ToolbarPrimitive.Root
        ref={rootRef}
        data-slot="dock"
        data-expanded={expanded || undefined}
        // Withheld until the first measurement, so the box never animates in from nothing.
        data-ready={box ? "" : undefined}
        // Radix requires an accessible name, and the arrow-key axis follows the shape.
        aria-label={props["aria-label"] ?? "Dock"}
        orientation={expanded ? "vertical" : "horizontal"}
        style={box ? { width: box.w, height: box.h } : undefined}
        className={slots.root({ className })}
        onPointerLeave={
          trigger === "hover"
            ? () => {
                cancelClose()
                // A grace period, not an instant close: crossing a 2px gap on the way to a row
                // must not dismiss the thing you are reaching for.
                closeTimer.current = setTimeout(() => {
                  // …and a check that the pointer really did leave. Opening a layer replaces the
                  // whole subtree under the cursor, and a browser reports that teardown as a
                  // `pointerleave` on the root even though the pointer never moved. Without this
                  // guard, drilling into a group would dismiss the dock a moment later. `:hover`
                  // is the browser's own answer, recomputed from the real pointer position; if it
                  // says we are still under it, we wait for the next (real) leave.
                  if (rootRef.current?.matches(":hover")) return
                  setExpanded(false)
                }, duration.base)
              }
            : undefined
        }
        onPointerEnter={trigger === "hover" ? cancelClose : undefined}
        {...props}
      >
        {/* One gliding tooltip for every collapsed icon (Tippy singleton), outside the keyed
            layer so it survives a view change instead of being torn down mid-glide. */}
        <TooltipGroup>
          <div ref={viewportRef} className={slots.viewport()}>
            <div
              key={layerKey}
              data-slot="dock-layer"
              data-animate={animated ? "" : undefined}
              data-direction={direction}
              className={cn(
                slots.layer(),
                expanded ? slots.panel() : slots.rail(),
              )}
            >
              <DockLayerProvider depth={0}>{children}</DockLayerProvider>
            </div>
          </div>
        </TooltipGroup>
      </ToolbarPrimitive.Root>
    </DockProvider>
  )
}

// ─── shared row/icon rendering ────────────────────────────────────────────────

interface DockControlProps {
  icon?: React.ReactNode
  label: string
  /** Keyboard shortcut for the row (display only, e.g. `"⌘1"`). */
  shortcut?: string
  /** Trailing glyph for a row that leads somewhere (a group's caret). */
  caret?: boolean
  active?: boolean
  disabled?: boolean
  asChild?: boolean
  className?: string
  slot: string
  onSelect?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
}

/**
 * One control, in whichever shape the dock is currently in: a square icon with the label as its
 * tooltip, or a full-width labelled row. Both are the same Radix Toolbar item, so the roving
 * focus survives the morph.
 */
function DockControl({
  icon,
  label,
  shortcut,
  caret = false,
  active,
  disabled,
  asChild = false,
  className,
  slot,
  onSelect,
  children,
}: DockControlProps) {
  const { slots, expanded, isStatic, tooltipPlacement } = useDockContext("Dock")

  const content = expanded ? (
    <>
      {icon}
      <span data-slot="dock-item-label" className={slots.itemLabel()}>
        {label}
      </span>
      {shortcut && (
        <Kbd size="sm" data-slot="dock-item-shortcut" className={slots.itemShortcut()}>
          {shortcut}
        </Kbd>
      )}
      {caret && <CaretRight weight="bold" aria-hidden className={slots.itemCaret()} />}
    </>
  ) : (
    icon
  )

  // `asChild` hands the control to a consumer's element (a Next `Link`, an `<a>`) while the
  // dock keeps ownership of what goes inside it: the element is cloned with our icon/label as
  // its children, then Radix's Slot merges the button's props onto it.
  const inner =
    asChild && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<{ children?: React.ReactNode }>, {}, content)
      : content

  const button = (
    <ToolbarPrimitive.Button
      type="button"
      data-slot={slot}
      data-dock-control=""
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      aria-label={expanded ? undefined : label}
      disabled={disabled}
      asChild={asChild}
      onClick={onSelect}
      className={
        expanded
          ? slots.panelItem({ className })
          : slots.railItem({ className: cn(isStatic && "active:scale-100", className) })
      }
    >
      {inner}
    </ToolbarPrimitive.Button>
  )

  // The tooltip IS the label while the dock is a rail; in the panel the label is on screen, so
  // repeating it in a tooltip would be noise. The shortcut rides along as a real keycap here,
  // because the tooltip is its own surface and a cap is the clearest thing on it.
  if (expanded) return button
  return (
    <Tooltip
      content={
        shortcut ? (
          <span className="flex items-center gap-1.5">
            {label}
            <Kbd size="sm">{shortcut}</Kbd>
          </span>
        ) : (
          label
        )
      }
      placement={tooltipPlacement}
    >
      {button}
    </Tooltip>
  )
}

// ─── DockItem ─────────────────────────────────────────────────────────────────

export interface DockItemProps extends Omit<DockControlProps, "slot" | "caret"> {
  /** Mark the current destination. Sets `aria-current="page"` and lights the chip. */
  active?: boolean
}

/**
 * A destination or an action. Pass `asChild` with a `Link`/`<a>` to make it navigate; the dock
 * still renders the icon and the label inside it. A `shortcut` shows as a muted keycap at the
 * end of the row, and joins the label in the tooltip while the dock is a rail.
 */
export function DockItem({ onSelect, ...props }: DockItemProps) {
  const { path, closeOnSelect, setExpanded } = useDockContext("DockItem")
  const { depth } = useDockLayerContext("DockItem")

  // Only the layer on screen renders. A deeper branch is not hidden, it is not mounted.
  if (path.length !== depth) return null

  return (
    <DockControl
      {...props}
      slot="dock-item"
      onSelect={(event) => {
        onSelect?.(event)
        if (closeOnSelect) setExpanded(false)
      }}
    />
  )
}

// ─── DockGroup ────────────────────────────────────────────────────────────────

export interface DockGroupProps {
  icon?: React.ReactNode
  label: string
  /**
   * The group's identity in the open path. Defaults to `label`, which is already unique within a
   * layer because it is the text on screen. It has to be something you supply rather than a
   * generated id: changing layer replaces the panel's subtree, so an identity minted on mount
   * would not survive the change that needs to read it.
   */
  value?: string
  /** The rows of this group's layer. Nest another `DockGroup` to go deeper. */
  children?: React.ReactNode
  /** Label of the row that returns to the parent layer. @default "Back" */
  backLabel?: string
  disabled?: boolean
  className?: string
}

/**
 * A drill-down layer. Collapsed it is one more icon in the rail (pressing it expands the dock
 * straight into its layer); expanded it is a row with a caret, and opening it replaces the
 * panel's contents with a "Back" row followed by its children, in the same box, which resizes
 * to fit. Groups nest: a group inside a group is one layer deeper.
 */
export function DockGroup({
  icon,
  label,
  value,
  children,
  backLabel = "Back",
  disabled,
  className,
}: DockGroupProps) {
  const id = value ?? label
  const { slots, path, expanded, openLayer, back, setExpanded } = useDockContext("DockGroup")
  const { depth } = useDockLayerContext("DockGroup")

  const isOpen = path.length > depth && path[depth] === id

  if (isOpen) {
    // Open, but not necessarily the layer you are looking at: a group deeper in the branch is
    // still one of our children. Only the layer on screen contributes its Back row, or
    // every ancestor would stack one.
    const isCurrent = path.length === depth + 1
    return (
      <DockLayerProvider depth={depth + 1}>
        {isCurrent && (
          <ToolbarPrimitive.Button
            type="button"
            data-slot="dock-back"
            data-dock-control=""
            onClick={back}
            className={slots.panelItem()}
          >
            <ArrowLeft weight="bold" aria-hidden />
            <span className={slots.itemLabel()}>{backLabel}</span>
          </ToolbarPrimitive.Button>
        )}
        {children}
      </DockLayerProvider>
    )
  }

  if (path.length !== depth) return null

  return (
    <DockControl
      slot="dock-group"
      icon={icon}
      label={label}
      caret
      disabled={disabled}
      className={className}
      onSelect={() => {
        // From the rail, one press does both: open the box and land in this branch.
        if (!expanded) setExpanded(true)
        openLayer(depth, id)
      }}
    />
  )
}

// ─── DockExpander ─────────────────────────────────────────────────────────────

export interface DockExpanderProps {
  /** Accessible name and tooltip. @default "Menu" */
  label?: string
  className?: string
  /** Replace the default menu glyph. */
  children?: React.ReactNode
}

/**
 * The control that turns the rail into the panel. It exists only in the rail: once the labels
 * are on screen there is nothing left for it to reveal, so it takes itself out of the way
 * rather than sitting there inverted.
 */
export function DockExpander({ label = "Menu", className, children }: DockExpanderProps) {
  const {
    slots,
    expanded,
    setExpanded,
    trigger,
    isStatic,
    tooltipPlacement,
    cancelClose,
    armRefocus,
    path,
  } = useDockContext("DockExpander")
  const { depth } = useDockLayerContext("DockExpander")

  if (expanded || path.length !== depth) return null

  return (
    <Tooltip content={label} placement={tooltipPlacement}>
      <ToolbarPrimitive.Button
        type="button"
        data-slot="dock-expander"
        data-dock-control=""
        aria-label={label}
        aria-expanded={expanded}
        onClick={() => {
          // Pressing it removes it: it is the last control in the rail and the panel has no
          // expander. Hand focus to the panel's first row, or a keyboard user is left on `body`.
          armRefocus()
          setExpanded(!expanded)
        }}
        onPointerEnter={
          trigger === "hover"
            ? () => {
                cancelClose()
                setExpanded(true)
              }
            : undefined
        }
        className={slots.railItem({ className: cn(isStatic && "active:scale-100", className) })}
      >
        {children ?? <List weight="bold" aria-hidden />}
      </ToolbarPrimitive.Button>
    </Tooltip>
  )
}

// ─── DockLabel ────────────────────────────────────────────────────────────────

export type DockLabelProps = React.ComponentProps<"div">

/**
 * A caption over a run of rows, for a panel long enough to need sorting into topics. It exists
 * only in the panel: the rail has no room for a word, and every icon there already carries its
 * label as a tooltip. Like every other part it belongs to a layer, so a caption inside a group
 * appears only while that group is open.
 */
export function DockLabel({ className, ...props }: DockLabelProps) {
  const { slots, expanded, path } = useDockContext("DockLabel")
  const { depth } = useDockLayerContext("DockLabel")

  if (!expanded || path.length !== depth) return null

  return <div data-slot="dock-label" className={slots.label({ className })} {...props} />
}

// ─── DockSeparator ────────────────────────────────────────────────────────────

/**
 * A hairline between clusters. Axis-aware: a vertical tick in the rail, a horizontal rule in
 * the panel. Like every other part it belongs to a layer, so a separator inside a group only
 * appears while that group is open.
 */
export function DockSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { slots, path } = useDockContext("DockSeparator")
  const { depth } = useDockLayerContext("DockSeparator")

  if (path.length !== depth) return null

  return (
    <ToolbarPrimitive.Separator
      data-slot="dock-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}
