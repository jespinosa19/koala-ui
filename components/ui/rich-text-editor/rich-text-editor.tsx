"use client"

import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import {
  TextB,
  TextItalic,
  TextUnderline,
  TextHOne,
  TextHTwo,
  TextHThree,
  TextHFour,
  ListBullets,
  ListNumbers,
  LinkSimple,
  LinkBreak,
  Check,
  X,
} from "@phosphor-icons/react"

import { tv, type VariantProps } from "@/lib/tv"
import { cn } from "@/lib/utils"
import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { Tooltip, TooltipGroup } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { InputRoot, InputField } from "@/components/ui/input"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { toolbarControlBase } from "@/components/ui/toolbar/control-base"

/**
 * RichTextEditor: a WYSIWYG editor over Tiptap (ProseMirror). Radix ships no rich-text
 * primitive, so (as with Tooltip wrapping Tippy.js) Koala wraps a headless behavior
 * engine (Tiptap/StarterKit handles selection, undo, paste, keyboard, schema) and owns
 * every pixel of UI as a `tv` recipe built from our tokens. See docs/ARCHITECTURE.md.
 *
 * Multi-part: the editor instance flows to every part through React Context (never
 * prop-drilled). Compose `<RichTextEditor><RichTextEditorToolbar /><RichTextEditorContent />`.
 * The toolbar renders the essential controls (headings, bold/italic/underline, link, lists)
 * by default, or any custom set of `RichTextEditorButton`s you pass as children. For fully
 * custom chrome, reach the live editor with the {@link useRichTextEditor} hook.
 */
// The editor's controls share ONE interaction base with the standalone Toolbar
// (components/ui/toolbar/control-base.ts) so the two never drift on color/hover/pressed/focus.
// The editor keeps its own 12px corners (rounded-md) and 16px glyph; the two button slots then
// differ only in their box dimensions.
const controlBase = [...toolbarControlBase, "rounded-md", "[&_svg]:size-4"]

