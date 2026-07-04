import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { ScaleRow } from "@/components/docs/foundation"

export const metadata = { title: "Typography" }

/**
 * Tailwind v4's type scale ships each size with a *paired* line-height (the
 * `--text-*--line-height` tokens). The clever bit: every pairing resolves the
 * rendered leading onto the 0.25rem / 4px baseline grid - 16, 20, 24, 28, 28,
 * 32, 36, 40, 48px - so vertical rhythm stays on-grid at every step.
 *
 * `lh` is the unitless multiplier Tailwind sets; `lead` is what it resolves to
 * at that font-size.
 */
const TYPE_SCALE = [
  { name: "text-xs", rem: "0.75rem", px: "12px", lh: "1.333", lead: "1rem / 16px" },
  { name: "text-sm", rem: "0.875rem", px: "14px", lh: "1.429", lead: "1.25rem / 20px" },
  { name: "text-base", rem: "1rem", px: "16px", lh: "1.5", lead: "1.5rem / 24px" },
  { name: "text-lg", rem: "1.125rem", px: "18px", lh: "1.556", lead: "1.75rem / 28px" },
  { name: "text-xl", rem: "1.25rem", px: "20px", lh: "1.4", lead: "1.75rem / 28px" },
  { name: "text-2xl", rem: "1.5rem", px: "24px", lh: "1.333", lead: "2rem / 32px" },
  { name: "text-3xl", rem: "1.875rem", px: "30px", lh: "1.2", lead: "2.25rem / 36px" },
  { name: "text-4xl", rem: "2.25rem", px: "36px", lh: "1.111", lead: "2.5rem / 40px" },
  { name: "text-5xl", rem: "3rem", px: "48px", lh: "1", lead: "3rem / 48px" },
]

const WEIGHTS = [
  { name: "font-normal", value: "400", note: "body" },
  { name: "font-medium", value: "500", note: "UI labels" },
  { name: "font-semibold", value: "600", note: "headings" },
  { name: "font-bold", value: "700", note: "emphasis" },
]

/**
 * Tracking is `letter-spacing` in `em`, so it scales *with* font-size. The px
 * column is the resolved value at the 18px (text-lg) sample size below - halve
 * it at text-sm, double it at text-4xl.
 */
const TRACKING = [
  { name: "tracking-tighter", em: "-0.05em", px: "−0.90px" },
  { name: "tracking-tight", em: "-0.025em", px: "−0.45px" },
  { name: "tracking-normal", em: "0em", px: "0px" },
  { name: "tracking-wide", em: "0.025em", px: "+0.45px" },
  { name: "tracking-wider", em: "0.05em", px: "+0.90px" },
  { name: "tracking-widest", em: "0.1em", px: "+1.80px" },
]

/**
 * Leading is a unitless `line-height` multiplier, so it too scales with
 * font-size. The px column is resolved at the 16px (text-base) sample.
 */
const LEADING = [
  { name: "leading-tight", value: "1.25", px: "20px" },
  { name: "leading-snug", value: "1.375", px: "22px" },
  { name: "leading-normal", value: "1.5", px: "24px" },
  { name: "leading-relaxed", value: "1.625", px: "26px" },
  { name: "leading-loose", value: "2", px: "32px" },
]

const SAMPLE = "The quick brown fox"
const PARAGRAPH =
  "Vertical rhythm is the heartbeat of a page. Leading sets how far each line falls from the next, and on a tuned scale it lands on the grid."

