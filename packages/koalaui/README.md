# koalaui

The CLI for [Koala UI](https://koala-ui.vercel.app). It copies component source into your React project (you own and edit the code; it is **not** a runtime dependency).

## Two tiers

- **Free** - all components (`components/ui/*`), lib helpers and tokens. Fetched from the public repo, **no auth, no account**.
- **PRO** 🔒 - marketing sections, full page examples, templates. Requires a license key: [buy one](https://koala-ui.vercel.app/pro), then `koalaui login <key>`. PRO items can depend on free components - those still come from the public repo automatically.

## Usage

```bash
# One-time: tokens, core lib helpers (cn, tv) and base dependencies
npx koalaui init

# Add free components - no auth needed
npx koalaui add button card data-table

# See everything (free + pro)
npx koalaui list
```

After `init`, add `@import "./koala.css";` to your global stylesheet (right after `@import "tailwindcss";`) and make sure your `tsconfig.json` has the `@/*` path alias.

## PRO access

Buy a license at <https://koala-ui.vercel.app/pro>. You get the key on the success page (and by email). Activate it once per machine:

```bash
npx koalaui login koala_live_xxxxxxxx
npx koalaui add marketing-hero
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
| `--no-install` | Write files but skip the package-manager install |

## Requirements

React 19, Tailwind CSS v4, and a project that resolves the `@/*` path alias. The package manager is auto-detected (npm / pnpm / yarn / bun) from your lockfile.
