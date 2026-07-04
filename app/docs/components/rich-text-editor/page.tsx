import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { ScaleRow } from "@/components/docs/foundation"
import { Faq } from "@/components/docs/faq"
import {
  RichTextEditorDemo,
  RichTextEditorEmptyDemo,
  RichTextEditorComposerDemo,
  RichTextEditorBubbleMenuDemo,
  RichTextEditorBubbleOnlyDemo,
  RichTextEditorCompactDemo,
  RichTextEditorReadOnlyDemo,
  RichTextEditorCustomToolbarDemo,
} from "./demos"

export const metadata = {
  title: "Rich Text Editor",
}

/**
 * The document scale the editor maps onto each block, fixed by the component's `content`
 * recipe (not the page-level type scale). Headings descend xl→sm and all sit in the strong
 * foreground; body copy is the muted secondary color, so a document reads calm with only its
 * headings and emphasis lifted. `className` mirrors the resolved prose styles verbatim, and
 * each sample is a real heading element so it picks up the same base face the editor renders:
 * `font-heading` (DM Sans) on h1–h2, Inter on h3–h4, plus the base tracking.
 */
const PROSE_SCALE = [
  { tag: "h1", name: "H1", token: "text-3xl", px: "30px", note: "semibold · tight", className: "text-3xl font-semibold tracking-tight text-foreground", sample: "Heading one" },
  { tag: "h2", name: "H2", token: "text-xl", px: "20px", note: "semibold · tight", className: "text-xl font-semibold tracking-tight text-foreground", sample: "Heading two" },
  { tag: "h3", name: "H3", token: "text-lg", px: "18px", note: "semibold", className: "text-lg font-semibold text-foreground", sample: "Heading three" },
  { tag: "h4", name: "H4", token: "text-sm", px: "14px", note: "semibold", className: "text-sm font-semibold text-foreground", sample: "Heading four" },
  { tag: "p", name: "Body", token: "text-sm", px: "14px", note: "relaxed · muted", className: "max-w-md text-sm leading-relaxed text-muted-foreground", sample: "Body copy reads in the secondary text color, so only headings and emphasis carry the strong foreground." },
] as const

/** Render a prose specimen as its real element so it inherits the base heading face (DM Sans on h1–h2, Inter on h3–h4). */
function ProseSample({
  tag: Tag,
  className,
  children,
}: {
  tag: "h1" | "h2" | "h3" | "h4" | "p"
  className: string
  children: string
}) {
  return <Tag className={className}>{children}</Tag>
}