export const richTextEditorVariants = tv({
  slots: {
    // The bordered surface. Mirrors Input's focus treatment (brand border + soft ring) so
    // the editor reads as one field, and clips the rounded corners over toolbar + content.
    root: [
      "flex flex-col overflow-hidden rounded-xl border border-input bg-background text-foreground",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "focus-within:border-brand focus-within:brand-ring",
    ],
    // A wrapping toolbar that scrolls into a second row on narrow widths rather than clipping.
    toolbar: "flex flex-wrap items-center gap-0.5 border-b border-border bg-background",
    // Main toolbar control: a 32px square (the 40px hit extender lives in controlBase).
    button: [...controlBase, "size-8"],
    // Bubble control: minimal and deliberately wider than tall (36×28), so the floating bar
    // reads as a compact strip rather than a row of squares.
    bubbleButton: [...controlBase, "h-7 w-9"],
    separator: "mx-1 h-5 w-px shrink-0 bg-border",
    // The floating selection toolbar (bubble menu), deliberately minimal: a tight, low-chrome
    // bar of 28px controls. Concentric: rounded-lg outer vs the rounded-md buttons inside its
    // p-0.5 padding. Enters with a fade+zoom from its lower edge (it sits above the selection);
    // exit is handled by the engine hiding it (subtly, #6).
    bubble: [
      "flex items-center gap-0.5 rounded-lg border border-border-soft bg-popover p-0.5",
      "text-popover-foreground shadow-md outline-none",
      // Nested controls (the inline link input) read this so they paint the panel surface.
      "[--surface:var(--popover)]",
      "origin-bottom animate-in fade-in-0 zoom-in-95 duration-fast ease-out",
    ],
    // The EditorContent wrapper. It hosts the ProseMirror prose styling via descendant
    // selectors so every block/mark reads from our tokens (no @tailwindcss/typography dep).
    content: [
      // Body copy is the SECONDARY color, not full foreground, so a document reads as calm
      // muted text with only its headings (and emphasis) in the strong foreground. Keeps the
      // surface from being a wall of bright white.
      "text-sm text-muted-foreground",
      "[&_.tiptap]:outline-none",
      // Block rhythm: space only *between* top-level blocks, so no leading/trailing gap.
      "[&_.tiptap>*+*]:mt-3",
      // Headings follow @tailwindcss/typography's `prose-sm` scale (matched to our 14px body):
      // 30 / 20 / 18px, all lifted to the strong foreground so they stand out against the muted
      // copy. We map onto Tailwind's own type-scale tokens, whose paired line-heights already
      // resolve to prose-sm's heading leading (1.2 / 1.4 / 1.556) - so leading needs no override.
      "[&_.tiptap_h1]:text-3xl [&_.tiptap_h1]:font-semibold [&_.tiptap_h1]:tracking-tight [&_.tiptap_h1]:text-foreground",
      "[&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:tracking-tight [&_.tiptap_h2]:text-foreground",
      "[&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:text-foreground",
      // H4 shares the body size but is set apart by weight + the foreground color.
      "[&_.tiptap_h4]:text-sm [&_.tiptap_h4]:font-semibold [&_.tiptap_h4]:text-foreground",
      "[&_.tiptap_p]:leading-relaxed",
      // Lists: disc/decimal with a comfortable indent; tighten nested lists and list paragraphs.
      "[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5",
      "[&_.tiptap_li]:my-0.5 [&_.tiptap_li_p]:my-0",
      "[&_.tiptap_li_ul]:mt-1 [&_.tiptap_li_ol]:mt-1",
      // Bold lifts out of the muted body to the foreground, so emphasis actually reads.
      "[&_.tiptap_strong]:font-semibold [&_.tiptap_strong]:text-foreground",
      // Links carry the accent, underlined: same treatment as inline doc links.
      "[&_.tiptap_a]:cursor-pointer [&_.tiptap_a]:text-brand [&_.tiptap_a]:underline [&_.tiptap_a]:underline-offset-2",
      // Placeholder: Tiptap's Placeholder extension stamps data-placeholder on the empty
      // first node; render it as muted ghost text that never blocks the caret.
      "[&_.tiptap_p.is-editor-empty:first-child]:before:pointer-events-none",
      "[&_.tiptap_p.is-editor-empty:first-child]:before:float-left",
      "[&_.tiptap_p.is-editor-empty:first-child]:before:h-0",
      "[&_.tiptap_p.is-editor-empty:first-child]:before:text-muted-foreground",
      "[&_.tiptap_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
    ],
    // Applied directly to the contenteditable (.tiptap) via editorProps, so the whole padded
    // area (not just the text) focuses the caret on click.
    editable: "min-h-32 outline-none",
  },
  variants: {
    // Density tunes the toolbar and writing-area padding (and nothing else, never radius
    // or color). `comfortable` is the spacious marketing default; `compact` tightens for
    // dense app surfaces (see lib/density.tsx).
    density: {
      comfortable: { toolbar: "p-1.5", editable: "px-4 py-3" },
      compact: { toolbar: "p-1", editable: "px-3 py-2.5" },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

type RichTextEditorSlots = ReturnType<typeof richTextEditorVariants>
const [RichTextEditorProvider, useRichTextEditorContext] = createContext<{
  editor: Editor | null
  slots: RichTextEditorSlots
}>("RichTextEditor")

/**
 * Read the live Tiptap editor from the nearest `RichTextEditor`. Use it to build fully
 * custom toolbars/menus, or to read/write content imperatively. Returns `null` on the
 * first client render (the editor mounts after, to avoid SSR hydration mismatch).
 */
export function useRichTextEditor(): Editor | null {
  return useRichTextEditorContext("useRichTextEditor").editor
}

export interface RichTextEditorProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue">,
    VariantProps<typeof richTextEditorVariants> {
  /** Initial HTML content (uncontrolled). The editor owns its state from here on. */
  defaultValue?: string
  /** Ghost text shown while the document is empty. @default "Write something…" */
  placeholder?: string
  /** Toggle editing without unmounting: set `false` for a read-only render. @default true */
  editable?: boolean
  /** Called with the serialized HTML on every edit. */
  onChange?: (html: string) => void
}

export function RichTextEditor({
  className,
  density,
  defaultValue = "",
  placeholder = "Write something…",
  editable = true,
  onChange,
  children,
  ...props
}: RichTextEditorProps) {
  // Density resolves prop > provider > "comfortable"; compute slots once, share via context.
  const slots = richTextEditorVariants({ density: useDensity(density) })
  const editableClass = slots.editable()

  const editor = useEditor({
    // Tiptap must not render on the server, or the markup mismatches on hydration (Next.js).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // We drive links through the toolbar's popover; don't navigate on click inside the editor.
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editable,
    editorProps: { attributes: { class: editableClass } },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  })

  // Keep editable + the editable element's classes (density) in sync without recreating the
  // editor (recreating would drop the document and selection).
  React.useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])
  React.useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { class: editableClass } } })
  }, [editor, editableClass])

  return (
    <RichTextEditorProvider editor={editor} slots={slots}>
      <div data-slot="rich-text-editor" className={slots.root({ className })} {...props}>
        {children}
      </div>
    </RichTextEditorProvider>
  )
}

