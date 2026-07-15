# Lasso-based geographic filtering (stringPrefixSet) — design

Date: 2026-07-15
Status: approved design, pre-implementation
Branch: `claude/eda-geo-coordinate-filter-iqnoc8`
Background: `packages/libs/eda/docs/geo-coordinate-filtering.md` (Option B)

## Summary

Replace the ctrl+drag rectangle selection in `GeoCoordFilter` with
freehand **lasso** selection producing a single **`stringPrefixSet`**
filter on the entity's finest geohash variable (multi-scale geohash
prefix cover, Option B of the background doc). Users can draw multiple
lassos (union semantics), and edit, drag or delete drawn shapes.

The subsetting service side is already deployed to the dev environment
(lib-eda-subsetting ≥ 7.1.0 / service-eda `stringPrefixSet`), and the
`StringPrefixSetFilter` io-ts type is already in this package's `Filter`
union (`src/lib/core/types/filter.ts`).

## Decisions made during brainstorming

1. **Libraries**: `leaflet-lasso` (freehand capture; maintained, MIT,
   Leaflet 1.9-compatible) **plus** `@geoman-io/leaflet-geoman-free`
   (vertex editing / shape drag / delete; freehand mode is Pro-only, so
   drawing stays with leaflet-lasso). Both integrate as plain Leaflet
   plugins via `useMap()`, like the existing `AreaSelect`.
2. **Lasso-only**: the rectangle interaction and its
   `numberRange` + `longitudeRange` filter pair are **mothballed**
   (Zillow/Redfin/Zoopla precedent: one freehand tool covers both jobs).
   No backwards compatibility needed — the rectangle only ever existed
   on this unmerged branch.
3. **Controls**: on-map Leaflet toolbar (top-left, under zoom):
   leaflet-lasso's control button + Geoman's edit/drag/delete toolbar
   buttons. Lasso mode auto-exits after each drawn shape. Geoman's own
   draw buttons are disabled.
4. **Multiple shapes**: yes — all shapes union into one prefix cover.
   No donut/subtract semantics: a lasso wholly inside another is a
   no-op by construction.
5. **Resolution**: budget-driven adaptive descent, **≤ 256 prefixes**,
   max depth = the entity's finest geohash level (typically 6),
   independent of the current zoom level.

## Architecture

### New dependencies

In `packages/libs/components` (which owns the map stack and already
depends on `shape2geohash` 1.2.6 / `ngeohash` / turf modules):

- `leaflet-lasso`
- `@geoman-io/leaflet-geoman-free`
- `@turf/simplify` (if not already present transitively)

### New component: `GeoShapeSelect` (packages/libs/components)

`src/map/GeoShapeSelect.tsx` — headless controlled component used
inside `MapVEuMap`:

- Props: `shapes: LatLngPolygon[]` (array of `[lat, lng][]`),
  `onShapesChanged(shapes: LatLngPolygon[]): void`.
- Adds the leaflet-lasso control; on `lasso.finished`, simplifies the
  drawn polygon with `@turf/simplify` (tolerance tuned for ~15–30
  vertices), auto-exits lasso mode, appends the shape via
  `onShapesChanged`.
- Renders `shapes` as Leaflet polygons registered with Geoman for
  edit-vertices / drag / delete. Changes are committed on Geoman's
  completion events (`pm:update`, `pm:remove`, …), not per-vertex-drag,
  so the service is not hammered mid-edit.
- `AreaSelect` and `SemanticMarkers`' `onAreaSelected` prop are left in
  place for other consumers; `GeoCoordFilter` simply stops using them.

### New utility: `polygonsToGeohashPrefixes` (packages/libs/components)

Pure function `polygonsToGeohashPrefixes(shapes, maxLevel, budget = 256): string[]`.

Algorithm — all shapes of the entity converted together into one cover:

1. Level-by-level descent from geohash level 1. Classify each candidate
   cell: **fully inside** any shape → keep at this level; **border**
   (partial overlap) → refine into its 32 children at the next level;
   **outside** → drop.
2. Stop refining when `kept + frontier` would exceed `budget`, or when
   `maxLevel` is reached. Remaining border cells are kept
   **inclusively** (partial overlap ⇒ included — err on not dropping
   data the user circled).
3. Bottom-up **collapse**: whenever all 32 children of a prefix are
   present, replace them with the parent (repeat until stable).

Geometry tests via turf against `ngeohash.decode_bbox` cell rectangles,
or shape2geohash's per-level `insideOnly`/`border` modes —
implementation choice deferred to the planning phase.

`maxLevel` comes from `geoConfig.aggregationVariableIds.length`.

### GeoCoordFilter changes (packages/libs/eda)

- **Remove** (mothball) the rectangle path: `onAreaSelected` wiring,
  `normalizeLongitudeRange`, the dashed `Rectangle`, and creation of
  `numberRange`/`longitudeRange` filters.
