import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  PricingDemo,
  PricingFeatureStatesDemo,
  PricingFeatureGroupsDemo,
  PricingBillingDemo,
  PricingTonesDemo,
  PricingActionPositionDemo,
  PricingBannerDemo,
  PricingConfigurableDemo,
} from "./demos"

export const metadata = { title: "Pricing" }

export default function PricingDocsPage() {
  return (
    <>
      <DocHeader
        title="Pricing"
        description="A responsive marketing pricing table. Named parts you assemble into plan cards: a name and description, a big tabular price, a feature checklist that distinguishes included from not-included, and a bottom-pinned call to action. Mark the recommended plan featured for a brand ring and elevated shadow."
      />

      <ComponentPreview
        previewClassName="block"
        code={`<Pricing>
  <PricingTier>
    <PricingTierHeader>
      <PricingTierName>Starter</PricingTierName>
      <PricingTierDescription>For individuals exploring the system.</PricingTierDescription>
    </PricingTierHeader>
    <PricingPrice>
      <PricingAmount>$0</PricingAmount>
      <PricingPeriod>/month</PricingPeriod>
    </PricingPrice>
    <PricingFeatures>
      <PricingFeature>Up to 5 projects</PricingFeature>
      <PricingFeature>Up to 3 team members</PricingFeature>
      <PricingFeature>Community support</PricingFeature>
      <PricingFeature>1 GB storage</PricingFeature>
      <PricingFeature>Core integrations</PricingFeature>
      <PricingFeature>7-day activity history</PricingFeature>
      <PricingFeature included={false}>Custom domains</PricingFeature>
      <PricingFeature included={false}>Advanced analytics</PricingFeature>
      <PricingFeature included={false}>Audit logs</PricingFeature>
      <PricingFeature included={false}>SSO &amp; SAML</PricingFeature>
    </PricingFeatures>
    <PricingTierAction>
      <Button variant="outline">Get started</Button>
    </PricingTierAction>
  </PricingTier>

  {/* The recommended plan: a brand ring, a Most popular badge, and a primary CTA. */}
  <PricingTier featured>
    <PricingTierHeader>
      <div className="flex flex-wrap items-center gap-2">
        <PricingTierName>Pro</PricingTierName>
        <Badge variant="orange" dot pill>Most popular</Badge>
      </div>
      <PricingTierDescription>For teams shipping in production.</PricingTierDescription>
    </PricingTierHeader>
    <PricingPrice>
      <PricingAmount>$29</PricingAmount>
      <PricingPeriod>/month</PricingPeriod>
    </PricingPrice>
    <PricingFeatures>
      <PricingFeature>Unlimited projects</PricingFeature>
      <PricingFeature>Unlimited team members</PricingFeature>
      <PricingFeature hint="One-hour response time on business days.">Priority support</PricingFeature>
      <PricingFeature hint="Pooled across your whole team, not per seat.">100 GB storage</PricingFeature>
      <PricingFeature>Custom domains</PricingFeature>
      <PricingFeature>Advanced analytics</PricingFeature>
      <PricingFeature>Custom roles &amp; permissions</PricingFeature>
      <PricingFeature hint="10,000 requests per minute, per workspace.">API access</PricingFeature>
      <PricingFeature>Audit logs</PricingFeature>
    </PricingFeatures>
    <PricingTierAction>
      <Button>Start free trial</Button>
    </PricingTierAction>
  </PricingTier>

  <PricingTier>
    <PricingTierHeader>
      <PricingTierName>Enterprise</PricingTierName>
      <PricingTierDescription>For organizations operating at scale.</PricingTierDescription>
    </PricingTierHeader>
    <PricingPrice>
      <PricingAmount>Custom</PricingAmount>
    </PricingPrice>
    <PricingFeatures>
      <PricingFeature>Everything in Pro</PricingFeature>
      <PricingFeature>SSO &amp; SAML</PricingFeature>
      <PricingFeature>SCIM provisioning</PricingFeature>
      <PricingFeature>Dedicated manager</PricingFeature>
      <PricingFeature>Custom contracts &amp; invoicing</PricingFeature>
      <PricingFeature>Onboarding &amp; training</PricingFeature>
      <PricingFeature>Custom data residency</PricingFeature>
      <PricingFeature>99.99% uptime SLA</PricingFeature>
    </PricingFeatures>
    <PricingTierAction>
      <Button variant="outline">Contact sales</Button>
    </PricingTierAction>
  </PricingTier>
</Pricing>`}
      >
        <PricingDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="pricing"
          dependencies="npm install radix-ui @phosphor-icons/react tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          className="mt-4"
          code={`import {
  Pricing,
  PricingTier,
  PricingTierHeader,
  PricingTierName,
  PricingTierDescription,
  PricingPrice,
  PricingAmount,
  PricingPeriod,
  PricingFeatures,
  PricingFeature,
  PricingTierAction,
} from "@/components/ui/pricing"
import { Button } from "@/components/ui/button"

<Pricing columns={3}>
  <PricingTier featured>
    <PricingTierHeader>
      <PricingTierName>Pro</PricingTierName>
      <PricingTierDescription>For teams shipping in production.</PricingTierDescription>
    </PricingTierHeader>
    <PricingPrice>
      <PricingAmount>$29</PricingAmount>
      <PricingPeriod>/month</PricingPeriod>
    </PricingPrice>
    <PricingFeatures>
      <PricingFeature>Unlimited projects</PricingFeature>
      <PricingFeature included={false}>SSO &amp; SAML</PricingFeature>
    </PricingFeatures>
    <PricingTierAction>
      <Button>Start free trial</Button>
    </PricingTierAction>
  </PricingTier>
</Pricing>`}
        />
      </DocSection>

      <DocSection title="Card styles">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code className="font-mono text-sm">tone</code> prop on{" "}
          <code className="font-mono text-sm">PricingTier</code> sets the card&apos;s surface, and is
          orthogonal to <code className="font-mono text-sm">featured</code> (the recommended ring),
          so the two combine. <code className="font-mono text-sm">default</code> is the bare card (a
          transparent fill, so it blends with whatever it sits on, delineated by its border alone);{" "}
          <code className="font-mono text-sm">outline</code> swaps the hairline for a brand edge;{" "}
          <code className="font-mono text-sm">solid</code> fills the card with the accent and flips
          every part to inverse text and glyphs (pair it with a light CTA and a light badge);{" "}
          <code className="font-mono text-sm">muted</code> sits the card on a soft grey panel. The
          CTA&apos;s <code className="font-mono text-sm">Button</code> variant stays your choice.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<Pricing columns={2}>
  <PricingTier tone="outline">…<Button>Get started</Button>…</PricingTier>

  {/* Solid: inverse parts, plus a light badge + CTA so both hold contrast on the accent. */}
  <PricingTier tone="solid">
    <PricingTierHeader>
      <Badge variant="orange" dot pill className="border-transparent bg-white">
        Most popular
      </Badge>
      …
    </PricingTierHeader>
    …
    <PricingTierAction>
      <Button variant="secondary" className="bg-white text-brand hover:bg-white/90">
        Get started
      </Button>
    </PricingTierAction>
  </PricingTier>

  <PricingTier tone="default">…<Button variant="secondary">Get started</Button>…</PricingTier>
  <PricingTier tone="muted">…</PricingTier>
</Pricing>`}
        >
          <PricingTonesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Banner">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap a tier in <code className="font-mono text-sm">PricingTierBanner</code> for the
          banner-behind treatment: the card nests inside a brand panel that peeks as a top{" "}
          <code className="font-mono text-sm">label</code> and a thin accent edge all around. It
          composes over any <code className="font-mono text-sm">tone</code> and, inside a grid, lines
          up with un-bannered neighbours.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<Pricing columns={2}>
  <PricingTier tone="default">…</PricingTier>

  <PricingTierBanner label="Get 40% off">
    <PricingTier tone="outline">…</PricingTier>
  </PricingTierBanner>
</Pricing>`}
        >
          <PricingBannerDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Action position">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">actionPosition</code> sets where the CTA sits.{" "}
          <code className="font-mono text-sm">bottom</code> (default) pins it to the card foot via{" "}
          <code className="font-mono text-sm">mt-auto</code>, so CTAs line up across cards no matter
          how long each list is. <code className="font-mono text-sm">top</code> lets it sit in flow
          right under the price, with the checklist below: place{" "}
          <code className="font-mono text-sm">PricingTierAction</code> accordingly in the markup.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`{/* Pinned to the foot (default). */}
<PricingTier actionPosition="bottom">
  <PricingPrice>…</PricingPrice>
  <PricingFeatures>…</PricingFeatures>
  <PricingTierAction>…</PricingTierAction>
</PricingTier>

{/* Under the price. Move PricingTierAction up to match. */}
<PricingTier actionPosition="top">
  <PricingPrice>…</PricingPrice>
  <PricingTierAction>…</PricingTierAction>
  <PricingFeatures>…</PricingFeatures>
</PricingTier>`}
        >
          <PricingActionPositionDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Feature states">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every <code className="font-mono text-sm">PricingFeature</code> is one of three states.
          Included rows (the default) get a filled success check. Mark a row{" "}
          <code className="font-mono text-sm">included={"{false}"}</code> for a filled cross and a
          dimmed label, so a single list reads as have vs. have-not. Add a{" "}
          <code className="font-mono text-sm">hint</code> to either to append an info glyph whose
          tooltip carries the caveat or limit, keeping the label terse.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<PricingFeatures>
  {/* Included: success check (the default). */}
  <PricingFeature>Unlimited projects</PricingFeature>

  {/* Included, with a hint: a trailing info glyph reveals the detail on hover/focus. */}
  <PricingFeature hint="Pooled across your whole team, not per seat.">
    100 GB storage
  </PricingFeature>

  {/* Not included: muted minus + dimmed label. */}
  <PricingFeature included={false}>SSO &amp; SAML</PricingFeature>

  {/* A hint composes onto a not-included row too. */}
  <PricingFeature
    included={false}
    hint="Available as a paid add-on, or bundled in the Enterprise plan."
  >
    Dedicated manager
  </PricingFeature>
