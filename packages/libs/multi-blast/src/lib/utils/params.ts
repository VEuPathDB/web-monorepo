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

import { IOQueryJobDetails } from './api/query/types/ep-jobs-by-id';
import { IOJobTarget } from './api/query/types/common';
import { blastConfigToParamValues } from './params-from-query-config';

export const ADVANCED_PARAMS_GROUP_NAME = 'advancedParams';

export const OMIT_PARAM_TERM = 'none';

export const ParamNames = {
  BlastDatabaseOrganism: 'BlastDatabaseOrganism',
  BlastDatabaseType: 'MultiBlastDatabaseType',
  BlastQuerySequence: 'BlastQuerySequence',
  BlastAlgorithm: 'BlastAlgorithm',
  JobDescription: 'BlastJobDescription',

  // General config for all BLAST applications
  ExpectValue: 'ExpectationValue',
  NumQueryResults: 'NumQueryResults',
  MaxMatchesQueryRange: 'MaxMatchesQueryRange',

  // General config specific to each BLAST application
  WordSize: 'WordSize',
  ScoringMatrix: 'ScoringMatrix',
  CompAdjust: 'CompAdjust',

  // Filter and masking config
  FilterLowComplexity: 'FilterLowComplex',
  SoftMask: 'SoftMask',
  LowercaseMask: 'LowerCaseMask',

  // Scoring config
  GapCosts: 'GapCosts',
  MatchMismatch: 'MatchMismatchScore',
} as const;

export function isOmittedParam(param?: Parameter) {
  return param == null || !isEnumParam(param) || param.displayType === 'treeBox'
    ? false
    : param.vocabulary.length === 1 &&
        param.vocabulary[0][0] === OMIT_PARAM_TERM;
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
    [ParamNames.JobDescription]: jobDetails.userMeta?.summary ?? '',
    [ParamNames.BlastQuerySequence]: query,
    [ParamNames.BlastDatabaseOrganism]: organismParamValue,
    [ParamNames.BlastDatabaseType]: targetTypeTerm,
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
