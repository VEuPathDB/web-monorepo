// to check flyTo functionality at map

import React, {
  ReactElement,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import { getSpeciesDonuts } from './api/getMarkersFromFixtureData';

import { LeafletMouseEvent } from 'leaflet';
import { Viewport } from '../map/MapVEuMap';

// sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
// import legend
import MapVEuLegendSampleList, {
  LegendProps,
} from '../map/MapVEuLegendSampleList';

import geohashAnimation from '../map/animation_functions/geohash';
// import PlotRef
import { PlotRef } from '../types/plots';
import SemanticMarkers from '../map/SemanticMarkers';

export default {
  title: 'Map/Map ref related',
  component: MapVEuMap,
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

export const MapFlyTo: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  // starting from world map to check FlyTo functionality
  const [viewport, setViewport] = useState<Viewport>({
    center: [0, 0],
    zoom: 2,
  });
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
        onViewportChanged={setViewport}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      >
        <SemanticMarkers
          onBoundsChanged={handleViewportChanged}
          markers={markerElements}
          animation={defaultAnimation}
          // pass FlyTo
          flyToMarkers={true}
          // set a bit longer delay for a demonstrate purpose at story
          flyToMarkersDelay={2000}
        />
      </MapVEuMap>
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

MapFlyTo.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};

export const MapThumbnail: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 16],
    zoom: 4,
  });
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

  const ref = useRef<PlotRef>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    ref.current
      // use height: 250, width: 500 below to see exact map's screenshot but too slow for decoding
      // thus smaller size of the screenshot is instead used for demo purpose now
      // by doing this, map is partially captured using smaller size
      // ?.toImage({ format: 'jpeg', height: 250, width: 500 })
      ?.toImage({ format: 'jpeg', height: 100, width: 200 })
      .then((src) => setImg(src));
  }, [markerElements]);

  return (
    <>
      <h4>Map</h4>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        // pass ref
        ref={ref}
      >
        <SemanticMarkers
          onBoundsChanged={handleViewportChanged}
          markers={markerElements}
          animation={defaultAnimation}
        />
      </MapVEuMap>
      <br />
      <br />
      <h4>Partial screenshot</h4>
      <img src={img} />
    </>
  );
};

MapThumbnail.args = {
  height: '250px',
  width: '500px',
  showGrid: true,
};

// testing the changes of viewport and baselayer
export const ChangeViewportAndBaseLayer: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  // starting from world map to check FlyTo functionality
  // set setViewport setState() to  test onViewportChanged
  const [viewport, setViewport] = useState<Viewport>({
    center: [0, 0],
    zoom: 2,
  });
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

  // change base layer
  const [baseLayer, setBaseLayer] = useState<any>('Terrain');

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        baseLayer={baseLayer}
        onBaseLayerChanged={setBaseLayer}
      >
        <SemanticMarkers
          onBoundsChanged={handleViewportChanged}
          markers={markerElements}
          animation={defaultAnimation}
          flyToMarkers={true}
          // set a bit longer delay for a demonstrate purpose at story
          flyToMarkersDelay={2000}
        />
      </MapVEuMap>
    </>
  );
};

ChangeViewportAndBaseLayer.args = {
  height: '50vh',
  width: '50vw',
  showGrid: true,
};
