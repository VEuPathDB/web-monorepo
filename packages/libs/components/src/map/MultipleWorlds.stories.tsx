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
  title: 'Map/Multiple Worlds',
};

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, duration : number, data = testData) => {
  const { southWest: { lat: south, lng: west }, northEast : {lat: north, lng: east} } = bounds
  console.log(`I've been triggered with long bounds=[${west} TO ${east}] and zoom=${zoomLevel}`);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];
  // filter data taking care of both east<west and east>west possibilities
  const buckets = (data as { [key: string]: any })[`geohash_${geohashLevel}`].facets.geo.buckets.filter((bucket: any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    const lambda = 1e-08; // accommodate tiny rounding errors
    if (west < east - lambda) {
      return ltAvg > south &&
	     ltAvg < north &&
	     lnAvg > west &&
	     lnAvg < east
    } if (west > east + lambda) {
      return ltAvg > south &&
	     ltAvg < north &&
	     !(lnAvg > east && lnAvg < west)
    } else {
      return true
    }
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


