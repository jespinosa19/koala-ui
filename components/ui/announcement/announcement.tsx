import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitX } from "@/lib/hit-area"

/**
 * Announcement: the pill that sits above a hero title, or anywhere a release, a status, or a
 * "we shipped this" line needs its own piece of furniture. Single-element like Badge and Button:
 * one `tv` recipe, Radix `Slot` for `asChild`, semantic tokens only, `className` merged last.
 * See docs/ARCHITECTURE.md.
 *
 * It is deliberately NOT a Badge. A Badge is one chip carrying one label; an Announcement PAIRS
 * two pieces of information, a standing label and the thing being announced ("Update available" +
 * "Koala UI v11 is here!"), and the pill is what pairs them. Compose it with our own parts: drop a
 * `Badge` in for the announced half, and the recipe nests it properly (see below). No trailing
 * caret or icon: marketing furniture in this DS is text-only unless asked.
 *
 * Not a client component: no context, no state, no browser API. It can render on the server, so a
 * marketing page that only needs the pill doesn't pull a client boundary in with it.
 */

// polish: the pill's own height is ~30-36px, under the 40px hit target, so an interactive one
// extends its click area with `hitX` (lib/hit-area.ts) instead of growing the visual: 40px tall on
// desktop, 44 on touch. The same constant Button uses.

