"use client"

import * as React from "react"
import NextLink from "next/link"
import { CaretDown } from "@phosphor-icons/react"

import { Announcement } from "@/components/ui/announcement"
import { AvatarFallback, AvatarImage, AvatarRoot } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { Badge } from "@/components/ui/badge"
import { Button, socialProviders } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Hero,
  HeroActions,
  HeroContent,
  HeroCursor,
  HeroCursors,
  HeroFeature,
  HeroFeatures,
  HeroMedia,
  HeroRating,
  HeroSocialProof,
  HeroSubtitle,
  HeroTitle,
} from "@/components/ui/hero"
import { Link } from "@/components/ui/link"
import { Tooltip } from "@/components/ui/tooltip"
import { HeroCollage } from "./collage"
import { ReactLogo } from "./logos"
import { VideoDialog } from "./video-dialog"

/**
 * hero-section-1: the product hero. A display headline (`HeroTitle size="xl"`) in a column wide
 * enough to hold it on two lines, the buy CTA beside one Preview dropdown (the Figma files, then
 * the live React components), six benefits laid out 3 + 3, the reviewers and their rating, and a
 * collage of live components bleeding past both page edges at the foot of the band. Three
 * multiplayer cursors roam the gutters beside the headline.
 *
 * The collage is the band's last word, so the hero drops its own bottom padding and lets it run
 * into the next section. It is built from the real components (see collage.tsx), so it themes with
 * the page and every piece of it works. Below `lg` it zooms itself down to a 150vw box, and the
 * cursors only show from 80rem, where the gutters can hold them.
 *
 * The Hero is its own full-bleed band and owns its vertical rhythm, so drop it straight onto the
 * page: do NOT wrap it in a Section or SectionContainer or it will be padded twice.
 *
 * Edit the consts below for your own copy. A call site that already holds its copy can hand it in
 * as props (`eyebrow`, `title`, `subtitle`, `benefits`, `faces`, `proof`, `previews`): the layout,
 * the cursors and the collage stay here.
 */

/** The eyebrow: a status badge, then the news it points at. */
export type HeroEyebrow = { badge: string; label: string; href: string }

/** A benefit plays a video of itself (`video`, a YouTube id or link), links to a page (`href`), or just states. */
export type HeroBenefit = { label: string; video?: string; href?: string }

export type HeroFace = {
  initials: string
  name: string
  color: NonNullable<React.ComponentProps<typeof AvatarRoot>["color"]>
  photo: string
}

/** The count beside the faces, and the rating under it. */
export type HeroProof = { label: string; rating: string }

/** The Preview menu: the Figma files first, then the live React components. */
export type HeroPreviews = {
  figma: { label: string; href: string }[]
  react: { label: string; href: string }
}

const EYEBROW: HeroEyebrow = { badge: "Update available", label: "Version 2.0 is here", href: "#" }

const TITLE = "A design system built to feel finished"

const SUBTITLE = "Accessible components and four themes, with the source copied straight into your repo."

/** Where the primary CTA goes: the pricing band further down the page. */
const BUY = { label: "Buy now & use forever", href: "#pricing" }

const PREVIEWS: HeroPreviews = {
  figma: [
    { label: "Desktop", href: "#" },
    { label: "Mobile", href: "#" },
  ],
  react: { label: "React components", href: "#" },
}

const BENEFITS: HeroBenefit[] = [
  { label: "Build and ideate fast" },
  { label: "Light, dark and moonlight in one click" },
  { label: "100+ accessible components" },
  { label: "New sections every month" },
  { label: "Responsive down to 320px" },
  { label: "Never start from zero again" },
]

// Square face crops off the Unsplash CDN so the section renders correctly the moment it lands in
// your project, with no assets to copy. Swap in your own customers.
const FACE_CROP = "q=80&w=160&h=160&auto=format&fit=crop&crop=faces"

const FACES: HeroFace[] = [
  { initials: "AR", name: "Ana Ruiz", color: "brand", photo: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${FACE_CROP}` },
  { initials: "PN", name: "Pedro Núñez", color: "purple", photo: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${FACE_CROP}` },
  { initials: "TB", name: "Tom Becker", color: "teal", photo: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?${FACE_CROP}` },
  { initials: "ML", name: "María López", color: "orange", photo: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${FACE_CROP}` },
  { initials: "DO", name: "Diego Ortega", color: "pink", photo: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?${FACE_CROP}` },
  { initials: "JS", name: "Julia Santos", color: "brand", photo: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?${FACE_CROP}` },
]

const PROOF: HeroProof = { label: "+2,600 teams have joined already", rating: "5.0" }

const FigmaMark = socialProviders.figma.Logo

