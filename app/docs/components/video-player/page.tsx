import { CodeSnippet } from "@/components/docs/code-snippet"
import { ComponentPreview } from "@/components/docs/component-preview"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  VideoPlayerDemo,
  VideoPlayerSeekPreviewDemo,
  VideoPlayerMinimalDemo,
  VideoPlayerHoverDemo,
} from "./demos"

export const metadata = {
  title: "Video Player",
}

const fullCode = `<VideoPlayer>
  <Video src={src} poster={poster} preload="metadata" />
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
</VideoPlayer>`

const minimalCode = `<VideoPlayer>
  <Video src={src} poster={poster} preload="metadata" />
  <VideoControls>
    <VideoBar>
      <VideoPlayButton />
      <VideoSeek />
      <VideoTime />
    </VideoBar>
  </VideoControls>
</VideoPlayer>`

const hoverCode = `// Controls stay hidden until you hover the player (or tab into it).
// autoPlay / loop / muted are native <video> props that Video forwards.
<VideoPlayer revealOn="hover">
  <Video src={src} poster={poster} autoPlay loop muted preload="auto" />
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
</VideoPlayer>`

export default function VideoPlayerDocsPage() {
  return (
    <>
      <DocHeader
        title="Video Player"
        description="A native way to play media: a real <video> element wrapped in a composable control surface. The scrubber and volume bar are Radix Sliders (keyboard + ARIA for free), the controls auto-hide during playback, and they render light-on-a-dark scrim so they stay legible over any frame in every theme."
      />

      <ComponentPreview code={fullCode} previewClassName="p-6">
        <VideoPlayerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="video-player" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
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

export function Example() {
  return (
    <VideoPlayer>
      <Video src="/clip.mp4" poster="/clip.jpg" preload="metadata" />
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
  )
}`}
        />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          The player is composed from named parts, never dot-notation. Drop in only the
          controls you need and arrange them however you like; every part reads the shared
          playback state from <code className="font-mono text-sm">VideoPlayer</code>&apos;s
          context, so order and grouping are entirely up to you.
        </p>
        <CodeSnippet filename="anatomy.tsx" className="mt-4" code={fullCode} />
      </DocSection>

      <DocSection title="Minimal">
        <p className="mt-4 text-pretty text-muted-foreground">
          Nothing is required but <code className="font-mono text-sm">VideoPlayer</code> and{" "}
          <code className="font-mono text-sm">Video</code>. Here&apos;s a stripped-back bar
          with just play, scrubber, and timecode on a single row.
        </p>
        <ComponentPreview code={minimalCode} previewClassName="p-6">
          <VideoPlayerMinimalDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Scrub preview">
        <p className="mt-4 text-pretty text-muted-foreground">
          Hover (or drag) the scrubber and a timecode bubble rides the cursor, showing the
          moment you&apos;d land on before you commit, so you can see where you&apos;re heading
          and, against the total in <code className="font-mono text-sm">VideoTime</code>, how
          much is left. It&apos;s built into{" "}
          <code className="font-mono text-sm">VideoSeek</code>, with no extra props. With{" "}
          <code className="font-mono text-sm">preload=&quot;metadata&quot;</code> the duration
          is known up front, so it works before you ever press play.
        </p>
        <ComponentPreview code={fullCode} previewClassName="p-6">
          <VideoPlayerSeekPreviewDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Hover controls">
        <p className="mt-4 text-pretty text-muted-foreground">
          By default the controls stay up while the video is paused and auto-hide after an idle
          beat during playback. Pass{" "}
          <code className="font-mono text-sm">revealOn=&quot;hover&quot;</code> for the cinematic
          treatment instead: the chrome is hidden until you point at the player, paused or
          playing alike, and reveals again on hover or when you tab into it (keyboard users are
          never stranded). The idle timer is skipped in this mode, visibility simply tracks the
          pointer.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          It pairs naturally with the native{" "}
          <code className="font-mono text-sm">&lt;video&gt;</code> props that{" "}
          <code className="font-mono text-sm">Video</code> forwards:{" "}
          <code className="font-mono text-sm">autoPlay</code>,{" "}
          <code className="font-mono text-sm">loop</code>, and{" "}
          <code className="font-mono text-sm">muted</code> turn it into an ambient product loop
          with mute and zoom (fullscreen) one hover away. Browsers only allow autoplay on a
          muted video, so keep <code className="font-mono text-sm">muted</code> on whenever you
          set <code className="font-mono text-sm">autoPlay</code>.
        </p>
        <ComponentPreview code={hoverCode} previewClassName="p-6">
          <VideoPlayerHoverDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Keyboard">
        <p className="mt-4 text-pretty text-muted-foreground">
          Click the video to focus the player, then drive it from the keyboard. The Radix
          scrubber and volume slider keep their own arrow-key handling when focused, so the
          shortcuts below only fire when the player frame itself holds focus.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Key</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono">Space / K</td>
                <td className="px-4 py-2 text-muted-foreground">Play / pause</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">← / →</td>
                <td className="px-4 py-2 text-muted-foreground">Seek 5 seconds</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">↑ / ↓</td>
                <td className="px-4 py-2 text-muted-foreground">Volume up / down</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">M</td>
                <td className="px-4 py-2 text-muted-foreground">Mute / unmute</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono">F</td>
                <td className="px-4 py-2 text-muted-foreground">Toggle fullscreen</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Which parts are required?", a: "Only `VideoPlayer` and `Video`. Everything else, including `VideoControls`, `VideoBar`, and the individual controls, is optional. Every part reads playback state from the `VideoPlayer` context, so you drop in just the controls you need and arrange them in any order." },
            { q: "Why do the controls render white-on-dark instead of using theme tokens?", a: "The control bar floats over arbitrary video frames, so it cannot borrow a theme surface that might turn white over a bright shot. Like every native player it carries its own fixed contrast: white glyphs on a black scrim, legible over any frame in all four themes. This is a deliberate exception to semantic-roles-only." },
            { q: "How do I get the seek preview to work before pressing play?", a: "Set `preload=\"metadata\"` on the `Video`. That makes the duration known up front, so the timecode bubble that rides the scrubber in `VideoSeek` can render before playback ever starts. The preview is built into `VideoSeek` with no extra props." },
            { q: "Are the scrubber and volume bar accessible by keyboard?", a: "Yes. Both `VideoSeek` and `VideoVolume` are Radix Sliders, so arrow-key handling and ARIA come for free when they hold focus. Click the video to focus the player frame for the player-level shortcuts (Space or K to play, arrows to seek and adjust volume, M to mute, F for fullscreen)." },
            { q: "Why is my single-row bar wrapping?", a: "`VideoBar` lays its children on one line; the timecode in `VideoTime` is `shrink-0` and nowrap so it never reflows, and the scrubber yields the space instead. If a custom control is forcing a wrap, check that it is not stretching the row beyond the player width." },
            { q: "Can I show a loading spinner while the video buffers?", a: "Yes, add `VideoSpinner`. It reads the buffering state from context and centers a spinner over the frame, under the controls, while the video is waiting on data." },
            { q: "How do I keep the controls hidden until hover?", a: "Set `revealOn=\"hover\"` on `VideoPlayer`. The chrome stays hidden until you point at the player (paused or playing alike) and reveals on hover or when you tab into it for keyboard access. The default, `revealOn=\"auto\"`, keeps controls up while paused and auto-hides them after an idle beat during playback. Tune that idle delay with `hideDelay` (milliseconds, default 2600)." },
            { q: "How do I autoplay, loop, or mute the video?", a: "`autoPlay`, `loop`, and `muted` are native `<video>` attributes, and `Video` forwards every prop to the underlying element, so set them directly: `<Video autoPlay loop muted />`. Browsers block autoplay on a video with sound, so keep `muted` on whenever you use `autoPlay`." },
          ]}
        />
      </DocSection>

    </>
  )
}
