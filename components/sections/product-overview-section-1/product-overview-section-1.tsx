"use client"

import * as React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselNext,
  CarouselPrevious,
  CarouselSlide,
} from "@/components/ui/carousel"
import { FieldGroup, FieldGroupLabel } from "@/components/ui/field"
import { RadioGroup, RadioSwatch } from "@/components/ui/radio-group"
import { Rating } from "@/components/ui/rating"
import { Section, SectionContainer } from "@/components/ui/section"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { AddToCart, Assurances, WishlistButton } from "./product-actions"

/**
 * product-overview-section-1: product page with a gallery.
 *
 * The top of a product page in two halves. On the left a swipeable Carousel of square photos with
 * large square thumbnails under it; on the right the buy box: breadcrumb, name, price and rating,
 * a short pitch, colour swatches, a capacity picker with a sold-out option, add to cart beside a
 * wishlist toggle, and a details Accordion that opens on the first panel.
 *
 * The halves stack on a phone with the gallery first. From lg they sit side by side and the gallery
 * sticks to the top of the viewport while the longer buy box scrolls past it.
 */

/** A square crop of an Unsplash photo, with an optional focal-point zoom. */
const shot = (w: number, crop = "") =>
  `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=${w}&h=${w}&q=80${crop}`

// A detail crop of the SAME photo (a focal-point zoom), so the gallery shows one object from closer
// in rather than four different products passing as one.
const detail = (x: number, y: number, z: number) => `&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${z}`

const GALLERY = [
  { crop: "", alt: "Everyday Backpack in navy, standing on a tiled floor" },
  { crop: detail(0.45, 0.35, 2.2), alt: "The padded top handle and main zip" },
  { crop: detail(0.5, 0.62, 2.6), alt: "Water-resistant twill with the woven label" },
  { crop: detail(0.35, 0.5, 1.6), alt: "The front pocket and side profile" },
]

// Colourways are data (the object's real colour), not theme tokens, so each swatch carries its own
// fill, the way a brand mark keeps its colour in every theme.
const COLORS = [
  { value: "navy", label: "Navy", color: "#1f2a44" },
  { value: "charcoal", label: "Charcoal", color: "#3b3d42" },
  { value: "sand", label: "Sand", color: "#cbbba0" },
]

const CAPACITIES = [
  { value: "18", label: "18 L" },
  { value: "24", label: "24 L" },
  { value: "30", label: "30 L · Sold out", soldOut: true },
]

// The square media frame. The 1px edge rides ::after, over the photo, in pure black or white alpha.
const MEDIA =
  "relative aspect-square overflow-hidden rounded-lg bg-muted [transform:translateZ(0)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/5 dark:after:ring-white/10"

const TEXT_LINK = "text-sm font-medium text-link underline-offset-4 hover:underline"

export function ProductOverviewSection1() {
  const [color, setColor] = React.useState("navy")
  const [capacity, setCapacity] = React.useState("24")
  const colorName = COLORS.find((c) => c.value === color)?.label

  return (
    <Section>
      <SectionContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Carousel label="Everyday Backpack photos" className="lg:sticky lg:top-8 lg:self-start">
            <CarouselContent>
              {GALLERY.map(({ crop, alt }) => (
                <CarouselSlide key={alt}>
                  <div className={MEDIA}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
                    <img src={shot(1000, crop)} alt={alt} draggable={false} className="size-full object-cover" />
                  </div>
                </CarouselSlide>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <CarouselIndicators
              variant="thumbnails"
              thumbnailSize="lg"
              dotLabel={(i) => `Show photo ${i + 1}`}
              thumbnails={GALLERY.map(({ crop, alt }) => (
                // eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image
                <img key={alt} src={shot(160, crop)} alt="" draggable={false} loading="lazy" />
              ))}
            />
          </Carousel>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Bags</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Backpacks</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
                Everyday Backpack
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-2xl font-semibold tabular-nums text-foreground">$98</p>
                <span aria-hidden className="h-5 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Rating readOnly value={4.8} size="sm" aria-label="Rated 4.8 out of 5" />
                  <a href="#reviews" className={TEXT_LINK}>
                    212 reviews
                  </a>
                </div>
              </div>
              <p className="text-pretty text-body">
                A 24-litre pack cut from water-resistant recycled twill, with a padded sleeve for a
                16&quot; laptop and a quick-grab front pocket for everything you reach for twice a day.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <FieldGroup>
                <FieldGroupLabel>
                  Color <span className="ml-1 font-normal text-muted-foreground">{colorName}</span>
                </FieldGroupLabel>
                <RadioGroup value={color} onValueChange={setColor} className="flex flex-wrap gap-3">
                  {COLORS.map(({ value, label, color: fill }) => (
                    <RadioSwatch key={value} value={value} label={label} color={fill} />
                  ))}
                </RadioGroup>
              </FieldGroup>

              <FieldGroup>
                <FieldGroupLabel>Capacity</FieldGroupLabel>
                <ToggleGroup
                  type="single"
                  value={capacity}
                  onValueChange={(value) => value && setCapacity(value)}
                  className="flex-wrap"
                >
                  {CAPACITIES.map(({ value, label, soldOut }) => (
                    <ToggleGroupItem key={value} value={value} disabled={soldOut}>
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldGroup>

              <div className="flex gap-3">
                <AddToCart size="xl" className="flex-1" />
                <WishlistButton />
              </div>
              <Assurances />
            </div>

            <Accordion type="single" collapsible defaultValue="details">
              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-pretty text-body">
                    <li>Padded sleeve fits laptops up to 16&quot;</li>
                    <li>Luggage pass-through on the back panel</li>
                    <li>Two side pockets sized for a bottle</li>
                    <li>Weighs 0.9 kg (2 lb) empty</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="materials">
                <AccordionTrigger>Materials &amp; care</AccordionTrigger>
                <AccordionContent>
                  <p className="text-pretty text-body">
                    Recycled polyester twill with a PFC-free water-repellent finish and metal zips.
                    Spot clean with a damp cloth; never machine wash.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
                <AccordionContent>
                  <p className="text-pretty text-body">
                    Ships in 1 to 2 business days. Returns are free within 30 days, as long as the pack
                    comes back unused with its tags.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}
