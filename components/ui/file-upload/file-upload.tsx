"use client"

import * as React from "react"
import { ImageSquare } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { useDensity } from "@/lib/density"
import { tv, type VariantProps } from "@/lib/tv"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * FileUpload - the uploading *experience*: a drag-and-drop dropzone, a "browse" trigger,
 * and the plumbing (a hidden native input, accept/size/count validation) that turns a
 * drop or a file-picker selection into a clean list of `File`s. It's the selection half;
 * pair it with FileCard for the resulting rows + per-file progress (the two compose into
 * trays, image grids, and avatar pickers - see the docs).
 *
 * Multi-part, so the recipe lives in `slots` and the shared bits (resolved slots, the
 * `openFileDialog`/`addFiles` handlers, `disabled`) flow to every part through a typed
 * React Context - never prop-drilled, never cloned (see docs/ARCHITECTURE.md §2).
 *
 * Radix doesn't ship a file-upload primitive, so the drag model (a depth counter so child
 * elements don't flicker the highlight) is owned here; everything visual stays on tokens.
 * The picker itself is a `sr-only` `<input type="file">` we `.click()` - the canonical
 * hidden-input pattern. `"use client"` because it reads Context, density, and browser
 * drag/drop events.
 *
 * The panel is a drop target, not a button. Clicking anywhere on it still opens the picker
 * (a mouse convenience), but the keyboard affordance lives on the real controls composed
 * inside it - `FileUploadLink`, `FileUploadTrigger`, `FileUploadSource`. A `role="button"`
 * panel wrapping those would be a nested-interactive violation, and it would swallow their
 * Enter/Space. **Every dropzone must compose at least one of them**, or there is no keyboard
 * path to the picker at all.
 *
 * The component is intentionally *uncontrolled over the file list*: it emits accepted files
 * via `onFiles` and rejections via `onReject`, and the consumer owns the array + renders the
 * FileCard rows. That keeps it composable instead of locking in one list shape.
 */
