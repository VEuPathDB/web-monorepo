import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import BarMarker from './BarMarker'; // TO BE CREATED

export default {
  title: 'Bar Markers',
  component: MapVEuMap,
};

/*
   This is a trivial marker data generator.  It returns 10 random points within the given bounds.
   The real thing should something with zoomLevel.
*/
const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number, numCategories : number, library: 'highcharts' | 'plotly') => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);
  return Array(numMarkers).fill(undefined).map((_, index) => {
    const lat = bounds.southWest[0] + Math.random()*(bounds.northEast[0] - bounds.southWest[0]);
    const long = bounds.southWest[1] + Math.random()*(bounds.northEast[1] - bounds.southWest[1]);

    const labels = Array(numCategories).fill(0).map((_, index) => 'category_'+index);
    const values = Array(numCategories).fill(0).map(() => Math.floor(Math.random()*100.0));

    return <BarMarker
      key={`marker_${index}`}
      id={`marker_${index}`}
      position={[lat, long]}
      labels={labels}
      values={values}
      yRange={[0, 100]}
      type='bar'
      library={library}
    />
  });
}


export const ThreeCategoriesHighcharts = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 10, 3, 'highcharts'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}

export const ThreeCategories100Highcharts = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100, 3, 'highcharts'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}


export const FiveCategories100Highcharts = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100, 5, 'highcharts'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}

export const ThreeCategoriesPlotly = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 10, 3, 'plotly'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}

export const ThreeCategories100Plotly = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100, 3, 'plotly'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}


export const FiveCategories100Plotly = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100, 5, 'plotly'));
  }, [setMarkerElements])

  return (
    <MapVEuMap
      viewport={{center: [ 54.561781, -3.143297 ], zoom: 12}}
      height="100vh" width="100vw"
      onViewportChanged={handleViewportChanged}
      markers={markerElements}
    />
  );
}