export default function TypographyPage() {
  return (
    <>
      <DocHeader
        title="Typography"
        description="Two typefaces: Inter carries UI, body and the smaller headings, DM Sans is reserved for display headings (h1–h2), with the system monospace as the code fallback. DM Sans loads with an optical-size axis, so its display letterfit self-tunes by size. The full type scale, weights, tracking and leading come straight from Tailwind v4; we don't redefine them. The numbers below are the resolved token values."
      />

      <DocSection title="Font families">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Two bundled typefaces, both variable fonts loaded via{" "}
          <code className="font-mono text-sm">next/font</code>.{" "}
          <code className="font-mono text-sm">font-sans</code> (Inter) is the workhorse for
          UI, body and the smaller headings (<code className="font-mono text-sm">h3</code>–
          <code className="font-mono text-sm">h6</code>);{" "}
          <code className="font-mono text-sm">font-heading</code> (DM Sans, with
          an optical-size axis) is reserved for the display headings{" "}
          <code className="font-mono text-sm">h1</code>–<code className="font-mono text-sm">h2</code>.{" "}
          <code className="font-mono text-sm">font-mono</code> falls back to the platform UI
          monospace - nothing to download.
        </p>
        <div className="mt-6 flex flex-col divide-y divide-border">
          <div className="flex items-baseline gap-4 py-4">
            <span className="w-32 shrink-0 font-mono text-xs text-muted-foreground">font-sans</span>
            <span className="font-sans text-2xl">The quick brown fox</span>
          </div>
          <div className="flex items-baseline gap-4 py-4">
            <span className="w-32 shrink-0 font-mono text-xs text-muted-foreground">font-heading</span>
            <span className="font-heading text-2xl">The quick brown fox</span>
          </div>
          <div className="flex items-baseline gap-4 py-4">
            <span className="w-32 shrink-0 font-mono text-xs text-muted-foreground">font-mono</span>
            <span className="font-mono text-2xl">const koala = true</span>
          </div>
        </div>
      </DocSection>

      <DocSection title="Type scale">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Sizes are absolute (<code className="font-mono text-sm">rem</code>). Each ships a
          paired line-height that snaps the rendered leading onto the 4px / 0.25rem grid - the{" "}
          <span className="font-medium text-foreground">lead</span> column.
        </p>
        <div className="mt-4">
          {TYPE_SCALE.map((t) => (
            <ScaleRow
              key={t.name}
              name={t.name}
              meta={`${t.rem} · ${t.px}`}
              detail={`lh ${t.lh} → ${t.lead}`}
            >
              <span className={`${t.name} truncate text-foreground`}>{SAMPLE}</span>
            </ScaleRow>
          ))}
        </div>
        <p className="mt-4 text-sm text-pretty text-muted-foreground">
          These are raw sizes, not heading roles. A bare{" "}
          <code className="font-mono text-sm">h1</code>–<code className="font-mono text-sm">h2</code>{" "}
          carries the DM Sans display face and tracking while{" "}
          <code className="font-mono text-sm">h3</code>–<code className="font-mono text-sm">h6</code>{" "}
          stay in Inter (see Font families), but none carry an intrinsic size, so each
          context steps off this scale on its own. For the document scale the{" "}
          <a
            href="/docs/components/rich-text-editor#prose-scale"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Rich Text Editor
          </a>{" "}
          maps onto <code className="font-mono text-sm">H1</code>–
          <code className="font-mono text-sm">H4</code> and body copy, see its Prose scale.
        </p>
      </DocSection>

      <DocSection title="Weights">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Four stops off the variable weight axis, shared by both faces. We skip 100–300
          (too fragile at text sizes) and everything above 700 (heavier than the brand needs).
        </p>
        <div className="mt-4">
          {WEIGHTS.map((w) => (
            <ScaleRow key={w.name} name={w.name} meta={w.value} detail={w.note}>
              <span className={`${w.name} text-lg text-foreground`}>{SAMPLE}</span>
            </ScaleRow>
          ))}
        </div>
      </DocSection>

      <DocSection title="Tracking">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          <code className="font-mono text-sm">letter-spacing</code> in{" "}
          <code className="font-mono text-sm">em</code>, so it scales with size. The px
          column is resolved at this 18px sample. Rule of thumb: tighten large display text
          (<code className="font-mono text-sm">tracking-tight</code>), leave body at normal,
          and only open up small all-caps labels.
        </p>
        <div className="mt-4">
          {TRACKING.map((t) => (
            <ScaleRow key={t.name} name={t.name} meta={t.em} detail={`${t.px} @ 18px`}>
              <span className={`${t.name} text-lg text-foreground`}>{SAMPLE}</span>
            </ScaleRow>
          ))}
        </div>
      </DocSection>

      <DocSection title="Leading">
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Unitless <code className="font-mono text-sm">line-height</code>, multiplied by the
          font-size. The px column is resolved at this 16px sample. Most components inherit the
          type scale’s paired leading; reach for these only to override it.
        </p>
        <div className="mt-4">
          {LEADING.map((l) => (
            <ScaleRow
              key={l.name}
              name={l.name}
              meta={l.value}
              detail={`${l.px} @ 16px`}
              align="start"
            >
              <p className={`${l.name} max-w-md text-base text-foreground`}>{PARAGRAPH}</p>
            </ScaleRow>
          ))}
        </div>
      </DocSection>
    </>
  )
}
