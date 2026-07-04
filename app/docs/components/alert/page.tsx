import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertActions,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { DismissibleDemo } from "./dismissible-demo"

export const metadata = {
  title: "Alert",
}

export default function AlertDocsPage() {
  return (
    <>
      <DocHeader
        title="Alert"
        description="An inline status banner for page-level messages, validation summaries, and contextual feedback. Five semantic variants, optional icon, actions, and a dismiss button."
      />

      <ComponentPreview
        code={`<Alert variant="success">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Deployment successful</AlertTitle>
    <AlertDescription>
      Your application has been deployed to production.
    </AlertDescription>
  </AlertContent>
</Alert>`}
      >
        <div className="w-full max-w-lg">
          <Alert variant="success">
            <AlertIcon />
            <AlertContent>
              <AlertTitle>Deployment successful</AlertTitle>
              <AlertDescription>
                Your application has been deployed to production.
              </AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="alert" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertActions,
} from "@/components/ui/alert"

export function Example() {
  return (
    <Alert variant="info">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
      </AlertContent>
    </Alert>
  )
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          Five semantic variants. Each keeps a neutral surface (
          <code className="font-mono text-sm">border-border</code> on{" "}
          <code className="font-mono text-sm">bg-background</code>) and only recolors the
          leading icon from a single semantic token (
          <code className="font-mono text-sm">--success</code>,{" "}
          <code className="font-mono text-sm">--warning</code>, etc.), so the status reads at
          a glance and re-themes across all four Koala themes automatically.
        </p>
        <ComponentPreview
          code={`<Alert variant="default">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Default</AlertTitle>
    <AlertDescription>A neutral, non-semantic message.</AlertDescription>
  </AlertContent>
</Alert>
<Alert variant="info">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Info</AlertTitle>
    <AlertDescription>Informational context for the user.</AlertDescription>
  </AlertContent>
</Alert>
<Alert variant="success">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>The operation completed successfully.</AlertDescription>
  </AlertContent>
</Alert>
<Alert variant="warning">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Warning</AlertTitle>
    <AlertDescription>Review before proceeding.</AlertDescription>
  </AlertContent>
</Alert>
<Alert variant="destructive">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Something went wrong. Please try again.</AlertDescription>
  </AlertContent>
</Alert>`}
        >
          <div className="flex w-full max-w-lg flex-col gap-3">
            <Alert variant="default">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Default</AlertTitle>
                <AlertDescription>A neutral, non-semantic message.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="info">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>Informational context for the user.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="success">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>The operation completed successfully.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="warning">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Review before proceeding.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="destructive">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <ComponentPreview
          code={`<Alert variant="info" size="sm">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Small alert</AlertTitle>
    <AlertDescription>Compact size for dense UIs.</AlertDescription>
  </AlertContent>
</Alert>
<Alert variant="info" size="md">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Medium alert</AlertTitle>
    <AlertDescription>Default size for most contexts.</AlertDescription>
  </AlertContent>
</Alert>`}
        >
          <div className="flex w-full max-w-lg flex-col gap-3">
            <Alert variant="info" size="sm">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Small alert</AlertTitle>
                <AlertDescription>Compact size for dense UIs.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert variant="info" size="md">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Medium alert</AlertTitle>
                <AlertDescription>Default size for most contexts.</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With icon">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">AlertIcon</code> auto-selects the
          matching Phosphor icon for the current variant when no children are given.
          Pass children to use a custom icon instead.
        </p>
        <ComponentPreview
          code={`{/* Auto icon from variant */}
<Alert variant="warning">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Auto icon</AlertTitle>
  </AlertContent>
</Alert>

{/* Custom icon */}
<Alert variant="warning">
  <AlertIcon><Rocket weight="fill" /></AlertIcon>
  <AlertContent>
    <AlertTitle>Custom icon</AlertTitle>
  </AlertContent>
</Alert>

{/* No icon */}
<Alert variant="warning">
  <AlertContent>
    <AlertTitle>No icon</AlertTitle>
  </AlertContent>
</Alert>`}
        >
          <div className="flex w-full max-w-lg flex-col gap-3">
            <Alert variant="warning">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Auto icon from variant</AlertTitle>
              </AlertContent>
            </Alert>
            <Alert variant="warning">
              <AlertContent>
                <AlertTitle>No icon</AlertTitle>
                <AlertDescription>Omit AlertIcon entirely to go icon-free.</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With actions">
        <p className="mt-4 text-pretty text-muted-foreground">
          Use <code className="font-mono text-sm">AlertActions</code> inside{" "}
          <code className="font-mono text-sm">AlertContent</code> to add a row of
          action buttons below the description.
        </p>
        <ComponentPreview
          code={`<Alert variant="warning">
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Unsaved changes</AlertTitle>
    <AlertDescription>
      You have unsaved changes that will be lost if you leave.
    </AlertDescription>
    <AlertActions>
      <Button size="sm" variant="outline">Discard</Button>
      <Button size="sm">Save changes</Button>
    </AlertActions>
  </AlertContent>
</Alert>`}
        >
          <div className="w-full max-w-lg">
            <Alert variant="warning">
              <AlertIcon />
              <AlertContent>
                <AlertTitle>Unsaved changes</AlertTitle>
                <AlertDescription>
                  You have unsaved changes that will be lost if you leave.
                </AlertDescription>
                <AlertActions>
                  <Button size="sm" variant="outline">Discard</Button>
                  <Button size="sm">Save changes</Button>
                </AlertActions>
              </AlertContent>
            </Alert>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dismissible">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">onDismiss</code> to render a
          close button. The component is uncontrolled - the consumer manages
          visibility. Use{" "}
          <code className="font-mono text-sm">dismissLabel</code> to provide a
          screen-reader accessible label (defaults to{" "}
          <code className="font-mono text-sm">&quot;Dismiss&quot;</code>).
        </p>
        <ComponentPreview
          code={`const [open, setOpen] = React.useState(true)

{open && (
  <Alert variant="info" onDismiss={() => setOpen(false)}>
    <AlertIcon />
    <AlertContent>
      <AlertTitle>New update available</AlertTitle>
      <AlertDescription>Version 2.4.0 is ready to install.</AlertDescription>
    </AlertContent>
  </Alert>
)}`}
        >
          <DismissibleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I reach for Alert instead of Toast?",
              a: "Use Alert for inline, persistent messages that stay in the page flow: validation summaries, page-level banners, or contextual feedback next to the content it describes. Reach for Toast when the message is ephemeral and should auto-dismiss without occupying layout space.",
            },
            {
              q: "What does the variant prop change beyond the color?",
              a: "variant sets the semantic tone (`default`, `info`, `success`, `warning`, `destructive`) which drives both the accent color and, when you render an empty `AlertIcon`, the auto-selected Phosphor icon. The tints derive from a single token per role so all five variants re-theme across the four Koala themes.",
            },
            {
              q: "How does AlertIcon pick its icon?",
              a: "Leave `AlertIcon` empty and it auto-selects the icon matching the current variant (CheckCircle for success, Warning for warning, and so on). Pass children to use a custom icon, or omit `AlertIcon` entirely for an icon-free alert.",
            },
            {
              q: "How do I make an Alert dismissible?",
              a: "Pass an `onDismiss` handler to render the close button; the component is uncontrolled, so you own the visibility state (typically a `useState` boolean that conditionally renders the Alert). Set `dismissLabel` to customize the screen-reader label, which defaults to \"Dismiss\".",
            },
            {
              q: "Where do AlertActions and AlertContent go in the part tree?",
              a: "Wrap your title and description in `AlertContent`, and place `AlertActions` as the last child inside `AlertContent` so the button row sits below the description. Keep `AlertIcon` as a sibling of `AlertContent`, not nested inside it.",
            },
            {
              q: "Is Alert announced to screen readers?",
              a: "Yes. The root renders with `role=\"alert\"`, so assistive tech announces the content when it appears. For messages that are not urgent status updates, consider whether a less interruptive pattern is more appropriate.",
            },
          ]}
        />
      </DocSection>

    </>
  )
}
