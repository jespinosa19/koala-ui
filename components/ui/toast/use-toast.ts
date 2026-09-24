"use client"

import * as React from "react"

import { duration as motionDuration } from "@/lib/motion"

export type ToastVariant = "default" | "success" | "warning" | "destructive" | "info" | "loading"

/** How long a toast stays up, in ms, unless it says otherwise. `loading` persists instead. */
export const TOAST_DURATION = 5000

/** How long an anchored toast stays up: long enough to read one word next to what you clicked. */
export const ANCHORED_TOAST_DURATION = 1500

export interface ToastOptions {
  /**
   * A stable id. Raising a toast whose id is still on screen (or still leaving) updates that toast in
   * place instead of stacking a copy: its content is replaced, it moves to the front, its timer
   * restarts, and it replays a pop (confirmations) or a shake (errors and warnings) so the repeat
   * still registers. Omit it and every call is a new toast.
   */
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  /**
   * Auto-dismiss delay in ms. Default 5000 (1500 when anchored); `loading` defaults to Infinity.
   * Pass Infinity to persist.
   */
  duration?: number
  action?: { label: string; onClick: () => void }
  /**
   * Pin the toast next to this element instead of the corner stack: "Copied" beside a copy button.
   * An anchored toast is a small bubble (icon and title, no close button, no action) placed above
   * the element, or below it near the top of the screen. It closes on scroll or resize, since it
   * would otherwise float away from what it describes. The element's position is read once, when
   * the toast is raised.
   */
  anchor?: HTMLElement | null
}

/** Where an anchored toast's element was on screen when the toast was raised (viewport px). */
export interface ToastAnchorRect {
  top: number
  bottom: number
  left: number
  width: number
}

export interface ToastData extends Omit<ToastOptions, "id" | "duration" | "anchor"> {
  id: string
  /** Resolved auto-dismiss delay: the option, or the variant's default. */
  duration: number
  /** Present when the toast is anchored to an element rather than stacked in the corner. */
  anchorRect?: ToastAnchorRect
  /** Internal: false plays the exit before the toast is removed. */
  open: boolean
  /** Internal: how many times this id has been raised again. Drives the replay animation. */
  replay: number
  /** Internal: bumped when a timed toast goes back to persisting (see `addToast`). */
  epoch: number
  /** Internal: this toast has shown the loading state, so its icon cross-fades out of a spinner. */
  wasLoading: boolean
}

type Listener = () => void
const listeners = new Set<Listener>()
let _state: ToastData[] = []
const EMPTY: ToastData[] = []
// Pending removals by id, so a toast raised again while it is still leaving can be kept.
const removals = new Map<string, ReturnType<typeof setTimeout>>()
// Auto-dismiss for anchored toasts. Stacked toasts are timed by Radix; anchored ones live outside
// its viewport, so the store keeps their clock.
const anchoredTimers = new Map<string, ReturnType<typeof setTimeout>>()

function emit() {
  listeners.forEach((fn) => fn())
}

function clearTimer(timers: Map<string, ReturnType<typeof setTimeout>>, id: string) {
  const timer = timers.get(id)
  if (timer === undefined) return
  clearTimeout(timer)
  timers.delete(id)
}

function rectOf(el: HTMLElement): ToastAnchorRect {
  const { top, bottom, left, width } = el.getBoundingClientRect()
  return { top, bottom, left, width }
}

export function addToast({ id: requested, anchor, ...content }: ToastOptions): string {
  const existing = requested === undefined ? undefined : _state.find((t) => t.id === requested)
  // Read the anchor here, in the imperative call, never during render.
  const anchorRect = anchor ? rectOf(anchor) : existing?.anchorRect
  const resolved =
    content.duration ??
    (content.variant === "loading" ? Infinity : anchorRect ? ANCHORED_TOAST_DURATION : TOAST_DURATION)

  let next: ToastData
  if (!existing) {
    next = {
      ...content,
      id: requested ?? crypto.randomUUID(),
      duration: resolved,
      anchorRect,
      open: true,
      replay: 0,
      epoch: 0,
      wasLoading: content.variant === "loading",
    }
  } else {
    clearTimer(removals, existing.id)
    next = {
      // Replace the content wholesale rather than merge: an update says what the toast reads now, so
      // a loading line's description never lingers under the result.
      ...content,
      id: existing.id,
      duration: resolved,
      anchorRect,
      open: true,
      replay: existing.replay + 1,
      // Radix restarts its close timer whenever `duration` changes, but a switch TO Infinity only skips
      // starting a new timer and leaves the old one running, so a timed toast raised again as loading
      // would still close on the old schedule. A new epoch remounts it and the stale timer goes too.
      epoch: existing.duration !== Infinity && resolved === Infinity ? existing.epoch + 1 : existing.epoch,
      wasLoading: existing.wasLoading || content.variant === "loading",
    }
  }

  _state = [next, ..._state.filter((t) => t.id !== next.id)]
  clearTimer(anchoredTimers, next.id)
  if (next.anchorRect && Number.isFinite(resolved)) {
    const id = next.id
    anchoredTimers.set(
      id,
      setTimeout(() => {
        anchoredTimers.delete(id)
        startDismiss(id)
      }, resolved),
    )
  }
  emit()
  return next.id
}

