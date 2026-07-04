import { House, ActivityIcon, Gear } from "@phosphor-icons/react/ssr"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = { title: "Tabs" }

function DemoPanel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

export default function TabsDocsPage() {
  return (
    <>
      <DocHeader
        title="Tabs"
        description="Switch between related panels. Built on Radix Tabs for behavior and a11y, styled with one tv slots recipe. The active state is a single indicator measured in JS and slid with transform."
      />

      <ComponentPreview
        previewClassName="block"
        code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="activity">…</TabsContent>
  <TabsContent value="settings">…</TabsContent>
</Tabs>`}
      >
        <Tabs defaultValue="overview" className="mx-auto w-full max-w-md">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <DemoPanel>Your project at a glance.</DemoPanel>
          </TabsContent>
          <TabsContent value="activity">
            <DemoPanel>Recent activity across the team.</DemoPanel>
          </TabsContent>
          <TabsContent value="settings">
            <DemoPanel>Manage preferences and access.</DemoPanel>
          </TabsContent>
        </Tabs>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="tabs" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs"

export function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account panel</TabsContent>
      <TabsContent value="password">Password panel</TabsContent>
    </Tabs>
  )
}`}
        />
      </DocSection>

      <DocSection title="Pill (default)">
        <ComponentPreview
          previewClassName="block"
          code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="activity">…</TabsContent>
  <TabsContent value="settings">…</TabsContent>
</Tabs>`}
        >
          <Tabs defaultValue="overview" className="mx-auto w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <DemoPanel>Your project at a glance.</DemoPanel>
            </TabsContent>
            <TabsContent value="activity">
              <DemoPanel>Recent activity across the team.</DemoPanel>
            </TabsContent>
            <TabsContent value="settings">
              <DemoPanel>Manage preferences and access.</DemoPanel>
            </TabsContent>
          </Tabs>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Folder">
        <ComponentPreview
          previewClassName="block"
          code={`<Tabs defaultValue="overview" variant="folder">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  …
</Tabs>`}
        >
          <Tabs defaultValue="overview" variant="folder" className="mx-auto w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <DemoPanel>Active tab shows a pill background and a sliding underline.</DemoPanel>
            </TabsContent>
            <TabsContent value="activity">
              <DemoPanel>Recent activity across the team.</DemoPanel>
            </TabsContent>
            <TabsContent value="settings">
              <DemoPanel>Manage preferences and access.</DemoPanel>
            </TabsContent>
          </Tabs>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Line">
        <ComponentPreview
          previewClassName="block"
          code={`<Tabs defaultValue="overview" variant="line">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  …
</Tabs>`}
        >
          <Tabs defaultValue="overview" variant="line" className="mx-auto w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <DemoPanel>No container, just the active label and a bar that lights up in the accent color.</DemoPanel>
            </TabsContent>
            <TabsContent value="activity">
              <DemoPanel>Recent activity across the team.</DemoPanel>
            </TabsContent>
            <TabsContent value="settings">
              <DemoPanel>Manage preferences and access.</DemoPanel>
            </TabsContent>
          </Tabs>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icons">
        <ComponentPreview
          previewClassName="block"
          code={`import { House, ActivityIcon, Gear } from "@phosphor-icons/react/ssr"

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview"><House />Overview</TabsTrigger>
    <TabsTrigger value="activity"><ActivityIcon />Activity</TabsTrigger>
    <TabsTrigger value="settings"><Gear />Settings</TabsTrigger>
  </TabsList>
  …
</Tabs>`}
        >
          <Tabs defaultValue="overview" className="mx-auto w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview"><House weight="bold" />Overview</TabsTrigger>
              <TabsTrigger value="activity"><ActivityIcon weight="bold" />Activity</TabsTrigger>
              <TabsTrigger value="settings"><Gear weight="bold" />Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <DemoPanel>Your project at a glance.</DemoPanel>
            </TabsContent>
            <TabsContent value="activity">
              <DemoPanel>Recent activity across the team.</DemoPanel>
            </TabsContent>
            <TabsContent value="settings">
              <DemoPanel>Manage preferences and access.</DemoPanel>
            </TabsContent>
          </Tabs>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Tabs ship at one tight size (a 14px label in a 32px-tall trigger).{" "}
          <code className="font-mono text-sm">density</code> tightens the pill chrome for
          application UI: a snugger container and tighter concentric radii. Set it per
          tabs or for a whole subtree with{" "}
          <code className="font-mono text-sm">DensityProvider</code> - see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <ComponentPreview
          previewClassName="flex-col items-start gap-6"
          code={`<Tabs density="comfortable" defaultValue="a">…</Tabs>
<Tabs density="compact" defaultValue="a">…</Tabs>`}
        >
          {(["comfortable", "compact"] as const).map((d) => (
            <Tabs key={d} density={d} defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">First</TabsTrigger>
                <TabsTrigger value="b">Second</TabsTrigger>
              </TabsList>
            </Tabs>
          ))}
        </ComponentPreview>
      </DocSection>

      <DocSection title="Overflow">
        <p className="mt-4 text-pretty text-muted-foreground">
          When the tabs are wider than their container, the list scrolls horizontally in a single
          row instead of pushing the layout wide, so tabs never break the page on narrow viewports.
          Scrollbars are hidden across Koala, so the leading edge softly fades toward the tabs you
          can still scroll to. It is inert whenever the tabs already fit.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<Tabs defaultValue="overview" className="max-w-xs">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
    <TabsTrigger value="members">Members</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  …
</Tabs>`}
        >
          <Tabs defaultValue="overview" className="mx-auto w-full max-w-xs">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <DemoPanel>Drag or swipe the tab row; the edge fades toward more tabs.</DemoPanel>
            </TabsContent>
            <TabsContent value="activity">
              <DemoPanel>Recent activity across the team.</DemoPanel>
            </TabsContent>
            <TabsContent value="reports">
              <DemoPanel>Scheduled and saved reports.</DemoPanel>
            </TabsContent>
            <TabsContent value="members">
              <DemoPanel>People with access to this project.</DemoPanel>
            </TabsContent>
            <TabsContent value="billing">
              <DemoPanel>Plan, invoices, and payment method.</DemoPanel>
            </TabsContent>
            <TabsContent value="security">
              <DemoPanel>Sessions, devices, and audit log.</DemoPanel>
            </TabsContent>
          </Tabs>
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How are TabsTrigger and TabsContent wired together?", a: "Each `TabsTrigger` and its matching `TabsContent` share the same `value` string, and the active tab comes from `defaultValue` (uncontrolled) or `value` with `onValueChange` (controlled). It is Radix Tabs underneath, so they pair purely by value." },
            { q: "What is the difference between the pill, folder, and line variants?", a: "`pill` (the default) is a contained segmented control with a sliding background. `folder` keeps a pill background on the active tab plus a sliding bar on a bottom rule. `line` drops the container entirely and shows only the accent-colored underline bar." },
            { q: "Can I change the size of the tabs?", a: "Tabs ship at a single tight size (a 14px label in a 32px-tall trigger), so the control stays consistent everywhere. To make the chrome snugger for dense application UI, use `density` (`comfortable` or `compact`), which tightens the container padding and concentric radii without changing the text size. Set it per Tabs or for a subtree via `DensityProvider`." },
            { q: "How does the active indicator slide?", a: "A single indicator element is measured in JS (offset box of the active trigger) and moved with `transform`. It re-measures on selection change, resize, and font shifts, and the transition only switches on after the first paint so it never animates in from the origin on load." },
            { q: "What happens when there are more tabs than fit?", a: "The list scrolls horizontally in a single row instead of overflowing the page, so tabs stay on one line on narrow viewports. Scrollbars are hidden across Koala, so a soft edge fade (`scroll-fade-x`) hints at the tabs you can still scroll toward. The behavior is inert when the tabs already fit, and the sliding indicator scrolls glued to the active tab. To wrap onto multiple rows instead, pass `flex-wrap` to `TabsList`." },
            { q: "Do I get keyboard navigation for free?", a: "Yes. Because Tabs is built on Radix Tabs you get arrow-key roving focus, Home and End, and the correct tab and tabpanel ARIA roles without any extra wiring." },
            { q: "How do I add an icon to a trigger?", a: "Drop a Phosphor icon as a child of `TabsTrigger` alongside the label. The recipe already sizes any nested svg to 16px and spaces it from the text, so no extra classes are needed." },
          ]}
        />
      </DocSection>

    </>
  )
}
