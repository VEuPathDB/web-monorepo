import React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../Core/State/Types';
import { Step } from '../Utils/WdkUser';
import { Question } from '../Utils/WdkModel';
import { Plugin } from '../Utils/ClientPlugin';
import { wrappable } from '../Utils/ComponentUtils';

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
      {question.filters.map((filter) => (
        <Plugin
          key={filter.name}
          context={{
            type: 'questionFilter',
            name: filter.name,
            searchName: question.urlSegment,
            recordClassName: question.outputRecordClassName,
          }}
          pluginProps={{
            step: step,
            filterName: filter.name,
          }}
        />
      ))}
    </div>
  );
}

function mapPropsToState(state: RootState, props: OwnProps): StateProps {
  const question =
    state.globalData.questions &&
    state.globalData.questions.find(
      ({ urlSegment }) => urlSegment === props.step.searchName
    );
  return { question };
}

export default connect(mapPropsToState)(wrappable(StepFiltersController));
