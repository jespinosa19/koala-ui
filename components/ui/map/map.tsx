"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Crosshair, Minus, NavigationArrow, Plus } from "@phosphor-icons/react"
import type {
  LngLatLike,
  Map as MapLibreMap,
  MapOptions,
  Marker as MapLibreMarker,
  PositionAnchor,
  StyleSpecification,
} from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import { tv, type VariantProps } from "@/lib/tv"
import { hitBox } from "@/lib/hit-area"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"

import { basemapStyle, paintBasemap, readColor, readPalette, type BasemapOptions } from "./map-style"

/**
 * Map: an interactive vector map on MapLibre GL that wears the theme. The default basemap is drawn
 * from OpenFreeMap's OpenStreetMap tiles (free, no key) and painted from the `--map-*` tokens, so
 * it is light, cream, dark or moonlight with the page, and re-paints in place when the theme
 * changes. Bring your own style with `mapStyle` and the theming steps aside.
 *
 * Multi-part, like every Koala compound: the root owns the MapLibre instance and hands it to its
 * parts through Context. `MapMarker` pins any React content to a coordinate, `MapControls` is a
 * floating Toolbar of zoom, compass and locate, and `useMap()` gives you the instance itself for
 * sources, layers and camera moves. MapLibre loads on the client only, after the first paint, so a
 * map never blocks a page and never renders on the server.
 */

