"use client"

import * as React from "react"
import type { Icon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * CookieConsent: the GDPR/ePrivacy consent surface, in two coordinated pieces over one
 * shared state: a non-blocking **banner** (CookieBanner) and a **preferences dialog**
 * (CookiePreferences) where each cookie category gets its own Switch. Multi-part, so one
 * `tv` recipe with `slots` styles every piece and the consent state flows through a typed
 * React Context, never prop-drilled (see docs/ARCHITECTURE.md).
 *
 * The root owns the category booleans and the three coordinated actions (accept-all /
 * reject-all / save). Both surfaces read the same state: toggling a category in the dialog
 * and clicking "Accept all" in the banner mutate one source of truth, and either choice
 * dismisses the banner. CookieConsent composes the *real DS parts*: the toggles are the DS
 * Switch, the actions are the DS Button, the dialog is the DS Dialog, the "Always on" marker
 * is the DS Badge, so nothing is re-styled inline and the look only ever drifts on purpose.
 *
 * `"use client"` because it owns interactive consent state and every part reads
 * density/selection from Context. The banner animates in *and out* (tw-animate-css
 * `animate-in`/`animate-out`, driven by a `data-state` flag), so a choice dismisses it with a
 * soft fade + drift rather than an instant pop; it's a complementary region (`role="region"`),
 * not a modal: it never traps focus or blocks the page; only the preferences dialog (Radix) does.
 */
export const cookieConsentVariants = tv({
  slots: {
    // The banner is a floating popover-colored surface. `[--surface:var(--popover)]` exposes
    // it so any nested DS control blends with the banner, not the page (the --surface contract).
    banner: [
      "fixed z-50 border border-border-soft bg-popover text-popover-foreground shadow-lg",
      "[--surface:var(--popover)]",
      // Enter and exit are both keyframed via tw-animate-css, gated on the `data-state` the
      // CookieBanner stamps (open while visible, closed for the one frame before it unmounts).
      // Directional slides live in the `position` variants; the exit is softer than the enter
      // (make-interfaces #6): a gentle fade + short downward drift, never a mirror of the enter.
      "duration-base ease-out",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2",
    ],
    // The content row/column inside the banner (density tunes its gap below).
    bannerBody: "flex w-full",
    // A small leading cookie glyph, optically aligned to the first line of the title.
    bannerIcon: "mt-0.5 shrink-0 text-foreground [&_svg]:size-5",
    // Title + description column.
    bannerContent: "flex min-w-0 flex-1 flex-col gap-1",
    bannerTitle: "text-sm leading-none font-semibold text-foreground",
    bannerDescription: "text-sm text-pretty text-muted-foreground",
    // Action cluster: stacks on the narrowest widths, rows out as space allows.
    bannerActions: "flex shrink-0 flex-wrap items-center gap-2",
    // ── Preferences dialog ──────────────────────────────────────────────────────────
    // One concentric container (rounded-lg inside the dialog's rounded-xl) holding every
    // category row, separated by hairline dividers. `overflow-hidden` clips the rows to the
    // rounded corners; `divide-y` draws the rule between rows (not around the outside).
    list: "flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card",
    // One category row: a leading icon, the label/description column, and the trailing Switch.
    // Flush to the container: the divider, not a per-row border, separates it from its neighbor.
    category: "flex items-start gap-3",
    categoryIcon: "mt-0.5 shrink-0 text-muted-foreground [&_svg]:size-5",
    categoryText: "flex min-w-0 flex-1 flex-col gap-1",
    // Label line pairs the name with the "Always on" Badge for required categories.
    categoryLabelRow: "flex items-center gap-2",
    categoryLabel: "cursor-pointer text-sm font-medium text-foreground",
    categoryDescription: "text-sm text-pretty text-muted-foreground",
    categorySwitch: "mt-0.5 shrink-0",
  },
  variants: {
    // Where the banner anchors. Corner variants are compact floating cards; `bottom` is a
    // full-bleed bar pinned to the bottom edge that lays its content out in a row on wide
    // screens. Each carries its own directional enter so the motion matches the anchor.
    position: {
      bottom: {
        banner: "inset-x-0 bottom-0 rounded-t-2xl border-x-0 border-b-0 data-[state=open]:slide-in-from-bottom-4",
        bannerBody: "mx-auto max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
      },
      "bottom-left": {
        banner:
          "bottom-4 left-4 w-[min(24rem,calc(100vw-2rem))] rounded-xl data-[state=open]:slide-in-from-left-4 data-[state=open]:slide-in-from-bottom-4",
        bannerBody: "flex-col gap-4",
        bannerActions: "[&>button]:flex-1",
      },
      "bottom-right": {
        banner:
          "right-4 bottom-4 w-[min(24rem,calc(100vw-2rem))] rounded-xl data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-bottom-4",
        bannerBody: "flex-col gap-4",
        bannerActions: "[&>button]:flex-1",
      },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). `comfortable` is the
    // marketing default; `compact` tightens padding/gaps for application UI. Never radius/color.
    density: {
      comfortable: { banner: "p-5", category: "gap-3 p-4" },
      compact: { banner: "p-4", category: "gap-2.5 p-3" },
    },
  },
  defaultVariants: {
    position: "bottom-right",
    density: "comfortable",
  },
})

type CookieConsentSlots = ReturnType<typeof cookieConsentVariants>
type CookieDensity = "comfortable" | "compact"
type CookiePreferences = Record<string, boolean>

/** A single declared cookie category. Required categories are locked on (e.g. "Necessary"). */
export interface CookieCategoryDef {
  /** Stable key written into the preferences map. */
  id: string
  /** Human label, e.g. "Analytics". */
  label: string
  /** One-line explanation of what this category enables. */
  description?: string
  /** Locks the toggle on and shows an "Always on" marker (necessary/strictly-required cookies). */
  required?: boolean
  /** Optional leading Phosphor icon for the row. */
  icon?: Icon
}

const [CookieConsentProvider, useCookieConsentContext] = createContext<{
  slots: CookieConsentSlots
  density: CookieDensity
  categories: CookieCategoryDef[]
  prefs: CookiePreferences
  setPreference: (id: string, value: boolean) => void
  acceptAll: () => void
  rejectAll: () => void
  save: () => void
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  bannerVisible: boolean
}>("CookieConsent")

// The banner re-provides its position so the body/actions slots resolve their layout without
// the consumer re-threading it onto every part.
const [CookieBannerProvider, useCookieBannerContext] = createContext<{
  slots: CookieConsentSlots
}>("CookieBanner")

// Initialize the booleans from `defaultValue`, forcing every required category on.
function initPrefs(categories: CookieCategoryDef[], initial?: CookiePreferences): CookiePreferences {
  const base: CookiePreferences = {}
  for (const c of categories) base[c.id] = c.required ? true : (initial?.[c.id] ?? false)
  return base
}

// Required categories can never be off: clamp them whenever prefs are read or committed.
function withRequired(categories: CookieCategoryDef[], prefs: CookiePreferences): CookiePreferences {
  const next = { ...prefs }
  for (const c of categories) if (c.required) next[c.id] = true
  return next
}

// ─── CookieConsent (root) ─────────────────────────────────────────────────────────

export interface CookieConsentProps
  extends Pick<VariantProps<typeof cookieConsentVariants>, "density"> {
  /** The cookie categories to manage, in display order. */
  categories: CookieCategoryDef[]
  /** Controlled preferences map (`{ [id]: boolean }`). Pair with `onValueChange`. */
  value?: CookiePreferences
  /** Uncontrolled initial preferences. Required categories are forced on regardless. */
  defaultValue?: CookiePreferences
  /** Fires whenever a toggle changes, with required categories already clamped on. */
  onValueChange?: (value: CookiePreferences) => void
  /** Fires when the user accepts every category. Persist the returned map. */
  onAcceptAll?: (value: CookiePreferences) => void
  /** Fires when the user rejects all but the required categories. */
  onRejectAll?: (value: CookiePreferences) => void
  /** Fires when the user saves their current selection from the dialog. */
  onSave?: (value: CookiePreferences) => void
  /** Controlled open state for the preferences dialog. */
  open?: boolean
  /** Uncontrolled initial open state for the preferences dialog. @default false */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Start with consent already given (banner hidden). Pass `true` when a stored cookie shows
   * the visitor has already chosen, so the banner only shows to first-time visitors. @default false
   */
  defaultConsented?: boolean
  children?: React.ReactNode
}

export function CookieConsent({
  categories,
  value,
  defaultValue,
  onValueChange,
  onAcceptAll,
  onRejectAll,
  onSave,
  open,
  defaultOpen = false,
  onOpenChange,
  defaultConsented = false,
  density,
  children,
}: CookieConsentProps) {
  const resolvedDensity = useDensity(density)
  const slots = cookieConsentVariants({ density: resolvedDensity })

  // Preferences: controlled or uncontrolled; required categories are always clamped on.
  const isControlled = value !== undefined
  const [internalPrefs, setInternalPrefs] = React.useState(() => initPrefs(categories, defaultValue))
  const prefs = withRequired(categories, isControlled ? value : internalPrefs)

  // Preferences dialog open state: controlled or uncontrolled.
  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const dialogOpen = isOpenControlled ? open : internalOpen

  // Banner visibility: hidden once the visitor has made any choice.
  const [consented, setConsented] = React.useState(defaultConsented)

  function commit(next: CookiePreferences): CookiePreferences {
    const forced = withRequired(categories, next)
    if (!isControlled) setInternalPrefs(forced)
    onValueChange?.(forced)
    return forced
  }

  function setDialogOpen(next: boolean) {
    if (!isOpenControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  function setPreference(id: string, val: boolean) {
    commit({ ...prefs, [id]: val })
  }

  function acceptAll() {
    const next: CookiePreferences = {}
    for (const c of categories) next[c.id] = true
    onAcceptAll?.(commit(next))
    setConsented(true)
    setDialogOpen(false)
  }

  function rejectAll() {
    const next: CookiePreferences = {}
    for (const c of categories) next[c.id] = Boolean(c.required)
    onRejectAll?.(commit(next))
    setConsented(true)
    setDialogOpen(false)
  }

  function save() {
    onSave?.(prefs)
    setConsented(true)
    setDialogOpen(false)
  }

  return (
    <CookieConsentProvider
      slots={slots}
      density={resolvedDensity}
      categories={categories}
      prefs={prefs}
      setPreference={setPreference}
      acceptAll={acceptAll}
      rejectAll={rejectAll}
      save={save}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      bannerVisible={!consented}
    >
      {children}
    </CookieConsentProvider>
  )
}

/** Escape hatch: read/drive the consent state from a custom surface (a footer "Cookie settings" link, an analytics gate). */
export function useCookieConsent() {
  return useCookieConsentContext("useCookieConsent")
}

// ─── CookieBanner ───────────────────────────────────────────────────────────────

export interface CookieBannerProps extends React.ComponentProps<"div"> {
  /** Where the banner anchors. @default "bottom-right" */
  position?: VariantProps<typeof cookieConsentVariants>["position"]
}

export function CookieBanner({ className, position = "bottom-right", children, ...props }: CookieBannerProps) {
  const { density, bannerVisible } = useCookieConsentContext("CookieBanner")
  // Resolve the slots with this banner's position so the body/actions layout is baked in, then
  // re-provide them to the banner parts.
  const slots = cookieConsentVariants({ density, position })

  // Keep the banner in the DOM through its exit animation so a choice dismisses it smoothly
  // instead of popping out. React's blessed "adjust state during render" pattern (never an effect,
  // which the strict react-hooks lint forbids, mirroring AnimatedNumber): once consent flips
  // `bannerVisible` off we still paint one frame with `data-state="closed"` to play the exit
  // keyframe, then drop it on animationend. tw-animate-css runs the exit even under reduced-motion,
  // so `animationend` always fires and the banner never lingers.
  const [mounted, setMounted] = React.useState(bannerVisible)
  if (bannerVisible && !mounted) setMounted(true)

  if (!mounted) return null

  return (
    <CookieBannerProvider slots={slots}>
      <div
        data-slot="cookie-banner"
        data-state={bannerVisible ? "open" : "closed"}
        role="region"
        aria-label="Cookie consent"
        className={slots.banner({ position, className })}
        // Unmount only when the banner's *own* exit finishes (guarded off child bubbling), so the
        // fade + drift plays to completion before it leaves the tree.
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && !bannerVisible) setMounted(false)
        }}
        {...props}
      >
        <div className={slots.bannerBody({ position })}>{children}</div>
      </div>
    </CookieBannerProvider>
  )
}

