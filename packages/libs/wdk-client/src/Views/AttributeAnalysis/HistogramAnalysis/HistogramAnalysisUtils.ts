import { compose, flatMap, mean } from 'lodash/fp';

type NumericDataMean = (data: [number, number][]) => number;
const numericDataMean: NumericDataMean = compose(
  mean,
  flatMap(([ value, times ]: [ number, number ]) => Array(times).fill(value)),
)

export interface Report {
  type: 'category' | 'int' | 'float';
  data: Record<string, number>;
  attrLabel: string;
  recordCountLabel: string;
}

export const MAX_DEFUALT_NUM_BINS = 10;
export const isTypeCategory = (type: Report['type']) => type === 'category';
export const isTypeInt = (type: Report['type']) => type === 'int';
export const isTypeFloat = (type: Report['type']) => type === 'float';

export function getReportSummary(report: Report, applyLog: boolean) {
  const dataEntries = Object.entries(report.data);

  // empty data
  if (dataEntries.length === 0) return { min: 0, max: 0, avg: 0 };

  // category
  if (isTypeCategory(report.type)) return { min: 0, max: dataEntries.length - 1, avg: (dataEntries.length - 1) / 2 };

  const numericData = dataEntries.map(([value, times]) =>
    [applyLog ? Math.log10(Number(value)) : Number(value), times] as [ number, number ]);

  const avg = numericDataMean(numericData);

  // compute range
  return numericData.reduce(
    (range, [value]) => {
      range.min = Math.min(range.min, value);
      range.max = Math.max(range.max, value);
      return range;
    },
    { min: Infinity, max: -Infinity, avg }
  );
}

export function getDefaultBinSize(report: Report, applyLog: boolean) {
  if (isTypeCategory(report.type)) return 1;

  const { min, max } = getReportSummary(report, applyLog);

  const numBins = min === max ? 1
    : isTypeFloat(report.type) || applyLog ? MAX_DEFUALT_NUM_BINS
    : Math.min(MAX_DEFUALT_NUM_BINS, max - min);

  return isTypeFloat(report.type) || applyLog
    ? Math.ceil(max / numBins * 100) / 100
    : Math.max(1, Math.ceil((max - min + 1) / numBins));
}
