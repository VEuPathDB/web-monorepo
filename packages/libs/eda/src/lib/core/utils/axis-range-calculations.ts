import { PromiseHookState } from '../hooks/promise';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import { HistogramDataWithCoverageStatistics } from '../components/visualizations/implementations/HistogramVisualization';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import { BarplotDataWithStatistics } from '../components/visualizations/implementations/BarplotVisualization';
import { BoxplotDataWithCoverage } from '../components/visualizations/implementations/BoxplotVisualization';
import { min, max, map } from 'lodash';
import { Variable } from '../types/study';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { VariableMapping } from '../api/DataClient/types';

// calculate min/max of default independent axis range
export function histogramDefaultIndependentAxisMinMax(
  data: PromiseHookState<HistogramDataWithCoverageStatistics | undefined>
) {
  if (isFaceted(data.value)) {
    const facetMinMaxes =
      data?.value?.facets != null
        ? data.value.facets
            .map((facet) => facet.data)
            .filter(
              (data): data is HistogramData =>
                data != null && data.series != null
            )
            .map((data) => findIndependentAxisMinMax(data.series))
        : undefined;

    return (
      facetMinMaxes && {
        min: min(map(facetMinMaxes, 'min')),
        max: max(map(facetMinMaxes, 'max')),
      }
    );
  } else {
    return data.value && data.value.series.length > 0
      ? findIndependentAxisMinMax(data.value.series)
      : undefined;
  }
}

/**
 * Calculate min (actually minPos, nonzero) and max of histogram counts,
 * taking into account that they may be stacked (when there's an overlay)
 */
export function histogramDefaultDependentAxisMinMax(
  data: PromiseHookState<HistogramDataWithCoverageStatistics | undefined>
) {
  if (isFaceted(data.value)) {
    const facetMinMaxes =
      data?.value?.facets != null
        ? data.value.facets
            .map((facet) => facet.data)
            .filter(
              (data): data is HistogramData =>
                data != null && data.series != null
            )
            .map((data) => findMinMaxOfStackedArray(data.series))
        : undefined;
    return (
      facetMinMaxes && {
        min: min(map(facetMinMaxes, 'min')) as number,
        max: max(map(facetMinMaxes, 'max')) as number,
      }
    );
  } else {
    return data.value && data.value.series.length > 0
      ? findMinMaxOfStackedArray(data.value.series)
      : undefined;
  }
}

export function barplotDefaultDependentAxisMax(
  data: PromiseHookState<BarplotDataWithStatistics | undefined>
) {
  if (isFaceted(data?.value)) {
    return data?.value?.facets != null
      ? max(
          data.value.facets
            .filter((facet) => facet.data != null)
            .flatMap((facet) => facet.data?.series.flatMap((o) => o.value))
        )
      : undefined;
  } else {
    return data?.value?.series != null
      ? max(data.value.series.flatMap((o) => o.value))
      : undefined;
  }
}

export function barplotDefaultDependentAxisMinPos(
  data: PromiseHookState<BarplotDataWithStatistics | undefined>
) {
  if (isFaceted(data?.value)) {
    return data?.value?.facets != null
      ? min(
          data.value.facets
            .filter((facet) => facet.data != null)
            .flatMap((facet) => facet.data?.series.flatMap((o) => o.value))
            .filter((value) => value != null && value > 0)
        )
      : undefined;
  } else {
    return data?.value?.series != null
      ? min(
          data.value.series.flatMap((o) => o.value).filter((value) => value > 0)
        )
      : undefined;
  }
}

