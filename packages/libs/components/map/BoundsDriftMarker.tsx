import { Rectangle } from "react-leaflet";
import React, { useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds } from './Types';

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number
}


export default function BoundsDriftMarker({position, bounds, icon, duration}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : { };

  return (<DriftMarker
    duration={duration}
    position={position}
    {...optionalIconProp}
    onMouseOver={() => setDisplayBounds(true)} // Display bounds rectangle
    onMouseOut={() => setDisplayBounds(false)} // Remove bounds rectangle
  >
    {
      displayBounds
          ? <Rectangle
              bounds={[[bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]]}
              color={"gray"}
              weight={1}
            >

            </Rectangle>
          : null

    }
  </DriftMarker>)
}
