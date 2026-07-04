"use client"

import * as React from "react"
import {
  Copy,
  ArrowsClockwise,
  ThumbsUp,
  ThumbsDown,
} from "@phosphor-icons/react"

import {
  Conversation,
  Message,
  MessageAvatar,
  MessageBody,
  MessageHeader,
  MessageName,
  MessageTime,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageTyping,
  MessageReasoning,
  MessageReasoningTrigger,
  MessageReasoningContent,
  MessageReasoningStep,
  MessageReasoningQueries,
  MessageReasoningQuery,
  MessageReasoningSources,
  MessageReasoningSource,
} from "@/components/ui/chat"
import { Button } from "@/components/ui/button"

/** The assistant identity avatar: the Koala brand logo. */
function KoalaAvatar() {
  return <MessageAvatar name="Koala" src="/koala-logo.webp" />
}

function AssistantActions() {
  return (
    <MessageActions>
      <MessageAction aria-label="Copy">
        <Copy weight="bold" />
      </MessageAction>
      <MessageAction aria-label="Regenerate">
        <ArrowsClockwise weight="bold" />
      </MessageAction>
      <MessageAction aria-label="Good response">
        <ThumbsUp weight="bold" />
      </MessageAction>
      <MessageAction aria-label="Bad response">
        <ThumbsDown weight="bold" />
      </MessageAction>
    </MessageActions>
  )
}

export function ChatDemo() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-4">
      <Conversation variant="bubble" className="max-h-[26rem]">
        <Message role="user">
          <MessageBody>
            <MessageContent>
              Add an empty state to the data table when there are no rows.
            </MessageContent>
          </MessageBody>
        </Message>

        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageHeader>
              <MessageName>Koala</MessageName>
              <MessageTime>2:34 PM</MessageTime>
            </MessageHeader>
            <MessageContent>
              <p>Done. I dropped an EmptyState into the table body:</p>
              <ul>
                <li>Renders when rows.length === 0.</li>
                <li>Reuses our EmptyState (icon, title, action).</li>
                <li>Stays hidden while loading so the skeleton shows.</li>
              </ul>
            </MessageContent>
            <AssistantActions />
          </MessageBody>
        </Message>

        <Message role="user">
          <MessageBody>
            <MessageContent>Nice. Now wire it to the loading prop.</MessageContent>
          </MessageBody>
        </Message>

        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageContent>
              <MessageTyping />
            </MessageContent>
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

