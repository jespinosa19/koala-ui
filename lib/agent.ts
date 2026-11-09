import * as React from "react"

export const agentStatuses = ["working", "waiting", "idle", "done", "failed", "cancelled"] as const

export type AgentStatus = (typeof agentStatuses)[number]

export interface AgentStatusMeta {
  tone: "success" | "warning" | "neutral" | "destructive"
  pulse: "ping" | "blink" | "none"
  badge: "default" | "warning" | "destructive"
  loud: boolean
  settled: boolean
}

export const agentStatusMeta: Record<AgentStatus, AgentStatusMeta> = {
  working: { tone: "success", pulse: "ping", badge: "default", loud: false, settled: false },
  waiting: { tone: "warning", pulse: "blink", badge: "warning", loud: true, settled: false },
  idle: { tone: "neutral", pulse: "none", badge: "default", loud: false, settled: false },
  done: { tone: "neutral", pulse: "none", badge: "default", loud: false, settled: true },
  failed: { tone: "destructive", pulse: "none", badge: "destructive", loud: true, settled: true },
  cancelled: { tone: "neutral", pulse: "none", badge: "default", loud: false, settled: true },
}

export const agentStatusOrder: readonly AgentStatus[] = ["waiting", "working", "failed", "idle", "cancelled", "done"]

export function isAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === "string" && value in agentStatusMeta
}

export function emptyAgentStatusCounts(): Record<AgentStatus, number> {
  return { working: 0, waiting: 0, idle: 0, done: 0, failed: 0, cancelled: 0 }
}

export function formatAgentElapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`
}

export function formatAgentSpan(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours} h`
  return `${Math.round(hours / 24)} d`
}

type ClockStore = {
  now: number | null
  timer: ReturnType<typeof setInterval> | undefined
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  read: () => number
}

const clocks = new Map<number, ClockStore>()

function clockFor(interval: number) {
  const existing = clocks.get(interval)
  if (existing) return existing
  const store: ClockStore = {
    now: null,
    timer: undefined,
    listeners: new Set(),
    subscribe(listener) {
      store.listeners.add(listener)
      if (store.timer === undefined) {
        store.now = Date.now()
        store.timer = setInterval(() => {
          store.now = Date.now()
          store.listeners.forEach((notify) => notify())
        }, interval)
      }
      return () => {
        store.listeners.delete(listener)
        if (store.listeners.size === 0) {
          clearInterval(store.timer)
          store.timer = undefined
        }
      }
    },
    read() {
      store.now ??= Date.now()
      return store.now
    },
  }
  clocks.set(interval, store)
  return store
}

const still = () => () => {}
const nothing = () => null

export function useAgentClock({ interval = 1000, enabled = true }: { interval?: number; enabled?: boolean } = {}) {
  const clock = clockFor(interval)
  return React.useSyncExternalStore<number | null>(
    enabled ? clock.subscribe : still,
    enabled ? clock.read : nothing,
    nothing,
  )
}