export const announcementVariants = tv({
  base: [
    // `max-w-full` is load-bearing on a phone: a nested Badge is `whitespace-nowrap shrink-0`, so
    // without a cap the pill would size to label + chip and push past a 360px viewport. Capped, the
    // label (an anonymous flex item) shrinks and wraps instead, the chip keeps its width, and
    // `text-pretty` keeps a lone word off the last line.
    "inline-flex w-fit max-w-full items-center gap-2 rounded-full border py-1 text-sm font-medium text-pretty",
    // A bare leading glyph gets sized here; a nested Badge keeps control of its own icon, so the
    // pill doesn't reach in and fight the Badge's `[&>svg]` sizing (direct child only).
    "[&>svg]:size-4 [&>svg]:shrink-0",
    // SPACING, decided by what sits on each edge. CSS cannot answer the question this needs
    // answered. `:first-child` and `:last-child` count ELEMENTS, and a label is a text node, so to
    // a selector `<div>Update available<Badge/></div>` looks like a pill holding one lone chip:
    // the Badge matches BOTH `:first-child` and `:last-child`, takes the crescent on both sides,
    // and no sibling selector can see the words sitting next to it. So the component reads its own
    // children and states the fact as `data-lead` / `data-trail` ("text" or "shape"), and the
    // recipe keys off that. Everything below is a plain attribute match on a fact already decided.
    //
    // 12px on a free edge, text or shape alike. Text was given more for a while (16, then 20) on
    // the theory that a word needs to stand further off a round cap than an icon does; on a pill
    // this small it just read loose, so both land on the base. `data-lead`/`data-trail` still earn
    // their keep below: they gate the nested-Badge ring and the label's margin, which is where the
    // text-vs-shape question actually changes the answer.
    "px-3",
    // A Badge sitting ON an edge nests into the crescent instead: 4px, matching the `py-1` inset,
    // so the chip sits in a uniform ring of pill. Gated on that edge NOT being text, because the
    // `:first-child` it matches is only trustworthy once the text question is already answered.
    "data-[lead=shape]:has-[>[data-slot=badge]:first-child]:pl-1",
    "data-[trail=shape]:has-[>[data-slot=badge]:last-child]:pr-1",
    // And a Badge with the LABEL beside it gets 8px more than the row's `gap-2`, landing on 16px.
    // 8px is the distance between a mark and its own word (a dot and its label); the label and the
    // chip are two separate pieces of information, and at 8px they read as one run of text with a
    // box drawn round half of it. An icon or a dot neighbour keeps the base gap: a glyph already
    // reads as separate, which is why these are gated on text and not on mere adjacency.
    "data-[lead=text]:[&>[data-slot=badge]:last-child]:ml-2",
    "data-[trail=text]:[&>[data-slot=badge]:first-child]:mr-2",
    // NESTING A BADGE: drop its hairline. A `dot` Badge is a transparent chip with a
    // `border-border` stroke, and inside this already-bordered pill that paints a second hairline
    // of the same color 4px in from the first: a box in a box, which is exactly why the nested
    // shape was rejected the first time. Each variant below gives the chip a FILL instead, so the
    // pill reads as one stroke around one nested chip. A Badge that paints its own tint (a soft
    // `variant="success"` fill, say) wins the surface back with `className`.
    "[&>[data-slot=badge]]:border-transparent",
    // Concentric corners: the pill is fully round, so the chip inside it must be too. The house
    // shape for a nested badge is `pill` anyway, but a badge that arrives without it would sit in
    // here with the control radius and read as a rounded rectangle punched into a round pill.
    "[&>[data-slot=badge]]:rounded-full",
  ],
  variants: {
    variant: {
      // On a normal surface: a hairline card pill. `bg-muted` sits one step off `bg-card` in all
      // four themes, so the nested chip reads without a border of its own.
      solid: "border-border bg-card text-foreground shadow-xs [&>[data-slot=badge]]:bg-muted",
      // Over media (a hero photo or video): a glassy pill on the scrim. Literal `white/` is the
      // documented scrim exception, the same call `HeroBackground`'s gradient makes: this variant
      // only ever sits on darkened media, so it must NOT re-theme. The nested chip goes white with
      // it, including the label the Badge wraps in `text-foreground` for a normal surface
      // (`>span`), and that also whitens a `dot` Badge's dot, which is the house rule over media:
      // a brand-colored dot clashes with a photo.
      glass: [
        "border-white/20 bg-white/10 text-white backdrop-blur-sm",
        "[&>[data-slot=badge]]:bg-white/15 [&>[data-slot=badge]]:text-white [&>[data-slot=badge]>span]:text-current",
      ],
    },
    /**
     * Press, focus and hover affordances. Defaults to whatever `asChild` is, so an Announcement
     * wrapping a link gets them and a static one doesn't: a pill that scales under a cursor that
     * can't click it is a lie about what the element does.
     */
    interactive: {
      true: [
        "cursor-pointer",
        // Specific transition (never `transition: all`); bare `transition` covers colors, shadow
        // AND the standalone `scale` property Tailwind v4 compiles `scale-*` to.
        "transition duration-fast ease-out",
        // polish: tactile scale-on-press, the DS-wide value.
        "active:scale-[0.96]",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hitX,
      ],
    },
  },
  compoundVariants: [
    // Hover is an elevation step, not a fill: `bg-muted`/`bg-accent` are the same token in three of
    // the four themes, so filling the pill on hover would swallow the nested chip whole.
    { variant: "solid", interactive: true, class: "hover:shadow-sm" },
    {
      variant: "glass",
      interactive: true,
      // The offset ring is drawn in the THEME's background color, which over a photograph paints a
      // pale halo that belongs to no surface. On media the ring hugs the pill and goes white, the
      // one color guaranteed to read on a darkened scrim.
      class: "hover:bg-white/15 focus-visible:ring-white focus-visible:ring-offset-0",
    },
  ],
  defaultVariants: { variant: "solid" },
})

/**
 * What sits on an edge of the pill, which decides that edge's spacing. The distinction CSS cannot
 * make for itself: a label arrives as a TEXT NODE, and `:first-child`/`:last-child` only count
 * elements, so a selector reads `text + <Badge/>` as a pill holding one lone chip. Reading the
 * children here answers it once, and the recipe matches a plain attribute afterwards.
 */
type Edge = "text" | "shape"

const isText = (node: React.ReactNode): boolean =>
  typeof node === "string" || typeof node === "number"