/** Plays the exit (open → false), then removes the toast once it has left. */
export function startDismiss(id: string): void {
  // Avoid double-dismissing a toast that is already closing.
  if (!_state.some((t) => t.id === id && t.open)) return
  clearTimer(anchoredTimers, id)
  _state = _state.map((t) => (t.id === id ? { ...t, open: false } : t))
  emit()
  removals.set(
    id,
    setTimeout(() => {
      removals.delete(id)
      _state = _state.filter((t) => t.id !== id)
      emit()
    }, motionDuration.base),
  )
}

/** Close one toast by id, or every open toast. */
export function dismissToast(id?: string): void {
  if (id !== undefined) return startDismiss(id)
  for (const t of _state) if (t.open) startDismiss(t.id)
}

/** Close every open anchored toast. The Toaster calls this on scroll and resize. */
export function dismissAnchoredToasts(): void {
  for (const t of _state) if (t.open && t.anchorRect) startDismiss(t.id)
}

export function useToastStore(): ToastData[] {
  return React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => _state,
    () => EMPTY,
  )
}

// ─── API ──────────────────────────────────────────────────────────────────────

type ShortcutOptions = Omit<ToastOptions, "title" | "variant">

const shortcut = (variant: ToastVariant) => (title: React.ReactNode, opts?: ShortcutOptions) =>
  addToast({ ...opts, title, variant })

/** What a settled promise says: a title, full options, or a function of the value that returns either. */
export type ToastPromiseResult<T> = React.ReactNode | ToastOptions | ((value: T) => React.ReactNode | ToastOptions)

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode
  success: ToastPromiseResult<T>
  error: ToastPromiseResult<unknown>
}

function isOptions(value: unknown): value is ToastOptions {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !React.isValidElement(value)
}

/**
 * One toast that follows a promise: it shows `loading` with a spinner, then turns into `success` or
 * `error` in place (same id, so it never stacks a second card). Returns the promise itself, so
 * `await toast.promise(save(), …)` still hands back the value, or throws.
 */
function promiseToast<T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: ToastPromiseMessages<T>,
  opts?: ShortcutOptions,
): Promise<T> {
  const id = addToast({ ...opts, title: messages.loading, variant: "loading", duration: Infinity })
  const settle = <V>(message: ToastPromiseResult<V>, value: V, variant: ToastVariant) => {
    const result = typeof message === "function" ? message(value) : message
    const content: ToastOptions = isOptions(result) ? result : { title: result }
    // The anchor was read when the loading toast was raised; with no anchor passed the result keeps
    // that position instead of measuring an element that may have moved (or unmounted) since.
    addToast({ ...opts, anchor: undefined, variant, ...content, id, duration: content.duration ?? opts?.duration })
  }
  const pending = typeof promise === "function" ? promise() : promise
  pending.then(
    (value) => settle(messages.success, value, "success"),
    (error: unknown) => settle(messages.error, error, "destructive"),
  )
  return pending
}

function show(input: string | ToastOptions, opts?: Omit<ToastOptions, "title">): string {
  return addToast(typeof input === "string" ? { ...opts, title: input } : input)
}

/** Imperative API, for use anywhere: event handlers, Server Action results, code outside React. */
export const toast = Object.assign(show, {
  success: shortcut("success"),
  warning: shortcut("warning"),
  error: shortcut("destructive"),
  info: shortcut("info"),
  /** Persists with a spinner until you raise the same id again (or use `toast.promise`). */
  loading: shortcut("loading"),
  promise: promiseToast,
  dismiss: dismissToast,
})

export function useToast() {
  return { toast, dismiss: dismissToast }
}

// ─── Test hooks (not exported from the package index) ───────────────────────────

/** Test-only: the current queue. */
export function __getToasts(): readonly ToastData[] {
  return _state
}

/** Test-only: empty the queue and cancel every pending timer between tests. */
export function __resetToasts(): void {
  for (const timers of [removals, anchoredTimers]) {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
  }
  _state = []
  emit()
}
