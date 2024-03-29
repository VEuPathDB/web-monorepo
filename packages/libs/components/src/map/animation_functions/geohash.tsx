import { ReactElement } from 'react';
import updateMarkers from './updateMarkers';
import { BoundsDriftMarkerProps } from '../BoundsDriftMarker';

interface geoHashAnimation {
  prevMarkers: Array<ReactElement<BoundsDriftMarkerProps>>;
  markers: Array<ReactElement<BoundsDriftMarkerProps>>;
}

export default function geohashAnimation({
  prevMarkers,
  markers,
}: geoHashAnimation) {
  const prevGeoHash = prevMarkers[0].key as string;
  const currentGeohash = markers[0].key as string;
  let zoomType, consolidatedMarkers;

  /** Zoom Out - Move existing markers to new position
   * Existing GeoHash = gcwr
   * New Geohash      = gcw
   **/
  if (prevGeoHash.length > currentGeohash.length) {
    zoomType = 'out';
    const hashDif = prevGeoHash.length - currentGeohash.length;
    // Get a new array of existing markers with new position property
    const cloneArray = updateMarkers(prevMarkers, markers, hashDif);
    // Combine the new and existing markers
    consolidatedMarkers = [...markers, ...cloneArray];
  } else if (prevGeoHash.length < currentGeohash.length) {
    /** Zoom In - New markers start at old position
     * Existing GeoHash = gcw
     * New Geohash      = gcwr
     **/
    zoomType = 'in';
    const hashDif = currentGeohash.length - prevGeoHash.length;
    // Get a new array of new markers with existing position property
    // Set final render markers to the cloneArray which holds the new markers with
    // their new starting location
    consolidatedMarkers = updateMarkers(markers, prevMarkers, hashDif);
  } else {
    /** No difference in geohashes - Render markers as they are **/
    zoomType = null;
    consolidatedMarkers = markers;
  }

  return { zoomType: zoomType, markers: consolidatedMarkers };
}
