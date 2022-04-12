import { useMemo } from 'react';
import { PromiseHookState } from './promise';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  HistogramDataWithCoverageStatistics,
  HistogramConfig,
  findMinMaxOfStackedArray,
} from '../components/visualizations/implementations/HistogramVisualization';
import { HistogramData } from '@veupathdb/components/lib/types/plots';
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

export function useDefaultDependentAxisRange(
  data: PromiseHookState<
    | HistogramDataWithCoverageStatistics
    | BarplotDataWithStatistics
    | BoxplotDataWithCoverage
    | undefined
  >,
  vizConfig: HistogramConfig | BarplotConfig | BoxplotConfig,
  // HistogramConfig contains most options
  updateVizConfig: (newConfig: Partial<HistogramConfig>) => void,
  plotType?: 'Histogram' | 'Barplot' | 'Boxplot' | undefined,
  yAxisVariable?: Variable,
  // pass computedVariableMetadata for axis range of computation apps
  computedVariableMetadata?: ComputedVariableMetadata
): defaultDependentAxisRangeProps {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisMinMax = useMemo(() => {
    if (plotType == null || plotType == 'Histogram')
      return histogramDefaultDependentAxisMinMax(
        data as PromiseHookState<
          HistogramDataWithCoverageStatistics | undefined
        >
      );
    else if (plotType == 'Barplot')
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
  }, [data]);

  // set useMemo to avoid infinite loop
  // set default dependent axis range for better displaying tick labels in log-scale
  const defaultDependentAxisRange = useMemo(() => {
    if (plotType === 'Histogram' || plotType === 'Barplot')
      return defaultDependentAxisMinMax?.min != null &&
        defaultDependentAxisMinMax?.max != null
        ? {
            // set min as 0 (count, proportion) for non-logscale for histogram/barplot
            min:
              (vizConfig as HistogramConfig | BarplotConfig).valueSpec ===
              'count'
                ? 0
                : (vizConfig as HistogramConfig | BarplotConfig)
                    .dependentAxisLogScale
                ? // determine min based on data for log-scale at proportion
                  // need to check defaultDependentAxisMinMax.min !== 0
                  defaultDependentAxisMinMax.min !== 0 &&
                  defaultDependentAxisMinMax.min < 0.001
                  ? numberDecimalPoint(defaultDependentAxisMinMax.min * 0.8, 4)
                  : 0.001
                : 0,
            max: numberDecimalPoint(defaultDependentAxisMinMax.max * 1.05, 4),
          }
        : undefined;
    // boxplot
    else if (plotType === 'Boxplot')
      return defaultDependentAxisMinMax?.min != null &&
        defaultDependentAxisMinMax?.max != null
        ? {
            min: numberDecimalPoint(defaultDependentAxisMinMax.min, 4),
            max: numberDecimalPoint(defaultDependentAxisMinMax.max * 1.05, 4),
          }
        : undefined;
  }, [
    defaultDependentAxisMinMax,
    (vizConfig as HistogramConfig | BarplotConfig).valueSpec,
    (vizConfig as HistogramConfig | BarplotConfig).dependentAxisLogScale,
  ]);

  return defaultDependentAxisRange;
}

function histogramDefaultDependentAxisMinMax(
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
        min: min(map(facetMinMaxes, 'min')),
        max: max(map(facetMinMaxes, 'max')),
      }
    );
  } else {
    return data.value && data.value.series.length > 0
      ? findMinMaxOfStackedArray(data.value.series)
      : undefined;
  }
}

// compute max only
function barplotDefaultDependentAxisMax(
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

function boxplotDefaultDependentAxisMinMax(
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
          min:
            (min([
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
            ]) as number) * 1.05,
          max:
            (max([
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
            ]) as number) * 1.05,
        }
      : undefined;
  } else {
    return data?.value?.series != null &&
      (yAxisVariable?.type === 'number' ||
        yAxisVariable?.type === 'integer' ||
        computedVariableMetadata != null)
      ? {
          min:
            (min([
              0,
              min(
                data.value.series
                  .flatMap((o) => o.outliers as number[][])
                  .flat()
              ),
              min(data.value.series.flatMap((o) => o.lowerfence as number[])),
              // check displayRange with computedVariableMetadata
              computedVariableMetadata?.displayRangeMin,
            ]) as number) * 1.05,
          max:
            (max([
              max(
                data.value.series
                  .flatMap((o) => o.outliers as number[][])
                  .flat()
              ),
              max(data.value.series.flatMap((o) => o.upperfence as number[])),
              // check displayRange with computedVariableMetadata
              computedVariableMetadata?.displayRangeMax,
            ]) as number) * 1.05,
        }
      : undefined;
  }
}
