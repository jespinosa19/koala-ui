import * as React from "react"

import { tv } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Section: the canonical marketing/page **section shell**, the "content" half that completes
 * the universal `header + content` shape `SectionHeader` opens (see
 * components/ui/section-header). Two layout parts, one `tv` recipe with `slots`:
 *
 *   - `Section`: a full-bleed vertical **band**. Owns the rhythm down the page (`py-20 sm:py-28`)
 *     and spans edge to edge so a tint or image (`className="bg-muted/40"`) reads full-width.
 *   - `SectionContainer`: the centered **gutter** that caps the content width and provides the
 *     horizontal padding (20px on mobile, 32px from `sm` up). It is a `flex` column with the
 *     signature **56px gap** (`gap-14`)
 *     between its children, so a `SectionHeader` followed by the content lands at one canonical
 *     vertical gap with no per-section margins to tune.
 *
 *   <Section>
 *     <SectionContainer>
 *       <SectionHeader align="center">…lede…</SectionHeader>
 *       <div className="grid …">…content…</div>    (56px below the header, for free)
 *     </SectionContainer>
 *   </Section>
 *
 * Pure layout, no Radix and no client state, so it stays a server component and drops into RSC
 * marketing pages directly. It composes with `SectionHeader` (the lede) the way `CardBody`
 * composes with `CardHeader`: the gap lives on the container, not on either child.
 *
 * Why the container is NOT `items-center`: a centered flex column shrinks block children (a
 * `grid`, a full-width card row) to their content width. So children **stretch** (the flex
 * default) and horizontal centering is owned per-child — `SectionHeader align="center"` centers
 * its own lede in a capped column. That keeps content grids full-width while the header still
 * reads centered.
 */
export const sectionVariants = tv({
  slots: {
    // The full-bleed band: spans edge to edge so a background tint bleeds to the page edges. It is
    // the SINGLE owner of the page's vertical rhythm (the `padding` variant below). Never re-add a
    // `py-*` on a child: a self-padded child (a Hero) would then land a doubled band.
    root: "w-full",
    // The centered gutter: caps width (per `width` below), pads 20px on the sides on mobile and
    // 32px from `sm` up, and stacks its children in a flex column with the canonical 56px (`gap-14`)
    // gap between them.
    container: "mx-auto flex w-full flex-col gap-14 px-5 sm:px-8",
  },
  variants: {
    // Vertical rhythm lives here and ONLY here. `none` is the escape hatch for a child that is
    // already its own band and brings its own `py` (e.g. Hero): wrap it in `padding="none"` so the
    // band still caps the width but does not double the vertical padding.
    padding: {
      default: { root: "py-16 sm:py-24" },
      none: { root: "" },
    },
  },
  defaultVariants: { padding: "default" },
})

/** Max width of the centered content column. Part-local (complete class strings the Tailwind
 *  compiler can see), so it stays out of the shared recipe — the same pattern as LayoutContainer.
 *  `xlarge` (1440px) is the marketing default; it reads the custom `--container-8xl` token added
 *  in app/globals.css. The rest map to Tailwind's native `--container-*` scale. */
const sectionContainerWidths = {
  xlarge: "max-w-8xl", // 1440px — the marketing default
  wide: "max-w-7xl", // 1280px
  default: "max-w-6xl", // 1152px
  narrow: "max-w-3xl", // 768px
  full: "max-w-none",
} as const

export type SectionProps = React.ComponentProps<"section"> & {
  /**
   * Vertical rhythm of the band. Use `none` when the child is already its own band and brings its
   * own `py` (e.g. a Hero), so the padding keeps a single owner and is not doubled. @default "default"
   */
  padding?: "default" | "none"
}

/**
 * The full-bleed band. Renders the `<section>` landmark, so give it an `aria-labelledby`/`id`
 * pairing with its heading (or an `aria-label`) when the page has several. Parts are exported
 * individually (not `Section.Container` dot-notation): namespaced statics don't survive the RSC
 * server→client boundary.
 */
export function Section({ className, padding, ...props }: SectionProps) {
  const { root } = sectionVariants({ padding })
  return <section data-slot="section" className={root({ className })} {...props} />
}

export interface SectionContainerProps extends React.ComponentProps<"div"> {
  /** Max width of the centered content column. @default "xlarge" (1440px) */
  width?: keyof typeof sectionContainerWidths
}

/**
 * The centered gutter inside a `Section`: caps the content width, pads the sides, and provides
 * the canonical 56px gap between the `SectionHeader` and the content below it. `width` swaps the
 * cap; the gap and padding are constant so every marketing section shares one rhythm.
 */
export function SectionContainer({ className, width = "xlarge", ...props }: SectionContainerProps) {
  const { container } = sectionVariants()
  return (
    <div
      data-slot="section-container"
      className={container({ className: cn(sectionContainerWidths[width], className) })}
      {...props}
    />
  )
}
