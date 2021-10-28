import {
  HistogramData,
  BarplotData,
  BoxplotData,
} from '@veupathdb/components/lib/types/plots';
import { Variable } from '../types/study';
import { Analysis, AnalysisProvenance, NewAnalysis } from '../types/analysis';
import { CoverageStatistics } from '../types/visualization';
import { convertISOToDisplayFormat } from './date-conversion';

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
>(
  data: T,
  showMissingness: boolean = false,
  borderColor: string | undefined = undefined
) {
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

export function isNewAnalysis(
  analysis?: NewAnalysis | Analysis
): analysis is NewAnalysis {
  return analysis != null && !('analysisId' in analysis);
}

export function isSavedAnalysis(
  analysis?: NewAnalysis | Analysis
): analysis is Analysis {
  return analysis != null && 'analysisId' in analysis;
}

export function getAnalysisId(analysis?: NewAnalysis | Analysis) {
  return !isSavedAnalysis(analysis) ? undefined : analysis.analysisId;
}

export function makeProvenanceString(
  importCreationTime: string,
  provenance: AnalysisProvenance
) {
  const onImportString = `Imported from ${provenance.onImport.ownerName} [${
    provenance.onImport.ownerOrganization
  }] on ${convertISOToDisplayFormat(importCreationTime)}.`;
  const currentString = provenance.current.isDeleted
    ? `The original analysis has since been deleted.`
    : `The original analysis was last modified on ${convertISOToDisplayFormat(
        provenance.current.modificationTime
      )}.`;

  return `(${onImportString} ${currentString})`;
}
