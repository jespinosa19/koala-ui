"use client"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  BellSimple,
  Gear,
  PencilSimple,
  SignOut,
  Trash,
  UserCircle,
  ShareNetwork,
  FilePlus,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { TooltipGroup } from "@/components/ui/tooltip"

export function SelectPlanDemo() {
  return (
    <Select defaultValue="free">
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="enterprise">Enterprise</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function DropdownActionsDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">My account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Alex Johnson</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserCircle weight="bold" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Gear weight="bold" /> Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellSimple weight="bold" /> Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <SignOut weight="bold" /> Log out
          <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function WrongDropdownAsSelectDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Plan</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuItem>Free</DropdownMenuItem>
        <DropdownMenuItem>Pro</DropdownMenuItem>
        <DropdownMenuItem>Enterprise</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DialogDeleteDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent size="sm" showClose={false}>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and all its data. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ToastSaveDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("Changes saved.", {
          description: "Your profile has been updated.",
        })
      }
    >
      Save changes
    </Button>
  )
}

export function TooltipToolbarDemo() {
  return (
    <TooltipGroup>
      <div className="flex items-center gap-0.5 rounded-lg border border-border p-1">
        <Button variant="ghost" size="sm" iconOnly aria-label="New file">
          <FilePlus weight="bold" />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Rename">
          <PencilSimple weight="bold" />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Share">
          <ShareNetwork weight="bold" />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Settings">
          <Gear weight="bold" />
        </Button>
        <Button variant="ghost" size="sm" iconOnly aria-label="Delete">
          <Trash weight="bold" />
        </Button>
      </div>
    </TooltipGroup>
  )
}

export function TabularNumsDemo() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setCount(c => (c + 1) % 100), 600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex gap-12 items-end">
      <div className="space-y-3 text-center">
        <span
          className="block text-5xl font-semibold"
          style={{ fontVariantNumeric: "proportional-nums" }}
        >
          {count}
        </span>
        <p className="text-xs text-muted-foreground">Proportional</p>
      </div>
      <div className="space-y-3 text-center">
        <span className="block text-5xl font-semibold tabular-nums">{count}</span>
        <p className="text-xs text-muted-foreground">Tabular</p>
      </div>
    </div>
  )
}

export function ConcentricRadiusDemo() {
  return (
    <div className="flex gap-10 items-start">
      <div className="space-y-2">
        {/* outer rounded-2xl (16px) − gap p-2 (8px) = inner rounded-lg (8px) ✓ */}
        <div className="rounded-2xl border border-border bg-muted/50 p-2">
          <div className="flex min-h-16 items-center justify-center rounded-lg bg-background px-6">
            <span className="text-xs text-muted-foreground">content</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">Concentric ✓</p>
      </div>
      <div className="space-y-2">
        {/* outer rounded-lg (8px) but inner rounded-2xl (16px) - radii fight each other */}
        <div className="rounded-lg border border-border bg-muted/50 p-2">
          <div className="flex min-h-16 items-center justify-center rounded-2xl bg-background px-6">
            <span className="text-xs text-muted-foreground">content</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">Mismatched ✗</p>
      </div>
    </div>
  )
}

export function IconAnimationDemo() {
  return (
    <div className="flex gap-10 items-center">
      <div className="space-y-3 text-center">
        <button className="group flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted">
          Edit
          <PencilSimple
            weight="bold"
            size={14}
            className="opacity-0 group-hover:opacity-100"
          />
        </button>
        <p className="text-xs text-muted-foreground">Opacity only</p>
      </div>
      <div className="space-y-3 text-center">
        <button className="group flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted">
          Edit
          <PencilSimple
            weight="bold"
            size={14}
            className="opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform] duration-200"
          />
        </button>
        <p className="text-xs text-muted-foreground">Opacity + scale</p>
      </div>
    </div>
  )
}

export function ShadowVsBorderDemo() {
  return (
    <div className="flex gap-10 items-start">
      <div className="space-y-3 text-center">
        <div className="w-32 rounded-xl border border-border bg-card p-4">
          <div className="mb-2 h-2 w-3/4 rounded bg-muted" />
          <div className="h-2 w-1/2 rounded bg-muted" />
        </div>
        <p className="text-xs text-muted-foreground">Solid border</p>
      </div>
      <div className="space-y-3 text-center">
        <div className="w-32 rounded-xl bg-card p-4 shadow-md">
          <div className="mb-2 h-2 w-3/4 rounded bg-muted" />
          <div className="h-2 w-1/2 rounded bg-muted" />
        </div>
        <p className="text-xs text-muted-foreground">Layered shadows</p>
      </div>
    </div>
  )
}

