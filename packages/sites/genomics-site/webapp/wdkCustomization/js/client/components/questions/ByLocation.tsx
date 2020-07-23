import React, { useState, useCallback } from 'react';

import { useChangeParamValue } from 'wdk-client/Views/Question/Params/Utils';
import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { ParameterGroup, SelectEnumParam } from 'wdk-client/Utils/WdkModel';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

import { mutuallyExclusiveParamsGroupRenderer, MutuallyExclusiveTabKey } from './MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';
import { findChromosomeOptionalKey, findSequenceIdKey } from './MutuallyExclusiveParams/utils';

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

  const changeSequenceId = useChangeParamValue(
    props.state.question.parametersByName[sequenceIdKey], 
    props.state, 
    props.eventHandlers.updateParamValue
  );

  const clearChromosomeOptional = useCallback(() => {
    changeChromosomeOptional(chromosomeOptionalParam.vocabulary[0][0]);
  }, [ chromosomeOptionalParam, changeChromosomeOptional ]);

  const clearSequenceId = useCallback(() => {
    changeSequenceId('No Match');
  }, [ changeSequenceId ]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'Sequence ID') {
      clearChromosomeOptional();
    } else {
      clearSequenceId();
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
