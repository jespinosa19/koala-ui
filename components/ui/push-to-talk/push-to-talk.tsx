"use client"

import * as React from "react"
import { Microphone, Waveform } from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { hitCoarse } from "@/lib/hit-area"

/**
 * PushToTalk: a hold-to-talk control, the radio's transmit key. It is live exactly while it is held
 * (mouse, finger, Space or Enter on the focused button, or an optional global `shortcut` key) and
 * reports the hold through callbacks: `onTalkStart`, then `onTalkEnd(ms)` on release. A press shorter
 * than `minDuration` is a slip, not a message: it fires `onTalkCancel(ms)` instead and the control
 * shakes, the house rejection.
 *
 * Live is unmistakable on purpose: the fill turns destructive, the microphone cross-fades into a
 * waveform, and two staggered halos leave the edge (the "on air" signal everyone already reads). The
 * pill shape also says it in words, with a running timer.
 *
 * The pointer is captured on press, so releasing anywhere ends the hold; losing the window or the
 * tab ends it too, so a hold can never get stuck open. No press scale: being held *is* the state.
 */

// The icon swap both glyphs ride: a transition on the three properties the polish rules name, so a
// tap that ends mid-swap reverses instead of restarting.
const glyph =
  "col-start-1 row-start-1 flex items-center justify-center transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none"

export const pushToTalkVariants = tv({
  slots: {
    root: [
      // `group/ptt` lets the icon cell read the live state off the control.
      "group/ptt relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium",
      // A long press is the whole gesture: no scrolling, no text selection, no iOS callout.
      "touch-none select-none [-webkit-touch-callout:none]",
      // Specific transition (never `transition: all`): the paint, nothing that moves.
      "transition-[color,background-color] duration-fast ease-out",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      // Live: the destructive fill, over whichever idle paint the variant set. The dark themes lift
      // destructive to a lighter red that white only clears at 2.9:1, so there the ink is the page's
      // near-black (7:1); the light themes keep white (4.8:1).
      "data-[state=live]:bg-destructive data-[state=live]:text-white dark:data-[state=live]:text-background",
      // The rejection shake travels a little less than a field's: the control is small.
      "[--shake-distance:3px]",
    ],
    // The halos are box-shadow spreads, so they grow the same few pixels around a 40px circle and a
    // full-width pill. Under reduced motion they settle into one still ring.
    halo: [
      "pointer-events-none absolute inset-0 rounded-[inherit] animate-talk-halo",
      "motion-reduce:animate-none motion-reduce:ring-4 motion-reduce:ring-destructive/25",
    ],
    echo: "pointer-events-none absolute inset-0 rounded-[inherit] animate-talk-halo-echo motion-reduce:hidden",
    icon: "relative inline-grid shrink-0 place-items-center",
    // At rest: the microphone. Live: shrinks to a quarter, fades and blurs out.
    iconIdle: [
      glyph,
      "group-data-[state=live]/ptt:scale-25 group-data-[state=live]/ptt:opacity-0 group-data-[state=live]/ptt:blur-xs",
    ],
    // The mirror image: the waveform resolves into place as the control goes live.
    iconLive: [
      glyph,
      "scale-25 opacity-0 blur-xs",
      "group-data-[state=live]/ptt:scale-100 group-data-[state=live]/ptt:opacity-100 group-data-[state=live]/ptt:blur-none",
    ],
    label: "relative min-w-0 truncate",
    timer: "relative tabular-nums opacity-80",
  },
  variants: {
    // The idle paint. `neutral` is the ink solid, the default: a transmit key is not a brand moment.
    // Hover only lifts an idle control; a live one shouldn't shift under the finger.
    variant: {
      neutral: { root: "bg-foreground text-background data-[state=idle]:hover:bg-foreground/85" },
      primary: { root: "bg-brand text-brand-foreground data-[state=idle]:hover:bg-brand/90" },
    },
    shape: {
      // Icon only. Name it with `aria-label` (it defaults to `label`).
      circle: {},
      // Icon and words, with the time on air while live.
      pill: {},
    },
    // md is 40px, the hit target on its own; lg is 48px, for a console's main control.
    size: {
      md: { root: `h-10 text-sm ${hitCoarse}` },
      lg: { root: "h-12 text-sm" },
    },
  },
  compoundVariants: [
    { shape: "circle", size: "md", className: { root: "w-10", icon: "[&_svg]:size-5" } },
    { shape: "circle", size: "lg", className: { root: "w-12", icon: "[&_svg]:size-6" } },
    { shape: "pill", size: "md", className: { root: "pr-5 pl-4", icon: "[&_svg]:size-4" } },
    { shape: "pill", size: "lg", className: { root: "gap-2.5 pr-6 pl-5", icon: "[&_svg]:size-5" } },
  ],
  defaultVariants: { variant: "neutral", shape: "circle", size: "md" },
})

