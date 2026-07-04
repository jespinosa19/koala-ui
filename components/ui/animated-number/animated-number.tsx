"use client"

import * as React from "react"

import { tv } from "@/lib/tv"

/**
 * AnimatedNumber: a figure that rolls when it changes. The old value lifts up and out while the
 * new one rises from below into place (the slot-machine roll), driven by the `number-roll-*`
 * keyframes (globals.css, gated on the motion query). Drop it around any changing number: a cart
 * line total, a Stat's value, a live
 * counter. `tabular-nums` keeps the width steady so neighbours never jump, and the whole thing
 * holds still under `prefers-reduced-motion`.
 *
 * Not multi-part in the public sense: it renders one `<span>` with two internal layers (incoming +
 * outgoing) it swaps itself, so there are no exported parts. Single `tv` recipe, no variants.
 */
export const animatedNumberVariants = tv({
  slots: {
    // The positioning context for the crossfade. No overflow clip: the layers dissolve on opacity
    // rather than being sliced by a window edge, so no hard top/bottom "limits" show. align-bottom
    // keeps the inline box seated on the text baseline of whatever sits beside it.
    root: "relative inline-block align-bottom tabular-nums",
    // The visible (incoming) layer, in normal flow so it sizes the box.
    incoming: "block",
    // The outgoing layer, taken out of flow so it doesn't widen the box as it fades away. It rests
    // at opacity-0: while the roll runs the keyframe fades it 1 → 0 (over the base), and if the
    // animation never runs (reduced-motion, or a build where the class isn't live yet) it simply
    // stays invisible instead of overlapping the incoming value.
    outgoing: "absolute inset-0 block opacity-0 number-roll-out",
  },
})

export interface AnimatedNumberProps extends React.ComponentProps<"span"> {
  /** The figure to show. Changing it rolls the old value up and out, the new in from below. */
  value: React.ReactNode
}

export function AnimatedNumber({ value, className, ...props }: AnimatedNumberProps) {
  const { root, incoming, outgoing } = animatedNumberVariants()

  // React's blessed "store the previous value" pattern: adjust state *during render* (never in an
  // effect, which the strict react-hooks lint forbids) so a changed `value` captures the old figure
  // as the outgoing layer and bumps `seq` — the key that remounts both layers to replay their rolls.
  const [state, setState] = React.useState<{
    value: React.ReactNode
    prev: React.ReactNode | null
    seq: number
  }>(() => ({ value, prev: null, seq: 0 }))

  if (!Object.is(state.value, value)) {
    setState((s) => ({ value, prev: s.value, seq: s.seq + 1 }))
  }

  return (
    <span data-slot="animated-number" className={root({ className })} {...props}>
      {/* Enter animation is gated on seq > 0 so the very first paint doesn't roll (polish #13). */}
      <span
        key={`in-${state.seq}`}
        className={incoming({
          className: state.seq > 0 ? "number-roll-in" : undefined,
        })}
      >
        {state.value}
      </span>
      {state.prev != null && (
        <span
          key={`out-${state.seq}`}
          aria-hidden
          className={outgoing()}
          // Clear the outgoing layer the moment its roll finishes (an event handler, not an effect).
          onAnimationEnd={() => setState((s) => ({ ...s, prev: null }))}
        >
          {state.prev}
        </span>
      )}
    </span>
  )
}
