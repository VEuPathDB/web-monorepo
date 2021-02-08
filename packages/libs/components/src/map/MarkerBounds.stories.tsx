import React, {ReactElement, useCallback, useState} from "react";
import { BoundsViewport } from "./Types";
import MapVEuMap from "./MapVEuMap";
import geohashAnimation from "./animation_functions/geohash";
import testData from '../stories/fixture-data/geoclust-date-binning-testing-all-levels.json';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from "./BoundsDriftMarker";
import { zoomLevelToGeohashLevel, defaultAnimationDuration } from './config/map.json';
import './TempIconHack';

export default {
  title: 'Map/Marker Bounds',
};

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, duration : number) => {
  const { southWest: { lat: swLat, lng: swLng }, northEast : {lat: neLat, lng: neLng} } = bounds
  console.log(`I've been triggered with bounds=[${swLat},${swLng} TO ${neLat},${neLng}] and zoom=${zoomLevel}`);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = (testData as { [key: string]: any })[`geohash_${geohashLevel}`].facets.geo.buckets.filter((bucket: any) => {
    const lat : number = bucket.ltAvg;
    const long : number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-08; // accommodate tiny rounding errors

    return (lat > south &&
	    lat < north &&
	    (west < east - lambda ? (long > west && long < east) :
		    west > east + lambda ? !(long > east && long < west) : true) );
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
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = defaultAnimationDuration;

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
            duration: defaultAnimationDuration,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};

