"use client"

import * as React from "react"
import { DownloadSimple, Trash, DotsThree } from "@phosphor-icons/react"

import {
  FileCard,
  FileCardIcon,
  FileCardThumbnail,
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
import { Tooltip } from "@/components/ui/tooltip"

/* ----------------------------------------------------------------- showcase --- */

export function ShowcaseDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileCard>
        <FileCardIcon type="pdf" />
        <FileCardContent>
          <FileCardName>Annual report 2025.pdf</FileCardName>
          <FileCardMeta>2.4 MB · PDF document</FileCardMeta>
        </FileCardContent>
        <FileCardActions>
          <Button variant="ghost" size="sm" iconOnly aria-label="Download">
            <DownloadSimple weight="bold" />
          </Button>
          <Button variant="ghost" size="sm" iconOnly aria-label="Remove">
            <Trash weight="bold" />
          </Button>
        </FileCardActions>
      </FileCard>

      <FileCard state="success">
        <FileCardIcon type="image" />
        <FileCardContent>
          <FileCardName>hero-banner.png</FileCardName>
          <FileCardMeta>880 KB · Uploaded</FileCardMeta>
        </FileCardContent>
        <FileCardStatus />
      </FileCard>

      <FileCard state="error">
        <FileCardIcon type="sheet" />
        <FileCardContent>
          <FileCardName>q3-forecast.xlsx</FileCardName>
          <FileCardProgress value={64} hideValue />
        </FileCardContent>
        <FileCardActions>
          {/* On failure the reason isn't stacked above the bar: it rides the red glyph as a tooltip. */}
          <Tooltip content="Upload failed">
            <FileCardStatus label="Upload failed" />
          </Tooltip>
          <Button variant="ghost" size="sm" iconOnly aria-label="Remove">
            <Trash weight="bold" />
          </Button>
        </FileCardActions>
      </FileCard>
    </div>
  )
}

/* ----------------------------------------------------------------- anatomy --- */

export function AnatomyDemo() {
  return (
    <FileCard className="w-full max-w-md">
      <FileCardIcon type="pdf" />
      <FileCardContent>
        <FileCardName>Annual report 2025.pdf</FileCardName>
        <FileCardMeta>2.4 MB · PDF document</FileCardMeta>
      </FileCardContent>
      <FileCardActions>
        <Button variant="ghost" size="sm" iconOnly aria-label="Download">
          <DownloadSimple weight="bold" />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="More">
          <DotsThree weight="bold" />
        </Button>
      </FileCardActions>
    </FileCard>
  )
}

/* --------------------------------------------------------------- file types --- */

const TYPES: { type: FileCardType; name: string }[] = [
  { type: "pdf", name: "document.pdf" },
  { type: "image", name: "photo.png" },
  { type: "video", name: "clip.mp4" },
  { type: "audio", name: "track.mp3" },
  { type: "doc", name: "letter.docx" },
  { type: "sheet", name: "budget.xlsx" },
  { type: "slides", name: "deck.pptx" },
  { type: "archive", name: "assets.zip" },
  { type: "code", name: "index.tsx" },
  { type: "text", name: "notes.txt" },
]

/** The real extension, stamped on the band via FileCardIcon's `label` override. */
const extOf = (name: string) => name.split(".").pop()!.toUpperCase()

