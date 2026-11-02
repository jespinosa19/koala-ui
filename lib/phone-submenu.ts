import * as React from "react"

const PHONE_QUERY = "(max-width: 30rem) and (pointer: coarse)"
const OVERLAP = -160

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia?.(PHONE_QUERY)
  query?.addEventListener("change", onChange)
  return () => query?.removeEventListener("change", onChange)
}
const isPhone = () => window.matchMedia?.(PHONE_QUERY).matches ?? false
const notPhone = () => false

/**
 * A flyout has no side to open on at phone width, so its submenu overlaps the parent menu instead.
 * Pass the result as `sideOffset`; it is undefined above phone width, which keeps Radix's default.
 */
export function usePhoneSubmenuOffset() {
  return React.useSyncExternalStore(subscribe, isPhone, notPhone) ? OVERLAP : undefined
}
