import {Rectangle, useLeaflet} from "react-leaflet";
import React, { useState } from "react";
//DKDK block this
// import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds } from './Types';
import { LeafletMouseEvent, LatLngBounds } from "leaflet";

//DKDK use require to avoid ts error (technically check...)
const { DriftMarker } = require('leaflet-drift-marker')

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
}

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

  return (<DriftMarker
    duration={duration}
    position={position}
    onMouseOver={(e: LeafletMouseEvent) => {
      e.target._icon.classList.add('top-marker');     //DKDK marker on top
      setDisplayBounds(true);
    }} // Display bounds rectangle
    onMouseOut={(e: LeafletMouseEvent) => {
      e.target._icon.classList.remove('top-marker');  //DKDK remove marker on top
      setDisplayBounds(false);
    }} // Remove bounds rectangle
    {...optionalIconProp}
    onDblClick={() => handleDoubleClick()} > 
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
  </DriftMarker>)
}
