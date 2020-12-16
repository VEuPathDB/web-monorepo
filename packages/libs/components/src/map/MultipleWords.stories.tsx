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
  const { southWest: { lat: south, lng: west }, northEast : {lat: north, lng: east} } = bounds
  console.log(`I've been triggered with bounds=[${south},${west} TO ${north},${east}] and zoom=${zoomLevel}`);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

  let newEast = east;
  let newWest = west;
  // put longitude bounds within normal -180 to 180 range
  while (newEast > 180) {
    newEast -= 360
  }
  while (newWest < -180) {
    newWest += 360
  }
  console.log(`New long bounds are [${newWest} TO ${newEast}]`);
  
  const buckets = (data as { [key: string]: any })[`geohash_${geohashLevel}`].facets.geo.buckets.filter((bucket: any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    const lambda = 1e-08; // accommodate tiny rounding errors
    if (newWest < newEast - lambda) {
      return ltAvg > south &&
	     ltAvg < north &&
	     lnAvg > newWest &&
	     lnAvg < newEast
    } if (newWest > newEast + lambda) {
      return ltAvg > south &&
	     ltAvg < north &&
	     !(lnAvg > newEast && lnAvg < newWest)
    } else {
      return true
    }
  });

  return buckets.map((bucket : any) => {
    if (bucket.val.length == geohashLevel) {
      let newLn = bucket.lnAvg;
      let newLnMax = bucket.lnMax;
      let newLnMin = bucket.lnMin;
      while (newLn > east) {
	newLn -= 360;
	newLnMax -= 360;
	newLnMin -= 360;
      }
      while (newLn < west) {
	newLn += 360;
	newLnMax += 360;
	newLnMin += 360;
      }
      return (
	<BoundsDriftMarker
          duration={duration}
          bounds={{ southWest: { lat: bucket.ltMin, lng: newLnMin }, northEast: { lat: bucket.ltMax, lng: newLnMax }}}
          position={{ lat: bucket.ltAvg, lng: newLn }}
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


