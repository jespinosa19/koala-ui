import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { CodeSnippet } from "@/components/ui/code-snippet"
import { ScaleRow } from "@/components/docs/foundation"
import {
  ScrollFadeShowcase,
  ScrollFadeHorizontal,
  ScrollFadeEdges,
} from "@/components/docs/scroll-fade-demo"

export const metadata = { title: "Fade" }

export default function ScrollFadePage() {
  return (
    <>
      <DocHeader
        title="Fade"
        description="A soft mask that dissolves a box into its surface at its edges. Use the static fade-* utilities for a constant bleed, or the scroll-aware scroll-fade-* siblings to make the hint track scroll position. Pure CSS, no JS."
      />

      <DocSection title="Static fade">
        <p className="mt-4 text-pretty text-muted-foreground">
          The base primitive: a constant{" "}
          <code className="font-mono text-sm">mask-image</code> gradient that fades one or more edges
          into the surface, no matter the scroll position. Reach for it whenever the bleed is fixed -
          a marquee that drifts in from both sides, a masonry that clips at the section edges, or a
          preview that peeks up from the bottom of its frame.
        </p>
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          {/* A marquee makes the edge fades obvious: tiles dissolve as they drift past the masked
              sides instead of hard-clipping. Pure CSS via the animate-marquee token (set rendered
              twice for a seamless -50% loop), pauses on hover, holds still under reduced motion. */}
          <div className="group/marquee fade-x [--fade-size:10%]">
            <div
              aria-hidden
              className="flex w-max animate-marquee gap-3 py-4 pr-3 [--marquee-duration:28s] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none]"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-muted text-sm font-medium tabular-nums text-muted-foreground"
                >
                  {String((i % 10) + 1).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>
        <CodeSnippet
          filename="logos.tsx"
          className="mt-4"
          code={`// A marquee whose tiles dissolve into the band at both edges, at any scroll position.
<div className="group/marquee overflow-hidden fade-x [--fade-size:10%]">
  {/* Render the set twice so the -50% marquee loops with no seam. */}
  <div className="flex w-max animate-marquee gap-3 pr-3 group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none]">
    {[...logos, ...logos].map((logo, i) => (
      <Logo key={i} {...logo} />
    ))}
  </div>
</div>`}
        />
        <div className="mt-6">
          <ScaleRow name="fade">
            <span className="text-sm text-muted-foreground">
              Vertical, both edges. Content dissolves into the top and bottom of its box.
            </span>
          </ScaleRow>
          <ScaleRow name="fade-x">
            <span className="text-sm text-muted-foreground">
              Horizontal, both edges. Marquees, edge-clipped walls, segmented rows.
            </span>
          </ScaleRow>
          <ScaleRow name="fade-t">
            <span className="text-sm text-muted-foreground">Fade the top edge only.</span>
          </ScaleRow>
          <ScaleRow name="fade-b">
            <span className="text-sm text-muted-foreground">Fade the bottom edge only.</span>
          </ScaleRow>
          <ScaleRow name="fade-l">
            <span className="text-sm text-muted-foreground">Fade the left edge only.</span>
          </ScaleRow>
          <ScaleRow name="fade-r">
            <span className="text-sm text-muted-foreground">Fade the right edge only.</span>
          </ScaleRow>
        </div>
        <p className="mt-6 text-pretty text-muted-foreground">
          Depth per edge is the <code className="font-mono text-sm">--fade-size</code> knob (default{" "}
          <code className="font-mono text-sm">min(2.5rem, 12%)</code>); set it with an arbitrary
          property like <code className="font-mono text-sm">[--fade-size:6%]</code>. The rest of this
          page covers <code className="font-mono text-sm">scroll-fade</code>, the same mask made to
          track scroll progress instead.
        </p>
      </DocSection>

      <DocSection title="Scroll-aware preview">
        <p className="mt-4 text-pretty text-muted-foreground">
          Scroll the list. At the top the leading edge is crisp; once content slides under it,
          the top fades while the bottom keeps hinting at more below. Change the fade depth to
          feel the <code className="font-mono text-sm">--scroll-fade-size</code> knob.
        </p>
        <div className="mt-6">
          <ScrollFadeShowcase />
        </div>
      </DocSection>

      <DocSection title="How it works">
        <p className="mt-4 text-pretty text-muted-foreground">
          The fade is a <code className="font-mono text-sm">mask-image</code> linear gradient
          whose two inner stops are driven by{" "}
          <code className="font-mono text-sm">animation-timeline: scroll(self)</code> - a
          scroll-progress timeline, not a clock. Each edge&rsquo;s depth is a registered
          <code className="font-mono text-sm">@property</code> number from{" "}
          <code className="font-mono text-sm">0</code> (crisp) to{" "}
          <code className="font-mono text-sm">1</code> (faded), so it interpolates as you scroll:
          the top fades in over the first <code className="font-mono text-sm">--scroll-fade-reveal</code>{" "}
          of travel, and the bottom sharpens over the last. No scroll listeners, no JavaScript,
          no layout cost.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          Put the mask on the scroll container itself, and the border on a wrapper - the
          gradient masks whatever it covers, so a border on the same element would fade too. The
          frame stays crisp; only the content dissolves into the edge.
        </p>
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap the scroll area in a bordered, <code className="font-mono text-sm">overflow-hidden</code>{" "}
          frame, then put <code className="font-mono text-sm">scroll-fade</code> on the inner
          scrolling element.
        </p>
        <CodeSnippet
          filename="notifications.tsx"
          className="mt-4"
          code={`// Frame owns the border + corners; the inner element owns the scroll + mask.
<div className="overflow-hidden rounded-xl border border-border">
  <ul className="scroll-fade h-72 overflow-y-auto p-2">
    {items.map((item) => (
      <li key={item.id}>{item.title}</li>
    ))}
  </ul>
</div>`}
        />
        <div className="mt-6">
          <ScaleRow name="scroll-fade">
            <span className="text-sm text-muted-foreground">
              Vertical, both edges. The common case for lists, menus and dialog bodies.
            </span>
          </ScaleRow>
          <ScaleRow name="scroll-fade-x">
            <span className="text-sm text-muted-foreground">
              Horizontal, both edges. Chip rows, segmented bars, wide tables.
            </span>
          </ScaleRow>
          <ScaleRow name="scroll-fade-t">
            <span className="text-sm text-muted-foreground">Fade the top edge only.</span>
          </ScaleRow>
          <ScaleRow name="scroll-fade-b">
            <span className="text-sm text-muted-foreground">Fade the bottom edge only.</span>
          </ScaleRow>
          <ScaleRow name="scroll-fade-l">
            <span className="text-sm text-muted-foreground">Fade the left edge only.</span>
          </ScaleRow>
          <ScaleRow name="scroll-fade-r">
            <span className="text-sm text-muted-foreground">Fade the right edge only.</span>
          </ScaleRow>
        </div>
      </DocSection>

      <DocSection title="Horizontal">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">scroll-fade-x</code> masks the inline edges instead.
          The right edge fades while there are more chips to reach, and sharpens at the end of
          the row.
        </p>
        <div className="mt-6">
          <ScrollFadeHorizontal />
        </div>
        <CodeSnippet
          filename="tabs.tsx"
          className="mt-4"
          code={`<div className="overflow-hidden rounded-xl border border-border p-2">
  <div className="scroll-fade-x flex gap-2 overflow-x-auto px-2 py-1">
    {tags.map((tag) => (
      <Chip key={tag}>{tag}</Chip>
    ))}
  </div>
</div>`}
        />
      </DocSection>

      <DocSection title="Single edge">
        <p className="mt-4 text-pretty text-muted-foreground">
          Reach for a one-sided utility when only one edge should bleed - a chat log that fades
          into its header (<code className="font-mono text-sm">scroll-fade-t</code>), or a list
          that only needs to hint at more rows below (
          <code className="font-mono text-sm">scroll-fade-b</code>). The crisp edge never fades,
          even mid-scroll.
        </p>
        <div className="mt-6">
          <ScrollFadeEdges />
        </div>
      </DocSection>

      <DocSection title="Customizing">
        <p className="mt-4 text-pretty text-muted-foreground">
          Two CSS variables tune the effect per element - set them with an arbitrary property so
          they cascade cleanly and stay overridable.
        </p>
        <div className="mt-6">
          <ScaleRow name="--scroll-fade-size" meta="min(2.5rem, 12%)">
            <span className="text-sm text-muted-foreground">
              Fade-band depth per edge. Capped at 40px but never more than 12% of the box, so
              short containers don&rsquo;t over-fade.
            </span>
          </ScaleRow>
          <ScaleRow name="--scroll-fade-reveal" meta="6rem">
            <span className="text-sm text-muted-foreground">
              The scroll distance an edge fades in or sharpens over. Smaller is snappier; larger
              is more gradual.
            </span>
          </ScaleRow>
        </div>
        <CodeSnippet
          filename="customizing.tsx"
          className="mt-4"
          code={`// Deeper fade, quicker reveal.
<ul className="scroll-fade overflow-y-auto [--scroll-fade-size:4rem] [--scroll-fade-reveal:3rem]">
  {/* … */}
</ul>`}
        />
      </DocSection>

      <DocSection title="Browser support">
        <p className="mt-4 text-pretty text-muted-foreground">
          The scroll-aware behavior rides{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            scroll-driven animations
          </a>
          . Where they aren&rsquo;t supported, a{" "}
          <code className="font-mono text-sm">@supports</code> fallback keeps a static fade on
          the utility&rsquo;s edges, so the hint never disappears - it just stops tracking the
          scroll position. Because the effect is driven by the user&rsquo;s own scrolling (it
          never plays on its own), it&rsquo;s left on under{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code>.
        </p>
      </DocSection>
    </>
  )
}
