# Lasso Geographic Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ctrl+drag rectangle in `GeoCoordFilter` with freehand lasso selection (multiple, editable shapes) producing one `stringPrefixSet` filter (multi-scale geohash prefix cover) on the entity's finest geohash variable.

**Architecture:** A pure cover utility (`polygonsToGeohashPrefixes`) and a headless map component (`GeoShapeSelect`, leaflet-lasso for drawing + leaflet-geoman-free for editing) live in `packages/libs/components`; `packages/libs/eda`'s `GeoCoordFilter` persists shapes in per-geo-entity `uiSettings` and derives the filter; `FilterChipList` renders the filter as a single "Geographic area" chip.

**Tech Stack:** TypeScript, React 17 + react-leaflet 3, Leaflet 1.9, leaflet-lasso, @geoman-io/leaflet-geoman-free, shape2geohash (already a dep of components), latlon-geohash (already a dep), io-ts, Jest via `veupathdb-react-scripts test`.

**Spec:** `docs/superpowers/specs/2026-07-15-lasso-geo-filtering-design.md`

## Global Constraints

- Prefix budget: **≤ 256** prefixes per filter (`DEFAULT_PREFIX_BUDGET = 256`).
- Max descent depth = `geoConfig.aggregationVariableIds.length` (the finest geohash level, typically 6).
- Filter type literal: `stringPrefixSet`; field `prefixSet: string[]`; targets the **last** element of `geoConfig.aggregationVariableIds`. Requires lib-eda-subsetting ≥ 7.2.0 (already on the dev service).
- Border cells are kept **inclusively** (partial overlap ⇒ included).
- Never emit an empty `prefixSet`; deleting the last shape removes the filter.
- Shapes are stored as drawn (`[lat, lng]` tuples) in `uiSettings`; longitudes are normalized to ±180 (with dateline splitting) only for cover computation.
- New chip copy: **"Geographic area"**. Header summary copy: `Selected area: N shape(s) drawn. X of Y <entities> remain in the subset.`
- Geoman must run in **opt-in mode** (`L.PM.setOptIn(true)`) so edit/drag/removal modes cannot touch the data markers.
- Deviation from spec (agreed at planning): lasso simplification uses Leaflet's built-in `L.LineUtil.simplify` (screen-space pixel tolerance, default 8 px) instead of `@turf/simplify`, which is not installed anywhere in the monorepo.
- Monorepo build checks: `yarn workspace @veupathdb/components build-npm-modules` and `yarn workspace @veupathdb/eda build-npm-modules`.
- All git commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Longitude normalization helper (+ components test harness)

`packages/libs/components` has Jest tests (`src/map/animation_functions/geohash.test.tsx`) but **no `test` script**. Add one, validate it on the existing tests, then TDD the normalization helper.

**Files:**

- Modify: `packages/libs/components/package.json` (scripts block, ~line 56)
- Create: `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.ts`
- Test: `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.test.ts`

**Interfaces:**

- Consumes: nothing new.
- Produces: `export type LatLngShape = [number, number][]` ([lat, lng] vertices, unclosed); `export function normalizeShapeLongitudes(shape: LatLngShape): [number, number][][]` returning closed GeoJSON-order (`[lng, lat]`) rings within ±180.

- [ ] **Step 1: Add a test script to packages/libs/components**

In `packages/libs/components/package.json`, add to `"scripts"` (after `"build-npm-modules"`):

```json
"test": "veupathdb-react-scripts test",
```

- [ ] **Step 2: Validate the harness on the existing tests**

Run: `yarn workspace @veupathdb/components test --watchAll=false`
Expected: the two existing suites under `src/map/animation_functions/` run (pass or pre-existing failures are fine — the point is that Jest boots and transforms TSX). If Jest fails to boot for infrastructure reasons, STOP and report back before proceeding (fallback discussed at review: host the utility's tests in `packages/libs/eda` instead).

- [ ] **Step 3: Write the failing tests for `normalizeShapeLongitudes`**

Create `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.test.ts`:

```ts
import {
  normalizeShapeLongitudes,
  LatLngShape,
} from './polygonsToGeohashPrefixes';

describe('normalizeShapeLongitudes', () => {
  test('in-range shape converts to a single closed [lng, lat] ring', () => {
    const shape: LatLngShape = [
      [52.5, 13.0],
      [52.5, 13.3],
      [52.2, 13.3],
    ];
    const rings = normalizeShapeLongitudes(shape);
    expect(rings).toEqual([
      [
        [13.0, 52.5],
        [13.3, 52.5],
        [13.3, 52.2],
        [13.0, 52.5], // closed
      ],
    ]);
  });

  test('world-copy shape is shifted into range', () => {
    // longitudes use binary-exact fractions (.0/.5/.25) so that the
    // ±360 shift is exact and toEqual comparison is safe
    const shape: LatLngShape = [
      [52.5, 13.0 + 360],
      [52.5, 13.5 + 360],
      [52.25, 13.5 + 360],
    ];
    expect(normalizeShapeLongitudes(shape)).toEqual(
      normalizeShapeLongitudes([
        [52.5, 13.0],
        [52.5, 13.5],
        [52.25, 13.5],
      ])
    );
  });

  test('dateline-straddling shape splits into two rings within ±180', () => {
    const shape: LatLngShape = [
      [0, 175],
      [0, 185],
      [10, 185],
      [10, 175],
    ];
    const rings = normalizeShapeLongitudes(shape);
    expect(rings).toHaveLength(2);
    for (const ring of rings) {
      // closed
      expect(ring[0]).toEqual(ring[ring.length - 1]);
      // within ±180
      for (const [lng] of ring) {
        expect(lng).toBeGreaterThanOrEqual(-180);
        expect(lng).toBeLessThanOrEqual(180);
      }
    }
    const allLngs = rings.flat().map(([lng]) => lng);
    expect(allLngs.some((lng) => lng >= 175)).toBe(true); // west piece
    expect(allLngs.some((lng) => lng <= -175)).toBe(true); // east piece
  });

  test('degenerate shapes yield no rings', () => {
    expect(normalizeShapeLongitudes([])).toEqual([]);
    expect(
      normalizeShapeLongitudes([
        [0, 0],
        [1, 1],
      ])
    ).toEqual([]);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `yarn workspace @veupathdb/components test --watchAll=false polygonsToGeohashPrefixes`
Expected: FAIL — module `./polygonsToGeohashPrefixes` not found.

- [ ] **Step 5: Implement `normalizeShapeLongitudes`**

Create `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.ts`:

```ts
/*
 * Conversion of lasso-drawn polygons to multi-scale geohash prefix covers,
 * for use with the EDA subsetting service's stringPrefixSet filter.
 * See packages/libs/eda/docs/geo-coordinate-filtering.md (Option B).
 */

/** A drawn shape: [lat, lng] vertices, not necessarily closed. */
export type LatLngShape = [number, number][];

/** A closed GeoJSON-order ring: [lng, lat] vertices, first === last. */
type LngLatRing = [number, number][];

/**
 * Bring a drawn shape's longitudes into ±180 for cover computation:
 * shift whole world-copies back, then split any dateline-straddling
 * shape into two rings at ±180 (geohash cells never cross the dateline,
 * so covering the two halves separately is exact). Returns closed
 * GeoJSON-order ([lng, lat]) rings; degenerate pieces are dropped.
 */
export function normalizeShapeLongitudes(shape: LatLngShape): LngLatRing[] {
  if (shape.length < 3) return [];
  const meanLng = shape.reduce((sum, [, lng]) => sum + lng, 0) / shape.length;
  const offset = 360 * Math.round(meanLng / 360);
  const ring: LngLatRing = shape.map(([lat, lng]) => [lng - offset, lat]);
  const pieces: LngLatRing[] = [
    // part hanging off the west edge, wrapped east
    clipRingToLngRange(ring, -540, -180).map(([lng, lat]): [number, number] => [
      lng + 360,
      lat,
    ]),
    clipRingToLngRange(ring, -180, 180),
    // part hanging off the east edge, wrapped west
    clipRingToLngRange(ring, 180, 540).map(([lng, lat]): [number, number] => [
      lng - 360,
      lat,
    ]),
  ];
  return pieces.filter((piece) => piece.length >= 3).map(closeRing);
}

/** Sutherland–Hodgman clip of a ring to the vertical band min ≤ lng ≤ max. */
function clipRingToLngRange(
  ring: LngLatRing,
  min: number,
  max: number
): LngLatRing {
  const clippedWest = clipHalfPlane(
    ring,
    (p) => p[0] >= min,
    (a, b) => intersectAtLng(a, b, min)
  );
  return clipHalfPlane(
    clippedWest,
    (p) => p[0] <= max,
    (a, b) => intersectAtLng(a, b, max)
  );
}

function clipHalfPlane(
  points: LngLatRing,
  isInside: (p: [number, number]) => boolean,
  intersection: (a: [number, number], b: [number, number]) => [number, number]
): LngLatRing {
  const output: LngLatRing = [];
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const previous = points[(i + points.length - 1) % points.length];
    if (isInside(current)) {
      if (!isInside(previous)) output.push(intersection(previous, current));
      output.push(current);
    } else if (isInside(previous)) {
      output.push(intersection(previous, current));
    }
  }
  return output;
}

