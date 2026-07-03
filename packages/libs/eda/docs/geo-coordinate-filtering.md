# Geographic (latitude/longitude) filtering in the EDA subsetting UI

This document describes the design of the `GeoCoordFilter` component and the
roadmap towards lasso/arbitrary-shape geographic filtering.

## What is implemented today: rectangle selection

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

## Roadmap: lasso / arbitrary-shape filtering

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

This is the recommended first implementation of the lasso. UI sketch:
a lasso mode toggle on the `GeoCoordFilter` map (e.g.
[`leaflet-lasso`](https://github.com/zakjan/leaflet-lasso)), producing a
`stringSet` filter plus a "Geographic area (lasso)" chip. The chip pairing
logic in `FilterChipList` extends naturally (a stringSet filter on a
`geoaggregator`-displayType variable is recognizable from study metadata).

No geometry-to-geohash library is needed for this option: the markers are
already geohash-aggregated by the `map-markers` plugin, so membership is just
a point-in-polygon test against each marker's centroid (e.g.
`@turf/boolean-point-in-polygon`, already a transitive dependency via
`shape2geohash`, see below).

### Option B — multi-scale geohash prefixes (recommended service upgrade; groundwork implemented)

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

The groundwork is implemented behind this document:

- **lib-eda-subsetting ≥ 7.1.0**: `StringPrefixSetFilter` — SQL `LIKE`
  prefix union (with wildcard escaping) plus the equivalent predicate for
  the binary-file streaming path.
- **service-eda**: new `stringPrefixSet` API filter type
  (`API_StringPrefixSetFilter` in the RAML schema) unpacked in
  `ApiConversionUtil`. Fully backwards-compatible: existing clients and
  filter types are untouched.
- **this package**: `StringPrefixSetFilter` added to the `Filter` io-ts
  union in `src/lib/core/types/filter.ts`.

Client-side, the cover can be computed from the lasso polygon with a
recursive descent over geohash cells, down to the current marker aggregation
level (or a fixed budget, e.g. ≤ 256 prefixes), followed by a **collapse**
pass: whenever all 32 children of a coarser prefix are present in the cover,
replace them with that single coarser prefix (repeated bottom-up until no
more collapses apply). This keeps the interior coarse and the boundary fine
without having to special-case "inside" vs. "boundary" cells up front.

[`shape2geohash`](https://www.npmjs.com/package/shape2geohash) (Turf +
`ngeohash` under the hood) already does the per-level geometry work needed
for the descent — it computes the geohashes at a given precision that are
`insideOnly`, `border`-intersecting, or fully `intersect`ing an arbitrary
GeoJSON polygon. It's already a dependency of this monorepo
(`packages/libs/components`, used by `CustomGridLayer` for the map's debug
grid overlay), including the webpack polyfills it needs for its Node
`stream`/`process` usage (see `config-overrides.js`), so there's no new
integration cost. It doesn't do the multi-scale collapse itself — that top
level (recurse into `border` cells, collapse full sets of 32 back up) would
still need to be written — but it replaces the lower-level polygon/geohash
plumbing.

(Earlier drafts of this doc suggested `polygon-to-geohashes` / `geohash-poly`
for this; neither turned out to be real, verifiable packages — `shape2geohash`
is the real, already-integrated equivalent and is preferred.)

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

- The dashed selection rectangle is drawn once in the "main world"; if the
  user pans several worlds east/west the rectangle is not re-centered the
  way markers are (`SemanticMarkers` recentering). Filtering behaviour is
  unaffected.
- Marker counts on the `GeoCoordFilter` map exclude the geo filters
  themselves (by design, matching `HistogramFilter`); a toggle to preview
  the filtered result could be added.
- If a study has multiple geo-enabled entities, each entity's coordinate
  pair gets its own combined chip; pairing is per-entity.
- Latitude `numberRange` + longitude `longitudeRange` filters created by
  the full-screen map's "little filters" (viewport filters) are transient
  and not stored in the analysis, so they do not interact with the chip
  pairing.
