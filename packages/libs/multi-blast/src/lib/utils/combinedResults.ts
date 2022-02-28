import { orderBy } from 'lodash';

export interface CombinedResultRow {
  accession: string;
  alignmentLength: number;
  eValue: number;
  identity: number;
  organism: string | null;
  queryCoverage: number;
  queryDescription: string;
  queryId: string;
  queryIndex: number;
  queryRank: number;
  queryTitle: string | null;
  score: number;
  subjectDescription: string;
  subjectRank: number;
  wdkPrimaryKey: string | null;
}

export const DEFAULT_SOURCE_ID_REGEX_STR =
  '^(?:>)?(?:\\s)*(?:[^|]*\\|)?(\\S+)\\s*\\|?\\s*';
export const DEFAULT_SOURCE_ID_REGEX = new RegExp(DEFAULT_SOURCE_ID_REGEX_STR);

export const DEFAULT_ORGANISM_REGEX_STR = '\\s*\\|?\\s*organism=([^|\\s]+)';
export const DEFAULT_ORGANISM_REGEX = new RegExp(DEFAULT_ORGANISM_REGEX_STR);

export const DEFAULT_GENE_REGEX_STR = '\\s*\\|?\\s*gene=([^|\\s]+)';
export const DEFAULT_GENE_REGEX = new RegExp(DEFAULT_GENE_REGEX_STR);

function deflineToDescriptionFactory(regexStrs: string[]) {
  const descriptionTrimmingSubstring = regexStrs.join('|');

  const descriptionTrimmingRegex = new RegExp(
    `(${descriptionTrimmingSubstring})`,
    'g'
  );

  return function deflineToDescription(defline: string) {
    return defline.replace(descriptionTrimmingRegex, '').replace(/^\s*\|/, '');
  };
}

export const defaultDeflineToDescription = deflineToDescriptionFactory([
  DEFAULT_SOURCE_ID_REGEX_STR,
  DEFAULT_ORGANISM_REGEX_STR,
]);

export function retrieveDataFromHitTitleFactory(regex: RegExp) {
  return function retrieveDataFromHitTitle(hitTitle: string) {
    const match = hitTitle.match(regex);

    return match == null || match[1] == null ? null : match[1];
  };
}

export const defaultDeflineToSourceId = retrieveDataFromHitTitleFactory(
  DEFAULT_SOURCE_ID_REGEX
);
export const defaultGeneDeflineToWdkPrimaryKey = retrieveDataFromHitTitleFactory(
  DEFAULT_GENE_REGEX
);
export const defaultDeflineToOrganism = retrieveDataFromHitTitleFactory(
  DEFAULT_ORGANISM_REGEX
);

export function dbToTargetName(db: string) {
  return db.replace(/[\s\S]*\//, '');
}

export function dbToOrgDirAndTargetDbName(db: string) {
  const targetName = dbToTargetName(db);

  const match = targetName.match(
    /^(.*)(AnnotatedTranscripts|AnnotatedProteins|Genome|ESTs|Isolates)$/
  );

  return {
    orgDir: match == null || match.length < 3 ? null : match[1],
    targetDbName: match == null || match.length < 3 ? null : match[2],
  };
}

export const ACCESSION_HELP_TEXT = undefined;
export const ORGANISM_HELP_TEXT = undefined;
export const DESCRIPTION_HELP_TEXT = undefined;
export const QUERY_HELP_TEXT = undefined;
export const INDIVIDUAL_RESULT_HELP_TEXT = undefined;
export const RANK_PER_QUERY_HELP_TEXT =
  'For each query sequence, hits are ranked by e-value.';
export const RANK_PER_SUBJECT_HELP_TEXT =
  'For each subject sequence, hits are ranked by e-value.';
export const ALIGNMENT_LENGTH_HELP_TEXT = undefined;
export const E_VALUE_HELP_TEXT = undefined;
export const SCORE_HELP_TEXT = undefined;
export const PERCENT_IDENTITY_HELP_TEXT = undefined;
export const QUERY_COVERAGE_HELP_TEXT = undefined;

const SIGNIFICANCE_SORT_COLUMNS = ['eValue', 'score', 'identity'] as const;
const SIGNIFICANCE_SORT_ORDERS = ['asc', 'desc', 'asc'] as const;

export function orderHitsBySignificance<
  T extends Record<string, string | number | null>
>(hits: T[]) {
  return orderBy(hits, SIGNIFICANCE_SORT_COLUMNS, SIGNIFICANCE_SORT_ORDERS);
}

interface Interval {
  left: number;
  right: number;
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) {
    return intervals;
  }

  const orderedIntervals = orderBy(intervals, 'left');

  const result = [orderedIntervals[0]];

  for (let i = 1; i < orderedIntervals.length; i++) {
    const nextInterval = orderedIntervals[i];
    const latestMergedInterval = result.pop() as Interval;

    if (latestMergedInterval.right < nextInterval.left) {
      result.push(latestMergedInterval);
      result.push(nextInterval);
    } else {
      result.push({
        left: latestMergedInterval.left,
        right: Math.max(latestMergedInterval.right, nextInterval.right),
      });
    }
  }

  return result;
}
