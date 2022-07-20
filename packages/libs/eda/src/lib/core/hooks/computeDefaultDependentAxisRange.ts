import { useMemo } from 'react';
import { PromiseHookState } from './promise';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  HistogramDataWithCoverageStatistics,
  HistogramConfig,
} from '../components/visualizations/implementations/HistogramVisualization';
import {
  HistogramData,
  HistogramDataSeries,
} from '@veupathdb/components/lib/types/plots';
import {
  BarplotDataWithStatistics,
  BarplotConfig,
} from '../components/visualizations/implementations/BarplotVisualization';
import {
  BoxplotDataWithCoverage,
  BoxplotConfig,
} from '../components/visualizations/implementations/BoxplotVisualization';
import { min, max, map } from 'lodash';
import { Variable } from '../types/study';
// util to get specific decimal points as a number, not string
import { numberDecimalPoint } from '../utils/number-decimal-point';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';

/**
 * A custom hook to compute default dependent axis range
 */

type defaultDependentAxisRangeProps =
  | {
      min: number;
      max: number;
    }
  | undefined;

// TO BE DEPRECATED in favour of universal useDefaultAxisRange
export function useDefaultDependentAxisRange(
  data: PromiseHookState<
    | HistogramDataWithCoverageStatistics
    | BarplotDataWithStatistics
    | BoxplotDataWithCoverage
    | undefined
  >,
  vizConfig: HistogramConfig | BarplotConfig | BoxplotConfig,
  plotType?: 'Histogram' | 'Barplot' | 'Boxplot' | undefined,
  yAxisVariable?: Variable,
  // pass computedVariableMetadata for axis range of computation apps
  computedVariableMetadata?: ComputedVariableMetadata
): defaultDependentAxisRangeProps {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisMinMax = useMemo(() => {
    if (plotType == null || plotType === 'Histogram')
      return histogramDefaultDependentAxisMinMax(
        data as PromiseHookState<
          HistogramDataWithCoverageStatistics | undefined
        >
      );
    else if (plotType === 'Barplot')
      // barplot only computes max value
      return {
        min: 0,
        max: barplotDefaultDependentAxisMax(
          data as PromiseHookState<BarplotDataWithStatistics | undefined>
        ),
      };
    // boxplot
    else if (plotType === 'Boxplot')
      return boxplotDefaultDependentAxisMinMax(
        data as PromiseHookState<BoxplotDataWithCoverage | undefined>,
        yAxisVariable,
        // pass computedVariableMetadata
        computedVariableMetadata
      );
  }, [data, plotType, yAxisVariable, computedVariableMetadata]);

  // set useMemo to avoid infinite loop
  // set default dependent axis range for better displaying tick labels in log-scale
  const valueSpec = (vizConfig as HistogramConfig | BarplotConfig).valueSpec;
  const dependentAxisLogScale = (vizConfig as HistogramConfig | BarplotConfig)
    .dependentAxisLogScale;

  const defaultDependentAxisRange = useMemo(() => {
    if (plotType === 'Histogram' || plotType === 'Barplot')
      return defaultDependentAxisMinMax?.min != null &&
        defaultDependentAxisMinMax?.max != null
        ? {
            // set min as 0 (count, proportion) for non-logscale for histogram/barplot
            min:
              valueSpec === 'count'
                ? 0
                : dependentAxisLogScale
                ? // determine min based on data for log-scale at proportion
                  // need to check defaultDependentAxisMinMax.min !== 0
                  defaultDependentAxisMinMax.min !== 0 &&
                  defaultDependentAxisMinMax.min < 0.001
                  ? numberDecimalPoint(defaultDependentAxisMinMax.min * 0.8, 4)
                  : 0.001
                : 0,
            max: numberDecimalPoint(defaultDependentAxisMinMax.max, 4),
          }
        : undefined;
    // boxplot
    else if (plotType === 'Boxplot')
      return defaultDependentAxisMinMax?.min != null &&
        defaultDependentAxisMinMax?.max != null
        ? {
            min: numberDecimalPoint(defaultDependentAxisMinMax.min, 4),
            max: numberDecimalPoint(defaultDependentAxisMinMax.max, 4),
          }
        : undefined;
  }, [defaultDependentAxisMinMax, plotType, valueSpec, dependentAxisLogScale]);

  return defaultDependentAxisRange;
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
  computedVariableMetadata?: ComputedVariableMetadata
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
    min: min(Object.values(firstCountByLabel)) as number,
    max: max(Object.values(sumsByLabel)) as number,
  };
}
