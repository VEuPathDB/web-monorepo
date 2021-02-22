import React, { useMemo } from 'react';

import { EnumParam, Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import ParamComponent from '@veupathdb/wdk-client/lib/Views/Question/ParameterComponent';
import EnumParamModule from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParam';
import { Props, isPropsType } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';

import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

const ORGANISM_PROPERTIES_KEY = 'organismProperties';

const PRUNE_NODES_WITH_SINGLE_EXTENDING_CHILD_PROPERTY = 'pruneNodesWithSingleExtendingChild';

export function OrganismParam<S = void>(props: Props<Parameter, S>) {
  if (!isOrganismParamProps(props)) {
    throw new Error(`Tried to render non-organism parameter ${props.parameter.name} with OrganismParam.`);
  }

  return <ValidatedOrganismParam {...props} />;
}

export function ValidatedOrganismParam<S = void>({ parameter, ...otherProps }: Props<EnumParam, S>) {
  const paramWithPrunedVocab = useParamWithPrunedVocab(parameter);

  return (
    <ParamComponent
      parameter={paramWithPrunedVocab}
      {...otherProps}
    />
  );
}

function useParamWithPrunedVocab(parameter: EnumParam) {
  return useMemo(
    () => {
      const shouldPruneNodesWithSingleExtendingChild = parameter.properties?.[ORGANISM_PROPERTIES_KEY].includes(PRUNE_NODES_WITH_SINGLE_EXTENDING_CHILD_PROPERTY);

      return parameter.displayType === 'treeBox' && shouldPruneNodesWithSingleExtendingChild
        ? ({
            ...parameter,
            vocabulary: pruneNodesWithSingleExtendingChild(parameter.vocabulary)
          })
        : parameter;
    },
    [ parameter ]
  );
}

function isOrganismParamProps<S = void>(props: Props<Parameter, S>): props is Props<EnumParam, S> {
  return isPropsType(props, isOrganismParam);
}

export function isOrganismParam(parameter: Parameter): parameter is EnumParam {
  return (
    parameter?.properties?.[ORGANISM_PROPERTIES_KEY] != null &&
    EnumParamModule.isType(parameter)
  );
}
