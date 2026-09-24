import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

/**
 * Prose: the reading type. A single-element wrapper (like Badge) that typesets the BARE elements of
 * a document under it, whatever wrote them: a CMS rich-text string set with
 * `dangerouslySetInnerHTML`, Markdown rendered to HTML, or plain JSX (`<h2>`, `<p>`, `<ul>`). One
 * `tv` recipe, semantic tokens only, no `@tailwindcss/typography` dependency.
 *
 * - Copy is `text-body`, the reading ink (see FOUNDATIONS `--body`); headings, `strong` and
 *   blockquotes lift to `text-foreground`, list markers step down to `text-muted-foreground`.
 * - Rhythm is space BETWEEN top-level blocks only (never before the first), so the wrapper adds
 *   no leading or trailing gap to whatever it sits in. A heading takes more air above than below,
 *   so it binds to the copy it introduces; media (figure, pre, table, hr, blockquote) take the
 *   widest step so they read as breaks, not paragraphs.
 * - The step sizes are custom properties the `size` variant sets (`--prose-*`), so the rules are
 *   written once and each size only picks its type and its spacing.
 * - A bare `<a>` wears the Link `prose` treatment (mirrored here, because a recipe cannot reach an
 *   element it does not render): no rest color, hairline underline, `--link` on hover. An anchor
 *   that carries a `class` is a component (Link, Button) and styles itself, so Prose leaves it be.
 *   The same goes for `img`: a bare one is a document picture (rounded, image outline), a classed
 *   one (an Avatar) keeps its own shape.
 * - Inline `code` keeps the global chip (globals.css `:not(pre) > code`); `pre` is a muted,
 *   scrollable block.
 *
 * Server-safe: no Context, no state. `asChild` renders the styling onto your own element
 * (`<article>`, `<section>`).
 */
