import React, { ReactElement, useState, useCallback, useEffect } from 'react';
// import { withKnobs, radios , boolean, number } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from '../map/MapVEuMap';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map.json';
import {
  getCollectionDateChartMarkers,
  getCollectionDateBasicMarkers,
} from './api/getMarkersFromFixtureData';

//DKDK change target component
import MapVEuLegendSampleList, {
  LegendProps,
} from '../map/MapVEuLegendSampleList';

//DKDK anim
import geohashAnimation from '../map/animation_functions/geohash';

export default {
  title: 'Map/Chart Markers',
  component: MapVEuMap,
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

export const AllInOneRequest = () => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] = useState<string>(
    'Individual'
  );

  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };
  const [yAxisRangeValue, setYAxisRangeValue] = useState<number>(0);

  const legendType = 'numeric';

  const duration = defaultAnimationDuration;

  //DKDK send legendRadioValue instead of knob_YAxisRangeMethod: also send setYAxisRangeValue
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      //DKDK anim add duration & scrambleKeys
      const markers = await getCollectionDateChartMarkers(
        bvp,
        duration,
        setLegendData,
        handleMarkerClick,
        legendRadioValue,
        setYAxisRangeValue
      );
      setMarkerElements(markers);
    },
    [setMarkerElements, legendRadioValue]
  );

  return (
    <>
      <MapVEuMap
        viewport={{ center: [13, 0], zoom: 6 }}
        height="100vh"
        width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: 'geohash',
          animationFunction: geohashAnimation,
          duration,
        }}
        showGrid={true}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        {...dropDownProps}
        {...variableProps}
        onChange={legendRadioChange}
        selectedOption={legendRadioValue}
        yAxisRangeValue={yAxisRangeValue}
      />
    </>
  );
};

export const TwoRequests = () => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] = useState<string>(
    'Individual'
  );
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

  const [yAxisRangeValue, setYAxisRangeValue] = useState<number>(0);

  const legendType = 'numeric';
  const duration = defaultAnimationDuration;

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
        setYAxisRangeValue,
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
        viewport={{ center: [13, 0], zoom: 6 }}
        height="100vh"
        width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: 'geohash',
          animationFunction: geohashAnimation,
          duration,
        }}
        showGrid={true}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        {...dropDownProps}
        {...variableProps}
        onChange={legendRadioChange}
        selectedOption={legendRadioValue}
        yAxisRangeValue={yAxisRangeValue}
      />
    </>
  );
};
