"use client"

import * as React from "react"
import { useEditorState } from "@tiptap/react"
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Check,
  FloppyDisk,
} from "@phosphor-icons/react"

import {
  RichTextEditor,
  RichTextEditorToolbar,
  RichTextEditorButton,
  RichTextEditorSeparator,
  RichTextEditorContent,
  RichTextEditorBubbleMenu,
  useRichTextEditor,
} from "@/components/ui/rich-text-editor"
import { Button } from "@/components/ui/button"
import { DensityProvider } from "@/lib/density"

const seeded = `<h2>Release notes</h2><p>We shipped a <strong>rich text editor</strong> built on Tiptap. Try <em>formatting</em> this text, or <a href="https://koala.ui">add a link</a>.</p><ul><li>Headings, bold, italic, underline</li><li>Links and lists</li></ul>`

// Hero: the default essential toolbar over a seeded document.
export function RichTextEditorDemo() {
  return (
    <RichTextEditor defaultValue={seeded} className="w-full max-w-xl">
      <RichTextEditorToolbar />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// Empty: shows the placeholder ghost text.
export function RichTextEditorEmptyDemo() {
  return (
    <RichTextEditor placeholder="Write a description…" className="w-full max-w-xl">
      <RichTextEditorToolbar />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// Selection bubble: double-click a word (or drag-select) and a floating toolbar appears.
const bubbleSeed = `<p>Select any of this text, double-click a word, or drag across a phrase, and a formatting toolbar floats in above it. Try adding a <strong>bold</strong> emphasis or a link.</p>`

export function RichTextEditorBubbleMenuDemo() {
  return (
    <RichTextEditor defaultValue={bubbleSeed} className="w-full max-w-xl">
      <RichTextEditorToolbar />
      <RichTextEditorBubbleMenu />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// Bubble-only: no top toolbar; formatting lives entirely in the on-selection bubble.
export function RichTextEditorBubbleOnlyDemo() {
  return (
    <RichTextEditor
      defaultValue="<p>A clean canvas: there's no toolbar until you select text.</p>"
      className="w-full max-w-xl"
    >
      <RichTextEditorBubbleMenu />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// Compact density: tighter toolbar and writing area for dense app surfaces.
export function RichTextEditorCompactDemo() {
  return (
    <DensityProvider density="compact">
      <RichTextEditor defaultValue="<p>Compact density tightens the padding.</p>" className="w-full max-w-xl">
        <RichTextEditorToolbar />
        <RichTextEditorContent />
      </RichTextEditor>
    </DensityProvider>
  )
}

// Read-only: omit the toolbar and pass `editable={false}` to render content as prose.
export function RichTextEditorReadOnlyDemo() {
  return (
    <RichTextEditor
      editable={false}
      defaultValue={seeded}
      className="w-full max-w-xl"
    >
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// A custom toolbar: reach the live editor with useRichTextEditor + Tiptap's useEditorState.
function CustomToolbar() {
  const editor = useRichTextEditor()
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: !!editor?.isActive("bold"),
      italic: !!editor?.isActive("italic"),
      strike: !!editor?.isActive("strike"),
    }),
  })
  const s = state ?? { bold: false, italic: false, strike: false }
  return (
    <RichTextEditorToolbar>
      <RichTextEditorButton
        tooltip="Bold"
        pressed={s.bold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <TextB weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorButton
        tooltip="Italic"
        pressed={s.italic}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <TextItalic weight="bold" />
      </RichTextEditorButton>
      <RichTextEditorSeparator />
      <RichTextEditorButton
        tooltip="Strikethrough"
        pressed={s.strike}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <TextStrikethrough weight="bold" />
      </RichTextEditorButton>
    </RichTextEditorToolbar>
  )
}

export function RichTextEditorCustomToolbarDemo() {
  return (
    <RichTextEditor defaultValue="<p>Only the controls you compose.</p>" className="w-full max-w-xl">
      <CustomToolbar />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}

// ─── Elaborate example: a document composer with a live status bar ────────────────

const composerSeed = `<h1>Launching Koala UI 1.0</h1>
<p>After months of polish, the design system is <strong>ready</strong>. This release brings a complete set of <em>production-grade</em> components. Read the full write-up on the <a href="https://koala.ui/blog">blog</a>.</p>
<h2>What's inside</h2>
<ul>
  <li>30+ components built on Radix &amp; Tiptap</li>
  <li>Four themes and a one-knob accent system</li>
  <li>A density axis for marketing <em>and</em> dense app UI</li>
</ul>
<h2>Getting started</h2>
<h3>Install</h3>
<ol>
  <li>Add the package to your project</li>
  <li>Drop in the design tokens</li>
  <li>Compose your first screen</li>
</ol>
<h4>A note on theming</h4>
<p>Body copy uses the <strong>secondary</strong> text color, so only headings and emphasis sit in the strong foreground, and the page never reads as a wall of bright white.</p>
<p>Select any line above to format it from the floating bubble, or use the toolbar.</p>`

// A status bar that lives *inside* the editor surface (below the content), reading the live
// editor from context. Word/char counts use tabular-nums so they never reflow as you type.
function ComposerStatusBar() {
  const editor = useRichTextEditor()
  const [saved, setSaved] = React.useState(false)
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const counts = useEditorState({
    editor,
    selector: ({ editor }) => {
      const text = editor?.getText().trim() ?? ""
      return {
        words: text ? text.split(/\s+/).length : 0,
        chars: editor?.getText().length ?? 0,
      }
    },
  })
  const { words, chars } = counts ?? { words: 0, chars: 0 }

  const save = () => {
    // In a real app you'd persist editor.getHTML(); here we just flash a confirmation.
    if (savedTimer.current) clearTimeout(savedTimer.current)
    setSaved(true)
    savedTimer.current = setTimeout(() => setSaved(false), 1600)
  }

  React.useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current)
    }
  }, [])

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">
        <span className="tabular-nums">{words}</span> words ·{" "}
        <span className="tabular-nums">{chars}</span> characters
      </p>
      <Button size="sm" onClick={save}>
        {saved ? <Check weight="bold" /> : <FloppyDisk weight="bold" />}
        {saved ? "Saved" : "Save draft"}
      </Button>
    </div>
  )
}

export function RichTextEditorComposerDemo() {
  return (
    <RichTextEditor defaultValue={composerSeed} className="w-full max-w-2xl">
      <RichTextEditorToolbar />
      <RichTextEditorBubbleMenu />
      <RichTextEditorContent className="max-h-80 overflow-y-auto" />
      <ComposerStatusBar />
    </RichTextEditor>
  )
}