</PricingFeatures>`}
        >
          <PricingFeatureStatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Features with icons">
        <p className="mt-4 text-pretty text-muted-foreground">
          For a lifetime or all-in bundle, the value isn&apos;t a have vs. have-not checklist, it&apos;s
          a long, categorised inventory. Swap the flat{" "}
          <code className="font-mono text-sm">PricingFeatures</code> for stacked{" "}
          <code className="font-mono text-sm">PricingFeatureGroup</code> sections: each is a centered{" "}
          <code className="font-mono text-sm">Divider</code> header (with an optional{" "}
          <code className="font-mono text-sm">icon</code>) over its own list, and every{" "}
          <code className="font-mono text-sm">PricingFeature</code> carries a contextual{" "}
          <code className="font-mono text-sm">icon</code> that reads neutral (the success-check tint
          stays reserved for the default checklist). The rows sit at full text strength because the
          icon, not a dimmed weight, marks the line, and any row can wrap a link. Here the CTA floats
          under the price with <code className="font-mono text-sm">actionPosition=&quot;top&quot;</code>{" "}
          so the inventory reads beneath it.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<PricingTier featured actionPosition="top" className="max-w-sm">
  <PricingTierHeader>
    <PricingTierName>Lifetime</PricingTierName>
    <PricingTierDescription>One payment. Every Koala UI asset, yours forever.</PricingTierDescription>
  </PricingTierHeader>
  <PricingPrice>
    <PricingAmount>$199</PricingAmount>
    <PricingPeriod>once · no subscription</PricingPeriod>
  </PricingPrice>
  <PricingTierAction>
    <Button>Buy now &amp; use forever</Button>
  </PricingTierAction>

  {/* Each group is a labelled Divider header over its own icon list. */}
  <PricingFeatureGroup label="What's inside">
    <PricingFeature icon={<FigmaLogo weight="bold" />}>
      <a href="#" className="font-medium underline decoration-border underline-offset-4 hover:text-link hover:decoration-link">
        Desktop · Marketing &amp; Product Apps
      </a>
    </PricingFeature>
    <PricingFeature icon={<Package weight="bold" />}>Product Application</PricingFeature>
  </PricingFeatureGroup>

  <PricingFeatureGroup label="All features">
    <PricingFeature icon={<UserCircle weight="bold" />}>
      Up to <strong className="font-semibold text-foreground">1</strong> designer
    </PricingFeature>
    <PricingFeature icon={<Cube weight="bold" />}>
      Access to <strong className="font-semibold text-foreground">5000+</strong> Components
    </PricingFeature>
  </PricingFeatureGroup>

  {/* The label takes a leading icon of its own. */}
  <PricingFeatureGroup label="Some gifts included" icon={<Gift weight="bold" />}>
    <PricingFeature icon={<DiscordLogo weight="bold" />}>Exclusive access to Discord Server</PricingFeature>
  </PricingFeatureGroup>
</PricingTier>`}
        >
          <PricingFeatureGroupsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Billing cycle">
        <p className="mt-4 text-pretty text-muted-foreground">
          The component is stateless: you own the prices, so a billing toggle is a few lines of
          state that swap the <code className="font-mono text-sm">PricingAmount</code> and{" "}
          <code className="font-mono text-sm">PricingPeriod</code>. Because the amount is{" "}
          <code className="font-mono text-sm">tabular-nums</code>, the digits change without the row
          reflowing. Here a <code className="font-mono text-sm">Tabs</code> control drives a{" "}
          <code className="font-mono text-sm">columns={"{2}"}</code> table, and a small{" "}
          <code className="font-mono text-sm">RollingAmount</code> cross-fades and rolls the price so
          the swap reads as smooth instead of a snap.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`// Cross-fades + rolls the price on change. Commit on animationend keeps it interruptible
// and avoids set-state-in-an-effect. The incoming value stays in flow, so the baseline the
// PricingPeriod aligns to never moves.
function RollingAmount({ value }) {
  const [shown, setShown] = React.useState(value)
  const rolling = value !== shown

  return (
    <span className="relative inline-block tabular-nums">
      <span
        key={value}
        onAnimationEnd={rolling ? () => setShown(value) : undefined}
        className={rolling ? "animate-in fade-in slide-in-from-bottom-2 duration-base ease-out" : ""}
      >
        {value}
      </span>
      {rolling && (
        <span
          key={shown}
          aria-hidden
          className="absolute inset-0 animate-out fade-out slide-out-to-top-2 fill-mode-forwards duration-base ease-out"
        >
          {shown}
        </span>
      )}
    </span>
  )
}

function PricingBilling() {
  const [cycle, setCycle] = React.useState("monthly")
  const annual = cycle === "annual"
  const period = annual ? "/mo, billed yearly" : "/month"

  return (
    <div className="flex flex-col items-center gap-8">
      <Tabs value={cycle} onValueChange={setCycle}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">
            Annual
            <Badge variant="success" dot pill size="sm">Save 20%</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Pricing columns={2} className="max-w-2xl">
        <PricingTier featured>
          <PricingTierHeader>
            <div className="flex flex-wrap items-center gap-2">
              <PricingTierName>Pro</PricingTierName>
              <Badge variant="orange" dot pill>Most popular</Badge>
            </div>
            <PricingTierDescription>For teams shipping in production.</PricingTierDescription>
          </PricingTierHeader>
          <PricingPrice>
            <PricingAmount>
              <RollingAmount value={annual ? "$23" : "$29"} />
            </PricingAmount>
            <PricingPeriod>{period}</PricingPeriod>
          </PricingPrice>
          <PricingFeatures>
            <PricingFeature>Unlimited projects</PricingFeature>
            <PricingFeature>Unlimited team members</PricingFeature>
            <PricingFeature>Priority support</PricingFeature>
            <PricingFeature>100 GB storage</PricingFeature>
            <PricingFeature>Custom domains</PricingFeature>
            <PricingFeature>Advanced analytics</PricingFeature>
          </PricingFeatures>
          <PricingTierAction>
            <Button>Start free trial</Button>
          </PricingTierAction>
        </PricingTier>

        <PricingTier>
          <PricingTierHeader>
            <PricingTierName>Business</PricingTierName>
            <PricingTierDescription>For scaling organizations.</PricingTierDescription>
          </PricingTierHeader>
          <PricingPrice>
            <PricingAmount>
              <RollingAmount value={annual ? "$47" : "$59"} />
            </PricingAmount>
            <PricingPeriod>{period}</PricingPeriod>
          </PricingPrice>
          <PricingFeatures>
            <PricingFeature>Everything in Pro</PricingFeature>
            <PricingFeature>SSO &amp; SAML</PricingFeature>
            <PricingFeature>Dedicated manager</PricingFeature>
            <PricingFeature>Audit logs</PricingFeature>
            <PricingFeature>99.9% uptime SLA</PricingFeature>
            <PricingFeature>Custom contracts</PricingFeature>
          </PricingFeatures>
          <PricingTierAction>
            <Button variant="outline">Contact sales</Button>
          </PricingTierAction>
        </PricingTier>
      </Pricing>
    </div>
  )
}`}
        >
          <PricingBillingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Build your plan">
        <p className="mt-4 text-pretty text-muted-foreground">
          Because the component is stateless, the price is just a number you own, so you can drive it
          from anything, including a set of add-on checkboxes. Tick a box and the total{" "}
          <em>counts up</em> to the new figure instead of snapping: a small{" "}
          <code className="font-mono text-sm">useCountUp</code> hook tweens it on{" "}
          <code className="font-mono text-sm">requestAnimationFrame</code> (interruptible, and it
          collapses to an instant settle under <code className="font-mono text-sm">prefers-reduced-motion</code>).
          Each add-on is a full-row <code className="font-mono text-sm">label</code> so the whole row
          is the hit target; the selected row keeps a transparent background, with the brand-coloured
          price keying off the checkbox&apos;s <code className="font-mono text-sm">data-state</code>{" "}
          via <code className="font-mono text-sm">group-has</code>, so there&apos;s no extra state to
          thread.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`// Counts toward \`target\` on every change. setState fires only inside the rAF tick (never
// synchronously in the effect), the tween is interruptible, and it settles instantly under
// prefers-reduced-motion. Easing is easeOutCubic, decelerating into the final value.
function useCountUp(target) {
  const [value, setValue] = React.useState(target)
  const valueRef = React.useRef(target)
  const frameRef = React.useRef(null)

  React.useEffect(() => {
    const from = valueRef.current
    if (from === target) return
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const span = reduce ? 0 : 300
    const start = performance.now()

    function tick(now) {
      const t = span === 0 ? 1 : Math.min(1, (now - start) / span)
      const next = from + (target - from) * (1 - Math.pow(1 - t, 3))
      valueRef.current = next
      setValue(next)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target])

  return value
}

function ConfigurablePlan() {
  const [selected, setSelected] = React.useState({})
  const total = ADDONS.reduce((sum, a) => sum + (selected[a.id] ? a.price : 0), 19)
  const shown = useCountUp(total)

  return (
    <PricingTier featured className="mx-auto w-full max-w-md">
      <PricingTierHeader>
        <PricingTierName>Build your plan</PricingTierName>
        <PricingTierDescription>Start with the essentials and add only what you need.</PricingTierDescription>
      </PricingTierHeader>

      <PricingPrice>
        {/* tabular-nums keeps the digits width-stable while they count */}
        <PricingAmount>\${Math.round(shown)}</PricingAmount>
        <PricingPeriod>/month</PricingPeriod>
      </PricingPrice>

      <div className="border-t border-border pt-5">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Add-ons</p>
        <div className="-mx-2 mt-1 flex flex-col">
          {ADDONS.map((addon) => (
            <label
              key={addon.id}
              htmlFor={addon.id}
              className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-fast ease-out hover:bg-muted/60"
            >
              <Checkbox
                id={addon.id}
                checked={!!selected[addon.id]}
                onCheckedChange={(checked) =>
                  setSelected((prev) => ({ ...prev, [addon.id]: checked === true }))
                }
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{addon.label}</span>
                <span className="block text-xs text-muted-foreground">{addon.description}</span>
              </span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground transition-colors duration-fast ease-out group-has-[[data-state=checked]]:text-brand">
                +\${addon.price}
              </span>
            </label>
          ))}
        </div>
      </div>

      <PricingTierAction>
        <Button>Get started</Button>
      </PricingTierAction>
    </PricingTier>
  )
}`}
        >
          <PricingConfigurableDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Pricing</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The grid container. <code className="font-mono text-sm">columns</code> is{" "}
              <code className="font-mono text-sm">2</code>,{" "}
              <code className="font-mono text-sm">3</code> (default), or{" "}
              <code className="font-mono text-sm">4</code> and sets how many tiers sit in a row at
              the <code className="font-mono text-sm">lg</code> breakpoint; below that the grid
              collapses to two columns, then one. Forwards native{" "}
              <code className="font-mono text-sm">&lt;div&gt;</code> props and{" "}
              <code className="font-mono text-sm">className</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">PricingTier</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              One plan card. <code className="font-mono text-sm">tone</code> is{" "}
              <code className="font-mono text-sm">default</code> (transparent fill),{" "}
              <code className="font-mono text-sm">outline</code> (brand edge),{" "}
              <code className="font-mono text-sm">solid</code> (accent fill, inverse parts), or{" "}
              <code className="font-mono text-sm">muted</code> (grey panel).{" "}
              <code className="font-mono text-sm">actionPosition</code> is{" "}
              <code className="font-mono text-sm">bottom</code> (default) or{" "}
              <code className="font-mono text-sm">top</code>. Pass{" "}
              <code className="font-mono text-sm">featured</code> to anchor the recommended plan with
              a brand ring and elevated shadow (it also sets{" "}
              <code className="font-mono text-sm">data-featured</code>); it is orthogonal to{" "}
              <code className="font-mono text-sm">tone</code>. Pass{" "}
              <code className="font-mono text-sm">asChild</code> to render the whole card as a link.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              PricingTierHeader · PricingTierName · PricingTierDescription
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The header block, the balanced{" "}
              <code className="font-mono text-sm">&lt;h3&gt;</code> plan name, and the muted{" "}
              <code className="font-mono text-sm">&lt;p&gt;</code> description. Drop a{" "}
              <code className="font-mono text-sm">Badge</code> next to the name (in a flex row) to
              label a featured plan.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              PricingPrice · PricingAmount · PricingPeriod
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The baseline-aligned price row, the large headline{" "}
              <code className="font-mono text-sm">PricingAmount</code> (
              <code className="font-mono text-sm">tabular-nums</code>, so swapping plans never
              shifts the layout), and the muted{" "}
              <code className="font-mono text-sm">PricingPeriod</code> suffix (e.g.{" "}
              <code className="font-mono text-sm">/month</code>). The amount accepts text too, e.g.{" "}
              <code className="font-mono text-sm">Custom</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">PricingFeatures · PricingFeature</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The checklist <code className="font-mono text-sm">&lt;ul&gt;</code> and its rows. Each{" "}
              <code className="font-mono text-sm">PricingFeature</code> renders its own leading
              glyph: a filled success check when{" "}
              <code className="font-mono text-sm">included</code> (default), or a filled cross with a
              dimmed label when <code className="font-mono text-sm">included={"{false}"}</code>.
              Override the glyph with the <code className="font-mono text-sm">icon</code> prop. Pass{" "}
              <code className="font-mono text-sm">hint</code> (any node) to append a trailing info
              glyph whose tooltip carries the detail on hover or focus;{" "}
              <code className="font-mono text-sm">hintLabel</code> sets its accessible label
              (defaults to <code className="font-mono text-sm">&quot;More information&quot;</code>).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">PricingFeatureGroup</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A labelled section of features for the &quot;features with icons&quot; layout: a
              centered <code className="font-mono text-sm">Divider</code> header (its{" "}
              <code className="font-mono text-sm">label</code>, plus an optional leading{" "}
              <code className="font-mono text-sm">icon</code>) over a{" "}
              <code className="font-mono text-sm">&lt;ul&gt;</code> of{" "}
              <code className="font-mono text-sm">PricingFeature</code> rows. Stack several inside a
              tier in place of a single flat <code className="font-mono text-sm">PricingFeatures</code>{" "}
              when the value is a long, categorised inventory rather than a have/have-not checklist.
              Rows in a group read at full text strength, and each one&apos;s contextual{" "}
              <code className="font-mono text-sm">icon</code> renders neutral (the success-check tint
              is reserved for the default checklist).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">PricingTierAction</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The CTA wrapper. By default it is bottom-pinned (
              <code className="font-mono text-sm">mt-auto</code>), so buttons line up across cards no
              matter how long each feature list is; set the tier&apos;s{" "}
              <code className="font-mono text-sm">actionPosition=&quot;top&quot;</code> and place it
              under the price to float it instead. Its direct child is stretched to the full card
              width: drop a Koala <code className="font-mono text-sm">Button</code> inside (primary
              for the featured plan, outline for the rest).
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">PricingTierBanner</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              An optional wrapper around a <code className="font-mono text-sm">PricingTier</code> for
              the banner-behind treatment: the card nests inside a brand panel that peeks as a top{" "}
              <code className="font-mono text-sm">label</code> (the only required prop) and a thin
              accent edge. Composes over any <code className="font-mono text-sm">tone</code> and
              stretches to the row height inside a grid.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do I highlight the recommended plan?",
              a: "Pass `featured` to its PricingTier for the brand ring and elevated shadow, drop a `<Badge variant=\"orange\" dot pill>Most popular</Badge>` next to the name in the header, and use a primary Button in its PricingTierAction while the other tiers use `variant=\"outline\"`.",
            },
            {
              q: "How do I show included vs not-included features?",
              a: "Use one PricingFeatures list and mark the unavailable rows with `included={false}`. Included rows get a filled success check; excluded rows get a filled cross and a dimmed label, so the difference is obvious at a glance.",
            },
            {
              q: "How do I group features under headings, with an icon per row?",
              a: "Reach for PricingFeatureGroup instead of a single flat PricingFeatures. Stack one group per section (each takes a `label`, and an optional `icon` beside it); it renders a centered Divider header over its own list. Give each PricingFeature its own `icon` for the contextual glyph. Grouped rows render at full text strength and their custom icons read neutral (the green check tint stays for the default checklist). See the Features with icons example.",
            },
            {
              q: "How do I add a monthly/annual toggle?",
              a: "Pricing is stateless: you own the numbers. Hold the cycle in state (a Tabs control is a good fit) and swap the PricingAmount/PricingPeriod values. The amount is tabular-nums, so the price changes without the row reflowing. See the Billing cycle example.",
            },
            {
              q: "What's the difference between tone and featured?",
              a: "They're independent. `tone` (default/outline/solid/muted) sets the card's surface; `featured` adds the brand ring and elevated shadow that marks the recommended plan. Use `featured` to single out one plan; reach for `tone` (or a PricingTierBanner) when you want a different look across the table. They compose, e.g. `<PricingTier tone=\"solid\" featured>`.",
            },
            {
              q: "How do I keep the CTA and badge readable on a solid card?",
              a: "The solid tone flips the card's own parts to inverse, but the composed Button and Badge are still yours, so give them a light fill. CTA: `<Button variant=\"secondary\" className=\"bg-white text-brand hover:bg-white/90\">` (a primary brand button would disappear into the surface). Badge: `<Badge variant=\"orange\" dot pill className=\"border-transparent bg-white\">` (a plain orange dot-badge washes out against the accent).",
            },
            {
              q: "How many plans can I put in a row?",
              a: "Set `columns` to 2, 3 (default), or 4 on Pricing. It always collapses to two columns at `sm` and one column on mobile, so cards stay legible on every screen.",
            },
            {
              q: "Can a whole plan card be a link?",
              a: "Yes. Pass `asChild` to PricingTier and render an `<a>` (or a Next `<Link>`) as its child; the card's styles compose onto the link. Keep the CTA Button as the primary action either way.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
