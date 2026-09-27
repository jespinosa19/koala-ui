"use client"

import * as React from "react"
import { CaretUp, type Icon } from "@phosphor-icons/react"

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
 *
 * Clean until asked: CookieBannerDetails is a layer the banner keeps folded away and opens on
 * hover, on keyboard focus, or from CookieBannerDetailsTrigger on touch screens. CookieDetailList
 * fills it from the same `categories`, cookie by cookie. And with `storageKey` the root remembers
 * the choice itself: dated, versioned, and asked again once it is older than `maxAgeDays`.
 */

// The banner body as one row: [icon] content actions. A grid, not a wrapping flex row, so the
// details layer can take a full-width row of its own above it with no row gap (a collapsed flex
// line would still pay the gap). The template follows the icon's presence, so dropping the icon
// leaves no empty track and no stray column gap in front of the copy.
const INLINE_ROW =
  "grid items-center grid-cols-[minmax(0,1fr)_auto] has-[>[data-slot=cookie-banner-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]"

export const cookieConsentVariants = tv({
  slots: {
    // The banner is a floating popover-colored surface. `[--surface:var(--popover)]` exposes
    // it so any nested DS control blends with the banner, not the page (the --surface contract).
    banner: [
      "group/cookie-banner fixed z-50 border border-border-soft bg-popover text-popover-foreground shadow-lg",
      "[--surface:var(--popover)]",
      // Enter and exit are both keyframed via tw-animate-css, gated on the `data-state` the
      // CookieBanner stamps (open while visible, closed for the one frame before it unmounts).
      // Directional slides live in the `position` variants; the exit is softer than the enter
      // (make-interfaces #6): a gentle fade + short downward drift, never a mirror of the enter.
      "duration-base ease-out",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2",
    ],
    // The content row/column inside the banner (the `layout` variant arranges it).
    bannerBody: "flex w-full",
    // A small leading cookie glyph, optically aligned to the first line of the title.
    bannerIcon: "mt-0.5 shrink-0 text-foreground [&_svg]:size-5",
    // Title + description column.
    bannerContent: "flex min-w-0 flex-1 flex-col gap-1",
    bannerTitle: "text-sm leading-none font-semibold text-foreground",
    bannerDescription: "text-sm text-pretty text-muted-foreground",
    // Action cluster: stacks on the narrowest widths, rows out as space allows.
    bannerActions: "flex shrink-0 flex-wrap items-center gap-2",
    // ── Details layer ───────────────────────────────────────────────────────────────
    // Always the TOP of the banner, wherever it sits in the markup (`order-first` in the stacked
    // column, row 1 of the inline grid). Every banner is anchored to the bottom edge, so the layer
    // unrolls upward: the copy and the buttons stay exactly where they were, and a pointer on its
    // way to "Accept" never has to chase a moving target.
    // The 0fr→1fr track is what lets the height follow the content: `height: auto` cannot be
    // transitioned, a fractional track can, and it lands on the true height however the rows wrap.
    // A transition, not a keyframe, so a pointer that leaves halfway reverses it from where it is.
    // Rest carries `duration-fast`, open `duration-base`: a transition runs on the duration of the
    // state it is heading to, so the fold is quicker than the unfold (exits are softer, #6).
    details: [
      "group/cookie-details order-first col-span-full row-start-1 -mx-1 grid grid-rows-[0fr]",
      "transition-[grid-template-rows] duration-fast ease-out motion-reduce:transition-none",
      "data-[state=open]:grid-rows-[1fr] data-[state=open]:duration-base",
    ],
    // Folded, the layer is clipped to nothing: invisible and unclickable, yet a link inside stays
    // in the tab order (clipping, unlike `hidden`, keeps it focusable), and focusing it opens the
    // layer around it. `-mx-1` on the track and `px-1 pt-1` here give a focus ring room to draw.
    detailsClip: "min-h-0 overflow-hidden",
    // `pb-4` is the gap to the copy below; it lives inside the clip so it folds away with the rest.
    detailsContent: [
      "flex flex-col gap-3 px-1 pt-1 pb-4",
      "opacity-0 transition-opacity duration-fast ease-out motion-reduce:transition-none",
      "group-data-[state=open]/cookie-details:opacity-100 group-data-[state=open]/cookie-details:duration-base",
    ],
    // Touch screens have no hover, so this is the way in there, and ONLY there: with a pointer that
    // hovers, the layer is already open by the time the button could be clicked, so it would do
    // nothing visible. It hides itself instead of leaving a dead control.
    detailsTrigger: "[@media(hover:hover)]:hidden",
    // The default glyph points where the layer opens (up) and turns to fold it: one glyph that
    // turns on the reveal's own clock (caret-turn), never two swapped.
    detailsCaret: "caret-turn",
    // ── Cookie detail list ───────────────────────────────────────────────────────────
    // Flush groups on whitespace, no container: the layer is already inside a surface.
    detailList: "flex flex-col gap-4",
    detailGroup: "flex flex-col gap-2",
    detailGroupHeader: "flex items-center justify-between gap-3",
    detailGroupLabel: "text-xs font-medium text-muted-foreground",
    detailCookies: "flex flex-col gap-2",
    detailCookie: "flex flex-col gap-0.5",
    detailCookieHead: "flex items-baseline justify-between gap-3",
    detailCookieName: "min-w-0 text-sm font-medium text-foreground",
    // Durations sit in a right-hand column, so their figures line up (tabular-nums).
    detailCookieDuration: "shrink-0 text-xs text-muted-foreground tabular-nums",
    detailCookiePurpose: "text-xs text-pretty text-muted-foreground",
    // One line of the list. Inside a folded details layer each line waits a beat below its place
    // and rises in on its own delay, one per line (the unit of a stagger is the line). Folding, the
    // delay drops so everything leaves together. Outside a details layer none of it matches, so
    // the same list renders plainly anywhere else (the preferences dialog, a policy page).
    detailRow: [
      "transition-[opacity,translate] duration-fast ease-out motion-reduce:transition-none",
      "group-data-[state=closed]/cookie-details:translate-y-1 group-data-[state=closed]/cookie-details:opacity-0",
      "group-data-[state=open]/cookie-details:duration-base",
      "group-data-[state=open]/cookie-details:delay-[calc(var(--cookie-row,0)*var(--duration-fast)*0.25)]",
    ],
    // ── Preferences dialog ──────────────────────────────────────────────────────────
    // One concentric container (rounded-lg inside the dialog's rounded-xl) holding every
    // category row, separated by hairline dividers. `overflow-hidden` clips the rows to the
    // rounded corners; `divide-y` draws the rule between rows (not around the outside). No fill:
    // it is an in-flow contour (fill is elevation, docs/FOUNDATIONS.md), so it takes the dialog's
    // own surface and the Switches inherit it.
    list: "flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border",
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
        bannerBody: "mx-auto max-w-6xl",
      },
      "bottom-left": {
        banner:
          "bottom-4 left-4 w-[min(24rem,calc(100vw-2rem))] rounded-xl data-[state=open]:slide-in-from-left-4 data-[state=open]:slide-in-from-bottom-4",
      },
      "bottom-right": {
        banner:
          "right-4 bottom-4 w-[min(24rem,calc(100vw-2rem))] rounded-xl data-[state=open]:slide-in-from-right-4 data-[state=open]:slide-in-from-bottom-4",
      },
    },
    // How the parts inside arrange. `stack` is a column: icon, copy, then the actions. `inline`
    // is one quiet row (icon, copy, actions at the end), the calm resting shape for a banner whose
    // detail lives in CookieBannerDetails. `launcher` rests as the icon alone in a small circle and
    // grows into the inline card while it is expanded (corner positions only). The full-width
    // `bottom` bar stacks on phones and goes inline from `lg` on its own (compound below).
    layout: {
      stack: {
        bannerBody: "flex-col gap-4",
        // In a column the folded layer is a flex item, and the column's `gap-4` would still open
        // under a zero-height item. The negative margin cancels it; `pb-4` inside the clip puts
        // the same 16px back once the layer is open.
        details: "-mb-4",
      },
      inline: {
        bannerBody: `${INLINE_ROW} gap-x-3`,
        // A title-only row centers everything on one line; the glyph follows suit.
        bannerIcon: "mt-0",
      },
      // One surface that morphs, never a circle swapped for a card. The circle is the card, clipped:
      //   - The banner is a one-track grid (0fr at rest, 1fr expanded) with a 48px floor, so it rests
      //     as a 48px square (rounded-3xl clamps to a circle on it) and grows to the card's true
      //     height with no measuring. Its width runs 3rem → the card width on the same clock.
      //   - The body is laid out at the FULL card width at all times and the banner clips it, so the
      //     text never reflows frame by frame. It hangs from the banner's LEFT edge, the one that
      //     moves: the whole card is drawn out of the circle as one piece, and "Got it" arrives last
      //     from under the fixed right edge. (Pinned right instead, the text would sit still while
      //     the glyph slid across it.)
      //   - The icon lives outside the clip (absolute, the banner is its containing block), hung
      //     from the same left edge, so it travels with the text and never crosses it.
      //   - A ring, not a border: a border would inset the icon's box by 1px and push it off centre.
      launcher: {
        banner: [
          "grid min-h-12 w-12 grid-cols-[minmax(0,1fr)] grid-rows-[0fr] content-end overflow-hidden border-0 ring-1 ring-border-soft",
          "transition-[width,grid-template-rows] duration-fast ease-out motion-reduce:transition-none",
          "data-expanded:w-[min(24rem,calc(100vw-2rem))] data-expanded:grid-rows-[1fr] data-expanded:duration-base",
        ],
        // `content-end`: while the card is shorter than its content, the overflow goes out the top,
        // so the title row (the bottom of the card) is the first thing to appear.
        bannerBody: [
          "grid min-h-0 w-[min(24rem,calc(100vw-2rem))] shrink-0 justify-self-start content-end overflow-hidden",
          "grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 pr-3 pl-4",
        ],
        // At rest centred in the circle (14px + 20px glyph + 14px = 48). Expanded, its seat is the
        // 1.25rem first column: 16px from the left edge (2px further in) and on the row's centre
        // line (12px padding + half the 32px button = 28px up, 4px above the circle's centre).
        bannerIcon: [
          "absolute bottom-3.5 left-3.5 mt-0",
          "transition-[translate] duration-fast ease-out motion-reduce:transition-none",
          "group-data-expanded/cookie-banner:translate-x-0.5 group-data-expanded/cookie-banner:-translate-y-1 group-data-expanded/cookie-banner:duration-base",
        ],
        // The icon left the flow, so the copy and the buttons are placed past its empty column.
        bannerContent: [
          "col-start-2 opacity-0 transition-opacity duration-fast ease-out motion-reduce:transition-none",
          "group-data-expanded/cookie-banner:opacity-100 group-data-expanded/cookie-banner:duration-base",
        ],
        bannerActions: [
          "col-start-3 opacity-0 transition-opacity duration-fast ease-out motion-reduce:transition-none",
          "group-data-expanded/cookie-banner:opacity-100 group-data-expanded/cookie-banner:duration-base",
        ],
        // The card itself is the fold here, so the layer inside is laid out open at all times; its
        // lines still fade and rise in on their own beat.
        details: "grid-rows-[1fr]",
      },
    },
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). `comfortable` is the
    // marketing default; `compact` tightens padding/gaps for application UI. Never radius/color.
    density: {
      comfortable: { banner: "p-5", category: "gap-3 p-4" },
      compact: { banner: "p-4", category: "gap-2.5 p-3" },
    },
  },
  compoundVariants: [
    // A stacked corner card stretches its buttons into an even row.
    {
      position: ["bottom-left", "bottom-right"],
      layout: "stack",
      class: { bannerActions: "[&>button]:flex-1" },
    },
    // An inline corner card rests as one slim bar, so it hugs its row: 12px around the pill
    // buttons and a concentric corner (their 16px radius + 12px = rounded-3xl). The copy side
    // keeps 16px, since a glyph's own side bearing already reads as extra air.
    {
      position: ["bottom-left", "bottom-right"],
      layout: "inline",
      class: { banner: "rounded-3xl py-3 pr-3 pl-4" },
    },
    // The launcher's padding lives on its body (laid out at full width); the circle itself has none.
    {
      layout: "launcher",
      class: { banner: "rounded-3xl p-0" },
    },
    // The full-width bar: a column on phones, one row from `lg` (the inline grid, with the wider
    // gutter a full-bleed bar wants between its copy and its buttons).
    {
      position: "bottom",
      layout: "stack",
      class: {
        bannerBody: `lg:grid lg:items-center lg:gap-x-6 lg:gap-y-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:has-[>[data-slot=cookie-banner-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]`,
        details: "lg:mb-0",
      },
    },
  ],
  defaultVariants: {
    position: "bottom-right",
    layout: "stack",
    density: "comfortable",
  },
})

