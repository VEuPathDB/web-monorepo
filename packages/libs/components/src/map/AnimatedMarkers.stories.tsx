import React, { ReactElement, useState, useCallback } from 'react';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport } from './Types';
// import { Tooltip } from 'react-leaflet';
import Geohash from 'latlon-geohash';
import './TempIconHack';
import BoundsDriftMarker, { BoundsDriftMarkerProps } from "./BoundsDriftMarker";
import geohashAnimation from "./animation_functions/geohash";
import md5 from 'md5';
import { zoomLevelToGeohashLevel, defaultAnimationDuration } from './config/map.json';

export default {
  title: 'Map/Animated Markers',
//  component: MapVEuMap,
};


//
// when we implement the donut and histogram markers as DriftMarkers
// maybe we can access the duration from context inside those components
// in the meantime we will have to pass the duration into the getMarkerElements function
//
const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number, duration : number, scrambleKeys: boolean = false) => {
  console.log("I've been triggered with longitude bounds=["+bounds.southWest.lng+" TO "+bounds.northEast.lng+"] and zoom="+zoomLevel);

  let aggsByGeohash = new Map();

  // https://gist.github.com/mathiasbynens/5670917
  // Here’s a 100% deterministic alternative to `Math.random`. Google’s V8 and
  // Octane benchmark suites use this to ensure predictable results.

  let myRandom = (function() {
    var seed = 0x2F6E2B1;
    return function() {
      // Robert Jenkins’ 32 bit integer hash function
      seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
      seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
      seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
      seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
      seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
      seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
      return (seed & 0xFFFFFFF) / 0x10000000;
    };
  }());

  let lats : number[] = [];
  let longs : number[] = [];
  
  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];
  console.log(`geohashlevel ${geohashLevel}`);
  Array(numMarkers).fill(undefined).map(() => {

    // pick a deterministic point anywhere on the globe (hence a large value for numMarkers)
    let lat = -90 + myRandom()*180;
    let long = -180 + myRandom()*360;

    // move some points closer to a randomly picked previous point
    if (lats.length > 0 && myRandom()<0.75) {
      const idx = Math.floor(myRandom()*lats.length);
      lat = lat + (lats[idx]-lat)*0.999;
      long = long + (longs[idx]-long)*0.999;
    }

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-08; // accommodate tiny rounding errors
    
    // is it within the viewport bounds?
    if (lat > south &&
	lat < north &&
	(west < east - lambda ? (long > west && long < east) :
	west > east + lambda ? !(long > east && long < west) : true) ) {
      const geohash : string = Geohash.encode(lat, long, geohashLevel);

      let agg = aggsByGeohash.get(geohash);
      if (agg === undefined) {
	agg = { lat: 0, long: 0, latMin: undefined, latMax: undefined, longMin: undefined, longMax: undefined, count: 0, geohash };
	aggsByGeohash.set(geohash, agg);
      }
      agg.lat = agg.lat + lat;
      agg.long = agg.long + long;
      if (agg.latMin === undefined || lat < agg.latMin) agg.latMin = lat;
      if (agg.longMin === undefined || long < agg.longMin) agg.longMin = long;
      if (agg.latMax === undefined || lat > agg.latMax) agg.latMax = lat;
      if (agg.longMax === undefined || long > agg.longMax) agg.longMax = long;
      
      agg.count++;
    }
    lats.push(lat);
    longs.push(long);
    return undefined
  });

  return Array.from(aggsByGeohash.values()).map((agg) => {
    const meanLat = agg.lat/agg.count;
    const meanLong = agg.long/agg.count;
    const key = scrambleKeys ? md5(agg.geohash).substring(0, zoomLevel) : agg.geohash;
    return <BoundsDriftMarker
        duration={duration}
        id={key}
        key={key}
        position={{ lat: meanLat, lng: meanLong}}
        bounds={{ southWest: { lat: agg.latMin, lng: agg.longMin }, northEast: { lat: agg.latMax, lng: agg.longMax }}}
    />


  })

};

export const GeohashIds = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = defaultAnimationDuration;
  
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration));
  }, [setMarkerElements]);

  return (
    <MapVEuMap
    viewport={{center: [ 20, -3 ], zoom: 3}}
    height="96vh" width="98vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    animation={{
      method: "geohash",
      animationFunction: geohashAnimation,
      duration
    }}
    showGrid={true}
    />
  );
};

export const SlowAnimation = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = 2000;
  
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration));
  }, [setMarkerElements]);

  return (
    <MapVEuMap
      viewport={{center: [ 20, -3 ], zoom: 6}}
      height="96vh" width="98vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
      animation={{
	      method: "geohash",
	      animationFunction: geohashAnimation,
	      duration
      }}
      showGrid={true}
    />
  );
};

export const NoGrid = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = defaultAnimationDuration;
  
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration));
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 20, -3 ], zoom: 6}}
          height="96vh" width="98vw"
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          animation={{
            method: "geohash",
            animationFunction: geohashAnimation,
            duration,
          }}
          showGrid={false}
      />
  );
};



export const NoAnimation = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = defaultAnimationDuration;
  
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration));
  }, [setMarkerElements]);

  return (
    <MapVEuMap
      viewport={{center: [ 20, -3 ], zoom: 6}}
      height="96vh" width="98vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
      animation={null}
      showGrid={true}
    />
  );
};

//
// keys are junk and should not break the animation code
// they should not animate either - just appear/disappear as if animation was off
//
export const ScrambledGeohashIds = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const duration = defaultAnimationDuration;

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration, true));
  }, [setMarkerElements]);

  return (
    <MapVEuMap
    viewport={{center: [ 20, -3 ], zoom: 6}}
    height="96vh" width="98vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    animation={{
      method: "geohash",
      animationFunction: geohashAnimation,
      duration
    }}
    showGrid={true}
    />
  );
};

