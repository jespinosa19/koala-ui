"use client"

import * as React from "react"
import { Lightning, Tag } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { BadgeGroup } from "@/components/ui/badge-group"

const SKILLS = ["React", "TypeScript", "Design Systems", "Node", "GraphQL", "Infra", "Motion"]

/** Hero: a skill set capped at three chips; the rest fold into a `+N` that reveals the whole
 *  list on hover or focus. */
export function BadgeGroupHeroDemo() {
  return (
    <BadgeGroup max={3}>
      {SKILLS.map((skill) => (
        <Badge key={skill} variant="secondary" size="sm">
          {skill}
        </Badge>
      ))}
    </BadgeGroup>
  )
}

/** Overflow: the same set at a few caps so the `+N` math reads at a glance. */
export function BadgeGroupOverflowDemo() {
  return (
    <div className="flex flex-col gap-4">
      {[2, 4, undefined].map((max, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
            {max == null ? "no max" : `max ${max}`}
          </span>
          <BadgeGroup max={max}>
            {SKILLS.map((skill) => (
              <Badge key={skill} variant="secondary" size="sm">
                {skill}
              </Badge>
            ))}
          </BadgeGroup>
        </div>
      ))}
    </div>
  )
}

/** Wrap: without a cap, a long set wraps to multiple lines instead of collapsing. */
export function BadgeGroupWrapDemo() {
  return (
    <BadgeGroup wrap className="max-w-xs">
      {SKILLS.map((skill) => (
        <Badge key={skill} variant="outline" size="sm">
          <Tag weight="bold" /> {skill}
        </Badge>
      ))}
    </BadgeGroup>
  )
}

/** Overflow chip: match the `+N` to the badges it stands in for with `overflowVariant` /
 *  `overflowSize`. */
export function BadgeGroupOverflowChipDemo() {
  return (
    <div className="flex flex-col gap-4">
      <BadgeGroup max={2} overflowVariant="secondary">
        {SKILLS.map((skill) => (
          <Badge key={skill} variant="secondary" size="sm">
            {skill}
          </Badge>
        ))}
      </BadgeGroup>
      <BadgeGroup max={2} overflowVariant="purple" overflowSize="md">
        {SKILLS.map((skill) => (
          <Badge key={skill} variant="purple" size="md">
            <Lightning weight="bold" /> {skill}
          </Badge>
        ))}
      </BadgeGroup>
    </div>
  )
}

/** Interactive: when the badges carry links or a remove button, pass `interactive` so the
 *  overflow tooltip stays open while the pointer is inside it. */
export function BadgeGroupInteractiveDemo() {
  const [tags, setTags] = React.useState(SKILLS)
  return (
    <div className="flex flex-col items-center gap-3">
      <BadgeGroup max={3} interactive overflowVariant="secondary">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            size="sm"
            pill
            onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
            removeLabel={`Remove ${tag}`}
          >
            {tag}
          </Badge>
        ))}
      </BadgeGroup>
      {tags.length < SKILLS.length && (
        <button
          type="button"
          onClick={() => setTags(SKILLS)}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  )
}

/** Custom overflow: take over the tooltip body with `renderOverflow`; here a titled, two-column
 *  layout of just the hidden tags. */
export function BadgeGroupCustomOverflowDemo() {
  return (
    <BadgeGroup
      max={3}
      renderOverflow={(_, hidden) => (
        <div className="flex flex-col gap-1.5 p-1 text-left">
          <span className="text-xs font-medium text-muted-foreground">
            {hidden.length} more skills
          </span>
          <div className="grid grid-cols-2 gap-1">{hidden}</div>
        </div>
      )}
    >
      {SKILLS.map((skill) => (
        <Badge key={skill} variant="teal" size="sm">
          {skill}
        </Badge>
      ))}
    </BadgeGroup>
  )
}