export const proseVariants = tv({
  base: [
    "min-w-0 text-body text-pretty [overflow-wrap:break-word]",
    // ── Rhythm ────────────────────────────────────────────────────────────────
    "[&>*]:mt-(--prose-flow) [&>:first-child]:mt-0",
    "[&>:is(h1,h2)]:mt-(--prose-h2) [&>:is(h3,h4)]:mt-(--prose-h3) [&>:is(h1,h2,h3,h4)+*]:mt-(--prose-after-heading)",
    "[&>:is(figure,pre,table,hr,blockquote,video,iframe)]:mt-(--prose-media) [&>:is(figure,pre,table,hr,blockquote,video,iframe)+*]:mt-(--prose-media)",
    // ── Headings ──────────────────────────────────────────────────────────────
    // Anchorable: clear of a sticky header when a `#hash` jumps to them.
    "[&_:is(h1,h2,h3,h4)]:scroll-mt-24 [&_:is(h1,h2,h3,h4)]:font-semibold [&_:is(h1,h2,h3,h4)]:text-balance [&_:is(h1,h2,h3,h4)]:text-foreground",
    "[&_:is(h1,h2,h3)]:font-heading [&_:is(h1,h2,h3)]:tracking-tight [&_h1]:font-bold",
    // h4 shares the body size, so it keeps the body face and stands apart by weight and ink alone
    // (the FOUNDATIONS "role, not size" rule, like the RichTextEditor's h4).
    "[&_h4]:font-sans",
    // ── Inline ────────────────────────────────────────────────────────────────
    "[&_:is(strong,b)]:font-semibold [&_:is(strong,b)]:text-foreground",
    // The bare link: a mirror of `linkVariants({ variant: "prose" })`.
    "[&_a:not([class])]:cursor-pointer [&_a:not([class])]:rounded-xs [&_a:not([class])]:font-medium [&_a:not([class])]:underline [&_a:not([class])]:decoration-border [&_a:not([class])]:underline-offset-4 [&_a:not([class])]:box-decoration-clone [&_a:not([class])]:outline-none",
    "[&_a:not([class])]:transition-colors [&_a:not([class])]:duration-fast [&_a:not([class])]:ease-out [&_a:not([class])]:hover:text-link [&_a:not([class])]:hover:decoration-link",
    "[&_a:not([class])]:focus-visible:ring-2 [&_a:not([class])]:focus-visible:ring-brand",
    // ── Lists ─────────────────────────────────────────────────────────────────
    // Quiet markers: the copy carries the ink. A nested list, or a `<p>` a list item wraps its copy
    // in (Tiptap, most Markdown renderers), sits tight inside its item.
    "[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-5 [&_li]:pl-1.5 [&_li+li]:mt-(--prose-item)",
    "[&_li::marker]:text-muted-foreground [&_ol>li::marker]:font-medium [&_ol>li::marker]:tabular-nums",
    "[&_li>:is(ul,ol)]:mt-(--prose-item) [&_li>p]:mt-0 [&_li>p+p]:mt-2",
    // ── Blockquote ────────────────────────────────────────────────────────────
    // A pull quote: a brand rule and the copy lifted a step, not a boxed callout.
    "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:font-heading [&_blockquote]:font-medium [&_blockquote]:tracking-tight [&_blockquote]:text-balance [&_blockquote]:text-foreground",
    // ── Code ──────────────────────────────────────────────────────────────────
    // The block paints `--muted`, so it declares it: a copy Button or any other surface-aware
    // control dropped into a code block rebases onto the block instead of the page
    // (docs/FOUNDATIONS.md, the `--surface` contract).
    "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:[--surface:var(--muted)] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-foreground",
    // ── Rule ──────────────────────────────────────────────────────────────────
    "[&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-border",
    // ── Media ─────────────────────────────────────────────────────────────────
    // The image outline (#11) is an `outline` on the picture itself, so it follows its corners and
    // paints over it without a stacking overlay (a zoomable image must stay free to lift out).
    "[&_figure]:w-full [&_img:not([class])]:block [&_img:not([class])]:h-auto [&_img:not([class])]:max-w-full [&_img:not([class])]:rounded-xl",
    "[&_img:not([class])]:outline-1 [&_img:not([class])]:-outline-offset-1 [&_img:not([class])]:outline-black/10 dark:[&_img:not([class])]:outline-white/10",
    "[&_figure>img:not([class])]:w-full [&_figcaption]:mt-3 [&_figcaption]:text-sm [&_figcaption]:leading-5 [&_figcaption]:text-muted-foreground",
    "[&_:is(video,iframe)]:block [&_:is(video,iframe)]:w-full [&_:is(video,iframe)]:rounded-xl",
    // ── Table ─────────────────────────────────────────────────────────────────
    // `block` + `overflow-x-auto` lets a wide table scroll inside the column instead of the page.
    // Rows split on a hairline over each cell; a cell has no radius, so the border stays straight.
    "[&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm [&_table]:leading-5 [&_table]:tabular-nums",
    "[&_th]:pr-6 [&_th]:pb-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground [&_td]:border-t [&_td]:border-border [&_td]:py-2.5 [&_td]:pr-6 [&_td]:align-top",
  ],
  variants: {
    size: {
      // App surfaces: a comment, a task description, release notes in a panel. The 14px body of
      // the rest of the product UI, and the RichTextEditor's scale, so what was typed there reads
      // back the same here.
      sm: [
        "text-sm leading-6",
        "[--prose-flow:--spacing(4)] [--prose-h2:--spacing(8)] [--prose-h3:--spacing(6)] [--prose-after-heading:--spacing(2)] [--prose-media:--spacing(6)] [--prose-item:--spacing(1.5)]",
        "[&_h1]:text-2xl [&_h2]:text-lg [&_h3]:text-base [&_h4]:text-sm",
        "[&_blockquote]:text-base [&_blockquote]:leading-7",
      ],
      // Docs and release notes: 16/28, a denser column that is still read, not scanned.
      md: [
        "text-base leading-7",
        "[--prose-flow:--spacing(5)] [--prose-h2:--spacing(12)] [--prose-h3:--spacing(8)] [--prose-after-heading:--spacing(3)] [--prose-media:--spacing(8)] [--prose-item:--spacing(2)]",
        "[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-base",
        "[&_blockquote]:text-lg [&_blockquote]:leading-8",
      ],
      // Long-form reading (an article): 17/28 at a ~70 character measure, with a heading a full
      // section break above the copy it opens. 17px, not the scale's 18: at 18 a 42rem column
      // holds ~62 characters and the line starts to feel short.
      lg: [
        "text-[1.0625rem] leading-7",
        "[--prose-flow:--spacing(6)] [--prose-h2:--spacing(16)] [--prose-h3:--spacing(12)] [--prose-after-heading:--spacing(4)] [--prose-media:--spacing(10)] [--prose-item:--spacing(3)]",
        "[&_h1]:text-4xl [&_h2]:text-[1.625rem] [&_h2]:leading-[1.2] md:[&_h2]:text-3xl [&_h3]:text-xl [&_h3]:leading-[1.3] md:[&_h3]:text-[1.375rem] [&_h4]:text-[1.0625rem]",
        "[&_blockquote]:pl-6 [&_blockquote]:text-xl [&_blockquote]:leading-8",
      ],
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type ProseProps = React.ComponentProps<"div"> &
  VariantProps<typeof proseVariants> & {
    /** Render the styling onto your own element (`<article>`, `<section>`) instead of a `div`. */
    asChild?: boolean
  }

export function Prose({ className, size, asChild = false, ...props }: ProseProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="prose" data-size={size ?? "md"} className={proseVariants({ size, className })} {...props} />
}
