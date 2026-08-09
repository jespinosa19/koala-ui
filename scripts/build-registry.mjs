// @ts-check
/**
 * build-registry.mjs - generates `registry.json`, the catalog the `koalaui` CLI reads.
 *
 * Two tiers:
 *   - FREE  → components/ui/* + lib/*  (this PUBLIC repo). Installable WITHOUT a token.
 *   - PRO   → sections / pages / templates (the PRIVATE koala-ui-pro repo). Token-gated.
 *
 * The manifest is METADATA ONLY (no source contents) and lists BOTH tiers, tagging each
 * item with its `tier` and source `repo`. The CLI fetches free files from the public repo
 * over raw (no auth) and pro files from the private repo over the API (with the caller's
 * token). Source lives in exactly one place per item - never duplicated.
 *
 * PRO source is read from a local checkout of koala-ui-pro (../koala-ui-pro by default,
 * override with $KOALA_PRO_DIR). If it isn't present, only the free tier is emitted.
 *
 * Run with: npm run registry
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs"
import { join, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const PRO_DIR = process.env.KOALA_PRO_DIR || join(ROOT, "..", "koala-ui-pro")
const OUT = join(ROOT, "registry.json")

const PUBLIC_REPO = "jespinosa19/koala-ui"
const PRO_REPO = "jespinosa19/koala-ui-pro"
const BRANCH = "main"

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"))
const ALL_DEPS = { ...pkg.dependencies, ...pkg.devDependencies }

const IGNORE_PKGS = new Set(["react", "react-dom", "next"])
const EXTRA_DEPS = { "rich-text-editor": ["@tiptap/pm"] }
const TITLES = { "otp-input": "OTP Input", kbd: "Kbd", "rich-text-editor": "Rich Text Editor", "ai-panel": "AI Panel" }

// ── helpers ──────────────────────────────────────────────────────────────────
function pkgName(spec) {
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/")
    return `${scope}/${name}`
  }
  return spec.split("/")[0]
}
function titleFor(slug) {
  if (TITLES[slug]) return TITLES[slug]
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}
function parseImports(content) {
  const specs = new Set()
  const re = /(?:from|import)\s+["']([^"']+)["']/g
  let m
  while ((m = re.exec(content))) specs.add(m[1])
  return [...specs]
}
function listFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    if (statSync(abs).isDirectory()) out.push(...listFiles(abs))
    else out.push(abs)
  }
  return out
}
const rel = (abs, base) => relative(base, abs).split("\\").join("/")

/** Classify imports across a file set into npm / component / lib deps (self-excluded). */
function analyze(files, self) {
  const npm = new Set()
  const components = new Set()
  const libs = new Set()
  for (const abs of files) {
    const content = readFileSync(abs, "utf8")
    for (const spec of parseImports(content)) {
      if (spec.startsWith(".")) continue
      if (spec.startsWith("@/lib/")) libs.add(spec.slice("@/lib/".length).split("/")[0])
      else if (spec.startsWith("@/components/ui/")) {
        const name = spec.slice("@/components/ui/".length).split("/")[0]
        if (name !== self) components.add(name)
      } else if (spec.startsWith("@/")) {
        // other internal import - not part of the distributed surface
      } else {
        const name = pkgName(spec)
        if (!IGNORE_PKGS.has(name)) npm.add(name)
      }
    }
  }
  return { npm, components, libs }
}
function depMap(names, slug) {
  const all = new Set(names)
  for (const extra of EXTRA_DEPS[slug] || []) all.add(extra)
  const out = {}
  for (const name of [...all].sort()) out[name] = ALL_DEPS[name] || "latest"
  return out
}

// ── free tier (this repo) ──────────────────────────────────────────────────────
/** @type {any[]} */
const items = []

for (const entry of readdirSync(join(ROOT, "lib"))) {
  const abs = join(ROOT, "lib", entry)
  if (statSync(abs).isDirectory()) continue
  const name = entry.replace(/\.(tsx?|ts)$/, "")
  const { npm, libs } = analyze([abs], null)
  libs.delete(name)
  items.push({
    name,
    type: "lib",
    tier: "free",
    repo: PUBLIC_REPO,
    title: name,
    dependencies: depMap(npm, name),
    registryDependencies: [],
    libDependencies: [...libs].sort(),
    files: [rel(abs, ROOT)],
  })
}

for (const slug of readdirSync(join(ROOT, "components/ui"))) {
  const dir = join(ROOT, "components/ui", slug)
  if (!statSync(dir).isDirectory()) continue
  const files = listFiles(dir)
  const { npm, components, libs } = analyze(files, slug)
  items.push({
    name: slug,
    type: "component",
    tier: "free",
    repo: PUBLIC_REPO,
    title: titleFor(slug),
    dependencies: depMap(npm, slug),
    registryDependencies: [...components].sort(),
    libDependencies: [...libs].sort(),
    files: files.map((f) => rel(f, ROOT)).sort(),
  })
}

// ── pro tier (private koala-ui-pro checkout) ────────────────────────────────────
let proCount = 0
if (existsSync(PRO_DIR)) {
  // each subdir of these maps to a pro item type
  const proGroups = [
    ["components/sections", "section"],
    ["pages", "page"],
    ["templates", "template"],
  ]
  for (const [subdir, type] of proGroups) {
    const groupDir = join(PRO_DIR, subdir)
    if (!existsSync(groupDir)) continue
    for (const slug of readdirSync(groupDir)) {
      const dir = join(groupDir, slug)
      if (!statSync(dir).isDirectory()) continue
      const files = listFiles(dir)
      const { npm, components, libs } = analyze(files, slug)
      items.push({
        name: slug,
        type,
        tier: "pro",
        repo: PRO_REPO,
        title: titleFor(slug),
        dependencies: depMap(npm, slug),
        registryDependencies: [...components].sort(),
        libDependencies: [...libs].sort(),
        files: files.map((f) => rel(f, PRO_DIR)).sort(),
      })
      proCount++
    }
  }
} else {
  console.warn(`! koala-ui-pro not found at ${PRO_DIR} - emitting FREE tier only`)
}

items.sort((a, b) => a.name.localeCompare(b.name))

// ── init spec (free: tokens + core lib) ─────────────────────────────────────────
const init = {
  dependencies: depMap(["clsx", "tailwind-merge", "tailwind-variants", "tw-animate-css"], null),
  cssFrom: "app/globals.css",
  cssTarget: "app/koala.css",
  lib: ["lib/utils.ts", "lib/tv.ts"],
}

// ── write manifest ───────────────────────────────────────────────────────────
const manifest = {
  name: "koala-ui",
  version: pkg.version || "0.1.0",
  publicRepo: PUBLIC_REPO,
  proRepo: PRO_REPO,
  branch: BRANCH,
  init,
  items,
}
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n")

const free = items.filter((i) => i.tier === "free").length
console.log(`registry.json: ${free} free items + ${proCount} pro items`)
