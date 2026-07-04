"use client"

import * as React from "react"
import { ArrowClockwise } from "@phosphor-icons/react"

import {
  SectionHeader,
  SectionHeaderText,
  SectionHeaderHeading,
  SectionHeaderDescription,
  SectionHeaderActions,
  type SectionHeaderStaggerBy,
} from "@/components/ui/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Cadence presets: the number passed to `stagger` is the gap between units, in ms. */
const CADENCES = [
  { value: "snappy", label: "Snappy", step: 40 },
  { value: "default", label: "Default", step: 70 },
  { value: "relaxed", label: "Relaxed", step: 120 },
]

/** A labelled control group for the config bar. */
function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex h-8 items-center">{children}</div>
    </div>
  )
}

/**
 * Live demo for the SectionHeader `stagger` family. The controls pick the granularity (`staggerBy`),
 * cadence (the `stagger` number), and blur (`staggerBlur`); every change bumps a key so the header
 * remounts and the cascade replays (it fires once on mount).
 */
export function SectionHeaderStaggerDemo() {
  const [by, setBy] = React.useState<SectionHeaderStaggerBy>("word")
  const [cadence, setCadence] = React.useState("default")
  const [blur, setBlur] = React.useState(true)
  const [runId, setRunId] = React.useState(0)

  const step = CADENCES.find((c) => c.value === cadence)?.step ?? 70
  const replay = () => setRunId((n) => n + 1)

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Control label="Granularity">
            <ToggleGroup
              type="single"
              size="sm"
              value={by}
              onValueChange={(v) => {
                if (!v) return
                setBy(v as SectionHeaderStaggerBy)
                replay()
              }}
              aria-label="Stagger granularity"
            >
              <ToggleGroupItem value="phrase">Phrase</ToggleGroupItem>
              <ToggleGroupItem value="word">Word</ToggleGroupItem>
            </ToggleGroup>
          </Control>

          <Control label="Cadence">
            <ToggleGroup
              type="single"
              size="sm"
              value={cadence}
              onValueChange={(v) => {
                if (!v) return
                setCadence(v)
                replay()
              }}
              aria-label="Stagger cadence"
            >
              {CADENCES.map((c) => (
                <ToggleGroupItem key={c.value} value={c.value}>
                  {c.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Control>

          <Control label="Blur">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Switch
                checked={blur}
                onCheckedChange={(v) => {
                  setBlur(v)
                  replay()
                }}
                aria-label="Blur on entrance"
              />
              <span className="text-muted-foreground">{blur ? "On" : "Off"}</span>
            </label>
          </Control>
        </div>

        <Button size="sm" variant="outline" onClick={replay}>
          <ArrowClockwise weight="bold" />
          Replay
        </Button>
      </div>

      <SectionHeader
        key={`${by}-${cadence}-${blur}-${runId}`}
        align="center"
        stagger={step}
        staggerBy={by}
        staggerBlur={blur}
        staggerTrigger="inView"
      >
        <SectionHeaderText>
          <Badge variant="success" dot pill>
            New
          </Badge>
          <SectionHeaderHeading>Build interfaces that feel alive</SectionHeaderHeading>
          <SectionHeaderDescription>
            Choose how the lede arrives: reveal it part by part, or let the copy type itself in word
            by word, with or without a soft focus pull as each unit lands.
          </SectionHeaderDescription>
        </SectionHeaderText>
        <SectionHeaderActions>
          <Button>Get started</Button>
          <Button variant="outline">Explore features</Button>
        </SectionHeaderActions>
      </SectionHeader>
    </div>
  )
}
