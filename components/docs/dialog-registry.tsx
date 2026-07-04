import type { ComponentType } from "react"

import {
  DefaultDialog,
  ConfirmationDialog,
  CompactDialog,
  ScrollableDialog,
  ShareDialog,
  AnnouncementDialog,
} from "@/app/docs/components/dialog/variants-demo"
import {
  FeedbackDialog,
  TwoFactorDialog,
  SelectableCardsDialog,
  UpgradeDialog,
} from "@/app/docs/components/dialog/figma-patterns-demo"
import { FormDialogDemo } from "@/app/docs/components/dialog/unsaved-changes-demo"
import { WizardDialogDemo } from "@/app/docs/components/dialog/wizard-demo"

/**
 * Registry for the Dialog docs' responsive previews, the sibling of `sections-registry` for a
 * single component's variants. Each entry is an inline (non-portal, always-open) dialog demo that
 * the render target (app/preview/dialogs/[slug]) paints centered over a dimmed backdrop, inside the
 * docs `PreviewFrame` iframe. Rendering inline is what lets the dialog reshape with the FRAME width
 * (the 30rem card shrinking on a phone, the two-column Upgrade collapsing to one), which a real
 * portalled dialog anchored to the viewport could not show. The Dialog docs page keys its
 * `PreviewFrame src="/preview/dialogs/<slug>"` blocks off these slugs.
 *
 * A plain server-importable module (no "use client"): it only holds references to the client demo
 * components, exactly like `sections-registry`, and the route renders them.
 */
export interface DialogPreviewEntry {
  component: ComponentType
}

export const DIALOG_PREVIEWS: Record<string, DialogPreviewEntry> = {
  default: { component: DefaultDialog },
  confirmation: { component: ConfirmationDialog },
  form: { component: FormDialogDemo },
  compact: { component: CompactDialog },
  feedback: { component: FeedbackDialog },
  "two-factor": { component: TwoFactorDialog },
  "selectable-cards": { component: SelectableCardsDialog },
  scrollable: { component: ScrollableDialog },
  share: { component: ShareDialog },
  announcement: { component: AnnouncementDialog },
  wizard: { component: WizardDialogDemo },
  upgrade: { component: UpgradeDialog },
}
