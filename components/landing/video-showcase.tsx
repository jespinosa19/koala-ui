"use client"

import * as React from "react"

import {
  VideoPlayer,
  Video,
  VideoControls,
  VideoBar,
  VideoPlayButton,
  VideoSeek,
  VideoTime,
  VideoVolume,
  VideoFullscreen,
  VideoSpinner,
} from "@/components/ui/video-player"
import { Section, SectionHeading } from "@/components/landing/section"
import { Reveal } from "@/components/landing/reveal"

// A short, openly-hosted clip so the section plays without any bundled project assets. W3C's own
// media host (the canonical HTML5 sample) — the old Google `gtv-videos-bucket` sample now 403s.
const DEFAULT_SRC = "https://media.w3.org/2010/05/sintel/trailer.mp4"
const DEFAULT_POSTER = "https://media.w3.org/2010/05/sintel/poster.png"

export interface VideoShowcaseProps {
  /** Heading copy. */
  title?: React.ReactNode
  /** Lede paragraph under the heading. */
  description?: React.ReactNode
  /** Small uppercase label above the heading. */
  eyebrow?: React.ReactNode
  /** Video file URL. */
  src?: string
  /** Poster frame shown before playback. */
  poster?: string
  /**
   * Start playing on load. Browsers only allow autoplay on a muted video, so enabling this
   * forces {@link VideoShowcaseProps.muted}. @default true
   */
  autoPlay?: boolean
  /** Restart automatically when the clip ends. @default true */
  loop?: boolean
  /** Start muted. @default true */
  muted?: boolean
}

/**
 * Marketing slab: H2 + lede, then a full-width product video below, played through Koala's
 * own VideoPlayer. The player sits in a concentric-radius frame (border + shadow) that lifts
 * it off the band, and reveals on scroll a beat after the heading so the two read as one
 * cascade. Controls stay hidden until you hover (`revealOn="hover"`) for the cinematic feel:
 * mute, zoom (fullscreen), and the scrubber are all one hover away. Autoplay, loop, and mute
 * are configurable; everything is overridable per page.
 */
export function VideoShowcase({
  title = "See it move before you build it",
  description = "Every component and section in motion, exactly as it behaves in your product. Press play, then drop the same source into your repo.",
  eyebrow = "See it in motion",
  src = DEFAULT_SRC,
  poster = DEFAULT_POSTER,
  autoPlay = true,
  loop = true,
  muted = true,
}: VideoShowcaseProps = {}) {
  // Autoplay is browser-gated on muted playback, so a request to autoplay implies muted.
  const startMuted = muted || autoPlay

  return (
    <Section id="video-showcase">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      <Reveal delay={75} className="mx-auto w-full max-w-4xl">
        {/* Concentric radius: rounded-2xl frame over the player's rounded-xl surface. */}
        <div className="rounded-2xl border border-border bg-card p-2 shadow-xl">
          <VideoPlayer className="rounded-xl" revealOn="hover">
            <Video
              src={src}
              poster={poster}
              autoPlay={autoPlay}
              loop={loop}
              muted={startMuted}
              preload={autoPlay ? "auto" : "metadata"}
            />
            <VideoSpinner />
            <VideoControls>
              <VideoBar>
                <VideoPlayButton />
                <VideoSeek />
                <VideoTime />
                <VideoVolume />
                <VideoFullscreen />
              </VideoBar>
            </VideoControls>
          </VideoPlayer>
        </div>
      </Reveal>
    </Section>
  )
}
