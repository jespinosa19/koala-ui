import { ComponentPreview } from "@/components/docs/component-preview"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { Installation } from "@/components/docs/installation"
import { DocHeader, DocSection } from "@/components/docs/doc-page"
import { Faq } from "@/components/docs/faq"

import {
  ColorPickerDemo,
  ColorPickerModesDemo,
  ColorPickerPopoverDemo,
  ColorPickerAlphaDemo,
  ColorPickerPresetsDemo,
} from "./color-picker-examples-demo"

export const metadata = { title: "Color Picker" }

export default function ColorPickerDocsPage() {
  return (
    <>
      <DocHeader
        title="Color Picker"
        description="A full HSV color picker: a draggable saturation/brightness square, a hue rail, an optional alpha rail, a hex field, an eyedropper, and preset swatches. The 1D rails ride on Radix Slider for free keyboard and ARIA; the 2D square is pointer-driven. HSV is the working model, so dragging brightness to black never loses the hue."
      />

      <ComponentPreview code={HERO_CODE}>
        <ColorPickerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation component="color-picker" />
      </DocSection>

      <DocSection title="Usage">
        <CodeSnippet
          filename="usage.tsx"
          className="mt-4"
          code={`import { ColorPicker } from "@/components/ui/color-picker"

export function Example() {
  const [color, setColor] = useState("#6366f1")
  return <ColorPicker value={color} onValueChange={setColor} />
}`}
        />
      </DocSection>

      <DocSection title="Fill modes">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass <code className="font-mono text-sm">modes</code> with two or more entries to add a
          Figma-style fill-type row at the top: a tile per fill kind (Solid, each gradient geometry,
          Image), each a live preview. The gradient editor gives you a draggable stop track (click
          to add a stop, drag to move it, Delete to remove) and an angle rail for linear gradients;
          the image mode takes an upload or a URL with a cover/contain fit. Use{" "}
          <code className="font-mono text-sm">onFillChange</code> to receive one CSS value across
          every mode: a hex, a <code className="font-mono text-sm">linear-gradient()</code>, or a{" "}
          <code className="font-mono text-sm">url()</code>.
        </p>
        <ComponentPreview code={MODES_CODE}>
          <ColorPickerModesDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="In a popover">
        <p className="mt-4 text-pretty text-muted-foreground">
          Wrap a <code className="font-mono text-sm">ColorPickerTriggerSwatch</code> in{" "}
          <code className="font-mono text-sm">ColorPickerTrigger</code> for the classic field
          affordance: a swatch of the current color that opens the panel on click.
        </p>
        <ComponentPreview code={POPOVER_CODE}>
          <ColorPickerPopoverDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Alpha">
        <p className="mt-4 text-pretty text-muted-foreground">
          Set <code className="font-mono text-sm">showAlpha</code> to add a transparency rail. The
          emitted hex then carries the <code className="font-mono text-sm">aa</code> byte whenever
          alpha drops below 100%.
        </p>
        <ComponentPreview code={ALPHA_CODE}>
          <ColorPickerAlphaDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Presets">
        <p className="mt-4 text-pretty text-muted-foreground">
          Pass your own <code className="font-mono text-sm">presets</code> palette. The parts are
          named exports, so you can recompose them. Here only{" "}
          <code className="font-mono text-sm">ColorPickerSwatches</code> renders, for a compact
          swatch-only picker.
        </p>
        <ComponentPreview code={PRESETS_CODE}>
          <ColorPickerPresetsDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="FAQ">
        <Faq
          items={[
            {
              q: "When should I use ColorPicker versus the plain Slider or a swatch grid?",
              a: "Reach for ColorPicker when a user needs to choose an arbitrary color: it gives you the 2D saturation/brightness square, a hue rail, an optional alpha rail, a hex field, and an eyedropper. If you only need a fixed set of brand colors, render ColorPickerSwatches on its own with a presets array, and if you just need a 1D value pick a plain Slider instead.",
            },
            {
              q: "How do I turn on the Solid / Gradient / Image modes?",
              a: "Pass the `modes` prop with the kinds you want, for example modes={[\"solid\", \"gradient\", \"image\"]}. With a single mode (the default) no switcher renders and the picker behaves exactly as before. With two or more, a Figma-style fill-type row of live-preview tiles appears at the top, one tile per fill kind, with each gradient geometry (linear/radial) getting its own tile so picking it both switches mode and sets the geometry. Control the active mode with `mode`/`defaultMode`/`onModeChange` if you need it, and recompose by hand with ColorPickerModes, ColorPickerGradient, and ColorPickerImage.",
            },
            {
              q: "What does the picker emit in gradient and image modes?",
              a: "Use `onFillChange`, which fires in every mode with a single CSS value you can drop straight into a `background`: a hex in solid mode, a `linear-gradient()`/`radial-gradient()` in gradient mode, and a `url(\"…\")` in image mode. `onValueChange` keeps firing the solid hex for backward compatibility, so existing solid-only code is untouched.",
            },
            {
              q: "How does the gradient stop track work?",
              a: "Click an empty spot on the track to add a stop (it samples the color already showing there), drag a stop to move it, and select one to edit its color with the square, hue/alpha rails, and hex field below. With three or more stops, pressing Delete or Backspace on a focused stop removes it; the arrow keys nudge its position (hold Shift for a larger step). The geometry (linear/radial) is set from the Figma-style fill-type tiles at the top of the panel, and the angle rail sets a linear gradient's direction.",
            },
            {
              q: "How do I get a transparent color out of the picker?",
              a: "Set the `showAlpha` prop. That renders the alpha rail and makes `onValueChange` emit an 8-digit hex with the trailing `aa` byte whenever alpha drops below 100%, for example `#a855f7cc`.",
            },
            {
              q: "Is ColorPicker controlled or uncontrolled?",
              a: "Both. Pass `value` plus `onValueChange` for a controlled hex string, or pass `defaultValue` (which falls back to `#3b82f6`) and let the picker own its state. Internally it keeps HSV as the source of truth via reconcileHsva, so dragging brightness to black never throws away your hue.",
            },
            {
              q: "How do I build the popover swatch field, and which parts compose it?",
              a: "Wrap a `ColorPickerTriggerSwatch` (pass it the same `value`) inside `ColorPickerTrigger asChild`, then put a `ColorPicker` inside `ColorPickerContent`. ColorPickerPopover, ColorPickerTrigger, and ColorPickerContent are thin Radix Popover wrappers, so the panel portals and animates for free.",
            },
            {
              q: "Can keyboard users operate the saturation square?",
              a: "Yes. The square has role `slider` and is focusable, and the arrow keys nudge saturation and brightness by 1, or by 10 with Shift held. The hue and alpha rails ride on Radix Slider, so they get full keyboard, drag, and ARIA support automatically.",
            },
            {
              q: "How do I make the picker more compact, and will the hex input still match the surface?",
              a: "Pass `density=\"compact\"` (or let it inherit from a DensityProvider) to shrink the panel width and the square's height; density never touches color or radius. The root declares `--surface: var(--popover)`, so the nested hex Input and eyedropper blend into the popover instead of painting a plain background block.",
            },
          ]}
        />
      </DocSection>
    </>
  )
}

