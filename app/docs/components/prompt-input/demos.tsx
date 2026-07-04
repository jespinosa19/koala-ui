"use client"

import * as React from "react"
import {
  Paperclip,
  Sparkle,
  Globe,
  Brain,
  Plus,
  Microphone,
  Binoculars,
  CaretDown,
  Image as ImageIcon,
  SlidersHorizontal,
  PaintBrush,
  Code,
  TextAlignLeft,
  ArrowBendUpLeft,
  ListChecks,
  Lightbulb,
  Translate,
  Lightning,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputCount,
  PromptInputBanner,
  PromptInputBannerAction,
  PromptInputSuggestions,
  PromptInputSuggestion,
} from "@/components/ui/prompt-input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

const MODELS: Record<string, string> = {
  opus: "Opus 4.8",
  sonnet: "Sonnet 4.6",
  haiku: "Haiku 4.5",
}

/**
 * The model picker. Its trigger is a `PromptInputButton` (a ghost Button), so it hovers,
 * presses, and sizes exactly like every other control on the bar. A Select trigger is a
 * form-field recipe (border highlight on hover, no bg transition) and would read differently.
 * A DropdownMenu radio group supplies the choices with the native check convention.
 */
function ModelPicker() {
  const [model, setModel] = React.useState("opus")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* `static` drops the press-scale: this opens a menu, and dropdown triggers don't
            scale on press (only true tactile actions do, like the other toolbar buttons). */}
        <PromptInputButton
          static
          aria-label="Model"
          className="gap-1.5 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        >
          <Sparkle weight="bold" /> {MODELS[model]} <CaretDown weight="bold" className="size-4 opacity-60" />
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
          <DropdownMenuRadioItem value="opus">
            <Sparkle weight="bold" /> Opus 4.8
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="sonnet">
            <Sparkle weight="bold" /> Sonnet 4.6
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="haiku">
            <Sparkle weight="bold" /> Haiku 4.5
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The "+" add button: opens a menu to attach a photo or a file. Like the model picker, its
 * trigger is a `PromptInputButton` (so it matches the bar) with `static` (a menu trigger, no
 * press-scale) and `tooltip={false}` (the menu is the affordance, and an auto-tooltip would
 * fight the `asChild` trigger).
 */
function AddMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PromptInputButton
          static
          iconOnly
          tooltip={false}
          aria-label="Add photos & files"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        >
          <Plus weight="bold" />
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <ImageIcon weight="bold" /> Add photo
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Paperclip weight="bold" /> Add files
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Active-tool styling for the trigger: a soft brand tint so an enabled tool reads
// at a glance, without a competing filled control.
const activeTool = "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"

// The composer's tools, each a distinct glyph. Mutually exclusive: at most one is active at a
// time, so picking one clears the others (re-picking the active one turns it off). They live in
// a menu with the check on the right, the menu convention.
const TOOLS = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "canvas", label: "Canvas", icon: PaintBrush },
  { id: "web", label: "Web research", icon: Globe },
  { id: "deep", label: "Deep research", icon: Binoculars },
  { id: "code", label: "Code interpreter", icon: Code },
] as const

/**
 * The tools picker: one dropdown that gathers every optional capability (image, canvas, web /
 * deep research, code) instead of one toggle button per tool crowding the bar. Only one tool runs
 * at a time, so picking one clears the others and re-picking the active one turns it off (at most
 * one active). Its trigger is a `PromptInputButton` so it matches the rest of the bar; `compact`
 * collapses it to icon-only for the minimal layout. Rather than a generic "Tools" label, the
 * trigger names what's actually on: the active tool's own icon + label, falling back to the
 * neutral "Tools" affordance (and a brand tint) so the state always reads at a glance.
 */
