import { DocsShell } from "@/components/docs/docs-shell"

/**
 * The `/app` tree (application-domain sections + pages) shares the exact docs chrome, so the
 * global sidebar, search, and theme/accent switchers are identical to `/docs` and `/marketing`.
 * It is the application-domain sibling of `/marketing/sections`: the first home for full app
 * SCREENS (auth today; settings, dashboards, empty states to follow). See memory `site-ia-tiers`.
 */
export default function AppSectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocsShell>{children}</DocsShell>
}
