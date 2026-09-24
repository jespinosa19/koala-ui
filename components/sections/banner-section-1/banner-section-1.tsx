import { ArrowRight, Megaphone } from "@phosphor-icons/react/ssr"

import { Banner, BannerAction, BannerContent, BannerIcon } from "@/components/ui/banner"

/**
 * banner-section-1: a soft-tinted announcement bar.
 *
 * The tone tints the background while the icon and the action carry the hue, so the bar re-themes
 * across every theme without a single hard-coded colour. It renders bare and full-bleed: put it
 * above the navbar, or at the very top of any page region. `Banner` owns its own dismiss state.
 *
 * On a phone the message wraps under the icon and the action stays inline at the end.
 */
export function BannerSection1() {
  return (
    <Banner variant="purple" dismissible dismissLabel="Dismiss announcement">
      <BannerIcon>
        <Megaphone weight="bold" />
      </BannerIcon>
      <BannerContent>New: two fresh themes just landed.</BannerContent>
      <BannerAction href="#">
        Check it out
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  )
}
