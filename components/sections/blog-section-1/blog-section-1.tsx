"use client"

import * as React from "react"

import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Section, SectionContainer } from "@/components/ui/section"
import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
} from "@/components/ui/section-header"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/**
 * blog-section-1: the blog index.
 *
 * A category filter over one featured lead story and a grid of article cards. Each card carries a
 * cover, a category tint, the title, a two-line excerpt and an author plus date meta row.
 * The lead sits image beside text on large screens and stacks on smaller ones, while the grid
 * steps from three columns to two to one. Picking a category hides the lead and filters the grid.
 */

type Category = "Product" | "Engineering" | "Design" | "Company"

interface Post {
  slug: string
  category: Category
  title: string
  excerpt: string
  cover: string
  coverAlt: string
  author: { name: string; avatar: string; initials: string }
  date: string
  readingTime: string
}

const cover = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

const avatar = (id: number) => `https://i.pravatar.cc/160?img=${id}`

// One soft Badge tint per topic, drawn from the categorical variants so the chip re-themes.
const TONE: Record<Category, "info" | "purple" | "pink" | "teal"> = {
  Product: "info",
  Engineering: "purple",
  Design: "pink",
  Company: "teal",
}

const CATEGORIES = ["All", "Product", "Engineering", "Design", "Company"] as const

// Index 0 is the featured lead in the "All" view; the rest fill the grid. Every category carries at
// least two stories so a filtered view never collapses to a single lonely card.
const POSTS: Post[] = [
  {
    slug: "rebuilding-search",
    category: "Product",
    title: "How we rebuilt search for the way teams actually work",
    excerpt:
      "The principles, the tradeoffs, and the tooling behind a search index that stays fast and relevant as every workspace keeps growing.",
    cover: cover("1486312338219-ce68d2c6f44d"),
    coverAlt: "Product homepage concept open on a laptop",
    author: { name: "Alex Rivera", avatar: avatar(13), initials: "AR" },
    date: "Jul 2, 2026",
    readingTime: "8 min read",
  },
  {
    slug: "sync-engine",
    category: "Engineering",
    title: "A sync engine that survives a flaky connection",
    excerpt:
      "Local-first writes, a single source of truth, and conflict-free merges: how the sync layer keeps every device honest.",
    cover: cover("1498050108023-c5249f4df085"),
    coverAlt: "Code editor open on a developer's screen",
    author: { name: "Mei Lin", avatar: avatar(32), initials: "ML" },
    date: "Jun 24, 2026",
    readingTime: "6 min read",
  },
  {
    slug: "motion-that-feels-right",
    category: "Design",
    title: "Motion that feels right, not just fast",
    excerpt:
      "Our easing and timing rules, and the small details (hover states, staggered enters) that make every interaction feel considered.",
    cover: cover("1467232004584-a241de8bcf5d"),
    coverAlt: "Minimal designer workspace with a laptop",
    author: { name: "Jonas Berg", avatar: avatar(45), initials: "JB" },
    date: "Jun 17, 2026",
    readingTime: "5 min read",
  },
  {
    slug: "series-b",
    category: "Company",
    title: "We raised our Series B to make teamwork feel effortless",
    excerpt:
      "What the new chapter means for the roadmap, the team, and the thousands of teams already working in Acme.",
    cover: cover("1522202176988-66273c2fd55f"),
    coverAlt: "Team collaborating together in an office",
    author: { name: "Priya Nair", avatar: avatar(24), initials: "PN" },
    date: "Jun 9, 2026",
    readingTime: "4 min read",
  },
  {
    slug: "board-meets-timeline",
    category: "Product",
    title: "One workspace, two views: the board meets the timeline",
    excerpt:
      "Why every project carries both views, and how the same tasks line up as cards for planning and as bars for scheduling.",
    cover: cover("1519222970733-f546218fa6d7"),
    coverAlt: "Bright workspace with a laptop and notebook",
    author: { name: "Sofia Marchetti", avatar: avatar(60), initials: "SM" },
    date: "May 30, 2026",
    readingTime: "7 min read",
  },
  {
    slug: "keyboard-first",
    category: "Engineering",
    title: "Keyboard-first: why every action has a shortcut",
    excerpt:
      "Power users live on the keyboard, so every action ships with a shortcut. The exceptions, and why they earn their place.",
    cover: cover("1504384308090-c894fdcc538d"),
    coverAlt: "Developer reviewing a layout on a screen",
    author: { name: "Daniel Okafor", avatar: avatar(11), initials: "DO" },
    date: "May 21, 2026",
    readingTime: "6 min read",
  },
  {
    slug: "designing-in-the-open",
    category: "Design",
    title: "Designing in the open with our earliest customers",
    excerpt:
      "Sharing rough prototypes with the people who use them, so what we design is what they actually need.",
    cover: cover("1531403009284-440f080d1e12"),
    coverAlt: "Modern studio workspace",
    author: { name: "Hana Kim", avatar: avatar(5), initials: "HK" },
    date: "May 14, 2026",
    readingTime: "5 min read",
  },
  {
    slug: "support-that-scales",
    category: "Company",
    title: "How our team keeps support human at scale",
    excerpt:
      "The rituals and tools behind fast, thoughtful answers, from the first ticket all the way to global rollout.",
    cover: cover("1517077304055-6e89abbf09b0"),
    coverAlt: "Colleagues collaborating at a desk",
    author: { name: "Tomás Duarte", avatar: avatar(68), initials: "TD" },
    date: "May 6, 2026",
    readingTime: "4 min read",
  },
]

