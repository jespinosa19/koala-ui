# Contributing to Koala UI

Thanks for helping make Koala UI better. Bug reports, fixes, ideas and new docs examples all count,
and most of them take less time than you think.

This page covers the free tier in this repository: the foundation components, the lib helpers, the
tokens and the `koalaui` CLI. Koala UI Pro lives in a private repository; if you hold a Pro license
and something there is wrong, write to [info.koalaui@gmail.com](mailto:info.koalaui@gmail.com) instead.

## Contents

- [Ways to help](#ways-to-help)
- [How this repository is published](#how-this-repository-is-published)
- [Reporting a bug](#reporting-a-bug)
- [Suggesting a component or a change](#suggesting-a-component-or-a-change)
- [Local setup](#local-setup)
- [The house rules](#the-house-rules)
- [Opening a pull request](#opening-a-pull-request)
- [Code of conduct](#code-of-conduct)
- [License](#license)

## Ways to help

| You want to | Do this |
| --- | --- |
| Report something broken | [Open a bug report](../../issues/new?template=bug_report.yml) |
| Ask for a component, a variant or a prop | [Open a feature request](../../issues/new?template=feature_request.yml) |
| Fix a bug or a typo | Open a pull request, small ones need no issue first |
| Change an API, add a variant or a component | Open an issue first, so we agree on the shape before you build it |
| Ask how to use something | Check the [docs](https://www.koalaui.com/docs), then open an issue with the `question` label |

## How this repository is published

This repository is **generated**. Koala UI is developed in a private repository together with the
docs site and the Pro components, and every release publishes the free files here. The marker
file `.koala-public` says so.

What that means for you:

1. You open issues and pull requests **here**, as usual.
2. When a pull request is accepted, the maintainer applies it in the source repository, with you
   as the commit's co-author, and it reaches this repository with the next release.
3. The pull request is then closed with a link to the release that carries it. A closed (not
   merged) pull request is normal here; it does not mean your change was turned down.

Because of this, please keep each pull request to one change. Two unrelated fixes are easier to
take as two pull requests.

## Reporting a bug

A good report lets us see the bug in under a minute:

- **What happened and what you expected.** One or two sentences each.
- **The smallest code that shows it.** A component and the props you passed, or a link to a
  StackBlitz or CodeSandbox.
- **Where.** Browser and OS, theme (light, cream, dark or moonlight), density, and the
  `koalaui-cli` version from your `koala.json`.
- **A screenshot or a short recording** for anything visual or about motion.

Accessibility bugs (keyboard, focus, screen reader, contrast, reduced motion) are treated as
high priority. Say which assistive technology you used.

Found a security issue? Do not open a public issue. Email
[info.koalaui@gmail.com](mailto:info.koalaui@gmail.com) and we will reply within a few days.

## Suggesting a component or a change

Tell us the problem before the solution: what you are building, what you reached for, and where
the current components fall short. A screenshot of the interface you have in mind helps more than
a list of props.

The free tier is the foundation: buttons, inputs, menus, overlays and the primitives everything
else is built from. Larger composed components (data tables, charts, chat, calendars) belong to
Pro, so a request for one may be answered there instead.

## Local setup

You need Node.js 20 or newer and a React 19 app on Tailwind CSS v4 to try changes in. A fresh one
takes a minute:

```bash
npx create-next-app@latest koala-playground --typescript --tailwind --app
cd koala-playground
npx koalaui-cli@latest init
```

Then fork and clone this repository next to it:

```bash
git clone https://github.com/<you>/koala-ui.git
```

The CLI can read from your local checkout instead of GitHub, so you install your edited
component exactly as a user would:

```bash
# inside koala-playground
node ../koala-ui/packages/koalaui/bin.mjs add dialog --registry ../koala-ui --overwrite
```

Run it again after every edit, or edit the copy in `components/ui/` and port the change back once
it works. Check your change in all four themes and both densities before you open the pull
request; the theme provider that `init` installs switches them.

### Where things live

```
components/ui/<name>/     one folder per component: <name>.tsx and index.ts
lib/                      tv, cn, density, motion and the other helpers
registry/koala.css        the design tokens (colors, radius, shadows, motion)
registry.json             the catalog the CLI reads
packages/koalaui/         the CLI
skills/koala-ui/          the agent skill, generated from the docs
```

## The house rules

Every component follows the same rules, so the library reads as one system. A pull request that
breaks one will be asked to change, so it saves time to read these first.

**Structure**

- **Variants with `tv`** from `lib/tv.ts`, never `cva` or hand-written class switches.
  Multi-part components use `tv` with `slots`; one recipe per component.
- **Named exports, not dot notation.** `Card`, `CardHeader`, `CardContent`, never `Card.Header`.
  Dot notation breaks across the React Server Components boundary.
- **Shared state through React Context** (`lib/create-context.tsx`), never by cloning children.
- **Radix first.** Reach for a Radix primitive before writing focus, keyboard or ARIA handling by
  hand.
- **Every part accepts `className`**, merged last so the user always wins.
- **React 19:** no `forwardRef`, `ref` is a regular prop.

**Tokens**

- **No raw values.** No hex, `oklch()`, `cubic-bezier()` or millisecond values in a component.
  Use the semantic color roles (`bg-background`, `text-muted-foreground`, `border-border`,
  `bg-brand`), the `radius-*` and `shadow-*` scales, and the motion utilities (`ease-out`,
  `duration-base`). JavaScript animation reads its values from `lib/motion.ts`.
- **It has to work in all four themes.** If a color only looks right in one, it is the wrong
  token.

**Interaction**

- **No press scale.** Nothing shrinks on press or focus: no `active:scale-*`. Feedback comes from
  the focus ring, color and motion.
- **Specific transitions**, never `transition: all`.
- **Hit areas of at least 40 by 40 pixels** for anything interactive, even when it looks smaller.
- **`tabular-nums`** on any number that updates in place.
- **Respect `prefers-reduced-motion`.**

**Accessibility**

- Fully usable with the keyboard alone, with a visible focus ring.
- Every control has an accessible name.
- Text meets WCAG 2.1 AA contrast in every theme.

**Writing**

- Docs and examples in plain English, short sentences, no em dashes.
- Example content uses neutral, believable names, never a real company's brand.

## Opening a pull request

Before you open it:

- [ ] One change per pull request, with an issue linked if it changes an API.
- [ ] Tried in a real app through the CLI, as in [Local setup](#local-setup).
- [ ] Checked in light, cream, dark and moonlight, and in both densities.
- [ ] Checked with the keyboard alone.
- [ ] No new dependency, unless the issue agreed on one.
- [ ] Screenshots or a recording for anything visual.

Name the pull request after what it does for the user ("Select keeps focus after closing"), not
after the code ("refactor select"). The template asks for the rest.

Every pull request gets a reply. Small fixes are usually taken within a few days; larger changes
can take longer while we fit them into the system.

## Code of conduct

Be kind, assume good intent and keep feedback about the work. Harassment or personal attacks of
any kind are not tolerated, and the maintainer may remove comments, issues or contributors that
cross that line. Report a problem to [info.koalaui@gmail.com](mailto:info.koalaui@gmail.com).

## License

By contributing, you agree that your contribution is licensed under the [MIT License](./LICENSE),
like the rest of this repository.
