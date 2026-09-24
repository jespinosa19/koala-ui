"use client"

import {
  Hero,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroActions,
  HeroFeatures,
  HeroFeature,
  HeroSocialProof,
  HeroRating,
} from "@/components/ui/hero"
import { Announcement } from "@/components/ui/announcement"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Tooltip } from "@/components/ui/tooltip"

/**
 * hero-section-1: the centered marketing hero.
 *
 * An announcement eyebrow, a balanced headline and subtitle, a CTA row, a feature checklist and
 * integrated social proof, stacked on one centered axis. The default hero shape, and the one to
 * reach for when the product is explained by its words rather than by a screenshot.
 *
 * The Hero is its own full-bleed band and owns its vertical rhythm, so drop it straight onto the
 * page: do NOT wrap it in a Section or SectionContainer or it will be padded twice.
 *
 * Everything here is yours to edit. The copy, the faces and the feature list are placeholders
 * chosen to be realistic rather than to be kept.
 */

// Square face crops off the Unsplash CDN so the section renders correctly the moment it lands in
// your project, with no assets to copy. Swap in your own customers.
const FACE_CROP = "q=80&w=160&h=160&auto=format&fit=crop&crop=faces"

const FACES = [
  {
    initials: "AR",
    name: "Ana Ruiz",
    color: "brand",
    photo: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${FACE_CROP}`,
  },
  {
    initials: "PN",
    name: "Pedro Núñez",
    color: "purple",
    photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${FACE_CROP}`,
  },
  {
    initials: "TB",
    name: "Tom Becker",
    color: "teal",
    photo: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?${FACE_CROP}`,
  },
  {
    initials: "ML",
    name: "María López",
    color: "orange",
    photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${FACE_CROP}`,
  },
  {
    initials: "DO",
    name: "Diego Ortega",
    color: "pink",
    photo: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?${FACE_CROP}`,
  },
  {
    initials: "JS",
    name: "Julia Santos",
    color: "brand",
    photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?${FACE_CROP}`,
  },
] as const

const FEATURES = [
  "Four themes, switched in one click",
  "89 accessible components",
  "New sections every month",
  "Responsive down to 320px",
]

export function HeroSection1() {
  return (
    <Hero>
      <HeroContent>
        {/*
          The announcement is an eyebrow with a Badge NESTED inside it, not a bare Badge: the
          label and the release are two separate pieces of information, and the eyebrow is the
          part that pairs them.
        */}
        <Announcement>
          Update available
          <Badge variant="orange" dot pill>
            Version 1.0 is here
          </Badge>
        </Announcement>

        <HeroTitle>A design system built to feel finished</HeroTitle>

        <HeroSubtitle>
          Accessible components and four themes, with the source copied straight into your repo.
        </HeroSubtitle>

        <HeroActions>
          <Button>Buy once, use forever</Button>
          <Button variant="outline">Get the Figma kit</Button>
        </HeroActions>

        {/* `balance` breaks four items 2 + 2 instead of stranding the last one on its own row. */}
        <HeroFeatures balance>
          {FEATURES.map((feature) => (
            <HeroFeature key={feature}>{feature}</HeroFeature>
          ))}
        </HeroFeatures>

        <HeroSocialProof>
          <AvatarGroup size="sm">
            {FACES.map(({ initials, name, color, photo }) => (
              <Tooltip key={initials} content={name}>
                {/* The colored fallback matters: a failed image lands on a colored chip, never gray. */}
                <AvatarRoot size="sm" color={color}>
                  <AvatarImage src={photo} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </AvatarRoot>
              </Tooltip>
            ))}
          </AvatarGroup>

          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-balance text-sm font-medium text-muted-foreground">
              +2,600 teams have joined already
            </span>
            <HeroRating>
              <span className="font-medium text-muted-foreground">5.0 Ratings</span>
            </HeroRating>
          </div>
        </HeroSocialProof>
      </HeroContent>
    </Hero>
  )
}