function intersectAtLng(
  a: [number, number],
  b: [number, number],
  lng: number
): [number, number] {
  const t = (lng - a[0]) / (b[0] - a[0]);
  return [lng, a[1] + t * (b[1] - a[1])];
}

function closeRing(ring: LngLatRing): LngLatRing {
  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];
  return firstLng === lastLng && firstLat === lastLat
    ? ring
    : [...ring, [firstLng, firstLat]];
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `yarn workspace @veupathdb/components test --watchAll=false polygonsToGeohashPrefixes`
Expected: PASS (4 tests).

Note for the first test's expectation: the input triangle is already in range so `offset` is 0 and the ring passes through both clips unchanged except for closing. If vertex order comes back rotated, adjust the expectation to compare as sets of vertices plus closure — but with this implementation clipping a fully-inside ring preserves order starting from index 0, so the literal expectation should hold.

- [ ] **Step 7: Commit**

```bash
git add packages/libs/components/package.json packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.ts packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.test.ts
git commit -m "add normalizeShapeLongitudes + components test script"
```

---

### Task 2: `polygonsToGeohashPrefixes` cover function

Budget-driven top-down descent using `shape2geohash` per level, inclusive border keeping, stop-level collapse guard, degenerate-shape fallbacks.

**Files:**

- Modify: `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.ts`
- Test: `packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.test.ts`

**Interfaces:**

- Consumes: `normalizeShapeLongitudes`, `LatLngShape` (Task 1); `shape2geohash` (existing dep, CommonJS `require`, promise API, GeoJSON `[lng, lat]`, options `{ precision, hashMode: 'intersect' | 'insideOnly', allowDuplicates }`); `latlon-geohash` (existing dep) for the vertex fallback and in tests.
- Produces: `export const DEFAULT_PREFIX_BUDGET = 256`; `export async function polygonsToGeohashPrefixes(shapes: LatLngShape[], maxLevel: number, budget?: number): Promise<string[]>` — sorted, deduplicated prefixes, `[]` only for empty/degenerate input. Also `export function collapseCompleteBlocks(cover: string[]): string[]` (exported for testing).

- [ ] **Step 1: Write the failing tests**

Append to `polygonsToGeohashPrefixes.test.ts` (merge the `import` statements into the import block at the top of the file; only the `describe` blocks and `insetBoxShape` go below the existing tests):

```ts
import Geohash from 'latlon-geohash';
import {
  polygonsToGeohashPrefixes,
  collapseCompleteBlocks,
} from './polygonsToGeohashPrefixes';

/** an axis-aligned box just inside the given geohash cell */
function insetBoxShape(hash: string, insetFraction = 0.02): LatLngShape {
  const bounds = Geohash.bounds(hash);
  const dLat = (bounds.ne.lat - bounds.sw.lat) * insetFraction;
  const dLon = (bounds.ne.lon - bounds.sw.lon) * insetFraction;
  return [
    [bounds.sw.lat + dLat, bounds.sw.lon + dLon],
    [bounds.sw.lat + dLat, bounds.ne.lon - dLon],
    [bounds.ne.lat - dLat, bounds.ne.lon - dLon],
    [bounds.ne.lat - dLat, bounds.sw.lon + dLon],
  ];
}

describe('collapseCompleteBlocks', () => {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  test('a complete block of 32 children collapses to the parent', () => {
    const children = [...BASE32].map((c) => 'u336' + c);
    expect(collapseCompleteBlocks(children)).toEqual(['u336']);
  });

  test('an incomplete block is left alone', () => {
    const children = [...BASE32].slice(1).map((c) => 'u336' + c);
    expect(collapseCompleteBlocks(children)).toEqual(children.sort());
  });
});

describe('polygonsToGeohashPrefixes', () => {
  test('box inset inside one cell collapses to exactly that cell', async () => {
    const prefixes = await polygonsToGeohashPrefixes(
      [insetBoxShape('u336')],
      5
    );
    expect(prefixes).toEqual(['u336']);
  });

  test('two disjoint lassos union into one cover', async () => {
    const prefixes = await polygonsToGeohashPrefixes(
      [insetBoxShape('u336'), insetBoxShape('gbsu')],
      5
    );
    expect(prefixes).toEqual(['gbsu', 'u336']);
  });

  test('a shape wholly inside another adds nothing (donut no-op)', async () => {
    const outer = insetBoxShape('u336', 0.02);
    const inner = insetBoxShape('u336', 0.3);
    expect(await polygonsToGeohashPrefixes([outer, inner], 5)).toEqual(
      await polygonsToGeohashPrefixes([outer], 5)
    );
  });

  test('large shape respects the budget with a multi-scale cover', async () => {
    const europeish: LatLngShape = [
      [35, -10],
      [35, 30],
      [60, 30],
      [60, -10],
    ];
    const prefixes = await polygonsToGeohashPrefixes([europeish], 6);
    expect(prefixes.length).toBeGreaterThan(0);
    expect(prefixes.length).toBeLessThanOrEqual(256);
    const lengths = prefixes.map((p) => p.length);
    expect(Math.max(...lengths)).toBeLessThanOrEqual(6);
    expect(Math.min(...lengths)).toBeLessThanOrEqual(3); // coarse interior
  });

  test('tiny lasso produces a small non-empty finest-level cover', async () => {
    const tiny: LatLngShape = [
      [52.5, 13.0],
      [52.5001, 13.0001],
      [52.5, 13.0002],
    ];
    const prefixes = await polygonsToGeohashPrefixes([tiny], 6);
    expect(prefixes.length).toBeGreaterThan(0);
    for (const p of prefixes) expect(p.length).toBe(6);
  });

  test('dateline-straddling shape covers both sides within ±180', async () => {
    const straddling: LatLngShape = [
      [0, 175],
      [0, 185],
      [5, 185],
      [5, 175],
    ];
    const prefixes = await polygonsToGeohashPrefixes([straddling], 3);
    expect(prefixes.length).toBeGreaterThan(0);
    const lons = prefixes.map((p) => Geohash.decode(p).lon);
    expect(lons.some((lon) => lon > 170)).toBe(true);
    expect(lons.some((lon) => lon < -170)).toBe(true);
  });

  test('empty input yields an empty cover', async () => {
    expect(await polygonsToGeohashPrefixes([], 6)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `yarn workspace @veupathdb/components test --watchAll=false polygonsToGeohashPrefixes`
Expected: FAIL — `polygonsToGeohashPrefixes` / `collapseCompleteBlocks` not exported. (Task 1's tests still pass.)

- [ ] **Step 3: Implement the cover function**

Add to `polygonsToGeohashPrefixes.ts` (below the existing code; `Geohash` import goes at the top of the file):

```ts
import Geohash from 'latlon-geohash';

