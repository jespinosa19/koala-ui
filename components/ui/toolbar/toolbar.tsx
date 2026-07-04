"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"
import { CaretDown } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { Tooltip, TooltipGroup, type TooltipProps } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { toolbarControlBase } from "./control-base"

/**
 * Toolbar: a horizontal (or vertical) band that groups icon controls, dropdown triggers,
 * toggle sets, and separators into one keyboard-navigable unit. Built on Radix Toolbar, so
 * it ships `role="toolbar"`, roving tab focus (one Tab stop, arrow keys move between controls),
 * and RTL support for free. See docs/ARCHITECTURE.md.
 *
 * Multi-part: the resolved slots flow to every part through a typed React Context (never
 * prop-drilled). Compose it yourself:
 *   <Toolbar aria-label="Formatting">
 *     <ToolbarButton tooltip="Bold" shortcut="⌘B"><TextB /></ToolbarButton>
 *     <ToolbarSeparator />
 *     <ToolbarToggleGroup type="single"> … </ToolbarToggleGroup>
 *   </Toolbar>
 *
 * It's the reusable shell behind a rich-text-editor format bar, a media player's controls, a
 * canvas tool rail. All controls share ONE gliding tooltip (Tooltip singleton), so the hint
 * slides between them instead of each fading in and out.
 */

// Every icon control (button + toggle item) shares one interaction base with the editor's
// toolbar (see control-base.ts), then adds its own corners + state. 8px corners (rounded-sm)
// are concentric inside the 12px band with 4px padding. Dimensions + glyph size come from the
// `size` slot; the caret button widens itself in place.
const controlBase = [
  ...toolbarControlBase,
  "rounded-sm",
  // Radix ToggleItem's selected state lights the same filled chip as the manual `pressed` prop.
  "data-[state=on]:bg-accent data-[state=on]:text-foreground",
  // Used as a menu/popover trigger (asChild of DropdownMenuTrigger, etc.), the button carries
  // Radix's `data-state=open` while its surface is open. Light the same chip so the open group
  // reads as active. Inert on plain buttons: they never carry `data-state`.
  "data-[state=open]:bg-accent data-[state=open]:text-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  "[&_svg]:pointer-events-none",
]