export const fileUploadVariants = tv({
  slots: {
    // The root just hosts the hidden input + context; it stacks the dropzone over the list.
    root: "flex w-full flex-col gap-3",
    // The drop surface: a dashed, card-toned panel that brand-tints while a file hovers.
    // `rounded-xl` because this is a PANEL, and panels in this library are rounded-xl (Card,
    // FileCard, Dialog, Toast, List, Stat) or rounded-2xl (standalone forms). `rounded-md` is
    // the *control* radius - it belongs to the Button, Input and Select inside a panel, never
    // to the panel itself. The Figma's own token reads `Card/radius-default: 12px`, but that is
    // 12px in *its* scale; translate a radius by ROLE, not by literal value, or a panel ends up
    // wearing the control radius and lands on the same corner as the full-width trigger inside it.
    dropzone: [
      // No fill: an in-flow drop target is a contour on the ground it sits on (fill is
      // elevation, docs/FOUNDATIONS.md); hover and drag tints below are alpha, so they read on any.
      "group/dropzone relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border text-center shadow-xs",
      // Specific transition (#14) - colour and the halo, never `transition: all`. No press
      // scale: the panel is a drop target, and the controls inside it own the press feedback.
      "transition-[border-color,background-color,box-shadow] duration-fast ease-out",
      "hover:border-muted-foreground/40 hover:bg-accent/40",
      // Dragging - the brand border + soft halo the design specifies (`brand-ring` is the
      // token'd 3px wash; a hard `ring-2` reads as a focus ring, which this isn't).
      "data-[dragging=true]:border-brand data-[dragging=true]:bg-brand/5 data-[dragging=true]:brand-ring",
      // Focus lands on the controls inside, so the panel echoes it rather than owning a ring.
      // `:focus-visible`, not `focus-within`: a mouse click focuses the trigger too, and lighting
      // the whole panel on every click reads as a flash rather than a state.
      "has-[:focus-visible]:border-brand has-[:focus-visible]:brand-ring",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60",
    ],
    // The leading glyph. A bare outline mark, not a tinted tile: the dashed panel is already
    // the container, and a second box inside it just adds chrome. It picks up the brand tint
    // while dragging via the dropzone's group.
    icon: "shrink-0 text-muted-foreground transition-colors duration-fast ease-out group-data-[dragging=true]/dropzone:text-brand",
    // One balanced sentence, with the picker link sitting inline inside it.
    title: "text-balance text-base font-medium text-foreground",
    description: "text-pretty text-sm text-muted-foreground",
    // The inline "click here": a real button wearing the sentence's own type, tinted brand.
    // Underlined only on hover/focus - at rest the brand colour already marks it, and a
    // permanent rule inside a heading-weight sentence reads as damage.
    link: [
      "cursor-pointer rounded-xs text-brand underline-offset-2 transition-colors duration-fast ease-out",
      "hover:text-brand/80 hover:underline",
      "outline-none focus-visible:underline focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,var(--background))]",
      "disabled:pointer-events-none",
    ],
    // The "or import from" shortcut row: white tiles, each a mark over its label.
    sources: "flex flex-wrap items-start justify-center gap-4",
    source: [
      "group/source flex cursor-pointer flex-col items-center gap-1.5 rounded-sm",
      // The whole tile presses, mark and label together - scaling only the mark would leave the
      // label behind. `scale` is a standalone property in Tailwind v4, so name it or it snaps.
      "transition-[scale] duration-fast ease-out active:scale-[0.96] motion-reduce:transition-none",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,var(--background))]",
      "disabled:pointer-events-none disabled:opacity-60",
    ],
    // A real surface of its own, so it declares `--surface` for anything that lands inside it.
    sourceMark: [
      "grid size-9 place-items-center rounded-md border border-border bg-background text-foreground shadow-xs [--surface:var(--background)]",
      "transition-[border-color,box-shadow] duration-fast ease-out",
      "group-hover/source:border-muted-foreground/40 group-hover/source:shadow-sm",
      "[&>svg]:size-5",
    ],
    sourceLabel: "text-sm font-medium text-muted-foreground",
    // Layout-only containers for the results: a column of rows, or a grid of square tiles.
    list: "flex flex-col gap-2",
    grid: "grid grid-cols-2 gap-3 sm:grid-cols-3",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). For FileUpload it
    // tunes the dropzone's padding, the rhythm between its blocks, and the glyph. `compact`
    // is what an unset instance actually resolves to - `useDensity` falls through to the
    // provider, which defaults to compact, so the `defaultVariants` entry below never fires.
    // Ask for `comfortable` explicitly (or via a DensityProvider) to get the roomy panel.
    density: {
      comfortable: { dropzone: "gap-6 px-8 py-8", icon: "[&>svg]:size-10" },
      compact: { dropzone: "gap-4 px-6 py-6", icon: "[&>svg]:size-8" },
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

type FileUploadSlots = ReturnType<typeof fileUploadVariants>

const [FileUploadProvider, useFileUploadContext] = createContext<{
  slots: FileUploadSlots
  /** Open the hidden file picker (no-op while disabled). */
  openFileDialog: () => void
  /** Validate + emit a FileList/array (used by the dropzone's drop handler). */
  addFiles: (files: FileList | File[] | null) => void
  disabled: boolean
}>("FileUpload")

/* ------------------------------------------------------------- validation --- */

/** Why a file didn't make it through: wrong `type`, over `maxSize`, or past the count. */
export type FileRejectionReason = "type" | "size" | "count"

export interface FileRejection {
  file: File
  reason: FileRejectionReason
}

/**
 * Does a file satisfy a native `accept` string? Mirrors the browser's own matching:
 * `.ext` suffix, `type/*` mime prefix, or an exact mime. Empty accept = anything goes.
 */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true
  const patterns = accept
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
  if (patterns.length === 0) return true
  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  return patterns.some((p) => {
    if (p.startsWith(".")) return name.endsWith(p)
    if (p.endsWith("/*")) return mime.startsWith(p.slice(0, p.indexOf("/") + 1))
    return mime === p
  })
}

/**
 * formatBytes - a human file size ("1.8 MB") for the FileCard meta line, so a real `File`
 * drops straight into a row: `<FileCardMeta>{formatBytes(file.size)}</FileCardMeta>`.
 */
export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** i
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/* ------------------------------------------------------------------ root --- */

export interface FileUploadProps
  extends Omit<React.ComponentProps<"div">, "onError">,
    VariantProps<typeof fileUploadVariants> {
  /** Native input `accept`, e.g. `"image/*,.pdf"`. Also validates dropped files. */
  accept?: string
  /** Allow more than one file per selection. @default false */
  multiple?: boolean
  /** Max size per file, in bytes. Larger files are rejected with reason `"size"`. */
  maxSize?: number
  /** Disable the whole control - the dropzone, trigger, and picker all go inert. */
  disabled?: boolean
  /** Accepted files from a drop or browse. Fires only when at least one file passes. */
  onFiles?: (files: File[]) => void
  /** Rejected files + why (wrong type, too large, or beyond a single file). */
  onReject?: (rejections: FileRejection[]) => void
}

/**
 * Parts are exported individually (not `FileUpload.Dropzone` dot-notation) because
 * namespaced statics don't survive the RSC server→client boundary - only named exports do.
 * Compose as `<FileUpload onFiles={…}><FileUploadDropzone>…</FileUploadDropzone></FileUpload>`.
 */
