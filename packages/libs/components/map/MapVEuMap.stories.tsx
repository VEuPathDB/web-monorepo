import React, { useState } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerData, MarkerProps, FancyMarkerProps } from './Types';
import { Marker } from 'react-leaflet';
import FancyMarker from './FancyMarker';


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
const getMarkerData = ({ bounds, zoomLevel }: BoundsViewport) => {
  // marker data has to be empty because we don't
  // know the map bounds until the map is rendered
  // (particularly in full screen deployments)
  let markerData : MarkerData = {
    markers : []
  }
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);
  const numMarkers = 10;
  for (var i=0; i<numMarkers; i++) {
    const lat = bounds.southWest[0] + Math.random()*(bounds.northEast[0] - bounds.southWest[0]);
    const long = bounds.southWest[1] + Math.random()*(bounds.northEast[1] - bounds.southWest[1]);
    if (Math.random() < 0.5) { // basic Marker
      markerData.markers.push(
	{
	  props: { key: 'marker'+i,
		   position: [ lat, long ]
          } as MarkerProps,
	  component: Marker
      });
    } else {  // make a FancyMarker
      markerData.markers.push(
	{
	  props: { key: 'fancymarker'+i,
		   position: [ lat, long ],
		   opacity: 0.25
          } as FancyMarkerProps,
	  component: FancyMarker
      });
    }
  }
  // replace old markers with these new ones
  return markerData;
}


export const Basic = () => {
  const [ markerData, setMarkerData ] = useState<MarkerData>({ markers: [] });
  return (
    <MapVEuMap
    viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
    height="600px" width="800px"
    onViewportChanged={(bvp : BoundsViewport) => setMarkerData(getMarkerData(bvp))}
    markerData={markerData}
    />
  );
}

