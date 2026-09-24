import { Badge } from "@/components/ui/badge"

/**
 * The product tile: a square photo, the name and colourway, and the price. The tile itself never
 * lifts or moves on hover; only the photo eases in behind the fixed copy.
 */

export interface Product {
  id: string
  name: string
  /** The colourway shown in the photo. */
  color: string
  price: number
  /** The pre-sale price, struck through beside `price`. */
  compareAt?: number
  badge?: "New" | "Sale"
  /** A square product photo. */
  image: string
  href?: string
}

/** Listing price: whole dollars stay whole ($98), cents only when there are some. */
const usd = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`)

// `translateZ(0)` promotes the frame so its rounded clip also trims the photo while it scales (a
// composited child otherwise escapes the radius). The 1px edge rides ::after, over the photo, in
// pure black or white alpha so it reads on any shot.
const MEDIA =
  "relative aspect-square overflow-hidden rounded-lg bg-muted [transform:translateZ(0)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-black/5 dark:after:ring-white/10"

const MEDIA_IMG =
  "size-full object-cover transition-[scale] duration-base ease-out group-hover:scale-[1.03] motion-reduce:transition-none"

// A stretched link: the product name is the one real link, and its ::after spans the whole card so
// the photo is clickable too. The focus ring draws on that ::after, so keyboard focus frames the
// whole card.
const STRETCHED_LINK =
  "outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-brand focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-background"

function ProductPrice({ product }: { product: Product }) {
  return (
    <p className="flex shrink-0 items-baseline gap-1.5 text-sm font-medium tabular-nums">
      {product.compareAt != null && (
        <span className="font-normal text-muted-foreground line-through">
          <span className="sr-only">Was </span>
          {usd(product.compareAt)}
        </span>
      )}
      <span className={product.compareAt != null ? "text-destructive-strong" : "text-foreground"}>
        {product.compareAt != null && <span className="sr-only">Now </span>}
        {usd(product.price)}
      </span>
    </p>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col gap-3">
      <div className={MEDIA}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
        <img
          src={product.image}
          alt={`${product.name} in ${product.color.toLowerCase()}`}
          draggable={false}
          loading="lazy"
          className={MEDIA_IMG}
        />
        {product.badge && (
          <Badge variant="overlay" pill className="absolute left-3 top-3">
            {product.badge}
          </Badge>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="line-clamp-2 text-sm font-medium text-pretty text-foreground">
            <a href={product.href ?? "#"} className={STRETCHED_LINK}>
              {product.name}
            </a>
          </h3>
          <p className="truncate text-sm text-muted-foreground">{product.color}</p>
        </div>
        <ProductPrice product={product} />
      </div>
    </article>
  )
}
