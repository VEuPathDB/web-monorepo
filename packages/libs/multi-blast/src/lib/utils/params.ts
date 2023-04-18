import {
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  isEnumParam,
  toMultiValueArray,
  toMultiValueString,
} from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';

import {
  IS_SPECIES_PARAM_PROPERTY,
  ORGANISM_PROPERTIES_KEY,
  SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY,
} from '@veupathdb/preferred-organisms/lib/components/OrganismParam';

import {
  IoBlastCompBasedStats,
  IoBlastConfig,
  IoBlastNDust,
  IOBlastPScoringMatrix,
  IoBlastSegMask,
  IOBlastXScoringMatrix,
  IOTBlastNScoringMatrix,
  IOTBlastXScoringMatrix,
  LongJobResponse,
  Target,
} from './ServiceTypes';

export const BLAST_DATABASE_ORGANISM_PARAM_NAME = 'BlastDatabaseOrganism';
export const BLAST_DATABASE_TYPE_PARAM_NAME = 'MultiBlastDatabaseType';
export const BLAST_QUERY_SEQUENCE_PARAM_NAME = 'BlastQuerySequence';
export const BLAST_ALGORITHM_PARAM_NAME = 'BlastAlgorithm';
export const JOB_DESCRIPTION_PARAM_NAME = 'BlastJobDescription';

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

export const ADVANCED_PARAMS_GROUP_NAME = 'advancedParams';

export const OMIT_PARAM_TERM = 'none';

export function isOmittedParam(param?: Parameter) {
  return param == null || !isEnumParam(param) || param.displayType === 'treeBox'
    ? false
    : param.vocabulary.length === 1 &&
        param.vocabulary[0][0] === OMIT_PARAM_TERM;
}

/**
 * This function transforms the parameter values of a multi-blast WDK question
 * into a valid job configuration for the multi-blast service.
 *
 * NOTE: This logic is mirrored in
 *
 *   EbrcWebSvcCommon/WSFPlugin/src/main/java/org/apidb/apicomplexa/wsfplugin/blast/MultiblastServiceParams.java
 *
 * The two must be kept in sync so unexpected results are not shown in the
 * multi-blast UI and so users get the same result when they export to WDK.
 *
 * @author jtlong
 */
