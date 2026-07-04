import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  ToastDemo,
  ToastVariantsDemo,
  ToastWithActionDemo,
  ToastStackDemo,
  ToastPersistDemo,
} from "./toast-demo"

export const metadata = {
  title: "Toast",
}

export default function ToastDocsPage() {
  return (
    <>
      <DocHeader
        title="Toast"
        description="Transient status messages anchored to a corner. Toasts stack with a compressed fan when multiple are queued - hover to expand the full list."
      />

      <ComponentPreview
        code={`import { toast } from "@/components/ui/toast"

<Button onClick={() => toast("Your changes have been saved.")}>
  Show toast
</Button>`}
      >
        <ToastDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="toast" />
        <p className="mt-4 text-sm text-pretty text-muted-foreground">
          Add <code>{"<Toaster />"}</code> once to your root layout - it renders the fixed
          viewport and is required for toasts to appear.
        </p>
        <CodeSnippet
          filename="app/layout.tsx"
          className="mt-4"
          code={`import { Toaster } from "@/components/ui/toast"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`}
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { toast, useToast } from "@/components/ui/toast"

// Imperative - works anywhere (Server Actions, event handlers, outside React)
toast("File saved.")
toast.success("Uploaded.")
toast.error("Something went wrong.")
toast.warning("Disk space low.")
toast.info("Version 2.4 available.")

// Hook - same API, inside React components
function MyComponent() {
  const { toast } = useToast()
  return <Button onClick={() => toast("Done!")}>Save</Button>
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          Five semantic variants: <code>default</code>, <code>success</code>,{" "}
          <code>warning</code>, <code>destructive</code>, and <code>info</code>. Every
          toast is the same neutral elevated card (border + shadow); the status colour is
          carried by the icon, so the variants stay calm and never get lost on the corner.
        </p>
        <ComponentPreview
          code={`toast("Changes saved successfully.")
toast.success("File uploaded.", { description: "profile-photo.png is ready." })
toast.warning("Storage almost full.", { description: "You have 200 MB remaining." })
toast.error("Upload failed.", { description: "The server returned a 413 error." })
toast.info("New version available.", { description: "Refresh the page to get v2.4.0." })`}
        >
          <ToastVariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With action">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass an <code>action</code> object with a <code>label</code> and{" "}
          <code>onClick</code> handler. The button appears below the description and is
          announced as an accessible action by screen readers.
        </p>
        <ComponentPreview
          code={`toast({
  title: "Email sent.",
  description: "Your message was delivered to alex@example.com.",
  action: {
    label: "Undo",
    onClick: () => toast("Send undone."),
  },
})`}
        >
          <ToastWithActionDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Stacking">
        <p className="mt-4 text-pretty text-muted-foreground">
          When multiple toasts are queued they compress into a fan - older toasts peek
          behind the newest one at decreasing scale and offset. Hover (or focus) the
          stack to expand all toasts to their full size with an 8 px gap. Up to three
          toasts show in the collapsed fan; any beyond that are hidden until older ones
          are dismissed.
        </p>
        <ComponentPreview
          code={`// Fire several toasts and hover the stack to expand
toast({ title: "Build passed", variant: "success" })
toast({ title: "Deploy queued", description: "Estimated time: 2 min." })
toast({ title: "Preview ready", variant: "info" })`}
        >
          <ToastStackDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Persistent">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code>{"duration={Infinity}"}</code> to keep the toast until the user
          explicitly dismisses it. Useful for in-progress operations or critical alerts.
        </p>
        <ComponentPreview
          code={`toast({
  title: "Syncing in background.",
  description: "This won't dismiss automatically.",
  duration: Infinity,
})`}
        >
          <ToastPersistDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Should I call toast(...) or use the useToast() hook?", a: "Both share the same API. The imperative `toast(...)` works anywhere, including Server Actions, event handlers, and code outside React, while `useToast()` returns the same `toast` plus a `dismiss` function for use inside components. Reach for the hook only when you want the matching `dismiss` helper at hand." },
            { q: "Why do my toasts never appear?", a: "You almost certainly forgot to render `<Toaster />` once in your root layout. It draws the fixed viewport that every toast portals into, so without it the calls succeed silently but nothing shows." },
            { q: "How do I make a toast persist until dismissed?", a: "Pass `duration={Infinity}` in the options object. The default is 5000 ms; Infinity keeps the toast up until the user clicks its Close button or your code calls `dismiss(id)` with the id returned from `toast(...)`." },
            { q: "What is the difference between toast.error and a destructive variant?", a: "They are the same thing. `toast.error(...)` is a shortcut that sets `variant: \"destructive\"`, which is the role name used across the design system for danger styling. The shorthands `toast.success`, `toast.warning`, and `toast.info` map to their matching variants." },
            { q: "How do I add an Undo button to a toast?", a: "Pass an `action` object with a `label` and an `onClick`. It renders below the description as a Radix Toast Action with the label as its `altText`, so screen readers announce it as an actionable control." },
            { q: "Why do queued toasts collapse into a fan?", a: "Stacking is handled by the Toaster: older toasts compress behind the newest at decreasing scale and offset so the corner stays calm. Hover or focus the stack to expand all of them to full size; only three show in the collapsed fan and the rest wait until older ones dismiss." },
          ]}
        />
      </DocSection>

    </>
  )
}
