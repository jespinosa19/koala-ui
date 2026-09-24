"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { List, X, MagnifyingGlass } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { ControlSizeProvider, type ControlSize } from "@/lib/density"
import { useDensity } from "@/lib/density"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { hitBox, hitY } from "@/lib/hit-area"
import {
  InputRoot,
  InputField,
  InputPrefix,
  type InputRootProps,
  type InputFieldProps,
} from "@/components/ui/input"

/**
 * Navbar: multi-part top navigation bar for marketing, product, and ecommerce shells.
 * Pattern: one `tv` recipe with `slots`, shared variants flowing to every part through
 * React Context (never prop-drilled or cloned). See docs/ARCHITECTURE.md §2.
 *
 * Layout is composition, not configuration: drop a `NavbarSpacer` between groups to push
 * them apart, so the same parts assemble links-left, links-middle, or links-right without
 * an alignment prop. Dropdown links compose the existing `DropdownMenu` around a
 * `NavbarLink` trigger; the cart/search/avatar bits of an ecommerce bar are just children
 * in `NavbarActions`.
 *
 * `linkStyle` is the one thing composition can't express, because it changes what a link IS:
 * a ghost chip floating in the bar (`pill`) or a full-height tab welded to its bottom rule
 * (`underline`). Everything else about a bar is the parts you assemble.
 */