/**
 * The children that actually land on the pill's edges. `React.Children.toArray` flattens nested
 * ARRAYS but stops at a `<>…</>`: it hands back the fragment itself, one opaque element. A pill
 * written the ordinary way, `<>{label}{badge}</>` (what a conditional chip forces: `{show ? <Badge/>
 * : null}` has to live beside the label inside something), would therefore report a single non-text
 * child and take the nested-chip ring on BOTH edges, padding a bare word to 4px off the stroke.
 * Unwrapping is the whole job: walk down while the content is one fragment.
 */
const edgeItems = (node: React.ReactNode): React.ReactNode[] => {
  let items = React.Children.toArray(node)
  while (
    items.length === 1 &&
    React.isValidElement(items[0]) &&
    items[0].type === React.Fragment
  ) {
    items = React.Children.toArray(
      (items[0].props as { children?: React.ReactNode }).children
    )
  }
  return items
}

export interface AnnouncementProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof announcementVariants> {
  /** Render the child as the pill (Radix `Slot`), e.g. an `<a>` to the changelog. */
  asChild?: boolean
  /**
   * Disable the tactile scale-on-press, e.g. where the motion would distract. Prefer this over
   * `interactive={false}` on a link: that would take the focus ring with it.
   */
  static?: boolean
  /**
   * Show a leading dot in the current text color, the same mark a `dot` Badge carries. Use it for
   * the one-line shape ("• Now in private beta"); when the pill pairs a label with a release,
   * nest a `<Badge dot pill>` instead and let the Badge carry the dot.
   */
  dot?: boolean
}

export function Announcement({
  className,
  variant,
  interactive,
  asChild = false,
  static: isStatic = false,
  dot = false,
  children,
  ...props
}: AnnouncementProps) {
  // `edgeItems` drops null/false and looks through fragments, so items[0] and the last item are the
  // nodes that actually land on the edges. The dot, when present, is the leading shape: the
  // component renders it itself, ahead of children.
  //
  // Under `asChild` the consumer's element IS the pill, not something sitting inside it, so the
  // edges are ITS children: `<Announcement asChild><a>Read the notes</a></Announcement>` puts a
  // word on both edges, and reading the `<a>` as a shape would pad it like a chip.
  const outer = edgeItems(children)
  const items =
    asChild && outer.length === 1 && React.isValidElement(outer[0])
      ? edgeItems((outer[0].props as { children?: React.ReactNode }).children)
      : outer
  const lead: Edge = !dot && isText(items[0]) ? "text" : "shape"
  const trail: Edge = isText(items[items.length - 1]) ? "text" : "shape"

  const marker = dot ? (
    <span
      data-slot="announcement-dot"
      aria-hidden
      className="size-1.5 shrink-0 rounded-full bg-current"
    />
  ) : null
  const classes = announcementVariants({
    variant,
    // An explicit `interactive` still wins, for the odd pill that is clickable without `asChild`
    // (an onClick on the div) or a linked one that should stay perfectly still.
    interactive: interactive ?? asChild,
    // `static` neutralizes the press scale, nothing else. twMerge keeps this last.
    className: cn(isStatic && "active:scale-100", className),
  })

  // asChild: the consumer's element (an <a> to the changelog) becomes the pill, and `Slottable`
  // is what lets the dot ride INSIDE it. It must sit as a DIRECT child of Slot.Root, never wrapped
  // in a fragment: Radix looks for it with `React.Children.toArray`, which does not see through
  // one, so a fragment would hide it, and Slot would try to clone the fragment instead.
  if (asChild) {
    return (
      <Slot.Root
        data-slot="announcement"
        data-lead={lead}
        data-trail={trail}
        className={classes}
        {...props}
      >
        {marker}
        <Slot.Slottable>{children}</Slot.Slottable>
      </Slot.Root>
    )
  }

  return (
    <div
      data-slot="announcement"
      data-lead={lead}
      data-trail={trail}
      className={classes}
      {...props}
    >
      {marker}
      {children}
    </div>
  )
}
