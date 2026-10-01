import Geohash from 'latlon-geohash';
import {
  normalizeShapeLongitudes,
  LatLngShape,
  polygonsToGeohashPrefixes,
  collapseCompleteBlocks,
  geohashCellBounds,
} from './polygonsToGeohashPrefixes';

describe('geohashCellBounds', () => {
  test('returns the cell box in [lat, lng] order', () => {
    const bounds = geohashCellBounds('u336');
    expect(bounds.southWest[0]).toBeLessThan(bounds.northEast[0]); // lat
    expect(bounds.southWest[1]).toBeLessThan(bounds.northEast[1]); // lng
    const centerLat = (bounds.southWest[0] + bounds.northEast[0]) / 2;
    const centerLng = (bounds.southWest[1] + bounds.northEast[1]) / 2;
    expect(Geohash.encode(centerLat, centerLng, 4)).toBe('u336');
  });
});

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
