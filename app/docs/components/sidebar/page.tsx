import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  SidebarDemo,
  SidebarSwitcherDemo,
  SidebarSwitcherVariantDemo,
  SidebarItemDemo,
  SidebarTilesDemo,
  SidebarDensityDemo,
  SidebarVariantsDemo,
  SidebarNestedDemo,
  SidebarCollapsibleGroupDemo,
  SidebarFloatingDemo,
  SidebarSideDemo,
} from "./demos"

export const metadata = { title: "Sidebar" }

const heroCode = `<Sidebar aria-label="Main">
  <SidebarHeader>
    {/* workspace switcher: a SidebarSwitcher in a DropdownMenu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* compact by default; pass variant="full" + a subtitle for the roomy identity row */}
        <SidebarSwitcher leading={<BrandMark wordmark={false} />} title="Koala" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">…</DropdownMenuContent>
    </DropdownMenu>
  </SidebarHeader>

  <SidebarContent>
    {/* primary pages: first, unlabeled */}
    <SidebarGroup aria-label="Primary">
      <SidebarItem active><SquaresFour /> Dashboard</SidebarItem>
      <SidebarItem>
        <Tray /> Inbox
        <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">8</Badge>
      </SidebarItem>
      <SidebarItem><Stack /> Projects</SidebarItem>
    </SidebarGroup>

    {/* favorites: starred pages, marked with their page color */}
    <SidebarGroup aria-label="Favorites">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarItem><Dot className="bg-purple" /> Q3 Roadmap</SidebarItem>
      <SidebarItem><Dot className="bg-teal" /> Design System</SidebarItem>
    </SidebarGroup>

    {/* a clearly-labeled section */}
    <SidebarGroup aria-label="Workspace">
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarItem><UsersThree /> Members</SidebarItem>
      <SidebarItem><GearSix /> Settings</SidebarItem>
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter>
    {/* profile switcher: same trigger, menu opens upward */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarSwitcher leading={<Avatar />} title="Mara Okonkwo" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">…</DropdownMenuContent>
    </DropdownMenu>
  </SidebarFooter>
</Sidebar>`

export default function SidebarDocsPage() {
  return (
    <>
      <DocHeader
        title="Sidebar"
        description="The application navigation rail. Stack the parts you need: a workspace switcher up top, the primary pages first, clearly-labeled sections and favorites below, and a profile switcher pinned to the bottom. Both switchers are the same trigger, composed with the Dropdown Menu for the menu behavior."
      />

      <ComponentPreview previewClassName="block p-6" code={heroCode}>
        <SidebarDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="sidebar" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarItem, SidebarSwitcher,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar aria-label="Main">
      <SidebarHeader>{/* workspace switcher */}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup aria-label="Primary">
          <SidebarItem active>{/* <Icon /> Label */}</SidebarItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{/* profile switcher */}</SidebarFooter>
    </Sidebar>
  )
}`}
        />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">Sidebar</code> is a flex column on a{" "}
          <code className="font-mono text-sm">bg-card</code> surface.{" "}
          <code className="font-mono text-sm">SidebarHeader</code> and{" "}
          <code className="font-mono text-sm">SidebarFooter</code> pin to the top and bottom
          with a hairline separator; <code className="font-mono text-sm">SidebarContent</code>{" "}
          is the scroll region in between. Inside it,{" "}
          <code className="font-mono text-sm">SidebarGroup</code> is a navigation section.
          Give it a <code className="font-mono text-sm">SidebarGroupLabel</code> when it needs
          a heading, or leave it unlabeled for the primary pages. Each{" "}
          <code className="font-mono text-sm">SidebarItem</code> is a row.
        </p>
      </DocSection>

      <DocSection title="Switchers">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SidebarSwitcher</code> is one trigger used for
          both the workspace switcher (top) and the profile switcher (bottom): a{" "}
          <code className="font-mono text-sm">leading</code> visual, a{" "}
          <code className="font-mono text-sm">title</code> (with an optional{" "}
          <code className="font-mono text-sm">subtitle</code>), and an up/down caret. It renders a real{" "}
          <code className="font-mono text-sm">{`<button>`}</code>, so it drops straight into a{" "}
          <code className="font-mono text-sm">DropdownMenuTrigger asChild</code>. Radix owns
          the keyboard, focus, and ARIA; the switcher stays lit while its menu is open.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    {/* compact by default, no variant needed */}
    <SidebarSwitcher leading={<BrandMark wordmark={false} />} title="Koala" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem><BrandMark wordmark={false} /> Koala <Check className="ml-auto" /></DropdownMenuItem>
    <DropdownMenuItem><Rocket /> Skunkworks</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem><Plus /> Create workspace</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <SidebarSwitcherDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Full switcher">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SidebarSwitcher</code> takes a{" "}
          <code className="font-mono text-sm">variant</code>. The default is the compact trigger
          (a tight gap, a small muted caret, and reduced padding), the everyday switcher, paired
          with a small <code className="font-mono text-sm">leading</code> (an{" "}
          <code className="font-mono text-sm">Avatar size=&quot;xs&quot;</code>, a single initial, or
          a compact logo tile). Pass{" "}
          <code className="font-mono text-sm">variant=&quot;full&quot;</code> for the roomier
          identity row: a wider gap, a heavier title, and room for a{" "}
          <code className="font-mono text-sm">subtitle</code>. Pair it with a larger leading (an{" "}
          <code className="font-mono text-sm">Avatar size=&quot;md&quot;</code>, which keeps both
          initials) for a primary or standalone switcher.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`{/* compact: the default, no variant needed */}
