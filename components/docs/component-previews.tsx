"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  FloppyDisk,
  Lightning,
  GitBranch,
  Command,
  ShoppingBag,
  MagnifyingGlass,
  EnvelopeSimple,
  User,
  CreditCard,
  CaretRight,
  FolderOpen,
  Plus,
  Megaphone,
  ArrowRight,
  UsersThree,
  CalendarDots,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextB,
  TextItalic,
  TextUnderline,
  Sparkle,
  Storefront,
  Palette,
  ChatCircle,
  CheckCircle,
  UploadSimple,
  Folder,
  FileCode,
  FileText,
  SquaresFour,
  Tray,
  Stack,
  GearSix,
  Code,
  PenNib,
  Gear,
  Copy,
  Trash,
  Image as ImageIcon,
  Cookie,
  ListBullets,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/landing/brand-mark"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Avatar,
  AvatarFallback,
  AvatarStatus,
} from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Divider } from "@/components/ui/divider"
import { Kbd } from "@/components/ui/kbd"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip } from "@/components/ui/tooltip"
import { InputRoot, InputField, InputPrefix } from "@/components/ui/input"
import {
  Stat,
  StatHeader,
  StatLabel,
  StatValue,
  StatTrend,
  StatCaption,
  StatFooter,
  StatIcon,
} from "@/components/ui/stat"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"
import {
  EmptyState,
  EmptyStateMedia,
  EmptyStateTitle,
  EmptyStateActions,
} from "@/components/ui/empty-state"
import { OTPInput } from "@/components/ui/otp-input"
import { Pagination } from "@/components/ui/pagination"
import { Rating } from "@/components/ui/rating"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/components/ui/toolbar"
import { QRCode } from "@/components/ui/qr-code"
import { BadgeGroup } from "@/components/ui/badge-group"
import { AvatarGroup } from "@/components/ui/avatar-group"
import {
  List,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemMeta,
} from "@/components/ui/list"
import {
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list"
import {
  OrderSummary,
  OrderSummaryItems,
  OrderSummaryItem,
  OrderSummaryItemThumbnail,
  OrderSummaryItemContent,
  OrderSummaryItemName,
  OrderSummaryItemOptions,
  OrderSummaryItemPrice,
  OrderSummaryTotals,
  OrderSummaryRow,
  OrderSummaryTotal,
} from "@/components/ui/order-summary"
import {
  FileCard,
  FileCardIcon,
  FileCardContent,
  FileCardName,
  FileCardMeta,
} from "@/components/ui/file-card"
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from "@/components/ui/stepper"
import { Banner, BannerIcon, BannerContent, BannerAction } from "@/components/ui/banner"
import { NewsletterForm } from "@/components/ui/newsletter-form"
import {
  Testimonial,
  TestimonialQuote,
  TestimonialFooter,
  TestimonialAuthor,
  TestimonialName,
  TestimonialTitle,
} from "@/components/ui/testimonials"
import { TextareaRoot, TextareaField } from "@/components/ui/textarea"
import { CodeSnippet } from "@/components/ui/code-snippet"
import {
  PasswordStrength,
  PasswordStrengthMeter,
  PasswordStrengthLabel,
} from "@/components/ui/password-strength"
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table"
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
  AIPanel,
  AIPanelHeader,
  AIPanelHeading,
  AIPanelTitle,
  AIPanelDescription,
  AIPanelBody,
  AIPanelFooter,
} from "@/components/ui/ai-panel"
import {
  Conversation,
  Message,
  MessageAvatar,
  MessageBody,
  MessageContent,
  MessageTyping,
} from "@/components/ui/chat"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ui/prompt-input"
import { Suggestions, SuggestionMark } from "@/components/ui/suggestions"
import { LoginForm } from "@/components/ui/auth-form"
import { ContactForm } from "@/components/ui/contact-form"
import { FeedbackForm } from "@/components/ui/feedback-form"
import { PaymentForm } from "@/components/ui/payment-form"
import { SettingsForm } from "@/components/ui/settings-form"
import {
  SurveyQuestion,
  SurveyHeader,
  SurveyEyebrow,
  SurveyTitle,
  SurveyOptions,
  SurveyOption,
} from "@/components/ui/survey"
import { WaitlistForm } from "@/components/ui/waitlist-form"
import {
  Bento,
  BentoItem,
  BentoItemIcon,
  BentoItemTitle,
  BentoItemDescription,
} from "@/components/ui/bento"
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
import {
  PricingComparison,
  PricingComparisonHeader,
  PricingComparisonPlan,
  PricingComparisonSection,
  PricingComparisonRow,
  PricingComparisonCell,
} from "@/components/ui/pricing-comparison"
import {
  Footer,
  FooterTop,
  FooterBrand,
  FooterTagline,
  FooterColumns,
  FooterColumn,
  FooterLink,
  FooterBottom,
  FooterCopyright,
} from "@/components/ui/footer"
import {
  Gallery,
  GalleryHeader,
  GalleryTitle,
  GalleryMasonry,
} from "@/components/ui/gallery"
import { Hero, HeroContent, HeroTitle, HeroActions } from "@/components/ui/hero"
import {
  Navbar,
  NavbarInner,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
  NavbarSpacer,
} from "@/components/ui/navbar"
import {
  ActivityFeed,
  ActivityItem,
  ActivityMarker,
  ActivityIcon,
  ActivityContent,
  ActivityHeader,
  ActivityActor,
  ActivityTime,
} from "@/components/ui/activity-feed"
import {
  Checklist,
  ChecklistHeader,
  ChecklistTitle,
  ChecklistProgress,
  ChecklistItems,
  ChecklistItem,
  ChecklistItemContent,
  ChecklistItemTitle,
} from "@/components/ui/checklist"
import { Field, FieldLabel, FieldHint } from "@/components/ui/field"
import { Tree, TreeItem } from "@/components/ui/tree"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from "@/components/ui/sidebar"
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "@/components/ui/multi-select"
import {
  VideoPlayer,
  Video,
  VideoControls,
  VideoBar,
  VideoPlayButton,
  VideoSeek,
  VideoTime,
} from "@/components/ui/video-player"
import {
  Carousel,
  CarouselContent,
  CarouselSlide,
  CarouselIndicators,
} from "@/components/ui/carousel"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadTitle,
  FileUploadDescription,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { dialogVariants } from "@/components/ui/dialog"
