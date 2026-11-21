import {
  formatLatLng,
  googleMapsUrl,
  isPointLike,
  parseCoordinate,
  wrapLongitude,
} from './coordinates';

describe('coordinates', () => {
  it('wraps longitudes into -180..180', () => {
    expect(wrapLongitude(10)).toBe(10);
    expect(wrapLongitude(190)).toBe(-170);
    expect(wrapLongitude(-190)).toBe(170);
    expect(wrapLongitude(540)).toBe(180);
    expect(wrapLongitude(180)).toBe(180);
    expect(wrapLongitude(-180)).toBe(-180);
  });

  it('formats lat/long pairs', () => {
    expect(formatLatLng({ lat: 12.3456789, lng: -1.5 })).toBe(
      '12.34568, -1.50000'
    );
    expect(formatLatLng({ lat: 1, lng: 365 }, 2)).toBe('1.00, 5.00');
  });

  it('builds a Google Maps search url', () => {
    expect(googleMapsUrl({ lat: -3.5, lng: 400 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=-3.500000,40.000000'
    );
  });

  it('detects point-like bounds', () => {
    const point = { lat: 1, lng: 2 };
    expect(isPointLike({ southWest: point, northEast: point })).toBe(true);
    expect(
      isPointLike({ southWest: point, northEast: { lat: 1.1, lng: 2 } })
    ).toBe(false);
  });

  it('parses coordinate values', () => {
    expect(parseCoordinate('12.5')).toBe(12.5);
    expect(parseCoordinate('')).toBeUndefined();
    expect(parseCoordinate(undefined)).toBeUndefined();
    expect(parseCoordinate('n/a')).toBeUndefined();
  });
});
