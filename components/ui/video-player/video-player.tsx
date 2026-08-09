"use client"

import * as React from "react"
import { Slider } from "radix-ui"
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  ArrowsOutSimple,
  ArrowsInSimple,
  CircleNotch,
} from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { tv } from "@/lib/tv"
import { Tooltip } from "@/components/ui/tooltip/tooltip"

/**
 * VideoPlayer: Koala's native way to play media: a real `<video>` element wrapped in a
 * composable control surface. Multi-part like Card: one `tv` recipe with `slots`, and all
 * playback state (playing, time, volume, fullscreen, buffering) flows to every part through
 * React Context, never prop-drilled (docs/ARCHITECTURE.md §2). The scrubber and volume bar
 * are Radix `Slider`s, so keyboard and ARIA come for free.
 *
 * **Why light-on-dark, not themed tokens?** The control bar floats over arbitrary video, so
 * it can't borrow a theme surface: a `bg-popover` bar turns white in light mode and vanishes
 * over a bright shot. Like every native player, the controls carry their own fixed contrast:
 * white glyphs on a black scrim, legible over any frame in any of the four themes. This is the
 * deliberate exception to "semantic roles only" (the same spirit as Tooltip wrapping Tippy):
 * `white`/`black` here are Tailwind utilities, not raw hex, and motion still rides the tokens.
 */
