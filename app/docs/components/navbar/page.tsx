import { ComponentPreview } from "@/components/docs/component-preview"
import { PremiumCode } from "@/components/docs/premium-code"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  NavbarDemo,
  NavbarFloatingDemo,
  NavbarElevateOnScrollDemo,
  NavbarCenterDemo,
  NavbarRightDemo,
  NavbarEcommerceDemo,
  NavbarSearchDemo,
  NavbarProductDemo,
  NavbarLogoMiddleDemo,
  NavbarMultiButtonDemo,
  NavbarBadgeDemo,
  NavbarCompactDemo,
} from "./demos"

export const metadata = { title: "Navbar" }

export default function NavbarDocsPage() {
  return (
    <>
      <DocHeader
        title="Navbar"
        description="A composable top navigation bar for marketing, product, and ecommerce shells. Layout is composition, not configuration: a NavbarSpacer pushes groups apart, so the same parts assemble links-left, links-middle, or links-right. Collapses to a hamburger disclosure below md."
      />

      <ComponentPreview
        locked
        previewClassName="block p-6"
        code={`<Navbar>
  <NavbarInner>
    <NavbarBrand href="/"><BrandMark /></NavbarBrand>
    <NavbarNav>
      <NavbarLink href="#">Home</NavbarLink>
      <NavbarLink href="#" active>Features</NavbarLink>
      <NavbarLink href="#">Pricing</NavbarLink>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <NavbarLink asChild>
            <button type="button">Company<CaretDown /></button>
          </NavbarLink>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">…</DropdownMenuContent>
      </DropdownMenu>
    </NavbarNav>
    <NavbarSpacer />
    <NavbarActions>
      <Button size="sm" variant="ghost">Sign in</Button>
      <Button size="sm">Sign up</Button>
    </NavbarActions>
    <NavbarMobileToggle />
  </NavbarInner>
  <NavbarMobileMenu>
    <NavbarMobileLink href="#">Home</NavbarMobileLink>
    …
  </NavbarMobileMenu>
</Navbar>`}
      >
        <NavbarDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="navbar" />
      </DocSection>

      <DocSection title="Usage">
        <PremiumCode className="mt-4" />
      </DocSection>

      <DocSection title="Floating">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">variant=&quot;floating&quot;</code> detaches the bar
          into a rounded card that hovers over the page. Give it top margin and a background to
          float over.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<div className="p-3">
  <Navbar variant="floating">
    <NavbarInner>…</NavbarInner>
  </Navbar>
</div>`}
        >
          <NavbarFloatingDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Elevate on scroll">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">elevateOnScroll</code> rests the bar flat,
          borderless and shadowless, flush with the content, then brings its border and shadow
          in together the moment the page scrolls under it. Pair it with{" "}
          <code className="font-mono text-sm">sticky top-0</code>. The bar listens to the nearest
          scroll container, so it works on a page or inside a panel; scroll the preview to see it
          engage.
        </p>
        <ComponentPreview
          locked
          previewClassName="block p-6"
          code={`<Navbar variant="floating" elevateOnScroll className="sticky top-0 z-50 pt-3">
  <NavbarInner>…</NavbarInner>
</Navbar>`}
        >
          <NavbarElevateOnScrollDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Alignment">
        <p className="mt-4 text-pretty text-muted-foreground">
          There is no alignment prop. A{" "}
          <code className="font-mono text-sm">NavbarSpacer</code> pushes the groups on either side
          of it apart: one spacer pins the nav to the right, two spacers center it.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`{/* Centered: spacers on both sides of the nav */}
<NavbarInner>
  <NavbarBrand href="/"><BrandMark /></NavbarBrand>
  <NavbarSpacer />
  <NavbarNav>…</NavbarNav>
  <NavbarSpacer />
  <NavbarActions>…</NavbarActions>
</NavbarInner>`}
        >
          <NavbarCenterDemo />
        </ComponentPreview>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`{/* Right: a single spacer after the brand */}
<NavbarInner>
  <NavbarBrand href="/"><BrandMark /></NavbarBrand>
  <NavbarSpacer />
  <NavbarNav>…</NavbarNav>
  <NavbarActions>…</NavbarActions>
</NavbarInner>`}
        >
          <NavbarRightDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Dropdown links">
        <p className="mt-4 text-pretty text-muted-foreground">
          A link that opens a menu is a{" "}
          <code className="font-mono text-sm">NavbarLink</code> wrapped in the standard{" "}
          <a href="/docs/components/dropdown-menu" className="underline underline-offset-4">
            DropdownMenu
          </a>
          . The caret flips when its menu opens.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <NavbarLink asChild>
      <button type="button">Company<CaretDown /></button>
    </NavbarLink>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem>About us</DropdownMenuItem>
    <DropdownMenuItem>Careers</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <NavbarDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Search">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">NavbarSearch</code> is the DS{" "}
          <a href="/docs/components/input" className="underline underline-offset-4">Input</a>{" "}
          with a leading magnifier. Set a width like{" "}
          <code className="font-mono text-sm">w-64</code> for a normal field, or{" "}
          <code className="font-mono text-sm">flex-1</code> to fill the center of the bar.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<NavbarInner>
  <NavbarBrand href="/"><BrandMark /></NavbarBrand>
  <NavbarNav>…</NavbarNav>
  <NavbarSpacer />
  <NavbarSearch placeholder="Search anything" className="w-64" />
  <NavbarActions><Button size="sm">Sign up</Button></NavbarActions>
</NavbarInner>`}
        >
          <NavbarSearchDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Product app shell">
        <p className="mt-4 text-pretty text-muted-foreground">
          A compact bar with a global search and an account cluster. Pass{" "}
          <code className="font-mono text-sm">bg-muted border-transparent</code> to{" "}
          <code className="font-mono text-sm">NavbarSearch</code> for the pill look, and drop an{" "}
          <a href="/docs/components/avatar" className="underline underline-offset-4">Avatar</a>{" "}
          into <code className="font-mono text-sm">NavbarActions</code>.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<Navbar density="compact">
  <NavbarInner>
    <NavbarBrand href="/"><BrandMark /></NavbarBrand>
    <NavbarNav className="ml-2">…</NavbarNav>
    <NavbarSearch className="ml-auto w-64 bg-muted border-transparent" />
    <NavbarActions>
      <Button size="sm" variant="ghost" iconOnly aria-label="Help"><Question /></Button>
      <Button size="sm" variant="ghost" iconOnly aria-label="Notifications"><Bell /></Button>
      <Avatar size="sm">
        <AvatarImage src="https://i.pravatar.cc/160?img=15" alt="Account" />
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
    </NavbarActions>
  </NavbarInner>
</Navbar>`}
        >
          <NavbarProductDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Logo in the middle">
        <p className="mt-4 text-pretty text-muted-foreground">
          A 3-column grid on <code className="font-mono text-sm">NavbarInner</code> centers the
          brand independently of the side groups: links left, logo centered, actions right.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<NavbarInner className="grid grid-cols-[1fr_auto_1fr]">
  <NavbarNav>…</NavbarNav>
  <NavbarBrand href="/" className="justify-self-center"><BrandMark /></NavbarBrand>
  <NavbarActions className="justify-self-end">…</NavbarActions>
</NavbarInner>`}
        >
          <NavbarLogoMiddleDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Multiple actions">
        <p className="mt-4 text-pretty text-muted-foreground">
          Stack a ghost link, an outline secondary, and a solid primary in{" "}
          <code className="font-mono text-sm">NavbarActions</code> for a stronger conversion path.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<NavbarActions>
  <Button size="sm" variant="ghost">Log in</Button>
  <Button size="sm" variant="outline">Get a demo</Button>
  <Button size="sm">Sign up free</Button>
