import { ReactElement, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import {
  leafletZoomLevelToGeohashLevel,
  tinyLeafletZoomLevelToGeohashLevel,
} from '../map/utils/leaflet-geohash';
import { getSpeciesDonuts } from './api/getMarkersFromFixtureData';

import { LeafletMouseEvent } from 'leaflet';
import { Viewport } from 'react-leaflet';

// sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import MapVEuMapSidebar from '../map/MapVEuMapSidebar';
// import legend
import MapVEuLegendSampleList, {
  LegendProps,
} from '../map/MapVEuLegendSampleList';
import { Checkbox } from '@material-ui/core';

import geohashAnimation from '../map/animation_functions/geohash';
import { MouseMode } from '../map/MouseTools';

export default {
  title: 'Map/General',
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
  // native manner, but not React style? Either way this is arguably the simplest solution
  e.target._icon.classList.add('highlight-marker');
  // here, perhaps we can add additional click event, like opening sidebar when clicking
};

const defaultMouseMode: MouseMode = 'default';

export const Spinner: Story<MapVEuMapProps> = (args) => {
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
  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
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

Spinner.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: true,
  showSpinner: true,
};

export const NoDataOverlay: Story<MapVEuMapProps> = (args) => {
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
  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
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

NoDataOverlay.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: true,
  showNoDataOverlay: true,
};

export const Windowed: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport] = useState<Viewport>({ center: [2, 16], zoom: 4 });
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
  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
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

Windowed.args = {
  height: 500,
  width: 700,
  style: {
    marginTop: 100,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  showGrid: true,
  showMouseToolbar: true,
};

export const Tiny: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport] = useState<Viewport>({ center: [8, 10], zoom: 2 });
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        setLegendData,
        handleMarkerClick,
        0,
        tinyLeafletZoomLevelToGeohashLevel,
        20
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
        zoomLevelToGeohashLevel={tinyLeafletZoomLevelToGeohashLevel}
      />
    </>
  );
};

Tiny.args = {
  height: 110,
  width: 220,
  style: {
    marginTop: 100,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  showGrid: false,
  showMouseToolbar: false,
  showScale: false,
  showLayerSelector: false,
  showAttribution: false,
  showZoomControl: false,
};

export const ScrollAndZoom: Story<MapVEuMapProps> = (args) => {
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

  // add useState for controlling scroll and zoom
  const [mapScroll, setMapScroll] = useState<boolean>(false);
  const textSize = '1.0em';

  return (
    <>
      <div
        style={{
          // height: 500,
          display: 'flex',
          flexDirection: 'column',
          width: 700,
          marginTop: 100,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <label
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontSize: textSize,
            color: '',
            // add this for general usage (e.g., story)
            margin: 0,
          }}
        >
          <Checkbox
            color={'primary'}
            checked={mapScroll}
            onChange={() => setMapScroll(!mapScroll)}
          />
          Scroll and Zoom
        </label>
        <MapVEuMap
          {...args}
          viewport={viewport}
          onBoundsChanged={handleViewportChanged}
          markers={markerElements}
          animation={defaultAnimation}
          zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
          scrollingEnabled={mapScroll}
        />
      </div>
    </>
  );
};

ScrollAndZoom.args = {
  height: 500,
  width: 700,
  style: {
    // marginTop: 100,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  showGrid: true,
  showMouseToolbar: true,
};
