"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { X } from "@phosphor-icons/react/ssr"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"

/**
 * Festive confetti: tuned for the short, wide banner bar. The pieces are spawned imperatively
 * (no React state churn for ~16 short-lived nodes), each tumbling along a randomized vector and
 * self-removing on `animationend`. Colors cycle the `--banner-confetti-*` tokens, so they re-tint
 * with the festive palette. Geometry (spread/lift/spin) is per-piece randomness, not a design
 * token, so it's fine to compute here; the cadence and easing stay in the token layer.
 */
const CONFETTI_COUNT = 16
// Pieces cycle three colors, applied via the `data-c` index in globals.css (not inline) so the
// `--banner-confetti-*` tokens survive CSS optimization. See the rules there.
const CONFETTI_COLOR_COUNT = 3
// Class kept as a literal so Tailwind's scanner generates these utilities even though the node is
// created imperatively. transform/opacity only (GPU), with will-change for the first frame (#15).
const CONFETTI_PIECE_CLASS =
  "pointer-events-none absolute h-2 w-1 rounded-xs will-change-transform animate-banner-confetti"
const ICON_POP_CLASS = "animate-banner-pop"
const CONFETTI_SPREAD_X = 80

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Banner: a full-bleed announcement / promo bar that sits above the navbar (or atop a
 * page region). Multi-part like Card: one `tv` recipe with `slots`, shared variant flowing
 * to every part through React Context. Tones are "soft" - a tinted background with the icon,
 * message, and action all carrying the hue - so the whole bar reads as one tone and re-themes
 * across all four themes. Dismissal is built in (uncontrolled by default). `appearance="festive"`
 * paints a flat, saturated celebration bar (themeable via the `--banner-festive-via` token);
 * `confetti` makes it interactive (a burst on mount and on every click); and `BannerOrnament`
 * peeks a decorative flag/mascot in from an edge, clipped to the bar.
 *
 * polish applied:
 *   #4  - the confetti burst + the mount icon pop are keyframes (token layer), not transitions.
 *   #12 - the close button uses active:scale-[0.96]
 *   #14 - transitions name exact properties, never "all"
 *   #15 - confetti pieces carry will-change:transform (GPU-composited transform/opacity only).
 *   Reduced motion - confetti never fires under prefers-reduced-motion.
 *   Hit area - the close button extends its tap target with a before pseudo-element.
 */
