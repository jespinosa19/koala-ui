---
name: koala-ui
description: Build React UI with Koala UI, the owned-source design system on Tailwind CSS v4, Radix UI and tailwind-variants. Use when writing, editing or reviewing components, pages, forms, dashboards or marketing sections in a project that uses Koala UI (a koala.json at the root, components under components/ui), when installing or updating Koala components with the koalaui CLI, or whenever the user asks for Koala by name.
---

# Koala UI

Koala UI is a React design system that its CLI copies into the project as source. The code in
`components/ui/<name>/` belongs to the project: read it, compose it, and change it when the task
needs it. There is no `koala-ui` package to import from.

## Before you write UI

1. Check what is installed: `koala.json` at the project root and the folders in `components/ui/`.
2. Read the reference of every component you are about to use, `references/<name>.md` in this
   skill (the index is at the end). It is that component's docs page: parts, variants, sizes,
   examples, FAQ, and its exact exports. A Pro component has no reference: read its source in
   `components/ui/<name>/`.
3. Missing a component? Install it instead of writing a look-alike: `npx koalaui-cli@latest add <name>`.
   A Pro one needs a license (see Free and Pro).
4. Compose Koala parts. Plain Tailwind is for the layout between components (flex, grid, gap,
   padding), not for rebuilding what a component already does.

## Install and update

```bash
npx koalaui-cli@latest init                  # once per project: tokens, lib helpers, theme provider, base deps
npx koalaui-cli@latest add button dialog     # one or more items, their dependencies pulled along
npx koalaui-cli@latest list                  # everything available, free and Pro
npx koalaui-cli@latest diff [item]           # what changed upstream since the install
npx koalaui-cli@latest update [item]         # replace untouched files; files the project edited are kept
npx koalaui-cli@latest skill                 # refresh this skill
```

- `init` writes the tokens to `koala.css`, imports them from the stylesheet that imports Tailwind,
  and adds `lib/utils.ts` (`cn`), `lib/tv.ts` (the `tv` wrapper) and
  `components/theme-provider.tsx`. It tells Next.js and Vite apart:
  - **Next.js:** tokens in `app/koala.css`, imported from `app/globals.css`. The root layout loads
    Inter as `--font-sans` and DM Sans as `--font-heading` with `next/font`, and wraps the `<body>`
    content in `ThemeProvider`.
  - **Vite:** everything under `src/`, tokens in `src/styles/koala.css`, imported from
    `src/index.css`, where `init` also wires both faces from `@fontsource-variable`. `src/main.tsx`
    wraps `<App />` in `ThemeProvider`.
- A single-theme app pins it: `<ThemeProvider forcedTheme="dark">`.
- Coming from shadcn/ui: `init` replaces its stock `lib/utils.ts`, and `add` refuses while a flat
  `components/ui/<name>.tsx` would shadow Koala's folder. Delete that file first, then add.
- Everything imports through the `@/*` path alias: `import { Button } from "@/components/ui/button"`.
- `koala.json` records each installed item and a fingerprint of each file; it belongs in git.
  `update` leaves a file the project edited alone unless `--force` is passed. Ask before forcing:
  it discards those edits.

## Free and Pro

The foundation components (the ones indexed under Components below), the lib helpers and the
tokens are free. The other components, listed under Pro components, and every section, page
example and template are Koala UI Pro. With a license activated on the machine
(`npx koalaui-cli@latest login <key>`), `add` installs a Pro item like a free one; without it, `add`
prints a paywall and exits with an error. Then tell the user the item is Pro and needs a license.
Do not rebuild a Pro component or section from its docs or preview: use it once it is installed,
or compose the free components instead. A Pro component already in `components/ui/` belongs to the
project like any other; read its source there.

## House rules

- **Named exports, composed parts.** A multi-part component is a set of named exports used
  together: `<Card><CardHeader><CardTitle>`. Never dot-notation (`Card.Header`): namespaced
  statics do not survive the React Server Components boundary.
- **Parts are droppable.** Leave out the part you do not need instead of looking for a `showX`
  prop. Boolean props are for appearance or state (`divided`, `loading`), never for whether a
  part exists.
- **`tv`, never `cva`.** Variant recipes use `tv` from `@/lib/tv` (tailwind-variants with Koala's
  merge config), with `slots` for multi-part components. Merge classes with `cn` from `@/lib/utils`.
- **`className` on everything**, merged last, so a one-off override needs no new prop. Every part
  carries a `data-slot` attribute (`card-header`); style a child from its parent with
  `[&_[data-slot=card-title]]:text-lg` rather than by element order.