export function FileTypesDemo() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {TYPES.map(({ type, name }) => (
        <FileCard key={type}>
          <FileCardIcon type={type} label={extOf(name)} />
          <FileCardContent>
            <FileCardName>{name}</FileCardName>
            <FileCardMeta className="uppercase">{type}</FileCardMeta>
          </FileCardContent>
        </FileCard>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- thumbnail --- */

export function ThumbnailDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileCard>
        <FileCardThumbnail
          src="https://images.unsplash.com/photo-1503602642458-232111445657?w=200&q=80"
          alt="Mountain landscape"
        />
        <FileCardContent>
          <FileCardName>mountain-vista.jpg</FileCardName>
          <FileCardMeta>1.8 MB · 2400 × 1600</FileCardMeta>
        </FileCardContent>
        <FileCardActions>
          <Button variant="ghost" size="sm" iconOnly aria-label="Remove">
            <Trash weight="bold" />
          </Button>
        </FileCardActions>
      </FileCard>

      <FileCard>
        <FileCardThumbnail
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80"
          alt="Circuit board"
        />
        <FileCardContent>
          <FileCardName>circuit-closeup.jpg</FileCardName>
          <FileCardMeta>2.1 MB · 3000 × 2000</FileCardMeta>
        </FileCardContent>
        <FileCardActions>
          <Button variant="ghost" size="sm" iconOnly aria-label="Remove">
            <Trash weight="bold" />
          </Button>
        </FileCardActions>
      </FileCard>
    </div>
  )
}

/* ---------------------------------------------------------------- progress --- */

export function ProgressDemo() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    // Loop a fake upload so the bar visibly fills; reset and run again.
    function tick() {
      setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 4)))
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [])

  const done = progress >= 100

  return (
    <FileCard state={done ? "success" : "uploading"} className="w-full max-w-md">
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
    </FileCard>
  )
}

/* ------------------------------------------------------------------ states --- */

export function StatesDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileCard state="uploading">
        <FileCardIcon type="doc" />
        <FileCardContent>
          <FileCardName>contract-draft.docx</FileCardName>
          <FileCardProgress value={42} label="Uploading…" />
        </FileCardContent>
        <FileCardStatus />
      </FileCard>

      <FileCard state="success">
        <FileCardIcon type="doc" />
        <FileCardContent>
          <FileCardName>contract-final.docx</FileCardName>
          <FileCardMeta>312 KB · Uploaded</FileCardMeta>
        </FileCardContent>
        <FileCardStatus />
      </FileCard>

      <FileCard state="error">
        <FileCardIcon type="doc" />
        <FileCardContent>
          <FileCardName>contract-broken.docx</FileCardName>
          <FileCardMeta>File exceeds the 10 MB limit</FileCardMeta>
        </FileCardContent>
        <FileCardActions>
          <FileCardStatus />
          <Button variant="ghost" size="sm" iconOnly aria-label="Retry">
            <DownloadSimple weight="bold" />
          </Button>
        </FileCardActions>
      </FileCard>
    </div>
  )
}

/* ---------------------------------------------------------------- variants --- */

export function VariantsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {(["default", "outline", "elevated", "ghost"] as const).map((variant) => (
        <FileCard key={variant} variant={variant}>
          <FileCardIcon type={fileTypeFromName("brand-guidelines.pdf")} />
          <FileCardContent>
            <FileCardName>brand-guidelines.pdf</FileCardName>
            <FileCardMeta className="capitalize">{variant}</FileCardMeta>
          </FileCardContent>
        </FileCard>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- density --- */

export function DensityDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {(["compact", "comfortable"] as const).map((density) => (
        <FileCard key={density} density={density}>
          <FileCardIcon type="archive" />
          <FileCardContent>
            <FileCardName>design-assets.zip</FileCardName>
            <FileCardMeta className="capitalize">{density}</FileCardMeta>
          </FileCardContent>
        </FileCard>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- interactive --- */

export function InteractiveDemo() {
  return (
    <FileCard asChild interactive className="w-full max-w-md">
      <a href="#" onClick={(e) => e.preventDefault()}>
        <FileCardIcon type="pdf" />
        <FileCardContent>
          <FileCardName>Annual report 2025.pdf</FileCardName>
          <FileCardMeta>2.4 MB · Click to open</FileCardMeta>
        </FileCardContent>
        <FileCardActions>
          <DownloadSimple weight="bold" className="size-4 text-muted-foreground" />
        </FileCardActions>
      </a>
    </FileCard>
  )
}
