import { IOBlastConfig } from './api/query/blast/blast-all';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { IOBlastNDust } from './api/query/blast/blast-config-n';
import { IOBlastSeg } from './api/query/blast/blast-common';
import { ParamNames } from './params';

export function blastConfigToParamValues(
  blastConfig: IOBlastConfig
): ParameterValues {
  const params: ParameterValues = {
    [ParamNames.BlastAlgorithm]: blastConfig.tool,
  };

  optSetParam(params, ParamNames.ExpectValue, blastConfig.eValue);
  optSetParam(
    params,
    ParamNames.NumQueryResults,
    blastConfig.maxTargetSequences
  );
  optSetParam(params, ParamNames.MaxMatchesQueryRange, blastConfig.maxHSPs);
  optSetParam(params, ParamNames.SoftMask, blastConfig.softMasking);
  optSetParam(params, ParamNames.LowercaseMask, blastConfig.lowercaseMasking);

  switch (blastConfig.tool) {
    case 'blastn':
      optSetParam(params, ParamNames.WordSize, blastConfig.wordSize);
      params[ParamNames.FilterLowComplexity] = dustToParamValue(
        blastConfig.dust
      );
      if (blastConfig.gapOpen != null && blastConfig.gapExtend != null) {
        params[
          ParamNames.GapCosts
        ] = `${blastConfig.gapOpen},${blastConfig.gapExtend}`;
      }
      if (blastConfig.reward != null && blastConfig.penalty != null) {
        params[
          ParamNames.MatchMismatch
        ] = `${blastConfig.reward},${blastConfig.penalty}`;
      }
      break;
    case 'blastp':
    case 'blastx':
    case 'deltablast':
    case 'psiblast':
    case 'tblastn':
      optSetParam(params, ParamNames.WordSize, blastConfig.wordSize);
      optSetParam(params, ParamNames.ScoringMatrix, blastConfig.matrix);
      params[ParamNames.CompAdjust] = blastConfig.compBasedStats as string;
      params[ParamNames.FilterLowComplexity] = segToParamValue(blastConfig.seg);
      if (blastConfig.gapOpen != null && blastConfig.gapExtend != null) {
        params[
          ParamNames.GapCosts
        ] = `${blastConfig.gapOpen},${blastConfig.gapExtend}`;
      }
      break;
    case 'rpsblast':
    case 'rpstblastn':
      params[ParamNames.CompAdjust] = blastConfig.compBasedStats as string;
      params[ParamNames.FilterLowComplexity] = segToParamValue(blastConfig.seg);
      break;
    case 'tblastx':
      optSetParam(params, ParamNames.WordSize, blastConfig.wordSize);
      optSetParam(params, ParamNames.ScoringMatrix, blastConfig.matrix);
      params[ParamNames.FilterLowComplexity] = segToParamValue(blastConfig.seg);
      break;
  }

  return params;
}

/**
 * Optionally sets a param if the target value is not `null` and not
 * `undefined`.
 *
 * @param params Parameter map into which the value may be set.
 *
 * @param key Key under which the value may be set in the parameter map.
 *
 * @param value Value which may be set if it is not `null` and is not
 * `undefined`.
 */
function optSetParam(
  params: ParameterValues,
  key: string,
  value: unknown | null | undefined
) {
  if (value !== null && value !== undefined) {
    params[key] = String(value);
  }
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
