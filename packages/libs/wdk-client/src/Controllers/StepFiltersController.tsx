import React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { Step } from 'wdk-client/Utils/WdkUser';
import { Question } from 'wdk-client/Utils/WdkModel';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';

interface OwnProps {
  stepId: number;
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
            stepId: step.id,
            filterName: filter.name
          }}
        />
      )}
    </>
  )
}

function mapPropsToState(state: RootState, props: OwnProps): StateProps {
  const stepEntry = state.steps.steps[props.stepId];
  const step = stepEntry && stepEntry.status === 'success' ? stepEntry.step : undefined;
  const question = step && state.globalData.questions && state.globalData.questions.find(({ urlSegment }) => urlSegment === step.searchName)
  return { step, question };
}

export default connect(mapPropsToState)(StepFiltersController);
