"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { CaretRight } from "@phosphor-icons/react"

import { createContext } from "@/lib/create-context"
import { tv, type VariantProps } from "@/lib/tv"

/**
 * Tree: a nesting tree view (file explorer, category browser, org chart) built on
 * Radix Collapsible for each branch's expand/collapse (the `--radix-collapsible-content-height`
 * var drives the height tween) plus a typed Context that carries selection + expansion state
 * down to every recursive `TreeItem`. Multi-part, so the recipe lives in `slots` and the shared
 * state flows through Context, never prop-drilled, never cloned (see docs/ARCHITECTURE.md §2).
 *
 * Radix doesn't ship a Tree primitive, so the roving keyboard model (Up/Down to move,
 * Right/Left to expand-then-descend / collapse-then-ascend, Home/End) is owned here as a single
 * delegated handler on the `role="tree"` root that reads each row's `data-slot`/`data-*`
 * attributes from the DOM (no ref maps, lint-safe). Each branch toggle/select still rides Radix
 * for the panel a11y + animation.
 *
 * Drag to reorder is opt-in: pass `onMove` and rows become draggable via the native HTML5 Drag
 * and Drop API (no dependency, the same call the Drawer's swipe makes). Because the API is
 * prop-driven, the tree can't reorder JSX it doesn't own; it reports a move `{ value, target,
 * position }` (position = before/after a row, or `inside` a branch, picked from the pointer's
 * vertical position over the target) and the consumer applies it to its data. A self/descendant
 * guard (DOM containment) blocks dropping a node into its own subtree, and Alt+Up/Down reorders
 * among siblings from the keyboard, which native DnD can't.
 *
 * The API is recursive and prop-driven: a `TreeItem` with children is a branch (renders a caret
 * and a Collapsible panel); without children it's a leaf. `label`/`icon` keep the row markup
 * owned by the DS so every node stays visually consistent. Nesting comes from the children.
 *
 * Indentation is a CSS-var ladder: the root sets `--tree-indent` (one spacing step) and every row
 * reads its depth from `--tree-level`, so the inset is pure CSS and the optional guide rails align
 * under each parent's caret. `"use client"` because it reads Context and browser focus.
 */
