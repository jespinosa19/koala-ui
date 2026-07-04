"use client"

import * as React from "react"
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileImage,
  DeviceMobile,
  Laptop,
  Headphones,
} from "@phosphor-icons/react"

import { Tree, TreeItem, type TreeMoveEvent } from "@/components/ui/tree"
import { Badge } from "@/components/ui/badge"

/** Hero: a project file tree, opened to a selected file, with folder glyphs that swap on expand. */
export function TreeDemo() {
  return (
    <Tree
      aria-label="Project files"
      defaultValue="button.tsx"
      defaultExpandedValues={["src", "components", "lib", "public"]}
      className="w-full max-w-sm"
    >
      <TreeItem value="src" label="src" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
        <TreeItem value="components" label="components" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
          <TreeItem value="button.tsx" label="button.tsx" icon={<FileCode weight="bold" />} />
          <TreeItem value="card.tsx" label="card.tsx" icon={<FileCode weight="bold" />} />
          <TreeItem value="tree.tsx" label="tree.tsx" icon={<FileCode weight="bold" />} />
        </TreeItem>
        <TreeItem value="lib" label="lib" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
          <TreeItem value="utils.ts" label="utils.ts" icon={<FileCode weight="bold" />} />
        </TreeItem>
        <TreeItem value="globals.css" label="globals.css" icon={<FileText weight="bold" />} />
      </TreeItem>
      <TreeItem value="public" label="public" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
        <TreeItem value="logo.svg" label="logo.svg" icon={<FileImage weight="bold" />} />
      </TreeItem>
      <TreeItem value="package.json" label="package.json" icon={<FileText weight="bold" />} />
      <TreeItem value="README.md" label="README.md" icon={<FileText weight="bold" />} />
    </Tree>
  )
}

/** Controlled selection: the tree reports the chosen node, the page reflects it. */
export function SelectionDemo() {
  const [selected, setSelected] = React.useState("getting-started")
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Tree
        aria-label="Documentation"
        value={selected}
        onValueChange={setSelected}
        defaultExpandedValues={["guides", "components"]}
      >
        <TreeItem value="guides" label="Guides" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
          <TreeItem value="getting-started" label="Getting started" icon={<FileText weight="bold" />} />
          <TreeItem value="installation" label="Installation" icon={<FileText weight="bold" />} />
        </TreeItem>
        <TreeItem value="components" label="Components" icon={<Folder weight="bold" />} expandedIcon={<FolderOpen weight="bold" />}>
          <TreeItem value="overview" label="Overview" icon={<FileText weight="bold" />} />
          <TreeItem value="changelog" label="Changelog" icon={<FileText weight="bold" />} disabled />
        </TreeItem>
      </Tree>
      <p className="text-sm text-muted-foreground">
        Selected: <code className="font-mono text-foreground">{selected}</code>
      </p>
    </div>
  )
}

/** Beyond files: a category browser with live counts in the trailing slot. Guides off. */
export function CategoryDemo() {
  return (
    <Tree
      aria-label="Catalog"
      guides={false}
      defaultExpandedValues={["electronics"]}
      className="w-full max-w-sm"
    >
      <TreeItem
        value="electronics"
        label="Electronics"
        icon={<Laptop weight="bold" />}
        actions={<Badge variant="secondary" size="sm">128</Badge>}
      >
        <TreeItem
          value="phones"
          label="Phones"
          icon={<DeviceMobile weight="bold" />}
          actions={<Badge variant="secondary" size="sm">54</Badge>}
        />
        <TreeItem
          value="audio"
          label="Audio"
          icon={<Headphones weight="bold" />}
          actions={<Badge variant="secondary" size="sm">31</Badge>}
        />
        <TreeItem
          value="laptops"
          label="Laptops"
          icon={<Laptop weight="bold" />}
          actions={<Badge variant="secondary" size="sm">43</Badge>}
        />
      </TreeItem>
    </Tree>
  )
}

/* ── Drag to reorder ─────────────────────────────────────────────────────────────
 * `onMove` reports the move; the tree doesn't own the data, so the consumer applies it. These
 * three pure helpers (detach the node, then re-insert it before/after/inside the target) are all
 * it takes to drive a nested tree from a plain data model. */
type FileNode = { value: string; label: string; icon?: React.ReactNode; children?: FileNode[] }

function detach(nodes: FileNode[], value: string): { rest: FileNode[]; found: FileNode | null } {
  let found: FileNode | null = null
  const rest: FileNode[] = []
  for (const node of nodes) {
    if (node.value === value) {
      found = node
      continue
    }
    if (node.children) {
      const inner = detach(node.children, value)
      if (inner.found) found = inner.found
      rest.push({ ...node, children: inner.rest })
    } else {
      rest.push(node)
    }
  }
  return { rest, found }
}

function insert(nodes: FileNode[], move: TreeMoveEvent, node: FileNode): FileNode[] {
  return nodes.flatMap((current) => {
    if (current.value === move.target) {
      if (move.position === "before") return [node, current]
      if (move.position === "after") return [current, node]
      return [{ ...current, children: [node, ...(current.children ?? [])] }]
    }
    if (current.children) return [{ ...current, children: insert(current.children, move, node) }]
    return [current]
  })
}

const INITIAL_TREE: FileNode[] = [
  {
    value: "app",
    label: "app",
    icon: <Folder weight="bold" />,
    children: [
      { value: "layout.tsx", label: "layout.tsx", icon: <FileCode weight="bold" /> },
      { value: "page.tsx", label: "page.tsx", icon: <FileCode weight="bold" /> },
    ],
  },
  {
    value: "components",
    label: "components",
    icon: <Folder weight="bold" />,
    children: [
      { value: "button.tsx", label: "button.tsx", icon: <FileCode weight="bold" /> },
      { value: "tree.tsx", label: "tree.tsx", icon: <FileCode weight="bold" /> },
    ],
  },
  { value: "tailwind.config.ts", label: "tailwind.config.ts", icon: <FileCode weight="bold" /> },
  { value: "README.md", label: "README.md", icon: <FileText weight="bold" /> },
]

/** Drag any row onto another to drop it before, after, or inside a folder. Alt+↑/↓ reorders too. */
export function ReorderDemo() {
  const [tree, setTree] = React.useState(INITIAL_TREE)

  const handleMove = (move: TreeMoveEvent) => {
    const { rest, found } = detach(tree, move.value)
    if (!found) return
    setTree(insert(rest, move, found))
  }

  const renderNodes = (nodes: FileNode[]): React.ReactNode =>
    nodes.map((node) => (
      <TreeItem
        key={node.value}
        value={node.value}
        label={node.label}
        icon={node.children ? <Folder weight="bold" /> : node.icon}
        expandedIcon={node.children ? <FolderOpen weight="bold" /> : undefined}
      >
        {node.children ? renderNodes(node.children) : null}
      </TreeItem>
    ))

  return (
    <Tree
      aria-label="Reorderable files"
      onMove={handleMove}
      defaultExpandedValues={["app", "components"]}
      className="w-full max-w-sm"
    >
      {renderNodes(tree)}
    </Tree>
  )
}
