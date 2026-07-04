"use client"

import * as React from "react"
import { List } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity, type Density } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "@/components/ui/drawer"

/**
 * Layout: the application/page shell. A multi-part component: one `tv` recipe with `slots`,
 * density flowing to every part through React Context (see docs/ARCHITECTURE.md §2).
 *
 * Two `variant`s share the same parts:
 *  - `panel` (default): the SaaS app-shell with the signature sidebar indent (below).
 *  - `flat`: the docs/reading layout: content flat on the canvas, columns divided by hairlines,
 *    with an optional `LayoutAside` right rail for an "on this page" nav (a three-column docs shell).
 *
 * The headline idea of `panel` is the **sidebar indent**: the content sits inside an elevated,
 * rounded panel (`LayoutContent`) inset from the page canvas on every side, so the
 * `bg-background` page reads as a gutter framing the panel; the sidebar lives in that
 * gutter. Inside the panel, `LayoutContainer` centers a max-width column whose
 * `LayoutHeader` carries the breadcrumbs.
 *
 *   <Layout>
 *     <LayoutSidebar>…nav…</LayoutSidebar>
 *     <LayoutContent>           // the inset, rounded, elevated panel ("the indent")
 *       <LayoutContainer>       // centered max-width column
 *         <LayoutHeader>        // breadcrumbs row at the top
 *           <Breadcrumb>…</Breadcrumb>
 *         </LayoutHeader>
 *         …page content…
 *       </LayoutContainer>
 *     </LayoutContent>
 *   </Layout>
 *
 * Height: defaults to `min-h-svh` so the shell fills the viewport and grows with the
 * page. For a panel that scrolls independently (sidebar pinned), give the root a fixed
 * height: `<Layout className="h-svh overflow-hidden">`.
 */
