import React, { useState, useCallback } from 'react';

import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { mutuallyExclusiveParamsGroupRenderer, MutuallyExclusiveTabKey } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';
import { ParameterGroup, SelectEnumParam } from 'wdk-client/Utils/WdkModel';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';
import { findChromosomeOptionalKey, findSequenceIdKey } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/utils';
import { useChangeParamValue } from 'wdk-client/Views/Question/Params/Utils';

const SEQUENCE_ID_EMPTY = /(\(Example: .*\)|No match)/i;

export const ByLocation: React.FunctionComponent<Props> = props => {
  const chromosomeOptionalKey = findChromosomeOptionalKey(props.state.question.paramNames);
  const chromosomeOptionalParam = props.state.question.parametersByName[chromosomeOptionalKey] as SelectEnumParam;

  const sequenceIdKey = findSequenceIdKey(props.state.question.paramNames);
  const sequenceIdParamValue = props.state.paramValues[sequenceIdKey];

  const initialTab = !SEQUENCE_ID_EMPTY.test(sequenceIdParamValue)
    ? 'Sequence ID'
    : 'Chromosome';

  const [ activeTab, onTabSelected ] = useState<MutuallyExclusiveTabKey>(initialTab);

  const renderParamGroup = useCallback(
    (group: ParameterGroup, props: Props) => mutuallyExclusiveParamsGroupRenderer(
      group, 
      props, 
      activeTab, 
      onTabSelected
    ), 
    [ activeTab, onTabSelected ]
  );

  const changeChromosomeOptional = useChangeParamValue(
    props.state.question.parametersByName[chromosomeOptionalKey], 
    props.state, 
    props.eventHandlers.updateParamValue
  );

  const clearChromosomeOptional = useCallback(() => {
    changeChromosomeOptional(chromosomeOptionalParam.vocabulary[0][0]);
  }, [ chromosomeOptionalParam, changeChromosomeOptional ])

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'Sequence ID') {
      clearChromosomeOptional();
    }

    return true;
  }, [ clearChromosomeOptional, activeTab ]);

  return (
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      onSubmit={onSubmit}
    />
  );
};
