import {
  Bell,
  CaretRight,
  CreditCard,
  Gear,
  Globe,
  Lock,
  ShieldCheck,
  User,
} from "@phosphor-icons/react/ssr"

import {
  List,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemMeta,
} from "@/components/ui/list"
import { AvatarRoot, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

export const metadata = {
  title: "List",
}

export default function ListDocsPage() {
  return (
    <>
      <DocHeader
        title="List"
        description="The canonical vertical list group: stacked rows with leading media, a title and description, and trailing meta or actions. Rows are inert by default and become links or buttons via asChild, keeping valid <li><a> nesting, with a soft hover fill and inset focus ring."
      />

      <ComponentPreview
        previewClassName="block"
        code={`<List className="w-full max-w-md">
  <ListItem asChild>
    <a href="#account">
      <ListItemMedia><User /></ListItemMedia>
      <ListItemContent>
        <ListItemTitle>Account</ListItemTitle>
        <ListItemDescription>Profile, email, password</ListItemDescription>
      </ListItemContent>
      <ListItemMeta><CaretRight /></ListItemMeta>
    </a>
  </ListItem>
  <ListItem asChild>
    <a href="#billing">
      <ListItemMedia><CreditCard /></ListItemMedia>
      <ListItemContent>
        <ListItemTitle>Billing</ListItemTitle>
        <ListItemDescription>Plan, invoices, payment</ListItemDescription>
      </ListItemContent>
      <ListItemMeta><Badge variant="success" size="sm" pill>Pro</Badge><CaretRight /></ListItemMeta>
    </a>
  </ListItem>
  <ListItem asChild>
    <a href="#security">
      <ListItemMedia><ShieldCheck /></ListItemMedia>
      <ListItemContent>
        <ListItemTitle>Security</ListItemTitle>
        <ListItemDescription>2FA, sessions, devices</ListItemDescription>
      </ListItemContent>
      <ListItemMeta><CaretRight /></ListItemMeta>
    </a>
  </ListItem>
</List>`}
      >
        <List className="mx-auto w-full max-w-md">
          <ListItem asChild>
            <a href="#account">
              <ListItemMedia>
                <User weight="bold" />
              </ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Account</ListItemTitle>
                <ListItemDescription>Profile, email, password</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <CaretRight weight="bold" />
              </ListItemMeta>
            </a>
          </ListItem>
          <ListItem asChild>
            <a href="#billing">
              <ListItemMedia>
                <CreditCard weight="bold" />
              </ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Billing</ListItemTitle>
                <ListItemDescription>Plan, invoices, payment</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <Badge variant="success" size="sm" pill>
                  Pro
                </Badge>
                <CaretRight weight="bold" />
              </ListItemMeta>
            </a>
          </ListItem>
          <ListItem asChild>
            <a href="#security">
              <ListItemMedia>
                <ShieldCheck weight="bold" />
              </ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Security</ListItemTitle>
                <ListItemDescription>2FA, sessions, devices</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <CaretRight weight="bold" />
              </ListItemMeta>
            </a>
          </ListItem>
        </List>
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="list" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  List,
  ListItem,
  ListItemMedia,
  ListItemContent,
  ListItemTitle,
  ListItemDescription,
  ListItemMeta,
} from "@/components/ui/list"

export function Example() {
  return (
    <List>
      <ListItem>
        <ListItemContent>
          <ListItemTitle>Inbox</ListItemTitle>
          <ListItemDescription>12 unread</ListItemDescription>
        </ListItemContent>
      </ListItem>
    </List>
  )
}`}
        />
      </DocSection>

      <DocSection title="Variants">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">card</code> (default) bands the rows inside a
          bordered surface; <code className="font-mono text-sm">plain</code> drops the chrome
          so rows sit flush on whatever holds them. Both keep the divider rule.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<List variant="card">…</List>
<List variant="plain">…</List>`}
        >
          <div className="mx-auto grid w-full max-w-2xl gap-8 sm:grid-cols-2">
            <List variant="card">
              <ListItem>
                <ListItemMedia><Bell weight="bold" /></ListItemMedia>
                <ListItemContent>
                  <ListItemTitle>Notifications</ListItemTitle>
                </ListItemContent>
                <ListItemMeta>3</ListItemMeta>
              </ListItem>
              <ListItem>
                <ListItemMedia><Globe weight="bold" /></ListItemMedia>
                <ListItemContent>
                  <ListItemTitle>Language</ListItemTitle>
                </ListItemContent>
                <ListItemMeta>English</ListItemMeta>
              </ListItem>
            </List>
            <List variant="plain">
              <ListItem>
                <ListItemMedia><Bell weight="bold" /></ListItemMedia>
                <ListItemContent>
                  <ListItemTitle>Notifications</ListItemTitle>
                </ListItemContent>
                <ListItemMeta>3</ListItemMeta>
              </ListItem>
              <ListItem>
                <ListItemMedia><Globe weight="bold" /></ListItemMedia>
                <ListItemContent>
                  <ListItemTitle>Language</ListItemTitle>
                </ListItemContent>
                <ListItemMeta>English</ListItemMeta>
              </ListItem>
            </List>
          </div>
        </ComponentPreview>
      </DocSection>

      <DocSection title="Interactive rows">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">asChild</code> with an{" "}
          <code className="font-mono text-sm">&lt;a&gt;</code> or{" "}
          <code className="font-mono text-sm">&lt;button&gt;</code> to make the whole row a
          link/button: valid <code className="font-mono text-sm">&lt;li&gt;&lt;a&gt;</code>{" "}
          nesting, with a hover fill, a subtle press, and an inset focus ring. It implies{" "}
          <code className="font-mono text-sm">interactive</code>; set{" "}
          <code className="font-mono text-sm">interactive</code> on its own for a row that
          handles <code className="font-mono text-sm">onClick</code> without being a link.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<ListItem asChild>
  <a href="/team/ana">
    <ListItemMedia>
      <AvatarRoot size="sm">
        <AvatarImage src="https://i.pravatar.cc/160?img=5" alt="Ana Torres" />
        <AvatarFallback>AT</AvatarFallback>
      </AvatarRoot>
    </ListItemMedia>
    <ListItemContent>
      <ListItemTitle>Ana Torres</ListItemTitle>
      <ListItemDescription>ana@koalaui.com</ListItemDescription>
    </ListItemContent>
    <ListItemMeta><Badge size="sm">Admin</Badge><CaretRight /></ListItemMeta>
  </a>
</ListItem>`}
        >
          <List className="mx-auto w-full max-w-md">
            {[
              { initials: "AT", name: "Ana Torres", email: "ana@koalaui.com", role: "Admin", img: 5 },
              { initials: "MV", name: "Marc Vidal", email: "marc@koalaui.com", role: "Editor", img: 12 },
              { initials: "LR", name: "Lucia Ramos", email: "lucia@koalaui.com", role: "Viewer", img: 9 },
            ].map((m) => (
              <ListItem key={m.initials} asChild>
                <a href="#member">
                  <ListItemMedia>
                    <AvatarRoot size="sm">
                      <AvatarImage src={`https://i.pravatar.cc/160?img=${m.img}`} alt={m.name} />
                      <AvatarFallback>{m.initials}</AvatarFallback>
                    </AvatarRoot>
                  </ListItemMedia>
                  <ListItemContent>
                    <ListItemTitle>{m.name}</ListItemTitle>
                    <ListItemDescription>{m.email}</ListItemDescription>
                  </ListItemContent>
                  <ListItemMeta>
                    <Badge variant="secondary" size="sm">
                      {m.role}
                    </Badge>
                    <CaretRight weight="bold" />
                  </ListItemMeta>
                </a>
              </ListItem>
            ))}
          </List>
        </ComponentPreview>
      </DocSection>

      <DocSection title="With controls">
        <p className="mt-4 text-pretty text-muted-foreground">
          Rows compose any Koala part in the meta slot. Here each row stays inert (it isn&apos;t
          a link) and drops a <code className="font-mono text-sm">Switch</code> on the right.
          The classic settings list.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<List>
  <ListItem>
    <ListItemMedia><Bell /></ListItemMedia>
    <ListItemContent>
      <ListItemTitle>Push notifications</ListItemTitle>
      <ListItemDescription>Alerts on this device</ListItemDescription>
    </ListItemContent>
    <ListItemMeta><Switch defaultChecked /></ListItemMeta>
  </ListItem>