// no @types for shape2geohash — same require-style import as CustomGridLayer
const shape2geohash = require('shape2geohash');

export const DEFAULT_PREFIX_BUDGET = 256;

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

type GeoJsonMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: [number, number][][][];
};

/**
 * Convert lasso-drawn shapes into a multi-scale geohash prefix cover:
 * coarse prefixes for the interior, finer ones along the boundary,
 * at most `budget` prefixes, none longer than `maxLevel`. Border cells
 * are kept inclusively (partial overlap ⇒ included). Returns a sorted,
 * deduplicated list; empty only for empty/degenerate input.
 */
export async function polygonsToGeohashPrefixes(
  shapes: LatLngShape[],
  maxLevel: number,
  budget: number = DEFAULT_PREFIX_BUDGET
): Promise<string[]> {
  const rings = shapes.flatMap(normalizeShapeLongitudes);
  if (rings.length === 0) return [];
  const multiPolygon: GeoJsonMultiPolygon = {
    type: 'MultiPolygon',
    coordinates: rings.map((ring) => [ring]),
  };

  let cover: string[];
  try {
    cover = await descend(multiPolygon, maxLevel, budget);
  } catch (error) {
    // defensive fallback for geometry the underlying library chokes on
    // (e.g. self-intersecting "bowtie" scribbles): use bounding boxes
    console.warn(
      'polygonsToGeohashPrefixes: falling back to bounding boxes',
      error
    );
    cover = await descend(
      {
        type: 'MultiPolygon',
        coordinates: rings.map((ring) => [ringToBboxRing(ring)]),
      },
      maxLevel,
      budget
    );
  }
  if (cover.length > 0) return cover;
  // degenerate (e.g. zero-area) shapes: cover the vertices themselves
  return fallbackVertexCover(rings, maxLevel);
}

/**
 * Budget-driven top-down descent. Cells fully inside the shape are kept
 * at the level where they are discovered; border cells are refined until
 * the budget or maxLevel is reached, then kept inclusively. The collapse
 * guard runs on the final cover (in practice it only fires at the stop
 * level — see the design spec).
 */
async function descend(
  multiPolygon: GeoJsonMultiPolygon,
  maxLevel: number,
  budget: number
): Promise<string[]> {
  const hashesAt = async (
    precision: number,
    hashMode: 'intersect' | 'insideOnly'
  ): Promise<string[]> =>
    shape2geohash(multiPolygon, {
      precision,
      hashMode,
      allowDuplicates: false,
    });

  let kept: string[] = [];
  let frontier: string[] = []; // border cells at the current level
  for (let level = 1; level <= maxLevel; level++) {
    const inside = new Set(await hashesAt(level, 'insideOnly'));
    const intersecting = await hashesAt(level, 'intersect');
    const parents = new Set(frontier);
    // restrict to descendants of the previous level's border cells
    const candidates =
      level === 1
        ? intersecting
        : intersecting.filter((hash) => parents.has(hash.slice(0, -1)));
    const newKept = candidates.filter((hash) => inside.has(hash));
    const newFrontier = candidates.filter((hash) => !inside.has(hash));
    if (
      level > 1 &&
      kept.length + newKept.length + newFrontier.length > budget
    ) {
      // refining would blow the budget: keep the previous level's
      // border cells inclusively instead
      return dedupeSort(kept.concat(frontier));
    }
    kept = kept.concat(newKept);
    frontier = newFrontier;
    if (frontier.length === 0) return dedupeSort(kept);
  }
  // reached maxLevel: keep the remaining border cells inclusively
  return collapseCompleteBlocks(kept.concat(frontier));
}

/**
 * Collapse guard: whenever all 32 children of a prefix are present,
 * replace them with the parent — semantically identical as a prefix
 * filter, and up to 31 entries shorter. Loops until stable (multi-level
 * cascades are pathological but the loop costs nothing at ≤ budget size).
 */
export function collapseCompleteBlocks(cover: string[]): string[] {
  const set = new Set(cover);
  let changed = true;
  while (changed) {
    changed = false;
    const childCounts = new Map<string, number>();
    for (const hash of set) {
      if (hash.length < 2) continue;
      const parent = hash.slice(0, -1);
      childCounts.set(parent, (childCounts.get(parent) ?? 0) + 1);
    }
    for (const [parent, count] of childCounts) {
      if (count === 32) {
        for (const c of GEOHASH_BASE32) set.delete(parent + c);
        set.add(parent);
        changed = true;
      }
    }
  }
  return dedupeSort([...set]);
}

function dedupeSort(hashes: string[]): string[] {
  return [...new Set(hashes)].sort();
}

function ringToBboxRing(ring: [number, number][]): [number, number][] {
  const lngs = ring.map(([lng]) => lng);
  const lats = ring.map(([, lat]) => lat);
  const [west, east] = [Math.min(...lngs), Math.max(...lngs)];
  const [south, north] = [Math.min(...lats), Math.max(...lats)];
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ];
}

