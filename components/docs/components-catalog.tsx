"use client"

import * as React from "react"
import Link from "next/link"
import { MagnifyingGlass } from "@phosphor-icons/react"

import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { docsNav, type NavItem, type NavSection } from "./nav"
import { componentPreviews } from "./component-previews"

/**
 * The /docs/components catalog: an Untitled-UI / Tailwind-Plus style gallery that paints a
 * live mini-preview of every component, grouped by the same categories as the sidebar.
 *
 * `docsNav` is the single source of truth; we keep only the sections whose items live under
 * /docs/components/ (i.e. skip Getting Started + Foundations). Each card pulls its preview
 * from `componentPreviews` by slug, falling back to a large icon tile when one isn't authored
 * yet, so the page is never broken while previews are filled in.
 */
const catalogSections: NavSection[] = docsNav.filter((section) =>
  section.items.every((item) => item.href.startsWith("/docs/components/")),
)

const TOTAL = catalogSections.reduce((n, s) => n + s.items.length, 0)

/**
 * How many options the component's primary `variant` axis exposes, keyed by slug. The number
 * is the option count of the recipe's `variant` axis; components without a `variant` axis fall
 * back to their main style axis (size / tone / side). Purely structural components (no enum
 * variant axis) sit at 0 here and render as "1 variant" (their single visual form) so every
 * card carries the same label. Keep in sync when a component's recipe gains/loses options.
 */
const variantCounts: Record<string, number> = {
  accordion: 3,
  "activity-feed": 0,
  "ai-panel": 3,
  alert: 5,
  "auth-form": 2,
  avatar: 6,
  "avatar-group": 5,
  badge: 12,
  "badge-group": 0,
  banner: 10,
  bento: 5,
  breadcrumb: 0,
  button: 6,
  "button-group": 0,
  card: 3,
  carousel: 4,
  chart: 0,
  chat: 2,
  checkbox: 2,
  "code-snippet": 0,
  "color-picker": 0,
  command: 0,
  "contact-form": 0,
  "cookie-consent": 3,
  "data-table": 2,
  "date-picker": 3,
  "description-list": 2,
  dialog: 4,
  divider: 4,
  drawer: 4,
  "dropdown-menu": 0,
  "emoji-picker": 0,
  "empty-state": 6,
  faqs: 2,
  "feedback-form": 0,
  field: 0,
  "file-card": 4,
  "file-upload": 0,
  footer: 2,
  gallery: 0,
  hero: 0,
  input: 2,
  "input-group": 3,
  kbd: 4,
  label: 0,
  layout: 2,
  lightbox: 0,
  list: 2,
  "multi-select": 0,
  navbar: 2,
  "newsletter-form": 2,
  "otp-input": 3,
  pagination: 0,
  "password-strength": 0,
  "payment-form": 0,
  popover: 0,
  pricing: 3,
  "pricing-comparison": 0,
  "prompt-input": 4,
  "qr-code": 0,
  "radio-group": 2,
  ranking: 3,
  rating: 2,
  resizable: 2,
  "rich-text-editor": 0,
  "section-header": 3,
  select: 0,
  "settings-form": 0,
  sidebar: 2,
  skeleton: 3,
  slider: 5,
  stat: 3,
  stepper: 2,
  suggestions: 4,
  survey: 0,
  switch: 0,
  tabs: 3,
  testimonials: 6,
  textarea: 3,
  toast: 5,
  "toggle-group": 2,
  toolbar: 3,
  tooltip: 2,
  tree: 0,
  "video-player": 0,
  "waitlist-form": 0,
}

function slugFromHref(href: string) {
  return href.replace("/docs/components/", "")
}

/** "6 variants" / "1 variant" — floored at 1 so every card reads as having at least one form. */
function variantLabel(slug: string) {
  const n = Math.max(variantCounts[slug] ?? 0, 1)
  return `${n} ${n === 1 ? "variant" : "variants"}`
}

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "")
}

function ComponentCard({ item }: { item: NavItem }) {
  const preview = componentPreviews[slugFromHref(item.href)]
  const Icon = item.icon

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "transition-colors duration-200 ease-out hover:border-ring/40",
        "focus-within:border-ring/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring/50",
      )}
    >
      {/* Preview stage. The render is decorative + non-interactive; the card is made clickable by
          the stretched link below (an `after` overlay), NOT by wrapping the preview in the anchor.
          Several previews render their own `<a>` (Banner/Breadcrumb/Footer/Navbar), so nesting the
          card link as their ancestor would be invalid HTML (`<a>` inside `<a>`) and break hydration.
          Even padding keeps every preview concentric (equal gap on all sides); `max-w-full` caps any
          wide preview so nothing bleeds to the edges. */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-border bg-muted/30 p-5">
        <div
          inert
          className="pointer-events-none flex h-full w-full select-none items-center justify-center [&>*]:max-w-full"
        >
          {preview ?? (
            <span className="flex size-16 items-center justify-center rounded-xl border border-border bg-card shadow-xs">
              <Icon weight="bold" className="size-7 text-muted-foreground" aria-hidden />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3">
        <Icon weight="bold" className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        {/* Stretched link: a sibling of the preview (not an ancestor), so previews that render
            their own anchor never produce nested `<a>`. `after:inset-0` makes the whole card the
            hit target; the preview is `pointer-events-none` so clicks fall through to it. */}
        <Link
          href={item.href}
          className="text-sm font-medium outline-none after:absolute after:inset-0 after:content-['']"
        >
          {item.title}
        </Link>
        <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
          {variantLabel(slugFromHref(item.href))}
        </span>
      </div>
    </div>
  )
}

export function ComponentsCatalog() {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  const sections = React.useMemo(() => {
    if (!q) return catalogSections
    return catalogSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.title.toLowerCase().includes(q)),
      }))
      .filter((section) => section.items.length > 0)
  }, [q])

  const shown = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-sm">
        <InputRoot>
          <InputPrefix>
            <MagnifyingGlass weight="bold" />
          </InputPrefix>
          <InputField
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TOTAL} components…`}
            aria-label="Search components"
          />
        </InputRoot>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No components match &ldquo;{query}&rdquo;. Try a different search.
        </p>
      ) : (
        sections.map((section) => (
          <section
            key={section.title}
            id={sectionId(section.title)}
            className="scroll-mt-24"
          >
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
              <span className="text-sm tabular-nums text-muted-foreground">
                {section.items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <ComponentCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        ))
      )}

      {q && shown > 0 && (
        <p className="text-sm text-muted-foreground">
          {shown} of {TOTAL} components
        </p>
      )}
    </div>
  )
}
