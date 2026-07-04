import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  HeroDemo,
  HeroMinimalDemo,
  HeroRotatingDemo,
  HeroSplitDemo,
  HeroVideoDemo,
  HeroImageDemo,
} from "./demos"

export const metadata = { title: "Hero" }

export default function HeroDocsPage() {
  return (
    <>
      <DocHeader
        title="Hero"
        description="A centered marketing hero section. Named parts you assemble: an announcement eyebrow, a balanced headline, a subtitle, a CTA row, a check-circle feature list, and an integrated social-proof row. Buttons and avatars are composed from our own components."
      />

      <ComponentPreview
        locked
        previewClassName="block p-0"
        code={`<Hero>
  <HeroContent>
    <Badge variant="orange" dot pill>Koala UI v1.0 is here</Badge>
    <HeroTitle>A design system built to feel finished</HeroTitle>
    <HeroSubtitle>89 accessible React components and four themes, with the real source copied straight into your repo. Assemble production screens in an afternoon, not a sprint.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Buy once, use forever</Button>
      <Button size="lg" variant="outline">Get the Figma kit</Button>
      <Button size="lg" variant="outline">Browse the docs</Button>
    </HeroActions>
    <HeroFeatures>
      <HeroFeature>89 accessible components</HeroFeature>
      <HeroFeature>Own every line of source</HeroFeature>
      {/* …more */}
    </HeroFeatures>
    <HeroSocialProof>
      <AvatarGroup size="sm">
        <Tooltip content="Ana Ruiz">
          <Avatar size="sm"><AvatarFallback>AR</AvatarFallback></Avatar>
        </Tooltip>
        {/* …more */}
      </AvatarGroup>
      <HeroRating>4.8/5 average rating</HeroRating>
    </HeroSocialProof>
  </HeroContent>
</Hero>`}
      >
        <HeroDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="hero" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="Minimal">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop the features and social-proof rows for a lean hero: just the eyebrow, title,
          subtitle, and CTAs. Override the vertical rhythm on{" "}
          <code className="font-mono text-sm">HeroContent</code> when you want it tighter.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<Hero>
  <HeroContent className="py-16 sm:py-20">
    <Badge variant="info" dot pill>New: Koala UI for React</Badge>
    <HeroTitle>Build polished products, faster</HeroTitle>
    <HeroSubtitle>A production-ready component library you can install with one command.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Get started</Button>
      <Button size="lg" variant="outline">Browse components</Button>
    </HeroActions>
  </HeroContent>
</Hero>`}
        >
          <HeroMinimalDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Rotating highlight">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">rotate</code> a list of phrases to{" "}
          <code className="font-mono text-sm">HeroHighlight</code> and the wash becomes a rotating{" "}
          <em>zone</em>: the words inside swap, each entering with a per-character stagger while the
          previous one clears, the wash <strong>hugs each word</strong> (tweening its width as the
          phrase changes), and each phrase takes the <strong>next color</strong> in the palette
          (semantic DS roles, so it tracks every theme), the tint crossfading as it swaps. Lead every
          phrase with the same word so the left edge stays anchored against the copy beside it and
          only the right edge resizes. Give the title a touch more line-height (the demo uses{" "}
          <code className="font-mono text-sm">leading-[1.2]</code>) so the wash always clears the line
          above it. It holds each phrase for{" "}
          <code className="font-mono text-sm">interval</code> ms (default 2600) and honors{" "}
          <code className="font-mono text-sm">prefers-reduced-motion</code> by holding the first
          phrase with no cascade.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<HeroTitle className="leading-[1.2]">
  Bring your product into{" "}
  <HeroHighlight rotate={["every decision", "every workflow", "every release", "every roadmap"]}>
    every decision
  </HeroHighlight>
</HeroTitle>`}
        >
          <HeroRotatingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Split layout">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">layout=&quot;split&quot;</code> on{" "}
          <code className="font-mono text-sm">Hero</code> to turn the content into a two-column grid:
          a <code className="font-mono text-sm">HeroColumn</code> of copy beside a{" "}
          <code className="font-mono text-sm">HeroMedia</code> visual (an image, screenshot, or
          logo wall). It folds back to a single stacked column below the lg breakpoint. The same parts
          read the layout from context, so the only change is the prop.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<Hero layout="split">
  <HeroContent>
    <HeroColumn>
      <Badge variant="info" dot pill>Now in public beta</Badge>
      <HeroTitle>Analytics your whole team actually uses</HeroTitle>
      <HeroSubtitle>Real-time dashboards with no setup.</HeroSubtitle>
      <HeroActions>
        <Button size="lg">Get started</Button>
        <Button size="lg" variant="outline">Live demo</Button>
      </HeroActions>
      <HeroSocialProof>{/* AvatarGroup + HeroRating */}</HeroSocialProof>
    </HeroColumn>
    <HeroMedia>{/* image placeholder, screenshot, or logo wall */}</HeroMedia>
  </HeroContent>
</Hero>`}
        >
          <HeroSplitDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Background media">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">layout=&quot;background&quot;</code> and add a{" "}
          <code className="font-mono text-sm">HeroBackground</code> to turn the hero into a full-bleed
          band: the media covers the section, a gradient scrim lays over it, the copy flips to white,
          and the eyebrow goes glassy, all from the one prop. Drop a plain{" "}
          <code className="font-mono text-sm">&lt;img&gt;</code> in for a photo, or an{" "}
          <code className="font-mono text-sm">autoPlay muted loop playsInline</code>{" "}
          <code className="font-mono text-sm">&lt;video&gt;</code> for ambient motion (muted autoplay
          is the only kind browsers allow unprompted). Give the video a{" "}
          <code className="font-mono text-sm">poster</code> so the band never flashes empty, and a
          still <code className="font-mono text-sm">&lt;img className=&quot;hidden motion-reduce:block&quot;&gt;</code>{" "}
          fallback so it holds a frame under <code className="font-mono text-sm">prefers-reduced-motion</code>.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<Hero layout="background" className="rounded-lg">
  <HeroBackground>
    <video src={videoSrc} poster={posterSrc} autoPlay loop muted playsInline />
    <img className="hidden motion-reduce:block" src={posterSrc} alt="" />
  </HeroBackground>
  <HeroContent>
    <HeroEyebrow>Now in private beta</HeroEyebrow>
    <HeroTitle>Support that never sleeps</HeroTitle>
    <HeroSubtitle>AI agents pick up every call and answer in seconds.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Get started</Button>
    </HeroActions>
  </HeroContent>
</Hero>`}
        >
          <HeroVideoDemo />
        </ComponentPreview>
        <ComponentPreview
          locked
          previewClassName="block p-0"
          code={`<Hero layout="background" className="rounded-lg">
  <HeroBackground>
    <img src={photoSrc} alt="" />
  </HeroBackground>
  <HeroContent>
    <HeroEyebrow>Series A: $61M to scale support</HeroEyebrow>
    <HeroTitle>AI that talks like a human. Handles millions of calls.</HeroTitle>
    <HeroSubtitle>AI agents for enterprise support.</HeroSubtitle>
    <HeroActions>
      <Button size="lg">Talk to us</Button>
    </HeroActions>
    {/* a monochrome trusted-by row over the scrim */}
  </HeroContent>
</Hero>`}
        >
          <HeroImageDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Hero · HeroContent · HeroColumn</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">Hero</code> is the full-bleed{" "}
              <code className="font-mono text-sm">&lt;section&gt;</code> that provides the styling
              context. It takes a{" "}
              <code className="font-mono text-sm">layout</code> prop:{" "}
              <code className="font-mono text-sm">&quot;centered&quot;</code> (default),{" "}
              <code className="font-mono text-sm">&quot;split&quot;</code>, or{" "}
              <code className="font-mono text-sm">&quot;background&quot;</code>.{" "}
              <code className="font-mono text-sm">HeroContent</code> is the max-width column (a stacked
              column when centered, a two-column grid when split);{" "}
              <code className="font-mono text-sm">HeroColumn</code> groups the copy in the split
              layout. All forward their native element props.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroEyebrow · HeroTitle · HeroHighlight · HeroSubtitle</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The announcement pill (accepts{" "}
              <code className="font-mono text-sm">asChild</code> for a link), the balanced{" "}
              <code className="font-mono text-sm">&lt;h1&gt;</code>,{" "}
              <code className="font-mono text-sm">HeroHighlight</code> to mark a keyword inside the
              title with a soft brand wash, and the muted lead paragraph.{" "}
              <code className="font-mono text-sm">HeroHighlight</code> also takes{" "}
              <code className="font-mono text-sm">rotate</code> (a list of phrases to cycle through,
              with a per-character stagger, a wash that hugs each word, and a color per phrase) and{" "}
              <code className="font-mono text-sm">interval</code> (ms each phrase holds, default
              2600).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroActions</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The centered CTA row. Compose our{" "}
              <a href="/docs/components/button" className="underline underline-offset-4">Button</a>s
              inside it.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroFeatures · HeroFeature</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">HeroFeatures</code> wraps the checklist;{" "}
              <code className="font-mono text-sm">HeroFeature</code> is one item and renders its
              own green check-circle glyph before the label.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroSocialProof · HeroRating</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The proof row. Drop an{" "}
              <a href="/docs/components/avatar-group" className="underline underline-offset-4">
                AvatarGroup
              </a>{" "}
              in for the overlapping stack and a star rating beside it.{" "}
              <code className="font-mono text-sm">HeroRating</code> takes a{" "}
              <code className="font-mono text-sm">value</code> and{" "}
              <code className="font-mono text-sm">max</code> (both default 5) and renders the label as
              children.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroMedia</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The visual region. In a split hero it fills the second column; in a centered hero it
              sits below the copy. Drop an image or screenshot in, or a wall of customer logos. The
              demos ship an image placeholder so you can drop your own screenshot straight in.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">HeroBackground</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The full-bleed media layer for{" "}
              <code className="font-mono text-sm">layout=&quot;background&quot;</code>. It stretches
              its child <code className="font-mono text-sm">&lt;img&gt;</code> or{" "}
              <code className="font-mono text-sm">&lt;video&gt;</code> to cover the section and lays a
              gradient scrim over it, so the white copy stays legible on any photo. It sits behind{" "}
              <code className="font-mono text-sm">HeroContent</code>, and the section&apos;s{" "}
              <code className="font-mono text-sm">overflow-hidden</code> (plus any rounded corners)
              clips the media to the band.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Where do the buttons and avatars in a Hero come from?", a: "Hero is pure layout, so it ships no controls of its own. It is composed entirely of existing Koala components: drop our Button inside `HeroActions`, an `AvatarGroup` and `Rating` in `HeroSocialProof`, and a dot `Badge` for the eyebrow, so the hero stays consistent with the rest of the design system." },
            { q: "How do I render a lean hero without the feature list and ratings?", a: "Just omit `HeroFeatures` and `HeroSocialProof`. A minimal hero is the eyebrow, title, subtitle, and CTAs, and you can tighten the rhythm by overriding the padding on `HeroContent`." },
            { q: "Do I need to add a checkmark icon to each HeroFeature?", a: "No. `HeroFeature` renders its own green check-circle glyph before the label, so you only pass the text. Wrap the items in `HeroFeatures`." },
            { q: "What does the count prop on HeroRating do?", a: "`HeroRating` renders that many stars (default 5) and shows the label you pass as children, so a 5.0 rating reads correctly next to the avatar stack in `HeroSocialProof`." },
            { q: "How do I make the highlighted keyword rotate through several words?", a: "Pass `rotate` a list of phrases to `HeroHighlight`. The words swap with a per-character stagger, the wash hugs each one (tweening its width as the phrase changes), and each phrase takes the next color in the palette (semantic DS roles, so it tracks every theme). Set `interval` to change the hold (default 2600ms). It honors reduced-motion by holding the first phrase. Give the title a little extra line-height so the wash clears the line above it, and lead each phrase with the same word so the left edge stays anchored and only the right edge resizes." },
            { q: "How do I put a photo or video behind the hero?", a: "Set `layout=\"background\"` on `Hero` and add a `HeroBackground` with a plain `<img>` (photo) or an `autoPlay muted loop playsInline <video>` (ambient motion) inside. The one prop covers the band with the media, lays a gradient scrim over it for legibility, flips the copy to white, and makes the eyebrow glassy. Give a video a `poster` so the band never flashes empty, and add a still `<img className=\"hidden motion-reduce:block\">` fallback so it holds a frame under prefers-reduced-motion. Muted autoplay is the only kind browsers will play without a user gesture." },
          ]}
        />
      </DocSection>
    </>
  )
}
