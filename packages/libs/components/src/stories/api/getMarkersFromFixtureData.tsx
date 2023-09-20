import React from 'react';
import { BoundsViewport, Bounds } from '../../map/Types';
import { allColorsHex, chartMarkerColorsHex } from '../../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../../map/utils/leaflet-geohash';
import DonutMarker, { DonutMarkerProps } from '../../map/DonutMarker';
import ChartMarker from '../../map/ChartMarker';
import { LeafletMouseEvent } from 'leaflet';

function sleep(ms: number): Promise<() => void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getSpeciesDonuts = async (
  { bounds, zoomLevel }: BoundsViewport,
  duration: number,
  setLegendData: (
    legendData: Array<{ label: string; value: number; color: string }>
  ) => void,
  handleMarkerClick: (e: LeafletMouseEvent) => void,
  // add two new props, selectedMarkers and setSelectedMarkers
  selectedMarkers?: string[],
  setSelectedMarkers?: React.Dispatch<React.SetStateAction<string[]>>,
  delay: number = 0,
  zoomLevelToGeohashLevel: (
    zoomLevel: number
  ) => number = leafletZoomLevelToGeohashLevel,
  donutSize: number = 40
) => {
  const geohash_level = zoomLevelToGeohashLevel(zoomLevel);
  delay && (await sleep(delay));
  const response = await fetch('data/geoclust-species-testing-all-levels.json');
  const speciesData = await response.json();

  const buckets = (speciesData as { [key: string]: any })[
    `geohash_${geohash_level}`
  ].facets.geo.buckets.filter((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const long: number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-8; // accommodate tiny rounding errors

    return (
      lat > south &&
      lat < north &&
      (west < east - lambda
        ? long > west && long < east
        : west > east + lambda
        ? !(long > east && long < west)
        : true)
    );
  });

  // make a first pass and calculate the legend totals
  // and rank the species for color assignment
  let speciesToCount = new Map();
  buckets.forEach((bucket: any) => {
    bucket.term.buckets.forEach((bucket: any) => {
      const species = bucket.val;
      let prevCount = speciesToCount.get(species);
      if (prevCount == null) prevCount = 0;
      speciesToCount.set(species, prevCount + bucket.count);
    });
  });

  // sort by the count (Map returns keys in insertion order)
  speciesToCount = new Map(
    Array.from(speciesToCount).sort(([_1, v1], [_2, v2]) =>
      v1 > v2 ? -1 : v2 > v1 ? 1 : 0
    )
  );

  // make the species to color lookup
  const speciesToColor = new Map(
    Array.from(speciesToCount).map(([k, _], index) => {
      if (index < 10) {
        return [k, allColorsHex[index]];
      } else {
        return [k, 'silver'];
      }
    })
  );

  // reformat as legendData
  const legendData = Array.from(speciesToCount.keys()).map((key) => ({
    label: key,
    value: speciesToCount.get(key) || -1,
    color: speciesToColor.get(key) || 'silver',
  }));
  setLegendData(legendData);

  return buckets.map((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const lng: number = bucket.lnAvg;
    const bounds: Bounds = {
      southWest: { lat: bucket.ltMin, lng: bucket.lnMin },
      northEast: { lat: bucket.ltMax, lng: bucket.lnMax },
    };
    let data: DonutMarkerProps['data'] = [];

    bucket.term.buckets.forEach((bucket: any) => {
      const species = bucket.val;
      data.push({
        label: species,
        value: bucket.count,
        color: speciesToColor.get(species) || 'silver',
      });
    });

    // check isAtomic
    let atomicValue =
      bucket.atomicCount && bucket.atomicCount === 1 ? true : false;

    // anim key
    const key = bucket.val;

    return (
      <DonutMarker
        id={key} // anim
        key={key} // anim
        position={{ lat, lng }}
        bounds={bounds}
        data={data}
        isAtomic={atomicValue}
        onClick={handleMarkerClick}
        duration={duration}
        markerScale={donutSize / 40}
        markerLabel={donutSize < 40 ? '' : undefined}
        // pass two new props
        selectedMarkers={selectedMarkers}
        setSelectedMarkers={setSelectedMarkers}
      />
    );
  });
};