export const videoPlayerVariants = tv({
  slots: {
    // `group/player` drives the controls' show/hide; `isolate` keeps the z-stack local.
    // polish: concentric radius. Rounded-xl outer; drops to square
    // in real fullscreen.
    root: [
      "group/player relative isolate flex overflow-hidden rounded-xl bg-black select-none",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "[&:fullscreen]:rounded-none data-[active=false]:cursor-none",
    ],
    // aspect-video gives a sane default box; object-contain letterboxes rather than crops.
    video: "block size-full cursor-pointer bg-black object-contain aspect-video",
    // The bar carries its own gradient scrim, so there's no separate scrim element, kept
    // light and shallow for a minimal look. It fades and lifts with the player's
    // `data-active` state (#4 interruptible transition, named properties, never `all`).
    // NB: Tailwind v4 maps `translate-*`/`scale-*` to the standalone `translate`/`scale` CSS
    // properties, NOT `transform` — so the transition must name `translate`/`scale`, not `transform`,
    // or the motion snaps. (Same fix applied to every hover-revealed slot below.)
    controls: [
      "absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 px-2 pb-1.5 pt-8 text-white",
      "bg-gradient-to-t from-black/70 via-black/25 to-transparent",
      "translate-y-1 opacity-0 transition-[opacity,translate] duration-base ease-out",
      "pointer-events-none group-data-[active=true]/player:pointer-events-auto",
      "group-data-[active=true]/player:translate-y-0 group-data-[active=true]/player:opacity-100",
    ],
    // A control row. Everything lives on one line by default: play · scrubber · time ·
    // volume · fullscreen, for the minimal, native feel.
    bar: "flex items-center gap-1",
    // Shared icon control, minimal: no background plate, just a small glyph that brightens
    // on hover. size-10 is the real box, so it still meets the 40px hit target (#16) with no
    // pseudo extender and no overlap between neighbours. Tactile press (#12); specific
    // transition (#14).
    control: [
      "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md",
      "text-white/85 transition-[color,scale] duration-fast ease-out",
      "hover:text-white active:scale-[0.96]",
      "outline-none focus-visible:ring-2 focus-visible:ring-white/70",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    // ── Scrubber (Radix Slider) ──────────────────────────────────────────────────────────
    // group/seek so the track thickens and the thumb pops on hover (#5 affordance on hover).
    // The visible track is thin, so a `before` pseudo extends the grab area to 40px tall (#16),
    // centered on the track — vertical-only, so it never overlaps the neighbouring controls. This
    // is what makes the bar easy to actually grab and drag, not just a hairline to chase.
    seekRoot:
      "group/seek relative flex h-4 w-full grow touch-none items-center select-none before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
    seekTrack:
      "relative h-1 w-full grow overflow-hidden rounded-full bg-white/25 transition-[height] duration-fast ease-out group-hover/seek:h-1.5",
    // Buffered-ahead fill sits behind the played range; width set from JS via a CSS var (#4 rule
    // from Tailwind: runtime values go through a style var, not a generated class).
    seekBuffered: "absolute inset-y-0 left-0 rounded-full bg-white/40",
    seekRange: "absolute h-full rounded-full bg-white",
    seekThumb: [
      "block size-3 scale-0 rounded-full bg-white shadow-sm outline-none",
      "transition-transform duration-fast ease-out",
      "group-hover/seek:scale-100 focus-visible:scale-100 focus-visible:ring-2 focus-visible:ring-white/70",
    ],
    // Scrub preview: a small `landing / total` timecode that rides the cursor along the track,
    // showing the time you'd land on against the total for context. `left` is set from JS via
    // inline style (runtime value → style, same rule as seekBuffered); `-translate-x-1/2` centers it.
    // Fades + grows from its lower edge (#4 interruptible transition, named props; origin-bottom).
    seekHover: [
      "pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 origin-bottom",
      "rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium tabular-nums whitespace-nowrap text-white shadow-md",
      "scale-95 opacity-0 transition-[opacity,scale] duration-fast ease-out",
      "data-[visible]:scale-100 data-[visible]:opacity-100",
    ],
    // Elapsed / total. tabular-nums so the timecode never reflows as digits change (#15);
    // shrink-0 + nowrap so the scrubber yields space in a tight row, never the digits.
    time: "shrink-0 px-1.5 text-xs font-medium tabular-nums whitespace-nowrap text-white/90 select-none",
    // ── Volume (vertical Radix Slider in a flyout above the mute button) ───────────────────
    // Vertical + floating so it never reflows the control row; only the mute button occupies
    // space; the slider pops up on hover/focus.
    volumeRoot: "group/volume relative flex items-center",
    // The flyout panel. Sits directly atop the button (no gap, so the hover never drops
    // crossing a dead zone) and reveals with a scale+fade (#4 interruptible, named props).
    volumePanel: [
      "absolute bottom-full left-1/2 -translate-x-1/2",
      "flex justify-center rounded-lg bg-black/80 px-2 py-3 shadow-lg",
      "origin-bottom scale-95 opacity-0",
      "pointer-events-none transition-[opacity,scale] duration-fast ease-out",
      "group-hover/volume:pointer-events-auto group-hover/volume:scale-100 group-hover/volume:opacity-100",
      "group-focus-within/volume:pointer-events-auto group-focus-within/volume:scale-100 group-focus-within/volume:opacity-100",
    ],
    // Live % tooltip riding the thumb. A custom bubble (mirroring the seek scrub preview), not the
    // Tippy Tooltip, for the same reason the seek bar hand-rolls one: it has to track a thumb that
    // moves via transform mid-drag, which a Popper-positioned tooltip can't follow. `bottom` is set
    // from `volume` (inline style) so it rides the thumb; it reveals with the flyout (group
    // hover/focus). origin-right so it grows out toward the slider; tabular-nums + nowrap so the
    // digits never reflow (#9), and the bubble sits to the side so it never covers the track.
    volumeTip: [
      "pointer-events-none absolute right-full mr-2 translate-y-1/2 origin-right",
      "rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium tabular-nums whitespace-nowrap text-white shadow-md",
      "scale-95 opacity-0 transition-[opacity,scale] duration-fast ease-out",
      "group-hover/volume:scale-100 group-hover/volume:opacity-100",
      "group-focus-within/volume:scale-100 group-focus-within/volume:opacity-100",
    ],
    volumeSlider: "relative flex h-20 w-4 touch-none flex-col items-center select-none",
    volumeTrack: "relative h-full w-1 grow overflow-hidden rounded-full bg-white/25",
    volumeRange: "absolute w-full rounded-full bg-white",
    volumeThumb:
      "block size-3 rounded-full bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    // Buffering indicator, centered over the frame and under the controls.
    spinner: "pointer-events-none absolute inset-0 z-0 m-auto flex items-center justify-center",
  },
})

type VideoSlots = ReturnType<typeof videoPlayerVariants>

interface VideoContext {
  slots: VideoSlots
  videoRef: React.RefObject<HTMLVideoElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  playing: boolean
  currentTime: number
  duration: number
  /** Seconds buffered ahead of the playhead. */
  buffered: number
  /** Effective level shown by the volume bar: 0 when muted, else `volume`. */
  volume: number
  muted: boolean
  fullscreen: boolean
  buffering: boolean
  togglePlay: () => void
  seek: (time: number) => void
  changeVolume: (level: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  /** Reveal the controls and (re)arm the idle-hide timer. */
  wake: () => void
  /** State setters the `<Video>` part wires to the media element's native events. */
  sync: {
    setPlaying: (v: boolean) => void
    setCurrentTime: (v: number) => void
    setDuration: (v: number) => void
    setBuffered: (v: number) => void
    setVolume: (v: number) => void
    setMuted: (v: boolean) => void
    setBuffering: (v: boolean) => void
  }
}

const [VideoProvider, useVideoContext] = createContext<VideoContext>("VideoPlayer")

/** mm:ss, or h:mm:ss past an hour. Non-finite (pre-metadata) reads as 0:00. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`
}

export interface VideoPlayerProps extends React.ComponentProps<"div"> {
  /** Idle delay before the controls auto-hide during playback, in ms. @default 2600 */
  hideDelay?: number
  /**
   * When the controls show.
   * - `"auto"` (default): native behavior: always visible while paused, auto-hide after an
   *   idle beat during playback.
   * - `"hover"`: controls are hidden unless the pointer is over the player (or focus is
   *   within it, for keyboard users), regardless of play/pause. The cinematic treatment.
   * @default "auto"
   */
  revealOn?: "auto" | "hover"
}

export function VideoPlayer({
  className,
  children,
  hideDelay = 2600,
  revealOn = "auto",
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [playing, setPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [fullscreen, setFullscreen] = React.useState(false)
  const [buffering, setBuffering] = React.useState(false)
  const [active, setActive] = React.useState(true)
  // Pointer-over / keyboard-focus state, only consulted in `revealOn="hover"` mode.
  const [hovering, setHovering] = React.useState(false)
  const [focusWithin, setFocusWithin] = React.useState(false)

  // Mirror `playing` into a ref so the (stable) `wake` callback reads the live value
  // without being re-created on every play/pause. Updated in an effect, never in render.
  const playingRef = React.useRef(playing)
  React.useEffect(() => {
    playingRef.current = playing
  }, [playing])
  const idleTimer = React.useRef<number | undefined>(undefined)

  const wake = React.useCallback(() => {
    setActive(true)
    window.clearTimeout(idleTimer.current)
    // Only auto-hide while actually playing; a paused player keeps its controls.
    if (playingRef.current) {
      idleTimer.current = window.setTimeout(() => setActive(false), hideDelay)
    }
  }, [hideDelay])

  // Arm the idle-hide timer whenever playback is running; clear it the moment it stops, so a
  // paused player always shows its controls. The setState only fires from the timeout (never
  // synchronously in the effect), so there's no cascading render.
  React.useEffect(() => {
    // In hover mode the idle timer is moot: visibility tracks the pointer, not playback.
    if (revealOn === "hover" || !playing) {
      window.clearTimeout(idleTimer.current)
      return
    }
    idleTimer.current = window.setTimeout(() => setActive(false), hideDelay)
    return () => window.clearTimeout(idleTimer.current)
  }, [playing, hideDelay, revealOn])

  // ── Imperative actions on the media element ──────────────────────────────────────────────
  const togglePlay = React.useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      // `play()` returns a promise that rejects on the autoplay policy, an interrupting
      // pause, or an unplayable/missing source ("NotSupportedError"). Swallow it so a failed
      // start never surfaces as an unhandled rejection; the player just stays paused.
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [])

  const seek = React.useCallback((time: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = time
    setCurrentTime(time) // optimistic: `timeupdate` confirms shortly after
  }, [])

  const changeVolume = React.useCallback((level: number) => {
    const v = videoRef.current
    if (!v) return
    const clamped = Math.min(1, Math.max(0, level))
    v.volume = clamped
    v.muted = clamped === 0
  }, [])

  const toggleMute = React.useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
  }, [])

  const toggleFullscreen = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    // Both reject when the browser denies the request (no user gesture, unsupported, or
    // already-exited); ignore so the rejection never bubbles as an unhandled rejection.
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void el.requestFullscreen?.().catch(() => {})
  }, [])

  // Keep `fullscreen` state in lockstep with the browser (covers Esc and the native UI).
  React.useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Native-feeling shortcuts. Guarded to `e.target === root` so a focused Slider keeps its
  // own arrow handling and a focused button keeps its own space/enter, no double-firing.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.target !== e.currentTarget) return
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault()
        togglePlay()
        wake()
        break
      case "f":
        toggleFullscreen()
        break
      case "m":
        toggleMute()
        break
      case "ArrowLeft":
        e.preventDefault()
        seek(Math.max(0, currentTime - 5))
        wake()
        break
      case "ArrowRight":
        e.preventDefault()
        seek(Math.min(duration, currentTime + 5))
        wake()
        break
      case "ArrowUp":
        e.preventDefault()
        changeVolume((muted ? 0 : volume) + 0.1)
        break
      case "ArrowDown":
        e.preventDefault()
        changeVolume((muted ? 0 : volume) - 0.1)
        break
    }
  }

  const sync = React.useMemo(
    () => ({
      setPlaying,
      setCurrentTime,
      setDuration,
      setBuffered,
      setVolume,
      setMuted,
      setBuffering,
    }),
    [],
  )

  return (
    <VideoProvider
      slots={videoPlayerVariants()}
      videoRef={videoRef}
      containerRef={containerRef}
      playing={playing}
      currentTime={currentTime}
      duration={duration}
      buffered={buffered}
      volume={muted ? 0 : volume}
      muted={muted}
      fullscreen={fullscreen}
      buffering={buffering}
      togglePlay={togglePlay}
      seek={seek}
      changeVolume={changeVolume}
      toggleMute={toggleMute}
      toggleFullscreen={toggleFullscreen}
      wake={wake}
      sync={sync}
    >
      <div
        ref={containerRef}
        data-slot="video-player"
        // auto: visible while "awake" OR paused, so a stopped video never hides its chrome.
        // hover: strictly the pointer/keyboard-focus state, paused or playing alike.
        data-active={revealOn === "hover" ? hovering || focusWithin : active || !playing}
        tabIndex={0}
        className={videoPlayerVariants().root({ className })}
        onPointerEnter={(e) => {
          if (revealOn === "hover") setHovering(true)
          onPointerEnter?.(e)
        }}
        onPointerMove={(e) => {
          if (revealOn === "hover") setHovering(true)
          else wake()
          onPointerMove?.(e)
        }}
        onPointerLeave={(e) => {
          if (revealOn === "hover") setHovering(false)
          else if (playingRef.current) setActive(false)
          onPointerLeave?.(e)
        }}
        onFocus={(e) => {
          if (revealOn === "hover") setFocusWithin(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          // Only collapse when focus actually leaves the player, not on inner part changes.
          if (revealOn === "hover" && !e.currentTarget.contains(e.relatedTarget)) {
            setFocusWithin(false)
          }
          onBlur?.(e)
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </VideoProvider>
  )
}

export type VideoProps = React.ComponentProps<"video">

/** The media element. Click toggles play and focuses the player so shortcuts take over. */
export function Video({ className, onClick, ...props }: VideoProps) {
  const { slots, videoRef, containerRef, togglePlay, sync } = useVideoContext("Video")

  // Recover state that landed BEFORE hydration. With `preload="metadata"` the browser starts
  // loading metadata the moment the SSR'd <video> is parsed; on a heavy page this component can
  // hydrate late, so `loadedmetadata`/`durationchange`/`volumechange` fire before the handlers
  // below are attached and their state is lost. `duration` then stays 0, and since the scrubber is
  // `disabled={!duration}` it can never be dragged. On mount we read whatever the element already
  // knows and sync it — idempotent when the events fire normally, a rescue when they beat us.
  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (Number.isFinite(v.duration) && v.duration > 0) sync.setDuration(v.duration)
    sync.setCurrentTime(v.currentTime)
    sync.setVolume(v.volume)
    sync.setMuted(v.muted)
    sync.setPlaying(!v.paused)
    if (v.buffered.length > 0) sync.setBuffered(v.buffered.end(v.buffered.length - 1))
    // Mount-only: a one-shot reconciliation against events that may have fired pre-hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <video
      ref={videoRef}
      data-slot="video"
      className={slots.video({ className })}
      playsInline
      // Native chrome is suppressed; the Koala controls own the surface.
      controls={false}
      onClick={(e) => {
        togglePlay()
        containerRef.current?.focus()
        onClick?.(e)
      }}
      onPlay={() => sync.setPlaying(true)}
      onPause={() => sync.setPlaying(false)}
      onEnded={() => sync.setPlaying(false)}
      onWaiting={() => sync.setBuffering(true)}
      onPlaying={() => sync.setBuffering(false)}
      onTimeUpdate={(e) => sync.setCurrentTime(e.currentTarget.currentTime)}
      onDurationChange={(e) => sync.setDuration(e.currentTarget.duration)}
      onLoadedMetadata={(e) => {
        sync.setDuration(e.currentTarget.duration)
        sync.setVolume(e.currentTarget.volume)
        sync.setMuted(e.currentTarget.muted)
      }}
      onVolumeChange={(e) => {
        sync.setVolume(e.currentTarget.volume)
        sync.setMuted(e.currentTarget.muted)
      }}
      onProgress={(e) => {
        const v = e.currentTarget
        if (v.buffered.length > 0) sync.setBuffered(v.buffered.end(v.buffered.length - 1))
      }}
      {...props}
    />
  )
}

export function VideoControls({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useVideoContext("VideoControls")
  return <div data-slot="video-controls" className={slots.controls({ className })} {...props} />
}

export function VideoBar({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useVideoContext("VideoBar")
  return <div data-slot="video-bar" className={slots.bar({ className })} {...props} />
}

export type VideoPlayButtonProps = React.ComponentProps<"button">

/**
 * The play/pause tooltip label. Keeps both words mounted and rolls between them (the outgoing
 * slides up + fades, the incoming rises from below), AND animates the bubble's width to the active
 * word so a shorter word gives a shorter tooltip that expands smoothly to the longer one.
 *
 * `width:auto` can't be transitioned, so the active word's width is measured and applied to an
 * explicit `width` via ref (no re-render, no set-state-in-effect); the first measure is applied
 * with the transition off so the bubble opens at the right size instead of resizing on show.
 * `grid-cols-1` (minmax(0,1fr)) keeps the column at the wrapper width, so the hidden wider word
 * overflows centered and is clipped, leaving the visible word centered as the bubble resizes.
 */
function PlayPauseHint({ playing }: { playing: boolean }) {
  const wrapRef = React.useRef<HTMLSpanElement>(null)
  const pauseRef = React.useRef<HTMLSpanElement>(null)
  const playRef = React.useRef<HTMLSpanElement>(null)
  const firstRef = React.useRef(true)
  React.useLayoutEffect(() => {
    const el = wrapRef.current
    const w = (playing ? pauseRef : playRef).current?.offsetWidth
    if (!el || !w) return
    if (firstRef.current) {
      el.style.transition = "none"
      el.style.width = `${w}px`
      void el.offsetWidth // flush the no-transition width before re-enabling the CSS transition
      el.style.transition = ""
      firstRef.current = false
    } else {
      el.style.width = `${w}px`
    }
  }, [playing])
  return (
    <span
      ref={wrapRef}
      className="grid grid-cols-1 place-items-center overflow-hidden transition-[width] duration-fast ease-out [&>*]:[grid-area:1/1]"
    >
      <span
        ref={pauseRef}
        className={`transition-[opacity,translate] duration-fast ease-out ${playing ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"}`}
      >
        Pause
      </span>
      <span
        ref={playRef}
        className={`transition-[opacity,translate] duration-fast ease-out ${playing ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"}`}
      >
        Play
      </span>
    </span>
  )
}

export function VideoPlayButton({ className, onClick, ...props }: VideoPlayButtonProps) {
  const { slots, playing, togglePlay } = useVideoContext("VideoPlayButton")
  const label = playing ? "Pause" : "Play"
  return (
    <Tooltip
      // Keep the hint up through the click (Tippy hides on click by default) so the label can roll
      // AND resize in place. The roll + measured-width logic lives in PlayPauseHint.
      hideOnClick={false}
      content={<PlayPauseHint playing={playing} />}
    >
      <button
        type="button"
        data-slot="video-play-button"
        aria-label={label}
        aria-pressed={playing}
        className={slots.control({ className })}
        onClick={(e) => {
          togglePlay()
          onClick?.(e)
        }}
        {...props}
      >
        {/* #7 contextual icon swap: both glyphs stay mounted and cross-fade (opacity/scale/blur)
            on toggle, so play↔pause reads as a transform, not a hard swap.
            #2 optical alignment: the play triangle's visual mass sits left of its bounding box, so
            nudge it a hair right (the `translate` property composes with `scale`); pause stays centered. */}
        <span className="relative flex size-[18px] items-center justify-center">
          <Play
            weight="fill"
            aria-hidden
            className={`absolute translate-x-px transition-[opacity,scale,filter] duration-fast ease-out ${playing ? "opacity-0 scale-[0.25] blur-[4px]" : "opacity-100 scale-100 blur-[0px]"}`}
          />
          <Pause
            weight="fill"
            aria-hidden
            className={`absolute transition-[opacity,scale,filter] duration-fast ease-out ${playing ? "opacity-100 scale-100 blur-[0px]" : "opacity-0 scale-[0.25] blur-[4px]"}`}
          />
        </span>
      </button>
    </Tooltip>
  )
}

export type VideoSeekProps = Omit<
  React.ComponentProps<typeof Slider.Root>,
  "value" | "onValueChange"
>

/**
 * Scrubber + buffered-ahead indicator. Radix Slider supplies keyboard seeking and ARIA.
 *
 * Hovering (or dragging) the track reveals a scrub preview: a small timecode bubble that
 * follows the cursor and reads the time you'd land on against the total (`landing / total`, the
 * total dimmed), so you see where you're heading and how far along that is before you commit.
 */
export function VideoSeek({ className, onPointerMove, onPointerLeave, ...props }: VideoSeekProps) {
  const { slots, currentTime, duration, buffered, seek, wake } = useVideoContext("VideoSeek")
  // Scrub-preview position (seconds under the cursor) and whether it's showing, kept as separate
  // state: on leave we drop `previewing` but KEEP `hoverTime`, so the bubble fades out where it is
  // instead of snapping back to 0:00.
  const [hoverTime, setHoverTime] = React.useState(0)
  const [previewing, setPreviewing] = React.useState(false)
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0
  const hoverPct = duration > 0 ? (hoverTime / duration) * 100 : 0
  return (
    <Slider.Root
      data-slot="video-seek"
      className={slots.seekRoot({ className })}
      value={[Math.min(currentTime, duration || 0)]}
      max={duration || 1}
      step={0.1}
      disabled={!duration}
      aria-label="Seek"
      onValueChange={([v]) => {
        seek(v)
        wake()
      }}
      onPointerMove={(e) => {
        // Map the pointer's x within the track to a time. Clamp so edge overshoot reads 0:00 / total.
        if (duration) {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          setHoverTime(Math.min(duration, Math.max(0, pct * duration)))
          setPreviewing(true)
        }
        onPointerMove?.(e)
      }}
      onPointerLeave={(e) => {
        // Keep hoverTime so the bubble fades out in place (no jump back to the start).
        setPreviewing(false)
        onPointerLeave?.(e)
      }}
      {...props}
    >
      <Slider.Track className={slots.seekTrack()}>
        <div className={slots.seekBuffered()} style={{ width: `${bufferedPct}%` }} />
        <Slider.Range className={slots.seekRange()} />
      </Slider.Track>
      <Slider.Thumb className={slots.seekThumb()} />
      {/* aria-hidden: the Slider already announces its value to assistive tech; this is a
          visual-only convenience that mirrors it. */}
      <div
        className={slots.seekHover()}
        data-visible={previewing || undefined}
        // Clamp within the track so the wider `landing / total` bubble never clips at the edges.
        style={{ left: `clamp(2.5rem, ${hoverPct}%, calc(100% - 2.5rem))` }}
        aria-hidden
      >
        {formatTime(hoverTime)}{" "}
        {/* The total is context for where you'd land, so dim it: the landing time stays the
            focal point (visual hierarchy), the "/ total" reads as a quiet reference. */}
        <span className="text-white/55">/ {formatTime(duration)}</span>
      </div>
    </Slider.Root>
  )
}

/** Elapsed / total timecode, e.g. `0:42 / 3:15`. */
export function VideoTime({ className, ...props }: React.ComponentProps<"span">) {
  const { slots, currentTime, duration } = useVideoContext("VideoTime")
  return (
    <span data-slot="video-time" className={slots.time({ className })} {...props}>
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )
}

export type VideoVolumeProps = React.ComponentProps<"div">

/**
 * Mute toggle with a vertical volume flyout that pops up above it on hover/focus. The slider
 * floats (absolutely positioned), so revealing it never shifts the control row. A small tooltip
 * rides the thumb reading out the live `%` (it follows the thumb as you drag), and the icon
 * tracks the level too.
 */
export function VideoVolume({ className, ...props }: VideoVolumeProps) {
  const { slots, volume, muted, changeVolume, toggleMute } = useVideoContext("VideoVolume")
  const Icon = muted || volume === 0 ? SpeakerX : volume < 0.5 ? SpeakerLow : SpeakerHigh
  return (
    <div data-slot="video-volume" className={slots.volumeRoot({ className })} {...props}>
      <button
        type="button"
        aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
        aria-pressed={muted}
        className={slots.control()}
        onClick={toggleMute}
      >
        <Icon weight="fill" />
      </button>
      <div className={slots.volumePanel()}>
        <Slider.Root
          orientation="vertical"
          className={slots.volumeSlider()}
          value={[volume]}
          max={1}
          step={0.05}
          aria-label="Volume"
          onValueChange={([v]) => changeVolume(v)}
        >
          <Slider.Track className={slots.volumeTrack()}>
            <Slider.Range className={slots.volumeRange()} />
          </Slider.Track>
          <Slider.Thumb className={slots.volumeThumb()} />
          {/* Live % tooltip riding the thumb. `bottom` tracks `volume` so it follows the thumb;
              aria-hidden since the Slider already announces its value to AT (like the seek preview). */}
          <div
            data-slot="video-volume-value"
            aria-hidden
            className={slots.volumeTip()}
            style={{ bottom: `${volume * 100}%` }}
          >
            {Math.round(volume * 100)}%
          </div>
        </Slider.Root>
      </div>
    </div>
  )
}

export type VideoFullscreenProps = React.ComponentProps<"button">

export function VideoFullscreen({ className, onClick, ...props }: VideoFullscreenProps) {
  const { slots, fullscreen, toggleFullscreen } = useVideoContext("VideoFullscreen")
  const label = fullscreen ? "Exit fullscreen" : "Enter fullscreen"
  return (
    <Tooltip content={label}>
      <button
        type="button"
        data-slot="video-fullscreen"
        aria-label={label}
        aria-pressed={fullscreen}
        className={slots.control({ className })}
        onClick={(e) => {
          toggleFullscreen()
          onClick?.(e)
        }}
        {...props}
      >
        {fullscreen ? <ArrowsInSimple weight="bold" /> : <ArrowsOutSimple weight="bold" />}
      </button>
    </Tooltip>
  )
}

/** Buffering spinner: renders only while the media is stalled waiting for data. */
export function VideoSpinner({ className, ...props }: React.ComponentProps<"div">) {
  const { slots, buffering } = useVideoContext("VideoSpinner")
  if (!buffering) return null
  return (
    <div data-slot="video-spinner" className={slots.spinner({ className })} {...props}>
      <CircleNotch weight="bold" className="size-10 animate-spin text-white" />
    </div>
  )
}
