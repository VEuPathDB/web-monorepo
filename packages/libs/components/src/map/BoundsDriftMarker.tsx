import {Rectangle, useLeaflet} from "react-leaflet";
import React, { useState } from "react";
import { DriftMarker } from "leaflet-drift-marker";
import { MarkerProps, Bounds } from './Types';
import {LatLngBounds} from "leaflet";

export interface BoundsDriftMarkerProps extends MarkerProps {
  bounds: Bounds,
  duration: number,
  zoomLevel: number
}


export default function BoundsDriftMarker({position, bounds, icon, duration, zoomLevel}: BoundsDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)
  const { map } = useLeaflet();
  const boundingBox = new LatLngBounds([
      [bounds.southWest.lat, bounds.southWest.lng], [bounds.northEast.lat, bounds.northEast.lng]])

  // DriftMarker misbehaves if icon=undefined is provided
  // is this the most elegant way?
  const optionalIconProp = icon ? { icon } : { };

  const HandleDoubleClick = () => {
    const boundingBoxCenter = boundingBox.getCenter()
    if (map) {
      map.setView([boundingBoxCenter.lat, boundingBoxCenter.lng], zoomLevel+2)
    }
  }

  return (<DriftMarker
    duration={duration}
    position={position}
    {...optionalIconProp}
    onMouseOver={() => setDisplayBounds(true)} // Display bounds rectangle
    onMouseOut={() => setDisplayBounds(false)} // Remove bounds rectangle
    onDblClick={() => HandleDoubleClick()}
  >
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