export const navbarVariants = tv({
  slots: {
    // The full-bleed bar. `full` paints the bottom rule here; `floating` keeps the bar
    // transparent and moves the chrome onto the inner card. `group/navbar` lets the inner
    // card react to the root's `data-scrolled` (see the elevateOnScroll variant).
    root: "group/navbar w-full bg-background text-foreground",
    // The max-width content row. Caps at `max-w-7xl` (1280px), the SAME marketing default as
    // SectionContainer (width="wide"), so a bar above a section lands its content on the
    // section's content edges instead of a wider column. justify is left to
    // NavbarSpacer, so groups sit where the consumer places them.
    inner: "mx-auto flex w-full max-w-7xl items-center gap-2",
    // Brand / logo lockup. `asChild` lets it become a link without a wrapper element.
    brand:
      "mr-2 inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md text-base font-semibold tracking-tight text-foreground outline-none transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-6 [&_svg]:shrink-0",
    // The horizontal link list: collapses below md, where NavbarMobileMenu takes over.
    nav: "hidden items-center gap-0.5 md:flex",
    // A ghost-button-styled link. `before` extends the hit area to 40px without growing the
    // visual; `after` is the active underline; the caret (if any) flips when its menu opens.
    link: [
      // whitespace-nowrap is structural, not cosmetic: a nav link that wraps to two lines breaks
      // the bar's height and drags every sibling out of alignment. Multi-word labels ("New
      // arrivals") wrap the moment the row is tight, so the bar must overflow or collapse to the
      // hamburger instead — never reflow its own links.
      "group relative inline-flex h-9 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-medium",
      "text-foreground transition duration-fast ease-out",
      "hover:text-foreground",
      "active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=open]:text-foreground",
      // A link for a page that is not live yet ("University · Soon"): muted, and inert to the
      // pointer so it neither previews the underline nor presses. Pair it with a Badge.
      "aria-disabled:pointer-events-none aria-disabled:text-muted-foreground",
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:caret-turn-fast [&[data-state=open]_svg]:rotate-180",
      // polish: ≥40px vertical hit target, never overlapping a horizontal neighbor.
      hitY,
      // Active affordance: a soft-capped brand underline pinned to the bottom rule of the
      // bar (like a tab indicator), not tucked under the label. The link is h-9, centered
      // in the h-16/h-14 bar, so the vertical offset to reach the rule is density-specific
      // (see the density variant below: (barH − 36) / 2).
      "data-[active=true]:text-foreground",
      "data-[active=true]:after:absolute data-[active=true]:after:inset-x-3 data-[active=true]:after:h-0.5 data-[active=true]:after:rounded-full data-[active=true]:after:bg-brand",
    ],
    // Right-hand action cluster (buttons, search, cart, avatar…).
    actions: "flex shrink-0 items-center gap-2",
    // Hamburger: only below md, where the inline nav is hidden.
    toggle: [
      "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground md:hidden",
      "transition duration-fast ease-out hover:bg-accent dark:hover:bg-foreground/8 active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&_svg]:size-5 [&_svg]:shrink-0",
      // polish: square 40px hit box on both axes.
      hitBox,
    ],
    // The disclosed mobile panel; a subtle fade+slide on enter.
    mobileMenu:
      "flex flex-col gap-0.5 border-t border-border px-4 pb-4 pt-2 md:hidden animate-in fade-in-0 slide-in-from-top-2 duration-base ease-out",
    mobileLink: [
      "flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-foreground",
      "transition duration-fast ease-out hover:bg-accent dark:hover:bg-foreground/8 hover:text-foreground active:scale-[0.98]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset",
      "data-[active=true]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
      "aria-disabled:pointer-events-none aria-disabled:text-muted-foreground",
    ],
  },
  variants: {
    variant: {
      // Edge-to-edge bar with a hairline bottom rule: the classic marketing/app header.
      full: { root: "border-b border-border" },
      // A detached rounded card; the consumer gives it top margin. Chrome lives on the
      // inner card so the bar floats over the page.
      floating: {
        root: "bg-transparent",
        inner: "rounded-2xl border border-border bg-background shadow-sm",
      },
    },
    // Scroll elevation: the bar rests perfectly flat (borderless, no shadow, flush with the
    // hero) and gains both its border and a layered shadow the moment the page scrolls under
    // it. Off by default so existing bars keep their resting border + shadow-sm; the
    // transition is scoped to `box-shadow` and `border-color` (never `transition: all`). The
    // lift target is variant-specific (compoundVariants below): `floating` elevates the
    // inner card, `full` the whole rule.
    elevateOnScroll: {
      true: {},
      false: {},
    },
    // How a link carries its shape and its current-page indicator. Two different mental
    // models, not two skins: `pill` is a ghost button that happens to live in a bar, `underline`
    // is a tab strip. They differ in box (h-9 chip vs full-bar-height cell), in hover (a
    // rounded `bg-accent` chip vs a previewed indicator), and in the indicator itself.
    linkStyle: {
      // A ghost-button chip, centered in the bar, with a soft-capped brand underline dropped
      // onto the bar's bottom rule. The Koala default; every existing bar keeps this look.
      // The chip lives here, not on the base link, so `underline` never has to cancel it (a
      // `dark:hover:` class survives a plain `hover:bg-transparent` in tailwind-merge). On dark
      // themes `--accent` reads as a heavy grey block against the near-black ground, so the chip
      // swaps to a faint translucent foreground tint: a step quieter, and it tracks whatever
      // surface the bar sits on (floating card, transparent hero).
      pill: {
        link: [
          "hover:bg-accent data-[state=open]:bg-accent",
          "dark:hover:bg-foreground/8 dark:data-[state=open]:bg-foreground/8",
        ],
      },
      // A tab: the link box fills the bar's height so its indicator can weld to the bar's
      // bottom edge, and the indicator is a square, full-box-width 3px foreground stroke.
      underline: {
        // The nav has to stretch before its links can be `h-full`; the tabs butt up against
        // each other so their indicators read as one strip.
        nav: "items-stretch gap-0 self-stretch",
        link: [
          "h-full rounded-none px-2",
          // No rounded hover chip (that lives on `pill`): a full-bar-height block reads far too
          // heavy. Hover previews the indicator in `border` instead, the standard tab affordance.
          // The box already clears 40px on both axes, so the hit-area shim is redundant.
          "before:hidden",
          // Square, spanning the whole box, flush with the bar's bottom rule. `bottom-0`
          // needs no density offset, which is exactly why the pill's offsets moved down into
          // compoundVariants: the two indicators never fight over the same declaration.
          "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-transparent",
          "after:transition-colors after:duration-fast after:ease-out",
          "hover:after:bg-border data-[state=open]:after:bg-border",
          // The tab indicator is ink, not brand: a full-width 3px stroke welded to the bar's
          // rule is already the loudest mark in the row, and in brand it competes with the
          // page's real accents (the primary CTA sits two links away). `bg-foreground` reads
          // white on dark/moonlight and near-black on light/cream, so the current tab is the
          // highest-contrast mark in the bar in every theme. The `pill` underline stays brand:
          // a soft-capped stroke under a centered chip is small enough to want the color.
          "data-[active=true]:after:inset-x-0 data-[active=true]:after:h-[3px] data-[active=true]:after:rounded-none data-[active=true]:after:bg-foreground",
          "data-[active=true]:hover:after:bg-foreground",
          // Pressing must not peel the indicator off the bar's edge, so the tap dims the
          // label rather than scaling the box (the one place the DS scale-on-press backs off).
          "active:scale-100 active:text-foreground/60",
        ],
      },
    },
    // Density is Koala's cross-cutting spacing axis (see lib/density.tsx). For Navbar it
    // sets the bar height; horizontal padding pairs with the variant in compoundVariants
    // (a floating card wants tighter gutters than an edge bar). `comfortable` is the
    // marketing default.
    density: {
      comfortable: { inner: "h-16" },
      compact: { inner: "h-14" },
    },
    // Where the inline links hand over to the hamburger. `md` (768px) suits a bar with a handful
    // of links; a marketing bar carrying six links plus two actions runs out of row well before
    // that, so it collapses at `lg` (1024px) instead of overflowing or wrapping. One switch moves
    // all three parts together: the inline nav, the toggle and the disclosed panel.
    collapseAt: {
      md: {},
      lg: {
        nav: "md:hidden lg:flex",
        toggle: "md:inline-flex lg:hidden",
        mobileMenu: "md:flex lg:hidden",
      },
    },
    // Docked into an app shell's top band (`LayoutTopbar`), the Linear/Vercel read. The shell owns
    // the surface there: the band sits on the recessed canvas and the seam under it is the sheet's
    // own top hairline, so the bar paints no fill and draws no bottom rule of its own (a second
    // line would stack on the seam and read as 2px). It also drops the marketing column: an app
    // bar spans the window, its brand on the left edge and its account cluster on the right.
    //
    // Declared after `variant` so its `border-b-0` wins the merge over `full`'s rule. Like the
    // Sidebar's `docked`, it is inherited from the shell through `NavbarShellContext`, so a bar
    // dropped into a `LayoutTopbar` needs no props and no className overrides.
    docked: {
      true: { root: "border-b-0 bg-transparent", inner: "max-w-none" },
      false: {},
    },
  },
  compoundVariants: [
    // 24px, then 32px from `sm`: the marketing gutter `SectionContainer` uses, so the bar's content
    // edge lands on the same x as every section below it.
    { variant: "full", density: "comfortable", className: { inner: "px-6 sm:px-8" } },
    { variant: "full", density: "compact", className: { inner: "px-4" } },
    { variant: "floating", density: "comfortable", className: { inner: "px-4" } },
    { variant: "floating", density: "compact", className: { inner: "px-3" } },
    // The pill indicator's offset reaches from the centered h-9 link down to the bar's bottom
    // rule: (64 − 36) / 2 = 14px comfortable, (56 − 36) / 2 = 10px compact. Scoped to `pill`
    // so the `underline` tab (already full height, pinned at `bottom-0`) never inherits it.
    {
      linkStyle: "pill",
      density: "comfortable",
      className: { link: "data-[active=true]:after:-bottom-[14px]" },
    },
    {
      linkStyle: "pill",
      density: "compact",
      className: { link: "data-[active=true]:after:-bottom-[10px]" },
    },
    // Floating: the inner card carries the chrome, so it owns the lift. Rest borderless and
    // flat; bring the border and shadow-lg in together once scrolled.
    {
      variant: "floating",
      elevateOnScroll: true,
      className: {
        inner: [
          "border-transparent shadow-none transition-[box-shadow,border-color] duration-base ease-out",
          "group-data-[scrolled]/navbar:border-border group-data-[scrolled]/navbar:shadow-lg",
        ],
      },
    },
    // Full: the edge bar rests as bare background (bottom rule hidden) and brings ONLY its
    // bottom stroke in on scroll: no shadow, just a hairline rule that separates the header
    // from the content sliding beneath it. (The floating card, by contrast, lifts with a shadow.)
    {
      variant: "full",
      elevateOnScroll: true,
      className: {
        root: [
          "border-transparent transition-[border-color] duration-base ease-out",
          "data-[scrolled]:border-border",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "full",
    linkStyle: "pill",
    density: "comfortable",
    elevateOnScroll: false,
    collapseAt: "md",
    docked: false,
  },
})

type NavbarSlots = ReturnType<typeof navbarVariants>
const [NavbarProvider, useNavbarContext] = createContext<{
  slots: NavbarSlots
  open: boolean
  setOpen: (open: boolean) => void
}>("Navbar")

/**
 * Shell bridge, the top-band twin of `SidebarShellContext`. An app shell (the DS `Layout`, through
 * `LayoutTopbar`) publishes whether the bars inside it are `docked` on the shell's own surface, and
 * a `Navbar` reads it as a *default*:
 *
 *   <LayoutTopbar>
 *     <Navbar>…</Navbar>      // docked: no fill, no bottom rule, full-width row
 *   </LayoutTopbar>
 *
 * An explicit `docked` prop still wins. `null` (no shell) is the ordinary case, a standalone bar,
 * which is why this is a plain context with a default rather than the throwing helper.
 */
export const NavbarShellContext = React.createContext<{ docked?: boolean } | null>(null)

export interface NavbarProps
  extends Omit<React.ComponentProps<"header">, "onChange">,
    VariantProps<typeof navbarVariants> {
  /** Controlled open state for the mobile disclosure. */
  open?: boolean
  /** @default false */
  defaultOpen?: boolean
  /** Notified when the mobile disclosure opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Sit the bar on an app shell's surface instead of painting its own: no fill, no bottom rule,
   * and a full-width row. Inherited from an enclosing `LayoutTopbar`, so you rarely pass it; set
   * `docked={false}` to keep a bar's standalone chrome inside a shell.
   * @default inherited from the shell, else false
   */
  docked?: boolean
}

export function Navbar({
  className,
  variant,
  linkStyle,
  density,
  elevateOnScroll = false,
  collapseAt,
  docked,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: NavbarProps) {
  const shell = React.useContext(NavbarShellContext)
  const isDocked = docked ?? shell?.docked ?? false
  // Density resolves prop > provider > "comfortable"; compute the slots once, every part
  // reads them from context (the Card/Tabs pattern).
  const slots = navbarVariants({
    variant,
    linkStyle,
    density: useDensity(density),
    elevateOnScroll,
    collapseAt,
    docked: isDocked,
  })

  // Uncontrolled by default, controllable when `open` is supplied, the Radix convention.
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange],
  )

  // Scroll elevation: flip `data-scrolled` on once the bar leaves its resting position, so
  // the recipe can lift its border + shadow in. We listen on the nearest scrollable ancestor
  // (falling back to the window) rather than hardcoding `window`, so the same prop works for
  // a page header and for a bar parked inside a scroll container (e.g. a docs preview or an
  // app-shell panel). A 4px threshold debounces the rest position against sub-pixel jitter;
  // the initial read is deferred a frame to avoid a synchronous setState in the effect body;
  // the listener is passive so it never blocks scrolling.
  const headerRef = React.useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    if (!elevateOnScroll) return
    const scrollParent = getScrollParent(headerRef.current)
    const read = () =>
      scrollParent ? scrollParent.scrollTop > 4 : window.scrollY > 4
    const onScroll = () => setScrolled(read())
    const target: Window | HTMLElement = scrollParent ?? window
    const raf = requestAnimationFrame(onScroll)
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      target.removeEventListener("scroll", onScroll)
    }
  }, [elevateOnScroll])

  return (
    <NavbarProvider slots={slots} open={open} setOpen={setOpen}>
      <header
        ref={headerRef}
        data-slot="navbar"
        data-scrolled={elevateOnScroll && scrolled ? "" : undefined}
        className={slots.root({ className })}
        {...props}
      >
        {children}
      </header>
    </NavbarProvider>
  )
}

