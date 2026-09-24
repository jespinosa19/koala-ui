import { CaretDown } from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarInner,
  NavbarLink,
  NavbarMobileLink,
  NavbarMobileMenu,
  NavbarMobileToggle,
  NavbarNav,
  NavbarSpacer,
} from "@/components/ui/navbar"

/**
 * navbar-section-1: the canonical marketing bar.
 *
 * Brand on the left, the links beside it with one dropdown, the sign-in pair on the right. Below
 * `md` the links fold into the mobile menu behind the toggle, and the wordmark steps out so the row
 * belongs to the logo tile, the primary action and the toggle. The brand link keeps its accessible
 * name through `aria-label` when the wordmark is hidden.
 */

const LINKS = ["Home", "About", "Features", "Blog", "Pricing"] as const
const COMPANY = ["About us", "Careers", "Customers", "Contact"] as const

/** Your logo. Replace the mark and the name with your own. */
function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
          <path d="M8 1.5 14.5 14h-13Z" />
        </svg>
      </span>
      <span className="hidden text-base font-semibold tracking-tight sm:inline">Acme</span>
    </span>
  )
}

export function NavbarSection1() {
  return (
    <Navbar>
      <NavbarInner>
        <NavbarBrand href="#" aria-label="Acme">
          <Logo />
        </NavbarBrand>
        <NavbarNav>
          {LINKS.map((label) => (
            <NavbarLink key={label} href="#" active={label === "Features"}>
              {label}
            </NavbarLink>
          ))}
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
              {COMPANY.map((label) => (
                <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </NavbarNav>
        <NavbarSpacer />
        <NavbarActions>
          <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button size="sm">Sign up</Button>
        </NavbarActions>
        <NavbarMobileToggle />
      </NavbarInner>
      <NavbarMobileMenu>
        {LINKS.map((label) => (
          <NavbarMobileLink key={label} href="#" active={label === "Features"}>
            {label}
          </NavbarMobileLink>
        ))}
        <NavbarMobileLink href="#">Company</NavbarMobileLink>
      </NavbarMobileMenu>
    </Navbar>
  )
}