function fallbackVertexCover(
  rings: [number, number][][],
  maxLevel: number
): string[] {
  const hashes = new Set<string>();
  for (const ring of rings)
    for (const [lng, lat] of ring)
      hashes.add(Geohash.encode(lat, lng, maxLevel));
  return [...hashes].sort();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @veupathdb/components test --watchAll=false polygonsToGeohashPrefixes`
Expected: PASS (all suites in the file). The Europe-box test streams a few thousand cells through shape2geohash — allow a few seconds.

If the `insetBoxShape('u336')` test fails because shape2geohash classifies the four corner children of `u336` as non-intersecting at level 5 (fraction-of-cell rounding), lower the inset from 0.02 to 0.01 in `insetBoxShape` and re-run before touching the implementation.

- [ ] **Step 5: Verify the components build still passes**

Run: `yarn workspace @veupathdb/components build-npm-modules`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.ts packages/libs/components/src/map/utils/polygonsToGeohashPrefixes.test.ts
git commit -m "add polygonsToGeohashPrefixes multi-scale cover utility"
```

---

### Task 3: `GeoShapeSelect` map component (+ new deps, AreaSelect gating)

Headless controlled component: leaflet-lasso draws, geoman edits. Also gate `SemanticMarkers`' unconditional `<AreaSelect>` so maps without any area-selection callback don't show a phantom ctrl+drag box.

**Files:**

- Modify: `packages/libs/components/package.json` (new deps)
- Create: `packages/libs/components/src/map/GeoShapeSelect.tsx`
- Modify: `packages/libs/components/src/map/SemanticMarkers.tsx:286-291`

**Interfaces:**

- Consumes: `LatLngShape` from `./utils/polygonsToGeohashPrefixes` (Task 1); `useMap()` from react-leaflet 3.
- Produces: default export `GeoShapeSelect(props: { shapes: LatLngShape[]; onShapesChanged: (shapes: LatLngShape[]) => void; simplifyTolerancePx?: number })`. All `onShapesChanged` calls are deferred with `setTimeout(0)` (consumers need no extra deferral — see the teardown comment in the old `GeoCoordFilter.handleAreaSelected`).
- No unit test (Leaflet DOM component); verified by typecheck/build here and manually in Task 8.

- [ ] **Step 1: Add the dependencies**

```bash
yarn workspace @veupathdb/components add leaflet-lasso @geoman-io/leaflet-geoman-free
```

Expected: both packages appear in `packages/libs/components/package.json` dependencies and resolve in `yarn.lock`. Both ship their own TypeScript typings.

- [ ] **Step 2: Create `GeoShapeSelect.tsx`**

Create `packages/libs/components/src/map/GeoShapeSelect.tsx`:

```tsx
/*
 * Freehand lasso drawing plus shape editing for MapVEuMap maps.
 *
 * Drawing: leaflet-lasso (freehand). Editing / dragging / deleting:
 * @geoman-io/leaflet-geoman-free toolbar (its draw buttons are hidden —
 * drawing happens only through the lasso).
 *
 * Controlled component: `shapes` comes from the parent, and every user
 * gesture that changes the shapes is reported through `onShapesChanged`.
 * Emissions are deferred with setTimeout so that React state updates
 * (which can unmount the map, e.g. on a first-filter route transition)
 * never tear Leaflet down while it is still dispatching an event.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-lasso';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { LatLngShape } from './utils/polygonsToGeohashPrefixes';

export interface GeoShapeSelectProps {
  /** the current shapes, as [lat, lng] vertex arrays (unclosed) */
  shapes: LatLngShape[];
  /** called (deferred) after the user draws, edits, drags or deletes a shape */
  onShapesChanged: (shapes: LatLngShape[]) => void;
  /** pixel tolerance for simplifying freshly drawn lassos (default 8) */
  simplifyTolerancePx?: number;
}

const shapeStyle = {
  color: '#333333',
  weight: 2,
  dashArray: '6 3',
  fillOpacity: 0.05,
  // geoman runs in opt-in mode (see below); this opts the shape in
  pmIgnore: false,
};

export default function GeoShapeSelect(props: GeoShapeSelectProps) {
  const { shapes } = props;
  const map = useMap();
  const groupRef = useRef<L.FeatureGroup>();
  // serialized form of the last shape-set we emitted, to distinguish the
  // parent echoing our own change back (no rebuild — geoman may be
  // mid-gesture) from a genuinely new value (rebuild the layers)
  const lastEmittedRef = useRef<string>();

  // latest-value refs so leaflet handlers never capture stale closures
  const onShapesChangedRef = useRef(props.onShapesChanged);
  onShapesChangedRef.current = props.onShapesChanged;
  const simplifyTolerancePxRef = useRef(props.simplifyTolerancePx ?? 8);
  simplifyTolerancePxRef.current = props.simplifyTolerancePx ?? 8;

  function emitShapes() {
    setTimeout(() => {
      const group = groupRef.current;
      if (group == null) return;
      const next = collectShapes(group);
      lastEmittedRef.current = JSON.stringify(next);
      onShapesChangedRef.current(next);
    }, 0);
  }
  const emitShapesRef = useRef(emitShapes);
  emitShapesRef.current = emitShapes;

  useEffect(() => {
    // opt-in mode: only layers explicitly created with pmIgnore: false are
    // touched by geoman's global edit/drag/removal modes — this keeps the
    // data markers (SemanticMarkers) out of them
    L.PM.setOptIn(true);

    const group = L.featureGroup().addTo(map);
    groupRef.current = group;

    const lassoControl = (L.control as any).lasso({
      position: 'topleft',
      title: 'Draw an area (lasso) to filter the data',
    });
    lassoControl.addTo(map);

    map.pm.addControls({
      position: 'topleft',
      drawControls: false,
      editMode: true,
      dragMode: true,
      removalMode: true,
      cutPolygon: false,
      rotateMode: false,
    });

    const handleLassoFinished = (event: any) => {
      const latLngs: L.LatLng[] = event.latLngs ?? [];
      const simplified = simplifyLatLngs(
        map,
        latLngs,
        simplifyTolerancePxRef.current
      );
      if (simplified.length < 3) return;
      addShapeLayer(
        group,
        simplified.map((ll): [number, number] => [ll.lat, ll.lng]),
        () => emitShapesRef.current()
      );
      emitShapesRef.current();
    };

    // removal mode removes the layer from the map; also drop it from our
    // group so it no longer counts as a shape
    const handleRemove = (event: any) => {
      if (group.hasLayer(event.layer)) {
        group.removeLayer(event.layer);
        emitShapesRef.current();
      }
    };

    map.on('lasso.finished', handleLassoFinished);
    map.on('pm:remove', handleRemove);

    return () => {
      map.off('lasso.finished', handleLassoFinished);
      map.off('pm:remove', handleRemove);
      map.pm.removeControls();
      lassoControl.remove();
      group.remove();
      groupRef.current = undefined;
    };
  }, [map]);

  // sync layers from the shapes prop (initial mount, analysis reload,
  // external clearing) — skipped when the prop is the echo of our own emit
  useEffect(() => {
    const group = groupRef.current;
    if (group == null) return;
    const serialized = JSON.stringify(shapes);
    if (serialized === lastEmittedRef.current) return;
    group.clearLayers();
    for (const shape of shapes)
      addShapeLayer(group, shape, () => emitShapesRef.current());
    lastEmittedRef.current = serialized;
  }, [shapes]);

  return null;
}

function collectShapes(group: L.FeatureGroup): LatLngShape[] {
  const result: LatLngShape[] = [];
  group.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      const ring = (layer.getLatLngs() as L.LatLng[][])[0] ?? [];
      result.push(ring.map((ll): [number, number] => [ll.lat, ll.lng]));
    }
  });
  return result;
}

function addShapeLayer(
  group: L.FeatureGroup,
  shape: LatLngShape,
  onEdited: () => void
) {
  const layer = L.polygon(
    shape.map(([lat, lng]) => L.latLng(lat, lng)),
    shapeStyle as L.PolylineOptions
  );
  // commit at gesture boundaries (vertex drag end, vertex add/remove,
  // whole-shape drag end, edit-mode close) — not continuously mid-drag
  layer.on(
    'pm:markerdragend pm:vertexadded pm:vertexremoved pm:dragend pm:update' as any,
    onEdited
  );
  group.addLayer(layer);
}

function simplifyLatLngs(
  map: L.Map,
  latLngs: L.LatLng[],
  tolerancePx: number
): L.LatLng[] {
  const points = latLngs.map((ll) => map.latLngToLayerPoint(ll));
  return L.LineUtil.simplify(points, tolerancePx).map((p) =>
    map.layerPointToLatLng(p)
  );
}
```

TypeScript notes for the implementer: `(L.control as any).lasso` — leaflet-lasso registers the factory at runtime; if its typings augment `L.control`, drop the cast. `map.pm` is typed by geoman's own bundled typings. If `pmIgnore` is rejected inside `PolylineOptions`, keep the `as L.PolylineOptions` cast (geoman's typings augment `L.LayerOptions`, so it may typecheck without it).

