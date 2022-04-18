import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import {
  getSpeciesDonuts,
  getSpeciesBasicMarkers,
} from './api/getMarkersFromFixtureData';

import { LeafletMouseEvent } from 'leaflet';
import { Viewport } from '../map/MapVEuMap';

// sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import MapVEuMapSidebar from '../map/MapVEuMapSidebar';
// import legend
import MapVEuLegendSampleList, {
  LegendProps,
} from '../map/MapVEuLegendSampleList';

// anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from '../map/animation_functions/geohash';

export default {
  title: 'Map/Donut Markers',
  component: MapVEuMapSidebar,
} as Meta;

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

const legendType = 'categorical';
const dropdownTitle: string = 'Species';
const dropdownHref: string[] = [
  '#/link-1',
  '#/link-2',
  '#/link-3',
  '#/link-4',
  '#/link-5',
  '#/link-6',
  '#/link-7',
];
const dropdownItemText: string[] = [
  'Locus',
  'Allele',
  'Species',
  'Sample type',
  'Collection Protocol',
  'Project',
  'Protocol',
];
const legendInfoNumberText: string = 'Species';

// a generic function to remove a class: here it is used for removing highlight-marker
function removeClassName(targetClass: string) {
  // much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0];
  if (targetElement != null) {
    targetElement.classList.remove(targetClass);
  }
}

// this onClick event may need to be changed in the future like onMouseOver event
const handleMarkerClick = (e: LeafletMouseEvent) => {
  /**
   * this only works when selecting other marker: not working when clicking map
   * it may be achieved by setting all desirable events (e.g., map click, preserving highlight, etc.)
   * just stop here and leave detailed events to be handled later
   */
  // use a resuable function to remove a class
  removeClassName('highlight-marker');
  e.target._icon.classList.add('highlight-marker');
};

export const AllInOneRequest: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport] = useState<Viewport>({ center: [13, 16], zoom: 4 });
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        setLegendData,
        handleMarkerClick
      );
      setMarkerElements(markers);
    },
    [setMarkerElements]
  );

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>
  );
};

AllInOneRequest.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: true,
};

export const FirstRequest: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData] = useState<LegendProps['data']>([]);
  const [viewport] = useState<Viewport>({ center: [13, 16], zoom: 4 });

  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesBasicMarkers(
        bvp,
        defaultAnimationDuration,
        handleMarkerClick
      );
      setMarkerElements(markers);
    },
    [setMarkerElements]
  );

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>
  );
};

FirstRequest.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: true,
};

export const TwoRequests: Story<MapVEuMapProps> = (args) => {
  // With this approach, the handler simply updates the state `bvp`.
  // The `useEffect` hook runs when the value of `bvp` changes. Within this
  // hook, we use the variable `isCancelled` to determine if `setMarkerElements`
  // should be called. It's possible to get fancier and cancel any in-flight requests,
  // but this will require a bit of refactoring and even more indirection.
  const [bvp, setBvp] = useState<BoundsViewport | null>(null);
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport] = useState<Viewport>({ center: [13, 16], zoom: 4 });

  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      setBvp(bvp);
    },
    [setBvp]
  );

  useEffect(() => {
    // track if effect has been cancelled
    let isCancelled = false;
    if (bvp == null) return;
    // Create an anonymous async function, and call it immediately.
    // This way we can use async-await
    (async () => {
      const markers = await getSpeciesBasicMarkers(
        bvp,
        defaultAnimationDuration,
        handleMarkerClick
      );
      if (!isCancelled) setMarkerElements(markers);
      if (isCancelled) return; // avoid the next request if this effect has already been cancelled
      const fullMarkers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        setLegendData,
        handleMarkerClick,
        2000
      );
      if (!isCancelled) setMarkerElements(fullMarkers);
    })();
    // Cleanup function to set `isCancelled` to `true`
    return () => {
      isCancelled = true;
    };
  }, [bvp]);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>
  );
};

TwoRequests.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: true,
};
