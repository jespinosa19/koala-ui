import {
  CreditCard,
  GitBranch,
  RocketLaunch,
  Terminal,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react/ssr"

import { Button } from "@/components/ui/button"
import {
  Checklist,
  ChecklistHeader,
  ChecklistItem,
  ChecklistItemAction,
  ChecklistItemContent,
  ChecklistItemDescription,
  ChecklistItemTitle,
  ChecklistItems,
  ChecklistProgress,
  ChecklistTitle,
} from "@/components/ui/checklist"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { ChecklistDemo } from "./demos"

export const metadata = {
  title: "Checklist",
}

export default function ChecklistDocsPage() {
  return (
    <>
      <DocHeader
        title="Checklist"
        description="The onboarding / get-started panel: a card that tracks a short list of setup tasks and their progress. Progress is derived from value and total, so the bar and the 3-of-6 read-out stay in sync on their own, and the bar turns green the moment every step is done."
      />

      <ComponentPreview
        code={`<Checklist value={2} total={6}>
  <ChecklistHeader>
    <ChecklistTitle>Finish setting up your workspace</ChecklistTitle>
    <ChecklistDescription>
      A few quick steps to get the most out of Koala.
    </ChecklistDescription>
    <ChecklistProgress />
  </ChecklistHeader>

  <ChecklistItems>
    <ChecklistItem status="complete" icon={<UserCircle />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Create your account</ChecklistItemTitle>
        <ChecklistItemDescription>You're in. Welcome to Koala.</ChecklistItemDescription>
      </ChecklistItemContent>
    </ChecklistItem>

    <ChecklistItem status="active" icon={<UsersThree />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Invite your team</ChecklistItemTitle>
        <ChecklistItemDescription>Add teammates to collaborate on projects.</ChecklistItemDescription>
      </ChecklistItemContent>
      <ChecklistItemAction>
        <Button size="sm">Invite</Button>
      </ChecklistItemAction>
    </ChecklistItem>

    <ChecklistItem status="todo" icon={<CreditCard />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Set up billing</ChecklistItemTitle>
        <ChecklistItemDescription>Add a payment method to move to production.</ChecklistItemDescription>
      </ChecklistItemContent>
      <ChecklistItemAction>
        <Button size="sm" variant="outline">Add card</Button>
      </ChecklistItemAction>
    </ChecklistItem>
  </ChecklistItems>
</Checklist>`}
      >
        <ChecklistDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="checklist" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Checklist,
  ChecklistHeader,
  ChecklistTitle,
  ChecklistDescription,
  ChecklistProgress,
  ChecklistItems,
  ChecklistItem,
  ChecklistItemContent,
  ChecklistItemTitle,
  ChecklistItemDescription,
  ChecklistItemAction,
} from "@/components/ui/checklist"

export function Example() {
  return (
    <Checklist value={2} total={6}>
      <ChecklistHeader>
        <ChecklistTitle>Get started</ChecklistTitle>
        <ChecklistProgress />
      </ChecklistHeader>
      <ChecklistItems>
        <ChecklistItem status="complete" icon={<UserCircle />}>
          <ChecklistItemContent>
            <ChecklistItemTitle>Create your account</ChecklistItemTitle>
          </ChecklistItemContent>
        </ChecklistItem>
        {/* …more items */}
      </ChecklistItems>
    </Checklist>
  )
}`}
        />
      </DocSection>

      <DocSection title="Item states">
        <p className="mt-4 text-pretty text-muted-foreground">
          Every <code className="font-mono text-sm">ChecklistItem</code> carries a{" "}
          <code className="font-mono text-sm">status</code>. A{" "}
          <code className="font-mono text-sm">complete</code> row fills its indicator with a green
          check and de-emphasizes the title; <code className="font-mono text-sm">active</code> marks
          the one recommended next step with a soft brand highlight and a primary action;{" "}
          <code className="font-mono text-sm">todo</code> rows wait quietly with an outline action.
          The task&apos;s own <code className="font-mono text-sm">icon</code> shows while pending and
          cross-fades to the check on completion.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<Checklist value={1} total={3}>
  <ChecklistHeader>
    <ChecklistTitle>Getting started</ChecklistTitle>
    <ChecklistProgress />
  </ChecklistHeader>
  <ChecklistItems>
    <ChecklistItem status="complete" icon={<UserCircle />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Create your account</ChecklistItemTitle>
        <ChecklistItemDescription>You're all set.</ChecklistItemDescription>
      </ChecklistItemContent>
    </ChecklistItem>
    <ChecklistItem status="active" icon={<UsersThree />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Invite your team</ChecklistItemTitle>
        <ChecklistItemDescription>Add teammates to collaborate.</ChecklistItemDescription>
      </ChecklistItemContent>
      <ChecklistItemAction>
        <Button size="sm">Invite</Button>
      </ChecklistItemAction>
    </ChecklistItem>
    <ChecklistItem status="todo" icon={<CreditCard />}>
      <ChecklistItemContent>
        <ChecklistItemTitle>Set up billing</ChecklistItemTitle>
        <ChecklistItemDescription>Add a payment method to go live.</ChecklistItemDescription>
      </ChecklistItemContent>
      <ChecklistItemAction>
        <Button size="sm" variant="outline">Add card</Button>
      </ChecklistItemAction>
    </ChecklistItem>
  </ChecklistItems>
</Checklist>`}
        >
          <div className="w-full max-w-md">
            <Checklist value={1} total={3}>
              <ChecklistHeader>
                <ChecklistTitle>Getting started</ChecklistTitle>
                <ChecklistProgress />
              </ChecklistHeader>
              <ChecklistItems>
                <ChecklistItem status="complete" icon={<UserCircle weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Create your account</ChecklistItemTitle>
                    <ChecklistItemDescription>You&apos;re all set.</ChecklistItemDescription>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="active" icon={<UsersThree weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Invite your team</ChecklistItemTitle>
                    <ChecklistItemDescription>
                      Add teammates to collaborate.
                    </ChecklistItemDescription>
                  </ChecklistItemContent>
                  <ChecklistItemAction>
                    <Button size="sm">Invite</Button>
                  </ChecklistItemAction>
                </ChecklistItem>
                <ChecklistItem status="todo" icon={<CreditCard weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Set up billing</ChecklistItemTitle>
                    <ChecklistItemDescription>
                      Add a payment method to go live.
                    </ChecklistItemDescription>
                  </ChecklistItemContent>
                  <ChecklistItemAction>
                    <Button size="sm" variant="outline">
                      Add card
                    </Button>
                  </ChecklistItemAction>
                </ChecklistItem>
              </ChecklistItems>
            </Checklist>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Progress & completion">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">value</code> (completed count) and{" "}
          <code className="font-mono text-sm">total</code> to the root;{" "}
          <code className="font-mono text-sm">ChecklistProgress</code> derives the bar, the
          &ldquo;X of Y&rdquo; label and the percentage itself. When every step is done the bar
          eases from brand to success-green and the label swaps to{" "}
          <span className="font-medium">All steps complete</span>.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`{/* In progress: brand bar, "2 of 4 complete" */}
<Checklist value={2} total={4}>…</Checklist>

{/* Done: green bar, "All steps complete" */}
<Checklist value={4} total={4}>…</Checklist>`}
        >
          <div className="w-full max-w-xs">
            <Checklist value={2} total={4}>
              <ChecklistHeader>
                <ChecklistTitle>In progress</ChecklistTitle>
                <ChecklistProgress />
              </ChecklistHeader>
              <ChecklistItems>
                <ChecklistItem status="complete" icon={<UserCircle weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Create your account</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
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
                <ChecklistItem status="todo" icon={<RocketLaunch weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Deploy your project</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
              </ChecklistItems>
            </Checklist>
          </div>

          <div className="w-full max-w-xs">
            <Checklist value={4} total={4}>
              <ChecklistHeader>
                <ChecklistTitle>All done</ChecklistTitle>
                <ChecklistProgress />
              </ChecklistHeader>
              <ChecklistItems>
                <ChecklistItem status="complete" icon={<UserCircle weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Create your account</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="complete" icon={<UsersThree weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Invite your team</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="complete" icon={<GitBranch weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Connect a repository</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="complete" icon={<RocketLaunch weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Deploy your project</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
              </ChecklistItems>
            </Checklist>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Like Card and Dialog, the Checklist reads the density context (or a{" "}
          <code className="font-mono text-sm">density</code> prop). Density tunes the card and row
          padding only. The indicator footprint is fixed at both densities, so the left rail lines
          up identically.
        </p>
        <ComponentPreview
          previewClassName="items-start"
          code={`<Checklist density="comfortable" value={1} total={2}>…</Checklist>
<Checklist density="compact" value={1} total={2}>…</Checklist>`}
        >
          <div className="w-full max-w-xs">
            <Checklist density="comfortable" value={1} total={2}>
              <ChecklistHeader>
                <ChecklistTitle>Comfortable</ChecklistTitle>
                <ChecklistProgress />
              </ChecklistHeader>
              <ChecklistItems>
                <ChecklistItem status="complete" icon={<Terminal weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Install the CLI</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="active" icon={<GitBranch weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Connect a repo</ChecklistItemTitle>
                  </ChecklistItemContent>
                  <ChecklistItemAction>
                    <Button size="sm">Connect</Button>
                  </ChecklistItemAction>
                </ChecklistItem>
              </ChecklistItems>
            </Checklist>
          </div>

          <div className="w-full max-w-xs">
            <Checklist density="compact" value={1} total={2}>
              <ChecklistHeader>
                <ChecklistTitle>Compact</ChecklistTitle>
                <ChecklistProgress />
              </ChecklistHeader>
              <ChecklistItems>
                <ChecklistItem status="complete" icon={<Terminal weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Install the CLI</ChecklistItemTitle>
                  </ChecklistItemContent>
                </ChecklistItem>
                <ChecklistItem status="active" icon={<GitBranch weight="bold" />}>
                  <ChecklistItemContent>
                    <ChecklistItemTitle>Connect a repo</ChecklistItemTitle>
                  </ChecklistItemContent>
                  <ChecklistItemAction>
                    <Button size="sm">Connect</Button>
                  </ChecklistItemAction>
                </ChecklistItem>
              </ChecklistItems>
            </Checklist>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <p className="font-mono font-medium text-foreground">Checklist</p>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root card. Forwards all <code className="font-mono text-sm">div</code> props.
            </p>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">value: number</code> — completed task count.
              </li>
              <li>
                <code className="font-mono text-sm">total: number</code> — total task count. Both
                drive the derived progress (clamped so a bad count can&apos;t overrun the bar).
              </li>
              <li>
                <code className="font-mono text-sm">density?: &quot;comfortable&quot; | &quot;compact&quot;</code>{" "}
                — padding tier; defaults from the density context.
              </li>
              <li>
                <code className="font-mono text-sm">asChild?: boolean</code> — render as a child
                element via Radix Slot.
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono font-medium text-foreground">ChecklistProgress</p>
            <p className="mt-1 text-pretty text-muted-foreground">
              The labeled <code className="font-mono text-sm">role=&quot;progressbar&quot;</code> bar.
              Reads progress from context. Pass{" "}
              <code className="font-mono text-sm">label</code> to override the default
              &ldquo;X of Y complete&rdquo; text.
            </p>
          </div>
          <div>
            <p className="font-mono font-medium text-foreground">ChecklistItem</p>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">
                  status?: &quot;todo&quot; | &quot;active&quot; | &quot;complete&quot;
                </code>{" "}
                — the task state. @default <code className="font-mono text-sm">&quot;todo&quot;</code>
              </li>
              <li>
                <code className="font-mono text-sm">icon?: ReactNode</code> — the task glyph, shown
                while pending and cross-faded to a check on completion.
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono font-medium text-foreground">
              ChecklistHeader · ChecklistTitle · ChecklistDescription · ChecklistItems ·
              ChecklistItemContent · ChecklistItemTitle · ChecklistItemDescription ·
              ChecklistItemAction
            </p>
            <p className="mt-1 text-pretty text-muted-foreground">
              Structural parts. Each accepts <code className="font-mono text-sm">className</code>{" "}
              (merged last) and forwards its native element props.{" "}
              <code className="font-mono text-sm">ChecklistTitle</code> takes{" "}
              <code className="font-mono text-sm">asChild</code>.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How is the progress bar calculated?",
              a: "From the root's value and total. ChecklistProgress derives the percentage, the 'X of Y complete' label and the aria-valuenow itself, so the header and the item statuses can't drift out of sync. Both counts are clamped, so a value greater than total (or a negative) can never overrun the bar or report over 100%.",
            },
            {
              q: "Do I have to keep value/total in sync with the item statuses?",
              a: "Yes. The statuses style each row; value/total drive the header progress. Keep both from the same source of truth (your task data), the way the docs demo derives status from a completed set and passes done.length as value. They're deliberately separate so you can show progress even for tasks that are collapsed or paginated out of view.",
            },
            {
              q: "What does the active status do?",
              a: "It marks the one recommended next step: a soft inset brand tint and ring on the row so the eye lands there, and it's the row you'd give a primary (brand) button. Everything still incomplete stays todo with a quieter outline action. Using active is optional; a checklist reads fine with just todo and complete.",
            },
            {
              q: "Can each task have its own icon?",
              a: "Yes. Pass icon to a ChecklistItem and it shows in the indicator while the task is pending, then cross-fades to a check the moment the row completes (opacity, scale and blur, the same swap as Password Strength, no motion library). Omit it and a pending row shows an empty circle carrying just the status.",
            },
            {
              q: "Is it accessible?",
              a: "The bar is a role=progressbar with valuemin/max/now and a valuetext of 'X of Y complete'. Each item carries a data-status plus an sr-only label (Not started / In progress / Completed) so the state is announced, not only colored. The indicator itself is aria-hidden decoration.",
            },
            {
              q: "Will it adapt to dark and the other themes?",
              a: "Yes. Every color is a semantic token, brand, success, muted, border, card, so the panel, the brand highlight and the green completion bar re-theme across light, dark, cream, and moonlight automatically.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
