"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { tv, type VariantProps } from "@/lib/tv"

const standalone = [
  "inline-flex items-center gap-1",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  "[&_svg]:transition-[opacity,translate,filter] [&_svg]:duration-base [&_svg]:ease-out motion-reduce:[&_svg]:transition-none",
  "[&_svg]:-translate-x-1 [&_svg]:opacity-0 [&_svg]:blur-[2px]",
  "[&:hover_svg]:translate-x-0 [&:hover_svg]:opacity-100 [&:hover_svg]:blur-[0px]",
  "[&:focus-visible_svg]:translate-x-0 [&:focus-visible_svg]:opacity-100 [&:focus-visible_svg]:blur-[0px]",
]

export const linkVariants = tv({
  base: [
    "cursor-pointer rounded-xs underline-offset-4 outline-none",
    "transition-colors duration-base ease-out",
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ],
  variants: {
    variant: {
      default: [...standalone, "text-foreground hover:text-brand"],
      muted: [...standalone, "text-muted-foreground hover:text-brand"],
      prose: [
        "inline font-medium underline decoration-border",
        "duration-fast",
        "hover:text-link hover:decoration-link",
        "focus-visible:ring-offset-0",
        "box-decoration-clone",
      ],
    },
    underline: {
      true: "underline decoration-1",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    underline: false,
  },
})

type LinkVariants = VariantProps<typeof linkVariants>

type LinkVariantProps =
  | { variant?: Exclude<LinkVariants["variant"], "prose">; underline?: LinkVariants["underline"] }
  | { variant: "prose"; underline?: never }

export type LinkProps = React.ComponentProps<"a"> &
  LinkVariantProps & {
    asChild?: boolean
  }

export function Link({ className, variant, underline, asChild = false, ...props }: LinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="link"
      className={linkVariants({ variant, underline, className })}
      {...props}
    />
  )
}
