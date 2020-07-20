import React, { ReactElement, useState } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker } from 'react-leaflet';
import Geohash from 'latlon-geohash';

// temporary hack to work-around webpack/leaflet incompatibility
// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
// we will have custom markers soon so no need to worry
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


export default {
  title: 'Animated Markers',
//  component: MapVEuMap,
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

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number) => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);
  let aggsByGeohash = new Map();
  Array(numMarkers).fill(undefined).map(() => {
    const lat = bounds.southWest[0] + Math.random()*(bounds.northEast[0] - bounds.southWest[0]);
    const long = bounds.southWest[1] + Math.random()*(bounds.northEast[1] - bounds.southWest[1]);
    const geohash : string = Geohash.encode(lat, long, zoomLevelToGeohashLevel[zoomLevel]);

    let agg = aggsByGeohash.get(geohash);
    if (agg === undefined) {
      agg = { lat: 0, long: 0, count: 0, geohash };
      aggsByGeohash.set(geohash, agg);
    }
    agg.lat = agg.lat + lat;
    agg.long = agg.long + long;
    agg.count++;
  });
  return Array.from(aggsByGeohash.values()).map((agg) => {
    const meanLat = agg.lat/agg.count;
    const meanLong = agg.long/agg.count;
    return <Marker
      key={agg.geohash}
      position={[meanLat, meanLong]}
      title={agg.geohash}
      />
  })

}



export const GeohashIds = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  return (
    <MapVEuMap
    viewport={{center: [ 54.561781, -3.013297 ], zoom: 11}}
    height="600px" width="800px"
    onViewportChanged={(bvp : BoundsViewport) => setMarkerElements(getMarkerElements(bvp, 500))}
    markers={markerElements}
    />
  );
}