export const mapVariants = tv({
  slots: {
    // The frame holds the land colour from the first paint, so the canvas fades in over its own
    // ground instead of over a white box. `isolate` keeps MapLibre's z-indexes inside the map.
    root: "relative isolate overflow-hidden bg-(--map-land) text-foreground",
    canvas: "absolute inset-0 transition-opacity duration-slow ease-out",
    // A floating part (controls, a legend, a search field) pinned to one corner of the frame.
    corner: "pointer-events-none absolute z-10 flex gap-2 p-3 *:pointer-events-auto",
    marker: "flex",
    // The element MapLibre positions. Markers stack in the order they were added, so a crowded
    // cluster of chips (prices on a map of stays) would bury the one being looked at: the hovered,
    // focused or selected pin rises above its neighbours.
    markerHost: "has-[[data-selected]]:z-10 hover:z-20 focus-within:z-20",
    // The canonical marker visual. A chip on the popover surface with the tone as a leading dot,
    // or the dot alone when there is no label. Elevated with a shadow and an inset hairline (rings,
    // not borders), so it reads on any basemap and any theme.
    pin: [
      "group/pin relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill text-xs font-medium",
      "bg-popover text-popover-foreground shadow-md ring-1 ring-inset ring-border [--surface:var(--popover)]",
      "transition-[background-color,color,box-shadow] duration-fast ease-out",
      "outline-none focus-visible:ring-2 focus-visible:ring-brand",
      // Selected is ink, not brand: the chip inverts and the dot keeps its tone.
      "data-[selected]:bg-foreground data-[selected]:text-background data-[selected]:ring-foreground",
      // Visited: a place already looked at greys out to the muted step, so the eye skips it. The
      // selected pin stays ink.
      "data-[visited]:not-data-[selected]:bg-muted",
    ],
    pinDot: "size-2.5 shrink-0 rounded-full ring-2 ring-popover group-data-[selected]/pin:ring-foreground",
    // The emoji variant's mark, in place of the dot. Beside a label it sits in its own circle,
    // 4px in from the 32px chip so the two pills are concentric. The well is a wash of the ink, not
    // a fill, so it still shows on a visited (muted) chip and flips to a wash of the page on a
    // selected (ink) one.
    pinEmoji: "flex shrink-0 items-center justify-center leading-none select-none",
  },
  variants: {
    // `rounded` (default) frames the map as an object in the page; `flush` is for a map that IS
    // the page (a full-screen console, a store locator's right half).
    frame: {
      rounded: { root: "rounded-xl ring-1 ring-inset ring-border" },
      flush: { root: "" },
    },
    position: {
      "top-left": { corner: "top-0 left-0 flex-col items-start" },
      "top-right": { corner: "top-0 right-0 flex-col items-end" },
      "bottom-left": { corner: "bottom-0 left-0 flex-col-reverse items-start" },
      "bottom-right": { corner: "bottom-0 right-0 flex-col-reverse items-end" },
    },
    loaded: {
      true: { canvas: "opacity-100" },
      false: { canvas: "opacity-0" },
    },
    tone: {
      brand: { pinDot: "bg-brand" },
      neutral: { pinDot: "bg-foreground" },
      info: { pinDot: "bg-info" },
      success: { pinDot: "bg-success" },
      warning: { pinDot: "bg-warning" },
      destructive: { pinDot: "bg-destructive" },
      purple: { pinDot: "bg-purple" },
      teal: { pinDot: "bg-teal" },
    },
    labelled: {
      // A 28px chip; the dot sits 9px in so it is concentric with the pill's end.
      true: { pin: "h-7 pr-3 pl-2.25" },
      // The dot alone, 14px with its ring, grown to the 40px target without growing the visual.
      false: { pin: `size-4 justify-center ${hitBox}`, pinDot: "size-2.5" },
    },
    interactive: {
      true: { pin: "cursor-pointer hover:bg-accent data-[selected]:hover:bg-foreground" },
      false: {},
    },
    // `price` is the chip a map of stays or listings wears: the figure alone, bolder and a step
    // larger, with no dot, so a dozen of them read as numbers to compare. Hover lifts it a shadow
    // step; the marker host raises it over its neighbours.
    variant: {
      default: {},
      price: {
        pin: "h-7 justify-center px-2.5 text-sm font-semibold tabular-nums hover:shadow-lg",
      },
      // `emoji` marks a place by what it is (a café, a beach, a museum) instead of a status tone:
      // a map of things to do, a trip, a neighbourhood guide.
      emoji: {},
    },
  },
  compoundVariants: [
    {
      variant: "emoji",
      labelled: true,
      class: {
        pin: "h-8 gap-1.5 pr-3 pl-1 text-sm",
        pinEmoji: "size-6 rounded-full bg-foreground/6 text-sm group-data-[selected]/pin:bg-background/15",
      },
    },
    // The emoji alone: a 36px round chip, grown to the 40px target by the hit box.
    { variant: "emoji", labelled: false, class: { pin: "size-9", pinEmoji: "text-lg" } },
  ],
  defaultVariants: { frame: "rounded", position: "top-right", loaded: false, tone: "brand", variant: "default" },
})

type MapLib = typeof import("maplibre-gl")

type MapContextValue = {
  /** The MapLibre instance, once created (null on the server and until MapLibre has loaded). */
  map: MapLibreMap | null
  /** The MapLibre module, for constructing markers, popups and LngLats. */
  lib: MapLib | null
  /** The style has loaded: sources and layers can be added. */
  loaded: boolean
}

const MapContext = React.createContext<MapContextValue | null>(null)

/**
 * The map under the current `Map`: `{ map, lib, loaded }`. Add sources and layers once `loaded`
 * is true; `map` is null on the server and for the first frames on the client.
 */
export function useMap(): MapContextValue {
  const context = React.useContext(MapContext)
  if (!context) throw new Error("`useMap` must be used within `Map`")
  return context
}

/**
 * A CSS colour (`"var(--brand)"`, any token) resolved for a MapLibre paint property, as seen from
 * this map, and re-resolved when the theme changes. Feed it to `setPaintProperty` in an effect and
 * your own layers re-paint with the basemap. Null until the map exists.
 */
export function useMapColor(color: string): string | null {
  const { map } = useMap()
  return React.useSyncExternalStore(
    subscribeTheme,
    () => (map ? readColor(map.getContainer(), color) : null),
    () => null,
  )
}

export interface MapView {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}