- [ ] **Step 3: Gate AreaSelect in SemanticMarkers**

In `packages/libs/components/src/map/SemanticMarkers.tsx`, the return block (lines 286–291) currently mounts `<AreaSelect>` unconditionally, so ctrl+drag draws a selection box even on maps where nothing consumes it. Change:

```tsx
return (
  <>
    <AreaSelect onAreaSelected={onAreaSelected} />
    {refinedMarkers}
  </>
);
```

to:

```tsx
return (
  <>
    {(onAreaSelectedProp != null || setSelectedMarkers != null) && (
      <AreaSelect onAreaSelected={onAreaSelected} />
    )}
    {refinedMarkers}
  </>
);
```

(`onAreaSelectedProp` and `setSelectedMarkers` are already in scope — see lines 53 and 251–284. The full-screen map passes `setSelectedMarkers`, so its marker box-select is unaffected.)

- [ ] **Step 4: Verify build and existing tests**

Run: `yarn workspace @veupathdb/components build-npm-modules && yarn workspace @veupathdb/components test --watchAll=false`
Expected: build exits 0 (new component compiles, CSS import resolves); tests unchanged.

- [ ] **Step 5: Commit**

```bash
git add packages/libs/components/package.json yarn.lock packages/libs/components/src/map/GeoShapeSelect.tsx packages/libs/components/src/map/SemanticMarkers.tsx
git commit -m "add GeoShapeSelect (leaflet-lasso + geoman) map component"
```

---

### Task 4: `GeoCoordUIState` module with `selectedShapes`

Extract the codec from `GeoCoordFilter.tsx` into its own module (so it can be unit-tested without importing the Leaflet-heavy component) and add the optional `selectedShapes` field.

**Files:**

- Create: `packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.ts`
- Test: `packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.test.ts`

(`GeoCoordFilter.tsx` is deliberately untouched here — it keeps its own duplicate codec for one commit and switches to this module in Task 5.)

**Interfaces:**

- Consumes: `baseLayers` from `@veupathdb/components/lib/map/MapVEuMap` (as today).
- Produces: `export const GeoCoordUIState` (io-ts codec) + `export type GeoCoordUIState`; `export const defaultGeoCoordUIState: GeoCoordUIState`. `selectedShapes` decodes to `[number, number][][]` — assignment-compatible with `LatLngShape[]`.

- [ ] **Step 1: Write the failing test**

Create `packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.test.ts`:

```ts
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { GeoCoordUIState } from './geoCoordUIState';

const base = {
  mapCenterAndZoom: { latitude: 10, longitude: 20, zoomLevel: 4 },
};

test('decodes settings without selectedShapes (backwards compatible)', () => {
  expect(isRight(GeoCoordUIState.decode(base))).toBe(true);
});

test('round-trips selectedShapes', () => {
  const state = {
    ...base,
    selectedShapes: [
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ],
  };
  const decoded = GeoCoordUIState.decode(state);
  expect(isRight(decoded)).toBe(true);
  if (isRight(decoded)) {
    expect(GeoCoordUIState.encode(decoded.right)).toEqual(state);
  }
});

test('rejects malformed selectedShapes', () => {
  const state = { ...base, selectedShapes: [[['not-a-number', 2]]] };
  expect(isLeft(GeoCoordUIState.decode(state))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @veupathdb/eda test --watchAll=false geoCoordUIState`
Expected: FAIL — module `./geoCoordUIState` not found.

- [ ] **Step 3: Create the module**

Create `packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.ts`:

