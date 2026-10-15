"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInView } from "@/lib/in-view"

export interface StaggerProps extends React.ComponentProps<"div"> {
  step?: number
  blur?: boolean
  inView?: boolean
}

export function Stagger({
  step = 70,
  blur = false,
  inView = false,
  ref,
  onAnimationEnd,
  children,
  ...props
}: StaggerProps) {
  const [setInViewRef, visible] = useInView<HTMLDivElement>({ enabled: inView })

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