export default function RichTextEditorDocsPage() {
  return (
    <>
      <DocHeader
        title="Rich Text Editor"
        description="A WYSIWYG editor for formatted prose: headings, bold/italic/underline, links, and lists. Built on Tiptap (ProseMirror) for selection, undo, and paste, with every pixel of UI owned as a Koala tv recipe. Like Tooltip wrapping Tippy.js, it's the considered exception to Radix-first."
      />

      <ComponentPreview
        previewClassName="justify-stretch"
        code={`<RichTextEditor defaultValue="<h2>Release notes</h2>…">
  <RichTextEditorToolbar />
  <RichTextEditorContent />
</RichTextEditor>`}
      >
        <RichTextEditorDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="rich-text-editor"
          dependencies="npm install @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extensions radix-ui tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  RichTextEditor,
  RichTextEditorToolbar,
  RichTextEditorContent,
} from "@/components/ui/rich-text-editor"

export function Example() {
  return (
    <RichTextEditor
      defaultValue="<p>Hello, world.</p>"
      onChange={(html) => console.log(html)}
    >
      <RichTextEditorToolbar />
      <RichTextEditorContent />
    </RichTextEditor>
  )
}`}
        />
      </DocSection>

      <DocSection title="Placeholder">
        <p className="mt-4 text-pretty text-muted-foreground">
          An empty editor shows muted ghost text. Set it with the{" "}
          <code className="font-mono text-sm">placeholder</code> prop.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`<RichTextEditor placeholder="Write a description…">
  <RichTextEditorToolbar />
  <RichTextEditorContent />
</RichTextEditor>`}
        >
          <RichTextEditorEmptyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="A complete composer">
        <p className="mt-4 text-pretty text-muted-foreground">
          Everything together: a seeded document, the full toolbar, the on-selection bubble,
          a scrollable writing area, and a status bar that lives inside the editor surface:
          live word/character counts (<code className="font-mono text-sm">tabular-nums</code>,
          so they never reflow) and a save action with transient confirmation. The status bar
          is just a child that reads the editor via{" "}
          <code className="font-mono text-sm">useRichTextEditor</code>.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`function ComposerStatusBar() {
  const editor = useRichTextEditor()
  const { words, chars } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const text = editor?.getText().trim() ?? ""
      return {
        words: text ? text.split(/\\s+/).length : 0,
        chars: editor?.getText().length ?? 0,
      }
    },
  }) ?? { words: 0, chars: 0 }

  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2">
      <p className="text-xs text-muted-foreground">
        <span className="tabular-nums">{words}</span> words ·{" "}
        <span className="tabular-nums">{chars}</span> characters
      </p>
      <Button size="sm" onClick={saveDraft}><FloppyDisk /> Save draft</Button>
    </div>
  )
}

<RichTextEditor defaultValue={doc}>
  <RichTextEditorToolbar />
  <RichTextEditorBubbleMenu />
  <RichTextEditorContent className="max-h-80 overflow-y-auto" />
  <ComposerStatusBar />
</RichTextEditor>`}
        >
          <RichTextEditorComposerDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Selection bubble menu">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop in <code className="font-mono text-sm">RichTextEditorBubbleMenu</code> and a
          floating toolbar surfaces over the current selection. <strong>Double-click a word</strong>{" "}
          or drag across a phrase and it appears above it (Medium / Notion style). It pairs with
          the top toolbar or replaces it entirely. Its link control expands{" "}
          <em>inline</em> so the selection-driven bubble never dismisses while you type the URL.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`<RichTextEditor defaultValue="<p>Select any of this text…</p>">
  <RichTextEditorToolbar />
  <RichTextEditorBubbleMenu />
  <RichTextEditorContent />
</RichTextEditor>`}
        >
          <RichTextEditorBubbleMenuDemo />
        </ComponentPreview>

        <p className="mt-2 text-pretty text-muted-foreground">
          Or go chromeless: omit the top toolbar and let the bubble be the only formatting UI.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`<RichTextEditor defaultValue="<p>A clean canvas…</p>">
  <RichTextEditorBubbleMenu />
  <RichTextEditorContent />
</RichTextEditor>`}
        >
          <RichTextEditorBubbleOnlyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Like the rest of Koala, the editor honors{" "}
          <code className="font-mono text-sm">density</code>. <code className="font-mono text-sm">compact</code>{" "}
          tightens the toolbar and writing-area padding for dense app surfaces. Set it per
          instance or once with a <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`<DensityProvider density="compact">
  <RichTextEditor defaultValue="<p>Compact density…</p>">
    <RichTextEditorToolbar />
    <RichTextEditorContent />
  </RichTextEditor>
</DensityProvider>`}
        >
          <RichTextEditorCompactDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Read-only">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">editable={`{false}`}</code> and omit the
          toolbar to render stored content as styled prose, useful for previews and feeds.
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`<RichTextEditor editable={false} defaultValue={savedHtml}>
  <RichTextEditorContent />
