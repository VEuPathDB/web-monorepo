import { result } from 'lodash';
import React from 'react';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import Parameters from './Parameters';
import { makeQuestionWizardClassName as makeClassName } from '../util/classNames';
import { groupParamsValuesAreDefault } from '../util/QuestionWizardState';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import QuestionWizardPropTypes from './QuestionWizardPropTypes';

/**
 * Active group section. Includes heading, help text, summary counts, and parameters.
 */
function ActiveGroup(props) {
  if (props.wizardState.activeGroup == null) return null;

  const {
    wizardState: {
      question,
      paramValues,
      paramUIState,
      groupUIState,
      recordClass,
      activeGroup,
      initialCount,
      updatingParamName
    },
    parameterEventHandlers
  } = props;

  const paramMap = new Map(question.parameters.map(p => [p.name, p]));
  const { accumulatedTotal, loading } = groupUIState[activeGroup.name];
  const { accumulatedTotal: prevAccumulatedTotal, loading: prevLoading } = Seq.of({ accumulatedTotal: initialCount })
    .concat(Seq.from(question.groups)
      .takeWhile(group => group !== activeGroup)
      .map(group => groupUIState[group.name]))
    .last();
  const parameters = activeGroup.parameters
    .map(paramName => paramMap.get(paramName))
    .filter(param => param.isVisible);

  const loadingEl = <Loading radius={2} className={makeClassName('GroupLoading')}/>;

  const showUpdatingOverlay = (
    updatingParamName == null ||
    paramMap.get(updatingParamName).group === activeGroup.name
  )
    ? false
    : getDeepDependencies(updatingParamName, paramMap)
      .map(paramName => paramMap.get(paramName))
      .some(param => param.group === activeGroup.name)

  return (
    <div className={makeClassName('ActiveGroupContainer')}>
      {showUpdatingOverlay &&
        <div className={makeClassName('ActiveGroupContainerOverlay')}>
          Updating
        </div>
      }
      <div className={makeClassName('ActiveGroupHeading')}>
        <div className={makeClassName('ActiveGroupCount', groupParamsValuesAreDefault(props.wizardState, activeGroup) ? 'hidden' : 'visible')}>
          Your <em>{activeGroup.displayName}</em> filters reduce {
            (prevLoading ? loadingEl : result(prevAccumulatedTotal, 'toLocaleString'))
          } {recordClass.shortDisplayNamePlural} to {
            (loading ? loadingEl : result(accumulatedTotal, 'toLocaleString'))
          }
        </div>
        {activeGroup.description && (
          <div className={makeClassName('ActiveGroupDescription')}>{activeGroup.description}</div>
        )}
      </div>
      <Parameters
        group={activeGroup}
        parameters={parameters}
        paramValues={paramValues}
        paramUIState={paramUIState}
        eventHandlers={parameterEventHandlers}
      />
    </div>
  );
}

ActiveGroup.propTypes = QuestionWizardPropTypes;

export default wrappable(ActiveGroup);

function getDeepDependencies(paramName, paramMap) {
  return Seq.from(paramMap.get(paramName).dependentParams)
    .flatMap(depParamName =>
      Seq.of(depParamName).concat(getDeepDependencies(depParamName, paramMap)));
}