export function boxplotDefaultDependentAxisMinMax(
  data: PromiseHookState<BoxplotDataWithCoverage | undefined>,
  yAxisVariable: Variable | undefined,
  // use computedVariableMetadata for computation apps
  computedVariableMetadata?: VariableMapping
) {
  if (isFaceted(data?.value)) {
    // may not need to check yAxisVariable?.type but just in case
    return data?.value?.facets != null &&
      (yAxisVariable?.type === 'number' || yAxisVariable?.type === 'integer')
      ? {
          min: min([
            0,
            min(
              data.value.facets
                .filter((facet) => facet.data != null)
                .flatMap((facet) =>
                  facet.data?.series
                    .flatMap((o) => o.outliers as number[][])
                    .flat()
                )
            ),
            min(
              data.value.facets
                .filter((facet) => facet.data != null)
                .flatMap((facet) =>
                  facet.data?.series.flatMap((o) => o.lowerfence as number[])
                )
            ),
          ]) as number,
          max: max([
            max(
              data.value.facets
                .filter((facet) => facet.data != null)
                .flatMap((facet) =>
                  facet.data?.series
                    .flatMap((o) => o.outliers as number[][])
                    .flat()
                )
            ),
            max(
              data.value.facets
                .filter((facet) => facet.data != null)
                .flatMap((facet) =>
                  facet.data?.series.flatMap((o) => o.upperfence as number[])
                )
            ),
          ]) as number,
        }
      : undefined;
  } else {
    return data?.value?.series != null &&
      (yAxisVariable?.type === 'number' ||
        yAxisVariable?.type === 'integer' ||
        computedVariableMetadata != null)
      ? {
          min: min([
            // 0, // annotated ranges for variables take care of this for us
            // if we reinstate the zero, then the lower truncation warnings will trigger unnecessarily
            min(
              data.value.series.flatMap((o) => o.outliers as number[][]).flat()
            ),
            min(data.value.series.flatMap((o) => o.lowerfence as number[])),
            // check displayRange with computedVariableMetadata
            Number(computedVariableMetadata?.displayRangeMin),
          ]) as number,
          max: max([
            max(
              data.value.series.flatMap((o) => o.outliers as number[][]).flat()
            ),
            max(data.value.series.flatMap((o) => o.upperfence as number[])),
            // check displayRange with computedVariableMetadata
            Number(computedVariableMetadata?.displayRangeMax),
          ]) as number,
        }
      : undefined;
  }
}

/**
 * find min and max of the sum of multiple arrays
 * it is because histogram viz uses "stack" option for display
 * Also, each data with overlayVariable has different bins
 * For this purpose, binStart is used as array index to map corresponding count
 * Need to make stacked count array and then max
 */

function findMinMaxOfStackedArray(data: HistogramDataSeries[]) {
  // calculate the sum of all the counts from bins with the same label
  const sumsByLabel = data
    .flatMap(
      // make an array of [ [ label, count ], [ label, count ], ... ] from all series
      (series) => series.bins.map((bin) => [bin.binLabel, bin.value])
    )
    // then do a sum of counts per label
    .reduce<Record<string, number>>(
      (map, [label, count]) => {
        if (map[label] == null) map[label] = 0;
        map[label] = map[label] + (count as number);
        return map;
      },
      // empty map for reduce to start with
      {}
    );

  const firstCountByLabel = data
    .flatMap(
      // make an array of [ [ label, count ], [ label, count ], ... ] from all series
      (series) => series.bins.map((bin) => [bin.binLabel, bin.value])
    )
    // then capture the first-seen count per label
    .reduce<Record<string, number>>(
      (map, [label, count]) => {
        if (map[label] == null) map[label] = count as number;
        return map;
      },
      // empty map for reduce to start with
      {}
    );

  return {
    // find minPos instead
    min: min(
      Object.values(firstCountByLabel).filter((value) => value > 0)
    ) as number,
    max: max(Object.values(sumsByLabel)) as number,
  };
}

// find min/max of independent axis range
function findIndependentAxisMinMax(data: HistogramDataSeries[]) {
  const binStartArray = data.flatMap((series) =>
    series.bins.map((bin) => bin.binStart)
  );
  const binEndArray = data.flatMap(
    // make an array of [ [ label, count ], [ label, count ], ... ] from all series
    (series) => series.bins.map((bin) => bin.binEnd)
  );

  return {
    min: min(binStartArray),
    max: max(binEndArray),
  };
}
