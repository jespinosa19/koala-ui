import type { Icon } from "@phosphor-icons/react"
import {
  Megaphone,
  Rocket,
  Moon,
  CursorClick,
  Timer,
  Article,
  ListChecks,
  Images,
} from "@phosphor-icons/react/ssr"

/**
 * Search index for the docs ⌘K palette (`DocsCommandMenu`), layered ON TOP of the sidebar nav so
 * the palette finds more than page titles. Two pieces:
 *
 *   1. `SEARCH_ALIASES` - synonyms/keywords keyed by a nav `href`. The palette folds these into the
 *      matching nav row's `keywords`, so "modal" finds Dialog, "snackbar" finds Toast, etc. The page
 *      title stays the only visible label; the aliases just widen what matches it.
 *   2. `EXAMPLE_GROUPS` - deep links to individual *variants within* a section page (the labeled
 *      previews on `/marketing/sections/*`). Each href carries a `#slug` anchor matching the
 *      `id` the section page puts on that preview (see PreviewFrame `id`), so choosing "Countdown
 *      timer" routes straight to that bar, not just the top of the Banner page.
 *
 * This module is intentionally DATA ONLY (icons + strings, no live components), so it is safe to
 * import into the client palette without dragging the section render tree into the client bundle
 * (unlike `sections-registry`, which is server-only). Keep the anchors in sync with the section
 * page slugs and the registry.
 */

export interface SearchEntry {
  /** Visible label and primary match target. */
  title: string
  /** Destination; may include a `#anchor` to deep-link a variant within a page. */
  href: string
  /** Phosphor icon shown before the label. */
  icon: Icon
  /** Extra terms matched beyond the title (synonyms, the parent component, ids…). */
  keywords?: string[]
}

export interface SearchGroup {
  heading: string
  items: SearchEntry[]
}

/**
 * Synonyms keyed by the nav `href`. Real-world names people reach for that don't appear in the
 * component's own title. Curated, not exhaustive: add an alias whenever search "should have found
 * it" but the literal title didn't match.
 */
export const SEARCH_ALIASES: Record<string, string[]> = {
  // Foundations
  "/docs/logos": ["logo", "brand", "wordmark", "logo wall", "logos", "customer logos", "placeholder", "trusted by", "app icon", "brand logos", "spotify", "trademark"],
  // Product
  "/docs/components/dialog": ["modal", "popup", "overlay", "lightbox"],
  "/docs/components/drawer": ["sheet", "off canvas", "slide over", "side panel"],
  "/docs/components/toast": ["snackbar", "notification", "flash message", "alert popup"],
  "/docs/components/select": ["combobox", "dropdown", "picker"],
  "/docs/components/multi-select": ["combobox", "tags", "chips", "tokens", "multi value"],
  "/docs/components/dropdown-menu": ["actions menu", "overflow menu", "kebab"],
  "/docs/components/context-menu": ["right click", "right-click menu", "long press menu", "actions menu"],
  "/docs/components/date-picker": ["calendar", "datepicker", "day picker", "schedule"],
  "/docs/components/skeleton": ["loading", "placeholder", "shimmer", "spinner"],
  "/docs/components/avatar-group": ["avatar stack", "faces", "people stack", "attendees"],
  "/docs/components/kbd": ["keyboard", "shortcut", "hotkey", "key"],
  "/docs/components/command": ["cmdk", "command palette", "spotlight", "quick search", "launcher"],
  "/docs/components/tooltip": ["hint", "popup hint", "info bubble"],
  "/docs/components/badge": ["tag", "chip", "pill", "label", "status dot"],
  "/docs/components/badge-group": ["tags", "chips", "tag cluster", "labels"],
  "/docs/components/otp-input": ["one time password", "verification code", "2fa", "pin code"],
  "/docs/components/data-table": ["grid", "spreadsheet", "datagrid", "rows"],
  "/docs/components/stat": ["kpi", "metric", "stat card", "number card"],
  "/docs/components/ranking": ["leaderboard", "top list", "standings"],
  "/docs/components/file-upload": ["dropzone", "upload", "attach", "import file"],
  "/docs/components/file-card": ["attachment", "upload row", "file row"],
  "/docs/components/rich-text-editor": ["wysiwyg", "tiptap", "editor", "prose"],
  "/docs/components/toggle-group": ["segmented control", "segmented", "button toggle", "tabs"],
  "/docs/components/switch": ["toggle", "on off"],
  "/docs/components/slider": ["range", "range input"],
  "/docs/components/pagination": ["pager", "page numbers", "load more"],
  "/docs/components/breadcrumb": ["breadcrumbs", "path", "trail"],
  "/docs/components/carousel": ["slider", "slideshow", "gallery slider", "swiper"],
  "/docs/components/accordion": ["collapse", "disclosure", "expander", "faq"],
  "/docs/components/tree": ["file tree", "nesting", "folders", "outline"],
  "/docs/components/activity-feed": ["timeline", "audit log", "history", "inbox"],
  "/docs/components/empty-state": ["no results", "blank slate", "zero state", "placeholder"],
  "/docs/components/color-picker": ["hue", "swatch", "eyedropper", "hex"],
  "/docs/components/emoji-picker": ["emoji", "reactions", "smileys"],
  "/docs/components/qr-code": ["qr", "barcode", "scan"],
  "/docs/components/resizable": ["split pane", "split view", "panes", "resize handle"],
  // Forms
  "/docs/components/auth-form": ["login", "sign in", "sign up", "register"],
  "/docs/components/payment-form": ["checkout", "card", "billing", "stripe"],
  "/docs/components/newsletter-form": ["subscribe", "email signup", "mailing list"],
  "/docs/components/waitlist-form": ["early access", "join list", "signup"],
  "/docs/components/password-strength": ["password meter", "strength meter"],
  // Marketing (components + sections)
  "/docs/components/cookie-consent": ["gdpr", "cookie banner", "consent", "privacy"],
  "/docs/components/pricing": ["plans", "tiers", "pricing table", "subscription"],
  "/docs/components/pricing-comparison": ["compare plans", "comparison table", "feature matrix", "pricing matrix", "feature comparison"],
  "/marketing/sections/banner": ["announcement bar", "promo bar", "topbar", "notice", "callout"],
  "/marketing/sections/hero": ["hero", "header section", "above the fold", "spotlight", "split", "video background", "image background", "full bleed media"],
  "/marketing/sections/feature": ["features", "component showcase", "video", "bento", "feature grid", "feature cards"],
  "/marketing/sections/gallery": ["gallery", "concepts wall", "masonry", "lightbox"],
  "/marketing/sections/testimonials": ["reviews", "quotes", "social proof", "testimonials"],
  "/marketing/sections/stats": ["stats", "metrics", "kpi", "by the numbers"],
  "/marketing/sections/pricing": ["pricing", "plans", "tiers", "pricing table"],
  "/marketing/sections/faq": ["faq", "questions", "accordion", "help"],
  "/marketing/sections/changelog": ["changelog", "release notes", "updates", "version history"],
  "/marketing/sections/cta": ["cta", "call to action", "install", "cli", "get started"],
  "/marketing/sections/footer": ["site footer", "bottom bar"],
  "/marketing/sections/navbar": ["nav", "top nav", "menu bar", "header nav"],
  "/marketing/pages/blog-post": ["blog post", "article page", "post page", "blog article", "editorial", "long form", "table of contents"],
}

