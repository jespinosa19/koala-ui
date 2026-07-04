"use client"

// Live tooltip demos live here, in a Client Component, so the trigger icons come from the
// interactive `@phosphor-icons/react` build. The docs page is a Server Component (it exports
// `metadata`); importing the regular icon build there throws (`createContext` in RSC), while
// the `/ssr` build resolves to `undefined` once Tippy re-renders the cloned trigger on the
// client. Keeping every interactive preview in this file sidesteps both. See [[tooltip-docs-page-rsc-crash]].

import {
  Info,
  Copy,
  FloppyDisk,
  Trash,
  PencilSimple,
  Question,
  Lock,
  FilePlus,
  MagnifyingGlass,
  GearSix,
  ChartBar,
  Clock,
  ChartPieSlice,
} from "@phosphor-icons/react"

import {
  Tooltip,
  TooltipGroup,
  TooltipHeader,
  TooltipHeaderText,
  TooltipTitle,
  TooltipDescription,
  TooltipValue,
  TooltipSeparator,
  TooltipSection,
  TooltipStat,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { InputRoot, InputField, InputSuffixButton } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Specimen } from "@/components/docs/foundation"

const PLACEMENTS = ["top", "right", "bottom", "left"] as const

export function HeroDemo() {
  return (
    <Button iconOnly aria-label="Save changes">
      <FloppyDisk weight="bold" />
    </Button>
  )
}

export function PlacementDemo() {
  return (
    <>
      {PLACEMENTS.map((placement) => (
        <Specimen key={placement} label={placement}>
          <Tooltip content="Tooltip" placement={placement}>
            <Button variant="outline" iconOnly tooltip={false} aria-label={placement}>
              <Info weight="bold" />
            </Button>
          </Tooltip>
        </Specimen>
      ))}
    </>
  )
}

export function VariantsDemo() {
  return (
    <>
      <Specimen label="text">
        <Tooltip content="Save changes" variant="text">
          <Button variant="outline" iconOnly tooltip={false} aria-label="Save changes">
            <FloppyDisk weight="bold" />
          </Button>
        </Tooltip>
      </Specimen>
      <Specimen label="graph">
        <Tooltip
          variant="graph"
          content={
            <div className="space-y-0.5">
              <div className="font-medium text-popover-foreground">Trail Runner GTX</div>
              <div className="text-muted-foreground">1,284 units · 100% of #1</div>
              <div className="text-muted-foreground">$92,448 revenue · +14% MoM</div>
            </div>
          }
        >
          <Button variant="outline" iconOnly tooltip={false} aria-label="Product stats">
            <ChartBar weight="bold" />
          </Button>
        </Tooltip>
      </Specimen>
    </>
  )
}

export function CapacityTooltipDemo() {
  return (
    <Tooltip
      variant="graph"
      placement="right"
      content={
        <>
          <TooltipHeader>
            <TooltipHeaderText>
              <TooltipTitle>Friday, Jul 5</TooltipTitle>
              <TooltipDescription>Total capacity</TooltipDescription>
            </TooltipHeaderText>
            <TooltipValue>08h 00m</TooltipValue>
          </TooltipHeader>
          <TooltipSeparator />
          <TooltipSection tone="info">
            <TooltipStat label="Tracked time" percent="40%" value="03h 09m" />
            <TooltipStat label="Billable" percent="79%" value="02h 30m" indent />
            <TooltipStat label="Non-billable" percent="21%" value="00h 39m" indent />
          </TooltipSection>
          <TooltipSection tone="neutral">
            <TooltipStat label="Remaining capacity" percent="60%" value="04h 50m" />
          </TooltipSection>
        </>
      }
    >
      <Button variant="outline" iconOnly tooltip={false} aria-label="Day capacity">
        <Clock weight="bold" />
      </Button>
    </Tooltip>
  )
}

export function ToneTooltipDemo() {
  return (
    <Tooltip
      variant="graph"
      placement="right"
      content={
        <>
          <TooltipHeader>
            <TooltipHeaderText>
              <TooltipTitle>Storage</TooltipTitle>
              <TooltipDescription>500 GB plan</TooltipDescription>
            </TooltipHeaderText>
            <TooltipValue>318 GB</TooltipValue>
          </TooltipHeader>
          <TooltipSeparator />
          <TooltipSection tone="success">
            <TooltipStat label="Documents" percent="22%" value="070 GB" />
          </TooltipSection>
          <TooltipSection tone="warning">
            <TooltipStat label="Media" percent="49%" value="156 GB" />
          </TooltipSection>
          <TooltipSection tone="destructive">
            <TooltipStat label="Backups" percent="29%" value="092 GB" />
          </TooltipSection>
        </>
      }
    >
      <Button variant="outline" iconOnly tooltip={false} aria-label="Storage breakdown">
        <ChartPieSlice weight="bold" />
      </Button>
    </Tooltip>
  )
}