type CookieConsentSlots = ReturnType<typeof cookieConsentVariants>
type CookieDensity = "comfortable" | "compact"
type CookiePreferences = Record<string, boolean>

/** One cookie (or stored value) a category sets, as CookieDetailList lists it. */
export interface CookieDef {
  /** What visitors read: a plain name ("Pro session") or the cookie's own ("_ga"). */
  name: string
  /** What it is for, in one short line. */
  purpose?: string
  /** How long it lives: "Session", "30 days", "Until cleared". */
  duration?: string
  /** Who sets it, when that is not you: "Google", "Stripe". */
  provider?: string
}

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
  /** The cookies this category sets, for CookieDetailList. Without them it shows the description. */
  cookies?: CookieDef[]
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
// the consumer re-threading it onto every part, plus the open state of its details layer.
const [CookieBannerProvider, useCookieBannerContext] = createContext<{
  slots: CookieConsentSlots
  expanded: boolean
  detailsId: string
  togglePinned: () => void
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

// ─── Stored consent (`storageKey`) ────────────────────────────────────────────────
// The record is small and self-describing: which version of the policy was answered, when, and
// with what. The date is what makes the renewal possible and what a visitor's choice can be
// traced back to; the version is how a site asks again after its categories change.

interface ConsentRecord {
  version: number | string
  /** ISO timestamp of the choice. */
  date: string
  preferences: CookiePreferences
}

const DAY_MS = 86_400_000
// Same-tab writes don't fire `storage` (only other tabs get it), so the root announces its own.
const CONSENT_EVENT = "koala:cookie-consent"

function subscribeConsent(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CONSENT_EVENT, onChange)
  }
}

