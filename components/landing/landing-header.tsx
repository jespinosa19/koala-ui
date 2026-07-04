"use client"

import * as React from "react"
import Link from "next/link"
import { CaretDown, FigmaLogo, DeviceMobile, Desktop } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Navbar,
  NavbarInner,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
  NavbarSpacer,
  NavbarMobileToggle,
  NavbarMobileMenu,
  NavbarMobileLink,
} from "@/components/ui/navbar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { BrandMark } from "@/components/landing/brand-mark"
import { AnnouncementBar } from "@/components/landing/announcement-bar"
import { NAV } from "@/components/landing/data"

/**
 * Sticky marketing header. Structure mirrors the original site: an announcement bar, the
 * brand, the Product / Solutions / Pricing / Templates / University / Resources nav, and the
 * Buy now + Preview actions. Styling/behavior come from our Navbar + DropdownMenu.
 */
export function LandingHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <AnnouncementBar />
      <Navbar
        variant="full"
        elevateOnScroll
        open={open}
        onOpenChange={setOpen}
        // Normal full-bleed bar: the translucent blurred background spans the viewport (blur on
        // the full-width root so it covers the whole bar). It rests flat over the hero and brings
        // only its bottom stroke in once the page scrolls under it (elevateOnScroll); no shadow.
        className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        {/* Match SectionContainer's gutter (max-w-8xl + px-5/sm:px-8) so the brand and actions
            land on the section content edges below. */}
        <NavbarInner className="px-5 sm:px-8">
          <NavbarBrand asChild>
            <Link href="/" aria-label="Koala UI home">
              <BrandMark />
            </Link>
          </NavbarBrand>

          <NavbarSpacer />

          <NavbarNav>
            {NAV.map((entry) =>
              entry.items ? (
                <DropdownMenu key={entry.label}>
                  <DropdownMenuTrigger asChild>
                    <NavbarLink asChild>
                      <button type="button">
                        {entry.label}
                        <CaretDown weight="bold" />
                      </button>
                    </NavbarLink>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {entry.items.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavbarLink
                  key={entry.label}
                  asChild
                  className={entry.soon ? "text-foreground/40" : undefined}
                >
                  <Link href={entry.href ?? "#"}>
                    {entry.label}
                    {entry.soon && (
                      <Badge variant="secondary" size="sm" className="ml-1">
                        Soon
                      </Badge>
                    )}
                  </Link>
                </NavbarLink>
              ),
            )}
          </NavbarNav>

          <NavbarSpacer />

          <NavbarActions>
            <Button asChild size="sm">
              <Link href="#pricing">Buy now</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <FigmaLogo weight="bold" />
                  Preview
                  <CaretDown weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/docs">
                    <Desktop weight="bold" />
                    Live components
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/marketing/sections/hero">
                    <DeviceMobile weight="bold" />
                    Marketing sections
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NavbarMobileToggle />
          </NavbarActions>
        </NavbarInner>

        <NavbarMobileMenu className="bg-background">
          {NAV.map((entry) =>
            entry.items ? (
              <div key={entry.label} className="flex flex-col">
                <span className="px-3 pb-1 pt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {entry.label}
                </span>
                {entry.items.map((item) => (
                  <NavbarMobileLink key={item.label} asChild onClick={() => setOpen(false)}>
                    <Link href={item.href}>{item.label}</Link>
                  </NavbarMobileLink>
                ))}
              </div>
            ) : (
              <NavbarMobileLink key={entry.label} asChild onClick={() => setOpen(false)}>
                <Link href={entry.href ?? "#"}>
                  {entry.label}
                  {entry.soon && (
                    <Badge variant="secondary" size="sm" className="ml-1">
                      Soon
                    </Badge>
                  )}
                </Link>
              </NavbarMobileLink>
            ),
          )}
          <div className="mt-3 flex flex-col gap-2 px-3 pt-2">
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link href="/docs">Preview</Link>
            </Button>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="#pricing">Buy now</Link>
            </Button>
          </div>
        </NavbarMobileMenu>
      </Navbar>
    </>
  )
}
