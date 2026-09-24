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
 *   koalaui template <name> [dir]  start a new site from a PRO template (whole Next.js app)
 *   koalaui skill                write the Koala UI agent skill into .claude/skills/koala-ui
 *
 * Tiers:
 *   FREE  components/ui, lib, tokens and one sample section per family - fetched from the
 *         PUBLIC repo, no auth.
 *   PRO   every other section, page examples and templates - served by the entitlement API to
 *         an activated license, stamped with a fingerprint of it. PRO items can depend on FREE
 *         ones; those still come from the public repo automatically.
 *
 * PRO auth - a license key from your purchase, activated once per machine with
 * `koalaui login <key>`. Activation claims one seat of the plan and saves the key plus its
 * instance id to ~/.koalaui/config.json (owner-only). `koalaui logout` releases the seat again.
 * On CI: activate once with `koalaui login <key> --name ci --no-save`, then set KOALAUI_LICENSE
 * and KOALAUI_INSTANCE.
 *
 * As an owner/dev fallback, a GitHub token with read access to the pro repo also works,
 * resolved in order: 1. $KOALAUI_TOKEN  2. $GH_TOKEN  3. $GITHUB_TOKEN  4. `gh auth token`
 *
 * Flags: see `koalaui --help`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { join, dirname, isAbsolute, resolve as resolvePath } from "node:path"
import { hostname } from "node:os"
import { createHash } from "node:crypto"
import { execFileSync, execSync } from "node:child_process"

import {
  ACCOUNT_URL,
  FONT_PACKAGES,
  MAX_PATHS,
  PURCHASE_URL,
  SITE,
  STYLESHEET_CANDIDATES,
  TAILWIND_IMPORT,
  VERSION,
  assetUrl,
  chunk,
  describeHttpError,
  detectFramework,
  importSpecifier,
  installCommand,
  isCi,
  isStockShadcnUtils,
  koalaCssTarget,
  loadConfig,
  maskSecret,
  normalize,
  resolveApiBase,
  resolveAssetBase,
  resolveInside,
  resolveInstance,
  resolveLicense,
  resolveTemplatePath,
  sha,
  shadcnStylesheet,
  validateDepSpec,
  wireCss,
  writeConfig,
} from "./lib.mjs"

const DEFAULT_PUBLIC_REPO = "jespinosa19/koala-ui"
const DEFAULT_BRANCH = "main"
const FETCH_TIMEOUT_MS = 30_000
const HEADERS = { "User-Agent": `koalaui-cli/${VERSION}`, "X-Koalaui-Cli": VERSION }

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
    instance: null,
    name: null,
    api: null,
    dir: null,
    overwrite: false,
    force: false,
    install: true,
    save: true,
    ci: false,
    yes: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--cwd") out.cwd = argv[++i]
    else if (a === "--registry") out.registry = argv[++i]
    else if (a === "--pro") out.pro = argv[++i]
    else if (a === "--branch") out.branch = argv[++i]
    else if (a === "--token") out.token = argv[++i]
    else if (a === "--license") out.license = argv[++i]
    else if (a === "--instance") out.instance = argv[++i]
    else if (a === "--name") out.name = argv[++i]
    else if (a === "--api") out.api = argv[++i]
    else if (a === "--dir") out.dir = argv[++i]
    else if (a === "--overwrite") out.overwrite = true
    else if (a === "--force") out.force = true
    else if (a === "--no-install") out.install = false
    else if (a === "--no-save") out.save = false
    else if (a === "--ci") out.ci = true
    else if (a === "-y" || a === "--yes") out.yes = true
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
    const t = execFileSync("gh", ["auth", "token"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()
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
    `${c.bold(itemName)} is part of ${c.bold("Koala UI Pro")} - it needs a license.\n` +
      (reason ? `  ${c.dim(reason)}\n` : "") +
      `  Have one? Activate it:  ${c.cyan("koalaui login <key>")}\n` +
      `  Get a license → ${PURCHASE_URL}`
  )
}

// ── license + config (~/.koalaui/config.json, see lib.mjs) ──────────────────────
/**
 * Entitlement API base: --api › $KOALAUI_API › default. An `api` left in the config by an older
 * release is ignored: a persisted base URL would send every future key wherever it points.
 */
