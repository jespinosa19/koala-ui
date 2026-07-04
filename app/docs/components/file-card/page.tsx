import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ShowcaseDemo,
  AnatomyDemo,
  FileTypesDemo,
  ThumbnailDemo,
  ProgressDemo,
  StatesDemo,
  VariantsDemo,
  DensityDemo,
  InteractiveDemo,
} from "./file-card-demos"

export const metadata = { title: "File Card" }

export default function FileCardDocsPage() {
  return (
    <>
      <DocHeader
        title="File Card"
        description="A card for a single file: a realistic file-type illustration (or image thumbnail), the name, a meta line, trailing actions, and an optional upload progress bar. Compose the named parts into attachment rows, upload trays, and file lists."
      />

      <ComponentPreview previewClassName="block" code={SHOWCASE_CODE}>
        <ShowcaseDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation
          component="file-card"
          dependencies="npm install @phosphor-icons/react radix-ui tailwind-variants tailwind-merge"
        />
      </DocSection>

      <DocSection title="Usage">
        <p className="mt-4 text-pretty text-muted-foreground">
          File Card is composed from named parts, like{" "}
          <a href="/docs/components/card" className="underline underline-offset-4">Card</a>. The{" "}
          <code className="font-mono text-sm">FileCard</code> root owns the surface, variant,
          state, and density; the parts (<code className="font-mono text-sm">FileCardIcon</code>,{" "}
          <code className="font-mono text-sm">FileCardName</code>,{" "}
          <code className="font-mono text-sm">FileCardProgress</code>) read it from context.
        </p>
        <CodeSnippet filename="attachment.tsx" className="mt-4" code={USAGE_CODE} />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          A row reads left-to-right: a <code className="font-mono text-sm">FileCardIcon</code>{" "}
          (or <code className="font-mono text-sm">FileCardThumbnail</code>) leads, a{" "}
          <code className="font-mono text-sm">FileCardContent</code> column fills with the{" "}
          <code className="font-mono text-sm">FileCardName</code> over a muted{" "}
          <code className="font-mono text-sm">FileCardMeta</code> line, and{" "}
          <code className="font-mono text-sm">FileCardActions</code> ride the right edge. The
          name truncates so a long filename never pushes the actions off the card.
        </p>
        <ComponentPreview previewClassName="block" code={ANATOMY_CODE}>
          <AnatomyDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="File types">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">type</code> to{" "}
          <code className="font-mono text-sm">FileCardIcon</code> and it renders a realistic file
          illustration: a sheet with a dog-eared corner and a colored band stamped with the
          extension. The tone re-themes across all four palettes: PDFs read red, images purple,
          sheets green, and so on. The band shows a short stand-in (PDF, XLS, IMG&hellip;) by
          default; pass <code className="font-mono text-sm">label</code> to stamp the real
          extension (the demo below shows <code className="font-mono text-sm">DOCX</code>,{" "}
          <code className="font-mono text-sm">XLSX</code>, <code className="font-mono text-sm">TSX</code>).
          Don&rsquo;t know the type up front? Derive it from the filename with{" "}
          <code className="font-mono text-sm">fileTypeFromName(file.name)</code>.
        </p>
        <ComponentPreview previewClassName="block" code={FILE_TYPES_CODE}>
          <FileTypesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Thumbnail">
        <p className="mt-4 text-pretty text-muted-foreground">
          For images, swap the glyph tile for a{" "}
          <code className="font-mono text-sm">FileCardThumbnail</code>. It fills the same
          footprint, clips the preview to the concentric radius, and carries a subtle inset
          outline so the image edge reads cleanly on any surface. Always pass a meaningful{" "}
          <code className="font-mono text-sm">alt</code>.
        </p>
        <ComponentPreview previewClassName="block" code={THUMBNAIL_CODE}>
          <ThumbnailDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Upload progress">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a <code className="font-mono text-sm">FileCardProgress</code> into the content
          column to show an in-flight upload. The fill rides a CSS variable (so a live{" "}
          <code className="font-mono text-sm">value</code> animates smoothly) and the percentage
          uses <code className="font-mono text-sm">tabular-nums</code> so it never reflows. Swap
          it for a <code className="font-mono text-sm">FileCardMeta</code> once the upload lands.
        </p>
        <ComponentPreview previewClassName="block" code={PROGRESS_CODE}>
          <ProgressDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="States">
        <p className="mt-4 text-pretty text-muted-foreground">
          The root <code className="font-mono text-sm">state</code> drives the surface and the
          trailing <code className="font-mono text-sm">FileCardStatus</code> glyph:{" "}
          <code className="font-mono text-sm">uploading</code> spins,{" "}
          <code className="font-mono text-sm">success</code> lights a green check, and{" "}
          <code className="font-mono text-sm">error</code> pulls a soft destructive border with a
          warning so a failed file reads at a glance.
        </p>
        <ComponentPreview previewClassName="block" code={STATES_CODE}>
          <StatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">default</code> sits on a hairline border with a soft
          shadow; <code className="font-mono text-sm">outline</code> drops the shadow for flat,
          gridded lists; <code className="font-mono text-sm">elevated</code> trades the border for a
          lifted shadow when a card needs to float; <code className="font-mono text-sm">ghost</code>{" "}
          strips all chrome and padding so the row sits flush in feeds, comment threads, and dense
          lists. The file illustration still carries the file&rsquo;s identity.
        </p>
        <ComponentPreview previewClassName="block" code={VARIANTS_CODE}>
          <VariantsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          Density is Koala&rsquo;s cross-cutting spacing axis (see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>).
          For File Card it tunes padding, gap, and the media tile.{" "}
          <code className="font-mono text-sm">compact</code> is the dense app default for upload
          trays and file lists; <code className="font-mono text-sm">comfortable</code> is roomier.
          Set it per-card or for a whole list with{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview previewClassName="block" code={DENSITY_CODE}>
          <DensityDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Interactive">
        <p className="mt-4 text-pretty text-muted-foreground">
          A file row is inert by default. When the whole card should open the file, pass{" "}
          <code className="font-mono text-sm">asChild</code> to render it as a link and{" "}
          <code className="font-mono text-sm">interactive</code> to add the pointer, hover lift,
          and focus ring. For per-file actions instead, keep the card inert and drop{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">Button</a>s
          into <code className="font-mono text-sm">FileCardActions</code>.
        </p>
        <ComponentPreview previewClassName="block" code={INTERACTIVE_CODE}>
          <InteractiveDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">FileCard</code> forwards all{" "}
          <code className="font-mono text-sm">div</code> props and adds{" "}
          <code className="font-mono text-sm">variant</code> (
          <code className="font-mono text-sm">default | outline | elevated | ghost</code>),{" "}
          <code className="font-mono text-sm">state</code> (
          <code className="font-mono text-sm">idle | uploading | success | error</code>),{" "}
          <code className="font-mono text-sm">density</code> (
          <code className="font-mono text-sm">compact | comfortable</code>),{" "}
          <code className="font-mono text-sm">interactive</code>, and{" "}
          <code className="font-mono text-sm">asChild</code>. The parts ({" "}
          <code className="font-mono text-sm">FileCardContent</code>,{" "}
          <code className="font-mono text-sm">FileCardName</code>,{" "}
          <code className="font-mono text-sm">FileCardMeta</code>,{" "}
          <code className="font-mono text-sm">FileCardActions</code>) forward{" "}
          <code className="font-mono text-sm">div</code> props.{" "}
          <code className="font-mono text-sm">FileCardIcon</code> adds{" "}
          <code className="font-mono text-sm">type</code> and an optional{" "}
          <code className="font-mono text-sm">label</code> band override (or pass your own glyph as
          children);{" "}
          <code className="font-mono text-sm">FileCardThumbnail</code> forwards{" "}
          <code className="font-mono text-sm">img</code> props and requires{" "}
          <code className="font-mono text-sm">alt</code>;{" "}
          <code className="font-mono text-sm">FileCardProgress</code> takes{" "}
          <code className="font-mono text-sm">value</code>,{" "}
          <code className="font-mono text-sm">label</code>, and{" "}
          <code className="font-mono text-sm">hideValue</code>;{" "}
          <code className="font-mono text-sm">FileCardStatus</code> takes an optional{" "}
          <code className="font-mono text-sm">status</code> (else it reads the card&rsquo;s state).
          The helper <code className="font-mono text-sm">fileTypeFromName(name)</code> maps a
          filename to a type. Every part accepts{" "}
          <code className="font-mono text-sm">className</code>, merged last.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "How do I pick the right illustration and tint without knowing the file type up front?",
              a: "Pass `type` to FileCardIcon to render a realistic file illustration (a sheet with a dog-eared corner and a colored extension band) with a re-themable tint, for example \"pdf\" reads red and \"image\" reads purple. If you only have a filename, call `fileTypeFromName(file.name)` and pass its result as the type; it falls back to \"default\" for unknown or extensionless names. By default the band shows a short per-type stand-in (PDF, XLS, IMG…); pass `label` to stamp the exact extension, e.g. label=\"CSV\".",
            },
            {
              q: "When should I use FileCardThumbnail instead of FileCardIcon?",
              a: "Use FileCardThumbnail for images: it fills the same footprint as the icon tile, clips the preview to the concentric radius, and carries a subtle inset outline so the edge reads on any surface. It requires a meaningful `alt` and forwards native img props, so an object URL src works for not-yet-uploaded blobs.",
            },
            {
              q: "How do the variant and state props differ?",
              a: "`variant` controls chrome: default has a border and soft shadow, outline drops the shadow, elevated trades the border for a lift, and ghost strips all chrome and padding to sit flush in feeds. `state` (idle, uploading, success, error) drives the surface tint and the FileCardStatus glyph, with error pulling a soft destructive border.",
            },
            {
              q: "Does FileCardStatus need its own status prop?",
              a: "Usually not. FileCardStatus reads the card's `state` from context by default, so `<FileCard state=\"success\">` lights the green check and \"error\" shows the warning automatically. Pass an explicit `status` only when you want a glyph that differs from the card's state.",
            },
            {
              q: "How do I show an upload bar, and how does it animate smoothly?",
              a: "Drop a FileCardProgress into the FileCardContent column and pass `value` from 0 to 100, plus an optional `label` and `hideValue`. The fill width rides a CSS variable so a live value animates with a width-only transition, and the percentage uses tabular-nums so it never reflows; swap it for a FileCardMeta once the upload lands.",
            },
            {
              q: "How do I make the whole card open the file versus offering per-file actions?",
              a: "For a card that opens the file, pass `asChild` to render it as your own anchor and `interactive` to add the pointer, hover lift, and focus ring. For per-file actions instead, keep the card inert and drop Buttons into FileCardActions.",
            },
            {
              q: "What does density change on a File Card?",
              a: "Density tunes the padding, gap, and media tile size. `compact` is the dense app default for upload trays and file lists, `comfortable` is roomier, and you can set it per card or for a whole list with DensityProvider.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}

/* ------------------------------------------------------------ code blocks --- */

const SHOWCASE_CODE = `<FileCard>
  <FileCardIcon type="pdf" />
  <FileCardContent>
    <FileCardName>Annual report 2025.pdf</FileCardName>
    <FileCardMeta>2.4 MB · PDF document</FileCardMeta>
  </FileCardContent>
  <FileCardActions>
    <Button variant="ghost" size="sm" iconOnly aria-label="Download"><DownloadSimple /></Button>
    <Button variant="ghost" size="sm" iconOnly aria-label="Remove"><Trash /></Button>
  </FileCardActions>
</FileCard>

<FileCard state="success">
  <FileCardIcon type="image" />
  <FileCardContent>
    <FileCardName>hero-banner.png</FileCardName>
    <FileCardMeta>880 KB · Uploaded</FileCardMeta>
  </FileCardContent>
  <FileCardStatus />
</FileCard>`

const USAGE_CODE = `import {
  FileCard,
  FileCardIcon,
  FileCardContent,
  FileCardName,
  FileCardMeta,
  FileCardActions,
  fileTypeFromName,
} from "@/components/ui/file-card"
import { Button } from "@/components/ui/button"
import { DownloadSimple, Trash } from "@phosphor-icons/react"

export function Attachment({ file }) {
  return (
    <FileCard>
      <FileCardIcon type={fileTypeFromName(file.name)} />
      <FileCardContent>
        <FileCardName>{file.name}</FileCardName>
        <FileCardMeta>{file.size}</FileCardMeta>
      </FileCardContent>
      <FileCardActions>
        <Button variant="ghost" size="sm" iconOnly aria-label="Download"><DownloadSimple /></Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Remove"><Trash /></Button>
      </FileCardActions>
    </FileCard>
  )
}`

const ANATOMY_CODE = `<FileCard>
  <FileCardIcon type="pdf" />
  <FileCardContent>
    <FileCardName>Annual report 2025.pdf</FileCardName>
    <FileCardMeta>2.4 MB · PDF document</FileCardMeta>
  </FileCardContent>
  <FileCardActions>
    <Button variant="ghost" size="sm" iconOnly aria-label="Download"><DownloadSimple /></Button>
    <Button variant="ghost" size="sm" iconOnly aria-label="More"><DotsThree /></Button>
  </FileCardActions>
</FileCard>`

const FILE_TYPES_CODE = `// type picks the tone + a default band label
<FileCardIcon type="pdf" />     {/* red · "PDF" */}
<FileCardIcon type="image" />   {/* purple · "IMG" */}
<FileCardIcon type="sheet" />   {/* green · "XLS" */}
<FileCardIcon type="code" />    {/* teal · "</>" */}

// stamp the real extension on the band
<FileCardIcon type="sheet" label="CSV" />

// …or derive the type straight from the filename
<FileCardIcon type={fileTypeFromName("index.tsx")} />`

const THUMBNAIL_CODE = `<FileCard>
  <FileCardThumbnail src={previewUrl} alt="Mountain landscape" />
  <FileCardContent>
    <FileCardName>mountain-vista.jpg</FileCardName>
    <FileCardMeta>1.8 MB · 2400 × 1600</FileCardMeta>
  </FileCardContent>
  <FileCardActions>
    <Button variant="ghost" size="sm" iconOnly aria-label="Remove"><Trash /></Button>
  </FileCardActions>
</FileCard>`

const PROGRESS_CODE = `<FileCard state={done ? "success" : "uploading"}>
  <FileCardIcon type="video" />
  <FileCardContent>
    <FileCardName>product-demo.mp4</FileCardName>
    {done ? (
      <FileCardMeta>48 MB · Uploaded</FileCardMeta>
    ) : (
      <FileCardProgress value={progress} label="Uploading…" />
    )}
  </FileCardContent>
  <FileCardStatus />
</FileCard>`

const STATES_CODE = `<FileCard state="uploading">…<FileCardProgress value={42} label="Uploading…" />…</FileCard>
<FileCard state="success">…<FileCardStatus />…</FileCard>   {/* green check */}
<FileCard state="error">…<FileCardStatus />…</FileCard>     {/* red border + warning */}`

const VARIANTS_CODE = `<FileCard variant="default">…</FileCard>
<FileCard variant="outline">…</FileCard>
<FileCard variant="elevated">…</FileCard>
<FileCard variant="ghost">…</FileCard>   {/* chrome-less, flush in feeds/lists */}`

const DENSITY_CODE = `// "compact" (the app default) or "comfortable"
<FileCard density="compact">…</FileCard>
<FileCard density="comfortable">…</FileCard>`

const INTERACTIVE_CODE = `// The whole card opens the file:
<FileCard asChild interactive>
  <a href={file.url}>
    <FileCardIcon type="pdf" />
    <FileCardContent>
      <FileCardName>Annual report 2025.pdf</FileCardName>
      <FileCardMeta>2.4 MB · Click to open</FileCardMeta>
    </FileCardContent>
  </a>
</FileCard>`