/** Nearest ancestor that actually scrolls vertically, or null when the window is the scroller. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el
    el = el.parentElement
  }
  return null
}

/**
 * The max-width content row. Place `NavbarBrand`, `NavbarNav`, `NavbarSpacer`,
 * `NavbarActions`, and `NavbarMobileToggle` inside it.
 */
export function NavbarInner({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useNavbarContext("NavbarInner")
  return <div data-slot="navbar-inner" className={slots.inner({ className })} {...props} />
}

export interface NavbarBrandProps extends React.ComponentProps<"a"> {
  /** Render the child as the brand (Radix Slot), e.g. a Next.js `<Link>`. */
  asChild?: boolean
}

export function NavbarBrand({ className, asChild = false, ...props }: NavbarBrandProps) {
  const { slots } = useNavbarContext("NavbarBrand")
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="navbar-brand" className={slots.brand({ className })} {...props} />
}

export function NavbarNav({ className, ...props }: React.ComponentProps<"nav">) {
  const { slots } = useNavbarContext("NavbarNav")
  return (
    <nav
      data-slot="navbar-nav"
      aria-label={props["aria-label"] ?? "Main"}
      className={slots.nav({ className })}
      {...props}
    />
  )
}

export interface NavbarLinkProps extends Omit<React.ComponentProps<"a">, "ref"> {
  /** Render the child as the link (Radix Slot), e.g. a Next.js `<Link>` or a menu trigger. */
  asChild?: boolean
  /**
   * Marks the link for the current page: adds the active indicator (a soft-capped brand
   * underline under `pill`, a square ink stroke under `underline`) and full-strength text.
   */
  active?: boolean
}

export function NavbarLink({
  className,
  asChild = false,
  active = false,
  ...props
}: NavbarLinkProps) {
  const { slots } = useNavbarContext("NavbarLink")
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="navbar-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={slots.link({ className })}
      {...props}
    />
  )
}

