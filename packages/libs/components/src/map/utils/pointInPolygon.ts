export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Even-odd (ray casting) point-in-polygon test in plain lat/lng space.
 *
 * Good enough for hit-testing marker positions against a lasso drawn on
 * screen: the lasso and the (recentred) marker positions are in the same
 * world copy, and at the scales where a lasso is drawn the projection's
 * distortion between vertices is negligible. The polygon ring may be open
 * or closed.
 */
export function pointInPolygon(
  point: LatLngPoint,
  polygon: readonly LatLngPoint[]
): boolean {
  let inside = false;
  const { lat: y, lng: x } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { lat: yi, lng: xi } = polygon[i];
    const { lat: yj, lng: xj } = polygon[j];
    const crosses =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}
