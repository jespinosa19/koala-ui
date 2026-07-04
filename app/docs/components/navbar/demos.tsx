"use client"

import {
  CaretDown,
  MagnifyingGlass,
  ShoppingCart,
  User,
  Bell,
  Question,
} from "@phosphor-icons/react"

import {
  Navbar,
  NavbarInner,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
  NavbarSearch,
  NavbarSpacer,
  NavbarMobileToggle,
  NavbarMobileMenu,
  NavbarMobileLink,
} from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { BrandMark } from "@/components/landing/brand-mark"

const LINKS = ["Home", "About", "Features", "Blog", "Pricing"] as const

function Brand({ className }: { className?: string }) {
  return (
    <NavbarBrand href="#" className={className}>
      <BrandMark />
    </NavbarBrand>
  )
}

function CompanyMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavbarLink asChild>
          <button type="button">
            Company
            <CaretDown weight="bold" />
          </button>
        </NavbarLink>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>About us</DropdownMenuItem>
        <DropdownMenuItem>Careers</DropdownMenuItem>
        <DropdownMenuItem>Customers</DropdownMenuItem>
        <DropdownMenuItem>Contact</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Actions() {
  return (
    <NavbarActions>
      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
        Sign in
      </Button>
      <Button size="sm">Sign up</Button>
    </NavbarActions>
  )
}

function MobileMenu() {
  return (
    <NavbarMobileMenu>
      {LINKS.map((label) => (
        <NavbarMobileLink key={label} href="#" active={label === "Features"}>
          {label}
        </NavbarMobileLink>
      ))}
      <NavbarMobileLink href="#">Company</NavbarMobileLink>
    </NavbarMobileMenu>
  )
}

/** Canonical bar: brand left, links, actions right, hamburger below md. */
export function NavbarDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarNav>
          {LINKS.map((label) => (
            <NavbarLink key={label} href="#" active={label === "Features"}>
              {label}
            </NavbarLink>
          ))}
          <CompanyMenu />
        </NavbarNav>
        <NavbarSpacer />
        <Actions />
        <NavbarMobileToggle />
      </NavbarInner>
      <MobileMenu />
    </Navbar>
  )
}

/** Floating, detached rounded card. */
export function NavbarFloatingDemo() {
  return (
    <div className="w-full rounded-xl bg-muted/40 p-3">
      <Navbar variant="floating">
        <NavbarInner>
          <Brand />
          <NavbarNav>
            {LINKS.slice(0, 4).map((label) => (
              <NavbarLink key={label} href="#" active={label === "Home"}>
                {label}
              </NavbarLink>
            ))}
          </NavbarNav>
          <NavbarSpacer />
          <Actions />
          <NavbarMobileToggle />
        </NavbarInner>
        <NavbarMobileMenu>
          {LINKS.slice(0, 4).map((label) => (
            <NavbarMobileLink key={label} href="#" active={label === "Home"}>
              {label}
            </NavbarMobileLink>
          ))}
        </NavbarMobileMenu>
      </Navbar>
    </div>
  )
}

/**
 * Elevate on scroll: the bar rests flat (borderless, no shadow, flush with the content) and
 * brings its border + shadow in together the moment the page scrolls under it. Scroll the
 * panel to see it engage. In a real layout the bar is `sticky top-0` on the page; here it
 * sits in a scroll container, which `elevateOnScroll` detects automatically.
 */
