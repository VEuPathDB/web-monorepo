import React, { ReactElement, useEffect } from "react"; //  { useState, useCallback } from "react";
import { GeoBBox, MarkerProps, BoundsViewport } from "./Types";
import { useLeaflet } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

interface SemanticMarkersProps {
  onViewportChanged: (bvp: BoundsViewport) => void,
  markers: Array<ReactElement<MarkerProps>>
}

/**
 * Renders the semantic markers layer
 * 
 * 
 * @param props 
 */
export default function SemanticMarkers({ onViewportChanged, markers }: SemanticMarkersProps) {
  const { map } = useLeaflet();
  // call the prop callback to communicate bounds and zoomLevel to outside world
  useEffect(() => {
    if (map == null) return; // is it ever null?

    function updateMap() {
      const bounds = boundsToGeoBBox(map.getBounds());
      const zoomLevel = map.getZoom();
      onViewportChanged({ bounds, zoomLevel });
    }

    updateMap();
    map.on('resize dragend zoomend', updateMap); // resize is there hopefully when we have full screen mode

    return () => {
      map.off('resize dragend zoomend', updateMap);
    };
  }, [map, onViewportChanged]);

  

  /* also think about animating from the previous markers
     hopefully react can do that for free?  (I saw something about prevProps in lifecycle methods.)

     Have to figure out relationships between previous and current markers.
     Easy to do using geohash strings.  Need to see how it was done in the old map.
     Yes it was done by looking for common prefices in the markerID which was also the geohash_x value
     https://github.com/VEuPathDB/popbio-map/blob/1dce1d83dd6142ce1938675a8e6b620623f41779/web/js/map.popbioMarkers.js#L42

     What if we're not using geohash strings to aggregate? (e.g. using country and admin1 fields)
     (GADM IDs do have a prefix structure, so this could work.)
   */

  return (
    <>
      {markers}
    </>
  );
}



function boundsToGeoBBox(bounds : any) : GeoBBox {

  var south = bounds.getSouth();
  if (south < -90) {
    south = -90;
  }
  var north = bounds.getNorth();
  if (north > 90) {
    north = 90;
  }
  var west = bounds.getWest();
  if (west < -180) {
    west = -180;
  }
  if (west > 180) {
    west = 180;
  }
  var east = bounds.getEast();
  if (east > 180) {
    east = 180;
  }
  if (east < -180) {
    east = -180;
  }  

  return { southWest: [south, west],
	   northEast: [north, east] }
}