function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null
  try {
    const record = JSON.parse(raw) as Partial<ConsentRecord>
    if (!record || typeof record.date !== "string" || typeof record.preferences !== "object") return null
    return record as ConsentRecord
  } catch {
    return null
  }
}

// The stored string when it is still a valid answer (right version, young enough), else null.
// Returning the raw string keeps the useSyncExternalStore snapshot stable between reads.
function readConsent(key: string, version: number | string, maxAgeDays: number): string | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    // Storage blocked (privacy mode, sandboxed frame): behave as a first visit.
    return null
  }
  const record = parseConsent(raw)
  if (!record || record.version !== version) return null
  const age = Date.now() - Date.parse(record.date)
  return age >= 0 && age < maxAgeDays * DAY_MS ? raw : null
}

function writeConsent(key: string, version: number | string, preferences: CookiePreferences) {
  const record: ConsentRecord = { version, date: new Date().toISOString(), preferences }
  try {
    window.localStorage.setItem(key, JSON.stringify(record))
  } catch {
    // Storage blocked: the choice still holds for this visit through the root's own state.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT))
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
  /**
   * Remember the choice in localStorage under this key: the banner then shows only until the
   * visitor answers, the preferences come back on the next visit, and every tab stays in step.
   * The record carries the date and the `version`. Omit it to persist the choice yourself.
   */
  storageKey?: string
  /**
   * The version of your cookie policy. Bump it when the categories or what they do change: a
   * choice stored under another version no longer counts, so the banner asks again. @default 1
   */
  version?: number | string
  /**
   * How many days a stored choice stays valid before the banner asks again. Regulators expect
   * consent to be renewed; six months is the CNIL's reference. Needs `storageKey`. @default 180
   */
  maxAgeDays?: number
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
  storageKey,
  version = 1,
  maxAgeDays = 180,
  density,
  children,
}: CookieConsentProps) {
  const resolvedDensity = useDensity(density)
  const slots = cookieConsentVariants({ density: resolvedDensity })

  // The stored answer, read through useSyncExternalStore so the server and the hydrating client
  // agree: both see `undefined` ("not known yet") and render no banner, then the client reads
  // storage and shows the banner only to a visitor with no valid answer. Without that first
  // "unknown" pass, a returning visitor would get a banner flashing in and straight back out.
  const storedRaw = React.useSyncExternalStore(
    subscribeConsent,
    () => (storageKey ? readConsent(storageKey, version, maxAgeDays) : null),
    () => (storageKey ? undefined : null),
  )
  const stored = React.useMemo(() => parseConsent(storedRaw), [storedRaw])

  // Preferences: controlled or uncontrolled; required categories are always clamped on. Until the
  // visitor touches a toggle, an uncontrolled root reads the stored answer, then `defaultValue`.
  const isControlled = value !== undefined
  const [internalPrefs, setInternalPrefs] = React.useState<CookiePreferences | null>(null)
  const prefs = withRequired(
    categories,
    isControlled ? value : (internalPrefs ?? stored?.preferences ?? initPrefs(categories, defaultValue)),
  )

  // Preferences dialog open state: controlled or uncontrolled.
  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const dialogOpen = isOpenControlled ? open : internalOpen

  // Banner visibility: hidden once the visitor has made any choice, in this visit or a stored one.
  const [consented, setConsented] = React.useState(defaultConsented)
  const bannerVisible = !consented && !stored && storedRaw !== undefined

  function commit(next: CookiePreferences): CookiePreferences {
    const forced = withRequired(categories, next)
    if (!isControlled) setInternalPrefs(forced)
    onValueChange?.(forced)
    return forced
  }

  // Every answer (accept, reject, save) ends here: remember it, then let the banner go.
  function settle(answer: CookiePreferences) {
    if (storageKey) writeConsent(storageKey, version, answer)
    setConsented(true)
    setDialogOpen(false)
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
    const answer = commit(next)
    onAcceptAll?.(answer)
    settle(answer)
  }

  function rejectAll() {
    const next: CookiePreferences = {}
    for (const c of categories) next[c.id] = Boolean(c.required)
    const answer = commit(next)
    onRejectAll?.(answer)
    settle(answer)
  }

  function save() {
    onSave?.(prefs)
    settle(prefs)
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
      bannerVisible={bannerVisible}
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
  /**
   * `stack` (a column), `inline` (one row: icon, copy, actions), or `launcher` (the icon alone in
   * a circle, growing into the inline card on hover, focus or tap; corner positions, needs a
   * CookieBannerIcon). @default "stack"
   */
  layout?: VariantProps<typeof cookieConsentVariants>["layout"]
}

// `:focus-visible` is what tells a keyboard arrival from a click. Guarded: an engine that does not
// know the selector throws instead of answering.
function isFocusVisible(el: EventTarget) {
  try {
    return el instanceof Element && el.matches(":focus-visible")
  } catch {
    return false
  }
}

export function CookieBanner({
  className,
  position = "bottom-right",
  layout = "stack",
  children,
  onAnimationEnd,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onClick,
  ...props
}: CookieBannerProps) {
  const { density, bannerVisible } = useCookieConsentContext("CookieBanner")
  // Resolve the slots with this banner's position so the body/actions layout is baked in, then
  // re-provide them to the banner parts.
  const slots = cookieConsentVariants({ density, position, layout })
  const detailsId = React.useId()
  const bannerRef = React.useRef<HTMLDivElement>(null)

  // Keep the banner in the DOM through its exit animation so a choice dismisses it smoothly
  // instead of popping out. React's blessed "adjust state during render" pattern (never an effect,
  // which the strict react-hooks lint forbids, mirroring AnimatedNumber): once consent flips
  // `bannerVisible` off we still paint one frame with `data-state="closed"` to play the exit
  // keyframe, then drop it on animationend. tw-animate-css runs the exit even under reduced-motion,
  // so `animationend` always fires and the banner never lingers.
  const [mounted, setMounted] = React.useState(bannerVisible)
  if (bannerVisible && !mounted) setMounted(true)

  // The details layer opens for three reasons, each dropped on its own terms: a hovering pointer
  // (until it leaves), keyboard focus inside the banner (until focus leaves), and a tap on
  // CookieBannerDetailsTrigger (until tapped again). Escape folds all three at once: the layer
  // covers the page above the banner, so it must be dismissable without moving (WCAG 1.4.13).
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const expanded = hovered || focused || pinned

  // A layer opened by a tap stays open until it is tapped shut, answered, or the visitor taps
  // anywhere else on the page, the way any popover lets go.
  React.useEffect(() => {
    if (!pinned) return
    function release(e: PointerEvent) {
      const inside = e.target instanceof Element && e.target.closest(`[data-cookie-banner="${detailsId}"]`)
      if (!inside) setPinned(false)
    }
    document.addEventListener("pointerdown", release)
    return () => document.removeEventListener("pointerdown", release)
  }, [pinned, detailsId])

  // The card itself never scrolls, but it floats fixed above the page: without this, a wheel
  // over it falls through to whatever is underneath, so the page scrolls out from behind the
  // pointer while the banner appears to sit still. React's onWheel is wired passive (for scroll
  // perf), so preventDefault needs a real listener; effect keyed on `mounted` so it re-attaches
  // to the fresh node each time the banner mounts.
  React.useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const block = (event: WheelEvent) => event.preventDefault()
    el.addEventListener("wheel", block, { passive: false })
    return () => el.removeEventListener("wheel", block)
  }, [mounted])

  if (!mounted) return null

  return (
    <CookieBannerProvider
      slots={slots}
      expanded={expanded}
      detailsId={detailsId}
      togglePinned={() => setPinned((p) => !p)}
    >
      <div
        ref={bannerRef}
        data-slot="cookie-banner"
        data-state={bannerVisible ? "open" : "closed"}
        data-expanded={expanded ? "" : undefined}
        data-cookie-banner={detailsId}
        role="region"
        aria-label="Cookie consent"
        className={slots.banner({ position, className })}
        // Unmount only when the banner's *own* exit finishes (guarded off child bubbling), so the
        // fade + drift plays to completion before it leaves the tree.
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && !bannerVisible) setMounted(false)
          onAnimationEnd?.(e)
        }}
        // A touch "enter" is a tap, not a hover: it is the trigger's job there.
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setHovered(true)
          onPointerEnter?.(e)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setHovered(false)
          onPointerLeave?.(e)
        }}
        // Only a keyboard arrival opens it. A click also focuses a button, and a layer that stayed
        // open after the pointer left, just because a button kept focus, would look stuck.
        onFocus={(e) => {
          if (isFocusVisible(e.target)) setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
          onBlur?.(e)
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && expanded) {
            setHovered(false)
            setFocused(false)
            setPinned(false)
          }
          onKeyDown?.(e)
        }}
        // A folded launcher is nothing but its circle, and a finger cannot hover: tapping the circle
        // is the way in. (A hovering pointer has already opened it, so a click there changes nothing.)
        onClick={(e) => {
          if (layout === "launcher" && !expanded) setPinned(true)
          onClick?.(e)
        }}
        {...props}
      >
        <div className={slots.bannerBody({ position, layout })}>{children}</div>
      </div>
    </CookieBannerProvider>
  )
}

