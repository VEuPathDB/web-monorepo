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

import { IOBlastSeg } from './api/query/blast/blast-common';
import { IOQueryJobDetails } from './api/query/api/ep-jobs-by-id';
import { IOBlastConfig } from './api/query/blast/blast-all';
import { IOBlastNDust } from './api/query/blast/blast-config-n';
import { IOJobTarget } from './api/query/api/common';

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

export const ParamNames = {
  BlastDatabaseOrganism: BLAST_DATABASE_ORGANISM_PARAM_NAME,
  BlastDatabaseType: BLAST_DATABASE_TYPE_PARAM_NAME,
  BlastQuerySequence: BLAST_QUERY_SEQUENCE_PARAM_NAME,
  BlastAlgorithm: BLAST_ALGORITHM_PARAM_NAME,
  JobDescription: JOB_DESCRIPTION_PARAM_NAME,

  ExpectValue: EXPECTATION_VALUE_PARAM_NAME,
  NumQueryResults: NUM_QUERY_RESULTS_PARAM_NAME,
  MaxMatchesQueryRange: MAX_MATCHES_QUERY_RANGE_PARAM_NAME,

  WordSize: WORD_SIZE_PARAM_NAME,
  ScoringMatrix: SCORING_MATRIX_PARAM_NAME,
  CompAdjust: COMP_ADJUST_PARAM_NAME,

  FilterLowComplexity: FILTER_LOW_COMPLEX_PARAM_NAME,
  SoftMask: SOFT_MASK_PARAM_NAME,
  LowercaseMask: LOWER_CASE_MASK_PARAM_NAME,
  GapCosts: GAP_COSTS_PARAM_NAME,
  MatchMismatch: MATCH_MISMATCH_SCORE,
} as const;

export function isOmittedParam(param?: Parameter) {
  return param == null || !isEnumParam(param) || param.displayType === 'treeBox'
    ? false
    : param.vocabulary.length === 1 &&
        param.vocabulary[0][0] === OMIT_PARAM_TERM;
}
export function blastConfigToParamValues(
  blastConfig: IOBlastConfig
): ParameterValues {
  const parameterValues: ParameterValues = {
    [ParamNames.BlastAlgorithm]: blastConfig.tool,
  };

  if (blastConfig.eValue != null) {
    parameterValues[ParamNames.ExpectValue] = blastConfig.eValue;
  }

  parameterValues[ParamNames.NumQueryResults] = String(
    blastConfig.maxTargetSequences ?? Infinity
  );

  if (blastConfig.maxHSPs != null) {
    parameterValues[ParamNames.MaxMatchesQueryRange] = String(
      blastConfig.maxHSPs
    );
  }

  if (blastConfig.softMasking != null) {
    parameterValues[ParamNames.SoftMask] = String(blastConfig.softMasking);
  }

  if (blastConfig.lowercaseMasking != null) {
    parameterValues[ParamNames.LowercaseMask] = String(
      blastConfig.lowercaseMasking
    );
  }

  switch (blastConfig.tool) {
    case 'blastn':
      parameterValues[ParamNames.WordSize] = String(blastConfig.wordSize);
      parameterValues[ParamNames.FilterLowComplexity] = dustToParamValue(
        blastConfig.dust
      );
      if (blastConfig.gapOpen != null && blastConfig.gapExtend != null) {
        parameterValues[
          ParamNames.GapCosts
        ] = `${blastConfig.gapOpen},${blastConfig.gapExtend}`;
      }
      if (blastConfig.reward != null && blastConfig.penalty != null) {
        parameterValues[
          ParamNames.MatchMismatch
        ] = `${blastConfig.reward},${blastConfig.penalty}`;
      }
      break;
    case 'blastp':
    case 'blastx':
    case 'deltablast':
    case 'psiblast':
    case 'tblastn':
      parameterValues[ParamNames.WordSize] = String(blastConfig.wordSize);
      parameterValues[ParamNames.ScoringMatrix] = blastConfig.matrix as string;
      parameterValues[
        ParamNames.CompAdjust
      ] = blastConfig.compBasedStats as string;
      parameterValues[ParamNames.FilterLowComplexity] = segToParamValue(
        blastConfig.seg
      );
      if (blastConfig.gapOpen != null && blastConfig.gapExtend != null) {
        parameterValues[
          ParamNames.GapCosts
        ] = `${blastConfig.gapOpen},${blastConfig.gapExtend}`;
      }
      break;
    case 'rpsblast':
    case 'rpstblastn':
      parameterValues[
        ParamNames.CompAdjust
      ] = blastConfig.compBasedStats as string;
      parameterValues[ParamNames.FilterLowComplexity] = segToParamValue(
        blastConfig.seg
      );
      break;
    case 'tblastx':
      parameterValues[ParamNames.WordSize] = String(blastConfig.wordSize);
      parameterValues[ParamNames.ScoringMatrix] = blastConfig.matrix as string;
      parameterValues[ParamNames.FilterLowComplexity] = segToParamValue(
        blastConfig.seg
      );
      break;
  }

  return parameterValues;
}

function dustToParamValue(dust: IOBlastNDust | null | undefined): string {
  return dust === null || dust === undefined || !dust.enabled
    ? 'no filter'
    : 'dust';
}

function segToParamValue(seg: IOBlastSeg | null | undefined): string {
  return seg === null || seg === undefined || !seg.enabled
    ? 'no filter'
    : 'seg';
}

export function targetsToOrganismParamValue(
  targets: IOJobTarget[],
  dirsToOrganisms: Record<string, string>
) {
  const selectedOrganisms = targets
    .map((target) => dirsToOrganisms[target.targetDisplayName])
    .filter((organism): organism is string => organism != null);

  return toMultiValueString(selectedOrganisms);
}

export function reportToParamValues(
  jobDetails: IOQueryJobDetails,
  query: string,
  targetTypeTerm: string,
  targets: IOJobTarget[],
  dirsToOrganisms: Record<string, string>
): ParameterValues {
  const configParamValues = blastConfigToParamValues(jobDetails.blastConfig);

  const organismParamValue = targetsToOrganismParamValue(
    targets,
    dirsToOrganisms
  );

  return {
    ...configParamValues,
    [JOB_DESCRIPTION_PARAM_NAME]: jobDetails.userMeta?.summary ?? '',
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
