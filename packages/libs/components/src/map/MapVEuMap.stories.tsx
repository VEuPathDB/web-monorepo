import React, { ReactElement, useState } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker } from 'react-leaflet';

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
  title: 'Map',
  component: MapVEuMap,
};


/*
   This is a trivial marker data generator.  It returns 10 random points within the given bounds.
   The real thing should something with zoomLevel.
*/
const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number) => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);
  return Array(numMarkers).fill(undefined).map((_, index) => {
    const lat = bounds.southWest[0] + Math.random()*(bounds.northEast[0] - bounds.southWest[0]);
    const long = bounds.southWest[1] + Math.random()*(bounds.northEast[1] - bounds.southWest[1]);
    return <Marker
      key={`marker_${index}`}
      position={[lat, long]}
    />
  });
}


export const Basic = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  return (
    <MapVEuMap
    viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
    height="600px" width="800px"
    onViewportChanged={(bvp : BoundsViewport) => setMarkerElements(getMarkerElements(bvp, 10))}
    markers={markerElements}
    />
  );
}

