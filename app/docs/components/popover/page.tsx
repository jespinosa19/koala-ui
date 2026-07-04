import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  PopoverBasicDemo,
  PopoverFormDemo,
  PopoverArrowDemo,
  PopoverAlignDemo,
  PopoverCompactDemo,
  PopoverConfirmDemo,
  PopoverProfileDemo,
  PopoverShareDemo,
} from "./demos"
import {
  FeedbackCardDemo,
  FeedbackPopoverDemo,
  FeedbackInlineDemo,
} from "../toggle-group/toggle-group-examples-demo"

export const metadata = {
  title: "Popover",
}

export default function PopoverDocsPage() {
  return (
    <>
      <DocHeader
        title="Popover"
        description="A general-purpose floating surface over Radix Popover: focus management, dismiss, and collision-aware positioning. Hosts arbitrary content (forms, pickers, info cards) on the DS popover surface, with named parts and an exposed --surface so nested controls blend in."
      />

      <ComponentPreview code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-1">
      <PopoverTitle>Invite teammates</PopoverTitle>
      <PopoverDescription>
        Share this workspace with anyone on your team.
      </PopoverDescription>
    </div>
  </PopoverContent>
</Popover>`}>
        <PopoverBasicDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="popover" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
  )
}`}
        />
      </DocSection>

      <DocSection title="With a form">
        <p className="mt-4 text-pretty text-muted-foreground">
          The canonical use case. Because the content exposes{" "}
          <code className="font-mono text-sm">--surface</code>, nested{" "}
          <code className="font-mono text-sm">Input</code>s paint the panel surface rather than
          the page. Wrap actions in <code className="font-mono text-sm">PopoverClose</code> to
          dismiss on click.
        </p>
        <ComponentPreview code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline"><Gear /> Dimensions</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    {/* title + inputs */}
    <PopoverClose asChild>
      <Button size="sm">Save</Button>
    </PopoverClose>
  </PopoverContent>
</Popover>`}>
          <PopoverFormDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With arrow & close button">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">showArrow</code> for a pointer toward the
          trigger, and use <code className="font-mono text-sm">PopoverCloseButton</code> for a
          styled top-right dismiss.
        </p>
        <ComponentPreview code={`<PopoverContent showArrow className="w-64">
  <PopoverCloseButton aria-label="Close">×</PopoverCloseButton>
  <PopoverTitle>Heads up</PopoverTitle>
  <PopoverDescription>…</PopoverDescription>
</PopoverContent>`}>
          <PopoverArrowDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Alignment">
        <p className="mt-4 text-pretty text-muted-foreground">
          Control placement along the trigger with{" "}
          <code className="font-mono text-sm">align</code> (
          <code className="font-mono text-sm">start</code> ·{" "}
          <code className="font-mono text-sm">center</code> ·{" "}
          <code className="font-mono text-sm">end</code>) and{" "}
          <code className="font-mono text-sm">side</code> /{" "}
          <code className="font-mono text-sm">sideOffset</code>, all forwarded to Radix.
        </p>
        <ComponentPreview code={`<PopoverContent align="start">…</PopoverContent>
<PopoverContent align="center">…</PopoverContent>
<PopoverContent align="end">…</PopoverContent>`}>
          <PopoverAlignDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density</code> tunes the content padding:{" "}
          <code className="font-mono text-sm">compact</code> for dense application UI. It also
          cascades from a surrounding{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview code={`<PopoverContent density="compact">…</PopoverContent>`}>
          <PopoverCompactDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Confirm an action">
        <p className="mt-4 text-pretty text-muted-foreground">
          A lightweight inline confirm for a destructive action. The footer pairs a{" "}
          <code className="font-mono text-sm">ghost</code> Cancel with a{" "}
          <code className="font-mono text-sm">destructive</code> primary, each wrapped in{" "}
          <code className="font-mono text-sm">PopoverClose</code> so either choice dismisses.
        </p>
        <ComponentPreview code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline"><Trash /> Delete project</Button>
  </PopoverTrigger>
  <PopoverContent className="w-72">
    <PopoverTitle>Delete project?</PopoverTitle>
    <PopoverDescription>This permanently removes the project and all of its data.</PopoverDescription>
    <div className="flex justify-end gap-2">
      <PopoverClose asChild><Button variant="ghost" size="sm">Cancel</Button></PopoverClose>
      <PopoverClose asChild><Button variant="destructive" size="sm">Delete</Button></PopoverClose>
    </div>
  </PopoverContent>
</Popover>`}>
          <PopoverConfirmDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Profile card">
        <p className="mt-4 text-pretty text-muted-foreground">
          A richer surface: compose an <code className="font-mono text-sm">Avatar</code> with
          identity and actions for a hover-card style preview.
        </p>
        <ComponentPreview code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="sm">@katiep</Button>
  </PopoverTrigger>
  <PopoverContent className="w-72">
    <div className="flex items-center gap-3">
      <AvatarRoot size="lg">
        <AvatarImage src="https://i.pravatar.cc/160?img=5" alt="Katie Park" />
        <AvatarFallback>KP</AvatarFallback>
        <AvatarStatus variant="online" />
      </AvatarRoot>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">Katie Park</span>
        <span className="text-sm text-muted-foreground">@katiep</span>
      </div>
    </div>
    <div className="flex gap-2">
      <Button size="sm" className="flex-1">Follow</Button>
      <Button variant="outline" size="sm" className="flex-1">Message</Button>
    </div>
  </PopoverContent>