</List>`}
        >
          <List className="mx-auto w-full max-w-md">
            <ListItem>
              <ListItemMedia><Bell weight="bold" /></ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Push notifications</ListItemTitle>
                <ListItemDescription>Alerts on this device</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <Switch defaultChecked />
              </ListItemMeta>
            </ListItem>
            <ListItem>
              <ListItemMedia><Lock weight="bold" /></ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Private profile</ListItemTitle>
                <ListItemDescription>Hide from search</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <Switch />
              </ListItemMeta>
            </ListItem>
            <ListItem>
              <ListItemMedia><Gear weight="bold" /></ListItemMedia>
              <ListItemContent>
                <ListItemTitle>Beta features</ListItemTitle>
                <ListItemDescription>Early access builds</ListItemDescription>
              </ListItemContent>
              <ListItemMeta>
                <Switch />
              </ListItemMeta>
            </ListItem>
          </List>
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">List</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root <code className="font-mono">&lt;ul&gt;</code>. Forwards all native{" "}
              <code className="font-mono">&lt;ul&gt;</code> props.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono">variant</code>: <code className="font-mono">&quot;card&quot;</code>{" "}
                (default) | <code className="font-mono">&quot;plain&quot;</code>.
              </li>
              <li>
                <code className="font-mono">divided</code>: <code className="font-mono">boolean</code>; hairline rule between rows (default <code className="font-mono">true</code>).
              </li>
              <li>
                <code className="font-mono">asChild</code>: <code className="font-mono">boolean</code>; render via Radix Slot.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">ListItem</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              One row (<code className="font-mono">&lt;li&gt;</code>). Forwards native{" "}
              <code className="font-mono">&lt;li&gt;</code> props.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono">asChild</code>: render the row surface as the
                single child (<code className="font-mono">&lt;a&gt;</code>/<code className="font-mono">&lt;button&gt;</code>)
                while keeping the <code className="font-mono">&lt;li&gt;</code> wrapper. Implies{" "}
                <code className="font-mono">interactive</code>.
              </li>
              <li>
                <code className="font-mono">interactive</code>: <code className="font-mono">boolean</code>;
                hover/press/focus affordance (defaults to <code className="font-mono">true</code> when{" "}
                <code className="font-mono">asChild</code> is set).
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              ListItemMedia, ListItemContent, ListItemTitle, ListItemDescription, ListItemMeta
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The row parts: leading media (icon/Avatar), the content column (title +
              description), and the trailing meta slot (badges, timestamps, a chevron, or an
              action). Each forwards native <code className="font-mono">&lt;div&gt;</code> props.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "When should I use List instead of Data Table or Description List?", a: "Reach for List when you have rows of content with leading media, a title, and a description, like a settings or member list. Data Table is for columnar tabular data, and Description List is for key/value detail pairs." },
            { q: "How do I make a whole row a link without breaking <li><a> nesting?", a: "Pass `asChild` on `ListItem` with a single `<a>` (or `<button>`) child. The `<li>` keeps the divider while the child becomes the interactive surface, so you get valid `<li><a>…</a></li>` markup. `asChild` implies `interactive`." },
            { q: "What is the difference between the asChild and interactive props on ListItem?", a: "`interactive` adds the hover fill, press nudge, and focus ring to a plain `<li>` that handles its own `onClick`. `asChild` does that and also hands the row surface to a link/button child. Setting `asChild` turns `interactive` on automatically." },
            { q: "How do I compose the row parts?", a: "Put a `ListItemMedia` (icon or Avatar) first, a `ListItemContent` wrapping `ListItemTitle` and `ListItemDescription` in the middle, and a `ListItemMeta` for trailing badges, a chevron, or a Switch. The title truncates rather than pushing the meta off the row." },
            { q: "What is the difference between the card and plain variants?", a: "`card` (default) bands the rows inside a bordered, shadowed surface. `plain` drops that chrome so rows sit flush on whatever holds them. Both keep the hairline divider unless you set `divided={false}`." },
          ]}
        />
      </DocSection>
    </>
  )
}
