# Geographic (latitude/longitude) filtering in the EDA subsetting UI

This document describes the design of the `GeoCoordFilter` component and
its lasso/arbitrary-shape geographic filtering, together with the design
alternatives that were considered along the way.

## History: rectangle selection (mothballed)

> **Status:** the rectangle interaction described below was replaced by
> lasso selection (see the next section) before this branch was ever
> released; the `numberRange` + `longitudeRange` pair approach and the
> paired-chip machinery were removed again. It is documented here because
> the routing/`GeoConfig` conditions and the marker-request design carry
> over unchanged to the lasso implementation.

When the user selects a **latitude** or **longitude** variable in the
Browse-and-Subset variable tree, `FilterContainer` routes to
[`GeoCoordFilter`](../src/lib/core/components/filter/GeoCoordFilter.tsx)
instead of the histogram (latitude) or "no filter available" (longitude)
views that were shown previously. The routing condition is:

- the variable is annotated with `displayType: 'latitude'` or has
  `type: 'longitude'` (see `isGeoCoordVariable` in
  `src/lib/core/components/filter/guards.ts`), **and**
- the variable's entity has a full `GeoConfig` (exactly one latitude, one
  longitude and at least one `geoaggregator` variable — the same condition
  the maps use, via `useGeoConfig`/`entityToGeoConfig`).

If the entity has coordinate variables but no geo-aggregators, the previous
behaviour is preserved (histogram for latitude, unknown-filter for
longitude), so studies without geohash annotations are unaffected.

`GeoCoordFilter` renders the same semantic-zooming marker map used elsewhere
in EDA (`MapVEuMap` + `SemanticMarkers` + donut markers via the
`useMapMarkers` hook, requested through the `pass` app's `map-markers`
plugin). Marker requests use the analysis' filters _minus_ the two filters
managed by the component, mirroring how `HistogramFilter` shows the
distribution with its own filter excluded and the selection drawn on top.

Holding <kbd>Ctrl</kbd> (or <kbd>⌘</kbd>) and dragging a rectangle
(`AreaSelect`, surfaced through the new `onAreaSelected` prop of
`SemanticMarkers`) creates **two filters in one action**:

- a `numberRange` filter on the latitude variable, and
- a `longitudeRange` filter on the longitude variable.

Both are long-standing subsetting service capabilities — `longitudeRange`
handles ranges crossing the antimeridian (`left > right`) — so rectangle
filtering needs **no service changes**. The current selection is shown as a
dashed rectangle on the map, with a "Clear selection" reset button, and the
map viewport/base-layer are persisted in the analysis' variable UI settings
under a key shared by both variables.

### The combined filter chip

`FilterChipList` detects a latitude `numberRange` + longitude
`longitudeRange` pair on the same entity and renders them as a single
**"Geographic area"** chip whose ✕ removes _both_ filters in one click (via
the new optional `removeFilters` prop, wired in `AnalysisPanel`,
`MapAnalysis`, `SubsettingNotebookCell` and `GlobalFiltersDialog`). Where
`removeFilters` is not supplied, the two filters fall back to individual
chips.

## Implemented: lasso filtering via multi-scale geohash prefixes (Option B)

The lasso UX and Option B below are now implemented:

