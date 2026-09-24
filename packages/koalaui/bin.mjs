#!/usr/bin/env node
// @ts-check
/**
 * koalaui - the Koala UI CLI (two-tier).
 *
 *   koalaui init                 set up tokens, core lib helpers and base deps
 *   koalaui add <item...>        copy components/sections (and their deps) into your project
 *   koalaui list                 list available items (free + pro)
 *   koalaui diff [item...]       what changed upstream since you installed (koala.json)
 *   koalaui update [item...]     update installed items, keeping any file you edited
 *
 * Tiers:
 *   FREE  components/ui + lib + tokens - fetched from the PUBLIC repo, no auth.
 *   PRO   sections / pages / templates - fetched from the PRIVATE repo; requires a
 *         GitHub token with read access (the paywall). PRO items can depend on FREE
 *         ones; those still come from the public repo automatically.
 *
 * PRO auth - a license key from your purchase, activated once with `koalaui login <key>`.
 * Activation claims one seat of the plan and saves the key plus its instance id to
 * ~/.koalaui/config.json. `koalaui logout` releases the seat again.
 *
 * As an owner/dev fallback, a GitHub token with read access to the pro repo also works,
 * resolved in order: 1. $KOALAUI_TOKEN  2. $GH_TOKEN  3. $GITHUB_TOKEN  4. `gh auth token`
 *
 * Flags:
 *   --cwd <dir>        target project root (default: current directory)
 *   --registry <dir>   read FREE files from a local checkout instead of the repo (dev)
 *   --pro <dir>        read PRO files from a local checkout (dev; default ../koala-ui-pro)
 *   --branch <b>       branch (default: main)
 *   --token <t>        GitHub token (overrides env / gh)
 *   --overwrite        overwrite files that already exist
 *   --force            update: also replace files you edited
 *   --no-install       write files but don't run the package manager
 *   -h, --help         show this help
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, dirname, isAbsolute } from "node:path"
import { homedir, hostname } from "node:os"
import { execSync } from "node:child_process"
import { createHash } from "node:crypto"

const DEFAULT_PUBLIC_REPO = "jespinosa19/koala-ui"
const DEFAULT_BRANCH = "main"
// The public site. Every buyer-facing URL hangs off this one constant so moving to a custom
// domain later is a one-line change.
const SITE = "https://koala-ui.vercel.app"
// The entitlement API. This URL ships inside every published copy of the CLI, so it has to be
// one we control: it is what lets the backend or the payment provider move without republishing
// the CLI or stranding anyone who already installed it. Override with $KOALAUI_API or --api.
const DEFAULT_API = `${SITE}/api`
const PURCHASE_URL = `${SITE}/pro`
// Where the saved license key lives (set by `koalaui login`).
const CONFIG_PATH = join(homedir(), ".koalaui", "config.json")

// ── tiny ANSI ──────────────────────────────────────────────────────────────
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
}
const log = (s = "") => console.log(s)
const ok = (s) => log(`${c.green("✓")} ${s}`)
const info = (s) => log(`${c.cyan("›")} ${s}`)
const warn = (s) => log(`${c.yellow("!")} ${s}`)
class FailError extends Error {}
const fail = (s) => {
  throw new FailError(s)
}

// ── arg parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = {
    _: [],
    cwd: process.cwd(),
    registry: null,
    pro: null,
    branch: DEFAULT_BRANCH,
    token: null,
    license: null,
    api: null,
    overwrite: false,
    force: false,
    install: true,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--cwd") out.cwd = argv[++i]
    else if (a === "--registry") out.registry = argv[++i]
    else if (a === "--pro") out.pro = argv[++i]
    else if (a === "--branch") out.branch = argv[++i]
    else if (a === "--token") out.token = argv[++i]
    else if (a === "--license") out.license = argv[++i]
    else if (a === "--api") out.api = argv[++i]
    else if (a === "--overwrite") out.overwrite = true
    else if (a === "--force") out.force = true
    else if (a === "--no-install") out.install = false
    else if (a === "-y" || a === "--yes") {}
    else if (a === "-h" || a === "--help") out.help = true
    else out._.push(a)
  }
  return out
}

// ── token resolution (lazy; only PRO needs it) ───────────────────────────────
function resolveToken(explicit) {
  if (explicit) return explicit
  for (const k of ["KOALAUI_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"]) if (process.env[k]) return process.env[k]
  try {
    const t = execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()
    if (t) return t
  } catch {}
  return null
}
function requireToken(opts, itemName) {
  const token = resolveToken(opts.token)
  if (!token) paywall(itemName)
  return token
}

/**
 * The single message anyone without access to a PRO item should ever see. Every denial funnels
 * here - a missing license, a token that isn't entitled, GitHub refusing the private repo - so
 * the paywall always reads as a paywall and always ends in a way to buy.
 *
 * `reason` explains what specifically failed, for someone who believes they *should* have access.
 */
