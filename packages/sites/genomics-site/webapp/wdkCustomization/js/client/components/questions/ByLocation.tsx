import React, { useCallback, useMemo, useState } from 'react';

import { isEnumParam } from '@veupathdb/wdk-client/lib/Views/Question/Params/EnumParamUtils';
import { useChangeParamValue } from '@veupathdb/wdk-client/lib/Views/Question/Params/Utils';
import { ParameterGroup, QuestionWithParameters } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import {
  DefaultStepDetailsContent,
  LeafStepDetailsProps,
  useStepDetailsData,
  useStepDetailsWeightControls
} from '@veupathdb/wdk-client/lib/Views/Strategy/StepDetails';

import { EbrcDefaultQuestionForm } from '@veupathdb/web-common/lib/components/questions/EbrcDefaultQuestionForm';

import {
  mutuallyExclusiveParamsGroupRenderer,
  MutuallyExclusiveTabKey
} from './MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';
import {
  findChromosomeOptionalKey,
  findSequenceIdKey,
  xorGroupingByChromosomeAndSequenceID
} from './MutuallyExclusiveParams/utils';

const SEQUENCE_ID_EMPTY = /(\(Example: .*\)|No match)/i;

export function ByLocationForm(props: Props) {
  const chromosomeOptionalKey = findChromosomeOptionalKey(props.state.question.paramNames);
  const chromosomeOptionalParam = props.state.question.parametersByName[chromosomeOptionalKey];

  const sequenceIdKey = findSequenceIdKey(props.state.question.paramNames);

  const initialTab = findOpenTab(sequenceIdKey, props.state.paramValues);

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
    if (
      isEnumParam(chromosomeOptionalParam) &&
      chromosomeOptionalParam.displayType === 'select'
    ) {
      changeChromosomeOptional(chromosomeOptionalParam.vocabulary[0][0]);
    }
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
  }, [ clearChromosomeOptional, clearSequenceId, activeTab ]);

  return (
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      onSubmit={onSubmit}
    />
  );
};

export function ByLocationStepDetails(props: LeafStepDetailsProps) {
  const { stepTree: { step } } = props;

  const {
    weight,
    weightCollapsed,
    setWeightCollapsed
  } = useStepDetailsWeightControls(step);

  const { question, datasetParamItems } = useStepDetailsData(step);

  const questionWithHiddenParams = useQuestionWithHiddenParams(step, question);

  return (
    <DefaultStepDetailsContent
      {...props}
      question={questionWithHiddenParams}
      datasetParamItems={datasetParamItems}
      weight={weight}
      weightCollapsed={weightCollapsed}
      setWeightCollapsed={setWeightCollapsed}
    />
  );
}

function useQuestionWithHiddenParams(step: Step, question?: QuestionWithParameters) {
  return useMemo(() => {
    if (question == null) {
      return undefined;
    }

    const sequenceIdKey = findSequenceIdKey(question.paramNames);
    const openTab = findOpenTab(sequenceIdKey, step.searchConfig.parameters);

    return {
      ...question,
      parameters: question.parameters.map(
        parameter => ({
          ...parameter,
          isVisible: (
            parameter.isVisible &&
            !parameterLiesInAClosedTab(
              parameter.name,
              xorGroupingByChromosomeAndSequenceID,
              openTab
            )
          )
        })
      )
    };
  }, [ question, step ]);
}

function findOpenTab(
  sequenceIdKey: string,
  paramValues: Record<string, string>
) {
  const sequenceIdParamValue = paramValues[sequenceIdKey];

  return !SEQUENCE_ID_EMPTY.test(sequenceIdParamValue)
    ? 'Sequence ID'
    : 'Chromosome';
}

function parameterLiesInAClosedTab(
  paramName: string,
  xorGrouping: Record<MutuallyExclusiveTabKey, string[]>,
  openTab: MutuallyExclusiveTabKey
) {
  return Object.entries(xorGrouping).some(
    ([ tab, tabParams ]) => (
      tab !== openTab &&
      tabParams.includes(paramName)
    )
  );
}
