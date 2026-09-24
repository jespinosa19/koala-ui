"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { createContext } from "@/lib/create-context"
import { hitBox } from "@/lib/hit-area"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * TeamMember: the canonical person block of a team roster. A photograph, the name, the role, an
 * optional short bio and a row of social links. A multi-part component built like JobCard and Card:
 * one `tv` recipe with `slots`, the shared axes flowing to every part through React Context (never
 * prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * Three layouts cover the rosters a marketing site ships:
 *   - `stacked`  the photo on top and the copy under it, the portrait grid and the carousel card.
 *   - `inline`   a small photo beside the copy, the dense directory and the compact card.
 *   - `overlay`  the copy set on the photo's lower edge, over a scrim, the wall of faces.
 *
 * Every part is optional and composed, never switched by a `showX` prop: a roster without bios
 * omits `TeamMemberBio`, one without links omits `TeamMemberSocials`. The media slot is a frame for
 * a picture you pass in (`<img>`, `next/image`); a small face can be the `Avatar` component instead,
 * which the layout treats the same way.
 */
export const teamMemberVariants = tv({
  slots: {
    // `min-w-0` lets a long name wrap inside a grid track instead of widening it.
    root: "relative flex min-w-0 text-left",
    // The photo frame. The picture fills it and is cropped to cover; the edge is an overlay ring
    // painted OVER the photo (pure black or white at 10%, never a tinted neutral, which would read
    // as dirt on the picture), because an inset ring on the <img> itself is drawn under it. The
    // muted fill is only ever seen while the picture loads.
    media: [
      "relative shrink-0 overflow-hidden bg-muted",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 after:content-[''] dark:after:ring-white/10",
      "[&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:object-cover",
    ],
    content: "flex min-w-0 flex-col gap-1",
    // An h3 under the roster's section heading. Medium, not bold: in a grid of twelve names a bold
    // weight turns the roster into a wall of headings.
    name: "text-base font-medium text-pretty text-foreground",
    role: "text-sm text-pretty text-muted-foreground",
    // Copy someone reads sits on the reading ink. The step above it is wider than the name→role
    // step, so the bio reads as its own tier rather than a third line of the byline.
    bio: "mt-2 text-sm leading-relaxed text-pretty text-body",
    // `-ml-2` pulls the first glyph's box back so the glyph itself, not its 32px box, lines up
    // with the name above it.
    socials: "mt-3 -ml-2 flex flex-wrap items-center gap-1",
    social: [
      hitBox,
      "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground",
      "cursor-pointer transition-colors duration-fast ease-out hover:bg-muted hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "[&_svg]:size-[1.125rem] [&_svg]:shrink-0",
    ],
  },
  variants: {
    layout: {
      stacked: { root: "flex-col gap-4" },
      // Beside a thumbnail the copy block is short, so the links close up to it.
      inline: { root: "flex-row items-center gap-4", socials: "mt-2" },
      // The root IS the frame here: the photo fills it and the copy is laid along its foot. The
      // radius sits on the root too, so the scrim and the copy clip to the same corner.
      overlay: {
        root: "isolate flex-col overflow-hidden rounded-2xl",
        content:
          "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pt-16 pb-4",
        // Literal white over the scrim, the documented exception: a scrim over a photograph is dark
        // on every theme, so its copy must not re-theme with the page.
        name: "text-white",
        role: "text-white/75",
        bio: "text-white/80",
        social: "text-white/80 hover:bg-white/15 hover:text-white",
      },
    },
    align: {
      start: {},
      center: {
        root: "items-center text-center",
        content: "items-center",
        socials: "ml-0 justify-center",
      },
    },
    /**
     * `card` draws the member's own box: an inset ring on the page ground and nothing else. No
     * fill, since a grid of filled panels reads as chrome competing with the faces, and on the dark
     * themes `--card` is light enough to turn every member into a grey slab. No `--surface` either:
     * an unfilled box introduces no new ground.
     */
    variant: {
      plain: {},
      card: { root: "rounded-2xl p-5 ring-1 ring-inset ring-border" },
    },
    /**
     * The photo's shape, set on `TeamMemberMedia` (the root never reads it: it reacts to the frame
     * it actually holds, through the frame's `data-fill`). Portraits and squares fill their column;
     * a circle holds its own size (pass `className="size-40"`), since a round face stretched to a
     * wide column would be a very large circle.
     */
    shape: {
      portrait: { media: "aspect-[4/5] w-full rounded-2xl" },
      landscape: { media: "aspect-[4/3] w-full rounded-2xl" },
      square: { media: "aspect-square w-full rounded-2xl" },
      circle: { media: "aspect-square rounded-full" },
    },
  },
  compoundVariants: [
    // Inline, the photo is a thumbnail beside the copy: a fixed size, and a radius scaled down with
    // it so an 80px square doesn't round into a pebble.
    { layout: "inline", shape: ["portrait", "landscape", "square"], class: { media: "aspect-square size-20 w-auto rounded-xl" } },
    { layout: "inline", shape: "circle", class: { media: "size-14" } },
    // Overlay, the frame is the root's: the photo takes the whole card and loses its own radius.
    { layout: "overlay", class: { media: "rounded-none after:rounded-none" } },
    // A card holding a photo that fills its width insets it (the inset-media rule): 8px in from a
    // 24px box, so the photo's corner is 16px, concentric with the card's, and the copy keeps a
    // 12px step of its own. The root can't know the shape, so it keys off the frame it holds
    // (`data-fill`, set on every shape but the circle); a round face keeps the card's 20px padding.
    // The copy grows to the card's height and the links sit on its foot, so a row of cards ends
    // its link rows on one line even when a name wraps.
    {
      variant: "card",
      layout: "stacked",
      class: {
        root: "has-[>[data-fill]]:gap-3 has-[>[data-fill]]:p-2 [&:has(>[data-fill])>[data-slot=team-member-content]]:px-3 [&:has(>[data-fill])>[data-slot=team-member-content]]:pb-3",
        content: "flex-1",
        socials: "mt-auto pt-3",
      },
    },
    { variant: "card", layout: "stacked", shape: ["portrait", "landscape", "square"], class: { media: "rounded-lg" } },
    // The same rule side by side: a filled thumbnail sits 8px in, its corner 24 − 8 = 16px.
    { variant: "card", layout: "inline", class: { root: "has-[>[data-fill]]:p-2 has-[>[data-fill]]:pr-5" } },
    { variant: "card", layout: "inline", shape: ["portrait", "landscape", "square"], class: { media: "rounded-lg" } },
    // A card over a photograph: the copy rides a floating panel inset from the foot instead of a
    // scrim, elevated because it floats over media. 24px frame − 12px inset = a 12px panel corner.
    {
      layout: "overlay",
      variant: "card",
      class: {
        root: "p-0 ring-0",
        content:
          "inset-x-3 bottom-3 rounded-md bg-card/95 px-4 py-3 shadow-md ring-1 ring-edge backdrop-blur-sm [--surface:var(--card)]",
        name: "text-foreground",
        role: "text-muted-foreground",
        bio: "text-body",
        social: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
  ],
  // No default `shape`: the root's slots are resolved without one, so no shape compound can leak
  // onto the root or the copy. `TeamMemberMedia` always passes its own.
  defaultVariants: {
    layout: "stacked",
    align: "start",
    variant: "plain",
  },
})

type TeamMemberSlots = ReturnType<typeof teamMemberVariants>
type TeamMemberVariantProps = VariantProps<typeof teamMemberVariants>

const [TeamMemberProvider, useTeamMemberContext] = createContext<{
  slots: TeamMemberSlots
  layout: NonNullable<TeamMemberVariantProps["layout"]>
  variant: NonNullable<TeamMemberVariantProps["variant"]>
}>("TeamMember")

export interface TeamMemberProps
  extends React.ComponentProps<"div">,
    Omit<TeamMemberVariantProps, "shape"> {
  /** Render the member as the single child element, e.g. the `<li>` of a roster list. */
  asChild?: boolean
}

/**
 * Parts are exported individually (not `TeamMember.Name` dot-notation) because namespaced statics
 * don't survive the RSC server→client boundary; only named exports do.
 */
export function TeamMember({
  className,
  layout = "stacked",
  align,
  variant = "plain",
  asChild = false,
  ...props
}: TeamMemberProps) {
  const slots = teamMemberVariants({ layout, align, variant })
  const Comp = asChild ? Slot.Root : "div"
  return (
    <TeamMemberProvider slots={slots} layout={layout} variant={variant}>
      <Comp
        data-slot="team-member"
        data-layout={layout}
        className={slots.root({ className })}
        {...props}
      />
    </TeamMemberProvider>
  )
}

export interface TeamMemberMediaProps extends React.ComponentProps<"div"> {
  /** The frame's shape. @default "portrait" (4:5) */
  shape?: NonNullable<TeamMemberVariantProps["shape"]>
}

/** The photo frame. Pass the picture as its child; it is cropped to cover the frame. */
export function TeamMemberMedia({ className, shape = "portrait", ...props }: TeamMemberMediaProps) {
  const { layout, variant } = useTeamMemberContext("TeamMemberMedia")
  // The media slot resolves the compounds against the member's own layout and variant, so the
  // shape can live on the part that has it without the root having to know.
  const { media } = teamMemberVariants({ layout, variant, shape })
  return (
    <div
      data-slot="team-member-media"
      data-shape={shape}
      // Every shape but the circle fills its column (or, inline, its thumbnail box): the card reads
      // this to inset the photo rather than pad around a small round face.
      data-fill={shape === "circle" ? undefined : ""}
      className={media({ className })}
      {...props}
    />
  )
}

/** Groups the name, role, bio and links, so they can sit beside or over the photo as one block. */
export function TeamMemberContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTeamMemberContext("TeamMemberContent")
  return <div data-slot="team-member-content" className={slots.content({ className })} {...props} />
}

/** The person's name. An `<h3>` by default; `asChild` to render your own element. */
export function TeamMemberName({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const { slots } = useTeamMemberContext("TeamMemberName")
  const Comp = asChild ? Slot.Root : "h3"
  return <Comp data-slot="team-member-name" className={slots.name({ className })} {...props} />
}

/** Their role or title, on the quiet ink. */
export function TeamMemberRole({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useTeamMemberContext("TeamMemberRole")
  return <p data-slot="team-member-role" className={slots.role({ className })} {...props} />
}

/** A line or two about them. Keep a roster's bios to one measure, so a grid reads even. */
export function TeamMemberBio({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useTeamMemberContext("TeamMemberBio")
  return <p data-slot="team-member-bio" className={slots.bio({ className })} {...props} />
}

/** The row of social links under the copy. */
export function TeamMemberSocials({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useTeamMemberContext("TeamMemberSocials")
  return <div data-slot="team-member-socials" className={slots.socials({ className })} {...props} />
}

export interface TeamMemberSocialProps extends React.ComponentProps<"a"> {
  /** The accessible name, e.g. "Lucía on LinkedIn". The glyph alone says nothing to a screen reader. */
  label: string
  /** Render the child element as the link (Radix Slot), e.g. to wrap `next/link`. */
  asChild?: boolean
}

/**
 * One icon link: a 32px glyph box whose tap target is extended to 40px (44px on touch) by a
 * pseudo-element, so a row of four stays compact without any of them being hard to hit.
 */
export function TeamMemberSocial({ className, label, asChild = false, ...props }: TeamMemberSocialProps) {
  const { slots } = useTeamMemberContext("TeamMemberSocial")
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="team-member-social"
      aria-label={label}
      title={label}
      className={slots.social({ className })}
      {...props}
    />
  )
}
