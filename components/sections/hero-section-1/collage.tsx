"use client"

import * as React from "react"
import {
  BowlFood,
  CalendarBlank,
  CalendarCheck,
  CalendarDot,
  CalendarDots,
  Carrot,
  Crown,
  Info,
  Medal,
  Plus,
  UsersThree,
} from "@phosphor-icons/react"
import { CH, ES } from "country-flag-icons/react/3x2"

import { PLACEHOLDER_BRANDS, PlaceholderLogo, type PlaceholderBrand } from "@/components/ui/placeholder-logos"
import { AnimatedLabel } from "@/components/ui/animated-label"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { AvatarBadge, AvatarFallback, AvatarImage, AvatarRoot, AvatarStatus } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import { Button, SocialButton, socialProviders } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart,
  ChartBar,
  ChartBars,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Divider } from "@/components/ui/divider"
import { Field, FieldLabel } from "@/components/ui/field"
import { Form, FormActions } from "@/components/ui/form"
import { InputField, InputRoot, PasswordInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/components/ui/link"
import { OTPInput } from "@/components/ui/otp-input"
import {
  Ranking,
  RankingAction,
  RankingBar,
  RankingContent,
  RankingHeader,
  RankingItem,
  RankingLabel,
  RankingList,
  RankingMedia,
  RankingTitle,
} from "@/components/ui/ranking"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearch,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchTrigger,
  SelectSearchValue,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Stat, StatHeader, StatLabel, StatTrend, StatValue } from "@/components/ui/stat"
import { Switch } from "@/components/ui/switch"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * The collage at the foot of hero-section-1, built from the real components instead of a render.
 * Each block sits where the Figma artwork put it: four columns on a 114rem canvas (26.5 / 29.125 /
 * 22.125 / 29.875rem, 2.125rem apart), every column a stack whose gaps land each block on the
 * artwork's line. Everything is live: the charts hover, the login form types, the user picker
 * filters and picks, the code fills, the switches flip.
 *
 * Below `lg` the band is narrower than the canvas, so the canvas zooms to 150vw, the width the
 * artwork was drawn at there. `tan(atan2(a, b))` is a/b as a plain number (CSS can't divide two
 * lengths yet), which is what `zoom` takes; from `lg` up it renders 1:1 and the band clips the ends.
 */