/** `m:ss`, the way a radio counts time on air. */
function onAir(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** Where typing happens: a shortcut held there is a letter, not a transmit. */
const TYPING = "input, textarea, select, [contenteditable=''], [contenteditable=true]"

const holdKey = (key: string) => key === " " || key === "Enter"

export interface PushToTalkProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof pushToTalkVariants> {
  /** The words at rest (the pill shows them; the circle uses them as its default name). */
  label?: React.ReactNode
  /** The words while live, before the timer. */
  liveLabel?: React.ReactNode
  /** Show the time on air beside `liveLabel` (pill only). */
  timer?: boolean
  /** A hold shorter than this, in ms, is cancelled: `onTalkCancel` fires and the control shakes. */
  minDuration?: number
  /**
   * A key that transmits while held anywhere on the page (`KeyboardEvent.key`, case-insensitive),
   * e.g. `"t"`. Ignored while typing, with a modifier held, or while a dialog this control is not in
   * is open.
   */
  shortcut?: string
  /** The glyph at rest. */
  icon?: React.ReactNode
  /** The glyph while live. */
  liveIcon?: React.ReactNode
  onTalkStart?: () => void
  /** The hold ended after at least `minDuration`: the message went out. */
  onTalkEnd?: (durationMs: number) => void
  /** The hold ended before `minDuration`: nothing went out. */
  onTalkCancel?: (durationMs: number) => void
  onTalkingChange?: (talking: boolean) => void
}

export function PushToTalk({
  className,
  variant,
  shape,
  size,
  label = "Hold to talk",
  liveLabel = "On air",
  timer = true,
  minDuration = 450,
  shortcut,
  icon = <Microphone weight="fill" />,
  liveIcon = <Waveform weight="bold" />,
  onTalkStart,
  onTalkEnd,
  onTalkCancel,
  onTalkingChange,
  disabled,
  ref,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  onKeyUp,
  onContextMenu,
  ...props
}: PushToTalkProps) {
  // When the current hold began (null at rest). The ref answers synchronously inside handlers; the
  // state drives the paint.
  const since = React.useRef<number | null>(null)
  const [liveSince, setLiveSince] = React.useState<number | null>(null)
  const [rejections, setRejections] = React.useState(0)
  const [now, setNow] = React.useState(0)
  const button = React.useRef<HTMLButtonElement | null>(null)

  const start = () => {
    if (disabled || since.current !== null) return
    const t = performance.now()
    since.current = t
    setLiveSince(t)
    onTalkStart?.()
    onTalkingChange?.(true)
  }

  const stop = () => {
    if (since.current === null) return
    const ms = performance.now() - since.current
    since.current = null
    setLiveSince(null)
    onTalkingChange?.(false)
    if (ms < minDuration) {
      setRejections((n) => n + 1)
      onTalkCancel?.(ms)
    } else {
      onTalkEnd?.(ms)
    }
  }

  const stopEvent = React.useEffectEvent(stop)
  const startEvent = React.useEffectEvent(start)

  // A hold never outlives the window: switching apps or tabs swallows the key-up and pointer-up.
  React.useEffect(() => {
    if (liveSince === null) return
    const end = () => stopEvent()
    const hidden = () => document.visibilityState === "hidden" && stopEvent()
    window.addEventListener("blur", end)
    document.addEventListener("visibilitychange", hidden)
    return () => {
      window.removeEventListener("blur", end)
      document.removeEventListener("visibilitychange", hidden)
    }
  }, [liveSince])

  // Disabling a live control ends the hold.
  React.useEffect(() => {
    if (disabled) stopEvent()
  }, [disabled])

  // The global shortcut.
  React.useEffect(() => {
    if (!shortcut) return
    const key = shortcut.toLowerCase()
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as Element | null)?.closest?.(TYPING)) return
      const dialog = document.querySelector("[role=dialog][data-state=open], [role=alertdialog][data-state=open]")
      if (dialog && !dialog.contains(button.current)) return
      e.preventDefault()
      if (!e.repeat) startEvent()
    }
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key) stopEvent()
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [shortcut])

  // The time on air, counted only when it is shown. A stale `now` from the last hold reads as 0.
  const counting = liveSince !== null && shape === "pill" && timer
  React.useEffect(() => {
    if (!counting) return
    const tick = window.setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(tick)
  }, [counting])

  const live = liveSince !== null
  const slots = pushToTalkVariants({ variant, shape, size })
  // Two names that run the same keyframes, alternated so a second slip shakes again.
  const shake = rejections === 0 ? undefined : rejections % 2 ? "animate-shake-a" : "animate-shake-b"

  const setRef = (el: HTMLButtonElement | null) => {
    button.current = el
    if (typeof ref === "function") return ref(el)
    if (ref) ref.current = el
  }

  return (
    <button
      ref={setRef}
      type="button"
      data-slot="push-to-talk"
      data-state={live ? "live" : "idle"}
      aria-pressed={live}
      aria-label={shape === "pill" ? undefined : typeof label === "string" ? label : undefined}
      aria-keyshortcuts={shortcut ? shortcut.toUpperCase() : undefined}
      disabled={disabled}
      className={slots.root({ className: [shake, className] })}
      onPointerDown={(e) => {
        onPointerDown?.(e)
        if (e.defaultPrevented || e.button !== 0) return
        // Captured: released anywhere, the hold still ends here.
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // Without capture a release over the control or a lost window still ends it.
        }
        start()
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e)
        stop()
      }}
      onPointerCancel={(e) => {
        onPointerCancel?.(e)
        stop()
      }}
      onLostPointerCapture={(e) => {
        onLostPointerCapture?.(e)
        stop()
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || !holdKey(e.key)) return
        e.preventDefault()
        if (!e.repeat) start()
      }}
      onKeyUp={(e) => {
        onKeyUp?.(e)
        if (!holdKey(e.key)) return
        e.preventDefault()
        stop()
      }}
      // A long press on a phone must not open the system menu.
      onContextMenu={(e) => {
        onContextMenu?.(e)
        e.preventDefault()
      }}
      {...props}
    >
      {live && (
        <>
          <span data-slot="push-to-talk-halo" aria-hidden className={slots.halo()} />
          <span data-slot="push-to-talk-halo" aria-hidden className={slots.echo()} />
        </>
      )}
      <span data-slot="push-to-talk-icon" aria-hidden className={slots.icon()}>
        <span className={slots.iconIdle()}>{icon}</span>
        <span className={slots.iconLive()}>{liveIcon}</span>
      </span>
      {shape === "pill" &&
        (live ? (
          <span data-slot="push-to-talk-label" className={slots.label()}>
            {liveLabel}
            {timer && (
              <>
                {" "}
                <span data-slot="push-to-talk-timer" aria-hidden className={slots.timer()}>
                  {onAir(Math.max(0, now - liveSince))}
                </span>
              </>
            )}
          </span>
        ) : (
          <span data-slot="push-to-talk-label" className={slots.label()}>
            {label}
          </span>
        ))}
    </button>
  )
}
