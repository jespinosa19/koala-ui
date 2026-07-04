# Koala UI - Foundations

The design-token layer. The guiding rule: **lean on Tailwind v4's defaults to the
maximum; only add a thin semantic layer on top.** If Tailwind already ships a scale,
we use it as-is and never redefine it.

Tokens live in [`app/globals.css`](../app/globals.css) under `@theme`. JS-side motion
tokens mirror them in [`lib/motion.ts`](../lib/motion.ts).

---

## What we take from Tailwind verbatim (do NOT redefine)

| Foundation | Source | Notes |
| --- | --- | --- |
| **Spacing** | Tailwind `--spacing` (0.25rem base) | The entire `p-*`/`m-*`/`gap-*`/`size-*` scale is generated dynamically. Use it. |
| **Type scale** | Tailwind `--text-xs … --text-9xl` | 16 steps, each with a paired line-height. |
| **Tracking / leading** | Tailwind `--tracking-*`, `--leading-*` | `tracking-tight`, `leading-relaxed`, etc. |
| **Breakpoints** | Tailwind `--breakpoint-sm … 2xl` | 40 / 48 / 64 / 80 / 96 rem. |
| **Containers** | Tailwind `--container-3xs … 7xl` | `max-w-*` and `@container` sizes. |
| **Color palette** | Tailwind's 27-color oklch palette | Available to consumers (`bg-blue-500`); our semantic tokens are the preferred API. |

## What Koala adds on top (the semantic layer)

These are the **only** tokens we author. Everything is themeable across the three
themes (`light`, `dark`, `moonlight`).

### Color - semantic tokens, not raw palette
Components reference **roles**, never palette values, so theming is centralized:
`bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `text-muted-foreground`,
`border-border`, `ring-ring`, `bg-destructive`, … Each role is a CSS variable
redefined per theme. **Rule: components never use `bg-zinc-900` directly - only roles.**

### Radius - one knob
Driven by a single `--radius` base; the scale is relative (`--radius-sm` =
`calc(var(--radius) * 0.6)` … up to `--radius-4xl`). Change one value, the whole
system re-rounds. This intentionally overrides Tailwind's fixed radius defaults.

### Shadows / elevation - per theme
`shadow-xs … shadow-xl` carry **per-theme** values (dark/moonlight surfaces need
heavier, cooler shadows to read). This overrides Tailwind's single rgb-based set.

### Motion
`--ease-out`, `--ease-in-out`, `--ease-drawer` and `--duration-fast|base|slow`,
exposed as utilities (`ease-out`, `duration-base`). Mirrored in `lib/motion.ts` for
JS animation. **Never inline a raw `cubic-bezier()` or ms value in a component.**

### Fonts
Two bundled typefaces. `--font-sans` (**Inter**) carries UI, body and the smaller headings
(`h3–h6`); `--font-heading` (**DM Sans**) is reserved for the display headings `h1–h2` in
`@layer base`, so the family swaps at the `h2`/`h3` boundary. `--font-mono` is a **system
monospace stack** (`ui-monospace, SFMono-Regular, Menlo, Consolas, …`) - used for code and
token labels, with nothing to download. Both faces are wired through `next/font` in
[`app/layout.tsx`](../app/layout.tsx); DM Sans also pulls in its optical-size axis (`opsz`)
alongside weight. Letterfit is tuned in `globals.css`: `font-optical-sizing: auto` plus
kerning/ligatures on `body`, and a small negative `letter-spacing` on `h1–h2` (DM Sans sets
a touch wider than Inter, so display headings want tightening; explicit `tracking-*`
utilities still win on specificity).

### Iconography - size by context, not one global value
Icons are [Phosphor](https://phosphoricons.com) (default **bold** weight; see the
`icons-always-outline` convention). Their size is tied to the surface, not fixed globally:

- **Text-label rows → 20px (`size-5`).** Any surface where a leading icon labels a text
  row: menus (`DropdownMenu`, `ContextMenu`), `Select` (rows + the trigger's mirrored value),
  the `Command` palette, `List` media, `MultiSelect`, `Sidebar` items, the `Tree` row's
  leading glyph, and the data-table faceted filter. These recipes ship
  `[&_svg:not([class*='size-'])]:size-5`, so a bare
  `<Icon />` gets 20px automatically while an explicitly-sized glyph (a trailing caret, a
  `Kbd` shortcut, a right-aligned check indicator) keeps its own size.
- **Buttons, inputs, and other controls → 16px (`size-4`).** `Button`, `Input` adornments,
  `InputGroup`, dialog/drawer close buttons. An icon inside a 32-40px control stays 16px so
  it never crowds the label.
- **Small chips → 14px (`size-3.5`).** `Badge`, `Breadcrumb`, chips, `Kbd`, stat trend
  indicators, `FileCard` meta - contexts whose text is 12-14px, where a larger icon would
  overpower the label.
- **Never** hardcode a bespoke `size-[…]` on a leading icon; let the recipe's `:not()` rule
  set it, or override with a standard `size-*` step only for a deliberate exception.

---

## Rules of thumb
- **Need a value Tailwind already has?** Use the utility. Don't add a token.
- **Need it to change per theme, or to be a reusable design decision?** Add a
  semantic token here, then a utility consumes it.
- **Never** hardcode hex / oklch / cubic-bezier / ms inside a component.
- See the three themes and every token rendered live at `/docs/foundations`.
