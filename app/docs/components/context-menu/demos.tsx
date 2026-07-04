"use client"

import {
  ArrowsOutCardinal,
  ChatCircle,
  Copy,
  CornersOut,
  DownloadSimple,
  Envelope,
  FolderOpen,
  ImageSquare,
  Link,
  PencilSimple,
  PushPin,
  ShareNetwork,
  Star,
  TextAa,
  Trash,
} from "@phosphor-icons/react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuGroup,
} from "@/components/ui/context-menu"

/* ── Hero: right-click a card ──────────────────────────────────────────────
   The headline use case. The whole Card is the trigger via `asChild`, so a
   right-click (or long-press on touch) anywhere on it opens the action menu. */
export function CardContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className="w-72 cursor-default select-none transition-shadow duration-fast ease-out hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple">
                <FolderOpen weight="bold" className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">Q3 Marketing Plan</CardTitle>
                <CardDescription>Edited 2 hours ago · 14 files</CardDescription>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Right-click to open the menu</p>
          </CardHeader>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          <FolderOpen weight="bold" /> Open
          <ContextMenuShortcut>⏎</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <PencilSimple weight="bold" /> Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy weight="bold" /> Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <PushPin weight="bold" /> Pin to top
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareNetwork weight="bold" /> Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>
              <Envelope weight="bold" /> Email
            </ContextMenuItem>
            <ContextMenuItem>
              <Link weight="bold" /> Copy link
              <ContextMenuShortcut>⌘L</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <ChatCircle weight="bold" /> Send message
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash weight="bold" /> Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/* ── Any surface as the trigger ────────────────────────────────────────────
   An image is the classic right-click target. The Trigger is `asChild` over
   the figure, so the menu anchors to the cursor anywhere inside it. */
export function ImageContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <figure className="group relative aspect-[3/2] w-72 cursor-default select-none overflow-hidden rounded-xl border border-border shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/koalaui/480/320"
            alt="Mountain landscape at dusk"
            className="size-full object-cover"
          />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs font-medium text-white">
            Right-click the image
          </figcaption>
        </figure>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>
          <CornersOut weight="bold" /> Open full size
        </ContextMenuItem>
        <ContextMenuItem>
          <ImageSquare weight="bold" /> Copy image
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Link weight="bold" /> Copy image address
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <DownloadSimple weight="bold" /> Save image
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Star weight="bold" /> Add to favorites
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/* ── Checkbox items ────────────────────────────────────────────────────────
   Toggle independent view options straight from the menu. */
export function ViewContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-40 w-72 cursor-default select-none items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Right-click the canvas
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>View</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Show grid</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked>Snap to grid</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Rulers</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Pixel preview</ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/* ── Radio items ───────────────────────────────────────────────────────────
   A mutually exclusive choice (sort order) inside a radio group. */
export function SortContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-40 w-72 cursor-default select-none items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Right-click to sort
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel>Sort by</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="modified">
          <ContextMenuRadioItem value="name">
            <TextAa weight="bold" /> Name
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="modified">
            <PencilSimple weight="bold" /> Last modified
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="size">
            <ArrowsOutCardinal weight="bold" /> Size
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/* ── Groups, submenus & shortcuts ──────────────────────────────────────────
   A fuller editor-style menu showing grouping, a nested submenu, and Kbd hints. */
export function EditorContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-40 w-72 cursor-text select-none items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Right-click the editor
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuItem>
            <Copy weight="bold" /> Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <PencilSimple weight="bold" /> Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareNetwork weight="bold" /> Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>
              <Envelope weight="bold" /> Email link
            </ContextMenuItem>
            <ContextMenuItem>
              <Link weight="bold" /> Copy link
              <ContextMenuShortcut>⌘L</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <ChatCircle weight="bold" /> Messages
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash weight="bold" /> Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
