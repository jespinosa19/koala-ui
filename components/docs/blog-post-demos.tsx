"use client"

import * as React from "react"
import { ArrowLeft, XLogo, LinkedinLogo, LinkSimple } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { NewsletterForm } from "@/components/ui/newsletter-form"
import { NavbarDemo } from "@/app/docs/components/navbar/demos"
import { FooterDemo } from "@/app/docs/components/footer/demos"
import { BLOG_POSTS, blogTone, blogCover, BlogCard } from "@/components/docs/section-demos"

/**
 * Blog post PAGES (the page tier of the atomic ladder; see memory `site-ia-tiers`). Where the Blog
 * SECTION is an editorial index of many posts, a blog post page is one finished article: navbar,
 * header, cover, long-form body, author, related posts, a newsletter CTA, and footer. Three layouts
 * share one article (they differ only in the shell), so the page reads as a family:
 *   1. Centered classic  — a centered header over a centered reading column.
 *   2. Table of contents — a sticky TOC + share rail beside the article, with scroll-spy.
 *   3. Image-led hero    — a full-bleed cover with the title overlaid, then the article.
 *
 * Every page composes canonical pieces (Navbar, Footer, Badge, Avatar, NewsletterForm) and reuses
 * the shared Blog data + card from section-demos, so a page tracks the components it is built from
 * (memory `no-reimplementing-component-styles`). Semantic tokens throughout, so all four themes work.
 */

// ── The article ─────────────────────────────────────────────────────────────────────────────────
// One article drives all three layouts. Drawn from the featured Blog post so the "Keep reading"
// grid (the other posts) never repeats the piece you are reading.
const ARTICLE = {
  category: "Product" as const,
  title: "How we built a design system 2,600 teams actually ship with",
  deck: "The principles, the tradeoffs, and the tooling behind a component library that stays consistent as it scales across every product surface.",
  cover: blogCover("1486312338219-ce68d2c6f44d"),
  coverAlt: "A product homepage concept open on a laptop",
  author: { name: "Alex Rivera", role: "Head of Design Systems", img: 13, initials: "AR" },
  date: "Jul 2, 2026",
  readingTime: "8 min read",
}

const TAGS = ["Design systems", "Tokens", "Composition", "React"]

// The in-body headings, in order. The ids anchor both the H2s and the table-of-contents scroll-spy
// (variant 2). Defined once at module scope so the scroll-spy effect has a stable dependency.
const TOC = [
  { id: "the-brief", label: "The brief" },
  { id: "constraints-first", label: "Constraints first" },
  { id: "tokens-over-values", label: "Tokens over values" },
  { id: "composition-not-config", label: "Composition, not configuration" },
  { id: "shipping-finished", label: "Shipping it finished" },
] as const
const TOC_IDS = TOC.map((s) => s.id)

// In-prose hyperlink: the blue --link token, underlined at rest (memory `links-blue-link-token`),
// distinct from the calm foreground→brand UI Link used outside running copy.
const bodyLink =
  "font-medium text-link underline decoration-1 underline-offset-4 transition-colors duration-base ease-out hover:text-link/80"

// ── Shared building blocks ──────────────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <a
      href="#"
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
    >
      <ArrowLeft
        weight="bold"
        className="size-4 transition-transform duration-base ease-out group-hover:-translate-x-0.5"
      />
      Back to blog
    </a>
  )
}

/** Author avatar + name + date · reading time. `onImage` flips the type to white over the hero. */
function Byline({ onImage = false }: { onImage?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <AvatarRoot size="md">
        <AvatarImage src={`https://i.pravatar.cc/160?img=${ARTICLE.author.img}`} alt="" />
        <AvatarFallback>{ARTICLE.author.initials}</AvatarFallback>
      </AvatarRoot>
      <div className="flex flex-col text-left">
        <span className={cn("text-sm font-semibold", onImage ? "text-white" : "text-foreground")}>
          {ARTICLE.author.name}
        </span>
        <span
          className={cn("text-sm tabular-nums", onImage ? "text-white/70" : "text-muted-foreground")}
        >
          {ARTICLE.date} &middot; {ARTICLE.readingTime}
        </span>
      </div>
    </div>
  )
}

/** Icon-only share cluster: ghost buttons melt into the row (memory `no-big-buttons-inside-inputs`). */
function ShareRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="mr-2 text-sm font-medium text-muted-foreground">Share</span>
      <Button variant="ghost" iconOnly tooltip={false} aria-label="Share on X">
        <XLogo weight="bold" />
      </Button>
      <Button variant="ghost" iconOnly tooltip={false} aria-label="Share on LinkedIn">
        <LinkedinLogo weight="bold" />
      </Button>
      <Button variant="ghost" iconOnly tooltip={false} aria-label="Copy link">
        <LinkSimple weight="bold" />
      </Button>
    </div>
  )
}

function TagsShare() {
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <Badge key={tag} variant="secondary" pill>
            {tag}
          </Badge>
        ))}
      </div>
      <ShareRow />
    </div>
  )
}

