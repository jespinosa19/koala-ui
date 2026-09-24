import { hitY } from "@/lib/hit-area"

/**
 * The shared interaction/state classes for an icon control that lives in a toolbar: muted
 * resting color, hover chip, pressed chip, tactile press-scale, brand focus ring, disabled
 * state, and a vertical-only hit extender. This is the single source both the standalone
 * `Toolbar` and the editor-bound `RichTextEditorToolbar` build their buttons from, so the two
 * never drift on interaction (they still choose their own radius, dimensions, and glyph size).
 *
 * It deliberately omits `rounded-*`, the glyph `size-*`, and any component-specific state
 * (`data-[state=on]`, `data-[disabled]`) so each toolbar appends exactly what it needs.
 */
export const toolbarControlBase = [
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center",
  "text-muted-foreground",
  // Hit extender (#9), vertical-only so it never steals a neighbour's click: 40px tall on
  // desktop, 44 on touch (lib/hit-area.ts).
  hitY,
  // Specific transition (never `transition: all`, #14): colors + the press scale.
  "transition-[background-color,color,scale] duration-fast ease-out",
  "hover:bg-accent hover:text-foreground",
  "active:scale-[0.96]",
  // Respect a reduced-motion request: keep every functional STATE (hover/pressed chip, open
  // highlight) but drop the tween and the tactile press-scale, so nothing animates or jumps.
  "motion-reduce:transition-none motion-reduce:active:scale-100",
  // Pressed (active mark/tool) reads as a filled, foreground-colored chip.
  "data-[pressed]:bg-accent data-[pressed]:text-foreground",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_svg]:shrink-0",
]