export function IconContentDemo() {
  return (
    <Tooltip
      content={
        <>
          <Copy weight="bold" className="size-3.5" /> Copy to clipboard
        </>
      }
    >
      <Button variant="ghost" iconOnly tooltip={false} aria-label="Copy">
        <Copy weight="bold" />
      </Button>
    </Tooltip>
  )
}

export function InteractiveDemo() {
  return (
    <Tooltip
      interactive
      delay={[150, 80]}
      content={
        <>
          Read the{" "}
          <a href="/docs" className="underline underline-offset-2">
            docs
          </a>
        </>
      }
    >
      <Button variant="outline" iconOnly tooltip={false} aria-label="More info">
        <Info weight="bold" />
      </Button>
    </Tooltip>
  )
}

export function GroupDemo() {
  return (
    <TooltipGroup>
      <Tooltip content="Edit" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Edit">
          <PencilSimple weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Copy" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Copy">
          <Copy weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Save" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Save">
          <FloppyDisk weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Delete" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Delete">
          <Trash weight="bold" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}

export function FormInputDemo() {
  return (
    <div className="w-72 space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">API key</label>
        <InputRoot>
          <InputField placeholder="sk-…" />
          <Tooltip content="Your secret key - never share this publicly">
            <InputSuffixButton aria-label="API key help">
              <Question weight="bold" />
            </InputSuffixButton>
          </Tooltip>
        </InputRoot>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Webhook URL</label>
        <InputRoot>
          <InputField placeholder="https://…" />
          <Tooltip content="Must be HTTPS and return 200 within 5 s" placement="right">
            <InputSuffixButton aria-label="Webhook URL requirements">
              <Info weight="bold" />
            </InputSuffixButton>
          </Tooltip>
        </InputRoot>
      </div>
    </div>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Create webhook</DialogTitle>
          <DialogDescription>
            Koala will POST a JSON payload to this URL on each event.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium">Endpoint URL</label>
              <Tooltip content="Must be HTTPS and publicly reachable" trigger="mouseenter">
                <button
                  type="button"
                  aria-label="Endpoint URL help"
                  className="rounded text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                >
                  <Info weight="bold" className="size-3.5" />
                </button>
              </Tooltip>
            </div>
            <InputRoot>
              <InputField placeholder="https://…" />
            </InputRoot>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium">Secret</label>
              <Tooltip
                content="Signs the X-Koala-Signature header"
                placement="right"
                trigger="mouseenter"
              >
                <button
                  type="button"
                  aria-label="Secret help"
                  className="rounded text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
                >
                  <Lock weight="bold" className="size-3.5" />
                </button>
              </Tooltip>
            </div>
            <InputRoot>
              <InputField placeholder="whsec_…" />
            </InputRoot>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Create webhook</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function KeyboardShortcutDemo() {
  return (
    <TooltipGroup>
      <Tooltip
        placement="bottom"
        content={
          <>
            New file <Kbd variant="soft" size="sm" className="ml-1">⌘N</Kbd>
          </>
        }
      >
        <Button variant="ghost" iconOnly tooltip={false} aria-label="New file">
          <FilePlus weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip
        placement="bottom"
        content={
          <>
            Search <Kbd variant="soft" size="sm" className="ml-1">⌘K</Kbd>
          </>
        }
      >
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Search">
          <MagnifyingGlass weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip
        placement="bottom"
        content={
          <>
            Settings <Kbd variant="soft" size="sm" className="ml-1">⌘,</Kbd>
          </>
        }
      >
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Settings">
          <GearSix weight="bold" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}

export function ShiftAwayDemo() {
  return (
    <Tooltip content="Shift-away on exit" placement="top">
      <Button variant="outline" iconOnly tooltip={false} aria-label="Info">
        <Info weight="bold" />
      </Button>
    </Tooltip>
  )
}

export function GlideDemo() {
  return (
    <TooltipGroup>
      <Tooltip content="Edit" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Edit">
          <PencilSimple weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Copy" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Copy">
          <Copy weight="bold" />
        </Button>
      </Tooltip>
      <Tooltip content="Save" placement="top">
        <Button variant="ghost" iconOnly tooltip={false} aria-label="Save">
          <FloppyDisk weight="bold" />
        </Button>
      </Tooltip>
    </TooltipGroup>
  )
}