<SidebarSwitcher leading={<Avatar size="xs" />} title="Koala" />

{/* full: a larger leading + a subtitle reads as the roomy identity row */}
<SidebarSwitcher
  variant="full"
  leading={<Avatar size="md" />}
  title="Koala"
  subtitle="Enterprise plan"
/>`}
        >
          <SidebarSwitcherVariantDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Items">
        <p className="mt-4 text-pretty text-muted-foreground">
          A <code className="font-mono text-sm">SidebarItem</code> is a{" "}
          <code className="font-mono text-sm">{`<button>`}</code> by default; pass{" "}
          <code className="font-mono text-sm">asChild</code> to wrap an{" "}
          <code className="font-mono text-sm">{`<a>`}</code> or a Next{" "}
          <code className="font-mono text-sm">{`<Link>`}</code>. Mark the current page with{" "}
          <code className="font-mono text-sm">active</code> (it fills the row and sets{" "}
          <code className="font-mono text-sm">aria-current=&quot;page&quot;</code>). Lay the
          children out as <code className="font-mono text-sm">{`<Icon /> Label`}</code> and
          push a trailing <code className="font-mono text-sm">Badge</code> or count to the
          right with <code className="font-mono text-sm">ml-auto</code>.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<SidebarItem active><SquaresFour /> Active page</SidebarItem>
<SidebarItem><Stack /> Default page</SidebarItem>
<SidebarItem>
  <Tray /> With a count
  <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">12</Badge>
</SidebarItem>
<SidebarItem disabled><GearSix /> Disabled page</SidebarItem>
<SidebarItem asChild>
  <a href="#"><CalendarBlank /> A real link (asChild)</a>
</SidebarItem>`}
        >
          <SidebarItemDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Colored icon tiles">
        <p className="mt-4 text-pretty text-muted-foreground">
          Swap the bare leading glyph for a{" "}
          <code className="font-mono text-sm">SidebarItemIcon</code>: a soft, hue-tinted rounded
          square that gives each destination its own color, the &ldquo;colored spaces&rdquo; rail
          you see in Productboard or Linear. Wrap a single icon and pass a{" "}
          <code className="font-mono text-sm">tone</code> (decorative:{" "}
          <code className="font-mono text-sm">purple</code>,{" "}
          <code className="font-mono text-sm">pink</code>,{" "}
          <code className="font-mono text-sm">teal</code>,{" "}
          <code className="font-mono text-sm">orange</code>; status:{" "}
          <code className="font-mono text-sm">green</code>,{" "}
          <code className="font-mono text-sm">blue</code>,{" "}
          <code className="font-mono text-sm">red</code>,{" "}
          <code className="font-mono text-sm">amber</code>, plus{" "}
          <code className="font-mono text-sm">brand</code>). The tile scales with density and
          becomes the centered chip in the collapsed rail. The active row still reads through the
          neutral chip and brand bar, the tiles decorate, they don&rsquo;t signal selection.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<SidebarGroup aria-label="Spaces">
  <SidebarGroupLabel>Spaces</SidebarGroupLabel>
  <SidebarItem active asChild>
    <a href="/portfolio">
      <SidebarItemIcon tone="purple"><Cube /></SidebarItemIcon>
      Product Portfolio
    </a>
  </SidebarItem>
  <SidebarItem asChild>
    <a href="/strategy">
      <SidebarItemIcon tone="orange"><Target /></SidebarItemIcon>
      Strategy
    </a>
  </SidebarItem>
  <SidebarItem asChild>
    <a href="/feedback">
      <SidebarItemIcon tone="green"><Gift /></SidebarItemIcon>
      Customer Feedback
    </a>
  </SidebarItem>
  <SidebarItem asChild>
    <a href="/roadmap">
      <SidebarItemIcon tone="pink"><Signpost /></SidebarItemIcon>
      Roadmapping
    </a>
  </SidebarItem>
