import React, {
  ReactElement,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import {
  getSpeciesDonuts,
  getCollectionDateChartMarkers,
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

import geohashAnimation from '../map/animation_functions/geohash';

export default {
  title: 'Map/Marker Selection',
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

// for ChartMarkers
const dropDownProps = {
  dropdownTitle: 'Collection Date',
  dropdownHref: ['#/link-1', '#/link-2', '#/link-3', '#/link-4', '#/link-5'],
  dropdownItemText: ['Year', 'Month', 'Date', 'Hour', 'Minute'],
};

const variableProps = {
  variableLabel: '<b>Collection date</b>',
  quantityLabel: '<b>Record count</b>',
  legendInfoNumberText: 'Collections',
};

export const DonutMarkers: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 16],
    zoom: 4,
  });

  // make an string array state to list highlighted markers
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([]);

  //DKDK
  console.log('selectedMarkers =', selectedMarkers);

  const handleMarkerClick = (e: LeafletMouseEvent) => {};

  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        setLegendData,
        handleMarkerClick,
        // pass selectedMarkers and its setState
        selectedMarkers,
        setSelectedMarkers
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
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        // pass selectedMarkers and its setState
        selectedMarkers={selectedMarkers}
        setSelectedMarkers={setSelectedMarkers}
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

DonutMarkers.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};

export const ChartMarkers: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] =
    useState<string>('Individual');
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 0],
    zoom: 6,
  });

  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };
  const [dependentAxisRange, setDependentAxisRange] = useState<number[]>([
    0, 0,
  ]);

  const legendType = 'numeric';

  const duration = defaultAnimationDuration;

  // make an string array state to list highlighted markers
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([]);

  //DKDK
  console.log('selectedMarkers =', selectedMarkers);

  const handleMarkerClick = (e: LeafletMouseEvent) => {};

  // send legendRadioValue instead of knob_YAxisRangeMethod: also send setYAxisRangeValue
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      // anim add duration & scrambleKeys
      const markers = await getCollectionDateChartMarkers(
        bvp,
        duration,
        setLegendData,
        handleMarkerClick,
        legendRadioValue,
        setDependentAxisRange,
        // pass selectedMarkers and its setState
        selectedMarkers,
        setSelectedMarkers
      );
      setMarkerElements(markers);
    },
    [setMarkerElements, legendRadioValue]
  );

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        showGrid={true}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        // pass selectedMarkers and its setState
        selectedMarkers={selectedMarkers}
        setSelectedMarkers={setSelectedMarkers}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        {...dropDownProps}
        {...variableProps}
        onChange={legendRadioChange}
        selectedOption={legendRadioValue}
        dependentAxisRange={dependentAxisRange}
      />
    </>
  );
};

ChartMarkers.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};
