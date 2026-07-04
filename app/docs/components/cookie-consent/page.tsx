import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  CookieBannerDemo,
  CookiePositionsDemo,
  CookiePreferencesDemo,
} from "./cookie-consent-demos"

export const metadata = { title: "Cookie Consent" }

const HERO_CODE = `<CookieConsent categories={categories} onAcceptAll={persist} onRejectAll={persist} onSave={persist}>
  <CookieBanner position="bottom-right">
    <CookieBannerIcon><Cookie /></CookieBannerIcon>
    <CookieBannerContent>
      <CookieBannerTitle>We value your privacy</CookieBannerTitle>
      <CookieBannerDescription>
        We use cookies to enhance your experience and analyse traffic. Read our{" "}
        <a href="/cookies" className="font-medium text-foreground underline underline-offset-4">
          Cookie Policy
        </a>.
      </CookieBannerDescription>
    </CookieBannerContent>
    <CookieBannerActions>
      <CookieCustomizeButton size="sm" />
      <CookieRejectAllButton size="sm" />
      <CookieAcceptAllButton size="sm" />
    </CookieBannerActions>
  </CookieBanner>

  <CookiePreferences>
    <CookiePreferencesContent>
      <CookiePreferencesHeader>
        <CookiePreferencesTitle>Cookie preferences</CookiePreferencesTitle>
        <CookiePreferencesDescription>Choose which cookies we can use.</CookiePreferencesDescription>
      </CookiePreferencesHeader>
      <CookieCategoryList />
      <CookiePreferencesFooter>
        <CookieRejectAllButton variant="ghost" />
        <CookieSavePreferencesButton />
      </CookiePreferencesFooter>
    </CookiePreferencesContent>
  </CookiePreferences>
</CookieConsent>`