export const layoutVariants = tv({
  slots: {
    root: "flex min-h-svh w-full bg-background",
    // The rail lives in the canvas gutter and pins to the viewport so it stays put while
    // the content panel scrolls. Hidden below `lg`; drive a mobile drawer from there.
    sidebar: "sticky top-0 hidden h-svh w-64 shrink-0 flex-col lg:flex",
    // The content region. `min-h-0` lets it become a scroll container when the root is given
    // a fixed height. Its *surface* treatment is set per `variant` below. `panel` paints the
    // elevated indent card (with the `--surface` contract); `flat` stays transparent on the
    // page canvas. polish: in `panel`, a shadow over a hard border gives depth (the ring is
    // the hairline that keeps it crisp where colors tie, e.g. white-on-white in light).
    content: "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto",
    // The right rail: a sticky column for a table-of-contents / "on this page" nav. Hidden
    // below `xl`. Mostly paired with the `flat` (docs) variant, which gives it a left hairline.
    // It renders an <aside> landmark, so put a <nav> (not another aside) inside it.
    aside: "sticky top-0 hidden h-svh w-64 shrink-0 overflow-y-auto xl:block",
    // The max-width column. Width is a local prop on LayoutContainer (see below).
    container: "mx-auto w-full",
    // The top row of the column: breadcrumbs on the left, optional actions on the right.
    header: "flex items-center justify-between gap-4",
    // The mobile bar: a slim sticky band shown only below `lg` (where the sidebar is hidden).
    // It holds the LayoutMobileSidebar trigger and a brand lockup. Lives at the top of
    // LayoutContent so it pins to the panel and its corners clip to the panel rounding.
    mobileBar:
      "sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/85 backdrop-blur-sm supports-[backdrop-filter]:bg-card/75 lg:hidden",
    // The hamburger trigger inside the mobile bar; opens the sidebar drawer. Hidden at `lg`
    // where the rail is always visible. size-10 keeps a 40px hit target (polish #16).
    sidebarTrigger: [
      "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md",
      "text-muted-foreground outline-none transition duration-fast ease-out lg:hidden",
      "hover:bg-accent hover:text-foreground active:scale-[0.96]",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      "[&>svg]:size-5 [&>svg]:shrink-0",
    ],
    // PageHeader: the title band. Heading + supporting text on the left, actions on the
    // right; stacks on narrow screens, splits into a row at `sm`. `items-start` keeps a tall
    // action cluster (e.g. a search + buttons) top-aligned with the heading.
    pageHeader: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
    pageHeaderContent: "flex min-w-0 flex-col gap-1",
    pageHeaderHeading: "font-semibold tracking-tight text-pretty text-foreground",
    pageHeaderDescription: "max-w-2xl text-sm text-pretty text-muted-foreground",
    pageHeaderActions: "flex shrink-0 flex-wrap items-center gap-2",
  },
  variants: {
    // The two shells. `panel` is the SaaS app-shell: the signature sidebar indent. `flat`
    // is the docs/reading layout: content flat on the canvas, columns divided by hairlines.
    variant: {
      // Content sits in an elevated, rounded card inset from the canvas (`m-2`), the sidebar
      // living in the surrounding `bg-background` gutter; `lg:ml-0` drops the left inset so the
      // panel meets the rail. `--surface` is the DS contract for "what surface am I sitting on"
      // (same one Dialog sets to `--popover`); `--card` makes every opaque, surface-aware child
      // (Input, Select, a minimal DataTable) rebase onto the panel and read as transparent
      // instead of painting a `--background` block over the lighter card.
      panel: {
        content:
          "m-2 rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border [--surface:var(--card)] lg:ml-0",
      },
      // Content is flat on the page canvas; the sidebar/aside are divided from it by hairlines
      // rather than a floating panel. The page scrolls as a whole (content is `overflow-visible`,
      // not its own scroll container), so a window scroll-spy / TOC works. `--surface` stays the
      // page background so surface-aware children still blend.
      flat: {
        content: "overflow-visible [--surface:var(--background)]",
        sidebar: "border-r border-border",
        aside: "border-l border-border",
        mobileBar: "bg-background/85 supports-[backdrop-filter]:bg-background/75",
        sidebarTrigger: "focus-visible:ring-offset-background",
      },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). Here it tunes the
    // rail padding, the column's inner padding, and the header's bottom gap. `compact` is
    // the Koala default (app UI); `comfortable` is the roomier marketing alternative.
    //
    // The column's *horizontal* padding is responsive (the canonical `px-4 sm:px-6 lg:px-8`
    // idiom) so content hugs the edges on phones and breathes on wide desktops; the gutter
    // grows with the viewport instead of being a single fixed value. Vertical padding stays
    // constant per density to keep a steady reading rhythm down the page.
    density: {
      compact: {
        sidebar: "gap-1 p-3",
        container: "px-4 py-6 sm:px-6 lg:px-8",
        aside: "px-6 py-6",
        header: "mb-6",
        mobileBar: "h-14 px-3",
        pageHeader: "mb-6",
        pageHeaderHeading: "text-2xl",
      },
      comfortable: {
        sidebar: "gap-1 p-4",
        container: "px-6 py-10 sm:px-8 lg:px-10",
        aside: "px-8 py-10",
        header: "mb-8",
        mobileBar: "h-16 px-4",
        pageHeader: "mb-8",
        pageHeaderHeading: "text-3xl",
      },
    },
    // Sticky header. When set, `LayoutHeader` pins to the top of the scrolling panel and
    // bleeds to the column's edges with a translucent, blurred fill. The negative margins
    // match the container's responsive horizontal padding (and cancel its top padding so the
    // bar sits flush). The exact values depend on density, so they live in the compounds.
    sticky: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      density: "compact",
      sticky: true,
      class: {
        header:
          "sticky top-0 z-20 -mx-4 -mt-6 border-b border-border bg-card/85 px-4 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/75 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
      },
    },
    {
      density: "comfortable",
      sticky: true,
      class: {
        header:
          "sticky top-0 z-20 -mx-6 -mt-10 border-b border-border bg-card/85 px-6 py-5 backdrop-blur-sm supports-[backdrop-filter]:bg-card/75 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10",
      },
    },
    // Flat's sticky header blurs over the page canvas, not the card. Listed after the density
    // compounds so its `bg-background` wins the tailwind-merge over their `bg-card`.
    {
      variant: "flat",
      sticky: true,
      class: {
        header: "bg-background/85 supports-[backdrop-filter]:bg-background/75",
      },
    },
  ],
  defaultVariants: {
    variant: "panel",
    density: "compact",
    sticky: false,
  },
})

type LayoutSlots = ReturnType<typeof layoutVariants>
// The resolved density rides along in context so `LayoutHeader` can recompute its own slots
// for a per-instance `sticky` flag (the same trick `SidebarSwitcher` uses for `variant`).
const [LayoutProvider, useLayoutContext] = createContext<{
  slots: LayoutSlots
  density: Density
  variant: VariantProps<typeof layoutVariants>["variant"]
}>("Layout")

export interface LayoutProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof layoutVariants> {}

/**
 * Parts are exported individually (not as `Layout.Sidebar` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary; only named exports
 * do. Density resolves once at the root (prop > provider > "compact") and the computed
 * slots flow to every part through context.
 */