export const treeVariants = tv({
  slots: {
    // The root owns the indent step (a single spacing token, so it tracks the scale) and the
    // selection-color surface. role="tree" lives here. `gap-0.5` (2px) keeps every row's rounded
    // hover/selected pill from kissing its neighbour; the gap repeats at all three stack levels.
    root: "flex w-full flex-col gap-0.5 text-sm text-foreground [--tree-indent:calc(var(--spacing)*5.5)]",
    // Each item is the Collapsible.Root (asChild → <li>); `group/item` is unused by the caret
    // (it reads the row's own data-expanded) but kept as the item's stable hook. Flex-col +
    // `gap-0.5` separates a branch's own row from its nested panel below.
    item: "group/item flex list-none flex-col gap-0.5",
    // The animated branch panel: overflow-hidden clips the height tween; the keyframes read
    // Koala's duration/ease tokens via tw-animate-css (no raw ms/cubic-bezier). `relative` hosts
    // the guide rail. `gap-0.5` spaces sibling rows inside the panel. role="group".
    group:
      "relative flex flex-col gap-0.5 overflow-hidden duration-base ease-out data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
    // Optional vertical guide rail, positioned under the parent caret's optical center
    // (base inset + level·indent + half the caret box). `before:z-[1]` lifts the rail above the
    // rows' selected/hover `bg-accent` fill (rows are `position:relative` with auto z-index, so any
    // positive z wins the paint order) — the nesting lines read *over* the card, not under it.
    guide:
      "before:pointer-events-none before:absolute before:inset-y-0 before:z-[1] before:w-px before:bg-border before:content-[''] before:start-[calc(var(--tree-level,0)*var(--tree-indent)+var(--spacing)*4)]",
    // The interactive row carries role="treeitem". Inset = base + depth·indent, pure CSS.
    // No press-scale: a full-width row shrinking on click reads as a layout jump (same call the
    // Accordion makes); the caret flip and panel tween carry the feedback instead.
    row: [
      "group/row relative flex w-full cursor-pointer select-none items-center gap-1.5 rounded-md py-1.5 pe-2 text-start outline-none",
      "ps-[calc(var(--tree-level,0)*var(--tree-indent)+var(--spacing)*2)]",
      "transition-colors duration-fast ease-out",
      "hover:bg-accent hover:text-accent-foreground",
      "focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
      "data-[selected=true]:bg-accent data-[selected=true]:font-medium data-[selected=true]:text-accent-foreground",
      // Drag: the grabbed row fades; a row being dropped *into* (a branch) takes a brand inset
      // ring + soft brand wash. before/after drops render the separate `dropLine` slot instead.
      "data-[dragging=true]:opacity-50",
      "data-[drop=inside]:bg-brand/5 data-[drop=inside]:ring-2 data-[drop=inside]:ring-inset data-[drop=inside]:ring-brand",
      "aria-disabled:pointer-events-none aria-disabled:opacity-50",
    ],
    // Fixed caret box so leaf labels line up with branch labels (leaves render it empty).
    caret: "flex size-4 shrink-0 items-center justify-center text-muted-foreground",
    // Caret flips 90° on open; `duration-base ease-out` matches the panel so glyph + height move
    // as one gesture. Reads the row's data-expanded, not Collapsible's data-state.
    caretIcon:
      "size-3.5 transition-transform duration-base ease-out group-data-[expanded=true]/row:rotate-90",
    // Leading content glyph (folder/file). 20px like every text-label row (sidebar/menu/list):
    // a bare `<Icon />` gets `size-5`, while an explicitly-sized glyph keeps its own size.
    icon: "flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
    label: "min-w-0 flex-1 truncate",
    // Trailing slot (count badge, row menu). Muted so it sits behind the label in the hierarchy.
    actions: "ms-auto flex shrink-0 items-center gap-1 ps-2 text-muted-foreground",
    // The between-rows insertion bar for before/after drops: a brand hairline that lives in the
    // 2px gap, inset to the row's content start (so it reads at the right depth) with a leading
    // dot, the way Finder/VS Code mark an insertion point.
    dropLine: [
      "pointer-events-none absolute z-10 h-0.5 rounded-full bg-brand",
      "start-[calc(var(--tree-level,0)*var(--tree-indent)+var(--spacing)*2)] end-2",
      "data-[edge=top]:-top-px data-[edge=bottom]:-bottom-px",
      "before:absolute before:top-1/2 before:-start-1.5 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-brand before:content-['']",
    ],
  },
})

type TreeSlots = ReturnType<typeof treeVariants>

/** Where a dragged node lands relative to the target: a sibling, or the first child of a branch. */
export type TreeDropPosition = "before" | "after" | "inside"

/** Emitted by `Tree.onMove` when a node is dragged (or Alt+Arrow'd) to a new place. */
export interface TreeMoveEvent {
  /** The node being moved. */
  value: string
  /** The node it was dropped on. */
  target: string
  /** Its placement relative to `target`. */
  position: TreeDropPosition
}

type DropTarget = { value: string; position: TreeDropPosition } | null

interface TreeContextValue {
  slots: TreeSlots
  guides: boolean
  selectedValue: string | undefined
  onSelect: (value: string) => void
  isExpanded: (value: string) => boolean
  setExpanded: (value: string, open: boolean) => void
  // Drag coordination (no-ops when `onMove` isn't provided).
  dragEnabled: boolean
  dragging: string | null
  dropTarget: DropTarget
  onDragStartItem: (value: string) => void
  setDropTarget: (target: DropTarget) => void
  commitMove: () => void
  endDrag: () => void
}

const [TreeProvider, useTreeContext] = createContext<TreeContextValue>("Tree")

// Depth ladder: a plain context (default 0 is a valid top level, so no "must be within" guard).
// Each branch's panel bumps it for its children; rows read it into the `--tree-level` CSS var.
const TreeLevelContext = React.createContext(0)
const useTreeLevel = () => React.useContext(TreeLevelContext)

