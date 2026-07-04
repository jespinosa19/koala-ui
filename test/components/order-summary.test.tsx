import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { OrderSummaryShoppingCartDemo } from "@/app/docs/components/order-summary/order-summary-demos"

// The row exit is CSS (globals.css), which jsdom doesn't run — so `onAnimationEnd` (which finalizes
// the removal) never fires here. This guards the contract that the empty state appears the moment
// the last row stops being VISIBLE (leaving), NOT after its exit animation finishes: no wait, no lag.
describe("OrderSummary shopping cart", () => {
  it("reveals the empty state immediately when the last item is removed", async () => {
    const user = userEvent.setup()
    render(<OrderSummaryShoppingCartDemo />)

    expect(screen.queryByText("Your cart is empty.")).toBeNull()

    for (const btn of screen.getAllByRole("button", { name: /^Remove / })) {
      await user.click(btn)
    }

    // No animationend has fired (jsdom), so a visible empty state proves the reveal did not
    // wait on the exit animation to complete.
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument()
  })
})
