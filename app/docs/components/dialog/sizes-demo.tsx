"use client"

import * as React from "react"
import { X, UserCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { dialogVariants } from "@/components/ui/dialog"

/**
 * Static, non-portal preview of every DialogContent `size`. We render the real
 * `dialogVariants` slots directly (no Radix Root/Portal) so all four widths are
 * visible at once without opening anything. Left-aligned, shadow-free (the real modal keeps
 * `shadow-lg`), each led by an icon. Title/description use plain h2/p instead of the Radix
 * parts, which require a Dialog context to render.
 */

const SIZES = [
  {
    size: "sm",
    width: "max-w-sm · 24rem / 384px",
    use: "Confirmations and short prompts.",
  },
  {
    size: "md",
    width: "max-w-[30rem] · 30rem / 480px",
    use: "The default; the width nearly every dialog should use.",
  },
  {
    size: "lg",
    width: "max-w-2xl · 42rem / 672px",
    use: "Denser forms with side-by-side fields.",
  },
  {
    size: "xl",
    width: "max-w-4xl · 56rem / 896px",
    use: "Rich content: tables, multi-column layouts.",
  },
] as const

export function DialogSizesShowcase() {
  return (
    <div className="flex w-full flex-col gap-8">
      {SIZES.map(({ size, width, use }) => {
        const slots = dialogVariants({ size })
        return (
          <div key={size} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <code className="font-mono text-sm font-medium text-foreground">
                size=&quot;{size}&quot;
              </code>
              <span className="text-xs text-muted-foreground">{width}</span>
              <span className="text-xs text-muted-foreground">{use}</span>
            </div>
            {/* The real content slot, rendered inline (no portal). */}
            <div className={slots.content({ className: "shadow-none" })} aria-hidden>
              <div className={slots.icon()}>
                <UserCircle weight="bold" />
              </div>
              <div className={slots.header()}>
                <h2 className={slots.title()}>Edit profile</h2>
                <p className={slots.description()}>
                  Make changes to your profile here. Click save when you&apos;re done.
                </p>
              </div>
              <div className={slots.footer()}>
                <Button variant="ghost">Cancel</Button>
                <Button>Save changes</Button>
              </div>
              <span className="absolute top-4 right-4 text-muted-foreground [&_svg]:size-4">
                <X weight="bold" />
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
