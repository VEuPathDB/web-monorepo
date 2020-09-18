import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Tooltip } from 'react-leaflet';
import Geohash from 'latlon-geohash';
import './TempIconHack';
import {DriftMarker} from "leaflet-drift-marker";


export default {
  title: 'Animated Markers',
//  component: MapVEuMap,
};

const maxGeohashLevel = 7;
const zoomLevelToGeohashLevel = [
  1, // 0
  1, // 1
  1, // 2
  1, // 3
  2, // 4
  2, // 5
  2, // 6
  3, // 7
  3, // 8
  3, // 9
  4, // 10
  4, // 11
  4, // 12
  5, // 13
  5, // 14
  5, // 15
  6, // 16
  6, // 17
  7  // 18
];

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number) => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);

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

  Array(numMarkers).fill(undefined).map(() => {
    const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

    // pick a deterministic point anywhere on the globe (hence a large value for numMarkers)
    let lat = -90 + myRandom()*180;
    let long = -180 + myRandom()*360;

    // move some points closer to a randomly picked previous point
    if (lats.length > 0 && myRandom()<0.75) {
      const idx = Math.floor(myRandom()*lats.length);
      lat = lat + (lats[idx]-lat)*0.999;
      long = long + (longs[idx]-long)*0.999;
    }
    
    // is it within the viewport bounds?
    if (lat > bounds.southWest[0] &&
	lat < bounds.northEast[0] &&
	long > bounds.southWest[1] &&
	long < bounds.northEast[1]) {
      const geohash : string = Geohash.encode(lat, long, geohashLevel);

      let agg = aggsByGeohash.get(geohash);
      if (agg === undefined) {
	agg = { lat: 0, long: 0, count: 0, geohash };
	aggsByGeohash.set(geohash, agg);
      }
      agg.lat = agg.lat + lat;
      agg.long = agg.long + long;
      agg.count++;
    }
    lats.push(lat);
    longs.push(long);
    return undefined
  });

  return Array.from(aggsByGeohash.values()).map((agg) => {
    const meanLat = agg.lat/agg.count;
    const meanLong = agg.long/agg.count;
    return <DriftMarker
        duration={300}
        key={agg.geohash}
        position={[meanLat, meanLong]}>
        <Tooltip>
          <span>{`key: ${agg.geohash}`}</span><br/>
	  <span>{`#aggregated: ${agg.count}`}</span><br/>
          <span>{`lat: ${meanLat}`}</span><br/>
          <span>{`lon: ${meanLong}`}</span>
        </Tooltip>
      </DriftMarker>

  })

};



export const GeohashIds = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000));
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 20, -3 ], zoom: 6}}
    height="96vh" width="98vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    setMarkerElements={setMarkerElements}
    />
  );
};



//
// the point of this story is to make it easier to find the
// 'egy' marker
// which aggregates/represents two data points
// (you may need to drag the storybook panel down to make the map bigger)
//
// You can move it close to the edge of the screen
// (so that one of its points would drop off the screen)
// to see how its position (correctly) changes and the
// tooltip now shows just one data point represented (correctly).
//
export const EdgeCase = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000));
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 21.5, -1.5 ], zoom: 9}}
    height="96vh" width="98vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    setMarkerElements={setMarkerElements}
    />
  );
};


