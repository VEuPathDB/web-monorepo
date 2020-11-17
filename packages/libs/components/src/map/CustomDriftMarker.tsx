import {LatLngBounds, Rectangle, Tooltip} from "react-leaflet";
import React, {useState} from "react";
import {DriftMarker} from "leaflet-drift-marker";

interface CustomDriftMarkerProps {
  bounds: LatLngBounds,
  ltAvg: number,
  lnAvg: number,
  val: number,
  count: number
  duration: number
}


export default function CustomDriftMarker({bounds, ltAvg, lnAvg, val, count, duration}: CustomDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)

  return (<DriftMarker
    duration={duration}
    position={[ltAvg, lnAvg]}
    onMouseOver={() => setDisplayBounds(true)} // Display bounds rectangle
    onMouseOut={() => setDisplayBounds(false)} // Remove bounds rectangle
  >
    <Tooltip>
      <span>{`key: ${val}`}</span><br/>
      <span>{`#aggregated: ${count}`}</span><br/>
      <span>{`lat: ${ltAvg}`}</span><br/>
      <span>{`lon: ${lnAvg}`}</span>
    </Tooltip>
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