export interface MapProps
  extends Omit<React.ComponentProps<"div">, "onLoad" | "onClick">,
    Omit<VariantProps<typeof mapVariants>, "position" | "loaded">,
    BasemapOptions {
  /** Where the camera starts, `[longitude, latitude]`. */
  center?: [number, number]
  zoom?: number
  bearing?: number
  pitch?: number
  minZoom?: number
  maxZoom?: number
  /** Keep the camera inside `[[west, south], [east, north]]`. */
  maxBounds?: [[number, number], [number, number]]
  /** Pan, zoom and rotate with pointer and keyboard. @default true */
  interactive?: boolean
  /**
   * Scroll and one-finger drag pass through to the page; zooming takes Ctrl/⌘ + scroll and panning
   * two fingers. For a map embedded in a scrolling page.
   */
  cooperativeGestures?: boolean
  /** Replace the Koala basemap with any MapLibre style (a URL or an object). Theming steps aside. */
  mapStyle?: string | StyleSpecification
  /** The accessible name of the map region. @default "Map" */
  label?: string
  /** Any other MapLibre option, passed through at creation. */
  options?: Partial<Omit<MapOptions, "container" | "style">>
  /**
   * Where MapLibre's web worker is loaded from. By default it comes from jsDelivr at the exact
   * MapLibre version installed: MapLibre 6 ships its worker as separate files that a bundler does
   * not carry along. Point it at your own copy of `maplibre-gl-worker.mjs` (served next to its
   * `maplibre-gl-shared.mjs`) for a strict CSP or an offline network.
   */
  workerUrl?: string
  /** The style has loaded: add your sources and layers here or in a `useMap` effect. */
  onLoad?: (map: MapLibreMap) => void
  /** The camera came to rest after a pan, zoom or flight. */
  onMoveEnd?: (view: MapView) => void
  /** A click on the map itself (not on a marker). */
  onMapClick?: (lngLat: [number, number], map: MapLibreMap) => void
}

const viewOf = (map: MapLibreMap): MapView => {
  const c = map.getCenter()
  return { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() }
}

