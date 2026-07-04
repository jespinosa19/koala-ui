"use client"

import * as React from "react"
import { BellSimple, Moon } from "@phosphor-icons/react"

import { Switch } from "@/components/ui/switch"

/** Hero: a switch paired with a label (the label is the larger hit target). */
export function SwitchDemo() {
  return (
    <label htmlFor="airplane" className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
      <Switch id="airplane" defaultChecked />
      Airplane mode
    </label>
  )
}

/** Every state: off, on, and the two disabled variants. */
export function StatesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {[
        { label: "Off", props: { checked: false } },
        { label: "On", props: { checked: true } },
        { label: "Disabled", props: { disabled: true } },
        { label: "Disabled on", props: { disabled: true, checked: true } },
      ].map(({ label, props }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <Switch aria-label={label} {...props} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** A settings row: leading icon + label/description on the left, switch trailing right. */
export function SettingsRowDemo() {
  const rows = [
    {
      id: "notifications",
      icon: BellSimple,
      title: "Push notifications",
      description: "Get notified when someone mentions you or replies to a thread.",
      defaultChecked: true,
    },
    {
      id: "dark-mode",
      icon: Moon,
      title: "Reduce motion",
      description: "Minimize non-essential animations across the app.",
      defaultChecked: false,
    },
  ]
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border rounded-xl border border-border">
      {rows.map(({ id, icon: Icon, title, description, defaultChecked }) => (
        <label
          key={id}
          htmlFor={id}
          className="flex cursor-pointer items-start gap-3 p-4"
        >
          <Icon weight="bold" className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium leading-none">{title}</span>
            <span className="text-sm text-muted-foreground">{description}</span>
          </div>
          <Switch id={id} defaultChecked={defaultChecked} className="mt-0.5" />
        </label>
      ))}
    </div>
  )
}

/** Controlled: the switch drives a piece of state you can read elsewhere. */
export function ControlledDemo() {
  const [enabled, setEnabled] = React.useState(true)
  return (
    <div className="flex flex-col items-center gap-3">
      <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle" />
      <span className="text-sm text-muted-foreground">
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  )
}
