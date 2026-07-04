"use client"

import * as React from "react"
import {
  Browsers,
  CalendarCheck,
  Clock,
  Crown,
  Cube,
  DeviceMobile,
  DiscordLogo,
  FigmaLogo,
  Gift,
  GraduationCap,
  Lightning,
  MoonStars,
  Package,
  SealPercent,
  SquaresFour,
  Stack,
  Storefront,
  UserCircle,
  Wrench,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { duration } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
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
  PricingFeatureGroup,
  PricingTierAction,
  PricingTierBanner,
  type PricingTierProps,
} from "@/components/ui/pricing"

/** The flagship table: three tiers, the middle one featured with a brand ring + primary CTA. */
export function PricingDemo() {
  return (
    <Pricing className="w-full">
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

      <PricingTier featured>
        <PricingTierHeader>
          <div className="flex flex-wrap items-center gap-2">
            <PricingTierName>Pro</PricingTierName>
            <Badge variant="orange" dot pill>
              Most popular
            </Badge>
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
          <PricingFeature hint="One-hour response time on business days.">
            Priority support
          </PricingFeature>
          <PricingFeature hint="Pooled across your whole team, not per seat.">
            100 GB storage
          </PricingFeature>
          <PricingFeature>Custom domains</PricingFeature>
          <PricingFeature hint="Funnels, retention, and exportable raw events.">
            Advanced analytics
          </PricingFeature>
          <PricingFeature>Custom roles &amp; permissions</PricingFeature>
          <PricingFeature hint="10,000 requests per minute, per workspace.">
            API access
          </PricingFeature>
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
    </Pricing>
  )
}

/* A single "Starter Plan" tier reused across the style demos, so each example varies only the
 * axis it is demonstrating (the surface tone, where the CTA sits) and not the content. */
const STARTER_INCLUDED = [
  "Two design revisions",
  "Email support throughout the project",
  "Personalized color palette selection",
  "Basic furniture arrangement tips",
  "Mood board creation",
  "Access to a curated list of decor recommendations",
]
const STARTER_EXCLUDED = ["Personalized color palette and materials selection", "Space planning and layout suggestions"]

type StarterPlanProps = Pick<PricingTierProps, "tone" | "actionPosition"> & {
  /** The CTA. Defaults to a brand primary "Get started" button. */
  action?: React.ReactNode
  /** Show the "Most popular" badge beside the name. */
  badge?: boolean
  /** Override the badge styles, e.g. a light chip so it holds contrast on the solid surface. */
  badgeClassName?: string
}

function StarterPlan({
  tone,
  actionPosition = "bottom",
  action,
  badge = true,
  badgeClassName,
}: StarterPlanProps) {
  const cta = (
    <PricingTierAction>{action ?? <Button>Get started</Button>}</PricingTierAction>
  )
  return (
    <PricingTier tone={tone} actionPosition={actionPosition}>
      <PricingTierHeader>
        <div className="flex flex-wrap items-center gap-2">
          <PricingTierName>Starter Plan</PricingTierName>
          {badge && (
            <Badge variant="orange" dot pill className={badgeClassName}>
              Most popular
            </Badge>
          )}
        </div>
        <PricingTierDescription>
          A perfect starter package for those looking to refresh their space with expert guidance.
        </PricingTierDescription>
      </PricingTierHeader>
      <PricingPrice>
        <PricingAmount>$49</PricingAmount>
        <PricingPeriod>/month</PricingPeriod>
      </PricingPrice>
      {/* `actionPosition="top"` floats the CTA here, under the price; otherwise it pins to the foot. */}
      {actionPosition === "top" && cta}
      <PricingFeatures>
        {STARTER_INCLUDED.map((f) => (
          <PricingFeature key={f}>{f}</PricingFeature>
        ))}
        {STARTER_EXCLUDED.map((f) => (
          <PricingFeature key={f} included={false}>
            {f}
          </PricingFeature>
        ))}
      </PricingFeatures>
      {actionPosition === "bottom" && cta}
    </PricingTier>
  )
}

/**
 * The four surface tones, orthogonal to `featured`. Each card is labelled with the exact `tone`
 * value below it. `default` is the bare card (transparent fill); `outline` adds a brand edge;
 * `solid` fills the card with the accent and flips every part to inverse text/glyphs (so its CTA is
 * a white button and its badge a light chip, both to hold contrast); `muted` sits the card on a
 * soft grey panel. The CTA's Button variant is the consumer's choice, shown varied here. Rendered
 * two-up (not in a tight four-column row) so each card keeps a readable width.
 */