function paywall(itemName, reason) {
  fail(
    `${c.bold(itemName)} is a ${c.bold("PRO")} section - it needs a license.\n` +
      (reason ? `  ${c.dim(reason)}\n` : "") +
      `  Activate one:  ${c.cyan("koalaui login <key>")}\n` +
      `  Get a license → ${PURCHASE_URL}`
  )
}

// ── license + config (~/.koalaui/config.json) ────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8"))
  } catch {
    return {}
  }
}
function saveConfig(patch) {
  const cfg = { ...loadConfig(), ...patch }
  mkdirSync(dirname(CONFIG_PATH), { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n")
  return cfg
}
/** License key, in priority: --license › $KOALAUI_LICENSE › saved config. */
function resolveLicense(opts) {
  return opts.license || process.env.KOALAUI_LICENSE || loadConfig().license || null
}
/**
 * The activation this machine holds, saved by `koalaui login`. Sent with every PRO fetch so a
 * seat released elsewhere stops working here immediately, rather than at the next purchase.
 */
function resolveInstanceId() {
  return loadConfig().instanceId || null
}
/** Entitlement API base, in priority: --api › $KOALAUI_API › saved config › default. */
function resolveApi(opts) {
  return (opts.api || process.env.KOALAUI_API || loadConfig().api || DEFAULT_API).replace(/\/+$/, "")
}

// ── registry access (remote or local checkout) ───────────────────────────────
function makeRegistry(opts) {
  // LOCAL mode: free files from --registry dir, pro files from --pro / sibling
  if (opts.registry) {
    const freeBase = isAbsolute(opts.registry) ? opts.registry : join(process.cwd(), opts.registry)
    const proBase = opts.pro
      ? isAbsolute(opts.pro)
        ? opts.pro
        : join(process.cwd(), opts.pro)
      : join(freeBase, "..", "koala-ui-pro")
    const read = (base, path) => {
      const p = join(base, path)
      if (!existsSync(p)) throw new Error(`missing file: ${path} (in ${base})`)
      return readFileSync(p, "utf8")
    }
    return {
      label: c.dim(`local: ${freeBase}`),
      async meta() {
        const p = join(freeBase, "registry.json")
        if (!existsSync(p)) throw new Error(`no registry.json in ${freeBase}`)
        return JSON.parse(readFileSync(p, "utf8"))
      },
      async freeFile(path) {
        return read(freeBase, path)
      },
      async fetchMany(item, paths) {
        const base = item.tier === "pro" ? proBase : freeBase
        return Object.fromEntries(paths.map((p) => [p, read(base, p)]))
      },
    }
  }

  // REMOTE mode (default)
  const branch = opts.branch
  const license = resolveLicense(opts)
  const api = resolveApi(opts)
  async function rawPublic(repo, path) {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`)
    if (res.status === 404) throw new Error(`not found: ${path} (${repo}@${branch})`)
    if (!res.ok) throw new Error(`${res.status} fetching ${path}`)
    return res.text()
  }
  async function apiPrivate(repo, path, itemName) {
    const token = requireToken(opts, itemName)
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "koalaui-cli",
      },
    })
    // GitHub answers 404 - not 403 - for a private repo the token cannot see: it hides the
    // repo's very existence on purpose. So for a PRO item a 404 almost never means "missing
    // file", it means "not entitled", and it must read as the paywall rather than as a bug.
    // (Owner debugging a genuinely missing file: use --registry / --pro local mode.)
    if (res.status === 401 || res.status === 403 || res.status === 404)
      paywall(itemName, `Your GitHub token can't read ${repo} (${res.status}).`)
    if (!res.ok) throw new Error(`${res.status} fetching ${path}`)
    return res.text()
  }
  // BUYER path: trade the license key for the gated source at the entitlement API. The server
  // validates the key and proxies the files out of the private repo; the buyer never gets a token.
  //
  // Every file of an item goes in ONE request. The licensing provider rate-limits key checks to
  // 60 a minute across all customers, so a request per file would let one person installing a
  // handful of sections lock out everyone buying at the same moment.
  async function proViaLicense(item, paths) {
    const res = await fetch(`${api}/cli-entitlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: license, repo: item.repo, paths, instanceId: resolveInstanceId() }),
    })
    if (res.status === 403) {
      let body = {}
      try {
        body = await res.json()
      } catch {}
      fail(
        `your license can't install ${c.bold(item.name)} (a ${c.bold("PRO")} section).\n` +
          `  ${body.error || "invalid or inactive license"}.\n` +
          `  Manage or buy access → ${body.purchase || PURCHASE_URL}`
      )
    }
    if (!res.ok) throw new Error(`${res.status} fetching ${item.name} via entitlement API`)
    const { files } = await res.json()
    return files
  }
  return {
    label: `${DEFAULT_PUBLIC_REPO}@${branch}`,
    async meta() {
      // the catalog lives in the public repo - no token required to browse
      return JSON.parse(await rawPublic(DEFAULT_PUBLIC_REPO, "registry.json"))
    },
    async freeFile(path) {
      return rawPublic(DEFAULT_PUBLIC_REPO, path)
    },
    async fetchMany(item, paths) {
      const gather = async (read) =>
        Object.fromEntries(
          await Promise.all(paths.map(async (p) => [p, await read(p)]))
        )
      if (item.tier !== "pro") return gather((p) => rawPublic(item.repo, p))
      // A buyer's license is the default gate. A repo token (owner/dev) is the fallback.
      if (license) return proViaLicense(item, paths)
      if (resolveToken(opts.token)) return gather((p) => apiPrivate(item.repo, p, item.name))
      paywall(item.name)
    },
  }
}

// ── target path resolution (handles src/ layouts) ────────────────────────────
function makeWriter(root, overwrite) {
  const useSrc =
    existsSync(join(root, "src")) && !existsSync(join(root, "app")) && !existsSync(join(root, "components"))
  const written = []
  const skipped = []
  const same = []
  const resolve = (target) => (useSrc ? join(root, "src", target) : join(root, target))
  /** The file as it sits in the project, or null. */
  function read(target) {
    const abs = resolve(target)
    return existsSync(abs) ? readFileSync(abs, "utf8") : null
  }
  /**
   * Write a file. A file already identical to `content` counts as `same`, not as a skip: it is
   * installed and current, so re-adding it is not a conflict. Returns false when a differing file
   * exists and `force` is off.
   */
  function write(target, content, force = overwrite) {
    const abs = resolve(target)
    if (existsSync(abs)) {
      if (normalize(readFileSync(abs, "utf8")) === normalize(content)) {
        same.push(target)
        return true
      }
      if (!force) {
        skipped.push(target)
        return false
      }
    }
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
    written.push(target)
    return true
  }
  /** Written now or already identical: either way the file on disk is exactly the registry's. */
  const matches = (target) => written.includes(target) || same.includes(target)
  return { read, write, matches, written, skipped, same, useSrc }
}

// ── koala.json: what this project installed, and in which version ──────────────
/**
 * The CLI copies source in, so an update cannot just replace files: the buyer may have edited
 * them. `koala.json` records, per installed item, the registry hash it was installed at and the
 * hash of every file as written. `update` compares the file on disk against that record: a file
 * nobody touched is safe to replace; an edited one is left alone and reported.
 *
 * Hashes match scripts/build-registry.mjs: sha256 over LF-normalized content, first 16 hex.
 */
const MANIFEST = "koala.json"
const normalize = (s) => s.replace(/\r\n/g, "\n")
const sha = (s) => createHash("sha256").update(normalize(s)).digest("hex").slice(0, 16)

function loadManifest(root) {
  try {
    const m = JSON.parse(readFileSync(join(root, MANIFEST), "utf8"))
    return { ...m, items: m.items || {} }
  } catch {
    return { items: {} }
  }
}
function saveManifest(root, m) {
  const items = Object.fromEntries(Object.keys(m.items).sort().map((k) => [k, m.items[k]]))
  const out = {
    $comment: "Written by the koalaui CLI. Tracks installed items so `koalaui update` never overwrites your edits.",
    items,
  }
  writeFileSync(join(root, MANIFEST), JSON.stringify(out, null, 2) + "\n")
}
/** Record the files `w` actually wrote for an item; files it skipped keep their old record. */
function recordItem(manifest, name, hash, contents, w) {
  const prev = manifest.items[name] || { files: {} }
  const files = { ...prev.files }
  for (const [target, content] of Object.entries(contents))
    if (w.matches(target)) files[target] = sha(content)
  manifest.items[name] = { hash, files }
}

// ── package manager detection + install ──────────────────────────────────────
function detectPM(root) {
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun"
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(root, "yarn.lock"))) return "yarn"
  return "npm"
}
/** Install only what package.json doesn't already declare, so re-running add/update is quiet. */
function installDeps(root, deps) {
  let have = {}
  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
    have = { ...pkg.dependencies, ...pkg.devDependencies }
  } catch {}
  const names = Object.entries(deps)
    .filter(([n]) => !have[n])
    .map(([n, v]) => (v && v !== "latest" ? `${n}@${v}` : n))
  if (!names.length) return
  const pm = detectPM(root)
  const verb = pm === "npm" ? "install" : "add"
  info(`${pm} ${verb} ${names.join(" ")}`)
  const quoted = names.map((n) => `"${n}"`).join(" ")
  execSync(`${pm} ${verb} ${quoted}`, { cwd: root, stdio: "inherit" })
}