export const toolbarVariants = tv({
  slots: {
    // The band itself. `isolate` gives items a stacking context for the focus ring; the chrome
    // (border/shadow/radius) comes from `variant`. Icons sit flush within a group (no gap); the
    // 4px breathing room lives on the separators, so groups read as blocks split by dividers.
    root: "relative isolate inline-flex items-center",
    button: [...controlBase],
    toggleGroup: "flex items-center data-[orientation=vertical]:flex-col",
    separator: "shrink-0 rounded-full bg-border",
    // A text link that lives in the bar (e.g. "Help", "Restore") and still takes part in the
    // roving focus. Uses the shared --link blue, underlined on hover like every doc link.
    link: [
      "inline-flex shrink-0 cursor-pointer select-none items-center rounded-sm px-1 text-sm font-medium text-link underline-offset-4",
      "transition-colors duration-fast ease-out hover:underline",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    ],
  },
  variants: {
    // NOTE: in a slotted `tv` recipe, variant values MUST be `{ slot: "…" }` objects. A bare
    // string silently no-ops (passes typecheck + lint) — which is exactly how the wrapper chrome
    // went missing. See memory `tv-slots-variant-object-not-string`.
    variant: {
      // Floating (default, the image): an elevated pill that hovers over content. Declares
      // `--surface` so any nested Input/Select blends onto the popover surface (the --surface contract).
      // The hairline is an INSET RING, not a `border`: a border sits in the box model and pushes the
      // padding box in by 1px, so the corner control ends up 5px from the edge and the 8px chip no
      // longer nests concentrically inside the 12px band (12 ≠ 8 + 5). A ring is a box-shadow: it
      // paints the same 1px edge without stealing layout, so the control stays 4px in and the corners
      // stay concentric (12 = 8 + 4). Rings over borders (make-interfaces #3), for the geometry too.
      floating: {
        root: "rounded-md p-1 bg-popover text-popover-foreground shadow-lg ring-1 ring-inset ring-border [--surface:var(--popover)]",
      },
      // Outline: the same shape, flat on the page as a card-surface strip. Same inset-ring hairline
      // as floating, so its controls nest concentrically too.
      outline: {
        root: "rounded-md p-1 bg-card text-card-foreground shadow-xs ring-1 ring-inset ring-border [--surface:var(--card)]",
      },
      // Plain: chromeless. Drop it into a header/footer that already owns the surface.
      plain: { root: "" },
      // Solid: an inverted, high-contrast bar for a contextual strip over media/imagery (a
      // player overlay, a canvas HUD). Token-pure: it flips foreground↔background so it reads
      // dark on light themes and light on dark, and re-tints the controls/divider to match.
      solid: {
        root: "rounded-md bg-foreground p-1 text-background shadow-lg [--surface:var(--foreground)]",
        button:
          "text-background/70 hover:bg-background/15 hover:text-background data-[pressed]:bg-background/20 data-[pressed]:text-background data-[state=on]:bg-background/20 data-[state=on]:text-background data-[state=open]:bg-background/20 data-[state=open]:text-background",
        separator: "bg-background/25",
      },
    },
    // The `size` axis IS the toolbar's density knob, and it's deliberately its OWN scale rather
    // than inheriting the page's `comfortable/compact` form density (via useDensity). A control
    // bar that shrinks to form-compact becomes hard to hit, so it stays grabbable regardless of
    // the surrounding density. `md` is unchanged; `lg` is the roomier / touch-friendly tier.
    size: {
      // sm: 24px controls with a 16px glyph, for dense rails.
      sm: { button: "h-6 w-6 [&_svg:not([class*='size-'])]:size-4" },
      // md (default): 28px controls with a 20px glyph — the Figma spec (36px band with 4px pad).
      md: { button: "h-7 w-7 [&_svg:not([class*='size-'])]:size-5" },
      // lg: 36px controls with a 24px glyph — a comfortable, touch-friendly target (≥40px hit
      // area is already guaranteed by the shared extender) for mobile and marketing surfaces.
      lg: { button: "h-9 w-9 [&_svg:not([class*='size-'])]:size-6" },
    },
    orientation: {
      // 16px divider, held 4px off its neighbours (root has no gap; the margin is the group gap).
      horizontal: { root: "flex-row", separator: "mx-1 h-4 w-px" },
      vertical: { root: "flex-col", separator: "my-1 h-px w-4" },
    },
  },
  defaultVariants: {
    variant: "floating",
    size: "md",
    orientation: "horizontal",
  },
})

type ToolbarSlots = ReturnType<typeof toolbarVariants>
const [ToolbarProvider, useToolbarContext] = createContext<{ slots: ToolbarSlots }>("Toolbar")

// ─── Toolbar (root) ───────────────────────────────────────────────────────────

export interface ToolbarProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Root>,
    VariantProps<typeof toolbarVariants> {
  /**
   * Let the bar scroll horizontally instead of wrapping when its controls exceed the width:
   * the low-chrome alternative to an overflow menu. Adds a scroll-aware edge fade (the
   * `scroll-fade-x` utility) and hides the scrollbar, so the hint that "there's more" appears
   * only on the side you can still scroll toward. For a fold-into-"More" bar, reach for
   * {@link ToolbarOverflow} instead.
   */
  scrollable?: boolean
}