/**
 * Deep links to the labeled variants inside section pages. Anchors (`#slug`) match the `id` each
 * preview gets on the section page. Add a group here when a section page stacks several previews
 * worth jumping to directly.
 */
export const EXAMPLE_GROUPS: SearchGroup[] = [
  {
    heading: "Banner examples",
    items: [
      {
        title: "Soft tones",
        href: "/marketing/sections/banner#banner",
        icon: Megaphone,
        keywords: ["banner", "announcement", "purple", "soft", "promo"],
      },
      {
        title: "On brand",
        href: "/marketing/sections/banner#banner-brand",
        icon: Rocket,
        keywords: ["banner", "solid", "brand", "accent", "release"],
      },
      {
        title: "On dark",
        href: "/marketing/sections/banner#banner-dark",
        icon: Moon,
        keywords: ["banner", "inverse", "dark", "solid"],
      },
      {
        title: "With a CTA button",
        href: "/marketing/sections/banner#banner-cta",
        icon: CursorClick,
        keywords: ["banner", "cta", "button", "trial", "upgrade"],
      },
      {
        title: "Countdown timer",
        href: "/marketing/sections/banner#banner-countdown",
        icon: Timer,
        keywords: ["banner", "countdown", "timer", "sale", "promo", "limited time", "deadline", "clock"],
      },
    ],
  },
  {
    heading: "Blog post pages",
    items: [
      {
        title: "Centered classic",
        href: "/marketing/pages/blog-post#blog-post-1",
        icon: Article,
        keywords: ["blog post", "article page", "centered", "long form", "editorial"],
      },
      {
        title: "With table of contents",
        href: "/marketing/pages/blog-post#blog-post-2",
        icon: ListChecks,
        keywords: ["blog post", "article page", "table of contents", "toc", "sticky sidebar", "scroll spy"],
      },
      {
        title: "Image-led hero",
        href: "/marketing/pages/blog-post#blog-post-3",
        icon: Images,
        keywords: ["blog post", "article page", "hero", "cover image", "full bleed", "overlay"],
      },
    ],
  },
]