- **Tokens only.** No hex, `rgb()`, `oklch()`, `cubic-bezier()` or millisecond literals inside a
  component: use the color roles, the radius and shadow scales and the motion utilities below.
- **Radix first.** Focus, keyboard and ARIA come from Radix primitives (`radix-ui`). Do not
  hand-roll a dialog, menu, popover or tabs.
- **React 19.** `ref` is a regular prop; there is no `forwardRef`.
- **Buttons.** `variant="primary"` carries the brand and is the one action a screen leads with.
  The others are `neutral`, `secondary`, `outline`, `ghost`, `destructive`, `destructiveGhost`
  and `link`. Sizes: `sm` 32px, `md` 36px (the default), `lg` 40px, and `xl` 44px for marketing
  calls to action. Buttons are text-first: add an icon only when it clarifies the action.
- **Icons** are Phosphor (`@phosphor-icons/react`, or `@phosphor-icons/react/ssr` in a Server
  Component) at `weight="bold"`; `fill` is for selected and status glyphs only.
- **Interactive elements** get `cursor-pointer`, a visible `focus-visible` state, and a hit area
  of at least 40px: use `hitX`, `hitBox` or `hitY` from `@/lib/hit-area`.
- **Numbers that change** (counters, prices, timers) get `tabular-nums`.
- **Transitions name their properties** (`transition-colors`, `transition-[opacity,translate]`),
  never `transition-all`. In Tailwind v4 `scale-*` and `translate-*` are their own properties, so
  a `transition-transform` or an explicit `scale` in the list is what animates them.

## Tokens and themes

Colors are semantic roles backed by CSS variables, so one class is right in every theme.

| Role | Utilities |
| --- | --- |
| Page and surfaces | `bg-background`, `bg-canvas`, `bg-card`, `bg-popover`, `bg-muted`, `bg-secondary`, `bg-accent` |
| Text | `text-foreground`, `text-body` (reading copy), `text-muted-foreground` (meta), `text-link` |
| Brand | `bg-brand`, `text-brand`, `border-brand`, and the `brand-ring` utility for a focus halo |
| Actions | `bg-primary`, `text-primary-foreground`, `bg-destructive` |
| Status | `success`, `warning`, `info`, `destructive`; a soft tint is `bg-success/10 text-success-strong` |
| Lines and focus | `border-border`, `border-input`, `ring-ring` |
| Categories | `purple`, `pink`, `teal`, `orange` |

- **Themes:** `light`, `cream`, `dark`, `moonlight`, a class on `<html>` set by next-themes
  (`useTheme().setTheme("moonlight")`). A band that must stay dark on a light page takes the class
  itself: `<section className="dark">`. Never style with `dark:` hex values; the roles already flip.
- **Accents:** eight presets, set with `data-accent` on `<html>`: `orange` (the default), `red`,
  `amber`, `green`, `teal`, `blue`, `violet`, `pink`. Everything brand-colored follows `--brand`.
- **Radius:** one knob, `--radius` (16px). `rounded-sm` 8, `rounded-md` 12, `rounded-lg` 16,
  `rounded-xl` 20, `rounded-2xl` 24px, and `rounded-pill` for pills. Nested surfaces are
  concentric: outer radius = inner radius + padding.
- **Shadows:** `shadow-xs` to `shadow-xl`, tuned per theme. In-flow containers paint no fill of
  their own; elevation (a popover, a raised card) is what earns a surface.
- **Motion:** `ease-out`, `ease-in-out`, `ease-drawer`, `ease-spring`, `ease-sine` and
  `duration-fast` (160ms), `duration-base` (300ms), `duration-slow` (450ms). From JavaScript,
  import `easing` and `duration` from `@/lib/motion`. A surface that changes size with what it
  shows keeps one box and morphs it with `useMorphBox` from `@/lib/morph` (one radius, contents
  crossfading inside), never a swap to a second box.
- **Eyebrow:** the small caps label above a group or section is one class, `eyebrow` (12px,
  medium, `tracking-wider`, uppercase, muted ink), or `eyebrow-mono` for the monospace voice. Never
  hand-roll `text-[11px] uppercase tracking-wide text-muted-foreground`; tune one trait on top
  instead (`eyebrow font-semibold`, `eyebrow text-brand`).
- **Density:** `compact` or `comfortable`, set once for a subtree with `DensityProvider` from
  `@/lib/density` (app shells are compact, marketing pages comfortable). Density tunes spacing;
  control height is the separate `size` prop (`sm` 32, `md` 36, `lg` 40px). A container such as
  `Form` sets the default size of the controls inside it.