export default function CookieConsentDocsPage() {
  return (
    <>
      <DocHeader
        title="Cookie Consent"
        description="A GDPR-ready consent surface in two coordinated pieces over one shared state: a non-blocking banner and a preferences dialog where each cookie category gets its own toggle. Cookie Consent owns the state and semantics; the parts are the real DS components: toggles are Switch, actions are Button, the dialog is Dialog, and the locked categories wear a Badge."
      />

      <ComponentPreview previewClassName="block" code={HERO_CODE}>
        <CookieBannerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="cookie-consent" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { ShieldCheck, ChartBar } from "@phosphor-icons/react"
import {
  CookieConsent,
  CookieBanner,
  CookieBannerContent,
  CookieBannerTitle,
  CookieBannerDescription,
  CookieBannerActions,
  CookieAcceptAllButton,
  CookieRejectAllButton,
  CookieCustomizeButton,
  CookiePreferences,
  CookiePreferencesContent,
  CookiePreferencesHeader,
  CookiePreferencesTitle,
  CookieCategoryList,
  CookiePreferencesFooter,
  CookieSavePreferencesButton,
  type CookieCategoryDef,
} from "@/components/ui/cookie-consent"

const categories: CookieCategoryDef[] = [
  { id: "necessary", label: "Strictly necessary", required: true, icon: ShieldCheck, description: "Essential for the site to work." },
  { id: "analytics", label: "Analytics", icon: ChartBar, description: "Help us understand how the site is used." },
]

export function Example() {
  return (
    <CookieConsent categories={categories} onSave={(prefs) => savePreferences(prefs)}>
      <CookieBanner position="bottom-right">
        <CookieBannerContent>
          <CookieBannerTitle>We value your privacy</CookieBannerTitle>
          <CookieBannerDescription>We use cookies to improve your experience.</CookieBannerDescription>
        </CookieBannerContent>
        <CookieBannerActions>
          <CookieCustomizeButton size="sm" />
          <CookieRejectAllButton size="sm" />
          <CookieAcceptAllButton size="sm" />
        </CookieBannerActions>
      </CookieBanner>

      <CookiePreferences>
        <CookiePreferencesContent>
          <CookiePreferencesHeader>
            <CookiePreferencesTitle>Cookie preferences</CookiePreferencesTitle>
          </CookiePreferencesHeader>
          <CookieCategoryList />
          <CookiePreferencesFooter>
            <CookieRejectAllButton variant="ghost" />
            <CookieSavePreferencesButton />
          </CookiePreferencesFooter>
        </CookiePreferencesContent>
      </CookiePreferences>
    </CookieConsent>
  )
}`}
        />
      </DocSection>

      <DocSection title="Preferences dialog">
        <p className="mt-4 text-pretty text-muted-foreground">
          The configurator is a DS <code className="font-mono text-sm">Dialog</code> bound to the
          same shared state. <code className="font-mono text-sm">CookieCategoryList</code> maps your{" "}
          <code className="font-mono text-sm">categories</code> into rows, each with a leading icon,
          a description, and a <code className="font-mono text-sm">Switch</code>. Required categories
          render locked-on with an <em>Always on</em> badge. Open it from the banner&apos;s{" "}
          <code className="font-mono text-sm">CookieCustomizeButton</code>, or from a standalone{" "}
          <code className="font-mono text-sm">CookiePreferencesTrigger</code> anywhere on the page.
        </p>
        <ComponentPreview
          code={`<CookieConsent categories={categories} defaultConsented>
  <CookiePreferences>
    <CookiePreferencesTrigger asChild>
      <Button variant="outline"><Gear /> Cookie settings</Button>
    </CookiePreferencesTrigger>
    <CookiePreferencesContent>
      <CookiePreferencesHeader>
        <CookiePreferencesTitle>Cookie preferences</CookiePreferencesTitle>
        <CookiePreferencesDescription>
          Choose which cookies we can use. Strictly necessary cookies are always on.
        </CookiePreferencesDescription>
      </CookiePreferencesHeader>
      <CookieCategoryList />
      <CookiePreferencesFooter>
        <CookieRejectAllButton variant="ghost" />
        <CookieAcceptAllButton variant="secondary" />
        <CookieSavePreferencesButton />
      </CookiePreferencesFooter>
    </CookiePreferencesContent>
  </CookiePreferences>
</CookieConsent>`}
        >
          <CookiePreferencesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Position">
        <p className="mt-4 text-pretty text-muted-foreground">
          <code className="font-mono text-sm">position</code> anchors the banner:{" "}
          <code className="font-mono text-sm">bottom</code> is a full-bleed bar that rows its
          content out on wide screens, while{" "}
          <code className="font-mono text-sm">bottom-left</code> and{" "}
          <code className="font-mono text-sm">bottom-right</code> are compact floating cards. Each
          slides in from its own edge.
        </p>
        <ComponentPreview
          previewClassName="block"
          code={`<CookieBanner position="bottom"> … </CookieBanner>
<CookieBanner position="bottom-left"> … </CookieBanner>
<CookieBanner position="bottom-right"> … </CookieBanner>`}
        >
          <CookiePositionsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 flex flex-col gap-6 text-sm">
          <div>
            <h3 className="font-mono text-sm font-semibold">CookieConsent</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The root and single source of truth. Owns the category booleans and the coordinated
              actions; both surfaces read from it.
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">categories</code>: the cookie categories to
                manage (<code className="font-mono text-sm">CookieCategoryDef[]</code>): each has an{" "}
                <code className="font-mono text-sm">id</code>,{" "}
                <code className="font-mono text-sm">label</code>, optional{" "}
                <code className="font-mono text-sm">description</code>,{" "}
                <code className="font-mono text-sm">icon</code>, and{" "}
                <code className="font-mono text-sm">required</code> (locks the toggle on).
              </li>
              <li>
                <code className="font-mono text-sm">value</code> /{" "}
                <code className="font-mono text-sm">defaultValue</code> /{" "}
                <code className="font-mono text-sm">onValueChange</code>: the preferences map (
                <code className="font-mono text-sm">{`{ [id]: boolean }`}</code>), controlled or
                uncontrolled. Required categories are always clamped on.
              </li>
              <li>
                <code className="font-mono text-sm">onAcceptAll</code> /{" "}
                <code className="font-mono text-sm">onRejectAll</code> /{" "}
                <code className="font-mono text-sm">onSave</code>: fire on each coordinated action
                with the resulting map. Persist it (cookie / localStorage) here.
              </li>
              <li>
                <code className="font-mono text-sm">open</code> /{" "}
                <code className="font-mono text-sm">defaultOpen</code> /{" "}
                <code className="font-mono text-sm">onOpenChange</code>: the preferences dialog open
                state.
              </li>
              <li>
                <code className="font-mono text-sm">defaultConsented</code>: start with the banner
                hidden (pass <code className="font-mono text-sm">true</code> for returning visitors).
              </li>
              <li>
                <code className="font-mono text-sm">density</code>:{" "}
                <code className="font-mono text-sm">comfortable</code> (default) or{" "}
                <code className="font-mono text-sm">compact</code>.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-sm font-semibold">CookieBanner</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The non-blocking consent region (<code className="font-mono text-sm">role=&quot;region&quot;</code>),
              hidden once a choice is made. Takes{" "}
              <code className="font-mono text-sm">position</code> (
              <code className="font-mono text-sm">bottom</code> /{" "}
              <code className="font-mono text-sm">bottom-left</code> /{" "}
              <code className="font-mono text-sm">bottom-right</code>). Compose{" "}
              <code className="font-mono text-sm">CookieBannerIcon</code>,{" "}
              <code className="font-mono text-sm">CookieBannerContent</code>,{" "}
              <code className="font-mono text-sm">CookieBannerTitle</code>,{" "}
              <code className="font-mono text-sm">CookieBannerDescription</code>, and{" "}
              <code className="font-mono text-sm">CookieBannerActions</code> inside.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm font-semibold">CookiePreferences</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The dialog family: <code className="font-mono text-sm">CookiePreferences</code> (root,
              bound to the shared open state), <code className="font-mono text-sm">CookiePreferencesTrigger</code>{" "}
              (<code className="font-mono text-sm">asChild</code>),{" "}
              <code className="font-mono text-sm">CookiePreferencesContent</code>,{" "}
              <code className="font-mono text-sm">CookiePreferencesHeader</code> /{" "}
              <code className="font-mono text-sm">Title</code> /{" "}
              <code className="font-mono text-sm">Description</code> /{" "}
              <code className="font-mono text-sm">Footer</code>, and{" "}
              <code className="font-mono text-sm">CookieCategoryList</code> /{" "}
              <code className="font-mono text-sm">CookieCategory</code> for the rows.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm font-semibold">Action buttons &amp; hook</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              Pre-wired DS Buttons:{" "}
              <code className="font-mono text-sm">CookieAcceptAllButton</code>,{" "}
              <code className="font-mono text-sm">CookieRejectAllButton</code>,{" "}
              <code className="font-mono text-sm">CookieCustomizeButton</code>,{" "}
              <code className="font-mono text-sm">CookieSavePreferencesButton</code>. Each forwards
              every <code className="font-mono text-sm">Button</code> prop. For a custom surface, read
              the state directly with the{" "}
              <code className="font-mono text-sm">useCookieConsent()</code> hook.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I reach for Cookie Consent instead of a plain Dialog?",
              a: "Use Cookie Consent when you need a GDPR/ePrivacy consent flow specifically: it pairs a non-blocking CookieBanner with a CookiePreferences dialog over one shared state, so toggling a category and clicking Accept all mutate the same source of truth. A plain Dialog gives you a modal but none of the category booleans, the always-on clamping, or the coordinated accept/reject/save actions.",
            },
            {
              q: "How do I persist the visitor's choice and stop the banner reappearing?",
              a: "Persist the map you receive in onAcceptAll, onRejectAll, and onSave (write it to a cookie or localStorage). On the next visit, read that stored value and pass defaultConsented so the banner starts hidden and only first-time visitors see it.",
            },
            {
              q: "How do I mark a category like Strictly necessary as non-optional?",
              a: "Set required: true on that CookieCategoryDef. The root clamps it on in the preferences map regardless of value or defaultValue, and CookieCategory renders its Switch disabled-on with an Always on Badge.",
            },
            {
              q: "Can I open the preferences dialog from somewhere other than the banner, like a footer link?",
              a: "Yes. Wrap your own element in CookiePreferencesTrigger with asChild, or read the state directly with the useCookieConsent() hook and call setDialogOpen(true) from any custom surface such as a footer Cookie settings link.",
            },
            {
              q: "How do the action buttons behave, and can I restyle them?",
              a: "CookieAcceptAllButton, CookieRejectAllButton, CookieCustomizeButton, and CookieSavePreferencesButton are thin DS Button wrappers with the consent action pre-bound, so they forward every Button prop including variant and size. An onClick you pass still runs after the consent action fires, so the defaults are a starting point, not a cage.",
            },
            {
              q: "Does Cookie Consent respond to density, and where does that come from?",
              a: "It does. Pass density=\"compact\" on CookieConsent or let it inherit from a surrounding DensityProvider; compact tightens the banner padding and the category rows without touching radius or color, while the dialog picks up the same density through CookiePreferencesContent.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}