export function Layout({ className, density, variant, ...props }: LayoutProps) {
  const resolved = useDensity(density)
  const slots = layoutVariants({ density: resolved, variant })
  return (
    <LayoutProvider slots={slots} density={resolved} variant={variant}>
      <div data-slot="layout" className={slots.root({ className })} {...props} />
    </LayoutProvider>
  )
}

/**
 * The left column: a sticky structural rail. Renders a plain `<div>` (not a landmark): the
 * navigation landmark comes from its content (the DS `Sidebar`, itself an `<aside>`, or a
 * `<nav>`), so nesting one here would double the complementary region.
 */
export function LayoutSidebar({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useLayoutContext("LayoutSidebar")
  return <div data-slot="layout-sidebar" className={slots.sidebar({ className })} {...props} />
}

/**
 * The right column: a sticky rail for an "on this page" / table-of-contents nav, hidden below
 * `xl`. Renders the `<aside>` complementary landmark itself, so place a `<nav>` (the TOC) inside
 * it. Pairs with the `flat` variant for the classic three-column docs layout.
 */
export function LayoutAside({ className, ...props }: React.ComponentProps<"aside">) {
  const { slots } = useLayoutContext("LayoutAside")
  return <aside data-slot="layout-aside" className={slots.aside({ className })} {...props} />
}

export function LayoutContent({ className, ...props }: React.ComponentProps<"main">) {
  const { slots } = useLayoutContext("LayoutContent")
  return <main data-slot="layout-content" className={slots.content({ className })} {...props} />
}

/** The centered max-width column. `width` is a part-local axis, so it stays out of the
 * shared recipe; the values are complete class strings the Tailwind compiler can see. */
const layoutContainerWidths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const

export interface LayoutContainerProps extends React.ComponentProps<"div"> {
  /** Max width of the content column. @default "default" */
  width?: keyof typeof layoutContainerWidths
}

export function LayoutContainer({
  className,
  width = "default",
  ...props
}: LayoutContainerProps) {
  const { slots } = useLayoutContext("LayoutContainer")
  return (
    <div
      data-slot="layout-container"
      className={slots.container({ className: cn(layoutContainerWidths[width], className) })}
      {...props}
    />
  )
}

export interface LayoutHeaderProps extends React.ComponentProps<"div"> {
  /**
   * Pin the header to the top of the scrolling panel with a translucent, blurred fill that
   * bleeds to the column edges. Use it for a persistent breadcrumbs/actions bar. @default false
   */
  sticky?: boolean
}

/**
 * The top row of the column: breadcrumbs on the left, optional actions on the right. With
 * `sticky`, it stays pinned as the panel scrolls. Slots are recomputed here (rather than read
 * from context) so the per-instance `sticky` flag can fold in, while density flows from the root.
 */
export function LayoutHeader({ className, sticky = false, ...props }: LayoutHeaderProps) {
  const { density, variant } = useLayoutContext("LayoutHeader")
  const slots = layoutVariants({ density, variant, sticky })
  return <div data-slot="layout-header" className={slots.header({ className })} {...props} />
}

/**
 * LayoutMobileBar: a slim sticky bar shown only below `lg`, where the sidebar is hidden.
 * Place it as the first child of `LayoutContent` (above `LayoutContainer`); drop a
 * `LayoutMobileSidebar` and a brand lockup inside it.
 */
export function LayoutMobileBar({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useLayoutContext("LayoutMobileBar")
  return <div data-slot="layout-mobile-bar" className={slots.mobileBar({ className })} {...props} />
}

export interface LayoutMobileSidebarProps {
  /** The rail, typically the DS `Sidebar`. It fills the drawer panel. */
  children: React.ReactNode
  /** Controlled open state (passes through to the underlying Radix Dialog). */
  open?: boolean
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean
  /** Notified when the drawer opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Accessible label for the hamburger trigger. @default "Open navigation" */
  triggerLabel?: string
  /** Accessible name for the drawer dialog (visually hidden). @default "Navigation" */
  title?: string
  /** Class for the hamburger trigger button. */
  triggerClassName?: string
  /** Class for the drawer panel. */
  contentClassName?: string
}

/**
 * LayoutMobileSidebar: the mobile counterpart to `LayoutSidebar`. Renders a hamburger
 * trigger (hidden at `lg`) that opens the rail in a left `Drawer`, so the same `Sidebar`
 * serves desktop and mobile. Self-contained state by default; pass `open`/`onOpenChange`
 * to control it.
 *
 *   <LayoutMobileBar>
 *     <LayoutMobileSidebar>
 *       <Sidebar className="h-full w-full border-r-0 bg-transparent">…</Sidebar>
 *     </LayoutMobileSidebar>
 *     <Brand />
 *   </LayoutMobileBar>
 *
 * The drawer closes on Escape, overlay tap, and swipe; to close it on navigation, wrap the
 * destination `SidebarItem`s in `DrawerClose asChild` (route changes unmount it regardless).
 */
export function LayoutMobileSidebar({
  children,
  open,
  defaultOpen,
  onOpenChange,
  triggerLabel = "Open navigation",
  title = "Navigation",
  triggerClassName,
  contentClassName,
}: LayoutMobileSidebarProps) {
  const { slots } = useLayoutContext("LayoutMobileSidebar")
  return (
    <Drawer open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          className={slots.sidebarTrigger({ className: triggerClassName })}
        >
          <List weight="bold" />
        </button>
      </DrawerTrigger>
      {/* Side sheet sized to a rail; `p-0` lets the Sidebar own the chrome edge-to-edge. */}
      <DrawerContent
        side="left"
        showHandle={false}
        className={cn("w-72 max-w-[85vw] p-0", contentClassName)}
      >
        {/* Names the dialog for screen readers without painting a visible title. */}
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        {children}
      </DrawerContent>
    </Drawer>
  )
}

/**
 * PageHeader: the page title band: heading + supporting text on the left, an action cluster
 * on the right. Sits inside `LayoutContainer`, below an optional `LayoutHeader` breadcrumbs
 * row. Composition, not configuration: stack the parts you need.
 *
 *   <PageHeader>
 *     <PageHeaderContent>
 *       <PageHeaderHeading>Invoices</PageHeaderHeading>
 *       <PageHeaderDescription>Every charge across your workspace.</PageHeaderDescription>
 *     </PageHeaderContent>
 *     <PageHeaderActions>
 *       <Button variant="outline">Export</Button>
 *       <Button>New invoice</Button>
 *     </PageHeaderActions>
 *   </PageHeader>
 */
export function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useLayoutContext("PageHeader")
  return <div data-slot="page-header" className={slots.pageHeader({ className })} {...props} />
}

/** The left column of a `PageHeader`: wraps the heading and its supporting text. */
export function PageHeaderContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useLayoutContext("PageHeaderContent")
  return (
    <div data-slot="page-header-content" className={slots.pageHeaderContent({ className })} {...props} />
  )
}

