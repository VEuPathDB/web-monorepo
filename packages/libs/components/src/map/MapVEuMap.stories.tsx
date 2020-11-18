import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker } from 'react-leaflet';
import './TempIconHack';


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
    const lat = bounds.southWest.lat + Math.random()*(bounds.northEast.lat - bounds.southWest.lat);
    const long = bounds.southWest.lng + Math.random()*(bounds.northEast.lng - bounds.southWest.lng);
    return <Marker
      key={`marker_${index}`}
      position={[lat, long]}
    />
  });
}


export const Basic = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 10));
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
    height="600px" width="800px"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    animation={null}
    showGrid={true}
    />
  );
}