</SidebarGroup>`}
        >
          <SidebarTilesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Nested navigation">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">SidebarCollapsible</code> folds a sub-list of routes
          under a parent row. Give it an <code className="font-mono text-sm">icon</code> and{" "}
          <code className="font-mono text-sm">label</code>, drop the child{" "}
          <code className="font-mono text-sm">SidebarItem</code>s inside, and the row gains a caret
          that toggles them open, built on Radix Collapsible, so it owns the keyboard, focus, and
          height animation. The sub-list is indented under the label and traced by a guide rail;
          set <code className="font-mono text-sm">active</code> on the parent when one of its child
          routes is current. In the collapsed icon rail it falls back to a single icon row.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<SidebarGroup aria-label="Primary">
  <SidebarItem active><SquaresFour /> Dashboard</SidebarItem>

  {/* a parent row that folds its routes: active because a child is current */}
  <SidebarCollapsible icon={<GearSix />} label="Settings" active defaultOpen>
    <SidebarItem active asChild><a href="#">General</a></SidebarItem>
    <SidebarItem asChild><a href="#">Members</a></SidebarItem>
    <SidebarItem asChild><a href="#">Billing</a></SidebarItem>
  </SidebarCollapsible>

  <SidebarCollapsible
    icon={<Stack />}
    label="Projects"
    actions={<Badge variant="secondary" size="sm">3</Badge>}
  >
    <SidebarItem asChild><a href="#">Koala UI</a></SidebarItem>
    <SidebarItem asChild><a href="#">Marketing site</a></SidebarItem>
  </SidebarCollapsible>
</SidebarGroup>`}
        >
          <SidebarNestedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Collapsible sections">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">collapsible</code> to a{" "}
          <code className="font-mono text-sm">SidebarGroup</code> and its{" "}
          <code className="font-mono text-sm">SidebarGroupLabel</code> becomes a toggle with a
          caret. Wrap the rows in{" "}
          <code className="font-mono text-sm">SidebarGroupContent</code> so they fold beneath it.
          Use <code className="font-mono text-sm">defaultOpen</code> (or the controlled{" "}
          <code className="font-mono text-sm">open</code>/
          <code className="font-mono text-sm">onOpenChange</code> pair) to set the initial state.
          Unlike nested navigation, this folds a whole flat section rather than revealing sub-routes.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<SidebarGroup collapsible defaultOpen aria-label="Favorites">
  <SidebarGroupLabel>Favorites</SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarItem><Dot className="bg-purple" /> Q3 Roadmap</SidebarItem>
    <SidebarItem><Dot className="bg-teal" /> Design System</SidebarItem>
  </SidebarGroupContent>
</SidebarGroup>

{/* starts folded */}
<SidebarGroup collapsible defaultOpen={false} aria-label="Workspace">
  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarItem><UsersThree /> Members</SidebarItem>
    <SidebarItem><GearSix /> Settings</SidebarItem>
  </SidebarGroupContent>
</SidebarGroup>`}
        >
          <SidebarCollapsibleGroupDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Collapsed (icon rail)">
        <p className="mt-4 text-pretty text-muted-foreground">
          The rail has two variants, driven by the same markup. The{" "}
          <code className="font-mono text-sm">default</code> is the full-width rail;{" "}
          <code className="font-mono text-sm">collapsed</code> shrinks it to a 48px icon-only
          column. Labels go <code className="font-mono text-sm">sr-only</code>, each row becomes
          a centered icon, the active row is marked with a left accent bar instead of a full
          chip, sections are divided by a short rule, and the switcher reduces to its leading
          visual. Give every <code className="font-mono text-sm">SidebarItem</code> a{" "}
          <code className="font-mono text-sm">label</code> so the collapsed row gets a hover
          tooltip and an accessible name, and mark secondary sections with{" "}
          <code className="font-mono text-sm">{`<SidebarGroup hideWhenCollapsed>`}</code> so they
          drop out of the rail rather than reducing to bare glyphs.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`{/* default: the full-width rail */}
<Sidebar aria-label="Main">…</Sidebar>