function resolveApi(opts) {
  if (loadConfig().api && !opts.api && !process.env.KOALAUI_API)
    warn(`ignoring the saved API base in ~/.koalaui/config.json ${c.dim("(pass --api or set KOALAUI_API instead)")}`)
  try {
    return resolveApiBase({ flag: opts.api, env: process.env.KOALAUI_API })
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}

/** fetch with a timeout and the CLI's identifying headers. */
function request(url, init = {}) {
  return fetch(url, {
    ...init,
    headers: { ...HEADERS, ...(init.headers || {}) },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
}

async function readBody(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
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
  const cfg = loadConfig()
  const license = resolveLicense(opts, cfg)
  const instanceId = resolveInstance(opts, cfg, license)
  async function rawPublic(repo, path) {
    const res = await request(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`)
    if (res.status === 404) throw new Error(`not found: ${path} (${repo}@${branch})`)
    if (!res.ok) throw new Error(`${res.status} fetching ${path}`)
    return res.text()
  }
  async function apiPrivate(repo, path, itemName) {
    const token = requireToken(opts, itemName)
    const res = await request(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
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
  // validates the key and this machine's activation, then proxies the files out of the private
  // repo stamped with the license's fingerprint; the buyer never gets a repo credential.
  //
  // An item's files go in as few requests as possible (the server takes up to MAX_PATHS each). The
  // licensing provider rate-limits key checks across all customers, so a request per file would let
  // one person installing a handful of sections lock out everyone buying at the same moment.
  async function proViaLicense(item, paths) {
    if (!instanceId) {
      fail(
        `this machine has no activated seat for that license.\n` +
          `  Activate it once:  ${c.cyan("koalaui login <key>")}\n` +
          `  On CI: activate with ${c.cyan("koalaui login <key> --name ci --no-save")} and set KOALAUI_INSTANCE`
      )
    }
    const api = resolveApi(opts)
    const files = {}
    for (const batch of chunk(paths, MAX_PATHS)) {
      let res
      try {
        res = await request(`${api}/cli-entitlement`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key: license, instanceId, repo: item.repo, paths: batch }),
        })
      } catch {
        fail(`could not reach ${api}. Check your connection and try again.`)
      }
      const body = await readBody(res)
      if (res.status === 403) {
        fail(
          `your license can't install ${c.bold(item.name)}.\n` +
            `  ${body?.error || "invalid or inactive license"}.\n` +
            `  Manage your license → ${ACCOUNT_URL} · buy one → ${body?.purchase || PURCHASE_URL}`
        )
      }
      if (!res.ok || !body || typeof body.files !== "object") {
        fail(`${item.name}: ${describeHttpError(res.status, body, res.headers.get("retry-after"), item.name)}`)
      }
      Object.assign(files, body.files)
    }
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
  // Every path comes from the registry, fetched over the network: resolveInside refuses anything
  // that would land outside the project's app/components/lib folders.
  const resolve = (target) => resolveInside(useSrc ? join(root, "src") : root, target)
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
  /** A registry target as it sits in the project, from the root: `src/…` in a src/ layout. */
  const fromRoot = (target) => (useSrc ? `src/${target}` : target)
  return { read, write, matches, fromRoot, written, skipped, same, useSrc }
}

// ── the project: its framework and its global stylesheet ─────────────────────────
/**
 * A file the project owns, read by a path from its root. Only for paths the CLI names itself
 * (the stylesheet candidates, components.json), never for registry targets: those go through
 * makeWriter, which holds them to the project's writable folders.
 */
function readProject(root, path) {
  const abs = join(root, ...path.split("/"))
  return existsSync(abs) ? readFileSync(abs, "utf8") : null
}

function inspectProject(root) {
  let pkg = {}
  try {
    pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
  } catch {}
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const components = readProject(root, "components.json")
  return {
    framework: detectFramework((p) => existsSync(join(root, p)), deps),
    shadcn: components != null,
    shadcnCss: components != null ? shadcnStylesheet(components) : null,
  }
}

/**
 * The stylesheet that imports Tailwind: the one components.json names, else the first usual
 * location that holds the import. A Next project whose globals.css lost the import still gets it
 * wired, as before; anywhere else a stylesheet without Tailwind is not assumed to be the global one.
 */
function findStylesheet(root, project) {
  const candidates = [...new Set([...(project.shadcnCss ? [project.shadcnCss] : []), ...STYLESHEET_CANDIDATES])]
  for (const path of candidates) {
    const css = readProject(root, path)
    if (css != null && TAILWIND_IMPORT.test(css)) return path
  }
  return ["app/globals.css", "src/app/globals.css"].find((p) => readProject(root, p) != null) ?? null
}

/** Where koala.css went on an earlier install, if one is on record. */
const recordedCssTarget = (manifest) => Object.keys(manifest.items.init?.files || {}).find((t) => t.endsWith("koala.css"))

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
/**
 * Record what an install (`init`, `add`, a new dependency in `update`) left on disk. The item moves
 * to `hash` only when every one of its files is now the registry's, written or already identical:
 * a skipped file still holds an older copy, so the item keeps the version it had (none, if it is
 * new here) and `diff`/`update` go on offering the update.
 */
function recordInstall(manifest, name, hash, contents, w) {
  const complete = Object.keys(contents).every((t) => w.matches(t))
  recordItem(manifest, name, complete ? hash : (manifest.items[name]?.hash ?? null), contents, w)
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
  // Names and ranges come from the registry: each is held to npm's grammar before it reaches a
  // command line, and on POSIX no shell is involved at all.
  const specs = Object.entries(deps)
    .filter(([n]) => !have[n])
    .map(([n, v]) => validateDepSpec(n, v))
  if (!specs.length) return
  const pm = detectPM(root)
  const run = installCommand(pm, specs)
  info(`${pm} ${pm === "npm" ? "install" : "add"} ${specs.join(" ")}`)
  if (run.shell) execSync(run.command, { cwd: root, stdio: "inherit" })
  else execFileSync(run.file, run.args, { cwd: root, stdio: "inherit" })
}

// ── registry helpers ──────────────────────────────────────────────────────────
/**
 * `init` as an installable unit: its files, keyed by where they land in the project. The registry
 * places koala.css in app/, where a Next project keeps it; `cssTo` moves it (a Vite project keeps
 * it in styles/), and koala.json remembers where, so diff and update look in the same place.
 */
function initUnit(m, cssTo) {
  const spec = m.init
  // Registries built before `init.files` existed shipped the raw site stylesheet.
  const files = (spec.files || [{ from: spec.cssFrom, to: spec.cssTarget }]).map((f) =>
    cssTo && f.to.endsWith("koala.css") ? { ...f, to: cssTo } : f
  )
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
/**
 * Point the project's global stylesheet at koala.css (see wireCss in lib.mjs). The stylesheet is a
 * file the CLI found itself, not a registry target, so it is written by its path from the root.
 * @param {string} root
 * @param {string | null} stylesheet  from findStylesheet
 * @param {string} koalaPath  koala.css, from the root
 * @param {boolean} fonts  also wire Koala's faces (projects without next/font)
 */
function wireStylesheet(root, stylesheet, koalaPath, fonts) {
  if (!stylesheet) return { status: "missing", target: null, conflicts: [] }
  const result = wireCss(readProject(root, stylesheet) ?? "", { specifier: importSpecifier(stylesheet, koalaPath), fonts })
  if (result.status !== "present") writeFileSync(join(root, ...stylesheet.split("/")), result.css)
  return { status: result.status, target: stylesheet, conflicts: result.conflicts }
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

const ENTRY_SNIPPET = `
    import { ThemeProvider } from "@/components/theme-provider"

    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StrictMode>
    )`

const VITE_ALIAS_SNIPPET = `
    // vite.config.ts
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } }`

const MIGRATION_URL = `${SITE}/docs/migrating-from-shadcn`

// ── commands ─────────────────────────────────────────────────────────────────
async function cmdList(reg) {
  const m = await reg.meta()
  const free = m.items.filter((i) => i.type !== "lib" && i.tier === "free")
  const pro = m.items.filter((i) => i.tier === "pro" && i.type !== "template")
  const templates = m.items.filter((i) => i.type === "template")
  log(c.bold(`\nKoala UI ${c.dim(`(${reg.label})`)}\n`))
  log(c.bold(`Free ${c.dim(`(${free.length})`)}`))
  for (const i of free) log(`  ${i.name}`)
  if (pro.length) {
    log(c.bold(`\nPRO ${c.dim(`(${pro.length}, requires access)`)} 🔒`))
    for (const i of pro) log(`  ${i.name} ${c.dim(i.type)}`)
  }
  if (templates.length) {
    log(c.bold(`\nTemplates ${c.dim(`(${templates.length}, PRO, whole sites)`)} 🔒`))
    for (const i of templates) log(`  ${i.name} ${c.dim(i.title || "")}`)
  }
  log(`\n${c.dim("Add with:")} koalaui add <item...>`)
  if (templates.length) log(`${c.dim("Start a site from a template:")} koalaui template <name> [dir]`)
  log()
}

async function cmdInit(reg, opts) {
  const root = opts.cwd
  log(c.bold(`\nKoala UI - init ${c.dim(`(${reg.label})`)}\n`))
  const m = await reg.meta()
  const manifest = loadManifest(root)
  const w = makeWriter(root, opts.overwrite)
  const project = inspectProject(root)
  const stylesheet = findStylesheet(root, project)
  // next/font loads the faces in a Next app; anywhere else init wires them into the stylesheet.
  const fonts = project.framework !== "next" && stylesheet != null

  const unit = initUnit(m, recordedCssTarget(manifest) || koalaCssTarget(stylesheet, project.framework))
  const contents = await fetchInit(reg, unit)
  for (const [to, content] of Object.entries(contents)) w.write(to, content)
  recordInstall(manifest, "init", unit.hash, contents, w)

  // The core helpers are ordinary registry items (utils, tv), so they update like any other.
  // shadcn/ui's lib/utils.ts is only `cn`, which Koala's keeps as is, so it is replaced: left in
  // place it would break lib/tv.ts, which imports the merge config from the same file.
  const UTILS = "lib/utils.ts"
  const utils = w.read(UTILS)
  const shadcnUtils = utils != null && isStockShadcnUtils(utils)
  const libs = [...resolveItems(m, m.init.lib ? m.init.lib.map((p) => p.replace(/^lib\/|\.tsx?$/g, "")) : []).values()]
  const deps = { ...unit.dependencies, ...(fonts ? FONT_PACKAGES : {}) }
  const fetched = await Promise.all(libs.map((item) => reg.fetchMany(item, item.files)))
  libs.forEach((item, i) => {
    for (const p of item.files) w.write(p, fetched[i][p], p === UTILS && shadcnUtils ? true : undefined)
    Object.assign(deps, item.dependencies || {})
    recordInstall(manifest, item.name, item.hash || null, fetched[i], w)
  })

  const koalaPath = w.fromRoot(unit.files.find((f) => f.to.endsWith("koala.css"))?.to ?? "app/koala.css")
  const css = wireStylesheet(root, stylesheet, koalaPath, fonts)
  reportWrites(w)
  saveManifest(root, manifest)
  ok(`recorded ${c.dim(MANIFEST)}`)

  if (opts.install) installDeps(root, deps)
  else info(`skipped install - deps: ${Object.keys(deps).join(" ")}`)

  log()
  ok("init complete")
  if (w.useSrc) info("detected a src/ layout - files were written under src/")
  if (project.framework === "vite") info("detected a Vite project")
  if (shadcnUtils && w.written.includes(UTILS)) info(`replaced shadcn's ${w.fromRoot(UTILS)} with Koala's: the same ${c.cyan("cn")}, plus the merge config ${c.cyan("tv")} reads`)
  if (w.skipped.includes(UTILS))
    warn(
      `${w.fromRoot(UTILS)} is your own, so it was kept, but ${w.fromRoot("lib/tv.ts")} imports ${c.cyan("twMergeConfig")} from it.\n` +
        `  Merge Koala's version in (${c.cyan("koalaui diff utils")}) or re-run with ${c.cyan("--overwrite")}.`
    )
  if (css.status === "replaced") info(`replaced the create-next-app boilerplate in ${css.target} with the Koala import`)
  if (css.status === "added") info(`imported ${c.cyan(koalaPath)} from ${css.target}${fonts ? ", with Inter and DM Sans" : ""}`)
  for (const conflict of css.conflicts)
    warn(`${css.target} ${conflict}: remove it, or it overrides Koala's themes`)

  log(`\n${c.bold("Next steps:")}`)
  let step = 1
  if (css.status === "missing") {
    log(`  ${step++}. In your global stylesheet, right after ${c.cyan('@import "tailwindcss";')}, import koala.css:`)
    log(`     ${c.cyan(`@import "<path to ${koalaPath}>";`)} ${c.dim("(relative to the stylesheet)")}`)
  }
  if (project.framework === "next") {
    log(`  ${step++}. Wire the fonts and the theme in your root layout ${c.dim("(app/layout.tsx)")}:`)
    log(c.dim(LAYOUT_SNIPPET))
  } else {
    log(`  ${step++}. Wrap your app in the theme provider ${c.dim(`(${project.framework === "vite" ? "src/main.tsx" : "your entry file"})`)}:`)
    log(c.dim(ENTRY_SNIPPET))
    log(c.dim(`    For a single-theme app, pin it: <ThemeProvider forcedTheme="dark">`))
    if (!fonts)
      log(
        `  ${step++}. Load Inter and DM Sans ${c.dim("(e.g. @fontsource-variable/inter and @fontsource-variable/dm-sans/opsz.css)")} and set ${c.cyan("--font-sans")} / ${c.cyan("--font-heading")} on :root.`
      )
  }
  const tsconfig = ["tsconfig.json", "tsconfig.app.json"].map((p) => readProject(root, p) ?? "").join("\n")
  if (!tsconfig.includes('"@/*"'))
    log(
      `  ${step++}. Add the ${c.cyan('"@/*"')} path alias to your tsconfig ${c.dim(`("paths": { "@/*": ["./${w.useSrc ? "src/" : ""}*"] })`)}; every component imports through it.`
    )
  if (project.framework === "vite") {
    const viteConfig = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].map((p) => readProject(root, p) ?? "").join("\n")
    if (!/alias[\s\S]*["']@["']/.test(viteConfig)) {
      log(`  ${step++}. Teach Vite the same alias:`)
      log(c.dim(VITE_ALIAS_SNIPPET))
    }
  }
  if (project.shadcn)
    log(
      `  ${step++}. Coming from shadcn/ui? Swap one component at a time: delete ${c.cyan(w.fromRoot("components/ui/<name>.tsx"))}, then ${c.cyan("koalaui add <name>")}.\n` +
        `     ${c.dim(MIGRATION_URL)}`
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
  // A template is a whole site, not something to drop into a project.
  const template = [...resolved.values()].find((i) => i.type === "template")
  if (template)
    fail(`${c.bold(template.name)} is a template, a whole site.\n  Start one in a new folder: ${c.cyan(`koalaui template ${template.name} [dir]`)}`)

  // A flat components/ui/button.tsx (how shadcn/ui lays components out) wins the resolution of
  // `@/components/ui/button` over Koala's button/ folder, so every Koala import of it, including
  // other Koala components', would silently land in the old file. Stop before writing anything.
  const w = makeWriter(root, opts.overwrite)
  const shadows = []
  for (const item of resolved.values()) {
    if (item.type !== "component") continue
    for (const ext of ["tsx", "ts", "jsx", "js"]) if (w.read(`components/ui/${item.name}.${ext}`) != null) shadows.push(w.fromRoot(`components/ui/${item.name}.${ext}`))
  }
  if (shadows.length)
    fail(
      `${shadows.join(", ")} would shadow Koala's folder of the same name: ${c.cyan("@/components/ui/<name>")} resolves to the file first,\n` +
        `  so Koala's own imports would land in it. Delete or rename ${shadows.length === 1 ? "it" : "them"}, then run the add again.\n` +
        `  Swapping from shadcn/ui, one component at a time → ${MIGRATION_URL}`
    )

  const involvesPro = [...resolved.values()].some((i) => i.tier === "pro")
  log(c.bold(`\nKoala UI - adding ${names.join(", ")} ${c.dim(`(${reg.label})`)}\n`))
  if (involvesPro) info(`includes ${c.bold("PRO")} content 🔒`)
  const extra = [...resolved.keys()].filter((n) => !names.includes(n))
  if (extra.length) info(`pulling dependencies: ${c.dim(extra.join(", "))}`)

  // Fetch each item's files in one call (each from its own tier's source), items in parallel.
  const deps = {}
  const items = [...resolved.values()]
  for (const item of items) Object.assign(deps, item.dependencies || {})
  const fetched = await Promise.all(items.map((item) => reg.fetchMany(item, item.files)))
  items.forEach((item, i) => {
    for (const p of item.files) w.write(p, fetched[i][p])
    // Only a real write earns a record: an item whose files were all skipped was installed some
    // other way, and claiming it as pristine would let `update` overwrite someone's edits.
    if (item.files.some((p) => w.matches(p)) || manifest.items[item.name])
      recordInstall(manifest, item.name, item.hash || null, fetched[i], w)
  })

  reportWrites(w)
  saveManifest(root, manifest)

  if (opts.install) installDeps(root, deps)
  else if (Object.keys(deps).length) info(`skipped install - deps: ${Object.keys(deps).join(" ")}`)

  log()
  ok(`added ${names.join(", ")}`)
  if (w.useSrc) info("detected a src/ layout - files were written under src/")
  if (w.skipped.length) info(`already installed? ${c.cyan("koalaui update")} brings files up to date without touching your edits`)
  const nextOnly = items.filter((i) => i.frameworks?.includes("next")).map((i) => i.name)
  if (nextOnly.length && inspectProject(root).framework !== "next")
    warn(
      `${nextOnly.join(", ")} import${nextOnly.length === 1 ? "s" : ""} from next/* (next/link, next/image), which only resolves in Next.js.\n` +
        `  Swap those imports for your router's link and a plain <img>.`
    )
  log()
}

// ── templates: a whole site, written into a new folder ──────────────────────────
const ASSET_TIMEOUT_MS = 60_000
const ASSET_CONCURRENCY = 6

/** One picture, checked against its size and sha256 before it is kept. */
async function downloadAsset(url, asset) {
  let lastError = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(ASSET_TIMEOUT_MS) })
      if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length !== asset.bytes) throw new Error(`${asset.path}: expected ${asset.bytes} bytes, got ${buf.length}`)
      const digest = createHash("sha256").update(buf).digest("hex")
      if (digest !== asset.sha256) throw new Error(`${asset.path}: checksum mismatch, refusing it`)
      return buf
    } catch (error) {
      lastError = error
      // A wrong file is not retried: only a network hiccup is.
      if (error instanceof Error && /bytes, got|checksum/.test(error.message)) break
    }
  }
  throw lastError
}