// Escape a user-supplied value for a CSS attribute selector (values are arbitrary strings).
const escapeValue = (value: string) =>
  typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value

// ─── Tree ───────────────────────────────────────────────────────────────────────

export type TreeProps = Omit<React.ComponentProps<"ul">, "onSelect"> &
  VariantProps<typeof treeVariants> & {
    /** Selected node value (controlled). */
    value?: string
    /** Initially selected node value (uncontrolled). */
    defaultValue?: string
    /** Fires with the value of the node that was selected. */
    onValueChange?: (value: string) => void
    /** Expanded branch values (controlled). */
    expandedValues?: string[]
    /** Initially expanded branch values (uncontrolled). */
    defaultExpandedValues?: string[]
    /** Fires with the full set of expanded branch values whenever one toggles. */
    onExpandedChange?: (values: string[]) => void
    /** Show the vertical guide rails that trace each level of nesting. Defaults to `true`. */
    guides?: boolean
    /**
     * Enables drag-to-reorder. Fires with the move the user made; apply it to your own data and
     * re-render the tree. Also enables Alt+Up/Down sibling reordering from the keyboard.
     */
    onMove?: (move: TreeMoveEvent) => void
  }

export function Tree({
  className,
  value,
  defaultValue,
  onValueChange,
  expandedValues,
  defaultExpandedValues,
  onExpandedChange,
  guides = true,
  onMove,
  children,
  ...props
}: TreeProps) {
  const slots = treeVariants()

  // Selection (single). Controlled when `value` is provided, else local state.
  const [selectedState, setSelectedState] = React.useState(defaultValue)
  const isSelectionControlled = value !== undefined
  const selectedValue = isSelectionControlled ? value : selectedState
  const onSelect = (next: string) => {
    if (!isSelectionControlled) setSelectedState(next)
    if (next !== selectedValue) onValueChange?.(next)
  }

  // Expansion (a set of branch values). Controlled when `expandedValues` is provided.
  const [expandedState, setExpandedState] = React.useState<Set<string>>(
    () => new Set(defaultExpandedValues),
  )
  const isExpansionControlled = expandedValues !== undefined
  const currentExpanded = isExpansionControlled ? new Set(expandedValues) : expandedState
  const setExpanded = (target: string, open: boolean) => {
    const next = new Set(currentExpanded)
    if (open) next.add(target)
    else next.delete(target)
    if (!isExpansionControlled) setExpandedState(next)
    onExpandedChange?.([...next])
  }

  // Drag state. `dragging` is the grabbed node; `dropTarget` is where the indicator shows.
  const dragEnabled = onMove !== undefined
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dropTarget, setDropTargetState] = React.useState<DropTarget>(null)
  const endDrag = () => {
    setDragging(null)
    setDropTargetState(null)
  }
  const commitMove = () => {
    if (dragging && dropTarget && dragging !== dropTarget.value) {
      onMove?.({ value: dragging, target: dropTarget.value, position: dropTarget.position })
    }
    endDrag()
  }

  // Roving keyboard nav owned here (Radix has no Tree primitive). One delegated handler reads
  // the visible rows from the DOM by data-slot; closed branches are unmounted by Collapsible, so
  // the query only ever returns rows the user can actually see.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const root = event.currentTarget

    // Alt+Up/Down reorders the focused node among its visible siblings: the keyboard equivalent
    // of a short drag, since native DnD offers no keyboard path. Best-effort refocus after the
    // consumer re-renders keeps the moved node selected.
    if (onMove && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      const active = document.activeElement as HTMLElement | null
      if (!active?.matches('[data-slot="tree-row"]')) return
      event.preventDefault()
      const item = active.closest('[data-slot="tree-item"]')
      const sibling =
        event.key === "ArrowUp" ? item?.previousElementSibling : item?.nextElementSibling
      if (sibling?.getAttribute("data-slot") !== "tree-item") return
      const target = sibling.querySelector<HTMLElement>('[data-slot="tree-row"]')?.dataset.value
      const moved = active.dataset.value
      if (!target || !moved) return
      onMove({ value: moved, target, position: event.key === "ArrowUp" ? "before" : "after" })
      requestAnimationFrame(() =>
        root
          .querySelector<HTMLElement>(`[data-slot="tree-row"][data-value="${escapeValue(moved)}"]`)
          ?.focus(),
      )
      return
    }

    const NAV = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"]
    if (!NAV.includes(event.key)) return

    const rows = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="tree-row"]:not([aria-disabled="true"])'),
    )
    if (rows.length === 0) return

    const active = document.activeElement as HTMLElement | null
    const index = active ? rows.indexOf(active) : -1
    const current = index >= 0 ? rows[index] : null
    const focusAt = (i: number) => rows[Math.max(0, Math.min(i, rows.length - 1))]?.focus()

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        focusAt(index + 1)
        break
      case "ArrowUp":
        event.preventDefault()
        focusAt(index - 1)
        break
      case "Home":
        event.preventDefault()
        focusAt(0)
        break
      case "End":
        event.preventDefault()
        focusAt(rows.length - 1)
        break
      case "ArrowRight":
        // First press expands a collapsed branch; a second descends into it.
        event.preventDefault()
        if (!current || current.dataset.branch !== "true") break
        if (current.dataset.expanded !== "true") setExpanded(current.dataset.value ?? "", true)
        else focusAt(index + 1)
        break
      case "ArrowLeft": {
        // Collapse an open branch; otherwise step out to the parent row.
        event.preventDefault()
        if (!current) break
        if (current.dataset.branch === "true" && current.dataset.expanded === "true") {
          setExpanded(current.dataset.value ?? "", false)
          break
        }
        const level = Number(current.dataset.level)
        for (let i = index - 1; i >= 0; i--) {
          if (Number(rows[i].dataset.level) === level - 1) {
            rows[i].focus()
            break
          }
        }
        break
      }
    }
  }

  return (
    <TreeProvider
      slots={slots}
      guides={guides}
      selectedValue={selectedValue}
      onSelect={onSelect}
      isExpanded={(v) => currentExpanded.has(v)}
      setExpanded={setExpanded}
      dragEnabled={dragEnabled}
      dragging={dragging}
      dropTarget={dropTarget}
      onDragStartItem={setDragging}
      setDropTarget={setDropTargetState}
      commitMove={commitMove}
      endDrag={endDrag}
    >
      <ul
        role="tree"
        data-slot="tree"
        className={slots.root({ className })}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </ul>
    </TreeProvider>
  )
}

