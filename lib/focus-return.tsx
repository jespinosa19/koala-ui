"use client"

import * as React from "react"

type CloseAutoFocusHandler = (event: Event) => void
type PointerDownOutsideHandler = (event: CustomEvent<{ originalEvent: PointerEvent }>) => void

export interface UseFocusReturnOptions {
  onCloseAutoFocus?: CloseAutoFocusHandler
  onPointerDownOutside?: PointerDownOutsideHandler
}

function FocusReturnMarker({ onMount }: { onMount: () => void }) {
  React.useLayoutEffect(onMount, [onMount])
  return null
}

function canTakeFocus(element: Element | null): element is HTMLElement | SVGElement {
  if (!element || !element.isConnected) return false
  if (element === element.ownerDocument.body) return false
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return false
  if ((element as HTMLElement & { disabled?: boolean }).disabled) return false
  return true
}

function focusWasDropped(doc: Document) {
  const active = doc.activeElement
  return !active || active === doc.body || !active.isConnected
}

const MENU_SELECTOR = '[role="menu"]'

const focusBeforeMenu = new WeakMap<Document, Element | null>()

function trackFocusBeforeMenu(doc: Document) {
  const install = doc as Document & { __koalaFocusBeforeMenu?: boolean }
  if (install.__koalaFocusBeforeMenu) return
  install.__koalaFocusBeforeMenu = true
  doc.addEventListener(
    "focusin",
    (event) => {
      const target = event.target
      if (target instanceof Element && !target.closest(MENU_SELECTOR)) focusBeforeMenu.set(doc, target)
    },
    true,
  )
  doc.addEventListener(
    "focusout",
    (event) => {
      if (!(event as FocusEvent).relatedTarget) focusBeforeMenu.set(doc, null)
    },
    true,
  )
}

if (typeof document !== "undefined") trackFocusBeforeMenu(document)

function menuTrigger(menu: Element): Element | null {
  const doc = menu.ownerDocument
  const labelledBy = menu.getAttribute("aria-labelledby")?.trim()
  const labelled = labelledBy ? doc.getElementById(labelledBy.split(/\s+/)[0]) : null
  if (labelled) return labelled
  return menu.id ? doc.querySelector(`[aria-controls="${CSS.escape(menu.id)}"]`) : null
}

function resolveOpener(element: Element | null): Element | null {
  if (!element) return null
  const doc = element.ownerDocument
  let current: Element = element
  for (let depth = 0; depth < 32; depth++) {
    const menu = current.closest(MENU_SELECTOR)
    if (!menu) return current
    const trigger = menuTrigger(menu)
    if (!trigger || trigger === current || menu.contains(trigger)) {
      const before = focusBeforeMenu.get(doc) ?? null
      return before && before.isConnected ? before : doc.body
    }
    current = trigger
  }
  return doc.body
}

export function useFocusReturn({ onCloseAutoFocus, onPointerDownOutside }: UseFocusReturnOptions = {}) {
  const opener = React.useRef<Element | null>(null)
  const dismissedOutside = React.useRef(false)

  const remember = React.useCallback(() => {
    if (opener.current) return
    opener.current = resolveOpener(document.activeElement)
    dismissedOutside.current = false
  }, [])

  const handleCloseAutoFocus = React.useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event)
      const target = opener.current
      const outside = dismissedOutside.current
      opener.current = null
      dismissedOutside.current = false
      if (event.defaultPrevented || outside) return
      queueMicrotask(() => {
        if (!canTakeFocus(target) || !focusWasDropped(target.ownerDocument)) return
        target.focus()
      })
    },
    [onCloseAutoFocus],
  )

  const handlePointerDownOutside = React.useCallback(
    (event: CustomEvent<{ originalEvent: PointerEvent }>) => {
      onPointerDownOutside?.(event)
      if (!event.defaultPrevented && document.body.style.pointerEvents !== "none") {
        dismissedOutside.current = true
      }
    },
    [onPointerDownOutside],
  )

  return {
    marker: <FocusReturnMarker onMount={remember} />,
    contentProps: {
      onCloseAutoFocus: handleCloseAutoFocus,
      onPointerDownOutside: handlePointerDownOutside,
    },
  }
}
