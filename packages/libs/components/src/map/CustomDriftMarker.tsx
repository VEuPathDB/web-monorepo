import {Rectangle, Tooltip} from "react-leaflet";
import React, {useState} from "react";
import {DriftMarker} from "leaflet-drift-marker";

interface BucketObject {
  ltAvg: number,
  lnAvg: number,
  val: number,
  count: number,
  ltMin: number,
  ltMax: number,
  lnMin: number,
  lnMax: number
}

interface CustomDriftMarkerProps {
  bucket: BucketObject,
  duration: number
}


export default function CustomDriftMarker({bucket, duration}: CustomDriftMarkerProps) {
  const [displayBounds, setDisplayBounds] = useState<boolean>(false)

  return (<DriftMarker
    duration={duration}
    position={[bucket.ltAvg, bucket.lnAvg]}
    onMouseOver={() => setDisplayBounds(true)} // Display bounds rectangle
    onMouseOut={() => setDisplayBounds(false)} // Remove bounds rectangle
  >
    <Tooltip>
      <span>{`key: ${bucket.val}`}</span><br/>
      <span>{`#aggregated: ${bucket.count}`}</span><br/>
      <span>{`lat: ${bucket.ltAvg}`}</span><br/>
      <span>{`lon: ${bucket.lnAvg}`}</span>
    </Tooltip>
    {
      displayBounds
          ? <Rectangle
              bounds={[[bucket.ltMin, bucket.lnMax], [bucket.ltMax, bucket.lnMin]]}
              color={"gray"}
              weight={1}
            >

            </Rectangle>
          : null

    }
  </DriftMarker>)
}