</NavbarActions>`}
        >
          <NavbarMultiButtonDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Badge beside the brand">
        <p className="mt-4 text-pretty text-muted-foreground">
          Group a{" "}
          <a href="/docs/components/badge" className="underline underline-offset-4">Badge</a>{" "}
          next to <code className="font-mono text-sm">NavbarBrand</code> to flag a beta, plan, or
          environment.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<div className="flex items-center gap-2">
  <NavbarBrand href="/"><BrandMark /></NavbarBrand>
  <Badge variant="secondary" size="sm" pill>Beta</Badge>
</div>`}
        >
          <NavbarBadgeDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Ecommerce">
        <p className="mt-4 text-pretty text-muted-foreground">
          The same parts build a storefront header: swap the marketing CTAs in{" "}
          <code className="font-mono text-sm">NavbarActions</code> for search, account, and cart
          icon buttons.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<NavbarActions>
  <Button size="sm" variant="ghost" iconOnly aria-label="Search"><MagnifyingGlass /></Button>
  <Button size="sm" variant="ghost" iconOnly aria-label="Account"><User /></Button>
  <Button size="sm" variant="ghost" iconOnly aria-label="Cart"><ShoppingCart /></Button>
</NavbarActions>`}
        >
          <NavbarEcommerceDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Density">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">density</code> tightens the bar height and gutters
          for application shells. Set it per navbar or for a whole subtree with{" "}
          <code className="font-mono text-sm">DensityProvider</code>. See{" "}
          <a href="/docs/foundations/density" className="underline underline-offset-4">Density</a>.
        </p>
        <ComponentPreview
          locked
        previewClassName="block p-6"
          code={`<Navbar density="compact">
  <NavbarInner>…</NavbarInner>
