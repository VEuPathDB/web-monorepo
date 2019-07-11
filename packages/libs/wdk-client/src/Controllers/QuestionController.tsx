import { mapValues } from 'lodash';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import {
  updateActiveQuestion,
  updateParamValue,
  changeGroupVisibility,
  SubmissionMetadata
} from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import Error from 'wdk-client/Components/PageStatus/Error';
import NotFound from 'wdk-client/Views/NotFound/NotFound';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

type OwnProps = { question: string, recordClass: string, submissionMetadata: SubmissionMetadata };
type StateProps = QuestionState;
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };
type Props = DispatchProps & StateProps & {
  searchName: string,
  recordClassName: string,
  submissionMetadata: SubmissionMetadata
};

function QuestionController(props: Props) {
  const { dispatch, eventHandlers, searchName, recordClassName, submissionMetadata, ...state } = props;
  
  useEffect(() => {
    props.dispatch(updateActiveQuestion({
      searchName,
      stepId: undefined
    }))
  }, [searchName]);

  // TODO Add document.title logic
  
  if (state.questionStatus === 'error') return <Error/>;
  if (state.questionStatus === 'not-found') return <NotFound/>;
  if (state.questionStatus === 'loading') return <Loading/>;
  if (state.questionStatus !== 'complete') return null;

  const parameterElements = mapValues(
    state.question.parametersByName,
    parameter => (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: parameter.name,
          searchName,
          recordClassName
        }}
        pluginProps={{
          ctx: {
            searchName,
            parameter,
            paramValues: state.paramValues
          },
          parameter: parameter,
          value: state.paramValues[parameter.name],
          uiState: state.paramUIState[parameter.name],
          onParamValueChange: (paramValue: string) => {
            eventHandlers.updateParamValue({
              searchName,
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
        name: searchName,
        searchName,
        recordClassName
      }}
      pluginProps={{
        parameterElements,
        state: state,
        eventHandlers: eventHandlers,
        dispatchAction: dispatch,
        submissionMetadata: submissionMetadata
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
    searchName: ownProps.question,
    recordClassName: ownProps.recordClass,
    submissionMetadata: ownProps.submissionMetadata
  })
)

export default enhance(wrappable(QuestionController));