export function ImageOutlineDemo() {
  return (
    <div className="flex gap-10 items-end">
      <div className="space-y-3 text-center">
        <div className="size-20 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600" />
        <p className="text-xs text-muted-foreground">Without</p>
      </div>
      <div className="space-y-3 text-center">
        <div
          className="size-20 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600"
          style={{ outline: "1px solid rgba(0,0,0,0.1)", outlineOffset: "-1px" }}
        />
        <p className="text-xs text-muted-foreground">With 1px inset outline</p>
      </div>
    </div>
  )
}

export function TextWrapDemo() {
  return (
    <div className="flex gap-10">
      <div className="max-w-[7.5rem] space-y-2">
        <p className="text-xs text-muted-foreground">Default</p>
        <h3 className="text-sm font-semibold leading-snug">
          Ship better products faster
        </h3>
      </div>
      <div className="max-w-[7.5rem] space-y-2">
        <p className="text-xs text-muted-foreground">text-balance</p>
        <h3 className="text-balance text-sm font-semibold leading-snug">
          Ship better products faster
        </h3>
      </div>
    </div>
  )
}

export function AntialiasingDemo() {
  return (
    <div className="flex gap-10 items-center">
      <div className="space-y-3 text-center">
        <p className="text-4xl font-semibold subpixel-antialiased">Ag</p>
        <p className="text-xs text-muted-foreground">subpixel</p>
      </div>
      <div className="space-y-3 text-center">
        <p className="text-4xl font-semibold antialiased">Ag</p>
        <p className="text-xs text-muted-foreground">antialiased</p>
      </div>
    </div>
  )
}

export function InterruptibleAnimationDemo() {
  return (
    <div className="w-56 space-y-6">
      {/* Keyframe: animation is removed on mouse-out → snaps back to 0% */}
      <style>{`
        @keyframes koala-bar { from { width: 0% } to { width: 100% } }
        .koala-kf:hover .koala-kf-fill { animation: koala-bar 1.6s ease-out forwards; }
      `}</style>
      <div className="space-y-2">
        <div className="koala-kf h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted">
          <div className="koala-kf-fill h-full w-0 rounded-full bg-primary" />
        </div>
        <p className="text-xs text-muted-foreground">Keyframe - hover out mid-way</p>
      </div>
      {/* Transition: reverses from wherever it currently is */}
      <div className="space-y-2">
        <div className="group h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted">
          <div className="h-full w-0 rounded-full bg-primary transition-[width] duration-[1600ms] ease-out group-hover:w-full" />
        </div>
        <p className="text-xs text-muted-foreground">Transition - hover out mid-way</p>
      </div>
    </div>
  )
}

export function StaggeredEnterDemo() {
  const [visible, setVisible] = useState(false)
  const items = ["Typography", "Spacing", "Color", "Motion"]

  return (
    <div className="w-44 space-y-3">
      <button
        onClick={() => setVisible(v => !v)}
        className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted active:scale-[0.96]"
      >
        {visible ? "Reset" : "Animate in"}
      </button>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div
            key={item}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
            style={{
              opacity: visible ? 1 : 0,
              transform: `translateY(${visible ? 0 : 10}px)`,
              transition: `opacity ${visible ? 350 : 180}ms ease, transform ${visible ? 350 : 180}ms ease`,
              transitionDelay: visible ? `${i * 75}ms` : "0ms",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export function OpticalAlignmentDemo() {
  const [optical, setOptical] = useState(false)
  const [showPadding, setShowPadding] = useState(false)

  const pl = 24
  const pr = optical ? 18 : 24

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Segmented control */}
      <div className="flex rounded-full border border-border p-0.5 text-sm">
        {(["Geometric", "Optical"] as const).map((label) => (
          <button
            key={label}
            onClick={() => setOptical(label === "Optical")}
            className={cn(
              "rounded-full px-3.5 py-1 font-medium transition-colors",
              optical === (label === "Optical")
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Button with padding breakdown */}
      <div className="flex h-9 items-center overflow-hidden rounded-full border border-border bg-card text-sm font-medium">
        <div
          className={cn(
            "flex h-full shrink-0 items-center justify-center text-[10px] font-mono",
            showPadding && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
          )}
          style={{ width: pl, transition: "background-color 200ms" }}
        >
          {showPadding && `${pl}px`}
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          Button <ArrowRight weight="bold" size={14} />
        </div>
        <div
          className={cn(
            "flex h-full shrink-0 items-center justify-center text-[10px] font-mono",
            showPadding && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
          )}
          style={{ width: pr, transition: "width 300ms ease, background-color 200ms" }}
        >
          {showPadding && `${pr}px`}
        </div>
      </div>

      {/* Show Padding checkbox */}
      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={showPadding}
          onChange={(e) => setShowPadding(e.target.checked)}
          className="accent-primary"
        />
        Show Padding
      </label>
    </div>
  )
}
