"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitY } from "@/lib/hit-area"

/**
 * ToggleGroup: a set of pressable pills where a selection is held, built on Radix ToggleGroup.
 * Multi-part (the group root and its items), so the recipe lives in two slots and the shared
 * `size` flows from `ToggleGroup` to each `ToggleGroupItem` through a typed Context, never
 * prop-drilled.
 *
 * Reach for it when one (or several) options from a small, visible set should look *chosen*: a
 * rating, a view switch, a text-style band. Pass `type="single"` for a mutually exclusive choice
 * (selecting one clears the rest) or `type="multiple"` for independent on/off toggles. It differs
 * from RadioGroup (the dot affordance, always a single choice) and Switch (a lone on/off setting):
 * here the control *is* the label, and a selected pill carries the brand outline.
 *
 * Selected (`data-[state=on]`) draws a brand outline + a soft brand halo, with the label and glyph
 * in the foreground (only the border is brand, matching Figma) and no fill, so it reads as chosen
 * under all four themes without a background that would fight nested surfaces.
 *
 * `variant="segmented"` swaps that for the shared-track look: the pills sit in one muted rail and
 * the chosen one floats off it (`shadow-sm ring-1 ring-border`), matching the Tabs `pill`
 * indicator. Reach for it when the set reads as a single control (a format or view switch);
 * keep the default `outline` when the pills are independent choices on the page ground.
 *
 * `variant="ghost"` drops the pill altogether: bare labels, the chosen one underlined. For a dense
 * grid of short options (a product's sizes) where a frame per option would crowd the set.
 *
 * That lift is a **single sliding thumb** measured in JS and moved with `transform` (the same
 * indicator Tabs slides, see `useSelectedThumb`), so choosing another option travels instead of
 * blinking. It snaps into place on load and only slides on later changes. Because a ToggleGroup
 * can hold zero or several selections (`type="multiple"`, and Radix lets `type="single"` deselect),
 * the thumb only draws when *exactly one* item is on; otherwise each chosen pill paints the same
 * lift itself, so a multi-select band still reads right.
 *
 * `"use client"` because Radix ToggleGroup is interactive (roving focus + pressed state). Each item
 * is its own labelled button, so unlike RadioGroup it needs no paired `<label>`.
 */

// polish: the sm pill is 32px tall, under the 40px hit target (#9). `hitY` (lib/hit-area.ts)
// extends the click area vertically only, 40px on desktop and 44 on touch, so it never overlaps
// the neighbouring pill in a horizontal row (a one-digit rating pill can be narrower than 44px).
const hitX = hitY

