"use client"

import * as React from "react"
import { Trash, X, Paperclip, ImageSquare, FilePdf } from "@phosphor-icons/react"

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadTitle,
  FileUploadDescription,
  FileUploadTrigger,
  FileUploadList,
  formatBytes,
  type FileRejection,
} from "@/components/ui/file-upload"
import {
  FileCard,
  FileCardIcon,
  FileCardContent,
  FileCardName,
  FileCardMeta,
  FileCardActions,
  FileCardProgress,
  FileCardStatus,
  fileTypeFromName,
  type FileCardType,
} from "@/components/ui/file-card"
import { Button } from "@/components/ui/button"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

/* ----------------------------------------------------------------- showcase --- */

type UploadStatus = "uploading" | "success" | "error"
type UploadItem = {
  id: string
  name: string
  size: number
  type: FileCardType
  progress: number
  status: UploadStatus
}

const INITIAL_ITEMS: UploadItem[] = [
  { id: "f1", name: "brand-guidelines.pdf", size: 2_400_000, type: "pdf", progress: 100, status: "success" },
  { id: "f2", name: "q3-forecast.xlsx", size: 5_200_000, type: "sheet", progress: 64, status: "error" },
]

export function ShowcaseDemo() {
  const [items, setItems] = React.useState<UploadItem[]>(INITIAL_ITEMS)
  const idRef = React.useRef(100)

  function addItems(files: File[]) {
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `f${(idRef.current += 1)}`,
        name: f.name,
        size: f.size,
        type: fileTypeFromName(f.name),
        progress: 0,
        status: "uploading" as const,
      })),
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  // Drive the fake uploads forward so the bars visibly fill, then settle to success.
  React.useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.status !== "uploading") return it
          if (it.progress >= 100) return { ...it, status: "success" }
          return { ...it, progress: Math.min(100, it.progress + 6) }
        }),
      )
    }, 240)
    return () => clearInterval(id)
  }, [])

  return (
    <FileUpload multiple accept="image/*,.pdf,.zip" onFiles={addItems} className="max-w-lg">
      <FileUploadDropzone>
        <FileUploadIcon />
        <div className="flex flex-col gap-1">
          <FileUploadTitle>Drag &amp; drop files here</FileUploadTitle>
          <FileUploadDescription>or click to browse &middot; up to 10 MB each</FileUploadDescription>
        </div>
        <FileUploadTrigger size="sm">Browse files</FileUploadTrigger>
      </FileUploadDropzone>

      {items.length > 0 && (
        <FileUploadList>
          {items.map((it) => (
            <FileCard key={it.id} state={it.status}>
              <FileCardIcon type={it.type} />
              <FileCardContent>
                <FileCardName>{it.name}</FileCardName>
                {it.status === "uploading" ? (
                  <FileCardProgress value={it.progress} label="Uploading…" />
                ) : it.status === "error" ? (
                  <FileCardMeta>{formatBytes(it.size)} &middot; Upload failed</FileCardMeta>
                ) : (
                  <FileCardMeta>{formatBytes(it.size)} &middot; Uploaded</FileCardMeta>
                )}
              </FileCardContent>
              <FileCardActions>
                <FileCardStatus />
                <Button variant="ghost" size="sm" iconOnly aria-label="Remove" onClick={() => removeItem(it.id)}>
                  <Trash weight="bold" />
                </Button>
              </FileCardActions>
            </FileCard>
          ))}
        </FileUploadList>
      )}
    </FileUpload>
  )
}

/* ----------------------------------------------------------------- anatomy --- */

export function AnatomyDemo() {
  return (
    <FileUpload className="max-w-md" onFiles={() => {}}>
      <FileUploadDropzone>
        <FileUploadIcon />
        <div className="flex flex-col gap-1">
          <FileUploadTitle>Drag &amp; drop files here</FileUploadTitle>
          <FileUploadDescription>or click to browse &middot; up to 10 MB each</FileUploadDescription>
        </div>
        <FileUploadTrigger size="sm">Browse files</FileUploadTrigger>
      </FileUploadDropzone>
    </FileUpload>
  )
}

/* ------------------------------------------------------------ browse button --- */

export function BrowseButtonDemo() {
  const [name, setName] = React.useState<string | null>(null)
  return (
    <FileUpload accept=".pdf,.doc,.docx" onFiles={(f) => setName(f[0]?.name ?? null)}>
      <div className="flex items-center gap-3">
        <FileUploadTrigger>
          <Paperclip weight="bold" />
          Attach a file
        </FileUploadTrigger>
        <span className="truncate text-sm text-muted-foreground">{name ?? "No file selected"}</span>
      </div>
    </FileUpload>
  )
}

/* ------------------------------------------------------------- image grid --- */