export const bannerVariants = tv({
  slots: {
    // `isolate` + `overflow-hidden`: own stacking context so the `-z-10` confetti/ornament layers
    // sit above the background bed yet below the message, and decorations clip to the bar's box.
    root: ["relative w-full isolate overflow-hidden", "transition-colors duration-base ease-out"],
    // The max-width container. flex-wrap keeps the message + action on one row on desktop
    // and lets them stack gracefully on narrow screens. Justify/text-align come from `align`.
    inner: [
      "mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1",
      "px-6 py-2.5 text-sm",
    ],
    icon: "shrink-0 [&_svg]:size-4",
    // Tone-tinted message: the variant's `--banner-tone` mixed toward `--foreground`. The mix
    // ratio is theme-aware via `--banner-ink-mix` so contrast holds both ways: on light themes a
    // high tone share yields a deep tint (dark blue / purple ...); on dark themes (`dark:` also
    // covers moonlight) a low tone share pulls the ink toward the light foreground, keeping it
    // readable even for `brand`, whose accent lightness does NOT re-theme like the semantic tones.
    // `default` sets `--banner-tone` to `--foreground`, so this resolves to plain foreground.
    content: [
      "text-pretty",
      "[--banner-ink-mix:70%] dark:[--banner-ink-mix:45%]",
      "text-[color-mix(in_oklab,var(--banner-tone)_var(--banner-ink-mix),var(--foreground))]",
    ],
    action: [
      "inline-flex items-center gap-1 rounded-sm font-medium underline underline-offset-4",
      "transition-opacity duration-fast ease-out hover:opacity-80",
      "outline-none focus-visible:ring-2 focus-visible:ring-current/40",
      "[&_svg]:size-4",
    ],
    close: [
      "absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md",
      "text-foreground/50",
      "transition-[color,background-color,scale] duration-fast ease-out",
      "active:scale-[0.96]",
      "hover:bg-foreground/10 hover:text-foreground",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
      // polish: extend the tap target past the 28px glyph without enlarging the visual.
      "before:absolute before:-inset-1.5 before:content-['']",
      "[&_svg]:pointer-events-none [&_svg]:size-4",
    ],
    // Decorative ornament that peeks in from an edge (a flag, mascot, emoji) and clips to the bar.
    // Absolute + `-z-10` so it sits behind the message; positioned against the bottom edge, with the
    // side + tilt added per-instance by BannerOrnament. Pairs best with a centered, festive bar.
    ornament: [
      "pointer-events-none absolute bottom-0 -z-10 flex items-end select-none",
      "translate-y-[28%]",
    ],
  },
  variants: {
    // Soft tones: tinted background with a hued icon + action and a darkened, tone-tinted message.
    // Each tone publishes its hue as `--banner-tone`; the `content` slot mixes that toward
    // `--foreground`, so the message reads as a deep tint (dark blue, dark purple ...) on light
    // themes and a bright tint on dark ones, while the icon and action keep the pure hue. The
    // `default` tone resolves `--banner-tone` to `--foreground`, leaving its message neutral.
    variant: {
      default: { root: "bg-muted text-foreground [--banner-tone:var(--foreground)]", icon: "text-muted-foreground", action: "text-foreground" },
      brand: { root: "bg-brand/10 text-foreground [--banner-tone:var(--brand)]", icon: "text-brand", action: "text-brand" },
      purple: { root: "bg-purple/10 text-foreground [--banner-tone:var(--purple)]", icon: "text-purple", action: "text-purple" },
      pink: { root: "bg-pink/10 text-foreground [--banner-tone:var(--pink)]", icon: "text-pink", action: "text-pink" },
      teal: { root: "bg-teal/10 text-foreground [--banner-tone:var(--teal)]", icon: "text-teal", action: "text-teal" },
      orange: { root: "bg-orange/10 text-foreground [--banner-tone:var(--orange)]", icon: "text-orange", action: "text-orange" },
      info: { root: "bg-info/10 text-foreground [--banner-tone:var(--info)]", icon: "text-info", action: "text-info" },
      success: { root: "bg-success/10 text-foreground [--banner-tone:var(--success)]", icon: "text-success", action: "text-success" },
      warning: { root: "bg-warning/10 text-foreground [--banner-tone:var(--warning)]", icon: "text-warning", action: "text-warning" },
      destructive: { root: "bg-destructive/10 text-foreground [--banner-tone:var(--destructive)]", icon: "text-destructive", action: "text-destructive" },
    },
    // Fill style. `soft` (default) uses the tinted tone above. `solid` paints a full surface;
    // only `default` (a theme-flipping inverse bar) and `brand` (a theme-constant accent bar)
    // are supported, because the hue tokens change lightness per theme and would lose contrast
    // against fixed text. See the solid compoundVariants below. `festive` is the playful bar: a
    // flat, saturated fill (the deep `--banner-festive-via` stop) under white text, independent of
    // the tone `variant`. Override the CSS var to theme it (brand / flag colors); the default lives
    // in the token layer (globals.css) and is deep enough to hold white text across every theme.
    appearance: {
      soft: {},
      solid: {},
      festive: {
        root: [
          "text-white",
          // Flat, saturated fill (no gradient): the deep `via` stop, kept dark enough that white
          // text holds contrast across every theme and any custom `--banner-festive-*` palette.
          "bg-[var(--banner-festive-via)]",
        ],
        // Slightly heavier weight buys readability on the saturated fill without a scrim.
        content: "text-white font-medium",
        icon: "text-white",
        action: "text-white hover:opacity-80 focus-visible:ring-white/60",
        close: "text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/60",
      },
    },
    // Layout. `center` is the classic centered announcement; `between` pushes the message to
    // the left and the action(s) to the right (message-left / CTA-right bars).
    align: {
      center: { inner: "justify-center text-center" },
      // Desktop: message left, action right. The message takes `flex-1` so it fills the gap and
      // pins the action to the right edge (the `between` look) without `justify-between`, which
      // would otherwise spread the items apart once the row wraps. Below `sm`, the action wraps to
      // its own full-width row beneath the message+icon, a comfortable mobile CTA instead of a
      // button squeezed next to wrapping text. (`pr-12` from the dismissible compound keeps that
      // full-width action clear of the absolute close button.)
      between: {
        inner: "text-left max-sm:gap-y-3 max-sm:[&>:last-child]:basis-full",
        content: "min-w-0 flex-1",
      },
    },
    // Padding declared via compoundVariants below so it can adapt to alignment.
    dismissible: {
      true: {},
    },
  },
  compoundVariants: [
    // Solid: neutral inverse bar (dark-on-light / light-on-dark, flips with the theme).
    {
      appearance: "solid",
      variant: "default",
      class: {
        root: "bg-foreground text-background",
        icon: "text-background/80",
        content: "text-background",
        action: "text-background hover:opacity-80 focus-visible:ring-background/50",
        close: "text-background/70 hover:bg-background/10 hover:text-background focus-visible:ring-background/50",
      },
    },
    // Solid: brand accent bar. `brand` is constant across themes, so white text stays legible.
    {
      appearance: "solid",
      variant: "brand",
      class: {
        root: "bg-brand text-white",
        icon: "text-white",
        content: "text-white",
        action: "text-white hover:opacity-80 focus-visible:ring-white/60",
        close: "text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-white/60",
      },
    },
    // Keep the centered message clear of the absolute close button on both sides.
    { dismissible: true, align: "center", class: { inner: "px-12" } },
    // Left-aligned bars only need room on the right where the close button sits. Below `sm` the
    // action wraps to its own row (see the `between` align), so the close pins to the top next to
    // the message block instead of floating at the now-taller banner's vertical center.
    {
      dismissible: true,
      align: "between",
      class: { inner: "pr-12", close: "max-sm:top-3 max-sm:translate-y-0" },
    },
  ],
  defaultVariants: {
    variant: "default",
    appearance: "soft",
    align: "center",
  },
})