// ─── TreeItem ─────────────────────────────────────────────────────────────────────

export type TreeItemProps = Omit<React.ComponentProps<"li">, "onSelect"> & {
  /** Stable identity for selection + expansion. Required. */
  value: string
  /** Row label. */
  label?: React.ReactNode
  /** Leading glyph (e.g. a folder or file icon). */
  icon?: React.ReactNode
  /** Leading glyph shown while a branch is expanded; defaults to `icon`. */
  expandedIcon?: React.ReactNode
  /** Trailing content (a count badge, a row menu). */
  actions?: React.ReactNode
  /** Disables selection, expansion, focus, and dragging for this node. */
  disabled?: boolean
  /** Nested `TreeItem`s. Presence makes this node a branch; absence makes it a leaf. */
  children?: React.ReactNode
}

export function TreeItem({
  className,
  value,
  label,
  icon,
  expandedIcon,
  actions,
  disabled,
  children,
  ...props
}: TreeItemProps) {
  const {
    slots,
    guides,
    selectedValue,
    onSelect,
    isExpanded,
    setExpanded,
    dragEnabled,
    dragging,
    dropTarget,
    onDragStartItem,
    setDropTarget,
    commitMove,
    endDrag,
  } = useTreeContext("TreeItem")
  const level = useTreeLevel()

  const isBranch = React.Children.toArray(children).length > 0
  const expanded = isBranch && isExpanded(value)
  const selected = selectedValue === value
  const drop = dropTarget?.value === value ? dropTarget.position : null
  const draggable = dragEnabled && !disabled

  const activate = () => {
    if (disabled) return
    onSelect(value)
    if (isBranch) setExpanded(value, !expanded)
  }

  // The treeitem row owns the keyboard contract for activation (Enter/Space). Arrow keys bubble
  // up to the tree root's roving handler, so they're intentionally not handled here.
  const onRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      activate()
    }
  }

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggable) return
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", value)
    onDragStartItem(value)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragEnabled || !dragging) return
    const targetRow = event.currentTarget
    // Guard: never drop a node into itself or its own subtree. DOM containment is the source of
    // truth here: the dragged row's <li> wraps its whole subtree.
    const draggedItem = targetRow
      .closest('[data-slot="tree"]')
      ?.querySelector(`[data-slot="tree-row"][data-value="${escapeValue(dragging)}"]`)
      ?.closest('[data-slot="tree-item"]')
    if (draggedItem?.contains(targetRow)) {
      event.dataTransfer.dropEffect = "none"
      setDropTarget(null)
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    // Pick the zone from the pointer's vertical position: a branch has a middle "inside" band; a
    // leaf splits cleanly in half between before and after.
    const rect = targetRow.getBoundingClientRect()
    const ratio = (event.clientY - rect.top) / rect.height
    const position: TreeDropPosition = isBranch
      ? ratio < 0.25
        ? "before"
        : ratio > 0.75
          ? "after"
          : "inside"
      : ratio < 0.5
        ? "before"
        : "after"
    setDropTarget({ value, position })
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    commitMove()
  }

  const row = (
    <div
      role="treeitem"
      data-slot="tree-row"
      data-value={value}
      data-level={level}
      data-branch={isBranch ? "true" : "false"}
      data-expanded={expanded ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      data-dragging={dragging === value ? "true" : undefined}
      data-drop={drop ?? undefined}
      aria-level={level + 1}
      aria-selected={selected}
      aria-expanded={isBranch ? expanded : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      draggable={draggable || undefined}
      className={slots.row()}
      style={{ "--tree-level": level } as React.CSSProperties}
      onClick={activate}
      onKeyDown={onRowKeyDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={endDrag}
    >
      {drop === "before" && (
        <span aria-hidden data-slot="tree-drop-line" data-edge="top" className={slots.dropLine()} />
      )}
      <span data-slot="tree-caret" aria-hidden className={slots.caret()}>
        {isBranch && <CaretRight weight="bold" className={slots.caretIcon()} />}
      </span>
      {(expanded ? (expandedIcon ?? icon) : icon) && (
        <span data-slot="tree-icon" className={slots.icon()}>
          {expanded ? (expandedIcon ?? icon) : icon}
        </span>
      )}
      <span data-slot="tree-label" className={slots.label()}>
        {label}
      </span>
      {actions && (
        <span data-slot="tree-actions" className={slots.actions()}>
          {actions}
        </span>
      )}
      {drop === "after" && (
        <span aria-hidden data-slot="tree-drop-line" data-edge="bottom" className={slots.dropLine()} />
      )}
    </div>
  )

  if (!isBranch) {
    return (
      <li role="none" data-slot="tree-item" className={slots.item({ className })} {...props}>
        {row}
      </li>
    )
  }

  return (
    <CollapsiblePrimitive.Root
      asChild
      open={expanded}
      onOpenChange={(open) => !disabled && setExpanded(value, open)}
    >
      <li role="none" data-slot="tree-item" className={slots.item({ className })} {...props}>
        {row}
        <CollapsiblePrimitive.Content asChild>
          <ul
            role="group"
            data-slot="tree-group"
            className={slots.group({ className: guides ? slots.guide() : undefined })}
            style={{ "--tree-level": level } as React.CSSProperties}
          >
            <TreeLevelContext.Provider value={level + 1}>{children}</TreeLevelContext.Provider>
          </ul>
        </CollapsiblePrimitive.Content>
      </li>
    </CollapsiblePrimitive.Root>
  )
}
