/**
 * Map selections are stored as sets of geohash prefixes.
 *
 * Every map marker is a geohash cell (its id is the geohash string at the
 * current aggregation level), and every finer geohash inside a cell starts
 * with that cell's geohash. So a set of prefixes describes a selected area
 * independently of zoom level:
 *
 * - clicking a marker adds its id to the set;
 * - a lasso adds the multi-scale prefix cover of the drawn shape;
 * - at any zoom level a marker is "selected" when one of the prefixes is a
 *   prefix of its id, and "partially selected" when it contains (is a prefix
 *   of) a selected prefix without being fully covered;
 * - the records for the selection are fetched with a single
 *   `stringPrefixSet` filter on the entity's finest geohash variable — the
 *   same filter the regular EDA lasso filter (GeoCoordFilter) produces.
 */

export const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/** true if `geohash` lies inside one of `prefixes` */
export function isCovered(geohash: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => geohash.startsWith(prefix));
}

/**
 * true if `geohash` contains some selected area but is not itself
 * entirely selected
 */
export function isPartiallyCovered(
  geohash: string,
  prefixes: readonly string[]
) {
  return (
    !isCovered(geohash, prefixes) &&
    prefixes.some((prefix) => prefix.startsWith(geohash))
  );
}

/**
 * Canonical form of a prefix set: no duplicates, no prefix that is already
 * covered by a shorter one, complete sets of 32 siblings merged into their
 * parent, sorted. Empty strings (the whole world) are kept as-is because
 * they cover everything.
 */
export function normalizePrefixes(prefixes: readonly string[]): string[] {
  if (prefixes.includes('')) return [''];
  // sorting puts every prefix before all the strings it is a prefix of
  const sorted = Array.from(new Set(prefixes)).sort();
  const minimal: string[] = [];
  for (const prefix of sorted) {
    const last = minimal[minimal.length - 1];
    if (last != null && prefix.startsWith(last)) continue;
    minimal.push(prefix);
  }
  return mergeCompleteSiblings(minimal);
}

function mergeCompleteSiblings(prefixes: string[]): string[] {
  let current = prefixes;
  for (;;) {
    const byParent = new Map<string, number>();
    for (const prefix of current) {
      if (prefix.length === 0) continue;
      const parent = prefix.slice(0, -1);
      byParent.set(parent, (byParent.get(parent) ?? 0) + 1);
    }
    const completeParents = Array.from(byParent.entries())
      .filter(([, count]) => count === GEOHASH_BASE32.length)
      .map(([parent]) => parent);
    if (completeParents.length === 0) return current;
    const merged = current.filter(
      (prefix) =>
        prefix.length === 0 || !completeParents.includes(prefix.slice(0, -1))
    );
    current = Array.from(new Set([...merged, ...completeParents])).sort();
    if (current.includes('')) return [''];
  }
}

/** union of two prefix sets */
export function addPrefixes(
  selection: readonly string[],
  toAdd: readonly string[]
): string[] {
  return normalizePrefixes([...selection, ...toAdd]);
}

/**
 * Remove the cell `geohash` from the selection. Finer prefixes inside it
 * are dropped; a coarser selected prefix that contains it is split into
 * the sibling cells that remain selected.
 */
export function removePrefix(
  selection: readonly string[],
  geohash: string
): string[] {
  const result: string[] = [];
  for (const prefix of selection) {
    if (prefix.startsWith(geohash)) continue; // inside the removed cell
    if (geohash.startsWith(prefix)) {
      // `prefix` contains the removed cell: keep everything else in it
      result.push(...complementWithin(prefix, geohash));
    } else {
      result.push(prefix);
    }
  }
  return normalizePrefixes(result);
}

/** the cells that make up `outer` minus `inner` (inner must be inside outer) */
function complementWithin(outer: string, inner: string): string[] {
  const cells: string[] = [];
  for (let length = outer.length; length < inner.length; length++) {
    const parent = inner.slice(0, length);
    const keep = inner[length];
    for (const char of GEOHASH_BASE32)
      if (char !== keep) cells.push(parent + char);
  }
  return cells;
}

export function removePrefixes(
  selection: readonly string[],
  toRemove: readonly string[]
): string[] {
  return toRemove.reduce<string[]>(
    (current, geohash) => removePrefix(current, geohash),
    [...selection]
  );
}

/** the area covered by both prefix sets */
export function intersectPrefixSets(
  a: readonly string[],
  b: readonly string[]
): string[] {
  const result: string[] = [];
  for (const pa of a)
    for (const pb of b) {
      if (pa.startsWith(pb)) result.push(pa);
      else if (pb.startsWith(pa)) result.push(pb);
    }
  return normalizePrefixes(result);
}

/** true if the two prefix sets describe the same area */
export function prefixSetsEqual(a: readonly string[], b: readonly string[]) {
  const na = normalizePrefixes(a);
  const nb = normalizePrefixes(b);
  return na.length === nb.length && na.every((prefix, i) => prefix === nb[i]);
}

/** which of the marker ids are fully / partially inside the selection */
export function classifyMarkers(
  markerIds: readonly string[],
  selection: readonly string[]
) {
  const selected: string[] = [];
  const partiallySelected: string[] = [];
  for (const id of markerIds) {
    if (isCovered(id, selection)) selected.push(id);
    else if (isPartiallyCovered(id, selection)) partiallySelected.push(id);
  }
  return { selected, partiallySelected };
}

/** [south, west, north, east] bounds of a geohash cell */
export function geohashBounds(geohash: string) {
  let minLat = -90,
    maxLat = 90,
    minLng = -180,
    maxLng = 180;
  let evenBit = true; // geohash bits alternate, starting with longitude
  for (const char of geohash) {
    const value = GEOHASH_BASE32.indexOf(char);
    if (value < 0) throw new Error(`Invalid geohash character: ${char}`);
    for (let bit = 4; bit >= 0; bit--) {
      const isSet = ((value >> bit) & 1) === 1;
      if (evenBit) {
        const mid = (minLng + maxLng) / 2;
        if (isSet) minLng = mid;
        else maxLng = mid;
      } else {
        const mid = (minLat + maxLat) / 2;
        if (isSet) minLat = mid;
        else maxLat = mid;
      }
      evenBit = !evenBit;
    }
  }
  return { south: minLat, west: minLng, north: maxLat, east: maxLng };
}

/** a geohash cell as an (unclosed) [lat, lng] polygon ring */
export function geohashToShape(geohash: string): [number, number][] {
  const { south, west, north, east } = geohashBounds(geohash);
  return [
    [south, west],
    [north, west],
    [north, east],
    [south, east],
  ];
}
