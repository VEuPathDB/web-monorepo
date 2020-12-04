import {Rectangle, useLeaflet, MarkerProps as LeafletMarkerProps} from "react-leaflet";
import React, { useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds, ExtractProps } from './Types';
import { LeafletMouseEvent, LatLngBounds } from "leaflet";

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
}

// Wrapper component for DriftMarker to "fix" its Props type.
// We are adding the missing LeafletMarkerProps to the existing Props type of DriftMarker.
const FixedDriftMarker = DriftMarker as React.ComponentType<ExtractProps<typeof DriftMarker> & LeafletMarkerProps>;

/*  DKDK after testing various approaches, it is found that sending mouse event props from story, like done in previous approach,
 *    seems to conflict with other mouse event like grey-box. Also, using function form of the top-marker event did not work either.
 *    The only way to work it out is to directly set function contents (e.g., e.target....) inside onMouseOver/Out
 *    For this reason, marker's props are adjusted without sending mouse event functions, but implemented here directly.
 */

export default function BoundsDriftMarker({position, bounds, icon, duration}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)
  const { map } = useLeaflet();
  const boundingBox = new LatLngBounds([
      [bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]])

  const handleDoubleClick = () => {
    if (map) {
      map.fitBounds(boundingBox)
    }
  }

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : { };

  return (<FixedDriftMarker
    duration={duration}
    position={position}
    onmouseover={(e: LeafletMouseEvent) => {
      e.target._icon.classList.add('top-marker');     //DKDK marker on top
      setDisplayBounds(true);
    }} // Display bounds rectangle
    onmouseout={(e: LeafletMouseEvent) => {
      e.target._icon.classList.remove('top-marker');  //DKDK remove marker on top
      setDisplayBounds(false);
    }} // Remove bounds rectangle
    {...optionalIconProp}
    ondblclick={() => handleDoubleClick()} > 
    {
      displayBounds
          ? <Rectangle
              bounds={boundingBox}
              color={"gray"}
              weight={1}
            >

            </Rectangle>
          : null

    }
  </FixedDriftMarker>)
}
