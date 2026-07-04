import { SidebarSimple, FileText, Eye, ChartBar, Table, Rows, DotsSixVertical } from "@phosphor-icons/react/ssr"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "Resizable",
}

export default function ResizableDocsPage() {
  return (
    <>
      <DocHeader
        title="Resizable"
        description="Split a surface into panels the user can drag to resize: the backbone of dashboards, editors, and split views. No Radix primitive ships this, so the handle is hand-rolled: it carries role=separator, is arrow-key operable, and reports its position through aria-valuenow. Sizing is DOM-driven for 60fps drags."
      />

      <ComponentPreview
        previewClassName="block p-6"
        code={`<ResizablePanelGroup direction="horizontal" className="h-72 w-full rounded-lg border">
  <ResizablePanel defaultSize={22} minSize={14}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <SidebarSimple className="size-5" />
      Sidebar
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={52}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <FileText className="size-5" />
      Editor
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={26} minSize={16}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <Eye className="size-5" />
      Preview
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`}
      >
        <ResizablePanelGroup direction="horizontal" className="h-72 w-full rounded-lg border">
          <ResizablePanel defaultSize={22} minSize={14}>
            <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
              <SidebarSimple weight="bold" className="size-5" />
              Sidebar
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={52}>
            <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
              <FileText weight="bold" className="size-5" />
              Editor
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={26} minSize={16}>
            <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
              <Eye weight="bold" className="size-5" />
              Preview
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="resizable" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export function Example() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-64 rounded-lg border">
      <ResizablePanel defaultSize={60}>One</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={40}>Two</ResizablePanel>
    </ResizablePanelGroup>
  )
}`}
        />
      </DocSection>

      <DocSection title="Horizontal">
        <p className="mt-4 text-pretty text-muted-foreground">
          The default direction lays panels side-by-side. Give each panel a{" "}
          <code className="font-mono text-sm">defaultSize</code> weight (conventionally
          summing to 100), then drag the divider to redistribute the space between the two
          panels it sits between.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-60 w-full rounded-lg border">
  <ResizablePanel defaultSize={50}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Left</div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={50}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Right</div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-60 w-full rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Left</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Right</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Vertical">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">direction=&quot;vertical&quot;</code> to
          stack panels and drag a horizontal divider. The handle, cursor, and keyboard axis
          all flip automatically.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="vertical" className="h-80 w-full rounded-lg border">
  <ResizablePanel defaultSize={60}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <ChartBar className="size-5" />
      Chart
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={40} minSize={20}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <Table className="size-5" />
      Table
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="vertical" className="h-80 w-full rounded-lg border">
            <ResizablePanel defaultSize={60}>
              <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                <ChartBar weight="bold" className="size-5" />
                Chart
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                <Table weight="bold" className="size-5" />
                Table
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With handle">
        <p className="mt-4 text-pretty text-muted-foreground">
          Add <code className="font-mono text-sm">withHandle</code> to render a minimal,
          fully-rounded grip pill: a clear &quot;drag me&quot; affordance for wide gutters.
          Without it the divider is a hairline that highlights on hover and focus.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
  <ResizablePanel defaultSize={50}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Grip</div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={50}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Hairline</div>
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">divider</div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Grip</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Hairline</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">divider</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Custom handle">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">children</code> to a{" "}
          <code className="font-mono text-sm">ResizableHandle</code> to swap the visual
          entirely (an icon nub, a brand chip, your own shape) while keeping all the drag,
          keyboard, and ARIA behavior. The two examples below show a dotted chip and a bold
          brand pill.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
  <ResizablePanel defaultSize={34}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Dotted chip</div>
  </ResizablePanel>
  <ResizableHandle>
    <span className="z-10 flex h-7 w-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-colors duration-fast ease-out group-hover/handle:border-brand group-hover/handle:text-foreground [&_svg]:size-3">
      <DotsSixVertical />
    </span>
  </ResizableHandle>
  <ResizablePanel defaultSize={32}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Brand pill</div>
  </ResizablePanel>
  <ResizableHandle>
    <span className="z-10 h-10 w-1.5 rounded-full bg-brand/40 transition-colors duration-fast ease-out group-hover/handle:bg-brand group-data-[dragging=true]/handle:bg-brand" />
  </ResizableHandle>
  <ResizablePanel defaultSize={34}>
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Done</div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
            <ResizablePanel defaultSize={34}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Dotted chip</div>
            </ResizablePanel>
            <ResizableHandle>
              <span className="z-10 flex h-7 w-4 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs transition-colors duration-fast ease-out group-hover/handle:border-brand group-hover/handle:text-foreground [&_svg]:size-3">
                <DotsSixVertical weight="bold" />
              </span>
            </ResizableHandle>
            <ResizablePanel defaultSize={32}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Brand pill</div>
            </ResizablePanel>
            <ResizableHandle>
              <span className="z-10 h-10 w-1.5 rounded-full bg-brand/40 transition-colors duration-fast ease-out group-hover/handle:bg-brand group-data-[dragging=true]/handle:bg-brand" />
            </ResizableHandle>
            <ResizablePanel defaultSize={34}>
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">Done</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Min & max sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Clamp how far a panel can be dragged with{" "}
          <code className="font-mono text-sm">minSize</code> and{" "}
          <code className="font-mono text-sm">maxSize</code>. A number (or{" "}
          <code className="font-mono text-sm">&quot;30%&quot;</code>) is a proportional
          weight; a pixel string like <code className="font-mono text-sm">&quot;240px&quot;</code>{" "}
          is a hard bound pinned as a real CSS min/max-width, so it holds at any group size:
          drag it, then shrink your window and the sidebar below keeps its{" "}
          <code className="font-mono text-sm">240px–360px</code> range instead of scaling away.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
  <ResizablePanel defaultSize={28} minSize="240px" maxSize="360px">
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">240px–360px</div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={72} minSize="320px">
    <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">min 320px</div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-56 w-full rounded-lg border">
            <ResizablePanel defaultSize={28} minSize="240px" maxSize="360px">
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">240px–360px</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={72} minSize="320px">
              <div className="grid h-full place-items-center p-4 text-sm font-medium text-muted-foreground">min 320px</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Collapsible">
        <p className="mt-4 text-pretty text-muted-foreground">
          Mark a panel <code className="font-mono text-sm">collapsible</code> and it snaps
          shut once dragged past half its <code className="font-mono text-sm">minSize</code>,
          settling at <code className="font-mono text-sm">collapsedSize</code> (default 0):
          the pattern for a sidebar that tucks away. Drag back out to restore it.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-60 w-full rounded-lg border">
  <ResizablePanel defaultSize={24} minSize={16} collapsible collapsedSize={0}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <SidebarSimple className="size-5" />
      Collapsible
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={76}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <FileText className="size-5" />
      Content
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-60 w-full rounded-lg border">
            <ResizablePanel defaultSize={24} minSize={16} collapsible collapsedSize={0}>
              <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                <SidebarSimple weight="bold" className="size-5" />
                Collapsible
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={76}>
              <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                <FileText weight="bold" className="size-5" />
                Content
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Nested dashboard">
        <p className="mt-4 text-pretty text-muted-foreground">
          Groups nest: put a vertical <code className="font-mono text-sm">ResizablePanelGroup</code>{" "}
          inside a panel of a horizontal one to build a real dashboard split. Each group
          resizes independently.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<ResizablePanelGroup direction="horizontal" className="h-80 w-full rounded-lg border">
  <ResizablePanel defaultSize={28} minSize={18}>
    <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
      <SidebarSimple className="size-5" />
      Navigation
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={72}>
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={65}>
        <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
          <ChartBar className="size-5" />
          Overview
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={20}>
        <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
          <Rows className="size-5" />
          Activity
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </ResizablePanel>
</ResizablePanelGroup>`}
        >
          <ResizablePanelGroup direction="horizontal" className="h-80 w-full rounded-lg border">
            <ResizablePanel defaultSize={28} minSize={18}>
              <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                <SidebarSimple weight="bold" className="size-5" />
                Navigation
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={72}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={65}>
                  <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                    <ChartBar weight="bold" className="size-5" />
                    Overview
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={20}>
                  <div className="grid h-full place-items-center gap-1.5 p-4 text-sm font-medium text-muted-foreground">
                    <Rows weight="bold" className="size-5" />
                    Activity
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-mono text-sm font-semibold">ResizablePanelGroup</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The split container. Forwards every <code className="font-mono text-sm">div</code> prop.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <code className="font-mono">direction</code>: <code className="font-mono">&quot;horizontal&quot; | &quot;vertical&quot;</code>. Lay panels side-by-side or stacked. Default <code className="font-mono">&quot;horizontal&quot;</code>.
              </li>
              <li>
                <code className="font-mono">onLayout</code>: <code className="font-mono">(sizes: number[]) =&gt; void</code>. Fires with the panel weights (DOM order) whenever the layout changes.
              </li>
              <li>
                <code className="font-mono">className</code>: sizes the box; panels fill it. Give it a height (and usually a border/radius).
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">ResizablePanel</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              One region of the split. Forwards every <code className="font-mono text-sm">div</code> prop.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <code className="font-mono">defaultSize</code>: <code className="font-mono">number</code>. Starting weight (conventionally a percentage). Omit on every panel for an equal split.
              </li>
              <li>
                <code className="font-mono">minSize</code> / <code className="font-mono">maxSize</code>: <code className="font-mono">number | string</code>. Clamp the drag range. A number/<code className="font-mono">&quot;%&quot;</code> is a proportional weight; <code className="font-mono">&quot;240px&quot;</code> is a hard width/height bound that holds on window resize.
              </li>
              <li>
                <code className="font-mono">collapsible</code>: <code className="font-mono">boolean</code>. Snap shut past half <code className="font-mono">minSize</code>.
              </li>
              <li>
                <code className="font-mono">collapsedSize</code>: <code className="font-mono">number | string</code>. Size when collapsed. Default <code className="font-mono">0</code>.
              </li>
              <li>
                <code className="font-mono">asChild</code>: <code className="font-mono">boolean</code>. Render as the child element via Radix Slot.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold">ResizableHandle</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The draggable divider. <code className="font-mono text-sm">role=&quot;separator&quot;</code>, arrow-key operable (Shift = coarse, Home/End jump to min/max). Forwards every <code className="font-mono text-sm">div</code> prop.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <code className="font-mono">withHandle</code>: <code className="font-mono">boolean</code>. Show the minimal rounded grip pill.
              </li>
              <li>
                <code className="font-mono">children</code>: <code className="font-mono">ReactNode</code>. Custom handle content, centered on the divider, replaces the default pill while keeping all behavior.
              </li>
              <li>
                <code className="font-mono">disabled</code>: <code className="font-mono">boolean</code>. Disable dragging and keyboard resizing.
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I set the initial split between panels?", a: "Give each ResizablePanel a `defaultSize` weight, conventionally summing to 100. Omit it on every panel for an equal split." },
            { q: "What is the difference between a numeric minSize and a pixel string?", a: "A number (or a `\"%\"` string) is a proportional weight that scales with the group. A pixel string like `\"240px\"` is a hard bound pinned as a real CSS min/max width, so it holds at any group size, even as the window resizes." },
            { q: "How do I make a panel collapse like a tucked-away sidebar?", a: "Mark the panel `collapsible`. It snaps shut once dragged past half its `minSize`, settling at `collapsedSize` (default 0). Drag back out to restore it." },
            { q: "Is the handle keyboard accessible?", a: "Yes. ResizableHandle carries `role=\"separator\"` and reports its position via `aria-valuenow`. It is arrow-key operable, with Shift for coarse steps and Home/End to jump to min/max." },
            { q: "How do I customize the divider's appearance?", a: "Add `withHandle` for the minimal rounded grip pill, or pass `children` to ResizableHandle to replace the visual entirely (an icon nub, a brand chip) while keeping all the drag, keyboard, and ARIA behavior. Without either it is a hairline that highlights on hover and focus." },
            { q: "Can I build a dashboard with rows and columns?", a: "Yes, groups nest. Put a vertical ResizablePanelGroup inside a panel of a horizontal one. Each group resizes independently. Use `onLayout` on a group to read the panel weights whenever the layout changes." },
          ]}
        />
      </DocSection>
    </>
  )
}