async function downloadAssets(meta, root) {
  const base = resolveAssetBase(meta.assetBase, process.env.KOALAUI_ASSET_BASE)
  const assets = Array.isArray(meta.assets) ? meta.assets : []
  let done = 0
  const queue = [...assets]
  async function worker() {
    for (let asset = queue.shift(); asset; asset = queue.shift()) {
      const target = resolveTemplatePath(root, asset.path)
      const buf = await downloadAsset(assetUrl(base, asset.path), asset)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, buf)
      done++
    }
  }
  await Promise.all(Array.from({ length: Math.min(ASSET_CONCURRENCY, assets.length) }, worker))
  return { count: done, bytes: assets.reduce((n, a) => n + a.bytes, 0), base }
}

async function cmdTemplate(reg, opts) {
  const [name, folder] = opts._
  if (!name) fail("which template? Usage: koalaui template <name> [dir]")
  const m = await reg.meta()
  const templates = m.items.filter((i) => i.type === "template")
  const item = templates.find((i) => i.name === name)
  if (!item)
    fail(
      `unknown template: ${name}\n  Templates: ${templates.map((i) => i.name).join(", ") || "none yet"}\n` +
        `  Run ${c.cyan("koalaui list")} to see everything.`
    )

  // A template is a whole project, so it only goes into a folder that holds nothing yet.
  const dest = resolvePath(opts.cwd, folder || name)
  if (existsSync(dest) && readdirSync(dest).length)
    fail(`${dest} is not empty. A template starts a new site: ${c.cyan(`koalaui template ${name} <new-folder>`)}`)

  log(c.bold(`\nKoala UI - template ${name} ${c.dim(`(${reg.label})`)}\n`))
  info(`${c.bold("PRO")} content 🔒`)
  const prefix = `templates/${name}/`
  if (!item.files.every((p) => typeof p === "string" && p.startsWith(prefix))) fail(`the registry lists files outside ${prefix}`)
  const files = await reg.fetchMany(item, item.files)
  const metaText = files[`${prefix}template.json`]
  if (!metaText) fail(`${name} has no template.json`)
  const meta = JSON.parse(metaText)

  // Everything lands in a sibling folder first and moves into place in one rename, so a failed
  // download never leaves half a site behind.
  const stage = join(dirname(dest), `.koalaui-${name}-${process.pid}`)
  rmSync(stage, { recursive: true, force: true })
  let pictures
  try {
    for (const [path, content] of Object.entries(files)) {
      const target = resolveTemplatePath(stage, path.slice(prefix.length))
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content)
    }
    ok(`${Object.keys(files).length} files`)
    info(`downloading ${meta.assets?.length ?? 0} pictures ${c.dim(`(${((meta.assets ?? []).reduce((n, a) => n + a.bytes, 0) / 1024 / 1024).toFixed(1)} MB)`)}`)
    pictures = await downloadAssets(meta, stage)
    ok(`${pictures.count} pictures, each checked against template.json`)
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
    mkdirSync(dirname(dest), { recursive: true })
    renameSync(stage, dest)
  } catch (error) {
    rmSync(stage, { recursive: true, force: true })
    throw error
  }
  ok(`wrote ${c.bold(name)} to ${dest}`)

  if (opts.install) {
    info("npm ci")
    if (process.platform === "win32") execSync("npm ci", { cwd: dest, stdio: "inherit" })
    else execFileSync("npm", ["ci"], { cwd: dest, stdio: "inherit" })
  } else info(`skipped install - run ${c.cyan("npm ci")} in ${dest}`)

  const rel = folder || name
  log(`\n${c.bold("Next steps:")}`)
  log(`  1. ${c.cyan(`cd ${rel}`)}`)
  log(`  2. ${c.cyan("npm run dev")} ${c.dim("and open http://localhost:3000")}`)
  log(`  3. Read ${c.cyan("README.md")}: where the design layer lives, and what to replace before launch.\n`)
}