- **Drawing** uses [`leaflet-lasso`](https://github.com/zakjan/leaflet-lasso)
  (freehand, on-map toolbar button); **editing/dragging/deleting** drawn
  shapes uses [`@geoman-io/leaflet-geoman-free`](https://github.com/geoman-io/leaflet-geoman)
  in opt-in mode (`L.PM.setOptIn(true)`, so data markers are untouched),
  with its draw buttons hidden. Both are wrapped by the controlled
  `GeoShapeSelect` component (`packages/libs/components/src/map/`).
  Freshly drawn lassos are simplified with `L.LineUtil.simplify`
  (8 px tolerance).
- **Multiple shapes union**; there are no donut/subtract semantics (a
  lasso wholly inside another is a no-op by construction).
- **Cover computation** (`polygonsToGeohashPrefixes` in `packages/libs/components/src/map/utils/`, cell
  classification via `@turf/intersect`/`@turf/area` clipped-area ratio):
  budget-driven top-down descent — cells fully inside any shape are kept at
  the level where they are discovered, border cells are refined until a
  **256-prefix budget** or the entity's finest geohash level is reached,
  then kept inclusively; a stop-level collapse guard replaces complete
  32-child blocks with their parent. Longitudes are normalized to ±180
  (dateline-straddling shapes are split) before the descent; shapes are
  stored as drawn.
- **One filter**: a single `stringPrefixSet` filter on the entity's
  finest geohash variable; deleting the last shape removes the filter.
  The shapes themselves are persisted per geo entity in the analysis'
  variable UI settings (`selectedShapes` in `GeoCoordUIState`), and are
  cleared if the filter is removed elsewhere (chip ✕, filters list).
- **Chip**: `FilterChipList` renders a `stringPrefixSet` filter on a
  `geoaggregator`-displayType variable as a single "Geographic area"
  chip, per entity.

Design decisions (library choice, lasso-only UX, resolution limits) are
recorded in `docs/superpowers/specs/2026-07-15-lasso-geo-filtering-design.md`
at the repository root.

The subsetting service combines filters with AND and offers no general OR
of range filters, so an arbitrary shape cannot be decomposed into multiple
lat/long rectangles. The natural filter space is instead the **geohash**
space already used for marker aggregation (`geoaggregator` variables,
`geohash_1` … `geohash_6`). Options, in increasing order of capability:

### Option A — single-level geohash stringSet (works against today's service)

If the user draws a lasso around markers, each marker _is_ a geohash cell at
the aggregation level for the current zoom (`geoConfig.
zoomLevelToAggregationLevel(zoom)`). Collect the `geoAggregateValue` of the
markers inside the polygon (point-in-polygon on marker centers, e.g. with
`@turf/boolean-point-in-polygon`) and create one plain `stringSet` filter on
that single geo-aggregator variable:

```json
{
  "type": "stringSet",
  "entityId": "...",
  "variableId": "geohash_4",
  "stringSet": ["dr5r", "dr5x", "dr72", "..."]
}
```

_Pros:_ no service change; exact w.r.t. what the user sees (markers are
selected, not raw points); the set size equals the number of selected
markers, which is small by construction.
_Cons:_ tied to one zoom level — the filter is only as precise as the
current aggregation level; zooming in after filtering shows the staircase
boundary of the selected cells (arguably a feature, since it makes the
filter semantics visible).

Option A was not pursued: the `stringPrefixSet` service support required by
Option B landed first, so the lasso was implemented directly on Option B
(see the implementation summary above). Option A remains documented as the
fallback design for deployments whose subsetting service predates
`stringPrefixSet`.

No geometry-to-geohash library is needed for this option: the markers are
already geohash-aggregated by the `map-markers` plugin, so membership is just
a point-in-polygon test against each marker's centroid (e.g.
`@turf/boolean-point-in-polygon`, already a transitive dependency via
`shape2geohash`, see below).

### Option B — multi-scale geohash prefixes (implemented)

A shape covering a large area at a fine geohash level explodes into many
cells (32× per extra level). The standard compression is a **multi-scale**
cover: coarse hashes for the interior, finer hashes along the boundary.
Because a geohash is a _prefix_ of every finer geohash it contains, a
multi-scale cover is exactly a **prefix set** over the _finest_ geohash
variable:

```json
{
  "type": "stringPrefixSet",
  "entityId": "...",
  "variableId": "geohash_6",
  "prefixSet": ["dr5", "dr72", "dr70j", "..."]
}
```

`value LIKE 'dr5%' OR value LIKE 'dr72%' OR ...` — a union expressed within
a _single_ filter on a _single_ variable, sidestepping both missing
capabilities (OR of continuous filters; union across different geohash-level
variables). This is strictly more general than the `multiFilter` union,
which is restricted to sub-variables of a `multifilter` display-type parent.

The service-side pieces:

- **lib-eda-subsetting ≥ 7.2.0**: `StringPrefixSetFilter` — SQL `LIKE`
  prefix union (with wildcard escaping) plus the equivalent predicate for
  the binary-file streaming path.
- **service-eda**: new `stringPrefixSet` API filter type
  (`API_StringPrefixSetFilter` in the RAML schema) unpacked in
  `ApiConversionUtil`. Fully backwards-compatible: existing clients and
  filter types are untouched.
- **this package**: `StringPrefixSetFilter` added to the `Filter` io-ts
  union in `src/lib/core/types/filter.ts`.

Client-side, the cover is computed from the lasso polygons
(`polygonsToGeohashPrefixes` in `packages/libs/components`) by a recursive
descent over geohash cells: cells fully inside a shape are kept at the level
where they are discovered, border cells are refined until a fixed budget of
≤ 256 prefixes or the entity's finest geohash level is reached, then kept
inclusively; a stop-level collapse guard replaces complete 32-child blocks
with their parent prefix. This keeps the interior coarse and the boundary
fine.

[`shape2geohash`](https://www.npmjs.com/package/shape2geohash) was evaluated
for the per-level geometry work (it is already a dependency, used by
`CustomGridLayer` for the map's debug grid overlay), but its `intersect`
hash mode is built on `turf.booleanOverlap`, which returns false when one
geometry fully contains the other — so a lasso smaller than a geohash cell
produced no cells at coarse levels, and cells fully inside a large lasso
were dropped. The implementation instead classifies each candidate cell
directly by clipped-area ratio using `@turf/intersect` + `@turf/area`
(cell bounds from `latlon-geohash`); `shape2geohash` remains a dependency
only of the debug grid overlay.

(Earlier drafts of this doc suggested `polygon-to-geohashes` / `geohash-poly`
for this; neither turned out to be real, verifiable packages — `shape2geohash`
was the real, already-integrated equivalent evaluated above.)

### Option C — relax `multiFilter` union validation (alternative service upgrade)

Allow `multiFilter` with `operation: 'union'` whose sub-filters reference
`geoaggregator` display-type variables of the entity (instead of requiring
a `multifilter` parent variable). This reuses existing SQL/streaming UNION
machinery (`streamMultiFilteredEntityIdIndexes`) but is a looser change to
validation semantics and produces one sub-query per geohash level; Option B
achieves the same expressiveness with a single scan of one variable, so B
is preferred.

### Option D — server-side geometry (not recommended for now)

A `geoShape` filter carrying a polygon, evaluated server-side. Without
PostGIS (not installable at present) the SQL path would need a hand-rolled
point-in-polygon over (latitude, longitude) column pairs — but the
subsetting engine's `SingleValueFilter` streams one variable at a time, so
a two-variable predicate requires a new filter architecture (a zip-join of
the latitude and longitude binary files, which the merging machinery could
support, but it is substantially more work). Geohash prefixes (Option B)
give practically the same result with far better performance
characteristics; the only loss is boundary precision, which is bounded by
the finest geohash level (~±0.6 km at level 6) and by the fact that users
draw lassos around _markers_, which are themselves geohash aggregates.

## Known limitations / follow-ups

- Drawn shapes are rendered once in the "main world"; if the user pans
  several worlds east/west the shapes are not re-centered the way markers
  are. Filtering behaviour is unaffected (longitudes are normalized for
  the cover computation).
- Marker counts on the `GeoCoordFilter` map exclude the geo filters
  themselves (by design, matching `HistogramFilter`); a toggle to preview
  the filtered result could be added.
- If a study has multiple geo-enabled entities, each entity's coordinate
  pair gets its own combined chip; pairing is per-entity.
