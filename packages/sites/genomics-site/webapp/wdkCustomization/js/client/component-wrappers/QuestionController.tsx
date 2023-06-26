import React, { useMemo } from 'react';
import { DerivedProps } from '@veupathdb/wdk-client/lib/Controllers/QuestionController';
/**
 * Wrap QuestionController to provide an initial value for an organism parameter
 */

import { ComponentType } from 'react';
import { isOrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
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

    // Return null to prevent the search loading without the correct globalParamMapping
    if (question == null) return null;

    return (
      <WrappedComponent {...props} globalParamMapping={globalParamMapping} />
    );
  };
}
