import React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { Step } from 'wdk-client/Utils/WdkUser';
import { Question } from 'wdk-client/Utils/WdkModel';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';

interface OwnProps {
  step: Step;
}

interface StateProps {
  question?: Question;
}

type Props = StateProps & OwnProps;

// TODO
// 1. For each filter, use Plugin to render (default filter will render null)
function StepFiltersController(props: Props) {
  const { step, question } = props;
  if (step == null || question == null) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
            step: step,
            filterName: filter.name
          }}
        />
      )}
    </div>
  )
}

function mapPropsToState(state: RootState, props: OwnProps): StateProps {
  const question = state.globalData.questions && 
  state.globalData.questions.find(({ urlSegment }) => urlSegment === props.step.searchName)
  return { question };
}

export default connect(mapPropsToState)(wrappable(StepFiltersController));