export const getSpeciesBasicMarkers = async (
  { bounds, zoomLevel }: BoundsViewport,
  duration: number,
  handleMarkerClick: (e: LeafletMouseEvent) => void
) => {
  const geohash_level = leafletZoomLevelToGeohashLevel(zoomLevel);

  const response = await fetch('data/geoclust-species-testing-all-levels.json');
  const speciesData = await response.json();

  const buckets = (speciesData as { [key: string]: any })[
    `geohash_${geohash_level}`
  ].facets.geo.buckets.filter((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const long: number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-8; // accommodate tiny rounding errors

    return (
      lat > south &&
      lat < north &&
      (west < east - lambda
        ? long > west && long < east
        : west > east + lambda
        ? !(long > east && long < west)
        : true)
    );
  });

  return buckets.map((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const lng: number = bucket.lnAvg;
    const bounds: Bounds = {
      southWest: { lat: bucket.ltMin, lng: bucket.lnMin },
      northEast: { lat: bucket.ltMax, lng: bucket.lnMax },
    };

    // let sum = 0;
    // bucket.term.buckets.forEach((bucket : any) => sum += bucket.count);

    const data: DonutMarkerProps['data'] = [
      {
        label: 'unknown',
        value: bucket.count,
        color: 'white',
      },
    ];

    // check isAtomic
    let atomicValue =
      bucket.atomicCount && bucket.atomicCount === 1 ? true : false;

    // anim key
    const key = bucket.val;

    return (
      <DonutMarker
        id={key} // anim
        key={key} // anim
        position={{ lat, lng }}
        bounds={bounds}
        data={data}
        isAtomic={atomicValue}
        onClick={handleMarkerClick}
        duration={duration}
      />
    );
  });
};

// define bucket prop, which is for buckets[]
interface bucketProps {
  term: {
    between: { count: number };
    after: { count: number };
    before: { count: number };
    buckets: Array<{
      count: number;
      val: string;
    }>;
  };
  atomicCount: number;
  val: string;
  count: number;
  ltAvg: number;
  ltMin: number;
  ltMax: number;
  lnAvg: number;
  lnMin: number;
  lnMax: number;
}

export const getCollectionDateChartMarkers = async (
  { bounds, zoomLevel }: BoundsViewport,
  duration: number,
  setLegendData: (
    legendData: Array<{ label: string; value: number; color: string }>
  ) => void,
  handleMarkerClick: (e: LeafletMouseEvent) => void,
  legendRadioValue: string,
  setDependentAxisRange: (dependentAxisRange: number[]) => void,
  // add two new props, selectedMarkers and setSelectedMarkers
  selectedMarkers?: string[],
  setSelectedMarkers?: React.Dispatch<React.SetStateAction<string[]>>,
  delay: number = 0,
  dependentAxisLogScale?: boolean
) => {
  const geohash_level = leafletZoomLevelToGeohashLevel(zoomLevel);
  delay && (await sleep(delay));
  const response = await fetch(
    'data/geoclust-date-binning-testing-all-levels.json'
  );
  const collectionDateData = await response.json();

  let legendSums: number[] = [];
  let legendLabels: string[] = [];
  let legendColors: string[] = [];
  let yAxisRange: number[] = []; // This sets range to 'local' mode
  let yAxisRangeAll: number[] = [];

  const buckets = (collectionDateData as { [key: string]: any })[
    `geohash_${geohash_level}`
  ].facets.geo.buckets.filter((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const long: number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-8; // accommodate tiny rounding errors

    return (
      lat > south &&
      lat < north &&
      (west < east - lambda
        ? long > west && long < east
        : west > east + lambda
        ? !(long > east && long < west)
        : true)
    );
  });

  // change this to always show Reginal scale value
  yAxisRangeAll = [
    0,
    buckets.reduce((currentMax: number, bucket: bucketProps) => {
      return Math.max(
        currentMax,
        bucket.count -
          bucket.term.before.count -
          bucket.term.after.count -
          bucket.term.between.count, // no data count
        bucket.term.buckets.reduce(
          (currentMax: number, bucket: { count: number; val: string }) =>
            Math.max(currentMax, bucket.count),
          0
        ) // current bucket max value
      );
    }, 0),
  ];
  // set yAxisRange only if Regional
  if (legendRadioValue === 'Regional') {
    yAxisRange = yAxisRangeAll;
  }
  // add setDependentAxisRange: be careful of type of setDependentAxisRange
  setDependentAxisRange(yAxisRangeAll);

  const markers = buckets.map((bucket: bucketProps) => {
    const lat = bucket.ltAvg;
    const lng = bucket.lnAvg;
    const bounds: Bounds = {
      southWest: { lat: bucket.ltMin, lng: bucket.lnMin },
      northEast: { lat: bucket.ltMax, lng: bucket.lnMax },
    };
    let markerData = [];
    let noDataValue: number = 0;
    bucket.term.buckets.forEach(
      (bucket: { count: number; val: string }, index: number) => {
        const start = bucket.val.substring(0, 4);
        const end = parseInt(start, 10) + 3;
        const label = `${start}-${end}`;
        markerData.push({
          label,
          value: bucket.count,
          color: chartMarkerColorsHex[index],
        });

        // sum all counts for legend
        if (legendSums[index] == null) {
          legendSums[index] = 0;
          legendLabels[index] = label;
          legendColors[index] = chartMarkerColorsHex[index];
        }
        legendSums[index] += bucket.count;
      }
    );

    // calculate the number of no data (or data before first bin, or after last bin) and make 6th bar
    noDataValue = bucket.count - bucket.term.between.count;
    markerData.push({
      label: 'noDataOrOutOfBounds',
      value: noDataValue,
      color: 'silver', // fill the last color
    });
    legendLabels[5] = 'no data/out of bounds';
    if (legendSums[5] == null) legendSums[5] = 0;
    legendSums[5] += noDataValue;
    legendColors[5] = 'silver';

    // check isAtomic for push pin for chart marker
    let atomicValue =
      bucket.atomicCount && bucket.atomicCount === 1 ? true : false;

    // anim key
    const key = bucket.val;

    const yAxisRangeValue = yAxisRange.length ? yAxisRange : null;

    // BM: important to provide the key 'prop' (which is not a true prop) at
    // this outermost level
    return (
      <ChartMarker
        borderColor={'#AAAAAA'}
        borderWidth={3.5}
        id={key}
        key={key}
        position={{ lat, lng }}
        bounds={bounds}
        data={markerData}
        isAtomic={atomicValue}
        // dependentAxisRange is an object with {min,max} (NumberRange)
        dependentAxisRange={
          yAxisRangeValue
            ? { min: yAxisRangeValue[0], max: yAxisRangeValue[1] }
            : null
        }
        duration={duration}
        onClick={handleMarkerClick}
        dependentAxisLogScale={dependentAxisLogScale}
        // pass two new props
        selectedMarkers={selectedMarkers}
        setSelectedMarkers={setSelectedMarkers}
      />
    );
  });

  const legendData = legendSums.map((count, index) => {
    return {
      label: legendLabels[index],
      value: count,
      color: legendColors[index],
    };
  });
  setLegendData(legendData);

  return markers;
};

