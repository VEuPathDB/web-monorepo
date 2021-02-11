import { useEffect, useMemo } from 'react';

import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { CheckBoxEnumParam } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useChangeParamValue } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

import { Props } from '../components/BlastForm';
import {
  BLAST_ALGORITHM_PARAM_NAME,
  BLAST_DATABASE_TYPE_PARAM_NAME,
  BLAST_QUERY_SEQUENCE_PARAM_NAME,
} from '../utils/params';

export function useTargetParamProps(
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue']
) {
  // FIXME: Validate this
  const parameter = state.question.parametersByName[
    BLAST_DATABASE_TYPE_PARAM_NAME
  ] as CheckBoxEnumParam;

  const items = useMemo(
    () =>
      parameter.vocabulary.map(([value, display]) => ({
        value,
        display: safeHtml(display),
      })),
    [parameter]
  );

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  return {
    items,
    value: state.paramValues[BLAST_DATABASE_TYPE_PARAM_NAME],
    onChange,
    required: true,
  };
}

export function useAlgorithmParamProps(
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue'],
  enabledAlgorithms: string[] | undefined
) {
  const parameter = state.question.parametersByName[
    BLAST_ALGORITHM_PARAM_NAME
  ] as CheckBoxEnumParam;
  const algorithm = state.paramValues[BLAST_ALGORITHM_PARAM_NAME];

  const items = useMemo(
    () =>
      parameter.vocabulary.map(([value, display]) => ({
        value,
        display: safeHtml(display),
        disabled: !enabledAlgorithms?.includes(value),
      })),
    [parameter, enabledAlgorithms]
  );

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  useEffect(() => {
    if (enabledAlgorithms != null && !enabledAlgorithms.includes(algorithm)) {
      onChange(enabledAlgorithms[0]);
    }
  }, [algorithm, enabledAlgorithms, onChange]);

  return {
    items,
    value: algorithm,
    onChange,
    required: true,
  };
}

export function useSequenceParamProps(
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue']
) {
  const parameter =
    state.question.parametersByName[BLAST_QUERY_SEQUENCE_PARAM_NAME];

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  return {
    className: 'SequenceParam',
    value: state.paramValues[BLAST_QUERY_SEQUENCE_PARAM_NAME],
    onChange,
    required: true,
    cols: 80,
    rows: 10,
  };
}