/** Fires when anything that can change a theme scope does: the root's class, style or data-*. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  const options = { attributes: true, attributeFilter: ["class", "style", "data-theme", "data-accent"] }
  observer.observe(document.documentElement, options)
  if (document.body) observer.observe(document.body, options)
  const scheme = window.matchMedia?.("(prefers-color-scheme: dark)")
  scheme?.addEventListener("change", onChange)
  return () => {
    observer.disconnect()
    scheme?.removeEventListener("change", onChange)
  }
}

export function Map({
  className,
  frame,
  center = [-73.9855, 40.758],
  zoom = 12,
  bearing = 0,
  pitch = 0,
  minZoom,
  maxZoom,
  maxBounds,
  interactive = true,
  cooperativeGestures = false,
  mapStyle,
  labels = true,
  buildings = true,
  label = "Map",
  options,
  workerUrl,
  onLoad,
  onMoveEnd,
  onMapClick,
  children,
  ...props
}: MapProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const container = React.useRef<HTMLDivElement>(null)
  const [state, setState] = React.useState<MapContextValue>({ map: null, lib: null, loaded: false })

  // The camera and options only seed the map: a map is created once, then moved by the user or
  // through `useMap`. Changing `center` later doesn't yank the camera back.
  const seed = React.useRef({ center, zoom, bearing, pitch, minZoom, maxZoom, maxBounds, interactive, cooperativeGestures, options, workerUrl })
  const basemap = React.useRef<BasemapOptions | null>(mapStyle ? null : { labels, buildings })
  const style = React.useRef(mapStyle)

  const handleLoad = React.useEffectEvent((map: MapLibreMap) => onLoad?.(map))
  const handleMoveEnd = React.useEffectEvent((map: MapLibreMap) => onMoveEnd?.(viewOf(map)))
  const handleClick = React.useEffectEvent((lngLat: [number, number], map: MapLibreMap) => onMapClick?.(lngLat, map))

  React.useEffect(() => {
    let cancelled = false
    let map: MapLibreMap | null = null
    let unsubscribe = () => {}

    import("maplibre-gl").then((mod) => {
      if (cancelled || !container.current || !root.current) return
      const lib = ((mod as { default?: MapLib }).default ?? mod) as MapLib
      // The worker has to be known before the first map exists: one pool serves every map.
      const worker = seed.current.workerUrl ?? `https://cdn.jsdelivr.net/npm/maplibre-gl@${lib.getVersion()}/dist/maplibre-gl-worker.mjs`
      if (lib.getWorkerUrl() !== worker) lib.setWorkerUrl(worker)
      const s = seed.current
      const theme = basemap.current
      map = new lib.Map({
        container: container.current,
        style: theme ? basemapStyle(readPalette(root.current), theme) : style.current!,
        center: s.center,
        zoom: s.zoom,
        bearing: s.bearing,
        pitch: s.pitch,
        minZoom: s.minZoom,
        maxZoom: s.maxZoom,
        maxBounds: s.maxBounds,
        interactive: s.interactive,
        cooperativeGestures: s.cooperativeGestures,
        attributionControl: { compact: true },
        ...s.options,
      })
      map.getCanvas().setAttribute("aria-label", "Interactive map. Use the arrow keys to pan and plus or minus to zoom.")
      const instance = map
      // Set once at load. Not `isStyleLoaded()`: that also waits on every source, so on a live map
      // whose GeoJSON updates every frame it is false almost all the time.
      let styleReady = false
      setState({ map: instance, lib, loaded: false })
      instance.once("load", () => {
        if (cancelled) return
        styleReady = true
        // The attribution starts folded to its (i): the credit stays one tap away without
        // covering the map.
        instance.getContainer().querySelector(".maplibregl-compact-show")?.classList.remove("maplibregl-compact-show")
        setState({ map: instance, lib, loaded: true })
        handleLoad(instance)
      })
      instance.on("moveend", () => handleMoveEnd(instance))
      instance.on("click", (e) => {
        // A click on a marker's own content is the marker's, not the map's.
        if ((e.originalEvent.target as Element | null)?.closest?.("[data-slot=map-marker]")) return
        handleClick([e.lngLat.lng, e.lngLat.lat], instance)
      })

      // A theme change re-paints the basemap in place; the app's own layers stay as they are.
      if (theme) {
        unsubscribe = subscribeTheme(() => {
          if (!root.current || !styleReady) return
          paintBasemap(instance, readPalette(root.current), theme)
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
      map?.remove()
    }
  }, [])

  const slots = mapVariants({ frame, loaded: state.loaded })

  return (
    <MapContext value={state}>
      <div
        ref={root}
        data-slot="map"
        role="region"
        aria-label={label}
        aria-busy={!state.loaded || undefined}
        className={slots.root({ className })}
        {...props}
      >
        <div ref={container} data-slot="map-canvas" className={slots.canvas()} />
        {children}
      </div>
    </MapContext>
  )
}

// ─── MapMarker ──────────────────────────────────────────────────────────────────

export interface MapMarkerProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Where the marker sits, `[longitude, latitude]`. Updating it moves the marker. */
  lngLat: [number, number]
  /** Which point of the content touches the coordinate. @default "center" */
  anchor?: PositionAnchor
  /** Nudge in pixels, `[x, y]`. */
  offset?: [number, number]
  /** Keep the marker upright and flat while the map pitches and rotates. @default true */
  flat?: boolean
  children: React.ReactNode
}

/**
 * Pins any React content to a coordinate: an Avatar, a Badge, a button that opens a Popover. The
 * content stays in your tree (Context, state and events work as usual) and is portalled into the
 * marker MapLibre positions. Renders nothing until the map exists.
 */
