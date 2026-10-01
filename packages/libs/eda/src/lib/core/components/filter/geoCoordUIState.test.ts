import { isLeft, isRight } from 'fp-ts/lib/Either';

jest.mock('@veupathdb/components/lib/map/MapVEuMap', () => ({
  baseLayers: {
    Street: {},
    Terrain: {},
    Satellite: {},
    OSM: {},
  },
}));

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
