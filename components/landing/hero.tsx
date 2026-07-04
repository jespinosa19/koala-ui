import Link from "next/link"
import {
  Megaphone,
  FigmaLogo,
  DeviceMobile,
  ArrowRight,
} from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Hero as HeroRoot,
  HeroContent,
  HeroEyebrow,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroFeatures,
  HeroFeature,
  HeroSocialProof,
  HeroRating,
} from "@/components/ui/hero"
import { HeroSocialAvatars } from "@/components/landing/hero-social-avatars"
import { HERO_FEATURES, SOCIAL_PROOF } from "@/components/landing/data"

/** Landing hero. Structure and content mirror the original koalaui.com hero. */
export function Hero() {
  return (
    <HeroRoot>
      <HeroContent>
        <HeroEyebrow asChild>
          <Link href="#changelog">
            <Badge variant="orange" pill>
              <Megaphone weight="bold" />
              New release
            </Badge>
            <span>Koala UI v1.0 is here</span>
          </Link>
        </HeroEyebrow>

        <HeroTitle>A design system built to feel finished</HeroTitle>

        <HeroSubtitle>
          89 accessible React components and four themes, with the real source copied straight
          into your repo. Assemble production screens in an afternoon, not a sprint.
        </HeroSubtitle>

        <HeroActions>
          <Button asChild size="lg">
            <Link href="#pricing">
              Buy once, use forever
              <ArrowRight weight="bold" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#pricing">
              <FigmaLogo weight="bold" />
              Get the Figma kit
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs">
              <DeviceMobile weight="bold" />
              Browse the docs
            </Link>
          </Button>
        </HeroActions>

        <HeroFeatures>
          {HERO_FEATURES.map((feature) => (
            <HeroFeature key={feature}>{feature}</HeroFeature>
          ))}
        </HeroFeatures>

        <HeroSocialProof>
          <HeroSocialAvatars />
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-sm font-medium text-foreground">
              +{SOCIAL_PROOF.builders} builders have joined already
            </span>
            <HeroRating>
              <span className="font-medium text-foreground tabular-nums">
                {SOCIAL_PROOF.rating}/5 average rating
              </span>
            </HeroRating>
          </div>
        </HeroSocialProof>
      </HeroContent>
    </HeroRoot>
  )
}
