"use client"

import * as React from "react"

export const IN_VIEW_OPTIONS = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.1,
} satisfies IntersectionObserverInit

export interface UseInViewOptions extends IntersectionObserverInit {
  enabled?: boolean
  once?: boolean
}

export function useInView<T extends Element = HTMLDivElement>({
  enabled = true,
  once = true,
  root,
  rootMargin = IN_VIEW_OPTIONS.rootMargin,
  threshold = IN_VIEW_OPTIONS.threshold,
}: UseInViewOptions = {}): [React.RefCallback<T>, boolean] {
  const nodeRef = React.useRef<T | null>(null)
  const [inView, setInView] = React.useState(!enabled)
  const doneRef = React.useRef(false)

  React.useEffect(() => {
    if (!enabled || doneRef.current) return
    const el = nodeRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) {
            doneRef.current = true
            observer.disconnect()
          }
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, once, root, rootMargin, threshold])

  return [React.useCallback((node: T | null) => void (nodeRef.current = node), []), inView]
}