const TONES: Array<{
  tone: NonNullable<PricingTierProps["tone"]>
  caption: string
  action: React.ReactNode
  badge: boolean
  badgeClassName?: string
}> = [
  {
    tone: "outline",
    caption: "Brand edge on the bare card",
    action: <Button>Get started</Button>,
    badge: true,
  },
  {
    tone: "solid",
    caption: "Accent fill; inverse text, glyphs, CTA and badge",
    action: (
      <Button variant="secondary" className="bg-white text-brand hover:bg-white/90">
        Get started
      </Button>
    ),
    badge: true,
    // Light chip: a plain orange dot-badge would wash out on the accent fill.
    badgeClassName: "border-transparent bg-white",
  },
  {
    tone: "default",
    caption: "Transparent fill, blends with the page",
    action: <Button variant="secondary">Get started</Button>,
    badge: false,
  },
  {
    tone: "muted",
    caption: "Soft grey panel",
    action: <Button className="bg-foreground text-background hover:bg-foreground/90">Get started</Button>,
    badge: false,
  },
]

export function PricingTonesDemo() {
  return (
    <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-2">
      {TONES.map(({ tone, caption, action, badge, badgeClassName }) => (
        <figure key={tone} className="flex flex-col gap-3">
          <StarterPlan tone={tone} action={action} badge={badge} badgeClassName={badgeClassName} />
          <figcaption className="px-1 text-center">
            <code className="font-mono text-sm font-medium text-foreground">tone=&quot;{tone}&quot;</code>
            <span className="mt-0.5 block text-pretty text-xs text-muted-foreground">{caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/**
 * The CTA position. `bottom` (default) pins the button to the card foot via `mt-auto`, so CTAs
 * line up across cards no matter how long each list is; `top` lets it sit in flow right under the
 * price, with the feature checklist below. Place `PricingTierAction` accordingly in the markup.
 */
export function PricingActionPositionDemo() {
  return (
    <Pricing columns={2} className="w-full max-w-2xl">
      <StarterPlan tone="outline" actionPosition="bottom" badge={false} />
      <StarterPlan tone="outline" actionPosition="top" badge={false} />
    </Pricing>
  )
}

/**
 * The "banner behind" treatment: wrap a tier in `PricingTierBanner` and it nests inside a brand
 * panel that peeks as a top label and a thin accent edge all around. It composes over any tone,
 * shown here against a plain (transparent) card, and lines up with an un-bannered neighbour in the grid.
 */
export function PricingBannerDemo() {
  return (
    <Pricing columns={2} className="w-full max-w-2xl">
      <StarterPlan tone="default" badge={false} action={<Button variant="secondary">Get started</Button>} />
      <PricingTierBanner label="Get 40% off">
        <StarterPlan tone="outline" />
      </PricingTierBanner>
    </Pricing>
  )
}

/**
 * The three feature states in one list: an included row (success check), a not-included row
 * (`included={false}`: muted minus + dimmed label), and rows that carry a `hint`: a trailing
 * info glyph whose tooltip holds the extra detail. The info affordance composes onto either
 * state, so a caveat can hang off something you do *or* don't include.
 */
export function PricingFeatureStatesDemo() {
  // A standalone tier (PricingTier provides its own context), so the lone card keeps a readable
  // width instead of being squeezed into one cell of the Pricing grid's `columns`.
  return (
    <PricingTier featured className="mx-auto w-full max-w-sm">
      <PricingTierHeader>
        <PricingTierName>Pro</PricingTierName>
        <PricingTierDescription>One list, every feature state.</PricingTierDescription>
      </PricingTierHeader>
      <PricingFeatures>
        <PricingFeature>Unlimited projects</PricingFeature>
        <PricingFeature>Unlimited team members</PricingFeature>
        <PricingFeature hint="Pooled across your whole team, not per seat.">
          100 GB storage
        </PricingFeature>
        <PricingFeature hint="One-hour response time on business days.">
          Priority support
        </PricingFeature>
        <PricingFeature hint="Funnels, retention, and exportable raw events.">
          Advanced analytics
        </PricingFeature>
        <PricingFeature>Audit logs</PricingFeature>
        <PricingFeature included={false}>SSO &amp; SAML</PricingFeature>
        <PricingFeature
          included={false}
          hint="Available as a paid add-on, or bundled in the Enterprise plan."
        >
          Dedicated manager
        </PricingFeature>
      </PricingFeatures>
      <PricingTierAction>
        <Button>Start free trial</Button>
      </PricingTierAction>
    </PricingTier>
  )
}

/* A "features with icons" inventory, grouped the way a lifetime / all-in bundle reads: not a
 * have/have-not checklist but a long, categorised list where every line carries a contextual
 * glyph. Each row's `icon` reads neutral (the success-check tint is reserved for the default
 * checklist), and rows sit at full text strength because the icon, not a dimmed weight, marks
 * the line. A handful are links: a quiet underline at rest that turns the link blue (text +
 * underline) on hover, via the `--link` role (see /docs/foundations/colors). */
const featureLink =
  "font-medium underline decoration-border underline-offset-4 transition-colors duration-fast ease-out hover:text-link hover:decoration-link"

type GroupFeature = { icon: React.ReactNode; label: React.ReactNode; href?: string }

const LIFETIME_GROUPS: Array<{
  label: string
  icon?: React.ReactNode
  items: GroupFeature[]
}> = [
  {
    label: "What's inside",
    items: [
      { icon: <FigmaLogo weight="bold" />, label: "Desktop · Marketing & Product Apps", href: "#" },
      { icon: <DeviceMobile weight="bold" />, label: "Mobile · iOS / Android Apps", href: "#" },
      { icon: <Package weight="bold" />, label: "Marketing", href: "#" },
      { icon: <Package weight="bold" />, label: "Product Application", href: "#" },
      { icon: <Storefront weight="bold" />, label: "Ecommerce", href: "#" },
    ],
  },
  {
    label: "All features",
    items: [
      {
        icon: <UserCircle weight="bold" />,
        label: (
          <>
            Up to <strong className="font-semibold text-foreground">1</strong> designer
          </>
        ),
      },
      {
        icon: <SquaresFour weight="bold" />,
        label: (
          <>
            Access to <strong className="font-semibold text-foreground">210+</strong> Marketing
            Sections
          </>
        ),
      },
      {
        icon: <Browsers weight="bold" />,
        label: (
          <>
            Access to <strong className="font-semibold text-foreground">30+</strong> Dashboard /
            SaaS Templates
          </>
        ),
      },
      {
        icon: <Stack weight="bold" />,
        label: (
          <>
            <strong className="font-semibold text-foreground">110+</strong> Styles
          </>
        ),
      },
      { icon: <CalendarCheck weight="bold" />, label: "Free lifetime updates" },
      {
        icon: <MoonStars weight="bold" />,
        label: (
          <>
            <strong className="font-semibold text-foreground">4</strong> Themes Available
          </>
        ),
      },
      { icon: <Lightning weight="bold" />, label: "Auto Layout 5.0" },
      {
        icon: <Wrench weight="bold" />,
        label: (
          <>
            <strong className="font-semibold text-foreground">4</strong> Styles &amp; Modes
          </>
        ),
      },
      {
        icon: <Cube weight="bold" />,
        label: (
          <>
            Access to <strong className="font-semibold text-foreground">5000+</strong> Components
          </>
        ),
      },
    ],
  },
  {
    label: "Some gifts included",
    icon: <Gift weight="bold" />,
    items: [
      { icon: <DiscordLogo weight="bold" />, label: "Exclusive access to Discord Server" },
      {
        icon: <SealPercent weight="bold" />,
        label: (
          <>
            Exclusive discounts with our{" "}
            <span className="font-medium text-brand">Partner Program</span>
          </>
        ),
      },
      { icon: <Gift weight="bold" />, label: "Freelance Notion Bundle", href: "#" },
      { icon: <Crown weight="bold" />, label: "Pro membership at Branding Website", href: "#" },
    ],
  },
  {
    label: "Coming soon",
    icon: <Clock weight="bold" />,
    items: [{ icon: <GraduationCap weight="bold" />, label: "Koala University" }],
  },
]

/**
 * The "features with icons" layout: instead of one flat `PricingFeatures` checklist, the value is
 * split into labelled `PricingFeatureGroup` sections (a centred Divider header over an icon list),
 * the shape a lifetime / all-in bundle wants. Every `PricingFeature` carries its own contextual
 * `icon` (rendered neutral, never the success-check green), some rows are links, and the CTA floats
 * under the price via `actionPosition="top"` so the long inventory reads beneath it.
 */
export function PricingFeatureGroupsDemo() {
  return (
    <PricingTier featured actionPosition="top" className="mx-auto w-full max-w-sm">
      <PricingTierHeader>
        <div className="flex flex-wrap items-center gap-2">
          <PricingTierName>Lifetime</PricingTierName>
          <Badge variant="orange" dot pill>
            Best value
          </Badge>
        </div>
        <PricingTierDescription>One payment. Every Koala UI asset, yours forever.</PricingTierDescription>
      </PricingTierHeader>

      <PricingPrice>
        <PricingAmount>$199</PricingAmount>
        <PricingPeriod>once · no subscription</PricingPeriod>
      </PricingPrice>

      <PricingTierAction>
        <Button>Buy now &amp; use forever</Button>
      </PricingTierAction>

      {LIFETIME_GROUPS.map((group) => (
        <PricingFeatureGroup key={group.label} label={group.label} icon={group.icon}>
          {group.items.map((item, i) => (
            <PricingFeature key={i} icon={item.icon}>
              {item.href ? (
                <a href={item.href} className={featureLink}>
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </PricingFeature>
          ))}
        </PricingFeatureGroup>
      ))}
    </PricingTier>
  )
}

/**
 * Cross-fades + rolls the price when it changes: the outgoing number slides up and out while
 * the incoming one rises from below, so monthly⇄annual reads as one smooth swap instead of a
 * snap. Both layers are `tabular-nums` and the incoming value stays in flow, so the baseline
 * the `PricingPeriod` aligns to never moves. Commit happens on `animationend` (no set-state in
 * an effect), keeping it interruptible and within the repo's strict react-hooks lint.
 */
function RollingAmount({ value }: { value: string }) {
  const [shown, setShown] = React.useState(value)
  const rolling = value !== shown

  // Named handler, fired when the incoming layer finishes entering: drop the outgoing layer.
  function commit() {
    setShown(value)
  }

  return (
    <span className="relative inline-block tabular-nums">
      <span
        key={value}
        onAnimationEnd={rolling ? commit : undefined}
        className={cn(rolling && "animate-in fade-in slide-in-from-bottom-2 duration-base ease-out")}
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

/**
 * The billing-cycle pattern: a Tabs control swaps monthly⇄annual prices. The amount is
 * `tabular-nums`, so the digits change without the row reflowing, and a `RollingAmount`
 * cross-fades the swap so the change reads as smooth.
 */
export function PricingBillingDemo() {
  const [cycle, setCycle] = React.useState<"monthly" | "annual">("monthly")

  // Named handler (not an inline arrow); Radix Tabs always emits one of the values.
  function handleCycle(value: string) {
    setCycle(value as "monthly" | "annual")
  }

  const annual = cycle === "annual"
  const pro = annual ? "$23" : "$29"
  const business = annual ? "$47" : "$59"
  const period = annual ? "/mo, billed yearly" : "/month"

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Tabs value={cycle} onValueChange={handleCycle}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">
            Annual
            <Badge variant="success" dot pill size="sm" className="ml-0.5">
              Save 20%
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Pricing columns={2} className="w-full max-w-2xl">
        <PricingTier featured>
          <PricingTierHeader>
            <div className="flex flex-wrap items-center gap-2">
              <PricingTierName>Pro</PricingTierName>
              <Badge variant="orange" dot pill>
                Most popular
              </Badge>
            </div>
            <PricingTierDescription>For teams shipping in production.</PricingTierDescription>
          </PricingTierHeader>
          <PricingPrice>
            <PricingAmount>
              <RollingAmount value={pro} />
            </PricingAmount>
            <PricingPeriod>{period}</PricingPeriod>
          </PricingPrice>
          <PricingFeatures>
            <PricingFeature>Unlimited projects</PricingFeature>
            <PricingFeature>Priority support</PricingFeature>
            <PricingFeature>100 GB storage</PricingFeature>
            <PricingFeature>Custom domains</PricingFeature>
            <PricingFeature>Advanced analytics</PricingFeature>
            <PricingFeature>Unlimited team members</PricingFeature>
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
              <RollingAmount value={business} />
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
}

/**
 * Tweens a number toward `target` on every change, counting through the values in between rather
 * than snapping, so a price visibly climbs (or falls) when an add-on is toggled. The whole thing
 * runs on requestAnimationFrame:
 *   - setState only ever fires inside the rAF tick, never synchronously in the effect, so it stays
 *     within the repo's strict react-hooks lint (no set-state-in-effect).
 *   - it's interruptible: a new target cancels the in-flight tween (cleanup) and the next one
 *     starts from wherever the count currently sits (`valueRef`), so rapid toggles never jump.
 *   - it honours `prefers-reduced-motion` by collapsing the duration to 0 (a single settling tick).
 * Easing is `easeOutCubic`, the cheap cousin of our `--ease-out`, decelerating into the final value.
 */
function useCountUp(target: number) {
  const [value, setValue] = React.useState(target)
  const valueRef = React.useRef(target)
  const frameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const from = valueRef.current
    if (from === target) return

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const span = reduce ? 0 : duration.base
    const start = performance.now()

    function tick(now: number) {
      const t = span === 0 ? 1 : Math.min(1, (now - start) / span)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (target - from) * eased
      valueRef.current = next
      setValue(next)
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target])

  return value
}

const PLAN_BASE = 19
const ADDONS = [
  {
    id: "revisions",
    label: "Extra design revisions",
    description: "Five rounds instead of two.",
    price: 8,
  },
  {
    id: "support",
    label: "Priority support",
    description: "One-hour response on business days.",
    price: 12,
  },
  {
    id: "analytics",
    label: "Advanced analytics",
    description: "Funnels, retention, and exports.",
    price: 10,
  },
  {
    id: "domain",
    label: "Custom domain",
    description: "Bring your own domain.",
    price: 6,
  },
]

/**
 * A configurable plan: a base price plus a checklist of add-ons, each with its own monthly cost.
 * Ticking a box adds its price to the total, which counts up to the new figure (see `useCountUp`)
 * instead of snapping. Polish applied:
 *   - the total is `tabular-nums`, so the digits change width-stably while counting (#9).
 *   - each add-on is a full-row `<label>` (well past the 40px min hit area, #16), with a
 *     `cursor-pointer` and a neutral `hover` wash; the selected row keeps a transparent background,
 *     with only the checkbox fill and a brand-coloured price marking it, all on specific
 *     `transition-colors` (never `transition: all`, #14). The price colour keys off the Radix
 *     checkbox's `data-state` via `group-has`, so there's no extra state to thread through.
 *   - the row radius (`rounded-lg`) nests inside the card's `rounded-2xl`; the Checkbox brings its
 *     own press-scale and draw-on-check animation.
 */
export function PricingConfigurableDemo() {
  const uid = React.useId()
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  // Named handler (no set-state in render); Radix emits boolean | "indeterminate".
  function toggle(id: string, checked: boolean | "indeterminate") {
    setSelected((prev) => ({ ...prev, [id]: checked === true }))
  }

  const total = ADDONS.reduce((sum, a) => sum + (selected[a.id] ? a.price : 0), PLAN_BASE)
  const shown = useCountUp(total)

  return (
    <PricingTier featured className="mx-auto w-full max-w-md">
      <PricingTierHeader>
        <PricingTierName>Build your plan</PricingTierName>
        <PricingTierDescription>
          Start with the essentials and add only what you need.
        </PricingTierDescription>
      </PricingTierHeader>

      <PricingPrice>
        <PricingAmount>${Math.round(shown)}</PricingAmount>
        <PricingPeriod>/month</PricingPeriod>
      </PricingPrice>

      <div className="border-t border-border pt-5">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Add-ons
        </p>
        <div className="-mx-2 mt-1 flex flex-col">
          {ADDONS.map((addon) => {
            const inputId = `${uid}-${addon.id}`
            return (
              <label
                key={addon.id}
                htmlFor={inputId}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5",
                  // Background stays transparent in the selected state; the checkbox fill and the
                  // brand-coloured price carry the selection. Only a neutral hover wash, no tint.
                  "transition-colors duration-fast ease-out hover:bg-muted/60",
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={!!selected[addon.id]}
                  onCheckedChange={(checked) => toggle(addon.id, checked)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-foreground">
                    {addon.label}
                  </span>
                  <span className="block text-pretty text-xs text-muted-foreground">
                    {addon.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-sm font-medium tabular-nums text-muted-foreground",
                    "transition-colors duration-fast ease-out group-has-[[data-state=checked]]:text-brand",
                  )}
                >
                  +${addon.price}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      <PricingTierAction>
        <Button>Get started</Button>
      </PricingTierAction>
    </PricingTier>
  )
}
