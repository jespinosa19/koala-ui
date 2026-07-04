import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TextB, TextItalic, ArrowUUpLeft } from "@phosphor-icons/react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarGroup,
  ToolbarOverflow,
  type ToolbarOverflowItem,
} from "@/components/ui/toolbar"
import { expectNoA11yViolations } from "../a11y"

describe("Toolbar", () => {
  it("exposes role=toolbar with an accessible name", () => {
    render(
      <Toolbar aria-label="Formatting">
        <ToolbarButton aria-label="Bold">
          <TextB />
        </ToolbarButton>
      </Toolbar>,
    )
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument()
  })

  it("reflects the pressed prop as aria-pressed", () => {
    render(
      <Toolbar aria-label="Formatting">
        <ToolbarButton aria-label="Bold" pressed>
          <TextB />
        </ToolbarButton>
      </Toolbar>,
    )
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true")
  })

  it("has no a11y violations", async () => {
    const { container } = render(
      <Toolbar aria-label="Formatting">
        <ToolbarButton aria-label="Undo">
          <ArrowUUpLeft />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarGroup aria-label="Marks">
          <ToolbarButton aria-label="Bold" pressed>
            <TextB />
          </ToolbarButton>
          <ToolbarButton aria-label="Italic">
            <TextItalic />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
    )
    await expectNoA11yViolations(container)
  })
})

describe("ToolbarGroup", () => {
  it("is an aria-labelled group region", () => {
    render(
      <Toolbar aria-label="Formatting">
        <ToolbarGroup aria-label="History">
          <ToolbarButton aria-label="Undo">
            <ArrowUUpLeft />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
    )
    expect(screen.getByRole("group", { name: "History" })).toBeInTheDocument()
  })
})

describe("ToolbarToggleGroup", () => {
  function Harness() {
    const [marks, setMarks] = React.useState<string[]>([])
    return (
      <Toolbar aria-label="Formatting">
        <ToolbarToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
          <ToolbarToggleItem value="bold" aria-label="Bold">
            <TextB />
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      </Toolbar>
    )
  }

  it("toggles pressed state on click", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const bold = screen.getByRole("button", { name: "Bold" })
    expect(bold).toHaveAttribute("aria-pressed", "false")
    await user.click(bold)
    expect(bold).toHaveAttribute("aria-pressed", "true")
  })
})

describe("ToolbarOverflow", () => {
  const items: ToolbarOverflowItem[] = [
    { type: "action", id: "undo", icon: ArrowUUpLeft, label: "Undo" },
    { type: "separator", id: "sep" },
    { type: "toggle", id: "bold", icon: TextB, label: "Bold", pressed: false },
  ]

  it("renders every control as an accessible bar button when the space allows", () => {
    // jsdom reports zero geometry, so nothing overflows: all controls stay in the bar.
    render(<ToolbarOverflow items={items} aria-label="Formatting" />)
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument()
  })

  it("fires onPressedChange when a toggle control is clicked", async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(
      <ToolbarOverflow
        aria-label="Formatting"
        items={[{ type: "toggle", id: "bold", icon: TextB, label: "Bold", pressed: false, onPressedChange }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Bold" }))
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it("has no a11y violations", async () => {
    const { container } = render(<ToolbarOverflow items={items} aria-label="Formatting" />)
    await expectNoA11yViolations(container)
  })
})
