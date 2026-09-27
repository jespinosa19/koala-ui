"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

/**
 * The 11-character id out of anything a person would paste for a YouTube video: a bare id, a
 * `watch?v=` link, a `youtu.be/` short link, or an `embed/`, `shorts/` or `live/` path. Anything it
 * can't read is handed back trimmed, so a malformed value fails visibly in the player rather than
 * silently opening the wrong video.
 */
function youTubeId(video: string): string {
  const value = video.trim()
  if (/^[\w-]{11}$/.test(value)) return value
  try {
    const url = new URL(value)
    const fromQuery = url.searchParams.get("v")
    if (fromQuery) return fromQuery
    const parts = url.pathname.split("/").filter(Boolean)
    if (url.hostname.endsWith("youtu.be") && parts[0]) return parts[0]
    const at = parts.findIndex((part) => ["embed", "shorts", "live", "v"].includes(part))
    if (at >= 0 && parts[at + 1]) return parts[at + 1]
  } catch {
    // Not a URL either: fall through and let the embed show YouTube's own "unavailable" state.
  }
  return value
}

/**
 * A YouTube video in a lightbox: the DS `Dialog` at `size="media"`, where the dialog IS the player
 * (no padding or chrome, a black letterbox, a light close button over the footage), kept floating
 * mid-screen at every width with `mobile="center"`, since a landscape frame docked to the bottom as
 * a sheet would sit under the thumb.
 *
 * The frame only exists while the dialog is open (Radix unmounts closed content), so nothing loads
 * until someone asks for it, the video autoplays on open, and closing it stops playback outright.
 * The embed is YouTube's privacy-enhanced domain: no cookies until the viewer presses play.
 */
export function VideoDialog({
  children,
  video,
  title,
}: {
  /** ONE element that opens the video, rendered through `DialogTrigger asChild`. */
  children: React.ReactElement
  /** A bare id (`d1XZ7iINo6U`) or any YouTube link. */
  video: string
  /** Accessible name for the dialog and the player frame. Not shown. */
  title: string
}) {
  const params = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" })
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* No description: the title names the video and there is nothing else to announce. */}
      <DialogContent size="media" mobile="center" closeLabel="Close video" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Pinned to the content box: the content wraps its children in the density provider's
            element, so the iframe is never a direct child and would fall back to 300x150. */}
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${youTubeId(video)}?${params}`}
          title={title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </DialogContent>
    </Dialog>
  )
}
