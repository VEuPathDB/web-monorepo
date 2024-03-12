import { useCallback, useContext, useEffect, useMemo } from 'react';

import { isEqual, keyBy, once, pick, zipObject } from 'lodash';

import { updateDependentParams } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  QuestionState,
  QuestionWithMappedParameters,
} from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  CheckBoxEnumParam,
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useChangeParamValue } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

import { Props } from '../components/BlastForm';
import { ADVANCED_PARAMS_GROUP_NAME, ParamNames } from '../utils/params';
import {
  EnabledAlgorithms,
  TargetMetadataByDataType,
} from '../utils/targetTypes';

export function useTargetParamProps(
  state: QuestionState,
  updateParamValue: Props['eventHandlers']['updateParamValue'],
  canChangeWdkRecordType: boolean
) {
  const targetMetadataByDataType = useContext(TargetMetadataByDataType);

  // FIXME: Validate this
  const parameter = state.question.parametersByName[
    ParamNames.BlastDatabaseType
  ] as CheckBoxEnumParam;

  const selectedType = state.paramValues[ParamNames.BlastDatabaseType];

  const items = useMemo(
    () =>
      parameter.vocabulary
        .filter(
          ([value]) =>
            canChangeWdkRecordType ||
            targetMetadataByDataType[selectedType].recordClassUrlSegment ===
              targetMetadataByDataType[value].recordClassUrlSegment
        )
        .map(([value, display]) => ({ value, display: safeHtml(display) })),
    [canChangeWdkRecordType, parameter, selectedType, targetMetadataByDataType]
  );

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  return {
    items,
    value: selectedType,
    onChange,
    required: true,
  };
}

export function useAlgorithmParamProps(
  state: QuestionState,
  dispatchAction: Props['dispatchAction'],
  defaultAdvancedParamsMetadata:
    | Record<string, DefaultAdvancedParamsMetadata>
    | undefined,
  enabledAlgorithms: EnabledAlgorithms | undefined,
  canChangeWdkRecordType: boolean
) {
  // FIXME: Validate this
  const parameter = state.question.parametersByName[
    ParamNames.BlastAlgorithm
  ] as CheckBoxEnumParam;
  const algorithm = state.paramValues[ParamNames.BlastAlgorithm];

  const enabledAlgorithmsForTargetType =
    enabledAlgorithms?.enabledAlgorithmsForTargetType;
  const enabledAlgorithmsForWdkRecordType =
    enabledAlgorithms?.enabledAlgorithmsForWdkRecordType;

  const items = useMemo(
    () =>
      parameter.vocabulary
        .filter(
          ([value]) =>
            canChangeWdkRecordType ||
            enabledAlgorithmsForWdkRecordType?.includes(value)
        )
        .map(([value, display]) => ({
          value,
          display: safeHtml(display),
          disabled: !enabledAlgorithmsForTargetType?.includes(value),
        })),
    [
      parameter,
      canChangeWdkRecordType,
      enabledAlgorithmsForTargetType,
      enabledAlgorithmsForWdkRecordType,
    ]
  );

  const onChange = useChangeAlgorithmParam(
    defaultAdvancedParamsMetadata,
    dispatchAction,
    parameter,
    state.question.urlSegment
  );

  useEffect(() => {
    if (
      enabledAlgorithmsForTargetType != null &&
      !enabledAlgorithmsForTargetType.includes(algorithm)
    ) {
      onChange(enabledAlgorithmsForTargetType[0]);
    }
  }, [algorithm, enabledAlgorithmsForTargetType, onChange]);

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
    state.question.parametersByName[ParamNames.BlastQuerySequence];

  const onChange = useChangeParamValue(parameter, state, updateParamValue);

  return {
    value: state.paramValues[ParamNames.BlastQuerySequence],
    onChange,
    required: true,
    cols: 80,
    rows: 10,
  };
}

interface DefaultAdvancedParamsMetadata {
  defaultParams: Parameter[];
  areDefaultParamsSelected: (paramValues: ParameterValues) => boolean;
}

export function useDefaultAdvancedParams(
  question: QuestionWithMappedParameters
): Record<string, DefaultAdvancedParamsMetadata> | undefined {
  return useWdkService(
    async (wdkService) => {
      // FIXME: Validate this
      const algorithmParameter = question.parametersByName[
        ParamNames.BlastAlgorithm
      ] as CheckBoxEnumParam;
      const algorithms = algorithmParameter.vocabulary.map(([value]) => value);

      return fetchDefaultAlgorithmDependentParamsOnce(
        wdkService,
        question,
        algorithms
      );
    },
    [question]
  );
}

async function fetchDefaultAlgorithmAdvancedParams(
  wdkService: WdkService,
  question: QuestionWithMappedParameters,
  algorithms: string[]
) {
  const searchName = question.urlSegment;

  const advancedParamNames =
    question.groupsByName[ADVANCED_PARAMS_GROUP_NAME].parameters;
  const defaultAdvancedParams = advancedParamNames.map(
    (advancedParamName) => question.parametersByName[advancedParamName]
  );

  const dependentAdvancedParamPromises = algorithms.map((algorithm) =>
    wdkService.getRefreshedDependentParams(
      searchName,
      ParamNames.BlastAlgorithm,
      algorithm,
      {}
    )
  );

  const dependentAdvancedParamsByAlgorithm = await Promise.all(
    dependentAdvancedParamPromises
  );

  const advancedParams = dependentAdvancedParamsByAlgorithm.map(
    (dependentAdvancedParams) => {
      const dependentAdvancedParamsByName = keyBy(
        dependentAdvancedParams,
        'name'
      );

      const defaultAdvancedParamsForAlgorithm = defaultAdvancedParams.map(
        (advancedParam) =>
          dependentAdvancedParamsByName[advancedParam.name] ?? advancedParam
      );

      const defaultAdvancedParamValues = defaultAdvancedParamsForAlgorithm.reduce(
        (memo, { initialDisplayValue, name }) => {
          if (initialDisplayValue != null) {
            memo[name] = initialDisplayValue;
          }

          return memo;
        },
        {} as ParameterValues
      );

      return {
        defaultParams: defaultAdvancedParamsForAlgorithm,
        areDefaultParamsSelected: function (paramValues: ParameterValues) {
          const advancedParamValues = pick(paramValues, advancedParamNames);

          return isEqual(advancedParamValues, defaultAdvancedParamValues);
        },
      };
    }
  );

  return zipObject(algorithms, advancedParams);
}

const fetchDefaultAlgorithmDependentParamsOnce = once(
  fetchDefaultAlgorithmAdvancedParams
);

function useChangeAlgorithmParam(
  defaultAdvancedParamsMetadata:
    | Record<string, DefaultAdvancedParamsMetadata>
    | undefined,
  dispatchAction: Props['dispatchAction'],
  algorithmParameter: Parameter,
  searchName: string
) {
  return useCallback(
    (newAlgorithm: string) => {
      if (defaultAdvancedParamsMetadata == null) {
        return;
      }

      const updatedParameter = {
        ...algorithmParameter,
        initialDisplayValue: newAlgorithm,
      };

      dispatchAction(
        updateDependentParams({
          searchName,
          updatedParameter,
          refreshedDependentParameters: [
            updatedParameter,
            ...defaultAdvancedParamsMetadata[newAlgorithm].defaultParams,
          ],
        })
      );
    },
    [
      algorithmParameter,
      defaultAdvancedParamsMetadata,
      dispatchAction,
      searchName,
    ]
  );
}
