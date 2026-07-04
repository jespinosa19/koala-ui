import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"
import {
  OrderSummaryDemo,
  OrderSummaryItemsDemo,
  OrderSummaryShoppingCartDemo,
  OrderSummaryTotalsDemo,
  OrderSummaryPlainDemo,
} from "./order-summary-demos"

export const metadata = {
  title: "Order Summary",
}

export default function OrderSummaryDocsPage() {
  return (
    <>
      <DocHeader
        title="Order Summary"
        description="The checkout and cart order read-out. A Data Display sibling of Description List and Stat: one composable card that stacks line items, a promo-code band, and a totals breakdown, with every price on tabular-nums so the column never jitters as the cart changes."
      />

      <ComponentPreview
        previewClassName="p-10 sm:p-14"
        code={`<OrderSummary density="comfortable" className="max-w-sm">
  <OrderSummaryHeader>
    <OrderSummaryTitle asChild><h3>Order summary</h3></OrderSummaryTitle>
    <Badge variant="secondary" pill>4 items</Badge>
  </OrderSummaryHeader>

  <OrderSummaryItems>
    <OrderSummaryItem>
      <OrderSummaryItemThumbnail count={2}>
        <img src="/sneakers.jpg" alt="Retro Sneakers" />
      </OrderSummaryItemThumbnail>
      <OrderSummaryItemContent>
        <OrderSummaryItemName>Retro Sneakers</OrderSummaryItemName>
        <OrderSummaryItemOptions>Size 10 · Red</OrderSummaryItemOptions>
      </OrderSummaryItemContent>
      <OrderSummaryItemPrice>$64.00</OrderSummaryItemPrice>
    </OrderSummaryItem>
    {/* …more items */}
  </OrderSummaryItems>

  <OrderSummaryPromo>
    <InputGroup>
      <InputRoot><InputField placeholder="Promo code" defaultValue="WELCOME10" /></InputRoot>
      <Button variant="secondary">Apply</Button>
    </InputGroup>
  </OrderSummaryPromo>

  <OrderSummaryTotals>
    <OrderSummaryRow label="Subtotal">$291.00</OrderSummaryRow>
    <OrderSummaryRow label="Shipping" tone="muted">Free</OrderSummaryRow>
    <OrderSummaryRow label="Estimated tax">$23.28</OrderSummaryRow>
    <OrderSummaryRow label="Discount (WELCOME10)" tone="discount">-$29.10</OrderSummaryRow>
    <OrderSummaryTotal label="Total">$285.18</OrderSummaryTotal>
  </OrderSummaryTotals>

  <OrderSummaryFooter>
    <Button size="lg" className="w-full">Checkout</Button>
    <p className="text-center text-xs text-muted-foreground">
      Taxes and shipping calculated at checkout.
    </p>
  </OrderSummaryFooter>
</OrderSummary>`}
      >
        <OrderSummaryDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="order-summary" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import {
  OrderSummary,
  OrderSummaryHeader,
  OrderSummaryTitle,
  OrderSummaryItems,
  OrderSummaryItem,
  OrderSummaryItemThumbnail,
  OrderSummaryItemContent,
  OrderSummaryItemName,
  OrderSummaryItemOptions,
  OrderSummaryItemPrice,
  OrderSummaryPromo,
  OrderSummaryTotals,
  OrderSummaryRow,
  OrderSummaryTotal,
  OrderSummaryFooter,
} from "@/components/ui/order-summary"

export function Example() {
  return (
    <OrderSummary>
      <OrderSummaryItems>
        <OrderSummaryItem>
          <OrderSummaryItemThumbnail count={2}>
            <img src="/sneakers.jpg" alt="Retro Sneakers" />
          </OrderSummaryItemThumbnail>
          <OrderSummaryItemContent>
            <OrderSummaryItemName>Retro Sneakers</OrderSummaryItemName>
            <OrderSummaryItemOptions>Size 10 · Red</OrderSummaryItemOptions>
          </OrderSummaryItemContent>
          <OrderSummaryItemPrice>$64.00</OrderSummaryItemPrice>
        </OrderSummaryItem>
      </OrderSummaryItems>

      <OrderSummaryTotals>
        <OrderSummaryRow label="Subtotal">$64.00</OrderSummaryRow>
        <OrderSummaryTotal label="Total">$64.00</OrderSummaryTotal>
      </OrderSummaryTotals>
    </OrderSummary>
  )
}`}
        />
      </DocSection>

      <DocSection title="Anatomy">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">OrderSummary</code> is a multi-part component: one{" "}
          <code className="font-mono text-sm">tv</code> recipe whose slots flow to every named
          part through React Context. Compose only the bands you need, in any order. There are no
          internal dividers or boxing: the bands and the line items are simply set apart by
          whitespace (the house minimal style), so the summary reads clean on any surface. The{" "}
          <code className="font-mono text-sm">card</code> variant adds an outer border and insets
          the content with padding; <code className="font-mono text-sm">plain</code> sits flush.
        </p>
        <CodeSnippet
          className="mt-4"
          filename="anatomy.tsx"
          code={`<OrderSummary>            {/* the card shell */}
  <OrderSummaryHeader>     {/* title + item-count Badge */}
    <OrderSummaryTitle />
  </OrderSummaryHeader>

  <OrderSummaryItems>      {/* the <ul> of line items */}
    <OrderSummaryItem>     {/* one <li> row */}
      <OrderSummaryItemThumbnail count={2} />
      <OrderSummaryItemContent>
        <OrderSummaryItemName />
        <OrderSummaryItemOptions />
      </OrderSummaryItemContent>
      <OrderSummaryItemPrice />
    </OrderSummaryItem>
  </OrderSummaryItems>

  <OrderSummaryPromo />     {/* slot for an InputGroup */}

  <OrderSummaryTotals>      {/* the <dl> breakdown */}
    <OrderSummaryRow label="Subtotal">…</OrderSummaryRow>
    <OrderSummaryTotal label="Total">…</OrderSummaryTotal>
  </OrderSummaryTotals>

  <OrderSummaryFooter />    {/* slot for the checkout CTA */}
</OrderSummary>`}
        />
      </DocSection>

      <DocSection title="Line items">
        <p className="mt-4 text-pretty text-muted-foreground">
          Each <code className="font-mono text-sm">OrderSummaryItem</code> is a{" "}
          <code className="font-mono text-sm">&lt;li&gt;</code> laying out a thumbnail, the
          name + options, and the line price. The thumbnail holds an{" "}
          <code className="font-mono text-sm">&lt;img&gt;</code> (auto <code className="font-mono text-sm">object-cover</code>{" "}
          with the DS image-outline) or a Phosphor glyph, and its{" "}
          <code className="font-mono text-sm">count</code> prop drops a quantity pill on the
          corner. The name truncates rather than shoving the price off the row, and the price is{" "}
          <code className="font-mono text-sm">tabular-nums</code> so the column stays aligned.
        </p>
        <ComponentPreview
          previewClassName="p-10 sm:p-14"
          code={`<OrderSummaryItems>
  <OrderSummaryItem>
    <OrderSummaryItemThumbnail count={2}>
      <img src="/sneakers.jpg" alt="Retro Sneakers" />
    </OrderSummaryItemThumbnail>
    <OrderSummaryItemContent>
      <OrderSummaryItemName>Retro Sneakers</OrderSummaryItemName>
      <OrderSummaryItemOptions>Size 10 · Red</OrderSummaryItemOptions>
    </OrderSummaryItemContent>
    <OrderSummaryItemPrice>$64.00</OrderSummaryItemPrice>
  </OrderSummaryItem>
  {/* …Canvas High-Tops, Aluminum Watch */}
</OrderSummaryItems>`}
        >
          <OrderSummaryItemsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Shopping cart">
        <p className="mt-4 text-pretty text-muted-foreground">
          Compose <code className="font-mono text-sm">OrderSummaryItemActions</code> after the price
          to turn the read-out into a shopping cart. It holds{" "}
          <code className="font-mono text-sm">OrderSummaryItemQuantity</code> (the canonical{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">
            NumberInput
          </a>{" "}
          in its compact inline <span className="tabular-nums">− value +</span> form) and{" "}
          <code className="font-mono text-sm">OrderSummaryItemRemove</code> (the canonical{" "}
          <a href="/docs/components/button" className="underline underline-offset-4">
            Button
          </a>{" "}
          in its quiet <span className="font-mono text-sm">destructiveGhost</span> trash form).
          Wire their <code className="font-mono text-sm">onValueChange</code> /{" "}
          <code className="font-mono text-sm">onClick</code> to your cart state; here the line
          prices and the subtotal recompute live. Removing a row sets{" "}
          <code className="font-mono text-sm">leaving</code> on its{" "}
          <code className="font-mono text-sm">OrderSummaryItem</code> so it{" "}
          <strong>collapses and drifts out</strong> before it&apos;s dropped from state (the rows
          below glide up, no jump); clearing the cart shows the empty state.
        </p>
        <ComponentPreview
          previewClassName="p-6 sm:p-10"
          code={`const money = (n) => "$" + n.toFixed(2)

function ShoppingCart() {
  const [items, setItems] = React.useState(INITIAL) // [{ id, name, options, unit, qty, src }]
  const [leaving, setLeaving] = React.useState(new Set())
  const setQty = (id, qty) => setItems((p) => p.map((i) => (i.id === id ? { ...i, qty } : i)))
  const remove = (id) => setLeaving((s) => new Set(s).add(id)) // play the exit
  const finalize = (id) => {
    setItems((p) => p.filter((i) => i.id !== id))
    setLeaving((s) => { const n = new Set(s); n.delete(id); return n })
  }
  const subtotal = items.filter((i) => !leaving.has(i.id)).reduce((s, i) => s + i.unit * i.qty, 0)

  return (
    <OrderSummary className="max-w-lg">
      <OrderSummaryHeader className="flex-col items-start gap-1">
        <OrderSummaryTitle asChild><h3>Summary</h3></OrderSummaryTitle>
        <p className="text-sm text-muted-foreground">Review your items before checkout.</p>
      </OrderSummaryHeader>

      <OrderSummaryItems>
        {items.map((item) => (
          <OrderSummaryItem
            key={item.id}
            leaving={leaving.has(item.id)}
            onAnimationEnd={(e) => e.target === e.currentTarget && finalize(item.id)}
          >
            <OrderSummaryItemThumbnail>
              <img src={item.src} alt={item.name} />
            </OrderSummaryItemThumbnail>
            <OrderSummaryItemContent>
              <OrderSummaryItemName>{item.name}</OrderSummaryItemName>
              <OrderSummaryItemOptions>{item.options}</OrderSummaryItemOptions>
            </OrderSummaryItemContent>
            <OrderSummaryItemPrice>{money(item.unit * item.qty)}</OrderSummaryItemPrice>
            <OrderSummaryItemActions>
              <OrderSummaryItemQuantity
                value={item.qty}
                onValueChange={(v) => v != null && setQty(item.id, v)}
              />
              <OrderSummaryItemRemove onClick={() => remove(item.id)} />
            </OrderSummaryItemActions>
          </OrderSummaryItem>
        ))}
      </OrderSummaryItems>

      <OrderSummaryTotals>
        <OrderSummaryRow label="Subtotal">{money(subtotal)}</OrderSummaryRow>
        <OrderSummaryTotal label="Total">{money(subtotal)}</OrderSummaryTotal>
      </OrderSummaryTotals>
    </OrderSummary>
  )
}`}
        >
          <OrderSummaryShoppingCartDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Totals & tones">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">OrderSummaryTotals</code> renders a semantic{" "}
          <code className="font-mono text-sm">&lt;dl&gt;</code>. Each{" "}
          <code className="font-mono text-sm">OrderSummaryRow</code> takes a{" "}
          <code className="font-mono text-sm">label</code> (the{" "}
          <code className="font-mono text-sm">&lt;dt&gt;</code>) and its value as children (the{" "}
          <code className="font-mono text-sm">&lt;dd&gt;</code>). The{" "}
          <code className="font-mono text-sm">tone</code> prop accents the value:{" "}
          <code className="font-mono text-sm">discount</code> greens a credit,{" "}
          <code className="font-mono text-sm">muted</code> softens a &quot;Free&quot; or
          &quot;calculated later&quot; placeholder. <code className="font-mono text-sm">OrderSummaryTotal</code>{" "}
          is the emphasized grand total, set apart from the rows by extra whitespace.
        </p>
        <ComponentPreview
          previewClassName="p-10 sm:p-14"
          code={`<OrderSummaryTotals>
  <OrderSummaryRow label="Subtotal">$291.00</OrderSummaryRow>
  <OrderSummaryRow label="Shipping" tone="muted">Free</OrderSummaryRow>
  <OrderSummaryRow label="Estimated tax">$23.28</OrderSummaryRow>
  <OrderSummaryRow label="Store credit" tone="discount">-$15.00</OrderSummaryRow>
  <OrderSummaryTotal label="Total due">$299.28</OrderSummaryTotal>
</OrderSummaryTotals>`}
        >
          <OrderSummaryTotalsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Promo code">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">OrderSummaryPromo</code> is a band you fill with the
          canonical{" "}
          <a href="/docs/components/input-group" className="underline underline-offset-4">
            <code className="font-mono text-sm">InputGroup</code>
          </a>{" "}
          — a field joined to an <strong>Apply</strong> button in one seamless shell. Nothing is
          re-styled inline; the summary composes the real controls, so the promo row stays in
          lockstep with the input family.
        </p>
        <CodeSnippet
          className="mt-4"
          filename="promo.tsx"
          code={`<OrderSummaryPromo>
  <InputGroup>
    <InputRoot>
      <InputField placeholder="Promo code" />
    </InputRoot>
    <Button variant="secondary">Apply</Button>
  </InputGroup>
</OrderSummaryPromo>`}
        />
      </DocSection>

      <DocSection title="Variants & density">
        <p className="mt-4 text-pretty text-muted-foreground">
          The default <code className="font-mono text-sm">card</code> variant is the bordered
          checkout sidebar. <code className="font-mono text-sm">plain</code> drops the frame so
          the bands sit flush on whatever surface holds them — a page column or a{" "}
          <a href="/docs/components/drawer" className="underline underline-offset-4">
            Drawer
          </a>
          . Density is Koala&apos;s spacing axis:{" "}
          <code className="font-mono text-sm">comfortable</code> (the default) suits a checkout
          page; <code className="font-mono text-sm">compact</code> tightens the padding and shrinks
          the thumbnails for a mini-cart. Set it per instance or once on a{" "}
          <code className="font-mono text-sm">DensityProvider</code>.
        </p>
        <ComponentPreview
          previewClassName="p-10 sm:p-14"
          code={`<OrderSummary variant="plain" density="compact" className="max-w-xs">
  <OrderSummaryItems>
    <OrderSummaryItem>{/* …thumbnail + content + price */}</OrderSummaryItem>
    <OrderSummaryItem>{/* … */}</OrderSummaryItem>
  </OrderSummaryItems>
  <OrderSummaryTotals>
    <OrderSummaryRow label="Subtotal">$142.00</OrderSummaryRow>
    <OrderSummaryRow label="Shipping" tone="muted">Free</OrderSummaryRow>
    <OrderSummaryTotal label="Total">$142.00</OrderSummaryTotal>
  </OrderSummaryTotals>
  <OrderSummaryFooter>
    <Button className="w-full"><ShieldCheck weight="bold" /> Secure checkout</Button>
  </OrderSummaryFooter>
</OrderSummary>`}
        >
          <OrderSummaryPlainDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">OrderSummary</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The card shell (a <code className="font-mono text-sm">&lt;section&gt;</code>). Props:{" "}
              <code className="font-mono text-sm">variant</code> (
              <code className="font-mono text-sm">&quot;card&quot;</code> |{" "}
              <code className="font-mono text-sm">&quot;plain&quot;</code>, default{" "}
              <code className="font-mono text-sm">&quot;card&quot;</code>),{" "}
              <code className="font-mono text-sm">density</code> (
              <code className="font-mono text-sm">&quot;comfortable&quot;</code> |{" "}
              <code className="font-mono text-sm">&quot;compact&quot;</code>),{" "}
              <code className="font-mono text-sm">asChild</code>, plus all{" "}
              <code className="font-mono text-sm">&lt;section&gt;</code> props. Density resolves
              prop &gt; nearest <code className="font-mono text-sm">DensityProvider</code> &gt;{" "}
              <code className="font-mono text-sm">&quot;comfortable&quot;</code>.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">OrderSummaryHeader / OrderSummaryTitle</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The title band (a <code className="font-mono text-sm">justify-between</code> row) and
              its title. <code className="font-mono text-sm">OrderSummaryTitle</code> takes{" "}
              <code className="font-mono text-sm">asChild</code> to render a real heading (
              <code className="font-mono text-sm">&lt;h2&gt;</code>/
              <code className="font-mono text-sm">&lt;h3&gt;</code>).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              OrderSummaryItems / OrderSummaryItem
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The line-item <code className="font-mono text-sm">&lt;ul&gt;</code> and each{" "}
              <code className="font-mono text-sm">&lt;li&gt;</code> row. Rows stack with whitespace
              (the density-scaled <code className="font-mono text-sm">items</code> gap), no dividers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              OrderSummaryItemThumbnail
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The product tile. Holds an <code className="font-mono text-sm">&lt;img&gt;</code>{" "}
              (auto <code className="font-mono text-sm">object-cover</code> + image outline), a
              Phosphor glyph, or nothing. Prop{" "}
              <code className="font-mono text-sm">count</code> renders a quantity pill on the
              corner.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              OrderSummaryItemContent / Name / Options / Price
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The content column (name truncates), the muted options line, and the trailing line
              price (<code className="font-mono text-sm">tabular-nums</code>).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">OrderSummaryPromo</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A band; fill it with an <code className="font-mono text-sm">InputGroup</code>{" "}
              (promo field + Apply button).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              OrderSummaryTotals / OrderSummaryRow / OrderSummaryTotal
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The totals <code className="font-mono text-sm">&lt;dl&gt;</code>.{" "}
              <code className="font-mono text-sm">OrderSummaryRow</code> takes{" "}
              <code className="font-mono text-sm">label</code> (
              <code className="font-mono text-sm">&lt;dt&gt;</code>), its value as children (
              <code className="font-mono text-sm">&lt;dd&gt;</code>), and{" "}
              <code className="font-mono text-sm">tone</code> (
              <code className="font-mono text-sm">&quot;default&quot;</code> |{" "}
              <code className="font-mono text-sm">&quot;discount&quot;</code> |{" "}
              <code className="font-mono text-sm">&quot;muted&quot;</code>).{" "}
              <code className="font-mono text-sm">OrderSummaryTotal</code> is the emphasized grand
              total.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">OrderSummaryFooter</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A band for the checkout <code className="font-mono text-sm">Button</code> and a trust
              note.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "Why are the line items a <ul> and the totals a <dl>?",
              a: "Because that's what they are semantically. The items are a list of products (OrderSummaryItems renders a <ul> of <li> rows), and the totals are label/value pairs (OrderSummaryTotals renders a <dl> with <dt> labels and <dd> values). Screen readers announce them correctly with no extra ARIA.",
            },
            {
              q: "How do I wire the promo code or the Checkout button?",
              a: "OrderSummary is a presentational read-out; it owns no cart state. Compose the real controls inside the OrderSummaryPromo and OrderSummaryFooter slots — an InputGroup with your onSubmit for the promo, a Button with your onClick (or an <a asChild>) for checkout — and drive the totals from your own cart model.",
            },
            {
              q: "Can a thumbnail use a real product photo?",
              a: "Yes. Drop an <img> inside OrderSummaryItemThumbnail; it's sized to fill (object-cover) and gets the DS image outline automatically. A Phosphor glyph or an empty tile (a muted placeholder) work too, so a cart with missing imagery still looks finished.",
            },
            {
              q: "When should I reach for compact or the plain variant?",
              a: "compact tightens the padding and shrinks the thumbnails for a mini-cart or a Drawer summary; comfortable is the roomier checkout-page default. plain drops the card frame so the bands sit flush on a surface you already own (a page column, a Drawer body). Set density once on a DensityProvider to theme a whole app shell.",
            },
            {
              q: "Will the prices stay aligned as the cart updates?",
              a: "Yes. Every price — the line prices, the totals rows, and the grand total — is tabular-nums, so digits occupy a fixed width and the right-hand column never shifts as quantities or amounts change.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