export function NavbarElevateOnScrollDemo() {
  return (
    <div className="h-72 w-full overflow-y-auto rounded-xl bg-muted/40">
      <Navbar variant="floating" elevateOnScroll className="sticky top-0 z-10 px-3 pt-3">
        <NavbarInner>
          <Brand />
          <NavbarNav>
            {LINKS.slice(0, 4).map((label) => (
              <NavbarLink key={label} href="#" active={label === "Home"}>
                {label}
              </NavbarLink>
            ))}
          </NavbarNav>
          <NavbarSpacer />
          <Actions />
          <NavbarMobileToggle />
        </NavbarInner>
      </Navbar>
      <div className="space-y-3 px-6 pb-6 pt-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border bg-background p-4">
            <div className="h-3 w-1/3 rounded-full bg-muted" />
            <div className="h-3 w-full rounded-full bg-muted" />
            <div className="h-3 w-4/5 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Links centered: brand left, links pushed to the middle by spacers on both sides. */
export function NavbarCenterDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarSpacer />
        <NavbarNav>
          {LINKS.slice(0, 5).map((label) => (
            <NavbarLink key={label} href="#" active={label === "Pricing"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <Actions />
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Links right: a single spacer after the brand pushes both nav and actions to the end. */
export function NavbarRightDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarSpacer />
        <NavbarNav>
          {LINKS.slice(0, 4).map((label) => (
            <NavbarLink key={label} href="#" active={label === "About"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <Actions />
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** An ecommerce shell: search, account, and cart actions in place of marketing CTAs. */
export function NavbarEcommerceDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarNav className="ml-2">
          {["Shop", "New", "Collections", "About"].map((label) => (
            <NavbarLink key={label} href="#" active={label === "Shop"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <NavbarActions>
          <Button size="sm" variant="ghost" iconOnly aria-label="Search">
            <MagnifyingGlass weight="bold" />
          </Button>
          <Button size="sm" variant="ghost" iconOnly aria-label="Account">
            <User weight="bold" />
          </Button>
          <Button size="sm" variant="ghost" iconOnly aria-label="Cart">
            <ShoppingCart weight="bold" />
          </Button>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Input in middle: a centered search field that grows to fill the bar. */
export function NavbarSearchDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarNav>
          {LINKS.slice(0, 3).map((label) => (
            <NavbarLink key={label} href="#" active={label === "Home"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <NavbarSearch placeholder="Search anything" className="hidden w-64 md:flex" />
        <NavbarActions>
          <Button size="sm">Sign up</Button>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Product app shell: compact bar with a global search and an account cluster. */
export function NavbarProductDemo() {
  return (
    <Navbar density="compact">
      <NavbarInner>
        <Brand />
        <NavbarNav className="ml-2">
          {["Home", "Projects", "Inbox"].map((label) => (
            <NavbarLink key={label} href="#" active={label === "Home"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSearch
          placeholder="Search and discover"
          className="mx-4 ml-auto hidden w-64 md:flex bg-muted border-transparent"
        />
        <NavbarActions>
          <Button size="sm" variant="ghost" iconOnly aria-label="Help">
            <Question weight="bold" />
          </Button>
          <Button size="sm" variant="ghost" iconOnly aria-label="Notifications">
            <Bell weight="bold" />
          </Button>
          <AvatarRoot size="sm" className="ml-1 cursor-pointer">
            <AvatarImage src="https://i.pravatar.cc/160?img=15" alt="Account" />
            <AvatarFallback>AS</AvatarFallback>
          </AvatarRoot>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Logo in the middle: links left, brand centered, actions right, via a 3-column grid. */
export function NavbarLogoMiddleDemo() {
  return (
    <Navbar>
      <NavbarInner className="grid grid-cols-[1fr_auto_1fr]">
        <NavbarNav>
          {LINKS.slice(0, 3).map((label) => (
            <NavbarLink key={label} href="#" active={label === "About"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <Brand className="mr-0 justify-self-center" />
        <NavbarActions className="justify-self-end">
          <Button size="sm" variant="ghost" iconOnly aria-label="Cart">
            <ShoppingCart weight="bold" />
          </Button>
          <Button size="sm">Book now</Button>
        </NavbarActions>
      </NavbarInner>
    </Navbar>
  )
}

/** Multi-button actions: a text link, an outline secondary, and a solid primary. */
export function NavbarMultiButtonDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <Brand />
        <NavbarNav>
          {["Solutions", "Roles", "Resources", "Pricing"].map((label) => (
            <NavbarLink key={label} href="#">
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <NavbarActions>
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button size="sm" variant="outline">
            Get a demo
          </Button>
          <Button size="sm">Sign up free</Button>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Badge beside the brand: flag a beta, plan, or environment next to the logo. */
export function NavbarBadgeDemo() {
  return (
    <Navbar>
      <NavbarInner>
        <div className="flex items-center gap-2">
          <Brand />
          <Badge variant="secondary" size="sm" pill>
            Beta
          </Badge>
        </div>
        <NavbarNav className="ml-2">
          {LINKS.slice(0, 4).map((label) => (
            <NavbarLink key={label} href="#" active={label === "Features"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <NavbarActions>
          <Button size="sm">Sign up</Button>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}

/** Density compact: a tighter bar for application shells. */
export function NavbarCompactDemo() {
  return (
    <Navbar density="compact">
      <NavbarInner>
        <Brand />
        <NavbarNav>
          {LINKS.slice(0, 4).map((label) => (
            <NavbarLink key={label} href="#" active={label === "Features"}>
              {label}
            </NavbarLink>
          ))}
        </NavbarNav>
        <NavbarSpacer />
        <Actions />
        <NavbarMobileToggle />
      </NavbarInner>
    </Navbar>
  )
}