```ts
import * as t from 'io-ts';
import { baseLayers } from '@veupathdb/components/lib/map/MapVEuMap';

/**
 * Map UI state for the GeoCoordFilter, stored in the analysis' variable
 * UI settings under a key shared by an entity's latitude and longitude
 * variables (`${entityId}/${latitudeVariableId}/${longitudeVariableId}`),
 * so the map looks the same whichever of the two is selected. Studies
 * with several geo-enabled entities get one independent entry each.
 *
 * `selectedShapes` holds the user's lasso shapes as-drawn ([lat, lng]
 * vertices per shape). The shapes are the editable source of the
 * derived stringPrefixSet filter, which carries only geohash prefixes.
 */
export type GeoCoordUIState = t.TypeOf<typeof GeoCoordUIState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GeoCoordUIState = t.intersection([
  t.type({
    mapCenterAndZoom: t.type({
      latitude: t.number,
      longitude: t.number,
      zoomLevel: t.number,
    }),
  }),
  t.partial({
    baseLayer: t.keyof(baseLayers),
    selectedShapes: t.array(t.array(t.tuple([t.number, t.number]))),
  }),
]);

export const defaultGeoCoordUIState: GeoCoordUIState = {
  mapCenterAndZoom: {
    latitude: 0,
    longitude: 0,
    zoomLevel: 1,
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn workspace @veupathdb/eda test --watchAll=false geoCoordUIState`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.ts packages/libs/eda/src/lib/core/components/filter/geoCoordUIState.test.ts
git commit -m "add GeoCoordUIState codec module with selectedShapes"
```

(`GeoCoordFilter.tsx` still contains its own copy of the codec until Task 5 — duplication for one commit is fine; the old copy is deleted there.)

---

### Task 5: Rewrite `GeoCoordFilter` for lasso filtering

Remove the rectangle path; wire `GeoShapeSelect` + `polygonsToGeohashPrefixes`; persist shapes in uiSettings; manage the single `stringPrefixSet` filter; stale-shape sync rule.

**Files:**

- Rewrite: `packages/libs/eda/src/lib/core/components/filter/GeoCoordFilter.tsx`

**Interfaces:**

- Consumes: `GeoShapeSelect` (default export) from `@veupathdb/components/lib/map/GeoShapeSelect`; `polygonsToGeohashPrefixes` and `LatLngShape` from `@veupathdb/components/lib/map/utils/polygonsToGeohashPrefixes`; `GeoCoordUIState`/`defaultGeoCoordUIState` from `./geoCoordUIState`; `StringPrefixSetFilter` from `../../types/filter`.
- Produces: no exports consumed elsewhere (`GeoCoordUIState` re-export removed — it was only used internally; `FilterContainer`'s usage of the `GeoCoordFilter` component and its props is unchanged).

- [ ] **Step 1: Replace the file contents**

Replace `GeoCoordFilter.tsx` in full with:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { isEqual } from 'lodash';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
} from '@veupathdb/components/lib/map/MapVEuMap';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import GeoShapeSelect from '@veupathdb/components/lib/map/GeoShapeSelect';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import {
  polygonsToGeohashPrefixes,
  LatLngShape,
} from '@veupathdb/components/lib/map/utils/polygonsToGeohashPrefixes';

import { AnalysisState } from '../../hooks/analysis';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { GeoConfig } from '../../types/geoConfig';
import { Filter, StringPrefixSetFilter } from '../../types/filter';
import { useDeepValue } from '../../hooks/immutability';
import { GeoCoordVariable } from './types';
import { GeoCoordUIState, defaultGeoCoordUIState } from './geoCoordUIState';
import { ResetButtonCoreUI } from '../ResetButton';

type Props = {
  studyMetadata: StudyMetadata;
  /** the selected variable: either the latitude or the longitude variable */
  variable: GeoCoordVariable;
  entity: StudyEntity;
  /** the geo configuration for `entity` */
  geoConfig: GeoConfig;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
};

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

/**
 * A geographic filter for latitude/longitude variable pairs.
 *
 * Shows the same semantic-zooming marker map used elsewhere in EDA.
 * The user draws one or more freehand lasso shapes (editable via the
 * on-map toolbar); the shapes are converted to a multi-scale geohash
 * prefix cover and stored as a single stringPrefixSet filter on the
 * entity's finest geohash variable. The shapes themselves are persisted
 * in the analysis' variable UI settings so they can be re-edited.
 *
 * See docs/geo-coordinate-filtering.md (in this package) for the design
 * notes, and docs/superpowers/specs/2026-07-15-lasso-geo-filtering-design.md
 * (repo root) for the lasso design decisions.
 */
export function GeoCoordFilter(props: Props) {
  const {
    entity,
    analysisState,
    geoConfig,
    studyMetadata,
    totalEntityCount,
    filteredEntityCount,
  } = props;
  const { setFilters } = analysisState;
  const filters = analysisState.analysis?.descriptor.subset.descriptor;

  const { latitudeVariableId, longitudeVariableId } = geoConfig;

  // the filter is a prefix set on the entity's finest geohash variable
  const finestAggregationVariableId =
    geoConfig.aggregationVariableIds[
      geoConfig.aggregationVariableIds.length - 1
    ];
  const maxGeohashLevel = geoConfig.aggregationVariableIds.length;

  const isManagedFilter = useCallback(
    (f: Filter) =>
      f.entityId === entity.id &&
      f.variableId === finestAggregationVariableId &&
      f.type === 'stringPrefixSet',
    [entity.id, finestAggregationVariableId]
  );

  // the current geo filter, if any
  const geoFilter = filters?.find((f): f is StringPrefixSetFilter =>
    isManagedFilter(f)
  );

  // all filters except the one managed by this component; used for the
  // marker request so that the markers show the subset produced by the
  // *other* filters, with the current selection drawn on top (same
  // principle as HistogramFilter's foreground distribution + highlight)
  const otherFilters = useDeepValue(
    filters?.filter((f) => !isManagedFilter(f))
  );

  // map UI state is shared between the latitude and longitude variables
  const uiStateKey = `${entity.id}/${latitudeVariableId}/${longitudeVariableId}`;
  const variableUISettings =
    analysisState.analysis?.descriptor.subset.uiSettings;

  const uiState = useMemo(
    () =>
      pipe(
        GeoCoordUIState.decode(variableUISettings?.[uiStateKey]),
        getOrElse((): GeoCoordUIState => defaultGeoCoordUIState)
      ),
    [variableUISettings, uiStateKey]
  );

  const updateUIState = useCallback(
    (newUiState: Partial<GeoCoordUIState>) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const selectedShapes: LatLngShape[] = useMemo(
    () => uiState.selectedShapes ?? [],
    [uiState.selectedShapes]
  );

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const { markers, pending, basicMarkerError } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig,
    studyId: studyMetadata.id,
    filters: otherFilters,
    computationType: 'pass',
    xAxisVariable: undefined,
    markerType: 'pie',
  });

  // fly to the data when the map has never been interacted with
  // (same approach as MapVisualization)
  const [willFlyTo, setWillFlyTo] = useState(false);
  useEffect(() => {
    if (pending) {
      setWillFlyTo(
        isEqual(
          uiState.mapCenterAndZoom,
          defaultGeoCoordUIState.mapCenterAndZoom
        )
      );
    }
  }, [pending, uiState.mapCenterAndZoom]);

  const handleViewportChanged: MapVEuMapProps['onViewportChanged'] =
    useCallback(
      ({ center, zoom }) => {
        if (center != null && center.length === 2 && zoom != null) {
          updateUIState({
            mapCenterAndZoom: {
              latitude: center[0],
              longitude: center[1],
              zoomLevel: zoom,
            },
          });
        }
      },
      [updateUIState]
    );

  // true while a shapes change is between updateUIState and setFilters
  // (i.e. while the async prefix cover is being computed)
  const pendingFilterUpdateRef = useRef(false);
  // monotonically increasing sequence so a slow cover computation can
  // never clobber the filter produced by a newer edit
  const updateSeqRef = useRef(0);

  const handleShapesChanged = useCallback(
    (shapes: LatLngShape[]) => {
      const seq = ++updateSeqRef.current;
      pendingFilterUpdateRef.current = true;
      updateUIState({ selectedShapes: shapes });
      const remainingFilters =
        filters?.filter((f) => !isManagedFilter(f)) ?? [];
      if (shapes.length === 0) {
        pendingFilterUpdateRef.current = false;
        if (remainingFilters.length !== filters?.length)
          setFilters(remainingFilters);
        return;
      }
      polygonsToGeohashPrefixes(shapes, maxGeohashLevel)
        .then((prefixSet) => {
          if (seq !== updateSeqRef.current) return; // superseded
          pendingFilterUpdateRef.current = false;
          if (prefixSet.length === 0) return; // degenerate input; keep shapes visible, no filter
          setFilters([
            ...remainingFilters,
            {
              type: 'stringPrefixSet',
              entityId: entity.id,
              variableId: finestAggregationVariableId,
              prefixSet,
            },
          ]);
        })
        .catch((error) => {
          pendingFilterUpdateRef.current = false;
          console.error('Geohash cover computation failed', error);
        });
    },
    [
      filters,
      isManagedFilter,
      updateUIState,
      setFilters,
      entity.id,
      finestAggregationVariableId,
      maxGeohashLevel,
    ]
  );

  // Sync rule: the filter is the source of truth for subsetting. If it
  // has been removed elsewhere (filter chip ✕, filters list) while shapes
  // remain stored, clear the stale shapes rather than resurrecting the
  // selection. Skipped while we are mid-change ourselves.
  useEffect(() => {
    if (
      geoFilter == null &&
      !pendingFilterUpdateRef.current &&
      selectedShapes.length > 0
    ) {
      updateUIState({ selectedShapes: [] });
    }
  }, [geoFilter, selectedShapes, updateUIState]);

  const { latitude, longitude, zoomLevel } = uiState.mapCenterAndZoom;
  const [height, width] = [500, '100%'] as const;

  const entityDisplayName = entity.displayNamePlural ?? entity.displayName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1em',
          maxWidth: 800,
        }}
      >
        <div style={{ flex: 1 }}>
          {selectedShapes.length > 0 ? (
            <div>
              <b>Selected area:</b> {selectedShapes.length}{' '}
              {selectedShapes.length === 1 ? 'shape' : 'shapes'} drawn.{' '}
              {filteredEntityCount.toLocaleString()} of{' '}
              {totalEntityCount.toLocaleString()} {entityDisplayName} remain in
              the subset.
            </div>
          ) : (
            <div>
              <i>
                Use the lasso button (top left of the map, below the zoom
                controls) to draw one or more areas around the{' '}
                {entityDisplayName} you want to keep. Drawn areas can be
                reshaped, moved or deleted with the adjacent editing buttons.
              </i>
            </div>
          )}
        </div>
        {selectedShapes.length > 0 && (
          <ResetButtonCoreUI
            size={'medium'}
            text={'Clear selection'}
            themeRole={'primary'}
            tooltip={'Remove all drawn areas and the geographic filter'}
            disabled={false}
            onPress={() => handleShapesChanged([])}
          />
        )}
      </div>
      {basicMarkerError != null && (
        <div style={{ color: 'red' }}>{String(basicMarkerError)}</div>
      )}
      <div style={{ maxWidth: 800 }}>
        <MapVEuMap
          viewport={{ center: [latitude, longitude], zoom: zoomLevel }}
          onViewportChanged={handleViewportChanged}
          onBoundsChanged={setBoundsZoomLevel}
          height={height}
          width={width}
          showGrid={geoConfig.zoomLevelToAggregationLevel != null}
          zoomLevelToGeohashLevel={geoConfig.zoomLevelToAggregationLevel}
          baseLayer={uiState.baseLayer}
          onBaseLayerChanged={(newBaseLayer) =>
            updateUIState({ baseLayer: newBaseLayer })
          }
          showSpinner={pending}
          showScale={zoomLevel != null && zoomLevel > 4}
          defaultViewport={{
            center: [
              defaultGeoCoordUIState.mapCenterAndZoom.latitude,
              defaultGeoCoordUIState.mapCenterAndZoom.longitude,
            ],
            zoom: defaultGeoCoordUIState.mapCenterAndZoom.zoomLevel,
          }}
        >
          <SemanticMarkers
            markers={markers ?? []}
            animation={defaultAnimation}
            flyToMarkers={
              markers != null && markers.length > 0 && willFlyTo && !pending
            }
            flyToMarkersDelay={500}
          />
          {/* boundsZoomLevel is only set once the map is fully created, so
              gating on it keeps GeoShapeSelect's mount out of the same
              commit as the map's initialization (react-leaflet v3 races) */}
          {boundsZoomLevel != null && (
            <GeoShapeSelect
              shapes={selectedShapes}
              onShapesChanged={handleShapesChanged}
            />
          )}
        </MapVEuMap>
      </div>
    </div>
  );
}
```