export function HeroCollage() {
  return (
    <div className="w-[114rem] text-left [zoom:tan(atan2(150vw,114rem))] lg:[zoom:1]">
      <div className="grid grid-cols-[26.5rem_29.125rem_22.125rem_29.875rem] items-start gap-x-8.5">
        <div className="flex flex-col gap-8.5">
          <WeeklyBars />
          <BestSellers />
        </div>
        <div className="flex flex-col gap-8">
          <LoginCard />
          <div className="flex items-start justify-between">
            <People />
            <Brands />
          </div>
          <FoodButtons />
        </div>
        <div className="flex flex-col">
          <UserPicker />
          <VerifyCard />
          <Crumbs />
        </div>
        <div className="flex flex-col items-start">
          <SpendChart />
          <Providers />
          <ButtonGroup className="mt-8">
            <ButtonGroupItem>Create</ButtonGroupItem>
            <ButtonGroupItem>Add</ButtonGroupItem>
            <ButtonGroupItem iconOnly aria-label="More">
              <Plus weight="bold" />
            </ButtonGroupItem>
          </ButtonGroup>
          <Preferences />
          <Toggles />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────── Column 1 ─────────────────────────────── */

const money = (value: number) => `$${value.toLocaleString("en-US")}`

/** The card-title line both dashboard cards share: a brand glyph, then the name. */
const CARD_TITLE = "flex items-center gap-2 text-lg font-medium text-foreground [&>svg]:size-5 [&>svg]:text-brand"

const PERIODS = [
  { value: "daily", label: "Daily", Icon: CalendarDot },
  { value: "weekly", label: "Weekly", Icon: CalendarDots },
  { value: "this-week", label: "This week", Icon: CalendarCheck },
  { value: "monthly", label: "Monthly", Icon: CalendarBlank },
] as const

type Period = (typeof PERIODS)[number]["value"]

/** The small period picker in each dashboard card's corner. Controlled when `value` is passed. */
function PeriodSelect({
  defaultValue,
  value,
  onValueChange,
  label,
}: {
  defaultValue?: Period
  value?: Period
  onValueChange?: (value: Period) => void
  label: string
}) {
  return (
    <Select
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange ? (next) => onValueChange(next as Period) : undefined}
    >
      <SelectTrigger size="sm" aria-label={label} className="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {PERIODS.map(({ value, label, Icon }) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <Icon weight="bold" />
              {label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A change against the figure before it, as a whole percent. */
const change = (now: number, before: number) => Math.round(((now - before) / before) * 100)
const signed = (pct: number) => `${pct > 0 ? "+" : ""}${pct}%`

/**
 * Revenue in four buckets per period, the last one being the current one: the last four days, this
 * week's days so far, the last four weeks, the last four months. The headline is the current
 * bucket and the trend compares it with the one before, so both read straight off the bars.
 */
const REVENUE: Record<Period, { title: string; unit: string; versus: string; rows: { at: string; value: number }[] }> = {
  daily: {
    title: "Daily comparison",
    unit: "day",
    versus: "vs yesterday",
    rows: [
      { at: "Thu", value: 1840 },
      { at: "Fri", value: 2210 },
      { at: "Sat", value: 1960 },
      { at: "Today", value: 2380 },
    ],
  },
  "this-week": {
    title: "This week",
    unit: "day",
    versus: "vs Wednesday",
    rows: [
      { at: "Mon", value: 2120 },
      { at: "Tue", value: 2640 },
      { at: "Wed", value: 3180 },
      { at: "Thu", value: 2980 },
    ],
  },
  weekly: {
    title: "Weekly comparison",
    unit: "week",
    versus: "vs last week",
    rows: [
      { at: "Week 1", value: 18484 },
      { at: "Week 2", value: 21489 },
      { at: "Week 3", value: 24310 },
      { at: "Week 4", value: 27480 },
    ],
  },
  monthly: {
    title: "Monthly comparison",
    unit: "month",
    versus: "vs last month",
    rows: [
      { at: "Mar", value: 88400 },
      { at: "Apr", value: 104860 },
      { at: "May", value: 91300 },
      { at: "Jun", value: 97540 },
    ],
  },
}

/** The current bucket is its own series so it alone wears the brand. */
const WEEK_CONFIG: ChartConfig = {
  past: { label: "Revenue", color: "neutral", format: money },
  current: { label: "Revenue", color: "brand", format: money },
}

/** The bar labels: the figure, crowned on the best bucket of the range. */
const barLabel = (best: number) =>
  function BarLabel(value: number, index: number) {
    return (
      <>
        {index === best && <Crown weight="bold" aria-hidden />}
        {money(value)}
      </>
    )
  }

/**
 * The period picker drives the card: the title, the current bucket and its change on the one
 * before, and the four bars, which grow in again for the new range with the crown on its best.
 */
function WeeklyBars() {
  const [period, setPeriod] = React.useState<Period>("weekly")
  const view = REVENUE[period]
  const last = view.rows.length - 1
  const current = view.rows[last].value
  const trend = change(current, view.rows[last - 1].value)
  const best = view.rows.reduce((top, row, i) => (row.value > view.rows[top].value ? i : top), 0)
  const data = view.rows.map((row, i) => ({
    at: row.at,
    past: i === last ? null : row.value,
    current: i === last ? row.value : null,
  }))
  const label = barLabel(best)

  return (
    <Stat className="gap-4">
      <StatHeader className="items-center">
        <StatLabel className={CARD_TITLE}>
          <CalendarCheck weight="bold" aria-hidden />
          <AnimatedLabel swapKey={period} align="start">
            {view.title}
          </AnimatedLabel>
        </StatLabel>
        <PeriodSelect value={period} onValueChange={setPeriod} label="Period" />
      </StatHeader>
      <div className="flex items-center gap-3">
        <StatValue className="text-4xl">
          <AnimatedNumber value={money(current)} />
        </StatValue>
        <StatTrend direction={trend < 0 ? "down" : "up"}>
          <AnimatedLabel swapKey={period} align="start">
            {`${signed(trend)} ${view.versus}`}
          </AnimatedLabel>
        </StatTrend>
      </div>
      {/* Keyed by period, like the spend chart: a new range grows in instead of snapping. */}
      <Chart
        key={period}
        data={data}
        index="at"
        config={WEEK_CONFIG}
        padding={{ top: 28, right: 0, bottom: 32, left: 0 }}
        className="h-70"
        label={`Revenue by ${view.unit}`}
      >
        <ChartGrid className="[stroke-dasharray:4_4]" />
        <ChartBar dataKey="past" barRatio={0.84} label={label} />
        <ChartBar dataKey="current" barRatio={0.84} label={label} />
        <ChartXAxis className="text-sm" />
        <ChartTooltip />
      </Chart>
    </Stat>
  )
}

const PRODUCTS = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Water", emoji: "💧" },
  { name: "Tobacco", emoji: "🚬" },
  { name: "Beer", emoji: "🍺" },
  { name: "Coconut", emoji: "🥥" },
] as const

/**
 * Each product's income in the period, in dollars, and its change on the period before, in the
 * order of {@link PRODUCTS}. The headline is their sum; the bars are each one's share of the leader.
 */
const SALES: Record<Period, { when: string; income: number[]; trend: number[] }> = {
  daily: { when: "Today", income: [1240, 980, 1870, 1980, 320], trend: [6, -3, 2, 18, -8] },
  "this-week": { when: "This week", income: [8460, 6250, 15080, 8090, 2961], trend: [13, 4, 21, 9, 2] },
  weekly: { when: "Last week", income: [7980, 5720, 14300, 7410, 3050], trend: [9, 7, 15, -2, 11] },
  monthly: { when: "This month", income: [36900, 24900, 34200, 31300, 11800], trend: [24, 3, -6, 12, 5] },
}

/**
 * The period picker drives the ranking: the headline total, every product's bar (they slide to
 * their new share, and the brand moves to whoever leads), and the figures in each bar's tooltip.
 * The rows keep their order, so nothing jumps under the pointer.
 */
function BestSellers() {
  const [period, setPeriod] = React.useState<Period>("this-week")
  const view = SALES[period]
  const total = view.income.reduce((sum, value) => sum + value, 0)
  const top = Math.max(...view.income)

  return (
    <Ranking layout="inline" className="gap-4">
      <RankingHeader className="items-center">
        <RankingTitle className={CARD_TITLE}>
          <Medal weight="bold" aria-hidden />
          Best seller products
        </RankingTitle>
        <RankingAction>
          <PeriodSelect value={period} onValueChange={setPeriod} label="Period" />
        </RankingAction>
      </RankingHeader>
      <p className="font-heading text-4xl font-semibold leading-none tracking-tight tabular-nums">
        <AnimatedNumber value={money(total)} />
      </p>
      <RankingList>
        {PRODUCTS.map((product, i) => {
          const income = view.income[i]
          const trend = view.trend[i]
          return (
            <RankingItem key={product.name}>
              <RankingMedia className="text-base">{product.emoji}</RankingMedia>
              <RankingContent>
                <RankingLabel>{product.name}</RankingLabel>
              </RankingContent>
              <Tooltip
                variant="graph"
                placement="top"
                content={
                  <span className="flex flex-col gap-1 tabular-nums">
                    <span className="text-muted-foreground">{view.when}</span>
                    <span>Income: {money(income)}</span>
                    <span
                      className={cn(
                        "font-medium",
                        trend < 0 ? "text-destructive-strong" : "text-success-strong",
                      )}
                    >
                      {signed(trend)}
                    </span>
                  </span>
                }
              >
                <RankingBar
                  value={Math.round((income / top) * 100)}
                  tabIndex={0}
                  aria-label={`${product.name} income`}
                />
              </Tooltip>
            </RankingItem>
          )
        })}
      </RankingList>
    </Ranking>
  )
}

/* ─────────────────────────────── Column 2 ─────────────────────────────── */

function LoginCard() {
  return (
    <Card density="comfortable" className="gap-7 py-10">
      <CardHeader className="justify-items-center px-9 text-center">
        <CardTitle className="font-heading text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription className="text-base">Please log in to continue.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-7 px-9">
        <div className="grid grid-cols-2 gap-4">
          <SocialButton provider="google" size="lg">
            Google
          </SocialButton>
          <SocialButton provider="threads" size="lg">
            Threads
          </SocialButton>
        </div>
        <Divider>Or</Divider>
        <Form onSubmit={(event) => event.preventDefault()}>
          <Field>
            <FieldLabel required>Email Address</FieldLabel>
            <InputRoot>
              <InputField type="email" autoComplete="off" placeholder="Enter your email" />
            </InputRoot>
          </Field>
          <Field>
            <FieldLabel required>Password</FieldLabel>
            <PasswordInput autoComplete="off" placeholder="Enter your password" />
          </Field>
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox />
              Remember password
            </label>
            <Link href="#" className="text-sm">
              Forgot password?
            </Link>
          </div>
          <FormActions align="stack">
            <Button type="submit">Continue</Button>
          </FormActions>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="#" underline>
            Register now
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

const brand = (name: string) => PLACEHOLDER_BRANDS.find((b) => b.name === name) as PlaceholderBrand

/** Each corner shows one thing an avatar can carry: a team's mark, a presence dot, a country. */
const PEOPLE: { name: string; photo: number; corner: React.ReactNode }[] = [
  { name: "Emma Adams", photo: 5, corner: <BrandCoin brand={brand("Halo")} /> },
  { name: "Lucía Marín", photo: 45, corner: <BrandCoin brand={brand("Forge")} /> },
  { name: "Marco Rossi", photo: 33, corner: <AvatarStatus variant="online" /> },
  { name: "Kwame Mensah", photo: 13, corner: <AvatarStatus variant="online" /> },
  {
    name: "Daniel Ortega",
    photo: 59,
    corner: (
      <AvatarBadge>
        <ES title="Spain" />
      </AvatarBadge>
    ),
  },
  {
    name: "Sofia Keller",
    photo: 26,
    corner: (
      <AvatarBadge>
        <CH title="Switzerland" />
      </AvatarBadge>
    ),
  },
]

function BrandCoin({ brand }: { brand: PlaceholderBrand }) {
  const { Mark, color } = brand
  return (
    <AvatarBadge>
      <Mark style={{ color }} />
    </AvatarBadge>
  )
}

function People() {
  return (
    <div className="grid grid-cols-3 gap-4.5">
      {PEOPLE.map(({ name, photo, corner }) => (
        <Tooltip key={name} content={name}>
          <AvatarRoot size="lg">
            <AvatarImage src={`https://i.pravatar.cc/96?img=${photo}`} alt={name} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
            {corner}
          </AvatarRoot>
        </Tooltip>
      ))}
    </div>
  )
}

const BRANDS = ["Halo", "Forge", "Strata", "Sonar", "Ripple", "Apex"].map(brand)

function Brands() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
      {BRANDS.map((b) => (
        <PlaceholderLogo key={b.name} brand={b} className="gap-2.5 [&>span]:text-2xl [&>svg]:size-9" />
      ))}
    </div>
  )
}

/** The four button fills in one row of the same action. */
function FoodButtons() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4.5 self-end">
      {(["primary", "neutral", "secondary", "outline"] as const).map((variant) => (
        <Button key={variant} variant={variant} className="w-30.5">
          <Carrot weight="bold" />
          Bamboo
          <BowlFood weight="bold" />
        </Button>
      ))}
    </div>
  )
}

/* ─────────────────────────────── Column 3 ─────────────────────────────── */

const USERS = [
  { id: "isaac", name: "Isaac Reed", handle: "isaacreed", photo: 12 },
  { id: "ava", name: "Ava Smith", handle: "avasmith", photo: 47 },
  { id: "isabella", name: "Isabella Brown", handle: "isabellabrown", photo: 44 },
  { id: "oliver", name: "Oliver Stone", handle: "oliverstone", photo: 15 },
  { id: "julian", name: "Julian Price", handle: "julianprice", photo: 53 },
  { id: "nora", name: "Nora Lewis", handle: "noralweis", photo: 32 },
  { id: "james", name: "James Brennan", handle: "jamesbrennan", photo: 60 },
  { id: "gabriel", name: "Gabriel Torres", handle: "gabrieltorres", photo: 68 },
]

/** One user: the avatar (with its online dot), the name, and the handle beside it in the list. */
function UserRow({ user, handle = true }: { user: (typeof USERS)[number]; handle?: boolean }) {
  return (
    <>
      <AvatarRoot size="xs">
        <AvatarImage src={`https://i.pravatar.cc/64?img=${user.photo}`} alt="" />
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
        <AvatarStatus variant="online" />
      </AvatarRoot>
      <span className="truncate">
        {user.name}{" "}
        {handle ? <span className="font-normal text-muted-foreground">@{user.handle}</span> : null}
      </span>
    </>
  )
}

/**
 * A searchable select held open: the field is the trigger, the panel below it filters as you
 * type and moves the check. `inline` keeps the panel in the column's flow instead of floating it.
 */
function UserPicker() {
  const [picked, setPicked] = React.useState("ava")
  return (
    <>
      <div className="flex items-center gap-1">
        <Label htmlFor="collage-user-search" required>
          Search
        </Label>
        <Tooltip content="Search by name or handle">
          <button type="button" aria-label="About search" className="cursor-pointer text-muted-foreground">
            <Info weight="bold" className="size-4" />
          </button>
        </Tooltip>
      </div>
      <SelectSearch
        inline
        defaultOpen
        size="md"
        density="compact"
        value={picked}
        onValueChange={setPicked}
        className="mt-2 gap-3.5"
      >
        <SelectSearchTrigger id="collage-user-search">
          <UsersThree weight="bold" />
          <SelectSearchValue
            placeholder="Click to search for the user"
            // The value is controlled from outside, so the trigger is told how to draw it.
            renderValue={(id) => {
              const user = USERS.find((candidate) => candidate.id === id)
              // The trigger carries the person, not the row: no handle, it has less room.
              return user ? <UserRow user={user} handle={false} /> : null
            }}
          />
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchInput placeholder="Find the user by first name or surname…" />
          <SelectSearchList label="Users" className="max-h-none">
            {USERS.map((user) => (
              <SelectSearchItem
                key={user.id}
                value={user.id}
                textValue={user.name}
                keywords={[user.handle]}
              >
                <UserRow user={user} />
              </SelectSearchItem>
            ))}
            <SelectSearchEmpty>No user by that name.</SelectSearchEmpty>
          </SelectSearchList>
        </SelectSearchContent>
      </SelectSearch>
    </>
  )
}

function VerifyCard() {
  return (
    <Card density="comfortable" className="mt-7 gap-6">
      <CardHeader className="justify-items-center text-center">
        <CardTitle className="font-heading text-2xl font-bold">Email verification</CardTitle>
        <CardDescription className="text-base text-balance">
          Introduce the 4-digit verification code sent to hello@halo.com
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <OTPInput length={4} size="lg" defaultValue="294" placeholder="0" aria-label="Verification code" />
        <Button variant="ghost" size="sm">
          Resend code
        </Button>
      </CardContent>
    </Card>
  )
}

function Crumbs() {
  return (
    <div className="mt-6 flex flex-col items-end gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">All posts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Featured</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Current post</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">All posts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Design</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current post</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

/* ─────────────────────────────── Column 4 ─────────────────────────────── */

type SpendRow = { at: string; travel: number; technology: number; food: number; health: number }
type SpendKey = Exclude<keyof SpendRow, "at">

/**
 * Spend per category, in dollars, as each period breaks it down: today in four-hour slots, this
 * week by day, the last six weeks, the last six months. `trend` is the whole range against the one
 * before it; the headline and the legend are summed from the rows, so the figures always agree.
 */
const SPEND: Record<Period, { title: string; unit: string; trend: number; versus: string; rows: SpendRow[] }> = {
  daily: {
    title: "Daily comparison",
    unit: "time of day",
    trend: 8,
    versus: "vs yesterday",
    rows: [
      { at: "00h", travel: 280, technology: 150, food: 110, health: 70 },
      { at: "04h", travel: 190, technology: 100, food: 80, health: 60 },
      { at: "08h", travel: 640, technology: 380, food: 210, health: 90 },
      { at: "12h", travel: 920, technology: 520, food: 460, health: 160 },
      { at: "16h", travel: 1080, technology: 610, food: 380, health: 140 },
      { at: "20h", travel: 760, technology: 300, food: 420, health: 110 },
    ],
  },
  "this-week": {
    title: "This week",
    unit: "day",
    trend: -4,
    versus: "vs last week",
    rows: [
      { at: "Mon", travel: 3200, technology: 1900, food: 850, health: 600 },
      { at: "Tue", travel: 2800, technology: 2400, food: 920, health: 450 },
      { at: "Wed", travel: 4100, technology: 1500, food: 780, health: 700 },
      { at: "Thu", travel: 3600, technology: 2100, food: 1050, health: 520 },
      { at: "Fri", travel: 5200, technology: 1800, food: 1300, health: 640 },
      { at: "Sat", travel: 6100, technology: 900, food: 1450, health: 380 },
      { at: "Sun", travel: 4800, technology: 700, food: 1200, health: 300 },
    ],
  },
  weekly: {
    title: "Weekly comparison",
    unit: "week",
    trend: 13,
    versus: "vs previous 6 weeks",
    rows: [
      { at: "Apr 7", travel: 22500, technology: 12100, food: 5600, health: 7600 },
      { at: "Apr 14", travel: 28000, technology: 6250, food: 6000, health: 3000 },
      { at: "Apr 21", travel: 18250, technology: 13250, food: 9000, health: 5500 },
      { at: "Apr 28", travel: 18000, technology: 9100, food: 6100, health: 4400 },
      { at: "May 5", travel: 17250, technology: 15250, food: 6250, health: 3500 },
      { at: "May 12", travel: 19500, technology: 14000, food: 5800, health: 4200 },
    ],
  },
  monthly: {
    title: "Monthly comparison",
    unit: "month",
    trend: 6,
    versus: "vs previous 6 months",
    rows: [
      { at: "Jan", travel: 88000, technology: 41000, food: 26000, health: 18000 },
      { at: "Feb", travel: 96000, technology: 38000, food: 24500, health: 16500 },
      { at: "Mar", travel: 78000, technology: 52000, food: 28000, health: 21000 },
      { at: "Apr", travel: 82000, technology: 47000, food: 27500, health: 19000 },
      { at: "May", travel: 91000, technology: 55000, food: 29000, health: 17500 },
      { at: "Jun", travel: 99000, technology: 58000, food: 31000, health: 20500 },
    ],
  },
}

const SPEND_CONFIG = {
  travel: { label: "Travel", color: "purple", format: money },
  technology: { label: "Technology", color: "warning", format: money },
  food: { label: "Food", color: "destructive", format: money },
  health: { label: "Health", color: "success", format: money },
} satisfies ChartConfig

/** The legend's reading order (the stack runs travel → health, floor up). */
const SPEND_LEGEND: SpendKey[] = ["travel", "health", "food", "technology"]

const spendTick = (v: number) => (v === 0 ? "$0" : v >= 1000 ? `$${v / 1000}K` : `$${v}`)

/**
 * The period picker drives the whole card: the title, the headline total and its trend, the
 * legend's per-category totals, and the bars, which grow in again for the new range.
 */
function SpendChart() {
  const [period, setPeriod] = React.useState<Period>("weekly")
  const view = SPEND[period]
  const totals = Object.fromEntries(
    SPEND_LEGEND.map((key) => [key, view.rows.reduce((sum, row) => sum + row[key], 0)]),
  ) as Record<SpendKey, number>
  const total = SPEND_LEGEND.reduce((sum, key) => sum + totals[key], 0)
  const trend = `${signed(view.trend)} ${view.versus}`

  return (
    <Stat className="w-full gap-4">
      <StatHeader className="items-center">
        <StatLabel className={CARD_TITLE}>
          <CalendarCheck weight="bold" aria-hidden />
          <AnimatedLabel swapKey={period} align="start">
            {view.title}
          </AnimatedLabel>
        </StatLabel>
        <PeriodSelect value={period} onValueChange={setPeriod} label="Period" />
      </StatHeader>
      <div className="flex items-center gap-3">
        <StatValue className="text-4xl">
          <AnimatedNumber value={money(total)} />
        </StatValue>
        <StatTrend direction={view.trend < 0 ? "down" : "up"}>
          <AnimatedLabel swapKey={period} align="start">
            {trend}
          </AnimatedLabel>
        </StatTrend>
      </div>
      <ChartLegend
        className="gap-x-5 gap-y-2"
        items={SPEND_LEGEND.map((key) => ({
          label: SPEND_CONFIG[key].label,
          color: SPEND_CONFIG[key].color,
          value: <AnimatedNumber value={money(totals[key])} />,
        }))}
      />
      {/* Keyed by period: a new range remounts the plot, so its bars grow in again from the floor
          instead of snapping to new heights on a new scale. */}
      <Chart
        key={period}
        data={view.rows}
        index="at"
        config={SPEND_CONFIG}
        stack
        padding={{ top: 8, right: 0, bottom: 28, left: 44 }}
        className="h-64"
        label={`Spend by category per ${view.unit}`}
      >
        <ChartGrid className="[stroke-dasharray:4_4]" />
        <ChartYAxis tickFormatter={spendTick} />
        <ChartBars barRatio={0.64} />
        <ChartXAxis />
        <ChartTooltip />
      </Chart>
    </Stat>
  )
}

function Providers() {
  return (
    <div className="mt-8.5 flex max-w-md flex-wrap gap-x-4 gap-y-4.5">
      {(["google", "threads", "figma", "discord"] as const).map((provider) => (
        <SocialButton key={provider} provider={provider}>
          Sign in with {socialProviders[provider].label}
        </SocialButton>
      ))}
    </div>
  )
}

const PREFERENCES = [
  { id: "updates", title: "Receive Updates", hint: "Get product news and updates every month.", props: {} },
  { id: "offers", title: "Promotional Offers", hint: "Receive exclusive discounts on renewals.", props: { defaultChecked: true } },
  { id: "beta", title: "Beta Access", hint: "Try new features early.", props: { defaultChecked: true, disabled: true } },
]

function Preferences() {
  return (
    <div className="mt-8.5 flex flex-col gap-4">
      {PREFERENCES.map(({ id, title, hint, props }) => (
        <div key={id} className="flex items-start gap-3">
          <Checkbox id={`collage-${id}`} className="mt-0.5" {...props} />
          <label
            htmlFor={`collage-${id}`}
            className="flex max-w-52 cursor-pointer flex-col gap-1 peer-disabled:cursor-not-allowed"
          >
            <span className="text-base font-medium leading-6">{title}</span>
            <span className="truncate text-base text-muted-foreground">{hint}</span>
          </label>
        </div>
      ))}
    </div>
  )
}

function Toggles() {
  return (
    <div className="mt-6 flex items-center gap-6">
      <Switch defaultChecked aria-label="Notifications" />
      <Switch aria-label="Weekly digest" />
      <Switch defaultChecked disabled aria-label="Auto-publish" />
    </div>
  )
}
