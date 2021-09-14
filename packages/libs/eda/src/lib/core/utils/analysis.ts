import {
  HistogramData,
  BarplotData,
  BoxplotData,
} from '@veupathdb/components/lib/types/plots';
import { gray } from '../components/visualizations/colors';
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
            borderColor: '#d0d0d0',
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
