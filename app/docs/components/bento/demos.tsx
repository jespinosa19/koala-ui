"use client"

import { Storefront, ChartLineUp, Palette, BookOpen, Stack } from "@phosphor-icons/react"

import {
  Bento,
  BentoItem,
  BentoItemIcon,
  BentoItemTitle,
  BentoItemDescription,
  BentoItemImage,
} from "@/components/ui/bento"

/** The flagship board: two wide tiles over three, each with a screenshot that peeks up. */
export function BentoDemo() {
  return (
    <Bento className="w-full">
      <BentoItem size="md" tone="brand">
        <BentoItemIcon>
          <Storefront weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>Store templates</BentoItemTitle>
        <BentoItemDescription>
          Crafted layouts that highlight product benefits, build trust, and drive conversion.
        </BentoItemDescription>
        <BentoItemImage src="/bento/store.svg" alt="Storefront template preview" unoptimized />
      </BentoItem>

      <BentoItem size="md" tone="teal">
        <BentoItemIcon>
          <ChartLineUp weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>High-converting experience</BentoItemTitle>
        <BentoItemDescription>
          Structures meticulously created for maximum conversion and end-to-end purchasing.
        </BentoItemDescription>
        <BentoItemImage src="/bento/checkout.svg" alt="Checkout flow preview" unoptimized />
      </BentoItem>

      <BentoItem size="sm" tone="purple">
        <BentoItemIcon>
          <Palette weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>Maximum personalization</BentoItemTitle>
        <BentoItemDescription>
          Customize the components to your liking so that each project is unique.
        </BentoItemDescription>
        <BentoItemImage
          src="/bento/personalize.svg"
          alt="Theme personalization panel preview"
          unoptimized
        />
      </BentoItem>

      <BentoItem size="sm" tone="orange">
        <BentoItemIcon>
          <BookOpen weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>Detailed documentation</BentoItemTitle>
        <BentoItemDescription>
          Maintain consistency across projects thanks to our extensive documentation.
        </BentoItemDescription>
        <BentoItemImage src="/bento/docs.svg" alt="Component documentation preview" unoptimized />
      </BentoItem>

      <BentoItem size="sm" tone="pink">
        <BentoItemIcon>
          <Stack weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>All assets in 1 place</BentoItemTitle>
        <BentoItemDescription>
          Avatars, flags, and every asset stay centralized in one place.
        </BentoItemDescription>
        <BentoItemImage src="/bento/assets.svg" alt="Asset library preview" unoptimized />
      </BentoItem>
    </Bento>
  )
}

/** Shows how each `size` claims grid cells, from the tall `feature` tile to the `full` band. */
export function BentoSizesDemo() {
  return (
    <Bento className="w-full">
      <BentoItem size="feature" tone="brand">
        <BentoItemIcon>
          <Storefront weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>feature</BentoItemTitle>
        <BentoItemDescription>Spans 4 columns and 2 rows: the anchor tile.</BentoItemDescription>
      </BentoItem>
      <BentoItem size="sm" tone="purple">
        <BentoItemIcon>
          <Palette weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>sm</BentoItemTitle>
        <BentoItemDescription>Spans 2 columns.</BentoItemDescription>
      </BentoItem>
      <BentoItem size="sm" tone="teal">
        <BentoItemIcon>
          <BookOpen weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>sm</BentoItemTitle>
        <BentoItemDescription>Spans 2 columns.</BentoItemDescription>
      </BentoItem>
      <BentoItem size="full" tone="orange">
        <BentoItemIcon>
          <Stack weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>full</BentoItemTitle>
        <BentoItemDescription>Spans the whole row as a closing band.</BentoItemDescription>
      </BentoItem>
    </Bento>
  )
}
