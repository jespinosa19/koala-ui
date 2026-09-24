# koalaui-cli

The CLI for [Koala UI](https://koala-ui.vercel.app). It copies component source into your React project (you own and edit the code; it is **not** a runtime dependency).

The package is `koalaui-cli`; the command it installs is `koalaui` (and `koalaui-cli`, which is the same thing). Run it with `npx koalaui-cli …` or install it and call `koalaui …`.

## Two tiers

- **Free** - all components (`components/ui/*`), lib helpers, tokens, and one sample section of every section family. Fetched from the public repo, **no auth, no account**.
- **PRO** 🔒 - every other section, full page examples, templates. Requires a license key: [buy one](https://koala-ui.vercel.app/pro), then `koalaui login <key>`. PRO items can depend on free components - those still come from the public repo automatically.

## Usage

```bash
# One-time: tokens, core lib helpers (cn, tv) and base dependencies
npx koalaui-cli init

# Add free components - no auth needed
npx koalaui-cli add button card data-table

# See everything (free + pro)
npx koalaui-cli list
```

`init` works out whether the project is Next.js or Vite and finds the stylesheet that imports Tailwind. It writes the tokens to `koala.css` and imports them from that stylesheet, and installs `lib/utils.ts`, `lib/tv.ts` and `components/theme-provider.tsx`. It warns about anything in your stylesheet that would override the themes (its own `--background`, `--radius` or dark variant).

### Next.js

The tokens go to `app/koala.css`, imported from `app/globals.css` (a create-next-app starter stylesheet is replaced, since its colors fight the themes). Wire the fonts and the theme in your root layout:

```tsx
import { Inter, DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
const heading = DM_Sans({ subsets: ["latin"], variable: "--font-heading", axes: ["opsz"] })

// <html suppressHydrationWarning className={`${sans.variable} ${heading.variable}`}>
//   <body><ThemeProvider>{children}</ThemeProvider></body>
```

### Vite

Everything lands under `src/`: the tokens in `src/styles/koala.css`, imported from `src/index.css`. There is no `next/font`, so `init` wires the faces itself: it installs `@fontsource-variable/inter` and `@fontsource-variable/dm-sans` and declares `--font-sans` / `--font-heading` in the stylesheet. They ship with your app and need no font CDN, which also suits a Tauri or Electron shell with a strict content policy. Wrap the app in the theme provider in `src/main.tsx`:

```tsx
import { ThemeProvider } from "@/components/theme-provider"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

A single-theme app pins it: `<ThemeProvider forcedTheme="dark">`. The `@/*` alias has to be declared for TypeScript (`"@/*": ["./src/*"]` in `tsconfig.json` and `tsconfig.app.json`) and for Vite (`resolve.alias`).

### Coming from shadcn/ui

`init` replaces shadcn's stock `lib/utils.ts` (Koala's `cn` has the same signature; `lib/tv.ts` needs the merge config next to it). Swap components one at a time: delete `components/ui/<name>.tsx`, then `add <name>`. `add` refuses while such a flat file is there, for the component and for every Koala component it pulls in, because `@/components/ui/<name>` would resolve to the file instead of Koala's folder. The full map: <https://koala-ui.vercel.app/docs/migrating-from-shadcn>.

Your tsconfig needs the `@/*` path alias; `init` tells you if it is missing.

## Updating

The code is yours, so updates never land on their own. Every install is recorded in `koala.json` (commit it): the version of each item and a fingerprint of each file as written.

```bash
npx koalaui-cli diff            # what has an update, and which files you edited
npx koalaui-cli diff button     # the line changes for one item
npx koalaui-cli update          # replace untouched files; edited files are kept and listed
npx koalaui-cli update button --force   # take Koala's version even over your edits
```

## Agent skill

Coding agents write better Koala code when they read Koala's rules and docs instead of guessing props. `skill` installs the Koala UI agent skill into your project: `SKILL.md` (the house rules, tokens and themes, how to install and update) and one reference per component, generated from the docs.

```bash
npx koalaui-cli skill                         # writes .claude/skills/koala-ui/
npx koalaui-cli skill --dir docs/koala-skill  # or anywhere else
```

Claude Code loads project skills from `.claude/skills/`, so a new session picks it up. For Cursor, Codex and other agents, add a line to your `AGENTS.md` (or a Cursor rule) telling the agent to read `.claude/skills/koala-ui/SKILL.md` before writing UI. Run `skill` again after an update to refresh it: it replaces the folder's files and removes references a newer skill no longer has.

## PRO access

Buy a license at <https://koala-ui.vercel.app/pro>. Your key arrives by email with your receipt. Activate it once per machine:

```bash
npx koalaui-cli login 38b1460a-5104-4067-a91d-77b872934d51
npx koalaui-cli add hero-section-3
```

Activating claims one seat of your plan and saves the key and the seat's id to `~/.koalaui/config.json`, readable by you only. Every Pro install presents both, so a key alone installs nothing. `koalaui whoami` shows the active license; `koalaui logout` releases the seat and forgets the key, so run it before you wipe a machine.

Your key is exchanged for the source at the entitlement API, which checks the license and the seat and sends the files back stamped with a fingerprint of your license (never the key itself). You never receive a GitHub token, and no repo access is granted to your account. You can also read the Pro source on the website: unlock it at <https://koala-ui.vercel.app/account>.

### Templates

A template is a whole site: a Next.js project with its pages, its design layer and the Koala UI components it uses. It installs into a new, empty folder:

```bash
npx koalaui-cli template pipeline-b2b my-site
cd my-site && npm run dev
```

The CLI writes the source, downloads the pictures from the template's live demo and checks each one against the size and sha256 in `template.json`, then runs `npm ci` (skip it with `--no-install`). Everything lands in a temporary folder first and moves into place at the end, so a failed download leaves nothing behind. `koalaui list` shows the templates in their own group.

### CI and agents

A CI run must not activate a seat each time. Activate one seat for CI once, from your machine, without saving it:

```bash
npx koalaui-cli login <key> --name ci --no-save
# prints KOALAUI_LICENSE=… and KOALAUI_INSTANCE=…
```

Store both as CI secrets; the CLI reads them from the environment. `koalaui whoami --ci` prints the same two lines for the seat on your machine. On CI, `login` refuses to run without `--no-save`. Coding agents on your machine use your saved seat and need nothing extra.

> Maintainers only: a GitHub token with read access to the private repo also works, resolved from `$KOALAUI_TOKEN`, `$GH_TOKEN`, `$GITHUB_TOKEN` or `gh auth token`. A license always takes priority.

## Commands

| Command | Description |
| --- | --- |
| `init` | Set up tokens, core lib helpers and base deps |
| `add <item...>` | Copy items (and their deps) into your project |
| `list` | List available items (free + pro) |
| `diff [item...]` | Show what changed upstream since you installed |
| `update [item...]` | Update installed items, keeping files you edited |
| `template <name> [dir]` | Start a new site from a PRO template, in an empty folder |
| `skill` | Write the Koala UI agent skill into `.claude/skills/koala-ui/` (`--dir` for elsewhere) |
| `login <key>` | Activate your PRO license on this machine (claims a seat) |
| `logout` | Release this machine's seat and forget the key |
| `whoami` | Show the active license (`--ci` prints the env lines) |

## Options

| Flag | Description |
| --- | --- |
| `--cwd <dir>` | Target project root (default: current directory) |
| `--license <key>` | PRO license key (overrides saved / `$KOALAUI_LICENSE`) |
| `--instance <id>` | Seat to use (overrides `$KOALAUI_INSTANCE` / saved) |
| `--name <label>` | `login`: the seat's label (default: the hostname) |
| `--no-save` | `login`: activate without saving; prints the ids for CI |
| `--api <url>` | Entitlement API base (overrides `$KOALAUI_API`; https only, never saved) |
| `--dir <path>` | `skill`: where to write the skill (default: `.claude/skills/koala-ui`) |
| `--registry <dir>` | Read FREE files from a local checkout instead of the repo (dev) |
| `--pro <dir>` | Read PRO files from a local checkout (dev; default `../koala-ui-pro`) |
| `--branch <branch>` | Branch (default: `main`) |
| `--token <token>` | GitHub token (maintainer PRO access) |
| `--overwrite` | Overwrite files that already exist |
| `--force` | `update`: also replace files you edited |
| `--no-install` | Write files but skip the package-manager install |

## Requirements

React 19, Tailwind CSS v4, and a project that resolves the `@/*` path alias. Next.js and Vite are set up automatically; any other React setup works through the stylesheet that imports Tailwind. The package manager is auto-detected (npm / pnpm / yarn / bun) from your lockfile.