/** Milliseconds between one card's entrance and the next. */
const STAGGER_STEP = 70

// The underline is always there but transparent, so hover only fades its color in.
const TITLE_HOVER =
  "underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-base ease-out group-hover:decoration-current"

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background"

function PostMeta({ post }: { post: Post }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-sm text-muted-foreground">
      <AvatarRoot size="sm">
        <AvatarImage src={post.author.avatar} alt="" />
        <AvatarFallback>{post.author.initials}</AvatarFallback>
      </AvatarRoot>
      <span className="font-medium text-foreground">{post.author.name}</span>
      <span aria-hidden className="text-border">
        &middot;
      </span>
      <time className="tabular-nums">{post.date}</time>
      <span aria-hidden className="text-border">
        &middot;
      </span>
      <span className="tabular-nums">{post.readingTime}</span>
    </div>
  )
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <a
      href="#"
      className={cn(
        "group grid animate-stagger-in cursor-pointer grid-cols-1 items-center gap-6 rounded-2xl sm:gap-8 lg:grid-cols-2",
        FOCUS_RING
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-inset ring-foreground/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
        <img
          src={post.cover}
          alt={post.coverAlt}
          className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col items-start gap-4">
        <Badge variant={TONE[post.category]}>{post.category}</Badge>
        <h3 className={cn("text-2xl font-semibold leading-snug text-balance sm:text-3xl", TITLE_HOVER)}>
          {post.title}
        </h3>
        <p className="text-pretty text-muted-foreground">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </a>
  )
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <a
      href="#"
      className={cn("group flex animate-stagger-in cursor-pointer flex-col gap-4 rounded-xl", FOCUS_RING)}
      style={{ animationDelay: `${index * STAGGER_STEP}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-inset ring-foreground/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote placeholder; swap for next/Image */}
        <img
          src={post.cover}
          alt={post.coverAlt}
          className="size-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-2">
        <Badge variant={TONE[post.category]}>{post.category}</Badge>
        <h3 className={cn("text-lg font-semibold leading-snug text-balance", TITLE_HOVER)}>
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </a>
  )
}

export function BlogSection1() {
  const [active, setActive] = React.useState<string>("All")
  const showFeatured = active === "All"
  const visible = showFeatured ? POSTS : POSTS.filter((post) => post.category === active)
  const [featured, ...rest] = visible
  const grid = showFeatured ? rest : visible

  return (
    <Section>
      <SectionContainer>
        <SectionHeader align="center">
          <SectionHeaderText>
            <Badge variant="purple" dot pill>
              Blog
            </Badge>
            <SectionHeaderHeading>From the Acme blog</SectionHeaderHeading>
            <SectionHeaderDescription>
              Product notes, engineering deep-dives, and the thinking behind every release.
            </SectionHeaderDescription>
          </SectionHeaderText>
        </SectionHeader>

        <div className="flex flex-col gap-12">
          {/* Single-select pills. Deselecting falls back to All so a story is always on screen. */}
          <ToggleGroup
            type="single"
            value={active}
            onValueChange={(value) => setActive(value || "All")}
            size="sm"
            className="w-full flex-wrap justify-center gap-2"
            aria-label="Filter articles by category"
          >
            {CATEGORIES.map((category) => (
              <ToggleGroupItem key={category} value={category}>
                {category}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Keyed by the active filter so the stagger replays as the set recomposes. */}
          <div key={active} className="flex flex-col gap-12">
            {showFeatured && featured && <FeaturedPost post={featured} />}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((post, i) => (
                <PostCard key={post.slug} post={post} index={showFeatured ? i + 1 : i} />
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </Section>
  )
}