import { drawerVariants } from "@/components/ui/drawer"
import { dropdownMenuVariants } from "@/components/ui/dropdown-menu"
import { contextMenuVariants } from "@/components/ui/context-menu"
import { popoverVariants } from "@/components/ui/popover"
import { commandVariants } from "@/components/ui/command"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { Calendar } from "@/components/ui/date-picker"
import { ColorPicker, ColorPickerArea, ColorPickerControls } from "@/components/ui/color-picker"
import {
  CookieConsent,
  CookieBanner,
  CookieBannerIcon,
  CookieBannerContent,
  CookieBannerTitle,
  CookieBannerDescription,
  CookieBannerActions,
  CookieAcceptAllButton,
  CookieRejectAllButton,
} from "@/components/ui/cookie-consent"
import { toastVariants } from "@/components/ui/toast"

// Precomputed inert tv-recipe slots for portal/floating components. We render their real
// recipe surfaces inline (no Radix Root/Portal), the same technique the docs use to paint
// modal variants statically (see app/docs/components/dialog/sizes-demo.tsx).
const dialogSlots = dialogVariants({ size: "sm" })
const drawerSlots = drawerVariants({ side: "right" })
const dropdownSlots = dropdownMenuVariants()
const contextMenuSlots = contextMenuVariants()
const popoverSlots = popoverVariants()
const commandSlots = commandVariants()
const toastSlots = toastVariants({ variant: "success" })

/**
 * Wrapper for previews that are naturally taller than the card stage (full forms, a month
 * calendar). It top-anchors the content and fades the bottom edge so the crop reads as
 * intentional instead of touching the border. Keeps the preview concentric on the sides.
 */
function TallPreview({
  children,
  className,
  align = "center",
}: {
  children: React.ReactNode
  className?: string
  align?: "center" | "start"
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-start overflow-hidden fade-b [--fade-size:28%]",
        align === "start" ? "justify-start" : "justify-center",
      )}
    >
      <div className={cn("origin-top", className)}>{children}</div>
    </div>
  )
}

/**
 * Live mini-previews for the /docs/components catalog, keyed by component slug (the last
 * segment of `/docs/components/<slug>`). Each node is rendered inside a fixed-height,
 * non-interactive stage (see ComponentsCatalog), so keep them compact and representative.
 * Components without an entry fall back to a large icon tile, so this map can grow over time.
 */
