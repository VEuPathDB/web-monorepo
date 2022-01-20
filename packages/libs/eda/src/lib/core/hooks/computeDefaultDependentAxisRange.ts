import { useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { PromiseHookState } from './promise';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  HistogramDataWithCoverageStatistics,
  HistogramConfig,
  findMinMaxOfStackedArray,
} from '../components/visualizations/implementations/HistogramVisualization';
import {
  HistogramData,
  BarplotData,
} from '@veupathdb/components/lib/types/plots';
import {
  BarplotDataWithStatistics,
  BarplotConfig,
} from '../components/visualizations/implementations/BarplotVisualization';
import { min, max, map } from 'lodash';

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
    HistogramDataWithCoverageStatistics | BarplotDataWithStatistics | undefined
  >,
  vizConfig: HistogramConfig | BarplotConfig,
  updateVizConfig: (
    newConfig: Partial<HistogramConfig | BarplotConfig>
  ) => void,
  plotType?: 'Histogram' | 'Barplot' | undefined
): defaultDependentAxisRangeProps {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisMinMax = useMemo(() => {
    if (plotType == null || plotType == 'Histogram') {
      return histogramDefaultDependentAxisMinMax(
        data as PromiseHookState<
          HistogramDataWithCoverageStatistics | undefined
        >
      );
    } else if (plotType == 'Barplot') {
      //DKDK barplot only computes max value
      return {
        min: 0,
        max: barplotDefaultDependentAxisMax(
          data as PromiseHookState<BarplotDataWithStatistics | undefined>
        ),
      };
    }
  }, [data]);

  // //DKDK
  // console.log('defaultDependentAxisMinMax =', defaultDependentAxisMinMax)

  // DKDK set useMemo to avoid infinite loop
  // set default dependent axis range for better displaying tick labels in log-scale
  const defaultDependentAxisRange = useMemo(() => {
    return defaultDependentAxisMinMax?.min != null &&
      defaultDependentAxisMinMax?.max != null
      ? {
          // set min as 0 (count, proportion) for non-logscale
          min:
            vizConfig.valueSpec === 'count'
              ? 0
              : vizConfig.dependentAxisLogScale
              ? // determine min based on data for log-scale at proportion
                // need to check defaultDependentAxisMinMax.min !== 0
                defaultDependentAxisMinMax.min !== 0 &&
                defaultDependentAxisMinMax.min < 0.001
                ? defaultDependentAxisMinMax.min * 0.8
                : 0.001
              : 0,
          max: defaultDependentAxisMinMax.max * 1.05,
        }
      : undefined;
  }, [
    defaultDependentAxisMinMax,
    vizConfig.valueSpec,
    vizConfig.dependentAxisLogScale,
  ]);

  // DKDK use this to avoid infinite loop: also use useLayoutEffect to avoid async/ghost issue
  const updateVizConfigRef = useRef(updateVizConfig);
  useLayoutEffect(() => {
    updateVizConfigRef.current = updateVizConfig;
  }, [updateVizConfig]);

  // update vizConfig.dependentAxisRange as it is necessary for set range correctly
  useLayoutEffect(() => {
    //DKDKDK data.pending
    if (!data.pending)
      updateVizConfigRef.current({
        dependentAxisRange: defaultDependentAxisRange,
      });
    else
      updateVizConfigRef.current({
        dependentAxisRange: undefined,
      });
  }, [data, defaultDependentAxisRange]);

  return defaultDependentAxisRange;
}

function histogramDefaultDependentAxisMinMax(
  data: PromiseHookState<HistogramDataWithCoverageStatistics | undefined>
): any {
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

//DKDK compute max only
function barplotDefaultDependentAxisMax(
  data: PromiseHookState<BarplotDataWithStatistics | undefined>
): any {
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