/**
 * The detail layer: folded away at rest, it opens on hover, on keyboard focus, or from
 * CookieBannerDetailsTrigger, and unrolls upward from the top of the banner. Put
 * CookieDetailList inside for the cookies of every category, or any content of your own.
 */
export function CookieBannerDetails({ className, children, ...props }: React.ComponentProps<"div">) {
  const { slots, expanded, detailsId } = useCookieBannerContext("CookieBannerDetails")
  return (
    <div
      data-slot="cookie-banner-details"
      data-state={expanded ? "open" : "closed"}
      id={detailsId}
      className={slots.details({ className })}
      {...props}
    >
      <div className={slots.detailsClip()}>
        <div className={slots.detailsContent()}>{children}</div>
      </div>
    </div>
  )
}

/**
 * Opens and closes the detail layer where there is no hover: shown on touch screens only (a
 * pointer that hovers has already opened it). A DS Button, ghost by default; drop it in
 * CookieBannerActions. With no children it is an icon-only caret that turns as the layer opens;
 * pass a label ("Details") to make it a text button instead.
 */
export function CookieBannerDetailsTrigger({
  variant = "ghost",
  children,
  className,
  onClick,
  ...props
}: CookieActionButtonProps) {
  const { slots, expanded, detailsId, togglePinned } = useCookieBannerContext("CookieBannerDetailsTrigger")
  const caret = children === undefined
  return (
    <Button
      data-slot="cookie-banner-details-trigger"
      variant={variant}
      aria-expanded={expanded}
      aria-controls={detailsId}
      // The caret alone needs a name; no tooltip, since the button only exists where nothing hovers.
      {...(caret ? { iconOnly: true, "aria-label": "Cookie details", tooltip: false } : null)}
      className={slots.detailsTrigger({ className })}
      onClick={(e) => {
        togglePinned()
        onClick?.(e)
      }}
      {...props}
    >
      {caret ? (
        <CaretUp weight="bold" aria-hidden className={slots.detailsCaret({ className: expanded && "rotate-180" })} />
      ) : (
        children
      )}
    </Button>
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
        // No `aria-label` here: the visible `<label htmlFor>` above already names the switch,
        // and an aria-label would override it, leaving the label element decorative and the
        // accessible name free to drift from what the user reads.
        className={slots.categorySwitch()}
      />
    </div>
  )
}

