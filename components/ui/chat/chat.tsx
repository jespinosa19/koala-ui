"use client"

import * as React from "react"
import { Collapsible } from "radix-ui"
import { Brain, CaretDown, MagnifyingGlass, Globe } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/tv"
import { createContext } from "@/lib/create-context"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * Chat: the AI conversation thread. The second piece of the AI module (pairs with
 * PromptInput; the AI Panel will compose both). Multi-part `tv` recipe with `slots`; each
 * Message carries its `role` to its parts through React Context (see docs/ARCHITECTURE.md
 * §2), so the bubble tint, row alignment, and meta alignment all follow from one prop.
 *
 * Built *out of* existing Koala parts: MessageAvatar wraps our Avatar, MessageAction wraps
 * our Button. Content is markup-agnostic: drop in text or your own rendered markdown and the
 * bubble styles the common elements (p, lists, code, pre) via descendant selectors.
 */
const chatVariants = tv({
  slots: {
    // The thread viewport. Scrolls its own overflow; the consumer sets a height/max-height.
    // `scroll-fade` dissolves the top/bottom of the thread into the surface as history scrolls
    // past, hinting at more above/below (the latest turn stays crisp once you reach the bottom).
    conversation: "flex flex-col gap-6 overflow-y-auto scroll-smooth scroll-fade",
    // One message row: avatar beside a vertical body. Role flips the side.
    message: "flex w-full gap-3",
    avatar: "mt-0.5",
    // The body column holds header + bubble + actions, capped so long turns wrap.
    body: "flex min-w-0 max-w-[80%] flex-col gap-1.5",
    header: "flex items-center gap-2 px-1",
    name: "text-sm font-medium text-foreground",
    time: "text-xs tabular-nums text-muted-foreground",
    // The bubble. A soft, uniform radius on all four corners (Messenger/iMessage style); the
    // medium weight gives short chat lines presence (the plain document resets to normal, below).
    // Light prose so dropped-in markdown (p/lists/code/pre/links) looks finished.
    bubble: [
      "w-fit rounded-xl px-3.5 py-2 text-sm font-medium leading-relaxed text-pretty [overflow-wrap:anywhere]",
      "[&_p]:m-0 [&_p+p]:mt-2 [&_:first-child]:mt-0",
      "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul_ul]:list-[circle]",
      // Headings, so a document-style (plain variant) answer reads like a page, not a wall of text.
      "[&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold",
      "[&_code]:rounded-sm [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
      "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-foreground/10 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
      "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2",
    ],
    actions: "flex items-center gap-0.5 px-1",
    // Typing indicator: three dots animated via globals.css (data-slot below). `bg-current`
    // so they take the bubble's text color.
    typing: "flex items-center gap-1 py-1",
    dot: "size-1.5 rounded-full bg-current",
    // Reasoning ("thinking") block: a collapsible the model fills with its chain of thought.
    // Collapsed it's a quiet one-line trigger; expanded it reveals the detail behind a rail.
    // `w-full` is load-bearing: MessageBody uses `items-start`, so without it this block would hug
    // its content's max width (long source rows set `white-space:nowrap` via `truncate`) and spill
    // past the body's width. Pinned to the body width, the min-w-0 chain below wraps/truncates inside.
    reasoning: "flex w-full min-w-0 flex-col",
    reasoningTrigger: [
      "group/reasoning inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md text-sm text-muted-foreground",
      "transition-colors duration-fast ease-out outline-none",
      "hover:text-foreground",
      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
    reasoningIcon: "size-4 shrink-0",
    reasoningChevron:
      "size-3.5 shrink-0 transition-transform duration-base ease-out group-data-[state=open]/reasoning:rotate-180",
    // Animated wrapper: overflow-hidden clips while the height tweens (tw-animate-css keyframes
    // retimed to Koala's tokens, same as Accordion/Tree). Padding lives on the inner div.
    reasoningContent: [
      // Small left padding keeps the rail (and the step dots that straddle it) clear of this
      // wrapper's clip edge: the dots protrude left of the rail and would otherwise be shaved.
      "min-w-0 overflow-hidden pl-2 text-sm text-muted-foreground",
      "duration-base ease-out",
      "data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
    ],
    // The reasoning detail sits behind a left rail, set in from the trigger.
    reasoningInner:
      "mt-2 flex min-w-0 flex-col gap-3 border-l-2 border-border pl-3 text-pretty leading-relaxed [&_p]:m-0 [&_p+p]:mt-2",
    // Agentic reasoning parts (browsing / searching / citing sources).
    // A labeled phase inside the chain of thought: "Searching", "Reviewing sources · 20".
    // `relative` so the dot marker can pin itself onto the content's left rail.
    reasoningStep: "relative flex min-w-0 flex-col gap-2",
    // A small dot sitting on the rail (one per step), the way Perplexity/ChatGPT bullet the
    // phases. The `border-background` ring punches it through the rail line so it reads as a
    // node, not a smudge. `-left` lands its center on the inner's left border (pl-3 + half-border).
    reasoningStepMarker:
      "pointer-events-none absolute -left-[calc(0.75rem+1px)] top-[0.6rem] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-muted-foreground/40",
    reasoningStepLabel: "text-xs font-medium text-muted-foreground/80",
    // Search queries: a wrap of monospace query pills, the way Perplexity shows them.
    reasoningQueries: "flex min-w-0 flex-wrap gap-1.5",
    reasoningQuery:
      "inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground",
    reasoningQueryIcon: "size-3.5 shrink-0 text-muted-foreground",
    // Sources: chips (favicon + domain) by default, or a bordered list (favicon + title + domain).
    reasoningSources: "flex min-w-0 flex-wrap gap-1.5",
    reasoningSourceList: "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border",
    // A source chip: a pill that links out. Clickable, so it gets the press scale + focus ring.
    reasoningSource: [
      "group/source inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1 text-xs text-foreground no-underline",
      "transition-[color,background-color,transform] duration-fast ease-out active:scale-[0.97]",
      "hover:bg-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ],
    // A source row inside the list variant: favicon + title, domain trailing.
    reasoningSourceRow: [
      "group/source flex min-w-0 cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-foreground no-underline",
      "transition-colors duration-fast ease-out [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border",
      "hover:bg-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
    ],
    reasoningSourceFavicon: "relative size-4 shrink-0",
    reasoningSourceFaviconImg: "size-4 rounded-sm object-contain",
    reasoningSourceFaviconFallback: "size-4 text-muted-foreground",
    reasoningSourceTitle: "min-w-0 truncate font-medium group-hover/source:text-foreground",
    reasoningSourceDomain: "min-w-0 truncate text-muted-foreground",
    reasoningSourceDomainTrailing: "ml-auto shrink-0 pl-3 font-mono text-xs text-muted-foreground",
  },
  variants: {
    role: {
      assistant: {
        message: "justify-start",
        body: "items-start",
        bubble: "bg-muted text-foreground",
      },
      user: {
        // No avatar by default: the body claims the right edge and its content right-aligns.
        message: "justify-end",
        body: "items-end",
        bubble: "bg-chat-sent text-white",
      },
    },
    // `plain` (default) is the Notion/ChatGPT document style: the assistant answer has no
    // surface, avatar, or identity: it reads as a page (see the assistant compound below).
    // `bubble` is the opt-in "with identity" look: every turn gets a chat bubble (and you'd
    // pair the assistant with a MessageAvatar). The user turn is a bubble in both.
    variant: {
      bubble: {},
      plain: {},
    },
  },
  compoundVariants: [
    {
      role: "assistant",
      variant: "plain",
      className: {
        // Full-bleed document: drop the bubble surface, radius, padding, width cap, and the
        // bubble's medium weight (long-form body reads at normal weight).
        body: "max-w-full",
        bubble: "w-full max-w-full rounded-none bg-transparent px-0 py-0 font-normal text-foreground",
      },
    },
  ],
  defaultVariants: { role: "assistant", variant: "plain" },
})

type ChatSlots = ReturnType<typeof chatVariants>
type Role = NonNullable<VariantProps<typeof chatVariants>["role"]>
type ChatVariant = NonNullable<VariantProps<typeof chatVariants>["variant"]>

// Conversation sets the default style for its turns; a Message can still override per-turn.
// A plain default context (not the throwing helper) so a stray Message still renders.
const ConversationVariantContext = React.createContext<ChatVariant>("plain")

const [MessageProvider, useMessageContext] = createContext<{
  role: Role
  slots: ChatSlots
}>("Message")

const [ReasoningProvider, useReasoningContext] = createContext<{
  streaming: boolean
  slots: ChatSlots
}>("MessageReasoning")

// ─── Conversation ─────────────────────────────────────────────────────────────

export interface ConversationProps extends React.ComponentProps<"div"> {
  /**
   * Style for the turns inside. `plain` (default) is the Notion/ChatGPT document style: the
   * assistant answer renders as a page with no bubble, avatar, or identity. `bubble` is the
   * opt-in "with identity" look (every turn a chat bubble; pair the assistant with a
   * MessageAvatar). A Message can override its own `variant`.
   */
  variant?: ChatVariant
}

export function Conversation({ variant = "plain", className, ...props }: ConversationProps) {
  // Role-independent slot, computed locally (no message context here).
  const slots = chatVariants()
  return (
    <ConversationVariantContext.Provider value={variant}>
      <div
        data-slot="conversation"
        data-variant={variant}
        role="log"
        aria-live="polite"
        className={slots.conversation({ className })}
        {...props}
      />
    </ConversationVariantContext.Provider>
  )
}

// ─── Message ────────────────────────────────────────────────────────────────

export interface MessageProps extends React.ComponentProps<"div"> {
  /** Who sent the turn: drives alignment and bubble tint. @default "assistant" */
  role?: Role
  /** Override the conversation's style for this turn (`bubble` | `plain`). */
  variant?: ChatVariant
}

export function Message({ role = "assistant", variant, className, ...props }: MessageProps) {
  // Resolve style: explicit prop > the Conversation's default.
  const conversationVariant = React.useContext(ConversationVariantContext)
  const slots = chatVariants({ role, variant: variant ?? conversationVariant })
  return (
    <MessageProvider role={role} slots={slots}>
      <div
        data-slot="message"
        data-role={role}
        className={slots.message({ className })}
        {...props}
      />
    </MessageProvider>
  )
}

// ─── MessageAvatar ────────────────────────────────────────────────────────────

export interface MessageAvatarProps
  extends React.ComponentProps<typeof AvatarRoot> {
  src?: string
  /** Used for the alt text and to derive fallback initials. */
  name?: string
}

/** The sender avatar (assistant side). Wraps our Avatar; falls back to initials. */
export function MessageAvatar({
  src,
  name,
  size = "sm",
  className,
  children,
  ...props
}: MessageAvatarProps) {
  const { slots } = useMessageContext("MessageAvatar")
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
    : undefined
  return (
    <AvatarRoot
      data-slot="message-avatar"
      size={size}
      className={slots.avatar({ className })}
      {...props}
    >
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback>{children ?? initials}</AvatarFallback>
    </AvatarRoot>
  )
}

// ─── MessageBody ──────────────────────────────────────────────────────────────

/** Vertical column holding the header, bubble, and actions; aligns to the message side. */
export function MessageBody({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useMessageContext("MessageBody")
  return <div data-slot="message-body" className={slots.body({ className })} {...props} />
}

// ─── MessageHeader / Name / Time ───────────────────────────────────────────────

export function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useMessageContext("MessageHeader")
  return <div data-slot="message-header" className={slots.header({ className })} {...props} />
}

export function MessageName({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useMessageContext("MessageName")
  return <span data-slot="message-name" className={slots.name({ className })} {...props} />
}

export function MessageTime({ className, ...props }: React.ComponentProps<"span">) {
  const { slots } = useMessageContext("MessageTime")
  return <span data-slot="message-time" className={slots.time({ className })} {...props} />
}

// ─── MessageContent (bubble) ────────────────────────────────────────────────

export function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useMessageContext("MessageContent")
  return <div data-slot="message-content" className={slots.bubble({ className })} {...props} />
}

// ─── MessageActions / MessageAction ────────────────────────────────────────────

export function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useMessageContext("MessageActions")
  return <div data-slot="message-actions" className={slots.actions({ className })} {...props} />
}

/**
 * A single hover action under a message: copy, regenerate, thumbs up/down. A thin wrapper
 * over our `Button` (ghost + icon-only by default), so it inherits the press scale, tooltip
 * (from `aria-label`), and focus ring. Override any Button prop.
 */
export function MessageAction({
  variant = "ghost",
  size = "sm",
  iconOnly = true,
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      data-slot="message-action"
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

// ─── MessageTyping ──────────────────────────────────────────────────────────

/** The "is typing" indicator: three animated dots. Place inside a `MessageContent`. */
export function MessageTyping({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useMessageContext("MessageTyping")
  return (
    <div
      data-slot="message-typing"
      role="status"
      aria-label="Assistant is typing"
      className={slots.typing({ className })}
      {...props}
    >
      <span data-slot="message-typing-dot" className={slots.dot()} />
      <span data-slot="message-typing-dot" className={slots.dot()} />
      <span data-slot="message-typing-dot" className={slots.dot()} />
    </div>
  )
}

// ─── MessageReasoning ─────────────────────────────────────────────────────────

export interface MessageReasoningProps
  extends React.ComponentProps<typeof Collapsible.Root> {
  /**
   * The model is still reasoning: the icon pulses and the trigger defaults to "Thinking…".
   * Flip to `false` once done (pass a summary like "Thought for 8s" as the trigger's children).
   */
  streaming?: boolean
}

/**
 * MessageReasoning: the collapsible "thinking" block (Claude/ChatGPT style). Collapsed it's a
 * quiet one-line trigger; click it to reveal the chain of thought. Wraps Radix Collapsible, so
 * keyboard + ARIA come for free. Controlled (`open`/`onOpenChange`) or uncontrolled
 * (`defaultOpen`). Keep it open while streaming, then let it collapse to a summary.
 */
export function MessageReasoning({
  streaming = false,
  className,
  ...props
}: MessageReasoningProps) {
  const slots = chatVariants()
  return (
    <ReasoningProvider streaming={streaming} slots={slots}>
      <Collapsible.Root
        data-slot="message-reasoning"
        className={slots.reasoning({ className })}
        {...props}
      />
    </ReasoningProvider>
  )
}

export function MessageReasoningTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Trigger>) {
  const { streaming, slots } = useReasoningContext("MessageReasoningTrigger")
  return (
    <Collapsible.Trigger
      data-slot="message-reasoning-trigger"
      className={slots.reasoningTrigger({ className })}
      {...props}
    >
      <Brain weight="bold"
        aria-hidden
        className={cn(
          slots.reasoningIcon(),
          // While reasoning, the glyph reads "alive": a brand-tinted pulse (held under
          // reduced-motion).
          streaming && "text-brand motion-safe:animate-pulse",
        )}
      />
      <span>{children ?? (streaming ? "Thinking…" : "Reasoning")}</span>
      <CaretDown weight="bold" aria-hidden className={slots.reasoningChevron()} />
    </Collapsible.Trigger>
  )
}

export function MessageReasoningContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible.Content>) {
  const { slots } = useReasoningContext("MessageReasoningContent")
  return (
    <Collapsible.Content
      data-slot="message-reasoning-content"
      className={slots.reasoningContent()}
      {...props}
    >
      <div className={slots.reasoningInner({ className })}>{children}</div>
    </Collapsible.Content>
  )
}

// ─── Agentic reasoning: steps, search queries, sources ─────────────────────────
//
// When the model browses or searches the web, the reasoning block stops being a
// wall of text and becomes a log of *what it did*: phases ("Searching", "Reviewing
// sources"), the queries it ran, and the URLs it consulted (Perplexity / ChatGPT
// style). These parts compose *inside* MessageReasoningContent so they inherit the
// left rail, and reuse the same slots recipe.

const [SourcesProvider, useSourcesContext] = createContext<{
  layout: "chips" | "list"
  slots: ChatSlots
}>("MessageReasoningSources")

/** Strip protocol + leading "www." to a clean hostname for a source label. */
function domainFromHref(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "")
  } catch {
    return href.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]
  }
}