type BannerSlots = ReturnType<typeof bannerVariants>
const [BannerProvider, useBannerContext] = createContext<{ slots: BannerSlots }>("Banner")

export interface BannerProps
  extends Omit<React.ComponentProps<"div">, "onChange">,
    VariantProps<typeof bannerVariants> {
  /** Controlled visibility. Omit for the built-in uncontrolled behavior. */
  open?: boolean
  /** Uncontrolled initial visibility. Defaults to `true`. */
  defaultOpen?: boolean
  /** Fires when the banner is dismissed (or otherwise toggled when controlled). */
  onOpenChange?: (open: boolean) => void
  /** Render a trailing dismiss button that hides the banner. */
  dismissible?: boolean
  /** Accessible label for the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string
  /**
   * Playful confetti: bursts once on mount (the icon gives a little pop) and again on every click
   * of the bar (confetti only - the icon stays still). Decorative, themed by the
   * `--banner-confetti-*` tokens. Designed to pair with `appearance="festive"`. Honors reduced-motion.
   */
  confetti?: boolean
}

/**
 * Parts are exported individually (not `Banner.Icon` dot-notation) so they survive the RSC
 * server→client boundary. Compose as
 * `<Banner><BannerIcon/><BannerContent/><BannerAction/></Banner>`.
 */
