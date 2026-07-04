import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"

import { AIPanelDemo, OverlayDemo, EmptyDemo, EmptyStatesDemo, WindowModesDemo } from "./demos"

export const metadata = {
  title: "AI Panel",
}

export default function AIPanelDocsPage() {
  return (
    <>
      <DocHeader
        title="AI Panel"
        description="The assistant sidepanel: a header, a scrollable conversation, and a pinned composer in one column. The piece that brings the AI module together: drop a Chat in the body and a Prompt Input in the footer. Pure layout, so it docks in a page or drops into a Drawer for an overlay."
      />

      <ComponentPreview
        previewClassName="items-start"
        code={`<AIPanel>
  <AIPanelHeader>
    <Avatar><AvatarFallback className="bg-brand/10 text-brand"><Sparkle /></AvatarFallback></Avatar>
    <AIPanelHeading>
      <AIPanelTitle>Koala Assistant</AIPanelTitle>
      <AIPanelDescription>Always here to help</AIPanelDescription>
    </AIPanelHeading>
    <AIPanelActions>
      <AIPanelAction aria-label="History"><ClockCounterClockwise /></AIPanelAction>
      <AIPanelAction aria-label="New chat"><PencilSimpleLine /></AIPanelAction>
    </AIPanelActions>
  </AIPanelHeader>

  <AIPanelBody>
    <Conversation>
      {messages.map((m) => (
        <Message key={m.id} role={m.role}>
          {m.role === "assistant" && <MessageAvatar name="Koala" />}
          <MessageBody><MessageContent>{m.text}</MessageContent></MessageBody>
        </Message>
      ))}
    </Conversation>
  </AIPanelBody>

  <AIPanelFooter>
    <PromptInput size="sm" loading={loading} onSubmit={send}>
      <PromptInputTextarea placeholder="Reply to Koala…" />
      <PromptInputToolbar>
        <PromptInputButton iconOnly aria-label="Add"><Plus /></PromptInputButton>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  </AIPanelFooter>
</AIPanel>`}
      >
        <AIPanelDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="ai-panel"
          dependencies="npm install tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  AIPanel,
  AIPanelHeader,
  AIPanelHeading,
  AIPanelTitle,
  AIPanelBody,
  AIPanelFooter,
} from "@/components/ui/ai-panel"
import { Conversation } from "@/components/ui/chat"
import { PromptInput } from "@/components/ui/prompt-input"

export function Assistant() {
  return (
    <AIPanel>
      <AIPanelHeader>
        <AIPanelHeading>
          <AIPanelTitle>Assistant</AIPanelTitle>
        </AIPanelHeading>
      </AIPanelHeader>
      <AIPanelBody>
        <Conversation>{/* messages */}</Conversation>
      </AIPanelBody>
      <AIPanelFooter>
        <PromptInput onSubmit={send}>{/* composer */}</PromptInput>
      </AIPanelFooter>
    </AIPanel>
  )
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          The panel fills its container (<code className="font-mono text-sm">h-full</code>) and
          owns the scroll: only the body scrolls, while the header and composer stay pinned. Give
          it a sized frame when docking it in a page.
        </p>
      </DocSection>

      <DocSection title="Window modes (split &amp; floating)">
        <p className="mt-4 text-pretty text-muted-foreground">
          The panel can manage its own window, Notion/Edge-style. Beyond the embedded{" "}
          <code className="font-mono text-sm">inline</code> default, it has two windowed views:{" "}
          <code className="font-mono text-sm">split</code> (a full-height rail pinned to the right
          edge, the split-screen assistant) and{" "}
          <code className="font-mono text-sm">floating</code> (a compact window hovering
          bottom-right). Drop an <code className="font-mono text-sm">AIPanelExpandToggle</code> in
          the header to flip between them; it swaps its own icon and label with the view. These
          modes are non-modal: the page stays interactive, so closing is the host&apos;s call
          (render the panel behind a launcher). The view is controllable via{" "}
          <code className="font-mono text-sm">view</code> /{" "}
          <code className="font-mono text-sm">defaultView</code> /{" "}
          <code className="font-mono text-sm">onViewChange</code>.
        </p>
        <ComponentPreview
          code={`function Assistant() {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<AIPanelView>("split")
  return (
    <>
      {!open && <Button onClick={() => setOpen(true)}>Ask Koala</Button>}
      {open && (
        <AIPanel view={view} onViewChange={setView}>
          <AIPanelHeader>
            <AIPanelHeading><AIPanelTitle>Assistant</AIPanelTitle></AIPanelHeading>
            <AIPanelActions>
              {/* swaps Float ⇄ Dock with the current view */}
              <AIPanelExpandToggle />
              <AIPanelAction aria-label="Close" onClick={() => setOpen(false)}><X /></AIPanelAction>
            </AIPanelActions>
          </AIPanelHeader>
          {/* body · footer */}
        </AIPanel>
      )}
    </>
  )
}`}
        >
          <WindowModesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="As an overlay (Drawer)">
        <p className="mt-4 text-pretty text-muted-foreground">
          Because it&apos;s pure layout, the same panel drops straight into a{" "}
          <code className="font-mono text-sm">DrawerContent</code> for a slide-in assistant: the
          Drawer brings the trigger, scrim, focus trap, and animation. Hide the Drawer&apos;s own
          close (<code className="font-mono text-sm">showClose=false</code>) and put a close action
          in the panel header instead. An overlay is never a dead end: keep a{" "}
          <em>minimize to window</em> action that pops the panel out to a{" "}
          <code className="font-mono text-sm">floating</code> window (and back), so the assistant
          can ride along while the user keeps working.
        </p>
        <ComponentPreview
          code={`<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline"><Sparkle /> Ask Koala</Button>
  </DrawerTrigger>
  <DrawerContent side="right" showClose={false} className="p-0">
    <DrawerTitle className="sr-only">Koala Assistant</DrawerTitle>
    <AIPanel>{/* header · body · footer */}</AIPanel>
  </DrawerContent>
</Drawer>`}
        >
          <OverlayDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Empty state">
        <p className="mt-4 text-pretty text-muted-foreground">
          With no messages yet, center a greeting and a few starters in the body. The body is a
          plain flex region, so a centered welcome composes with no extra parts. For genuine{" "}
          <em>no-content</em> moments (no history, no results, offline), reach for the canonical{" "}
          <code className="font-mono text-sm">EmptyState</code> instead: see below.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<AIPanelBody className="flex flex-col items-center justify-center gap-5 text-center">
  <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
    <Sparkle className="size-6" />
  </span>
  <div>
    <p className="text-pretty text-base font-semibold">How can I help?</p>
    <p className="text-pretty text-sm text-muted-foreground">Ask about your workspace…</p>
  </div>
  <PromptInputSuggestions className="justify-center">
    {starters.map(({ label, icon: Icon }) => (
      <PromptInputSuggestion key={label} onClick={() => setValue(label)}>
        <Icon /> {label}
      </PromptInputSuggestion>
    ))}
  </PromptInputSuggestions>
</AIPanelBody>`}
        >
          <EmptyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="No content &amp; error states">
        <p className="mt-4 text-pretty text-muted-foreground">
          Beyond the welcome state, an assistant hits real <em>no-content</em> moments: an empty
          history, a search that finds nothing, a dropped connection. Because the body is a plain
          flex region, drop the canonical{" "}
          <code className="font-mono text-sm">EmptyState</code> straight in.{" "}
          <code className="font-mono text-sm">density=&quot;compact&quot;</code> fits the in-panel
          scale, and <code className="font-mono text-sm">variant</code> re-themes the media and
          action for an error (<code className="font-mono text-sm">destructive</code>) versus a
          neutral zero state (<code className="font-mono text-sm">default</code>).
        </p>
        <ComponentPreview
          code={`<AIPanelBody className="flex items-center justify-center">
  <EmptyState density="compact" variant="destructive">
    <EmptyStateMedia><WifiSlash /></EmptyStateMedia>
    <EmptyStateTitle>Can't reach the assistant</EmptyStateTitle>
    <EmptyStateDescription>
      Koala is offline right now. Check your connection and try again.
    </EmptyStateDescription>
    <EmptyStateActions>
      <Button size="sm" variant="destructive"><ArrowClockwise /> Retry</Button>
    </EmptyStateActions>
  </EmptyState>
</AIPanelBody>`}
        >
          <EmptyStatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono text-sm font-semibold">AIPanel</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The shell: a full-height flex column on the popover surface, exposing{" "}
              <code className="font-mono text-sm">--surface</code> so the nested composer blends
              in. Owns the view state:{" "}
              <code className="font-mono text-sm">inline</code> (fills container),{" "}
              <code className="font-mono text-sm">split</code> (right rail), or{" "}
              <code className="font-mono text-sm">floating</code>, controllable via{" "}
              <code className="font-mono text-sm">view</code> /{" "}
              <code className="font-mono text-sm">defaultView</code> /{" "}
              <code className="font-mono text-sm">onViewChange</code>. Forwards all native{" "}
              <code className="font-mono text-sm">div</code> props.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              AIPanelHeader · AIPanelHeading · AIPanelTitle · AIPanelDescription
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The bordered header row: leading media (e.g. an{" "}
              <code className="font-mono text-sm">Avatar</code>), a title/description
              column, and actions. Inside a Drawer, also render a{" "}
              <code className="font-mono text-sm">{`<DrawerTitle className="sr-only">`}</code> for
              screen readers.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              AIPanelActions · AIPanelAction · AIPanelExpandToggle
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Header actions: new chat, history, close. <code className="font-mono text-sm">AIPanelAction</code>{" "}
              is a ghost icon <code className="font-mono text-sm">Button</code> (all Button props
              apply; use <code className="font-mono text-sm">asChild</code> to wrap a{" "}
              <code className="font-mono text-sm">DrawerClose</code>).{" "}
              <code className="font-mono text-sm">AIPanelExpandToggle</code> is a prewired action
              that flips the panel between the{" "}
              <code className="font-mono text-sm">split</code> rail and the{" "}
              <code className="font-mono text-sm">floating</code> window.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">AIPanelBody · AIPanelFooter</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">AIPanelBody</code> is the only scrolling region;
              drop a <code className="font-mono text-sm">Conversation</code> inside.{" "}
              <code className="font-mono text-sm">AIPanelFooter</code> is the pinned composer dock;
              drop a <code className="font-mono text-sm">PromptInput</code> inside.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do I dock AIPanel in a page versus floating it as an overlay?",
              a: "AIPanel is pure layout and fills its container with `h-full`, so to dock it just give it a sized frame in your page. For an overlay, drop the same panel into a `DrawerContent` and let the Drawer supply the trigger, scrim, focus trap, and slide animation.",
            },
            {
              q: "What does the view prop do and how do I add the window toggle?",
              a: "`view` switches between `inline` (fills its container, the default), `split` (a full-height rail pinned to the right edge), and `floating` (a compact window hovering bottom-right). Drop an `AIPanelExpandToggle` into your header `AIPanelActions` to flip between split and floating; the view is controllable via `view` / `defaultView` / `onViewChange`, or left uncontrolled.",
            },
            {
              q: "Are the split and floating modes modal, and how do I close them?",
              a: "No, they're non-modal: there's no scrim and the page stays interactive, Notion/Edge-style. Closing is the host's call, so render the panel behind your own open state (e.g. a launcher button) and add a close `AIPanelAction` that flips it off. To reserve layout space for a `split` rail, pad your page content by the rail width.",
            },
            {
              q: "Which region scrolls, and where do I put the conversation and composer?",
              a: "Only `AIPanelBody` scrolls; the header and `AIPanelFooter` stay pinned. Drop a `Conversation` (from Chat) inside `AIPanelBody` and a `PromptInput` inside `AIPanelFooter`.",
            },
            {
              q: "How should I handle the close action when the panel lives in a Drawer?",
              a: "Hide the Drawer's own close with `showClose={false}` and put a close action in the panel header instead. Render an `AIPanelAction` with `asChild` wrapping a `DrawerClose`, and add a `<DrawerTitle className=\"sr-only\">` for screen readers.",
            },
            {
              q: "How do I show an empty state when there's no content?",
              a: "The body is a plain flex region, so center whatever fits the moment. For a fresh chat, drop a greeting plus a few `PromptInputSuggestions` starters. For genuine no-content cases (no saved history, a search with no results, or an offline/error), reach for the canonical `EmptyState` at `density=\"compact\"` and swap its `variant` (`default` for a neutral zero state, `destructive` for an error). Add `className=\"flex items-center justify-center\"` to `AIPanelBody` so it centers.",
            },
            {
              q: "Why is AIPanelAction styled differently from a plain Button?",
              a: "`AIPanelAction` is a thin wrapper over `Button` defaulting to `variant=\"ghost\"`, `size=\"sm\"`, and `iconOnly`, with muted foreground, so header controls stay quiet and consistent. All Button props still apply, and it derives a tooltip from its `aria-label`.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
