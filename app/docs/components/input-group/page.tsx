import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  AmountGroupDemo,
  AddonsDemo,
  NewsletterGroupDemo,
  InviteGroupDemo,
  CopyFieldDemo,
  SizesDemo,
  StatesDemo,
} from "./demos"

export const metadata = {
  title: "Input Group",
}

export default function InputGroupDocsPage() {
  return (
    <>
      <DocHeader
        title="Input Group"
        description="Joins several controls - a field, a Select, a static affix, a small icon-only action - into one seamless segmented shell. The group owns the border and focus ring; each segment goes chromeless and melts in. A prominent text action, though, stays a detached Button beside the group - never a big button crammed inside the field."
      />

      <ComponentPreview
        code={`<InputGroup>
  <InputGroupAddon>$</InputGroupAddon>
  <InputRoot>
    <InputField inputMode="decimal" defaultValue="1,250.00" className="tabular-nums" aria-label="Amount" />
  </InputRoot>
  <Select defaultValue="usd">
    <SelectTrigger aria-label="Currency">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="usd"><CurrencyDollar /> USD</SelectItem>
      <SelectItem value="eur"><CurrencyEur /> EUR</SelectItem>
      <SelectItem value="gbp"><CurrencyGbp /> GBP</SelectItem>
    </SelectContent>
  </Select>
</InputGroup>`}
      >
        <AmountGroupDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="input-group" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { InputRoot, InputField } from "@/components/ui/input"

export function Example() {
  return (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputRoot>
        <InputField placeholder="yourcompany" />
      </InputRoot>
      <InputGroupAddon>.com</InputGroupAddon>
    </InputGroup>
  )
}`}
        />
      </DocSection>

      <DocSection title="When to reach for it">
        <p className="mt-4 text-pretty text-muted-foreground">
          An <code className="font-mono text-sm">Input</code> already handles adornments{" "}
          <em>inside a single field</em> - a leading icon (
          <code className="font-mono text-sm">InputPrefix</code>), a divided label (
          <code className="font-mono text-sm">InputPrefixLabel</code>), a trailing icon button (
          <code className="font-mono text-sm">InputSuffixButton</code>). Reach for{" "}
          <code className="font-mono text-sm">InputGroup</code> only when you need to{" "}
          <em>join several distinct controls</em> - a Select, another field, a static affix -
          into one unit. One shell, one focus ring, one set of rounded corners.
        </p>
        <p className="mt-4 text-pretty text-muted-foreground">
          A prominent <em>text</em> action - Subscribe, Invite, Search - does not belong
          inside the shell. Crammed in, it reads as a button trapped in a field. Keep it a
          detached <code className="font-mono text-sm">Button</code> beside the group instead
          (see below). Only a small <em>icon-only</em> action may melt in.
        </p>
      </DocSection>

      <DocSection title="Pairing with an action">
        <p className="mt-4 text-pretty text-muted-foreground">
          Do not fuse a big text button into the field. Drop the group (or a plain{" "}
          <code className="font-mono text-sm">InputRoot</code>) and the{" "}
          <code className="font-mono text-sm">Button</code> into one flex row (
          <code className="font-mono text-sm">items-stretch gap-2</code>) at the same size:
          the field flexes, the button caps the row from <em>outside</em>, and the heights
          line up on their own. It reads as a real button, not a segment.
        </p>
        <ComponentPreview
          code={`<div className="flex items-stretch gap-2">
  <InputRoot className="flex-1">
    <InputPrefix>
      <Envelope />
    </InputPrefix>
    <InputField type="email" placeholder="Enter your email address" aria-label="Email address" />
  </InputRoot>
  <Button>Subscribe</Button>
</div>`}
        >
          <NewsletterGroupDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="With a Select">
        <p className="mt-4 text-pretty text-muted-foreground">
          Drop a real <code className="font-mono text-sm">Select</code> in as a segment and
          it melts into the shell - its own border, ring, and background are stripped while
          its menu, keyboard nav, and ARIA stay intact. The field flexes to fill the row.
          The <code className="font-mono text-sm">Invite</code> action, being a text button,
          stays detached beside the group - same rule as the newsletter, one step richer.
        </p>
        <ComponentPreview
          code={`<div className="flex items-stretch gap-2">
  <InputGroup className="flex-1">
    <Select defaultValue="member">
      <SelectTrigger aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin"><ShieldCheck /> Admin</SelectItem>
        <SelectItem value="member"><User /> Member</SelectItem>
        <SelectItem value="viewer"><Eye /> Viewer</SelectItem>
      </SelectContent>
    </Select>
    <InputRoot>
      <InputField type="email" placeholder="teammate@company.com" aria-label="Email to invite" />
    </InputRoot>
  </InputGroup>
  <Button>Invite</Button>
</div>`}
        >
          <InviteGroupDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Text affixes">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">InputGroupAddon</code> is a static,
          non-interactive segment for a unit, protocol, or symbol. It shares the shell
          background and reads as a muted label, on either side of the field.
        </p>
        <ComponentPreview
          code={`<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputRoot>
    <InputField placeholder="yourcompany" aria-label="Subdomain" />
  </InputRoot>
  <InputGroupAddon>.com</InputGroupAddon>
</InputGroup>

<InputGroup>
  <InputGroupAddon>@</InputGroupAddon>
  <InputRoot>
    <InputField placeholder="username" aria-label="Username" />
  </InputRoot>
</InputGroup>`}
        >
          <AddonsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icon-only actions can melt in">
        <p className="mt-4 text-pretty text-muted-foreground">
          The one action that <em>may</em> live inside the shell is a small{" "}
          <em>icon-only</em> button - copy, clear, a submit arrow. With no label to
          crowd the field, it sits flush as a fused segment: it keeps its fill and hover but
          drops its own radius, ring, and press-scale. Use{" "}
          <code className="font-mono text-sm">iconOnly</code> and give it an{" "}
          <code className="font-mono text-sm">aria-label</code>.
        </p>
        <ComponentPreview
          code={`<InputGroup>
  <InputGroupAddon>koala.dev/</InputGroupAddon>
  <InputRoot>
    <InputField readOnly defaultValue="s/ab12cd" aria-label="Share link" className="font-mono" />
  </InputRoot>
  <Button iconOnly variant="ghost" aria-label="Copy link" onClick={copy}>
    {copied ? <Check /> : <Copy />}
  </Button>
</InputGroup>`}
        >
          <CopyFieldDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <p className="mt-4 text-pretty text-muted-foreground">
          The <code className="font-mono text-sm">size</code> prop sets the shell height
          (<code className="font-mono text-sm">sm</code> 32,{" "}
          <code className="font-mono text-sm">md</code> 36,{" "}
          <code className="font-mono text-sm">lg</code> 40px) and the affix scale. Give the
          inner controls - and the detached Button - the matching size so every part lines
          up.
        </p>
        <ComponentPreview
          code={`<div className="flex items-stretch gap-2">
  <InputGroup size="sm" className="flex-1">
    <Select defaultValue="member">{/* ... */}</Select>
    <InputRoot size="sm">{/* ... */}</InputRoot>
  </InputGroup>
  <Button size="sm">Invite</Button>
</div>

{/* size="md" ... size="lg" ... */}`}
        >
          <SizesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="States">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">hasError</code> paints the whole shell red and
          turns the focus ring destructive; <code className="font-mono text-sm">disabled</code>{" "}
          dims and locks the row. Inside a <code className="font-mono text-sm">Field</code>,
          both cascade automatically. For form semantics, also disable the inner control so
          it is excluded from submission.
        </p>
        <ComponentPreview
          code={`<InputGroup hasError>
  <InputGroupAddon>@</InputGroupAddon>
  <InputRoot>
    <InputField defaultValue="not an email" aria-label="Email" />
  </InputRoot>
</InputGroup>

<InputGroup disabled>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputRoot>
    <InputField defaultValue="acme" disabled aria-label="Subdomain" />
  </InputRoot>
  <InputGroupAddon>.com</InputGroupAddon>
</InputGroup>`}
        >
          <StatesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Prop</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Default</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">size</td>
                <td className="px-4 py-2.5 font-mono text-xs">{`"sm" | "md" | "lg"`}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{`"md"`}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Shell height + affix sizing. Match it on the inner controls.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">hasError</td>
                <td className="px-4 py-2.5 font-mono text-xs">boolean</td>
                <td className="px-4 py-2.5 font-mono text-xs">-</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Error styling. Cascades from a surrounding Field.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">disabled</td>
                <td className="px-4 py-2.5 font-mono text-xs">boolean</td>
                <td className="px-4 py-2.5 font-mono text-xs">-</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Dim and lock the shell. Cascades from a surrounding Field.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs">...divProps</td>
                <td className="px-4 py-2.5 font-mono text-xs">{`ComponentProps<"div">`}</td>
                <td className="px-4 py-2.5 font-mono text-xs">-</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Forwarded to the shell. <code className="font-mono text-xs">className</code>{" "}
                  merges last.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">InputGroupAddon</code> is a plain{" "}
          <code className="font-mono text-sm">span</code> segment and accepts every native
          span prop plus <code className="font-mono text-sm">className</code>.
        </p>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When do I use InputGroup vs the Input adornments?",
              a: "Input already covers adornments inside one field: a leading icon (InputPrefix), a divided label (InputPrefixLabel), a trailing icon button (InputSuffixButton). Use InputGroup only when you are joining several distinct controls - a Select, another field, a static affix - into one shell. If everything lives in a single field, you do not need InputGroup.",
            },
            {
              q: "Why isn't the action button inside the group?",
              a: "A prominent text action - Subscribe, Invite, Search - reads better as its own button beside the field than melted into the shell, where it looks like a button trapped in an input. Keep it detached in a flex row (flex items-stretch gap-2) at the same size, so the field flexes and the heights line up. Only a small icon-only action (copy, clear, a submit arrow) should melt into the group.",
            },
            {
              q: "So an icon-only button CAN go inside?",
              a: "Yes. With no label to crowd the field, a small icon-only Button sits flush as a fused segment - it keeps its fill and hover but drops its radius, ring, and press-scale. That is the one button that belongs inside the shell. Anything with a text label stays detached beside the group.",
            },
            {
              q: "How does it join controls without the borders doubling up?",
              a: "The group owns the single border, radius, focus ring, and background. Each known segment (input-root, select-trigger, and a fused icon-only button) is stripped of its own frame via data-slot selectors and the seams are redrawn as one 1px divider per junction. It is the same approach Button Group uses, adapted so the whole shell shares one focus ring.",
            },
            {
              q: "How do I keep every segment - and the detached button - the same height?",
              a: "Height comes from one shared scale: Button, Input, InputGroup, and Select all map size sm/md/lg to 32/36/40px. So give the group, each inner control, and the detached Button the same size (e.g. size=\"lg\") and they're identical - no height overrides. Density never changes a control's height; it only sets the DEFAULT size when you don't pass one (compact app shell -> sm, comfortable -> md), so a bare group and a bare Button still match. The flex row's items-stretch is the final guarantee.",
            },
            {
              q: "Does it wire up to Field?",
              a: "Yes. Like InputRoot, InputGroup reads the Field context, so hasError and disabled cascade from a surrounding Field and you set them once. A prop on the group always wins over the field default.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
