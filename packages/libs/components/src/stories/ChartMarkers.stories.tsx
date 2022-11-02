import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import { Viewport } from '../map/MapVEuMap';
import {
  getCollectionDateChartMarkers,
  getCollectionDateBasicMarkers,
} from './api/getMarkersFromFixtureData';

// change target component
import MapVEuLegendSampleList, {
  LegendProps,
} from '../map/MapVEuLegendSampleList';

// anim
import geohashAnimation from '../map/animation_functions/geohash';
import { MouseMode } from '../map/MouseTools';

import LabelledGroup from '../components/widgets/LabelledGroup';
import { Toggle } from '@veupathdb/coreui';

export default {
  title: 'Map/Chart Markers',
  component: MapVEuMap,
} as Meta;

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

// no op
const handleMarkerClick = () => {};

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

const defaultMouseMode: MouseMode = 'default';

export const AllInOneRequest: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] = useState<string>(
    'Individual'
  );
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 0],
    zoom: 6,
  });

  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };
  const [dependentAxisRange, setDependentAxisRange] = useState<number[]>([
    0,
    0,
  ]);

  const legendType = 'numeric';

  const duration = defaultAnimationDuration;

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
        setDependentAxisRange
      );
      setMarkerElements(markers);
    },
    [setMarkerElements, legendRadioValue]
  );

  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        showGrid={true}
        showMouseToolbar={true}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
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

AllInOneRequest.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: false, // not yet implemented
};

export const TwoRequests: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] = useState<string>(
    'Individual'
  );
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 0],
    zoom: 6,
  });

  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };

  const [bvp, setBvp] = useState<BoundsViewport | null>(null);
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      setBvp(bvp);
    },
    [setBvp]
  );

  const [dependentAxisRange, setDependentAxisRange] = useState<number[]>([
    0,
    0,
  ]);

  const legendType = 'numeric';
  const duration = defaultAnimationDuration;

  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);

  useEffect(() => {
    // track if effect has been cancelled
    let isCancelled = false;
    if (bvp == null) return;
    // Create an anonymous async function, and call it immediately.
    // This way we can use async-await
    (async () => {
      const markers = await getCollectionDateBasicMarkers(
        bvp,
        duration,
        handleMarkerClick
      );
      if (!isCancelled) setMarkerElements(markers);
      if (isCancelled) return; // avoid the next request if this effect has already been cancelled
      const fullMarkers = await getCollectionDateChartMarkers(
        bvp,
        duration,
        setLegendData,
        handleMarkerClick,
        legendRadioValue,
        setDependentAxisRange,
        2000
      );
      if (!isCancelled) setMarkerElements(fullMarkers);
    })();
    // Cleanup function to set `isCancelled` to `true`
    return () => {
      isCancelled = true;
    };
  }, [bvp, legendRadioValue]);

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        showGrid={true}
        showMouseToolbar={true}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
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

TwoRequests.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
  showMouseToolbar: false, // not yet implemented
};

// dependent axis log scale story
export const LogScale: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] = useState<string>(
    'Individual'
  );
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 0],
    zoom: 6,
  });

  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };
  const [dependentAxisRange, setDependentAxisRange] = useState<number[]>([
    0,
    0,
  ]);

  const legendType = 'numeric';

  const duration = defaultAnimationDuration;

  // define mouseMode
  const [mouseMode, setMouseMode] = useState<MouseMode>(defaultMouseMode);
  const [dependentAxisLogScale, setDependentAxisLogScale] = useState(false);

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
        0,
        dependentAxisLogScale
      );
      setMarkerElements(markers);
    },
    [setMarkerElements, legendRadioValue, dependentAxisLogScale]
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
        showMouseToolbar={true}
        animation={defaultAnimation}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
        mouseMode={mouseMode}
        onMouseModeChange={setMouseMode}
      />
      {/* Y-axis range control */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis controls">
          <div style={{ display: 'flex' }}>
            <Toggle
              label={`Log scale ${dependentAxisLogScale ? 'on' : 'off'}`}
              value={dependentAxisLogScale}
              onChange={setDependentAxisLogScale}
            />
          </div>
        </LabelledGroup>
      </div>
    </>
  );
};

LogScale.args = {
  height: '50vh',
  width: '50vw',
  showGrid: true,
  showMouseToolbar: false, // not yet implemented
};