// ─── Toolbar ────────────────────────────────────────────────────────────────────

export type RichTextEditorToolbarProps = React.ComponentProps<typeof ToolbarPrimitive.Root>

/**
 * The formatting toolbar (Radix Toolbar: roving focus, arrow-key navigation, ARIA).
 * With no children it renders the essential controls; pass `RichTextEditorButton`s and
 * `RichTextEditorSeparator`s for a custom set. Triggers share one gliding tooltip.
 */
export function RichTextEditorToolbar({
  className,
  children,
  ...props
}: RichTextEditorToolbarProps) {
  const { slots } = useRichTextEditorContext("RichTextEditorToolbar")
  return (
    <ToolbarPrimitive.Root
      data-slot="rich-text-editor-toolbar"
      aria-label="Formatting"
      className={slots.toolbar({ className })}
      {...props}
    >
      <TooltipGroup>{children ?? <DefaultToolbar />}</TooltipGroup>
    </ToolbarPrimitive.Root>
  )
}

export interface RichTextEditorButtonProps
  extends Omit<React.ComponentProps<typeof ToolbarPrimitive.Button>, "aria-pressed" | "size"> {
  /** Visually mark the control active (e.g. the cursor is inside bold text). */
  pressed?: boolean
  /** Accessible label + hover tooltip, required since the button is icon-only. */
  tooltip: string
  /**
   * Keyboard shortcut shown as a `Kbd` chip in the tooltip (e.g. `"⌘B"`). Display only: it
   * doesn't bind the key (Tiptap's StarterKit already owns the mark shortcuts).
   */
  shortcut?: string
  /** `md` (32px square) for the main toolbar; `sm` (36×28, wider-than-tall) for the bubble. @default "md" */
  size?: "sm" | "md"
  /** Disable the tactile scale-on-press. */
  static?: boolean
}

/**
 * A single icon-only toolbar control. Wire it to the editor with `pressed`/`onClick` (read
 * state via {@link useRichTextEditor}). Renders a Radix Toolbar item with a tooltip label;
 * pass `shortcut` to append a keycap to the tooltip.
 */
export function RichTextEditorButton({
  className,
  pressed,
  tooltip,
  shortcut,
  size = "md",
  static: isStatic = false,
  children,
  ...props
}: RichTextEditorButtonProps) {
  const { slots } = useRichTextEditorContext("RichTextEditorButton")
  const slot = size === "sm" ? slots.bubbleButton : slots.button
  // Tooltip shows the label plus an optional keycap; aria-label stays a plain string.
  const content = shortcut ? (
    <span className="flex items-center gap-1.5">
      {tooltip}
      <Kbd size="sm" variant="outline">
        {shortcut}
      </Kbd>
    </span>
  ) : (
    tooltip
  )
  return (
    <Tooltip content={content}>
      <ToolbarPrimitive.Button
        type="button"
        data-slot="rich-text-editor-button"
        data-pressed={pressed || undefined}
        aria-pressed={pressed}
        aria-label={shortcut ? `${tooltip} (${shortcut})` : tooltip}
        className={slot({ className: cn(isStatic && "active:scale-100", className) })}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Button>
    </Tooltip>
  )
}

/** A vertical hairline that groups related toolbar controls (Radix Toolbar separator). */
export function RichTextEditorSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { slots } = useRichTextEditorContext("RichTextEditorSeparator")
  return (
    <ToolbarPrimitive.Separator
      data-slot="rich-text-editor-separator"
      className={slots.separator({ className })}
      {...props}
    />
  )
}

// ─── Content ────────────────────────────────────────────────────────────────────

/** The editable writing area. Renders Tiptap's EditorContent with our prose styling. */
export function RichTextEditorContent({
  className,
  ...props
}: Omit<React.ComponentProps<typeof EditorContent>, "editor">) {
  const { editor, slots } = useRichTextEditorContext("RichTextEditorContent")
  return (
    <EditorContent
      editor={editor}
      data-slot="rich-text-editor-content"
      className={slots.content({ className })}
      {...props}
    />
  )
}

// ─── Bubble menu (the on-selection floating toolbar) ──────────────────────────────

