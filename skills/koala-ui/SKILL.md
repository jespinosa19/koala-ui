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
   examples, FAQ, and its exact exports.
3. Missing a component? Install it instead of writing a look-alike: `npx koalaui-cli add <name>`.
4. Compose Koala parts. Plain Tailwind is for the layout between components (flex, grid, gap,
   padding), not for rebuilding what a component already does.

## Install and update

```bash
npx koalaui-cli init                  # once per project: tokens, lib helpers, theme provider, base deps
npx koalaui-cli add button dialog     # one or more items, their dependencies pulled along
npx koalaui-cli list                  # everything available, free and Pro
npx koalaui-cli diff [item]           # what changed upstream since the install
npx koalaui-cli update [item]         # replace untouched files; files the project edited are kept
npx koalaui-cli skill                 # refresh this skill
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

Every component, the lib helpers and the tokens are free, and so is one sample section of each
marketing section family. The other sections, the page examples and the templates are Koala UI
Pro. `add` on a Pro item without an activated license prints a paywall and exits with an error:
tell the user the item needs a license (`npx koalaui-cli login <key>` activates one). Do not
rebuild a Pro section from its preview; compose the free components instead.

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
  import `easing` and `duration` from `@/lib/motion`.
- **Density:** `compact` or `comfortable`, set once for a subtree with `DensityProvider` from
  `@/lib/density` (app shells are compact, marketing pages comfortable). Density tunes spacing;
  control height is the separate `size` prop (`sm` 32, `md` 36, `lg` 40px). A container such as
  `Form` sets the default size of the controls inside it.

## Finding the docs

- This skill: `references/<name>.md` for each component, generated from its docs page.
- Any docs page as markdown: its URL plus `.md`, for example
  `https://koala-ui.vercel.app/docs/components/button.md` or
  `https://koala-ui.vercel.app/docs/foundations/colors.md`.
- The index of every page, with the install commands and conventions:
  `https://koala-ui.vercel.app/llms.txt`. Every free docs page in one file:
  `https://koala-ui.vercel.app/llms-full.txt`.

## Components