export function FileUpload({
  className,
  density,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  onFiles,
  onReject,
  children,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const slots = fileUploadVariants({ density: useDensity(density) })

  function openFileDialog() {
    if (disabled) return
    inputRef.current?.click()
  }

  function addFiles(fileList: FileList | File[] | null) {
    if (disabled || !fileList) return
    const incoming = Array.from(fileList)
    if (incoming.length === 0) return

    const accepted: File[] = []
    const rejected: FileRejection[] = []
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        rejected.push({ file, reason: "type" })
      } else if (maxSize != null && file.size > maxSize) {
        rejected.push({ file, reason: "size" })
      } else if (!multiple && accepted.length >= 1) {
        rejected.push({ file, reason: "count" })
      } else {
        accepted.push(file)
      }
    }

    if (accepted.length) onFiles?.(accepted)
    if (rejected.length) onReject?.(rejected)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    // Reset so re-selecting the same file still fires `change` (the value is otherwise sticky).
    e.target.value = ""
  }

  return (
    <FileUploadProvider slots={slots} openFileDialog={openFileDialog} addFiles={addFiles} disabled={disabled}>
      <div data-slot="file-upload" data-disabled={disabled || undefined} className={slots.root({ className })} {...props}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleInputChange}
        />
        {children}
      </div>
    </FileUploadProvider>
  )
}

/* -------------------------------------------------------------- dropzone --- */

export type FileUploadDropzoneProps = React.ComponentProps<"div">

/**
 * FileUploadDropzone - the dashed drop surface. Clicking anywhere on it opens the picker, and
 * dragging a file over it brand-tints the panel. Drag enter/leave fire for every child element,
 * so a depth counter (a ref, mutated only in handlers) keeps the highlight from flickering as
 * the cursor crosses inner text.
 *
 * It is deliberately NOT `role="button"`. The panel holds real controls - the inline
 * `FileUploadLink`, a `FileUploadTrigger`, a row of `FileUploadSource` tiles - and a button
 * wrapping buttons is a nested-interactive violation that also swallows their Enter/Space.
 * So the whole-panel click stays a mouse convenience and the keyboard path runs through those
 * controls: **compose at least one of them**, or the picker is unreachable without a mouse.
 *
 * Fill it with `FileUploadIcon`, `FileUploadTitle` (with a `FileUploadLink` inside the
 * sentence), and either a `FileUploadTrigger` or a `FileUploadSources` row.
 */
export function FileUploadDropzone({ className, children, ...props }: FileUploadDropzoneProps) {
  const { slots, openFileDialog, addFiles, disabled } = useFileUploadContext("FileUploadDropzone")
  const [dragging, setDragging] = React.useState(false)
  const depthRef = React.useRef(0)

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (disabled) return
    depthRef.current += 1
    setDragging(true)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Required, or the browser won't fire `drop` (it'd just open the file in a new tab).
    e.preventDefault()
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    depthRef.current -= 1
    if (depthRef.current <= 0) {
      depthRef.current = 0
      setDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    depthRef.current = 0
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div
      data-slot="file-upload-dropzone"
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={slots.dropzone({ className })}
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- parts --- */

export type FileUploadIconProps = React.ComponentProps<"div">

/**
 * FileUploadIcon - the glyph crowning the dropzone. A bare outline mark, sized by density and
 * toned muted; it warms to brand while a file is dragged over the panel. Defaults to an image
 * placeholder; pass your own Phosphor glyph as children. Decorative (`aria-hidden`).
 */
export function FileUploadIcon({ className, children, ...props }: FileUploadIconProps) {
  const { slots } = useFileUploadContext("FileUploadIcon")
  return (
    <div data-slot="file-upload-icon" aria-hidden className={slots.icon({ className })} {...props}>
      {children ?? <ImageSquare />}
    </div>
  )
}

export function FileUploadTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileUploadContext("FileUploadTitle")
  return <div data-slot="file-upload-title" className={slots.title({ className })} {...props} />
}

export function FileUploadDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { slots } = useFileUploadContext("FileUploadDescription")
  return <div data-slot="file-upload-description" className={slots.description({ className })} {...props} />
}

export type FileUploadLinkProps = React.ComponentProps<"button">

/**
 * FileUploadLink - the picker affordance living *inside* the sentence: "Drag and drop your files,
 * or <FileUploadLink>click here</FileUploadLink>". A real `<button>`, so it is the dropzone's
 * keyboard path to the file dialog; it inherits the sentence's type and only wears the brand
 * colour. It stops the click from bubbling so the surrounding panel doesn't open a second dialog.
 */
