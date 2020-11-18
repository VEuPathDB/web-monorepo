import { Rectangle } from "react-leaflet";
import React, { useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps } from './Types';
import { LatLngBoundsLiteral } from 'leaflet';

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: LatLngBoundsLiteral,
  duration: number
}


export default function BoundsDriftMarker({position, bounds, icon, duration}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)

  return (<DriftMarker
    duration={duration}
    position={position}
    icon={icon}
    onMouseOver={() => setDisplayBounds(true)} // Display bounds rectangle
    onMouseOut={() => setDisplayBounds(false)} // Remove bounds rectangle
  >
    {
      displayBounds
          ? <Rectangle
              bounds={bounds}
              color={"gray"}
              weight={1}
            >

            </Rectangle>
          : null

    }
  </DriftMarker>)
}