export function Banner({
  className,
  variant,
  appearance,
  align,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  dismissible = false,
  dismissLabel = "Dismiss",
  confetti = false,
  onClick,
  children,
  ...props
}: BannerProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const confettiRef = React.useRef<HTMLSpanElement>(null)

  // Named handler (not an inline arrow setting state) to satisfy the strict react-hooks lint.
  function handleDismiss() {
    if (controlledOpen === undefined) setInternalOpen(false)
    onOpenChange?.(false)
  }

  // Spawn one confetti burst from (x, y) within the layer; defaults to its center (the mount burst).
  // Stable across renders (reads only the ref + module constants), so it's a safe effect dependency.
  const fireConfetti = React.useCallback((originX?: number, originY?: number, popIcon = false) => {
    const layer = confettiRef.current
    if (!layer || prefersReducedMotion()) return
    const { width, height } = layer.getBoundingClientRect()
    const x = originX ?? width / 2
    const y = originY ?? height / 2

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const piece = document.createElement("span")
      piece.className = CONFETTI_PIECE_CLASS
      piece.dataset.c = String(i % CONFETTI_COLOR_COUNT) // color, via the CSS rules in globals.css
      piece.style.left = `${x}px`
      piece.style.top = `${y}px`
      // Wide horizontal fan, biased upward past the bar so pieces rise and clip out as they fade.
      piece.style.setProperty("--cx", `${(Math.random() - 0.5) * 2 * CONFETTI_SPREAD_X}px`)
      piece.style.setProperty("--cy", `${-(Math.random() * (height + 16) + 8)}px`)
      piece.style.setProperty("--cr", `${(Math.random() - 0.5) * 720}deg`)
      piece.addEventListener("animationend", () => piece.remove(), { once: true })
      layer.appendChild(piece)
    }

    // The icon pops only on the mount burst; a click showers confetti but leaves the icon still.
    if (!popIcon) return
    // Re-arm the icon pop: a CSS animation only replays if removed, reflowed, then re-added.
    const icon = layer.parentElement?.querySelector<HTMLElement>('[data-slot="banner-icon"]')
    if (icon) {
      icon.classList.remove(ICON_POP_CLASS)
      void icon.offsetWidth
      icon.classList.add(ICON_POP_CLASS)
    }
  }, [])

  // One celebratory burst when the bar mounts. requestAnimationFrame keeps it off the commit frame
  // (and out of the strict "no setState in effect" path — this only touches the DOM, never state).
  React.useEffect(() => {
    if (!confetti) return
    const raf = requestAnimationFrame(() => fireConfetti(undefined, undefined, true))
    return () => cancelAnimationFrame(raf)
  }, [confetti, fireConfetti])

  function handleRootClick(event: React.MouseEvent<HTMLDivElement>) {
    onClick?.(event)
    if (!confetti) return
    const layer = confettiRef.current
    if (!layer) return
    const rect = layer.getBoundingClientRect()
    fireConfetti(event.clientX - rect.left, event.clientY - rect.top)
  }

  if (!open) return null

  const slots = bannerVariants({ variant, appearance, align, dismissible })
  return (
    <BannerProvider slots={slots}>
      <div
        data-slot="banner"
        className={slots.root({
          className: cn(confetti && "cursor-pointer select-none", className),
        })}
        onClick={handleRootClick}
        {...props}
      >
        {confetti && (
          // Clips the swarm to the bar's rounded box; decorative, so hidden from assistive tech.
          <span
            ref={confettiRef}
            data-slot="banner-confetti"
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          />
        )}
        <div data-slot="banner-inner" className={slots.inner()}>
          {children}
        </div>
        {dismissible && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={handleDismiss}
            className={slots.close()}
          >
            <X weight="bold" />
          </button>
        )}
      </div>
    </BannerProvider>
  )
}

/** Leading icon area; tints to the banner's tone. */
export function BannerIcon({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useBannerContext("BannerIcon")
  return <span data-slot="banner-icon" className={slots.icon({ className })} {...props} />
}

/** The announcement message. */
export function BannerContent({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useBannerContext("BannerContent")
  return <span data-slot="banner-content" className={slots.content({ className })} {...props} />
}

export interface BannerActionProps extends React.ComponentProps<"a"> {
  /** Render the action onto a child element (e.g. a Next.js `<Link>`) via Radix Slot. */
  asChild?: boolean
}

/** The inline call-to-action link; tints to the banner's tone. */
export function BannerAction({ className, asChild = false, ...props }: BannerActionProps) {
  const { slots } = useBannerContext("BannerAction")
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="banner-action" className={slots.action({ className })} {...props} />
}

export interface BannerOrnamentProps extends React.ComponentProps<"span"> {
  /** Which edge the ornament peeks in from. Defaults to `left`. */
  side?: "left" | "right"
}

/**
 * A decorative element (a flag, mascot, emoji ...) that peeks in from an edge and clips to the bar,
 * sitting behind the message. Purely decorative, so `aria-hidden` and non-interactive. Place it as
 * a child of `Banner`; it anchors to the bar (not the content) and tilts away from its edge. Best on
 * a centered, festive bar. Size the content via the child's own className.
 */
export function BannerOrnament({ side = "left", className, ...props }: BannerOrnamentProps) {
  const { slots } = useBannerContext("BannerOrnament")
  return (
    <span
      data-slot="banner-ornament"
      data-side={side}
      aria-hidden
      className={slots.ornament({
        className: cn(side === "left" ? "left-4 -rotate-12" : "right-4 rotate-12", className),
      })}
      {...props}
    />
  )
}