export function FileUploadLink({ className, onClick, children, ...props }: FileUploadLinkProps) {
  const { slots, openFileDialog, disabled } = useFileUploadContext("FileUploadLink")

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onClick?.(e)
    openFileDialog()
  }

  return (
    <button
      type="button"
      data-slot="file-upload-link"
      disabled={disabled}
      className={slots.link({ className })}
      {...props}
      onClick={handleClick}
    >
      {children ?? "click here"}
    </button>
  )
}

export type FileUploadTriggerProps = ButtonProps

/**
 * FileUploadTrigger - a Button that opens the picker. Reuses the DS Button (default
 * `outline`), so it inherits press scale, focus ring, density, and `loading`. Use it inside
 * the dropzone, or on its own for a button-only upload with no drop surface. It stops the
 * click from bubbling so a parent dropzone doesn't *also* open the picker (one dialog, not two).
 */
export function FileUploadTrigger({
  onClick,
  children,
  variant = "outline",
  disabled,
  ...props
}: FileUploadTriggerProps) {
  const { openFileDialog, disabled: ctxDisabled } = useFileUploadContext("FileUploadTrigger")

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onClick?.(e)
    openFileDialog()
  }

  return (
    <Button
      type="button"
      variant={variant}
      disabled={disabled || ctxDisabled}
      onClick={handleClick}
      {...props}
    >
      {children ?? "Browse files"}
    </Button>
  )
}

/* --------------------------------------------------------------- sources --- */

export type FileUploadSourcesProps = React.ComponentProps<"div">

/**
 * FileUploadSources - the "or import from" shortcut row: the other places a file can come from
 * (Drive, Dropbox, a repo) when the local disk isn't where it lives. Layout-only; fill it with
 * `FileUploadSource` tiles. Pair it with a labelled `Divider` above to introduce the row.
 */
export function FileUploadSources({ className, ...props }: FileUploadSourcesProps) {
  const { slots } = useFileUploadContext("FileUploadSources")
  return <div data-slot="file-upload-sources" className={slots.sources({ className })} {...props} />
}

export interface FileUploadSourceProps extends React.ComponentProps<"button"> {
  /** The name under the mark, e.g. "Google Drive". Also the button's accessible name. */
  label: React.ReactNode
}

/**
 * FileUploadSource - one import shortcut: a bordered tile holding the provider's mark, with its
 * name beneath. A real `<button>`; wire `onClick` to whatever that provider's picker is (an OAuth
 * flow, a modal, your own SDK). It stops propagation so the surrounding dropzone doesn't also
 * open the local file dialog - a source is explicitly *not* the local disk.
 *
 * The mark is `children`, not a `brand` prop: our brand-logo set lives in `components/docs`, and
 * a shipped `components/ui` component reaching into the docs layer would invert the dependency.
 * Pass whatever mark you own - a `BrandLogo`, an `<img>`, a Phosphor glyph.
 */
export function FileUploadSource({
  className,
  label,
  onClick,
  children,
  disabled,
  ...props
}: FileUploadSourceProps) {
  const { slots, disabled: ctxDisabled } = useFileUploadContext("FileUploadSource")

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onClick?.(e)
  }

  return (
    <button
      type="button"
      data-slot="file-upload-source"
      disabled={disabled || ctxDisabled}
      className={slots.source({ className })}
      {...props}
      onClick={handleClick}
    >
      <span aria-hidden className={slots.sourceMark()}>
        {children}
      </span>
      <span className={slots.sourceLabel()}>{label}</span>
    </button>
  )
}

/* --------------------------------------------------------------- results --- */

export type FileUploadListProps = React.ComponentProps<"div">

/**
 * FileUploadList - a layout-only column for the resulting rows. Map the selected files to
 * FileCard inside it: the upload component owns selection, FileCard owns the row + progress.
 */
export function FileUploadList({ className, ...props }: FileUploadListProps) {
  const { slots } = useFileUploadContext("FileUploadList")
  return <div data-slot="file-upload-list" className={slots.list({ className })} {...props} />
}

export type FileUploadGridProps = React.ComponentProps<"div">

/**
 * FileUploadGrid - the thumbnail counterpart to `FileUploadList`: a layout-only grid of square
 * cells for image uploads, where the picture is the point and a filename row would only get in
 * the way. Fill it with `<FileCard layout="tile">`.
 */
export function FileUploadGrid({ className, ...props }: FileUploadGridProps) {
  const { slots } = useFileUploadContext("FileUploadGrid")
  return <div data-slot="file-upload-grid" className={slots.grid({ className })} {...props} />
}
