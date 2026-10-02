"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInView } from "@/lib/in-view"

export interface StaggerProps extends React.ComponentProps<"div"> {
  /** Delay between each child's entrance, in ms. @default 70 */
  step?: number
  /** Add a 4px → 0 defocus to the entrance (matches a SectionHeader's `staggerBlur`). @default false */
  blur?: boolean
  /**
   * Wait until the group scrolls into view before cascading, instead of playing on mount. Reach for
   * it on content below the fold so it reveals as the reader reaches it, and to match a
   * SectionHeader set to `staggerTrigger="inView"` above it. @default false
   */
  inView?: boolean
}

/**
 * Stagger: plays a small rise+fade entrance across its direct children, each delayed one `step`
 * further than the last, so a list or grid cascades in rather than appearing as one block
 * (polish). The DS's motion foundation made reusable: the animation itself
 * lives in the token layer (`--animate-stagger-in` / `--animate-stagger-in-blur` in globals.css,
 * `animate-stagger-in[-blur]` utilities), so consumers never hand-roll per-item `transitionDelay`.
 *
 * By default it animates on **mount**, which is the right gate for "load" cascades: with stable
 * keys, reordering (e.g. a table re-sort) reuses the same DOM and does *not* replay; genuinely new
 * content (filter matches, a fresh page, a layout switch) mounts and cascades. That takes one guard:
 * React moves a keyed child by re-inserting its node, and a CSS animation restarts whenever its
 * element re-enters the document, so a child that moved would fade in all over again. A child whose
 * entrance has played is marked `data-stagger-done` and drops the animation. Pass `inView` to gate
 * it on scrolling into view instead (the shared `useInView` gate holds the cascade at its start via
 * `animation-play-state: paused` + the keyframe's `both` fill, so nothing flashes, then runs it on
 * intersect). Honors `prefers-reduced-motion` (children simply appear). Direct children must forward
 * `className` and `style`: every Koala component does; raw text/fragments pass through unanimated.
 *
 * Only each *direct* child is shallow-cloned (to attach the entrance class and its delay), never
 * descendants, so it doesn't trip the recursive-clone rule the DS forbids. The delay is set inline
 * via an `animation-delay` longhand that beats the `animation` shorthand's reset regardless of
 * stylesheet order.
 */
export function Stagger({
  step = 70,
  blur = false,
  inView = false,
  ref,
  onAnimationEnd,
  children,
  ...props
}: StaggerProps) {
  // `enabled: inView` arms the gate only when the caller asked for one; a disarmed gate reports
  // visible immediately, so the mount cascade plays on the first frame as before.
  const [setInViewRef, visible] = useInView<HTMLDivElement>({ enabled: inView })

  // Keep the gate's target while honoring a forwarded ref (the hook can't merge it for us: mutating
  // a value passed *into* a hook trips react-hooks/immutability). Compose in the commit-phase
  // callback, never during render.
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setInViewRef(node)
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
    },
    [setInViewRef, ref],
  )

  const paused = inView && !visible

  const entrance = cn(
    blur ? "animate-stagger-in-blur" : "animate-stagger-in",
    paused && "[animation-play-state:paused]",
    "motion-reduce:animate-none data-[stagger-done]:animate-none",
  )

  // The mark lives on the DOM node, not in state: React leaves an attribute it does not own alone
  // across renders, and the node is exactly what a move re-inserts.
  const markDone = (event: React.AnimationEvent<HTMLDivElement>) => {
    onAnimationEnd?.(event)
    const child = event.target as HTMLElement
    if (child.parentElement === event.currentTarget && event.animationName.startsWith("stagger-in")) {
      child.dataset.staggerDone = ""
    }
  }

  return (
    <div ref={setRef} data-slot="stagger" onAnimationEnd={markDone} {...props}>
      {React.Children.map(children, (child, index) => {
        if (
          !React.isValidElement<{ className?: string; style?: React.CSSProperties }>(child)
        ) {
          return child
        }
        return React.cloneElement(child, {
          className: cn(entrance, child.props.className),
          style: { animationDelay: `${index * step}ms`, ...child.props.style },
        })
      })}
    </div>
  )
}