/** Optional leading glyph for the banner: pass a Phosphor icon (e.g. `<Cookie />`). */
export function CookieBannerIcon({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCookieBannerContext("CookieBannerIcon")
  return <div data-slot="cookie-banner-icon" className={slots.bannerIcon({ className })} {...props} />
}

/** The title + description column. Keeps the copy grouped and gives the actions a flex sibling. */
export function CookieBannerContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCookieBannerContext("CookieBannerContent")
  return <div data-slot="cookie-banner-content" className={slots.bannerContent({ className })} {...props} />
}

export function CookieBannerTitle({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useCookieBannerContext("CookieBannerTitle")
  return <p data-slot="cookie-banner-title" className={slots.bannerTitle({ className })} {...props} />
}

export function CookieBannerDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { slots } = useCookieBannerContext("CookieBannerDescription")
  return <p data-slot="cookie-banner-description" className={slots.bannerDescription({ className })} {...props} />
}

/** The action cluster: drop the Cookie*Button parts (or any DS Button) inside. */
export function CookieBannerActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useCookieBannerContext("CookieBannerActions")
  return <div data-slot="cookie-banner-actions" className={slots.bannerActions({ className })} {...props} />
}

// ─── Preferences dialog ───────────────────────────────────────────────────────────

/** The preferences dialog root: a DS Dialog bound to the shared open state. Wrap the trigger + content. */
export function CookiePreferences({ children, ...props }: React.ComponentProps<typeof Dialog>) {
  const { dialogOpen, setDialogOpen } = useCookieConsentContext("CookiePreferences")
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} {...props}>
      {children}
    </Dialog>
  )
}

