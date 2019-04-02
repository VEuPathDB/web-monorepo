import { mapValues } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from "redux";
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import {
  updateActiveQuestion,
  updateParamValue,
  changeGroupVisibility
} from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import Error from 'wdk-client/Components/PageStatus/Error';
import NotFound from 'wdk-client/Views/NotFound/NotFound';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

type OwnProps = { question: string; recordClass: string; }
type StateProps = QuestionState;
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };
type Props = DispatchProps & StateProps & {
  questionName: string,
  recordClassName: string
};

function QuestionController(props: Props) {
  const { dispatch, eventHandlers, questionName, recordClassName, ...state } = props;
  
  useEffect(() => {
    props.dispatch(updateActiveQuestion({
      questionName,
      stepId: undefined
    }))
  }, [questionName]);

  // TODO Add document.title logic

  if (state.questionStatus === 'error') return <Error/>;
  if (state.questionStatus === 'not-found') return <NotFound/>;
  if (state.questionStatus !== 'complete') return null;

  const parameterElements = mapValues(
    state.question.parametersByName,
    parameter => (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: parameter.name,
          questionName,
          recordClassName
        }}
        pluginProps={{
          ctx: {
            questionName,
            parameter,
            paramValues: state.paramValues
          },
          parameter: parameter,
          value: state.paramValues[parameter.name],
          uiState: state.paramUIState[parameter.name],
          onParamValueChange: (paramValue: string) => {
            eventHandlers.updateParamValue({
              questionName,
              parameter,
              paramValues: state.paramValues,
              paramValue
            })
          },
          dispatch: dispatch
        }}
      />
    )
  );

  return (
    <Plugin
      context={{
        type: 'questionForm',
        name: questionName,
        questionName,
        recordClassName
      }}
      pluginProps={{
        parameterElements,
        state: state,
        eventHandlers: eventHandlers,
        dispatchAction: dispatch
      }}
    />
  );
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, props) => state.question.questions[props.question] || {} as QuestionState,
  (dispatch) => ({ dispatch, eventHandlers: bindActionCreators(ActionCreators, dispatch) }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    questionName: ownProps.question,
    recordClassName: ownProps.recordClass
  })
)

export default enhance(wrappable(QuestionController));