<!-- components:start -->
- [Accordion](references/accordion.md): A stack of disclosure rows built on Radix Accordion: keyboard nav, ARIA, and single or multiple expansion. The variant axis spans a flush minimal list, contained cards, a pill list that hugs its own text, and a board grid.
- [Activity Feed](references/activity-feed.md): A vertical timeline of what happened: comments, mentions, status changes, uploads, members joining. One rail threads every event, while each row varies its marker and its body, from a terse audit log to a rich inbox.
- [AI Panel](references/ai-panel.md): The assistant sidepanel: a header, a scrollable conversation and a pinned composer in one column. Drop a Chat in the body and a Prompt Input in the footer. Pure layout, so it docks in a page or drops into a Drawer.
- [Alert](references/alert.md): An inline status banner for page-level messages, validation summaries, and contextual feedback. Five semantic variants, optional icon, actions, and a dismiss button.
- [Animated Label](references/animated-label.md): Text that rolls when it changes state: the outgoing label lifts out while the incoming one rises from below, and the box eases between the two widths. The prose sibling of Animated Number: Next to Done, Weak to Strong.
- [Animated Number](references/animated-number.md): A figure that rolls when it changes, one character at a time: each changed digit lifts out while its replacement rises from below. Backed by the motion tokens and tabular-nums, so the width never jumps.
- [Announcement](references/announcement.md): The pill above a hero title: a standing label paired with the thing being announced. Single-element like Badge, and it nests a Badge for the announced half without drawing a second border around it.
- [Authentication](references/auth-form.md): The sign-in and sign-up pair, shipped as two ready blocks: social providers, an email and password core, and the cross-link to its sibling. Sign-up adds a name field and a live password-strength meter.
- [Avatar](references/avatar.md): Represents a user with an image, initials fallback, and optional presence status. Multi-part over Radix Avatar; size and shape flow to every part through Context.
- [Avatar Group](references/avatar-group.md): An overlapping stack of avatars with built-in overflow. Cap how many show and the rest fold into a +N chip. The group owns the overlap, the ring separation and the hover lift; the children stay plain Avatars.
- [Badge](references/badge.md): A compact label for status, counts, and categories. Single-element like Button; status variants are soft tints derived from semantic tokens, so they re-theme everywhere.
- [Badge Group](references/badge-group.md): A cluster of badges with built-in overflow. Cap how many show inline and the rest fold into a +N chip that reveals the full list in a tooltip, so a long set of tags never blows out its row.
- [Banner](references/banner.md): A full-bleed announcement bar for promos, release notes and site-wide notices. Soft tones tint the background, message, icon and action from one semantic token, so the whole bar reads as a single hue.
- [Bento](references/bento.md): An asymmetric marketing grid of feature tiles. Named parts you assemble: a tinted icon, a balanced title, a description and a media region. Each tile claims a size and a tone, and the grid collapses to one column.
- [Breadcrumb](references/breadcrumb.md): Shows the user's location within a site hierarchy. A multi-part navigation landmark built from semantic HTML with no shared state between parts.
- [Button](references/button.md): Triggers an action or event. The reference single-element component: one tv recipe, Radix Slot for asChild, semantic tokens only.
- [Button Group](references/button-group.md): A set of related buttons arranged as a visual unit. Supports attached (fused pill) and detached (spaced) layouts, with shared variant, size, and density propagated via context.
- [Card](references/card.md): A surface that groups related content. The reference multi-part component: one tv recipe with slots, shared variants flowing to every part through React Context.
- [Carousel](references/carousel.md): A horizontal slide viewer with a clickable indicator. The track translates between full-width slides, arrow keys step it, and the indicator ships with a closed set of forms: dots, lines, fraction, thumbnails.
- [Chart](references/chart.md): A dependency-free plotting primitive for line, area and bar trends. Compose the named parts (grid, axes, series, tooltip) into one measured SVG. Series paint from semantic hues, so every chart re-themes.
- [Chat](references/chat.md): The AI conversation thread, the second piece of the AI module. The assistant answers as a document, the Notion and ChatGPT style; the user turn stays a bubble. Streaming and reasoning included.
- [Checkbox](references/checkbox.md): A control for a binary or tri-state choice, built on Radix Checkbox. Supports the indeterminate state a “select all” needs. It's the same control the DataTable uses for row selection.
- [Checklist](references/checklist.md): The onboarding panel: a card that tracks a short list of setup tasks and their progress. The bar and the 3-of-6 read-out derive from value and total, and the bar turns green the moment every step is done.
- [Code Snippet](references/code-snippet.md): A polished code block: rounded surface, optional window chrome, copy-on-hover, line numbers and token-driven highlighting. The highlighter is a small, dependency-free tokenizer for TS/TSX, shell and CSS.
- [Color Picker](references/color-picker.md): A full HSV color picker in one panel: a HEX/HSL/RGB switcher, a draggable saturation square, hue and alpha rails, channel fields, an eyedropper and a preset palette. The rails ride Radix Slider for keyboard and ARIA.
- [Command](references/command.md): A searchable command palette: the Cmd-K menu. Arrows move the highlight, Enter runs the active row, and focus never leaves the input. Built on Radix Dialog; filtering and the roving highlight are hand-rolled.
- [Contact Form](references/contact-form.md): A family of ready get-in-touch blocks on one recipe: ContactForm, LeadForm for sales, and SupportForm for help-desk requests. Each wires its controls through Field, owns its state and confirms on submit.
- [Context Menu](references/context-menu.md): The actions menu that opens where you right-click. Built on Radix ContextMenu for keyboard navigation and a11y; it shares its surface and density with Dropdown Menu, but anchors to the cursor.
- [Cookie Consent](references/cookie-consent.md): A GDPR-ready consent surface in two coordinated pieces over one shared state: a non-blocking banner and a preferences dialog with a toggle per cookie category. The parts are the real DS components.
- [Data Table](references/data-table.md): A data grid built on TanStack Table for behavior (sorting, grouping, row selection, column pinning) with Koala styling on top. Drive features from column defs, or compose the styled primitives directly.
- [Date Picker](references/date-picker.md): A calendar surface plus two ready pickers, single date and range, over Radix Popover with native Date math and no date dependency. Selection reads the brand accent; the in-range fill stays neutral.
- [Description List](references/description-list.md): A semantic key/value detail view for records: profiles, invoices, settings read-outs. It renders a real dl/dt/dd tree, splits term and value at sm, and any value cell composes Koala parts like Badge or Avatar.
- [Dialog](references/dialog.md): A modal window over the page. Built on Radix Dialog for focus trap, scroll lock, and a11y; styled with one tv slots recipe and animated with interruptible enter/exit.
- [Divider](references/divider.md): A thin rule that separates content, optionally with a centered label. Smart by default: it collapses when it would be orphaned, so a dynamic list never leaves a rule at the edge or over an empty state.
- [Dock](references/dock.md): A floating rail of icon controls that morphs, in place, into a labelled menu with drill-down layers. One box animates its own width, height and corner, so the rail becomes the menu instead of opening a second surface.
- [Drawer](references/drawer.md): A panel that slides in from any edge of the screen. Built on Radix Dialog for focus trap, scroll lock and a11y; tuned for mobile with full-bleed side panels, a bottom-sheet grab handle, and swipe-to-dismiss.
- [Dropdown Menu](references/dropdown-menu.md): A contextual menu that opens on trigger. Built on Radix DropdownMenu for keyboard navigation, focus management, and a11y; animated with interruptible enter/exit transitions.
- [Emoji Picker](references/emoji-picker.md): A complete picker: searchable, with a scroll-spy category nav, a pinned frequently-used row, persisted recents and a hovered preview. Categories mount lazily, so a large set never paints at once.
- [Empty State](references/empty-state.md): The zero-data, no-results and first-run placeholder. A neutral icon tile, a balanced title, a readable description and a single outline action, composed from named parts, with a density axis for in-panel use.
- [FAQs](references/faqs.md): A marketing-ready frequently-asked-questions section built on the Accordion. It pairs a header with a single-expand question list and an optional contact CTA, in a centered stack or a sticky two-column split.
- [Feedback Form](references/feedback-form.md): A compact sentiment and comment block. A row of five faces reveals an optional comment field once one is picked, then submits. It owns its rating and message state; wire onSubmit to your sink.
- [Field](references/field.md): The wrapper that turns any control into a labelled form field. Field generates the id, htmlFor and aria-describedby wiring for you and cascades error and disabled state to the control inside.
- [File Card](references/file-card.md): A card for a single file: a realistic file-type illustration or image thumbnail, the name, a meta line, trailing actions and an optional progress bar. Composes into attachment rows and upload trays.
- [File Upload](references/file-upload.md): The uploading experience: a drag-and-drop dropzone, a browse trigger, import shortcuts and built-in accept, size and count validation. Pairs with File Card for the resulting rows and per-file progress.
- [Footer](references/footer.md): A composable site footer for marketing, product and ecommerce pages. Pure layout: a brand column plus grouped link columns up top, and a bottom bar with copyright, legal links and social icons.
- [Form](references/form.md): The anatomy layer above Field. Field solves one labelled control; Form owns everything around them: the form element and its rhythm, the chapters of a long form, the fieldset, and the bar that closes it.
- [Gallery](references/gallery.md): A marketing concepts wall: a balanced headline and lead, an optional tab rail to switch template categories, and a full-bleed fake-masonry of framed preview tiles. Our own Tabs, plus plain CSS columns.
- [Generation](references/generation.md): The card a model fills while it paints a picture. The frame is sized by its ratio before there is anything to put in it, so nothing jumps, and the picture comes in from the top out of a halftone field of dots.
- [Hero](references/hero.md): A centered marketing hero section. Named parts you assemble: an announcement eyebrow, a balanced headline, a subtitle, a CTA row, a check-circle feature list and an integrated social-proof row.
- [Input](references/input.md): A compound text field with a label, optional hint, prefix icons, suffix icons, prefix labels, and interactive suffix buttons. Built with slots and Context - each part is a named export.
- [Input Group](references/input-group.md): Joins several controls, a field, a Select, a static affix, a small icon-only action, into one seamless segmented shell. The group owns the border and focus ring; each segment goes chromeless and melts in.
- [Job Card](references/job-card.md): The canonical open-role block: a category badge, the role title, a one-line summary and a meta tier of location, employment type and salary band. Renders as a chrome-less row or a bordered card.
- [Kbd](references/kbd.md): A keyboard key indicator for documenting shortcuts. Renders a native <kbd>; the default variant is a flat gray chip (no border, no shadow) that re-themes everywhere. Compose combos by placing several side by side.
- [Label](references/label.md): The one label and helper-text recipe behind every form control in Koala. Input, Field and OTP Input all compose Label and Hint, and inside a Field they auto-wire their own ids, htmlFor and aria.
- [Layout](references/layout.md): The application and page shell. One set of parts and two app shells that share it: plain, the classic rail-and-content layout, and docked, the default, with the rail on a recessed canvas.
- [Lightbox](references/lightbox.md): A full-screen, browsable image viewer over Radix Dialog. Give it the image list once and any LightboxTrigger opens it at that index. Page between images with arrow buttons, arrow keys and a thumbnail rail.
- [Link](references/link.md): The text link, in both house treatments. default and muted are the standalone UI link for chrome, warming to the brand accent on hover; prose is the hyperlink embedded in running copy, underlined at rest.
- [List](references/list.md): The canonical vertical list group: stacked rows with leading media, a title and description, and trailing meta or actions. Rows are inert by default and become links or buttons via asChild.
- [Load More](references/load-more.md): Clamps a long region to a couple of rows, fades its cut edge, and puts one reveal button under it. The fade is a mask, not a painted gradient, so it works unchanged on any surface.
- [Multi Select](references/multi-select.md): A select that picks many values and stays open while you toggle them. Radix Select closes on pick, so this is built on Radix Popover instead, matching Select's surface with a checkbox or switch per row.
- [Navbar](references/navbar.md): A composable top navigation bar for marketing, product and ecommerce shells. Layout is composition, not configuration: a NavbarSpacer pushes groups apart. Collapses to a hamburger disclosure below md.
- [Newsletter Form](references/newsletter-form.md): A ready-to-ship email-capture block. It owns its own email state, validates the address and runs the loading to success flow. Two layouts: a self-contained card and a single-row inline signup.
- [Order Summary](references/order-summary.md): The checkout and cart order read-out. One composable card that stacks line items, a promo-code band and a totals breakdown, with every price on tabular-nums so the column never jitters.
- [OTP Input](references/otp-input.md): A numeric one-time-passcode field. Auto-advances on entry, distributes pasted codes across slots, and supports SMS autofill on mobile. Configure the digit count, size, and error state with plain props.
- [Pagination](references/pagination.md): A toolbar for navigating a paged dataset: current page and total, prev/next, a go-to-page field and a rows-per-page select. Each addon is toggled by a show* boolean, from a bare bar to a full footer.
- [Password Strength](references/password-strength.md): A live strength meter for password fields: a segmented bar that climbs red to green, a one-word verdict and an optional requirements checklist. It scores the value against a rule set you control.
- [Payment Form](references/payment-form.md): A complete card-checkout block. The number, expiry and CVC are masked as you type, the card brand is detected live, and the billing country shows circular flags. Accept promo codes to roll the total.
- [Logos](references/placeholder-logos.md): Placeholder brand logos: fictional companies, each a colored symbol beside an invented wordmark, plus a small set of real marks. Pure inline SVG, no binary assets.
- [Plan](references/plan.md): The card an assistant hands you before it acts: what it intends to do, as a short list of to-dos you can read, edit and approve. Deliberately quiet, so status lives in a small mark at the head of each row.
- [Popover](references/popover.md): A general-purpose floating surface over Radix Popover: focus management, dismiss and collision-aware positioning. Hosts forms, pickers and info cards, with an exposed --surface so nested controls blend in.
- [Pricing](references/pricing.md): A responsive marketing pricing table. Named parts you assemble into plan cards: a name, a big tabular price, a feature checklist and a bottom-pinned call to action. Mark the recommended plan featured.
- [Pricing Comparison](references/pricing-comparison.md): A feature-by-feature pricing matrix: rows are features, columns are plans, and each cell is a check, a minus or a value. Group rows into sections, highlight the recommended plan, and hang a tooltip off any row.
- [Progress](references/progress.md): A bar that reports how far along something is. Built on Radix Progress, so the value is announced to assistive tech for free. The label and readout are droppable parts, and a chrome variant strips the track.
- [Promo Card](references/promo-card.md): The in-app feature promotion for dashboards: a product eyebrow, a short pitch and one quiet action, beside a framed peek of the feature that runs off the card's edge and dissolves into it.
- [Prompt Input](references/prompt-input.md): The AI composer: an auto-growing textarea with a built-in toolbar and a send or stop button. Wire onSubmit once and the textarea, model picker, count and submit stay in sync through context.
- [Prose](references/prose.md): The reading type. Wrap a document, CMS rich text, rendered Markdown or plain JSX, and its bare headings, lists, quotes, code and tables are typeset on Koala's tokens, with one size prop.
- [QR Code](references/qr-code.md): A QR code rendered as crisp, dependency-free SVG. The matrix is generated in-house, byte mode, ECC levels L through H, with automatic version and mask selection, and paints in the current text color.
- [Radio Group](references/radio-group.md): A set of mutually exclusive options where exactly one can be selected, built on Radix RadioGroup. Sizes line up pixel-for-pixel with Checkbox, so radios and checkboxes sit flush in the same form.
- [Ranking](references/ranking.md): A leaderboard card for the tops of a dashboard: products, customers or countries. Read it as stacked rows or a vertical bar chart, each row carrying a position chip, a value and a relative-share bar.
- [Rating](references/rating.md): A 1-to-N star rating built on Radix RadioGroup: roving focus, arrow keys and hover preview for free. Active stars render solid, the one place the DS opts out of its outline-only rule, and half stars read cleanly.
- [Resizable](references/resizable.md): Split a surface into panels the user can drag to resize. No Radix primitive ships this, so the handle is hand-rolled: it carries role=separator, is arrow-key operable, and reports through aria-valuenow.
- [Rich Text Editor](references/rich-text-editor.md): A WYSIWYG editor for formatted prose: headings, bold, italic, underline, links and lists. Built on Tiptap for selection, undo and paste, with every pixel of UI owned as a Koala tv recipe.
- [Section](references/section.md): The content half of every marketing section: a full-bleed band and a centered 1280px gutter with a canonical gap to the content below. Pair it with SectionHeader and every block shares one rhythm.
- [Section Header](references/section-header.md): The lede every section opens with: a Badge eyebrow, a balanced heading, a supporting paragraph and a CTA row. Two axes, align and orientation, recompose it, so every block on the page shares one rhythm.
- [Select](references/select.md): A dropdown for picking one value from a list. Built on Radix Select for keyboard navigation, type-ahead and a11y, with interruptible enter and exit. Its sibling SelectSearch adds a search field.
- [Settings Form](references/settings-form.md): An account-profile editing block: an avatar with change and remove controls, a name row, a prefixed username, email and a bio with a live count, closed by a Cancel and Save footer.
- [Sheet](references/sheet.md): A panel that stays open over a full-bleed canvas like a map: a floating card on a wide container, a bottom sheet with three detents on a narrow one. Unlike Drawer, it never blocks the page.
- [Sidebar](references/sidebar.md): The application navigation rail. Stack the parts you need: a workspace switcher up top, the primary pages first, labeled sections and favorites below, and a profile switcher pinned to the bottom.
- [Skeleton](references/skeleton.md): A loading placeholder that mirrors the shape of the content it stands in for. Single-element like Badge; the fill is a semantic token, so it re-themes everywhere, and the optional shimmer rides the shared motion tokens.
- [Slider](references/slider.md): Pick a value or a range by dragging along a track. Built on Radix Slider: thumbs auto-render from the value array, with an optional live bubble and full keyboard support. SliderInput pairs a rail with a number.
- [Spinner](references/spinner.md): The one loading glyph in the system. It takes its size from whatever holds it and its color from the text around it, and it is announced once, never twice.
- [Stat](references/stat.md): A KPI/metric card for dashboards: a label, a big tabular-nums value, a directional trend chip, and optional icon or sparkline. Compose the named parts into a tile, then drop a row of them above a Data Table.
- [Stepper](references/stepper.md): A progress indicator for sequential flows: onboarding, checkout and multi-step dialogs. Each step derives its state from a single active value, and the connecting line fills as you advance.
- [Suggestions](references/suggestions.md): Inline AI edit suggestions over a body of text. The AI marks spans with a colored dotted underline; click one to see the proposed replacement and a reason, then apply it in place or dismiss it.
- [Survey](references/survey.md): Google-Forms-style question cards: an eyebrow, a title with an optional required asterisk, and an answer. Survey owns the layout and semantics; the controls are the real DS components.
- [Switch](references/switch.md): A toggle for an instant, self-applying boolean, built on Radix Switch. Use it for settings that take effect immediately (notifications, airplane mode); reach for a Checkbox when the choice is submitted with a form.
- [Tabs](references/tabs.md): Switch between related panels. Built on Radix Tabs for behavior and a11y, styled with one tv slots recipe. The active state is a single indicator measured in JS and slid with transform.
- [Team Member](references/team-member.md): The person block of a team roster: a photo frame, the name, the role, an optional bio and a row of social links. Stacked, inline or set over the photo, as a plain block or an outline card.
- [Testimonials](references/testimonials.md): A minimal quote card for social-proof walls. Named parts you assemble: an optional quote mark, the quote, an author row and an optional logo. Stars come from Rating, the headshot from Avatar.
- [Textarea](references/textarea.md): A multi-line text field built from slots and Context: pairs with a label and hint, grows to fit its content, and carries an optional character counter in its footer. Each part is a named export.
- [Toast](references/toast.md): Transient status messages anchored to a corner. Toasts stack with a compressed fan when several are queued, hover to expand, follow a promise from loading to its result, and update in place.
- [Toggle Group](references/toggle-group.md): A set of pressable pills that hold a selection, built on Radix ToggleGroup. Use single for a one-of-N choice or multiple for independent toggles. A chosen pill carries the brand outline.
- [Toolbar](references/toolbar.md): A keyboard-navigable band that groups icon controls, dropdown triggers, toggle sets and separators into one unit. Built on Radix Toolbar, so it ships roving tab focus and arrow-key movement.
- [Tooltip](references/tooltip.md): A small hint shown on hover or focus. Positioning, hover-intent and a11y come from Tippy.js in headless mode - Koala owns the bubble's markup, styled with our tokens. The one component built on a non-Radix primitive.
- [Tree](references/tree.md): A nesting tree view for file explorers, category browsers and any hierarchy. Built on Radix Collapsible, with single selection, full keyboard navigation and CSS guide rails that trace every level.
- [Video Player](references/video-player.md): A native way to play media: a real video element wrapped in a composable control surface. The scrubber and volume bar are Radix Sliders, and the controls auto-hide and stay legible over any frame.
- [Waitlist Form](references/waitlist-form.md): A centered waitlist block: a headline, a one-row email capture and a social-proof footer with overlapping avatars and a running count. On submit it flips to a confirmed state; wire onJoin to your list.
<!-- components:end -->
