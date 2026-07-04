"use client"

import * as React from "react"
import {
  TextB,
  TextItalic,
  TextUnderline,
  CurrencyDollar,
  Sun,
  Megaphone,
  ArrowRight,
  Lightning,
  GitBranch,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BadgeGroup } from "@/components/ui/badge-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Stat,
  StatHeader,
  StatLabel,
  StatValue,
  StatTrend,
  StatCaption,
  StatFooter,
  StatIcon,
  StatSparkline,
} from "@/components/ui/stat"
import {
  Chart,
  ChartArea,
  ChartLine,
  ChartGrid,
  ChartXAxis,
  ChartYAxis,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Ranking,
  RankingHeader,
  RankingTitle,
  RankingList,
  RankingItem,
  RankingRank,
  RankingContent,
  RankingLabel,
  RankingValue,
  RankingBar,
} from "@/components/ui/ranking"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/avatar-group"
import {
  Testimonial,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
} from "@/components/ui/testimonials"
import {
  FileCard,
  FileCardIcon,
  FileCardContent,
  FileCardName,
  FileCardMeta,
} from "@/components/ui/file-card"
import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"
import {
  Conversation,
  Message,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageTyping,
} from "@/components/ui/chat"
import {
  PricingTier,
  PricingTierHeader,
  PricingTierName,
  PricingPrice,
  PricingAmount,
  PricingPeriod,
  PricingFeatures,
  PricingFeature,
  PricingTierAction,
} from "@/components/ui/pricing"
import { OTPInput } from "@/components/ui/otp-input"
import { ColorPicker, ColorPickerArea, ColorPickerControls } from "@/components/ui/color-picker"
import { LoginForm } from "@/components/ui/auth-form"

/**
 * The "89 components, ready to use" wall. Every tile is a real, working Koala component, and each
 * reads as exactly ONE bounded card. Components that bring their own surface (Stat, Chart, the
 * login card, Pricing, Testimonial, FileCard, Banner, the settings-card slider) stand on their
 * own; bare clusters with no surface of their own (a Switch row, an Accordion, a chat thread, a
 * Table) get a matching `Frame` so nothing floats and nothing double-frames. Packed into a
 * CSS-multicolumn masonry so a visitor sees the system *in use*, each component's limits drawn.
 */

// ── Interactive clusters (own their own state) ──────────────────────────────

/** A settings card: an icon-labelled row with the live value trailing, a brand slider beneath. */
function SliderDemo() {
  const [value, setValue] = React.useState([72])
  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sun weight="bold" className="size-4 text-muted-foreground" aria-hidden />
          Brightness
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">{value[0]}%</span>
      </div>
      <Slider value={value} onValueChange={setValue} variant="brand" aria-label="Brightness" />
    </div>
  )
}

function SwitchDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3.5 text-sm">
      <label className="flex items-center gap-3 font-medium">
        <Switch defaultChecked />
        Notifications
      </label>
      <label className="flex items-center gap-3 font-medium">
        <Switch />
        Weekly digest
      </label>
      <label className="flex items-center gap-3 font-medium">
        <Switch defaultChecked />
        Auto-publish on merge
      </label>
    </div>
  )
}

function CheckboxDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3.5 text-sm">
      <label className="flex items-center gap-2.5 font-medium">
        <Checkbox defaultChecked /> Ship on Fridays
      </label>
      <label className="flex items-center gap-2.5 font-medium">
        <Checkbox /> Notify the team
      </label>
      <label className="flex items-center gap-2.5 font-medium">
        <Checkbox checked="indeterminate" /> Select all
      </label>
    </div>
  )
}

// ── The wall ────────────────────────────────────────────────────────────────

