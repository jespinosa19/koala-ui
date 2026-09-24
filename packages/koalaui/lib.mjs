// @ts-check
/**
 * Pure helpers for the koalaui CLI, kept apart from bin.mjs so they can be tested without running
 * a command. Nothing here touches the network; only the config helpers touch the disk.
 */
import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, isAbsolute, join, normalize as normalizePath, posix, sep } from "node:path"
import { homedir } from "node:os"

/** Sent to the API as X-Koalaui-Cli. test/cli/smoke.test.ts pins it to package.json. */
export const VERSION = "0.6.0"
// The public site. Every buyer-facing URL hangs off this one constant so moving to a custom
// domain later is a one-line change.
export const SITE = "https://koala-ui.vercel.app"
// The entitlement API. This URL ships inside every published copy of the CLI, so it has to be one
// we control: it lets the backend or the payment provider move without republishing the CLI.
export const DEFAULT_API = `${SITE}/api`
export const PURCHASE_URL = `${SITE}/pro`
export const ACCOUNT_URL = `${SITE}/account`
/** The most files one entitlement request may ask for; the server enforces the same cap. */
export const MAX_PATHS = 50

// ── files the CLI may write ─────────────────────────────────────────────────────
/**
 * Where an item may put files. The registry is fetched over the network, so it is treated as
 * untrusted input: a path outside these folders (package.json, .npmrc, .github/workflows, a
 * dotfile, anything with `..`) is refused rather than written, whoever published it.
 */
const WRITABLE_ROOTS = new Set(["app", "components", "lib", "hooks", "styles"])

/**
 * The absolute path for a registry-relative target, or an Error explaining why it is refused.
 * @param {string} root  the project (or its src/) directory
 * @param {string} target  a path as the registry spells it, forward slashes
 * @returns {string}
 */
export function resolveInside(root, target) {
  if (typeof target !== "string" || !target || target.length > 240) throw new Error(`refusing an empty or overlong path`)
  if (target.includes("\0") || target.includes(":") || target.includes("\\") || isAbsolute(target) || target.startsWith("/"))
    throw new Error(`refusing to write ${JSON.stringify(target)}: not a relative project path`)
  const segments = target.split("/")
  if (segments.some((s) => s === "" || s === "." || s === ".."))
    throw new Error(`refusing to write ${JSON.stringify(target)}: it leaves the project`)
  if (!WRITABLE_ROOTS.has(segments[0]))
    throw new Error(`refusing to write ${JSON.stringify(target)}: items only write under ${[...WRITABLE_ROOTS].join(", ")}`)
  const abs = normalizePath(join(root, ...segments))
  const base = normalizePath(root.endsWith(sep) ? root : root + sep)
  if (!abs.startsWith(base)) throw new Error(`refusing to write ${JSON.stringify(target)}: it leaves the project`)
  return abs
}

// ── files a template may write ──────────────────────────────────────────────────
/** A template's own folders a registry must never be able to fill. */
const TEMPLATE_FORBIDDEN = new Set(["node_modules", ".git", ".next", ".github", ".vscode"])

/**
 * The absolute path for a file of a template, or an Error. A template is a whole project written
 * into a folder that was empty, so unlike an item it may write package.json or .gitignore at its
 * root; it still may not leave that folder, write into node_modules or .git, or use odd paths.
 * @param {string} root  the new project's folder
 * @param {string} target  the path inside the template, forward slashes
 * @returns {string}
 */
export function resolveTemplatePath(root, target) {
  if (typeof target !== "string" || !target || target.length > 240) throw new Error(`refusing an empty or overlong path`)
  if (target.includes("\0") || target.includes(":") || target.includes("\\") || isAbsolute(target) || target.startsWith("/"))
    throw new Error(`refusing to write ${JSON.stringify(target)}: not a relative project path`)
  const segments = target.split("/")
  if (segments.some((s) => s === "" || s === "." || s === ".."))
    throw new Error(`refusing to write ${JSON.stringify(target)}: it leaves the project`)
  if (TEMPLATE_FORBIDDEN.has(segments[0])) throw new Error(`refusing to write ${JSON.stringify(target)}: not part of a template`)
  const abs = normalizePath(join(root, ...segments))
  const base = normalizePath(root.endsWith(sep) ? root : root + sep)
  if (!abs.startsWith(base)) throw new Error(`refusing to write ${JSON.stringify(target)}: it leaves the project`)
  return abs
}

/**
 * Where a template's pictures are downloaded from: $KOALAUI_ASSET_BASE (tests, a mirror) or the
 * template's own `assetBase`. https only, except loopback.
 * @param {string | undefined} fromTemplate
 * @param {string | undefined} env
 */