function AuthorBio() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground sm:flex-row sm:items-start sm:gap-5">
      <AvatarRoot size="xl" className="shrink-0">
        <AvatarImage src={`https://i.pravatar.cc/240?img=${ARTICLE.author.img}`} alt="" />
        <AvatarFallback>{ARTICLE.author.initials}</AvatarFallback>
      </AvatarRoot>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Written by
        </span>
        <span className="text-lg font-semibold text-foreground">{ARTICLE.author.name}</span>
        <p className="text-sm text-pretty text-muted-foreground">
          {ARTICLE.author.role} at Koala. Writing about design systems, tokens, and the craft of
          shipping interfaces that feel finished. Fifteen years turning messy component libraries
          into calm ones.
        </p>
      </div>
    </div>
  )
}

/** Centered closing CTA: heading, lead, and an inline email form, all on the page axis. */
function NewsletterCta() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          Get the next deep dive in your inbox
        </h2>
        <p className="text-pretty text-muted-foreground">
          Product notes, engineering write-ups, and the thinking behind the system. One email a
          month, no spam.
        </p>
      </div>
      <NewsletterForm variant="inline" action="Subscribe" className="w-full max-w-md" />
    </div>
  )
}

function RelatedPosts() {
  const related = BLOG_POSTS.slice(1, 4)
  return (
    <section className="border-t border-border pt-16">
      <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
        Keep reading
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline">
          <a href="#">View all posts</a>
        </Button>
      </div>
    </section>
  )
}

/** Navbar + article + footer. No viewport min-height: the preview iframe auto-sizes to content. */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-background text-foreground">
      <NavbarDemo />
      <main className="flex-1">{children}</main>
      <FooterDemo />
    </div>
  )
}

// ── The article body (shared prose) ─────────────────────────────────────────────────────────────

function ArticleSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <h2
        id={id}
        className="scroll-mt-24 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function ArticleBody() {
  return (
    <div className="flex flex-col gap-10 text-lg leading-8 text-muted-foreground">
      <div className="flex flex-col gap-6">
        <p className="text-xl leading-9 text-pretty text-foreground">
          Two years ago, a design system at our company meant a Figma file nobody fully trusted and
          a component library that three teams had quietly forked. Today more than 2,600 teams ship
          on the same foundation, and design review is no longer the bottleneck it used to be.
        </p>
        <p className="text-pretty">
          None of that came from a big rewrite. It came from a few hundred small decisions about
          where consistency should be cheap and where flexibility should stay expensive.
        </p>
      </div>

      <ArticleSection id="the-brief" title="The brief">
        <p className="text-pretty">
          The mandate was simple to say and hard to do: one system, every surface. Marketing pages,
          the product, internal tools, and the mobile app all had to feel like they came from the
          same company, without slowing any single team down.
        </p>
        <p className="text-pretty">
          We had tried a shared library before and watched it rot. The lesson from that attempt was
          blunt: a component is only shared if it is easier to use than to rebuild. Anything harder
          gets forked on the first tight deadline.
        </p>
      </ArticleSection>

      <ArticleSection id="constraints-first" title="Constraints first">
        <p className="text-pretty">
          So we started with constraints instead of components. Before writing a single button we
          agreed on four themes, one spacing scale, and a fixed set of color roles. Everything
          downstream had to be expressible in those terms or it did not ship.
        </p>
        <figure className="flex flex-col gap-3">
          <img
            src={blogCover("1498050108023-c5249f4df085")}
            alt="A code editor showing the token map"
            className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-inset ring-foreground/10"
          />
          <figcaption className="text-center text-sm text-muted-foreground">
            The token map is the contract. Every component reads from it, so a theme change is one
            file, not a hundred.
          </figcaption>
        </figure>
        <p className="text-pretty">
          Constraints feel limiting for about a week. After that they are the reason a new component
          takes an afternoon instead of a sprint, because most of the decisions are already made.
        </p>
      </ArticleSection>

      <ArticleSection id="tokens-over-values" title="Tokens over values">
        <p className="text-pretty">
          The single most important rule is that components never hard-code a value. They read
          tokens. A card does not know it is twelve pixels of radius; it knows it uses the surface
          radius, whatever that resolves to in the current theme.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6 marker:text-border">
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">Color roles</strong>, not hex. A
            control references foreground, muted, or brand, so it re-themes with no per-component
            work.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">One radius knob</strong>. Nested
            surfaces derive their radius from the parent plus padding, so corners stay concentric.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">Per-theme shadows</strong>. Elevation
            is a token too, tuned once per theme instead of copied around.
          </li>
          <li className="text-pretty">
            <strong className="font-semibold text-foreground">Motion tokens</strong>. Easing and
            duration live in one place, so nothing animates with a stray timing curve.
          </li>
        </ul>
        <blockquote className="border-l-2 border-brand pl-6 text-xl font-medium leading-relaxed text-balance text-foreground">
          If you can change a value in one file and watch every screen update correctly, you have a
          system. If you have to grep for it, you have a library.
        </blockquote>
      </ArticleSection>

      <ArticleSection id="composition-not-config" title="Composition, not configuration">
        <p className="text-pretty">
          The second rule is that we compose, we do not configure. A component exposes named parts
          you assemble, not a dozen boolean props that quietly multiply into untested combinations.
          You can read the full reasoning in our{" "}
          <a href="#" className={bodyLink}>
            architecture guide
          </a>
          .
        </p>
        <p className="text-pretty">
          A card is a header, a body, and a footer you arrange, so a new layout is a rearrangement,
          not a feature request. That single choice is why the library has grown to 89 components
          without the API surface collapsing under its own options.
        </p>
      </ArticleSection>

      <ArticleSection id="shipping-finished" title="Shipping it finished">
        <p className="text-pretty">
          The last rule is the one teams feel the most: everything ships feeling finished. Focus
          states, keyboard support, reduced-motion, and the four themes are done before a component
          is considered done, not filed as follow-ups that never come.
        </p>
        <p className="text-pretty">
          That is the whole trick, really. Make the consistent path the easy path, encode the hard
          parts once, and hand teams pieces that already feel polished. Do that and 2,600 teams will
          ship on your system, not around it.
        </p>
      </ArticleSection>
    </div>
  )
}

