"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { docsNav } from "./nav"

/**
 * The /docs navigation rail, now the DS `Sidebar` itself (dogfooding the library). The root
 * chrome (width, card fill, right border, full height) is neutralized so it sits transparently
 * inside the layout's sticky scroll column; `indicator` turns on the sliding brand pill that
 * glides to the active row on navigation. Active state is derived from the route via
 * `usePathname`, and the pill follows it automatically (SidebarContent measures the
 * `[data-active]` row), so there's no bespoke measurement code here anymore.
 */
export function SidebarNav() {
  const pathname = usePathname()
  const navRef = React.useRef<HTMLElement>(null)
  // First paint snaps into place; later navigations glide. A ref (not state) so flipping it
  // never re-renders.
  const settled = React.useRef(false)

  // Keep the current page in view. The rail lives in its own scrolling column (the docs shell's
  // `LayoutSidebar`), so a deep link, e.g. a component far down the list, can load below the fold
  // with the active row never scrolled into sight. Center it on navigation so you never have to
  // hunt for where you are. Guarded on visibility: clicking a row that's already on screen leaves
  // the scroll untouched (no jolt); only an off-screen active row is brought to the middle. First
  // run snaps instantly (a smooth scroll on load reads as a glitch); later runs glide, honoring
  // reduced-motion.
  React.useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>(
      '[data-slot="sidebar-item"][data-active="true"]',
    )
    if (!active) return

    // Walk up to the nearest scrollable ancestor (the LayoutSidebar column).
    let scroller = nav.parentElement
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
      scroller = scroller.parentElement
    }
    if (!scroller) return

    const sRect = scroller.getBoundingClientRect()
    const aRect = active.getBoundingClientRect()
    const fullyVisible = aRect.top >= sRect.top && aRect.bottom <= sRect.bottom
    if (!fullyVisible) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const delta = aRect.top - sRect.top - (scroller.clientHeight - aRect.height) / 2
      scroller.scrollTo({
        top: scroller.scrollTop + delta,
        behavior: settled.current && !reduced ? "smooth" : "auto",
      })
    }
    settled.current = true
  }, [pathname])

  return (
    <Sidebar
      ref={navRef}
      aria-label="Documentation"
      indicator
      className="h-auto w-full shrink-0 overflow-visible border-r-0 bg-transparent"
    >
      <SidebarContent className="gap-6 overflow-visible px-2 py-0">
        {docsNav.map((section) => (
          <SidebarGroup key={section.title} aria-label={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            {section.items.map((item) => (
              <SidebarItem key={item.href} asChild active={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon weight="bold" aria-hidden />
                  {item.title}
                  {item.soon && (
                    <Badge size="sm" className="ml-auto uppercase tracking-wide">
                      Soon
                    </Badge>
                  )}
                </Link>
              </SidebarItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
