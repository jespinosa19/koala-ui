import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"

import {
  PromptInputDemo,
  StreamingDemo,
  SizesDemo,
  SuggestionsDemo,
  BannerDemo,
  BannerBottomDemo,
  CountDemo,
  MinimalDemo,
} from "./demos"

export const metadata = {
  title: "Prompt Input",
}

export default function PromptInputDocsPage() {
  return (
    <>
      <DocHeader
        title="Prompt Input"
        description="The AI composer: an auto-growing textarea with a built-in toolbar and a send⇄stop button. Wire onSubmit once and the textarea, model picker, count, and submit stay in sync through context. Built out of our Button, so the bar's controls never drift from the DS."
      />

      <ComponentPreview
        previewClassName="items-start"
        code={`<PromptInput loading={loading} onSubmit={send} onStop={stop}>
  <PromptInputTextarea placeholder="Ask Koala anything…" />
  <PromptInputToolbar>
    <AddMenu />
    <ModelPicker />
    <ToolsMenu />
    <div className="ml-auto flex items-center gap-0.5">
      <PromptInputButton iconOnly aria-label="Dictate">
        <Microphone />
      </PromptInputButton>
      <PromptInputSubmit className="ml-0" />
    </div>
  </PromptInputToolbar>
</PromptInput>`}
      >
        <PromptInputDemo />
      </ComponentPreview>

      <p className="mt-6 text-pretty text-muted-foreground">
        The bar is built out of our <code className="font-mono text-sm">Button</code>: an attach
        menu, the model picker, and a single tools dropdown (image, canvas, web / deep research,
        code) on the left, dictate and send on the right. Only one tool runs at a time, so the menu
        is single-select: picking one clears the others. The trigger names what&apos;s on, showing
        the active tool&apos;s icon and label rather than a generic{" "}
        <code className="font-mono text-sm">Tools</code> word. Every toolbar glyph renders at a
        consistent 20px, and the send button is an upward arrow that flips to a stop square while a
        response streams.
      </p>

      <DocSection title="Installation">
        <Installation
          component="prompt-input"
          dependencies="npm install tailwind-variants tailwind-merge @phosphor-icons/react"
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputButton,
  PromptInputSubmit,
} from "@/components/ui/prompt-input"

export function Composer() {
  return (
    <PromptInput onSubmit={(value) => sendMessage(value)}>
      <PromptInputTextarea />
      <PromptInputToolbar>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          The composer is uncontrolled by default: it owns its value and clears itself after a
          submit. <code className="font-mono text-sm">Enter</code> sends,{" "}
          <code className="font-mono text-sm">Shift+Enter</code> inserts a newline, and the field
          grows to fit its content up to a cap, then scrolls.
        </p>
      </DocSection>

      <DocSection title="Minimal">
        <p className="mt-4 text-pretty text-muted-foreground">
          Same capabilities, quieter chrome: each group becomes its own compact icon dropdown
          (attachments, model, tools) so the bar is just icons plus send. Models are a radio group;
          the tools (image, canvas, web / deep research, code) are mutually exclusive, so picking
          one clears the rest (at most one active; their check sits on the right, the menu
          convention). Each trigger is a{" "}
          <code className="font-mono text-sm">static</code> icon-only{" "}
          <code className="font-mono text-sm">PromptInputButton</code>.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<PromptInputToolbar>
  {/* Attachments */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <PromptInputButton static iconOnly tooltip={false} aria-label="Add photos & files">
        <Plus />
      </PromptInputButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem><Image /> Add photo</DropdownMenuItem>
      <DropdownMenuItem><Paperclip /> Add files</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Model */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <PromptInputButton static iconOnly tooltip={false} aria-label="Model">
        <Sparkle />
      </PromptInputButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Model</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
        <DropdownMenuRadioItem value="opus"><Sparkle /> Opus 4.8</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="sonnet"><Sparkle /> Sonnet 4.6</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Tools: image · canvas · web / deep research · code (single-select: at most one) */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <PromptInputButton static iconOnly tooltip={false} aria-label="Tools">
        <SlidersHorizontal />
      </PromptInputButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Tools</DropdownMenuLabel>
      {/* one \`tool\` state; picking one clears the rest, re-picking it clears to null */}
      <DropdownMenuCheckboxItem checked={tool === "image"} onCheckedChange={(on) => setTool(on ? "image" : null)}>
        <Image /> Image
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={tool === "deep"} onCheckedChange={(on) => setTool(on ? "deep" : null)}>
        <Binoculars /> Deep research
      </DropdownMenuCheckboxItem>
      {/* …canvas, web research, code */}
    </DropdownMenuContent>
  </DropdownMenu>

  <PromptInputSubmit />
</PromptInputToolbar>`}
        >
          <MinimalDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three sizes retune the field&apos;s padding, text, and min-height, and the send
          button scales with them. The surface radius stays constant (a brand trait). Set it
          once on the root with <code className="font-mono text-sm">size</code>.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<PromptInput size="sm">…</PromptInput>
<PromptInput size="md">…</PromptInput>  {/* default */}
<PromptInput size="lg">…</PromptInput>`}
        >
          <SizesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Streaming (send ⇄ stop)">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">loading</code> while a response streams and the
          send button becomes a stop button that fires{" "}
          <code className="font-mono text-sm">onStop</code>. The toolbar holds plain{" "}
          <code className="font-mono text-sm">PromptInputButton</code> actions (Search, Reason) on
          the left; the submit claims the right edge automatically.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<PromptInput defaultValue="Write a haiku about koalas." loading={loading} onSubmit={send} onStop={stop}>
  <PromptInputTextarea />
  <PromptInputToolbar>
    <PromptInputButton><Globe /> Search</PromptInputButton>
    <PromptInputButton><Brain /> Reason</PromptInputButton>
    <PromptInputSubmit />
  </PromptInputToolbar>
</PromptInput>`}
        >
          <StreamingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Suggestions">
        <p className="mt-4 text-pretty text-muted-foreground">
          Prompt-starter chips sit above the composer, filled in the{" "}
          <code className="font-mono text-sm">secondary</code> color so the row reads as one quiet
          set. Give each its own 20px glyph (not a generic sparkle) and let the shape do the
          differentiating. They&apos;re context-free on purpose: wire each{" "}
          <code className="font-mono text-sm">onClick</code> to set the prompt, submit, or both.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<PromptInputSuggestions>
  {suggestions.map(({ label, icon: Icon }) => (
    <PromptInputSuggestion key={label} onClick={() => setValue(label)}>
      <Icon /> {label}
    </PromptInputSuggestion>
  ))}
</PromptInputSuggestions>

<PromptInput value={value} onValueChange={setValue} onSubmit={clear}>
  <PromptInputTextarea />
  <PromptInputToolbar>
    <PromptInputSubmit />
  </PromptInputToolbar>
</PromptInput>`}
        >
          <SuggestionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Banner">
        <p className="mt-4 text-pretty text-muted-foreground">
          A notice that tucks behind the composer for model availability, usage caps, or errors. The
          composer stays a complete rounded card on top and the banner slides <em>under</em> it, so
          only its outer edge peeks out. Drop the{" "}
          <code className="font-mono text-sm">PromptInputBanner</code> as a sibling of{" "}
          <code className="font-mono text-sm">PromptInput</code> in a{" "}
          <code className="font-mono text-sm">flex flex-col isolate</code> wrapper (the{" "}
          <code className="font-mono text-sm">isolate</code> keeps its negative z local), and add{" "}
          <code className="font-mono text-sm">shadow-md</code> to the composer so its shadow falls on
          the strip. <code className="font-mono text-sm">side</code> picks which edge it peeks from:{" "}
          <code className="font-mono text-sm">top</code> (banner <em>before</em> the composer) or{" "}
          <code className="font-mono text-sm">bottom</code> (banner <em>after</em>). No absolute
          positioning. <code className="font-mono text-sm">tone</code> tints the icon (
          <code className="font-mono text-sm">default</code> /{" "}
          <code className="font-mono text-sm">info</code> /{" "}
          <code className="font-mono text-sm">warning</code> /{" "}
          <code className="font-mono text-sm">destructive</code>); pass{" "}
          <code className="font-mono text-sm">onClose</code> for a dismiss button.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<div className="flex flex-col isolate">
  {open && (
    <PromptInputBanner side="top" tone="warning" onClose={() => setOpen(false)}>
      Fable 5 is unavailable right now.
      <PromptInputBannerAction className="ml-auto">Learn more</PromptInputBannerAction>
    </PromptInputBanner>
  )}
  <PromptInput onSubmit={send} className="shadow-md">
    <PromptInputTextarea placeholder="How can I help you today?" />
    <PromptInputToolbar>
      <PromptInputButton iconOnly aria-label="Add photos & files">
        <Plus />
      </PromptInputButton>
      <ModelPicker />
      <PromptInputSubmit />
    </PromptInputToolbar>
  </PromptInput>
</div>`}
        >
          <BannerDemo />
        </ComponentPreview>
        <p className="mt-8 text-pretty text-muted-foreground">
          Move it below with <code className="font-mono text-sm">side=&quot;bottom&quot;</code> for a
          promo (a &quot;connect your apps&quot; nudge, say). Same wrapper, but place the banner{" "}
          <em>after</em> the composer so it peeks out the bottom instead.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<div className="flex flex-col isolate">
  <PromptInput onSubmit={send} className="shadow-md">…</PromptInput>
  {open && (
    <PromptInputBanner side="bottom" icon={<Sparkle />} onClose={() => setOpen(false)}>
      Get better answers from your apps.
      <PromptInputBannerAction className="ml-auto">Connect</PromptInputBannerAction>
    </PromptInputBanner>
  )}
</div>`}
        >
          <BannerBottomDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Character count">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a <code className="font-mono text-sm">PromptInputCount</code> into the toolbar: it
          reads the composer&apos;s length from context (pass <code className="font-mono text-sm">current</code>{" "}
          to show tokens instead). With a <code className="font-mono text-sm">max</code> it renders{" "}
          <code className="font-mono text-sm">current / max</code> and turns destructive once
          exceeded.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<PromptInput defaultValue="A serene koala napping on a branch">
  <PromptInputTextarea placeholder="Describe the image you want…" />
  <PromptInputToolbar>
    <PromptInputButton iconOnly aria-label="Attach file">
      <Paperclip />
    </PromptInputButton>
    <div className="ml-auto flex items-center gap-2">
      <PromptInputCount max={500} />
      <PromptInputSubmit className="ml-0" />
    </div>
  </PromptInputToolbar>
</PromptInput>`}
        >
          <CountDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono text-sm font-semibold">PromptInput</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Root <code className="font-mono text-sm">&lt;form&gt;</code> + context provider.
              Forwards all native form props.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">value? / defaultValue?</code>: controlled or
                initial value. Uncontrolled clears itself after a submit.
              </li>
              <li>
                <code className="font-mono text-sm">onValueChange?(value)</code>: called on every
                keystroke.
              </li>
              <li>
                <code className="font-mono text-sm">onSubmit?(value)</code>: fired on Enter or send;
                skipped when empty, disabled, or loading.
              </li>
              <li>
                <code className="font-mono text-sm">onStop?()</code>: fired by the stop button.
              </li>
              <li>
                <code className="font-mono text-sm">loading?</code>: a response is streaming; flips
                send → stop.
              </li>
              <li>
                <code className="font-mono text-sm">disabled?</code>: dims and freezes the composer.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">PromptInputTextarea</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Auto-growing field. Forwards all native{" "}
              <code className="font-mono text-sm">&lt;textarea&gt;</code> props except{" "}
              <code className="font-mono text-sm">value</code> /{" "}
              <code className="font-mono text-sm">onChange</code> (owned by the root).
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">submitOnEnter?</code>: Enter submits
                (default). Set <code className="font-mono text-sm">false</code> so Enter adds a line
                and ⌘/Ctrl+Enter sends.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">PromptInputSubmit</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The send⇄stop button: a <code className="font-mono text-sm">Button</code> under the
              hood, so it takes all Button props (<code className="font-mono text-sm">variant</code>,{" "}
              <code className="font-mono text-sm">size</code>, …). Its send glyph is an upward arrow
              by default (it flips to a stop square while loading); pass{" "}
              <code className="font-mono text-sm">children</code> to override it. Custom{" "}
              <code className="font-mono text-sm">sendLabel</code> /{" "}
              <code className="font-mono text-sm">stopLabel</code> set the accessible names.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              PromptInputButton · PromptInputToolbar · PromptInputCount
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">PromptInputButton</code> is a ghost{" "}
              <code className="font-mono text-sm">Button</code> for toolbar actions (its icons render
              at a consistent 20px across the bar);{" "}
              <code className="font-mono text-sm">PromptInputToolbar</code> is the bottom bar;{" "}
              <code className="font-mono text-sm">PromptInputCount</code> takes{" "}
              <code className="font-mono text-sm">current?</code> /{" "}
              <code className="font-mono text-sm">max?</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              PromptInputBanner · PromptInputBannerAction
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A second card that sits behind the composer, plus an inline link-styled{" "}
              <code className="font-mono text-sm">PromptInputBannerAction</code>.{" "}
              <code className="font-mono text-sm">side</code> (
              <code className="font-mono text-sm">top</code> /{" "}
              <code className="font-mono text-sm">bottom</code>) picks the edge it peeks from;{" "}
              <code className="font-mono text-sm">tone</code> (
              <code className="font-mono text-sm">default</code> /{" "}
              <code className="font-mono text-sm">info</code> /{" "}
              <code className="font-mono text-sm">warning</code> /{" "}
              <code className="font-mono text-sm">destructive</code>) tints the leading icon;{" "}
              <code className="font-mono text-sm">icon</code> overrides or drops (
              <code className="font-mono text-sm">false</code>) the glyph;{" "}
              <code className="font-mono text-sm">onClose</code> /{" "}
              <code className="font-mono text-sm">closeLabel</code> add a dismiss button.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">
              PromptInputSuggestions · PromptInputSuggestion
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Context-free chip row + chip, meant to sit above the composer. The chip forwards all
              native <code className="font-mono text-sm">&lt;button&gt;</code> props; wire{" "}
              <code className="font-mono text-sm">onClick</code> yourself.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Is the composer controlled or uncontrolled by default?", a: "Uncontrolled: it owns its value and clears itself after a submit. Pass `value` plus `onValueChange` to control it, in which case you reset the value yourself to clear it." },
            { q: "How do I switch the send button into a stop button while a response streams?", a: "Pass `loading` to PromptInput. The PromptInputSubmit button flips from a `type=\"submit\"` send button to a stop button that fires `onStop`." },
            { q: "What are the Enter key semantics, and can I change them?", a: "By default Enter submits and Shift+Enter inserts a newline. Set `submitOnEnter={false}` on PromptInputTextarea so Enter adds a line and Cmd/Ctrl+Enter sends instead. Submitting mid-IME-composition is guarded." },
            { q: "How do I add a character or token count to the toolbar?", a: "Drop a `PromptInputCount` into the toolbar; it reads the composer length from context. Give it a `max` to render `current / max` and turn destructive once exceeded, or pass `current` to show tokens instead of characters." },
            { q: "Why is PromptInputSubmit disabled and how do I size the toolbar buttons?", a: "Send is disabled while the value is empty, disabled, or loading. Every toolbar control tracks the root `size` through context (sm/md/lg line up 1:1 with Button sizes), so set `size` once on PromptInput rather than on each button." },
            { q: "What is the difference between PromptInputSuggestions and the toolbar?", a: "PromptInputSuggestions is a context-free chip row meant to sit above the composer, so you wire each chip's `onClick` yourself. The PromptInputToolbar is the bottom bar wired into composer state through context." },
          ]}
        />
      </DocSection>
    </>
  )
}