## Finding the docs

- This skill: `references/<name>.md` for each free component, generated from its docs page. A Pro
  component's docs page (API and usage) is at its URL plus `.md`.
- Any docs page as markdown: its URL plus `.md`, for example
  `https://www.koalaui.com/docs/components/button.md` or
  `https://www.koalaui.com/docs/foundations/colors.md`.
- The index of every page, with the install commands and conventions:
  `https://www.koalaui.com/llms.txt`. Every docs page in one file:
  `https://www.koalaui.com/llms-full.txt`.

## Components

<!-- components:start -->
- [Accordion](references/accordion.md): A stack of disclosure rows built on Radix Accordion: keyboard nav, ARIA, and single or multiple expansion. The variant axis spans a flush minimal list, contained cards, a pill list that hugs its own text, and a board grid.
- [Alert](references/alert.md): An inline status banner for page-level messages, validation summaries, and contextual feedback. Five semantic variants, optional icon, actions, and a dismiss button.
- [Animated Label](references/animated-label.md): Text that rolls when it changes state: the outgoing label lifts out while the incoming one rises from below, and the box eases between the two widths. The prose sibling of Animated Number: Next to Done, Weak to Strong.
- [Avatar](references/avatar.md): Represents a user with an image, initials fallback, and optional presence status. Multi-part over Radix Avatar; size and shape flow to every part through Context.
- [Avatar Group](references/avatar-group.md): An overlapping stack of avatars with built-in overflow. Cap how many show and the rest fold into a +N chip. The group owns the overlap, the ring separation and the hover lift; the children stay plain Avatars.
- [Badge](references/badge.md): A compact label for status, counts, and categories. Single-element like Button; status variants are soft tints derived from semantic tokens, so they re-theme everywhere.
- [Breadcrumb](references/breadcrumb.md): Shows the user's location within a site hierarchy. A multi-part navigation landmark built from semantic HTML with no shared state between parts.
- [Button](references/button.md): Triggers an action or event. The reference single-element component: one tv recipe, Radix Slot for asChild, semantic tokens only.
- [Button Group](references/button-group.md): A set of related buttons arranged as a visual unit. Supports attached (fused pill) and detached (spaced) layouts, with shared variant, size, and density propagated via context.
- [Card](references/card.md): A surface that groups related content. The reference multi-part component: one tv recipe with slots, shared variants flowing to every part through React Context.
- [Checkbox](references/checkbox.md): A control for a binary or tri-state choice, built on Radix Checkbox. Supports the indeterminate state a “select all” needs. It's the same control the DataTable uses for row selection.
- [Collapsible](references/collapsible.md): One region that opens under its trigger: show more, advanced settings, the log behind an error. No chrome of its own, a height tween on the system's motion tokens, and a mark that turns rather than swaps.
- [Combobox](references/combobox.md): A text field that filters a list as you type. The field is Koala's Input and the list is Select's panel, so it sits beside both without a seam. Autocomplete is the free-text sibling.
- [Context Menu](references/context-menu.md): The actions menu that opens where you right-click. Built on Radix ContextMenu for keyboard navigation and a11y; it shares its surface and density with Dropdown Menu, but anchors to the cursor.
- [Dialog](references/dialog.md): A modal window over the page. Built on Radix Dialog for focus trap, scroll lock, and a11y; styled with one tv slots recipe and animated with interruptible enter/exit.
- [Divider](references/divider.md): A thin rule that separates content, optionally with a centered label. Smart by default: it collapses when it would be orphaned, so a dynamic list never leaves a rule at the edge or over an empty state.
- [Drawer](references/drawer.md): A panel that slides in from any edge of the screen. Built on Radix Dialog for focus trap, scroll lock and a11y; tuned for mobile with full-bleed side panels, a bottom-sheet grab handle, and swipe-to-dismiss.
- [Dropdown Menu](references/dropdown-menu.md): A contextual menu that opens on trigger. Built on Radix DropdownMenu for keyboard navigation, focus management, and a11y; animated with interruptible enter/exit transitions.
- [Field](references/field.md): The wrapper that turns any control into a labelled form field. Field generates the id, htmlFor and aria-describedby wiring for you and cascades error and disabled state to the control inside.
- [Hover Card](references/hover-card.md): A preview that opens while the pointer rests on a link: the profile behind a mention, the page behind a link, the commit behind a hash. Popover's surface, grown out of the link it previews.
- [Input](references/input.md): A compound text field with a label, optional hint, prefix icons, suffix icons, prefix labels, and interactive suffix buttons. Built with slots and Context - each part is a named export.
- [Input Group](references/input-group.md): Joins several controls, a field, a Select, a static affix, a small icon-only action, into one seamless segmented shell. The group owns the border and focus ring; each segment goes chromeless and melts in.
- [Kbd](references/kbd.md): A keyboard key indicator for documenting shortcuts. Renders a native <kbd>; the default variant is a flat gray chip (no border, no shadow) that re-themes everywhere. Compose combos by placing several side by side.
- [Label](references/label.md): The one label and helper-text recipe behind every form control in Koala. Input, Field and OTP Input all compose Label and Hint, and inside a Field they auto-wire their own ids, htmlFor and aria.
- [Link](references/link.md): The text link, in both house treatments. default and muted are the standalone UI link for chrome, warming to the brand accent on hover; prose is the hyperlink embedded in running copy, underlined at rest.
- [Menubar](references/menubar.md): The File, Edit, View row of a desktop-style app. One tab stop, arrow keys across the menus, and once one is open the next opens on hover. The menus are Dropdown Menu's panels, so both read as one object.
- [Native Select](references/native-select.md): The browser's own select, dressed as Koala's Select trigger. The list that opens is the operating system's: the wheel on iOS, the sheet on Android. Closed, it is indistinguishable from a Select of the same size.
- [Number Field](references/number-field.md): A numeric input with steppers, a scrub-to-change label, keyboard stepping and Intl formatting. It is an Input underneath, so it sizes, focuses and joins an InputGroup like any other field.
- [Pagination](references/pagination.md): A toolbar for navigating a paged dataset: current page and total, prev/next, a go-to-page field and a rows-per-page select. Each addon is toggled by a show* boolean, from a bare bar to a full footer.
- [Popover](references/popover.md): A general-purpose floating surface over Radix Popover: focus management, dismiss and collision-aware positioning. Hosts forms, pickers and info cards, with an exposed --surface so nested controls blend in.
- [Progress](references/progress.md): A bar that reports how far along something is. Built on Radix Progress, so the value is announced to assistive tech for free. The label and readout are droppable parts, a chrome variant strips the track, and a duration makes it a self-running countdown.
- [Radio Group](references/radio-group.md): A set of mutually exclusive options where exactly one can be selected, built on Radix RadioGroup. Sizes line up pixel-for-pixel with Checkbox, so radios and checkboxes sit flush in the same form.
- [Scroll Area](references/scroll-area.md): A scrolling region with Koala's own scrollbar: an ink pill that overlays the content, shows while you are over it, fades rather than blinks, and looks the same on every OS and theme. The scrolling itself stays native.
- [Select](references/select.md): A dropdown for picking one value from a list. Built on Radix Select for keyboard navigation, type-ahead and a11y, with interruptible enter and exit. Its sibling SelectSearch adds a search field.
- [Sheet](references/sheet.md): A panel that stays open over a full-bleed canvas like a map: a floating card on a wide container, a bottom sheet with three detents on a narrow one. Unlike Drawer, it never blocks the page.
- [Skeleton](references/skeleton.md): A loading placeholder that mirrors the shape of the content it stands in for. Single-element like Badge; the fill is a semantic token, so it re-themes everywhere, and the optional shimmer rides the shared motion tokens.
- [Slider](references/slider.md): Pick a value or a range by dragging along a track. Built on Radix Slider: thumbs auto-render from the value array, with an optional live bubble and full keyboard support. SliderInput pairs a rail with a number.
- [Spinner](references/spinner.md): The one loading glyph in the system. It takes its size from whatever holds it and its color from the text around it, and it is announced once, never twice.
- [Stepper](references/stepper.md): A progress indicator for sequential flows: onboarding, checkout and multi-step dialogs. Each step derives its state from a single active value, and the connecting line fills as you advance.
- [Switch](references/switch.md): A toggle for an instant, self-applying boolean, built on Radix Switch. Use it for settings that take effect immediately (notifications, airplane mode); reach for a Checkbox when the choice is submitted with a form.
- [Tabs](references/tabs.md): Switch between related panels. Built on Radix Tabs for behavior and a11y, styled with one tv slots recipe. The active state is a single indicator measured in JS and slid with transform.
- [Textarea](references/textarea.md): A multi-line text field built from slots and Context: pairs with a label and hint, grows to fit its content, and carries an optional character counter in its footer. Each part is a named export.
- [Toast](references/toast.md): Transient status messages at the bottom of the screen. Toasts stack with a compressed fan when several are queued, hover to expand, follow a promise from loading to its result, and update in place.
- [Toggle](references/toggle.md): One control that stays pressed: bookmark, pin, mute, unread only. The single-item sibling of Toggle Group, sharing its paint and its heights, with a pressed glyph that fills in instead of blinking.
- [Toggle Group](references/toggle-group.md): A set of pressable pills that hold a selection, built on Radix ToggleGroup. Use single for a one-of-N choice or multiple for independent toggles. A chosen pill carries the brand outline.
- [Tooltip](references/tooltip.md): A small hint shown on hover or focus. Positioning, hover-intent and a11y come from Tippy.js in headless mode - Koala owns the bubble's markup, styled with our tokens. The one component built on a non-Radix primitive.
<!-- components:end -->

