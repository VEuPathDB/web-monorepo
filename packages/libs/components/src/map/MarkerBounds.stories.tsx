import React, {ReactElement, useCallback, useState} from "react";
import {BoundsViewport, MarkerProps} from "./Types";
import MapVEuMap from "./MapVEuMap";
import geohashAnimation from "./animation_functions/geohash";
import testData from './test-data/geoclust-date-binning-testing-all-levels.json';
import BoundsDriftMarker from "./BoundsDriftMarker";
import './TempIconHack';

export default {
  title: 'Marker Bounds',
};

const zoomLevelToGeohashLevel = [
  1, // 0
  1, // 1
  1, // 2
  2, // 3
  2, // 4
  2, // 5
  3, // 6
  3, // 7
  3, // 8
  4, // 9
  4, // 10
  4, // 11
  5, // 12
  5, // 13
  5, // 14
  6, // 15
  6, // 16
  6, // 17
  7  // 18
];

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, duration : number) => {
  const { southWest: { lat: swLat, lng: swLng }, northEast : {lat: neLat, lng: neLng} } = bounds
  console.log(`I've been triggered with bounds=[${swLat},${swLng} TO ${neLat},${neLng}] and zoom=${zoomLevel}`);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = (testData as { [key: string]: any })[`geohash_${geohashLevel}`].facets.geo.buckets.filter((bucket: any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    return ltAvg > bounds.southWest.lat &&
	   ltAvg < bounds.northEast.lat &&
	   lnAvg > bounds.southWest.lng &&
	   lnAvg < bounds.northEast.lng
  });
  
  return buckets.map((bucket : any) => {
    if (bucket.val.length == geohashLevel) {
      return (
        <BoundsDriftMarker
          duration={duration}
          bounds={{ southWest: { lat: bucket.ltMin, lng: bucket.lnMin }, northEast: { lat: bucket.ltMax, lng: bucket.lnMax }}} 
	  position={{ lat: bucket.ltAvg, lng: bucket.lnAvg }}
          id={bucket.val}
          key={bucket.val}
        />
        )
    }
  })
};

export const MarkerBounds = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const duration = 300;

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, duration));
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 10, -3 ], zoom: 5}}
          height="96vh" width="98vw"
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          animation={{
            method: "geohash",
            duration: 300,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};