/**
 * The platform modifier glyph for shortcut hints: `⌘` on Apple, `Ctrl` elsewhere. Resolved
 * once via a lazy `useState` initializer (not an effect): it's only read inside tooltip
 * content, which Tippy renders lazily on hover, so there's no hydration concern.
 */
function useModKey(): string {
  const [mod] = React.useState(() =>
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
      ? "⌘"
      : "Ctrl",
  )
  return mod
}

export type RichTextEditorBubbleMenuProps = Omit<
  React.ComponentProps<typeof BubbleMenu>,
  "editor"
>

/**
 * A floating toolbar that surfaces over the current text selection: select a word
 * (double-click) or drag across text and it appears. Built on Tiptap's BubbleMenu
 * (Floating UI positioning). With no children it renders the inline marks + link; pass
 * your own `RichTextEditorButton`s for a custom set.
 *
 * The bubble owns its own `Toolbar.Root` so the buttons keep roving focus, and its link
 * editor expands *inline* (never a portaled popover): the engine keeps the bubble open
 * only while focus stays inside its element, so the URL input has to live within it.
 */
export function RichTextEditorBubbleMenu({
  className,
  children,
  options,
  ...props
}: RichTextEditorBubbleMenuProps) {
  const { editor, slots } = useRichTextEditorContext("RichTextEditorBubbleMenu")
  if (!editor) return null
  return (
    <BubbleMenu
      editor={editor}
      // z-index on the floating wrapper; the styled surface is the inner Toolbar.Root.
      className="z-50"
      options={{ placement: "top", offset: 8, ...options }}
      {...props}
    >
      <ToolbarPrimitive.Root
        data-slot="rich-text-editor-bubble"
        aria-label="Selection formatting"
        className={slots.bubble({ className })}
      >
        <TooltipGroup>{children ?? <DefaultBubble />}</TooltipGroup>
      </ToolbarPrimitive.Root>
    </BubbleMenu>
  )
}

/**
 * The default bubble controls: bold/italic/underline + an inline link editor. Clicking the
 * link control swaps the bubble into a compact URL field (kept inside the bubble element so
 * the selection-driven bubble doesn't dismiss when the input takes focus).
 */
function DefaultBubble() {
  const { editor } = useRichTextEditorContext("RichTextEditorBubbleMenu")
  const mod = useModKey()
  const [editingLink, setEditingLink] = React.useState(false)
  const [url, setUrl] = React.useState("")

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: !!editor?.isActive("bold"),
      italic: !!editor?.isActive("italic"),
      underline: !!editor?.isActive("underline"),
      link: !!editor?.isActive("link"),
    }),
  })
  const s = state ?? { bold: false, italic: false, underline: false, link: false }

  const openLinkEditor = () => {
    setUrl((editor?.getAttributes("link").href as string) ?? "")
    setEditingLink(true)
  }

  const applyLink = () => {
    if (!editor) return
    const href = url.trim()
    const chain = editor.chain().focus().extendMarkRange("link")
    if (href === "") chain.unsetLink().run()
    else chain.setLink({ href }).run()
    setEditingLink(false)
  }

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setEditingLink(false)
  }

  if (editingLink) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          applyLink()
        }}
        onKeyDown={(event) => {
          // Escape backs out without applying; refocus the editor so the bubble re-evaluates.
          if (event.key === "Escape") {
            event.preventDefault()
            setEditingLink(false)
            editor?.commands.focus()
          }
        }}
        className="flex items-center gap-1"
      >
        <InputRoot className="h-8 w-56">
          <InputField
            type="url"
            inputMode="url"
            placeholder="https://example.com"
            value={url}
            autoFocus
            onChange={(event) => setUrl(event.target.value)}
          />
        </InputRoot>
        {s.link && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Remove link"
            onClick={removeLink}
          >
            <LinkBreak weight="bold" />
          </Button>
        )}
        <Button type="submit" size="sm" iconOnly aria-label="Apply link">
          <Check weight="bold" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Cancel"
          onClick={() => {
            setEditingLink(false)
            editor?.commands.focus()
          }}
        >
          <X weight="bold" />
        </Button>
      </form>
    )
  }

  return (
    <>
      <RichTextEditorButton
        size="sm"
        tooltip="Bold"
        shortcut={`${mod}B`}
        pressed={s.bold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <TextB weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        size="sm"
        tooltip="Italic"
        shortcut={`${mod}I`}
        pressed={s.italic}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <TextItalic weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        size="sm"
        tooltip="Underline"
        shortcut={`${mod}U`}
        pressed={s.underline}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <TextUnderline weight="bold" />
      </RichTextEditorButton>

      <RichTextEditorSeparator className="mx-0.5 h-4" />

      <RichTextEditorButton size="sm" tooltip="Link" pressed={s.link} onClick={openLinkEditor}>
        <LinkSimple weight="bold" />
      </RichTextEditorButton>
    </>
  )
}