/** The page title. Renders an `<h1>` by default; pass `as`-style overrides via `className`. */
export function PageHeaderHeading({ className, ...props }: React.ComponentProps<"h1">) {
  const { slots } = useLayoutContext("PageHeaderHeading")
  return <h1 data-slot="page-header-heading" className={slots.pageHeaderHeading({ className })} {...props} />
}

/** The supporting line under the title. */
export function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useLayoutContext("PageHeaderDescription")
  return (
    <p
      data-slot="page-header-description"
      className={slots.pageHeaderDescription({ className })}
      {...props}
    />
  )
}

/** The trailing action cluster: buttons, a search field, a menu. Pushed right at `sm`. */
export function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useLayoutContext("PageHeaderActions")
  return (
    <div data-slot="page-header-actions" className={slots.pageHeaderActions({ className })} {...props} />
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * SplitLayout: the full-viewport two-pane shell
 *
 * A second family in this module (its own `tv` recipe, its own context): the
 * classic auth / onboarding / marketing screen that fills the viewport
 * (`min-h-svh`) and splits into two columns at `lg`. One pane carries the
 * content (a centered form column), the other is a full-bleed media panel.
 *
 *   <SplitLayout>
 *     <SplitPane>                 // content side, centers a column
 *       <SplitPaneBody>           // the centered max-width column
 *         …brand · heading · form…
 *       </SplitPaneBody>
 *     </SplitPane>
 *     <SplitMedia>                // full-bleed image side; hidden below lg
 *       <img className="absolute inset-0 size-full object-cover" … />
 *       <SplitMediaOverlay>…caption / testimonial…</SplitMediaOverlay>
 *     </SplitMedia>
 *   </SplitLayout>
 *
 * Which side the media sits on is just DOM order: put `SplitMedia` first for an
 * image-left layout. Below `lg` the grid collapses to one column, and `SplitMedia`
 * (hidden by default) drops away, so the content pane fills the screen on phones.
 * ──────────────────────────────────────────────────────────────────────────── */
export const splitLayoutVariants = tv({
  slots: {
    // The grid. One column on phones; two at `lg`, divided per `ratio`. Each cell
    // stretches to the row height, so both panes are full-height (`min-h-svh`).
    root: "grid min-h-svh w-full grid-cols-1 bg-background",
    // The content side. A flex column whose body centers itself via `m-auto`, so a
    // brand lockup placed above the body pins to the top and a footer below it pins
    // to the bottom while the form stays optically centered. Padding is per density.
    pane: "relative flex flex-col",
    // The centered column inside the pane. Width is a part-local prop (see below).
    paneBody: "m-auto flex w-full flex-col",
    // The media side: a full-bleed surface for an `<img>`/video (place it
    // `absolute inset-0 size-full object-cover`). Hidden below `lg`; `bg-muted`
    // shows through while an image loads. `isolate` keeps the overlay's blend local.
    media: "relative isolate hidden overflow-hidden bg-muted lg:block",
    // An optional scrim over the media for a caption or testimonial. A dark
    // bottom-up gradient keeps white text legible on any photo (a scrim is always
    // dark regardless of theme, so the literal black/white here is intentional).
    mediaOverlay:
      "absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-8 text-white",
  },
  variants: {
    // How the two columns divide at `lg`. `even` is the 50/50 default; `start`/`end`
    // give the leading / trailing pane the larger share (a 3:2 split). Pair `end`
    // with an image-left layout to let a tall hero photo dominate, for instance.
    ratio: {
      even: { root: "lg:grid-cols-2" },
      start: { root: "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" },
      end: { root: "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" },
    },
    // Density tunes the content pane's padding: the breathing room around the form
    // column. `compact` is the Koala default; `comfortable` is the roomier marketing
    // alternative. Horizontal padding is responsive so the column hugs phone edges.
    density: {
      compact: { pane: "px-6 py-10 sm:px-8" },
      comfortable: { pane: "px-8 py-12 sm:px-12 lg:px-16" },
    },
  },
  defaultVariants: {
    ratio: "even",
    density: "compact",
  },
})

type SplitLayoutSlots = ReturnType<typeof splitLayoutVariants>
const [SplitLayoutProvider, useSplitLayoutContext] = createContext<{
  slots: SplitLayoutSlots
}>("SplitLayout")

export interface SplitLayoutProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof splitLayoutVariants> {}

/**
 * SplitLayout: the root grid. Density resolves once here (prop > provider >
 * "compact") and the computed slots flow to every part through context.
 */
export function SplitLayout({ className, ratio, density, ...props }: SplitLayoutProps) {
  const resolved = useDensity(density)
  const slots = splitLayoutVariants({ ratio, density: resolved })
  return (
    <SplitLayoutProvider slots={slots}>
      <div data-slot="split-layout" className={slots.root({ className })} {...props} />
    </SplitLayoutProvider>
  )
}

/**
 * SplitPane: the content side. A padded flex column; place a `SplitPaneBody`
 * inside it to get a centered max-width column. Renders a plain `<div>` so you can
 * own the landmark (wrap your form in `<main>`, etc.).
 */
export function SplitPane({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSplitLayoutContext("SplitPane")
  return <div data-slot="split-pane" className={slots.pane({ className })} {...props} />
}

/** The centered column inside a `SplitPane`. `width` is a part-local axis (complete
 *  class strings the compiler can see), so it stays out of the shared recipe. */
const splitPaneBodyWidths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const

export interface SplitPaneBodyProps extends React.ComponentProps<"div"> {
  /** Max width of the centered content column. @default "sm" */
  width?: keyof typeof splitPaneBodyWidths
}

export function SplitPaneBody({ className, width = "sm", ...props }: SplitPaneBodyProps) {
  const { slots } = useSplitLayoutContext("SplitPaneBody")
  return (
    <div
      data-slot="split-pane-body"
      className={slots.paneBody({ className: cn(splitPaneBodyWidths[width], className) })}
      {...props}
    />
  )
}

/**
 * SplitMedia: the full-bleed media side, hidden below `lg`. Drop an
 * `<img>`/`<video>` positioned `absolute inset-0 size-full object-cover` inside,
 * optionally with a `SplitMediaOverlay`. It carries no semantics, so add `aria-hidden`
 * when it is purely decorative.
 */
export function SplitMedia({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSplitLayoutContext("SplitMedia")
  return <div data-slot="split-media" className={slots.media({ className })} {...props} />
}

/** SplitMediaOverlay: a bottom-anchored scrim over `SplitMedia` for a caption or
 *  testimonial. Renders white text over a dark gradient so it reads on any photo. */
export function SplitMediaOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useSplitLayoutContext("SplitMediaOverlay")
  return (
    <div data-slot="split-media-overlay" className={slots.mediaOverlay({ className })} {...props} />
  )
}