function ToolsMenu({ compact = false }: { compact?: boolean }) {
  // At most one tool active: a single id, or null when none is on.
  const [active, setActive] = React.useState<string | null>("deep")
  const select = (id: string) => (checked: boolean) => setActive(checked ? id : null)

  const single = TOOLS.find((t) => t.id === active) ?? null
  // Name the active tool by its own icon + label, else fall back to the neutral "Tools" affordance.
  const TriggerIcon = single ? single.icon : SlidersHorizontal
  const triggerLabel = single?.label ?? "Tools"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* `static` (a menu trigger, no press-scale); `tooltip={false}` so the auto-tooltip
            doesn't fight the `asChild` trigger (the `aria-label` carries the accessible name). */}
        <PromptInputButton
          static
          iconOnly={compact}
          tooltip={false}
          aria-label={single ? `Tools: ${triggerLabel}` : "Tools"}
          className={cn(
            "gap-1.5 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            single && activeTool,
          )}
        >
          <TriggerIcon weight="bold" />
          {!compact && (
            <>
              {triggerLabel}
              <CaretDown weight="bold" className="size-4 opacity-60" />
            </>
          )}
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Tools</DropdownMenuLabel>
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <DropdownMenuCheckboxItem
            key={id}
            checked={active === id}
            onCheckedChange={select(id)}
          >
            <Icon weight="bold" /> {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PromptInputDemo() {
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Cleanup-only effect (no state set in the body): safe under the repo's strict hooks lint.
  React.useEffect(() => () => clearTimeout(timer.current), [])

  function handleSubmit() {
    setLoading(true)
    timer.current = setTimeout(() => setLoading(false), 2200)
  }
  function handleStop() {
    clearTimeout(timer.current)
    setLoading(false)
  }

  return (
    <PromptInput
      className="w-full max-w-xl"
      loading={loading}
      onSubmit={handleSubmit}
      onStop={handleStop}
    >
      <PromptInputTextarea placeholder="Ask Koala anything…" />
      <PromptInputToolbar>
        <AddMenu />
        <ModelPicker />
        <ToolsMenu />
        {/* gap-0.5 (2px) so the filled send button never butts flush against the ghost mic. */}
        <div className="ml-auto flex items-center gap-0.5">
          <PromptInputButton iconOnly aria-label="Dictate">
            <Microphone weight="bold" />
          </PromptInputButton>
          <PromptInputSubmit className="ml-0" />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}

export function StreamingDemo() {
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function handleSubmit() {
    setLoading(true)
    timer.current = setTimeout(() => setLoading(false), 4000)
  }

  return (
    <PromptInput
      className="w-full max-w-xl"
      defaultValue="Write a haiku about koalas in the eucalyptus."
      loading={loading}
      onSubmit={handleSubmit}
      onStop={() => {
        clearTimeout(timer.current)
        setLoading(false)
      }}
    >
      <PromptInputTextarea placeholder="Send a message, then watch the button turn into stop…" />
      <PromptInputToolbar>
        <PromptInputButton>
          <Globe weight="bold" /> Search
        </PromptInputButton>
        <PromptInputButton>
          <Brain weight="bold" /> Reason
        </PromptInputButton>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}

export function SizesDemo() {
  const sizes = ["sm", "md", "lg"] as const
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      {sizes.map((size) => (
        <PromptInput key={size} size={size}>
          <PromptInputTextarea placeholder={`Size "${size}", ask anything…`} />
          <PromptInputToolbar>
            <PromptInputButton iconOnly aria-label="Add photos & files">
              <Plus weight="bold" />
            </PromptInputButton>
            <ModelPicker />
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      ))}
    </div>
  )
}

export function SuggestionsDemo() {
  const [value, setValue] = React.useState("")
  // Each starter carries its own glyph (not a generic sparkle), so the row reads as a set of
  // distinct actions. The chips are secondary-filled, so the icons stay monochrome and the shape
  // does the differentiating.
  const suggestions = [
    { label: "Summarize this thread", icon: TextAlignLeft },
    { label: "Draft a polite reply", icon: ArrowBendUpLeft },
    { label: "Find the action items", icon: ListChecks },
    { label: "Explain it simply", icon: Lightbulb },
    { label: "Translate to Spanish", icon: Translate },
    { label: "Brainstorm ideas", icon: Lightning },
  ]
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <PromptInputSuggestions>
        {suggestions.map(({ label, icon: Icon }) => (
          <PromptInputSuggestion key={label} onClick={() => setValue(label)}>
            <Icon weight="bold" /> {label}
          </PromptInputSuggestion>
        ))}
      </PromptInputSuggestions>
      <PromptInput value={value} onValueChange={setValue} onSubmit={() => setValue("")}>
        <PromptInputTextarea placeholder="Pick a starter or type your own…" />
        <PromptInputToolbar>
          <PromptInputButton iconOnly aria-label="Attach file">
            <Paperclip weight="bold" />
          </PromptInputButton>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}

export function BannerDemo() {
  // The banner owns its own dismissed state; restore it when the model switches back, etc.
  const [open, setOpen] = React.useState(true)
  return (
    // `isolate` keeps the banner's negative z local; the composer stays a complete card on top.
    <div className="flex w-full max-w-xl flex-col isolate">
      {open && (
        <PromptInputBanner side="top" tone="warning" onClose={() => setOpen(false)}>
          Fable 5 is unavailable right now.
          <PromptInputBannerAction className="ml-auto">Learn more</PromptInputBannerAction>
        </PromptInputBanner>
      )}
      {/* shadow-md lifts the composer so its shadow falls on the strip sliding under it. */}
      <PromptInput onSubmit={() => {}} className="shadow-md">
        <PromptInputTextarea placeholder="How can I help you today?" />
        <PromptInputToolbar>
          <PromptInputButton iconOnly aria-label="Add photos & files">
            <Plus weight="bold" />
          </PromptInputButton>
          <ModelPicker />
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}

export function BannerBottomDemo() {
  const [open, setOpen] = React.useState(true)
  return (
    // `isolate` keeps the banner's negative z local; the composer stays a complete card on top.
    <div className="flex w-full max-w-xl flex-col isolate">
      {/* shadow-md lifts the composer so its shadow falls on the strip sliding under it. */}
      <PromptInput onSubmit={() => {}} className="shadow-md">
        <PromptInputTextarea placeholder="How can I help you today?" />
        <PromptInputToolbar>
          <PromptInputButton iconOnly aria-label="Add photos & files">
            <Plus weight="bold" />
          </PromptInputButton>
          <ModelPicker />
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInput>
      {open && (
        <PromptInputBanner side="bottom" icon={<Sparkle weight="bold" />} onClose={() => setOpen(false)}>
          Get better answers from your apps.
          <PromptInputBannerAction className="ml-auto">Connect</PromptInputBannerAction>
        </PromptInputBanner>
      )}
    </div>
  )
}

export function CountDemo() {
  return (
    <PromptInput className="w-full max-w-xl" defaultValue="A serene koala napping on a branch, soft morning light">
      <PromptInputTextarea placeholder="Describe the image you want…" />
      <PromptInputToolbar>
        <PromptInputButton iconOnly aria-label="Attach file">
          <Paperclip weight="bold" />
        </PromptInputButton>
        <div className="ml-auto flex items-center gap-2">
          <PromptInputCount max={500} />
          <PromptInputSubmit className="ml-0" />
        </div>
      </PromptInputToolbar>
    </PromptInput>
  )
}

export function MinimalDemo() {
  const [model, setModel] = React.useState("opus")
  const [loading, setLoading] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function handleSubmit() {
    setLoading(true)
    timer.current = setTimeout(() => setLoading(false), 2000)
  }

  return (
    <PromptInput
      className="w-full max-w-xl"
      loading={loading}
      onSubmit={handleSubmit}
      onStop={() => {
        clearTimeout(timer.current)
        setLoading(false)
      }}
    >
      <PromptInputTextarea placeholder="Ask Koala anything…" />
      <PromptInputToolbar>
        {/* Each group is its own compact icon dropdown, so the bar stays to icons + send. */}

        {/* Attachments */}
        <AddMenu />

        {/* Model */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <PromptInputButton
              static
              iconOnly
              tooltip={false}
              aria-label="Model"
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
            >
              <Sparkle weight="bold" />
            </PromptInputButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Model</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
              <DropdownMenuRadioItem value="opus">
                <Sparkle weight="bold" /> Opus 4.8
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sonnet">
                <Sparkle weight="bold" /> Sonnet 4.6
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="haiku">
                <Sparkle weight="bold" /> Haiku 4.5
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tools */}
        <ToolsMenu compact />

        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}
