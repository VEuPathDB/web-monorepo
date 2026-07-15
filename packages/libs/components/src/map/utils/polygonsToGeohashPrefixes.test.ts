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
