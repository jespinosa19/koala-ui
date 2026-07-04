import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { SECTIONS } from "@/components/docs/sections-registry"

export const metadata = { title: "Blog post pages" }

// One entry per full-page layout. Each renders in its own device-frame iframe, so the whole page
// (navbar to footer) responds to the frame width.
const VARIANTS = ["blog-post-1", "blog-post-2", "blog-post-3"] as const

export default function BlogPostPagesPage() {
  return (
    <>
      <DocHeader
        title="Blog post"
        description="Full, ready-to-ship article pages: navbar, header, cover, long-form body, author, related posts, a newsletter CTA, and footer. Three layouts share one article, so they read as a family: a centered classic, a version with a sticky table of contents, and an image-led hero. Every page is a composition of canonical components, so it re-themes across all four themes."
      />

      <div className="flex flex-col gap-8">
        {VARIANTS.map((slug) => {
          const page = SECTIONS[slug]
          return (
            <PreviewFrame
              key={slug}
              id={slug}
              slug={slug}
              label={page.title}
              code={page.code}
              locked={page.locked}
              minHeight={page.minHeight}
            />
          )
        })}
      </div>

      <DocSection title="Built from">
        <p className="mt-4 text-pretty text-muted-foreground">
          A page is a composition, not a new component. Each stacks the canonical{" "}
          <a href="/docs/components/navbar" className="underline underline-offset-4">
            Navbar
          </a>{" "}
          and{" "}
          <a href="/docs/components/footer" className="underline underline-offset-4">
            Footer
          </a>{" "}
          as chrome, a{" "}
          <a href="/docs/components/badge" className="underline underline-offset-4">
            Badge
          </a>{" "}
          for the category, an{" "}
          <a href="/docs/components/avatar" className="underline underline-offset-4">
            Avatar
          </a>{" "}
          byline, a{" "}
          <a href="/docs/components/newsletter-form" className="underline underline-offset-4">
            Newsletter
          </a>{" "}
          card for the CTA, and the same article cards as the{" "}
          <a href="/marketing/sections/blog" className="underline underline-offset-4">
            Blog section
          </a>{" "}
          for the related-posts grid. The body is semantic prose: token-driven headings, a
          brand-ruled pull-quote, a list, and an inline figure with a hairline image outline.
        </p>
      </DocSection>

      <DocSection title="Responsive">
        <p className="mt-4 text-pretty text-muted-foreground">
          The reading column is capped for line length and centered in the gutter. On the table-of-
          contents layout the sticky rail sits beside the article on desktop and drops away below the
          large breakpoint, so the article reads full-width on mobile. The related-posts grid steps
          from three columns to two to one as the frame narrows. Dates and reading times use{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the meta rows stay aligned.
          Resize any preview to watch a full page recompose.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "What is the difference between a page and a section?",
              a: "A section is one full-width slab (a hero, a pricing table, a blog index). A page stacks several of them into a finished screen, with its own navbar and footer. This is the page tier: a blog post from top to bottom, not just the article body.",
            },
            {
              q: "Is the table of contents interactive?",
              a: "Yes. It is a scroll-spy: an IntersectionObserver highlights the heading currently in view and the links jump to each section. Open a preview in a new tab (the arrow in the toolbar) to scroll the full page and watch the active line track.",
            },
            {
              q: "Do the three layouts share content?",
              a: "They share one article, so you can compare the shells directly. In your own project each page takes its post as data: swap the article, the cover, the author, and the related posts for your own.",
            },
            {
              q: "Can I preview a page in another theme?",
              a: "Yes. The preview follows the site theme, so switch it from the top-right to check the header, prose, cover ring, and cards in light, dark, cream, or moonlight.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
