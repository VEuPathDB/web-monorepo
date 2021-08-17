import {
  HistogramData,
  BarplotData,
  BoxplotData,
} from '@veupathdb/components/lib/types/plots';
import { gray } from '../components/visualizations/colors';

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
        ? { ...series, color: gray }
        : series
    ),
  };
}
