import { useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { PromiseHookState } from './promise';
import { isFaceted } from '@veupathdb/components/lib/types/guards';
import {
  HistogramDataWithCoverageStatistics,
  HistogramConfig,
  findMinMaxOfStackedArray,
} from '../components/visualizations/implementations/HistogramVisualization';
import { HistogramData } from '@veupathdb/components/lib/types/plots';
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
  data: PromiseHookState<HistogramDataWithCoverageStatistics | undefined>,
  vizConfig: HistogramConfig,
  updateVizConfig: (newConfig: Partial<HistogramConfig>) => void
): defaultDependentAxisRangeProps {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisMinMax = useMemo(() => {
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
  }, [data]);

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
    updateVizConfigRef.current({
      dependentAxisRange: defaultDependentAxisRange,
    });
  }, [data, defaultDependentAxisRange]);

  return defaultDependentAxisRange;
}
