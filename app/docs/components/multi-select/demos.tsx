"use client"

import { useState } from "react"
import {
  Code,
  PenNib,
  Megaphone,
  Package,
  ChartLineUp,
  EnvelopeSimple,
  DeviceMobile,
  ChatCircle,
  Desktop,
  Eye,
  PencilSimple,
  UploadSimple,
  UsersThree,
  CreditCard,
  Circle,
} from "@phosphor-icons/react"

import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectSwitchItem,
  MultiSelectGroup,
  MultiSelectLabel,
  MultiSelectSeparator,
} from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { cn } from "@/lib/utils"

// Labels for the categories used across several demos: keeps the chip-rendering demo honest
// (the trigger maps the stored values back to display labels).
const CATEGORY_LABELS: Record<string, string> = {
  engineering: "Engineering",
  design: "Design",
  marketing: "Marketing",
  product: "Product",
  sales: "Sales",
}

export function MultiSelectCategoriesDemo() {
  return (
    <MultiSelect defaultValue={["engineering", "design"]}>
      <MultiSelectTrigger className="w-64">
        <MultiSelectValue placeholder="Select categories" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectItem value="engineering">
          <Code weight="bold" /> Engineering
        </MultiSelectItem>
        <MultiSelectItem value="design">
          <PenNib weight="bold" /> Design
        </MultiSelectItem>
        <MultiSelectItem value="marketing">
          <Megaphone weight="bold" /> Marketing
        </MultiSelectItem>
        <MultiSelectItem value="product">
          <Package weight="bold" /> Product
        </MultiSelectItem>
        <MultiSelectItem value="sales">
          <ChartLineUp weight="bold" /> Sales
        </MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  )
}

export function MultiSelectSwitchDemo() {
  return (
    <MultiSelect defaultValue={["email", "push"]}>
      <MultiSelectTrigger className="w-64">
        <MultiSelectValue
          placeholder="Notification channels"
          renderValue={(value) => (
            <>
              <AnimatedNumber value={value.length} /> channels on
            </>
          )}
        />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectSwitchItem value="email">
          <EnvelopeSimple weight="bold" /> Email
        </MultiSelectSwitchItem>
        <MultiSelectSwitchItem value="push">
          <DeviceMobile weight="bold" /> Push
        </MultiSelectSwitchItem>
        <MultiSelectSwitchItem value="sms">
          <ChatCircle weight="bold" /> SMS
        </MultiSelectSwitchItem>
        <MultiSelectSwitchItem value="desktop">
          <Desktop weight="bold" /> Desktop
        </MultiSelectSwitchItem>
      </MultiSelectContent>
    </MultiSelect>
  )
}

export function MultiSelectSectionsDemo() {
  return (
    <MultiSelect defaultValue={["read"]}>
      <MultiSelectTrigger className="w-64">
        <MultiSelectValue placeholder="Select permissions" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          <MultiSelectLabel>Content</MultiSelectLabel>
          <MultiSelectItem value="read">
            <Eye weight="bold" /> Read
          </MultiSelectItem>
          <MultiSelectItem value="write">
            <PencilSimple weight="bold" /> Write
          </MultiSelectItem>
          <MultiSelectItem value="publish">
            <UploadSimple weight="bold" /> Publish
          </MultiSelectItem>
        </MultiSelectGroup>
        <MultiSelectSeparator />
        <MultiSelectGroup>
          <MultiSelectLabel>Admin</MultiSelectLabel>
          <MultiSelectItem value="users">
            <UsersThree weight="bold" /> Manage users
          </MultiSelectItem>
          <MultiSelectItem value="billing" disabled>
            <CreditCard weight="bold" /> Billing (owner only)
          </MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  )
}

export function MultiSelectChipsDemo() {
  const [value, setValue] = useState<string[]>(["engineering", "product"])
  // Presence for the chips: `display` keeps a chip mounted through its exit so a deselected
  // category can zoom + fade OUT instead of vanishing, matching the zoom + fade IN of a new one.
  // A chip is "leaving" once it's no longer in `value`; onAnimationEnd drops it from `display`.
  // Same consumer-owned exit pattern as OrderSummary.
  const [display, setDisplay] = useState<string[]>(["engineering", "product"])

  function handleChange(next: string[]) {
    setValue(next)
    // Append newly selected chips (they mount → animate in); keep the rest so removed ones
    // linger to animate out. Reset to empty when nothing's left so no chip goes stale off-screen.
    setDisplay((prev) =>
      next.length === 0 ? [] : [...prev, ...next.filter((v) => !prev.includes(v))],
    )
  }

  return (
    <MultiSelect value={value} onValueChange={handleChange}>
      <MultiSelectTrigger className="w-72">
        <MultiSelectValue
          placeholder="Select categories"
          renderValue={() => (
            <span className="flex gap-1 overflow-hidden">
              {display.map((v) => {
                const leaving = !value.includes(v)
                return (
                  <Badge
                    key={v}
                    variant="secondary"
                    size="sm"
                    pill
                    className={cn(
                      "duration-fast ease-out",
                      leaving
                        // fill-mode-forwards holds the chip at opacity-0 after the exit finishes,
                        // so it never flashes back to full for the frame before React unmounts it.
                        ? "animate-out fade-out-0 zoom-out-95 fill-mode-forwards"
                        : "animate-in fade-in-0 zoom-in-95",
                    )}
                    onAnimationEnd={() => {
                      if (leaving) setDisplay((d) => d.filter((x) => x !== v))
                    }}
                  >
                    {CATEGORY_LABELS[v] ?? v}
                  </Badge>
                )
              })}
            </span>
          )}
        />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectItem value="engineering">
          <Code weight="bold" /> Engineering
        </MultiSelectItem>
        <MultiSelectItem value="design">
          <PenNib weight="bold" /> Design
        </MultiSelectItem>
        <MultiSelectItem value="marketing">
          <Megaphone weight="bold" /> Marketing
        </MultiSelectItem>
        <MultiSelectItem value="product">
          <Package weight="bold" /> Product
        </MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  )
}

export function MultiSelectDensityDemo() {
  return (
    <div className="flex items-center gap-4">
      <MultiSelect defaultValue={["a"]}>
        <MultiSelectTrigger className="w-44">
          <MultiSelectValue placeholder="Comfortable" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectItem value="a">
            <Circle weight="bold" /> Option A
          </MultiSelectItem>
          <MultiSelectItem value="b">
            <Circle weight="bold" /> Option B
          </MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
      <MultiSelect defaultValue={["a"]} density="compact">
        <MultiSelectTrigger className="w-44">
          <MultiSelectValue placeholder="Compact" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectItem value="a">
            <Circle weight="bold" /> Option A
          </MultiSelectItem>
          <MultiSelectItem value="b">
            <Circle weight="bold" /> Option B
          </MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  )
}