export interface NavbarActionsProps extends React.ComponentProps<"div"> {
  /**
   * Control height for the block. A navbar's controls are the compact tier: they share a slim bar with the links. Imposed on the children (see lib/density.tsx) so each
   * control need not carry a `size`; an explicit one still wins. @default "sm"
   */
  size?: ControlSize
}

export function NavbarActions({ className, size = "sm", children, ...props }: NavbarActionsProps) {
  const { slots } = useNavbarContext("NavbarActions")
  return (
    <div
      data-slot="navbar-actions"
      data-control-size={size}
      className={slots.actions({ className })}
      {...props}
    >
      <ControlSizeProvider size={size}>{children}</ControlSizeProvider>
    </div>
  )
}

export interface NavbarSearchProps extends Omit<InputRootProps, "children"> {
  /** @default "Search" */
  placeholder?: string
  /** Props forwarded to the underlying `<input>` (value, onChange, name…). */
  inputProps?: InputFieldProps
  /** Trailing content inside the field, e.g. a `<Kbd>⌘K</Kbd>` hint. */
  children?: React.ReactNode
}

/**
 * A search field tuned for the bar: the DS `Input` with a leading magnifier and a sensible
 * default width. Built for the "input in middle" marketing pattern and product app shells
 * (give it `flex-1` to fill the center, or a `bg-muted border-transparent` className for the
 * filled-pill look). It is the standard `Input`, so it inherits Field wiring, sizes, and
 * focus ring. No bespoke search styling.
 */