/**
 * Every category with the cookies it sets (name, purpose, provider, duration), read from the
 * root's `categories`: the detail a visitor is entitled to before they answer. A category without
 * `cookies` shows its description instead. Made for CookieBannerDetails, where its lines rise in
 * one by one, but it renders plainly anywhere inside CookieConsent.
 */
export function CookieDetailList({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, categories } = useCookieConsentContext("CookieDetailList")

  // Each line's place in the stagger, counted across groups so the cascade runs top to bottom.
  const firstLine: number[] = []
  let lines = 0
  for (const category of categories) {
    firstLine.push(lines)
    lines += 1 + (category.cookies?.length || (category.description ? 1 : 0))
  }
  const line = (n: number) => ({ "--cookie-row": n }) as React.CSSProperties

  return (
    <div data-slot="cookie-detail-list" className={slots.detailList({ className })} {...props}>
      {categories.map((category, c) => (
        <div key={category.id} data-slot="cookie-detail-group" className={slots.detailGroup()}>
          <div className={slots.detailGroupHeader({ className: slots.detailRow() })} style={line(firstLine[c])}>
            <p className={slots.detailGroupLabel()}>{category.label}</p>
            {category.required ? (
              <Badge size="sm" pill>
                Always on
              </Badge>
            ) : null}
          </div>
          {category.cookies?.length ? (
            <ul role="list" className={slots.detailCookies()}>
              {category.cookies.map((cookie, i) => (
                <li
                  key={cookie.name}
                  data-slot="cookie-detail-cookie"
                  className={slots.detailCookie({ className: slots.detailRow() })}
                  style={line(firstLine[c] + 1 + i)}
                >
                  <div className={slots.detailCookieHead()}>
                    <span className={slots.detailCookieName()}>{cookie.name}</span>
                    {cookie.duration ? <span className={slots.detailCookieDuration()}>{cookie.duration}</span> : null}
                  </div>
                  {cookie.purpose || cookie.provider ? (
                    <p className={slots.detailCookiePurpose()}>
                      {[cookie.purpose, cookie.provider].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : category.description ? (
            <p className={slots.detailCookiePurpose({ className: slots.detailRow() })} style={line(firstLine[c] + 1)}>
              {category.description}
            </p>
          ) : null}
        </div>
      ))}
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