export const componentPreviews: Record<string, React.ReactNode> = {
  accordion: (
    <Accordion
      type="single"
      collapsible
      defaultValue="what"
      variant="minimal"
      className="w-64"
    >
      <AccordionItem value="what">
        <AccordionTrigger>What is Koala UI?</AccordionTrigger>
        <AccordionContent>A production-ready React design system.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="themes">
        <AccordionTrigger>How does theming work?</AccordionTrigger>
        <AccordionContent>Semantic tokens, four themes.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),

  alert: (
    <Alert variant="success" className="w-72">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Deployment successful</AlertTitle>
        <AlertDescription>Your changes are now live.</AlertDescription>
      </AlertContent>
    </Alert>
  ),

  avatar: (
    <div className="flex items-center -space-x-2">
      {["EA", "MJ", "AL"].map((initials) => (
        <Avatar key={initials} className="ring-2 ring-background">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>RT</AvatarFallback>
        <AvatarStatus variant="online" />
      </Avatar>
    </div>
  ),

  badge: (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge variant="success" dot pill>
        Online
      </Badge>
      <Badge variant="purple" pill>
        <Lightning weight="bold" /> Beta
      </Badge>
      <Badge variant="info" pill>
        v2.4.0
      </Badge>
      <Badge variant="outline">
        <GitBranch weight="bold" /> main
      </Badge>
    </div>
  ),

  button: (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button size="sm">Get started</Button>
        <Button size="sm" variant="outline">
          Cancel
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    </div>
  ),

  card: (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>Unlock every theme and component.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Owned source, no lock-in.
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="ghost">
          Learn more
        </Button>
        <Button size="sm">Upgrade</Button>
      </CardFooter>
    </Card>
  ),

  checkbox: (
    <div className="flex flex-col gap-3 text-sm">
      <label htmlFor="p-cb-1" className="flex items-center gap-2.5 font-medium">
        <Checkbox id="p-cb-1" defaultChecked />
        Email notifications
      </label>
      <label htmlFor="p-cb-2" className="flex items-center gap-2.5 font-medium">
        <Checkbox id="p-cb-2" />
        Push notifications
      </label>
      <label htmlFor="p-cb-3" className="flex items-center gap-2.5 font-medium">
        <Checkbox id="p-cb-3" checked="indeterminate" />
        Select all
      </label>
    </div>
  ),

  divider: (
    // A showcase: the dividers ARE the content here, so `static` opts each out of the
    // smart auto-collapse (which would otherwise hide the leading/trailing/stacked rules).
    <div className="flex w-64 flex-col gap-4">
      <Divider static />
      <Divider static variant="dashed" />
      <Divider static>OR</Divider>
      <Divider static variant="gradient" />
    </div>
  ),

  kbd: (
    <div className="flex items-center gap-1.5">
      <Kbd>
        <Command weight="bold" />
      </Kbd>
      <Kbd>K</Kbd>
      <Kbd variant="outline">Esc</Kbd>
      <Kbd variant="solid">⏎ Enter</Kbd>
    </div>
  ),

  input: (
    <div className="w-64">
      <InputRoot>
        <InputPrefix>
          <MagnifyingGlass weight="bold" />
        </InputPrefix>
        <InputField placeholder="Search components…" readOnly />
      </InputRoot>
    </div>
  ),

  "radio-group": (
    <RadioGroup defaultValue="pro" className="flex flex-col gap-3 text-sm">
      <label htmlFor="p-r-1" className="flex items-center gap-2.5 font-medium">
        <RadioGroupItem id="p-r-1" value="free" />
        Free
      </label>
      <label htmlFor="p-r-2" className="flex items-center gap-2.5 font-medium">
        <RadioGroupItem id="p-r-2" value="pro" />
        Pro
      </label>
      <label htmlFor="p-r-3" className="flex items-center gap-2.5 font-medium">
        <RadioGroupItem id="p-r-3" value="team" />
        Team
      </label>
    </RadioGroup>
  ),

  select: (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  ),

  skeleton: (
    <div className="flex w-64 items-center gap-4">
      <Skeleton variant="circle" className="size-12" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" />
      </div>
    </div>
  ),

  slider: (
    <div className="w-64">
      <Slider defaultValue={[60]} aria-label="Volume" />
    </div>
  ),

  switch: (
    <div className="flex flex-col gap-3 text-sm">
      <label htmlFor="p-sw-1" className="flex items-center gap-3 font-medium">
        <Switch id="p-sw-1" defaultChecked />
        Wi-Fi
      </label>
      <label htmlFor="p-sw-2" className="flex items-center gap-3 font-medium">
        <Switch id="p-sw-2" />
        Airplane mode
      </label>
    </div>
  ),

  tabs: (
    <Tabs defaultValue="overview" className="w-64">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
    </Tabs>
  ),

  tooltip: (
    <div className="flex items-center gap-1">
      <Tooltip content="Save changes">
        <Button iconOnly aria-label="Save changes" variant="ghost" size="sm">
          <FloppyDisk weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="New branch">
        <Button iconOnly aria-label="New branch" variant="ghost" size="sm">
          <GitBranch weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Command menu">
        <Button iconOnly aria-label="Command menu" variant="ghost" size="sm">
          <Command weight="bold" />
        </Button>
      </Tooltip>
    </div>
  ),

  stat: (
    <Stat className="w-60 border-0 bg-transparent p-0 shadow-none">
      <StatHeader>
        <StatLabel>Total orders</StatLabel>
        <StatIcon className="bg-primary/10 text-primary">
          <ShoppingBag weight="bold" />
        </StatIcon>
      </StatHeader>
      <StatValue>1,429</StatValue>
      <StatFooter>
        <StatTrend direction="up">12.4%</StatTrend>
        <StatCaption>vs last month</StatCaption>
      </StatFooter>
    </Stat>
  ),

  label: (
    <div className="flex w-64 flex-col gap-1.5">
      <label htmlFor="p-lbl" className="text-sm font-medium">
        Email address
      </label>
      <InputRoot>
        <InputPrefix>
          <EnvelopeSimple weight="bold" />
        </InputPrefix>
        <InputField id="p-lbl" placeholder="you@example.com" readOnly />
      </InputRoot>
    </div>
  ),

  breadcrumb: (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),

  "button-group": (
    <div className="flex flex-col items-center gap-3">
      <ButtonGroup>
        <ButtonGroupItem>Day</ButtonGroupItem>
        <ButtonGroupItem>Week</ButtonGroupItem>
        <ButtonGroupItem>Month</ButtonGroupItem>
      </ButtonGroup>
      <ButtonGroup size="sm">
        <ButtonGroupItem iconOnly aria-label="Align left">
          <TextAlignLeft weight="bold" />
        </ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Align center">
          <TextAlignCenter weight="bold" />
        </ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Align right">
          <TextAlignRight weight="bold" />
        </ButtonGroupItem>
      </ButtonGroup>
    </div>
  ),

  toolbar: (
    <Toolbar aria-label="Formatting">
      <ToolbarButton pressed aria-label="Bold">
        <TextB weight="bold" />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic">
        <TextItalic weight="bold" />
      </ToolbarButton>
      <ToolbarButton aria-label="Underline">
        <TextUnderline weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Bullet list">
        <ListBullets weight="bold" />
      </ToolbarButton>
      <ToolbarButton aria-label="Code block">
        <Code weight="bold" />
      </ToolbarButton>
    </Toolbar>
  ),

  "empty-state": (
    <EmptyState className="w-64">
      <EmptyStateMedia>
        <FolderOpen weight="bold" />
      </EmptyStateMedia>
      <EmptyStateTitle>No projects yet</EmptyStateTitle>
      <EmptyStateActions>
        <Button size="sm">
          <Plus weight="bold" /> New project
        </Button>
      </EmptyStateActions>
    </EmptyState>
  ),

  "otp-input": <OTPInput length={4} placeholder="0" aria-label="One-time code" />,

  pagination: <Pagination page={2} pageCount={10} />,

  rating: <Rating value={4} readOnly aria-label="Rated 4 out of 5" />,

  "toggle-group": (
    <ToggleGroup type="single" defaultValue="bold">
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),

  "qr-code": <QRCode value="https://koalaui.com" size={120} className="p-3 shadow-xs" />,

  "badge-group": (
    <BadgeGroup max={3}>
      <Badge variant="info" pill>
        React
      </Badge>
      <Badge variant="purple" pill>
        TypeScript
      </Badge>
      <Badge variant="success" pill>
        Tailwind
      </Badge>
      <Badge variant="outline" pill>
        Radix
      </Badge>
      <Badge variant="outline" pill>
        Next.js
      </Badge>
    </BadgeGroup>
  ),

  "avatar-group": (
    <AvatarGroup max={4}>
      {(
        [
          { initials: "EA", color: "brand" },
          { initials: "MJ", color: "purple" },
          { initials: "AL", color: "teal" },
          { initials: "RT", color: "orange" },
          { initials: "SD", color: "pink" },
          { initials: "KO", color: "brand" },
        ] as const
      ).map(({ initials, color }) => (
        <Avatar key={initials} color={color}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),

  list: (
    <List variant="plain" className="w-64">
      <ListItem>
        <ListItemMedia>
          <User weight="bold" />
        </ListItemMedia>
        <ListItemContent>
          <ListItemTitle>Account</ListItemTitle>
          <ListItemDescription>Profile, email, password</ListItemDescription>
        </ListItemContent>
        <ListItemMeta>
          <CaretRight weight="bold" />
        </ListItemMeta>
      </ListItem>
      <ListItem>
        <ListItemMedia>
          <CreditCard weight="bold" />
        </ListItemMedia>
        <ListItemContent>
          <ListItemTitle>Billing</ListItemTitle>
          <ListItemDescription>Plan, invoices, payment</ListItemDescription>
        </ListItemContent>
        <ListItemMeta>
          <CaretRight weight="bold" />
        </ListItemMeta>
      </ListItem>
    </List>
  ),

  "description-list": (
    <DescriptionList divided className="w-64">
      <DescriptionListItem>
        <DescriptionTerm>
          <CreditCard weight="bold" /> Plan
        </DescriptionTerm>
        <DescriptionDetails>
          Pro{" "}
          <Badge variant="success" size="sm" pill>
            Annual
          </Badge>
        </DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>
          <UsersThree weight="bold" /> Seats
        </DescriptionTerm>
        <DescriptionDetails>12 of 20</DescriptionDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionTerm>
          <CalendarDots weight="bold" /> Renews
        </DescriptionTerm>
        <DescriptionDetails>Mar 1, 2026</DescriptionDetails>
      </DescriptionListItem>
    </DescriptionList>
  ),

  "order-summary": (
    <TallPreview className="w-64">
      <OrderSummary>
        <OrderSummaryItems>
          <OrderSummaryItem>
            <OrderSummaryItemThumbnail count={2}>
              {/* eslint-disable-next-line @next/next/no-img-element -- demo imagery */}
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&h=160&q=80"
                alt="Retro Sneakers"
              />
            </OrderSummaryItemThumbnail>
            <OrderSummaryItemContent>
              <OrderSummaryItemName>Retro Sneakers</OrderSummaryItemName>
              <OrderSummaryItemOptions>Size 10 · Red</OrderSummaryItemOptions>
            </OrderSummaryItemContent>
            <OrderSummaryItemPrice>$64.00</OrderSummaryItemPrice>
          </OrderSummaryItem>
          <OrderSummaryItem>
            <OrderSummaryItemThumbnail>
              {/* eslint-disable-next-line @next/next/no-img-element -- demo imagery */}
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&h=160&q=80"
                alt="Chrono Watch"
              />
            </OrderSummaryItemThumbnail>
            <OrderSummaryItemContent>
              <OrderSummaryItemName>Chrono Watch</OrderSummaryItemName>
              <OrderSummaryItemOptions>40mm · Leather</OrderSummaryItemOptions>
            </OrderSummaryItemContent>
            <OrderSummaryItemPrice>$78.00</OrderSummaryItemPrice>
          </OrderSummaryItem>
        </OrderSummaryItems>
        <OrderSummaryTotals>
          <OrderSummaryRow label="Subtotal">$142.00</OrderSummaryRow>
          <OrderSummaryRow label="Shipping" tone="muted">
            Free
          </OrderSummaryRow>
          <OrderSummaryTotal label="Total">$142.00</OrderSummaryTotal>
        </OrderSummaryTotals>
      </OrderSummary>
    </TallPreview>
  ),

  "file-card": (
    <FileCard className="w-64">
      <FileCardIcon type="pdf" />
      <FileCardContent>
        <FileCardName>annual-report.pdf</FileCardName>
        <FileCardMeta>1.2 MB</FileCardMeta>
      </FileCardContent>
    </FileCard>
  ),

  stepper: (
    <Stepper defaultValue={2} className="w-72">
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Account</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Details</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={3}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Review</StepperTitle>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),

  banner: (
    <Banner variant="purple" className="w-72 rounded-lg">
      <BannerIcon>
        <Megaphone weight="bold" />
      </BannerIcon>
      <BannerContent>Koala UI now available for Mobile!</BannerContent>
      <BannerAction href="#">
        <ArrowRight weight="bold" />
      </BannerAction>
    </Banner>
  ),

  "newsletter-form": (
    <div className="w-72">
      <NewsletterForm variant="inline" action="Subscribe" />
    </div>
  ),

  testimonials: (
    <Testimonial className="w-72">
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
    </Testimonial>
  ),

  textarea: (
    <div className="w-64">
      <TextareaRoot>
        <TextareaField placeholder="Write a message…" rows={4} readOnly />
      </TextareaRoot>
    </div>
  ),

  "code-snippet": (
    <CodeSnippet
      lang="bash"
      filename="install.sh"
      code={"npx koala add button"}
      className="w-64"
    />
  ),

  "password-strength": (
    <div className="flex w-64 flex-col gap-2">
      <PasswordStrength value="Tr0ub4dour&3">
        <PasswordStrengthMeter />
        <PasswordStrengthLabel placeholder="-" />
      </PasswordStrength>
    </div>
  ),

  // ---- Data Display ----
  chart: (
    <Chart
      data={[
        { month: "Jan", revenue: 4200 },
        { month: "Feb", revenue: 3800 },
        { month: "Mar", revenue: 5100 },
        { month: "Apr", revenue: 6200 },
      ]}
      index="month"
      config={{ revenue: { label: "Revenue", color: "blue" } }}
      padding={{ top: 8, right: 8, bottom: 24, left: 36 }}
      className="h-36 w-72"
    >
      <ChartGrid />
      <ChartYAxis count={3} />
      <ChartArea dataKey="revenue" />
      <ChartLine dataKey="revenue" />
      <ChartXAxis />
      <ChartTooltip />
    </Chart>
  ),

  "data-table": (
    <Table className="w-72 text-sm">
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
  ),

  ranking: (
    <Ranking className="w-72 border-0 bg-transparent p-0 shadow-none">
      <RankingHeader>
        <RankingTitle>Top products</RankingTitle>
      </RankingHeader>
      <RankingList>
        {[
          { name: "Trail Runner", units: 1284, share: 100 },
          { name: "Merino Tee", units: 968, share: 75 },
          { name: "Field Watch", units: 742, share: 58 },
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
    </Ranking>
  ),

  // ---- AI ----
  "ai-panel": (
    <div className="h-36 w-64 overflow-hidden">
      <AIPanel>
        <AIPanelHeader>
          <Avatar size="sm">
            <AvatarFallback>
              <Sparkle weight="bold" />
            </AvatarFallback>
          </Avatar>
          <AIPanelHeading>
            <AIPanelTitle>Assistant</AIPanelTitle>
            <AIPanelDescription>Ready to help</AIPanelDescription>
          </AIPanelHeading>
        </AIPanelHeader>
        <AIPanelBody>
          <Conversation>
            <Message role="assistant">
              <MessageBody>
                <MessageContent>How can I help today?</MessageContent>
              </MessageBody>
            </Message>
          </Conversation>
        </AIPanelBody>
        <AIPanelFooter>
          <PromptInput>
            <PromptInputTextarea placeholder="Ask…" />
            <PromptInputToolbar>
              <PromptInputSubmit />
            </PromptInputToolbar>
          </PromptInput>
        </AIPanelFooter>
      </AIPanel>
    </div>
  ),

  chat: (
    <div className="w-64">
      {/* `bubble` variant: every turn is a chat bubble paired with the Koala avatar. The `plain`
          default drops the bubble + avatar (Notion/ChatGPT document style) and would leave the
          assistant turn as bare text beside a stray avatar. */}
      <Conversation variant="bubble">
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
    </div>
  ),

  "prompt-input": (
    <div className="w-64">
      <PromptInput>
        <PromptInputTextarea placeholder="Ask anything…" />
        <PromptInputToolbar>
          <Button iconOnly variant="ghost" size="sm" aria-label="Attach">
            <Plus weight="bold" />
          </Button>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  ),

  suggestions: (
    <div className="w-64 text-sm leading-relaxed">
      <Suggestions>
        The onboarding{" "}
        <SuggestionMark
          variant="clarity"
          suggestion="helps users get started"
          reason="Be specific about the outcome."
        >
          is really good
        </SuggestionMark>
        .
      </Suggestions>
    </div>
  ),

  // ---- Forms ----
  "auth-form": (
    <TallPreview className="w-64">
      <LoginForm />
    </TallPreview>
  ),
  "contact-form": (
    <TallPreview className="w-64">
      <ContactForm />
    </TallPreview>
  ),
  "feedback-form": (
    <TallPreview className="w-64">
      <FeedbackForm />
    </TallPreview>
  ),
  "payment-form": (
    <TallPreview className="w-64">
      <PaymentForm />
    </TallPreview>
  ),
  "settings-form": (
    <TallPreview className="w-64">
      <SettingsForm />
    </TallPreview>
  ),
  "waitlist-form": (
    <TallPreview className="w-64">
      <WaitlistForm />
    </TallPreview>
  ),
  survey: (
    <div className="w-72">
      <SurveyQuestion>
        <SurveyHeader>
          <SurveyEyebrow>Question 1</SurveyEyebrow>
          <SurveyTitle>What brings you here?</SurveyTitle>
        </SurveyHeader>
        <SurveyOptions defaultValue="explore">
          <SurveyOption value="explore">Explore the docs</SurveyOption>
          <SurveyOption value="learn">Learn the system</SurveyOption>
          <SurveyOption value="build">Build something</SurveyOption>
        </SurveyOptions>
      </SurveyQuestion>
    </div>
  ),

  // ---- Marketing ----
  bento: (
    <Bento className="w-72">
      <BentoItem size="sm" tone="brand">
        <BentoItemIcon>
          <Storefront weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>Storefront</BentoItemTitle>
        <BentoItemDescription>Sell anywhere.</BentoItemDescription>
      </BentoItem>
      <BentoItem size="sm" tone="purple">
        <BentoItemIcon>
          <Palette weight="bold" />
        </BentoItemIcon>
        <BentoItemTitle>Themes</BentoItemTitle>
        <BentoItemDescription>Four built in.</BentoItemDescription>
      </BentoItem>
    </Bento>
  ),

  pricing: (
    // A lone featured tier (PricingTier provides its own context, no grid needed).
    <PricingTier featured className="w-60 gap-4 p-5">
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
      </PricingFeatures>
      <PricingTierAction className="pt-0">
        <Button size="sm">Start trial</Button>
      </PricingTierAction>
    </PricingTier>
  ),

  "pricing-comparison": (
    // A trimmed matrix: two plans, the second featured, a few rows of checks/values.
    <PricingComparison featured={1} className="w-72 text-xs">
      <PricingComparisonHeader>
        <PricingComparisonPlan name="Starter" price="$0" />
        <PricingComparisonPlan
          name="Pro"
          price="$29"
          badge={
            <Badge variant="primary" pill size="sm">
              Pro
            </Badge>
          }
        />
      </PricingComparisonHeader>
      <PricingComparisonSection title="Features">
        <PricingComparisonRow label="Projects">
          <PricingComparisonCell>5</PricingComparisonCell>
          <PricingComparisonCell>Unlimited</PricingComparisonCell>
        </PricingComparisonRow>
        <PricingComparisonRow label="Priority support">
          <PricingComparisonCell included={false} />
          <PricingComparisonCell included />
        </PricingComparisonRow>
        <PricingComparisonRow label="SSO & SAML">
          <PricingComparisonCell included={false} />
          <PricingComparisonCell included />
        </PricingComparisonRow>
      </PricingComparisonSection>
    </PricingComparison>
  ),

  footer: (
    <Footer className="w-72 text-xs">
      <FooterTop>
        <FooterBrand>
          <BrandMark />
          <FooterTagline>Production-ready UI.</FooterTagline>
        </FooterBrand>
        <FooterColumns>
          <FooterColumn title="Product">
            <FooterLink href="#">Components</FooterLink>
            <FooterLink href="#">Pricing</FooterLink>
          </FooterColumn>
        </FooterColumns>
      </FooterTop>
      <FooterBottom>
        <FooterCopyright>© 2026 Koala UI</FooterCopyright>
      </FooterBottom>
    </Footer>
  ),

  gallery: (
    <Gallery className="w-72">
      <GalleryHeader className="pb-3">
        <GalleryTitle className="text-base">Gallery</GalleryTitle>
      </GalleryHeader>
      <GalleryMasonry className="columns-2 gap-2">
        <div className="mb-2 h-16 break-inside-avoid rounded-lg bg-muted" />
        <div className="mb-2 h-20 break-inside-avoid rounded-lg bg-accent" />
        <div className="mb-2 h-20 break-inside-avoid rounded-lg bg-accent" />
        <div className="mb-2 h-16 break-inside-avoid rounded-lg bg-muted" />
      </GalleryMasonry>
    </Gallery>
  ),

  hero: (
    <Hero className="w-72">
      <HeroContent className="gap-3 py-2 text-center">
        <Badge size="sm" variant="info" dot pill>
          New
        </Badge>
        <HeroTitle className="text-2xl">Ship faster with Koala UI</HeroTitle>
        <HeroActions>
          <Button size="sm">Get started</Button>
          <Button size="sm" variant="outline">
            Docs
          </Button>
        </HeroActions>
      </HeroContent>
    </Hero>
  ),

  navbar: (
    <Navbar className="w-72">
      <NavbarInner>
        <NavbarBrand href="#">
          <BrandMark />
        </NavbarBrand>
        <NavbarNav>
          <NavbarLink href="#">Docs</NavbarLink>
          <NavbarLink href="#">Pricing</NavbarLink>
        </NavbarNav>
        <NavbarSpacer />
        <NavbarActions>
          <Button size="sm">Sign up</Button>
        </NavbarActions>
      </NavbarInner>
    </Navbar>
  ),

  // ---- Product ----
  "activity-feed": (
    <div className="w-64">
      <ActivityFeed>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="info">
              <ChatCircle weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Sarah</ActivityActor> commented
              <ActivityTime>2h ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="success">
              <CheckCircle weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Marcus</ActivityActor> approved
              <ActivityTime>1h ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
        <ActivityItem>
          <ActivityMarker>
            <ActivityIcon tone="teal">
              <UploadSimple weight="bold" />
            </ActivityIcon>
          </ActivityMarker>
          <ActivityContent>
            <ActivityHeader>
              <ActivityActor>Priya</ActivityActor> uploaded
              <ActivityTime>30m ago</ActivityTime>
            </ActivityHeader>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>
    </div>
  ),

  checklist: (
    <div className="w-64">
      <Checklist value={1} total={3}>
        <ChecklistHeader>
          <ChecklistTitle>Get started</ChecklistTitle>
          <ChecklistProgress />
        </ChecklistHeader>
        <ChecklistItems>
          <ChecklistItem status="complete" icon={<UsersThree weight="bold" />}>
            <ChecklistItemContent>
              <ChecklistItemTitle>Invite your team</ChecklistItemTitle>
            </ChecklistItemContent>
          </ChecklistItem>
          <ChecklistItem status="active" icon={<GitBranch weight="bold" />}>
            <ChecklistItemContent>
              <ChecklistItemTitle>Connect a repository</ChecklistItemTitle>
            </ChecklistItemContent>
          </ChecklistItem>
          <ChecklistItem status="todo" icon={<CreditCard weight="bold" />}>
            <ChecklistItemContent>
              <ChecklistItemTitle>Set up billing</ChecklistItemTitle>
            </ChecklistItemContent>
          </ChecklistItem>
        </ChecklistItems>
      </Checklist>
    </div>
  ),

  field: (
    <div className="w-64">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <InputRoot>
          <InputField type="email" placeholder="you@example.com" readOnly />
        </InputRoot>
        <FieldHint>We only use this for receipts.</FieldHint>
      </Field>
    </div>
  ),

  tree: (
    <div className="w-64">
      <Tree defaultValue="button.tsx" defaultExpandedValues={["src"]}>
        <TreeItem value="src" label="src" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
          <TreeItem value="button.tsx" label="button.tsx" icon={<FileCode weight="bold" />} />
          <TreeItem value="card.tsx" label="card.tsx" icon={<FileCode weight="bold" />} />
        </TreeItem>
        <TreeItem value="globals.css" label="globals.css" icon={<FileText weight="bold" />} />
      </Tree>
    </div>
  ),

  sidebar: (
    <div className="h-36 overflow-hidden">
      <Sidebar className="h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem active>
              <SquaresFour weight="bold" /> Dashboard
            </SidebarItem>
            <SidebarItem>
              <Tray weight="bold" /> Inbox
            </SidebarItem>
            <SidebarItem>
              <Stack weight="bold" /> Projects
            </SidebarItem>
            <SidebarItem>
              <GearSix weight="bold" /> Settings
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  ),

  "multi-select": (
    <div className="w-64">
      <MultiSelect defaultValue={["eng", "design"]}>
        <MultiSelectTrigger>
          <MultiSelectValue placeholder="Select teams" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectItem value="eng">
            <Code weight="bold" /> Engineering
          </MultiSelectItem>
          <MultiSelectItem value="design">
            <PenNib weight="bold" /> Design
          </MultiSelectItem>
          <MultiSelectItem value="marketing">
            <Megaphone weight="bold" /> Marketing
          </MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  ),

  "video-player": (
    <div className="w-72">
      <VideoPlayer>
        <Video poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23202020'/%3E%3C/svg%3E" />
        <VideoControls>
          <VideoBar>
            <VideoPlayButton />
            <VideoSeek />
            <VideoTime />
          </VideoBar>
        </VideoControls>
      </VideoPlayer>
    </div>
  ),

  carousel: (
    <div className="w-72">
      <Carousel>
        <CarouselContent>
          <CarouselSlide>
            <div className="flex aspect-video items-center justify-center rounded-lg bg-accent text-sm font-medium">
              Slide 1
            </div>
          </CarouselSlide>
          <CarouselSlide>
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm font-medium">
              Slide 2
            </div>
          </CarouselSlide>
        </CarouselContent>
        <CarouselIndicators />
      </Carousel>
    </div>
  ),

  resizable: (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-32 w-72 rounded-xl border border-border"
    >
      <ResizablePanel defaultSize={40}>
        <div className="grid h-full place-items-center text-xs text-muted-foreground">
          Files
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <div className="grid h-full place-items-center text-xs text-muted-foreground">
          Editor
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),

  "file-upload": (
    <div className="w-64">
      <FileUpload>
        <FileUploadDropzone>
          <FileUploadIcon>
            <UploadSimple weight="bold" />
          </FileUploadIcon>
          <FileUploadTitle>Drop files or browse</FileUploadTitle>
          <FileUploadDescription>PNG, JPG up to 2 MB</FileUploadDescription>
          <FileUploadTrigger>Select files</FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  ),

  layout: (
    <div className="flex h-36 w-72 overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-16 border-r border-border bg-muted/40 p-2">
        <div className="mb-2 h-2 w-full rounded bg-muted-foreground/20" />
        <div className="mb-2 h-2 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-2 w-2/3 rounded bg-muted-foreground/20" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-8 items-center gap-1.5 border-b border-border px-3">
          <div className="h-2 w-16 rounded bg-muted-foreground/20" />
          <div className="ml-auto size-4 rounded-full bg-muted" />
        </div>
        <div className="flex-1 p-3">
          <div className="mb-2 h-2 w-1/2 rounded bg-muted-foreground/20" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-lg bg-muted" />
            <div className="h-10 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  ),

  "rich-text-editor": (
    <div className="w-64">
      <div className="flex items-center gap-0.5 border-b border-border pb-2 text-muted-foreground">
        <span className="grid size-7 place-items-center rounded-md text-sm font-bold">B</span>
        <span className="grid size-7 place-items-center rounded-md text-sm italic">I</span>
        <span className="grid size-7 place-items-center rounded-md text-sm underline">U</span>
        <span className="grid size-7 place-items-center rounded-md">
          <ListBullets weight="bold" />
        </span>
        <span className="grid size-7 place-items-center rounded-md">
          <Code weight="bold" />
        </span>
      </div>
      <div className="space-y-1.5 pt-3 text-sm">
        <p className="font-semibold">Release notes</p>
        <p className="text-muted-foreground">
          A <strong className="text-foreground">rich</strong> editor with{" "}
          <em>inline</em> formatting.
        </p>
      </div>
    </div>
  ),

  // ---- Product · portal/floating surfaces, rendered inline + inert ----
  dialog: (
    <div className="mx-auto w-64" aria-hidden>
      <div className={dialogSlots.content()}>
        <div className={dialogSlots.header()}>
          <h2 className={dialogSlots.title()}>Delete project?</h2>
          <p className={dialogSlots.description()}>This action cannot be undone.</p>
        </div>
        <div className={dialogSlots.footer()}>
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </div>
    </div>
  ),

  drawer: (
    <div
      className="mx-auto flex h-36 w-64 flex-col overflow-hidden rounded-xl border border-border bg-card"
      aria-hidden
    >
      <div className={drawerSlots.header()}>
        <h2 className={drawerSlots.title()}>Filters</h2>
      </div>
      <div className={drawerSlots.body()}>
        <p className="text-sm text-muted-foreground">
          Refine results by status, owner, and date.
        </p>
      </div>
      <div className={drawerSlots.footer()}>
        <Button variant="ghost" size="sm">
          Reset
        </Button>
        <Button size="sm">Apply</Button>
      </div>
    </div>
  ),

  "dropdown-menu": (
    <div className="mx-auto w-52" aria-hidden>
      <div className={dropdownSlots.content()}>
        <div className={dropdownSlots.item()}>
          <User weight="bold" /> Profile
        </div>
        <div className={dropdownSlots.item()}>
          <Gear weight="bold" /> Settings
        </div>
        <div className={dropdownSlots.separator()} />
        <div className={dropdownSlots.item()}>
          <Copy weight="bold" /> Copy link
        </div>
      </div>
    </div>
  ),

  "context-menu": (
    <div className="mx-auto w-52" aria-hidden>
      <div className={contextMenuSlots.content()}>
        <div className={contextMenuSlots.item()}>
          <FolderOpen weight="bold" /> Open
        </div>
        <div className={contextMenuSlots.item()}>
          <Copy weight="bold" /> Duplicate
        </div>
        <div className={contextMenuSlots.separator()} />
        <div className={contextMenuSlots.item({ className: "text-destructive" })}>
          <Trash weight="bold" /> Delete
        </div>
      </div>
    </div>
  ),

  popover: (
    <div className="mx-auto w-64" aria-hidden>
      <div className={popoverSlots.content()}>
        <h3 className={popoverSlots.title()}>Dimensions</h3>
        <p className={popoverSlots.description()}>
          Set the width and height of the selected layer.
        </p>
      </div>
    </div>
  ),

  command: (
    <div className="mx-auto w-64" aria-hidden>
      <div className={commandSlots.root()}>
        <div className={commandSlots.inputWrapper()}>
          <MagnifyingGlass weight="bold" className={commandSlots.inputIcon()} />
          <input
            className={commandSlots.input()}
            placeholder="Type a command…"
            readOnly
          />
        </div>
        <div className={commandSlots.list()}>
          <div className={commandSlots.groupHeading()}>Suggestions</div>
          <div className={commandSlots.item()}>
            <FileText weight="bold" /> New file
          </div>
          <div className={commandSlots.item()}>
            <Gear weight="bold" /> Settings
          </div>
        </div>
      </div>
    </div>
  ),

  "emoji-picker": (
    <TallPreview align="start">
      <EmojiPicker
        density="compact"
        storageKey={null}
        className="border-0 bg-transparent shadow-none"
      />
    </TallPreview>
  ),

  "date-picker": (
    <TallPreview className="scale-[0.9]">
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
        <Calendar mode="single" />
      </div>
    </TallPreview>
  ),

  "color-picker": (
    // Recomposed with a shorter square so the picker reads in the catalog's fixed-height stage
    // (the default square grew taller); the live component stays full-size on its own page.
    <ColorPicker density="compact" defaultValue="#5b8def" className="w-60">
      <ColorPickerArea className="h-28" />
      <ColorPickerControls />
    </ColorPicker>
  ),

  "cookie-consent": (
    <div className="w-64" aria-hidden>
      <CookieConsent
        categories={[
          { id: "necessary", label: "Necessary", required: true },
          { id: "analytics", label: "Analytics" },
        ]}
      >
        <CookieBanner className="!static !inset-auto !m-0 w-full !max-w-none rounded-xl">
          <CookieBannerIcon>
            <Cookie weight="bold" />
          </CookieBannerIcon>
          <CookieBannerContent>
            <CookieBannerTitle>We use cookies</CookieBannerTitle>
            <CookieBannerDescription>
              Essential cookies keep the site running.
            </CookieBannerDescription>
          </CookieBannerContent>
          <CookieBannerActions>
            <CookieRejectAllButton />
            <CookieAcceptAllButton />
          </CookieBannerActions>
        </CookieBanner>
      </CookieConsent>
    </div>
  ),

  lightbox: (
    <div className="mx-auto flex h-36 w-64 flex-col gap-2" aria-hidden>
      <div className="flex flex-1 items-center justify-center rounded-xl bg-muted">
        <ImageIcon weight="bold" className="size-10 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Mountain sunrise · 1 / 8</span>
        <ImageIcon weight="bold" className="size-4" />
      </div>
    </div>
  ),

  toast: (
    <div className="mx-auto w-72" aria-hidden>
      <div className={toastSlots.surface()}>
        <span className={toastSlots.iconWrap()}>
          <CheckCircle weight="bold" />
        </span>
        <div className={toastSlots.content()}>
          <div className={toastSlots.title()}>Changes saved</div>
          <div className={toastSlots.description()}>Your profile is up to date.</div>
        </div>
        <span className={toastSlots.close()}>×</span>
      </div>
    </div>
  ),
}
