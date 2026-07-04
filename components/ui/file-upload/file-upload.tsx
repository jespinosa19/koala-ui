"use client"

import * as React from "react"
import { UploadSimple } from "@phosphor-icons/react"

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
 * elements don't flicker the highlight) and the keyboard affordance (Enter/Space on the
 * `role="button"` dropzone) are owned here; everything visual stays on tokens. The picker
 * itself is a `sr-only` `<input type="file">` we `.click()` - the canonical hidden-input
 * pattern. `"use client"` because it reads Context, density, and browser drag/drop events.
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
    // Concentric radius - rounded-xl (16px) so the inner icon tile can drop to lg.
    dropzone: [
      "group/dropzone relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card text-center",
      // Specific transition (#14) - colours + the press scale, never `transition: all`.
      "transition duration-fast ease-out",
      "hover:border-muted-foreground/40 hover:bg-accent/40",
      // A full-panel press at 0.96 reads janky on this footprint; 0.98 gives press
      // feedback while staying above the 0.95 floor (the same call FileCard's interactive
      // card makes - a large surface scales less than a small control).
      "active:scale-[0.98]",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Dragging - brand border + wash + a soft halo, so the target reads at a glance.
      "data-[dragging=true]:border-brand data-[dragging=true]:bg-brand/5 data-[dragging=true]:ring-2 data-[dragging=true]:ring-brand",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60",
    ],
    // The leading glyph tile. Grid-centred so the icon optically centres; it picks up the
    // brand tint while dragging via the dropzone's group.
    icon: "grid shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors duration-fast ease-out group-data-[dragging=true]/dropzone:bg-brand/10 group-data-[dragging=true]/dropzone:text-brand",
    title: "text-balance text-sm font-medium text-foreground",
    description: "text-pretty text-xs text-muted-foreground",
    // Layout-only container for the resulting FileCard rows.
    list: "flex flex-col gap-2",
  },
  variants: {
    // Density is Koala's cross-cutting spacing axis (lib/density.tsx). For FileUpload it
    // tunes the dropzone padding + the icon tile. `comfortable` is the roomy marketing
    // default; `compact` tightens it for app shells and dense forms.
    density: {
      comfortable: { dropzone: "px-6 py-10", icon: "size-12 [&>svg]:size-6" },
      compact: { dropzone: "gap-2 px-5 py-7", icon: "size-10 [&>svg]:size-5" },
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
 * FileUploadDropzone - the dashed drop surface. Click or Enter/Space opens the picker;
 * dragging a file over it brand-tints the panel. Drag enter/leave fire for every child
 * element, so a depth counter (a ref, mutated only in handlers) keeps the highlight from
 * flickering as the cursor crosses inner text. Fill it with `FileUploadIcon`,
 * `FileUploadTitle`, `FileUploadDescription`, and a `FileUploadTrigger`.
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openFileDialog()
    }
    props.onKeyDown?.(e)
  }

  return (
    <div
      data-slot="file-upload-dropzone"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={slots.dropzone({ className })}
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- parts --- */

export type FileUploadIconProps = React.ComponentProps<"div">

/**
 * FileUploadIcon - the leading glyph tile inside the dropzone. Defaults to an upload arrow;
 * pass your own Phosphor glyph as children. Decorative (`aria-hidden`).
 */
export function FileUploadIcon({ className, children, ...props }: FileUploadIconProps) {
  const { slots } = useFileUploadContext("FileUploadIcon")
  return (
    <div data-slot="file-upload-icon" aria-hidden className={slots.icon({ className })} {...props}>
      {children ?? <UploadSimple weight="bold" />}
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

export type FileUploadListProps = React.ComponentProps<"div">

/**
 * FileUploadList - a layout-only column for the resulting rows. Map the selected files to
 * FileCard inside it: the upload component owns selection, FileCard owns the row + progress.
 */
export function FileUploadList({ className, ...props }: FileUploadListProps) {
  const { slots } = useFileUploadContext("FileUploadList")
  return <div data-slot="file-upload-list" className={slots.list({ className })} {...props} />
}
