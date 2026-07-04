import {
  MagnifyingGlass,
  FolderOpen,
  Plus,
  UploadSimple,
  WarningCircle,
  ArrowClockwise,
  CheckCircle,
  Users,
  Bell,
} from "@phosphor-icons/react/ssr"

import {
  EmptyState,
  EmptyStateMedia,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Empty State",
}

export default function EmptyStateDocsPage() {
  return (
    <>
      <DocHeader
        title="Empty State"
        description="The zero-data, no-results, and first-run placeholder. A tinted icon surface, a balanced title, a readable description, and a primary action, composed from named parts, with soft media tints that re-theme everywhere and a density axis for in-panel use."
      />

      <ComponentPreview
        code={`<EmptyState>
  <EmptyStateMedia>
    <FolderOpen />
  </EmptyStateMedia>
  <EmptyStateTitle>No projects yet</EmptyStateTitle>
  <EmptyStateDescription>
    Create your first project to start organizing work, inviting teammates, and shipping.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button variant="outline"><UploadSimple /> Import</Button>
    <Button><Plus /> New project</Button>
  </EmptyStateActions>
</EmptyState>`}
      >
        <EmptyState>
          <EmptyStateMedia>
            <FolderOpen weight="bold" />
          </EmptyStateMedia>
          <EmptyStateTitle>No projects yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create your first project to start organizing work, inviting teammates, and
            shipping.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button variant="outline">
              <UploadSimple weight="bold" /> Import
            </Button>
            <Button>
              <Plus weight="bold" /> New project
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="empty-state" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  EmptyState,
  EmptyStateMedia,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { MagnifyingGlass } from "@phosphor-icons/react/ssr"

export function Example() {
  return (
    <EmptyState>
      <EmptyStateMedia>
        <MagnifyingGlass />
      </EmptyStateMedia>
      <EmptyStateTitle>No results found</EmptyStateTitle>
      <EmptyStateDescription>
        Try adjusting your search or filters to find what you&apos;re looking for.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button variant="outline">Clear filters</Button>
      </EmptyStateActions>
    </EmptyState>
  )
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code>variant</code> prop tints the media surface from a single semantic
          token via opacity (the same soft pattern as Badge) so a search, error, or
          success state stays legible across all four themes. Set it on the root and every
          part picks it up through context.
        </p>
        <ComponentPreview
          previewClassName="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch"
          code={`<EmptyState variant="info">
  <EmptyStateMedia><MagnifyingGlass /></EmptyStateMedia>
  <EmptyStateTitle>No results</EmptyStateTitle>
  <EmptyStateDescription>Nothing matched that search.</EmptyStateDescription>
</EmptyState>

<EmptyState variant="destructive">
  <EmptyStateMedia><WarningCircle /></EmptyStateMedia>
  <EmptyStateTitle>Couldn't load data</EmptyStateTitle>
  <EmptyStateDescription>Something went wrong on our end.</EmptyStateDescription>
  <EmptyStateActions>
    <Button variant="outline"><ArrowClockwise /> Retry</Button>
  </EmptyStateActions>
</EmptyState>

<EmptyState variant="success">
  <EmptyStateMedia><CheckCircle /></EmptyStateMedia>
  <EmptyStateTitle>All caught up</EmptyStateTitle>
  <EmptyStateDescription>You&apos;ve cleared your inbox.</EmptyStateDescription>
</EmptyState>`}
        >
          <EmptyState variant="info">
            <EmptyStateMedia>
              <MagnifyingGlass weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>No results</EmptyStateTitle>
            <EmptyStateDescription>Nothing matched that search.</EmptyStateDescription>
          </EmptyState>
          <EmptyState variant="destructive">
            <EmptyStateMedia>
              <WarningCircle weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>Couldn&apos;t load data</EmptyStateTitle>
            <EmptyStateDescription>Something went wrong on our end.</EmptyStateDescription>
            <EmptyStateActions>
              <Button variant="outline">
                <ArrowClockwise weight="bold" /> Retry
              </Button>
            </EmptyStateActions>
          </EmptyState>
          <EmptyState variant="success">
            <EmptyStateMedia>
              <CheckCircle weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>All caught up</EmptyStateTitle>
            <EmptyStateDescription>You&apos;ve cleared your inbox.</EmptyStateDescription>
          </EmptyState>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code>density</code> retunes padding, the media and icon size, the title size,
          and the description measure, never color or the rounded brand corners.{" "}
          <code>comfortable</code> (the default) suits a full page or marketing surface;{" "}
          <code>compact</code> fits an in-panel placeholder. It also reads from a{" "}
          <code>DensityProvider</code>, so an app shell can set it once.
        </p>
        <ComponentPreview
          previewClassName="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch"
          code={`<EmptyState density="comfortable">
  <EmptyStateMedia><Bell /></EmptyStateMedia>
  <EmptyStateTitle>No notifications</EmptyStateTitle>
  <EmptyStateDescription>You&apos;re all caught up. New alerts land here.</EmptyStateDescription>
</EmptyState>

<EmptyState density="compact">
  <EmptyStateMedia><Bell /></EmptyStateMedia>
  <EmptyStateTitle>No notifications</EmptyStateTitle>
  <EmptyStateDescription>You&apos;re all caught up. New alerts land here.</EmptyStateDescription>
</EmptyState>`}
        >
          <EmptyState density="comfortable" className="rounded-xl border border-border">
            <EmptyStateMedia>
              <Bell weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>No notifications</EmptyStateTitle>
            <EmptyStateDescription>
              You&apos;re all caught up. New alerts land here.
            </EmptyStateDescription>
          </EmptyState>
          <EmptyState density="compact" className="rounded-xl border border-border">
            <EmptyStateMedia>
              <Bell weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>No notifications</EmptyStateTitle>
            <EmptyStateDescription>
              You&apos;re all caught up. New alerts land here.
            </EmptyStateDescription>
          </EmptyState>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Without actions">
        <p className="mt-4 text-pretty text-muted-foreground">
          The action row is optional; drop <code>EmptyStateActions</code> for a purely
          informational placeholder.
        </p>
        <ComponentPreview
          code={`<EmptyState>
  <EmptyStateMedia><Users /></EmptyStateMedia>
  <EmptyStateTitle>No team members</EmptyStateTitle>
  <EmptyStateDescription>
    Invitations you send will show up here until they&apos;re accepted.
  </EmptyStateDescription>
</EmptyState>`}
        >
          <EmptyState>
            <EmptyStateMedia>
              <Users weight="bold" />
            </EmptyStateMedia>
            <EmptyStateTitle>No team members</EmptyStateTitle>
            <EmptyStateDescription>
              Invitations you send will show up here until they&apos;re accepted.
            </EmptyStateDescription>
          </EmptyState>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do I compose an EmptyState?",
              a: "Nest the named parts inside the root: `EmptyStateMedia` (wrap a single icon), `EmptyStateTitle`, `EmptyStateDescription`, and the optional `EmptyStateActions`. They are exported individually rather than as `EmptyState.Media`, because dot-notation statics do not survive the RSC server-to-client boundary.",
            },
            {
              q: "What does the variant prop change?",
              a: "It only tints the media surface, deriving a background, border, and icon color from one semantic token via opacity (the same soft pattern as Badge). Options are `default`, `primary`, `success`, `warning`, `info`, and `destructive`, and every part reads it through context once you set it on the root.",
            },
            {
              q: "Are the action buttons required?",
              a: "No. `EmptyStateActions` is optional, so drop it for a purely informational placeholder. When present, author the buttons secondary-first in the DOM so the primary lands on the right and tab order matches the visual order.",
            },
            {
              q: "When should I use density compact versus comfortable?",
              a: "`comfortable` is the spacious default for a full page or marketing surface, while `compact` tightens padding, the media and icon size, the title size, and the description measure for an in-panel placeholder. It never touches color or the rounded corners.",
            },
            {
              q: "Can an app shell set the density once for many empty states?",
              a: "Yes. Density resolves prop over provider over comfortable, so wrapping a region in a `DensityProvider` lets every nested EmptyState inherit it without passing `density` on each one.",
            },
            {
              q: "How do I render the media as something other than a div?",
              a: "Both `EmptyState` and `EmptyStateMedia` accept `asChild` to merge their props onto your own element via Radix Slot. The media is marked `aria-hidden` since the icon is decorative and the title carries the meaning.",
            },
          ]}
        />
      </DocSection>

    </>
  )
}