export function NavbarSearch({
  className,
  placeholder = "Search",
  size = "sm",
  inputProps,
  children,
  ...props
}: NavbarSearchProps) {
  return (
    <InputRoot
      data-slot="navbar-search"
      size={size}
      className={cn("w-full min-w-40 max-w-xs", className)}
      {...props}
    >
      <InputPrefix>
        <MagnifyingGlass weight="bold" />
      </InputPrefix>
      <InputField type="search" placeholder={placeholder} aria-label={placeholder} {...inputProps} />
      {children}
    </InputRoot>
  )
}

/** A flexible gap that pushes the groups on either side of it apart. */
export function NavbarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="navbar-spacer" aria-hidden className={cn("flex-1", className)} {...props} />
}

export interface NavbarMobileToggleProps extends React.ComponentProps<"button"> {
  /** Accessible name for the toggle. @default "Toggle menu" */
  label?: string
}

/** Hamburger that opens/closes the mobile disclosure; only visible below md. */
export function NavbarMobileToggle({
  className,
  label = "Toggle menu",
  onClick,
  ...props
}: NavbarMobileToggleProps) {
  const { slots, open, setOpen } = useNavbarContext("NavbarMobileToggle")
  return (
    <button
      type="button"
      data-slot="navbar-mobile-toggle"
      aria-label={label}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={(event) => {
        setOpen(!open)
        onClick?.(event)
      }}
      className={slots.toggle({ className })}
      {...props}
    >
      {/* polish (#7): cross-fade the two glyphs instead of toggling visibility; both stay
          mounted, one scales/fades out as the other scales/fades in. Driven by motion
          tokens (no raw cubic-bezier, per the DS rule). */}
      <span aria-hidden className="relative inline-flex size-5 items-center justify-center">
        <List
          weight="bold"
          className={cn(
            "absolute transition-[transform,opacity] duration-fast ease-out motion-reduce:transition-none",
            open ? "scale-[0.25] opacity-0" : "scale-100 opacity-100",
          )}
        />
        <X
          weight="bold"
          className={cn(
            "absolute transition-[transform,opacity] duration-fast ease-out motion-reduce:transition-none",
            open ? "scale-100 opacity-100" : "scale-[0.25] opacity-0",
          )}
        />
      </span>
    </button>
  )
}

/**
 * The disclosed mobile panel: render the same links here, stacked. Mounts only while
 * open, so it stays out of the tab order when closed.
 */
export function NavbarMobileMenu({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, open } = useNavbarContext("NavbarMobileMenu")
  if (!open) return null
  return <div data-slot="navbar-mobile-menu" className={slots.mobileMenu({ className })} {...props} />
}

export interface NavbarMobileLinkProps extends Omit<React.ComponentProps<"a">, "ref"> {
  asChild?: boolean
  active?: boolean
}

export function NavbarMobileLink({
  className,
  asChild = false,
  active = false,
  ...props
}: NavbarMobileLinkProps) {
  const { slots } = useNavbarContext("NavbarMobileLink")
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="navbar-mobile-link"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={slots.mobileLink({ className })}
      {...props}
    />
  )
}
