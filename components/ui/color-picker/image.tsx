"use client"

import * as React from "react"
import { ImageSquare, UploadSimple, X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { InputField, InputPrefix, InputRoot } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { CHECKER_STYLE, useColorPickerContext, type ColorPickerImageFit } from "./context"

// ─── ColorPickerImage (upload / URL fill) ───────────────────────────────────────────

/** The image fill: an upload dropzone (or live preview once chosen), a URL field, and a fit toggle. */
export function ColorPickerImage({ className }: { className?: string }) {
  const { image, setImage, slots } = useColorPickerContext("ColorPickerImage")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [urlDraft, setUrlDraft] = React.useState("")

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    const onLoad = () => setImage({ src: String(reader.result) })
    reader.onload = onLoad
    reader.readAsDataURL(file)
    // Clear so re-picking the same file fires `change` again.
    e.target.value = ""
  }

  function commitUrl() {
    const next = urlDraft.trim()
    if (next) setImage({ src: next })
  }

  return (
    <div data-slot="color-picker-image" className={cn("flex flex-col gap-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        aria-hidden
        tabIndex={-1}
      />

      {image.src ? (
        <div className={slots.imagePreview()} style={CHECKER_STYLE}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            className={cn("size-full", image.fit === "cover" ? "object-cover" : "object-contain")}
          />
          <button
            type="button"
            className={slots.imageRemove()}
            onClick={() => setImage({ src: "" })}
            aria-label="Remove image"
          >
            <X weight="bold" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={slots.imageDropzone()}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadSimple weight="bold" />
          <span className="text-sm font-medium text-foreground">Upload image</span>
          <span className="text-xs">or paste a URL below</span>
        </button>
      )}

      <div className={slots.inputRow()}>
        <InputRoot size="sm" className="flex-1">
          <InputPrefix>
            <ImageSquare weight="bold" className="size-4" />
          </InputPrefix>
          <InputField
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={commitUrl}
            onKeyDown={(e) => e.key === "Enter" && commitUrl()}
            placeholder="https://…"
            spellCheck={false}
            autoComplete="off"
            aria-label="Image URL"
          />
        </InputRoot>
      </div>

      {image.src && (
        <ToggleGroup
          type="single"
          size="sm"
          value={image.fit}
          onValueChange={(next) => next && setImage({ fit: next as ColorPickerImageFit })}
          className={slots.modes()}
          aria-label="Image fit"
        >
          <ToggleGroupItem value="cover" className={slots.modeItem()}>
            Cover
          </ToggleGroupItem>
          <ToggleGroupItem value="contain" className={slots.modeItem()}>
            Contain
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  )
}
