import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import { TreeDemo, SelectionDemo, CategoryDemo, ReorderDemo } from "./tree-examples-demo"

export const metadata = { title: "Tree" }

export default function TreeDocsPage() {
  return (
    <>
      <DocHeader
        title="Tree"
        description="A nesting tree view for file explorers, category browsers, and any hierarchy. Built on Radix Collapsible for each branch's expand/collapse, with single-selection, full keyboard navigation (arrows to move, expand, and collapse), and CSS guide rails that trace every level of nesting."
      />

      <ComponentPreview code={HERO_CODE} previewClassName="min-h-[32rem]">
        <TreeDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="tree" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { Tree, TreeItem } from "@/components/ui/tree"

export function Example() {
  return (
    <Tree defaultExpandedValues={["src"]}>
      <TreeItem value="src" label="src">
        <TreeItem value="index.ts" label="index.ts" />
      </TreeItem>
      <TreeItem value="package.json" label="package.json" />
    </Tree>
  )
}`}
        />
        <p className="mt-4 text-pretty text-muted-foreground">
          A <code className="font-mono text-sm">TreeItem</code> with children is a branch (it renders
          a caret and a collapsible panel); without children it&apos;s a leaf. The{" "}
          <code className="font-mono text-sm">value</code> is the node&apos;s stable identity for
          selection and expansion. Pass <code className="font-mono text-sm">label</code> and{" "}
          <code className="font-mono text-sm">icon</code> so every row stays visually consistent, and
          nest items as <code className="font-mono text-sm">children</code> for depth.
        </p>
      </DocSection>

      <DocSection title="Selection">
        <p className="mt-4 text-pretty text-muted-foreground">
          Tree holds a single selection. Control it with{" "}
          <code className="font-mono text-sm">value</code> /{" "}
          <code className="font-mono text-sm">onValueChange</code>, or let it manage its own with{" "}
          <code className="font-mono text-sm">defaultValue</code>. Mark any node{" "}
          <code className="font-mono text-sm">disabled</code> to take it out of selection, expansion,
          and the keyboard order.
        </p>
        <ComponentPreview code={SELECTION_CODE} previewClassName="min-h-[21rem]">
          <SelectionDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Trailing actions & guides">
        <p className="mt-4 text-pretty text-muted-foreground">
          The tree isn&apos;t only for files. Drop a count, a badge, or a menu in the{" "}
          <code className="font-mono text-sm">actions</code> slot, and turn off the indent rails with{" "}
          <code className="font-mono text-sm">guides={`{false}`}</code> when the icons alone carry the
          hierarchy.
        </p>
        <ComponentPreview code={CATEGORY_CODE} previewClassName="min-h-[15rem]">
          <CategoryDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Drag to reorder">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">onMove</code> and every row becomes draggable.
          Drop near the top or bottom of a row to place a node{" "}
          <code className="font-mono text-sm">before</code> or{" "}
          <code className="font-mono text-sm">after</code> it, or onto the middle of a folder to drop
          it <code className="font-mono text-sm">inside</code>. The tree doesn&apos;t own your data, so
          it reports the move and you apply it; dropping a node into its own subtree is blocked, and{" "}
          <code className="font-mono text-sm">Alt</code> + <code className="font-mono text-sm">↑</code>{" "}
          / <code className="font-mono text-sm">↓</code> reorders siblings from the keyboard.
        </p>
        <ComponentPreview code={REORDER_CODE} previewClassName="min-h-[23rem]">
          <ReorderDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Keyboard">
        <p className="mt-4 text-pretty text-muted-foreground">
          Focus the tree and navigate without the mouse:{" "}
          <code className="font-mono text-sm">↑</code> / <code className="font-mono text-sm">↓</code>{" "}
          move between visible rows, <code className="font-mono text-sm">→</code> expands a collapsed
          branch then steps into it, <code className="font-mono text-sm">←</code> collapses an open
          branch then steps out to its parent, <code className="font-mono text-sm">Home</code> /{" "}
          <code className="font-mono text-sm">End</code> jump to the first and last rows, and{" "}
          <code className="font-mono text-sm">Enter</code> /{" "}
          <code className="font-mono text-sm">Space</code> select (and toggle a branch).
        </p>
      </DocSection>

      <DocSection title="API reference">
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">Tree</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              The <code className="font-mono text-sm">role=&quot;tree&quot;</code> root. Owns selection
              and expansion state and forwards every other <code className="font-mono text-sm">ul</code>{" "}
              prop.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">value</code> /{" "}
                <code className="font-mono text-sm">defaultValue</code> /{" "}
                <code className="font-mono text-sm">onValueChange</code>: the selected node&apos;s{" "}
                <code className="font-mono text-sm">value</code> (single selection).
              </li>
              <li>
                <code className="font-mono text-sm">expandedValues</code> /{" "}
                <code className="font-mono text-sm">defaultExpandedValues</code> /{" "}
                <code className="font-mono text-sm">onExpandedChange</code>: the set of expanded
                branch values.
              </li>
              <li>
                <code className="font-mono text-sm">guides</code>: show the nesting guide rails
                (default <code className="font-mono text-sm">true</code>).
              </li>
              <li>
                <code className="font-mono text-sm">onMove</code>: enables drag-to-reorder (and
                Alt+↑/↓); fires <code className="font-mono text-sm">{`{ value, target, position }`}</code>{" "}
                where <code className="font-mono text-sm">position</code> is{" "}
                <code className="font-mono text-sm">before</code> /{" "}
                <code className="font-mono text-sm">after</code> /{" "}
                <code className="font-mono text-sm">inside</code>. Apply it to your own data.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">TreeItem</h3>
            <p className="mt-1 text-pretty text-muted-foreground">
              A node. A branch when it has <code className="font-mono text-sm">children</code>, a leaf
              when it doesn&apos;t. Forwards every other <code className="font-mono text-sm">li</code>{" "}
              prop.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code className="font-mono text-sm">value</code>: required stable identity for
                selection and expansion.
              </li>
              <li>
                <code className="font-mono text-sm">label</code>: the row label.
              </li>
              <li>
                <code className="font-mono text-sm">icon</code> /{" "}
                <code className="font-mono text-sm">expandedIcon</code>: leading glyph, with an
                optional swap while a branch is open.
              </li>
              <li>
                <code className="font-mono text-sm">actions</code>: trailing content (a count, a
                badge, a menu).
              </li>
              <li>
                <code className="font-mono text-sm">disabled</code>: removes the node from selection,
                expansion, and focus.
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            { q: "What makes a TreeItem a branch instead of a leaf?", a: "Children. A `TreeItem` with nested `TreeItem` children renders a caret and a collapsible panel (a branch); one without children is a leaf. There is no separate type prop, just the presence of `children`." },
            { q: "How do I control which node is selected?", a: "Tree holds a single selection. Drive it with `value` and `onValueChange` for a controlled tree, or pass `defaultValue` to let it manage its own. Each `TreeItem` needs a stable `value` since that is the identity used for both selection and expansion." },
            { q: "How does drag-to-reorder work given the tree does not own my data?", a: "Pass `onMove` and every row becomes draggable. It fires `{ value, target, position }` where `position` is `before`, `after`, or `inside`, and you apply that move to your own data; dropping a node into its own subtree is blocked for you." },
            { q: "What do the arrow keys do?", a: "With the tree focused, up and down move between visible rows, right expands a collapsed branch then steps in, and left collapses an open branch then steps out to the parent. Home and End jump to the first and last rows, Enter or Space select, and with `onMove` set, Alt plus up or down reorders siblings." },
            { q: "How do I turn off the indent guide rails?", a: "Pass `guides={false}` on the `Tree` root. The rails are on by default; switch them off when leading icons alone carry the hierarchy, as in the category browser example." },
            { q: "How do I add a count or menu to a row?", a: "Use the `actions` slot on `TreeItem` for trailing content like a Badge, a count, or a menu. For the leading glyph use `icon`, and optionally `expandedIcon` to swap it (for example Folder to FolderOpen) while a branch is open." },
          ]}
        />
      </DocSection>
    </>
  )
}

const HERO_CODE = `<Tree defaultValue="button.tsx" defaultExpandedValues={["src", "components", "lib", "public"]}>
  <TreeItem value="src" label="src" icon={<Folder />} expandedIcon={<FolderOpen />}>
    <TreeItem value="components" label="components" icon={<Folder />} expandedIcon={<FolderOpen />}>
      <TreeItem value="button.tsx" label="button.tsx" icon={<FileCode />} />
      <TreeItem value="card.tsx" label="card.tsx" icon={<FileCode />} />
      <TreeItem value="tree.tsx" label="tree.tsx" icon={<FileCode />} />
    </TreeItem>
    <TreeItem value="lib" label="lib" icon={<Folder />} expandedIcon={<FolderOpen />}>
      <TreeItem value="utils.ts" label="utils.ts" icon={<FileCode />} />
    </TreeItem>
    <TreeItem value="globals.css" label="globals.css" icon={<FileText />} />
  </TreeItem>
  <TreeItem value="public" label="public" icon={<Folder />} expandedIcon={<FolderOpen />}>
    <TreeItem value="logo.svg" label="logo.svg" icon={<FileImage />} />
  </TreeItem>
  <TreeItem value="package.json" label="package.json" icon={<FileText />} />
  <TreeItem value="README.md" label="README.md" icon={<FileText />} />
</Tree>`

const SELECTION_CODE = `const [selected, setSelected] = useState("getting-started")

<Tree value={selected} onValueChange={setSelected} defaultExpandedValues={["guides", "components"]}>
  <TreeItem value="guides" label="Guides" icon={<Folder />} expandedIcon={<FolderOpen />}>
    <TreeItem value="getting-started" label="Getting started" icon={<FileText />} />
    <TreeItem value="installation" label="Installation" icon={<FileText />} />
  </TreeItem>
  <TreeItem value="components" label="Components" icon={<Folder />} expandedIcon={<FolderOpen />}>
    <TreeItem value="overview" label="Overview" icon={<FileText />} />
    <TreeItem value="changelog" label="Changelog" icon={<FileText />} disabled />
  </TreeItem>
</Tree>`

const REORDER_CODE = `const [tree, setTree] = useState(INITIAL_TREE)

// The tree doesn't own your data; apply the reported move to it.
function handleMove({ value, target, position }: TreeMoveEvent) {
  const { rest, found } = detach(tree, value) // pull the node out
  if (!found) return
  setTree(insert(rest, { value, target, position }, found)) // drop it back in
}

<Tree onMove={handleMove} defaultExpandedValues={["app", "components"]}>
  <TreeItem value="app" label="app" icon={<Folder />} expandedIcon={<FolderOpen />}>
    <TreeItem value="layout.tsx" label="layout.tsx" icon={<FileCode />} />
    <TreeItem value="page.tsx" label="page.tsx" icon={<FileCode />} />
  </TreeItem>
  <TreeItem value="README.md" label="README.md" icon={<FileText />} />
</Tree>`

const CATEGORY_CODE = `<Tree guides={false} defaultExpandedValues={["electronics"]}>
  <TreeItem
    value="electronics"
    label="Electronics"
    icon={<Laptop />}
    actions={<Badge variant="secondary" size="sm">128</Badge>}
  >
    <TreeItem value="phones" label="Phones" icon={<DeviceMobile />} actions={<Badge variant="secondary" size="sm">54</Badge>} />
    <TreeItem value="audio" label="Audio" icon={<Headphones />} actions={<Badge variant="secondary" size="sm">31</Badge>} />
    <TreeItem value="laptops" label="Laptops" icon={<Laptop />} actions={<Badge variant="secondary" size="sm">43</Badge>} />
  </TreeItem>
</Tree>`
