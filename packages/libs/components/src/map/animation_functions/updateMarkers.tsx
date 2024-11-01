import { cloneElement, ReactElement } from 'react';
import { BoundsDriftMarkerProps } from '../BoundsDriftMarker';

export default function updateMarkers(
  toChangeMarkers: Array<ReactElement<BoundsDriftMarkerProps>>,
  sourceMarkers: Array<ReactElement<BoundsDriftMarkerProps>>,
  hashDif: number
) {
  return toChangeMarkers.map((markerObj) => {
    // Calculate the matching geohash
    const sourceKey = markerObj.props.id as string;
    const sourceHash = sourceKey.slice(0, -hashDif);

    // Find the object with the matching geohash
    const matchingMarkers = sourceMarkers.filter((obj) => {
      return obj.props.id === sourceHash;
    });

    // Clone marker element with new position
    let markerCloneProps = {};
    if (matchingMarkers.length == 1) {
      // Clone marker element with new position
      markerCloneProps = {
        position: matchingMarkers[0].props.position,
        // ideally we would put the modified markers on top
        // but this doesn't seem to work:
        // zIndexOffset: -1000, // or +1000
      };
    }

    return cloneElement(markerObj, markerCloneProps);
  });
}
