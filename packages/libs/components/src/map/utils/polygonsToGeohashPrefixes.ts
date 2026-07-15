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
