import { compose, flatMap, mean } from 'lodash/fp';

// the input to NumericDataMean and NumericDataMedian is an array of n arrays (n distinctive values), each with 2 elements [value, #occurrences], 
// these n  2-element arrays are given in value order  
// eg: [ [1,25], [3,12], [6,9], [12,2] ] 
// --- range = 12 - 1 = 11
// --- mean is 2.9 = (1x25 + 3x12 + 6x9 + 12x2 ) / (25+12+9+2)
// --- median is 1: there are 48 entry points: average values at mid positions 24 and 25: (1+1)/2

type NumericDataMean = (data: [number, number][]) => number;
const numericDataMean: NumericDataMean = compose(
  mean,
  flatMap(([ value, times ]: [ number, number ]) => Array(times).fill(value)),
)

type FlatData = (data: [number, number][]) => number[];
const flatData: FlatData  = flatMap( ([ value, times ]: [ number, number ]) => Array(times).fill(value) );
type NumericDataMedian = (data2: number[]) => number;
const numericDataMedian: NumericDataMedian = arr => {
  const mid: number = Math.floor(arr.length / 2);
  const nums: number[] = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export interface HistogramReport {
  type: 'category' | 'int' | 'float';
  data: Record<string, number>;
  attrLabel: string;
  recordCountLabel: string;
}

export const MAX_DEFUALT_NUM_BINS = 10;
export const isTypeCategory = (type: HistogramReport['type']) => type === 'category';
export const isTypeInt = (type: HistogramReport['type']) => type === 'int';
export const isTypeFloat = (type: HistogramReport['type']) => type === 'float';

export function getReportSummary(report: HistogramReport, applyLog: boolean) {
  const dataEntries = Object.entries(report.data);

  // empty data
  if (dataEntries.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };

  // category
  if (isTypeCategory(report.type)) return { min: 0, max: dataEntries.length - 1, avg: (dataEntries.length - 1) / 2, median: (dataEntries.length - 1) / 2 };

  const numericData = dataEntries.map(([value, times]) =>
    [applyLog ? Math.log10(Number(value)) : Number(value), times] as [ number, number ]);

  const avg = numericDataMean(numericData);
  const median = numericDataMedian(flatData(numericData));

  // compute range
  return numericData.reduce(
    (range, [value]) => {
      range.min = Math.min(range.min, value);
      range.max = Math.max(range.max, value);
      return range;
    },
    { min: Infinity, max: -Infinity, avg, median }
  );
}

export function getDefaultBinSize(report: HistogramReport, applyLog: boolean) {
  if (isTypeCategory(report.type)) return 1;

  const { min, max } = getReportSummary(report, applyLog);

  const numBins = min === max ? 1
    : isTypeFloat(report.type) || applyLog ? MAX_DEFUALT_NUM_BINS
    : Math.min(MAX_DEFUALT_NUM_BINS, max - min);

  return isTypeFloat(report.type) || applyLog
    ? Math.ceil(Math.max(Math.abs(min), Math.abs(max)) / numBins * 100) / 100
    : Math.max(1, Math.ceil((max - min + 1) / numBins));
}