/**
 * The surface for components that have none of their own (a Switch row, a Slider, a Table, a chat
 * thread). It gives them the same bordered card the self-contained tiles already carry, so every
 * tile reads as exactly one bounded surface, never a card inside a card. Components that bring
 * their own surface (Stat, Ranking, Chart-in-Card, Pricing, Testimonial, FileCard, Banner, the
 * settings-card slider) are NOT wrapped: their own surface is the frame.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center rounded-xl border border-border bg-card p-6 shadow-xs">
      {children}
    </div>
  )
}

const ITEMS: React.ReactNode[] = [
  // KPI tile with a trend chip and a sparkline that bleeds to the card edge.
  <Stat key="stat" className="w-full">
    <StatHeader>
      <StatLabel>Total revenue</StatLabel>
      <StatIcon className="bg-success/10 text-success">
        <CurrencyDollar weight="bold" />
      </StatIcon>
    </StatHeader>
    <StatValue>$48,210</StatValue>
    <StatFooter>
      <StatTrend direction="up">12.4%</StatTrend>
      <StatCaption>vs last month</StatCaption>
    </StatFooter>
    <StatSparkline
      className="text-success"
      data={[18, 22, 19, 27, 24, 31, 29, 36, 33, 41, 38, 48]}
      tooltip
      valueFormatter={(v) => `$${v}k`}
    />
  </Stat>,

  <Frame key="switch">
    <SwitchDemo />
  </Frame>,

  // Full login card: typeable, with social providers and a password field.
  <LoginForm key="login" className="w-full max-w-none" />,

  // Leaderboard with proportional share bars.
  <Ranking key="ranking" className="w-full">
    <RankingHeader>
      <RankingTitle>Best sellers</RankingTitle>
    </RankingHeader>
    <RankingList>
      {[
        { name: "Trail Runner", units: 1284, share: 100 },
        { name: "Merino Tee", units: 968, share: 75 },
        { name: "Field Watch", units: 742, share: 58 },
        { name: "Canvas Tote", units: 511, share: 40 },
      ].map((p, i) => (
        <RankingItem key={p.name}>
          <RankingRank highlight={i === 0}>{i + 1}</RankingRank>
          <RankingContent>
            <RankingLabel>{p.name}</RankingLabel>
            <RankingBar value={p.share} />
          </RankingContent>
          <RankingValue>{p.units}</RankingValue>
        </RankingItem>
      ))}
    </RankingList>
  </Ranking>,

  // A settings card: its own surface, so it stands without a Frame.
  <SliderDemo key="slider" />,

  // Area chart living in its natural Card home.
  <Card key="chart" className="w-full">
    <CardHeader className="flex-row items-center justify-between">
      <CardTitle className="text-base">Revenue</CardTitle>
      <Badge variant="success" dot pill size="sm">
        +18%
      </Badge>
    </CardHeader>
    <CardContent>
      <Chart
        data={[
          { month: "Jan", revenue: 4200 },
          { month: "Feb", revenue: 3800 },
          { month: "Mar", revenue: 5100 },
          { month: "Apr", revenue: 6200 },
          { month: "May", revenue: 5800 },
          { month: "Jun", revenue: 7400 },
        ]}
        index="month"
        config={{ revenue: { label: "Revenue", color: "blue" } }}
        padding={{ top: 8, right: 8, bottom: 24, left: 36 }}
        className="h-40 w-full"
      >
        <ChartGrid />
        <ChartYAxis count={3} />
        <ChartArea dataKey="revenue" />
        <ChartLine dataKey="revenue" />
        <ChartXAxis />
        <ChartTooltip />
      </Chart>
    </CardContent>
  </Card>,

  <Frame key="accordion">
    <Accordion type="single" collapsible defaultValue="a" variant="minimal" className="w-full">
      <AccordionItem value="a">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. Behavior comes from Radix primitives.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Can I theme it?</AccordionTrigger>
        <AccordionContent>Four themes and eight accents, all token-driven.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </Frame>,

  // AI conversation thread with a live typing indicator. `bubble` variant so every turn is a
  // chat bubble paired with the Koala avatar (the `plain` default drops the bubble + avatar and
  // would leave the assistant turn as bare text beside a stray avatar).
  <Frame key="chat">
    <Conversation variant="bubble" className="w-full">
      <Message role="user">
        <MessageBody>
          <MessageContent>What changed this release?</MessageContent>
        </MessageBody>
      </Message>
      <Message role="assistant">
        <MessageAvatar name="Koala" src="/koala-logo.webp" />
        <MessageBody>
          <MessageContent>Three key updates landed.</MessageContent>
        </MessageBody>
      </Message>
      <Message role="assistant">
        <MessageAvatar name="Koala" src="/koala-logo.webp" />
        <MessageBody>
          <MessageContent>
            <MessageTyping />
          </MessageContent>
        </MessageBody>
      </Message>
    </Conversation>
  </Frame>,

  <Frame key="tabs">
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex-1">
          Activity
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-3 text-center text-sm text-muted-foreground">
        A quick summary lives here.
      </TabsContent>
      <TabsContent value="activity" className="pt-3 text-center text-sm text-muted-foreground">
        The latest events show here.
      </TabsContent>
    </Tabs>
  </Frame>,

  // Featured pricing tier (provides its own context, no grid needed).
  <PricingTier key="pricing" featured className="w-full gap-4 p-5">
    <PricingTierHeader>
      <div className="flex items-center justify-between gap-2">
        <PricingTierName>Pro</PricingTierName>
        <Badge variant="primary" pill size="sm">
          Popular
        </Badge>
      </div>
    </PricingTierHeader>
    <PricingPrice>
      <PricingAmount className="text-3xl">$29</PricingAmount>
      <PricingPeriod>/mo</PricingPeriod>
    </PricingPrice>
    <PricingFeatures className="gap-2 pt-4">
      <PricingFeature>Unlimited projects</PricingFeature>
      <PricingFeature>Priority support</PricingFeature>
      <PricingFeature>Owned source, no lock-in</PricingFeature>
    </PricingFeatures>
    <PricingTierAction className="pt-0">
      <Button className="w-full">Start trial</Button>
    </PricingTierAction>
  </PricingTier>,

  <Frame key="avatars">
    <AvatarGroup max={4}>
      {(
        [
          { initials: "EA", name: "Emma Adams", color: "brand", img: 47 },
          { initials: "MJ", name: "Marcus Jones", color: "purple", img: 12 },
          { initials: "AL", name: "Aisha Lin", color: "teal", img: 5 },
          { initials: "RT", name: "Rosa Torres", color: "orange", img: 32 },
          { initials: "SD", name: "Sam Diaz", color: "pink", img: 14 },
          { initials: "KO", name: "Kenji Ono", color: "brand", img: 60 },
        ] as const
      ).map(({ initials, name, color, img }) => (
        // Real photos via pravatar; Radix falls back to the colored initials if an image fails.
        <Avatar key={initials} color={color}>
          <AvatarImage src={`https://i.pravatar.cc/96?img=${img}`} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  </Frame>,

  <Testimonial key="testimonial" className="w-full">
    <TestimonialQuote>We replaced our in-house kit in a weekend.</TestimonialQuote>
    <TestimonialFooter>
      <Avatar size="md">
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      <TestimonialAuthor>
        <TestimonialName>Alex Rivera</TestimonialName>
        <TestimonialTitle>Founder, Lumen</TestimonialTitle>
      </TestimonialAuthor>
    </TestimonialFooter>
  </Testimonial>,

  // HSV color picker: drag the square, slide the hue rail.
  <Frame key="color">
    <ColorPicker density="compact" defaultValue="#5b8def" className="w-full max-w-[15rem]">
      <ColorPickerArea className="h-28" />
      <ColorPickerControls />
    </ColorPicker>
  </Frame>,

  <Frame key="checkbox">
    <CheckboxDemo />
  </Frame>,

  <Frame key="table">
    <Table className="w-full text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Chen</TableCell>
          <TableCell>
            <Badge variant="success" size="sm" dot pill>
              Active
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Lee</TableCell>
          <TableCell>
            <Badge variant="warning" size="sm" dot pill>
              Pending
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Carla Ruiz</TableCell>
          <TableCell>
            <Badge variant="success" size="sm" dot pill>
              Active
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Frame>,

  <Frame key="toggle">
    <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <TextB weight="bold" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <TextItalic weight="bold" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <TextUnderline weight="bold" />
      </ToggleGroupItem>
    </ToggleGroup>
  </Frame>,

  <Frame key="otp">
    <OTPInput length={5} placeholder="0" aria-label="Verification code" />
  </Frame>,

  <FileCard key="file" className="w-full">
    <FileCardIcon type="pdf" />
    <FileCardContent>
      <FileCardName>annual-report.pdf</FileCardName>
      <FileCardMeta>1.2 MB</FileCardMeta>
    </FileCardContent>
  </FileCard>,

  <Frame key="badges">
    <BadgeGroup max={3}>
      <Badge variant="info" pill>
        <Lightning weight="bold" /> React
      </Badge>
      <Badge variant="purple" pill>
        TypeScript
      </Badge>
      <Badge variant="success" pill>
        Tailwind
      </Badge>
      <Badge variant="outline" pill>
        <GitBranch weight="bold" /> Radix
      </Badge>
      <Badge variant="outline" pill>
        Next.js
      </Badge>
    </BadgeGroup>
  </Frame>,

  <Banner key="banner" variant="purple" className="w-full rounded-xl">
    <BannerIcon>
      <Megaphone weight="bold" />
    </BannerIcon>
    <BannerContent>Koala UI now available for Mobile!</BannerContent>
    <BannerAction href="#" aria-label="Learn more">
      <ArrowRight weight="bold" />
    </BannerAction>
  </Banner>,
]

export function ShowcaseGallery() {
  return (
    // CSS multi-column masonry: tiles flow top-to-bottom and pack by height. `break-inside-avoid`
    // (on each child) keeps a tile whole; the trailing margin is the only vertical rhythm.
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {ITEMS.map((item, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          {item}
        </div>
      ))}
    </div>
  )
}
