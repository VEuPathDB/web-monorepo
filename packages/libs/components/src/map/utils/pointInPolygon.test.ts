import { pointInPolygon } from './pointInPolygon';

const square = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 10, lng: 10 },
  { lat: 10, lng: 0 },
];

// a "C" shape: the notch on the east side is outside
const cShape = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
  { lat: 3, lng: 10 },
  { lat: 3, lng: 3 },
  { lat: 7, lng: 3 },
  { lat: 7, lng: 10 },
  { lat: 10, lng: 10 },
  { lat: 10, lng: 0 },
];

describe('pointInPolygon', () => {
  it('finds points inside and outside a square', () => {
    expect(pointInPolygon({ lat: 5, lng: 5 }, square)).toBe(true);
    expect(pointInPolygon({ lat: 15, lng: 5 }, square)).toBe(false);
    expect(pointInPolygon({ lat: 5, lng: -1 }, square)).toBe(false);
  });

  it('handles concave shapes', () => {
    expect(pointInPolygon({ lat: 5, lng: 8 }, cShape)).toBe(false);
    expect(pointInPolygon({ lat: 5, lng: 1 }, cShape)).toBe(true);
    expect(pointInPolygon({ lat: 1, lng: 8 }, cShape)).toBe(true);
  });

  it('accepts closed rings and works beyond ±180 longitude', () => {
    const shifted = [...square, square[0]].map(({ lat, lng }) => ({
      lat,
      lng: lng + 360,
    }));
    expect(pointInPolygon({ lat: 5, lng: 365 }, shifted)).toBe(true);
    expect(pointInPolygon({ lat: 5, lng: 5 }, shifted)).toBe(false);
  });

  it('is false for degenerate polygons', () => {
    expect(pointInPolygon({ lat: 0, lng: 0 }, [])).toBe(false);
    expect(pointInPolygon({ lat: 0, lng: 0 }, square.slice(0, 2))).toBe(false);
  });
});