{/* collapsed: a 48px icon rail */}
<Sidebar collapsed aria-label="Main">
  <SidebarHeader>{/* switcher collapses to its leading tile */}</SidebarHeader>
  <SidebarContent>
    <SidebarGroup aria-label="Primary">
      {/* label drives the collapsed tooltip + accessible name */}
      <SidebarItem active label="Dashboard"><SquaresFour /> Dashboard</SidebarItem>
      <SidebarItem label="Inbox">
        <Tray /> Inbox
        <Badge variant="secondary" size="sm" className="ml-auto tabular-nums">8</Badge>
      </SidebarItem>
      <SidebarItem label="Projects"><Stack /> Projects</SidebarItem>
    </SidebarGroup>
    {/* secondary sections drop out of the rail */}
    <SidebarGroup aria-label="Favorites" hideWhenCollapsed>…</SidebarGroup>
  </SidebarContent>
  <SidebarFooter>{/* profile switcher */}</SidebarFooter>
</Sidebar>`}
        >
          <SidebarVariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Floating (inset)">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">floating</code> detaches the rail into an inset
          card: a full outline, a rounded radius concentric with the app shell, and a shadow that
          lifts it off the canvas, instead of a single edge hairline. Pair it with padding on the
          container (or the <a href="/docs/components/layout" className="underline underline-offset-4">Layout</a>{" "}
          gutter) so it floats clear of the viewport edges.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<div className="flex h-full bg-muted/30 p-3">
  <Sidebar floating aria-label="Main" className="w-60">…</Sidebar>
  <main className="flex-1">…</main>
</div>`}
        >
          <SidebarFloatingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Right side">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">side=&quot;right&quot;</code> docks the rail against
          the right edge. The separating hairline flips to its left so it reads as an
          inspector/detail panel beside the main content. Everything else (switchers, sections,
          density) is symmetric.
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<div className="flex h-full">
  <main className="flex-1">…</main>
  <Sidebar side="right" aria-label="Details" className="w-60">…</Sidebar>
</div>`}
        >
          <SidebarSideDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density</code> on{" "}
          <code className="font-mono text-sm">Sidebar</code> flows through context to the zone
          padding, the inter-section gap, the row height, and the switcher padding.{" "}
          <code className="font-mono text-sm">compact</code> is the default (app UI);{" "}
          <code className="font-mono text-sm">comfortable</code> is roomier. Set it once here
          or for a whole subtree with{" "}
          <code className="font-mono text-sm">DensityProvider</code>. See{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">
            Density
          </a>
          .
        </p>
        <ComponentPreview
          previewClassName="block p-6"
          code={`<Sidebar density="comfortable" aria-label="Main">…</Sidebar>`}
        >
          <SidebarDensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I wire a workspace or profile switcher?", a: "`SidebarSwitcher` is one trigger that renders a real `<button>`, so drop it into a `DropdownMenuTrigger asChild` and Radix owns the keyboard, focus, and ARIA. Use it in `SidebarHeader` for the workspace switcher (menu opens down) and in `SidebarFooter` for the profile switcher (menu opens up)." },
            { q: "What is the difference between SidebarCollapsible and a collapsible SidebarGroup?", a: "`SidebarCollapsible` folds a sub-list of routes under a parent row, revealing nested navigation with a guide rail. Passing `collapsible` to a `SidebarGroup` turns its `SidebarGroupLabel` into a toggle that folds a whole flat section (wrap the rows in `SidebarGroupContent`). Use the first for sub-routes, the second to collapse a section." },
            { q: "How do I mark the current page?", a: "Set `active` on the `SidebarItem`: it fills the row and sets `aria-current=\"page\"`. On a `SidebarCollapsible` parent, set `active` when one of its child routes is current." },
            { q: "Should a SidebarItem be a button or a link?", a: "It is a `<button>` by default; pass `asChild` and wrap an `<a>` or a Next `<Link>` to make it a real navigation link while keeping the row styling." },
            { q: "How do I get the colored icon tiles?", a: "Replace the row's bare leading glyph with a `SidebarItemIcon` wrapping a single icon, and pass a `tone` (`purple`, `pink`, `teal`, `orange`, `green`, `blue`, `red`, `amber`, or `brand`). It renders a soft hue-tinted rounded square that scales with density and becomes the centered chip when the rail is collapsed. It's decorative, so the active row still reads through the neutral chip and brand bar." },
            { q: "What do I need for the collapsed icon rail?", a: "Pass `collapsed` to the `Sidebar` to shrink it to a 48px icon-only column. Give every `SidebarItem` a `label` so the collapsed row gets a hover tooltip and an accessible name, and mark secondary sections with `<SidebarGroup hideWhenCollapsed>` so they drop out rather than reducing to bare glyphs." },
            { q: "What do floating and side='right' change?", a: "`floating` detaches the rail into an inset card with a full outline, concentric radius, and a lifted shadow (pair it with container padding). `side=\"right\"` docks the rail to the right edge and flips the separating hairline to its left so it reads as an inspector panel." },
          ]}
        />
      </DocSection>

    </>
  )
}