export function Toolbar({
  className,
  variant,
  size,
  orientation = "horizontal",
  scrollable = false,
  children,
  ...props
}: ToolbarProps) {
  const slots = toolbarVariants({ variant, size, orientation })
  return (
    <ToolbarProvider slots={slots}>
      <ToolbarPrimitive.Root
        data-slot="toolbar"
        // Radix requires an accessible name on a toolbar; keep a sensible default.
        aria-label={props["aria-label"] ?? "Toolbar"}
        orientation={orientation ?? undefined}
        className={slots.root({
          className: cn(
            // Scrollable: never wrap, scroll on the main axis, fade the overflowing edge, and
            // hide the scrollbar (the fade is the affordance). Cross-axis stays hidden.
            scrollable &&
              (orientation === "vertical"
                ? "flex-nowrap overflow-y-auto overflow-x-hidden scroll-fade-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "flex-nowrap overflow-x-auto overflow-y-hidden scroll-fade-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"),
            className,
          ),
        })}
        {...props}
      >
        {/* One shared, gliding tooltip across every control (Tippy singleton). */}
        <TooltipGroup>{children}</TooltipGroup>
      </ToolbarPrimitive.Root>
    </ToolbarProvider>
  )
}

// ─── ToolbarButton ──────────────────────────────────────────────────────────────

export interface ToolbarButtonProps
  extends Omit<React.ComponentProps<typeof ToolbarPrimitive.Button>, "aria-pressed"> {
  /** Visually mark the control active (e.g. the current tool). Sets `aria-pressed`. */
  pressed?: boolean
  /** Hover/focus hint. A plain string also becomes the button's `aria-label` when none is set. */
  tooltip?: React.ReactNode
  /** Keyboard shortcut shown as a `Kbd` chip in the tooltip (display only, e.g. `"⌘B"`). */
  shortcut?: string
  /** Append a trailing caret and let the control grow to fit its label: the dropdown-trigger look. */
  caret?: boolean
  /** Tooltip placement. @default "top" */
  tooltipPlacement?: TooltipProps["placement"]
  /** Disable the tactile scale-on-press. */
  static?: boolean
}

/**
 * A single icon control. Pass `tooltip` for a labelled hint, `pressed` to mark it active, or
 * `caret` to make it a dropdown trigger (compose it with our DropdownMenu/Popover via `asChild`).
 */
export function ToolbarButton({
  className,
  pressed,
  tooltip,
  shortcut,
  caret = false,
  tooltipPlacement,
  static: isStatic = false,
  asChild = false,
  children,
  "aria-label": ariaLabel,
  ...props
}: ToolbarButtonProps) {
  const { slots } = useToolbarContext("ToolbarButton")
  // Derive an accessible name from a string tooltip so icon-only controls stay labelled.
  const label = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined)

  const button = (
    <ToolbarPrimitive.Button
      type="button"
      data-slot="toolbar-button"
      data-pressed={pressed || undefined}
      aria-pressed={pressed}
      aria-label={label}
      asChild={asChild}
      className={slots.button({
        // The caret button drops the square width, growing to fit its glyph + caret: 4px padding
        // + 20px glyph + 2px gap + 12px caret = 42px, the Figma spec. When the button drives an
        // open menu (`data-state=open`), flip the trailing caret so the chevron points at its
        // now-open surface. `transition-transform` covers the standalone `rotate` prop in v4.
        className: cn(
          caret && "w-auto gap-0.5 px-1",
          caret &&
            "[&>svg:last-child]:transition-transform [&>svg:last-child]:duration-fast [&>svg:last-child]:ease-out data-[state=open]:[&>svg:last-child]:rotate-180 motion-reduce:[&>svg:last-child]:transition-none",
          isStatic && "active:scale-100",
          className,
        ),
      })}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {caret && <CaretDown weight="bold" aria-hidden className="size-3" />}
        </>
      )}
    </ToolbarPrimitive.Button>
  )

  if (!tooltip) return button

  // Content = label plus an optional keycap; the aria-label above stays a plain string.
  const content = shortcut ? (
    <span className="flex items-center gap-1.5">
      {tooltip}
      <Kbd size="sm" variant="outline">
        {shortcut}
      </Kbd>
    </span>
  ) : (
    tooltip
  )
  return (
    <Tooltip content={content} placement={tooltipPlacement ?? "top"}>
      {button}
    </Tooltip>
  )
}