/** Opens the preferences dialog from an arbitrary element (e.g. a footer "Cookie settings" link) via `asChild`. */
export const CookiePreferencesTrigger = DialogTrigger

export type CookiePreferencesContentProps = DialogContentProps

/**
 * The preferences dialog body: a DS DialogContent wired to the consent density. Compose
 * CookiePreferencesHeader / CookieCategoryList / CookiePreferencesFooter inside, or hand-build
 * the rows with CookieCategory for full control.
 */
export function CookiePreferencesContent({ size = "md", children, ...props }: CookiePreferencesContentProps) {
  const { density } = useCookieConsentContext("CookiePreferencesContent")
  return (
    <DialogContent data-slot="cookie-preferences-content" size={size} density={density} {...props}>
      {children}
    </DialogContent>
  )
}

/** Thin re-exports of the matching Dialog parts, so the preferences dialog reads from one import. */
export const CookiePreferencesHeader = DialogHeader
export const CookiePreferencesTitle = DialogTitle
export const CookiePreferencesDescription = DialogDescription
export const CookiePreferencesFooter = DialogFooter

// ─── Category rows ────────────────────────────────────────────────────────────────

/** Maps the root's `categories` into CookieCategory rows. The turnkey body of the dialog. */
export function CookieCategoryList({ className }: { className?: string }) {
  const { slots, categories } = useCookieConsentContext("CookieCategoryList")
  return (
    <div data-slot="cookie-category-list" role="group" aria-label="Cookie categories" className={slots.list({ className })}>
      {categories.map((category) => (
        <CookieCategory key={category.id} category={category} />
      ))}
    </div>
  )
}