export function resolveAssetBase(fromTemplate, env) {
  const raw = String(env || fromTemplate || "").replace(/\/+$/, "")
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`the template names no valid picture source: ${JSON.stringify(raw)}`)
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))
    throw new Error(`pictures must come over https (or http on localhost): ${raw}`)
  return raw
}

/**
 * The URL of one picture: its path under public/, served from the site root.
 * @param {string} base
 * @param {string} path  as template.json spells it, e.g. "public/vital/home/hero.webp"
 */
export function assetUrl(base, path) {
  if (!path.startsWith("public/")) throw new Error(`refusing a picture outside public/: ${JSON.stringify(path)}`)
  return `${base}/${path.slice("public/".length).split("/").map(encodeURIComponent).join("/")}`
}

// ── the project being installed into ────────────────────────────────────────────
const NEXT_CONFIGS = ["next.config.js", "next.config.mjs", "next.config.ts", "next.config.cjs"]
const VITE_CONFIGS = ["vite.config.js", "vite.config.mjs", "vite.config.ts", "vite.config.cjs", "vite.config.mts", "vite.config.cts"]

/**
 * Which kind of React project this is. Next is checked first: a Next app often carries Vite as a
 * test dependency (Vitest), never the other way round.
 * @param {(path: string) => boolean} has  whether a file exists at the project root
 * @param {Record<string, string>} [deps]  the project's dependencies and devDependencies
 * @returns {"next" | "vite" | "react"}
 */
export function detectFramework(has, deps = {}) {
  if (NEXT_CONFIGS.some(has) || deps.next) return "next"
  if (VITE_CONFIGS.some(has) || deps.vite) return "vite"
  return "react"
}

/**
 * Where a project's global stylesheet usually lives, from the project root: Next's app router
 * first, then the Vite and create-react-app spellings, then the pages router.
 */
export const STYLESHEET_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "src/index.css",
  "src/styles/globals.css",
  "src/styles/index.css",
  "src/globals.css",
  "src/main.css",
  "src/App.css",
  "styles/globals.css",
]

