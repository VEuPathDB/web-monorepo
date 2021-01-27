import { mapValues } from 'lodash';

import { toMultiValueArray } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';

import {
  IoBlastConfig,
  IOBlastPScoringMatrix,
  IOBlastXScoringMatrix,
  IOTBlastNScoringMatrix,
  IOTBlastXScoringMatrix,
} from './ServiceTypes';

export const BLAST_DATABASE_ORGANISM_PARAM_NAME = 'MultiBlastDatabaseOrganism';
export const BLAST_DATABASE_TYPE_PARAM_NAME = 'MultiBlastDatabaseType';
export const BLAST_QUERY_SEQUENCE_PARAM_NAME = 'BlastQuerySequence';
export const BLAST_ALGORITHM_PARAM_NAME = 'BlastAlgorithm';

// General config for all BLAST applications
export const EXPECTATION_VALUE_PARAM_NAME = 'ExpectationValue';
export const NUM_QUERY_RESULTS_PARAM_NAME = 'NumQueryResults';
export const MAX_MATCHES_QUERY_RANGE_PARAM_NAME = 'MaxMatchesQueryRange';

// General config specific to each BLAST application
export const WORD_SIZE_PARAM_NAME = 'WordSize';
export const SCORING_MATRIX_PARAM_NAME = 'ScoringMatrix';
export const COMP_ADJUST_PARAM_NAME = 'CompAdjust';

// Filter and masking config
export const FILTER_LOW_COMPLEX_PARAM_NAME = 'FilterLowComplex';
export const SOFT_MASK_PARAM_NAME = 'SoftMask';
export const LOWER_CASE_MASK_PARAM_NAME = 'LowerCaseMask';

// Scoring config
export const GAP_COSTS_PARAM_NAME = 'GapCosts';
export const MATCH_MISMATCH_SCORE = 'MatchMismatchScore';

/**
 * This function transforms the parameter values of a multi-blast WDK question
 * into a valid job configuration for the multi-blast service.
 *
 * NOTE: This logic is mirrored in
 *
 *   ApiCommonWebService/WSFPlugin/src/main/java/org/apidb/apicomplexa/wsfplugin/blast/MultiblastServiceParams.java
 *
 * The two must be kept in sync so unexpected results are not shown in the
 * multi-blast UI and so users get the same result when they export to WDK.
 *
 * @author jtlong
 */
export function paramValuesToBlastConfig(
  rawParamValues: Record<string, string>
): IoBlastConfig {
  const paramValues = mapValues(rawParamValues, (paramValue) =>
    paramValue.replace(/ \(default\)$/, '')
  );

  const {
    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: query,
    [BLAST_ALGORITHM_PARAM_NAME]: selectedTool,
    [EXPECTATION_VALUE_PARAM_NAME]: eValue,
    [NUM_QUERY_RESULTS_PARAM_NAME]: numQueryResultsStr,
    [MAX_MATCHES_QUERY_RANGE_PARAM_NAME]: maxMatchesStr,
    [WORD_SIZE_PARAM_NAME]: wordSizeStr,
    [SCORING_MATRIX_PARAM_NAME]: scoringMatrixStr,
    [COMP_ADJUST_PARAM_NAME]: compBasedStatsStr,
    [FILTER_LOW_COMPLEX_PARAM_NAME]: filterLowComplexityRegionsStr,
    [SOFT_MASK_PARAM_NAME]: softMaskStr,
    [LOWER_CASE_MASK_PARAM_NAME]: lowerCaseMaskStr,
    [GAP_COSTS_PARAM_NAME]: gapCostsStr,
    [MATCH_MISMATCH_SCORE]: matchMismatchStr,
  } = paramValues;

  const [gapOpen, gapExtend] = (gapCostsStr ?? '').split(',').map(Number);

  const maxHSPsConfig =
    Number(maxMatchesStr) >= 1 ? { maxHSPs: Number(maxMatchesStr) } : {};

  const baseConfig = {
    query,
    eValue,
    maxTargetSeqs: Number(numQueryResultsStr),
    wordSize: Number(wordSizeStr),
    softMasking: Boolean(softMaskStr),
    lcaseMasking: Boolean(lowerCaseMaskStr),
    gapOpen,
    gapExtend,
    outFormat: {
      format: 'single-file-json',
    },
    ...maxHSPsConfig,
  } as const;

  const compBasedStats =
    compBasedStatsStr === 'Conditional compositional score matrix adjustment'
      ? 'conditional-comp-based-score-adjustment'
      : compBasedStatsStr === 'No adjustment'
      ? 'none'
      : compBasedStatsStr === 'Composition-based statistics'
      ? 'comp-based-stats'
      : 'unconditional-comp-based-score-adjustment';

  const filterLowComplexityRegions =
    filterLowComplexityRegionsStr !== 'no filter';

  const dustConfig = !filterLowComplexityRegions
    ? {
        dust: {
          enable: false,
        },
      }
    : {
        dust: {
          enable: true,
          level: 20,
          window: 64,
          linker: 1,
        },
      };

  const segConfig = !filterLowComplexityRegions
    ? {}
    : {
        seg: { window: 12, locut: 2.2, hicut: 2.5 },
      };

  const [reward, penalty] = (matchMismatchStr ?? '').split(',').map(Number);

  if (selectedTool === 'blastn') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...dustConfig,
      reward,
      penalty,
    };
  }

  if (selectedTool === 'blastp') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      matrix: scoringMatrixStr as IOBlastPScoringMatrix,
      compBasedStats,
    };
  }

  if (selectedTool === 'blastx') {
    return {
      tool: selectedTool,
      queryGeneticCode: 1,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      matrix: scoringMatrixStr as IOBlastXScoringMatrix,
      compBasedStats,
    };
  }

  if (selectedTool === 'tblastn') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      matrix: scoringMatrixStr as IOTBlastNScoringMatrix,
      compBasedStats,
    };
  }

  if (selectedTool === 'tblastx') {
    return {
      tool: selectedTool,
      queryGeneticCode: 1,
      ...baseConfig,
      ...segConfig,
      matrix: scoringMatrixStr as IOTBlastXScoringMatrix,
    };
  }

  throw new Error(`The BLAST tool '${selectedTool}' is not supported`);
}

export function organismParamValueToFilenames(
  organismParamValue: string,
  organismFilesMap: Record<string, string>
) {
  const selectedOrganisms = new Set(toMultiValueArray(organismParamValue));

  return Object.entries(organismFilesMap)
    .filter(([organismName]) => selectedOrganisms.has(organismName))
    .map(([, organismFile]) => organismFile);
}
