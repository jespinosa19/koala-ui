const SELECTOR = ".scroll-fade,.scroll-fade-x,.scroll-fade-t,.scroll-fade-b,.scroll-fade-l,.scroll-fade-r"

type Edge = "t" | "b" | "l" | "r"

const EDGES: ReadonlyArray<readonly [string, readonly Edge[]]> = [
  ["scroll-fade", ["t", "b"]],
  ["scroll-fade-x", ["l", "r"]],
  ["scroll-fade-t", ["t"]],
  ["scroll-fade-b", ["b"]],
  ["scroll-fade-l", ["l"]],
  ["scroll-fade-r", ["r"]],
]

function revealDistance(el: HTMLElement) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const value = getComputedStyle(el).getPropertyValue("--scroll-fade-reveal").trim()
  const n = parseFloat(value)
  if (value.endsWith("rem") && n > 0) return n * rem
  if (value.endsWith("px") && n > 0) return n
  return 6 * rem
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export function scrollFadeDepths(el: HTMLElement): Record<Edge, number> {
  const reveal = revealDistance(el)
  const maxY = el.scrollHeight - el.clientHeight
  const maxX = el.scrollWidth - el.clientWidth
  const x = Math.abs(el.scrollLeft)
  return {
    t: maxY > 1 ? clamp01(el.scrollTop / reveal) : 0,
    b: maxY > 1 ? clamp01((maxY - el.scrollTop) / reveal) : 0,
    l: maxX > 1 ? clamp01(x / reveal) : 0,
    r: maxX > 1 ? clamp01((maxX - x) / reveal) : 0,
  }
}

const written = new WeakMap<HTMLElement, string>()

function apply(el: HTMLElement) {
  if (!el.isConnected) return
  const edges = new Set<Edge>()
  for (const [cls, list] of EDGES) if (el.classList.contains(cls)) list.forEach((e) => edges.add(e))
  if (!edges.size) return
  const depths = scrollFadeDepths(el)
  const signature = [...edges].map((e) => `${e}${depths[e].toFixed(3)}`).join()
  if (written.get(el) === signature) return
  written.set(el, signature)
  for (const e of edges) el.style.setProperty(`--scroll-fade-${e}`, depths[e].toFixed(3))
}

let installed = false

export function installScrollFadeFallback() {
  if (installed || typeof window === "undefined" || typeof document === "undefined") return
  installed = true
  if (typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()")) return

  const tracked = new Set<HTMLElement>()
  let queue = new Set<HTMLElement>()
  let frame = 0

  const schedule = (el: HTMLElement) => {
    queue.add(el)
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const batch = queue
      queue = new Set()
      batch.forEach(apply)
    })
  }

  const resize = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver((entries) => entries.forEach((e) => schedule(e.target as HTMLElement)))
    : null

  const track = (el: HTMLElement) => {
    if (!tracked.has(el)) {
      tracked.add(el)
      resize?.observe(el)
    }
    schedule(el)
  }
  const untrack = (el: HTMLElement) => {
    if (!tracked.delete(el)) return
    resize?.unobserve(el)
  }
  const walk = (node: Node, fn: (el: HTMLElement) => void) => {
    if (!(node instanceof HTMLElement)) return
    if (node.matches(SELECTOR)) fn(node)
    node.querySelectorAll<HTMLElement>(SELECTOR).forEach(fn)
  }

  const start = () => {
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(track)

    document.addEventListener(
      "scroll",
      (event) => {
        const el = event.target
        if (el instanceof HTMLElement && tracked.has(el)) schedule(el)
      },
      { capture: true, passive: true },
    )

    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes") {
          const el = r.target as HTMLElement
          if (el.matches(SELECTOR)) track(el)
          else untrack(el)
          continue
        }
        r.removedNodes.forEach((n) => walk(n, untrack))
        r.addedNodes.forEach((n) => walk(n, track))
        const host = (r.target as Element).closest?.(SELECTOR)
        if (host instanceof HTMLElement && tracked.has(host)) schedule(host)
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] })
  }

  if (document.body) start()
  else document.addEventListener("DOMContentLoaded", start, { once: true })
}

installScrollFadeFallback()
