import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ParamNames } from './params';
import { IOBlastQueryConfig, IOBlastSeg } from './api/query/blast/blast-common';
import { IOBlastNConfig, IOBlastNDust } from './api/query/blast/blast-config-n';
import {
  IOBlastPCompBasedStats,
  IOBlastPConfig,
  IOBlastPMatrix,
} from './api/query/blast/blast-config-p';
import {
  IOBlastXCompBasedStats,
  IOBlastXConfig,
  IOBlastXMatrix,
} from './api/query/blast/blast-config-x';
import {
  IOTBlastNCompBasedStats,
  IOTBlastNConfig,
  IOTBlastNMatrix,
} from './api/query/blast/blast-config-tn';
import {
  IOTBlastXConfig,
  IOTBlastXMatrix,
} from './api/query/blast/blast-config-tx';
import {
  IOPSIBlastCompBasedStats,
  IOPSIBlastConfig,
  IOPSIBlastMatrix,
} from './api/query/blast/blast-config-psi';
import {
  IORPSBlastCompBasedStats,
  IORPSBlastConfig,
} from './api/query/blast/blast-config-rps';
import {
  IORPSTBlastNCompBasedStats,
  IORPSTBlastNConfig,
} from './api/query/blast/blast-config-rpstn';
import {
  IODeltaBlastCompBasedStats,
  IODeltaBlastConfig,
  IODeltaBlastMatrix,
} from './api/query/blast/blast-config-delta';
import { IOBlastConfig } from './api/query/blast/blast-all';

const LOW_COMPLEXITY_NONE_VALUE = 'no filter';

export function paramValuesToBlastQueryConfig(
  paramValues: ParameterValues
): IOBlastConfig {
  const { [ParamNames.BlastAlgorithm]: tool } = paramValues;

  const config: IOBlastQueryConfig = {
    eValue: paramValues[ParamNames.ExpectValue],
    softMasking: booleanOrUndefined(paramValues[ParamNames.SoftMask]),
    lowercaseMasking: booleanOrUndefined(paramValues[ParamNames.LowercaseMask]),
    maxTargetSequences: numberOrUndefined(
      paramValues[ParamNames.NumQueryResults]
    ),
    maxHSPs: numberOrUndefined(paramValues[ParamNames.MaxMatchesQueryRange]),
  };

  switch (tool) {
    case 'blastn':
      return paramsToBlastNConfig(config, paramValues);
    case 'blastp':
      return paramsToBlastPConfig(config, paramValues);
    case 'blastx':
      return paramsToBlastXConfig(config, paramValues);
    case 'tblastn':
      return paramsToTBlastNConfig(config, paramValues);
    case 'tblastx':
      return paramsToTBlastXConfig(config, paramValues);
    case 'deltablast':
      return paramsToDeltaBlastConfig(config, paramValues);
    case 'psiblast':
      return paramsToPSIBlastConfig(config, paramValues);
    case 'rpsblast':
      return paramsToRPSBlastConfig(config, paramValues);
    case 'rpstblastn':
      return paramsToRPSTBlastNConfig(config, paramValues);
    default:
      throw new Error(`The selected BLAST tool '${tool}' is not supported.`);
  }
}

function paramsToBlastNConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOBlastNConfig {
  return {
    tool: 'blastn',
    task: 'blastn',
    ...base,
    ...parseGapCosts(params),
    ...mismatch(params[ParamNames.MatchMismatch]),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    dust: parseDust(params),
  };
}

function paramsToBlastPConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOBlastPConfig {
  return {
    tool: 'blastp',
    task: 'blastp',
    ...base,
    ...parseGapCosts(params),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IOBlastPMatrix,
    compBasedStats: params[ParamNames.CompAdjust] as IOBlastPCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToBlastXConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOBlastXConfig {
  return {
    tool: 'blastx',
    task: 'blastx',
    ...base,
    ...parseGapCosts(params),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IOBlastXMatrix,
    compBasedStats: params[ParamNames.CompAdjust] as IOBlastXCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToTBlastNConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOTBlastNConfig {
  return {
    tool: 'tblastn',
    task: 'tblastn',
    ...base,
    ...parseGapCosts(params),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IOTBlastNMatrix,
    compBasedStats: params[ParamNames.CompAdjust] as IOTBlastNCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToTBlastXConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOTBlastXConfig {
  return {
    tool: 'tblastx',
    ...base,
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IOTBlastXMatrix,
    seg: parseSeg(params),
  };
}

function paramsToPSIBlastConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IOPSIBlastConfig {
  return {
    tool: 'psiblast',
    ...base,
    ...parseGapCosts(params),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IOPSIBlastMatrix,
    compBasedStats: params[ParamNames.CompAdjust] as IOPSIBlastCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToRPSBlastConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IORPSBlastConfig {
  return {
    tool: 'rpsblast',
    ...base,
    compBasedStats: params[ParamNames.CompAdjust] as IORPSBlastCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToRPSTBlastNConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IORPSTBlastNConfig {
  return {
    tool: 'rpstblastn',
    ...base,
    compBasedStats: params[ParamNames.CompAdjust] as IORPSTBlastNCompBasedStats,
    seg: parseSeg(params),
  };
}

function paramsToDeltaBlastConfig(
  base: IOBlastQueryConfig,
  params: ParameterValues
): IODeltaBlastConfig {
  return {
    tool: 'deltablast',
    ...base,
    ...parseGapCosts(params),
    wordSize: numberOrUndefined(params[ParamNames.WordSize]),
    matrix: params[ParamNames.ScoringMatrix] as IODeltaBlastMatrix,
    compBasedStats: params[ParamNames.CompAdjust] as IODeltaBlastCompBasedStats,
    seg: parseSeg(params),
  };
}

function parseGapCosts(
  params: ParameterValues
): { gapOpen: number; gapExtend: number } | {} {
  const value = params[ParamNames.GapCosts];

  if (value === undefined) return {};

  const [gapOpen, gapExtend] = value.split(',').map(Number);

  return { gapOpen, gapExtend };
}

function parseSeg(params: ParameterValues): IOBlastSeg {
  return {
    enabled:
      params[ParamNames.FilterLowComplexity] !== LOW_COMPLEXITY_NONE_VALUE,
  };
}

function parseDust(params: ParameterValues): IOBlastNDust {
  return {
    enabled:
      params[ParamNames.FilterLowComplexity] !== LOW_COMPLEXITY_NONE_VALUE,
  };
}

function mismatch(
  value: string | undefined
): { reward: number; penalty: number } | {} {
  if (value === undefined) return {};

  const [reward, penalty] = value.split(',').map(Number);

  return { reward, penalty };
}

function booleanOrUndefined(value: string | undefined) {
  return value === undefined ? undefined : value === 'true';
}

function numberOrUndefined(value: string | undefined) {
  return value === undefined ? undefined : Number(value);
}