</Navbar>`}
        >
          <NavbarCompactDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono font-semibold">Navbar</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root <code className="font-mono text-sm">&lt;header&gt;</code>. Owns the mobile
              disclosure state and provides the styling context to every part. Forwards all{" "}
              <code className="font-mono text-sm">&lt;header&gt;</code> props.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">variant</code>: <code className="font-mono text-sm">&quot;full&quot;</code> (default) or{" "}
                <code className="font-mono text-sm">&quot;floating&quot;</code>.
              </li>
              <li>
                <code className="font-mono text-sm">density</code>:{" "}
                <code className="font-mono text-sm">&quot;comfortable&quot;</code> (default) or{" "}
                <code className="font-mono text-sm">&quot;compact&quot;</code>. Falls back to the nearest{" "}
                <code className="font-mono text-sm">DensityProvider</code>.
              </li>
              <li>
                <code className="font-mono text-sm">open</code> /{" "}
                <code className="font-mono text-sm">defaultOpen</code> /{" "}
                <code className="font-mono text-sm">onOpenChange</code>: control the mobile menu.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono font-semibold">NavbarInner</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The max-width content row. Holds the brand, nav, spacers, actions, and toggle.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">NavbarBrand</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The logo lockup; renders an <code className="font-mono text-sm">&lt;a&gt;</code>.
              Pass <code className="font-mono text-sm">asChild</code> to use a framework{" "}
              <code className="font-mono text-sm">&lt;Link&gt;</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">NavbarNav</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The horizontal link list (a labelled{" "}
              <code className="font-mono text-sm">&lt;nav&gt;</code>); hidden below md.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">NavbarLink</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A ghost-styled link. <code className="font-mono text-sm">active</code> adds the brand
              underline and <code className="font-mono text-sm">aria-current=&quot;page&quot;</code>;{" "}
              <code className="font-mono text-sm">asChild</code> renders a custom element or a menu
              trigger.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">NavbarSearch</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The DS <code className="font-mono text-sm">Input</code> with a leading magnifier and
              a default width. Forwards <code className="font-mono text-sm">InputRoot</code> props
              (<code className="font-mono text-sm">size</code>,{" "}
              <code className="font-mono text-sm">hasError</code>…);{" "}
              <code className="font-mono text-sm">inputProps</code> reaches the underlying{" "}
              <code className="font-mono text-sm">&lt;input&gt;</code>.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              NavbarActions · NavbarSpacer
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              <code className="font-mono text-sm">NavbarActions</code> is the right-hand cluster;{" "}
              <code className="font-mono text-sm">NavbarSpacer</code> is a flexible gap that drives
              alignment.
            </p>
          </div>
          <div>
            <h3 className="font-mono font-semibold">
              NavbarMobileToggle · NavbarMobileMenu · NavbarMobileLink
            </h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The hamburger, the disclosed panel (mounts only while open), and its stacked links.
              All visible only below md.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "How do I align the links left, center, or right? There is no alignment prop.", a: "Alignment is composition, not configuration: drop a `NavbarSpacer` between groups to push them apart. One spacer after the brand pins the nav right; two spacers, one on each side of the nav, center it." },
            { q: "What does variant=\"floating\" do?", a: "It detaches the bar into a rounded card that hovers over the page instead of painting a full-bleed bottom rule. Give it top margin and a background to float over. The default is `variant=\"full\"`." },
            { q: "How do I add a link that opens a dropdown menu?", a: "Wrap a `NavbarLink` in the standard DropdownMenu and render it `asChild` over a `<button>` trigger. The caret flips automatically when the menu opens because the link reads `data-state=open`." },
            { q: "How does the mobile menu work?", a: "Below md the nav collapses to a hamburger. `Navbar` owns the disclosure state (`open` / `defaultOpen` / `onOpenChange`); add a `NavbarMobileToggle` and a `NavbarMobileMenu` of `NavbarMobileLink` rows, which mount only while open." },
            { q: "How do I mark the current page on a NavbarLink?", a: "Set `active` on the `NavbarLink`. It adds the brand underline indicator and sets `aria-current=\"page\"` for assistive tech." },
            { q: "What is NavbarSearch and how do I size it?", a: "`NavbarSearch` is the DS Input with a leading magnifier. Give it a width like `w-64` for a normal field or `flex-1` to fill the center of the bar; it forwards `InputRoot` props, and `inputProps` reaches the underlying `<input>`." },
          ]}
        />
      </DocSection>
    </>
  )
}
