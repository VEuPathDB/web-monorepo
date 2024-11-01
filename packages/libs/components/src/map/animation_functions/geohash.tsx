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
  const prevGeoHash = prevMarkers[0].props.id as string;
  const currentGeohash = markers[0].props.id as string;
  let zoomType, consolidatedMarkers;

  /** Zoom Out - Move existing markers to new position
   * Existing GeoHash = gcwr
   * New Geohash      = gcw
   **/
  if (prevGeoHash.length > currentGeohash.length) {
    zoomType = 'out';
    const hashDif = prevGeoHash.length - currentGeohash.length;
    // Get array of old markers with new positions
    const cloneArray = updateMarkers(prevMarkers, markers, hashDif);
    // Combine the new and old markers
    consolidatedMarkers = [...markers, ...cloneArray];
  } else if (prevGeoHash.length < currentGeohash.length) {
    /** Zoom In - New markers start at old position
     * Existing GeoHash = gcw
     * New Geohash      = gcwr
     **/
    zoomType = 'in';
    const hashDif = currentGeohash.length - prevGeoHash.length;
    // Get array of new markers with old positions
    const cloneArray = updateMarkers(markers, prevMarkers, hashDif);
    consolidatedMarkers = [...prevMarkers, ...cloneArray];
  } else {
    /** No difference in geohashes - Render markers as they are **/
    zoomType = null;
    consolidatedMarkers = markers;
  }

  return { zoomType: zoomType, markers: consolidatedMarkers };
}
