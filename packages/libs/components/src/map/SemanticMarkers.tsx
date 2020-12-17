import React, {ReactElement, useEffect, useState, cloneElement} from "react";
import { MarkerProps, BoundsViewport, AnimationFunction, Bounds } from "./Types";
import { BoundsDriftMarkerProps } from "./BoundsDriftMarker";
import { useLeaflet } from "react-leaflet";
import { LatLngBounds } from 'leaflet'

interface SemanticMarkersProps {
  onViewportChanged: (bvp: BoundsViewport) => void,
  markers: Array<ReactElement<BoundsDriftMarkerProps>>,
  recenterMarkers?: boolean,
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
export default function SemanticMarkers({ onViewportChanged, markers, animation, recenterMarkers = true}: SemanticMarkersProps) {
  const { map } = useLeaflet();

  const [prevMarkers, setPrevMarkers] = useState<ReactElement<BoundsDriftMarkerProps>[]>(markers);
  const [bounds, setBounds] = useState<Bounds>();
  
  const [consolidatedMarkers, setConsolidatedMarkers] = useState<ReactElement<MarkerProps>[]>([]);
  const [zoomType, setZoomType] = useState<string | null>(null);

  // call the prop callback to communicate bounds and zoomLevel to outside world
  useEffect(() => {
    if (map == null) return;

    function updateMap() {
      if (map != null) {
        const bounds = boundsToGeoBBox(map.getBounds());
	setBounds(bounds);
        const zoomLevel = map.getZoom();
        onViewportChanged({ bounds, zoomLevel });
      }
    }

    updateMap();
    //DKDK remove moveend due to conflict with marker animation
    map.on('resize dragend zoomend', updateMap); // resize is there hopefully when we have full screen mode

    return () => {
    //DKDK remove moveend due to conflict with marker animation
      map.off('resize dragend zoomend', updateMap);
    };
  }, [map, onViewportChanged]);

  // handle recentering (around +180/-180 longitude) and animation
  useEffect(() => {
    let recenteredMarkers = false;
    if (recenterMarkers && bounds) {

      markers = markers.map( marker => {
	let { lat, lng } = marker.props.position;
	let { southWest: { lat: ltMin, lng: lnMin }, northEast: { lat: ltMax, lng: lnMax} } = marker.props.bounds;
	let recentered : boolean = false;
	while (lng > bounds.northEast.lng) {
//	  console.log(`marker ${marker.props.id} shifting left from ${lng}`);
	  lng -= 360;
	  lnMax -= 360;
	  lnMin -= 360;
	  recentered = true;
	}
	while (lng < bounds.southWest.lng) {
//	  console.log(`marker ${marker.props.id} shifting right from ${lng}`);
	  lng += 360;
	  lnMax += 360;
	  lnMin += 360;
	  recentered = true;
	}
	recenteredMarkers = recenteredMarkers || recentered;
      	return recentered ? cloneElement(marker, { position: { lat, lng },
						   bounds: {
						     southWest: { lat: ltMin, lng: lnMin },
						     northEast: { lat: ltMax, lng: lnMax }
						   } }) : marker;
      });
    }

    // now handle animation
    // but don't animate if we moved markers by 360 deg. longitude
    // because the DriftMarker or Leaflet.Marker.SlideTo code seems to
    // send everything back to the 'main' world.
    if (markers.length > 0 && prevMarkers.length > 0 && animation && !recenteredMarkers) {
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


function boundsToGeoBBox(bounds : LatLngBounds) : Bounds {

  var south = bounds.getSouth();
  if (south < -90) {
    south = -90;
  }
  var north = bounds.getNorth();
  if (north > 90) {
    north = 90;
  }
  var east = bounds.getEast();
  var west = bounds.getWest();
  
  if (east - west > 360) {
    const center = (east+west)/2;
    west = center - 180;
    east = center + 180;
  }

  return { southWest: {lat: south, lng: west}, northEast: {lat: north, lng: east} };
}