</Popover>`}>
          <PopoverProfileDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Share a link">
        <p className="mt-4 text-pretty text-muted-foreground">
          A read-only <code className="font-mono text-sm">Input</code> blends with the panel through{" "}
          <code className="font-mono text-sm">--surface</code>, and the copy button swaps to a
          confirmation for a beat after a click.
        </p>
        <ComponentPreview code={`const [copied, setCopied] = useState(false)

<PopoverContent className="w-80">
  <PopoverTitle>Share link</PopoverTitle>
  <PopoverDescription>Anyone with this link can view the project.</PopoverDescription>
  <div className="flex items-center gap-2">
    <InputRoot size="sm" className="flex-1">
      <InputField readOnly value="koalaui.com/s/9f3a2" />
    </InputRoot>
    <Button size="sm" className="shrink-0" onClick={copy}>
      {copied ? <><Check /> Copied</> : <><Copy /> Copy</>}
    </Button>
  </div>
</PopoverContent>`}>
          <PopoverShareDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Feedback prompt">
        <p className="mt-4 text-pretty text-muted-foreground">
          A common composition: pair the surface with a{" "}
          <code className="font-mono text-sm">ToggleGroup</code> for a {`"Was this useful?"`} rating.
          The control is its own label, so no inputs are needed. Shown here always visible as a card;
          the same content drops straight into a <code className="font-mono text-sm">PopoverContent</code>.
        </p>
        <ComponentPreview code={`<div className="rounded-xl border border-border bg-card p-4 shadow-sm [--surface:var(--card)]">
  <PopoverTitle className="text-base">Was this useful?</PopoverTitle>
  <PopoverDescription>How would you rate your overall experience?</PopoverDescription>
  <ToggleGroup type="single" size="sm" value={rating} onValueChange={setRating}>
    <ToggleGroupItem value="yes"><ThumbsUp />Yes</ToggleGroupItem>
    <ToggleGroupItem value="no"><ThumbsDown />No</ToggleGroupItem>
  </ToggleGroup>
</div>`}>
          <FeedbackCardDemo />
        </ComponentPreview>

        <p className="mt-6 text-pretty text-muted-foreground">
          A compact take drops the subtitle and swaps in a thank-you once answered.
        </p>
        <ComponentPreview code={`<div className="rounded-xl border border-border bg-card p-4 shadow-xs [--surface:var(--card)]">
  {answer ? (
    <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
  ) : (
    <>
      <p className="text-sm font-semibold">Was this useful?</p>
      <ToggleGroup type="single" size="sm" value={answer} onValueChange={setAnswer}>
        <ToggleGroupItem value="yes"><ThumbsUp />Yes</ToggleGroupItem>
        <ToggleGroupItem value="no"><ThumbsDown />No</ToggleGroupItem>
      </ToggleGroup>
    </>
  )}
</div>`}>
          <FeedbackInlineDemo />
        </ComponentPreview>

        <p className="mt-6 text-pretty text-muted-foreground">
          And floated in the popover itself, revealed from a trigger.
        </p>
        <ComponentPreview code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Was this useful?</Button>
  </PopoverTrigger>
  <PopoverContent align="start" className="w-auto">
    <PopoverTitle className="text-base">Was this useful?</PopoverTitle>
    <PopoverDescription>How would you rate your overall experience?</PopoverDescription>
    <ToggleGroup type="single" size="sm" value={rating} onValueChange={setRating}>
      <ToggleGroupItem value="yes"><ThumbsUp />Yes</ToggleGroupItem>
      <ToggleGroupItem value="no"><ThumbsDown />No</ToggleGroupItem>
    </ToggleGroup>
  </PopoverContent>
</Popover>`}>
          <FeedbackPopoverDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use a Popover instead of a DropdownMenu or Tooltip?", a: "Reach for Popover to host arbitrary content like forms, pickers, or info cards. DropdownMenu is for lists of actions with menu keyboard semantics, and Tooltip is for a passive hover hint." },
            { q: "How do I dismiss the popover when a button inside it is clicked?", a: "Wrap the control in `PopoverClose` (use `asChild` to keep your own Button styling), and it closes the panel on click with no extra wiring. `PopoverCloseButton` is a ready-made styled top-right dismiss." },
            { q: "Why do Inputs inside PopoverContent blend with the panel instead of the page?", a: "PopoverContent exposes `--surface: var(--popover)`, so nested controls like Input and Select read that variable and paint the panel surface rather than a separate background block." },
            { q: "How do I position the panel and add a pointer to the trigger?", a: "Pass `align` (start, center, end), `side`, and `sideOffset`, all forwarded to Radix with collision-aware repositioning. Set `showArrow` to render a small arrow pointing at the trigger." },
            { q: "How does density affect the popover?", a: "The `density` prop tunes the content padding only: `comfortable` is `p-4` and `compact` is `p-3`. It also cascades from a surrounding DensityProvider." },
            { q: "Do I need the helper parts like PopoverTitle and PopoverDescription?", a: "No, they are optional structured-content helpers for consistent typography. PopoverContent will host any children you give it." },
          ]}
        />
      </DocSection>

    </>
  )
}
