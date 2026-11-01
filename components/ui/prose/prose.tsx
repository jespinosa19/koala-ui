import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

export const proseVariants = tv({
  base: [
    "min-w-0 text-body text-pretty [overflow-wrap:break-word]",
    "[&>*]:mt-(--prose-flow) [&>:first-child]:mt-0",
    "[&>:is(h1,h2)]:mt-(--prose-h2) [&>:is(h3,h4)]:mt-(--prose-h3) [&>:is(h1,h2,h3,h4)+*]:mt-(--prose-after-heading)",
    "[&>:is(figure,pre,table,hr,blockquote,video,iframe,[data-slot=code-snippet],[data-slot=table-container])]:mt-(--prose-media) [&>:is(figure,pre,table,hr,blockquote,video,iframe,[data-slot=code-snippet],[data-slot=table-container])+*]:mt-(--prose-media)",
    "[&_:is(h1,h2,h3,h4)]:scroll-mt-24 [&_:is(h1,h2,h3,h4)]:font-semibold [&_:is(h1,h2,h3,h4)]:text-balance [&_:is(h1,h2,h3,h4)]:text-foreground",
    "[&_:is(h1,h2,h3)]:font-heading [&_:is(h1,h2,h3)]:tracking-tight [&_h1]:font-bold",
    "[&_h4]:font-sans",
    "[&_:is(strong,b)]:font-semibold [&_:is(strong,b)]:text-foreground",
    "[&_a:not([class])]:cursor-pointer [&_a:not([class])]:rounded-xs [&_a:not([class])]:font-medium [&_a:not([class])]:underline [&_a:not([class])]:decoration-border [&_a:not([class])]:underline-offset-4 [&_a:not([class])]:box-decoration-clone [&_a:not([class])]:outline-none",
    "[&_a:not([class])]:transition-colors [&_a:not([class])]:duration-fast [&_a:not([class])]:ease-out [&_a:not([class])]:hover:text-link [&_a:not([class])]:hover:decoration-link",
    "[&_a:not([class])]:focus-visible:ring-2 [&_a:not([class])]:focus-visible:ring-brand",
    "[&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:pl-5 [&_li]:pl-1.5 [&_li+li]:mt-(--prose-item)",
    "[&_li::marker]:text-muted-foreground [&_ol>li::marker]:font-medium [&_ol>li::marker]:tabular-nums",
    "[&_li>:is(ul,ol)]:mt-(--prose-item) [&_li>p]:mt-0 [&_li>p+p]:mt-2",
    "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:font-heading [&_blockquote]:font-medium [&_blockquote]:tracking-tight [&_blockquote]:text-balance [&_blockquote]:text-foreground",
    // A bare `pre` only: a component's own `pre` (Code Snippet's) brings its surface, and a second one inside it doubles up.
    "[&_pre:not([data-slot])]:overflow-x-auto [&_pre:not([data-slot])]:rounded-xl [&_pre:not([data-slot])]:bg-muted [&_pre:not([data-slot])]:[--surface:var(--muted)] [&_pre:not([data-slot])]:p-4 [&_pre:not([data-slot])]:font-mono [&_pre:not([data-slot])]:text-sm [&_pre:not([data-slot])]:leading-6 [&_pre:not([data-slot])]:text-foreground",
    "[&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-border",
    "[&_figure]:w-full [&_img:not([class])]:block [&_img:not([class])]:h-auto [&_img:not([class])]:max-w-full [&_img:not([class])]:rounded-xl",
    "[&_img:not([class])]:outline-1 [&_img:not([class])]:-outline-offset-1 [&_img:not([class])]:outline-black/10 dark:[&_img:not([class])]:outline-white/10",
    "[&_figure>img:not([class])]:w-full [&_figcaption]:mt-3 [&_figcaption]:text-sm [&_figcaption]:leading-5 [&_figcaption]:text-muted-foreground",
    "[&_:is(video,iframe)]:block [&_:is(video,iframe)]:w-full [&_:is(video,iframe)]:rounded-xl",
    "[&_table:not([data-slot])]:block [&_table:not([data-slot])]:w-full [&_table:not([data-slot])]:max-w-full [&_table:not([data-slot])]:overflow-x-auto [&_table:not([data-slot])]:border-collapse [&_table:not([data-slot])]:text-sm [&_table:not([data-slot])]:leading-5 [&_table:not([data-slot])]:tabular-nums",
    "[&_th:not([data-slot])]:pr-6 [&_th:not([data-slot])]:pb-2.5 [&_th:not([data-slot])]:text-left [&_th:not([data-slot])]:font-medium [&_th:not([data-slot])]:text-foreground [&_td:not([data-slot])]:border-t [&_td:not([data-slot])]:border-border [&_td:not([data-slot])]:py-2.5 [&_td:not([data-slot])]:pr-6 [&_td:not([data-slot])]:align-top",
  ],
  variants: {
    size: {
      sm: [
        "text-sm leading-6",
        "[--prose-flow:--spacing(4)] [--prose-h2:--spacing(8)] [--prose-h3:--spacing(6)] [--prose-after-heading:--spacing(2)] [--prose-media:--spacing(6)] [--prose-item:--spacing(1.5)]",
        "[&_h1]:text-2xl [&_h2]:text-lg [&_h3]:text-base [&_h4]:text-sm",
        "[&_blockquote]:text-base [&_blockquote]:leading-7",
      ],
      md: [
        "text-base leading-7",
        "[--prose-flow:--spacing(5)] [--prose-h2:--spacing(12)] [--prose-h3:--spacing(8)] [--prose-after-heading:--spacing(3)] [--prose-media:--spacing(8)] [--prose-item:--spacing(2)]",
        "[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-base",
        "[&_blockquote]:text-lg [&_blockquote]:leading-8",
      ],
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
    asChild?: boolean
  }

export function Prose({ className, size, asChild = false, ...props }: ProseProps) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="prose" data-size={size ?? "md"} className={proseVariants({ size, className })} {...props} />
}
