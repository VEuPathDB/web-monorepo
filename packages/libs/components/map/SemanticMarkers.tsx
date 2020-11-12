import React, {ReactElement, useEffect, useState, cloneElement} from "react";
import {GeoBBox, MarkerProps, BoundsViewport, AnimationFunction} from "./Types";
import { useLeaflet } from "react-leaflet";
import { LatLngBounds } from 'leaflet'
import Geohash from 'latlon-geohash';

interface SemanticMarkersProps {
  onViewportChanged: (bvp: BoundsViewport, handleMarkerClicked: (markerBounds: LatLngBounds) => void) => void,
  markers: Array<ReactElement<MarkerProps>>,
  nudge?: "geohash" | "none",
  handleMarkerClicked: (markerBounds: LatLngBounds) => void,
  animation: {
    method: string,
    duration: number,
    animationFunction: AnimationFunction
  } | null
}

/**
 * Renders the semantic markers layer
 * 
 * 
 * @param props 
 */
export default function SemanticMarkers({ onViewportChanged, markers, animation, nudge, handleMarkerClicked}: SemanticMarkersProps) {
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
        onViewportChanged({ bounds, zoomLevel }, handleMarkerClicked);
      }
    }

    updateMap();
    map.on('resize dragend zoomend', updateMap); // resize is there hopefully when we have full screen mode

    return () => {
      map.off('resize dragend zoomend', updateMap);
    };
  }, [map, onViewportChanged]);

  // handle nudging and animation
  useEffect(() => {
    if (nudge && nudge === 'geohash' && map && map.options && map.options.crs) {

      const zoomLevel = map.getZoom();
      const scale = map.options.crs.scale(zoomLevel)/256;

      markers = markers.map( marker => {
	const markerRadius = 35; // pixels // TEMPORARILY HARDCODED - need to get it from the marker somehow?
	// It should work with half the maximum dimension (50/2 = 25)
	// but I suspect 'position' is not in the center of the marker icon?
	
	const geohash = marker.key as string;
	const geohashCenter = Geohash.decode(geohash);
	const bounds = Geohash.bounds(geohash);
	const markerRadius2 = markerRadius/scale;
	let [ lat, lon ] : number[] = marker.props.position;
	let nudged : boolean = false;

	// bottom edge
	if (lat - markerRadius2 < bounds.sw.lat) {
	  // nudge it up
	  lat = bounds.sw.lat + markerRadius2;
	  // but don't nudge it past the center of the geohash rectangle
	  if (lat > geohashCenter.lat) lat = geohashCenter.lat;
	  nudged = true;
	}
	// left edge
	if (lon - markerRadius2 < bounds.sw.lon) {
	  lon = bounds.sw.lon + markerRadius2;
	  if (lon > geohashCenter.lon) lon = geohashCenter.lon;
	  nudged = true;
	}
	// top edge
	if (lat + markerRadius2 > bounds.ne.lat) {
	  lat = bounds.ne.lat - markerRadius2;
	  if (lat < geohashCenter.lat) lat = geohashCenter.lat;
	  nudged = true;
	}
	// right edge
	if (lon + markerRadius2 > bounds.ne.lon) {
	  lon = bounds.ne.lon - markerRadius2;
	  if (lon < geohashCenter.lon) lon = geohashCenter.lon;
	  nudged = true;
	}

      	return nudged ? cloneElement(marker, { position: [ lat, lon ] }) : marker;
      });
    }

    // now handle animation
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