export function paramValuesToBlastConfig(
  paramValues: ParameterValues
): IoBlastConfig {
  const {
    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: query,
    [BLAST_ALGORITHM_PARAM_NAME]: selectedTool,
    [EXPECTATION_VALUE_PARAM_NAME]: eValue,
    [NUM_QUERY_RESULTS_PARAM_NAME]: numQueryResultsStr,
    [MAX_MATCHES_QUERY_RANGE_PARAM_NAME]: maxMatchesStr,
    [WORD_SIZE_PARAM_NAME]: wordSizeStr,
    [SCORING_MATRIX_PARAM_NAME]: scoringMatrixStr,
    [COMP_ADJUST_PARAM_NAME]: compBasedStats,
    [FILTER_LOW_COMPLEX_PARAM_NAME]: filterLowComplexityRegionsStr,
    [SOFT_MASK_PARAM_NAME]: softMaskStr,
    [LOWER_CASE_MASK_PARAM_NAME]: lowerCaseMaskStr,
    [GAP_COSTS_PARAM_NAME]: gapCostsStr,
    [MATCH_MISMATCH_SCORE]: matchMismatchStr,
  } = paramValues;

  const maxHSPsConfig =
    Number(maxMatchesStr) >= 1 ? { maxHSPs: Number(maxMatchesStr) } : {};

  const baseConfig = {
    query,
    eValue,
    maxTargetSeqs: Number(numQueryResultsStr),
    wordSize: Number(wordSizeStr),
    softMasking: stringToBoolean(softMaskStr),
    lcaseMasking: stringToBoolean(lowerCaseMaskStr),
    outFormat: {
      format: 'single-file-json',
    },
    ...maxHSPsConfig,
  } as const;

  const filterLowComplexityRegions =
    filterLowComplexityRegionsStr !== 'no filter';

  const dustConfig: { dust: IoBlastNDust } = {
    dust: filterLowComplexityRegions ? 'yes' : 'no',
  };

  const segConfig: { seg: IoBlastSegMask } = {
    seg: filterLowComplexityRegions ? 'yes' : 'no',
  };

  const [reward, penalty] = (matchMismatchStr ?? '').split(',').map(Number);
  const [gapOpen, gapExtend] = (gapCostsStr ?? '').split(',').map(Number);

  if (selectedTool === 'blastn') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...dustConfig,
      reward,
      penalty,
      gapOpen,
      gapExtend,
    };
  }

  if (selectedTool === 'blastp') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      gapOpen,
      gapExtend,
      matrix: scoringMatrixStr as IOBlastPScoringMatrix,
      compBasedStats: compBasedStats as IoBlastCompBasedStats,
    };
  }

  if (selectedTool === 'blastx') {
    return {
      tool: selectedTool,
      queryGeneticCode: 1,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      gapOpen,
      gapExtend,
      matrix: scoringMatrixStr as IOBlastXScoringMatrix,
      compBasedStats: compBasedStats as IoBlastCompBasedStats,
    };
  }

  if (selectedTool === 'tblastn') {
    return {
      tool: selectedTool,
      task: selectedTool,
      ...baseConfig,
      ...segConfig,
      gapOpen,
      gapExtend,
      matrix: scoringMatrixStr as IOTBlastNScoringMatrix,
      compBasedStats: compBasedStats as IoBlastCompBasedStats,
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

  throw new Error(`The BLAST tool '${selectedTool}' is not supported.`);
}

export function blastConfigToParamValues(
  blastConfig: IoBlastConfig
): ParameterValues {
  const parameterValues: ParameterValues = {
    [BLAST_ALGORITHM_PARAM_NAME]: blastConfig.tool,
  };

  if (blastConfig.eValue != null) {
    parameterValues[EXPECTATION_VALUE_PARAM_NAME] = blastConfig.eValue;
  }

  if (
    blastConfig.maxTargetSeqs != null ||
    blastConfig.numDescriptions != null ||
    blastConfig.numAlignments != null
  ) {
    const resultSetBound = Math.min(
      blastConfig.maxTargetSeqs ?? Infinity,
      Math.max(
        blastConfig.numDescriptions ?? Infinity,
        blastConfig.numAlignments ?? Infinity
      )
    );

    parameterValues[NUM_QUERY_RESULTS_PARAM_NAME] = String(resultSetBound);
  }

  if (blastConfig.maxHSPs != null) {
    parameterValues[MAX_MATCHES_QUERY_RANGE_PARAM_NAME] = String(
      blastConfig.maxHSPs
    );
  }

  if (blastConfig.wordSize != null) {
    parameterValues[WORD_SIZE_PARAM_NAME] = String(blastConfig.wordSize);
  }

  if (blastConfig.tool !== 'blastn' && blastConfig.matrix != null) {
    parameterValues[SCORING_MATRIX_PARAM_NAME] = blastConfig.matrix;
  }

  if (
    blastConfig.tool !== 'blastn' &&
    blastConfig.tool !== 'tblastx' &&
    blastConfig.compBasedStats != null
  ) {
    parameterValues[COMP_ADJUST_PARAM_NAME] = blastConfig.compBasedStats;
  }

  if (blastConfig.tool === 'blastn') {
    parameterValues[FILTER_LOW_COMPLEX_PARAM_NAME] =
      blastConfig.dust === 'yes' || typeof blastConfig.dust === 'object'
        ? 'dust'
        : 'no filter';
  }

  if (blastConfig.tool !== 'blastn') {
    parameterValues[FILTER_LOW_COMPLEX_PARAM_NAME] =
      blastConfig.seg === 'yes' || typeof blastConfig.seg === 'object'
        ? 'seg'
        : 'no filter';
  }

  if (blastConfig.softMasking != null) {
    parameterValues[SOFT_MASK_PARAM_NAME] = String(blastConfig.softMasking);
  }

  if (blastConfig.lcaseMasking != null) {
    parameterValues[LOWER_CASE_MASK_PARAM_NAME] = String(
      blastConfig.lcaseMasking
    );
  }

  if (
    blastConfig.tool !== 'tblastx' &&
    blastConfig.gapOpen != null &&
    blastConfig.gapExtend != null
  ) {
    parameterValues[
      GAP_COSTS_PARAM_NAME
    ] = `${blastConfig.gapOpen},${blastConfig.gapExtend}`;
  }

  if (
    blastConfig.tool === 'blastn' &&
    blastConfig.reward != null &&
    blastConfig.penalty != null
  ) {
    parameterValues[
      MATCH_MISMATCH_SCORE
    ] = `${blastConfig.reward},${blastConfig.penalty}`;
  }

  return parameterValues;
}

export function targetsToOrganismParamValue(
  targets: Target[],
  dirsToOrganisms: Record<string, string>
) {
  const selectedOrganisms = targets
    .map((target) => dirsToOrganisms[target.organism])
    .filter((organism): organism is string => organism != null);

  return toMultiValueString(selectedOrganisms);
}

export function reportToParamValues(
  jobDetails: LongJobResponse,
  query: string,
  targetTypeTerm: string,
  targets: Target[],
  dirsToOrganisms: Record<string, string>
): ParameterValues {
  const configParamValues = blastConfigToParamValues(jobDetails.config);

  const organismParamValue = targetsToOrganismParamValue(
    targets,
    dirsToOrganisms
  );

  return {
    ...configParamValues,
    [JOB_DESCRIPTION_PARAM_NAME]: jobDetails.description ?? '',
    [BLAST_QUERY_SEQUENCE_PARAM_NAME]: query,
    [BLAST_DATABASE_ORGANISM_PARAM_NAME]: organismParamValue,
    [BLAST_DATABASE_TYPE_PARAM_NAME]: targetTypeTerm,
  };
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

function stringToBoolean(str: string) {
  return str === 'true';
}

export function transformOrganismParameter(
  parameter: Parameter,
  targetRecordType: string
): Parameter {
  const organismProperties =
    parameter.properties?.[ORGANISM_PROPERTIES_KEY] ?? [];

  const preferredOrganismProperties =
    targetRecordType === 'popsetSequence'
      ? []
      : targetRecordType === 'est'
      ? [SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY, IS_SPECIES_PARAM_PROPERTY]
      : [SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY];

  const otherOrganismProperties = organismProperties.filter(
    (property) =>
      property !== SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY &&
      property !== IS_SPECIES_PARAM_PROPERTY
  );

  return {
    ...parameter,
    properties: {
      ...parameter.properties,
      [ORGANISM_PROPERTIES_KEY]: [
        ...preferredOrganismProperties,
        ...otherOrganismProperties,
      ],
    },
  };
}
