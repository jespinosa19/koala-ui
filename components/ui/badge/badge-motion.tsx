"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeTextProps extends Omit<React.ComponentProps<"span">, "children"> {
  children: string
  sweep?: boolean
}

export function BadgeText({ children, sweep, className, ...props }: BadgeTextProps) {
  const measure = React.useRef<HTMLSpanElement>(null)
  const [width, setWidth] = React.useState<number>()
  const [items, setItems] = React.useState([{ text: children, id: 0 }])
  const next = React.useRef(0)

  React.useLayoutEffect(() => {
    if (measure.current) setWidth(measure.current.offsetWidth)
  }, [children])

  React.useEffect(() => {
    setItems((prev) => {
      if (prev[prev.length - 1].text === children) return prev
      next.current += 1
      return [...prev.slice(-1), { text: children, id: next.current }]
    })
  }, [children])

  return (
    <span
      data-slot="badge-text"
      className={cn(
        "relative inline-grid overflow-hidden transition-[width] duration-base ease-out motion-reduce:transition-none",
        className,
      )}
      style={{ width }}
      {...props}
    >
      <span ref={measure} aria-hidden className="invisible col-start-1 row-start-1 w-max">
        {children}
      </span>
      {items.map((item, i) => {
        const leaving = i < items.length - 1
        return (
          <span
            key={item.id}
            aria-hidden={leaving || undefined}
            onAnimationEnd={
              leaving ? (e) => e.animationName === "badge-out" && setItems((prev) => prev.filter((p) => p.id !== item.id)) : undefined
            }
            className={cn(
              "col-start-1 row-start-1 w-max",
              leaving ? "animate-badge-out" : item.id > 0 && "animate-badge-in",
              !leaving && sweep && "ink-sweep",
            )}
          >
            {item.text}
          </span>
        )
      })}
    </span>
  )
}

export interface BadgeIconProps extends React.ComponentProps<"span"> {
  swap?: string
}

export function BadgeIcon({ swap, className, children, ...props }: BadgeIconProps) {
  return (
    <span
      data-slot="badge-icon"
      aria-hidden
      className={cn("inline-grid shrink-0 place-items-center [&>*]:col-start-1 [&>*]:row-start-1", className)}
      {...props}
    >
      <span key={swap} className={cn("inline-grid place-items-center", swap !== undefined && "animate-badge-glyph")}>
        {children}
      </span>
    </span>
  )
}

export interface BadgeNumberProps extends Omit<React.ComponentProps<"span">, "children"> {
  value: number
}

export function BadgeNumber({ value, className, ...props }: BadgeNumberProps) {
  const digits = String(Math.max(0, Math.round(value))).split("")
  return (
    <span data-slot="badge-number" role="img" aria-label={String(value)} className={cn("inline-flex tabular-nums", className)} {...props}>
      {digits.map((d, i) => (
        <span key={digits.length - i} aria-hidden className="inline-block h-[1lh] overflow-hidden">
          <span
            className="flex flex-col transition-transform duration-slow ease-out motion-reduce:transition-none"
            style={{ transform: `translateY(calc(-${d} * 1lh))` }}
          >
            {DIGITS.map((n) => (
              <span key={n} className="h-[1lh]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

export interface BadgeProgressProps extends Omit<React.ComponentProps<"svg">, "children"> {
  value: number
}

export function BadgeProgress({ value, className, ...props }: BadgeProgressProps) {
  const r = 5
  const c = 2 * Math.PI * r
  const v = Math.min(100, Math.max(0, value))
  return (
    <svg
      data-slot="badge-progress"
      viewBox="0 0 14 14"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn("-rotate-90", className)}
      {...props}
    >
      <circle cx="7" cy="7" r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="2" />
      <circle
        cx="7"
        cy="7"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - v / 100)}
        className="transition-[stroke-dashoffset] duration-slow ease-out motion-reduce:transition-none"
      />
    </svg>
  )
}

export interface BadgeRevealProps extends React.ComponentProps<"span"> {
  show: boolean
}

export function BadgeReveal({ show, className, children, ...props }: BadgeRevealProps) {
  return (
    <span
      data-slot="badge-reveal"
      data-state={show ? "open" : "closed"}
      aria-hidden={!show || undefined}
      inert={!show || undefined}
      className={cn(
        "inline-grid transition-[grid-template-columns,opacity,filter,margin] duration-base ease-out motion-reduce:transition-none",
        show ? "grid-cols-[1fr] opacity-100 blur-none" : "me-[calc(var(--reveal-gap,calc(var(--spacing)*2))*-1)] grid-cols-[0fr] opacity-0 blur-xs",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 overflow-clip [overflow-clip-margin:4px]">{children}</span>
    </span>
  )
}