export interface CookieCategoryProps {
  /** The category to render. Its `id` keys into the shared preferences map. */
  category: CookieCategoryDef
  className?: string
}

/**
 * One category row: a concentric card with a leading icon, label/description, and the DS
 * Switch. Required categories show an "Always on" Badge and a locked (disabled, on) Switch;
 * the rest toggle the shared preferences map. The label is a `<label htmlFor>` for the Switch,
 * so clicking the name focuses the control.
 */
export function CookieCategory({ category, className }: CookieCategoryProps) {
  const { slots, prefs, setPreference } = useCookieConsentContext("CookieCategory")
  const id = React.useId()
  const Icon = category.icon
  const checked = prefs[category.id] ?? Boolean(category.required)

  return (
    <div data-slot="cookie-category" className={slots.category({ className })}>
      {Icon ? <Icon weight="bold" aria-hidden className={slots.categoryIcon()} /> : null}
      <div className={slots.categoryText()}>
        <div className={slots.categoryLabelRow()}>
          <label htmlFor={id} className={slots.categoryLabel()}>
            {category.label}
          </label>
          {category.required ? (
            <Badge size="sm" pill>
              Always on
            </Badge>
          ) : null}
        </div>
        {category.description ? <p className={slots.categoryDescription()}>{category.description}</p> : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(value) => setPreference(category.id, value)}
        // Required categories are locked on: disabled keeps them checked and non-interactive.
        disabled={category.required}
        aria-label={category.label}
        className={slots.categorySwitch()}
      />
    </div>
  )
}

// ─── Pre-wired action buttons ───────────────────────────────────────────────────────
// Thin DS Button wrappers with the consent action bound. They forward every Button prop
// (variant, size, className…), so the defaults are a starting point, not a cage; an explicit
// `onClick` still runs after the consent action.

export type CookieActionButtonProps = ButtonProps

export function CookieAcceptAllButton({ children = "Accept all", onClick, ...props }: CookieActionButtonProps) {
  const { acceptAll } = useCookieConsentContext("CookieAcceptAllButton")
  return (
    <Button
      data-slot="cookie-accept-all"
      onClick={(e) => {
        acceptAll()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export function CookieRejectAllButton({
  variant = "secondary",
  children = "Reject all",
  onClick,
  ...props
}: CookieActionButtonProps) {
  const { rejectAll } = useCookieConsentContext("CookieRejectAllButton")
  return (
    <Button
      data-slot="cookie-reject-all"
      variant={variant}
      onClick={(e) => {
        rejectAll()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export function CookieCustomizeButton({
  variant = "ghost",
  children = "Customize",
  onClick,
  ...props
}: CookieActionButtonProps) {
  const { setDialogOpen } = useCookieConsentContext("CookieCustomizeButton")
  return (
    <Button
      data-slot="cookie-customize"
      variant={variant}
      onClick={(e) => {
        setDialogOpen(true)
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export function CookieSavePreferencesButton({
  children = "Save preferences",
  onClick,
  ...props
}: CookieActionButtonProps) {
  const { save } = useCookieConsentContext("CookieSavePreferencesButton")
  return (
    <Button
      data-slot="cookie-save-preferences"
      onClick={(e) => {
        save()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
