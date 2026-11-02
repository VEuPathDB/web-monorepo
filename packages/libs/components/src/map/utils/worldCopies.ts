/*
 * Helpers for drawing overlays on a Leaflet map that repeats the world
 * east and west: an overlay defined in one longitude range needs copies,
 * shifted by multiples of 360°, in every world copy the user can see.
 * (Cf. SemanticMarkers, which recentres markers into the viewport.)
 */

import { useCallback, useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { isEqual } from 'lodash';

/** Most world copies an overlay will be repeated in at once. */
export const MAX_WORLD_COPIES = 9;

/**
 * Longitude shifts (multiples of 360, ascending) that bring an object
 * spanning [extentWest, extentEast] into the viewport [viewWest, viewEast].
 * Includes 0 when the object is already visible. If more than `maxCopies`
 * would be needed (zoomed out very far) only those nearest the viewport
 * centre are kept.
 */
export function worldShiftsIntoView(
  extentWest: number,
  extentEast: number,
  viewWest: number,
  viewEast: number,
  maxCopies: number = MAX_WORLD_COPIES
): number[] {
  let first = Math.ceil((viewWest - extentEast) / 360);
  let last = Math.floor((viewEast - extentWest) / 360);
  if (last - first + 1 > maxCopies) {
    const middle = Math.round((first + last) / 2);
    first = middle - Math.floor(maxCopies / 2);
    last = first + maxCopies - 1;
  }
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => {
    const shift = (first + i) * 360;
    return shift === 0 ? 0 : shift; // avoid -0
  });
}

/**
 * Longitude shifts for every world copy currently visible in the map, for
 * overlays defined in ±180°. Updates on pan, zoom and resize.
 */
export function useVisibleWorldOffsets(): number[] {
  const map = useMap();
  const compute = useCallback(() => {
    const bounds = map.getBounds();
    return worldShiftsIntoView(-180, 180, bounds.getWest(), bounds.getEast());
  }, [map]);
  const [offsets, setOffsets] = useState(compute);
  const update = () =>
    // keep the previous array identity when nothing changed
    setOffsets((prev) => {
      const next = compute();
      return isEqual(prev, next) ? prev : next;
    });
  useMapEvents({ moveend: update, zoomend: update, resize: update });
  return offsets;
}
