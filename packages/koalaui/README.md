# koalaui-cli

The CLI for [Koala UI](https://koala-ui.vercel.app). It copies component source into your React project (you own and edit the code; it is **not** a runtime dependency).

The package is `koalaui-cli`; the command it installs is `koalaui` (and `koalaui-cli`, which is the same thing). Run it with `npx koalaui-cli …` or install it and call `koalaui …`.

## Two tiers

- **Free** - all components (`components/ui/*`), lib helpers and tokens. Fetched from the public repo, **no auth, no account**.
- **PRO** 🔒 - marketing sections, full page examples, templates. Requires a license key: [buy one](https://koala-ui.vercel.app/pro), then `koalaui login <key>`. PRO items can depend on free components - those still come from the public repo automatically.

## Usage

```bash
# One-time: tokens, core lib helpers (cn, tv) and base dependencies
npx koalaui-cli init

# Add free components - no auth needed
npx koalaui-cli add button card data-table

# See everything (free + pro)
npx koalaui-cli list
```

`init` writes the tokens to `app/koala.css` and imports them from `app/globals.css` (a create-next-app starter stylesheet is replaced, since its colors fight the themes). It also installs `components/theme-provider.tsx`. Then wire the fonts and the theme in your root layout:

```tsx
import { Inter, DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const heading = DM_Sans({ subsets: ["latin"], variable: "--font-heading", axes: ["opsz"] })

// <html suppressHydrationWarning className={`${sans.variable} ${heading.variable}`}>
//   <body><ThemeProvider>{children}</ThemeProvider></body>
```

Your `tsconfig.json` needs the `@/*` path alias; `init` tells you if it is missing.

## Updating

The code is yours, so updates never land on their own. Every install is recorded in `koala.json` (commit it): the version of each item and a fingerprint of each file as written.

```bash
npx koalaui-cli diff            # what has an update, and which files you edited
npx koalaui-cli diff button     # the line changes for one item
npx koalaui-cli update          # replace untouched files; edited files are kept and listed
npx koalaui-cli update button --force   # take Koala's version even over your edits
```

## PRO access

Buy a license at <https://koala-ui.vercel.app/pro>. You get the key on the success page (and by email). Activate it once per machine:

```bash
npx koalaui-cli login koala_live_xxxxxxxx
npx koalaui-cli add marketing-hero
```

The key is stored in `~/.koalaui/config.json`. `koalaui whoami` shows the active key; `koalaui logout` removes it.

Your key is exchanged for the gated source at the entitlement API, which validates it and streams the files back. You never receive a GitHub token, and no repo access is granted to your account.

> Maintainers only: a GitHub token with read access to the private repo also works, resolved from `$KOALAUI_TOKEN`, `$GH_TOKEN`, `$GITHUB_TOKEN` or `gh auth token`. A license always takes priority.

## Commands

| Command | Description |
| --- | --- |
| `init` | Set up tokens, core lib helpers and base deps |
| `add <item...>` | Copy items (and their deps) into your project |
| `list` | List available items (free + pro) |
| `diff [item...]` | Show what changed upstream since you installed |
| `update [item...]` | Update installed items, keeping files you edited |
| `login <key>` | Save your PRO license key |
| `logout` | Remove the saved license |
| `whoami` | Show the active license |

## Options

| Flag | Description |
| --- | --- |
| `--cwd <dir>` | Target project root (default: current directory) |
| `--license <key>` | PRO license key (overrides saved / `$KOALAUI_LICENSE`) |
| `--api <url>` | Entitlement API base (overrides `$KOALAUI_API`) |
| `--registry <dir>` | Read FREE files from a local checkout instead of the repo (dev) |
| `--pro <dir>` | Read PRO files from a local checkout (dev; default `../koala-ui-pro`) |
| `--branch <branch>` | Branch (default: `main`) |
| `--token <token>` | GitHub token (maintainer PRO access) |
| `--overwrite` | Overwrite files that already exist |
| `--force` | `update`: also replace files you edited |
| `--no-install` | Write files but skip the package-manager install |

## Requirements

React 19, Tailwind CSS v4, and a project that resolves the `@/*` path alias. The package manager is auto-detected (npm / pnpm / yarn / bun) from your lockfile.
