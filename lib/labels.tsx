"use client"

import * as React from "react"

import type { AgentStatus } from "@/lib/agent"

export const defaultLabels = {
  close: "Close",
  delete: "Delete",
  clear: "Clear",
  confirm: "Confirm",
  increase: "Increase",
  decrease: "Decrease",
  quantity: "Quantity",
  removeItem: "Remove item",
  closeTab: "Close tab",
  newTab: "New tab",
  pagination: "Pagination",
  previousPage: "Previous page",
  nextPage: "Next page",
  goToPage: "Go to page",
  rowsPerPage: "Rows per page",
  keypad: "Keypad",
  keypadProgress: (length: number, maxLength?: number) =>
    maxLength != null ? `${length} of ${maxLength}` : `${length} entered`,
  keyboard: "On-screen keyboard",
  shift: "Shift",
  symbols: "Symbols",
  letters: "Letters",
  space: "Space",
  enter: "Enter",
  download: "Download",
  print: "Print",
  file: "File",
  filePreview: "File preview",
  untitled: "Untitled",
  pages: "Pages",
  page: "Page",
  pageCount: (count: number) => `${count} ${count === 1 ? "page" : "pages"}`,
  showPages: "Show pages",
  hidePages: "Hide pages",
  loadingPreview: "Loading preview",
  previewUnavailable: "Preview unavailable",
  noPreview: "No preview for this file",
  play: "Play",
  pause: "Pause",
  seek: "Seek",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit",
  fitToPage: "Fit to page",
  fitToWidth: "Fit to width",
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right",
  fullScreen: "Full screen",
  exitFullScreen: "Exit full screen",
  soldOut: "Sold out",
  inOrder: (count: number) => `${count} in the order`,
  required: "Required",
  optional: "Optional",
  chooseRule: (min: number, max: number) =>
    max === 1 ? "Choose 1" : min > 0 && min === max ? `Choose ${min}` : min > 0 ? `Choose ${min} to ${max}` : `Up to ${max}`,
  addToOrder: "Add to order",
  without: "Without",
  agentStatus: {
    working: "Running",
    waiting: "Needs you",
    idle: "Idle",
    done: "Done",
    failed: "Failed",
    cancelled: "Cancelled",
  } as Record<AgentStatus, string>,
  agentStatusCount: (status: AgentStatus, count: number): string =>
    status === "working" ? "running" : status === "waiting" ? (count === 1 ? "needs you" : "need you") : status,
  agents: (count: number): string => (count === 1 ? "agent" : "agents"),
  retry: "Retry",
  tags: "Tags",
  removeTag: (tag: string) => `Remove ${tag}`,
  invalidTag: "invalid",
  tagAdded: (tags: string[]) => (tags.length === 1 ? `${tags[0]} added` : `${tags.length} added`),
  tagRemoved: (tag: string) => `${tag} removed`,
  tagRejected: (tag: string, reason: "invalid" | "duplicate" | "max") =>
    reason === "duplicate" ? `${tag} is already in the list` : reason === "max" ? `Limit reached, ${tag} not added` : `${tag} not added`,
  unsavedChanges: "Unsaved changes",
}

export type Labels = typeof defaultLabels

const LabelsContext = React.createContext<Labels>(defaultLabels)
LabelsContext.displayName = "LabelsContext"

export function LabelsProvider({
  labels,
  children,
}: {
  labels: Partial<Labels>
  children: React.ReactNode
}) {
  const parent = React.useContext(LabelsContext)
  const merged = React.useMemo(() => ({ ...parent, ...labels }), [parent, labels])
  return <LabelsContext.Provider value={merged}>{children}</LabelsContext.Provider>
}

export function useLabels(): Labels {
  return React.useContext(LabelsContext)
}
