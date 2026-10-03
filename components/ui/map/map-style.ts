import type { ExpressionSpecification, LayerSpecification, Map as MapLibreMap, StyleSpecification } from "maplibre-gl"

/** A paint property's name, as MapLibre types it. */
type PaintName = Parameters<MapLibreMap["setPaintProperty"]>[1]

/**
 * The Koala basemap: a quiet vector map drawn from OpenFreeMap's OpenMapTiles tiles (no API key)
 * and painted entirely from the `--map-*` tokens (globals.css), which derive from the theme. So the
 * map is light, cream, dark or moonlight with the rest of the page, and its own colour stays out of
 * the way: land and water barely leave the background, roads gain value with their rank, and real
 * colour is left for whatever you put on top.
 *
 * Every layer id starts with `koala-`, so a theme change can re-paint the basemap in place
 * (`paintBasemap`) without touching the layers an app added over it.
 */

/** The basemap's colour roles, one `--map-<role>` token each. */
export const MAP_PALETTE_KEYS = [
  "land",
  "landuse",
  "park",
  "water",
  "building",
  "road",
  "road-major",
  "road-motorway",
  "road-casing",
  "rail",
  "boundary",
  "label",
  "label-strong",
  "label-water",
  "halo",
] as const

export type MapPaletteKey = (typeof MAP_PALETTE_KEYS)[number]
export type MapPalette = Record<MapPaletteKey, string>

const TILES = "https://tiles.openfreemap.org/planet"
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf"
const FONT = ["Noto Sans Regular"]
const FONT_BOLD = ["Noto Sans Bold"]
const FONT_ITALIC = ["Noto Sans Italic"]

/** A line width that doubles every zoom level between two stops, the way streets scale in print. */
const width = (z0: number, w0: number, z1: number, w1: number): ExpressionSpecification => [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  z0,
  w0,
  z1,
  w1,
]

const isLine: ExpressionSpecification = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false]
const isArea: ExpressionSpecification = ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false]
const classIs = (...classes: string[]): ExpressionSpecification => ["match", ["get", "class"], classes, true, false]

const MINOR = ["minor", "service", "track"]
const MAJOR = ["primary", "secondary", "tertiary", "trunk"]
const MOTORWAY = ["motorway"]

export interface BasemapOptions {
  /** Street, water and place names. */
  labels?: boolean
  /** Building footprints from zoom 14. */
  buildings?: boolean
}

