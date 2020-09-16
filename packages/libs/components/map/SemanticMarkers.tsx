import React, {cloneElement, ReactElement, useEffect, useState} from "react"; //  { useState, useCallback } from "react";
import { GeoBBox, MarkerProps, BoundsViewport } from "./Types";
import { useLeaflet } from "react-leaflet";
import { LatLngBounds } from 'leaflet'

interface SemanticMarkersProps {
  onViewportChanged: (bvp: BoundsViewport) => void,
  markers: Array<ReactElement<MarkerProps>>,
  setMarkerElements: (markers: ReactElement<MarkerProps>[]) => void
}

/**
 * Renders the semantic markers layer
 * 
 * 
 * @param props 
 */
export default function SemanticMarkers({ onViewportChanged, markers, setMarkerElements}: SemanticMarkersProps) {
  const { map } = useLeaflet();

  const [prevMarkers, setPrevMarkers] = useState<ReactElement<MarkerProps>[]>(markers);

  const [consolidatedMarkers, setConsolidatedMarkers] = useState<ReactElement<MarkerProps>[]>([]);
  const [zoomType, setZoomType] = useState<string | null>(null);

  // call the prop callback to communicate bounds and zoomLevel to outside world
  useEffect(() => {
    if (map == null) return;

    function updateMap() {
      if (map != null) {
        const bounds = boundsToGeoBBox(map.getBounds());
        const zoomLevel = map.getZoom();
        onViewportChanged({ bounds, zoomLevel });
      }
    }

    updateMap();
    map.on('resize dragend zoomend', updateMap); // resize is there hopefully when we have full screen mode

    return () => {
      map.off('resize dragend zoomend', updateMap);
    };
  }, [map, onViewportChanged]);

  useEffect(() => {
      if (markers.length > 0 && prevMarkers.length > 0) {
          const prevGeoHash = prevMarkers[0].key as string;
          const currentGeohash = markers[0].key as string;

          /** Zoom Out - Move existing markers to new position
           * Existing GeoHash = gcwr
           * New Geohash      = gcw
           **/
          if (prevGeoHash.length > currentGeohash.length) {
            setZoomType('out');
            const hashDif = prevGeoHash.length - currentGeohash.length;
            // bfox6 - Get a new array of existing markers with new position property
            const cloneArray = updateMarkers(prevMarkers, markers, hashDif);
            // bfox6 - Combine the new and existing markers
            setConsolidatedMarkers([...markers, ...cloneArray]);
          }
          /** Zoom In - New markers start at old position
           * Existing GeoHash = gcw
           * New Geohash      = gcwr
           **/
          else if (prevGeoHash.length < currentGeohash.length) {
            setZoomType('in');
            const hashDif = currentGeohash.length - prevGeoHash.length;
            // bfox6 - Get a new array of new markers with existing position property
            const cloneArray = updateMarkers(markers, prevMarkers, hashDif);
            // bfox6 - Set final render markers to the cloneArray which holds the new markers with
            // their new starting location
            setConsolidatedMarkers(cloneArray)
          }
          /** No difference in geohashes - Render markers as they are **/
          else {
            setZoomType(null);
            setConsolidatedMarkers([...markers])
          }
      }
      /** First render of markers **/
      else {
        setConsolidatedMarkers([...markers]);
      }

      // Update previous markers with the original markers array
      setPrevMarkers(markers);

  }, [markers]);

  useEffect (() => {
    /** bfox6 - If we are zooming in then reset the marker elements. When initially rendered
    * the new markers will start at the matching existing marker's location and here we will
    * reset marker elements so they will animated to their final position
    **/
    if (zoomType == 'in') {
      setConsolidatedMarkers([...markers])
    }
    /** bfox6 - If we are zooming out then remove the old markers after they finish animating. **/
    else if (zoomType == 'out') {
      setTimeout(
          () => {
            setConsolidatedMarkers([...markers])
          }, 300
      );
    }
  }, [zoomType]);

  return (
    <>
      {consolidatedMarkers}
    </>
  );
}


function boundsToGeoBBox(bounds : LatLngBounds) : GeoBBox {

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

function updateMarkers(toChangMarkers: Array<ReactElement<MarkerProps>>,
                       sourceMarkers: Array<ReactElement<MarkerProps>>,
                       hashDif: number) {
  return toChangMarkers.map((markerObj) => {
    // bfox6 - Calculate the matching geohash
    const sourceKey = markerObj.key as string;
    const sourceHash = sourceKey.slice(0, -hashDif);

    // bfox6 - Find the object with the matching geohash
    const matchingMarker = sourceMarkers.filter(obj => {
      return obj.key === sourceHash
    });

    // bfox6 - Clone marker element with new position
    const markerCloneProps = {
      ...markerObj.props,
      position: matchingMarker[0].props.position
    };
    return cloneElement(markerObj, markerCloneProps);
  });

}