// ─── Default toolbar set (the essential controls) ────────────────────────────────

/**
 * The default essential controls: headings, bold/italic/underline, link, and lists.
 * One `useEditorState` selector subscribes to just the active flags it needs, so the
 * toolbar re-renders on selection/format change without re-rendering the whole editor.
 */
function DefaultToolbar() {
  const { editor } = useRichTextEditorContext("RichTextEditorToolbar")
  const mod = useModKey()
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h1: !!editor?.isActive("heading", { level: 1 }),
      h2: !!editor?.isActive("heading", { level: 2 }),
      h3: !!editor?.isActive("heading", { level: 3 }),
      h4: !!editor?.isActive("heading", { level: 4 }),
      bold: !!editor?.isActive("bold"),
      italic: !!editor?.isActive("italic"),
      underline: !!editor?.isActive("underline"),
      bulletList: !!editor?.isActive("bulletList"),
      orderedList: !!editor?.isActive("orderedList"),
      link: !!editor?.isActive("link"),
    }),
  })
  const s = state ?? {
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    orderedList: false,
    link: false,
  }

  return (
    <>
      <RichTextEditorButton
        tooltip="Heading 1"
        pressed={s.h1}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <TextHOne weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Heading 2"
        pressed={s.h2}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <TextHTwo weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Heading 3"
        pressed={s.h3}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <TextHThree weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Heading 4"
        pressed={s.h4}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <TextHFour weight="bold" />
      </RichTextEditorButton>

      <RichTextEditorSeparator />

      <RichTextEditorButton
        tooltip="Bold"
        shortcut={`${mod}B`}
        pressed={s.bold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <TextB weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Italic"
        shortcut={`${mod}I`}
        pressed={s.italic}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <TextItalic weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Underline"
        shortcut={`${mod}U`}
        pressed={s.underline}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <TextUnderline weight="bold" />
      </RichTextEditorButton>

      <RichTextEditorSeparator />

      <LinkButton active={s.link} />

      <RichTextEditorSeparator />

      <RichTextEditorButton
        tooltip="Bullet list"
        pressed={s.bulletList}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <ListBullets weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Numbered list"
        pressed={s.orderedList}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListNumbers weight="bold" />
      </RichTextEditorButton>
    </>
  )
}

/**
 * The link control: a popover with a URL field. Opening prefills the current link (if the
 * caret sits in one); submitting an empty field removes the link. Composes the DS Popover,
 * Input, and Button (never hand-rolled) so it re-themes and stays consistent.
 */
function LinkButton({ active }: { active: boolean }) {
  const { editor, slots } = useRichTextEditorContext("RichTextEditorLinkButton")
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")

  // Prefill from the link under the caret as the popover opens (not in an effect, this is
  // an event, so it avoids a cascading render).
  const handleOpenChange = (next: boolean) => {
    if (next && editor) setUrl((editor.getAttributes("link").href as string) ?? "")
    setOpen(next)
  }

  const apply = () => {
    if (!editor) return
    const href = url.trim()
    const chain = editor.chain().focus().extendMarkRange("link")
    if (href === "") chain.unsetLink().run()
    else chain.setLink({ href }).run()
    setOpen(false)
  }

  const remove = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip content="Link">
        <PopoverTrigger asChild>
          <ToolbarPrimitive.Button
            type="button"
            data-slot="rich-text-editor-button"
            data-pressed={active || undefined}
            aria-label="Link"
            className={slots.button()}
          >
            <LinkSimple weight="bold" />
          </ToolbarPrimitive.Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="start" className="w-80">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
          className="flex flex-col gap-3"
        >
          <InputRoot>
            <InputField
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              value={url}
              autoFocus
              onChange={(event) => setUrl(event.target.value)}
            />
          </InputRoot>
          <div className="flex items-center justify-end gap-2">
            {active && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={remove}
                className="mr-auto"
              >
                <LinkBreak weight="bold" /> Remove
              </Button>
            )}
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