// ─── ToolbarSeparator ────────────────────────────────────────────────────────────

/** A hairline that groups related controls. Orientation-aware (vertical bar in a horizontal bar). */
export function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { slots } = useToolbarContext("ToolbarSeparator")
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

// ─── ToolbarToggleGroup + ToolbarToggleItem ───────────────────────────────────────

/**
 * A set of controls that hold their pressed state. `type="single"` for a mutually exclusive
 * choice (text alignment), `type="multiple"` for independent on/off marks (bold/italic). Built
 * on Radix Toolbar's ToggleGroup, so it keeps the roving focus of the parent toolbar.
 */
export function ToolbarToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  const { slots } = useToolbarContext("ToolbarToggleGroup")
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={slots.toggleGroup({ className })}
      {...props}
    />
  )
}

export interface ToolbarToggleItemProps
  extends React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> {
  /** Hover/focus hint. A plain string also becomes the item's `aria-label` when none is set. */
  tooltip?: React.ReactNode
  /** Keyboard shortcut shown as a `Kbd` chip in the tooltip (display only). */
  shortcut?: string
  /** Tooltip placement. @default "top" */
  tooltipPlacement?: TooltipProps["placement"]
  /** Disable the tactile scale-on-press. */
  static?: boolean
}

/** One member of a {@link ToolbarToggleGroup}. Selected reads as a filled chip (`data-state=on`). */
export function ToolbarToggleItem({
  className,
  tooltip,
  shortcut,
  tooltipPlacement,
  static: isStatic = false,
  children,
  "aria-label": ariaLabel,
  ...props
}: ToolbarToggleItemProps) {
  const { slots } = useToolbarContext("ToolbarToggleItem")
  const label = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined)

  const item = (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      aria-label={label}
      className={slots.button({ className: cn(isStatic && "active:scale-100", className) })}
      {...props}
    >
      {children}
    </ToolbarPrimitive.ToggleItem>
  )

  if (!tooltip) return item

  const content = shortcut ? (
    <span className="flex items-center gap-1.5">
      {tooltip}
      <Kbd size="sm" variant="outline">
        {shortcut}
      </Kbd>
    </span>
  ) : (
    tooltip
  )
  return (
    <Tooltip content={content} placement={tooltipPlacement ?? "top"}>
      {item}
    </Tooltip>
  )
}

// ─── ToolbarLink ──────────────────────────────────────────────────────────────

/** A text link that lives in the bar and keeps the roving focus (Radix Toolbar.Link). */
export function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  const { slots } = useToolbarContext("ToolbarLink")
  return (
    <ToolbarPrimitive.Link data-slot="toolbar-link" className={slots.link({ className })} {...props} />
  )
}

// ─── ToolbarGroup ───────────────────────────────────────────────────────────────

/**
 * A semantic cluster of related controls. Radix Toolbar's separators are purely visual; wrap a
 * run of controls in a `ToolbarGroup` with an `aria-label` and assistive tech announces it as a
 * named region ("Formatting group"). Controls inside keep the toolbar's roving focus — the
 * roving group collects the buttons regardless of this wrapper.
 */
export function ToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-group"
      role="group"
      className={cn("flex items-center data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  )
}

// ─── ToolbarSpacer ──────────────────────────────────────────────────────────────

/**
 * A flexible gap that pushes everything after it to the far end of the bar (a title on the left,
 * actions pinned right). Grows along whichever axis the toolbar runs. Decorative, so it's hidden
 * from assistive tech.
 */
export function ToolbarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-spacer"
      aria-hidden
      className={cn("flex-1 self-stretch", className)}
      {...props}
    />
  )
}

// ─── ToolbarTitle ───────────────────────────────────────────────────────────────

/** A non-interactive text label in the bar (a document name, a section title). */
export function ToolbarTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-title"
      className={cn("select-none truncate px-1.5 text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