function layers(p: MapPalette, { labels = true, buildings = true }: BasemapOptions): LayerSpecification[] {
  const out: LayerSpecification[] = [
    { id: "koala-background", type: "background", paint: { "background-color": p.land } },
    {
      id: "koala-landcover",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["all", isArea, classIs("wood", "grass", "farmland")],
      paint: { "fill-color": p.park, "fill-opacity": 0.6 },
    },
    {
      id: "koala-landuse",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landuse",
      minzoom: 10,
      filter: ["all", isArea, classIs("residential", "commercial", "industrial", "retail", "railway", "hospital", "school", "university", "stadium")],
      paint: { "fill-color": p.landuse },
    },
    {
      id: "koala-park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      filter: isArea,
      paint: { "fill-color": p.park },
    },
    {
      id: "koala-water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      filter: ["all", isArea, ["!=", ["get", "brunnel"], "tunnel"]],
      paint: { "fill-color": p.water },
    },
    {
      id: "koala-waterway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "waterway",
      filter: isLine,
      paint: { "line-color": p.water, "line-width": width(8, 0.5, 18, 6) },
    },
    {
      id: "koala-aeroway",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "aeroway",
      minzoom: 11,
      filter: isArea,
      paint: { "fill-color": p.landuse },
    },
  ]

  if (buildings) {
    out.push({
      id: "koala-building",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-color": p.building,
        "fill-outline-color": p["road-casing"],
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 1],
      },
    })
  }

  // Roads: casings first (under every fill), then the fills from minor to motorway, so a junction
  // reads as one surface instead of crossing strokes.
  out.push(
    {
      id: "koala-road-major-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 9,
      filter: ["all", isLine, classIs(...MAJOR, ...MOTORWAY)],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": p["road-casing"], "line-width": width(9, 1, 18, 26) },
    },
    {
      id: "koala-path",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 14,
      filter: ["all", isLine, classIs("path")],
      paint: { "line-color": p.road, "line-width": width(14, 0.5, 18, 2), "line-dasharray": [2, 1.5] },
    },
    {
      id: "koala-road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["all", isLine, classIs(...MINOR)],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": p.road, "line-width": width(12, 0.5, 18, 14) },
    },
    {
      id: "koala-road-major",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 8,
      filter: ["all", isLine, classIs(...MAJOR)],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": p["road-major"], "line-width": width(8, 0.6, 18, 22) },
    },
    {
      id: "koala-road-motorway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 5,
      filter: ["all", isLine, classIs(...MOTORWAY)],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": p["road-motorway"], "line-width": width(5, 0.6, 18, 24) },
    },
    {
      id: "koala-rail",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      minzoom: 11,
      filter: ["all", isLine, classIs("rail", "transit")],
      paint: { "line-color": p.rail, "line-width": width(11, 0.6, 18, 2.5), "line-dasharray": [3, 2] },
    },
    {
      id: "koala-boundary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "boundary",
      filter: ["all", ["<=", ["get", "admin_level"], 4], ["!=", ["get", "maritime"], 1]],
      paint: { "line-color": p.boundary, "line-width": width(3, 0.6, 12, 1.6), "line-dasharray": [4, 2] },
    },
  )

  if (labels) {
    const text = (color: string) => ({ "text-color": color, "text-halo-color": p.halo, "text-halo-width": 1.4 })
    out.push(
      // Water names: points for bays and lakes, along the line for rivers. Placement can't be
      // data-driven, so they are two layers.
      {
        id: "koala-label-water",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        filter: ["!", isLine],
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": FONT_ITALIC,
          "text-size": 13,
          "text-max-width": 7,
        },
        paint: text(p["label-water"]),
      },
      {
        id: "koala-label-waterway",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        filter: isLine,
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": FONT_ITALIC,
          "text-size": 13,
          "symbol-placement": "line",
        },
        paint: text(p["label-water"]),
      },
      {
        id: "koala-label-road",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 13,
        filter: classIs(...MINOR, ...MAJOR, ...MOTORWAY),
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 10, 18, 13],
          "symbol-placement": "line",
          "text-max-angle": 30,
        },
        paint: text(p.label),
      },
      {
        id: "koala-label-neighbourhood",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 12,
        filter: classIs("borough", "suburb", "quarter", "neighbourhood"),
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 13],
          "text-transform": "uppercase",
          "text-letter-spacing": 0.08,
          "text-max-width": 8,
        },
        paint: text(p.label),
      },
      {
        id: "koala-label-place",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: classIs("city", "town", "village"),
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 12, 14],
          "text-max-width": 8,
        },
        paint: text(p["label-strong"]),
      },
    )
  }
  return out
}

/** The whole basemap style for a resolved palette. */
export function basemapStyle(palette: MapPalette, options: BasemapOptions = {}): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: { openmaptiles: { type: "vector", url: TILES } },
    layers: layers(palette, options),
  }
}

/** Re-paints an existing basemap in place (a theme change), leaving every other layer alone. */
export function paintBasemap(
  map: Pick<MapLibreMap, "getLayer" | "setPaintProperty">,
  palette: MapPalette,
  options: BasemapOptions = {},
) {
  for (const layer of layers(palette, options)) {
    if (!map.getLayer(layer.id) || !("paint" in layer) || !layer.paint) continue
    for (const [name, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, name as PaintName, value)
  }
}

/**
 * Resolves any CSS colour (a token like `var(--brand)`, `oklch()`, `color-mix()`) as seen from an
 * element into an `rgb()` string MapLibre can parse; it reads neither `oklch()` nor
 * `color-mix()`. A probe takes the colour, and a one-pixel canvas turns whatever the browser
 * computed into bytes. For painting your own layers in the theme's colours.
 */
export function readColor(el: Element, color: string): string {
  return readColors(el, [color])[0]
}

function readColors(el: Element, colors: string[]): string[] {
  const probe = document.createElement("span")
  probe.style.display = "none"
  el.appendChild(probe)
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  const out = colors.map((color) => {
    probe.style.color = color
    const css = getComputedStyle(probe).color
    if (!ctx) return css
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = "black"
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
  })
  probe.remove()
  return out
}

/** The `--map-*` tokens on an element, resolved for MapLibre. */
export function readPalette(el: Element): MapPalette {
  const colors = readColors(el, MAP_PALETTE_KEYS.map((key) => `var(--map-${key})`))
  return Object.fromEntries(MAP_PALETTE_KEYS.map((key, i) => [key, colors[i]])) as MapPalette
}
