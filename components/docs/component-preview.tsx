"use client"

import * as React from "react"
import { Eye, Code, ArrowSquareOut } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { CodeSnippet } from "./code-snippet"
import { PremiumCode } from "./premium-code"

interface ComponentPreviewProps {
  /** The live, rendered example. */
  children: React.ReactNode
  /** Source for the example, shown under the "Code" tab. */
  code: string
  filename?: string
  /** Extra classes for the preview stage (e.g. layout for the demo). */
  previewClassName?: string
  /**
   * Gate the source: keep the live preview but replace the "Code" tab with the PRO
   * "Get full code" lock. Use on paid (PRO) docs pages: see PremiumCode.
   */
  locked?: boolean
  /**
   * When set, shows an "open in new tab" button that links to a full-screen preview route. Use
   * for full-page screens (auth pages, app shells) that are cramped in the docs preview pane.
   */
  fullscreenHref?: string
}

export function ComponentPreview({
  children,
  code,
  filename,
  previewClassName,
  locked = false,
  fullscreenHref,
}: ComponentPreviewProps) {
  // When locked, the Code tab is the PremiumCode gate, which sizes to its own (short) content
  // while the Preview sizes to the demo. Measure the Preview panel and pass its height to the
  // gate so switching tabs never jumps. Radix unmounts the inactive panel, so we read the
  // height while Preview is mounted; a callback ref re-attaches the observer across remounts.
  const [previewHeight, setPreviewHeight] = React.useState<number>()
  const measurePreview = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const update = () => setPreviewHeight(node.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  return (
    <Tabs defaultValue="preview" className="my-6">
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="preview"><Eye weight="bold" />Preview</TabsTrigger>
          <TabsTrigger value="code"><Code weight="bold" />Code</TabsTrigger>
        </TabsList>

        {fullscreenHref && (
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <a href={fullscreenHref} target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut weight="bold" />
              Full screen
            </a>
          </Button>
        )}
      </div>

      <TabsContent
        value="preview"
        // Radix Tabs.Content defaults to tabIndex={0}; the docs preview always holds its own
        // focusable content, so keep the panel itself out of the tab order (no stray focus ring).
        tabIndex={-1}
        // Only measure when the Code tab is gated: that's the only case the height must match.
        ref={locked ? measurePreview : undefined}
        className="rounded-lg border border-border bg-background"
      >
        <div
          className={cn(
            "flex min-h-50 flex-wrap items-center justify-center gap-4 p-10",
            previewClassName,
          )}
        >
          {children}
        </div>
      </TabsContent>

      <TabsContent value="code" tabIndex={-1}>
        {locked ? (
          <PremiumCode style={previewHeight ? { minHeight: previewHeight } : undefined} />
        ) : (
          // Collapse long examples behind a Show more / Show less pill. It self-gates, so short
          // snippets render in full and only the tall ones (cookie-consent, data-table) clamp.
          <CodeSnippet code={code} filename={filename} collapsible />
        )}
      </TabsContent>
    </Tabs>
  )
}
