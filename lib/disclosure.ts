import { cubicBezier, easingPoints } from "@/lib/motion"

const OPPOSITE: Record<string, string> = {
  "disclosure-open": "disclosure-close",
  "disclosure-close": "disclosure-open",
}

const progress = cubicBezier(easingPoints.out)

/** Where the opposite tween must start so a panel reverses from the height it has reached. */
export function resumeTime(elapsed: number, length: number) {
  const target = 1 - progress(elapsed / length)
  let low = 0
  let high = 1
  for (let i = 0; i < 24; i++) {
    const middle = (low + high) / 2
    if (progress(middle) < target) low = middle
    else high = middle
  }
  return ((low + high) / 2) * length
}

function resume(event: AnimationEvent) {
  const opposite = OPPOSITE[event.animationName]
  if (!opposite || !(event.target instanceof Element)) return
  const next = event.target
    .getAnimations()
    .find((item) => item instanceof CSSAnimation && item.animationName === opposite)
  const length = next?.effect?.getComputedTiming().duration
  if (next && typeof length === "number" && length > 0) {
    next.currentTime = resumeTime(event.elapsedTime * 1000, length)
  }
}

if (typeof document !== "undefined") document.addEventListener("animationcancel", resume, true)