export const TAILWIND_IMPORT = /^@import\s+["']tailwindcss["'][^;\r\n]*;[^\r\n]*$/m

/**
 * The stylesheet a shadcn/ui project declares in components.json (`tailwind.css`), when it is a
 * plain relative path to a .css file inside the project. Anything else is ignored, not trusted.
 * @param {string} json  the contents of components.json
 * @returns {string | null}
 */
export function shadcnStylesheet(json) {
  let css
  try {
    css = JSON.parse(json)?.tailwind?.css
  } catch {
    return null
  }
  if (typeof css !== "string") return null
  const path = css.replace(/\\/g, "/").replace(/^\.\//, "")
  if (!/\.css$/.test(path) || path.includes(":") || path.startsWith("/")) return null
  if (path.split("/").some((s) => s === "" || s === "." || s === "..")) return null
  return path
}

/**
 * Where koala.css goes, as a registry target (relative to the project, or to its src/). Beside a
 * stylesheet that lives in app/, as a Next project expects it; in styles/ everywhere else, since a
 * Vite src/ root is not somewhere an item may write.
 * @param {string | null} stylesheet  the global stylesheet, from the project root
 * @param {"next" | "vite" | "react"} framework
 */
export function koalaCssTarget(stylesheet, framework) {
  if (stylesheet ? /^(src\/)?app\//.test(stylesheet) : framework === "next") return "app/koala.css"
  return "styles/koala.css"
}

/**
 * The `@import` specifier that reaches `to` from the stylesheet at `from` (both from the root).
 * @param {string} from
 * @param {string} to
 */
export function importSpecifier(from, to) {
  const rel = posix.relative(posix.dirname(from), to)
  return rel.startsWith(".") ? rel : `./${rel}`
}

/**
 * Koala's faces for a project without next/font: Inter for UI and body, DM Sans with its optical
 * size axis for headings, the same two next/font loads on the site. Bundled from npm, so they work
 * offline and under a strict CSP (a Tauri or Electron shell), with no request to a font CDN.
 */
export const FONT_PACKAGES = { "@fontsource-variable/inter": "^5.2.0", "@fontsource-variable/dm-sans": "^5.2.0" }
const FONT_IMPORTS = ['@import "@fontsource-variable/inter";', '@import "@fontsource-variable/dm-sans/opsz.css";']
// Unlayered, so it outranks the fallback koala.css declares inside `@theme`, exactly as the class
// next/font puts on <html> does.
const FONT_BLOCK = `/* Koala UI faces, wired by \`koalaui init\`: Inter for UI and body, DM Sans for headings. */
:root {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "DM Sans Variable", "Inter Variable", ui-sans-serif, system-ui, sans-serif;
}`

/**
 * What in an existing stylesheet would override Koala's tokens once koala.css is imported. A
 * shadcn/ui stylesheet has all of these; each has to go for the themes to apply.
 * @param {string} css
 * @returns {string[]}
 */
export function stylesheetConflicts(css) {
  const out = []
  if (/(?::root|\.dark)\s*\{[^}]*--(background|foreground)\s*:/.test(css))
    out.push("sets its own --background/--foreground (on :root or .dark)")
  if (/(?::root|\.dark)\s*\{[^}]*--radius\s*:/.test(css)) out.push("sets its own --radius")
  if (/^@custom-variant\s+dark\b/m.test(css)) out.push("declares its own dark variant (koala.css covers .dark and .moonlight)")
  return out
}

/**
 * The stylesheet with koala.css wired in. Pure: the caller reads and writes the file.
 *
 * A create-next-app stylesheet is only boilerplate that fights the tokens (its own --background, a
 * dark media query, Arial on body), so it is replaced outright; anything else keeps its content and
 * gets the import right after Tailwind's. With `fonts`, the two faces are imported beside it and
 * their variables declared after the last `@import`, since CSS ignores an import below a rule.
 * @param {string} css
 * @param {{ specifier: string, fonts?: boolean }} options
 * @returns {{ status: "present" | "replaced" | "added", css: string, conflicts: string[] }}
 */
export function wireCss(css, { specifier, fonts = false }) {
  if (css.includes("koala.css")) return { status: "present", css, conflicts: [] }
  // Whatever the file already ends its lines with, so a Windows checkout does not come back mixed.
  const eol = css.includes("\r\n") ? "\r\n" : "\n"
  const imports = [...(fonts ? FONT_IMPORTS : []), `@import "${specifier}";`].join(eol)
  const withFonts = (/** @type {string} */ text) => {
    if (!fonts) return text
    const all = [...text.matchAll(/^@import\s[^;]*;[^\r\n]*$/gm)]
    const last = all[all.length - 1]
    const at = last.index + last[0].length
    return `${text.slice(0, at)}${eol}${eol}${FONT_BLOCK.replace(/\n/g, eol)}${eol}${text.slice(at)}`
  }
  const boilerplate = /--font-geist-sans/.test(css) && /font-family:\s*Arial/.test(css)
  if (boilerplate) return { status: "replaced", css: withFonts(`@import "tailwindcss";${eol}${imports}${eol}`), conflicts: [] }
  const next = TAILWIND_IMPORT.test(css)
    ? css.replace(TAILWIND_IMPORT, (line) => `${line.trimEnd()}${eol}${imports}`)
    : `@import "tailwindcss";${eol}${imports}${eol}${css}`
  return { status: "added", css: withFonts(next), conflicts: stylesheetConflicts(css) }
}

/**
 * True for the `lib/utils.ts` shadcn/ui writes: `cn` over clsx and tailwind-merge, nothing else.
 * Koala's own utils.ts is a superset (the same `cn`, plus the merge config `lib/tv.ts` imports), so
 * that file can be replaced; one with anything more in it is the project's own and is not.
 * @param {string} source
 */
export function isStockShadcnUtils(source) {
  const code = normalize(source)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
  const exported = [...code.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class|type|interface|\{|\*|default)\s*(\w*)/gm)]
  if (exported.length !== 1 || exported[0][1] !== "cn") return false
  const modules = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1])
  return modules.every((m) => m === "clsx" || m === "tailwind-merge")
}

// ── dependencies the CLI may install ────────────────────────────────────────────
const PACKAGE_NAME = /^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/
/** One version or caret/tilde range, the only shapes the registry emits (read from package.json). */
const VERSION_RANGE = /^[0-9A-Za-z.^~*+-]{1,64}$/

/**
 * A dependency spec as the package manager will receive it, or an Error. Names and ranges come
 * from the registry, so they are held to npm's own grammar before they reach a command line.
 * @param {string} name
 * @param {string | undefined} range
 * @returns {string}
 */
export function validateDepSpec(name, range) {
  if (!PACKAGE_NAME.test(name) || name.length > 214) throw new Error(`refusing to install ${JSON.stringify(name)}: not a package name`)
  if (!range || range === "latest") return name
  if (!VERSION_RANGE.test(range)) throw new Error(`refusing to install ${name}@${JSON.stringify(range)}: not a version range`)
  return `${name}@${range}`
}

/**
 * How to run the package manager: a file and an argument array (no shell) on POSIX. Windows needs
 * a shell to launch the `.cmd` shims npm installs (Node refuses them otherwise since CVE-2024-27980),
 * so there it is one command string built only from specs that passed validateDepSpec.
 * @param {"npm" | "pnpm" | "yarn" | "bun"} pm
 * @param {string[]} specs
 * @param {NodeJS.Platform} platform
 */
