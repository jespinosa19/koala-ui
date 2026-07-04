"use client"

import * as React from "react"
import {
  TextT,
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  LinkSimple,
  LinkBreak,
  Copy,
  Quotes,
  Code,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  ListBullets,
  ListNumbers,
  ListChecks,
  ListDashes,
  Plus,
  Image as ImageIcon,
  ChatCircle,
  Table,
  Paragraph,
  ArrowUUpLeft,
  ArrowUUpRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  SpeakerHigh,
  Cursor,
  FrameCorners,
  Square,
  Circle,
  LineSegment,
  ArrowUpRight,
  Polygon,
  Star,
  PenNib,
  Pencil,
  Hand,
  MagicWand,
  Cube,
  PuzzlePiece,
  Sticker,
  type Icon,
} from "@phosphor-icons/react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarGroup,
  ToolbarSpacer,
  ToolbarTitle,
  ToolbarOverflow,
  type ToolbarOverflowItem,
} from "@/components/ui/toolbar"
import { Tooltip } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  ColorPicker,
  ColorPickerPopover,
  ColorPickerTrigger,
  ColorPickerContent,
} from "@/components/ui/color-picker"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

const BLOCKS = [
  { value: "paragraph", label: "Paragraph", icon: Paragraph, shortcut: "⌘⌥0" },
  { value: "h1", label: "Heading 1", icon: TextT, shortcut: "⌘⌥1" },
  { value: "h2", label: "Heading 2", icon: TextT, shortcut: "⌘⌥2" },
  { value: "h3", label: "Heading 3", icon: TextT, shortcut: "⌘⌥3" },
] as const

// Shared option data so the compact groups and the overflow menu stay in lockstep:
// the same marks/alignment/list rows render wherever they surface, driven by one state.
const MARKS = [
  { value: "bold", label: "Bold", icon: TextB, shortcut: "⌘B" },
  { value: "italic", label: "Italic", icon: TextItalic, shortcut: "⌘I" },
  { value: "underline", label: "Underline", icon: TextUnderline, shortcut: "⌘U" },
] as const

const ALIGNMENTS = [
  { value: "left", label: "Left", icon: TextAlignLeft },
  { value: "center", label: "Center", icon: TextAlignCenter },
  { value: "right", label: "Right", icon: TextAlignRight },
] as const

const LISTS = [
  { value: "bullet", label: "Bulleted", icon: ListBullets },
  { value: "numbered", label: "Numbered", icon: ListNumbers },
  { value: "checklist", label: "Checklist", icon: ListChecks },
] as const

// The design-canvas toolbar's two multi-tool clusters. Each is a caret dropdown whose trigger
// wears the active member's glyph (the shape/pen currently in hand), the same "trigger mirrors
// the selection" pattern the Collapsed bar uses for lists and alignment. Typed (not `as const`)
// so `shortcut` stays uniformly optional across members that don't carry one.
type CanvasTool = { value: string; label: string; icon: Icon; shortcut?: string }

const SHAPE_TOOLS: CanvasTool[] = [
  { value: "rectangle", label: "Rectangle", icon: Square, shortcut: "R" },
  { value: "line", label: "Line", icon: LineSegment, shortcut: "L" },
  { value: "arrow", label: "Arrow", icon: ArrowUpRight, shortcut: "⇧L" },
  { value: "ellipse", label: "Ellipse", icon: Circle, shortcut: "O" },
  { value: "polygon", label: "Polygon", icon: Polygon },
  { value: "star", label: "Star", icon: Star },
]

const PEN_TOOLS: CanvasTool[] = [
  { value: "pen", label: "Pen", icon: PenNib, shortcut: "P" },
  { value: "pencil", label: "Pencil", icon: Pencil, shortcut: "⇧P" },
]

// A collapsed-toolbar dropdown trigger lights its chip and flips its caret while its menu is
// open. That interaction now lives in ToolbarButton itself (any `data-state=open` trigger), so
// the demos below just compose <ToolbarButton caret> with no per-trigger className.