/**
 * A benefit that leads somewhere wears the in-prose link treatment (underline at rest, `--link` on
 * hover): a video one opens the lightbox, a page one navigates. The plain ones stay plain text, so
 * the underline itself says which lines are worth a click.
 */
function Benefit({ label, video, href }: HeroBenefit) {
  if (video) {
    return (
      <VideoDialog video={video} title={label}>
        <Link variant="prose" asChild>
          <button type="button">{label}</button>
        </Link>
      </VideoDialog>
    )
  }
  if (href) {
    return (
      <Link variant="prose" asChild>
        <NextLink href={href}>{label}</NextLink>
      </Link>
    )
  }
  return label
}

/**
 * The multiplayer cursors, alive. They roam the gutters beside a 72px headline, which on a 64rem
 * hero still runs almost edge to edge, so they wait for 80rem (`@7xl`) before they show; below
 * that there is no gutter to hold them.
 */
function Cursors() {
  return (
    <HeroCursors>
      <HeroCursor color="brand" facing="right" duration={15} className="top-32 left-[8%] @5xl:hidden @7xl:block" labels={["Client", "Founder", "Marketing"]} />
      <HeroCursor
        color="purple"
        duration={18}
        phase={0.4}
        className="top-40 left-[90%] @5xl:hidden @7xl:block"
        labels={["Developer", "Designer", "Product"]}
      />
      <HeroCursor color="success" duration={13} phase={0.7} className="top-116 left-[5%] @5xl:hidden @7xl:block" labels={["You", "Your team"]} />
    </HeroCursors>
  )
}

export function HeroSection1({
  eyebrow = EYEBROW,
  title = TITLE,
  subtitle = SUBTITLE,
  benefits = BENEFITS,
  faces = FACES,
  proof = PROOF,
  previews = PREVIEWS,
}: {
  eyebrow?: HeroEyebrow
  title?: string
  subtitle?: string
  /** Six reads best: the 42rem measure breaks them 3 + 3. */
  benefits?: HeroBenefit[]
  faces?: HeroFace[]
  proof?: HeroProof
  previews?: HeroPreviews
}) {
  return (
    <Hero>
      <Cursors />
      <HeroContent className="max-w-5xl pb-0 sm:pb-0">
        <Announcement asChild>
          <NextLink href={eyebrow.href}>
            <Badge variant="orange" dot pill>
              {eyebrow.badge}
            </Badge>
            {eyebrow.label}
          </NextLink>
        </Announcement>

        <HeroTitle size="xl">{title}</HeroTitle>

        <HeroSubtitle>{subtitle}</HeroSubtitle>

        {/* The row sits at the everyday `md` height, the same as a navbar's actions above it,
            rather than the hero's `xl` default. */}
        <HeroActions size="md">
          <Button asChild>
            <a href={BUY.href}>{BUY.label}</a>
          </Button>
          {/* One "Preview" CTA folds the Figma files and the live React components, so the row reads
              as two choices: buy or look. Both logos ride the trigger, so it says what's inside. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="group">
                <FigmaMark />
                {/* The pair reads as one mark: a tighter step than the button's gap between logo and label. */}
                <ReactLogo className="-ml-1" />
                Preview
                <CaretDown weight="bold" className="size-4 text-muted-foreground caret-turn-fast group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-48">
              <DropdownMenuLabel>Figma</DropdownMenuLabel>
              {/* Every Figma entry wears the Figma mark: the device is the label's job, not a second
                  icon's, and it pairs them with the React item's logo below. */}
              {previews.figma.map(({ label, href }) => (
                <DropdownMenuItem key={label} asChild>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <FigmaMark />
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NextLink href={previews.react.href}>
                  <ReactLogo />
                  {previews.react.label}
                </NextLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </HeroActions>

        {/* A 42rem measure breaks the six benefits 3 + 3; `balance` (36rem) would strand one. */}
        <HeroFeatures className="max-w-2xl">
          {benefits.map((benefit) => (
            <HeroFeature key={benefit.label}>
              <Benefit {...benefit} />
            </HeroFeature>
          ))}
        </HeroFeatures>

        <HeroSocialProof>
          <AvatarGroup size="sm">
            {faces.map(({ initials, name, color, photo }) => (
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
            <span className="text-sm font-medium text-balance text-muted-foreground">{proof.label}</span>
            <HeroRating>
              <span className="font-medium text-muted-foreground">{proof.rating} Ratings</span>
            </HeroRating>
          </div>
        </HeroSocialProof>

        {/* Wider than the column on purpose: the flex column centers it, the band clips both ends.
            Below `lg` the collage zooms itself down to this 150vw box. */}
        <HeroMedia className="w-[150vw] max-w-none lg:w-[114rem]">
          <HeroCollage />
        </HeroMedia>
      </HeroContent>
    </Hero>
  )
}