export function installCommand(pm, specs, platform = process.platform) {
  const verb = pm === "npm" ? "install" : "add"
  if (platform === "win32") return { shell: true, command: [pm, verb, ...specs.map((s) => `"${s}"`)].join(" ") }
  return { shell: false, file: pm, args: [verb, ...specs] }
}

// ── where the API is ────────────────────────────────────────────────────────────
/**
 * The entitlement API base: --api › $KOALAUI_API › the default. Never read from the saved config:
 * a base URL that persisted there would quietly send every future license key to that host.
 * https only, except loopback for local development.
 * @param {{ flag?: string | null, env?: string }} sources
 */
export function resolveApiBase({ flag, env }) {
  const raw = (flag || env || DEFAULT_API).replace(/\/+$/, "")
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`not a URL: ${raw}`)
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))
    throw new Error(`the API must be https (or http on localhost): ${raw}`)
  return raw
}

// ── the saved license (~/.koalaui/config.json) ──────────────────────────────────
export const CONFIG_PATH = join(homedir(), ".koalaui", "config.json")

/** @param {string} [path] */
export function loadConfig(path = CONFIG_PATH) {
  try {
    const cfg = JSON.parse(readFileSync(path, "utf8"))
    // An earlier release wrote the file world-readable; tighten it whenever it is read.
    if (process.platform !== "win32") chmodSync(path, 0o600)
    return cfg && typeof cfg === "object" ? cfg : {}
  } catch {
    return {}
  }
}

/**
 * Write the config readable by its owner only, via a temp file and a rename so a crash never
 * leaves half a file. `api` is never persisted (see resolveApiBase).
 * @param {Record<string, unknown>} cfg
 * @param {string} [path]
 */
export function writeConfig(cfg, path = CONFIG_PATH) {
  const rest = { ...cfg }
  delete rest.api
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(rest, null, 2) + "\n", { mode: 0o600 })
  renameSync(tmp, path)
  if (process.platform !== "win32") chmodSync(path, 0o600)
}

/**
 * The license key: --license › $KOALAUI_LICENSE › saved.
 * @param {{ license?: string | null }} opts
 * @param {Record<string, any>} cfg
 * @param {Record<string, string | undefined>} [env]
 */
export function resolveLicense(opts, cfg, env = process.env) {
  return opts.license || env.KOALAUI_LICENSE || cfg.license || null
}

/**
 * The activation to present with that key: --instance › $KOALAUI_INSTANCE › the saved one, and the
 * saved one only when it was issued for this very key (a different key in the environment must not
 * borrow this machine's seat of another license).
 * @param {{ instance?: string | null }} opts
 * @param {Record<string, any>} cfg
 * @param {string | null} license
 * @param {Record<string, string | undefined>} [env]
 */
export function resolveInstance(opts, cfg, license, env = process.env) {
  if (opts.instance) return opts.instance
  if (env.KOALAUI_INSTANCE) return env.KOALAUI_INSTANCE
  return license && cfg.license === license ? cfg.instanceId || null : null
}

/** @param {string | null | undefined} secret */
export function maskSecret(secret) {
  if (!secret) return ""
  return secret.length > 12 ? `${secret.slice(0, 8)}…${secret.slice(-4)}` : "…"
}

/** True on CI, where a login per run would claim a new seat each time. @param {Record<string, string | undefined>} [env] */
export function isCi(env = process.env) {
  return Boolean(env.CI || env.GITHUB_ACTIONS || env.BUILDKITE || env.GITLAB_CI || env.VERCEL)
}

// ── responses ───────────────────────────────────────────────────────────────────
/**
 * One line for a failed API call, using the server's own words when it sent any.
 * @param {number} status
 * @param {{ error?: string, code?: string } | null} body
 * @param {string | null} retryAfter
 * @param {string} what  what was being fetched, for the fallback message
 */
export function describeHttpError(status, body, retryAfter, what) {
  const said = body && typeof body.error === "string" ? body.error : null
  if (status === 429) return `too many requests${retryAfter ? `, retry in ${retryAfter}s` : ""}${said ? ` (${said})` : ""}`
  if (status >= 500) return `the Koala UI service is having trouble (${status})${said ? `: ${said}` : ""}. Try again shortly.`
  return said || `${status} fetching ${what}`
}

/** @template T @param {T[]} list @param {number} size @returns {T[][]} */
export function chunk(list, size) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

// ── hashing (matches scripts/build-registry.mjs) ─────────────────────────────────
/** @param {string} s */
export const normalize = (s) => s.replace(/\r\n/g, "\n")
/** @param {string} s */
export const sha = (s) => createHash("sha256").update(normalize(s)).digest("hex").slice(0, 16)
