import { result } from 'lodash';
import React from 'react';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import Parameters from './Parameters';
import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { QuestionWizardProps } from '../util/WizardTypes';

/**
 * Active group section. Includes heading, help text, summary counts, and parameters.
 */
function ActiveGroup(props: QuestionWizardProps) {
  const {
    searchName,
    recordClassName,
    wizardState: {
      question,
      parameterGroupUIs,
      paramValues,
      paramUIState,
      recordClass,
      activeGroupIx,
      initialCount,
      updatingParamName,
    },
    parameterEventHandlers,
    dispatch,
  } = props;
  const paramMap = new Map(question.parameters.map((p) => [p.name, p]));
  const activeGroup = parameterGroupUIs[activeGroupIx];

  const filteredCountState = activeGroup.filteredCountState;
  const filteredCountStateOfPreviousGroup =
    activeGroupIx === 0
      ? initialCount
      : parameterGroupUIs[activeGroupIx - 1]!.filteredCountState;

  const parameters = activeGroup.parameters
    .map((paramName) => paramMap.get(paramName) as Parameter)
    .filter((param) => param.isVisible);

  const loadingEl = (
    <Loading radius={2} className={makeClassName('GroupLoading')} />
  );

  const showUpdatingOverlay =
    updatingParamName == null ||
    (paramMap.get(updatingParamName) as Parameter).group === activeGroup.name
      ? false
      : getDeepDependencies(updatingParamName, paramMap)
          .map((paramName: string) => paramMap.get(paramName) as Parameter)
          .some((param: Parameter) => param.group === activeGroup.name);

  return (
    <div className={makeClassName('ActiveGroupContainer')}>
      {showUpdatingOverlay && (
        <div className={makeClassName('ActiveGroupContainerOverlay')}>
          Updating
        </div>
      )}
      <div className={makeClassName('ActiveGroupHeading')}>
        <div
          className={makeClassName(
            'ActiveGroupCount',
            activeGroup.allValuesDefault ? 'hidden' : 'visible'
          )}
        >
          Your <em>{activeGroup.displayName}</em> filters reduce{' '}
          {filteredCountStateOfPreviousGroup === 'loading'
            ? loadingEl
            : result(filteredCountStateOfPreviousGroup, 'toLocaleString')}{' '}
          {recordClass.shortDisplayNamePlural} to{' '}
          {filteredCountState === 'loading'
            ? loadingEl
            : result(filteredCountState, 'toLocaleString')}
        </div>
        {activeGroup.description && (
          <div className={makeClassName('ActiveGroupDescription')}>
            {activeGroup.description}
          </div>
        )}
      </div>
      <Parameters
        searchName={searchName}
        recordClassName={recordClassName}
        parameters={parameters}
        paramValues={paramValues}
        paramUIState={paramUIState}
        eventHandlers={parameterEventHandlers}
        dispatch={dispatch}
      />
    </div>
  );
}

export default wrappable(ActiveGroup);

function getDeepDependencies(
  paramName: string,
  paramMap: Map<string, Parameter>
): string[] {
  return Seq.from((paramMap.get(paramName) as Parameter).dependentParams)
    .flatMap((depParamName) =>
      Seq.of(depParamName).concat(getDeepDependencies(depParamName, paramMap))
    )
    .toArray();
}
