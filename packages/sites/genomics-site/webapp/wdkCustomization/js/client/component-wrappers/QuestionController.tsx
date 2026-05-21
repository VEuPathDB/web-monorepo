import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DerivedProps } from '@veupathdb/wdk-client/lib/Controllers/QuestionController';
/**
 * Wrap QuestionController to provide an initial value for an organism parameter
 */

import { ComponentType } from 'react';
import { isOrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import {
  ORGANISM_PREFERENCE_SCOPE,
  ORGANISM_PARAM_PREF_KEY,
} from '@veupathdb/preferred-organisms/lib/utils/preferredOrganisms';
import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { GlobalParamMapping } from '@veupathdb/wdk-client/lib/Utils/ParamValueStore';

export function QuestionController(
  WrappedComponent: ComponentType<DerivedProps>
) {
  return function WrappedQuestionController(props: DerivedProps) {
    const question = useWdkServiceWithRefresh(
      (s) => s.getQuestionAndParameters(props.searchName),
      [props.searchName]
    );

    const organismParam = question?.parameters.find((param) =>
      isOrganismParam(param)
    );

    const globalParamMapping = useMemo((): GlobalParamMapping | undefined => {
      if (organismParam) {
        return {
          [organismParam.name]: 'globalOrgnamismParamValue',
        };
      }
      return undefined;
    }, [organismParam]);

    const savedOrganismValue = useSelector(
      (state: RootState) =>
        state.globalData?.preferences?.[ORGANISM_PREFERENCE_SCOPE]?.[
          ORGANISM_PARAM_PREF_KEY
        ]
    );

    const shouldInject =
      props.submissionMetadata?.type === 'create-strategy' &&
      savedOrganismValue != null &&
      organismParam != null &&
      !props.initialParamData?.[organismParam.name];

    const initialParamData = useMemo(() => {
      if (shouldInject) {
        return {
          ...props.initialParamData,
          [organismParam!.name]: savedOrganismValue!,
        };
      }
      return props.initialParamData;
    }, [
      shouldInject,
      props.initialParamData,
      organismParam,
      savedOrganismValue,
    ]);

    // Return null to prevent the search loading without the correct globalParamMapping
    if (question == null) return null;

    return (
      <WrappedComponent
        {...props}
        globalParamMapping={globalParamMapping}
        initialParamData={initialParamData}
      />
    );
  };
}
