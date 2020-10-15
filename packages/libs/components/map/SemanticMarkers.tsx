import React, {ReactElement, useEffect, useState, useContext} from "react";
import {GeoBBox, MarkerProps, BoundsViewport, AnimationFunction} from "./Types";
import { useLeaflet } from "react-leaflet";
import { LatLngBounds } from 'leaflet'

interface SemanticMarkersProps {
  onViewportChanged: (bvp: BoundsViewport) => void,
  markers: Array<ReactElement<MarkerProps>>,
  animation: {
    method: string,
    animationFunction: AnimationFunction,
    duration: number
  } | null
}

/**
 * Renders the semantic markers layer
 * 
 * 
 * @param props 
 */
export default function SemanticMarkers({ onViewportChanged, markers, animation}: SemanticMarkersProps) {
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
      if (markers.length > 0 && prevMarkers.length > 0 && animation) {
        const animationValues = animation.animationFunction({prevMarkers, markers});
        setZoomType(animationValues.zoomType);
        setConsolidatedMarkers(animationValues.markers)
      }
      /** First render of markers **/
      else {
        setConsolidatedMarkers([...markers]);
      }

      // Update previous markers with the original markers array
      setPrevMarkers(markers);

  }, [markers]);

  useEffect (() => {
    /** If we are zooming in then reset the marker elements. When initially rendered
    * the new markers will start at the matching existing marker's location and here we will
    * reset marker elements so they will animated to their final position
    **/
    let timeoutVariable: NodeJS.Timeout;

    if (zoomType == 'in') {
      setConsolidatedMarkers([...markers])
    }
    /** If we are zooming out then remove the old markers after they finish animating. **/
    else if (zoomType == 'out') {
      timeoutVariable = setTimeout(
          () => {
            setConsolidatedMarkers([...markers])
          }, animation ? animation.duration : 0
      );
    }

    return () => clearTimeout(timeoutVariable)

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