type ImageItem = { id: string; name: string; url: string }

export function ImageGridDemo() {
  const [images, setImages] = React.useState<ImageItem[]>([])
  const idRef = React.useRef(0)

  function addImages(files: File[]) {
    setImages((prev) => [
      ...prev,
      ...files.map((f) => ({ id: `img${(idRef.current += 1)}`, name: f.name, url: URL.createObjectURL(f) })),
    ])
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((i) => i.id !== id)
    })
  }

  return (
    <FileUpload multiple accept="image/*" density="compact" onFiles={addImages} className="max-w-xl">
      <FileUploadDropzone>
        <FileUploadIcon>
          <ImageSquare weight="bold" />
        </FileUploadIcon>
        <FileUploadTitle>Add images</FileUploadTitle>
        <FileUploadDescription>PNG, JPG or GIF &middot; drop or browse</FileUploadDescription>
      </FileUploadDropzone>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group/tile relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-black/10 dark:ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="size-full object-cover" />
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                aria-label={`Remove ${img.name}`}
                onClick={() => removeImage(img.id)}
                className="absolute right-1.5 top-1.5 size-7 rounded-full opacity-0 shadow-sm transition-opacity duration-fast ease-out focus-visible:opacity-100 group-hover/tile:opacity-100"
              >
                <X weight="bold" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </FileUpload>
  )
}

/* ----------------------------------------------------------- avatar picker --- */

export function AvatarDemo() {
  const [url, setUrl] = React.useState<string | null>(null)

  function pick(files: File[]) {
    const file = files[0]
    if (!file) return
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function remove() {
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  return (
    <FileUpload accept="image/*" onFiles={pick}>
      <div className="flex items-center gap-4">
        <AvatarRoot size="xl">
          {url && <AvatarImage src={url} alt="Profile photo" />}
          <AvatarFallback>JC</AvatarFallback>
        </AvatarRoot>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FileUploadTrigger size="sm">{url ? "Change photo" : "Upload photo"}</FileUploadTrigger>
            {url && (
              <Button variant="ghost" size="sm" onClick={remove}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 2 MB max.</p>
        </div>
      </div>
    </FileUpload>
  )
}

/* ------------------------------------------------------------- validation --- */

export function ValidationDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)

  function onFiles(accepted: File[]) {
    setError(null)
    setFiles((prev) => [...prev, ...accepted])
  }

  function onReject(rejections: FileRejection[]) {
    const r = rejections[0]
    setError(
      r.reason === "size"
        ? `${r.file.name} is too large - 2 MB max.`
        : r.reason === "type"
          ? `${r.file.name} isn't a PDF.`
          : "Only one file at a time.",
    )
  }

  return (
    <FileUpload
      accept=".pdf"
      maxSize={2 * 1024 * 1024}
      onFiles={onFiles}
      onReject={onReject}
      className="max-w-md"
    >
      <FileUploadDropzone>
        <FileUploadIcon>
          <FilePdf weight="bold" />
        </FileUploadIcon>
        <FileUploadTitle>Upload a PDF</FileUploadTitle>
        <FileUploadDescription>Single PDF file, up to 2 MB</FileUploadDescription>
      </FileUploadDropzone>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {files.length > 0 && (
        <FileUploadList>
          {files.map((f, i) => (
            <FileCard key={`${f.name}-${i}`} state="success">
              <FileCardIcon type="pdf" />
              <FileCardContent>
                <FileCardName>{f.name}</FileCardName>
                <FileCardMeta>{formatBytes(f.size)} &middot; Uploaded</FileCardMeta>
              </FileCardContent>
              <FileCardStatus />
            </FileCard>
          ))}
        </FileUploadList>
      )}
    </FileUpload>
  )
}

/* ---------------------------------------------------------------- density --- */

export function DensityDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {(["comfortable", "compact"] as const).map((density) => (
        <FileUpload key={density} density={density} onFiles={() => {}}>
          <FileUploadDropzone>
            <FileUploadIcon />
            <FileUploadTitle className="capitalize">{density}</FileUploadTitle>
            <FileUploadDescription>Drag &amp; drop or browse</FileUploadDescription>
          </FileUploadDropzone>
        </FileUpload>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- disabled --- */

export function DisabledDemo() {
  return (
    <FileUpload disabled className="max-w-md" onFiles={() => {}}>
      <FileUploadDropzone>
        <FileUploadIcon />
        <div className="flex flex-col gap-1">
          <FileUploadTitle>Uploads paused</FileUploadTitle>
          <FileUploadDescription>You&rsquo;ve reached your storage limit</FileUploadDescription>
        </div>
        <FileUploadTrigger size="sm">Browse files</FileUploadTrigger>
      </FileUploadDropzone>
    </FileUpload>
  )
}