/**
 * MessageReasoningStep: one labeled phase inside the chain of thought. The optional
 * `label` is a quiet caption above the step's body ("Searching", "Browsing 17 pages",
 * "Reviewing sources · 20"); children hold whatever the step produced (text, queries,
 * sources). A dot marker pins itself onto the content rail so a column of steps reads as a
 * timeline; `status="active"` turns it into a brand pulse (the in-progress phase), matching
 * the trigger's streaming pulse. Set `marker={false}` to drop the dot.
 */
export interface MessageReasoningStepProps extends React.ComponentProps<"div"> {
  /** A quiet caption above the step body, e.g. "Searching" or "Reviewing sources · 20". */
  label?: React.ReactNode
  /** `done` (default) is a quiet gray dot; `active` is a brand pulse for the in-progress phase. */
  status?: "active" | "done"
  /** Draw the rail dot. @default true */
  marker?: boolean
}

export function MessageReasoningStep({
  label,
  status = "done",
  marker = true,
  className,
  children,
  ...props
}: MessageReasoningStepProps) {
  const { slots } = useReasoningContext("MessageReasoningStep")
  return (
    <div
      data-slot="message-reasoning-step"
      data-status={status}
      className={slots.reasoningStep({ className })}
      {...props}
    >
      {marker ? (
        <span
          aria-hidden
          data-slot="message-reasoning-step-marker"
          className={cn(
            slots.reasoningStepMarker(),
            status === "active" && "bg-brand motion-safe:animate-pulse",
          )}
        />
      ) : null}
      {label != null ? (
        <span data-slot="message-reasoning-step-label" className={slots.reasoningStepLabel()}>
          {label}
        </span>
      ) : null}
      {children}
    </div>
  )
}