export function RolesDemo() {
  return (
    <div className="w-full max-w-xl">
      <Conversation variant="bubble">
        <Message role="user">
          <MessageBody>
            <MessageContent>Why is pnpm build failing on CI but not locally?</MessageContent>
          </MessageBody>
        </Message>
        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageContent>
              CI runs Node 18, but the config calls structuredClone, which only landed in Node 20.
              Bump the workflow to Node 20 and the build passes.
            </MessageContent>
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

export function ActionsDemo() {
  return (
    <div className="w-full max-w-xl">
      <Conversation variant="bubble">
        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageContent>
              I dropped <code>forwardRef</code> from Button and now pass <code>ref</code> as a
              regular prop, per the React 19 rule. Want me to apply the same change across the
              other primitives?
            </MessageContent>
            <AssistantActions />
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

export function MarkdownDemo() {
  return (
    <div className="w-full max-w-xl">
      <Conversation variant="bubble">
        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageContent>
              <p>
                Define the component recipe with <code>tv</code> and read its variants like this:
              </p>
              <pre>
                <code>{`const button = tv({
  base: "inline-flex items-center justify-center",
  variants: { size: { sm: "h-8 px-3", md: "h-10 px-4" } },
})`}</code>
              </pre>
              <p>
                See the{" "}
                <a href="/docs/foundations/density">foundations</a> for the full house style.
              </p>
            </MessageContent>
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

export function TypingDemo() {
  return (
    <div className="w-full max-w-xl">
      <Conversation variant="bubble">
        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            <MessageContent>
              <MessageTyping />
            </MessageContent>
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

// A live agentic run, revealed one atomic step at a time so you watch it work. `progress`
// counts those reveals (0 → DONE): the intro, then each query, each browsed source, each
// reviewed row, and finally the answer. The newest step pulses; each item rises in (stagger-in,
// motion-safe, and only while running, never on page load, per make-interfaces-feel-better #13).
const DONE = 14

export function ReasoningDemo() {
  // "idle" sits on a finished log (no animation); "running" streams it; "done" lands the answer.
  const [stage, setStage] = React.useState<"idle" | "running" | "done">("idle")
  const [progress, setProgress] = React.useState(DONE)
  const [open, setOpen] = React.useState(true)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  // Cleanup-only effect (no state set in the body), safe under the repo's strict hooks lint.
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function investigate() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setStage("running")
    setProgress(0)
    setOpen(true) // auto-expand so you can watch it work…
    // Uneven gaps read as real work: quick code greps, slower doc reads, a beat to land the answer.
    const gaps = [320, 620, 340, 340, 540, 240, 240, 240, 220, 520, 320, 320, 320, 600]
    let at = 0
    gaps.forEach((gap, i) => {
      at += gap
      const value = i + 1
      timers.current.push(
        setTimeout(() => {
          setProgress(value)
          if (value === DONE) setStage("done")
        }, at),
      )
    })
  }

  const running = stage === "running"
  // The step currently doing work (its dot pulses): intro, search, docs, then review.
  const active =
    progress === 1 ? 1 : progress <= 4 ? 2 : progress <= 9 ? 3 : progress <= 13 ? 4 : 0
  const statusFor = (n: number) => (running && active === n ? "active" : "done")
  // Each freshly streamed item rises in; held off at rest and under reduced motion.
  const enter = (on: boolean) => (on ? "motion-safe:animate-stagger-in" : undefined)
  // Sources tick up live as it reads the docs: 1→4 per chip, then 14 once "+10 more" lands.
  const sourceCount = progress < 5 ? 0 : progress < 9 ? progress - 4 : 14

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div>
        <Button variant="outline" size="sm" onClick={investigate} disabled={running}>
          <ArrowsClockwise weight="bold" /> {running ? "Investigating…" : "Ask again"}
        </Button>
      </div>
      <Conversation variant="bubble">
        <Message role="user">
          <MessageBody>
            <MessageContent>
              Dark mode flashes the wrong theme on first load. Can you trace the hydration flicker?
            </MessageContent>
          </MessageBody>
        </Message>
        <Message role="assistant">
          <KoalaAvatar />
          <MessageBody>
            {/* Agentic coding: the queries it ran in the repo and the docs it consulted. */}
            <MessageReasoning streaming={running} open={open} onOpenChange={setOpen}>
              <MessageReasoningTrigger>
                {!running ? (
                  <>
                    Investigated <span className="tabular-nums">14</span> sources
                  </>
                ) : sourceCount > 0 ? (
                  <>
                    Found <span className="tabular-nums">{sourceCount}</span>{" "}
                    {sourceCount === 1 ? "source" : "sources"}
                  </>
                ) : (
                  "Investigating…"
                )}
              </MessageReasoningTrigger>
              <MessageReasoningContent>
                {progress >= 1 ? (
                  <MessageReasoningStep status={statusFor(1)} className={enter(running)}>
                    <p>
                      Reproducing the flash of the wrong theme. The theme looks read on the client
                      after hydration, so the first paint always uses the default.
                    </p>
                  </MessageReasoningStep>
                ) : null}

                {progress >= 2 ? (
                  <MessageReasoningStep
                    label="Searching the codebase"
                    status={statusFor(2)}
                    className={enter(running)}
                  >
                    <MessageReasoningQueries>
                      {/* First item rides the step's entrance; the rest stream in on their own. */}
                      <MessageReasoningQuery>useTheme localStorage</MessageReasoningQuery>
                      {progress >= 3 ? (
                        <MessageReasoningQuery className={enter(running)}>
                          data-theme on &lt;html&gt;
                        </MessageReasoningQuery>
                      ) : null}
                      {progress >= 4 ? (
                        <MessageReasoningQuery className={enter(running)}>
                          suppressHydrationWarning
                        </MessageReasoningQuery>
                      ) : null}
                    </MessageReasoningQueries>
                  </MessageReasoningStep>
                ) : null}

                {progress >= 5 ? (
                  <MessageReasoningStep
                    label="Reading the docs"
                    status={statusFor(3)}
                    className={enter(running)}
                  >
                    <MessageReasoningSources>
                      <MessageReasoningSource href="https://nextjs.org" />
                      {progress >= 6 ? (
                        <MessageReasoningSource href="https://react.dev" className={enter(running)} />
                      ) : null}
                      {progress >= 7 ? (
                        <MessageReasoningSource href="https://web.dev" className={enter(running)} />
                      ) : null}
                      {progress >= 8 ? (
                        <MessageReasoningSource href="https://github.com" className={enter(running)} />
                      ) : null}
                      {progress >= 9 ? (
                        <MessageReasoningSource href="#" favicon="" className={enter(running)}>
                          +10 more
                        </MessageReasoningSource>
                      ) : null}
                    </MessageReasoningSources>
                  </MessageReasoningStep>
                ) : null}

                {progress >= 10 ? (
                  <MessageReasoningStep
                    label="Reviewing sources · 4"
                    status={statusFor(4)}
                    className={enter(running)}
                  >
                    <MessageReasoningSources layout="list">
                      <MessageReasoningSource
                        href="https://nextjs.org"
                        title="Avoiding a theme hydration mismatch"
                      />
                      {progress >= 11 ? (
                        <MessageReasoningSource
                          href="https://react.dev"
                          title="You Might Not Need an Effect"
                          className={enter(running)}
                        />
                      ) : null}
                      {progress >= 12 ? (
                        <MessageReasoningSource
                          href="https://web.dev"
                          title="Prevent a flash of the wrong theme"
                          className={enter(running)}
                        />
                      ) : null}
                      {progress >= 13 ? (
                        <MessageReasoningSource
                          href="https://github.com"
                          title="next-themes: blocking inline script"
                          className={enter(running)}
                        />
                      ) : null}
                    </MessageReasoningSources>
                  </MessageReasoningStep>
                ) : null}
              </MessageReasoningContent>
            </MessageReasoning>
            {running ? (
              <MessageContent>
                <MessageTyping />
              </MessageContent>
            ) : (
              <MessageContent className={enter(stage === "done")}>
                The theme is applied in a <code>useEffect</code>, so the server sends the default
                and the client only corrects it after the first paint. Set <code>data-theme</code>{" "}
                from localStorage in a small blocking script in the head, and add{" "}
                <code>suppressHydrationWarning</code> to <code>&lt;html&gt;</code>.
              </MessageContent>
            )}
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}

export function PlainDemo() {
  return (
    <div className="w-full max-w-xl">
      {/* Notion/ChatGPT style: the assistant answer is a document, not a bubble, with no avatar
          and no identity. The user turn stays a bubble. */}
      <Conversation variant="plain">
        <Message role="user">
          <MessageBody>
            <MessageContent>Explain how the density system works in this codebase.</MessageContent>
          </MessageBody>
        </Message>
        <Message role="assistant">
          <MessageBody>
            <MessageContent>
              <p>
                Density is a single axis, <strong>comfortable</strong> or{" "}
                <strong>compact</strong>, that flows through React context so every component sizes
                from one source of truth.
              </p>
              <h3>How it works</h3>
              <ul>
                <li>
                  <code>DensityProvider</code> puts the active density on the context.
                </li>
                <li>
                  Components read it with the <code>useDensity</code> hook.
                </li>
                <li>Each maps the value to its own spacing, hit areas, and font size.</li>
              </ul>
              <h3>Why a context</h3>
              <ul>
                <li>One toggle re-densifies a whole subtree, with no prop drilling.</li>
                <li>Marketing and app shells can run different densities side by side.</li>
              </ul>
            </MessageContent>
          </MessageBody>
        </Message>
      </Conversation>
    </div>
  )
}