- **Add** `GeoShapeSelect`; on any shape change, recompute the prefix
  cover and **replace** the single `stringPrefixSet` filter on the
  entity's finest geohash variable; deleting the last shape removes the
  filter entirely (an empty-prefixSet filter is never sent).
- Header row: lasso instructions when nothing is selected; otherwise a
  summary ("N areas selected; X of Y <entities> remain in the subset")
  plus the existing "Clear selection" reset button, which clears shapes
  and filter together.
- Marker requests continue to exclude this component's own filter
  (now the one `stringPrefixSet` filter), mirroring `HistogramFilter`.

### Persistence (uiSettings)

Shapes are needed to re-render and re-edit; the filter carries only
prefixes. Shapes are persisted in the existing per-coordinate-pair
`uiSettings` entry (in `analysis.descriptor.subset.uiSettings`), keyed:

```
`${entity.id}/${latitudeVariableId}/${longitudeVariableId}`
```

Because a `GeoConfig` has exactly one latitude and one longitude
variable per geo entity, this is effectively one entry **per geo
entity**; studies with multiple geo entities get independent entries.
Selecting either variable of the pair routes to the same entry, so the
viewport and shapes look identical from both.

`GeoCoordUIState` codec — new optional field so existing saved settings
still decode:

```ts
export const GeoCoordUIState = t.intersection([
  t.type({ mapCenterAndZoom: ... }),
  t.partial({
    baseLayer: t.keyof(baseLayers),
    selectedShapes: t.array(t.array(t.tuple([t.number, t.number]))), // polygons of [lat, lng]
  }),
]);
```

Plain `[lat, lng]` tuples, not GeoJSON — `uiSettings` is serialized
into the analysis descriptor and saved to the backend; an entry is
~1–2 KB at 15–30 vertices per shape.

Per-entity independence: each `GeoCoordFilter` instance reads/writes
only its own key; the derived filter targets that entity's finest
geohash variable; the chip and "Clear selection" act per entity.
Filtering several geo entities simultaneously is ordinary
AND-across-entities subsetting. (`updateUIState` spreads only the
current entity's entry and `setVariableUISettings` merges at the top
level, so entries coexist safely — no change needed.)

**Sync rule**: the filter is the source of truth for subsetting. On
mount, if the entity's `stringPrefixSet` filter is absent but its
`selectedShapes` is non-empty (filter removed via chip ✕ or filter
list), clear that entry's shapes rather than resurrecting the
selection.

### Filter chip (packages/libs/eda)

Replace the rectangle pair-detection in `FilterChipList`: a
`stringPrefixSet` filter on a variable with `geoaggregator` displayType
renders as a single **"Geographic area"** chip (per entity); its ✕
removes that one filter. The two-filter `removeFilters` machinery is no
longer needed for this feature (whether to revert it is a planning
detail).

## Edge cases

- **Antimeridian & world copies**: lassos drawn in panned world copies
  can have |longitude| > 180, and a lasso can straddle the dateline.
  Shapes are _stored as drawn_ (so they re-render where drawn) but
  **normalized for cover computation**: longitudes brought into ±180
  and dateline-straddling shapes split into two polygons at ±180
  (geohash cells never cross the dateline, so the cover of the two
  halves is exact). As with the old rectangle, a shape drawn in the
  main world does not visually re-appear when the user pans a whole
  world east/west; filtering is unaffected.
- **Tiny lasso**: always yields ≥ 1 level-`maxLevel` cell — never an
  empty `prefixSet`. It may match zero entities; the count display
  makes that visible.
- **Self-intersecting scribbles**: `@turf/simplify` + leaflet-lasso's
  polygon are generally fine; if geometry classification fails on a
  bowtie polygon, fall back to that shape's bounding box (defensive).
- **Last shape deleted**: filter removed entirely.

## Testing

- Unit tests for `polygonsToGeohashPrefixes`: hand-checkable covers for
  simple polygons; budget respected; collapse correctness (32 children
  ⇒ parent); multi-shape union; dateline-straddling shape; tiny shape ⇒
  non-empty cover.
- Unit test: `GeoCoordUIState` codec round-trip with and without
  `selectedShapes`.
- Manual verification against the local dev service (already running
  `stringPrefixSet`): draw lasso → `stringPrefixSet` request observed,
  counts change, chip appears and ✕ removes it; edit/drag/delete
  shapes; independence of a second geo entity; reloading the analysis
  restores shapes.

## Documentation

Update `packages/libs/eda/docs/geo-coordinate-filtering.md` as part of
implementation: rectangle selection section becomes historical/mothballed,
Option B moves from "roadmap" to "implemented", with a description of the
shipped UX and the cover algorithm.

## Out of scope

- Donut/subtract selections.
- Re-rendering shapes in panned world copies.
- A toggle to preview markers with the geo filter applied (existing
  known limitation, unchanged).
- Reverting the now-unneeded `removeFilters` chip machinery (decided at
  planning time).
