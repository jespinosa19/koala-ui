import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ToolbarFormattingDemo,
  ToolbarCollapsedDemo,
  ToolbarResponsiveDemo,
  ToolbarScrollableDemo,
  ToolbarAppBarDemo,
  ToolbarSolidDemo,
  ToolbarDesignDemo,
  ToolbarVariantsDemo,
  ToolbarSizesDemo,
  ToolbarToggleDemo,
  ToolbarDropdownDemo,
  ToolbarVerticalDemo,
  ToolbarMediaDemo,
} from "./demos"

export const metadata = {
  title: "Toolbar",
}

export default function ToolbarDocsPage() {
  return (
    <>
      <DocHeader
        title="Toolbar"
        description="A keyboard-navigable band that groups icon controls, dropdown triggers, toggle sets, and separators into one unit. Built on Radix Toolbar, so it ships role=toolbar, roving tab focus, and arrow-key movement. All controls share one gliding tooltip."
      />

      <ComponentPreview
        code={`<Toolbar aria-label="Text formatting">
  {/* Text style — a DropdownMenu trigger */}
  <DropdownMenu>
    <Tooltip content="Text style">
      <DropdownMenuTrigger asChild>
        <ToolbarButton caret aria-label="Text style">
          <TextT />
        </ToolbarButton>
      </DropdownMenuTrigger>
    </Tooltip>
    <DropdownMenuContent align="start">…</DropdownMenuContent>
  </DropdownMenu>

  {/* Text color — the caret trigger opens the canonical ColorPicker */}
  <ColorPickerPopover>
    <Tooltip content="Text color">
      <ColorPickerTrigger asChild>
        <ToolbarButton caret aria-label="Text color">
          <span className="size-5 rounded-sm" style={{ backgroundColor: color }} />
        </ToolbarButton>
      </ColorPickerTrigger>
    </Tooltip>
    <ColorPickerContent>
      <ColorPicker value={color} onValueChange={setColor} showAlpha showInput={false} showPresets={false} />
    </ColorPickerContent>
  </ColorPickerPopover>

  <ToolbarSeparator />

  <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
    <ToolbarToggleItem value="bold" tooltip="Bold" shortcut="⌘B">
      <TextB />
    </ToolbarToggleItem>
    <ToolbarToggleItem value="italic" tooltip="Italic" shortcut="⌘I">
      <TextItalic />
    </ToolbarToggleItem>
    <ToolbarToggleItem value="underline" tooltip="Underline" shortcut="⌘U">
      <TextUnderline />
    </ToolbarToggleItem>
    <ToolbarToggleItem value="strike" tooltip="Strikethrough">
      <TextStrikethrough />
    </ToolbarToggleItem>
  </ToolbarToggleGroup>

  <ToolbarSeparator />

  <ToolbarButton tooltip="Link" shortcut="⌘K"><LinkSimple /></ToolbarButton>
  <ToolbarButton tooltip="Quote"><Quotes /></ToolbarButton>
  <ToolbarButton tooltip="Code block"><Code /></ToolbarButton>

  <ToolbarSeparator />

  <ToolbarToggleGroup type="single" value={align} onValueChange={setAlign}>
    <ToolbarToggleItem value="left" tooltip="Align left"><TextAlignLeft /></ToolbarToggleItem>
    <ToolbarToggleItem value="center" tooltip="Align center"><TextAlignCenter /></ToolbarToggleItem>
    <ToolbarToggleItem value="right" tooltip="Align right"><TextAlignRight /></ToolbarToggleItem>
  </ToolbarToggleGroup>

  <ToolbarSeparator />

  <ToolbarButton tooltip="Bullet list"><ListBullets /></ToolbarButton>
  <ToolbarButton tooltip="Numbered list"><ListNumbers /></ToolbarButton>

  <ToolbarSeparator />

  <ToolbarButton tooltip="Insert image"><Image /></ToolbarButton>
  <ToolbarButton tooltip="Comment"><ChatCircle /></ToolbarButton>
</Toolbar>`}
      >
        <ToolbarFormattingDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="toolbar" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "@/components/ui/toolbar"

export function Example() {
  const [marks, setMarks] = useState<string[]>(["bold"])
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
        <ToolbarToggleItem value="bold" tooltip="Bold" shortcut="⌘B">
          <TextB />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" tooltip="Italic" shortcut="⌘I">
          <TextItalic />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Link" shortcut="⌘K">
        <LinkSimple />
      </ToolbarButton>
    </Toolbar>
  )
}`}
        />
      </DocSection>

      <DocSection title="Collapsed">
        <p className="mt-4 text-pretty text-muted-foreground">
          A full format bar can outgrow its surface. Collapse it: give each cluster its own caret
          dropdown that unlocks only its options (text style, color, marks, link, list, alignment,
          insert). The same bar, a fraction of the width, and every trigger is the same
          affordance: a caret, one meaning. (The three-dots overflow is a different thing entirely,
          reserved for the automatic <a href="#responsive-overflow" className="underline underline-offset-4">Responsive overflow</a>{" "}
          below, where it means &quot;controls that didn&apos;t fit.&quot;) Any{" "}
          <code className="font-mono text-sm">ToolbarButton</code> used as a dropdown trigger stays
          lit while its menu is open, and a <code className="font-mono text-sm">caret</code> button
          flips its chevron. No extra wiring: it&apos;s built into the button.
        </p>
        <ComponentPreview
          code={`<Toolbar aria-label="Compact formatting">
  {/* Each cluster is a caret dropdown that unlocks only its own options. The trigger
      auto-lights and flips its caret while open — no per-trigger className needed. */}
  <DropdownMenu>
    <Tooltip content="Text actions">
      <DropdownMenuTrigger asChild>
        <ToolbarButton caret aria-label="Text actions">
          <TextB />
        </ToolbarButton>
      </DropdownMenuTrigger>
    </Tooltip>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Text actions</DropdownMenuLabel>
      {MARKS.map((m) => (
        <DropdownMenuCheckboxItem
          key={m.value}
          checked={marks.includes(m.value)}
          onCheckedChange={() => toggleMark(m.value)}
          onSelect={(e) => e.preventDefault()} // keep open to toggle several
        >
          <m.icon /> {m.label}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>

  {/* …and so on for color, link, list. Alignment is a caret group too — the trigger
      mirrors the active alignment, and the menu is a radio group. */}
  <DropdownMenu>
    <Tooltip content="Alignment">
      <DropdownMenuTrigger asChild>
        <ToolbarButton caret aria-label="Alignment"><TextAlignLeft /></ToolbarButton>
      </DropdownMenuTrigger>
    </Tooltip>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Alignment</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={align} onValueChange={setAlign}>…</DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</Toolbar>`}
        >
          <ToolbarCollapsedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Responsive overflow">
        <p className="mt-4 text-pretty text-muted-foreground">
          Let the bar collapse itself. <code className="font-mono text-sm">ToolbarOverflow</code>{" "}
          takes your controls as data, shows as many as fit, and folds the rest into the three-dots
          menu, live, expanding again when the space returns.{" "}
          <strong className="font-medium text-foreground">Drag the handle</strong> to shrink the
          track and watch controls move into (and back out of){" "}
          <code className="font-mono text-sm">More</code>. Each control&apos;s footprint is measured
          once on first paint, then a <code className="font-mono text-sm">ResizeObserver</code> only
          re-runs a cheap greedy pack, so resizing stays smooth. Each control is declared once and
          rendered in both places (a bar button and a menu row), so the two never drift.
        </p>
        <ComponentPreview
          code={`const [marks, setMarks] = useState(["bold"])
const toggle = (id) => setMarks((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

// Declare the controls once; the primitive renders each as a bar button AND a menu row.
const items: ToolbarOverflowItem[] = [
  { type: "action", id: "undo", icon: ArrowUUpLeft, label: "Undo", shortcut: "⌘Z" },
  { type: "action", id: "redo", icon: ArrowUUpRight, label: "Redo", shortcut: "⌘⇧Z" },
  { type: "separator", id: "s1" },
  { type: "toggle", id: "bold", icon: TextB, label: "Bold", shortcut: "⌘B",
    pressed: marks.includes("bold"), onPressedChange: () => toggle("bold") },
  { type: "toggle", id: "italic", icon: TextItalic, label: "Italic",
    pressed: marks.includes("italic"), onPressedChange: () => toggle("italic") },
  // …more controls
]

// One component: it measures its width and folds what doesn't fit into a ⋮ menu, live.
<ToolbarOverflow items={items} aria-label="Formatting" />`}
        >
          <ToolbarResponsiveDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Scrolling">
        <p className="mt-4 text-pretty text-muted-foreground">
          The low-chrome alternative to an overflow menu: pass{" "}
          <code className="font-mono text-sm">scrollable</code> and the bar scrolls on its axis
          instead of wrapping when its controls exceed the width. A scroll-aware edge fade (the{" "}
          <code className="font-mono text-sm">scroll-fade</code> utility) hints that there&apos;s
          more on whichever side you can still scroll toward, and the scrollbar is hidden. Reach for
          this when every control should stay reachable without a menu (a mobile format bar).
        </p>
        <ComponentPreview
          code={`<Toolbar scrollable aria-label="Formatting" className="w-full max-w-xs">
  <ToolbarButton tooltip="Undo"><ArrowUUpLeft /></ToolbarButton>
  <ToolbarButton tooltip="Redo"><ArrowUUpRight /></ToolbarButton>
  <ToolbarSeparator />
  {/* …more controls than the width can hold; the bar scrolls with an edge fade */}
</Toolbar>`}
        >
          <ToolbarScrollableDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          Three levels of chrome. <code className="font-mono text-sm">floating</code> (the default)
          is an elevated pill that hovers over content, like an on-selection format bar.{" "}
          <code className="font-mono text-sm">outline</code> is the same shape sitting flat on the
          page, and <code className="font-mono text-sm">plain</code> is chromeless for a header or
          footer that already owns its surface.
        </p>
        <ComponentPreview
          previewClassName="flex-col"
          code={`<Toolbar aria-label="Floating">…</Toolbar>

<Toolbar variant="outline" aria-label="Outline">…</Toolbar>

<Toolbar variant="plain" aria-label="Plain">…</Toolbar>`}
        >
          <ToolbarVariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Solid">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">solid</code> is an inverted, high-contrast strip for a
          contextual bar sitting over media or imagery: a player overlay, a canvas HUD. It&apos;s
          token-pure, flipping foreground and background, so it reads dark on light themes and light
          on dark, and re-tints its controls and dividers to match.
        </p>
        <ComponentPreview
          code={`<Toolbar variant="solid" aria-label="Overlay controls">
  <ToolbarButton tooltip="Previous"><SkipBack weight="fill" /></ToolbarButton>
  <ToolbarButton tooltip="Play"><Play weight="fill" /></ToolbarButton>
  <ToolbarButton tooltip="Next"><SkipForward weight="fill" /></ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton tooltip="Volume"><SpeakerHigh /></ToolbarButton>
</Toolbar>`}
        >
          <ToolbarSolidDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Design canvas">
        <p className="mt-4 text-pretty text-muted-foreground">
          The same shell dressed as a design tool&apos;s canvas HUD, the way Figma floats its bar
          over the artboard. It&apos;s the <code className="font-mono text-sm">solid</code> variant
          for the black chrome, a full run of canvas tools (move, frame, shapes, pen, text, hand,
          comment, insert), and a trailing group for AI and Dev Mode. Tools are single-select: the
          one in hand flips to a brand-blue chip, matching Figma&apos;s selected tool and the
          DS&apos;s brand-for-primary rule, while shapes and the pen are caret dropdowns whose
          trigger mirrors the variant currently in hand.
        </p>
        <ComponentPreview
          code={`// The active tool flips the pressed chip to brand (Figma's selected-tool blue).
const activeTool = "data-[pressed]:bg-brand data-[pressed]:text-white data-[pressed]:hover:bg-brand"

<Toolbar variant="solid" aria-label="Design tools">
  <ToolbarButton tooltip="Move" shortcut="V" pressed={tool === "move"}
    onClick={() => setTool("move")} className={activeTool}>
    <Cursor />
  </ToolbarButton>

  {/* Shapes — a caret dropdown; the trigger wears the active shape */}
  <DropdownMenu>
    <Tooltip content="Shapes">
      <DropdownMenuTrigger asChild>
        <ToolbarButton caret aria-label="Shapes" pressed={tool === "shape"} className={activeTool}>
          <ShapeIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>
    </Tooltip>
    <DropdownMenuContent align="start">
      <DropdownMenuRadioGroup value={shape} onValueChange={(v) => { setShape(v); setTool("shape") }}>
        {SHAPE_TOOLS.map((s) => <DropdownMenuRadioItem key={s.value} value={s.value}>…</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* …text, hand, comment, insert… */}
  <ToolbarSeparator />
  <ToolbarButton tooltip="AI actions"><MagicWand /></ToolbarButton>
  <ToolbarButton tooltip="Dev Mode" pressed={devMode} onClick={() => setDevMode((v) => !v)}>
    <Code />
  </ToolbarButton>
</Toolbar>`}
        >
          <ToolbarDesignDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">sm</code> (24px controls) for dense rails,{" "}
          <code className="font-mono text-sm">md</code> (28px, the default), and{" "}
          <code className="font-mono text-sm">lg</code> (36px) for a touch-friendly or marketing
          surface. This <code className="font-mono text-sm">size</code> axis is the toolbar&apos;s own
          density knob: it deliberately does <em>not</em> inherit the page&apos;s{" "}
          <code className="font-mono text-sm">comfortable/compact</code> form density, because a
          control bar that shrinks to form-compact gets hard to hit. All keep a
          40px hit area via an invisible vertical extender, so small controls never get harder to
          click than they look.
        </p>
        <ComponentPreview
          previewClassName="flex-col"
          code={`<Toolbar size="sm" aria-label="Small">…</Toolbar>

<Toolbar size="md" aria-label="Medium">…</Toolbar>

<Toolbar size="lg" aria-label="Large">…</Toolbar>`}
        >
          <ToolbarSizesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Groups, title, and spacing">
        <p className="mt-4 text-pretty text-muted-foreground">
          Build an app bar from three structural parts.{" "}
          <code className="font-mono text-sm">ToolbarGroup</code> wraps a run of controls into a
          named region (give it an <code className="font-mono text-sm">aria-label</code> and screen
          readers announce it), <code className="font-mono text-sm">ToolbarTitle</code> is a
          non-interactive label, and <code className="font-mono text-sm">ToolbarSpacer</code> is a
          flexible gap that pushes everything after it to the far end.
        </p>
        <ComponentPreview
          code={`<Toolbar aria-label="Document" variant="outline" className="w-full max-w-xl">
  <ToolbarTitle>Proposal.md</ToolbarTitle>
  <ToolbarSpacer />
  <ToolbarGroup aria-label="History">
    <ToolbarButton tooltip="Undo"><ArrowUUpLeft /></ToolbarButton>
    <ToolbarButton tooltip="Redo"><ArrowUUpRight /></ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup aria-label="Text format">
    <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>…</ToolbarToggleGroup>
  </ToolbarGroup>
</Toolbar>`}
        >
          <ToolbarAppBarDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Toggle groups">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap controls that hold their pressed state in a{" "}
          <code className="font-mono text-sm">ToolbarToggleGroup</code>. Use{" "}
          <code className="font-mono text-sm">type=&quot;multiple&quot;</code> for independent on/off
          marks (bold, italic, underline) or{" "}
          <code className="font-mono text-sm">type=&quot;single&quot;</code> for
          a mutually exclusive choice (text alignment). A selected item reads as a filled chip.
        </p>
        <ComponentPreview
          code={`<Toolbar aria-label="Toggle groups">
  <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
    <ToolbarToggleItem value="bold" tooltip="Bold"><TextB /></ToolbarToggleItem>
    <ToolbarToggleItem value="italic" tooltip="Italic"><TextItalic /></ToolbarToggleItem>
    <ToolbarToggleItem value="underline" tooltip="Underline"><TextUnderline /></ToolbarToggleItem>
  </ToolbarToggleGroup>
  <ToolbarSeparator />
  <ToolbarToggleGroup type="single" value={align} onValueChange={setAlign}>
    <ToolbarToggleItem value="left" tooltip="Align left"><TextAlignLeft /></ToolbarToggleItem>
    <ToolbarToggleItem value="center" tooltip="Align center"><TextAlignCenter /></ToolbarToggleItem>
    <ToolbarToggleItem value="right" tooltip="Align right"><TextAlignRight /></ToolbarToggleItem>
  </ToolbarToggleGroup>
</Toolbar>`}
        >
          <ToolbarToggleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dropdown triggers">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">caret</code> to make a control grow to fit its
          glyph and show a trailing chevron: the dropdown-trigger look. Compose it with our{" "}
          <a href="/docs/components/dropdown-menu" className="underline underline-offset-4">
            Dropdown Menu
          </a>{" "}
          or <a href="/docs/components/popover" className="underline underline-offset-4">Popover</a>{" "}
          via <code className="font-mono text-sm">asChild</code>. Wrap the trigger in a{" "}
          <code className="font-mono text-sm">Tooltip</code> for a hint (that keeps the hint outside
          the trigger, so it never fights the menu&apos;s open state).
        </p>
        <ComponentPreview
          code={`<DropdownMenu>
  <Tooltip content="Text style">
    <DropdownMenuTrigger asChild>
      <ToolbarButton caret aria-label="Text style">
        <TextT />
      </ToolbarButton>
    </DropdownMenuTrigger>
  </Tooltip>
  <DropdownMenuContent align="start">
    <DropdownMenuLabel>Turn into</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={block} onValueChange={setBlock}>
      <DropdownMenuRadioItem value="paragraph">Paragraph</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="h1">Heading 1</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="h2">Heading 2</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <ToolbarDropdownDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Vertical orientation">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">orientation=&quot;vertical&quot;</code> for a tool
          rail. Arrow-key navigation follows the axis, separators turn horizontal, and{" "}
          <code className="font-mono text-sm">tooltipPlacement=&quot;right&quot;</code> keeps the hints clear
          of the column.
        </p>
        <ComponentPreview
          code={`<Toolbar aria-label="Canvas tools" orientation="vertical">
  <ToolbarToggleGroup type="single" orientation="vertical" value={tool} onValueChange={setTool}>
    <ToolbarToggleItem value="select" tooltip="Select" tooltipPlacement="right">…</ToolbarToggleItem>
    <ToolbarToggleItem value="text" tooltip="Text" tooltipPlacement="right">…</ToolbarToggleItem>
    <ToolbarToggleItem value="image" tooltip="Image" tooltipPlacement="right">…</ToolbarToggleItem>
  </ToolbarToggleGroup>
  <ToolbarSeparator />
  <ToolbarButton tooltip="Comment" tooltipPlacement="right"><ChatCircle /></ToolbarButton>
</Toolbar>`}
        >
          <ToolbarVerticalDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Beyond text">
        <p className="mt-4 text-pretty text-muted-foreground">
          The shell is generic. Here it holds media transport controls, showing the same buttons,
          toggle group, and separators serve a player just as well as an editor.
        </p>
        <ComponentPreview
          code={`<Toolbar aria-label="Playback controls">
  <ToolbarButton tooltip="Previous"><SkipBack /></ToolbarButton>
  <ToolbarButton tooltip={playing ? "Pause" : "Play"} onClick={toggle}>
    {playing ? <Pause /> : <Play />}
  </ToolbarButton>
  <ToolbarButton tooltip="Next"><SkipForward /></ToolbarButton>
  <ToolbarSeparator />
  <ToolbarToggleGroup type="multiple" value={modes} onValueChange={setModes}>
    <ToolbarToggleItem value="shuffle" tooltip="Shuffle"><Shuffle /></ToolbarToggleItem>
    <ToolbarToggleItem value="repeat" tooltip="Repeat"><Repeat /></ToolbarToggleItem>
  </ToolbarToggleGroup>
  <ToolbarSeparator />
  <ToolbarButton tooltip="Volume"><SpeakerHigh /></ToolbarButton>
</Toolbar>`}
        >
          <ToolbarMediaDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 space-y-6 text-pretty text-muted-foreground">
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">Toolbar</h3>
            <p className="mt-1">
              The band. Wraps Radix <code className="font-mono text-sm">Toolbar.Root</code> and
              forwards its props (<code className="font-mono text-sm">loop</code>,{" "}
              <code className="font-mono text-sm">dir</code>, …).
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code className="font-mono text-sm">variant</code> —{" "}
                <code className="font-mono text-sm">&quot;floating&quot;</code> (default) ·{" "}
                <code className="font-mono text-sm">&quot;outline&quot;</code> ·{" "}
                <code className="font-mono text-sm">&quot;plain&quot;</code> ·{" "}
                <code className="font-mono text-sm">&quot;solid&quot;</code> (inverted, for overlays).
              </li>
              <li>
                <code className="font-mono text-sm">size</code> —{" "}
                <code className="font-mono text-sm">&quot;sm&quot;</code> ·{" "}
                <code className="font-mono text-sm">&quot;md&quot;</code> (default) ·{" "}
                <code className="font-mono text-sm">&quot;lg&quot;</code>. The toolbar&apos;s own density
                axis; it does not inherit the page&apos;s <code className="font-mono text-sm">comfortable/compact</code>{" "}
                density.
              </li>
              <li>
                <code className="font-mono text-sm">scrollable</code> — scroll on the axis with an
                edge fade instead of wrapping when controls exceed the width.
              </li>
              <li>
                <code className="font-mono text-sm">orientation</code> —{" "}
                <code className="font-mono text-sm">&quot;horizontal&quot;</code> (default) ·{" "}
                <code className="font-mono text-sm">&quot;vertical&quot;</code>. Drives both the layout and
                Radix&apos;s arrow-key axis.
              </li>
              <li>
                <code className="font-mono text-sm">aria-label</code> — names the toolbar for
                assistive tech. Defaults to <code className="font-mono text-sm">&quot;Toolbar&quot;</code>;
                set something specific.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">ToolbarButton</h3>
            <p className="mt-1">
              An icon control (Radix <code className="font-mono text-sm">Toolbar.Button</code>).
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code className="font-mono text-sm">tooltip</code> — hover/focus hint; a string also
                becomes the <code className="font-mono text-sm">aria-label</code> when none is set.
              </li>
              <li>
                <code className="font-mono text-sm">shortcut</code> — a keycap shown in the tooltip
                (display only, e.g. <code className="font-mono text-sm">&quot;⌘B&quot;</code>).
              </li>
              <li>
                <code className="font-mono text-sm">pressed</code> — mark the control active (sets{" "}
                <code className="font-mono text-sm">aria-pressed</code> and the filled chip).
              </li>
              <li>
                <code className="font-mono text-sm">caret</code> — trailing chevron + auto width for
                a dropdown trigger.
              </li>
              <li>
                <code className="font-mono text-sm">asChild</code> — render as a menu/popover
                trigger; <code className="font-mono text-sm">static</code> — drop the press scale.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">
              ToolbarToggleGroup · ToolbarToggleItem
            </h3>
            <p className="mt-1">
              Controls that hold a pressed state (Radix{" "}
              <code className="font-mono text-sm">Toolbar.ToggleGroup</code>). The group takes{" "}
              <code className="font-mono text-sm">type</code> (
              <code className="font-mono text-sm">&quot;single&quot;</code> /{" "}
              <code className="font-mono text-sm">&quot;multiple&quot;</code>) plus{" "}
              <code className="font-mono text-sm">value</code>/
              <code className="font-mono text-sm">onValueChange</code>. Each item shares{" "}
              <code className="font-mono text-sm">tooltip</code>,{" "}
              <code className="font-mono text-sm">shortcut</code>, and{" "}
              <code className="font-mono text-sm">tooltipPlacement</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">
              ToolbarSeparator · ToolbarLink
            </h3>
            <p className="mt-1">
              A hairline that groups controls (orientation-aware), and a text link that lives in the
              bar and keeps the roving focus (Radix{" "}
              <code className="font-mono text-sm">Toolbar.Separator</code> /{" "}
              <code className="font-mono text-sm">Toolbar.Link</code>).
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">
              ToolbarGroup · ToolbarTitle · ToolbarSpacer
            </h3>
            <p className="mt-1">
              Structure parts. <code className="font-mono text-sm">ToolbarGroup</code> is an{" "}
              <code className="font-mono text-sm">aria-label</code>led{" "}
              <code className="font-mono text-sm">role=&quot;group&quot;</code> cluster;{" "}
              <code className="font-mono text-sm">ToolbarTitle</code> a non-interactive label; and{" "}
              <code className="font-mono text-sm">ToolbarSpacer</code> a flexible gap that pins later
              controls to the end.
            </p>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">ToolbarOverflow</h3>
            <p className="mt-1">
              A self-collapsing toolbar. Takes{" "}
              <code className="font-mono text-sm">items</code> (an array of{" "}
              <code className="font-mono text-sm">action</code>,{" "}
              <code className="font-mono text-sm">toggle</code>, and{" "}
              <code className="font-mono text-sm">separator</code> descriptors), renders as many as
              fit, and folds the rest into a three-dots menu, remeasuring on resize. Also takes{" "}
              <code className="font-mono text-sm">overflowLabel</code>,{" "}
              <code className="font-mono text-sm">menuAlign</code>, and the{" "}
              <code className="font-mono text-sm">Toolbar</code> variant/size props. Horizontal only.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How is this different from ButtonGroup?",
              a: "ButtonGroup fuses a few related buttons into one pill and shares variant/size across them. Toolbar is a larger, keyboard-navigable container built on Radix Toolbar: it has role=toolbar, a single Tab stop with arrow-key movement between controls, separators, toggle groups, and links. Reach for Toolbar when you have many grouped controls (a format bar, a tool rail); reach for ButtonGroup for a small switch like Day/Week/Month.",
            },
            {
              q: "Why do all the tooltips glide instead of fading?",
              a: "The Toolbar wraps its children in a TooltipGroup, so every control shares one bubble (a Tippy singleton) that slides from control to control. It's the smooth way to tooltip a dense row and matches how the rich text editor's toolbar behaves.",
            },
            {
              q: "How do I make a dropdown trigger?",
              a: "Give a ToolbarButton the caret prop and render it asChild of a DropdownMenuTrigger (or PopoverTrigger). Wrap that trigger in a Tooltip for a hint, keeping the Tooltip outside the trigger so it doesn't fight the menu's open state.",
            },
            {
              q: "How do I collapse a toolbar that's too wide?",
              a: "Fold each cluster into its own caret dropdown that unlocks just its options (text style, marks, alignment, insert, …). Keep every trigger a caret so the bar stays consistent — the caret means 'this control has options.' Any ToolbarButton used as a dropdown/popover trigger already lights its chip while open (Radix sets data-state=open on it) and a caret button flips its chevron, so you write plain <ToolbarButton caret> with no per-trigger className. See the Collapsed example.",
            },
            {
              q: "Caret dropdown or a three-dots (⋮) overflow: which when?",
              a: "They're different affordances, don't mix them for the same job. A caret (⌄) means 'this control has its own options' — use it for curated clusters (text style, alignment). A three-dots (⋮) means 'more / overflow' — use it only when controls are moved out of view because they didn't fit, which is exactly what ToolbarOverflow does automatically. So: hand-curated groups get carets (Collapsed); automatic width-based collapse gets the ⋮ (Responsive overflow).",
            },
            {
              q: "Can the toolbar collapse automatically based on width?",
              a: "Yes, with the ToolbarOverflow primitive (see Responsive overflow). Pass your controls as items (action / toggle / separator descriptors); it measures each control's footprint once, then a ResizeObserver re-runs a greedy pack against the live width and folds whatever doesn't fit into a three-dots menu, rendering each control as both a bar button and a menu row. If you'd rather keep everything reachable without a menu, use <Toolbar scrollable> instead.",
            },
            {
              q: "Does the toolbar follow the page's comfortable/compact density?",
              a: "No, by design. Its size axis (sm / md / lg) is the toolbar's own density knob and does not read useDensity(), because a control bar that shrinks to form-compact becomes hard to hit. Set size explicitly. If you do want it to track the surrounding density, pass size from useDensity() yourself.",
            },
            {
              q: "Do the animations respect reduced motion?",
              a: "Yes. Under prefers-reduced-motion: reduce the controls keep every functional state (hover, pressed chip, open highlight) but drop the transition tween and the tactile press-scale, and a caret flips to its open state instantly instead of animating. Nothing moves or eases.",
            },
            {
              q: "When should I use pressed vs a ToolbarToggleGroup?",
              a: "Use the pressed prop on a standalone ToolbarButton when you're driving the active state yourself (e.g. reading it from an editor). Use ToolbarToggleGroup when the toolbar should own the selection: it gives you controlled value/onValueChange and single or multiple semantics with correct ARIA.",
            },
            {
              q: "Does it work vertically and in RTL?",
              a: "Yes. Set orientation=\"vertical\" for a tool rail; arrow-key navigation follows the axis and separators turn horizontal. Direction (LTR/RTL) comes from Radix Toolbar via the dir prop or the nearest DirectionProvider.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
