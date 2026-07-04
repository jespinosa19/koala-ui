import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"

import {
  ChatDemo,
  RolesDemo,
  PlainDemo,
  ActionsDemo,
  MarkdownDemo,
  TypingDemo,
  ReasoningDemo,
} from "./demos"

export const metadata = {
  title: "Chat",
}

export default function ChatDocsPage() {
  return (
    <>
      <DocHeader
        title="Chat"
        description="The AI conversation thread, the second piece of the AI module (it pairs with Prompt Input). The assistant answers as a document by default, the Notion and ChatGPT style: no bubble, no avatar, no identity, just a page. The user turn stays a bubble. Flip to variant='bubble' for the with-identity look. Content is markup-agnostic, with hover actions, a streaming typing indicator, and a reasoning block that scales from a one-line summary to a full agentic log of the searches it ran and the sources it cited."
      />

      <ComponentPreview
        previewClassName="items-start"
        code={`{/* Document style is the default: the assistant answer has no bubble or avatar. */}
<Conversation>
  <Message role="user">
    <MessageBody>
      <MessageContent>Explain how the density system works in this codebase.</MessageContent>
    </MessageBody>
  </Message>
  <Message role="assistant">
    {/* no MessageAvatar: the answer is a page, not an identity */}
    <MessageBody>
      <MessageContent>
        <p>Density is a single axis, <strong>comfortable</strong> or <strong>compact</strong>…</p>
        <h3>How it works</h3>
        <ul>
          <li>DensityProvider puts the active density on the context.</li>
          <li>Components read it with the useDensity hook.</li>
        </ul>
      </MessageContent>
    </MessageBody>
  </Message>
</Conversation>`}
      >
        <PlainDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="chat"
          dependencies="npm install radix-ui tailwind-variants tailwind-merge @phosphor-icons/react"
        />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every part is a named export, never dot-notation, so each one crosses the server and
          client boundary cleanly. <code className="font-mono text-sm">Conversation</code> is the
          scrollable thread; each <code className="font-mono text-sm">Message</code> carries its{" "}
          <code className="font-mono text-sm">role</code> to its parts through context, so one prop
          drives the side, tint, and meta alignment. Compose only the parts a turn needs.
        </p>
        <CodeSnippet
          filename="anatomy.tsx"
          className="mt-4"
          code={`<Conversation>
  <Message role="assistant">
    <MessageAvatar name="Koala" />
    <MessageBody>
      <MessageHeader>
        <MessageName>Koala</MessageName>
        <MessageTime>2:34 PM</MessageTime>
      </MessageHeader>

      <MessageReasoning>
        <MessageReasoningTrigger>Thought for 6s</MessageReasoningTrigger>
        <MessageReasoningContent>…</MessageReasoningContent>
      </MessageReasoning>

      <MessageContent>…</MessageContent>

      <MessageActions>
        <MessageAction aria-label="Copy">…</MessageAction>
      </MessageActions>
    </MessageBody>
  </Message>
</Conversation>`}
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Conversation,
  Message,
  MessageAvatar,
  MessageBody,
  MessageContent,
} from "@/components/ui/chat"

export function Thread() {
  return (
    <Conversation className="max-h-[32rem]">
      <Message role="user">
        <MessageBody>
          <MessageContent>Where is the theme applied on load?</MessageContent>
        </MessageBody>
      </Message>
      <Message role="assistant">
        <MessageAvatar name="Koala" />
        <MessageBody>
          <MessageContent>In app/layout.tsx, via a blocking script before paint.</MessageContent>
        </MessageBody>
      </Message>
    </Conversation>
  )
}`}
        />
      </DocSection>

      <DocSection title="Roles">
        <p className="mt-4 text-pretty text-muted-foreground">
          A message&apos;s <code className="font-mono text-sm">role</code> is the only switch.{" "}
          <code className="font-mono text-sm">assistant</code> aligns left with an avatar and a
          muted bubble; <code className="font-mono text-sm">user</code> aligns right with a solid
          blue bubble. Both use a soft, uniform radius on all four corners.
        </p>
        <ComponentPreview previewClassName="items-start" code={`<Message role="user">
  <MessageBody>
    <MessageContent>Why is pnpm build failing on CI but not locally?</MessageContent>
  </MessageBody>
</Message>

<Message role="assistant">
  <MessageAvatar name="Koala" src="/koala-logo.webp" />
  <MessageBody>
    <MessageContent>CI runs Node 18, but the config calls structuredClone…</MessageContent>
  </MessageBody>
</Message>`}>
          <RolesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With avatar (bubble)">
        <p className="mt-4 text-pretty text-muted-foreground">
          The default is the document style above. For a chat with an identity, the
          &ldquo;robotized&rdquo; look, set{" "}
          <code className="font-mono text-sm">{`variant="bubble"`}</code> on the{" "}
          <code className="font-mono text-sm">Conversation</code>: every turn gets a bubble, and
          you pair the assistant with a <code className="font-mono text-sm">MessageAvatar</code>,
          name, time, and actions. A per-message{" "}
          <code className="font-mono text-sm">variant</code> overrides the conversation default.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<Conversation variant="bubble" className="max-h-[26rem]">
  <Message role="user">
    <MessageBody>
      <MessageContent>Add an empty state to the data table when there are no rows.</MessageContent>
    </MessageBody>
  </Message>

  <Message role="assistant">
    <MessageAvatar name="Koala" src="/koala-logo.webp" />
    <MessageBody>
      <MessageHeader>
        <MessageName>Koala</MessageName>
        <MessageTime>2:34 PM</MessageTime>
      </MessageHeader>
      <MessageContent>
        <p>Done. I dropped an EmptyState into the table body:</p>
        <ul>
          <li>Renders when rows.length === 0.</li>
          <li>Stays hidden while loading so the skeleton shows.</li>
        </ul>
      </MessageContent>
      <MessageActions>
        <MessageAction aria-label="Copy"><Copy /></MessageAction>
        <MessageAction aria-label="Regenerate"><ArrowsClockwise /></MessageAction>
      </MessageActions>
    </MessageBody>
  </Message>
</Conversation>`}
        >
          <ChatDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Rich content">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">MessageContent</code> is markup-agnostic. Drop in
          plain text or your own rendered markdown; the bubble styles the common elements
          (paragraphs, headings, lists, inline <code className="font-mono text-sm">code</code>,{" "}
          <code className="font-mono text-sm">pre</code> blocks, and links) through descendant
          selectors, tinted to read on either bubble.
        </p>
        <ComponentPreview previewClassName="items-start" code={`<MessageContent>
  <p>Define the component recipe with <code>tv</code> and read its variants:</p>
  <pre><code>{\`const button = tv({
  base: "inline-flex items-center justify-center",
  variants: { size: { sm: "h-8 px-3", md: "h-10 px-4" } },
})\`}</code></pre>
  <p>See the <a href="/docs/foundations/density">foundations</a> for the house style.</p>
</MessageContent>`}>
          <MarkdownDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Actions">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">MessageActions</code> holds a row of{" "}
          <code className="font-mono text-sm">MessageAction</code> buttons for copy, regenerate, and
          feedback. Each wraps our <code className="font-mono text-sm">Button</code>, so it inherits
          the press scale, the focus ring, and a tooltip drawn from its{" "}
          <code className="font-mono text-sm">aria-label</code>.
        </p>
        <ComponentPreview previewClassName="items-start" code={`<MessageActions>
  <MessageAction aria-label="Copy"><Copy /></MessageAction>
  <MessageAction aria-label="Regenerate"><ArrowsClockwise /></MessageAction>
  <MessageAction aria-label="Good response"><ThumbsUp /></MessageAction>
  <MessageAction aria-label="Bad response"><ThumbsDown /></MessageAction>
</MessageActions>`}>
          <ActionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Typing indicator">
        <p className="mt-4 text-pretty text-muted-foreground">
          While a response streams, drop a{" "}
          <code className="font-mono text-sm">MessageTyping</code> inside a{" "}
          <code className="font-mono text-sm">MessageContent</code>. Three dots ripple left to
          right, and hold still under reduced-motion.
        </p>
        <ComponentPreview previewClassName="items-start" code={`<Message role="assistant">
  <MessageAvatar name="Koala" />
  <MessageBody>
    <MessageContent><MessageTyping /></MessageContent>
  </MessageBody>
</Message>`}>
          <TypingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Reasoning">
        <p className="mt-4 text-pretty text-muted-foreground">
          The collapsible &ldquo;thinking&rdquo; block, the way Claude and ChatGPT show it. While{" "}
          <code className="font-mono text-sm">streaming</code> the icon pulses and the trigger reads
          &ldquo;Investigating…&rdquo;; once done, it settles to a summary like &ldquo;Investigated
          14 sources&rdquo; that anyone can expand. For a simple answer, pass plain text; for an
          agentic run, the block becomes a log of what it did. Group each phase in a{" "}
          <code className="font-mono text-sm">MessageReasoningStep</code> (an optional{" "}
          <code className="font-mono text-sm">label</code> captions it, a dot pins onto the rail so a
          column reads as a timeline, and{" "}
          <code className="font-mono text-sm">{`status="active"`}</code> pulses the in-progress one).
          Show the searches it ran with{" "}
          <code className="font-mono text-sm">MessageReasoningQuery</code> and the URLs it consulted
          with <code className="font-mono text-sm">MessageReasoningSource</code>, as compact favicon
          and domain chips by default or a bordered title list via{" "}
          <code className="font-mono text-sm">{`layout="list"`}</code>. The domain and favicon are
          derived from the <code className="font-mono text-sm">href</code>. Built on Radix
          Collapsible, so keyboard and ARIA come for free. Press{" "}
          <em>Ask again</em> to watch it stream through the phases.
        </p>
        <ComponentPreview previewClassName="items-start" code={`<MessageReasoning streaming={thinking} open={open} onOpenChange={setOpen}>
  <MessageReasoningTrigger>
    {thinking ? "Investigating…" : "Investigated 14 sources"}
  </MessageReasoningTrigger>
  <MessageReasoningContent>
    <MessageReasoningStep>
      <p>Reproducing the flash of the wrong theme on first load.</p>
    </MessageReasoningStep>

    <MessageReasoningStep label="Searching the codebase">
      <MessageReasoningQueries>
        <MessageReasoningQuery>useTheme localStorage</MessageReasoningQuery>
        <MessageReasoningQuery>suppressHydrationWarning</MessageReasoningQuery>
      </MessageReasoningQueries>
    </MessageReasoningStep>

    <MessageReasoningStep label="Reading the docs">
      <MessageReasoningSources>
        <MessageReasoningSource href="https://nextjs.org" />
        <MessageReasoningSource href="https://react.dev" />
        <MessageReasoningSource href="#" favicon="">+10 more</MessageReasoningSource>
      </MessageReasoningSources>
    </MessageReasoningStep>

    <MessageReasoningStep label="Reviewing sources · 2" status="active">
      <MessageReasoningSources layout="list">
        <MessageReasoningSource
          href="https://nextjs.org"
          title="Avoiding a theme hydration mismatch"
        />
        <MessageReasoningSource
          href="https://react.dev"
          title="You Might Not Need an Effect"
        />
      </MessageReasoningSources>
    </MessageReasoningStep>
  </MessageReasoningContent>
</MessageReasoning>`}>
          <ReasoningDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono text-sm font-semibold">Conversation</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The scrollable thread viewport (<code className="font-mono text-sm">{`role="log"`}</code>,
              a polite live region, so appended turns are announced). A flex column with a gap; set a
              height or max-height to make it scroll. <code className="font-mono text-sm">variant</code>{" "}
              (<code className="font-mono text-sm">{`"plain"`}</code> default,{" "}
              <code className="font-mono text-sm">{`"bubble"`}</code>) sets the style for every turn
              inside. Forwards all native <code className="font-mono text-sm">div</code> props.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">Message</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              One turn. <code className="font-mono text-sm">{`role?: "assistant" | "user"`}</code>{" "}
              (default <code className="font-mono text-sm">{`"assistant"`}</code>) drives alignment
              and bubble tint, and flows to every part through context.{" "}
              <code className="font-mono text-sm">variant</code> overrides the conversation default
              for this turn.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">MessageAvatar</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Wraps our <code className="font-mono text-sm">Avatar</code>. Takes{" "}
              <code className="font-mono text-sm">src</code> or{" "}
              <code className="font-mono text-sm">name</code> (initials fallback) plus any Avatar
              prop (e.g. <code className="font-mono text-sm">size</code>); children override the
              fallback, for example with an icon.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              MessageBody · MessageHeader · MessageName · MessageTime · MessageContent
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">MessageBody</code> is the vertical column that
              aligns to the message side; <code className="font-mono text-sm">MessageContent</code>{" "}
              is the bubble (markup-agnostic). Header, Name, and Time are the optional meta row above
              the bubble.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              MessageActions · MessageAction · MessageTyping
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">MessageAction</code> is a ghost icon{" "}
              <code className="font-mono text-sm">Button</code> (all Button props apply, and the{" "}
              <code className="font-mono text-sm">aria-label</code> drives both the name and a
              tooltip); <code className="font-mono text-sm">MessageTyping</code> is the three-dot
              streaming indicator.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              MessageReasoning · MessageReasoningTrigger · MessageReasoningContent
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The collapsible thinking block (Radix Collapsible).{" "}
              <code className="font-mono text-sm">MessageReasoning</code> takes{" "}
              <code className="font-mono text-sm">streaming</code> (pulses the icon, defaults the
              label to &ldquo;Thinking…&rdquo;) plus Collapsible&apos;s{" "}
              <code className="font-mono text-sm">open</code> /{" "}
              <code className="font-mono text-sm">defaultOpen</code> /{" "}
              <code className="font-mono text-sm">onOpenChange</code>. The trigger&apos;s children
              are the label; the content holds the chain of thought behind a left rail.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              MessageReasoningStep · MessageReasoningQueries · MessageReasoningQuery
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">MessageReasoningStep</code> is one phase of an
              agentic reasoning log. <code className="font-mono text-sm">label</code> captions it,{" "}
              <code className="font-mono text-sm">{`status?: "active" | "done"`}</code> (default{" "}
              <code className="font-mono text-sm">{`"done"`}</code>) turns the rail dot into a brand
              pulse, and <code className="font-mono text-sm">marker={`{false}`}</code> drops the dot.{" "}
              <code className="font-mono text-sm">MessageReasoningQuery</code> is a monospace search
              pill; wrap several in a{" "}
              <code className="font-mono text-sm">MessageReasoningQueries</code> row.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              MessageReasoningSources · MessageReasoningSource
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">MessageReasoningSources</code> groups the consulted
              URLs. <code className="font-mono text-sm">{`layout?: "chips" | "list"`}</code> (default{" "}
              <code className="font-mono text-sm">{`"chips"`}</code>) switches between compact domain
              pills and a bordered title list, and flows to each source through context.{" "}
              <code className="font-mono text-sm">MessageReasoningSource</code> takes a required{" "}
              <code className="font-mono text-sm">href</code> (the domain and favicon derive from it),
              an optional <code className="font-mono text-sm">title</code> for the list layout, and an
              optional <code className="font-mono text-sm">favicon</code> override (it falls back to a
              globe glyph). It renders an anchor that opens in a new tab.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "What does the role prop on Message control?", a: "role is the only switch: assistant aligns left with an avatar and a muted bubble, while user aligns right with a solid blue bubble. The value flows to every part through context, and both bubbles use a soft, uniform radius on all four corners." },
            { q: "What is the difference between the plain and bubble variants?", a: "plain is the default document style: the assistant answer renders as a page with no bubble, avatar, or identity, like Notion or ChatGPT. bubble is the with-identity look where every turn is a chat bubble and you pair the assistant with a MessageAvatar. Set it on Conversation for the whole thread, or per Message to override." },
            { q: "How do I show a streaming response?", a: "Drop a MessageTyping inside a MessageContent while the response streams. It renders three dots that ripple left to right, and holds still under reduced-motion. For the thinking phase, keep MessageReasoning open with streaming set, then collapse it to a summary once done." },
            { q: "How do I render markdown inside a message?", a: "MessageContent is markup-agnostic, so pass plain text or your own rendered markdown. The bubble styles paragraphs, headings, lists, inline code, pre blocks, and links via descendant selectors, tinted to read on either bubble." },
            { q: "How do I show the searches and sources the model used?", a: "Inside MessageReasoningContent, group each phase in a MessageReasoningStep. Put the searches it ran in MessageReasoningQuery pills, and the URLs it consulted in MessageReasoningSource. Sources are favicon and domain chips by default, or set layout=\"list\" on MessageReasoningSources for favicon, title, and domain rows." },
            { q: "Where do the source domain and favicon come from?", a: "Both are derived from the source href: the domain is the hostname with any leading www stripped, and the favicon defaults to a service icon for that domain, falling back to a globe glyph if it is missing or fails to load. Pass title to set the list headline, or favicon to override the icon." },
            { q: "Does the thread announce new messages to screen readers?", a: "Yes. Conversation is the scrollable viewport with role=\"log\" and a polite live region, so appended messages are announced. Set a height or max-height on it to make it scroll." },
            { q: "How do the action buttons work?", a: "MessageActions holds a row of MessageAction buttons, each a ghost icon Button, so all Button props apply and the aria-label drives both the accessible name and a tooltip. Use them for copy, regenerate, and feedback." },
          ]}
        />
      </DocSection>
    </>
  )
}
