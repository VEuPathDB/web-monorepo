import {
  HistogramData,
  BarplotData,
  BoxplotData,
  FacetedData,
} from '@veupathdb/components/lib/types/plots';
import { Variable } from '../types/study';
import { CoverageStatistics } from '../types/visualization';
import { isFaceted } from '@veupathdb/components/lib/types/guards';

// was: BarplotData | HistogramData | { series: BoxplotData };
type SeriesWithStatistics<T> = T & CoverageStatistics;
type MaybeFacetedSeries<T> = T | FacetedData<T>;
type MaybeFacetedSeriesWithStatistics<T> = MaybeFacetedSeries<T> &
  CoverageStatistics;

export function grayOutLastSeries<
  T extends { series: BoxplotData } | BarplotData | HistogramData
>(
  data: T | MaybeFacetedSeriesWithStatistics<T>,
  showMissingness: boolean = false,
  borderColor: string | undefined = undefined
): MaybeFacetedSeriesWithStatistics<T> {
  if (isFaceted(data)) {
    return {
      ...data,
      facets: data.facets.map(({ label, data }) => ({
        label,
        data: grayOutLastSeries(data, showMissingness, borderColor) as T,
      })),
    };
  }

  return {
    ...data,
    series: data.series.map((series, index) =>
      showMissingness && index === data.series.length - 1
        ? {
            ...series,
            color: '#e8e8e8',
            outlierSymbol: 'x',
            borderColor,
          }
        : series
    ),
  } as SeriesWithStatistics<T>;
}

export function omitEmptyNoDataSeries<
  T extends { series: BoxplotData } | BarplotData | HistogramData
>(
  data: MaybeFacetedSeriesWithStatistics<T>,
  showMissingness: boolean = false
): MaybeFacetedSeriesWithStatistics<T> {
  const omitLastSeries =
    showMissingness && data.completeCasesAllVars === data.completeCasesAxesVars;

  if (isFaceted(data)) {
    return {
      ...data,
      facets: data.facets.map((facet) => ({
        label: facet.label,
        data: {
          ...facet.data,
          series: omitLastSeries
            ? facet.data.series.slice(0, -1)
            : facet.data.series,
        },
      })),
    };
  }

  const unfaceted = {
    ...data,
    series: omitLastSeries ? data.series.slice(0, -1) : data.series,
  };
  return unfaceted;
}

/**
 * Convert pvalue number into '< 0.001' or '< 0.01' or single digit precision string.
 *
 * If provided a string, just return the string, no questions asked.
 *
 */
export function quantizePvalue(pvalue: number | string): string {
  if (typeof pvalue === 'string') {
    return pvalue;
  } else if (pvalue < 0.001) {
    return '< 0.001';
  } else if (pvalue < 0.01) {
    return '< 0.01';
  } else {
    return pvalue.toPrecision(1);
  }
}

/**
 * See web-eda issue 508
 *
 * Number variable values come from back end as strings when used as labels;
 * converting through number solves the problem in
 * issue 508 where "40.0" from back end doesn't match variable vocabulary's "40"
 *
 */
export function fixLabelsForNumberVariables(
  labels: string[] = [],
  variable?: Variable
): string[] {
  return variable != null && variable.type === 'number'
    ? labels.map((n) => String(Number(n)))
    : labels;
}

/**
 * non-array version of fixLabelsForNumberVariables
 *
 * However, unlike fixLabelsForNumberVariables it will pass through any non-number strings.
 * This is because this is used to clean up overlayVariable values, which can be 'No data'
 */
export function fixLabelForNumberVariables(
  label: string,
  variable?: Variable
): string {
  return variable != null && variable.type === 'number'
    ? String(isNaN(Number(label)) ? label : Number(label))
    : label;
}

export const nonUniqueWarning =
  'Variables must be unique. Please choose different variables.';

export function vocabularyWithMissingData(
  vocabulary: string[] = [],
  includeMissingData: boolean = false
): string[] {
  return includeMissingData && vocabulary.length
    ? [...vocabulary, 'No data']
    : vocabulary;
}

export function variablesAreUnique(vars: (Variable | undefined)[]): boolean {
  const defined = vars.filter((item) => item != null);
  const unique = defined.filter((item, i, ar) => ar.indexOf(item) === i);
  return defined.length === unique.length;
}
