import { Button } from "@/components/ui/button"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderActions,
  SectionHeaderDescription,
  SectionHeaderHeading,
  SectionHeaderText,
} from "@/components/ui/section-header"

import { ProductCard, type Product } from "./product-card"

/**
 * product-list-section-1: simple product grid.
 *
 * A split lede with a Shop all action over eight products. Each tile is a square photo over the
 * name, colourway and price, and the name is a stretched link, so the whole tile is one target.
 * On hover only the photo eases in; the copy under it holds still.
 *
 * Two columns on a phone, since a store never shows one product per row, and four from lg. The
 * column gap stays tight while the row gap is roomy, so each name reads as belonging to the photo
 * above it rather than the one below.
 */

/** A square crop of an Unsplash photo. Swap `image` for your own product shots. */
const shot = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`

// Everyday objects on pale neutral grounds, so any run of them reads as one catalog.
const PRODUCTS: Product[] = [
  { id: "backpack", name: "Everyday Backpack", color: "Navy", price: 98, image: shot("1553062407-98eeb64c6a62") },
  { id: "watch", name: "Minimal Watch", color: "Chalk", price: 145, badge: "New", image: shot("1523275335684-37898b6baf30") },
  { id: "camera", name: "Instant Camera", color: "Ivory", price: 129, image: shot("1526170375885-4d8ecf77b99f") },
  { id: "headphones", name: "Studio Headphones", color: "Graphite", price: 149, image: shot("1583394838336-acd977736f90") },
  { id: "sunglasses", name: "Classic Sunglasses", color: "Black", price: 68, image: shot("1572635196237-14b3f281503f") },
  { id: "bottle", name: "Insulated Bottle", color: "Sage", price: 34, compareAt: 42, badge: "Sale", image: shot("1602143407151-7111542de6e8") },
  { id: "runner", name: "Knit Runner", color: "Black", price: 120, image: shot("1491553895911-0055eca6402d") },
  { id: "smartwatch", name: "Smart Watch", color: "Midnight", price: 249, image: shot("1546868871-7041f2a55e12") },
]

export function ProductListSection1() {
  return (
    <Section>
      <SectionContainer>
        <SectionHeader orientation="split">
          <SectionHeaderText>
            <SectionHeaderHeading>Trending this week</SectionHeaderHeading>
            <SectionHeaderDescription>
              Everyday objects, made to be used hard and kept for years.
            </SectionHeaderDescription>
          </SectionHeaderText>
          <SectionHeaderActions>
            <Button variant="outline" asChild>
              <a href="#">Shop all</a>
            </Button>
          </SectionHeaderActions>
        </SectionHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </SectionContainer>
    </Section>
  )
}
