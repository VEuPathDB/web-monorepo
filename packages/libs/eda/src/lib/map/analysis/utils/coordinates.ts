/** Helpers for presenting and sharing map coordinates. */

export interface LatLng {
  lat: number;
  lng: number;
}

/** put a longitude into the -180..180 range */
export function wrapLongitude(lng: number) {
  const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
  // keep +180 as +180 rather than turning it into -180
  return wrapped === -180 && lng > 0 ? 180 : wrapped;
}

/**
 * "lat, lng" in decimal degrees, the format understood by Google Maps,
 * GIS tools and spreadsheets. Five decimals is roughly 1 metre.
 */
export function formatLatLng({ lat, lng }: LatLng, decimals = 5) {
  return `${lat.toFixed(decimals)}, ${wrapLongitude(lng).toFixed(decimals)}`;
}

export function googleMapsUrl({ lat, lng }: LatLng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(
    6
  )},${wrapLongitude(lng).toFixed(6)}`;
}

/** true if a bounding box is (practically) a single point */
export function isPointLike(
  bounds: { southWest: LatLng; northEast: LatLng },
  epsilon = 1e-6
) {
  return (
    Math.abs(bounds.northEast.lat - bounds.southWest.lat) < epsilon &&
    Math.abs(bounds.northEast.lng - bounds.southWest.lng) < epsilon
  );
}

/** parse a lat/long variable value as returned by the tabular endpoint */
export function parseCoordinate(value: string | undefined): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/** copy text to the clipboard; resolves to false if the browser refused */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy approach (e.g. insecure context)
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