export function MapMarker({ lngLat, anchor = "center", offset, flat = true, className, children, ...props }: MapMarkerProps) {
  const { map, lib } = useMap()
  const [element, setElement] = React.useState<HTMLDivElement | null>(null)
  const marker = React.useRef<MapLibreMarker | null>(null)
  const [lng, lat] = lngLat
  // Where a new marker is created; kept current by the effect below, so a marker re-created for a
  // new map lands where the last one was.
  const seedLngLat = React.useRef<LngLatLike>([lng, lat])

  React.useEffect(() => {
    if (!map || !lib) return
    const el = document.createElement("div")
    const m = new lib.Marker({
      element: el,
      className: mapVariants().markerHost(),
      anchor,
      offset,
      pitchAlignment: flat ? "viewport" : "map",
      rotationAlignment: flat ? "viewport" : "map",
    })
      .setLngLat(seedLngLat.current)
      .addTo(map)
    marker.current = m
    // The portal target only exists once MapLibre owns it; one state update hands it to React.
    let live = true
    queueMicrotask(() => live && setElement(el))
    return () => {
      live = false
      m.remove()
      marker.current = null
      setElement(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- anchor/offset/flat are set at creation
  }, [map, lib])

  React.useEffect(() => {
    seedLngLat.current = [lng, lat]
    marker.current?.setLngLat([lng, lat])
  }, [lng, lat])

  if (!element) return null
  const slots = mapVariants()
  return createPortal(
    <div data-slot="map-marker" className={slots.marker({ className })} {...props}>
      {children}
    </div>,
    element,
  )
}

// ─── MapPin ─────────────────────────────────────────────────────────────────────

export interface MapPinProps extends Omit<React.ComponentProps<"button">, "children"> {
  /** The words on the chip. Without one the pin is the dot alone: name it with `aria-label`. */
  label?: React.ReactNode
  /** The dot's colour. @default "brand" */
  tone?: VariantProps<typeof mapVariants>["tone"]
  /**
   * `default` is a chip with the tone as a leading dot (or the dot alone); `price` is the figure
   * alone, bolder, for a map of stays or listings; `emoji` leads with `emoji` in place of the dot
   * (or shows it alone). @default "default"
   */
  variant?: "default" | "price" | "emoji"
  /** The mark the `emoji` variant shows, such as `"☕"`. Decorative: the label or aria-label names the pin. */
  emoji?: string
  /** The chosen pin: the chip inverts to ink. */
  selected?: boolean
  /** A place already looked at: the chip greys to the muted step. */
  visited?: boolean
}

/**
 * The marker visual to put in a MapMarker: a labelled chip, a bare dot, a price or an emoji, in
 * one of the status tones. It renders a `<button>` when it has something to do (an `onClick`, or a
 * Popover trigger wrapping it) and a plain `<span>` when it only marks a place, so a decorative pin
 * never lands in the tab order.
 */
export function MapPin({ label, tone, variant = "default", emoji, selected, visited, className, ...props }: MapPinProps) {
  const interactive = typeof props.onClick === "function"
  const price = variant === "price"
  const labelled = label != null
  // A price is always a chip: it takes the labelled sizing, and the price variant (declared after
  // it) re-pads it for the bolder figure.
  const slots = mapVariants({ tone, variant, labelled: price || labelled, interactive })
  const content = price ? (
    <span data-slot="map-pin-label">{label}</span>
  ) : (
    <>
      {variant === "emoji" ? (
        <span aria-hidden data-slot="map-pin-emoji" className={slots.pinEmoji()}>
          {emoji}
        </span>
      ) : (
        <span aria-hidden data-slot="map-pin-dot" className={slots.pinDot()} />
      )}
      {labelled && <span data-slot="map-pin-label">{label}</span>}
    </>
  )
  const state = { "data-selected": selected || undefined, "data-visited": visited || undefined }
  if (interactive) {
    return (
      <button
        type="button"
        data-slot="map-pin"
        {...state}
        aria-pressed={selected}
        className={slots.pin({ className })}
        {...props}
      >
        {content}
      </button>
    )
  }
  const { "aria-label": ariaLabel } = props
  return (
    <span
      data-slot="map-pin"
      {...state}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={slots.pin({ className })}
    >
      {content}
    </span>
  )
}

// ─── MapCorner ──────────────────────────────────────────────────────────────────

export interface MapCornerProps extends React.ComponentProps<"div"> {
  /** The corner of the map it floats in. @default "top-right" */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

/**
 * Floats your own parts (a legend, a search field, a layer switcher) in one corner of the map,
 * inset like the controls and stacked away from the edge. Only its children take the pointer, so
 * the map stays draggable around them.
 */
export function MapCorner({ position = "top-right", className, ...props }: MapCornerProps) {
  const slots = mapVariants({ position })
  return <div data-slot="map-corner" className={slots.corner({ className })} {...props} />
}

// ─── MapControls ────────────────────────────────────────────────────────────────

export interface MapControlsProps extends Omit<MapCornerProps, "children"> {
  /** Zoom in and out. @default true */
  zoom?: boolean
  /** Turns with the map; resets north and tilt. @default true */
  compass?: boolean
  /** Fly to the visitor's position (asks for permission). @default false */
  locate?: boolean
  /** Where to land after locating. @default 14 */
  locateZoom?: number
  /** Called with the position found, or an error. */
  onLocate?: (result: GeolocationPosition | GeolocationPositionError) => void
}

const subscribeRotate = (map: MapLibreMap | null) => (onChange: () => void) => {
  if (!map) return () => {}
  map.on("rotate", onChange)
  map.on("pitch", onChange)
  return () => {
    map.off("rotate", onChange)
    map.off("pitch", onChange)
  }
}

/**
 * The map's own controls as a floating vertical Toolbar: zoom, a compass that turns with the map,
 * and an optional locate. One gliding tooltip names them, on the side away from the edge.
 */
export function MapControls({
  position = "top-right",
  zoom = true,
  compass = true,
  locate = false,
  locateZoom = 14,
  onLocate,
  className,
  ...props
}: MapControlsProps) {
  const { map } = useMap()
  const subscribe = React.useMemo(() => subscribeRotate(map), [map])
  const bearing = React.useSyncExternalStore(subscribe, () => map?.getBearing() ?? 0, () => 0)
  const tip = position.endsWith("right") ? "left" : "right"

  const locateMe = () => {
    if (!map || !("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: Math.max(map.getZoom(), locateZoom) })
        onLocate?.(pos)
      },
      (error) => onLocate?.(error),
    )
  }

  return (
    <MapCorner position={position} className={className} {...props}>
      <Toolbar data-slot="map-controls" orientation="vertical" aria-label="Map controls">
        {zoom && (
          <>
            <ToolbarButton tooltip="Zoom in" tooltipPlacement={tip} disabled={!map} onClick={() => map?.zoomIn()}>
              <Plus weight="bold" />
            </ToolbarButton>
            <ToolbarButton tooltip="Zoom out" tooltipPlacement={tip} disabled={!map} onClick={() => map?.zoomOut()}>
              <Minus weight="bold" />
            </ToolbarButton>
          </>
        )}
        {zoom && (compass || locate) && <ToolbarSeparator />}
        {compass && (
          <ToolbarButton
            tooltip="Reset north"
            tooltipPlacement={tip}
            disabled={!map}
            onClick={() => map?.easeTo({ bearing: 0, pitch: 0 })}
          >
            {/* The arrow points at north, so it turns against the map. */}
            <NavigationArrow weight="fill" style={{ rotate: `${45 - bearing}deg` }} />
          </ToolbarButton>
        )}
        {locate && (
          <ToolbarButton tooltip="My location" tooltipPlacement={tip} disabled={!map} onClick={locateMe}>
            <Crosshair weight="bold" />
          </ToolbarButton>
        )}
      </Toolbar>
    </MapCorner>
  )
}
