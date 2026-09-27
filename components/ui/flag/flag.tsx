import * as React from "react"
import * as Flags from "country-flag-icons/react/3x2"

import { tv, type VariantProps } from "@/lib/tv"

// country-flag-icons exports one component per code, subdivisions with an underscore (`GB_SCT`).
// It spreads extra props onto the <svg> but types them as HTMLAttributes, so name
// `preserveAspectRatio` here. Same index CountrySelect, PhoneInput and JobCard build.
const ART = Flags as unknown as Record<
  string,
  React.ComponentType<{ className?: string; preserveAspectRatio?: string }>
>

/**
 * Flag: a country flag as inline SVG, cropped to one of three shapes. A single-element component
 * (like Kbd): one `tv` recipe, `className` merged last. The artwork is `country-flag-icons` (MIT),
 * drawn at 3:2; every shape crops that one set, so a flag reads the same in a table cell, a phone
 * input and a job card.
 *
 * The crop is SVG's own `object-cover`: the art fills the box and `preserveAspectRatio="xMidYMid
 * slice"` scales it to cover, so `square` and `circle` take the centre of the flag and the colour
 * always reaches the edge, whatever flex does to the box. The edge is a 1px ring in pure
 * black/white at 10% on ::after, painted OVER the art: mostly-white flags (Japan, Cyprus) keep a
 * contour on a white surface, and an inset ring on the box itself would paint under the art and
 * never show (memory `inset-ring-under-children`).
 *
 * Size is the HEIGHT; the width follows from the shape's aspect ratio, so a `md` rectangle and a
 * `md` circle sit on the same line box. The corner radius steps with the size and rides the
 * radius knob, so a flag goes sharp with the rest of the system at `None`.
 *
 * Changing `shape` morphs instead of snapping: the aspect ratio and the radius both transition,
 * and the slice crop re-centres the art every frame. The circle is `rounded-[50%]`, not
 * `rounded-full`: Tailwind v4's full is `calc(infinity * 1px)`, and a radius interpolated towards
 * infinity is already a circle on the first frame. On a square box 50% is the same circle.
 */
export const flagVariants = tv({
  base: [
    // `bg-muted` is the ground an unknown code shows (a neutral tile holds the footprint instead of
    // collapsing the row); a real flag covers it edge to edge.
    "relative inline-flex shrink-0 overflow-hidden bg-muted align-middle",
    "transition-[aspect-ratio,border-radius] duration-base ease-out motion-reduce:transition-none",
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/10 dark:after:ring-white/10",
  ],
  variants: {
    shape: {
      rectangle: "aspect-[3/2]",
      square: "aspect-square",
      circle: "aspect-square rounded-[50%]",
    },
    size: {
      xs: "h-3",
      sm: "h-4",
      md: "h-5",
      lg: "h-6",
      xl: "h-8",
      "2xl": "h-10",
    },
  },
  compoundVariants: [
    // Corners scale with the flag: 2px up to 20px tall, 3px at 24 and 32, 4px at 40 (at the
    // default 16px knob). A fixed `rounded-xs` (5px) would turn a 16px flag into a pill.
    {
      shape: ["rectangle", "square"],
      size: ["xs", "sm", "md"],
      class: "rounded-[calc(var(--radius)*0.125)]",
    },
    {
      shape: ["rectangle", "square"],
      size: ["lg", "xl"],
      class: "rounded-[calc(var(--radius)*0.1875)]",
    },
    {
      shape: ["rectangle", "square"],
      size: "2xl",
      class: "rounded-[calc(var(--radius)*0.25)]",
    },
  ],
  defaultVariants: {
    shape: "rectangle",
    size: "md",
  },
})

export interface FlagProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof flagVariants> {
  /**
   * ISO 3166-1 alpha-2 code (`ES`, `US`), or an ISO 3166-2 subdivision code for the regions that
   * fly their own flag (`GB-SCT`, `ES-CT`). Case-insensitive. An unknown code renders a neutral
   * tile of the same size.
   */
  code: string
  /**
   * An accessible name. A flag is decorative by default, because the country is almost always
   * written next to it, so it is `aria-hidden`. Pass `label` when the flag stands alone (a
   * language switcher showing only flags): it then announces as an image with this name.
   */
  label?: string
}

/**
 * Flag: `<Flag code="ES" />`, or `<Flag code="JP" shape="circle" size="sm" />` beside a label.
 *
 * Resolving any code means the whole set ships wherever `Flag` renders on the client, as it
 * already does for CountrySelect and PhoneInput. It holds no state, so in a Server Component the
 * art renders on the server and none of it reaches the browser.
 */
export function Flag({ code, shape, size, label, className, ...props }: FlagProps) {
  const Art = ART[code.toUpperCase().replace("-", "_")]
  const labelled = label != null
  return (
    <span
      data-slot="flag"
      data-shape={shape ?? "rectangle"}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      className={flagVariants({ shape, size, className })}
      {...props}
    >
      {/* size-full keeps a size- token, so a parent's `[&_svg:not([class*='size-'])]` rule (Select
          items, Button) never resizes the art out of its crop. */}
      {Art && <Art className="size-full" preserveAspectRatio="xMidYMid slice" />}
    </span>
  )
}
