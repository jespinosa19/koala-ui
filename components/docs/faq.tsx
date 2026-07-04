import type { ReactNode } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

/** One question/answer pair. `a` accepts rich content (inline <code>, links) or a plain string. */
export type FaqItem = { q: string; a: ReactNode }

/**
 * The docs FAQ block: a contained Accordion of common "how do I" questions, dropped at the
 * foot of every component page. Single-expand and collapsible so the list stays scannable;
 * the first row opens by default so the section never reads as an empty stack of triggers.
 *
 * Answers are authored as plain prose (with the occasional inline <code>), so they dogfood the
 * Accordion's own `text-muted-foreground` content styling. We bump the answer to `font-medium`
 * (matching the question's weight) so both the questions and the content read at medium 500.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible defaultValue="faq-0" variant="minimal" className="mt-6">
      {items.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent className="font-medium">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
