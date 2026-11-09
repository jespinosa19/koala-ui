export const FLICK_VELOCITY = 0.5

const SAMPLE_WINDOW = 100

export function rubberband(distance: number, dimension: number, constant = 0.55) {
  if (dimension <= 0) return 0
  const sign = distance < 0 ? -1 : 1
  const d = Math.abs(distance)
  return sign * (1 - 1 / ((d * constant) / dimension + 1)) * dimension
}

export function project(velocity: number, deceleration = 0.998) {
  return (velocity * deceleration) / (1 - deceleration)
}

export type VelocityTracker = {
  reset: (position: number, time: number) => void
  add: (position: number, time: number) => void
  velocity: () => number
}

export function createVelocityTracker(): VelocityTracker {
  let samples: { position: number; time: number }[] = []

  return {
    reset(position, time) {
      samples = [{ position, time }]
    },
    add(position, time) {
      samples.push({ position, time })
      const cutoff = time - SAMPLE_WINDOW
      while (samples.length > 2 && samples[0].time < cutoff) samples.shift()
    },
    velocity() {
      if (samples.length < 2) return 0
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = last.time - first.time
      return dt > 0 ? (last.position - first.position) / dt : 0
    },
  }
}