Deliberately removed relative to the old file: `Rectangle` (react-leaflet), `AreaSelect` wiring / `onAreaSelected`, `normalizeLongitudeRange`, `constrainLongitude`, `selectedBounds`, `formatCoordinate` usage, `NumberRangeFilter`/`LongitudeRangeFilter` imports, the in-file `GeoCoordUIState` codec (now imported), and `io-ts`/`Bounds` imports.

- [ ] **Step 2: Typecheck / build**

Run: `yarn workspace @veupathdb/eda build-npm-modules`
Expected: exits 0. (The pre-existing `@veupathdb/coreui/lib/...` missing-module warnings noted in the project memory are fine.)

- [ ] **Step 3: Run the eda test suite (regression)**

Run: `yarn workspace @veupathdb/eda test --watchAll=false geoCoordUIState`
Expected: PASS (unchanged from Task 4).

- [ ] **Step 4: Commit**

```bash
git add packages/libs/eda/src/lib/core/components/filter/GeoCoordFilter.tsx
git commit -m "GeoCoordFilter: lasso selection producing stringPrefixSet filter"
```

---

### Task 6: "Geographic area" chip for `stringPrefixSet` + remove `removeFilters` machinery

Replace the lat/lng pair-detection chip with single-filter detection; the two-filter `removeFilters` prop is then unused — remove it and its four call sites.

**Files:**

- Modify: `packages/libs/eda/src/lib/core/components/FilterChipList.tsx`
- Modify: `packages/libs/eda/src/lib/workspace/AnalysisPanel.tsx:343` (remove `removeFilters` prop)
- Modify: `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx:368` (remove `removeFilters` prop)
- Modify: `packages/libs/eda/src/lib/core/components/GlobalFiltersDialog.tsx:57` (remove `removeFilters` prop)
- Modify: `packages/libs/eda/src/lib/notebook/cells/SubsettingNotebookCell.tsx:100` (remove `removeFilters` prop)

**Interfaces:**

- Consumes: `StringPrefixSetFilter` narrowing via `filter.type === 'stringPrefixSet'`; `variable.displayType === 'geoaggregator'` (see `VariableDisplayType` in `types/study.ts:81-88`); `isLatitudeVariable`/`isLongitudeVariable` from `./filter/guards`.
- Produces: `FilterChipList` props no longer include `removeFilters`.

- [ ] **Step 1: Rewrite the geo-chip logic in FilterChipList.tsx**

1. Delete the `removeFilters` prop from `Props` (lines 35-40) and from the destructuring (line 53).
2. Delete the `geoPairs` computation (lines 59-65 comment + code), the whole `pair`-handling block inside the map callback (lines 74-130), the `GeoFilterPair` interface and `findGeoFilterPairs` function (lines 195-231), and the now-unused imports `NumberRangeFilter`, `LongitudeRangeFilter` (from `../types/filter`) and `formatCoordinate`.
3. In the map callback, immediately after the `if (entity && variable) {` line, insert the new single-filter geo chip:

