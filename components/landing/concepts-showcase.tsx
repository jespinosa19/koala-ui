"use client"

import * as React from "react"
import {
  House,
  PencilSimpleLine,
  UsersThree,
  Tag,
  Briefcase,
} from "@phosphor-icons/react"

import { Reveal } from "@/components/landing/reveal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Gallery,
  GalleryHeader,
  GalleryTitle,
  GalleryDescription,
  GalleryMasonry,
  GalleryItem,
  GalleryImage,
} from "@/components/ui/gallery"
import { Lightbox, LightboxTrigger, type LightboxImage } from "@/components/ui/lightbox"

/**
 * "Create Multiple Concepts in a Matter of Seconds" — the landing composition of the canonical
 * Gallery section: the DS Tabs switch concept categories, each revealing a full-bleed
 * fake-masonry wall. Content mirrors the original koalaui.com section.
 */
interface Preview {
  src: string
  alt: string
}

interface ConceptTab {
  value: string
  label: string
  icon: React.ReactNode
  previews: Preview[]
}

/** Unsplash crop helper — natural aspect ratios are kept (no `h`), which is what staggers the masonry. */
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=80`

const TABS: ConceptTab[] = [
  {
    value: "home",
    label: "Home",
    icon: <House weight="bold" />,
    previews: [
      { src: img("1486312338219-ce68d2c6f44d"), alt: "Landing page concept on a laptop" },
      { src: img("1498050108023-c5249f4df085"), alt: "Code-forward product homepage" },
      { src: img("1467232004584-a241de8bcf5d"), alt: "Minimal hero layout workspace" },
      { src: img("1499951360447-b19be8fe80f5"), alt: "Bright marketing homepage mockup" },
    ],
  },
  {
    value: "blog",
    label: "Blog article",
    icon: <PencilSimpleLine weight="bold" />,
    previews: [
      { src: img("1455390582262-044cdead277a"), alt: "Long-form article writing setup" },
      { src: img("1481277542470-605612bd2d61"), alt: "Editorial reading layout" },
      { src: img("1503676260728-1c00da094a0b"), alt: "Focused writing desk" },
      { src: img("1432888622747-4eb9a8efeb07"), alt: "Blog draft on a laptop" },
    ],
  },
  {
    value: "about",
    label: "About",
    icon: <UsersThree weight="bold" />,
    previews: [
      { src: img("1522202176988-66273c2fd55f"), alt: "Team collaborating in an office" },
      { src: img("1556761175-5973dc0f32e7"), alt: "Company team portrait" },
      { src: img("1551434678-e076c223a692"), alt: "Founders working together" },
      { src: img("1531403009284-440f080d1e12"), alt: "Modern studio workspace" },
    ],
  },
  {
    value: "pricing",
    label: "Pricing",
    icon: <Tag weight="bold" />,
    previews: [
      { src: img("1460925895917-afdab827c52f"), alt: "Analytics dashboard layout" },
      { src: img("1454165804606-c3d57bc86b40"), alt: "Plan comparison metrics" },
      { src: img("1543286386-713bdd548da4"), alt: "Revenue charts mockup" },
      { src: img("1579621970563-ebec7560ff3e"), alt: "Pricing tier graphs" },
    ],
  },
  {
    value: "careers",
    label: "Careers",
    icon: <Briefcase weight="bold" />,
    previews: [
      { src: img("1497032628192-86f99bcd76bc"), alt: "Open office careers page" },
      { src: img("1517245386807-bb43f82c33c4"), alt: "Hiring desk setup" },
      { src: img("1519389950473-47ba0277781c"), alt: "Team working at their laptops" },
      { src: img("1542744173-8e7e53415bb0"), alt: "Whiteboard planning session" },
    ],
  },
]

export function ConceptsShowcase() {
  return (
    <Gallery id="concepts">
      <Tabs defaultValue="home">
        <GalleryHeader>
          <Reveal className="flex flex-col items-center gap-5">
            <GalleryTitle>Create Multiple Concepts in a Matter of Seconds</GalleryTitle>
            <GalleryDescription>
              Cover virtually any marketing project with our pre-designed sections and templates
              for marketing landing page design.
            </GalleryDescription>
          </Reveal>

          {/* Full-width wrapper so the rail has a definite container to cap against: `w-fit` centers
              it under the lede when the tabs fit, then fills + scrolls as a single row (edge fade)
              once they outgrow the frame, instead of wrapping. */}
          <Reveal delay={75} className="mt-5 w-full">
            <TabsList className="mx-auto flex w-fit gap-1.5">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Reveal>
        </GalleryHeader>

        {TABS.map((tab) => {
          // One Lightbox per tab so the viewer carries that category's images; the captions
          // reuse each preview's alt text.
          const images: LightboxImage[] = tab.previews.map((p) => ({
            src: p.src,
            alt: p.alt,
          }))
          return (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              <Lightbox images={images}>
                <GalleryMasonry>
                  {tab.previews.map((preview, i) => (
                    <Reveal key={preview.src} delay={i * 75} className="mb-4 break-inside-avoid">
                      <LightboxTrigger index={i} asChild>
                        <GalleryItem action="See image" className="mb-0">
                          <GalleryImage src={preview.src} alt={preview.alt} />
                        </GalleryItem>
                      </LightboxTrigger>
                    </Reveal>
                  ))}
                </GalleryMasonry>
              </Lightbox>
            </TabsContent>
          )
        })}
      </Tabs>
    </Gallery>
  )
}
