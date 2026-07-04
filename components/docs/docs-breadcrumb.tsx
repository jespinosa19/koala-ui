"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House } from "@phosphor-icons/react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { docsNav } from "./nav"

/**
 * The docs header crumb trail, derived from the current route against `docsNav` (the single
 * nav source of truth, so it never drifts from the sidebar). It reads: a "Docs" home crumb,
 * the section the page lives under (sections have no index page, so they're plain muted text),
 * then the page itself as the current crumb. On the docs root (`/docs`) it collapses to a lone
 * "Docs" crumb (no self-link). A section titled like "Marketing / Sections" expands to two
 * crumbs. Pages absent from the nav fall back to just the home crumb.
 */
export function DocsBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname()

  let section: string | undefined
  let page: string | undefined
  for (const group of docsNav) {
    const match = group.items.find((item) => item.href === pathname)
    if (match) {
      section = group.title
      page = match.title
      break
    }
  }

  const isRoot = pathname === "/docs"
  // Split a compound section label ("Marketing / Sections") into its own crumbs.
  const sectionCrumbs = !isRoot && section ? section.split(" / ") : []

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isRoot ? (
            <BreadcrumbPage className="inline-flex items-center gap-1.5">
              <House weight="bold" aria-hidden className="size-3.5" />
              Docs
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/docs" className="inline-flex items-center gap-1.5">
                <House weight="bold" aria-hidden className="size-3.5" />
                Docs
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {sectionCrumbs.map((crumb) => (
          <Fragment key={crumb}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{crumb}</BreadcrumbItem>
          </Fragment>
        ))}

        {!isRoot && page && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
