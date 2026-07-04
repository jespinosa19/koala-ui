"use client"

import {
  Pizza,
  Hamburger,
  Fish,
  Egg,
  Coffee,
  Clock,
  Gift,
  Lightning,
  Buildings,
  Circle,
  Gauge,
  Brain,
  MapPin,
  CaretDown,
  Check,
} from "@phosphor-icons/react"

import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  selectVariants,
} from "@/components/ui/select"
import { CountrySelect } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Icon + label both land inside SelectItem's ItemText, so wrap them in an
// inline-flex span for spacing + vertical centering. Phosphor icons get size-5
// automatically from the item recipe's `[&_svg:not([class*='size-'])]` rule.
function Option({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-2">{children}</span>
}

export function SelectDishDemo() {
  return (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a dish" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="coffee">
          <Option>
            <Coffee weight="bold" /> Coffee
          </Option>
        </SelectItem>
        <SelectItem value="egg">
          <Option>
            <Egg weight="bold" /> Eggs benedict
          </Option>
        </SelectItem>
        <SelectItem value="fish">
          <Option>
            <Fish weight="bold" /> Grilled fish
          </Option>
        </SelectItem>
        <SelectItem value="burger">
          <Option>
            <Hamburger weight="bold" /> Hamburger
          </Option>
        </SelectItem>
        <SelectItem value="pizza">
          <Option>
            <Pizza weight="bold" /> Pizza
          </Option>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

// A list long enough that the menu must scroll, so the viewport's scroll-fade edges show:
// the top/bottom rows dissolve into the popover as a "more above / below" cue (scrollbars are
// hidden site-wide). Alphabetical, one leading Phosphor icon per row, matching the DS convention.
const CITIES = [
  "Amsterdam", "Bangkok", "Berlin", "Buenos Aires", "Cairo", "Chicago",
  "Dubai", "Istanbul", "Lagos", "Lisbon", "London", "Madrid",
  "Mexico City", "Mumbai", "Nairobi", "New York", "Paris", "São Paulo",
  "Seoul", "Singapore", "Sydney", "Tokyo", "Toronto", "Vienna",
]

export function SelectScrollDemo() {
  return (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a city" />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city} value={city.toLowerCase().replace(/\s+/g, "-")}>
            <Option>
              <MapPin weight="bold" /> {city}
            </Option>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SelectCountryDemo() {
  // CountrySelect is the searchable picker for the full ~250-country list; a plain Select over
  // that many options is a long scroll. It looks like a Select trigger but filters as you type.
  return <CountrySelect defaultValue="US" className="w-56" aria-label="Country" />
}

export function SelectTimezoneDemo() {
  return (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="cet">
            <Option>
              <Clock weight="bold" /> Central European Time (CET)
            </Option>
          </SelectItem>
          <SelectItem value="gmt">
            <Option>
              <Clock weight="bold" /> Greenwich Mean Time (GMT)
            </Option>
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="cst">
            <Option>
              <Clock weight="bold" /> Central Standard Time (CST)
            </Option>
          </SelectItem>
          <SelectItem value="est">
            <Option>
              <Clock weight="bold" /> Eastern Standard Time (EST)
            </Option>
          </SelectItem>
          <SelectItem value="pst">
            <Option>
              <Clock weight="bold" /> Pacific Standard Time (PST)
            </Option>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function SelectPlanDemo() {
  return (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="enterprise" disabled>
          <Option>
            <Buildings weight="bold" /> Enterprise (contact us)
          </Option>
        </SelectItem>
        <SelectItem value="free">
          <Option>
            <Gift weight="bold" /> Free
          </Option>
        </SelectItem>
        <SelectItem value="pro">
          <Option>
            <Lightning weight="bold" /> Pro
          </Option>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export function SelectReasoningDemo() {
  // Terse options ("High" / "Medium") don't say what they cost you. A per-item `tooltip`
  // carries the trade-off so the choice is informed, surfaced on hover and on keyboard focus.
  return (
    <Select defaultValue="low">
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Reasoning effort" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="minimal" tooltip="Fastest, shallowest pass. Good for simple, well-scoped tasks.">
          <Option>
            <Gauge weight="bold" /> Minimal
          </Option>
        </SelectItem>
        <SelectItem value="low" tooltip="Optimizes for latency over depth.">
          <Option>
            <Lightning weight="bold" /> Low
          </Option>
        </SelectItem>
        <SelectItem value="medium" tooltip="Balances response speed against how hard the model thinks.">
          <Option>
            <Gauge weight="bold" /> Medium
          </Option>
        </SelectItem>
        <SelectItem value="high" tooltip="Deepest reasoning. Slower and more expensive, best for hard problems.">
          <Option>
            <Brain weight="bold" /> High
          </Option>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * Static, non-portal preview of both densities. We render the real `selectVariants`
 * slots directly (no Radix Root/Portal) so the comfortable vs compact menu is visible
 * side by side without opening anything: same trigger height, item padding, viewport
 * padding and separator spacing as a live Select, just inert. Mirrors the Dialog
 * "Sizes" showcase. `pointer-events-none` drops the hover/cursor affordances so the
 * inert surfaces never read as clickable.
 */
const DENSITY_DEMOS = [
  { density: "comfortable", label: "Comfortable", meta: "md trigger (h-9) · py-2 items", viewport: "p-1.5" },
  { density: "compact", label: "Compact", meta: "sm trigger (h-8) · py-1.5 items", viewport: "p-1" },
] as const

function DensityItem({
  slots,
  selected,
  children,
}: {
  slots: ReturnType<typeof selectVariants>
  selected?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={slots.item({
        className: selected ? "bg-accent text-accent-foreground" : undefined,
      })}
    >
      {selected && (
        <span className={slots.itemIndicator()}>
          <Check weight="bold" className="size-4" />
        </span>
      )}
      <span className={slots.itemText()}>{children}</span>
    </div>
  )
}

export function SelectDensityDemo() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      {DENSITY_DEMOS.map(({ density, label, meta, viewport }) => {
        // Density picks the default size (compact → sm, comfortable → md); the trigger height
        // follows that, while the item/viewport padding follows density directly.
        const slots = selectVariants({ size: density === "compact" ? "sm" : "md", density })
        return (
          <div
            key={density}
            className="pointer-events-none flex w-44 flex-col gap-2"
            aria-hidden
          >
            {/* Inert trigger: shows the height difference. */}
            <div className={slots.trigger()} data-placeholder>
              <span>{label}</span>
              <CaretDown weight="bold" className={slots.chevron()} />
            </div>
            {/* Inert open menu: shows label, item and viewport padding + separator spacing. */}
            <div className={slots.content({ className: "w-full" })}>
              <div className={cn("flex flex-col", viewport)}>
                <div className={slots.label()}>Options</div>
                <DensityItem slots={slots} selected>
                  <Circle weight="bold" /> Option A
                </DensityItem>
                <DensityItem slots={slots}>
                  <Circle weight="bold" /> Option B
                </DensityItem>
                <div className={slots.separator()} />
                <DensityItem slots={slots}>
                  <Circle weight="bold" /> Option C
                </DensityItem>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground tabular-nums">{meta}</p>
          </div>
        )
      })}
    </div>
  )
}
