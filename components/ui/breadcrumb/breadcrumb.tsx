import * as React from "react"
import { Slot } from "radix-ui"
import { CaretRight, DotsThree } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"
import { hitBox, hitY } from "@/lib/hit-area"

export function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

export interface BreadcrumbLinkProps extends React.ComponentProps<"a"> {
  asChild?: boolean
}

export function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "relative rounded-sm",
        "transition-colors duration-fast ease-out hover:text-foreground",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        hitY,
        className,
      )}
      {...props}
    />
  )
}

export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      aria-hidden="true"
      className={cn("flex items-center [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <CaretRight weight="bold" />}
    </li>
  )
}

export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      aria-label="More pages"
      className={cn(
        "relative flex items-center justify-center text-muted-foreground",
        hitBox,
        className,
      )}
      {...props}
    >
      <DotsThree aria-hidden weight="bold" className="size-4" />
    </span>
  )
}
