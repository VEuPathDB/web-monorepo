import React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { Step } from 'wdk-client/Utils/WdkUser';
import { Question } from 'wdk-client/Utils/WdkModel';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

interface OwnProps {
  stepId: number;
  strategyId: number;
}

interface StateProps {
  step?: Step;
  question?: Question;
}

type Props = StateProps & OwnProps;

// TODO
// 1. For each filter, use Plugin to render (default filter will render null)
function StepFiltersController(props: Props) {
  const { step, question } = props;
  if (step == null || question == null) return null;
  return (
    <>
      {question.filters.map(filter =>
        <Plugin
          key={filter.name}
          context={{
            type: "questionFilter",
            name: filter.name,
            searchName: question.urlSegment,
            recordClassName: question.outputRecordClassName
          }}
          pluginProps={{
            strategyId: step.strategyId,
            stepId: step.id,
            filterName: filter.name
          }}
        />
      )}
    </>
  )
}

function mapPropsToState(state: RootState, props: OwnProps): StateProps {
  const strategyEntry = state.strategies.strategies[props.strategyId];
  if (strategyEntry === undefined || strategyEntry.status !== 'success') 
    return {question:undefined, step: undefined};
  const step = strategyEntry.strategy.steps[props.stepId];
  const question = step && state.globalData.questions && 
  state.globalData.questions.find(({ urlSegment }) => urlSegment === step.searchName)
  return { step, question };
}

export default connect(mapPropsToState)(wrappable(StepFiltersController));
