#!/usr/bin/env node
// @ts-check
/**
 * koalaui - the Koala UI CLI (two-tier).
 *
 *   koalaui init                 set up tokens, core lib helpers and base deps
 *   koalaui add <item...>        copy components/sections (and their deps) into your project
 *   koalaui list                 list available items (free + pro)
 *
 * Tiers:
 *   FREE  components/ui + lib + tokens - fetched from the PUBLIC repo, no auth.
 *   PRO   sections / pages / templates - fetched from the PRIVATE repo; requires a
 *         GitHub token with read access (the paywall). PRO items can depend on FREE
 *         ones; those still come from the public repo automatically.
 *
 * PRO auth - a GitHub token with read access to the pro repo, resolved in order:
 *   1. $KOALAUI_TOKEN   2. $GH_TOKEN   3. $GITHUB_TOKEN   4. `gh auth token`
 *
 * Flags:
 *   --cwd <dir>        target project root (default: current directory)
 *   --registry <dir>   read FREE files from a local checkout instead of the repo (dev)
 *   --pro <dir>        read PRO files from a local checkout (dev; default ../koala-ui-pro)
 *   --branch <b>       branch (default: main)
 *   --token <t>        GitHub token (overrides env / gh)
 *   --overwrite        overwrite files that already exist
 *   --no-install       write files but don't run the package manager
 *   -h, --help         show this help
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, dirname, isAbsolute } from "node:path"
import { homedir } from "node:os"
import { execSync } from "node:child_process"

const DEFAULT_PUBLIC_REPO = "jespinosa19/koala-ui"
const DEFAULT_BRANCH = "main"
// The public site. Every buyer-facing URL hangs off this one constant so moving to a custom
// domain later is a one-line change.
const SITE = "https://koala-ui.vercel.app"
// The entitlement API. Points at our own site, which proxies to the Supabase Edge Function:
// this URL ships inside every published copy of the CLI, so it has to be one we control and can
// repoint without republishing. Override with $KOALAUI_API or --api.
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
      async fetch(item, path) {
        return read(item.tier === "pro" ? proBase : freeBase, path)
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
  // BUYER path: trade the license key for the gated file at the entitlement API. The server
  // validates the key and proxies the source from the private repo; the buyer never gets a token.
  async function proViaLicense(item, path) {
    const res = await fetch(`${api}/cli-entitlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: license, repo: item.repo, path }),
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
    if (!res.ok) throw new Error(`${res.status} fetching ${path} via entitlement API`)
    return (await res.json()).content
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
    async fetch(item, path) {
      if (item.tier !== "pro") return rawPublic(item.repo, path)
      // A buyer's license is the default gate. A repo token (owner/dev) is the fallback.
      if (license) return proViaLicense(item, path)
      if (resolveToken(opts.token)) return apiPrivate(item.repo, path, item.name)
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
  const resolve = (target) => (useSrc ? join(root, "src", target) : join(root, target))
  function write(target, content) {
    const abs = resolve(target)
    if (existsSync(abs) && !overwrite) {
      skipped.push(target)
      return
    }
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content)
    written.push(target)
  }
  return { write, written, skipped, useSrc }
}

// ── package manager detection + install ──────────────────────────────────────
function detectPM(root) {
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun"
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(root, "yarn.lock"))) return "yarn"
  return "npm"
}
function installDeps(root, deps) {
  const names = Object.entries(deps).map(([n, v]) => (v && v !== "latest" ? `${n}@${v}` : n))
  if (!names.length) return
  const pm = detectPM(root)
  const verb = pm === "npm" ? "install" : "add"
  info(`${pm} ${verb} ${names.join(" ")}`)
  const quoted = names.map((n) => `"${n}"`).join(" ")
  execSync(`${pm} ${verb} ${quoted}`, { cwd: root, stdio: "inherit" })
}

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
  const spec = m.init
  const w = makeWriter(root, opts.overwrite)

  const globals = await reg.freeFile(spec.cssFrom)
  w.write(spec.cssTarget, globals.replace(/^@import\s+["']tailwindcss["'];\s*\n/m, ""))
  for (const path of spec.lib) w.write(path, await reg.freeFile(path))

  for (const t of w.written) ok(`wrote ${c.dim(t)}`)
  for (const t of w.skipped) warn(`exists, skipped ${c.dim(t)} ${c.dim("(use --overwrite)")}`)

  if (opts.install) installDeps(root, spec.dependencies)
  else info(`skipped install - deps: ${Object.keys(spec.dependencies).join(" ")}`)

  log()
  ok("init complete")
  log(`\n${c.bold("Next steps:")}`)
  log(`  1. In your global stylesheet, after ${c.cyan('@import "tailwindcss";')}, add:`)
  log(`     ${c.cyan(`@import "./koala.css";`)} ${c.dim("(adjust the path to where koala.css landed)")}`)
  log(`  2. Make sure your tsconfig has the ${c.cyan('"@/*"')} path alias.`)
  log(`  3. Add components: ${c.cyan("koalaui add button card")}\n`)
}

async function cmdAdd(reg, opts) {
  const root = opts.cwd
  const names = opts._
  if (!names.length) fail("nothing to add. Usage: koalaui add <item...>")

  const m = await reg.meta()
  const byName = new Map(m.items.map((i) => [i.name, i]))

  const resolved = new Map()
  const missing = []
  function resolve(name) {
    if (resolved.has(name)) return
    const item = byName.get(name)
    if (!item) {
      missing.push(name)
      return
    }
    resolved.set(name, item)
    for (const dep of item.registryDependencies || []) resolve(dep)
    for (const dep of item.libDependencies || []) resolve(dep)
  }
  for (const n of names) resolve(n)
  if (missing.length)
    fail(`unknown item(s): ${missing.join(", ")}\n  Run ${c.cyan("koalaui list")} to see what's available.`)

  const involvesPro = [...resolved.values()].some((i) => i.tier === "pro")
  log(c.bold(`\nKoala UI - adding ${names.join(", ")} ${c.dim(`(${reg.label})`)}\n`))
  if (involvesPro) info(`includes ${c.bold("PRO")} content 🔒`)
  const extra = [...resolved.keys()].filter((n) => !names.includes(n))
  if (extra.length) info(`pulling dependencies: ${c.dim(extra.join(", "))}`)

  // fetch every file (each from its own tier's source) in parallel
  const w = makeWriter(root, opts.overwrite)
  const deps = {}
  const jobs = []
  for (const item of resolved.values()) {
    Object.assign(deps, item.dependencies || {})
    for (const p of item.files) jobs.push({ item, path: p })
  }
  const contents = await Promise.all(jobs.map((j) => reg.fetch(j.item, j.path)))
  jobs.forEach((j, i) => w.write(j.path, contents[i]))

  for (const t of w.written) ok(`wrote ${c.dim(t)}`)
  for (const t of w.skipped) warn(`exists, skipped ${c.dim(t)} ${c.dim("(use --overwrite)")}`)

  if (opts.install) installDeps(root, deps)
  else if (Object.keys(deps).length) info(`skipped install - deps: ${Object.keys(deps).join(" ")}`)

  log()
  ok(`added ${names.join(", ")}`)
  if (w.useSrc) info("detected a src/ layout - files were written under src/")
  log()
}

// ── license commands ──────────────────────────────────────────────────────────
function cmdLogin(opts) {
  const key = opts._[0]
  if (!key) fail(`usage: ${c.cyan("koalaui login <license-key>")}`)
  const patch = { license: key }
  if (opts.api) patch.api = opts.api
  saveConfig(patch)
  ok(`license saved to ${c.dim(CONFIG_PATH)}`)
  info(`now add a gated section, e.g. ${c.cyan("koalaui add hero-section")}`)
}
function cmdLogout() {
  const cfg = loadConfig()
  delete cfg.license
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
  log(`api:     ${c.dim(resolveApi(opts))}`)
}

function help() {
  log(`
${c.bold("koalaui")} - add Koala UI components & sections to your project

${c.bold("Usage")}
  koalaui init                 set up tokens, core lib helpers and base deps
  koalaui add <item...>        copy items (and their deps) into your project
  koalaui list                 list available items (free + pro)
  koalaui login <key>          save your PRO license key
  koalaui logout               remove the saved license
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
    if (cmd === "login") return cmdLogin(opts)
    if (cmd === "logout") return cmdLogout()
    if (cmd === "whoami") return cmdWhoami(opts)
    const reg = makeRegistry(opts)
    if (cmd === "list") return await cmdList(reg)
    if (cmd === "init") return await cmdInit(reg, opts)
    if (cmd === "add") return await cmdAdd(reg, opts)
    fail(`unknown command: ${cmd}\n  Run ${c.cyan("koalaui --help")}.`)
  } catch (err) {
    log(`${c.red("✗")} ${err && err.message ? err.message : String(err)}`)
    process.exitCode = 1
  }
}

main()
