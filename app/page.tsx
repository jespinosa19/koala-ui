import { DensityProvider } from "@/lib/density"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { Section } from "@/components/landing/section"
import { SECTIONS } from "@/components/docs/sections-registry"

/**
 * Marketing landing page. Composed straight from the **canonical sections** (the same slabs
 * documented at /marketing/sections/*), pulled in as-is via the sections registry, so the home
 * stays in lockstep with the catalog with no parallel custom implementation to drift. Each slab is
 * wrapped in the shared `Section` band for the page rhythm; the registry component owns the lede +
 * content. Anchor ids preserve the header/footer in-page links (#pricing, #faq, …). The chrome
 * (LandingHeader/LandingFooter) stays the functional landing nav.
 */
const HOME_SECTIONS: { slug: string; id?: string }[] = [
  { slug: "hero-section-1" },
  { slug: "testimonials-section-2" },
  { slug: "feature-section-1", id: "components" },
  { slug: "feature-section-2", id: "video-showcase" },
  { slug: "gallery-section-1", id: "concepts" },
  { slug: "feature-section-3" },
  { slug: "feature-section-4", id: "features" },
  { slug: "cta-section-1", id: "install" },
  { slug: "testimonials-section-1", id: "testimonials" },
  { slug: "stats-section-1" },
  { slug: "pricing-section-1", id: "pricing" },
  { slug: "faq-section-2", id: "faq" },
  { slug: "changelog-section-1", id: "changelog" },
  { slug: "cta-section-2" },
]

export default function Home() {
  return (
    <DensityProvider density="comfortable">
      <LandingHeader />
      <main>
        {HOME_SECTIONS.map(({ slug, id }) => {
          const entry = SECTIONS[slug]
          const SectionSlab = entry.component
          // A self-contained slab already owns its band: its own horizontal gutter / width cap AND
          // vertical rhythm. That is true both for `ownsPadding` bands (Hero, Gallery, Footer) and for
          // `bleed` bars (Banner) - both must render raw on a real page. Drop the wrapping band's
          // padding (`padding="none"`) and its centered gutter (`contained={false}`) so the page rhythm
          // keeps a single owner and the slab is never double-padded. (The preview target makes the same
          // distinction; keep the two in lockstep so a `bleed` slab never double-pads on either surface.)
          const selfContained = entry.ownsPadding || entry.bleed
          return (
            <Section
              key={slug}
              id={id}
              padding={selfContained ? "none" : undefined}
              contained={selfContained ? false : undefined}
            >
              <SectionSlab />
            </Section>
          )
        })}
      </main>
      <LandingFooter />
    </DensityProvider>
  )
}