const HERO_CODE = `const [color, setColor] = useState("#6366f1")

// Standalone the picker is chromeless (its surface comes from ColorPickerContent in a
// popover); give it one via className when you drop it straight onto a page.
<ColorPicker
  value={color}
  onValueChange={setColor}
  className="rounded-xl border border-border bg-popover p-3 shadow-xs"
/>`

const MODES_CODE = `const [fill, setFill] = useState("linear-gradient(90deg, #6366f1, #ec4899)")

<ColorPicker
  modes={["solid", "gradient", "image"]}
  defaultMode="gradient"
  showAlpha
  defaultValue="#6366f1"
  onFillChange={setFill}
  className="rounded-xl border border-border bg-popover p-3 shadow-xs"
/>

// fill is a hex, a linear-gradient()/radial-gradient(), or a url("…")`

const POPOVER_CODE = `const [color, setColor] = useState("#22c55e")

<ColorPickerPopover>
  <ColorPickerTrigger asChild>
    <ColorPickerTriggerSwatch value={color} aria-label="Choose brand color" />
  </ColorPickerTrigger>
  <ColorPickerContent>
    <ColorPicker value={color} onValueChange={setColor} />
  </ColorPickerContent>
</ColorPickerPopover>`

const ALPHA_CODE = `const [color, setColor] = useState("#a855f7cc")

<ColorPicker
  showAlpha
  value={color}
  onValueChange={setColor}
  className="rounded-xl border border-border bg-popover p-3 shadow-xs"
/>`

const PRESETS_CODE = `const presets = ["#ef4444", "#f97316", "#eab308", "#84cc16", /* … */]

<ColorPicker
  value={color}
  onValueChange={setColor}
  presets={presets}
  className="w-56 rounded-xl border border-border bg-popover p-3 shadow-xs"
>
  {/* Recompose: render only the swatch grid */}
  <ColorPickerSwatches presets={presets} className="grid-cols-4" />
</ColorPicker>`