```tsx
// A stringPrefixSet filter on a geoaggregator variable is the
// GeoCoordFilter's lasso selection: show it as a single
// "Geographic area" chip linking to the latitude variable
// (which is where the map filter lives in the variable tree).
if (
  filter.type === 'stringPrefixSet' &&
  variable.displayType === 'geoaggregator'
) {
  const latitudeVariable = entity.variables.find(isLatitudeVariable);
  const longitudeVariable = entity.variables.find(isLongitudeVariable);
  const tooltipText = (
    <>
      <div
        style={{
          fontSize: '1.05em',
          fontWeight: 700,
          marginBottom: '.75em',
        }}
      >
        {entity.displayName}: Geographic area
      </div>
      <div>
        Lasso selection covering {filter.prefixSet.length} geohash{' '}
        {filter.prefixSet.length === 1 ? 'prefix' : 'prefixes'}
      </div>
    </>
  );
  return (
    <FilterChip
      tooltipText={tooltipText}
      isActive={
        entity.id === selectedEntityId &&
        (variable.id === selectedVariableId ||
          latitudeVariable?.id === selectedVariableId ||
          longitudeVariable?.id === selectedVariableId)
      }
      onDelete={() => removeFilter(filter)}
      key={`filter-chip-geo-${entity.id}`}
    >
      <VariableLink
        entityId={entity.id}
        variableId={latitudeVariable?.id ?? variable.id}
        replace={true}
        linkConfig={variableLinkConfig}
      >
        Geographic area
      </VariableLink>
    </FilterChip>
  );
}
```

(Keep the `isLatitudeVariable`/`isLongitudeVariable` import — it is reused here.)

- [ ] **Step 2: Remove the four `removeFilters` call sites**

In each of the four files below, delete the entire `removeFilters={...}` JSX attribute (a multi-line arrow function) from the `<FilterChipList ... />` element, leaving the other props untouched. Locations (line numbers pre-edit):

- `packages/libs/eda/src/lib/workspace/AnalysisPanel.tsx` — attribute starting at line 343
- `packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx` — attribute starting at line 368
- `packages/libs/eda/src/lib/core/components/GlobalFiltersDialog.tsx` — attribute starting at line 57
- `packages/libs/eda/src/lib/notebook/cells/SubsettingNotebookCell.tsx` — attribute starting at line 100

Then verify nothing else references the prop:

Run: `git grep -n "removeFilters" packages/libs/eda/src`
Expected: no matches. (If a helper variable in one of the four files becomes unused, delete it too — the build in the next step will flag it.)

- [ ] **Step 3: Build**

Run: `yarn workspace @veupathdb/eda build-npm-modules`
Expected: exits 0, no unused-variable/import errors.

- [ ] **Step 4: Commit**

```bash
git add packages/libs/eda/src/lib/core/components/FilterChipList.tsx packages/libs/eda/src/lib/workspace/AnalysisPanel.tsx packages/libs/eda/src/lib/map/analysis/MapAnalysis.tsx packages/libs/eda/src/lib/core/components/GlobalFiltersDialog.tsx packages/libs/eda/src/lib/notebook/cells/SubsettingNotebookCell.tsx
git commit -m "Geographic area chip for stringPrefixSet; drop removeFilters machinery"
```

---

### Task 7: Update the background design doc

**Files:**

- Modify: `packages/libs/eda/docs/geo-coordinate-filtering.md`

- [ ] **Step 1: Update the doc**

Make these edits (keep the overall document; this is a revision, not a rewrite):

1. Retitle the section `## What is implemented today: rectangle selection` to `## History: rectangle selection (mothballed)` and add this note directly under the heading:

```markdown
> **Status:** the rectangle interaction described below was replaced by
> lasso selection (see the next section) before this branch was ever
> released; the `numberRange` + `longitudeRange` pair approach and the
> paired-chip machinery were removed again. It is documented here because
> the routing/`GeoConfig` conditions and the marker-request design carry
> over unchanged to the lasso implementation.
```

2. Retitle `## Roadmap: lasso / arbitrary-shape filtering` to `## Implemented: lasso filtering via multi-scale geohash prefixes (Option B)` and add this implementation summary directly under the heading (before the existing option discussion, which stays as design rationale):

```markdown
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
- **Cover computation** (`polygonsToGeohashPrefixes`, same directory,
  built on `shape2geohash`): budget-driven top-down descent — cells fully
  inside any shape are kept at the level where they are discovered,
  border cells are refined until a **256-prefix budget** or the entity's
  finest geohash level is reached, then kept inclusively; a stop-level
  collapse guard replaces complete 32-child blocks with their parent.
  Longitudes are normalized to ±180 (dateline-straddling shapes are
  split) before the descent; shapes are stored as drawn.
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
```

3. In the `## Known limitations / follow-ups` section, replace the first bullet (about the dashed selection rectangle and world-panning) with:

```markdown
- Drawn shapes are rendered once in the "main world"; if the user pans
  several worlds east/west the shapes are not re-centered the way markers
  are. Filtering behaviour is unaffected (longitudes are normalized for
  the cover computation).
```

and delete the final bullet about transient viewport filters interacting with chip pairing (the pairing no longer exists).

- [ ] **Step 2: Commit**

```bash
git add packages/libs/eda/docs/geo-coordinate-filtering.md
git commit -m "docs: geo-coordinate-filtering — lasso implemented, rectangle mothballed"
```

---

### Task 8: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test + build sweep**

Run:

```bash
yarn workspace @veupathdb/components test --watchAll=false
yarn workspace @veupathdb/eda test --watchAll=false
yarn workspace @veupathdb/components build-npm-modules
yarn workspace @veupathdb/eda build-npm-modules
```

Expected: all pass / exit 0 (modulo pre-existing failures unrelated to this work — compare against `main` if in doubt, and note `useAnalysis.test.tsx` is already ignored via the eda jest config).

- [ ] **Step 2: Manual verification against the local dev service**

The user's webpack dev server points at an EDA service with `stringPrefixSet` support. With the dev server running, in a geo-enabled study (e.g. one with `geohash_1..6` aggregators), verify with the browser dev-tools network tab open:

1. Select the latitude (or longitude) variable → map filter appears with lasso + edit toolbar (no ctrl+drag rectangle).
2. Draw a lasso around some markers → a subsetting request containing `"type": "stringPrefixSet"` on the finest geohash variable fires; counts update; "Geographic area" chip appears; header shows "1 shape drawn".
3. Draw a second, disjoint lasso → same single filter, more prefixes (union), "2 shapes drawn".
4. Edit mode: drag a vertex → filter updates on drag end (not continuously). Drag mode: move a shape → updates on drop. Removal mode: delete one shape → filter recomputed; delete the last shape → filter removed entirely, chip gone.
5. Toggle geoman's edit/drag/removal modes and confirm the donut markers are NOT editable/draggable/removable (opt-in mode working).
6. Chip ✕ → filter removed AND shapes disappear from the map (sync rule).
7. Reload the analysis → shapes reappear (persisted in uiSettings) and the filter is intact.
8. If the study has a second geo-enabled entity: draw on both; confirm independent chips/filters/shapes.
9. Zoom during/after drawing → filter unchanged (zoom-independent cover).
10. "Clear selection" button → shapes and filter both cleared.

- [ ] **Step 3: Report results**

Report any failures with exact console/network output rather than fixing ad hoc — UX issues discovered here (e.g. toolbar layout, simplification tolerance) go back to the user for a decision.