// ── registry helpers ──────────────────────────────────────────────────────────
/** `init` as an installable unit: its files, keyed by where they land in the project. */
function initUnit(m) {
  const spec = m.init
  // Registries built before `init.files` existed shipped the raw site stylesheet.
  const files = spec.files || [{ from: spec.cssFrom, to: spec.cssTarget }]
  return { name: "init", hash: spec.hash || null, files, dependencies: spec.dependencies || {} }
}
async function fetchInit(reg, unit) {
  const out = {}
  await Promise.all(
    unit.files.map(async (f) => {
      out[f.to] = (await reg.freeFile(f.from)).replace(/^@import\s+["']tailwindcss["'];\s*\n/m, "")
    })
  )
  return out
}
/** An item plus everything it needs, in install order (dependencies first is not required). */
function resolveItems(m, names) {
  const byName = new Map(m.items.map((i) => [i.name, i]))
  const resolved = new Map()
  const missing = []
  function visit(name) {
    if (resolved.has(name)) return
    const item = byName.get(name)
    if (!item) {
      missing.push(name)
      return
    }
    resolved.set(name, item)
    for (const dep of item.registryDependencies || []) visit(dep)
    for (const dep of item.libDependencies || []) visit(dep)
  }
  for (const n of names) visit(n)
  if (missing.length)
    fail(`unknown item(s): ${missing.join(", ")}\n  Run ${c.cyan("koalaui list")} to see what's available.`)
  return resolved
}
function reportWrites(w) {
  for (const t of w.written) ok(`wrote ${c.dim(t)}`)
  for (const t of w.skipped) warn(`exists, skipped ${c.dim(t)} ${c.dim("(use --overwrite)")}`)
}

// ── global stylesheet wiring ──────────────────────────────────────────────────
const KOALA_IMPORT = '@import "./koala.css";'
/**
 * Point the project's global stylesheet at koala.css. A create-next-app stylesheet is only
 * boilerplate that fights the tokens (its own --background, a dark media query, Arial on body),
 * so it is replaced outright; anything else keeps its content and gets the import added.
 */
function wireStylesheet(w) {
  const target = "app/globals.css"
  const css = w.read(target)
  if (css == null) return { status: "missing", target }
  if (css.includes("koala.css")) return { status: "present", target }
  const boilerplate = /--font-geist-sans/.test(css) && /font-family:\s*Arial/.test(css)
  if (boilerplate) {
    w.write(target, `@import "tailwindcss";\n${KOALA_IMPORT}\n`, true)
    return { status: "replaced", target }
  }
  const tw = /^@import\s+["']tailwindcss["'];[^\n]*\n?/m
  const next = tw.test(css) ? css.replace(tw, (line) => `${line.trimEnd()}\n${KOALA_IMPORT}\n`) : `@import "tailwindcss";\n${KOALA_IMPORT}\n${css}`
  w.write(target, next, true)
  return { status: "added", target, conflicts: /:root\s*\{[^}]*--(background|foreground)\s*:/.test(css) }
}

const LAYOUT_SNIPPET = `
    import { Inter, DM_Sans } from "next/font/google"
    import { ThemeProvider } from "@/components/theme-provider"

    const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })
    const heading = DM_Sans({ subsets: ["latin"], variable: "--font-heading", axes: ["opsz"] })

    <html lang="en" suppressHydrationWarning className={\`\${sans.variable} \${heading.variable}\`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>`

// ── commands ─────────────────────────────────────────────────────────────────
async function cmdList(reg) {
  const m = await reg.meta()
  const free = m.items.filter((i) => i.type !== "lib" && i.tier === "free")
  const pro = m.items.filter((i) => i.tier === "pro")
  log(c.bold(`\nKoala UI ${c.dim(`(${reg.label})`)}\n`))
  log(c.bold(`Free ${c.dim(`(${free.length})`)}`))
  for (const i of free) log(`  ${i.name}`)
  if (pro.length) {
    log(c.bold(`\nPRO ${c.dim(`(${pro.length}, requires access)`)} 🔒`))
    for (const i of pro) log(`  ${i.name} ${c.dim(i.type)}`)
  }
  log(`\n${c.dim("Add with:")} koalaui add <item...>\n`)
}

async function cmdInit(reg, opts) {
  const root = opts.cwd
  log(c.bold(`\nKoala UI - init ${c.dim(`(${reg.label})`)}\n`))
  const m = await reg.meta()
  const manifest = loadManifest(root)
  const w = makeWriter(root, opts.overwrite)

  const unit = initUnit(m)
  const contents = await fetchInit(reg, unit)
  for (const [to, content] of Object.entries(contents)) w.write(to, content)
  recordItem(manifest, "init", unit.hash, contents, w)

  // The core helpers are ordinary registry items (utils, tv), so they update like any other.
  const libs = [...resolveItems(m, m.init.lib ? m.init.lib.map((p) => p.replace(/^lib\/|\.tsx?$/g, "")) : []).values()]
  const deps = { ...unit.dependencies }
  const fetched = await Promise.all(libs.map((item) => reg.fetchMany(item, item.files)))
  libs.forEach((item, i) => {
    for (const p of item.files) w.write(p, fetched[i][p])
    Object.assign(deps, item.dependencies || {})
    recordItem(manifest, item.name, item.hash || null, fetched[i], w)
  })

  const css = wireStylesheet(w)
  reportWrites(w)
  saveManifest(root, manifest)
  ok(`recorded ${c.dim(MANIFEST)}`)

  if (opts.install) installDeps(root, deps)
  else info(`skipped install - deps: ${Object.keys(deps).join(" ")}`)

  log()
  ok("init complete")
  if (w.useSrc) info("detected a src/ layout - files were written under src/")
  if (css.status === "replaced") info(`replaced the create-next-app boilerplate in ${css.target} with the Koala import`)
  if (css.status === "added") info(`added ${c.cyan(KOALA_IMPORT)} to ${css.target}`)
  if (css.conflicts)
    warn(`${css.target} sets its own --background/--foreground on :root: remove them, or they override Koala's themes`)

  log(`\n${c.bold("Next steps:")}`)
  let step = 1
  if (css.status === "missing") {
    log(`  ${step++}. In your global stylesheet, right after ${c.cyan('@import "tailwindcss";')}, add:`)
    log(`     ${c.cyan(KOALA_IMPORT)} ${c.dim("(the path is relative to app/koala.css)")}`)
  }
  log(`  ${step++}. Wire the fonts and the theme in your root layout ${c.dim("(app/layout.tsx)")}:`)
  log(c.dim(LAYOUT_SNIPPET))
  let tsconfig = ""
  try {
    tsconfig = readFileSync(join(root, "tsconfig.json"), "utf8")
  } catch {}
  if (!tsconfig.includes('"@/*"'))
    log(
      `  ${step++}. Add the ${c.cyan('"@/*"')} path alias to your tsconfig ${c.dim(`("paths": { "@/*": ["./${w.useSrc ? "src/" : ""}*"] })`)}; every component imports through it.`
    )
  log(`  ${step++}. Add components: ${c.cyan("koalaui add button card")}\n`)
}

async function cmdAdd(reg, opts) {
  const root = opts.cwd
  const names = opts._
  if (!names.length) fail("nothing to add. Usage: koalaui add <item...>")

  const m = await reg.meta()
  const manifest = loadManifest(root)
  const resolved = resolveItems(m, names)

  const involvesPro = [...resolved.values()].some((i) => i.tier === "pro")
  log(c.bold(`\nKoala UI - adding ${names.join(", ")} ${c.dim(`(${reg.label})`)}\n`))
  if (involvesPro) info(`includes ${c.bold("PRO")} content 🔒`)
  const extra = [...resolved.keys()].filter((n) => !names.includes(n))
  if (extra.length) info(`pulling dependencies: ${c.dim(extra.join(", "))}`)

  // Fetch each item's files in one call (each from its own tier's source), items in parallel.
  const w = makeWriter(root, opts.overwrite)
  const deps = {}
  const items = [...resolved.values()]
  for (const item of items) Object.assign(deps, item.dependencies || {})
  const fetched = await Promise.all(items.map((item) => reg.fetchMany(item, item.files)))
  items.forEach((item, i) => {
    for (const p of item.files) w.write(p, fetched[i][p])
    // Only a real write earns a record: an item whose files were all skipped was installed some
    // other way, and claiming it as pristine would let `update` overwrite someone's edits.
    if (item.files.some((p) => w.matches(p)) || manifest.items[item.name])
      recordItem(manifest, item.name, item.hash || null, fetched[i], w)
  })

  reportWrites(w)
  saveManifest(root, manifest)

  if (opts.install) installDeps(root, deps)
  else if (Object.keys(deps).length) info(`skipped install - deps: ${Object.keys(deps).join(" ")}`)

  log()
  ok(`added ${names.join(", ")}`)
  if (w.useSrc) info("detected a src/ layout - files were written under src/")
  if (w.skipped.length) info(`already installed? ${c.cyan("koalaui update")} brings files up to date without touching your edits`)
  log()
}

/** Where each installed item stands against the registry. */
async function inspect(reg, root, only) {
  const m = await reg.meta()
  const manifest = loadManifest(root)
  const names = Object.keys(manifest.items)
  if (!names.length) fail(`nothing tracked in ${MANIFEST}. Install with ${c.cyan("koalaui init")} / ${c.cyan("koalaui add")} first.`)
  if (only.length) {
    const unknown = only.filter((n) => !manifest.items[n])
    if (unknown.length) fail(`not installed (per ${MANIFEST}): ${unknown.join(", ")}`)
  }
  const byName = new Map(m.items.map((i) => [i.name, i]))
  const w = makeWriter(root, false)
  const rows = []
  for (const name of only.length ? only : names) {
    const rec = manifest.items[name]
    const upstream = name === "init" ? { ...initUnit(m), init: true } : byName.get(name)
    if (!upstream) {
      rows.push({ name, rec, gone: true })
      continue
    }
    const targets = upstream.init ? upstream.files.map((f) => f.to) : upstream.files
    const edited = Object.keys(rec.files).filter((t) => {
      const local = w.read(t)
      return local != null && sha(local) !== rec.files[t]
    })
    rows.push({ name, rec, upstream, targets, edited, outdated: !upstream.hash || upstream.hash !== rec.hash })
  }
  return { m, manifest, rows, w }
}

async function cmdDiff(reg, opts) {
  const root = opts.cwd
  const { rows, w } = await inspect(reg, root, opts._)
  log(c.bold(`\nKoala UI - diff ${c.dim(`(${reg.label})`)}\n`))

  // With names: show the actual change, local file vs the registry's current version.
  if (opts._.length) {
    for (const row of rows) {
      if (row.gone) {
        warn(`${row.name} is no longer in the registry`)
        continue
      }
      const upstream = row.upstream.init ? await fetchInit(reg, row.upstream) : await reg.fetchMany(row.upstream, row.upstream.files)
      let same = true
      for (const t of row.targets) {
        const local = w.read(t)
        const next = upstream[t]
        if (local != null && normalize(local) === normalize(next)) continue
        same = false
        log(c.bold(`${row.name} › ${t}`) + (local == null ? c.dim("  (new file)") : ""))
        log(unifiedDiff(local ?? "", next))
        log()
      }
      if (same) ok(`${row.name} matches the registry`)
    }
    return
  }

  // Only what needs a look gets a line; the up-to-date majority collapses into one count.
  const outdated = rows.filter((r) => r.outdated && !r.gone)
  let current = 0
  for (const row of rows) {
    if (row.gone) warn(`${row.name} ${c.dim("no longer in the registry")}`)
    else if (row.outdated)
      log(`${c.yellow("↑")} ${row.name} ${c.dim("update available")}${row.edited.length ? c.dim(` · edited: ${row.edited.join(", ")}`) : ""}`)
    else if (row.edited.length) log(`${c.cyan("•")} ${row.name} ${c.dim(`up to date · edited: ${row.edited.join(", ")}`)}`)
    else current++
  }
  if (current) ok(`${current} item(s) up to date`)
  log()
  if (outdated.length) info(`${outdated.length} update(s). See the changes: ${c.cyan("koalaui diff <item>")} · apply: ${c.cyan("koalaui update")}`)
  else ok("everything is up to date")
  log()
}

async function cmdUpdate(reg, opts) {
  const root = opts.cwd
  const { m, manifest, rows } = await inspect(reg, root, opts._)
  const w = makeWriter(root, false)
  log(c.bold(`\nKoala UI - update ${c.dim(`(${reg.label})`)}\n`))

  const todo = rows.filter((r) => !r.gone && (r.outdated || opts._.length))
  for (const r of rows.filter((r) => r.gone)) warn(`${r.name} is no longer in the registry, left as is`)
  if (!todo.length) {
    ok("everything is up to date")
    log()
    return
  }

  const deps = {}
  const kept = []
  const newDeps = new Set()
  for (const row of todo) {
    const up = row.upstream
    const upstream = up.init ? await fetchInit(reg, up) : await reg.fetchMany(up, up.files)
    Object.assign(deps, up.dependencies || {})
    for (const dep of [...(up.registryDependencies || []), ...(up.libDependencies || [])])
      if (!manifest.items[dep]) newDeps.add(dep)

    let skippedAny = false
    for (const t of row.targets) {
      const local = w.read(t)
      const next = upstream[t]
      if (local != null && normalize(local) === normalize(next)) {
        // Already identical: nothing to write, but the record should say so.
        manifest.items[row.name] = manifest.items[row.name] || { files: {} }
        manifest.items[row.name].files[t] = sha(next)
        continue
      }
      const recorded = row.rec.files[t]
      // Koala hasn't changed this file since it was installed: any difference is the buyer's own
      // edit, and there is nothing to bring in.
      // (--force is the explicit reset back to the registry's version, so it skips this.)
      if (!opts.force && local != null && recorded && sha(next) === recorded) continue
      const pristine = local == null || (recorded && sha(local) === recorded)
      if (pristine || opts.force) {
        w.write(t, next, true)
      } else {
        skippedAny = true
        kept.push({ item: row.name, target: t })
      }
    }
    recordItem(manifest, row.name, skippedAny ? row.rec.hash : up.hash || null, upstream, w)
  }

  // An update can start depending on an item this project never installed.
  if (newDeps.size) {
    const extra = [...resolveItems(m, [...newDeps]).values()].filter((i) => !manifest.items[i.name])
    if (extra.length) info(`new dependencies: ${c.dim(extra.map((i) => i.name).join(", "))}`)
    const fetched = await Promise.all(extra.map((item) => reg.fetchMany(item, item.files)))
    extra.forEach((item, i) => {
      for (const p of item.files) w.write(p, fetched[i][p])
      Object.assign(deps, item.dependencies || {})
      recordItem(manifest, item.name, item.hash || null, fetched[i], w)
    })
  }

  for (const t of w.written) ok(`updated ${c.dim(t)}`)
  for (const k of kept) warn(`you edited ${c.dim(k.target)}, kept yours ${c.dim(`(koalaui diff ${k.item} · --force to replace)`)}`)
  saveManifest(root, manifest)

  if (opts.install) installDeps(root, deps)
  log()
  const held = new Set(kept.map((k) => k.item))
  const touched = (r) => r.targets.some((t) => w.written.includes(t))
  const done = todo.filter((r) => !held.has(r.name) && touched(r)).map((r) => r.name)
  const current = todo.filter((r) => !held.has(r.name) && !touched(r)).map((r) => r.name)
  if (done.length) ok(`updated ${done.join(", ")}`)
  if (current.length) ok(`already current: ${current.join(", ")}`)
  if (held.size) info(`partly updated, your edits kept: ${[...held].join(", ")}`)
  log()
}

// ── a small line diff (LCS), enough to read an update before taking it ─────────
function unifiedDiff(a, b, context = 3) {
  const x = normalize(a).split("\n")
  const y = normalize(b).split("\n")
  const n = x.length
  const mm = y.length
  // Trim the shared head and tail first: most updates touch a few lines of a long file.
  let head = 0
  while (head < n && head < mm && x[head] === y[head]) head++
  let tail = 0
  while (tail < n - head && tail < mm - head && x[n - 1 - tail] === y[mm - 1 - tail]) tail++
  const xs = x.slice(head, n - tail)
  const ys = y.slice(head, mm - tail)
  const W = ys.length + 1
  const L = new Uint32Array((xs.length + 1) * W)
  for (let i = xs.length - 1; i >= 0; i--)
    for (let j = ys.length - 1; j >= 0; j--)
      L[i * W + j] = xs[i] === ys[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1])
  /** @type {[string, string][]} */
  const ops = x.slice(0, head).map((l) => [" ", l])
  let i = 0
  let j = 0
  while (i < xs.length || j < ys.length) {
    if (i < xs.length && j < ys.length && xs[i] === ys[j]) {
      ops.push([" ", xs[i++]])
      j++
    } else if (j < ys.length && (i >= xs.length || L[i * W + j + 1] >= L[(i + 1) * W + j])) ops.push(["+", ys[j++]])
    else ops.push(["-", xs[i++]])
  }
  for (const l of x.slice(n - tail)) ops.push([" ", l])

  // Print each change with `context` lines around it; runs of unchanged lines collapse to ⋯.
  const show = new Uint8Array(ops.length)
  ops.forEach(([op], k) => {
    if (op !== " ") for (let q = Math.max(0, k - context); q <= Math.min(ops.length - 1, k + context); q++) show[q] = 1
  })
  const out = []
  let prev = -1
  ops.forEach(([o, l], k) => {
    if (!show[k]) return
    if (prev >= 0 && k > prev + 1) out.push(c.dim("  ⋯"))
    out.push(o === "+" ? c.green(`+ ${l}`) : o === "-" ? c.red(`- ${l}`) : c.dim(`  ${l}`))
    prev = k
  })
  return out.join("\n")
}

// ── license commands ──────────────────────────────────────────────────────────
/**
 * Activate a license on this machine.
 *
 * This used to save whatever string it was given and let the first `add` discover the mistake,
 * which reported a typo as a paywall, at the wrong moment, in the wrong words. Activating here
 * means a bad key fails on the command that took it, and a full team ("reached the activation
 * limit") reads as the seat problem it is.
 */
async function cmdLogin(opts) {
  const key = opts._[0]
  if (!key) fail(`usage: ${c.cyan("koalaui login <license-key>")}`)
  const api = resolveApi(opts)

  let res
  try {
    res = await fetch(`${api}/cli-activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, instanceName: hostname() }),
    })
  } catch {
    fail(`could not reach ${api}. Check your connection and try again.`)
  }

  let body = {}
  try {
    body = await res.json()
  } catch {}

  if (!res.ok) {
    fail(
      `that license could not be activated.\n` +
        `  ${body.error || `activation failed (${res.status})`}.\n` +
        `  Manage or buy access → ${body.purchase || PURCHASE_URL}`
    )
  }

  const patch = { license: key, instanceId: body.instanceId }
  if (opts.api) patch.api = opts.api
  saveConfig(patch)

  ok(`license activated on ${c.bold(hostname())}`)
  if (body.seats > 1) info(`${body.plan} plan - seat ${body.used} of ${body.seats}`)
  info(`now add a gated section, e.g. ${c.cyan("koalaui add marketing-hero")}`)
}

/**
 * Release this machine's seat, then forget the key.
 *
 * The local key is removed even if the release fails: a logout that leaves the credential on disk
 * because a network call went wrong is the worse of the two outcomes.
 */
async function cmdLogout(opts) {
  const cfg = loadConfig()
  const { license, instanceId } = cfg

  if (license && instanceId) {
    try {
      const res = await fetch(`${resolveApi(opts)}/cli-deactivate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: license, instanceId }),
      })
      if (res.ok) ok("seat released")
      else warn("could not release the seat remotely - free it from your account if needed")
    } catch {
      warn("could not reach the license service - the seat may still be held")
    }
  }

  delete cfg.license
  delete cfg.instanceId
  mkdirSync(dirname(CONFIG_PATH), { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n")
  ok("license removed")
}
function cmdWhoami(opts) {
  const key = resolveLicense(opts)
  if (!key) {
    info(`no license configured. Activate one: ${c.cyan("koalaui login <key>")}`)
    return
  }
  const masked = key.length > 16 ? `${key.slice(0, 12)}…${key.slice(-4)}` : key
  log(`license: ${c.bold(masked)}`)
  log(`machine: ${resolveInstanceId() ? c.dim(`activated as ${hostname()}`) : c.yellow("not activated - run koalaui login <key>")}`)
  log(`api:     ${c.dim(resolveApi(opts))}`)
}

function help() {
  log(`
${c.bold("koalaui")} - add Koala UI components & sections to your project

${c.bold("Usage")}
  koalaui init                 set up tokens, core lib helpers and base deps
  koalaui add <item...>        copy items (and their deps) into your project
  koalaui list                 list available items (free + pro)
  koalaui diff [item...]       what changed upstream since you installed
  koalaui update [item...]     update installed items, keeping files you edited
  koalaui login <key>          activate your PRO license on this machine
  koalaui logout               release this machine's seat and forget the key
  koalaui whoami               show the active license

${c.bold("Tiers")}
  free    components + lib + tokens - no auth
  PRO 🔒  sections / templates - need a license:
          buy at ${PURCHASE_URL}, then ${c.cyan("koalaui login <key>")}
          (owner/dev: a GitHub token to the private repo also works)

${c.bold("Options")}
  --cwd <dir>        target project root (default: cwd)
  --license <key>    PRO license key (overrides saved / $KOALAUI_LICENSE)
  --api <url>        entitlement API base (overrides $KOALAUI_API)
  --registry <dir>   read FREE files from a local checkout (dev)
  --pro <dir>        read PRO files from a local checkout (dev; default ../koala-ui-pro)
  --branch <b>       branch (default: ${DEFAULT_BRANCH})
  --token <t>        GitHub token (owner/dev PRO access)
  --overwrite        overwrite existing files
  --force            update: also replace files you edited
  --no-install       write files but don't run the package manager
  -h, --help         show this help
`)
}

// ── entry ─────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const cmd = opts._.shift()
  if (opts.help || !cmd || cmd === "help") return help()
  try {
    if (cmd === "login") return await cmdLogin(opts)
    if (cmd === "logout") return await cmdLogout(opts)
    if (cmd === "whoami") return cmdWhoami(opts)
    const reg = makeRegistry(opts)
    if (cmd === "list") return await cmdList(reg)
    if (cmd === "init") return await cmdInit(reg, opts)
    if (cmd === "add") return await cmdAdd(reg, opts)
    if (cmd === "diff") return await cmdDiff(reg, opts)
    if (cmd === "update") return await cmdUpdate(reg, opts)
    fail(`unknown command: ${cmd}\n  Run ${c.cyan("koalaui --help")}.`)
  } catch (err) {
    log(`${c.red("✗")} ${err && err.message ? err.message : String(err)}`)
    process.exitCode = 1
  }
}

main()