/** Wrap of search-query pills. Place `MessageReasoningQuery` children inside. */
export function MessageReasoningQueries({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useReasoningContext("MessageReasoningQueries")
  return (
    <div data-slot="message-reasoning-queries" className={slots.reasoningQueries({ className })} {...props} />
  )
}

/** A single search query the model ran: a monospace pill with a magnifier. */
export function MessageReasoningQuery({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { slots } = useReasoningContext("MessageReasoningQuery")
  return (
    <span data-slot="message-reasoning-query" className={slots.reasoningQuery({ className })} {...props}>
      <MagnifyingGlass weight="bold" aria-hidden className={slots.reasoningQueryIcon()} />
      <span className="truncate">{children}</span>
    </span>
  )
}

/**
 * MessageReasoningSources: the URLs the model consulted. `layout="chips"` (default) is the
 * compact favicon+domain pill row (ChatGPT's "Browsing …"); `layout="list"` is the bordered
 * favicon+title+domain list (Perplexity's "Reviewing sources"). The layout flows to each
 * `MessageReasoningSource` through context.
 */
export interface MessageReasoningSourcesProps extends React.ComponentProps<"div"> {
  /** `chips` = compact domain pills (default); `list` = bordered title rows. */
  layout?: "chips" | "list"
}

export function MessageReasoningSources({
  layout = "chips",
  className,
  ...props
}: MessageReasoningSourcesProps) {
  const { slots } = useReasoningContext("MessageReasoningSources")
  const slot = layout === "list" ? slots.reasoningSourceList : slots.reasoningSources
  return (
    <SourcesProvider layout={layout} slots={slots}>
      <div data-slot="message-reasoning-sources" data-layout={layout} className={slot({ className })} {...props} />
    </SourcesProvider>
  )
}

/** A small favicon for a source, falling back to a Globe glyph when missing or it fails to load. */
function SourceFavicon({ src, slots }: { src?: string; slots: ChatSlots }) {
  const [failed, setFailed] = React.useState(false)
  function handleError() {
    setFailed(true)
  }
  return (
    <span data-slot="message-reasoning-source-favicon" className={slots.reasoningSourceFavicon()}>
      {src && !failed ? (
        // Decorative: the link's accessible name already carries the source title/domain.
        <img src={src} alt="" aria-hidden loading="lazy" onError={handleError} className={slots.reasoningSourceFaviconImg()} />
      ) : (
        <Globe aria-hidden weight="bold" className={slots.reasoningSourceFaviconFallback()} />
      )}
    </span>
  )
}

/**
 * MessageReasoningSource: one consulted URL. Renders an `<a>` (links out, new tab) so it gets
 * the press scale + focus ring. Reads its layout from `MessageReasoningSources`: a domain pill
 * in `chips`, or a favicon+title row (domain trailing) in `list`. Pass `favicon` to override the
 * derived icon; `title` defaults to the domain when omitted.
 */
export interface MessageReasoningSourceProps
  extends Omit<React.ComponentProps<"a">, "title"> {
  /** The source URL. The label and (by default) the favicon are derived from it. */
  href: string
  /** Headline for the `list` layout; defaults to the domain. Ignored by `chips`. */
  title?: React.ReactNode
  /** Favicon URL. Defaults to a service icon derived from the href; falls back to a Globe glyph. */
  favicon?: string
}

export function MessageReasoningSource({
  href,
  title,
  favicon,
  className,
  children,
  ...props
}: MessageReasoningSourceProps) {
  const { layout, slots } = useSourcesContext("MessageReasoningSource")
  const domain = domainFromHref(href)
  const faviconSrc =
    favicon ?? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`

  if (layout === "list") {
    return (
      <a
        data-slot="message-reasoning-source"
        href={href}
        target="_blank"
        rel="noreferrer"
        className={slots.reasoningSourceRow({ className })}
        {...props}
      >
        <SourceFavicon src={faviconSrc} slots={slots} />
        <span className={slots.reasoningSourceTitle()}>{title ?? children ?? domain}</span>
        <span className={slots.reasoningSourceDomainTrailing()}>{domain}</span>
      </a>
    )
  }

  return (
    <a
      data-slot="message-reasoning-source"
      href={href}
      target="_blank"
      rel="noreferrer"
      className={slots.reasoningSource({ className })}
      {...props}
    >
      <SourceFavicon src={faviconSrc} slots={slots} />
      <span className={slots.reasoningSourceDomain()}>{children ?? domain}</span>
    </a>
  )
}

export { chatVariants }
