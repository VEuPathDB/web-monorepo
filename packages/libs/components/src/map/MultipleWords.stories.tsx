import React, {ReactElement, useCallback, useState} from "react";
import {BoundsViewport, MarkerProps} from "./Types";
import MapVEuMap from "./MapVEuMap";
import geohashAnimation from "./animation_functions/geohash";
import testData from './test-data/geoclust-date-binning-testing-all-levels.json';
import testDataStraddling from './test-data/geoclust-date-dateline-straddling-all-levels.json';
import BoundsDriftMarker from "./BoundsDriftMarker";
import { zoomLevelToGeohashLevel, defaultAnimationDuration } from './config/map.json';
import './TempIconHack';

export default {
  title: 'DK multiple worlds/Marker Bounds',
};

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, duration : number, data = testData) => {
  const { southWest: { lat: swLat, lng: swLng }, northEast : {lat: neLat, lng: neLng} } = bounds
  console.log(`I've been triggered with bounds=[${swLat},${swLng} TO ${neLat},${neLng}] and zoom=${zoomLevel}`);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = (data as { [key: string]: any })[`geohash_${geohashLevel}`].facets.geo.buckets.filter((bucket: any) => {
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
  const duration = defaultAnimationDuration;

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, duration));
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 0, 0 ], zoom: 2}}
          height="100vh" width="100vw"
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          animation={{
            method: "geohash",
            duration: defaultAnimationDuration,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};


export const DatelineData = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const duration = defaultAnimationDuration;

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, duration, testDataStraddling));
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 0, 0 ], zoom: 2}}
          height="100vh" width="100vw"
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          animation={{
            method: "geohash",
            duration: defaultAnimationDuration,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};