## Pro components

These come with Koala UI Pro. With a license, `add` installs them like any other; without one,
tell the user the component is Pro instead of rebuilding it.

<!-- pro:start -->
- Activity Feed (`activity-feed`)
- AI Panel (`ai-panel`)
- Animated Number (`animated-number`)
- Announcement (`announcement`)
- Auth Form (`auth-form`)
- Badge Group (`badge-group`)
- Banner (`banner`)
- Bento (`bento`)
- Carousel (`carousel`)
- Channel Chat (`channel-chat`)
- Chart (`chart`)
- Chat (`chat`)
- Checklist (`checklist`)
- Chip (`chip`)
- Citation (`citation`)
- Code Snippet (`code-snippet`)
- Color Picker (`color-picker`)
- Command (`command`)
- Compare Slider (`compare-slider`)
- Contact Form (`contact-form`)
- Context Meter (`context-meter`)
- Cookie Consent (`cookie-consent`)
- Data Table (`data-table`)
- Date Picker (`date-picker`)
- Description List (`description-list`)
- Dock (`dock`)
- Dot (`dot`)
- Dot Matrix (`dot-matrix`)
- Emoji Picker (`emoji-picker`)
- Empty State (`empty-state`)
- Event Calendar (`event-calendar`)
- Expandable Search (`expandable-search`)
- Faqs (`faqs`)
- Feedback Form (`feedback-form`)
- File Card (`file-card`)
- File Icon (`file-icon`)
- File Preview (`file-preview`)
- File Upload (`file-upload`)
- Flag (`flag`)
- Floating Window (`floating-window`)
- Footer (`footer`)
- Form (`form`)
- Gallery (`gallery`)
- Generation (`generation`)
- Handheld Device (`handheld-device`)
- Heatmap (`heatmap`)
- Hero (`hero`)
- Hold Button (`hold-button`)
- Island (`island`)
- Job Card (`job-card`)
- Layout (`layout`)
- Lightbox (`lightbox`)
- List (`list`)
- Load More (`load-more`)
- Map (`map`)
- Meter (`meter`)
- Model Selector (`model-selector`)
- Multi Select (`multi-select`)
- Navbar (`navbar`)
- Navigation Menu (`navigation-menu`)
- Newsletter Form (`newsletter-form`)
- Notebook Page (`notebook-page`)
- Order Summary (`order-summary`)
- OTP Input (`otp-input`)
- Paper (`paper`)
- Password Strength (`password-strength`)
- Payment Form (`payment-form`)
- Placeholder Logos (`placeholder-logos`)
- Plan (`plan`)
- Pricing (`pricing`)
- Pricing Comparison (`pricing-comparison`)
- Promo Card (`promo-card`)
- Prompt Input (`prompt-input`)
- Prose (`prose`)
- Push To Talk (`push-to-talk`)
- Qr Code (`qr-code`)
- Ranking (`ranking`)
- Rating (`rating`)
- Receipt (`receipt`)
- Resizable (`resizable`)
- Rich Text Editor (`rich-text-editor`)
- Section (`section`)
- Section Header (`section-header`)
- Settings Form (`settings-form`)
- Sidebar (`sidebar`)
- Signature (`signature`)
- Signature Pad (`signature-pad`)
- Stat (`stat`)
- Status Bar (`status-bar`)
- Suggestions (`suggestions`)
- Survey (`survey`)
- Swatch Grid (`swatch-grid`)
- Tab Strip (`tab-strip`)
- Table of Contents (`table-of-contents`)
- Tablet Frame (`tablet-frame`)
- Team Member (`team-member`)
- Terminal (`terminal`)
- Testimonials (`testimonials`)
- Tool (`tool`)
- Toolbar (`toolbar`)
- Tree (`tree`)
- Video Player (`video-player`)
- Voice Roster (`voice-roster`)
- Waitlist Form (`waitlist-form`)
<!-- pro:end -->