export const toggleGroupVariants = tv({
  slots: {
    // Named group so the item can key its fallback paint off the root's `data-thumb`, and the
    // thumb can key its press squash off whichever item is being held down.
    root: "group/toggle-group inline-flex items-center gap-2",
    // Positioned and sized by JS (see useSelectedThumb); geometry only, the paint is on `thumbSurface`.
    thumb: "pointer-events-none absolute left-0 top-0 z-0",
    // The lift itself: the crisp surface that floats off the muted track. Same "shadow as border"
    // stack the Tabs `pill` indicator carries, so both controls read alike. Dark lifts with a tint
    // too: it layers over the track's own, so the plate always lands one step above the trough on
    // any surface (a solid `bg-muted` plate matched a tinted trough on a popover, and blended in).
    thumbSurface: [
      // `block` is load-bearing: this is a <span>, which is inline, and an inline box ignores
      // width/height, so `size-full` did nothing and the plate collapsed to a dot at the thumb origin
      // (only its ring and shadow drew). The outer thumb is `absolute`, which blockifies it; this
      // inner span is not. Tabs never hit it because its indicator is one span, paint included.
      "block size-full rounded-[inherit] bg-background shadow-sm ring-1 ring-border dark:bg-foreground/10",
      // polish: the plate presses with its pill. Travel lives on the outer span at `duration-base`;
      // the squash gets its own, faster beat here, matched to the item's `duration-fast`. Keyed on
      // the *selected* item being held, so pressing a neighbour leaves the plate still until it travels.
      // `scale-*` compiles to the standalone `scale` property, so the transition must name it.
      "transition-[scale] duration-fast ease-out motion-reduce:transition-none",
      "group-has-[[data-state=on]:active]/toggle-group:scale-[0.96]",
    ],
    item: [
      // Background reads `--surface` so the pill blends with whatever surface it sits on (card,
      // popover, page) instead of painting a darker `--background` block (the --surface contract).
      "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-input bg-[var(--surface,var(--background))] font-medium text-muted-foreground",
      // Specific transition (never `transition: all`, #14); tactile press scale (#12).
      "transition duration-fast ease-out active:scale-[0.96]",
      // Hover only lifts an *unselected* pill; a chosen one shouldn't shift under the cursor.
      "data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground",
      // Selected: brand outline + soft brand halo, no fill. The label and glyph turn foreground
      // (not brand) so the icon reads as one with the text, matching Figma; only the border is brand.
      "data-[state=on]:border-brand data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-brand/10",
      // Focus ring is listed after the selected halo, so a focused pill shows the stronger brand ring.
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      // Icons default to a 1rem box unless the consumer sets their own `size-*`.
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
  },
  variants: {
    variant: {
      // Free-standing pills on the page ground: each carries its own outline, and the chosen one
      // takes the brand border + halo described above.
      outline: {},
      // Segmented: the pills share one muted track and the chosen one floats off it as a crisp
      // surface (`shadow-sm ring-1 ring-border`, the "shadow as border" stack) rather than taking
      // a brand outline. Same elevation the Tabs `pill` indicator uses, so every segmented control
      // in the DS reads alike. Use it for a format/view switch, where the set is one control;
      // keep `outline` when the pills are independent choices sitting on the page.
      segmented: {
        // `relative` makes the track the positioned ancestor the sliding thumb measures against.
        // Dark paints a foreground *tint*, not a solid token: a `bg-card` trough vanishes on every
        // elevated surface (dark `--card` and `--popover` are the same .205, so the Color Picker's
        // format switch had no trough at all). A tint is relative to whatever sits behind it, so
        // the trough reads on the page ground, a card and a popover alike. Mirrors Tabs `pill`.
        root: "relative gap-0.5 bg-muted dark:bg-foreground/6",
        item: [
          // The track paints the surface, so the pill itself is bare until it's chosen.
          // `z-10` keeps the label above the thumb that slides behind it.
          "z-10 border-transparent bg-transparent",
          "data-[state=off]:hover:bg-transparent data-[state=off]:hover:text-foreground",
          // No brand outline here: the lift *is* the selected affordance. `ring-0`/`ring-border`
          // stay on the bare `data-[state=on]:` prefix so tailwind-merge dedupes the base slot's
          // brand halo (`ring-2 ring-brand/10`) away: the gated width below is a different variant,
          // so it would stack with the halo instead of replacing it.
          "data-[state=on]:border-transparent data-[state=on]:font-medium data-[state=on]:text-foreground",
          "data-[state=on]:ring-0 data-[state=on]:ring-border",
          // Fallback paint, for when the thumb stands down (no selection, or several at once in
          // `type="multiple"`) and before hydration has measured. Gated on `data-thumb=off` rather
          // than *overridden* when the thumb is on: an `…:bg-transparent` counter-class would be a
          // specificity coin-toss against `dark:…:bg-foreground/10`, since Tailwind v4 orders by
          // variant weight, not source order. Gating the paint instead means the two can never both
          // show. Same dark tint as `thumbSurface`, so the fallback and the thumb look identical.
          "group-data-[thumb=off]/toggle-group:data-[state=on]:bg-background",
          "dark:group-data-[thumb=off]/toggle-group:data-[state=on]:bg-foreground/10",
          "group-data-[thumb=off]/toggle-group:data-[state=on]:shadow-sm",
          "group-data-[thumb=off]/toggle-group:data-[state=on]:ring-1",
        ],
      },
      // Ghost: bare labels, no frame and no fill, for a dense set where a pill per option would be
      // a wall of boxes (the size grid on a product page). The label sits in the foreground; the
      // chosen one is marked by an underline instead of a frame. The underline is always there in
      // `transparent` and only its colour changes, so it draws in on the base transition and can be
      // interrupted mid-way. Weight stays medium in both states: a bolder chosen label would widen
      // and nudge its neighbours in a tight row.
      ghost: {
        item: [
          "border-transparent bg-transparent text-foreground",
          "underline decoration-transparent decoration-[1.5px] underline-offset-[6px]",
          "data-[state=on]:border-transparent data-[state=on]:font-medium data-[state=on]:ring-0 data-[state=on]:decoration-foreground",
        ],
      },
    },
    size: {
      // sm matches the compact Figma rating pill (32px) and adds the vertical hit extender.
      sm: { item: `h-8 px-2.5 text-sm ${hitX}` },
      // md (40px) is the default; it meets the hit target on its own, no extender needed.
      md: { item: "h-10 px-3.5 text-sm" },
    },
  },
  compoundVariants: [
    // polish: concentric radius on the track. inner = outer − padding, the same ladder Tabs uses.
    // The thumb takes the item's radius so the plate never sits a hair rounder than the pill it fills.
    { variant: "segmented", size: "sm", className: { root: "rounded-md p-0.5", item: "rounded-sm", thumb: "rounded-sm" } },
    { variant: "segmented", size: "md", className: { root: "rounded-lg p-1", item: "rounded-md", thumb: "rounded-md" } },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
})

type ToggleGroupSlots = ReturnType<typeof toggleGroupVariants>
const [ToggleGroupProvider, useToggleGroupContext] =
  createContext<{ slots: ToggleGroupSlots }>("ToggleGroup")

/**
 * Tracks the selected pill's box and returns the thumb's transform/size. Re-measures on selection
 * change (data-state mutation), on resize, and on font/layout shifts, never polls.
 *
 * `ready` gates visibility so the thumb never paints at the origin, and doubles as the switch
 * between the two selected looks: it only goes true when *exactly one* pill is on, so zero
 * selections (Radix deselects a `type="single"` group when you click the chosen pill) and
 * `type="multiple"` bands fall back to the per-item paint. `animate` turns the transition on one
 * frame *after* the first placement, so the thumb snaps into position on load and only slides on
 * later selection changes (polish).
 *
 * Boxes are read from `offset*`, not `getBoundingClientRect()`: offset boxes ignore transforms, so
 * measuring inside a scaling Popover (the Color Picker format switch) still lands square.
 */
function useSelectedThumb(rootRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [style, setStyle] = React.useState<React.CSSProperties>()
  const [ready, setReady] = React.useState(false)
  const [animate, setAnimate] = React.useState(false)

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return

    const measure = () => {
      const on = root.querySelectorAll<HTMLElement>('[data-state="on"]')
      // No selection, or several: nothing for one thumb to represent. Stand down and let the
      // items paint themselves.
      if (on.length !== 1) {
        setReady(false)
        return
      }
      const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = on[0]
      setStyle({ transform: `translate(${left}px, ${top}px)`, width, height })
      setReady(true)
    }

    measure()

    // Enable the slide only after the first placement has painted, so loading the
    // component never animates the thumb in from the origin.
    const raf = requestAnimationFrame(() => setAnimate(true))

    // Width/position can change without a selection change (resize, late-loading fonts, and the
    // `flex-1` pills the Color Picker stretches).
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    for (const child of root.children) ro.observe(child)

    // Radix flips `data-state` on the items when the value changes; watch that.
    const mo = new MutationObserver(measure)
    mo.observe(root, { attributes: true, attributeFilter: ["data-state"], subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [rootRef, enabled])

  return { style, ready, animate }
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>

export function ToggleGroup({ className, size, variant, children, ref, ...props }: ToggleGroupProps) {
  const slots = toggleGroupVariants({ size, variant })
  const segmented = variant === "segmented"
  const rootRef = React.useRef<HTMLDivElement>(null)
  const { style, ready, animate } = useSelectedThumb(rootRef, segmented)

  return (
    <ToggleGroupProvider slots={slots}>
      <ToggleGroupPrimitive.Root
        // Composed, not overwritten: the thumb needs the node, and a caller's own ref must still
        // resolve. (Spreading `{...props}` over a bare `ref=` would silently break one of the two.)
        ref={(node) => {
          rootRef.current = node
          if (typeof ref === "function") return ref(node)
          if (ref) ref.current = node
        }}
        data-slot="toggle-group"
        // Drives the item's fallback paint. `off` until the thumb has measured, so the server
        // markup and any group the thumb can't represent still show the selection.
        data-thumb={segmented ? (ready ? "on" : "off") : undefined}
        className={slots.root({ className })}
        {...props}
      >
        {segmented && (
          <span
            aria-hidden
            data-slot="toggle-group-indicator"
            // Interruptible transition (CSS, named properties, never `transition: all`); hidden
            // until the first measure, and the transition only switches on after that placement
            // has painted, so it never slides in from the origin on load. `opacity` rides along so
            // deselecting fades the plate out instead of cutting it.
            className={cn(
              slots.thumb(),
              ready ? "opacity-100" : "opacity-0",
              animate &&
                "transition-[transform,width,height,opacity] duration-base ease-out motion-reduce:transition-none",
            )}
            style={style}
          >
            <span className={slots.thumbSurface()} />
          </span>
        )}
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupProvider>
  )
}

// ─── ToggleGroupItem ────────────────────────────────────────────────────────────

export type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item>

export function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  const { slots } = useToggleGroupContext("ToggleGroupItem")
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={slots.item({ className })}
      {...props}
    />
  )
}