</RichTextEditor>`}
        >
          <RichTextEditorReadOnlyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Custom toolbar">
        <p className="mt-4 text-pretty text-muted-foreground">
          With no children the toolbar renders the essential controls. For a custom set,
          pass <code className="font-mono text-sm">RichTextEditorButton</code>s and reach the
          live editor with the <code className="font-mono text-sm">useRichTextEditor</code>{" "}
          hook (pair it with Tiptap&apos;s{" "}
          <code className="font-mono text-sm">useEditorState</code> to reflect active
          formatting).
        </p>
        <ComponentPreview
          previewClassName="justify-stretch"
          code={`function CustomToolbar() {
  const editor = useRichTextEditor()
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({ bold: !!editor?.isActive("bold") }),
  })
  return (
    <RichTextEditorToolbar>
      <RichTextEditorButton
        tooltip="Bold"
        pressed={s?.bold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <TextB />
      </RichTextEditorButton>
    </RichTextEditorToolbar>
  )
}`}
        >
          <RichTextEditorCustomToolbarDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Prose scale">
        <p className="mt-4 text-pretty text-muted-foreground">
          Inside the editor, blocks render on a document scale tuned for reading: the heading
          steps mirror Tailwind&apos;s{" "}
          <code className="font-mono text-sm">@tailwindcss/typography</code>{" "}
          <code className="font-mono text-sm">prose-sm</code> proportions, scaled to the 14px
          body (no plugin dependency). Headings run{" "}
          <code className="font-mono text-sm">text-3xl</code> →{" "}
          <code className="font-mono text-sm">text-sm</code> in the strong foreground, while body
          copy stays the muted secondary color, so a document reads calm with only its headings
          and emphasis lifted. These sizes are fixed by the component. For the raw scale they draw
          from, see the{" "}
          <a href="/docs/foundations/typography" className="underline underline-offset-4">
            Typography
          </a>{" "}
          foundation.
        </p>
        <div className="mt-4">
          {PROSE_SCALE.map((row) => (
            <ScaleRow
              key={row.name}
              name={row.name}
              meta={`${row.token} · ${row.px}`}
              detail={row.note}
              align={row.tag === "p" ? "start" : "center"}
            >
              <ProseSample tag={row.tag} className={row.className}>
                {row.sample}
              </ProseSample>
            </ScaleRow>
          ))}
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "Why is this built on Tiptap rather than a Radix primitive?", a: "Rich text needs ProseMirror's document model for selection, undo, and paste, which no Radix primitive provides. Like Tooltip wrapping Tippy.js, it is the considered exception to Koala's Radix-first rule, with every pixel of UI still owned as a tv recipe." },
            { q: "How do I read the editor's value, and is it controlled?", a: "Seed initial content with `defaultValue` (an HTML string) and subscribe to edits with `onChange`, which fires with the current HTML. For live derived UI like word counts, reach the editor instance from any child with the `useRichTextEditor` hook." },
            { q: "What does RichTextEditorBubbleMenu add, and can it replace the toolbar?", a: "It floats a formatting toolbar over the current selection (Medium / Notion style) when you double-click a word or drag across a phrase. It pairs with the top `RichTextEditorToolbar` or replaces it entirely for a chromeless canvas; its link control expands inline so the bubble never dismisses while you type a URL." },
            { q: "How do I render stored content read-only?", a: "Pass `editable={false}` and omit the `RichTextEditorToolbar`, leaving just `RichTextEditorContent` to render the saved HTML as styled prose. This is the pattern for previews and feeds." },
            { q: "How do I build a custom toolbar with active formatting state?", a: "Pass `RichTextEditorButton`s as children of `RichTextEditorToolbar`, get the editor via `useRichTextEditor`, and drive each button with `editor.chain().focus().toggleBold().run()`. Pair it with Tiptap's `useEditorState` and the button's `pressed` prop to reflect whether the mark is active." },
            { q: "Does the editor honor density?", a: "Yes. Set `density=\"compact\"` per instance or once with a `DensityProvider` to tighten the toolbar and writing-area padding for dense app surfaces." },
          ]}
        />
      </DocSection>

    </>
  )
}
