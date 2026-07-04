/**
 * The docs CodeSnippet is the canonical DS component with one docs-only default: `collapsible`
 * is ON, so long listings across the docs clamp behind a Show more / Show less pill instead of
 * running the page long. It self-gates (short snippets render in full), and any call site can
 * opt out with `collapsible={false}`. The source of truth lives in components/ui/code-snippet.
 */
import {
  CodeSnippet as BaseCodeSnippet,
  type CodeSnippetProps,
} from "@/components/ui/code-snippet"

export { codeSnippetVariants, type CodeSnippetProps } from "@/components/ui/code-snippet"

export function CodeSnippet({ collapsible = true, ...props }: CodeSnippetProps) {
  return <BaseCodeSnippet collapsible={collapsible} {...props} />
}
