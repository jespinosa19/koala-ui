import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { PreviewFrame } from "@/components/docs/preview-frame"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import { UnsavedChangesDemo } from "./unsaved-changes-demo"
import { DialogSizesShowcase } from "./sizes-demo"

export const metadata = {
  title: "Dialog",
}

export default function DialogDocsPage() {
  return (
    <>
      <DocHeader
        title="Dialog"
        description="A modal window over the page. Built on Radix Dialog for focus trap, scroll lock, and a11y; styled with one tv slots recipe and animated with interruptible enter/exit."
      />

      {/* Each pattern gets its own responsive block: a live preview rendered in a device frame you
          can resize (mobile / tablet / desktop, or drag the handle) and its openable code. The
          previews render the dialog inline and always-open so it reshapes with the frame width. */}
      <p className="text-pretty text-muted-foreground">
        Every pattern below is its own block: a live preview in a device frame you can resize (mobile
        / tablet / desktop, or drag the handle) plus its code. Dialogs cap at{" "}
        <code className="font-mono text-sm">md</code> (30rem) by default, the width nearly every
        dialog should use. Drag any frame narrow to watch the card shrink to fit.
      </p>

      <PreviewFrame src="/preview/dialogs/default" minHeight="22rem" code={DEFAULT_CODE} />

      <DocSection title="Installation">
        <Installation component="dialog" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  Dialog, DialogTrigger, DialogContent, DialogIcon, DialogHeader,
  DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog"
import { UserCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogIcon><UserCircle /></DialogIcon>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`}
        />
      </DocSection>

      <DocSection title="Confirmation">
        <p className="mt-4 text-pretty text-muted-foreground">
          A destructive confirmation: no header close button (
          <code className="font-mono text-sm">showClose=&#123;false&#125;</code>) forces an explicit
          choice, and the leading icon is tinted red.
        </p>
        <PreviewFrame src="/preview/dialogs/confirmation" minHeight="20rem" code={CONFIRMATION_CODE} />
      </DocSection>

      <DocSection title="Form">
        <p className="mt-4 text-pretty text-muted-foreground">
          Place labelled fields between <code className="font-mono text-sm">DialogHeader</code> and{" "}
          <code className="font-mono text-sm">DialogFooter</code>. Land focus on the first field with{" "}
          <code className="font-mono text-sm">onOpenAutoFocus</code>; inline validation appears below
          each field on submit.
        </p>
        <PreviewFrame src="/preview/dialogs/form" minHeight="27rem" code={FORM_CODE} />
      </DocSection>

      <DocSection title="Compact density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density=&quot;compact&quot;</code> tightens padding,
          gaps and the title for application UI; it re-provides itself to the header, body and footer
          so every part stays in sync. Best driven once via{" "}
          <code className="font-mono text-sm">DensityProvider</code>; see{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <PreviewFrame src="/preview/dialogs/compact" minHeight="18rem" code={COMPACT_CODE} />
      </DocSection>

      <DocSection title="Scrollable body">
        <p className="mt-4 text-pretty text-muted-foreground">
          For tall content (terms, changelogs, lists) wrap the body in a{" "}
          <code className="font-mono text-sm">max-h / overflow-y-auto</code> container so the header
          and footer stay pinned while the middle scrolls.
        </p>
        <PreviewFrame src="/preview/dialogs/scrollable" minHeight="28rem" code={SCROLLABLE_CODE} />
      </DocSection>

      <DocSection title="Share">
        <p className="mt-4 text-pretty text-muted-foreground">
          A leading <code className="font-mono text-sm">DialogIcon</code> above composed{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a> parts: a
          read-only link with a copy button, and an email field paired with a send action.
        </p>
        <PreviewFrame src="/preview/dialogs/share" minHeight="26rem" code={SHARE_CODE} />
      </DocSection>

      <DocSection title="Feedback">
        <p className="mt-4 text-pretty text-muted-foreground">
          A rating prompt: a single-select{" "}
          <a href="/docs/components/toggle-group" className="underline underline-offset-4">ToggleGroup</a>{" "}
          for the score and a{" "}
          <a href="/docs/components/textarea" className="underline underline-offset-4">Textarea</a>{" "}
          with a live character count. The primary action stays disabled until a score is picked, and
          the split footer carries a help link on the left.
        </p>
        <PreviewFrame src="/preview/dialogs/feedback" minHeight="30rem" code={FEEDBACK_CODE} />
      </DocSection>

      <DocSection title="Two-factor (2FA)">
        <p className="mt-4 text-pretty text-muted-foreground">
          A verification flow: a live{" "}
          <a href="/docs/components/qr-code" className="underline underline-offset-4">QR Code</a>{" "}
          on a nested surface (so it takes a <strong>concentric</strong> radius one step inside the
          dialog) above an{" "}
          <a href="/docs/components/otp-input" className="underline underline-offset-4">OTP Input</a>.{" "}
          <code className="font-mono text-sm">Verify</code> enables only once all six digits are in.
        </p>
        <PreviewFrame src="/preview/dialogs/two-factor" minHeight="34rem" code={TWO_FACTOR_CODE} />
      </DocSection>

      <DocSection title="Selectable cards">
        <p className="mt-4 text-pretty text-muted-foreground">
          A single choice rendered as cards rather than bare dots: wrap each option in a{" "}
          <code className="font-mono text-sm">&lt;label&gt;</code> around a{" "}
          <a href="/docs/components/radio-group" className="underline underline-offset-4">RadioGroup</a>{" "}
          item and let CSS{" "}
          <code className="font-mono text-sm">:has([data-state=checked])</code> light the selected
          card. The whole card is the hit target.
        </p>
        <PreviewFrame
          src="/preview/dialogs/selectable-cards"
          minHeight="28rem"
          code={SELECTABLE_CODE}
        />
      </DocSection>

      <DocSection title="Announcement">
        <p className="mt-4 text-pretty text-muted-foreground">
          A leading <code className="font-mono text-sm">DialogIcon</code>, a hero media band, and a
          split footer: a helper on the left with actions on the right via{" "}
          <code className="font-mono text-sm">className=&quot;sm:justify-between&quot;</code> (the
          footer&apos;s top divider is on by default).
        </p>
        <PreviewFrame src="/preview/dialogs/announcement" minHeight="34rem" code={ANNOUNCEMENT_CODE} />
      </DocSection>

      <DocSection title="Multi-step (wizard)">
        <p className="mt-4 text-pretty text-muted-foreground">
          For create flows that span several screens, put a vertical{" "}
          <a href="/docs/components/stepper" className="underline underline-offset-4">Stepper</a>{" "}
          in a left rail and swap the active step&apos;s form on the right. The Stepper owns no state:
          drive its <code className="font-mono text-sm">value</code> from your own step state. Wrap the
          body in a <code className="font-mono text-sm">Stagger</code> keyed by step so each screen
          cascades in, and give it a <code className="font-mono text-sm">min-h</code> so the dialog
          holds its height between steps.
        </p>
        <PreviewFrame src="/preview/dialogs/wizard" minHeight="30rem" code={WIZARD_CODE} />
      </DocSection>

      <DocSection title="Upgrade / Subscribe">
        <p className="mt-4 text-pretty text-muted-foreground">
          An in-app upsell: a two-column dialog pairing edge-to-edge cover art with a benefits list
          and a single brand CTA. It composes the same{" "}
          <code className="font-mono text-sm">dialogVariants</code> recipe, cancelling the content
          padding and gap (<code className="font-mono text-sm">p-0 gap-0</code>) and splitting into two
          columns; use <code className="font-mono text-sm">size=&quot;xl&quot;</code>. Drag the frame
          narrow to watch the columns stack.
        </p>
        <PreviewFrame src="/preview/dialogs/upgrade" minHeight="34rem" code={UPGRADE_CODE} />
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">size</code> on{" "}
          <code className="font-mono text-sm">DialogContent</code> caps the <em>max width</em>; the
          dialog still shrinks to fit narrow viewports, so it is a ceiling, not a fixed width. The
          default <code className="font-mono text-sm">md</code> (30rem) is the width nearly every
          dialog should use; reach for the others only when one genuinely needs less or more:
        </p>
        <ul className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <li>
            <code className="font-mono text-foreground">sm</code>: <code className="font-mono">max-w-sm</code> (384px). Confirmations and short prompts.
          </li>
          <li>
            <code className="font-mono text-foreground">md</code>: <code className="font-mono">max-w-[30rem]</code> (480px). The <strong>default</strong>; most forms and messages.
          </li>
          <li>
            <code className="font-mono text-foreground">lg</code>: <code className="font-mono">max-w-2xl</code> (672px). Denser forms with side-by-side fields.
          </li>
          <li>
            <code className="font-mono text-foreground">xl</code>: <code className="font-mono">max-w-4xl</code> (896px). Rich content: tables, multi-column layouts.
          </li>
        </ul>
        <p className="mt-4 text-pretty text-muted-foreground">
          The previews below are the real <code className="font-mono text-sm">DialogContent</code>{" "}
          rendered inline so you can compare the widths directly:
        </p>
        <ComponentPreview
          previewClassName="flex-col items-stretch"
          code={`<DialogContent size="sm">…</DialogContent>
<DialogContent size="md">…</DialogContent>  {/* default, 30rem */}
<DialogContent size="lg">…</DialogContent>
<DialogContent size="xl">…</DialogContent>`}
        >
          <DialogSizesShowcase />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Unsaved changes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Behavior that needs a real trigger, so this one stays interactive. Use a controlled{" "}
          <code className="font-mono text-sm">open</code> /{" "}
          <code className="font-mono text-sm">onOpenChange</code> pair and intercept{" "}
          <code className="font-mono text-sm">onInteractOutside</code> +{" "}
          <code className="font-mono text-sm">onEscapeKeyDown</code> to guard against accidental data
          loss. When the form is dirty, every close attempt (the ✕, the scrim, Escape, or Cancel)
          opens a nested confirmation dialog instead.
        </p>
        <ComponentPreview
          previewClassName="justify-start"
          code={`"use client"

const [open, setOpen] = React.useState(false)
const [discardOpen, setDiscardOpen] = React.useState(false)
const isDirty = title.trim().length > 0 || body.trim().length > 0

function attemptClose() {
  if (isDirty) setDiscardOpen(true)
  else setOpen(false)
}

{/* Main dialog */}
<Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : attemptClose())}>
  <DialogTrigger asChild>
    <Button variant="outline">New post</Button>
  </DialogTrigger>
  <DialogContent
    onInteractOutside={(e) => { e.preventDefault(); attemptClose() }}
    onEscapeKeyDown={(e) => { e.preventDefault(); attemptClose() }}
  >
    {/* form fields */}
    <DialogFooter>
      <Button variant="ghost" onClick={attemptClose}>Cancel</Button>
      <Button onClick={save}>Publish</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Discard confirmation */}
<Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
  <DialogContent size="sm" showClose={false}>
    <DialogHeader>
      <DialogTitle>Discard changes?</DialogTitle>
      <DialogDescription>
        You have unsaved content. Closing now will permanently lose your changes.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setDiscardOpen(false)}>Keep editing</Button>
      <Button variant="destructive" onClick={confirmDiscard}>Discard changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <UnsavedChangesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I reach for Dialog versus Drawer or Popover?",
              a: "Use Dialog for a focused, blocking task that needs a focus trap and scrim, like a confirmation, a short form, or terms you must accept. Reach for Drawer when the content is a side panel or a long task on mobile, and Popover for a small non-modal surface anchored to a trigger that does not lock the page.",
            },
            {
              q: "What does the size prop on DialogContent actually control?",
              a: "size sets the max width only (sm is max-w-sm, md is 30rem/480px by default, lg is max-w-2xl, xl is max-w-4xl); md is the width nearly every dialog should use, and the others are for when one genuinely needs less or more. The dialog still shrinks to fit narrow viewports, so it is a ceiling, not a fixed width. Height always hugs the content, so for long bodies scroll an inner max-h container rather than the whole dialog.",
            },
            {
              q: "Does the footer have a divider by default, and how do I turn it off?",
              a: "Yes. DialogFooter carries a full-bleed top divider by default (a 12px action band flush to the dialog's edges), the canonical dialog look. Pass bordered={false} for a borderless footer that just sits below the body, and add className='sm:justify-between' when you want a helper on the left with the actions on the right.",
            },
            {
              q: "How do I compose the named parts, and why import them instead of using dot notation?",
              a: "Nest DialogHeader (holding DialogTitle and DialogDescription) and DialogFooter inside DialogContent, with DialogTrigger and DialogClose using asChild to wrap your own buttons. Each part is a named export rather than Dialog.Header because dot-notation accessors break the server-to-client boundary in React Server Components.",
            },
            {
              q: "How do I land focus on the first field instead of the dialog container when it opens?",
              a: "Radix moves focus onto the content container on open for screen-reader announcement, so pass onOpenAutoFocus to DialogContent, call e.preventDefault(), and focus your input ref instead. Escape and clicking the scrim close the dialog for free, and a focus trap plus scroll lock come from Radix.",
            },
            {
              q: "Why does Escape or clicking outside still close my dialog when I have unsaved changes?",
              a: "By default those dismissals are uncontrolled, so wire a controlled open and onOpenChange pair and intercept onInteractOutside and onEscapeKeyDown, calling e.preventDefault() to route every close attempt through your guard. For an explicit-choice confirmation, also set showClose={false} so there is no quiet escape hatch in the top-right corner.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}

const DEFAULT_CODE = `<Dialog>
  <DialogTrigger asChild>
    <Button>Open dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogIcon><UserCircle /></DialogIcon>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancel</Button>
      </DialogClose>
      <Button>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`

const CONFIRMATION_CODE = `<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete account</Button>
  </DialogTrigger>
  <DialogContent size="sm" showClose={false}>
    {/* Tint the leading icon red for a destructive action */}
    <DialogIcon className="text-destructive"><Trash /></DialogIcon>
    <DialogHeader>
      <DialogTitle>Delete account?</DialogTitle>
      <DialogDescription>
        This permanently deletes your account and all data. This cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <DialogClose asChild><Button variant="destructive">Delete</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`

const FORM_CODE = `function InviteDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [nameError, setNameError] = React.useState("")
  const [emailError, setEmailError] = React.useState("")

  function handleSubmit() {
    if (!name.trim()) { setNameError("Name is required."); return }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address."); return
    }
    // submit…
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Invite member</Button>
      </DialogTrigger>
      <DialogContent
        size="sm"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          nameRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Enter the details below. An invitation will be sent by email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <InputLabel htmlFor="name">Full name</InputLabel>
            <InputRoot hasError={!!nameError}>
              <InputField ref={nameRef} id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </InputRoot>
            {nameError && <InputHint hasError>{nameError}</InputHint>}
          </div>
          <div className="grid gap-1.5">
            <InputLabel htmlFor="email">Email address</InputLabel>
            <InputRoot hasError={!!emailError}>
              <InputField id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </InputRoot>
            {emailError && <InputHint hasError>{emailError}</InputHint>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`

const COMPACT_CODE = `<DialogContent density="compact" size="sm">
  <DialogIcon><Rows /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Compact dialog</DialogTitle>
    <DialogDescription>Tighter padding and a 1rem title for dense application UI.</DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <DialogClose asChild><Button>Got it</Button></DialogClose>
  </DialogFooter>
</DialogContent>`

const SCROLLABLE_CODE = `<DialogContent>
  <DialogIcon><FileText /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Terms of service</DialogTitle>
    <DialogDescription>Please read the full terms before accepting.</DialogDescription>
  </DialogHeader>
  {/* Scrollable body: pin the header/footer, scroll the middle */}
  <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-4 text-sm text-muted-foreground [scrollbar-width:thin]">
    {/* …long content… */}
  </div>
  <DialogFooter>
    <DialogClose asChild><Button variant="ghost">Decline</Button></DialogClose>
    <DialogClose asChild><Button>Accept</Button></DialogClose>
  </DialogFooter>
</DialogContent>`

const SHARE_CODE = `<DialogContent>
  <DialogIcon><LinkSimple /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Share incident</DialogTitle>
    <DialogDescription>Choose who you want to share the incident with.</DialogDescription>
  </DialogHeader>
  <div className="grid gap-4">
    <div className="grid gap-1.5">
      <InputLabel htmlFor="share-link" required>Copy the link directly</InputLabel>
      <InputRoot>
        <InputField id="share-link" readOnly value="lspcad.flab/incident21414" />
        <InputSuffixButton aria-label="Copy link"><Copy /></InputSuffixButton>
      </InputRoot>
    </div>
    <div className="grid gap-1.5">
      <InputLabel htmlFor="share-email" required>Send the link via invitation</InputLabel>
      {/* Stack on mobile so the button never overflows a narrow dialog; row from sm */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <InputRoot className="min-w-0 sm:flex-1">
          <InputPrefix><EnvelopeSimple /></InputPrefix>
          <InputField id="share-email" type="email" placeholder="Enter your email address" />
        </InputRoot>
        <Button className="w-full sm:w-auto">Send invite</Button>
      </div>
    </div>
  </div>
</DialogContent>`

const FEEDBACK_CODE = `const [rating, setRating] = React.useState("")

<DialogContent size="sm">
  <DialogIcon><Star /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Help us improve!</DialogTitle>
    <DialogDescription>Share your experience with us so we can make it better.</DialogDescription>
  </DialogHeader>

  <div className="grid gap-4">
    <div className="grid gap-2">
      <Label id="rating-label" required>Rate your experience</Label>
      <ToggleGroup type="single" size="sm" value={rating} onValueChange={setRating}
        aria-labelledby="rating-label" className="w-full">
        {["1", "2", "3", "4", "5"].map((n) => (
          <ToggleGroupItem key={n} value={n} aria-label={\`\${n} out of 5\`} className="flex-1">{n}</ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
    <div className="grid gap-2">
      <TextareaLabel htmlFor="feedback-message">Your message</TextareaLabel>
      <TextareaRoot>
        <TextareaField id="feedback-message" placeholder="Write your message here..." rows={4} maxLength={500} showCount />
      </TextareaRoot>
    </div>
  </div>

  <DialogFooter className="sm:items-center sm:justify-between">
    {/* help link on the left */}
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button disabled={!rating}>Submit</Button></DialogClose>
    </div>
  </DialogFooter>
</DialogContent>`

const TWO_FACTOR_CODE = `const [code, setCode] = React.useState("")

<DialogContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
  <DialogIcon><ShieldCheck /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Enable two-factor authentication</DialogTitle>
    <DialogDescription>
      Scan the QR code with your authentication app, then enter the 6-digit code to verify and activate 2FA.
    </DialogDescription>
  </DialogHeader>

  {/* Concentric radius: rounded-lg panel nested inside the rounded-xl content */}
  <div className="flex items-center justify-center rounded-lg border border-border bg-accent p-6">
    <QRCode value="otpauth://totp/Koala:esteban?secret=...&issuer=Koala" level="Q"
      size={176} margin={2} className="rounded-md p-3 shadow-xs" />
  </div>

  <OTPInput label="Introduce code" required size="sm" length={6} autoFocus value={code} onChange={setCode} />

  <DialogFooter className="sm:items-center sm:justify-between">
    {/* help link on the left */}
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button disabled={code.length < 6}>Verify</Button></DialogClose>
    </div>
  </DialogFooter>
</DialogContent>`

const SELECTABLE_CODE = `const [theme, setTheme] = React.useState("light")

const THEMES = [
  { value: "light", title: "Light theme", hint: "For a clean and minimal look.", icon: Sun },
  { value: "dark", title: "Dark theme", hint: "Perfect for working in low-light conditions.", icon: Moon },
  { value: "system", title: "System", hint: "Automatically adapts to your device's settings.", icon: Desktop },
]

<DialogContent size="sm">
  <DialogIcon><Palette /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Change theme</DialogTitle>
    <DialogDescription>Choose your preferred theme to customize your experience.</DialogDescription>
  </DialogHeader>

  <div className="grid gap-2">
    <Label id="theme-label" required>Choose your theme</Label>
    <RadioGroup value={theme} onValueChange={setTheme} aria-labelledby="theme-label">
      {THEMES.map(({ value, title, hint, icon: Icon }) => (
        <RadioCard key={value} value={value} icon={<Icon />}>
          <RadioCardTitle>{title}</RadioCardTitle>
          <RadioCardDescription>{hint}</RadioCardDescription>
        </RadioCard>
      ))}
    </RadioGroup>
  </div>

  <DialogFooter className="sm:items-center sm:justify-between">
    {/* help link on the left */}
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button>Apply</Button></DialogClose>
    </div>
  </DialogFooter>
</DialogContent>`

const ANNOUNCEMENT_CODE = `<DialogContent>
  <DialogIcon><Megaphone /></DialogIcon>
  <DialogHeader>
    <DialogTitle>Mobile Version Now Available!</DialogTitle>
    <DialogDescription>Access your dashboard anytime, anywhere.</DialogDescription>
  </DialogHeader>

  {/* hero media + body copy */}
  <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-accent to-muted text-muted-foreground">
    <DeviceMobile className="size-12" />
    <span className="text-sm font-medium">Dashboard on mobile</span>
  </div>
  <p className="text-pretty text-sm text-muted-foreground">
    Enjoy a seamless experience on the go with our mobile-friendly dashboard.
  </p>

  {/* Split footer: helper left, actions right (top divider is the default) */}
  <DialogFooter className="sm:items-center sm:justify-between">
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Info className="size-4" /> Need some help?
    </span>
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      <Button variant="outline">Cancel</Button>
      <Button>Create</Button>
    </div>
  </DialogFooter>
</DialogContent>`

const WIZARD_CODE = `const [step, setStep] = React.useState(1)

<DialogContent size="lg" density="compact">
  <DialogHeader>
    <DialogTitle>Create project</DialogTitle>
    <DialogDescription>Set up your workspace in a few steps.</DialogDescription>
  </DialogHeader>

  <div className="grid grid-cols-[auto_1fr] items-start gap-4 sm:gap-8">
    {/* Left rail: vertical stepper with solid, brand-filled indicators and no connectors. */}
    <Stepper value={step} onValueChange={setStep} orientation="vertical"
      variant="solid" density="comfortable" className="pr-2">
      {STEPS.map((s, i) => (
        <StepperItem key={s.title} step={i + 1} disabled={i + 1 > step}
          className="[&:not(:last-child)]:min-h-[2.75rem]">
          <StepperTrigger className="items-center">
            <StepperIndicator />
            <StepperTitle className="font-semibold">{s.title}</StepperTitle>
          </StepperTrigger>
        </StepperItem>
      ))}
    </Stepper>

    {/* key={step} replays the entrance per step; min-h sets the dialog's height. */}
    <Stagger key={step} className="grid min-h-[18rem] content-start gap-3">
      {step === 1 && <ProjectFields />}
      {step === 2 && <InviteFields />}
      {step === 3 && <ReviewSummary />}
    </Stagger>
  </div>

  <DialogFooter className="sm:justify-between">
    <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
      <ArrowLeft /> Back
    </Button>
    {step === STEPS.length
      ? <Button onClick={create} loading={submitting}>Create project</Button>
      : <Button onClick={() => setStep((s) => s + 1)}>Next <ArrowRight /></Button>}
  </DialogFooter>
</DialogContent>`

const UPGRADE_CODE = `const BENEFITS = [
  { icon: LockKey, title: "Internal comments", description: "Separate internal team discussion from external stakeholder comments in shares." },
  { icon: FolderLock, title: "Restricted projects", description: "Create projects that are only accessible to you and the specific people you invite." },
  { icon: UsersThree, title: "Up to 15 members", description: "Add more people to your account for maximum collaboration on every project." },
  { icon: Cloud, title: "3 TB storage", description: "Even more room to store your media and assets, all within your workspace." },
]

<DialogContent size="xl" className="gap-0 overflow-hidden p-0 sm:grid-cols-2">
  {/* Left: cover art (banner on mobile, fills the column on sm+) */}
  <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:h-full">
    <img src={cover} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
    <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
  </div>

  {/* Right: benefits + CTA */}
  <div className="flex flex-col gap-6 p-6 sm:p-8">
    <DialogIcon><Crown /></DialogIcon>
    <DialogHeader className="gap-2 text-left">
      <DialogTitle className="text-xl leading-snug">
        Upgrade to <span className="text-brand">Team</span>
      </DialogTitle>
      <DialogDescription>Everything your team needs to collaborate, with room to grow.</DialogDescription>
    </DialogHeader>

    {/* Minimal divided list: a Divider between each feature */}
    <div role="list" className="flex flex-col gap-4">
      {BENEFITS.map(({ icon: Icon, title, description }, i) => (
        <React.Fragment key={title}>
          {i > 0 && <Divider />}
          <div role="listitem" className="flex gap-3.5">
            <Icon weight="bold" aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold leading-none text-foreground">{title}</p>
              <p className="text-sm text-pretty text-muted-foreground">{description}</p>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>

    <div className="mt-auto flex flex-col gap-3">
      <DialogClose asChild>
        <Button size="lg" className="w-full"><Sparkle weight="bold" /> Subscribe to Team</Button>
      </DialogClose>
    </div>
  </div>
</DialogContent>`