/**
 * The bold/italic/underline rows, shared verbatim by the compact "B" group and the overflow
 * "More" menu. Both read and write one `marks` state, so a toggle made in one surface is
 * already lit in the other. Selecting a row keeps the menu open so several marks can be flipped
 * in one visit (a multi-toggle menu, not a fire-and-close command). The bar's tooltip already
 * carries each shortcut, so the rows stay uncluttered: icon, label, and the state check.
 */
function MarkCheckboxItems({
  marks,
  onToggle,
}: {
  marks: string[]
  onToggle: (value: string) => void
}) {
  return (
    <>
      {MARKS.map(({ value, label, icon: Icon }) => (
        <DropdownMenuCheckboxItem
          key={value}
          checked={marks.includes(value)}
          onCheckedChange={() => onToggle(value)}
          onSelect={(event) => event.preventDefault()}
        >
          <Icon weight="bold" />
          {label}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  )
}

// A flat control set for the responsive toolbar. `toggle` rows carry pressed state (the marks);
// `action` rows are one-shot commands; separators divide groups. The ToolbarOverflow primitive
// turns this into a self-collapsing bar, so the demo just declares the controls and their state.
type ToolMeta =
  | { kind: "separator"; id: string }
  | { kind: "action" | "toggle"; id: string; icon: Icon; label: string; shortcut?: string }

const TOOLS: ToolMeta[] = [
  { kind: "action", id: "undo", icon: ArrowUUpLeft, label: "Undo", shortcut: "⌘Z" },
  { kind: "action", id: "redo", icon: ArrowUUpRight, label: "Redo", shortcut: "⌘⇧Z" },
  { kind: "separator", id: "sep-history" },
  { kind: "toggle", id: "bold", icon: TextB, label: "Bold", shortcut: "⌘B" },
  { kind: "toggle", id: "italic", icon: TextItalic, label: "Italic", shortcut: "⌘I" },
  { kind: "toggle", id: "underline", icon: TextUnderline, label: "Underline", shortcut: "⌘U" },
  { kind: "toggle", id: "strike", icon: TextStrikethrough, label: "Strikethrough" },
  { kind: "separator", id: "sep-marks" },
  { kind: "action", id: "link", icon: LinkSimple, label: "Link", shortcut: "⌘K" },
  { kind: "action", id: "quote", icon: Quotes, label: "Quote" },
  { kind: "action", id: "code", icon: Code, label: "Code block" },
  { kind: "separator", id: "sep-inserts" },
  { kind: "action", id: "bulleted", icon: ListBullets, label: "Bulleted list" },
  { kind: "action", id: "numbered", icon: ListNumbers, label: "Numbered list" },
  { kind: "action", id: "checklist", icon: ListChecks, label: "Checklist" },
  { kind: "separator", id: "sep-media" },
  { kind: "action", id: "image", icon: ImageIcon, label: "Insert image" },
  { kind: "action", id: "table", icon: Table, label: "Insert table" },
  { kind: "action", id: "comment", icon: ChatCircle, label: "Comment" },
]

// A stubby, grabbable resize grip (shorter + wider than the default), matching the doc previews'
// responsive drag handle. Passed to ResizableHandle as children so all its drag/keyboard/ARIA
// behavior is kept; this only swaps the visual.
function StubbyGrip() {
  return (
    <div className="h-10 w-1.5 shrink-0 rounded-full bg-border transition-colors duration-fast ease-out group-hover/handle:bg-brand group-data-[dragging=true]/handle:bg-brand" />
  )
}

/**
 * The hero: the full rich-text formatting bar from the reference. Two dropdown triggers
 * (text style, color) lead into grouped marks, inserts, alignment, lists, and media, all
 * sharing one gliding tooltip. Marks and alignment hold their pressed state.
 */
export function ToolbarFormattingDemo() {
  const [block, setBlock] = React.useState("paragraph")
  const [color, setColor] = React.useState("#7ba161")
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState("left")

  return (
    <Toolbar aria-label="Text formatting" className="flex-wrap">
      {/* Text style */}
      <DropdownMenu>
        <Tooltip content="Text style">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Text style">
              <TextT weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Turn into</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={block} onValueChange={setBlock}>
            {BLOCKS.map(({ value, label, icon: Icon, shortcut }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
                <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color: the caret trigger opens the canonical ColorPicker (compact: no hex row / presets). */}
      <ColorPickerPopover>
        <Tooltip content="Text color">
          <ColorPickerTrigger asChild>
            <ToolbarButton caret aria-label="Text color">
              <span
                className="size-5 rounded-sm ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: color }}
              />
            </ToolbarButton>
          </ColorPickerTrigger>
        </Tooltip>
        <ColorPickerContent>
          <ColorPicker
            value={color}
            onValueChange={setColor}
            showAlpha
            showInput={false}
            showPresets={false}
          />
        </ColorPickerContent>
      </ColorPickerPopover>

      <ToolbarSeparator />

      {/* Inline marks */}
      <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
        <ToolbarToggleItem value="bold" tooltip="Bold" shortcut="⌘B">
          <TextB weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" tooltip="Italic" shortcut="⌘I">
          <TextItalic weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" tooltip="Underline" shortcut="⌘U">
          <TextUnderline weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="strike" tooltip="Strikethrough" shortcut="⌘⇧S">
          <TextStrikethrough weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      {/* Inserts */}
      <ToolbarButton tooltip="Link" shortcut="⌘K">
        <LinkSimple weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Quote">
        <Quotes weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Code block">
        <Code weight="bold" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Alignment */}
      <ToolbarToggleGroup
        type="single"
        value={align}
        onValueChange={(next) => next && setAlign(next)}
      >
        <ToolbarToggleItem value="left" tooltip="Align left">
          <TextAlignLeft weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" tooltip="Align center">
          <TextAlignCenter weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="right" tooltip="Align right">
          <TextAlignRight weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton tooltip="Bullet list">
        <ListBullets weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Numbered list">
        <ListNumbers weight="bold" />
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Media */}
      <ToolbarButton tooltip="Insert image">
        <ImageIcon weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Comment">
        <ChatCircle weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/**
 * The collapsed bar: the same formatting power as the hero, folded into a fraction of the
 * width. Every group is a caret dropdown that unlocks only its own options, and a trailing
 * three-dots overflow holds everything that would otherwise widen the bar (alignment + inserts).
 * The "B" group and the overflow both drive one `marks` state, so a Bold toggle stays in sync
 * wherever you open it.
 */
export function ToolbarCollapsedDemo() {
  const [block, setBlock] = React.useState("paragraph")
  const [color, setColor] = React.useState("#7ba161")
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState("left")
  const [list, setList] = React.useState("")

  const toggleMark = (value: string) =>
    setMarks((prev) =>
      prev.includes(value) ? prev.filter((mark) => mark !== value) : [...prev, value],
    )

  // The list button wears the active list type's glyph, or a neutral list mark when none is set
  // (never a specific style like bullets, which would imply a selection that isn't there).
  const ListIcon = LISTS.find((item) => item.value === list)?.icon ?? ListDashes
  // The alignment trigger likewise mirrors the active alignment.
  const AlignIcon = ALIGNMENTS.find((item) => item.value === align)?.icon ?? TextAlignLeft

  return (
    <Toolbar aria-label="Compact formatting">
      {/* Text style — a radio group of block types */}
      <DropdownMenu>
        <Tooltip content="Text style">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Text style">
              <TextT weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Turn into</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={block} onValueChange={setBlock}>
            {BLOCKS.map(({ value, label, icon: Icon, shortcut }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
                <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color — the caret trigger opens the canonical ColorPicker */}
      <ColorPickerPopover>
        <Tooltip content="Text color">
          <ColorPickerTrigger asChild>
            <ToolbarButton caret aria-label="Text color">
              <span
                className="size-5 rounded-sm ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: color }}
              />
            </ToolbarButton>
          </ColorPickerTrigger>
        </Tooltip>
        <ColorPickerContent>
          <ColorPicker
            value={color}
            onValueChange={setColor}
            showAlpha
            showInput={false}
            showPresets={false}
          />
        </ColorPickerContent>
      </ColorPickerPopover>

      <ToolbarSeparator />

      {/* Text actions — bold/italic/underline, shared with the overflow menu */}
      <DropdownMenu>
        <Tooltip content="Text actions">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Text actions">
              <TextB weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Text actions</DropdownMenuLabel>
          <MarkCheckboxItems marks={marks} onToggle={toggleMark} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Link — a small command menu, one of those commands destructive */}
      <DropdownMenu>
        <Tooltip content="Link">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Link">
              <LinkSimple weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem>
            <LinkSimple weight="bold" />
            Add link
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy weight="bold" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LinkBreak weight="bold" />
            Remove link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lists — a radio group; the trigger mirrors the active style */}
      <DropdownMenu>
        <Tooltip content="List">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="List">
              <ListIcon weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>List style</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={list} onValueChange={setList}>
            {LISTS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarSeparator />

      {/* Alignment — a radio group; the trigger mirrors the active alignment (like the list one) */}
      <DropdownMenu>
        <Tooltip content="Alignment">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Alignment">
              <AlignIcon weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel>Alignment</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={align} onValueChange={(next) => next && setAlign(next)}>
            {ALIGNMENTS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert — a caret group of insert commands */}
      <DropdownMenu>
        <Tooltip content="Insert">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Insert">
              <Plus weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem>
            <ImageIcon weight="bold" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Table weight="bold" />
            Table
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Code weight="bold" />
            Code block
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ChatCircle weight="bold" />
            Comment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Toolbar>
  )
}

/**
 * Automatic overflow via the shippable {@link ToolbarOverflow} primitive: the bar measures its own
 * width and folds whatever doesn't fit into the three-dots menu, live. The demo just declares the
 * controls as data + the live pressed state; the primitive owns the measuring, packing, and the
 * mirrored bar/menu rendering. Drag the handle to shrink the track and watch it collapse.
 */
export function ToolbarResponsiveDemo() {
  const [marks, setMarks] = React.useState<string[]>(["bold"])

  const toggleMark = (id: string) =>
    setMarks((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))

  // Static metadata → overflow items, injecting the live pressed state for the toggle controls.
  const items: ToolbarOverflowItem[] = TOOLS.map((tool) => {
    if (tool.kind === "separator") return { type: "separator", id: tool.id }
    if (tool.kind === "toggle")
      return {
        type: "toggle",
        id: tool.id,
        icon: tool.icon,
        label: tool.label,
        shortcut: tool.shortcut,
        pressed: marks.includes(tool.id),
        onPressedChange: () => toggleMark(tool.id),
      }
    return {
      type: "action",
      id: tool.id,
      icon: tool.icon,
      label: tool.label,
      shortcut: tool.shortcut,
    }
  })

  return (
    <ResizablePanelGroup direction="horizontal" className="h-28 w-full">
      <ResizablePanel defaultSize={72} minSize="248px">
        <div className="flex h-full items-center p-4">
          <ToolbarOverflow items={items} aria-label="Responsive formatting" />
        </div>
      </ResizablePanel>
      <ResizableHandle className="bg-transparent hover:bg-transparent data-[dragging=true]:bg-transparent">
        <StubbyGrip />
      </ResizableHandle>
      <ResizablePanel defaultSize={28} minSize="80px">
        <div className="flex h-full select-none items-center justify-center px-3 text-center text-xs text-muted-foreground">
          Drag to resize
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

/**
 * An application bar: a document title on the left, actions pinned right by a ToolbarSpacer, and
 * two semantic ToolbarGroups (each an aria-labelled region) split by a separator.
 */
export function ToolbarAppBarDemo() {
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  return (
    <Toolbar aria-label="Document" variant="outline" className="w-full max-w-xl">
      <ToolbarTitle>Proposal.md</ToolbarTitle>
      <ToolbarSpacer />
      <ToolbarGroup aria-label="History">
        <ToolbarButton tooltip="Undo" shortcut="⌘Z">
          <ArrowUUpLeft weight="bold" />
        </ToolbarButton>
        <ToolbarButton tooltip="Redo" shortcut="⌘⇧Z">
          <ArrowUUpRight weight="bold" />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Text format">
        <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
          <ToolbarToggleItem value="bold" tooltip="Bold">
            <TextB weight="bold" />
          </ToolbarToggleItem>
          <ToolbarToggleItem value="italic" tooltip="Italic">
            <TextItalic weight="bold" />
          </ToolbarToggleItem>
          <ToolbarToggleItem value="underline" tooltip="Underline">
            <TextUnderline weight="bold" />
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      </ToolbarGroup>
    </Toolbar>
  )
}

/** The solid variant: an inverted, high-contrast strip for a contextual bar over media. */
export function ToolbarSolidDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [modes, setModes] = React.useState<string[]>(["shuffle"])
  return (
    <Toolbar variant="solid" aria-label="Overlay controls">
      <ToolbarButton tooltip="Previous">
        <SkipBack weight="fill" />
      </ToolbarButton>
      <ToolbarButton tooltip={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
        {playing ? <Pause weight="fill" /> : <Play weight="fill" className="translate-x-px" />}
      </ToolbarButton>
      <ToolbarButton tooltip="Next">
        <SkipForward weight="fill" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="multiple" value={modes} onValueChange={setModes}>
        <ToolbarToggleItem value="shuffle" tooltip="Shuffle">
          <Shuffle weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="repeat" tooltip="Repeat">
          <Repeat weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Volume">
        <SpeakerHigh weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/**
 * The design-canvas bar (Figma-style): the `solid` variant reads as a black HUD floating over the
 * artboard, holding a full set of canvas tools. Each is a single-select tool; the one in hand
 * flips to a brand-blue chip (the DS's brand-for-primary, and Figma's selected-tool blue) instead
 * of the solid bar's default translucent wash. Shapes and the pen are caret dropdowns whose trigger
 * mirrors the active member, and a trailing group carries the AI + Dev Mode actions.
 */
export function ToolbarDesignDemo() {
  const [tool, setTool] = React.useState("move")
  const [shape, setShape] = React.useState<string>("rectangle")
  const [pen, setPen] = React.useState<string>("pen")
  const [devMode, setDevMode] = React.useState(false)

  const ShapeIcon = SHAPE_TOOLS.find((item) => item.value === shape)!.icon
  const PenIcon = PEN_TOOLS.find((item) => item.value === pen)!.icon

  // The active tool is a first-class selection, so it flips the pressed chip from the solid bar's
  // translucent wash to bg-brand. Appended last, so tailwind-merge lets it win over the variant's
  // own data-[pressed] rules (incl. the hover case).
  const activeTool =
    "data-[pressed]:bg-brand data-[pressed]:text-white data-[pressed]:hover:bg-brand"

  return (
    <Toolbar variant="solid" aria-label="Design tools">
      <ToolbarButton
        tooltip="Move"
        shortcut="V"
        pressed={tool === "move"}
        onClick={() => setTool("move")}
        className={activeTool}
      >
        <Cursor weight="bold" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Frame"
        shortcut="F"
        pressed={tool === "frame"}
        onClick={() => setTool("frame")}
        className={activeTool}
      >
        <FrameCorners weight="bold" />
      </ToolbarButton>

      {/* Shapes — a caret dropdown; the trigger wears the active shape and is itself the tool */}
      <DropdownMenu>
        <Tooltip content="Shapes">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Shapes" pressed={tool === "shape"} className={activeTool}>
              <ShapeIcon weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup
            value={shape}
            onValueChange={(next) => {
              setShape(next)
              setTool("shape")
            }}
          >
            {SHAPE_TOOLS.map(({ value, label, icon: Icon, shortcut }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
                {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pen / pencil — the second caret dropdown */}
      <DropdownMenu>
        <Tooltip content="Pen">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Pen" pressed={tool === "pen"} className={activeTool}>
              <PenIcon weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuRadioGroup
            value={pen}
            onValueChange={(next) => {
              setPen(next)
              setTool("pen")
            }}
          >
            {PEN_TOOLS.map(({ value, label, icon: Icon, shortcut }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
                <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarButton
        tooltip="Text"
        shortcut="T"
        pressed={tool === "text"}
        onClick={() => setTool("text")}
        className={activeTool}
      >
        <TextT weight="bold" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Hand tool"
        shortcut="H"
        pressed={tool === "hand"}
        onClick={() => setTool("hand")}
        className={activeTool}
      >
        <Hand weight="bold" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Comment"
        shortcut="C"
        pressed={tool === "comment"}
        onClick={() => setTool("comment")}
        className={activeTool}
      >
        <ChatCircle weight="bold" />
      </ToolbarButton>

      {/* Insert — a caret dropdown of things to drop onto the canvas */}
      <DropdownMenu>
        <Tooltip content="Insert">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Insert">
              <Plus weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem>
            <ImageIcon weight="bold" />
            Image
            <DropdownMenuShortcut>⇧⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Cube weight="bold" />
            Component
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sticker weight="bold" />
            Widget
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <PuzzlePiece weight="bold" />
            Plugins
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarSeparator />

      {/* Trailing group — the AI + Dev Mode cluster */}
      <ToolbarButton tooltip="AI actions">
        <MagicWand weight="bold" />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Dev Mode"
        shortcut="⇧D"
        pressed={devMode}
        onClick={() => setDevMode((on) => !on)}
      >
        <Code weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/**
 * Scrollable: the low-chrome alternative to an overflow menu. In a tight container the bar scrolls
 * on the x-axis and fades the overflowing edge (the scroll-fade utility) instead of wrapping.
 */
export function ToolbarScrollableDemo() {
  return (
    <Toolbar scrollable aria-label="Scrollable formatting" className="w-full max-w-xs">
      <ToolbarButton tooltip="Undo">
        <ArrowUUpLeft weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Redo">
        <ArrowUUpRight weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Bold">
        <TextB weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Italic">
        <TextItalic weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Underline">
        <TextUnderline weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Strikethrough">
        <TextStrikethrough weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Link">
        <LinkSimple weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Quote">
        <Quotes weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Code block">
        <Code weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Bulleted list">
        <ListBullets weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Numbered list">
        <ListNumbers weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Insert image">
        <ImageIcon weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Insert table">
        <Table weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/** The three chrome variants side by side. */
export function ToolbarVariantsDemo() {
  const marks = (
    <>
      <ToolbarButton tooltip="Bold" pressed>
        <TextB weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Italic">
        <TextItalic weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Underline">
        <TextUnderline weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Link">
        <LinkSimple weight="bold" />
      </ToolbarButton>
    </>
  )
  return (
    <div className="flex flex-col items-center gap-6">
      <Toolbar aria-label="Floating variant">{marks}</Toolbar>
      <Toolbar aria-label="Outline variant" variant="outline">
        {marks}
      </Toolbar>
      <Toolbar aria-label="Plain variant" variant="plain">
        {marks}
      </Toolbar>
    </div>
  )
}

/** The two sizes. */
export function ToolbarSizesDemo() {
  const controls = (
    <>
      <ToolbarButton tooltip="Undo">
        <ArrowUUpLeft weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Redo">
        <ArrowUUpRight weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Bold" pressed>
        <TextB weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Italic">
        <TextItalic weight="bold" />
      </ToolbarButton>
    </>
  )
  return (
    <div className="flex flex-col items-center gap-6">
      <Toolbar aria-label="Small toolbar" size="sm">
        {controls}
      </Toolbar>
      <Toolbar aria-label="Medium toolbar" size="md">
        {controls}
      </Toolbar>
      <Toolbar aria-label="Large toolbar" size="lg">
        {controls}
      </Toolbar>
    </div>
  )
}

/** Toggle groups: single (alignment) and multiple (marks), holding their pressed state. */
export function ToolbarToggleDemo() {
  const [align, setAlign] = React.useState("center")
  const [marks, setMarks] = React.useState<string[]>(["bold", "underline"])
  return (
    <Toolbar aria-label="Toggle groups">
      <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
        <ToolbarToggleItem value="bold" tooltip="Bold">
          <TextB weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" tooltip="Italic">
          <TextItalic weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" tooltip="Underline">
          <TextUnderline weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup
        type="single"
        value={align}
        onValueChange={(next) => next && setAlign(next)}
      >
        <ToolbarToggleItem value="left" tooltip="Align left">
          <TextAlignLeft weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" tooltip="Align center">
          <TextAlignCenter weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="right" tooltip="Align right">
          <TextAlignRight weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  )
}

/** Dropdown triggers: a caret button opens a menu, composed with our DropdownMenu via asChild. */
export function ToolbarDropdownDemo() {
  const [block, setBlock] = React.useState("h1")
  return (
    <Toolbar aria-label="Block style">
      <DropdownMenu>
        <Tooltip content="Text style">
          <DropdownMenuTrigger asChild>
            <ToolbarButton caret aria-label="Text style">
              <TextT weight="bold" />
            </ToolbarButton>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Turn into</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={block} onValueChange={setBlock}>
            {BLOCKS.map(({ value, label, icon: Icon, shortcut }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon weight="bold" />
                {label}
                <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Bold" pressed>
        <TextB weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Italic">
        <TextItalic weight="bold" />
      </ToolbarButton>
      <ToolbarButton tooltip="Insert table">
        <Table weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/** A vertical tool rail: the same primitive, `orientation="vertical"`. */
export function ToolbarVerticalDemo() {
  const [tool, setTool] = React.useState("select")
  return (
    <Toolbar aria-label="Canvas tools" orientation="vertical">
      <ToolbarToggleGroup
        type="single"
        value={tool}
        onValueChange={(next) => next && setTool(next)}
        className="flex-col"
      >
        <ToolbarToggleItem value="select" tooltip="Select" tooltipPlacement="right">
          <TextAlignLeft weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="text" tooltip="Text" tooltipPlacement="right">
          <TextT weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="image" tooltip="Image" tooltipPlacement="right">
          <ImageIcon weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Comment" tooltipPlacement="right">
        <ChatCircle weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}

/** A different domain entirely: media transport controls, to show the shell is generic. */
export function ToolbarMediaDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [modes, setModes] = React.useState<string[]>(["shuffle"])
  return (
    <Toolbar aria-label="Playback controls">
      {/* Outline (bold) like the rest of the DS — fill is reserved for active/selected. */}
      <ToolbarButton tooltip="Previous">
        <SkipBack weight="bold" />
      </ToolbarButton>
      <ToolbarButton
        tooltip={playing ? "Pause" : "Play"}
        onClick={() => setPlaying((p) => !p)}
      >
        {/* A play triangle reads left-heavy when geometrically centered; nudge it 1px right. */}
        {playing ? <Pause weight="bold" /> : <Play weight="bold" className="translate-x-px" />}
      </ToolbarButton>
      <ToolbarButton tooltip="Next">
        <SkipForward weight="bold" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="multiple" value={modes} onValueChange={setModes}>
        <ToolbarToggleItem value="shuffle" tooltip="Shuffle">
          <Shuffle weight="bold" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="repeat" tooltip="Repeat">
          <Repeat weight="bold" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton tooltip="Volume">
        <SpeakerHigh weight="bold" />
      </ToolbarButton>
    </Toolbar>
  )
}