// ── the agent skill: Koala's house rules and component docs, for coding agents ──────────
/**
 * The skill lives in the public repo as skills/koala-ui/ (SKILL.md plus one reference per
 * component, generated from the docs), with skills/koala-ui.json listing its files. `skill` copies
 * it into the project, by default to .claude/skills/koala-ui/, where Claude Code loads project
 * skills; other agents are pointed at the same folder.
 *
 * It is documentation, not code the project edits, so a re-run replaces it wholesale and removes
 * the references a newer skill no longer has. Every path comes from the network, so each one is
 * held to the two shapes a skill file can take before anything is written.
 */
const SKILL_MANIFEST = "skills/koala-ui.json"
const SKILL_DEFAULT_DIR = ".claude/skills/koala-ui"
const SKILL_FILE = /^(SKILL\.md|references\/[a-z0-9][a-z0-9-]*\.md)$/

async function cmdSkill(reg, opts) {
  const root = opts.cwd
  const target = resolvePath(root, opts.dir || SKILL_DEFAULT_DIR)
  log(c.bold(`\nKoala UI - agent skill ${c.dim(`(${reg.label})`)}\n`))

  let manifest
  try {
    manifest = JSON.parse(await reg.freeFile(SKILL_MANIFEST))
  } catch (error) {
    fail(`could not read the skill from the registry: ${error instanceof Error ? error.message : String(error)}`)
  }
  const files = manifest && Array.isArray(manifest.files) ? manifest.files : []
  const base = manifest?.path
  if (typeof base !== "string" || !/^skills\/[a-z0-9-]+$/.test(base)) fail("the registry's skill manifest has no valid path")
  if (!files.includes("SKILL.md") || !files.every((f) => typeof f === "string" && SKILL_FILE.test(f)))
    fail("the registry's skill manifest lists files outside a skill (SKILL.md and references/*.md only)")

  const contents = await Promise.all(files.map((f) => reg.freeFile(`${base}/${f}`)))

  // References an older skill had and this one does not: gone, so the agent never reads a stale one.
  const removed = []
  const refs = join(target, "references")
  if (existsSync(refs)) {
    for (const name of readdirSync(refs)) {
      if (name.endsWith(".md") && !files.includes(`references/${name}`)) {
        rmSync(join(refs, name))
        removed.push(name)
      }
    }
  }
  files.forEach((f, i) => {
    const abs = join(target, f)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, contents[i])
  })

  const shown = (opts.dir || SKILL_DEFAULT_DIR).replace(/\\/g, "/").replace(/\/+$/, "")
  ok(`wrote ${c.dim(`${shown}/SKILL.md`)} and ${files.length - 1} component references`)
  if (removed.length) info(`removed ${removed.length} reference${removed.length === 1 ? "" : "s"} the new skill no longer has`)

  log(`\n${c.bold("Next steps:")}`)
  if (!opts.dir)
    log(`  ${c.bold("Claude Code")} loads project skills from .claude/skills/: start a new session to pick it up.`)
  log(`  ${c.bold("Cursor, Codex and other agents")}: add this line to AGENTS.md (or to a rule in .cursor/rules/):`)
  log(`     ${c.cyan(`Before writing UI, read ${shown}/SKILL.md and follow it. Component docs: ${shown}/references/.`)}`)
  log(`  Commit the folder so everyone on the project, and every agent, reads the same rules.`)
  log(`  Run ${c.cyan("koalaui skill")} again after updating Koala to refresh it.\n`)
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
    const upstream = name === "init" ? { ...initUnit(m, recordedCssTarget(manifest)), init: true } : byName.get(name)
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
      recordInstall(manifest, item.name, item.hash || null, fetched[i], w)
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
  const key = (opts._[0] || opts.license || process.env.KOALAUI_LICENSE || "").trim()
  if (!key) fail(`usage: ${c.cyan("koalaui login <license-key>")}`)
  // Every login claims a seat. On CI that would spend one per run, so it has to be deliberate:
  // activate once with --no-save and reuse the instance id from the environment.
  if (isCi() && opts.save && !opts.yes) {
    fail(
      `refusing to activate a seat on CI: each run would claim a new one.\n` +
        `  Activate once from your machine:  ${c.cyan("koalaui login <key> --name ci --no-save")}\n` +
        `  then set KOALAUI_LICENSE and KOALAUI_INSTANCE in the CI secrets.`
    )
  }
  const api = resolveApi(opts)
  const name = (opts.name || hostname()).slice(0, 64)

  let res
  try {
    res = await request(`${api}/cli-activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, instanceName: name }),
    })
  } catch {
    fail(`could not reach ${api}. Check your connection and try again.`)
  }
  const body = (await readBody(res)) || {}

  if (!res.ok) {
    fail(
      `that license could not be activated.\n` +
        `  ${describeHttpError(res.status, body, res.headers.get("retry-after"), "the activation")}.\n` +
        (res.status === 403 ? `  Manage your license → ${ACCOUNT_URL} · buy one → ${body.purchase || PURCHASE_URL}` : "")
    )
  }

  if (!opts.save) {
    ok(`seat activated as ${c.bold(name)} ${c.dim("(not saved on this machine)")}`)
    log(`\n  KOALAUI_LICENSE=${key}\n  KOALAUI_INSTANCE=${body.instanceId}\n`)
    info("store both as CI secrets; release the seat later with koalaui logout --license <key> --instance <id>")
    return
  }

  writeConfig({ ...loadConfig(), license: key, instanceId: body.instanceId })
  ok(`license activated on ${c.bold(name)}`)
  if (body.seats > 1) info(`${body.plan} plan - seat ${body.used} of ${body.seats}`)
  info(`now add a Pro section, e.g. ${c.cyan("koalaui add hero-section-3")}`)
}

/**
 * Release this machine's seat, then forget the key.
 *
 * The local key is removed even if the release fails: a logout that leaves the credential on disk
 * because a network call went wrong is the worse of the two outcomes.
 */
async function cmdLogout(opts) {
  const cfg = loadConfig()
  const license = resolveLicense(opts, cfg)
  const instanceId = resolveInstance(opts, cfg, license)

  if (license && instanceId) {
    try {
      const res = await request(`${resolveApi(opts)}/cli-deactivate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: license, instanceId }),
      })
      if (res.ok) ok("seat released")
      else
        warn(
          `could not release the seat (${describeHttpError(res.status, await readBody(res), null, "the release")}).\n` +
            `  Write to support with this activation id to free it: ${instanceId}`
        )
    } catch {
      warn(`could not reach the license service - the seat may still be held (activation ${instanceId})`)
    }
  }

  // The saved key goes whatever happened above: leaving a credential on disk because a network
  // call failed is the worse outcome.
  if (cfg.license && (!opts.license || cfg.license === opts.license)) {
    const rest = { ...cfg }
    delete rest.license
    delete rest.instanceId
    writeConfig(rest)
    ok("license removed from this machine")
  }
}
function cmdWhoami(opts) {
  const cfg = loadConfig()
  const key = resolveLicense(opts, cfg)
  if (!key) {
    info(`no license configured. Activate one: ${c.cyan("koalaui login <key>")}`)
    return
  }
  const instance = resolveInstance(opts, cfg, key)
  if (opts.ci) {
    // For copying into CI secrets: the only place the CLI prints a key in full, and only on request.
    log(`KOALAUI_LICENSE=${key}`)
    if (instance) log(`KOALAUI_INSTANCE=${instance}`)
    return
  }
  log(`license: ${c.bold(maskSecret(key))}`)
  log(`machine: ${instance ? c.dim(`activated (${maskSecret(instance)})`) : c.yellow("not activated - run koalaui login <key>")}`)
  log(`api:     ${c.dim(resolveApi(opts))}`)
  log(`account: ${c.dim(ACCOUNT_URL)}`)
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
  koalaui template <name> [dir]  start a new site from a PRO template, in an empty folder
  koalaui skill                write the Koala UI agent skill into .claude/skills/koala-ui
  koalaui login <key>          activate your PRO license on this machine
  koalaui logout               release this machine's seat and forget the key
  koalaui whoami               show the active license

${c.bold("Tiers")}
  free    components, lib, tokens, one sample section per family - no auth
  PRO 🔒  every other section, page examples, templates - need a license:
          buy at ${PURCHASE_URL}, then ${c.cyan("koalaui login <key>")} once per machine
          (owner/dev: a GitHub token to the private repo also works)

${c.bold("CI")}
  koalaui login <key> --name ci --no-save   activate one seat for CI, print its ids
  then set KOALAUI_LICENSE and KOALAUI_INSTANCE as secrets

${c.bold("Options")}
  --cwd <dir>        target project root (default: cwd)
  --license <key>    PRO license key (overrides saved / $KOALAUI_LICENSE)
  --instance <id>    activation id to use (overrides $KOALAUI_INSTANCE / saved)
  --name <label>     login: the seat's label (default: this machine's hostname)
  --no-save          login: activate without saving; prints the ids for CI
  --ci               whoami: print the env lines for CI secrets
  --api <url>        entitlement API base (overrides $KOALAUI_API; never saved)
  --dir <path>       skill: where to write it (default: .claude/skills/koala-ui)
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
    if (cmd === "template") return await cmdTemplate(reg, opts)
    if (cmd === "skill") return await cmdSkill(reg, opts)
    fail(`unknown command: ${cmd}\n  Run ${c.cyan("koalaui --help")}.`)
  } catch (err) {
    log(`${c.red("✗")} ${err && err.message ? err.message : String(err)}`)
    process.exitCode = 1
  }
}

main()
