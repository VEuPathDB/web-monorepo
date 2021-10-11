import {
  HistogramData,
  BarplotData,
  BoxplotData,
} from '@veupathdb/components/lib/types/plots';
import { Analysis, NewAnalysis } from '../types/analysis';
import { CoverageStatistics } from '../types/visualization';

export function vocabularyWithMissingData(
  vocabulary: string[] = [],
  includeMissingData: boolean = false
): string[] {
  return includeMissingData && vocabulary.length
    ? [...vocabulary, 'No data']
    : vocabulary;
}

export function grayOutLastSeries<
  T extends BarplotData | HistogramData | { series: BoxplotData }
>(data: T, showMissingness: boolean = false) {
  return {
    ...data,
    series: data.series.map((series, index) =>
      showMissingness && index === data.series.length - 1
        ? {
            ...series,
            color: 'white',
            borderColor: '#a0a0a0',
            outlierSymbol: 'x',
          }
        : series
    ),
  };
}

export function omitEmptyNoDataSeries<
  T extends { series: any } & CoverageStatistics
>(data: T, showMissingness: boolean = false) {
  const noMissingData =
    data.completeCasesAllVars === data.completeCasesAxesVars;
  if (!showMissingness || !noMissingData) return data;
  return {
    ...data,
    series: data.series.filter(
      (_: any, index: number) => index !== data.series.length - 1
    ),
  };
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

export function isNewAnalysis(
  analysis: NewAnalysis | Analysis
): analysis is NewAnalysis {
  return !('analysisId' in analysis);
}

export function isSavedAnalysis(
  analysis: NewAnalysis | Analysis
): analysis is Analysis {
  return 'analysisId' in analysis;
}