// ── Variant 1: Centered classic ─────────────────────────────────────────────────────────────────

export function BlogPostContent() {
  return (
    <PageShell>
      <article className="pb-4">
        <div className="mx-auto max-w-3xl px-6 pt-10 sm:pt-14">
          <BackLink />
        </div>

        <header className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Badge variant={blogTone[ARTICLE.category]}>{ARTICLE.category}</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {ARTICLE.title}
            </h1>
            <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{ARTICLE.deck}</p>
          </div>
          <Byline />
        </header>

        <div className="mx-auto mt-10 max-w-4xl px-6">
          <img
            src={ARTICLE.cover}
            alt={ARTICLE.coverAlt}
            className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-inset ring-foreground/10"
          />
        </div>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-10 px-6">
          <ArticleBody />
          <TagsShare />
          <AuthorBio />
        </div>
      </article>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <NewsletterCta />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <RelatedPosts />
      </div>
    </PageShell>
  )
}

// ── Variant 2: Table of contents ────────────────────────────────────────────────────────────────

/**
 * Highlights the section currently in view. The IntersectionObserver runs in the iframe's own
 * document (the component executes in that realm), and setState only fires from its callback, never
 * the effect body (memory `react-hooks-strict-lint`). `rootMargin` biases the active line toward the
 * heading nearest the top third of the viewport.
 */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = React.useState<string>(ids[0])
  React.useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])
  return active
}

function TableOfContents() {
  const active = useScrollSpy(TOC_IDS)
  return (
    <nav aria-label="On this page" className="flex flex-col gap-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </span>
      <ul className="flex flex-col">
        {TOC.map((section) => {
          const isActive = active === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-sm text-pretty transition-colors duration-base ease-out",
                  isActive
                    ? "border-brand font-medium text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
      <ShareRow className="mt-2 pl-1" />
    </nav>
  )
}

export function BlogPostSidebarContent() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 pt-10 sm:pt-14">
        <BackLink />
      </div>

      <header className="mx-auto mt-6 flex max-w-3xl flex-col items-start gap-5 px-6">
        <Badge variant={blogTone[ARTICLE.category]}>{ARTICLE.category}</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          {ARTICLE.title}
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">{ARTICLE.deck}</p>
        <Byline />
      </header>

      <div className="mx-auto mt-10 max-w-5xl px-6">
        <img
          src={ARTICLE.cover}
          alt={ARTICLE.coverAlt}
          className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-inset ring-foreground/10"
        />
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <TableOfContents />
          </div>
        </aside>
        <div className="flex max-w-3xl flex-col gap-10">
          <ArticleBody />
          <TagsShare />
          <AuthorBio />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <NewsletterCta />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <RelatedPosts />
      </div>
    </PageShell>
  )
}

// ── Variant 3: Image-led hero ───────────────────────────────────────────────────────────────────

export function BlogPostHeroContent() {
  return (
    <PageShell>
      <header className="relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden sm:min-h-[34rem]">
        <img
          src={ARTICLE.cover}
          alt={ARTICLE.coverAlt}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        {/* Bottom-weighted scrim so the white header reads over the brighter top of the photo. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
        />
        <div className="mx-auto w-full max-w-4xl px-6 pb-12 sm:pb-16">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-md">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {ARTICLE.category}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              {ARTICLE.title}
            </h1>
            <p className="max-w-2xl text-lg text-pretty text-white/80">{ARTICLE.deck}</p>
            <Byline onImage />
          </div>
        </div>
      </header>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-10 px-6">
        <ArticleBody />
        <TagsShare />
        <AuthorBio />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <NewsletterCta />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <RelatedPosts />
      </div>
    </PageShell>
  )
}