export const getCollectionDateBasicMarkers = async (
  { bounds, zoomLevel }: BoundsViewport,
  duration: number,
  handleMarkerClick: (e: LeafletMouseEvent) => void
) => {
  const geohash_level = leafletZoomLevelToGeohashLevel(zoomLevel);
  const response = await fetch(
    'data/geoclust-date-binning-testing-all-levels.json'
  );
  const collectionDateData = await response.json();

  const buckets = (collectionDateData as { [key: string]: any })[
    `geohash_${geohash_level}`
  ].facets.geo.buckets.filter((bucket: any) => {
    const lat: number = bucket.ltAvg;
    const long: number = bucket.lnAvg;

    const south = bounds.southWest.lat;
    const north = bounds.northEast.lat;
    const west = bounds.southWest.lng;
    const east = bounds.northEast.lng;
    const lambda = 1e-8; // accommodate tiny rounding errors

    return (
      lat > south &&
      lat < north &&
      (west < east - lambda
        ? long > west && long < east
        : west > east + lambda
        ? !(long > east && long < west)
        : true)
    );
  });

  // go through all buckets to get sum(count) of each bucket and make a single barchart value (color white)
  const markers = buckets.map((bucket: bucketProps) => {
    const lat = bucket.ltAvg;
    const lng = bucket.lnAvg;
    const bounds: Bounds = {
      southWest: { lat: bucket.ltMin, lng: bucket.lnMin },
      northEast: { lat: bucket.ltMax, lng: bucket.lnMax },
    };

    // check isAtomic for push pin for chart marker
    const atomicValue =
      bucket.atomicCount && bucket.atomicCount === 1 ? true : false;

    // anim key
    const key = bucket.val;

    // BM: important to provide the key 'prop' (which is not a true prop) at
    // this outermost level
    return (
      <ChartMarker
        borderColor={'#AAAAAA'}
        borderWidth={3.5}
        id={key}
        key={key}
        position={{ lat, lng }}
        bounds={bounds}
        data={[
          {
            label: 'count',
            value: bucket.count,
            color: 'white',
          },
        ]}
        isAtomic={atomicValue}
        // change to dependentAxisRange
        dependentAxisRange={null}
        duration={duration}
        onClick={handleMarkerClick}
      />
    );
  });

  return markers;
};
