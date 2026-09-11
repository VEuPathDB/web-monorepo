/*
 * Conversion of lasso-drawn polygons to multi-scale geohash prefix covers,
 * for use with the EDA subsetting service's stringPrefixSet filter.
 * See packages/libs/eda/docs/geo-coordinate-filtering.md (Option B).
 */

import Geohash from 'latlon-geohash';
import intersect from '@turf/intersect';
import turfArea from '@turf/area';
import {
  polygon as turfPolygon,
  multiPolygon as turfMultiPolygon,
  Feature,
  MultiPolygon,
  Polygon,
} from '@turf/helpers';

/** A drawn shape: [lat, lng] vertices, not necessarily closed. */
export type LatLngShape = [number, number][];

/**
 * The [lat, lng] bounding box of a geohash cell, for map display
 * (e.g. debugging overlays shading a prefix cover's cells).
 */
export function geohashCellBounds(hash: string): {
  southWest: [number, number];
  northEast: [number, number];
} {
  const bounds = Geohash.bounds(hash);
  return {
    southWest: [bounds.sw.lat, bounds.sw.lon],
    northEast: [bounds.ne.lat, bounds.ne.lon],
  };
}

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

export const DEFAULT_PREFIX_BUDGET = 256;

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

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

  let cover: string[];
  try {
    cover = descend(
      turfMultiPolygon(rings.map((ring) => [ring])),
      maxLevel,
      budget
    );
  } catch (error) {
    // defensive fallback for geometry the clipping library chokes on
    // (e.g. self-intersecting "bowtie" scribbles): use bounding boxes
    console.warn(
      'polygonsToGeohashPrefixes: falling back to bounding boxes',
      error
    );
    cover = descend(
      turfMultiPolygon(rings.map((ring) => [ringToBboxRing(ring)])),
      maxLevel,
      budget
    );
  }
  if (cover.length > 0) return cover;
  // degenerate (e.g. zero-area) shapes: cover the vertices themselves
  return fallbackVertexCover(rings, maxLevel);
}

type ShapeFeature = Feature<MultiPolygon>;

/**
 * Budget-driven top-down descent. Cells fully inside the shape are kept
 * at the level where they are discovered; border cells are refined until
 * the budget or maxLevel is reached, then kept inclusively. The collapse
 * guard runs on the final cover (in practice it only fires at the stop
 * level — see the design spec).
 */
function descend(
  shape: ShapeFeature,
  maxLevel: number,
  budget: number
): string[] {
  let kept: string[] = [];
  let frontier: string[] = []; // border cells at the current level
  for (let level = 1; level <= maxLevel; level++) {
    // level 1: all 32 top-level cells; deeper: children of border cells
    const candidates =
      level === 1
        ? [...GEOHASH_BASE32]
        : frontier.flatMap((parent) =>
            [...GEOHASH_BASE32].map((c) => parent + c)
          );
    const newKept: string[] = [];
    const newFrontier: string[] = [];
    for (const hash of candidates) {
      const cellClass = classifyCell(hash, shape);
      if (cellClass === 'inside') newKept.push(hash);
      else if (cellClass === 'border') newFrontier.push(hash);
    }
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
 * Classify a geohash cell against the shape by clipped-area ratio:
 * no intersection → outside; ≈ full cell area → inside; else border.
 * (turf's boolean predicates mis-handle containment — see task report —
 * so classification uses intersection area, which is unambiguous.)
 */
function classifyCell(
  hash: string,
  shape: ShapeFeature
): 'outside' | 'inside' | 'border' {
  const cell = cellPolygon(hash);
  const clipped = intersect(cell, shape);
  if (clipped == null) return 'outside';
  const ratio = turfArea(clipped) / turfArea(cell);
  if (ratio >= 0.999999) return 'inside'; // float tolerance
  if (ratio <= 0) return 'outside'; // touch-only degenerate sliver
  return 'border';
}

function cellPolygon(hash: string): Feature<Polygon> {
  const bounds = Geohash.bounds(hash);
  return turfPolygon([
    [
      [bounds.sw.lon, bounds.sw.lat],
      [bounds.ne.lon, bounds.sw.lat],
      [bounds.ne.lon, bounds.ne.lat],
      [bounds.sw.lon, bounds.ne.lat],
      [bounds.sw.lon, bounds.sw.lat],
    ],
  ]);
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
